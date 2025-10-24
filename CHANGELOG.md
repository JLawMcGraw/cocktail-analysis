# Changelog

All notable changes and fixes to the Cocktail Compatibility Analyzer.

## [3.0.0] - 2025-10-23

### Major New Features

#### 🔍 Fuzzy Ingredient Matching
- **Implemented Levenshtein Distance Algorithm**: Automatically handles spelling variations
- **Solves Common Issues**: "passionfruit" now matches "passion fruit", "curaçao" matches "curacao"
- **Smart Normalization**: Removes spaces, punctuation, and special characters for matching
- **Configurable Threshold**: 85-90% similarity threshold for reliable matching
- **Fallback Matching**: Multi-level matching strategy (exact → partial → fuzzy)

**Example Use Cases:**
- "Passion fruit syrup" ↔ "Passionfruit syrup"
- "Orange Curaçao" ↔ "Orange Curacao"
- "Créme de banana" ↔ "Creme de banana"

#### 🤖 AI-Powered Cocktail Search
- **Natural Language Queries**: Ask questions in plain English
- **Tasting Note Search**: Find cocktails based on flavor profiles
- **Context-Aware**: AI knows your available ingredients and recipes
- **Ranked Recommendations**: Get 3-5 best matches for your query
- **Secure API Key Storage**: API key saved in browser's localStorage only

**Features:**
- Claude API integration using latest model (claude-3-5-sonnet-20241022)
- Fuzzy recipe name matching for AI responses
- Beautiful gradient UI design
- Collapsible API key section
- Example queries and usage tips
- Loading states and error handling

**Example Queries:**
- "What cocktails can I make with a funky, high-ester Jamaican rum?"
- "Show me refreshing drinks for summer"
- "I want something citrus-forward"
- "What can I make with Hamilton 86 that has molasses notes?"

### Technical Improvements

#### Fuzzy Matching Functions
- `stringSimilarity()`: Calculates similarity score (0-1) between two strings
- `levenshteinDistance()`: Classic edit distance algorithm implementation
- `fuzzyNormalize()`: Removes non-alphanumeric characters for comparison
- `areSimilarIngredients()`: High-level matching with configurable threshold
- Integrated into `hasIngredient()` function for automatic use

#### AI Integration
- `loadApiKey()`: Loads API key from localStorage on init
- `saveApiKey()`: Saves API key to localStorage on input
- `toggleApiKeyVisibility()`: Shows/hides API key input
- `handleAIQuery()`: Orchestrates AI query flow
- `queryClaudeAPI()`: Makes API call to Anthropic
- `displayAIRecommendations()`: Renders AI results with fuzzy matching

### UI/UX Enhancements

- New pink/purple gradient section for AI search
- Collapsible API key input with status indicator
- Example queries and usage tips
- AI thinking state with emoji
- Numbered recommendations display
- API key status messages (saved/not saved)

### Bug Fixes

- Fixed "passionfruit" vs "passion fruit" matching issue
- Improved alias system to be more comprehensive
- Better handling of ingredient name variations

### Sample Data Updates

- Added "Passionfruit Syrup" to sample inventory (was 0, now 1)
- Added "Hurricane" cocktail to sample recipes using "Passion Fruit Syrup"
- Demonstrates fuzzy matching in action

### Infrastructure

#### Proxy Server (v3.0.1)
- **Added `proxy-server.js`**: Node.js proxy server to handle AI API calls
- **Solves CORS Issue**: Browsers can't call Anthropic API directly due to security
- **Simple Setup**: Just run `node proxy-server.js` before using AI features
- **Port Configuration**: Runs on localhost:3000 by default
- **Error Handling**: Clear error messages and connection status
- **Security**: Forwards API key without storing it

**Why needed?**
- Browsers block direct API calls to external services (CORS policy)
- Proxy server runs locally and forwards requests securely
- Your API key stays on your computer only

**Added Files:**
- `proxy-server.js`: HTTP server that proxies requests to Anthropic
- `package.json`: Node.js project configuration

**Updated Files:**
- `index.html`: Changed API endpoint to use proxy at `http://localhost:3000/api/messages`
- `README.md`: Added proxy server setup instructions and troubleshooting
- Error messages now guide users to start the proxy server

## [2.0.0] - 2025-10-23

### Major Improvements

#### Security
- **Added XSS Protection**: Implemented `escapeHtml()` function to sanitize all user-generated content before rendering
- **Removed Inline Event Handlers**: Eliminated `onclick` attributes in dynamically generated HTML

#### Code Quality
- **Modernized JavaScript**: Replaced all `var` declarations with `const` and `let`
- **Improved Code Organization**: Created centralized `init()` function for setup
- **Better Event Handling**: Migrated from inline handlers to proper `addEventListener` patterns
- **Added Data Attributes**: Use `data-category` and `data-index` for cleaner event delegation

