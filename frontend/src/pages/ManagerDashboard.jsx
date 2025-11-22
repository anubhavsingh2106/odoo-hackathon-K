import React, { useEffect, useState } from 'react';
import api from '../utils/axiosObs';
import { Check, X } from 'lucide-react';

const ManagerDashboard = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = () => api.get('/inventory/pending').then(res => setRequests(res.data));
  useEffect(() => { fetchRequests(); }, []);

  const handleAction = (id, action) => {
    api.put(`/inventory/approve/${id}`, { action }).then(() => fetchRequests());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Stock Approval Queue</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {requests.length === 0 ? <div className="p-6 text-center text-gray-500">No Pending Requests</div> : (
        <table className="w-full text-left">
          <thead className="bg-gray-100"><tr><th className="p-4">Staff</th><th className="p-4">Movement</th><th className="p-4">Qty</th><th className="p-4">Action</th></tr></thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-4">{r.user_name}</td>
                <td className="p-4">
                    <div className="font-bold">{r.product_name}</div>
                    <div className="text-xs text-gray-500">{r.type}: {r.from_loc || 'Vendor'} &rarr; {r.to_loc || 'Customer'}</div>
                </td>
                <td className="p-4 font-bold">{r.quantity}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleAction(r.id, 'approve')} className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"><Check size={14}/> Approve</button>
                  <button onClick={() => handleAction(r.id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"><X size={14}/> Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};
export default ManagerDashboard;