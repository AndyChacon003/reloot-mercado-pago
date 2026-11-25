import React from 'react';
import { Zap, Search, ShoppingCart, PlusCircle, User, LogOut, Moon, Sun, Shield } from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCart,
  onOpenSell,
  onOpenAuth,
  user,
  onLogout,
  activeView,
  setActiveView,
  darkMode,
  onToggleDarkMode
}) {
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="bg-reloot-600 text-white text-center text-xs sm:text-sm font-medium py-2 px-4">
        Garantía RELOOT de 90 días en equipo verificado · Envíos asegurados a todo México
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setActiveView('catalog')}
          className="flex items-center gap-2.5 text-left group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-reloot-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            RE<span className="text-reloot-600 dark:text-blue-400">LOOT</span>
          </span>
        </button>

        <div className="hidden md:flex flex-1 max-w-md items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-reloot-600 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
          <Search className="w-4 h-4 text-slate-400 ml-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeView !== 'catalog') setActiveView('catalog');
            }}
            placeholder="Buscar RTX 4070, PS5, iPhone 15 Pro, Ryzen..."
            className="w-full bg-transparent px-3 py-2.5 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'verify' ? 'catalog' : 'verify')}
            className={`hidden lg:inline-flex px-3 py-2 rounded-xl text-xs font-bold transition-colors ${activeView === 'verify'
                ? 'bg-reloot-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            Verificación
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'admin' ? 'catalog' : 'admin')}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${activeView === 'admin'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSell}
            className="hidden sm:inline-flex items-center gap-1.5 bg-reloot-50 hover:bg-reloot-100 dark:bg-blue-950/60 dark:hover:bg-blue-950 text-reloot-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Vender</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Cambiar tema"
            className="inline-flex items-center justify-center bg-white dark:bg-slate-800 hover:border-reloot-600 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-slate-700 dark:text-slate-200 transition-all shadow-sm"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-reloot-600" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <User className="w-4 h-4 text-reloot-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[110px] truncate">
                {user.name}
              </span>
              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:border-reloot-600 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 transition-all shadow-sm"
            >
              <User className="w-4 h-4 text-reloot-600 dark:text-blue-400" />
              <span>Iniciar sesión</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-1.5 bg-reloot-600 hover:bg-reloot-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Carrito</span>
            <span className="bg-white text-reloot-600 text-xs font-extrabold px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}