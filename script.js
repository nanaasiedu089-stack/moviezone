const ALL_GENRES = [
  'all',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller'
];

let movies = [];
const movieGrid = document.getElementById('movieGrid');
const totalMovies = document.getElementById('totalMovies');
const activeGenre = document.getElementById('activeGenre');
const watchlistCount = document.getElementById('watchlistCount');
const genreFilter = document.getElementById('genreFilter');
const sortFilter = document.getElementById('sortFilter');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const movieModal = document.getElementById('movieModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalPoster = document.getElementById('modalPoster');
const movieTitle = document.getElementById('movieTitle');
const movieDescription = document.getElementById('movieDescription');
const modalGenre = document.getElementById('modalGenre');
const modalDirector = document.getElementById('modalDirector');
const modalCast = document.getElementById('modalCast');
const modalTag = document.getElementById('modalTag');
const modalYear = document.getElementById('modalYear');
const modalRating = document.getElementById('modalRating');
const watchlistBtn = document.getElementById('watchlistBtn');
const downloadLink = document.getElementById('downloadLink');
const trailerLink = document.getElementById('trailerLink');
const jwBtn = document.getElementById('jwBtn');
const assistantToggle = document.getElementById('assistantToggle');
const assistantPanel = document.getElementById('assistantPanel');
const assistantClose = document.getElementById('assistantClose');
const assistantForm = document.getElementById('assistantForm');
const assistantInput = document.getElementById('assistantInput');
const assistantMessages = document.getElementById('assistantMessages');
const assistantActions = document.querySelectorAll('.quick-btn');

let activeMovie = null;
let currentGenre = 'all';
const watchlist = new Set(JSON.parse(localStorage.getItem('movieWatchlist') || '[]'));

const MOOD_GENRES = {
  cozy: ['Drama', 'Romance', 'Comedy'],
  thrill: ['Thriller', 'Horror', 'Crime'],
  adventure: ['Action', 'Adventure', 'Sci-Fi'],
  family: ['Animation', 'Adventure', 'Comedy'],
  classic: ['Drama', 'Mystery', 'Crime']
};

function addAssistantMessage(text, isUser = false) {
  const message = document.createElement('div');
  message.className = `assistant-message ${isUser ? 'user' : 'bot'}`;
  message.textContent = text;
  assistantMessages.appendChild(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function getRecommendation(options = {}) {
  let candidates = movies;
  if (options.genre && options.genre !== 'all') {
    candidates = candidates.filter((movie) => movie.genre.toLowerCase() === options.genre.toLowerCase());
  } else if (options.mood) {
    const matchingGenres = MOOD_GENRES[options.mood.toLowerCase()] || [];
    candidates = candidates.filter((movie) => matchingGenres.includes(movie.genre));
  }

  const top = [...candidates]
    .sort((a, b) => b.rating - a.rating || b.year - a.year)
    .slice(0, 3);

  if (top.length === 0 && options.genre) {
    return `I couldn't find any titles in "${options.genre}". Try another genre or ask for a mood-based recommendation.`;
  }

  return top.length
    ? top.map((movie) => `${movie.title} (${movie.genre}, ${movie.year})`).join('; ')
    : 'I’m still learning your taste. Try another genre or ask for a top-rated suggestion.';
}

function handleAssistantCommand(text) {
  const lowercase = text.toLowerCase();
  if (lowercase.includes('recommend') || lowercase.includes('suggest')) {
    const genreMatch = ALL_GENRES.find((genre) => genre.toLowerCase() !== 'all' && lowercase.includes(genre.toLowerCase()));
    if (genreMatch) {
      currentGenre = genreMatch;
      genreFilter.value = genreMatch;
      refreshMovies();
      return `Based on your interest in ${genreMatch}, I recommend: ${getRecommendation({genre: genreMatch})}`;
    }
    const moodMatch = Object.keys(MOOD_GENRES).find((mood) => lowercase.includes(mood));
    if (moodMatch) {
      return `For a ${moodMatch} mood, try: ${getRecommendation({mood: moodMatch})}`;
    }
    return `Here are some top picks: ${getRecommendation()}`;
  }

  if (lowercase.includes('genre') || lowercase.includes('type')) {
    return `I can help you pick a genre. Try asking "Show me Action", "I want Comedy", or "Recommend a Drama".`;
  }

  if (lowercase.includes('help')) {
    return `Use the assistant to find movies by genre, mood, or rating. For example: "Recommend a sci-fi movie", "What should I watch tonight?", or "Show top rated dramas."`;
  }

  const genreMatch = ALL_GENRES.find((genre) => genre.toLowerCase() !== 'all' && lowercase.includes(genre.toLowerCase()));
  if (genreMatch) {
    currentGenre = genreMatch;
    genreFilter.value = genreMatch;
    refreshMovies();
    return `Great choice! Showing ${genreMatch} movies now. Click a title to preview details and trailer info.`;
  }

  if (lowercase.includes('watchlist')) {
    return `Your watchlist currently has ${watchlist.size} item(s). Click "Watchlist" on a movie card to save it.`;
  }

  return `I’m here to help. Try asking for a recommendation like "Recommend movies" or a preference like "I want a thriller".`;
}

function handleAssistantReply(message) {
  addAssistantMessage(message, false);
}

function sendAssistantMessage(text) {
  if (!text.trim()) return;
  addAssistantMessage(text, true);
  assistantInput.value = '';
  setTimeout(() => {
    const reply = handleAssistantCommand(text);
    handleAssistantReply(reply);
  }, 500);
}

assistantForm.addEventListener('submit', (event) => {
  event.preventDefault();
  sendAssistantMessage(assistantInput.value);
});

assistantActions.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'recommend') {
      sendAssistantMessage('Recommend movies');
    } else if (action === 'genre') {
      sendAssistantMessage('Show me top genres');
    } else if (action === 'time') {
      sendAssistantMessage('Recommend by mood');
    }
  });
});

