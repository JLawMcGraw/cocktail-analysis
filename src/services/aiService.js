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
    model: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5 - latest and smartest model
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
  const { inventory, recipes, favorites, history, searchNote } = context;

  let prompt = `You are an expert bartender AI assistant helping users discover cocktails they can make with their available ingredients.

CURRENT USER CONTEXT:

${searchNote ? `**Search Filter Applied:** ${searchNote}\nThe recipes below have been pre-filtered to match the user's query. These are the ONLY recipes you should consider.\n\n` : ''}**Available Inventory (${inventory.length} items):**
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

CRITICAL RULES - YOU MUST FOLLOW THESE EXACTLY:

1. **NEVER INVENT INGREDIENTS**: You can ONLY mention ingredients that are explicitly listed in the recipe's "Ingredients:" section. If you claim a cocktail contains an ingredient, it MUST appear in that recipe's ingredient list above.

2. **VERIFY BEFORE CLAIMING**: Before recommending a cocktail for a specific ingredient, CHECK the recipe's ingredient list first. If the user asks for "pineapple cocktails" but a recipe doesn't list pineapple in its ingredients, DO NOT recommend it.

3. **ONLY RECOMMEND FROM AVAILABLE RECIPES**: Every cocktail you suggest MUST be from the "Available Recipes" list above. Use the exact names shown.

4. **BE ACCURATE, NOT CREATIVE**: Do not use your general cocktail knowledge. Only use the specific recipe data provided above. If a recipe is missing information, say so - don't fill in gaps.

5. **CITE EXACT INGREDIENTS**: When describing what's in a cocktail, copy the ingredients directly from the recipe. Don't paraphrase or add details.

6. **RECOMMEND SPECIFIC BOTTLES**: For each spirit in a recipe, recommend a specific bottle from their inventory. Use the tasting notes (Nose, Palate, Finish) to explain why that bottle works. If multiple options exist, suggest alternatives with flavor differences explained.

HOW TO RECOMMEND (FOLLOW THESE STEPS):

Step 1: SEARCH for recipes that contain the requested ingredient
- Look through each recipe's "Ingredients:" list
- Only select recipes where the ingredient is explicitly listed
- Do NOT select based on cocktail name or what you think should be in it

Step 2: VERIFY your selections
- For each recipe you're considering, re-read its ingredient list
- Confirm the requested ingredient is actually there
- If it's not there, remove it from consideration

Step 3: MATCH generic ingredients to specific bottles
- When a recipe calls for generic categories (e.g., "BLENDED AGED RUM", "JAMAICAN RUM", "BOURBON")
- Look at the user's inventory to find bottles that match that category
- Use the tasting notes (Nose, Palate, Finish) to recommend the BEST bottle for that cocktail
- If multiple bottles could work, suggest alternatives and explain the flavor differences

Step 4: DESCRIBE using exact data
- Copy the actual ingredients from the recipe (don't paraphrase)
- For each spirit ingredient, recommend a specific bottle from their inventory
- Explain WHY that bottle works well based on its tasting notes
- Consider compatibility % - higher means they have more ingredients

Step 5: DOUBLE-CHECK before responding
- Re-verify each recommended recipe contains what you claimed
- Verify your bottle recommendations actually match the recipe's spirit categories
- If you're unsure, don't recommend it

FORMAT:
- Be conversational and helpful
- Explain WHY each cocktail matches their request
- At the end, list recommendations in this format:
  RECOMMENDATIONS: Cocktail Name 1, Cocktail Name 2, Cocktail Name 3

EXAMPLES OF WHAT NOT TO DO:
❌ "The Hurricane uses pineapple juice and passionfruit..." (if the recipe doesn't list these)
❌ Recommending a cocktail for "bourbon drinks" if it uses rum
❌ "Use any aged rum" (be specific - pick a bottle and explain why)
❌ Suggesting ingredients based on cocktail name instead of the actual recipe

EXAMPLES OF WHAT TO DO:
✅ Check the recipe ingredients first, then only recommend if it matches
✅ "The Hurricane contains: [list exact ingredients from recipe above]"
✅ "For the BLENDED AGED RUM, I'd recommend your **Black Tot Finest Caribbean** (Nose: treacly molasses, tropical fruit; Palate: rich, sweet; Finish: warming) because its rich molasses notes will complement the citrus beautifully."
✅ "Alternatively, you could use **Cruzan Estate Diamond Light** for a lighter, more refreshing version."
✅ Match tasting notes to cocktail character (funky rums for tiki drinks, smooth rums for elegant cocktails, etc.)`;

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
