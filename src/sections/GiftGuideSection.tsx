import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { giftCollections, getProductById } from '@/data/products';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const collectionImages: Record<string, string> = {
  birthday: '/products/gift-box-12.jpg',
  thankyou: '/products/champagne-truffle.jpg',
  lunarnewyear: '/products/gift-box-24.jpg',
};

const collectionColors: Record<string, string> = {
  birthday: 'from-[#C8975A]/20 to-[#D4AF37]/10',
  thankyou: 'from-[#5C3A2A]/20 to-[#C8975A]/10',
  lunarnewyear: 'from-[#B8324A]/20 to-[#D4AF37]/10',
};

export default function GiftGuideSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gift-title', {
        y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.gift-card', {
        scale: 0.95, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.15,
        scrollTrigger: { trigger: '.gift-grid', start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="gift-guide" className="py-24 bg-[#F9F9F9]">
      <div className="max-w-[1440px] mx-auto px-6">
        <h2 className="gift-title font-display text-3xl md:text-4xl text-[#2C1810] mb-12">
          Gift Box Guide
        </h2>

        <div className="gift-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {giftCollections.map(collection => {
            const mainProduct = getProductById(collection.products[0]);
            return (
              <div key={collection.slug} className="gift-card group relative rounded overflow-hidden cursor-pointer">
                <div className="aspect-[4/5] relative">
                  <img
                    src={collectionImages[collection.slug] || mainProduct?.images[0]}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${collectionColors[collection.slug]} via-transparent to-transparent`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/80 via-[#2C1810]/20 to-transparent" />
                  <div className="absolute top-6 right-6 opacity-80 group-hover:opacity-100 transition-opacity">
                    <GiftRibbonLarge />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl text-white mb-2">{collection.name}</h3>
                    <p className="font-body text-sm text-[#C4A882] mb-4 line-clamp-2">{collection.description}</p>
                    <Link
                      to={`/product/${mainProduct?.slug || ''}`}
                      className="inline-flex items-center gap-2 text-[#C8975A] font-body text-sm hover:text-[#E8C87A] transition-colors"
                    >
                      View Collection
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GiftRibbonLarge() {
  return (
    <svg width="48" height="60" viewBox="0 0 28 36" fill="none">
      <path d="M14 0L16.5 12H28L18.5 19.5L22 32L14 24.5L6 32L9.5 19.5L0 12H11.5L14 0Z" fill="#D4AF37" className="animate-pulse" style={{ animationDuration: '3s' }} />
    </svg>
  );
}
