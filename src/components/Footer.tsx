import { Link } from 'react-router';
import { Instagram, Facebook, Mail } from 'lucide-react';

const shopLinks = [
  { label: 'All Chocolates', path: '/#products' },
  { label: 'Seasonal Limited Edition', path: '/#seasonal' },
  { label: 'Production Process', path: '/#bean-to-bar' },
  { label: 'Gift Box Guide', path: '/#gift-guide' },
];

const supportLinks = ['Shipping Info', 'FAQ', 'Contact', 'Privacy Policy'];

export default function Footer() {
  return (
    <footer className="bg-[#2C1810] text-[#F5E6D3]">
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl mb-4">Cocoa Bloom</h3>
            <p className="font-body text-sm text-[#C4A882] leading-relaxed mb-6">
              Bean to Luxury. Discover the finest artisanal chocolate.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#C4A882] hover:text-[#C8975A] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-[#C4A882] hover:text-[#C8975A] transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-[#C4A882] hover:text-[#C8975A] transition-colors"><Mail size={20} /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-lg mb-4">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body text-sm text-[#C4A882] hover:text-[#C8975A] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map(label => (
                <li key={label}>
                  <span className="font-body text-sm text-[#C4A882] hover:text-[#C8975A] transition-colors cursor-pointer">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg mb-4">Newsletter</h4>
            <p className="font-body text-sm text-[#C4A882] mb-4">
              Get the latest products and exclusive offers
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-[#2C1810] border border-[#C4A882]/30 rounded-l font-body text-sm text-[#F5E6D3] placeholder:text-[#C4A882]/50 focus:outline-none focus:border-[#C8975A]"
              />
              <button className="px-4 py-2.5 bg-[#C8975A] text-white rounded-r font-body text-sm hover:bg-[#C8975A]/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#C4A882]/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-[#C4A882]">&copy; 2026 Cocoa Bloom. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs text-[#C4A882]">JazzCash</span>
            <span className="font-body text-xs text-[#C4A882]">Cash on Delivery</span>
            <span className="font-body text-xs text-[#C4A882]">Visa</span>
            <span className="font-body text-xs text-[#C4A882]">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
