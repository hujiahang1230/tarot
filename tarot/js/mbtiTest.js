/**
 * MBTI人格测试系统
 * 28道题目，覆盖4个维度，沉浸式交互体验
 */

class MBTITest {
    constructor() {
        this.questions = this.generateQuestions();
        this.currentQuestion = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.onComplete = null;
        this.onProgress = null;
    }
    
    generateQuestions() {
        return [
            // E/I 维度 (7题)
            {
                dimension: 'EI',
                text: '在一个热闹的聚会中，你通常会？',
                options: [
                    { text: '主动和很多人聊天，享受社交', value: 'E', weight: 2 },
                    { text: '和几个熟悉的人深入交流', value: 'E', weight: 1 },
                    { text: '找一个安静的角落待着', value: 'I', weight: 1 },
                    { text: '待一会儿就想回家', value: 'I', weight: 2 }
                ]
            },
            {
                dimension: 'EI',
                text: '当你需要充电恢复精力时，你会选择？',
                options: [
                    { text: '找朋友聊天或出去玩', value: 'E', weight: 2 },
                    { text: '参加一些轻松的社交活动', value: 'E', weight: 1 },
                    { text: '一个人看书或听音乐', value: 'I', weight: 1 },
                    { text: '完全独处，谁也不见', value: 'I', weight: 2 }
                ]
            },
            {
                dimension: 'EI',
                text: '在团队合作中，你更倾向于？',
                options: [
                    { text: '主动发言，带领团队', value: 'E', weight: 2 },
                    { text: '积极参与讨论', value: 'E', weight: 1 },
                    { text: '倾听他人，偶尔发表意见', value: 'I', weight: 1 },
                    { text: '更喜欢独立完成自己的部分', value: 'I', weight: 2 }
                ]
            },
            {
                dimension: 'EI',
                text: '当你想到一件有趣的事，你会？',
                options: [
                    { text: '立刻找人分享', value: 'E', weight: 2 },
                    { text: '发朋友圈或社交媒体', value: 'E', weight: 1 },
                    { text: '先在心里回味一下', value: 'I', weight: 1 },
                    { text: '写下来或自己消化', value: 'I', weight: 2 }
                ]
            },
            {
                dimension: 'EI',
                text: '面对陌生人时，你的第一反应是？',
                options: [
                    { text: '主动打招呼，很快熟络', value: 'E', weight: 2 },
                    { text: '礼貌回应，慢慢熟悉', value: 'E', weight: 1 },
                    { text: '等待对方先开口', value: 'I', weight: 1 },
                    { text: '感到有些不自在', value: 'I', weight: 2 }
                ]
            },
            {
                dimension: 'EI',
                text: '你理想中的周末是？',
                options: [
                    { text: '和朋友出去玩或聚会', value: 'E', weight: 2 },
                    { text: '参加一些有趣的活动', value: 'E', weight: 1 },
                    { text: '在家做自己喜欢的事', value: 'I', weight: 1 },
                    { text: '完全独处，享受安静', value: 'I', weight: 2 }
                ]
            },
            {
                dimension: 'EI',
                text: '当你遇到问题时，你会？',
                options: [
                    { text: '找很多人讨论，集思广益', value: 'E', weight: 2 },
                    { text: '找一两个信任的人商量', value: 'E', weight: 1 },
                    { text: '先自己思考，再请教他人', value: 'I', weight: 1 },
                    { text: '自己安静地想清楚', value: 'I', weight: 2 }
                ]
            },
            
            // S/N 维度 (7题)
            {
                dimension: 'SN',
                text: '当你阅读一本书时，你更关注？',
                options: [
                    { text: '具体的细节和事实', value: 'S', weight: 2 },
                    { text: '实际的案例和应用', value: 'S', weight: 1 },
                    { text: '背后的深层含义', value: 'N', weight: 1 },
                    { text: '抽象的理论和概念', value: 'N', weight: 2 }
                ]
            },
            {
                dimension: 'SN',
                text: '你更擅长处理？',
                options: [
                    { text: '具体的、有明确步骤的任务', value: 'S', weight: 2 },
                    { text: '需要细心和耐心的工作', value: 'S', weight: 1 },
                    { text: '需要想象力和创造力的事', value: 'N', weight: 1 },
                    { text: '探索新的可能性和方向', value: 'N', weight: 2 }
                ]
            },
            {
                dimension: 'SN',
                text: '当你学习新事物时，你更喜欢？',
                options: [
                    { text: '从基础开始，循序渐进', value: 'S', weight: 2 },
                    { text: '先了解实际操作', value: 'S', weight: 1 },
                    { text: '先理解整体框架', value: 'N', weight: 1 },
                    { text: '直接探索核心概念', value: 'N', weight: 2 }
                ]
            },
            {
                dimension: 'SN',
                text: '你更相信？',
                options: [
                    { text: '经验和事实', value: 'S', weight: 2 },
                    { text: '经过验证的方法', value: 'S', weight: 1 },
                    { text: '直觉和灵感', value: 'N', weight: 1 },
                    { text: '未来的可能性', value: 'N', weight: 2 }
                ]
            },
            {
                dimension: 'SN',
                text: '在描述一件事时，你会？',
                options: [
                    { text: '详细描述具体经过', value: 'S', weight: 2 },
                    { text: '注重细节和准确性', value: 'S', weight: 1 },
                    { text: '强调意义和启示', value: 'N', weight: 1 },
                    { text: '用比喻和象征来表达', value: 'N', weight: 2 }
                ]
            },
            {
                dimension: 'SN',
                text: '你更感兴趣的是？',
                options: [
                    { text: '现实世界中正在发生的事', value: 'S', weight: 2 },
                    { text: '实用的技能和知识', value: 'S', weight: 1 },
                    { text: '哲学和抽象思考', value: 'N', weight: 1 },
                    { text: '未来趋势和想象', value: 'N', weight: 2 }
                ]
            },
            {
                dimension: 'SN',
                text: '当你做决定时，你更依赖？',
                options: [
                    { text: '过去的数据和经验', value: 'S', weight: 2 },
                    { text: '实际可行的方案', value: 'S', weight: 1 },
                    { text: '对未来的预感', value: 'N', weight: 1 },
                    { text: '创新的想法', value: 'N', weight: 2 }
                ]
            },
            
            // T/F 维度 (7题)
            {
                dimension: 'TF',
                text: '当朋友向你倾诉烦恼时，你会？',
                options: [
                    { text: '帮ta分析问题和解决方案', value: 'T', weight: 2 },
                    { text: '给出理性的建议', value: 'T', weight: 1 },
                    { text: '先安慰ta的情绪', value: 'F', weight: 1 },
                    { text: '陪伴ta，让ta感受到支持', value: 'F', weight: 2 }
                ]
            },
            {
                dimension: 'TF',
                text: '在做重要决定时，你更看重？',
                options: [
                    { text: '逻辑和客观分析', value: 'T', weight: 2 },
                    { text: '利弊得失的权衡', value: 'T', weight: 1 },
                    { text: '内心的感受和价值', value: 'F', weight: 1 },
                    { text: '对他人和自己的影响', value: 'F', weight: 2 }
                ]
            },
            {
                dimension: 'TF',
                text: '当你和别人意见不合时，你会？',
                options: [
                    { text: '用事实和逻辑说服对方', value: 'T', weight: 2 },
                    { text: '坚持自己的理性判断', value: 'T', weight: 1 },
                    { text: '考虑对方的感受', value: 'F', weight: 1 },
                    { text: '寻求和谐，避免冲突', value: 'F', weight: 2 }
                ]
            },
            {
                dimension: 'TF',
                text: '你更欣赏哪种品质？',
                options: [
                    { text: '聪明和理性', value: 'T', weight: 2 },
                    { text: '高效和果断', value: 'T', weight: 1 },
                    { text: '善良和共情', value: 'F', weight: 1 },
                    { text: '温暖和体贴', value: 'F', weight: 2 }
                ]
            },
            {
                dimension: 'TF',
                text: '在评价一部电影时，你更注重？',
                options: [
                    { text: '剧情逻辑和合理性', value: 'T', weight: 2 },
                    { text: '导演技巧和表现手法', value: 'T', weight: 1 },
                    { text: '情感表达和共鸣', value: 'F', weight: 1 },
                    { text: '带给你的感动和温暖', value: 'F', weight: 2 }
                ]
            },
            {
                dimension: 'TF',
                text: '当你看到别人犯错时，你会？',
                options: [
                    { text: '直接指出问题所在', value: 'T', weight: 2 },
                    { text: '分析错误的原因', value: 'T', weight: 1 },
                    { text: '委婉地提醒', value: 'F', weight: 1 },
                    { text: '先理解ta的处境', value: 'F', weight: 2 }
                ]
            },
            {
                dimension: 'TF',
                text: '你更认同哪种说法？',
                options: [
                    { text: '真理比感情更重要', value: 'T', weight: 2 },
                    { text: '效率比感受更优先', value: 'T', weight: 1 },
                    { text: '和谐比正确更珍贵', value: 'F', weight: 1 },
                    { text: '理解比评判更有意义', value: 'F', weight: 2 }
                ]
            },
            
            // J/P 维度 (7题)
            {
                dimension: 'JP',
                text: '你的日常生活通常是？',
                options: [
                    { text: '有计划、有规律的', value: 'J', weight: 2 },
                    { text: '大致有安排，但会灵活调整', value: 'J', weight: 1 },
                    { text: '随性而为，看心情', value: 'P', weight: 1 },
                    { text: '完全没有计划，随心所欲', value: 'P', weight: 2 }
                ]
            },
            {
                dimension: 'JP',
                text: '面对截止日期，你会？',
                options: [
                    { text: '提前很久就开始准备', value: 'J', weight: 2 },
                    { text: '按计划稳步推进', value: 'J', weight: 1 },
                    { text: '在压力下效率更高', value: 'P', weight: 1 },
                    { text: '经常拖到最后一刻', value: 'P', weight: 2 }
                ]
            },
            {
                dimension: 'JP',
                text: '你的工作空间通常是？',
                options: [
                    { text: '整洁有序，东西各归其位', value: 'J', weight: 2 },
                    { text: '基本整齐，偶尔整理', value: 'J', weight: 1 },
                    { text: '有些乱但能找到东西', value: 'P', weight: 1 },
                    { text: '随性摆放，乱中有序', value: 'P', weight: 2 }
                ]
            },
            {
                dimension: 'JP',
                text: '当计划被打乱时，你会？',
                options: [
                    { text: '感到焦虑，尽快恢复计划', value: 'J', weight: 2 },
                    { text: '有些不适应，但会调整', value: 'J', weight: 1 },
                    { text: '觉得没关系，灵活应对', value: 'P', weight: 1 },
                    { text: '反而觉得新鲜有趣', value: 'P', weight: 2 }
                ]
            },
            {
                dimension: 'JP',
                text: '你更喜欢哪种旅行方式？',
                options: [
                    { text: '详细规划行程和景点', value: 'J', weight: 2 },
                    { text: '有大致计划，留一些弹性', value: 'J', weight: 1 },
                    { text: '到了再说，随遇而安', value: 'P', weight: 1 },
                    { text: '完全自由行，走到哪算哪', value: 'P', weight: 2 }
                ]
            },
            {
                dimension: 'JP',
                text: '做决定时，你通常？',
                options: [
                    { text: '快速做出决定，不拖泥带水', value: 'J', weight: 2 },
                    { text: '收集足够信息后决定', value: 'J', weight: 1 },
                    { text: '喜欢保留更多选择', value: 'P', weight: 1 },
                    { text: '迟迟难以决定', value: 'P', weight: 2 }
                ]
            },
            {
                dimension: 'JP',
                text: '你更认同哪种生活态度？',
                options: [
                    { text: '未雨绸缪，提前准备', value: 'J', weight: 2 },
                    { text: '有条不紊，按部就班', value: 'J', weight: 1 },
                    { text: '活在当下，享受现在', value: 'P', weight: 1 },
                    { text: '顺其自然，随遇而安', value: 'P', weight: 2 }
                ]
            }
        ];
    }
    
