const API_URL = "http://localhost:3001";
const PAGE_LIMIT = 6;

const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");
const stockFilter = document.getElementById("stockFilter");
const popularFilter = document.getElementById("popularFilter");
const minPriceInput = document.getElementById("minPriceInput");
const maxPriceInput = document.getElementById("maxPriceInput");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");

let currentPage = 1;

function showToast(message, type = "info") {
  window.AuraglowUI?.showToast(message, type);
}

function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML =
      '<p class="catalog-empty">No products found.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "catalog-card";
    card.dataset.productId = product.id;

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
        <div class="catalog-card__actions">
          <button class="catalog-card__button" type="button" data-action="favorite" data-id="${product.id}">
            Add To Favorites
          </button>
          <button class="catalog-card__button" type="button" data-action="cart" data-id="${product.id}">
            Add To Cart
          </button>
        </div>
      </div>
    `;

    productsContainer.append(card);
  });

  window.AuraglowUI?.refreshReveal();
}

function getCatalogParams() {
  const params = new URLSearchParams();
  const searchText = searchInput.value.trim();
  const category = categoryFilter.value;
  const sortType = sortSelect.value;
  const stock = stockFilter.value;
  const popular = popularFilter.value;
  const minPrice = minPriceInput.value.trim();
  const maxPrice = maxPriceInput.value.trim();

  if (searchText !== "") {
    params.set("q", searchText);
  }

  if (category !== "all") {
    params.set("category", category);
  }

  if (stock !== "all") {
    params.set("inStock", stock);
  }

  if (popular !== "all") {
    params.set("isPopular", popular);
  }

  if (minPrice !== "") {
    params.set("price_gte", minPrice);
  }

  if (maxPrice !== "") {
    params.set("price_lte", maxPrice);
  }

  if (sortType === "price") {
    params.set("_sort", "price");
    params.set("_order", "asc");
  }

  if (sortType === "title") {
    params.set("_sort", "title");
    params.set("_order", "asc");
  }

  if (sortType === "rating") {
    params.set("_sort", "rating");
    params.set("_order", "desc");
  }

  params.set("_page", currentPage);
  params.set("_limit", PAGE_LIMIT);

  return params;
}

async function loadProducts() {
  const params = getCatalogParams();
  const response = await fetch(`${API_URL}/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Products loading error");
  }

  const data = await response.json();
  const products = Array.isArray(data) ? data : data.data || [];

  renderProducts(products);
  updatePagination(products.length, data.next);
}

async function loadCategories() {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Categories loading error");
  }

  const products = await response.json();
  const categories = new Set(products.map((product) => product.category));

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
}

function updatePagination(productsCount, nextPage) {
  pageNumber.textContent = `Page ${currentPage}`;
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = nextPage === null || productsCount < PAGE_LIMIT;
}

function resetPageAndLoad() {
  currentPage = 1;
  loadProducts().catch(showLoadingError);
}

async function getProductById(id) {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Product loading error");
  }

  return response.json();
}

async function addToFavorites(productId) {
  const product = await getProductById(productId);
  const favoriteResponse = await fetch(`${API_URL}/favorites?id=${productId}`);
  const favorites = await favoriteResponse.json();

  if (favorites.length > 0) {
    showToast("This product is already in favorites.", "info");
    return;
  }

  await fetch(`${API_URL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  showToast("Product added to favorites.", "success");
  window.AuraglowUI?.updateCounters();
}

async function addToCart(productId) {
  const product = await getProductById(productId);
  const cartResponse = await fetch(`${API_URL}/cart?id=${productId}`);
  const cartItems = await cartResponse.json();

  if (cartItems.length === 0) {
    await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...product,
        quantity: 1,
      }),
    });
  } else {
    const cartItem = cartItems[0];

    await fetch(`${API_URL}/cart/${cartItem.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: cartItem.quantity + 1,
      }),
    });
  }

  // Уведомление 
  showToast("Product added to cart.", "success");
  window.AuraglowUI?.updateCounters();
}

function handleProductsClick(event) {
  const button = event.target.closest("[data-action]");

  if (button) {
    const productId = button.dataset.id;

    if (button.dataset.action === "favorite") {
      addToFavorites(productId).catch(() => {
        showToast("Could not add product to favorites.", "error");
      });
    }

    if (button.dataset.action === "cart") {
      addToCart(productId).catch(() => {
        showToast("Could not add product to cart.", "error");
      });
    }

    return;
  }

  // Модальное окно товара
  const card = event.target.closest(".catalog-card[data-product-id]");

  if (card) {
    getProductById(card.dataset.productId)
      .then((product) => window.AuraglowUI?.openProductModal(product))
      .catch(() => showToast("Could not open product details.", "error"));
  }
}

function showLoadingError() {
  productsContainer.innerHTML =
    '<p class="catalog-empty">Server is not available.</p>';
}

searchInput.addEventListener("input", resetPageAndLoad);
categoryFilter.addEventListener("change", resetPageAndLoad);
sortSelect.addEventListener("change", resetPageAndLoad);
stockFilter.addEventListener("change", resetPageAndLoad);
popularFilter.addEventListener("change", resetPageAndLoad);
minPriceInput.addEventListener("input", resetPageAndLoad);
maxPriceInput.addEventListener("input", resetPageAndLoad);
productsContainer.addEventListener("click", handleProductsClick);

prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    loadProducts().catch(showLoadingError);
  }
});

nextPageButton.addEventListener("click", () => {
  currentPage += 1;
  loadProducts().catch(showLoadingError);
});

loadCategories().then(loadProducts).catch(showLoadingError);
