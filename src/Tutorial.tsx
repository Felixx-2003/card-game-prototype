import { useEffect, useRef, useState } from 'react';
import { CardArt, Portrait } from './Art';
import { EffectSymbol } from './StatusIcons';

export const LESSONS = [
  { title: 'One hero. A deck of possibilities.', subtitle: 'Win four encounters by shaping your cards into a stronger deck.', cards: [
    { id: 'character', name: 'Character', type: 'character', text: 'This is you. Protect your HP and use your unique passive.' },
    { id: 'slash', name: 'Skills', type: 'skill', text: 'Reliable attacks, Shield and useful actions.' },
    { id: 'fireball', name: 'Spells', type: 'spell', text: 'Magic with powerful effects and unusual tricks.' },
  ] },
  { title: 'Read. Play. End your turn.', subtitle: 'Enemy intentions tell you what happens next. Make every Energy count.', cards: [
    { id: 'energy', name: 'Energy', type: 'energy', text: 'Spend the cost in a card’s corner. You get 3 Energy each turn.' },
    { id: 'target', name: 'Drag to a target', type: 'target', text: 'Enemies for attacks. Your hero for Shield or healing. Glowing targets show where.' },
    { id: 'turn', name: 'End Turn', type: 'turn', text: 'Enemies act. Effects resolve. Refill Energy and draw back to 5 cards.' },
  ] },
  { title: 'Make the deck your own.', subtitle: 'Each victory brings one reward. Prepare at camp, then follow the path to the boss.', cards: [
    { id: 'flame-sword', name: 'Equipment', type: 'equipment', text: 'Drop it onto your Character. It stays active until replaced or the battle ends.' },
    { id: 'rune-fire', name: 'Runes', type: 'rune', text: 'Attach to a compatible card to change how it works. One Rune per card, for this run.' },
    { id: 'upgrade', name: 'Camp & upgrades', type: 'upgrade', text: 'Upgrade a card once. At camp you can also attach, replace or remove Runes.' },
  ] },
];
export const BATTLE_TIPS = [
  'Intentions show what enemies do after End Turn.',
  'Spend Energy: attacks go on enemies, Shield and healing go on your hero.',
  'End Turn refills Energy and draws back to five. Shield protects you.',
];

export function Tutorial({ theme, onClose, onSkip, tips, onTipsChange }: { theme: 'a' | 'b'; onClose: () => void; onSkip: () => void; tips: boolean; onTipsChange: (value: boolean) => void }) {
  const [step, setStep] = useState(0);
  const panel = useRef<HTMLElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus();
    return () => previous?.focus();
  }, []);
  const lesson = LESSONS[step];
  return <section ref={panel} className="paper-modal tutorial-modal" role="dialog" aria-modal="true" aria-label="How to play" onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') {
      const controls = panel.current?.querySelectorAll<HTMLElement>('button, input');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }}>
    <button ref={close} className="close-button" onClick={onClose} aria-label="Close tutorial">×</button>
    <div className="tutorial-heading"><span className="eyebrow">THE QUICK FIELD GUIDE · {step + 1} / {LESSONS.length}</span><h2>{lesson.title}</h2><p>{lesson.subtitle}</p></div>
    <div className="tutorial-grid" key={step}>{lesson.cards.map(card => <article className={`lesson-card ${card.type}`} key={card.id}>
      <div className="lesson-art">{card.type === 'character' ? <Portrait kind="warrior" theme={theme} /> : ['skill', 'spell', 'equipment', 'rune'].includes(card.type) ? <CardArt id={card.id} type={card.type} theme={theme} /> : card.type === 'energy' ? <div className="lesson-energy"><b>3 / 3</b><span /></div> : card.type === 'target' ? <div className="lesson-target"><span>▣</span><b>→</b><EffectSymbol name="vulnerable" /></div> : <span className="lesson-symbol">{card.type === 'turn' ? '↻' : '✦'}</span>}</div>
      <h3>{card.name}</h3><p>{card.text}</p>
    </article>)}</div>
    <div className="tutorial-footer"><label className="tutorial-preference"><input type="checkbox" checked={tips} onChange={e => onTipsChange(e.target.checked)} /> Show first-battle tips</label><div className="tutorial-navigation"><button className="text-button" onClick={onSkip}>Skip tutorial</button>{step > 0 && <button className="secondary-button" onClick={() => setStep(step - 1)}>Back</button>}<button className="primary-button" onClick={() => step < LESSONS.length - 1 ? setStep(step + 1) : onClose()}>{step < LESSONS.length - 1 ? 'Next →' : 'Ready to play'}</button></div></div>
  </section>;
}
