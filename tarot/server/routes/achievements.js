/**
 * Achievement Routes - SQLite
 */

const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
    try {
        const achievements = db.getAll(`
            SELECT
                a.*,
                ua.unlocked_at,
                ua.progress
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            ORDER BY
                CASE WHEN ua.unlocked_at IS NOT NULL THEN 0 ELSE 1 END,
                a.category,
                a.id
        `, [req.user.id]);

        res.json({ achievements });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to get achievements' });
    }
});

router.post('/check', authenticateToken, (req, res) => {
    try {
        const user = db.getOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
        const achievements = db.getAll('SELECT * FROM achievements');
        const unlockedAchievements = [];

        const insertAchievement = db.prepare(
            'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, progress) VALUES (?, ?, ?)'
        );
        const addExp = db.prepare('UPDATE users SET exp = exp + ? WHERE id = ?');

        const transaction = db.db.transaction(() => {
            for (const achievement of achievements) {
                const existing = db.getOne(
                    'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
                    [req.user.id, achievement.id]
                );

                if (existing) continue;

                const requirement = typeof achievement.requirement === 'string'
                    ? JSON.parse(achievement.requirement)
                    : achievement.requirement;

                let shouldUnlock = false;
                let progress = 0;

                switch (requirement.type) {
                    case 'total_readings':
                        progress = user.total_readings;
                        shouldUnlock = progress >= requirement.value;
                        break;

                    case 'streak_days':
                        progress = user.streak_days;
                        shouldUnlock = progress >= requirement.value;
                        break;

                    case 'card_id': {
                        const readings = db.getAll(
                            'SELECT cards FROM reading_history WHERE user_id = ?',
                            [req.user.id]
                        );
                        progress = readings.filter(r => {
                            const cards = typeof r.cards === 'string' ? JSON.parse(r.cards) : r.cards;
                            return cards.some(c => c.id === requirement.value);
                        }).length;
                        shouldUnlock = progress > 0;
                        break;
                    }

                    case 'all_cards': {
                        const uniqueCards = db.getOne(
                            'SELECT COUNT(*) as count FROM card_collections WHERE user_id = ?',
                            [req.user.id]
                        );
                        progress = uniqueCards.count;
                        shouldUnlock = progress >= requirement.value;
                        break;
                    }

                    case 'reversed_count': {
                        const readings = db.getAll(
                            'SELECT cards FROM reading_history WHERE user_id = ?',
                            [req.user.id]
                        );
                        progress = readings.filter(r => {
                            const cards = typeof r.cards === 'string' ? JSON.parse(r.cards) : r.cards;
                            return cards.some(c => c.reversed);
                        }).length;
                        shouldUnlock = progress >= requirement.value;
                        break;
                    }

                    case 'spread_count': {
                        const spreadCount = db.getOne(
                            'SELECT COUNT(*) as count FROM reading_history WHERE user_id = ? AND spread_type = ?',
                            [req.user.id, requirement.spread]
                        );
                        progress = spreadCount.count;
                        shouldUnlock = progress >= requirement.value;
                        break;
                    }

                    case 'level':
                        progress = user.level;
                        shouldUnlock = progress >= requirement.value;
                        break;

                    case 'mood_ratings': {
                        const moodCount = db.getOne(
                            'SELECT COUNT(*) as count FROM reading_history WHERE user_id = ? AND mood_score IS NOT NULL',
                            [req.user.id]
                        );
                        progress = moodCount.count;
                        shouldUnlock = progress >= requirement.value;
                        break;
                    }
                }

                if (shouldUnlock) {
                    insertAchievement.run(req.user.id, achievement.id, progress);
                    addExp.run(achievement.exp_reward, req.user.id);

                    unlockedAchievements.push({
                        ...achievement,
                        progress
                    });
                }
            }
        });

        transaction();

        res.json({
            unlocked: unlockedAchievements,
            count: unlockedAchievements.length
        });
    } catch (error) {
        console.error('Check achievements error:', error);
        res.status(500).json({ error: 'Failed to check achievements' });
    }
});

router.get('/stats', authenticateToken, (req, res) => {
    try {
        const stats = db.getOne(`
            SELECT
                COUNT(ua.id) as unlocked_count,
                COUNT(a.id) as total_count,
                COALESCE(SUM(a.exp_reward), 0) as total_exp_earned
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        `, [req.user.id]);

        const recent = db.getAll(`
            SELECT a.*, ua.unlocked_at
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at DESC
            LIMIT 5
        `, [req.user.id]);

        res.json({
            stats: {
                unlocked: stats.unlocked_count,
                total: stats.total_count,
                completion_rate: `${((stats.unlocked_count / stats.total_count) * 100).toFixed(1)}%`,
                total_exp_earned: stats.total_exp_earned
            },
            recent_unlocks: recent
        });
    } catch (error) {
        console.error('Get achievement stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

module.exports = router;
