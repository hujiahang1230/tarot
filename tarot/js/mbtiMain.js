/**
 * MBTI人格宇宙主程序
 * 整合测试、分析、疗愈、粒子系统
 */

document.addEventListener('DOMContentLoaded', () => {
    const particles = new MBTIParticles('mbti-canvas');
    const test = new MBTITest();
    const analysis = new MBTIAnalysis();
    const healing = new MBTIHealing();
    
    let currentPersonality = null;
    let currentPage = 'welcome';
    let latestProfile = null;
    
    // 页面切换
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const page = document.getElementById(pageId);
        if (!page) return;
        page.classList.add('active');
        currentPage = pageId;
    }
    
    // 开始旅程
    document.getElementById('btn-start-journey').addEventListener('click', () => {
        particles.setMood('calm');
        showPage('page-test');
        test.start(onProgress, onComplete);
    });
    
    // 测试进度
    function onProgress(current, total, progress, dimension) {
        const progressCircle = document.getElementById('test-progress');
        const progressText = document.getElementById('progress-text');
        const dimFill = document.getElementById('dim-fill');
        
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (progress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        progressText.textContent = `${current}/${total}`;
        
        particles.setProgress(progress / 100);
        particles.setDimension(dimension);
        
        const dimLabels = { EI: '外向/内向', SN: '感觉/直觉', TF: '思考/情感', JP: '判断/知觉' };
        document.querySelector('.dim-label').textContent = dimLabels[dimension]?.split('/')[0] || '';
        document.querySelectorAll('.dim-label')[1].textContent = dimLabels[dimension]?.split('/')[1] || '';
        
        dimFill.style.width = `${50 + (Math.random() - 0.5) * 20}%`;
    }
    
    // 测试完成
    function onComplete(result) {
        currentPersonality = analysis.analyze(result);
        particles.setMood('energy');
        
        showPage('page-analysis');
        displayAnalysis(currentPersonality);
    }
    
    // 显示分析结果
    function displayAnalysis(personality) {
        const typeBadge = document.getElementById('type-badge');
        const typeName = document.getElementById('type-name');
        const typeTitle = document.getElementById('type-title');
        const typeDesc = document.getElementById('type-description');
        
        typeBadge.textContent = personality.type;
        typeBadge.style.background = `linear-gradient(135deg, ${personality.color}, ${personality.color}88)`;
        typeName.textContent = `${personality.name}`;
        typeTitle.textContent = personality.title;
        typeDesc.textContent = personality.description;
        
        setTimeout(() => {
            const dims = personality.dimensions;
            document.getElementById('dim-EI').style.width = `${dims.EI.score * 100}%`;
            document.getElementById('dim-SN').style.width = `${dims.SN.score * 100}%`;
            document.getElementById('dim-TF').style.width = `${dims.TF.score * 100}%`;
            document.getElementById('dim-JP').style.width = `${dims.JP.score * 100}%`;
        }, 1000);
        
        setTimeout(() => {
            latestProfile = createPersonalityProfile(personality);
            renderProfile(latestProfile);
            showPage('page-profile');
        }, 4200);
    }

    function createPersonalityProfile(personality) {
        const dims = personality.dimensions;
        const type = personality.type;
        const isIntrovert = dims.EI.dominant === 'I';
        const isIntuitive = dims.SN.dominant === 'N';
        const isFeeling = dims.TF.dominant === 'F';
        const isJudging = dims.JP.dominant === 'J';
        const confidence = Object.values(dims).reduce((sum, dim) => sum + Math.abs(dim.score - 0.5), 0) / 4;
        const emotionScore = Math.round(72 + confidence * 42 + (isFeeling ? 5 : 0));
        const zodiac = getSavedZodiac();
        const keywords = [
            ...(personality.strengths || []).slice(0, 3),
            isIntrovert ? '内在宇宙' : '外放能量',
            isIntuitive ? '未来感知' : '现实锚点',
            isFeeling ? '情绪共振' : '理性校准'
        ];
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
        const badge = `${personality.element || '星尘'} · ${personality.title}`;
        const summary = `${type}「${personality.name}」像${personality.element || '一束星光'}一样拥有鲜明的精神底色。你的优势在于${(personality.strengths || keywords).slice(0, 2).join('、')}；当你把${growthTitle}作为下一阶段任务，会更容易把内在天赋转化成稳定的现实力量。`;

        return {
            type,
            name: personality.name,
            title: personality.title,
            color: personality.color,
            zodiac,
            keywords: [...new Set(keywords)].slice(0, 7),
            emotionScore: Math.min(96, emotionScore),
            social,
            socialDesc,
            decision,
            decisionDesc,
            growthTitle,
            growth,
            badge,
            summary,
            timeline: [
                { time: '01 / 测试完成', title: '人格核心定位', text: `识别为 ${type} ${personality.name}，主能量来自${personality.element || '深空星轨'}。` },
                { time: '02 / 星座并入', title: '星轨信息同步', text: `${zodiac} 已写入档案，用于后续情绪与关系画像。` },
                { time: '03 / AI画像生成', title: '关键词归档', text: `${[...new Set(keywords)].slice(0, 4).join('、')}成为本次画像的核心标签。` },
                { time: '04 / 成长任务', title: growthTitle, text: compactText(growth, 48) }
            ]
        };
    }

    function renderProfile(profile) {
        setText('profile-avatar', profile.type.slice(0, 2));
        setText('profile-name', profile.name);
        setText('profile-level', `LV. ${24 + profile.type.charCodeAt(0) % 12}`);
        setText('profile-badge', profile.badge);
        setText('profile-emotion-score', profile.emotionScore);
        setText('profile-social-score', profile.social.replace('型', ''));
        setText('profile-type', profile.type);
        setText('profile-type-name', profile.name);
        setText('profile-zodiac', profile.zodiac);
        setText('profile-emotion', `星云稳定 ${profile.emotionScore}%`);
        setText('profile-social', profile.social);
        setText('profile-social-desc', profile.socialDesc);
        setText('profile-decision', profile.decision);
        setText('profile-decision-desc', profile.decisionDesc);
        setText('profile-growth-title', profile.growthTitle);
        setText('profile-growth', compactText(profile.growth, 86));
        setText('profile-ai-summary', profile.summary);

        const avatar = document.getElementById('profile-avatar');
        if (avatar) {
            avatar.style.background = `radial-gradient(circle at 35% 25%, rgba(255,255,255,0.42), transparent 18%), linear-gradient(145deg, rgba(112,226,255,0.16), ${profile.color}, rgba(212,168,67,0.26))`;
        }

        const emotionBar = document.getElementById('profile-emotion-bar');
        if (emotionBar) emotionBar.style.width = `${profile.emotionScore}%`;

        const keywords = document.getElementById('profile-keywords');
        if (keywords) {
            keywords.innerHTML = profile.keywords.map(keyword => `<span>${keyword}</span>`).join('');
        }

        const timeline = document.getElementById('profile-timeline');
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

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function compactText(text, maxLength) {
        if (!text || text.length <= maxLength) return text || '';
        return `${text.slice(0, maxLength)}...`;
    }

    function getSavedZodiac() {
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

    function enterHealingSpace() {
        if (!currentPersonality) return;
        document.getElementById('healing-subtitle').textContent = `${currentPersonality.type} - ${currentPersonality.name} 的专属空间`;
        healing.setPersonality(currentPersonality);
        showPage('page-healing');
    }

    const btnEnterHealing = document.getElementById('btn-enter-healing');
    if (btnEnterHealing) {
        btnEnterHealing.addEventListener('click', enterHealingSpace);
    }
    
    // 疗愈选项
    document.querySelectorAll('.healing-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            document.querySelectorAll('.healing-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const chatArea = document.getElementById('healing-chat');
            const inputArea = document.getElementById('healing-input-area');
            chatArea.innerHTML = '';
            
            if (mode === 'emotion' || mode === 'companion') {
                inputArea.style.display = 'flex';
            } else {
                inputArea.style.display = 'none';
            }
            
            healing.startHealing(mode, (text, callback) => {
                addMessageToChat(text, 'companion', callback);
            });
        });
    });
    
    // 发送消息
    document.getElementById('healing-send').addEventListener('click', sendHealingMessage);
    document.getElementById('healing-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendHealingMessage();
    });
    
    function sendHealingMessage() {
        const input = document.getElementById('healing-input');
        const text = input.value.trim();
        if (!text) return;
        
        addMessageToChat(text, 'user');
        input.value = '';
        
        healing.handleUserMessage(text);
    }
    
    function addMessageToChat(text, type, callback) {
        const chatArea = document.getElementById('healing-chat');
        const msg = document.createElement('div');
        msg.className = `chat-message ${type}`;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        msg.appendChild(content);
        chatArea.appendChild(msg);
        
        typeText(content, text, callback);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    function typeText(element, text, callback) {
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
    
    // 返回按钮
    document.getElementById('btn-back-healing').addEventListener('click', () => {
        healing.stop();
        if (latestProfile) {
            showPage('page-profile');
            particles.setMood('energy');
        } else {
            showPage('page-welcome');
            particles.setMood('neutral');
        }
    });
    
    // 鼠标光晕
    const cursorGlow = document.getElementById('cursor-glow');
    window.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
});
