/**
 * AI Feature Module
 * Handles AI query processing and recommendations
 */

import { queryClaudeAPI, parseAIResponse } from '../services/aiService.js';
import { saveApiKey } from '../services/storage.js';
import { escapeHtml } from '../utils/formatters.js';
import { areSimilarIngredients } from '../utils/fuzzyMatch.js';
import { createRecipeCard } from './analysis.js';
import { APP } from '../app.js';

/**
 * Filter recipes based on user query for specific ingredients
 * Returns {filtered: Recipe[], note: string}
 */
function filterRecipesByIngredients(query, allRecipes) {
  // Common ingredient keywords to search for
  const ingredientKeywords = [
    'pineapple', 'lime', 'lemon', 'orange', 'grapefruit', 'passionfruit', 'passion fruit',
    'mango', 'coconut', 'banana', 'strawberry', 'raspberry', 'blackberry',
    'mint', 'basil', 'thyme', 'rosemary', 'cucumber',
    'ginger', 'vanilla', 'cinnamon', 'nutmeg',
    'rum', 'bourbon', 'whiskey', 'gin', 'vodka', 'tequila', 'mezcal', 'cognac', 'brandy',
    'vermouth', 'campari', 'aperol', 'chartreuse', 'bitters',
    'syrup', 'honey', 'agave', 'sugar', 'grenadine', 'orgeat', 'falernum'
  ];

  const queryLower = query.toLowerCase();

  // Extract ingredient mentions from query
  const mentionedIngredients = ingredientKeywords.filter(keyword =>
    queryLower.includes(keyword)
  );

  // If no specific ingredients mentioned, return all recipes
  if (mentionedIngredients.length === 0) {
    return { filtered: allRecipes.slice(0, 30), note: null };
  }

  // Filter recipes that contain ALL mentioned ingredients
  const filtered = allRecipes.filter(recipe => {
    const ingredientsText = (recipe.ingredients || recipe.Ingredients || '').toLowerCase();

    // Check if ALL mentioned ingredients appear in this recipe
    return mentionedIngredients.every(ingredient =>
      ingredientsText.includes(ingredient)
    );
  });

  // If we found matches, return them
  if (filtered.length > 0) {
    return {
      filtered: filtered.slice(0, 20),
      note: `Found ${filtered.length} recipe(s) containing: ${mentionedIngredients.join(', ')}`
    };
  }

  // Try partial matches (at least one ingredient)
  const partialFiltered = allRecipes.filter(recipe => {
    const ingredientsText = (recipe.ingredients || recipe.Ingredients || '').toLowerCase();
    return mentionedIngredients.some(ingredient => ingredientsText.includes(ingredient));
  });

  if (partialFiltered.length > 0) {
    return {
      filtered: partialFiltered.slice(0, 20),
      note: `No recipes contain ALL ingredients. Showing ${partialFiltered.length} recipe(s) with at least one: ${mentionedIngredients.join(', ')}`
    };
  }

  // No matches found
  return {
    filtered: [],
    note: `No recipes found containing: ${mentionedIngredients.join(', ')}. Try a different search or ask a general question.`
  };
}

/**
 * Handle AI query
 * API key is handled server-side
 */
export async function handleAIQuery(elements, callbacks) {
  const query = elements.aiQueryInput.value.trim();

  if (!query) {
    alert('Please enter a question or search query');
    return;
  }

  if (!APP.allResults) {
    alert('Please analyze your bar first before using AI search');
    return;
  }

  // Disable button and show loading
  elements.aiQueryBtn.disabled = true;
  elements.aiSearchResponse.innerHTML =
    '<div style="padding: 20px; text-align: center;">🤔 AI is thinking...</div>';
  elements.aiSearchResponse.classList.add('active');

  // Clear input for next question
  elements.aiQueryInput.value = '';

  try {
    // Check if user wants to see ALL recipes (not just makeable ones)
    const wantsAllRecipes = /even if|don't have|missing|incomplete|any recipe|all recipe/i.test(query);

    // Build context - use ALL recipes if requested, otherwise just compatible ones
    let allRecipes;
    if (wantsAllRecipes && APP.recipeData) {
      // Search through ALL recipes in the database
      allRecipes = APP.recipeData.map(r => ({
        name: r['Drink Name'] || r.name,
        ingredients: r.Ingredients || r.ingredients,
        instructions: r.Instructions || r.instructions,
        glass: r.Glass || r.glass,
        category: r.Category || r.category,
        compatibility: 0, // Unknown compatibility
        missing: [], // Don't know what's missing
      }));
    } else {
      // Use only compatible recipes
      allRecipes = APP.allResults.perfect.concat(
        APP.allResults.veryGood,
        APP.allResults.good,
      );
    }

    // Pre-filter recipes based on query
    const { filtered, note } = filterRecipesByIngredients(query, allRecipes);

    // If no recipes match specific ingredients, inform the AI
    if (filtered.length === 0 && note) {
      const searchScope = wantsAllRecipes ? 'all recipes in your collection' : 'recipes you can make';
      elements.aiSearchResponse.innerHTML = `
        <div style="background: #fff3cd; padding: 20px; border-radius: 10px; color: #856404; line-height: 1.6;">
          <div style="font-weight: bold; margin-bottom: 10px;">🔍 Search Result:</div>
          <div>${escapeHtml(note)} (searched ${searchScope})</div>
        </div>
      `;
      elements.aiQueryBtn.disabled = false;
      return;
    }

    const context = {
      inventory: APP.editableInventory,
      recipes: filtered, // Send only filtered recipes
      favorites: Array.from(APP.favorites),
      history: APP.history,
      searchNote: note, // Include filter note for AI awareness
      showingAllRecipes: wantsAllRecipes, // Tell AI if we're showing recipes they might not be able to make
    };

    const result = await queryClaudeAPI(query, APP.conversationHistory, context);
    displayAIRecommendations(result, elements, callbacks);
  } catch (error) {
    elements.aiSearchResponse.innerHTML = `<div style="padding: 20px; color: #721c24; background: #f8d7da; border-radius: 8px;">❌ Error: ${escapeHtml(error.message)}</div>`;
  } finally {
    elements.aiQueryBtn.disabled = false;
    if (elements.aiQueryInput) {
      elements.aiQueryInput.focus();
    }
  }
}

