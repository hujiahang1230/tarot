/**
 * Chat UI Module
 * Handles the conversational tarot reading interface
 */

class ChatUI {
    constructor(containerId, tarotReader, audioSystem, particleSystem) {
        this.container = document.getElementById(containerId);
        this.reader = tarotReader;
        this.audio = audioSystem;
        this.particles = particleSystem;
        this.messagesContainer = null;
        this.inputArea = null;
        this.typingIndicator = null;

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="chat-container">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <span class="chat-avatar">🔮</span>
                        <div>
                            <h3>AI塔罗师</h3>
                            <span class="chat-status">在线</span>
                        </div>
                    </div>
                    <button class="chat-close-btn" id="chat-close-btn">&times;</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="typing-indicator" id="typing-indicator" style="display: none;">
                        <span></span><span></span><span></span>
                    </div>
                </div>
                <div class="chat-input-area" id="chat-input-area">
                    <div class="chat-input-wrapper">
                        <input type="text" id="chat-input" placeholder="输入你的问题..." maxlength="200">
                        <button class="chat-send-btn" id="chat-send-btn">
                            <span>&#10148;</span>
                        </button>
                    </div>
                    <div class="chat-quick-actions" id="chat-quick-actions"></div>
                </div>
            </div>
        `;

        this.messagesContainer = document.getElementById('chat-messages');
        this.inputArea = document.getElementById('chat-input-area');
        this.typingIndicator = document.getElementById('typing-indicator');
    }

    bindEvents() {
        const closeBtn = document.getElementById('chat-close-btn');
        const sendBtn = document.getElementById('chat-send-btn');
        const input = document.getElementById('chat-input');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.container.classList.remove('active');
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    /**
     * Start conversation
     */
    start(healingMode = false) {
        this.container.classList.add('active');
        this.messagesContainer.innerHTML = '';
        this.messagesContainer.appendChild(this.typingIndicator);

        const messages = this.reader.start(healingMode);
        this.renderMessages(messages);
    }

    /**
     * Send user message
     */
    sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        this.clearQuickActions();

        // Show typing indicator
        this.showTyping();

        // Process message
        setTimeout(() => {
            const messages = this.reader.handleUserInput(text);
            this.hideTyping();
            this.renderMessages(messages);
            this.audio.play('cardFlip');
        }, 1000 + Math.random() * 1000);
    }

    /**
     * Handle action button click
     */
    handleAction(action) {
        this.clearQuickActions();

        switch (action) {
            case 'shuffle':
                this.showTyping();
                setTimeout(() => {
                    const messages = this.reader.handleUserInput('准备好了');
                    this.hideTyping();
                    this.renderMessages(messages);
                    this.audio.play('shuffle');
                }, 500);
                break;

            case 'draw':
                this.showTyping();
                setTimeout(() => {
                    const messages = this.reader.handleUserInput('揭示命运');
                    this.hideTyping();
                    this.renderMessages(messages);
                    this.audio.play('reveal');
                }, 500);
                break;

            case 'ask_follow_up':
                this.showInputForFollowUp();
                break;

            case 'healing_continue':
                this.showInputForHealing();
                break;

            case 'switch_to_tarot':
                this.reader.healingMode = false;
                this.reader.state = 'waiting_question';
                const prompt = this.reader.selectRandom(this.reader.questionPrompts);
                this.reader.addMessage('tarot', prompt, 'text');
                this.renderMessages(this.reader.getMessages());
                break;

            case 'healing_close':
                this.reader.showHealingClosing();
                this.renderMessages(this.reader.getMessages());
                break;

            case 'restart_healing':
                this.start(true);
                break;

            case 'restart_tarot':
                this.start(false);
                break;

            case 'restart':
                this.start();
                break;

            case 'close':
                this.container.classList.remove('active');
                break;
        }
    }

    /**
     * Render all messages
     */
    renderMessages(messages) {
        // Only render new messages
        const existingCount = this.messagesContainer.querySelectorAll('.chat-message').length;
        const newMessages = messages.slice(existingCount);

        newMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.renderMessage(msg);
            }, index * 300);
        });
    }

    /**
     * Render single message
     */
    renderMessage(msg) {
        const el = document.createElement('div');
        el.className = `chat-message chat-message-${msg.sender}`;

        switch (msg.type) {
            case 'text':
                el.innerHTML = `
                    <div class="chat-bubble">
                        <div class="chat-bubble-content">${this.formatText(msg.content)}</div>
                    </div>
                `;
                break;

            case 'question_display':
                el.innerHTML = `
                    <div class="chat-question-display">
                        <span class="question-icon">${msg.meta.icon || '❓'}</span>
                        <p>"${msg.content}"</p>
                        <span class="theme-badge">${msg.meta.theme || '综合运势'}</span>
                    </div>
                `;
                break;

            case 'card_reading':
                el.innerHTML = `
                    <div class="chat-card-reading">
                        <div class="chat-card-header">
                            <span class="chat-card-symbol">${msg.meta.card?.symbol || '🃏'}</span>
                            <span class="chat-card-name">${msg.meta.card?.name || ''} ${msg.meta.orientation || ''}</span>
                        </div>
                        <div class="chat-card-content">${this.formatText(msg.content)}</div>
                    </div>
                `;
                break;

            case 'healing_emotion':
                el.innerHTML = `
                    <div class="chat-healing-emotion" style="border-left-color: ${msg.meta.color || '#6ee7b7'}">
                        <span class="healing-emotion-icon">${msg.meta.icon || '💚'}</span>
                        <div class="healing-emotion-content">${this.formatText(msg.content)}</div>
                    </div>
                `;
                break;

            case 'healing_comfort':
                el.innerHTML = `
                    <div class="chat-healing-comfort">
                        <div class="healing-comfort-header">
                            <span class="healing-comfort-icon">🤗</span>
                            <span class="healing-comfort-title">心灵安慰</span>
                        </div>
                        <div class="healing-comfort-content">${this.formatText(msg.content)}</div>
                    </div>
                `;
                break;

            case 'healing_tarot':
                el.innerHTML = `
                    <div class="chat-healing-tarot">
                        <div class="healing-tarot-header">
                            <span class="healing-tarot-symbol">${msg.meta.card?.symbol || '🔮'}</span>
                            <span class="healing-tarot-name">${msg.meta.card?.name || ''} ${msg.meta.card?.reversed ? '(逆位)' : '(正位)'}</span>
                        </div>
                        <div class="healing-tarot-content">${this.formatText(msg.content)}</div>
                    </div>
                `;
                break;

            case 'healing_meditation':
                el.innerHTML = `
                    <div class="chat-healing-meditation">
                        <div class="healing-meditation-header">
                            <span class="healing-meditation-icon">🧘</span>
                            <span class="healing-meditation-title">冥想建议</span>
                        </div>
                        <div class="healing-meditation-content">${this.formatText(msg.content)}</div>
                    </div>
                `;
                break;

            case 'healing_breathing':
                el.innerHTML = this.renderBreathingExercise(msg);
                break;

            case 'healing_affirmation':
                el.innerHTML = `
                    <div class="chat-healing-affirmation">
                        <div class="healing-affirmation-content">${this.formatText(msg.content)}</div>
                    </div>
                `;
                break;

            case 'healing_card':
                el.innerHTML = `
                    <div class="chat-healing-card-display">
                        <span class="healing-card-emotion-icon">${msg.meta.icon}</span>
                        <span class="healing-card-emotion-label">当前情绪：${msg.meta.label}</span>
                    </div>
                `;
                break;

            case 'healing_closing':
                el.innerHTML = `
                    <div class="chat-healing-closing">
                        <div class="healing-closing-content">${this.formatText(msg.content)}</div>
                    </div>
                `;
                break;

            case 'animation':
                el.innerHTML = this.renderAnimation(msg);
                break;

            case 'action':
                el.innerHTML = this.renderActions(msg.meta);
                break;
        }

        this.messagesContainer.insertBefore(el, this.typingIndicator);
        this.scrollToBottom();
    }

    /**
     * Render breathing exercise
     */
    renderBreathingExercise(msg) {
        const pattern = msg.meta.pattern || '4-4-6';
        const parts = pattern.split('-');
        const inhale = parts[0] || 4;
        const hold = parts[1] || 4;
        const exhale = parts[2] || 6;

        return `
            <div class="chat-healing-breathing">
                <div class="healing-breathing-header">
                    <span class="healing-breathing-icon">🌬️</span>
                    <span class="healing-breathing-title">呼吸练习</span>
                </div>
                <div class="breathing-visual">
                    <div class="breathing-circle" id="breathing-circle">
                        <span class="breathing-text" id="breathing-text">准备</span>
                    </div>
                </div>
                <div class="breathing-instructions">
                    <div class="breathing-step">
                        <span class="breathing-step-label">吸气</span>
                        <span class="breathing-step-value">${inhale}秒</span>
                    </div>
                    <span class="breathing-arrow">→</span>
                    <div class="breathing-step">
                        <span class="breathing-step-label">屏住</span>
                        <span class="breathing-step-value">${hold}秒</span>
                    </div>
                    <span class="breathing-arrow">→</span>
                    <div class="breathing-step">
                        <span class="breathing-step-label">呼气</span>
                        <span class="breathing-step-value">${exhale}秒</span>
                    </div>
                </div>
                <button class="breathing-start-btn" id="breathing-start-btn">开始呼吸练习</button>
            </div>
        `;
    }

    /**
     * Render animation message
     */
    renderAnimation(msg) {
        switch (msg.meta.type) {
            case 'shuffle':
                return `
                    <div class="chat-animation shuffle-animation">
                        <div class="shuffle-visual">
                            <div class="shuffle-card"></div>
                            <div class="shuffle-card"></div>
                            <div class="shuffle-card"></div>
                        </div>
                        <p class="animation-text">洗牌中...</p>
                    </div>
                `;

            case 'draw':
                return `
                    <div class="chat-animation draw-animation">
                        <div class="draw-visual">
                            ${msg.meta.cards.map((card, i) => `
                                <div class="draw-card" style="animation-delay: ${i * 0.3}s">
                                    <div class="draw-card-back"></div>
                                </div>
                            `).join('')}
                        </div>
                        <p class="animation-text">抽牌中...</p>
                    </div>
                `;

            case 'reveal':
                return `
                    <div class="chat-animation reveal-animation">
                        <div class="reveal-visual">
                            ${msg.meta.cards.map((card, i) => `
                                <div class="reveal-card-slot" style="animation-delay: ${i * 0.5}s">
                                    <div class="reveal-card">
                                        <div class="reveal-card-back"></div>
                                        <div class="reveal-card-front">
                                            <span class="reveal-card-symbol">${card.symbol}</span>
                                            <span class="reveal-card-name">${card.name}</span>
                                            <span class="reveal-card-position">${card.reversed ? '逆位' : '正位'}</span>
                                        </div>
                                    </div>
                                    ${msg.meta.spreadType === 'time' ? `<span class="reveal-position-label">${['过去', '现在', '未来'][i]}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <p class="animation-text">揭示命运...</p>
                    </div>
                `;

            default:
                return '';
        }
    }

    /**
     * Render action buttons
     */
    renderActions(meta) {
        const buttons = meta.buttons.map(btn =>
            `<button class="chat-action-btn" data-action="${btn.action}">${btn.label}</button>`
        ).join('');

        return `<div class="chat-actions">${buttons}</div>`;
    }

    /**
     * Show typing indicator
     */
    showTyping() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTyping() {
        this.typingIndicator.style.display = 'none';
    }

    /**
     * Show input for follow-up
     */
    showInputForFollowUp() {
        const input = document.getElementById('chat-input');
        if (input) {
            input.placeholder = '输入你想追问的问题...';
            input.focus();
        }
    }

    /**
     * Show input for healing follow-up
     */
    showInputForHealing() {
        const input = document.getElementById('chat-input');
        if (input) {
            input.placeholder = '说说你现在的感受...';
            input.focus();
        }
    }

    /**
     * Initialize breathing exercise
     */
    initBreathingExercise() {
        const startBtn = document.getElementById('breathing-start-btn');
        if (!startBtn) return;

        startBtn.addEventListener('click', () => {
            const circle = document.getElementById('breathing-circle');
            const text = document.getElementById('breathing-text');
            if (!circle || !text) return;

            startBtn.disabled = true;
            startBtn.textContent = '练习中...';

            const pattern = startBtn.closest('.chat-healing-breathing').querySelector('.breathing-step-value')?.textContent || '4';
            const parts = pattern.split('-').map(p => parseInt(p) || 4);
            const inhale = parts[0] || 4;
            const hold = parts[1] || 4;
            const exhale = parts[2] || 6;

            let cycle = 0;
            const maxCycles = 3;

            const runCycle = () => {
                if (cycle >= maxCycles) {
                    startBtn.disabled = false;
                    startBtn.textContent = '再次练习';
                    circle.className = 'breathing-circle';
                    text.textContent = '完成';
                    return;
                }

                // Inhale
                text.textContent = `吸气 ${inhale}秒`;
                circle.className = 'breathing-circle inhale';

                setTimeout(() => {
                    // Hold
                    text.textContent = `屏住 ${hold}秒`;
                    circle.className = 'breathing-circle hold';

                    setTimeout(() => {
                        // Exhale
                        text.textContent = `呼气 ${exhale}秒`;
                        circle.className = 'breathing-circle exhale';

                        setTimeout(() => {
                            cycle++;
                            runCycle();
                        }, exhale * 1000);
                    }, hold * 1000);
                }, inhale * 1000);
            };

            runCycle();
        });
    }

    /**
     * Clear quick actions
     */
    clearQuickActions() {
        const actions = document.getElementById('chat-quick-actions');
        if (actions) actions.innerHTML = '';
    }

    /**
     * Format text for display
     */
    formatText(text) {
        if (!text) return '';
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            // Initialize breathing exercise if present
            this.initBreathingExercise();
        }, 100);
    }
}
