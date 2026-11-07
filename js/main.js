/**
 * main.js — Main App Logic, Audio, Navigation & Utilities
 * Wedding Invitation — Fira & Sodik
 */

(function () {
  'use strict';

  // ── ELEMENTS ───────────────────────────────────────────────
  const loadingScreen = document.getElementById('loading-screen');
  const coverSection  = document.getElementById('cover');
  const mainContent   = document.getElementById('main-content');
  const btnOpen       = document.getElementById('open-invitation-btn');
  const guestNameEl   = document.getElementById('guest-name');
  
  const bgMusic       = document.getElementById('bg-music');
  const musicBtn      = document.getElementById('music-btn');
  const musicIcon     = document.getElementById('music-icon');
  
  const backToTopBtn  = document.getElementById('back-to-top');
  const sectionNav    = document.getElementById('section-nav');
  const navDots       = document.querySelectorAll('.nav-dot');
  const toastContainer= document.getElementById('toast-container');

  // ── INIT URL PARAMS ────────────────────────────────────────
  function initURLParams() {
    if (!guestNameEl) return;
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to') || urlParams.get('nama');
    
    if (guestName) {
      // Decode and escape to prevent XSS
      const name = decodeURIComponent(guestName).replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
      );
      guestNameEl.innerHTML = name;
    }
  }

  // ── OPEN INVITATION ────────────────────────────────────────
  function openInvitation() {
    if (!coverSection || !mainContent) return;

    // Remove cover
    coverSection.classList.add('closed');
    coverSection.classList.remove('open');
    
    // Show main content
    mainContent.classList.remove('hidden');
    mainContent.classList.add('visible');
    
    // Enable scroll
    document.body.classList.remove('no-scroll');

    // Start music
    playMusic();
  }

  // ── AUDIO CONTROL ──────────────────────────────────────────
  let isMusicPlaying = false;

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.5; // Start a bit softer
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isMusicPlaying = true;
        updateMusicBtn();
      }).catch(err => {
        console.warn('Audio auto-play blocked by browser:', err);
        isMusicPlaying = false;
        updateMusicBtn();
      });
    }
  }

  function toggleMusic() {
    if (!bgMusic) return;
    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
    } else {
      bgMusic.play();
      isMusicPlaying = true;
    }
    updateMusicBtn();
  }

  function updateMusicBtn() {
    if (!musicBtn || !musicIcon) return;
    if (isMusicPlaying) {
      musicBtn.classList.add('playing');
      musicBtn.classList.remove('paused');
      musicIcon.classList.remove('fa-play');
      musicIcon.classList.add('fa-music');
    } else {
      musicBtn.classList.remove('playing');
      musicBtn.classList.add('paused');
      musicIcon.classList.remove('fa-music');
      musicIcon.classList.add('fa-play');
    }
  }


  // ── NAVIGATION & SCROLL ────────────────────────────────────
  function handleScroll() {
    const scrollY = window.scrollY;

    // Back to Top Button visibility
    if (backToTopBtn) {
      if (scrollY > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Update Navigation Dots
    updateActiveDot(scrollY);
  }

  function updateActiveDot(scrollY) {
    if (!navDots.length) return;
    
    const sections = Array.from(navDots).map(dot => {
      const targetId = dot.getAttribute('data-target');
      return document.getElementById(targetId);
    }).filter(Boolean);

    let currentSection = sections[0];
    
    for (const section of sections) {
      // Offset by half viewport to trigger earlier
      if (section.offsetTop - (window.innerHeight / 2) <= scrollY) {
        currentSection = section;
      }
    }

    if (currentSection) {
      navDots.forEach(dot => {
        if (dot.getAttribute('data-target') === currentSection.id) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }


  // ── TOAST NOTIFICATIONS ────────────────────────────────────
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Remove after 3.5s
    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => {
        if (toast.parentNode === toastContainer) {
          toastContainer.removeChild(toast);
        }
      });
    }, 3500);
  }

  // Expose to window for inline onclick handlers
  window.showToast = showToast;

  // ── CLIPBOARD UTILS ────────────────────────────────────────
  window.copyRekening = function(elementId, bankName) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    navigator.clipboard.writeText(el.innerText).then(() => {
      showToast(`Nomor Rekening ${bankName} berhasil disalin!`, 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showToast('Gagal menyalin nomor rekening.', 'error');
    });
  };

  window.copyAddress = function() {
    const text = "Simpang Pulau Panggung Enim Kampung 4, Ds. Pulau Panggung Enim";
    navigator.clipboard.writeText(text).then(() => {
      showToast('Alamat berhasil disalin!', 'success');
    }).catch(err => {
      showToast('Gagal menyalin alamat.', 'error');
    });
  };

  window.addToCalendar = function(type) {
    // This is a placeholder for Add to Calendar functionality
    // Typically generates an .ics file or Google Calendar link
    showToast(`Membuka kalender untuk ${type === 'akad' ? 'Akad Nikah' : 'Resepsi'}...`, 'info');
    
    // Example GCal link generation
    let text = "Pernikahan Fira & Sodik";
    let dates = "20261031T030000Z/20261031T050000Z"; // UTC format
    let details = "Kehadiran Anda adalah anugerah terindah.";
    let location = type === 'akad' ? "Simpang Pulau Panggung Enim Kampung 4" : "Simpang Pulau Panggung Enim Kampung 4";
    
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    
    window.open(gcalUrl, '_blank');
  };


  // ── APP INITIALIZATION ─────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    
    // Lock scroll initially
    document.body.classList.add('no-scroll');
    
    initURLParams();

    // Event Listeners
    if (btnOpen) btnOpen.addEventListener('click', openInvitation);
    if (musicBtn) musicBtn.addEventListener('click', toggleMusic);
    
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Navigation Dot clicks
    navDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetId = dot.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Hide Loading Screen after minimal delay
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        // Ensure cover is visible and trigger its initial animations
        if (coverSection) {
          coverSection.classList.add('open');
        }
      }
    }, 2200); // Wait 2.2s for the loading animation to be seen
    
  });

})();
