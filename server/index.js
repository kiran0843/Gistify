const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Gemini configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Rate limiter
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
});

// Middleware
app.use(helmet());
// Allow requests from the extension and local dev. In dev, allow all origins.
app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting middleware
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

// Routes
app.post('/api/summarize', rateLimiterMiddleware, async (req, res) => {
  try {
    const { content, style, type } = req.body;

    if (!content || !style || !type) {
      return res.status(400).json({
        error: 'Missing required fields: content, style, type'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured'
      });
    }

    let prompt = '';
    switch (style) {
      case 'tldr':
        prompt = `You are a world-class technical summarizer. Return output as clean Markdown with short paragraphs and bolded key phrases (use **bold**). Provide a concise TL;DR of the following ${type}. Do not add a title.\n\nCONTENT:\n${content}`;
        break;
      case 'bullets':
        prompt = `You are a world-class technical summarizer. Return output strictly as a Markdown unordered list. Each bullet should start with a short bolded lead like **Topic:** followed by the detail. Keep bullets crisp. Do not add any intro or outro. Summarize the following ${type}.\n\nCONTENT:\n${content}`;
        break;
      case 'friendly':
        prompt = `Write a friendly, conversational Markdown summary with short paragraphs and tasteful **bold** emphasis for key terms. Avoid fluff. Summarize the following ${type}.\n\nCONTENT:\n${content}`;
        break;
      default:
        prompt = `Summarize the following ${type} as Markdown:\n\nCONTENT:\n${content}`;
    }

    const url = `${GEMINI_API_BASE}/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    const apiData = await apiResponse.json();
    if (!apiResponse.ok) {
      const message = apiData?.error?.message || apiData?.message || 'Gemini API error';
      throw new Error(message);
    }

    const summary = apiData?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';

    res.json({
      success: true,
      summary,
      style,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!GEMINI_API_KEY,
    model: GEMINI_MODEL
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gistify server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Gemini API configured: ${!!GEMINI_API_KEY}`);
  console.log(`🧠 Gemini model: ${GEMINI_MODEL} (base: ${GEMINI_API_BASE})`);
});
