import React, { useEffect, useState } from 'react';
import api from '../utils/axiosObs';
import { useAuth } from '../context/AuthContext';
import { Search, Package, AlertTriangle, RefreshCw, Plus, X } from 'lucide-react';

const Inventory = () => {
  const { user } = useAuth(); // Get User Role
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    sku: '', name: '', category_id: 1, unit: 'pcs', min_stock_level: 10
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', newProduct);
      setShowModal(false);
      fetchProducts(); // Refresh list
      setNewProduct({ sku: '', name: '', category_id: 1, unit: 'pcs', min_stock_level: 10 }); // Reset
    } catch (err) {
      alert('Failed to create product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-brand-600" /> Inventory List
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and view stock levels.</p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none w-64"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* ONLY MANAGER CAN SEE THIS BUTTON */}
          {user?.role === 'manager' && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm"
            >
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4">Product Info</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Unit</th>
              <th className="px-6 py-4 text-center">Min Level</th>
              <th className="px-6 py-4 text-right">Current Stock</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
            ) : filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{item.category_name || 'Gen'}</span></td>
                  <td className="px-6 py-4">{item.unit}</td>
                  <td className="px-6 py-4 text-center text-gray-400">{item.min_stock_level}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">{item.total_stock}</td>
                  <td className="px-6 py-4 text-center">
                    {item.total_stock <= item.min_stock_level ? (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold flex items-center justify-center gap-1"><AlertTriangle size={12}/> Low</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">OK</span>
                    )}
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: Add Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create New Product</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input type="text" required className="w-full border rounded p-2 mt-1" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU / Code</label>
                  <input type="text" required className="w-full border rounded p-2 mt-1" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category ID</label>
                    <input type="number" required className="w-full border rounded p-2 mt-1" value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input type="text" placeholder="kg/pcs" required className="w-full border rounded p-2 mt-1" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Min Stock</label>
                    <input type="number" required className="w-full border rounded p-2 mt-1" value={newProduct.min_stock_level} onChange={e => setNewProduct({...newProduct, min_stock_level: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;