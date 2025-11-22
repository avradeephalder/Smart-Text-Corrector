const express = require('express');
const router = express.Router();
const services = require('./services');
const config = require('./config');

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    provider: config.correctionProvider,
    timestamp: new Date().toISOString()
  });
});

// Main correction endpoint
router.post('/correct', async (req, res, next) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required and must be a string' 
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({ 
        error: 'Text too long (max 50,000 characters)' 
      });
    }

    let result;
    
    // Route to appropriate provider
    if (config.correctionProvider === 'languagetool' && config.languageTool.enabled) {
      result = await services.correctWithLanguageTool(text, language);
    } else {
      result = await services.correctWithNLP(text, language);
    }

    res.json(result);
  } catch (error) {
    console.error('Correction error:', error.message);
    next(error);
  }
});

// Optional rewrite endpoint (uses Ollama)
router.post('/rewrite', async (req, res, next) => {
  try {
    if (!config.ollama.enabled) {
      return res.status(503).json({ 
        error: 'Rewrite service is not enabled' 
      });
    }

    const { text, style = 'fluent' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required and must be a string' 
      });
    }

    const result = await services.rewriteWithOllama(text, style);
    res.json(result);
  } catch (error) {
    console.error('Rewrite error:', error.message);
    next(error);
  }
});

module.exports = router;
