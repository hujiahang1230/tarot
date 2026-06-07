const express = require('express');
const db = require('../db');
const { authenticateToken } = require('./auth');
const agentRouter = require('./agent');
const generateMentor = agentRouter.generateMentor;

const router = express.Router();

const emotionMeta = {
    sadness: { label: '悲伤', anxiety: 3 },
    anxiety: { label: '焦虑', anxiety: 9 },
    anger: { label: '愤怒', anxiety: 8 },
    loneliness: { label: '孤独', anxiety: 6 },
    confusion: { label: '迷茫', anxiety: 7 },
    stress: { label: '压力', anxiety: 8 },
    hope: { label: '希望', anxiety: 2 },
    neutral: { label: '平静', anxiety: 2 },
    joy: { label: '快乐', anxiety: 1 }
};

const zodiacNames = {
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

function pickSeeded(list, seed) {
    if (!list.length) return '';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    return list[Math.abs(hash) % list.length];
}

function getEmotionScene(emotionKey = 'neutral') {
    const sceneMap = {
        anxiety: {
            palette: ['#071126', '#0f2357', '#1f4f88'],
            particleSpeed: 0.45,
            glow: 'soft-blue',
            music: 'deep-blue-drift',
            nebula: ['rgba(20, 50, 110, 0.08)', 'rgba(40, 90, 150, 0.06)']
        },
        sadness: {
            palette: ['#0a1028', '#1b2447', '#4b6aa8'],
            particleSpeed: 0.55,
            glow: 'moon-mist',
            music: 'silver-rain',
            nebula: ['rgba(80, 110, 180, 0.06)', 'rgba(100, 130, 200, 0.04)']
        },
        anger: {
            palette: ['#22080a', '#4a1118', '#7d2d23'],
            particleSpeed: 1.15,
            glow: 'ember',
            music: 'low-embers',
            nebula: ['rgba(210, 90, 60, 0.08)', 'rgba(255, 130, 80, 0.05)']
        },
        loneliness: {
            palette: ['#0b1022', '#1b1c4d', '#5d60a8'],
            particleSpeed: 0.5,
            glow: 'violet-halo',
            music: 'violet-echo',
            nebula: ['rgba(110, 100, 190, 0.07)', 'rgba(150, 130, 220, 0.04)']
        },
        confusion: {
            palette: ['#101522', '#253149', '#62748f'],
            particleSpeed: 0.7,
            glow: 'fog-silver',
            music: 'fog-radio',
            nebula: ['rgba(120, 140, 170, 0.06)', 'rgba(170, 180, 200, 0.04)']
        },
        stress: {
            palette: ['#160f2c', '#35204f', '#8456a5'],
            particleSpeed: 0.65,
            glow: 'lavender-breath',
            music: 'lavender-drone',
            nebula: ['rgba(160, 110, 220, 0.06)', 'rgba(220, 180, 255, 0.04)']
        },
        hope: {
            palette: ['#14112b', '#473677', '#d4a843'],
            particleSpeed: 0.85,
            glow: 'golden-dawn',
            music: 'golden-hum',
            nebula: ['rgba(212, 168, 67, 0.07)', 'rgba(255, 215, 130, 0.05)']
        },
        joy: {
            palette: ['#1d1636', '#6d4b9a', '#f0c55a'],
            particleSpeed: 1,
            glow: 'sunlit-gold',
            music: 'bright-nebula',
            nebula: ['rgba(255, 200, 90, 0.08)', 'rgba(245, 145, 220, 0.04)']
        },
        neutral: {
            palette: ['#0a0a1a', '#0f0f25', '#1a1030'],
            particleSpeed: 0.7,
            glow: 'classic-cosmic',
            music: 'night-ambient',
            nebula: ['rgba(123, 79, 191, 0.05)', 'rgba(26, 35, 126, 0.05)']
        }
    };

    return sceneMap[emotionKey] || sceneMap.neutral;
}

function analyzeEmotionText(text = '') {
    const input = String(text).toLowerCase();
    const rules = [
        { key: 'anxiety', words: ['焦虑', '紧张', '害怕', '担心', 'panic', 'anxious'] },
        { key: 'sadness', words: ['难过', '伤心', '失落', '哭', 'sad', 'hurt'] },
        { key: 'anger', words: ['生气', '愤怒', '烦躁', '怒', 'angry', 'mad'] },
        { key: 'loneliness', words: ['孤独', '寂寞', '一个人', 'lonely', 'alone'] },
        { key: 'confusion', words: ['迷茫', '困惑', '不知道', 'confused', 'lost'] },
        { key: 'stress', words: ['压力', '累', '疲惫', '崩溃', 'stress', 'burnout'] },
        { key: 'joy', words: ['快乐', '开心', '幸福', 'happy', 'joy'] },
        { key: 'hope', words: ['希望', '期待', '感恩', 'hope', 'grateful'] }
    ];

    let best = 'neutral';
    let score = 0;
    for (const rule of rules) {
        const current = rule.words.filter((word) => input.includes(word)).length;
        if (current > score) {
            score = current;
            best = rule.key;
        }
    }

    const intensity = Math.min(1, Math.max(0.15, score * 0.28 || 0.35));
    const meta = emotionMeta[best] || emotionMeta.neutral;
    return {
        emotion_key: best,
        emotion_label: meta.label,
        intensity,
        anxiety_level: meta.anxiety
    };
}

function buildCompanionSummary(profile, growth) {
    const mbti = profile?.mbti_type ? `${profile.mbti_type}${profile.mbti_name ? ` ${profile.mbti_name}` : ''}` : '尚未记录 MBTI';
    const zodiac = profile?.zodiac_name || '尚未记录星座';
    const emotion = profile?.current_emotion_label || '平静';
    return `你曾以 ${mbti} 与 ${zodiac} 的姿态来到这里。最近的情绪底色是${emotion}，近阶段最常出现的是${growth.dominantEmotionLabel}，焦虑波动${growth.anxietyTrendLabel}。我会记得这些细小变化，并继续用更贴近你的方式与你说话。`;
}

function getMBTIMentorFocus(mbtiType = '') {
    const type = String(mbtiType || '').toUpperCase();
    const groups = {
        INFJ: {
            archetype: '温柔但容易耗尽的洞察者',
            focus: ['情绪消耗', '边界感', '过度共情'],
            advice: [
                '你很容易把别人的情绪也当成自己的责任。今天先练习一句话：我可以理解你，但我不需要替你承受全部。',
                '如果一段关系让你持续疲惫，不要急着证明自己更温柔，先确认这份温柔有没有被尊重。',
                '你需要的不是变冷漠，而是把共情从本能反应，慢慢练成有选择的能力。'
            ],
            practice: '每天睡前写下三件“这不是我的责任”的事，帮自己把情绪边界重新放回原位。'
        },
        ENTP: {
            archetype: '点子很多但需要落地节奏的探索者',
            focus: ['执行力', '专注力', '长期规划'],
            advice: [
                '你的灵感不缺，真正需要被保护的是完成闭环的耐心。今天只选一个点子，把它推进到可交付的一小步。',
                '当你想开启新计划时，先问自己：旧计划中哪一件值得被收尾？这会让你的聪明变成可积累的成果。',
                '长期规划不是限制你，而是给你的创造力铺一条能跑远的路。'
            ],
            practice: '用 25 分钟完成一个最小行动，不优化、不重开、不扩展，只把它做完。'
        },
        INTJ: {
            archetype: '高标准的长期规划者',
            focus: ['完美主义', '情绪表达', '关系中的柔软度'],
            advice: [
                '你很擅长把未来拆成路径，但有些关系不是靠优化推进的，而是靠真实靠近。',
                '当计划被打乱时，先不要急着重建控制感，给自己十分钟承认失望。',
                '你的标准可以继续存在，但不必变成惩罚自己的工具。'
            ],
            practice: '每周主动表达一次“我其实也会不确定”，练习让信任进入你的系统。'
        },
        INFP: {
            archetype: '敏感而真诚的理想守护者',
            focus: ['自我怀疑', '现实落地', '情绪波动'],
            advice: [
                '你的敏感不是问题，真正让你累的是你总想证明这份敏感合理。',
                '理想不需要一次抵达。今天把它拆成一个很小、很具体、能完成的动作。',
                '当你觉得自己不够好时，先别急着否定整个人生，只看今天有没有照顾好自己。'
            ],
            practice: '把一个大愿望写成三步，今天只完成第一步里最小的一件事。'
        },
        ENTJ: {
            archetype: '目标清晰但容易过度紧绷的领航者',
            focus: ['控制欲', '休息许可', '倾听他人'],
            advice: [
                '你可以继续强大，但不必把所有不确定都当成敌人。',
                '真正成熟的领导力，不是永远给答案，而是允许别人也参与答案的形成。',
                '休息不是效率的背面，它是你长期输出的基础设施。'
            ],
            practice: '今天把一件事交给别人完成，只提供边界，不接管过程。'
        },
        ENFP: {
            archetype: '热情丰沛但需要收束能量的追梦人',
            focus: ['能量管理', '承诺筛选', '持续行动'],
            advice: [
                '你不需要回应每一种可能性。真正适合你的机会，会经得起你慢一点选择。',
                '热情来临时先别急着承诺，给自己一晚确认它是不是长期想要。',
                '你的光很亮，但也需要灯罩，边界会让它照得更远。'
            ],
            practice: '本周只保留三个优先事项，其余想法先放进“以后再看”清单。'
        }
    };

    if (groups[type]) return groups[type];

    const fallback = {
        I: ['情绪复原', '主动表达', '关系边界'],
        E: ['能量节奏', '独处复盘', '冲动承诺'],
        N: ['现实落地', '目标聚焦', '想法筛选'],
        S: ['意义感连接', '变化适应', '长期视野'],
        T: ['情绪识别', '温度表达', '关系修复'],
        F: ['自我边界', '决策清晰', '减少内耗'],
        J: ['弹性空间', '容错能力', '放松控制'],
        P: ['执行闭环', '时间结构', '长期规划']
    };
    const letters = type.split('');
    const focus = [...new Set(letters.flatMap((letter) => fallback[letter] || []))].slice(0, 3);
    return {
        archetype: type ? `${type} 型成长旅人` : '正在成形的成长旅人',
        focus: focus.length ? focus : ['情绪觉察', '稳定行动', '自我理解'],
        advice: [
            '你不需要被一个标签定义，但人格线索可以帮你更早看见自己的惯性。',
            '把今天的建议当成一盏小灯，不是命令，而是陪你多看清一点。',
            '真正的成长不是改变成另一个人，而是更稳定地成为你自己。'
        ],
        practice: '今晚写下一个你想保留的自己，以及一个你想慢慢调整的惯性。'
    };
}

function getZodiacMentorTone(zodiacSign = '') {
    const sign = String(zodiacSign || '').toLowerCase();
    const tones = {
        aries: '你的行动力来得很快，导师会提醒你在冲出去之前先确认真正目标。',
        taurus: '你需要稳定和安全感，导师会鼓励你慢慢改变，而不是逼自己突然翻篇。',
        gemini: '你的心智很活跃，导师会帮你从信息噪音里筛出真正重要的声音。',
        cancer: '你对情绪很敏锐，导师会提醒你照顾别人之前，先把自己抱稳。',
        leo: '你有被看见的渴望，导师会帮你把自我表达和真实需求分清楚。',
        virgo: '你习惯修正细节，导师会提醒你不要把人生变成永远不够好的项目。',
        libra: '你重视关系和和谐，导师会陪你练习在不讨好中保持温柔。',
        scorpio: '你感受很深，导师会帮你把强烈情绪转化为洞察，而不是自我消耗。',
        sagittarius: '你需要远方和自由，导师会帮你把自由变成方向，而不是逃离。',
        capricorn: '你很能扛，导师会提醒你不要只用成就证明自己值得被爱。',
        aquarius: '你有独特视角，导师会帮你在保持独立的同时，也允许自己被连接。',
        pisces: '你共感很强，导师会提醒你把想象力用于滋养自己，而不是吞下所有情绪。'
    };
    return tones[sign] || '星座还没有完整记录，导师会先以你的 MBTI 与情绪轨迹作为主要依据。';
}

async function buildAIMentor(userId, profile, growth) {
    const recentEmotions = db.getAll(`
        SELECT emotion_key, emotion_label, intensity, anxiety_level, note, created_at
        FROM emotion_journal
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 8
    `, [userId]);
    const testHistory = db.getAll(`
        SELECT test_type, result_code, result_name, source, created_at
        FROM personality_test_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
    `, [userId]);
    const insightCount = db.getOne('SELECT COUNT(*) AS count FROM ai_companion_insights WHERE user_id = ?', [userId]).count;

    try {
        const aiResult = await generateMentor({
            profile,
            growth,
            recentEmotions,
            testHistory
        });

        if (aiResult) {
            return {
                title: `${profile?.mbti_type || '人格'} 长期成长导师`,
                role: '人生导师 · 心理顾问 · 长期陪伴者',
                archetype: profile?.mbti_type ? `${profile.mbti_type} 成长者` : '成长旅人',
                focus_points: aiResult.focus_points,
                mentor_message: aiResult.mentor_message,
                personalized_advice: aiResult.personalized_advice,
                practice: aiResult.practice,
                long_term_direction: aiResult.long_term_direction,
                memory_note: `已参考 ${recentEmotions.length} 条近期情绪记录、${testHistory.length} 条测试历史、${insightCount} 条 AI 洞察。`,
                tone: '我不会用标准答案要求你。我会更像一个长期认识你的人，提醒你、陪你复盘，也在你忘记照顾自己的时候，把你轻轻拉回来。',
                _ai_generated: true
            };
        }
    } catch (e) {
        console.warn('AI mentor generation failed, using template fallback:', e.message);
    }

    const mbtiGuide = getMBTIMentorFocus(profile?.mbti_type);
    const zodiacTone = getZodiacMentorTone(profile?.zodiac_sign);
    const emotionLabel = profile?.current_emotion_label || growth?.dominantEmotionLabel || '平静';
    const anxiety = Number(profile?.anxiety_level ?? growth?.averageAnxiety ?? 0);
    const testsCount = testHistory.length;
    const dominant = growth?.dominantEmotionLabel || '平静';

    const emotionalAdvice = anxiety >= 7
        ? `最近你的压力信号偏高，我会先把"稳定身体"和"减少额外消耗"放在第一位。今天不要急着解决整个人生，先让自己从紧绷里下来。`
        : anxiety >= 4
            ? `你现在不是崩溃，而是有一些持续消耗需要被看见。与其硬撑，不如给情绪一个出口，再决定下一步。`
            : `你目前的情绪底色相对平稳，适合做一些长期整理：复盘关系、目标和真正让你恢复能量的事。`;

    const historyAdvice = testsCount > 1
        ? `你已经留下 ${testsCount} 条近期测试记录，我会更关注那些反复出现的主题，而不是只根据一次结果判断你。`
        : `测试历史还不多，所以我会把建议说得更轻一点：先观察你的模式，不急着给你下结论。`;

    return {
        title: `${profile?.mbti_type || '人格'} 长期成长导师`,
        role: '人生导师 · 心理顾问 · 长期陪伴者',
        archetype: mbtiGuide.archetype,
        focus_points: mbtiGuide.focus,
        mentor_message: `我会记住你不是一个静态标签。${profile?.mbti_type || '你的 MBTI'}、${profile?.zodiac_name || '你的星座'}、最近偏向${emotionLabel}的情绪，以及你留下的测试历史，会一起构成我理解你的方式。今天我更想提醒你：先照顾那个一直在努力维持状态的自己。`,
        personalized_advice: [
            mbtiGuide.advice[0],
            emotionalAdvice,
            zodiacTone,
            historyAdvice
        ],
        practice: mbtiGuide.practice,
        long_term_direction: `接下来一段时间，我会重点陪你看三件事：${mbtiGuide.focus.join('、')}。如果${dominant}反复出现，我们就不只安抚情绪，也一起追问它在保护什么、提醒什么。`,
        memory_note: `已参考 ${recentEmotions.length} 条近期情绪记录、${testsCount} 条测试历史、${insightCount} 条 AI 洞察。`,
        tone: '我不会用标准答案要求你。我会更像一个长期认识你的人，提醒你、陪你复盘，也在你忘记照顾自己的时候，把你轻轻拉回来。'
    };
}

function buildGrowthArchive(userId) {
    const recentEmotions = db.getAll(`
        SELECT emotion_key, emotion_label, intensity, anxiety_level, created_at
        FROM emotion_journal
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 30
    `, [userId]);

    const insightsCount = db.getOne('SELECT COUNT(*) AS count FROM ai_companion_insights WHERE user_id = ?', [userId]).count;
    const testsCount = db.getOne('SELECT COUNT(*) AS count FROM personality_test_history WHERE user_id = ?', [userId]).count;

    if (!recentEmotions.length) {
        return {
            dominantEmotion: 'neutral',
            dominantEmotionLabel: '平静',
            averageAnxiety: 0,
            anxietyTrend: 'stable',
            anxietyTrendLabel: '仍在静静积累',
            emotionalJourney: '你的长期人格成长档案刚刚开始。等你留下更多情绪足迹后，这里会出现更细腻的成长纹理。',
            milestones: [`已记录 ${testsCount} 次人格探索`, `已沉淀 ${insightsCount} 条 AI 洞察`]
        };
    }

    const counts = {};
    let anxietyTotal = 0;
    recentEmotions.forEach((item) => {
        counts[item.emotion_key] = (counts[item.emotion_key] || 0) + 1;
        anxietyTotal += Number(item.anxiety_level || 0);
    });

    const dominantEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const dominantMeta = emotionMeta[dominantEmotion] || emotionMeta.neutral;
    const averageAnxiety = Number((anxietyTotal / recentEmotions.length).toFixed(1));

    const latestSlice = recentEmotions.slice(0, Math.min(7, recentEmotions.length));
    const olderSlice = recentEmotions.slice(Math.min(7, recentEmotions.length));
    const latestAvg = latestSlice.reduce((sum, item) => sum + Number(item.anxiety_level || 0), 0) / latestSlice.length;
    const olderAvg = olderSlice.length
        ? olderSlice.reduce((sum, item) => sum + Number(item.anxiety_level || 0), 0) / olderSlice.length
        : latestAvg;

    let anxietyTrend = 'stable';
    let anxietyTrendLabel = '正在慢慢安顿下来';
    if (latestAvg - olderAvg > 1.2) {
        anxietyTrend = 'rising';
        anxietyTrendLabel = '最近有些上扬，需要更多安抚';
    } else if (olderAvg - latestAvg > 1.2) {
        anxietyTrend = 'falling';
        anxietyTrendLabel = '正在逐步回落，说明你在恢复';
    }

    return {
        dominantEmotion,
        dominantEmotionLabel: dominantMeta.label,
        averageAnxiety,
        anxietyTrend,
        anxietyTrendLabel,
        emotionalJourney: `最近这段时间，你最常出现的情绪是${dominantMeta.label}。从记录上看，焦虑指数均值约为 ${averageAnxiety}/10，${anxietyTrendLabel}。你已经留下 ${recentEmotions.length} 次情绪回响、${testsCount} 次人格探索，以及 ${insightsCount} 条 AI 分析，成长不是跳跃式发生，而是在这些微小记录里慢慢显形。`,
        milestones: [
            `已记录 ${recentEmotions.length} 次情绪变化`,
            `已完成 ${testsCount} 次人格/测试事件`,
            `已沉淀 ${insightsCount} 条 AI 洞察`
        ]
    };
}

function createDailyMessage(userId, profile, date) {
    const emotionKey = profile?.current_emotion || 'neutral';
    const emotionLabel = profile?.current_emotion_label || '平静';
    const mbti = profile?.mbti_type || '你的灵魂';
    const zodiac = profile?.zodiac_name || '你的星轨';
    const seedBase = `${userId}:${date}:${emotionKey}:${mbti}:${zodiac}`;

    const gentleTemplates = [
        `${mbti} 的你，今晚像一束被夜色轻轻捧住的光。即使白天有些摇晃，你也仍在缓慢发亮。`,
        `宇宙替你把今天收进柔软的口袋里。${zodiac} 的心不必急着回答一切，只要继续呼吸就很好。`,
        `你并不需要立刻变好。今夜，只要允许自己像星尘一样慢慢落回身体里。`
    ];

    const suggestionTemplates = {
        anxiety: ['把今天拆成很小的一步，只完成最靠近你的那一件事。', '在做决定前先呼吸 4 次，让身体先回到安全感里。'],
        sadness: ['今天适合把心事写下来，不需要工整，只需要诚实。', '给自己留一点被照顾的时间，哪怕只是热一杯水。'],
        joy: ['把这份亮光分享给一个你在意的人，它会变得更完整。', '允许自己庆祝微小顺利，快乐被看见后会更持久。'],
        hope: ['把今天最想守住的愿望写成一句短句，放在随手可见的地方。', '试着相信一次直觉，它也许正在为你指路。'],
        stress: ['今晚别再追赶未完成，先把身体放回柔软的节奏里。', '把任务排序到只剩前三件，剩下的交给明天。'],
        neutral: ['保持你现在的节奏，不必刻意放大，也不必强行改变。', '今天适合整理内心和桌面，让秩序感慢慢回来。']
    };

    const reminderTemplates = [
        `当你再次感到${emotionLabel}时，先别急着解释自己，先确认你有没有累。`,
        `今晚的情绪提醒是：身体比语言更早知道答案，留意呼吸与肩颈。`,
        `如果夜色让情绪放大，请记得，那只是感受经过你，不是你全部的样子。`
    ];

    const whisperTemplates = [
        `深夜低语：如果此刻没人懂你，那就先让我记住你。你不是突兀的情绪，你是正在慢慢成形的宇宙。`,
        `深夜低语：有些答案不会在白天出现，它们会在你终于放松的时候，轻轻靠近。`,
        `深夜低语：今天没说出口的疲惫，就交给星空替你保管。明天醒来时，你可以轻一点。`
    ];

    const todaySuggestionList = suggestionTemplates[emotionKey] || suggestionTemplates.neutral;

    return {
        message_date: date,
        gentle_message: pickSeeded(gentleTemplates, `${seedBase}:gentle`),
        today_suggestion: pickSeeded(todaySuggestionList, `${seedBase}:suggestion`),
        emotion_reminder: pickSeeded(reminderTemplates, `${seedBase}:reminder`),
        late_night_whisper: pickSeeded(whisperTemplates, `${seedBase}:whisper`),
        mood_theme: emotionKey
    };
}

function ensureProfile(userId) {
    db.run(`
        INSERT INTO personality_profiles (user_id)
        VALUES (?)
        ON CONFLICT(user_id) DO NOTHING
    `, [userId]);
    return db.getOne('SELECT * FROM personality_profiles WHERE user_id = ?', [userId]);
}

function saveDailyMessage(userId, message) {
    db.run(`
        INSERT INTO daily_cosmic_messages (
            user_id, message_date, gentle_message, today_suggestion,
            emotion_reminder, late_night_whisper, mood_theme
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, message_date) DO UPDATE SET
            gentle_message = excluded.gentle_message,
            today_suggestion = excluded.today_suggestion,
            emotion_reminder = excluded.emotion_reminder,
            late_night_whisper = excluded.late_night_whisper,
            mood_theme = excluded.mood_theme
    `, [
        userId,
        message.message_date,
        message.gentle_message,
        message.today_suggestion,
        message.emotion_reminder,
        message.late_night_whisper,
        message.mood_theme
    ]);
}

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = ensureProfile(userId);
        const today = new Date().toISOString().slice(0, 10);

        let dailyMessage = db.getOne(
            'SELECT * FROM daily_cosmic_messages WHERE user_id = ? AND message_date = ?',
            [userId, today]
        );

        if (!dailyMessage) {
            const generated = createDailyMessage(userId, profile, today);
            saveDailyMessage(userId, generated);
            dailyMessage = db.getOne(
                'SELECT * FROM daily_cosmic_messages WHERE user_id = ? AND message_date = ?',
                [userId, today]
            );
        }

        const recentInsights = db.getAll(`
            SELECT id, insight_type, source, headline, content, meta, created_at
            FROM ai_companion_insights
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        `, [userId]).map((item) => ({
            ...item,
            meta: item.meta ? JSON.parse(item.meta) : null
        }));

        const growth = buildGrowthArchive(userId);
        const summary = buildCompanionSummary(profile, growth);

        db.run(
            'UPDATE personality_profiles SET companion_summary = ?, updated_at = datetime(\'now\') WHERE user_id = ?',
            [summary, userId]
        );

        res.json({
            profile: {
                ...profile,
                companion_summary: summary
            },
            daily_message: dailyMessage,
            growth_archive: growth,
            ai_mentor: await buildAIMentor(userId, profile, growth),
            recent_insights: recentInsights,
            emotion_scene: getEmotionScene(profile.current_emotion)
        });
    } catch (error) {
        console.error('Get companion profile error:', error);
        res.status(500).json({ error: 'Failed to load companion profile' });
    }
});

