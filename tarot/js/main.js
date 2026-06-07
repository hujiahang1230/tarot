/**
 * Main Application Entry Point
 * Initializes all modules and handles loading sequence
 */

document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    const loadingText = document.querySelector('.loading-text');

    const loadingSteps = [
        { progress: 20, text: 'Initializing WebGL pipeline...' },
        { progress: 40, text: 'Loading particle systems...' },
        { progress: 60, text: 'Compiling shaders...' },
        { progress: 80, text: 'Calibrating camera...' },
        { progress: 100, text: 'Welcome, seeker...' }
    ];

    let stepIndex = 0;

    function nextLoadingStep() {
        if (stepIndex < loadingSteps.length) {
            const step = loadingSteps[stepIndex];
            loadingProgress.style.width = `${step.progress}%`;
            loadingText.textContent = step.text;
            stepIndex++;
            setTimeout(nextLoadingStep, 400);
        } else {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                initializeApp();
            }, 500);
        }
    }

    setTimeout(nextLoadingStep, 300);
});

/**
 * Initialize all application modules
 */
function initializeApp() {
    // Initialize particle system
    const particleSystem = new ParticleSystem('particles-canvas');

    // Initialize WebGL magic effects
    let webglEffects = null;
    try {
        webglEffects = new WebGLMagicEffects('webgl-canvas');
    } catch (error) {
        console.warn('WebGL initialization failed:', error);
    }

    // Initialize post-processing
    let postProcessing = null;
    try {
        postProcessing = new AAAPostProcessing('gpu-particles-canvas');
    } catch (error) {
        console.warn('Post-processing initialization failed:', error);
    }

    // Initialize cinematic camera
    const camera = new CinematicCamera();

    // Initialize audio system
    const audioSystem = new AudioSystem();

    // Initialize conversational tarot reader
    const tarotReader = new ConversationalTarotReader();

    // Initialize chat UI
    const chatUI = new ChatUI('chat-container', tarotReader, audioSystem, particleSystem);

    // Initialize UI manager
    const uiManager = new UIManager(audioSystem, particleSystem, webglEffects);

    // Initialize mobile gestures
    const mobileGestures = new MobileGestures(uiManager, audioSystem, particleSystem);

    // Initialize AAA game menu
    const gameMenu = new AAAGameMenu(uiManager, audioSystem, camera);

    // Initialize breathing therapy
    let breathingTherapy = null;
    try {
        breathingTherapy = new BreathingTherapy('breathing-canvas', particleSystem, audioSystem);
    } catch (error) {
        console.warn('Breathing therapy initialization failed:', error);
    }

    // Initialize AI meditation guide
    let aiMeditationGuide = null;
    try {
        aiMeditationGuide = new AIMeditationGuide('meditation-text-container', audioSystem, breathingTherapy);
    } catch (error) {
        console.warn('AI meditation guide initialization failed:', error);
    }

    // Initialize late-night universe mode
    let lateNightUniverse = null;
    try {
        lateNightUniverse = new LateNightUniverseMode('universe-canvas', audioSystem, particleSystem);
    } catch (error) {
        console.warn('Late-night universe initialization failed:', error);
    }

    // Initialize MBTI test
    const mbtiTest = new MBTITest();

    // Initialize MBTI analysis
    const mbtiAnalysis = new MBTIAnalysis();

    // Initialize MBTI healing
    const mbtiHealing = new MBTIHealing();

    let currentMBTIPersonality = null;
    let selectedMBTIMode = 'test';
    let latestMBTIProfile = null;

    function syncCompanionProfile(companionData) {
        const profile = companionData?.profile;
        if (!profile) return;

        if (profile.mbti_type && mbtiAnalysis.personalityTypes?.[profile.mbti_type]) {
            currentMBTIPersonality = {
                type: profile.mbti_type,
                ...mbtiAnalysis.personalityTypes[profile.mbti_type],
                dimensions: currentMBTIPersonality?.dimensions || null,
                scores: currentMBTIPersonality?.scores || null,
                analysis: currentMBTIPersonality?.analysis || null
            };
        }

        const mbtiSelect = document.getElementById('mbti-select');
        const zodiacSelect = document.getElementById('zodiac-select');
        if (mbtiSelect && profile.mbti_type) mbtiSelect.value = profile.mbti_type;
        if (zodiacSelect && profile.zodiac_sign) zodiacSelect.value = profile.zodiac_sign;
    }

    document.addEventListener('companion-profile-updated', (event) => {
        syncCompanionProfile(event.detail);
    });

    // Create dynamic fog overlay
    const fogOverlay = document.createElement('div');
    fogOverlay.className = 'dynamic-fog';
    document.body.appendChild(fogOverlay);

    // Create HUD corners
    const hud = document.createElement('div');
    hud.className = 'game-hud';
    hud.innerHTML = `
        <div class="hud-corner hud-corner-tl"></div>
        <div class="hud-corner hud-corner-tr"></div>
        <div class="hud-corner hud-corner-bl"></div>
        <div class="hud-corner hud-corner-br"></div>
    `;
    document.body.appendChild(hud);

    // Create transition overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.id = 'transition-overlay';
    transitionOverlay.className = 'transition-overlay';
    document.body.appendChild(transitionOverlay);

    // Bind chat page events
    const chatPage = document.getElementById('page-chat');
    if (chatPage) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    // Chat page is now visible
                }
            });
        });
        observer.observe(chatPage, { attributes: true, attributeFilter: ['class'] });
    }

    // Start chat button
    const startChatBtn = document.getElementById('btn-start-chat');
    const embeddedCompanion = document.getElementById('embedded-ai-companion');
    const aiCompanionFrame = document.getElementById('ai-companion-frame');
    const closeAiCompanionBtn = document.getElementById('btn-close-ai-companion');
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
            if (embeddedCompanion && aiCompanionFrame) {
                if (!aiCompanionFrame.getAttribute('src')) {
                    aiCompanionFrame.setAttribute('src', 'ai-companion.html');
                }
                embeddedCompanion.hidden = false;
                embeddedCompanion.classList.add('active');
                embeddedCompanion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                audioSystem.play('reveal');
                return;
            }
            chatUI.start(false);
            audioSystem.play('reveal');
        });
    }

    if (closeAiCompanionBtn && embeddedCompanion) {
        closeAiCompanionBtn.addEventListener('click', () => {
            embeddedCompanion.classList.remove('active');
            embeddedCompanion.hidden = true;
        });
    }

    // Chat action buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('chat-action-btn')) {
            const action = e.target.dataset.action;
            chatUI.handleAction(action);
        }
    });

    // Make systems globally accessible
    window.TarotApp = {
        particles: particleSystem,
        webgl: webglEffects,
        postProcessing: postProcessing,
        camera: camera,
        audio: audioSystem,
        ui: uiManager,
        chat: chatUI,
        reader: tarotReader,
        gameMenu: gameMenu,
        mobileGestures: mobileGestures,
        breathing: breathingTherapy,
        meditation: aiMeditationGuide,
        universe: lateNightUniverse,
        mbtiTest: mbtiTest,
        mbtiAnalysis: mbtiAnalysis,
        mbtiHealing: mbtiHealing
    };

    let selectedHealingMode = 'breathing';

    document.querySelectorAll('.healing-feature').forEach(feature => {
        feature.addEventListener('click', () => {
            document.querySelectorAll('.healing-feature').forEach(f => f.classList.remove('active'));
            feature.classList.add('active');
            selectedHealingMode = feature.dataset.mode;
        });
    });

    const startHealingBtn = document.getElementById('btn-start-healing');
    if (startHealingBtn) {
        startHealingBtn.addEventListener('click', () => {
            if (!API.isLoggedIn()) {
                uiManager.showMessage('请先登录后再进行情绪疗愈', 'warning');
                setTimeout(() => uiManager.showAuthModal(), 500);
                return;
            }
            
            audioSystem.initAudioContext();
            audioSystem.play('reveal');
            
            switch (selectedHealingMode) {
                case 'breathing':
                    uiManager.navigateTo('breathing');
                    if (breathingTherapy) breathingTherapy.start();
                    break;
                case 'meditation':
                    uiManager.navigateTo('meditation');
                    if (aiMeditationGuide) aiMeditationGuide.start();
                    break;
                case 'universe':
                    uiManager.navigateTo('universe');
                    if (lateNightUniverse) lateNightUniverse.start();
                    break;
                case 'combined':
                    uiManager.navigateTo('combined');
                    if (breathingTherapy) breathingTherapy.start();
                    if (aiMeditationGuide) aiMeditationGuide.start();
                    break;
            }
        });
    }

    const btnBreathingStop = document.getElementById('btn-breathing-stop');
    if (btnBreathingStop) {
        btnBreathingStop.addEventListener('click', () => {
            if (breathingTherapy) breathingTherapy.stop();
            uiManager.navigateTo('healing');
        });
    }

    const btnMeditationStop = document.getElementById('btn-meditation-stop');
    if (btnMeditationStop) {
        btnMeditationStop.addEventListener('click', () => {
            if (aiMeditationGuide) aiMeditationGuide.stop();
            uiManager.navigateTo('healing');
        });
    }

    const btnUniverseStop = document.getElementById('btn-universe-stop');
    if (btnUniverseStop) {
        btnUniverseStop.addEventListener('click', () => {
            if (lateNightUniverse) lateNightUniverse.stop();
            uiManager.navigateTo('healing');
        });
    }

    const btnCombinedStop = document.getElementById('btn-combined-stop');
    if (btnCombinedStop) {
        btnCombinedStop.addEventListener('click', () => {
            if (breathingTherapy) breathingTherapy.stop();
            if (aiMeditationGuide) aiMeditationGuide.stop();
            uiManager.navigateTo('healing');
        });
    }

    // MBTI feature selection
    document.querySelectorAll('.mbti-feature').forEach(feature => {
        feature.addEventListener('click', () => {
            document.querySelectorAll('.mbti-feature').forEach(f => f.classList.remove('active'));
            feature.classList.add('active');
            selectedMBTIMode = feature.dataset.mode;
        });
    });

    // Start MBTI journey button
    const startMBTIBtn = document.getElementById('btn-start-mbti');
    if (startMBTIBtn) {
        startMBTIBtn.addEventListener('click', () => {
            if (!API.isLoggedIn()) {
                uiManager.showMessage('请先登录后再进行人格测试', 'warning');
                setTimeout(() => uiManager.showAuthModal(), 500);
                return;
            }
            
            audioSystem.initAudioContext();
            audioSystem.play('reveal');
            
            switch (selectedMBTIMode) {
                case 'test':
                    uiManager.navigateTo('mbti-test');
                    mbtiTest.start(onMBTIProgress, onMBTIComplete);
                    break;
                case 'analysis':
                    if (currentMBTIPersonality) {
                        uiManager.navigateTo('mbti-analysis');
                        displayMBTIAnalysis(currentMBTIPersonality);
                    } else {
                        uiManager.navigateTo('mbti-test');
                        mbtiTest.start(onMBTIProgress, onMBTIComplete);
                    }
                    break;
                case 'healing':
                    if (currentMBTIPersonality) {
                        uiManager.navigateTo('mbti-healing');
                        document.getElementById('mbti-healing-subtitle').textContent = `${currentMBTIPersonality.type} - ${currentMBTIPersonality.name} 的专属空间`;
                        mbtiHealing.setPersonality(currentMBTIPersonality);
                    } else {
                        uiManager.navigateTo('mbti-test');
                        mbtiTest.start(onMBTIProgress, onMBTIComplete);
                    }
                    break;
                case 'meditation':
                    if (currentMBTIPersonality) {
                        uiManager.navigateTo('mbti-healing');
                        document.getElementById('mbti-healing-subtitle').textContent = `${currentMBTIPersonality.type} - ${currentMBTIPersonality.name} 的专属空间`;
                        mbtiHealing.setPersonality(currentMBTIPersonality);
                        mbtiHealing.startHealing('meditation', onMBTIHealingMessage);
                        document.getElementById('mbti-healing-input-area').style.display = 'none';
                    } else {
                        uiManager.navigateTo('mbti-test');
                        mbtiTest.start(onMBTIProgress, onMBTIComplete);
                    }
                    break;
            }
        });
    }

    // MBTI healing card selection
    document.querySelectorAll('#page-mbti-healing .healing-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#page-mbti-healing .healing-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const mode = card.dataset.mode;
            const chatArea = document.getElementById('mbti-healing-chat');
            const inputArea = document.getElementById('mbti-healing-input-area');
            chatArea.innerHTML = '';
            
            if (mode === 'emotion' || mode === 'companion') {
                inputArea.style.display = 'flex';
            } else {
                inputArea.style.display = 'none';
            }
            
            mbtiHealing.startHealing(mode, onMBTIHealingMessage);
        });
    });

    // MBTI healing send button
    const mbtiHealingSend = document.getElementById('mbti-healing-send');
    if (mbtiHealingSend) {
        mbtiHealingSend.addEventListener('click', sendMBTIHealingMessage);
    }

    const mbtiHealingInput = document.getElementById('mbti-healing-input');
    if (mbtiHealingInput) {
        mbtiHealingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMBTIHealingMessage();
        });
    }

    function sendMBTIHealingMessage() {
        const input = document.getElementById('mbti-healing-input');
        const text = input.value.trim();
        if (!text) return;
        
        addMBTIMessageToChat(text, 'user');
        input.value = '';
        
        mbtiHealing.handleUserMessage(text);
    }

    function onMBTIHealingMessage(text, callback) {
        addMBTIMessageToChat(text, 'companion', callback);
    }

    function addMBTIMessageToChat(text, type, callback) {
        const chatArea = document.getElementById('mbti-healing-chat');
        const msg = document.createElement('div');
        msg.className = `chat-message ${type}`;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        msg.appendChild(content);
        chatArea.appendChild(msg);
        
        typeMBTIContent(content, text, callback);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function typeMBTIContent(element, text, callback) {
        let index = 0;
        const speed = 50 + Math.random() * 30;
        
        const type = () => {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
                setTimeout(type, speed);
            } else {
                if (callback) callback();
            }
        };
        
        type();
    }

    // MBTI back button
    const btnBackMBTIHealing = document.getElementById('btn-back-mbti-healing');
    if (btnBackMBTIHealing) {
        btnBackMBTIHealing.addEventListener('click', () => {
            mbtiHealing.stop();
            uiManager.navigateTo(latestMBTIProfile ? 'mbti-profile' : 'mbti');
        });
    }

    const btnEnterMBTIProfileHealing = document.getElementById('btn-enter-mbti-profile-healing');
    if (btnEnterMBTIProfileHealing) {
        btnEnterMBTIProfileHealing.addEventListener('click', () => {
            if (!currentMBTIPersonality) return;
            uiManager.navigateTo('mbti-healing');
            document.getElementById('mbti-healing-subtitle').textContent = `${currentMBTIPersonality.type} - ${currentMBTIPersonality.name} 的专属空间`;
            mbtiHealing.setPersonality(currentMBTIPersonality);
        });
    }

    // MBTI test progress callback
    function onMBTIProgress(current, total, progress, dimension) {
        const progressCircle = document.getElementById('mbti-test-progress');
        const progressText = document.getElementById('mbti-progress-text');
        const progressBarFill = document.getElementById('mbti-progress-bar-fill');
        const progressPercent = document.getElementById('mbti-progress-percent');
        const dimFill = document.getElementById('mbti-dim-fill');
        
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (progress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        progressText.textContent = `${current}/${total}`;
        
        progressBarFill.style.width = `${progress}%`;
        progressPercent.textContent = `${Math.round(progress)}%`;
        
        const dimLabels = { EI: '外向/内向', SN: '感觉/直觉', TF: '思考/情感', JP: '判断/知觉' };
        const labels = dimLabels[dimension]?.split('/') || ['', ''];
        document.querySelectorAll('#mbti-dimension-indicator .dim-label')[0].textContent = labels[0];
        document.querySelectorAll('#mbti-dimension-indicator .dim-label')[1].textContent = labels[1];
        
        dimFill.style.width = `${50 + (Math.random() - 0.5) * 20}%`;
    }

    // MBTI test complete callback
    function onMBTIComplete(result) {
        currentMBTIPersonality = mbtiAnalysis.analyze(result);

        if (API.isLoggedIn() && currentMBTIPersonality) {
            API.companion.saveMBTI({
                mbti_type: currentMBTIPersonality.type,
                mbti_name: currentMBTIPersonality.name,
                source: 'mbti-test',
                answers: result,
                summary: currentMBTIPersonality.description,
                analysis: currentMBTIPersonality.analysis
            }).then(() => uiManager.refreshCompanionData())
              .catch((error) => console.error('Failed to archive MBTI:', error));
        }
        
        uiManager.navigateTo('mbti-analysis');
        displayMBTIAnalysis(currentMBTIPersonality);
        
        setTimeout(() => {
            latestMBTIProfile = createMBTIProfile(currentMBTIPersonality);
            renderMBTIProfile(latestMBTIProfile);
            uiManager.navigateTo('mbti-profile');
        }, 5000);
    }

    function createMBTIProfile(personality) {
        const dims = personality.dimensions || {
            EI: { score: 0.5, dominant: personality.type?.[0] || 'I' },
            SN: { score: 0.5, dominant: personality.type?.[1] || 'N' },
            TF: { score: 0.5, dominant: personality.type?.[2] || 'F' },
            JP: { score: 0.5, dominant: personality.type?.[3] || 'J' }
        };
        const isIntrovert = dims.EI.dominant === 'I';
        const isIntuitive = dims.SN.dominant === 'N';
        const isFeeling = dims.TF.dominant === 'F';
        const isJudging = dims.JP.dominant === 'J';
        const confidence = Object.values(dims).reduce((sum, dim) => sum + Math.abs((dim.score || 0.5) - 0.5), 0) / 4;
        const emotionScore = Math.min(96, Math.round(72 + confidence * 42 + (isFeeling ? 5 : 0)));
        const zodiac = getCurrentZodiacName();
        const keywords = [
            ...(personality.strengths || []).slice(0, 3),
            isIntrovert ? '内在宇宙' : '外放能量',
            isIntuitive ? '未来感知' : '现实锚点',
            isFeeling ? '情绪共振' : '理性校准'
        ];
        const uniqueKeywords = [...new Set(keywords)].slice(0, 7);
        const social = isIntrovert ? '深度连接型' : '星群链接型';
        const socialDesc = isIntrovert
            ? '偏好少量、高质量、能触及内心的关系。'
            : '在互动中获得能量，擅长快速点亮团队气氛。';
        const decision = `${isIntuitive ? '直觉预判' : '现实验证'} + ${isFeeling ? '价值共情' : '逻辑推演'}`;
        const decisionDesc = isFeeling
            ? '会把人的感受、关系温度与长期意义放进判断过程。'
            : '倾向先拆解事实结构，再选择效率更高的行动路径。';
        const growthTitle = isJudging ? '拥抱弹性' : '稳定落地';
        const growth = personality.portrait?.growth || personality.healing || '把天赋转化成稳定行动，在关系、目标和自我照顾之间建立新的平衡。';
        const summary = `${personality.type}「${personality.name}」像${personality.element || '一束星光'}一样拥有鲜明的精神底色。你的优势在于${(personality.strengths || uniqueKeywords).slice(0, 2).join('、')}；当你把${growthTitle}作为下一阶段任务，会更容易把内在天赋转化成稳定的现实力量。`;

        return {
            type: personality.type,
            name: personality.name,
            title: personality.title,
            color: personality.color,
            zodiac,
            keywords: uniqueKeywords,
            emotionScore,
            social,
            socialDesc,
            decision,
            decisionDesc,
            growthTitle,
            growth,
            badge: `${personality.element || '星尘'} · ${personality.title}`,
            summary,
            timeline: [
                { time: '01 / 测试完成', title: '人格核心定位', text: `识别为 ${personality.type} ${personality.name}，主能量来自${personality.element || '深空星轨'}。` },
                { time: '02 / 星座并入', title: '星轨信息同步', text: `${zodiac} 已写入档案，用于后续情绪与关系画像。` },
                { time: '03 / AI画像生成', title: '关键词归档', text: `${uniqueKeywords.slice(0, 4).join('、')}成为本次画像的核心标签。` },
                { time: '04 / 成长任务', title: growthTitle, text: compactMBTIText(growth, 48) }
            ]
        };
    }

    function renderMBTIProfile(profile) {
        setMBTIProfileText('avatar', profile.type.slice(0, 2));
        setMBTIProfileText('name', profile.name);
        setMBTIProfileText('level', `LV. ${24 + profile.type.charCodeAt(0) % 12}`);
        setMBTIProfileText('badge', profile.badge);
        setMBTIProfileText('emotion-score', profile.emotionScore);
        setMBTIProfileText('social-score', profile.social.replace('型', ''));
        setMBTIProfileText('type', profile.type);
        setMBTIProfileText('type-name', profile.name);
        setMBTIProfileText('zodiac', profile.zodiac);
        setMBTIProfileText('emotion', `星云稳定 ${profile.emotionScore}%`);
        setMBTIProfileText('social', profile.social);
        setMBTIProfileText('social-desc', profile.socialDesc);
        setMBTIProfileText('decision', profile.decision);
        setMBTIProfileText('decision-desc', profile.decisionDesc);
        setMBTIProfileText('growth-title', profile.growthTitle);
        setMBTIProfileText('growth', compactMBTIText(profile.growth, 86));
        setMBTIProfileText('ai-summary', profile.summary);

        const avatar = document.getElementById('mbti-profile-avatar');
        if (avatar) {
            avatar.style.background = `radial-gradient(circle at 35% 25%, rgba(255,255,255,0.42), transparent 18%), linear-gradient(145deg, rgba(112,226,255,0.16), ${profile.color}, rgba(212,168,67,0.26))`;
        }

        const emotionBar = document.getElementById('mbti-profile-emotion-bar');
        if (emotionBar) emotionBar.style.width = `${profile.emotionScore}%`;

        const keywords = document.getElementById('mbti-profile-keywords');
        if (keywords) {
            keywords.innerHTML = profile.keywords.map(keyword => `<span>${keyword}</span>`).join('');
        }

        const timeline = document.getElementById('mbti-profile-timeline');
        if (timeline) {
            timeline.innerHTML = profile.timeline.map(item => `
                <article class="timeline-item">
                    <time>${item.time}</time>
                    <h4>${item.title}</h4>
                    <p>${item.text}</p>
                </article>
            `).join('');
        }
    }

    function setMBTIProfileText(id, value) {
        const element = document.getElementById(`mbti-profile-${id}`);
        if (element) element.textContent = value;
    }

    function compactMBTIText(text, maxLength) {
        if (!text || text.length <= maxLength) return text || '';
        return `${text.slice(0, maxLength)}...`;
    }

    function getCurrentZodiacName() {
        const zodiacSelect = document.getElementById('zodiac-select');
        if (zodiacSelect?.value && window.ZodiacData) {
            return ZodiacData.getSign(zodiacSelect.value)?.name || zodiacSelect.value;
        }

        const names = {
            aries: '白羊座',
            taurus: '金牛座',
            gemini: '双子座',
            cancer: '巨蟹座',
            leo: '狮子座',
            virgo: '处女座',
            libra: '天秤座',
            scorpio: '天蝎座',
            sagittarius: '射手座',
            capricorn: '摩羯座',
            aquarius: '水瓶座',
            pisces: '双鱼座'
        };
        const keys = ['zodiac_sign', 'zodiacSign', 'selectedZodiac', 'userZodiac'];
        for (const key of keys) {
            const value = localStorage.getItem(key);
            if (value) return names[value] || value;
        }
        return '星座待记录';
    }

    // Display MBTI analysis
    function displayMBTIAnalysis(personality) {
        const typeBadge = document.getElementById('mbti-type-badge');
        const typeName = document.getElementById('mbti-type-name');
        const typeTitle = document.getElementById('mbti-type-title');
        const typeDesc = document.getElementById('mbti-type-description');
        
        typeBadge.textContent = personality.type;
        typeBadge.style.background = `linear-gradient(135deg, ${personality.color}, ${personality.color}88)`;
        typeName.textContent = `${personality.name}`;
        typeTitle.textContent = personality.title;
        typeDesc.textContent = personality.description;
        
        setTimeout(() => {
            const dims = personality.dimensions;
            document.getElementById('mbti-dim-EI').style.width = `${dims.EI.score * 100}%`;
            document.getElementById('mbti-dim-SN').style.width = `${dims.SN.score * 100}%`;
            document.getElementById('mbti-dim-TF').style.width = `${dims.TF.score * 100}%`;
            document.getElementById('mbti-dim-JP').style.width = `${dims.JP.score * 100}%`;
        }, 1000);
        
        if (personality.portrait) {
            displayPortrait(personality.portrait);
        }
    }
    
    function displayPortrait(portrait) {
        const portraitSection = document.getElementById('portrait-section');
        const portraitContent = document.getElementById('portrait-content');
        
        const sections = [
            { key: 'core', label: '人格核心' },
            { key: 'innerWorld', label: '内心世界' },
            { key: 'emotion', label: '情绪状态' },
            { key: 'social', label: '社交方式' },
            { key: 'love', label: '爱情观' },
            { key: 'loneliness', label: '孤独感' },
            { key: 'stress', label: '压力状态' },
            { key: 'shadow', label: '阴影人格' },
            { key: 'night', label: '夜晚独处状态' },
            { key: 'vulnerability', label: '隐藏脆弱' },
            { key: 'security', label: '安全感来源' },
            { key: 'thinking', label: '思维模式' },
            { key: 'growth', label: '成长方向' },
            { key: 'healing', label: 'AI疗愈建议' }
        ];
        
        let html = '';
        sections.forEach(section => {
            if (portrait[section.key]) {
                html += `
                    <div class="portrait-item">
                        <div class="portrait-item-label">${section.label}</div>
                        <div class="portrait-item-text">${portrait[section.key]}</div>
                    </div>
                `;
            }
        });
        
        portraitContent.innerHTML = html;
        portraitSection.style.display = 'block';
        
        setTimeout(() => {
            portraitSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    }
    
    const btnStartHealingFromPortrait = document.getElementById('btn-start-healing-from-portrait');
    if (btnStartHealingFromPortrait) {
        btnStartHealingFromPortrait.addEventListener('click', () => {
            uiManager.navigateTo('mbti-healing');
            document.getElementById('mbti-healing-subtitle').textContent = `${currentMBTIPersonality.type} - ${currentMBTIPersonality.name} 的专属空间`;
            mbtiHealing.setPersonality(currentMBTIPersonality);
        });
    }

    // Add particle trail to magic buttons
    document.querySelectorAll('.btn-magic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            particleSystem.createTrail(e.clientX, e.clientY, 2);
        });
    });

    // Add hover sound effects
    document.querySelectorAll('.btn-magic, .nav-btn, .spread-btn, .filter-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            audioSystem.play('hover');
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case '1':
                uiManager.navigateTo('home');
                break;
            case '2':
                uiManager.navigateTo('divination');
                break;
            case '3':
                uiManager.navigateTo('chat');
                break;
            case '4':
                uiManager.navigateTo('healing');
                break;
            case '5':
                uiManager.navigateTo('mbti');
                break;
            case '6':
                uiManager.navigateTo('zodiac');
                break;
            case '7':
                uiManager.navigateTo('cosmic-portrait');
                break;
            case '8':
                uiManager.navigateTo('gallery');
                break;
            case '9':
                uiManager.navigateTo('ranking');
                break;
            case '0':
                uiManager.navigateTo('achievements');
                break;
            case '-':
                uiManager.navigateTo('history');
                break;
            case 'm':
            case 'M':
                audioSystem.toggle();
                uiManager.updateAudioUI();
                break;
            case 'Escape':
                if (!gameMenu.currentMenu) {
                    gameMenu.openMainMenu();
                }
                break;
        }
    });

    // Zodiac Match Page
    let selectedZodiac1 = null;
    let selectedZodiac2 = null;

    function renderZodiacGrid(gridId, onSelect) {
        const grid = document.getElementById(gridId);
        grid.innerHTML = '';
        
        ZodiacData.getAllSigns().forEach(sign => {
            const btn = document.createElement('div');
            btn.className = 'zodiac-sign-btn';
            btn.dataset.sign = sign.id;
            btn.innerHTML = `
                <span class="zodiac-sign-symbol">${sign.symbol}</span>
                <span class="zodiac-sign-name">${sign.name}</span>
            `;
            
            btn.addEventListener('click', () => {
                grid.querySelectorAll('.zodiac-sign-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                onSelect(sign.id);
                audioSystem.play('click');
            });
            
            grid.appendChild(btn);
        });
    }

    renderZodiacGrid('zodiac-grid-1', (id) => { selectedZodiac1 = id; });
    renderZodiacGrid('zodiac-grid-2', (id) => { selectedZodiac2 = id; });

    const btnAnalyzeZodiac = document.getElementById('btn-analyze-zodiac');
    if (btnAnalyzeZodiac) {
        btnAnalyzeZodiac.addEventListener('click', () => {
            if (!selectedZodiac1 || !selectedZodiac2) {
                uiManager.showMessage('请选择两个星座', 'warning');
                return;
            }
            
            if (selectedZodiac1 === selectedZodiac2) {
                uiManager.showMessage('请选择不同的星座', 'warning');
                return;
            }
            
            audioSystem.play('reveal');
            analyzeZodiacMatch(selectedZodiac1, selectedZodiac2);
        });
    }

    function analyzeZodiacMatch(sign1Id, sign2Id) {
        const result = ZodiacMatch.analyze(sign1Id, sign2Id);
        if (!result) return;
        
        const resultContainer = document.getElementById('zodiac-result');
        const soulReadingContainer = document.getElementById('zodiac-soul-reading');
        const emotionSceneContainer = document.getElementById('zodiac-emotion-scene');
        const dimensionsContainer = document.getElementById('zodiac-dimensions');
        const adviceContainer = document.getElementById('zodiac-advice');
        const elementNote = document.getElementById('zodiac-element-note');
        
        // Update match score
        const scoreFill = document.getElementById('zodiac-score-fill');
        const scoreValue = document.getElementById('zodiac-score-value');
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (result.matchScore / 100) * circumference;
        
        scoreFill.style.strokeDashoffset = offset;
        scoreValue.textContent = `${result.matchScore}%`;
        
        // Update title
        document.getElementById('zodiac-match-title').textContent = `${result.sign1.name} × ${result.sign2.name}`;
        document.getElementById('zodiac-match-subtitle').textContent = getMatchLevel(result.matchScore);
        
        // Render soul reading
        soulReadingContainer.innerHTML = `
            <h3 class="soul-reading-title">✦ 灵魂解读 ✦</h3>
            <div class="soul-reading-text">${formatSoulText(result.soulReading)}</div>
        `;
        
        // Render emotion scene
        emotionSceneContainer.innerHTML = `
            <h3 class="emotion-scene-title">🎬 恋爱画面</h3>
            <div class="emotion-scene-text">${formatSceneText(result.emotionScene)}</div>
        `;
        
        // Render dimensions
        dimensionsContainer.innerHTML = '';
        Object.values(result.dimensions).forEach((dim, index) => {
            const card = document.createElement('div');
            card.className = 'dimension-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="dimension-header">
                    <span class="dimension-title">${dim.title}</span>
                    <span class="dimension-score">${dim.score}%</span>
                </div>
                <div class="dimension-bar">
                    <div class="dimension-fill" data-width="${dim.score}"></div>
                </div>
                <p class="dimension-description">${dim.description}</p>
            `;
            dimensionsContainer.appendChild(card);
        });
        
        // Animate dimension bars
        setTimeout(() => {
            dimensionsContainer.querySelectorAll('.dimension-fill').forEach(fill => {
                fill.style.width = `${fill.dataset.width}%`;
            });
        }, 100);
        
        // Render advice
        adviceContainer.innerHTML = `
            <div class="advice-title">✦ 宇宙建议</div>
            <p class="advice-text">${result.advice}</p>
        `;
        
        // Render element note
        elementNote.textContent = result.elementNote || '';
        
        // Show result
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });
        
        audioSystem.play('success');

        if (API.isLoggedIn()) {
            API.companion.saveZodiac({
                zodiac_sign: sign1Id,
                zodiac_name: result.sign1.name
            }).then(() => API.companion.saveInsight({
                insight_type: 'zodiac_match',
                source: 'zodiac',
                headline: `${result.sign1.name} × ${result.sign2.name} 星座匹配`,
                content: `${result.soulReading}\n\n${result.emotionScene}\n\n${result.advice}`,
                meta: {
                    sign1: sign1Id,
                    sign2: sign2Id,
                    matchScore: result.matchScore
                }
            })).then(() => uiManager.refreshCompanionData())
              .catch((error) => console.error('Failed to archive zodiac match:', error));
        }
    }

    function getMatchLevel(score) {
        if (score >= 90) return '灵魂伴侣 · 星辰指引的相遇';
        if (score >= 80) return '天作之合 · 命运的安排';
        if (score >= 70) return '良缘佳配 · 需要用心经营';
        if (score >= 60) return '有缘之人 · 需要更多磨合';
        if (score >= 50) return '挑战组合 · 爱能跨越一切';
        return '虐恋情缘 · 相爱容易相处难';
    }

    function formatSoulText(text) {
        return text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
    }

    function formatSceneText(text) {
        return text.replace(/"([^"]+)"/g, '<span class="scene-quote">"$1"</span>');
    }

    // Initial render
    uiManager.renderCardSlots();

    // Trigger intro camera shot
    setTimeout(() => {
        camera.triggerShot('intro');
    }, 1000);

    // Camera update loop
    let lastTime = performance.now();
    function updateCamera(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        camera.update(deltaTime);
        
        requestAnimationFrame(updateCamera);
    }
    requestAnimationFrame(updateCamera);

    // Cosmic Portrait Page
    const btnGeneratePortrait = document.getElementById('btn-generate-portrait');
    if (btnGeneratePortrait) {
        btnGeneratePortrait.addEventListener('click', () => {
            const mbtiType = document.getElementById('mbti-select').value;
            const zodiacSign = document.getElementById('zodiac-select').value;

            if (!mbtiType || !zodiacSign) {
                uiManager.showMessage('请选择MBTI人格和星座', 'warning');
                return;
            }

            audioSystem.play('reveal');
            generateCosmicPortrait(mbtiType, zodiacSign);
        });
    }

    function generateCosmicPortrait(mbtiType, zodiacSign) {
        const portrait = CosmicPortrait.generate(mbtiType, zodiacSign);
        if (!portrait) return;

        const resultContainer = document.getElementById('cosmic-portrait-result');
        const sectionsContainer = document.getElementById('portrait-sections');
        const adviceContainer = document.getElementById('cosmic-advice');

        // Update header
        document.getElementById('portrait-archetype').textContent = portrait.mbti.archetype;
        document.getElementById('portrait-title').textContent = `${mbtiType} × ${ZodiacData.getSign(zodiacSign).name}`;

        // Render sections
        const sections = [
            { key: 'coreIdentity', title: '✦ 性格核心', icon: '🌟' },
            { key: 'emotionalPattern', title: '✦ 情绪模式', icon: '🌊' },
            { key: 'socialStyle', title: '✦ 社交方式', icon: '🤝' },
            { key: 'lovePhilosophy', title: '✦ 爱情观', icon: '💕' },
            { key: 'innerConflict', title: '✦ 内在矛盾', icon: '⚖️' },
            { key: 'healingPath', title: '✦ 情绪疗愈建议', icon: '🌿' },
            { key: 'soulSignature', title: '✦ 灵魂特征', icon: '✨' }
        ];

        sectionsContainer.innerHTML = '';
        sections.forEach((section, index) => {
            const div = document.createElement('div');
            div.className = 'portrait-section';
            div.style.animationDelay = `${index * 0.1}s`;
            div.innerHTML = `
                <h3 class="portrait-section-title">${section.icon} ${section.title}</h3>
                <div class="portrait-section-content">${portrait.integrated[section.key]}</div>
            `;
            sectionsContainer.appendChild(div);
        });

        // Render cosmic advice
        adviceContainer.innerHTML = `
            <h3 class="cosmic-advice-title">✦ 宇宙寄语 ✦</h3>
            <div class="cosmic-advice-text">${portrait.cosmicAdvice}</div>
        `;

        // Show result
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });

        audioSystem.play('success');

        if (API.isLoggedIn()) {
            const insightText = [
                portrait.integrated.coreIdentity,
                portrait.integrated.emotionalPattern,
                portrait.integrated.healingPath,
                portrait.cosmicAdvice
            ].join('\n\n');

            API.companion.updateProfile({
                mbti_type: mbtiType,
                zodiac_sign: zodiacSign,
                zodiac_name: ZodiacData.getSign(zodiacSign).name
            }).then(() => API.companion.saveInsight({
                insight_type: 'cosmic_portrait',
                source: 'cosmic-portrait',
                headline: `${mbtiType} × ${ZodiacData.getSign(zodiacSign).name} 宇宙画像`,
                content: insightText,
                meta: { mbtiType, zodiacSign }
            })).then(() => uiManager.refreshCompanionData())
              .catch((error) => console.error('Failed to archive cosmic portrait:', error));
        }
    }

    console.log('%c✦ Mystic Tarot AAA Edition Initialized ✦', 'color: #d4a843; font-size: 16px; font-weight: bold;');
    console.log('%cKeyboard shortcuts: 1-Home, 2-Divination, 3-Chat, 4-Healing, 5-MBTI, 6-Zodiac, 7-Cosmic, 8-Gallery, 9-Ranking, 0-Achievements, --History, M-Mute, ESC-Menu', 'color: #7b4fbf;');
}
