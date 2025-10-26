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
 * Handle AI query
 */
export async function handleAIQuery(elements, callbacks) {
  const query = elements.aiQueryInput.value.trim();

  if (!query) {
    alert('Please enter a question or search query');
    return;
  }

  if (!APP.apiKey) {
    alert('Please enter your Anthropic API key first');
    if (elements.apiKeyInput) {
      elements.apiKeyInputContainer.style.display = 'block';
      elements.apiKeyInput.focus();
    }
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
    // Build context
    const allRecipes = APP.allResults.perfect.concat(
      APP.allResults.veryGood,
      APP.allResults.good,
    );

    const context = {
      inventory: APP.editableInventory,
      recipes: allRecipes.slice(0, 30),
      favorites: Array.from(APP.favorites),
      history: APP.history,
    };

    const result = await queryClaudeAPI(query, APP.conversationHistory, APP.apiKey, context);
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
