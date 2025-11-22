import React, { useEffect, useState } from 'react';
import api from '../utils/axiosObs';
import { FileText, ArrowDownLeft, ArrowUpRight, RefreshCw, ArrowRight } from 'lucide-react';

const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventory/history');
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'IN': return 'bg-green-100 text-green-700';
      case 'OUT': return 'bg-orange-100 text-orange-700';
      case 'TRANSFER': return 'bg-blue-100 text-blue-700';
      case 'ADJUSTMENT': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-brand-600" /> Stock Ledger
        </h1>
        <button 
          onClick={fetchHistory} 
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Movement</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8">Loading ledger...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleDateString()} 
                  <span className="text-xs text-gray-400 block">{new Date(log.created_at).toLocaleTimeString()}</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.reference_doc}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{log.product_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeStyle(log.type)}`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs">
                     {log.type === 'IN' && <span>Vendor <ArrowRight size={12} className="inline"/> {log.to_loc}</span>}
                     {log.type === 'OUT' && <span>{log.from_loc} <ArrowRight size={12} className="inline"/> Customer</span>}
                     {log.type === 'TRANSFER' && <span>{log.from_loc} <ArrowRight size={12} className="inline"/> {log.to_loc}</span>}
                     {log.type === 'ADJUSTMENT' && <span>Stock Update ({log.from_loc})</span>}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold">
                  {log.type === 'OUT' ? '-' : '+'}{Math.abs(log.quantity)}
                </td>
                <td className="px-6 py-4 text-gray-500">{log.user_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;