// Initialize EmailJS with your Public Key
(function() {
    emailjs.init("Ynrq1nepvA4WteLv1");
})();

// Mobile Menu Toggle
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
    });
});

// Project Filtering
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        document.querySelectorAll('.project-card').forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// WhatsApp Modal Functions
function openWhatsAppModal() {
    document.getElementById('whatsappModal').style.display = 'flex';
}

function closeWhatsAppModal() {
    document.getElementById('whatsappModal').style.display = 'none';
}

// Close modal when clicking outside
document.getElementById('whatsappModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeWhatsAppModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeWhatsAppModal();
    }
});

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
document.getElementById('emailSubmitBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    const form = document.getElementById('contactForm');
    
    // Validate form
    const name = form.user_name.value;
    const email = form.user_email.value;
    const phone = form.user_phone.value;
    const subject = form.subject.value;
    const message = form.message.value;
    
    if (!name || !email || !phone || !subject || !message) {
        alert('Please fill in all fields before sending.');
        return;
    }
    
    // Show loading state
    const originalText = this.textContent;
    this.textContent = 'Sending...';
    this.disabled = true;
    
    // Send email using EmailJS
    emailjs.sendForm('service_vn4qpbl', 'template_pwiqqhq', form)
        .then(function(response) {
            alert('Thank you! Your message has been sent successfully via email. I will get back to you soon.');
            form.reset();
            document.getElementById('emailSubmitBtn').textContent = originalText;
            document.getElementById('emailSubmitBtn').disabled = false;
        }, function(error) {
            alert('Sorry, there was an error sending your message. Please try again or email me directly at solomonadiele1@gmail.com');
            document.getElementById('emailSubmitBtn').textContent = originalText;
            document.getElementById('emailSubmitBtn').disabled = false;
        });
});

// WhatsApp Submission (for WhatsApp button)
document.getElementById('whatsappSubmitBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Get form values directly from inputs
    const name = document.getElementById('user_name').value;
    const email = document.getElementById('user_email').value;
    const phone = document.getElementById('user_phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Validate form
    if (!name || !email || !phone || !subject || !message) {
        alert('Please fill in all fields before sending.');
        return;
    }
    
    // Create WhatsApp message - properly encoded
    const whatsappMessage = `Hello Solomon!%0A%0AMy name is: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0APhone: ${encodeURIComponent(phone)}%0A%0ASubject: ${encodeURIComponent(subject)}%0A%0AMessage:%0A${encodeURIComponent(message)}`;
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/2348069383370?text=${whatsappMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    alert('Thank you! You will be redirected to WhatsApp to send your message.');
    
    // Optional: Reset form after successful WhatsApp submission
    document.getElementById('contactForm').reset();
});

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