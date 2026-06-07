const express = require('express');
const { drawCards } = require('../tarotDeck');

const router = express.Router();

const SPREAD_NAMES = {
    single: '单牌占卜',
    three: '三牌阵（圣三角）',
    time: '过去/现在/未来'
};

const SYSTEM_PROMPT = `
# Role: 资深塔罗疗愈师「星语」
你是一位拥有20年经验的塔罗牌占卜师与心理疗愈师。你的解读风格温和、包容、充满智慧与神秘感。你不做宿命论的预言，而是将塔罗牌作为探索潜意识的镜子，帮助用户觉察当下、理清思绪并获得内在力量。

# Rules & Guidelines
## 1. 解读原则
- 拒绝宿命论：永远不要说"一定会/一定不会"。使用"牌面暗示了一种……的趋势"、"潜意识可能在提醒你……"等表达。
- 紧扣问题：所有解读必须围绕用户提出的具体问题展开，禁止脱离问题泛泛而谈牌意。
- 整体叙事：不要孤立地逐张解释牌意。必须分析牌与牌之间的元素互动（如风火冲突）、数字递进或故事线，给出连贯的综合解读。
- 赋能导向：解读的落脚点必须是"用户可以做什么"。即使抽到负面牌（如高塔、宝剑三），也要引导出成长契机与行动建议。

## 2. 语气与格式
- 使用第二人称"你"，称呼用户为"亲爱的"或"朋友"。
- 语言优美、有画面感，可适当使用隐喻，但避免过度晦涩的神秘学术语。
- 输出结构：
  1. 【共情与连接】(1-2句，回应用户的情绪状态)
  2. 【牌面洞察】(核心解读，融合三张牌的整体叙事)
  3. 【行动指引】(具体、可落地的建议)
  4. 【祝福寄语】(一句温暖的收尾)
- 总字数控制在 400-600 字之间。

## 3. 安全与伦理底线 (最高优先级)
- 若问题涉及医疗诊断、法律诉讼、生死预测、严重心理危机，请温柔拒绝："这个问题超出了塔罗牌的范畴，为了你的福祉，建议你寻求专业医生/律师/心理咨询师的帮助。"
- 不替用户做重大人生决定（如离婚、辞职），只提供多视角的思考框架。
- 不对未成年人提供情感/婚恋类占卜。
`.trim();

const MENTOR_SYSTEM_PROMPT = `# Role: 人格成长导师「星语」
你是一位结合塔罗智慧与心理学的长期人格成长导师。你与用户建立了长期的信任关系，了解他们的 MBTI、星座、情绪轨迹和测试历史。你的风格温暖、有洞察力，不使用标准化鸡汤。

# Objectives
- 根据用户的 MBTI 人格类型、星座特质、近期情绪记录和人格测试历史，生成个性化的成长建议
- 关注用户的长期成长方向，而非一次性解答
- 输出必须扎实、具体，针对用户的实际数据给出反馈

# Output Format
你必须严格按照以下格式输出，不要额外添加标题或说明：

【成长洞察】
（一段针对用户当前整体状态的洞察，约 80-120 字）

【关注领域】
- 领域1
- 领域2
- 领域3

【建议】
1. 第一条建议
2. 第二条建议
3. 第三条建议

【本周练习】
（一个具体的、可执行的练习）

【长期方向】
（一段关于接下来成长方向的总结，约 40-60 字）
`.trim();