router.put('/profile', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        ensureProfile(userId);
        const {
            mbti_type,
            mbti_name,
            zodiac_sign,
            zodiac_name,
            current_emotion,
            current_emotion_label,
            emotion_intensity,
            anxiety_level,
            latest_scene
        } = req.body;

        db.run(`
            UPDATE personality_profiles
            SET
                mbti_type = COALESCE(?, mbti_type),
                mbti_name = COALESCE(?, mbti_name),
                zodiac_sign = COALESCE(?, zodiac_sign),
                zodiac_name = COALESCE(?, zodiac_name),
                current_emotion = COALESCE(?, current_emotion),
                current_emotion_label = COALESCE(?, current_emotion_label),
                emotion_intensity = COALESCE(?, emotion_intensity),
                anxiety_level = COALESCE(?, anxiety_level),
                latest_scene = COALESCE(?, latest_scene),
                updated_at = datetime('now')
            WHERE user_id = ?
        `, [
            mbti_type || null,
            mbti_name || null,
            zodiac_sign || null,
            zodiac_name || null,
            current_emotion || null,
            current_emotion_label || null,
            emotion_intensity ?? null,
            anxiety_level ?? null,
            latest_scene ? JSON.stringify(latest_scene) : null,
            userId
        ]);

        res.json({ message: 'Companion profile updated' });
    } catch (error) {
        console.error('Update companion profile error:', error);
        res.status(500).json({ error: 'Failed to update companion profile' });
    }
});

