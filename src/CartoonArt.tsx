import type { ReactNode } from 'react';
/* Original ink-and-cel cast. Shared materials, individually drawn silhouettes. */
const ink='#302d42', cream='#fff3d8', gold='#efbc62';
function Eye({x,y,look=0}:{x:number;y:number;look?:number}) {return <g><path d={`M${x-7} ${y-4}q7 -7 14 0v8q-7 7-14 0Z`} fill={cream} strokeWidth="2"/><ellipse cx={x+look} cy={y} rx="3.5" ry="6" fill={ink} stroke="none"/><circle cx={x+look+1} cy={y-2} r="1.3" fill="white" stroke="none"/></g>}
function Leaf({x,y,rotate=0,color='#81ae79'}:{x:number;y:number;rotate?:number;color?:string}) {return <g transform={`translate(${x} ${y}) rotate(${rotate})`}><path d="M0 0Q-18-22 0-30Q18-22 0 0Z" fill={color}/><path d="M0-4V-22" fill="none" strokeWidth="2"/></g>}
function Warrior(){return <>
 <path d="M62 137l-12 33h31l13-36m12 0 9 35h27l-14-38" fill="#584d60"/><path d="M52 165h26m39 0h21" stroke={gold}/>
 <path d="M64 96Q42 109 43 147l27 14 61-7 17-30-29-33Z" fill="#be6f55"/><path d="M89 107l-5 47 33-3 8-42Z" fill="#e5c18a"/><path d="M76 95l-17 14 15 25 17-21 15 6 20-22-13-9Z" fill="#f3e2c2"/>
 <path d="M125 105l17 17 10-19 11 5-10 38-22-5" fill="#bb6e55"/><path d="M143 119l10-14 10 3-4 15" fill="#f4bf98"/>
 <path d="M155 113l14-70 12-15 5 25-19 64Z" fill="#dce9e5"/><path d="M176 43l-14 65" stroke="white" strokeWidth="2"/><path d="M147 105l27 7" stroke={gold} strokeWidth="6"/>
 <path d="M69 46q30-23 60 2l-1 31q-7 25-30 28-25-6-29-29Z" fill="#f4bf98"/><path d="M116 51l12 5-2 23q-9 22-23 24l9-23Z" fill="#df927f" stroke="none"/>
 <path d="M62 69l-6-24 16-17 10 3 18-17 12 12 22 4 12 25-15 23-8-25-12 7-10-16-15 18-8-7-6 23Z" fill="#75464c"/><path d="M69 41l17-7m21-5 21 9" stroke="#b67560" strokeWidth="3"/>
 <Eye x={85} y={75} look={2}/><Eye x={112} y={74} look={2}/><path d="M77 62l15 3m14 0 14-6M93 89q10 8 19-2" fill="none" strokeWidth="2.5"/><path d="M80 88h5" stroke="#d67e79" strokeWidth="3"/>
 <path d="M34 108l24-8 26 11-4 36-24 20-24-19Z" fill="#447f79"/><path d="M40 113l18-6 19 8-4 29-17 15-17-16Z" fill="#70aaa0" stroke={gold} strokeWidth="2"/><path d="M56 120l8 11-8 14-8-14Z" fill={gold}/><path d="M86 142l32-2" stroke={ink} strokeWidth="7"/><rect x="99" y="138" width="12" height="9" rx="2" fill={gold} strokeWidth="2"/>
 </>}
