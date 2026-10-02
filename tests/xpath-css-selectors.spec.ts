import { test, expect } from '@playwright/test';

// Placeholder artwork as inline SVG, so the page needs no network access.
const artwork = (from: string, to: string, shapes: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
       <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
       </linearGradient></defs>
       <rect width="400" height="300" fill="url(#g)"/>${shapes}
     </svg>`
  );

const logo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="36" viewBox="0 0 190 36">
       <path d="M2 32 L18 6 L34 32 Z" fill="#166534"/><path d="M14 32 L26 14 L38 32 Z" fill="#22c55e"/>
       <text x="46" y="25" font-family="Arial, Helvetica, sans-serif" font-size="17"
             font-weight="700" fill="#14532d" letter-spacing="1">TRAILHEAD</text>
     </svg>`
  );

const backpack = artwork('#dcfce7', '#86efac',
  '<rect x="135" y="55" width="130" height="190" rx="36" fill="#14532d"/>' +
  '<rect x="158" y="150" width="84" height="64" rx="14" fill="#166534"/>' +
  '<path d="M150 70 Q200 20 250 70" fill="none" stroke="#14532d" stroke-width="12"/>');
const bikeLight = artwork('#fef9c3', '#fde047',
  '<rect x="120" y="105" width="130" height="80" rx="20" fill="#27272a"/>' +
  '<circle cx="250" cy="145" r="34" fill="#fef08a" stroke="#27272a" stroke-width="10"/>' +
  '<rect x="150" y="185" width="20" height="40" fill="#52525b"/>');
const headlamp = artwork('#dbeafe', '#60a5fa',
  '<rect x="60" y="120" width="280" height="40" rx="20" fill="#1e3a8a"/>' +
  '<rect x="150" y="90" width="100" height="80" rx="18" fill="#0f172a"/>' +
  '<circle cx="200" cy="130" r="22" fill="#fef08a"/>');

