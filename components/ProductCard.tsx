
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product);
    setIsAdded(true);

    // Reset state after 1.5 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isSpicy && (
            <span className="bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Ostre
            </span>
          )}
          {product.isVegetarian && (
            <span className="bg-lime-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Wege
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            {(product.price || 0).toFixed(2)} zł
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-4 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <i className="fas fa-fire-alt text-orange-500"></i>
            {product.calories} kcal
          </div>
          <div className="flex items-center gap-1">
            <i className="fas fa-utensils text-gray-300"></i>
            {product.category}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${isAdded
            ? 'bg-lime-500 text-white scale-95 shadow-inner cursor-default'
            : 'bg-gray-900 text-white hover:bg-emerald-600 active:bg-emerald-700 hover:shadow-lg'
            }`}
        >
          {isAdded ? (
            <>
              <i className="fas fa-check animate-bounce"></i> Dodano!
            </>
          ) : (
            <>
              <i className="fas fa-plus"></i> Do Koszyka
            </>
          )}
        </button>
      </div>
    </div>
  );
};
