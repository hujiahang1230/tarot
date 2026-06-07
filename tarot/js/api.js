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
     * AI agent endpoints
     */
    agent: {
        chat(data) {
            return API.request('/agent/chat', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        /**
         * Stream AI response via SSE
         * @param {object} data - Same body as chat()
         * @param {function} onToken - Called with each token string
         * @param {function} onDone - Called when stream ends
         * @param {function} onError - Called on error
         * @returns {function} abort - Call to cancel the stream
         */
        chatStream(data, onToken, onDone, onError) {
            const controller = new AbortController();

            (async () => {
                try {
                    const response = await fetch(`${API.baseURL}/agent/chat/stream`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(API.token ? { Authorization: `Bearer ${API.token}` } : {})
                        },
                        body: JSON.stringify(data),
                        signal: controller.signal
                    });

                    if (!response.ok) {
                        const text = await response.text().catch(() => 'Stream request failed');
                        throw new Error(text);
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed.startsWith('data: ')) continue;
                            const payload = trimmed.slice(6).trim();
                            if (!payload) continue;
                            try {
                                const parsed = JSON.parse(payload);
                                if (parsed.error) {
                                    if (onError) onError(new Error(parsed.error));
                                    return;
                                }
                                if (parsed.done) {
                                    if (onDone) onDone();
                                    return;
                                }
                                if (parsed.token) {
                                    if (onToken) onToken(parsed.token);
                                }
                            } catch { /* skip malformed */ }
                        }
                    }

                    if (onDone) onDone();
                } catch (err) {
                    if (err.name === 'AbortError') return;
                    console.error('Stream error:', err.message);
                    if (onError) onError(err);
                }
            })();

            return () => controller.abort();
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
