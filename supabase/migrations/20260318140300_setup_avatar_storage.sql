-- Migración para configurar el storage de avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de seguridad para el bucket 'avatars'
-- 1. Permitir lectura pública
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
    END IF;
END $$;

-- 2. Permitir subida a usuarios autenticados
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'avatars' AND
            auth.role() = 'authenticated'
        );
    END IF;
END $$;

-- 3. Permitir actualización a dueños
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Owner Update' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Owner Update" ON storage.objects FOR UPDATE USING (
            bucket_id = 'avatars' AND
            auth.uid() = owner
        );
    END IF;
END $$;

-- 4. Permitir borrado a dueños
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Owner Delete' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE USING (
            bucket_id = 'avatars' AND
            auth.uid() = owner
        );
    END IF;
END $$;
