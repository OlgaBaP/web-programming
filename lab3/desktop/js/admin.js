const API_URL = "http://localhost:3001";

const adminAccessMessage = document.getElementById("adminAccessMessage");
const adminContent = document.getElementById("adminContent");

const addProductForm = document.getElementById("addProductForm");
const editProductForm = document.getElementById("editProductForm");
const deleteProductForm = document.getElementById("deleteProductForm");

const addProductButton = document.getElementById("addProductButton");
const editProductButton = document.getElementById("editProductButton");
const deleteProductButton = document.getElementById("deleteProductButton");

const addProductMessage = document.getElementById("addProductMessage");
const editProductMessage = document.getElementById("editProductMessage");
const deleteProductMessage = document.getElementById("deleteProductMessage");

const editProductSelect = document.getElementById("editProductSelect");
const deleteProductSelect = document.getElementById("deleteProductSelect");
const reviewProductFilter = document.getElementById("reviewProductFilter");
const reviewUserFilter = document.getElementById("reviewUserFilter");
const adminReviewList = document.getElementById("adminReviewList");

let products = [];
let users = [];
let reviews = [];

function isAdministrator() {
  return window.AuraglowSession?.getCurrentUser()?.role === "administrator";
}

function setError(fieldId, message) {
  const error = document.querySelector(`[data-error-for='${fieldId}']`);
  const field = document.getElementById(fieldId);

  if (error) {
    error.textContent = message;
  }

  if (field) {
    field.classList.toggle("is-invalid", Boolean(message));
  }
}

async function fetchJson(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    throw new Error("Server request error");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function productFields(prefix) {
  return {
    title: document.getElementById(`${prefix}Title`),
    category: document.getElementById(`${prefix}Category`),
    price: document.getElementById(`${prefix}Price`),
    rating: document.getElementById(`${prefix}Rating`),
    image: document.getElementById(`${prefix}Image`),
    description: document.getElementById(`${prefix}Description`),
    inStock: document.getElementById(`${prefix}InStock`),
    isPopular: document.getElementById(`${prefix}IsPopular`),
  };
}

function buildProduct(prefix, id) {
  const fields = productFields(prefix);

  return {
    id,
    title: fields.title.value.trim(),
    description: fields.description.value.trim(),
    category: fields.category.value.trim(),
    price: Number(fields.price.value),
    rating: Number(fields.rating.value),
    image: fields.image.value.trim(),
    isPopular: fields.isPopular.checked,
    inStock: fields.inStock.checked,
  };
}

function fillProductForm(prefix, product) {
  const fields = productFields(prefix);

  fields.title.value = product?.title || "";
  fields.category.value = product?.category || "";
  fields.price.value = product?.price || "";
  fields.rating.value = product?.rating || "";
  fields.image.value = product?.image || "";
  fields.description.value = product?.description || "";
  fields.inStock.checked = product?.inStock ?? true;
  fields.isPopular.checked = product?.isPopular ?? false;
}

function validateProduct(prefix, needsSelectedProduct = false) {
  const fields = productFields(prefix);
  let isValid = true;

  Object.keys(fields).forEach((key) => {
    if (fields[key].id) {
      setError(fields[key].id, "");
    }
  });

  if (needsSelectedProduct && !editProductSelect.value) {
    setError("editProductSelect", "Choose a product.");
    isValid = false;
  }

  if (!fields.title.value.trim()) {
    setError(`${prefix}Title`, "Title is required.");
    isValid = false;
  }

  if (!fields.category.value.trim()) {
    setError(`${prefix}Category`, "Category is required.");
    isValid = false;
  }

  if (!fields.description.value.trim()) {
    setError(`${prefix}Description`, "Description is required.");
    isValid = false;
  }

  if (!fields.image.value.trim()) {
    setError(`${prefix}Image`, "Image path is required.");
    isValid = false;
  }

  if (!Number(fields.price.value) || Number(fields.price.value) <= 0) {
    setError(`${prefix}Price`, "Price must be greater than 0.");
    isValid = false;
  }

  if (
    fields.rating.value === "" ||
    Number(fields.rating.value) < 0 ||
    Number(fields.rating.value) > 5
  ) {
    setError(`${prefix}Rating`, "Rating must be from 0 to 5.");
    isValid = false;
  }

  return isValid;
}

function renderProductSelect(select, includeAll = false) {
  const firstLabel = includeAll ? "All products" : "Choose product";
  select.innerHTML = `<option value="">${firstLabel}</option>`;

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.title;
    select.append(option);
  });
}

function renderUserFilter() {
  reviewUserFilter.innerHTML = '<option value="">All users</option>';

  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = `${user.nickname} (${user.email})`;
    reviewUserFilter.append(option);
  });
}

function renderAllSelects() {
  renderProductSelect(editProductSelect);
  renderProductSelect(deleteProductSelect);
  renderProductSelect(reviewProductFilter, true);
  renderUserFilter();
}

async function loadData() {
  [products, users, reviews] = await Promise.all([
    fetchJson("/products"),
    fetchJson("/users"),
    fetchJson("/feedback"),
  ]);

  renderAllSelects();
  renderReviews();
}

