-- Añadir columna prize_config a la tabla porras
ALTER TABLE porras ADD COLUMN IF NOT EXISTS prize_config JSONB DEFAULT '[]'::jsonb;

-- Comentario para documentación
COMMENT ON COLUMN porras.prize_config IS 'Configuración dinámica de premios: array de objetos {label, value, description}';
