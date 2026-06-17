import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Snowflake, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Types ─────────────────────────────────────────────────────────────────────
interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category: 'bar' | 'truffle' | 'bonbon' | 'gift-set';
  stock_level: 'high' | 'low' | 'out';
  in_stock: boolean;
  cold_chain_required: boolean;
  gift_wrappable: boolean;
  seasonal: boolean;
}

// ── Filter categories ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all',      label: 'All' },
  { key: 'bar',      label: 'Bars' },
  { key: 'truffle',  label: 'Truffles' },
  { key: 'bonbon',   label: 'Bonbons' },
  { key: 'gift-set', label: 'Gift Sets' },
];

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: 'newest',        label: 'Newest first' },
  { key: 'price-asc',     label: 'Price: low to high' },
  { key: 'price-desc',    label: 'Price: high to low' },
  { key: 'name-asc',      label: 'Name: A → Z' },
];

// ── Stock badge helper ────────────────────────────────────────────────────────
function StockBadge({ level }: { level: ShopProduct['stock_level'] }) {
  if (level === 'high') return null; // no badge for fully stocked
  if (level === 'low')
    return (
      <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#B8324A] text-white font-body text-xs rounded">
        Low Stock
      </span>
    );
  return (
    <span className="absolute top-3 left-3 px-2 py-0.5 bg-gray-500 text-white font-body text-xs rounded">
      Out of Stock
    </span>
  );
}

