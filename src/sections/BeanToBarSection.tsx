import { useEffect, useRef } from 'react';
import { beanToBarStages } from '@/data/products';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BeanToBarSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.btb-title', {
        y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.timeline-line', {
        scaleY: 0, transformOrigin: 'top', duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: '.timeline-container', start: 'top 70%' },
      });
      gsap.utils.toArray<HTMLElement>('.timeline-stage').forEach((stage, i) => {
        gsap.from(stage, {
          x: i % 2 === 0 ? -60 : 60, opacity: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: stage, start: 'top 80%' },
        });
      });
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
          <div className="timeline-line absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[#C8975A]/40 md:-translate-x-px" />

          <div className="space-y-16 md:space-y-24">
            {beanToBarStages.map((stage, index) => (
              <div
                key={stage.number}
                className={`timeline-stage relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-[#D4AF37] rounded-full -translate-x-1/2 mt-2 ring-4 ring-[#2C1810] z-10" />

                <div className={`pl-12 md:pl-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <span className="font-display text-5xl text-[#D4AF37]/30 font-medium">{stage.number}</span>
                  <h3 className="font-display text-2xl text-[#F5E6D3] mt-2 mb-3">{stage.name}</h3>
                  <p className="font-body text-sm text-[#C4A882] leading-relaxed max-w-md">{stage.description}</p>
                </div>

                <div className={`pl-12 md:pl-0 md:w-1/2 ${index % 2 === 0 ? 'md:pl-16' : 'md:pr-16'}`}>
                  <div className="rounded overflow-hidden">
                    <img src={stage.image} alt={stage.name} className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-500" />
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
