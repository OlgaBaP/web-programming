const products = [
  {
    id: 1,
    title: "Complete LED Whitening Kit",
    description:
      "A full whitening kit with LED light, gel and trays for a bright smile at home.",
    category: "Whitening Kits",
    price: 80,
    rating: 4.9,
    image: "../assets/product/product-kit.png",
    isPopular: true,
    inStock: true,
  },
  {
    id: 2,
    title: "Custom Whitening Kit",
    description:
      "A comfortable custom kit made for easy whitening treatments during the week.",
    category: "Whitening Kits",
    price: 95,
    rating: 4.8,
    image: "../assets/product/product-custom-kit.png",
    isPopular: true,
    inStock: true,
  },
  {
    id: 3,
    title: "Whitening Strips",
    description:
      "Simple whitening strips for removing daily stains from coffee, tea and snacks.",
    category: "Whitening",
    price: 32,
    rating: 4.6,
    image: "../assets/product/product-strips.png",
    isPopular: false,
    inStock: true,
  },
  {
    id: 4,
    title: "Whitening Pen",
    description:
      "A small brush pen for quick whitening touch-ups at home or while traveling.",
    category: "Whitening",
    price: 24,
    rating: 4.5,
    image: "../assets/product/product-pen.png",
    isPopular: true,
    inStock: true,
  },
  {
    id: 5,
    title: "Daily Toothpaste",
    description:
      "Fresh daily toothpaste that supports a clean smile and gentle stain care.",
    category: "Toothpaste",
    price: 14,
    rating: 4.4,
    image: "../assets/product/product-toothpaste.png",
    isPopular: false,
    inStock: true,
  },
  {
    id: 6,
    title: "Whitening Gel",
    description:
      "Dental-grade whitening gel for use with trays and LED whitening tools.",
    category: "Whitening Gel",
    price: 45,
    rating: 4.7,
    image: "../assets/product/product-gel.png",
    isPopular: true,
    inStock: true,
  },
  {
    id: 7,
    title: "Extra Strength Whitening Gel",
    description:
      "A stronger gel refill for customers who want a more powerful whitening routine.",
    category: "Whitening Gel",
    price: 52,
    rating: 4.8,
    image: "../assets/product/product-extra-strength-gel.png",
    isPopular: true,
    inStock: true,
  },
  {
    id: 8,
    title: "LED Whitening Light",
    description:
      "A reusable LED light that helps improve home whitening sessions.",
    category: "Accessories",
    price: 38,
    rating: 4.5,
    image: "../assets/product/product-led-light.png",
    isPopular: false,
    inStock: true,
  },
  {
    id: 9,
    title: "Whitening Trays",
    description:
      "Soft trays for comfortable whitening with Auraglow gel products.",
    category: "Accessories",
    price: 20,
    rating: 4.3,
    image: "../assets/product/product-trays.png",
    isPopular: false,
    inStock: true,
  },
  {
    id: 10,
    title: "Whitening Serum",
    description:
      "A smooth serum for brightening care and a polished finish after brushing.",
    category: "Whitening",
    price: 28,
    rating: 4.6,
    image: "../assets/product/product-serum.png",
    isPopular: false,
    inStock: true,
  },
  {
    id: 11,
    title: "Whitening Refills",
    description:
      "Extra refill pieces for keeping your whitening routine ready for the next month.",
    category: "Refills",
    price: 30,
    rating: 4.4,
    image: "../assets/product/product-refills.png",
    isPopular: false,
    inStock: true,
  },
  {
    id: 12,
    title: "Travel Whitening Kit",
    description:
      "A compact whitening kit for trips, weekends and busy schedules.",
    category: "Whitening Kits",
    price: 58,
    rating: 4.7,
    image: "../assets/product/product-travel-kit.png",
    isPopular: true,
    inStock: true,
  },
  {
    id: 13,
    title: "Electric Toothbrush",
    description:
      "An electric toothbrush for daily cleaning with a clean Auraglow look.",
    category: "Toothbrushes",
    price: 70,
    rating: 4.8,
    image: "../assets/product/product-toothbrush.png",
    isPopular: true,
    inStock: true,
  },
  {
    id: 14,
    title: "Bamboo Brush Heads",
    description: "Replacement brush heads made for a fresh brushing routine.",
    category: "Toothbrushes",
    price: 18,
    rating: 4.2,
    image: "../assets/product/product-brush-heads.png",
    isPopular: false,
    inStock: true,
  },
  {
    id: 15,
    title: "Starter Oral Care Set",
    description:
      "A starter set with simple essentials for daily oral wellness.",
    category: "Sets",
    price: 64,
    rating: 4.9,
    image: "../assets/product/product-starter-set.png",
    isPopular: true,
    inStock: true,
  },
];

