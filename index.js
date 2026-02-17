//  STATE
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('swiftcart') || '[]');
let currentModal = null;
let currentPage = 'home';

//  INIT
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Decide which page we are on
    if (document.getElementById('products-grid')) {
        currentPage = 'products';
        initProductsPage();
    }
    if (document.getElementById('trending-grid')) {
        initHomePage();
    }

    // Navbar cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', openCart);

    // Hamburger
    const ham = document.getElementById('hamburger');
    if (ham) ham.addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.toggle('open');
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeModal(); closeCart(); }
    });

    document.addEventListener('click', e => {
        if (e.target.dataset.cat === 'all') {
            setActiveCategory(e.target);
            renderProducts(allProducts);
        }
    });
});

//  MOBILE MENU
function closeMobile() {
    const m = document.getElementById('mobileMenu');
    if (m) m.classList.remove('open');
}

//  HOME PAGE
async function initHomePage() {
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        const data = await res.json();
        allProducts = data;


        const trending = data.slice(0, 3);
        renderTrending(trending);
    } catch (e) {
        console.error('Failed to load trending products:', e);
    }
}

function renderTrending(products) {
    const grid = document.getElementById('trending-grid');
    if (!grid) return;

    grid.innerHTML = products.map((p, i) => buildProductCard(p, i)).join('');
    syncCartButtons();
}

//  PRODUCTS PAGE
async function initProductsPage() {

    fetchCategories();
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (e) {
        const grid = document.getElementById('products-grid');
        if (grid) grid.innerHTML =
            '<p style="padding:2rem;color:var(--muted);grid-column:1/-1">Failed to load products. Check your internet connection.</p>';
    }
}

async function fetchCategories() {
    try {
        const res = await fetch('https://fakestoreapi.com/products/categories');
        const cats = await res.json();
        const wrap = document.getElementById('categoriesWrap');
        if (!wrap) return;

        cats.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-btn';
            btn.dataset.cat = cat;
            btn.textContent = cat;
            btn.addEventListener('click', () => filterByCategory(cat, btn));
            wrap.appendChild(btn);
        });
    } catch (e) {
        console.error('Category fetch failed:', e);
    }
}

function filterByCategory(cat, btn) {
    setActiveCategory(btn);

    const grid = document.getElementById('products-grid');
    if (grid) grid.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

    fetch(`https://fakestoreapi.com/products/category/${encodeURIComponent(cat)}`)
        .then(r => r.json())
        .then(data => renderProducts(data))
        .catch(() => renderProducts(allProducts.filter(p => p.category === cat)));
}

function setActiveCategory(activeBtn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const count = document.getElementById('productsCount');
    if (!grid) return;

    if (count) count.textContent = `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`;

    if (!products.length) {
        grid.innerHTML = '<p style="padding:2rem;color:var(--muted);grid-column:1/-1">No products found in this category.</p>';
        return;
    }

    grid.innerHTML = products.map((p, i) => buildProductCard(p, i)).join('');
    syncCartButtons();
}

//  CARD BUILDER (shared)
function buildProductCard(p, i = 0) {
    return `
    <div class="product-card" style="animation-delay:${i * 0.04}s">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${escHtml(p.title)}" loading="lazy" />
      </div>
      <div class="product-body">
        <span class="product-category-badge">${escHtml(p.category)}</span>
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating.rate)}</span>
          <span>${p.rating.rate} (${p.rating.count})</span>
        </div>
        <div class="product-title">${escHtml(p.title)}</div>
        <div class="product-price">$${p.price.toFixed(2)}</div>
        <div class="product-actions">
          <button class="btn-details" onclick="openModal(${p.id})">
            👁 Details
          </button>
          <button class="btn-add" id="card-btn-${p.id}" onclick="addToCart(${p.id}, this)">
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  `;
}

// Mark already-in-cart buttons
function syncCartButtons() {
    cart.forEach(item => {
        const btn = document.getElementById(`card-btn-${item.id}`);
        if (btn) {
            btn.textContent = '✓ Added';
            btn.classList.add('added');
        }
    });
}

