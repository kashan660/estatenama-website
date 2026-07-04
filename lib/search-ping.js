// Search-engine submission for freshly published content.
//
// Two independent, fail-safe channels — both no-op quietly if unconfigured, and
// NEVER throw into the caller (submission is best-effort, fire-and-forget):
//
//  1. Google Indexing API  -> direct push to Google. Requires a Google Cloud
//     service account (Indexing API enabled) added as an Owner of the property
//     in Search Console. Provide its JSON key via env GOOGLE_INDEXING_CREDENTIALS.
//
//  2. IndexNow             -> instant push to Bing / Yandex / Seznam (NOT Google).
//     Needs a key hosted at https://<host>/<key>.txt (served by the app). A default
//     key ships below; override with env INDEXNOW_KEY.
//
// Google's primary discovery path remains the sitemap (submitted once in Search
// Console) — this module just accelerates it.

const crypto = require('crypto');

// Public by design (IndexNow keys are meant to be world-readable).
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '92dfb8e5dcf65607ccfaf83fa99f544f';

function base64url(input) {
    return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// --- Google Indexing API -------------------------------------------------
async function getGoogleAccessToken(creds) {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claim = base64url(JSON.stringify({
        iss: creds.client_email,
        scope: 'https://www.googleapis.com/auth/indexing',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600
    }));
    const signingInput = `${header}.${claim}`;
    const signature = base64url(
        crypto.createSign('RSA-SHA256').update(signingInput).sign(creds.private_key)
    );
    const jwt = `${signingInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Google token error: ' + JSON.stringify(data));
    return data.access_token;
}

async function notifyGoogle(urls) {
    const raw = process.env.GOOGLE_INDEXING_CREDENTIALS;
    if (!raw) return { google: 'skipped (no GOOGLE_INDEXING_CREDENTIALS)' };
    let creds;
    try { creds = JSON.parse(raw); } catch (e) { return { google: 'error (invalid credentials JSON)' }; }

    const token = await getGoogleAccessToken(creds);
    const results = [];
    for (const url of urls) {
        const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, type: 'URL_UPDATED' })
        });
        results.push(`${url} -> ${res.status}`);
    }
    return { google: results };
}

// --- IndexNow (Bing / Yandex / Seznam) -----------------------------------
async function notifyIndexNow(urls, host) {
    if (!INDEXNOW_KEY || !host) return { indexnow: 'skipped (no key/host)' };
    const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
            host,
            key: INDEXNOW_KEY,
            keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
            urlList: urls
        })
    });
    return { indexnow: res.status };
}

// Fire-and-forget. Resolves immediately; logs outcomes; never rejects.
function submitUrls(urls, host) {
    const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
    if (!list.length) return;
    Promise.allSettled([notifyGoogle(list), notifyIndexNow(list, host)])
        .then((rs) => console.log('[search-ping]', JSON.stringify(rs.map((r) => r.value || String(r.reason)))))
        .catch((e) => console.error('[search-ping] error:', e.message));
}

module.exports = { submitUrls, INDEXNOW_KEY };
