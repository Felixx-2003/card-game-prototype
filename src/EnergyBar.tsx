export function EnergyBar({ current, max }: { current: number; max: number }) {
  return <div className={`energy-meter ${current === 0 ? 'empty' : ''}`}>
    <div className="energy-heading"><b>ENERGY</b><strong className="energy-value">{current} <small>/ {max}</small></strong></div>
    <div className="energy-bar" role="progressbar" aria-label="Energy" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(current, max)} aria-valuetext={`${current} of ${max} energy`}>
      <span className="energy-fill" style={{ width: `${Math.max(0, Math.min(100, current / max * 100))}%` }} />
      <span className="energy-pips" aria-hidden="true">{Array.from({ length: max }, (_, index) => <i key={index} className={index < current ? 'charged' : 'spent'} />)}</span>
    </div><span className="energy-refill">{current === 0 ? 'End Turn to refill' : 'Refills every turn'}</span>
  </div>;
}
