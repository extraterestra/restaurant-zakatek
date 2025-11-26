
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { AIChef } from './components/AIChef';
import { Footer } from './components/Footer';
import { MENU_ITEMS } from './constants';
import { CartItem, Product, Category } from './types';

function App() {
  const [activeCategory, setActiveCategory] = useState<string>(Category.ALL);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (activeCategory === Category.ALL) return MENU_ITEMS;
    return MENU_ITEMS.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  // Cart logic
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  // Safely handle potentially undefined price
  const cartTotalPrice = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0) + 9.99; // + delivery fee

  const handleCheckoutStart = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        cartCount={cartTotalCount} 
        onOpenCart={() => setIsCartOpen(true)} 
        onCategorySelect={setActiveCategory}
      />

      <main className="flex-grow">
        <Hero />

        <div id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Nasze Menu</h2>
            
            {/* Mobile Category Scroll */}
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <div className="flex space-x-2">
                    {[Category.ALL, Category.SUSHI, Category.BURGERS, Category.SHAWARMA, Category.SALADS].map((cat) => (
                        <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                            activeCategory === cat 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                        >
                        {cat}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                Brak produktów w tej kategorii.
            </div>
          )}
        </div>

        {/* Mock Map Section */}
        <div className="bg-gray-100 py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row h-[400px]">
                    <div className="md:w-1/3 p-10 flex flex-col justify-center bg-gray-900 text-white">
                        <h3 className="text-2xl font-bold mb-4">Strefa Dostaw</h3>
                        <p className="text-gray-400 mb-6">Dostarczamy świeżość w 30 minut do całego centrum i okolicznych dzielnic.</p>
                        <ul className="space-y-3">
                             <li className="flex items-center gap-3"><i className="fas fa-check-circle text-emerald-500"></i> Darmowa dostawa pow. 100 zł</li>
                             <li className="flex items-center gap-3"><i className="fas fa-check-circle text-emerald-500"></i> Śledzenie w czasie rzeczywistym</li>
                        </ul>
                    </div>
                    <div className="md:w-2/3 bg-gray-200 relative">
                        {/* Abstract map representation */}
                        <div className="absolute inset-0 opacity-50 bg-[url('https://picsum.photos/800/600?grayscale&blur=2')] bg-cover bg-center"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="font-bold text-gray-800">Jesteś w strefie!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </main>

      <Footer />
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckoutStart}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        onClearCart={() => setCartItems([])}
        total={cartTotalPrice}
      />

      <AIChef />
    </div>
  );
}

export default App;
