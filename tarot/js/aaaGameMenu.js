/**
 * AAA Game UI - Game Menu System
 * Implements game-style menus with advanced transitions and animations
 */

class AAAGameMenu {
    constructor(uiManager, audioSystem, camera) {
        this.ui = uiManager;
        this.audio = audioSystem;
        this.camera = camera;
        this.currentMenu = null;
        this.menuStack = [];
        this.isAnimating = false;
        this.menuElements = {};
        
        this.init();
    }

    init() {
        this.createGameMenuOverlay();
        this.createPauseMenu();
        this.createSettingsMenu();
        this.bindEvents();
    }

    createGameMenuOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'game-menu-overlay';
        overlay.innerHTML = `
            <div class="game-menu-bg"></div>
            <div class="game-menu-particles"></div>
            <div class="game-menu-content">
                <div class="game-menu-header">
                    <div class="game-menu-logo">
                        <span class="logo-symbol">✦</span>
                        <h1>MYSTIC TAROT</h1>
                    </div>
                    <div class="game-menu-version">v2.0 AAA</div>
                </div>
                
                <nav class="game-menu-nav">
                    <button class="game-menu-btn" data-action="start-quest">
                        <span class="btn-icon">🔮</span>
                        <span class="btn-text">开始占卜</span>
                        <span class="btn-glow"></span>
                    </button>
                    <button class="game-menu-btn" data-action="daily-quest">
                        <span class="btn-icon">⭐</span>
                        <span class="btn-text">每日运势</span>
                        <span class="btn-glow"></span>
                    </button>
                    <button class="game-menu-btn" data-action="healing-quest">
                        <span class="btn-icon">🌿</span>
                        <span class="btn-text">情绪疗愈</span>
                        <span class="btn-glow"></span>
                    </button>
                    <button class="game-menu-btn" data-action="grimoire">
                        <span class="btn-icon">📖</span>
                        <span class="btn-text">牌库图鉴</span>
                        <span class="btn-glow"></span>
                    </button>
                    <button class="game-menu-btn" data-action="leaderboard">
                        <span class="btn-icon">🏆</span>
                        <span class="btn-text">排行榜</span>
                        <span class="btn-glow"></span>
                    </button>
                    <button class="game-menu-btn" data-action="achievements">
                        <span class="btn-icon">🎖️</span>
                        <span class="btn-text">成就</span>
                        <span class="btn-glow"></span>
                    </button>
                    <button class="game-menu-btn" data-action="chronicles">
                        <span class="btn-icon">📜</span>
                        <span class="btn-text">历史记录</span>
                        <span class="btn-glow"></span>
                    </button>
                </nav>
                
                <div class="game-menu-footer">
                    <button class="game-menu-btn-small" data-action="settings">
                        <span>⚙️ 设置</span>
                    </button>
                    <button class="game-menu-btn-small" data-action="credits">
                        <span>🎬 制作人员</span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    createPauseMenu() {
        const menu = document.createElement('div');
        menu.id = 'pause-menu';
        menu.className = 'game-submenu';
        menu.innerHTML = `
            <div class="submenu-content">
                <h2 class="submenu-title">暂停</h2>
                <nav class="submenu-nav">
                    <button class="submenu-btn" data-action="resume">继续占卜</button>
                    <button class="submenu-btn" data-action="save">保存进度</button>
                    <button class="submenu-btn" data-action="load">加载存档</button>
                    <button class="submenu-btn" data-action="settings">设置</button>
                    <button class="submenu-btn" data-action="main-menu">返回主菜单</button>
                </nav>
            </div>
        `;
        document.body.appendChild(menu);
    }

    createSettingsMenu() {
        const menu = document.createElement('div');
        menu.id = 'settings-menu';
        menu.className = 'game-submenu';
        menu.innerHTML = `
            <div class="submenu-content">
                <h2 class="submenu-title">设置</h2>
                <div class="settings-grid">
                    <div class="setting-group">
                        <h3>画面</h3>
                        <div class="setting-item">
                            <label>Bloom 强度</label>
                            <input type="range" class="setting-slider" data-setting="bloom" min="0" max="100" value="80">
                        </div>
                        <div class="setting-item">
                            <label>景深</label>
                            <input type="range" class="setting-slider" data-setting="dof" min="0" max="100" value="50">
                        </div>
                        <div class="setting-item">
                            <label>动态雾气</label>
                            <input type="range" class="setting-slider" data-setting="fog" min="0" max="100" value="40">
                        </div>
                        <div class="setting-item">
                            <label>粒子密度</label>
                            <input type="range" class="setting-slider" data-setting="particles" min="0" max="100" value="70">
                        </div>
                    </div>
                    <div class="setting-group">
                        <h3>音频</h3>
                        <div class="setting-item">
                            <label>主音量</label>
                            <input type="range" class="setting-slider" data-setting="masterVolume" min="0" max="100" value="70">
                        </div>
                        <div class="setting-item">
                            <label>音乐</label>
                            <input type="range" class="setting-slider" data-setting="musicVolume" min="0" max="100" value="60">
                        </div>
                        <div class="setting-item">
                            <label>音效</label>
                            <input type="range" class="setting-slider" data-setting="sfxVolume" min="0" max="100" value="80">
                        </div>
                    </div>
                    <div class="setting-group">
                        <h3>游戏</h3>
                        <div class="setting-item">
                            <label>震动反馈</label>
                            <label class="toggle-switch">
                                <input type="checkbox" data-setting="haptic" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>镜头动画</label>
                            <label class="toggle-switch">
                                <input type="checkbox" data-setting="camera" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <button class="submenu-btn back-btn" data-action="close-settings">返回</button>
            </div>
        `;
        document.body.appendChild(menu);
    }

    bindEvents() {
        // Main menu buttons
        document.querySelectorAll('.game-menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleMenuAction(action);
                this.audio.play('click');
            });
        });

        // Submenu buttons
        document.querySelectorAll('.submenu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleSubmenuAction(action);
                this.audio.play('click');
            });
        });

        // Settings sliders
        document.querySelectorAll('.setting-slider').forEach(slider => {
            slider.addEventListener('input', () => {
                const setting = slider.dataset.setting;
                const value = slider.value / 100;
                this.updateSetting(setting, value);
            });
        });

        // Toggle switches
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', () => {
                const setting = toggle.dataset.setting;
                this.updateSetting(setting, toggle.checked);
            });
        });

        // ESC key for pause menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.currentMenu === 'pause') {
                    this.closePauseMenu();
                } else if (!this.currentMenu) {
                    this.openPauseMenu();
                }
            }
        });
    }

    handleMenuAction(action) {
        switch (action) {
            case 'start-quest':
                this.ui.navigateTo('divination');
                this.closeMainMenu();
                break;
            case 'daily-quest':
                this.ui.handleDailyFortune();
                this.closeMainMenu();
                break;
            case 'healing-quest':
                this.ui.navigateTo('healing');
                this.closeMainMenu();
                break;
            case 'grimoire':
                this.ui.navigateTo('gallery');
                this.closeMainMenu();
                break;
            case 'leaderboard':
                this.ui.navigateTo('ranking');
                this.closeMainMenu();
                break;
            case 'achievements':
                this.ui.navigateTo('achievements');
                this.closeMainMenu();
                break;
            case 'chronicles':
                this.ui.navigateTo('history');
                this.closeMainMenu();
                break;
            case 'settings':
                this.openSettingsMenu();
                break;
            case 'credits':
                this.showCredits();
                break;
        }
    }

    handleSubmenuAction(action) {
        switch (action) {
            case 'resume':
                this.closePauseMenu();
                break;
            case 'save':
                this.saveGame();
                break;
            case 'load':
                this.loadGame();
                break;
            case 'settings':
                this.closePauseMenu();
                this.openSettingsMenu();
                break;
            case 'main-menu':
                this.closePauseMenu();
                this.openMainMenu();
                break;
            case 'close-settings':
                this.closeSettingsMenu();
                break;
        }
    }

    openMainMenu() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentMenu = 'main';
        
        const overlay = document.getElementById('game-menu-overlay');
        overlay.classList.add('active');
        
        if (this.camera) {
            this.camera.triggerShot('menuOpen', () => {
                this.isAnimating = false;
            });
        } else {
            this.isAnimating = false;
        }
    }

    closeMainMenu() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const overlay = document.getElementById('game-menu-overlay');
        overlay.classList.remove('active');
        
        if (this.camera) {
            this.camera.triggerShot('menuClose', () => {
                this.currentMenu = null;
                this.isAnimating = false;
            });
        } else {
            this.currentMenu = null;
            this.isAnimating = false;
        }
    }

    openPauseMenu() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentMenu = 'pause';
        
        const menu = document.getElementById('pause-menu');
        menu.classList.add('active');
        
        this.isAnimating = false;
    }

    closePauseMenu() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const menu = document.getElementById('pause-menu');
        menu.classList.remove('active');
        
        this.currentMenu = null;
        this.isAnimating = false;
    }

    openSettingsMenu() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const menu = document.getElementById('settings-menu');
        menu.classList.add('active');
        
        this.isAnimating = false;
    }

    closeSettingsMenu() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const menu = document.getElementById('settings-menu');
        menu.classList.remove('active');
        
        this.isAnimating = false;
    }

    updateSetting(setting, value) {
        switch (setting) {
            case 'bloom':
            case 'dof':
            case 'fog':
            case 'particles':
                if (window.TarotApp && window.TarotApp.postProcessing) {
                    window.TarotApp.postProcessing.setIntensity(setting, value);
                }
                break;
            case 'masterVolume':
            case 'musicVolume':
            case 'sfxVolume':
                if (this.audio) {
                    this.audio.setVolume(value);
                }
                break;
        }
        
        localStorage.setItem(`tarot_setting_${setting}`, value);
    }

    saveGame() {
        const gameState = {
            currentPage: this.ui.currentPage,
            currentSpread: this.ui.currentSpread,
            drawnCards: this.ui.drawnCards,
            timestamp: Date.now()
        };
        
        localStorage.setItem('tarot_save_game', JSON.stringify(gameState));
        this.ui.showMessage('进度已保存', 'success');
    }

    loadGame() {
        const saveData = localStorage.getItem('tarot_save_game');
        if (!saveData) {
            this.ui.showMessage('没有找到存档', 'warning');
            return;
        }
        
        const gameState = JSON.parse(saveData);
        this.ui.navigateTo(gameState.currentPage);
        this.ui.currentSpread = gameState.currentSpread;
        this.ui.drawnCards = gameState.drawnCards;
        this.ui.renderCardSlots();
        
        this.closePauseMenu();
        this.ui.showMessage('存档已加载', 'success');
    }

    showCredits() {
        this.ui.showMessage('Mystic Tarot v2.0 - AAA Edition', 'info');
    }
}
