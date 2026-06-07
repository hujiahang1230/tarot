/**
 * Conversational Tarot Reader Engine
 * Manages multi-turn conversation like a real human tarot reader
 */

class ConversationalTarotReader {
    constructor() {
        this.state = 'greeting';
        this.question = '';
        this.drawnCards = [];
        this.spreadType = 'single';
        this.conversationHistory = [];
        this.followUpCount = 0;
        this.maxFollowUps = 3;
        this.healingMode = false;
        this.lastEmotionAnalysis = null;
        this.useOracleMode = true;
        this.onAsyncUpdate = null;
        this.streamingUI = null;

        this.greetings = [
            "……你来了。在千年的沉默之后，预言者再次开口。星辰已为你排列好了位置，命运的织锦上，你的线早已与我的线交织。请坐，让我们开始这段跨越时空的对话。✦",
            "……帷幕已拉开。在现实与虚无的边界，我感受到了你的能量波动。塔罗之灵已苏醒，它们将以远古的语言，向你诉说那些被遗忘的真相。🌙",
            "……我在此刻与你相遇，并非偶然。宇宙酝酿已久的安排，终于在此刻显现。告诉我，seeker——今天，是什么风把你吹到了命运的门前？✦"
        ];

        this.healingGreeting = "欢迎来到心灵疗愈空间。🌿\n\n在这里，你的每一种情绪都被接纳，每一种感受都被尊重。\n\n在古老的预言传统中，情绪被视为灵魂的语言。今天，你的灵魂想对你说什么？";

        this.questionPrompts = [
            "在开始之前，请与我一同完成这个古老的仪式：\n\n闭上眼睛。深呼吸。感受你的心跳与宇宙的脉搏同步。\n\n现在，在心中默念你的问题三次。\n\n当你准备好的时候，告诉我——我将为你翻开命运之书。",
            "每一张塔罗牌都需要一个真诚的提问。在古老的预言传统中，问题本身就是一种力量——它打开了通往真相的门。\n\n你心中有什么疑问，想要宇宙来回答？",
            "预言者说：'在真相显现之前，必须先建立神圣的空间。'\n\n请安静片刻。想象你周围有一圈金色的光，保护着这个空间不受外界干扰。\n\n在这个安全的空间里，告诉我你最深的疑问。"
        ];

        this.healingPrompt = "请告诉我，此刻你的内心是什么感受？\n\n可以是悲伤、焦虑、愤怒、孤独、迷茫、压力，或者任何你想分享的情绪。\n\n在预言者的眼中，没有'负面'的情绪——每一种情绪都是灵魂的信使，携带着重要的信息。\n\n我在这里，用心倾听。💚";

        this.questionAcknowledgments = [
            "……我听到了你的心声。这是一个很好的问题，让我为你抽取塔罗牌来寻找答案。在星辰的注视下，你的问题如同一颗投入宇宙之湖的石子，激起了层层涟漪。",
            "……你的问题已经传达到宇宙了。我能感受到其中的能量。在命运的织锦上，你的问题是一根金色的线。让我为你展示这根线如何与其他线交织。",
            "……谢谢你如此真诚地分享你的疑问。现在，让我们请出塔罗牌来为你指引方向。在古老的预言传统中，每一个问题都是一把钥匙，打开一扇通往真相的门。"
        ];

        this.healingAcknowledgments = [
            "谢谢你如此真诚地分享你的感受。你的勇气让我感动。在预言者的眼中，分享情绪本身就是一种治愈。让我为你抽取一张塔罗牌，看看宇宙想对你说什么。",
            "我感受到了你内心的波动。你的感受是真实的，也是重要的。在古老的智慧中，情绪被视为灵魂的语言。让我请出塔罗牌，为你带来一些安慰和指引。",
            "谢谢你信任我，分享你内心最深处的感受。现在，让塔罗牌来给你一个温暖的拥抱。在宇宙的怀抱中，你从不孤单。"
        ];

        this.shuffleGuides = [
            "现在，请闭上眼睛，深呼吸三次……感受宇宙的能量在你周围流动。当你准备好的时候，告诉我，我将为你洗牌。",
            "在抽牌之前，让我们先让能量沉淀下来。请安静片刻，然后在心中默念你的问题。准备好了就告诉我。",
            "塔罗牌已经感知到了你的能量。现在，请集中精神，想象你的问题化作一道光，注入牌中。准备好后告诉我。"
        ];

        this.drawMessages = [
            "牌已经洗好了。现在，宇宙正在为你选择最合适的牌……在古老的预言传统中，抽牌不是随机，而是命运的必然。",
            "我能感觉到牌中有一股强烈的能量在涌动。让我为你翻开命运的篇章……每一张牌都承载着宇宙的信息。",
            "牌阵已经准备就绪。每一张牌都在诉说着不同的信息，但它们共同指向同一个真相……让我为你揭示它们。"
        ];

        this.revealIntros = {
            single: [
                "牌已经翻开。让我为你解读这张牌传达的信息……在古老的预言中，每一张牌都是一扇门，通往一个未知的领域。",
                "宇宙通过这张牌向你传递了一个重要的信息。请仔细聆听……预言者说：'真相从来不是完整的，它总是被隐藏在一层薄纱之后。'",
                "这张牌的出现不是偶然的。它带着宇宙对你的特别叮嘱……在命运的织锦上，这张牌是一根金色的线。"
            ],
            three: [
                "三张牌已经全部翻开。它们共同构成了一幅关于你生命的画卷。让我为你一一解读……在古老的预言传统中，三是一个神圣的数字——过去、现在、未来；身、心、灵；开始、过程、结束。",
                "三张牌，三个维度，一个完整的故事。让我们从第一张牌开始……预言者说：'不是所有的事物都需要被理解，有些事物只需要被尊重。'",
                "牌阵已经完整。每一张牌都在诉说着不同的信息，但它们共同指向同一个真相……让我为你揭示这个真相。"
            ],
            time: [
                "过去、现在、未来——三张牌为你展示了时间的全貌。让我们从过去开始，慢慢走向未来……在预言者的眼中，时间不是一条直线，而是一条河流。",
                "时间的长河在牌阵中展开。过去的影响、现在的状态、未来的趋势，都清晰地呈现在眼前……让我为你解读这条河流的走向。",
                "三张牌，三个时间点，一条完整的生命之河。让我们顺流而下，看看命运为你准备了什么……"
            ]
        };

        this.followUpPrompts = [
            "关于这次的解读，你还有什么想问的吗？在古老的预言传统中，每一个答案都孕育着新的问题。",
            "塔罗牌的信息是多层面的。预言者说：'在表象之下，有更深的真相等待被发现。'如果你对某个部分还有疑问，请随时告诉我。",
            "宇宙的讯息还有很多可以探索的地方。你心中还有其他的疑问吗？"
        ];

        this.closingMessages = [
            "……预言者说：'命运不是一条被铺好的路，而是一片被点亮的星空。'你已看到了属于你的星星。现在，选择权在你手中——是追随它们，还是创造自己的星座。✦",
            "……星辰的低语已经传达完毕。预言者最后的话：'不要寻找答案，成为答案。'无论前方是什么，你都有足够的智慧去面对。🌙",
            "……感谢你今天的信任。在千年的智慧中，有一条不变的真理：'知道'和'做到'之间，隔着一条名为'勇气'的河。你已经知道了。现在，问问自己——你是否有勇气跨越那条河。✦"
        ];

        this.healingClosing = "今天的疗愈就到这里。🌿\n\n请记住：你的感受是重要的，你的情绪是合理的，你值得被爱。\n\n预言者说：'情绪不是敌人，而是信使。'每一次你倾听情绪的声音，你都在与自己建立更深的连接。\n\n如果还需要倾诉，我随时在这里。\n\n愿平静与你同在。💚";
    }

