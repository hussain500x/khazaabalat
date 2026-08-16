// قيم Supabase العامة (publishable) — آمنة في المتصفّح؛ الحماية عبر RLS.
// مفصولة في وحدة صغيرة حتى تستطيع الصفحات العامة قراءتها عبر fetch خفيف
// دون تحميل حزمة supabase-js كاملة.
export const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL || 'https://qcxnduftiuvbtzfgfndr.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qeKs6OSqk1V6toEm8KfNZA_x6cL3bQy';