    start(onProgress, onComplete) {
        this.currentQuestion = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.onProgress = onProgress;
        this.onComplete = onComplete;
        
        this.shuffleQuestions();
        this.showQuestion();
    }
    
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
        
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        dimensions.forEach(dim => {
            const dimQuestions = this.questions.filter(q => q.dimension === dim);
            for (let i = dimQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const idx1 = this.questions.indexOf(dimQuestions[i]);
                const idx2 = this.questions.indexOf(dimQuestions[j]);
                [this.questions[idx1], this.questions[idx2]] = [this.questions[idx2], this.questions[idx1]];
            }
        });
    }
    
    showQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.complete();
            return;
        }
        
        const question = this.questions[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        
        if (this.onProgress) {
            this.onProgress(this.currentQuestion + 1, this.questions.length, progress, question.dimension);
        }
        
        this.renderQuestion(question);
    }
    
    renderQuestion(question) {
        const questionText = document.getElementById('mbti-question-text');
        const optionsContainer = document.getElementById('mbti-options-container');
        const questionCard = document.getElementById('mbti-question-card');
        
        questionCard.style.opacity = '0';
        questionCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            questionText.textContent = question.text;
            optionsContainer.innerHTML = '';
            
            question.options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML = `<span class="option-text">${option.text}</span>`;
                btn.style.animationDelay = `${index * 0.1}s`;
                
                btn.addEventListener('click', () => this.selectOption(option, btn));
                optionsContainer.appendChild(btn);
            });
            
            questionCard.style.transition = 'all 0.5s ease';
            questionCard.style.opacity = '1';
            questionCard.style.transform = 'translateY(0)';
        }, 300);
    }
    
    selectOption(option, btn) {
        document.querySelectorAll('.option-btn').forEach(b => {
            b.classList.remove('selected');
            b.disabled = true;
        });
        
        btn.classList.add('selected');
        
        this.scores[option.value] += option.weight;
        this.answers.push({
            question: this.currentQuestion,
            value: option.value,
            weight: option.weight
        });
        
        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 600);
    }
    
    complete() {
        const result = this.calculateResult();
        if (this.onComplete) {
            this.onComplete(result);
        }
    }
    
    calculateResult() {
        const ei = this.scores.E > this.scores.I ? 'E' : 'I';
        const sn = this.scores.S > this.scores.N ? 'S' : 'N';
        const tf = this.scores.T > this.scores.F ? 'T' : 'F';
        const jp = this.scores.J > this.scores.P ? 'J' : 'P';
        
        const type = ei + sn + tf + jp;
        
        const dimensions = {
            EI: { score: this.scores.E / (this.scores.E + this.scores.I), dominant: ei },
            SN: { score: this.scores.S / (this.scores.S + this.scores.N), dominant: sn },
            TF: { score: this.scores.T / (this.scores.T + this.scores.F), dominant: tf },
            JP: { score: this.scores.J / (this.scores.J + this.scores.P), dominant: jp }
        };
        
        return {
            type,
            dimensions,
            scores: this.scores,
            answers: this.answers
        };
    }
    
    getDimensionScore(dimension) {
        const dim = dimension.toUpperCase();
        if (dim === 'EI') return this.scores.E / (this.scores.E + this.scores.I);
        if (dim === 'SN') return this.scores.S / (this.scores.S + this.scores.N);
        if (dim === 'TF') return this.scores.T / (this.scores.T + this.scores.F);
        if (dim === 'JP') return this.scores.J / (this.scores.J + this.scores.P);
        return 0.5;
    }
}
