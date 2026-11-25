import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [pendingVerifyEmail, setPendingVerifyEmail] = useState('');
    const [fallbackVerifyUrl, setFallbackVerifyUrl] = useState('');

    if (!isOpen) return null;

    const handleResend = async (targetEmail) => {
        const emailToUse = (targetEmail || pendingVerifyEmail || email).trim();
        if (!emailToUse) {
            setError('Escribe tu correo para reenviar la verificación');
            return;
        }

        setResending(true);
        setError('');
        setInfoMessage('');
        setFallbackVerifyUrl('');

        try {
            const res = await fetch('/api/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToUse })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'No se pudo reenviar el correo');
            } else {
                setInfoMessage(data.message || 'Correo de verificación enviado.');
                if (data.verifyUrl) setFallbackVerifyUrl(data.verifyUrl);
            }
        } catch {
            setError('Error de red al reenviar el correo');
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInfoMessage('');
        setFallbackVerifyUrl('');

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, name, email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'No se pudo completar la operación');
                if (data.requiresVerification) {
                    setPendingVerifyEmail(data.email || email);
                }
                setLoading(false);
                return;
            }

            if (data.requiresVerification) {
                setPendingVerifyEmail(data.email || email);
                setInfoMessage(data.message || 'Revisa tu correo para verificar tu cuenta.');
                if (data.verifyUrl) setFallbackVerifyUrl(data.verifyUrl);
                setName('');
                setPassword('');
                setLoading(false);
                return;
            }

            onAuthSuccess(data.token, data.user);
            setName('');
            setEmail('');
            setPassword('');
            setPendingVerifyEmail('');
            setLoading(false);
            onClose();
        } catch {
            setError('Error de red al conectar con el servidor');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={onClose} className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs" />
            <div className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="bg-reloot-600 text-white p-5 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                            Cuenta RELOOT · Neon PostgreSQL
                        </span>
                        <h3 className="text-lg font-extrabold">
                            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta nueva'}
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-5">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError('');
                                setInfoMessage('');
                            }}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${mode === 'login'
                                    ? 'bg-white dark:bg-slate-900 text-reloot-600 dark:text-blue-400 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            Iniciar sesión
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('register');
                                setError('');
                                setInfoMessage('');
                            }}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${mode === 'register'
                                    ? 'bg-white dark:bg-slate-900 text-reloot-600 dark:text-blue-400 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {infoMessage && (
                        <div className="mb-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 space-y-2">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{infoMessage}</span>
                            </div>
                            {fallbackVerifyUrl && (
                                <div className="pt-1 break-all">
                                    <a
                                        href={fallbackVerifyUrl}
                                        className="underline font-bold text-reloot-600 dark:text-blue-400"
                                    >
                                        Abrir enlace de verificación directo
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 text-xs font-semibold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl p-3 space-y-2">
                            <div>{error}</div>
                            {(pendingVerifyEmail || error.toLowerCase().includes('verificar')) && (
                                <button
                                    type="button"
                                    onClick={() => handleResend(pendingVerifyEmail || email)}
                                    disabled={resending}
                                    className="inline-flex items-center gap-1.5 text-reloot-600 dark:text-blue-400 hover:underline font-bold"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                                    <span>{resending ? 'Enviando...' : 'Reenviar correo de verificación'}</span>
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
                        {mode === 'register' && (
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Nombre
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Tu nombre"
                                        className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-reloot-600"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-reloot-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-reloot-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-reloot-600 hover:bg-reloot-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{mode === 'login' ? 'Entrar a RELOOT' : 'Crear cuenta'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}