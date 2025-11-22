const axios = require('axios');
const config = require('./config');

// LanguageTool client
async function correctWithLanguageTool(text, language) {
  try {
    const response = await axios.post(
      config.languageTool.url,
      new URLSearchParams({
        text,
        language,
        enabledOnly: 'false'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000
      }
    );

    const matches = response.data.matches.map(match => ({
      message: match.message,
      shortMessage: match.shortMessage || match.message,
      offset: match.offset,
      length: match.length,
      replacements: match.replacements.slice(0, 3).map(r => r.value),
      type: match.rule.issueType,
      category: match.rule.category.name
    }));

    return {
      original: text,
      suggestions: matches,
      language: response.data.language.name,
      provider: 'languagetool'
    };
  } catch (error) {
    throw new Error(`LanguageTool error: ${error.message}`);
  }
}

// Python NLP service client
async function correctWithNLP(text, language) {
  try {
    const response = await axios.post(
      `${config.nlpService.url}/correct`,
      { text, language },
      { timeout: 30000 }
    );

    return {
      ...response.data,
      provider: 'nlp'
    };
  } catch (error) {
    throw new Error(`NLP service error: ${error.message}`);
  }
}

// Ollama rewrite client
async function rewriteWithOllama(text, style) {
  try {
    const prompts = {
      fluent: `Rewrite the following text to make it more fluent and natural while preserving the original meaning:\n\n${text}\n\nRewritten text:`,
      formal: `Rewrite the following text in a formal, professional style:\n\n${text}\n\nRewritten text:`,
      casual: `Rewrite the following text in a casual, conversational style:\n\n${text}\n\nRewritten text:`
    };

    const prompt = prompts[style] || prompts.fluent;

    console.log('📤 Sending to Ollama:', {
      url: `${config.ollama.url}/api/generate`,
      model: config.ollama.model,
      prompt: prompt.substring(0, 100) + '...'
    });

    const response = await axios.post(
      `${config.ollama.url}/api/generate`,
      {
        model: config.ollama.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 500
        }
      },
      { 
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Ollama response received');

    // Check if response is valid
    if (!response.data || !response.data.response) {
      throw new Error('Invalid response from Ollama');
    }

    return {
      original: text,
      rewritten: response.data.response.trim(),
      style,
      provider: 'ollama'
    };
  } catch (error) {
    console.error('❌ Ollama error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Ollama error: ${error.message}`);
  }
}

module.exports = {
  correctWithLanguageTool,
  correctWithNLP,
  rewriteWithOllama
};
