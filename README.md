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

## Verify

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:browser
```

Browser tests use installed Google Chrome and start Vite automatically if needed. Node.js 22+ is recommended. The unit tests exercise combat rules and complete runs; browser tests play both characters through victory using mouse controls, plus defeat, saves, gear replacement, and rune management.

Content lives in `src/data.ts`; pure game rules in `src/engine.ts`; shared models in `src/types.ts`; presentation and design tokens in UI/CSS. See GAME_DESIGN.md and UI_STYLE.md for decisions. No remote repository or deployment is configured.
