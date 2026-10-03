import { useEffect, useRef, useSyncExternalStore } from 'react';
import { audioController, playSfx } from './audio';

export interface SettingsProps { onClose: () => void; theme: 'a' | 'b' | 'c' | 'd'; onThemeChange: (theme: 'a' | 'b' | 'c' | 'd') => void }
export function Settings({ onClose, theme, onThemeChange }: SettingsProps) {
  const settings = useSyncExternalStore(audioController.subscribe, audioController.getSettings, audioController.getSettings);
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    return () => previous?.focus();
  }, []);
  return <section ref={panel} className="modal settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') {
      const elements = panel.current?.querySelectorAll<HTMLElement>('button, input, select');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }}>
    <div className="settings-heading"><div><span className="eyebrow">Make yourself at home</span><h2 id="settings-title">Settings</h2></div><button ref={closeButton} className="icon-button" aria-label="Close settings" onClick={() => { playSfx('click'); onClose(); }}>×</button></div>
    <fieldset className="settings-group"><legend>Sound</legend>
      <label className="settings-toggle"><input type="checkbox" checked={settings.muted} onChange={event => audioController.setSettings({ muted: event.target.checked })} />Mute all sound</label>
      <label className="settings-volume" htmlFor="music-volume"><span>Music <output>{settings.musicVolume}%</output></span><input id="music-volume" type="range" min="0" max="100" value={settings.musicVolume} aria-valuetext={`${settings.musicVolume} percent`} onChange={event => audioController.setSettings({ musicVolume: Number(event.target.value) })} /></label>
      <label className="settings-volume" htmlFor="sfx-volume"><span>Sound effects <output>{settings.sfxVolume}%</output></span><input id="sfx-volume" type="range" min="0" max="100" value={settings.sfxVolume} aria-valuetext={`${settings.sfxVolume} percent`} onChange={event => audioController.setSettings({ sfxVolume: Number(event.target.value) })} onPointerUp={() => playSfx('reveal')} onKeyUp={() => playSfx('click')} /></label>
      <p className="settings-hint">An original melody accompanies your journey. Your sound preferences are saved on this device.</p>
    </fieldset>
    <fieldset className="settings-group"><legend>Appearance</legend><label className="settings-theme" htmlFor="theme-choice">Visual theme<select id="theme-choice" value={theme} onChange={event => { onThemeChange(event.target.value as 'a' | 'b' | 'c' | 'd'); playSfx('click'); }}><option value="a">A · Handmade</option><option value="b">B · Painted fantasy</option><option value="c">C · Cartoon quest</option><option value="d">D · Illustrated archive</option></select></label></fieldset>
    <button className="primary" onClick={() => { playSfx('click'); onClose(); }}>Back to adventure</button>
  </section>;
}
export default Settings;
