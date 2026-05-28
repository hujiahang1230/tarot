/**
 * Audio System Module
 * Handles background music and sound effects using Web Audio API
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.isEnabled = false;
        this.volume = 0.5;
        this.backgroundMusic = null;
        this.sounds = {};
        this.emotionAmbience = null;

        this.init();
    }

    init() {
        // Load saved preferences
        const savedEnabled = localStorage.getItem('tarot_audio_enabled');
        const savedVolume = localStorage.getItem('tarot_volume');

        this.isEnabled = savedEnabled === 'true';
        this.volume = savedVolume ? parseFloat(savedVolume) : 0.5;

        // Create audio elements for generated sounds
        this.createSounds();
    }

    /**
     * Initialize AudioContext (must be called after user interaction)
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Create synthesized sounds
     */
    createSounds() {
        // We'll generate sounds programmatically
        this.sounds = {
            cardFlip: () => this.playTone(800, 0.1, 'sine', 0.3),
            cardDraw: () => this.playTone(400, 0.15, 'triangle', 0.2),
            reveal: () => this.playChord([523, 659, 784], 0.3, 'sine', 0.2),
            click: () => this.playTone(600, 0.05, 'square', 0.1),
            shuffle: () => this.playNoise(0.2, 0.15),
            success: () => this.playChord([523, 659, 784, 1047], 0.4, 'sine', 0.15),
            hover: () => this.playTone(1000, 0.03, 'sine', 0.05)
        };
    }

    /**
     * Play a single tone
     */
    playTone(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.isEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    /**
     * Play a chord (multiple tones)
     */
    playChord(frequencies, duration, type = 'sine', volume = 0.1) {
        if (!this.isEnabled || !this.audioContext) return;

        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, duration, type, volume);
            }, i * 50);
        });
    }

    /**
     * Play noise (for shuffle sound)
     */
    playNoise(duration, volume = 0.1) {
        if (!this.isEnabled || !this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        source.start(this.audioContext.currentTime);
        source.stop(this.audioContext.currentTime + duration);
    }

    /**
     * Play sound effect by name
     */
    play(name) {
        if (this.sounds[name]) {
            this.initAudioContext();
            this.sounds[name]();
        }
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('tarot_audio_enabled', this.isEnabled);

        if (this.isEnabled) {
            this.initAudioContext();
            this.play('click');
        }

        return this.isEnabled;
    }

    /**
     * Set volume
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        localStorage.setItem('tarot_volume', this.volume);
    }

    /**
     * Get current state
     */
    getState() {
        return {
            enabled: this.isEnabled,
            volume: this.volume
        };
    }

    /**
     * Play ambient background drone
     */
    playAmbient() {
        if (!this.isEnabled || !this.audioContext) return;

        // Create a subtle ambient drone
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc1.frequency.value = 110; // A2
        osc2.frequency.value = 165; // E3
        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = 0.03 * this.volume;

        osc1.start();
        osc2.start();

        // Store for later stopping
        this.ambientOscillators = [osc1, osc2];
        this.ambientGain = gainNode;
    }

    /**
     * Stop ambient drone
     */
    stopAmbient() {
        if (this.ambientOscillators) {
            this.ambientOscillators.forEach(osc => osc.stop());
            this.ambientOscillators = null;
        }
    }

    setEmotionSoundscape(themeName = 'night-ambient') {
        if (!this.isEnabled) return;
        this.initAudioContext();
        this.stopEmotionSoundscape();

        const themes = {
            'deep-blue-drift': { freqs: [82.5, 123.47, 196], type: 'sine', gain: 0.018 },
            'silver-rain': { freqs: [110, 165, 247], type: 'triangle', gain: 0.016 },
            'low-embers': { freqs: [73.42, 98, 146.83], type: 'sawtooth', gain: 0.012 },
            'violet-echo': { freqs: [92.5, 138.59, 207.65], type: 'sine', gain: 0.017 },
            'fog-radio': { freqs: [98, 147, 220], type: 'triangle', gain: 0.014 },
            'lavender-drone': { freqs: [87.31, 130.81, 174.61], type: 'sine', gain: 0.018 },
            'golden-hum': { freqs: [146.83, 220, 293.66], type: 'sine', gain: 0.019 },
            'bright-nebula': { freqs: [164.81, 246.94, 329.63], type: 'triangle', gain: 0.02 },
            'night-ambient': { freqs: [110, 165, 220], type: 'sine', gain: 0.016 }
        };

        const config = themes[themeName] || themes['night-ambient'];
        const masterGain = this.audioContext.createGain();
        masterGain.gain.value = config.gain * this.volume;
        masterGain.connect(this.audioContext.destination);

        const oscillators = config.freqs.map((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.frequency.value = freq;
            osc.type = config.type;
            gain.gain.value = (0.5 - index * 0.08) * this.volume;
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            return { osc, freq };
        });

        this.emotionAmbience = { masterGain, oscillators, themeName };
        this.modulateEmotionSoundscape();
    }

    modulateEmotionSoundscape() {
        if (!this.emotionAmbience || !this.audioContext) return;
        const now = this.audioContext.currentTime;

        this.emotionAmbience.oscillators.forEach((item, index) => {
            const drift = Math.sin(now * 0.25 + index) * (index + 1);
            item.osc.frequency.setValueAtTime(item.freq + drift, now);
        });

        clearTimeout(this.emotionAmbience.timer);
        this.emotionAmbience.timer = setTimeout(() => this.modulateEmotionSoundscape(), 300);
    }

    stopEmotionSoundscape() {
        if (!this.emotionAmbience) return;
        clearTimeout(this.emotionAmbience.timer);
        this.emotionAmbience.oscillators.forEach(({ osc }) => {
            try {
                osc.stop();
            } catch (error) {
                console.warn('Emotion soundscape stop skipped:', error);
            }
        });
        this.emotionAmbience = null;
    }
}
