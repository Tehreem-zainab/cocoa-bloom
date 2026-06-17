import type { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    slug: 'midnight-72-bar',
    name: 'Midnight 72% Dark Bar',
    description: 'Crafted from single-origin Madagascar cacao, refined over 72 hours to reveal complex flavor layers. The 72% cacao content delivers a perfect bitter-sweet balance for true chocolate connoisseurs.',
    shortDescription: 'Single-origin Madagascar 72% dark chocolate',
    price: 128,
    images: ['/products/midnight-72-bar.jpg'],
    category: 'bar',
    flavorMap: { intensity: 8, sweetness: 3, bitterness: 7, fruitiness: 6, nuttiness: 4 },
    tastingNotes: ['Dark cherry undertones', 'Roasted hazelnut aroma', 'Subtle citrus finish', 'Silky cocoa butter mouthfeel'],
    ingredients: 'Cacao beans, cane sugar, cocoa butter, soy lecithin (emulsifier)',
    allergens: ['soy'],
    pairings: ['3', '5'],
    coldChainRequired: false,
    maxTransitHours: 120,
    giftWrappable: true,
    isTruffle: false,
    seasonal: false,
    inStock: true,
    stockLevel: 'high',
    reviews: [
      { id: 'r1', author: 'Li M.', rating: 5, title: 'Ultimate dark chocolate experience', body: 'The best 72% dark chocolate I have ever tasted. Silky smooth with a long finish.', date: '2026-05-15', verified: true },
      { id: 'r2', author: 'Sarah K.', rating: 4, title: 'Excellent quality', body: 'Rich fruity layers. Recommend pairing with black tea.', date: '2026-04-20', verified: true }
    ]
  },
  {
    id: '2',
    slug: 'sea-salt-caramel-truffle',
    name: 'Sea Salt Caramel Truffle',
    description: 'Brittany sea salt meets handmade caramel encased in a 64% dark chocolate shell. Bite through to discover flowing caramel in a sublime sweet-salty dance.',
    shortDescription: 'Brittany sea salt flowing caramel truffles',
    price: 168,
    images: ['/products/sea-salt-caramel.jpg'],
    category: 'truffle',
    flavorMap: { intensity: 6, sweetness: 8, bitterness: 4, fruitiness: 2, nuttiness: 5 },
    tastingNotes: ['Brittany sea salt crystals', 'Artisan caramel', 'Madagascar vanilla', 'Creamy ganache texture'],
    ingredients: 'Chocolate liquor, heavy cream, glucose syrup, cane sugar, butter, sea salt, cocoa butter, vanilla pod',
    allergens: ['milk', 'soy'],
    pairings: ['1', '6'],
    coldChainRequired: true,
    maxTransitHours: 48,
    giftWrappable: true,
    isTruffle: true,
    seasonal: false,
    inStock: true,
    stockLevel: 'high',
    reviews: [
      { id: 'r3', author: 'Wang J.', rating: 5, title: 'Perfect sweet-salty balance', body: 'The flowing caramel center is incredible! Just the right amount of sea salt.', date: '2026-06-01', verified: true },
      { id: 'r4', author: 'Emma T.', rating: 5, title: 'Perfect gift choice', body: 'Beautiful packaging and incredible taste. Third time reordering.', date: '2026-05-28', verified: true }
    ]
  },
  {
    id: '3',
    slug: 'raspberry-rose-bonbon',
    name: 'Raspberry Rose Bonbon',
    description: 'Fresh raspberry puree meets Bulgarian rose water in a delicate white chocolate shell. Each piece captures the essence of spring with tangy fruit and elegant floral notes.',
    shortDescription: 'Raspberry puree with Bulgarian rose water',
    price: 148,
    compareAtPrice: 168,
    images: ['/products/raspberry-rose.jpg'],
    category: 'bonbon',
    flavorMap: { intensity: 4, sweetness: 7, bitterness: 2, fruitiness: 9, nuttiness: 1 },
    tastingNotes: ['Fresh raspberry', 'Bulgarian rose water', 'White chocolate shell', 'Citric brightness'],
    ingredients: 'White chocolate, raspberry puree, rose water, glucose syrup, citric acid, natural coloring',
    allergens: ['milk', 'soy'],
    pairings: ['2', '5'],
    coldChainRequired: true,
    maxTransitHours: 36,
    giftWrappable: true,
    isTruffle: false,
    seasonal: true,
    inStock: true,
    stockLevel: 'low',
    reviews: [
      { id: 'r5', author: 'Chen X.', rating: 5, title: 'Stunning flavor profile', body: 'The rose and raspberry pairing is divine. And the colors are gorgeous too.', date: '2026-06-10', verified: true }
    ]
  },
  {
    id: '4',
    slug: 'hazelnut-praline-bar',
    name: 'Hazelnut Praline Bar',
    description: 'Italian Piedmont hazelnuts, slow-roasted and ground into silky praline paste, blended with 41% milk chocolate. Whole hazelnuts in every bite for a richly textured experience.',
    shortDescription: 'Piedmont hazelnuts with 41% milk chocolate',
    price: 138,
    images: ['/products/hazelnut-praline.jpg'],
    category: 'bar',
    flavorMap: { intensity: 5, sweetness: 6, bitterness: 3, fruitiness: 2, nuttiness: 9 },
    tastingNotes: ['Roasted Piedmont hazelnuts', 'Silky praline', 'Milk chocolate', 'Caramelized nut notes'],
    ingredients: 'Milk chocolate, hazelnuts, cane sugar, cocoa butter, soy lecithin',
    allergens: ['milk', 'soy', 'tree-nuts'],
    pairings: ['1', '6'],
    coldChainRequired: false,
    maxTransitHours: 120,
    giftWrappable: true,
    isTruffle: false,
    seasonal: false,
    inStock: true,
    stockLevel: 'high',
    reviews: [
      { id: 'r6', author: 'Zhang Y.', rating: 4, title: 'Must-have for nut lovers', body: 'The hazelnuts are perfectly crunchy. A classic combination done right.', date: '2026-05-22', verified: true }
    ]
  },
  {
    id: '5',
    slug: 'matcha-white-chocolate',
    name: 'Matcha White Chocolate',
    description: 'Japanese Uji matcha powder artfully blended with 28% white chocolate. The subtle bitterness of matcha balances the sweetness of white chocolate for a uniquely Eastern flavor profile.',
    shortDescription: 'Uji matcha with 28% white chocolate',
    price: 158,
    images: ['/products/matcha-white.jpg'],
    category: 'bar',
    flavorMap: { intensity: 4, sweetness: 7, bitterness: 5, fruitiness: 1, nuttiness: 2 },
    tastingNotes: ['Uji matcha', 'White chocolate', 'Marine vegetal notes', 'Gold leaf finish'],
    ingredients: 'White chocolate, matcha powder, cocoa butter, whole milk powder, soy lecithin',
    allergens: ['milk', 'soy'],
    pairings: ['3', '7'],
    coldChainRequired: false,
    maxTransitHours: 120,
    giftWrappable: true,
    isTruffle: false,
    seasonal: true,
    inStock: true,
    stockLevel: 'high',
    reviews: [
      { id: 'r7', author: 'Liu H.', rating: 5, title: 'Eastern flavor surprise', body: 'Authentic matcha flavor, not overly sweet. The gold leaf is stunning.', date: '2026-06-08', verified: true }
    ]
  },
  {
    id: '6',
    slug: 'champagne-truffle',
    name: 'Champagne Truffle',
    description: 'Inspired by French champagne, these truffles blend champagne into a silky white chocolate ganache, enrobed in dark chocolate and dusted with cocoa powder. Every bite sparkles like a celebration.',
    shortDescription: 'French champagne white chocolate ganache truffles',
    price: 188,
    images: ['/products/champagne-truffle.jpg'],
    category: 'truffle',
    flavorMap: { intensity: 5, sweetness: 7, bitterness: 3, fruitiness: 4, nuttiness: 2 },
    tastingNotes: ['French champagne', 'White chocolate ganache', 'Dark chocolate shell', 'Effervescent finish'],
    ingredients: 'Dark chocolate, white chocolate, heavy cream, champagne, glucose syrup, cocoa powder',
    allergens: ['milk', 'soy'],
    pairings: ['2', '8'],
    coldChainRequired: true,
    maxTransitHours: 48,
    giftWrappable: true,
    isTruffle: true,
    seasonal: true,
    inStock: true,
    stockLevel: 'low',
    reviews: [
      { id: 'r8', author: 'Davis R.', rating: 5, title: 'Luxurious indulgence', body: 'The champagne flavor is sophisticated. Perfect for special occasions.', date: '2026-06-05', verified: true }
    ]
  },
  {
    id: '7',
    slug: 'assorted-gift-box-12',
    name: 'Assorted Gift Box · 12 pcs',
    description: 'A curated collection of 12 handmade chocolates featuring dark truffles, caramel centers, pralines, and more. Each box is finished with a golden ribbon — the perfect gift.',
    shortDescription: '12 handmade chocolate selection with gold ribbon',
    price: 368,
    images: ['/products/gift-box-12.jpg'],
    category: 'gift-set',
    flavorMap: { intensity: 6, sweetness: 6, bitterness: 4, fruitiness: 5, nuttiness: 5 },
    tastingNotes: ['Multi-flavor assortment', 'Handcrafted selection', 'Gold ribbon packaging', 'Limited edition'],
    ingredients: 'Dark chocolate, milk chocolate, white chocolate, nuts, fruit purees, caramel, cream',
    allergens: ['milk', 'soy', 'tree-nuts'],
    pairings: ['8'],
    coldChainRequired: true,
    maxTransitHours: 48,
    giftWrappable: true,
    isTruffle: false,
    seasonal: false,
    inStock: true,
    stockLevel: 'high',
    reviews: [
      { id: 'r9', author: 'Patel S.', rating: 5, title: 'Perfect gift', body: 'The recipient loved it. Beautiful packaging and wonderful variety.', date: '2026-05-30', verified: true }
    ]
  },
  {
    id: '8',
    slug: 'premium-gift-box-24',
    name: 'Premium Gift Box · 24 pcs',
    description: '24 pieces of our finest handmade chocolates, including all classic flavors and seasonal specials. Deep crimson box with gold-embossed Cocoa Bloom crest — our most luxurious gift.',
    shortDescription: '24 premium handmade chocolates in crimson box',
    price: 688,
    compareAtPrice: 788,
    images: ['/products/gift-box-24.jpg'],
    category: 'gift-set',
    flavorMap: { intensity: 6, sweetness: 6, bitterness: 4, fruitiness: 5, nuttiness: 5 },
    tastingNotes: ['Complete classic collection', 'Seasonal specials included', 'Crimson gift box', 'Cocoa Bloom crest'],
    ingredients: 'Dark chocolate, milk chocolate, white chocolate, nuts, fruit purees, caramel, cream, champagne',
    allergens: ['milk', 'soy', 'tree-nuts'],
    pairings: ['7'],
    coldChainRequired: true,
    maxTransitHours: 48,
    giftWrappable: true,
    isTruffle: false,
    seasonal: true,
    inStock: true,
    stockLevel: 'high',
    reviews: [
      { id: 'r10', author: 'Thompson M.', rating: 5, title: 'Worth every penny', body: 'Gifted to a client who was thoroughly impressed. Uncompromising quality.', date: '2026-06-12', verified: true }
    ]
  }
];

