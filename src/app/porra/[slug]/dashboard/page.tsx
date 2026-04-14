import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import DashboardClient from '@/app/dashboard/DashboardClient';
import AvatarUpload from '@/components/profile/AvatarUpload';
import Link from 'next/link';

interface PorraDashboardPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PorraDashboardPage({ params }: PorraDashboardPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Obtener datos del usuario
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Obtener perfil y verificar que pertenece a esta porra
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, is_admin, display_name, nickname, avatar_url, total_points, porra_id')
        .eq('id', user.id)
        .single();

    // Verificar que el usuario pertenece a esta porra
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
                    <Link href="/" className="text-[var(--color-neon-cyan)] hover:underline">Volver al inicio</Link>
                </div>
            </main>
        );
    }

    // Verificar que el usuario pertenece a esta porra (admin puede ver todas)
    if (profile?.porra_id !== porra.id && !profile?.is_admin) {
        return (
            <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-3xl font-heading font-bold text-white mb-4">Acceso denegado</h1>
                    <p className="text-gray-400 mb-8">No tienes permiso para ver esta porra.</p>
                    <Link href="/" className="text-[var(--color-neon-cyan)] hover:underline">Volver al inicio</Link>
                </div>
            </main>
        );
    }

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.nickname || profile?.display_name || 'Usuario';
    const avatarUrl = profile?.avatar_url || null;
    const nickname = profile?.nickname || '';

    // Obtener partidos
    const { data: matches, error } = await supabase.from('matches').select(`
        *,
        home:home_team_id (name, flag_url),
        away:away_team_id (name, flag_url)
    `).order('kickoff_time', { ascending: true });

    // Obtener predicciones del usuario
    const { data: userPredictions } = await supabase
        .from('predictions')
        .select('match_id, home_goals_pred, away_goals_pred')
        .eq('user_id', user.id);

    const primaryColor = porra.primary_color || '#00ff00';
    const secondaryColor = porra.secondary_color || '#00ffff';

    return (
        <div
            className="flex h-screen overflow-hidden bg-[var(--color-background)]"
            style={{ '--porra-primary': primaryColor, '--porra-secondary': secondaryColor } as React.CSSProperties}
        >
            <Sidebar isAdmin={isAdmin} displayName={displayName} avatarUrl={avatarUrl} nickname={nickname} />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative scrollbar-hide">
                {/* Luces Neón de Fondo */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-[var(--porra-secondary,var(--color-neon-cyan))]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--porra-primary,var(--color-neon-purple))]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

                <div className="max-w-7xl mx-auto">
                    <header className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-[var(--color-surface)]/20 p-8 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32" style={{ backgroundColor: `${primaryColor}20`, borderRadius: '50%', filter: 'blur(60px)' }}></div>

                        <AvatarUpload
                            userId={user.id}
                            currentAvatarUrl={avatarUrl}
                            nickname={nickname}
                        />
                        <div className="text-center md:text-left flex-1">
                            <p className="text-xs uppercase tracking-widest font-black mb-1" style={{ color: primaryColor }}>{porra.name}</p>
                            <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter mb-2">
                                Hola, <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>{displayName}</span>
                            </h1>
                            <p className="text-gray-400 font-medium tracking-wide">¡Es hora de demostrar tus conocimientos! Tienes {profile?.total_points || 0} puntos.</p>
                        </div>
                        <div className="hidden lg:flex flex-col gap-3 ml-auto">
                            <a href="/profile" className="px-6 py-3 rounded-xl border text-sm font-bold uppercase tracking-widest text-center transition-all"
                                style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}50`, color: primaryColor }}
                            >
                                Mi Perfil
                            </a>
                            <a href={`/porra/${slug}/leaderboard`} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-center">
                                Ver Posiciones
                            </a>
                        </div>
                    </header>

                    <DashboardClient
                        matches={(matches as any) || []}
                        userPredictions={(userPredictions as any) || []}
                        displayName={displayName}
                    />
                </div>
            </main>
        </div>
    );
}