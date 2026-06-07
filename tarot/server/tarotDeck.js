const majorArcana = [
    ['愚者', '新的开始、自由、冒险、未知'],
    ['魔术师', '行动力、创造、资源整合、显化'],
    ['女祭司', '直觉、潜意识、秘密、内在智慧'],
    ['皇后', '滋养、丰盛、关系中的温柔与成长'],
    ['皇帝', '秩序、责任、边界、稳定结构'],
    ['教皇', '传统、承诺、信念、导师与规则'],
    ['恋人', '关系、选择、吸引、价值观一致'],
    ['战车', '推进、掌控、意志力、克服阻碍'],
    ['力量', '温柔的勇气、耐心、自我驯服'],
    ['隐士', '独处、反思、寻找内在答案'],
    ['命运之轮', '转折、周期、机会、不可控变化'],
    ['正义', '公平、因果、判断、清晰边界'],
    ['倒吊人', '暂停、换位思考、等待、放下执念'],
    ['死神', '结束、转化、旧模式脱落、新生'],
    ['节制', '平衡、整合、修复、循序渐进'],
    ['恶魔', '执念、束缚、诱惑、看见阴影'],
    ['高塔', '突变、真相显露、旧结构崩塌'],
    ['星星', '希望、疗愈、信任未来、灵感'],
    ['月亮', '迷雾、焦虑、潜意识、尚未看清'],
    ['太阳', '清晰、喜悦、成功、真实表达'],
    ['审判', '觉醒、复盘、召唤、重要决定'],
    ['世界', '完成、圆满、阶段成果、新循环']
];

const suits = [
    ['权杖', '行动、热情、事业动力、创造火焰'],
    ['圣杯', '情感、关系、直觉、内心流动'],
    ['宝剑', '思考、沟通、冲突、理性判断'],
    ['星币', '现实、金钱、身体、稳定建设']
];

const ranks = [
    ['Ace', '一', '新机会、种子能量、开始'],
    ['Two', '二', '选择、互动、平衡课题'],
    ['Three', '三', '成长、协作、初步成果'],
    ['Four', '四', '稳定、停顿、安全感'],
    ['Five', '五', '冲突、变化、挑战'],
    ['Six', '六', '调整、支持、恢复流动'],
    ['Seven', '七', '评估、防御、坚持'],
    ['Eight', '八', '推进、练习、快速变化'],
    ['Nine', '九', '积累、临界点、个人体验'],
    ['Ten', '十', '完成、负荷、阶段结果'],
    ['Page', '侍从', '学习、消息、探索心态'],
    ['Knight', '骑士', '行动方式、追求、推进姿态'],
    ['Queen', '王后', '成熟接纳、内在掌控、滋养'],
    ['King', '国王', '外在掌控、决策、承担责任']
];

const reversedTone = {
    '权杖': '行动受阻、热情失衡、方向需要校准',
    '圣杯': '情绪堵塞、关系误读、需要诚实面对感受',
    '宝剑': '沟通失衡、过度思虑、需要放下防御',
    '星币': '现实压力、资源失衡、需要重新建立秩序'
};

const deck = [
    ...majorArcana.map(([name, upright], index) => ({
        id: `major-${index}`,
        name,
        arcana: 'major',
        upright,
        reversed: `${upright}的能量被阻滞或过度，需要回到清醒与平衡。`
    })),
    ...suits.flatMap(([suit, suitMeaning]) => (
        ranks.map(([rankEn, rankCn, rankMeaning]) => ({
            id: `${suit}-${rankEn}`,
            name: `${suit}${rankCn}`,
            arcana: 'minor',
            suit,
            upright: `${suitMeaning}中的${rankMeaning}`,
            reversed: reversedTone[suit]
        }))
    ))
];

function drawCards(count = 3) {
    const safeCount = Math.min(Math.max(Number(count) || 3, 1), 5);
    const pool = [...deck];
    const cards = [];

    for (let i = 0; i < safeCount; i += 1) {
        const index = Math.floor(Math.random() * pool.length);
        const card = pool.splice(index, 1)[0];
        const reversed = Math.random() < 0.35;
        cards.push({
            ...card,
            position: reversed ? '逆位' : '正位',
            reversed,
            meaning: reversed ? card.reversed : card.upright
        });
    }

    return cards;
}

module.exports = {
    deck,
    drawCards
};
