import type { APIRoute } from 'astro';
import { doors } from '../data/site';
import { getAllSlugs, getAllTags } from '../lib/articles';

// المسارات العامة الثابتة القابلة للفهرسة (بدون /admin و404 و/article المجرّد غير الموجود).
const pages = ['', 'about', 'methodology', 'privacy', 'terms', 'contact', 'articles', 'search'];

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.href ?? 'https://khazaabalat.com/').replace(/\/$/, '');
  const [slugs, tags] = await Promise.all([getAllSlugs(), getAllTags()]);
  const routes = [
    ...pages.map((p) => (p ? `${origin}/${p}` : origin)),
    ...doors.map((d) => `${origin}/category/${d.slug}`),
    ...slugs.map((s) => `${origin}/article/${encodeURIComponent(s)}`),
    ...tags.map((t) => `${origin}/tag/${encodeURIComponent(t)}`),
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
