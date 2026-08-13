# CLAUDE.md — مشروع «خزعبلات»

> هذا الملف هو الهدف الحقيقي، و`CLAUDE.md` رابط رمزي (symlink) يشير إليه — فتحديث أحدهما يحدّث الآخر.

## نظرة عامة
موقع محتوى عربي **RTL** (ثيم ليلي غامق + فانوس ذهبي) يجمع الغموض/الشعبيات/الفكاهة، مموّل بـ Google AdSense، مع باك أوفيس مبسّط لإدارة المحتوى والفريق. المرحلة الحالية: الواجهة (Stage 1) مكتملة وتبني بنجاح؛ التالي ربط قاعدة البيانات (Stage 2).

## التقنيات والإصدارات
> مأخوذة حرفيًا من `package.json` / الإعدادات — لا تُخمّن.
- **Astro** `^7.2.0` (مولّد مواقع ثابت، بلا adapter، `astro.config.mjs` = `defineConfig({})` فارغ).
- **Bootstrap** `^5.3.8` — تُستورد نسخة RTL: `bootstrap/dist/css/bootstrap.rtl.min.css`.
- **@popperjs/core** `^2.11.8`.
- **TypeScript** — `tsconfig.json` يمتد من `astro/tsconfigs/strict`.
- **Node** — `engines.node` = `>=22.12.0` (المثبّت حاليًا: v24.19.0 عبر **nvm**، لا يوجد Node نظامي).
- **مدير الحِزم**: npm (`package-lock.json`).
- **بلا** أدوات lint / prettier / test (لا eslint، لا vitest/jest/playwright، لا `.nvmrc`).

## الأوامر الفعلية
> **قبل أي أمر Node فعّل nvm** (لا يوجد Node نظامي):
> ```bash
> export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
> ```
| الغرض | الأمر | ملاحظة |
|------|-------|--------|
| تطوير | `npm run dev` | يشغّل `astro dev` على http://localhost:4321 |
| بناء | `npm run build` | يشغّل `astro build` — المتوقّع: **17 صفحة، 0 أخطاء** |
| معاينة البناء | `npm run preview` | `astro preview` |
| Astro CLI مباشر | `npm run astro -- <cmd>` | مثل `npm run astro -- add` |
| **Lint** | — | **غير مُعرّف** (لا سكربت lint) |
| **Test** | — | **غير مُعرّف** (لا إطار اختبار) |

**طريقة التحقّق المعتمدة = `npm run build`** (لا يوجد lint/test). لا تستخدم `astro check` (يطلب `@astrojs/check` تفاعليًا فيتعلّق).

## خريطة المجلدات
```
khazaabalat/
├─ public/            أصول ثابتة: favicon.ico, favicon.svg
├─ src/
│  ├─ data/site.ts        المصدر الوحيد للثوابت والبيانات (TELEGRAM_URL, doors, articles, CAT/categories, الأنواع)
│  ├─ styles/             CSS عام: theme.css (توكنز الهوية + المكوّنات) · admin.css (اللوحة)
│  ├─ layouts/            القوالب: Base.astro (شل الموقع) · AdminLayout.astro (شل اللوحة)
│  ├─ components/         مكوّنات .astro: Header, Hero, Footer, DoorsGallery, ArticleCard, Meter, TelegramCTA, Ornament, PageHeader
│  └─ pages/              المسارات:
│     ├─ *.astro              صفحات عامة: index, about, article, articles, contact, methodology, privacy, terms, search, 404
│     ├─ admin/               اللوحة: index (المحتوى), new (محرّر), settings (الفريق)
│     └─ category/[door].astro  مسار ديناميكي (getStaticPaths) لأبواب التصنيف الأربعة
├─ astro.config.mjs · tsconfig.json · package.json
├─ CLAUDE.md(→AGENTS.md) · HANDOFF.md · README.md
```

## أنماط وقواعد الكود (اتّبعها)
- **RTL — القاعدة الحاكمة:** المحاذاة لليمين تكون بـ**المنطقية** `text-align:start` / `justify-content:flex-start` — **لا** تستخدم `end`/`flex-end`/`text-end` (في RTL النهاية = يسار). في صفوف `space-between` ضع العنصر الأيمن **أولًا** في DOM. (مرجع: `theme.css:61`, `admin.css:11`.)
- **توكنز التصميم:** كل الألوان/الحواف/الخطوط عبر متغيّرات CSS في `src/styles/theme.css` (مثل `--night-800`, `--lantern-500`, `--radius-md`, `--text-primary`, `--font-heading`). لا ألوان hex صريحة في المكوّنات إن وُجد توكن.
- **مصدر بيانات واحد:** الثوابت والبيانات المشتركة في `src/data/site.ts` فقط (`TELEGRAM_URL`, `doors`, `articles`, نوع `Article`). لا تكرّر روابط/ألوان في الصفحات.
- **التفاعل = JS خام داخل `<script>` في ملفات `.astro`** (بلا React/Vue). سكربت `is:inline` في `Base.astro:21` يضيف صنف `js`؛ الظهور عند التمرير عبر `IntersectionObserver` (`Base.astro:26`) على عناصر `[data-reveal]` (مع احترام `prefers-reduced-motion`).
- **التنسيق:** Bootstrap RTL (`bootstrap.rtl.min.css`) + `theme.css`؛ الجذر `<html lang="ar" dir="rtl" data-bs-theme="dark">`؛ متغيّرات Bootstrap مُعاد ربطها بالتوكنز.
- **الخطوط:** Google Fonts — Cairo (عناوين) · Rakkas (عرض) · Readex Pro (متن).
- **الأنواع:** props المكوّنات عبر `interface Props` + `const { ... } = Astro.props` (مثل `ArticleCard.astro:3`). لا `any`.
- **المسارات الديناميكية:** استخدم `getStaticPaths` (مثل `category/[door].astro:9`).

## قواعد إدارة السياق
- **استخدم subagent لأي بحث أو استكشاف واسع** (Explore / general-purpose) وارجع بالخلاصة فقط — لا تُحمّل ملفات كبيرة في السياق الرئيسي.
- **لا تقرأ ملفاً كاملاً إذا يكفي `Grep`/بحث محدّد** للوصول للسطر المطلوب.
- **حدّث `HANDOFF.md` بعد كل مَعلَم مهم، وقبل أي ضغط للسياق** (أو استدعِ `/handoff` لإعادة توليده).
- **لا تُخرج مخرجات أوامر ضخمة في السياق** — وجّهها لملف (`> /tmp/out.txt 2>&1`) ثم اقرأ منه ما يهمّ فقط (أو `| tail`).
- عند بدء جلسة جديدة: استدعِ `/resume-work` ليقرأ `HANDOFF.md` ويلخّص نقطة التوقّف قبل أن يبدأ.

## مراجع Astro (عند العمل على مهمة متعلقة)
- التوثيق الكامل: https://docs.astro.build
- المسارات/الوسيط (routing/middleware): https://docs.astro.build/en/guides/routing/
- مكوّنات Astro: https://docs.astro.build/en/basics/astro-components/
- التنسيق (styling): https://docs.astro.build/en/guides/styling/
- إدارة المحتوى (content collections): https://docs.astro.build/en/guides/content-collections/
