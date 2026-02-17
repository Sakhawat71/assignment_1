let allProducts = [];
let cart = JSON.parse(localStorage.getItem('swiftcart') || '[]');
let currentModal = null;

//  INIT
document.addEventListener('DOMContentLoaded', () => {
    generateDots();
    fetchCategories();
    fetchAllProducts();
    fetchTopRated();
    renderCart();

    document.getElementById('cartBtn').addEventListener('click', openCart);

    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.toggle('open');
    });

    document.addEventListener('click', e => {
        if (e.target.dataset.cat === 'all') {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderProducts(allProducts);
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeModal(); closeCart(); }
    });
});


//  FLOATING DOTS (HERO)
function generateDots() {
    const container = document.getElementById('heroDots');
    for (let i = 0; i < 18; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        const size = Math.random() * 6 + 3;
        dot.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 20}%;
      animation-duration: ${8 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 8}s;
    `;
        container.appendChild(dot);
    }
}


//  MOBILE MENU
function closeMobile() {
    document.getElementById('mobileMenu').classList.remove('open');
}


//  API — FETCH CATEGORIES
async function fetchCategories() {
    try {
        const res = await fetch('https://fakestoreapi.com/products/categories');
        const cats = await res.json();
        const wrap = document.getElementById('categoriesWrap');

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


//  API — FETCH ALL PRODUCTS
async function fetchAllProducts() {
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (e) {
        document.getElementById('products-grid').innerHTML =
            '<p style="padding:2rem;color:var(--muted)">Failed to load products. Please check your connection.</p>';
    }
}


//  API — FETCH TOP RATED
async function fetchTopRated() {
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        const products = await res.json();
        const top3 = [...products]
            .sort((a, b) => b.rating.rate - a.rating.rate)
            .slice(0, 3);
        renderTopRated(top3);
    } catch (e) {
        document.getElementById('topRatedGrid').innerHTML =
            '<p style="color:rgba(249,246,240,0.4);padding:2rem">Failed to load top rated products.</p>';
    }
}


//  RENDER — PRODUCTS GRID
function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const count = document.getElementById('productsCount');
    count.textContent = `${products.length} products found`;

    if (!products.length) {
        grid.innerHTML = '<p style="padding:2rem;color:var(--muted)">No products found in this category.</p>';
        return;
    }

    grid.innerHTML = products.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.04}s">
      <div class="product-img-wrap">
        <span class="product-category-badge">${p.category}</span>
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="product-body">
        <div class="product-title">${p.title}</div>
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating.rate)}</span>
          <span>${p.rating.rate} (${p.rating.count})</span>
        </div>
        <div class="product-price">$${p.price.toFixed(2)}</div>
        <div class="product-actions">
          <button class="btn-details" onclick="openModal(${p.id})">Details</button>
          <button class="btn-cart" id="card-btn-${p.id}" onclick="addToCart(${p.id}, this)">
            ${isInCart(p.id) ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  `).join('');

    cart.forEach(item => {
        const btn = document.getElementById(`card-btn-${item.id}`);
        if (btn) btn.classList.add('added');
    });
}


//  RENDER — TOP RATED
function renderTopRated(products) {
    const grid = document.getElementById('topRatedGrid');
    grid.innerHTML = products.map(p => `
    <div class="top-card" onclick="openModal(${p.id})">
      <div class="top-card-img">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="top-card-body">
        <div class="top-badge">★ Top Rated</div>
        <div class="top-card-title">${p.title}</div>
        <div class="top-card-rating">
          ${renderStars(p.rating.rate)} ${p.rating.rate}/5 (${p.rating.count} reviews)
        </div>
        <div class="top-card-price">$${p.price.toFixed(2)}</div>
      </div>
    </div>
  `).join('');
}


//  HELPER — STAR RATING
function renderStars(rate) {
    const full = Math.floor(rate);
    const half = rate - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}


//  CATEGORY FILTER
function filterByCategory(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

    fetch(`https://fakestoreapi.com/products/category/${cat}`)
        .then(r => r.json())
        .then(data => renderProducts(data))
        .catch(() => renderProducts(allProducts.filter(p => p.category === cat)));
}


//  MODAL
async function openModal(id) {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    let product = allProducts.find(p => p.id === id);
    if (!product) {
        try {
            const res = await fetch(`https://fakestoreapi.com/products/${id}`);
            product = await res.json();
        } catch (e) {
            console.error('Product fetch failed:', e);
            return;
        }
    }
    currentModal = product;

    document.getElementById('modalImg').src = product.image;
    document.getElementById('modalImg').alt = product.title;
    document.getElementById('modalCat').textContent = product.category;
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalDesc').textContent = product.description;
    document.getElementById('modalPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modalRating').innerHTML =
        `<span class="stars">${renderStars(product.rating.rate)}</span>
     ${product.rating.rate}/5 (${product.rating.count} reviews)`;

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
    document.getElementById('modalOverlay').classList.remove('open');
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
    btn.textContent = '✓ Added to Cart';
    btn.classList.add('added');
}

function buyNow() {
    if (!currentModal) return;
    addToCart(currentModal.id);
    closeModal();
    openCart();
}


//  CART — CORE LOGIC
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
    renderCart();
    updateCartCount();

    if (btn) {
        btn.textContent = '✓ Added';
        btn.classList.add('added');
    }

    showToast(`✓ "${product.title.slice(0, 30)}..." added to cart`);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    updateCartCount();
    showToast('Item removed from cart');
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(id); return; }
    saveCart();
    renderCart();
    updateCartCount();
}

function clearCart() {
    cart = [];
    saveCart();
    renderCart();
    updateCartCount();
    showToast('Cart cleared');
}

function saveCart() {
    localStorage.setItem('swiftcart', JSON.stringify(cart));
}

function updateCartCount() {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById('cartCount').textContent = total;
}


//  CART — RENDER
function renderCart() {
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    updateCartCount();

    if (!cart.length) {
        container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div>Your cart is empty.<br>Add some products!</div>
      </div>`;
        footer.style.display = 'none';
        return;
    }

    footer.style.display = 'block';
    container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.title}" />
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.title}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join('');

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${subtotal.toFixed(2)}`;
}


//  CART — OPEN / CLOSE
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

function handleCheckout() {
    showToast('🎉 Order placed! (Demo mode)');
    closeCart();
}


//  NEWSLETTER
function handleSubscribe(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    showToast(`📧 Subscribed with ${email}`);
    document.getElementById('emailInput').value = '';
}


//  TOAST NOTIFICATIONS
function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('out');
        setTimeout(() => toast.remove(), 350);
    }, 2800);
}