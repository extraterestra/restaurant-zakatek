
import React from 'react';
import { Category } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onCategorySelect: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onCategorySelect }) => {

  const handleNavClick = (category: string) => {
    onCategorySelect(category);
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-cream-200/95 backdrop-blur-md border-b border-sienna-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
            onClick={() => handleNavClick(Category.ALL)}
          >
            {/* Custom SVG Logo for SIVIK */}
            <div className="relative w-10 h-10 transform group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                {/* Bottom Brown Line */}
                <path d="M15 92 H85" stroke="#8B4513" strokeWidth="6" strokeLinecap="round" />

                {/* Left Dark Brown Stroke (Serif V Leg) */}
                <path d="M22 10 H42 L52 82 H44 L32 35 C30 20 28 15 22 10 Z" fill="#4A250A" />

                {/* Right Sienna Leaves (Double Leaf Shape) */}
                <path d="M51 82 Q58 50 55 10 Q68 25 72 38 Q82 28 92 28 Q78 55 51 82 Z" fill="#A0522D" />
              </svg>
            </div>

            <div className="flex flex-col -space-y-1">
              <span className="font-serif font-bold text-xl tracking-[0.1em] text-sienna-900 leading-none">
                Zakątek Smaków
              </span>
              <span className="text-[10px] text-sienna-600 font-script ml-0.5">
                Restauracja
              </span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            {Object.values(Category).map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className="text-sienna-700 hover:text-sienna-900 px-3 py-2 text-sm font-semibold transition-colors uppercase tracking-wide"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-sienna-600 hover:text-sienna-900 transition-colors"
          >
            <span className="sr-only">Otwórz koszyk</span>
            <i className="fas fa-shopping-bag text-2xl"></i>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-cream-50 transform translate-x-1/4 -translate-y-1/4 bg-rustic-600 rounded-full border-2 border-cream-200">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
