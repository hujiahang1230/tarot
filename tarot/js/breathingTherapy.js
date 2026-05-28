/**
 * Immersive Breathing Therapy System
 * Glowing breathing ring, inhale/exhale prompts, star sync, particle flow
 */

class BreathingTherapy {
    constructor(canvasId, particleSystem, audioSystem) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particleSystem = particleSystem;
        this.audioSystem = audioSystem;
        
        this.isActive = false;
        this.animationId = null;
        this.time = 0;
        
        this.breathPhase = 'inhale';
        this.breathProgress = 0;
        this.breathCycleDuration = 8000;
        this.inhaleDuration = 4000;
        this.exhaleDuration = 4000;
        this.holdDuration = 1000;
        this.lastPhaseChange = 0;
        
        this.ringRadius = 120;
        this.minRadius = 80;
        this.maxRadius = 160;
        this.currentRadius = this.minRadius;
        
        this.pulseIntensity = 0;
        this.glowColor = { r: 123, g: 79, b: 191 };
        this.secondaryColor = { r: 212, g: 168, b: 67 };
        
        this.promptText = '';
        this.promptOpacity = 0;
        
        this.starsSync = [];
        this.breathParticles = [];
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createBreathParticles();
        this.createStarsSync();
    }
    
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    
    createBreathParticles(count = 80) {
        this.breathParticles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
            this.breathParticles.push({
                angle: angle,
                distance: this.ringRadius + Math.random() * 40 - 20,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                speed: (Math.random() - 0.5) * 0.002,
                color: Math.random() > 0.5 ? this.glowColor : this.secondaryColor,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    createStarsSync(count = 100) {
        this.starsSync = [];
        for (let i = 0; i < count; i++) {
            this.starsSync.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.3,
                baseOpacity: Math.random() * 0.4 + 0.1,
                twinkleSpeed: Math.random() * 0.01 + 0.005,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.time = 0;
        this.lastPhaseChange = performance.now();
        this.breathPhase = 'inhale';
        this.breathProgress = 0;
        this.animate();
    }
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    updateBreathPhase(deltaTime) {
        const now = performance.now();
        const elapsed = now - this.lastPhaseChange;
        
        if (this.breathPhase === 'inhale' && elapsed >= this.inhaleDuration) {
            this.breathPhase = 'hold';
            this.lastPhaseChange = now;
            this.promptText = '屏息...';
            this.promptOpacity = 1;
        } else if (this.breathPhase === 'hold' && elapsed >= this.holdDuration) {
            this.breathPhase = 'exhale';
            this.lastPhaseChange = now;
            this.promptText = '呼气...';
            this.promptOpacity = 1;
        } else if (this.breathPhase === 'exhale' && elapsed >= this.exhaleDuration) {
            this.breathPhase = 'inhale';
            this.lastPhaseChange = now;
            this.promptText = '吸气...';
            this.promptOpacity = 1;
        }
        
        const phaseDuration = this.breathPhase === 'hold' ? this.holdDuration : 
                              this.breathPhase === 'inhale' ? this.inhaleDuration : this.exhaleDuration;
        this.breathProgress = Math.min(elapsed / phaseDuration, 1);
    }
    
    updateRadius() {
        if (this.breathPhase === 'inhale') {
            this.currentRadius = this.minRadius + (this.maxRadius - this.minRadius) * this.easeInOut(this.breathProgress);
            this.pulseIntensity = this.breathProgress;
        } else if (this.breathPhase === 'exhale') {
            this.currentRadius = this.maxRadius - (this.maxRadius - this.minRadius) * this.easeInOut(this.breathProgress);
            this.pulseIntensity = 1 - this.breathProgress;
        } else {
            this.pulseIntensity = 1;
        }
    }
    
    updateBreathParticles(deltaTime) {
        this.breathParticles.forEach(p => {
            p.angle += p.speed;
            p.phase += 0.01;
            p.distance = this.currentRadius + Math.sin(p.phase) * 15;
            p.opacity = 0.3 + this.pulseIntensity * 0.4;
        });
    }
    
    updateStarsSync() {
        this.starsSync.forEach(star => {
            star.phase += star.twinkleSpeed;
            const breathSync = Math.sin(this.time * 0.001) * 0.2;
            star.opacity = star.baseOpacity + breathSync * this.pulseIntensity;
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawStarsSync();
        this.drawBreathRing();
        this.drawBreathParticles();
        this.drawPrompt();
        this.drawOuterGlow();
    }
    
    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.canvas.width * 0.7
        );
        gradient.addColorStop(0, '#0f0a1e');
        gradient.addColorStop(0.4, '#0a0818');
        gradient.addColorStop(1, '#050310');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawStarsSync() {
        this.starsSync.forEach(star => {
            const twinkle = Math.sin(star.phase) * 0.3 + 0.7;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
            this.ctx.fill();
        });
    }
    
    drawBreathRing() {
        const { r, g, b } = this.glowColor;
        
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        
        for (let i = 3; i > 0; i--) {
            const radius = this.currentRadius + i * 8;
            const opacity = 0.05 * (4 - i) * this.pulseIntensity;
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        const mainGradient = this.ctx.createRadialGradient(0, 0, this.currentRadius - 10, 0, 0, this.currentRadius + 10);
        mainGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);
        mainGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.6 + this.pulseIntensity * 0.3})`);
        mainGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.currentRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = mainGradient;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        const innerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.currentRadius);
        innerGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.05 * this.pulseIntensity})`);
        innerGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${0.02 * this.pulseIntensity})`);
        innerGradient.addColorStop(1, 'transparent');
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.currentRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = innerGradient;
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawBreathParticles() {
        this.breathParticles.forEach(p => {
            const x = this.centerX + Math.cos(p.angle) * p.distance;
            const y = this.centerY + Math.sin(p.angle) * p.distance;
            const { r, g, b } = p.color;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, p.size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.2})`;
            this.ctx.fill();
        });
    }
    
    drawPrompt() {
        if (this.promptOpacity <= 0) return;
        
        this.ctx.save();
        this.ctx.font = '24px "Microsoft YaHei", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.promptOpacity * 0.8})`;
        this.ctx.fillText(this.promptText, this.centerX, this.centerY + this.currentRadius + 60);
        this.ctx.restore();
        
        this.promptOpacity *= 0.995;
    }
    
    drawOuterGlow() {
        const { r, g, b } = this.secondaryColor;
        const glowRadius = 200 + this.pulseIntensity * 100;
        
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, this.currentRadius,
            this.centerX, this.centerY, glowRadius
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.05 * this.pulseIntensity})`);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    animate(currentTime = 0) {
        if (!this.isActive) return;
        
        const deltaTime = currentTime - (this.lastFrameTime || currentTime);
        this.lastFrameTime = currentTime;
        this.time += deltaTime;
        
        this.updateBreathPhase(deltaTime);
        this.updateRadius();
        this.updateBreathParticles(deltaTime);
        this.updateStarsSync();
        this.draw();
        
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
}
