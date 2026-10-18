// Web Audio API ambient sound generator for serene teacher relaxation

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentType: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play singing bowl chime
  playSingingBowl() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, this.ctx.currentTime); // 432 Hz healing tone
      osc.frequency.exponentialRampToValueAtTime(430, this.ctx.currentTime + 3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 4.6);
    } catch (e) {
      console.warn('Audio not allowed or supported', e);
    }
  }

  // Play continuous ambient sound (rain / calm wind / warm drone)
  startAmbient(type: 'rain' | 'wind' | 'bowl') {
    this.stopAmbient();
    this.initCtx();
    if (!this.ctx) return;

    if (type === 'bowl') {
      this.playSingingBowl();
      return;
    }

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/Brown noise generator
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Soft rain noise
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        } else {
          // Soft wind
          b0 = 0.997 * b0 + white * 0.04;
          data[i] = b0 * 0.06;
        }
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 1200 : 450, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 1.5);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start();
      this.noiseNode = noiseSource;
      this.gainNode = gain;
      this.isPlaying = true;
      this.currentType = type;
    } catch (e) {
      console.warn('Ambient sound error', e);
    }
  }

  stopAmbient() {
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.noiseNode && 'stop' in this.noiseNode) {
            (this.noiseNode as AudioBufferSourceNode).stop();
          }
          this.noiseNode = null;
          this.gainNode = null;
          this.isPlaying = false;
          this.currentType = null;
        }, 500);
      } catch {
        this.isPlaying = false;
        this.currentType = null;
      }
    } else {
      this.isPlaying = false;
      this.currentType = null;
    }
  }

  getStatus() {
    return { isPlaying: this.isPlaying, currentType: this.currentType };
  }
}

export const soundEngine = new SoundEngine();
