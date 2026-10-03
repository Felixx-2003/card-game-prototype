import {STATUS_RULES} from './data';
// Register an effect here: one path, tone, name and truthful explanation serves every surface.
export const EFFECTS = {
 attack:{name:'Attack',tone:'attack',path:'M5 21l5-5M4 14l6 6M8 14 18 3l3 0 0 3L11 17Z',baseDescription:'Base attack stat. Damage on each hand card includes its own effects and bonuses.',description:'Attack damage before Shield, equipment and status modifiers.'},
 shield:{name:'Shield',tone:'defence',path:'M12 2 21 6 19 16 12 22 5 16 3 6Z M8 11l3 3 5-6',description:STATUS_RULES.shield},
 burn:{name:'Burn',tone:'fire',path:'M12 2c2 6 8 7 8 13a8 8 0 0 1-16 0c0-3 2-5 4-7l1 5c3-2 3-6 3-11Z',description:STATUS_RULES.burn},
 freeze:{name:'Freeze',tone:'ice',path:'M12 2v20M3 7l18 10M3 17 21 7M8 3l4 4 4-4M8 21l4-4 4 4',description:STATUS_RULES.freeze},
 heal:{name:'Heal',tone:'heal',path:'M12 21 3 12C-1 5 7 0 12 6c5-6 13-1 9 6Z M12 9v8M8 13h8',description:'Restore HP up to your maximum. Healing never exceeds maximum HP.'},
 power:{name:'Power',tone:'arcane',path:'M12 2 15 8 22 9 17 14 18 22 12 18 6 22 7 14 2 9 9 8Z M12 14V7m-3 3 3-3 3 3',description:'Adds strength to the effects described on this card or bonus.'},
 weak:{name:'Weak',tone:'debuff',path:'M5 21l5-5M4 14l6 6M10 14l3-4-1-3 7-5 1 7-4 4-3-1M3 3l5 3M2 9h5',description:STATUS_RULES.weak},
 vulnerable:{name:'Vulnerable',tone:'debuff',path:'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 12 21 3M16 3h5v5',description:STATUS_RULES.vulnerable},
 poison:{name:'Poison',tone:'debuff',path:'M12 2C9 7 5 10 5 15a7 7 0 0 0 14 0c0-5-4-8-7-13Z M9 13h.1M15 13h.1M9 17l6-2',description:STATUS_RULES.poison},
 arcane:{name:'Arcane',tone:'arcane',path:'M12 2 21 12 12 22 3 12Z M12 7l5 5-5 5-5-5Z',description:'Magic effects follow the values and targeting shown on their card.'},
 counter:{name:'Round counter',tone:'neutral',path:'M8 2h8M12 2v4M19 5l2 2M12 6a8 8 0 1 0 .1 0M12 9v5l3 2',description:'The current battle round. Enemies act when you press End Turn; this is not an attack countdown.'},
 blood:{name:'HP cost',tone:'debuff',path:'M12 21 3 12C-1 5 7 0 12 6c5-6 13-1 9 6Z M13 7l-3 6 4 1-3 5',description:'Lose HP directly when used. Shield and Defence do not reduce this cost.'},
 health:{name:'Health',tone:'heal',path:'M12 21 3 12C-1 5 7 0 12 6c5-6 13-1 9 6Z',description:'Remaining HP. At 0 HP this unit is defeated. Shield can absorb attack damage.'},
 draw:{name:'Draw',tone:'neutral',path:'M7 4h13v16H7Z M4 7H2v15h13v-2',description:'Draw cards into your hand if space is available.'},
 energy:{name:'Energy discount',tone:'ice',path:'M14 2 4 14h7l-1 8 10-13h-7Z',description:'Reduces the Energy cost described here. Costs cannot fall below 0.'},
 echo:{name:'Repeat',tone:'arcane',path:'M5 9a8 8 0 0 1 13-4l3 4M21 3v6h-6M19 15a8 8 0 0 1-13 4l-3-4M3 21v-6h6',description:'Repeat the effect at the stated strength, rounded up. Draw and status applications repeat once.'},
 cleanse:{name:'Cleanse',tone:'heal',path:'M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z',description:'Remove harmful statuses from the target.'},
 hex:{name:'Hex',tone:'debuff',path:'M12 2 21 7v10l-9 5-9-5V7Z M7 8l10 8M17 8 7 16',description:'An enemy action that applies the displayed harmful status.'},
 defence:{name:'Defence',tone:'defence',path:'M12 2 21 6 19 16 12 22 5 16 3 6Z M8 12h8',description:'Base defence reduces incoming attack damage before Shield is spent.'},
 cooldown:{name:'Cooldown',tone:'neutral',path:'M8 2h8M12 2v4M19 5l2 2M12 6a8 8 0 1 0 .1 0M12 9v5l3 2',description:'Turns until this active skill is ready again. Its cooldown resets each battle.'},
} as const;
export type EffectId=keyof typeof EFFECTS;
