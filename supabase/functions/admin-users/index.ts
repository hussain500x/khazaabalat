// دالة خادم آمنة لإنشاء/حذف أعضاء الفريق.
// النشر (مرة واحدة):  supabase functions deploy admin-users
// المفاتيح (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY) تُحقن تلقائيًا.
// الأمان: نتحقّق أن المتصل مسجّل الدخول ودورُه «مالك» قبل أي عملية.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const ROLES = ['owner', 'editor', 'author'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // 1) تحقّق من هوية المتصل ودوره عبر جلسته
    const asUser = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uErr } = await asUser.auth.getUser();
    if (uErr || !user) return json({ error: 'غير مصرّح — سجّل الدخول.' }, 401);
    const { data: prof } = await asUser.from('profiles').select('role').eq('id', user.id).single();
    if (prof?.role !== 'owner') return json({ error: 'هذه العملية للمالك فقط.' }, 403);

    // 2) عميل بصلاحية الخدمة (خادم فقط)
    const admin = createClient(url, service);
    const body = await req.json().catch(() => ({}));

    if (body.action === 'create') {
      const email = String(body.email ?? '').trim();
      const password = String(body.password ?? '');
      const full_name = String(body.full_name ?? '').trim() || email;
      const role = ROLES.includes(body.role) ? body.role : 'author';
      if (!email) return json({ error: 'الإيميل مطلوب.' }, 400);
      if (password.length < 6) return json({ error: 'كلمة السر 6 أحرف على الأقل.' }, 400);

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name },
      });
      if (cErr) return json({ error: cErr.message }, 400);
      await admin.from('profiles').update({ role, full_name, email }).eq('id', created.user.id);
      return json({ ok: true, id: created.user.id });
    }

    if (body.action === 'delete') {
      const id = String(body.id ?? '');
      if (!id) return json({ error: 'المعرّف مطلوب.' }, 400);
      if (id === user.id) return json({ error: 'لا يمكنك حذف حسابك أنت.' }, 400);
      const { error: dErr } = await admin.auth.admin.deleteUser(id);
      if (dErr) return json({ error: dErr.message }, 400);
      return json({ ok: true });
    }

    return json({ error: 'إجراء غير معروف.' }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
