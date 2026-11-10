/**
 * Reports page: inventory valuation summary + top products + out-of-stock.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function money(n) {
  return n == null ? '—' : `$${Number(n).toFixed(2)}`;
}

function Stat({ label, value, hint, accent }) {
  return (
    <div className="card p-5">
      <div className="text-sm font-medium muted">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${accent || 'text-slate-900 dark:text-slate-100'}`}>
        {value}
      </div>
      {hint && <div className="text-xs muted mt-1">{hint}</div>}
    </div>
  );
}

// Lightweight inline bar chart — no external chart lib needed.
function Bars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.inventoryValue || 0));
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = Math.round(((r.inventoryValue || 0) / max) * 100);
        return (
          <div key={r.id} className="flex items-center gap-3">
            <div className="w-40 truncate text-sm text-slate-700 dark:text-slate-200">{r.name}</div>
            <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded">
              <div
                className="h-3 rounded bg-brand-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="w-24 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
              {money(r.inventoryValue)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/reports/inventory')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3">
        {error}
      </div>
    );
  }
  if (!data) return <div className="muted">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="muted text-sm">A quick read on the shape of your inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Inventory value (cost)" value={money(data.totalInventoryValue)} />
        <Stat label="Retail value" value={money(data.totalRetailValue)} />
        <Stat
          label="Potential margin"
          value={money(data.potentialMargin)}
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          label="Out of stock"
          value={data.outOfStockCount}
          accent={data.outOfStockCount ? 'text-red-600 dark:text-red-400' : undefined}
        />
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Top products by inventory value
        </h2>
        {data.topByValue.length === 0 ? (
          <div className="muted text-sm">Add some cost prices and quantities to populate this chart.</div>
        ) : (
          <Bars rows={data.topByValue} />
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Out of stock</h2>
          <Link to="/products" className="text-sm text-brand-600 hover:underline">
            Manage products →
          </Link>
        </div>
        {data.outOfStock.length === 0 ? (
          <div className="p-6 muted text-sm">Nothing out of stock. Nice.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">SKU</th>
                <th className="text-right px-5 py-3">Cost</th>
                <th className="text-right px-5 py-3">Selling</th>
              </tr>
            </thead>
            <tbody>
              {data.outOfStock.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="px-5 py-3 muted">{p.sku}</td>
                  <td className="px-5 py-3 text-right muted">{money(p.costPrice)}</td>
                  <td className="px-5 py-3 text-right muted">{money(p.sellingPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
