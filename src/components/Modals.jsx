import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, CheckCircle2, Loader2, ShoppingCart, ShieldCheck } from 'lucide-react';

export function InspectModal({ product, onClose, onAddToCart, isInCart }) {
  if (!product) return null;

  const formatPrice = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(amount);

  const telemetryObj =
    product.telemetry && typeof product.telemetry === 'object' ? product.telemetry : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs" />
      <div className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-reloot-600 dark:text-blue-400">
              {product.categoryLabel}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-6">
          <div className="h-56 sm:h-full min-h-[200px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={product.image || product.fallbackImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
                <span>{product.condition || 'Verificado RELOOT'}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.specs}
              </p>

              {telemetryObj && (
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs space-y-1">
                  {telemetryObj.temp && (
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Temperatura:</strong>{' '}
                      <span className="text-slate-600 dark:text-slate-300">{telemetryObj.temp}</span>
                    </div>
                  )}
                  {telemetryObj.score && (
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Benchmark / Salud:</strong>{' '}
                      <span className="text-slate-600 dark:text-slate-300">{telemetryObj.score}</span>
                    </div>
                  )}
                  {telemetryObj.warranty && (
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Garantía:</strong>{' '}
                      <span className="text-slate-600 dark:text-slate-300">{telemetryObj.warranty}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                {product.oldPrice && (
                  <span className="block text-xs text-slate-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="inline-flex items-center gap-2 bg-reloot-600 hover:bg-reloot-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isInCart ? 'Ver en carrito' : 'Agregar al carrito'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SellModal({ isOpen, onClose, token }) {
  const [category, setCategory] = useState('Componente de PC (GPU, CPU, RAM, Motherboard)');
  const [model, setModel] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [contact, setContact] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe pesar máximo 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result || ''));
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category,
          model,
          expectedPrice,
          contact,
          imageData: imagePreview || null
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No se pudo enviar la cotización.');
        setSubmitting(false);
        return;
      }

      setSuccessMsg('¡Listo! Tu equipo y su foto se registraron para revisión.');
      setModel('');
      setExpectedPrice('');
      setContact('');
      setImagePreview('');
      setFileName('');
      setSubmitting(false);
    } catch {
      setError('Error de red al enviar tu cotización.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs" />
      <div className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Vende tu equipo en RELOOT
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {successMsg && (
            <div className="flex items-start gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="text-xs font-semibold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl p-3">
              {error}
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-reloot-600"
            >
              <option value="Componente de PC (GPU, CPU, RAM, Motherboard)">
                Componente de PC (GPU, CPU, RAM, Motherboard)
              </option>
              <option value="Consola (PS5, PS4, Xbox, Switch)">
                Consola (PS5, PS4, Xbox, Switch)
              </option>
              <option value="Teléfono / Smartphone">Teléfono / Smartphone</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Modelo exacto
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ej. RTX 3080 Ti EVGA o iPhone 14 Pro 256GB"
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-reloot-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Precio esperado (MXN)
            </label>
            <input
              type="number"
              required
              min="1"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              placeholder="6500"
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-reloot-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              WhatsApp o Correo
            </label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="443 000 0000 / correo@ejemplo.com"
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-reloot-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Foto del equipo
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-reloot-600 rounded-xl p-4 cursor-pointer bg-slate-50 dark:bg-slate-800/60 transition-colors">
              {imagePreview ? (
                <div className="w-full space-y-2 text-center">
                  <img
                    src={imagePreview}
                    alt="Vista previa del equipo"
                    className="w-full h-36 object-cover rounded-lg"
                  />
                  <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                    {fileName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-reloot-600 dark:text-blue-400">
                    <ImageIcon className="w-3.5 h-3.5" /> Cambiar imagen
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <Upload className="w-6 h-6 text-reloot-600 dark:text-blue-400 mx-auto" />
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Subir foto del equipo
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    PNG, JPG o WEBP (máx. 2 MB)
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-reloot-600 hover:bg-reloot-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Enviar para cotización</span>
          </button>
        </form>
      </div>
    </div>
  );
}