import React, { useEffect, useState } from 'react';
import { Category } from '../types';
import { AdminLayout } from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  image_url: string;
  calories: number | null;
  category: string;
  price: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MenuItemForm {
  name: string;
  description: string;
  imageUrl: string;
  calories: string;
  category: Category;
  price: string;
  isEnabled: boolean;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: Category.SUSHI, label: 'Sushi' },
  { value: Category.BURGERS, label: 'Burgery' },
  { value: Category.SALADS, label: 'Sałatki' },
  { value: Category.SHAWARMA, label: 'Shoarma' },
];

export const FoodConfiguration: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: 'category' | 'calories' | 'price';
    direction: 'asc' | 'desc';
  }>({ key: 'category', direction: 'asc' });
  const [form, setForm] = useState<MenuItemForm>({
    name: '',
    description: '',
    imageUrl: '',
    calories: '',
    category: Category.SUSHI,
    price: '',
    isEnabled: true,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/menu-items`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await res.json();
      console.log('Fetched admin menu items:', data);
      
      // Apply default sorting by category
      const sortedData = [...data].sort((a, b) => 
        a.category.localeCompare(b.category)
      );
      
      setItems(sortedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError(err.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: 'category' | 'calories' | 'price') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedItems = [...items].sort((a, b) => {
      const valA = a[key] ?? 0;
      const valB = b[key] ?? 0;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return direction === 'asc' 
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    });

    setItems(sortedItems);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <i className="fas fa-sort ml-1 text-gray-300"></i>;
    return sortConfig.direction === 'asc' 
      ? <i className="fas fa-sort-up ml-1 text-emerald-600"></i>
      : <i className="fas fa-sort-down ml-1 text-emerald-600"></i>;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: '',
      description: '',
      imageUrl: '',
      calories: '',
      category: Category.SUSHI,
      price: '',
      isEnabled: true,
    });
    setShowModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      imageUrl: item.image_url,
      calories: item.calories != null ? String(item.calories) : '',
      category: item.category as Category,
      price: item.price != null ? item.price.toString() : '',
      isEnabled: item.is_enabled,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      calories: form.calories ? Number(form.calories) : null,
      category: form.category,
      price: Number(form.price),
      isEnabled: form.isEnabled,
    };

    try {
      const url = editingItem
        ? `${API_BASE_URL}/api/admin/menu-items/${editingItem.id}`
        : `${API_BASE_URL}/api/admin/menu-items`;
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save menu item');
      }

      setShowModal(false);
      await fetchItems();
    } catch (err: any) {
      alert(err.message || 'Failed to save menu item');
    }
  };

  const toggleEnabled = async (item: MenuItem) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/menu-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isEnabled: !item.is_enabled }),
      });
      if (!res.ok) {
        throw new Error('Failed to update item status');
      }
      await fetchItems();
    } catch (err: any) {
      alert(err.message || 'Failed to update item status');
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete dish "${item.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/menu-items/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete menu item');
      }
      await fetchItems();
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu item');
    }
  };

  return (
    <AdminLayout active="food">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Food Configuration</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Manage dishes served in the restaurant
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Dish
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-16 text-gray-500">
                <i className="fas fa-circle-notch fa-spin text-4xl mb-3 text-emerald-500"></i>
                <p className="text-lg font-semibold">Loading dishes...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <i className="fas fa-hamburger text-5xl mb-3 text-gray-200"></i>
                <p className="text-lg font-semibold">No dishes configured</p>
                <p className="text-sm mt-1">
                  Use &quot;Add Dish&quot; to create your first menu item.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        {getSortIcon('category')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('calories')}
                    >
                      <div className="flex items-center">
                        Kcal
                        {getSortIcon('calories')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Price
                        {getSortIcon('price')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(items) && items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {item.calories ?? '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600">
                        {Number(item.price).toFixed(2)} zł
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.is_enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.is_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleEnabled(item)}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                          >
                            {item.is_enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-xs font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Edit Dish' : 'Add New Dish'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Picture URL
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Kcal
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.calories}
                    onChange={(e) =>
                      setForm({ ...form, calories: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as Category,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Price (zł)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) =>
                      setForm({ ...form, isEnabled: e.target.checked })
                    }
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Dish is enabled (visible in menu)</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};


