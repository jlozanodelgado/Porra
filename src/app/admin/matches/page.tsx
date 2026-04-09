import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminMatchesClient from './AdminMatchesClient';

export default async function AdminMatchesPage() {
    const supabase = await createClient();

    const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .order('name', { ascending: true });

    const { data: matchesData } = await supabase
        .from('matches')
        .select(`
            *,
            home:home_team_id (name),
            away:away_team_id (name)
        `)
        .order('kickoff_time', { ascending: true });

    const matches = matchesData || [];

    return (
        <AdminMatchesClient 
            teams={teams || []} 
            initialMatches={matches as any} 
        />
    );
}
