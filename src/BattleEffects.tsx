import type {CSSProperties} from 'react';
import {CardArt,Portrait} from './Art';
export type BattleMotion={id:number;x:number;y:number;dx:number;dy:number;kind:string;art:string;name:string;type:string};
export type DefeatGhost={id:string;x:number;y:number;w:number;h:number;kind:string};
export type DragPreview={x:number;y:number;w:number;h:number;angle:number;name:string;type:string;art:string;rarity:string;cost:number;description:string};
export function BattleEffects({motion,ghosts,theme,drag}:{motion:BattleMotion|null;ghosts:DefeatGhost[];drag:DragPreview|null;theme:'a'|'b'|'c'|'d'}) {
 return <div className="battle-effects" aria-hidden="true">
 {drag&&<div className={'drag-preview playing-card '+drag.type+' '+drag.rarity} style={{left:drag.x,top:drag.y,width:drag.w,height:drag.h,transform:'translate(-50%,-50%) rotate('+drag.angle+'deg) scale(1.06)'}}><span className="energy-cost">{drag.cost}</span><span className="card-name">{drag.name}</span><CardArt type={drag.type} id={drag.art} theme={theme}/><span className="card-type">{drag.type}</span><span className="card-description">{drag.description}</span></div>}
 {motion&&<div key={motion.id} className={'card-flight '+motion.kind} style={{left:motion.x,top:motion.y,'--flight-x':motion.dx+'px','--flight-y':motion.dy+'px'} as CSSProperties}><b>{motion.name}</b><CardArt type={motion.type} id={motion.art} theme={theme}/></div>}
 {motion?.type==='spell'&&<div key={'spell'+motion.id} className={'spell-burst '+(/ice|freeze/.test(motion.art)?'ice':'magic')} style={{left:motion.x+motion.dx,top:motion.y+motion.dy}}><i/><i/><i/><i/><span>✦</span></div>}
 {ghosts.map(g=><div key={g.id} className="defeat-ghost" style={{left:g.x,top:g.y,width:g.w,height:g.h}}><Portrait kind={g.kind} theme={theme}/><span>✧</span></div>)}
 </div>;
}
