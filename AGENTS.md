# Card Game Prototype
Local React/TypeScript/Vite game. No backend or deployment. Push only when explicitly requested. Read GAME_DESIGN.md and UI_STYLE.md. Keep combat pure in engine.ts, content in data.ts, talents/boons in abilities.ts and audio modular.

Preserve v1 saves, zero-Energy discard, click/drag card and Rune targeting, gear replacement, rewards, camp upgrades and full runs for both heroes. Current UI work does not rebalance mechanics. Simple display names must not change stable IDs.

Keep A/B/D for rollback; C uses original reusable SVGs in CartoonArt.tsx. Use one Nunito family. Final battle CSS is battle.css. One fixed viewport, equal actor sizes, smaller hand, side status rails and controls, no permanent instruction bar. Portrait phones ask to rotate; landscape hand may scroll horizontally.

GuidedTutorial must gate unrelated pointer/keyboard actions and highlight one target. Practice restores the real run and saves completion separately. Verify completion, replay and persistence. Audio retains separate menu/battle/reward/boss scenes, gesture unlock, volumes, mute and hidden-tab behavior.

Lead integrates. Use Luna only for small CSS/responsive/tutorial QA subtasks when delegated. Run build, engine/audio tests and browser regressions. Visually check laptop, tablet, four phone landscapes, three enemies, long Rune text, centered modals and theme rollback.