#### Error Handling & Validation
- **CSV Validation**: Added structure validation for uploaded files
- **Required Column Checks**: Verifies presence of `Name`, `Stock Number`, `Drink Name`, and `Ingredients`
- **Empty File Detection**: Catches and reports empty CSV files
- **Parse Error Handling**: Gracefully handles Papa Parse errors with user-friendly messages
- **Multiple File Error Tracking**: Properly tracks errors across multiple recipe file uploads

#### User Experience
- **File Upload Status**: Real-time feedback showing loading state and success/error status
- **Item Counts**: Shows how many items loaded from each file
- **Error Messages**: Clear, actionable error messages in red boxes
- **Info Messages**: Helpful information in blue boxes
- **Loading States**: Visual feedback during analysis
- **Display Limits**: Caps displayed recipes to prevent performance issues
  - Perfect matches: All shown
  - Very Good: First 20
  - Good: First 10
- **Count Indicators**: Shows total available vs. displayed count

#### Ingredient Matching
- **Better Normalization**: Removes more measurement terms (oz, ml, cl)
- **Modifier Removal**: Strips "fresh", "chilled", "cold", etc.
- **Garnish Auto-Match**: Automatically treats garnishes as available
- **Improved Alias System**: More comprehensive ingredient aliases
- **Additional Aliases**:
  - Absinthe/Pernod equivalence
  - Grapefruit juice variations
  - Crème de Banane variations
  - Blackberry brandy/liqueur

#### Shopping List
- **Singular/Plural Grammar**: Shows "recipe" vs "recipes" correctly
- **Increased Limit**: Shows top 15 items (was 10)
- **Better Cleaning**: Removes more noise from ingredient names

#### Search Functionality
- **Result Count Display**: Shows how many matches found
- **Singular/Plural Grammar**: "cocktail" vs "cocktails"
- **Display Limit**: Shows first 15 results with indicator
- **Empty State**: Clear message when no matches found
- **HTML Escaping**: Ingredient names properly escaped

#### Modal Improvements
- **Glass Type Display**: Shows recommended glass if available in recipe data
- **Better Closing**: Can close by clicking background
- **Improved Layout**: Better spacing and readability

#### Performance
- **Reduced Timeout**: Analysis timeout reduced from 500ms to 300ms
- **Display Limiting**: Prevents rendering thousands of DOM elements
- **Event Delegation**: More efficient event handling for recipe cards

### Bug Fixes

1. **Fixed memory leaks** from not properly removing event listeners
2. **Fixed modal click propagation** issues
3. **Fixed case sensitivity** in ingredient matching
4. **Fixed recipe file concatenation** with empty rows
5. **Fixed search response** not resetting properly
6. **Fixed missing status** not updating during multi-file upload
7. **Fixed ingredient list** not handling multi-line properly

### Code Refactoring

#### Extracted Functions
- `handleInventoryUpload()`: Inventory file processing
- `handleRecipeUpload()`: Recipe file processing
- `handleModalClick()`: Modal background click handling
- `handleSearch()`: Search button click handling
- `createAliasMap()`: Inventory alias generation
- `addAliases()`: Alias addition logic
- `normalizeIngredient()`: Ingredient name normalization
- `hasIngredient()`: Ingredient matching logic
- `createRecipeCard()`: Recipe card HTML generation
- `escapeHtml()`: XSS prevention

#### Improved Functions
- `checkReady()`: More robust ready state checking
- `showError()`: Consistent error display
- `displayResults()`: Better performance with limits
- `showRecipe()`: Added null checking, glass display
- `generateShoppingList()`: Better text handling
- `setupSearch()`: Filters out more common items

### Documentation

- **Comprehensive README**: Full usage guide, CSV format specs, troubleshooting
- **Code Review Section**: Detailed analysis of all fixes and improvements
- **Sample Files**: Included working examples for testing
- **Architecture Notes**: Documented app structure and data flow
- **Performance Notes**: Explained optimization decisions
- **Browser Compatibility**: Listed supported browsers

### Technical Debt Addressed

1. ✅ Replaced inline styles and event handlers
2. ✅ Added proper error boundaries
3. ✅ Improved variable naming consistency
4. ✅ Removed global function pollution
5. ✅ Added input validation
6. ✅ Improved code comments and structure
7. ✅ Centralized DOM element references

### Remaining Known Issues

1. Ingredient aliases are still hardcoded (by design for simplicity)
2. No fuzzy matching for typos
3. No local storage persistence
4. Mobile UX could be improved
5. No unit tests

### Future Enhancement Ideas

See README.md "Remaining Opportunities for Enhancement" section for a full list of potential improvements.

---

## [1.0.0] - Original Version

### Features
- Basic CSV upload for inventory and recipes
- Ingredient matching with hardcoded aliases
- Recipe compatibility scoring
- Shopping list generation
- Ingredient search
- Modal recipe details

### Known Issues in Original
- No error handling
- Security vulnerabilities (XSS)
- Used ES5 JavaScript patterns
- Poor code organization
- No input validation
- Inconsistent event handling
- No user feedback during operations
- Could render too many DOM elements
