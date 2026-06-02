(function () {
  const SESSION_KEY = "auraglowCurrentUser";

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    updateNavigation();
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    updateNavigation();
    window.dispatchEvent(new CustomEvent("auraglow:logout"));
  }

  function updateNavigation() {
    const user = getCurrentUser();
    const isAdmin = user?.role === "administrator";

    document.querySelectorAll("[data-admin-link]").forEach((link) => {
      link.hidden = !isAdmin;
    });

    document.querySelectorAll("[data-auth-link]").forEach((link) => {
      link.textContent = user ? user.nickname : "Auth / Login";
      link.href = "auth.html";
    });

    document.querySelectorAll("[data-logout-button]").forEach((button) => {
      button.hidden = !user;
    });
  }

  document.addEventListener("click", (event) => {
    const logoutButton = event.target.closest("[data-logout-button]");

    if (!logoutButton) {
      return;
    }

    logout();

    if (window.location.pathname.endsWith("admin.html")) {
      window.location.href = "auth.html";
    }
  });

  window.AuraglowSession = {
    getCurrentUser,
    setCurrentUser,
    logout,
    updateNavigation,
    SESSION_KEY,
  };

  updateNavigation();
})();
