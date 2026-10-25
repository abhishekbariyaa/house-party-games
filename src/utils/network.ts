import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Player, PlayerIntentPayload, RoomState } from '../types/game';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const hasSupabaseConfig = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'undefined' && 
  supabaseAnonKey !== 'undefined' &&
  !supabaseUrl.includes('your-project-id')
);

// Shared Supabase client instance
export const supabaseClient: SupabaseClient | null = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    })
  : null;

class ArcadeNetworkManager {
  private channel: RealtimeChannel | null = null;
  private localChannel: BroadcastChannel | null = null;
  private onStateSyncCallback: ((state: RoomState) => void) | null = null;
  private onIntentCallback: ((intent: PlayerIntentPayload) => void) | null = null;
  private onPresenceCallback: ((players: Partial<Player>[]) => void) | null = null;

  public isLocalOnly: boolean = !hasSupabaseConfig;

  public async joinRoom(
    roomCode: string,
    player: Player,
    onStateSync: (state: RoomState) => void,
    onIntent: (intent: PlayerIntentPayload) => void,
    onPresenceChange?: (players: Partial<Player>[]) => void
  ) {
    this.leaveRoom();

    const normalizedCode = roomCode.toUpperCase().trim();
    this.onStateSyncCallback = onStateSync;
    this.onIntentCallback = onIntent;
    if (onPresenceChange) this.onPresenceCallback = onPresenceChange;

    if (hasSupabaseConfig && supabaseClient) {
      // 1. Initial hydration from Postgres Database (rooms table)
      this.fetchRoomFromDatabase(normalizedCode).then((dbState) => {
        if (dbState && this.onStateSyncCallback) {
          this.onStateSyncCallback(dbState);
        }
      });

      // 2. Realtime WebSocket channel setup
      this.initSupabaseChannel(normalizedCode, player);
    } else {
      this.initLocalBroadcastChannel(normalizedCode, player);
    }
  }

  // Fetch room state directly from Supabase Postgres database
  public async fetchRoomFromDatabase(roomCode: string): Promise<RoomState | null> {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from('rooms')
        .select('state')
        .eq('room_code', roomCode.toUpperCase())
        .maybeSingle();

      if (error) {
        // Table might not exist yet if only Realtime broadcast is being used
        return null;
      }
      return data?.state ? (data.state as RoomState) : null;
    } catch {
      return null;
    }
  }

  // Persist room state to Supabase Postgres database
  public async persistRoomToDatabase(state: RoomState): Promise<void> {
    if (!supabaseClient || !state.roomCode) return;
    try {
      await supabaseClient
        .from('rooms')
        .upsert({
          room_code: state.roomCode.toUpperCase(),
          state,
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Postgres persistRoom error:', err);
    }
  }

  // Supabase Realtime implementation (Postgres changes + Broadcast + Presence)
  private initSupabaseChannel(roomCode: string, player: Player) {
    if (!supabaseClient) return;

    try {
      const channelName = `arcade-room:${roomCode}`;

      this.channel = supabaseClient.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: player.id },
        },
      });

      this.channel
        // Instant WebSocket broadcast sync
        .on('broadcast', { event: 'STATE_SYNC' }, (event) => {
          if (event.payload && this.onStateSyncCallback) {
            this.onStateSyncCallback(event.payload as RoomState);
          }
        })
        // Guest player intent broadcast
        .on('broadcast', { event: 'PLAYER_INTENT' }, (event) => {
          if (event.payload && this.onIntentCallback) {
            this.onIntentCallback(event.payload as PlayerIntentPayload);
          }
        })
        // Postgres change sync (if table is published to realtime)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rooms',
            filter: `room_code=eq.${roomCode}`,
          },
          (payload) => {
            const newState = (payload.new as { state?: RoomState })?.state;
            if (newState && this.onStateSyncCallback) {
              this.onStateSyncCallback(newState);
            }
          }
        )
        // Presence tracking for player roster
        .on('presence', { event: 'sync' }, () => {
          if (!this.channel || !this.onPresenceCallback) return;
          const presenceState = this.channel.presenceState();
          const activePlayers: Partial<Player>[] = [];
          for (const key in presenceState) {
            const presences = presenceState[key] as unknown as Partial<Player>[];
            if (presences && presences.length > 0) {
              activePlayers.push(presences[0]);
            }
          }
          this.onPresenceCallback(activePlayers);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && this.channel) {
            this.channel.track({
              id: player.id,
              name: player.name,
              avatar: player.avatar,
              color: player.color,
              isHost: player.isHost,
              isAFK: player.isAFK,
            });
          }
        });
    } catch (err) {
      console.warn('Supabase initialization failed, falling back to local BroadcastChannel:', err);
      this.isLocalOnly = true;
      this.initLocalBroadcastChannel(roomCode, player);
    }
  }

  // Local BroadcastChannel fallback for zero-config multi-tab testing
  private initLocalBroadcastChannel(roomCode: string, player: Player) {
    this.isLocalOnly = true;
    const channelName = `houseparty-arcade-${roomCode}`;
    this.localChannel = new BroadcastChannel(channelName);

    this.localChannel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'STATE_SYNC' && payload && this.onStateSyncCallback) {
        this.onStateSyncCallback(payload as RoomState);
      } else if (type === 'PLAYER_INTENT' && payload && this.onIntentCallback) {
        this.onIntentCallback(payload as PlayerIntentPayload);
      }
    };

    // Send initial presence ping
    this.localChannel.postMessage({
      type: 'PRESENCE_PING',
      payload: player,
    });
  }

  // Host broadcasts updated RoomState & persists to Postgres
  public broadcastState(state: RoomState) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'STATE_SYNC',
        payload: state,
      });
      // Asynchronously persist to Postgres table
      this.persistRoomToDatabase(state);
    }
    if (this.localChannel) {
      this.localChannel.postMessage({
        type: 'STATE_SYNC',
        payload: state,
      });
    }
  }

  // Guest emits Intent to Host
  public sendIntent(intent: PlayerIntentPayload) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'PLAYER_INTENT',
        payload: intent,
      });
    }
    if (this.localChannel) {
      this.localChannel.postMessage({
        type: 'PLAYER_INTENT',
        payload: intent,
      });
    }
  }

  public leaveRoom() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    if (this.localChannel) {
      this.localChannel.close();
      this.localChannel = null;
    }
  }
}

export const networkManager = new ArcadeNetworkManager();
