-- ============================================
-- MULTI-TENANT PORRAS MIGRATION
-- ============================================

-- 1. Tabla de Porras (Pools/Empresas)
CREATE TABLE porras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#00ff00',
    secondary_color TEXT DEFAULT '#00ffff',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Añadir porra_id a profiles
ALTER TABLE profiles ADD COLUMN porra_id UUID REFERENCES porras(id);

-- 3. Índices para mejor rendimiento
CREATE INDEX idx_profiles_porra_id ON profiles(porra_id);
CREATE INDEX idx_porras_slug ON porras(slug);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Habilitar RLS en porras
ALTER TABLE porras ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer porras (necesario para branding en páginas públicas)
CREATE POLICY "Todos pueden leer porras" ON porras FOR SELECT USING (true);

-- Política: Solo admins pueden modificar porras
CREATE POLICY "Admins pueden gestionar porras" ON porras FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Actualizar RLS de profiles para filtrar por porra
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Los admins pueden ver/editar todos los perfiles
CREATE POLICY "Admins pueden ver todos los perfiles" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Usuarios normales solo ven perfiles de su porra
CREATE POLICY "Usuarios ven perfiles de su porra" ON profiles FOR SELECT USING (
    porra_id = (SELECT porra_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- ============================================
-- ACTUALIZAR POLÍTICAS DE PREDICTIONS
-- (Se mantienen las existentes, se añade filtro por porra para lectura)
-- ============================================

-- Eliminar políticas existentes de predictions
DROP POLICY IF EXISTS "Permitir editar pronósticos antes de 15 min" ON predictions;
DROP POLICY IF EXISTS "Ver pronósticos públicos post-bloqueo" ON predictions;

-- Los usuarios pueden crear/editar SUS PROPIOS pronósticos si:
-- - El partido aún no ha comenzado (más de 15 min)
-- - El usuario está aprobado (is_paid = TRUE)
CREATE POLICY "Usuarios editan sus propios pronósticos" ON predictions FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (SELECT is_paid FROM profiles WHERE id = auth.uid()) = TRUE
    AND (SELECT kickoff_time FROM matches WHERE id = match_id) > (NOW() + INTERVAL '15 minutes')
);

CREATE POLICY "Usuarios actualizan sus propios pronósticos" ON predictions FOR UPDATE USING (
    auth.uid() = user_id
    AND (SELECT is_paid FROM profiles WHERE id = auth.uid()) = TRUE
    AND (SELECT kickoff_time FROM matches WHERE id = match_id) > (NOW() + INTERVAL '15 minutes')
);

-- Los usuarios pueden VER predicciones de otros usuarios si:
-- - El partido ya está bloqueado (faltan ≤15 min o ya empezó)
-- - El usuario pertenece a la misma porra
CREATE POLICY "Ver pronósticos de usuarios en misma porra" ON predictions FOR SELECT USING (
    auth.uid() = user_id  -- Siempre veo mis propias predicciones
    OR (
        (SELECT kickoff_time FROM matches WHERE id = match_id) <= (NOW() + INTERVAL '15 minutes')
        AND user_id IN (
            SELECT id FROM profiles
            WHERE porra_id = (SELECT porra_id FROM profiles WHERE id = auth.uid())
        )
    )
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);