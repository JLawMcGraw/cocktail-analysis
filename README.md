# Cocktail Compatibility Analyzer

A web application that helps you review your bar stock and match it to cocktail recipes from your collection.

## Features

- **Upload Bar Stock**: Import your ingredient inventory via CSV
- **Upload Recipes**: Load one or multiple recipe collections
- **Compatibility Analysis**: See which cocktails you can make with what you have
- **Smart Shopping List**: Discover which ingredients would unlock the most new recipes
- **Ingredient Search**: Find cocktails that use specific ingredients from your bar
- **Detailed Recipe View**: See full instructions, ingredients, and what you're missing

## Quick Start

1. Open `index.html` in your web browser
2. Upload your bar stock CSV file (see format below)
3. Upload your recipe CSV file(s) (see format below)
4. Click "Analyze My Bar" to see results

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

1. **Better garnish handling**: Automatically treats garnish items as "have"
2. **Improved ingredient normalization**: Removes common modifiers like "fresh", "chilled"
3. **Shopping list improvements**: Shows singular/plural correctly, better cleaning
4. **Search improvements**: Shows result counts, handles edge cases
5. **Recipe card creation**: Extracted into reusable function
6. **CSS improvements**: Added file status styling, better error display
7. **Display counts**: Shows total recipe counts in section headers

### Remaining Opportunities for Enhancement

While the current version is much improved, here are potential future enhancements:

1. **Fuzzy Matching**: Use string similarity algorithms for even better ingredient matching
2. **Local Storage**: Save bar inventory and preferences between sessions
3. **Export Results**: Download your makeable recipes list
4. **Recipe Sorting**: Sort by compatibility, name, or ingredients needed
5. **Ingredient Substitutions**: Suggest alternatives for missing ingredients
6. **Mobile Optimization**: Better touch targets and responsive design
7. **Dark Mode**: Theme toggle for different preferences
8. **Recipe Filtering**: Filter by spirit type, glass, complexity
9. **Batch Operations**: Mark multiple recipes as favorites
10. **Print Stylesheet**: Print-friendly recipe cards

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
- **JavaScript (ES6+)**: Application logic
- **Papa Parse**: CSV parsing library

## File Structure

```
cocktail-analysis/
├── index.html              # Main application (single-page app)
├── sample-bar-stock.csv    # Example inventory file
├── sample-recipes.csv      # Example recipe file
└── README.md              # This file
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

### "No matching recipes found"
- Check that ingredient names match between your inventory and recipes
- Review common aliases in the code - you may need to add your specific brands
- Make sure your inventory CSV has `Stock Number` > 0 for available items

### "Invalid format" error
- Verify CSV has required columns: `Name` and `Stock Number` for inventory
- Verify CSV has required columns: `Drink Name` and `Ingredients` for recipes
- Check for proper CSV formatting (commas, quotes for multi-line cells)

### Recipes showing as 0% compatible
- Ingredient name mismatch between inventory and recipe
- Check capitalization and spelling
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
