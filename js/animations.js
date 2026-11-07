/**
 * animations.js — Scroll Reveal & Visual Effects
 * Wedding Invitation — Fira & Sodik
 */

(function () {
  'use strict';

  // --- Scroll Reveal with Intersection Observer ---
  const reveals = document.querySelectorAll('.reveal');
  const timelineDots = document.querySelectorAll('.timeline-dot');
  
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, revealOptions);

  reveals.forEach(el => revealObserver.observe(el));

  // --- Timeline Dots Activation ---
  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        // Optional: remove active when scrolling past
        // entry.target.classList.remove('active'); 
      }
    });
  }, { rootMargin: '0px 0px -50% 0px', threshold: 1.0 });

  timelineDots.forEach(dot => dotObserver.observe(dot));


  // --- Floating Petals Animation ---
  const petalsContainer = document.getElementById('petals-container');
  const maxPetals = 15;
  const petalColors = [
    'rgba(255, 255, 255, 0.8)', // White
    'rgba(201, 160, 160, 0.6)', // Dusty Rose
    'rgba(245, 239, 224, 0.9)'  // Cream
  ];

  function createPetal() {
    if (!petalsContainer) return;
    
    // Only add if we're under max count and document is visible
    if (petalsContainer.childElementCount >= maxPetals || document.hidden) {
      setTimeout(createPetal, 2000);
      return;
    }

    const petal = document.createElement('div');
    petal.classList.add('petal');
    
    // Randomize properties
    const size = Math.random() * 12 + 8; // 8px - 20px
    const left = Math.random() * 100; // 0% - 100%
    const duration = Math.random() * 6 + 8; // 8s - 14s
    const delay = Math.random() * 5; // 0s - 5s
    const color = petalColors[Math.floor(Math.random() * petalColors.length)];
    
    // Apply styles
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.left = `${left}vw`;
    petal.style.animationDuration = `${duration}s, ${duration/2}s`;
    petal.style.animationDelay = `${delay}s, ${delay}s`;
    petal.style.backgroundColor = color;
    
    petalsContainer.appendChild(petal);
    
    // Remove after animation completes
    setTimeout(() => {
      if (petal.parentNode === petalsContainer) {
        petalsContainer.removeChild(petal);
      }
    }, (duration + delay) * 1000);
    
    // Schedule next
    setTimeout(createPetal, Math.random() * 2000 + 1000);
  }

  // Start creating petals after a delay to not affect initial load performance
  setTimeout(() => {
    // Only run if not on very small screens for performance
    if (window.innerWidth > 480) {
      for (let i = 0; i < 5; i++) {
        setTimeout(createPetal, i * 800);
      }
    }
  }, 4000);


  // --- Video Play Integration ---
  const btnPlay = document.getElementById('video-play-btn');
  const ytIframe = document.getElementById('yt-iframe');
  const videoThumb = document.getElementById('video-thumb');
  const videoPlayer = document.getElementById('video-player');
  const musicBtn = document.getElementById('music-btn');
  const bgMusic = document.getElementById('bg-music');

  if (btnPlay && videoThumb && videoPlayer && ytIframe) {
    btnPlay.addEventListener('click', () => {
      // Hide thumbnail, show player
      videoThumb.classList.add('hidden');
      videoPlayer.classList.remove('hidden');
      
      // Load iframe src
      if (ytIframe.dataset.src) {
        ytIframe.src = ytIframe.dataset.src;
      }

      // Pause background music if it's playing
      if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
        if (musicBtn) {
          musicBtn.classList.remove('playing');
          musicBtn.classList.add('paused');
          const icon = musicBtn.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-music');
            icon.classList.add('fa-play');
          }
        }
      }
    });
  }

})();
