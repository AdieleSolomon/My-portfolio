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
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
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

const PROJECT_BRIEF_STORAGE_KEY = "solobest_project_briefs";
const PROJECT_BRIEF_STORAGE_LIMIT = 300;
const PROJECT_BRIEF_API_ENDPOINT = "/api/project-briefs";
const PROJECT_BRIEF_REQUEST_TIMEOUT_MS = 14000;

const getStoredProjectBriefs = () => {
  try {
    const rawValue = localStorage.getItem(PROJECT_BRIEF_STORAGE_KEY);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
};

const setStoredProjectBriefs = (briefs) => {
  try {
    localStorage.setItem(PROJECT_BRIEF_STORAGE_KEY, JSON.stringify(briefs));
    return true;
  } catch (error) {
    return false;
  }
};

const saveProjectBrief = (brief) => {
  const currentBriefs = getStoredProjectBriefs();
  currentBriefs.unshift(brief);

  if (currentBriefs.length > PROJECT_BRIEF_STORAGE_LIMIT) {
    currentBriefs.length = PROJECT_BRIEF_STORAGE_LIMIT;
  }

  const didSave = setStoredProjectBriefs(currentBriefs);
  return { didSave, total: currentBriefs.length };
};

const formatBriefDateTime = (isoString) => {
  try {
    const dateValue = new Date(isoString);
    if (Number.isNaN(dateValue.getTime())) return "Unknown date";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(dateValue);
  } catch (error) {
    return "Unknown date";
  }
};

const fetchJsonWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    PROJECT_BRIEF_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        typeof payload.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : `Request failed with status ${response.status}.`;
      throw new Error(message);
    }

    return payload;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const submitProjectBriefToApi = async (briefPayload) =>
  fetchJsonWithTimeout(PROJECT_BRIEF_API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(briefPayload),
  });

