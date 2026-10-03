import type { HeroId, GameState } from './types';

export const CHARACTER_SKILLS: Record<HeroId, { name: string; icon: string; cost: number; cooldown: number; description: string; passiveName: string; passiveIcon: string }> = {
  warrior: { name: 'Power Strike', icon: '⚔', cost: 1, cooldown: 3, description: 'Deal 12 damage to every enemy and gain 8 Shield. Costs 1 Energy. Ready again after 3 turns.', passiveName: 'First Strike', passiveIcon: '◆' },
  mage: { name: 'Magic Burst', icon: '✦', cost: 1, cooldown: 3, description: 'Deal 10 damage and apply 2 Burn to every enemy. Draw 1 card. Costs 1 Energy. Ready again after 3 turns.', passiveName: 'Magic Boost', passiveIcon: '✧' },
};
export const GLOBAL_BUFFS = {
  'keen-edge': { name: 'Sharp Skills', icon: '⚔', description: 'All damaging Skills deal +1 damage.', skillDamage: 1 },
  'spell-spring': { name: 'Cheap Spells', icon: '✧', description: 'Your first Spell each turn costs 1 less Energy.', firstSpellDiscount: 1 },
  'forest-aegis': { name: 'Start Shield', icon: '▰', description: 'Start each battle with 6 Shield.', startShield: 6 },
  'rune-resonance': { name: 'Strong Runes', icon: '◆', description: 'Numeric Rune bonuses gain +1: damage, Burn, healing and Blood Shield. Echo repeats at 60% strength.', runePower: 1 },
} as const;
export type GlobalBuffId = keyof typeof GLOBAL_BUFFS;
export function buffValue(s: GameState, key: 'skillDamage' | 'firstSpellDiscount' | 'startShield' | 'runePower'): number {
  return (s.globalBuffs ?? []).reduce((n, id) => n + ((GLOBAL_BUFFS[id] as Partial<Record<typeof key, number>>)[key] ?? 0), 0);
}
export function activeSkillAvailable(s: GameState) {
  return s.screen === 'battle' && s.hp > 0 && s.energy >= CHARACTER_SKILLS[s.heroId].cost && s.turn >= (s.activeReadyTurn ?? 0);
}
