/**
 * Stock history page: latest inventory movements (adjustments + edits).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const REASON_STYLE = {
  create: 'chip-brand',
  adjust: 'chip-warn',
  edit: 'chip-neutral',
};

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Movements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports/movements?limit=100')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Stock history</h1>
        <p className="muted text-sm">Latest 100 movements across all products.</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 muted text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center muted text-sm">
            No movements yet. Adjust a product's stock to see it appear here.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="text-left px-5 py-3">When</th>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-left px-5 py-3">Reason</th>
                <th className="text-right px-5 py-3">Change</th>
                <th className="text-right px-5 py-3">Resulting qty</th>
                <th className="text-left px-5 py-3">By</th>
                <th className="text-left px-5 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className="table-row">
                  <td className="px-5 py-3 muted whitespace-nowrap" title={new Date(m.createdAt).toLocaleString()}>
                    {timeAgo(m.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">
                    {m.product ? (
                      <Link to={`/app/products/${m.product.id}`} className="hover:text-brand-600">
                        {m.product.name}
                      </Link>
                    ) : (
                      <span className="muted italic">deleted</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`chip ${REASON_STYLE[m.reason] || ''}`}>{m.reason}</span>
                  </td>
                  <td className={`px-5 py-3 text-right font-semibold ${m.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {m.delta > 0 ? '+' : ''}{m.delta}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-900 dark:text-slate-100">{m.resultingQty}</td>
                  <td className="px-5 py-3 muted">{m.user?.email || '—'}</td>
                  <td className="px-5 py-3 muted truncate max-w-[16rem]" title={m.note}>{m.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
