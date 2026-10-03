# Visual direction

C is the default original Cartoon Quest presentation. Chunky cel characters and props sit inside physical frames against cool blue fantasy scenery; warm wood, cream parchment, berry, jade and gold connect the whole interface. Keep A/B/D as rollback comparisons and preserve saved theme choices. All fonts are self-hosted Nunito.

The stylesheet order ends with design-system.css (tokens and controls), battle.css (fixed stage), cards.css (unit and item construction), and screens.css (all scene and modal sizing). world.css owns C scenery and motion. battle-legacy.css preserves shared and rollback layouts. Shared controls use ink borders, uneven rounded corners, inset light, a solid lower shadow and consistent hover/press states.

UnitPresentation.tsx constructs the original peaked double frame, cream swallow-tail name ribbon, dark effect panel, overlapping red heart HP, blue-grey attack pennant and gold hexagonal round counter. Hero attack shows the base stat; enemy attack shows next intent damage before modifiers. Counters show the existing battle round. Preserve equal hero/enemy dimensions, side status rails, phase labels and independent art. CartoonArt.tsx supplies the original cast and equipment/rune illustrations.

Hand, reward and collection cards share rounded wooden bindings, school-colored art windows, tilted cream names, dark brown white/gold rules, upper-right blue Energy gems and type labels. RulesText highlights values and key terms without changing effects. Rarity ornaments stay clear of rules. Unaffordable hand cards remain readable and explain insufficient Energy; they remain selectable for discard. The overlapping fan sits on a wooden tray, lifts on hover/selection and keeps drag previews unclipped. Landscape phones prioritize names, costs and full rules over hand artwork.

Energy/current maximum, charged/spent gems and End Turn flank the hand. Talents, buffs, deck, tutorial, equipment, settings and pause use side rails. No permanent instruction bar. Keep every C major screen in one viewport: menu/pause, selection, battle, rewards, journey/boons, camp, deck, settings, field guide and endings. PagedCollection.tsx keeps all camp/deck cards accessible without vertical scrolling; a returned Rune appears on its page, while replacement keeps the target page. The hand may scroll horizontally. Portrait phones ask to rotate.

Visually verify desktop, laptop, tablet and 844×390, 932×430, 667×375 and 640×360 landscapes, including three enemies, long Rune rules, selected cards, late-run boons and every collection page. All modals stay centered; controls and full descriptions must fit rather than being hidden by overflow. Respect safe areas and animation gutters.

BattleWorld.tsx owns layered forest, grove, ruins and arena scenery/platforms. BattleEffects.tsx owns transient card/spell/defeat overlays; Web Animations handle lunge, impact and drop feedback. Reduced motion suppresses effects. Animation must never delay or rebalance engine actions.

GuidedTutorial gates unrelated actions, highlights one target, saves completion separately and restores the real run after practice. Preserve v1 saves, free discard, card/Rune click and drag targeting, gear replacement, camp upgrades and both complete hero runs. Keep gameplay pure in engine.ts and content/talents/audio in their existing modules.

Original local Web Audio preserves scene music, gesture unlock, hidden-tab suspension, independent music/SFX sliders and mute. Art, fonts, audio and saves remain local.
