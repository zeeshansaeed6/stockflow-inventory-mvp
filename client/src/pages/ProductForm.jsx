/**
 * Create and edit a product in a single form component.
 * Route params decide the mode:
 *   /products/new   -> create
 *   /products/:id   -> edit
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const empty = {
  name: '',
  sku: '',
  description: '',
  quantityOnHand: 0,
  costPrice: '',
  sellingPrice: '',
  lowStockThreshold: '',
  category: '',
  supplier: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Load ref lists once so the dropdowns are populated.
  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
    api.get('/suppliers').then((r) => setSuppliers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name || '',
          sku: p.sku || '',
          description: p.description || '',
          quantityOnHand: p.quantityOnHand ?? 0,
          costPrice: p.costPrice ?? '',
          sellingPrice: p.sellingPrice ?? '',
          lowStockThreshold: p.lowStockThreshold ?? '',
          category: p.category?.id || '',
          supplier: p.supplier?.id || '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  // Convert form strings into typed values, leaving optional ones nullable.
  function buildPayload() {
    return {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description,
      quantityOnHand: Number(form.quantityOnHand) || 0,
      costPrice: form.costPrice === '' ? null : Number(form.costPrice),
      sellingPrice: form.sellingPrice === '' ? null : Number(form.sellingPrice),
      lowStockThreshold:
        form.lowStockThreshold === '' ? null : Number(form.lowStockThreshold),
      category: form.category || null,
      supplier: form.supplier || null,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-slate-500">Loading…</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit product' : 'New product'}
        </h1>
        <Link to="/products" className="text-sm text-brand-600 hover:underline">
          ← Back to products
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Name *</label>
            <input
              className="input"
              value={form.name}
              onChange={update('name')}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">SKU *</label>
            <input
              className="input"
              value={form.sku}
              onChange={update('sku')}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={update('description')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Quantity on hand</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.quantityOnHand}
              onChange={update('quantityOnHand')}
            />
          </div>
          <div>
            <label className="label">Cost price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.costPrice}
              onChange={update('costPrice')}
              placeholder="optional"
            />
          </div>
          <div>
            <label className="label">Selling price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.sellingPrice}
              onChange={update('sellingPrice')}
              placeholder="optional"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={update('category')}
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Supplier</label>
            <select
              className="input"
              value={form.supplier}
              onChange={update('supplier')}
            >
              <option value="">No supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-w-xs">
          <label className="label">Low stock threshold</label>
          <input
            type="number"
            min="0"
            className="input"
            value={form.lowStockThreshold}
            onChange={update('lowStockThreshold')}
            placeholder="uses org default"
          />
          <p className="text-xs text-slate-500 mt-1">
            Leave blank to use the organization default.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <Link to="/products" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