assistantToggle.addEventListener('click', () => {
  assistantPanel.classList.toggle('hidden');
});

assistantClose.addEventListener('click', () => {
  assistantPanel.classList.add('hidden');
});

window.addEventListener('load', () => {
  addAssistantMessage('Hi! I’m MovieZone AI Guide. Ask me for recommendations, genre help, or how to launch a movie night.');
});

function formatMovieCard(movie) {
  const isSaved = watchlist.has(movie.id);
  return `
    <article class="card" data-id="${movie.id}">
      <img src="${movie.poster}" alt="${movie.title} poster">
      <div class="card-content">
        <div class="card-meta">
          <span class="tag">${movie.genre}</span>
          <span class="rating">★ ${movie.rating}</span>
        </div>
        <h3>${movie.title}</h3>
        <p>${movie.description}</p>
        <div class="card-actions">
          <button class="details-btn">Preview</button>
          <a class="button secondary download-btn" href="${movie.downloadUrl}" data-id="${movie.id}" download>Download</a>
          <button class="add-watchlist">${isSaved ? 'Saved' : 'Watchlist'}</button>
        </div>
      </div>
    </article>
  `;
}

function renderMovies(list) {
  if (list.length === 0) {
    movieGrid.innerHTML = '<p class="empty-state">No movies found. Try another search or filter.</p>';
  } else {
    movieGrid.innerHTML = list.map(formatMovieCard).join('');
  }
  totalMovies.textContent = list.length;
  activeGenre.textContent = currentGenre === 'all' ? 'All genres' : currentGenre;
  watchlistCount.textContent = watchlist.size;
}

function getGenres() {
  return ALL_GENRES;
}

function populateGenres() {
  genreFilter.innerHTML = getGenres()
    .map((genre) => `<option value="${genre}">${genre === 'all' ? 'All genres' : genre}</option>`)
    .join('');
}

