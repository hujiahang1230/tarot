/**
 * AI Meditation Guidance System
 * Slow healing text output, cosmic tone, relaxation guide, music sync
 */

class AIMeditationGuide {
    constructor(containerId, audioSystem, breathingTherapy) {
        this.container = document.getElementById(containerId);
        this.audioSystem = audioSystem;
        this.breathingTherapy = breathingTherapy;
        
        this.isActive = false;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.displayedText = '';
        this.isTyping = false;
        this.typingSpeed = 80;
        this.pauseBetweenSentences = 2000;
        this.pauseBetweenParagraphs = 4000;
        
        this.meditationTexts = [
            "闭上双眼，感受宇宙的呼吸...",
            "你是一片宁静的星空，每一颗星辰都是你内心的光芒。",
            "让思绪如流星般划过，不留痕迹，只留宁静。",
            "深呼吸，吸入宇宙的浩瀚，呼出所有的烦恼。",
            "你的存在本身就是宇宙最美的奇迹。",
            "感受时间的缓慢流动，如同星河的旋转。",
            "每一次呼吸，都是与宇宙的一次对话。",
            "放下所有的负担，让心灵回归最初的纯净。",
            "你是无限的，超越所有的边界与限制。",
            "在这宁静的时刻，听见内心最真实的声音。",
            "宇宙的爱如光一般，温暖地包围着你。",
            "让这份宁静深入你的每一个细胞。",
            "你与万物相连，你是宇宙的一部分。",
            "感受这份连接，感受这份完整。",
            "当你准备好，慢慢睁开眼睛，带着这份宁静回到现实。"
        ];
        
        this.cosmicSounds = [];
        this.currentParagraph = '';
    }
    
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.displayedText = '';
        
        this.container.innerHTML = '';
        this.container.style.opacity = '0';
        this.container.style.transition = 'opacity 2s ease-in-out';
        
        setTimeout(() => {
            this.container.style.opacity = '1';
            this.playCosmicAmbient();
            this.startTyping();
        }, 1000);
    }
    
    stop() {
        this.isActive = false;
        this.isTyping = false;
        this.stopCosmicAmbient();
        this.container.style.opacity = '0';
    }
    
    startTyping() {
        if (!this.isActive || this.currentTextIndex >= this.meditationTexts.length) {
            if (this.isActive) {
                setTimeout(() => this.start(), 5000);
            }
            return;
        }
        
        this.isTyping = true;
        this.currentParagraph = this.meditationTexts[this.currentTextIndex];
        this.currentCharIndex = 0;
        
        const paragraphEl = document.createElement('div');
        paragraphEl.className = 'meditation-paragraph';
        paragraphEl.style.opacity = '0';
        paragraphEl.style.transform = 'translateY(20px)';
        paragraphEl.style.transition = 'all 1.5s ease-out';
        this.container.appendChild(paragraphEl);
        
        setTimeout(() => {
            paragraphEl.style.opacity = '1';
            paragraphEl.style.transform = 'translateY(0)';
        }, 100);
        
        this.typeNextChar(paragraphEl);
    }
    
    typeNextChar(paragraphEl) {
        if (!this.isActive || !this.isTyping) return;
        
        if (this.currentCharIndex < this.currentParagraph.length) {
            this.displayedText += this.currentParagraph[this.currentCharIndex];
            paragraphEl.textContent = this.displayedText;
            this.currentCharIndex++;
            
            setTimeout(() => this.typeNextChar(paragraphEl), this.typingSpeed);
        } else {
            this.isTyping = false;
            this.displayedText = '';
            this.currentTextIndex++;
            
            setTimeout(() => this.startTyping(), this.pauseBetweenParagraphs);
        }
    }
    
    playCosmicAmbient() {
        if (!this.audioSystem || !this.audioSystem.isEnabled) return;
        
        this.audioSystem.initAudioContext();
        
        const frequencies = [110, 165, 220, 330];
        const oscillators = [];
        const gainNodes = [];
        
        frequencies.forEach((freq, i) => {
            const osc = this.audioSystem.audioContext.createOscillator();
            const gain = this.audioSystem.audioContext.createGain();
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.value = 0.02 * this.audioSystem.volume;
            
            osc.connect(gain);
            gain.connect(this.audioSystem.audioContext.destination);
            
            osc.start();
            oscillators.push(osc);
            gainNodes.push(gain);
            
            this.modulateFrequency(osc, freq, i);
        });
        
        this.cosmicSounds = { oscillators, gainNodes };
    }
    
    modulateFrequency(oscillator, baseFreq, index) {
        if (!this.isActive) return;
        
        const modulation = Math.sin(Date.now() * 0.0005 + index) * 2;
        oscillator.frequency.value = baseFreq + modulation;
        
        setTimeout(() => this.modulateFrequency(oscillator, baseFreq, index), 100);
    }
    
    stopCosmicAmbient() {
        if (this.cosmicSounds.oscillators) {
            this.cosmicSounds.oscillators.forEach(osc => osc.stop());
            this.cosmicSounds = { oscillators: [], gainNodes: [] };
        }
    }
    
    syncWithBreathing() {
        if (this.breathingTherapy && this.breathingTherapy.isActive) {
            if (this.breathingTherapy.breathPhase === 'inhale') {
                this.typingSpeed = 60;
            } else if (this.breathingTherapy.breathPhase === 'exhale') {
                this.typingSpeed = 100;
            } else {
                this.typingSpeed = 80;
            }
        }
    }
}
