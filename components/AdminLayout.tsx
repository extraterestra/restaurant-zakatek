import React, { useState, useEffect } from 'react';
import { AuthSession } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface AdminLayoutProps {
  active: 'orders' | 'users' | 'food' | 'integration' | 'payments';
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ active, children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
          credentials: 'include',
        });
        const data = await response.json();
        setSession(data);
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };
    checkSession();
  }, []);

  const navItemClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-emerald-600 text-white'
        : 'text-gray-200 hover:bg-gray-800 hover:text-white'
    }`;

  const user = session?.user;
  const canManageUsers = user?.role === 'admin' || user?.can_manage_users || (user as any)?.canManageUsers;
  const canManageIntegrations = user?.role === 'admin' || user?.can_manage_integrations || (user as any)?.canManageIntegrations;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center">
              <i className="fas fa-utensils text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide uppercase text-gray-300">
                SIVIK Restaurant
              </div>
              <div className="text-xs text-gray-500">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <a href="/admin" className={navItemClasses(active === 'orders')}>
            <i className="fas fa-receipt w-4"></i>
            <span>Orders</span>
          </a>
          {canManageUsers && (
            <a
              href="/admin/users"
              className={navItemClasses(active === 'users')}
            >
              <i className="fas fa-users w-4"></i>
              <span>User Management</span>
            </a>
          )}
          <a
            href="/admin/food"
            className={navItemClasses(active === 'food')}
          >
            <i className="fas fa-hamburger w-4"></i>
            <span>Food Configuration</span>
          </a>
          {canManageIntegrations && (
            <a
              href="/admin/integration"
              className={navItemClasses(active === 'integration')}
            >
              <i className="fas fa-network-wired w-4"></i>
              <span>Integration</span>
            </a>
          )}
          <a
            href="/admin/payments"
            className={navItemClasses(active === 'payments')}
          >
            <i className="fas fa-credit-card w-4"></i>
            <span>Payment Configuration</span>
          </a>
        </nav>

        <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} SIVIK</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};


