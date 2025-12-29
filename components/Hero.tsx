
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-amber-900 via-orange-900 to-sienna-800 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/Users/sivik/.gemini/antigravity/brain/d2e41855-7c65-4ea9-9e19-109ae2ae7e27/traditional_kitchen_hero.png"
          alt="Tradycyjna kuchnia"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sienna-900 via-amber-900/80 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-cream-100 mb-6">
          <span className="block">Witamy w</span>
          <span className="block text-cream-200 drop-shadow-lg">Zakątek Smaków.</span>
        </h1>
        <p className="mt-4 text-xl text-cream-200 max-w-lg mb-8 leading-relaxed font-sans">
          Odkryj autentyczne smaki tradycji. Domowe zupy, sycące dania główne i nasze popisowe czeburaki, przygotowane według sprawdzonych, domowych receptur.
        </p>
        <div className="flex gap-4">
          <button
            className="bg-sienna-600 hover:bg-sienna-700 text-cream-50 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-sienna-900/50 border-2 border-sienna-500"
            onClick={() => {
              const menu = document.getElementById('menu-section');
              menu?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Zamów Teraz
          </button>
          <button
            className="bg-cream-100/10 hover:bg-cream-100/20 backdrop-blur-sm text-cream-100 px-8 py-3 rounded-full font-bold transition-all border-2 border-cream-200/40 hover:border-cream-200/60"
            onClick={() => {
              const menu = document.getElementById('menu-section');
              menu?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Zobacz Menu
          </button>
        </div>
      </div>
    </div>
  );
};