    /**
     * Start a new conversation
     */
    start(healingMode = false) {
        this.state = 'greeting';
        this.question = '';
        this.drawnCards = [];
        this.conversationHistory = [];
        this.followUpCount = 0;
        this.healingMode = healingMode;
        this.lastEmotionAnalysis = null;

        const greeting = healingMode ? this.healingGreeting : this.selectRandom(this.greetings);
        this.addMessage('tarot', greeting, 'text');

        setTimeout(() => {
            const prompt = healingMode ? this.healingPrompt : this.selectRandom(this.questionPrompts);
            this.addMessage('tarot', prompt, 'text');
            this.state = healingMode ? 'waiting_healing_input' : 'waiting_question';
        }, 2000);

        return this.getMessages();
    }

    /**
     * Handle user input
     */
    handleUserInput(input) {
        this.addMessage('user', input, 'text');

        switch (this.state) {
            case 'waiting_question':
                return this.handleQuestion(input);
            case 'waiting_healing_input':
                return this.handleHealingInput(input);
            case 'waiting_shuffle_confirm':
                return this.handleShuffleConfirm();
            case 'waiting_draw_confirm':
                return this.handleDrawConfirm();
            case 'follow_up':
                return this.handleFollowUp(input);
            case 'healing_follow_up':
                return this.handleHealingFollowUp(input);
            default:
                return this.handleDefault(input);
        }
    }

