/**
 * AI Service for Claude API integration
 */

// Use environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3000');

const API_URL = `${API_BASE_URL}/api/messages`;

/**
 * Query Claude API with conversation history
 * Server-side API key is used automatically
 * @param {string} prompt - User prompt
 * @param {Array} conversationHistory - Previous messages
 * @param {Object} context - Application context (inventory, favorites, etc.)
 * @returns {Promise<string>} - AI response
 */
export async function queryClaudeAPI(prompt, conversationHistory, context) {
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
    model: 'claude-3-5-sonnet-20240620', // Claude 3.5 Sonnet (correct version)
    max_tokens: 4096, // Increased for more detailed responses
    system: systemPrompt,
    messages: messages,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Server API key is invalid. Please contact the administrator.');
      }
      if (response.status === 400) {
        const errorMsg = data.error?.message || data.error || 'Bad request';
        throw new Error(`Request error: ${errorMsg}`);
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 500) {
        const errorDetails = data.message || data.error || '';
        throw new Error(`${errorDetails}`);
      }

      // Generic error
      const errorMsg = data.error?.message || data.error || response.statusText;
      throw new Error(`API request failed (${response.status}): ${errorMsg}`);
    }

    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('AI API Error:', error);

    // Provide helpful error messages
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('Cannot connect to server. Make sure the backend is running (npm run server)');
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
${recipes.map((r) => {
    let recipeDetails = `- **${r.name}** (${r.compatibility}% match)`;

    // Add ingredients
    if (r.ingredients) {
      recipeDetails += `\n  Ingredients:\n`;
      const ingredients = r.ingredients.split('\n').filter(i => i.trim());
      ingredients.forEach(ing => {
        recipeDetails += `    • ${ing.trim()}\n`;
      });
    }

    // Add instructions if available
    if (r.instructions) {
      recipeDetails += `  Instructions: ${r.instructions}\n`;
    }

    // Add glass type if available
    if (r.glass) {
      recipeDetails += `  Glass: ${r.glass}\n`;
    }

    // Add missing ingredients if not a perfect match
    if (r.missing && r.missing.length > 0) {
      recipeDetails += `  Missing: ${r.missing.join(', ')}\n`;
    }

    return recipeDetails;
  }).join('\n')}

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
- CRITICAL: ONLY recommend cocktails from the "Available Recipes" list above. DO NOT make up or suggest cocktails not in their collection.
- ALWAYS cite the EXACT ingredients listed in each recipe - never invent or assume ingredients.
- Give personalized recommendations based on the user's specific inventory
- Reference specific bottles by name when making recommendations
- Consider tasting notes (Nose, Palate, Finish) when suggesting cocktails
- Prioritize higher compatibility % cocktails (they have more ingredients)
- If the user has rated or favorited cocktails, use that to guide recommendations
- Be conversational and explain WHY you recommend each cocktail based on their specific bottles
- When describing a cocktail, mention the actual ingredients from the recipe, not what you think should be in it
- Format your response clearly and engagingly

At the end of your response, if you're recommending specific cocktails from their available recipes, list them in this exact format:
RECOMMENDATIONS: Cocktail Name 1, Cocktail Name 2, Cocktail Name 3

IMPORTANT: Only recommend cocktails that appear in the Available Recipes list above. Use the exact recipe names and ingredients provided.`;

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
