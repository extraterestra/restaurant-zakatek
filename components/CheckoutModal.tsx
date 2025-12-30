
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearCart: () => void;
  total: number;
  items: CartItem[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onClearCart, total, items }) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    deliveryDate: '',
    deliveryTime: '10:00',
    paymentMethod: 'Karta'
  });

  // Calculate date constraints
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSuccess(false);
      setError(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        deliveryDate: '',
        deliveryTime: '10:00',
        paymentMethod: 'Karta'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);

    setError(null);

    // Validate delivery time
    const [hours, minutes] = formData.deliveryTime.split(':').map(Number);
    const timeValue = hours * 60 + minutes;
    const minTime = 10 * 60; // 10:00
    const maxTime = 17 * 60; // 17:00

    if (timeValue < minTime || timeValue > maxTime) {
      setError('Restauracja czynna w godzinach 10:00 - 17:00. Proszę wybrać inną godzinę.');
      setStep(1);
      return;
    }

    try {
      const orderData = {
        customerName: formData.name,
        address: formData.address,
        phone: formData.phone || null,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: total
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      onClearCart();
      setIsSuccess(true);
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Nie udało się złożyć zamówienia. Spróbuj ponownie.');
      setStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        {isSuccess ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-sienna-100 text-sienna-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              <i className="fas fa-check"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Zamówienie przyjęte!</h2>
            <p className="text-gray-500 mb-8">Twoje zamówienie zostało zaplanowane. Dziękujemy!</p>
            <button
              onClick={onClose}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
            >
              Wróć do Menu
            </button>
          </div>
        ) : (
          <>
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Kasa</h2>
              <span className="text-sm font-medium text-sienna-600">{(total || 0).toFixed(2)} zł</span>
            </div>

            <form onSubmit={handlePay} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imię i Nazwisko</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sienna-500 outline-none"
                      placeholder="Jan Kowalski"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres Dostawy</label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sienna-500 outline-none"
                      placeholder="ul. Smaczna 12/3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (opcjonalnie)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sienna-500 outline-none"
                      placeholder="+48 123 456 789"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data dostawy</label>
                      <input
                        required
                        type="date"
                        min={minDate}
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Godzina</label>
                      <input
                        type="time"
                        required
                        value={formData.deliveryTime}
                        min="10:00"
                        max="17:00"
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      now.setHours(now.getHours() + 1);
                      const dateStr = now.toISOString().split('T')[0];
                      // Format HH:MM
                      const hours = String(now.getHours()).padStart(2, '0');
                      const minutes = String(now.getMinutes()).padStart(2, '0');
                      const timeStr = `${hours}:${minutes}`;
                      setFormData(prev => ({ ...prev, deliveryDate: dateStr, deliveryTime: timeStr }));
                    }}
                    className="w-full bg-sienna-100 text-sienna-700 py-2 rounded-lg text-sm font-semibold hover:bg-sienna-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-clock"></i>
                    Dostarcz za godzinę (+1h)
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Płatność</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none"
                    >
                      <option>Karta</option>
                      <option>Gotówka przy odbiorze</option>
                      <option>BLIK</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center justify-center py-10">
                  <i className="fas fa-circle-notch fa-spin text-4xl text-sienna-600 mb-4"></i>
                  <p className="text-gray-500">Przetwarzanie zamówienia...</p>
                </div>
              )}

              {step === 1 && (
                <button type="submit" className="w-full bg-sienna-600 text-white py-4 rounded-xl font-bold hover:bg-sienna-700 transition-colors shadow-lg shadow-sienna-900/20">
                  Zatwierdź Zamówienie
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};
