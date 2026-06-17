import { useState, useEffect, useRef } from 'react';
import { supabase, uploadProductImage, deleteProductImage } from '@/lib/supabase';
import type { Product } from '@/types';
import { Plus, Pencil, Trash2, X, Check, Upload, Loader2, AlertCircle } from 'lucide-react';

type Row = {
  id: string; slug: string; name: string; description: string;
  short_description: string; price: number; compare_at_price: number | null;
  images: string[]; category: Product['category']; stock_level: Product['stockLevel'];
  in_stock: boolean; seasonal: boolean; cold_chain_required: boolean;
  is_truffle: boolean; gift_wrappable: boolean; tasting_notes: string[];
  ingredients: string; allergens: string[];
};

const emptyRow = (): Row => ({
  id: '', slug: '', name: '', description: '', short_description: '',
  price: 0, compare_at_price: null, images: [], category: 'bar',
  stock_level: 'high', in_stock: true, seasonal: false,
  cold_chain_required: false, is_truffle: false, gift_wrappable: true,
  tasting_notes: [], ingredients: '', allergens: [],
});

export default function AdminProducts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(emptyRow()); setIsNew(true); };
  const openEdit = (r: Row) => { setEditing({ ...r }); setIsNew(false); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing || !e.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(e.target.files[0]);
      setEditing({ ...editing, images: [...editing.images, url] });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = async (url: string) => {
    if (!editing) return;
    await deleteProductImage(url);
    setEditing({ ...editing, images: editing.images.filter(i => i !== url) });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    const slug = editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload = { ...editing, slug };
    delete (payload as { id?: string }).id;

    let err;
    if (isNew) {
      ({ error: err } = await supabase.from('products').insert([payload]));
    } else {
      ({ error: err } = await supabase.from('products').update(payload).eq('id', editing.id));
    }
    if (err) setError(err.message);
    else { setEditing(null); await load(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('products').delete().eq('id', id);
    if (err) setError(err.message);
    else { setDeleteId(null); await load(); }
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-gray-400">
      <Loader2 size={20} className="animate-spin" /> Loading products…
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[#2C1810]">Products</h1>
          <p className="font-body text-sm text-gray-500 mt-1">{rows.length} products · synced with Supabase</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#C8975A] text-white rounded font-body text-sm hover:bg-[#C8975A]/90">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 font-body text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Product</th>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Price</th>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Stock</th>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Seasonal</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-gray-400">No products yet. Add your first product.</td></tr>
            )}
            {rows.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover bg-gray-100 flex-shrink-0" />}
                    <div>
                      <p className="font-body text-sm text-[#2C1810]">{p.name}</p>
                      <p className="font-body text-xs text-gray-400">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="font-body text-xs px-2 py-1 bg-gray-100 rounded capitalize">{p.category}</span></td>
                <td className="px-4 py-3"><span className="font-body text-sm text-[#C8975A] font-medium">Rs {p.price}</span></td>
                <td className="px-4 py-3">
                  <span className={`font-body text-xs px-2 py-1 rounded-full ${p.stock_level === 'high' ? 'bg-green-50 text-green-600' : p.stock_level === 'low' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {p.stock_level === 'high' ? 'In Stock' : p.stock_level === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-4 py-3"><span className={`font-body text-xs ${p.seasonal ? 'text-blue-600' : 'text-gray-400'}`}>{p.seasonal ? 'Yes' : 'No'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-[#C8975A]"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setEditing(null)} />
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="font-display text-lg text-[#2C1810]">{isNew ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setEditing(null)} disabled={saving} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Images */}
              <div>
                <label className="font-body text-sm text-gray-500 block mb-2">Product Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {editing.images.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded overflow-hidden bg-gray-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(url)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-20 h-20 border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-gray-400 hover:border-[#C8975A] hover:text-[#C8975A] transition-colors"
                  >
                    {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <><Upload size={18} /><span className="text-xs mt-1">Upload</span></>}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="font-body text-sm text-gray-500 block mb-1">Name *</label>
                  <input type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
                </div>
                <div className="md:col-span-2">
                  <label className="font-body text-sm text-gray-500 block mb-1">Slug (auto-generated if blank)</label>
                  <input type="text" value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" placeholder="sea-salt-caramel-truffle" />
                </div>
                <div className="md:col-span-2">
                  <label className="font-body text-sm text-gray-500 block mb-1">Short Description</label>
                  <input type="text" value={editing.short_description} onChange={e => setEditing({ ...editing, short_description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
                </div>
                <div className="md:col-span-2">
                  <label className="font-body text-sm text-gray-500 block mb-1">Full Description</label>
                  <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A] resize-none" />
                </div>
                <div>
                  <label className="font-body text-sm text-gray-500 block mb-1">Price (Rs) *</label>
                  <input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
                </div>
                <div>
                  <label className="font-body text-sm text-gray-500 block mb-1">Compare-at Price (Rs)</label>
                  <input type="number" value={editing.compare_at_price ?? ''} onChange={e => setEditing({ ...editing, compare_at_price: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" placeholder="Optional" />
                </div>
                <div>
                  <label className="font-body text-sm text-gray-500 block mb-1">Category</label>
                  <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value as Product['category'] })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]">
                    <option value="bar">Bar</option>
                    <option value="truffle">Truffle</option>
                    <option value="bonbon">Bonbon</option>
                    <option value="gift-set">Gift Set</option>
                  </select>
                </div>
                <div>
                  <label className="font-body text-sm text-gray-500 block mb-1">Stock Level</label>
                  <select value={editing.stock_level} onChange={e => setEditing({ ...editing, stock_level: e.target.value as Product['stockLevel'] })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]">
                    <option value="high">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="font-body text-sm text-gray-500 block mb-1">Ingredients</label>
                  <input type="text" value={editing.ingredients} onChange={e => setEditing({ ...editing, ingredients: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
                </div>
                <div className="md:col-span-2">
                  <label className="font-body text-sm text-gray-500 block mb-1">Allergens (comma-separated)</label>
                  <input type="text" value={editing.allergens.join(', ')} onChange={e => setEditing({ ...editing, allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" placeholder="milk, soy, tree-nuts" />
                </div>
                <div className="md:col-span-2">
                  <label className="font-body text-sm text-gray-500 block mb-1">Tasting Notes (comma-separated)</label>
                  <input type="text" value={editing.tasting_notes.join(', ')} onChange={e => setEditing({ ...editing, tasting_notes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" placeholder="Dark cherry, Roasted hazelnut" />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {([['in_stock','In Stock'],['seasonal','Seasonal'],['cold_chain_required','Cold Chain Required'],['is_truffle','Is Truffle'],['gift_wrappable','Gift Wrappable']] as [keyof Row, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!editing[key]} onChange={e => setEditing({ ...editing, [key]: e.target.checked })} className="accent-[#C8975A]" />
                    <span className="font-body text-sm text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setEditing(null)} disabled={saving} className="flex-1 py-2 border border-gray-200 rounded font-body text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !editing.name} className="flex-1 py-2 bg-[#C8975A] text-white rounded font-body text-sm hover:bg-[#C8975A]/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'Saving…' : 'Save to Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-display text-lg text-[#2C1810] mb-2">Delete Product</h3>
            <p className="font-body text-sm text-gray-500 mb-6">This will permanently delete the product from Supabase. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-gray-200 rounded font-body text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-red-500 text-white rounded font-body text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
