# Card Game Prototype
Local React/TypeScript/Vite game. No backend or deployment. Push only when explicitly requested. Read GAME_DESIGN.md and UI_STYLE.md. Keep combat pure in engine.ts, content in data.ts, talents/boons in abilities.ts and audio modular.

Preserve v1 saves, zero-Energy discard, click/drag card and Rune targeting, gear replacement, rewards, camp upgrades and full runs for both heroes. Current UI work does not rebalance mechanics. Simple display names must not change stable IDs.

Keep A/B/D for rollback; C uses original reusable SVGs in CartoonArt.tsx. Use one Nunito family. Final battle CSS is battle.css. One fixed viewport, equal actor sizes, smaller hand, side status rails and controls, no permanent instruction bar. Portrait phones ask to rotate; landscape hand may scroll horizontally.

GuidedTutorial must gate unrelated pointer/keyboard actions and highlight one target. Practice restores the real run and saves completion separately. Verify completion, replay and persistence. Audio retains separate menu/battle/reward/boss scenes, gesture unlock, volumes, mute and hidden-tab behavior.

Lead integrates. Use Luna only for small CSS/responsive/tutorial QA subtasks when delegated. Run build, engine/audio tests and browser regressions. Visually check laptop, tablet, four phone landscapes, three enemies, long Rune text, centered modals and theme rollback.

C world contracts: BattleWorld.tsx owns original layered environments/platforms; BattleEffects.tsx owns transient overlays; world.css scopes scenery and motion to C; design-system.css owns shared C tokens/controls and battle.css owns final C layout, followed by cards.css for card construction and screens.css for scene/modal sizing. Keep A/B/D reversible. Preserve equal actor dimensions even with tilt, readable two-line intents and safe hand gutters. Verify all four stages, hover/selection, card flight, lunge, drop bounce, hit/status/defeat effects and reduced motion. Animation must never delay or rebalance engine actions.

All C major screens occupy one viewport. Camp and deck use PagedCollection pages; never clip full rules or hide important controls to avoid scrolling. UnitPresentation owns peaked unit frames and badges, cards.css owns wooden item cards and screens.css fits every scene/modal. Preserve target-page Rune replacement and returned-Rune visibility.
