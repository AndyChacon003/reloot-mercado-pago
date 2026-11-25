import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, Eye, Activity, ShieldCheck } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onInspect, isInCart }) {
  const [imgSrc, setImgSrc] = useState(product.image || product.fallbackImage);

  useEffect(() => {
    setImgSrc(product.image || product.fallbackImage);
  }, [product.image, product.fallbackImage]);
  const formatPrice = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(amount);

  const renderTelemetry = () => {
    if (!product.telemetry) return null;
    if (typeof product.telemetry === 'string') {
      return <p className="text-[11px] text-emerald-300 font-semibold">{product.telemetry}</p>;
    }
    const { temp, score, warranty } = product.telemetry;
    const parts = [
      temp ? `Temp: ${temp}` : null,
      score ? `Score: ${score}` : null,
      warranty ? `Garantía: ${warranty}` : null
    ].filter(Boolean);

    if (parts.length === 0) return null;

    return (
      <p className="text-[11px] text-emerald-300 font-semibold">
        {parts.join(' · ')}
      </p>
    );
  };

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-reloot-600/50 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => {
              if (product.fallbackImage && imgSrc !== product.fallbackImage) {
                setImgSrc(product.fallbackImage);
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {product.discount && (
              <span className="bg-reloot-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs">
                {product.discount}
              </span>
            )}
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
              {product.categoryLabel}
            </span>
          </div>

          <div className="absolute inset-0 bg-slate-950/90 text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5" />
                <span>Telemetría y Diagnóstico</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed mb-2">
                {product.specs}
              </p>
              {renderTelemetry()}
            </div>

            <button
              type="button"
              onClick={() => onInspect(product)}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold py-2 rounded-xl transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver ficha técnica</span>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-1.5">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {product.condition || 'Verificado'}
            </span>
            {product.stock !== undefined && (
              <span className="text-slate-400 dark:text-slate-500 font-semibold">
                Stock: {product.stock}
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 mb-1">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">
            {product.specs}
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div>
          {product.oldPrice && (
            <span className="block text-[11px] text-slate-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onInspect(product)}
            title="Inspeccionar equipo"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-reloot-600 hover:text-reloot-600 dark:hover:text-blue-400 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${isInCart
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-reloot-600 hover:bg-reloot-700 text-white'
              }`}
          >
            {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            <span>{isInCart ? 'En carrito' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}