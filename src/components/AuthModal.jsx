import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2 } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, name, email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'No se pudo completar la operación');
                setLoading(false);
                return;
            }

            onAuthSuccess(data.token, data.user);
            setName('');
            setEmail('');
            setPassword('');
            setLoading(false);
            onClose();
        } catch {
            setError('Error de red al conectar con el servidor');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={onClose} className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs" />
            <div className="relative z-10 bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
                <div className="bg-reloot-600 text-white p-5 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                            Cuenta RELOOT · Neon PostgreSQL
                        </span>
                        <h3 className="text-lg font-extrabold">
                            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta nueva'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-5">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError('');
                            }}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${mode === 'login' ? 'bg-white text-reloot-600 shadow-xs' : 'text-slate-600'
                                }`}
                        >
                            Iniciar sesión
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('register');
                                setError('');
                            }}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${mode === 'register' ? 'bg-white text-reloot-600 shadow-xs' : 'text-slate-600'
                                }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
                        {mode === 'register' && (
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nombre</label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Tu nombre"
                                        className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-reloot-600"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-reloot-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-reloot-600"
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