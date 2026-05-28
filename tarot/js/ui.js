/**
 * UI Module - Enhanced
 * Handles all user interface interactions with advanced effects
 */

class UIManager {
    constructor(audioSystem, particleSystem, webglEffects = null) {
        this.audio = audioSystem;
        this.particles = particleSystem;
        this.webgl = webglEffects;
        this.currentPage = 'home';
        this.currentSpread = 'single';
        this.drawnCards = [];
        this.isShuffling = false;
        this.mousePos = { x: 0, y: 0 };
        this.currentUser = null;
        this.lastReadingId = null;
        this.companionData = null;

        this.init();
    }

    init() {
        this.bindNavigation();
        this.bindButtons();
        this.bindSpreadSelector();
        this.bindModal();
        this.bindAudioControls();
        this.bindHistory();
        this.bindParallax();
        this.bindCardTilt();
        this.bindAuth();
        this.bindRanking();
        this.bindAchievements();
        this.bindMoodRating();
        this.bindQuestionInput();
        this.renderGallery();
        this.renderHistory();
        this.updateAudioUI();
        this.initCinematicEffects();
        this.renderGuestCompanionDashboard();
        this.checkAuthStatus();
    }

    /**
     * Bind question input events
     */
    bindQuestionInput() {
        const input = document.getElementById('question-input');
        const counter = document.getElementById('question-count');

        if (input) {
            input.addEventListener('input', () => {
                counter.textContent = input.value.length;
            });
        }

        // Example question buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (input) {
                    input.value = btn.dataset.question;
                    counter.textContent = input.value.length;
                    input.focus();
                }
                this.audio.play('click');
            });
        });
    }

    /**
     * Get user question
     */
    getUserQuestion() {
        const input = document.getElementById('question-input');
        return input ? input.value.trim() : '';
    }

    /**
     * Initialize cinematic visual effects
     */
    initCinematicEffects() {
        // Add vignette overlay
        const vignette = document.createElement('div');
        vignette.className = 'vignette-overlay';
        document.body.appendChild(vignette);

        // Add scan line
        const scanLine = document.createElement('div');
        scanLine.className = 'cinematic-scan';
        document.body.appendChild(scanLine);

        // Add custom cursor (desktop only)
        const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isDesktop) {
            const cursor = document.createElement('div');
            cursor.id = 'custom-cursor';
            cursor.classList.add('visible');
            document.body.appendChild(cursor);

            const cursorDot = document.createElement('div');
            cursorDot.id = 'cursor-dot';
            document.body.appendChild(cursorDot);

            // Cursor tracking
            document.addEventListener('mousemove', (e) => {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
                cursorDot.style.left = `${e.clientX}px`;
                cursorDot.style.top = `${e.clientY}px`;
            });

            // Cursor hover effect
            document.querySelectorAll('button, .tarot-card, .gallery-item, a, input').forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });
        }
    }

    /**
     * Bind parallax effect to mouse movement
     */
    bindParallax() {
        const heroSection = document.querySelector('.hero-section');
        const magicCircle = document.querySelector('.magic-circle-container');
        const heroText = document.querySelector('.hero-text');

        document.addEventListener('mousemove', (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const moveX = (e.clientX - centerX) / centerX;
            const moveY = (e.clientY - centerY) / centerY;

            // Parallax for magic circle
            if (magicCircle) {
                magicCircle.style.transform = `translate(${moveX * 15}px, ${moveY * 15}px)`;
            }

            // Parallax for hero text
            if (heroText) {
                heroText.style.transform = `translate(${moveX * 8}px, ${moveY * 8}px)`;
            }

            // Parallax for floating card
            const floatingCard = document.querySelector('.floating-card');
            if (floatingCard) {
                floatingCard.style.transform = `translate(calc(-50% + ${moveX * 25}px), calc(-50% + ${moveY * 25}px))`;
            }

            this.mousePos = { x: e.clientX, y: e.clientY };
        });
    }

    /**
     * Bind 3D tilt effect to cards
     */
    bindCardTilt() {
        document.addEventListener('mousemove', (e) => {
            document.querySelectorAll('.tarot-card:not(.flipped)').forEach(card => {
                const rect = card.getBoundingClientRect();
                const cardCenterX = rect.left + rect.width / 2;
                const cardCenterY = rect.top + rect.height / 2;

                const distX = e.clientX - cardCenterX;
                const distY = e.clientY - cardCenterY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                // Only apply tilt when mouse is near card
                if (distance < 200) {
                    const intensity = 1 - distance / 200;
                    const rotateY = (distX / rect.width) * 15 * intensity;
                    const rotateX = -(distY / rect.height) * 15 * intensity;

                    card.querySelector('.tarot-card-inner').style.transform =
                        `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

                    // Add glow based on proximity
                    const glowIntensity = intensity * 0.5;
                    card.querySelector('.tarot-card-back').style.boxShadow =
                        `0 0 ${20 + glowIntensity * 30}px rgba(212, 168, 67, ${0.3 + glowIntensity * 0.4})`;
                } else {
                    card.querySelector('.tarot-card-inner').style.transform = '';
                    card.querySelector('.tarot-card-back').style.boxShadow = '';
                }
            });
        });
    }

    /**
     * Bind navigation buttons
     */
    bindNavigation() {
        // Pages that require login
        const loginRequiredPages = ['divination', 'chat', 'healing', 'mbti', 'cosmic-portrait'];
        
        document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                
                // Check if login is required for this page
                if (loginRequiredPages.includes(page) && !API.isLoggedIn()) {
                    const pageNames = {
                        'divination': '占卜',
                        'chat': '对话占卜',
                        'healing': '情绪疗愈',
                        'mbti': '人格探索',
                        'cosmic-portrait': '宇宙人格画像'
                    };
                    this.showMessage(`请先登录后再使用${pageNames[page] || '此功能'}`, 'warning');
                    setTimeout(() => this.showAuthModal(), 500);
                    return;
                }
                
                this.navigateTo(page);
            });
        });
    }

    /**
     * Navigate to page
     */
    navigateTo(page) {
        // Trigger transition effect
        const transitionOverlay = document.getElementById('transition-overlay');
        if (transitionOverlay) {
            transitionOverlay.className = 'transition-overlay active transition-fade';
            setTimeout(() => {
                transitionOverlay.className = 'transition-overlay';
            }, 1000);
        }

        // Trigger camera shot
        if (window.TarotApp && window.TarotApp.camera) {
            window.TarotApp.camera.triggerShot('menuClose');
        }

        setTimeout(() => {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

            const targetPage = document.getElementById(`page-${page}`);
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.classList.add('transitioning');
                setTimeout(() => targetPage.classList.remove('transitioning'), 800);
                this.currentPage = page;
            }

            document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.page === page);
            });

            // Trigger camera shot for new page
            if (window.TarotApp && window.TarotApp.camera) {
                setTimeout(() => {
                    window.TarotApp.camera.triggerShot('menuOpen');
                }, 500);
            }
        }, 400);

        this.audio.play('click');
    }

    /**
     * Bind action buttons
     */
    bindButtons() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRipple(e);
                this.createEnergyRipple(e);
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });

        document.getElementById('btn-draw').addEventListener('click', (e) => {
            this.createRipple(e);
            this.createEnergyRipple(e);
            this.startDivination();
        });

        document.getElementById('btn-reveal').addEventListener('click', (e) => {
            this.createRipple(e);
            this.createEnergyRipple(e);
            this.revealCards();
        });

        // Add hover sound and particle trail to all buttons
        document.querySelectorAll('.btn-magic, .nav-btn, .spread-btn, .filter-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.audio.play('hover');
            });
        });
    }

    /**
     * Handle button actions
     */
    handleAction(action) {
        switch (action) {
            case 'start-divination':
                if (!this.requireLogin('进行占卜')) return;
                this.navigateTo('divination');
                this.resetDivination();
                break;
            case 'daily-fortune':
                if (!this.requireLogin('进行每日占卜')) return;
                this.handleDailyFortune();
                break;
            case 'open-gallery':
                this.navigateTo('gallery');
                break;
            case 'show-auth':
                this.showAuthModal();
                break;
            case 'logout':
                this.handleLogout();
                break;
        }
    }

    /**
     * Handle daily fortune
     */
    handleDailyFortune() {
        if (!this.requireLogin('进行每日占卜')) return;
        
        const today = new Date().toDateString();
        const lastDivination = localStorage.getItem('tarot_last_divination');

        if (lastDivination === today) {
            this.showMessage('今日已占卜，请明天再来', 'warning');
            return;
        }

        this.navigateTo('divination');
        this.resetDivination();
        this.currentSpread = 'single';
        this.updateSpreadButtons();
    }

    /**
     * Bind spread selector
     */
    bindSpreadSelector() {
        document.querySelectorAll('.spread-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const spread = btn.dataset.spread;
                this.currentSpread = spread;
                this.updateSpreadButtons();
                this.resetDivination();
                this.audio.play('click');
            });
        });
    }

    /**
     * Update spread buttons UI
     */
    updateSpreadButtons() {
        document.querySelectorAll('.spread-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.spread === this.currentSpread);
        });
    }

    /**
     * Render card slots based on spread
     */
    renderCardSlots() {
        const config = SpreadConfig[this.currentSpread];
        const slotsContainer = document.getElementById('card-slots');
        slotsContainer.innerHTML = '';

        config.positions.forEach((position, index) => {
            const slot = document.createElement('div');
            slot.className = 'card-slot';
            slot.id = `slot-${index}`;
            slot.innerHTML = `<span class="card-slot-label">${position}</span>`;
            slotsContainer.appendChild(slot);
        });
    }

    /**
     * Start divination process
     */
    async startDivination() {
        if (!this.requireLogin('进行占卜')) return;
        if (this.isShuffling) return;

        if (this.currentSpread === 'single') {
            const today = new Date().toDateString();
            const lastDivination = localStorage.getItem('tarot_last_divination');
            if (lastDivination === today) {
                this.showMessage('今日已占卜，请明天再来', 'warning');
                return;
            }
        }

        this.isShuffling = true;
        this.audio.play('shuffle');

        // Haptic feedback for shuffle
        if (navigator.vibrate) {
            navigator.vibrate([10, 20, 10, 20, 10]);
        }

        const shufflingAnim = document.getElementById('shuffling-anim');
        shufflingAnim.classList.add('active');

        await this.delay(2000);

        shufflingAnim.classList.remove('active');

        const config = SpreadConfig[this.currentSpread];
        this.drawnCards = TarotData.getRandomCards(config.count).map(card => ({
            ...card,
            reversed: TarotData.isReversed()
        }));

        this.renderDrawnCards();

        // Trigger spread reveal camera
        if (window.TarotApp && window.TarotApp.camera) {
            window.TarotApp.camera.triggerShot('spreadReveal');
        }

        document.getElementById('btn-draw').style.display = 'none';
        document.getElementById('btn-reveal').style.display = '';

        this.isShuffling = false;
        this.audio.play('cardDraw');
    }

    /**
     * Render drawn cards to slots
     */
    renderDrawnCards() {
        this.drawnCards.forEach((card, index) => {
            const slot = document.getElementById(`slot-${index}`);
            if (!slot) return;

            slot.classList.add('has-card');

            const cardEl = this.createCardElement(card, index);
            slot.appendChild(cardEl);

            cardEl.style.setProperty('--fly-x', `${(Math.random() - 0.5) * 200}px`);
            cardEl.style.setProperty('--fly-y', `${(Math.random() - 0.5) * 200}px`);
            cardEl.style.setProperty('--fly-rotate', `${(Math.random() - 0.5) * 40}deg`);

            // Add orbiting particles to each card
            setTimeout(() => {
                const rect = cardEl.getBoundingClientRect();
                this.particles.createOrbitParticles(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    12,
                    70
                );
            }, 800);
        });

        const slotsContainer = document.getElementById('card-slots');
        slotsContainer.classList.add('has-cards');
        const rect = slotsContainer.getBoundingClientRect();
        this.particles.createBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            50
        );
    }

    /**
     * Create card DOM element
     */
    createCardElement(card, index) {
        const cardEl = document.createElement('div');
        cardEl.className = `tarot-card ${card.reversed ? 'reversed' : ''}`;
        cardEl.dataset.index = index;

        cardEl.innerHTML = `
            <div class="tarot-card-inner">
                <div class="tarot-card-back"></div>
                <div class="tarot-card-front">
                    <div class="card-image">${card.symbol}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-position ${card.reversed ? 'reversed' : ''}">
                        ${card.reversed ? '逆位' : '正位'}
                    </div>
                </div>
            </div>
        `;

        // Add hover particle effect
        cardEl.addEventListener('mouseenter', () => {
            const rect = cardEl.getBoundingClientRect();
            this.particles.createOrbitParticles(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                8,
                60
            );
        });

        return cardEl;
    }

    /**
     * Reveal all cards
     */
    async revealCards() {
        this.audio.play('reveal');

        // Trigger cinematic camera
        if (window.TarotApp && window.TarotApp.camera) {
            window.TarotApp.camera.triggerShot('cardReveal');
        }

        const cards = document.querySelectorAll('.tarot-card');

        for (let i = 0; i < cards.length; i++) {
            await this.delay(500);
            cards[i].classList.add('flipped');
            this.audio.play('cardFlip');

            // Haptic feedback on mobile
            if (navigator.vibrate) {
                navigator.vibrate([15, 10, 15]);
            }

            const rect = cards[i].getBoundingClientRect();
            this.particles.createBurst(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                30
            );
        }

        await this.delay(1000);

        this.showReadingResult();
        this.saveToHistory();

        if (this.currentSpread === 'single') {
            localStorage.setItem('tarot_last_divination', new Date().toDateString());
        }

        document.getElementById('btn-reveal').style.display = 'none';
    }

    /**
     * Show reading result with AI-style interpretation
     */
    showReadingResult() {
        const resultContainer = document.getElementById('reading-result');
        const contentContainer = document.getElementById('result-content');
        const questionDisplay = document.getElementById('ai-reading-question');
        contentContainer.innerHTML = '';

        // Trigger dramatic camera zoom
        if (window.TarotApp && window.TarotApp.camera) {
            window.TarotApp.camera.triggerShot('dramaticZoom');
        }

        const question = this.getUserQuestion();
        const cardData = this.drawnCards.map(card => ({
            card: card,
            reversed: card.reversed
        }));

        // Generate AI interpretation based on question
        let aiResult;
        if (question) {
            aiResult = AIInterpreter.generateQuestionReading(question, cardData, this.currentSpread);
        } else {
            // Fallback to original AI reader if no question
            if (this.currentSpread === 'single') {
                const reading = AIReader.generateReading(cardData[0].card, cardData[0].reversed, 'single');
                aiResult = {
                    intro: '',
                    readings: [reading],
                    synthesis: '',
                    closing: '',
                    fullText: reading.content,
                    question: '',
                    analysis: null
                };
            } else {
                aiResult = AIReader.generateMultiReading(cardData, this.currentSpread);
                aiResult.question = '';
                aiResult.analysis = null;
            }
        }

        // Display question if provided
        if (question && aiResult.analysis) {
            const theme = AIInterpreter.questionThemes[aiResult.analysis.theme];
            questionDisplay.innerHTML = `
                <p>"${question}"</p>
                <span class="theme-badge">${theme.icon} ${theme.label}</span>
            `;
            questionDisplay.style.display = 'block';
        } else {
            questionDisplay.style.display = 'none';
        }

        const personalizedNote = CompanionProfile.buildReadingCompanionNote(this.companionData, question);
        const readingHTML = this.createAIReadingHTML(aiResult, personalizedNote);
        contentContainer.innerHTML = readingHTML;

        resultContainer.style.display = 'block';

        // Show mood rating if logged in
        if (API.isLoggedIn()) {
            document.getElementById('mood-rating').style.display = 'block';
        }

        resultContainer.scrollIntoView({ behavior: 'smooth' });

        this.audio.play('success');

        const rect = resultContainer.getBoundingClientRect();
        this.particles.createBurst(
            rect.left + rect.width / 2,
            rect.top + 50,
            40
        );

        // Trigger WebGL effects for special cards
        this.triggerSpecialCardEffects();
    }

    /**
     * Trigger special WebGL effects for rare cards
     */
    triggerSpecialCardEffects() {
        const specialCards = [10, 13, 16, 21]; // 命运之轮, 死神, 塔, 世界

        this.drawnCards.forEach(card => {
            if (specialCards.includes(card.id)) {
                // Create massive particle burst
                const rect = document.getElementById('reading-result').getBoundingClientRect();
                this.particles.createBurst(
                    rect.left + rect.width / 2,
                    rect.top + 100,
                    80
                );

                // Trigger WebGL ripple
                if (this.webgl) {
                    this.webgl.createBurst(rect.left + rect.width / 2, rect.top + 100, 50);
                }

                // Show special message
                const messages = {
                    10: '命运之轮已转动！你的命运正在改变...',
                    13: '死神降临！转变即将发生...',
                    16: '塔之觉醒！旧的去，新的来...',
                    21: '世界圆满！一个周期的完成...'
                };

                setTimeout(() => {
                    this.showMessage(messages[card.id], 'success');
                }, 1000);
            }
        });
    }

    /**
     * Create AI-style reading HTML with mystical formatting
     */
    createAIReadingHTML(aiResult, personalizedNote = '') {
        let html = '';

        if (personalizedNote) {
            html += `<div class="ai-reading-section ai-theme-opening">${this.formatAIText(personalizedNote)}</div>`;
        }

        // Opening (from AIInterpreter or AIReader)
        if (aiResult.opening) {
            html += `<div class="ai-reading-section ai-intro">${this.formatAIText(aiResult.opening)}</div>`;
        } else if (aiResult.intro) {
            html += `<div class="ai-reading-section ai-intro">${this.formatAIText(aiResult.intro)}</div>`;
        }

        // Theme opening (AIInterpreter specific)
        if (aiResult.themeOpening) {
            html += `<div class="ai-reading-section ai-theme-opening">${this.formatAIText(aiResult.themeOpening)}</div>`;
        }

        // Individual card readings
        const readings = aiResult.readings || aiResult.cardInterpretations || [];
        readings.forEach((reading, index) => {
            const content = reading.content || this.formatCardReadingContent(reading);
            html += `
                <div class="ai-reading-section ai-card-reading stagger-${index + 1}">
                    <div class="ai-reading-header">
                        <span class="ai-card-symbol">${reading.card.symbol}</span>
                        <h3 class="ai-reading-title">${reading.title || `${reading.card.name} ${reading.orientation}`}</h3>
                    </div>
                    <div class="ai-reading-body">
                        ${this.formatAIText(content)}
                    </div>
                </div>
            `;
        });

        // Synthesis for multi-card
        if (aiResult.synthesis) {
            html += `
                <div class="ai-reading-section ai-synthesis">
                    <div class="ai-reading-header">
                        <span class="ai-card-symbol">&#10024;</span>
                        <h3 class="ai-reading-title">宇宙的综合讯息</h3>
                    </div>
                    <div class="ai-reading-body">
                        ${this.formatAIText(aiResult.synthesis)}
                    </div>
                </div>
            `;
        }

        // Closing
        if (aiResult.closing) {
            html += `<div class="ai-reading-section ai-closing">${this.formatAIText(aiResult.closing)}</div>`;
        }

        return html;
    }

    /**
     * Format card reading content for AIReader format
     */
    formatCardReadingContent(reading) {
        let text = '';
        if (reading.card) {
            text += `【${reading.card.name} ${reading.orientation || ''}】\n\n`;
        }
        if (reading.meaning) {
            text += `${reading.meaning}\n\n`;
        }
        if (reading.love) text += `❤ 爱情：${reading.love}\n\n`;
        if (reading.career) text += `💼 事业：${reading.career}\n\n`;
        if (reading.wealth) text += `💰 财运：${reading.wealth}\n\n`;
        if (reading.health) text += `🌿 健康：${reading.health}\n\n`;
        if (reading.advice) text += `📜 建议：${reading.advice}\n\n`;
        if (reading.luckyColor) text += `幸运颜色：${reading.luckyColor}  幸运数字：${reading.luckyNumber}`;
        return text;
    }

    /**
     * Format AI text with proper paragraph breaks and styling
     */
    formatAIText(text) {
        return text
            .split('\n\n')
            .filter(p => p.trim())
            .map(p => {
                if (p.startsWith('【') && p.endsWith('】')) {
                    return `<h4 class="ai-section-heading">${p.replace(/【|】/g, '')}</h4>`;
                }
                return `<p class="ai-paragraph">${p.trim()}</p>`;
            })
            .join('');
    }

    /**
     * Render gallery
     */
    renderGallery() {
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '';

        TarotData.cards.forEach((card, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.id = card.id;
            item.style.animationDelay = `${index * 0.05}s`;

            item.innerHTML = `
                <div class="gallery-card-icon">${card.symbol}</div>
                <h4>${card.name}</h4>
                <p>${card.nameEn}</p>
            `;

            item.addEventListener('click', () => {
                this.showCardModal(card);
                this.audio.play('click');

                // Particle effect on click
                const rect = item.getBoundingClientRect();
                this.particles.createBurst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    20
                );
            });

            item.addEventListener('mouseenter', () => {
                const rect = item.getBoundingClientRect();
                this.particles.createOrbitParticles(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    6,
                    50
                );
            });

            grid.appendChild(item);
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterGallery(btn.dataset.filter);
            });
        });
    }

    /**
     * Filter gallery
     */
    filterGallery(filter) {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            item.style.display = filter === 'all' ? '' : '';
        });
    }

    /**
     * Show card modal with AI-style reading
     */
    showCardModal(card) {
        const modal = document.getElementById('card-modal');
        const display = document.getElementById('modal-card-display');
        const info = document.getElementById('modal-card-info');

        display.innerHTML = `
            <div class="tarot-card flipped">
                <div class="tarot-card-inner">
                    <div class="tarot-card-front">
                        <div class="card-image">${card.symbol}</div>
                        <div class="card-name">${card.name}</div>
                        <div class="card-position">大阿卡纳</div>
                    </div>
                </div>
            </div>
        `;

        // Generate AI reading for the card (upright)
        const aiReading = AIReader.generateReading(card, false, 'single');

        info.innerHTML = `
            <h3>${card.name} - ${card.nameEn}</h3>
            <div class="ai-reading-body">
                ${this.formatAIText(aiReading.content)}
            </div>
        `;

        modal.classList.add('active');
    }

    /**
     * Bind modal events
     */
    bindModal() {
        const modal = document.getElementById('card-modal');
        const closeBtn = document.getElementById('modal-close');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            this.audio.play('click');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.classList.remove('active');
        });
    }

    /**
     * Bind audio controls
     */
    bindAudioControls() {
        const toggleBtn = document.getElementById('audio-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeControl = document.getElementById('volume-control');

        toggleBtn.addEventListener('click', () => {
            const enabled = this.audio.toggle();
            this.updateAudioUI();
            volumeControl.classList.add('active');
            setTimeout(() => volumeControl.classList.remove('active'), 3000);
        });

        volumeSlider.addEventListener('input', () => {
            this.audio.setVolume(volumeSlider.value / 100);
        });

        toggleBtn.addEventListener('mouseenter', () => {
            volumeControl.classList.add('active');
        });

        volumeControl.addEventListener('mouseleave', () => {
            volumeControl.classList.remove('active');
        });
    }

    /**
     * Update audio UI
     */
    updateAudioUI() {
        const toggleBtn = document.getElementById('audio-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        const state = this.audio.getState();

        toggleBtn.style.opacity = state.enabled ? '1' : '0.5';
        volumeSlider.value = state.volume * 100;
    }

    /**
     * Bind history
     */
    bindHistory() {
        document.getElementById('btn-clear-history').addEventListener('click', () => {
            if (confirm('确定要清空所有历史记录吗？')) {
                localStorage.removeItem('tarot_history');
                this.renderHistory();
                this.audio.play('click');
            }
        });
    }

    /**
     * Save reading to history (both local and server)
     */
    async saveToHistory() {
        const record = {
            date: new Date().toISOString(),
            spread: this.currentSpread,
            cards: this.drawnCards.map(card => ({
                id: card.id,
                name: card.name,
                symbol: card.symbol,
                reversed: card.reversed
            }))
        };

        // Save to localStorage (fallback)
        const history = this.getHistory();
        history.unshift(record);
        if (history.length > 10) history.length = 10;
        localStorage.setItem('tarot_history', JSON.stringify(history));

        // Save to server if logged in
        if (API.isLoggedIn()) {
            try {
                const question = this.getUserQuestion();
                const cardData = this.drawnCards.map(card => ({ card, reversed: card.reversed }));

                let aiText;
                if (question) {
                    const aiResult = AIInterpreter.generateQuestionReading(question, cardData, this.currentSpread);
                    aiText = aiResult.fullText;
                } else {
                    const aiResult = this.currentSpread === 'single'
                        ? AIReader.generateReading(this.drawnCards[0], this.drawnCards[0].reversed, 'single')
                        : AIReader.generateMultiReading(cardData, this.currentSpread);
                    aiText = aiResult.fullText || aiResult.readings[0].content;
                }

                const response = await API.history.save({
                    spread_type: this.currentSpread,
                    cards: record.cards,
                    ai_reading: aiText,
                    question: question,
                    source_page: this.currentPage,
                    profile_snapshot: CompanionProfile.createProfileSnapshot(this.companionData)
                });

                this.lastReadingId = response.reading_id;

                // Update user stats
                if (this.currentUser) {
                    this.currentUser.total_readings = (this.currentUser.total_readings || 0) + 1;
                    this.currentUser.streak_days = response.streak_days;
                    this.updateUserUI();
                }

                await API.companion.saveInsight({
                    insight_type: 'tarot_reading',
                    source: this.currentPage,
                    headline: `${SpreadConfig[this.currentSpread]?.name || this.currentSpread} 占卜记录`,
                    content: aiText,
                    meta: {
                        question,
                        spread_type: this.currentSpread,
                        cards: record.cards
                    }
                });

                await this.refreshCompanionData();

                // Check achievements
                try {
                    const achievements = await API.achievements.check();
                    if (achievements.count > 0) {
                        achievements.unlocked.forEach(a => {
                            setTimeout(() => {
                                this.showMessage(`成就解锁：${a.icon} ${a.name}！`, 'success');
                            }, 1500);
                        });
                    }
                } catch (e) {
                    console.error('Achievement check failed:', e);
                }
            } catch (error) {
                console.error('Failed to save to server:', error);
            }
        }

        this.renderHistory();
    }

    /**
     * Reset divination state
     */
    resetDivination() {
        this.drawnCards = [];
        this.isShuffling = false;

        document.getElementById('card-slots').innerHTML = '';
        document.getElementById('reading-result').style.display = 'none';
        document.getElementById('btn-draw').style.display = '';
        document.getElementById('btn-reveal').style.display = 'none';
        document.getElementById('shuffling-anim').classList.remove('active');

        this.renderCardSlots();
    }

    /**
     * Get history from storage
     */
    getHistory() {
        const data = localStorage.getItem('tarot_history');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Render history list
     */
    renderHistory() {
        const list = document.getElementById('history-list');
        const history = this.getHistory();

        if (history.length === 0) {
            list.innerHTML = '<p class="text-muted" style="text-align: center; color: var(--text-muted);">暂无占卜记录</p>';
            return;
        }

        list.innerHTML = history.map((record, index) => {
            const date = new Date(record.date);
            const dateStr = date.toLocaleDateString('zh-CN', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            const spreadName = SpreadConfig[record.spread]?.name || record.spread;
            const mainCard = record.cards[0];

            return `
                <div class="history-item" style="animation-delay: ${index * 0.1}s">
                    <div class="history-card">${mainCard.symbol}</div>
                    <div class="history-info">
                        <h4>${spreadName} - ${mainCard.name} ${mainCard.reversed ? '(逆位)' : '(正位)'}</h4>
                        <p>${record.cards.map(c => `${c.name}${c.reversed ? '逆' : '正'}`).join(' | ')}</p>
                        <div class="history-date">${dateStr}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Create ripple effect
     */
    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Create energy ripple effect (outer ring)
     */
    createEnergyRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        ripple.className = 'energy-ripple';

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
    }

    /**
     * Show message toast
     */
    showMessage(message, type = 'info') {
        const existing = document.querySelector('.toast-message');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = message;

        toast.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            border: 1px solid ${type === 'warning' ? '#ff6b6b' : 'var(--gold-primary)'};
            color: var(--text-primary);
            padding: 1rem 2rem;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            z-index: 9999;
            animation: fadeInDown 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Check authentication status on load
     */
    async checkAuthStatus() {
        if (API.isLoggedIn()) {
            try {
                const data = await API.auth.getProfile();
                this.currentUser = data.user;
                this.updateUserUI();
                await this.refreshCompanionData();
            } catch (error) {
                API.logout();
                this.renderGuestCompanionDashboard();
            }
        } else {
            this.renderGuestCompanionDashboard();
        }
    }

    /**
     * Update user UI with profile data
     */
    updateUserUI() {
        if (!this.currentUser) return;

        const userBar = document.getElementById('user-bar');
        const authBtn = document.getElementById('auth-btn');

        userBar.style.display = 'flex';
        authBtn.textContent = '退出';
        authBtn.dataset.action = 'logout';

        document.getElementById('user-name').textContent = this.currentUser.username;
        document.getElementById('user-avatar').textContent = this.currentUser.avatar || '🔮';
        document.getElementById('user-title').textContent = `Lv.${this.currentUser.level} ${this.currentUser.title}`;

        const expPercent = (this.currentUser.exp / (this.currentUser.level * 200)) * 100;
        document.getElementById('exp-fill').style.width = `${expPercent}%`;

        document.getElementById('stat-readings').textContent = this.currentUser.total_readings;
        document.getElementById('stat-streak').textContent = this.currentUser.streak_days;

        if (this.companionData) {
            this.renderCompanionDashboard();
        }
    }

    async refreshCompanionData() {
        if (!API.isLoggedIn()) {
            this.companionData = null;
            this.renderGuestCompanionDashboard();
            return;
        }

        try {
            this.companionData = await API.companion.getProfile();
            this.renderCompanionDashboard();
            this.applyEmotionScene(this.companionData.emotion_scene);
            document.dispatchEvent(new CustomEvent('companion-profile-updated', { detail: this.companionData }));
        } catch (error) {
            console.error('Failed to load companion data:', error);
        }
    }

    renderGuestCompanionDashboard() {
        const root = document.getElementById('companion-dashboard-root');
        if (!root) return;
        root.innerHTML = `
            <div class="companion-dashboard">
                <section class="companion-card profile-card">
                    <div class="card-kicker">长期陪伴系统</div>
                    <h3 class="card-title">让宇宙记住你</h3>
                    <p class="card-copy">登录后会保存你的 MBTI、星座、情绪变化、测试历史和 AI 分析。下次回来时，网站会带着这些记忆继续陪你说话。</p>
                </section>
                <section class="companion-card daily-card">
                    <div class="card-kicker">每日宇宙消息</div>
                    <h3 class="card-title">温柔文案与深夜低语</h3>
                    <p class="daily-line">每天都会生成新的温柔文案、今日建议、情绪提醒和深夜低语，并让星空颜色、粒子速度和音乐跟着你的情绪变化。</p>
                </section>
            </div>
        `;
    }

    renderCompanionDashboard() {
        const root = document.getElementById('companion-dashboard-root');
        if (!root || !this.companionData) return;
        root.innerHTML = CompanionProfile.renderHomeDashboard(this.companionData, this.currentUser?.username || '旅人');
        this.bindEmotionDashboard();
    }

    bindEmotionDashboard() {
        document.querySelectorAll('#companion-dashboard-root .emotion-chip').forEach((button) => {
            button.addEventListener('click', async () => {
                if (!API.isLoggedIn()) return;
                const emotionKey = button.dataset.emotion;
                const option = CompanionProfile.emotionOptions.find((item) => item.key === emotionKey);
                try {
                    const response = await API.companion.saveEmotion({
                        emotion_key: emotionKey,
                        emotion_label: option?.label,
                        source: 'dashboard'
                    });

                    if (this.companionData?.profile) {
                        this.companionData.profile.current_emotion = response.emotion.emotion_key;
                        this.companionData.profile.current_emotion_label = response.emotion.emotion_label;
                        this.companionData.profile.emotion_intensity = response.emotion.intensity;
                        this.companionData.profile.anxiety_level = response.emotion.anxiety_level;
                    }

                    this.companionData.growth_archive = response.growth_archive;
                    this.companionData.emotion_scene = response.emotion_scene;
                    this.renderCompanionDashboard();
                    this.applyEmotionScene(response.emotion_scene);
                    this.showMessage(`已记录你此刻的${response.emotion.emotion_label}`, 'success');
                } catch (error) {
                    this.showMessage('记录情绪失败', 'error');
                }
            });
        });
    }

    applyEmotionScene(scene) {
        if (!scene) return;
        if (this.particles?.setEmotionTheme) {
            this.particles.setEmotionTheme(scene);
        }
        if (this.audio?.setEmotionSoundscape) {
            this.audio.setEmotionSoundscape(scene.music);
        }
    }

    /**
     * Bind authentication events
     */
    bindAuth() {
        // Auth modal
        const authModal = document.getElementById('auth-modal');
        const authClose = document.getElementById('auth-modal-close');

        authClose.addEventListener('click', () => {
            authModal.classList.remove('active');
        });

        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) authModal.classList.remove('active');
        });

        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
            });
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const data = await API.auth.login(username, password);
                API.setToken(data.token);
                this.currentUser = data.user;
                this.updateUserUI();
                await this.refreshCompanionData();
                authModal.classList.remove('active');
                this.showMessage('登录成功！', 'success');
                this.audio.play('success');
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                const data = await API.auth.register(username, email, password);
                API.setToken(data.token);
                this.currentUser = data.user;
                this.updateUserUI();
                await this.refreshCompanionData();
                authModal.classList.remove('active');
                this.showMessage('注册成功！欢迎来到神秘塔罗', 'success');
                this.audio.play('success');
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });
    }

    /**
     * Check if user is logged in, show auth modal if not
     * @param {string} action - The action being attempted
     * @returns {boolean} - Whether user is logged in
     */
    requireLogin(action = '此功能') {
        if (!API.isLoggedIn()) {
            this.showMessage(`请先登录后再${action}`, 'warning');
            setTimeout(() => this.showAuthModal(), 500);
            return false;
        }
        return true;
    }

    /**
     * Handle logout
     */
    handleLogout() {
        API.logout();
        this.currentUser = null;
        this.companionData = null;

        if (this.audio?.stopEmotionSoundscape) {
            this.audio.stopEmotionSoundscape();
        }
        if (this.particles?.setEmotionTheme) {
            this.particles.setEmotionTheme({
                palette: ['#1a1030', '#0f0f25', '#0a0a1a'],
                particleSpeed: 0.7,
                glow: 'classic-cosmic',
                nebula: ['rgba(123, 79, 191, 0.04)', 'rgba(26, 35, 126, 0.05)']
            });
        }
        this.renderGuestCompanionDashboard();
        document.dispatchEvent(new CustomEvent('companion-profile-updated', { detail: null }));

        document.getElementById('user-bar').style.display = 'none';
        const authBtn = document.getElementById('auth-btn');
        authBtn.textContent = '登录';
        authBtn.dataset.action = 'show-auth';

        this.showMessage('已退出登录', 'info');
    }

    /**
     * Show auth modal
     */
    showAuthModal() {
        document.getElementById('auth-modal').classList.add('active');
    }

    /**
     * Bind ranking events
     */
    bindRanking() {
        document.querySelectorAll('.ranking-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadRanking(tab.dataset.tab);
            });
        });

        // Load daily ranking by default when page is shown
        const rankingPage = document.getElementById('page-ranking');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    this.loadRanking('daily');
                }
            });
        });
        observer.observe(rankingPage, { attributes: true, attributeFilter: ['class'] });
    }

    /**
     * Load ranking data
     */
    async loadRanking(type) {
        const content = document.getElementById('ranking-content');
        content.innerHTML = '<p class="text-muted" style="text-align: center;">加载中...</p>';

        try {
            let data;
            switch (type) {
                case 'daily':
                    data = await API.ranking.getDaily();
                    this.renderDailyRanking(data);
                    break;
                case 'weekly':
                    data = await API.ranking.getWeekly();
                    this.renderWeeklyRanking(data);
                    break;
                case 'alltime':
                    data = await API.ranking.getAlltime();
                    this.renderAlltimeRanking(data);
                    break;
            }
        } catch (error) {
            content.innerHTML = '<p class="text-muted" style="text-align: center;">暂无数据</p>';
        }
    }

    /**
     * Render daily ranking
     */
    renderDailyRanking(data) {
        const content = document.getElementById('ranking-content');

        if (!data.rankings || data.rankings.length === 0) {
            content.innerHTML = '<p class="text-muted" style="text-align: center;">今日暂无排名，完成占卜即可上榜！</p>';
            return;
        }

        let html = '<div class="ranking-list">';
        data.rankings.forEach((item, index) => {
            const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
            const medals = ['🥇', '🥈', '🥉'];
            const rankDisplay = index < 3 ? medals[index] : `#${item.rank}`;

            html += `
                <div class="ranking-item ${rankClass}">
                    <div class="ranking-rank">${rankDisplay}</div>
                    <div class="ranking-user">
                        <span class="ranking-avatar">${item.avatar || '🔮'}</span>
                        <div>
                            <div class="ranking-name">${item.username}</div>
                            <div class="ranking-title">${item.title} · Lv.${item.level}</div>
                        </div>
                    </div>
                    <span class="ranking-card">${item.is_reversed ? '🔄' : ''} ${this.getCardSymbol(item.card_drawn)}</span>
                    <div class="ranking-score">
                        <div class="ranking-score-value">${item.fortune_score}</div>
                        <div class="ranking-score-label">运势分</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        content.innerHTML = html;
    }

    /**
     * Render weekly ranking
     */
    renderWeeklyRanking(data) {
        const content = document.getElementById('ranking-content');

        if (!data.rankings || data.rankings.length === 0) {
            content.innerHTML = '<p class="text-muted" style="text-align: center;">本周暂无排名</p>';
            return;
        }

        let html = '<div class="ranking-list">';
        data.rankings.forEach((item, index) => {
            const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
            const medals = ['🥇', '🥈', '🥉'];
            const rankDisplay = index < 3 ? medals[index] : `#${index + 1}`;

            html += `
                <div class="ranking-item ${rankClass}">
                    <div class="ranking-rank">${rankDisplay}</div>
                    <div class="ranking-user">
                        <span class="ranking-avatar">${item.avatar || '🔮'}</span>
                        <div>
                            <div class="ranking-name">${item.username}</div>
                            <div class="ranking-title">${item.title} · ${item.readings_count}次占卜</div>
                        </div>
                    </div>
                    <div class="ranking-score">
                        <div class="ranking-score-value">${parseFloat(item.avg_score).toFixed(1)}</div>
                        <div class="ranking-score-label">平均分</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        content.innerHTML = html;
    }

    /**
     * Render alltime ranking
     */
    renderAlltimeRanking(data) {
        const content = document.getElementById('ranking-content');

        if (!data.rankings || data.rankings.length === 0) {
            content.innerHTML = '<p class="text-muted" style="text-align: center;">暂无数据</p>';
            return;
        }

        let html = '<div class="ranking-list">';
        data.rankings.forEach((item, index) => {
            const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
            const medals = ['🥇', '🥈', '🥉'];
            const rankDisplay = index < 3 ? medals[index] : `#${index + 1}`;

            html += `
                <div class="ranking-item ${rankClass}">
                    <div class="ranking-rank">${rankDisplay}</div>
                    <div class="ranking-user">
                        <span class="ranking-avatar">${item.avatar || '🔮'}</span>
                        <div>
                            <div class="ranking-name">${item.username}</div>
                            <div class="ranking-title">${item.title} · Lv.${item.level} · ${item.total_readings}次占卜</div>
                        </div>
                    </div>
                    <div class="ranking-score">
                        <div class="ranking-score-value">🔥 ${item.streak_days}</div>
                        <div class="ranking-score-label">连续天数</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        content.innerHTML = html;
    }

    /**
     * Get card symbol by name
     */
    getCardSymbol(name) {
        const card = TarotData.cards.find(c => c.name === name);
        return card ? card.symbol : '🃏';
    }

    /**
     * Bind achievements events
     */
    bindAchievements() {
        const achievementsPage = document.getElementById('page-achievements');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    this.loadAchievements();
                }
            });
        });
        observer.observe(achievementsPage, { attributes: true, attributeFilter: ['class'] });
    }

    /**
     * Load achievements
     */
    async loadAchievements() {
        if (!API.isLoggedIn()) {
            document.getElementById('achievements-grid').innerHTML =
                '<p class="text-muted" style="text-align: center; grid-column: 1/-1;">登录后查看成就</p>';
            return;
        }

        try {
            // Check for new achievements
            await API.achievements.check();

            // Load achievements and stats
            const [achievementsData, statsData] = await Promise.all([
                API.achievements.getList(),
                API.achievements.getStats()
            ]);

            this.renderAchievementsStats(statsData.stats);
            this.renderAchievementsGrid(achievementsData.achievements);
        } catch (error) {
            document.getElementById('achievements-grid').innerHTML =
                '<p class="text-muted" style="text-align: center; grid-column: 1/-1;">加载失败</p>';
        }
    }

    /**
     * Render achievements stats
     */
    renderAchievementsStats(stats) {
        const container = document.getElementById('achievements-stats');
        container.innerHTML = `
            <div class="achievement-stat">
                <div class="achievement-stat-value">${stats.unlocked}/${stats.total}</div>
                <div class="achievement-stat-label">已解锁</div>
            </div>
            <div class="achievement-stat">
                <div class="achievement-stat-value">${stats.completion_rate}</div>
                <div class="achievement-stat-label">完成率</div>
            </div>
            <div class="achievement-stat">
                <div class="achievement-stat-value">${stats.total_exp_earned}</div>
                <div class="achievement-stat-label">获得经验</div>
            </div>
        `;
    }

    /**
     * Render achievements grid
     */
    renderAchievementsGrid(achievements) {
        const grid = document.getElementById('achievements-grid');

        if (!achievements || achievements.length === 0) {
            grid.innerHTML = '<p class="text-muted" style="text-align: center; grid-column: 1/-1;">暂无成就</p>';
            return;
        }

        grid.innerHTML = achievements.map(a => {
            const isUnlocked = !!a.unlocked_at;
            const requirement = typeof a.requirement === 'string' ? JSON.parse(a.requirement) : a.requirement;
            let progressPercent = 0;

            if (isUnlocked) {
                progressPercent = 100;
            } else if (a.progress !== undefined && a.progress !== null) {
                progressPercent = Math.min(100, (a.progress / requirement.value) * 100);
            }

            return `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${a.icon}</div>
                    <div class="achievement-name">${isUnlocked ? a.name : (a.is_hidden ? '???' : a.name)}</div>
                    <div class="achievement-desc">${isUnlocked ? a.description : (a.is_hidden ? '尚未发现' : a.description)}</div>
                    <div class="achievement-progress">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-exp">+${a.exp_reward} EXP</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Bind mood rating
     */
    bindMoodRating() {
        document.querySelectorAll('.mood-star').forEach(star => {
            star.addEventListener('click', async () => {
                const score = parseInt(star.dataset.score);

                // Update UI
                document.querySelectorAll('.mood-star').forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.score) <= score);
                });

                // Save to server
                if (this.lastReadingId && API.isLoggedIn()) {
                    try {
                        await API.history.updateMood(this.lastReadingId, score);
                        this.showMessage('感谢你的评价！', 'success');
                    } catch (error) {
                        console.error('Failed to save mood:', error);
                    }
                }

                document.getElementById('mood-rating').style.display = 'none';
            });
        });
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
