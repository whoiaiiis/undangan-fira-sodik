/**
 * firebase-config.js
 * Firebase initialization for Wedding Invitation — Fira & Sodik
 *
 * HOW TO SETUP FIREBASE:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (e.g., "fira-sodik-wedding")
 * 3. Add a Web App and copy the config below
 * 4. Go to Firestore Database → Create database → Start in test mode
 * 5. Replace the firebaseConfig values below with your actual config
 *
 * FIRESTORE SECURITY RULES (paste in Firebase Console → Firestore → Rules):
 *
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /responses/{doc} {
 *         allow read: if true;
 *         allow write: if request.resource.data.name is string
 *                      && request.resource.data.name.size() > 0
 *                      && request.resource.data.name.size() < 100;
 *       }
 *     }
 *   }
 */

// ──────────────────────────────────────────────────────────────
// REPLACE THE VALUES BELOW WITH YOUR OWN FIREBASE PROJECT CONFIG
// ──────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
// ──────────────────────────────────────────────────────────────

// Initialize Firebase (using compat SDK loaded via CDN in index.html)
let db = null;
let firebaseReady = false;
const firebaseConfigured = Object.entries(firebaseConfig).every(([key, value]) =>
  typeof value === 'string' &&
  value.trim() !== '' &&
  !value.includes('YOUR_')
);

try {
  if (!firebaseConfigured) {
    console.error('[Firebase] Configuration is incomplete. Add your Firebase web app settings in js/firebase-config.js.');
  } else if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
    console.info('[Firebase] Connected to Firestore ✓');
  } else {
    console.error('[Firebase] SDK not loaded. Check the Firebase scripts in index.html.');
  }
} catch (err) {
  console.error('[Firebase] Init error:', err.message);
}

// Expose globally
window.db = db;
window.firebaseReady = firebaseReady;
