async function listTeams() {
    const supabaseUrl = 'https://gecehipdmxijoteebhgu.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlY2VoaXBkbXhpam90ZWViaGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDc5MjYsImV4cCI6MjA4ODIyMzkyNn0.za_3vE6GjC32PuLc9I-ARI4DjexLgqdQko4aEQu8Atg';

    const response = await fetch(`${supabaseUrl}/rest/v1/teams?select=id,name&order=name`, {
        headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
        }
    });

    if (!response.ok) {
        console.error('Error fetching teams:', await response.text());
        return;
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

listTeams();
