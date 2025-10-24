# Cocktail Compatibility Analyzer

A web application that helps you review your bar stock and match it to cocktail recipes from your collection.

## Features

- **Upload Bar Stock**: Import your ingredient inventory via CSV
- **Upload Recipes**: Load one or multiple recipe collections
- **Compatibility Analysis**: See which cocktails you can make with what you have
- **Fuzzy Ingredient Matching**: Automatically handles spelling variations like "passionfruit" vs "passion fruit"
- **AI-Powered Search**: Ask natural language questions and search by tasting notes using Claude AI
- **Smart Shopping List**: Discover which ingredients would unlock the most new recipes
- **Ingredient Search**: Find cocktails that use specific ingredients from your bar
- **Detailed Recipe View**: See full instructions, ingredients, and what you're missing

## Quick Start

### Basic Usage (No AI)

1. Open `index.html` in your web browser
2. Upload your bar stock CSV file (see format below)
3. Upload your recipe CSV file(s) (see format below)
4. Click "Analyze My Bar" to see results

### With AI-Powered Search

1. **Start the proxy server** (required for AI features):
   ```bash
   node proxy-server.js
   ```
   You should see: `🍹 Cocktail Analyzer Proxy Server Running`

2. **Open the app** in your browser:
   - Open `index.html` in your web browser

3. **Analyze your bar**:
   - Upload your inventory and recipe files
   - Click "Analyze My Bar"

