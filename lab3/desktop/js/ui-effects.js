const UI_API_URL = "http://localhost:3001";

(function () {
  const productSounds = [
    220, 247, 262, 294, 330, 349, 392, 440, 494, 523, 587, 659,
  ];
  let audioContext = null;
  let modalOpened = false;

  function lockPage() {
    document.body.classList.add("is-locked");
  }

  function unlockPage() {
    if (
      !document.querySelector(".ui-modal.is-open") &&
      !document.body.classList.contains("menu-open")
    ) {
      document.body.classList.remove("is-locked");
    }
  }

  function createPreloader() {
    const preloader = document.createElement("div");
    preloader.className = "site-preloader";
    preloader.innerHTML = `
      <div class="site-preloader__mark" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <p class="site-preloader__text">Auraglow</p>
    `;
    document.body.prepend(preloader);

    window.addEventListener("load", () => {
      setTimeout(() => {
        preloader.classList.add("is-hidden");
        setTimeout(() => preloader.remove(), 500);
      }, 350);
    });
  }

  function createToastArea() {
    let area = document.querySelector(".toast-area");

    if (!area) {
      area = document.createElement("div");
      area.className = "toast-area";
      area.setAttribute("aria-live", "polite");
      document.body.append(area);
    }

    return area;
  }

  function showToast(message, type = "info") {
    const area = createToastArea();
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    area.append(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  function setupBurgerMenu() {
    const nav = document.querySelector(".catalog-nav, .nav");
    const header = nav?.closest(".catalog-header") || nav?.closest(".header__row");

    if (!nav || !header || document.querySelector(".burger-button")) {
      return;
    }

    const burger = document.createElement("button");
    burger.className = "burger-button";
    burger.type = "button";
    burger.setAttribute("aria-label", "Open menu");
    burger.setAttribute("aria-expanded", "false");
    burger.innerHTML = "<span></span><span></span><span></span>";

    const overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    document.body.append(overlay);
    header.append(burger);

    function closeMenu() {
      document.body.classList.remove("menu-open");
      burger.classList.remove("is-active");
      burger.setAttribute("aria-expanded", "false");
      unlockPage();
    }

    function openMenu() {
      document.body.classList.add("menu-open", "is-locked");
      burger.classList.add("is-active");
      burger.setAttribute("aria-expanded", "true");
    }

    burger.addEventListener("click", () => {
      if (document.body.classList.contains("menu-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener("click", closeMenu);
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) {
        closeMenu();
      }
    });
  }

  function openModal(modal) {
    if (!modal) {
      return;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    modalOpened = true;
    lockPage();
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.querySelectorAll("video, iframe").forEach((media) => {
      if (media.tagName === "VIDEO") {
        media.pause();
      }

      if (media.tagName === "IFRAME") {
        media.src = media.src;
      }
    });
    unlockPage();
  }

  function setupModals() {
    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-modal-target]");
      const closer = event.target.closest("[data-modal-close]");
      const openedModal = event.target.closest(".ui-modal");

      if (opener) {
        openModal(document.querySelector(opener.dataset.modalTarget));
      }

      if (closer) {
        closeModal(closer.closest(".ui-modal"));
      }

      if (openedModal && event.target === openedModal) {
        closeModal(openedModal);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll(".ui-modal.is-open").forEach(closeModal);
      }
    });
  }

  function setupSlider() {
    document.querySelectorAll("[data-slider]").forEach((slider) => {
      const slides = slider.querySelectorAll(".glow-slider__slide");
      const prev = slider.querySelector("[data-slider-prev]");
      const next = slider.querySelector("[data-slider-next]");
      let current = 0;

      if (slides.length === 0) {
        return;
      }

      function showSlide(index) {
        slides[current].classList.remove("is-active");
        current = (index + slides.length) % slides.length;
        slides[current].classList.add("is-active");
      }

      let timer = setInterval(() => showSlide(current + 1), 4200);

      function restart(nextIndex) {
        clearInterval(timer);
        showSlide(nextIndex);
        timer = setInterval(() => showSlide(current + 1), 4200);
      }

      prev?.addEventListener("click", () => restart(current - 1));
      next?.addEventListener("click", () => restart(current + 1));
    });
  }

  function setupSmoothScroll() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');

      if (!link || link.getAttribute("href") === "#") {
        return;
      }

      const target = document.querySelector(link.getAttribute("href"));

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function setupReveal() {
    const items = document.querySelectorAll(
      "section, .catalog-card, .review-card, .form-panel, .glow-slider, .media-gallery",
    );

    items.forEach((item) => item.classList.add("reveal-on-scroll"));

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    items.forEach((item) => {
      if (!item.classList.contains("is-visible")) {
        observer.observe(item);
      }
    });
  }

  function setupParallax() {
    const section = document.querySelector("[data-parallax]");

    if (!section) {
      return;
    }

    function moveLayers() {
      const rect = section.getBoundingClientRect();
      const progress = rect.top / window.innerHeight;

      section.querySelectorAll("[data-parallax-speed]").forEach((layer) => {
        const speed = Number(layer.dataset.parallaxSpeed);
        layer.style.transform = `translate3d(0, ${progress * speed}px, 0)`;
      });
    }

    moveLayers();
    window.addEventListener("scroll", moveLayers, { passive: true });
    window.addEventListener("resize", moveLayers);
  }

  function setupCounters() {
    updateCounters();
  }

  async function fetchCount(path, sumQuantity = false) {
    const response = await fetch(`${UI_API_URL}${path}`);

    if (!response.ok) {
      throw new Error("Counter loading error");
    }

    const items = await response.json();

    if (!Array.isArray(items)) {
      return 0;
    }

    return sumQuantity
      ? items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
      : items.length;
  }

  function animateCounter(element, target) {
    const start = Number(element.dataset.value || 0);
    const duration = 700;
    const startedAt = performance.now();

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const value = Math.round(start + (target - start) * progress);
      element.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.dataset.value = target;
      }
    }

    requestAnimationFrame(tick);
  }

  async function updateCounters() {
    const cartTargets = document.querySelectorAll("[data-count-cart]");
    const favoriteTargets = document.querySelectorAll("[data-count-favorites]");
    const statTargets = document.querySelectorAll("[data-stat-source]");

    try {
      const [cartCount, favoriteCount] = await Promise.all([
        cartTargets.length ? fetchCount("/cart", true) : Promise.resolve(0),
        favoriteTargets.length
          ? fetchCount("/favorites", false)
          : Promise.resolve(0),
      ]);

      cartTargets.forEach((item) => animateCounter(item, cartCount));
      favoriteTargets.forEach((item) => animateCounter(item, favoriteCount));
    } catch (error) {
      return;
    }

    statTargets.forEach(async (item) => {
      try {
        const count = await fetchCount(item.dataset.statSource);
        animateCounter(item, count);
      } catch (error) {
        animateCounter(item, Number(item.dataset.fallback || 0));
      }
    });
  }

  function createHeaderCounters() {
    const cartLinks = document.querySelectorAll(".catalog-header__cart, .cart");
    const favoriteLinks = document.querySelectorAll(
      '.catalog-nav__link[href="favorites.html"], .nav__link[href="favorites.html"]',
    );

    cartLinks.forEach((link) => {
      if (!link.querySelector("[data-count-cart]")) {
        const badge = document.createElement("span");
        badge.className = "auraglow-count-badge";
        badge.dataset.countCart = "";
        badge.dataset.value = "0";
        badge.textContent = "0";
        link.append(badge);
      }
    });

    favoriteLinks.forEach((link) => {
      if (!link.querySelector("[data-count-favorites]")) {
        const badge = document.createElement("span");
        badge.className = "auraglow-count-badge auraglow-count-badge--inline";
        badge.dataset.countFavorites = "";
        badge.dataset.value = "0";
        badge.textContent = "0";
        link.append(badge);
      }
    });
  }

  function setupMediaGallery() {
    const gallery = document.querySelector("[data-media-gallery]");

    if (!gallery) {
      return;
    }

    const items = [
      { image: "../assets/product/product-kit.png", title: "LED Kit", frequency: productSounds[0] },
      { image: "../assets/product/product-gel.png", title: "Whitening Gel", frequency: productSounds[1] },
      { image: "../assets/product/product-pen.png", title: "Whitening Pen", frequency: productSounds[2] },
      { image: "../assets/product/product-strips.png", title: "Strips", frequency: productSounds[3] },
      { image: "../assets/product/product-toothpaste.png", title: "Daily Toothpaste", frequency: productSounds[4] },
      { image: "../assets/product/product-serum.png", title: "Serum", frequency: productSounds[5] },
      { image: "../assets/product/product-trays.png", title: "Trays", frequency: productSounds[6] },
      { image: "../assets/product/product-refills.png", title: "Refills", frequency: productSounds[7] },
      { image: "../assets/product/product-led-light.png", title: "Video demo", frequency: productSounds[8], video: true },
      { image: "../assets/product/product-travel-kit.png", title: "Travel Kit", frequency: productSounds[9] },
    ];

    const image = gallery.querySelector("[data-gallery-image]");
    const title = gallery.querySelector("[data-gallery-title]");
    const status = gallery.querySelector("[data-audio-status]");
    const volume = gallery.querySelector("[data-volume]");
    const videoButton = gallery.querySelector("[data-video-open]");
    let current = 0;

    function playTone(frequency) {
      audioContext = audioContext || new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const level = Number(volume?.value || 0.35);

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = level;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      status.textContent = "Playing";

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.45,
      );
      oscillator.stop(audioContext.currentTime + 0.45);
      oscillator.addEventListener("ended", () => {
        status.textContent = "Paused";
      });
    }

    function showItem(index) {
      const item = items[index];
      image.classList.add("is-switching");

      setTimeout(() => {
        image.src = item.image;
        image.alt = item.title;
        title.textContent = item.title;
        videoButton.hidden = !item.video;
        image.classList.toggle("is-video-trigger", Boolean(item.video));
        image.classList.remove("is-switching");
      }, 180);

      playTone(item.frequency);
    }

    function chooseRandom() {
      let next = Math.floor(Math.random() * items.length);

      if (next === current) {
        next = (next + 1) % items.length;
      }

      current = next;
      showItem(current);
    }

    gallery.querySelectorAll("[data-gallery-random]").forEach((button) => {
      button.addEventListener("click", chooseRandom);
    });

    image.addEventListener("click", () => {
      if (items[current].video) {
        openModal(document.querySelector("#videoModal"));
      }
    });

    videoButton?.addEventListener("click", () => {
      openModal(document.querySelector("#videoModal"));
    });
  }

  function openProductModal(product) {
    let modal = document.querySelector("#productDetailModal");

    if (!modal) {
      modal = document.createElement("section");
      modal.className = "ui-modal";
      modal.id = "productDetailModal";
      modal.setAttribute("aria-hidden", "true");
      document.body.append(modal);
    }

    modal.innerHTML = `
      <div class="ui-modal__dialog product-modal" role="dialog" aria-modal="true">
        <button class="ui-modal__close" type="button" data-modal-close aria-label="Close">x</button>
        <div class="product-modal__image-box">
          <img src="${product.image}" alt="${product.title}" />
        </div>
        <div class="product-modal__content">
          <p class="catalog-hero__subtitle">${product.category}</p>
          <h2 class="form-panel__title">${product.title}</h2>
          <p class="product-modal__description">${product.description}</p>
          <p class="catalog-card__price">$${product.price}</p>
          <p class="catalog-card__rating">Rating: ${product.rating}</p>
          <p class="catalog-card__stock">${product.inStock ? "In stock" : "Out of stock"}</p>
        </div>
      </div>
    `;

    openModal(modal);
  }

  document.addEventListener("DOMContentLoaded", () => {
    createPreloader();
    createHeaderCounters();
    setupBurgerMenu();
    setupModals();
    setupSlider();
    setupSmoothScroll();
    setupReveal();
    setupParallax();
    setupCounters();
    setupMediaGallery();
  });

  window.AuraglowUI = {
    showToast,
    updateCounters,
    refreshReveal: setupReveal,
    openModal,
    closeModal,
    openProductModal,
    get modalOpened() {
      return modalOpened;
    },
  };
})();
