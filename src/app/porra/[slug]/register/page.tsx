import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PorraRegisterForm from './PorraRegisterForm';

interface PorraRegisterPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PorraRegisterPage({ params }: PorraRegisterPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Obtener el ID de la porra por el slug
    const { data: porra } = await supabase
        .from('porras')
        .select('id, name, primary_color, secondary_color')
        .eq('slug', slug)
        .single();

    if (!porra) {
        return (
            <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-3xl font-heading font-bold text-white mb-4">Porra no encontrada</h1>
                    <p className="text-gray-400 mb-8">La porra que buscas no existe o no está disponible.</p>
                    <a href="/" className="text-[var(--color-neon-cyan)] hover:underline">Volver al inicio</a>
                </div>
            </main>
        );
    }

    const primaryColor = porra.primary_color || '#00ff00';
    const secondaryColor = porra.secondary_color || '#00ffff';

    return (
        <main
            className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden"
            style={{ '--porra-primary': primaryColor, '--porra-secondary': secondaryColor } as React.CSSProperties}
        >
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[var(--porra-secondary)]/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Crear Cuenta</h1>
                    <p className="text-gray-400 font-body text-sm">Únete a {porra.name} para los pronósticos del Mundial 2026.</p>
                </div>

                <PorraRegisterForm porraId={porra.id} porraSlug={slug} />

                <p className="mt-6 text-center text-sm text-gray-400">
                    ¿Ya tienes cuenta? <a href={`/porra/${slug}/login`} className="text-[var(--porra-secondary)] hover:underline">Inicia sesión</a>
                </p>

                <div className="mt-4 pt-4 border-t border-white/10">
                    <a href={`/porra/${slug}`} className="text-gray-500 hover:text-[var(--porra-secondary)] text-sm transition-colors">
                        ← Volver a la porra
                    </a>
                </div>
            </div>
        </main>
    );
}