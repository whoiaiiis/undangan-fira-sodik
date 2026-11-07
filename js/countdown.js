/**
 * countdown.js — Real-time Countdown Timer
 * Wedding Invitation — Fira & Sodik
 */

(function () {
  'use strict';

  // ── CONFIG ─────────────────────────────────────────────────
  // Set the wedding date/time in WIB (UTC+7 = UTC-based string)
  const WEDDING_DATE = new Date('2026-10-31T10:00:00+07:00');
  // ───────────────────────────────────────────────────────────

  const elDays    = document.getElementById('days');
  const elHours   = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');
  const elGrid    = document.getElementById('countdown-container');
  const elDone    = document.getElementById('countdown-done');

  if (!elDays) return; // Element not found, skip

  /** Pad number to 2 digits */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Animate a number change on the countdown card */
  function animateChange(el, newVal) {
    if (!el) return;
    const current = el.textContent;
    const next = pad(newVal);
    if (current === next) return;
    el.classList.remove('flipping');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('flipping');
    el.textContent = next;
  }

  /** Calculate and display time remaining */
  function tick() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      // Wedding day has arrived!
      if (elGrid) elGrid.classList.add('hidden');
      if (elDone) elDone.classList.remove('hidden');
      clearInterval(timer);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / (3600 * 24));
    const hours   = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    animateChange(elDays,    days);
    animateChange(elHours,   hours);
    animateChange(elMinutes, minutes);
    animateChange(elSeconds, seconds);
  }

  // Initial render immediately
  tick();

  // Update every second
  const timer = setInterval(tick, 1000);

})();
