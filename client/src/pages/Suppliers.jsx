/**
 * Suppliers page: list + add + edit + delete.
 */

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY = { name: '', contactName: '', email: '', phone: '', notes: '' };

export default function Suppliers() {
  const { show } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers');
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editId) {
        const { data } = await api.put(`/suppliers/${editId}`, form);
        setItems((prev) => prev.map((s) => (s.id === editId ? data : s)));
        setEditId(null);
        show({ type: 'success', message: 'Supplier updated' });
      } else {
        const { data } = await api.post('/suppliers', form);
        setItems((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        show({ type: 'success', message: `Added “${data.name}”` });
      }
      setForm(EMPTY);
    } catch (err) {
      show({ type: 'error', message: err.response?.data?.message || 'Save failed' });
    }
  }

  function startEdit(s) {
    setEditId(s.id);
    setForm({
      name: s.name || '',
      contactName: s.contactName || '',
      email: s.email || '',
      phone: s.phone || '',
      notes: s.notes || '',
    });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this supplier? Products linked to it will be unassigned.')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      setItems((prev) => prev.filter((s) => s.id !== id));
      show({ type: 'success', message: 'Deleted' });
    } catch (err) {
      show({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Suppliers</h1>
        <p className="muted text-sm">Vendors and the contact info that goes with them.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Supplier name *</label><input className="input" value={form.name} onChange={update('name')} required /></div>
          <div><label className="label">Contact person</label><input className="input" value={form.contactName} onChange={update('contactName')} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={update('email')} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={update('phone')} /></div>
        </div>
        <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={update('notes')} /></div>
        <div className="flex items-center gap-2">
          <button type="submit" className="btn-primary">{editId ? 'Save changes' : 'Add supplier'}</button>
          {editId && (
            <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 muted text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center muted text-sm">No suppliers yet.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Contact</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Phone</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="table-row">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                  <td className="px-5 py-3 muted">{s.contactName || '—'}</td>
                  <td className="px-5 py-3 muted">{s.email || '—'}</td>
                  <td className="px-5 py-3 muted">{s.phone || '—'}</td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button className="btn-secondary" onClick={() => startEdit(s)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
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
