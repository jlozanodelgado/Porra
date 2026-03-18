"use client";

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2, UploadCloud, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
    userId: string;
    currentAvatarUrl: string | null;
    nickname: string;
}

const MAX_FILE_SIZE = 120 * 1024; // 120KB

export default function AvatarUpload({ userId, currentAvatarUrl, nickname }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // 1. Validar tamaño (120KB)
        if (file.size > MAX_FILE_SIZE) {
            setError('La imagen debe pesar menos de 120 KB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // 2. Validar tipo
        if (!file.type.startsWith('image/')) {
            setError('El archivo debe ser una imagen.');
            return;
        }

        try {
            setUploading(true);

            // 3. Subir a Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 4. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 5. Actualizar perfil en DB
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId);

            if (updateError) throw updateError;

            router.refresh();
        } catch (err: any) {
            console.error('Error al subir avatar:', err);
            setError(err.message || 'Error al subir la imagen. Verifica la configuración de Supabase Storage.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--color-neon-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.3)] bg-[var(--color-surface)]">
                    {currentAvatarUrl ? (
                        <img 
                            src={currentAvatarUrl} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname)}`} 
                            alt="Default Avatar" 
                            className="w-full h-full object-cover opacity-60"
                        />
                    )}
                </div>
                
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full disabled:cursor-not-allowed"
                    title="Cambiar foto"
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-white" />
                    ) : (
                        <Camera size={24} className="text-white" />
                    )}
                </button>
            </div>

            <div className="text-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs text-[var(--color-neon-cyan)] hover:text-white transition-colors flex items-center gap-1 font-semibold uppercase tracking-wider"
                >
                    <UploadCloud size={14} />
                    {currentAvatarUrl ? 'Cambiar Foto' : 'Subir Foto'}
                </button>
                <p className="text-[10px] text-gray-500 mt-1">Máx 120KB</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-[var(--color-neon-red)] text-xs bg-[var(--color-neon-red)]/10 px-3 py-2 rounded-xl border border-[var(--color-neon-red)]/20">
                    <X size={14} className="cursor-pointer" onClick={() => setError(null)} />
                    {error}
                </div>
            )}
        </div>
    );
}
