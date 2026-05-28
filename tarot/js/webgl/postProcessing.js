/**
 * AAA Game UI - WebGL Post Processing
 * Implements Bloom, Depth of Field, Chromatic Aberration, Film Grain, Vignette
 */

class AAAPostProcessing {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl2', { alpha: true, antialias: false, preserveDrawingBuffer: false });
        
        if (!this.gl) {
            console.warn('WebGL2 not supported, post-processing disabled');
            return;
        }

        this.time = 0;
        this.mouse = { x: 0.5, y: 0.5 };
        this.intensity = {
            bloom: 0.4,
            dof: 0.2,
            chromaticAberration: 0.1,
            filmGrain: 0.05,
            vignette: 0.3,
            fog: 0.2
        };

        this.framebuffers = [];
        this.textures = [];
        this.quadBuffer = null;

        this.init();
    }

    init() {
        this.resize();
        this.createQuadBuffer();
        this.createFramebuffers();
        this.createShaders();
        this.bindEvents();
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth * dpr;
        this.height = window.innerHeight * dpr;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.gl.viewport(0, 0, this.width, this.height);
        
        if (this.framebuffers.length > 0) {
            this.createFramebuffers();
        }
    }

    createQuadBuffer() {
        const gl = this.gl;
        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);
    }

    createFramebuffers() {
        const gl = this.gl;
        
        // Clear existing
        this.framebuffers.forEach(fb => {
            gl.deleteFramebuffer(fb);
        });
        this.textures.forEach(tex => {
            gl.deleteTexture(tex);
        });
        this.framebuffers = [];
        this.textures = [];

        // Create ping-pong framebuffers for bloom
        for (let i = 0; i < 4; i++) {
            const fb = gl.createFramebuffer();
            const tex = gl.createTexture();
            
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            
            this.framebuffers.push(fb);
            this.textures.push(tex);
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    createShaders() {
        // Bloom Extract Shader
        this.bloomExtractProgram = this.createProgram(
            `attribute vec2 a_position;
             varying vec2 v_uv;
             void main() {
                 v_uv = a_position * 0.5 + 0.5;
                 gl_Position = vec4(a_position, 0.0, 1.0);
             }`,
            `precision highp float;
             varying vec2 v_uv;
             uniform sampler2D u_texture;
             uniform float u_threshold;
             
             void main() {
                 vec4 color = texture2D(u_texture, v_uv);
                 float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
                 float soft = brightness - u_threshold + 0.5;
                 soft = clamp(soft, 0.0, 1.0);
                 soft = soft * soft * (3.0 - 2.0 * soft);
                 float contribution = max(soft, brightness - u_threshold) / max(brightness, 0.00001);
                 gl_FragColor = color * contribution;
             }`
        );

        // Gaussian Blur Shader
        this.blurProgram = this.createProgram(
            `attribute vec2 a_position;
             varying vec2 v_uv;
             void main() {
                 v_uv = a_position * 0.5 + 0.5;
                 gl_Position = vec4(a_position, 0.0, 1.0);
             }`,
            `precision highp float;
             varying vec2 v_uv;
             uniform sampler2D u_texture;
             uniform vec2 u_direction;
             uniform vec2 u_resolution;
             
             void main() {
                 vec2 texelSize = 1.0 / u_resolution;
                 vec4 result = vec4(0.0);
                 float weights[5];
                 weights[0] = 0.227027;
                 weights[1] = 0.1945946;
                 weights[2] = 0.1216216;
                 weights[3] = 0.054054;
                 weights[4] = 0.0162162;
                 
                 result += texture2D(u_texture, v_uv) * weights[0];
                 for(int i = 1; i < 5; i++) {
                     vec2 offset = u_direction * texelSize * float(i) * 2.0;
                     result += texture2D(u_texture, v_uv + offset) * weights[i];
                     result += texture2D(u_texture, v_uv - offset) * weights[i];
                 }
                 gl_FragColor = result;
             }`
        );

        // Final Composite Shader with all post-processing
        this.compositeProgram = this.createProgram(
            `attribute vec2 a_position;
             varying vec2 v_uv;
             void main() {
                 v_uv = a_position * 0.5 + 0.5;
                 gl_Position = vec4(a_position, 0.0, 1.0);
             }`,
            `precision highp float;
             varying vec2 v_uv;
             uniform sampler2D u_scene;
             uniform sampler2D u_bloom;
             uniform float u_time;
             uniform vec2 u_mouse;
             uniform float u_bloomIntensity;
             uniform float u_dofIntensity;
             uniform float u_chromaticAberration;
             uniform float u_filmGrain;
             uniform float u_vignetteIntensity;
             uniform float u_fogIntensity;
             
             // Random function for film grain
             float random(vec2 co) {
                 return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
             }
             
             void main() {
                 vec2 uv = v_uv;
                 
                 // Chromatic Aberration
                 float caStrength = u_chromaticAberration * 0.003;
                 vec2 dir = uv - u_mouse;
                 float dist = length(dir);
                 caStrength *= dist;
                 
                 float r = texture2D(u_scene, uv + dir * caStrength).r;
                 float g = texture2D(u_scene, uv).g;
                 float b = texture2D(u_scene, uv - dir * caStrength).b;
                 vec3 color = vec3(r, g, b);
                 
                 // Bloom
                 vec3 bloom = texture2D(u_bloom, uv).rgb;
                 color += bloom * u_bloomIntensity;
                 
                 // Depth of Field (simulated blur at edges)
                 float dofBlur = smoothstep(0.3, 1.2, dist) * u_dofIntensity;
                 if(dofBlur > 0.01) {
                     vec3 dofColor = vec3(0.0);
                     float samples = 0.0;
                     for(float x = -4.0; x <= 4.0; x += 1.0) {
                         for(float y = -4.0; y <= 4.0; y += 1.0) {
                             vec2 offset = vec2(x, y) * 0.001 * dofBlur;
                             dofColor += texture2D(u_scene, uv + offset).rgb;
                             samples += 1.0;
                         }
                     }
                     color = mix(color, dofColor / samples, 0.5);
                 }
                 
                 // Vignette
                 float vignette = 1.0 - dist * u_vignetteIntensity;
                 vignette = smoothstep(0.0, 1.0, vignette);
                 color *= vignette;
                 
                 // Film Grain
                 float grain = random(uv * u_time * 1000.0) * u_filmGrain;
                 color += grain - u_filmGrain * 0.5;
                 
                 // Dynamic Fog
                 float fog = exp(-dist * 2.0) * u_fogIntensity;
                 vec3 fogColor = vec3(0.06, 0.04, 0.12);
                 color = mix(fogColor, color, fog);
                 
                 // Tone mapping (ACES)
                 color = color * 1.5;
                 color = (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14);
                 
                 // Gamma correction
                 color = pow(color, vec3(1.0 / 2.2));
                 
                 gl_FragColor = vec4(color, 1.0);
             }`
        );
    }

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

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX / window.innerWidth;
            this.mouse.y = 1.0 - e.clientY / window.innerHeight;
        });
    }

    /**
     * Render scene texture through post-processing pipeline
     */
    renderSceneTexture(sceneTexture) {
        const gl = this.gl;
        if (!sceneTexture || !this.compositeProgram) return;
        
        this.time += 0.016;
        
        // Step 1: Extract bright areas
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[0]);
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(this.bloomExtractProgram);
        
        this.bindFullscreenQuad(this.bloomExtractProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
        gl.uniform1i(gl.getUniformLocation(this.bloomExtractProgram, 'u_texture'), 0);
        gl.uniform1f(gl.getUniformLocation(this.bloomExtractProgram, 'u_threshold'), 0.6);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Step 2: Horizontal blur
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[1]);
        gl.useProgram(this.blurProgram);
        this.bindFullscreenQuad(this.blurProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.uniform1i(gl.getUniformLocation(this.blurProgram, 'u_texture'), 0);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_direction'), 1.0, 0.0);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_resolution'), this.width, this.height);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Step 3: Vertical blur
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[2]);
        gl.useProgram(this.blurProgram);
        this.bindFullscreenQuad(this.blurProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
        gl.uniform1i(gl.getUniformLocation(this.blurProgram, 'u_texture'), 0);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_direction'), 0.0, 1.0);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_resolution'), this.width, this.height);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Step 4: Second blur pass for wider bloom
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[3]);
        gl.useProgram(this.blurProgram);
        this.bindFullscreenQuad(this.blurProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
        gl.uniform1i(gl.getUniformLocation(this.blurProgram, 'u_texture'), 0);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_direction'), 1.0, 0.0);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_resolution'), this.width * 0.5, this.height * 0.5);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Step 5: Final composite
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(this.compositeProgram);
        
        this.bindFullscreenQuad(this.compositeProgram);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
        gl.uniform1i(gl.getUniformLocation(this.compositeProgram, 'u_scene'), 0);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[3]);
        gl.uniform1i(gl.getUniformLocation(this.compositeProgram, 'u_bloom'), 1);
        
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_time'), this.time);
        gl.uniform2f(gl.getUniformLocation(this.compositeProgram, 'u_mouse'), this.mouse.x, this.mouse.y);
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_bloomIntensity'), this.intensity.bloom);
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_dofIntensity'), this.intensity.dof);
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_chromaticAberration'), this.intensity.chromaticAberration);
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_filmGrain'), this.intensity.filmGrain);
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_vignetteIntensity'), this.intensity.vignette);
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_fogIntensity'), this.intensity.fog);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    bindFullscreenQuad(program) {
        const gl = this.gl;
        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }

    setIntensity(name, value) {
        if (this.intensity.hasOwnProperty(name)) {
            this.intensity[name] = Math.max(0, Math.min(1, value));
        }
    }
}
