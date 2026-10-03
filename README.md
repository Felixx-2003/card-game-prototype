# Card Game Prototype

Original local single-player roguelike card battler. React + TypeScript + Vite, no backend.

## Run

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite. On Windows, `npm.cmd` avoids PowerShell script-signing restrictions. On other systems use `npm`.

Choose Warrior or Mage. Drag cards to glowing targets, or click a card then its target. Drag Equipment onto your hero and Runes onto compatible hand cards. Select an unwanted card and click Discard to make room next turn. End Turn executes visible enemy intentions. Clear two normal encounters, an elite, then the boss. Choose one of three rewards and manage upgrades/runes between encounters. At camp, click a Rune then a compatible card to attach/replace it; removal returns the Rune to your deck.

Progress saves in this browser's localStorage. Main Menu offers continue/new run. The development panel uses the backtick key and is excluded from production builds.

First adventures open a seven-step interactive practice tutorial. Unrelated controls are locked while one target is highlighted. Completion saves locally; the side **Tutorial** button replays practice and restores your real run. **How to play** opens the optional visual field guide.

**Art theme** offers A (handmade), B (cel vectors), C (Cartoon Quest world with original vectors), and D (previous illustrated art). All screens use self-hosted Nunito. Theme C places Energy and End Turn beside the bottom hand, with supporting controls in side rails and actors in the center, without vertical scrolling or a permanent instruction bar. Phones play in landscape; portrait shows a rotate prompt. The hand scrolls horizontally on small displays. Hover/focus side status icons for details.

**Settings** offers mute and separate music/effects sliders. Original scene music starts after a click and pauses in hidden tabs. Battle has a new playful, brisk melody. Art, fonts, saves and audio work locally.

## Verify

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:browser
```

Browser tests use installed Google Chrome and start Vite automatically if needed. Node.js 22+ is recommended. Tests cover combat/full runs, audio lifecycle, all four visual themes, fixed-screen sizing, onboarding, keyboard focus, Energy/discard, effect tooltips, mute/volume, and real browser music output.

Content lives in `src/data.ts`; pure game rules in `src/engine.ts`; shared models in `src/types.ts`; presentation and theme tokens in UI/CSS; synthesis in `src/audio.ts`. See GAME_DESIGN.md and UI_STYLE.md for decisions. GitHub origin is configured; the game remains a local prototype with no deployment.

Theme C is the default for fresh preferences and now places combat in four layered original environments: forest, deep grove, ruins and a boss arena. Physical frames, platforms, a fanned hand and compact edge controls replace the flat table presentation. Hover/select lifts, card flights, attack lunges, impact flashes, status pops and defeat effects are fast; reduced-motion settings are respected. Gameplay and A/B/D rollback themes are preserved.

The Quest redesign shares ink-and-parchment tokens across menus, buttons, modals and physical card frames. Characters have individually drawn silhouettes and expressions; equipment and Runes have distinct original artwork. Energy/current maximum and End Turn sit with the hand decision zone. Existing rules and saves remain compatible.

The Frostwood presentation uses peaked unit cards with heart HP, attack pennants, name ribbons and round hexagons; item cards use wood bindings, school art windows, blue cost gems and highlighted rules. Menus, rewards, camps, tutorials, settings and endings share those materials. All C screens fit one viewport; deck and camp collections have Previous/Next pages, keeping every card accessible without vertical scrolling. Browser regressions check every major screen at seven viewport sizes and every deck page.
