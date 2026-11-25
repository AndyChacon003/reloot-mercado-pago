import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Cpu, Truck, ArrowRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { PRODUCTS } from './data/products';
import { fetchExtraProducts } from './services/productApi';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import { InspectModal, SellModal } from './components/Modals';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [activeView, setActiveView] = useState('catalog');
  const [verifyBanner, setVerifyBanner] = useState('');

  const [apiProducts, setApiProducts] = useState([]);
  const [loadingApiProducts, setLoadingApiProducts] = useState(true);

  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('reloot_theme') === 'dark');

  const [token, setToken] = useState(() => localStorage.getItem('reloot_token') || '');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('reloot_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('reloot_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    let mounted = true;
    fetchExtraProducts()
      .then((extra) => {
        if (mounted) setApiProducts(extra);
      })
      .finally(() => {
        if (mounted) setLoadingApiProducts(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify_token');
    if (!verifyToken) return;

    fetch(`/api/verify-email?token=${encodeURIComponent(verifyToken)}`)
      .then((res) => res.json())
      .then((data) => {
        setVerifyBanner(data.message || data.error || 'Estado de verificación actualizado.');
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch(() => {
        setVerifyBanner('No se pudo validar el enlace de verificación.');
      });
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch('/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('reloot_token');
        setToken('');
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    if (activeView !== 'admin' || user?.role !== 'admin' || !token) return;
    setLoadingQuotes(true);
    fetch('/api/quotes', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setQuotes(data.quotes || []))
      .catch(() => setQuotes([]))
      .finally(() => setLoadingQuotes(false));
  }, [activeView, user, token]);

  const handleUpdateQuoteStatus = async (id, status) => {
    if (!token) return;
    const res = await fetch('/api/quotes', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) {
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    }
  };

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('reloot_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('reloot_token');
    setToken('');
    setUser(null);
    if (activeView === 'admin') setActiveView('catalog');
  };

  const allProducts = useMemo(() => [...PRODUCTS, ...apiProducts], [apiProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.specs.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const handleAddToCart = (product) => {
    if (cart.some((item) => item.id === product.id)) {
      setIsCartOpen(true);
      return;
    }
    setCart((prev) => [...prev, product]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const categories = [
    { id: 'all', label: `Todos (${allProducts.length})` },
    { id: 'pc', label: 'Componentes y Laptops' },
    { id: 'consolas', label: 'Consolas' },
    { id: 'telefonos', label: 'Teléfonos y Tablets' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSell={() => setIsSellOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {verifyBanner && (
        <div className="bg-blue-50 dark:bg-slate-900 border-b border-blue-200 dark:border-slate-800 px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <span className="font-semibold">{verifyBanner}</span>
            <button
              type="button"
              onClick={() => setVerifyBanner('')}
              className="text-xs font-bold text-reloot-600 dark:text-blue-400 hover:underline shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {activeView === 'admin' ? (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => setActiveView('catalog')}
              className="text-sm font-bold text-reloot-600 dark:text-blue-400 hover:underline"
            >
              ← Volver al catálogo
            </button>
            <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full">
              Panel de Administración RELOOT
            </span>
          </div>

          {user?.role !== 'admin' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <p className="font-bold text-slate-800 dark:text-white">
                Inicia sesión con la cuenta de administrador para ver las cotizaciones.
              </p>
            </div>
          ) : loadingQuotes ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              Cargando cotizaciones...
            </div>
          ) : quotes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              Aún no hay equipos enviados para cotización.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {q.image_data && (
                      <img
                        src={q.image_data}
                        alt={q.model}
                        className="w-full h-44 object-cover bg-slate-100 dark:bg-slate-800"
                      />
                    )}
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-reloot-600 dark:text-blue-400">{q.category}</span>
                        <span className="uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {q.status}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white">{q.model}</h3>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        ${Number(q.expected_price).toLocaleString('es-MX')} MXN
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Contacto: {q.contact}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuoteStatus(q.id, 'aprobado')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuoteStatus(q.id, 'rechazado')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : activeView === 'verify' ? (
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="text-sm font-bold text-reloot-600 dark:text-blue-400 hover:underline mb-6 inline-block"
          >
            ← Volver al catálogo
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm">
            <span className="inline-block bg-blue-50 dark:bg-blue-950 text-reloot-600 dark:text-blue-300 text-xs font-extrabold px-3 py-1 rounded-full mb-3">
              Protocolo Técnico RELOOT
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              Cómo auditamos el hardware antes de enviarlo
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
              En el mercado secundario y de importación gris la confianza lo es todo. Cada artículo pasa por un banco de pruebas antes de publicarse.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <Cpu className="w-8 h-8 text-reloot-600 dark:text-blue-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">1. Estrés y Térmicas</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Las GPUs y CPUs corren FurMark, 3DMark y MemTest86 verificando temperaturas en núcleo, VRAM y ausencia de artifacts.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-8 h-8 text-reloot-600 dark:text-blue-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">2. IMEI y Batería</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Validamos reporte limpio de IMEI, liberación de operador, ciclos reales de batería y sensores biométricos en smartphones.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <Truck className="w-8 h-8 text-reloot-600 dark:text-blue-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">3. Pago Protegido</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tu dinero se procesa mediante Mercado Pago y cuentas con garantía de funcionamiento contra defectos ocultos.
                </p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <>
          <section className="bg-gradient-to-b from-white to-blue-50/70 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-14 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-reloot-600 dark:text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mercado Secundario Tech Verificado</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-5">
                  Dale una segunda vida al mejor{' '}
                  <span className="text-reloot-600 dark:text-blue-400">hardware y gaming</span>.
                </h1>

                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-7 max-w-xl">
                  Tarjetas gráficas, procesadores, consolas y smartphones seminuevos con telemetría verificada y pago protegido con{' '}
                  <strong className="text-slate-900 dark:text-white">Mercado Pago</strong>.
                </p>

                <div className="flex flex-wrap gap-3 mb-9">
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 bg-reloot-600 hover:bg-reloot-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-600/20"
                  >
                    <span>Explorar Catálogo</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveView('verify')}
                    className="bg-white dark:bg-slate-900 hover:border-reloot-600 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-bold px-6 py-3.5 rounded-xl text-sm transition-colors"
                  >
                    ¿Cómo verificamos?
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 max-w-md">
                  <div>
                    <strong className="block text-xl font-extrabold text-reloot-600 dark:text-blue-400">
                      +1,400
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Equipos auditados
                    </span>
                  </div>
                  <div>
                    <strong className="block text-xl font-extrabold text-reloot-600 dark:text-blue-400">
                      100%
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Compra protegida
                    </span>
                  </div>
                  <div>
                    <strong className="block text-xl font-extrabold text-reloot-600 dark:text-blue-400">
                      24-48h
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Envío asegurado
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-blue-900/5 hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center justify-between text-xs font-bold text-reloot-600 dark:text-blue-400 mb-3">
                    <span>OFERTA DESTACADA DEL DÍA</span>
                    <span className="bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
                      Stock Único
                    </span>
                  </div>

                  <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-slate-900">
                    <img
                      src={PRODUCTS[0].fallbackImage}
                      alt={PRODUCTS[0].name}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/30 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[11px] uppercase tracking-widest text-blue-200 font-semibold">
                        NVIDIA Founders Edition
                      </span>
                      <span className="text-xl font-extrabold tracking-tight">
                        RTX 4070 SUPER 12GB
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Grado A+ · 3DMark 99.2%
                  </span>

                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                    NVIDIA GeForce RTX 4070 Super
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Incluye caja original, adaptador 12VHPWR y reporte térmico completo.
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-xs text-slate-400 line-through">
                        $14,500 MXN
                      </span>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        $10,890 MXN
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(PRODUCTS[0])}
                      className="bg-reloot-600 hover:bg-reloot-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main id="catalogo" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Catálogo Disponible
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Equipos locales verificados + inventario en vivo desde API.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${selectedCategory === cat.id
                        ? 'bg-reloot-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-reloot-600'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingApiProducts && (
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-reloot-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sincronizando más productos desde la API...</span>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
                No encontramos equipos que coincidan con tu búsqueda.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onInspect={setInspectedProduct}
                    isInCart={cart.some((c) => c.id === product.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      <footer className="bg-reloot-900 dark:bg-slate-950 border-t border-transparent dark:border-slate-800 text-slate-300 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xl font-extrabold text-white">
              RE<span className="text-blue-400">LOOT</span>
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Marketplace de hardware, consolas y smartphones seminuevos verificados.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Pagos procesados con <strong className="text-sky-400">Mercado Pago</strong> · © 2026 RELOOT
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        token={token}
      />

      <InspectModal
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
        onAddToCart={handleAddToCart}
        isInCart={inspectedProduct ? cart.some((c) => c.id === inspectedProduct.id) : false}
      />

      <SellModal isOpen={isSellOpen} onClose={() => setIsSellOpen(false)} token={token} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}