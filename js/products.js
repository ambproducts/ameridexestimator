/* ==========================================================
   AMERIDEX ESTIMATOR - Product Catalog & Pricing Data

   AmeriDex is a GROOVED BOARD system.
   - Field boards: always grooved profile with DexerDry
     drainage mat pressed in; mounted with face screws
   - Solid boards: used ONLY for picture frame borders
     and breaker boards -- never as the field board
   - Layout patterns drive how much solid board is needed

   PRICING BASIS:
   - Board face width: 5.5"
   - Gap between boards (DexerDry seal): 1/8" (0.125")
   - Coverage per board: 5.625" = 0.46875 ft
   - Lin ft of board per sq ft of deck: 1 / 0.46875 = ~2.1333
   - Grooved board retail: $10.00 / lin ft => $21.33 / sq ft
   - Solid board retail:   $8.00  / lin ft => $17.07 / sq ft

   All prices are retail material-only estimates (USD).
   ========================================================== */

const AMERIDEX_PRODUCTS = {

  /*
   * BOARD DIMENSIONS
   * Used by the calculator to convert sq ft deck area into lin ft of board.
   * faceWidthIn:  nominal face width of the board in inches
   * gapIn:        spacing between boards (DexerDry seal gap) in inches
   * coverageIn:   effective coverage per board = faceWidthIn + gapIn
   */
  boardDimensions: {
    faceWidthIn: 5.5,
    gapIn: 0.125,
    coverageIn: 5.625
  },

  /*
   * LAYOUT PATTERNS
   * The field is always grooved board with DexerDry and face screws.
   * Solid board is added only where the pattern requires it.
   */
  layoutPatterns: [
    {
      id: 'standard',
      label: 'Standard Field',
      icon: '&#9776;',
      detail: 'Full grooved board field with DexerDry coil pressed in. Mounted with face screws. Most common layout.',
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

  /*
   * Grooved field board pricing.
   * Retail: $10.00 / lin ft
   * Converted: $10.00 x (12 / 5.625) = $21.33 / sq ft
   * Low/high range: +/- ~5% for regional pricing variation
   */
  groovedBoard: {
    label: 'Grooved Field Board (with DexerDry, face screws)',
    retailPerLinFt: 10.00,
    pricePerSqFt: { low: 20.00, high: 23.00 }
  },

  /*
   * Solid board pricing for border / breaker use.
   * Retail: $8.00 / lin ft
   * Converted: $8.00 x (12 / 5.625) = $17.07 / sq ft
   * Low/high range: +/- ~5% for regional pricing variation
   */
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
