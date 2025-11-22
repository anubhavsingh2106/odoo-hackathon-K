import React, { useState } from 'react';
import api from '../utils/axiosObs';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      setStatus({ type: 'success', msg: 'Account created! Waiting for Admin approval.' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Sign Up</h2>
        {status.msg && <div className={`p-3 rounded mb-4 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status.msg}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" onChange={e => setForm({...form, name: e.target.value})} />
          <input type="email" placeholder="Email" required className="w-full p-2 border rounded" onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full p-2 border rounded" onChange={e => setForm({...form, password: e.target.value})} />
          
          <select className="w-full p-2 border rounded" onChange={e => setForm({...form, role: e.target.value})}>
            <option value="staff">Warehouse Staff</option>
            <option value="manager">Inventory Manager</option>
          </select>

          <button className="w-full bg-brand-600 text-white py-2 rounded font-bold hover:bg-brand-700">Register</button>
        </form>
        <Link to="/login" className="block text-center mt-4 text-brand-600">Back to Login</Link>
      </div>
    </div>
  );
};
export default Signup;