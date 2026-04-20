import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import { redirect } from 'next/navigation';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { User, Mail, Calendar, Award, CreditCard, ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, porras:porra_id (name)')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.nickname || profile?.display_name || 'Usuario';
    const avatarUrl = profile?.avatar_url || null;
    const nickname = profile?.nickname || '';
    const porraName = (profile?.porras as any)?.name;

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar
                isAdmin={isAdmin}
                displayName={displayName}
                avatarUrl={avatarUrl}
                nickname={nickname}
                porraName={porraName}
            />
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                {/* Luces Neón de Fondo */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-[var(--color-neon-cyan)]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-neon-purple)]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

                <div className="max-w-4xl mx-auto">
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <Link href="/dashboard" className="text-[var(--color-neon-cyan)] hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-4">
                                <ArrowLeft size={16} />
                                Volver al Dashboard
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter">
                                Mi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-green)] to-[var(--color-neon-cyan)]">Perfil</span>
                            </h1>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Tarjeta de Avatar */}
                        <div className="bg-[var(--color-surface)]/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center">
                            <AvatarUpload
                                userId={user.id}
                                currentAvatarUrl={avatarUrl}
                                nickname={nickname}
                            />
                            <div className="mt-6 text-center">
                                <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                                <p className="text-[var(--color-neon-cyan)] text-xs font-black uppercase tracking-widest">
                                    {isAdmin ? 'Administrador' : 'Participante'}
                                </p>
                            </div>
                        </div>

                        {/* Información del Usuario */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-[var(--color-surface)]/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                                    <User size={20} className="text-[var(--color-neon-cyan)]" />
                                    Datos Personales
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1">Nombre / Apodo</label>
                                        <p className="text-white font-medium">{displayName}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1">Correo Electrónico</label>
                                        <div className="flex items-center gap-2 text-white font-medium overflow-hidden">
                                            <Mail size={14} className="text-gray-500 shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1">Miembro desde</label>
                                        <div className="flex items-center gap-2 text-white font-medium">
                                            <Calendar size={14} className="text-gray-500" />
                                            <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '---'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1">Estado de Pago</label>
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} className={profile?.is_paid ? 'text-[var(--color-neon-green)]' : 'text-[var(--color-neon-red)]'} />
                                            <span className={`font-bold uppercase text-xs ${profile?.is_paid ? 'text-[var(--color-neon-green)]' : 'text-[var(--color-neon-red)]'}`}>
                                                {profile?.is_paid ? 'Cuenta Activa' : 'Pago Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1">Tu Porra</label>
                                        <div className="flex items-center gap-2 text-[var(--color-neon-cyan)] font-bold uppercase tracking-wider text-sm">
                                            <Trophy size={14} />
                                            <span>{porraName || 'Global'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas Rápidas */}
                            <div className="bg-gradient-to-br from-[var(--color-surface)]/40 to-[var(--color-neon-cyan)]/5 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                                    <Award size={20} className="text-[var(--color-neon-cyan)]" />
                                    Rendimiento
                                </h3>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black text-white leading-none">
                                        {profile?.total_points || 0}
                                    </span>
                                    <span className="text-[var(--color-neon-cyan)] font-bold uppercase tracking-widest mb-1">Puntos Totales</span>
                                </div>
                                <p className="text-gray-500 text-xs mt-4">Sigue haciendo tus pronósticos para subir en la tabla de posiciones.</p>
                            </div>

                            {/* Cambio de Contraseña */}
                            <ChangePasswordForm />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
