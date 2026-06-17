import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSeasonalProducts } from '@/data/products';
import { useCart } from '@/context/CartContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SeasonalSection() {
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const seasonalProducts = getSeasonalProducts();

  useEffect(() => {
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
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -320 : 320,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section ref={sectionRef} id="seasonal" className="py-24 bg-[#F5E6D3]">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="seasonal-title font-display text-3xl md:text-4xl text-[#2C1810]">
            Seasonal Collection
          </h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-10 h-10 border border-[#C4A882]/40 rounded-full flex items-center justify-center hover:bg-[#2C1810]/5 transition-colors">
              <ChevronLeft size={18} className="text-[#2C1810]" />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 border border-[#C4A882]/40 rounded-full flex items-center justify-center hover:bg-[#2C1810]/5 transition-colors">
              <ChevronRight size={18} className="text-[#2C1810]" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
        >
          {seasonalProducts.map(product => (
            <div key={product.id} className="seasonal-card flex-shrink-0 w-[280px] md:w-[320px] group" style={{ scrollSnapAlign: 'start' }}>
              <Link to={`/product/${product.slug}`} className="block relative mb-4">
                <div className="aspect-square bg-[#2C1810]/5 rounded overflow-hidden">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="absolute top-3 left-3 px-3 py-1 bg-[#B8324A] text-white font-body text-xs rounded">Seasonal</span>
                {product.compareAtPrice && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-[#C8975A] text-white font-body text-xs rounded">Sale</span>
                )}
              </Link>

              <Link to={`/product/${product.slug}`}>
                <h3 className="font-display text-lg text-[#2C1810] mb-1 group-hover:text-[#C8975A] transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="font-body text-sm text-[#C4A882] mb-3 line-clamp-2">{product.shortDescription}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-body text-lg text-[#C8975A] font-medium">Rs {product.price}</span>
                  {product.compareAtPrice && (
                    <span className="font-body text-sm text-[#C4A882] line-through">Rs {product.compareAtPrice}</span>
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
