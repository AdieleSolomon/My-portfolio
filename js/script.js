// Navigation functionality
document.addEventListener("DOMContentLoaded", () => {
  const threeLineBtn = document.getElementById("threeLineBtn");
  const sidePanel = document.getElementById("sidePanel");
  const sidePanelClose = document.getElementById("sidePanelClose");

  function openSidePanel() {
    sidePanel.classList.add("open");
    threeLineBtn.classList.add("active");
    sidePanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeSidePanel() {
    sidePanel.classList.remove("open");
    threeLineBtn.classList.remove("active");
    sidePanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (threeLineBtn) {
    threeLineBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (sidePanel.classList.contains("open")) closeSidePanel();
      else openSidePanel();
    });
  }

  if (sidePanelClose) {
    sidePanelClose.addEventListener("click", closeSidePanel);
  }

  // Close the panel when any option or link inside it is clicked
  if (sidePanel) {
    sidePanel.querySelectorAll(".side-panel-option, a").forEach((el) => {
      el.addEventListener("click", (evt) => {
        setTimeout(closeSidePanel, 100);
      });
    });
  }

  // Close when clicking outside the panel
  document.addEventListener("click", (e) => {
    if (
      sidePanel.classList.contains("open") &&
      !sidePanel.contains(e.target) &&
      !threeLineBtn.contains(e.target)
    ) {
      closeSidePanel();
    }
  });

  // Close on Esc and ensure panel is closed when resizing to desktop
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidePanel.classList.contains("open"))
      closeSidePanel();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeSidePanel();
  });
});

// WhatsApp Modal Functions
function openWhatsAppModal() {
  document.getElementById("whatsappModal").style.display = "flex";
}

function closeWhatsAppModal() {
  document.getElementById("whatsappModal").style.display = "none";
}

// Initialize EmailJS with your Public Key
(function () {
  emailjs.init("Ynrq1nepvA4WteLv1");
})();

// Hero Grid Image Setup
function initializeHeroGrid() {
  const heroGridContainer = document.getElementById("heroGridContainer");
  const heroGrid = document.querySelector(".hero-grid");

  if (!heroGridContainer || !heroGrid) return;

  // Clear existing grid items
  heroGrid.innerHTML = "";

  // Create 6 grid items
  const totalGridItems = 6;

  for (let i = 0; i < totalGridItems; i++) {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-image-item";

    const img = document.createElement("img");
    img.src = imageUrls[i % imageUrls.length]; // Cycle through images
    img.alt = `Hero background image ${i + 1}`;
    img.loading = "lazy";

    // Add error handling for images
    img.onerror = function () {
      console.error(`Failed to load image: ${this.src}`);
    };

    gridItem.appendChild(img);
    heroGrid.appendChild(gridItem);
  }

  // Show the grid with animation after a short delay
  setTimeout(() => {
    heroGridContainer.classList.add("show");
  }, 500);

  // Add mouse move parallax effect
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 10;
    const y = (e.clientY / window.innerHeight) * 10;

    const gridItems = document.querySelectorAll(".grid-image-item");
    gridItems.forEach((item, index) => {
      const speed = 0.02 * (index + 1);
      const xOffset = x * speed;
      const yOffset = y * speed;

      item.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
  });

  // Add periodic animation for more life
  setInterval(() => {
    const items = document.querySelectorAll(".grid-image-item");
    items.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = "0.8";
        setTimeout(() => {
          item.style.opacity = "0.7";
        }, 1000);
      }, index * 300);
    });
  }, 5000);
}

// System Tools Demo Functionality
function setupSystemToolsDemo() {
  const systemDemoLink = document.querySelector(".system-demo-link");

  if (systemDemoLink) {
    systemDemoLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.open("system-tools-demo.html", "_blank");
    });
  }
}

