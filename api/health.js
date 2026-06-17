/**
 * GET /api/health
 * Vercel serverless function — Node.js 20 runtime
 *
 * Expand this folder with additional files as your API grows.
 * Each file in /api becomes its own serverless endpoint.
 * Example: api/products.js → /api/products
 */
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    app: 'Cocoa Bloom',
    timestamp: new Date().toISOString(),
    node: process.version,
  });
}
