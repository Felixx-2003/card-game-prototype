import {Portrait} from './Art';
import {EffectChip,EffectText,IntentContent} from './CombatUI';
import {EFFECTS} from './effects';
import {HPBar} from './HPBar';
import type {Intent} from './types';
export function RulesText({text}:{text:string}) {return <EffectText text={text}/>}
export function UnitPresentation({kind,name,hp,maxHp,attack,round,text,hero=false,intent}:{kind:string;name:string;hp:number;maxHp:number;attack:number;round:number;text:string;hero?:boolean;intent?:Intent}) {
 return <div className={`unit-presentation ${hero?'hero-unit':'enemy-unit'}`}>
 <svg className="unit-frame" viewBox="0 0 200 240" preserveAspectRatio="none" aria-hidden="true"><path d="M100 5L190 48l3 175q0 10-12 10L18 235q-12-1-12-12L9 49Z" fill="var(--unit-frame)" stroke="var(--ink)" strokeWidth="7" strokeLinejoin="round"/><path d="M100 16L179 57l3 162q0 4-6 4L24 225q-6-1-6-6L20 58Z" fill="var(--unit-fill)" stroke="var(--unit-trim)" strokeWidth="4" strokeLinejoin="round"/><path d="M30 65l70-36 68 35" fill="none" stroke="#ffffff55" strokeWidth="3"/></svg>
 <div className="unit-art"><Portrait kind={kind} theme="c"/></div>
 <HPBar current={hp} max={maxHp}/>
 <span className="unit-attack"><svg viewBox="0 0 48 58" aria-hidden="true"><path d="M5 4l38-1-1 38-18 13L6 42Z" fill="#809aac" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round"/><path d="M11 10l25 0" stroke="#c4d4d6" strokeWidth="3"/></svg><EffectChip icon="attack" value={attack} details={hero?EFFECTS.attack.baseDescription:undefined}/></span>
 <span className="unit-name actor-title"><svg viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true"><path d="M3 5l23 2 4-5 162 1 4 5 21-3-8 15 9 15-25-3-3 6-160-1-4-5-22 3 8-15Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round"/><path d="M26 8v23m167-22v22" stroke="var(--paper-shade)" strokeWidth="3"/></svg><b>{name}</b></span>
 <span className="unit-effect">{intent?<IntentContent intent={intent} frozen={text.startsWith('Frozen')}/>:<RulesText text={text}/>}</span>
 <span className="unit-counter"><svg viewBox="0 0 54 48" aria-hidden="true"><path d="M14 3h26l11 21-12 21H14L3 24Z" fill="var(--gold)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round"/><path d="M17 9h19" stroke="var(--gold-light)" strokeWidth="3"/></svg><EffectChip icon="counter" value={round}/></span>
 </div>;
}
