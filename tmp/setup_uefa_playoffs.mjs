import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gecehipdmxijoteebhgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlY2VoaXBkbXhpam90ZWViaGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDc5MjYsImV4cCI6MjA4ODIyMzkyNn0.za_3vE6GjC32PuLc9I-ARI4DjexLgqdQko4aEQu8Atg';
const supabase = createClient(supabaseUrl, supabaseKey);

const uefaTeams = [
    // Ruta A
    { name: 'Italia', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/ITA', group_name: 'A' },
    { name: 'Irlanda del Norte', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/NIR', group_name: 'A' },
    { name: 'Gales', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/WAL', group_name: 'A' },
    { name: 'Bosnia y Herzegovina', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/BIH', group_name: 'A' },
    // Ruta B
    { name: 'Ucrania', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/UKR', group_name: 'B' },
    { name: 'Suecia', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/SWE', group_name: 'B' },
    { name: 'Polonia', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/POL', group_name: 'B' },
    { name: 'Albania', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/ALB', group_name: 'B' },
    // Ruta C
    { name: 'Turquía', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/TUR', group_name: 'C' },
    { name: 'Rumanía', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/ROU', group_name: 'C' },
    { name: 'Eslovaquia', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/SVK', group_name: 'C' },
    { name: 'Kosovo', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/KOS', group_name: 'C' },
    // Ruta D
    { name: 'Dinamarca', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/DEN', group_name: 'D' },
    { name: 'Macedonia del Norte', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/MKD', group_name: 'D' },
    { name: 'Chequia', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/CZE', group_name: 'D' },
    { name: 'Irlanda', flag_url: 'https://api.fifa.com/api/v3/picture/flags-sq-2/IRL', group_name: 'D' },
];

async function setup() {
    console.log('--- Gestionando Equipos UEFA ---');
    const teamMap = {};

    for (const team of uefaTeams) {
        const { data: existing } = await supabase.from('teams').select('id').eq('name', team.name).single();
        if (existing) {
            console.log(`Equipo ${team.name} ya existe.`);
            teamMap[team.name] = existing.id;
        } else {
            const { data, error } = await supabase.from('teams').insert(team).select().single();
            if (error) console.error(`Error ${team.name}:`, error);
            else {
                console.log(`Equipo ${team.name} creado.`);
                teamMap[team.name] = data.id;
            }
        }
    }

    console.log('\n--- Insertando Semifinales UEFA (26 Mar 2026, 14:45 Col) ---');
    const kickoff = '2026-03-26T19:45:00Z'; // 14:45 Col

    const matches = [
        // Ruta A
        [teamMap['Italia'], teamMap['Irlanda del Norte']],
        [teamMap['Gales'], teamMap['Bosnia y Herzegovina']],
        // Ruta B
        [teamMap['Ucrania'], teamMap['Suecia']],
        [teamMap['Polonia'], teamMap['Albania']],
        // Ruta C
        [teamMap['Turquía'], teamMap['Rumanía']],
        [teamMap['Eslovaquia'], teamMap['Kosovo']],
        // Ruta D
        [teamMap['Dinamarca'], teamMap['Macedonia del Norte']],
        [teamMap['Chequia'], teamMap['Irlanda']],
    ];

    for (const [home, away] of matches) {
        const { error } = await supabase.from('matches').insert({
            home_team_id: home,
            away_team_id: away,
            kickoff_time: kickoff,
            is_playoff: true,
            status: 'pending'
        });
        if (error) console.error('Error partido:', error);
        else console.log('Partido insertado.');
    }
}

setup();
