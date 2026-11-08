function renderCartPage() {
    const items = cartStore.getItems();
    const box = $("cartPage");

    if (items.length === 0) {
        box.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="index.html" class="btn btn-pink">Browse Products</a>
      </div>`;
        return;
    }

    let qty = 0;
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        qty += items[i].qty;
        total += items[i].qty * items[i].price;
    }

    const rows = items.map((item) => `
    <div class="cart-row">
      <img src="${item.image}" alt="${item.title}" />
      <div class="cart-info">
        <h3>${item.title}</h3>
        <p class="price">${item.price} $</p>
      </div>
      <div class="qty-controls">
        <button class="btn btn-page" data-cart="dec" data-id="${item.id}" aria-label="Decrease">-</button>
        <span>${item.qty}</span>
        <button class="btn btn-page" data-cart="inc" data-id="${item.id}" aria-label="Increase">+</button>
      </div>
      <p class="line-total">${(item.qty * item.price).toFixed(2)} $</p>
      <button class="icon-btn danger" data-cart="remove" data-id="${item.id}" aria-label="Remove">${ICONS.trash(20)}</button>
    </div>`).join("");

    box.innerHTML = `
    <div class="cart-list">${rows}</div>
    <div class="cart-summary">
      <p><strong>Total Quantity:</strong> ${qty}</p>
      <p><strong>Total Price:</strong> <span class="price">${total.toFixed(2)} $</span></p>
      <div class="summary-actions">
        <a href="index.html" class="btn btn-pink">Continue Shopping</a>
        <button class="btn btn-dark" data-cart="clear">Clear Cart</button>
      </div>
    </div>`;

    addCartEvents();
}

function addCartEvents() {
    const buttons = $("cartPage").getElementsByTagName("button");

    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];

        btn.addEventListener("click", () => {
            const id = Number(btn.getAttribute("data-id"));
            const action = btn.getAttribute("data-cart");

            if (action === "inc") cartStore.changeQty(id, 1);
            else if (action === "dec") cartStore.changeQty(id, -1);
            else if (action === "remove") cartStore.remove(id);
            else if (action === "clear") cartStore.clear();

            renderCartPage();
        });
    }
}

renderCartPage();