function getFilteredMovies() {
  const term = searchInput.value.trim().toLowerCase();
  return movies.filter((movie) => {
    const matchGenre = currentGenre === 'all' || movie.genre === currentGenre;
    const matchSearch = [movie.title, movie.director, movie.cast, movie.description].some((value) =>
      value.toLowerCase().includes(term)
    );
    return matchGenre && matchSearch;
  });
}

function sortMovies(list) {
  const sortKey = sortFilter.value;
  return [...list].sort((a, b) => {
    if (sortKey === 'rating') return b.rating - a.rating;
    if (sortKey === 'year') return b.year - a.year;
    return b.id - a.id;
  });
}

function refreshMovies() {
  const filtered = sortMovies(getFilteredMovies());
  renderMovies(filtered);
}

function openModal(movieId) {
  activeMovie = movies.find((movie) => movie.id === Number(movieId));
  if (!activeMovie) return;
  modalPoster.src = activeMovie.poster;
  movieTitle.textContent = activeMovie.title;
  movieDescription.textContent = activeMovie.description;
  modalGenre.textContent = activeMovie.genre;
  modalDirector.textContent = activeMovie.director;
  modalCast.textContent = activeMovie.cast;
  modalTag.textContent = activeMovie.tag;
  modalYear.textContent = activeMovie.year;
  modalRating.textContent = `Rating ${activeMovie.rating}`;
  watchlistBtn.textContent = watchlist.has(activeMovie.id) ? 'Saved to watchlist' : 'Add to watchlist';
  downloadLink.href = activeMovie.downloadUrl || '#';
  trailerLink.href = activeMovie.trailer;
  movieModal.classList.remove('hidden');
}

function closeMovieModal() {
  movieModal.classList.add('hidden');
}

function toggleWatchlist(movieId) {
  const id = Number(movieId);
  if (watchlist.has(id)) {
    watchlist.delete(id);
  } else {
    watchlist.add(id);
  }
  localStorage.setItem('movieWatchlist', JSON.stringify([...watchlist]));
  refreshMovies();
  if (activeMovie && activeMovie.id === id) {
    watchlistBtn.textContent = watchlist.has(id) ? 'Saved to watchlist' : 'Add to watchlist';
  }
}

function showError(message) {
  movieGrid.innerHTML = `<p class="empty-state">${message}</p>`;
  totalMovies.textContent = '0';
  activeGenre.textContent = 'All genres';
}

movieGrid.addEventListener('click', (event) => {
  const card = event.target.closest('.card');
  if (!card) return;
  const movieId = card.dataset.id;

  if (event.target.matches('.download-btn')) {
    const href = event.target.getAttribute('href');
    if (!href || href === '#') {
      event.preventDefault();
      alert('This demo download link is a placeholder. Replace it with an actual movie file URL to enable downloads.');
    }
    return;
  }

  if (event.target.matches('.add-watchlist')) {
    toggleWatchlist(movieId);
    return;
  }

  if (event.target.matches('.details-btn') || !event.target.closest('.card-actions')) {
    openModal(movieId);
  }
});

searchBtn.addEventListener('click', refreshMovies);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') refreshMovies();
});

genreFilter.addEventListener('change', (event) => {
  currentGenre = event.target.value;
  refreshMovies();
});

sortFilter.addEventListener('change', refreshMovies);
modalClose.addEventListener('click', closeMovieModal);
modalBackdrop.addEventListener('click', closeMovieModal);
downloadLink.addEventListener('click', (event) => {
  if (!downloadLink.href || downloadLink.getAttribute('href') === '#') {
    event.preventDefault();
    alert('This download link is a placeholder. Replace it with a real movie file URL to enable movie downloads.');
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !movieModal.classList.contains('hidden')) closeMovieModal();
});

async function loadMovies() {
  try {
    const response = await fetch('data/movies.json');
    if (!response.ok) {
      throw new Error('Unable to load movies from local data.');
    }
    movies = await response.json();
    populateGenres();
    refreshMovies();
  } catch (error) {
    showError(error.message);
  }
}

loadMovies();

jwBtn.addEventListener('click', () => {
  alert('JustWatch availability requires a backend API and is not available in this static GitHub Pages version.');
});
