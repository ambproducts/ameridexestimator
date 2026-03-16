/* ==========================================================
   AMERIDEX ESTIMATOR - Product Catalog & Pricing Data

   AmeriDex is a GROOVED BOARD system.
   - Field boards: always grooved profile with DexerDry
     drainage mat pressed in; mounted with face screws
   - Solid boards: used ONLY for picture frame borders
     and breaker boards -- never as the field board
   - Layout patterns drive how much solid board is needed

   LAYOUT PATTERN FLAGS:
   hasBorder: true  => solid board runs the full perimeter (picture frame)
   hasBreaker: true => one solid board stripe across the deck width
   User picks one of four independent options.

   PRICING BASIS:
   - Board face width: 5.5"
   - Gap between boards (DexerDry seal): 1/8" (0.125")
   - Coverage per board: 5.625" = 0.46875 ft
   - AmeriDex DrySpace Decking retail: $10.00 / lin ft
   - Solid board retail:               $8.00  / lin ft

   All prices are retail material-only estimates (USD).
   ========================================================== */

const AMERIDEX_PRODUCTS = {

  boardDimensions: {
    faceWidthIn: 5.5,
    gapIn: 0.125,
    coverageIn: 5.625
  },

  /*
   * LAYOUT PATTERNS -- 4 independent user-selectable options.
   * No automatic combos. The user explicitly picks what they want.
   */
  layoutPatterns: [
    {
      id: 'standard',
      label: 'Standard Field',
      icon: '&#9776;',
      detail: 'Full AmeriDex DrySpace Decking field with DexerDry coil pressed in. Mounted with face screws. No accent boards. Most common layout.',
      hasBorder: false,
      hasBreaker: false
    },
    {
      id: 'picture-frame',
      label: 'Picture Frame Border',
      icon: '&#9645;',
      detail: 'AmeriDex DrySpace Decking field plus a solid board border running the full deck perimeter. Adds a clean, finished edge look.',
      hasBorder: true,
      hasBreaker: false
    },
    {
      id: 'breaker-board',
      label: 'Breaker Board',
      icon: '&#9135;',
      detail: 'AmeriDex DrySpace Decking field plus one solid board accent stripe running across the width of the deck. Breaks up the field visually.',
      hasBorder: false,
      hasBreaker: true
    },
    {
      id: 'pic-frame-breaker',
      label: 'Picture Frame + Breaker Board',
      icon: '&#9707;',
      detail: 'AmeriDex DrySpace Decking field with both a full perimeter solid border and one solid accent stripe across the deck width. Most detailed look.',
      hasBorder: true,
      hasBreaker: true
    }
  ],

  groovedBoard: {
    label: 'AmeriDex DrySpace Decking',
    retailPerLinFt: 10.00,
    pricePerSqFt: { low: 20.00, high: 23.00 }
  },

  solidBoard: {
    label: 'Solid Board',
    retailPerLinFt: 8.00,
    pricePerSqFt: { low: 16.00, high: 18.50 },
    pricePerLinFt: { low: 7.50, high: 8.75 }
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
