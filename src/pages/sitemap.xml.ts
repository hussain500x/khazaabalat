import type { APIRoute } from 'astro';
import { doors } from '../data/site';

// المسارات العامة القابلة للفهرسة (بدون /admin و404).
// ملاحظة: عند إضافة مسارات مقالات مستقلّة (Stage 2) وسّع القائمة أو ولّدها من قاعدة البيانات.
const pages = ['', 'about', 'methodology', 'privacy', 'terms', 'contact', 'articles', 'article', 'search'];

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.href ?? 'https://khazaabalat.com/').replace(/\/$/, '');
  const routes = [
    ...pages.map((p) => (p ? `${origin}/${p}` : origin)),
    ...doors.map((d) => `${origin}/category/${d.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`).join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
