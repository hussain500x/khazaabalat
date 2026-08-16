import type { SupabaseClient } from '@supabase/supabase-js';

// حفظ/تحديث مقال مع تأكيد أن التغيير ثبت فعليًا على الخادم.
//
// جذر الخطأ الأصلي: تحديث PostgREST الذي لا يطابق أي صفّ (رفض RLS الصامت،
// أو id غير موجود) يعود بلا خطأ (error === null, data === []). فاعتبار «غياب
// الخطأ» نجاحًا يُظهر رسالة نجاح كاذبة بينما لم يتغيّر شيء.
//
// الحل هنا: نطلب .select() فنستعيد الصف المكتوب، ونعتبر «صفر صفوف» فشلًا صريحًا،
// ونتحقّق أن الحالة المُعادة من الخادم تطابق المطلوبة — فلا نجاح إلا بتأكيد الخادم.

export interface ArticleRow {
  title: string;
  slug: string;
  dek: string;
  body: string;
  category: string;
  level: number;
  status: string;
  cover_url: string | null;
  reading_time: string;
  tags: string[];
  author_id: string | null;
  published_at: string | null;
}

export interface SavedArticle {
  id: string;
  status: string;
}

export type SaveResult =
  | { ok: true; id: string; status: string }
  | { ok: false; message: string };

// يحوّل رسائل الخطأ الشائعة إلى عربية واضحة للمستخدم.
function humanizeError(message: string): string {
  if (/row-level security|violates row-level|permission denied/i.test(message)) {
    return 'رُفض الحفظ بسبب الصلاحيات — تأكّد أن دورك «محرّر» أو «مالك».';
  }
  if (/duplicate key|unique constraint/i.test(message)) {
    return 'يوجد مقال بنفس الرابط (slug) — غيّر العنوان قليلًا.';
  }
  if (/articles_publish_requirements|check constraint/i.test(message)) {
    return 'لا يمكن النشر: هناك حقول مطلوبة ناقصة (السطر التشويقي والمتن).';
  }
  return message;
}

export async function saveArticle(
  sb: SupabaseClient,
  opts: { editId: string | null; row: ArticleRow },
): Promise<SaveResult> {
  const { editId, row } = opts;
  try {
    const { data, error } = editId
      ? await sb.from('articles').update(row).eq('id', editId).select('id,status')
      : await sb.from('articles').insert(row).select('id,status');

    if (error) {
      return { ok: false, message: humanizeError(error.message) };
    }

    const rows = (data ?? []) as SavedArticle[];
    if (rows.length === 0) {
      // تحديث/إدراج طابق صفر صفوف: رفض RLS صامت أو id غير موجود. فشل صريح — لا نجاح كاذب.
      return {
        ok: false,
        message: editId
          ? 'لم يُحفظ التغيير: لا تملك صلاحية تعديل هذا المقال أو أنه غير موجود. تأكّد أن دورك «محرّر» أو «مالك».'
          : 'تعذّر إنشاء المقال — تأكّد من تسجيل الدخول وصلاحياتك.',
      };
    }

    const saved = rows[0];
    if (saved.status !== row.status) {
      // الخادم لم يؤكّد الحالة المطلوبة — لا نُظهر نجاحًا.
      return { ok: false, message: 'تعذّر تأكيد الحفظ على الخادم — أعد المحاولة.' };
    }

    return { ok: true, id: saved.id, status: saved.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: 'خطأ في الاتصال بالخادم: ' + message };
  }
}
