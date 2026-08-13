# HANDOFF — مشروع «خزعبلات»

_آخر تحديث: 2026-08-12_

> وثيقة استمرارية. اقرأها بالكامل قبل البدء. مكتوبة ليكمل مطوّر جديد بدون أسئلة.
> الحالة: **الواجهة (Stage 1) مكتملة وتبني بنجاح (17 صفحة، 0 أخطاء). لا يوجد عمل جارٍ مفتوح — نقطة القرار: الخطوة التالية.**

---

## 1) الهدف الحالي
موقع محتوى عربي **RTL** اسمه «خزعبلات» (ثيم ليلي غامق + فانوس ذهبي) يجمع الغموض/الشعبيات/الفكاهة، مموّل بـ **Google AdSense**، مع باك أوفيس مبسّط لإضافة/تعديل/حذف المحتوى وإدارة الفريق. عنصر توقيعي: **«مقياس الخزعبلة» (١–٥)**. ٤ أبواب: `myths`/`legends`/`satire`/`world`. قناة **تلجرام** = قناة التفاعل.
- المرجع الأصلي للمواصفة: `/Users/machhm/Downloads/khazaabalat-prompt.md`.
- تصاميم Figma: ملف `Jc0zeed1noY9oXIxQ1SO56` → صفحة `khazaabalat`.
- **نقطة القرار المفتوحة:** أيّ خطوة أولًا — تنظيف سريع (ربط روابط `#`، معالجة `CAT` الميت)، أم تحسينات السيو، أم Stage 2 (Supabase)؟

## 2) ما تم إنجازه (ملفات ودوال محدّدة)
> المشروع: `/Users/machhm/Desktop/cloud_skils/khazaabalat` — **Astro ^7.2.0 + Bootstrap ^5.3.8 (RTL) + TypeScript**. `npm run build` = **17 صفحة، 0 أخطاء** (متحقّق حيًّا).

**البيانات — `src/data/site.ts`:**
- `TELEGRAM_URL = 'https://t.me/+_R3zTVVauwE5MWI0'` (مستخدم في كل أزرار تلجرام).
- `doors[]` (٤ عناصر: slug/name/count/color/icon)، `articles: Article[]` (٣ مقالات)، `interface Article` (export)، `CAT{}`+`CatSlug`+`categories[]`.
- ⚠️ `CAT`/`categories` **Exports ميتة حاليًا** (لا يستوردها أي ملف؛ كل صفحة تعرّف خريطتها المحلية). حقل `Article.cat` يخزّن اسم الشارة الكامل لا الـslug.

**الأنماط:** `src/styles/theme.css` (توكنز الهوية `--night-*`/`--parch-*`/`--lantern-*`/`--teal|violet|ember-500`/`--ink`/`--radius-*`/`--font-*`؛ مكوّنات `.hero`/`.lantern`/`.meter`/`.lamp.lit`(تستخدم `--meter-c`)/`.door`/`.article-card`؛ أنماط المقال `.reading-grid`/`.verdict-box`/`.timeline`/`.pullquote`/`.compare`/`.toc`؛ نظام الظهور `.js [data-reveal].is-visible`؛ `scroll-behavior:smooth` داخل `@media prefers-reduced-motion`؛ `.prose h2{scroll-margin-top:96px}`). لا توجد توكنز مسافات `--space-*`. · `src/styles/admin.css` (اللوحة؛ متجاوب `@media max-width:900px`؛ يستخدم خصائص فيزيائية `border-left`/`box-shadow:inset -3px` — تعمل لكنها ليست منطقية).

**القوالب:** `src/layouts/Base.astro` (`<html dir="rtl" data-bs-theme="dark">`، استيراد bootstrap.rtl + theme.css، خطوط Google، سكربت `is:inline` يضيف `js`، وسكربت **reveal** IntersectionObserver؛ Props `{title, description}`). · `src/layouts/AdminLayout.astro` (شريط جانبي يمين، topbar العنوان أولًا، `<slot name="actions">`؛ Props `{title, active, pageTitle, subtitle}`).

**المكوّنات (`src/components/`):** `Header` (نشط عبر `Astro.url.pathname` + برجر جوال + سكربت toggle)، `Hero` (فانوس SVG + نجوم/هلال/كوكبة + `data-reveal`؛ الفانوس/الهلال مخفيان دون lg)، `Footer` (روابط الصفحات + تلجرام حقيقية)، `DoorsGallery`، `ArticleCard` (نوع `Article`)، `Meter`، `TelegramCTA`، `Ornament`، `PageHeader`.

**الصفحات (`src/pages/`):** عامة (index, about, article, articles, contact, methodology, privacy, terms, search, 404) · `category/[door].astro` (`getStaticPaths`) · admin (index, new, settings).

**الدوال/السكربتات التفاعلية (تعمل):**
- `Base.astro` — reveal (IntersectionObserver → `.is-visible`).
- `category/[door].astro` — سكربت فرز على `.sort-pill` يرتّب أطفال `.cards-grid` بـ `data-newest/views/level` (تنبيه: «الأحدث» = ترتيب DOM لا التاريخ).
- `admin/new.astro` — مقياس قابل للنقر: دالة `set(lvl)` تضيء الفوانيس + تحدّث `--meter-c` + كلمة الحكم عبر خريطة
  `V={1:['صحيحة تماماً','#35A96A'],2:['فيها شي من الصح','#3FB8A0'],3:['مشكوك فيها','#E0A22C'],4:['خزعبلة','#E2603F'],5:['خزعبلة كبرى','#DC4C4C']}`. (يضمّن مقياسه الخاص ولا يعيد استخدام `Meter.astro`؛ يوجد `const lamps` ميت بسطر 12.)
