
import React, { useState, useRef, useEffect } from 'react';
import { getChefRecommendation } from '../services/geminiService';
import { AiMessage, Product, Category } from '../types';
import { ProductCard } from './ProductCard';

interface AIChefProps {
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  menuItems?: Product[];
}

export const AIChef: React.FC<AIChefProps> = ({ onAddToCart, onViewDetails, menuItems = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiMessage[]>([
    { role: 'model', text: 'Cześć! Jestem Twoim inteligentnym kelnerem. 🥗 Masz ochotę na coś ostrego czy niskokalorycznego? Zapytaj mnie!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const responseText = await getChefRecommendation(userText);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  // Helper to find product by ID text like "[PRODUCT:s1]"
  const findProductInText = (text: string): Product | undefined => {
    const match = text.match(/\[PRODUCT:([a-zA-Z0-9]+)\]/);
    if (match && match[1]) {
      return menuItems.find(p => p.id === match[1]);
    }
    return undefined;
  };

  const renderMessageContent = (text: string) => {
    const product = findProductInText(text);
    // Remove the product tag from display text
    const displayText = text.replace(/\[PRODUCT:[a-zA-Z0-9]+\]/g, '');

    // Define categories that should show the card
    const SHOW_CARD_CATEGORIES = [
      Category.CHEBUREKI,
      Category.CHINKALI,
      Category.DUMPLINGS,
      Category.DRINKS,
      Category.SOUPS,
      Category.MAIN_DISHES
    ];

    return (
      <div className="flex flex-col gap-3">
        <span>{displayText}</span>
        {product && onAddToCart && onViewDetails && SHOW_CARD_CATEGORIES.includes(product.category) && (
          <div className="mt-2 w-full max-w-[200px] shadow-lg rounded-2xl overflow-hidden self-center bg-gray-50 border border-gray-100">
            <div
              onClick={() => {
                if (product.isEnabled !== false) {
                  onAddToCart(product);
                }
              }}
              className={`h-24 w-full relative group ${product.isEnabled === false ? 'cursor-not-allowed opacity-75 grayscale' : 'cursor-pointer'}`}
            >
              {product.isEnabled === false && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10">
                  <span className="bg-gray-800/90 text-white text-[10px] px-2 py-1 rounded">Niedostępne</span>
                </div>
              )}
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-3">
              <div className="text-xs font-bold text-gray-800 mb-1 truncate">{product.name}</div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-600 font-bold text-xs">{product.price} zł</span>
                <span className="text-[10px] text-gray-500">{product.calories} kcal</span>
              </div>
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.isEnabled === false}
                className={`w-full text-xs py-1.5 rounded-lg transition-colors ${product.isEnabled === false
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
              >
                Do koszyka
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[500px] transition-all duration-300 transform origin-bottom-right animate-fade-in-up">
          <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <i className="fas fa-robot"></i> Inteligentny Kelner
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-emerald-100">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}>
                  {msg.role === 'model' ? renderMessageContent(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 px-4 py-2 rounded-2xl rounded-bl-none text-xs flex gap-1 items-center border border-gray-200 shadow-sm">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Zaproponuj coś lekkiego..."
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-gray-800' : 'bg-emerald-600'} text-white p-4 rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center`}
      >
        {isOpen ? <i className="fas fa-times text-xl"></i> : <i className="fas fa-sparkles text-xl"></i>}
      </button>
    </div>
  );
};
