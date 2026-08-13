-- خزعبلات — سكيمة قاعدة البيانات + سياسات الأمان (RLS)
-- شغّلها كاملة في: Supabase → SQL Editor → New query → لصق → Run.
-- آمنة لإعادة التشغيل (idempotent).

-- ═══ 1) الملفات الشخصية (تمتد من auth.users) + الأدوار ═══
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'author' check (role in ('owner','editor','author')),
  created_at timestamptz not null default now()
);

-- ═══ 2) المقالات ═══
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  dek text,
  body text,
  category text not null check (category in ('myths','legends','satire','world')),
  level int not null default 3 check (level between 1 and 5),
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  cover_url text,
  reading_time text,
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_category_idx on public.articles(category);

-- ═══ 3) الدعوات ═══
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'author' check (role in ('owner','editor','author')),
  invited_by uuid references public.profiles(id) on delete set null,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══ 4) تحديث updated_at تلقائيًا ═══
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

-- ═══ 5) إنشاء profile تلقائيًا عند تسجيل مستخدم جديد ═══
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══ 6) تفعيل RLS ═══
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.invites  enable row level security;

-- دالة مساعدة: دور المستخدم الحالي
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- سياسات profiles
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update using (id = auth.uid());

-- سياسات articles
drop policy if exists articles_public_read on public.articles;         -- العامة ترى المنشور فقط؛ المسجّل يرى الكل
create policy articles_public_read on public.articles for select
  using (status = 'published' or auth.uid() is not null);
drop policy if exists articles_insert on public.articles;              -- أي مستخدم مسجّل ينشئ
create policy articles_insert on public.articles for insert
  with check (auth.uid() is not null);
drop policy if exists articles_update on public.articles;              -- المؤلّف نفسه أو محرّر/مالك
create policy articles_update on public.articles for update
  using (author_id = auth.uid() or public.my_role() in ('editor','owner'));
drop policy if exists articles_delete on public.articles;             -- محرّر/مالك فقط
create policy articles_delete on public.articles for delete
  using (public.my_role() in ('editor','owner'));

-- سياسات invites (المالك فقط)
drop policy if exists invites_owner_all on public.invites;
create policy invites_owner_all on public.invites for all
  using (public.my_role() = 'owner') with check (public.my_role() = 'owner');

-- ═══ 7) بعد أول تسجيل دخول لك: اجعل نفسك «مالك» ═══
-- سجّل دخولك مرة واحدة في الموقع أولاً، ثم شغّل هذا السطر (وأنت مسجّل الدخول في هذه اللوحة):
--   update public.profiles set role = 'owner' where id = auth.uid();

-- ═══ 8) بيانات تجريبية (٣ مقالات منشورة) — لإثبات الاتصال ═══
insert into public.articles (slug, title, dek, category, level, status, reading_time, published_at) values
  ('ain-taksir-hajar', 'هل صحيح أن العين تكسر الحجر؟', 'مقولة نسمعها من الصِّغَر… نفحصها تحت الضوء ونقول لك الحكم.', 'myths', 4, 'published', '5 دقائق قراءة', now()),
  ('om-aldwais', 'أم الدويس: أشهر قصة مخيفة في الخليج', 'اقعد… عندي لك حكاية تسمعها من جدّتك، ونكشف من وين جت أصلاً.', 'legends', 3, 'published', '6 دقائق قراءة', now()),
  ('yaban-raqam-4', 'لماذا يخاف اليابانيون من الرقم 4؟', 'ثقافة كاملة تتجنّب رقماً بعينه… نمرّ على الحكاية ونرجع بالحقيقة.', 'world', 2, 'published', '4 دقائق قراءة', now())
on conflict (slug) do nothing;

-- ═══ 9) منح صلاحيات الوصول للأدوار (RLS يبقى يتحكّم بالصفوف) ═══
grant usage on schema public to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;
grant select, insert, update, delete on public.invites to authenticated;
