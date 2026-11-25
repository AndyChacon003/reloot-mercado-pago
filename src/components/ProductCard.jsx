import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Activity, Eye, ShoppingBag, ImageOff } from 'lucide-react';
import { fetchProductImage } from '../services/imageApi';

export default function ProductCard({ product, onAddToCart, onInspect, isInCart }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.fallbackImage);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchProductImage(product).then((res) => {
      if (active && res && res.url) {
        setImgSrc(res.url);
      }
    });
    return () => {
      active = false;
    };
  }, [product]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const badgeStyle = {
    a: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    open: 'bg-blue-50 text-reloot-600 border-blue-200',
    b: 'bg-amber-50 text-amber-700 border-amber-200'
  }[product.gradeType];

  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  return (
    <div className="card-perspective">
      <article
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-6px)`
            : 'rotateX(0deg) rotateY(0deg) translateY(0px)',
          transition: isHovered ? 'transform 120ms ease-out, box-shadow 200ms ease' : 'transform 350ms ease, box-shadow 350ms ease'
        }}
        className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:border-blue-300 group select-none"
      >
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-20 opacity-60 transition-opacity"
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(0, 87, 255, 0.16), transparent 65%)`
            }}
          />
        )}

        <div className="relative h-48 bg-slate-100 border-b border-slate-100 overflow-hidden">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-50 via-blue-100/70 to-blue-50" />
          )}

          {imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-blue-50/60">
              <ImageOff className="w-7 h-7 mb-1 text-reloot-600" />
              <span className="text-xs font-bold text-reloot-600">{product.tag}</span>
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/20 pointer-events-none" />

          <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur text-reloot-600 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-blue-100 shadow-sm">
            -{discount}% OFF
          </span>

          <span className="absolute top-3 right-3 z-10 bg-reloot-600 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm">
            {product.tag}
          </span>

          <span className="absolute bottom-3 left-3 z-10 text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900/75 backdrop-blur-xs px-2 py-0.5 rounded-md">
            {product.categoryLabel}
          </span>

          <div
            className={`absolute inset-x-2 bottom-2 z-10 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-2.5 transition-all duration-300 flex items-center justify-between text-[11px] ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>{product.telemetry.temp}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{product.telemetry.score}</span>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-2">
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border ${badgeStyle}`}>
              {product.condition}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug mb-1.5 group-hover:text-reloot-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
            {product.specs}
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="block text-[11px] text-slate-400 line-through">
                ${product.oldPrice.toLocaleString('es-MX')} MXN
              </span>
              <span className="text-lg font-extrabold text-reloot-600">
                ${product.price.toLocaleString('es-MX')} <span className="text-xs font-bold">MXN</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 relative z-20">
              <button
                onClick={() => onInspect(product)}
                title="Ver reporte técnico"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-reloot-600 hover:text-reloot-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => onAddToCart(product)}
                disabled={isInCart}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isInCart
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-reloot-600 hover:bg-reloot-700 text-white shadow-sm active:scale-95'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isInCart ? 'En carrito' : 'Agregar'}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
