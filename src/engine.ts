import { CARDS, ENCOUNTERS, ENEMIES, HEROES, RUNES } from './data';
import type { CardInstance, CombatEvent, DebugAction, Effect, Enemy, GameState, HeroId, Intent, Status, Statuses } from './types';

const clone = (s: GameState): GameState => structuredClone(s);
const between = (s: GameState) => s.screen === 'progress' || s.screen === 'upgrade';
const cardBy = (s: GameState, uid: string) => s.cards.find(c => c.uid === uid);
const resolveCard = (s: GameState, card: CardInstance | string) => typeof card === 'string' ? cardBy(s, card) : card;
function log(s: GameState, message: string) { s.log = [...s.log.slice(-17), message]; }
function event(s: GameState, target: string, kind: CombatEvent['kind'], amount: number, label?: string) { s.events.push({ id: ++s.serial, target, kind, amount, label }); }
function random(s: GameState) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
function shuffle(s: GameState, list: string[]) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random(s) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function makeCard(s: GameState, defId: string): CardInstance { return { uid: `c${++s.serial}`, defId, upgraded: false }; }
function draw(s: GameState, n: number) { for (let i = 0; i < n; i++) { if (!s.deck.length) { s.deck = shuffle(s, s.discard); s.discard = []; } const uid = s.deck.shift(); if (!uid) break; s.hand.push(uid); } }
function gearCards(s: GameState) { return Object.values(s.gear).map(uid => cardBy(s, uid!)).filter((c): c is CardInstance => !!c); }
export function getCardEffect(card: CardInstance): Effect { const d = CARDS[card.defId]; if (!d) return {}; const { cost: _cost, ...upgrade } = card.upgraded ? d.upgrade ?? {} : {}; return { ...d.effect, ...upgrade }; }
export function getCost(s: GameState, value: CardInstance | string): number { const card = resolveCard(s, value); if (!card) return 99; const d = CARDS[card.defId]; let cost = card.upgraded && d.upgrade?.cost !== undefined ? d.upgrade.cost : d.cost; if (card.rune === 'cheap') cost--; if (d.type === 'skill' && s.heroId === 'warrior' && !s.firstSkill) cost--; if (d.type === 'spell' && !s.firstSpell) for (const gear of gearCards(s)) cost -= CARDS[gear.defId].gear?.firstSpellDiscount ?? 0; return Math.max(0, cost); }
export function canAttachRune(card: CardInstance, runeId: string) { const d = CARDS[card.defId], rune = RUNES[runeId]; return !!d && !!rune && rune.compatible.includes(d.type) && (runeId !== 'chain' || !d.effect.all) && (!rune.requiresDamage || !!d.effect.damage || !!d.gear?.skillDamage || !!d.gear?.spellDamage); }
export function canTarget(s: GameState, value: CardInstance | string, target: string): boolean {
  const card = resolveCard(s, value); if (!card || !CARDS[card.defId]) return false; const d = CARDS[card.defId];
  if (d.type === 'rune') { const destination = cardBy(s, target); return (s.screen === 'battle' || between(s)) && !!destination && destination.uid !== card.uid && (!destination.rune || between(s)) && canAttachRune(destination, d.runeId!) && (between(s) || s.hand.includes(target)); }
  if (s.screen !== 'battle') return false;
  return d.target === 'hero' ? target === 'hero' : s.enemies.some(enemy => enemy.uid === target && enemy.hp > 0);
}
export function initialState(): GameState { return { version: 1, screen: 'menu', heroId: 'warrior', hp: 0, maxHp: 0, shield: 0, statuses: {}, energy: 0, maxEnergy: 3, turn: 0, encounter: 0, cards: [], deck: [], hand: [], discard: [], gear: {}, enemies: [], log: [], events: [], rewards: [], firstSkill: false, firstSpell: false, upgradesRemaining: 0, seed: 1, serial: 0, battlesWon: 0 }; }
function currentIntent(enemy: Enemy): Intent { const d = ENEMIES[enemy.defId]; const pattern = enemy.phase === 2 && d.phase2 ? d.phase2 : d.pattern; return { ...pattern[enemy.patternIndex % pattern.length] }; }
function checkPhase(s: GameState, enemy: Enemy) { if (ENEMIES[enemy.defId].phase2 && enemy.phase === 1 && enemy.hp <= enemy.maxHp / 2 && enemy.hp > 0) { enemy.phase = 2; enemy.patternIndex = 0; enemy.intent = currentIntent(enemy); log(s, `${ENEMIES[enemy.defId].name} shatters its crown! Phase 2.`); } }
function shield(s: GameState, target: string, amount: number) { const enemy = s.enemies.find(e => e.uid === target); if (target === 'hero') s.shield += amount; else if (enemy) enemy.shield += amount; event(s, target, 'shield', amount); }
function heal(s: GameState, amount: number) { const actual = Math.min(amount, s.maxHp - s.hp); s.hp += actual; if (actual > 0) event(s, 'hero', 'heal', actual); }
function status(s: GameState, target: string, type: Status, amount: number) { const statuses = target === 'hero' ? s.statuses : s.enemies.find(e => e.uid === target)?.statuses; if (statuses) { statuses[type] = (statuses[type] ?? 0) + amount; event(s, target, 'status', amount, type); } }
function damage(s: GameState, target: string, amount: number, sourceStatuses: Statuses = {}, direct = false) {
  const enemy = s.enemies.find(e => e.uid === target); if (target !== 'hero' && (!enemy || enemy.hp <= 0)) return;
  const targetStatuses = enemy?.statuses ?? s.statuses;
  let value = direct ? amount : Math.floor(amount * (sourceStatuses.weak ? 0.75 : 1) * (targetStatuses.vulnerable ? 1.5 : 1));
  if (!direct && target === 'hero') value = Math.max(0, value - HEROES[s.heroId].defense);
  const oldShield = enemy?.shield ?? s.shield; const absorbed = direct ? 0 : Math.min(oldShield, value);
  if (enemy) { enemy.shield -= absorbed; enemy.hp = Math.max(0, enemy.hp - value + absorbed); checkPhase(s, enemy); }
  else { s.shield -= absorbed; s.hp = Math.max(0, s.hp - value + absorbed); }
  event(s, target, 'damage', value - absorbed, absorbed ? `${absorbed} blocked` : undefined);
}
function startTurn(s: GameState) { s.turn++; s.energy = s.maxEnergy; s.shield = 0; s.firstSkill = false; s.firstSpell = false; for (const card of gearCards(s)) { const g = CARDS[card.defId].gear; if (g?.shieldPerTurn) shield(s, 'hero', g.shieldPerTurn); if (g?.healPerTurn) heal(s, g.healPerTurn); if (card.rune === 'renew') heal(s, 2); } draw(s, Math.max(0, 5 - s.hand.length)); log(s, `Turn ${s.turn} · ${s.energy} Energy`); }
function beginBattle(s: GameState) {
  const encounter = ENCOUNTERS[s.encounter]; s.screen = 'battle'; s.turn = 0; s.shield = 0; s.statuses = {}; s.gear = {}; s.deck = shuffle(s, s.cards.map(c => c.uid)); s.hand = []; s.discard = []; s.rewards = []; s.events = []; s.log = [];
  let enemyIds = encounter.enemyIds; if (s.encounter === 2 && random(s) > 0.5) enemyIds = ['lantern-warden'];
  s.enemies = enemyIds.map((id, i) => { const d = ENEMIES[id]; return { uid: `enemy-${i}`, defId: id, hp: d.hp, maxHp: d.hp, shield: 0, statuses: {}, patternIndex: 0, phase: 1, intent: { ...d.pattern[0] } }; });
  log(s, `${encounter.name} · ${HEROES[s.heroId].name} enters the fray.`); startTurn(s); return s;
}
export function startRun(heroId: HeroId, seed = Date.now()): GameState { const s = initialState(); s.heroId = heroId; s.seed = seed >>> 0; s.hp = s.maxHp = HEROES[heroId].hp; s.cards = HEROES[heroId].startingDeck.map(id => makeCard(s, id)); return beginBattle(s); }
function rewards(s: GameState) {
  const pools = Object.values(CARDS).filter(c => s.encounter === 0 ? c.type === 'equipment' : s.encounter === 1 ? c.type === 'skill' || c.type === 'spell' : c.type !== 'rune').map(c => c.id);
  const offer = pools[Math.floor(random(s) * pools.length)]; const rune = s.encounter === 0 ? 'rune-fire' : s.encounter === 1 ? 'rune-echo' : `rune-${Object.keys(RUNES)[Math.floor(random(s) * Object.keys(RUNES).length)]}`;
  s.rewards = [ { id: 'reward-card', kind: 'card', cardId: offer, name: CARDS[offer].name, description: CARDS[offer].description }, { id: 'reward-rune', kind: 'card', cardId: rune, name: CARDS[rune].name, description: CARDS[rune].description }, s.encounter === 1 ? { id: 'reward-upgrade', kind: 'upgrade', name: 'Masterwork', description: 'Gain one extra card upgrade at camp.' } : { id: 'reward-heal', kind: 'heal', name: 'Orchard Feast', description: 'Restore 22 HP.' } ];
}
function finish(s: GameState) { if (s.hp <= 0) { s.screen = 'defeat'; log(s, 'The expedition ends. A new adventure awaits.'); return; } if (s.enemies.every(e => e.hp <= 0)) { s.battlesWon++; if (s.encounter === 3) { s.screen = 'victory'; log(s, 'The Hollow Crown falls. The orchard is free!'); } else { s.screen = 'reward'; s.upgradesRemaining = 1; heal(s, 10); rewards(s); log(s, 'Battle won! Recover 10 HP and choose a reward.'); } } }
function effectActivation(s: GameState, effect: Effect, target: string, scale: number, bonus: number, card: CardInstance, runeOverride?: string) {
  const d = CARDS[card.defId]; const rune = runeOverride ?? card.rune;
  let dmg = effect.damage ?? 0; if (dmg) { dmg += d.type === 'skill' ? HEROES[s.heroId].attack : 0; dmg += bonus; for (const gear of gearCards(s)) dmg += d.type === 'skill' ? CARDS[gear.defId].gear?.skillDamage ?? 0 : CARDS[gear.defId].gear?.spellDamage ?? 0; }
  const magnitude = rune === 'power' ? 4 : rune === 'blood' ? 5 : 0;
  if (dmg) dmg = Math.ceil((dmg + magnitude) * scale);
  const targets = effect.all ? s.enemies.filter(e => e.hp > 0).map(e => e.uid) : [target];
  for (const targetUid of targets) {
    if (dmg) damage(s, targetUid, dmg, s.statuses);
    if (effect.status && s.enemies.some(e => e.uid === targetUid && e.hp > 0)) status(s, targetUid, effect.status, effect.stacks ?? 1);
    if (dmg && s.enemies.some(e => e.uid === targetUid && e.hp > 0)) { if (rune === 'fire') status(s, targetUid, 'burn', 2); if (rune === 'frost' && !(s.enemies.find(e => e.uid === targetUid)?.statuses.freeze)) status(s, targetUid, 'freeze', 1); }
  }
  if (effect.shield) shield(s, 'hero', Math.ceil((effect.shield + bonus + (rune === 'blood' ? 5 : 0)) * scale));
  if (effect.heal) heal(s, Math.ceil((effect.heal + bonus + (rune === 'blood' ? 5 : 0)) * scale));
  if (effect.draw) draw(s, effect.draw);
  if (effect.cleanse) s.statuses = {};
  if (rune === 'chain' && dmg && !effect.all) { const other = s.enemies.find(e => e.uid !== target && e.hp > 0); if (other) damage(s, other.uid, Math.ceil(dmg / 2), s.statuses); }
}
function equippedRuneEffects(s: GameState, card: CardInstance, target: string, effect: Effect) {
  if (!effect.damage) return;
  const matchingGear = gearCards(s).filter(g => card.defId && ((CARDS[card.defId].type === 'skill' && CARDS[g.defId].gear?.skillDamage) || (CARDS[card.defId].type === 'spell' && CARDS[g.defId].gear?.spellDamage)));
  const targets = effect.all ? s.enemies.filter(e => e.hp > 0) : s.enemies.filter(e => e.uid === target && e.hp > 0);
  for (const gear of matchingGear) { for (const enemy of targets) { if (gear.rune === 'fire') status(s, enemy.uid, 'burn', 2); if (gear.rune === 'frost' && !enemy.statuses.freeze) status(s, enemy.uid, 'freeze', 1); if (gear.rune === 'power') damage(s, enemy.uid, 3, s.statuses); } }
}
export function playCard(state: GameState, uid: string, target: string): GameState {
  const card = cardBy(state, uid); if (!card || !canTarget(state, card, target)) return state; const def = CARDS[card.defId];
  if (state.screen === 'battle' && (!state.hand.includes(uid) || getCost(state, card) > state.energy)) return state;
  if (between(state) && def.type !== 'rune') return state;
  const s = clone(state); s.events = []; const played = cardBy(s, uid)!; const cost = state.screen === 'battle' ? getCost(s, played) : 0; s.energy -= cost;
  s.hand = s.hand.filter(id => id !== uid); s.deck = s.deck.filter(id => id !== uid); s.discard = s.discard.filter(id => id !== uid);
  if (def.type === 'rune') {
    const destination = cardBy(s, target)!; if (destination.rune) { const returned = makeCard(s, `rune-${destination.rune}`); s.cards.push(returned); s.deck.push(returned.uid); }
    destination.rune = def.runeId; s.cards = s.cards.filter(c => c.uid !== uid); log(s, `${def.name} attached to ${CARDS[destination.defId].name}.`); return s;
  }
  if (def.type === 'equipment') {
    const old = s.gear[def.slot!]; if (old) s.discard.push(old); s.gear[def.slot!] = uid; if (def.gear?.shieldPerTurn) shield(s, 'hero', def.gear.shieldPerTurn); if (played.rune === 'renew') heal(s, 3); log(s, `${def.name} equipped${old ? ' · previous gear returned to discard' : ''}.`); return s;
  }
  s.discard.push(uid); const bonus = def.type === 'spell' && s.heroId === 'mage' && !s.firstSpell ? 2 : 0;
  if (def.type === 'skill') s.firstSkill = true; if (def.type === 'spell') s.firstSpell = true;
  if (played.rune === 'blood') { damage(s, 'hero', 3, {}, true); if (s.hp <= 0) { finish(s); return s; } }
  const effect = getCardEffect(played); effectActivation(s, effect, target, 1, bonus, played); equippedRuneEffects(s, played, target, effect);
  if (played.rune === 'echo') effectActivation(s, effect, target, 0.5, 0, played);
  if (played.rune === 'renew') heal(s, 3);
  log(s, `${def.name}${played.upgraded ? '+' : ''}${played.rune ? ` · ${RUNES[played.rune].name}` : ''} (${cost} Energy).`); finish(s); return s;
}
export function discardCard(state: GameState, uid: string): GameState { if (state.screen !== 'battle' || !state.hand.includes(uid)) return state; const s = clone(state); s.hand = s.hand.filter(id => id !== uid); s.discard.push(uid); s.events = []; log(s, `${CARDS[cardBy(s, uid)!.defId].name} discarded. Draw to five next turn.`); return s; }
function tick(s: GameState, target: string, statuses: Statuses, previous?: Statuses) { for (const type of ['burn', 'poison'] as const) { if (statuses[type]) { damage(s, target, statuses[type]!, {}, true); statuses[type]!--; } } for (const type of ['weak', 'vulnerable'] as const) if (statuses[type] && (!previous || previous[type])) statuses[type]!--; }
export function endTurn(state: GameState): GameState {
  if (state.screen !== 'battle') return state; const s = clone(state); const previousStatuses = { ...s.statuses }; s.events = []; log(s, 'Enemies act.');
  for (const enemy of s.enemies) {
    if (enemy.hp <= 0 || s.hp <= 0) continue; enemy.shield = 0;
    if (enemy.statuses.freeze) { enemy.statuses.freeze--; log(s, `${ENEMIES[enemy.defId].name} is frozen and skips its action.`); }
    else { const intent = enemy.intent; log(s, `${ENEMIES[enemy.defId].name}: ${intent.label}`); if (intent.damage) damage(s, 'hero', intent.damage, enemy.statuses); if (intent.shield) shield(s, enemy.uid, intent.shield); if (intent.status && s.hp > 0) status(s, 'hero', intent.status, intent.stacks ?? 1); if (intent.heal) for (const other of s.enemies) if (other.hp > 0) { const actual = Math.min(intent.heal, other.maxHp - other.hp); other.hp += actual; if (actual) event(s, other.uid, 'heal', actual); } }
    enemy.patternIndex++; enemy.intent = currentIntent(enemy);
  }
  if (s.hp > 0) tick(s, 'hero', s.statuses, previousStatuses);
  for (const enemy of s.enemies) if (enemy.hp > 0) tick(s, enemy.uid, enemy.statuses);
  finish(s); if (s.screen === 'battle') startTurn(s); return s;
}
export function chooseReward(state: GameState, rewardId: string): GameState { if (state.screen !== 'reward') return state; const reward = state.rewards.find(r => r.id === rewardId); if (!reward) return state; const s = clone(state); s.events = []; if (reward.kind === 'card') { const added = makeCard(s, reward.cardId!); s.cards.push(added); s.deck.push(added.uid); } else if (reward.kind === 'heal') heal(s, 22); else s.upgradesRemaining++; s.rewards = []; s.screen = reward.kind === 'upgrade' ? 'upgrade' : 'progress'; log(s, `Reward: ${reward.name}.`); return s; }
export function upgradeCard(state: GameState, uid: string): GameState { const card = cardBy(state, uid); if (!between(state) || !card || card.upgraded || !CARDS[card.defId].upgrade || state.upgradesRemaining <= 0) return state; const s = clone(state); cardBy(s, uid)!.upgraded = true; s.upgradesRemaining--; log(s, `${CARDS[card.defId].name} upgraded.`); return s; }
export function removeRune(state: GameState, uid: string): GameState { const card = cardBy(state, uid); if (!between(state) || !card?.rune) return state; const s = clone(state); const rune = cardBy(s, uid)!.rune!; delete cardBy(s, uid)!.rune; const returned = makeCard(s, `rune-${rune}`); s.cards.push(returned); s.deck.push(returned.uid); log(s, `${RUNES[rune].name} returned to your deck.`); return s; }
export function nextBattle(state: GameState): GameState { if (!between(state) || state.encounter >= ENCOUNTERS.length - 1) return state; const s = clone(state); s.encounter++; s.upgradesRemaining = 0; return beginBattle(s); }
export function debugAction(state: GameState, action: DebugAction): GameState {
  const s = clone(state); s.events = [];
  if (action === 'restart') return beginBattle(s);
  if (action === 'boss') { s.encounter = 3; s.hp = s.maxHp; return beginBattle(s); }
  if (action === 'energy') s.energy += 10;
  if (action === 'heal') { s.hp = s.maxHp; s.statuses = {}; }
  if (action === 'cards') for (const id of ['rune-fire', 'rune-echo', 'rune-chain', 'rune-cheap', 'rune-blood', 'rune-frost', 'rune-power', 'rune-renew', 'heavy-strike', 'iron-armor', 'flame-sword', 'storm-staff', 'chain-lightning']) { const card = makeCard(s, id); s.cards.push(card); s.hand.push(card.uid); }
  if (action === 'win' && s.screen === 'battle') { s.enemies.forEach(e => e.hp = 0); finish(s); }
  if (action === 'lose' && s.screen === 'battle') { s.hp = 0; finish(s); }
  return s;
}
export function isValidSave(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false; const s = value as GameState;
  const finite = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  const statuses = (v: unknown) => !!v && typeof v === 'object' && !Array.isArray(v) && Object.entries(v).every(([k,n]) => ['burn','poison','freeze','weak','vulnerable'].includes(k) && finite(n));
  const intent = (v: unknown) => { if (!v || typeof v !== 'object') return false; const i=v as Intent; return ['attack','defend','buff','debuff','special'].includes(i.kind) && typeof i.label === 'string' && [i.damage,i.shield,i.stacks,i.heal].every(n => n === undefined || finite(n)) && (i.status === undefined || ['burn','poison','freeze','weak','vulnerable'].includes(i.status)); };
  if (!(s.version === 1 && Object.hasOwn(HEROES,s.heroId) && ['menu','select','battle','reward','upgrade','progress','victory','defeat'].includes(s.screen) && [s.hp,s.maxHp,s.energy,s.maxEnergy,s.shield,s.turn,s.serial,s.seed,s.battlesWon,s.upgradesRemaining].every(finite) && s.hp <= s.maxHp && Number.isInteger(s.encounter) && s.encounter >= 0 && s.encounter < 4 && typeof s.firstSkill === 'boolean' && typeof s.firstSpell === 'boolean' && statuses(s.statuses))) return false;
  if (!(Array.isArray(s.cards) && s.cards.every(c => !!c && typeof c.uid === 'string' && Object.hasOwn(CARDS,c.defId) && typeof c.upgraded === 'boolean' && (c.rune === undefined || typeof c.rune === 'string' && Object.hasOwn(RUNES,c.rune) && canAttachRune(c,c.rune))) && new Set(s.cards.map(c => c.uid)).size === s.cards.length)) return false;
  const uids = new Set(s.cards.map(c=>c.uid));
  if (![s.deck,s.hand,s.discard].every(a => Array.isArray(a) && a.every(uid => typeof uid === 'string' && uids.has(uid)))) return false;
  if (!s.gear || typeof s.gear !== 'object' || Array.isArray(s.gear) || !Object.entries(s.gear).every(([slot,uid]) => ['weapon','armor'].includes(slot) && typeof uid === 'string' && uids.has(uid) && CARDS[cardBy(s,uid)!.defId].type === 'equipment' && CARDS[cardBy(s,uid)!.defId].slot === slot)) return false;
  if (new Set(zonesForSave(s)).size !== zonesForSave(s).length || zonesForSave(s).length !== s.cards.length) return false;
  return Array.isArray(s.enemies) && s.enemies.every(e => !!e && typeof e.uid === 'string' && Object.hasOwn(ENEMIES,e.defId) && [e.hp,e.maxHp,e.shield,e.patternIndex].every(finite) && Number.isInteger(e.patternIndex) && e.hp <= e.maxHp && [1,2].includes(e.phase) && intent(e.intent) && statuses(e.statuses)) && new Set(s.enemies.map(e=>e.uid)).size === s.enemies.length && Array.isArray(s.log) && s.log.every(l=>typeof l==='string') && Array.isArray(s.events) && s.events.every(e=>!!e && finite(e.id) && finite(e.amount) && typeof e.target==='string' && ['damage','heal','shield','status'].includes(e.kind) && (e.label === undefined || typeof e.label === 'string')) && Array.isArray(s.rewards) && s.rewards.every(r=>!!r && typeof r.id==='string' && typeof r.name==='string' && typeof r.description==='string' && ['card','heal','upgrade'].includes(r.kind) && (r.kind !== 'card' || Object.hasOwn(CARDS,r.cardId!))) && (s.screen !== 'battle' || s.enemies.length > 0 && s.maxHp > 0);
}
function zonesForSave(s: GameState) { return [...s.deck,...s.hand,...s.discard,...Object.values(s.gear)]; }
