import { test, expect } from '@playwright/test';

// Placeholder artwork generated as inline SVG, so the page needs no network.
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="36" viewBox="0 0 140 36">
       <rect width="36" height="36" rx="9" fill="#2563eb"/>
       <circle cx="18" cy="18" r="7" fill="#fbbf24"/>
       <text x="46" y="25" font-family="Arial, Helvetica, sans-serif" font-size="21"
             font-weight="700" fill="#111827" letter-spacing="1">LUMINA</text>
     </svg>`
  );

const headphones = artwork('#dbeafe', '#93c5fd',
  '<path d="M110 190v-40a90 90 0 0 1 180 0v40" fill="none" stroke="#1e3a8a" stroke-width="16"/>' +
  '<rect x="92" y="170" width="44" height="76" rx="18" fill="#1e3a8a"/>' +
  '<rect x="264" y="170" width="44" height="76" rx="18" fill="#1e3a8a"/>');
const watch = artwork('#fce7f3', '#f9a8d4',
  '<rect x="160" y="40" width="80" height="220" rx="18" fill="#831843"/>' +
  '<rect x="140" y="95" width="120" height="110" rx="26" fill="#111827"/>' +
  '<circle cx="200" cy="150" r="30" fill="#f9a8d4"/>');
const speaker = artwork('#dcfce7', '#86efac',
  '<rect x="125" y="50" width="150" height="200" rx="26" fill="#14532d"/>' +
  '<circle cx="200" cy="105" r="22" fill="#86efac"/><circle cx="200" cy="180" r="38" fill="#86efac"/>');
const laptop = artwork('#fef3c7', '#fcd34d',
  '<rect x="105" y="75" width="190" height="125" rx="10" fill="#1f2937"/>' +
  '<rect x="75" y="205" width="250" height="16" rx="8" fill="#92400e"/>');

// A production-style storefront. Using setContent() keeps the locator
// examples stable, because a live third-party site can change at any time.
const storefrontHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lumina | Electronics, audio and wearables</title>
<style>
  :root { --brand:#2563eb; --brand-dark:#1d4ed8; --ink:#111827; --muted:#6b7280;
          --line:#e5e7eb; --bg:#f6f7f9; --radius:12px; }
  * { box-sizing:border-box; }
  body { margin:0; font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
         color:var(--ink); background:var(--bg); }
  a { color:inherit; text-decoration:none; }
  a:hover { color:var(--brand); }
  .wrap { max-width:1200px; margin:0 auto; padding:0 24px; }

  .promo-bar { position:relative; display:flex; justify-content:center; align-items:center; gap:10px;
               background:var(--ink); color:#fff; padding:9px 48px; font-size:14px; }
  .promo-bar strong { background:#fbbf24; color:var(--ink); padding:1px 8px; border-radius:4px; letter-spacing:.05em; }
  .promo-bar button { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none;
                      border:0; color:#fff; font-size:22px; line-height:1; padding:4px 10px; cursor:pointer; }

  .utility { background:#fff; border-bottom:1px solid var(--line); font-size:13px; color:var(--muted); }
  .utility .wrap { display:flex; justify-content:flex-end; gap:22px; padding-top:7px; padding-bottom:7px; }
  .greeting { color:var(--ink); font-weight:600; }

  .main-header { background:#fff; border-bottom:1px solid var(--line); }
  .main-header .wrap { display:flex; align-items:center; gap:32px; padding-top:14px; padding-bottom:14px; }
  .search { flex:1; display:flex; }
  .search input { flex:1; padding:11px 18px; border:1px solid var(--line); border-right:0; background:var(--bg);
                  border-radius:999px 0 0 999px; font-size:15px; }
  .search button { padding:0 24px; border:0; background:var(--brand); color:#fff; font-weight:600;
                   border-radius:0 999px 999px 0; cursor:pointer; }
  .header-actions { display:flex; gap:22px; font-weight:600; font-size:15px; }
  .badge { display:inline-block; min-width:20px; padding:0 6px; border-radius:999px; background:var(--brand);
           color:#fff; font-size:12px; text-align:center; }
  .primary-nav { background:#fff; border-bottom:1px solid var(--line); }
  .primary-nav ul { display:flex; gap:30px; list-style:none; margin:0 auto; padding:12px 24px;
                    max-width:1200px; font-size:15px; font-weight:500; }
  .primary-nav .sale { color:#dc2626; }

  .hero-grid { display:grid; grid-template-columns:1fr 420px; gap:56px; align-items:start; padding:48px 24px; }
  .hero h2 { font-size:44px; line-height:1.1; margin:0 0 16px; letter-spacing:-.02em; }
  .hero p { font-size:18px; color:var(--muted); max-width:480px; margin:0 0 26px; }
  .tag { display:inline-block; background:#dbeafe; color:var(--brand-dark); font-size:13px; font-weight:600;
         padding:4px 12px; border-radius:999px; margin-bottom:18px; }
  .btn { display:inline-block; padding:12px 24px; border-radius:10px; border:1px solid transparent;
         background:var(--brand); color:#fff; font-family:inherit; font-size:15px; font-weight:600;
         line-height:1.2; cursor:pointer; text-align:center; }
  .btn:hover { background:var(--brand-dark); color:#fff; }
  .btn-secondary { background:#fff; color:var(--ink); border-color:#d1d5db; }
  .btn-secondary:hover { background:var(--bg); color:var(--ink); }
  .btn-block { width:100%; }
  .usp { display:flex; gap:28px; margin-top:34px; font-size:14px; color:var(--muted); }

  .card { background:#fff; border:1px solid var(--line); border-radius:16px; padding:28px;
          box-shadow:0 10px 30px rgba(17,24,39,.06); }
  .signin h1 { margin:0 0 4px; font-size:26px; }
  .signin .sub { margin:0 0 22px; color:var(--muted); font-size:14px; }
  .field { margin-bottom:16px; }
  .field label { display:block; font-size:14px; font-weight:600; margin-bottom:6px; }
  .field input { width:100%; padding:11px 14px; border:1px solid #d1d5db; border-radius:10px; font-size:15px; margin-top:6px; }
  .field > label > input { font-weight:400; }
  .field input:focus, .search input:focus { outline:3px solid #bfdbfe; border-color:var(--brand); }
  .row { display:flex; justify-content:space-between; align-items:center; margin:4px 0 20px; font-size:14px; }
  .check { display:flex; gap:8px; align-items:center; }
  .check input { accent-color:var(--brand); width:16px; height:16px; }
  .divider { display:flex; align-items:center; gap:12px; margin:20px 0; color:var(--muted); font-size:13px; }
  .divider::before, .divider::after { content:""; flex:1; height:1px; background:var(--line); }
  .signup { margin-top:20px; text-align:center; font-size:14px; color:var(--muted); }
  .signup a { color:var(--brand); font-weight:600; }

  .section { padding:8px 24px 48px; }
  .section-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:20px; }
  .section-head h2 { margin:0; font-size:26px; }
  .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .product { background:#fff; border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; }
  .product img { display:block; width:100%; height:190px; object-fit:cover; }
  .product .body { padding:16px; }
  .product h3 { margin:0 0 4px; font-size:16px; }
  .rating { color:#f59e0b; font-size:13px; }
  .rating span { color:var(--muted); }
  .price { margin:8px 0 14px; font-size:18px; font-weight:700; }
  .price s { color:var(--muted); font-size:14px; font-weight:400; margin-left:6px; }

  .prefs { display:flex; gap:20px; align-items:end; flex-wrap:wrap; }
  .prefs h2 { flex-basis:100%; margin:0; font-size:20px; }
  .prefs .field { margin:0; min-width:220px; }

  footer { background:var(--ink); color:#d1d5db; padding:48px 0 28px; font-size:14px; }
  .footer-grid { display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:32px; }
  footer h3 { color:#fff; font-size:15px; margin:0 0 12px; }
  footer ul { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  footer a:hover { color:#fff; }
  .newsletter label { display:block; margin-bottom:8px; color:#fff; font-weight:600; }
  .newsletter div { display:flex; gap:8px; }
  .newsletter input { flex:1; padding:10px 12px; border-radius:8px; border:0; font-size:14px; }
  .legal { border-top:1px solid #374151; margin-top:32px; padding-top:20px; display:flex;
           justify-content:space-between; color:#9ca3af; }

  @media (max-width: 900px) {
    .hero-grid { grid-template-columns:1fr; }
    .grid { grid-template-columns:repeat(2,1fr); }
    .footer-grid { grid-template-columns:1fr 1fr; }
  }
</style>
</head>
<body>

<aside class="promo-bar" aria-label="Promotion">
  <p style="margin:0">Free delivery on orders over $50. Use code <strong>SPRING10</strong> at checkout.</p>
  <button type="button" class="promo-close" title="Close dialog">×</button>
</aside>

<header>
  <div class="utility">
    <div class="wrap">
      <a href="#help">Help centre</a>
      <a href="#stores">Store locator</a>
      <span class="greeting">Welcome, Taylor</span>
    </div>
  </div>

  <div class="main-header">
    <div class="wrap">
      <a href="#home"><img src="${logo}" alt="Company logo" width="140" height="36"></a>
      <form class="search" role="search" onsubmit="return false">
        <input type="text" name="q" placeholder="Search products" aria-label="Site search" autocomplete="off">
        <button type="submit">Search</button>
      </form>
      <div class="header-actions">
        <a href="#orders">Orders</a>
        <a href="#wishlist">Wishlist</a>
        <a href="#cart">Cart <span class="badge">2</span></a>
      </div>
    </div>
  </div>

  <nav class="primary-nav" aria-label="Main">
    <ul>
      <li><a href="#audio">Audio</a></li>
      <li><a href="#wearables">Wearables</a></li>
      <li><a href="#computers">Computers</a></li>
      <li><a href="#phones">Phones</a></li>
      <li><a href="#smart-home">Smart home</a></li>
      <li><a class="sale" href="#deals">Deals</a></li>
    </ul>
  </nav>
</header>

<main>
  <div class="wrap hero-grid">
    <section class="hero">
      <span class="tag">Spring tech sale</span>
      <h2>Upgrade your everyday tech, up to 30% off</h2>
      <p>Premium headphones, wearables and laptops from brands you trust, with free returns for 30 days.</p>
      <a class="btn" href="#deals">Shop the sale</a>
      <div class="usp">
        <span>Free 2-day delivery</span>
        <span>30-day returns</span>
        <span>2-year warranty</span>
      </div>
    </section>

    <form class="card signin" novalidate>
      <h1>Account</h1>
      <p class="sub">Sign in to track orders and check out faster.</p>

      <div class="field">
        <label for="email">Email address</label>
        <input id="email" name="email" type="email" autocomplete="email" required>
      </div>

      <div class="field">
        <label>Password <input type="password" name="password" autocomplete="current-password" required></label>
      </div>

      <div class="row">
        <label class="check"><input type="checkbox" name="remember"> Remember me</label>
        <a href="#reset" style="color:var(--brand);font-weight:600">Forgot password?</a>
      </div>

      <button type="submit" class="btn btn-block">Sign in</button>
      <div class="divider">or</div>
      <button type="button" class="btn btn-secondary btn-block">Continue with Google</button>
      <p class="signup">New to Lumina? <a href="#register">Create your profile</a></p>
    </form>
  </div>

  <section class="wrap section" aria-labelledby="featured">
    <div class="section-head">
      <h2 id="featured">Featured this week</h2>
      <a href="#all" style="color:var(--brand);font-weight:600">View all</a>
    </div>
    <div class="grid">
      <article class="product">
        <img src="${headphones}" alt="Wireless noise-cancelling headphones in navy">
        <div class="body">
          <h3>Aura ANC Headphones</h3>
          <div class="rating">★★★★★ <span>(1,284)</span></div>
          <p class="price">$179.00 <s>$249.00</s></p>
          <button type="button" class="btn btn-secondary btn-block">Add to cart</button>
        </div>
      </article>
      <article class="product">
        <img src="${watch}" alt="Smartwatch with rose gold strap">
        <div class="body">
          <h3>Pulse Smartwatch 3</h3>
          <div class="rating">★★★★☆ <span>(642)</span></div>
          <p class="price">$229.00</p>
          <button type="button" class="btn btn-secondary btn-block">Add to cart</button>
        </div>
      </article>
      <article class="product">
        <img src="${speaker}" alt="Portable Bluetooth speaker in forest green">
        <div class="body">
          <h3>Nova Portable Speaker</h3>
          <div class="rating">★★★★★ <span>(930)</span></div>
          <p class="price">$89.00 <s>$119.00</s></p>
          <button type="button" class="btn btn-secondary btn-block">Add to cart</button>
        </div>
      </article>
      <article class="product">
        <img src="${laptop}" alt="Ultrabook laptop with silver finish">
        <div class="body">
          <h3>Slate 14 Ultrabook</h3>
          <div class="rating">★★★★☆ <span>(417)</span></div>
          <p class="price">$899.00</p>
          <button type="button" class="btn btn-secondary btn-block">Add to cart</button>
        </div>
      </article>
    </div>
  </section>

  <section class="wrap section">
    <div class="card prefs">
      <h2>Delivery preferences</h2>
      <div class="field">
        <label for="postcode">Delivery postcode</label>
        <input id="postcode" name="postcode" type="text" placeholder="e.g. 10001">
      </div>
      <button type="button" class="btn" data-testid="save-button">Save</button>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div class="newsletter">
        <label for="newsletter">Get 10% off your first order</label>
        <div>
          <input id="newsletter" type="email" placeholder="you@example.com">
          <button type="button" class="btn">Subscribe</button>
        </div>
      </div>
      <div>
        <h3>Shop</h3>
        <ul><li><a href="#audio">Audio</a></li><li><a href="#wearables">Wearables</a></li><li><a href="#computers">Computers</a></li></ul>
      </div>
      <div>
        <h3>Support</h3>
        <ul><li><a href="#contact">Contact us</a></li><li><a href="#returns">Returns</a></li><li><a href="#shipping">Shipping</a></li></ul>
      </div>
      <div>
        <h3>Company</h3>
        <ul><li><a href="#about">About Lumina</a></li><li><a href="#careers">Careers</a></li><li><a href="#press">Press</a></li></ul>
      </div>
    </div>
    <div class="legal">
      <span>© 2026 Lumina Retail Ltd. All rights reserved.</span>
      <span><a href="#privacy">Privacy policy</a> · <a href="#terms">Terms of use</a></span>
    </div>
  </div>
</footer>

<script>
  document.querySelector('.promo-close').addEventListener('click', function () {
    document.querySelector('.promo-bar').style.display = 'none';
  });
  document.querySelector('form.signin').addEventListener('submit', function (e) { e.preventDefault(); });
</script>
</body>
</html>`;

