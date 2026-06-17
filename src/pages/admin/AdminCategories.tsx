import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, X, Check, Loader2, AlertCircle } from 'lucide-react';

interface Category {
  id: string; name: string; slug: string; description: string; sort_order: number;
}

const emptyCategory = (): Category => ({ id: '', name: '', slug: '', description: '', sort_order: 0 });

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) setError(error.message);
    else setCategories((data as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const slug = editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload = { name: editing.name, slug, description: editing.description, sort_order: editing.sort_order };
    let err;
    if (isNew) ({ error: err } = await supabase.from('categories').insert([payload]));
    else ({ error: err } = await supabase.from('categories').update(payload).eq('id', editing.id));
    if (err) setError(err.message);
    else { setEditing(null); await load(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('categories').delete().eq('id', id);
    if (err) setError(err.message);
    else await load();
  };

  if (loading) return <div className="p-8 flex items-center gap-3 text-gray-400"><Loader2 size={20} className="animate-spin" /> Loading…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[#2C1810]">Categories</h1>
          <p className="font-body text-sm text-gray-500 mt-1">{categories.length} categories · synced with Supabase</p>
        </div>
        <button onClick={() => { setEditing(emptyCategory()); setIsNew(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#C8975A] text-white rounded font-body text-sm hover:bg-[#C8975A]/90">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 font-body text-sm"><AlertCircle size={16} /> {error}</div>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Slug</th>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Description</th>
              <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wide">Order</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-gray-400">No categories yet.</td></tr>}
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-body text-sm text-[#2C1810] font-medium">{cat.name}</td>
                <td className="px-4 py-3"><code className="font-body text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{cat.slug}</code></td>
                <td className="px-4 py-3 font-body text-sm text-gray-500">{cat.description}</td>
                <td className="px-4 py-3 font-body text-sm text-gray-500">{cat.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => { setEditing({ ...cat }); setIsNew(false); }} className="p-1.5 text-gray-400 hover:text-[#C8975A]"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setEditing(null)} />
          <div className="relative bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display text-lg text-[#2C1810]">{isNew ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setEditing(null)} disabled={saving} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-body text-sm text-gray-500 block mb-1">Name *</label>
                <input type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
              </div>
              <div>
                <label className="font-body text-sm text-gray-500 block mb-1">Slug (auto-generated if blank)</label>
                <input type="text" value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" placeholder="e.g. gift-set" />
              </div>
              <div>
                <label className="font-body text-sm text-gray-500 block mb-1">Description</label>
                <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A] resize-none" />
              </div>
              <div>
                <label className="font-body text-sm text-gray-500 block mb-1">Sort Order</label>
                <input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded font-body text-sm focus:outline-none focus:border-[#C8975A]" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setEditing(null)} disabled={saving} className="flex-1 py-2 border border-gray-200 rounded font-body text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !editing.name} className="flex-1 py-2 bg-[#C8975A] text-white rounded font-body text-sm hover:bg-[#C8975A]/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
