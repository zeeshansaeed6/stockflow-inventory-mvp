/**
 * Categories page: list + inline add + edit + delete.
 */

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext.jsx';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Categories() {
  const { show } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const { data } = await api.post('/categories', { name, color });
      setItems((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      show({ type: 'success', message: `Added “${data.name}”` });
    } catch (err) {
      show({ type: 'error', message: err.response?.data?.message || 'Create failed' });
    }
  }

  async function handleSave(id) {
    try {
      const { data } = await api.put(`/categories/${id}`, { name: editName });
      setItems((prev) => prev.map((c) => (c.id === id ? data : c)));
      setEditId(null);
      show({ type: 'success', message: 'Saved' });
    } catch (err) {
      show({ type: 'error', message: err.response?.data?.message || 'Save failed' });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Products in it will become uncategorised.')) return;
    try {
      await api.delete(`/categories/${id}`);
      setItems((prev) => prev.filter((c) => c.id !== id));
      show({ type: 'success', message: 'Deleted' });
    } catch (err) {
      show({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Categories</h1>
        <p className="muted text-sm">Group products to filter faster and report smarter.</p>
      </div>

      <form onSubmit={handleCreate} className="card p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[12rem]">
          <label className="label">New category name</label>
          <input
            className="input"
            placeholder="e.g. Accessories"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${
                  color === c ? 'border-slate-900 dark:border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary">Add</button>
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 muted text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center muted text-sm">No categories yet.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="text-left px-5 py-3">Color</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="px-5 py-3">
                    <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: c.color }} />
                  </td>
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">
                    {editId === c.id ? (
                      <input
                        className="input max-w-xs"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    {editId === c.id ? (
                      <>
                        <button className="btn-primary" onClick={() => handleSave(c.id)}>Save</button>
                        <button className="btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn-secondary" onClick={() => { setEditId(c.id); setEditName(c.name); }}>Edit</button>
                        <button className="btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