test('find controls with accessible names and user facing text', async ({ page }) => {
  await page.setContent(storefrontHtml);

  // getByRole() finds the heading by its accessible role and name, rather than
  // by its HTML tag or CSS styling. exact: true stops it matching other
  // headings that merely contain the word "Account".
  await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible();

  // getByLabel() finds form inputs through their associated <label> text.
  // It works both when a label uses for/id and when the input is nested in it.
  await page.getByLabel('Email address').fill('user@example.com');
  await page.getByLabel('Password').fill('secret123');

  // toHaveValue() checks what was entered into the email field.
  await expect(page.getByLabel('Email address')).toHaveValue('user@example.com');

  // getByPlaceholder() is useful when a field has placeholder text instead
  // of a visible label.
  await page.getByPlaceholder('Search products').fill('Playwright');

  // A checkbox can be located by its accessible role and label, then checked.
  await page.getByRole('checkbox', { name: 'Remember me' }).check();

  // Links are also identified by role and accessible name. getByText() can
  // match visible content; a regular expression is useful for dynamic text.
  await expect(page.getByRole('link', { name: 'Help centre' })).toBeVisible();
  await expect(page.getByText(/Welcome, \w+/)).toBeVisible();

  // getByTestId() targets an explicit automation hook added to the markup.
  await expect(page.getByTestId('save-button')).toHaveText('Save');

  // getByAltText() locates images by their alt description. getByTitle()
  // finds an element using its title attribute (often shown as a tooltip).
  await expect(page.getByAltText('Company logo')).toBeVisible();
  await page.getByTitle('Close dialog').click();
  await expect(page.getByRole('complementary', { name: 'Promotion' })).toBeHidden();

  // Use CSS or XPath when a semantic locator does not fit the element. The
  // page has two email inputs (sign-in and newsletter), so the CSS is scoped
  // to the sign-in form to match exactly one. Prefer the semantic locators
  // above when possible.
  await expect(page.locator('form.signin input[type="email"]')).toHaveValue('user@example.com');
  await expect(page.locator('//button[@data-testid="save-button"]')).toBeVisible();
});