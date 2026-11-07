/**
 * gas-backend.gs — Google Apps Script Backend
 * Wedding Invitation — Fira & Sodik
 *
 * CARA DEPLOY:
 * 1. Buka https://script.google.com → New Project
 * 2. Hapus isi editor, paste seluruh kode ini
 * 3. Klik menu "Deploy" → "New Deployment"
 * 4. Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Klik Deploy → Authorize → Copy URL
 * 6. Paste URL ke js/sheets-api.js di variabel SHEETS_API_URL
 *
 * Data tersimpan otomatis di Google Spreadsheet yang ter-link.
 */

// ─── Konfigurasi ────────────────────────────────────────────────────────────
// Spreadsheet akan dibuat otomatis jika SPREADSHEET_ID dikosongkan,
// atau isi dengan ID spreadsheet yang sudah ada.
const SPREADSHEET_ID = ''; // Kosongkan agar dibuat otomatis
const SHEET_NAME = 'Ucapan Tamu';
// ────────────────────────────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action || 'get';

  try {
    if (action === 'submit') {
      return handleSubmit(e.parameter);
    } else if (action === 'get') {
      return handleGet();
    } else {
      return jsonResponse({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ─── Handle Submit ───────────────────────────────────────────────────────────
function handleSubmit(params) {
  const sheet = getSheet();

  const name      = (params.name      || '').trim();
  const status    = (params.status    || '').trim();
  const guests    = parseInt(params.guests, 10) || 1;
  const message   = (params.message   || '').trim();
  const timestamp = params.timestamp  || new Date().toISOString();

  if (!name) {
    return jsonResponse({ ok: false, error: 'Nama tidak boleh kosong' });
  }

  sheet.appendRow([timestamp, name, status, guests, message]);

  return jsonResponse({ ok: true, message: 'Berhasil disimpan' });
}

// ─── Handle Get ──────────────────────────────────────────────────────────────
function handleGet() {
  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();

  // Baris pertama adalah header, skip
  const data = rows.slice(1)
    .filter(row => row[4] && String(row[4]).trim() !== '') // hanya yang ada pesan
    .map(row => ({
      timestamp : row[0] ? new Date(row[0]).toISOString() : '',
      name      : row[1] || '',
      status    : row[2] || '',
      guests    : row[3] || 1,
      message   : row[4] || ''
    }))
    .reverse(); // terbaru di atas

  return jsonResponse({ ok: true, data });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getSheet() {
  let ss;
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    // Cari spreadsheet yang sudah ada dengan nama ini, atau buat baru
    const files = DriveApp.getFilesByName('Wedding RSVP — Fira & Sodik');
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create('Wedding RSVP — Fira & Sodik');
    }
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Buat header
    sheet.appendRow(['Timestamp', 'Nama', 'Status Hadir', 'Jumlah Tamu', 'Ucapan & Doa']);
    // Format header
    const headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#8B1A2B');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
