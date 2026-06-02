const API_URL = "http://localhost:3001";
const MIN_FEEDBACK_LENGTH = 20;

const feedbackForm = document.getElementById("feedbackForm");
const productSelect = document.getElementById("productSelect");
const feedbackText = document.getElementById("feedbackText");
const feedbackButton = document.getElementById("feedbackButton");
const feedbackMessage = document.getElementById("feedbackMessage");
const feedbackStatus = document.getElementById("feedbackStatus");
const feedbackList = document.getElementById("feedbackList");

let products = [];

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

function getCurrentUser() {
  return window.AuraglowSession?.getCurrentUser() || null;
}

async function fetchJson(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error("Server request error");
  }

  return response.json();
}

function renderProductOptions() {
  productSelect.innerHTML = '<option value="">Choose product</option>';

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.title;
    productSelect.append(option);
  });
}

function renderStatus() {
  const user = getCurrentUser();

  if (!user) {
    feedbackStatus.textContent = "Login is required before leaving feedback.";
    return;
  }

  if (user.role === "administrator") {
    feedbackStatus.textContent = "Administrators cannot leave product reviews.";
    return;
  }

  feedbackStatus.textContent = `Signed in as ${user.nickname}.`;
}

async function hasPurchasedProduct(userId, productId) {
  const orders = await fetchJson(
    `/orders?userId=${encodeURIComponent(userId)}`,
  );

  return orders.some((order) =>
    order.items.some((item) => String(item.productId) === String(productId)),
  );
}

async function validateFeedback() {
  const user = getCurrentUser();
  const productId = productSelect.value;
  const text = feedbackText.value.trim();
  let isValid = true;

  setError("productSelect", "");
  setError("feedbackText", "");

  if (!user) {
    setError("productSelect", "Login is required.");
    isValid = false;
  }

  if (user?.role === "administrator") {
    setError("productSelect", "Administrator role cannot create reviews.");
    isValid = false;
  }

  if (!productId) {
    setError("productSelect", "Choose a product.");
    isValid = false;
  }

  if (text.length < MIN_FEEDBACK_LENGTH) {
    setError(
      "feedbackText",
      `Review must contain at least ${MIN_FEEDBACK_LENGTH} characters.`,
    );
    isValid = false;
  }

  if (user && productId && user.role !== "administrator") {
    const purchased = await hasPurchasedProduct(user.id, productId).catch(
      () => false,
    );

    if (!purchased) {
      setError("productSelect", "You can review only purchased products.");
      isValid = false;
    }
  }

  feedbackButton.disabled = !isValid;
  return isValid;
}

async function loadFeedbackList() {
  const reviews = await fetchJson("/feedback");

  feedbackList.innerHTML = "";

  if (reviews.length === 0) {
    feedbackList.innerHTML =
      '<p class="catalog-empty catalog-empty--compact">No feedback yet.</p>';
    return;
  }

  reviews
    .slice()
    .reverse()
    .forEach((review) => {
      const card = document.createElement("article");
      card.className = "review-card";
      card.innerHTML = `
        <h3>${review.productTitle}</h3>
        <p>${review.text}</p>
        <span>${review.nickname} · ${new Date(review.createdAt).toLocaleString()}</span>
      `;
      feedbackList.append(card);
    });
}

async function handleSubmit(event) {
  event.preventDefault();
  feedbackMessage.textContent = "";

  if (!(await validateFeedback())) {
    return;
  }

  const user = getCurrentUser();
  const selectedProduct = products.find(
    (product) => String(product.id) === String(productSelect.value),
  );

  const review = {
    productId: selectedProduct.id,
    productTitle: selectedProduct.title,
    userId: user.id,
    nickname: user.nickname,
    text: feedbackText.value.trim(),
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_URL}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    feedbackMessage.textContent = "Could not send feedback.";
    return;
  }

  feedbackForm.reset();
  feedbackButton.disabled = true;
  feedbackMessage.textContent = "Feedback saved successfully.";
  loadFeedbackList();
}

productSelect.addEventListener("change", validateFeedback);
feedbackText.addEventListener("input", () => {
  setError("feedbackText", "");
  validateFeedback();
});
feedbackForm.addEventListener("submit", handleSubmit);
window.addEventListener("auraglow:logout", () => {
  renderStatus();
  validateFeedback();
});

fetchJson("/products")
  .then((data) => {
    products = data;
    renderProductOptions();
    renderStatus();
    return loadFeedbackList();
  })
  .catch(() => {
    feedbackStatus.textContent = "Server is not available.";
  });
