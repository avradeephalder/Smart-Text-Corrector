module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  correctionProvider: process.env.CORRECTION_PROVIDER || 'nlp',
  
  languageTool: {
    url: process.env.LANGUAGETOOL_URL || 'http://localhost:8010/v2/check',
    enabled: process.env.LANGUAGETOOL_ENABLED === 'true'  // ← Convert string to boolean
  },
  
  nlpService: {
    url: process.env.NLP_SERVICE_URL || 'http://localhost:8000'
  },
  
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'tinyllama:latest',
    enabled: process.env.OLLAMA_ENABLED === 'true'  // ← Convert string to boolean
  }
};
