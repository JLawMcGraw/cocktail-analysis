// API Client for data persistence
class APIClient {
  constructor(authClient) {
    this.auth = authClient;
    this.apiBaseUrl = 'http://localhost:3000/api';
  }

  // Helper to make authenticated API calls
  async makeRequest(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: this.auth.getAuthHeaders()
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Inventory methods
  async getInventory() {
    const data = await this.makeRequest('/inventory', 'GET');
    return data.inventory || [];
  }

  async saveInventory(inventory) {
    return await this.makeRequest('/inventory', 'POST', { inventory });
  }

  async deleteInventory() {
    return await this.makeRequest('/inventory', 'DELETE');
  }

  // Recipes methods
  async getRecipes() {
    const data = await this.makeRequest('/recipes', 'GET');
    return data.recipes || [];
  }

  async saveRecipes(recipes) {
    return await this.makeRequest('/recipes', 'POST', { recipes });
  }

  async deleteRecipes() {
    return await this.makeRequest('/recipes', 'DELETE');
  }

  // Favorites methods
  async getFavorites() {
    const data = await this.makeRequest('/user-data/favorites', 'GET');
    return data.favorites || [];
  }

  async saveFavorites(favorites) {
    return await this.makeRequest('/user-data/favorites', 'POST', { favorites });
  }

  // History methods
  async getHistory() {
    const data = await this.makeRequest('/user-data/history', 'GET');
    return data.history || {};
  }

  async saveHistory(history) {
    return await this.makeRequest('/user-data/history', 'POST', { history });
  }
}

// Create global API client instance
const apiClient = new APIClient(authClient);
