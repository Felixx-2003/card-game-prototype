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

Use **How to play** for a short visual field guide; skip it or dismiss the first-battle tips at any time. **Art theme** switches between A (original handmade), B (painted fantasy), and C (soft fantasy) without changing your run. **Settings** includes mute and separate Music/Sound effects sliders. Original generated music starts after your first click and pauses in hidden tabs. Art and audio work locally; typography uses system sans plus bundled OFL display fonts. Battles keep Energy, actors, equipment, effects and your hand in one non-scrolling screen. Hover/focus side effect icons for their rules.

## Verify

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:browser
```

Browser tests use installed Google Chrome and start Vite automatically if needed. Node.js 22+ is recommended. Tests cover combat/full runs, audio lifecycle, all three visual themes, fixed-screen sizing, onboarding, keyboard focus, Energy/discard, effect tooltips, mute/volume, and real browser music output.

Content lives in `src/data.ts`; pure game rules in `src/engine.ts`; shared models in `src/types.ts`; presentation and theme tokens in UI/CSS; synthesis in `src/audio.ts`. See GAME_DESIGN.md and UI_STYLE.md for decisions. GitHub origin is configured; the game remains a local prototype with no deployment.

Latest: switch to C · Soft fantasy for rounded frames and clean system sans. Each hero has an active (1 Energy, three-turn cooldown) and a visible automatic passive. Choose one permanent Forest boon at each camp; hover icons for rules. Upgrading greys other choices and highlights the path button; Masterwork offers an explicit extra-upgrade button. Menu/combat/elite-boss/camp/endings have distinct original procedural music. Old saves and A/B themes remain supported.