// ── Single product card ───────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart }: { product: ShopProduct; onAddToCart: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isOutOfStock = product.stock_level === 'out';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
  };

  return (
    <div className="shop-card group flex flex-col">
      {/* Image box */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative bg-[#1a0a00] rounded overflow-hidden transition-transform duration-300 mb-4"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Link to={`/product/${product.slug}`} className="block">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500
                group-hover:scale-110 group-hover:brightness-110
                ${isOutOfStock ? 'opacity-60' : ''}`}
            />
          </div>

          {/* Specular sheen */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(212,175,55,0.12) 50%, transparent 60%)' }}
          />

          {/* Badges */}
          <StockBadge level={product.stock_level} />

          {product.seasonal && product.stock_level !== 'out' && (
            <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#B8324A] text-white font-body text-xs rounded">
              Seasonal
            </span>
          )}

          {product.cold_chain_required && (
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#4A90D9]/90 text-white rounded flex items-center gap-1">
              <Snowflake size={11} />
              <span className="font-body text-xs">Cold Chain</span>
            </div>
          )}

          {/* Card flap hover reveal */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#2C1810] via-[#5C3A2A]/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1">
        {/* Category pill */}
        <span className="font-body text-xs text-[#C4A882] capitalize mb-1">
          {product.category.replace('-', ' ')}
        </span>

        <Link to={`/product/${product.slug}`} className="flex-1">
          <h3 className="font-display text-base text-[#2C1810] mb-1 group-hover:text-[#C8975A] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-body text-base text-[#C8975A] font-medium">
              Rs {product.price}
            </span>
            {product.compare_at_price && (
              <span className="font-body text-sm text-[#B8324A] line-through">
                Rs {product.compare_at_price}
              </span>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="px-3 py-1.5 bg-[#2C1810] text-white font-body text-xs rounded
              hover:bg-[#C8975A] transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Shop() {
  const { addItem } = useCart();
  const [allProducts, setAllProducts]       = useState<ShopProduct[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortKey, setSortKey]               = useState('newest');
  const [showFilters, setShowFilters]       = useState(false);
  const pageRef   = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef   = useRef<HTMLDivElement>(null);

  // ── Fetch ALL products from Supabase ────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, slug, name, short_description, price, compare_at_price, images, ' +
          'category, stock_level, in_stock, cold_chain_required, gift_wrappable, seasonal'
        )
        .order('created_at', { ascending: false }); // newest first

      if (error) {
        setError(error.message);
      } else {
        setAllProducts((data as ShopProduct[]) ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  // ── Client-side filter + sort (must be before any useEffect that uses it) ──
  const displayed = [...allProducts]
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .sort((a, b) => {
      if (sortKey === 'price-asc')  return a.price - b.price;
      if (sortKey === 'price-desc') return b.price - a.price;
      if (sortKey === 'name-asc')   return a.name.localeCompare(b.name);
      return 0; // 'newest' — already ordered by the DB query
    });

  // ── GSAP scroll animations — run after products load ───────────────────────
  useEffect(() => {
    if (loading || displayed.length === 0) return;

    const ctx = gsap.context(() => {
      // Page header slides down
      gsap.from(headerRef.current, {
        y: -30, opacity: 0, duration: 0.7, ease: 'power2.out',
      });

      // Grid cards stagger fade-up on scroll
      gsap.utils.toArray<HTMLElement>('.shop-card').forEach((card, i) => {
        gsap.from(card, {
          y: 50, opacity: 0, duration: 0.55, ease: 'power2.out',
          delay: (i % 4) * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
          },
        });
      });

      ScrollTrigger.refresh();
    }, pageRef);

    return () => ctx.revert();
  }, [loading, displayed.length, activeCategory, sortKey]);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#F5E6D3] pt-20 overflow-x-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12">

        {/* ── Page header ── */}
        <div ref={headerRef} className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl text-[#2C1810] mb-2">
            All Chocolates
          </h1>
          <p className="font-body text-sm text-[#C4A882]">
            {loading ? 'Loading…' : `${displayed.length} product${displayed.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* ── Filter + Sort bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded font-body text-sm transition-all ${
                  activeCategory === cat.key
                    ? 'bg-[#2C1810] text-white'
                    : 'bg-white/70 text-[#2C1810] hover:bg-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort + filter toggle */}
          <div className="flex items-center gap-3">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              className="px-3 py-2 bg-white border border-[#C4A882]/30 rounded font-body text-sm text-[#2C1810] focus:outline-none focus:border-[#C8975A] cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded font-body text-sm transition-colors ${
                showFilters
                  ? 'bg-[#2C1810] text-white border-[#2C1810]'
                  : 'bg-white border-[#C4A882]/30 text-[#2C1810] hover:bg-white'
              }`}
            >
              {showFilters ? <X size={14} /> : <SlidersHorizontal size={14} />}
              Filters
            </button>
          </div>
        </div>

        {/* ── Expanded filter panel ── */}
        {showFilters && (
          <div className="mb-8 p-5 bg-white/60 rounded border border-[#C4A882]/20">
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer font-body text-sm text-[#2C1810]">
                <input
                  type="checkbox"
                  className="accent-[#C8975A]"
                  onChange={e => {
                    if (e.target.checked) {
                      setAllProducts(prev => prev.filter(p => p.seasonal));
                    } else {
                      // re-fetch to restore all
                      supabase
                        .from('products')
                        .select('id, slug, name, short_description, price, compare_at_price, images, category, stock_level, in_stock, cold_chain_required, gift_wrappable, seasonal')
                        .order('created_at', { ascending: false })
                        .then(({ data }) => { if (data) setAllProducts(data as ShopProduct[]); });
                    }
                  }}
                />
                Seasonal only
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-body text-sm text-[#2C1810]">
                <input
                  type="checkbox"
                  className="accent-[#C8975A]"
                  onChange={e => {
                    if (e.target.checked) {
                      setAllProducts(prev => prev.filter(p => p.in_stock));
                    } else {
                      supabase
                        .from('products')
                        .select('id, slug, name, short_description, price, compare_at_price, images, category, stock_level, in_stock, cold_chain_required, gift_wrappable, seasonal')
                        .order('created_at', { ascending: false })
                        .then(({ data }) => { if (data) setAllProducts(data as ShopProduct[]); });
                    }
                  }}
                />
                In stock only
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-body text-sm text-[#2C1810]">
                <input
                  type="checkbox"
                  className="accent-[#C8975A]"
                  onChange={e => {
                    if (e.target.checked) {
                      setAllProducts(prev => prev.filter(p => p.gift_wrappable));
                    } else {
                      supabase
                        .from('products')
                        .select('id, slug, name, short_description, price, compare_at_price, images, category, stock_level, in_stock, cold_chain_required, gift_wrappable, seasonal')
                        .order('created_at', { ascending: false })
                        .then(({ data }) => { if (data) setAllProducts(data as ShopProduct[]); });
                    }
                  }}
                />
                Gift wrappable
              </label>
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded font-body text-sm text-red-600 mb-8">
            Failed to load products: {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#2C1810]/10 rounded mb-4" />
                <div className="h-3 bg-[#2C1810]/10 rounded mb-2 w-1/3" />
                <div className="h-4 bg-[#2C1810]/10 rounded mb-3 w-3/4" />
                <div className="h-4 bg-[#2C1810]/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && displayed.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-display text-xl text-[#2C1810] mb-2">No products found</p>
            <p className="font-body text-sm text-[#C4A882]">
              Try a different category or add products in the admin panel.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-6 px-6 py-2 bg-[#C8975A] text-white rounded font-body text-sm hover:bg-[#C8975A]/90 transition-colors"
            >
              View all
            </button>
          </div>
        )}

        {/* ── Product grid ── */}
        {!loading && !error && displayed.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayed.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addItem(product.id)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
