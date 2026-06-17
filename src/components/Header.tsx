import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { label: 'All Chocolates',           path: '/shop',          isRoute: true  },
  { label: 'Seasonal Limited Edition', path: '/#seasonal',     isRoute: false },
  { label: 'Production Process',       path: '/#bean-to-bar',  isRoute: false },
  { label: 'Gift Box Guide',           path: '/#gift-guide',   isRoute: false },
];

export default function Header() {
  const { totalQuantity, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  // Scroll to hash section after navigating home
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location]);

  const isHome    = location.pathname === '/';
  const isShop    = location.pathname === '/shop';
  const showSolid = (!isHome && !isShop) || scrolled;

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

  const linkClass = `font-body text-sm tracking-wide transition-colors hover:text-[#C8975A] ${
    showSolid ? 'text-[#2C1810]' : 'text-white/90'
  }`;

  const activeLinkClass = `font-body text-sm tracking-wide text-[#C8975A] border-b border-[#C8975A] pb-0.5`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center transition-all duration-300 ${
      showSolid ? 'bg-[#F5E6D3] shadow-sm' : 'bg-transparent'
    }`}>
      <div className="w-full max-w-[1440px] mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className={`font-display text-2xl tracking-wide ${showSolid ? 'text-[#2C1810]' : 'text-white'}`}>
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
                className={isActive ? activeLinkClass : linkClass}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button
            onClick={openDrawer}
            className={`relative p-2 transition-colors ${showSolid ? 'text-[#2C1810]' : 'text-white'}`}
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
            className={`md:hidden p-2 ${showSolid ? 'text-[#2C1810]' : 'text-white'}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#F5E6D3] shadow-lg md:hidden z-40">
          <nav className="flex flex-col p-6 gap-1">
            {navLinks.map(link => {
              const isActive = link.isRoute && location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path, link.isRoute)}
                  className={`text-left py-3 px-2 rounded font-body text-sm border-b border-[#C4A882]/20 transition-colors
                    ${isActive ? 'text-[#C8975A] font-medium' : 'text-[#2C1810] hover:text-[#C8975A]'}`}
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
