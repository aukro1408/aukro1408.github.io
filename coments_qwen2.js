(function () {
 "use strict";

 // =========================================================
 // НАСТРОЙКИ
 // =========================================================

 const API_BASE = "https://kinopoiskapiunofficial.tech";
 const API_KEY_STORAGE = "kp_reviews_api_key";
 const REVIEWS_PER_PAGE = 20;
 const CACHE_KEY = "lampa_kinopoisk_review_ids";

 const ORDER_OPTIONS = [
 { value: "DATE_DESC", label: "Новые" },
 { value: "DATE_ASC", label: "Старые" },
 { value: "USER_POSITIVE_RATING_DESC", label: "Больше положительных" },
 { value: "USER_NEGATIVE_RATING_DESC", label: "Больше отрицательных" }
 ];

 function getOrderLabel(value) {
 const found = ORDER_OPTIONS.find(function (o) {
 return o.value === value;
 });
 return found ? found.label : "Новые";
 }

 let currentMovie = null;
 let currentKinopoiskId = null;
 let currentPage = 1;
 let currentOrder = "DATE_DESC";
 let totalPages = 1;
 let reviewsModal = null;

 // Данные о фильме для рендера
 let currentFilmInfo = null;
 let currentBoxOffice = null;
 let currentAwards = null;
 let currentSequels = null;

 // =========================================================
 // ОБЩИЕ ФУНКЦИИ
 // =========================================================

 function escapeHtml(value) {
 return String(value || "")
 .replace(/&/g, "&amp;")
 .replace(/</g, "&lt;")
 .replace(/>/g, "&gt;")
 .replace(/"/g, "&quot;")
 .replace(/'/g, "&#039;");
 }

 function getMovieTitle(movie) {
 if (!movie) return "";
 return (movie.title || movie.name || movie.original_title || movie.original_name || "").trim();
 }

 function getMovieYear(movie) {
 if (!movie) return "";
 const date = movie.release_date || movie.first_air_date || "";
 if (date) return String(date).slice(0, 4);
 if (movie.year) return String(movie.year).slice(0, 4);
 return "";
 }

 function getMovieAlternativeTitle(movie) {
 if (!movie) return "";
 return (movie.original_title || movie.original_name || movie.title || movie.name || "").trim();
 }

 // =========================================================
 // КЛЮЧ API
 // =========================================================

 function getApiKey() {
 try {
 return (Lampa.Storage.get(API_KEY_STORAGE, "") || "").trim();
 } catch (e) {
 return "";
 }
 }

 function hasApiKey() {
 return !!getApiKey();
 }

 // =========================================================
 // КЭШ
 // =========================================================

 function loadCache() {
 try {
 const data = localStorage.getItem(CACHE_KEY);
 if (!data) return {};
 return JSON.parse(data);
 } catch (e) {
 console.error("[KP Reviews] Cache read error:", e);
 return {};
 }
 }

 function saveCache(cache) {
 try {
 localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
 } catch (e) {
 console.error("[KP Reviews] Cache save error:", e);
 }
 }

 function getCachedKinopoiskId(movie) {
 if (!movie || !movie.id) return null;
 const cache = loadCache();
 return cache[String(movie.id)] || null;
 }

 function saveKinopoiskId(movie, kinopoiskId) {
 if (!movie || !movie.id || !kinopoiskId) return;
 const cache = loadCache();
 cache[String(movie.id)] = Number(kinopoiskId);
 saveCache(cache);
 }

 // =========================================================
 // API ЗАПРОС
 // =========================================================

 async function kpFetch(path) {
 const apiKey = getApiKey();
 if (!apiKey) throw new Error("NO_API_KEY");

 const url = API_BASE + path;
 console.log("[KP Reviews] Request:", url);

 let response;
 try {
 response = await fetch(url, {
 method: "GET",
 headers: {
 "X-API-KEY": apiKey,
 "Content-Type": "application/json",
 "Accept": "application/json"
 }
 });
 } catch (error) {
 console.error("[KP Reviews] Fetch error:", error);
 throw new Error("CORS_ERROR");
 }

 console.log("[KP Reviews] HTTP:", response.status);

 if (response.status === 401) throw new Error("INVALID_KEY");
 if (response.status === 402) throw new Error("LIMIT_EXCEEDED");
 if (response.status === 429) throw new Error("TOO_MANY_REQUESTS");
 if (!response.ok) throw new Error("HTTP_" + response.status);

 return await response.json();
 }

 // =========================================================
 // ПОИСК ФИЛЬМА В КИНОПОИСКЕ
 // =========================================================

 async function searchKinopoisk(keyword, year) {
 if (!keyword) return null;
 const query = encodeURIComponent(keyword);
 const url = `/api/v2.1/films/search-by-keyword?keyword=${query}&page=1`;

 try {
 const data = await kpFetch(url);
 console.log("[KP Reviews] Search result:", data);

 const films = data.films || data.items || data.results || [];
 if (!films.length) return null;

 const normalizedKeyword = normalizeString(keyword);

 let candidates = films.filter(function (film) {
 const names = [film.nameRu, film.nameEn, film.nameOriginal, film.name, film.title]
 .filter(Boolean)
 .map(normalizeString);

 const titleMatches = names.some(function (name) {
 return name === normalizedKeyword;
 });

 if (!titleMatches) return false;
 if (!year) return true;

 const filmYear = String(film.year || film.yearFrom || "");
 return filmYear === String(year);
 });

 if (!candidates.length) {
 candidates = films.filter(function (film) {
 const names = [film.nameRu, film.nameEn, film.nameOriginal, film.name, film.title]
 .filter(Boolean)
 .map(normalizeString);
 return names.some(function (name) {
 return name === normalizedKeyword;
 });
 });
 }

 if (!candidates.length) candidates = films;

 const film = candidates[0];
 if (!film) return null;

 const kinopoiskId = film.kinopoiskId || film.filmId || film.kinopoisk_id || film.id;
 if (!kinopoiskId) return null;

 console.log("[KP Reviews] Found film:", film);
 return Number(kinopoiskId);
 } catch (error) {
 console.error("[KP Reviews] Search error:", error);
 throw error;
 }
 }

 // =========================================================
 // НОРМАЛИЗАЦИЯ
 // =========================================================

 function normalizeString(value) {
 return String(value || "")
 .toLowerCase()
 .replace(/ё/g, "е")
 .replace(/[^\p{L}\p{N}]+/gu, " ")
 .replace(/\s+/g, " ")
 .trim();
 }

 // =========================================================
 // ПОИСК KINOPOISK ID
 // =========================================================

 async function findKinopoiskId(movie) {
 const cached = getCachedKinopoiskId(movie);
 if (cached) {
 console.log("[KP Reviews] ID from cache:", cached);
 return cached;
 }

 const title = getMovieTitle(movie);
 const originalTitle = getMovieAlternativeTitle(movie);
 const year = getMovieYear(movie);

 if (!title) throw new Error("TITLE_NOT_FOUND");

 console.log("[KP Reviews] Search:", { title, originalTitle, year });

 let id = await searchKinopoisk(title, year);

 if (!id && originalTitle && normalizeString(originalTitle) !== normalizeString(title)) {
 id = await searchKinopoisk(originalTitle, year);
 }

 if (!id) throw new Error("FILM_NOT_FOUND");

 saveKinopoiskId(movie, id);
 return id;
 }

 // =========================================================
 // ПОЛУЧЕНИЕ ДАННЫХ О ФИЛЬМЕ (новые функции)
 // =========================================================

 async function getFilmInfo(kinopoiskId) {
 const url = `/api/v2.2/films/${kinopoiskId}`;
 return await kpFetch(url);
 }

 async function getBoxOffice(kinopoiskId) {
 try {
 const url = `/api/v2.2/films/${kinopoiskId}/box_office`;
 return await kpFetch(url);
 } catch (error) {
 console.warn("[KP Reviews] Box office not available:", error);
 return null;
 }
 }

 async function getAwards(kinopoiskId) {
 try {
 const url = `/api/v2.2/films/${kinopoiskId}/awards`;
 return await kpFetch(url);
 } catch (error) {
 console.warn("[KP Reviews] Awards not available:", error);
 return null;
 }
 }

 async function getSequelsAndPrequels(kinopoiskId) {
 try {
 const url = `/api/v2.1/films/${kinopoiskId}/sequels_and_prequels`;
 return await kpFetch(url);
 } catch (error) {
 console.warn("[KP Reviews] Sequels not available:", error);
 return null;
 }
 }

 async function getReviews(kinopoiskId, page, order) {
 const url = `/api/v2.2/films/${kinopoiskId}/reviews?page=${page}&order=${encodeURIComponent(order)}`;
 return await kpFetch(url);
 }

 // =========================================================
 // ФОРМАТ ДАТЫ
 // =========================================================

 function formatDate(date) {
 if (!date) return "";
 try {
 const d = new Date(date);
 if (Number.isNaN(d.getTime())) return date;
 return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
 } catch (e) {
 return date;
 }
 }

 // =========================================================
 // ТИП РЕЦЕНЗИИ
 // =========================================================

 function getReviewType(type) {
 const value = String(type || "").toUpperCase();
 if (value === "POSITIVE") return { icon: "👍", text: "Положительная", className: "kp-positive" };
 if (value === "NEGATIVE") return { icon: "👎", text: "Отрицательная", className: "kp-negative" };
 return { icon: "😐", text: "Нейтральная", className: "kp-neutral" };
 }

 function getAvatar(review) {
 if (!review) return "";
 const details = review.author_details || review.authorDetails || {};
 return details.avatar_path || details.avatarPath || review.avatar || "";
 }

 // =========================================================
 // РЕНДЕР ИНФОРМАЦИИ О ФИЛЬМЕ
 // =========================================================

 function renderMovieDetails() {
 if (!currentFilmInfo) return "";

 const kpRating = currentFilmInfo.ratingKinopoisk || currentFilmInfo.ratingKp || null;
 const kpVotes = currentFilmInfo.ratingKinopoiskVoteCount || currentFilmInfo.ratingKpVoteCount || null;
 const imdbRating = currentFilmInfo.ratingImdb || null;
 const imdbVotes = currentFilmInfo.ratingImdbVoteCount || null;
 const slogan = currentFilmInfo.slogan || "";
 const ageRating = currentFilmInfo.ratingAgeLimits || currentFilmInfo.ageRating || "";
 const filmLength = currentFilmInfo.filmLength || "";

 let html = `<div class="kp-movie-details">`;

 // Рейтинги
 if (kpRating || imdbRating) {
 html += `<div class="kp-detail-section kp-ratings">`;
 
 if (kpRating) {
 html += `
 <div class="kp-rating-card kp-kp">
 <div class="kp-rating-value">${kpRating}</div>
 <div class="kp-rating-label">Кинопоиск</div>
 ${kpVotes ? `<div class="kp-rating-votes">${kpVotes.toLocaleString("ru-RU")} оценок</div>` : ""}
 </div>
 `;
 }

 if (imdbRating) {
 html += `
 <div class="kp-rating-card kp-imdb">
 <div class="kp-rating-value">${imdbRating}</div>
 <div class="kp-rating-label">IMDb</div>
 ${imdbVotes ? `<div class="kp-rating-votes">${imdbVotes.toLocaleString("ru-RU")} оценок</div>` : ""}
 </div>
 `;
 }

 html += `</div>`;
 }

 // Основная информация
 let infoItems = [];
 
 if (slogan) {
 infoItems.push(`<div class="kp-info-item"><span class="kp-info-label">Слоган:</span> <span class="kp-info-value">"${escapeHtml(slogan)}"</span></div>`);
 }
 
 if (ageRating) {
 infoItems.push(`<div class="kp-info-item"><span class="kp-info-label">Возраст:</span> <span class="kp-info-value">${escapeHtml(ageRating)}+</span></div>`);
 }
 
 if (filmLength) {
 const minutes = parseInt(filmLength);
 const hours = Math.floor(minutes / 60);
 const mins = minutes % 60;
 const durationText = hours > 0 ? `${hours} ч ${mins} мин` : `${mins} мин`;
 infoItems.push(`<div class="kp-info-item"><span class="kp-info-label">Длительность:</span> <span class="kp-info-value">${durationText}</span></div>`);
 }

 if (infoItems.length > 0) {
 html += `<div class="kp-detail-section kp-info">${infoItems.join("")}</div>`;
 }

 // Финансы
 if (currentBoxOffice && currentBoxOffice.items && currentBoxOffice.items.length > 0) {
 html += `<div class="kp-detail-section kp-finance">`;
 html += `<div class="kp-detail-title">💰 Финансы</div>`;
 
 currentBoxOffice.items.forEach(function(item) {
 const type = item.type || "";
 const amount = item.amount || 0;
 const currencySymbol = item.currencyCode === "USD" ? "$" : item.currencyCode === "EUR" ? "€" : "₽";
 
 let typeLabel = "";
 if (type === "BUDGET") typeLabel = "Бюджет";
 else if (type === "BOX_OFFICE_USA") typeLabel = "Сборы в США";
 else if (type === "BOX_OFFICE_WORLD") typeLabel = "Сборы в мире";
 else if (type === "BOX_OFFICE_RUSSIA") typeLabel = "Сборы в России";
 
 if (typeLabel && amount > 0) {
 html += `<div class="kp-finance-item">
 <span class="kp-finance-label">${typeLabel}:</span>
 <span class="kp-finance-value">${currencySymbol}${amount.toLocaleString("ru-RU")}</span>
 </div>`;
 }
 });
 
 html += `</div>`;
 }

 // Награды
 if (currentAwards && currentAwards.items && currentAwards.items.length > 0) {
 html += `<div class="kp-detail-section kp-awards">`;
 html += `<div class="kp-detail-title">🏆 Награды и номинации</div>`;
 
 const awardList = currentAwards.items.slice(0, 3);
 
 awardList.forEach(function(award) {
 const awardName = award.award || "";
 const year = award.year || "";
 const nomination = award.nomination || "";
 const status = award.winning ? "🏅 Победа" : "📋 Номинация";
 
 html += `<div class="kp-award-item">
 <div class="kp-award-status">${status}</div>
 <div class="kp-award-info">
 <div class="kp-award-name">${escapeHtml(awardName)} ${year ? `(${year})` : ""}</div>
 ${nomination ? `<div class="kp-award-nomination">${escapeHtml(nomination)}</div>` : ""}
 </div>
 </div>`;
 });
 
 if (currentAwards.items.length > 3) {
 html += `<div class="kp-award-more">...и ещё ${currentAwards.items.length - 3} наград/номинаций</div>`;
 }
 
 html += `</div>`;
 }

 // Сиквелы и приквелы
 if (currentSequels && currentSequels.items && currentSequels.items.length > 0) {
 html += `<div class="kp-detail-section kp-sequels">`;
 html += `<div class="kp-detail-title">📚 Связанные фильмы</div>`;
 html += `<div class="kp-sequels-list">`;
 
 currentSequels.items.forEach(function(sequel) {
 const title = sequel.nameRu || sequel.nameEn || sequel.nameOriginal || "Без названия";
 const relation = sequel.relationType || "";
 let relationLabel = "";
 
 if (relation === "SEQUEL") relationLabel = "Сиквел";
 else if (relation === "PREQUEL") relationLabel = "Приквел";
 else if (relation === "REMAKE") relationLabel = "Ремейк";
 else if (relation === "SPIN_OFF") relationLabel = "Спин-офф";
 else relationLabel = relation;
 
 html += `<div class="kp-sequel-item">
 <span class="kp-sequel-type">${escapeHtml(relationLabel)}:</span>
 <span class="kp-sequel-title">${escapeHtml(title)}</span>
 </div>`;
 });
 
 html += `</div></div>`;
 }

 html += `</div>`;
 return html;
 }

 // =========================================================
 // РЕНДЕР ОТЗЫВА
 // =========================================================

 const COLLAPSE_THRESHOLD = 420;

 function renderReview(review, index) {
 const type = getReviewType(review.type);
 const author = review.author || "Пользователь";
 const title = review.title || "";
 const description = review.description || review.text || "";
 const date = formatDate(review.date || review.createdAt);
 const avatar = getAvatar(review);

 let avatarHtml = "";
 if (avatar) {
 let avatarUrl = avatar;
 if (avatar.startsWith("/")) avatarUrl = "https://kinopoiskapiunofficial.tech" + avatar;
 avatarHtml = `<div class="kp-review-avatar-wrap">
 <img src="${avatarUrl}" alt="${escapeHtml(author)}" class="kp-review-avatar" />
 </div>`;
 } else {
 avatarHtml = `<div class="kp-review-avatar-wrap">
 <div class="kp-review-avatar-placeholder">👤</div>
 </div>`;
 }

 return `<div class="kp-review ${type.className}">
 <div class="kp-review-top">
 <div class="kp-review-user">
 ${avatarHtml}
 <div class="kp-review-user-info">
 <div class="kp-review-author">${escapeHtml(author)}</div>
 <div class="kp-review-date">${escapeHtml(date)}</div>
 </div>
 </div>
 <div class="kp-review-type">
 <div class="kp-review-type-icon">${type.icon}</div>
 <div>${type.text}</div>
 </div>
 </div>
 ${title ? `<div class="kp-review-title">${escapeHtml(title)}</div>` : ""}
 <div class="kp-review-text-wrap">
 <div class="kp-review-text" id="review-text-${index}">${formatReviewText(description)}</div>
 ${description.length > COLLAPSE_THRESHOLD ? `<button class="kp-review-toggle" data-target="review-text-${index}">Читать полностью</button>` : ""}
 </div>
 </div>`;
 }

 function formatReviewText(text) {
 if (!text) return "Текст рецензии отсутствует.";
 const raw = String(text);
 const allowed = ["b", "i", "em", "strong", "br"];
 let value = escapeHtml(raw);
 allowed.forEach(function (tag) {
 const openRe = new RegExp("<" + tag + ">", "gi");
 const closeRe = new RegExp("</" + tag + ">", "gi");
 value = value.replace(openRe, "<" + tag + ">").replace(closeRe, "</" + tag + ">");
 });
 value = value.replace(/\n/g, "<br>");
 return value;
 }

 // =========================================================
 // CSS
 // =========================================================

 function addStyles() {
 if (document.getElementById("kp-reviews-style")) return;

 const style = document.createElement("style");
 style.id = "kp-reviews-style";
 style.textContent = `
 .kp-reviews-container {
 --kp-accent: #ff9800;
 --kp-accent-2: #ffb74d;
 --kp-accent-soft: rgba(255, 152, 0, .16);
 --kp-page-bg: #131316;
 --kp-card-bg: linear-gradient(165deg, #232327, #1a1a1d);
 --kp-card-bg-hover: linear-gradient(165deg, #28282d, #1e1e22);
 --kp-border: rgba(255,255,255,.07);
 --kp-text-dim: rgba(255,255,255,.5);
 padding: 6px 12px 34px;
 background: var(--kp-page-bg);
 border-radius: 20px;
 }

 .kp-movie-details {
 background: linear-gradient(165deg, #232327, #1c1c20);
 border: 1px solid var(--kp-border);
 border-radius: 20px;
 padding: 20px;
 margin-bottom: 24px;
 box-shadow: 0 14px 30px rgba(0,0,0,.4);
 }

 .kp-detail-section { margin-bottom: 18px; }
 .kp-detail-section:last-child { margin-bottom: 0; }

 .kp-detail-title {
 color: #fff;
 font-size: 14px;
 font-weight: 700;
 margin-bottom: 12px;
 letter-spacing: .02em;
 }

 .kp-ratings { display: flex; gap: 14px; flex-wrap: wrap; }

 .kp-rating-card {
 flex: 1;
 min-width: 140px;
 background: rgba(255,255,255,.05);
 border: 1px solid rgba(255,255,255,.1);
 border-radius: 16px;
 padding: 16px;
 text-align: center;
 transition: transform .15s ease, border-color .15s ease;
 }

 .kp-rating-card:hover {
 transform: translateY(-2px);
 border-color: rgba(255,255,255,.2);
 }

 .kp-rating-card.kp-kp {
 background: linear-gradient(135deg, rgba(255,152,0,.15), rgba(255,152,0,.05));
 border-color: rgba(255,152,0,.3);
 }

 .kp-rating-card.kp-imdb {
 background: linear-gradient(135deg, rgba(245,197,24,.15), rgba(245,197,24,.05));
 border-color: rgba(245,197,24,.3);
 }

 .kp-rating-value {
 font-size: 32px;
 font-weight: 800;
 line-height: 1;
 margin-bottom: 6px;
 }

 .kp-kp .kp-rating-value { color: var(--kp-accent); }
 .kp-imdb .kp-rating-value { color: #f5c518; }

 .kp-rating-label { color: #fff; font-size: 12px; font-weight: 600; margin-bottom: 4px; }
 .kp-rating-votes { color: var(--kp-text-dim); font-size: 11px; }

 .kp-info { display: flex; flex-direction: column; gap: 8px; }

 .kp-info-item {
 display: flex;
 align-items: center;
 gap: 8px;
 font-size: 13px;
 }

 .kp-info-label { color: var(--kp-text-dim); font-weight: 600; min-width: 100px; }
 .kp-info-value { color: #fff; font-weight: 600; }

 .kp-finance { display: flex; flex-direction: column; gap: 8px; }

 .kp-finance-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 8px 12px;
 background: rgba(255,255,255,.03);
 border-radius: 8px;
 }

 .kp-finance-label { color: var(--kp-text-dim); font-size: 13px; }
 .kp-finance-value { color: #fff; font-weight: 700; font-size: 13px; }

 .kp-awards { display: flex; flex-direction: column; gap: 10px; }

 .kp-award-item {
 display: flex;
 gap: 12px;
 padding: 12px;
 background: rgba(255,255,255,.03);
 border-radius: 12px;
 }

 .kp-award-status { font-size: 24px; flex-shrink: 0; }
 .kp-award-info { flex: 1; min-width: 0; }
 .kp-award-name { color: #fff; font-weight: 700; font-size: 13px; margin-bottom: 4px; }
 .kp-award-nomination { color: var(--kp-text-dim); font-size: 12px; }

 .kp-award-more {
 color: var(--kp-text-dim);
 font-size: 12px;
 text-align: center;
 padding: 8px;
 font-style: italic;
 }

 .kp-sequels-list { display: flex; flex-direction: column; gap: 8px; }

 .kp-sequel-item {
 display: flex;
 align-items: center;
 gap: 8px;
 padding: 10px 12px;
 background: rgba(255,255,255,.03);
 border-radius: 10px;
 font-size: 13px;
 }

 .kp-sequel-type { color: var(--kp-accent-2); font-weight: 700; min-width: 80px; }
 .kp-sequel-title { color: #fff; font-weight: 600; }

 .kp-reviews-toolbar {
 display: flex;
 gap: 12px;
 align-items: center;
 margin-bottom: 20px;
 flex-wrap: wrap;
 background: linear-gradient(165deg, #232327, #1c1c20);
 border: 1px solid var(--kp-border);
 border-radius: 16px;
 padding: 12px 14px;
 box-shadow: 0 10px 26px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04);
 }

 .kp-review-sort { position: relative; }

 .kp-review-sort-trigger {
 display: flex;
 align-items: center;
 gap: 8px;
 background: rgba(255,255,255,.05);
 color: #eee;
 border: 1px solid rgba(255,255,255,.1);
 border-radius: 12px;
 padding: 10px 14px;
 font-size: 13px;
 font-weight: 600;
 cursor: pointer;
 box-shadow: 0 4px 10px rgba(0,0,0,.25);
 transition: border-color .15s ease, background .15s ease, transform .15s ease;
 }

 .kp-review-sort-trigger.focus,
 .kp-review-sort-trigger:hover {
 border-color: var(--kp-accent);
 background: rgba(255,255,255,.08);
 transform: translateY(-1px);
 }

 .kp-review-sort-arrow {
 color: var(--kp-accent);
 font-size: 11px;
 transition: transform .15s ease;
 }

 .kp-review-sort.is-open .kp-review-sort-arrow { transform: rotate(180deg); }

 .kp-review-sort-list {
 display: none;
 position: absolute;
 top: calc(100% + 8px);
 left: 0;
 min-width: 240px;
 z-index: 20;
 background: linear-gradient(165deg, #29292e, #1c1c20);
 border: 1px solid rgba(255,255,255,.1);
 border-radius: 16px;
 padding: 6px;
 box-shadow: 0 20px 40px rgba(0,0,0,.55), 0 4px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.05);
 overflow: hidden;
 }

 .kp-review-sort.is-open .kp-review-sort-list {
 display: block;
 animation: kp-fade-in .15s ease both;
 }

 .kp-review-sort-item {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 10px;
 padding: 11px 12px;
 border-radius: 10px;
 font-size: 13px;
 color: #ddd;
 cursor: pointer;
 transition: background .12s ease, color .12s ease;
 }

 .kp-review-sort-item.focus,
 .kp-review-sort-item:hover {
 background: rgba(255,255,255,.08);
 color: #fff;
 }

 .kp-review-sort-item.is-active { color: var(--kp-accent-2); font-weight: 700; }

 .kp-review-sort-item.is-active::after {
 content: "";
 width: 8px;
 height: 8px;
 border-radius: 50%;
 background: var(--kp-accent);
 box-shadow: 0 0 8px var(--kp-accent);
 flex-shrink: 0;
 }

 .kp-reviews-count {
 margin-left: auto;
 color: #fff;
 font-size: 12px;
 font-weight: 700;
 letter-spacing: .02em;
 background: linear-gradient(135deg, var(--kp-accent), #e65100);
 border-radius: 999px;
 padding: 8px 15px;
 box-shadow: 0 6px 14px rgba(255,152,0,.28);
 }

 .kp-review {
 position: relative;
 background: var(--kp-card-bg);
 border: 1px solid var(--kp-border);
 border-radius: 20px;
 padding: 18px 18px 17px 21px;
 margin-bottom: 16px;
 overflow: hidden;
 box-shadow: 0 14px 30px rgba(0,0,0,.4), 0 2px 6px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.04);
 transition: transform .18s cubic-bezier(.2,.8,.2,1), box-shadow .18s ease, background .18s ease, border-color .18s ease;
 animation: kp-fade-in .3s ease both;
 }

 .kp-review::before {
 content: "";
 position: absolute;
 left: 0;
 top: 10px;
 bottom: 10px;
 width: 4px;
 border-radius: 4px;
 box-shadow: 0 0 10px currentColor;
 }

 .kp-review:hover,
 .kp-review:focus-within {
 background: var(--kp-card-bg-hover);
 border-color: rgba(255,255,255,.14);
 transform: translateY(-4px) scale(1.005);
 box-shadow: 0 22px 40px rgba(0,0,0,.5), 0 4px 10px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06);
 }

 .kp-review.kp-positive { color: #4caf50; }
 .kp-review.kp-negative { color: #f44336; }
 .kp-review.kp-neutral { color: #9e9e9e; }

 .kp-review.kp-positive::before { background: linear-gradient(180deg,#66bb6a,#2e7d32); }
 .kp-review.kp-negative::before { background: linear-gradient(180deg,#ef5350,#b71c1c); }
 .kp-review.kp-neutral::before { background: linear-gradient(180deg,#bdbdbd,#616161); }

 .kp-review-top {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 10px;
 margin-bottom: 14px;
 }

 .kp-review-user { display: flex; align-items: center; min-width: 0; }

 .kp-review-avatar-wrap {
 width: 46px;
 height: 46px;
 flex-shrink: 0;
 margin-right: 13px;
 border-radius: 50%;
 padding: 2px;
 background: linear-gradient(135deg, var(--kp-accent), rgba(255,255,255,.15));
 box-shadow: 0 6px 14px rgba(0,0,0,.4);
 }

 .kp-review-avatar,
 .kp-review-avatar-placeholder {
 width: 42px;
 height: 42px;
 border-radius: 50%;
 object-fit: cover;
 background: #232323;
 display: block;
 }

 .kp-review-avatar-placeholder {
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 18px;
 }

 .kp-review-user-info { min-width: 0; }

 .kp-review-author {
 color: #fff;
 font-weight: 700;
 font-size: 14px;
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
 letter-spacing: .01em;
 }

 .kp-review-date { color: var(--kp-text-dim); font-size: 11px; margin-top: 3px; }

 .kp-review-type {
 display: flex;
 align-items: center;
 gap: 7px;
 font-size: 11px;
 font-weight: 700;
 color: #fff;
 white-space: nowrap;
 background: rgba(255,255,255,.06);
 border: 1px solid rgba(255,255,255,.1);
 border-radius: 999px;
 padding: 7px 12px 7px 8px;
 box-shadow: 0 4px 10px rgba(0,0,0,.3);
 }

 .kp-review-type-icon {
 font-size: 13px;
 width: 20px;
 height: 20px;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 background: rgba(255,255,255,.08);
 box-shadow: inset 0 0 0 1px rgba(255,255,255,.1);
 }

 .kp-review-title {
 color: #fff;
 font-weight: 800;
 font-size: 16px;
 line-height: 1.35;
 margin-bottom: 10px;
 letter-spacing: .01em;
 }

 .kp-review-text-wrap { position: relative; }

 .kp-review-text {
 color: #cfcfd2;
 font-size: 14px;
 line-height: 1.65;
 word-break: break-word;
 }

 .kp-review-text a { color: var(--kp-accent-2); }

 .kp-review-text.is-collapsed {
 max-height: 7.6em;
 overflow: hidden;
 -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent 100%);
 mask-image: linear-gradient(180deg, #000 60%, transparent 100%);
 }

 .kp-review-toggle {
 display: inline-flex;
 align-items: center;
 gap: 4px;
 margin-top: 12px;
 padding: 8px 15px;
 border-radius: 999px;
 background: rgba(255,255,255,.06);
 border: 1px solid rgba(255,255,255,.1);
 color: var(--kp-accent-2);
 font-size: 12px;
 font-weight: 700;
 cursor: pointer;
 box-shadow: 0 4px 10px rgba(0,0,0,.25);
 transition: background .15s ease, border-color .15s ease, transform .15s ease;
 }

 .kp-review-toggle.focus,
 .kp-review-toggle:hover {
 background: rgba(255,255,255,.1);
 border-color: var(--kp-accent);
 transform: translateY(-1px);
 }

 .kp-review-pagination {
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 16px;
 margin-top: 26px;
 padding: 14px;
 background: linear-gradient(165deg, #232327, #1c1c20);
 border: 1px solid var(--kp-border);
 border-radius: 16px;
 box-shadow: 0 10px 26px rgba(0,0,0,.35);
 }

 .kp-review-page-button {
 background: linear-gradient(165deg, #2c2c31, #202024);
 border: 1px solid rgba(255,255,255,.1);
 color: #fff;
 border-radius: 999px;
 min-width: 46px;
 height: 42px;
 cursor: pointer;
 font-size: 17px;
 box-shadow: 0 6px 14px rgba(0,0,0,.35);
 transition: background .15s ease, border-color .15s ease, transform .15s ease, box-shadow .15s ease;
 }

 .kp-review-page-button.focus,
 .kp-review-page-button:hover {
 border-color: var(--kp-accent);
 background: linear-gradient(165deg, var(--kp-accent), #e65100);
 transform: translateY(-2px);
 box-shadow: 0 10px 20px rgba(255,152,0,.35);
 }

 .kp-review-page-button:disabled {
 opacity: .3;
 cursor: default;
 transform: none;
 box-shadow: none;
 }

 .kp-review-page-number {
 color: #fff;
 font-weight: 700;
 font-size: 13px;
 min-width: 56px;
 text-align: center;
 }

 .kp-skeleton-card {
 background: var(--kp-card-bg);
 border: 1px solid var(--kp-border);
 border-radius: 20px;
 padding: 18px 18px 17px 21px;
 margin-bottom: 16px;
 box-shadow: 0 14px 30px rgba(0,0,0,.4), 0 2px 6px rgba(0,0,0,.3);
 animation: kp-fade-in .3s ease both;
 }

 .kp-skeleton-top { display: flex; align-items: center; gap: 13px; margin-bottom: 16px; }

 .kp-skeleton-line,
 .kp-skeleton-avatar {
 background: linear-gradient(100deg, rgba(255,255,255,.06) 30%, rgba(255,255,255,.14) 50%, rgba(255,255,255,.06) 70%);
 background-size: 400% 100%;
 animation: kp-shimmer 1.5s ease infinite;
 border-radius: 8px;
 }

 .kp-skeleton-avatar { width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0; }

 .kp-skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
 .kp-skeleton-line { height: 10px; }
 .kp-skeleton-line.w-35 { width: 35%; }
 .kp-skeleton-line.w-20 { height: 8px; width: 20%; }

 .kp-skeleton-body .kp-skeleton-line { height: 11px; margin-bottom: 10px; }
 .kp-skeleton-body .kp-skeleton-line:last-child { width: 65%; margin-bottom: 0; }

 @keyframes kp-shimmer {
 0% { background-position: 200% 0; }
 100% { background-position: -200% 0; }
 }

 .kp-review-loading { text-align: center; padding: 50px 20px; color: #aaa; }

 .kp-review-error {
 text-align: center;
 padding: 36px 26px;
 color: #ddd;
 line-height: 1.55;
 max-width: 440px;
 margin: 0 auto;
 background: linear-gradient(165deg, #232327, #1c1c20);
 border: 1px solid var(--kp-border);
 border-radius: 20px;
 box-shadow: 0 14px 30px rgba(0,0,0,.4);
 }

 .kp-review-error-icon { font-size: 38px; margin-bottom: 14px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.4)); }

 .kp-review-error-action {
 display: inline-block;
 margin-top: 18px;
 padding: 11px 22px;
 border-radius: 999px;
 background: linear-gradient(135deg, var(--kp-accent), #e65100);
 color: #201400;
 font-weight: 800;
 font-size: 13px;
 cursor: pointer;
 border: 1px solid transparent;
 box-shadow: 0 10px 20px rgba(255,152,0,.3);
 transition: transform .15s ease, box-shadow .15s ease;
 }

 .kp-review-error-action.focus,
 .kp-review-error-action:hover {
 transform: translateY(-2px);
 box-shadow: 0 14px 24px rgba(255,152,0,.4);
 }

 .kp-review-empty {
 text-align: center;
 padding: 50px 20px;
 color: #999;
 background: linear-gradient(165deg, #232327, #1c1c20);
 border: 1px solid var(--kp-border);
 border-radius: 20px;
 box-shadow: 0 14px 30px rgba(0,0,0,.4);
 }

 .kp-reviews-footer {
 text-align: center;
 color: rgba(255,255,255,.3);
 font-size: 10px;
 padding: 14px 0 20px;
 letter-spacing: .03em;
 }

 @keyframes kp-fade-in {
 from { opacity: 0; transform: translateY(8px); }
 to { opacity: 1; transform: translateY(0); }
 }
 `;

 document.head.appendChild(style);
 }

 // =========================================================
 // ПУНКТ В МЕНЮ НАСТРОЕК LAMPA
 // =========================================================

 const SETTINGS_COMPONENT = "kp_reviews_settings";

 function setupSettings() {
 if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

 Lampa.SettingsApi.addComponent({
 component: SETTINGS_COMPONENT,
 name: "Рецензии Кинопоиска",
 icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
 });

 Lampa.SettingsApi.addParam({
 component: SETTINGS_COMPONENT,
 param: { type: "title" },
 field: { name: "Модуль показывает рецензии Кинопоиска на странице фильма/сериала. Для работы нужен собственный бесплатный API-ключ." }
 });

 Lampa.SettingsApi.addParam({
 component: SETTINGS_COMPONENT,
 param: {
 name: API_KEY_STORAGE,
 type: "input",
 placeholder: "Вставьте API-ключ",
 values: "",
 "default": ""
 },
 field: {
 name: "API-ключ Kinopoisk",
 description: "Получить свой ключ можно на kinopoiskapiunofficial.tech. Хранится только на этом устройстве."
 },
 onChange: function () {
 console.log("[KP Reviews] API key updated via settings");
 }
 });

 Lampa.SettingsApi.addParam({
 component: SETTINGS_COMPONENT,
 param: { name: "kp_reviews_clear_cache", type: "button" },
 field: {
 name: "Очистить кэш соответствий",
 description: "Если для фильма подтянулись не те рецензии — сотрите локальный кэш соответствий TMDB/Kinopoisk ID."
 },
 onChange: function () {
 saveCache({});
 if (Lampa.Noty && Lampa.Noty.show) {
 Lampa.Noty.show("Кэш очищен");
 }
 }
 });
 }

 function openPluginSettings() {
 if (Lampa.Noty && Lampa.Noty.show) {
 Lampa.Noty.show("Откройте Настройки Lampa → «Рецензии Кинопоиска»");
 }
 }

 // =========================================================
 // СОЗДАНИЕ MODAL РЕЦЕНЗИЙ
 // =========================================================

 function createModal() {
 addStyles();

 const html = `<div class="kp-reviews-container">
 <div id="kp-reviews-content"></div>
 <div class="kp-reviews-footer">Рецензии предоставлены Kinopoisk API</div>
 </div>`;

 const modal = $(html);

 Lampa.Modal.open({
 title: getMovieTitle(currentMovie),
 html: modal,
 size: "large",
 style: "margin-top:10px;",
 mask: true,
 onBack: function () {
 Lampa.Modal.close();
 $(".modal--large").remove();
 Lampa.Controller.toggle("content");
 }
 });

 reviewsModal = modal;
 return modal;
 }

 // =========================================================
 // ПОКАЗ ОШИБКИ
 // =========================================================

 function renderError(error) {
 let icon = "⚠️";
 let text = "Не удалось загрузить рецензии.";
 let showSettingsAction = false;

 if (error.message === "NO_API_KEY") {
 icon = "🔑";
 text = "Ключ Kinopoisk API не задан.\n\nОткройте Настройки Lampa (боковое меню) → «Рецензии Кинопоиска» и вставьте свой ключ.";
 showSettingsAction = true;
 } else if (error.message === "CORS_ERROR") {
 icon = "🌐";
 text = "Lampa не смогла напрямую обратиться к API Кинопоиска.\n\nЭто ограничение браузера (CORS).\n\nЕсли оно появится именно на твоём устройстве, понадобится небольшой прокси.";
 } else if (error.message === "INVALID_KEY") {
 icon = "🔑";
 text = "API-ключ Кинопоиска недействителен или был отключен.";
 showSettingsAction = true;
 } else if (error.message === "LIMIT_EXCEEDED") {
 icon = "⏳";
 text = "Достигнут дневной лимит запросов Kinopoisk API.";
 } else if (error.message === "TOO_MANY_REQUESTS") {
 icon = "🐌";
 text = "Слишком много запросов. Попробуйте ещё раз через несколько секунд.";
 } else if (error.message === "FILM_NOT_FOUND") {
 icon = "🔎";
 text = "Не удалось найти этот фильм или сериал в Кинопоиске.";
 } else if (error.message === "TITLE_NOT_FOUND") {
 icon = "🎬";
 text = "Не удалось получить название фильма из Lampa.";
 }

 const container = reviewsModal.find("#kp-reviews-content");

 container.html(`<div class="kp-review-error">
 <div class="kp-review-error-icon">${icon}</div>
 <div>${text.replace(/\n/g, '<br>')}</div>
 ${showSettingsAction ? `<button class="kp-review-error-action" id="kp-review-open-settings">Я понял, открою сам</button>` : ""}
 </div>`);

 if (showSettingsAction) {
 container.find("#kp-review-open-settings").on("hover:enter click", function () {
 Lampa.Modal.close();
 openPluginSettings();
 });
 }
 }

 // =========================================================
 // ЗАГРУЗКА СТРАНИЦЫ
 // =========================================================

 function renderSkeletonCards(count) {
 let html = "";
 for (let i = 0; i < count; i++) {
 html += `<div class="kp-skeleton-card">
 <div class="kp-skeleton-top">
 <div class="kp-skeleton-avatar"></div>
 <div class="kp-skeleton-lines">
 <div class="kp-skeleton-line w-35"></div>
 <div class="kp-skeleton-line w-20"></div>
 </div>
 </div>
 <div class="kp-skeleton-body">
 <div class="kp-skeleton-line"></div>
 <div class="kp-skeleton-line"></div>
 <div class="kp-skeleton-line"></div>
 </div>
 </div>`;
 }
 return html;
 }

 async function loadReviewPage(page) {
 if (!reviewsModal) return;

 const container = reviewsModal.find("#kp-reviews-content");
 container.html(renderSkeletonCards(4));

 try {
 const data = await getReviews(currentKinopoiskId, page, currentOrder);
 const items = data.items || data.reviews || [];
 totalPages = Number(data.totalPages || data.pages || 1);
 const total = Number(data.total || items.length || 0);
 currentPage = page;

 let html = "";

 // Добавляем информацию о фильме сверху (на всех страницах)
 html += renderMovieDetails();

 if (!items.length) {
 html += `<div class="kp-review-empty">Рецензий на этой странице нет.</div>`;
 container.html(html);
 return;
 }

 html += `<div class="kp-reviews-toolbar">
 <div class="kp-review-sort" id="kp-review-sort">
 <div class="kp-review-sort-trigger" id="kp-review-sort-trigger">
 <span>${escapeHtml(getOrderLabel(currentOrder))}</span>
 <span class="kp-review-sort-arrow">▾</span>
 </div>
 <div class="kp-review-sort-list" id="kp-review-sort-list">
 ${ORDER_OPTIONS.map(function (o) {
 return `<div class="kp-review-sort-item ${o.value === currentOrder ? "is-active" : ""}" data-value="${o.value}">${escapeHtml(o.label)}</div>`;
 }).join("")}
 </div>
 </div>
 <div class="kp-reviews-count">Всего: ${total}</div>
 </div>`;

 html += items.map(renderReview).join("");

 html += `<div class="kp-review-pagination">
 <button class="kp-review-page-button" id="kp-review-prev" ${currentPage <= 1 ? "disabled" : ""}>←</button>
 <div class="kp-review-page-number">${currentPage} / ${totalPages}</div>
 <button class="kp-review-page-button" id="kp-review-next" ${currentPage >= totalPages ? "disabled" : ""}>→</button>
 </div>`;

 container.html(html);

 container.find(".kp-review-toggle").on("hover:enter click", function () {
 const button = $(this);
 const targetId = button.data("target");
 const textBlock = container.find("#" + targetId);
 const isCollapsed = textBlock.hasClass("is-collapsed");
 textBlock.toggleClass("is-collapsed");
 button.text(isCollapsed ? "Свернуть" : "Читать полностью");
 });

 const sortWrap = container.find("#kp-review-sort");
 const sortTrigger = container.find("#kp-review-sort-trigger");

 sortTrigger.on("hover:enter click", function () {
 sortWrap.toggleClass("is-open");
 });

 container.find("#kp-review-sort-list .kp-review-sort-item").on("hover:enter click", function () {
 const value = $(this).data("value");
 sortWrap.removeClass("is-open");
 if (value === currentOrder) return;
 currentOrder = value;
 loadReviewPage(1);
 });

 container.find("#kp-review-prev").on("hover:enter click", function () {
 if (currentPage <= 1) return;
 loadReviewPage(currentPage - 1);
 });

 container.find("#kp-review-next").on("hover:enter click", function () {
 if (currentPage >= totalPages) return;
 loadReviewPage(currentPage + 1);
 });

 } catch (error) {
 console.error("[KP Reviews] Review page error:", error);
 renderError(error);
 }
 }

 // =========================================================
 // ОТКРЫТИЕ РЕЦЕНЗИЙ
 // =========================================================

 async function openReviews(movie) {
 currentMovie = movie;
 currentKinopoiskId = null;
 currentPage = 1;
 currentOrder = "DATE_DESC";
 currentFilmInfo = null;
 currentBoxOffice = null;
 currentAwards = null;
 currentSequels = null;

 createModal();

 if (!hasApiKey()) {
 renderError(new Error("NO_API_KEY"));
 return;
 }

 try {
 Lampa.Loading.start();

 currentKinopoiskId = await findKinopoiskId(movie);
 console.log("[KP Reviews] Kinopoisk ID:", currentKinopoiskId);

 // Параллельно загружаем всё
 const [filmInfo, boxOffice, awards, sequels, reviewsData] = await Promise.all([
 getFilmInfo(currentKinopoiskId).catch(() => null),
 getBoxOffice(currentKinopoiskId),
 getAwards(currentKinopoiskId),
 getSequelsAndPrequels(currentKinopoiskId),
 getReviews(currentKinopoiskId, 1, currentOrder)
 ]);

 currentFilmInfo = filmInfo;
 currentBoxOffice = boxOffice;
 currentAwards = awards;
 currentSequels = sequels;

 // Рендерим первую страницу (с уже загруженными отзывами)
 const items = reviewsData.items || reviewsData.reviews || [];
 totalPages = Number(reviewsData.totalPages || reviewsData.pages || 1);
 const total = Number(reviewsData.total || items.length || 0);

 let html = "";
 html += renderMovieDetails();

 if (!items.length) {
 html += `<div class="kp-review-empty">Рецензий пока нет.</div>`;
 reviewsModal.find("#kp-reviews-content").html(html);
 return;
 }

 html += `<div class="kp-reviews-toolbar">
 <div class="kp-review-sort" id="kp-review-sort">
 <div class="kp-review-sort-trigger" id="kp-review-sort-trigger">
 <span>${escapeHtml(getOrderLabel(currentOrder))}</span>
 <span class="kp-review-sort-arrow">▾</span>
 </div>
 <div class="kp-review-sort-list" id="kp-review-sort-list">
 ${ORDER_OPTIONS.map(function (o) {
 return `<div class="kp-review-sort-item ${o.value === currentOrder ? "is-active" : ""}" data-value="${o.value}">${escapeHtml(o.label)}</div>`;
 }).join("")}
 </div>
 </div>
 <div class="kp-reviews-count">Всего: ${total}</div>
 </div>`;

 html += items.map(renderReview).join("");

 html += `<div class="kp-review-pagination">
 <button class="kp-review-page-button" id="kp-review-prev" ${currentPage <= 1 ? "disabled" : ""}>←</button>
 <div class="kp-review-page-number">${currentPage} / ${totalPages}</div>
 <button class="kp-review-page-button" id="kp-review-next" ${currentPage >= totalPages ? "disabled" : ""}>→</button>
 </div>`;

 const container = reviewsModal.find("#kp-reviews-content");
 container.html(html);

 // Навешиваем обработчики
 container.find(".kp-review-toggle").on("hover:enter click", function () {
 const button = $(this);
 const targetId = button.data("target");
 const textBlock = container.find("#" + targetId);
 const isCollapsed = textBlock.hasClass("is-collapsed");
 textBlock.toggleClass("is-collapsed");
 button.text(isCollapsed ? "Свернуть" : "Читать полностью");
 });

 const sortWrap = container.find("#kp-review-sort");
 const sortTrigger = container.find("#kp-review-sort-trigger");

 sortTrigger.on("hover:enter click", function () {
 sortWrap.toggleClass("is-open");
 });

 container.find("#kp-review-sort-list .kp-review-sort-item").on("hover:enter click", function () {
 const value = $(this).data("value");
 sortWrap.removeClass("is-open");
 if (value === currentOrder) return;
 currentOrder = value;
 loadReviewPage(1);
 });

 container.find("#kp-review-prev").on("hover:enter click", function () {
 if (currentPage <= 1) return;
 loadReviewPage(currentPage - 1);
 });

 container.find("#kp-review-next").on("hover:enter click", function () {
 if (currentPage >= totalPages) return;
 loadReviewPage(currentPage + 1);
 });

 } catch (error) {
 console.error("[KP Reviews] Open error:", error);
 renderError(error);
 } finally {
 Lampa.Loading.stop();
 }
 }

 // =========================================================
 // ЗАПУСК ПЛАГИНА
 // =========================================================

 function startPlugin() {
 if (window.kinopoisk_reviews_plugin) return;
 window.kinopoisk_reviews_plugin = true;

 if (window.appready) {
 setupSettings();
 } else {
 Lampa.Listener.follow("app", function (e) {
 if (e.type === "ready") setupSettings();
 });
 }

 Lampa.Listener.follow("full", function (e) {
 if (e.type !== "complite") return;
 const movie = e.data && e.data.movie;
 if (!movie) return;

 $(".button--kp-reviews").remove();

 $(".full-start-new__buttons").append(`
 <div class="button button--kp-reviews">
 <div class="button__icon">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
 </div>
 <div class="button__text">Рецензии</div>
 </div>
 `);

 $(".button--kp-reviews").on("hover:enter", function () {
 openReviews(movie);
 });
 });
 }

 startPlugin();

})();