    /**
     * Handle healing mode input - analyze emotion and provide comfort
     */
    handleHealingInput(input) {
        this.question = input.trim();
        this.state = 'healing_analysis';

        // Analyze emotion
        const analysis = EmotionalHealing.analyzeEmotion(input);
        this.lastEmotionAnalysis = analysis;

        // Acknowledge with emotion-specific response
        const ack = EmotionalHealing.generateEmotionAcknowledgment(analysis, EmotionalHealing.emotions[analysis.emotion]);
        this.addMessage('tarot', ack, 'healing_emotion', {
            emotion: analysis.emotion,
            icon: EmotionalHealing.emotions[analysis.emotion].icon,
            color: EmotionalHealing.emotions[analysis.emotion].color
        });

        setTimeout(() => {
            // Draw a card for healing
            const card = TarotData.getRandomCard();
            const reversed = TarotData.isReversed();
            this.drawnCards = [{ ...card, reversed }];
            this.spreadType = 'single';

            // Acknowledge and guide to card draw
            const healingAck = this.selectRandom(this.healingAcknowledgments);
            this.addMessage('tarot', healingAck, 'text');

            setTimeout(() => {
                // Show card draw animation
                this.addMessage('tarot', '', 'animation', {
                    type: 'draw',
                    cards: this.drawnCards,
                    spreadType: 'single',
                    duration: 2000
                });
            }, 2000);

            setTimeout(() => {
                // Show card reveal
                this.addMessage('tarot', '', 'animation', {
                    type: 'reveal',
                    cards: this.drawnCards,
                    spreadType: 'single',
                    duration: 2000
                });
            }, 4500);

            setTimeout(() => {
                // Show healing response
                const cardData = this.drawnCards.map(c => ({ card: c, reversed: c.reversed }));
                const healingResponse = EmotionalHealing.generateHealingResponse(input, cardData);

                // Add emotion card
                this.addMessage('tarot', '', 'healing_card', {
                    emotion: analysis.emotion,
                    icon: EmotionalHealing.emotions[analysis.emotion].icon,
                    label: EmotionalHealing.emotions[analysis.emotion].label,
                    color: EmotionalHealing.emotions[analysis.emotion].color
                });

                // Add comfort message
                this.addMessage('tarot', healingResponse.parts[1].content, 'healing_comfort');

                // Add tarot comfort
                this.addMessage('tarot', healingResponse.parts[2].content, 'healing_tarot', {
                    card: this.drawnCards[0]
                });

                // Add meditation
                this.addMessage('tarot', healingResponse.parts[3].content, 'healing_meditation');

                // Add breathing exercise
                this.addMessage('tarot', healingResponse.parts[4].content, 'healing_breathing', {
                    pattern: healingResponse.parts[4].meta.breathPattern
                });

                // Add affirmation
                this.addMessage('tarot', healingResponse.parts[5].content, 'healing_affirmation');

                // Show follow up
                setTimeout(() => {
                    this.showHealingFollowUp();
                }, 2000);
            }, 7000);

            this.state = 'healing_revealing';
        }, 2500);

        return this.getMessages();
    }

