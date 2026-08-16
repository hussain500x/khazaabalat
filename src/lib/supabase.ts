import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './public-env';

// عميل Supabase واحد (singleton) — يحترم RLS دائمًا.
// يُستخدم وقت البناء للقراءة العامة، وفي المتصفّح لتسجيل الدخول وعمليات اللوحة.
let _client: SupabaseClient | null = null;
export const supabase = (): SupabaseClient => (_client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
