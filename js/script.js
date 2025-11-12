        // Navigation functionality
        document.addEventListener('DOMContentLoaded', () => {
            const threeLineBtn = document.getElementById('threeLineBtn');
            const sidePanel = document.getElementById('sidePanel');
            const sidePanelClose = document.getElementById('sidePanelClose');

            function openSidePanel() {
                sidePanel.classList.add('open');
                threeLineBtn.classList.add('active');
                sidePanel.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }

            function closeSidePanel() {
                sidePanel.classList.remove('open');
                threeLineBtn.classList.remove('active');
                sidePanel.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }

            if (threeLineBtn) {
                threeLineBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (sidePanel.classList.contains('open')) closeSidePanel();
                    else openSidePanel();
                });
            }

            if (sidePanelClose) {
                sidePanelClose.addEventListener('click', closeSidePanel);
            }

            // Close the panel when any option or link inside it is clicked
            if (sidePanel) {
                sidePanel.querySelectorAll('.side-panel-option, a').forEach((el) => {
                    el.addEventListener('click', (evt) => {
                        // let anchor navigate first (if needed), then close panel
                        // small delay ensures anchor actions (hash navigation) still happen
                        setTimeout(closeSidePanel, 100);
                    });
                });
            }

            // Close when clicking outside the panel
            document.addEventListener('click', (e) => {
                if (sidePanel.classList.contains('open') &&
                    !sidePanel.contains(e.target) &&
                    !threeLineBtn.contains(e.target)) {
                    closeSidePanel();
                }
            });

            // Close on Esc and ensure panel is closed when resizing to desktop
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sidePanel.classList.contains('open')) closeSidePanel();
            });
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) closeSidePanel();
            });
        });

        // WhatsApp Modal Functions
        function openWhatsAppModal() {
            document.getElementById('whatsappModal').style.display = 'flex';
        }

        function closeWhatsAppModal() {
            document.getElementById('whatsappModal').style.display = 'none';
        }

        // Initialize EmailJS with your Public Key
        (function() {
            emailjs.init("Ynrq1nepvA4WteLv1");
        })();

        // Project Filtering
        document.addEventListener('DOMContentLoaded', function() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            if (filterButtons.length > 0) {
                filterButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        // Remove active class from all buttons
                        document.querySelectorAll('.filter-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        
                        // Add active class to clicked button
                        button.classList.add('active');
                        
                        const filter = button.getAttribute('data-filter');
                        
                        document.querySelectorAll('.project-card').forEach(card => {
                            if (filter === 'all' || card.getAttribute('data-category').includes(filter)) {
                                card.style.display = 'block';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                });
            }

            // Project link handlers - only prevent default for placeholder links
            document.querySelectorAll('.demo-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    // Only prevent default for links that don't have valid href attributes
                    if (this.getAttribute('href') === '#' || !this.getAttribute('href')) {
                        e.preventDefault();
                        alert('This project demo will be available soon!');
                    }
                    // Allow links with actual URLs to work normally
                });
            });

            document.querySelectorAll('.github-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    
                    // Only prevent default for empty or placeholder links
                    if (!href || href === '#' || href === '') {
                        e.preventDefault();
                        alert('Source code will be available on GitHub soon!');
                    }
                    // Allow the GitHub link that has a real URL to work normally
                });
            });

            // Contact Form Submission with EmailJS (for Email button)
            const emailSubmitBtn = document.getElementById('emailSubmitBtn');
            if (emailSubmitBtn) {
                emailSubmitBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const form = document.getElementById('contactForm');
                    
                    // Validate form
                    const name = form.user_name.value.trim();
                    const email = form.user_email.value.trim();
                    const phone = form.user_phone.value.trim();
                    const subject = form.subject.value.trim();
                    const message = form.message.value.trim();
                    
                    if (!name || !email || !phone || !subject || !message) {
                        alert('Please fill in all fields before sending.');
                        return;
                    }
                    
                    // Email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        alert('Please enter a valid email address.');
                        return;
                    }
                    
                    // Phone validation
                    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                    if (!phoneRegex.test(phone)) {
                        alert('Please enter a valid phone number.');
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
                        reply_to: email
                    };
                    
                    // Send email using EmailJS
                    emailjs.send('service_vn4qpbl', 'template_pwiqqhq', templateParams)
                        .then(function(response) {
                            // Show success message
                            showFormSuccess('Thank you! Your message has been sent successfully via email. I will get back to you soon.');
                            
                            // Reset form
                            form.reset();
                            
                            // Restore button
                            document.getElementById('emailSubmitBtn').innerHTML = originalText;
                            document.getElementById('emailSubmitBtn').disabled = false;
                        }, function(error) {
                            // Show error message
                            alert('Sorry, there was an error sending your message. Please try again or email me directly at solomonadiele1@gmail.com');
                            
                            // Restore button
                            document.getElementById('emailSubmitBtn').innerHTML = originalText;
                            document.getElementById('emailSubmitBtn').disabled = false;
                        });
                });
            }

            // WhatsApp Submission (for WhatsApp button)
            const whatsappSubmitBtn = document.getElementById('whatsappSubmitBtn');
            if (whatsappSubmitBtn) {
                whatsappSubmitBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get form values directly from inputs
                    const name = document.getElementById('user_name').value.trim();
                    const email = document.getElementById('user_email').value.trim();
                    const phone = document.getElementById('user_phone').value.trim();
                    const subject = document.getElementById('subject').value.trim();
                    const message = document.getElementById('message').value.trim();
                    
                    // Validate form
                    if (!name || !email || !phone || !subject || !message) {
                        alert('Please fill in all fields before sending.');
                        return;
                    }
                    
                    // Show loading state
                    const originalText = this.innerHTML;
                    this.innerHTML = '<div class="btn-loading"></div>';
                    this.disabled = true;
                    
                    // Create WhatsApp message - properly encoded
                    const whatsappMessage = `Hello Solomon!%0A%0A*New Contact Form Submission*%0A%0A*Name:* ${encodeURIComponent(name)}%0A*Email:* ${encodeURIComponent(email)}%0A*Phone:* ${encodeURIComponent(phone)}%0A*Subject:* ${encodeURIComponent(subject)}%0A%0A*Message:*%0A${encodeURIComponent(message)}`;
                    
                    // Create WhatsApp URL
                    const whatsappUrl = `https://wa.me/2348069383370?text=${whatsappMessage}`;
                    
                    // Open WhatsApp in new tab after a short delay to show loading state
                    setTimeout(() => {
                        window.open(whatsappUrl, '_blank');
                        
                        // Show success message
                        showFormSuccess('Thank you! You will be redirected to WhatsApp to send your message.');
                        
                        // Reset form
                        document.getElementById('contactForm').reset();
                        
                        // Restore button
                        document.getElementById('whatsappSubmitBtn').innerHTML = originalText;
                        document.getElementById('whatsappSubmitBtn').disabled = false;
                    }, 1000);
                });
            }

            // Smooth scrolling for navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 70,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });

        // Show form success message
        function showFormSuccess(message) {
            // Create success message element if it doesn't exist
            let successElement = document.querySelector('.form-success');
            if (!successElement) {
                successElement = document.createElement('div');
                successElement.className = 'form-success';
                document.querySelector('.contact-form').appendChild(successElement);
            }
            
            successElement.textContent = message;
            successElement.classList.add('show');
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successElement.classList.remove('show');
            }, 5000);
        }