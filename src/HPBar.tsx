import {useEffect,useRef,useState} from 'react';
import {EffectIcon} from './CombatUI';
import {EFFECTS} from './effects';
import {Tooltip} from './Tooltip';
export function HPBar({current,max}:{current:number;max:number}) {
 const percent=Math.max(0,Math.min(100,current/Math.max(1,max)*100)),previous=useRef(percent);
 const [ghost,setGhost]=useState(percent),[heal,setHeal]=useState<{from:number;gain:number}|null>(null);
 useEffect(()=>{const old=previous.current;previous.current=percent;setHeal(percent>old?{from:old,gain:percent-old}:null);const delay=setTimeout(()=>setGhost(percent),percent<old?180:0);const clear=setTimeout(()=>setHeal(null),650);return()=>{clearTimeout(delay);clearTimeout(clear);};},[percent]);
 const state=percent>60?'healthy':percent>=30?'wounded':'danger';
 return <Tooltip className={`unit-hp hp-bar ${state} ${percent<=15&&current>0?'critical':''}`} help={{name:'Health',value:`${current} / ${max}`,description:EFFECTS.health.description,icon:<EffectIcon id="health"/>}}><span className="hp-track" role="progressbar" aria-label="Health" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0,current)}><i className="hp-ghost" style={{width:ghost+'%'}}/><i className="hp-fill" style={{width:percent+'%'}}/>{heal&&<i className="hp-heal" style={{left:heal.from+'%',width:heal.gain+'%'}}/>}<b><EffectIcon id="health"/>{current} / {max}</b></span></Tooltip>;
}
