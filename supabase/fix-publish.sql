-- إصلاح جذر خطأ «النشر يظهر ناجحًا لكن الحالة تبقى مسودّة».
-- شغّله كاملًا مرّة واحدة في: Supabase → SQL Editor → New query → Run.
-- (محرّر SQL يعمل بصلاحية الخدمة ويتجاوز RLS، لذا نحدّد المستخدم بالبريد لا بـ auth.uid().)

-- ═══════════════════════════════════════════════════════════════════════
-- سبب الخطأ في قاعدة البيانات:
--   سياسة articles_update تسمح بالتعديل فقط إذا: author_id = auth.uid()
--   أو دور المستخدم ∈ (editor, owner). كل المقالات المزروعة والمولّدة
--   author_id فيها = NULL، وحساب اللوحة الجديد دوره الافتراضي 'author'.
--   فالتحديث يطابق صفر صفوف، وPostgREST يعيد «نجاحًا بلا خطأ» → رسالة كاذبة.
-- (الإصلاح البرمجي في العميل يمنع الرسالة الكاذبة؛ وهذا الملف يمنح الصلاحية
--  الفعلية حتى ينجح النشر، ويضيف بوّابة تحقّق على الخادم.)
-- ═══════════════════════════════════════════════════════════════════════

-- 1) اجعل حسابك «مالك». استبدل البريد ببريد حساب اللوحة الذي تسجّل به الدخول.
--    (تحقّق أولًا من الحسابات:)
--    select p.id, u.email, p.role from public.profiles p join auth.users u on u.id = p.id;
update public.profiles p
   set role = 'owner'
  from auth.users u
 where u.id = p.id
   and u.email = 'ضع-بريدك-هنا@example.com';

-- 2) اجعل المقالات اليتيمة (بلا مؤلّف) مملوكةً لك — حتى تُعدّلها حتى لو لم تكن مالكًا.
--    (استبدل البريد نفسه.)
update public.articles a
   set author_id = u.id
  from auth.users u
 where u.email = 'ضع-بريدك-هنا@example.com'
   and a.author_id is null;

-- 3) بوّابة الخادم: امنع نشر مقال ناقص الحقول المطلوبة (يطابق قواعد src/lib/validation.ts).
--    أي طلب PostgREST مباشر بحمولة ناقصة يُرفض أيضًا، لا العميل فقط.
--    NOT VALID: يُطبَّق على الكتابات الجديدة دون كسر صفوفٍ قديمة ناقصة المتن.
alter table public.articles drop constraint if exists articles_publish_requirements;
alter table public.articles add constraint articles_publish_requirements
  check (
    status <> 'published'
    or (
      length(btrim(coalesce(title, ''))) > 0
      and length(btrim(coalesce(dek, ''))) > 0
      and length(btrim(coalesce(body, ''))) > 0
    )
  ) not valid;

-- تحقّق نهائي: يجب أن يظهر دورك 'owner' وألا تبقى مقالات بلا مؤلّف.
-- select role from public.profiles where id = (select id from auth.users where email = 'ضع-بريدك-هنا@example.com');
-- select count(*) as orphan_articles from public.articles where author_id is null;
