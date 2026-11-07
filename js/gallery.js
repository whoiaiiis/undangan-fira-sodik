/**
 * gallery.js — Masonry Gallery & Lightbox
 * Wedding Invitation — Fira & Sodik
 */

(function () {
  'use strict';

  // ── GALLERY DATA ───────────────────────────────────────────
  // Using the images we have
  const galleryData = [
    { src: 'assets/images/cover-bg.jpg', caption: 'Di bawah naungan bunga' },
    { src: 'assets/images/hero-couple.jpg', caption: 'Langkah pertama' },
    { src: 'assets/images/gallery-1.jpg', caption: 'Tawa dan canda' },
    { src: 'assets/images/gallery-2.jpg', caption: 'Tatapan penuh arti' },
    { src: 'assets/images/fira.jpg', caption: 'Mempelai Wanita' },
    { src: 'assets/images/sodik.jpg', caption: 'Mempelai Pria' }
  ];
  // ───────────────────────────────────────────────────────────

  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const btnClose = document.getElementById('lightbox-close');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');

  if (!lightbox) return;

  let currentIndex = 0;

  /** Open lightbox */
  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
  }

  /** Close lightbox */
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  /** Update lightbox content */
  function updateLightbox() {
    const data = galleryData[currentIndex];
    if (data) {
      lbImg.src = data.src;
      lbImg.alt = data.caption;
      lbCaption.textContent = data.caption;
    }
  }

  /** Next image */
  function nextImage(e) {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex + 1) % galleryData.length;
    updateLightbox();
  }

  /** Previous image */
  function prevImage(e) {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
    updateLightbox();
  }

  // Attach click to grid items
  items.forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      if (!isNaN(idx)) openLightbox(idx);
    });
  });

  // Attach controls
  if (btnClose) btnClose.addEventListener('click', closeLightbox);
  if (btnNext) btnNext.addEventListener('click', nextImage);
  if (btnPrev) btnPrev.addEventListener('click', prevImage);

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

})();
