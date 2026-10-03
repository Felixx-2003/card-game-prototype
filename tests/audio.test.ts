import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioController, normalizeAudioSettings } from '../src/audio';

class Parameter {
  setTargetAtTime = vi.fn();
  setValueAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}
class Gain {
  gain = new Parameter();
  connect = vi.fn();
  disconnect = vi.fn();
}
class Oscillator {
  type = 'sine';
  frequency = new Parameter();
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  onended: (() => void) | null = null;
}
class FakeContext {
  static instances: FakeContext[] = [];
  state = 'suspended';
  currentTime = 0;
  destination = {};
  gains: Gain[] = [];
  oscillators: Oscillator[] = [];
  constructor() { FakeContext.instances.push(this); }
  createGain() { const gain = new Gain(); this.gains.push(gain); return gain; }
  createOscillator() { const oscillator = new Oscillator(); this.oscillators.push(oscillator); return oscillator; }
  resume = vi.fn(async () => { this.state = 'running'; });
  suspend = vi.fn(async () => { this.state = 'suspended'; });
  close = vi.fn(async () => { this.state = 'closed'; });
}

describe('audio preferences and lifecycle', () => {
  let controller: AudioController;
  let storage: Map<string, string>;
  let visibility: (() => void) | undefined;
  let fakeDocument: { hidden: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    vi.useFakeTimers();
    FakeContext.instances = [];
    storage = new Map();
    vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
    vi.stubGlobal('window', { AudioContext: FakeContext });
    fakeDocument = { hidden: false, addEventListener: vi.fn((_event, callback) => { visibility = callback; }), removeEventListener: vi.fn() };
    vi.stubGlobal('document', fakeDocument);
    controller = new AudioController();
  });
  afterEach(() => { controller.dispose(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('normalizes corrupt values and clamps independent channels', () => {
    expect(normalizeAudioSettings({ musicVolume: -30, sfxVolume: 140, muted: true })).toEqual({ musicVolume: 0, sfxVolume: 100, muted: true });
    expect(normalizeAudioSettings({ musicVolume: NaN, sfxVolume: Infinity })).toEqual({ musicVolume: 35, sfxVolume: 65, muted: false });
    storage.set('card-game-prototype-audio-v1', 'not JSON');
    expect(new AudioController().getSettings()).toEqual({ musicVolume: 35, sfxVolume: 65, muted: false });
  });

  it('stays silent before unlock, then keeps a single music scheduler on repeated gestures', async () => {
    controller.playSfx('hit');
    expect(FakeContext.instances).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    await Promise.all([controller.unlock(), controller.unlock(), controller.unlock()]);
    expect(FakeContext.instances).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(1);
    expect(controller.getDebugState().musicRunning).toBe(true);
    controller.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('persists preferences, applies separate gains, and silences music without silencing effects', async () => {
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);
    await controller.unlock();
    controller.setSettings({ musicVolume: 0, sfxVolume: 42 });
    expect(controller.getDebugState().musicRunning).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    const context = FakeContext.instances[0];
    const count = context.oscillators.length;
    controller.playSfx('hit');
    expect(context.oscillators.length).toBeGreaterThan(count);
    expect(context.gains[1].gain.setTargetAtTime).toHaveBeenLastCalledWith(0.42 * 0.32, 0, 0.02);
    controller.setSettings({ muted: true });
    const mutedCount = context.oscillators.length;
    controller.playSfx('victory');
    expect(context.oscillators).toHaveLength(mutedCount);
    expect(new AudioController().getSettings()).toEqual({ muted: true, musicVolume: 0, sfxVolume: 42 });
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    controller.setSettings({ muted: false });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('suspends on a hidden tab and resumes only one loop on return', async () => {
    await controller.unlock();
    const context = FakeContext.instances[0];
    fakeDocument.hidden = true;
    visibility?.();
    expect(context.suspend).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(controller.getDebugState().activeMusicVoices).toBe(0);
    fakeDocument.hidden = false;
    visibility?.();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(1);
    await controller.unlock();
    expect(vi.getTimerCount()).toBe(1);
  });

  it('handles an unsupported browser without throwing or scheduling', async () => {
    vi.stubGlobal('window', {});
    await controller.unlock();
    controller.playSfx('click');
    expect(controller.getDebugState().supported).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