function Mage(){return <>
 <path d="M71 144l-3 27h22l7-28m13 0 9 26h22l-13-32" fill="#564b69"/><path d="M60 103l-21 43 40 17 59-6 8-33-29-27Z" fill="#6483b6"/><path d="M108 109l-8 47 34-3 7-25-20-25Z" fill="#445783" stroke="none"/>
 <path d="M55 111l-26 22 9 15 33-19" fill="#86a6ca"/><path d="M38 137l-12-1-9 12 14 9 12-10" fill="#f5c6a8"/><path d="M122 109l25 22 9-6 9 14-20 12-22-24" fill="#86a6ca"/>
 <path d="M72 48q30-27 59 1l-2 32q-11 23-30 25-25-7-29-31Z" fill="#f5c6a8"/>
 <path d="M65 59l5-27 37-9 32 26-2 46-15 9 3-33-12-16-8 18-18-13-9 26-10 10Z" fill="#e9e3cf"/><path d="M72 88l-2 21 19-10m35-16 11 16" fill="#d0c7c2"/>
 <Eye x={89} y={76} look={-1}/><Eye x={113} y={75} look={-1}/><path d="M86 65l9-2m12 0 11 1M96 91q7 5 14-2" fill="none" strokeWidth="2"/>
 <path d="M40 46l36-9L94 7l17 14 21-6-2 32 26 11q-45 25-109 2Z" fill="#566ba3"/><path d="M61 48l68 0" stroke={gold} strokeWidth="6"/><path d="M91 28l9-10 7 9-8 10Z" fill={gold} strokeWidth="2"/>
 <path d="M77 109l21 22 24-25-13 37-26-7Z" fill="#a6c9ce"/><path d="M95 133l6 11 7-9" fill={gold}/><path d="M58 144l25-5m37 9 10-7" fill="none" stroke="#cadbd5" strokeWidth="2"/>
 <path d="M155 169l12-103" stroke="#765467" strokeWidth="7"/><path d="M166 72l-13-16 12-28 22 23-11 20Z" fill="#92d0ce"/><path d="M167 36l-4 17 12 11" fill="none" stroke={cream} strokeWidth="3"/><path d="M156 79l20 3" stroke={gold} strokeWidth="5"/>
 </>}
function Goblin(){return <>
 <path d="M57 136l-17 22 29 12 17-19m26-13 16 19 28-8-21-21" fill="#63544c"/><path d="M64 89l-29 30 23 32 63 10 33-31-23-36Z" fill="#bf864f"/><path d="M66 101l-7 37 37 10 30-37" fill="#e6b971"/>
 <path d="M56 100l-19 8-9 31 17 7 20-28m68-15 19 3 13 24-15 9-21-23" fill="#81a875"/>
 <path d="M61 51L28 41l17 38 21 1m62-20 42-10-27 39-18-3" fill="#81a875"/><path d="M45 54l12 12m86 0 11-7" stroke="#d4b187" strokeWidth="3"/>
 <path d="M63 45q30-24 65 3l5 33q-9 28-36 29-30-9-35-34Z" fill="#a4c084"/><path d="M116 57l16 20q-10 24-25 29l4-28" fill="#80a271" stroke="none"/>
 <Eye x={80} y={74} look={1}/><Eye x={115} y={69} look={-1}/><path d="M69 62l21 4m18-11 17 2" strokeWidth="4"/><path d="M79 91q22 18 44-9l-4 16-22 7Z" fill={cream}/><path d="M96 99v5m13-10 2 8" strokeWidth="2"/>
 <path d="M51 53q3-36 47-40 43 2 42 29l-31 16-34-5Z" fill="#9b6552"/><path d="M58 38l21 7 21-13 16 10 17-10m-61-4 19 7 21-11" fill="none" stroke="#d79c65" strokeWidth="3"/><path d="M98 13l6-10 15 1" fill="none" stroke="#657757"/>
 <path d="M140 140l30-45 12 8-29 44Z" fill="#81634d"/><path d="M153 112l2-28 20-9 14 14-6 23Z" fill="#aaa9a0"/><path d="M160 92l16-7" stroke={cream} strokeWidth="2"/><path d="M71 142l46 8" stroke={ink} strokeWidth="6"/><circle cx="97" cy="148" r="6" fill={gold} strokeWidth="2"/>
 </>}
function Turtle(){return <>
 <path d="M40 141l-15 17 7 13h30l9-25m41-6 6 27h28l8-14-17-14" fill="#93b183"/><path d="M31 143Q19 74 85 56q56 4 64 66l-16 28Z" fill="#426f68"/><path d="M45 137l1-34 19-27 38-6 28 28 4 35-38 12Z" fill="#769c80"/><path d="M46 104l33 4 17-37m-17 37 16 36m-16-36 50-9" fill="none" strokeWidth="3"/>
 <path d="M135 111q39-31 53 3l-4 32q-22 24-57-1Z" fill="#bdd098"/><path d="M145 147q23 8 38-8" fill="none" strokeWidth="3"/><Eye x={162} y={121} look={2}/><path d="M147 112l12-4" strokeWidth="3"/><circle cx="182" cy="128" r="2" fill={ink} stroke="none"/>
 <Leaf x={50} y={94} rotate={-35}/><Leaf x={99} y={67} rotate={20}/><Leaf x={120} y={87} rotate={50}/><path d="M61 77q-13-18-3-28 16-7 25 12" fill="#d69079"/><path d="M54 62l25 4" fill="none" stroke={cream} strokeWidth="2"/><circle cx="102" cy="51" r="7" fill={gold}/><path d="M99 47h6" stroke={cream} strokeWidth="2"/>
 <path d="M38 163h16m73-2h12" stroke="#667963" strokeWidth="2"/>
 </>}