function renderReviews() {
  const productId = reviewProductFilter.value;
  const userId = reviewUserFilter.value;
  const filteredReviews = reviews.filter((review) => {
    const matchesProduct =
      !productId || String(review.productId) === String(productId);
    const matchesUser = !userId || String(review.userId) === String(userId);

    return matchesProduct && matchesUser;
  });

  adminReviewList.innerHTML = "";

  if (filteredReviews.length === 0) {
    adminReviewList.innerHTML =
      '<p class="catalog-empty catalog-empty--compact">No reviews found.</p>';
    return;
  }

  filteredReviews
    .slice()
    .reverse()
    .forEach((review) => {
      const card = document.createElement("article");
      card.className = "review-card review-card--admin";
      card.innerHTML = `
        <div>
          <h3>${review.productTitle}</h3>
          <p>${review.text}</p>
          <span>${review.nickname} · ${new Date(review.createdAt).toLocaleString()}</span>
        </div>
        <button class="catalog-card__button" type="button" data-review-id="${review.id}">
          Delete
        </button>
      `;
      adminReviewList.append(card);
    });
}

function toggleAddButton() {
  addProductButton.disabled = !validateProduct("add");
}

function toggleEditButton() {
  editProductButton.disabled = !validateProduct("edit", true);
}

function toggleDeleteButton() {
  const isValid = Boolean(deleteProductSelect.value);
  setError("deleteProductSelect", isValid ? "" : "Choose a product.");
  deleteProductButton.disabled = !isValid;
}

async function handleAddProduct(event) {
  event.preventDefault();
  addProductMessage.textContent = "";

  if (!validateProduct("add")) {
    addProductButton.disabled = true;
    return;
  }

  const product = buildProduct("add");
  const createdProduct = await fetchJson("/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  products.push(createdProduct);
  renderAllSelects();
  addProductForm.reset();
  document.getElementById("addInStock").checked = true;
  addProductButton.disabled = true;
  addProductMessage.textContent = "Product added successfully.";
}

async function handleEditProduct(event) {
  event.preventDefault();
  editProductMessage.textContent = "";

  if (!validateProduct("edit", true)) {
    editProductButton.disabled = true;
    return;
  }

  const productId = editProductSelect.value;
  const originalProduct = products.find(
    (item) => String(item.id) === String(productId),
  );
  const product = buildProduct("edit", originalProduct?.id || productId);
  const updatedProduct = await fetchJson(`/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  products = products.map((item) =>
    String(item.id) === String(productId) ? updatedProduct : item,
  );
  renderAllSelects();
  editProductSelect.value = updatedProduct.id;
  editProductButton.disabled = true;
  editProductMessage.textContent = "Product updated successfully.";
}

async function handleDeleteProduct(event) {
  event.preventDefault();
  deleteProductMessage.textContent = "";

  if (!deleteProductSelect.value) {
    toggleDeleteButton();
    return;
  }

  await fetchJson(`/products/${deleteProductSelect.value}`, {
    method: "DELETE",
  });

  products = products.filter(
    (product) => String(product.id) !== String(deleteProductSelect.value),
  );
  renderAllSelects();
  fillProductForm("edit", null);
  deleteProductButton.disabled = true;
  deleteProductMessage.textContent = "Product deleted successfully.";
}

async function handleDeleteReview(event) {
  const button = event.target.closest("[data-review-id]");

  if (!button) {
    return;
  }

  await fetchJson(`/feedback/${button.dataset.reviewId}`, {
    method: "DELETE",
  });
  reviews = reviews.filter(
    (review) => String(review.id) !== String(button.dataset.reviewId),
  );
  renderReviews();
}

function attachProductValidation(prefix, callback) {
  Object.values(productFields(prefix)).forEach((field) => {
    field.addEventListener("input", callback);
    field.addEventListener("change", callback);
  });
}

function initAdmin() {
  if (!isAdministrator()) {
    adminAccessMessage.innerHTML =
      '<p class="auth-status__text">Admin panel is available only to administrators.</p>';
    adminContent.hidden = true;
    return;
  }

  adminAccessMessage.innerHTML =
    '<p class="auth-status__text">Administrator access confirmed.</p>';
  adminContent.hidden = false;

  attachProductValidation("add", toggleAddButton);
  attachProductValidation("edit", toggleEditButton);

  editProductSelect.addEventListener("change", () => {
    const product = products.find(
      (item) => String(item.id) === String(editProductSelect.value),
    );
    fillProductForm("edit", product);
    toggleEditButton();
  });

  deleteProductSelect.addEventListener("change", toggleDeleteButton);
  reviewProductFilter.addEventListener("change", renderReviews);
  reviewUserFilter.addEventListener("change", renderReviews);
  addProductForm.addEventListener("submit", handleAddProduct);
  editProductForm.addEventListener("submit", handleEditProduct);
  deleteProductForm.addEventListener("submit", handleDeleteProduct);
  adminReviewList.addEventListener("click", (event) => {
    handleDeleteReview(event).catch(() => {
      adminReviewList.innerHTML =
        '<p class="catalog-empty catalog-empty--compact">Could not delete review.</p>';
    });
  });

  loadData().catch(() => {
    adminAccessMessage.innerHTML =
      '<p class="auth-status__text">Server is not available.</p>';
  });
}

initAdmin();
