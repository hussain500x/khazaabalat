import { supabase } from './supabase';

// إعدادات الموقع العامة (صف واحد id=1 في جدول site_settings).
export interface SiteSettings {
  site_name: string;
  tagline: string;
  telegram_url: string;
  adsense_client: string;
  adsense_enabled: boolean;
  seo_title: string;
  seo_description: string;
  analytics_id: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'خزعبلات',
  tagline: 'كل خزعبلة لها قصة',
  telegram_url: 'https://t.me/+_R3zTVVauwE5MWI0',
  adsense_client: '',
  adsense_enabled: false,
  seo_title: '',
  seo_description: '',
  analytics_id: '',
};

let _cache: SiteSettings | null = null;

// تُقرأ وقت البناء (للسيو/الإعلانات) وفي المتصفّح (لوحة الإعدادات).
// آمنة: لو الجدول غير موجود بعد، تُعيد القيم الافتراضية بدل أن يفشل البناء.
export async function getSettings(): Promise<SiteSettings> {
  if (_cache) return _cache;
  try {
    const { data, error } = await supabase()
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS;
    _cache = { ...DEFAULT_SETTINGS, ...(data as Partial<SiteSettings>) };
    return _cache;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
