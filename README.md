# Vaderland - Dutch Parliament Political Simulator (Prototype)

Browser-playable political strategy prototype inspired by dialogue-heavy decision games.

## Tech stack
- React + TypeScript + Vite
- Local state + `localStorage` persistence (no backend required)
- CSS-only dashboard visuals for low setup friction

## Included in this scaffold
1. Politician selection screen (4 real Dutch politicians)
2. Real Dutch party dataset (PVV, VVD, D66, GroenLinks-PvdA, NSC, BBB, CDA, SP, ChristenUnie, DENK, Volt)
3. Live metrics dashboard with economy, society, politics, environment indicators
4. Sample decision event: stikstof/nitrogen crisis with 3 choices
5. Persistent game state across reloads
6. Coalition formation phase with party-by-party negotiations and offer scoring
7. Campaign phase with actions that influence momentum, polling and media sentiment
8. Election simulation producing fresh 150-seat distribution and automatic return to coalition talks
9. Media outlet sentiment tracking (NOS, RTL, Telegraaf, De Volkskrant)
10. Scandal system with risk, active scandals, and press conference mitigation
11. Polling and approval trend history mini-graphs
12. Coalition collapse trigger under instability pressure

## Run
1. Use Node.js 20.19+ (project includes `.nvmrc`)
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open the local URL shown by Vite

## Project structure
- `src/data/` static game data (politicians, parties, events)
- `src/state/` state transitions, save/load logic
- `src/components/` UI building blocks
- `src/types/` shared domain model types

## Extension guide
- Add more events in `src/data/events.ts` with conditional triggers and weighted randomness
- Implement coalition negotiation phase using party ideology distance + ministry offers
- Add election simulator every 48 in-game months (or early election if coalition stability collapses)
- Expand media system into outlet-specific sentiment trackers (NOS, RTL, Telegraaf, Volkskrant)
- Replace simple bars with chart library once historical time-series storage is added

## New phase-two files
- `src/systems/coalition.ts` AI-style coalition acceptance scoring logic
- `src/systems/election.ts` campaign actions + election seat allocation model
- `src/components/CoalitionBuilder.tsx` interactive coalition negotiation interface
- `src/components/CampaignPanel.tsx` campaign action mini-loop

## New phase-three files
- `src/systems/media.ts` outlet sentiment updates, scandal rolls, press conference effects
- `src/components/MediaPanel.tsx` media monitor and scandal management UI
