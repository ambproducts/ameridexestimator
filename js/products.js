/* ==========================================================
   AMERIDEX ESTIMATOR - Product Catalog & Pricing Data
   Update prices here to keep the estimator current.
   All prices are retail material-only estimates (USD).
   ========================================================== */

const AMERIDEX_PRODUCTS = {

  boardStyles: [
    {
      id: 'grooved',
      label: 'Grooved Board',
      icon: '&#9641;',
      detail: 'Most popular. Works with hidden fastener clips for a clean, fastener-free surface.',
      pricePerSqFt: { low: 4.50, high: 6.25 }
    },
    {
      id: 'solid',
      label: 'Solid Board',
      icon: '&#9644;',
      detail: 'Traditional profile. Face-screw or hidden-fastener installation. Great for heavy-use areas.',
      pricePerSqFt: { low: 3.75, high: 5.50 }
    },
    {
      id: 'capped',
      label: 'Capped Composite',
      icon: '&#11036;',
      detail: 'Four-sided polymer cap for maximum stain, fade, and scratch resistance.',
      pricePerSqFt: { low: 6.00, high: 8.50 }
    },
    {
      id: 'pvc',
      label: 'PVC / Cellular PVC',
      icon: '&#9649;',
      detail: '100% PVC core. Ideal for docks, pool decks, and high-moisture environments.',
      pricePerSqFt: { low: 7.00, high: 10.00 }
    }
  ],

  colors: [
    { id: 'coastal-gray',    label: 'Coastal Gray',    hex: '#9aa5ad' },
    { id: 'driftwood',       label: 'Driftwood',       hex: '#b8a58a' },
    { id: 'teak',            label: 'Teak',            hex: '#c49a5a' },
    { id: 'cedar',           label: 'Cedar',           hex: '#a0522d' },
    { id: 'espresso',        label: 'Espresso',        hex: '#3b2314' },
    { id: 'slate',           label: 'Slate',           hex: '#6b7280' },
    { id: 'weathered-wood',  label: 'Weathered Wood',  hex: '#7a6a58' },
    { id: 'white-sand',      label: 'White Sand',      hex: '#e8e0d0' },
    { id: 'charcoal',        label: 'Charcoal',        hex: '#2d2d2d' },
    { id: 'island-mist',     label: 'Island Mist',     hex: '#c8d4d8' }
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
    fasteners: {
      label: 'Hidden Fastener System',
      pricePerSqFt: { low: 0.35, high: 0.75 }
    },
    stairs: {
      label: 'Stair Stringers (1 set)',
      flatRate: { low: 280, high: 480 }
    }
  }

};
