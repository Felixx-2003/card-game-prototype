import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { CARDS, HEROES, RUNES, ENCOUNTERS, ENEMIES, STATUS_RULES } from './data';
import { initialState, startRun, playCard, endTurn, nextBattle, chooseReward, upgradeCard, removeRune, getCost, canTarget, debugAction, isValidSave, discardCard, getCardEffect } from './engine';
import type { GameState, CardInstance, HeroId, Statuses, DebugAction } from './types';
import { Portrait, CardArt } from './Art';

const SAVE_KEY = 'card-game-prototype-v1';
const statusHelp: Record<string, string> = Object.fromEntries(Object.entries(STATUS_RULES).filter(([key]) => key !== 'shield').map(([key, text]) => [key, `${key[0].toUpperCase()}${key.slice(1)}: ${text}`]));
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
function readSave(): GameState { try { const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (isValidSave(data)) return data; } catch { /* damaged or unavailable local storage */ } return initialState(); }

function StatusPips({ statuses, shield = 0 }: { statuses: Statuses; shield?: number }) {
  return <div className="status-pips">{shield > 0 && <span className="shield-pip" title="Shield absorbs damage, then expires at the start of the next turn.">▰ {shield}</span>}{Object.entries(statuses).filter(([, n]) => n! > 0).map(([key, value]) => <span key={key} className={`status-${key}`} title={statusHelp[key]}>{key} {value}</span>)}</div>;
}

