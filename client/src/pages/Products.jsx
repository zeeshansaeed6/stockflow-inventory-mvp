import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      // Pull the default threshold so the "low" indicator can use it
      // for products that don't define their own.
      const [{ data: items }, { data: settings }] = await Promise.all([
        api.get('/products'),
        api.get('/settings'),
      ]);
      setProducts(items);
      setDefaultThreshold(settings.defaultLowStockThreshold);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Client-side search over name/SKU (nice for small catalogs).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [query, products]);

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  // Quick inline +/- adjustment. Keeps the list in sync without a full reload.
  async function handleAdjust(id, delta) {
    try {
      const { data } = await api.post(`/products/${id}/adjust`, { delta });
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
    } catch (err) {
      alert(err.response?.data?.message || 'Adjust failed');
    }
  }

  function isLow(p) {
    const t =
      p.lowStockThreshold === null || p.lowStockThreshold === undefined
        ? defaultThreshold
        : p.lowStockThreshold;
    return p.quantityOnHand <= t;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your inventory.</p>
        </div>
        <Link to="/products/new" className="btn-primary">
          + Add product
        </Link>
      </div>

      <div className="card p-4">
        <input
          className="input max-w-sm"
          type="text"
          placeholder="Search by name or SKU…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No products yet.{' '}
            <Link to="/products/new" className="text-brand-600 hover:underline">
              Add your first one
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">SKU</th>
                <th className="text-right px-5 py-3">Qty</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    <Link to={`/products/${p.id}`} className="hover:text-brand-600">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{p.sku}</td>
                  <td className="px-5 py-3 text-right text-slate-900">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjust(p.id, -1)}
                        className="w-7 h-7 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                        title="Decrease by 1"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-medium">
                        {p.quantityOnHand}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjust(p.id, 1)}
                        className="w-7 h-7 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                        title="Increase by 1"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {isLow(p) ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">
                        Low stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                        In stock
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">
                    {p.sellingPrice != null ? `$${Number(p.sellingPrice).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link to={`/products/${p.id}`} className="btn-secondary">
                      Edit
                    </Link>
                    <button className="btn-danger" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="text-xs text-slate-500">
          Showing {filtered.length} of {products.length} products
        </div>
      )}
    </div>
  );
}
