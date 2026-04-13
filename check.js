import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, display_name, nickname, is_admin, is_paid');
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(profiles, null, 2));
  }
}

check();
