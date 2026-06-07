/**
 * Main Server Entry Point
 * Express.js server with authentication and API routes
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');
const rankingRoutes = require('./routes/ranking');
const achievementRoutes = require('./routes/achievements');
const companionRoutes = require('./routes/companion');
const agentRoutes = require('./routes/agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        status: err.status || 500
    });
});

// Start server
async function start() {
    try {
        db.initDatabase();
        console.log('✅ Database ready');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    }

    app.listen(PORT, () => {
        console.log(`🔮 Mystic Tarot Server running on http://localhost:${PORT}`);
    });
}

start();

module.exports = app;
