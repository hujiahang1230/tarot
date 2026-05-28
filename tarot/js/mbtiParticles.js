/**
 * MBTI宇宙粒子系统
 * 动态背景，随测试进度和人格类型变化
 */

class MBTIParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        this.mouse = { x: this.centerX, y: this.centerY };
        this.parallax = { x: 0, y: 0 };
        
        this.time = 0;
        this.lastFrameTime = 0;
        
        this.currentMood = 'neutral';
        this.backgroundHue = 240;
        this.targetHue = 240;
        
        this.stars = [];
        this.nebulas = [];
        this.fogParticles = [];
        this.personalityParticles = [];
        this.lightOrbs = [];
        this.shootingStars = [];
        
        this.testProgress = 0;
        this.currentDimension = '';
        
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        this.createStars(300);
        this.createNebulas(8);
        this.createFogParticles(20);
        this.createPersonalityParticles(80);
        this.createLightOrbs(5);
        
        this.animate(0);
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }
    
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.parallax.x = (e.clientX / this.width - 0.5) * 25;
        this.parallax.y = (e.clientY / this.height - 0.5) * 25;
    }
    
    setMood(mood) {
        this.currentMood = mood;
        const moodHues = {
            neutral: 240,
            anxiety: 280,
            sadness: 220,
            happy: 45,
            calm: 200,
            energy: 30
        };
        this.targetHue = moodHues[mood] || 240;
    }
    
    setDimension(dimension) {
        this.currentDimension = dimension;
        const dimHues = {
            'EI': 60,
            'SN': 120,
            'TF': 300,
            'JP': 180
        };
        this.targetHue = dimHues[dimension] || 240;
    }
    
    setProgress(progress) {
        this.testProgress = progress;
    }
    
    createStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.3,
                baseOpacity: Math.random() * 0.6 + 0.2,
                opacity: 0,
                twinkleSpeed: Math.random() * 0.008 + 0.003,
                phase: Math.random() * Math.PI * 2,
                speedX: (Math.random() - 0.5) * 0.05,
                speedY: (Math.random() - 0.5) * 0.03,
                parallaxFactor: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    createNebulas(count) {
        this.nebulas = [];
        for (let i = 0; i < count; i++) {
            this.nebulas.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 250 + 150,
                hue: this.backgroundHue + Math.random() * 40 - 20,
                speedX: (Math.random() - 0.5) * 0.08,
                speedY: (Math.random() - 0.5) * 0.05,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.002 + 0.001
            });
        }
    }
    
    createFogParticles(count) {
        this.fogParticles = [];
        for (let i = 0; i < count; i++) {
            this.fogParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 200 + 100,
                opacity: Math.random() * 0.06 + 0.02,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.2,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.005 + 0.002
            });
        }
    }
    
    createPersonalityParticles(count) {
        this.personalityParticles = [];
        for (let i = 0; i < count; i++) {
            this.personalityParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: -Math.random() * 0.1 - 0.05,
                life: 1,
                decay: Math.random() * 0.0003 + 0.0001,
                hue: this.backgroundHue + Math.random() * 30,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.01 + 0.005
            });
        }
    }
    
    createLightOrbs(count) {
        this.lightOrbs = [];
        for (let i = 0; i < count; i++) {
            this.lightOrbs.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 100 + 50,
                opacity: Math.random() * 0.08 + 0.02,
                pulseSpeed: Math.random() * 0.003 + 0.001,
                phase: Math.random() * Math.PI * 2,
                hue: this.backgroundHue + Math.random() * 40
            });
        }
    }
    
    update() {
        this.backgroundHue += (this.targetHue - this.backgroundHue) * 0.02;
        
        this.stars.forEach(star => {
            star.phase += star.twinkleSpeed;
            const progressSync = this.testProgress * 0.2;
            star.opacity = star.baseOpacity + progressSync;
            star.x += star.speedX + this.parallax.x * star.parallaxFactor * 0.1;
            star.y += star.speedY + this.parallax.y * star.parallaxFactor * 0.1;
            
            if (star.x < 0) star.x = this.width;
            if (star.x > this.width) star.x = 0;
            if (star.y < 0) star.y = this.height;
            if (star.y > this.height) star.y = 0;
        });
        
        this.nebulas.forEach(nebula => {
            nebula.hue = this.backgroundHue + Math.sin(this.time * 0.0005) * 20;
            nebula.x += nebula.speedX + this.parallax.x * 0.05;
            nebula.y += nebula.speedY + this.parallax.y * 0.05;
            nebula.phase += nebula.pulseSpeed;
            
            if (nebula.x < -nebula.radius * 2) nebula.x = this.width + nebula.radius * 2;
            if (nebula.x > this.width + nebula.radius * 2) nebula.x = -nebula.radius * 2;
            if (nebula.y < -nebula.radius * 2) nebula.y = this.height + nebula.radius * 2;
            if (nebula.y > this.height + nebula.radius * 2) nebula.y = -nebula.radius * 2;
        });
        
        this.fogParticles.forEach(fog => {
            fog.x += fog.speedX;
            fog.y += fog.speedY;
            fog.phase += fog.pulseSpeed;
            
            if (fog.x < -fog.radius) fog.x = this.width + fog.radius;
            if (fog.x > this.width + fog.radius) fog.x = -fog.radius;
            if (fog.y < -fog.radius) fog.y = this.height + fog.radius;
            if (fog.y > this.height + fog.radius) fog.y = -fog.radius;
        });
        
        this.personalityParticles = this.personalityParticles.filter(p => {
            p.wobble += p.wobbleSpeed;
            p.x += p.speedX + Math.sin(p.wobble) * 0.15;
            p.y += p.speedY;
            p.life -= p.decay;
            p.opacity = p.life * 0.4;
            p.hue = this.backgroundHue + Math.sin(this.time * 0.001) * 20;
            
            if (p.y < -10) {
                p.y = this.height + 10;
                p.x = Math.random() * this.width;
                p.life = 1;
            }
            
            return p.life > 0;
        });
        
        if (this.personalityParticles.length < 80) {
            this.personalityParticles.push({
                x: Math.random() * this.width,
                y: this.height + 10,
                size: Math.random() * 1.5 + 0.5,
                opacity: 0.4,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: -Math.random() * 0.1 - 0.05,
                life: 1,
                decay: Math.random() * 0.0003 + 0.0001,
                hue: this.backgroundHue + Math.random() * 30,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.01 + 0.005
            });
        }
        
        this.lightOrbs.forEach(orb => {
            orb.hue = this.backgroundHue + Math.sin(this.time * 0.0008 + orb.phase) * 30;
            orb.phase += orb.pulseSpeed;
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
        
        this.drawBackground();
        this.drawNebulas();
        this.drawFog();
        this.drawStars();
        this.drawPersonalityParticles();
        this.drawLightOrbs();
        this.drawShootingStars();
        this.drawVignette();
    }
    
    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX + this.parallax.x * 0.5,
            this.centerY + this.parallax.y * 0.5,
            0,
            this.centerX,
            this.centerY,
            this.width * 0.8
        );
        gradient.addColorStop(0, `hsl(${this.backgroundHue}, 40%, 8%)`);
        gradient.addColorStop(0.4, `hsl(${this.backgroundHue}, 35%, 5%)`);
        gradient.addColorStop(0.7, `hsl(${this.backgroundHue}, 30%, 3%)`);
        gradient.addColorStop(1, `hsl(${this.backgroundHue}, 25%, 2%)`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawStars() {
        this.stars.forEach(star => {
            const twinkle = Math.sin(star.phase) * 0.3 + 0.7;
            const opacity = star.opacity * twinkle;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${this.backgroundHue + 20}, 60%, 80%, ${opacity})`;
            this.ctx.fill();
            
            if (star.size > 1.5) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${this.backgroundHue + 20}, 60%, 80%, ${opacity * 0.15})`;
                this.ctx.fill();
            }
        });
    }
    
    drawNebulas() {
        this.nebulas.forEach(nebula => {
            const pulse = Math.sin(this.time * 0.001 + nebula.phase) * 0.5 + 0.5;
            const radius = nebula.radius * (1 + pulse * 0.08);
            
            const gradient = this.ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, radius);
            gradient.addColorStop(0, `hsla(${nebula.hue}, 50%, 40%, 0.05)`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(nebula.x - radius, nebula.y - radius, radius * 2, radius * 2);
        });
    }
    
    drawFog() {
        this.fogParticles.forEach(fog => {
            const pulse = Math.sin(this.time * fog.pulseSpeed + fog.phase) * 0.5 + 0.5;
            const opacity = fog.opacity * pulse;
            
            const gradient = this.ctx.createRadialGradient(fog.x, fog.y, 0, fog.x, fog.y, fog.radius);
            gradient.addColorStop(0, `hsla(${this.backgroundHue}, 30%, 30%, ${opacity})`);
            gradient.addColorStop(0.5, `hsla(${this.backgroundHue}, 25%, 20%, ${opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(fog.x - fog.radius, fog.y - fog.radius, fog.radius * 2, fog.radius * 2);
        });
    }
    
    drawPersonalityParticles() {
        this.personalityParticles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${p.opacity})`;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${p.opacity * 0.2})`;
            this.ctx.fill();
        });
    }
    
    drawLightOrbs() {
        this.lightOrbs.forEach(orb => {
            const pulse = Math.sin(this.time * orb.pulseSpeed + orb.phase) * 0.5 + 0.5;
            const opacity = orb.opacity * pulse;
            
            const gradient = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
            gradient.addColorStop(0, `hsla(${orb.hue}, 50%, 60%, ${opacity})`;
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2);
        });
    }
    
    drawShootingStars() {
        this.shootingStars.forEach(star => {
            star.trail.forEach((t, i) => {
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, 1.5 * t.opacity, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${this.backgroundHue + 30}, 70%, 80%, ${t.opacity * 0.5})`;
                this.ctx.fill();
            });
            
            const endX = star.x - Math.cos(star.angle) * star.length;
            const endY = star.y - Math.sin(star.angle) * star.length;
            
            const gradient = this.ctx.createLinearGradient(star.x, star.y, endX, endY);
            gradient.addColorStop(0, `hsla(${this.backgroundHue + 30}, 70%, 80%, ${star.opacity})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${this.backgroundHue + 30}, 70%, 80%, ${star.opacity})`;
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
    
    animate(currentTime) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.time += deltaTime;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
