/**
 * Database Connection Module - SQLite
 * Zero-configuration database
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'tarot.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function ensureColumn(table, column, definition) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = columns.some((item) => item.name === column);
    if (!exists) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
}

/**
 * Initialize database tables
 */
function initDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            avatar TEXT DEFAULT NULL,
            title TEXT DEFAULT '寻星者',
            level INTEGER DEFAULT 1,
            exp INTEGER DEFAULT 0,
            total_readings INTEGER DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            last_reading_date TEXT DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS reading_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            spread_type TEXT NOT NULL,
            cards TEXT NOT NULL,
            ai_reading TEXT DEFAULT NULL,
            mood_score INTEGER DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS daily_rankings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            reading_id INTEGER NOT NULL,
            fortune_score REAL NOT NULL,
            card_drawn TEXT NOT NULL,
            is_reversed INTEGER DEFAULT 0,
            ranking_date TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reading_id) REFERENCES reading_history(id) ON DELETE CASCADE,
            UNIQUE(user_id, ranking_date)
        );

        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            category TEXT NOT NULL,
            requirement TEXT NOT NULL,
            exp_reward INTEGER DEFAULT 50,
            is_hidden INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            achievement_id INTEGER NOT NULL,
            unlocked_at TEXT DEFAULT (datetime('now')),
            progress INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
            UNIQUE(user_id, achievement_id)
        );

        CREATE TABLE IF NOT EXISTS card_collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            card_id INTEGER NOT NULL,
            times_drawn INTEGER DEFAULT 1,
            last_drawn_at TEXT DEFAULT (datetime('now')),
            is_reversed_last INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, card_id)
        );

        CREATE TABLE IF NOT EXISTS personality_profiles (
            user_id INTEGER PRIMARY KEY,
            mbti_type TEXT DEFAULT NULL,
            mbti_name TEXT DEFAULT NULL,
            zodiac_sign TEXT DEFAULT NULL,
            zodiac_name TEXT DEFAULT NULL,
            current_emotion TEXT DEFAULT 'neutral',
            current_emotion_label TEXT DEFAULT '平静',
            emotion_intensity REAL DEFAULT 0,
            anxiety_level REAL DEFAULT 0,
            latest_scene TEXT DEFAULT NULL,
            companion_summary TEXT DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS personality_test_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            test_type TEXT NOT NULL,
            result_code TEXT DEFAULT NULL,
            result_name TEXT DEFAULT NULL,
            source TEXT DEFAULT NULL,
            answers TEXT DEFAULT NULL,
            summary TEXT DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS emotion_journal (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            emotion_key TEXT NOT NULL,
            emotion_label TEXT NOT NULL,
            intensity REAL DEFAULT 0,
            anxiety_level REAL DEFAULT 0,
            source TEXT DEFAULT NULL,
            note TEXT DEFAULT NULL,
            scene_theme TEXT DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ai_companion_insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            insight_type TEXT NOT NULL,
            source TEXT DEFAULT NULL,
            headline TEXT DEFAULT NULL,
            content TEXT NOT NULL,
            meta TEXT DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS daily_cosmic_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message_date TEXT NOT NULL,
            gentle_message TEXT NOT NULL,
            today_suggestion TEXT NOT NULL,
            emotion_reminder TEXT NOT NULL,
            late_night_whisper TEXT NOT NULL,
            mood_theme TEXT DEFAULT 'neutral',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, message_date)
        );

        CREATE INDEX IF NOT EXISTS idx_readings_user ON reading_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_readings_created ON reading_history(created_at);
        CREATE INDEX IF NOT EXISTS idx_rankings_date ON daily_rankings(ranking_date);
        CREATE INDEX IF NOT EXISTS idx_rankings_score ON daily_rankings(fortune_score);
        CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);
        CREATE INDEX IF NOT EXISTS idx_collections_user ON card_collections(user_id);
        CREATE INDEX IF NOT EXISTS idx_test_history_user ON personality_test_history(user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_emotion_journal_user ON emotion_journal(user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_companion_insights(user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_daily_cosmic_user ON daily_cosmic_messages(user_id, message_date);
    `);

    ensureColumn('reading_history', 'question', 'TEXT DEFAULT NULL');
    ensureColumn('reading_history', 'source_page', 'TEXT DEFAULT NULL');
    ensureColumn('reading_history', 'profile_snapshot', 'TEXT DEFAULT NULL');

    // Insert default achievements
    const achievements = db.prepare('SELECT COUNT(*) as count FROM achievements').get();
    if (achievements.count === 0) {
        const insertAchievement = db.prepare(`
            INSERT INTO achievements (code, name, description, icon, category, requirement, exp_reward, is_hidden)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const defaultAchievements = [
            ['first_reading', '初次占卜', '完成你的第一次塔罗占卜', '🔮', 'reading', '{"type":"total_readings","value":1}', 100, 0],
            ['ten_readings', '塔罗学徒', '完成10次塔罗占卜', '📖', 'reading', '{"type":"total_readings","value":10}', 200, 0],
            ['fifty_readings', '塔罗使者', '完成50次塔罗占卜', '✨', 'reading', '{"type":"total_readings","value":50}', 500, 0],
            ['hundred_readings', '塔罗大师', '完成100次塔罗占卜', '👑', 'reading', '{"type":"total_readings","value":100}', 1000, 0],
            ['streak_3', '三日修行', '连续3天进行占卜', '🕯️', 'streak', '{"type":"streak_days","value":3}', 150, 0],
            ['streak_7', '七日冥想', '连续7天进行占卜', '🌙', 'streak', '{"type":"streak_days","value":7}', 300, 0],
            ['streak_30', '月度修行者', '连续30天进行占卜', '⭐', 'streak', '{"type":"streak_days","value":30}', 1000, 0],
            ['destiny_wheel', '命运之选', '抽到命运之轮', '🎡', 'rare', '{"type":"card_id","value":10}', 200, 0],
            ['death_card', '死神降临', '抽到死神牌', '🕯️', 'rare', '{"type":"card_id","value":13}', 200, 0],
            ['tower_card', '塔之觉醒', '抽到塔牌', '⚡', 'rare', '{"type":"card_id","value":16}', 200, 0],
            ['the_world', '世界圆满', '抽到世界牌', '🌍', 'rare', '{"type":"card_id","value":21}', 300, 0],
            ['all_major', '大阿卡纳收集者', '抽到所有大阿卡纳牌', '🃏', 'special', '{"type":"all_cards","value":22}', 2000, 1],
            ['reversed_five', '逆位洞察者', '累计抽到5次逆位牌', '🔄', 'special', '{"type":"reversed_count","value":5}', 200, 0],
            ['three_spread', '三牌阵大师', '完成10次三牌阵占卜', '🔱', 'special', '{"type":"spread_count","spread":"three","value":10}', 300, 0],
            ['time_spread', '时间旅行者', '完成10次过去现在未来牌阵', '⏳', 'special', '{"type":"spread_count","spread":"time","value":10}', 300, 0],
            ['level_10', '星辰使者', '达到10级', '🌟', 'special', '{"type":"level","value":10}', 500, 1],
            ['fortune_top1', '运势之王', '获得每日运势排行榜第一名', '🏆', 'special', '{"type":"ranking_first","value":1}', 500, 1],
            ['mood_master', '心灵导师', '累计给50次占卜打分', '💫', 'special', '{"type":"mood_ratings","value":50}', 300, 0]
        ];

        const insertMany = db.transaction((achievements) => {
            for (const a of achievements) {
                insertAchievement.run(...a);
            }
        });

        insertMany(defaultAchievements);
    }

    console.log('✅ Database initialized successfully');
}

/**
 * Helper functions
 */
function prepare(sql) {
    return db.prepare(sql);
}

function getOne(sql, params = []) {
    return db.prepare(sql).get(params);
}

function getAll(sql, params = []) {
    return db.prepare(sql).all(params);
}

function run(sql, params = []) {
    return db.prepare(sql).run(params);
}

module.exports = {
    db,
    initDatabase,
    prepare,
    getOne,
    getAll,
    run
};
