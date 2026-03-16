/* ==========================================================
   AMERIDEX ESTIMATOR - Product Catalog & Pricing Data

   AmeriDex is a GROOVED BOARD system.
   - Field boards: always grooved profile with DexerDry
     drainage mat pressed in; mounted with face screws
   - Solid boards: used ONLY for picture frame borders
     and breaker boards — never as the field board
   - Layout patterns drive how much solid board is needed

   Update prices here to keep the estimator current.
   All prices are retail material-only estimates (USD).
   ========================================================== */

const AMERIDEX_PRODUCTS = {

  /*
   * LAYOUT PATTERNS
   * The field is always grooved board with DexerDry and face screws.
   * Solid board is added only where the pattern requires it.
   *
   * solidBorderFactor: multiplier of perimeter linear feet for border boards
   *   - pictureFrame uses 1 pass of solid board around the perimeter
   *   - picFrameBreaker adds 1 additional solid board stripe across the deck
   *     (estimated as deck width, i.e. sqrt(sqFt) as a rough single-run)
   *
   * groovePriceSqFt: price range for the grooved field portion
   * solidPriceLinFt: price range for solid accent boards (border + breaker)
   */
  layoutPatterns: [
    {
      id: 'standard',
      label: 'Standard Field',
      icon: '&#9776;',
      detail: 'Full grooved board field with DexerDry drainage mat pressed in. Mounted with face screws. Most common layout.',
      hasBorder: false,
      hasBreaker: false
    },
    {
      id: 'picture-frame',
      label: 'Picture Frame Border',
      icon: '&#9645;',
      detail: 'Grooved field with DexerDry and face screws, plus a solid board border running the full perimeter. Clean, finished edge look.',
      hasBorder: true,
      hasBreaker: false
    },
    {
      id: 'pic-frame-breaker',
      label: 'Picture Frame + Breaker Board',
      icon: '&#9707;',
      detail: 'Grooved field with DexerDry and face screws, solid perimeter border, plus one solid board accent stripe across the width of the deck.',
      hasBorder: true,
      hasBreaker: true
    }
  ],

  /* Grooved field board pricing (per sq ft, with waste applied in calc) */
  groovedBoard: {
    label: 'Grooved Field Board (with DexerDry, face screws)',
    pricePerSqFt: { low: 4.50, high: 6.25 }
  },

  /* Solid board pricing for border / breaker use (per lin ft) */
  solidBoard: {
    label: 'Solid Board',
    pricePerLinFt: { low: 3.50, high: 5.00 }
  },

  colors: [
    { id: 'coastal-gray',   label: 'Coastal Gray',   hex: '#9aa5ad' },
    { id: 'driftwood',      label: 'Driftwood',      hex: '#b8a58a' },
    { id: 'teak',           label: 'Teak',           hex: '#c49a5a' },
    { id: 'cedar',          label: 'Cedar',          hex: '#a0522d' },
    { id: 'espresso',       label: 'Espresso',       hex: '#3b2314' },
    { id: 'slate',          label: 'Slate',          hex: '#6b7280' },
    { id: 'weathered-wood', label: 'Weathered Wood', hex: '#7a6a58' },
    { id: 'white-sand',     label: 'White Sand',     hex: '#e8e0d0' },
    { id: 'charcoal',       label: 'Charcoal',       hex: '#2d2d2d' },
    { id: 'island-mist',    label: 'Island Mist',    hex: '#c8d4d8' }
  ],

  framing: {
    label: 'Subframe / Framing',
    pricePerSqFt: { low: 2.00, high: 3.75 }
  },

  accessories: {
    railings: {
      label: 'Railings',
      pricePerLinFt: { low: 18.00, high: 28.00 },
      defaultLinFt: 48
    },
    fascia: {
      label: 'Fascia Boards',
      pricePerSqFt: { low: 0.60, high: 1.10 }
    },
    stairs: {
      label: 'Stair Stringers (1 set)',
      flatRate: { low: 280, high: 480 }
    }
  }

};
