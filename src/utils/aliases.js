/**
 * Ingredient alias management
 */

/**
 * Add common ingredient aliases to inventory map
 * @param {Map} inv - Inventory map
 * @param {string} name - Ingredient name
 */
export function addAliases(inv, name) {
  // Rum aliases
  if (name.includes('cruzan single barrel')) {
    [
      'aged rum',
      'gold rum',
      'virgin islands rum',
      'gold virgin islands rum',
      'dark rum',
      'aged virgin islands rum',
      'gold barbados rum',
    ].forEach((alias) => inv.set(alias, true));
  }
  if (name.includes('cruzan 151')) {
    [
      '151-proof caribbean rum',
      'amber 151-proof rum',
      '151-proof rum',
    ].forEach((alias) => inv.set(alias, true));
  }
  if (name.includes('cruzan') && name.includes('light')) {
    [
      'light rum',
      'light puerto rican rum',
      'light virgin islands rum',
      'white rum',
    ].forEach((alias) => inv.set(alias, true));
  }
  if (name.includes('hamilton 86')) {
    [
      'gold rum',
      'demerara rum',
      'gold puerto rican rum',
      '86-proof demerara rum',
    ].forEach((alias) => inv.set(alias, true));
  }
  if (name.includes('hamilton jamaican')) {
    ['dark jamaican rum', 'dark rum', 'jamaican rum'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('hamilton 151')) {
    [
      'lemon hart 151',
      'lemon hart 151-proof demerara rum',
      '151-proof demerara rum',
    ].forEach((alias) => inv.set(alias, true));
  }

  // Liqueur aliases
  if (name.includes('curaçao') || name.includes('curacao')) {
    ['orange curacao', 'orange curaçao'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('banana')) {
    ['creme de banana', 'banana liqueur', 'crème de banane'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('raspberry')) {
    ['raspberry liqueur', 'raspberry syrup'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('blackberry')) {
    ['blackberry brandy', 'blackberry liqueur'].forEach((alias) =>
      inv.set(alias, true)
    );
  }

  // Syrup aliases
  if (name.includes('simple syrup') || name.includes('sugar syrup')) {
    ['simple syrup', 'sugar syrup', 'rock candy syrup'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('orgeat')) {
    ['orgeat syrup', 'orgeat'].forEach((alias) => inv.set(alias, true));
  }
  if (name.includes('grenadine')) {
    inv.set('grenadine', true);
  }
  if (name.includes('demerara') && name.includes('syrup')) {
    ['demerara sugar syrup', 'demerara syrup'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('falernum')) {
    ['falernum', 'velvet falernum'].forEach((alias) => inv.set(alias, true));
  }
  if (name.includes('passion')) {
    [
      'passion fruit syrup',
      'passionfruit syrup',
      'passion fruit',
      'passionfruit',
    ].forEach((alias) => inv.set(alias, true));
  }

  // Juice aliases
  if (name.includes('lime') && !name.includes('sublime')) {
    ['lime juice', 'fresh lime juice'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('lemon') && name.includes('juice')) {
    ['lemon juice', 'fresh lemon juice'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('pineapple')) {
    ['pineapple juice', 'unsweetened pineapple juice'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('orange') && name.includes('juice')) {
    ['orange juice', 'fresh orange juice'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (name.includes('grapefruit')) {
    ['grapefruit juice', 'fresh grapefruit juice'].forEach((alias) =>
      inv.set(alias, true)
    );
  }

  // Bitters aliases
  if (name.includes('angostura')) {
    inv.set('angostura bitters', true);
  }

  // Mixer aliases
  if (name.includes('ginger beer')) {
    ['ginger beer', 'chilled ginger beer'].forEach((alias) =>
      inv.set(alias, true)
    );
  }
  if (
    name.includes('sparkling water') ||
    name.includes('club soda') ||
    name.includes('soda water')
  ) {
    [
      'club soda',
      'soda water',
      'chilled club soda',
      'sparkling water',
    ].forEach((alias) => inv.set(alias, true));
  }
  if (name.includes('pernod')) {
    inv.set('pernod', true);
  }
  if (name.includes('absinthe')) {
    ['absinthe', 'pernod'].forEach((alias) => inv.set(alias, true));
  }
}
