# 🕹️ HouseParty Arcade (v1.0 MVP)

> **Pocket Arcade Controller — Heads Up, Not Heads Down.**  
> A mobile-first, tactile web application that turns every guest's smartphone into a physical-feeling arcade controller and game-show buzzer for real-world house parties.

---

## 🌟 Key Highlights

- **Zero-Friction Onboarding:** Zero app store downloads, zero account signups, zero database costs.
- **Tactile Real-World Arcade UI:**
  - Chunky 3D push-buttons with hard bottom lips and spring physics.
  - Armored hazard-tape secret role shutters (`HOLD TO PEEK` with mechanical slam on release).
  - Notched analog radio spectrum dial with auditory tick marks and haptic feedback.
  - Top recessed LED dot-matrix marquee (`RM: K9X2`, ticket counter, AFK toggle, Host Operator bar).
  - Strictly locked mobile cabinet viewport (`100dvh`, `max-w-[430px] mx-auto` on desktop).
- **100% Free-Tier Architecture (Cloudflare Pages + Supabase Realtime):**
  - Compiled to 100% static client assets with `public/_redirects` (`/* /index.html 200`).
  - Multiplayer powered by Supabase Realtime `Broadcast` and `Presence` (0 Postgres tables, 0 database storage).
  - **Zero-Config Local Fallback:** Automatically falls back to browser `BroadcastChannel` if Supabase environment variables are omitted!
- **Native Web Audio API & Haptics:**
  - Synthesized 8-bit coin chimes, mechanical relay clicks, rotary ticks, 3-2-1 horns, and game-show buzzers (0 external MP3 files).
  - Synchronized `navigator.vibrate()` haptic pulses.
- **Built-in "Simulate 4 Players" Developer Bar:**
  - Wrench icon in the marquee spawns 3 virtual bot players (`ROHIT`, `ADITYA`, `SURAJ`).
  - 4 quick-switch tabs (`[YOU (HOST)]`, `[ROHIT]`, `[ADITYA]`, `[SURAJ]`) + `AUTO-BOTS` button allow testing entire multi-device party loops in a single browser tab!

---

## 🎮 The 4 Starter Cartridges

### 1. `CHAMELEON_OS` (Hidden Role & 4x4 Word Grid Decoder)
- **Players:** 3–12 (2+ in Dev Mode)
- **DEAL:** Category with a 4x4 word grid (16 words). Innocents see the illuminated target word; the Chameleon sees scrambled static.
- **ACTION:** Clue Relay. Each player says 1 word out loud and taps `END TURN (CLACK)`.
- **VOTING & REVEAL:** Vote out the Chameleon (+200 Tickets to Chameleon if they escape). If caught, the Chameleon gets a **15-Second Sudden Death Guess** to steal the win (+150 Tickets)!

### 2. `WAVELENGTH DIAL` (Analog Mind-Reading Tuner)
- **Players:** 2–15
- **DEAL/ACTION:** Radio Operator sees the secret target frequency (10–90) on a binary spectrum (e.g. *TRASHY ← → CLASSY*), announces a clue, and hits `BROADCAST CLUE`.
- **VOTING (TUNING):** Players drag their notched `<TactileDial />` and lock their frequency.
- **REVEAL:** Player pins drop with spring physics! Bullseye (±4) awards **+400 Tickets**; ±10 awards **+300 Tickets**; Operator earns bonus if room average is within ±12.

### 3. `FAKIN' IT!` (Synchronized Physical Reflex Buzzer)
- **Players:** 3–10
- **DEAL:** Real prompt given to Innocents (e.g., *Hold up fingers for hours of sleep* or *Point at the person most likely to get arrested abroad*). The Faker only sees the action category (*FINGERS*, *POINT*, or *FACE*).
- **ACTION:** Synchronized full-screen neon **`3... 2... 1... DO IT NOW!`** countdown with audio horns and heavy haptics!
- **DISCUSSION & VOTING:** 45-second interrogation timer reveals the prompt to everyone. Catching the Faker awards **+100 Tickets**; escaping awards the Faker **+250 Tickets**.

### 4. `HOT SEAT / CAP DETECTOR` (Polygraph Debate)
- **Players:** 2–12
- **DEAL:** Speaker is dealt a polarizing hot take card (or an injected custom inside joke) and secretly assigned **`SPEAK YOUR TRUTH`** or **`DEVIL'S ADVOCATE`**.
- **ACTION:** 45-second live rant. An animated polygraph oscilloscope waveform pulses while listeners tap live reaction badges (`🚨 SUS`, `🔥 SPICY`, `🧢 CAP`) that float across all screens.
- **VOTING & REVEAL:** Listeners slam giant 3D dome buttons: **`100% REAL (TRUTH)`** vs. **`TOTAL CAP (BLUFF)`**.

### 🧾 Thermal Arcade Ticket Receipt
- When the Host taps **`CASH OUT / END PARTY`**, an animated jagged-edge thermal receipt prints down displaying:
  - **GRAND CHAMPION** (Most Tickets Won)
  - **MASTER DECEIVER** (Most bluffs won)
  - **EASY TARGET** (Fooled the most times)
  - Complete Party Leaderboard and Inside Jokes summary.

---

## 🚀 Getting Started

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). Multi-tab testing works automatically out of the box using `BroadcastChannel`.

### Production Deployment (Cloudflare Pages)
1. Push to your Git repository.
2. Link to Cloudflare Pages:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
3. Optional: Set Environment Variables in Cloudflare Pages dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
