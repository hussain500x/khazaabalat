import { supabase } from './supabase';
import { CAT, type CatSlug, type Article } from '../data/site';

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function arDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// يجلب المقالات المنشورة من Supabase ويحوّلها لشكل بطاقة المقال.
// يعمل وقت البناء (SSG). عند أي خطأ يرجّع مصفوفة فارغة بدل تعطيل البناء.
export async function getPublishedArticles(): Promise<Article[]> {
  const { data, error } = await supabase()
    .from('articles')
    .select('title, dek, category, level, reading_time, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[articles] Supabase error:', error.message);
    return [];
  }

  return (data ?? []).map((r): Article => {
    const cat = CAT[r.category as CatSlug];
    return {
      title: r.title,
      dek: r.dek ?? '',
      cat: cat?.name ?? r.category,
      color: cat?.color ?? '#E7B24B',
      level: r.level,
      readingTime: r.reading_time ?? '',
      date: arDate(r.published_at),
    };
  });
}
