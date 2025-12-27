import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface IntegrationSettings {
  platform_name: string;
  platform_url: string;
  api_key: string;
  restaurant_external_id: string;
  restaurant_address: string;
  restaurant_phone: string;
  currency: string;
  last_sync_at: string | null;
}

export const Integration: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings>({
    platform_name: 'External Food Platform',
    platform_url: '',
    api_key: '',
    restaurant_external_id: '',
    restaurant_address: '',
    restaurant_phone: '',
    currency: 'PLN',
    last_sync_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/integration`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Check if we actually got a record from the database
        if (data && Object.keys(data).length > 0) {
          setSettings({
            platform_name: data.platform_name || 'External Food Platform',
            platform_url: data.platform_url || '',
            api_key: data.api_key || '',
            restaurant_external_id: data.restaurant_external_id || '',
            restaurant_address: data.restaurant_address || '',
            restaurant_phone: data.restaurant_phone || '',
            currency: data.currency || 'PLN',
            last_sync_at: data.last_sync_at || null,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/integration`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          platformUrl: settings.platform_url,
          apiKey: settings.api_key,
          restaurantExternalId: settings.restaurant_external_id,
          restaurantAddress: settings.restaurant_address,
          restaurantPhone: settings.restaurant_phone,
          currency: settings.currency,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        fetchSettings();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSync = async () => {
    if (!settings.platform_url || !settings.api_key) {
      setMessage({ type: 'error', text: 'Please configure URL and API Key first.' });
      return;
    }

    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/integration/sync`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchSettings();
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('pl-PL');
  };

  return (
    <AdminLayout active="integration">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-900 text-white">
            <h1 className="text-2xl font-bold">Integration</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Sync your menu with external food platforms via REST API
            </p>
          </div>

          <div className="p-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <i
                  className={`fas ${
                    message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'
                  }`}
                ></i>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Configuration Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Platform Settings</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      External API Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={settings.platform_url}
                      onChange={(e) => setSettings({ ...settings, platform_url: e.target.value })}
                      placeholder="http://localhost:3001/api/external-menu"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>
                        If testing locally with Docker, use <strong>http://host.docker.internal:3001/...</strong> instead of localhost.
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      x-api-key
                    </label>
                    <input
                      type="text"
                      value={settings.api_key}
                      onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                      placeholder="da079e38fcb44b6d86ad08ac3ee33a42"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Restaurant External ID
                      </label>
                      <input
                        type="text"
                        value={settings.restaurant_external_id}
                        onChange={(e) => setSettings({ ...settings, restaurant_external_id: e.target.value })}
                        placeholder="partner-123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="PLN">PLN</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Restaurant Phone
                    </label>
                    <input
                      type="text"
                      value={settings.restaurant_phone}
                      onChange={(e) => setSettings({ ...settings, restaurant_phone: e.target.value })}
                      placeholder="+33 30 1234562"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Restaurant Address
                    </label>
                    <textarea
                      value={settings.restaurant_address}
                      onChange={(e) => setSettings({ ...settings, restaurant_address: e.target.value })}
                      placeholder="1234 Main Street, Fez, Morroko"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 h-20"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm w-full"
                  >
                    Save Configuration
                  </button>
                </form>
              </div>

              {/* Status & Sync Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sync Status</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Last Successful Sync:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(settings.last_sync_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Platform:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {settings.platform_name}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Clicking the button below will export <strong>all</strong> dishes
                    to the external platform. Items will include their status (Enabled/Disabled).
                  </p>
                  
                  <button
                    onClick={handleSync}
                    disabled={syncing || !settings.platform_url}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                      syncing
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                    }`}
                  >
                    {syncing ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin"></i>
                        Exporting Menu...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync-alt"></i>
                        Sync Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation / Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <i className="fas fa-info-circle"></i>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1 text-sm uppercase">How the sync works</h3>
              <p className="text-sm text-blue-800 leading-relaxed mb-4">
                The system sends a <strong>POST</strong> request to the external platform. 
                The request includes your <code>x-api-key</code> in the headers and the full restaurant 
                profile + menu in the body.
              </p>
              <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto">
                <p className="text-emerald-400"># Request Headers</p>
                <p>x-api-key: {settings.api_key || 'your-key'}</p>
                <p>Content-Type: application/json</p>
                <p className="mt-2 text-emerald-400"># Body Structure</p>
                <pre>
{`{
  "restaurantExternalId": "${settings.restaurant_external_id || 'partner-123'}",
  "restaurantName": "SIVIK Restaurant",
  "restaurantAddress": "${settings.restaurant_address || '...'}",
  "restaurantPhone": "${settings.restaurant_phone || '...'}",
  "currency": "${settings.currency}",
  "items": [
    {
      "id": "item-1",
      "name": "...",
      "isEnabled": true,
      ...
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};


