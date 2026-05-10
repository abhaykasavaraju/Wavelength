const CLIENT_ID = "192788dbf3904e6b90c379bcb489852c";
const REDIRECT_URI = `${window.location.origin}/callback`;
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "playlist-modify-public",
  "playlist-modify-private",
];

function generateRandomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => chars[b % chars.length])
    .join("");
}

async function generateCodeChallenge(verifier) {
  const encoded = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function redirectToSpotify() {
  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem("pkce_verifier", verifier);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: "S256",
    code_challenge: challenge,
    show_dialog: "true",
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCode(code) {
  const verifier = localStorage.getItem("pkce_verifier");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("token_expiry", Date.now() + data.expires_in * 1000);
    localStorage.removeItem("pkce_verifier");
  }
  return data;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("token_expiry", Date.now() + data.expires_in * 1000);
  }
  return data.access_token;
}

export async function getToken() {
  const expiry = localStorage.getItem("token_expiry");
  if (expiry && Date.now() > parseInt(expiry) - 60000) {
    return await refreshAccessToken();
  }
  return localStorage.getItem("access_token");
}

export function logout() {
  localStorage.clear();
  window.location.href = "/";
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}