    /**
     * Show healing follow-up
     */
    showHealingFollowUp() {
        if (this.followUpCount < this.maxFollowUps) {
            this.followUpCount++;
            this.state = 'healing_follow_up';

            const prompts = [
                "……你的感受现在好一些了吗？预言者说：'情绪就像天气，有时晴朗，有时下雨。'无论现在是什么天气，我都会陪着你。还有什么想说的吗？💚",
                "……在古老的预言传统中，每一次倾诉都是一次释放。如果你还有想分享的，请随时告诉我。",
                "……预言者说：'在真相显现之前，必须先建立神圣的空间。'你的感受是重要的，你的情绪是合理的。还有什么想倾诉的吗？"
            ];

            this.addMessage('tarot', this.selectRandom(prompts), 'text');

            this.addMessage('tarot', '', 'action', {
                type: 'healing_follow_up',
                buttons: [
                    { label: '💬 我还想聊聊', action: 'healing_continue' },
                    { label: '🔮 换个问题占卜', action: 'switch_to_tarot' },
                    { label: '👋 谢谢，我感觉好多了', action: 'healing_close' }
                ]
            });
        } else {
            this.showHealingClosing();
        }
    }

    /**
     * Handle healing follow-up
     */
    handleHealingFollowUp(input) {
        this.addMessage('user', input, 'text');

        // Generate healing response
        const analysis = EmotionalHealing.analyzeEmotion(input);
        const emotionData = EmotionalHealing.emotions[analysis.emotion];
        const comfort = this.selectRandom(emotionData.comfort);

        // Add oracle-style prefix
        const oraclePrefix = "……预言者说：'情绪不是敌人，而是信使。'\n\n";
        this.addMessage('tarot', oraclePrefix + comfort, 'healing_comfort');

        setTimeout(() => {
            this.showHealingFollowUp();
        }, 2000);

        return this.getMessages();
    }

    /**
     * Show healing closing
     */
    showHealingClosing() {
        this.state = 'closing';
        this.addMessage('tarot', this.healingClosing, 'healing_closing');

        this.addMessage('tarot', '', 'action', {
            type: 'closing',
            buttons: [
                { label: '🌿 再次疗愈', action: 'restart_healing' },
                { label: '🔮 塔罗占卜', action: 'restart_tarot' }
            ]
        });
    }

    /**
     * Handle user's question (original tarot mode)
     */
    handleQuestion(input) {
        this.question = input.trim();
        this.state = 'guiding_shuffle';

        // Acknowledge the question
        const ack = this.selectRandom(this.questionAcknowledgments);
        this.addMessage('tarot', ack, 'text');

        setTimeout(() => {
            // Guide the shuffle
            const guide = this.selectRandom(this.shuffleGuides);
            this.addMessage('tarot', guide, 'text');

            // Add action buttons
            this.addMessage('tarot', '', 'action', {
                type: 'shuffle_confirm',
                buttons: [
                    { label: '✨ 准备好了，开始洗牌', action: 'shuffle' }
                ]
            });

            this.state = 'waiting_shuffle_confirm';
        }, 2500);

        return this.getMessages();
    }

