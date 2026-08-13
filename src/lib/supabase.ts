import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// قيم Supabase العامة (آمنة — تُكشف في المتصفّح أصلًا؛ الأمان عبر RLS + إيقاف التسجيل الذاتي).
// تُقرأ من .env محليًا، وإلا تُستخدم القيم المضمّنة — فلا نحتاج ضبط متغيّرات في Cloudflare.
const url = import.meta.env.PUBLIC_SUPABASE_URL || 'https://qcxnduftiuvbtzfgfndr.supabase.co';
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qeKs6OSqk1V6toEm8KfNZA_x6cL3bQy';

// عميل Supabase واحد (singleton) — يحترم RLS دائمًا.
// يُستخدم وقت البناء للقراءة العامة، وفي المتصفّح لتسجيل الدخول وعمليات اللوحة.
let _client: SupabaseClient | null = null;
export const supabase = (): SupabaseClient => (_client ??= createClient(url, anonKey));
