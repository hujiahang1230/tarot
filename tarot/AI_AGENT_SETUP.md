# AI Agent Setup

This project includes a usable AI companion endpoint.

## Files

- Backend route: `server/routes/agent.js`
- Route mount: `server/server.js`
- API helper: `js/api.js`
- Companion page integration: `ai-companion.html`
- MBTI companion integration: `js/mbtiHealing.js`

## Environment

Put the model key in `server/.env`; never put it in browser JavaScript.

```env
OPENAI_API_KEY=your_dashscope_api_key
AI_API_BASE=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen-plus
AI_TIMEOUT_MS=25000
```

`AI_API_BASE` uses Alibaba Cloud Qwen / DashScope OpenAI-compatible mode by default.
For the international Singapore region, use `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`.

## Run

```bash
cd server
npm start
```

Then open:

```text
http://localhost:3000/ai-companion.html
```

If no API key is configured, the server returns a local fallback reply so the chat remains usable during development.
