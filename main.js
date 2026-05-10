import { redirectToSpotify, exchangeCode, isLoggedIn, logout } from './auth.js';
import { getMe, getRecommendations, getMoodGenres, createPlaylist } from './spotify.js';

const SPOTIFY_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`;

const ICON = {
  happy:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  energetic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  chill:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.5 2 5 2 2.5-2 5-2 2.4.5 3 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.4.5 3 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.4.5 3 1"/></svg>`,
  sad:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8" y2="21"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="16" y1="16" x2="16" y2="21"/></svg>`,
  romantic:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
};

const MOODS = [
  { id: 'happy',     name: 'Happy',     vibe: 'upbeat & bright' },
  { id: 'energetic', name: 'Energetic', vibe: 'high tempo & hype' },
  { id: 'chill',     name: 'Chill',     vibe: 'calm & mellow' },
  { id: 'sad',       name: 'Sad',       vibe: 'slow & reflective' },
  { id: 'romantic',  name: 'Romantic',  vibe: 'warm & tender' },
];

const LANGUAGE_GROUPS = [
  {
    label: 'Indian',
    languages: [
      { id: 'hindi',     label: 'Hindi',     flag: '🇮🇳' },
      { id: 'tamil',     label: 'Tamil',     flag: '🇮🇳' },
      { id: 'telugu',    label: 'Telugu',    flag: '🇮🇳' },
      { id: 'kannada',   label: 'Kannada',   flag: '🇮🇳' },
      { id: 'malayalam', label: 'Malayalam', flag: '🇮🇳' },
      { id: 'bengali',   label: 'Bengali',   flag: '🇮🇳' },
      { id: 'punjabi',   label: 'Punjabi',   flag: '🇮🇳' },
      { id: 'marathi',   label: 'Marathi',   flag: '🇮🇳' },
    ],
  },
  {
    label: 'International',
    languages: [
      { id: 'english',    label: 'English',    flag: '🇺🇸' },
      { id: 'spanish',    label: 'Spanish',    flag: '🇪🇸' },
      { id: 'korean',     label: 'Korean',     flag: '🇰🇷' },
      { id: 'japanese',   label: 'Japanese',   flag: '🇯🇵' },
      { id: 'french',     label: 'French',     flag: '🇫🇷' },
      { id: 'portuguese', label: 'Portuguese', flag: '🇧🇷' },
      { id: 'arabic',     label: 'Arabic',     flag: '🇸🇦' },
      { id: 'italian',    label: 'Italian',    flag: '🇮🇹' },
    ],
  },
];

// Flat list for lookups
const LANGUAGES = LANGUAGE_GROUPS.flatMap(g => g.languages);

const GENRE_GROUPS = [
  {
    label: 'Indian',
    genres: [
      { id: 'bollywood',   label: 'Bollywood' },
      { id: 'bhangra',     label: 'Bhangra' },
      { id: 'sufi',        label: 'Sufi' },
      { id: 'desi pop',    label: 'Desi Pop' },
      { id: 'carnatic',    label: 'Carnatic' },
      { id: 'devotional',  label: 'Devotional' },
    ],
  },
  {
    label: 'Pop & Dance',
    genres: [
      { id: 'pop',         label: 'Pop' },
      { id: 'dance',       label: 'Dance' },
      { id: 'indie pop',   label: 'Indie Pop' },
      { id: 'kpop',        label: 'K-Pop' },
      { id: 'jpop',        label: 'J-Pop' },
      { id: 'latin pop',   label: 'Latin Pop' },
    ],
  },
  {
    label: 'Hip Hop & R&B',
    genres: [
      { id: 'hip hop',     label: 'Hip Hop' },
      { id: 'rnb',         label: 'R&B' },
      { id: 'trap',        label: 'Trap' },
      { id: 'soul',        label: 'Soul' },
      { id: 'afrobeats',   label: 'Afrobeats' },
      { id: 'reggaeton',   label: 'Reggaeton' },
    ],
  },
  {
    label: 'Rock & Alternative',
    genres: [
      { id: 'rock',        label: 'Rock' },
      { id: 'indie',       label: 'Indie' },
      { id: 'alternative', label: 'Alternative' },
      { id: 'metal',       label: 'Metal' },
      { id: 'punk',        label: 'Punk' },
    ],
  },
  {
    label: 'Electronic',
    genres: [
      { id: 'electronic',  label: 'Electronic' },
      { id: 'edm',         label: 'EDM' },
      { id: 'house',       label: 'House' },
      { id: 'lofi',        label: 'Lo-Fi' },
      { id: 'ambient',     label: 'Ambient' },
    ],
  },
  {
    label: 'Acoustic & More',
    genres: [
      { id: 'acoustic',    label: 'Acoustic' },
      { id: 'jazz',        label: 'Jazz' },
      { id: 'classical',   label: 'Classical' },
      { id: 'folk',        label: 'Folk' },
      { id: 'country',     label: 'Country' },
      { id: 'blues',       label: 'Blues' },
    ],
  },
];

