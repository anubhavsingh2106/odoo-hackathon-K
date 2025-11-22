import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, Package, Truck } from 'lucide-react';
import axios from 'axios';

const KPICard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStock: 0, lowStockAlerts: 0 });

  useEffect(() => {
    // Fetch from backend
    // axios.get('http://localhost:5000/api/inventory/kpi').then(res => setStats(res.data));
    // Mocking for display
    setStats({ totalStock: 1250, lowStockAlerts: 5 });
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview</h1>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Products" value={stats.totalStock} icon={<Package />} color="bg-blue-500" />
        <KPICard title="Low Stock Alerts" value={stats.lowStockAlerts} icon={<AlertTriangle />} color="bg-red-500" />
        <KPICard title="Pending Receipts" value="12" icon={<Truck />} color="bg-emerald-500" />
        <KPICard title="Pending Deliveries" value="8" icon={<TrendingUp />} color="bg-orange-500" />
      </div>

      {/* Recent Activity Table Mockup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Recent Movements</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-6 py-3">#PO-2023-001</td>
              <td className="px-6 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Receipt</span></td>
              <td className="px-6 py-3">Completed</td>
            </tr>
            {/* More rows... */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;