import { useState, useEffect } from 'react';
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
  const location  = useLocation();
  const navigate  = useNavigate();

  const isHome = location.pathname === '/';
  const isShop = location.pathname === '/shop';

  useEffect(() => {
    // Reset scroll state on every route change so shop starts fresh
    setScrolled(false);
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]); // re-register per route

  useEffect(() => { setMobileOpen(false); }, [location]);

  // Scroll to hash section after navigating to home
  useEffect(() => {
    if (isHome && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location, isHome]);

  // ── Style mode ───────────────────────────────────────────────────────────────
  // home + above hero   → transparent, white text
  // home + scrolled     → beige, dark text
  // shop + not scrolled → transparent, dark text  (blends with beige page bg)
  // shop + scrolled     → frosted beige, dark text
  // any other inner page→ solid beige, dark text
  type Mode = 'home-hero' | 'home-scrolled' | 'shop-top' | 'shop-scrolled' | 'inner';

  const mode: Mode = isHome && !scrolled ? 'home-hero'
    : isHome &&  scrolled                ? 'home-scrolled'
    : isShop && !scrolled                ? 'shop-top'
    : isShop &&  scrolled                ? 'shop-scrolled'
    : 'inner';

  const styles: Record<Mode, { header: string; logo: string; nav: string; icon: string }> = {
    'home-hero':     { header: 'bg-transparent',                            logo: 'text-white',      nav: 'text-white/90',    icon: 'text-white'      },
    'home-scrolled': { header: 'bg-[#F5E6D3] shadow-sm',                   logo: 'text-[#2C1810]',  nav: 'text-[#2C1810]',   icon: 'text-[#2C1810]'  },
    'shop-top':      { header: 'bg-[#F5E6D3]/80 backdrop-blur-md',         logo: 'text-[#2C1810]',  nav: 'text-[#2C1810]',   icon: 'text-[#2C1810]'  },
    'shop-scrolled': { header: 'bg-[#F5E6D3]/95 backdrop-blur-sm shadow-sm', logo: 'text-[#2C1810]', nav: 'text-[#2C1810]', icon: 'text-[#2C1810]'  },
    'inner':         { header: 'bg-[#F5E6D3] shadow-sm',                   logo: 'text-[#2C1810]',  nav: 'text-[#2C1810]',   icon: 'text-[#2C1810]'  },
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

  // Active underline style
  const activeClass = 'text-[#C8975A] border-b-2 border-[#C8975A] pb-0.5';
  const navBase     = `font-body text-sm tracking-wide transition-colors duration-200 hover:text-[#C8975A]`;

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
        <nav className="hidden md:flex items-center gap-8">

          {/* "Home" — only visible on /shop (or any non-home page) */}
          {!isHome && (
            <Link
              to="/"
              className={`${navBase} ${s.nav} flex items-center gap-1.5`}
            >
              <Home size={14} />
              Home
            </Link>
          )}

          {/* "All Chocolates" — always visible */}
          <Link
            to="/shop"
            className={`${navBase} ${isShop ? activeClass : s.nav}`}
          >
            All Chocolates
          </Link>

          {/* Section-scroll links */}
          {sectionLinks.map(link => (
            <button
              key={link.path}
              onClick={() => handleSectionClick(link.path)}
              className={`${navBase} ${s.nav}`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button
            onClick={openDrawer}
            className={`relative p-2 transition-colors duration-300 ${s.icon}`}
            aria-label="Open cart"
          >
            <ShoppingBag size={22} />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8975A] text-white text-xs rounded-full flex items-center justify-center font-medium">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 transition-colors duration-300 ${s.icon}`}
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

            {/* Home link — only on non-home pages */}
            {!isHome && (
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-left py-3 px-2 font-body text-sm text-[#2C1810] hover:text-[#C8975A] border-b border-[#C4A882]/20 transition-colors"
              >
                <Home size={14} /> Home
              </Link>
            )}

            {/* All Chocolates */}
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className={`text-left py-3 px-2 font-body text-sm border-b border-[#C4A882]/20 transition-colors ${
                isShop ? 'text-[#C8975A] font-medium' : 'text-[#2C1810] hover:text-[#C8975A]'
              }`}
            >
              All Chocolates
            </Link>

            {/* Section links */}
            {sectionLinks.map(link => (
              <button
                key={link.path}
                onClick={() => handleSectionClick(link.path)}
                className="text-left py-3 px-2 font-body text-sm text-[#2C1810] hover:text-[#C8975A] border-b border-[#C4A882]/20 transition-colors"
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
