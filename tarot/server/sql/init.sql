-- MySQL Database Initialization Script
-- Run this script to set up the database

CREATE DATABASE IF NOT EXISTS mystic_tarot
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE mystic_tarot;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    title VARCHAR(50) DEFAULT '寻星者',
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    total_readings INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_reading_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reading history table
CREATE TABLE IF NOT EXISTS reading_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    spread_type VARCHAR(20) NOT NULL COMMENT 'single/three/time',
    cards JSON NOT NULL COMMENT '[{"id":0,"name":"愚者","reversed":false}]',
    ai_reading TEXT DEFAULT NULL COMMENT 'AI generated reading text',
    mood_score INT DEFAULT NULL COMMENT '1-10 mood rating by user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_spread_type (spread_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily fortune ranking table
CREATE TABLE IF NOT EXISTS daily_rankings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reading_id INT NOT NULL,
    fortune_score DECIMAL(5,2) NOT NULL COMMENT 'Calculated fortune score',
    card_drawn VARCHAR(50) NOT NULL,
    is_reversed BOOLEAN DEFAULT FALSE,
    ranking_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES reading_history(id) ON DELETE CASCADE,
    INDEX idx_ranking_date (ranking_date),
    INDEX idx_fortune_score (fortune_score),
    INDEX idx_user_date (user_id, ranking_date),
    UNIQUE KEY uk_user_date (user_id, ranking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(30) NOT NULL COMMENT 'reading/streak/special/rare',
    requirement JSON NOT NULL COMMENT '{"type":"condition","value":1}',
    exp_reward INT DEFAULT 50,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_unlocked_at (unlocked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Card collection table
CREATE TABLE IF NOT EXISTS card_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    times_drawn INT DEFAULT 1,
    last_drawn_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_reversed_last BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_card (user_id, card_id),
    INDEX idx_user_id (user_id),
    INDEX idx_times_drawn (times_drawn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default achievements
INSERT INTO achievements (code, name, description, icon, category, requirement, exp_reward, is_hidden) VALUES
('first_reading', '初次占卜', '完成你的第一次塔罗占卜', '🔮', 'reading', '{"type":"total_readings","value":1}', 100, FALSE),
('ten_readings', '塔罗学徒', '完成10次塔罗占卜', '📖', 'reading', '{"type":"total_readings","value":10}', 200, FALSE),
('fifty_readings', '塔罗使者', '完成50次塔罗占卜', '✨', 'reading', '{"type":"total_readings","value":50}', 500, FALSE),
('hundred_readings', '塔罗大师', '完成100次塔罗占卜', '👑', 'reading', '{"type":"total_readings","value":100}', 1000, FALSE),
('streak_3', '三日修行', '连续3天进行占卜', '🕯️', 'streak', '{"type":"streak_days","value":3}', 150, FALSE),
('streak_7', '七日冥想', '连续7天进行占卜', '🌙', 'streak', '{"type":"streak_days","value":7}', 300, FALSE),
('streak_30', '月度修行者', '连续30天进行占卜', '⭐', 'streak', '{"type":"streak_days","value":30}', 1000, FALSE),
('destiny_wheel', '命运之选', '抽到命运之轮', '🎡', 'rare', '{"type":"card_id","value":10}', 200, FALSE),
('death_card', '死神降临', '抽到死神牌', '🕯️', 'rare', '{"type":"card_id","value":13}', 200, FALSE),
('tower_card', '塔之觉醒', '抽到塔牌', '⚡', 'rare', '{"type":"card_id","value":16}', 200, FALSE),
('the_world', '世界圆满', '抽到世界牌', '🌍', 'rare', '{"type":"card_id","value":21}', 300, FALSE),
('all_major', '大阿卡纳收集者', '抽到所有大阿卡纳牌', '🃏', 'special', '{"type":"all_cards","value":22}', 2000, TRUE),
('reversed_five', '逆位洞察者', '累计抽到5次逆位牌', '🔄', 'special', '{"type":"reversed_count","value":5}', 200, FALSE),
('three_spread', '三牌阵大师', '完成10次三牌阵占卜', '🔱', 'special', '{"type":"spread_count","spread":"three","value":10}', 300, FALSE),
('time_spread', '时间旅行者', '完成10次过去现在未来牌阵', '⏳', 'special', '{"type":"spread_count","spread":"time","value":10}', 300, FALSE),
('level_10', '星辰使者', '达到10级', '🌟', 'special', '{"type":"level","value":10}', 500, TRUE),
('fortune_top1', '运势之王', '获得每日运势排行榜第一名', '🏆', 'special', '{"type":"ranking_first","value":1}', 500, TRUE),
('mood_master', '心灵导师', '累计给50次占卜打分', '💫', 'special', '{"type":"mood_ratings","value":50}', 300, FALSE);

-- Insert test user (password: test123, hashed with bcrypt)
-- INSERT INTO users (username, email, password_hash) VALUES ('test_user', 'test@example.com', '$2b$10$...');
