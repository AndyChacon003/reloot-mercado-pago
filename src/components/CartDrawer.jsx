import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cart, onRemove, onClearCart }) {
  const [checkoutState, setCheckoutState] = useState('idle');

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleMercadoPago = async () => {
    setCheckoutState('loading');

    try {
      const response = await fetch('http://localhost:3000/create_preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
        return;
      }
    } catch {
      setTimeout(() => {
        setCheckoutState('ready');
      }, 900);
    }
  };

  const confirmDemoPayment = () => {
    setCheckoutState('success');
    setTimeout(() => {
      onClearCart();
      setCheckoutState('idle');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <aside className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Tu Carrito RELOOT</h3>
            <p className="text-xs text-slate-500">Piezas únicas verificadas</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <p className="font-bold text-slate-700 mb-1">Tu carrito está vacío</p>
              <p className="text-xs max-w-xs">
                Agrega GPUs, procesadores, consolas o smartphones seminuevos desde el catálogo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <img
                    src={item.fallbackImage}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-reloot-600">
                      {item.condition}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <span className="text-sm font-extrabold text-reloot-600">
                      ${item.price.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${total.toLocaleString('es-MX')} MXN</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Envío Asegurado</span>
                <span className="font-bold text-reloot-600">GRATIS</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>${total.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>

            <div className="bg-white border border-sky-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-mp text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  mercadopago
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-mp" /> Checkout Pro
                </span>
              </div>

              {checkoutState === 'idle' && (
                <>
                  <p className="text-xs text-slate-500 mb-3">
                    Paga con tarjeta de crédito (MSI), débito, transferencia SPEI o efectivo con protección al comprador.
                  </p>
                  <button
                    onClick={handleMercadoPago}
                    className="w-full bg-mp hover:bg-mp-dark text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    Pagar con Mercado Pago
                  </button>
                </>
              )}

              {checkoutState === 'loading' && (
                <div className="py-4 text-center">
                  <Loader2 className="w-6 h-6 text-mp animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    Creando preferencia segura en Mercado Pago...
                  </p>
                </div>
              )}

              {checkoutState === 'ready' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-600">
                    Preferencia lista por <strong>${total.toLocaleString('es-MX')} MXN</strong>. Si iniciaste el backend en el puerto 3000 te redirige automático; aquí puedes probar el flujo:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmDemoPayment}
                      className="flex-1 bg-reloot-600 hover:bg-reloot-700 text-white text-xs font-bold py-2.5 rounded-xl"
                    >
                      Simular Pago Aprobado
                    </button>
                    <button
                      onClick={() => setCheckoutState('idle')}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {checkoutState === 'success' && (
                <div className="py-3 text-center text-emerald-700">
                  <CheckCircle2 className="w-7 h-7 mx-auto mb-1" />
                  <p className="text-xs font-bold">¡Pago aprobado! Preparando tu envío RELOOT.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