    /**
     * Handle shuffle confirmation
     */
    handleShuffleConfirm() {
        this.state = 'shuffling';

        // Trigger shuffle animation
        this.addMessage('tarot', '让我为你洗牌……', 'text');

        setTimeout(() => {
            this.addMessage('tarot', '', 'animation', {
                type: 'shuffle',
                duration: 3000
            });
        }, 1000);

        setTimeout(() => {
            const drawMsg = this.selectRandom(this.drawMessages);
            this.addMessage('tarot', drawMsg, 'text');

            // Add draw button
            this.addMessage('tarot', '', 'action', {
                type: 'draw_confirm',
                buttons: [
                    { label: '🎴 揭示命运', action: 'draw' }
                ]
            });

            this.state = 'waiting_draw_confirm';
        }, 4500);

        return this.getMessages();
    }

    /**
     * Handle draw confirmation
     */
    handleDrawConfirm() {
        this.state = 'drawing';

        // Trigger card draw
        const config = SpreadConfig[this.spreadType];
        this.drawnCards = TarotData.getRandomCards(config.count).map(card => ({
            ...card,
            reversed: TarotData.isReversed()
        }));

        // Trigger draw animation
        this.addMessage('tarot', '', 'animation', {
            type: 'draw',
            cards: this.drawnCards,
            spreadType: this.spreadType,
            duration: 2000
        });

        setTimeout(() => {
            // Reveal cards one by one
            this.addMessage('tarot', '', 'animation', {
                type: 'reveal',
                cards: this.drawnCards,
                spreadType: this.spreadType,
                duration: 3000
            });
        }, 2500);

        setTimeout(() => {
            this.showInterpretation();
        }, 6000);

        return this.getMessages();
    }

    /**
     * Show interpretation
     */
    async showInterpretation() {
        this.state = 'interpreting';

        const cardData = this.drawnCards.map(card => ({
            card: card,
            reversed: card.reversed
        }));

        // Try AI for question-based readings — streaming first, then non-streaming
        if (this.question) {
            const theme = (AIInterpreter?.questionThemes?.[
                AIInterpreter?.analyzeQuestion?.(this.question)?.theme || 'general'
            ]) || { label: '综合运势', icon: '❓' };
            this.addMessage('tarot', this.question, 'question_display', {
                theme: theme.label,
                icon: theme.icon
            });

            // Streaming
            const fullText = await this.streamAIAgent('interpretation');
            if (fullText) {
                setTimeout(() => this.showFollowUp(), fullText.length * 30 + 2000);
                return;
            }

            // Non-streaming fallback
            const aiReply = await this.callAIAgent('interpretation');
            if (aiReply) {
                this.addMessage('tarot', aiReply, 'text');
                if (this.onAsyncUpdate) this.onAsyncUpdate();
                setTimeout(() => this.showFollowUp(), aiReply.length * 30 + 2000);
                return;
            }
        }

        // Fallback to existing template logic
        let aiResult;
        if (this.question) {
            if (this.useOracleMode && typeof OracleProphet !== 'undefined') {
                aiResult = this.generateOracleQuestionReading(this.question, cardData, this.spreadType);
            } else {
                aiResult = AIInterpreter.generateQuestionReading(this.question, cardData, this.spreadType);
            }
        } else {
            if (this.spreadType === 'single') {
                let reading;
                if (this.useOracleMode && typeof OracleProphet !== 'undefined') {
                    reading = OracleProphet.generateOracleReading(cardData[0].card, cardData[0].reversed, 'single');
                } else {
                    reading = AIReader.generateReading(cardData[0].card, cardData[0].reversed, 'single');
                }
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
                if (this.useOracleMode && typeof OracleProphet !== 'undefined') {
                    aiResult = this.generateOracleMultiReading(cardData, this.spreadType);
                } else {
                    aiResult = AIReader.generateMultiReading(cardData, this.spreadType);
                }
                aiResult.question = '';
                aiResult.analysis = null;
            }
        }

        // Show interpretation in parts
        const parts = this.splitInterpretation(aiResult);

        let delay = 0;
        parts.forEach((part, index) => {
            setTimeout(() => {
                this.addMessage('tarot', part.content, part.type, part.meta);
                if (this.onAsyncUpdate && index === parts.length - 1) {
                    this.onAsyncUpdate();
                }
            }, delay);
            delay += 2000 + part.content.length * 10;
        });

        setTimeout(() => {
            this.showFollowUp();
        }, delay + 1000);
    }

