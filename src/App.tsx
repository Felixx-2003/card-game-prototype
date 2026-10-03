import {BattleWorld,BattlePlatform,ENVIRONMENTS} from './BattleWorld';
import {BattleEffects,type BattleMotion,type DefeatGhost} from './BattleEffects';
import { GuidedTutorial } from './GuidedTutorial';
import { CHARACTER_SKILLS, GLOBAL_BUFFS, activeSkillAvailable, type GlobalBuffId } from './abilities';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { CARDS, HEROES, RUNES, ENCOUNTERS, ENEMIES } from './data';
import { initialState, startRun, playCard, endTurn, nextBattle, chooseReward, upgradeCard, removeRune, getCost, canTarget, debugAction, isValidSave, discardCard, getCardEffect, activateSkill, chooseGlobalBuff } from './engine';
import type { GameState, CardInstance, HeroId, DebugAction } from './types';
import { Portrait, CardArt } from './Art';
import { StatusIcons } from './StatusIcons';
import { EnergyBar } from './EnergyBar';
import { Tutorial } from './Tutorial';
import { RewardChest } from './RewardChest';
import { audioController, playSfx } from './audio';
import { Settings } from './Settings';

const SAVE_KEY = 'card-game-prototype-v1';
const PREF_KEY = 'card-game-prototype-ui-v2';
function readPreferences(): { theme: 'a' | 'b' | 'c' | 'd'; tips: boolean } { try { const value = JSON.parse(localStorage.getItem(PREF_KEY) || 'null'); return { theme: value?.theme === 'd' ? 'd' : value?.theme === 'c' ? 'c' : value?.theme === 'b' ? 'b' : value?.theme === 'a' ? 'a' : 'c', tips: typeof value?.tips === 'boolean' ? value.tips : true }; } catch { return { theme: 'c', tips: true }; } }
function cardDescription(card: CardInstance): string {
  const def = CARDS[card.defId];
  if (def.type === 'equipment' || def.type === 'rune') return def.description;
  const effect = getCardEffect(card);
  const pieces: string[] = [];
  if (effect.damage) pieces.push(`Deal ${effect.damage} damage${effect.all ? ' to all enemies' : ''}.`);
  if (effect.shield) pieces.push(`Gain ${effect.shield} Shield.`);
  if (effect.heal) pieces.push(`Heal ${effect.heal} HP.`);
  if (effect.draw) pieces.push(`Draw ${effect.draw} card${effect.draw === 1 ? '' : 's'}.`);
  if (effect.status) pieces.push(effect.status === 'freeze' ? 'Freeze for one action.' : `Apply ${effect.stacks || 1} ${effect.status[0].toUpperCase()}${effect.status.slice(1)}.`);
  if (effect.cleanse) pieces.push('Remove harmful statuses.');
  return pieces.join(' ') || def.description;
}
function handDescription(card: CardInstance): string {
 const def=CARDS[card.defId];
 if(def.type==='rune')return ({fire:'+2 Burn on attacks.',power:'+4 attack damage. Weapons: +3.',echo:'Repeat at half power.',cheap:'Costs 1 less Energy.',blood:'+5 power. Lose 3 HP.',chain:'Hit another foe at half damage.',frost:'Attacks Freeze once.',renew:'Heal 3 HP. Gear: heal 2 per turn.'} as Record<string,string>)[def.runeId!] || def.description;
 return cardDescription(card).replace(/Deal (\d+) damage to all enemies\./g,'$1 damage to all.').replace(/Deal (\d+) damage\./g,'$1 damage.').replace(/Gain (\d+) Shield\./g,'+$1 Shield.').replace(/Apply (\d+) /g,'$1 ').replace('Freeze for one action.','Freeze once.').replace('Remove harmful statuses.','Cleanse debuffs.');
}
function readSave(): GameState { try { const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (isValidSave(data)) return data; } catch { /* damaged or unavailable local storage */ } return initialState(); }

