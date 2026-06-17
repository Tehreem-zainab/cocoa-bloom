import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Snowflake, Truck, CreditCard, Check, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

const SHIPPING_ZONES = [
  { name: 'Standard Shipping', days: '3-5', cost: 250, cold: false },
  { name: 'Expedited Shipping', days: '1-2', cost: 500, cold: false },
  { name: 'Cold-Chain Shipping', days: '1-2', cost: 0, cold: true, icePacks: true },
];

export default function Checkout() {
  const navigate = useNavigate();
  const {
    state, subtotal, shippingCost, total, giftWrapTotal,
    isColdChainRequired, icePackCount, freeShippingProgress, freeShippingMessage,
    getCartProduct, clearCart,
  } = useCart();

  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState({
    name: '', line1: '', line2: '', city: '', province: '', postalCode: '', country: 'PK',
  });
  const [shippingMethod, setShippingMethod] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'jazzcash'>('card');
  const [cardNumber, setCardNumber] = useState('');

  useEffect(() => {
    if (state.items.length === 0 && step !== 4) {
      navigate('/');
    }
  }, [state.items, step, navigate]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    const num = `CB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    // Persist order to Supabase
    const orderItems = state.items.map(item => {
      const product = getCartProduct(item.productId);
      return { name: product?.name ?? item.productId, qty: item.quantity, price: (product?.price ?? 0) * item.quantity };
    });
    await supabase.from('orders').insert([{
      id: num,
      customer_name: address.name,
      email,
      address_line1: address.line1,
      address_line2: address.line2,
      city: address.city,
      province: address.province,
      postal_code: address.postalCode,
      country: address.country,
      items: orderItems,
      subtotal,
      shipping_cost: shippingCost,
      gift_wrap_total: giftWrapTotal,
      total,
      status: 'pending',
      payment_method: paymentMethod,
      notes: '',
    }]);
    setOrderNumber(num);
    setStep(4);
    clearCart();
  };

  const isStepValid = () => {
    if (step === 1) return email.includes('@') && address.name && address.line1 && address.city;
    if (step === 2) return shippingMethod && deliveryDate;
    if (step === 3) return paymentMethod && (paymentMethod !== 'card' || cardNumber.length >= 16);
    return true;
  };

  const getShippingOptions = () => {
    if (isColdChainRequired) {
      return SHIPPING_ZONES.filter(z => z.cold);
    }
    return SHIPPING_ZONES.filter(z => !z.cold);
  };

  const getDeliveryDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 2; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const day = d.getDay();
      if (day === 0 || day === 6) continue;
      if (isColdChainRequired && i > 3) continue;
      dates.push({
        value: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', weekday: 'short' }),
      });
    }
    return dates;
  };

  const steps = [
    { num: 1, label: 'Information' },
    { num: 2, label: 'Shipping' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Confirmation' },
  ];

  if (step === 4 && orderNumber) {
    return (
      <div className="min-h-screen bg-[#F5E6D3] pt-20">
        <div className="max-w-[800px] mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 bg-[#7A8B6F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-[#7A8B6F]" />
          </div>
          <h1 className="font-display text-3xl text-[#2C1810] mb-2">Order Confirmed</h1>
          <p className="font-body text-[#C4A882] mb-2">
            Order Number: <span className="text-[#2C1810] font-medium">{orderNumber}</span>
          </p>
          <p className="font-body text-sm text-[#C4A882] mb-8">
            Estimated Delivery: {deliveryDate || '3-5 business days'}
          </p>

          {isColdChainRequired && (
            <div className="p-4 bg-[#4A90D9]/10 rounded mb-8 max-w-md mx-auto text-left">
              <div className="flex items-start gap-2">
                <Snowflake size={18} className="text-[#4A90D9] flex-shrink-0 mt-0.5" />
                <p className="font-body text-sm text-[#2C1810]">
                  Your chocolates will be shipped with ice packs. Refrigerate for 30 minutes upon arrival before opening to prevent condensation.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-[#C8975A] text-white font-display rounded hover:bg-[#C8975A]/90 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] pt-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex flex-col items-center ${i < steps.length - 1 ? 'mr-2' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-body text-sm ${
                  step >= s.num ? 'bg-[#C8975A] text-white' : 'bg-[#C4A882]/20 text-[#C4A882]'
                }`}>
                  {step > s.num ? <Check size={18} /> : s.num}
                </div>
                <span className={`font-body text-xs mt-2 ${step >= s.num ? 'text-[#2C1810]' : 'text-[#C4A882]'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight size={16} className="text-[#C4A882] mx-2 mb-6" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Left Column */}
          <div>
            {/* Step 1: Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-[#2C1810] mb-6">Contact Information</h2>

                <div>
                  <label className="font-body text-sm text-[#C4A882] block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                    placeholder="you@example.com"
                  />
                </div>

                <h3 className="font-display text-xl text-[#2C1810] mt-8 mb-4">Shipping Address</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="font-body text-sm text-[#C4A882] block mb-2">Full Name</label>
                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-body text-sm text-[#C4A882] block mb-2">Address</label>
                    <input
                      type="text"
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={address.line2}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                      placeholder="Apt, suite, etc. (optional)"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-[#C4A882] block mb-2">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-[#C4A882] block mb-2">Province</label>
                    <input
                      type="text"
                      value={address.province}
                      onChange={(e) => setAddress({ ...address, province: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-[#C4A882] block mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-[#C4A882] block mb-2">Country / Region</label>
                    <select
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                    >
                      <option value="PK">Pakistan</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-[#2C1810] mb-6">Shipping Method</h2>

                {isColdChainRequired && (
                  <div className="p-4 bg-[#4A90D9]/10 rounded border border-[#4A90D9]/20 mb-6">
                    <div className="flex items-start gap-3">
                      <Snowflake size={20} className="text-[#4A90D9] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-body text-sm text-[#2C1810] font-medium mb-1">Cold-Chain Shipping Required</p>
                        <p className="font-body text-xs text-[#5C3A2A]">
                          This order contains temperature-sensitive items and requires cold-chain shipping. Standard and expedited options are disabled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {getShippingOptions().map(option => (
                    <button
                      key={option.name}
                      onClick={() => setShippingMethod(option.name)}
                      className={`w-full p-4 border-2 rounded text-left transition-all ${
                        shippingMethod === option.name
                          ? 'border-[#C8975A] bg-[#C8975A]/5'
                          : 'border-[#C4A882]/20 hover:border-[#C4A882]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {option.cold ? <Snowflake size={20} className="text-[#4A90D9]" /> : <Truck size={20} className="text-[#C8975A]" />}
                          <div>
                            <p className="font-body text-[#2C1810]">{option.name}</p>
                            <p className="font-body text-xs text-[#C4A882]">{option.days} business days</p>
                          </div>
                        </div>
                        <span className="font-body text-[#C8975A] font-medium">
                          {shippingCost === 0 && option.cold ? 'Free' : `Rs ${option.cost || shippingCost}`}
                        </span>
                      </div>

                      {option.icePacks && icePackCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#C4A882]/20 flex items-center gap-2">
                          <span className="font-body text-xs text-[#C4A882]">
                            Includes {icePackCount} ice pack{icePackCount > 1 ? 's' : ''}:
                          </span>
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(icePackCount, 5) }).map((_, i) => (
                              <div key={i} className="w-6 h-6 bg-[#4A90D9]/20 rounded flex items-center justify-center">
                                <Snowflake size={12} className="text-[#4A90D9]" />
                              </div>
                            ))}
                            {icePackCount > 5 && (
                              <span className="font-body text-xs text-[#C4A882] self-center">+{icePackCount - 5}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <label className="font-body text-sm text-[#C4A882] block mb-3">Select Delivery Date</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getDeliveryDates().map(date => (
                      <button
                        key={date.value}
                        onClick={() => setDeliveryDate(date.value)}
                        className={`p-3 border rounded text-center transition-all ${
                          deliveryDate === date.value
                            ? 'border-[#C8975A] bg-[#C8975A]/5'
                            : 'border-[#C4A882]/20 hover:border-[#C4A882]/40'
                        }`}
                      >
                        <span className="font-body text-xs text-[#2C1810]">{date.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-[#2C1810] mb-6">Payment Method</h2>

                <div className="space-y-3 mb-6">
                  {[
                    { key: 'card' as const, label: 'Credit / Debit Card', icon: <CreditCard size={20} /> },
                    { key: 'jazzcash' as const, label: 'JazzCash', icon: <span className="text-lg font-bold">J</span> },
                    { key: 'cod' as const, label: 'Cash on Delivery', icon: <span className="text-lg">₨</span> },
                  ].map(method => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`w-full p-4 border-2 rounded text-left transition-all flex items-center gap-3 ${
                        paymentMethod === method.key
                          ? 'border-[#C8975A] bg-[#C8975A]/5'
                          : 'border-[#C4A882]/20 hover:border-[#C4A882]/40'
                      }`}
                    >
                      <span className="text-[#C8975A]">{method.icon}</span>
                      <span className="font-body text-[#2C1810]">{method.label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="font-body text-sm text-[#C4A882] block mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
                        className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-body text-sm text-[#C4A882] block mb-2">Expiry</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="font-body text-sm text-[#C4A882] block mb-2">CVC</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-[#C4A882]/30 rounded font-body text-[#2C1810] hover:bg-[#2C1810]/5 transition-colors"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex-1 py-3 bg-[#C8975A] text-white font-display rounded hover:bg-[#C8975A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={!isStepValid()}
                  className="flex-1 py-3 bg-[#C8975A] text-white font-display rounded hover:bg-[#C8975A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order — Rs {total}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white/50 rounded p-6">
              <h3 className="font-display text-lg text-[#2C1810] mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {state.items.map(item => {
                  const product = getCartProduct(item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-14 h-14 bg-[#2C1810]/5 rounded overflow-hidden flex-shrink-0">
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-[#2C1810] truncate">
                          {product.name.en}
                        </p>
                        <p className="font-body text-xs text-[#C4A882]">
                          x{item.quantity}
                          {item.giftWrap.enabled && (
                            <span className="ml-2 text-[#D4AF37]">
                              <Gift size={10} className="inline" /> Gift Wrap
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="font-body text-sm text-[#2C1810]">
                        Rs {product.price * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Free Shipping Bar */}
              <div className="mb-4 p-3 bg-[#D4AF37]/5 rounded">
                <p className="font-body text-xs text-[#5C3A2A] mb-2">
                  {freeShippingMessage}
                </p>
                <div className="h-1.5 bg-[#C4A882]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${freeShippingProgress * 100}%`,
                      background: 'linear-gradient(90deg, #D4AF37, #C8975A)',
                    }}
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-[#C4A882]/20">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
