import { describe, expect, it } from 'vitest';
import { CARDS, ENEMIES, HEROES, RUNES, ENCOUNTERS } from '../src/data';

describe('content integrity', () => {
  it('contains every promised card and enemy category', () => {
    const counts = (type: string) => Object.values(CARDS).filter(c => c.type === type).length;
    expect([counts('skill'), counts('spell'), counts('equipment'), counts('rune')]).toEqual([12, 8, 6, 8]);
    expect(Object.keys(HEROES)).toHaveLength(2);
    expect(Object.keys(RUNES)).toHaveLength(8);
    expect(['normal', 'elite', 'boss'].map(t => Object.values(ENEMIES).filter(e => e.tier === t).length)).toEqual([5, 2, 1]);
  });
  it('has valid references, readable effects, and upgrades', () => {
    for (const [id, card] of Object.entries(CARDS)) {
      expect(card.id).toBe(id);
      expect(card.name.length).toBeGreaterThan(1);
      expect(card.description.length).toBeGreaterThan(5);
      expect(card.cost).toBeGreaterThanOrEqual(0);
      if (card.type === 'rune') expect(RUNES[card.runeId!]).toBeDefined();
      else expect(card.upgrade).toBeDefined();
      if (card.type === 'equipment') expect(card.slot).toMatch(/weapon|armor/);
    }
    for (const hero of Object.values(HEROES)) {
      expect(hero.startingDeck).toHaveLength(8);
      expect(hero.maxEnergy).toBe(3);
      for (const id of hero.startingDeck) expect(CARDS[id]).toBeDefined();
    }
    expect(ENCOUNTERS).toHaveLength(4);
    for (const encounter of ENCOUNTERS) for (const id of encounter.enemyIds) expect(ENEMIES[id]).toBeDefined();
    for (const enemy of Object.values(ENEMIES)) expect(enemy.pattern.length).toBeGreaterThan(0);
    expect(ENEMIES['hollow-regent'].phase2?.length).toBeGreaterThan(0);
  });
});