const GENRES = GENRE_GROUPS.flatMap(g => g.genres);

let state = {
  user: null,
  selectedMood: null,
  selectedLanguages: [],
  selectedGenres: [],
  playlistName: '',
  tracks: [],
  currentAudio: null,
  playingId: null,
};

function ms2min(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function showToast(msg, isError = false) {
  const t = document.createElement('div');
  t.className = 'toast' + (isError ? ' error' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

function buildLangLabel() {
  if (state.selectedLanguages.length === 0) return null;
  return state.selectedLanguages
    .map(id => {
      const l = LANGUAGES.find(l => l.id === id);
      return `${l.flag} ${l.label}`;
    })
    .join(', ');
}

function buildGenreLabel() {
  if (state.selectedGenres.length === 0) return null;
  return state.selectedGenres
    .map(id => GENRES.find(g => g.id === id).label)
    .join(', ');
}

function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="login-screen">
      <div class="logo">Wave<span>length</span></div>
      <p class="tagline">tune in to your frequency.</p>
      <button class="btn-spotify" id="btn-login">
        ${SPOTIFY_ICON}
        Connect with Spotify
      </button>
    </div>
  `;
  document.getElementById('btn-login').addEventListener('click', redirectToSpotify);
}

function renderApp() {
  const label = buildLangLabel();
  const genreLabel = buildGenreLabel();

  document.getElementById('app').innerHTML = `
    <div class="app-layout">
      <header class="app-header">
        <div class="app-logo">Wave<span>length</span></div>
        <div class="user-info">
          ${state.user?.images?.[0]?.url
            ? `<img class="user-avatar" src="${state.user.images[0].url}" alt="${state.user.display_name}">`
            : ''}
          <span class="user-name">${state.user?.display_name || ''}</span>
          <button class="btn-logout" id="btn-logout">logout</button>
        </div>
      </header>

      <p class="section-label">How are you feeling?</p>
      <div class="mood-grid">
        ${MOODS.map(m => `
          <div class="mood-card ${state.selectedMood === m.id ? 'active' : ''}" data-mood="${m.id}">
            <div class="mood-icon">${ICON[m.id]}</div>
            <span class="mood-name">${m.name}</span>
            <span class="mood-vibe">${m.vibe}</span>
          </div>
        `).join('')}
      </div>

      <p class="section-label">Languages</p>
      <div class="lang-section">
        <details class="lang-dropdown" id="lang-dropdown">
          <summary class="lang-trigger">
            <span class="lang-trigger-text${label ? '' : ' placeholder'}">${label || 'All languages'}</span>
            <svg class="lang-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div class="lang-panel">
            ${LANGUAGE_GROUPS.map(group => `
              <div class="lang-group-label">${group.label}</div>
              ${group.languages.map(l => `
                <label class="lang-option">
                  <input type="checkbox" class="lang-checkbox" value="${l.id}" ${state.selectedLanguages.includes(l.id) ? 'checked' : ''}>
                  <span>${l.flag} ${l.label}</span>
                </label>
              `).join('')}
            `).join('')}
          </div>
        </details>
      </div>

      <p class="section-label">Genres</p>
      <div class="lang-section">
        <details class="lang-dropdown" id="genre-dropdown">
          <summary class="lang-trigger">
            <span class="lang-trigger-text${genreLabel ? '' : ' placeholder'}">${genreLabel || 'Mood-based (auto)'}</span>
            <svg class="lang-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div class="lang-panel">
            ${GENRE_GROUPS.map(group => `
              <div class="lang-group-label">${group.label}</div>
              ${group.genres.map(g => `
                <label class="lang-option">
                  <input type="checkbox" class="genre-checkbox" value="${g.id}" ${state.selectedGenres.includes(g.id) ? 'checked' : ''}>
                  <span>${g.label}</span>
                </label>
              `).join('')}
            `).join('')}
          </div>
        </details>
      </div>

      <button class="btn-generate ${state.selectedMood ? 'ready' : ''}" id="btn-generate">
        ${state.selectedMood
          ? `Generate ${MOODS.find(m => m.id === state.selectedMood).name} playlist`
          : 'Select a mood first'}
      </button>

      <div id="tracks-container"></div>
    </div>
  `;

  document.getElementById('btn-logout').addEventListener('click', logout);

  document.querySelectorAll('.mood-card').forEach(card => {
    card.addEventListener('click', () => {
      state.selectedMood = card.dataset.mood;
      state.tracks = [];
      state.playlistName = '';
      stopAudio();
      renderApp();
    });
  });

  document.querySelectorAll('.lang-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (!state.selectedLanguages.includes(cb.value)) {
          state.selectedLanguages = [...state.selectedLanguages, cb.value];
        }
      } else {
        state.selectedLanguages = state.selectedLanguages.filter(l => l !== cb.value);
      }
      const triggerText = document.querySelector('.lang-trigger-text');
      if (triggerText) {
        const lbl = buildLangLabel();
        triggerText.textContent = lbl || 'All languages';
        triggerText.classList.toggle('placeholder', !lbl);
      }
    });
  });

  const genBtn = document.getElementById('btn-generate');
  if (state.selectedMood) {
    genBtn.addEventListener('click', generatePlaylist);
  }

  document.querySelectorAll('.genre-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (!state.selectedGenres.includes(cb.value)) {
          state.selectedGenres = [...state.selectedGenres, cb.value];
        }
      } else {
        state.selectedGenres = state.selectedGenres.filter(g => g !== cb.value);
      }
      const triggerText = document.querySelector('#genre-dropdown .lang-trigger-text');
      if (triggerText) {
        const lbl = buildGenreLabel();
        triggerText.textContent = lbl || 'Mood-based (auto)';
        triggerText.classList.toggle('placeholder', !lbl);
      }
    });
  });

  // Close both dropdowns when clicking outside
  const langDropdown = document.getElementById('lang-dropdown');
  const genreDropdown = document.getElementById('genre-dropdown');
  document.addEventListener('click', function closeDropdowns(e) {
    if (langDropdown && !langDropdown.contains(e.target)) langDropdown.removeAttribute('open');
    if (genreDropdown && !genreDropdown.contains(e.target)) genreDropdown.removeAttribute('open');
  });

  if (state.tracks.length > 0) {
    renderTracks();
  }
}

function renderTracks() {
  const container = document.getElementById('tracks-container');
  const mood = MOODS.find(m => m.id === state.selectedMood);
  const defaultName = `Wavelength — ${mood.name} Vibes`;

  container.innerHTML = `
    <div class="tracks-section">
      <div class="tracks-header">
        <p class="section-label">${mood.name} playlist</p>
        <span class="track-count">${state.tracks.length} tracks</span>
      </div>
      <div class="track-list">
        ${state.tracks.map((t, i) => `
          <div class="track" style="animation-delay: ${i * 30}ms">
            <span class="track-num">${i + 1}</span>
            ${t.album?.images?.[0]?.url
              ? `<img class="track-art" src="${t.album.images[0].url}" alt="${t.album.name}">`
              : `<div class="track-art-placeholder">&#9835;</div>`}
            <div class="track-info">
              <div class="track-name">${t.name}</div>
              <div class="track-artist">${t.artists.map(a => a.name).join(', ')}</div>
            </div>
            <span class="track-duration">${ms2min(t.duration_ms)}</span>
            ${t.preview_url ? `
              <button class="track-preview ${state.playingId === t.id ? 'playing' : ''}" data-id="${t.id}" data-url="${t.preview_url}" title="Preview">
                ${state.playingId === t.id
                  ? `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
                  : `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`}
              </button>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="playlist-name-section">
        <p class="section-label">Playlist name</p>
        <input
          class="playlist-name-input"
          id="playlist-name"
          type="text"
          value="${state.playlistName || defaultName}"
          placeholder="Name your playlist..."
        >
      </div>

      <button class="btn-save" id="btn-save">
        ${SPOTIFY_ICON}
        Save to Spotify
      </button>
      <button class="btn-regenerate" id="btn-regen">Regenerate playlist ↺</button>
    </div>
  `;

  document.getElementById('btn-save').addEventListener('click', savePlaylist);
  document.getElementById('btn-regen').addEventListener('click', generatePlaylist);

  document.getElementById('playlist-name').addEventListener('input', e => {
    state.playlistName = e.target.value;
  });

  document.querySelectorAll('.track-preview').forEach(btn => {
    btn.addEventListener('click', () => togglePreview(btn.dataset.id, btn.dataset.url));
  });
}

async function generatePlaylist() {
  const genBtn = document.getElementById('btn-generate');
  genBtn.className = 'btn-generate loading';
  genBtn.textContent = 'Finding tracks…';

  stopAudio();
  state.tracks = [];
  state.playlistName = '';

  try {
    const genres = state.selectedGenres.length > 0
      ? state.selectedGenres
      : getMoodGenres(state.selectedMood);
    const data = await getRecommendations(state.selectedMood, genres, state.selectedLanguages);
    state.tracks = data.tracks;
    const mood = MOODS.find(m => m.id === state.selectedMood);
    state.playlistName = `Wavelength — ${mood.name} Vibes`;
    renderApp();
    renderTracks();
    document.getElementById('tracks-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    showToast(e.message || 'Could not load tracks', true);
    renderApp();
  }
}

async function savePlaylist() {
  const nameInput = document.getElementById('playlist-name');
  const customName = nameInput?.value.trim() || state.playlistName;

  const btn = document.getElementById('btn-save');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    const playlist = await createPlaylist(state.user.id, state.selectedMood, state.tracks, customName);
    showToast(`“${playlist.name}” saved to Spotify!`);
    btn.textContent = '✓ Saved to Spotify';
  } catch (e) {
    showToast(e.message || 'Could not save playlist', true);
    btn.disabled = false;
    btn.innerHTML = `${SPOTIFY_ICON} Save to Spotify`;
  }
}

function togglePreview(id, url) {
  if (state.playingId === id) {
    stopAudio();
    state.playingId = null;
  } else {
    stopAudio();
    state.currentAudio = new Audio(url);
    state.currentAudio.volume = 0.6;
    state.currentAudio.play();
    state.currentAudio.addEventListener('ended', () => {
      state.playingId = null;
      renderTracks();
    });
    state.playingId = id;
  }
  renderTracks();
}

function stopAudio() {
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio = null;
  }
  state.playingId = null;
}

async function init() {
  const url = new URL(window.location.href);

  if (url.searchParams.has('code')) {
    const code = url.searchParams.get('code');
    window.history.replaceState({}, '', '/');
    try {
      await exchangeCode(code);
    } catch (e) {
      showToast('Login failed. Please try again.', true);
      renderLogin();
      return;
    }
  }

  if (!isLoggedIn()) {
    renderLogin();
    return;
  }

  try {
    state.user = await getMe();
    renderApp();
  } catch (e) {
    renderLogin();
  }
}

init();
