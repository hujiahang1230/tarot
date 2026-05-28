/**
 * Authentication Routes - SQLite
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

router.post('/register', [
    body('username').isLength({ min: 3, max: 50 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { username, email, password } = req.body;

        const existingUser = db.getOne(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );

        const token = jwt.sign(
            { id: result.lastInsertRowid, username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: result.lastInsertRowid,
                username,
                email,
                title: '寻星者',
                level: 1,
                exp: 0
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', [
    body('username').notEmpty().trim(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const { username, password } = req.body;

        const user = db.getOne(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                title: user.title,
                level: user.level,
                exp: user.exp,
                total_readings: user.total_readings,
                streak_days: user.streak_days
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = db.getOne(
            'SELECT id, username, email, avatar, title, level, exp, total_readings, streak_days, last_reading_date, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

router.put('/profile', authenticateToken, (req, res) => {
    try {
        const { avatar, title } = req.body;
        const updates = [];
        const params = [];

        if (avatar !== undefined) {
            updates.push('avatar = ?');
            params.push(avatar);
        }
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(req.user.id);

        db.run(
            `UPDATE users SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
            params
        );

        res.json({ message: 'Profile updated' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.post('/add-exp', authenticateToken, (req, res) => {
    try {
        const { exp } = req.body;
        if (!exp || exp <= 0) {
            return res.status(400).json({ error: 'Invalid EXP amount' });
        }

        const user = db.getOne('SELECT exp, level FROM users WHERE id = ?', [req.user.id]);

        let newExp = user.exp + exp;
        let newLevel = user.level;
        const expToNextLevel = newLevel * 200;

        if (newExp >= expToNextLevel) {
            newExp -= expToNextLevel;
            newLevel += 1;
        }

        db.run('UPDATE users SET exp = ?, level = ?, updated_at = datetime(\'now\') WHERE id = ?',
            [newExp, newLevel, req.user.id]);

        res.json({
            message: 'EXP added',
            exp: newExp,
            level: newLevel,
            leveledUp: newLevel > user.level
        });
    } catch (error) {
        console.error('Add EXP error:', error);
        res.status(500).json({ error: 'Failed to add EXP' });
    }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
