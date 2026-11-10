/**
 * Organization settings page.
 * MVP: default low-stock threshold + rename organization.
 */

import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Settings() {
  const [form, setForm] = useState({
    organizationName: '',
    defaultLowStockThreshold: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setForm(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const { data } = await api.put('/settings', {
        organizationName: form.organizationName.trim(),
        defaultLowStockThreshold: Number(form.defaultLowStockThreshold) || 0,
      });
      setForm(data);
      setMessage('Settings saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-500">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Organization-wide defaults for your inventory.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Organization name</label>
          <input
            className="input"
            value={form.organizationName}
            onChange={update('organizationName')}
            required
          />
        </div>
        <div className="max-w-xs">
          <label className="label">Default low-stock threshold</label>
          <input
            type="number"
            min="0"
            className="input"
            value={form.defaultLowStockThreshold}
            onChange={update('defaultLowStockThreshold')}
          />
          <p className="text-xs text-slate-500 mt-1">
            Used when a product does not define its own threshold.
          </p>
        </div>
        <div className="pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