export default function App() {
  const [motion,setMotion]=useState<BattleMotion|null>(null);
  const [ghosts,setGhosts]=useState<DefeatGhost[]>([]);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const tutorialSnapshot = useRef<GameState | null>(null);
  const [game, setGame] = useState<GameState>(readSave);
  const [menu, setMenu] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ uid: string; x: number; y: number; dx: number; dy: number; moved: boolean; w:number; h:number } | null>(null);
  const dragRef = useRef<typeof drag>(null);
  const [upgradePicked, setUpgradePicked] = useState(false);
  const [abilityFlash, setAbilityFlash] = useState('');
  const [passiveFlash, setPassiveFlash] = useState('');
  const [toast, setToast] = useState('');
  const [debug, setDebug] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(readPreferences);
  const theme = preferences.theme;
  const lastSoundEvents = useRef('');
  const lastScene = useRef('menu');
  const [storageWarning, setStorageWarning] = useState(false);
  const hero = HEROES[game.heroId];
  const encounter = ENCOUNTERS[game.encounter];
  const activeUid = drag?.uid || selected;
  const active = game.cards.find(c => c.uid === activeUid);
  const canContinue = game.screen !== 'menu' && game.screen !== 'select';
  const scene = menu ? 'menu' : `${game.screen}-${game.encounter}`;
  const inBattle = !menu && game.screen === 'battle';

  useEffect(() => {
    audioController.setScene(menu || game.screen === 'select' ? 'menu' : game.screen === 'battle' ? encounter.tier === 'normal' ? 'battle' : 'danger' : game.screen === 'victory' ? 'victory' : game.screen === 'defeat' ? 'defeat' : 'progression');
  }, [menu, game.screen, encounter.tier]);
  useEffect(() => { if (game.screen !== 'upgrade') setUpgradePicked(false); }, [game.screen]);
  useEffect(() => {
    const ability = game.events.find(e => e.kind === 'ability'); const passive = game.events.find(e => e.kind === 'passive');
    if (ability) setAbilityFlash(ability.label || 'Hero skill');
    if (passive) setPassiveFlash(passive.label || 'Passive triggered');
    const timer = window.setTimeout(() => { setAbilityFlash(''); setPassiveFlash(''); }, 1100);
    return () => clearTimeout(timer);
  }, [game.events]);
  const tutorialCard = game.hand.find(uid => { const c=game.cards.find(c=>c.uid===uid)!;return !!getCardEffect(c).damage && getCost(game,c)<=game.energy; }) ?? game.hand[0];
  function beginTutorial(state = game) { tutorialSnapshot.current = structuredClone(state); setGame(startRun(state.heroId,42)); setSelected(null); setMenu(false); setTutorialStep(0); }
  function finishTutorial() { if(tutorialSnapshot.current)setGame(tutorialSnapshot.current); tutorialSnapshot.current=null;setSelected(null);setAbilityFlash('');setPassiveFlash('');setTutorialStep(null);try{localStorage.setItem('card-game-prototype-tutorial-v1',JSON.stringify({tutorialCompleted:true}));}catch{} }
  function startAdventure(id: HeroId) { const next=startRun(id);setGame(next);setMenu(false);let done=false;try{done=JSON.parse(localStorage.getItem('card-game-prototype-tutorial-v1')||'{}').tutorialCompleted===true;}catch{}if(!done)beginTutorial(next); }
  function changeTheme(value: 'a' | 'b' | 'c' | 'd') { setPreferences(p => ({ ...p, theme: value })); }
  function setTips(value: boolean) { setPreferences(p => ({ ...p, tips: value })); }
  useEffect(() => { try { localStorage.setItem(PREF_KEY, JSON.stringify(preferences)); } catch { /* game remains playable when persistence is unavailable */ } }, [preferences]);
  useEffect(() => {
    document.body.classList.toggle('battle-active', inBattle);
    return () => document.body.classList.remove('battle-active');
  }, [inBattle]);
  useEffect(() => {
    if (lastScene.current === scene) return;
    lastScene.current = scene;
    if (!menu && game.screen === 'reward') playSfx('reveal');
    if (!menu && game.screen === 'victory') playSfx('victory');
    if (!menu && game.screen === 'defeat') playSfx('defeat');
  }, [scene, menu, game.screen]);
  useEffect(() => {
    const signature = game.events.map(e => e.id).join(',');
    if (signature === lastSoundEvents.current) return;
    lastSoundEvents.current = signature;
    if (game.events.some(e => e.kind === 'damage' && e.amount > 0)) playSfx('hit');
    if (game.events.some(e => e.kind === 'heal' && e.amount > 0)) playSfx('heal');
  }, [game.events]);

  useEffect(() => { if (canContinue && tutorialStep === null) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch { setStorageWarning(true); } } }, [game, canContinue, tutorialStep]);
  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(''), 2800); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { const listener = (e: KeyboardEvent) => { if (import.meta.env.DEV && (e.key === '`' || e.key === '~')) setDebug(v => !v); if (e.key === 'Escape') { setSelected(null); setShowDeck(false); setShowRules(false); setShowSettings(false); } }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener); }, []);

  function commit(action: (state: GameState) => GameState) {
    const next=action(game);
    if(theme==='c'&&inBattle){
      const defeated=game.enemies.filter(e=>e.hp>0&&next.enemies.find(n=>n.uid===e.uid)?.hp===0).flatMap(e=>{const node=document.querySelector<HTMLElement>('[data-target="'+e.uid+'"].actor-card');if(!node)return [];const r=node.getBoundingClientRect();return [{id:e.uid+'-'+next.serial,x:r.x,y:r.y,w:r.width,h:r.height,kind:e.defId}];});
      if(defeated.length)setGhosts(g=>[...g,...defeated]);
    }
    setGame(next);setSelected(null);
  }
  useEffect(()=>{if(!motion)return;const timer=setTimeout(()=>setMotion(null),620);return()=>clearTimeout(timer);},[motion]);
  useEffect(()=>{if(!ghosts.length)return;const timer=setTimeout(()=>setGhosts([]),650);return()=>clearTimeout(timer);},[ghosts]);
  useEffect(()=>{
    if(theme!=='c'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    for(const event of game.events.filter(e=>e.kind==='damage')){
      const node=document.querySelector<HTMLElement>('[data-target="'+event.target+'"].actor-card');if(!node)continue;
      const base=getComputedStyle(node).transform;const rest=base==='none'?'':base;
      node.animate([{transform:rest},{transform:rest+' translateX(-6px) rotate(-3deg)'},{transform:rest+' translateX(5px) rotate(2deg)'},{transform:rest}],{duration:280,easing:'ease-out'});
    }
  },[game.events,theme]);
  function animateAttack(source:string,target:string){
    if(theme!=='c'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const from=document.querySelector<HTMLElement>('[data-target="'+source+'"].actor-card'),to=document.querySelector<HTMLElement>('[data-target="'+target+'"].actor-card');
    if(!from||!to)return;const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),base=getComputedStyle(from).transform,rest=base==='none'?'':base;
    const x=Math.max(-44,Math.min(44,(b.x-a.x)*.18)),y=Math.max(-40,Math.min(40,(b.y-a.y)*.18));
    from.animate([{transform:rest},{transform:rest+' translate('+x+'px,'+y+'px) scale(1.06)',offset:.4},{transform:rest}],{duration:300,easing:'ease-out'});
  }
  function enemyTurn(){
    for(const enemy of game.enemies)if(enemy.hp>0&&enemy.intent.damage&&!enemy.statuses.freeze)animateAttack(enemy.uid,'hero');
    playSfx('turn');commit(endTurn);if(tutorialStep===4)setTutorialStep(5);
  }
  function heroActive(){
    const enemy=game.enemies.find(e=>e.hp>0);if(enemy)animateAttack('hero',enemy.uid);
    playSfx('play');commit(activateSkill);if(tutorialStep===3)setTutorialStep(4);
  }
  function playMotion(card:CardInstance,target:string){
    if(theme!=='c')return;
    const from=document.querySelector<HTMLElement>('[data-target="'+card.uid+'"]'),to=document.querySelector<HTMLElement>('[data-target="'+target+'"].actor-card')||document.querySelector<HTMLElement>('[data-target="'+target+'"]');
    if(!from||!to)return;const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),def=CARDS[card.defId];
    setMotion({id:performance.now(),x:a.x+a.width/2,y:a.y+a.height/2,dx:b.x+b.width/2-a.x-a.width/2,dy:b.y+b.height/2-a.y-a.height/2,kind:def.effect.damage?'attack':'drop',art:def.art||def.id,name:def.name,type:def.type});
    if(def.type==='rune'||def.type==='equipment')requestAnimationFrame(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;to.animate([{transform:'scale(1)'},{transform:'translateY(-8px) scale(1.06)'},{transform:'translateY(3px) scale(.97)'},{transform:'scale(1)'}],{duration:340,easing:'ease-out'});});
  }
  function useCard(uid: string, target: string) {
    if(tutorialStep !== null && !([1,2].includes(tutorialStep) && uid === tutorialCard && target === game.enemies.find(e=>e.hp>0)?.uid)) return;
    const card = game.cards.find(c => c.uid === uid);
    if (!card || !canTarget(game, card, target)) { setToast('That card needs a different target.'); return; }
    if (game.screen === 'battle' && getCost(game, card) > game.energy) { playSfx('invalid'); setToast('Out of Energy — End Turn to refill your bar.'); return; }
    playSfx(CARDS[card.defId].type === 'rune' ? 'rune' : CARDS[card.defId].type === 'equipment' ? 'equip' : 'play');
    if(CARDS[card.defId].effect.damage)animateAttack('hero',target);playMotion(card,target);commit(s => playCard(s, uid, target)); if(tutorialStep !== null)setTutorialStep(3);
  }
  function cardTap(uid: string) {
    if(tutorialStep !== null && !(tutorialStep === 1 && uid === tutorialCard))return;
    if(tutorialStep === 1)setTutorialStep(2);
    const selectedCard = game.cards.find(card => card.uid === selected);
    if (selectedCard && selectedCard.uid !== uid && CARDS[selectedCard.defId].type === 'rune') { useCard(selectedCard.uid, uid); return; }
    const tapped = game.cards.find(card => card.uid === uid);
    if (tapped && getCost(game, tapped) > game.energy) { playSfx('invalid'); setToast('Need more Energy? End Turn refills it to 3, or discard this card.'); }
    setSelected(v => v === uid ? null : uid);
  }
  function campCardTap(card: CardInstance) {
    if (active && CARDS[active.defId].type === 'rune' && active.uid !== card.uid) { useCard(active.uid, card.uid); return; }
    if (CARDS[card.defId].type === 'rune') { setSelected(value => value === card.uid ? null : card.uid); return; }
    if (upgradePicked || game.upgradesRemaining <= 0) return;
    if (card.upgraded) setToast('This card is already upgraded.');
    else if (!CARDS[card.defId].upgrade) setToast('This card has no upgrade.');
    else if (game.upgradesRemaining <= 0) setToast('No upgrades remaining at this stop.');
    else { playSfx('reward'); setUpgradePicked(true); commit(s => upgradeCard(s, card.uid)); }
  }
  function pointerDown(e: PointerEvent<HTMLButtonElement>, uid: string) {
    if (e.button !== 0 || game.screen !== 'battle') return;
    const card = game.cards.find(c => c.uid === uid);
    const selectedRune = game.cards.find(c => c.uid === selected && CARDS[c.defId].type === 'rune');
    if (card && getCost(game, card) > game.energy && !(selectedRune && canTarget(game, selectedRune, uid))) { playSfx('invalid'); setToast('Need more Energy? End Turn refills it to 3.'); return; }
    e.currentTarget.setPointerCapture(e.pointerId);
    const next = { uid, x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false, w:e.currentTarget.offsetWidth, h:e.currentTarget.offsetHeight };
    dragRef.current = next; setDrag(next);
  }
  function pointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current) return;
    const next = { ...dragRef.current, dx: e.clientX - dragRef.current.x, dy: e.clientY - dragRef.current.y };
    next.moved = Math.hypot(next.dx, next.dy) > 7;
    if (next.moved && !dragRef.current.moved) playSfx('drag');
    dragRef.current = next; setDrag(next);
  }
  function pointerUp(e: PointerEvent<HTMLButtonElement>, uid: string) {
    const current = dragRef.current; dragRef.current = null; setDrag(null);
    if (!current || !current.moved) { cardTap(uid); return; }
    const target = document.elementsFromPoint(e.clientX, e.clientY).map(el => el.closest<HTMLElement>('[data-target]')).find(el => el && el.dataset.target !== uid)?.dataset.target;
    if (target) { playSfx('drop'); useCard(uid, target); } else { playSfx('invalid'); setToast('Drop onto a glowing target, or click a card then a target.'); }
  }
  function valid(target: string) { return !!active && (game.screen !== 'battle' || getCost(game, active) <= game.energy) && canTarget(game, active, target); }
  function events(target: string) { return <div className="float-events" aria-hidden="true">{game.events.filter(event => event.target === target && !['ability', 'passive'].includes(event.kind)).map(event => <span key={event.id} className={`float-number ${event.kind}`}>{event.kind === 'damage' ? '−' : event.kind === 'heal' ? '+' : ''}{event.amount} {event.label || (event.kind === 'shield' ? 'Shield' : '')}</span>)}</div>; }
  function cardView(card: CardInstance, context: 'hand' | 'collection' | 'reward' = 'collection', onChoose?: () => void) {
    const def = CARDS[card.defId];
    if (!def) return null;
    const dragging = drag?.uid === card.uid && drag.moved;
    const fan=(game.hand.indexOf(card.uid)-(game.hand.length-1)/2);
    const fanStyle=context==='hand'?{'--fan-angle':Math.max(-10,Math.min(10,fan*2.7))+'deg','--fan-y':Math.min(18,Math.abs(fan)*5)+'px','--hand-index':game.hand.indexOf(card.uid)}:{};
    const style: CSSProperties = dragging ? { '--drag-transform': `translate(${drag.dx}px, ${drag.dy}px) rotate(${Math.max(-12, Math.min(12, drag.dx / 20))}deg) scale(1.1)`, zIndex: 100, pointerEvents: 'none', transition: 'none' } as CSSProperties : fanStyle as CSSProperties;
    const rune = card.rune && RUNES[card.rune];
    const campLocked = context === 'collection' && game.screen === 'upgrade' && def.type !== 'rune' && !(active && CARDS[active.defId].type === 'rune') && (upgradePicked || game.upgradesRemaining <= 0 || card.upgraded || !def.upgrade);
    const unaffordable = context === 'hand' && getCost(game, card) > game.energy;
    return <button key={card.uid} className={`playing-card ${def.type} ${def.rarity} ${campLocked ? 'upgrade-locked' : ''} ${unaffordable ? 'unaffordable' : ''} ${selected === card.uid ? 'selected' : ''} ${dragging ? 'dragging' : ''} ${valid(card.uid) ? 'valid-target' : ''} ${card.upgraded ? 'upgraded' : ''}`} style={style} data-target={context !== 'reward' ? card.uid : undefined} data-card-id={def.id} disabled={campLocked} aria-disabled={unaffordable || undefined} title={unaffordable ? 'Not enough Energy. End Turn to refill.' : undefined} onPointerEnter={() => playSfx('hover')}
      onPointerDown={context === 'hand' ? e => pointerDown(e, card.uid) : undefined} onPointerMove={context === 'hand' ? pointerMove : undefined} onPointerUp={context === 'hand' ? e => pointerUp(e, card.uid) : undefined} onPointerCancel={() => { dragRef.current = null; setDrag(null); }}
      onClick={context === 'hand' ? e => { if (e.detail === 0) cardTap(card.uid); } : onChoose} aria-label={`${def.name}${card.upgraded ? ' upgraded' : ''}, ${context === 'hand' ? getCost(game, card) : getCost({ ...game, firstSkill: true, firstSpell: true, gear: {} }, card)} energy. ${cardDescription(card)}${rune ? ` ${rune.name}: ${rune.description}` : ''}`}>
      <span className="energy-cost">{context === 'hand' ? getCost(game, card) : getCost({ ...game, firstSkill: true, firstSpell: true, gear: {} }, card)}</span>
      <span className="card-name">{def.name}{card.upgraded && <b> ✦</b>}</span>
      <CardArt id={def.art || def.id} type={def.type} theme={theme} />
      <span className="card-type">{def.type} · {def.element}</span>
      <span className="card-description" title={cardDescription(card)}>{inBattle && context === 'hand' ? handDescription(card) : cardDescription(card)}</span>
      {card.upgraded && <span className="upgrade-mark">✦ Upgraded</span>}
      {rune && <span className="rune-seal" title={rune.description}>◆ {rune.name}</span>}
      {unaffordable && <span className="unaffordable-hint">End Turn for Energy</span>}<span className="rarity-motif" aria-hidden="true">{def.rarity === 'epic' ? '✦ ✦ ✦' : def.rarity === 'rare' ? '◆ ◆' : '•'}</span><span className="card-footer">{def.rarity === 'common' ? '•' : def.rarity === 'rare' ? '◆' : '✦'}</span>
    </button>;
  }

  const header = <header className="game-header"><button className="brand" onClick={() => setMenu(true)} aria-label="Open main menu"><span className="brand-symbol">✦</span><span>LOCAL ADVENTURE<small>a little card adventure</small></span></button><div className="run-track" aria-label={`Encounter ${game.encounter + 1} of 4`}>{ENCOUNTERS.map((item, index) => <span key={item.name} className={`${index < game.encounter ? 'complete' : ''} ${index === game.encounter ? 'current' : ''}`} title={item.name}>{index < game.encounter ? '✓' : index === 3 ? '♛' : index === 2 ? '✦' : '⚑'}</span>)}</div><div className="header-controls"><label className="theme-control"><span>Art theme</span><select aria-label="Art theme" value={theme} onChange={e => changeTheme(e.target.value as 'a' | 'b' | 'c' | 'd')}><option value="a">A · Handmade</option><option value="b">B · Painted fantasy</option><option value="c">C · Cartoon quest</option><option value="d">D · Illustrated archive</option></select></label><button className="quiet-button" onClick={() => setShowRules(true)}>How to play</button><button className="quiet-button settings-button" onClick={() => setShowSettings(true)} aria-label="Open settings">♫ Settings</button></div></header>;

  return <div className={`game-shell screen-${menu ? 'menu' : game.screen} ${inBattle ? 'is-battle' : ''}`} data-theme={theme} data-environment={ENVIRONMENTS[game.encounter]} onPointerDownCapture={() => { void audioController.unlock(); }} onKeyDownCapture={() => { void audioController.unlock(); }} onClickCapture={e => { const button = (e.target as HTMLElement).closest('button'); if (button && !button.matches('.playing-card, .actor-card, .end-turn-button')) playSfx('click'); }}><div className="forest-decoration left"/><div className="forest-decoration right"/>
    {theme==='c'&&inBattle&&<BattleWorld encounter={game.encounter} key={game.encounter}/>}
    {!menu && header}<div className="screen-stage" key={scene}>{menu ? <main className="menu-screen"><div className="menu-controls"><label className="theme-control"><span>Art theme</span><select aria-label="Art theme" value={theme} onChange={e => changeTheme(e.target.value as 'a' | 'b' | 'c' | 'd')}><option value="a">A · Handmade</option><option value="b">B · Painted fantasy</option><option value="c">C · Cartoon quest</option><option value="d">D · Illustrated archive</option></select></label><button className="quiet-button" onClick={() => setShowSettings(true)} aria-label="Open settings">♫ Settings</button></div><div className="menu-copy"><div className="eyebrow">AN ORIGINAL CARD ADVENTURE</div><h1>A path through<br/><em>the wilds</em><span>✦</span></h1><p className="menu-hook">Build your hero. Bend your cards with Runes.<br/>Brave four encounters to break the Tree King.</p><button className="primary-button" onClick={() => { setMenu(false); setGame(g => ({ ...g, screen: 'select' })); }}>New adventure <span>→</span></button>{canContinue && <button className="secondary-button" onClick={() => setMenu(false)}>Continue adventure · {hero.name}</button>}<button className="text-button" onClick={() => setShowRules(true)}>How to play · a quick field guide</button><small className="local-note">LOCAL PROTOTYPE · YOUR RUN SAVES ON THIS DEVICE</small></div><div className="menu-illustration"><div className="sun-disc"/><div className="menu-hero"><Portrait theme={theme} kind="warrior"/></div><div className="menu-mage"><Portrait theme={theme} kind="mage"/></div><span className="floating-leaf leaf-one">✦</span><span className="floating-leaf leaf-two">✦</span><div className="menu-stone">THE FOREST<br/><b>IS CALLING.</b></div></div></main> : <>
      {game.screen === 'select' && <main className="selection-screen"><div className="screen-title"><span className="eyebrow">EVERY ADVENTURE STARTS SOMEWHERE</span><h1>Choose your hero</h1><p>Different talents. Same very questionable path.</p></div><div className="hero-choices">{Object.values(HEROES).map(choice => <button key={choice.id} className={`hero-choice ${choice.id}`} onClick={() => startAdventure(choice.id as HeroId)}><span className="hero-role">{choice.title}</span><Portrait theme={theme} kind={choice.id}/><h2>{choice.name}</h2><div className="choice-stats"><span>♥ {choice.hp} HP</span><span>⚔ {choice.attack} Attack</span><span>▰ {choice.defense} Defense</span><span>⚡ {choice.maxEnergy} Energy</span></div><p>{choice.description}</p><div className="passive"><b>YOUR LITTLE ADVANTAGE</b>{choice.passive}</div><span className="choose-hero">Take the path →</span></button>)}</div></main>}

      {game.screen === 'battle' && <main className="battle-board">{(encounter?.tier === "elite" || encounter?.tier === "boss") && <div className={`encounter-banner ${encounter.tier}`} aria-hidden="true"><span>{encounter.tier === "boss" ? "♛" : "✦"}</span>{encounter.tier === "boss" ? "THE TREE KING AWAITS" : "AN ELITE GUARDS THE PATH"}</div>}<aside className="battle-left" aria-label="Hero controls"><div className="energy-station">{theme!=='c'&&<EnergyBar current={game.energy} max={game.maxEnergy} />}<div className="hero-abilities"><button className="ability-button" disabled={!activeSkillAvailable(game)} title={CHARACTER_SKILLS[game.heroId].description} aria-label={CHARACTER_SKILLS[game.heroId].name} onClick={heroActive}><span>{CHARACTER_SKILLS[game.heroId].icon}</span><b>{CHARACTER_SKILLS[game.heroId].name}</b><small>{game.turn < (game.activeReadyTurn ?? 0) ? `Ready in ${(game.activeReadyTurn ?? 0) - game.turn} turns left` : game.energy < 1 ? 'Need 1 Energy' : '1 ⚡ · CD 3'}</small></button><span className={`passive-skill ${passiveFlash ? 'passive-flash' : ''}`} tabIndex={0} title={hero.passive} aria-label={`Passive: ${CHARACTER_SKILLS[game.heroId].passiveName}. ${hero.passive}`}><b>{CHARACTER_SKILLS[game.heroId].passiveIcon} {CHARACTER_SKILLS[game.heroId].passiveName}</b><small>{passiveFlash ? 'Triggered!' : 'Automatic · each turn'}</small></span></div><div className="passive-tag" title={hero.passive}>{game.heroId === 'warrior' ? !game.firstSkill ? 'First Skill discount ready' : 'Skill discount used' : !game.firstSpell ? 'First Spell bonus ready' : 'Spell bonus used'}</div></div><GlobalBuffBar game={game}/><div className="side-actions"><button onClick={() => setShowDeck(true)}><span className="hud-symbol" aria-hidden="true">▣</span> View Deck ({game.cards.length})</button><button onClick={() => beginTutorial()}><span className="hud-symbol" aria-hidden="true">?</span> Tutorial</button></div>{selected && <div className="selection-actions"><button onClick={() => setSelected(null)}>Cancel</button><button onClick={() => commit(s => discardCard(s, selected))}>Discard card</button></div>}<footer className="battle-footer"><span>▣ Draw {game.deck.length} · Discard {game.discard.length}</span><span className="last-log" title={game.log[game.log.length - 1]} aria-live="polite">{game.log[game.log.length - 1]}</span></footer></aside><aside className="battle-right" aria-label="Turn controls"><div className="equipment-slots">{(['weapon', 'armor'] as const).map(slot => { const gear = game.cards.find(c => c.uid === game.gear[slot]); return <div key={slot} className={`gear-slot ${gear ? 'equipped' : ''}`} data-target="hero" onClick={() => selected && useCard(selected, 'hero')} title={gear ? `${CARDS[gear.defId].description}${gear.rune ? ` · ${RUNES[gear.rune].description}` : ''}` : 'Drag Equipment onto your hero to equip. Replaces existing gear in its slot.'}><span>{slot === 'weapon' ? '⚔' : '▰'}</span><small>{slot === 'weapon' ? 'Weapon' : 'Armor / Accessory'}</small><b>{gear ? CARDS[gear.defId].name : 'Empty slot'}</b>{gear?.rune && <em>◆ {RUNES[gear.rune].name}</em>}</div>; })}</div><div className="side-actions"><button onClick={() => setShowSettings(true)}><span className="hud-symbol" aria-hidden="true">⚙</span> Settings</button><button className="pause-control" aria-label="Pause" title="Pause" onClick={() => setMenu(true)}>Ⅱ</button></div>
        {theme!=='c'&&<div className="turn-station"><button className="end-turn-button" onClick={enemyTurn}>End turn <span>→</span></button><span>Enemies act next</span></div>}</aside><div className="encounter-heading"><span className="eyebrow">{encounter?.tier} ENCOUNTER · {game.encounter + 1} / 4</span><h1>{encounter?.name}</h1><span className="turn-counter">Turn {game.turn}</span></div>
        <section className="enemy-row" aria-label="Enemies">{theme==='c'&&<BattlePlatform/>}{game.enemies.map(enemy => { const defId = enemy.defId; return <div key={enemy.uid} className={`enemy-wrap ${enemy.hp <= 0 ? 'fallen' : ''}`}><div className={`intent ${enemy.intent.kind}`} title={`Next turn: ${enemy.intent.label}${enemy.intent.damage ? `, ${enemy.intent.damage} damage before modifiers` : ''}`}>{enemy.statuses.freeze ? '❄ Frozen · skips action' : <>{enemy.intent.kind === 'attack' || enemy.intent.kind === 'special' ? '⚔' : enemy.intent.kind === 'defend' ? '▰' : '✦'} {enemy.intent.label}</>}</div><div className="actor-with-effects"><StatusIcons statuses={enemy.statuses} shield={enemy.shield}/><button className={`actor-card enemy-card ${valid(enemy.uid) ? 'valid-target' : ''} ${enemy.phase > 1 ? 'enraged' : ''}`} data-target={enemy.uid} onClick={() => selected ? useCard(selected, enemy.uid) : setToast('Select a card first, then click an enemy.')} disabled={enemy.hp <= 0} aria-label={`Target ${ENEMIES[defId].name}. ${enemy.hp} health. ${enemy.intent.label}`}><span className="actor-title">{ENEMIES[defId].name}</span><Portrait theme={theme} kind={defId}/><div className="hp-bar"><span style={{ width: `${Math.max(0, enemy.hp / enemy.maxHp * 100)}%` }}/><b>♥ {enemy.hp} / {enemy.maxHp}</b></div>{enemy.phase > 1 && <span className="phase-label">PHASE II · ENRAGED</span>}{game.events.filter(e=>e.target===enemy.uid&&e.kind==='damage').map(e=><i key={e.id} className="combat-flash" aria-hidden="true"/>)}{events(enemy.uid)}</button></div></div>; })}</section>
        <section className="player-zone" aria-label="Your hero">{theme==='c'&&<BattlePlatform hero/>}<div className="hero-and-gear"><div className="actor-with-effects"><StatusIcons statuses={game.statuses} shield={game.shield} side="left"/><button className={`actor-card player-card ${valid('hero') ? 'valid-target' : ''}`} data-target="hero" onClick={() => selected ? useCard(selected, 'hero') : setToast(hero.passive)} aria-label={`Your ${hero.name}. ${game.hp} health. Target with Shield, Heal, or Equipment.`}><span className="actor-title">{hero.name}</span><Portrait theme={theme} kind={game.heroId}/><div className="hp-bar"><span style={{ width: `${Math.max(0, game.hp / game.maxHp * 100)}%` }}/><b>♥ {game.hp} / {game.maxHp}</b></div>{game.events.filter(e=>e.target==='hero'&&e.kind==='damage').map(e=><i key={e.id} className="combat-flash" aria-hidden="true"/>)}{events('hero')}</button></div></div>
          </section>

        {theme==='c'&&<><div className="hand-energy"><EnergyBar current={game.energy} max={game.maxEnergy} /></div><div className="turn-station"><button className="end-turn-button" onClick={enemyTurn}>End turn <span>→</span></button><span>Enemies act next</span></div></>}<section className="hand" aria-label="Cards in your hand">{game.hand.map(uid => game.cards.find(c => c.uid === uid)).filter((c): c is CardInstance => !!c).map(card => cardView(card, 'hand'))}{game.hand.length === 0 && <p className="empty-hand">An empty hand. End your turn to draw more cards.</p>}</section>

      </main>}

      {game.screen === 'reward' && <main className="reward-screen"><RewardChest /><div className="screen-title"><span className="eyebrow">VICTORY SPOILS · ENCOUNTER {game.encounter + 1} CLEARED</span><h1>Spoils of the wilds</h1><p>Choose one gift for the road ahead.</p></div><div className="reward-choices reward-reveal">{game.rewards.map(reward => <div className="reward-choice" key={reward.id}>{reward.cardId ? cardView({ uid: reward.id, defId: reward.cardId, upgraded: false }, 'reward', () => { playSfx("reward"); commit(s => chooseReward(s, reward.id)); }) : <button className="special-reward" onClick={() => { playSfx("reward"); commit(s => chooseReward(s, reward.id)); }}><span>{reward.kind === 'heal' ? '♥' : '✦'}</span><h2>{reward.name}</h2><p>{reward.description}</p><b>Choose this gift →</b></button>}<small>{reward.description}</small></div>)}</div></main>}

      {(game.screen === 'progress' || game.screen === 'upgrade') && <main className="progress-screen"><div className="screen-title"><span className="eyebrow">TAKE A BREATHER</span><h1>{game.screen === 'upgrade' ? 'A sharper little deck' : 'The path ahead'}</h1><p>{game.screen === 'upgrade' ? upgradePicked || game.upgradesRemaining <= 0 ? 'Upgrade chosen. Click Back to the path to continue.' : `Choose a card to upgrade. ${game.upgradesRemaining} upgrade${game.upgradesRemaining === 1 ? '' : 's'} available.` : `${hero.name} · ${game.hp} / ${game.maxHp} HP · ${game.cards.length} cards in your deck`}</p></div>
        {game.screen === 'progress' ? <><div className="journey-path">{ENCOUNTERS.map((item, index) => <div key={item.name} className={`journey-stop ${index <= game.encounter ? 'complete' : ''} ${index === game.encounter + 1 ? 'next' : ''}`}><span>{index <= game.encounter ? '✓' : index === 3 ? '♛' : index === 2 ? '✦' : '⚑'}</span><b>{item.name}</b><small>{index <= game.encounter ? 'CLEARED' : index === game.encounter + 1 ? 'UP NEXT' : item.tier.toUpperCase()}</small></div>)}</div><section className="boon-choices" aria-label="Forest boons"><h2>Choose a forest boon</h2><p>One permanent bonus at each camp. Applies to the whole run.</p>{Object.entries(GLOBAL_BUFFS).map(([id, buff]) => <button key={id} disabled={game.boonEncounter === game.encounter || (game.globalBuffs ?? []).includes(id as GlobalBuffId)} onClick={() => commit(s => chooseGlobalBuff(s, id as GlobalBuffId))} title={buff.description}><b>{buff.icon} {buff.name}</b><span>{buff.description}</span></button>)}</section><GlobalBuffBar game={game}/><div className="progress-actions"><button className="primary-button" onClick={() => commit(nextBattle)}>Enter {ENCOUNTERS[game.encounter + 1]?.tier === 'boss' ? 'the boss battle' : 'the next battle'} →</button><button className="secondary-button" onClick={() => commit(s => ({ ...s, screen: 'upgrade' }))}>Tend your deck {game.upgradesRemaining > 0 && <b>· {game.upgradesRemaining} upgrade available</b>}</button></div><p className="small-hint">Between fights, upgrade your cards and attach, replace, or remove runes.</p></> : <><div className="camp-instructions">{active && CARDS[active.defId].type === 'rune' ? <>{CARDS[active.defId].name}: click a glowing card to attach or replace its rune. <button className="text-button" onClick={() => setSelected(null)}>Cancel</button></> : upgradePicked || game.upgradesRemaining <= 0 ? 'Upgrade complete. Click Back to the path to continue.' : 'Click a card to upgrade it. To attach a rune, click the rune, then a compatible card.'}</div><div className="camp-controls">{upgradePicked && game.upgradesRemaining > 0 && <button className="secondary-button" onClick={() => setUpgradePicked(false)}>Use extra upgrade ({game.upgradesRemaining} left)</button>}<button className={`primary-button ${upgradePicked || game.upgradesRemaining <= 0 ? 'next-action' : ''}`} onClick={() => commit(s => ({ ...s, screen: 'progress' }))}>Back to the path →</button></div><div className="collection-grid">{game.cards.map(card => <div className="collection-item" key={card.uid}>{cardView(card, 'collection', () => campCardTap(card))}{card.rune && <button className="remove-rune" onClick={() => commit(s => removeRune(s, card.uid))}>Remove {RUNES[card.rune].name}</button>}</div>)}</div></>}
      </main>}

      {(game.screen === 'victory' || game.screen === 'defeat') && <main className={`ending-screen ${game.screen}`}><div className="ending-art"><Portrait theme={theme} kind={game.heroId}/><span>{game.screen === 'victory' ? '✦' : '☂'}</span></div><span className="eyebrow">{game.screen === 'victory' ? 'THE WILDS REMEMBER YOUR NAME' : 'THE FOREST KEEPS ITS SECRETS'}</span><h1>{game.screen === 'victory' ? 'A hero comes home.' : 'A brave little attempt.'}</h1><p>{game.screen === 'victory' ? 'The boss is beaten. Your handful of cards became something mighty.' : 'Even the best adventures take a few tries. A new path is waiting.'}</p><div className="ending-stats"><span><b>{game.battlesWon}</b> battles won</span><span><b>{game.cards.length}</b> cards collected</span><span><b>{game.turn}</b> final battle turns</span></div><button className="primary-button" onClick={() => { setGame(initialState()); setGame(g => ({ ...g, screen: 'select' })); setSelected(null); }}>Another adventure →</button><button className="text-button" onClick={() => setMenu(true)}>Main menu</button></main>}
    </>}</div>

    {theme==='c'&&<BattleEffects motion={motion} ghosts={ghosts} theme={theme} drag={drag?.moved&&active?{x:drag.x+drag.dx,y:drag.y+drag.dy,w:drag.w,h:drag.h,angle:Math.max(-12,Math.min(12,drag.dx/20)),name:CARDS[active.defId].name,type:CARDS[active.defId].type,art:CARDS[active.defId].art||active.defId,rarity:CARDS[active.defId].rarity,cost:getCost(game,active),description:handDescription(active)}:null}/>}
    <div className="rotate-prompt"><b>↻</b><h2>Rotate device to play</h2><p>Battle is designed for landscape.</p></div>
    {tutorialStep !== null && <GuidedTutorial step={tutorialStep} selector={tutorialStep===0?'.energy-meter':tutorialStep===1?` .hand [data-target="${tutorialCard}"]`:tutorialStep===2?'.enemy-card:not(:disabled)':tutorialStep===3?'.ability-button':tutorialStep===4?'.end-turn-button':tutorialStep===5?'.enemy-wrap:not(.fallen) .intent':'.player-card'} onNext={() => tutorialStep===6?finishTutorial():setTutorialStep(tutorialStep+1)}/>}
    {abilityFlash && !menu && <div className="ability-overlay" role="status"><span>{CHARACTER_SKILLS[game.heroId].icon}</span><strong>{abilityFlash}</strong></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
    {storageWarning && <span className="storage-warning">Saving unavailable in this browser.</span>}
    {showDeck && <div className="modal-backdrop" onClick={() => setShowDeck(false)}><section className="paper-modal deck-modal" onClick={e => e.stopPropagation()} aria-modal="true" role="dialog" aria-label="Your deck"><button className="close-button" aria-label="Close deck" onClick={() => setShowDeck(false)}>×</button><h2>Your trusty deck</h2><p>Attached runes last for this adventure. Upgraded cards are marked ✦.</p><div className="collection-grid">{game.cards.map(card => cardView(card))}</div></section></div>}
    {showRules && <div className="modal-backdrop" onClick={() => setShowRules(false)}><div className="modal-mount" onClick={e => e.stopPropagation()}><Tutorial theme={theme} tips={preferences.tips} onTipsChange={setTips} onClose={() => setShowRules(false)} onSkip={() => { setTips(false); setShowRules(false); }}/></div></div>}
    {showSettings && <div className="modal-backdrop" onClick={() => setShowSettings(false)}><div className="modal-mount" onClick={e => e.stopPropagation()}><Settings theme={theme} onThemeChange={changeTheme} onClose={() => setShowSettings(false)}/></div></div>}
    {debug && import.meta.env.DEV && <aside className="debug-panel"><b>DEVELOPER TOOLS · ~ to hide</b>{(['restart', 'energy', 'heal', 'cards', 'boss', 'win', 'lose'] as DebugAction[]).map(action => <button key={action} onClick={() => { commit(s => debugAction(s, action)); setMenu(false); }}>{action}</button>)}<button onClick={() => { try { localStorage.removeItem(SAVE_KEY); } catch { setStorageWarning(true); } setGame(initialState()); setMenu(true); setSelected(null); }}>Clear local save</button><small>Screen {game.screen} · seed {game.seed}</small><div className="debug-log">{game.log.slice(-8).map((line, i) => <p key={i}>{line}</p>)}</div></aside>}
  </div>;
}

function GlobalBuffBar({ game }: { game: GameState }) { return <div className="global-buffs" aria-label="Global buffs">{(game.globalBuffs ?? []).length ? game.globalBuffs!.map(id => <span className="buff-icon" tabIndex={0} key={id} title={GLOBAL_BUFFS[id].description} aria-label={`${GLOBAL_BUFFS[id].name}: ${GLOBAL_BUFFS[id].description}`}>{GLOBAL_BUFFS[id].icon}<span>{GLOBAL_BUFFS[id].name}</span></span>) : <span>No boons yet · earned at camp</span>}</div>; }
