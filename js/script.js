document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => mobileNav.classList.remove("open"));
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
      if (!sectionMenu.contains(event.target)) {
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
      { threshold: 0.2 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
  }

  const heroProfileImage = document.getElementById("heroProfileImage");
  if (heroProfileImage) {
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

    window.setInterval(switchHeroImage, 4000);
  }

  const backToTopButton = document.getElementById("backToTop");
  if (backToTopButton) {
    const toggleBackToTop = () => {
      const shouldShow = window.scrollY > 420;
      backToTopButton.classList.toggle("show", shouldShow);
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
      button.addEventListener("click", () => {
        const selectedFilter = button.dataset.filter;

        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

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
});
