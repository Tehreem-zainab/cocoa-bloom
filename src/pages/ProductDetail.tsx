import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { Minus, Plus, Star, ChevronDown, ChevronUp, Gift, Snowflake, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getProductBySlug, getProductById } from '@/data/products';
import type { Product } from '@/types';

const ribbonColors = [
  { key: 'gold' as const, label: 'Gold', color: '#D4AF37' },
  { key: 'crimson' as const, label: 'Crimson', color: '#8B1A2B' },
  { key: 'sage' as const, label: 'Sage', color: '#7A8B6F' },
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [ribbonColor, setRibbonColor] = useState<'gold' | 'crimson' | 'sage'>('gold');
  const [activeTab, setActiveTab] = useState<'flavor' | 'tasting' | 'ingredients' | 'pairings' | 'reviews'>('flavor');
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showRecipe, setShowRecipe] = useState(false);
  const [mainImage, setMainImage] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const easterTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (slug) {
      const p = getProductBySlug(slug);
      setProduct(p);
      setQuantity(1);
      setMainImage(0);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  const handleImageClick = useCallback(() => {
    if (!product?.isTruffle) return;
    const newCount = easterEggClicks + 1;
    setEasterEggClicks(newCount);
    if (easterTimer.current) clearTimeout(easterTimer.current);
    easterTimer.current = setTimeout(() => setEasterEggClicks(0), 2000);
    if (newCount >= 3) {
      setEasterEggClicks(0);
      setShowRecipe(true);
      if (easterTimer.current) clearTimeout(easterTimer.current);
    }
  }, [easterEggClicks, product]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    imageRef.current.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
      imageRef.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
    }
  };

  useEffect(() => {
    return () => { if (easterTimer.current) clearTimeout(easterTimer.current); };
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3]">
        <p className="font-display text-xl text-[#2C1810]">Product not found</p>
      </div>
    );
  }

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-[#F5E6D3] pt-20 overflow-x-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/" className="font-body text-sm text-[#C4A882] hover:text-[#C8975A] transition-colors">Home</Link>
          <span className="mx-2 text-[#C4A882]">/</span>
          <span className="font-body text-sm text-[#2C1810]">{product.name}</span>
        </nav>

        {/* Main Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Gallery */}
          <div className="w-full min-w-0">
            <div
              ref={imageRef}
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative bg-[#1a0a00] rounded overflow-hidden cursor-pointer transition-transform duration-300"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="aspect-square">
                <img src={product.images[mainImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(212,175,55,0.1) 50%, transparent 60%)' }}
              />
              {product.coldChainRequired && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#4A90D9]/90 text-white rounded flex items-center gap-1.5">
                  <Snowflake size={14} />
                  <span className="font-body text-xs">Cold Chain</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={`w-20 h-20 rounded overflow-hidden border-2 transition-colors ${mainImage === i ? 'border-[#C8975A]' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full min-w-0 max-w-full">
            <h1 className="w-full block font-display text-3xl md:text-4xl text-[#2C1810] mb-2 break-words">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-body text-2xl text-[#C8975A] font-medium">Rs {product.price}</span>
              {product.compareAtPrice && (
                <span className="font-body text-lg text-[#B8324A] line-through">Rs {product.compareAtPrice}</span>
              )}
            </div>

            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={avgRating} />
                <span className="font-body text-sm text-[#C4A882]">({product.reviews.length} reviews)</span>
              </div>
            )}

            <p className="w-full block font-body text-sm text-[#5C3A2A] leading-relaxed mb-6 break-words">{product.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {product.tastingNotes.slice(0, 3).map((note, i) => (
                <span key={i} className="px-3 py-1 bg-[#2C1810]/5 rounded-full font-body text-xs text-[#2C1810]">{note}</span>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${product.stockLevel === 'high' ? 'bg-[#7A8B6F]' : product.stockLevel === 'low' ? 'bg-[#B8324A]' : 'bg-gray-400'}`} />
              <span className="font-body text-sm text-[#C4A882]">
                {product.stockLevel === 'high' ? 'In Stock' : product.stockLevel === 'low' ? 'Low Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="font-body text-sm text-[#C4A882]">Quantity</span>
              <div className="flex items-center border border-[#C4A882]/30 rounded">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-[#2C1810]/5 transition-colors">
                  <Minus size={16} className="text-[#2C1810]" />
                </button>
                <span className="w-12 text-center font-body text-[#2C1810]">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-[#2C1810]/5 transition-colors">
                  <Plus size={16} className="text-[#2C1810]" />
                </button>
              </div>
            </div>

            <button
              onClick={() => addItem(product.id, quantity)}
              className="w-full h-14 bg-[#C8975A] text-white font-display text-base rounded hover:bg-[#C8975A]/90 transition-colors mb-4"
            >
              Add to Cart — Rs {product.price * quantity}
            </button>

            {/* Gift Wrap */}
            <div className="w-full border border-[#C4A882]/20 rounded p-4">
              <button onClick={() => setGiftWrap(!giftWrap)} className="flex items-center gap-2 w-full">
                <Gift size={18} className="text-[#C8975A]" />
                <span className="font-body text-sm text-[#2C1810]">Add Gift Wrap (+Rs 35)</span>
                {giftWrap ? <ChevronUp size={16} className="ml-auto text-[#C4A882]" /> : <ChevronDown size={16} className="ml-auto text-[#C4A882]" />}
              </button>

              {giftWrap && (
                <div className="mt-4 pt-4 border-t border-[#C4A882]/20">
                  <div className="mb-3">
                    <span className="font-body text-xs text-[#C4A882] block mb-2">Ribbon Color</span>
                    <div className="flex gap-3">
                      {ribbonColors.map(rc => (
                        <button
                          key={rc.key}
                          onClick={() => setRibbonColor(rc.key)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${ribbonColor === rc.key ? 'border-[#2C1810] scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: rc.color }}
                          title={rc.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-body text-xs text-[#C4A882] block mb-1">Message</span>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value.slice(0, 200))}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-[#C4A882]/30 rounded font-body text-sm text-[#2C1810] resize-none focus:outline-none focus:border-[#C8975A]"
                      placeholder="Write your message..."
                    />
                    <span className="text-xs text-[#C4A882]">{giftMessage.length}/200</span>
                  </div>
                </div>
              )}
            </div>

            <p className="font-body text-xs text-[#C4A882] mt-4">SKU: CB-{product.id.padStart(4, '0')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-[#C4A882]/20 pt-8">
          <div className="flex flex-wrap gap-1 mb-8 border-b border-[#C4A882]/20">
            {[
              { key: 'flavor' as const, label: 'Flavor Map' },
              { key: 'tasting' as const, label: 'Tasting Notes' },
              { key: 'ingredients' as const, label: 'Ingredients & Allergens' },
              { key: 'pairings' as const, label: 'Pairings' },
              { key: 'reviews' as const, label: 'Reviews' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 font-body text-sm transition-colors border-b-2 ${activeTab === tab.key ? 'border-[#C8975A] text-[#2C1810]' : 'border-transparent text-[#C4A882] hover:text-[#2C1810]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'flavor' && <FlavorMap flavorMap={product.flavorMap} />}
            {activeTab === 'tasting' && <TastingNotes notes={product.tastingNotes} />}
            {activeTab === 'ingredients' && <Ingredients ingredients={product.ingredients} allergens={product.allergens} />}
            {activeTab === 'pairings' && <Pairings pairingIds={product.pairings} />}
            {activeTab === 'reviews' && <Reviews reviews={product.reviews} avgRating={avgRating} />}
          </div>
        </div>
      </div>

      {showRecipe && <SecretRecipeModal onClose={() => setShowRecipe(false)} />}
    </div>
  );
}

function FlavorMap({ flavorMap }: { flavorMap: Product['flavorMap'] }) {
  const axes = [
    { key: 'intensity',  label: 'Intensity'  },
    { key: 'sweetness',  label: 'Sweetness'  },
    { key: 'bitterness', label: 'Bitterness' },
    { key: 'fruitiness', label: 'Fruitiness' },
    { key: 'nuttiness',  label: 'Nuttiness'  },
  ];

  // Shrink the radar polygon so labels have breathing room inside the viewBox.
  // viewBox is 320×320; center is (160,160); polygon radius is 80px.
  // Labels sit at radius+30=110px from center — well inside the 160px half-width.
  const VB      = 320;          // viewBox width & height
  const center  = VB / 2;       // 160
  const radius  = 80;           // polygon max radius (was 100 — reduced to give label room)
  const labelR  = radius + 30;  // label distance from center (110px, fits in 160px half)
  const angleStep = (Math.PI * 2) / 5;

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const points = axes.map((_, i) =>
    getPoint(flavorMap[axes[i].key as keyof typeof flavorMap], i)
  );
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* viewBox makes the SVG fully responsive; labels never escape the canvas */}
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        width="100%"
        style={{ maxWidth: 320 }}
        className="mb-6"
        aria-label="Flavor profile radar chart"
      >
        {/* Grid rings */}
        {[2, 4, 6, 8, 10].map(level => (
          <polygon
            key={level}
            points={axes.map((_, i) => { const p = getPoint(level, i); return `${p.x},${p.y}`; }).join(' ')}
            fill="none" stroke="#C4A882" strokeWidth="0.5" opacity={0.3}
          />
        ))}

        {/* Axis lines from center */}
        {axes.map((_, i) => {
          const p = getPoint(10, i);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#C4A882" strokeWidth="0.5" opacity={0.3} />;
        })}

        {/* Data polygon */}
        <path d={pathData} fill="rgba(200,151,90,0.3)" stroke="#C8975A" strokeWidth="2" />

        {/* Data points */}
        {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="5" fill="#C8975A" />)}

        {/* Labels — positioned at labelR from center, fully inside viewBox */}
        {axes.map((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);
          return (
            <text
              key={axis.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#5C3A2A"
              fontSize="14"
              fontFamily="Inter, sans-serif"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function TastingNotes({ notes }: { notes: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notes.map((note, i) => (
        <div key={i} className="flex items-start gap-3 p-4 bg-white/50 rounded">
          <span className="w-8 h-8 bg-[#C8975A]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-display text-sm text-[#C8975A]">{i + 1}</span>
          </span>
          <p className="font-body text-[#2C1810] self-center">{note}</p>
        </div>
      ))}
    </div>
  );
}

function Ingredients({ ingredients, allergens }: { ingredients: string; allergens: string[] }) {
  const allergenLabels: Record<string, string> = {
    milk: 'Milk', soy: 'Soy', 'tree-nuts': 'Tree Nuts', gluten: 'Gluten', eggs: 'Eggs',
  };

  return (
    <div>
      <div className="mb-6">
        <h4 className="font-display text-lg text-[#2C1810] mb-3">Ingredients</h4>
        <p className="font-body text-sm text-[#5C3A2A] leading-relaxed">{ingredients}</p>
      </div>
      {allergens.length > 0 && (
        <div className="p-4 bg-[#B8324A]/5 rounded border border-[#B8324A]/20">
          <h4 className="font-display text-lg text-[#B8324A] mb-2 flex items-center gap-2">
            <span>⚠</span> Allergen Warning
          </h4>
          <p className="font-body text-sm text-[#5C3A2A]">
            This product contains: {allergens.map(a => allergenLabels[a] || a).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

function Pairings({ pairingIds }: { pairingIds: string[] }) {
  const pairings = pairingIds.map(id => getProductById(id)).filter(Boolean) as Product[];

  if (pairings.length === 0) {
    return <p className="font-body text-sm text-[#C4A882]">No pairing suggestions yet</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {pairings.map(product => (
        <Link key={product.id} to={`/product/${product.slug}`} className="group bg-white/50 rounded overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-square">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-4">
            <h4 className="font-display text-base text-[#2C1810] group-hover:text-[#C8975A] transition-colors">{product.name}</h4>
            <p className="font-body text-sm text-[#C8975A] mt-1">Rs {product.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Reviews({ reviews, avgRating }: { reviews: Product['reviews']; avgRating: number }) {
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length,
  }));
  const maxCount = Math.max(...ratingCounts.map(r => r.count), 1);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex items-center gap-4">
          <span className="font-display text-5xl text-[#2C1810]">{avgRating.toFixed(1)}</span>
          <div>
            <StarRating rating={avgRating} />
            <p className="font-body text-sm text-[#C4A882] mt-1">Based on {reviews.length} reviews</p>
          </div>
        </div>
        <div className="flex-1 max-w-md space-y-1">
          {ratingCounts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="font-body text-xs text-[#C4A882] w-6">{star}★</span>
              <div className="flex-1 h-2 bg-[#C4A882]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#C8975A] rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
              <span className="font-body text-xs text-[#C4A882] w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="p-4 bg-white/50 rounded">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} small />
                  {review.verified && (
                    <span className="px-2 py-0.5 bg-[#7A8B6F]/10 text-[#7A8B6F] font-body text-xs rounded">Verified Purchase</span>
                  )}
                </div>
                <p className="font-body text-sm text-[#C4A882] mt-1">{review.author} · {review.date}</p>
              </div>
            </div>
            <h5 className="font-display text-base text-[#2C1810] mb-1">{review.title}</h5>
            <p className="font-body text-sm text-[#5C3A2A]">{review.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRating({ rating, small }: { rating: number; small?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} size={small ? 14 : 18} className={star <= Math.round(rating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#C4A882]/30'} />
      ))}
    </div>
  );
}

function SecretRecipeModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#F5E6D3] rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto border-4 border-[#D4AF37] shadow-2xl" style={{ animation: 'modalIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-[#2C1810]/5 rounded transition-colors z-10">
          <X size={20} className="text-[#2C1810]" />
        </button>
        <div className="p-8">
          <div className="text-center mb-6">
            <h3 className="font-display text-3xl text-[#2C1810] mb-1">Cocoa Bloom</h3>
            <div className="w-16 h-px bg-[#D4AF37] mx-auto my-3" />
            <h4 className="font-display text-xl text-[#C8975A]">A Secret Recipe, Just for You</h4>
          </div>
          <div className="border-2 border-[#D4AF37]/30 rounded p-6 mb-6 bg-white/30">
            <h5 className="font-display text-lg text-[#2C1810] mb-2">Midnight Cocoa Truffle</h5>
            <p className="font-body text-sm text-[#C4A882] mb-4">Makes 24 truffles · 2 hours active, 4 hours total</p>
            <div className="mb-4">
              <h6 className="font-display text-base text-[#2C1810] mb-2">Ingredients</h6>
              <div className="grid grid-cols-2 gap-1 font-body text-sm text-[#5C3A2A]">
                <span>200g dark chocolate (70%)</span>
                <span>120ml heavy cream</span>
                <span>30g butter</span>
                <span>15g cocoa powder</span>
                <span>10g honey</span>
                <span>pinch of sea salt</span>
              </div>
            </div>
            <div>
              <h6 className="font-display text-base text-[#2C1810] mb-2">Steps</h6>
              <ol className="space-y-2 font-body text-sm text-[#5C3A2A]">
                <li className="flex gap-2"><span className="text-[#C8975A] font-medium">1.</span> Heat cream and honey until simmering, pour over chopped chocolate.</li>
                <li className="flex gap-2"><span className="text-[#C8975A] font-medium">2.</span> Rest 2 minutes, then stir until smooth. Add butter and salt.</li>
                <li className="flex gap-2"><span className="text-[#C8975A] font-medium">3.</span> Chill 4 hours until firm. Roll into small balls by hand.</li>
                <li className="flex gap-2"><span className="text-[#C8975A] font-medium">4.</span> Roll in cocoa powder and enjoy.</li>
              </ol>
            </div>
          </div>
          <div className="bg-[#2C1810] rounded p-4 text-[#F5E6D3]">
            <p className="font-body text-sm italic leading-relaxed">"This recipe was passed down from my grandmother. Every time I make it, I think of her in the kitchen. I hope it brings you the same warmth."</p>
            <p className="font-display text-sm text-[#C8975A] mt-2 text-right">— Élise, Head Chocolatier</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}