function Imp(){return <>
 <path d="M58 99L26 64l-8 30 16-3 2 24 25 7m66-23 47-38 11 36-20-5-4 25-28 8" fill="#ae5667"/><path d="M33 91l23 22m106-22-27 22" stroke="#db8c78" strokeWidth="2"/>
 <path d="M67 115l-5 42 23 14 13-31 21 29 21-15-15-44Z" fill="#d97866"/><path d="M81 116l10 26 24-5 7-25" fill="#f0ba83"/>
 <path d="M67 47q35-20 64 5l7 35q-15 25-43 27-28-13-33-40Z" fill="#eaa07d"/><path d="M68 57l-18-30 18 8 15 20m34-3 15-30 7 8-7 36" fill={gold}/>
 <path d="M83 43l-3-22 13 7 12-23 12 25 16 1-4 21Z" fill="#c46464"/>
 <Eye x={84} y={75} look={2}/><Eye x={115} y={77} look={-2}/><path d="M76 63l18 5m16-2 13-5" strokeWidth="3"/><path d="M80 92q19 12 43-1l-14 16-16-1Z" fill={ink}/><path d="M85 95l4 9 7-7m16 1 6 5 3-9" fill={cream} strokeWidth="1.5"/>
 <path d="M130 148q32 17 28-13l-9-10 15-8 13 19-13 5" fill="none" strokeWidth="5"/>
 <path d="M41 139q-18-14-4-31l4 8 11-20 7 27q6 20-18 16Z" fill={gold}/><path d="M40 132q-7-7 6-14l2 15" fill={cream} stroke="none"/>
 </>}
function Witch(){return <>
 <path d="M67 125l-8 42 29 3 12-31 20 30h23l-18-43" fill="#5d4c6d"/><path d="M63 98L39 150l34 14 59-7 23-25-31-41Z" fill="#98799d"/><path d="M81 106l-12 42 31 7 27-40" fill="#cec0ac"/><path d="M123 113l24 22 8-11 11 9-13 20-28-15" fill="#98799d"/>
 <path d="M64 48q35-28 66 3v32q-13 21-30 23-29-6-34-28Z" fill="#e4b494"/><path d="M62 49l-3 47 18 13 4-42 27-20 15 39 17 19 1-46-18-22Z" fill="#54475f"/>
 <Eye x={88} y={76} look={1}/><Eye x={115} y={73} look={1}/><path d="M81 66l12-3m17-2 12 2M93 92l16-3" fill="none" strokeWidth="2"/><path d="M83 91h3" stroke="#c97e81"/>
 <path d="M31 49q38-14 53-43l24 17 32-10-10 36 33 12q-59 23-124 2Z" fill="#846a95"/><path d="M58 50l67 3" stroke={gold} strokeWidth="5"/><Leaf x={126} y={50} rotate={65} color="#b5bc83"/>
 <path d="M164 166l-7-91" stroke="#795d59" strokeWidth="7"/><path d="M159 88q-34-4-22-34l8 13 18-28 4 21 21 7-17 20Z" fill="#aac187"/><circle cx="157" cy="69" r="7" fill={gold}/>
 <path d="M45 145l-12-7 2-14 22 6" fill="#e4b494"/><path d="M43 159q-29-11-28-31 16-4 30 5l15-10 9 27Z" fill="#638a80"/><path d="M24 135l31 8" stroke="#a8c4a2" strokeWidth="2"/>
 </>}