4. **Set up AI search**:
   - Get an API key from [Anthropic's Console](https://console.anthropic.com/)
   - Click "Show/Hide" in the AI search section
   - Enter your API key
   - Start asking questions!

## AI-Powered Search

The app now includes AI-powered cocktail recommendations using Claude! You can:

- Ask questions in natural language ("What can I make that's refreshing?")
- Search by tasting notes ("I have a funky, high-ester Jamaican rum")
- Find cocktails for specific occasions ("Show me easy tiki drinks")
- Get personalized recommendations based on flavor profiles

### Setting Up AI Search

**Prerequisites:**
- Node.js installed on your computer ([Download](https://nodejs.org/))
- Anthropic API key ([Get one here](https://console.anthropic.com/))

**Setup Steps:**

1. **Start the proxy server:**
   ```bash
   node proxy-server.js
   ```
   Keep this running in the terminal while using the app.

   **Why is a proxy needed?** Browsers block direct API calls to Anthropic due to CORS (security). The proxy server handles this for you.

2. **Use the app:**
   - Open `index.html` in your browser
   - Analyze your bar
   - Click "Show/Hide" in the AI section
   - Enter your API key (saved in browser localStorage)
   - Ask away!

**Security Note:** Your API key is stored locally in your browser only. The proxy server runs on your computer and forwards requests to Anthropic without storing your key.

### AI Search Examples

- "What cocktails can I make with a funky, high-ester Jamaican rum?"
- "Recommend drinks for a hot summer day"
- "What can I make with my Hamilton 86 that has notes of molasses and caramel?"
- "Show me tiki drinks with tropical flavors"
- "I want something citrus-forward and refreshing"
- "What's the easiest cocktail I can make right now?"

## CSV File Formats

### Bar Stock CSV

Your inventory CSV should have these columns:
- `Name`: Ingredient name
- `Stock Number`: Quantity (use 1 for in stock, 0 for out of stock)
- `Category`: (Optional) Type of ingredient

Example:
```csv
Name,Stock Number,Category
Cruzan Single Barrel Rum,1,Rum
Simple Syrup,1,Syrup
Lime Juice,1,Juice
Coconut Cream,0,Mixer
```

### Recipe CSV

Your recipe CSV should have these columns:
- `Drink Name`: Name of the cocktail
- `Ingredients`: List of ingredients (one per line)
- `Instructions`: How to make it
- `Glass`: (Optional) Type of glass to use

Example:
```csv
Drink Name,Ingredients,Instructions,Glass
Daiquiri,"2 oz Light Rum
1 oz Fresh Lime Juice
3/4 oz Simple Syrup","Shake all ingredients with ice. Strain into chilled coupe glass.",Coupe Glass
```

## Testing

Sample files are included:
- `sample-bar-stock.csv` - Example bar inventory
- `sample-recipes.csv` - Example cocktail recipes

## Code Review & Improvements

### Issues Fixed

#### 1. **Modern JavaScript**
- **Before**: Used `var` throughout (ES5 style)
- **After**: Uses `const` and `let` (ES6+)
- **Why**: Better scoping, prevents accidental reassignment, clearer intent

#### 2. **Error Handling**
- **Before**: No validation of CSV files, no error messages
- **After**: Validates CSV structure, shows helpful error messages, handles parse failures
- **Why**: Better user experience, easier debugging

#### 3. **Security**
- **Before**: Direct HTML injection without sanitization
- **After**: Added `escapeHtml()` function to prevent XSS attacks
- **Why**: Security vulnerability that could allow malicious code execution

#### 4. **Event Handlers**
- **Before**: Inline `onclick` attributes in HTML strings
- **After**: Proper event listeners with `addEventListener` and data attributes
- **Why**: Follows best practices, easier to debug, better separation of concerns

#### 5. **Code Organization**
- **Before**: Mix of inline event handlers and listeners
- **After**: Centralized initialization function, consistent event handling
- **Why**: More maintainable, easier to understand code flow

#### 6. **User Feedback**
- **Before**: No loading states, unclear file upload status
- **After**: Shows file loading status, validation messages, counts of items loaded
- **Why**: Users know what's happening and can troubleshoot issues

#### 7. **Ingredient Matching**
- **Before**: Basic string matching that could miss valid matches
- **After**: Improved normalization, better alias system, handles more edge cases
- **After**: Added more comprehensive aliases for common ingredients
- **Why**: More accurate matching = better results

#### 8. **Data Validation**
- **Before**: No checks for empty files or missing required columns
- **After**: Validates CSV structure, checks for required columns, skips empty rows
- **Why**: Prevents crashes and confusing behavior

#### 9. **Display Limits**
- **Before**: Could render thousands of recipe cards
- **After**: Limits display to reasonable numbers with count shown
- **Why**: Better performance, less overwhelming for users

#### 10. **Accessibility**
- **Before**: Modal close only via X button
- **After**: Can also close by clicking background
- **Why**: Better UX, follows common patterns

### Additional Improvements Made

1. **Fuzzy Ingredient Matching**: Implements Levenshtein distance algorithm to handle spelling variations
   - Automatically matches "passionfruit" with "passion fruit"
   - Handles spacing differences, punctuation, and minor typos
   - Configurable similarity threshold (default 85-90%)

2. **AI-Powered Search**: Integration with Anthropic's Claude API
   - Natural language queries about cocktails
   - Tasting note-based recommendations
   - Considers user's available ingredients
   - Provides ranked recommendations
   - Secure API key storage in localStorage

3. **Better garnish handling**: Automatically treats garnish items as "have"
4. **Improved ingredient normalization**: Removes common modifiers like "fresh", "chilled"
5. **Shopping list improvements**: Shows singular/plural correctly, better cleaning
6. **Search improvements**: Shows result counts, handles edge cases
7. **Recipe card creation**: Extracted into reusable function
8. **CSS improvements**: Added file status styling, better error display, AI section styling
9. **Display counts**: Shows total recipe counts in section headers

### Remaining Opportunities for Enhancement

While the current version is much improved, here are potential future enhancements:

1. ~~**Fuzzy Matching**: Use string similarity algorithms for even better ingredient matching~~ ✅ Implemented!
2. ~~**AI-Powered Search**: Natural language queries and tasting note search~~ ✅ Implemented!
3. **Local Storage**: Save bar inventory and recipe data between sessions
4. **Export Results**: Download your makeable recipes list
5. **Recipe Sorting**: Sort by compatibility, name, or ingredients needed
6. **Ingredient Substitutions**: Suggest alternatives for missing ingredients
7. **Mobile Optimization**: Better touch targets and responsive design
8. **Dark Mode**: Theme toggle for different preferences
9. **Recipe Filtering**: Filter by spirit type, glass, complexity
10. **Batch Operations**: Mark multiple recipes as favorites
11. **Print Stylesheet**: Print-friendly recipe cards

### Architecture Notes

The application uses a simple but effective architecture:

```
APP (State)
├── inventoryData (raw CSV data)
├── recipeData (raw CSV data)
├── currentInventory (processed Map with aliases)
└── allResults (analyzed results)

Elements (DOM References)
└── All interactive elements cached for performance

Event Flow
1. File upload → Parse CSV → Validate → Store in APP
2. Analyze button → Process inventory → Match recipes → Display results
3. Recipe click → Show modal with details
4. Search → Filter recipes → Display matches
```

### Performance Considerations

- File parsing is asynchronous to prevent UI blocking
- Uses `setTimeout` for analysis to keep UI responsive
- Limits displayed results to prevent DOM bloat
- Event delegation where appropriate
- Caches DOM elements to avoid repeated queries

### Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript (const, let, arrow functions, template literals)
- CSS Grid and Flexbox
- File API for CSV upload

Should work in:
- Chrome/Edge 60+
- Firefox 60+
- Safari 12+

## Technical Stack

- **HTML5**: Structure
- **CSS3**: Styling with gradients, animations, grid layout
- **JavaScript (ES6+)**: Application logic, fuzzy matching algorithms
- **Papa Parse**: CSV parsing library (CDN)
- **Node.js**: Proxy server for AI API calls
- **Anthropic Claude API**: AI-powered cocktail recommendations

## File Structure

```
cocktail-analysis/
├── index.html              # Main application (single-page app)
├── proxy-server.js         # Node.js proxy server for AI API calls
├── package.json            # Node.js project configuration
├── sample-bar-stock.csv    # Example inventory file
├── sample-recipes.csv      # Example recipe file
├── CHANGELOG.md           # Detailed version history
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## Known Limitations

1. **Ingredient Aliases**: Aliases are hardcoded for common rum brands and ingredients. You may need to adjust the `addAliases()` function for your specific collection.

2. **Measurement Parsing**: The app doesn't understand ingredient quantities, only presence/absence.

3. **Garnishes**: Simple garnish detection by keyword. Complex garnishes might be marked as missing.

4. **Browser-Only**: No backend, all processing happens in browser. Large recipe collections (1000+) might be slow.

5. **No Persistence**: Data is lost on page reload.

## Tips for Best Results

1. **Consistent Naming**: Use consistent ingredient names in both your inventory and recipes
2. **Full Names**: Use full ingredient names rather than abbreviations
3. **One Item Per Line**: In recipe CSVs, put each ingredient on its own line
4. **Include Quantities**: While not used for matching, they're shown in recipe details
5. **Update Aliases**: Modify the `addAliases()` function to match your specific brands

## Troubleshooting

### AI Search Issues

**"Cannot connect to proxy server"**
- Make sure the proxy server is running: `node proxy-server.js`
- Check that the server started successfully (you should see the banner)
- Verify the server is running on port 3000
- Check your firewall isn't blocking localhost connections

**"Port 3000 is already in use"**
- Another application is using port 3000
- Stop the other application, or
- Edit `proxy-server.js` and change the `PORT` variable
- Also update the port in `index.html` (search for `localhost:3000`)

**AI returns unexpected results**
- Try rephrasing your query more specifically
- Include flavor descriptors or cocktail styles
- Make sure you've analyzed your bar first

### General Issues

**"No matching recipes found"**
- Check that ingredient names match between your inventory and recipes
- Review common aliases in the code - you may need to add your specific brands
- Make sure your inventory CSV has `Stock Number` > 0 for available items

**"Invalid format" error**
- Verify CSV has required columns: `Name` and `Stock Number` for inventory
- Verify CSV has required columns: `Drink Name` and `Ingredients` for recipes
- Check for proper CSV formatting (commas, quotes for multi-line cells)

**Recipes showing as 0% compatible**
- Ingredient name mismatch between inventory and recipe
- The fuzzy matching should help, but very different spellings might not match
- Add custom aliases for your brands in the `addAliases()` function

## License

This is a personal project tool. Feel free to use and modify for your own bar management needs.

## Contributing

To improve the ingredient matching:
1. Find the `addAliases()` function in `index.html`
2. Add your specific brand mappings
3. Test with your recipe collection

## Support

For issues or questions, please refer to the troubleshooting section above.

---

Happy mixing! 🍹
