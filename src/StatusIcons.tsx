import { STATUS_RULES } from './data';
import type { Statuses } from './types';

export const STATUS_VISUALS = {
  burn: { name: 'Burn', path: 'M12 2c2 6 8 7 8 13a8 8 0 0 1-16 0c0-3 2-5 4-7l1 5c3-2 3-6 3-11Z' },
  freeze: { name: 'Freeze', path: 'M12 2v20M3 7l18 10M3 17 21 7M9 4l3 3 3-3M9 20l3-3 3 3M3 10l4-1-1-4M18 19l-1-4 4-1M3 14l4 1-1 4M18 5l-1 4 4 1' },
  poison: { name: 'Poison', path: 'M12 2C9 7 5 10 5 15a7 7 0 0 0 14 0c0-5-4-8-7-13ZM9 13h.1M15 13h.1M9 17l6-2' },
  weak: { name: 'Weak', path: 'm6 21 4-6M5 14l6 5M10 14l3-4-1-3 7-5 1 7-4 4-3-1M4 4l4 2M2 9h5' },
  vulnerable: { name: 'Vulnerable', path: 'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 12 21 3M16 3h5v5' },
  shield: { name: 'Shield', path: 'm12 2 8 4-1 9-7 7-7-7-1-9 8-4Zm-4 9 3 3 5-6' },
} as const;
export type StatusIconName = keyof typeof STATUS_VISUALS;

export function EffectSymbol({ name }: { name: StatusIconName }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={STATUS_VISUALS[name].path} fill={name === 'burn' || name === 'shield' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function StatusIcons({ statuses, shield = 0, side = 'right' }: { statuses: Statuses; shield?: number; side?: 'left' | 'right' }) {
  const effects: [StatusIconName, number][] = [...(shield > 0 ? [['shield', shield] as [StatusIconName, number]] : []), ...Object.entries(statuses).filter(([, value]) => (value || 0) > 0) as [StatusIconName, number][]];
  return <div className={`status-rail ${side}`} aria-label="Active effects">{effects.map(([key, count]) => <span key={key} className={`status-icon status-${key}`} tabIndex={0} role="img" aria-label={`${STATUS_VISUALS[key].name}, ${count}${key === 'shield' ? ' protection' : ' stacks'}`}>
    <EffectSymbol name={key} /><b className="status-count" aria-hidden="true">{count}</b>
    <span className="status-tooltip" role="tooltip"><strong>{STATUS_VISUALS[key].name} · {count}</strong><span>{STATUS_RULES[key]}</span></span>
  </span>)}</div>;
}