export default function App() {
  const [game, setGame] = useState<GameState>(readSave);
  const [menu, setMenu] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ uid: string; x: number; y: number; dx: number; dy: number; moved: boolean } | null>(null);
  const dragRef = useRef<typeof drag>(null);
  const [toast, setToast] = useState('');
  const [debug, setDebug] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const hero = HEROES[game.heroId];
  const encounter = ENCOUNTERS[game.encounter];
  const activeUid = drag?.uid || selected;
  const active = game.cards.find(c => c.uid === activeUid);
  const canContinue = game.screen !== 'menu' && game.screen !== 'select';

  useEffect(() => { if (canContinue) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch { setStorageWarning(true); } } }, [game, canContinue]);
  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(''), 2800); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { const listener = (e: KeyboardEvent) => { if (import.meta.env.DEV && (e.key === '`' || e.key === '~')) setDebug(v => !v); if (e.key === 'Escape') { setSelected(null); setShowDeck(false); setShowRules(false); } }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener); }, []);

  function commit(action: (state: GameState) => GameState) { setGame(previous => action(previous)); setSelected(null); }
  function useCard(uid: string, target: string) {
    const card = game.cards.find(c => c.uid === uid);
    if (!card || !canTarget(game, card, target)) { setToast('That card needs a different target.'); return; }
    if (game.screen === 'battle' && getCost(game, card) > game.energy) { setToast('Not enough energy. End your turn to refill.'); return; }
    commit(s => playCard(s, uid, target));
  }
  function cardTap(uid: string) {
    const selectedCard = game.cards.find(card => card.uid === selected);
    if (selectedCard && selectedCard.uid !== uid && CARDS[selectedCard.defId].type === 'rune') { useCard(selectedCard.uid, uid); return; }
    setSelected(v => v === uid ? null : uid);
  }
  function campCardTap(card: CardInstance) {
    if (active && CARDS[active.defId].type === 'rune' && active.uid !== card.uid) { useCard(active.uid, card.uid); return; }
    if (CARDS[card.defId].type === 'rune') { setSelected(value => value === card.uid ? null : card.uid); return; }
    if (card.upgraded) setToast('This card is already upgraded.');
    else if (!CARDS[card.defId].upgrade) setToast('This card has no upgrade.');
    else if (game.upgradesRemaining <= 0) setToast('No upgrades remaining at this stop.');
    else commit(s => upgradeCard(s, card.uid));
  }
  function pointerDown(e: PointerEvent<HTMLButtonElement>, uid: string) {
    if (e.button !== 0 || game.screen !== 'battle') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const next = { uid, x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false };
    dragRef.current = next; setDrag(next);
  }
  function pointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current) return;
    const next = { ...dragRef.current, dx: e.clientX - dragRef.current.x, dy: e.clientY - dragRef.current.y };
    next.moved = Math.hypot(next.dx, next.dy) > 7;
    dragRef.current = next; setDrag(next);
  }
  function pointerUp(e: PointerEvent<HTMLButtonElement>, uid: string) {
    const current = dragRef.current; dragRef.current = null; setDrag(null);
    if (!current || !current.moved) { cardTap(uid); return; }
    const target = document.elementsFromPoint(e.clientX, e.clientY).map(el => el.closest<HTMLElement>('[data-target]')).find(el => el && el.dataset.target !== uid)?.dataset.target;
    if (target) useCard(uid, target); else setToast('Drop onto a glowing target, or click a card then a target.');
  }
  function valid(target: string) { return !!active && (game.screen !== 'battle' || getCost(game, active) <= game.energy) && canTarget(game, active, target); }
  function events(target: string) { return <div className="float-events" aria-hidden="true">{game.events.filter(event => event.target === target).map(event => <span key={event.id} className={`float-number ${event.kind}`}>{event.kind === 'damage' ? '−' : event.kind === 'heal' ? '+' : ''}{event.amount} {event.label || (event.kind === 'shield' ? 'Shield' : '')}</span>)}</div>; }
  function cardView(card: CardInstance, context: 'hand' | 'collection' | 'reward' = 'collection', onChoose?: () => void) {
    const def = CARDS[card.defId];
    if (!def) return null;
    const dragging = drag?.uid === card.uid && drag.moved;
    const style: CSSProperties = dragging ? { '--drag-transform': `translate(${drag.dx}px, ${drag.dy}px) rotate(${Math.max(-12, Math.min(12, drag.dx / 20))}deg) scale(1.1)`, zIndex: 100, pointerEvents: 'none', transition: 'none' } as CSSProperties : {};
    const rune = card.rune && RUNES[card.rune];
    return <button key={card.uid} className={`playing-card ${def.type} ${def.rarity} ${selected === card.uid ? 'selected' : ''} ${dragging ? 'dragging' : ''} ${valid(card.uid) ? 'valid-target' : ''} ${card.upgraded ? 'upgraded' : ''}`} style={style} data-target={context !== 'reward' ? card.uid : undefined} data-card-id={def.id}
      onPointerDown={context === 'hand' ? e => pointerDown(e, card.uid) : undefined} onPointerMove={context === 'hand' ? pointerMove : undefined} onPointerUp={context === 'hand' ? e => pointerUp(e, card.uid) : undefined} onPointerCancel={() => { dragRef.current = null; setDrag(null); }}
      onClick={context === 'hand' ? e => { if (e.detail === 0) cardTap(card.uid); } : onChoose} aria-label={`${def.name}${card.upgraded ? ' upgraded' : ''}, ${context === 'hand' ? getCost(game, card) : getCost({ ...game, firstSkill: true, firstSpell: true, gear: {} }, card)} energy. ${cardDescription(card)}${rune ? ` ${rune.name}: ${rune.description}` : ''}`}>
      <span className="energy-cost">{context === 'hand' ? getCost(game, card) : getCost({ ...game, firstSkill: true, firstSpell: true, gear: {} }, card)}</span>
      <span className="card-name">{def.name}{card.upgraded && <b> ✦</b>}</span>
      <CardArt id={def.art || def.id} type={def.type} />
      <span className="card-type">{def.type} · {def.element}</span>
      <span className="card-description">{cardDescription(card)}</span>
      {card.upgraded && <span className="upgrade-mark">✦ Upgraded</span>}
      {rune && <span className="rune-seal" title={rune.description}>◆ {rune.name}</span>}
      <span className="card-footer">{def.rarity === 'common' ? '•' : def.rarity === 'rare' ? '◆' : '✦'}</span>
    </button>;
  }

  const header = <header className="game-header"><button className="brand" onClick={() => setMenu(true)} aria-label="Open main menu"><span className="brand-symbol">✦</span><span>LOCAL ADVENTURE<small>a little card adventure</small></span></button><div className="run-track" aria-label={`Encounter ${game.encounter + 1} of 4`}>{ENCOUNTERS.map((item, index) => <span key={item.name} className={`${index < game.encounter ? 'complete' : ''} ${index === game.encounter ? 'current' : ''}`} title={item.name}>{index < game.encounter ? '✓' : index === 3 ? '♛' : index === 2 ? '✦' : '⚑'}</span>)}</div><button className="quiet-button" onClick={() => setShowRules(true)}>How to play</button></header>;

  return <div className="game-shell"><div className="forest-decoration left"/><div className="forest-decoration right"/>
    {menu ? <main className="menu-screen"><div className="menu-copy"><div className="eyebrow">AN ORIGINAL CARD ADVENTURE</div><h1>A path through<br/><em>the wilds</em><span>✦</span></h1><p>A brave little hero.<br/>A handful of cards.<br/>A forest full of trouble.</p><button className="primary-button" onClick={() => { setMenu(false); setGame(g => ({ ...g, screen: 'select' })); }}>New adventure <span>→</span></button>{canContinue && <button className="secondary-button" onClick={() => setMenu(false)}>Continue adventure · {hero.name}</button>}<button className="text-button" onClick={() => setShowRules(true)}>Learn the ropes</button><small className="local-note">LOCAL PROTOTYPE · YOUR RUN SAVES ON THIS DEVICE</small></div><div className="menu-illustration"><div className="sun-disc"/><div className="menu-hero"><Portrait kind="warrior"/></div><div className="menu-mage"><Portrait kind="mage"/></div><span className="floating-leaf leaf-one">✦</span><span className="floating-leaf leaf-two">✦</span><div className="menu-stone">THE FOREST<br/><b>IS CALLING.</b></div></div></main> : <>
      {header}
      {game.screen === 'select' && <main className="selection-screen"><div className="screen-title"><span className="eyebrow">EVERY ADVENTURE STARTS SOMEWHERE</span><h1>Choose your hero</h1><p>Different talents. Same very questionable path.</p></div><div className="hero-choices">{Object.values(HEROES).map(choice => <button key={choice.id} className={`hero-choice ${choice.id}`} onClick={() => { commit(() => startRun(choice.id as HeroId)); setMenu(false); }}><span className="hero-role">{choice.title}</span><Portrait kind={choice.id}/><h2>{choice.name}</h2><div className="choice-stats"><span>♥ {choice.hp} HP</span><span>⚔ {choice.attack} Attack</span><span>▰ {choice.defense} Defense</span><span>⚡ {choice.maxEnergy} Energy</span></div><p>{choice.description}</p><div className="passive"><b>YOUR LITTLE ADVANTAGE</b>{choice.passive}</div><span className="choose-hero">Take the path →</span></button>)}</div></main>}

      {game.screen === 'battle' && <main className="battle-board"><div className="encounter-heading"><span className="eyebrow">{encounter?.tier} ENCOUNTER · {game.encounter + 1} / 4</span><h1>{encounter?.name}</h1><span className="turn-counter">Turn {game.turn}</span></div>
        <section className="enemy-row" aria-label="Enemies">{game.enemies.map(enemy => { const defId = enemy.defId; return <div key={enemy.uid} className={`enemy-wrap ${enemy.hp <= 0 ? 'fallen' : ''}`}><div className={`intent ${enemy.intent.kind}`} title={`Next turn: ${enemy.intent.label}${enemy.intent.damage ? `, ${enemy.intent.damage} damage before modifiers` : ''}`}>{enemy.statuses.freeze ? '❄ Frozen · skips action' : <>{enemy.intent.kind === 'attack' || enemy.intent.kind === 'special' ? '⚔' : enemy.intent.kind === 'defend' ? '▰' : '✦'} {enemy.intent.label}</>}</div><button className={`actor-card enemy-card ${valid(enemy.uid) ? 'valid-target' : ''} ${enemy.phase > 1 ? 'enraged' : ''}`} data-target={enemy.uid} onClick={() => selected ? useCard(selected, enemy.uid) : setToast('Select a card first, then click an enemy.')} disabled={enemy.hp <= 0} aria-label={`Target ${ENEMIES[defId].name}. ${enemy.hp} health. ${enemy.intent.label}`}><span className="actor-title">{ENEMIES[defId].name}</span><Portrait kind={defId}/><div className="hp-bar"><span style={{ width: `${Math.max(0, enemy.hp / enemy.maxHp * 100)}%` }}/><b>♥ {enemy.hp} / {enemy.maxHp}</b></div><StatusPips statuses={enemy.statuses} shield={enemy.shield}/>{enemy.phase > 1 && <span className="phase-label">PHASE II · ENRAGED</span>}{events(enemy.uid)}</button></div>; })}</section>
        <section className="player-zone" aria-label="Your hero"><div className="energy-station"><span className="energy-orb">{game.energy}<small>/ {game.maxEnergy}</small></span><b>ENERGY</b><span>Refills each turn</span><div className="passive-tag" title={hero.passive}>{game.heroId === 'warrior' ? !game.firstSkill ? 'First Skill discount ready' : 'Skill discount used' : !game.firstSpell ? 'First Spell bonus ready' : 'Spell bonus used'}</div></div>
          <div className="hero-and-gear"><button className={`actor-card player-card ${valid('hero') ? 'valid-target' : ''}`} data-target="hero" onClick={() => selected ? useCard(selected, 'hero') : setToast(hero.passive)} aria-label={`Your ${hero.name}. ${game.hp} health. Target with Shield, Heal, or Equipment.`}><span className="actor-title">{hero.name}</span><Portrait kind={game.heroId}/><div className="hp-bar"><span style={{ width: `${Math.max(0, game.hp / game.maxHp * 100)}%` }}/><b>♥ {game.hp} / {game.maxHp}</b></div><StatusPips statuses={game.statuses} shield={game.shield}/>{events('hero')}</button><div className="equipment-slots">{(['weapon', 'armor'] as const).map(slot => { const gear = game.cards.find(c => c.uid === game.gear[slot]); return <div key={slot} className={`gear-slot ${gear ? 'equipped' : ''}`} data-target="hero" onClick={() => selected && useCard(selected, 'hero')} title={gear ? `${CARDS[gear.defId].description}${gear.rune ? ` · ${RUNES[gear.rune].description}` : ''}` : 'Drag Equipment onto your hero to equip. Replaces existing gear in its slot.'}><span>{slot === 'weapon' ? '⚔' : '▰'}</span><small>{slot === 'weapon' ? 'Weapon' : 'Armor / Accessory'}</small><b>{gear ? CARDS[gear.defId].name : 'Empty slot'}</b>{gear?.rune && <em>◆ {RUNES[gear.rune].name}</em>}</div>; })}</div></div>
          <div className="turn-station"><button className="end-turn-button" onClick={() => commit(endTurn)}>End turn <span>→</span></button><span>Enemies act next</span><button className="text-button" onClick={() => setShowDeck(true)}>View your deck ({game.cards.length})</button></div>
        </section>
        <div className={`target-instructions ${active ? 'has-selection' : ''}`} aria-live="polite">{active ? `${CARDS[active.defId].name} → ${CARDS[active.defId].target === 'enemy' ? 'choose a glowing enemy' : CARDS[active.defId].target === 'hero' ? 'drop onto your hero' : 'choose a compatible card in your hand'}` : 'Drag a card onto its target · or click a card, then a target'}{selected && <><button onClick={() => setSelected(null)}>Cancel</button><button onClick={() => commit(s => discardCard(s, selected))}>Discard card</button></>}</div>
        <section className="hand" aria-label="Cards in your hand">{game.hand.map(uid => game.cards.find(c => c.uid === uid)).filter((c): c is CardInstance => !!c).map(card => cardView(card, 'hand'))}{game.hand.length === 0 && <p className="empty-hand">An empty hand. End your turn to draw more cards.</p>}</section>
        <footer className="battle-footer"><span>▣ Draw {game.deck.length} · Discard {game.discard.length}</span><span className="last-log" aria-live="polite">{game.log[game.log.length - 1]}</span><button className="text-button" onClick={() => setMenu(true)}>Pause</button></footer>
      </main>}

      {game.screen === 'reward' && <main className="reward-screen"><div className="screen-title"><span className="eyebrow">A LITTLE STRONGER. A LITTLE BRAVER.</span><h1>Spoils of the wilds</h1><p>Choose one gift for the road ahead.</p></div><div className="reward-choices">{game.rewards.map(reward => <div className="reward-choice" key={reward.id}>{reward.cardId ? cardView({ uid: reward.id, defId: reward.cardId, upgraded: false }, 'reward', () => commit(s => chooseReward(s, reward.id))) : <button className="special-reward" onClick={() => commit(s => chooseReward(s, reward.id))}><span>{reward.kind === 'heal' ? '♥' : '✦'}</span><h2>{reward.name}</h2><p>{reward.description}</p><b>Choose this gift →</b></button>}<small>{reward.description}</small></div>)}</div></main>}

      {(game.screen === 'progress' || game.screen === 'upgrade') && <main className="progress-screen"><div className="screen-title"><span className="eyebrow">TAKE A BREATHER</span><h1>{game.screen === 'upgrade' ? 'A sharper little deck' : 'The path ahead'}</h1><p>{game.screen === 'upgrade' ? `Choose a card to upgrade. ${game.upgradesRemaining} upgrade${game.upgradesRemaining === 1 ? '' : 's'} available.` : `${hero.name} · ${game.hp} / ${game.maxHp} HP · ${game.cards.length} cards in your deck`}</p></div>
        {game.screen === 'progress' ? <><div className="journey-path">{ENCOUNTERS.map((item, index) => <div key={item.name} className={`journey-stop ${index <= game.encounter ? 'complete' : ''} ${index === game.encounter + 1 ? 'next' : ''}`}><span>{index <= game.encounter ? '✓' : index === 3 ? '♛' : index === 2 ? '✦' : '⚑'}</span><b>{item.name}</b><small>{index <= game.encounter ? 'CLEARED' : index === game.encounter + 1 ? 'UP NEXT' : item.tier.toUpperCase()}</small></div>)}</div><div className="progress-actions"><button className="primary-button" onClick={() => commit(nextBattle)}>Enter {ENCOUNTERS[game.encounter + 1]?.tier === 'boss' ? 'the boss battle' : 'the next battle'} →</button><button className="secondary-button" onClick={() => commit(s => ({ ...s, screen: 'upgrade' }))}>Tend your deck {game.upgradesRemaining > 0 && <b>· {game.upgradesRemaining} upgrade available</b>}</button></div><p className="small-hint">Between fights, upgrade your cards and attach, replace, or remove runes.</p></> : <><div className="camp-instructions">{active && CARDS[active.defId].type === 'rune' ? <>{CARDS[active.defId].name}: click a glowing card to attach or replace its rune. <button className="text-button" onClick={() => setSelected(null)}>Cancel</button></> : 'Click a card to upgrade it. To attach a rune, click the rune, then a compatible card.'}</div><div className="collection-grid">{game.cards.map(card => <div className="collection-item" key={card.uid}>{cardView(card, 'collection', () => campCardTap(card))}{card.rune && <button className="remove-rune" onClick={() => commit(s => removeRune(s, card.uid))}>Remove {RUNES[card.rune].name}</button>}</div>)}</div><button className="primary-button" onClick={() => commit(s => ({ ...s, screen: 'progress' }))}>Back to the path →</button></>}
      </main>}

      {(game.screen === 'victory' || game.screen === 'defeat') && <main className={`ending-screen ${game.screen}`}><div className="ending-art"><Portrait kind={game.heroId}/><span>{game.screen === 'victory' ? '✦' : '☂'}</span></div><span className="eyebrow">{game.screen === 'victory' ? 'THE WILDS REMEMBER YOUR NAME' : 'THE FOREST KEEPS ITS SECRETS'}</span><h1>{game.screen === 'victory' ? 'A hero comes home.' : 'A brave little attempt.'}</h1><p>{game.screen === 'victory' ? 'The boss is beaten. Your handful of cards became something mighty.' : 'Even the best adventures take a few tries. A new path is waiting.'}</p><div className="ending-stats"><span><b>{game.battlesWon}</b> battles won</span><span><b>{game.cards.length}</b> cards collected</span><span><b>{game.turn}</b> final battle turns</span></div><button className="primary-button" onClick={() => { setGame(initialState()); setGame(g => ({ ...g, screen: 'select' })); setSelected(null); }}>Another adventure →</button><button className="text-button" onClick={() => setMenu(true)}>Main menu</button></main>}
    </>}

    {toast && <div className="toast" role="status">{toast}</div>}
    {storageWarning && <span className="storage-warning">Saving unavailable in this browser.</span>}
    {showDeck && <div className="modal-backdrop" onClick={() => setShowDeck(false)}><section className="paper-modal deck-modal" onClick={e => e.stopPropagation()} aria-modal="true" role="dialog" aria-label="Your deck"><button className="close-button" onClick={() => setShowDeck(false)}>×</button><h2>Your trusty deck</h2><p>Attached runes last for this adventure. Upgraded cards are marked ✦.</p><div className="collection-grid">{game.cards.map(card => cardView(card))}</div></section></div>}
    {showRules && <div className="modal-backdrop" onClick={() => setShowRules(false)}><section className="paper-modal rules-modal" onClick={e => e.stopPropagation()} aria-modal="true" role="dialog" aria-label="How to play"><button className="close-button" onClick={() => setShowRules(false)}>×</button><span className="eyebrow">A FEW SIMPLE TRICKS</span><h2>Learn the ropes</h2><ol><li><b>Read the enemy intentions.</b> They show the next action. Shield and Freeze can keep you safe.</li><li><b>Play your hand.</b> Drag a card onto a glowing target, or click the card then its target. Each play spends energy.</li><li><b>Build your hero.</b> Equipment goes onto your character. A Rune goes onto a compatible card in your hand.</li><li><b>End your turn.</b> Enemies act, statuses resolve, energy refills, and you draw back to five cards. Unused cards stay in your hand; select a card and choose Discard to make room.</li><li><b>Follow the path.</b> Choose rewards, upgrade cards between battles, face an elite, then the boss.</li></ol><div className="rules-statuses">{Object.entries(statusHelp).map(([key, help]) => <p key={key}>{help}</p>)}<p>Shield: absorbs damage; expires at the start of its owner's next turn.</p></div><button className="primary-button" onClick={() => setShowRules(false)}>Got it. Let's play.</button></section></div>}
    {debug && import.meta.env.DEV && <aside className="debug-panel"><b>DEVELOPER TOOLS · ~ to hide</b>{(['restart', 'energy', 'heal', 'cards', 'boss', 'win', 'lose'] as DebugAction[]).map(action => <button key={action} onClick={() => { commit(s => debugAction(s, action)); setMenu(false); }}>{action}</button>)}<button onClick={() => { try { localStorage.removeItem(SAVE_KEY); } catch { setStorageWarning(true); } setGame(initialState()); setMenu(true); setSelected(null); }}>Clear local save</button><small>Screen {game.screen} · seed {game.seed}</small><div className="debug-log">{game.log.slice(-8).map((line, i) => <p key={i}>{line}</p>)}</div></aside>}
  </div>;
}
