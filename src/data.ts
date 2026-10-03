import type { CardDef, EnemyDef, HeroDef, HeroId, RuneDef, Status } from './types';

const skill = (id: string, name: string, cost: number, description: string, effect: CardDef['effect'], upgrade: CardDef['upgrade'], rarity: CardDef['rarity'] = 'common'): CardDef => ({ id, name, cost, description, effect, upgrade, rarity, type: 'skill', element: 'steel', art: id, target: effect.damage ? 'enemy' : 'hero' });
const spell = (id: string, name: string, cost: number, description: string, element: string, effect: CardDef['effect'], upgrade: CardDef['upgrade'], rarity: CardDef['rarity'] = 'common'): CardDef => ({ id, name, cost, description, element, effect, upgrade, rarity, type: 'spell', art: id, target: effect.damage || effect.status ? 'enemy' : 'hero' });
const gear = (id: string, name: string, cost: number, description: string, slot: CardDef['slot'], bonus: CardDef['gear'], element = 'steel'): CardDef => ({ id, name, cost, description, slot, gear: bonus, element, type: 'equipment', rarity: 'rare', target: 'hero', effect: {}, upgrade: { cost: Math.max(0, cost - 1) }, art: id });

export const RUNES: Record<string, RuneDef> = {
  fire: { id: 'fire', name: 'Fire Rune', description: 'Attacks apply 2 Burn. Burn hurts at round end, then fades by 1.', color: '#d85d35', compatible: ['skill', 'spell', 'equipment'], requiresDamage: true, modifier: 'fire' },
  power: { id: 'power', name: 'Power Rune', description: 'Attacks deal 4 more damage; weapons add 3 damage to their matching attacks.', color: '#b58031', compatible: ['skill', 'spell', 'equipment'], requiresDamage: true, modifier: 'power' },
  echo: { id: 'echo', name: 'Echo Rune', description: 'Activate again at half strength (rounded up). Draw and status repeat once.', color: '#719f95', compatible: ['skill', 'spell'], modifier: 'echo' },
  cheap: { id: 'cheap', name: 'Light Rune', description: 'Cost 1 less Energy, minimum 0. Warrior and Ring discounts still apply.', color: '#beb088', compatible: ['skill', 'spell', 'equipment'], modifier: 'cheap' },
  blood: { id: 'blood', name: 'Blood Rune', description: 'Damage, healing and Shield gain +5. Lose 3 HP directly when used.', color: '#b2474a', compatible: ['skill', 'spell'], modifier: 'blood' },
  chain: { id: 'chain', name: 'Chain Rune', description: 'Single-target attack also strikes a different enemy at half damage.', color: '#d6a72a', compatible: ['skill', 'spell'], requiresDamage: true, modifier: 'chain' },
  frost: { id: 'frost', name: 'Ice Rune', description: 'Attacks Freeze the target for one action. Does not stack on a frozen target.', color: '#65aabd', compatible: ['skill', 'spell', 'equipment'], requiresDamage: true, modifier: 'frost' },
  renew: { id: 'renew', name: 'Heal Rune', description: 'Heal 3 HP when used. Equipment heals 2 at the start of each turn.', color: '#729253', compatible: ['skill', 'spell', 'equipment'], modifier: 'renew' },
};

