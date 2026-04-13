import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createPorra } from '@/app/actions';
import AdminPorraList from '@/components/admin/AdminPorraList';
import { Plus, Palette } from 'lucide-react';

export default async function AdminPorrasPage() {
    const supabase = await createClient();

    // Obtener todas las porras
    const { data: porras } = await supabase
        .from('porras')
        .select('*')
        .order('created_at', { ascending: false });

    const porrasList = porras || [];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Gestión de Porras</h1>
                    <p className="text-gray-400">Crea y administra las porras de cada empresa o cliente.</p>
                </div>
            </div>

            {/* Formulario para crear nueva porra */}
            <div className="bg-[var(--color-surface)]/50 border border-white/10 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-[var(--color-neon-cyan)]" />
                    Crear Nueva Porra
                </h2>

                <form action={createPorra} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Nombre</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Ej. Porra Empresa A"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Slug (URL)</label>
                        <input
                            type="text"
                            name="slug"
                            required
                            placeholder="empresa-a"
                            pattern="[a-z0-9-]+"
                            title="Solo letras minúsculas, números y guiones"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono focus:border-[var(--color-neon-cyan)] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">URL Logo</label>
                        <input
                            type="url"
                            name="logoUrl"
                            placeholder="https://..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Color Primario</label>
                        <input
                            type="color"
                            name="primaryColor"
                            defaultValue="#00ff00"
                            className="w-full h-11 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Color Secundario</label>
                        <input
                            type="color"
                            name="secondaryColor"
                            defaultValue="#00ffff"
                            className="w-full h-11 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-5">
                        <button
                            type="submit"
                            className="w-full lg:w-auto px-8 py-3 rounded-lg bg-[var(--color-neon-cyan)] text-black font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                        >
                            Crear Porra
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de porras existentes */}
            {porrasList.length > 0 ? (
                <AdminPorraList porras={porrasList} />
            ) : (
                <div className="bg-[var(--color-surface)]/30 border border-white/5 rounded-xl p-12 text-center">
                    <Palette size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-heading font-bold text-white mb-2">No hay porras creadas</h3>
                    <p className="text-gray-500">Crea tu primera porra usando el formulario de arriba.</p>
                </div>
            )}

            {/* Info sobre cómo acceder */}
            <div className="mt-8 p-4 bg-[var(--color-surface)]/30 border border-white/5 rounded-xl">
                <h3 className="text-sm font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">URLs de Acceso</h3>
                <p className="text-xs text-gray-500">
                    Cada porra tiene su propia URL: <code className="bg-black/50 px-2 py-1 rounded text-[var(--color-neon-cyan)]">/porra/[slug]</code>
                </p>
            </div>
        </div>
    );
}