const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");
const methodResult = document.getElementById("methodResult");
const methodButtons = document.querySelectorAll("[data-method]");

function renderProducts(list) {
  productsContainer.innerHTML = "";

  if (list.length === 0) {
    productsContainer.innerHTML =
      '<p class="catalog-empty">No products found.</p>';
    return;
  }

  list.forEach((product) => {
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
        <button class="catalog-card__button" type="button">Add To Cart</button>
      </div>
    `;

    productsContainer.append(card);
  });
}

function fillCategoryFilter() {
  const categories = products.map((product) => product.category);
  const uniqueCategories = [];

  categories.forEach((category) => {
    if (!uniqueCategories.includes(category)) {
      uniqueCategories.push(category);
    }
  });

  uniqueCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
}

function getFilteredProducts() {
  const searchText = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sortType = sortSelect.value;

  let result = products.filter((product) => {
    const text = `${product.title} ${product.description}`.toLowerCase();
    const matchesSearch = text.includes(searchText);
    const matchesCategory = category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (sortType === "title") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortType === "price") {
    result.sort((a, b) => a.price - b.price);
  }

  if (sortType === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  }

  return result;
}

function updateCatalog() {
  const result = getFilteredProducts();
  renderProducts(result);
}

function showMethodResult(text) {
  methodResult.textContent = text;
}

function handleMethodButton(method) {
  if (method === "map") {
    const titles = products.map((product) => product.title);
    showMethodResult(`map: ${titles.join(", ")}`);
  }

  if (method === "filter") {
    const popularProducts = products.filter((product) => product.isPopular);
    renderProducts(popularProducts);
    showMethodResult(
      `filter: found ${popularProducts.length} popular products.`,
    );
  }

  if (method === "sort") {
    const sortedProducts = products.slice().sort((a, b) => a.price - b.price);
    renderProducts(sortedProducts);
    showMethodResult("sort: products sorted by price from low to high.");
  }

  if (method === "find") {
    const foundProduct = products.find(
      (product) => product.category === "Accessories",
    );
    showMethodResult(
      `find: ${foundProduct.title} is the first Accessories product.`,
    );
  }

  if (method === "some") {
    const hasExpensiveProduct = products.some((product) => product.price > 90);
    showMethodResult(`some: products over $90 exist - ${hasExpensiveProduct}.`);
  }

  if (method === "every") {
    const allInStock = products.every((product) => product.inStock);
    showMethodResult(`every: all products are in stock - ${allInStock}.`);
  }

  if (method === "reduce") {
    const totalPrice = products.reduce(
      (sum, product) => sum + product.price,
      0,
    );
    showMethodResult(`reduce: total price of all products is $${totalPrice}.`);
  }

  if (method === "slice") {
    const firstFiveProducts = products.slice(0, 5);
    renderProducts(firstFiveProducts);
    showMethodResult("slice: first 5 products are shown.");
  }

  if (method === "reverse") {
    const reversedProducts = products.slice().reverse();
    renderProducts(reversedProducts);
    showMethodResult("reverse: products are shown in reverse order.");
  }

  if (method === "includes") {
    const categories = products.map((product) => product.category);
    const hasWhitening = categories.includes("Whitening");
    showMethodResult(`includes: category Whitening exists - ${hasWhitening}.`);
  }
}

fillCategoryFilter();
renderProducts(products);

searchInput.addEventListener("input", updateCatalog);
categoryFilter.addEventListener("change", updateCatalog);
sortSelect.addEventListener("change", updateCatalog);

methodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleMethodButton(button.dataset.method);
  });
});
