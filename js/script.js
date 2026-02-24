const registerServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    const activateWaitingServiceWorker = () => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    };

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          activateWaitingServiceWorker();
        }
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (window.__swReloaded) return;
      window.__swReloaded = true;
      window.location.reload();
    });

    registration.update();
    activateWaitingServiceWorker();
  } catch (error) {
    // Silent fail keeps the page functional even when SW is unavailable.
  }
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", registerServiceWorker);
}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (menuToggle && mobileNav) {
    menuToggle.setAttribute("aria-controls", "mobileNav");
    menuToggle.setAttribute("aria-expanded", "false");

    const setMobileMenuState = (isOpen) => {
      mobileNav.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    };

    menuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldOpen = !mobileNav.classList.contains("open");
      setMobileMenuState(shouldOpen);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMobileMenuState(false));
    });

    document.addEventListener("click", (event) => {
      if (!mobileNav.contains(event.target) && !menuToggle.contains(event.target)) {
        setMobileMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMobileMenuState(false);
      }
    });
  }

  const sectionMenuToggle = document.getElementById("sectionMenuToggle");
  const sectionMenu = document.getElementById("sectionMenu");
  if (sectionMenuToggle && sectionMenu) {
    const closeSectionMenu = () => {
      sectionMenu.classList.remove("open");
      sectionMenuToggle.classList.remove("open");
      sectionMenuToggle.setAttribute("aria-expanded", "false");
    };

    sectionMenuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = sectionMenu.classList.toggle("open");
      sectionMenuToggle.classList.toggle("open", isOpen);
      sectionMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    sectionMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeSectionMenu);
    });

    document.addEventListener("click", (event) => {
      if (!sectionMenu.contains(event.target) && !sectionMenuToggle.contains(event.target)) {
        closeSectionMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSectionMenu();
    });
  }

  const revealItems = document.querySelectorAll(".reveal, .reveal-delay");
  if ("IntersectionObserver" in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
  }

  const heroProfileImage = document.getElementById("heroProfileImage");
  if (heroProfileImage) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prefersReducedData = Boolean(navigator.connection && navigator.connection.saveData);

    if (!prefersReducedMotion && !prefersReducedData) {
      const heroImages = [
        "assets/images/profile1.jpg",
        "assets/images/profile.jpg",
        "assets/images/1U4A1754.JPG",
        "assets/images/1U4A1769.JPG",
        "assets/images/1U4A1781.JPG",
        "assets/images/1U4A1875.JPG",
        "assets/images/1U4A1885.JPG",
      ];

      let currentImageIndex = 0;
      let rotationTimerId = null;

      const switchHeroImage = () => {
        currentImageIndex = (currentImageIndex + 1) % heroImages.length;
        const nextImage = heroImages[currentImageIndex];
        const imageLoader = new Image();

        imageLoader.onload = () => {
          heroProfileImage.style.opacity = "0";
          window.setTimeout(() => {
            heroProfileImage.src = nextImage;
            heroProfileImage.style.opacity = "1";
          }, 220);
        };

        imageLoader.onerror = () => {
          heroProfileImage.style.opacity = "1";
        };

        imageLoader.src = nextImage;
      };

      const startRotation = () => {
        if (rotationTimerId !== null) return;
        rotationTimerId = window.setInterval(switchHeroImage, 4500);
      };

      const stopRotation = () => {
        if (rotationTimerId === null) return;
        window.clearInterval(rotationTimerId);
        rotationTimerId = null;
      };

      startRotation();

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopRotation();
          return;
        }
        startRotation();
      });
    }
  }

  const backToTopButton = document.getElementById("backToTop");
  if (backToTopButton) {
    const toggleBackToTop = () => {
      const shouldShow = window.scrollY > 420;
      backToTopButton.classList.toggle("show", shouldShow);
      backToTopButton.setAttribute("aria-hidden", String(!shouldShow));
    };

    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card[data-category]");
  if (filterButtons.length && projectCards.length) {
    const fadeOutCard = (card) => {
      card.getAnimations().forEach((animation) => animation.cancel());
      const animation = card.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(8px)" },
        ],
        { duration: 180, easing: "ease-out", fill: "forwards" }
      );

      animation.onfinish = () => {
        card.style.display = "none";
        card.style.opacity = "";
        card.style.transform = "";
      };
    };

    const fadeInCard = (card) => {
      card.getAnimations().forEach((animation) => animation.cancel());
      card.style.display = "";
      card.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 220, easing: "ease-out", fill: "both" }
      );
    };

    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.classList.contains("active")));

      button.addEventListener("click", () => {
        const selectedFilter = button.dataset.filter;

        filterButtons.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        projectCards.forEach((card) => {
          const cardCategory = card.dataset.category;
          const shouldShow = selectedFilter === "all" || cardCategory === selectedFilter;
          const isVisible = card.style.display !== "none";

          if (shouldShow && !isVisible) {
            fadeInCard(card);
          } else if (!shouldShow && isVisible) {
            fadeOutCard(card);
          }
        });
      });
    });
  }

  const previewButtons = document.querySelectorAll(".quick-preview-btn");
  const previewModal = document.getElementById("quickPreviewModal");
  const previewImage = document.getElementById("quickPreviewImage");
  const previewStatus = document.getElementById("quickPreviewStatus");
  const previewTitle = document.getElementById("quickPreviewTitle");
  const previewOpenLink = document.getElementById("quickPreviewOpenLink");
  const previewCloseButton = document.getElementById("quickPreviewClose");
  const previewBackdrop = previewModal
    ? previewModal.querySelector("[data-close-preview]")
    : null;

  if (
    previewButtons.length &&
    previewModal &&
    previewImage &&
    previewStatus &&
    previewTitle &&
    previewOpenLink &&
    previewCloseButton &&
    previewBackdrop
  ) {
    let previousFocusElement = null;
    let statusClearTimeoutId = null;

    const setPreviewStatus = (message, state) => {
      if (statusClearTimeoutId) {
        window.clearTimeout(statusClearTimeoutId);
        statusClearTimeoutId = null;
      }

      previewStatus.textContent = message;
      previewStatus.hidden = false;
      previewStatus.dataset.state = state;
    };

    const clearPreviewStatus = () => {
      if (statusClearTimeoutId) {
        window.clearTimeout(statusClearTimeoutId);
        statusClearTimeoutId = null;
      }

      previewStatus.hidden = true;
      previewStatus.textContent = "";
      delete previewStatus.dataset.state;
    };

    const closePreviewModal = () => {
      previewModal.classList.remove("open");
      previewModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      previewImage.onload = null;
      previewImage.onerror = null;
      previewImage.classList.remove("is-loading");
      previewImage.src = "";
      clearPreviewStatus();

      if (previousFocusElement && typeof previousFocusElement.focus === "function") {
        previousFocusElement.focus();
      }
    };

    const openPreviewModal = (previewUrl, projectTitle, fallbackImageUrl) => {
      previousFocusElement = document.activeElement;
      previewTitle.textContent = `${projectTitle} - Quick Demo Preview`;
      previewOpenLink.href = previewUrl;

      const resolvedPreviewUrl = new URL(previewUrl, window.location.href).href;
      const quickShotUrl = `https://image.thum.io/get/width/1600/${resolvedPreviewUrl}`;

      previewImage.classList.add("is-loading");
      setPreviewStatus("Loading preview...", "loading");

      previewImage.onload = () => {
        previewImage.classList.remove("is-loading");
        setPreviewStatus("Preview ready.", "ready");
        statusClearTimeoutId = window.setTimeout(() => {
          clearPreviewStatus();
        }, 900);
      };

      previewImage.onerror = () => {
        if (fallbackImageUrl && previewImage.src !== fallbackImageUrl) {
          setPreviewStatus("Live preview blocked. Loading fallback image...", "loading");
          previewImage.src = fallbackImageUrl;
          return;
        }
        previewImage.classList.remove("is-loading");
        setPreviewStatus('Preview unavailable. Use "Open in New Tab".', "error");
      };
      previewImage.src = quickShotUrl;

      previewModal.classList.add("open");
      previewModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      previewCloseButton.focus();
    };

    previewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const previewUrl = button.dataset.previewUrl;
        const projectTitle = button.dataset.projectTitle || "Project";
        const fallbackImage = button.closest(".project-card")?.querySelector("img")?.src || "";
        if (!previewUrl) return;
        openPreviewModal(previewUrl, projectTitle, fallbackImage);
      });
    });

    previewCloseButton.addEventListener("click", closePreviewModal);
    previewBackdrop.addEventListener("click", closePreviewModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && previewModal.classList.contains("open")) {
        closePreviewModal();
      }
    });
  }

  const newsletterForms = document.querySelectorAll(".newsletter-form");
  newsletterForms.forEach((form) => {
    let feedback = form.parentElement.querySelector(".newsletter-feedback");

    if (!feedback) {
      feedback = document.createElement("p");
      feedback.className = "newsletter-feedback";
      feedback.setAttribute("aria-live", "polite");
      form.parentElement.appendChild(feedback);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = form.querySelector("input[type='email']");

      if (!emailInput || !emailInput.value.trim()) {
        feedback.textContent = "Please provide an email address first.";
        return;
      }

      if (!emailInput.checkValidity()) {
        feedback.textContent = "Please enter a valid email address.";
        return;
      }

      const emailAddress = emailInput.value.trim();
      const subject = encodeURIComponent("Portfolio newsletter subscription");
      const body = encodeURIComponent(
        `Please add ${emailAddress} to Solomon Adiele's portfolio update list.`
      );

      feedback.textContent = "Opening your email app to confirm subscription...";
      window.location.href = `mailto:solomonadiele1@gmail.com?subject=${subject}&body=${body}`;
      form.reset();
    });
  });
});
