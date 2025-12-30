import React, { useState, useEffect } from 'react';
import { PaymentMethod, AuthSession } from '../types';
import { AdminLayout } from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const PaymentConfiguration: React.FC = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<AuthSession | null>(null);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/payment-methods`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment methods');
            }

            const data = await response.json();
            setMethods(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch payment methods');
        } finally {
            setLoading(false);
        }
    };

    const checkSession = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
                credentials: 'include',
            });
            const data = await response.json();
            setSession(data);

            if (!data.isAuthenticated || (data.user.role !== 'admin' && !data.user.can_manage_payments)) {
                window.location.href = '/admin';
            }
        } catch (err) {
            console.error('Error checking session:', err);
            window.location.href = '/admin';
        }
    };

    useEffect(() => {
        checkSession();
        fetchMethods();
    }, []);

    const handleToggle = async (name: string, isEnabled: boolean) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/payment-methods/${name}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ isEnabled }),
            });

            if (!response.ok) {
                throw new Error('Failed to update payment method');
            }

            setMethods(methods.map(m => m.name === name ? { ...m, is_enabled: isEnabled } : m));
        } catch (err: any) {
            alert(err.message || 'Failed to update payment method');
        }
    };

    if (loading && methods.length === 0) {
        return (
            <AdminLayout active="payments">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <i className="fas fa-circle-notch fa-spin text-4xl text-sienna-500 mb-4"></i>
                        <p className="text-gray-600">Loading configurations...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout active="payments">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Payment Configuration</h1>
                            <p className="text-gray-400 text-sm mt-0.5">
                                Enable or disable payment methods for customers
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="p-6 space-y-6">
                        <div className="grid gap-4">
                            {methods.map((method) => (
                                <div 
                                    key={method.name}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                        method.is_enabled 
                                            ? 'border-sienna-100 bg-sienna-50/30' 
                                            : 'border-gray-100 bg-gray-50/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            method.is_enabled ? 'bg-sienna-100 text-sienna-600' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                            <i className={`fas ${
                                                method.name === 'card' ? 'fa-credit-card' :
                                                method.name === 'blik' ? 'fa-mobile-alt' :
                                                method.name === 'transfer' ? 'fa-phone-alt' :
                                                'fa-money-bill-wave'
                                            } text-xl`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{method.display_name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {method.is_enabled ? 'Active' : 'Disabled'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleToggle(method.name, !method.is_enabled)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sienna-500 focus:ring-offset-2 ${
                                            method.is_enabled ? 'bg-sienna-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                method.is_enabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

