import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface HomepageConfig {
  banner_headline: string;
  banner_subtitle: string;
  banner_cta: string;
  featured_product_ids: string[];
  announcement_bar: string;
  announcement_enabled: boolean;
}

interface ProductRow { id: string; name: string; images: string[]; price: number; }

const defaults: HomepageConfig = {
  banner_headline: 'From Beans to Luxury',
  banner_subtitle: 'Discover the finest artisanal chocolate',
  banner_cta: 'Explore Collection',
  featured_product_ids: [],
  announcement_bar: 'Free shipping on orders over Rs 5,000',
  announcement_enabled: true,
};

export default function AdminHomepage() {
  const [config, setConfig] = useState<HomepageConfig>(defaults);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: cfg }, { data: prods }] = await Promise.all([
        supabase.from('homepage_config').select('*').eq('id', 1).single(),
        supabase.from('products').select('id, name, images, price').order('created_at'),
      ]);
      if (cfg) setConfig(cfg as HomepageConfig);
      if (prods) setProducts(prods as ProductRow[]);
      setLoading(false);
    };
    load();
  }, []);

  const toggleFeatured = (id: string) => {
    setConfig(prev => {
      const ids = prev.featured_product_ids.includes(id)
        ? prev.featured_product_ids.filter(i => i !== id)
        : [...prev.featured_product_ids, id];
      return { ...prev, featured_product_ids: ids };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from('homepage_config')
      .upsert({ id: 1, ...config }, { onConflict: 'id' });
    if (err) setError(err.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  };

  if (loading) return <div className="p-8 flex items-center gap-3 text-gray-400"><Loader2 size={20} className="animate-spin" /> Loading…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[#2C1810]">Homepage Content</h1>
          <p className="font-body text-sm text-gray-500 mt-1">All changes saved to Supabase</p>
        </div>
        <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-4 py-2 rounded font-body text-sm transition-all disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'bg-[#C8975A] text-white hover:bg-[#C8975A]/90'}`}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 font-body text-sm"><AlertCircle size={16} /> {error}</div>}

      <div className="space-y-6">
        {/* Announcement Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-display text-lg text-[#2C1810] mb-4">Announcement Bar</h2>
          <label className="flex items-center gap-3 mb-3">
            <input type="checkbox" checked={config.announcement_enabled} onChange={e => setConfig({ ...config, announcement_enabled: e.target.checked })} className="accent-[#C8975A]" />
            <span className="font-body text-sm text-gray-600">Show announcement bar</span>
          </label>
          <input type="text" value={config.announcement_bar} onChange={e => setConfig({ ...config, announcement_bar: e.target.value })} disabled={!config.announcement_enabled} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A] disabled:opacity-50 disabled:bg-gray-50" />
        </div>

        {/* Hero Banner */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-display text-lg text-[#2C1810] mb-4">Hero Banner</h2>
          <div className="space-y-3">
            <div>
              <label className="font-body text-sm text-gray-500 block mb-1">Headline</label>
              <input type="text" value={config.banner_headline} onChange={e => setConfig({ ...config, banner_headline: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
            </div>
            <div>
              <label className="font-body text-sm text-gray-500 block mb-1">Subtitle</label>
              <input type="text" value={config.banner_subtitle} onChange={e => setConfig({ ...config, banner_subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
            </div>
            <div>
              <label className="font-body text-sm text-gray-500 block mb-1">CTA Button Text</label>
              <input type="text" value={config.banner_cta} onChange={e => setConfig({ ...config, banner_cta: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-display text-lg text-[#2C1810] mb-1">Featured Products</h2>
          <p className="font-body text-sm text-gray-400 mb-4">Tick products to feature on the homepage ({config.featured_product_ids.length} selected)</p>
          {products.length === 0 ? (
            <p className="font-body text-sm text-gray-400">No products yet. Add some in the Products section first.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map(p => {
                const featured = config.featured_product_ids.includes(p.id);
                return (
                  <button key={p.id} onClick={() => toggleFeatured(p.id)} className={`relative p-3 rounded border-2 text-left transition-all ${featured ? 'border-[#C8975A] bg-[#C8975A]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    {featured && <span className="absolute top-2 right-2 w-5 h-5 bg-[#C8975A] rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></span>}
                    <img src={p.images[0]} alt="" className="w-full aspect-square object-cover rounded mb-2 bg-gray-100" />
                    <p className="font-body text-xs text-[#2C1810] truncate">{p.name}</p>
                    <p className="font-body text-xs text-[#C8975A]">Rs {p.price}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
