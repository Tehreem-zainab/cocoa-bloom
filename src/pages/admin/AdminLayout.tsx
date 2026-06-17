import { NavLink, Outlet, useNavigate } from 'react-router';
import { Package, ShoppingCart, Layers, Home, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
  { to: '/admin/products', label: 'Products', icon: <Package size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
  { to: '/admin/categories', label: 'Categories', icon: <Layers size={18} /> },
  { to: '/admin/homepage', label: 'Homepage', icon: <Home size={18} /> },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    sessionStorage.removeItem('cb_admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-[#2C1810] flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <span className="font-display text-white text-sm truncate">Cocoa Bloom Admin</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 font-body text-sm transition-colors ${
                  isActive
                    ? 'bg-[#C8975A]/20 text-[#C8975A]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white font-body text-sm transition-colors border-t border-white/10"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
