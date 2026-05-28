/**
 * Particle System Module - Enhanced
 * Handles canvas-based particle animations with parallax, fog, light beams
 */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.stars = [];
        this.nebulas = [];
        this.shootingStars = [];
        this.magicParticles = [];
        this.fogParticles = [];
        this.lightBeams = [];
        this.ambientParticles = [];
        this.theme = {
            background: ['#1a1030', '#0f0f25', '#0a0a1a'],
            starPalette: ['212, 168, 67', '123, 79, 191', '255, 255, 255'],
            nebulaPalette: [
                'rgba(123, 79, 191, 0.04)',
                'rgba(26, 35, 126, 0.05)',
                'rgba(212, 168, 67, 0.03)',
                'rgba(92, 107, 192, 0.04)',
                'rgba(180, 50, 180, 0.03)'
            ],
            fogPalette: ['100, 80, 140', '60, 40, 100'],
            mouseGlow: ['212, 168, 67', '123, 79, 191', '26, 35, 126'],
            speedMultiplier: 1
        };

        this.mouse = { x: -1000, y: -1000, prevX: 0, prevY: 0, speed: 0 };
        this.parallax = { x: 0, y: 0 };
        this.animationId = null;
        this.lastTime = 0;
        this.time = 0;

        this.init();
    }

    init() {
        this.resize();
        this.createStars();
        this.createNebulas();
        this.createFogParticles();
        this.createAmbientParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.createStars();
        this.createFogParticles();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousemove', (e) => {
            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            const dx = this.mouse.x - this.mouse.prevX;
            const dy = this.mouse.y - this.mouse.prevY;
            this.mouse.speed = Math.sqrt(dx * dx + dy * dy);

            // Parallax calculation
            this.parallax.x = (this.mouse.x / this.width - 0.5) * 20;
            this.parallax.y = (this.mouse.y / this.height - 0.5) * 20;

            // Create magic particles near mouse
            if (Math.random() < 0.2) {
                this.addMagicParticle(e.clientX, e.clientY);
            }

            // Create trail based on mouse speed
            if (this.mouse.speed > 5) {
                this.createTrail(e.clientX, e.clientY, Math.min(Math.floor(this.mouse.speed / 10), 5));
            }
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
            this.mouse.speed = 0;
        });
    }

    /**
     * Create star field with parallax layers
     */
    createStars(count = 150) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleOffset: Math.random() * Math.PI * 2,
                layer: layer,
                parallaxFactor: 0.02 + layer * 0.03,
                color: this.theme.starPalette[Math.floor(Math.random() * this.theme.starPalette.length)]
            });
        }
    }

    /**
     * Create nebula clouds
     */
    createNebulas(count = 6) {
        this.nebulas = [];
        for (let i = 0; i < count; i++) {
            this.nebulas.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 250 + 150,
                color: this.theme.nebulaPalette[Math.floor(Math.random() * this.theme.nebulaPalette.length)],
                speedX: (Math.random() - 0.5) * 0.15,
                speedY: (Math.random() - 0.5) * 0.1,
                phase: Math.random() * Math.PI * 2,
                layer: Math.floor(Math.random() * 3),
                parallaxFactor: 0.05 + Math.random() * 0.1
            });
        }
    }

    /**
     * Create fog particles for atmospheric effect
     */
    createFogParticles(count = 8) {
        this.fogParticles = [];
        for (let i = 0; i < count; i++) {
            this.fogParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 200 + 100,
                opacity: Math.random() * 0.08 + 0.02,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.2,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.005 + 0.002
            });
        }
    }

    /**
     * Create ambient floating particles
     */
    createAmbientParticles(count = 30) {
        this.ambientParticles = [];
        for (let i = 0; i < count; i++) {
            this.ambientParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: -Math.random() * 0.3 - 0.1,
                life: 1,
                decay: Math.random() * 0.001 + 0.0005,
                color: this.theme.starPalette[Math.floor(Math.random() * Math.max(2, this.theme.starPalette.length - 1))],
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    /**
     * Add magic particle near mouse
     */
    addMagicParticle(x, y) {
        this.magicParticles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            size: Math.random() * 3 + 1,
            opacity: 1,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            life: 1,
            decay: Math.random() * 0.02 + 0.01,
            color: Math.random() > 0.5 ? '212, 168, 67' : '123, 79, 191'
        });
    }

    /**
     * Create shooting star
     */
    createShootingStar() {
        if (Math.random() < 0.008 && this.shootingStars.length < 3) {
            this.shootingStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.5,
                length: Math.random() * 100 + 50,
                speed: Math.random() * 10 + 8,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
                opacity: 1,
                decay: 0.012,
                trail: []
            });
        }
    }

    /**
     * Create light beam
     */
    createLightBeam() {
        if (Math.random() < 0.003 && this.lightBeams.length < 2) {
            this.lightBeams.push({
                x: Math.random() * this.width,
                y: -100,
                width: Math.random() * 100 + 50,
                height: this.height + 200,
                angle: (Math.random() - 0.5) * 0.5,
                opacity: 0,
                maxOpacity: Math.random() * 0.08 + 0.03,
                speed: 0.001,
                phase: 0,
                color: Math.random() > 0.5 ? '212, 168, 67' : '123, 79, 191'
            });
        }
    }

    /**
     * Create burst effect at position
     */
    createBurst(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
            const speed = Math.random() * 5 + 2;
            this.magicParticles.push({
                x,
                y,
                size: Math.random() * 4 + 2,
                opacity: 1,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                life: 1,
                decay: Math.random() * 0.015 + 0.008,
                color: Math.random() > 0.3 ? '212, 168, 67' : '123, 79, 191'
            });
        }
    }

    /**
     * Create trail effect
     */
    createTrail(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            this.magicParticles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                size: Math.random() * 2 + 1,
                opacity: 0.8,
                speedX: (Math.random() - 0.5) * 1,
                speedY: (Math.random() - 0.5) * 1,
                life: 0.8,
                decay: 0.02,
                color: '212, 168, 67'
            });
        }
    }

    /**
     * Create orbiting particles around element
     */
    createOrbitParticles(x, y, count = 12, radius = 60) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            this.magicParticles.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                size: Math.random() * 2 + 1,
                opacity: 0.8,
                speedX: Math.cos(angle + Math.PI / 2) * 0.5,
                speedY: Math.sin(angle + Math.PI / 2) * 0.5,
                life: 1,
                decay: 0.008,
                color: '212, 168, 67',
                orbit: true,
                orbitCenter: { x, y },
                orbitRadius: radius,
                orbitAngle: angle,
                orbitSpeed: 0.02
            });
        }
    }

    /**
     * Update all particles
     */
    update(deltaTime) {
        this.time += deltaTime;
        const speed = this.theme.speedMultiplier || 1;

        // Update nebula positions with parallax
        this.nebulas.forEach(nebula => {
            nebula.x += nebula.speedX * speed;
            nebula.y += nebula.speedY * speed;
            nebula.phase += 0.003;

            if (nebula.x < -nebula.radius * 2) nebula.x = this.width + nebula.radius * 2;
            if (nebula.x > this.width + nebula.radius * 2) nebula.x = -nebula.radius * 2;
            if (nebula.y < -nebula.radius * 2) nebula.y = this.height + nebula.radius * 2;
            if (nebula.y > this.height + nebula.radius * 2) nebula.y = -nebula.radius * 2;
        });

        // Update fog particles
        this.fogParticles.forEach(fog => {
            fog.x += fog.speedX * speed;
            fog.y += fog.speedY * speed;
            fog.phase += fog.pulseSpeed;

            if (fog.x < -fog.radius) fog.x = this.width + fog.radius;
            if (fog.x > this.width + fog.radius) fog.x = -fog.radius;
            if (fog.y < -fog.radius) fog.y = this.height + fog.radius;
            if (fog.y > this.height + fog.radius) fog.y = -fog.radius;
        });

        // Update ambient particles
        this.ambientParticles = this.ambientParticles.filter(p => {
            p.wobble += p.wobbleSpeed;
            p.x += (p.speedX + Math.sin(p.wobble) * 0.3) * speed;
            p.y += p.speedY * speed;
            p.life -= p.decay;
            p.opacity = p.life * 0.3;

            if (p.y < -10) {
                p.y = this.height + 10;
                p.x = Math.random() * this.width;
                p.life = 1;
            }

            return p.life > 0;
        });

            // Replenish ambient particles
            if (this.ambientParticles.length < 30) {
            this.ambientParticles.push({
                x: Math.random() * this.width,
                y: this.height + 10,
                size: Math.random() * 2 + 0.5,
                opacity: 0.3,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: -Math.random() * 0.3 - 0.1,
                life: 1,
                decay: Math.random() * 0.001 + 0.0005,
                color: this.theme.starPalette[Math.floor(Math.random() * Math.max(2, this.theme.starPalette.length - 1))],
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.02 + 0.01
            });
        }

        // Update magic particles
        this.magicParticles = this.magicParticles.filter(p => {
            if (p.orbit) {
                p.orbitAngle += p.orbitSpeed;
                p.x = p.orbitCenter.x + Math.cos(p.orbitAngle) * p.orbitRadius;
                p.y = p.orbitCenter.y + Math.sin(p.orbitAngle) * p.orbitRadius;
                p.life -= p.decay;
                p.opacity = p.life;
                return p.life > 0;
            }

            p.x += p.speedX * speed;
            p.y += p.speedY * speed;
            p.life -= p.decay;
            p.opacity = p.life;
            p.size *= 0.99;
            p.speedX *= 0.98;
            p.speedY *= 0.98;
            return p.life > 0;
        });

        // Update shooting stars
        this.createShootingStar();
        this.shootingStars = this.shootingStars.filter(star => {
            star.trail.push({ x: star.x, y: star.y, opacity: star.opacity });
            if (star.trail.length > 20) star.trail.shift();

            star.x += Math.cos(star.angle) * star.speed * speed;
            star.y += Math.sin(star.angle) * star.speed * speed;
            star.opacity -= star.decay;

            star.trail.forEach(t => t.opacity -= 0.05);
            star.trail = star.trail.filter(t => t.opacity > 0);

            return star.opacity > 0;
        });

        // Update light beams
        this.createLightBeam();
        this.lightBeams = this.lightBeams.filter(beam => {
            beam.phase += beam.speed;
            beam.opacity = Math.sin(beam.phase * Math.PI) * beam.maxOpacity;
            beam.y += 0.5 * speed;

            if (beam.phase > 1) return false;
            return true;
        });
    }

    /**
     * Draw all elements
     */
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.drawBackground();
        this.drawNebulas();
        this.drawStars();
        this.drawFog();
        this.drawLightBeams();
        this.drawAmbientParticles();
        this.drawShootingStars();
        this.drawMagicParticles();
        this.drawMouseGlow();
        this.drawVignette();
    }

    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.width / 2 + this.parallax.x * 0.5,
            this.height / 2 + this.parallax.y * 0.5,
            0,
            this.width / 2,
            this.height / 2,
            this.width * 0.8
        );
        gradient.addColorStop(0, this.theme.background[0]);
        gradient.addColorStop(0.5, this.theme.background[1]);
        gradient.addColorStop(1, this.theme.background[2]);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawStars() {
        this.stars.forEach(star => {
            const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            const opacity = star.opacity * twinkle;

            const px = star.x + this.parallax.x * star.parallaxFactor;
            const py = star.y + this.parallax.y * star.parallaxFactor;

            this.ctx.beginPath();
            this.ctx.arc(px, py, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
            this.ctx.fill();

            if (star.size > 1.5) {
                this.ctx.beginPath();
                this.ctx.arc(px, py, star.size * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${star.color}, ${opacity * 0.15})`;
                this.ctx.fill();

                // Cross flare for bright stars
                if (star.size > 2 && opacity > 0.7) {
                    this.ctx.strokeStyle = `rgba(${star.color}, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(px - star.size * 4, py);
                    this.ctx.lineTo(px + star.size * 4, py);
                    this.ctx.moveTo(px, py - star.size * 4);
                    this.ctx.lineTo(px, py + star.size * 4);
                    this.ctx.stroke();
                }
            }
        });
    }

    drawNebulas() {
        this.nebulas.forEach(nebula => {
            const pulse = Math.sin(this.time * 0.001 + nebula.phase) * 0.5 + 0.5;
            const radius = nebula.radius * (1 + pulse * 0.1);

            const px = nebula.x + this.parallax.x * nebula.parallaxFactor;
            const py = nebula.y + this.parallax.y * nebula.parallaxFactor;

            const gradient = this.ctx.createRadialGradient(px, py, 0, px, py, radius);
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
        });
    }

    drawFog() {
        this.fogParticles.forEach(fog => {
            const pulse = Math.sin(this.time * fog.pulseSpeed + fog.phase) * 0.5 + 0.5;
            const opacity = fog.opacity * pulse;
            const [fogA, fogB] = this.theme.fogPalette;

            const gradient = this.ctx.createRadialGradient(fog.x, fog.y, 0, fog.x, fog.y, fog.radius);
            gradient.addColorStop(0, `rgba(${fogA}, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(${fogB}, ${opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(fog.x - fog.radius, fog.y - fog.radius, fog.radius * 2, fog.radius * 2);
        });
    }

    drawLightBeams() {
        this.lightBeams.forEach(beam => {
            this.ctx.save();
            this.ctx.translate(beam.x, beam.y);
            this.ctx.rotate(beam.angle);

            const gradient = this.ctx.createLinearGradient(0, 0, 0, beam.height);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.3, `rgba(${beam.color}, ${beam.opacity})`);
            gradient.addColorStop(0.7, `rgba(${beam.color}, ${beam.opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(-beam.width / 2, 0);
            this.ctx.lineTo(beam.width / 2, 0);
            this.ctx.lineTo(beam.width, beam.height);
            this.ctx.lineTo(-beam.width, beam.height);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    drawAmbientParticles() {
        this.ambientParticles.forEach(p => {
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

    drawShootingStars() {
        this.shootingStars.forEach(star => {
            // Draw trail
            star.trail.forEach((t, i) => {
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, 2 * t.opacity, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${t.opacity * 0.5})`;
                this.ctx.fill();
            });

            // Draw head
            const endX = star.x - Math.cos(star.angle) * star.length;
            const endY = star.y - Math.sin(star.angle) * star.length;

            const gradient = this.ctx.createLinearGradient(star.x, star.y, endX, endY);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.fill();
        });
    }

    drawMagicParticles() {
        this.magicParticles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity * 0.2})`;
            this.ctx.fill();
        });
    }

    drawMouseGlow() {
        if (this.mouse.x < 0) return;

        const intensity = Math.min(this.mouse.speed / 50, 1);
        const radius = 80 + intensity * 40;

        const gradient = this.ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, radius
        );
        gradient.addColorStop(0, `rgba(${this.theme.mouseGlow[0]}, ${0.15 + intensity * 0.1})`);
        gradient.addColorStop(0.3, `rgba(${this.theme.mouseGlow[1]}, ${0.08 + intensity * 0.05})`);
        gradient.addColorStop(0.7, `rgba(${this.theme.mouseGlow[2]}, ${0.04 + intensity * 0.02})`);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.mouse.x - radius, this.mouse.y - radius, radius * 2, radius * 2);
    }

    drawVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width * 0.3,
            this.width / 2, this.height / 2, this.width * 0.8
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Animation loop
     */
    animate(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    setEmotionTheme(scene = {}) {
        this.theme = {
            ...this.theme,
            background: scene.palette || this.theme.background,
            nebulaPalette: scene.nebula || this.theme.nebulaPalette,
            speedMultiplier: scene.particleSpeed || 0.7,
            mouseGlow: scene.mouseGlow || this.theme.mouseGlow
        };

        const accentByGlow = {
            'sunlit-gold': ['245, 199, 92', '255, 229, 156', '255, 255, 255'],
            'golden-dawn': ['212, 168, 67', '255, 214, 128', '255, 255, 255'],
            ember: ['255, 124, 82', '255, 182, 123', '255, 235, 214'],
            'soft-blue': ['116, 160, 255', '170, 210, 255', '255, 255, 255'],
            'moon-mist': ['168, 193, 255', '210, 225, 255', '255, 255, 255'],
            'violet-halo': ['183, 141, 255', '224, 205, 255', '255, 255, 255'],
            'fog-silver': ['180, 196, 214', '232, 238, 245', '255, 255, 255'],
            'lavender-breath': ['203, 163, 255', '233, 207, 255', '255, 255, 255'],
            'classic-cosmic': ['212, 168, 67', '123, 79, 191', '255, 255, 255']
        };

        const fogByGlow = {
            'sunlit-gold': ['160, 110, 45', '90, 55, 28'],
            'golden-dawn': ['150, 110, 50', '90, 65, 32'],
            ember: ['170, 70, 40', '80, 20, 20'],
            'soft-blue': ['58, 96, 170', '25, 40, 95'],
            'moon-mist': ['95, 120, 175', '40, 50, 90'],
            'violet-halo': ['112, 78, 170', '54, 35, 106'],
            'fog-silver': ['120, 130, 150', '60, 70, 95'],
            'lavender-breath': ['132, 95, 170', '70, 45, 100'],
            'classic-cosmic': ['100, 80, 140', '60, 40, 100']
        };

        if (scene.glow && accentByGlow[scene.glow]) {
            this.theme.starPalette = accentByGlow[scene.glow];
            this.theme.fogPalette = fogByGlow[scene.glow] || this.theme.fogPalette;
        }

        this.createStars();
        this.createNebulas();
        this.createAmbientParticles();
    }
}
