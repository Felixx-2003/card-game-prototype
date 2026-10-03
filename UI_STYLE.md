# Visual direction
A retains handmade SVGs; B retains the original cel vector comparison; C is Cartoon Quest, an original clean cartoon cast and reusable card symbols in CartoonArt.tsx. Solid colors, bold outlines, expressive faces and limited cel shadows replace detailed illustrations. D preserves the previous illustration atlas for rollback. Art.tsx switches assets without changing game rules.

Use self-hosted Nunito throughout. Its OFL notice lives in public/fonts/Nunito-OFL.txt. Final fixed-layout contracts live in battle.css; C’s world presentation lives in world.css, imported last.

Battle uses a fixed three-column table: energy, talents, buffs, deck and tutorial on the left; combat and hand in the center; equipment, settings, pause and End Turn on the right. No permanent instruction bar. Main actors have identical dimensions, with smaller hand cards. StatusIcons stay beside actors; counts and HP stay centered. Rarity changes frames and small accents, never dimensions.

Landscape phones keep every battle area visible and scroll only the hand horizontally. Small screens shorten the art band to prioritize text. Respect safe areas. Portrait phones display a rotate prompt. Check 1280×720, 1366×768, tablet and 844×390 / 932×430 / 667×375 / 640×360, including three enemies and side statuses.

GuidedTutorial spotlights one required target, dims and blocks unrelated input, traps keyboard focus and positions short instructions around the target. It uses a practice run and restores the real run afterward. Settings/deck/field-guide dialogs center within safe viewport limits; large contents scroll internally. Reduced motion remains supported.

Audio is original local Web Audio: adventurous menu, playful staccato battle with a brighter triangle lead and rhythmic bass, tense boss, bright reward and distinct endings. Preserve gesture start, faded scene changes, tab suspension, independent music/SFX volumes and mute.

C battle world: BattleWorld.tsx draws original forest, deep grove, stone ruins and boss arena layers, with foreground silhouettes, distant scenery and stage platforms. Fine-pointer parallax updates CSS variables; coarse pointers/reduced motion keep layers still. Scene entrances last 440 ms. Utility controls stay compact at the edges, without enclosing side panels. Intent badges reserve two lines.

Physical cards: equal actor dimensions and matched tilt angles, thick layered frames/shadows, larger portrait fill, a slightly fanned hand, hover lift/enlarge and selected separation. The hand reserves an animation gutter and safe bottom spacing. Landscape encounter titles move into the top edge to leave readable card space.

BattleEffects.tsx owns transient flying card/spell/defeat overlays. UI-only Web Animations handle 300 ms actor lunges, 280 ms damage shake and 340 ms gear/Rune drop bounce. Hit flashes and status pops stay brief. Combat rules, action timing and save schema remain unchanged. Reduced-motion mode suppresses effects. A/B/D preserve the comparison presentations.

Dragged cards use a fixed preview above the scene, while the captured source remains in the hand. This avoids overflow clipping and preserves existing pointer/drop targeting. Late-run buffs plus Cancel/Discard remain reachable at 640×360.