function Fairy(){return <>
 <path d="M74 100Q13 60 28 23q33 1 56 58M121 92q39-60 63-45-1 41-51 62" fill="#d8e5bd"/><path d="M38 38l30 44m101-18-33 24" stroke="#8aa58b" strokeWidth="2"/>
 <path d="M84 122l-12 26 12 8 15-25m12-4 7 19 16-1-10-25" fill="#c7a588"/>
 <path d="M74 88l-14 48q42 31 82-6l-24-43Z" fill={gold}/><path d="M70 128q31 15 61-3" fill="none" stroke="#c48655"/><path d="M91 99l-5 26m23-26 7 24" stroke="#ffe1a0" strokeWidth="4"/>
 <path d="M73 90L46 81l-5 11 30 13m53-16 30 11 6-10-29-18" fill="#edc5a0"/>
 <path d="M76 42q25-19 48 1l4 31q-10 23-27 23-23-6-26-25Z" fill="#f4ccaa"/><path d="M71 65l-6-29 29-21 36 15 10 34-19-10-8-20-10 23-15-9-12 25Z" fill="#cf875f"/>
 <Eye x={88} y={65}/><Eye x={115} y={65}/><path d="M94 81q8 9 16-1" fill={cream} strokeWidth="2"/>
 <Leaf x={90} y={26} rotate={-50}/><Leaf x={114} y={29} rotate={55}/><circle cx="105" cy="24" r="6" fill={gold}/><path d="M53 94l-14 39" stroke="#775f68" strokeWidth="3"/><path d="M29 127l9-14 10 15-2 14H28Z" fill={gold}/><circle cx="39" cy="146" r="4" fill="#b88651" strokeWidth="2"/>
 </>}
function Knight(){return <>
 <path d="M61 128l-12 36 37 7 13-31 9 28 36-1-14-43" fill="#536071"/><path d="M57 99l-11 37 26 17 55-9 15-34-26-29Z" fill="#8aa2a6"/><path d="M76 105l15 24 32-30-5 35-26 8-24-14Z" fill="#bbc5b9"/><path d="M40 103l-15 34 20 15 25-31m62-18 26 15 6-26-16-6-10 13" fill="#8aa2a6"/>
 <path d="M62 33l22-16 38 9 18 33-7 41-34 14-33-19-12-33Z" fill="#8aa2a6"/><path d="M64 52l59-12 9 29-21 31-31-6Z" fill="#bfcfc7"/><path d="M64 61l63-9 2 18-51 15-15-8Z" fill={ink}/><path d="M82 67l9-2m17-4 10-2" stroke={gold} strokeWidth="4"/>
 <path d="M57 48l-18-7 11-16 11 13m66-8 19-18 8 18-16 19" fill="#667c78"/><Leaf x={86} y={24} rotate={-20}/><Leaf x={108} y={27} rotate={35}/>
 <path d="M154 158l12-139" stroke="#75585d" strokeWidth="7"/><path d="M166 38l-10-16 13-19 10 22-12 13Z" fill="#bdd1c3"/>
 <path d="M22 118l25-6 18 13-6 34-27 10-15-23Z" fill="#55786d"/><path d="M28 130l16-6 8 19-15 12Z" fill={gold}/><Leaf x={22} y={148} rotate={-50}/><Leaf x={62} y={133} rotate={65}/>
 </>}
function Warden(){return <>
 <path d="M62 136l-11 34h33l14-36 16 36h26l-10-37" fill="#5f5367"/><path d="M64 95l-28 57 38 12 56-6 25-15-31-53Z" fill="#497d83"/><path d="M96 107l-8 49 33-3 8-51" fill="#355666" stroke="none"/><path d="M75 104l18 20 24-22" fill="#c4cdb1"/>
 <path d="M65 47q36-24 70 6l-6 39-29 24-33-29Z" fill="#c1c2a1"/><path d="M67 54l27 7 10 26-24 7-15-16m67-16-22 1-7 25 23 8 10-15" fill="#e8dfbc"/><Eye x={84} y={75}/><Eye x={121} y={76}/><path d="M97 83l11-1-6 17Z" fill={gold}/>
 <path d="M53 51l18-15 7-26 18 21 31-17 6 26 20 22-32-11-26 7-22-3Z" fill="#507d83"/><path d="M73 43l45 0" stroke={gold} strokeWidth="4"/>
 <path d="M50 112l-17 25 15 12 18-24m64-16 19 12 4-19 14 3-6 36-25-2" fill="#6d9796"/><path d="M157 94v34" stroke={gold}/><path d="M147 132l-6 26 16 12 20-13-7-25Z" fill={gold}/><path d="M150 140l-2 14 10 7 11-8-5-14Z" fill="#ffecac"/><path d="M158 145v8" stroke="#d78b5e" strokeWidth="3"/>
 </>}
