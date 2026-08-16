import { describe, it, expect, vi } from 'vitest';
import { saveArticle, type ArticleRow } from '../src/lib/articles-admin';
import type { SupabaseClient } from '@supabase/supabase-js';

const row: ArticleRow = {
  title: 'عنوان', slug: 'slug', dek: 'دِك', body: 'متن', category: 'myths',
  level: 4, status: 'published', cover_url: null, reading_time: '1 دقائق قراءة',
  tags: [], author_id: 'user-1', published_at: '2026-08-16T00:00:00Z',
};

// يبني عميل Supabase وهميًا: update/insert -> .eq -> .select يعيد النتيجة المحقونة.
function fakeClient(resolved: { data: unknown; error: { message: string } | null }): SupabaseClient {
  const select = vi.fn().mockResolvedValue(resolved);
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq, select }));
  const insert = vi.fn(() => ({ select }));
  return { from: vi.fn(() => ({ update, insert })) } as unknown as SupabaseClient;
}

describe('saveArticle — المسار الحرِج (خطأ النجاح الكاذب)', () => {
  it('REGRESSION: تحديث يطابق صفر صفوف (رفض RLS صامت) يُبلَّغ فشلًا لا نجاحًا', async () => {
    // هذا بالضبط ما كان يعيده PostgREST سابقًا فيُظهره الكود القديم «نجاحًا»:
    const sb = fakeClient({ data: [], error: null });
    const result = await saveArticle(sb, { editId: 'article-1', row });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/صلاحية|غير موجود/);
  });

  it('نجاح حقيقي عندما يعيد الخادم الصفّ بالحالة المطلوبة', async () => {
    const sb = fakeClient({ data: [{ id: 'article-1', status: 'published' }], error: null });
    const result = await saveArticle(sb, { editId: 'article-1', row });
    expect(result.ok).toBe(true);
    if (result.ok) { expect(result.id).toBe('article-1'); expect(result.status).toBe('published'); }
  });

  it('خطأ صريح من الخادم يُبلَّغ فشلًا', async () => {
    const sb = fakeClient({ data: null, error: { message: 'new row violates row-level security policy' } });
    const result = await saveArticle(sb, { editId: 'article-1', row });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/الصلاحيات/);
  });

  it('عدم تطابق الحالة المُعادة مع المطلوبة يُعدّ فشلًا', async () => {
    const sb = fakeClient({ data: [{ id: 'article-1', status: 'draft' }], error: null });
    const result = await saveArticle(sb, { editId: 'article-1', row });
    expect(result.ok).toBe(false);
  });

  it('الإدراج الجديد ينجح عند إعادة الصف', async () => {
    const sb = fakeClient({ data: [{ id: 'new-1', status: 'published' }], error: null });
    const result = await saveArticle(sb, { editId: null, row });
    expect(result.ok).toBe(true);
  });

  it('استثناء الشبكة يُلتقط ويُبلَّغ بدل أن يُبتلع', async () => {
    const select = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    const sb = { from: vi.fn(() => ({ update: () => ({ eq: () => ({ select }) }) })) } as unknown as SupabaseClient;
    const result = await saveArticle(sb, { editId: 'article-1', row });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/اتصال/);
  });
});