const loadProjectBriefsFromApi = async () => {
  const payload = await fetchJsonWithTimeout(PROJECT_BRIEF_API_ENDPOINT, {
    method: "GET",
  });
  return Array.isArray(payload.briefs) ? payload.briefs : [];
};

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
      if (
        !mobileNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
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
      if (
        !sectionMenu.contains(event.target) &&
        !sectionMenuToggle.contains(event.target)
      ) {
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
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
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
  const projectCards = document.querySelectorAll(
    ".project-card[data-category]",
  );
  if (filterButtons.length && projectCards.length) {
    const fadeOutCard = (card) => {
      card.getAnimations().forEach((animation) => animation.cancel());
      const animation = card.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(8px)" },
        ],
        { duration: 180, easing: "ease-out", fill: "forwards" },
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
        { duration: 220, easing: "ease-out", fill: "both" },
      );
    };

    filterButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.classList.contains("active")),
      );

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
          const shouldShow =
            selectedFilter === "all" || cardCategory === selectedFilter;
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

      if (
        previousFocusElement &&
        typeof previousFocusElement.focus === "function"
      ) {
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
          setPreviewStatus(
            "Live preview blocked. Loading fallback image...",
            "loading",
          );
          previewImage.src = fallbackImageUrl;
          return;
        }
        previewImage.classList.remove("is-loading");
        setPreviewStatus(
          'Preview unavailable. Use "Open in New Tab".',
          "error",
        );
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
        const fallbackImage =
          button.closest(".project-card")?.querySelector("img")?.src || "";
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
        `Please add ${emailAddress} to Solomon Adiele's portfolio update list.`,
      );

      feedback.textContent =
        "Opening your email app to confirm subscription...";
      window.location.href = `mailto:solomonadiele1@gmail.com?subject=${subject}&body=${body}`;
      form.reset();
    });
  });

  const projectBriefForms = document.querySelectorAll(".project-brief-form");
  projectBriefForms.forEach((form) => {
    const feedback = form.querySelector(".project-brief-feedback");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!feedback) return;
      if (!form.checkValidity()) {
        feedback.textContent =
          "Please complete all required project details first.";
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const readValue = (key) => String(formData.get(key) || "").trim();

      const trapField = readValue("website");
      if (trapField) {
        feedback.textContent = "Unable to submit request. Please try again.";
        return;
      }

      const fullName = readValue("full_name");
      const email = readValue("email");
      const company = readValue("company");
      const projectType = readValue("project_type");
      const budgetRange = readValue("budget_range");
      const timeline = readValue("timeline");
      const goals = readValue("goals");
      const mustHaveFeatures = readValue("must_have_features");
      const referenceUrl = readValue("reference_url");
      const preferredContact = readValue("preferred_contact");

      const briefRecord = {
        id: `brief-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        fullName,
        email,
        company: company || "Not provided",
        projectType,
        budgetRange,
        timeline,
        goals,
        mustHaveFeatures: mustHaveFeatures || "Not provided",
        referenceUrl: referenceUrl || "Not provided",
        preferredContact,
      };

      feedback.textContent = "Submitting project brief...";

      try {
        const apiResult = await submitProjectBriefToApi(briefRecord);
        const storedBrief =
          apiResult.brief && typeof apiResult.brief === "object"
            ? apiResult.brief
            : briefRecord;
        saveProjectBrief(storedBrief);
        form.reset();

        const notificationState = apiResult.notification || {};
        if (notificationState.sent === false) {
          feedback.textContent =
            "Project brief submitted successfully. Notification could not be delivered automatically.";
        } else {
          feedback.textContent =
            "Project brief submitted successfully. You will receive an automatic phone alert shortly.";
        }
      } catch (error) {
        const saveResult = saveProjectBrief(briefRecord);
        if (saveResult.didSave) {
          feedback.textContent =
            "Live submission is currently unavailable. Brief saved locally on this device only.";
        } else {
          feedback.textContent =
            "Unable to submit project brief right now. Please try again in a moment.";
        }
      }
    });
  });

  const briefBoardList = document.getElementById("briefBoardList");
  const briefBoardStatus = document.getElementById("briefBoardStatus");
  const briefRefreshBtn = document.getElementById("briefRefreshBtn");
  const briefClearBtn = document.getElementById("briefClearBtn");

  if (briefBoardList && briefBoardStatus) {
    const createBriefField = (label, value, allowLink = false) => {
      const fieldElement = document.createElement("div");
      fieldElement.className = "brief-field";

      const labelElement = document.createElement("span");
      labelElement.className = "label";
      labelElement.textContent = label;

      const valueElement = document.createElement("span");
      valueElement.className = "value";

      if (allowLink && /^https?:\/\//i.test(value)) {
        const anchorElement = document.createElement("a");
        anchorElement.href = value;
        anchorElement.textContent = value;
        anchorElement.target = "_blank";
        anchorElement.rel = "noopener noreferrer";
        valueElement.appendChild(anchorElement);
      } else {
        valueElement.textContent = value;
      }

      fieldElement.appendChild(labelElement);
      fieldElement.appendChild(valueElement);
      return fieldElement;
    };

    const renderBriefBoard = async () => {
      briefBoardStatus.textContent = "Loading submitted project briefs...";
      briefBoardList.innerHTML = "";
      let briefs = [];
      let usingLiveData = false;

      try {
        briefs = await loadProjectBriefsFromApi();
        usingLiveData = true;
        setStoredProjectBriefs(briefs);
      } catch (error) {
        briefs = getStoredProjectBriefs();
      }

      if (!briefs.length) {
        briefBoardStatus.textContent = usingLiveData
          ? "No submitted project briefs yet."
          : "Live dashboard unavailable. No locally cached briefs found.";
        const emptyStateElement = document.createElement("article");
        emptyStateElement.className = "brief-item-empty";
        emptyStateElement.textContent = usingLiveData
          ? "No briefs found yet. New submissions will appear here automatically."
          : "Unable to reach live dashboard and no local cache is available yet.";
        briefBoardList.appendChild(emptyStateElement);
        return;
      }

      if (usingLiveData) {
        briefBoardStatus.textContent = `${briefs.length} submitted brief${
          briefs.length === 1 ? "" : "s"
        } from all devices.`;
      } else {
        briefBoardStatus.textContent = `Live dashboard unavailable. Showing ${briefs.length} locally cached brief${
          briefs.length === 1 ? "" : "s"
        }.`;
      }

      briefs.forEach((brief) => {
        const itemElement = document.createElement("article");
        itemElement.className = "brief-item";

        const headElement = document.createElement("div");
        headElement.className = "brief-item-head";

        const titleElement = document.createElement("h3");
        titleElement.textContent = brief.fullName || "Unnamed request";

        const timeElement = document.createElement("time");
        timeElement.dateTime = brief.createdAt || "";
        timeElement.textContent = formatBriefDateTime(brief.createdAt);

        headElement.appendChild(titleElement);
        headElement.appendChild(timeElement);

        const fieldGridElement = document.createElement("div");
        fieldGridElement.className = "brief-item-grid";
        fieldGridElement.appendChild(
          createBriefField("Email", brief.email || "Not provided"),
        );
        fieldGridElement.appendChild(
          createBriefField("Company", brief.company || "Not provided"),
        );
        fieldGridElement.appendChild(
          createBriefField("Project Type", brief.projectType || "Not provided"),
        );
        fieldGridElement.appendChild(
          createBriefField("Budget", brief.budgetRange || "Not provided"),
        );
        fieldGridElement.appendChild(
          createBriefField("Timeline", brief.timeline || "Not provided"),
        );
        fieldGridElement.appendChild(
          createBriefField(
            "Preferred Contact",
            brief.preferredContact || "Not provided",
          ),
        );
        fieldGridElement.appendChild(
          createBriefField(
            "Must-Have Features",
            brief.mustHaveFeatures || "Not provided",
          ),
        );
        fieldGridElement.appendChild(
          createBriefField(
            "Reference URL",
            brief.referenceUrl || "Not provided",
            true,
          ),
        );
        fieldGridElement.appendChild(
          createBriefField("Project Goals", brief.goals || "Not provided"),
        );

        itemElement.appendChild(headElement);
        itemElement.appendChild(fieldGridElement);
        briefBoardList.appendChild(itemElement);
      });
    };

    if (briefRefreshBtn) {
      briefRefreshBtn.addEventListener("click", () => {
        renderBriefBoard();
      });
    }

    if (briefClearBtn) {
      briefClearBtn.textContent = "Clear Local Cache";
      briefClearBtn.addEventListener("click", () => {
        const shouldClear = window.confirm(
          "Clear locally cached briefs from this browser?",
        );
        if (!shouldClear) return;
        setStoredProjectBriefs([]);
        briefBoardStatus.textContent =
          "Local cache cleared. Reloading live dashboard...";
        renderBriefBoard();
      });
    }

    renderBriefBoard();
  }

  // Initialize carousel
  const initCarousel = () => {
    const carouselImages = document.querySelectorAll(".carousel-image");
    if (carouselImages.length === 0) return;

    let currentIndex = 0;

    const showImage = (index) => {
      carouselImages.forEach((img, idx) => {
        if (idx === index) {
          img.classList.add("active");
        } else {
          img.classList.remove("active");
        }
      });
    };

    const rotateCarousel = () => {
      currentIndex = (currentIndex + 1) % carouselImages.length;
      showImage(currentIndex);
    };

    // Rotate image every 3 seconds
    setInterval(rotateCarousel, 3000);
  };

  // Initialize carousel when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCarousel);
  } else {
    initCarousel();
  }
});