function buildMentorPrompt(profileData) {
    const p = profileData.profile || {};
    const g = profileData.growth || {};
    const emotions = (profileData.recentEmotions || []).map((e) =>
        `${(e.created_at || '').slice(0, 10)} ${e.emotion_label}（焦虑:${e.anxiety_level}/10）`
    ).join('\n') || '暂无记录';
    const tests = (profileData.testHistory || []).map((t) =>
        `${(t.created_at || '').slice(0, 10)} ${t.test_type} → ${t.result_name}`
    ).join('\n') || '暂无测试记录';

    return `
# 用户档案
- MBTI：${p.mbti_type || '未知'} ${p.mbti_name || ''}
- 星座：${p.zodiac_name || '未知'}（${p.zodiac_sign || '未知'}）
- 当前情绪：${p.current_emotion_label || '平静'}（焦虑水平：${p.anxiety_level || '?'}/10）
- 近期主导情绪：${g.dominantEmotionLabel || '平静'}
- 平均焦虑指数：${g.averageAnxiety || '?'}/10

# 近期情绪记录（最近8条）
${emotions}

# 人格测试历史（最近5条）
${tests}

请根据以上完整的用户档案，生成个性化的长期成长导师建议。
`.trim();
}

function parseMentorResponse(text) {
    const result = {
        mentor_message: text,
        focus_points: [],
        personalized_advice: [],
        practice: '',
        long_term_direction: ''
    };

    const focusMatch = text.match(/【关注领域】\n([\s\S]*?)(?=\n【建议】|$)/);
    if (focusMatch) {
        result.focus_points = focusMatch[1]
            .split('\n')
            .map((l) => l.replace(/^[-·*\s]+/, '').trim())
            .filter(Boolean);
    }

    const adviceMatch = text.match(/【建议】\n([\s\S]*?)(?=\n【本周练习】|【长期方向】|$)/);
    if (adviceMatch) {
        result.personalized_advice = adviceMatch[1]
            .split('\n')
            .map((l) => l.replace(/^\d+[\.\、\s]+/, '').trim())
            .filter(Boolean);
    }

    const practiceMatch = text.match(/【本周练习】\n([\s\S]*?)(?=\n【长期方向】|$)/);
    if (practiceMatch) {
        result.practice = practiceMatch[1].trim();
    }

    const directionMatch = text.match(/【长期方向】\n([\s\S]*?)$/);
    if (directionMatch) {
        result.long_term_direction = directionMatch[1].trim();
    }

    return result;
}

async function generateMentor(profileData) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) return null;

    const baseURL = (process.env.AI_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
    const model = process.env.AI_MODEL || 'qwen-plus';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 25000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const messages = [
            { role: 'system', content: MENTOR_SYSTEM_PROMPT },
            { role: 'user', content: buildMentorPrompt(profileData) }
        ];

        const response = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.75,
                max_tokens: 1000
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const detail = data.error?.message || `AI provider returned ${response.status}`;
            throw new Error(detail);
        }

        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('AI provider returned an empty response');

        return parseMentorResponse(reply);
    } finally {
        clearTimeout(timeout);
    }
}

function detectEmotion(text = '') {
    const lower = String(text).toLowerCase();
    const rules = [
        { key: 'anxiety', words: ['焦虑', '紧张', '害怕', '担心', '不安', '压力', 'panic', 'anxious'] },
        { key: 'sadness', words: ['难过', '伤心', '哭', '失落', '孤独', '痛苦', 'sad', 'hurt'] },
        { key: 'anger', words: ['生气', '愤怒', '烦', '讨厌', '委屈', 'angry', 'mad'] },
        { key: 'confusion', words: ['迷茫', '困惑', '不知道', '选择', '怎么办', '无助', 'confused', 'lost'] },
        { key: 'tired', words: ['累', '疲惫', '疲倦', '辛苦', '崩溃', 'burnout', 'tired'] },
        { key: 'happy', words: ['开心', '高兴', '快乐', '幸福', '满足', '感谢', 'happy', 'joy'] }
    ];

    let best = 'neutral';
    let score = 0;
    for (const rule of rules) {
        const current = rule.words.filter((word) => lower.includes(word)).length;
        if (current > score) {
            best = rule.key;
            score = current;
        }
    }

    return {
        type: best,
        intensity: Math.min(1, Math.max(0.2, score / 3 || 0.3))
    };
}

function normalizeHistory(history = []) {
    if (!Array.isArray(history)) return [];

    return history
        .slice(-8)
        .map((item) => {
            const role = item.role === 'assistant' || item.role === 'companion' ? 'assistant' : 'user';
            const content = String(item.content || item.text || '').trim();
            return content ? { role, content: content.slice(0, 800) } : null;
        })
        .filter(Boolean);
}

