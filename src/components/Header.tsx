import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { label: 'All Chocolates',           path: '/shop',         isRoute: true  },
  { label: 'Seasonal Limited Edition', path: '/#seasonal',    isRoute: false },
  { label: 'Production Process',       path: '/#bean-to-bar', isRoute: false },
  { label: 'Gift Box Guide',           path: '/#gift-guide',  isRoute: false },
];

export default function Header() {
  const { totalQuantity, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  // Scroll to hash after navigating to home
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location]);

  const isHome = location.pathname === '/';
  const isShop = location.pathname === '/shop';

  // ── Style mode resolution ────────────────────────────────────────────────────
  //
  // HOME (not scrolled)  → transparent bg, white text   (over dark video)
  // HOME (scrolled)      → beige bg, dark text          (past hero)
  // SHOP (not scrolled)  → transparent bg, dark text    (over beige page)
  // SHOP (scrolled)      → beige bg with subtle shadow  (sticky feel)
  // ALL OTHER pages      → always beige bg, dark text   (product detail, checkout…)
  //
  type Mode = 'home-transparent' | 'home-solid' | 'shop-transparent' | 'shop-solid' | 'inner';

  const mode: Mode = (() => {
    if (isHome  && !scrolled) return 'home-transparent';
    if (isHome  &&  scrolled) return 'home-solid';
    if (isShop  && !scrolled) return 'shop-transparent';
    if (isShop  &&  scrolled) return 'shop-solid';
    return 'inner';
  })();

  // ── Derived class strings ────────────────────────────────────────────────────

  const headerBg: Record<Mode, string> = {
    'home-transparent': 'bg-transparent',
    'home-solid':       'bg-[#F5E6D3] shadow-sm',
    'shop-transparent': 'bg-transparent',
    'shop-solid':       'bg-[#F5E6D3]/95 backdrop-blur-sm shadow-sm',
    'inner':            'bg-[#F5E6D3] shadow-sm',
  };

  const logoColor: Record<Mode, string> = {
    'home-transparent': 'text-white',
    'home-solid':       'text-[#2C1810]',
    'shop-transparent': 'text-[#2C1810]',   // dark on beige page
    'shop-solid':       'text-[#2C1810]',
    'inner':            'text-[#2C1810]',
  };

  const navColor: Record<Mode, string> = {
    'home-transparent': 'text-white/90 hover:text-[#C8975A]',
    'home-solid':       'text-[#2C1810] hover:text-[#C8975A]',
    'shop-transparent': 'text-[#2C1810] hover:text-[#C8975A]',  // chocolate brown
    'shop-solid':       'text-[#2C1810] hover:text-[#C8975A]',
    'inner':            'text-[#2C1810] hover:text-[#C8975A]',
  };

  const iconColor: Record<Mode, string> = {
    'home-transparent': 'text-white',
    'home-solid':       'text-[#2C1810]',
    'shop-transparent': 'text-[#2C1810]',
    'shop-solid':       'text-[#2C1810]',
    'inner':            'text-[#2C1810]',
  };

  const handleNavClick = (path: string, isRoute: boolean) => {
    if (isRoute) {
      navigate(path);
    } else {
      const sectionId = path.replace('/#', '');
      if (isHome) {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${sectionId}`);
      }
    }
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center transition-all duration-300 ${headerBg[mode]}`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className={`font-display text-2xl tracking-wide transition-colors duration-300 ${logoColor[mode]}`}>
            Cocoa Bloom
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => {
            const isActive = link.isRoute && location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path, link.isRoute)}
                className={`font-body text-sm tracking-wide transition-colors duration-200 ${
                  isActive
                    ? 'text-[#C8975A] border-b border-[#C8975A] pb-0.5'
                    : navColor[mode]
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right — cart + hamburger */}
        <div className="flex items-center gap-4">
          <button
            onClick={openDrawer}
            className={`relative p-2 transition-colors duration-300 ${iconColor[mode]}`}
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
            className={`md:hidden p-2 transition-colors duration-300 ${iconColor[mode]}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#F5E6D3] shadow-lg md:hidden z-40 border-t border-[#C4A882]/20">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map(link => {
              const isActive = link.isRoute && location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path, link.isRoute)}
                  className={`text-left py-3 px-2 rounded font-body text-sm border-b border-[#C4A882]/20 transition-colors ${
                    isActive
                      ? 'text-[#C8975A] font-medium'
                      : 'text-[#2C1810] hover:text-[#C8975A]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
