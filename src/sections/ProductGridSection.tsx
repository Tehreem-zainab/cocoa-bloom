import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import type { Product } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { key: 'all',      label: 'All' },
  { key: 'bar',      label: 'Bars' },
  { key: 'truffle',  label: 'Truffles' },
  { key: 'bonbon',   label: 'Bonbons' },
  { key: 'gift-set', label: 'Gift Sets' },
];

export default function ProductGridSection() {
  const { addItem }     = useCart();
  const [activeFilter, setActiveFilter] = useState('all');
  const sectionRef      = useRef<HTMLElement>(null);
  const titleRef        = useRef<HTMLHeadingElement>(null);
  const filtersRef      = useRef<HTMLDivElement>(null);

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.category === activeFilter);

  // ── Scroll-triggered animations ──────────────────────────────
  useEffect(() => {
    // Kill all previous ScrollTrigger instances scoped to this section
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.id?.toString().startsWith('pgrid-')) st.kill();
    });

    const ctx = gsap.context(() => {
      // Title slides up
      gsap.from(titleRef.current, {
        y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          id: 'pgrid-title',
          trigger: titleRef.current,
          start: 'top 85%',
        },
      });

      // Filter pills slide in from left
      gsap.from(filtersRef.current, {
        x: -40, opacity: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
          id: 'pgrid-filters',
          trigger: filtersRef.current,
          start: 'top 88%',
        },
      });

      // Cards stagger fade-up — re-target after filter change
      gsap.utils.toArray<HTMLElement>('.pgrid-card').forEach((card, i) => {
        gsap.from(card, {
          y: 50, opacity: 0, duration: 0.55, ease: 'power2.out',
          delay: i * 0.07,
          scrollTrigger: {
            id: `pgrid-card-${i}`,
            trigger: card,
            start: 'top 90%',
          },
        });
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, [activeFilter]); // re-runs every time filter changes

  return (
    <section ref={sectionRef} id="products" className="py-24 bg-[#F5E6D3]">
      <div className="max-w-[1440px] mx-auto px-6">

        <h2 ref={titleRef} className="font-display text-3xl md:text-4xl text-[#2C1810] mb-8">
          All Chocolates
        </h2>

        <div ref={filtersRef} className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              className={`px-5 py-2 rounded font-body text-sm transition-all ${
                activeFilter === cat.key
                  ? 'bg-[#2C1810] text-white'
                  : 'bg-white/60 text-[#2C1810] hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addItem(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Product Card ──────────────────────────────────────────────
function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
  };

  return (
    <div className="pgrid-card group">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative bg-[#1a0a00] rounded overflow-hidden transition-transform duration-300"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Link to={`/product/${product.slug}`} className="block relative">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 group-hover:brightness-110"
            />
          </div>
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(212,175,55,0.12) 50%, transparent 60%)' }}
          />
          {product.giftWrappable && (
            <div className="absolute top-3 right-3"><GoldRibbon /></div>
          )}
          {product.coldChainRequired && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-[#4A90D9]/90 text-white font-body text-xs rounded flex items-center gap-1">
              <span>❄</span> Cold
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#2C1810] via-[#5C3A2A]/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
        </Link>
      </div>

      <div className="pt-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-base text-[#2C1810] mb-1 group-hover:text-[#C8975A] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="font-body text-base text-[#C8975A] font-medium">Rs {product.price}</span>
            {product.compareAtPrice && (
              <span className="font-body text-sm text-[#B8324A] line-through">Rs {product.compareAtPrice}</span>
            )}
          </div>
          <button
            onClick={onAddToCart}
            className="px-3 py-1.5 bg-[#2C1810] text-white font-body text-xs rounded hover:bg-[#C8975A] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function GoldRibbon() {
  return (
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" className="drop-shadow-sm">
      <path
        d="M14 0L16.5 12H28L18.5 19.5L22 32L14 24.5L6 32L9.5 19.5L0 12H11.5L14 0Z"
        fill="#D4AF37"
        className="animate-pulse"
        style={{ animationDuration: '3s' }}
      />
    </svg>
  );
}
