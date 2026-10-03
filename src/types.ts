import type { GlobalBuffId } from './abilities';
export type HeroId = 'warrior' | 'mage';
export type CardType = 'skill' | 'spell' | 'equipment' | 'rune';
export type Status = 'burn' | 'freeze' | 'poison' | 'weak' | 'vulnerable';
export type Statuses = Partial<Record<Status, number>>;
export type Screen = 'menu' | 'select' | 'battle' | 'reward' | 'upgrade' | 'progress' | 'victory' | 'defeat';
export type Slot = 'weapon' | 'armor';
export interface Effect { damage?: number; shield?: number; heal?: number; draw?: number; status?: Status; stacks?: number; all?: boolean; cleanse?: boolean }
export interface CardDef { id: string; name: string; type: CardType; cost: number; description: string; rarity: 'common' | 'rare' | 'epic'; element: string; art: string; target: 'enemy' | 'hero' | 'card'; effect: Effect; upgrade?: Partial<Effect> & { cost?: number }; slot?: Slot; gear?: { skillDamage?: number; shieldPerTurn?: number; firstSpellDiscount?: number; spellDamage?: number; healPerTurn?: number }; runeId?: string }
export interface RuneDef { id: string; name: string; description: string; color: string; compatible: CardType[]; requiresDamage?: boolean; modifier: 'fire' | 'power' | 'echo' | 'cheap' | 'blood' | 'chain' | 'frost' | 'renew' }
export interface CardInstance { uid: string; defId: string; upgraded: boolean; rune?: string }
export interface HeroDef { id: HeroId; name: string; title: string; hp: number; attack: number; defense: number; maxEnergy: number; passive: string; element: string; equipmentSlots: Slot[]; startingDeck: string[]; description: string }
export interface Intent { kind: 'attack' | 'defend' | 'buff' | 'debuff' | 'special'; label: string; damage?: number; shield?: number; status?: Status; stacks?: number; heal?: number }
export interface EnemyDef { id: string; name: string; role: string; hp: number; art: string; tier: 'normal' | 'elite' | 'boss'; pattern: Intent[]; phase2?: Intent[] }
export interface Enemy { uid: string; defId: string; hp: number; maxHp: number; shield: number; statuses: Statuses; patternIndex: number; phase: number; intent: Intent }
export interface Reward { id: string; kind: 'card' | 'heal' | 'upgrade'; cardId?: string; name: string; description: string }
export interface CombatEvent { id: number; target: string; kind: 'damage' | 'heal' | 'shield' | 'status' | 'ability' | 'passive'; amount: number; label?: string }
export interface GameState { version: 1; globalBuffs?: GlobalBuffId[]; boonEncounter?: number; activeReadyTurn?: number; screen: Screen; heroId: HeroId; hp: number; maxHp: number; shield: number; statuses: Statuses; energy: number; maxEnergy: number; turn: number; encounter: number; cards: CardInstance[]; deck: string[]; hand: string[]; discard: string[]; gear: Partial<Record<Slot, string>>; enemies: Enemy[]; log: string[]; events: CombatEvent[]; rewards: Reward[]; firstSkill: boolean; firstSpell: boolean; upgradesRemaining: number; seed: number; serial: number; battlesWon: number }
export type DebugAction = 'restart' | 'energy' | 'heal' | 'cards' | 'boss' | 'win' | 'lose';
