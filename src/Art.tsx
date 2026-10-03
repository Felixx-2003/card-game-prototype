export function Portrait({ kind = 'warrior', className = '', theme = 'a' }: { kind?: string; className?: string; theme?: 'a' | 'b' }) {
  if (theme === 'b') return <PolishedPortrait kind={kind} className={className} />;
  const mage = kind === 'mage';
  const boss = /boss|regent|warden|king|colossus/.test(kind);
  const enemy = !['warrior', 'mage'].includes(kind);
  const colors = ['#ee936c', '#88b777', '#b6c674', '#dfb461', '#87babc'];
  const color = enemy ? colors[kind.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length] : mage ? '#80b8a2' : '#e89960';
  return <svg className={className} viewBox="0 0 200 180" aria-hidden="true">
    <ellipse cx="100" cy="164" rx="68" ry="10" fill="#304c37" opacity=".18" />
    <path d="M12 142L29 103L43 140M160 149L176 98L188 142" fill="#669472" opacity=".4" />
    <g stroke="#382e28" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      {boss ? <><path d="M39 82L24 21L67 52M161 82L177 21L133 52" fill="#deb566" /><path d="M44 147L50 82Q100 27 150 82L162 147Z" fill={color} /><path d="M68 79L79 50L100 72L121 50L135 84" fill="#f0d778" /><path d="M57 96L88 106M143 96L112 106" /><path d="M73 132L89 141L109 140L130 128" fill="none" /><path d="M87 117L100 123L112 116" fill="#544035" /><path d="M41 153L67 132M159 153L134 132" fill="none" /></> : enemy ? <><path d="M55 64L33 37L39 94M145 64L168 39L160 95" fill={color} /><path d="M53 145Q38 73 67 60Q100 34 133 60Q167 83 147 147Z" fill={color} /><path d="M70 88L89 95M131 88L112 95" fill="none" /><ellipse cx="82" cy="100" rx="5" ry="7" fill="#382e28" stroke="none" /><ellipse cx="119" cy="100" rx="5" ry="7" fill="#382e28" stroke="none" /><path d="M84 126Q100 139 119 124" fill="#fff0c8" /><path d="M40 134L25 147L48 155M155 135L172 150L150 157" fill={color} /><path d="M74 152L67 164L91 164M122 152L133 164L111 164" fill="#564b37" /></> : <>
        <path d="M47 155L62 106Q100 82 138 106L155 155Z" fill={mage ? '#467e72' : '#6b8392'} />
        <path d="M72 113L100 146L128 113" fill={mage ? '#ecc76b' : '#b9c4c0'} />
        <path d="M69 58Q100 28 133 60L130 95Q102 120 72 95Z" fill="#f4c593" />
        <path d="M72 65L69 89L54 69L59 42L76 40L89 24L131 37L146 61L133 83L127 56L109 68L103 50Z" fill={mage ? '#e4e5c7' : '#835437'} />
        {mage ? <><path d="M46 51L74 18L87 8L132 46L155 55Q105 74 46 51Z" fill="#497d72" /><path d="M87 8L109 20L96 28" fill="#efc971" /><path d="M153 148L169 78" stroke="#875c39" /><path d="M159 78L155 57L173 43L184 65L172 85Z" fill="#edc766" /><path d="M165 60L173 53L177 66L169 73Z" fill="#fff1ac" stroke="none" /></> : <><path d="M48 123L33 95L47 91L69 116" fill="#bcc6c3" /><path d="M144 133L157 84L162 41L173 59L169 91L158 137" fill="#e4e8d9" /><path d="M148 103L177 111" stroke="#aa7741" /><path d="M45 140L61 126L74 144L67 165L42 159Z" fill="#deab61" /></>}
        <path d="M83 81L90 81M113 81L120 81" /><path d="M93 98Q102 104 112 96" fill="none" strokeWidth="3" /><path d="M77 158L75 168L93 168M119 158L125 168L108 168" fill="#564135" />
      </>}
    </g>
    <path d="M23 49L26 41L29 49L36 52L29 55L26 63L23 55L16 52M174 125L178 118L181 125L188 128L181 131L178 138L174 131L168 128" fill="#f3d77b" />
  </svg>;
}

