/**
 * 1984 Vintage 8-Bit Web Audio Engine
 * Emulates PC-8801 / MSX PSG (Programmable Sound Generator) & FM synth characteristics.
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public sfxVolume: number = 0.7;
  public musicVolume: number = 0.4;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private isBgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public userGesture() {
    this.initCtx();
    if (this.musicEnabled && !this.isBgmPlaying) {
      this.startBgm();
    }
  }

  // Play a simple synthesized PSG tone
  public playTone(freq: number, type: OscillatorType, duration: number, vol = 0.15) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const actualVol = vol * this.sfxVolume;
      gain.gain.setValueAtTime(actualVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted
    }
  }

  // Flare shot sound: Chirp up then down
  public flare() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.18);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // ignore
    }
  }

  // Flash explosion / burst
  public explosion() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Synthesized noise/rumble burst
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
    } catch {
      // fallback
      this.playTone(180, 'sawtooth', 0.2, 0.2);
    }
  }

  // Calm Ohmu: Iconic nostalgic crystal chimes (Nausicaä soothing melody)
  public calm() {
    if (!this.soundEnabled) return;
    this.initCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.45, 0.18);
      }, idx * 75);
    });
  }

  // Insect Whistle (蟲笛) spinning resonance sound
  public insectWhistle() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc2.type = 'triangle';

      // Vibrato effect for spinning whistle
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.2);
      osc.frequency.linearRampToValueAtTime(1300, now + 0.4);

      osc2.frequency.setValueAtTime(1208, now); // slight detune creates beating whistle
      osc2.frequency.linearRampToValueAtTime(1808, now + 0.2);
      osc2.frequency.linearRampToValueAtTime(1308, now + 0.4);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch {
      this.playTone(1500, 'sine', 0.3, 0.1);
    }
  }

  // Ohmu enraged roar / alarm
  public alarm() {
    if (!this.soundEnabled) return;
    this.playTone(180, 'sawtooth', 0.22, 0.2);
    setTimeout(() => {
      this.playTone(140, 'sawtooth', 0.25, 0.2);
    }, 100);
  }

  // Wall defense impact
  public wallHit() {
    if (!this.soundEnabled) return;
    this.playTone(90, 'square', 0.3, 0.35);
    setTimeout(() => {
      this.playTone(60, 'sawtooth', 0.4, 0.4);
    }, 80);
  }

  // Game over sound: Retro tragic 8-bit descent
  public gameOver() {
    if (!this.soundEnabled) return;
    this.stopBgm();
    const chords = [
      [220, 261.63],
      [196, 233.08],
      [174.61, 207.65],
      [130.81, 155.56]
    ];
    chords.forEach((chord, i) => {
      setTimeout(() => {
        this.playTone(chord[0], 'sawtooth', 0.4, 0.2);
        this.playTone(chord[1], 'sawtooth', 0.4, 0.15);
      }, i * 280);
    });
  }

  // Victory Fanfare: Glorious 1984 8-bit hero fanfare
  public victory() {
    if (!this.soundEnabled) return;
    this.stopBgm();
    const notes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.3 },  // E5
      { f: 783.99, d: 0.2 },  // G5
      { f: 1046.5, d: 0.6 }   // C6
    ];
    let delay = 0;
    notes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, 'square', n.d, 0.25);
        this.playTone(n.f / 2, 'triangle', n.d, 0.2);
      }, delay * 1000);
      delay += n.d + 0.05;
    });
  }

  // UI button click
  public uiClick() {
    if (!this.soundEnabled) return;
    this.playTone(987.77, 'square', 0.04, 0.08); // B5 blip
  }

  // BGM Engine: Authentic 1984 8-Bit Nausicaä themed nostalgic chiptune
  public startBgm() {
    if (this.musicInterval) return;
    this.isBgmPlaying = true;
    this.initCtx();

    // 16-step melody loop based on Nausicaä "Legend of the Wind" style nostalgic modal theme
    // D Minor modal: D4, F4, G4, A4, C5, D5...
    const melody = [
      440.00, 0, 523.25, 587.33, 659.25, 0, 587.33, 0,
      523.25, 440.00, 392.00, 0, 440.00, 0, 0, 0,
      587.33, 0, 659.25, 698.46, 783.99, 0, 659.25, 0,
      587.33, 523.25, 440.00, 0, 523.25, 0, 0, 0
    ];

    const bass = [
      220.00, 220.00, 220.00, 220.00, 261.63, 261.63, 261.63, 261.63,
      196.00, 196.00, 196.00, 196.00, 220.00, 220.00, 220.00, 220.00,
      293.66, 293.66, 293.66, 293.66, 261.63, 261.63, 261.63, 261.63,
      220.00, 220.00, 196.00, 196.00, 220.00, 220.00, 220.00, 220.00
    ];

    this.musicStep = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;

      const melFreq = melody[this.musicStep % melody.length];
      const bassFreq = bass[this.musicStep % bass.length];

      if (melFreq > 0) {
        this.playTone(melFreq, 'triangle', 0.22, 0.12 * this.musicVolume);
      }
      if (bassFreq > 0) {
        this.playTone(bassFreq / 2, 'square', 0.18, 0.08 * this.musicVolume);
      }

      this.musicStep++;
    }, 210); // ~142 BPM retro pulse
  }

  public stopBgm() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isBgmPlaying = false;
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.musicEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }
}

export const RetroAudio = new RetroAudioEngine();
