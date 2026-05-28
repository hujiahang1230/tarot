/**
 * API Client Module
 * Handles all backend communication
 */

const API = {
    // Use relative path so it works with localhost, ngrok, or any deployment
    baseURL: '/api',
    token: localStorage.getItem('tarot_token') || null,

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('tarot_token', token);
        } else {
            localStorage.removeItem('tarot_token');
        }
    },

    /**
     * Get auth headers
     */
    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    },

    /**
     * Generic request
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error.message);
            throw error;
        }
    },

    /**
     * Auth endpoints
     */
    auth: {
        register(username, email, password) {
            return API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password })
            });
        },

        login(username, password) {
            return API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },

        getProfile() {
            return API.request('/auth/profile');
        },

        updateProfile(data) {
            return API.request('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        addExp(exp) {
            return API.request('/auth/add-exp', {
                method: 'POST',
                body: JSON.stringify({ exp })
            });
        }
    },

    /**
     * History endpoints
     */
    history: {
        save(readingData) {
            return API.request('/history', {
                method: 'POST',
                body: JSON.stringify(readingData)
            });
        },

        getList(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.request(`/history?${query}`);
        },

        getDetail(id) {
            return API.request(`/history/${id}`);
        },

        updateMood(id, moodScore) {
            return API.request(`/history/${id}/mood`, {
                method: 'PUT',
                body: JSON.stringify({ mood_score: moodScore })
            });
        },

        getStats() {
            return API.request('/history/stats');
        }
    },

    /**
     * Ranking endpoints
     */
    ranking: {
        getDaily(date) {
            const query = date ? `?date=${date}` : '';
            return API.request(`/ranking/daily${query}`);
        },

        getMyRank() {
            return API.request('/ranking/my-rank');
        },

        getWeekly() {
            return API.request('/ranking/weekly');
        },

        getAlltime(limit = 50) {
            return API.request(`/ranking/alltime?limit=${limit}`);
        }
    },

    /**
     * Achievement endpoints
     */
    achievements: {
        getList() {
            return API.request('/achievements');
        },

        check() {
            return API.request('/achievements/check', {
                method: 'POST'
            });
        },

        getStats() {
            return API.request('/achievements/stats');
        }
    },

    /**
     * Companion profile endpoints
     */
    companion: {
        getProfile() {
            return API.request('/companion/profile');
        },

        updateProfile(data) {
            return API.request('/companion/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        saveEmotion(data) {
            return API.request('/companion/emotion', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        saveMBTI(data) {
            return API.request('/companion/mbti', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        saveZodiac(data) {
            return API.request('/companion/zodiac', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        saveInsight(data) {
            return API.request('/companion/analysis', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        getGrowth() {
            return API.request('/companion/growth');
        }
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!this.token;
    },

    /**
     * Logout
     */
    logout() {
        this.setToken(null);
        localStorage.removeItem('tarot_user');
    }
};