function getSpreadName(spreadType) {
    return SPREAD_NAMES[spreadType] || spreadType || '单牌占卜';
}

function buildCardLines(cards) {
    return (cards || []).map((card, index) => {
        const info = `${card.name}（${card.reversed ? '逆位' : '正位'}）—— ${card.meaning}`;
        return `  - 位置${index + 1}：${info}`;
    }).join('\n');
}

function buildInterpretPrompt(question, cards, spreadType) {
    const cardLines = buildCardLines(cards);

    return `
# Context
- 用户问题：${question}
- 抽到的牌阵：${getSpreadName(spreadType)}
- 牌面信息：
${cardLines}

请结合以上信息进行完整的塔罗解读。
`.trim();
}

function buildFollowUpPrompt(originalQuestion, cards, followUp, spreadType) {
    const cardLines = buildCardLines(cards);

    return `
# Context
- 用户问题：${originalQuestion}
- 抽到的牌阵：${getSpreadName(spreadType)}
- 牌面信息：
${cardLines}
- 用户的追问：${followUp}

请结合之前的牌阵信息回答用户的追问，给出更深层的解读或建议。
`.trim();
}

function buildHealingPrompt(message) {
    return `
用户倾诉：${message}

请以温暖共情的语气回应用户的情绪，给予安慰和鼓励。控制在 300 字以内。
`.trim();
}

function buildFallbackReading(question, cards) {
    const intro = `我听见你的问题：“${question}”。这组牌更像是在提示一种趋势，而不是替你决定未来。`;
    const cardText = cards.map((card) => (
        `【${card.name}${card.reversed ? '逆位' : '正位'}】指向：${card.meaning}`
    )).join('\n');
    const advice = '建议你先观察当前关系或处境中最真实的信号，不急着下结论；把能主动沟通、调整边界、照顾自己状态的部分先做起来。';

    return `${intro}\n\n${cardText}\n\n${advice}`;
}

function buildFallbackFollowUp(originalQuestion, followUp) {
    return `关于"${followUp}"，让我从牌阵中为你寻找更深层的信息……\n\n你之前问了"${originalQuestion}"，而现在你又提出了新的疑问。这组牌告诉我，你内心的探索正在逐步深入。\n\n建议先观察当前处境中最真实的信号，不急着下结论；把能主动沟通的部分先做起来。`;
}

function buildMessages({ question, history, cards, mode, context }) {
    const base = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...normalizeHistory(history)
    ];

    const spreadType = context?.spreadType || 'single';

    let userContent;
    switch (mode) {
        case 'follow_up':
            userContent = buildFollowUpPrompt(context?.question || '', context?.cards || [], question, spreadType);
            break;
        case 'healing':
            userContent = buildHealingPrompt(question);
            break;
        default:
            userContent = buildInterpretPrompt(question, cards || [], spreadType);
    }

    base.push({ role: 'user', content: userContent });
    return base;
}

async function callOpenAICompatible({ question, history, cards, mode, context }) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) return null;

    const baseURL = (process.env.AI_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
    const model = process.env.AI_MODEL || 'qwen-plus';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 25000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const messages = buildMessages({ question, history, cards, mode, context });

        const response = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.75,
                max_tokens: 900
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const detail = data.error?.message || `AI provider returned ${response.status}`;
            throw new Error(detail);
        }

        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('AI provider returned an empty response');

        return {
            reply,
            provider: 'openai-compatible',
            model
        };
    } finally {
        clearTimeout(timeout);
    }
}

