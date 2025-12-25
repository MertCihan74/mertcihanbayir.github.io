// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const contactForm = document.getElementById('contactForm');
const langBtns = document.querySelectorAll('.lang-btn');

// Language Management
function initLanguage() {
  const savedLang = localStorage.getItem('language') || 'tr';
  setLanguage(savedLang);
}

function setLanguage(lang) {
  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Update active language button
  langBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });

  // Update all text elements with data attributes
  const elements = document.querySelectorAll('[data-' + lang + ']');
  elements.forEach(element => {
    element.textContent = element.getAttribute('data-' + lang);
  });

  // Save language preference
  localStorage.setItem('language', lang);
}

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
  }
}

function toggleTheme() {
  const currentTheme = body.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Navigation
function smoothScroll(target) {
  // Convert hash to selector
  let selector = target;
  if (target.startsWith('#')) {
    selector = target;
  }

  const element = document.querySelector(selector);
  if (element) {
    const offsetTop = element.offsetTop - 70; // Account for fixed navbar
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });

    // Update URL without page reload
    history.replaceState(null, null, target);
  }
}

function updateActiveNavLink() {
  const scrollPosition = window.scrollY + 100;

  document.querySelectorAll('section').forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}

function toggleMobileMenu() {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
}

// Mobile Menu Animation
function initMobileMenuToggle() {
  const spans = navToggle.querySelectorAll('span');
  navToggle.addEventListener('click', () => {
    toggleMobileMenu();

    if (navToggle.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
}

// Scroll Animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.pricing-card, .portfolio-item, .contact-method, .trust-item').forEach(el => {
    observer.observe(el);
  });
}

// Contact Form Handling
function initContactForm() {
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Simple form validation
      if (!data.name || !data.email || !data.message) {
        showNotification('Lütfen tüm zorunlu alanları doldurun.', 'error');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        showNotification('Geçerli bir email adresi girin.', 'error');
        return;
      }

      // Simulate form submission
      showNotification('Mesajınız gönderildi! En kısa sürede dönüş yapacağım.', 'success');

      // Reset form
      contactForm.reset();
    });
  }
}

function showNotification(message, type) {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Style notification
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '1rem 2rem';
  notification.style.borderRadius = '8px';
  notification.style.color = 'white';
  notification.style.fontWeight = '500';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
  notification.style.transform = 'translateX(100%)';
  notification.style.transition = 'transform 0.3s ease';

  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  }

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Auto remove
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

// Navbar Background on Scroll
function updateNavbar() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.backdropFilter = 'blur(20px)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.backdropFilter = 'blur(10px)';
  }

  if (body.getAttribute('data-theme') === 'dark') {
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(15, 23, 42, 0.98)';
    } else {
      navbar.style.background = 'rgba(15, 23, 42, 0.95)';
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize language
  initLanguage();

  // Initialize theme
  initTheme();

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Language toggle
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // Navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href');
      smoothScroll(target);

      // Close mobile menu if open
      if (navMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  // Mobile menu
  initMobileMenuToggle();

  // Scroll animations
  initScrollAnimations();

  // Contact form
  initContactForm();

  // Active nav link updates
  window.addEventListener('scroll', updateActiveNavLink);
  window.addEventListener('scroll', updateNavbar);

  // Initial active link check
  updateActiveNavLink();
  updateNavbar();
});

// Add CSS for animations
const additionalStyles = `
<style>
.nav-menu.active {
  display: flex;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  flex-direction: column;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
}

[data-theme="dark"] .nav-menu.active {
  background: rgba(15, 23, 42, 0.95);
}

.nav-menu.active .nav-link {
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.nav-menu.active .nav-link:last-child {
  border-bottom: none;
}

.animate-in {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 769px) {
  .nav-menu.active {
    position: static;
    display: flex !important;
    flex-direction: row;
    background: transparent;
    backdrop-filter: none;
    padding: 0;
    border-top: none;
  }

  .nav-menu.active .nav-link {
    padding: 0;
    border-bottom: none;
  }
}
</style>
`;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initTheme();
});

// Language toggle
langBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    setLanguage(lang);
  });
});

// Theme toggle
if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

// Smooth scrolling for navigation links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 70;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Close mobile menu if open
      if (navMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    }
  });
});

// Mobile menu toggle
if (navToggle) {
  navToggle.addEventListener('click', toggleMobileMenu);
}

// Scroll indicator
document.addEventListener('scroll', updateScrollIndicator);

// Initialize scroll indicator on load
updateScrollIndicator();

// Particle animation
if (typeof initParticles === 'function') {
  initParticles();
}

document.head.insertAdjacentHTML('beforeend', additionalStyles);
