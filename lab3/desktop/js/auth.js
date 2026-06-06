const API_URL = "http://localhost:3001";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const registerButton = document.getElementById("registerButton");
const registerMessage = document.getElementById("registerMessage");
const loginMessage = document.getElementById("loginMessage");
const authStatus = document.getElementById("authStatus");

const fields = {
  phone: document.getElementById("registerPhone"),
  email: document.getElementById("registerEmail"),
  birthDate: document.getElementById("birthDate"),
  lastName: document.getElementById("lastName"),
  firstName: document.getElementById("firstName"),
  patronymic: document.getElementById("patronymic"),
  password: document.getElementById("registerPassword"),
  repeatPassword: document.getElementById("repeatPassword"),
  nickname: document.getElementById("nickname"),
  agreement: document.getElementById("agreement"),
  loginIdentifier: document.getElementById("loginIdentifier"),
  loginPassword: document.getElementById("loginPassword"),
};

const generateNicknameButton = document.getElementById("generateNickname");
const passwordModeInputs = document.querySelectorAll("[name='passwordMode']");

const commonPasswords2024 = [
  "123456",
  "123456789",
  "12345678",
  "password",
  "qwerty",
  "qwerty123",
  "111111",
  "123123",
  "admin",
  "abc123",
  "password1",
  "iloveyou",
  "welcome",
  "monkey",
  "dragon",
  "letmein",
  "football",
  "baseball",
  "sunshine",
  "princess",
  "admin123",
  "welcome123",
  "passw0rd",
  "zaq12wsx",
];

const cyrillicMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
};

let nicknameAttempts = 0;
let validationRun = 0;