//  STARS
function renderStars(rate) {
    const full = Math.floor(rate);
    const half = (rate - full) >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

//  MODAL
async function openModal(id) {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    let product = allProducts.find(p => p.id === id);
    if (!product) {
        try {
            const res = await fetch(`https://fakestoreapi.com/products/${id}`);
            product = await res.json();
        } catch (e) { return; }
    }
    currentModal = product;

    document.getElementById('modalImg').src = product.image;
    document.getElementById('modalImg').alt = product.title;
    document.getElementById('modalCat').textContent = product.category;
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalDesc').textContent = product.description;
    document.getElementById('modalPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modalRating').innerHTML =
        `<span class="stars">${renderStars(product.rating.rate)}</span> ${product.rating.rate}/5 (${product.rating.count} reviews)`;

    const btn = document.getElementById('modalCartBtn');
    if (isInCart(id)) {
        btn.textContent = '✓ Added to Cart';
        btn.classList.add('added');
    } else {
        btn.textContent = '🛒 Add to Cart';
        btn.classList.remove('added');
    }
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    currentModal = null;
}

function closeModalOnBg(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function addFromModal() {
    if (!currentModal) return;
    addToCart(currentModal.id);
    const btn = document.getElementById('modalCartBtn');
    if (btn) { btn.textContent = '✓ Added to Cart'; btn.classList.add('added'); }
}

function buyNow() {
    if (!currentModal) return;
    addToCart(currentModal.id);
    closeModal();
    openCart();
}

//  CART
function isInCart(id) {
    return cart.some(i => i.id === id);
}

function addToCart(id, btn) {
    const product = allProducts.find(p => p.id === id) || currentModal;
    if (!product) return;

    const existing = cart.find(i => i.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    renderCartUI();
    updateCartCount();

    if (btn) {
        btn.textContent = '✓ Added';
        btn.classList.add('added');
    }

    showToast(`✓ Added to cart`);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCartUI();
    updateCartCount();
    showToast('Item removed');
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(id); return; }
    saveCart();
    renderCartUI();
    updateCartCount();
}

function clearCart() {
    cart = [];
    saveCart();
    renderCartUI();
    updateCartCount();
    showToast('Cart cleared');
}

function saveCart() {
    localStorage.setItem('swiftcart', JSON.stringify(cart));
}

function updateCartCount() {
    const el = document.getElementById('cartCount');
    if (!el) return;
    const total = cart.reduce((s, i) => s + i.qty, 0);
    el.textContent = total;
}

function renderCartUI() {
    const body = document.getElementById('cartBody');
    const foot = document.getElementById('cartFoot');
    if (!body) return;
    updateCartCount();

    if (!cart.length) {
        body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div class="cart-empty-text">Your cart is empty.<br>Start adding some products!</div>
      </div>`;
        if (foot) foot.style.display = 'none';
        return;
    }

    if (foot) foot.style.display = 'block';

    body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-thumb">
        <img src="${item.image}" alt="${escHtml(item.title)}" />
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escHtml(item.title)}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-del" onclick="removeFromCart(${item.id})" title="Remove">✕</button>
    </div>
  `).join('');

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const subEl = document.getElementById('cartSubtotal');
    const totEl = document.getElementById('cartTotal');
    if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totEl) totEl.textContent = `$${subtotal.toFixed(2)}`;
}

function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const backdrop = document.getElementById('cartBackdrop');
    renderCartUI();
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const backdrop = document.getElementById('cartBackdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
}

function handleCheckout() {
    showToast('🎉 Order placed! (Demo)');
    clearCart();
    closeCart();
}

//  NEWSLETTER
function handleSubscribe(e) {
    e.preventDefault();
    const input = document.getElementById('newsletterEmail');
    if (!input) return;
    showToast(`📧 Subscribed! Thank you.`);
    input.value = '';
}

//  TOAST
function showToast(msg) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    stack.appendChild(t);
    setTimeout(() => {
        t.classList.add('fade-out');
        setTimeout(() => t.remove(), 280);
    }, 2600);
}

//  HELPERS
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}