export const beanToBarStages = [
  {
    number: '01',
    name: 'Sourcing',
    description: 'We source single-origin cacao beans directly from small farms in Madagascar, Ecuador, and Venezuela, ensuring full traceability and sustainable cultivation.',
    image: '/images/bean-sourcing.jpg'
  },
  {
    number: '02',
    name: 'Roasting',
    description: 'Each batch is small-roasted with temperature profiles tailored to the beans\' origin characteristics, unlocking their unique flavor potential.',
    image: '/images/bean-roasting.jpg'
  },
  {
    number: '03',
    name: 'Conching',
    description: 'Refined for 72 hours in traditional granite conching machines to achieve silk-like smoothness while removing excess acidity for a rounded flavor profile.',
    image: '/images/bean-conching.jpg'
  },
  {
    number: '04',
    name: 'Tempering',
    description: 'Hand-tempered on marble surfaces with precise crystallization control, ensuring perfect gloss and a clean snap in every piece.',
    image: '/images/bean-tempering.jpg'
  },
  {
    number: '05',
    name: 'Molding',
    description: 'Poured into precision molds, cooled, then hand-finished and wrapped — each piece is a unique work of edible art.',
    image: '/images/bean-roasting.jpg'
  }
];

export const giftCollections = [
  {
    slug: 'birthday',
    name: 'Birthday Bliss',
    description: 'A curated selection of our most beloved flavors for their special day.',
    products: ['7', '2']
  },
  {
    slug: 'thankyou',
    name: 'Thank You',
    description: 'An elegant way to say thank you — small but thoughtfully composed.',
    products: ['7']
  },
  {
    slug: 'lunarnewyear',
    name: 'Lunar New Year',
    description: 'A festive red-and-gold limited edition box symbolizing sweetness for the new year.',
    products: ['8', '5']
  }
];

export const getProductBySlug = (slug: string): Product | undefined =>
  products.find(p => p.slug === slug);

export const getProductById = (id: string): Product | undefined =>
  products.find(p => p.id === id);

export const getProductsByCategory = (category: Product['category']): Product[] =>
  products.filter(p => p.category === category);

export const getSeasonalProducts = (): Product[] =>
  products.filter(p => p.seasonal);

export const getGiftWrappableProducts = (): Product[] =>
  products.filter(p => p.giftWrappable);

export const getRelatedProducts = (product: Product): Product[] => {
  const related = product.pairings.map(id => getProductById(id)).filter(Boolean) as Product[];
  const sameCategory = products.filter(p => p.category === product.category && p.id !== product.id);
  return [...related, ...sameCategory].filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i).slice(0, 4);
};
