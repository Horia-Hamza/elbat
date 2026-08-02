export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  previewGradient: string;
  previewIcon: string;
  html: string;
  css: string;
}

// ── Shared base CSS injected into every template ─────────────
const baseCss = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Cairo',sans-serif;direction:rtl}
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
`;

// ════════════════════════════════════════════════════
// Template 1 — Classic Clean (White / Indigo)
// ════════════════════════════════════════════════════
const classicHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{name}} | متجر البط</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Cairo',sans-serif;direction:rtl;background:#f5f5f7;color:#1d1d1f}
.nav{background:white;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 8px rgba(0,0,0,.06);position:sticky;top:0;z-index:10}
.nav-brand{font-weight:800;font-size:1.3rem;color:#6366f1}
.container{max-width:1100px;margin:3rem auto;padding:0 1.5rem}
.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.img-wrap{border-radius:20px;overflow:hidden;background:white;box-shadow:0 8px 40px rgba(0,0,0,.1);aspect-ratio:1}
.img-wrap img{width:100%;height:100%;object-fit:cover}
.info{padding:1rem 0}
.badge{display:inline-block;background:#eef2ff;color:#6366f1;font-size:.8rem;font-weight:600;padding:.3rem .9rem;border-radius:20px;margin-bottom:1rem}
.product-name{font-size:2.2rem;font-weight:800;line-height:1.3;margin-bottom:1rem;color:#1d1d1f}
.product-desc{font-size:1rem;color:#6b7280;line-height:1.8;margin-bottom:2rem}
.price-row{display:flex;align-items:baseline;gap:.8rem;margin-bottom:2rem}
.price-main{font-size:2.4rem;font-weight:800;color:#6366f1}
.price-old{font-size:1.2rem;color:#9ca3af;text-decoration:line-through}
.btn-cart{width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:1.1rem;border-radius:14px;font-size:1.15rem;font-family:'Cairo',sans-serif;font-weight:700;cursor:pointer;transition:.2s;margin-bottom:1rem}
.btn-cart:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(99,102,241,.4)}
.btn-wish{width:100%;background:white;color:#6366f1;border:2px solid #e5e7eb;padding:1rem;border-radius:14px;font-size:1rem;font-family:'Cairo',sans-serif;font-weight:600;cursor:pointer}
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:2.5rem}
.feature{background:white;border-radius:12px;padding:1.2rem;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.05)}
.feature-icon{font-size:1.6rem;margin-bottom:.5rem}
.feature-label{font-size:.82rem;color:#6b7280;font-weight:600}
@media(max-width:768px){.product-grid{grid-template-columns:1fr}.features{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<nav class="nav">
  <span class="nav-brand"> متجر البط</span>
  <span style="color:#6b7280;font-size:.9rem">شحن دولي مجاني</span>
</nav>
<div class="container">
  <div class="product-grid">
    <div class="img-wrap">
      <img src="{{mainImageUrl}}" alt="{{name}}" onerror="this.src='/logo.png'"/>
    </div>
    <div class="info">
      <span class="badge">{{subCategoryName}}</span>
      <h1 class="product-name">{{name}}</h1>
      <p class="product-desc">{{description}}</p>
      <div class="price-row">
        <span class="price-main">{{salePrice}} ج.م</span>
        <span class="price-old">{{basePrice}} ج.م</span>
      </div>
      <button class="btn-cart">🛒 أضف إلى السلة</button>
      <button class="btn-wish">♡ أضف للمفضلة</button>
      <div class="features">
        <div class="feature"><div class="feature-icon">✈️</div><div class="feature-label">شحن دولي سريع</div></div>
        <div class="feature"><div class="feature-icon">🔒</div><div class="feature-label">دفع آمن 100%</div></div>
        <div class="feature"><div class="feature-icon">↩️</div><div class="feature-label">إرجاع مجاني</div></div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// ════════════════════════════════════════════════════
// Template 2 — Bold Dark (Premium Dark Mode)
// ════════════════════════════════════════════════════
const darkHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{name}} | متجر البط</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Cairo',sans-serif;direction:rtl;background:#0a0a0f;color:white;min-height:100vh}
.nav{background:rgba(255,255,255,.04);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.08);padding:1.2rem 2.5rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
.nav-brand{font-weight:900;font-size:1.4rem;background:linear-gradient(135deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.container{max-width:1180px;margin:0 auto;padding:4rem 1.5rem}
.product-wrap{display:grid;grid-template-columns:55% 1fr;gap:4rem;align-items:center}
.img-stack{position:relative}
.img-glow{position:absolute;inset:-20px;background:radial-gradient(ellipse,rgba(167,139,250,.25),transparent 70%);border-radius:30px;filter:blur(15px)}
.img-main{position:relative;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.1);box-shadow:0 30px 80px rgba(0,0,0,.5)}
.img-main img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.info{padding:1rem 0}
.tag{font-size:.8rem;font-weight:700;color:#a78bfa;letter-spacing:.1em;text-transform:uppercase;margin-bottom:1.5rem}
.product-name{font-size:2.6rem;font-weight:900;line-height:1.2;margin-bottom:1.2rem;background:linear-gradient(135deg,white,rgba(255,255,255,.7));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.product-desc{font-size:1rem;color:rgba(255,255,255,.55);line-height:1.9;margin-bottom:2.5rem}
.price-block{background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:16px;padding:1.5rem;margin-bottom:2rem}
.price-label{font-size:.8rem;color:rgba(255,255,255,.4);margin-bottom:.4rem}
.price-main{font-size:2.8rem;font-weight:900;color:#a78bfa}
.price-old{font-size:1.1rem;color:rgba(255,255,255,.3);text-decoration:line-through;margin-right:.8rem}
.btn-cart{width:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;border:none;padding:1.2rem;border-radius:14px;font-size:1.15rem;font-family:'Cairo',sans-serif;font-weight:800;cursor:pointer;transition:.25s;margin-bottom:.8rem;letter-spacing:.03em}
.btn-cart:hover{transform:translateY(-3px);box-shadow:0 15px 40px rgba(124,58,237,.45)}
.btn-wish{width:100%;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.12);padding:1rem;border-radius:14px;font-size:1rem;font-family:'Cairo',sans-serif;font-weight:600;cursor:pointer;transition:.2s}
.btn-wish:hover{background:rgba(255,255,255,.1)}
.pills{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:2rem}
.pill{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:.4rem 1rem;font-size:.8rem;color:rgba(255,255,255,.6)}
@media(max-width:768px){.product-wrap{grid-template-columns:1fr}}
</style>
</head>
<body>
<nav class="nav">
  <span class="nav-brand"> متجر البط</span>
  <span style="color:rgba(255,255,255,.4);font-size:.85rem">Premium Collection</span>
</nav>
<div class="container">
  <div class="product-wrap">
    <div class="img-stack">
      <div class="img-glow"></div>
      <div class="img-main"><img src="{{mainImageUrl}}" alt="{{name}}" onerror="this.src='/logo.png'"/></div>
    </div>
    <div class="info">
      <h1 class="product-name">{{name}}</h1>
      <p class="product-desc">{{description}}</p>
      <div class="price-block">
        <div class="price-label">السعر الحالي</div>
        <div><span class="price-main">{{salePrice}} ج.م</span><span class="price-old">{{basePrice}}</span></div>
      </div>
      <button class="btn-cart">⚡ اشتري الآن</button>
      <button class="btn-wish">♡ حفظ في المفضلة</button>
      <div class="pills">
        <span class="pill">✈️ شحن عالمي</span>
        <span class="pill">🔒 دفع آمن</span>
        <span class="pill">↩️ إرجاع مجاني</span>
        <span class="pill">⭐ ضمان الجودة</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// ════════════════════════════════════════════════════
// Template 3 — Gradient Vibrant (Colorful / Fun)
// ════════════════════════════════════════════════════
const vibrantHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{name}} | متجر البط</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Cairo',sans-serif;direction:rtl;background:linear-gradient(135deg,#fdf4ff 0%,#eff6ff 50%,#f0fdf4 100%);min-height:100vh;color:#1a1a2e}
.nav{background:white;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid transparent;border-image:linear-gradient(90deg,#f59e0b,#ec4899,#6366f1) 1}
.nav-brand{font-weight:900;font-size:1.35rem;background:linear-gradient(135deg,#f59e0b,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero{padding:4rem 1.5rem;max-width:1150px;margin:0 auto}
.product-card{background:white;border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.1);display:grid;grid-template-columns:1fr 1fr}
.img-side{background:linear-gradient(135deg,#fdf4ff,#eff6ff);display:flex;align-items:center;justify-content:center;padding:3rem;min-height:480px}
.img-side img{width:100%;max-height:380px;object-fit:contain;filter:drop-shadow(0 20px 40px rgba(99,102,241,.2))}
.content-side{padding:3.5rem}
.cat-pill{display:inline-flex;align-items:center;gap:.4rem;background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;font-size:.82rem;font-weight:700;padding:.4rem 1rem;border-radius:20px;margin-bottom:1.5rem}
.product-name{font-size:2rem;font-weight:900;line-height:1.3;margin-bottom:1rem;color:#111827}
.product-desc{color:#6b7280;line-height:1.9;margin-bottom:2rem;font-size:.95rem}
.price-section{background:linear-gradient(135deg,#fdf4ff,#eff6ff);border-radius:16px;padding:1.5rem;margin-bottom:2rem}
.price-tag{font-size:2.5rem;font-weight:900;background:linear-gradient(135deg,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.price-was{font-size:.9rem;color:#9ca3af;margin-top:.2rem}
.price-was span{text-decoration:line-through}
.btn-main{width:100%;background:linear-gradient(135deg,#f59e0b,#ec4899);color:white;border:none;padding:1.1rem;border-radius:14px;font-size:1.1rem;font-family:'Cairo',sans-serif;font-weight:800;cursor:pointer;transition:.25s;margin-bottom:.8rem}
.btn-main:hover{transform:translateY(-2px);box-shadow:0 12px 35px rgba(236,72,153,.4)}
.btn-sec{width:100%;background:transparent;color:#6366f1;border:2px solid #e5e7eb;padding:1rem;border-radius:14px;font-size:.95rem;font-family:'Cairo',sans-serif;font-weight:600;cursor:pointer;transition:.2s}
.btn-sec:hover{border-color:#6366f1;background:#eef2ff}
.badges{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1.5rem}
.bdg{background:#f3f4f6;border-radius:8px;padding:.4rem .8rem;font-size:.78rem;color:#6b7280;font-weight:600}
@media(max-width:768px){.product-card{grid-template-columns:1fr}.img-side{min-height:280px}}
</style>
</head>
<body>
<nav class="nav">
  <span class="nav-brand"> متجر البط</span>
  <span style="font-size:.85rem;color:#9ca3af">خيارك الأمثل دائماً</span>
</nav>
<div class="hero">
  <div class="product-card">
    <div class="img-side">
      <img src="{{mainImageUrl}}" alt="{{name}}" onerror="this.src='/logo.png'"/>
    </div>
    <div class="content-side">
      <span class="cat-pill">🏷️ {{subCategoryName}}</span>
      <h1 class="product-name">{{name}}</h1>
      <p class="product-desc">{{description}}</p>
      <div class="price-section">
        <div class="price-tag">{{salePrice}} ج.م</div>
        <div class="price-was">السعر الأصلي: <span>{{basePrice}} ج.م</span></div>
      </div>
      <button class="btn-main">🛒 أضف للسلة فوراً</button>
      <button class="btn-sec">♡ أضف للمفضلة</button>
      <div class="badges">
        <span class="bdg">✈️ شحن دولي</span>
        <span class="bdg">🔒 آمن 100%</span>
        <span class="bdg">🎁 تغليف هدايا</span>
        <span class="bdg">↩️ إرجاع 30 يوم</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'classic',
    name: 'كلاسيكي نظيف',
    description: 'تصميم أبيض أنيق بلون إندجو هادئ — مناسب لأغلب المنتجات',
    previewGradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    previewIcon: '🎯',
    html: classicHtml,
    css: baseCss,
  },
  {
    id: 'dark',
    name: 'داكن فاخر',
    description: 'وضع داكن بتأثيرات بنفسجية راقية — للمنتجات الحصرية',
    previewGradient: 'linear-gradient(135deg,#0a0a0f,#1e1b4b)',
    previewIcon: '✨',
    html: darkHtml,
    css: baseCss,
  },
  {
    id: 'vibrant',
    name: 'ملوّن وحيوي',
    description: 'تصميم مشرق بتدرجات لونية جذابة — للمنتجات المرحة',
    previewGradient: 'linear-gradient(135deg,#f59e0b,#ec4899,#6366f1)',
    previewIcon: '🎨',
    html: vibrantHtml,
    css: baseCss,
  },
  {
    id: 'fashion',
    name: 'تصميم الأزياء والملابس',
    description: 'تصميم متجاوب ومناسب للملابس بألوان المتجر الرسمية ومعرض صور تفاعلي',
    previewGradient: 'linear-gradient(135deg,#236B93,#FFD54F)',
    previewIcon: '👕',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{name}} | متجر البط</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root {
  --primary: #236B93;
  --primary-hover: #1A5372;
  --primary-dark: #123B52;
  --primary-light: #E6F4FA;
  --secondary: #FFD54F;
  --accent: #FF9800;
  --bg-light: #F8FAFC;
  --text-dark: #0F172A;
  --text-muted: #64748B;
  --border-light: #E2E8F0;
  --success: #22C55E;
}
* {
  margin: 0; padding: 0; box-sizing: border-box;
  font-family: 'Cairo', sans-serif;
  -webkit-tap-highlight-color: transparent;
}
body {
  background-color: var(--bg-light);
  color: var(--text-dark);
  direction: rtl; text-align: right;
  line-height: 1.6;
}
.container {
  width: 100%;
  max-width: 100%;
  padding: 1rem 1rem 5rem 1rem;
  background: white;
  min-height: 100vh;
}
.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
.gallery-column {
  width: 100%;
}
.details-column {
  width: 100%;
}
.gallery-section {
  position: relative; background: #fff;
}
.main-image-container {
  width: 100%; aspect-ratio: 1; overflow: hidden;
  background: #f1f5f9; display: flex; align-items: center; justify-content: center;
  position: relative; border-radius: 12px;
}
.main-image-container img {
  width: 100%; height: 100%; object-fit: cover;
  transition: opacity 0.3s ease;
}
.gallery-thumbs {
  display: flex; gap: 0.5rem; padding: 0.75rem 0;
  overflow-x: auto; scrollbar-width: none;
}
.gallery-thumbs::-webkit-scrollbar {
  display: none;
}
.thumb {
  width: 65px; height: 65px; border-radius: 8px;
  overflow: hidden; border: 2px solid transparent;
  cursor: pointer; flex-shrink: 0;
  transition: all 0.2s ease; background: #f8fafc;
}
.thumb.active {
  border-color: var(--primary); transform: scale(1.05);
}
.thumb img {
  width: 100%; height: 100%; object-fit: cover;
}
.product-details {
  padding: 0.5rem 0;
}
.category-tag {
  display: inline-block; color: var(--primary);
  font-size: 0.8rem; font-weight: 700;
  margin-bottom: 0.5rem; text-transform: uppercase;
}
.product-title {
  font-size: 1.4rem; font-weight: 800;
  color: var(--text-dark); margin-bottom: 0.5rem;
  line-height: 1.4;
}
.reviews-summary {
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 1rem; font-size: 0.85rem;
}
.stars {
  color: var(--accent); display: flex; gap: 2px;
}
.review-text {
  color: var(--text-muted);
}
.recommend-badge {
  background: #E8F8F0; color: var(--success);
  font-size: 0.75rem; font-weight: 700;
  padding: 0.15rem 0.5rem; border-radius: 4px;
  margin-right: auto;
}
.price-box {
  background: var(--bg-light); padding: 1rem;
  border-radius: 12px; display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 1.5rem;
  border: 1px solid var(--border-light);
}
.price-labels {
  display: flex; flex-direction: column; gap: 0.2rem;
}
.price-current {
  font-size: 1.8rem; font-weight: 900; color: var(--primary);
}
.price-old {
  font-size: 1rem; color: var(--text-muted); text-decoration: line-through;
}
.discount-badge {
  background: var(--accent); color: white;
  font-size: 0.8rem; font-weight: 800;
  padding: 0.25rem 0.6rem; border-radius: 6px;
}
.selectors-section {
  display: flex; flex-direction: column; gap: 1.25rem;
  margin-bottom: 1.5rem; border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light); padding: 1.25rem 0;
}
.selector-group {
  display: flex; flex-direction: column; gap: 0.5rem;
}
.selector-title {
  font-size: 0.9rem; font-weight: 700; color: var(--text-dark);
}
.selector-title .selected-val {
  color: var(--primary); font-weight: 800; margin-right: 0.3rem;
}
/* Type 1: Color */
.color-options { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.color-dot {
  width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; border: 2px solid white;
  outline: 1.5px solid var(--border-light); transition: all 0.2s ease;
  position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.color-dot:hover { transform: scale(1.1); }
.color-dot.selected { outline: 2.5px solid var(--primary); transform: scale(1.15); box-shadow: 0 0 0 3px var(--primary-light); }
/* Type 2: Size */
.size-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.size-btn {
  border: 1px solid var(--border-light); background: white;
  color: var(--text-dark); font-weight: 700; font-size: 0.88rem;
  padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;
  transition: all 0.2s ease; min-width: 44px; text-align: center;
}
.size-btn:hover { border-color: var(--primary); color: var(--primary); }
.size-btn.selected {
  border-color: var(--primary); background: var(--primary-light);
  color: var(--primary); box-shadow: 0 0 0 2px var(--primary);
}
/* Type 3: Material */
.material-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.material-btn {
  border: 1px solid var(--border-light); background: #f8fafc;
  color: var(--text-dark); font-weight: 600; font-size: 0.85rem;
  padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer;
  transition: all 0.2s ease; display: flex; align-items: center; gap: 0.3rem;
}
.material-btn:hover { background: white; border-color: var(--primary); }
.material-btn.selected {
  border-color: var(--primary); background: var(--primary-light);
  color: var(--primary); font-weight: 700;
}
/* Type 4: Style */
.style-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.style-btn {
  border: 1px solid var(--border-light); background: white;
  color: var(--text-dark); font-weight: 600; font-size: 0.85rem;
  padding: 0.55rem 1.1rem; border-radius: 10px; cursor: pointer;
  transition: all 0.2s ease;
}
.style-btn:hover { border-color: var(--primary); }
.style-btn.selected {
  border-color: var(--primary); background: var(--primary-light);
  color: var(--primary); box-shadow: 0 0 0 2px var(--primary);
}
/* Type 5: Custom */
.custom-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.custom-btn {
  border: 1px solid var(--border-light); background: white;
  color: var(--text-dark); font-weight: 600; font-size: 0.85rem;
  padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;
  transition: all 0.2s ease;
}
.custom-btn.selected {
  border-color: var(--primary); background: var(--primary-light);
  color: var(--primary);
}
.desktop-actions {
  display: none;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.description-section {
  margin-bottom: 2rem;
}
.section-h {
  font-size: 1rem; font-weight: 800;
  margin-bottom: 0.75rem; color: var(--text-dark);
  display: flex; align-items: center; gap: 0.4rem;
}
.description-text {
  color: var(--text-muted); font-size: 0.9rem; line-height: 1.7;
}
.features-list {
  display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem;
}
.feature-item {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.85rem; color: var(--text-dark);
}
.feature-icon {
  color: var(--primary); font-weight: bold;
}
.sticky-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: white; padding: 0.75rem 1.25rem;
  box-shadow: 0 -4px 15px rgba(0,0,0,0.08);
  display: flex; gap: 0.75rem; z-index: 99;
}
.sticky-bar-inner {
  max-width: 600px; width: 100%; margin: 0 auto;
  display: flex; gap: 0.75rem;
}
.btn-buy-now {
  flex: 2; background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: white; border: none; font-weight: 700; font-size: 1rem;
  padding: 0.9rem; border-radius: 12px; cursor: pointer;
  transition: all 0.2s ease; display: flex; align-items: center;
  justify-content: center; gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(35, 107, 147, 0.2);
}
.btn-buy-now:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(35, 107, 147, 0.3);
}
.btn-add-cart {
  flex: 1; background: var(--secondary); color: var(--text-dark);
  border: none; font-weight: 700; font-size: 0.95rem;
  padding: 0.9rem; border-radius: 12px; cursor: pointer;
  transition: all 0.2s ease; display: flex; align-items: center;
  justify-content: center;
}
.btn-add-cart:hover {
  background: var(--accent); color: white;
}
@media(min-width: 769px) {
  body {
    background-color: white;
    padding: 0;
  }
  .container {
    border-radius: 0;
    box-shadow: none;
    min-height: 100vh;
    padding: 2.5rem 5%;
  }
  .product-grid {
    grid-template-columns: 1.15fr 0.85fr;
    gap: 3rem;
  }
  .desktop-actions {
    display: flex;
  }
  .sticky-bar {
    display: none;
  }
}
</style>
</head>
<body>
  <div class="container">
    <div class="product-grid">
      <!-- Right Side: Gallery -->
      <div class="gallery-column">
        <div class="gallery-section">
          <div class="main-image-container">
            <img id="main-image" src="{{mainImageUrl}}" alt="{{name}}" onerror="this.src='/logo.png'"/>
          </div>
          <div class="gallery-thumbs" id="thumbs-list">
            <div class="thumb active" onclick="changeActiveImage('{{mainImageUrl}}', this)">
              <img src="{{mainImageUrl}}" alt="{{name}}" onerror="this.src='/logo.png'"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Left Side: Product details -->
      <div class="details-column">
        <div class="product-details">
          <h1 class="product-name" style="margin-bottom: 0.5rem; font-size: 1.6rem; font-weight: 800;">{{name}}</h1>

          <div class="reviews-summary">
            <div class="stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span class="review-text"><strong>5.0</strong> (100% تقييمات إيجابية)</span>
            <span class="recommend-badge">👍 100% موصى به</span>
          </div>

          <div class="price-box">
            <div class="price-labels">
              <span class="price-current">{{salePrice}} ج.م</span>
              <span class="price-old">{{basePrice}} ج.م</span>
            </div>
            <span class="discount-badge" id="discount-percent">توفير رائع</span>
          </div>

          <!-- Dynamic Variant Selectors Container -->
          <div class="selectors-section" id="selectors-section" style="display: none;"></div>

          <!-- Desktop Buttons -->
          <div class="desktop-actions">
            <button class="btn-buy-now" onclick="alert('جاري إتمام الطلب الشراء المباشر...')">
              <span>⚡</span> شراء الآن
            </button>
            <button class="btn-add-cart" onclick="alert('تمت إضافة المنتج إلى السلة بنجاح')">
              إضافة للسلة
            </button>
          </div>

          <div class="description-section">
            <div class="section-h">
              <span>📋</span> تفاصيل المنتج
            </div>
            <p class="description-text">{{description}}</p>

            <div class="features-list">
              <div class="feature-item"><span class="feature-icon">✓</span> خامة قطنية ممتازة وناعمة جداً على البشرة</div>
              <div class="feature-item"><span class="feature-icon">✓</span> تصميم عصري ومريح يناسب جميع الأوقات</div>
              <div class="feature-item"><span class="feature-icon">✓</span> ألوان ثابتة ومقاومة للبهتان مع الغسيل المتكرر</div>
            </div>
          </div>

          <div style="background: var(--bg-light); border-radius: 12px; padding: 1rem; border: 1px dashed var(--border-light); margin-bottom: 2rem;">
            <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.3rem;">
              <span>🚚</span> سياسة الشحن والإرجاع السريع
            </div>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">
              شحن وتوصيل سريع خلال 2-4 أيام عمل. إمكانية الاستبدال أو الإرجاع مجاناً بالكامل خلال 14 يوماً من الاستلام.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="sticky-bar">
    <div class="sticky-bar-inner">
      <button class="btn-buy-now" onclick="alert('جاري إتمام الطلب الشراء المباشر...')">
        <span>⚡</span> شراء الآن
      </button>
      <button class="btn-add-cart" onclick="alert('تمت إضافة المنتج إلى السلة بنجاح')">
        إضافة للسلة
      </button>
    </div>
  </div>

  <script>
    const basePrice = parseFloat("{{basePrice}}") || 0;
    const salePrice = parseFloat("{{salePrice}}") || 0;
    if (basePrice > salePrice && salePrice > 0) {
      const discount = Math.round(((basePrice - salePrice) / basePrice) * 100);
      document.getElementById('discount-percent').textContent = "خصم " + discount + "%";
    } else {
      document.getElementById('discount-percent').style.display = 'none';
      document.querySelector('.price-old').style.display = 'none';
    }

    function changeActiveImage(imgUrl, element) {
      const mainImg = document.getElementById('main-image');
      mainImg.style.opacity = 0.3;
      setTimeout(() => {
        mainImg.src = imgUrl;
        mainImg.style.opacity = 1;
      }, 150);

      const thumbs = document.querySelectorAll('.thumb');
      thumbs.forEach(t => t.classList.remove('active'));
      element.classList.add('active');
    }

    function renderVariantSelectors(variants) {
      const container = document.getElementById('selectors-section');
      if (!container) return;
      container.innerHTML = '';

      if (!variants || !Array.isArray(variants) || variants.length === 0) {
        container.style.display = 'none';
        return;
      }

      const TYPE_NAMES = {
        1: 'اللون المتوفر:',
        2: 'المقاس المتوفر:',
        3: 'الخامة المتوفرة:',
        4: 'الستايل المتوفر:',
        5: 'الخيارات المتاحة:'
      };

      const groups = {};
      const targetPid = "{{id}}";
      variants.forEach(function(v) {
        if (v.isActive === false) return;
        if (v.productId && targetPid && targetPid !== "{" + "{id}}" && String(v.productId) !== String(targetPid)) return;
        const t = (v.type !== undefined && v.type !== null && v.type !== 0) ? v.type : (v.color ? 1 : v.size ? 2 : 5);
        if (!groups[t]) groups[t] = [];
        groups[t].push(v);
      });

      const groupKeys = Object.keys(groups);
      if (groupKeys.length === 0) {
        container.style.display = 'none';
        return;
      }

      container.style.display = 'flex';
      container.innerHTML = '';

      groupKeys.forEach(function(typeStr) {
        const type = parseInt(typeStr);
        const items = groups[type];
        if (!items || items.length === 0) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'selector-group';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'selector-title';
        titleDiv.style.display = 'flex';
        titleDiv.style.alignItems = 'center';
        titleDiv.style.justifyContent = 'space-between';
        titleDiv.style.flexWrap = 'wrap';
        titleDiv.style.gap = '0.4rem';

        function updateTitleWithStock(t, item) {
          const qty = item.inventory ? (item.inventory.availableQuantity !== undefined ? item.inventory.availableQuantity : item.inventory.quantity) : null;
          let stockBadge = '';
          if (qty !== null && qty !== undefined) {
            const isLow = qty <= 5;
            const bg = isLow ? '#FEF3C7' : '#E6F4FA';
            const fg = isLow ? '#D97706' : '#236B93';
            const border = isLow ? '#F59E0B' : '#BAE6FD';
            stockBadge = '<span style="font-size:0.78rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:6px; background:' + bg + '; color:' + fg + '; border:1px solid ' + border + ';">المتبقي: ' + qty + ' قطعة</span>';
          }
          const nameVal = item.name || item.value || '';
          titleDiv.innerHTML = '<span>' + (TYPE_NAMES[t] || 'الخيار المتوفر:') + ' <span class="selected-val" style="color:var(--primary, #236B93); font-weight:800; margin-right:0.3rem;">' + nameVal + '</span></span>' + stockBadge;
        }

        updateTitleWithStock(type, items[0]);
        groupDiv.appendChild(titleDiv);

        var optionsDiv = document.createElement('div');

      function updateLowStockBanner(v) {
        let alertBanner = document.getElementById('low-stock-alert-banner');
        if (!v || !v.inventory) {
          if (alertBanner) alertBanner.style.display = 'none';
          return;
        }
        const qty = v.inventory.availableQuantity !== undefined ? v.inventory.availableQuantity : v.inventory.quantity;
        if (qty !== null && qty !== undefined && qty > 0) {
          if (!alertBanner) {
            alertBanner = document.createElement('div');
            alertBanner.id = 'low-stock-alert-banner';
            alertBanner.style.cssText = 'background: linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(254, 215, 170, 0.95) 100%); border: 1px solid #F59E0B; color: #B45309; border-radius: 12px; padding: 0.65rem 1rem; margin: 0.75rem 0 1rem 0; display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; font-weight: 700; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.15); transition: all 0.3s ease;';
            const refTarget = document.querySelector('.price-box') || container;
            if (refTarget && refTarget.parentNode) {
              refTarget.parentNode.insertBefore(alertBanner, refTarget.nextSibling);
            } else if (container && container.parentNode) {
              container.parentNode.insertBefore(alertBanner, container);
            }
          }
          alertBanner.style.display = 'flex';
          alertBanner.innerHTML = '<span style="font-size:1.25rem;">🔥</span> <span>سارع بالطلب! متبقي <strong style="color:#D97706; font-size:0.95rem;">' + qty + '</strong> قطع فقط في المخزون — اطلب الآن قبل نفاذ الكمية</span>';
        } else if (alertBanner) {
          alertBanner.style.display = 'none';
        }
      }

      if (type === 1) { // Color
          optionsDiv.className = 'color-options';
          items.forEach(function(v, idx) {
            const dot = document.createElement('div');
            dot.className = 'color-dot' + (idx === 0 ? ' selected' : '');
            var val = (v.value || '').trim();
            var hex = val;
            if (!hex.startsWith('#') && (hex.length === 6 || hex.length === 3)) {
              hex = '#' + hex;
            }
            dot.style.backgroundColor = hex || '#236B93';
            dot.title = v.name || v.value;
            dot.onclick = function() {
              optionsDiv.querySelectorAll('.color-dot').forEach(function(d) { d.classList.remove('selected'); });
              dot.classList.add('selected');
              updateTitleWithStock(type, v);
              updateLowStockBanner(v);
              window.selectedColor = v.name || v.value;
              window.selectedVariantId = v.id;
            };
            optionsDiv.appendChild(dot);
          });
        } else if (type === 2) { // Size
          optionsDiv.className = 'size-options';
          items.forEach(function(v, idx) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'size-btn' + (idx === 0 ? ' selected' : '');
            btn.textContent = (v.value || v.name).toUpperCase();
            btn.onclick = function() {
              optionsDiv.querySelectorAll('.size-btn').forEach(function(b) { b.classList.remove('selected'); });
              btn.classList.add('selected');
              updateTitleWithStock(type, v);
              updateLowStockBanner(v);
              window.selectedSize = v.name || v.value;
              window.selectedVariantId = v.id;
            };
            optionsDiv.appendChild(btn);
          });
        } else if (type === 3) { // Material
          optionsDiv.className = 'material-options';
          items.forEach(function(v, idx) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'material-btn' + (idx === 0 ? ' selected' : '');
            btn.innerHTML = '🧵 ' + (v.name || v.value);
            btn.onclick = function() {
              optionsDiv.querySelectorAll('.material-btn').forEach(function(b) { b.classList.remove('selected'); });
              btn.classList.add('selected');
              updateTitleWithStock(type, v);
              updateLowStockBanner(v);
              window.selectedMaterial = v.name || v.value;
              window.selectedVariantId = v.id;
            };
            optionsDiv.appendChild(btn);
          });
        } else if (type === 4) { // Style
          optionsDiv.className = 'style-options';
          items.forEach(function(v, idx) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'style-btn' + (idx === 0 ? ' selected' : '');
            btn.innerHTML = '✨ ' + (v.name || v.value);
            btn.onclick = function() {
              optionsDiv.querySelectorAll('.style-btn').forEach(function(b) { b.classList.remove('selected'); });
              btn.classList.add('selected');
              updateTitleWithStock(type, v);
              updateLowStockBanner(v);
              window.selectedStyle = v.name || v.value;
              window.selectedVariantId = v.id;
            };
            optionsDiv.appendChild(btn);
          });
        } else { // Custom (type 5)
          optionsDiv.className = 'custom-options';
          items.forEach(function(v, idx) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'custom-btn' + (idx === 0 ? ' selected' : '');
            btn.textContent = v.name || v.value;
            btn.onclick = function() {
              optionsDiv.querySelectorAll('.custom-btn').forEach(function(b) { b.classList.remove('selected'); });
              btn.classList.add('selected');
              updateTitleWithStock(type, v);
              updateLowStockBanner(v);
              window.selectedCustom = v.name || v.value;
              window.selectedVariantId = v.id;
            };
            optionsDiv.appendChild(btn);
          });
        }

        groupDiv.appendChild(optionsDiv);
        container.appendChild(groupDiv);
      });

      if (variants.length > 0) {
        updateLowStockBanner(variants[0]);
      }
    }

    const productId = "{{id}}";
    if (productId && productId !== "{" + "{id}}") {
      const imagesBaseUrl = "https://backapi.hansalhalkmedacademy.com";

      fetch('/api/ProductImage/product/' + productId)
        .then(response => {
          if (!response.ok) throw new Error('Network error');
          return response.json();
        })
        .then(resData => {
          const imagesList = resData.success ? resData.data : (Array.isArray(resData) ? resData : []);
          if (imagesList && imagesList.length > 0) {
            const thumbsList = document.getElementById('thumbs-list');
            thumbsList.innerHTML = '';

            imagesList.forEach((img, idx) => {
              const imgPath = img.imageUrl || img.url || '';
              const resolvedUrl = imgPath.startsWith('http') ? imgPath : imagesBaseUrl + imgPath;
              
              const thumbDiv = document.createElement('div');
              thumbDiv.className = "thumb " + (img.isMain ? 'active' : '');
              
              thumbDiv.onclick = function() {
                changeActiveImage(resolvedUrl, this);
              };

              const imgEl = document.createElement('img');
              imgEl.src = resolvedUrl;
              imgEl.alt = img.altText || "{{name}}";
              imgEl.onerror = function() { this.src = '/logo.png'; };

              thumbDiv.appendChild(imgEl);
              thumbsList.appendChild(thumbDiv);

              if (img.isMain) {
                document.getElementById('main-image').src = resolvedUrl;
              }
            });
          }
        })
        .catch(err => {
          console.warn("Could not fetch additional product images dynamically:", err);
        });

      fetch('/api/Product/' + productId)
        .then(response => response.ok ? response.json() : null)
        .then(prodData => {
          if (prodData && prodData.success && prodData.data) {
            const p = prodData.data;
            if (p.name) document.querySelector('.product-name').textContent = p.name;
            if (p.description) document.querySelector('.description-text').textContent = p.description;
            if (p.variants && p.variants.length > 0) {
              renderVariantSelectors(p.variants);
            }
          }
        })
        .catch(err => {
          console.warn("Could not fetch product details dynamically:", err);
        });

      fetch('/api/ProductVariant?productId=' + productId)
        .then(function(response) { return response.ok ? response.json() : null; })
        .then(function(resData) {
          const vList = resData && resData.success ? resData.data : (Array.isArray(resData) ? resData : []);
          if (vList && vList.length > 0) {
            renderVariantSelectors(vList);
          }
        })
        .catch(function(err) {
          console.warn("Could not fetch variants dynamically:", err);
        });
    }
  </script>
</body>
</html>`,
    css: baseCss,
  },
];
