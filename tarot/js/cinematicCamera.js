/**
 * AAA Game UI - Cinematic Camera System
 * Implements movie-style camera movements, transitions, and lens effects
 */

class CinematicCamera {
    constructor() {
        this.currentShot = 'idle';
        this.targetShot = null;
        this.shotProgress = 0;
        this.shotDuration = 0;
        this.isTransitioning = false;
        this.onComplete = null;
        
        this.camera = {
            x: 0, y: 0, z: 0,
            rotationX: 0, rotationY: 0, rotationZ: 0,
            fov: 60,
            focusDistance: 1.0
        };
        
        this.targetCamera = { ...this.camera };
        this.startCamera = { ...this.camera };
        
        this.shots = {
            idle: {
                duration: 0,
                camera: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, fov: 60 }
            },
            intro: {
                duration: 3000,
                keyframes: [
                    { time: 0, camera: { x: 0, y: -100, z: 200, rotationX: 15, rotationY: 0, fov: 80 } },
                    { time: 0.5, camera: { x: 0, y: 0, z: 100, rotationX: 5, rotationY: 0, fov: 70 } },
                    { time: 1, camera: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, fov: 60 } }
                ]
            },
            cardReveal: {
                duration: 2000,
                keyframes: [
                    { time: 0, camera: { x: 0, y: 50, z: 150, rotationX: -10, rotationY: 0, fov: 50 } },
                    { time: 0.3, camera: { x: 0, y: 20, z: 80, rotationX: -5, rotationY: 0, fov: 55 } },
                    { time: 0.7, camera: { x: 0, y: 0, z: 30, rotationX: 0, rotationY: 0, fov: 60 } },
                    { time: 1, camera: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, fov: 60 } }
                ]
            },
            cardFlip: {
                duration: 1000,
                keyframes: [
                    { time: 0, camera: { x: 0, y: 0, z: 20, rotationX: 0, rotationY: -15, fov: 55 } },
                    { time: 0.5, camera: { x: 0, y: 0, z: 10, rotationX: 0, rotationY: 0, fov: 60 } },
                    { time: 1, camera: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, fov: 60 } }
                ]
            },
            spreadReveal: {
                duration: 2500,
                keyframes: [
                    { time: 0, camera: { x: -200, y: 100, z: 200, rotationX: -20, rotationY: 30, fov: 70 } },
                    { time: 0.4, camera: { x: 0, y: 50, z: 100, rotationX: -10, rotationY: 0, fov: 60 } },
                    { time: 0.7, camera: { x: 0, y: 0, z: 50, rotationX: 0, rotationY: 0, fov: 55 } },
                    { time: 1, camera: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, fov: 60 } }
                ]
            },
            dramaticZoom: {
                duration: 1500,
                keyframes: [
                    { time: 0, camera: { x: 0, y: 0, z: 100, rotationX: 0, rotationY: 0, fov: 80 } },
                    { time: 0.8, camera: { x: 0, y: 0, z: 10, rotationX: 0, rotationY: 0, fov: 40 } },
                    { time: 1, camera: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, fov: 60 } }
                ]
            },
            orbit: {
                duration: 3000,
                keyframes: [
                    { time: 0, camera: { x: 100, y: 0, z: 100, rotationX: 0, rotationY: -45, fov: 60 } },
                    { time: 0.5, camera: { x: 0, y: 50, z: 141, rotationX: -10, rotationY: 0, fov: 60 } },
                    { time: 1, camera: { x: -100, y: 0, z: 100, rotationX: 0, rotationY: 45, fov: 60 } }
                ]
            },
            menuOpen: {
                duration: 800,
                keyframes: [
                    { time: 0, camera: { x: 0, y: 0, z: 50, rotationX: 0, rotationY: 0, fov: 80 } },
                    { time: 1, camera: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, fov: 60 } }
                ]
            },
            menuClose: {
                duration: 600,
                keyframes: [
                    { time: 0, camera: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, fov: 60 } },
                    { time: 1, camera: { x: 0, y: 0, z: 50, rotationX: 0, rotationY: 0, fov: 80 } }
                ]
            }
        };
        
        this.applyCSS();
    }

    /**
     * Trigger a cinematic shot
     */
    triggerShot(shotName, onComplete = null) {
        if (!this.shots[shotName]) {
            console.warn(`Shot "${shotName}" not found`);
            return;
        }
        
        this.targetShot = shotName;
        this.shotProgress = 0;
        this.isTransitioning = true;
        this.onComplete = onComplete;
        this.startTime = performance.now();
        
        const shot = this.shots[shotName];
        this.shotDuration = shot.duration;
    }

    /**
     * Update camera state (call every frame)
     */
    update(deltaTime) {
        if (!this.isTransitioning) return;
        
        this.shotProgress += deltaTime / this.shotDuration;
        
        if (this.shotProgress >= 1) {
            this.shotProgress = 1;
            this.isTransitioning = false;
            this.currentShot = this.targetShot;
            if (this.onComplete) this.onComplete();
            return;
        }
        
        const shot = this.shots[this.targetShot];
        if (!shot.keyframes) return;
        
        // Find current keyframe pair
        let kf1 = shot.keyframes[0];
        let kf2 = shot.keyframes[shot.keyframes.length - 1];
        
        for (let i = 0; i < shot.keyframes.length - 1; i++) {
            if (this.shotProgress >= shot.keyframes[i].time && this.shotProgress <= shot.keyframes[i + 1].time) {
                kf1 = shot.keyframes[i];
                kf2 = shot.keyframes[i + 1];
                break;
            }
        }
        
        // Interpolate between keyframes
        const kfDuration = kf2.time - kf1.time;
        const kfProgress = kfDuration > 0 ? (this.shotProgress - kf1.time) / kfDuration : 0;
        const eased = this.easeInOutCubic(kfProgress);
        
        this.camera.x = this.lerp(kf1.camera.x, kf2.camera.x, eased);
        this.camera.y = this.lerp(kf1.camera.y, kf2.camera.y, eased);
        this.camera.z = this.lerp(kf1.camera.z, kf2.camera.z, eased);
        this.camera.rotationX = this.lerp(kf1.camera.rotationX, kf2.camera.rotationX, eased);
        this.camera.rotationY = this.lerp(kf1.camera.rotationY, kf2.camera.rotationY, eased);
        this.camera.fov = this.lerp(kf1.camera.fov, kf2.camera.fov, eased);
        
        this.applyCSSTransform();
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    applyCSSTransform() {
        const app = document.getElementById('app');
        if (!app) return;
        
        const transform = `
            perspective(1200px)
            translate3d(${this.camera.x}px, ${this.camera.y}px, ${this.camera.z}px)
            rotateX(${this.camera.rotationX}deg)
            rotateY(${this.camera.rotationY}deg)
        `;
        
        app.style.transform = transform;
        app.style.transition = 'none';
    }

    applyCSS() {
        const style = document.createElement('style');
        style.textContent = `
            #app {
                transform-origin: center center;
                will-change: transform;
            }
            
            .cinematic-transition #app {
                transition: transform 0.1s linear;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Get current camera state for external use
     */
    getState() {
        return { ...this.camera };
    }
}
