# Card Game Prototype

Local React/TypeScript/Vite game. No backend, pets, shops, accounts, or deployment. GitHub pushes only when explicitly requested.
Read GAME_DESIGN.md and UI_STYLE.md before changes. Keep combat in pure systems and content in data files.
Use at most 2–3 independent agents; assign distinct files. Lead integrates and runs build, combat tests, and browser QA.
Preserve the user's rules. Document small reversible decisions. Keep documentation short.

Polish rules: battles fit one fixed viewport; hero/enemy cards share dimensions and hand cards are smaller. Keep Theme A and B reversible through centralized tokens and original SVG variants. Use reusable StatusIcons/EnergyBar/Tutorial; status rails stay beside cards. Audio is synthesized locally in audio.ts, starts only on gestures, and has independent music/SFX volumes. Fonts are self-hosted with OFL notices. Preserve zero-Energy discard and click/drag Rune targeting. Verify both themes at 1280×720/800 and full runs for both heroes before delivery.

Character talents and global boon modifiers live in abilities.ts with pure engine actions. Keep v1 saves compatible through optional fields. Upgrade choices must lock immediately, while camp Rune management stays usable. Verify new talents, all three themes, scene music, centered numbers and fixed controls.