const definitions: CardDef[] = [
  skill('slash', 'Slash', 1, 'Deal 7 damage.', { damage: 7 }, { damage: 10 }),
  skill('guard', 'Guard', 1, 'Gain 7 Shield.', { shield: 7 }, { shield: 11 }),
  skill('heavy-strike', 'Heavy Strike', 2, 'Deal 14 damage.', { damage: 14 }, { damage: 19 }),
  skill('quick-slash', 'Quick Slash', 0, 'Deal 4 damage.', { damage: 4 }, { damage: 6 }),
  skill('rally', 'Rally', 1, 'Draw 2 cards and gain 3 Shield.', { draw: 2, shield: 3 }, { shield: 6 }),
  skill('shield-bash', 'Shield Bash', 1, 'Deal 6 damage and gain 5 Shield.', { damage: 6, shield: 5 }, { damage: 9, shield: 7 }),
  skill('cleave', 'Cleave', 2, 'Deal 9 damage to all enemies.', { damage: 9, all: true }, { damage: 13 }, 'rare'),
  skill('hamstring', 'Trip', 1, 'Deal 5 damage. Apply 2 Weak.', { damage: 5, status: 'weak', stacks: 2 }, { damage: 8, stacks: 3 }),
  skill('piercing-thrust', 'Pierce', 1, 'Deal 6 damage. Apply 2 Vulnerable.', { damage: 6, status: 'vulnerable', stacks: 2 }, { damage: 9, stacks: 3 }),
  skill('toxic-dart', 'Poison Dart', 1, 'Deal 3 damage. Apply 4 Poison.', { damage: 3, status: 'poison', stacks: 4 }, { stacks: 7 }),
  skill('second-wind', 'Rest', 1, 'Heal 6 HP and draw 1 card.', { heal: 6, draw: 1 }, { heal: 10 }),
  skill('fortify', 'Big Shield', 2, 'Gain 16 Shield. Remove harmful statuses.', { shield: 16, cleanse: true }, { shield: 22 }, 'rare'),
  spell('fireball', 'Fireball', 2, 'Deal 12 damage. Apply 3 Burn.', 'fire', { damage: 12, status: 'burn', stacks: 3 }, { damage: 16, stacks: 4 }),
  spell('freeze', 'Freeze', 1, 'Deal 4 damage. Freeze for one action.', 'ice', { damage: 4, status: 'freeze', stacks: 1 }, { damage: 8 }),
  spell('heal', 'Heal', 2, 'Heal 12 HP.', 'light', { heal: 12 }, { heal: 17 }),
  spell('chain-lightning', 'Lightning', 2, 'Deal 10 damage to every enemy.', 'storm', { damage: 10, all: true }, { damage: 14 }, 'rare'),
  spell('arcane-bolt', 'Magic Bolt', 1, 'Deal 8 damage.', 'arcane', { damage: 8 }, { damage: 12 }),
  spell('ice-ward', 'Ice Shield', 1, 'Gain 9 Shield and draw 1 card.', 'ice', { shield: 9, draw: 1 }, { shield: 13 }),
  spell('venom-cloud', 'Poison Cloud', 2, 'Deal 3 damage and apply 4 Poison to all.', 'nature', { damage: 3, status: 'poison', stacks: 4, all: true }, { stacks: 7 }, 'rare'),
  spell('sunburst', 'Sun Blast', 3, 'Deal 19 damage and heal 7 HP.', 'light', { damage: 19, heal: 7 }, { damage: 25, heal: 10 }, 'epic'),
  gear('flame-sword', 'Fire Sword', 1, 'Skills deal +3 damage.', 'weapon', { skillDamage: 3 }, 'fire'),
  gear('iron-armor', 'Iron Armor', 1, 'Gain 5 Shield each turn.', 'armor', { shieldPerTurn: 5 }),
  gear('mage-ring', 'Magic Ring', 1, 'First Spell each turn costs 1 less.', 'armor', { firstSpellDiscount: 1 }, 'arcane'),
  gear('thorn-mail', 'Leaf Armor', 1, 'Each turn: 3 Shield, heal 1 HP.', 'armor', { shieldPerTurn: 3, healPerTurn: 1 }, 'nature'),
  gear('storm-staff', 'Magic Staff', 1, 'Spells deal +3 damage.', 'weapon', { spellDamage: 3 }, 'storm'),
  gear('oak-charm', 'Heal Charm', 1, 'Heal 3 HP each turn.', 'armor', { healPerTurn: 3 }, 'nature'),
  ...Object.values(RUNES).map(rune => ({ id: `rune-${rune.id}`, name: rune.name, type: 'rune' as const, cost: 0, description: rune.description, element: rune.id, rarity: 'rare' as const, target: 'card' as const, effect: {}, art: `rune-${rune.id}`, runeId: rune.id })),
];
// Rarity is collectible presentation only; it does not change rules, reward weights or save IDs.
const uncommon=new Set(['quick-slash','rally','hamstring','piercing-thrust','second-wind','ice-ward']);
for(const card of definitions){if(uncommon.has(card.id))card.rarity='uncommon';if(card.id==='chain-lightning'||card.id==='venom-cloud')card.rarity='epic';if(card.id==='sunburst')card.rarity='legendary';}
export const CARDS: Record<string, CardDef> = Object.fromEntries(definitions.map(card => [card.id, card]));
export const HEROES: Record<HeroId, HeroDef> = {
  warrior: { id: 'warrior', name: 'Warrior', title: 'The Defender', hp: 74, attack: 2, defense: 1, maxEnergy: 3, passive: 'First Skill each turn costs 1 less Energy.', element: 'steel', equipmentSlots: ['weapon', 'armor'], startingDeck: ['slash', 'slash', 'slash', 'guard', 'guard', 'heavy-strike', 'fireball', 'flame-sword'], description: 'A sturdy defender who turns trusty gear into mighty attacks.' },
  mage: { id: 'mage', name: 'Mage', title: 'The Wizard', hp: 56, attack: 1, defense: 0, maxEnergy: 3, passive: 'First Spell each turn gains +2 damage, healing or Shield.', element: 'arcane', equipmentSlots: ['weapon', 'armor'], startingDeck: ['arcane-bolt', 'arcane-bolt', 'fireball', 'freeze', 'ice-ward', 'guard', 'heal', 'mage-ring'], description: 'A nimble spellcaster who controls foes and shapes cards with runes.' },
};

