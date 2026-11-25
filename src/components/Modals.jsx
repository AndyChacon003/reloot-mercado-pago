import React, { useState } from 'react';
import { X, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';

export function InspectModal({ product, onClose, onAddToCart, isInCart }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs" />
      <div className="relative z-10 bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="relative h-44 bg-slate-900">
          <img
            src={product.fallbackImage}
            alt={product.name}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/70 text-white hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-5 right-5 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
              Ficha Técnica Verificada · {product.condition}
            </span>
            <h3 className="text-lg font-extrabold leading-tight">{product.name}</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">{product.specs}</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-500 block">Térmica / Salud</span>
              <strong className="text-xs text-reloot-700 flex items-center gap-1 mt-1">
                <Activity className="w-3.5 h-3.5" /> {product.telemetry.temp}
              </strong>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-500 block">Benchmark</span>
              <strong className="text-xs text-reloot-700 block mt-1">{product.telemetry.score}</strong>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-500 block">Respaldo</span>
              <strong className="text-xs text-reloot-700 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {product.telemetry.warranty}
              </strong>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 line-through block">
                ${product.oldPrice.toLocaleString('es-MX')} MXN
              </span>
              <span className="text-2xl font-extrabold text-reloot-600">
                ${product.price.toLocaleString('es-MX')} MXN
              </span>
            </div>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={isInCart}
              className="bg-reloot-600 hover:bg-reloot-700 disabled:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors"
            >
              {isInCart ? 'Ya está en tu carrito' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SellModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs" />
      <div className="relative z-10 bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900">Vende tu equipo en RELOOT</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 mb-1">¡Solicitud recibida!</h4>
            <p className="text-sm text-slate-500">
              Un técnico de RELOOT valuará tu equipo y te contactará en menos de 24 horas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-sm">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Categoría</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-reloot-600">
                <option>Componente de PC (GPU, CPU, RAM, Motherboard)</option>
                <option>Consola (PS5, Xbox Series, Switch, Steam Deck)</option>
                <option>Smartphone (iPhone / Android Gama Alta)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Modelo exacto</label>
              <input
                type="text"
                required
                placeholder="Ej. RTX 3080 Ti EVGA o iPhone 14 Pro 256GB"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-reloot-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Precio esperado (MXN)</label>
              <input
                type="number"
                required
                placeholder="6500"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-reloot-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp o Correo</label>
              <input
                type="text"
                required
                placeholder="443 000 0000 / correo@ejemplo.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-reloot-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-reloot-600 hover:bg-reloot-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Enviar para cotización
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
