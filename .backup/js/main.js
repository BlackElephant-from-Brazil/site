
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.main-nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
      const bars = menuBtn.querySelectorAll('.bar');
      if (nav.classList.contains('active')) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        const bars = menuBtn.querySelectorAll('.bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      });
    });
  }

  // Header Scroll Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
      header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
    } else {
      header.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
      header.style.boxShadow = 'none';
    }
  });

  // Contact Form Handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = {
        name: this.elements['name'].value,
        email: this.elements['email'].value,
        phone: this.elements['phone'].value || '',
        message: this.elements['message'].value
      };
      
      // Disable submit button
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      
      try {
        // Send to server
        const response = await fetch('http://localhost:3000/api/contatos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Show success alert
          showSuccessAlert();
          
          // Reset form
          this.reset();
        } else {
          // Show error
          showErrorAlert(result.message || 'Erro ao enviar mensagem');
        }
      } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        showErrorAlert('Erro ao conectar com o servidor. Tente novamente.');
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // EMERGENCY FIX: CLEAN & SIMPLE PARALLAX
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 1. HERO - SUBTLE FADE ONLY
    // We just fade the hero container slightly
    gsap.to('.hero-section', {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom 50%',
        scrub: 1
      },
      opacity: 0.1, // Don't go to 0 to prevent black flickering
      ease: 'none'
    });

    // 2. PROCESS & PORTFOLIO ANIAMTIONS DISABLED FOR STABILITY
    // We are letting CSS handle the visibility to ensure no "Black Screen" bugs
    // If we want to add them back, we must ensure start triggers are correct.
    // For now, simplicity = reliability.

    /* 
    const processTl = gsap.timeline({ ... }); 
    */
  }
});

// Function to show success alert
function showSuccessAlert() {
  // Create alert element
  const alert = document.createElement('div');
  alert.className = 'success-alert';
  alert.innerHTML = `
    <div class="alert-content">
      <div class="alert-icon">✓</div>
      <div class="alert-text">
        <strong>Tudo ok!</strong>
        <p>Em breve nossa equipe entrará em contato.</p>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(alert);
  
  // Trigger animation
  setTimeout(() => {
    alert.classList.add('show');
  }, 10);
  
  // Remove after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => {
      alert.remove();
    }, 300);
  }, 5000);
}

// Function to show error alert
function showErrorAlert(message) {
  // Create alert element
  const alert = document.createElement('div');
  alert.className = 'error-alert';
  alert.innerHTML = `
    <div class="alert-content">
      <div class="alert-icon">✕</div>
      <div class="alert-text">
        <strong>Ops!</strong>
        <p>${message}</p>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(alert);
  
  // Trigger animation
  setTimeout(() => {
    alert.classList.add('show');
  }, 10);
  
  // Remove after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => {
      alert.remove();
    }, 300);
  }, 5000);
}
