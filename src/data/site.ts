export const TELEGRAM_URL = 'https://t.me/+_R3zTVVauwE5MWI0';

export const doors = [
  { slug: 'myths',   name: 'باب المجهر', count: '21 خرافة',  color: '#3FB8A0', icon: 'myths' },
  { slug: 'legends', name: 'باب الحكاية', count: '15 حكاية',  color: '#7B5CD6', icon: 'legends' },
  { slug: 'satire',  name: 'باب الضحكة', count: '8 مقالات',  color: '#E2603F', icon: 'satire' },
  { slug: 'world',   name: 'باب الرحلة', count: '12 مقالاً', color: '#E7B24B', icon: 'world' },
];

// مصدر واحد لبيانات التصنيفات (اسم الشارة + الاسم القصير + اللون) — يُستخدم عبر الموقع واللوحة
export const CAT = {
  myths:   { name: 'خرافات وتفنيد', short: 'المجهر',  color: '#3FB8A0' },
  legends: { name: 'أساطير وحكايات', short: 'الحكاية', color: '#7B5CD6' },
  satire:  { name: 'هزل وسخرية',    short: 'الضحكة',  color: '#E2603F' },
  world:   { name: 'غرائب العالم',   short: 'الرحلة',  color: '#E7B24B' },
} as const;
export type CatSlug = keyof typeof CAT;

export interface Article {
  title: string;
  dek: string;
  cat: string;
  color: string;
  level: number;
  readingTime: string;
  date: string;
}

export const articles: Article[] = [
  {
    title: 'هل صحيح أن العين تكسر الحجر؟',
    dek: 'مقولة نسمعها من الصِّغَر… نفحصها تحت الضوء ونقول لك الحكم.',
    cat: 'خرافات وتفنيد', color: '#3FB8A0', level: 4,
    readingTime: '5 دقائق قراءة', date: '12 أغسطس 2026',
  },
  {
    title: 'أم الدويس: أشهر قصة مخيفة في الخليج',
    dek: 'اقعد… عندي لك حكاية تسمعها من جدّتك، ونكشف من وين جت أصلاً.',
    cat: 'أساطير وحكايات', color: '#7B5CD6', level: 3,
    readingTime: '6 دقائق قراءة', date: '11 أغسطس 2026',
  },
  {
    title: 'لماذا يخاف اليابانيون من الرقم 4؟',
    dek: 'ثقافة كاملة تتجنّب رقماً بعينه… نمرّ على الحكاية ونرجع بالحقيقة.',
    cat: 'غرائب العالم', color: '#E7B24B', level: 2,
    readingTime: '4 دقائق قراءة', date: '12 أغسطس 2026',
  },
];
