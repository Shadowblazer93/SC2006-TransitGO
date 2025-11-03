import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function user_loggedin() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return false;
    return !!data?.session?.user;
}

export async function user_isadmin() {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return false;
    const userId = sessionData?.session?.user?.id;
    if (!userId) return false;

    const { data, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('uid', userId)
        .maybeSingle();

    if (error || !data) return false;
    return data.user_type === 'admin';
}