function getPasswordMode() {
  return document.querySelector("[name='passwordMode']:checked").value;
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

function clearFieldError(event) {
  const fieldId = event.target.id;

  if (fieldId) {
    setError(fieldId, "");
  }
}

function normalizePhone(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function isBelarusPhone(phone) {
  const normalized = normalizePhone(phone);
  return /^(\+375|375|80)(17|25|29|33|44)\d{7}$/.test(normalized);
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

//Дата
function isOlderThan16(dateValue) {
  const birthDate = new Date(dateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }

  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate(),
  );

  return birthDate <= minDate;
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    password.length <= 20 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function transliterate(value) {
  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((letter) => cyrillicMap[letter] || letter)
    .join("")
    .replace(/[^a-z0-9]/g, "");
}

//никкнейм
function buildNicknameCandidate() {
  const firstName = transliterate(fields.firstName.value);
  const lastName = transliterate(fields.lastName.value);
  const base = `${firstName.slice(0, 2) || "au"}${lastName.slice(0, 3) || "glow"}`;
  const number = Math.floor(1000 + Math.random() * 9000);

  return `${base}${number}`;
}

function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*";
  const all = `${upper}${lower}${digits}${special}`;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  while (required.length < 12) {
    required.push(all[Math.floor(Math.random() * all.length)]);
  }

  return required.sort(() => Math.random() - 0.5).join("");
}

async function fetchUsers() {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Users loading error");
  }

  return response.json();
}

async function isNicknameUnique(nickname) {
  const users = await fetchUsers();
  return !users.some(
    (user) => user.nickname.toLowerCase() === nickname.toLowerCase(),
  );
}

async function validateRegistration() {
  let isValid = true;
  const users = await fetchUsers().catch(() => null);

  if (!users) {
    setError("nickname", "Server is not available.");
    return false;
  }


  
  const phone = fields.phone.value.trim();
  const email = fields.email.value.trim();
  const birthDate = fields.birthDate.value;
  const lastName = fields.lastName.value.trim();
  const firstName = fields.firstName.value.trim();
  const password = fields.password.value;
  const repeatPassword = fields.repeatPassword.value;
  const nickname = fields.nickname.value.trim();

  const checks = [
    ["registerPhone", phone !== "", "Phone is required."],
    ["registerEmail", email !== "", "Email is required."],
    ["birthDate", birthDate !== "", "Birth date is required."],
    ["lastName", lastName !== "", "Last name is required."],
    ["firstName", firstName !== "", "First name is required."],
    ["registerPassword", password !== "", "Password is required."],
    ["repeatPassword", repeatPassword !== "", "Repeat password."],
    ["nickname", nickname !== "", "Nickname is required."],
    ["agreement", fields.agreement.checked, "User agreement is required."],
  ];

  checks.forEach(([fieldId, condition, message]) => {
    if (!condition) {
      setError(fieldId, message);
      isValid = false;
    }
  });

  if (phone && !isBelarusPhone(phone)) {
    setError(
      "registerPhone",
      "Use a Belarus phone number, for example +375291234567.",
    );
    isValid = false;
  }

  if (
    phone &&
    users.some((user) => normalizePhone(user.phone) === normalizePhone(phone))
  ) {
    setError("registerPhone", "This phone is already registered.");
    isValid = false;
  }

  if (email && !isEmailValid(email)) {
    setError("registerEmail", "Enter a valid email address.");
    isValid = false;
  }

  if (
    email &&
    users.some((user) => user.email.toLowerCase() === email.toLowerCase())
  ) {
    setError("registerEmail", "This email is already registered.");
    isValid = false;
  }

  if (birthDate && !isOlderThan16(birthDate)) {
    setError("birthDate", "User must be at least 16 years old.");
    isValid = false;
  }

  if (password && !isStrongPassword(password)) {
    setError(
      "registerPassword",
      "Use 8-20 chars with uppercase, lowercase, digit and special symbol.",
    );
    isValid = false;
  }

  if (password && commonPasswords2024.includes(password.toLowerCase())) {
    setError("registerPassword", "This password is too common.");
    isValid = false;
  }

  if (getPasswordMode() === "manual" && password !== repeatPassword) {
    setError("repeatPassword", "Passwords do not match.");
    isValid = false;
  }

  if (
    nickname &&
    users.some((user) => user.nickname.toLowerCase() === nickname.toLowerCase())
  ) {
    setError("nickname", "This nickname is already taken.");
    isValid = false;
  }

  return isValid;
}

async function validateAndToggleButton() {
  const currentRun = ++validationRun;
  const isValid = await validateRegistration();

  if (currentRun === validationRun) {
    registerButton.disabled = !isValid;
  }
}

async function generateNickname() {
  if (nicknameAttempts >= 5) {
    fields.nickname.readOnly = false;
    setError("nickname", "Manual nickname input is now available");
    return;
  }

  nicknameAttempts += 1;
  const nickname = buildNicknameCandidate();
  fields.nickname.value = nickname;

  if (!(await isNicknameUnique(nickname))) {
    setError("nickname", "This nickname is already taken. Generate again.");
  } else {
    setError("nickname", "");
  }

  if (nicknameAttempts >= 5) {
    fields.nickname.readOnly = false;
  }

  validateAndToggleButton();
}

function setPasswordMode(shouldValidate = true) {
  const isAuto = getPasswordMode() === "auto";

  fields.password.type = "text";
  fields.repeatPassword.type = "password";

  fields.password.readOnly = isAuto;
  fields.repeatPassword.readOnly = false;

  if (isAuto) {
    const password = generatePassword();

    fields.password.value = password;
    fields.repeatPassword.value = password;

    setError("registerPassword", "");
    setError("repeatPassword", "");
  } else {
    fields.password.value = "";
    fields.repeatPassword.value = "";
  }

  if (shouldValidate) {
    validateAndToggleButton();
  }
}

function renderAuthStatus() {
  const user = window.AuraglowSession.getCurrentUser();

  if (!user) {
    authStatus.innerHTML =
      '<p class="auth-status__text">You are not logged in.</p>';
    return;
  }

  authStatus.innerHTML = `
    <p class="auth-status__text">Signed in as <strong>${user.nickname}</strong> (${user.role}).</p>
    <button class="catalog-card__button" type="button" data-logout-button>Logout</button>
  `;
}

async function handleRegister(event) {
  event.preventDefault();
  registerMessage.textContent = "";

  if (!(await validateRegistration())) {
    registerButton.disabled = true;
    return;
  }

  const newUser = {
    id: crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`,
    phone: normalizePhone(fields.phone.value.trim()),
    email: fields.email.value.trim(),
    birthDate: fields.birthDate.value,
    lastName: fields.lastName.value.trim(),
    firstName: fields.firstName.value.trim(),
    patronymic: fields.patronymic.value.trim(),
    nickname: fields.nickname.value.trim(),
    password: fields.password.value,
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });

  if (!response.ok) {
    registerMessage.textContent = "Could not register user.";
    return;
  }

  const createdUser = await response.json();
  window.AuraglowSession.setCurrentUser(createdUser);
  window.AuraglowSession.updateNavigation();
  registerMessage.textContent = "Registration completed successfully.";
  registerForm.reset();
  fields.nickname.value = "";
  fields.nickname.readOnly = true;
  nicknameAttempts = 0;
  registerButton.disabled = true;
  renderAuthStatus();
}

async function handleLogin(event) {
  event.preventDefault();
  loginMessage.textContent = "";
  setError("loginIdentifier", "");
  setError("loginPassword", "");

  const identifier = fields.loginIdentifier.value.trim().toLowerCase();
  const password = fields.loginPassword.value;

  if (!identifier) {
    setError("loginIdentifier", "Email or nickname is required.");
    return;
  }

  if (!password) {
    setError("loginPassword", "Password is required.");
    return;
  }

  const users = await fetchUsers().catch(() => []);
  const user = users.find(
    (item) =>
      (item.email.toLowerCase() === identifier ||
        item.nickname.toLowerCase() === identifier) &&
      item.password === password,
  );

  if (!user) {
    loginMessage.textContent = "Incorrect login or password.";
    return;
  }

  window.AuraglowSession.setCurrentUser(user);
  window.AuraglowSession.updateNavigation();
  loginMessage.textContent = "Login completed successfully.";
  loginForm.reset();
  renderAuthStatus();
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", clearFieldError);
});

[
  fields.phone,
  fields.email,
  fields.birthDate,
  fields.lastName,
  fields.firstName,
  fields.password,
  fields.repeatPassword,
  fields.nickname,
  fields.agreement,
].forEach((field) => {
  field.addEventListener("input", validateAndToggleButton);
  field.addEventListener("change", validateAndToggleButton);
});

fields.firstName.addEventListener("input", () => {
  if (!fields.nickname.value && fields.lastName.value.trim()) {
    generateNickname();
  }
});

fields.lastName.addEventListener("input", () => {
  if (!fields.nickname.value && fields.firstName.value.trim()) {
    generateNickname();
  }
});

fields.repeatPassword.addEventListener("paste", (event) => {
  event.preventDefault();
  setError("repeatPassword", "Paste is not allowed in this field.");
});

passwordModeInputs.forEach((input) => {
  input.addEventListener("change", setPasswordMode);
});

generateNicknameButton.addEventListener("click", generateNickname);
registerForm.addEventListener("submit", handleRegister);
loginForm.addEventListener("submit", handleLogin);
window.addEventListener("auraglow:logout", renderAuthStatus);

renderAuthStatus();
setPasswordMode(false);
