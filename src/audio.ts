export type SfxName = 'hover' | 'drag' | 'drop' | 'play' | 'hit' | 'heal' | 'equip' | 'rune' | 'reveal' | 'reward' | 'click' | 'victory' | 'defeat' | 'turn' | 'invalid';
export interface AudioSettings { muted: boolean; musicVolume: number; sfxVolume: number }
const STORAGE_KEY = 'card-game-prototype-audio-v1';
const DEFAULTS: AudioSettings = { muted: false, musicVolume: 35, sfxVolume: 65 };
export function normalizeAudioSettings(value: Partial<AudioSettings> = {}): AudioSettings {
  const volume = (n: unknown, fallback: number) => typeof n === 'number' && Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : fallback;
  return { muted: typeof value.muted === 'boolean' ? value.muted : DEFAULTS.muted, musicVolume: volume(value.musicVolume, DEFAULTS.musicVolume), sfxVolume: volume(value.sfxVolume, DEFAULTS.sfxVolume) };
}
function readSettings(): AudioSettings {
  try { const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); return normalizeAudioSettings(value && typeof value === 'object' ? value : {}); } catch { return { ...DEFAULTS }; }
}

// An original 16-bar lantern waltz. Sparse bell notes float over warm fifths.
const MELODY = [69, 72, 76, 74, 72, 69, 67, 64, 65, 69, 72, 76, 74, 72, 69, 67, 64, 67, 71, 74, 72, 71, 67, 64, 65, 69, 72, 74, 72, 69, 67, 69];
const ROOTS = [45, 41, 48, 43];
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class AudioController {
  private settings = readSettings();
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNote = 0;
  private step = 0;
  private unlocked = false;
  private unavailable = false;
  private listeners = new Set<() => void>();
  private voices = new Set<OscillatorNode>();
  private lastSfx = new Map<SfxName, number>();
  private visibilityBound = false;

  getSettings = (): AudioSettings => this.settings;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  setSettings = (patch: Partial<AudioSettings>): void => {
    this.settings = normalizeAudioSettings({ ...this.settings, ...patch });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); } catch { /* Private browsing can deny storage. */ }
    this.applyGains();
    this.syncMusic();
    this.listeners.forEach(listener => listener());
  };

  // Call only from a click, pointer, or keyboard event; constructing the singleton is silent.
  unlock = async (): Promise<void> => {
    if (this.unavailable) return;
    try {
      if (!this.context) {
        const AudioContextClass = typeof window === 'undefined' ? undefined : window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) { this.unavailable = true; return; }
        this.context = new AudioContextClass();
        this.musicGain = this.context.createGain();
        this.sfxGain = this.context.createGain();
        this.musicGain.connect(this.context.destination);
        this.sfxGain.connect(this.context.destination);
        this.applyGains();
        if (typeof document !== 'undefined' && !this.visibilityBound) {
          document.addEventListener('visibilitychange', this.onVisibility);
          this.visibilityBound = true;
        }
      }
      if (this.context.state === 'suspended') await this.context.resume();
      this.unlocked = this.context.state === 'running';
      this.syncMusic();
    } catch { /* A later user gesture can retry a blocked resume. */ }
  };

  private applyGains(): void {
    if (!this.context) return;
    const time = this.context.currentTime;
    this.musicGain?.gain.setTargetAtTime(this.settings.muted ? 0 : this.settings.musicVolume / 100 * 0.28, time, 0.03);
    this.sfxGain?.gain.setTargetAtTime(this.settings.muted ? 0 : this.settings.sfxVolume / 100 * 0.32, time, 0.02);
  }
  private onVisibility = (): void => {
    if (!this.context) return;
    if (document.hidden) {
      this.stopMusic();
      void this.context.suspend().catch(() => {});
    } else if (this.unlocked) {
      void this.context.resume().then(() => this.syncMusic()).catch(() => {});
    }
  };
  private syncMusic(): void {
    if (!this.context || !this.unlocked || this.context.state !== 'running' || this.settings.muted || this.settings.musicVolume === 0 || (typeof document !== 'undefined' && document.hidden)) {
      this.stopMusic(); return;
    }
    if (this.timer) return;
    this.nextNote = this.context.currentTime + 0.08;
    this.scheduleMusic();
    this.timer = setInterval(() => this.scheduleMusic(), 100);
  }
  private stopMusic(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    // Scheduled music voices are cancelled immediately when music is disabled.
    for (const voice of this.voices) { try { voice.stop(); } catch { /* Already ended. */ } }
    this.voices.clear();
  }
  private scheduleMusic(): void {
    if (!this.context || !this.musicGain) return;
    while (this.nextNote < this.context.currentTime + 0.4) {
      const index = this.step % MELODY.length;
      this.tone(hz(MELODY[index]), this.nextNote, 0.95, 'sine', 0.22, this.musicGain, true);
      if (index % 8 === 0) {
        const root = ROOTS[Math.floor(index / 8)];
        this.tone(hz(root), this.nextNote, 4.4, 'triangle', 0.11, this.musicGain, true);
        this.tone(hz(root + 7), this.nextNote + 0.03, 4.3, 'sine', 0.08, this.musicGain, true);
      }
      this.step++;
      this.nextNote += 0.6;
    }
  }
  private tone(frequency: number, start: number, duration: number, wave: OscillatorType, amplitude: number, output: GainNode, music = false, endFrequency?: number): void {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(amplitude, start + Math.min(0.018, duration / 4));
    envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(output);
    if (music) this.voices.add(oscillator);
    oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
  playSfx = (name: SfxName): void => {
    if (!this.context || !this.sfxGain || !this.unlocked || this.context.state !== 'running' || this.settings.muted || this.settings.sfxVolume === 0 || (typeof document !== 'undefined' && document.hidden)) return;
    const now = this.context.currentTime;
    if (now - (this.lastSfx.get(name) ?? -100) < (name === 'hover' ? 0.12 : 0.035)) return;
    this.lastSfx.set(name, now);
    const sound = (f: number, delay = 0, duration = 0.14, wave: OscillatorType = 'sine', amplitude = 0.2, end?: number) => this.tone(f, now + delay, duration, wave, amplitude, this.sfxGain!, false, end);
    switch (name) {
      case 'hover': sound(660, 0, 0.035, 'sine', 0.07); break;
      case 'click': sound(520, 0, 0.07, 'triangle', 0.14, 380); break;
      case 'drag': sound(240, 0, 0.12, 'sine', 0.13, 480); break;
      case 'drop': sound(340, 0, 0.09, 'triangle', 0.2, 180); break;
      case 'play': sound(380, 0, 0.16, 'triangle', 0.2, 760); sound(760, 0.05, 0.2, 'sine', 0.12); break;
      case 'hit': sound(140, 0, 0.13, 'triangle', 0.5, 42); sound(75, 0.01, 0.19, 'sine', 0.3); break;
      case 'heal': [523, 659, 784].forEach((f, i) => sound(f, i * 0.07, 0.38)); break;
      case 'equip': sound(440, 0, 0.09, 'triangle'); sound(880, 0.06, 0.32); break;
      case 'rune': [440, 659, 880, 1318].forEach((f, i) => sound(f, i * 0.05, 0.45, 'sine', 0.14)); break;
      case 'reveal': sound(260, 0, 0.25, 'sine', 0.18, 780); sound(1047, 0.15, 0.3, 'sine', 0.12); break;
      case 'reward': [659, 784, 1047].forEach((f, i) => sound(f, i * 0.09, 0.35, 'triangle', 0.14)); break;
      case 'victory': [523, 659, 784, 1047, 1175, 1047].forEach((f, i) => sound(f, i * 0.15, 0.6, 'triangle', 0.18)); break;
      case 'defeat': [392, 349, 294, 220].forEach((f, i) => sound(f, i * 0.19, 0.65, 'sine', 0.25)); break;
      case 'turn': sound(294, 0, 0.2, 'triangle', 0.15); sound(440, 0.1, 0.25, 'sine', 0.15); break;
      case 'invalid': sound(130, 0, 0.12, 'triangle', 0.22); sound(110, 0.1, 0.15, 'triangle', 0.18); break;
    }
  };
  getDebugState = () => ({ unlocked: this.unlocked, supported: !this.unavailable, contextState: this.context?.state ?? 'locked', musicRunning: this.timer !== null, activeMusicVoices: this.voices.size, settings: { ...this.settings } });
  dispose(): void {
    this.stopMusic();
    if (this.visibilityBound && typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.onVisibility);
    this.visibilityBound = false;
    void this.context?.close().catch(() => {});
    this.context = null; this.musicGain = null; this.sfxGain = null; this.unlocked = false;
  }
}
export const audioController = new AudioController();
export const playSfx = audioController.playSfx;
if (import.meta.hot) import.meta.hot.dispose(() => audioController.dispose());
