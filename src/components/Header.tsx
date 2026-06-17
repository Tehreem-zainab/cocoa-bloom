import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { zh: 'All Chocolates', en: 'All Chocolates', path: '/#products' },
  { zh: 'Seasonal Limited Edition', en: 'Seasonal Limited Edition', path: '/#seasonal' },
  { zh: 'Production Process', en: 'Production Process', path: '/#bean-to-bar' },
  { zh: 'Gift Box Guide', en: 'Gift Box Guide', path: '/#gift-guide' },
];

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const { totalQuantity, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // After navigating to home, scroll to the hash section
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

  const isHome = location.pathname === '/';
  const showSolid = !isHome || scrolled;

  const handleNavClick = (path: string) => {
    const sectionId = path.replace('/#', '');
    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${sectionId}`);
    }
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center transition-all duration-300 ${
        showSolid
          ? 'bg-[#F5E6D3] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className={`font-display text-2xl tracking-wide ${showSolid ? 'text-[#2C1810]' : 'text-white'}`}>
            Cocoa Bloom
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`font-body text-sm tracking-wide transition-colors hover:text-[#C8975A] ${
                showSolid ? 'text-[#2C1810]' : 'text-white/90'
              }`}
            >
              {link.en}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <button
            onClick={openDrawer}
            className={`relative p-2 transition-colors ${
              showSolid ? 'text-[#2C1810]' : 'text-white'
            }`}
            aria-label="Cart"
          >
            <ShoppingBag size={22} />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8975A] text-white text-xs rounded-full flex items-center justify-center font-medium">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 ${showSolid ? 'text-[#2C1810]' : 'text-white'}`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#F5E6D3] shadow-lg md:hidden">
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className="text-[#2C1810] font-body text-left py-2 border-b border-[#C4A882]/20"
              >
                {link.en}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
