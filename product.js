const PAGE_SIZE = 6;

const state = {
    products: [],
    page: 1,
    search: "",
    category: "",
    rating: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
};

function titleCase(str) {
    const words = String(str).split("-").join(" ").split(" ");
    const result = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
    return result.join(" ");
}

function getRate(p) {
    if (p.rating && p.rating.rate) {
        return Number(p.rating.rate);
    }
    return 0;
}

function findProduct(id) {
    for (let i = 0; i < state.products.length; i++) {
        if (state.products[i].id === id) {
            return state.products[i];
        }
    }
    return null;
}

function renderCategories() {
    const select = $("category");
    const categories = [];

    for (let i = 0; i < state.products.length; i++) {
        const category = state.products[i].category;
        if (categories.indexOf(category) === -1) {
            categories.push(category);
        }
    }

    let options = `<option value="">All Categories</option>`;
    for (let i = 0; i < categories.length; i++) {
        options += `<option value="${categories[i]}">${titleCase(categories[i])}</option>`;
    }
    select.innerHTML = options;
}

async function fetchProducts() {
    try {
        const res = await fetch("https://fakestoreapi.com/products");
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
    } catch (error) {
        console.log("First API failed, trying the second one", error);
    }

    const res = await fetch("https://dummyjson.com/products?limit=30");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    return data.products.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        image: p.thumbnail,
        description: p.description,
        rating: { rate: p.rating, count: p.reviews ? p.reviews.length : 0 },
    }));
}

async function loadProducts() {
    const status = $("status");
    status.className = "status";
    status.textContent = "Loading...";

    try {
        state.products = await fetchProducts();
        renderCategories();
        status.textContent = "";
        render();
    } catch (error) {
        status.className = "status error";
        status.textContent = "Error at Fetch Data From Api";
        console.error(error);
    }
}

function getFiltered() {
    let list = state.products.slice();

    if (state.search) {
        list = list.filter((p) =>
            p.title.toLowerCase().indexOf(state.search.toLowerCase()) !== -1
        );
    }

    if (state.category) {
        list = list.filter((p) => p.category === state.category);
    }

    if (state.rating) {
        list = list.filter((p) => getRate(p) >= Number(state.rating));
    }

    if (state.minPrice !== "") {
        list = list.filter((p) => p.price >= Number(state.minPrice));
    }

    if (state.maxPrice !== "") {
        list = list.filter((p) => p.price <= Number(state.maxPrice));
    }

    if (state.sort === "price-asc") {
        list.sort((a, b) => a.price - b.price);
    } else if (state.sort === "price-desc") {
        list.sort((a, b) => b.price - a.price);
    } else if (state.sort === "rating-desc") {
        list.sort((a, b) => getRate(b) - getRate(a));
    } else if (state.sort === "name-asc") {
        list.sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1));
    }

    return list;
}

function productCardHTML(p) {
    const rate = p.rating && p.rating.rate != null ? Number(p.rating.rate).toFixed(1) : "-";
    const count = p.rating && p.rating.count != null ? p.rating.count : 0;

    return `
    <article class="card">
      <div class="card-img">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
        <div class="card-overlay">
          <button class="btn btn-pink" data-action="add" data-id="${p.id}">${ICONS.cart(16)} Add to Cart</button>
          <button class="btn btn-dark" data-action="details" data-id="${p.id}">${ICONS.eye(16)} Show Details</button>
        </div>
      </div>
      <h3 class="card-title">${p.title}</h3>
      <p class="card-meta">${titleCase(p.category)} <span>| (${count} Reviews)</span></p>
      <div class="card-bottom">
        <span class="price">${p.price} $</span>
        <span class="rating">${ICONS.star(14)} ${rate}</span>
      </div>
    </article>`;
}

function render() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    const grid = $("products");
    if (filtered.length === 0) {
        grid.innerHTML = "";
        $("status").className = "status";
        $("status").textContent = "No products found.";
    } else {
        $("status").textContent = "";
        grid.innerHTML = pageItems.map(productCardHTML).join("");
        addCardEvents();
    }

    renderPagination(totalPages, filtered.length);
}

function renderPagination(totalPages, total) {
    const nav = $("pagination");
    if (total === 0 || totalPages === 1) {
        nav.innerHTML = "";
        return;
    }

    let pages = "";
    for (let i = 1; i <= totalPages; i++) {
        pages += `<button class="btn btn-page ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
    }

    nav.innerHTML = `
    <button class="btn btn-page" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>Previous</button>
    ${pages}
    <button class="btn btn-page" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""}>Next</button>
    <span class="page-info">Page ${state.page} of ${totalPages}</span>`;

    addPaginationEvents();
}

function showDetails(p) {
    const rate = p.rating && p.rating.rate != null ? Number(p.rating.rate).toFixed(1) : "-";
    $("detailsContent").innerHTML = `
    <img src="${p.image}" alt="${p.title}" />
    <h3>${p.title}</h3>
    <p><strong>Category:</strong> ${titleCase(p.category)}</p>
    <p><strong>Price:</strong> ${p.price} $ &nbsp; <strong>Rating:</strong> ${rate}</p>
    <p>${p.description || ""}</p>`;
    $("detailsDialog").showModal();
}

function addCardEvents() {
    const buttons = $("products").getElementsByTagName("button");

    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];

        btn.addEventListener("click", () => {
            const product = findProduct(Number(btn.getAttribute("data-id")));
            if (!product) return;

            if (btn.getAttribute("data-action") === "add") {
                cartStore.add(product);
                showToast("Added to cart");
            } else {
                showDetails(product);
            }
        });
    }
}

function addPaginationEvents() {
    const buttons = $("pagination").getElementsByTagName("button");

    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];

        btn.addEventListener("click", () => {
            state.page = Number(btn.getAttribute("data-page"));
            render();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

$("search").addEventListener("input", (e) => {
    state.search = e.target.value.trim();
    state.page = 1;
    render();
});

$("applyFilters").addEventListener("click", () => {
    const minPrice = $("minPrice").value;
    const maxPrice = $("maxPrice").value;

    if (minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice)) {
        showToast("Min Price cannot be greater than Max Price");
        return;
    }

    state.category = $("category").value;
    state.rating = $("rating").value;
    state.minPrice = minPrice;
    state.maxPrice = maxPrice;

    state.page = 1;
    render();
});

$("sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    state.page = 1;
    render();
});

$("closeDialog").addEventListener("click", () => $("detailsDialog").close());

$("searchIcon").innerHTML = ICONS.search(20);
loadProducts();