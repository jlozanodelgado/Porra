const FIFA_BASE_URL = 'https://api.fifa.com/api/v3/picture/flags-sq-4/';

const teamMapping = {
    "Argentina": "ARG",
    "Australia": "AUS",
    "Austria": "AUT",
    "Bélgica": "BEL",
    "Brasil": "BRA",
    "Camerún": "CMR",
    "Canadá": "CAN",
    "Chile": "CHI",
    "Colombia": "COL",
    "Corea del Sur": "KOR",
    "Costa de Marfil": "CIV",
    "Costa Rica": "CRC",
    "Croacia": "CRO",
    "Dinamarca": "DEN",
    "Ecuador": "ECU",
    "Egipto": "EGY",
    "Escocia": "SCO",
    "Eslovaquia": "SVK",
    "Eslovenia": "SVN",
    "España": "ESP",
    "Francia": "FRA",
    "Georgia": "GEO",
    "Ghana": "GHA",
    "Grecia": "GRE",
    "Hungría": "HUN",
    "Inglaterra": "ENG",
    "Irán": "IRN",
    "Iraq": "IRQ",
    "Italia": "ITA",
    "Japón": "JPN",
    "Marruecos": "MAR",
    "México": "MEX",
    "Nigeria": "NGA",
    "Noruega": "NOR",
    "Nueva Caledonia": "NCL",
    "Nueva Zelanda": "NZL",
    "Paises Bajos": "NED",
    "Panamá": "PAN",
    "Paraguay": "PAR",
    "Perú": "PER",
    "Polonia": "POL",
    "Portugal": "POR",
    "RD Congo": "COD",
    "Rumanía": "ROU",
    "Senegal": "SEN",
    "Serbia": "SRB",
    "Sudáfrica": "RSA",
    "Suecia": "SWE",
    "Suiza": "SUI",
    "Surinam": "SUR",
    "Tunes": "TUN",
    "Turquía": "TUR",
    "Ucrania": "UKR",
    "Uruguay": "URU",
    "USA": "USA",
    "Uzbekistán": "UZB",
    "Venezuela": "VEN",
    "Vietnam": "VIE"
};

async function updateFlags() {
    const supabaseUrl = 'https://gecehipdmxijoteebhgu.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlY2VoaXBkbXhpam90ZWViaGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDc5MjYsImV4cCI6MjA4ODIyMzkyNn0.za_3vE6GjC32PuLc9I-ARI4DjexLgqdQko4aEQu8Atg';

    // 1. Fetch current teams
    const response = await fetch(`${supabaseUrl}/rest/v1/teams?select=id,name`, {
        headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
        }
    });

    const teams = await response.json();

    console.log(`Encontrados ${teams.length} equipos. Actualizando banderas...`);

    for (const team of teams) {
        const iso = teamMapping[team.name];
        if (iso) {
            const flagUrl = `${FIFA_BASE_URL}${iso}`;
            console.log(`Actualizando ${team.name} -> ${flagUrl}`);
            
            await fetch(`${supabaseUrl}/rest/v1/teams?id=eq.${team.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ flag_url: flagUrl })
            });
        }
    }

    console.log('¡Actualización completada!');
}

updateFlags();
