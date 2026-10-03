export function RewardChest() {
  return <div className="reward-chest" aria-hidden="true"><svg viewBox="0 0 200 125">
    <g className="chest-rays" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M100 7v18M42 24l14 13M157 24l-14 13M24 65h17M161 65h17" /></g>
    <g stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round"><path d="M43 63h114v46H43z" fill="var(--forest)" /><path d="M52 68h97v33H52z" fill="var(--ochre)" /><path className="chest-lid" d="M43 63V48Q43 25 70 25h60q27 0 27 23v15Z" fill="var(--coral)" /><path d="M60 38v25M140 38v25M61 68v39M139 68v39" fill="none" stroke="var(--paper)" /><path d="M91 60h18v26H91z" fill="var(--paper-light)" /><circle cx="100" cy="73" r="3" fill="var(--ink)" stroke="none" /></g>
    <g className="chest-sparkles" fill="var(--ochre)"><path d="m33 37 3-9 3 9 9 3-9 3-3 9-3-9-9-3Zm131 46 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" /></g>
  </svg></div>;
}
