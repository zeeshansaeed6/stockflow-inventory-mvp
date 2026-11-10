import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// Small summary card used for the top metrics.
function StatCard({ label, value, hint, accent }) {
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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
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
  if (!data) {
    // Simple shimmering skeleton — matches final layout to avoid jumpy UI.
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-5 h-24" />
          ))}
        </div>
        <div className="card h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="muted text-sm">
          Overview of your inventory at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total products" value={data.totalProducts} />
        <StatCard label="Units on hand" value={data.totalUnits} />
        <StatCard
          label="Low stock items"
          value={data.lowStockCount}
          hint={`Default threshold: ${data.defaultLowStockThreshold}`}
          accent={data.lowStockCount ? 'text-amber-600 dark:text-amber-400' : undefined}
        />
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Low stock items</h2>
          <Link to="/products" className="text-sm text-brand-600 hover:underline">
            View all products →
          </Link>
        </div>

        {data.lowStockItems.length === 0 ? (
          <div className="p-6 text-sm muted">
            No low-stock products. All good!
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">SKU</th>
                <th className="text-right px-5 py-3">Qty</th>
                <th className="text-right px-5 py-3">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockItems.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">
                    <Link
                      to={`/products/${item.id}`}
                      className="hover:text-brand-600"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 muted">{item.sku}</td>
                  <td className="px-5 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                    {item.quantityOnHand}
                  </td>
                  <td className="px-5 py-3 text-right muted">
                    {item.lowStockThreshold}
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
