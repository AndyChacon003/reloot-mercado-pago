import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Cpu, Truck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { PRODUCTS } from './data/products';
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

  const [token, setToken] = useState(() => localStorage.getItem('reloot_token') || '');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify_token');
    if (!verifyToken) return;

    fetch(`/api/verify-email?token=${encodeURIComponent(verifyToken)}`)
      .then((res) => res.json())
      .then((data) => {
        setVerifyBanner(
          data.message || data.error || 'Estado de verificación actualizado.'
        );
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

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('reloot_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('reloot_token');
    setToken('');
    setUser(null);
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.specs.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
    { id: 'all', label: 'Todos' },
    { id: 'pc', label: 'Componentes PC' },
    { id: 'consolas', label: 'Consolas' },
    { id: 'telefonos', label: 'Teléfonos' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
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
      />

      {verifyBanner && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 text-xs sm:text-sm text-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <span className="font-semibold">{verifyBanner}</span>
            <button
              type="button"
              onClick={() => setVerifyBanner('')}
              className="text-xs font-bold text-reloot-600 hover:underline shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {activeView === 'verify' ? (
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <button
            onClick={() => setActiveView('catalog')}
            className="text-sm font-bold text-reloot-600 hover:underline mb-6 inline-block"
          >
            ← Volver al catálogo
          </button>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
            <span className="inline-block bg-blue-50 text-reloot-600 text-xs font-extrabold px-3 py-1 rounded-full mb-3">
              Protocolo Técnico RELOOT
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
              Cómo auditamos el hardware antes de enviarlo
            </h1>
            <p className="text-slate-600 mb-8 max-w-2xl">
              En el mercado secundario y de importación gris la confianza lo es todo. Cada artículo pasa por un banco de pruebas antes de publicarse.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <Cpu className="w-8 h-8 text-reloot-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">1. Estrés y Térmicas</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Las GPUs y CPUs corren FurMark, 3DMark y MemTest86 verificando temperaturas en núcleo, VRAM y ausencia de artifacts.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-8 h-8 text-reloot-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">2. IMEI y Batería</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Validamos reporte limpio de IMEI, liberación de operador, ciclos reales de batería y sensores biométricos en smartphones.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <Truck className="w-8 h-8 text-reloot-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">3. Pago Protegido</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tu dinero se procesa mediante Mercado Pago y cuentas con garantía de funcionamiento contra defectos ocultos.
                </p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <>
          <section className="bg-gradient-to-b from-white to-blue-50/70 border-b border-slate-200 py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-reloot-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mercado Secundario Tech Verificado</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5">
                  Dale una segunda vida al mejor{' '}
                  <span className="text-reloot-600">hardware y gaming</span>.
                </h1>

                <p className="text-slate-600 text-base sm:text-lg mb-7 max-w-xl">
                  Tarjetas gráficas, procesadores, consolas y smartphones seminuevos con telemetría verificada y pago protegido con{' '}
                  <strong className="text-slate-900">Mercado Pago</strong>.
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
                    onClick={() => setActiveView('verify')}
                    className="bg-white hover:border-reloot-600 text-slate-800 border border-slate-200 font-bold px-6 py-3.5 rounded-xl text-sm transition-colors"
                  >
                    ¿Cómo verificamos?
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 max-w-md">
                  <div>
                    <strong className="block text-xl font-extrabold text-reloot-600">+1,400</strong>
                    <span className="text-xs text-slate-500">Equipos auditados</span>
                  </div>
                  <div>
                    <strong className="block text-xl font-extrabold text-reloot-600">100%</strong>
                    <span className="text-xs text-slate-500">Compra protegida</span>
                  </div>
                  <div>
                    <strong className="block text-xl font-extrabold text-reloot-600">24-48h</strong>
                    <span className="text-xs text-slate-500">Envío asegurado</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-blue-900/5 hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center justify-between text-xs font-bold text-reloot-600 mb-3">
                    <span>OFERTA DESTACADA DEL DÍA</span>
                    <span className="bg-blue-50 px-2.5 py-0.5 rounded-full">Stock Único</span>
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

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Grado A+ · 3DMark 99.2%
                  </span>

                  <h3 className="font-bold text-slate-900 text-lg mb-1">
                    NVIDIA GeForce RTX 4070 Super
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Incluye caja original, adaptador 12VHPWR y reporte térmico completo.
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="block text-xs text-slate-400 line-through">$14,500 MXN</span>
                      <span className="text-2xl font-extrabold text-slate-900">$10,890 MXN</span>
                    </div>
                    <button
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
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Catálogo Disponible
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Pasa el cursor sobre cada tarjeta para ver su telemetría y diagnóstico técnico.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${selectedCategory === cat.id
                        ? 'bg-reloot-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-reloot-600'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
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

      <footer className="bg-reloot-900 text-slate-300 py-12 mt-12">
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