- `admin/index.astro` — تبويبات فلترة (أزرار `data-filter`، صفوف `data-status`) + حذف. · `admin/settings.astro` — إزالة عضو (لغير المالك فقط؛ منتقي الدور `<span>` ثابت). · `Header.astro` — قائمة الجوال.

**⚠️ روابط لسا `href="#"` (تُربط في Stage 2، ليست معطّلة عمدًا):** شريط مشاركة المقال، «كل الخزعبلات ›»، «شوف المزيد»، وسوم البحث، رابط X بالفوتر، و`/feed.xml` غير موجود.

## 3) الخطوات المتبقية (مرقّمة بالترتيب)
1. **تنظيف سريع:** اربط روابط `href="#"` الحقيقية (مشاركة/CTAs)، وأزل أو عمّم `CAT`/`categories` الميتة، واحذف `const lamps` الميت.
2. **سيو لكل صفحة:** `description` مخصّص + Open Graph + Twitter Card + `canonical` في `Base.astro`.
3. **Schema.org:** `Article` + `BreadcrumbList` + `ClaimReview` + `FAQPage` + `Organization/WebSite`.
4. **ملفات تقنية:** `sitemap.xml` · `robots.txt` · `feed.xml` (RSS) · `public/ads.txt`.
5. **الخطوط:** استضافة محلية بدل Google CDN (أسرع + خصوصية).
6. **Stage 2 (Supabase):** أنشئ مشروع Supabase → جداول (`articles`, `profiles/roles`, `invites`) → Auth + RLS + حماية `/admin/*` (middleware) → اربط أزرار اللوحة (نشر/حذف/دعوة/رفع صورة → Cloudflare R2) → حوّل الصفحات لجلب من Supabase + on-demand revalidate.
7. **قبل AdSense:** نطاق مخصّص + نشر Cloudflare Pages + 25–30 مقالًا أصليًا + GA4/Search Console + بانر موافقة كوكيز + مواضع إعلانات (≤5، بوسم «إعلان» وارتفاع محجوز).

## 4) القرارات المهمة وأسبابها
- **Astro (مو Next/Angular):** موقع محتوى للسيو/AdSense، وAstro أخف (صفر JS افتراضي = أسرع)، وأنسب لمهارة المستخدم في HTML/CSS/Bootstrap.
- **Bootstrap 5 RTL + متغيّرات CSS:** يُستورد `bootstrap.rtl.min.css` وتُعاد الألوان بالتوكنز.
- **Cloudflare Pages (مو Vercel):** باقة Vercel المجانية لغير التجاري، والموقع تجاري (إعلانات). Cloudflare مجاني حتى تجاريًا.
- **صور على Cloudflare R2 (مو Supabase Storage):** للحفاظ على حصة Supabase المجانية.
- **الوضع الغامق = الهوية** (الفاتح مؤجّل).
- **الباك أوفيس بسيط** (إضافة/تعديل/حذف فقط، بلا إحصائيات) — بطلب صريح.
- **التحقّق عبر `npm run build`** — لا يوجد lint/test في المشروع.

## 5) المحاولات الفاشلة (حتى لا تتكرّر)
- **RTL — الخطأ الأكبر (تكرّر):** `text-end`/`text-align:end`/`justify-content:flex-end` في `dir="rtl"` = **يسار**. للـيمين استخدم `start`/`flex-start`، وفي `space-between` ضع العنصر الأيمن أولًا. آخر مخالفة (`AdminLayout.astro:49`) صُحّحت؛ المستودع الآن نظيف (صفر `end`/`flex-end`).
- **الافتراض أن المشروع Astro 5:** خطأ — هو **Astro ^7.2.0** (تحقّق دائمًا من `package.json`، لا تعتمد الذاكرة).
- **الأسهم `‹`/`›`:** تنعكس bidi؛ استخدم `›` ليظهر يسار («التالي» في RTL).
- **Figma `use_figma`:** يرفض مسارات SVG مضغوطة/arcs → استخدم مسارات نظيفة M/L/C/Z؛ `layoutPositioning='ABSOLUTE'` يفشل بلا أب auto-layout. (أخطاء Figma فقط، لا الكود.)
- **متصفّح المعاينة:** أحيانًا `viewport=0×0` → تحقّق عبر JS أو أعِد `preview_start`.
- **`astro check`:** تفاعلي فيتعلّق → استخدم `npm run build`.
- **ورك-فلو مراجعة (٥ وكلاء):** فشل بحدّ الجلسة سابقًا؛ يعمل بعد تصفير الحدّ.

## 6) أوامر التشغيل والاختبار
> **قبل أي أمر Node فعّل nvm** (لا Node نظامي):
> ```bash
> export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
> ```
```bash
cd /Users/machhm/Desktop/cloud_skils/khazaabalat
npm run dev        # تطوير — http://localhost:4321
npm run build      # بناء + تحقّق — المتوقّع: 17 صفحة، 0 أخطاء
npm run preview    # معاينة البناء
```
**لا يوجد أمر lint أو test** (غير مُعرّفَين). التحقّق = `npm run build`.

**فحص يدوي سريع:** كل النص يبدأ يمينًا (RTL) · الجوال: برجر يفتح + الفانوس/الهلال مخفيان · التنقّل النشط ذهبي · أزرار تلجرام تفتح الرابط · فهرس المقال ينقل بنعومة · `admin/new` انقر فوانيس المقياس.

## ملاحظات بيئة
- macOS · Git مثبّت · Node v24.19.0 عبر nvm (لا Homebrew، لا Node نظامي) · `CLAUDE.md` = symlink لـ`AGENTS.md`.
- حسابات Stage 2 (ينشئها المستخدم): GitHub + Supabase + Cloudflare + Google (AdSense/GA4/Search Console) + نطاق مدفوع.
