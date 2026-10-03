export type SfxName = 'hover' | 'drag' | 'drop' | 'play' | 'hit' | 'heal' | 'equip' | 'rune' | 'reveal' | 'reward' | 'click' | 'victory' | 'defeat' | 'turn' | 'invalid';
export interface AudioSettings { muted: boolean; musicVolume: number; sfxVolume: number }
export type MusicScene = 'menu' | 'battle' | 'danger' | 'progression' | 'victory' | 'defeat';
const STORAGE_KEY = 'card-game-prototype-audio-v1';
const DEFAULTS: AudioSettings = { muted: false, musicVolume: 35, sfxVolume: 65 };
export function normalizeAudioSettings(value: Partial<AudioSettings> = {}): AudioSettings {
  const volume = (n: unknown, fallback: number) => typeof n === 'number' && Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : fallback;
  return { muted: typeof value.muted === 'boolean' ? value.muted : DEFAULTS.muted, musicVolume: volume(value.musicVolume, DEFAULTS.musicVolume), sfxVolume: volume(value.sfxVolume, DEFAULTS.sfxVolume) };
}
function readSettings(): AudioSettings {
  try { const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); return normalizeAudioSettings(value && typeof value === 'object' ? value : {}); } catch { return { ...DEFAULTS }; }
}

// Original procedural themes: each phrase has its own contour, pulse and harmony.
const MUSIC: Record<MusicScene, { melody: number[]; roots: number[]; beat: number; noteLength: number }> = {
  menu: { melody: [69,72,76,74,72,69,67,64,65,69,72,76,74,72,69,67,64,67,71,74,72,71,67,64,65,69,72,74,72,69,67,69], roots: [45,41,48,43], beat: .6, noteLength: .95 },
  battle: { melody: [64,71,67,74,69,76,72,67,64,72,69,76,71,67,74,69,65,72,69,77,72,69,76,71,67,74,71,79,74,71,77,72], roots: [40,43,36,38], beat: .42, noteLength: .34 },
  danger: { melody: [57,64,60,63,57,65,60,62,55,62,59,65,55,63,59,62,53,60,57,63,53,62,57,60], roots: [33,34,29], beat: .48, noteLength: .4 },
  progression: { melody: [72,76,79,76,81,79,76,72,74,77,81,84,81,77,74,72,76,79,83,79,84,83,79,76,77,81,84,86,84,81,77,76], roots: [48,53,50,55], beat: .46, noteLength: .42 },
  victory: { melody: [72,76,79,84,83,79,76,72,74,77,81,86,84,81,77,74,76,79,84,88,86,84,79,76], roots: [48,53,55], beat: .5, noteLength: .56 },
  defeat: { melody: [64,62,60,57,59,57,55,52,57,55,53,50,52,50,48,45], roots: [40,38,36,33], beat: .72, noteLength: .64 },
};
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class AudioController {
  private settings = readSettings();
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNote = 0;
  private step = 0;
  private scene: MusicScene = 'menu';
  private unlocked = false;
  private unavailable = false;
  private listeners = new Set<() => void>();
  private voices = new Set<OscillatorNode>();
  private musicEnvelopes = new Map<OscillatorNode, GainNode>();
  private lastSfx = new Map<SfxName, number>();
  private visibilityBound = false;

  getSettings = (): AudioSettings => this.settings;
  setScene = (scene: MusicScene): void => {
    if (scene === this.scene) return;
    this.scene = scene;
    // Briefly dip the music bus so sustained notes from the previous theme resolve cleanly.
    if (this.context && this.musicGain && this.timer) {
      const now = this.context.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0, now, 0.06);
      this.musicGain.gain.setTargetAtTime(this.settings.muted ? 0 : this.settings.musicVolume / 100 * 0.28, now + 0.22, 0.1);
      // Retire both sounding notes and notes queued just ahead by the scheduler.
      for (const [voice, envelope] of this.musicEnvelopes) {
        envelope.gain.cancelScheduledValues(now);
        envelope.gain.setTargetAtTime(0, now, 0.035);
        try { voice.stop(now + 0.16); } catch { /* A voice may already be ending. */ }
      }
    }
  };
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
    const pattern = MUSIC[this.scene];
    while (this.nextNote < this.context.currentTime + 0.4) {
      const index = this.step % pattern.melody.length;
      const phrase = Math.floor(this.step / pattern.melody.length);
      const variation = phrase % 3;
      const baseNote = pattern.melody[index];
      // Three phrase shapes: the written line, a lightly ornamented octave lift with rests,
      // and a lower contour that answers the first phrase.
      const rest = variation === 1 && index % 11 === 5;
      const octave = variation === 1 && index % 8 >= 5 ? 12 : variation === 2 && index % 8 < 2 ? -12 : 0;
      if (!rest) this.tone(hz(baseNote + octave), this.nextNote, pattern.noteLength, 'sine', 0.22, this.musicGain, true);
      if (index % 8 === 0) {
        const root = pattern.roots[(Math.floor(index / 8) + phrase) % pattern.roots.length];
        const harmonyDuration = pattern.beat * (variation === 1 ? 3.5 : 7.5);
        if (variation !== 2) this.tone(hz(root), this.nextNote, harmonyDuration, 'triangle', 0.11, this.musicGain, true);
        this.tone(hz(root + (variation === 2 ? 12 : 7)), this.nextNote + 0.03, harmonyDuration, 'sine', 0.08, this.musicGain, true);
      } else if (variation === 1 && index % 4 === 2) {
        // A broken chord replaces the held pad for a more active second pass.
        const root = pattern.roots[(Math.floor(index / 8) + phrase) % pattern.roots.length];
        this.tone(hz(root + (index % 8 < 4 ? 7 : 12)), this.nextNote, pattern.beat * 1.8, 'triangle', 0.065, this.musicGain, true);
      }
      this.step++;
      this.nextNote += pattern.beat;
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
    if (music) { this.voices.add(oscillator); this.musicEnvelopes.set(oscillator, envelope); }
    oscillator.onended = () => { this.voices.delete(oscillator); this.musicEnvelopes.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
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
  getDebugState = () => ({ unlocked: this.unlocked, supported: !this.unavailable, contextState: this.context?.state ?? 'locked', musicRunning: this.timer !== null, activeMusicVoices: this.voices.size, scene: this.scene, settings: { ...this.settings } });
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