    /**
     * Generate oracle-style question reading
     */
    generateOracleQuestionReading(question, cards, spreadType = 'single') {
        const analysis = AIInterpreter.analyzeQuestion(question);
        const theme = analysis.theme;
        const emotion = analysis.emotion;

        const opening = this.selectRandom(OracleProphet.oracleOpenings);
        const themeOpening = this.selectRandom(AIInterpreter.themeOpenings[theme]);

        const cardInterpretations = cards.map((cardData, index) => {
            const card = cardData.card;
            const reversed = cardData.reversed;
            const oracleReading = OracleProphet.generateOracleReading(card, reversed, this.getPositionLabel(spreadType, index));

            return {
                card,
                reversed,
                orientation: reversed ? '逆位' : '正位',
                position: this.getPositionLabel(spreadType, index),
                content: oracleReading.content
            };
        });

        let synthesis = '';
        if (cards.length > 1) {
            synthesis = this.buildSynthesis(cards, theme, emotion);
        }

        const closing = this.selectRandom(OracleProphet.philosophicalClosings);

        return {
            question,
            analysis,
            opening,
            themeOpening,
            cardInterpretations,
            synthesis,
            closing,
            fullText: cardInterpretations.map(c => c.content).join('\n\n'),
            readings: cardInterpretations
        };
    }

    /**
     * Generate oracle-style multi-card reading
     */
    generateOracleMultiReading(cards, spreadType) {
        const config = SpreadConfig[spreadType];
        const opening = this.selectRandom(OracleProphet.oracleOpenings);
        const closing = this.selectRandom(OracleProphet.philosophicalClosings);

        let overallIntro = `${opening}\n\n`;

        const readings = cards.map((cardData, index) => {
            const position = config.positions[index] || 'single';
            const oracleReading = OracleProphet.generateOracleReading(cardData.card, cardData.reversed, position);
            return {
                ...oracleReading,
                card: cardData.card,
                reversed: cardData.reversed
            };
        });

        let synthesis = '';
        if (cards.length > 1) {
            const cardNames = cards.map(c => c.card.name).join('、');
            synthesis = `【命运的综合讯息】\n\n${cardNames}——这些牌共同构成了一幅关于你生命的画卷。\n\n在古老的预言传统中，多张牌的出现不是巧合，而是宇宙在用它的方式向你展示一个完整的故事。每一张牌都是这个故事的一个章节，而你是这个故事的主角。\n\n预言者说：'不要只看单张牌的含义，要看它们之间的关系。'在这些牌的交织中，隐藏着一个更深的真相——一个只有你才能解读的真相。`;
        }

        return {
            intro: overallIntro,
            readings: readings,
            synthesis,
            closing,
            fullText: overallIntro + readings.map(r => r.content).join('\n\n') + '\n\n' + synthesis + '\n\n' + closing
        };
    }

    /**
     * Split interpretation into conversational parts
     */
    splitInterpretation(aiResult) {
        const parts = [];

        // Show question if exists
        if (aiResult.question) {
            const theme = AIInterpreter.questionThemes[aiResult.analysis?.theme || 'general'];
            parts.push({
                type: 'question_display',
                content: aiResult.question,
                meta: { theme: theme.label, icon: theme.icon }
            });
        }

        // Opening
        if (aiResult.opening) {
            parts.push({ type: 'text', content: aiResult.opening });
        }

        // Theme opening
        if (aiResult.themeOpening) {
            parts.push({ type: 'text', content: aiResult.themeOpening });
        }

        // Card readings
        const readings = aiResult.readings || aiResult.cardInterpretations || [];
        readings.forEach(reading => {
            const content = reading.content || this.formatCardContent(reading);
            parts.push({
                type: 'card_reading',
                content: content,
                meta: {
                    card: reading.card,
                    orientation: reading.orientation
                }
            });
        });

        // Synthesis
        if (aiResult.synthesis) {
            parts.push({ type: 'text', content: `【综合解读】\n\n${aiResult.synthesis}` });
        }

        // Closing
        if (aiResult.closing) {
            parts.push({ type: 'text', content: aiResult.closing });
        }

        return parts;
    }

