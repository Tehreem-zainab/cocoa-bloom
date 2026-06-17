import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string; created_at: string; customer_name: string; email: string;
  address_line1: string; address_line2: string; city: string;
  province: string; postal_code: string; country: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number; shipping_cost: number; gift_wrap_total: number;
  total: number; status: OrderStatus; payment_method: string; notes: string;
}

const statusColors: Record<OrderStatus, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50   text-blue-700   border-blue-200',
  shipped:    'bg-purple-50 text-purple-700  border-purple-200',
  delivered:  'bg-green-50  text-green-700   border-green-200',
  cancelled:  'bg-red-50    text-red-700     border-red-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setOrders((data as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdatingId(id);
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) setError(error.message);
    else setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdatingId(null);
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-gray-400">
      <Loader2 size={20} className="animate-spin" /> Loading orders…
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[#2C1810]">Orders</h1>
          <p className="font-body text-sm text-gray-500 mt-1">{orders.length} orders · synced with Supabase</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded font-body text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 font-body text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-body text-gray-400">No orders yet. They'll appear here when customers check out.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => (
              <div key={order.id}>
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-body text-sm font-medium text-[#2C1810]">{order.id}</p>
                      <span className={`font-body text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[order.status]}`}>{order.status}</span>
                    </div>
                    <p className="font-body text-xs text-gray-400 mt-0.5">{order.customer_name} · {new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-body text-sm font-medium text-[#C8975A]">Rs {order.total}</p>
                    <p className="font-body text-xs text-gray-400">{order.city}</p>
                  </div>
                  <span className="text-gray-400 flex-shrink-0">{expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </div>

                {expanded === order.id && (
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-body text-xs text-gray-400 uppercase tracking-wide mb-2">Customer</p>
                        <p className="font-body text-sm text-[#2C1810] font-medium">{order.customer_name}</p>
                        <p className="font-body text-xs text-gray-500">{order.email}</p>
                        <p className="font-body text-xs text-gray-500 mt-1">
                          {order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}<br />
                          {order.city}{order.province ? `, ${order.province}` : ''} {order.postal_code}<br />
                          {order.country}
                        </p>
                      </div>
                      <div>
                        <p className="font-body text-xs text-gray-400 uppercase tracking-wide mb-2">Items</p>
                        {(order.items as { name: string; qty: number; price: number }[]).map((item, i) => (
                          <div key={i} className="flex justify-between font-body text-sm text-[#2C1810]">
                            <span>{item.name} × {item.qty}</span>
                            <span className="text-[#C8975A]">Rs {item.price}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="font-body text-xs text-gray-400 uppercase tracking-wide mb-2">Payment</p>
                        <p className="font-body text-sm text-[#2C1810] capitalize">{order.payment_method}</p>
                        <div className="mt-2 space-y-1 font-body text-xs text-gray-500">
                          <div className="flex justify-between"><span>Subtotal</span><span>Rs {order.subtotal}</span></div>
                          <div className="flex justify-between"><span>Shipping</span><span>Rs {order.shipping_cost}</span></div>
                          {order.gift_wrap_total > 0 && <div className="flex justify-between"><span>Gift Wrap</span><span>Rs {order.gift_wrap_total}</span></div>}
                          <div className="flex justify-between font-medium text-[#2C1810] pt-1 border-t border-gray-200"><span>Total</span><span>Rs {order.total}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <label className="font-body text-sm text-gray-500">Update Status:</label>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                        disabled={updatingId === order.id}
                        className="px-3 py-1.5 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A] bg-white"
                      >
                        {(['pending','processing','shipped','delivered','cancelled'] as OrderStatus[]).map(s => (
                          <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {updatingId === order.id && <Loader2 size={14} className="animate-spin text-gray-400" />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
