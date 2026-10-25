# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Friends, party hosts, and game night groups (2–15 players) gathered physically in a room (or on hybrid calls) looking for fast, frictionless social party games without buying board games or hardware consoles.

## Product Purpose
A mobile-first PWA acting as a "pocket arcade controller" for party games. Core philosophy: "Heads up, not heads down." The phone handles secret roles, synchronized timers, voting buzzers, and spectrum dials, while 90% of the game happens verbally and physically in the room.

## Positioning
Jackbox-style excitement meets physical party board games (Chameleon, Wavelength, Fakin' It) — zero friction (no accounts, no downloads, instant 4-letter room codes), zero ads, and 100% free-tier ephemeral mesh networking with WebSockets.

## Operating Context
Party environments, living rooms, game nights, bars, and group calls. Users interact primarily on mobile phones in portrait mode (`100dvh`), glancing at their screens to check secret roles, cast votes, or turn dials, then immediately looking up to banter, debate, and bluff.

## Capabilities and Constraints
- 4 starter games:
  - 🦎 **Chameleon** (3–12 players): Social deduction & spy hunt.
  - 📻 **Wavelength** (2–15 players): Mind-reading & rotary spectrum tuning.
  - 🕵️ **Fakin' It** (3–10 players): Physical simultaneous actions & finger pointing.
  - 🔥 **Hot Seat** (2–12 players): Spicy rants, truth vs. devil's advocate.
- 2-player game modes supported on Wavelength and Hot Seat.
- Strict mobile cabinet viewport (`100dvh`, `max-w-[430px]` centered on desktop, zero page scrolling during active gameplay).
- Zero-cost architecture: Ephemeral Realtime Broadcast/Presence (Supabase Realtime) with local fallback (`BroadcastChannel`). Zero database tables required.

## Brand Commitments
- Name: **HouseParty**
- Aesthetic: Clean, tactile dark mode (`#0D0D18`) with vibrant game-specific gradients, bold legible typography, high-contrast readable elements, and rich audio/haptic feedback.

## Product Principles
1. **Heads Up, Not Heads Down:** Screens facilitate human conversation and bluffing; they never replace it.
2. **Zero-Friction Onboarding:** Enter a 4-letter code, pick a name and emoji, and join in under 5 seconds.
3. **Tactile & Physical:** Dials, shutters, and buzzers feel mechanical, immediate, and responsive.
4. **Ephemeral & Private:** No stored personal data, no passwords, no database tracking.
