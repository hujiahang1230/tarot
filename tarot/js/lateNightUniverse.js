/**
 * Late-Night Universe Mode
 * Deep blue cosmos, slow particles, soft glow, ethereal music
 */

class LateNightUniverseMode {
    constructor(canvasId, audioSystem, particleSystem) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioSystem = audioSystem;
        this.particleSystem = particleSystem;
        
        this.isActive = false;
        this.animationId = null;
        this.time = 0;
        this.lastFrameTime = 0;
        
        this.universeStars = [];
        this.nebulaClouds = [];
        this.cosmicDust = [];
        this.shootingStars = [];
        this.softGlows = [];
        
        this.etherealOscillators = [];
        this.etherealGain = null;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createUniverseStars();
        this.createNebulaClouds();
        this.createCosmicDust();
        this.createSoftGlows();
    }
    
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }
    
    createUniverseStars(count = 300) {
        this.universeStars = [];
        for (let i = 0; i < count; i++) {
            this.universeStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.3,
                opacity: Math.random() * 0.6 + 0.2,
                twinkleSpeed: Math.random() * 0.008 + 0.003,
                phase: Math.random() * Math.PI * 2,
                color: this.getRandomStarColor()
            });
        }
    }
    
    getRandomStarColor() {
        const colors = [
            '100, 150, 255',
            '150, 180, 255',
            '200, 220, 255',
            '180, 200, 255',
            '120, 160, 255'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    createNebulaClouds(count = 8) {
        this.nebulaClouds = [];
        const colors = [
            'rgba(30, 60, 120, 0.04)',
            'rgba(40, 80, 160, 0.05)',
            'rgba(50, 100, 180, 0.03)',
            'rgba(60, 120, 200, 0.04)',
            'rgba(20, 50, 100, 0.06)'
        ];
        
        for (let i = 0; i < count; i++) {
            this.nebulaClouds.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 300 + 200,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: (Math.random() - 0.5) * 0.08,
                speedY: (Math.random() - 0.5) * 0.05,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.002 + 0.001
            });
        }
    }
    
    createCosmicDust(count = 60) {
        this.cosmicDust = [];
        for (let i = 0; i < count; i++) {
            this.cosmicDust.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: -Math.random() * 0.1 - 0.05,
                life: 1,
                decay: Math.random() * 0.0003 + 0.0001,
                color: '150, 180, 255',
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.01 + 0.005
            });
        }
    }
    
    createSoftGlows(count = 5) {
        this.softGlows = [];
        for (let i = 0; i < count; i++) {
            this.softGlows.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 150 + 100,
                opacity: Math.random() * 0.08 + 0.02,
                pulseSpeed: Math.random() * 0.003 + 0.001,
                phase: Math.random() * Math.PI * 2,
                color: Math.random() > 0.5 ? '100, 150, 255' : '150, 180, 255'
            });
        }
    }
    
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.time = 0;
        this.lastFrameTime = performance.now();
        
        this.playEtherealMusic();
        this.animate();
    }
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.stopEtherealMusic();
    }
    
    playEtherealMusic() {
        if (!this.audioSystem || !this.audioSystem.isEnabled) return;
        
        this.audioSystem.initAudioContext();
        const ctx = this.audioSystem.audioContext;
        
        this.etherealGain = ctx.createGain();
        this.etherealGain.gain.value = 0.03 * this.audioSystem.volume;
        this.etherealGain.connect(ctx.destination);
        
        const frequencies = [82.5, 110, 165, 220, 330];
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            const oscGain = ctx.createGain();
            oscGain.gain.value = 0.015 * this.audioSystem.volume;
            
            osc.connect(oscGain);
            oscGain.connect(this.etherealGain);
            
            osc.start();
            this.etherealOscillators.push({ osc, gain: oscGain, baseFreq: freq });
            
            this.modulateEtherealOscillator(i);
        });
    }
    
    modulateEtherealOscillator(index) {
        if (!this.isActive || !this.etherealOscillators[index]) return;
        
        const { osc, baseFreq } = this.etherealOscillators[index];
        const modulation = Math.sin(this.time * 0.0003 + index * 0.5) * 1.5;
        osc.frequency.value = baseFreq + modulation;
        
        setTimeout(() => this.modulateEtherealOscillator(index), 200);
    }
    
    stopEtherealMusic() {
        this.etherealOscillators.forEach(({ osc }) => osc.stop());
        this.etherealOscillators = [];
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        this.nebulaClouds.forEach(nebula => {
            nebula.x += nebula.speedX;
            nebula.y += nebula.speedY;
            nebula.phase += nebula.pulseSpeed;
            
            if (nebula.x < -nebula.radius * 2) nebula.x = this.width + nebula.radius * 2;
            if (nebula.x > this.width + nebula.radius * 2) nebula.x = -nebula.radius * 2;
            if (nebula.y < -nebula.radius * 2) nebula.y = this.height + nebula.radius * 2;
            if (nebula.y > this.height + nebula.radius * 2) nebula.y = -nebula.radius * 2;
        });
        
        this.cosmicDust = this.cosmicDust.filter(p => {
            p.wobble += p.wobbleSpeed;
            p.x += p.speedX + Math.sin(p.wobble) * 0.15;
            p.y += p.speedY;
            p.life -= p.decay;
            p.opacity = p.life * 0.3;
            
            if (p.y < -10) {
                p.y = this.height + 10;
                p.x = Math.random() * this.width;
                p.life = 1;
            }
            
            return p.life > 0;
        });
        
        if (this.cosmicDust.length < 60) {
            this.cosmicDust.push({
                x: Math.random() * this.width,
                y: this.height + 10,
                size: Math.random() * 1.5 + 0.5,
                opacity: 0.3,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: -Math.random() * 0.1 - 0.05,
                life: 1,
                decay: Math.random() * 0.0003 + 0.0001,
                color: '150, 180, 255',
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.01 + 0.005
            });
        }
        
        this.softGlows.forEach(glow => {
            glow.phase += glow.pulseSpeed;
        });
        
        if (Math.random() < 0.005 && this.shootingStars.length < 2) {
            this.shootingStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.4,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 6 + 4,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
                opacity: 1,
                decay: 0.008,
                trail: []
            });
        }
        
        this.shootingStars = this.shootingStars.filter(star => {
            star.trail.push({ x: star.x, y: star.y, opacity: star.opacity });
            if (star.trail.length > 15) star.trail.shift();
            
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            star.opacity -= star.decay;
            
            star.trail.forEach(t => t.opacity -= 0.06);
            star.trail = star.trail.filter(t => t.opacity > 0);
            
            return star.opacity > 0;
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawDeepBlueBackground();
        this.drawNebulaClouds();
        this.drawUniverseStars();
        this.drawCosmicDust();
        this.drawSoftGlows();
        this.drawShootingStars();
        this.drawVignette();
    }
    
    drawDeepBlueBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.width * 0.8
        );
        gradient.addColorStop(0, '#0a1028');
        gradient.addColorStop(0.3, '#080c20');
        gradient.addColorStop(0.6, '#060a18');
        gradient.addColorStop(1, '#040810');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawUniverseStars() {
        this.universeStars.forEach(star => {
            const twinkle = Math.sin(this.time * star.twinkleSpeed + star.phase) * 0.3 + 0.7;
            const opacity = star.opacity * twinkle;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
            this.ctx.fill();
            
            if (star.size > 1.5) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${star.color}, ${opacity * 0.15})`;
                this.ctx.fill();
            }
        });
    }
    
    drawNebulaClouds() {
        this.nebulaClouds.forEach(nebula => {
            const pulse = Math.sin(this.time * 0.001 + nebula.phase) * 0.5 + 0.5;
            const radius = nebula.radius * (1 + pulse * 0.08);
            
            const gradient = this.ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, radius);
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(nebula.x - radius, nebula.y - radius, radius * 2, radius * 2);
        });
    }
    
    drawCosmicDust() {
        this.cosmicDust.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity * 0.2})`;
            this.ctx.fill();
        });
    }
    
    drawSoftGlows() {
        this.softGlows.forEach(glow => {
            const pulse = Math.sin(this.time * glow.pulseSpeed + glow.phase) * 0.5 + 0.5;
            const opacity = glow.opacity * pulse;
            const { r, g, b } = { r: parseInt(glow.color.split(',')[0]), g: parseInt(glow.color.split(',')[1]), b: parseInt(glow.color.split(',')[2]) };
            
            const gradient = this.ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.radius);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(glow.x - glow.radius, glow.y - glow.radius, glow.radius * 2, glow.radius * 2);
        });
    }
    
    drawShootingStars() {
        this.shootingStars.forEach(star => {
            star.trail.forEach((t, i) => {
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, 1.5 * t.opacity, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(200, 220, 255, ${t.opacity * 0.5})`;
                this.ctx.fill();
            });
            
            const endX = star.x - Math.cos(star.angle) * star.length;
            const endY = star.y - Math.sin(star.angle) * star.length;
            
            const gradient = this.ctx.createLinearGradient(star.x, star.y, endX, endY);
            gradient.addColorStop(0, `rgba(200, 220, 255, ${star.opacity})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity})`;
            this.ctx.fill();
        });
    }
    
    drawVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, this.width * 0.3,
            this.centerX, this.centerY, this.width * 0.8
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    animate(currentTime = 0) {
        if (!this.isActive) return;
        
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
}