// A production-style storefront. setContent() keeps every selector example
// predictable, because a live third-party site can change at any time.
const storefrontHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Trailhead Outfitters | Hiking, camping and cycling gear</title>
<style>
  :root { --green:#166534; --green-dark:#14532d; --accent:#22c55e; --ink:#1f2937; --muted:#6b7280;
          --line:#e5e7eb; --bg:#f5f7f5; }
  * { box-sizing:border-box; }
  body { margin:0; font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
         color:var(--ink); background:var(--bg); padding-bottom:84px; }
  a { color:inherit; text-decoration:none; }
  a:hover { color:var(--green); }
  .wrap { max-width:1180px; margin:0 auto; padding:0 24px; }
  .btn { display:inline-block; padding:11px 22px; border-radius:8px; border:1px solid var(--green);
         background:var(--green); color:#fff; font-family:inherit; font-size:15px; font-weight:600;
         line-height:1.2; cursor:pointer; text-align:center; }
  .btn:hover { background:var(--green-dark); color:#fff; }
  .btn-secondary { background:#fff; color:var(--ink); border-color:#d1d5db; }
  .btn-secondary:hover { background:var(--bg); color:var(--ink); }
  .btn-block { display:block; width:100%; }
  .btn[disabled] { background:#e5e7eb; border-color:#e5e7eb; color:#9ca3af; cursor:not-allowed; }

  .site-header { background:#fff; border-bottom:1px solid var(--line); }
  .bar { display:flex; align-items:center; gap:32px; padding-top:14px; padding-bottom:14px; }
  .search { flex:1; display:flex; }
  .search input { flex:1; padding:10px 16px; border:1px solid var(--line); border-right:0; background:var(--bg);
                  border-radius:999px 0 0 999px; font-size:15px; }
  .search button { padding:0 22px; border:0; background:var(--green); color:#fff; font-weight:600;
                   border-radius:0 999px 999px 0; cursor:pointer; }
  .utility { display:flex; gap:22px; font-size:15px; font-weight:600; }
  .primary ul { display:flex; gap:28px; list-style:none; margin:0 auto; padding:10px 24px;
                max-width:1180px; font-size:15px; font-weight:500; }
  .primary .sale a { color:#b91c1c; }

  .layout { display:grid; grid-template-columns:360px 1fr; gap:32px; padding:36px 24px; max-width:1180px; margin:0 auto; }
  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:26px;
          box-shadow:0 8px 24px rgba(20,83,45,.06); }
  .signin-panel h1 { margin:0 0 4px; font-size:26px; }
  .signin-panel .sub { margin:0 0 20px; color:var(--muted); font-size:14px; }
  .field { margin-bottom:14px; }
  .field label { display:block; margin-bottom:6px; font-size:14px; font-weight:600; }
  .field input { width:100%; padding:10px 13px; border:1px solid #d1d5db; border-radius:8px; font-size:15px; }
  .field input:focus, .search input:focus { outline:3px solid #bbf7d0; border-color:var(--accent); }
  .row { display:flex; justify-content:space-between; align-items:center; margin:2px 0 18px; font-size:14px; }
  .check { display:flex; align-items:center; gap:8px; }
  .check input { width:16px; height:16px; accent-color:var(--green); }
  .row a, .signup a { color:var(--green); font-weight:600; }
  .divider { display:flex; align-items:center; gap:12px; margin:18px 0; color:var(--muted); font-size:13px; }
  .divider::before, .divider::after { content:""; flex:1; height:1px; background:var(--line); }
  .signup { margin:18px 0 0; text-align:center; font-size:14px; color:var(--muted); }

  .deal { display:flex; justify-content:space-between; align-items:center; gap:24px; margin-bottom:28px;
          padding:24px 28px; border-radius:14px; color:#fff;
          background:linear-gradient(120deg,var(--green-dark),var(--green)); }
  .deal-tag { display:inline-block; margin-bottom:8px; padding:2px 10px; border-radius:999px;
              background:#fbbf24; color:#1f2937; font-size:12px; font-weight:700; text-transform:uppercase; }
  .deal h2 { margin:0 0 4px; font-size:24px; }
  .deal p { margin:0; opacity:.85; font-size:14px; }
  .deal-price { text-align:right; }
  .deal-price .price { display:block; font-size:34px; font-weight:800; }
  .deal-price s { opacity:.7; }

  .product-list { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .product-list > h2 { grid-column:1 / -1; margin:0; font-size:22px; }
  .product-item { background:#fff; border:1px solid var(--line); border-radius:14px; overflow:hidden; }
  .product-item img { display:block; width:100%; height:180px; object-fit:cover; }
  .product-item .info { padding:16px; }
  .product-item h2 { margin:6px 0 4px; font-size:18px; }
  .product-item.disabled { opacity:.7; }
  .tag { display:inline-block; padding:2px 10px; border-radius:999px; background:#dcfce7; color:var(--green-dark);
         font-size:12px; font-weight:600; }
  .tag-muted { background:#f3f4f6; color:var(--muted); }
  .product-price { margin:6px 0 14px; font-size:18px; font-weight:700; }

  .side { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px; }
  .side h3 { margin:0 0 10px; font-size:16px; }
  .delivery-options { margin:0 0 10px; padding-left:18px; }
  .note { margin:0; color:var(--muted); font-size:13px; }
  .resources a { color:var(--green); font-weight:600; }
  .reviews { display:grid; gap:10px; margin:12px 0 0; }
  .review { margin:0; padding:12px 14px; border-left:3px solid var(--accent); background:var(--bg); font-size:14px; }

  footer { background:var(--green-dark); color:#d1fae5; padding:44px 0 26px; font-size:14px; }
  .footer-grid { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:32px; }
  footer h3 { margin:0 0 12px; color:#fff; font-size:15px; }
  footer ul { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  footer a:hover { color:#fff; }
  .newsletter label { display:block; margin-bottom:8px; color:#fff; font-weight:600; }
  .newsletter div { display:flex; gap:8px; }
  .newsletter input { flex:1; padding:10px 12px; border:0; border-radius:8px; font-size:14px; }
  .legal { display:flex; justify-content:space-between; margin-top:30px; padding-top:18px;
           border-top:1px solid #166534; color:#a7f3d0; }

  .cookie-banner { position:fixed; left:0; right:0; bottom:0; z-index:10; display:flex; align-items:center;
                   gap:14px; padding:16px 24px; background:#111827; color:#e5e7eb; font-size:14px; }
  .cookie-banner p { flex:1; margin:0; }
  .cookie-banner a { text-decoration:underline; }

  @media (max-width: 900px) {
    .layout, .side, .product-list { grid-template-columns:1fr; }
    .footer-grid { grid-template-columns:1fr 1fr; }
  }
</style>
</head>
<body>

<div class="cookie-banner" role="dialog" aria-label="Cookie consent">
  <p>We use cookies to keep the site working and to improve your experience. See our <a href="#cookies">cookie policy</a>.</p>
  <button type="button" class="btn btn-secondary" id="cookie-reject">Reject non-essential</button>
  <button type="button" class="btn" id="cookie-accept">Accept all</button>
</div>

<header class="site-header">
  <div class="wrap bar">
    <a href="#home"><img src="${logo}" alt="Trailhead Outfitters" width="190" height="36"></a>
    <form class="search" role="search" onsubmit="return false">
      <input id="site-search" type="search" placeholder="Search tents, packs and lights" aria-label="Search the store">
      <button type="submit">Search</button>
    </form>
    <nav class="utility" aria-label="Orders and cart">
      <a href="#orders">Orders</a>
      <a href="#cart">Cart (2)</a>
    </nav>
  </div>
  <nav class="primary" aria-label="Main">
    <ul>
      <li><a href="#hiking">Hiking</a></li>
      <li><a href="#camping">Camping</a></li>
      <li><a href="#cycling">Cycling</a></li>
      <li><a href="#clothing">Clothing</a></li>
      <li><a href="#footwear">Footwear</a></li>
      <li class="sale"><a href="#sale">Sale</a></li>
    </ul>
  </nav>
</header>

<main>
  <div class="layout">

    <section class="card signin-panel">
      <h1>Sign in</h1>
      <p class="sub">Welcome back. Sign in to track orders and check out faster.</p>

      <form id="login-form" novalidate>
        <div class="field">
          <label for="user-name">Username</label>
          <input id="user-name" type="text" autocomplete="username">
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" autocomplete="email">
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" autocomplete="current-password">
        </div>
        <div class="row">
          <label class="check"><input id="remember" type="checkbox"> Remember me</label>
          <a href="#reset">Forgot password?</a>
        </div>
        <button type="submit" class="btn btn-block">  Sign In  </button>
        <div class="divider">or</div>
        <a class="btn btn-secondary btn-block" href="#google">Continue with Google</a>
      </form>

      <p class="signup">New to Trailhead? <a href="#register">Join for free</a></p>
    </section>

    <section class="catalog">
      <div class="deal">
        <div class="deal-copy">
          <span class="deal-tag">Deal of the day</span>
          <h2>Summit 400 Headlamp</h2>
          <p>400 lumens, rechargeable, waterproof to 1 metre.</p>
        </div>
        <div class="deal-price">
          <span class="price">$29.99</span>
          <s>$44.99</s>
        </div>
      </div>

      <section class="product-list" aria-label="Featured gear">
        <h2>Gear picks this week</h2>

        <article class="product-item featured">
          <img src="${backpack}" alt="Ridgeline 40 litre hiking backpack in green">
          <div class="info">
            <span class="tag">Best seller</span>
            <h2>Ridgeline 40L Backpack</h2>
            <p class="product-price">$119.00</p>
            <button type="button" class="btn btn-block">Add to cart</button>
          </div>
        </article>

        <article class="product-item disabled">
          <img src="${bikeLight}" alt="Trailbeam rechargeable bike light">
          <div class="info">
            <span class="tag tag-muted">Out of stock</span>
            <h2>Trailbeam Bike Light</h2>
            <p class="product-price">$39.00</p>
            <button type="button" class="btn btn-block" disabled>Notify me</button>
          </div>
        </article>
      </section>

      <div class="side">
        <aside class="card" aria-label="Delivery">
          <h3>Delivery options</h3>
          <ul class="delivery-options">
            <li>Standard delivery</li>
            <li>Express delivery</li>
          </ul>
          <p class="note">Free standard delivery over $75. Express arrives in 1 to 2 working days.</p>
        </aside>

        <aside class="card resources" aria-label="Resources">
          <h3>Care and resources</h3>
          <a href="/manual.pdf">Download manual</a>
          <div class="reviews">
            <blockquote class="review">"Carried it across the Dolomites, still looks new." Maya R.</blockquote>
            <blockquote class="review">"Fast delivery and easy returns." Daniel K.</blockquote>
          </div>
        </aside>
      </div>
    </section>

  </div>
</main>

<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div class="newsletter">
        <label for="newsletter-email">Get 10% off your first order</label>
        <div>
          <input id="newsletter-email" type="email" placeholder="you@example.com">
          <button type="button" class="btn">Subscribe</button>
        </div>
      </div>
      <div>
        <h3>Shop</h3>
        <ul><li><a href="#hiking">Hiking</a></li><li><a href="#camping">Camping</a></li><li><a href="#cycling">Cycling</a></li></ul>
      </div>
      <div>
        <h3>Support</h3>
        <ul><li><a href="#contact">Contact us</a></li><li><a href="#returns">Returns</a></li><li><a href="#size-guide">Size guide</a></li></ul>
      </div>
      <div>
        <h3>Company</h3>
        <ul><li><a href="#about">About us</a></li><li><a href="#stores">Our stores</a></li><li><a href="#careers">Careers</a></li></ul>
      </div>
    </div>
    <div class="legal">
      <span>© 2026 Trailhead Outfitters Ltd. All rights reserved.</span>
      <span><a href="#privacy">Privacy policy</a> · <a href="#terms">Terms of use</a></span>
    </div>
  </div>
</footer>

<script>
  document.getElementById('login-form').addEventListener('submit', function (e) { e.preventDefault(); });
  ['cookie-accept', 'cookie-reject'].forEach(function (id) {
    document.getElementById(id).addEventListener('click', function () {
      document.querySelector('.cookie-banner').style.display = 'none';
    });
  });
</script>
</body>
</html>`;

test('use relative XPath when semantic locators are not suitable', async ({ page }) => {
  await page.setContent(storefrontHtml);

  // Relative XPath starts with // and searches from anywhere in the document.
  // normalize-space() trims surrounding whitespace before comparing the text.
  await expect(page.locator("//button[normalize-space()='Sign In']")).toBeVisible();

  // contains() matches part of an attribute value; starts-with() matches an ID prefix.
  await expect(page.locator("//article[contains(@class, 'product')]")).toHaveCount(2);
  await expect(page.locator("//input[starts-with(@id, 'user')]")).toHaveCount(1);

  // XPath axes navigate relationships from a known element: ancestor goes up
  // to the containing form, following-sibling goes to the next sibling input,
  // and parent goes to the immediate parent element.
  await expect(page.locator("//input[@id='user-name']/ancestor::form")).toHaveCount(1);
  await expect(page.locator("//label[normalize-space()='Email']/following-sibling::input")).toHaveAttribute('type', 'email');
  await expect(page.locator("//span[@class='price']/parent::div")).toContainText('$29.99');

  // CSS selectors cover common cases concisely: ID, class, tag, attributes,
  // descendant/direct-child relationships, positions, and exclusion. On a
  // busy page, scope broad selectors (button, input, li) to a container,
  // otherwise they match elements from the header, footer and cookie banner.
  await expect(page.locator('#user-name')).toHaveAttribute('type', 'text');
  await expect(page.locator('.product-item')).toHaveCount(2);
  await expect(page.locator('#login-form button')).toHaveCount(1);
  await expect(page.locator('#login-form input[type="email"]')).toHaveCount(1);
  await expect(page.locator('article[class*="feature"]')).toHaveCount(1);
  await expect(page.locator('input[id^="user"]')).toHaveCount(1);
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(1);
  await expect(page.locator('#login-form input')).toHaveCount(4);
  await expect(page.locator('ul.delivery-options > li')).toHaveCount(2);
  await expect(page.locator('ul.delivery-options li:nth-child(2)')).toContainText('Express delivery');
  await expect(page.locator('article:not(.disabled)')).toContainText('Backpack');

  // Absolute XPath starts at the document root and depends on every wrapper
  // and position remaining unchanged. On a real page the path is long, and
  // adding one wrapper div anywhere along it breaks the test. This is shown
  // for comparison only; prefer the relative selectors above.
  await expect(page.locator('xpath=/html/body/main/div[1]/section[1]/form/div[1]/input')).toHaveAttribute('id', 'user-name');
});