function King(){return <>
 <path d="M64 135l-24 34 29-2 31-21 23 26 40-3-24-32Z" fill="#766257"/><path d="M50 76l-20 42 30 26 76 10 40-34-34-50Z" fill="#566f67"/><path d="M68 93l-9 42 41 18 36-25-12-36Z" fill="#aa8663"/><path d="M72 111l16 15-4 17m34-32-13 15 7 18" fill="none" stroke="#705d56" strokeWidth="3"/>
 <path d="M62 46l-16-8-6-25 13 12 12-3 7 16m60 0 19-26 3 18 20-6-11 20-20 8" fill="#8c725a"/>
 <path d="M62 36l-3 49 20 30 36 2 26-29-3-46-35-23Z" fill="#bb946a"/><path d="M64 41l12 12-5 33 14 23m43-62-13 13 10 29-14 19" fill="none" stroke="#8a6a59" strokeWidth="3"/>
 <path d="M72 68l23 5-5 15-17-4m35-12 23-7-4 20-17 1" fill={ink}/><path d="M77 76h9m29 0 10-3" stroke={gold} strokeWidth="3"/><path d="M95 86l7 11 5-13M83 100l10 3 8-2 9 4 12-8" fill="none" strokeWidth="3"/>
 <path d="M57 37l-5-25 23 7L89 3l14 18 20-15 9 18 20-2-15 24Z" fill={gold}/><path d="M66 31l67 4" stroke="#ffe1a0" strokeWidth="4"/><circle cx="100" cy="30" r="5" fill="#995b69" strokeWidth="2"/>
 <path d="M55 89l-31 13-7 31 20 6 13-18 15-10m72-21 26 10 16 31-20 14-14-24-15-13" fill="#8c725a"/><Leaf x={36} y={106} rotate={-60}/><Leaf x={153} y={110} rotate={65}/><Leaf x={48} y={48} rotate={-65}/><Leaf x={150} y={48} rotate={65}/><path d="M47 87l23 15m60-3 20-14" stroke={gold} strokeWidth="5"/>
 </>}
