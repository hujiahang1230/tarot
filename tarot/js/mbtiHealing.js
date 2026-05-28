/**
 * MBTI人格疗愈系统
 * 基于人格类型的情绪疗愈、冥想和陪伴
 */

class MBTIHealing {
    constructor() {
        this.currentMode = null;
        this.currentPersonality = null;
        this.chatHistory = [];
        this.isTyping = false;
        this.onMessage = null;
    }
    
    setPersonality(personality) {
        this.currentPersonality = personality;
    }
    
    startHealing(mode, onMessage) {
        this.currentMode = mode;
        this.onMessage = onMessage;
        this.chatHistory = [];
        
        switch (mode) {
            case 'emotion':
                this.startEmotionHealing();
                break;
            case 'meditation':
                this.startMeditation();
                break;
            case 'companion':
                this.startCompanion();
                break;
            case 'breathing':
                this.startBreathing();
                break;
        }
    }
    
    startEmotionHealing() {
        const personality = this.currentPersonality;
        const opening = `欢迎来到${personality.type}的疗愈空间。\n\n你是${personality.name}，${personality.title}。\n\n${personality.healing}\n\n现在，告诉我你现在的心情好吗？`;
        
        this.sendMessage(opening);
    }
    
    startMeditation() {
        const personality = this.currentPersonality;
        const meditation = personality.meditation;
        
        const opening = `为你定制的冥想体验...\n\n${personality.type} - ${personality.name}\n\n闭上眼睛，深呼吸...\n\n${meditation}\n\n慢慢感受，我在这里陪着你。`;
        
        this.sendMessage(opening);
        
        setTimeout(() => {
            this.sendMessage('吸气...感受宇宙的能量流入你的身体...');
        }, 5000);
        
        setTimeout(() => {
            this.sendMessage('停留...让这份宁静在你心中沉淀...');
        }, 10000);
        
        setTimeout(() => {
            this.sendMessage('呼气...释放所有的紧张和不安...');
        }, 15000);
        
        setTimeout(() => {
            this.sendMessage('你做得很好。\n慢慢睁开眼睛，带着这份宁静回到现实。');
        }, 20000);
    }
    
    startCompanion() {
        const personality = this.currentPersonality;
        const opening = `你好，${personality.type}。\n\n${personality.companion}\n\n想聊聊天吗？我在这里。`;
        
        this.sendMessage(opening);
    }
    
    startBreathing() {
        const opening = `让我们一起做呼吸练习...\n\n吸气 4秒...停留 2秒...呼气 6秒...\n\n跟随节奏，慢慢放松...`;
        
        this.sendMessage(opening);
        
        this.runBreathingCycle();
    }
    
    runBreathingCycle() {
        if (this.currentMode !== 'breathing') return;
        
        setTimeout(() => {
            this.sendMessage('吸气...');
        }, 2000);
        
        setTimeout(() => {
            this.sendMessage('停留...');
        }, 6000);
        
        setTimeout(() => {
            this.sendMessage('呼气...');
        }, 8000);
        
        setTimeout(() => {
            if (this.currentMode === 'breathing') {
                this.runBreathingCycle();
            }
        }, 14000);
    }
    
    handleUserMessage(text) {
        if (this.isTyping) return;
        
        const emotion = this.detectEmotion(text);
        const response = this.generateResponse(text, emotion);
        
        setTimeout(() => {
            this.sendMessage(response);
        }, 1000 + Math.random() * 1000);
    }
    
    detectEmotion(text) {
        const lower = text;
        
        const anxietyWords = ['焦虑', '紧张', '害怕', '担心', '不安', '慌', '压力', '崩溃', '烦躁', '烦'];
        const sadnessWords = ['难过', '伤心', '哭', '泪', '失落', '孤独', '寂寞', '痛苦', '绝望', '不开心'];
        const tiredWords = ['累', '疲惫', '疲倦', '辛苦', '撑', '坚持', '好累', '太累'];
        const happyWords = ['开心', '高兴', '快乐', '幸福', '满足', '感恩', '好', '棒'];
        
        let scores = { anxiety: 0, sadness: 0, tired: 0, happy: 0, neutral: 1 };
        
        anxietyWords.forEach(w => { if (lower.includes(w)) scores.anxiety += 2; });
        sadnessWords.forEach(w => { if (lower.includes(w)) scores.sadness += 2; });
        tiredWords.forEach(w => { if (lower.includes(w)) scores.tired += 2; });
        happyWords.forEach(w => { if (lower.includes(w)) scores.happy += 2; });
        
        const maxScore = Math.max(...Object.values(scores));
        return Object.keys(scores).find(k => scores[k] === maxScore);
    }
    
    generateResponse(text, emotion) {
        const personality = this.currentPersonality;
        const type = personality.type;
        
        const responses = {
            anxiety: [
                `我听见你的不安了，${type}。\n深呼吸，让我和你一起待在这片不安里。\n你不是一个人。`,
                `焦虑的时候，宇宙也会变得安静。\n慢慢来，我在这里陪着你。\n${personality.healing}`,
                `你的不安，我感受到了。\n不用急着好起来，\n我会一直在这里，陪你度过。`
            ],
            sadness: [
                `你的难过，我看见了，${type}。\n想哭就哭吧，我在这里陪着你。\n不需要坚强，做你自己就好。`,
                `伤心也没关系，\n宇宙会接住你的每一滴眼泪。\n我陪你，慢慢来。`,
                `孤独的时候，就抬头看看星空。\n每一颗星星，都在陪你发光。\n你不是一个人。`
            ],
            tired: [
                `累了就休息吧，${type}。\n你已经做得很好了。\n我陪你，安静地待一会儿。`,
                `疲惫的时候，就放下重担。\n宇宙会托住你，\n我也会。好好休息。`,
                `你辛苦了，真的。\n不用一直坚强，\n现在，让我来陪你休息。`
            ],
            happy: [
                `你的开心，像星星一样亮，${type}。\n我陪你一起感受这份美好。\n愿你一直这样发光。`,
                `快乐的时候，就好好享受吧。\n我为你高兴，\n愿这份温暖一直陪着你。`,
                `你的笑容，宇宙都看见了。\n继续保持这份美好，\n我会一直在这里，为你鼓掌。`
            ],
            neutral: [
                `嗯，我听见你了，${type}。\n今天过得怎么样？\n我陪你，慢慢说。`,
                `我在这里，安静地陪着你。\n想说什么，都可以。\n不用急，慢慢来。`,
                `深夜的宇宙很安静，\n正好适合说话。\n我在听，你说。`
            ]
        };
        
        const pool = responses[emotion] || responses.neutral;
        return pool[Math.floor(Math.random() * pool.length)];
    }
    
    sendMessage(text) {
        this.isTyping = true;
        
        if (this.onMessage) {
            this.onMessage(text, () => {
                this.isTyping = false;
            });
        }
    }
    
    stop() {
        this.currentMode = null;
        this.isTyping = false;
        this.chatHistory = [];
    }
}
