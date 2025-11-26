
import React, { useState, useEffect } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearCart: () => void;
  total: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onClearCart, total }) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate tomorrow's date for min attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    // Simulate API call
    setTimeout(() => {
        onClearCart();
        setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        {isSuccess ? (
             <div className="p-10 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
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
                    <span className="text-sm font-medium text-emerald-600">{(total || 0).toFixed(2)} zł</span>
                </div>

                <form onSubmit={handlePay} className="p-8 space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imię i Nazwisko</label>
                                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Jan Kowalski" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adres Dostawy</label>
                                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="ul. Smaczna 12/3" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data (od jutra)</label>
                                    <input 
                                        required 
                                        type="date" 
                                        min={minDate}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Godzina</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none">
                                        <option>12:00</option>
                                        <option>13:00</option>
                                        <option>14:00</option>
                                        <option>15:00</option>
                                        <option>16:00</option>
                                        <option>17:00</option>
                                        <option>18:00</option>
                                        <option>19:00</option>
                                        <option>20:00</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Płatność</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none">
                                    <option>Karta</option>
                                    <option>Gotówka przy odbiorze</option>
                                    <option>BLIK</option>
                                </select>
                            </div>
                        </div>
                    )}
                    
                    {step === 2 && (
                         <div className="flex flex-col items-center justify-center py-10">
                            <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500 mb-4"></i>
                            <p className="text-gray-500">Przetwarzanie zamówienia...</p>
                         </div>
                    )}

                    {step === 1 && (
                        <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
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
