-- Insertar porra principal por defecto si no existe
INSERT INTO porras (name, slug, prize_config, primary_color, secondary_color)
VALUES (
    'Porra Principal', 
    'principal', 
    '[]'::jsonb, 
    '#39FF14', 
    '#00FFFF'
)
ON CONFLICT (slug) DO NOTHING;
