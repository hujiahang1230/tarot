/**
 * Tarot Card Data Module
 * Contains all tarot card definitions and reading logic
 */

const TarotData = {
    cards: [
        {
            id: 0,
            name: '愚者',
            nameEn: 'The Fool',
            symbol: '\ud83c\udf0c',
            upright: '新的开始、冒险、天真、自由',
            reversed: '鲁莽、愚蠢、冒险、分心',
            love: '感情中将迎来新的机遇，保持开放心态，可能会有意想不到的邂逅。',
            career: '适合尝试新领域，不要害怕改变，创新会带来突破。',
            wealth: '财运起伏较大，避免冲动消费，谨慎投资。',
            health: '注意意外伤害，保持活力但别忘了安全第一。',
            advice: '勇敢迈出第一步，但也要保持理性判断。',
            luckyColor: '白色',
            luckyNumber: 0
        },
        {
            id: 1,
            name: '魔术师',
            nameEn: 'The Magician',
            symbol: '\u2728',
            upright: '创造力、技能、意志力、表现力',
            reversed: '欺骗、技巧不足、操纵、浪费才能',
            love: '魅力四射，善于表达感情，单身者容易吸引异性。',
            career: '展现才华的好时机，项目进展顺利，沟通能力突出。',
            wealth: '财运亨通，善于理财，投资眼光独到。',
            health: '精力充沛，适合开始新的健身计划。',
            advice: '善用你的天赋和资源，行动力是关键。',
            luckyColor: '橙色',
            luckyNumber: 1
        },
        {
            id: 2,
            name: '女祭司',
            nameEn: 'The High Priestess',
            symbol: '\ud83c\udf19',
            upright: '直觉、潜意识、神秘、内在智慧',
            reversed: '隐藏的秘密、退缩、直觉被忽视',
            love: '感情需要用心感受，不要急于表态，倾听内心的声音。',
            career: '适合深入研究和学习，静观其变比急于行动更好。',
            wealth: '财运平稳，不宜冒进，保守理财为上策。',
            health: '关注心理健康，适当冥想放松，注意内分泌系统。',
            advice: '相信你的直觉，答案就在你心中。',
            luckyColor: '蓝色',
            luckyNumber: 2
        },
        {
            id: 3,
            name: '皇后',
            nameEn: 'The Empress',
            symbol: '\ud83d\udc51',
            upright: '丰饶、母性、自然、感官享受',
            reversed: '过度依赖、空虚、忽视自我',
            love: '感情甜蜜温馨，适合经营关系，已婚者可能有喜讯。',
            career: '工作环境和谐，创造力旺盛，适合艺术相关事务。',
            wealth: '财运丰盈，物质享受增加，注意不要过度挥霍。',
            health: '身体状况良好，注意饮食均衡，适合养生。',
            advice: '享受生活中的美好，关爱自己也关爱他人。',
            luckyColor: '绿色',
            luckyNumber: 3
        },
        {
            id: 4,
            name: '皇帝',
            nameEn: 'The Emperor',
            symbol: '\ud83d\udee1\ufe0f',
            upright: '权威、结构、稳定、父亲形象',
            reversed: '专制、僵化、缺乏弹性、过度控制',
            love: '感情中需要更多温柔，不要过于强势，学会妥协。',
            career: '领导能力突出，适合管理团队，但要注意方式方法。',
            wealth: '财运稳定，适合长期规划，避免独断专行。',
            health: '注意压力管理，避免过度劳累，关注心血管健康。',
            advice: '建立秩序和规则，但也要保持灵活性。',
            luckyColor: '红色',
            luckyNumber: 4
        },
        {
            id: 5,
            name: '教皇',
            nameEn: 'The Hierophant',
            symbol: '\ud83d\udd11',
            upright: '传统、信仰、指导、精神追求',
            reversed: '反叛、打破常规、质疑权威',
            love: '感情需要精神层面的契合，适合深入交流价值观。',
            career: '适合寻求导师指导，遵循传统方法更稳妥。',
            wealth: '财运平稳，适合保守投资，听从专业建议。',
            health: '关注精神健康，可以尝试冥想或瑜伽。',
            advice: '尊重传统但不要盲从，找到属于自己的道路。',
            luckyColor: '金色',
            luckyNumber: 5
        },
        {
            id: 6,
            name: '恋人',
            nameEn: 'The Lovers',
            symbol: '\u2764\ufe0f',
            upright: '爱情、和谐、选择、关系',
            reversed: '不和谐、失衡、错误的选择',
            love: '爱情运势极佳，单身者可能遇到真爱，情侣关系升温。',
            career: '面临重要选择，跟随内心做出决定，合作关系良好。',
            wealth: '财运与人际关系相关，合作求财更有利。',
            health: '身心和谐，注意保持生活平衡。',
            advice: '用心选择，真诚对待感情和人际关系。',
            luckyColor: '粉色',
            luckyNumber: 6
        },
        {
            id: 7,
            name: '战车',
            nameEn: 'The Chariot',
            symbol: '\ud83c\udfc6',
            upright: '胜利、决心、控制、意志力',
            reversed: '失去控制、攻击性、缺乏方向',
            love: '感情中需要主动出击，坚定目标就能成功。',
            career: '事业运势强劲，克服困难后将获得巨大成功。',
            wealth: '财运上升，努力会有回报，适合积极进取。',
            health: '精力旺盛，适合运动，注意不要过度消耗。',
            advice: '保持专注和决心，胜利就在前方。',
            luckyColor: '银色',
            luckyNumber: 7
        },
        {
            id: 8,
            name: '力量',
            nameEn: 'Strength',
            symbol: '\ud83e\udd81',
            upright: '勇气、耐心、内在力量、同情心',
            reversed: '自我怀疑、软弱、缺乏勇气',
            love: '用温柔和耐心经营感情，以柔克刚是智慧。',
            career: '面对挑战保持耐心，内在力量会帮助你度过难关。',
            wealth: '财运需要耐心经营，不要急于求成。',
            health: '身体恢复能力强，保持积极心态有助于康复。',
            advice: '真正的力量来自内心，温柔也是一种强大。',
            luckyColor: '黄色',
            luckyNumber: 8
        },
        {
            id: 9,
            name: '隐士',
            nameEn: 'The Hermit',
            symbol: '\ud83d\udd2e',
            upright: '内省、孤独、寻求真理、智慧',
            reversed: '孤立、退缩、拒绝建议',
            love: '感情需要独处思考的空间，不要急于做决定。',
            career: '适合独自工作，深入思考会带来重要发现。',
            wealth: '财运平淡，不宜投资，适合整理财务。',
            health: '需要休息和独处，关注精神健康。',
            advice: '给自己一些独处的时间，答案会在静思中出现。',
            luckyColor: '紫色',
            luckyNumber: 9
        },
        {
            id: 10,
            name: '命运之轮',
            nameEn: 'Wheel of Fortune',
            symbol: '\ud83c\udfa1',
            upright: '命运、转折点、好运、循环',
            reversed: '厄运、阻力、打破循环',
            love: '感情将迎来转折，可能是新的开始或重要决定。',
            career: '事业出现转机，把握机会，顺势而为。',
            wealth: '财运波动较大，好运来临时抓住机会。',
            health: '身体状况可能变化，注意调整生活方式。',
            advice: '顺应命运的安排，变化中蕴含机遇。',
            luckyColor: '彩虹色',
            luckyNumber: 10
        },
        {
            id: 11,
            name: '正义',
            nameEn: 'Justice',
            symbol: '\u2696\ufe0f',
            upright: '公正、真理、因果、法律',
            reversed: '不公、偏见、逃避责任',
            love: '感情需要公平对待，诚实是维系关系的基础。',
            career: '公正的决策会带来好结果，法律事务有利。',
            wealth: '财务往来要公正透明，避免纠纷。',
            health: '保持生活平衡，注意各方面协调发展。',
            advice: '做出公正的决定，诚实面对自己和他人。',
            luckyColor: '天蓝色',
            luckyNumber: 11
        },
        {
            id: 12,
            name: '倒吊人',
            nameEn: 'The Hanged Man',
            symbol: '\ud83d\ude43',
            upright: '牺牲、新视角、等待、放下',
            reversed: '拖延、无谓牺牲、固执',
            love: '感情需要换位思考，放下执念会有新发现。',
            career: '暂时停滞是好事，换个角度看问题。',
            wealth: '财运需要等待，不要急于行动。',
            health: '适合放松身心，尝试不同的养生方式。',
            advice: '学会等待和放下，换个视角看世界。',
            luckyColor: '靛蓝色',
            luckyNumber: 12
        },
        {
            id: 13,
            name: '死神',
            nameEn: 'Death',
            symbol: '\ud83d\udd6f\ufe0f',
            upright: '结束、转变、重生、放下过去',
            reversed: '抗拒改变、停滞、恐惧',
            love: '旧的感情模式需要结束，才能迎来新的开始。',
            career: '重大转变即将到来，不要害怕改变。',
            wealth: '财务需要重新规划，断舍离带来新生。',
            health: '注意身体发出的信号，及时调整。',
            advice: '接受结束，拥抱新生，转变是成长的必经之路。',
            luckyColor: '黑色',
            luckyNumber: 13
        },
        {
            id: 14,
            name: '节制',
            nameEn: 'Temperance',
            symbol: '\ud83c\udf08',
            upright: '平衡、调和、耐心、中庸',
            reversed: '失衡、过度、缺乏耐心',
            love: '感情需要平衡付出与收获，和谐相处。',
            career: '工作与生活需要平衡，调和各方关系。',
            wealth: '理财需要节制，量入为出。',
            health: '注意饮食均衡，保持身心平衡。',
            advice: '找到平衡点，不要走极端。',
            luckyColor: '浅蓝色',
            luckyNumber: 14
        },
        {
            id: 15,
            name: '恶魔',
            nameEn: 'The Devil',
            symbol: '\ud83d\udd17',
            upright: '束缚、诱惑、沉迷、物质主义',
            reversed: '解脱、觉醒、释放',
            love: '警惕感情中的不健康关系，摆脱束缚。',
            career: '注意职场中的诱惑，不要被利益蒙蔽。',
            wealth: '避免投机心理，远离高风险投资。',
            health: '戒除不良习惯，关注成瘾问题。',
            advice: '认清束缚你的东西，勇敢挣脱枷锁。',
            luckyColor: '暗红色',
            luckyNumber: 15
        },
        {
            id: 16,
            name: '塔',
            nameEn: 'The Tower',
            symbol: '\u26a1',
            upright: '突变、灾难、觉醒、崩塌',
            reversed: '避免灾难、恐惧改变、延迟必然',
            love: '感情可能出现危机，但也是重建的机会。',
            career: '突发变化可能带来冲击，但旧的不去新的不来。',
            wealth: '财务可能出现意外状况，做好应急准备。',
            health: '注意突发疾病，保持警惕。',
            advice: '接受突如其来的变化，废墟之上才能建新楼。',
            luckyColor: '深红色',
            luckyNumber: 16
        },
        {
            id: 17,
            name: '星星',
            nameEn: 'The Star',
            symbol: '\u2b50',
            upright: '希望、灵感、宁静、治愈',
            reversed: '失去信心、绝望、缺乏灵感',
            love: '感情充满希望，美好的未来在等待你。',
            career: '灵感涌现，创意无限，前途光明。',
            wealth: '财运向好，保持乐观态度。',
            health: '身心恢复，充满希望和活力。',
            advice: '保持希望，相信美好的未来就在前方。',
            luckyColor: '星空蓝',
            luckyNumber: 17
        },
        {
            id: 18,
            name: '月亮',
            nameEn: 'The Moon',
            symbol: '\ud83c\udf1b',
            upright: '幻象、恐惧、潜意识、直觉',
            reversed: '释放恐惧、真相大白、 clarity',
            love: '感情中可能存在误解，需要澄清真相。',
            career: '职场中注意辨别真伪，不要被表象迷惑。',
            wealth: '财运不明朗，谨慎投资，避免被骗。',
            health: '关注心理健康，注意睡眠问题。',
            advice: '面对内心的恐惧，真相终将水落石出。',
            luckyColor: '月光银',
            luckyNumber: 18
        },
        {
            id: 19,
            name: '太阳',
            nameEn: 'The Sun',
            symbol: '\u2600\ufe0f',
            upright: '快乐、成功、活力、光明',
            reversed: '暂时挫折、过度乐观',
            love: '感情阳光灿烂，充满快乐和温暖。',
            career: '事业蒸蒸日上，成功在望。',
            wealth: '财运极佳，收获满满。',
            health: '精力充沛，身体状况良好。',
            advice: '享受阳光般的快乐，把正能量传递给他人。',
            luckyColor: '金色',
            luckyNumber: 19
        },
        {
            id: 20,
            name: '审判',
            nameEn: 'Judgement',
            symbol: '\ud83d\udd14',
            upright: '重生、召唤、觉醒、反思',
            reversed: '自我怀疑、拒绝改变、逃避',
            love: '感情面临重要抉择，倾听内心的召唤。',
            career: '事业迎来重要转折点，做出正确选择。',
            wealth: '财务状况需要重新评估，做出调整。',
            health: '身体需要彻底调整，重新开始健康计划。',
            advice: '反思过去，听从内心的召唤，做出改变。',
            luckyColor: '紫红色',
            luckyNumber: 20
        },
        {
            id: 21,
            name: '世界',
            nameEn: 'The World',
            symbol: '\ud83c\udf0d',
            upright: '完成、成就、圆满、旅行',
            reversed: '未完成、延迟、缺乏 closure',
            love: '感情圆满达成，可能步入新阶段。',
            career: '事业取得重大成就，目标达成。',
            wealth: '财运圆满，收获丰厚回报。',
            health: '身心达到和谐状态，健康状况良好。',
            advice: '庆祝你的成就，同时准备迎接新的旅程。',
            luckyColor: '翡翠绿',
            luckyNumber: 21
        }
    ],

    /**
     * Get card by ID
     */
    getCardById(id) {
        return this.cards.find(card => card.id === id);
    },

    /**
     * Get random card
     */
    getRandomCard() {
        const randomIndex = Math.floor(Math.random() * this.cards.length);
        return { ...this.cards[randomIndex] };
    },

    /**
     * Get multiple random cards
     */
    getRandomCards(count) {
        const shuffled = [...this.cards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(card => ({ ...card }));
    },

    /**
     * Determine if card is reversed (30% chance)
     */
    isReversed() {
        return Math.random() < 0.3;
    },

    /**
     * Get card reading interpretation
     */
    getReading(card, reversed, position = '') {
        const positionLabels = {
            single: '',
            past: '过去',
            present: '现在',
            future: '未来',
            left: '左',
            center: '中',
            right: '右'
        };

        const posLabel = positionLabels[position] || '';
        const orientation = reversed ? '逆位' : '正位';
        const meaning = reversed ? card.reversed : card.upright;

        return {
            card,
            reversed,
            orientation,
            position: posLabel,
            meaning,
            love: reversed ? this.getReversedInterpretation(card.love) : card.love,
            career: reversed ? this.getReversedInterpretation(card.career) : card.career,
            wealth: reversed ? this.getReversedInterpretation(card.wealth) : card.wealth,
            health: reversed ? this.getReversedInterpretation(card.health) : card.health,
            advice: reversed ? this.getReversedInterpretation(card.advice) : card.advice,
            luckyColor: card.luckyColor,
            luckyNumber: reversed ? (card.luckyNumber + 10) % 100 : card.luckyNumber
        };
    },

    /**
     * Get reversed interpretation
     */
    getReversedInterpretation(text) {
        const reversals = [
            '需要注意',
            '警惕',
            '可能相反',
            '建议谨慎',
            '需要反思'
        ];
        const prefix = reversals[Math.floor(Math.random() * reversals.length)];
        return `${prefix}：${text}`;
    },

    /**
     * Generate full fortune reading
     */
    generateFortune(reading) {
        return {
            overall: reading.meaning,
            love: reading.love,
            career: reading.career,
            wealth: reading.wealth,
            health: reading.health,
            advice: reading.advice,
            luckyColor: reading.luckyColor,
            luckyNumber: reading.luckyNumber,
            cardName: reading.card.name,
            orientation: reading.orientation
        };
    }
};

/**
 * Spread configurations
 */
const SpreadConfig = {
    single: {
        name: '单牌占卜',
        count: 1,
        positions: ['指引']
    },
    three: {
        name: '三牌阵',
        count: 3,
        positions: ['左', '中', '右']
    },
    time: {
        name: '过去/现在/未来',
        count: 3,
        positions: ['过去', '现在', '未来']
    }
};
