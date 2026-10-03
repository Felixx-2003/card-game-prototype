# Visual direction
Theme A retains handmade vectors; B retains the cel-style vector comparison. Replacement C is Storybook anime: original generated shaded character and effect illustrations, warm ivory/jade frames, bright woodland colors, and polished rounded controls. The 4×4 local atlas in public/art/storybook-atlas.png supplies ten distinct characters and six effect scenes. Art.tsx selects cells without changing gameplay.

All pages use one self-hosted rounded Nunito family, including menus, battle, rewards, settings, tutorials and deck popups. Source: https://github.com/google/fonts/tree/main/ofl/nunito; OFL notice bundled in public/fonts/Nunito-OFL.txt. Legacy font assets remain unused for rollback.

Final shared presentation contracts live in src/polish.css after styles.css. Battles fit a fixed viewport. Guidance and former bottom labels occupy separate fixed rows above combat; no guide sits between hero and hand. HP/status counts remain centered, global buffs sit outside cards, and actor dimensions match. Compact three-enemy layouts fit all foes and two-line intents. Narrow hands scroll horizontally. Long Rune descriptions reserve more text space by shortening the illustration band.

Rarity is visual: common simple muted frame; rare teal double frame and twin diamond ornament; epic gold layered frame, warm tint and three-star crest. Frames and motifs stay visible in hand, rewards and collections.

Settings and tutorial panels are centered grid children, with consistent padding, safe viewport limits, scrolling inside oversized panels and keyboard focus management. Original anime illustrations appear in the guide too. Reduced motion is honored.

The original local Web Audio set now has adventurous menu phrases, brisk heroic battle pulses, tense elite/boss music, bright reward arpeggios and separate ending themes. Preserve gesture start, faded scene changes, tab visibility behavior, independent volumes and master mute. No external game audio.
