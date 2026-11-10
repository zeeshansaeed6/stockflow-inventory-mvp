import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// Small summary card used for the top metrics.
function StatCard({ label, value, hint }) {
  return (
    <div className="card p-5">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
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
    return <div className="text-red-600">{error}</div>;
  }
  if (!data) {
    return <div className="text-slate-500">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
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
        />
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Low stock items</h2>
          <Link to="/products" className="text-sm text-brand-600 hover:underline">
            View all products →
          </Link>
        </div>

        {data.lowStockItems.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No low-stock products. All good!
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">SKU</th>
                <th className="text-right px-5 py-3">Qty</th>
                <th className="text-right px-5 py-3">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockItems.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-900">
                    <Link
                      to={`/products/${item.id}`}
                      className="hover:text-brand-600"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{item.sku}</td>
                  <td className="px-5 py-3 text-right text-red-600 font-semibold">
                    {item.quantityOnHand}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">
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
