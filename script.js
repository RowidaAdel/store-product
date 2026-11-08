const CART_KEY = "cart";
const $ = (id) => document.getElementById(id);

const svg = (inner, size, extra) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${inner}</svg>`;

const ICONS = {
    cart: (s) => svg('<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>', s, ""),
    moon: (s) => svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', s, ""),
    sun: (s) => svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>', s, ""),
    search: (s) => svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', s, ""),
    eye: (s) => svg('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>', s, ""),
    arrowUp: (s) => svg('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>', s, ""),
    trash: (s) => svg('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', s, ""),
    star: (s) => svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', s, 'fill="currentColor"'),
    gallery: (s) => svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>', s, ""),
};

const cartStore = {
    items: [],

    load() {
        try {
            cartStore.items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (error) {
            cartStore.items = [];
        }
    },

    save() {
        localStorage.setItem(CART_KEY, JSON.stringify(cartStore.items));
        updateBadge();
    },

    getItems() {
        return cartStore.items;
    },

    add(product) {
        let found = null;
        for (let i = 0; i < cartStore.items.length; i++) {
            if (cartStore.items[i].id === product.id) {
                found = cartStore.items[i];
            }
        }

        if (found) {
            found.qty += 1;
        } else {
            cartStore.items.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                qty: 1,
            });
        }
        cartStore.save();
    },

    changeQty(id, delta) {
        for (let i = 0; i < cartStore.items.length; i++) {
            if (cartStore.items[i].id === id) {
                cartStore.items[i].qty += delta;
            }
        }
        cartStore.items = cartStore.items.filter((item) => item.qty > 0);
        cartStore.save();
    },

    remove(id) {
        cartStore.items = cartStore.items.filter((item) => item.id !== id);
        cartStore.save();
    },

    clear() {
        cartStore.items = [];
        cartStore.save();
    },
};

cartStore.load();

function updateBadge() {
    const badge = $("cartBadge");
    if (!badge) return;

    let qty = 0;
    for (let i = 0; i < cartStore.items.length; i++) {
        qty += cartStore.items[i].qty;
    }

    badge.textContent = qty;
    if (qty === 0) {
        badge.classList.add("hidden");
    } else {
        badge.classList.remove("hidden");
    }
}

function isDark() {
    return document.documentElement.classList.contains("dark");
}

function setTheme(dark) {
    if (dark) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");

    const btn = $("themeToggle");
    if (btn) btn.innerHTML = dark ? ICONS.sun(22) : ICONS.moon(22);
}

function renderNavbar() {
    const nav = $("navbar");
    if (!nav) return;
    const onCart = location.pathname.toLowerCase().endsWith("cart.html");

    nav.innerHTML = `
    <div class="nav-inner">
      <a href="index.html" class="logo">${ICONS.gallery(40)}<span>Gallery</span></a>
      <nav class="nav-links">
        <a href="index.html" class="${onCart ? "" : "active"}">Products</a>
        <a href="cart.html" class="icon-btn ${onCart ? "active" : ""}" aria-label="Cart">
          ${ICONS.cart(24)}<span id="cartBadge" class="badge hidden">0</span>
        </a>
        <button id="themeToggle" class="icon-btn" aria-label="Toggle theme"></button>
      </nav>
    </div>`;

    $("themeToggle").addEventListener("click", () => setTheme(!isDark()));
    setTheme(isDark());
    updateBadge();
}

function initScrollTop() {
    const btn = document.createElement("button");
    btn.className = "scroll-top hidden";
    btn.setAttribute("aria-label", "Scroll to top");
    btn.innerHTML = ICONS.arrowUp(24);
    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
        if (window.scrollY < 300) {
            btn.classList.add("hidden");
        } else {
            btn.classList.remove("hidden");
        }
    });
}

let toastTimer;
function showToast(message) {
    let toast = $("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

renderNavbar();
initScrollTop();