export function CardArt({ type, id, theme = 'a' }: { type: string; id: string; theme?: 'a' | 'b' }) {
  if (theme === 'b') return <PolishedCardArt type={type} id={id} />;
  const spell = type === 'spell'; const rune = type === 'rune'; const equipment = type === 'equipment';
  const guard = /guard|shield|armor|ward|defend|fortify/.test(id);
  const heal = /heal|mend|renew|blood|siphon/.test(id);
  return <svg viewBox="0 0 160 82" aria-hidden="true" className="card-art">
    <circle cx="80" cy="42" r="33" fill={spell ? '#c2d8bd' : rune ? '#ddc296' : '#edd295'} />
    <g stroke="#493c2e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {rune ? <><path d="M63 11L92 10L105 30L100 65L72 74L54 52L55 25Z" fill="#bb8970" /><path d="M78 22L92 34L77 48L91 59M77 48L67 39" fill="none" stroke="#fff0be" /></> : heal ? <><path d="M80 65Q39 39 57 22Q72 14 80 29Q91 12 107 24Q122 42 80 65Z" fill="#de8067" /><path d="M69 43L90 43M80 33L80 54" stroke="#fff0c8" /></> : guard ? <><path d="M80 11L111 23L106 52L80 72L54 52L49 23Z" fill="#81a6a5" /><path d="M80 20L80 62M61 29L97 29" stroke="#f5d584" /></> : spell ? <><path d="M75 68Q42 53 63 28L71 38L88 9L96 31Q125 56 90 70Z" fill="#e9a656" /><path d="M77 64Q64 52 82 39Q101 61 86 66" fill="#f6dd8b" /></> : equipment ? <><path d="M64 67L76 40L95 12L109 20L89 47L76 73Z" fill="#d2d9c8" /><path d="M64 42L98 55" stroke="#bd8548" /><path d="M67 56L58 72" stroke="#856044" /></> : <><path d="M57 69L69 51L100 14L110 8L112 24L77 60L64 74Z" fill="#e2e4ca" /><path d="M56 44L84 64" stroke="#b77c3f" /><path d="M61 62L51 75" stroke="#7c533c" /><path d="M43 25L48 18M121 53L131 52M113 69L121 74" stroke="#d9a54d" /></>}
    </g>
  </svg>;
}

/** Alternate original cel-shaded art. Theme A's handmade paths stay untouched. */
function PolishedPortrait({ kind, className }: { kind: string; className: string }) {
  const mage = kind === 'mage';
  const enemy = kind !== 'warrior' && !mage;
  const boss = /boss|regent|warden|king|colossus/.test(kind);
  const shades = ['#e88464', '#73bb82', '#d8ae55', '#7bbfc9', '#a9ba63'];
  const shade = shades[Array.from(kind).reduce((n, c) => n + c.charCodeAt(0), 0) % shades.length];
  return <svg className={`${className} polished-portrait`} viewBox="0 0 200 180" aria-hidden="true">
    <path d="M25 145L21 49L100 9L179 49L175 145L100 177Z" fill={enemy ? '#fbd7b8' : '#c8e5df'} />
    <path d="M35 135L31 54L100 20L169 54L165 135L100 163Z" fill={enemy ? '#f8bd8c' : '#a8d1c5'} />
    <path d="M100 23L116 87L163 58L127 108L166 134L115 122L100 163L85 122L34 134L73 108L37 58L84 87Z" fill="#fff3c3" opacity=".65" />
    <ellipse cx="100" cy="164" rx="64" ry="8" fill="#273c48" opacity=".16" />
    <g stroke="#273c48" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      {enemy ? <>
        <path d={boss ? 'M50 84L26 29L73 58L100 31L129 58L175 29L150 86' : 'M50 87L29 49L71 67M150 87L172 49L129 67'} fill={boss ? '#edb75e' : shade} />
        <path d="M48 144L51 82Q63 51 100 51Q139 51 149 82L155 145L131 160H68Z" fill={shade} />
        <path d="M52 129L69 148H131L151 125L155 145L131 160H68L48 144Z" fill="#273c48" opacity=".18" stroke="none" />
        <path d="M68 94L89 100M132 94L112 100" strokeWidth="6" />
        <path d="M68 103L90 108L89 115L70 114ZM132 103L110 108L111 115L130 114Z" fill="#fff8db" strokeWidth="2" />
        <path d="M88 119L100 126L112 119" fill="#273c48" />
        <path d="M77 138L100 147L124 137L120 126L109 136L91 136L80 128Z" fill="#fff8db" strokeWidth="3" />
        <path d="M57 144L32 152L55 164M144 144L168 152L145 164" fill={shade} />
        {boss && <><path d="M68 60L73 40L88 49L100 28L112 49L127 40L132 62Z" fill="#ffe28a" /><path d="M97 44L104 53L100 59L94 53Z" fill="#e7755c" stroke="none" /></>}
      </> : <>
        <path d="M40 157L56 115L82 106H122L146 116L164 157L138 169H65Z" fill={mage ? '#328d87' : '#538ea9'} />
        <path d="M65 124L86 150L118 150L139 123L132 160H72Z" fill={mage ? '#1e6b75' : '#34718b'} stroke="none" />
        <path d="M83 113L100 132L117 113L124 139L100 154L75 139Z" fill="#f4ca69" />
        <path d="M67 65Q100 40 134 65L129 99L112 115H87L70 99Z" fill="#ffcfaa" />
        <path d="M115 73L128 78L129 99L112 115H87L79 108L111 106Z" fill="#e6a781" stroke="none" />
        <path d="M60 67L64 41L86 30L122 34L143 51L139 79L126 65L109 76L101 55L84 74L73 63L70 87Z" fill={mage ? '#f7eddb' : '#734836'} />
        <path d="M77 84L92 84M110 84L124 84" strokeWidth="3" />
        <path d="M81 88L90 88L90 96H83ZM113 88L121 88L119 96H112Z" fill="#273c48" stroke="none" />
        <path d="M96 103L108 103L104 107H100Z" fill="#fff7e8" strokeWidth="2" />
        {mage ? <><path d="M45 52L77 29L89 8L108 17L132 45L157 55L125 65L78 64Z" fill="#3b9d92" /><path d="M89 8L105 18L97 29L85 26Z" fill="#ffe18a" /><path d="M150 156L163 78" stroke="#8d5840" strokeWidth="7" /><path d="M164 42L179 63L164 86L150 64Z" fill="#79d9d0" /><path d="M164 48L166 66L157 72" fill="none" stroke="#edffed" strokeWidth="3" /></> : <><path d="M43 124L54 106L76 125L63 151L38 146Z" fill="#b9dfde" /><path d="M149 136L161 73L176 43L180 75L161 141Z" fill="#e7f6ea" /><path d="M146 109L178 116" stroke="#edb756" strokeWidth="8" /><path d="M40 141L60 131L74 145L68 167L41 162Z" fill="#eeb35b" /><path d="M53 143L54 156M48 149L62 149" stroke="#fff1b5" strokeWidth="3" /></>}
      </>}
    </g>
    <path d="M30 27L34 38L45 42L34 46L30 57L26 46L15 42L26 38ZM173 116L176 124L184 127L176 130L173 138L170 130L162 127L170 124Z" fill="#fff5bd" />
  </svg>;
}

