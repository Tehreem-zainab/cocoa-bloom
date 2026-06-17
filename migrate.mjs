/**
 * Cocoa Bloom — One-time Supabase Migration Script
 * ─────────────────────────────────────────────────
 * Run once from the project root:
 *   node migrate.mjs
 *
 * What it does:
 *   1. Reads each local product image from public/products/
 *   2. Uploads it to Supabase Storage bucket "product-images"
 *   3. Inserts all 8 products into public.products (skips existing slugs)
 *   4. Inserts all reviews into public.reviews (skips existing IDs)
 *
 * Safe to re-run — uses "upsert on conflict do nothing" everywhere.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Credentials (reads from .env manually — no dotenv needed) ────────────────
const SUPABASE_URL = 'https://fpzkcehywpvkpoorhwle.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwemtjZWh5d3B2a3Bvb3Jod2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODgzMzEsImV4cCI6MjA5NzI2NDMzMX0.c2Xoj_0ZA4tTTLEisZdby_U38O7DmTEP1O27hsncdh0';
const BUCKET = 'product-images';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── MIME helper ───────────────────────────────────────────────────────────────
function mimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  return map[ext] ?? 'application/octet-stream';
}

// ── Upload one image, return its public URL ───────────────────────────────────
async function uploadImage(localPath, storageName) {
  const abs = resolve(__dirname, localPath);
  if (!existsSync(abs)) {
    console.warn(`  ⚠  File not found, skipping: ${localPath}`);
    return null;
  }

  const buf = readFileSync(abs);
  const contentType = mimeType(abs);

  // Check if it already exists in storage (idempotent)
  const { data: existing } = await supabase.storage.from(BUCKET).list('', { search: storageName });
  if (existing?.some(f => f.name === storageName)) {
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storageName);
    console.log(`  ✓  Already uploaded: ${storageName}`);
    return urlData.publicUrl;
  }

  const { error } = await supabase.storage.from(BUCKET).upload(storageName, buf, {
    contentType,
    upsert: false,
  });

  if (error) {
    // "already exists" is not a fatal error — just fetch the URL
    if (error.message?.includes('already exists') || error.statusCode === '409') {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storageName);
      console.log(`  ✓  Already in bucket: ${storageName}`);
      return urlData.publicUrl;
    }
    console.error(`  ✗  Upload failed for ${storageName}: ${error.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storageName);
  console.log(`  ↑  Uploaded: ${storageName}`);
  return urlData.publicUrl;
}

// ── Product + review data ─────────────────────────────────────────────────────
// Images: [localPath, storageFileName]
const IMAGE_MAP = [
  ['public/products/midnight-72-bar.jpg',   'midnight-72-bar.jpg'],
  ['public/products/sea-salt-caramel.jpg',  'sea-salt-caramel.jpg'],
  ['public/products/raspberry-rose.jpg',    'raspberry-rose.jpg'],
  ['public/products/hazelnut-praline.jpg',  'hazelnut-praline.jpg'],
  ['public/products/matcha-white.jpg',      'matcha-white.jpg'],
  ['public/products/champagne-truffle.jpg', 'champagne-truffle.jpg'],
  ['public/products/gift-box-12.jpg',       'gift-box-12.jpg'],
  ['public/products/gift-box-24.jpg',       'gift-box-24.jpg'],
];

const PRODUCTS = [
  {
    id: '1',
    slug: 'midnight-72-bar',
    name: 'Midnight 72% Dark Bar',
    description: 'Crafted from single-origin Madagascar cacao, refined over 72 hours to reveal complex flavor layers. The 72% cacao content delivers a perfect bitter-sweet balance for true chocolate connoisseurs.',
    short_description: 'Single-origin Madagascar 72% dark chocolate',
    price: 128,
    compare_at_price: null,
    image_file: 'midnight-72-bar.jpg',
    category: 'bar',
    flavor_map: { intensity: 8, sweetness: 3, bitterness: 7, fruitiness: 6, nuttiness: 4 },
    tasting_notes: ['Dark cherry undertones', 'Roasted hazelnut aroma', 'Subtle citrus finish', 'Silky cocoa butter mouthfeel'],
    ingredients: 'Cacao beans, cane sugar, cocoa butter, soy lecithin (emulsifier)',
    allergens: ['soy'],
    pairings: ['3', '5'],
    cold_chain_required: false,
    max_transit_hours: 120,
    gift_wrappable: true,
    is_truffle: false,
    seasonal: false,
    in_stock: true,
    stock_level: 'high',
  },
  {
    id: '2',
    slug: 'sea-salt-caramel-truffle',
    name: 'Sea Salt Caramel Truffle',
    description: 'Brittany sea salt meets handmade caramel encased in a 64% dark chocolate shell. Bite through to discover flowing caramel in a sublime sweet-salty dance.',
    short_description: 'Brittany sea salt flowing caramel truffles',
    price: 168,
    compare_at_price: null,
    image_file: 'sea-salt-caramel.jpg',
    category: 'truffle',
    flavor_map: { intensity: 6, sweetness: 8, bitterness: 4, fruitiness: 2, nuttiness: 5 },
    tasting_notes: ['Brittany sea salt crystals', 'Artisan caramel', 'Madagascar vanilla', 'Creamy ganache texture'],
    ingredients: 'Chocolate liquor, heavy cream, glucose syrup, cane sugar, butter, sea salt, cocoa butter, vanilla pod',
    allergens: ['milk', 'soy'],
    pairings: ['1', '6'],
    cold_chain_required: true,
    max_transit_hours: 48,
    gift_wrappable: true,
    is_truffle: true,
    seasonal: false,
    in_stock: true,
    stock_level: 'high',
  },
  {
    id: '3',
    slug: 'raspberry-rose-bonbon',
    name: 'Raspberry Rose Bonbon',
    description: 'Fresh raspberry puree meets Bulgarian rose water in a delicate white chocolate shell. Each piece captures the essence of spring with tangy fruit and elegant floral notes.',
    short_description: 'Raspberry puree with Bulgarian rose water',
    price: 148,
    compare_at_price: 168,
    image_file: 'raspberry-rose.jpg',
    category: 'bonbon',
    flavor_map: { intensity: 4, sweetness: 7, bitterness: 2, fruitiness: 9, nuttiness: 1 },
    tasting_notes: ['Fresh raspberry', 'Bulgarian rose water', 'White chocolate shell', 'Citric brightness'],
    ingredients: 'White chocolate, raspberry puree, rose water, glucose syrup, citric acid, natural coloring',
    allergens: ['milk', 'soy'],
    pairings: ['2', '5'],
    cold_chain_required: true,
    max_transit_hours: 36,
    gift_wrappable: true,
    is_truffle: false,
    seasonal: true,
    in_stock: true,
    stock_level: 'low',
  },
  {
    id: '4',
    slug: 'hazelnut-praline-bar',
    name: 'Hazelnut Praline Bar',
    description: 'Italian Piedmont hazelnuts, slow-roasted and ground into silky praline paste, blended with 41% milk chocolate. Whole hazelnuts in every bite for a richly textured experience.',
    short_description: 'Piedmont hazelnuts with 41% milk chocolate',
    price: 138,
    compare_at_price: null,
    image_file: 'hazelnut-praline.jpg',
    category: 'bar',
    flavor_map: { intensity: 5, sweetness: 6, bitterness: 3, fruitiness: 2, nuttiness: 9 },
    tasting_notes: ['Roasted Piedmont hazelnuts', 'Silky praline', 'Milk chocolate', 'Caramelized nut notes'],
    ingredients: 'Milk chocolate, hazelnuts, cane sugar, cocoa butter, soy lecithin',
    allergens: ['milk', 'soy', 'tree-nuts'],
    pairings: ['1', '6'],
    cold_chain_required: false,
    max_transit_hours: 120,
    gift_wrappable: true,
    is_truffle: false,
    seasonal: false,
    in_stock: true,
    stock_level: 'high',
  },
  {
    id: '5',
    slug: 'matcha-white-chocolate',
    name: 'Matcha White Chocolate',
    description: 'Japanese Uji matcha powder artfully blended with 28% white chocolate. The subtle bitterness of matcha balances the sweetness of white chocolate for a uniquely Eastern flavor profile.',
    short_description: 'Uji matcha with 28% white chocolate',
    price: 158,
    compare_at_price: null,
    image_file: 'matcha-white.jpg',
    category: 'bar',
    flavor_map: { intensity: 4, sweetness: 7, bitterness: 5, fruitiness: 1, nuttiness: 2 },
    tasting_notes: ['Uji matcha', 'White chocolate', 'Marine vegetal notes', 'Gold leaf finish'],
    ingredients: 'White chocolate, matcha powder, cocoa butter, whole milk powder, soy lecithin',
    allergens: ['milk', 'soy'],
    pairings: ['3', '7'],
    cold_chain_required: false,
    max_transit_hours: 120,
    gift_wrappable: true,
    is_truffle: false,
    seasonal: true,
    in_stock: true,
    stock_level: 'high',
  },
  {
    id: '6',
    slug: 'champagne-truffle',
    name: 'Champagne Truffle',
    description: 'Inspired by French champagne, these truffles blend champagne into a silky white chocolate ganache, enrobed in dark chocolate and dusted with cocoa powder. Every bite sparkles like a celebration.',
    short_description: 'French champagne white chocolate ganache truffles',
    price: 188,
    compare_at_price: null,
    image_file: 'champagne-truffle.jpg',
    category: 'truffle',
    flavor_map: { intensity: 5, sweetness: 7, bitterness: 3, fruitiness: 4, nuttiness: 2 },
    tasting_notes: ['French champagne', 'White chocolate ganache', 'Dark chocolate shell', 'Effervescent finish'],
    ingredients: 'Dark chocolate, white chocolate, heavy cream, champagne, glucose syrup, cocoa powder',
    allergens: ['milk', 'soy'],
    pairings: ['2', '8'],
    cold_chain_required: true,
    max_transit_hours: 48,
    gift_wrappable: true,
    is_truffle: true,
    seasonal: true,
    in_stock: true,
    stock_level: 'low',
  },
  {
    id: '7',
    slug: 'assorted-gift-box-12',
    name: 'Assorted Gift Box · 12 pcs',
    description: 'A curated collection of 12 handmade chocolates featuring dark truffles, caramel centers, pralines, and more. Each box is finished with a golden ribbon — the perfect gift.',
    short_description: '12 handmade chocolate selection with gold ribbon',
    price: 368,
    compare_at_price: null,
    image_file: 'gift-box-12.jpg',
    category: 'gift-set',
    flavor_map: { intensity: 6, sweetness: 6, bitterness: 4, fruitiness: 5, nuttiness: 5 },
    tasting_notes: ['Multi-flavor assortment', 'Handcrafted selection', 'Gold ribbon packaging', 'Limited edition'],
    ingredients: 'Dark chocolate, milk chocolate, white chocolate, nuts, fruit purees, caramel, cream',
    allergens: ['milk', 'soy', 'tree-nuts'],
    pairings: ['8'],
    cold_chain_required: true,
    max_transit_hours: 48,
    gift_wrappable: true,
    is_truffle: false,
    seasonal: false,
    in_stock: true,
    stock_level: 'high',
  },
  {
    id: '8',
    slug: 'premium-gift-box-24',
    name: 'Premium Gift Box · 24 pcs',
    description: '24 pieces of our finest handmade chocolates, including all classic flavors and seasonal specials. Deep crimson box with gold-embossed Cocoa Bloom crest — our most luxurious gift.',
    short_description: '24 premium handmade chocolates in crimson box',
    price: 688,
    compare_at_price: 788,
    image_file: 'gift-box-24.jpg',
    category: 'gift-set',
    flavor_map: { intensity: 6, sweetness: 6, bitterness: 4, fruitiness: 5, nuttiness: 5 },
    tasting_notes: ['Complete classic collection', 'Seasonal specials included', 'Crimson gift box', 'Cocoa Bloom crest'],
    ingredients: 'Dark chocolate, milk chocolate, white chocolate, nuts, fruit purees, caramel, cream, champagne',
    allergens: ['milk', 'soy', 'tree-nuts'],
    pairings: ['7'],
    cold_chain_required: true,
    max_transit_hours: 48,
    gift_wrappable: true,
    is_truffle: false,
    seasonal: false,
    in_stock: true,
    stock_level: 'high',
  },
];

// Reviews keyed by product id
const REVIEWS = {
  '1': [
    { id: 'r1', author: 'Li M.',    rating: 5, title: 'Ultimate dark chocolate experience', body: 'The best 72% dark chocolate I have ever tasted. Silky smooth with a long finish.', verified: true, created_at: '2026-05-15' },
    { id: 'r2', author: 'Sarah K.', rating: 4, title: 'Excellent quality',                  body: 'Rich fruity layers. Recommend pairing with black tea.',                          verified: true, created_at: '2026-04-20' },
  ],
  '2': [
    { id: 'r3', author: 'Wang J.', rating: 5, title: 'Perfect sweet-salty balance', body: 'The flowing caramel center is incredible! Just the right amount of sea salt.', verified: true, created_at: '2026-06-01' },
    { id: 'r4', author: 'Emma T.', rating: 5, title: 'Perfect gift choice',          body: 'Beautiful packaging and incredible taste. Third time reordering.',               verified: true, created_at: '2026-05-28' },
  ],
  '3': [
    { id: 'r5', author: 'Chen X.', rating: 5, title: 'Stunning flavor profile', body: 'The rose and raspberry pairing is divine. And the colors are gorgeous too.', verified: true, created_at: '2026-06-10' },
  ],
  '4': [
    { id: 'r6', author: 'Zhang Y.', rating: 4, title: 'Must-have for nut lovers', body: 'The hazelnuts are perfectly crunchy. A classic combination done right.', verified: true, created_at: '2026-05-22' },
  ],
  '5': [
    { id: 'r7', author: 'Liu H.', rating: 5, title: 'Eastern flavor surprise', body: 'Authentic matcha flavor, not overly sweet. The gold leaf is stunning.', verified: true, created_at: '2026-06-08' },
  ],
  '6': [
    { id: 'r8', author: 'Davis R.', rating: 5, title: 'Luxurious indulgence', body: 'The champagne flavor is sophisticated. Perfect for special occasions.', verified: true, created_at: '2026-06-05' },
  ],
  '7': [
    { id: 'r9', author: 'Patel S.', rating: 5, title: 'Perfect gift', body: 'The recipient loved it. Beautiful packaging and wonderful variety.', verified: true, created_at: '2026-05-30' },
  ],
  '8': [
    { id: 'r10', author: 'Thompson M.', rating: 5, title: 'Worth every penny', body: 'Gifted to a client who was thoroughly impressed. Uncompromising quality.', verified: true, created_at: '2026-06-12' },
  ],
};

// ── Main migration ────────────────────────────────────────────────────────────
async function migrate() {
  console.log('\n🍫  Cocoa Bloom — Supabase Migration\n');

  // ── Step 1: Upload images, build URL map ────────────────────────────────────
  console.log('── Step 1: Uploading images to Storage ──────────────────────');
  const urlMap = {};
  for (const [localPath, storageName] of IMAGE_MAP) {
    const url = await uploadImage(localPath, storageName);
    urlMap[storageName] = url;
  }

  // ── Step 2: Check which products already exist ──────────────────────────────
  console.log('\n── Step 2: Checking existing products ───────────────────────');
  const { data: existing, error: checkErr } = await supabase
    .from('products')
    .select('slug');
  if (checkErr) {
    console.error('Failed to query products table:', checkErr.message);
    console.error('Make sure you have run supabase_schema.sql first.\n');
    process.exit(1);
  }
  const existingSlugs = new Set((existing ?? []).map(r => r.slug));
  console.log(`  Found ${existingSlugs.size} existing product(s) in Supabase.`);

  // ── Step 3: Insert products ─────────────────────────────────────────────────
  console.log('\n── Step 3: Inserting products ────────────────────────────────');
  const insertedProductIds = {};

  for (const p of PRODUCTS) {
    if (existingSlugs.has(p.slug)) {
      console.log(`  ↷  Skipped (already exists): ${p.name}`);
      // Still need the DB id for reviews — look it up
      const { data } = await supabase.from('products').select('id').eq('slug', p.slug).single();
      if (data) insertedProductIds[p.id] = data.id;
      continue;
    }

    const imageUrl = urlMap[p.image_file];
    const row = {
      slug:                p.slug,
      name:                p.name,
      description:         p.description,
      short_description:   p.short_description,
      price:               p.price,
      compare_at_price:    p.compare_at_price,
      images:              imageUrl ? [imageUrl] : [],
      category:            p.category,
      flavor_map:          p.flavor_map,
      tasting_notes:       p.tasting_notes,
      ingredients:         p.ingredients,
      allergens:           p.allergens,
      pairings:            p.pairings,
      cold_chain_required: p.cold_chain_required,
      max_transit_hours:   p.max_transit_hours,
      gift_wrappable:      p.gift_wrappable,
      is_truffle:          p.is_truffle,
      seasonal:            p.seasonal,
      in_stock:            p.in_stock,
      stock_level:         p.stock_level,
    };

    const { data, error } = await supabase.from('products').insert([row]).select('id').single();
    if (error) {
      console.error(`  ✗  Failed to insert "${p.name}": ${error.message}`);
    } else {
      insertedProductIds[p.id] = data.id;
      console.log(`  ✓  Inserted: ${p.name}  →  id: ${data.id}`);
    }
  }

  // ── Step 4: Insert reviews ──────────────────────────────────────────────────
  console.log('\n── Step 4: Inserting reviews ─────────────────────────────────');

  // Get all existing review IDs
  const { data: existingReviews } = await supabase.from('reviews').select('id');
  const existingReviewIds = new Set((existingReviews ?? []).map(r => r.id));

  let reviewsInserted = 0;
  let reviewsSkipped = 0;

  for (const [productLocalId, reviewList] of Object.entries(REVIEWS)) {
    const dbProductId = insertedProductIds[productLocalId];
    if (!dbProductId) {
      console.warn(`  ⚠  No DB id found for product local id "${productLocalId}", skipping its reviews.`);
      continue;
    }

    for (const r of reviewList) {
      if (existingReviewIds.has(r.id)) {
        reviewsSkipped++;
        continue;
      }
      const { error } = await supabase.from('reviews').insert([{
        id:         r.id,
        product_id: dbProductId,
        author:     r.author,
        rating:     r.rating,
        title:      r.title,
        body:       r.body,
        verified:   r.verified,
        created_at: r.created_at,
      }]);
      if (error) console.error(`  ✗  Review ${r.id}: ${error.message}`);
      else reviewsInserted++;
    }
  }
  console.log(`  ✓  ${reviewsInserted} reviews inserted, ${reviewsSkipped} skipped.`);

  // ── Done ────────────────────────────────────────────────────────────────────
  console.log('\n✅  Migration complete!\n');
  console.log('Next steps:');
  console.log('  1. Open your admin panel at http://localhost:3000/admin');
  console.log('  2. Check Dashboard — you should see 8 products and reviews.');
  console.log('  3. Update src/data/products.ts to read from Supabase instead');
  console.log('     of the static array (optional — the admin panel already does).\n');
}

migrate().catch(err => {
  console.error('\n💥 Unhandled error:', err);
  process.exit(1);
});
