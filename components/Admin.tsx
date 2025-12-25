import React, { useState, useEffect } from 'react';
import { AuthSession } from '../types';
import { AdminLayout } from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customer_name: string;
  address: string;
  phone: string | null;
  delivery_date: string;
  delivery_time: string;
  payment_method: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

export const Admin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  const checkSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
        credentials: 'include',
      });
      const data = await response.json();
      setSession(data);

      if (!data.isAuthenticated) {
        window.location.href = '/admin';
      }
    } catch (err) {
      console.error('Error checking session:', err);
      window.location.href = '/admin';
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/admin';
          return;
        }
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Nie udało się pobrać zamówień. Upewnij się, że serwer działa na porcie 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/admin';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('You do not have permission to update orders');
          return;
        }
        throw new Error('Failed to update order status');
      }

      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Nie udało się zaktualizować statusu zamówienia');
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Zamówione', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'preparing', label: 'W przygotowaniu', color: 'bg-blue-100 text-blue-800' },
    { value: 'ready', label: 'Gotowe', color: 'bg-purple-100 text-purple-800' },
    { value: 'in_delivery', label: 'W dostawie', color: 'bg-orange-100 text-orange-800' },
    { value: 'delivered', label: 'Dostarczone', color: 'bg-green-100 text-green-800' },
    { value: 'paid', label: 'Opłacone', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'cancelled', label: 'Anulowane', color: 'bg-red-100 text-red-800' },
  ];

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <AdminLayout active="orders">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500 mb-4"></i>
            <p className="text-gray-600">Ładowanie zamówień...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const formatItems = (items: OrderItem[]) => {
    if (!Array.isArray(items)) return 'Brak danych';
    return items.map(item => `${item.quantity}x ${item.name}`).join(', ');
  };

  const formatPriceBreakdown = (items: OrderItem[]) => {
    if (!Array.isArray(items)) return <span className="text-gray-400">Brak danych</span>;
    return (
      <div className="space-y-1">
        {items.map((item, idx) => {
          const itemTotal = (item.price * item.quantity).toFixed(2);
          return (
            <div key={idx} className="text-xs text-gray-700">
              <span className="font-medium">{item.quantity}x</span> × <span>{item.price.toFixed(2)} zł</span> = <span className="font-semibold text-emerald-600">{itemTotal} zł</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AdminLayout active="orders">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel Administracyjny</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Zarządzanie zamówieniami
                {session?.user && (
                  <span className="ml-2">
                    • Logged in as <span className="font-semibold">{session.user.username}</span> ({session.user.role})
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchOrders}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Odśwież
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <i className="fas fa-inbox text-5xl mb-3 text-gray-200"></i>
                <p className="text-lg font-semibold">Brak zamówień</p>
                <p className="text-sm mt-1">Nowe zamówienia pojawią się tutaj automatycznie</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Klient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Produkty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ceny</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Adres</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dostawa</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Płatność</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kwota</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Akcje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                        <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                        {order.phone && (
                          <div className="text-xs text-gray-500">{order.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {formatItems(order.items)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-md">
                          {formatPriceBreakdown(order.items)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs">{order.address}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.delivery_date).toLocaleDateString('pl-PL')}
                        </div>
                        <div className="text-xs text-gray-500">{order.delivery_time}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.payment_method}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-bold text-emerald-600">
                          {parseFloat(order.total.toString()).toFixed(2)} zł
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={session?.user?.role === 'read_only'}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 outline-none transition-colors ${getStatusColor(order.status)} ${session?.user?.role === 'read_only'
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer focus:ring-2 focus:ring-emerald-500'
                            }`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

