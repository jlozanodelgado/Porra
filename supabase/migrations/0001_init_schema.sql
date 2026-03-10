-- 1. Tabla de Perfiles (Se sincroniza con auth.users de Supabase)  
CREATE TABLE profiles (  
    id UUID REFERENCES auth.users(id) PRIMARY KEY,  
    display_name TEXT NOT NULL,  
    is_paid BOOLEAN DEFAULT FALSE,  
    is_admin BOOLEAN DEFAULT FALSE,  
    total_points INTEGER DEFAULT 0,  
    created_at TIMESTAMPTZ DEFAULT NOW()  
);

-- 2. Tabla de Equipos  
CREATE TABLE teams (  
    id SERIAL PRIMARY KEY,  
    name TEXT NOT NULL,  
    flag_url TEXT,  
    group_name VARCHAR(1) -- A, B, C, etc.  
);

-- 3. Tabla de Partidos  
CREATE TABLE matches (  
    id SERIAL PRIMARY KEY,  
    home_team_id INTEGER REFERENCES teams(id),  
    away_team_id INTEGER REFERENCES teams(id),  
    kickoff_time TIMESTAMPTZ NOT NULL, -- Hora en UTC, se convierte en el cliente a UTC-5  
    home_goals_real INTEGER,  
    away_goals_real INTEGER,  
    is_playoff BOOLEAN DEFAULT FALSE,  
    status TEXT DEFAULT 'pending' -- pending, finished  
);

-- 4. Tabla de Pronósticos  
CREATE TABLE predictions (  
    id SERIAL PRIMARY KEY,  
    user_id UUID REFERENCES profiles(id) NOT NULL,  
    match_id INTEGER REFERENCES matches(id) NOT NULL,  
    home_goals_pred INTEGER NOT NULL,  
    away_goals_pred INTEGER NOT NULL,  
    points_earned INTEGER DEFAULT 0,  
    updated_at TIMESTAMPTZ DEFAULT NOW(),  
    UNIQUE(user_id, match_id) -- Un usuario solo puede tener 1 pronóstico por partido  
);

-- 5. REGLAS DE SEGURIDAD (Row Level Security - RLS en Supabase)  
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden insertar/actualizar sus propios pronósticos  
-- SI el usuario está pagado Y faltan más de 15 minutos para el partido.  
CREATE POLICY "Permitir editar pronósticos antes de 15 min" ON predictions  
FOR ALL USING (  
    auth.uid() = user_id   
    AND (SELECT is_paid FROM profiles WHERE id = auth.uid()) = TRUE  
    AND (SELECT kickoff_time FROM matches WHERE id = match_id) > (NOW() + INTERVAL '15 minutes')  
);

-- Política: Todos pueden leer pronósticos de los demás SOLO si el partido ya se bloqueó  
CREATE POLICY "Ver pronósticos públicos post-bloqueo" ON predictions  
FOR SELECT USING (  
    (SELECT kickoff_time FROM matches WHERE id = match_id) <= (NOW() + INTERVAL '15 minutes')  
    OR auth.uid() = user_id -- Siempre puedo ver mis propios pronósticos  
);

-- Función que se ejecuta cuando se actualiza un partido  
CREATE OR REPLACE FUNCTION update_prediction_points()  
RETURNS TRIGGER AS $$  
BEGIN  
  -- Si el admin acaba de poner el resultado final  
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN  
    -- Placeholder logic to call external or backend endpoints later, or complex points calculations.
  END IF;  
  RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_points  
AFTER UPDATE ON matches  
FOR EACH ROW EXECUTE FUNCTION update_prediction_points();
