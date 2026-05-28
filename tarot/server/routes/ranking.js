/**
 * Daily Ranking Routes - SQLite
 */

const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

router.get('/daily', (req, res) => {
    try {
        const { date } = req.query;
        const rankingDate = date || new Date().toISOString().split('T')[0];

        const rankings = db.getAll(`
            SELECT
                dr.id,
                dr.fortune_score,
                dr.card_drawn,
                dr.is_reversed,
                u.id as user_id,
                u.username,
                u.avatar,
                u.title,
                u.level
            FROM daily_rankings dr
            JOIN users u ON dr.user_id = u.id
            WHERE dr.ranking_date = ?
            ORDER BY dr.fortune_score DESC
            LIMIT 100
        `, [rankingDate]);

        const withRank = rankings.map((r, i) => ({ ...r, rank: i + 1 }));

        res.json({
            date: rankingDate,
            rankings: withRank,
            total_participants: withRank.length
        });
    } catch (error) {
        console.error('Get ranking error:', error);
        res.status(500).json({ error: 'Failed to get ranking' });
    }
});

router.get('/my-rank', authenticateToken, (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const userRank = db.getOne(`
            SELECT
                dr.fortune_score,
                dr.card_drawn,
                dr.is_reversed
            FROM daily_rankings dr
            WHERE dr.user_id = ? AND dr.ranking_date = ?
        `, [req.user.id, today]);

        if (!userRank) {
            return res.json({
                ranked: false,
                message: 'No ranking today. Complete a reading to be ranked!'
            });
        }

        const rankResult = db.getOne(`
            SELECT COUNT(*) + 1 as rank FROM daily_rankings
            WHERE ranking_date = ? AND fortune_score > ?
        `, [today, userRank.fortune_score]);

        const totalResult = db.getOne(`
            SELECT COUNT(*) as total FROM daily_rankings WHERE ranking_date = ?
        `, [today]);

        res.json({
            ranked: true,
            rank: rankResult.rank,
            total: totalResult.total,
            fortune_score: userRank.fortune_score,
            card_drawn: userRank.card_drawn,
            is_reversed: userRank.is_reversed
        });
    } catch (error) {
        console.error('Get my rank error:', error);
        res.status(500).json({ error: 'Failed to get rank' });
    }
});

router.get('/weekly', (req, res) => {
    try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const rankings = db.getAll(`
            SELECT
                u.id as user_id,
                u.username,
                u.avatar,
                u.title,
                u.level,
                COUNT(*) as readings_count,
                AVG(dr.fortune_score) as avg_score,
                MAX(dr.fortune_score) as best_score
            FROM daily_rankings dr
            JOIN users u ON dr.user_id = u.id
            WHERE dr.ranking_date >= ?
            GROUP BY u.id
            ORDER BY avg_score DESC
            LIMIT 50
        `, [weekStartStr]);

        res.json({
            week_start: weekStartStr,
            rankings
        });
    } catch (error) {
        console.error('Get weekly ranking error:', error);
        res.status(500).json({ error: 'Failed to get weekly ranking' });
    }
});

router.get('/alltime', (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const rankings = db.getAll(`
            SELECT
                u.id as user_id,
                u.username,
                u.avatar,
                u.title,
                u.level,
                u.total_readings,
                u.streak_days
            FROM users u
            ORDER BY u.level DESC, u.exp DESC
            LIMIT ?
        `, [parseInt(limit)]);

        res.json({ rankings });
    } catch (error) {
        console.error('Get alltime ranking error:', error);
        res.status(500).json({ error: 'Failed to get alltime ranking' });
    }
});

module.exports = router;