const portraits:Record<string,()=>ReactNode>={warrior:Warrior,mage:Mage,'acorn-raider':Goblin,'moss-shell':Turtle,'ember-imp':Imp,'briar-witch':Witch,'bell-sprite':Fairy,'bramble-knight':Knight,'lantern-warden':Warden,'hollow-regent':King};
export function CartoonPortrait({kind,className=''}:{kind:string;className?:string}) {
 const Cast=portraits[kind]??Goblin;
 return <svg className={`cartoon-portrait ${className}`} viewBox="0 0 200 180" aria-hidden="true" data-cartoon={kind}>
 <path d="M0 0H200V180H0Z" fill="#d7dfbf"/><path d="M0 100Q45 66 78 93t122-5v92H0Z" fill="#a6bba1"/><path d="M0 155q45-17 92-4t108-5v34H0Z" fill="#859e8c"/><path d="M14 0l-3 104 12 25 4-129m140 0 3 118 13 9 2-127" fill="#648d81" opacity=".3"/><circle cx="100" cy="76" r="63" fill="#fff0be" opacity=".6"/><ellipse cx="101" cy="170" rx="69" ry="8" fill={ink} opacity=".2"/>
 <g stroke={ink} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"><Cast/></g></svg>;
}
function Sword({heavy=false,fire=false}:{heavy?:boolean;fire?:boolean}) {return <>{fire&&<path d="M49 70Q21 48 51 26l2 14 23-34 12 23 20-6-5 32-32 21Z" fill="#df8867"/>}<path d={heavy?'M58 65L92 7h24l-6 25-37 43Z':'M57 67L100 8l15-3-2 18-44 53Z'} fill="#d9e8e1"/><path d="M102 13L65 67" stroke={cream} strokeWidth="2"/><path d="M50 52l32 23" stroke={gold} strokeWidth="7"/><path d="M58 64L46 80" stroke="#825a63" strokeWidth="8"/><circle cx="44" cy="81" r="4" fill={gold}/></>}
function Shield(){return <><path d="M80 8l37 14-6 34-30 24-32-24-7-34Z" fill="#578b86"/><path d="M80 17l27 10-5 24-22 19-22-19-5-24Z" fill="#8bb9a6" stroke={gold} strokeWidth="2"/><path d="M80 26l11 16-11 18-11-18Z" fill={gold}/></>}
const runeColors:Record<string,string>={fire:'#db8a6c',power:'#d8b26b',echo:'#7fa6ac',cheap:'#b8c6a0',blood:'#bb778d',chain:'#d5ad6c',frost:'#8cbecb',renew:'#85ae86'};
export function CartoonCardArt({id,type}:{id:string;type:string}) {
 const rune=type==='rune',ice=/freeze|ice|frost/.test(id),heal=/heal|wind|renew|blood/.test(id),shield=/guard|ward|fortify|shield/.test(id),lightning=/lightning|storm/.test(id),poison=/venom|toxic/.test(id),magic=/arcane|mage/.test(id);
 let art:ReactNode;
 if(rune){var key=id.replace('rune-','');art=<><path d="M63 9l32-3 20 27-9 34-31 14-26-25 2-31Z" fill={runeColors[key]??'#aaa0bd'}/><path d="M63 9l15 25-29 22m29-22 37-1m-37 1-3 47" fill="none" strokeWidth="2" opacity=".4"/><path d={key==='chain'?'M68 29l18-9 12 15-18 11-12-17m4 20 18-9 12 15-18 11-12-17':key==='cheap'?'M66 57l30-33-4 21-17 15m3-22 7 6':key==='frost'?'M80 21v42m-18-32 36 22m-36 0 36-22':key==='renew'?'M80 25v34m-16-17h32':key==='echo'?'M68 29q23-18 28 5T71 55':key==='blood'?'M80 22q-23 29-7 38 25 8 13-21Z':'M65 31l26-9-10 21 16 6-30 17 10-20Z'} fill="none" stroke={cream} strokeWidth="4"/></>}
 else if(id==='mage-ring')art=<><ellipse cx="79" cy="51" rx="25" ry="23" fill="none" stroke={gold} strokeWidth="10"/><path d="M62 21l17-15 18 16-18 20Z" fill="#a695c4"/><path d="M69 22l10-9 10 10-10 10Z" fill="#d4c5e5" strokeWidth="2"/></>;
 else if(/armor|mail/.test(id))art=<><path d="M54 13l16-5 10 10 12-10 16 6 12 22-15 8-3 31H56l-2-30-15-8Z" fill={id==='thorn-mail'?'#81a783':'#91a7ac'}/><path d="M69 19l11 13 16-14M60 54l40-1m-39 12h37" fill="none" stroke={cream} strokeWidth="2"/>{id==='thorn-mail'&&<><Leaf x={59} y={46} rotate={-30}/><Leaf x={104} y={51} rotate={40}/></>}</>;
 else if(/staff|charm/.test(id))art=id==='oak-charm'?<><path d="M54 7q27 13 52 0l-4 40H61Z" fill="none" stroke="#9b775d"/><path d="M60 38l35-5 17 20-11 24-28 2-18-20Z" fill="#8ca77f"/><Leaf x={80} y={65} rotate={20} color="#c9d1a0"/></>:<><path d="M58 79l36-61" stroke="#826171" strokeWidth="8"/><path d="M83 27l4-18 26-5 14 20-15 22-23-1Z" fill="#9abacb"/><path d="M96 12l-1 17 13 8 10-12" fill="none" stroke={cream} strokeWidth="3"/><path d="M78 41l23 13" stroke={gold} strokeWidth="5"/></>;
 else if(id==='toxic-dart')art=<><path d="M43 72l51-54 15 15-52 49Z" fill="#afbd9f"/><path d="M95 18l23-12-9 27Z" fill="#8caa82"/><path d="M50 61l-23-5 8 19 23 4Z" fill="#bb8b72"/><path d="M117 42q-13 18 0 21 13-2 0-21Z" fill="#81a783"/></>;
 else if(id==='hamstring')art=<><path d="M61 11h30l-7 34 27 9 2 18H56l-6-16Z" fill="#9a7770"/><path d="M63 19h23m-28 45 46 0" fill="none" stroke={gold} strokeWidth="3"/><path d="M27 44q48-17 88-6l16 17" fill="none" stroke="#557f7a" strokeWidth="5"/></>;
 else if(id==='piercing-thrust')art=<><path d="M38 81l54-52" stroke="#88646b" strokeWidth="7"/><path d="M85 24l36-20-17 40-10-9Z" fill="#d9e8e1"/><path d="M98 29l16-17" stroke={cream} strokeWidth="2"/><path d="M80 36l18 14" stroke={gold} strokeWidth="4"/></>;
 else if(id==='quick-slash')art=<><path d="M66 57l24-44 17-4-4 21-26 37Z" fill="#d9e8e1"/><path d="M54 48l31 22" stroke={gold} strokeWidth="5"/><path d="M65 61l-14 17" stroke="#88646b" strokeWidth="7"/><path d="M32 23q0 27 15 30m65-1 15-12" fill="none" stroke="#8eae9e" strokeWidth="3"/></>;
 else if(shield)art=<><Shield/>{id==='shield-bash'&&<path d="M122 18l13-6m-12 27 17 1m-23 20 13 9" stroke={gold} strokeWidth="4"/>}</>;
 else if(ice)art=<><path d="M80 5l14 22 24 14-24 15-14 22-14-22-23-15 23-14Z" fill="#9ac6d0"/><path d="M80 18v48m-24-25h48M65 27l30 28m0-28L65 55" stroke={cream} strokeWidth="3"/></>;
 else if(heal)art=<><path d="M79 72Q39 51 46 31q9-22 33-6 22-19 34 1 15 24-34 46Z" fill="#c87f88"/><path d="M78 30v26m-13-13h26" stroke={cream} strokeWidth="5"/><Leaf x={39} y={65} rotate={-55}/><Leaf x={119} y={65} rotate={55}/></>;
 else if(lightning)art=<><path d="M90 4L50 46h26l-12 33 49-47H87l17-28Z" fill={gold}/><path d="M36 28l8-11m79 41 7-13M38 59h13" fill="none" stroke="#b1c8cb" strokeWidth="4"/></>;
 else if(poison)art=<><path d="M54 62q-29-17-7-32 6-23 27-14 24-22 33 5 28-1 24 24 16 23-22 26Z" fill="#90b18b"/><path d="M67 38l9 5m22-9-7 9m-17 11q11 9 22-2" fill="none" strokeWidth="3"/><circle cx="43" cy="73" r="5" fill="#a6c398"/></>;
 else if(magic||id==='sunburst')art=<><path d="M80 5l11 21 28 15-28 15-11 22-12-23-26-14 26-15Z" fill={id==='sunburst'?gold:'#a595c3'}/><circle cx="80" cy="41" r="14" fill={cream}/><path d="M27 18l10 8m89 34 9 8" stroke={gold}/></>;
 else if(type==='spell')art=<><path d="M70 74q-39-13-18-41l9 10 21-36 11 24 18-6-2 23q21 26-15 28Z" fill="#de8d68"/><path d="M76 64q-13-10 5-28l8 13q10 13-13 15Z" fill={gold} strokeWidth="2"/></>;
 else if(id==='rally')art=<><path d="M53 77l13-69" stroke="#80616b" strokeWidth="6"/><path d="M68 12l43 6-13 20 9 15-46-6Z" fill="#bd7e70"/><path d="M76 24l10 7-12 8" fill={gold}/></>;
 else art=<><Sword heavy={id==='heavy-strike'||id==='cleave'} fire={id==='flame-sword'}/>{id==='cleave'&&<path d="M27 18q-8 42 57 58m-52-53q6 38 39 42" fill="none" stroke={gold} strokeWidth="3"/>}</>;
 return <svg className="card-art cartoon-card-art" viewBox="0 0 160 88" aria-hidden="true" data-item-art={id}><path d="M0 0h160v88H0Z" fill="#dce1c5"/><path d="M0 71Q40 45 84 68t76-12v32H0Z" fill="#a9bea6"/><circle cx="80" cy="41" r="37" fill={cream} opacity=".65"/><ellipse cx="81" cy="79" rx="45" ry="5" fill={ink} opacity=".15"/><g stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">{art}</g></svg>;
}