    /**
     * Format card content for display
     */
    formatCardContent(reading) {
        let text = '';
        if (reading.meaning) text += `${reading.meaning}\n\n`;
        if (reading.love) text += `❤ 爱情：${reading.love}\n\n`;
        if (reading.career) text += `💼 事业：${reading.career}\n\n`;
        if (reading.wealth) text += `💰 财运：${reading.wealth}\n\n`;
        if (reading.health) text += `🌿 健康：${reading.health}\n\n`;
        if (reading.advice) text += `📜 建议：${reading.advice}`;
        return text;
    }

    /**
     * Show follow-up options
     */
    showFollowUp() {
        if (this.followUpCount < this.maxFollowUps) {
            this.followUpCount++;
            this.state = 'follow_up';

            const prompt = this.selectRandom(this.followUpPrompts);
            this.addMessage('tarot', prompt, 'text');

            this.addMessage('tarot', '', 'action', {
                type: 'follow_up',
                buttons: [
                    { label: '💬 我想追问一个问题', action: 'ask_follow_up' },
                    { label: '🔄 重新占卜', action: 'restart' },
                    { label: '👋 结束占卜', action: 'close' }
                ]
            });
        } else {
            this.showClosing();
        }
    }

    /**
     * Handle follow-up question
     */
    async handleFollowUp(input) {
        this.addMessage('user', input, 'text');

        // Try streaming first
        const fullText = await this.streamAIAgent('follow_up');
        if (fullText) {
            setTimeout(() => this.showFollowUp(), fullText.length * 30 + 2000);
            return this.getMessages();
        }

        // Try non-streaming AI
        const aiReply = await this.callAIAgent('follow_up');
        if (aiReply) {
            this.addMessage('tarot', aiReply, 'text');
            if (this.onAsyncUpdate) this.onAsyncUpdate();
            setTimeout(() => this.showFollowUp(), aiReply.length * 30 + 2000);
            return this.getMessages();
        }

        // Fallback to template
        const response = this.generateFollowUpResponse(input);
        this.addMessage('tarot', response, 'text');
        if (this.onAsyncUpdate) this.onAsyncUpdate();

        setTimeout(() => {
            this.showFollowUp();
        }, 3000);

        return this.getMessages();
    }

    /**
     * Generate follow-up response
     */
    generateFollowUpResponse(question) {
        const responses = [
            `关于"${question}"，让我从牌阵中为你寻找更深层的信息……\n\n……预言者说：'在表象之下，有更深的真相等待被发现。'\n\n塔罗牌告诉我，这个问题的答案与你内心的渴望密切相关。你已经在正确的道路上了，只需要更多的耐心和信任。\n\n宇宙想对你说：不要急于寻找答案，让一切自然地展开。`,
            `这是一个很好的追问。从牌阵的能量来看，"${question}"的答案其实已经在你心中了。\n\n……预言者说：'不是所有的事物都需要被理解，有些事物只需要被感受。'\n\n塔罗牌只是帮助你更清晰地看到它。请相信你的直觉，它比任何外在的指引都更了解你。`,
            `关于这个问题，牌阵给出了一个温柔而坚定的回答。\n\n……在古老的预言传统中，每一个答案都孕育着新的问题。\n\n你正在经历的，是灵魂成长必经的过程。每一次困惑，都是通往智慧的阶梯。请给自己一些时间，答案会在最合适的时刻浮现。`
        ];

        return this.selectRandom(responses);
    }

