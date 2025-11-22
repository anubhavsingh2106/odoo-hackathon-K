import React from 'react';
import { LayoutDashboard, Package, ArrowRightLeft, History, LogOut, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth(); // User data yaha se milega

  const menu = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
    { name: 'Operations', path: '/operations', icon: <ArrowRightLeft size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-xl z-50">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wide text-white">StockMaster</h1>
        <p className="text-xs text-slate-400 mt-1">Inventory System v1.0</p>
      </div>

      {/* User Info Card (New) */}
      <div className="px-4 pt-6 pb-2">
        <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3 border border-slate-700">
            <div className="bg-brand-600 h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                ? 'bg-brand-600 text-white shadow-lg translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="ml-3 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout} 
          className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="ml-3 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;