/**
 * sheets-api.js — Google Sheets / Apps Script Integration
 * Wedding Invitation — Fira & Sodik
 *
 * Cara setup:
 * 1. Buka https://script.google.com dan buat project baru
 * 2. Copy-paste isi file gas-backend.gs ke editor Apps Script
 * 3. Deploy sebagai Web App (Execute as: Me, Who has access: Anyone)
 * 4. Copy URL Web App yang diberikan
 * 5. Tempel URL tersebut ke variabel SHEETS_API_URL di bawah ini
 */

// ─────────────────────────────────────────────────────────────────────────────
// PASTE URL WEB APP GOOGLE APPS SCRIPT ANDA DI SINI:
const SHEETS_API_URL = '';
// Contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
// ─────────────────────────────────────────────────────────────────────────────

const SheetsAPI = (() => {
  'use strict';

  const isConfigured = () =>
    typeof SHEETS_API_URL === 'string' &&
    SHEETS_API_URL.trim() !== '' &&
    SHEETS_API_URL.startsWith('https://script.google.com');

  /**
   * Kirim data RSVP ke Google Sheets via Apps Script
   * @param {Object} data - { name, status, guests, message }
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async function submitRsvp(data) {
    if (!isConfigured()) {
      return { ok: false, error: 'SHEETS_API_URL belum dikonfigurasi' };
    }
    try {
      // Apps Script tidak mendukung CORS dengan method POST body JSON,
      // jadi kita encode sebagai URL params via fetch no-cors, 
      // lalu gunakan Google Form / URL params trick
      const params = new URLSearchParams({
        action: 'submit',
        name: data.name || '',
        status: data.status || '',
        guests: data.guests || 1,
        message: data.message || '',
        timestamp: new Date().toISOString()
      });

      const res = await fetch(`${SHEETS_API_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors' // Apps Script tidak support CORS penuh
      });

      // no-cors → response.type === 'opaque', tidak bisa baca body
      // Kita anggap berhasil jika tidak throw error
      return { ok: true };
    } catch (err) {
      console.error('[SheetsAPI] Submit error:', err);
      return { ok: false, error: err.message };
    }
  }

  /**
   * Ambil semua ucapan dari Google Sheets
   * @returns {Promise<Array>} array of { name, status, guests, message, timestamp }
   */
  async function fetchWishes() {
    if (!isConfigured()) {
      return { ok: false, data: [], error: 'SHEETS_API_URL belum dikonfigurasi' };
    }
    try {
      const res = await fetch(`${SHEETS_API_URL}?action=get`, {
        method: 'GET',
        mode: 'cors'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { ok: true, data: json.data || [] };
    } catch (err) {
      console.error('[SheetsAPI] Fetch error:', err);
      return { ok: false, data: [], error: err.message };
    }
  }

  return { isConfigured, submitRsvp, fetchWishes };
})();

window.SheetsAPI = SheetsAPI;
