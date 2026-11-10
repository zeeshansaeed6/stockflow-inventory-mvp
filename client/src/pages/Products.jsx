import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  IconPlus,
  IconMinus,
  IconSearch,
  IconDownload,
  IconTrash,
  IconPencil,
  IconChevronLeft,
  IconChevronRight,
} from '../components/icons/index.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [query, setQuery] = useState('');
  // sortBy: 'name' | 'sku' | 'qty' | 'updated'
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [lowOnly, setLowOnly] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Keep the latest request's id so stale responses don't overwrite newer ones.
  const reqIdRef = useRef(0);

  async function load(searchTerm, p) {
    const myId = ++reqIdRef.current;
    setLoading(true);
    try {
      const params = { page: p, pageSize, sortBy, sortDir };
      if (searchTerm) params.q = searchTerm;
      if (lowOnly) params.lowOnly = 'true';

      const productsReq = api.get('/products', { params });
      const [{ data }, settingsRes] = await Promise.all([
        productsReq,
        defaultThreshold === 5 && !searchTerm
          ? api.get('/settings')
          : Promise.resolve(null),
      ]);
      if (myId !== reqIdRef.current) return;
      setProducts(data.items || []);
      setTotal(data.total || 0);
      if (settingsRes) setDefaultThreshold(settingsRes.data.defaultLowStockThreshold);
    } catch (err) {
      if (myId !== reqIdRef.current) return;
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }

  // Reset to page 1 whenever filters change so the result stays meaningful.
  useEffect(() => {
    setPage(1);
  }, [query, lowOnly]);

  // Debounce + refetch on query/filter/page changes.
  useEffect(() => {
    const t = setTimeout(() => load(query.trim(), page), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, lowOnly, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Sorting is server-side so pagination is consistent; we use the
  // list as-is here (kept as a memo for a future local override).
  const filtered = useMemo(() => products, [products]);

  // Toggle sort direction when the same column is clicked again.
  function toggleSort(col) {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }

  // Tiny caret indicator used in sortable column headers.
  function SortCaret({ col }) {
    if (sortBy !== col) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-slate-500 ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  // Trigger a CSV download via a hidden anchor so the Authorization header
  // from axios is used to fetch the file first.
  async function handleExport() {
    try {
      const res = await api.get('/products/export.csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Export failed');
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
          <h1 className="page-title">Products</h1>
          <p className="muted text-sm">Manage your inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="btn-secondary inline-flex items-center gap-1.5"
          >
            <IconDownload className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <Link to="/app/products/new" className="btn-primary inline-flex items-center gap-1.5">
            <IconPlus className="w-4 h-4" />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="relative max-w-sm w-full">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            type="text"
            placeholder="Search by name or SKU…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
          />
          Low stock only
        </label>
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
            <Link to="/app/products/new" className="text-brand-600 hover:underline">
              Add your first one
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="w-16 px-5 py-3"></th>
                <th
                  className="text-left px-5 py-3 cursor-pointer select-none hover:text-slate-900"
                  onClick={() => toggleSort('name')}
                >
                  Name<SortCaret col="name" />
                </th>
                <th
                  className="text-left px-5 py-3 cursor-pointer select-none hover:text-slate-900"
                  onClick={() => toggleSort('sku')}
                >
                  SKU<SortCaret col="sku" />
                </th>
                <th
                  className="text-right px-5 py-3 cursor-pointer select-none hover:text-slate-900"
                  onClick={() => toggleSort('qty')}
                >
                  Qty<SortCaret col="qty" />
                </th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="table-row hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="pl-5 pr-2 py-3">
                    <img
                      src={p.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(p.sku)}/80/60`}
                      alt=""
                      loading="lazy"
                      className="w-12 h-9 object-cover rounded border border-slate-200 dark:border-slate-700"
                      onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(p.sku)}/80/60`; }}
                    />
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                    <Link to={`/app/products/${p.id}`} className="hover:text-brand-600">
                      {p.name}
                    </Link>
                    {p.category && (
                      <span
                        className="chip ml-2"
                        style={{
                          backgroundColor: `${p.category.color}20`,
                          color: p.category.color,
                        }}
                      >
                        {p.category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 muted">{p.sku}</td>
                  <td className="px-5 py-3 text-right text-slate-900 dark:text-slate-100">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjust(p.id, -1)}
                        className="w-7 h-7 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center"
                        title="Decrease by 1"
                      >
                        <IconMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-medium">
                        {p.quantityOnHand}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjust(p.id, 1)}
                        className="w-7 h-7 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center"
                        title="Increase by 1"
                      >
                        <IconPlus className="w-3.5 h-3.5" />
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
                  <td className="px-5 py-3 text-right text-slate-700 dark:text-slate-200">
                    {p.sellingPrice != null ? `$${Number(p.sellingPrice).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/app/products/${p.id}`}
                        className="btn-secondary inline-flex items-center gap-1.5"
                      >
                        <IconPencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        className="btn-danger inline-flex items-center gap-1.5"
                        onClick={() => handleDelete(p.id)}
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            Page {page} of {totalPages} · {total} total
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary px-3 py-1 text-xs inline-flex items-center gap-1"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <IconChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              className="btn-secondary px-3 py-1 text-xs inline-flex items-center gap-1"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
