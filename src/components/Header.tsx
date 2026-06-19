import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ShoppingBag, Menu, X, Home } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Section-scroll links (home page anchors)
const sectionLinks = [
  { label: 'Seasonal Limited Edition', path: '/#seasonal'    },
  { label: 'Production Process',       path: '/#bean-to-bar' },
  { label: 'Gift Box Guide',           path: '/#gift-guide'  },
];

export default function Header() {
  const { totalQuantity, openDrawer } = useCart();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [hoveredIdx, setHoveredIdx]   = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef   = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const location  = useLocation();
  const navigate  = useNavigate();

  const isHome = location.pathname === '/';
  const isShop = location.pathname === '/shop';

  useEffect(() => {
    setScrolled(false);
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    if (isHome && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location, isHome]);

  // Move the sliding indicator to the hovered item
  useEffect(() => {
    if (hoveredIdx === null) {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }
    const el = itemRefs.current[hoveredIdx];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    setIndicatorStyle({
      left:    elRect.left - navRect.left,
      width:   elRect.width,
      opacity: 1,
    });
  }, [hoveredIdx]);

  type Mode = 'home-hero' | 'home-scrolled' | 'shop-top' | 'shop-scrolled' | 'inner';

  const mode: Mode = isHome && !scrolled ? 'home-hero'
    : isHome &&  scrolled                ? 'home-scrolled'
    : isShop && !scrolled                ? 'shop-top'
    : isShop &&  scrolled                ? 'shop-scrolled'
    : 'inner';

  const styles: Record<Mode, { header: string; logo: string; nav: string; icon: string; indicator: string }> = {
    'home-hero':     { header: 'bg-transparent',                              logo: 'text-white',     nav: 'text-white/90',  icon: 'text-white',     indicator: 'bg-white/20'        },
    'home-scrolled': { header: 'bg-[#F5E6D3] shadow-sm',                     logo: 'text-[#2C1810]', nav: 'text-[#2C1810]', icon: 'text-[#2C1810]', indicator: 'bg-[#C8975A]/15'    },
    'shop-top':      { header: 'bg-[#F5E6D3]/80 backdrop-blur-md',           logo: 'text-[#2C1810]', nav: 'text-[#2C1810]', icon: 'text-[#2C1810]', indicator: 'bg-[#C8975A]/15'    },
    'shop-scrolled': { header: 'bg-[#F5E6D3]/95 backdrop-blur-sm shadow-sm', logo: 'text-[#2C1810]', nav: 'text-[#2C1810]', icon: 'text-[#2C1810]', indicator: 'bg-[#C8975A]/15'    },
    'inner':         { header: 'bg-[#F5E6D3] shadow-sm',                     logo: 'text-[#2C1810]', nav: 'text-[#2C1810]', icon: 'text-[#2C1810]', indicator: 'bg-[#C8975A]/15'    },
  };

  const s = styles[mode];

  const handleSectionClick = (path: string) => {
    const sectionId = path.replace('/#', '');
    if (isHome) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${sectionId}`);
    }
    setMobileOpen(false);
  };

  // All nav items in order (Home optional, then shop, then sections)
  const allNavItems = [
    ...(!isHome ? [{ type: 'home' }] : []),
    { type: 'shop' },
    ...sectionLinks.map((l, i) => ({ type: 'section', link: l, i })),
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center transition-all duration-300 ${s.header}`}>
      <div className="w-full max-w-[1440px] mx-auto px-6 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className={`font-display text-2xl tracking-wide transition-colors duration-300 ${s.logo}`}>
            Cocoa Bloom
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav
          ref={navRef}
          className="hidden md:flex items-center gap-1 relative"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Sliding background indicator */}
          <span
            aria-hidden="true"
            className={`absolute top-0 h-full rounded-lg transition-all duration-300 ease-out pointer-events-none ${s.indicator}`}
            style={{
              left:    indicatorStyle.left,
              width:   indicatorStyle.width,
              opacity: indicatorStyle.opacity,
            }}
          />

          {allNavItems.map((item, idx) => {
            const baseClass = `relative z-10 font-body text-sm tracking-wide px-4 py-2 rounded-lg
              transition-all duration-200 ease-out select-none
              hover:scale-[1.04]`;

            if (item.type === 'home') return (
              <Link
                key="home"
                to="/"
                ref={el => { itemRefs.current[idx] = el; }}
                onMouseEnter={() => setHoveredIdx(idx)}
                className={`${baseClass} ${s.nav} flex items-center gap-1.5`}
              >
                <Home size={13} />
                Home
              </Link>
            );

            if (item.type === 'shop') return (
              <Link
                key="shop"
                to="/shop"
                ref={el => { itemRefs.current[idx] = el; }}
                onMouseEnter={() => setHoveredIdx(idx)}
                className={`${baseClass} ${isShop ? 'text-[#C8975A] font-medium' : s.nav}`}
              >
                All Chocolates
                {isShop && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8975A]" />
                )}
              </Link>
            );

            if (item.type === 'section' && item.link) return (
              <button
                key={item.link.path}
                ref={el => { itemRefs.current[idx] = el; }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onClick={() => handleSectionClick(item.link!.path)}
                className={`${baseClass} ${s.nav}`}
              >
                {item.link.label}
              </button>
            );

            return null;
          })}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={openDrawer}
            className={`relative p-2 transition-all duration-300 hover:scale-110 ${s.icon}`}
            aria-label="Open cart"
          >
            <ShoppingBag size={22} />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8975A] text-white text-xs rounded-full flex items-center justify-center font-medium">
                {totalQuantity}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 transition-all duration-300 hover:scale-110 ${s.icon}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#F5E6D3] shadow-lg md:hidden z-40 border-t border-[#C4A882]/20">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {!isHome && (
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-left py-3 px-3 font-body text-sm text-[#2C1810] hover:text-[#C8975A] hover:bg-[#C8975A]/8 rounded-lg border-b border-[#C4A882]/20 transition-all"
              >
                <Home size={14} /> Home
              </Link>
            )}
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className={`text-left py-3 px-3 font-body text-sm rounded-lg border-b border-[#C4A882]/20 transition-all ${
                isShop ? 'text-[#C8975A] font-medium bg-[#C8975A]/8' : 'text-[#2C1810] hover:text-[#C8975A] hover:bg-[#C8975A]/8'
              }`}
            >
              All Chocolates
            </Link>
            {sectionLinks.map(link => (
              <button
                key={link.path}
                onClick={() => handleSectionClick(link.path)}
                className="text-left py-3 px-3 font-body text-sm text-[#2C1810] hover:text-[#C8975A] hover:bg-[#C8975A]/8 rounded-lg border-b border-[#C4A882]/20 transition-all"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
