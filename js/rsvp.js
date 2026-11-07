/**
 * rsvp.js - RSVP Form Handling & Wishes List
 * Wedding Invitation - Fira & Sodik
 *
 * Prioritas backend:
 *   1. Google Sheets (via SheetsAPI) — lintas device, gratis
 *   2. Firebase Firestore             — lintas device, realtime
 *   3. localStorage                   — fallback lokal (1 browser saja)
 */

(function () {
  'use strict';

  const form       = document.getElementById('rsvp-form');
  const btnSubmit  = document.getElementById('rsvp-submit-btn');
  const inputName  = document.getElementById('rsvp-name');
  const inputGuests= document.getElementById('rsvp-guests');
  const inputMsg   = document.getElementById('rsvp-message');

  const btnMinus   = document.getElementById('guests-minus');
  const btnPlus    = document.getElementById('guests-plus');
  const errName    = document.getElementById('name-error');
  const errStatus  = document.getElementById('status-error');

  const wishesList   = document.getElementById('wishes-list');
  const wishesLoading= document.getElementById('wishes-loading');
  const wishesEmpty  = document.getElementById('wishes-empty');
  const wishesSection= document.getElementById('wishes');

  let wishesUnsubscribe = null;
  let pollingTimer      = null;

  // ─── Deteksi backend yang aktif ──────────────────────────────────────────
  const useSheetsAPI = () => window.SheetsAPI && window.SheetsAPI.isConfigured();
  const useFirebase  = () => window.firebaseReady && window.db;

  // ─── Guests Counter ───────────────────────────────────────────────────────
  if (btnMinus && btnPlus && inputGuests) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(inputGuests.value, 10) || 1;
      if (val > 1) inputGuests.value = val - 1;
    });
    btnPlus.addEventListener('click', () => {
      let val = parseInt(inputGuests.value, 10) || 1;
      if (val < 10) inputGuests.value = val + 1;
    });
  }

  // ─── Validasi Form ────────────────────────────────────────────────────────
  function validateForm() {
    let isValid = true;
    if (!inputName.value.trim()) {
      inputName.classList.add('error');
      errName.textContent = 'Nama wajib diisi';
      isValid = false;
    } else {
      inputName.classList.remove('error');
      errName.textContent = '';
    }
    const status = document.querySelector('input[name="status"]:checked');
    if (!status) {
      errStatus.textContent = 'Pilih konfirmasi kehadiran';
      isValid = false;
    } else {
      errStatus.textContent = '';
    }
    return isValid;
  }

  // ─── Tampilkan kartu ucapan baru (langsung, tanpa reload) ────────────────
  function prependWishCard(data) {
    if (!wishesList || !data.message) return;
    if (wishesEmpty) wishesEmpty.classList.add('hidden');
    const card = createWishCard(data);
    card.classList.add('wish-card-new');
    wishesList.prepend(card);
    setTimeout(() => {
      if (wishesSection) {
        wishesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }

  // ─── Submit Form ──────────────────────────────────────────────────────────
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const statusEl  = document.querySelector('input[name="status"]:checked');
      const wishData  = {
        name     : inputName.value.trim(),
        status   : statusEl ? statusEl.value : '',
        guests   : parseInt(inputGuests.value, 10) || 1,
        message  : inputMsg.value.trim(),
        timestamp: new Date().toISOString()
      };

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

      // ── 1. Google Sheets API ──────────────────────────────────────────────
      if (useSheetsAPI()) {
        const result = await window.SheetsAPI.submitRsvp(wishData);
        if (result.ok) {
          // Simpan juga ke localStorage sebagai cache lokal
          saveToLocal(wishData);
          form.reset();
          inputGuests.value = '1';
          // Langsung tampilkan kartu di UI
          prependWishCard({
            ...wishData,
            timestamp: { toDate: () => new Date(wishData.timestamp) }
          });
          if (typeof showToast === 'function') {
            showToast('Terima kasih! Ucapan Anda berhasil dikirim. 💕', 'success');
          }
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i><span>Kirim Konfirmasi</span>';
          return;
        }
        // Jika Sheets API gagal, lanjut ke fallback berikutnya
        console.warn('[RSVP] Sheets API gagal, mencoba Firebase...');
      }

      // ── 2. Firebase Firestore ─────────────────────────────────────────────
      if (useFirebase()) {
        try {
          await window.db.collection('responses').add({
            ...wishData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
          saveToLocal(wishData);
          form.reset();
          inputGuests.value = '1';
          prependWishCard({
            ...wishData,
            timestamp: { toDate: () => new Date(wishData.timestamp) }
          });
          if (typeof showToast === 'function') {
            showToast('Terima kasih! Ucapan Anda berhasil dikirim. 💕', 'success');
          }
        } catch (err) {
          console.error('[RSVP] Firebase error:', err);
          // Tetap simpan lokal agar tidak hilang
          saveToLocal(wishData);
          form.reset();
          inputGuests.value = '1';
          prependWishCard({
            ...wishData,
            timestamp: { toDate: () => new Date(wishData.timestamp) }
          });
          if (typeof showToast === 'function') {
            showToast('Terima kasih! Ucapan tersimpan, namun koneksi bermasalah.', 'success');
          }
        }
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i><span>Kirim Konfirmasi</span>';
        return;
      }

      // ── 3. Fallback: localStorage ─────────────────────────────────────────
      saveToLocal(wishData);
      form.reset();
      inputGuests.value = '1';
      prependWishCard({
        ...wishData,
        timestamp: { toDate: () => new Date(wishData.timestamp) }
      });
      if (typeof showToast === 'function') {
        showToast('Terima kasih! Ucapan Anda berhasil dikirim. 💕', 'success');
      }
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i><span>Kirim Konfirmasi</span>';
    });
  }

  // ─── Simpan ke localStorage ───────────────────────────────────────────────
  function saveToLocal(data) {
    try {
      const stored = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
      // Hindari duplikat berdasarkan nama + timestamp
      const isDuplicate = stored.some(
        w => w.name === data.name && w.timestamp === data.timestamp
      );
      if (!isDuplicate) {
        stored.unshift(data);
        // Simpan maksimal 200 ucapan lokal
        localStorage.setItem('wedding_wishes', JSON.stringify(stored.slice(0, 200)));
      }
    } catch (_) {}
  }

  // ─── Ambil & Tampilkan Semua Ucapan ──────────────────────────────────────
  async function fetchWishes() {
    if (!wishesList || !wishesLoading) return;

    setLoadingState(true);

    // ── 1. Google Sheets API ──────────────────────────────────────────────
    if (useSheetsAPI()) {
      const result = await window.SheetsAPI.fetchWishes();
      if (result.ok && result.data.length >= 0) {
        setLoadingState(false);
        renderWishes(result.data);
        // Cache ke localStorage
        result.data.forEach(d => saveToLocal(d));
        // Poll setiap 30 detik untuk ucapan baru dari tamu lain
        startPolling();
        return;
      }
      console.warn('[RSVP] Sheets fetch gagal, mencoba Firebase...');
    }

    // ── 2. Firebase Firestore (realtime) ───────────────────────────────────
    if (useFirebase()) {
      if (wishesUnsubscribe) wishesUnsubscribe();
      wishesUnsubscribe = window.db.collection('responses')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
          setLoadingState(false);
          const items = [];
          snapshot.forEach(doc => {
            const d = doc.data();
            if (d.message && d.message.trim()) items.push(d);
          });
          renderWishes(items);
        }, err => {
          console.error('[RSVP] Firebase snapshot error:', err);
          setLoadingState(false);
          // Fallback ke localStorage jika Firebase error
          renderFromLocal();
        });
      return;
    }

    // ── 3. Fallback: localStorage ─────────────────────────────────────────
    setLoadingState(false);
    renderFromLocal();
  }

  function renderFromLocal() {
    const stored = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
    const mapped = stored.map(d => ({
      ...d,
      timestamp: { toDate: () => new Date(d.timestamp) }
    }));
    renderWishes(mapped);
  }

  function renderWishes(items) {
    if (!wishesList) return;

    // Jangan re-render jika isi sama persis (optimasi)
    const currentCount = wishesList.querySelectorAll('.wish-card').length;
    if (items.length === 0) {
      wishesList.innerHTML = '';
      if (wishesEmpty) wishesEmpty.classList.remove('hidden');
      return;
    }

    // Jika ada item baru dari polling, tambahkan di atas
    if (currentCount > 0 && items.length > currentCount) {
      const newItems = items.slice(0, items.length - currentCount);
      newItems.forEach(d => {
        const normalized = normalizeTimestamp(d);
        if (normalized.message && normalized.message.trim()) {
          const card = createWishCard(normalized);
          card.classList.add('wish-card-new');
          wishesList.prepend(card);
        }
      });
      if (wishesEmpty) wishesEmpty.classList.add('hidden');
      return;
    }

    // Render ulang penuh
    wishesList.innerHTML = '';
    items.forEach(d => {
      const normalized = normalizeTimestamp(d);
      if (normalized.message && normalized.message.trim()) {
        wishesList.appendChild(createWishCard(normalized));
      }
    });
    if (wishesEmpty) wishesEmpty.classList.toggle('hidden', wishesList.childElementCount > 0);
  }

  function normalizeTimestamp(data) {
    if (data.timestamp && typeof data.timestamp.toDate === 'function') {
      return data; // sudah format Firestore
    }
    return {
      ...data,
      timestamp: { toDate: () => new Date(data.timestamp || Date.now()) }
    };
  }

  // Polling setiap 30 detik untuk update dari Sheets API
  function startPolling() {
    if (pollingTimer) clearInterval(pollingTimer);
    pollingTimer = setInterval(async () => {
      if (!useSheetsAPI()) { clearInterval(pollingTimer); return; }
      const result = await window.SheetsAPI.fetchWishes();
      if (result.ok) renderWishes(result.data);
    }, 30000);
  }

  function setLoadingState(isLoading) {
    if (!wishesLoading) return;
    if (isLoading) {
      wishesLoading.classList.remove('hidden');
      wishesLoading.innerHTML = '<div class="spinner"></div><p>Memuat ucapan...</p>';
    } else {
      wishesLoading.classList.add('hidden');
    }
  }

  // ─── Buat Kartu Ucapan ────────────────────────────────────────────────────
  function createWishCard(data) {
    const card = document.createElement('div');
    card.className = 'wish-card';

    // Inisial nama
    const nameParts = (typeof data.name === 'string' ? data.name : '')
      .split(' ').filter(p => p.length > 0);
    let initials = '';
    if (nameParts.length > 0) {
      initials += nameParts[0][0];
      if (nameParts.length > 1) initials += nameParts[1][0];
    }
    initials = initials.toUpperCase() || '?';

    // Waktu relatif
    let timeStr = '';
    if (data.timestamp && typeof data.timestamp.toDate === 'function') {
      const date    = data.timestamp.toDate();
      const now     = new Date();
      const diffMs  = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      const diffH   = Math.floor(diffMin / 60);
      const diffD   = Math.floor(diffH / 24);
      if (diffMin < 1)        timeStr = 'Baru saja';
      else if (diffMin < 60)  timeStr = `${diffMin} menit lalu`;
      else if (diffH < 24)    timeStr = `${diffH} jam lalu`;
      else if (diffD < 7)     timeStr = `${diffD} hari lalu`;
      else {
        timeStr = date.toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric'
        });
      }
    }

    const statusClass = data.status === 'hadir' ? 'hadir' : 'tidak-hadir';
    const statusLabel = data.status === 'hadir' ? 'Hadir' : 'Tidak Hadir';

    card.innerHTML = `
      <div class="wish-avatar">${initials}</div>
      <div class="wish-body">
        <div class="wish-header">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <h4 class="wish-name">${escapeHTML(data.name)}</h4>
            <span class="wish-status ${statusClass}">${statusLabel}</span>
          </div>
          <span class="wish-time">${timeStr}</span>
        </div>
        <p class="wish-message">"${escapeHTML(data.message).replace(/\n/g, '<br>')}"</p>
      </div>
    `;
    return card;
  }

  // Sanitasi HTML untuk mencegah XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
      tag => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[tag] || tag)
    );
  }

  // ─── Inisialisasi ─────────────────────────────────────────────────────────
  window.fetchWishes = fetchWishes;
  // Tunggu sedikit agar Firebase & SheetsAPI selesai inisialisasi
  setTimeout(fetchWishes, 800);

})();
