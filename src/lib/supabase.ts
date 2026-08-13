import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

// عميل Supabase واحد (singleton) — يحترم RLS دائمًا.
// يُستخدم وقت البناء للقراءة العامة، وفي المتصفّح لتسجيل الدخول وعمليات اللوحة.
let _client: SupabaseClient | null = null;
export const supabase = (): SupabaseClient => (_client ??= createClient(url, anonKey));