    /**
     * Show closing message
     */
    showClosing() {
        this.state = 'closing';

        const closing = this.selectRandom(this.closingMessages);
        this.addMessage('tarot', closing, 'text');

        this.addMessage('tarot', '', 'action', {
            type: 'closing',
            buttons: [
                { label: '🔮 重新开始', action: 'restart' }
            ]
        });
    }

    /**
     * Handle default input
     */
    handleDefault(input) {
        const responses = [
            "……我理解你的感受。在古老的预言传统中，每一段对话都是从一个问题开始的。你心中有什么疑问吗？",
            "……预言者说：'在真相显现之前，必须先建立神圣的空间。'请告诉我，你现在最想问的是什么？",
            "……我在这里，随时准备为你解读塔罗牌。在命运的织锦上，你的问题是一根金色的线。请告诉我你的问题。"
        ];

        this.addMessage('tarot', this.selectRandom(responses), 'text');
        this.state = this.healingMode ? 'waiting_healing_input' : 'waiting_question';

        return this.getMessages();
    }

    /**
     * Restart conversation
     */
    restart(healingMode = false) {
        this.conversationHistory = [];
        return this.start(healingMode);
    }

    /**
     * Add message to conversation
     */
    addMessage(sender, content, type = 'text', meta = {}) {
        this.conversationHistory.push({
            sender,
            content,
            type,
            meta,
            timestamp: Date.now()
        });
    }

    /**
     * Get all messages
     */
    getMessages() {
        return [...this.conversationHistory];
    }

    /**
     * Get last message
     */
    getLastMessage() {
        return this.conversationHistory[this.conversationHistory.length - 1] || null;
    }

    /**
     * Call AI agent for interpretation / follow-up / healing
     */
    async callAIAgent(mode = 'interpretation') {
        if (!window.API?.agent?.chat) return null;

        const history = this.conversationHistory
            .slice(-12)
            .map(msg => ({
                role: msg.sender === 'tarot' ? 'assistant' : 'user',
                content: msg.content
            }))
            .filter(msg => msg.content);

        const context = {
            question: this.question,
            spreadType: this.spreadType,
            cards: this.drawnCards.map(c => ({ name: c.name, reversed: c.reversed, meaning: c.meaning }))
        };

        try {
            const data = await API.agent.chat({
                message: mode === 'interpretation' ? this.question : this.conversationHistory.findLast(m => m.sender === 'user')?.content || '',
                history,
                cards: context.cards,
                mode,
                context
            });

            if (data.warning) {
                console.warn('AI agent info:', data.warning);
            }

            return data.reply || null;
        } catch (err) {
            console.error('AI agent call failed:', err);
            return null;
        }
    }

    /**
     * Stream AI response via SSE
     * @returns {Promise<string|null>} full text or null if failed
     */
    streamAIAgent(mode = 'interpretation') {
        if (!window.API?.agent?.chatStream) return Promise.resolve(null);

        const history = this.conversationHistory
            .slice(-12)
            .map(msg => ({
                role: msg.sender === 'tarot' ? 'assistant' : 'user',
                content: msg.content
            }))
            .filter(msg => msg.content);

        const context = {
            question: this.question,
            spreadType: this.spreadType,
            cards: this.drawnCards.map(c => ({ name: c.name, reversed: c.reversed, meaning: c.meaning }))
        };

        const message = mode === 'interpretation'
            ? this.question
            : [...this.conversationHistory].reverse().find(m => m.sender === 'user')?.content || '';

        return new Promise((resolve) => {
            let fullText = '';
            let updater = null;

            API.agent.chatStream(
                { message, history, cards: context.cards, mode, context },
                (token) => {
                    if (!updater && this.streamingUI) {
                        updater = this.streamingUI.createStreamingMessage('tarot', 'text', {});
                    }
                    fullText += token;
                    if (updater) updater.update(fullText);
                },
                () => {
                    if (updater) updater.finalize(fullText);
                    this.addMessage('tarot', fullText, 'text');
                    resolve(fullText || null);
                },
                () => resolve(null)
            );
        });
    }

    /**
     * Select random item
     */
    selectRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
