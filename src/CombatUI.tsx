import type {ReactNode} from 'react';
import {EFFECTS,type EffectId} from './effects';
import {Tooltip} from './Tooltip';
import type {CombatEvent,Intent} from './types';
export function EffectIcon({id}:{id:EffectId}) {return <svg className={`effect-icon tone-${EFFECTS[id].tone}`} data-effect={id} viewBox="0 0 24 24" aria-hidden="true"><path d={EFFECTS[id].path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
export function EffectChip({icon,value,tone,details,className='',interactive=true}:{icon:EffectId;value?:number|string;tone?:string;details?:string;className?:string;interactive?:boolean}) {const effect=EFFECTS[icon];if(!interactive)return <span className={`effect-chip tone-${tone??effect.tone} ${className}`} aria-label={`${effect.name} ${value??''}`}><EffectIcon id={icon}/>{value!==undefined&&<b className={className.includes('status-icon')?'status-count':undefined}>{value}</b>}</span>;return <Tooltip className={`effect-chip tone-${tone??effect.tone} ${className}`} interactive={interactive} role={className.includes('status-icon')?'img':undefined} label={className.includes('status-icon')?`${effect.name}, ${value} ${icon==='shield'?'protection':'stacks'}`:undefined} help={{name:effect.name,value,description:details??effect.description,icon:<EffectIcon id={icon}/>}}><EffectIcon id={icon}/>{value!==undefined&&<b className={className.includes('status-icon')?'status-count':undefined}>{value}</b>}</Tooltip>;}

// Existing engine prose stays authoritative; numbers gain semantic chips in one place.
function numberEffect(text:string,index:number,length:number):EffectId {
 const before=text.slice(Math.max(0,index-80),index).toLowerCase(),after=text.slice(index+length,index+length+42).toLowerCase();
 if(/^\s*power/.test(after)||/damage.*healing.*shield.*gain[^.]*$/.test(before))return 'power';
 if(/burn[^.]*fades[^.]*$/.test(before))return 'burn';
 if(/^\s*(burn|freeze|weak|vulnerable|poison)/.test(after))return after.trim().split(/\W/)[0] as EffectId;
 if(/^\s*cards?\b/.test(after)||/draw\s*$/.test(before))return 'draw';
 if(/^\s*shield/.test(after)||/shield[^.]*$/.test(before)&&!/^\s*(damage|hp)/.test(after))return 'shield';
 if(/^\s*(hp|health)/.test(after))return /lose[^.]*$/.test(before)?'blood':'heal';
 if(/^\s*(less energy|energy)/.test(after)||/cost[^.]*$/.test(before))return 'energy';
 if(/^\s*(turn|round|action)/.test(after))return 'cooldown';
 if(/draw[^.]*$/.test(before)||/^\s*card/.test(after))return 'draw';
 if(/heal[^.]*$/.test(before))return 'heal';
 if(/^%/.test(after)||/half|repeat|echo/.test(before))return 'echo';
 if(/power|gain/.test(before)&&!/^\s*damage/.test(after))return 'power';
 return 'attack';
}
export function EffectText({text,interactive=true}:{text:string;interactive?:boolean}) {
 const parts:ReactNode[]=[];const numbers=/[+-]?\d+(?:\/\d+)?(?:%)?/g;let start=0;for(const m of text.matchAll(numbers)){const i=m.index!;parts.push(text.slice(start,i));parts.push(<EffectChip key={i} icon={numberEffect(text,i,m[0].length)} value={m[0]} interactive={interactive}/>);start=i+m[0].length;}parts.push(text.slice(start));return <>{parts}</>;
}
export function IntentContent({intent,frozen=false,interactive=true}:{intent:Intent;frozen?:boolean;interactive?:boolean}) {
 if(frozen)return <><EffectChip icon="freeze" value={1} interactive={interactive}/> <span>Skip action</span></>;
 return <>{intent.kind==='debuff'&&<EffectIcon id="hex"/>}{intent.damage!==undefined&&<EffectChip icon="attack" value={intent.damage} details={`Deals ${intent.damage} damage on the next enemy action, before defence and statuses.`} interactive={interactive}/>}{intent.shield!==undefined&&<EffectChip icon="shield" value={intent.shield} interactive={interactive}/>}{intent.heal!==undefined&&<EffectChip icon="heal" value={intent.heal} interactive={interactive}/>}{intent.status&&<EffectChip icon={intent.status} value={intent.stacks??1} interactive={interactive}/>}{intent.heal!==undefined&&<span>Allies</span>}</>;
}

export function IntentPill({intent,frozen=false}:{intent:Intent;frozen?:boolean}){const id:EffectId=frozen?'freeze':intent.damage!==undefined?'attack':intent.shield!==undefined?'shield':intent.heal!==undefined?'heal':'hex';const explanation=frozen?EFFECTS.freeze.description:intent.kind==='debuff'?EFFECTS[intent.status??'weak'].description:intent.heal!==undefined?'Heals all living enemies on their next action.':intent.shield!==undefined?'Gains the displayed Shield on its next action.':'Deals the displayed damage and statuses on its next action. Press End Turn when ready.';return <Tooltip className="intent-help" help={{name:frozen?'Frozen':'Enemy intention',value:frozen?'1 action':intent.label,description:explanation,icon:<EffectIcon id={id}/>}}><IntentContent intent={intent} frozen={frozen} interactive={false}/></Tooltip>;}

export function eventEffect(event:CombatEvent):EffectId {if(event.kind==='damage')return 'attack';if(event.kind==='heal')return 'heal';if(event.kind==='shield')return 'shield';return (['burn','freeze','poison','weak','vulnerable'] as EffectId[]).find(id=>event.label?.toLowerCase().includes(id))??'power';}
