export type Rarity='common'|'uncommon'|'rare'|'epic'|'legendary';
// Add/change a rarity in this registry and its CSS tokens. All contexts use the same ornament.
export const RARITIES:Record<Rarity,{name:string;path:string}>={
 common:{name:'Common',path:'M12 9a3 3 0 1 0 .1 0'},
 uncommon:{name:'Uncommon',path:'M5 20Q2 4 20 3Q23 19 5 20Z M5 20 17 7'},
 rare:{name:'Rare',path:'M12 3a9 9 0 1 0 .1 0 M7 7l9-1 3 7-7 6-7-6Z'},
 epic:{name:'Epic',path:'M12 2 22 12 12 22 2 12Z M12 6l6 6-6 6-6-6Z'},
 legendary:{name:'Legendary',path:'M3 6l5 5 4-8 4 8 5-5-3 14H6Z M7 16h10'},
};
export function RarityMark({rarity}:{rarity:Rarity}) {return <span className="rarity-mark" aria-label={`${RARITIES[rarity].name} rarity`} title={RARITIES[rarity].name}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={RARITIES[rarity].path} fill="currentColor" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round"/></svg><span>{RARITIES[rarity].name}</span></span>;}
