// مصدر واحد لقواعد التحقّق من المقال — يستخدمه المحرّر (العميل) لعرض أخطاء الحقول،
// وتُطابقه قيود قاعدة البيانات (supabase/fix-publish.sql) كبوّابة على الخادم.
// أبقِ الاثنين متطابقين: أي تغيير هنا يُقابله تعديل القيد في SQL.

export const CATEGORIES = ['myths', 'legends', 'satire', 'world'] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ['draft', 'scheduled', 'published'] as const;
export type Status = (typeof STATUSES)[number];

export interface ArticleInput {
  title: string;
  dek: string;
  body: string;
  category: string;
  level: number;
  status: string;
}

export type ArticleField = 'title' | 'dek' | 'body' | 'category' | 'level';
export type FieldErrors = Partial<Record<ArticleField, string>>;

// الحقول المطلوبة للنشر. المسودّة يكفيها عنوان صالح.
export function validateArticle(input: ArticleInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.title || !input.title.trim()) {
    errors.title = 'العنوان مطلوب.';
  }
  if (!(CATEGORIES as readonly string[]).includes(input.category)) {
    errors.category = 'اختر بابًا صحيحًا.';
  }
  if (!Number.isInteger(input.level) || input.level < 1 || input.level > 5) {
    errors.level = 'اختر مستوى من ١ إلى ٥.';
  }

  // النشر يتطلّب سطرًا تشويقيًا ومتنًا (زيادةً على العنوان والباب والمستوى).
  if (input.status === 'published') {
    if (!input.dek || !input.dek.trim()) {
      errors.dek = 'السطر التشويقي مطلوب قبل النشر.';
    }
    if (!input.body || !input.body.trim()) {
      errors.body = 'متن المقال مطلوب قبل النشر.';
    }
  }

  return errors;
}

export function isValid(errors: FieldErrors): boolean {
  return Object.keys(errors).length === 0;
}

// ترتيب عرض قائمة النواقص للمستخدم (شيك-لِست عند منع النشر).
export const FIELD_LABELS: Record<ArticleField, string> = {
  title: 'عنوان المقال',
  dek: 'السطر التشويقي',
  body: 'المتن',
  category: 'الباب',
  level: 'مقياس الخزعبلة',
};
