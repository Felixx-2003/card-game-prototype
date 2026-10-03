import {useEffect,useState,useRef,type ReactNode} from 'react';
import type {CardInstance} from './types';
/* Pagination keeps every card reachable without turning camp/deck into scrolling pages. */
export function PagedCollection({cards,renderCard,kind='deck',enabled=true}:{cards:CardInstance[];renderCard:(card:CardInstance)=>ReactNode;kind?:'deck'|'camp';enabled?:boolean}) {
 const capacity=()=>innerHeight<=500?4:innerHeight<=650?(kind==='camp'?6:5):(kind==='camp'?12:10);
 const [size,setSize]=useState(capacity),[page,setPage]=useState(0);
 const previous=useRef(cards.map(c=>c.uid));
 useEffect(()=>{const added=cards.findIndex(c=>!previous.current.includes(c.uid));if(kind==='camp'&&cards.length>previous.current.length&&added>=0)setPage(Math.floor(added/size));previous.current=cards.map(c=>c.uid);},[cards,size,kind]);
 const pages=Math.max(1,Math.ceil(cards.length/size));const current=Math.min(page,pages-1);
 useEffect(()=>{const resize=()=>setSize(capacity());window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[kind]);
 if(!enabled)return <div className="collection-grid">{cards.map(renderCard)}</div>;
 return <div className={`paged-collection ${kind}-collection`} data-pages={pages}>
 <div className="collection-grid">{cards.slice(current*size,(current+1)*size).map(renderCard)}</div>
 <nav className="collection-pager" aria-label={kind==='camp'?'Camp card pages':'Deck card pages'}><button className="secondary-button" disabled={current===0} onClick={()=>setPage(current-1)} aria-label="Previous cards">←</button><span>Cards {cards.length?current*size+1:0}–{Math.min(cards.length,(current+1)*size)} of {cards.length}<small> · page {current+1} / {pages}</small></span><button className="secondary-button" disabled={current===pages-1} onClick={()=>setPage(current+1)} aria-label="Next cards">→</button></nav>
 </div>;
}
