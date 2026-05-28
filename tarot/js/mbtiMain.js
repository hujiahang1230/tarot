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
    
    // 页面切换
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
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
            showPage('page-healing');
            document.getElementById('healing-subtitle').textContent = `${personality.type} - ${personality.name} 的专属空间`;
            healing.setPersonality(personality);
        }, 5000);
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
        showPage('page-welcome');
        particles.setMood('neutral');
    });
    
    // 鼠标光晕
    const cursorGlow = document.getElementById('cursor-glow');
    window.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
});
