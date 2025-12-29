import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);

    // Reset state after 1.5 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group bg-[#FCFBF7] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#E5E1D1] overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-[#F3F1E9]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isSpicy && (
            <span className="bg-[#D97706]/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              <i className="fas fa-pepper-hot mr-1"></i> Ostre
            </span>
          )}
          {product.isVegetarian && (
            <span className="bg-[#65A30D]/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              <i className="fas fa-leaf mr-1"></i> Wege
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-bold text-[#453F36] group-hover:text-[#A0522D] transition-colors leading-tight">
            {product.name}
          </h3>
          <span className="font-bold text-[#A0522D] bg-[#F9F5EB] px-3 py-1 rounded-lg border border-[#EBE1D1]">
            {(product.price || 0).toFixed(2)} zł
          </span>
        </div>

        <p className="text-[#6B6356] text-sm mb-4 flex-1 italic leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between text-[11px] text-[#8C8376] mb-4 font-medium uppercase tracking-wide">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-fire-alt text-[#D97706]/70"></i>
            {product.calories} kcal
          </div>
          <div className="flex items-center gap-1.5 border-l border-[#E5E1D1] pl-3">
            <i className="fas fa-utensils text-[#8C8376]/50"></i>
            {product.category}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border-2 ${isAdded
            ? 'bg-[#65A30D] text-white border-[#65A30D] scale-95 shadow-inner'
            : 'bg-[#453F36] text-white border-[#453F36] hover:bg-[#A0522D] hover:border-[#A0522D] hover:shadow-md'
            }`}
        >
          {isAdded ? (
            <>
              <i className="fas fa-check"></i> Dodano do koszyka
            </>
          ) : (
            <>
              <i className="fas fa-shopping-basket"></i> Zamów teraz
            </>
          )}
        </button>
      </div>
    </div>
  );
};
