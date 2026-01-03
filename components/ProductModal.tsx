import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface ProductModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
    orderingDisabled?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart, orderingDisabled = false }) => {
    const [isAdded, setIsAdded] = useState(false);

    // Reset state when product changes or modal closes
    useEffect(() => {
        setIsAdded(false);
    }, [product, isOpen]);

    if (!isOpen) return null;

    // Treat anything except an explicit false as enabled (so undefined stays active)
    const isEnabled = product.isEnabled !== false;
    const isDisabled = !isEnabled;
    const actionDisabled = isDisabled || orderingDisabled;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (actionDisabled) return;
        onAddToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur rounded-full p-2 text-gray-800 hover:bg-white hover:text-red-500 transition-colors shadow-sm"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>

                {/* Image Section */}
                <div className="md:w-1/2 relative h-64 md:h-auto">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.isSpicy && (
                            <span className="bg-red-500/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                <i className="fas fa-pepper-hot mr-1"></i> Ostre
                            </span>
                        )}
                        {product.isVegetarian && (
                            <span className="bg-lime-500/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                <i className="fas fa-leaf mr-1"></i> Wege
                            </span>
                        )}
                        {isDisabled && (
                            <span className="bg-gray-700/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                Niedostępne
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:w-1/2 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-2xl font-bold text-sienna-600">
                            {(product.price || 0).toFixed(2)} zł
                        </span>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                            <i className="fas fa-fire-alt text-orange-500"></i> {product.calories} kcal
                        </span>
                    </div>

                    <div className="prose prose-sm text-gray-600 mb-8 flex-grow overflow-y-auto max-h-40 md:max-h-none scrollbar-thin scrollbar-thumb-gray-200">
                        <p className="font-medium text-gray-800 mb-2">Opis</p>
                        <p className="mb-4">{product.description}</p>

                        {product.ingredients && product.ingredients.length > 0 && (
                            <>
                                <p className="font-medium text-gray-800 mb-2">Składniki</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.ingredients.map((ing, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md border border-gray-200"
                                        >
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-auto pt-4 md:pt-0">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded || actionDisabled}
                            className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${isAdded
                                ? 'bg-lime-500 text-white shadow-inner cursor-default'
                                : actionDisabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-900 text-white hover:bg-sienna-600 hover:shadow-lg shadow-sienna-500/30'
                                }`}
                        >
                            {isAdded ? (
                                <>
                                    <i className="fas fa-check animate-bounce"></i> Dodano do koszyka!
                                </>
                            ) : actionDisabled ? (
                                <>
                                    <i className="fas fa-times-circle"></i> {orderingDisabled ? 'Zadzwoń, aby zamówić' : 'Niedostępne'}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-plus"></i> Dodaj do koszyka
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
