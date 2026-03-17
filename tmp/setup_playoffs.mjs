import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gecehipdmxijoteebhgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlY2VoaXBkbXhpam90ZWViaGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDc5MjYsImV4cCI6MjA4ODIyMzkyNn0.za_3vE6GjC32PuLc9I-ARI4DjexLgqdQko4aEQu8Atg';
const supabase = createClient(supabaseUrl, supabaseKey);

const teamsToCreate = [
    { name: 'Bolivia', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/BOL', group_name: 'R' },
    { name: 'Surinam', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/SUR', group_name: 'R' },
    { name: 'Nueva Caledonia', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/NCL', group_name: 'R' },
    { name: 'Jamaica', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/JAM', group_name: 'R' },
    { name: 'Irak', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/IRQ', group_name: 'R' },
    { name: 'RD Congo', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/COD', group_name: 'R' },
];

async function setup() {
    console.log('--- Gestionando Equipos ---');
    const teamMap = {};

    for (const team of teamsToCreate) {
        // Verificar si existe
        const { data: existing } = await supabase.from('teams').select('id').eq('name', team.name).single();
        
        if (existing) {
            console.log(`Equipo ${team.name} ya existe (ID: ${existing.id}).`);
            teamMap[team.name] = existing.id;
        } else {
            const { data, error } = await supabase.from('teams').insert(team).select().single();
            if (error) {
                console.error(`Error insertando ${team.name}:`, error);
            } else {
                console.log(`Equipo ${team.name} creado (ID: ${data.id}).`);
                teamMap[team.name] = data.id;
            }
        }
    }

    console.log('\n--- Actualizando Partidos de Semifinales ---');
    
    // Actualizar partido 6 (Bolivia vs Surinam)
    const { error: err6 } = await supabase.from('matches').update({
        home_team_id: teamMap['Bolivia'],
        away_team_id: teamMap['Surinam']
    }).eq('id', 6);

    if (err6) console.error('Error actualizando partido 6:', err6);
    else console.log('Partido 6 (Bolivia vs Surinam) actualizado.');

    // Actualizar partido 7 (Nueva Caledonia vs Jamaica)
    const { error: err7 } = await supabase.from('matches').update({
        home_team_id: teamMap['Nueva Caledonia'],
        away_team_id: teamMap['Jamaica']
    }).eq('id', 7);

    if (err7) console.error('Error actualizando partido 7:', err7);
    else console.log('Partido 7 (Nueva Caledonia vs Jamaica) actualizado.');
}

setup();
