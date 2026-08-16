import { describe, it, expect } from 'vitest';
import { validateArticle, isValid } from '../src/lib/validation';

const base = {
  title: 'عنوان',
  dek: 'سطر تشويقي',
  body: 'متن المقال هنا',
  category: 'myths',
  level: 4,
  status: 'draft',
};

describe('validateArticle — المسودّة', () => {
  it('تقبل مسودّة بعنوان فقط', () => {
    const errors = validateArticle({ ...base, status: 'draft', dek: '', body: '' });
    expect(isValid(errors)).toBe(true);
  });

  it('ترفض مسودّة بلا عنوان', () => {
    const errors = validateArticle({ ...base, status: 'draft', title: '   ' });
    expect(errors.title).toBeTruthy();
    expect(isValid(errors)).toBe(false);
  });
});

describe('validateArticle — النشر يتطلّب حقولًا إضافية', () => {
  it('يقبل نشرًا مكتمل الحقول', () => {
    expect(isValid(validateArticle({ ...base, status: 'published' }))).toBe(true);
  });

  it('يمنع النشر بلا سطر تشويقي', () => {
    const errors = validateArticle({ ...base, status: 'published', dek: '' });
    expect(errors.dek).toBeTruthy();
    expect(isValid(errors)).toBe(false);
  });

  it('يمنع النشر بلا متن', () => {
    const errors = validateArticle({ ...base, status: 'published', body: '  ' });
    expect(errors.body).toBeTruthy();
  });

  it('يجمع كل النواقص معًا', () => {
    const errors = validateArticle({ title: '', dek: '', body: '', category: 'myths', level: 4, status: 'published' });
    expect(Object.keys(errors).sort()).toEqual(['body', 'dek', 'title']);
  });
});

describe('validateArticle — الباب والمستوى', () => {
  it('يرفض بابًا غير معروف', () => {
    expect(validateArticle({ ...base, category: 'sports' }).category).toBeTruthy();
  });

  it('يرفض مستوى خارج ١–٥', () => {
    expect(validateArticle({ ...base, level: 0 }).level).toBeTruthy();
    expect(validateArticle({ ...base, level: 6 }).level).toBeTruthy();
    expect(validateArticle({ ...base, level: 2.5 }).level).toBeTruthy();
  });
});
