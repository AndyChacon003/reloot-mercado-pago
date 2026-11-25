import React, { useState } from 'react';
import {
  X,
  Trash2,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  CreditCard,
  Landmark,
  Store,
  Lock
} from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cart, onRemove, onClearCart }) {
  const [step, setStep] = useState('cart'); // 'cart' | 'mp-form' | 'processing' | 'approved'
  const [method, setMethod] = useState('card'); // 'card' | 'spei' | 'oxxo'
  const [installments, setInstallments] = useState(1);
  const [cardNumber, setCardNumber] = useState('4509 9535 6623 3704');
  const [cardHolder, setCardHolder] = useState('COMPRADOR RELOOT');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('123');
  const [orderFolio, setOrderFolio] = useState('');

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleOpenMpSimulator = () => {
    setStep('mp-form');
  };

  const handleConfirmSimulatedPayment = (e) => {
    e.preventDefault();
    setStep('processing');
    const folio = `MP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setOrderFolio(folio);

    setTimeout(() => {
      setStep('approved');
    }, 1500);
  };

  const handleFinishOrder = () => {
    onClearCart();
    setStep('cart');
    onClose();
  };

  const handleCloseDrawer = () => {
    if (step === 'approved') {
      handleFinishOrder();
      return;
    }
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        onClick={handleCloseDrawer}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <aside className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${step === 'mp-form' || step === 'processing' || step === 'approved'
              ? 'bg-mp text-white border-mp-dark'
              : 'border-slate-200 dark:border-slate-800'
            }`}
        >
          <div>
            {step === 'cart' ? (
              <>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Tu Carrito RELOOT
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Piezas únicas verificadas
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-lg">mercadopago</span>
                  <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                    Simulación
                  </span>
                </div>
                <p className="text-xs text-sky-100">Checkout Pro · Compra Protegida</p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleCloseDrawer}
            className={`p-2 rounded-lg transition-colors ${step === 'cart'
                ? 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vista 1: Lista del carrito */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Tu carrito está vacío
                  </p>
                  <p className="text-xs max-w-xs">
                    Agrega GPUs, procesadores, consolas o smartphones seminuevos desde el catálogo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                    >
                      <img
                        src={item.image || item.fallbackImage}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase text-reloot-600 dark:text-blue-400">
                          {item.condition}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <span className="text-sm font-extrabold text-reloot-600 dark:text-blue-400">
                          ${item.price.toLocaleString('es-MX')} MXN
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="p-2 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal ({cart.length} artículos)</span>
                    <span>${total.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Envío Asegurado</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">GRATIS</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Total</span>
                    <span>${total.toLocaleString('es-MX')} MXN</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-mp text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                      mercadopago
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-mp" /> Checkout Pro
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Paga con tarjeta (hasta 12 MSI), transferencia SPEI o efectivo en OXXO con protección al comprador.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenMpSimulator}
                    className="w-full bg-mp hover:bg-mp-dark text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    Pagar con Mercado Pago
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Vista 2: Simulador Visual de Mercado Pago */}
        {step === 'mp-form' && (
          <form onSubmit={handleConfirmSimulatedPayment} className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-sky-700 dark:text-sky-300">
                  Total a pagar en RELOOT
                </span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${total.toLocaleString('es-MX')} MXN
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="text-xs font-bold text-mp hover:underline"
              >
                Volver
              </button>
            </div>

            {/* Selector de método */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Elige cómo pagar
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${method === 'card'
                      ? 'border-mp bg-sky-50 dark:bg-sky-950/50 text-mp'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Tarjeta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('spei')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${method === 'spei'
                      ? 'border-mp bg-sky-50 dark:bg-sky-950/50 text-mp'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  <Landmark className="w-5 h-5" />
                  <span>SPEI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('oxxo')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${method === 'oxxo'
                      ? 'border-mp bg-sky-50 dark:bg-sky-950/50 text-mp'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  <Store className="w-5 h-5" />
                  <span>OXXO</span>
                </button>
              </div>
            </div>

            {method === 'card' && (
              <div className="space-y-3 text-sm">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-sky-900 text-white p-4 shadow-md">
                  <div className="flex justify-between items-center text-[11px] text-sky-200 mb-5">
                    <span>TARJETA DE PRUEBA</span>
                    <span className="font-bold">VISA</span>
                  </div>
                  <p className="font-mono text-base tracking-widest mb-4">{cardNumber || '•••• •••• •••• ••••'}</p>
                  <div className="flex justify-between text-[11px] uppercase text-slate-200">
                    <span>{cardHolder || 'TITULAR'}</span>
                    <span>{cardExpiry || 'MM/AA'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-mp"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Nombre en la tarjeta
                  </label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-mp"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-mp"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-mp"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Mensualidades sin intereses
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-mp"
                  >
                    <option value={1}>1 pago de ${total.toLocaleString('es-MX')} MXN</option>
                    <option value={3}>3 MSI de ${Math.round(total / 3).toLocaleString('es-MX')} MXN</option>
                    <option value={6}>6 MSI de ${Math.round(total / 6).toLocaleString('es-MX')} MXN</option>
                    <option value={12}>12 MSI de ${Math.round(total / 12).toLocaleString('es-MX')} MXN</option>
                  </select>
                </div>
              </div>
            )}

            {method === 'spei' && (
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">
                  Transferencia electrónica SPEI (Acreditación inmediata)
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  CLABE interbancaria simulada: <strong className="font-mono">646180111812345678</strong>
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Beneficiario: Mercado Pago · RELOOT MX
                </p>
              </div>
            )}

            {method === 'oxxo' && (
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">
                  Pago en efectivo en tiendas OXXO
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Referencia simulada: <strong className="font-mono">9800 4512 8890 3310</strong>
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Al confirmar se generará tu comprobante digital de pedido.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-mp hover:bg-mp-dark text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Pagar ${total.toLocaleString('es-MX')} MXN</span>
            </button>
          </form>
        )}

        {/* Vista 3: Procesando */}
        {step === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="w-12 h-12 text-mp animate-spin mb-4" />
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1">
              Procesando tu pago...
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Validando operación segura con Mercado Pago Checkout Pro.
            </p>
          </div>
        )}

        {/* Vista 4: Pago Aprobado */}
        {step === 'approved' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                ¡Pago Aprobado!
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Gracias por tu compra en RELOOT
              </h4>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Operación Mercado Pago:</span>
                <strong className="font-mono text-slate-900 dark:text-white">{orderFolio}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Método:</span>
                <strong className="uppercase text-slate-900 dark:text-white">
                  {method === 'card' ? `Tarjeta (${installments}x)` : method}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total pagado:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  ${total.toLocaleString('es-MX')} MXN
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishOrder}
              className="w-full bg-reloot-600 hover:bg-reloot-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Finalizar y volver a la tienda
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}