const API_URL = "http://localhost:3001";

const favoritesContainer = document.getElementById("favoritesContainer");

function showToast(message, type = "info") {
  window.AuraglowUI?.showToast(message, type);
}

function renderFavorites(products) {
  favoritesContainer.innerHTML = "";

  if (products.length === 0) {
    favoritesContainer.innerHTML =
      '<p class="catalog-empty">No products found.</p>';
    return;
  }

  products.forEach((product) => {
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
      <div class="catalog-card__bottom">
        <div>
          <p class="catalog-card__price">$${product.price}</p>
          <p class="catalog-card__rating">Rating: ${product.rating}</p>
        </div>
        <button class="catalog-card__button" type="button" data-id="${product.id}">
          Remove
        </button>
      </div>
    `;

    favoritesContainer.append(card);
  });

  window.AuraglowUI?.refreshReveal();
}

async function loadFavorites() {
  const response = await fetch(`${API_URL}/favorites`);

  if (!response.ok) {
    throw new Error("Favorites loading error");
  }

  const products = await response.json();
  renderFavorites(products);
}

async function removeFavorite(id) {
  await fetch(`${API_URL}/favorites/${id}`, {
    method: "DELETE",
  });

  showToast("Product removed from favorites.", "success");
  loadFavorites().then(() => window.AuraglowUI?.updateCounters());
}

favoritesContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");

  if (button) {
    removeFavorite(button.dataset.id).catch(() => {
      showToast("Could not remove product from favorites.", "error");
    });
  }
});

loadFavorites().catch(() => {
  favoritesContainer.innerHTML =
    '<p class="catalog-empty">Server is not available.</p>';
});
