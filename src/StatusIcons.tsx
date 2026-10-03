import type {Statuses} from './types';
import {EFFECTS} from './effects';
import {EffectIcon,EffectChip} from './CombatUI';
export const STATUS_VISUALS={burn:EFFECTS.burn,freeze:EFFECTS.freeze,poison:EFFECTS.poison,weak:EFFECTS.weak,vulnerable:EFFECTS.vulnerable,shield:EFFECTS.shield};
export type StatusIconName=keyof typeof STATUS_VISUALS;
export function EffectSymbol({name}:{name:StatusIconName}){return <EffectIcon id={name}/>;}
export function StatusIcons({statuses,shield=0,side='right'}:{statuses:Statuses;shield?:number;side?:'left'|'right'}){const entries:[StatusIconName,number][]=[...(shield>0?[['shield',shield] as [StatusIconName,number]]:[]),...Object.entries(statuses).filter(([,n])=>(n??0)>0) as [StatusIconName,number][]];return <div className={`status-rail ${side}`} aria-label="Active effects">{entries.map(([id,n])=><EffectChip key={id} icon={id} value={n} className={`status-icon status-${id}`}/>)}</div>;}
