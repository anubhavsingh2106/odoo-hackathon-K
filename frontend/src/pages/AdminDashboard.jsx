import React, { useEffect, useState } from 'react';
import api from '../utils/axiosObs';
import { Check, X } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => api.get('/admin/users').then(res => setUsers(res.data));
  useEffect(() => { fetchUsers(); }, []);

  const handleAction = (id, status) => {
    api.put(`/admin/users/${id}`, { status }).then(() => fetchUsers());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Console</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="p-4">{u.name}<br/><span className="text-xs text-gray-500">{u.email}</span></td>
                <td className="p-4 uppercase text-xs font-bold">{u.role}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{u.status}</span></td>
                <td className="p-4">
                  {u.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(u.id, 'approved')} className="bg-green-500 text-white p-1 rounded"><Check size={16}/></button>
                      <button onClick={() => handleAction(u.id, 'rejected')} className="bg-red-500 text-white p-1 rounded"><X size={16}/></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminDashboard;