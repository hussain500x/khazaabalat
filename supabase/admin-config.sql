-- خزعبلات — تفعيل صفحة الإعدادات والفريق (شغّله كاملًا مرة في Supabase → SQL Editor).
-- آمن لإعادة التشغيل (idempotent).

-- ═══ 1) جدول إعدادات الموقع (صف واحد id=1) ═══
create table if not exists public.site_settings (
  id int primary key default 1,
  site_name text not null default 'خزعبلات',
  tagline text not null default 'كل خزعبلة لها قصة',
  telegram_url text not null default '',
  adsense_client text not null default '',
  adsense_enabled boolean not null default false,
  seo_title text not null default '',
  seo_description text not null default '',
  analytics_id text not null default '',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id, telegram_url)
values (1, 'https://t.me/+_R3zTVVauwE5MWI0')
on conflict (id) do nothing;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
drop policy if exists site_settings_read on public.site_settings;   -- الجميع يقرأ (يُستخدم وقت البناء)
create policy site_settings_read on public.site_settings for select using (true);
drop policy if exists site_settings_write on public.site_settings;  -- المالك فقط يعدّل
create policy site_settings_write on public.site_settings for update
  using (public.my_role() = 'owner') with check (public.my_role() = 'owner');

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

-- ═══ 2) عمود الإيميل في profiles (لعرض أعضاء الفريق) ═══
alter table public.profiles add column if not exists email text;
update public.profiles p set email = u.email
  from auth.users u where u.id = p.id and (p.email is null or p.email = '');

-- تحديث دالة إنشاء المستخدم لتخزين الإيميل أيضًا
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end; $$;

-- ═══ 3) سياسة: المالك يدير أدوار كل الأعضاء (كان ينقص — لذا ما كان أحد يقدر يغيّر أدوار غيره) ═══
drop policy if exists profiles_owner_manage on public.profiles;
create policy profiles_owner_manage on public.profiles for update
  using (public.my_role() = 'owner') with check (public.my_role() = 'owner');
