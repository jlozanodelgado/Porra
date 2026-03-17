import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gecehipdmxijoteebhgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlY2VoaXBkbXhpam90ZWViaGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDc5MjYsImV4cCI6MjA4ODIyMzkyNn0.za_3vE6GjC32PuLc9I-ARI4DjexLgqdQko4aEQu8Atg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
    console.log('--- Actualizando Semifinales a Estatus "Grupo" (is_playoff: false) ---');
    
    // Partidos 6 al 15 son las semifinales creadas anteriormente
    const { error: updateError } = await supabase
        .from('matches')
        .update({ is_playoff: false })
        .in('id', [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

    if (updateError) {
        console.error('Error actualizando semifinales:', updateError);
    } else {
        console.log('Semifinales actualizadas a estatus de grupo correctamente.');
    }

    console.log('\n--- Buscando equipos para las Finales ---');
    const { data: teams } = await supabase.from('teams').select('id, name');
    const teamMap = {};
    teams.forEach(t => teamMap[t.name] = t.id);

    console.log('\n--- Insertando Finales de Repechaje (Playoff - Puntos Dobles) ---');
    const kickoffFinals = '2026-03-31T23:00:00Z'; // 18:00 Col aprox el 31 de Marzo

    // Para las finales donde no hay un equipo fijo aún, usaré null y el usuario podrá editarlos en el panel
    const finals = [
        // Intercontinental
        {
            home_team_id: null, // Ganador Semi 1 (Bolivia/Surinam)
            away_team_id: teamMap['Irak'],
            kickoff_time: '2026-03-31T22:00:00Z', // 17:00 Col
            is_playoff: true,
            status: 'pending'
        },
        {
            home_team_id: null, // Ganador Semi 2 (Caledonia/Jamaica)
            away_team_id: teamMap['RD Congo'],
            kickoff_time: '2026-04-01T01:00:00Z', // 20:00 Col (ya entra 1 de abril UTC)
            is_playoff: true,
            status: 'pending'
        },
        // UEFA
        {
            home_team_id: null, // Ganador Ruta A
            away_team_id: null,
            kickoff_time: '2026-03-31T18:45:00Z', // 13:45 Col
            is_playoff: true,
            status: 'pending'
        },
        {
            home_team_id: null, // Ganador Ruta B
            away_team_id: null,
            kickoff_time: '2026-03-31T18:45:00Z',
            is_playoff: true,
            status: 'pending'
        },
        {
            home_team_id: null, // Ganador Ruta C
            away_team_id: null,
            kickoff_time: '2026-03-31T18:45:00Z',
            is_playoff: true,
            status: 'pending'
        },
        {
            home_team_id: null, // Ganador Ruta D
            away_team_id: null,
            kickoff_time: '2026-03-31T18:45:00Z',
            is_playoff: true,
            status: 'pending'
        }
    ];

    for (const match of finals) {
        const { error } = await supabase.from('matches').insert(match);
        if (error) {
            console.error('Error insertando final:', error);
        } else {
            console.log('Final insertada correctamente.');
        }
    }
}

setup();
