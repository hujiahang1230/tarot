/**
 * Mobile Gestures Module
 * Handles touch gestures, gyroscope parallax, haptic feedback, and swipe-to-draw
 */

class MobileGestures {
    constructor(uiManager, audioSystem, particleSystem) {
        this.ui = uiManager;
        this.audio = audioSystem;
        this.particles = particleSystem;
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);

        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchCurrentX = 0;
        this.touchCurrentY = 0;
        this.isDragging = false;
        this.draggedCard = null;
        this.gyroscopeSupported = false;
        this.gyroscopePermissionGranted = false;

        if (this.isMobile) {
            this.init();
        }
    }

    init() {
        this.bindSwipeToDraw();
        this.bindGestureFlip();
        this.bindGyroscopeParallax();
        this.bindTouchFeedback();
        this.addMobileStyles();
    }

    /**
     * Trigger haptic feedback
     */
    haptic(pattern = 'light') {
        if (!navigator.vibrate) return;

        const patterns = {
            light: 10,
            medium: 20,
            heavy: 30,
            success: [30, 50, 30],
            error: [50, 30, 50],
            flip: [15, 10, 15],
            draw: [25],
            shuffle: [10, 20, 10, 20, 10]
        };

        navigator.vibrate(patterns[pattern] || patterns.light);
    }

    /**
     * Bind swipe-to-draw on card table
     */
    bindSwipeToDraw() {
        const cardTable = document.querySelector('.card-table');
        if (!cardTable) return;

        cardTable.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isDragging = true;

            this.haptic('light');
        }, { passive: true });

        cardTable.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;

            this.touchCurrentX = e.touches[0].clientX;
            this.touchCurrentY = e.touches[0].clientY;

            const deltaX = this.touchCurrentX - this.touchStartX;
            const deltaY = this.touchCurrentY - this.touchStartY;

            // Visual feedback during swipe
            const slots = cardTable.querySelectorAll('.card-slot');
            slots.forEach(slot => {
                const rect = slot.getBoundingClientRect();
                const slotCenterX = rect.left + rect.width / 2;
                const distance = Math.abs(this.touchCurrentX - slotCenterX);

                if (distance < 100) {
                    const intensity = 1 - distance / 100;
                    slot.style.transform = `scale(${1 + intensity * 0.1})`;
                    slot.style.borderColor = `rgba(212, 168, 67, ${0.3 + intensity * 0.7})`;
                }
            });
        }, { passive: true });

        cardTable.addEventListener('touchend', (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;

            const deltaX = this.touchCurrentX - this.touchStartX;
            const deltaY = this.touchCurrentY - this.touchStartY;
            const swipeDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Reset slot styles
            const slots = cardTable.querySelectorAll('.card-slot');
            slots.forEach(slot => {
                slot.style.transform = '';
                slot.style.borderColor = '';
            });

            // Trigger draw if swipe distance is sufficient
            if (swipeDistance > 80) {
                this.haptic('draw');
                this.ui.startDivination();

                // Particle burst at swipe end
                this.particles.createBurst(
                    this.touchCurrentX,
                    this.touchCurrentY,
                    30
                );
            }
        }, { passive: true });
    }

    /**
     * Bind gesture flip for tarot cards
     */
    bindGestureFlip() {
        document.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.tarot-card:not(.flipped)');
            if (!card) return;

            this.draggedCard = card;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;

            this.haptic('light');
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this.draggedCard) return;

            this.touchCurrentX = e.touches[0].clientX;
            this.touchCurrentY = e.touches[0].clientY;

            const deltaX = this.touchCurrentX - this.touchStartX;
            const deltaY = this.touchCurrentY - this.touchStartY;

            // Calculate rotation based on swipe direction
            const rotateY = Math.min(Math.max(deltaX * 0.5, -90), 90);
            const rotateX = Math.min(Math.max(-deltaY * 0.3, -45), 45);

            const inner = this.draggedCard.querySelector('.tarot-card-inner');
            if (inner) {
                inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                inner.style.transition = 'none';
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!this.draggedCard) return;

            const deltaX = this.touchCurrentX - this.touchStartX;
            const inner = this.draggedCard.querySelector('.tarot-card-inner');

            if (inner) {
                inner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            }

            // Flip if swipe distance is sufficient
            if (Math.abs(deltaX) > 60) {
                this.draggedCard.classList.add('flipped');
                this.haptic('flip');
                this.audio.play('cardFlip');

                // Particle burst on flip
                const rect = this.draggedCard.getBoundingClientRect();
                this.particles.createBurst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    25
                );

                // Check if all cards are flipped
                const allCards = document.querySelectorAll('.tarot-card');
                const flippedCards = document.querySelectorAll('.tarot-card.flipped');
                if (allCards.length > 0 && allCards.length === flippedCards.length) {
                    setTimeout(() => {
                        this.ui.revealCards();
                    }, 800);
                }
            } else {
                // Reset position
                if (inner) {
                    inner.style.transform = '';
                }
            }

            this.draggedCard = null;
        }, { passive: true });
    }

    /**
     * Bind gyroscope parallax effect
     */
    bindGyroscopeParallax() {
        if (!window.DeviceOrientationEvent) return;

        const requestGyroscope = () => {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            this.gyroscopePermissionGranted = true;
                            this.enableGyroscope();
                        }
                    })
                    .catch(console.error);
            } else {
                this.gyroscopePermissionGranted = true;
                this.enableGyroscope();
            }
        };

        // Request permission on first touch
        document.addEventListener('touchstart', () => {
            if (!this.gyroscopePermissionGranted && !this.gyroscopeSupported) {
                requestGyroscope();
            }
        }, { once: true });

        // Also try immediately for non-iOS devices
        if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
            this.enableGyroscope();
        }
    }

    /**
     * Enable gyroscope parallax
     */
    enableGyroscope() {
        window.addEventListener('deviceorientation', (e) => {
            if (e.alpha === null && e.beta === null && e.gamma === null) return;

            this.gyroscopeSupported = true;

            const beta = e.beta || 0;   // Front-to-back tilt (-180 to 180)
            const gamma = e.gamma || 0;  // Left-to-right tilt (-90 to 90)

            const moveX = gamma / 90;
            const moveY = (beta - 45) / 90;

            // Parallax for magic circle
            const magicCircle = document.querySelector('.magic-circle-container');
            if (magicCircle) {
                magicCircle.style.transform = `translate(${moveX * 20}px, ${moveY * 20}px)`;
            }

            // Parallax for hero text
            const heroText = document.querySelector('.hero-text');
            if (heroText) {
                heroText.style.transform = `translate(${moveX * 10}px, ${moveY * 10}px)`;
            }

            // Parallax for floating card
            const floatingCard = document.querySelector('.floating-card');
            if (floatingCard) {
                floatingCard.style.transform = `translate(calc(-50% + ${moveX * 30}px), calc(-50% + ${moveY * 30}px))`;
            }

            // Parallax for card slots
            const cardSlots = document.querySelectorAll('.card-slot');
            cardSlots.forEach((slot, index) => {
                const depth = 1 + index * 0.2;
                slot.style.transform = `translate(${moveX * 10 * depth}px, ${moveY * 10 * depth}px)`;
            });
        }, { passive: true });
    }

    /**
     * Bind touch feedback for buttons
     */
    bindTouchFeedback() {
        document.querySelectorAll('.btn-magic, .spread-btn, .filter-btn, .nav-btn, .gallery-item').forEach(el => {
            el.addEventListener('touchstart', () => {
                this.haptic('light');
                el.style.transform = 'scale(0.95)';
            }, { passive: true });

            el.addEventListener('touchend', () => {
                el.style.transform = '';
            }, { passive: true });

            el.addEventListener('touchcancel', () => {
                el.style.transform = '';
            }, { passive: true });
        });
    }

    /**
     * Add mobile-specific styles
     */
    addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tarot-card {
                touch-action: none;
                -webkit-tap-highlight-color: transparent;
            }

            .card-table {
                touch-action: none;
                -webkit-tap-highlight-color: transparent;
            }

            .card-slot {
                transition: transform 0.2s ease, border-color 0.2s ease;
            }

            .tarot-card-inner {
                will-change: transform;
            }

            @media (hover: none) and (pointer: coarse) {
                .tarot-card::after {
                    content: '👆 滑动翻牌';
                    position: absolute;
                    bottom: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    white-space: nowrap;
                    opacity: 0.7;
                }

                .card-table::before {
                    content: '← 滑动抽牌 →';
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 0.85rem;
                    color: var(--gold-primary);
                    opacity: 0.6;
                    animation: pulseScale 2s ease-in-out infinite;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
