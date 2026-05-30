const API_URL = "http://localhost:3001";

const cartContainer = document.getElementById("cartContainer");
const cartTotal = document.getElementById("cartTotal");
const cartMessage = document.getElementById("cartMessage");
const checkoutButton = document.getElementById("checkoutButton");

let cartItems = [];

function renderCart(items) {
  cartContainer.innerHTML = "";

  if (items.length === 0) {
    cartContainer.innerHTML = '<p class="catalog-empty">No products found.</p>';
    cartTotal.textContent = "Total: $0";
    checkoutButton.disabled = true;
    return;
  }

  checkoutButton.disabled = false;

  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = "catalog-card";

    card.innerHTML = `
      <div class="catalog-card__image-box">
        <img class="catalog-card__image" src="${product.image}" alt="${product.title}" />
      </div>
      <div class="catalog-card__meta">
        <span class="catalog-card__category">${product.category}</span>
        <span class="catalog-card__stock">${product.inStock ? "In stock" : "Out of stock"}</span>
      </div>
      <h2 class="catalog-card__title">${product.title}</h2>
      <p class="catalog-card__description">${product.description}</p>
      <div class="cart-quantity">
        <button type="button" data-action="decrease" data-id="${product.id}">-</button>
        <span>Quantity: ${product.quantity}</span>
        <button type="button" data-action="increase" data-id="${product.id}">+</button>
      </div>
      <div class="catalog-card__bottom">
        <div>
          <p class="catalog-card__price">$${product.price}</p>
          <p class="catalog-card__rating">Subtotal: $${product.price * product.quantity}</p>
        </div>
        <button class="catalog-card__button" type="button" data-action="remove" data-id="${product.id}">
          Remove
        </button>
      </div>
    `;

    cartContainer.append(card);
  });

  const total = items.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0,
  );

  cartTotal.textContent = `Total: $${total}`;
}

async function loadCart() {
  const response = await fetch(`${API_URL}/cart`);

  if (!response.ok) {
    throw new Error("Cart loading error");
  }

  cartItems = await response.json();
  renderCart(cartItems);
}

async function updateQuantity(id, quantity) {
  if (quantity < 1) {
    await removeFromCart(id);
    return;
  }

  await fetch(`${API_URL}/cart/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: quantity,
    }),
  });

  loadCart();
}

async function removeFromCart(id) {
  await fetch(`${API_URL}/cart/${id}`, {
    method: "DELETE",
  });

  loadCart();
}

async function checkout() {
  await Promise.all(
    cartItems.map((product) =>
      fetch(`${API_URL}/cart/${product.id}`, {
        method: "DELETE",
      }),
    ),
  );

  cartItems = [];
  renderCart(cartItems);
  cartMessage.textContent = "Purchase completed successfully.";
  alert("Purchase completed successfully.");
}

cartContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const cartItem = cartItems.find((product) => String(product.id) === id);

  if (!cartItem) {
    return;
  }

  if (button.dataset.action === "increase") {
    updateQuantity(id, cartItem.quantity + 1);
  }

  if (button.dataset.action === "decrease") {
    updateQuantity(id, cartItem.quantity - 1);
  }

  if (button.dataset.action === "remove") {
    removeFromCart(id);
  }
});

checkoutButton.addEventListener("click", checkout);

loadCart().catch(() => {
  cartContainer.innerHTML =
    '<p class="catalog-empty">Server is not available.</p>';
  checkoutButton.disabled = true;
});
