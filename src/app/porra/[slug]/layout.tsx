import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface PorraLayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export default async function PorraLayout({ children, params }: PorraLayoutProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Obtener datos de la porra para establecer el branding
    const { data: porra } = await supabase
        .from('porras')
        .select('primary_color, secondary_color')
        .eq('slug', slug)
        .single();

    if (!porra) {
        notFound();
    }

    const primaryColor = porra.primary_color || '#00ff00';
    const secondaryColor = porra.secondary_color || '#00ffff';

    return (
        <div
            style={{
                '--porra-primary': primaryColor,
                '--porra-secondary': secondaryColor,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}