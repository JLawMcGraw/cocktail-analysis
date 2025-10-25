# Changelog

All notable changes and fixes to the Cocktail Compatibility Analyzer.

## [5.0.0] - 2025-10-25

### Major Design Overhaul

#### 🎨 Modern Tropical Minimalist Design
- **Complete Visual Redesign**: Apple-inspired minimalist aesthetic with tropical cocktail accents
- **New Color Palette**: Ocean teal primary (#0a7ea4), coral (#ff7b54), sunset orange (#ffa94d), palm green (#10b981)
- **Fixed Sidebar Navigation**: Replaced cluttered one-page layout with clean fixed left sidebar
- **Modern Components**: Enhanced shadows, rounded corners (16px), smooth transitions
- **Professional Typography**: Clean, readable font stack with proper hierarchy
- **Responsive Cards**: Beautiful grid layouts for recipes, inventory, and favorites
- **CSS Variables**: Theme-based design system for easy customization

#### 🤖 Enhanced Context-Aware AI Bartender
- **Full Inventory Context**: AI receives complete bottle inventory with ALL tasting notes
  - Includes Profile (Nose), Palate, Finish for each spirit
  - References specific bottles by name when making recommendations
  - Understands ABV, distillery location, age statements
- **Favorites Awareness**: AI knows which cocktails you've favorited
- **History Integration**: AI sees which drinks you've made, rated, and your personal notes
- **Personalized Recommendations**: AI explains WHY it recommends cocktails based on YOUR inventory
- **Better UI**: Clean card-based examples showing different query types
- **Context Information**: Shows users exactly what the AI knows about their bar
- **Keyboard Shortcuts**: Press Enter to send queries, Shift+Enter for new lines
- **Optimized Prompts**: Reduced context size while maintaining rich personalization

#### 🔍 Smart Discovery System
- **Quick Action Buttons**:
  - 🎲 Random Cocktail - Discover something new
  - ✨ Perfect Matches - Recipes you can make with everything you have
  - 📍 Missing 1 Ingredient - Almost makeable drinks for shopping planning
- **Sort Options**: Sort by compatibility, alphabetically (A-Z or Z-A)
- **Recently Viewed**: Automatic tracking of last 6 viewed recipes with timestamps
- **Removed Redundant Search**: Eliminated recipe name search bar (ingredient selector already handles search)
- **Real-Time Filtering**: Instant updates when you click quick actions

#### 📱 Improved User Experience
- **Tab-Based Navigation**: Clean sections for Recipes, Inventory, Favorites, AI Bartender
- **Persistent Tabs**: Remember which tab you were on between sessions
- **Better Modal Design**: Enhanced recipe details with modern styling
- **Loading States**: Clear visual feedback during operations
- **Status Indicators**: Better file upload status and AI connection status
- **Mobile-Friendly**: Improved touch targets and responsive layouts

### Technical Improvements

#### UI/UX Architecture
- Fixed sidebar navigation with icon-enhanced tabs
- Page headers with titles and subtitles for each section
- Grid layouts with proper spacing and hover effects
- Enhanced modal animations and transitions
- Better color contrast for accessibility

#### AI Integration Enhancements
- `queryClaudeAPI()`: Now sends full bottle metadata including tasting notes
- Context building includes up to 40 spirits with complete profiles
- Favorites context (top 10 favorites)
- History context (up to 15 made cocktails with ratings and notes)
- Optimized token usage while maintaining rich context
- Better error messages for API issues

#### State Management
- `APP.currentTab`: Track active navigation tab
- `APP.recentlyViewed`: Array of last 6 viewed recipes with timestamps
- Tab persistence in localStorage
- Improved favorites and history tracking

#### Event Handling
- Enter key submits AI queries (Shift+Enter for new line)
- Tab switching with proper active states
- Quick action buttons for common filters
- Sort select with real-time updates

### Bug Fixes

1. **Fixed favorites/made-this buttons** in recipe modal by using data attributes instead of inline onclick
2. **Fixed tab navigation** to properly show/hide content
3. **Improved localStorage persistence** for all user data
4. **Fixed analyze button** to work with saved inventory from localStorage
5. **Better error handling** for API calls and network issues

### Performance

- CSS transitions for smooth animations (200ms)
- Efficient tab switching without page reloads
- Optimized AI context building (reduced by ~40% tokens)
- Grid layouts with proper lazy rendering
- Event delegation for dynamic content

### Files Updated

- `index.html`: Complete redesign with sidebar navigation, enhanced AI, and modern styling
- `proxy-server.js`: No changes (still handles AI API forwarding)
- `CHANGELOG.md`: This file
- `README.md`: Updated documentation for new design and features

### Migration Notes

- All existing data (favorites, history, inventory) automatically migrates
- No changes needed to CSV formats
- Proxy server setup remains the same
- API keys are preserved in localStorage

## [4.0.0] - 2025-10-24

### Major New Features

#### 📦 Complete Bottle Data Preservation (12 CSV Columns)
- **Full Metadata Support**: Now preserves ALL 12 columns from your bar stock CSV
- **Supported Fields**:
  - Liquor Type
  - Name
  - Stock Number
  - Detailed Spirit Classification
  - Distillation Method
  - ABV (%)
  - Distillery Location
  - Age Statement or Barrel Finish
  - Additional Notes
  - Profile (Nose)
  - Palate
  - Finish
- **Rich Display**: Organized cards showing type, location, ABV, aging, and full tasting profiles
- **Complete Export**: CSV export preserves all 12 columns with proper escaping
- **localStorage Persistence**: All bottle data saved between sessions

#### 💬 Conversational AI Bartender
- **Multi-Turn Dialogue**: Have back-and-forth conversations with the AI
- **Context Preservation**: AI remembers previous messages in the conversation
- **Explanatory Responses**: AI now explains WHY it recommends each cocktail
- **Clear Conversation**: Button to reset and start fresh
- **Optimized Prompts**: Reduced token usage by 70-80% to avoid rate limits
- **Model Compatibility**: Uses Claude 3 Haiku for broad API key compatibility

#### ❤️ Favorites & History Tracking
- **Favorite Drinks**: Heart button to save your favorite cocktails
- **"Made This" Tracking**: Record when you make drinks with timestamp history
- **5-Star Rating System**: Rate cocktails you've tried
- **Personal Notes**: Add your own tasting notes and modifications
- **localStorage Persistence**: All favorites and history saved locally
- **Dedicated Section**: Beautiful UI showing all your favorites

#### 🏠 Inventory Management System
- **Live Add/Remove**: Manage your bar stock without re-uploading CSVs
- **Real-Time Updates**: Recipe compatibility updates instantly when you add/remove bottles
- **Grid Display**: Clean card-based layout showing all your bottles
- **Rich Bottle Cards**: Display all metadata (type, distillery, ABV, tasting notes, etc.)
- **Export Functionality**: Export your current inventory back to CSV
- **Persistent Storage**: Inventory saved in localStorage between sessions

### Technical Improvements

#### Data Handling
- `analyze()`: Now explicitly preserves all 12 CSV columns
- `displayInventoryManager()`: Shows organized multi-line bottle information
- `addIngredient()`: Creates bottles with complete metadata structure
- `exportInventory()`: Exports all columns with proper CSV escaping
- Backwards compatibility with old string-based inventory format

#### UI/UX Enhancements
- Wider inventory cards (350px minimum) to accommodate rich data
- New `.inventory-tasting-profile` CSS styling for formatted tasting notes
- Organized display: Type • Classification / Location • ABV • Age
- Collapsible tasting profile sections (Nose/Palate/Finish)
- Emoji indicators for additional notes

#### AI Integration
- Conversation history tracking with `APP.conversationHistory`
- Token optimization: Send only first 3-4 ingredients per recipe
- Limit to 30 recipes in AI context
- Remove verbose descriptions to stay under rate limits
- Better error messages for rate limit issues

#### Favorites System
- `toggleFavorite()`: Add/remove favorites with heart button
- `markAsMade()`: Track when drinks are made
- `setRating()`: 5-star rating system
- `saveNotes()`: Personal tasting notes
- All data stored in localStorage with JSON serialization

#### Inventory Management
- `loadSavedInventory()`: Load from localStorage on init
- `saveInventory()`: Save after every change
- `reanalyzeWithCurrentInventory()`: Instant recipe re-analysis
- `displayInventoryManager()`: Rich card display
- Event delegation for remove buttons

### Bug Fixes

1. **Fixed rate limit errors** by optimizing AI prompt size
2. **Fixed ingredient search** to use fuzzy matching in dropdown
3. **Fixed conversation flow** - AI now explains recommendations
4. **Fixed data loss** - All CSV columns now preserved through the app
5. **Fixed export** - CSV export now includes all metadata

### Performance

- Real-time recipe analysis without page reload
- Efficient localStorage usage for persistence
- Grid layout optimizations for many bottles
- Instant UI updates on inventory changes

### Files Updated

- `index.html`: Added favorites, history, inventory management, conversational AI, and 12-column support
- `proxy-server.js`: Existing proxy server for AI API calls
- Sample CSVs remain compatible

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