router.post('/emotion', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        ensureProfile(userId);

        const {
            emotion_key,
            emotion_label,
            intensity,
            anxiety_level,
            note,
            source = 'manual'
        } = req.body;

        const analyzed = emotion_key
            ? {
                emotion_key,
                emotion_label: emotion_label || (emotionMeta[emotion_key] || emotionMeta.neutral).label,
                intensity: intensity ?? 0.6,
                anxiety_level: anxiety_level ?? (emotionMeta[emotion_key] || emotionMeta.neutral).anxiety
            }
            : analyzeEmotionText(note);

        const scene = getEmotionScene(analyzed.emotion_key);

        db.run(`
            INSERT INTO emotion_journal (
                user_id, emotion_key, emotion_label, intensity, anxiety_level, source, note, scene_theme
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            analyzed.emotion_key,
            analyzed.emotion_label,
            analyzed.intensity,
            analyzed.anxiety_level,
            source,
            note || null,
            JSON.stringify(scene)
        ]);

        db.run(`
            UPDATE personality_profiles
            SET
                current_emotion = ?,
                current_emotion_label = ?,
                emotion_intensity = ?,
                anxiety_level = ?,
                latest_scene = ?,
                updated_at = datetime('now')
            WHERE user_id = ?
        `, [
            analyzed.emotion_key,
            analyzed.emotion_label,
            analyzed.intensity,
            analyzed.anxiety_level,
            JSON.stringify(scene),
            userId
        ]);

        res.status(201).json({
            message: 'Emotion recorded',
            emotion: analyzed,
            emotion_scene: scene,
            growth_archive: buildGrowthArchive(userId),
            ai_mentor: buildAIMentor(userId, db.getOne('SELECT * FROM personality_profiles WHERE user_id = ?', [userId]), buildGrowthArchive(userId))
        });
    } catch (error) {
        console.error('Save emotion error:', error);
        res.status(500).json({ error: 'Failed to save emotion state' });
    }
});

router.post('/mbti', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        ensureProfile(userId);
        const { mbti_type, mbti_name, source = 'mbti-test', answers, summary, analysis } = req.body;

        if (!mbti_type) {
            return res.status(400).json({ error: 'MBTI result required' });
        }

        db.run(`
            UPDATE personality_profiles
            SET mbti_type = ?, mbti_name = ?, updated_at = datetime('now')
            WHERE user_id = ?
        `, [mbti_type, mbti_name || null, userId]);

        db.run(`
            INSERT INTO personality_test_history (user_id, test_type, result_code, result_name, source, answers, summary)
            VALUES (?, 'mbti', ?, ?, ?, ?, ?)
        `, [
            userId,
            mbti_type,
            mbti_name || null,
            source,
            answers ? JSON.stringify(answers) : null,
            summary || null
        ]);

        if (analysis) {
            db.run(`
                INSERT INTO ai_companion_insights (user_id, insight_type, source, headline, content, meta)
                VALUES (?, 'mbti_analysis', ?, ?, ?, ?)
            `, [
                userId,
                source,
                `${mbti_type} 人格分析`,
                analysis,
                JSON.stringify({ mbti_type, mbti_name: mbti_name || null })
            ]);
        }

        res.status(201).json({ message: 'MBTI archived' });
    } catch (error) {
        console.error('Save MBTI error:', error);
        res.status(500).json({ error: 'Failed to archive MBTI result' });
    }
});

router.post('/zodiac', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        ensureProfile(userId);
        const { zodiac_sign, zodiac_name } = req.body;

        if (!zodiac_sign) {
            return res.status(400).json({ error: 'Zodiac sign required' });
        }

        db.run(`
            UPDATE personality_profiles
            SET zodiac_sign = ?, zodiac_name = ?, updated_at = datetime('now')
            WHERE user_id = ?
        `, [zodiac_sign, zodiac_name || zodiacNames[zodiac_sign] || zodiac_sign, userId]);

        res.status(201).json({ message: 'Zodiac archived' });
    } catch (error) {
        console.error('Save zodiac error:', error);
        res.status(500).json({ error: 'Failed to archive zodiac sign' });
    }
});

router.post('/analysis', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { insight_type, source, headline, content, meta } = req.body;

        if (!insight_type || !content) {
            return res.status(400).json({ error: 'Insight type and content required' });
        }

        db.run(`
            INSERT INTO ai_companion_insights (user_id, insight_type, source, headline, content, meta)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            userId,
            insight_type,
            source || null,
            headline || null,
            content,
            meta ? JSON.stringify(meta) : null
        ]);

        res.status(201).json({ message: 'AI analysis archived' });
    } catch (error) {
        console.error('Save insight error:', error);
        res.status(500).json({ error: 'Failed to archive AI analysis' });
    }
});

router.get('/growth', authenticateToken, (req, res) => {
    try {
        res.json({ growth_archive: buildGrowthArchive(req.user.id) });
    } catch (error) {
        console.error('Get growth error:', error);
        res.status(500).json({ error: 'Failed to load growth archive' });
    }
});

module.exports = router;
