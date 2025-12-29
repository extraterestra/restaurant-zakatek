
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative bg-emerald-900 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://picsum.photos/1920/600?grayscale"
          alt="Zakątek Smaków tło"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-emerald-900/80 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          <span className="block">Witamy w</span>
          <span className="block text-lime-400">Zakątek Smaków.</span>
        </h1>
        <p className="mt-4 text-xl text-emerald-100 max-w-lg mb-8 leading-relaxed">
          Odkryj autentyczne smaki tradycji. Domowe zupy, sycące dania główne i nasze popisowe czeburaki, przygotowane według sprawdzonych, domowych receptur.
        </p>
        <div className="flex gap-4">
          <button
            className="bg-lime-500 hover:bg-lime-600 text-gray-900 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-lime-500/30"
            onClick={() => {
              const menu = document.getElementById('menu-section');
              menu?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Zamów Teraz
          </button>
          <button
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-bold transition-all border border-white/20"
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
