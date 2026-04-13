"use client";

import React, { useState } from 'react';
import { registerUser } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function PorraRegisterForm({ porraId, porraSlug }: { porraId: string, porraSlug: string }) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        // El id de la porra ya está incluido como un input oculto
        const result = await registerUser(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => router.push('/pending-approval'), 2000);
        }
    };

    if (success) {
        return (
            <div className="text-center text-[var(--porra-primary)] mb-4 font-bold">
                ¡Registro exitoso! Tu cuenta está pendiente de aprobación. Redirigiendo...
            </div>
        );
    }

    return (
        <form onSubmit={handleRegister} className="flex flex-col gap-4 font-body">
            {/* Campo oculto con el ID de la porra */}
            <input type="hidden" name="porraId" value={porraId} />

            <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Nombre (Display)</label>
                <input
                    type="text"
                    name="displayName"
                    required
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--porra-secondary)] focus:outline-none transition-colors"
                    placeholder="Ej. Juan Pérez"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Apodo (Usuario)</label>
                <input
                    type="text"
                    name="nickname"
                    required
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--porra-secondary)] focus:outline-none transition-colors"
                    placeholder="Ej. jperez99"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Celular (Opcional)</label>
                <input
                    type="tel"
                    name="phone"
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--porra-secondary)] focus:outline-none transition-colors"
                    placeholder="Ej. +57 300 000 0000"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">URL de la Foto (Opcional)</label>
                <input
                    type="url"
                    name="avatarUrl"
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--porra-secondary)] focus:outline-none transition-colors"
                    placeholder="https://link-a-tu-foto.com/foto.jpg"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Correo Electrónico (Oculto en Login)</label>
                <input
                    type="email"
                    name="email"
                    required
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--porra-secondary)] focus:outline-none transition-colors"
                    placeholder="tu@correo.com"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--porra-secondary)] focus:outline-none transition-colors"
                    placeholder="••••••••"
                />
            </div>

            {error && <p className="text-[var(--color-neon-red)] text-sm">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full py-3 rounded-lg text-black font-bold font-heading hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--porra-primary)', boxShadow: '0 0 10px var(--porra-primary)' }}
            >
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
    );
}
