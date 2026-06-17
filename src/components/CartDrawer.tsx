import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, Minus, Plus, Trash2, Gift, ChevronDown, ChevronUp, Snowflake } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const ribbonColors = [
  { key: 'gold' as const, label: 'Gold', color: '#D4AF37' },
  { key: 'crimson' as const, label: 'Crimson', color: '#8B1A2B' },
  { key: 'sage' as const, label: 'Sage', color: '#7A8B6F' },
];

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    state, closeDrawer, subtotal, shippingCost, total,
    totalQuantity, giftWrapTotal, isColdChainRequired,
    icePackCount, freeShippingProgress, freeShippingMessage,
    removeItem, updateQuantity, updateGiftWrap, getCartProduct,
  } = useCart();

  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = state.isDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [state.isDrawerOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isDrawerOpen) closeDrawer();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.isDrawerOpen, closeDrawer]);

  if (!state.isDrawerOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={closeDrawer} />
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-[#F5E6D3] z-[70] flex flex-col shadow-2xl"
        style={{ animation: 'slideIn 0.3s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#C4A882]/30">
          <h2 className="font-display text-xl text-[#2C1810]">
            Your Cart
            {totalQuantity > 0 && <span className="ml-2 text-sm font-body text-[#C4A882]">({totalQuantity})</span>}
          </h2>
          <button onClick={closeDrawer} className="p-2 hover:bg-[#2C1810]/5 rounded transition-colors">
            <X size={20} className="text-[#2C1810]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBagEmpty />
              <p className="font-display text-lg text-[#2C1810] mt-4">Your cart is empty</p>
              <p className="font-body text-sm text-[#C4A882] mt-2">Explore our chocolate collection</p>
            </div>
          ) : (
            <>
              {/* Free Shipping Bar */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {isColdChainRequired && <Snowflake size={14} className="text-[#4A90D9]" />}
                  <span className="font-body text-xs text-[#5C3A2A]">{freeShippingMessage}</span>
                </div>
                <div className="h-2 bg-[#C4A882]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress * 100}%`, background: 'linear-gradient(90deg, #D4AF37, #C8975A)' }}
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                {state.items.map((item, index) => {
                  const product = getCartProduct(item.productId);
                  if (!product) return null;
                  const isExpanded = expandedItem === item.productId;

                  return (
                    <div key={item.productId} className="bg-white/50 rounded p-4" style={{ animation: `fadeSlideIn 0.3s ease ${index * 0.05}s both` }}>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 flex-shrink-0 bg-[#2C1810]/5 rounded overflow-hidden">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-display text-sm text-[#2C1810] truncate pr-2">{product.name}</h3>
                            <button onClick={() => removeItem(item.productId)} className="p-1 hover:bg-[#B8324A]/10 rounded flex-shrink-0">
                              <Trash2 size={14} className="text-[#B8324A]" />
                            </button>
                          </div>
                          <p className="font-body text-sm text-[#C8975A] mt-1">Rs {product.price}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border border-[#C4A882]/40 rounded hover:bg-[#2C1810]/5">
                                <Minus size={14} className="text-[#2C1810]" />
                              </button>
                              <span className="font-body text-sm text-[#2C1810] w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border border-[#C4A882]/40 rounded hover:bg-[#2C1810]/5">
                                <Plus size={14} className="text-[#2C1810]" />
                              </button>
                            </div>
                            <button
                              onClick={() => setExpandedItem(isExpanded ? null : item.productId)}
                              className="flex items-center gap-1 text-xs font-body text-[#C8975A]"
                            >
                              <Gift size={14} />
                              {item.giftWrap.enabled ? <span className="text-[#D4AF37]">✓</span> : <span>Gift Wrap</span>}
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#C4A882]/20">
                          <label className="flex items-center gap-2 mb-3">
                            <input
                              type="checkbox"
                              checked={item.giftWrap.enabled}
                              onChange={(e) => updateGiftWrap(item.productId, { ...item.giftWrap, enabled: e.target.checked })}
                              className="w-4 h-4 accent-[#C8975A]"
                            />
                            <span className="font-body text-sm text-[#2C1810]">Add Gift Wrap (+Rs 35)</span>
                          </label>
                          {item.giftWrap.enabled && (
                            <>
                              <div className="mb-3">
                                <span className="font-body text-xs text-[#C4A882] block mb-2">Ribbon Color</span>
                                <div className="flex gap-3">
                                  {ribbonColors.map(rc => (
                                    <button
                                      key={rc.key}
                                      onClick={() => updateGiftWrap(item.productId, { ...item.giftWrap, ribbonColor: rc.key })}
                                      className={`w-8 h-8 rounded-full border-2 ${item.giftWrap.ribbonColor === rc.key ? 'border-[#2C1810] scale-110' : 'border-transparent'}`}
                                      style={{ backgroundColor: rc.color }}
                                      title={rc.label}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="font-body text-xs text-[#C4A882] block mb-1">Message (max 200 chars)</span>
                                <textarea
                                  value={item.giftWrap.message}
                                  onChange={(e) => updateGiftWrap(item.productId, { ...item.giftWrap, message: e.target.value.slice(0, 200) })}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white border border-[#C4A882]/30 rounded font-body text-sm text-[#2C1810] resize-none focus:outline-none focus:border-[#C8975A]"
                                  placeholder="Write your message..."
                                />
                                <span className="text-xs text-[#C4A882]">{item.giftWrap.message.length}/200</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isColdChainRequired && (
                <div className="mt-4 p-3 bg-[#4A90D9]/10 rounded flex items-start gap-2">
                  <Snowflake size={16} className="text-[#4A90D9] flex-shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-[#2C1810]">
                    Temperature-sensitive items require cold-chain shipping ({icePackCount} ice pack{icePackCount > 1 ? 's' : ''})
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="p-6 border-t border-[#C4A882]/30 bg-[#F5E6D3]">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between font-body text-sm">
                <span className="text-[#C4A882]">Subtotal</span>
                <span className="text-[#2C1810]">Rs {subtotal}</span>
              </div>
              {giftWrapTotal > 0 && (
                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#C4A882]">Gift Wrap</span>
                  <span className="text-[#2C1810]">Rs {giftWrapTotal}</span>
                </div>
              )}
              <div className="flex justify-between font-body text-sm">
                <span className="text-[#C4A882]">Shipping</span>
                <span className={shippingCost === 0 ? 'text-[#7A8B6F]' : 'text-[#2C1810]'}>
                  {shippingCost === 0 ? 'Free' : `Rs ${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between font-body text-base font-medium pt-2 border-t border-[#C4A882]/20">
                <span className="text-[#2C1810]">Total</span>
                <span className="text-[#2C1810]">Rs {total}</span>
              </div>
            </div>
            <button
              onClick={() => { closeDrawer(); navigate('/checkout'); }}
              className="w-full h-14 bg-[#C8975A] text-white font-display text-base rounded hover:bg-[#C8975A]/90 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </>
  );
}

function ShoppingBagEmpty() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
