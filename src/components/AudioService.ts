class AudioService {
  private ctx: AudioContext | null = null

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    return this.ctx
  }

  playClickSound() {
    try {
      const ctx = this.getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05)
      osc.type = "sine"
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.2)
    } catch (err) {
      console.warn('[audio]', err)
    }
  }

  playHoverSound() {
    try {
      const ctx = this.getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 600
      osc.type = "sine"
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    } catch (err) {
      console.warn('[audio]', err)
    }
  }

  playDingSound() {
    try {
      const ctx = this.getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
      osc.type = "triangle"
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch (err) {
      console.warn('[audio]', err)
    }
  }

  playAnimalRepresentativeSound(animal: string, classification: string) {
    try {
      const ctx = this.getCtx()
      const sounds: Record<string, {freq: number, type: OscillatorType, duration: number, sweep: number}> = {
        'Mammal': { freq: 200, type: 'sawtooth', duration: 0.4, sweep: 400 },
        'Bird': { freq: 1200, type: 'sine', duration: 0.3, sweep: 2000 },
        'Reptile': { freq: 100, type: 'sawtooth', duration: 0.5, sweep: 50 },
        'Amphibian': { freq: 400, type: 'square', duration: 0.15, sweep: 600 },
        'Fish': { freq: 300, type: 'sine', duration: 0.6, sweep: 100 },
        'Insect': { freq: 3000, type: 'sawtooth', duration: 0.1, sweep: 5000 },
        'Crustacean': { freq: 150, type: 'triangle', duration: 0.3, sweep: 300 },
        'Mollusk': { freq: 250, type: 'sine', duration: 0.5, sweep: 150 },
        'Arachnid': { freq: 800, type: 'square', duration: 0.1, sweep: 1200 },
      }
      const preset = sounds[classification] || sounds['Mammal']
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(preset.freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(preset.sweep, ctx.currentTime + preset.duration)
      osc.type = preset.type
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + preset.duration)
      if (classification === 'Bird' || classification === 'Mammal') {
        lfo.frequency.value = 6
        lfoGain.gain.value = preset.freq * 0.05
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)
        lfo.start(ctx.currentTime)
        lfo.stop(ctx.currentTime + preset.duration)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + preset.duration)
    } catch (err) {
      console.warn('[audio]', err)
    }
  }

  playAnimalSound(url: string) {
    try {
      const audio = new Audio(url)
      audio.play().catch(() => {})
    } catch (err) {
      console.warn('[audio]', err)
    }
  }
}

export const audioService = new AudioService()
