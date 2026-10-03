# Visual direction

C is the default Cartoon Quest presentation for fresh preferences. Its original ink-and-cel cast uses individual character silhouettes, expressive eyes, clothing and props, bold outlines and limited solid shadows. Equipment, Skills, Spells and Runes share that illustration language. A/B/D remain rollback comparisons and existing saved theme choices persist.

Use self-hosted Nunito throughout. design-system.css defines the shared ink, parchment, gold, jade and rarity materials, spacing, strokes, corners, shadows and control states across menus and dialogs. battle-legacy.css preserves prior shared and rollback layouts; world.css owns C scenery and motion. battle.css imports last and owns final C board/card presentation.

Battle uses equal hero/enemy card dimensions, integrated art windows, parchment captions and a separate HP strip. Rarity uses colored bindings, corner motifs and emblems within the same smaller hand-card family. The bottom decision zone places Energy directly left of the centered fanned hand and End Turn directly right. Talents, buffs, deck, tutorial, equipment, settings and pause support the fight from the upper side rails. No permanent instruction bar.

Keep one fixed battle viewport. Landscape phones prioritize readable names, costs, types and effects over hand artwork; the hand may scroll horizontally. Portrait phones ask to rotate. Respect safe areas, matched actor tilt footprints and animation gutters. Visually check laptop, tablet and 844×390, 932×430, 667×375 and 640×360 phones, including three enemies, long Rune text, selected cards and late-run boons. Modals remain centered and scroll internally.

BattleWorld.tsx owns layered forest, grove, ruins and arena environments with platforms, foliage and mushrooms. Fine-pointer parallax and short scene entrances support the cards. BattleEffects.tsx owns flying card/spell/defeat overlays; UI Web Animations handle attack, damage and drop feedback. Reduced motion suppresses these effects. No animation delays or rebalances engine actions.

GuidedTutorial gates unrelated input, highlights one required action, saves completion separately and restores the real run after practice/replay. Energy remains selectable through .energy-meter after its move. Preserve all v1 saves, card/Rune click and drag targets, free discard, equipment replacement, camp upgrades and both complete hero runs.

Original local Web Audio retains menu/battle/reward/danger/endings, gesture start, hidden-tab suspension, independent music/SFX sliders and mute. Fonts, art, audio and saves remain local.
