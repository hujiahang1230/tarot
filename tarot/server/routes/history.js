/**
 * Reading History Routes - SQLite
 */

const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

router.post('/', authenticateToken, (req, res) => {
    try {
        const { spread_type, cards, ai_reading, mood_score, question, source_page, profile_snapshot } = req.body;

        if (!spread_type || !cards || !Array.isArray(cards)) {
            return res.status(400).json({ error: 'Invalid reading data' });
        }

        const insertReading = db.prepare(
            'INSERT INTO reading_history (user_id, spread_type, cards, ai_reading, mood_score, question, source_page, profile_snapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        const getUser = db.prepare('SELECT total_readings, last_reading_date, streak_days FROM users WHERE id = ?');
        const updateUser = db.prepare('UPDATE users SET total_readings = ?, last_reading_date = ?, streak_days = ?, updated_at = datetime(\'now\') WHERE id = ?');
        const insertCollection = db.prepare(`
            INSERT INTO card_collections (user_id, card_id, times_drawn, last_drawn_at, is_reversed_last)
            VALUES (?, ?, 1, datetime('now'), ?)
            ON CONFLICT(user_id, card_id) DO UPDATE SET
            times_drawn = times_drawn + 1,
            last_drawn_at = datetime('now'),
            is_reversed_last = ?
        `);
        const insertRanking = db.prepare(`
            INSERT INTO daily_rankings (user_id, reading_id, fortune_score, card_drawn, is_reversed, ranking_date)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, ranking_date) DO UPDATE SET
            fortune_score = ?,
            reading_id = ?
        `);

        const transaction = db.db.transaction(() => {
            const result = insertReading.run(
                req.user.id,
                spread_type,
                JSON.stringify(cards),
                ai_reading || null,
                mood_score || null,
                question || null,
                source_page || null,
                profile_snapshot ? JSON.stringify(profile_snapshot) : null
            );
            const readingId = result.lastInsertRowid;

            const today = new Date().toISOString().split('T')[0];
            const userData = getUser.get(req.user.id);
            let newStreak = userData.streak_days || 0;

            if (userData.last_reading_date) {
                const lastDate = new Date(userData.last_reading_date + 'T00:00:00');
                const todayDate = new Date(today + 'T00:00:00');
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    newStreak += 1;
                } else if (diffDays > 1) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            const newTotal = userData.total_readings + 1;
            updateUser.run(newTotal, today, newStreak, req.user.id);

            for (const card of cards) {
                insertCollection.run(req.user.id, card.id, card.reversed ? 1 : 0, card.reversed ? 1 : 0);
            }

            const fortuneScore = calculateFortuneScore(cards);
            const mainCard = cards[0];
            insertRanking.run(req.user.id, readingId, fortuneScore, mainCard.name, mainCard.reversed ? 1 : 0, today, fortuneScore, readingId);

            return { readingId, newStreak, fortuneScore };
        });

        const result = transaction();

        res.status(201).json({
            message: 'Reading saved',
            reading_id: result.readingId,
            streak_days: result.newStreak,
            fortune_score: result.fortuneScore
        });
    } catch (error) {
        console.error('Save reading error:', error);
        res.status(500).json({ error: 'Failed to save reading' });
    }
});

router.get('/', authenticateToken, (req, res) => {
    try {
        const { limit = 20, offset = 0, spread_type } = req.query;

        let sql = 'SELECT * FROM reading_history WHERE user_id = ?';
        const params = [req.user.id];

        if (spread_type) {
            sql += ' AND spread_type = ?';
            params.push(spread_type);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const readings = db.getAll(sql, params);

        const parsedReadings = readings.map(r => ({
            ...r,
            cards: typeof r.cards === 'string' ? JSON.parse(r.cards) : r.cards,
            profile_snapshot: typeof r.profile_snapshot === 'string' && r.profile_snapshot
                ? JSON.parse(r.profile_snapshot)
                : r.profile_snapshot
        }));

        res.json({ readings: parsedReadings });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});

router.get('/:id', authenticateToken, (req, res) => {
    try {
        const reading = db.getOne(
            'SELECT * FROM reading_history WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!reading) {
            return res.status(404).json({ error: 'Reading not found' });
        }

        reading.cards = typeof reading.cards === 'string' ? JSON.parse(reading.cards) : reading.cards;
        reading.profile_snapshot = typeof reading.profile_snapshot === 'string' && reading.profile_snapshot
            ? JSON.parse(reading.profile_snapshot)
            : reading.profile_snapshot;

        res.json({ reading });
    } catch (error) {
        console.error('Get reading error:', error);
        res.status(500).json({ error: 'Failed to get reading' });
    }
});

router.put('/:id/mood', authenticateToken, (req, res) => {
    try {
        const { mood_score } = req.body;

        if (!mood_score || mood_score < 1 || mood_score > 10) {
            return res.status(400).json({ error: 'Mood score must be between 1 and 10' });
        }

        db.run(
            'UPDATE reading_history SET mood_score = ? WHERE id = ? AND user_id = ?',
            [mood_score, req.params.id, req.user.id]
        );

        res.json({ message: 'Mood score updated' });
    } catch (error) {
        console.error('Update mood error:', error);
        res.status(500).json({ error: 'Failed to update mood' });
    }
});

router.get('/stats', authenticateToken, (req, res) => {
    try {
        const stats = db.getOne(`
            SELECT
                COUNT(*) as total_readings,
                SUM(CASE WHEN spread_type = 'single' THEN 1 ELSE 0 END) as single_count,
                SUM(CASE WHEN spread_type = 'three' THEN 1 ELSE 0 END) as three_count,
                SUM(CASE WHEN spread_type = 'time' THEN 1 ELSE 0 END) as time_count,
                AVG(mood_score) as avg_mood,
                COUNT(mood_score) as mood_ratings
            FROM reading_history
            WHERE user_id = ?
        `, [req.user.id]);

        const topCard = db.getOne(`
            SELECT cc.card_id, cc.times_drawn
            FROM card_collections cc
            WHERE cc.user_id = ?
            ORDER BY cc.times_drawn DESC
            LIMIT 1
        `, [req.user.id]);

        const uniqueCards = db.getOne(
            'SELECT COUNT(*) as count FROM card_collections WHERE user_id = ?',
            [req.user.id]
        );

        res.json({
            stats: {
                ...stats,
                top_card: topCard,
                unique_cards: uniqueCards.count,
                collection_progress: `${uniqueCards.count}/22`
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

function calculateFortuneScore(cards) {
    const positiveCards = [1, 3, 6, 7, 8, 10, 14, 17, 19, 21];
    const negativeCards = [13, 15, 16];
    let score = 50;

    cards.forEach(card => {
        if (positiveCards.includes(card.id)) {
            score += card.reversed ? -5 : 10;
        } else if (negativeCards.includes(card.id)) {
            score += card.reversed ? -15 : 5;
        } else {
            score += card.reversed ? -8 : 7;
        }
    });

    return Math.max(0, Math.min(100, score));
}

module.exports = router;