// Church project modal/demo functionality
function setupChurchProject() {
  const demoLink = document.querySelector(".church-demo-link");

  if (demoLink) {
    demoLink.addEventListener("click", function (e) {
      e.preventDefault();

      // Create modal for the church project
      const modal = document.createElement("div");
      modal.className = "church-modal";
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      `;

      modal.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #1a0b2e 0%, #2d1b3d 100%);
          border-radius: 15px;
          padding: 30px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border: 2px solid var(--accent);
        ">
          <button class="modal-close" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: var(--accent);
            color: var(--dark);
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          ">&times;</button>
          
          <h2 style="color: var(--accent); margin-bottom: 20px; text-align: center;">
            <i class="fas fa-church"></i> Throne of Grace Church Website
          </h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <h3 style="color: var(--accent); margin-bottom: 10px;">Features</h3>
              <ul style="color: var(--text-light); padding-left: 20px;">
                <li>Multi-page responsive design</li>
                <li>Dynamic event management</li>
                <li>Online giving integration</li>
                <li>Prayer request system</li>
                <li>Member portal</li>
                <li>Live streaming page</li>
                <li>Location finder</li>
                <li>Media library</li>
              </ul>
            </div>
            
            <div>
              <h3 style="color: var(--accent); margin-bottom: 10px;">Technologies</h3>
              <ul style="color: var(--text-light); padding-left: 20px;">
                <li>HTML5 & CSS3</li>
                <li>JavaScript (ES6+)</li>
                <li>Responsive Design</li>
                <li>Form Validation</li>
                <li>Dynamic Content Loading</li>
                <li>GitHub Pages</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: var(--text-light); margin-bottom: 20px;">
              This is a fully functional church website with all the essential features
              needed for modern church management and member engagement.
            </p>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <button onclick="window.open('https://github.com/AdieleSolomon/My-portfolio?tab=readme-ov-file', '_blank')" 
                style="background: var(--accent); color: var(--dark); border: none; padding: 10px 20px; 
                border-radius: 5px; cursor: pointer; font-weight: 600;">
                <i class="fab fa-github"></i> View on GitHub
              </button>
              <button onclick="window.open('throne-of-grace-demo.html', '_blank')" 
                style="background: #3498db; color: white; border: none; padding: 10px 20px; 
                border-radius: 5px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-external-link-alt"></i> Open Full Demo
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Close modal functionality
      const closeBtn = modal.querySelector(".modal-close");
      closeBtn.addEventListener("click", () => {
        document.body.removeChild(modal);
      });

      // Close modal on outside click
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    });
  }
}

// Project Filtering
document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (filterButtons.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        document.querySelectorAll(".filter-btn").forEach((btn) => {
          btn.classList.remove("active");
        });

        // Add active class to clicked button
        button.classList.add("active");

        const filter = button.getAttribute("data-filter");

        document.querySelectorAll(".project-card").forEach((card) => {
          if (
            filter === "all" ||
            card.getAttribute("data-category").includes(filter)
          ) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // Project link handlers - only prevent default for placeholder links
  document.querySelectorAll(".demo-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      // Only prevent default for links that don't have valid href attributes
      if (this.getAttribute("href") === "#" || !this.getAttribute("href")) {
        e.preventDefault();
        alert("This project demo will be available soon!");
      }
    });
  });

  document.querySelectorAll(".github-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Only prevent default for empty or placeholder links
      if (!href || href === "#" || href === "") {
        e.preventDefault();
        alert("Source code will be available on GitHub soon!");
      }
    });
  });

  // Contact Form Submission with EmailJS (for Email button)
  const emailSubmitBtn = document.getElementById("emailSubmitBtn");
  if (emailSubmitBtn) {
    emailSubmitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      const form = document.getElementById("contactForm");

      // Validate form
      const name = form.user_name.value.trim();
      const email = form.user_email.value.trim();
      const phone = form.user_phone.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !phone || !subject || !message) {
        alert("Please fill in all fields before sending.");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Phone validation
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        alert("Please enter a valid phone number.");
        return;
      }

      // Show loading state
      const originalText = this.innerHTML;
      this.innerHTML = '<div class="btn-loading"></div>';
      this.disabled = true;

      // Create form data object
      const templateParams = {
        user_name: name,
        user_email: email,
        user_phone: phone,
        subject: subject,
        message: message,
        from_name: name,
        reply_to: email,
      };

      // Send email using EmailJS
      emailjs.send("service_vn4qpbl", "template_pwiqqhq", templateParams).then(
        function (response) {
          // Show success message
          showFormSuccess(
            "Thank you! Your message has been sent successfully via email. I will get back to you soon."
          );

          // Reset form
          form.reset();

          // Restore button
          document.getElementById("emailSubmitBtn").innerHTML = originalText;
          document.getElementById("emailSubmitBtn").disabled = false;
        },
        function (error) {
          // Show error message
          alert(
            "Sorry, there was an error sending your message. Please try again or email me directly at solomonadiele1@gmail.com"
          );

          // Restore button
          document.getElementById("emailSubmitBtn").innerHTML = originalText;
          document.getElementById("emailSubmitBtn").disabled = false;
        }
      );
    });
  }

  // WhatsApp Submission (for WhatsApp button)
  const whatsappSubmitBtn = document.getElementById("whatsappSubmitBtn");
  if (whatsappSubmitBtn) {
    whatsappSubmitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Get form values directly from inputs
      const name = document.getElementById("user_name").value.trim();
      const email = document.getElementById("user_email").value.trim();
      const phone = document.getElementById("user_phone").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const message = document.getElementById("message").value.trim();

      // Validate form
      if (!name || !email || !phone || !subject || !message) {
        alert("Please fill in all fields before sending.");
        return;
      }

      // Show loading state
      const originalText = this.innerHTML;
      this.innerHTML = '<div class="btn-loading"></div>';
      this.disabled = true;

      // Create WhatsApp message - properly encoded
      const whatsappMessage = `Hello Solomon!%0A%0A*New Contact Form Submission*%0A%0A*Name:* ${encodeURIComponent(
        name
      )}%0A*Email:* ${encodeURIComponent(
        email
      )}%0A*Phone:* ${encodeURIComponent(
        phone
      )}%0A*Subject:* ${encodeURIComponent(
        subject
      )}%0A%0A*Message:*%0A${encodeURIComponent(message)}`;

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/2348069383370?text=${whatsappMessage}`;

      // Open WhatsApp in new tab after a short delay to show loading state
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");

        // Show success message
        showFormSuccess(
          "Thank you! You will be redirected to WhatsApp to send your message."
        );

        // Reset form
        document.getElementById("contactForm").reset();

        // Restore button
        document.getElementById("whatsappSubmitBtn").innerHTML = originalText;
        document.getElementById("whatsappSubmitBtn").disabled = false;
      }, 1000);
    });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: "smooth",
        });
      }
    });
  });

  // Initialize hero grid
  initializeHeroGrid();

  // Setup church project
  setupChurchProject();

  // Setup system tools demo
  setupSystemToolsDemo();

  // Initialize video editing
  initializeVideoEditing();
});

