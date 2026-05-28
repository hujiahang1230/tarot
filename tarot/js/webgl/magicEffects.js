/**
 * WebGL Magic Effects Module
 * Implements energy ripples, magic circle shaders, glowing particles, nebula animations
 */

class WebGLMagicEffects {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        this.programs = {};
        this.buffers = {};
        this.animationId = null;
        this.time = 0;
        this.effects = {
            magicCircle: true,
            energyRipple: false,
            glowParticles: true,
            nebula: true
        };

        this.ripples = [];
        this.particles = [];

        if (!this.gl) {
            console.warn('WebGL not supported, falling back to CSS effects');
            return;
        }

        this.init();
    }

    init() {
        this.resize();
        this.createPrograms();
        this.createBuffers();
        this.initParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;

        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('click', (e) => {
            if (this.effects.energyRipple) {
                this.addRipple(e.clientX, e.clientY);
            }
        });
    }

    /**
     * Create shader programs
     */
    createPrograms() {
        // Magic Circle Shader
        this.programs.magicCircle = this.createProgram(
            `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
            `,
            `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;

            #define PI 3.14159265359

            float circle(vec2 uv, vec2 center, float radius) {
                return smoothstep(radius, radius - 0.01, length(uv - center));
            }

            float ring(vec2 uv, vec2 center, float radius, float thickness) {
                float d = length(uv - center);
                return smoothstep(thickness, thickness - 0.005, abs(d - radius));
            }

            float rune(vec2 uv, vec2 center, float size, float seed) {
                float angle = atan(uv.y - center.y, uv.x - center.x);
                float r = length(uv - center);
                float rune = 0.0;

                for(int i = 0; i < 6; i++) {
                    float a = angle + float(i) * PI / 3.0 + seed;
                    rune += smoothstep(0.02, 0.0, abs(sin(a * 3.0 + u_time)));
                }

                return rune * smoothstep(size, size - 0.1, r);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution;
                vec2 center = vec2(0.5) + (u_mouse - 0.5) * 0.05;

                float alpha = 0.0;
                vec3 color = vec3(0.83, 0.66, 0.26);

                // Outer ring
                alpha += ring(uv, center, 0.35, 0.003) * (0.5 + 0.5 * sin(u_time * 0.5));

                // Inner ring (rotating opposite)
                float innerRing = ring(uv, center, 0.25, 0.002);
                innerRing *= 0.5 + 0.5 * sin(u_time * 0.7 + 1.0);
                alpha += innerRing;

                // Magic circle symbols
                for(int i = 0; i < 8; i++) {
                    float angle = float(i) * PI / 4.0 + u_time * 0.2;
                    vec2 symbolPos = center + vec2(cos(angle), sin(angle)) * 0.3;
                    float symbol = circle(uv, symbolPos, 0.015);
                    symbol *= 0.5 + 0.5 * sin(u_time + float(i));
                    alpha += symbol;
                }

                // Center glow
                float centerGlow = exp(-length(uv - center) * 8.0);
                centerGlow *= 0.3 + 0.2 * sin(u_time * 0.3);
                alpha += centerGlow * 0.5;

                // Runes
                float runes = rune(uv, center, 0.3, u_time * 0.1);
                alpha += runes * 0.15;

                // Energy lines
                for(int i = 0; i < 12; i++) {
                    float angle = float(i) * PI / 6.0 + u_time * 0.15;
                    float line = abs(sin(angle - atan(uv.y - center.y, uv.x - center.x)));
                    line = smoothstep(0.98, 1.0, line);
                    line *= smoothstep(0.35, 0.1, length(uv - center));
                    alpha += line * 0.1;
                }

                gl_FragColor = vec4(color * alpha, alpha);
            }
            `
        );

        // Nebula Shader
        this.programs.nebula = this.createProgram(
            `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
            `,
            `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;

            // Simplex-like noise
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                   -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution;
                float t = u_time * 0.05;

                // Multiple noise layers
                float n1 = snoise(uv * 2.0 + t) * 0.5 + 0.5;
                float n2 = snoise(uv * 4.0 - t * 0.7) * 0.5 + 0.5;
                float n3 = snoise(uv * 1.5 + vec2(t * 0.3, -t * 0.5)) * 0.5 + 0.5;

                // Color blending
                vec3 purple = vec3(0.48, 0.19, 0.75);
                vec3 blue = vec3(0.1, 0.14, 0.49);
                vec3 gold = vec3(0.83, 0.66, 0.26);

                vec3 color = mix(blue, purple, n1);
                color = mix(color, gold * 0.3, n2 * 0.3);
                color *= n3 * 0.15;

                float alpha = (n1 * n2 * n3) * 0.08;

                gl_FragColor = vec4(color, alpha);
            }
            `
        );

        // Particle Shader
        this.programs.particles = this.createProgram(
            `
            attribute vec2 a_position;
            attribute float a_size;
            attribute float a_alpha;
            attribute vec3 a_color;
            uniform vec2 u_resolution;
            varying float v_alpha;
            varying vec3 v_color;

            void main() {
                vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                gl_PointSize = a_size;
                v_alpha = a_alpha;
                v_color = a_color;
            }
            `,
            `
            precision highp float;
            varying float v_alpha;
            varying vec3 v_color;

            void main() {
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                if (dist > 0.5) discard;

                float glow = exp(-dist * 6.0);
                float alpha = v_alpha * glow;

                gl_FragColor = vec4(v_color * glow, alpha);
            }
            `
        );
    }

    /**
     * Create shader program from source
     */
    createProgram(vertexSrc, fragmentSrc) {
        const gl = this.gl;
        const vs = this.createShader(gl.VERTEX_SHADER, vertexSrc);
        const fs = this.createShader(gl.FRAGMENT_SHADER, fragmentSrc);

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Create fullscreen quad buffer
     */
    createBuffers() {
        const gl = this.gl;

        // Fullscreen quad
        const quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);

        this.buffers.quad = quadBuffer;

        // Particle buffer
        this.buffers.particles = gl.createBuffer();
    }

    /**
     * Initialize particle system
     */
    initParticles(count = 100) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: -Math.random() * 0.5 - 0.2,
                alpha: Math.random() * 0.8 + 0.2,
                color: [
                    0.83 + Math.random() * 0.17,
                    0.66 + Math.random() * 0.1,
                    0.26 + Math.random() * 0.2
                ],
                life: 1,
                decay: Math.random() * 0.002 + 0.001
            });
        }
    }

    /**
     * Add energy ripple effect
     */
    addRipple(x, y) {
        const dpr = window.devicePixelRatio || 1;
        this.ripples.push({
            x: x * dpr,
            y: y * dpr,
            radius: 0,
            maxRadius: 200 * dpr,
            alpha: 0.8,
            speed: 3 * dpr
        });
    }

    /**
     * Create burst particles at position
     */
    createBurst(x, y, count = 30) {
        const dpr = window.devicePixelRatio || 1;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x: x * dpr,
                y: y * dpr,
                size: Math.random() * 4 + 2,
                speedX: Math.cos(angle) * speed * dpr,
                speedY: Math.sin(angle) * speed * dpr,
                alpha: 1,
                color: [
                    0.83 + Math.random() * 0.17,
                    0.66 + Math.random() * 0.1,
                    0.26 + Math.random() * 0.2
                ],
                life: 1,
                decay: Math.random() * 0.01 + 0.005
            });
        }
    }

    /**
     * Render all effects
     */
    render() {
        const gl = this.gl;
        if (!gl) return;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Render nebula
        if (this.effects.nebula && this.programs.nebula) {
            this.renderFullscreenEffect(this.programs.nebula);
        }

        // Render magic circle
        if (this.effects.magicCircle && this.programs.magicCircle) {
            this.renderMagicCircle();
        }

        // Render particles
        if (this.effects.glowParticles && this.programs.particles) {
            this.renderParticles();
        }

        // Render ripples (CSS overlay)
        this.renderRipples();
    }

    /**
     * Render fullscreen shader effect
     */
    renderFullscreenEffect(program) {
        const gl = this.gl;
        gl.useProgram(program);

        const positionLoc = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.quad);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        const timeLoc = gl.getUniformLocation(program, 'u_time');
        gl.uniform1f(timeLoc, this.time);

        const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(resolutionLoc, this.width, this.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    /**
     * Render magic circle with mouse tracking
     */
    renderMagicCircle() {
        const gl = this.gl;
        const program = this.programs.magicCircle;
        if (!program) return;

        gl.useProgram(program);

        const positionLoc = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.quad);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        const timeLoc = gl.getUniformLocation(program, 'u_time');
        gl.uniform1f(timeLoc, this.time);

        const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(resolutionLoc, this.width, this.height);

        const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
        gl.uniform2f(mouseLoc, this.mouseX / this.width, 1 - this.mouseY / this.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    /**
     * Render particles using point sprites
     */
    renderParticles() {
        const gl = this.gl;
        const program = this.programs.particles;
        if (!program || this.particles.length === 0) return;

        gl.useProgram(program);

        // Build particle data
        const data = [];
        for (const p of this.particles) {
            data.push(p.x, p.y, p.size, p.alpha, p.color[0], p.color[1], p.color[2]);
        }

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);

        const stride = 7 * 4;

        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);

        const sizeLoc = gl.getAttribLocation(program, 'a_size');
        gl.enableVertexAttribArray(sizeLoc);
        gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, stride, 8);

        const alphaLoc = gl.getAttribLocation(program, 'a_alpha');
        gl.enableVertexAttribArray(alphaLoc);
        gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, stride, 12);

        const colorLoc = gl.getAttribLocation(program, 'a_color');
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, stride, 16);

        const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(resolutionLoc, this.width, this.height);

        gl.drawArrays(gl.POINTS, 0, this.particles.length);

        gl.deleteBuffer(buffer);
    }

    /**
     * Render ripples using DOM elements
     */
    renderRipples() {
        this.ripples = this.ripples.filter(ripple => {
            ripple.radius += ripple.speed;
            ripple.alpha *= 0.97;

            if (ripple.alpha < 0.01) return false;

            // Create or update ripple element
            let el = document.getElementById(`ripple-${ripple.x}-${ripple.y}`);
            if (!el) {
                el = document.createElement('div');
                el.id = `ripple-${ripple.x}-${ripple.y}`;
                el.style.cssText = `
                    position: fixed;
                    border: 2px solid rgba(212, 168, 67, ${ripple.alpha});
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9996;
                    box-shadow: 0 0 20px rgba(212, 168, 67, ${ripple.alpha * 0.5}),
                                inset 0 0 20px rgba(212, 168, 67, ${ripple.alpha * 0.3});
                `;
                document.body.appendChild(el);
            }

            const size = ripple.radius * 2;
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.left = `${ripple.x - ripple.radius}px`;
            el.style.top = `${ripple.y - ripple.radius}px`;
            el.style.borderColor = `rgba(212, 168, 67, ${ripple.alpha})`;

            return ripple.radius < ripple.maxRadius;
        });
    }

    /**
     * Update particles
     */
    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= p.decay;
            p.alpha = p.life;
            p.size *= 0.998;

            // Respawn if out of bounds
            if (p.y < -10) {
                p.y = this.height + 10;
                p.x = Math.random() * this.width;
                p.life = 1;
            }

            return p.life > 0;
        });

        // Maintain particle count
        while (this.particles.length < 100) {
            this.particles.push({
                x: Math.random() * this.width,
                y: this.height + 10,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: -Math.random() * 0.5 - 0.2,
                alpha: 0.5,
                color: [0.83, 0.66, 0.26],
                life: 1,
                decay: Math.random() * 0.002 + 0.001
            });
        }
    }

    /**
     * Animation loop
     */
    animate() {
        this.time += 0.016;
        this.updateParticles();
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Stop animation
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    /**
     * Enable/disable effects
     */
    toggleEffect(name, enabled) {
        if (this.effects.hasOwnProperty(name)) {
            this.effects[name] = enabled;
        }
    }
}
