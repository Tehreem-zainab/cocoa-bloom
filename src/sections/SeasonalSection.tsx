import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Shape of what we select from Supabase — only the fields the carousel needs
interface SeasonalProduct {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
}

export default function SeasonalSection() {
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Live data from Supabase — replaces getSeasonalProducts()
  const [seasonalProducts, setSeasonalProducts] = useState<SeasonalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch seasonal products from Supabase ──────────────────
  useEffect(() => {
    const fetchSeasonal = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name, short_description, price, compare_at_price, images')
        .eq('seasonal', true)
        .eq('in_stock', true)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setSeasonalProducts(data as SeasonalProduct[]);
      }
      setLoading(false);
    };

    fetchSeasonal();
  }, []);

  // ── GSAP scroll animations (re-run after products load) ────
  useEffect(() => {
    if (loading || seasonalProducts.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from('.seasonal-title', {
        y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.seasonal-card', {
        y: 40, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, seasonalProducts]);

  // ── Carousel scroll — measures actual card width at runtime ─
  const scroll = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const firstCard = carousel.querySelector('.seasonal-card') as HTMLElement | null;
    // card width + gap-6 (24px) so each click advances exactly one card
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 344;
    carousel.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  // Don't render the section at all while loading to avoid layout shift
  if (loading) return null;

  // If no seasonal products exist in Supabase, hide the section cleanly
  if (seasonalProducts.length === 0) return null;

  return (
    <section ref={sectionRef} id="seasonal" className="py-24 bg-[#F5E6D3]">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Header row */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="seasonal-title font-display text-3xl md:text-4xl text-[#2C1810]">
            Seasonal Collection
          </h2>

          {/* Arrow controls — only shown when there are enough cards to scroll */}
          {seasonalProducts.length > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="w-10 h-10 border border-[#C4A882]/40 rounded-full flex items-center justify-center hover:bg-[#2C1810]/5 transition-colors"
              >
                <ChevronLeft size={18} className="text-[#2C1810]" />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="w-10 h-10 border border-[#C4A882]/40 rounded-full flex items-center justify-center hover:bg-[#2C1810]/5 transition-colors"
              >
                <ChevronRight size={18} className="text-[#2C1810]" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
        >
          {seasonalProducts.map(product => (
            <div
              key={product.id}
              className="seasonal-card flex-shrink-0 w-[280px] md:w-[320px] group"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Image */}
              <Link to={`/product/${product.slug}`} className="block relative mb-4">
                <div className="aspect-square bg-[#2C1810]/5 rounded overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="absolute top-3 left-3 px-3 py-1 bg-[#B8324A] text-white font-body text-xs rounded">
                  Seasonal
                </span>
                {product.compare_at_price && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-[#C8975A] text-white font-body text-xs rounded">
                    Sale
                  </span>
                )}
              </Link>

              {/* Name */}
              <Link to={`/product/${product.slug}`}>
                <h3 className="font-display text-lg text-[#2C1810] mb-1 group-hover:text-[#C8975A] transition-colors">
                  {product.name}
                </h3>
              </Link>

              {/* Short description */}
              <p className="font-body text-sm text-[#C4A882] mb-3 line-clamp-2">
                {product.short_description}
              </p>

              {/* Price + CTA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-body text-lg text-[#C8975A] font-medium">
                    Rs {product.price}
                  </span>
                  {product.compare_at_price && (
                    <span className="font-body text-sm text-[#C4A882] line-through">
                      Rs {product.compare_at_price}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addItem(product.id)}
                  className="px-4 py-2 bg-[#2C1810] text-white font-body text-sm rounded hover:bg-[#C8975A] transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
