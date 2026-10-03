# Visual direction

Warm parchment, forest green, ochre, coral. Chunky ink outlines, tactile paper cards, original playful SVG fantasy portraits. No neon, glass, purple gradients, dashboard panels, or external assets.
All theme colors, borders, shadows, spacing, fonts, timing and rarity treatments in CSS tokens. Board: enemy cards upper middle, hero lower middle, equipment adjacent, hand bottom, energy and End Turn obvious. Hover lift, selection tilt, valid-target glow, smoothly returning invalid drops, floating combat numbers.
Battle is a fixed viewport, with no vertical page scroll. Hero/enemy cards share exact dimensions; differently shaped headers, corners and colors distinguish them. Hand cards are smaller and readable. Energy is a segmented bar with current/max numbers; unavailable cards grey out with an End Turn hint. Reusable status symbols sit in side rails with count badges and hover/focus rule tooltips, never under HP. Verify 1280×720, 1366×768, 1280×800 and 1920×1080; narrow hands scroll horizontally.

Theme A keeps the original handmade art/parchment. Theme B uses cleaner cel-style original SVGs, teal/cream board colors and polished frames. Switch via the Art theme selector or Settings; centralized CSS tokens and the `theme` art prop keep gameplay independent. Fraunces headings and Alegreya Sans body replace generic fonts; font files and OFL notices are local in public/fonts.

Stage/card entrances, path highlights, elite/boss arrival banners, chest/reward reveals and restrained ending motion support progression. Honor reduced motion. Audio is original Web Audio synthesis: a quiet looping melody plus short interaction/combat/reward cues. Start on a player gesture, pause hidden tabs, remember mute and separate music/SFX volumes; no third-party game audio.
