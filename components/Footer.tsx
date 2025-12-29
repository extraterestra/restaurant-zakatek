import React from 'react';
import { Category } from '../types';

interface FooterProps {
  onCategorySelect: (category: Category) => void;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategorySelect, onNavigate }) => {
  const handleCategoryClick = (e: React.MouseEvent, category: Category) => {
    e.preventDefault();
    onCategorySelect(category);
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="bg-amber-950 text-cream-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M15 92 H85" stroke="#A0522D" strokeWidth="6" strokeLinecap="round" />
                <path d="M22 10 H42 L52 82 H44 L32 35 C30 20 28 15 22 10 Z" fill="#FFF8DC" />
                <path d="M51 82 Q58 50 55 10 Q68 25 72 38 Q82 28 92 28 Q78 55 51 82 Z" fill="#A0522D" />
              </svg>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="block font-serif font-bold text-xl tracking-[0.1em] text-cream-100 leading-none">Zakątek Smaków</span>
              <span className="block text-[10px] text-cream-400 font-script ml-0.5">Restauracja</span>
            </div>
          </div>
          <p className="text-sm text-cream-400 leading-relaxed">
            Autentyczne smaki, świeże składniki i pasja do tradycyjnego gotowania. Zakątek Smaków to smak prawdziwego domu, dostarczany prosto pod Twoje drzwi.
          </p>
        </div>

        <div>
          <h4 className="text-cream-100 font-bold mb-4 uppercase tracking-wider text-sm">Menu</h4>
          <ul className="space-y-2 text-sm text-cream-400">
            <li><a href="#" onClick={(e) => handleCategoryClick(e, Category.CHEBUREKI)} className="hover:text-sienna-400 transition-colors">Chebureki</a></li>
            <li><a href="#" onClick={(e) => handleCategoryClick(e, Category.MAIN_DISHES)} className="hover:text-sienna-400 transition-colors">Dania główne</a></li>
            <li><a href="#" onClick={(e) => handleCategoryClick(e, Category.DUMPLINGS)} className="hover:text-sienna-400 transition-colors">Pierogi</a></li>
            <li><a href="#" onClick={(e) => handleCategoryClick(e, Category.CHINKALI)} className="hover:text-sienna-400 transition-colors">Chinkali</a></li>
            <li><a href="#" onClick={(e) => handleCategoryClick(e, Category.SOUPS)} className="hover:text-sienna-400 transition-colors">Zupy</a></li>
            <li><a href="#" onClick={(e) => handleCategoryClick(e, Category.DRINKS)} className="hover:text-sienna-400 transition-colors">Napoje</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-cream-100 font-bold mb-4 uppercase tracking-wider text-sm">Firma</h4>
          <ul className="space-y-2 text-sm text-cream-400">
            <li><a href="#" onClick={(e) => handleNavClick(e, '/o-nas')} className="hover:text-sienna-400 transition-colors">O nas</a></li>
            <li><a href="#" onClick={(e) => handleNavClick(e, '/kariera')} className="hover:text-sienna-400 transition-colors">Kariera</a></li>
            <li><a href="#" onClick={(e) => handleNavClick(e, '/polityka-prywatnosci')} className="hover:text-sienna-400 transition-colors">Polityka Prywatności</a></li>
            <li><a href="#" onClick={(e) => handleNavClick(e, '/regulamin')} className="hover:text-sienna-400 transition-colors">Regulamin</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-cream-100 font-bold mb-4 uppercase tracking-wider text-sm">Kontakt</h4>
          <div className="space-y-3 text-sm text-cream-400">
            <p className="flex items-center"><i className="fas fa-map-marker-alt mr-3 text-sienna-500"></i> Jana Pawła II, 34-700 Rabka-Zdrój</p>
            <p className="flex items-center"><i className="fas fa-phone mr-3 text-sienna-500"></i> +48 532136020</p>
            <p className="flex items-center"><i className="fas fa-envelope mr-3 text-sienna-500"></i> sivikrestaurant@gmail.com</p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-sienna-900 flex items-center justify-center hover:bg-sienna-600 hover:text-cream-100 transition-all">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-sienna-900 flex items-center justify-center hover:bg-sienna-600 hover:text-cream-100 transition-all">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-sienna-900 flex items-center justify-center hover:bg-sienna-600 hover:text-cream-100 transition-all">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-sienna-800 text-center text-xs text-cream-500">
        &copy; 2025 Zakątek Smaków. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
};