const attack = (damage: number, label = `Attack ${damage}`): EnemyDef['pattern'][number] => ({ kind: 'attack', label, damage });
export const ENEMIES: Record<string, EnemyDef> = {
  'acorn-raider': { id: 'acorn-raider', name: 'Goblin', role: 'Attacker', hp: 26, tier: 'normal', art: 'acorn-raider', pattern: [attack(6), attack(8, 'Wild swing 8'), { kind: 'defend', label: 'Hide · 5 Shield', shield: 5 }] },
  'moss-shell': { id: 'moss-shell', name: 'Turtle', role: 'Tank', hp: 35, tier: 'normal', art: 'moss-shell', pattern: [{ kind: 'defend', label: 'Shell · 9 Shield', shield: 9 }, attack(7), attack(7)] },
  'ember-imp': { id: 'ember-imp', name: 'Imp', role: 'Mage', hp: 24, tier: 'normal', art: 'ember-imp', pattern: [{ kind: 'special', label: 'Sparks · 5 + 2 Burn', damage: 5, status: 'burn', stacks: 2 }, attack(8)] },
  'briar-witch': { id: 'briar-witch', name: 'Witch', role: 'Debuffer', hp: 28, tier: 'normal', art: 'briar-witch', pattern: [{ kind: 'debuff', label: 'Hex · 2 Weak', status: 'weak', stacks: 2 }, attack(9), { kind: 'special', label: 'Venom · 4 + 3 Poison', damage: 4, status: 'poison', stacks: 3 }] },
  'bell-sprite': { id: 'bell-sprite', name: 'Fairy', role: 'Support', hp: 22, tier: 'normal', art: 'bell-sprite', pattern: [{ kind: 'buff', label: 'Mend · heal allies 4', heal: 4 }, attack(6), { kind: 'debuff', label: 'Chime · 2 Vulnerable', status: 'vulnerable', stacks: 2 }] },
  'bramble-knight': { id: 'bramble-knight', name: 'Knight', role: 'Elite tank', hp: 64, tier: 'elite', art: 'bramble-knight', pattern: [{ kind: 'defend', label: 'Thorn wall · 12 Shield', shield: 12 }, { kind: 'special', label: 'Thorn lance · 13 + Weak', damage: 13, status: 'weak', stacks: 1 }, attack(10)] },
  'lantern-warden': { id: 'lantern-warden', name: 'Guard', role: 'Elite mage', hp: 58, tier: 'elite', art: 'lantern-warden', pattern: [{ kind: 'special', label: 'Flare · 10 + 2 Burn', damage: 10, status: 'burn', stacks: 2 }, { kind: 'debuff', label: 'Expose · 2 Vulnerable', status: 'vulnerable', stacks: 2 }, attack(14)] },
  'hollow-regent': { id: 'hollow-regent', name: 'Tree King', role: 'Boss · two phases', hp: 112, tier: 'boss', art: 'hollow-regent', pattern: [attack(10, 'Root swipe · 10'), { kind: 'defend', label: 'Crown guard · 14 Shield', shield: 14 }, { kind: 'special', label: 'Royal thorns · 17 + Weak', damage: 17, status: 'weak', stacks: 1 }], phase2: [{ kind: 'debuff', label: 'Shattered crown · 2 Vulnerable', status: 'vulnerable', stacks: 2 }, attack(16, 'Frenzy · 16'), { kind: 'special', label: 'Crownfall · 22 + 2 Burn', damage: 22, status: 'burn', stacks: 2 }] },
};
export const ENCOUNTERS = [
  { name: 'Forest Gate', tier: 'normal', enemyIds: ['acorn-raider', 'moss-shell'] },
  { name: 'Magic Woods', tier: 'normal', enemyIds: ['ember-imp', 'briar-witch', 'bell-sprite'] },
  { name: 'Old Tower', tier: 'elite', enemyIds: ['bramble-knight'] },
  { name: 'Tree King', tier: 'boss', enemyIds: ['hollow-regent'] },
];
export const STATUS_RULES: Record<Status | 'shield', string> = {
  burn: 'At round end, take damage equal to Burn (ignores Shield); Burn loses 1 stack.',
  poison: 'At round end, take damage equal to Poison (ignores Shield); Poison loses 1 stack.',
  freeze: 'Skip the next enemy action, then lose one stack.',
  weak: 'Attack damage is reduced by 25%; lose 1 stack at round end.',
  vulnerable: 'Incoming attack damage is increased by 50%; lose 1 stack at round end.',
  shield: 'Absorbs attack damage. Expires at the start of your next turn.',
};
