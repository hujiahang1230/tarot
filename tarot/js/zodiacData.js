/**
 * Zodiac Sign Data Module
 * Contains all zodiac sign definitions and compatibility data
 */

const ZodiacData = {
    signs: [
        {
            id: 'aries',
            name: '白羊座',
            symbol: '♈',
            emoji: '🔥',
            element: '火',
            date: '3.21 - 4.19',
            traits: ['热情', '直接', '冲动', '勇敢', '天真'],
            weakness: ['急躁', '自我中心', '缺乏耐心'],
            loveStyle: '爱得热烈而直接，像一团燃烧的火焰，不善于隐藏感情，喜欢就会主动出击。'
        },
        {
            id: 'taurus',
            name: '金牛座',
            symbol: '♉',
            emoji: '🌿',
            element: '土',
            date: '4.20 - 5.20',
            traits: ['稳重', '务实', '忠诚', '享受', '固执'],
            weakness: ['顽固', '占有欲强', '抗拒改变'],
            loveStyle: '爱得深沉而持久，像一棵扎根的大树，一旦认定就会用一生去守护。'
        },
        {
            id: 'gemini',
            name: '双子座',
            symbol: '♊',
            emoji: '🌬️',
            element: '风',
            date: '5.21 - 6.21',
            traits: ['机智', '好奇', '善变', '社交', '灵活'],
            weakness: ['三心二意', '浮躁', '缺乏深度'],
            loveStyle: '爱得像一阵风，需要新鲜感和精神共鸣，害怕被束缚，渴望自由的爱。'
        },
        {
            id: 'cancer',
            name: '巨蟹座',
            symbol: '♋',
            emoji: '🌊',
            element: '水',
            date: '6.22 - 7.22',
            traits: ['温柔', '敏感', '顾家', '直觉', '保护欲'],
            weakness: ['情绪化', '过度依赖', '患得患失'],
            loveStyle: '爱得像一片海，温柔而深邃，渴望被需要，会用全部力气去呵护对方。'
        },
        {
            id: 'leo',
            name: '狮子座',
            symbol: '♌',
            emoji: '👑',
            element: '火',
            date: '7.23 - 8.22',
            traits: ['自信', '慷慨', '领导力', '热情', '骄傲'],
            weakness: ['自负', '控制欲', '需要关注'],
            loveStyle: '爱得像太阳，耀眼而温暖，喜欢被崇拜，也会用全部光芒照亮对方。'
        },
        {
            id: 'virgo',
            name: '处女座',
            symbol: '♍',
            emoji: '🌾',
            element: '土',
            date: '8.23 - 9.22',
            traits: ['细致', '完美主义', '分析', '服务', '谦逊'],
            weakness: ['挑剔', '焦虑', '过度思虑'],
            loveStyle: '爱得像一场春雨，润物细无声，用细节表达爱意，默默为对方付出一切。'
        },
        {
            id: 'libra',
            name: '天秤座',
            symbol: '♎',
            emoji: '⚖️',
            element: '风',
            date: '9.23 - 10.23',
            traits: ['优雅', '公正', '社交', '和谐', '犹豫'],
            weakness: ['优柔寡断', '讨好型', '逃避冲突'],
            loveStyle: '爱得像一首诗，追求平衡与美感，害怕孤独，渴望灵魂伴侣的陪伴。'
        },
        {
            id: 'scorpio',
            name: '天蝎座',
            symbol: '♏',
            emoji: '🦂',
            element: '水',
            date: '10.24 - 11.22',
            traits: ['深刻', '直觉', '忠诚', '神秘', '强烈'],
            weakness: ['嫉妒', '控制', '记仇'],
            loveStyle: '爱得像一场暴风雨，极致而深刻，要么全部要么没有，绝不接受肤浅的感情。'
        },
        {
            id: 'sagittarius',
            name: '射手座',
            symbol: '♐',
            emoji: '🏹',
            element: '火',
            date: '11.23 - 12.21',
            traits: ['自由', '乐观', '冒险', '直率', '理想主义'],
            weakness: ['不负责任', '承诺恐惧', '过于直接'],
            loveStyle: '爱得像一场旅行，追求自由与成长，害怕被束缚，渴望一起探索世界的伴侣。'
        },
        {
            id: 'capricorn',
            name: '摩羯座',
            symbol: '♑',
            emoji: '️',
            element: '土',
            date: '12.22 - 1.19',
            traits: ['稳重', '野心', '自律', '可靠', '现实'],
            weakness: ['冷漠', '工作狂', '压抑情感'],
            loveStyle: '爱得像一座山，沉默而坚定，不善于表达但会用行动证明一切，追求长久的承诺。'
        },
        {
            id: 'aquarius',
            name: '水瓶座',
            symbol: '♒',
            emoji: '💧',
            element: '风',
            date: '1.20 - 2.18',
            traits: ['独立', '创新', '理性', '人道主义', '叛逆'],
            weakness: ['疏离', '固执', '情感冷漠'],
            loveStyle: '爱得像一片星空，需要空间与自由，追求精神契合，害怕过于亲密的关系。'
        },
        {
            id: 'pisces',
            name: '双鱼座',
            symbol: '♓',
            emoji: '',
            element: '水',
            date: '2.19 - 3.20',
            traits: ['浪漫', '敏感', '直觉', '慈悲', '幻想'],
            weakness: ['逃避现实', '过度理想化', '易受影响'],
            loveStyle: '爱得像一场梦，浪漫而无私，渴望灵魂交融，愿意为爱牺牲一切。'
        }
    ],

    /**
     * Get sign by ID
     */
    getSign(id) {
        return this.signs.find(s => s.id === id);
    },

    /**
     * Get all signs
     */
    getAllSigns() {
        return this.signs;
    }
};
