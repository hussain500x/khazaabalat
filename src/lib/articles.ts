import { supabase } from './supabase';
import { CAT, type CatSlug } from '../data/site';

export interface ArticleView {
  slug: string;
  title: string;
  dek: string;
  body: string;
  cat: string; // اسم التصنيف للعرض
  catSlug: string; // slug التصنيف الخام
  color: string;
  level: number;
  readingTime: string;
  date: string; // تاريخ عربي منسّق
  cover: string | null;
  tags: string[];
}

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function arDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// مدة القراءة تُحسب تلقائيًا من المتن (≈200 كلمة/دقيقة). فارغة إذا لا متن.
function readingTime(body: string): string {
  const words = body ? body.trim().split(/\s+/).filter(Boolean).length : 0;
  if (!words) return '';
  return `${Math.max(1, Math.round(words / 200))} دقائق قراءة`;
}

function mapRow(r: any): ArticleView {
  const cat = CAT[r.category as CatSlug];
  return {
    slug: r.slug,
    title: r.title,
    dek: r.dek ?? '',
    body: r.body ?? '',
    cat: cat?.name ?? r.category,
    catSlug: r.category,
    color: cat?.color ?? '#E7B24B',
    level: r.level,
    readingTime: readingTime(r.body ?? ''),
    date: arDate(r.published_at ?? r.created_at ?? null),
    cover: r.cover_url ?? null,
    tags: r.tags ?? [],
  };
}

const SELECT = 'slug, title, dek, body, category, level, reading_time, published_at, created_at, cover_url, tags';

// كل المقالات المنشورة (الأحدث أولًا)
export async function getPublishedArticles(): Promise<ArticleView[]> {
  const { data, error } = await supabase()
    .from('articles')
    .select(SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) { console.error('[articles] getPublished:', error.message); return []; }
  return (data ?? []).map(mapRow);
}

// مقال واحد بالـslug (منشور)
export async function getArticleBySlug(slug: string): Promise<ArticleView | null> {
  const { data, error } = await supabase()
    .from('articles')
    .select(SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) { console.error('[articles] getBySlug:', error.message); return null; }
  return data ? mapRow(data) : null;
}

// مقالات تصنيف معيّن
export async function getArticlesByCategory(catSlug: string): Promise<ArticleView[]> {
  const { data, error } = await supabase()
    .from('articles')
    .select(SELECT)
    .eq('status', 'published')
    .eq('category', catSlug)
    .order('published_at', { ascending: false });
  if (error) { console.error('[articles] byCategory:', error.message); return []; }
  return (data ?? []).map(mapRow);
}

// مقالات تحمل وسمًا معيّنًا
export async function getArticlesByTag(tag: string): Promise<ArticleView[]> {
  const { data, error } = await supabase()
    .from('articles')
    .select(SELECT)
    .eq('status', 'published')
    .contains('tags', [tag])
    .order('published_at', { ascending: false });
  if (error) { console.error('[articles] byTag:', error.message); return []; }
  return (data ?? []).map(mapRow);
}

// كل الـslugs المنشورة (لـ getStaticPaths)
export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase()
    .from('articles')
    .select('slug')
    .eq('status', 'published');
  if (error) { console.error('[articles] slugs:', error.message); return []; }
  return (data ?? []).map((r: any) => r.slug);
}

// كل الوسوم المميّزة (لـ getStaticPaths)
export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase()
    .from('articles')
    .select('tags')
    .eq('status', 'published');
  if (error) { console.error('[articles] tags:', error.message); return []; }
  const set = new Set<string>();
  (data ?? []).forEach((r: any) => (r.tags ?? []).forEach((t: string) => set.add(t)));
  return [...set];
}

// عدد المقالات المنشورة لكل باب (slug → count)
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase()
    .from('articles')
    .select('category')
    .eq('status', 'published');
  if (error) { console.error('[articles] counts:', error.message); return {}; }
  const counts: Record<string, number> = {};
  (data ?? []).forEach((r: any) => { counts[r.category] = (counts[r.category] ?? 0) + 1; });
  return counts;
}
