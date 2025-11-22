import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const Layout = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
             {/* Breadcrumbs or Page Title could go here */}
             <h2 className="text-gray-400 text-sm uppercase tracking-wider">Management Console</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-sm font-bold text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <Outlet /> {/* This is where the pages render */}
      </div>
    </div>
  );
};

export default Layout;