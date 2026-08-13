import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

// عميل عام يحترم RLS (قراءة عامة + عمليات المستخدم المسجّل).
// دالة كسولة: لا يُنشأ العميل وقت البناء، فلا يفشل البناء إن كانت المتغيّرات فارغة.
export const supabase = () => createClient(url, anonKey);

// 🔒 عميل السيرفر بصلاحية service_role — يتجاوز RLS.
// للسيرفر فقط: لا تستورده في أي كود يصل إلى المتصفّح.
export const supabaseAdmin = () =>
  createClient(url, import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