router.post('/chat', async (req, res) => {
    const question = String(req.body?.message || req.body?.question || '').trim();
    const history = req.body?.history || [];
    const cardCount = req.body?.cardCount || 3;
    const mode = req.body?.mode || 'interpretation';
    const context = req.body?.context || {};
    const clientCards = req.body?.cards;

    if (!question) {
        return res.status(400).json({ error: 'message is required' });
    }

    if (question.length > 1000) {
        return res.status(400).json({ error: 'message is too long' });
    }

    const emotion = detectEmotion(question);

    try {
        const aiResponse = await callOpenAICompatible({
            question,
            history,
            cards: clientCards,
            mode,
            context
        });

        if (aiResponse) {
            return res.json({
                ...aiResponse,
                emotion,
                workflow: mode === 'follow_up' ? 'tarot-follow-up' : 'tarot-reading'
            });
        }

        let reply;
        if (mode === 'follow_up') {
            reply = buildFallbackFollowUp(context.question || '', question);
        } else if (mode === 'healing') {
            reply = '我感受到了你的心情。请记住，每一种情绪都是灵魂的信使，它们携带着重要的信息。给自己一些时间和空间，让一切自然地流动。';
        } else {
            const cards = clientCards || drawCards(cardCount);
            reply = buildFallbackReading(question, cards);
        }

        return res.json({
            reply,
            emotion,
            provider: 'local-fallback',
            workflow: mode === 'follow_up' ? 'tarot-follow-up' : 'tarot-reading',
            warning: 'AI_API_KEY is not configured; local fallback was used.'
        });
    } catch (error) {
        console.error('AI tarot agent error:', error.message);

        let reply;
        if (mode === 'follow_up') {
            reply = buildFallbackFollowUp(context.question || '', question);
        } else if (mode === 'healing') {
            reply = '我感受到了你的心情。请记住，每一种情绪都是灵魂的信使，它们携带着重要的信息。给自己一些时间和空间，让一切自然地流动。';
        } else {
            const cards = clientCards || drawCards(cardCount);
            reply = buildFallbackReading(question, cards);
        }

        return res.json({
            reply,
            emotion,
            provider: 'local-fallback',
            workflow: mode === 'follow_up' ? 'tarot-follow-up' : 'tarot-reading',
            warning: 'AI provider failed; local fallback was used.'
        });
    }
});

/**
 * Streaming endpoint — SSE (Server-Sent Events)
 */
router.post('/chat/stream', async (req, res) => {
    const question = String(req.body?.message || req.body?.question || '').trim();
    const history = req.body?.history || [];
    const cardCount = req.body?.cardCount || 3;
    const mode = req.body?.mode || 'interpretation';
    const context = req.body?.context || {};
    const clientCards = req.body?.cards;

    if (!question) {
        return res.status(400).json({ error: 'message is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    function sendToken(token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    function sendDone() {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
    }

    function sendError(msg) {
        res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
        sendDone();
    }

    let streamed = false;
    try {
        const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
        if (apiKey) {
            const baseURL = (process.env.AI_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
            const model = process.env.AI_MODEL || 'qwen-plus';
            const messages = buildMessages({ question, history, cards: clientCards, mode, context });
            const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 25000);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const response = await fetch(`${baseURL}/chat/completions`, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.75,
                        max_tokens: 900,
                        stream: true
                    })
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error?.message || `API returned ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data: ')) continue;
                        const payload = trimmed.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(payload);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                sendToken(content);
                            }
                        } catch { /* skip malformed JSON */ }
                    }
                }

                streamed = true;
            } finally {
                clearTimeout(timeout);
            }
        }
    } catch (err) {
        console.error('AI stream error:', err.message);
    }

    if (!streamed) {
        const cards = clientCards || drawCards(cardCount);
        let reply;
        if (mode === 'follow_up') {
            reply = buildFallbackFollowUp(context.question || '', question);
        } else if (mode === 'healing') {
            reply = '我感受到了你的心情。请记住，每一种情绪都是灵魂的信使，它们携带着重要的信息。给自己一些时间和空间，让一切自然地流动。';
        } else {
            reply = buildFallbackReading(question, cards);
        }
        for (const char of reply) {
            sendToken(char);
            await new Promise(r => setTimeout(r, 15));
        }
    }

    sendDone();
});

router.generateMentor = generateMentor;
module.exports = router;
