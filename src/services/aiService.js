/**
 * AI Service for Claude API integration
 */

const API_URL = 'http://localhost:3000/api/messages';

/**
 * Query Claude API with conversation history
 * @param {string} prompt - User prompt
 * @param {Array} conversationHistory - Previous messages
 * @param {string} apiKey - Anthropic API key
 * @param {Object} context - Application context (inventory, favorites, etc.)
 * @returns {Promise<string>} - AI response
 */
export async function queryClaudeAPI(prompt, conversationHistory, apiKey, context) {
  // Build system prompt with full context
  const systemPrompt = buildSystemPrompt(context);

  const messages = [
    ...conversationHistory,
    {
      role: 'user',
      content: prompt,
    },
  ];

  const requestBody = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('AI API Error:', error);

    // Provide helpful error messages
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('Cannot connect to proxy server. Please run: npm run proxy (or node server/proxy-server.js)');
    }

    throw error;
  }
}

/**
 * Build system prompt with application context
 * @param {Object} context - Application context
 * @returns {string} - System prompt
 */
function buildSystemPrompt(context) {
  const { inventory, recipes, favorites, history } = context;

  let prompt = `You are an expert bartender AI assistant helping users discover cocktails they can make with their available ingredients.

CURRENT USER CONTEXT:

**Available Inventory (${inventory.length} items):**
${inventory
  .map((item) => {
    let line = `- ${item.Name}`;
    if (item['Liquor Type']) {
      line += ` (${item['Liquor Type']})`;
    }
    if (item['ABV (%)']) {
      line += ` ${item['ABV (%)']}%`;
    }
    if (item['Profile (Nose)']) {
      line += `\n  Nose: ${item['Profile (Nose)']}`;
    }
    if (item.Palate) {
      line += `\n  Palate: ${item.Palate}`;
    }
    if (item.Finish) {
      line += `\n  Finish: ${item.Finish}`;
    }
    return line;
  })
  .join('\n')}

**Available Recipes (${recipes.length} cocktails):**
${recipes.map((r) => `- ${r.name} (${r.compatibility}% match)`).join('\n')}

${
  favorites.length > 0
    ? `**User's Favorites:**
${favorites.join(', ')}`
    : ''
}

${
  Object.keys(history).length > 0
    ? `**User's History:**
${Object.entries(history)
  .map(([name, h]) => {
    let line = `- ${name}`;
    if (h.rating > 0) {
      line += ` (Rated: ${h.rating}/5 stars)`;
    }
    if (h.notes) {
      line += ` - Notes: "${h.notes}"`;
    }
    return line;
  })
  .join('\n')}`
    : ''
}

INSTRUCTIONS:
- Give personalized recommendations based on the user's specific inventory
- Reference specific bottles by name when making recommendations
- Consider tasting notes when suggesting cocktails
- If the user has rated or favorited cocktails, use that to guide recommendations
- Be conversational and explain WHY you recommend each cocktail
- Format your response clearly and engagingly

At the end of your response, if you're recommending specific cocktails from their available recipes, list them in this exact format:
RECOMMENDATIONS: Cocktail Name 1, Cocktail Name 2, Cocktail Name 3

Only list cocktails that are in the user's recipe collection.`;

  return prompt;
}

/**
 * Parse AI response to extract recommendations
 * @param {string} responseText - Raw AI response
 * @returns {Object} - {explanation, recommendations[]}
 */
export function parseAIResponse(responseText) {
  let explanation = responseText;
  let recommendations = [];

  // Try to parse RECOMMENDATIONS: line
  if (responseText.includes('RECOMMENDATIONS:')) {
    try {
      const parts = responseText.split('RECOMMENDATIONS:');
      explanation = parts[0].trim();

      // Extract cocktail names
      const recLine = parts[1].trim();
      recommendations = recLine
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      // Remove recommendations line from explanation
      explanation = responseText.replace(/RECOMMENDATIONS:.*$/s, '').trim();
    } catch (e) {
      console.error('Failed to parse recommendations:', e);
    }
  }

  return {
    explanation: explanation,
    recommendations: recommendations,
  };
}