// Show form success message
function showFormSuccess(message) {
  // Create success message element if it doesn't exist
  let successElement = document.querySelector(".form-success");
  if (!successElement) {
    successElement = document.createElement("div");
    successElement.className = "form-success";
    document.querySelector(".contact-form").appendChild(successElement);
  }

  successElement.textContent = message;
  successElement.classList.add("show");

  // Hide success message after 5 seconds
  setTimeout(() => {
    successElement.classList.remove("show");
  }, 5000);
}

// Video Editing Functionality
function initializeVideoEditing() {
  const videoModal = document.getElementById("videoModal");
  const videoContainer = document.getElementById("videoContainer");
  const videoModalInfo = document.getElementById("videoModalInfo");
  const videoModalClose = document.querySelector(".video-modal-close");

  if (!videoModal) return;

  // Video data - Replace with your actual video URLs
  const videoData = {
    corporate_promo: {
      type: "placeholder",
      title: "Corporate Promotional Video",
      description:
        "Professional corporate video with motion graphics, voiceover, and brand integration",
      tags: [
        "Adobe Premiere Pro",
        "After Effects",
        "Color Grading",
        "Motion Graphics",
      ],
      duration: "3:45 min",
    },
    social_media_reel: {
      type: "placeholder",
      title: "Social Media Reel",
      description:
        "Engaging social media content with dynamic transitions, text animations, and trending audio",
      tags: [
        "Final Cut Pro",
        "Motion Graphics",
        "Sound Design",
        "Mobile Optimized",
      ],
      duration: "1:30 min",
    },
    event_highlights: {
      type: "placeholder",
      title: "Event Highlights",
      description:
        "Multi-camera event coverage with seamless editing, audio synchronization, and highlight compilation",
      tags: [
        "DaVinci Resolve",
        "Multi-cam Editing",
        "Audio Mixing",
        "Highlights Compilation",
      ],
      duration: "5:20 min",
    },
  };

  // Open video modal
  document.querySelectorAll(".video-placeholder").forEach((placeholder) => {
    placeholder.addEventListener("click", function () {
      const videoId = this.getAttribute("data-video-id");
      const video = videoData[videoId];

      if (video) {
        let videoHTML = "";

        if (video.type === "youtube") {
          videoHTML = `<iframe 
            src="https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0" 
            title="${video.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>`;
        } else if (video.type === "vimeo") {
          videoHTML = `<iframe 
            src="https://player.vimeo.com/video/${video.vimeoId}?autoplay=1" 
            title="${video.title}"
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen>
          </iframe>`;
        } else {
          // Placeholder for now - replace with actual video when available
          videoHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #1a0b2e; color: white; padding: 20px; text-align: center;">
            <i class="fas fa-video" style="font-size: 3rem; color: var(--accent); margin-bottom: 20px;"></i>
            <h3 style="color: var(--accent); margin-bottom: 15px;">${
              video.title
            }</h3>
            <p>Video coming soon! This is a placeholder for your ${video.title.toLowerCase()}.</p>
            <p style="margin-top: 20px; font-size: 0.9rem; color: var(--text-light);">
              Contact me to see actual video samples.
            </p>
          </div>`;
        }

        videoContainer.innerHTML = videoHTML;

        // Update modal info
        videoModalInfo.innerHTML = `
          <h3>${video.title}</h3>
          <p>${video.description}</p>
          <div class="video-tags" style="margin-top: 10px;">
            ${video.tags
              .map((tag) => `<span class="video-tag">${tag}</span>`)
              .join("")}
          </div>
          <div class="video-stats" style="margin-top: 15px;">
            <span><i class="fas fa-clock"></i> ${video.duration}</span>
            <span><i class="fas fa-film"></i> Professional Editing</span>
          </div>
        `;

        videoModal.classList.add("show");
        document.body.style.overflow = "hidden";
      }
    });
  });

  // Close video modal
  if (videoModalClose) {
    videoModalClose.addEventListener("click", closeVideoModal);
  }

  function closeVideoModal() {
    videoModal.classList.remove("show");
    videoContainer.innerHTML = "";
    videoModalInfo.innerHTML = "";
    document.body.style.overflow = "";
  }

  // Close modal on outside click
  videoModal.addEventListener("click", (e) => {
    if (e.target === videoModal) {
      closeVideoModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoModal.classList.contains("show")) {
      closeVideoModal();
    }
  });
}
