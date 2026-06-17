import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingCart, TrendingUp, Star, Loader2, RefreshCw } from 'lucide-react';

interface ProductRow { id: string; name: string; images: string[]; price: number; category: string; stock_level: string; in_stock: boolean; seasonal: boolean; }
interface OrderRow { id: string; total: number; status: string; customer_name: string; created_at: string; city: string; }

export default function AdminDashboard() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from('products').select('id, name, images, price, category, stock_level, in_stock, seasonal').order('created_at'),
      supabase.from('orders').select('id, total, status, customer_name, created_at, city').order('created_at', { ascending: false }).limit(5),
    ]);
    setProducts((prods as ProductRow[]) ?? []);
    setOrders((ords as OrderRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const stats = [
    { label: 'Total Products', value: products.length, icon: <Package size={20} />, color: 'bg-[#C8975A]/10 text-[#C8975A]' },
    { label: 'In Stock', value: products.filter(p => p.in_stock).length, icon: <TrendingUp size={20} />, color: 'bg-green-100 text-green-600' },
    { label: 'Low Stock', value: products.filter(p => p.stock_level === 'low').length, icon: <ShoppingCart size={20} />, color: 'bg-red-100 text-red-600' },
    { label: 'Seasonal Items', value: products.filter(p => p.seasonal).length, icon: <Star size={20} />, color: 'bg-blue-100 text-blue-600' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700', processing: 'bg-blue-50 text-blue-700',
    shipped: 'bg-purple-50 text-purple-700', delivered: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-700',
  };

  if (loading) return <div className="p-8 flex items-center gap-3 text-gray-400"><Loader2 size={20} className="animate-spin" /> Loading dashboard…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl text-[#2C1810]">Dashboard</h1>
        <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded font-body text-sm text-gray-500 hover:bg-gray-50"><RefreshCw size={14} /> Refresh</button>
      </div>
      <p className="font-body text-sm text-gray-500 mb-8">Live data from Supabase.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="font-body text-2xl font-semibold text-[#2C1810]">{s.value}</p>
            <p className="font-body text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display text-lg text-[#2C1810]">Products</h2>
            <span className="font-body text-xs text-gray-400">{products.length} total</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {products.length === 0 && <p className="p-5 font-body text-sm text-gray-400">No products. Add them in the Products section.</p>}
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover bg-gray-100 flex-shrink-0" /> : <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-[#2C1810] truncate">{p.name}</p>
                  <p className="font-body text-xs text-gray-400 capitalize">{p.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-body text-sm font-medium text-[#C8975A]">Rs {p.price}</p>
                  <span className={`font-body text-xs px-2 py-0.5 rounded-full ${p.stock_level === 'high' ? 'bg-green-50 text-green-600' : p.stock_level === 'low' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {p.stock_level === 'high' ? 'In Stock' : p.stock_level === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display text-lg text-[#2C1810]">Recent Orders</h2>
            <span className="font-body text-xs text-gray-400">latest 5</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {orders.length === 0 && <p className="p-5 font-body text-sm text-gray-400">No orders yet.</p>}
            {orders.map(o => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-[#2C1810] font-medium">{o.id}</p>
                  <p className="font-body text-xs text-gray-400">{o.customer_name} · {new Date(o.created_at).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-body text-sm font-medium text-[#C8975A]">Rs {o.total}</p>
                  <span className={`font-body text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[o.status] ?? 'bg-gray-100 text-gray-500'}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