/**
 * Display AI recommendations
 */
function displayAIRecommendations(result, elements, callbacks) {
  const { explanation, recommendations } = parseAIResponse(result);

  let html = '';

  if (explanation) {
    html +=
      '<div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; color: #333; line-height: 1.6;">';
    html +=
      '<div style="font-weight: bold; margin-bottom: 10px; color: #667eea; font-size: 1.1em;">🤖 Bartender AI:</div>';
    html += `<div style="white-space: pre-wrap;">${escapeHtml(explanation)}</div>`;
    html += '</div>';
  }

  if (recommendations && recommendations.length > 0) {
    const allRecipes = APP.allResults.perfect.concat(
      APP.allResults.veryGood,
      APP.allResults.good,
    );

    html +=
      '<div style="font-weight: bold; margin-bottom: 15px; color: #333; background: white; padding: 15px; border-radius: 10px;">📋 Recommended Cocktails (click to view):</div>';

    recommendations.forEach((recipeName, idx) => {
      let recipe = allRecipes.find((r) => r.name.toLowerCase() === recipeName.toLowerCase());

      if (!recipe) {
        recipe = allRecipes.find((r) => areSimilarIngredients(r.name, recipeName, 0.7));
      }

      if (recipe) {
        const category = APP.allResults.perfect.includes(recipe)
          ? 'perfect'
          : APP.allResults.veryGood.includes(recipe)
            ? 'veryGood'
            : 'good';
        const index = APP.allResults[category].indexOf(recipe);

        html += `<div style="margin-bottom: 5px; color: #666; font-size: 0.9em; background: white; padding: 5px 15px;">#${idx + 1}</div>`;
        html += createRecipeCard(recipe, category, index);
      }
    });
  }

  html +=
    '<div style="background: rgba(255,255,255,0.5); padding: 15px; border-radius: 10px; margin-top: 20px; color: #333; font-style: italic; text-align: center;">';
  html += '💬 Keep chatting! Ask follow-up questions or refine your search.';
  html += '</div>';

  elements.aiSearchResponse.innerHTML = html;

  elements.aiSearchResponse.querySelectorAll('.recipe-item').forEach((item) => {
    item.addEventListener('click', function () {
      const category = this.dataset.category;
      const index = parseInt(this.dataset.index);
      callbacks.showRecipe(category, index);
    });
  });
}

/**
 * Toggle API key visibility
 */
export function toggleApiKeyVisibility(elements) {
  if (!elements.apiKeyInputContainer) return;

  if (elements.apiKeyInputContainer.style.display === 'none') {
    elements.apiKeyInputContainer.style.display = 'block';
  } else {
    elements.apiKeyInputContainer.style.display = 'none';
  }
}

/**
 * Handle API key change
 */
export function handleApiKeyChange(elements) {
  const key = elements.apiKeyInput.value.trim();
  if (key) {
    APP.apiKey = key;
    saveApiKey(key);
  }
}

/**
 * Clear conversation
 */
export function clearConversation(elements) {
  APP.conversationHistory = [];
  if (elements.aiSearchResponse) {
    elements.aiSearchResponse.innerHTML =
      '<div style="padding: 20px; color: #333;">Conversation cleared. Start fresh!</div>';
    elements.aiSearchResponse.classList.add('active');
  }
}
