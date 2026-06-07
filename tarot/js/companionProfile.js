const CompanionProfile = {
    zodiacNames: {
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
    },

    emotionOptions: [
        { key: 'joy', label: '快乐', icon: '✨' },
        { key: 'hope', label: '有希望', icon: '🌙' },
        { key: 'neutral', label: '平静', icon: '🌌' },
        { key: 'anxiety', label: '焦虑', icon: '💭' },
        { key: 'stress', label: '压力大', icon: '🌫️' },
        { key: 'sadness', label: '难过', icon: '💧' },
        { key: 'loneliness', label: '孤独', icon: '🫧' }
    ],

    getZodiacName(sign) {
        return this.zodiacNames[sign] || sign || '';
    },

    createProfileSnapshot(companionData) {
        if (!companionData?.profile) return null;
        const { profile, growth_archive: growth } = companionData;
        return {
            mbti_type: profile.mbti_type || null,
            zodiac_sign: profile.zodiac_sign || null,
            current_emotion: profile.current_emotion || 'neutral',
            current_emotion_label: profile.current_emotion_label || '平静',
            dominant_emotion: growth?.dominantEmotion || 'neutral',
            anxiety_trend: growth?.anxietyTrend || 'stable'
        };
    },

    buildReadingCompanionNote(companionData, question = '') {
        if (!companionData?.profile) return '';
        const profile = companionData.profile;
        const growth = companionData.growth_archive;
        const mbti = profile.mbti_type || '你';
        const zodiac = profile.zodiac_name || '你的星轨';
        const emotion = profile.current_emotion_label || '平静';
        const focus = question ? `这次你带着“${question}”靠近我。` : '这次你又回到了熟悉的星空里。';
        return `${focus}${mbti} 与 ${zodiac} 的底色仍在你身上，最近的情绪波纹偏向${emotion}。我会带着这些记忆，给你更贴近此刻的回应。${growth?.anxietyTrendLabel || ''}`;
    },

    renderHomeDashboard(companionData, username = '旅人') {
        const profile = companionData?.profile || {};
        const daily = companionData?.daily_message || {};
        const growth = companionData?.growth_archive || {};
        const mentor = companionData?.ai_mentor || {};
        const currentEmotion = profile.current_emotion || 'neutral';

        const emotionButtons = this.emotionOptions.map((item) => `
            <button class="emotion-chip ${item.key === currentEmotion ? 'active' : ''}" data-emotion="${item.key}" type="button">
                <span>${item.icon}</span>
                <span>${item.label}</span>
            </button>
        `).join('');

        const profileLine = [
            profile.mbti_type ? `${profile.mbti_type}${profile.mbti_name ? ` · ${profile.mbti_name}` : ''}` : 'MBTI 待记录',
            profile.zodiac_name || '星座待记录',
            profile.current_emotion_label ? `此刻：${profile.current_emotion_label}` : '此刻：平静'
        ].join(' · ');

        const mentorFocus = (mentor.focus_points || ['情绪觉察', '稳定行动', '自我理解']).map((item) => `<span>${item}</span>`).join('');
        const mentorAdvice = (mentor.personalized_advice || ['我会先陪你看见最近真正消耗你的地方，再一起把下一步变小。'])
            .slice(0, 4)
            .map((item) => `<li>${item}</li>`)
            .join('');

        return `
            <div class="companion-dashboard">
                <section class="companion-card profile-card">
                    <div class="card-kicker">人格档案</div>
                    <h3 class="card-title">欢迎回来，${username}</h3>
                    <p class="card-copy">${profile.companion_summary || '你的长期陪伴档案正在缓慢成形。'}</p>
                    <div class="profile-pills">
                        <span class="profile-pill">${profileLine}</span>
                    </div>
                    <div class="emotion-panel">
                        <div class="emotion-panel-title">今夜心情</div>
                        <div class="emotion-chip-row">${emotionButtons}</div>
                    </div>
                </section>
                <section class="companion-card daily-card">
                    <div class="card-kicker">每日宇宙消息</div>
                    <h3 class="card-title">今夜的温柔频道</h3>
                    <p class="daily-line">${daily.gentle_message || '宇宙还在整理今天的光。'}</p>
                    <div class="daily-grid">
                        <div class="daily-item">
                            <span class="daily-label">今日建议</span>
                            <p>${daily.today_suggestion || '慢一点，也是一种前进。'}</p>
                        </div>
                        <div class="daily-item">
                            <span class="daily-label">情绪提醒</span>
                            <p>${daily.emotion_reminder || '先照看身体，再解释情绪。'}</p>
                        </div>
                        <div class="daily-item full">
                            <span class="daily-label">深夜低语</span>
                            <p>${daily.late_night_whisper || '夜色会替你保管那些没说出口的话。'}</p>
                        </div>
                    </div>
                </section>
                <section class="companion-card mentor-card">
                    <div class="card-kicker">AI 人格导师</div>
                    <h3 class="card-title">${mentor.title || '你的长期成长导师'}</h3>
                    <p class="mentor-role">${mentor.role || '人生导师 · 心理顾问 · 长期陪伴者'}</p>
                    <p class="mentor-message">${mentor.mentor_message || '我会根据你的 MBTI、星座、情绪记录和测试历史，慢慢学会更贴近你的表达方式。'}</p>
                    <div class="mentor-focus-row">${mentorFocus}</div>
                    <ul class="mentor-advice-list">${mentorAdvice}</ul>
                    <div class="mentor-practice">
                        <span class="daily-label">本周练习</span>
                        <p>${mentor.practice || '写下一个你想保留的自己，以及一个你想慢慢调整的惯性。'}</p>
                    </div>
                    <p class="mentor-memory">${mentor.memory_note || '导师记忆正在积累中。'}</p>
                </section>
                <section class="companion-card growth-card">
                    <div class="card-kicker">长期人格成长档案</div>
                    <h3 class="card-title">成长不是突变，是被记录下来的微光</h3>
                    <p class="card-copy">${growth.emotionalJourney || '你的成长轨迹正在等待更多星屑。'}</p>
                    <div class="growth-metrics">
                        <div class="growth-metric">
                            <span class="metric-value">${growth.dominantEmotionLabel || '平静'}</span>
                            <span class="metric-label">高频情绪</span>
                        </div>
                        <div class="growth-metric">
                            <span class="metric-value">${growth.averageAnxiety ?? 0}/10</span>
                            <span class="metric-label">焦虑均值</span>
                        </div>
                        <div class="growth-metric">
                            <span class="metric-value">${growth.anxietyTrendLabel || '稳定'}</span>
                            <span class="metric-label">最近趋势</span>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }
};
