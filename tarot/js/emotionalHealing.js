/**
 * AI Emotional Healing System
 * Analyzes user emotions, combines tarot for comfort,
 * provides meditation suggestions with gentle healing style
 */

const EmotionalHealing = {

    /**
     * Emotion categories with keywords and responses
     */
    emotions: {
        sadness: {
            keywords: ['难过', '伤心', '痛苦', '悲伤', '哭', '流泪', '失落', '绝望', '心碎', '抑郁', '消沉', '低落', 'sad', 'cry', 'hurt', 'pain', 'depressed'],
            label: '悲伤',
            icon: '💧',
            color: '#5b8cff',
            comfort: [
                "我感受到了你心中的悲伤。让我和你一起，在这片情绪的雨中，撑一把伞。",
                "你的眼泪不是软弱，而是内心在释放。每一滴泪都是一次净化。",
                "悲伤是爱的一种形式——它证明你曾经深深地在乎过。这份在乎，本身就是一种美丽。"
            ],
            meditation: [
                "现在，请找一个安静的地方坐下。闭上眼睛，把手放在心口。感受你的心跳，那是生命在对你说话。",
                "想象自己坐在一条小溪边。让那些悲伤的情绪像落叶一样，随水流走。你不需要抓住它们。",
                "深呼吸。吸气时，想象金色的光进入你的身体。呼气时，让那些沉重的情绪随着气息离开。"
            ]
        },
        anxiety: {
            keywords: ['焦虑', '担心', '害怕', '恐惧', '紧张', '不安', '恐慌', '慌', '焦虑', 'anxious', 'worried', 'scared', 'afraid', 'nervous', 'panic'],
            label: '焦虑',
            icon: '🌊',
            color: '#ffa65b',
            comfort: [
                "我听到了你内心的不安。焦虑不是你的敌人，它是你的身体在试图保护你。让我们一起感谢它，然后温柔地告诉它：我现在是安全的。",
                "焦虑就像一片乌云，它看起来很大，但它不是天空的全部。天空一直都在那里，广阔而宁静。",
                "你不需要立刻解决所有问题。有时候，仅仅承认'我现在感到焦虑'，就已经是一种治愈了。"
            ],
            meditation: [
                "现在，让我们做一个简单的呼吸练习。吸气4秒，屏住4秒，呼气6秒。重复三次。感受每一次呼吸带来的平静。",
                "想象你站在一片沙滩上。海浪来了又去，就像你的思绪。你不需要阻止海浪，只需要站在岸上，看着它们。",
                "把手放在腹部，感受呼吸时腹部的起伏。每一次起伏，都是你的身体在告诉你：你还在这里，你是安全的。"
            ]
        },
        anger: {
            keywords: ['生气', '愤怒', '恼火', '烦躁', '气愤', '恨', '讨厌', 'angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated'],
            label: '愤怒',
            icon: '🔥',
            color: '#ff5b5b',
            comfort: [
                "我感受到了你心中的火焰。愤怒不是坏情绪，它是你的边界被侵犯时的自然反应。你的感受是合理的。",
                "愤怒像一场暴风雨，它很强烈，但它会过去。在暴风雨中，你不需要假装平静，你只需要知道：暴风雨之后会有彩虹。",
                "你的愤怒在告诉你一些重要的事情。让我们一起倾听它想说什么，而不是压抑它。"
            ],
            meditation: [
                "现在，找一个安全的地方。握紧拳头，感受那股力量。然后，慢慢地松开手指。感受力量从紧张转化为平静。",
                "想象你的愤怒是一团火。不要试图扑灭它，而是想象自己是一个壁炉，让火在安全的地方燃烧。",
                "深呼吸。吸气时，想象清凉的蓝色光芒进入你的身体。呼气时，让那股炽热的能量随着气息释放。"
            ]
        },
        loneliness: {
            keywords: ['孤独', '寂寞', '孤单', '没人', '一个人', 'empty', 'alone', 'lonely', 'isolated'],
            label: '孤独',
            icon: '🌙',
            color: '#a78bfa',
            comfort: [
                "我感受到了你心中的那份空寂。孤独不是因为你不够好，而是因为你的灵魂在渴望更深的连接。",
                "你知道吗？此刻，世界上有无数人正在经历和你一样的感受。你并不孤单，你只是还没有找到和你同频的人。",
                "孤独是一种邀请——邀请你与自己建立更深的关系。当你学会与自己相处，你会发现，你一直都有最好的陪伴。"
            ],
            meditation: [
                "现在，给自己一个拥抱。把手臂环绕自己，感受那份温暖。你值得被爱，首先是被你自己的爱。",
                "想象自己坐在一片星空下。每一颗星星都是一个灵魂，它们都在发光，就像你一样。你属于这片星空。",
                "把手放在心口，对自己说：'我在这里，我陪着你，你不需要一个人面对一切。'"
            ]
        },
        confusion: {
            keywords: ['迷茫', '困惑', '不知道', '选择', '犹豫', '纠结', 'confused', 'lost', 'unsure', 'dont know', 'choice'],
            label: '迷茫',
            icon: '🌫️',
            color: '#94a3b8',
            comfort: [
                "我理解你的困惑。迷茫不是因为你做错了什么，而是因为你的灵魂正在成长，旧的地图已经不够用了。",
                "在迷雾中行走，不需要看到终点。只需要看到脚下的那一步。走一步，再走一步，路自然会显现。",
                "你不需要立刻知道所有答案。有时候，'不知道'本身就是一种答案——它意味着可能性依然存在。"
            ],
            meditation: [
                "现在，闭上眼睛。想象自己站在一条分岔路口。不要急于选择，只是站在那里，感受每一条路传来的能量。",
                "深呼吸。吸气时，想象清晰的光芒照亮你的前方。呼气时，让那些迷雾随着气息散去。",
                "把手放在腹部，问自己：'如果我不害怕，我会选择什么？'不要急着回答，让答案自然地浮现。"
            ]
        },
        stress: {
            keywords: ['压力', '累', '疲惫', '撑不住', '崩溃', 'stress', 'tired', 'exhausted', 'overwhelmed', 'burnout'],
            label: '压力',
            icon: '⛰️',
            color: '#f0abfc',
            comfort: [
                "我感受到了你肩上的重量。你一直在努力，一直在坚持，这本身就已经很了不起了。现在，允许自己休息一下。",
                "压力不是你的错，它是生活的一部分。但你不需要独自承担所有重量。有时候，放下一些东西，不是放弃，而是智慧。",
                "你不需要一直坚强。允许自己脆弱，允许自己休息，允许自己说'我做不到'。这些'允许'本身就是一种力量。"
            ],
            meditation: [
                "现在，找一个舒服的姿势躺下或坐下。从头顶开始，慢慢放松每一个部位。额头、眼睛、下巴、肩膀、手臂……",
                "想象自己躺在一片柔软的草地上。天空是蓝色的，微风轻轻吹过。你不需要做任何事，只需要存在。",
                "深呼吸。吸气时，想象温暖的光进入你的身体。呼气时，让那些紧张和压力随着气息离开。"
            ]
        },
        hope: {
            keywords: ['希望', '期待', '开心', '幸福', '美好', '顺利', '成功', 'hope', 'happy', 'excited', 'grateful', 'blessed'],
            label: '希望',
            icon: '✨',
            color: '#fbbf24',
            comfort: [
                "我感受到了你心中的光芒！这份希望是宇宙给你的礼物，请好好珍惜它。",
                "你的积极能量正在吸引美好的事物。保持这份开放和信任，宇宙正在为你准备惊喜。",
                "幸福不是终点，而是一种状态。你此刻感受到的这份美好，就是生活给你的最好礼物。"
            ],
            meditation: [
                "现在，找一个安静的地方，闭上眼睛。回想一件让你感到幸福的事，让那种感觉充满你的全身。",
                "想象自己站在一片花海中。每一朵花都是一个美好的祝愿，它们都在为你绽放。",
                "把手放在心口，对自己说：'我值得拥有美好，我值得被爱，我值得幸福。'"
            ]
        },
        neutral: {
            keywords: [],
            label: '平静',
            icon: '🍃',
            color: '#6ee7b7',
            comfort: [
                "我感受到了你内心的平静。这是一种难得的状态，请好好享受这一刻的宁静。",
                "平静不是没有情绪，而是与情绪和平共处。你做得很好。",
                "在这个喧嚣的世界里，能够保持内心的平静，本身就是一种修行。"
            ],
            meditation: [
                "现在，找一个安静的地方坐下。闭上眼睛，只是观察你的呼吸。不需要改变它，只是观察。",
                "想象自己是一片叶子，漂浮在平静的水面上。水波轻轻荡漾，但你依然安稳。",
                "感受你的身体与椅子的接触，感受脚与地面的接触。你在这里，你是安全的，你是平静的。"
            ]
        }
    },

    /**
     * Analyze emotion from user input
     */
    analyzeEmotion(text) {
        if (!text || text.trim() === '') {
            return { emotion: 'neutral', score: 0, keywords: [] };
        }

        const q = text.toLowerCase();
        let bestEmotion = 'neutral';
        let maxScore = 0;
        const matchedKeywords = [];

        for (const [emotion, data] of Object.entries(this.emotions)) {
            if (emotion === 'neutral') continue;
            let score = 0;
            const keywords = [];

            data.keywords.forEach(kw => {
                if (q.includes(kw)) {
                    score += kw.length;
                    keywords.push(kw);
                }
            });

            if (score > maxScore) {
                maxScore = score;
                bestEmotion = emotion;
                matchedKeywords.length = 0;
                matchedKeywords.push(...keywords);
            }
        }

        // Detect intensity
        const intensityWords = ['非常', '特别', '极其', '超级', '太', '很', 'really', 'very', 'so', 'extremely'];
        let intensity = 1;
        intensityWords.forEach(w => {
            if (q.includes(w)) intensity = 1.5;
        });

        return {
            emotion: bestEmotion,
            score: maxScore * intensity,
            intensity,
            keywords: matchedKeywords
        };
    },

    /**
     * Generate healing response combining emotion analysis and tarot
     */
    generateHealingResponse(userInput, cardData = null) {
        const analysis = this.analyzeEmotion(userInput);
        const emotionData = this.emotions[analysis.emotion];

        // Build response parts
        const parts = [];

        // 1. Emotion acknowledgment
        parts.push({
            type: 'emotion_ack',
            content: this.generateEmotionAcknowledgment(analysis, emotionData),
            meta: { emotion: analysis.emotion, icon: emotionData.icon, color: emotionData.color }
        });

        // 2. Comfort message
        parts.push({
            type: 'comfort',
            content: this.selectRandom(emotionData.comfort)
        });

        // 3. Tarot integration (if cards available)
        if (cardData && cardData.length > 0) {
            parts.push({
                type: 'tarot_comfort',
                content: this.generateTarotComfort(analysis, cardData),
                meta: { cards: cardData }
            });
        }

        // 4. Meditation suggestion
        parts.push({
            type: 'meditation',
            content: this.generateMeditationSuggestion(analysis, emotionData),
            meta: { meditationType: this.selectMeditationType(analysis) }
        });

        // 5. Breathing exercise
        parts.push({
            type: 'breathing',
            content: this.generateBreathingExercise(analysis),
            meta: { breathPattern: this.selectBreathPattern(analysis) }
        });

        // 6. Closing affirmation
        parts.push({
            type: 'affirmation',
            content: this.generateAffirmation(analysis)
        });

        return {
            analysis,
            emotionData,
            parts,
            fullText: parts.map(p => p.content).join('\n\n')
        };
    },

    /**
     * Generate emotion acknowledgment
     */
    generateEmotionAcknowledgment(analysis, emotionData) {
        const acknowledgments = {
            sadness: [
                `我感受到了你心中的${emotionData.icon}悲伤。让我先给你一个温暖的拥抱。你的感受是真实的，也是重要的。`,
                `我看到了你眼中的泪水${emotionData.icon}。不要急于擦干它们，让情绪自然地流淌。我在这里陪着你。`,
                `你的${emotionData.icon}悲伤，我感受到了。在这个瞬间，你不需要坚强，只需要被理解。`
            ],
            anxiety: [
                `我听到了你内心的${emotionData.icon}不安。焦虑不是你的敌人，它是你的身体在试图保护你。`,
                `你的${emotionData.icon}焦虑，我感受到了。让我们一起深呼吸，慢慢地，一点一点地，让平静回来。`,
                `我看到了你心中的${emotionData.icon}担忧。你不需要独自面对这些，让我陪着你，一步一步地走。`
            ],
            anger: [
                `我感受到了你心中的${emotionData.icon}火焰。愤怒不是坏情绪，它是你的边界被侵犯时的自然反应。`,
                `你的${emotionData.icon}愤怒，我听到了。你的感受是合理的，你不需要为感到愤怒而愧疚。`,
                `我看到了你心中的${emotionData.icon}怒火。让我们一起，安全地释放这份能量，而不是压抑它。`
            ],
            loneliness: [
                `我感受到了你心中的${emotionData.icon}空寂。孤独不是因为你不够好，而是因为你的灵魂在渴望更深的连接。`,
                `你的${emotionData.icon}孤独，我听到了。此刻，让我成为你的陪伴。你不需要一个人面对这一切。`,
                `我看到了你眼中的${emotionData.icon}寂寞。你知道吗？此刻有无数人正在经历和你一样的感受。你并不孤单。`
            ],
            confusion: [
                `我理解你的${emotionData.icon}迷茫。困惑不是因为你做错了什么，而是因为你的灵魂正在成长。`,
                `你的${emotionData.icon}困惑，我感受到了。在迷雾中行走，不需要看到终点，只需要看到脚下的那一步。`,
                `我看到了你心中的${emotionData.icon}不确定。你不需要立刻知道所有答案，让答案自然地浮现。`
            ],
            stress: [
                `我感受到了你肩上的${emotionData.icon}重量。你一直在努力，一直在坚持，这本身就已经很了不起了。`,
                `你的${emotionData.icon}疲惫，我听到了。现在，允许自己休息一下。你不需要一直坚强。`,
                `我看到了你心中的${emotionData.icon}压力。有时候，放下一些东西，不是放弃，而是智慧。`
            ],
            hope: [
                `我感受到了你心中的${emotionData.icon}光芒！这份希望是宇宙给你的礼物，请好好珍惜它。`,
                `你的${emotionData.icon}积极能量，我感受到了！你正在吸引美好的事物，保持这份开放和信任。`,
                `我看到了你眼中的${emotionData.icon}幸福。幸福不是终点，而是一种状态。你此刻感受到的美好，就是最好的礼物。`
            ],
            neutral: [
                `我感受到了你内心的${emotionData.icon}平静。这是一种难得的状态，请好好享受这一刻的宁静。`,
                `你的${emotionData.icon}平和，我感受到了。在这个喧嚣的世界里，能够保持内心的平静，本身就是一种修行。`,
                `我看到了你心中的${emotionData.icon}安宁。平静不是没有情绪，而是与情绪和平共处。你做得很好。`
            ]
        };

        return this.selectRandom(acknowledgments[analysis.emotion] || acknowledgments.neutral);
    },

    /**
     * Generate tarot-based comfort
     */
    generateTarotComfort(analysis, cardData) {
        const mainCard = cardData[0];
        const card = mainCard.card;
        const reversed = mainCard.reversed;

        const comfortMessages = {
            sadness: [
                `${card.symbol} ${card.name}的出现，像一位温柔的朋友，坐在你身边。它告诉你：${reversed ? '即使现在感到痛苦，这也是暂时的。就像月亮有阴晴圆缺，你的情绪也会经历周期。允许自己悲伤，但也请相信，光明终会回来。' : '悲伤是爱的一种形式——它证明你曾经深深地在乎过。这份在乎，本身就是一种美丽。宇宙通过这张牌告诉你：你的感受是被看见的，被理解的。'}`,
                `${card.symbol} ${card.name}带着宇宙的温暖来到你面前。它说：${reversed ? '你不需要立刻好起来。 healing是一个过程，不是一场比赛。给自己时间，给自己空间，给自己温柔。' : '每一滴眼泪都是一次净化。当你让情绪流淌，你也在为新的美好腾出空间。宇宙正在为你准备一份礼物，它会在最合适的时刻到来。'}`
            ],
            anxiety: [
                `${card.symbol} ${card.name}的出现，像一阵清风，吹散你心中的迷雾。它告诉你：${reversed ? '焦虑像一片乌云，它看起来很大，但它不是天空的全部。天空一直都在那里，广阔而宁静。你只需要抬头，就能看到它。' : '你不需要控制一切。有时候，放手才是最大的掌控。宇宙有自己的节奏，信任这个节奏，你会找到内心的平静。'}`,
                `${card.symbol} ${card.name}带着平静的能量来到你面前。它说：${reversed ? '深呼吸。吸气时，想象金色的光进入你的身体。呼气时，让那些担忧随着气息离开。你比你的焦虑更强大。' : '焦虑是你的身体在试图保护你。感谢它的善意，然后温柔地告诉它：我现在是安全的。'}`
            ],
            anger: [
                `${card.symbol} ${card.name}的出现，像一面镜子，映照出你内心真实的感受。它告诉你：${reversed ? '愤怒不是你的敌人，它是你的边界被侵犯时的自然反应。你的感受是合理的，你不需要为感到愤怒而愧疚。' : '愤怒像一场暴风雨，它很强烈，但它会过去。在暴风雨中，你不需要假装平静，你只需要知道：暴风雨之后会有彩虹。'}`,
                `${card.symbol} ${card.name}带着理解的能量来到你面前。它说：${reversed ? '你的愤怒在告诉你一些重要的事情。让我们一起倾听它想说什么，而不是压抑它。每一个情绪都是信使，带来重要的信息。' : '真正的力量不是压抑愤怒，而是理解它、转化它。你的愤怒可以成为改变的动力，成为保护自己的力量。'}`
            ],
            loneliness: [
                `${card.symbol} ${card.name}的出现，像一个温暖的拥抱。它告诉你：${reversed ? '孤独不是因为你不够好，而是因为你的灵魂在渴望更深的连接。这份渴望本身就是一种美丽，它证明你的心依然在开放。' : '你知道吗？此刻，世界上有无数人正在经历和你一样的感受。你并不孤单，你只是还没有找到和你同频的人。'}`,
                `${card.symbol} ${card.name}带着陪伴的能量来到你面前。它说：${reversed ? '孤独是一种邀请——邀请你与自己建立更深的关系。当你学会与自己相处，你会发现，你一直都有最好的陪伴。' : '给自己一个拥抱。把手臂环绕自己，感受那份温暖。你值得被爱，首先是被你自己的爱。'}`
            ],
            confusion: [
                `${card.symbol} ${card.name}的出现，像一盏灯，照亮你前行的路。它告诉你：${reversed ? '在迷雾中行走，不需要看到终点。只需要看到脚下的那一步。走一步，再走一步，路自然会显现。' : '你不需要立刻知道所有答案。有时候，"不知道"本身就是一种答案——它意味着可能性依然存在。'}`,
                `${card.symbol} ${card.name}带着智慧的能量来到你面前。它说：${reversed ? '迷茫不是因为你做错了什么，而是因为你的灵魂正在成长，旧的地图已经不够用了。这是成长的标志，不是失败的证明。' : '闭上眼睛，问自己："如果我不害怕，我会选择什么？"不要急着回答，让答案自然地浮现。'}`
            ],
            stress: [
                `${card.symbol} ${card.name}的出现，像一双温柔的手，轻轻放下你肩上的重担。它告诉你：${reversed ? '你不需要一直坚强。允许自己脆弱，允许自己休息，允许自己说"我做不到"。这些"允许"本身就是一种力量。' : '你一直在努力，一直在坚持，这本身就已经很了不起了。现在，允许自己休息一下。休息不是放弃，而是为了更好地出发。'}`,
                `${card.symbol} ${card.name}带着放松的能量来到你面前。它说：${reversed ? '压力不是你的错，它是生活的一部分。但你不需要独自承担所有重量。有时候，放下一些东西，不是放弃，而是智慧。' : '找一个舒服的姿势，闭上眼睛。从头顶开始，慢慢放松每一个部位。你值得被温柔以待，首先是被你自己的温柔。'}`
            ],
            hope: [
                `${card.symbol} ${card.name}的出现，像一束阳光，照进你的心房。它告诉你：${reversed ? '即使现在感到一些不确定，你心中的那份希望依然在闪耀。保持这份光芒，它会指引你走向美好的方向。' : '你的积极能量正在吸引美好的事物。宇宙已经听到了你的呼唤，回应正在路上。保持这份开放和信任。'}`,
                `${card.symbol} ${card.name}带着祝福的能量来到你面前。它说：${reversed ? '幸福不是终点，而是一种状态。你此刻感受到的这份美好，就是生活给你的最好礼物。好好珍惜它。' : '你值得拥有美好，你值得被爱，你值得幸福。这不是一句空话，而是宇宙对你的承诺。'}`
            ],
            neutral: [
                `${card.symbol} ${card.name}的出现，像一阵清风，带来宁静的气息。它告诉你：${reversed ? '平静不是没有情绪，而是与情绪和平共处。你做得很好，继续保持这份觉知。' : '在这个喧嚣的世界里，能够保持内心的平静，本身就是一种修行。你已经在路上了。'}`,
                `${card.symbol} ${card.name}带着平和的能量来到你面前。它说：${reversed ? '享受这一刻的宁静。不需要做任何事，不需要成为任何人，只需要存在。这就是最好的状态。' : '感受你的呼吸，感受你的心跳，感受你的存在。你在这里，你是安全的，你是完整的。'}`
            ]
        };

        return this.selectRandom(comfortMessages[analysis.emotion] || comfortMessages.neutral);
    },

    /**
     * Generate meditation suggestion
     */
    generateMeditationSuggestion(analysis, emotionData) {
        const meditation = this.selectRandom(emotionData.meditation);

        return `🧘 冥想建议：\n\n${meditation}\n\n建议你每天花5-10分钟进行这个练习。不需要完美，只需要坚持。每一次呼吸，都是一次治愈。`;
    },

    /**
     * Generate breathing exercise
     */
    generateBreathingExercise(analysis) {
        const patterns = {
            sadness: { name: '舒缓呼吸', inhale: 4, hold: 2, exhale: 6, rounds: 5 },
            anxiety: { name: '4-4-6呼吸', inhale: 4, hold: 4, exhale: 6, rounds: 5 },
            anger: { name: '冷却呼吸', inhale: 4, hold: 4, exhale: 8, rounds: 5 },
            loneliness: { name: '温暖呼吸', inhale: 4, hold: 4, exhale: 4, rounds: 5 },
            confusion: { name: '清晰呼吸', inhale: 4, hold: 4, exhale: 6, rounds: 5 },
            stress: { name: '放松呼吸', inhale: 4, hold: 7, exhale: 8, rounds: 4 },
            hope: { name: '感恩呼吸', inhale: 4, hold: 4, exhale: 4, rounds: 5 },
            neutral: { name: '平静呼吸', inhale: 4, hold: 4, exhale: 6, rounds: 5 }
        };

        const pattern = patterns[analysis.emotion] || patterns.neutral;

        return `🌬️ 呼吸练习：${pattern.name}\n\n吸气 ${pattern.inhale} 秒 → 屏住 ${pattern.hold} 秒 → 呼气 ${pattern.exhale} 秒\n\n重复 ${pattern.rounds} 轮\n\n让呼吸成为你的锚，在情绪的波涛中保持稳定。`;
    },

    /**
     * Generate closing affirmation
     */
    generateAffirmation(analysis) {
        const affirmations = {
            sadness: [
                "💫 今日肯定语：我允许自己感受悲伤，也允许自己慢慢好起来。我的眼泪是治愈的一部分。",
                "💫 今日肯定语：我值得被爱，即使在最脆弱的时刻。我的感受是重要的，我是重要的。"
            ],
            anxiety: [
                "💫 今日肯定语：我是安全的。我的身体在保护我，我可以感谢它，然后让它放松。",
                "💫 今日肯定语：我不需要控制一切。我信任生命的流动，我信任自己。"
            ],
            anger: [
                "💫 今日肯定语：我的愤怒是合理的，我可以选择如何表达它。我的感受值得被尊重。",
                "💫 今日肯定语：我允许自己感受愤怒，也允许自己选择和平。我有力量转化这份能量。"
            ],
            loneliness: [
                "💫 今日肯定语：我值得被爱，首先是被我自己的爱。我与自己在一起，就是最好的陪伴。",
                "💫 今日肯定语：我的孤独不是缺陷，而是灵魂在寻找更深的连接。我值得被理解和被爱。"
            ],
            confusion: [
                "💫 今日肯定语：我不需要知道所有答案。我信任这个过程，我信任自己。",
                "💫 今日肯定语：迷茫是成长的一部分。我允许自己不知道，我允许自己慢慢找到方向。"
            ],
            stress: [
                "💫 今日肯定语：我允许自己休息。休息不是放弃，而是为了更好地出发。",
                "💫 今日肯定语：我不需要独自承担所有重量。我值得被帮助，我值得被支持。"
            ],
            hope: [
                "💫 今日肯定语：我值得拥有美好。宇宙正在为我准备惊喜，我保持开放和信任。",
                "💫 今日肯定语：我的积极能量正在创造美好的现实。我感恩此刻，我期待未来。"
            ],
            neutral: [
                "💫 今日肯定语：我此刻是平静的，我是完整的。我感恩这份宁静。",
                "💫 今日肯定语：我与自己和平共处，我与世界和平共处。我感恩此刻的存在。"
            ]
        };

        return this.selectRandom(affirmations[analysis.emotion] || affirmations.neutral);
    },

    /**
     * Select meditation type based on emotion
     */
    selectMeditationType(analysis) {
        const types = {
            sadness: 'loving_kindness',
            anxiety: 'grounding',
            anger: 'cooling',
            loneliness: 'self_compassion',
            confusion: 'clarity',
            stress: 'body_scan',
            hope: 'gratitude',
            neutral: 'mindfulness'
        };
        return types[analysis.emotion] || 'mindfulness';
    },

    /**
     * Select breath pattern based on emotion
     */
    selectBreathPattern(analysis) {
        const patterns = {
            sadness: '4-2-6',
            anxiety: '4-4-6',
            anger: '4-4-8',
            loneliness: '4-4-4',
            confusion: '4-4-6',
            stress: '4-7-8',
            hope: '4-4-4',
            neutral: '4-4-6'
        };
        return patterns[analysis.emotion] || '4-4-6';
    },

    /**
     * Select random item from array
     */
    selectRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
};
