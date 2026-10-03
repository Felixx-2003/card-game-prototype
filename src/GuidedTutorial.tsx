import { useLayoutEffect, useState } from 'react';
const LESSONS = [
 ['Energy','Cards spend Energy. It refills each turn.'],
 ['Pick a card','Tap the highlighted attack card.'],
 ['Choose a target','Tap the highlighted enemy to attack.'],
 ['Hero skill','Use your hero’s strong active skill.'],
 ['Your turn ends','Tap End Turn. Enemies act next.'],
 ['Enemy intent','This shows what the enemy will do next.'],
 ['Ready!','Practice complete. Your real run is untouched.'],
];
export function GuidedTutorial({step,selector,onNext}:{step:number;selector:string;onNext:()=>void}) {
 const [tipHeight,setTipHeight]=useState(160);
 const [box,setBox]=useState({x:0,y:0,w:0,h:0});
 useLayoutEffect(()=>{
  const update=()=>{const e=document.querySelector<HTMLElement>(selector);if(!e)return;const r=e.getBoundingClientRect();const tip=document.querySelector<HTMLElement>('.guided-tip');if(tip)setTipHeight(tip.offsetHeight);setBox({x:r.x-5,y:r.y-5,w:r.width+10,h:r.height+10});};
  update();window.addEventListener('resize',update);const timer=window.setInterval(update,200);
  const expected=document.querySelector<HTMLElement>(selector);if(step===1)expected?.scrollIntoView({block:'nearest',inline:'nearest'});
  const focus=()=>{const button=document.querySelector<HTMLButtonElement>('.guided-tip button');if([0,5,6].includes(step))button?.focus();else expected?.focus();};focus();
  const guard=(e:Event)=>{const target=e.target as HTMLElement;if(target.closest('.guided-tip')||target.closest(selector))return;e.preventDefault();e.stopImmediatePropagation();};
  const key=(e:KeyboardEvent)=>{if(e.key==='Tab'){e.preventDefault();focus();return;}if(e.key==='Escape'||e.key==='`'||e.key==='~'){e.preventDefault();e.stopImmediatePropagation();return;}guard(e);};
  document.addEventListener('click',guard,true);document.addEventListener('keydown',key,true);
  return()=>{window.removeEventListener('resize',update);clearInterval(timer);document.removeEventListener('click',guard,true);document.removeEventListener('keydown',key,true);};
 },[selector,step]);
 const info=[0,5,6].includes(step);
 return <div className="guided-tutorial" aria-label="Interactive tutorial" data-target-selector={selector}>
  <div className="guide-blocker" style={{left:0,top:0,width:'100%',height:Math.max(0,box.y)}}/>
  <div className="guide-blocker" style={{left:0,top:box.y,width:Math.max(0,box.x),height:box.h}}/>
  <div className="guide-blocker" style={{left:box.x+box.w,top:box.y,right:0,height:box.h}}/>
  <div className="guide-blocker" style={{left:0,top:box.y+box.h,width:'100%',bottom:0}}/>
  <div className="guide-spotlight" style={{left:box.x,top:box.y,width:box.w,height:box.h}}/>
  <section className="guided-tip" role="dialog" aria-modal="true" aria-labelledby="guide-title" data-step={step} style={{top:box.y+box.h+tipHeight+12<innerHeight?Math.max(8,box.y+box.h+12):Math.max(8,box.y-tipHeight-12),left:Math.max(12,Math.min(innerWidth-292,box.x+box.w/2-140))}}>
   <small>PRACTICE · {step+1} / 7</small><h2 id="guide-title">{LESSONS[step][0]}</h2><p>{LESSONS[step][1]}</p>
   {info&&<button className="primary-button" onClick={onNext}>{step===6?'Finish tutorial':'Next'}</button>}
  </section>
 </div>;
}
