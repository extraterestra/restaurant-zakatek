
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { AIChef } from './components/AIChef';
import { Footer } from './components/Footer';
import { Admin } from './components/Admin';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { FoodConfiguration } from './components/FoodConfiguration';
import { MENU_ITEMS } from './constants';
import { CartItem, Product, Category, AuthSession } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  // Get the actual pathname, handling rewrites
  const getPath = () => {
    let path = window.location.pathname;

    // If we're on index.html but should be on /admin (from rewrite)
    // Check the referrer or use a different method
    if (path === '/index.html') {
      // Try to get the original path from sessionStorage (set by 404.html if used)
      const savedPath = sessionStorage.getItem('originalPath');
      if (savedPath) {
        sessionStorage.removeItem('originalPath');
        path = savedPath;
        window.history.replaceState(null, '', path);
      }
    }
    return path;
  };

  const isAdminRoute = (path: string) => {
    return path === '/admin' || path === '/admin/users' || path === '/admin/food';
  };

  const [currentPath, setCurrentPath] = useState(getPath());
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication session
  const checkSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
        credentials: 'include',
      });
      const data = await response.json();
      setAuthSession(data);
    } catch (err) {
      console.error('Error checking session:', err);
      setAuthSession({ isAuthenticated: false, user: null });
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    // Update path if it changed
    const updatePath = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath && newPath !== '/index.html') {
        setCurrentPath(newPath);
      }
    };

    // Check immediately
    updatePath();

    // Listen for navigation events
    window.addEventListener('popstate', updatePath);

    // Also check periodically in case of async URL changes
    const interval = setInterval(() => {
      const path = window.location.pathname;
      if (isAdminRoute(path) && currentPath !== path) {
        setCurrentPath(path);
      }
    }, 100);

    return () => {
      window.removeEventListener('popstate', updatePath);
      clearInterval(interval);
    };
  }, [currentPath]);

  // Check session on mount and when path changes to admin routes
  useEffect(() => {
    if (isAdminRoute(currentPath)) {
      checkSession();
    }
  }, [currentPath]);

  // Handle admin routes with authentication
  if (currentPath === '/admin' || window.location.pathname === '/admin') {
    // If URL shows /index.html but we're on /admin route, fix it
    if (window.location.pathname === '/index.html') {
      window.history.replaceState(null, '', '/admin');
      setCurrentPath('/admin');
    }

    // Show loading while checking auth
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500 mb-4"></i>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Show login if not authenticated
    if (!authSession?.isAuthenticated) {
      return <Login onLoginSuccess={() => {
        checkSession();
      }} />;
    }

    // Show admin dashboard if authenticated
    return <Admin />;
  }

  // Handle user management route (admin only)
  if (currentPath === '/admin/users' || window.location.pathname === '/admin/users') {
    // Show loading while checking auth
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500 mb-4"></i>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!authSession?.isAuthenticated) {
      window.location.href = '/admin';
      return null;
    }

    // Check if user is admin
    if (authSession.user?.role !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
            <a
              href="/admin"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Back to Admin Dashboard
            </a>
          </div>
        </div>
      );
    }

    return <UserManagement />;
  }

  // Handle food configuration route (admin only)
  if (currentPath === '/admin/food' || window.location.pathname === '/admin/food') {
    // Show loading while checking auth
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500 mb-4"></i>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!authSession?.isAuthenticated) {
      window.location.href = '/admin';
      return null;
    }

    // Only admins can manage food configuration
    if (authSession.user?.role !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">Only admins can manage food configuration.</p>
            <a
              href="/admin"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Back to Admin Dashboard
            </a>
          </div>
        </div>
      );
    }

    return <FoodConfiguration />;
  }

  const [activeCategory, setActiveCategory] = useState<string>(Category.ALL);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<Product[]>(MENU_ITEMS);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Load menu items from backend (with fallback to static constants)
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/menu-items`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        const mapped: Product[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          description: item.description,
          image: item.image_url,
          calories: item.calories ?? 0,
          category: item.category as Category,
          price: Number(item.price),
          ingredients: [],
        }));
        setMenuItems(mapped);
      } catch (err) {
        console.error('Error fetching menu items, using default menu:', err);
        setMenuItems(MENU_ITEMS);
      }
    };

    fetchMenu();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...menuItems];
    if (activeCategory !== Category.ALL) {
      products = products.filter(item => item.category === activeCategory);
    }
    // Sort by category then name
    return products.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }, [activeCategory, menuItems]);

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    filteredProducts.forEach(product => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    });
    return groups;
  }, [filteredProducts]);

  // Get sorted category list
  const sortedCategories = useMemo(() => {
    return Object.keys(groupedProducts).sort();
  }, [groupedProducts]);

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

  const handleNavigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const SimplePage = ({ title, content }: { title: string, content: string }) => (
    <div className="min-h-[60vh] bg-gray-50 pt-20 pb-20">
      {/* Decorative Header */}
      <div className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{title}</h1>
          <div className="w-20 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <button
            onClick={() => handleNavigate('/')}
            className="mb-8 flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            <i className="fas fa-arrow-left mr-2 transform group-hover:-translate-x-1 transition-transform"></i>
            Powrót do strony głównej
          </button>

          <div className="prose prose-lg text-gray-600 max-w-none whitespace-pre-line leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onCategorySelect={(cat) => {
          setActiveCategory(cat);
          if (currentPath !== '/' && currentPath !== '/index.html') {
            handleNavigate('/');
            // Small delay to allow render before scrolling
            setTimeout(() => {
              const menu = document.getElementById('menu-section');
              if (menu) menu.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }}
      />

      <main className="flex-grow">
        {(currentPath === '/' || currentPath === '/index.html') ? (
          <>
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
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat
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

          <div className="space-y-12">
            {sortedCategories.map(category => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4">
                    {category}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {groupedProducts[category].map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {sortedCategories.length === 0 && (
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
          </>
        ) : null}

        {currentPath === '/o-nas' && (
          <SimplePage
            title="O Nas"
            content="SIVIK Restauracja powstała z pasji do łączenia smaków. Nasza historia zaczęła się w 2025 roku, kiedy postanowiliśmy stworzyć miejsce, gdzie jakość spotyka się z nowoczesnością.
                
                Używamy tylko najświeższych składników od lokalnych dostawców.
                
                Zapraszamy do świata kulinarnych doznań!"
          />
        )}

        {currentPath === '/kariera' && (
          <SimplePage
            title="Kariera w SIVIK"
            content="Dziękujemy za zainteresowanie pracą w SIVIK.
                
                Aktualnie nie prowadzimy rekrutacji na żadne stanowiska.
                
                Zachęcamy do śledzenia naszej strony - gdy tylko pojawią się nowe oferty, na pewno o tym poinformujemy!"
          />
        )}

        {currentPath === '/polityka-prywatnosci' && (
          <SimplePage
            title="Polityka Prywatności"
            content="Szanujemy Twoją prywatność. Poniżej znajdziesz informacje o tym, jak przetwarzamy Twoje dane osobowe.
                
                1. Administratorem danych jest SIVIK Restauracja.
                2. Dane zbierane są w celu realizacji zamówień oraz marketingu bezpośredniego.
                3. Masz prawo dostępu do swoich danych, ich sprostowania oraz usunięcia.
                
                Pełna treść polityki dostępna jest w naszej siedzibie."
          />
        )}

        {currentPath === '/regulamin' && (
          <SimplePage
            title="Regulamin"
            content="1. Postanowienia ogólne
                Niniejszy regulamin określa zasady korzystania z usług restauracji SIVIK.
                
                2. Zamówienia
                Zamówienia można składać online, telefonicznie lub osobiście.
                
                3. Dostawa
                Dostawy realizujemy w strefie wyznaczonej na mapie. Czas oczekiwania wynosi zazwyczaj do 45 minut.
                
                4. Reklamacje
                Wszelkie uwagi prosimy zgłaszać niezwłocznie po otrzymaniu zamówienia."
          />
        )}
      </main>

      <Footer
        onCategorySelect={(cat) => {
          if (currentPath !== '/' && currentPath !== '/index.html') {
            handleNavigate('/');
            setTimeout(() => setActiveCategory(cat), 50);
          } else {
            setActiveCategory(cat);
          }
        }}
        onNavigate={handleNavigate}
      />
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
        items={cartItems}
      />

      <AIChef />
    </div>
  );
}

export default App;
