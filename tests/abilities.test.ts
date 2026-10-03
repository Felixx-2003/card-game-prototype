import { describe, expect, it } from 'vitest';
import { activateSkill, chooseGlobalBuff, chooseReward, debugAction, endTurn, getCost, isValidSave, nextBattle, playCard, startRun } from '../src/engine';
import { activeSkillAvailable, GLOBAL_BUFFS } from '../src/abilities';
import type { GameState } from '../src/types';
function card(s: GameState, defId: string, rune?: string) { const c = { uid: `extra-${++s.serial}`, defId, rune, upgraded: false }; s.cards.push(c); s.hand.push(c.uid); return c; }
function arena(hero: 'warrior'|'mage' = 'warrior') { const s = startRun(hero,42); s.enemies.forEach(e => e.hp = e.maxHp = 200); return s; }
describe('character talents and reusable boons', () => {
  it.each(['warrior','mage'] as const)('%s active is strong, immutable, costs Energy and has a real three-turn cooldown', hero => {
    const s = arena(hero), n = activateSkill(s); expect(s.energy).toBe(3); expect(n.energy).toBe(2); expect(n.enemies.every(e => e.hp === (hero==='warrior'?188:190))).toBe(true);
    expect(n.events.some(e=>e.kind==='ability')).toBe(true); expect(n.activeReadyTurn).toBe(4); expect(activateSkill(n)).toBe(n);
    if(hero==='warrior') expect(n.shield).toBe(8); else { expect(n.hand).toHaveLength(6); expect(n.enemies[0].statuses.burn).toBe(2); }
    let next=n; for(let i=0;i<3;i++) { next.hp=next.maxHp; next=endTurn(next); } expect(activeSkillAvailable(next)).toBe(true);
    expect(activateSkill({...next,energy:0})).toEqual({...next,energy:0}); expect(activateSkill({...next,screen:'progress'}).screen).toBe('progress');
  });
  it.each(['warrior','mage'] as const)('%s passive triggers automatically exactly once each turn', hero => {
    let s=arena(hero); const a=card(s,hero==='warrior'?'slash':'arcane-bolt'), b=card(s,a.defId); s=playCard(s,a.uid,s.enemies[0].uid); expect(s.events.filter(e=>e.kind==='passive')).toHaveLength(1);
    s=playCard(s,b.uid,s.enemies[0].uid); expect(s.events.filter(e=>e.kind==='passive')).toHaveLength(0); s=endTurn(s); const c=card(s,a.defId); s=playCard(s,c.uid,s.enemies[0].uid); expect(s.events.filter(e=>e.kind==='passive')).toHaveLength(1);
  });
  it('boons are permanent, unique, limited to one each camp and apply numeric modifiers', () => {
    let s=chooseReward(debugAction(startRun('warrior',42),'win'),'reward-rune'); s=chooseGlobalBuff(s,'keen-edge'); expect(chooseGlobalBuff(s,'spell-spring')).toBe(s); expect(s.globalBuffs).toEqual(['keen-edge']);
    s=nextBattle(s); s.enemies.forEach(e=>e.hp=e.maxHp=200); const c=card(s,'slash'); s=playCard(s,c.uid,s.enemies[0].uid); expect(s.enemies[0].hp).toBe(190); expect(isValidSave(s)).toBe(true);
    s=chooseReward(debugAction(s,'win'),'reward-rune'); s=chooseGlobalBuff(s,'forest-aegis'); s=nextBattle(s); expect(s.shield).toBe(6); expect(s.globalBuffs).toHaveLength(2);
  });
  it('Spell Spring stacks with equipment and resets each turn, without discounting every Spell', () => {
    let s=arena('mage'); s.globalBuffs=['spell-spring']; const a=card(s,'fireball'),b=card(s,'fireball'); expect(getCost(s,a)).toBe(1); s=playCard(s,a.uid,s.enemies[0].uid); expect(getCost(s,b)).toBe(2); s=endTurn(s); expect(getCost(s,b)).toBe(1);
  });
  it('Rune Resonance boosts card/weapon Runes and keeps attachment rules and saves compatible', () => {
    let s=arena(); s.globalBuffs=['rune-resonance']; const a=card(s,'slash','fire'); s=playCard(s,a.uid,s.enemies[0].uid); expect(s.enemies[0].statuses.burn).toBe(3);
    s.energy=30; const b=card(s,'slash','power'); s=playCard(s,b.uid,s.enemies[0].uid); expect(s.enemies[0].hp).toBe(177);
    const old=startRun('mage',2); delete old.activeReadyTurn; expect(isValidSave(old)).toBe(true); expect(isValidSave({...old,globalBuffs:['fake']})).toBe(false); expect(isValidSave({...old,activeReadyTurn:-1})).toBe(false); expect(Object.keys(GLOBAL_BUFFS)).toHaveLength(4);
  });
});
