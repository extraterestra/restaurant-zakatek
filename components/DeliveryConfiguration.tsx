import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AuthSession } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface DeliverySettings {
  is_enabled: boolean;
  min_order_amount: number;
  delivery_fee: number;
}

export const DeliveryConfiguration: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
          credentials: 'include',
        });
        const data = await response.json();
        setSession(data);

        const canManageDelivery = data?.user?.role === 'admin' || data?.user?.can_manage_delivery || (data?.user as any)?.canManageDelivery;

        if (!data.isAuthenticated || !canManageDelivery) {
          window.location.href = '/admin';
        }
      } catch (err) {
        console.error('Error checking session:', err);
        window.location.href = '/admin';
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delivery-settings`, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('Failed to fetch delivery settings');
      }
      const data = await res.json();
      setSettings({
        is_enabled: !!data.is_enabled,
        min_order_amount: Number(data.min_order_amount) || 0,
        delivery_fee: Number(data.delivery_fee) || 0,
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to fetch delivery settings' });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delivery-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isEnabled: settings.is_enabled,
          minOrderAmount: settings.min_order_amount,
          deliveryFee: settings.delivery_fee,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save delivery settings');
      }

      const data = await res.json();
      setSettings({
        is_enabled: !!data.is_enabled,
        min_order_amount: Number(data.min_order_amount) || 0,
        delivery_fee: Number(data.delivery_fee) || 0,
      });
      setMessage({ type: 'success', text: 'Delivery settings saved' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save delivery settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout active="delivery">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-sienna-500 mb-4"></i>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="delivery">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-900 text-white">
            <h1 className="text-2xl font-bold">Delivery Configuration</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Configure delivery fee rules for the cart and checkout.
            </p>
          </div>
          <div className="p-6 space-y-4">
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Enable delivery fee</p>
                  <p className="text-xs text-gray-500">When enabled, delivery fee applies if minimum order is met.</p>
                </div>
                <button
                  onClick={() => setSettings(prev => prev ? ({ ...prev, is_enabled: !prev.is_enabled }) : prev)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    settings?.is_enabled ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings?.is_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Minimum order amount (zł)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings?.min_order_amount ?? 0}
                    onChange={(e) => setSettings(prev => prev ? ({ ...prev, min_order_amount: parseFloat(e.target.value) || 0 }) : prev)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    disabled={!settings?.is_enabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Delivery fee (zł)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings?.delivery_fee ?? 0}
                    onChange={(e) => setSettings(prev => prev ? ({ ...prev, delivery_fee: parseFloat(e.target.value) || 0 }) : prev)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    disabled={!settings?.is_enabled}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || !settings}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

