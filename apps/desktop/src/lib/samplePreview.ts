import { api } from './api';

// Singleton preview player for the Sample Library.
// One sample at a time; starting a new one stops the previous. Keeps decoded
// buffers in an in-memory cache so a quick re-click doesn't re-download. Uses
// its own AudioContext so it never touches the project audio graph or mixer.

type Listener = (playingId: string | null) => void;

class SamplePreviewer {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private playingId: string | null = null;
  private listeners = new Set<Listener>();
  private bufferCache = new Map<string, AudioBuffer>();

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctor();
    }
    // Most browsers gate autoplay until a user gesture. `toggle` is always
    // invoked from a click so resume() lands us in the running state.
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  get currentId(): string | null {
    return this.playingId;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) l(this.playingId);
  }

  stop() {
    if (this.source) {
      try { this.source.stop(); } catch { /* already stopped */ }
      try { this.source.disconnect(); } catch { /* ignore */ }
      this.source = null;
    }
    if (this.gain) {
      try { this.gain.disconnect(); } catch { /* ignore */ }
      this.gain = null;
    }
    if (this.playingId !== null) {
      this.playingId = null;
      this.notify();
    }
  }

  async toggle(fileId: string) {
    // Second click on the currently-playing row → stop.
    if (this.playingId === fileId) {
      this.stop();
      return;
    }
    this.stop();
    try {
      let buffer = this.bufferCache.get(fileId);
      if (!buffer) {
        const arrayBuf = await api.downloadSampleLibraryAudio(fileId);
        const ctx = this.getCtx();
        buffer = await ctx.decodeAudioData(arrayBuf.slice(0));
        this.bufferCache.set(fileId, buffer);
      }
      const ctx = this.getCtx();
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = 0.8;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.onended = () => {
        // Clean up unless something else has already taken over.
        if (this.playingId === fileId) this.stop();
      };
      src.start(0);
      this.source = src;
      this.gain = gain;
      this.playingId = fileId;
      this.notify();
    } catch (err) {
      if (import.meta.env?.DEV) console.warn('[samplePreview.toggle]', err);
      this.stop();
    }
  }
}

export const samplePreview = new SamplePreviewer();
