
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                 <path d="M15 92 H85" stroke="#84cc16" strokeWidth="6" strokeLinecap="round" />
                 <path d="M22 10 H42 L52 82 H44 L32 35 C30 20 28 15 22 10 Z" fill="white" />
                 <path d="M51 82 Q58 50 55 10 Q68 25 72 38 Q82 28 92 28 Q78 55 51 82 Z" fill="#84cc16" />
              </svg>
            </div>
            <div>
                 <span className="block font-bold text-xl tracking-[0.2em] text-white leading-none">SIVIK</span>
                 <span className="block text-xs text-gray-400 font-script">Restauracja</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Autentyczne smaki, świeże składniki i pasja do zdrowego życia. SIVIK przenosi restauracyjne doświadczenie prosto do Twojego domu.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Menu</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-emerald-500 cursor-pointer transition-colors">Sushi</li>
            <li className="hover:text-emerald-500 cursor-pointer transition-colors">Burgery</li>
            <li className="hover:text-emerald-500 cursor-pointer transition-colors">Shoarma</li>
            <li className="hover:text-emerald-500 cursor-pointer transition-colors">Sałatki</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Firma</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-emerald-500 cursor-pointer transition-colors">O nas</li>
            <li className="hover:text-emerald-500 cursor-pointer transition-colors">Kariera</li>
            <li className="hover:text-emerald-500 cursor-pointer transition-colors">Polityka Prywatności</li>
            <li className="hover:text-emerald-500 cursor-pointer transition-colors">Regulamin</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Kontakt</h4>
          <div className="space-y-3 text-sm text-gray-400">
            <p className="flex items-center"><i className="fas fa-phone mr-3 text-emerald-500"></i> +48 123 456 789</p>
            <p className="flex items-center"><i className="fas fa-envelope mr-3 text-emerald-500"></i> zamowienia@sivik.pl</p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
        &copy; 2024 SIVIK Restauracja. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
};
