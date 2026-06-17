import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import gsap from 'gsap';

export default function HeroSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title word animation
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.word');
        gsap.set(words, { yPercent: 120, opacity: 0 });
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.15,
          delay: 0.3,
        });
      }

      // Subtitle fade in
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
        gsap.to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: 1.2,
        });
      }

      // CTA fade in
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { opacity: 0, y: 20 });
        gsap.to(ctaRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          delay: 1.6,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/products/midnight-72-bar.jpg"
        >
          <source src="/videos/hero-chocolate.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#2C1810]/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1
          ref={titleRef}
          className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight"
        >
          <span className="overflow-hidden inline-block mr-4">
            <span className="word inline-block">From</span>
          </span>
          <span className="overflow-hidden inline-block mr-4">
            <span className="word inline-block">Beans</span>
          </span>
          <span className="overflow-hidden inline-block mr-4">
            <span className="word inline-block">to</span>
          </span>
          <span className="overflow-hidden inline-block">
            <span className="word inline-block">Luxury</span>
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-lg md:text-xl text-[#F5E6D3]/90 mb-10 font-light tracking-wide"
        >
          Discover the finest artisanal chocolate
        </p>

        <button
          ref={ctaRef}
          onClick={scrollToProducts}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#2C1810] font-body text-base rounded hover:bg-[#C8975A] hover:text-white transition-all duration-300"
        >
          Explore Collection
        </button>
      </div>
    </section>
  );
}
