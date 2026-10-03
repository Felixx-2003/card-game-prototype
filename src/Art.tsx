export function Portrait({ kind = 'warrior', className = '' }: { kind?: string; className?: string }) {
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

export function CardArt({ type, id }: { type: string; id: string }) {
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

