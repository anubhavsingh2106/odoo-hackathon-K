import React, { useState, useEffect } from 'react';
import api from '../utils/axiosObs.js';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Operations = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    type: 'IN',
    productId: '',
    quantity: '',
    fromLocation: '',
    toLocation: '',
    reference: ''
  });

  // Fetch products on load to populate dropdown
  useEffect(() => {
    api.get('/products')
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post('/inventory/move', form);
      setMessage({ type: 'success', text: 'Operation completed successfully!' });
      setForm({ ...form, quantity: '', reference: '' }); // Reset some fields
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Operation failed' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Stock Operations</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {['IN', 'OUT', 'TRANSFER'].map(op => (
            <button
              key={op}
              onClick={() => setForm({ ...form, type: op })}
              className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${
                form.type === op 
                ? 'bg-white text-brand-600 border-t-2 border-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {op === 'IN' ? 'RECEIVE (IN)' : op === 'OUT' ? 'DELIVER (OUT)' : 'INTERNAL TRANSFER'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Product</label>
              <select 
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                onChange={e => setForm({...form, productId: e.target.value})}
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name} (Current: {p.total_stock})</option>
                ))}
              </select>
            </div>

            {/* Dynamic Locations */}
            {(form.type === 'OUT' || form.type === 'TRANSFER') && (
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Source Location ID</label>
                 <input 
                    type="number" placeholder="e.g. 1 (Main Warehouse)" required 
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    onChange={e => setForm({...form, fromLocation: e.target.value})}
                 />
              </div>
            )}

            {(form.type === 'IN' || form.type === 'TRANSFER') && (
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Destination Location ID</label>
                 <input 
                    type="number" placeholder="e.g. 2 (Production)" required 
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    onChange={e => setForm({...form, toLocation: e.target.value})}
                 />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
              <input 
                type="number" required min="1"
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={form.quantity}
                onChange={e => setForm({...form, quantity: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Reference Doc</label>
              <input 
                type="text" placeholder="PO-123 / SO-456" required
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={form.reference}
                onChange={e => setForm({...form, reference: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
              Execute Operation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Operations;