function PolishedCardArt({ type, id }: { type: string; id: string }) {
  const guard = /guard|shield|armor|ward|defend|fortify/.test(id);
  const heal = /heal|mend|renew|blood|siphon/.test(id);
  const palettes: Record<string, string> = { skill: '#f2c977', spell: '#9cdbca', rune: '#e9b7a1', equipment: '#b2d5e1' };
  return <svg viewBox="0 0 160 82" aria-hidden="true" className="card-art polished-card-art">
    <path d="M13 12H147L137 70H23Z" fill={palettes[type] || '#f2c977'} />
    <path d="M80 4L91 30L128 14L112 40L147 55L107 57L97 81L80 61L55 77L57 53L18 44L54 34L47 6L70 25Z" fill="#fff9df" opacity=".7" />
    <g stroke="#273c48" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      {type === 'rune' ? <><path d="M69 9H94L108 32L99 68L75 74L54 49L58 25Z" fill="#df9b79" /><path d="M72 19H87L95 34L91 59L77 64L65 47L68 30Z" fill="#bd765e" stroke="none" /><path d="M77 22L89 34L76 46L88 58M76 46L67 38" stroke="#fff3bf" fill="none" /></> : heal ? <><path d="M80 69L53 49Q32 27 53 16Q72 8 80 26Q93 7 109 18Q129 32 105 52Z" fill="#f18873" /><path d="M52 24Q47 33 59 45" stroke="#ffd5b4" /><path d="M72 32H89V43H99V53H89V63H77V53H66V43H77Z" fill="#fff8d6" stroke="none" /></> : guard ? <><path d="M80 7L112 22L107 54L80 75L53 54L48 22Z" fill="#4c9da7" /><path d="M80 16L102 27L97 49L80 63L63 49L59 27Z" fill="#96d4d1" stroke="none" /><path d="M80 16V63M64 32H97" stroke="#fff1a3" /></> : type === 'spell' ? <><path d="M77 70Q44 57 58 33L74 45L91 8L103 38Q123 54 95 71Z" fill="#ef9556" /><path d="M80 68Q63 57 77 44L88 50L94 33L100 55L91 69Z" fill="#ffe695" stroke="none" /><path d="M45 19L48 11M119 29L128 23M120 60L130 65" stroke="#ed9656" /></> : <><path d="M58 67L73 46L112 6L119 9L118 23L85 59L68 73Z" fill="#e4f3e3" /><path d="M75 50L114 13" stroke="#fff" strokeWidth="2" /><path d="M61 43L90 64" stroke="#e1a049" strokeWidth="8" /><path d="M64 62L53 75" stroke="#765442" strokeWidth="8" /><path d="M40 18L56 23M122 51L139 52M106 74L121 72" stroke="#fff8db" strokeWidth="4" /></>}
    </g>
  </svg>;
}
