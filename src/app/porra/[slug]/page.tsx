import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface PorraPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PorraPage({ params }: PorraPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Obtener datos de la porra por slug
    const { data: porra } = await supabase
        .from('porras')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!porra) {
        return (
            <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-3xl font-heading font-bold text-white mb-4">Porra no encontrada</h1>
                    <p className="text-gray-400 mb-8">La porra que buscas no existe o no está disponible.</p>
                    <Link href="/" className="text-[var(--color-neon-cyan)] hover:underline">
                        Volver al inicio
                    </Link>
                </div>
            </main>
        );
    }

    // Establecer colores dinámicos como CSS variables
    const primaryColor = porra.primary_color || '#00ff00';
    const secondaryColor = porra.secondary_color || '#00ffff';

    return (
        <main
            className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden"
            style={{
                '--porra-primary': primaryColor,
                '--porra-secondary': secondaryColor,
            } as React.CSSProperties}
        >
            {/* Background con gradiente de la porra */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 30% 30%, ${primaryColor}15 0%, transparent 50%),
                                radial-gradient(circle at 70% 70%, ${secondaryColor}10 0%, transparent 50%)`,
                }}
            />

            {/* Logo de la porra */}
            {porra.logo_url && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2">
                    <img
                        src={porra.logo_url}
                        alt={porra.name}
                        className="h-20 w-auto object-contain"
                    />
                </div>
            )}

            <div className="w-full max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10 mt-20">
                <div className="text-center mb-8">
                    <h1
                        className="text-3xl font-heading font-bold mb-2"
                        style={{ color: primaryColor }}
                    >
                        {porra.name}
                    </h1>
                    <p className="text-gray-400 font-body text-sm">
                        Participa en los pronósticos del Mundial 2026
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        href={`/porra/${slug}/login`}
                        className="w-full py-3 rounded-lg text-center font-bold font-heading transition-all hover:brightness-110 shadow-[0_0_10px_var(--porra-primary)]"
                        style={{ backgroundColor: primaryColor, color: '#000' }}
                    >
                        Iniciar Sesión
                    </Link>
                    <Link
                        href={`/porra/${slug}/register`}
                        className="w-full py-3 rounded-lg text-center font-bold font-heading transition-all border-2"
                        style={{
                            borderColor: secondaryColor,
                            color: secondaryColor,
                        }}
                    >
                        Registrarse
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <Link
                        href="/"
                        className="text-gray-500 hover:text-[var(--color-neon-cyan)] text-sm transition-colors"
                    >
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </main>
    );
}