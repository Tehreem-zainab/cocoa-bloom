import { useEffect, useRef } from 'react';
import { beanToBarStages } from '@/data/products';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BeanToBarSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Section title ──────────────────────────────────────
      gsap.from('.btb-title', {
        y: 70, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.btb-title',
          start: 'top 85%',
        },
      });

      // ── Vertical timeline line draws down ──────────────────
      gsap.from('.timeline-line', {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.4,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '.timeline-container',
          start: 'top 75%',
          end: 'bottom 80%',
          scrub: 0.5,
        },
      });

      // ── Each stage slides in from alternating sides ─────────
      gsap.utils.toArray<HTMLElement>('.timeline-stage').forEach((stage, i) => {
        const fromX = i % 2 === 0 ? -80 : 80;

        // Content side
        gsap.from(stage.querySelector('.btb-content'), {
          x: fromX, opacity: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 82%',
          },
        });

        // Image side (opposite direction)
        gsap.from(stage.querySelector('.btb-image'), {
          x: -fromX, opacity: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 82%',
          },
        });

        // Number counter fades in with scale
        gsap.from(stage.querySelector('.btb-number'), {
          scale: 0.5, opacity: 0, duration: 0.6, ease: 'back.out(2)',
          scrollTrigger: {
            trigger: stage,
            start: 'top 85%',
          },
        });

        // Timeline dot pops in
        gsap.from(stage.querySelector('.btb-dot'), {
          scale: 0, opacity: 0, duration: 0.4, ease: 'back.out(3)',
          delay: 0.2,
          scrollTrigger: {
            trigger: stage,
            start: 'top 85%',
          },
        });
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="bean-to-bar" className="py-24 bg-[#2C1810]">
      <div className="max-w-[1440px] mx-auto px-6">

        <h2 className="btb-title font-display text-3xl md:text-4xl text-[#F5E6D3] text-center mb-16">
          Bean to Bar
        </h2>

        <div className="timeline-container relative">
          {/* Vertical line */}
          <div className="timeline-line absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[#C8975A]/40 md:-translate-x-px" />

          <div className="space-y-16 md:space-y-24">
            {beanToBarStages.map((stage, index) => (
              <div
                key={stage.number}
                className={`timeline-stage relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="btb-dot absolute left-4 md:left-1/2 w-3 h-3 bg-[#D4AF37] rounded-full -translate-x-1/2 mt-2 ring-4 ring-[#2C1810] z-10" />

                {/* Text content */}
                <div className={`btb-content pl-12 md:pl-0 md:w-1/2 ${
                  index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'
                }`}>
                  <span className="btb-number font-display text-5xl text-[#D4AF37]/30 font-medium inline-block">
                    {stage.number}
                  </span>
                  <h3 className="font-display text-2xl text-[#F5E6D3] mt-2 mb-3">{stage.name}</h3>
                  <p className="font-body text-sm text-[#C4A882] leading-relaxed max-w-md">
                    {stage.description}
                  </p>
                </div>

                {/* Image */}
                <div className={`btb-image pl-12 md:pl-0 md:w-1/2 ${
                  index % 2 === 0 ? 'md:pl-16' : 'md:pr-16'
                }`}>
                  <div className="rounded overflow-hidden">
                    <img
                      src={stage.image}
                      alt={stage.name}
                      className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
