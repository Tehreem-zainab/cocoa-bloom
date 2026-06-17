import { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor
 * ─────────────────────────────────────────────────────────────
 * • Small solid dot — snaps exactly to mouse position (no lag)
 * • Outer ring     — follows with a smooth LERP delay
 * • Hover state    — ring expands + dot shrinks on <a>, <button>,
 *                    [role="button"], .group elements
 * • Touch/mobile   — entire component is disabled (pointer: coarse)
 * ─────────────────────────────────────────────────────────────
 */
export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);

  // Current ring position (lerped)
  const ringPos  = useRef({ x: -100, y: -100 });
  // Actual mouse position (instant)
  const mousePos = useRef({ x: -100, y: -100 });

  const [hovering, setHovering]   = useState(false);
  const [isTouch, setIsTouch]     = useState(false);
  const [visible, setVisible]     = useState(false);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    // ── Move handler ────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Dot snaps instantly
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      if (!visible) setVisible(true);
    };

    // ── Hover detection ─────────────────────────────────────
    const HOVER_SELECTOR = 'a, button, [role="button"], .group, input, textarea, select, label[for]';

    const onMouseOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest(HOVER_SELECTOR)) {
        setHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest(HOVER_SELECTOR)) {
        setHovering(false);
      }
    };

    // ── Hide when cursor leaves window ──────────────────────
    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    document.addEventListener('mousemove',  onMouseMove,  { passive: true });
    document.addEventListener('mouseover',  onMouseOver,  { passive: true });
    document.addEventListener('mouseout',   onMouseOut,   { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    // ── LERP ring animation loop ─────────────────────────────
    // Lerp factor: 0.12 = smooth, 0.2 = snappier
    const LERP = 0.12;

    const animate = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * LERP;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * LERP;

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove',  onMouseMove);
      document.removeEventListener('mouseover',  onMouseOver);
      document.removeEventListener('mouseout',   onMouseOut);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  // Don't render anything on touch devices
  if (isTouch) return null;

  return (
    <>
      {/* ── Dot — snaps to exact mouse position ── */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          willChange: 'transform',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div
          className="rounded-full bg-[#2C1810] transition-all duration-200"
          style={{
            width:   hovering ? '6px'  : '8px',
            height:  hovering ? '6px'  : '8px',
            opacity: hovering ? 0.5    : 1,
          }}
        />
      </div>

      {/* ── Ring — follows with LERP delay ── */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{
          willChange: 'transform',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          className="rounded-full border border-[#2C1810]/40 transition-all duration-300 ease-out"
          style={{
            width:      hovering ? '48px' : '32px',
            height:     hovering ? '48px' : '32px',
            background: hovering ? 'rgba(200,151,90,0.08)' : 'transparent',
          }}
        />
      </div>
    </>
  );
}
