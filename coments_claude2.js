(function () {
    "use strict";

    // =========================================================
    // НАСТРОЙКИ
    // =========================================================

    const API_BASE = "https://kinopoiskapiunofficial.tech";

    // Ключ больше не зашит в код — хранится в Lampa.Storage
    // и вводится пользователем через настройки плагина.
    const API_KEY_STORAGE = "kp_reviews_api_key";

    // Сколько отзывов показываем на одной странице
    const REVIEWS_PER_PAGE = 20;

    // Кэш соответствий TMDB ID -> Kinopoisk ID
    const CACHE_KEY = "lampa_kinopoisk_review_ids";

    let currentMovie = null;
    let currentKinopoiskId = null;
    let currentPage = 1;
    let currentOrder = "DATE_DESC";
    let totalPages = 1;

    let reviewsModal = null;


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

        return (
            movie.title ||
            movie.name ||
            movie.original_title ||
            movie.original_name ||
            ""
        ).trim();
    }


    function getMovieYear(movie) {
        if (!movie) return "";

        const date =
            movie.release_date ||
            movie.first_air_date ||
            "";

        if (date) {
            return String(date).slice(0, 4);
        }

        if (movie.year) {
            return String(movie.year).slice(0, 4);
        }

        return "";
    }


    function getMovieAlternativeTitle(movie) {
        if (!movie) return "";

        return (
            movie.original_title ||
            movie.original_name ||
            movie.title ||
            movie.name ||
            ""
        ).trim();
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


    function setApiKey(value) {
        Lampa.Storage.set(API_KEY_STORAGE, String(value || "").trim());
    }


    function hasApiKey() {
        return !!getApiKey();
    }


    // =========================================================
    // КЭШ
    // =========================================================

    function loadCache() {
        try {
            const data =
                localStorage.getItem(CACHE_KEY);

            if (!data) return {};

            return JSON.parse(data);
        } catch (e) {
            console.error(
                "[KP Reviews] Cache read error:",
                e
            );

            return {};
        }
    }


    function saveCache(cache) {
        try {
            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify(cache)
            );
        } catch (e) {
            console.error(
                "[KP Reviews] Cache save error:",
                e
            );
        }
    }


    function getCachedKinopoiskId(movie) {
        if (!movie || !movie.id) {
            return null;
        }

        const cache = loadCache();

        return cache[String(movie.id)] || null;
    }


    function saveKinopoiskId(movie, kinopoiskId) {
        if (!movie || !movie.id || !kinopoiskId) {
            return;
        }

        const cache = loadCache();

        cache[String(movie.id)] = Number(
            kinopoiskId
        );

        saveCache(cache);
    }


    // =========================================================
    // API ЗАПРОС
    // =========================================================

    async function kpFetch(path) {
        const apiKey = getApiKey();

        if (!apiKey) {
            throw new Error("NO_API_KEY");
        }

        const url =
            API_BASE + path;

        console.log(
            "[KP Reviews] Request:",
            url
        );

        let response;

        try {
            response = await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "X-API-KEY": apiKey,
                        "Content-Type":
                            "application/json",
                        "Accept":
                            "application/json"
                    }
                }
            );
        } catch (error) {
            console.error(
                "[KP Reviews] Fetch error:",
                error
            );

            throw new Error(
                "CORS_ERROR"
            );
        }

        console.log(
            "[KP Reviews] HTTP:",
            response.status
        );


        if (response.status === 401) {
            throw new Error(
                "INVALID_KEY"
            );
        }


        if (response.status === 402) {
            throw new Error(
                "LIMIT_EXCEEDED"
            );
        }


        if (response.status === 429) {
            throw new Error(
                "TOO_MANY_REQUESTS"
            );
        }


        if (!response.ok) {
            throw new Error(
                "HTTP_" +
                response.status
            );
        }


        return await response.json();
    }


    // =========================================================
    // ПОИСК ФИЛЬМА В КИНОПОИСКЕ
    // =========================================================

    async function searchKinopoisk(
        keyword,
        year
    ) {
        if (!keyword) {
            return null;
        }


        const query =
            encodeURIComponent(
                keyword
            );


        let url =
            `/api/v2.1/films/search-by-keyword?keyword=${query}&page=1`;


        try {
            const data =
                await kpFetch(url);


            console.log(
                "[KP Reviews] Search result:",
                data
            );


            const films =
                data.films ||
                data.items ||
                data.results ||
                [];


            if (!films.length) {
                return null;
            }


            // =================================================
            // Сначала пытаемся найти точное совпадение
            // по названию + году
            // =================================================

            const normalizedKeyword =
                normalizeString(
                    keyword
                );


            let candidates =
                films.filter(
                    function (film) {

                        const names = [
                            film.nameRu,
                            film.nameEn,
                            film.nameOriginal,
                            film.name,
                            film.title
                        ]
                            .filter(Boolean)
                            .map(
                                normalizeString
                            );


                        const titleMatches =
                            names.some(
                                function (name) {
                                    return (
                                        name ===
                                        normalizedKeyword
                                    );
                                }
                            );


                        if (!titleMatches) {
                            return false;
                        }


                        if (!year) {
                            return true;
                        }


                        const filmYear =
                            String(
                                film.year ||
                                film.yearFrom ||
                                ""
                            );


                        return (
                            filmYear ===
                            String(year)
                        );
                    }
                );


            // =================================================
            // Если точного совпадения нет —
            // ищем просто по названию
            // =================================================

            if (!candidates.length) {
                candidates =
                    films.filter(
                        function (film) {

                            const names = [
                                film.nameRu,
                                film.nameEn,
                                film.nameOriginal,
                                film.name,
                                film.title
                            ]
                                .filter(Boolean)
                                .map(
                                    normalizeString
                                );


                            return names.some(
                                function (name) {
                                    return (
                                        name ===
                                        normalizedKeyword
                                    );
                                }
                            );
                        }
                    );
            }


            // =================================================
            // Если ничего не нашли — берём первый результат
            // =================================================

            if (!candidates.length) {
                candidates = films;
            }


            const film =
                candidates[0];


            if (!film) {
                return null;
            }


            const kinopoiskId =
                film.kinopoiskId ||
                film.filmId ||
                film.kinopoisk_id ||
                film.id;


            if (!kinopoiskId) {
                return null;
            }


            console.log(
                "[KP Reviews] Found film:",
                film
            );


            return Number(
                kinopoiskId
            );

        } catch (error) {
            console.error(
                "[KP Reviews] Search error:",
                error
            );

            throw error;
        }
    }


    // =========================================================
    // НОРМАЛИЗАЦИЯ
    // =========================================================

    function normalizeString(value) {
        return String(
            value || ""
        )
            .toLowerCase()
            .replace(/ё/g, "е")
            .replace(
                /[^\p{L}\p{N}]+/gu,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }


    // =========================================================
    // ПОИСК KINOPOISK ID
    // =========================================================

    async function findKinopoiskId(
        movie
    ) {
        // -----------------------------------------------------
        // Проверяем кэш
        // -----------------------------------------------------

        const cached =
            getCachedKinopoiskId(
                movie
            );


        if (cached) {
            console.log(
                "[KP Reviews] ID from cache:",
                cached
            );

            return cached;
        }


        const title =
            getMovieTitle(
                movie
            );


        const originalTitle =
            getMovieAlternativeTitle(
                movie
            );


        const year =
            getMovieYear(
                movie
            );


        if (!title) {
            throw new Error(
                "TITLE_NOT_FOUND"
            );
        }


        console.log(
            "[KP Reviews] Search:",
            {
                title,
                originalTitle,
                year
            }
        );


        // -----------------------------------------------------
        // Первый поиск — название из Lampa
        // -----------------------------------------------------

        let id =
            await searchKinopoisk(
                title,
                year
            );


        // -----------------------------------------------------
        // Второй поиск — оригинальное название
        // -----------------------------------------------------

        if (
            !id &&
            originalTitle &&
            normalizeString(
                originalTitle
            ) !==
            normalizeString(
                title
            )
        ) {
            id =
                await searchKinopoisk(
                    originalTitle,
                    year
                );
        }


        if (!id) {
            throw new Error(
                "FILM_NOT_FOUND"
            );
        }


        saveKinopoiskId(
            movie,
            id
        );


        return id;
    }


    // =========================================================
    // ПОЛУЧЕНИЕ ОТЗЫВОВ
    // =========================================================

    async function getReviews(
        kinopoiskId,
        page,
        order
    ) {
        const url =
            `/api/v2.2/films/${kinopoiskId}/reviews` +
            `?page=${page}` +
            `&order=${encodeURIComponent(order)}`;


        return await kpFetch(
            url
        );
    }


    // =========================================================
    // ФОРМАТ ДАТЫ
    // =========================================================

    function formatDate(date) {
        if (!date) return "";

        try {
            const d =
                new Date(date);

            if (
                Number.isNaN(
                    d.getTime()
                )
            ) {
                return date;
            }


            return d.toLocaleDateString(
                "ru-RU",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

        } catch (e) {
            return date;
        }
    }


    // =========================================================
    // ТИП РЕЦЕНЗИИ
    // =========================================================

    function getReviewType(type) {
        const value =
            String(
                type || ""
            ).toUpperCase();


        if (
            value === "POSITIVE"
        ) {
            return {
                icon: "👍",
                text: "Положительная",
                className: "kp-positive"
            };
        }


        if (
            value === "NEGATIVE"
        ) {
            return {
                icon: "👎",
                text: "Отрицательная",
                className: "kp-negative"
            };
        }


        return {
            icon: "😐",
            text: "Нейтральная",
            className: "kp-neutral"
        };
    }


    // =========================================================
    // АВАТАР
    // =========================================================

    function getAvatar(review) {
        if (!review) {
            return "";
        }


        const details =
            review.author_details ||
            review.authorDetails ||
            {};


        return (
            details.avatar_path ||
            details.avatarPath ||
            review.avatar ||
            ""
        );
    }


    // =========================================================
    // РЕНДЕР ОТЗЫВА
    // =========================================================

    function renderReview(
        review
    ) {
        const type =
            getReviewType(
                review.type
            );


        const author =
            review.author ||
            "Пользователь";


        const title =
            review.title ||
            "";


        const description =
            review.description ||
            review.text ||
            "";


        const date =
            formatDate(
                review.date ||
                review.createdAt
            );


        const avatar =
            getAvatar(
                review
            );


        let avatarHtml = "";


        if (avatar) {
            let avatarUrl =
                avatar;


            if (
                avatar.startsWith("/")
            ) {
                avatarUrl =
                    "https://kinopoiskapiunofficial.tech" +
                    avatar;
            }


            avatarHtml = `
                <img
                    class="kp-review-avatar"
                    src="${escapeHtml(
                        avatarUrl
                    )}"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="kp-review-avatar-placeholder"
                    style="display:none;"
                >
                    👤
                </div>
            `;
        } else {
            avatarHtml = `
                <div class="kp-review-avatar-placeholder">
                    👤
                </div>
            `;
        }


        return `
            <div class="kp-review ${type.className}">

                <div class="kp-review-top">

                    <div class="kp-review-user">

                        <div class="kp-review-avatar-wrap">
                            ${avatarHtml}
                        </div>

                        <div class="kp-review-user-info">

                            <div class="kp-review-author">
                                ${escapeHtml(
                                    author
                                )}
                            </div>

                            <div class="kp-review-date">
                                ${escapeHtml(
                                    date
                                )}
                            </div>

                        </div>

                    </div>


                    <div class="kp-review-type">
                        <span class="kp-review-type-icon">
                            ${type.icon}
                        </span>

                        <span>
                            ${type.text}
                        </span>
                    </div>

                </div>


                ${
                    title
                        ? `
                            <div class="kp-review-title">
                                ${escapeHtml(
                                    title
                                )}
                            </div>
                        `
                        : ""
                }


                <div class="kp-review-text">
                    ${formatReviewText(
                        description
                    )}
                </div>

            </div>
        `;
    }


    // =========================================================
    // ФОРМАТИРОВАНИЕ ТЕКСТА
    // =========================================================

    function formatReviewText(
        text
    ) {
        if (!text) {
            return "Текст рецензии отсутствует.";
        }


        // API может вернуть HTML
        // Разрешаем только базовые безопасные теги,
        // остальное — экранируем целиком, чтобы не открывать XSS

        const raw = String(text);

        const allowed = ["b", "i", "em", "strong", "br"];

        let value = escapeHtml(raw);

        allowed.forEach(function (tag) {
            const openRe = new RegExp("&lt;" + tag + "&gt;", "gi");
            const closeRe = new RegExp("&lt;\\/" + tag + "&gt;", "gi");

            value = value
                .replace(openRe, "<" + tag + ">")
                .replace(closeRe, "</" + tag + ">");
        });


        value =
            value.replace(
                /\n/g,
                "<br>"
            );


        return value;
    }


    // =========================================================
    // CSS
    // =========================================================

    function addStyles() {
        if (
            document.getElementById(
                "kp-reviews-style"
            )
        ) {
            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "kp-reviews-style";


        style.textContent = `

            .kp-reviews-container {
                --kp-accent: #ff9800;
                --kp-accent-soft: rgba(255, 152, 0, .14);
                --kp-bg-card: linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.015));
                --kp-border: rgba(255,255,255,.09);
                --kp-text-dim: rgba(255,255,255,.55);
                padding: 4px 10px 30px;
            }

            .kp-reviews-toolbar {
                display: flex;
                gap: 10px;
                align-items: center;
                margin-bottom: 18px;
                flex-wrap: wrap;
            }

            .kp-review-filter {
                background: rgba(255,255,255,.06);
                color: #eee;
                border: 1px solid var(--kp-border);
                border-radius: 12px;
                padding: 10px 14px;
                font-size: 13px;
                outline: none;
                backdrop-filter: blur(6px);
                transition: border-color .15s ease, background .15s ease;
            }

            .kp-review-filter.focus,
            .kp-review-filter:hover {
                border-color: var(--kp-accent);
                background: rgba(255,255,255,.09);
            }

            .kp-reviews-count {
                margin-left: auto;
                color: var(--kp-text-dim);
                font-size: 12px;
                letter-spacing: .02em;
                background: rgba(255,255,255,.05);
                border: 1px solid var(--kp-border);
                border-radius: 999px;
                padding: 6px 12px;
            }

            .kp-review {
                position: relative;
                background: var(--kp-bg-card);
                border: 1px solid var(--kp-border);
                border-radius: 18px;
                padding: 16px 16px 15px;
                margin-bottom: 12px;
                overflow: hidden;
                transition: transform .15s ease, border-color .15s ease;
                animation: kp-fade-in .25s ease both;
            }

            .kp-review::before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 3px;
                border-radius: 0 3px 3px 0;
            }

            .kp-review:hover {
                border-color: rgba(255,255,255,.18);
                transform: translateY(-1px);
            }

            .kp-review.kp-positive::before { background: linear-gradient(180deg,#4caf50,#2e7d32); }
            .kp-review.kp-negative::before { background: linear-gradient(180deg,#f44336,#b71c1c); }
            .kp-review.kp-neutral::before  { background: linear-gradient(180deg,#9e9e9e,#616161); }

            .kp-review-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 12px;
            }

            .kp-review-user {
                display: flex;
                align-items: center;
                min-width: 0;
            }

            .kp-review-avatar-wrap {
                width: 44px;
                height: 44px;
                flex-shrink: 0;
                margin-right: 12px;
                border-radius: 50%;
                padding: 2px;
                background: linear-gradient(135deg, var(--kp-accent), rgba(255,255,255,.15));
            }

            .kp-review-avatar,
            .kp-review-avatar-placeholder {
                width: 40px;
                height: 40px;
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

            .kp-review-user-info {
                min-width: 0;
            }

            .kp-review-author {
                color: #fff;
                font-weight: 600;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                letter-spacing: .01em;
            }

            .kp-review-date {
                color: var(--kp-text-dim);
                font-size: 11px;
                margin-top: 3px;
            }

            .kp-review-type {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                font-weight: 600;
                color: #ddd;
                white-space: nowrap;
                background: rgba(255,255,255,.06);
                border: 1px solid var(--kp-border);
                border-radius: 999px;
                padding: 6px 11px 6px 8px;
            }

            .kp-review-type-icon {
                font-size: 13px;
            }

            .kp-review-title {
                color: #fff;
                font-weight: 700;
                font-size: 16px;
                line-height: 1.35;
                margin-bottom: 9px;
                letter-spacing: .01em;
            }

            .kp-review-text {
                color: #d2d2d2;
                font-size: 14px;
                line-height: 1.6;
                word-break: break-word;
            }

            .kp-review-text a {
                color: var(--kp-accent);
            }

            .kp-review-pagination {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 14px;
                margin-top: 22px;
                padding-bottom: 10px;
            }

            .kp-review-page-button {
                background: rgba(255,255,255,.06);
                border: 1px solid var(--kp-border);
                color: #fff;
                border-radius: 999px;
                min-width: 44px;
                height: 40px;
                cursor: pointer;
                font-size: 16px;
                transition: background .15s ease, border-color .15s ease;
            }

            .kp-review-page-button.focus,
            .kp-review-page-button:hover {
                border-color: var(--kp-accent);
                background: var(--kp-accent-soft);
            }

            .kp-review-page-button:disabled {
                opacity: .3;
                cursor: default;
            }

            .kp-review-page-number {
                color: #ddd;
                font-size: 13px;
                min-width: 56px;
                text-align: center;
            }

            .kp-review-loading {
                text-align: center;
                padding: 50px 20px;
                color: #aaa;
            }

            .kp-review-error {
                text-align: center;
                padding: 40px 24px;
                color: #ddd;
                line-height: 1.55;
                max-width: 440px;
                margin: 0 auto;
            }

            .kp-review-error-icon {
                font-size: 36px;
                margin-bottom: 14px;
            }

            .kp-review-error-action {
                display: inline-block;
                margin-top: 18px;
                padding: 10px 20px;
                border-radius: 999px;
                background: var(--kp-accent);
                color: #201400;
                font-weight: 700;
                font-size: 13px;
                cursor: pointer;
                border: 1px solid transparent;
            }

            .kp-review-error-action.focus,
            .kp-review-error-action:hover {
                filter: brightness(1.08);
            }

            .kp-review-empty {
                text-align: center;
                padding: 50px 20px;
                color: #999;
            }

            .kp-reviews-footer {
                text-align: center;
                color: rgba(255,255,255,.3);
                font-size: 10px;
                padding: 10px 0 20px;
                letter-spacing: .03em;
            }

            @keyframes kp-fade-in {
                from { opacity: 0; transform: translateY(4px); }
                to   { opacity: 1; transform: translateY(0); }
            }

        `;


        document.head.appendChild(
            style
        );
    }


    // =========================================================
    // ПУНКТ В МЕНЮ НАСТРОЕК LAMPA
    // =========================================================

    const SETTINGS_COMPONENT = "kp_reviews_settings";


    function setupSettings() {
        if (
            !Lampa.SettingsApi ||
            !Lampa.SettingsApi.addComponent
        ) {
            return;
        }


        // -----------------------------------------------------
        // Пункт верхнего уровня в настройках Lampa
        // -----------------------------------------------------

        Lampa.SettingsApi.addComponent({
            component: SETTINGS_COMPONENT,
            name: "Рецензии Кинопоиска",
            icon: `
                <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="
                        M21 11.5
                        a8.38 8.38 0 0 1-.9 3.8
                        8.5 8.5 0 0 1-7.6 4.7
                        8.38 8.38 0 0 1-3.8-.9
                        L3 21l1.9-5.7
                        a8.38 8.38 0 0 1-.9-3.8
                        8.5 8.5 0 0 1 4.7-7.6
                        8.38 8.38 0 0 1 3.8-.9
                        h.5
                        a8.48 8.48 0 0 1 8 8
                        v.5z
                        "
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            `
        });


        // -----------------------------------------------------
        // Пояснение
        // -----------------------------------------------------

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,

            param: {
                type: "title"
            },

            field: {
                name:
                    "Модуль показывает рецензии Кинопоиска на странице фильма/сериала. Для работы нужен собственный бесплатный API-ключ."
            }
        });


        // -----------------------------------------------------
        // Поле ввода ключа
        // -----------------------------------------------------

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
                description:
                    "Получить свой ключ можно на kinopoiskapiunofficial.tech. Хранится только на этом устройстве."
            },

            onChange: function () {
                console.log(
                    "[KP Reviews] API key updated via settings"
                );
            }
        });


        // -----------------------------------------------------
        // Сброс кэша соответствий TMDB -> Kinopoisk ID
        // -----------------------------------------------------

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,

            param: {
                name: "kp_reviews_clear_cache",
                type: "button"
            },

            field: {
                name: "Очистить кэш соответствий",
                description:
                    "Если для фильма подтянулись не те рецензии — сотрите локальный кэш соответствий TMDB/Kinopoisk ID."
            },

            onChange: function () {
                saveCache({});

                if (
                    Lampa.Noty &&
                    Lampa.Noty.show
                ) {
                    Lampa.Noty.show(
                        "Кэш очищен"
                    );
                }
            }
        });
    }


    function openPluginSettings() {
        Lampa.Activity.push({
            url: "",
            title: "Настройки",
            component: "settings",
            page: 1
        });


        setTimeout(function () {

            const item = $(
                '[data-component="' +
                SETTINGS_COMPONENT +
                '"]'
            );


            if (item.length) {
                item.trigger(
                    "hover:enter"
                );
            }

        }, 300);
    }


    // =========================================================
    // СОЗДАНИЕ MODAL РЕЦЕНЗИЙ
    // =========================================================

    function createModal() {
        addStyles();


        const html = `
            <div class="kp-reviews-container">

                <div
                    class="kp-reviews-content"
                    id="kp-reviews-content"
                ></div>

                <div
                    class="kp-reviews-footer"
                >
                    Рецензии предоставлены Kinopoisk API
                </div>

            </div>
        `;


        const modal =
            $(
                html
            );


        Lampa.Modal.open({
            title:
                getMovieTitle(
                    currentMovie
                ),

            html:
                modal,

            size:
                "large",

            style:
                "margin-top:10px;",

            mask:
                true,

            onBack:
                function () {
                    Lampa.Modal.close();

                    $(".modal--large")
                        .remove();

                    Lampa.Controller.toggle(
                        "content"
                    );
                }
        });


        reviewsModal =
            modal;


        return modal;
    }


    // =========================================================
    // ПОКАЗ ОШИБКИ
    // =========================================================

    function renderError(
        error
    ) {
        let icon = "⚠️";
        let text =
            "Не удалось загрузить рецензии.";
        let showSettingsAction = false;


        if (
            error.message ===
            "NO_API_KEY"
        ) {
            icon = "🔑";

            text =
                "Ключ Kinopoisk API не задан.<br>Добавьте свой ключ в настройках плагина.";

            showSettingsAction = true;
        }


        else if (
            error.message ===
            "CORS_ERROR"
        ) {
            icon = "🌐";

            text =
                "Lampa не смогла напрямую обратиться к API Кинопоиска.<br><br>" +
                "Это ограничение браузера (CORS).<br>" +
                "Если оно появится именно на твоём устройстве, понадобится небольшой прокси.";
        }


        else if (
            error.message ===
            "INVALID_KEY"
        ) {
            icon = "🔑";

            text =
                "API-ключ Кинопоиска недействителен или был отключён.";

            showSettingsAction = true;
        }


        else if (
            error.message ===
            "LIMIT_EXCEEDED"
        ) {
            icon = "⏳";

            text =
                "Достигнут дневной лимит запросов Kinopoisk API.";
        }


        else if (
            error.message ===
            "TOO_MANY_REQUESTS"
        ) {
            icon = "🐌";

            text =
                "Слишком много запросов. Попробуйте ещё раз через несколько секунд.";
        }


        else if (
            error.message ===
            "FILM_NOT_FOUND"
        ) {
            icon = "🔎";

            text =
                "Не удалось найти этот фильм или сериал в Кинопоиске.";
        }


        else if (
            error.message ===
            "TITLE_NOT_FOUND"
        ) {
            icon = "🎬";

            text =
                "Не удалось получить название фильма из Lampa.";
        }


        const container =
            reviewsModal.find(
                "#kp-reviews-content"
            );


        container.html(`
            <div class="kp-review-error">

                <div class="kp-review-error-icon">
                    ${icon}
                </div>

                <div>
                    ${text}
                </div>

                ${
                    showSettingsAction
                        ? `
                            <div
                                class="kp-review-error-action selector"
                                id="kp-review-open-settings"
                            >
                                Открыть настройки
                            </div>
                        `
                        : ""
                }

            </div>
        `);


        if (showSettingsAction) {
            container
                .find("#kp-review-open-settings")
                .on("hover:enter click", function () {
                    Lampa.Modal.close();
                    openPluginSettings();
                });
        }
    }


    // =========================================================
    // ЗАГРУЗКА СТРАНИЦЫ
    // =========================================================

    async function loadReviewPage(
        page
    ) {
        if (!reviewsModal) {
            return;
        }


        const container =
            reviewsModal.find(
                "#kp-reviews-content"
            );


        container.html(`
            <div class="kp-review-loading">
                Загрузка рецензий...
            </div>
        `);


        try {
            const data =
                await getReviews(
                    currentKinopoiskId,
                    page,
                    currentOrder
                );


            const items =
                data.items ||
                data.reviews ||
                [];


            totalPages =
                Number(
                    data.totalPages ||
                    data.pages ||
                    1
                );


            const total =
                Number(
                    data.total ||
                    items.length ||
                    0
                );


            currentPage =
                page;


            if (!items.length) {
                container.html(`
                    <div class="kp-review-empty">
                        Рецензий на этой странице нет.
                    </div>
                `);

                return;
            }


            let html = `
                <div class="kp-reviews-toolbar">

                    <select
                        class="kp-review-filter selector"
                        id="kp-review-order"
                    >

                        <option
                            value="DATE_DESC"
                            ${
                                currentOrder ===
                                "DATE_DESC"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Новые
                        </option>

                        <option
                            value="DATE_ASC"
                            ${
                                currentOrder ===
                                "DATE_ASC"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Старые
                        </option>

                        <option
                            value="USER_POSITIVE_RATING_DESC"
                            ${
                                currentOrder ===
                                "USER_POSITIVE_RATING_DESC"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Больше положительных
                        </option>

                        <option
                            value="USER_NEGATIVE_RATING_DESC"
                            ${
                                currentOrder ===
                                "USER_NEGATIVE_RATING_DESC"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Больше отрицательных
                        </option>

                    </select>

                    <div class="kp-reviews-count">
                        Всего: ${total}
                    </div>

                </div>
            `;


            html += items
                .map(
                    renderReview
                )
                .join("");


            html += `
                <div class="kp-review-pagination">

                    <button
                        class="kp-review-page-button selector"
                        id="kp-review-prev"
                        ${
                            currentPage <= 1
                                ? "disabled"
                                : ""
                        }
                    >
                        ←
                    </button>

                    <div class="kp-review-page-number">
                        ${currentPage} / ${totalPages}
                    </div>

                    <button
                        class="kp-review-page-button selector"
                        id="kp-review-next"
                        ${
                            currentPage >=
                            totalPages
                                ? "disabled"
                                : ""
                        }
                    >
                        →
                    </button>

                </div>
            `;


            container.html(
                html
            );


            // =================================================
            // СОРТИРОВКА
            // =================================================

            container
                .find(
                    "#kp-review-order"
                )
                .on(
                    "change",
                    function () {

                        currentOrder =
                            this.value;

                        loadReviewPage(
                            1
                        );
                    }
                );


            // =================================================
            // НАЗАД
            // =================================================

            container
                .find(
                    "#kp-review-prev"
                )
                .on(
                    "hover:enter click",
                    function () {

                        if (
                            currentPage <=
                            1
                        ) {
                            return;
                        }

                        loadReviewPage(
                            currentPage -
                            1
                        );
                    }
                );


            // =================================================
            // ВПЕРЁД
            // =================================================

            container
                .find(
                    "#kp-review-next"
                )
                .on(
                    "hover:enter click",
                    function () {

                        if (
                            currentPage >=
                            totalPages
                        ) {
                            return;
                        }

                        loadReviewPage(
                            currentPage +
                            1
                        );
                    }
                );

        } catch (error) {
            console.error(
                "[KP Reviews] Review page error:",
                error
            );

            renderError(
                error
            );
        }
    }


    // =========================================================
    // ОТКРЫТИЕ РЕЦЕНЗИЙ
    // =========================================================

    async function openReviews(
        movie
    ) {
        currentMovie =
            movie;


        currentKinopoiskId =
            null;


        currentPage =
            1;


        currentOrder =
            "DATE_DESC";


        createModal();


        if (!hasApiKey()) {
            renderError(new Error("NO_API_KEY"));
            return;
        }


        try {
            Lampa.Loading.start();


            currentKinopoiskId =
                await findKinopoiskId(
                    movie
                );


            console.log(
                "[KP Reviews] Kinopoisk ID:",
                currentKinopoiskId
            );


            await loadReviewPage(
                1
            );

        } catch (error) {
            console.error(
                "[KP Reviews] Open error:",
                error
            );

            renderError(
                error
            );

        } finally {
            Lampa.Loading.stop();
        }
    }


    // =========================================================
    // ЗАПУСК ПЛАГИНА
    // =========================================================

    function startPlugin() {
        if (
            window.kinopoisk_reviews_plugin
        ) {
            return;
        }


        window.kinopoisk_reviews_plugin =
            true;


        // Регистрируем пункт в общих настройках Lampa
        if (window.appready) {
            setupSettings();
        } else {
            Lampa.Listener.follow(
                "app",
                function (e) {
                    if (
                        e.type ===
                        "ready"
                    ) {
                        setupSettings();
                    }
                }
            );
        }


        Lampa.Listener.follow(
            "full",
            function (e) {

                if (
                    e.type !==
                    "complite"
                ) {
                    return;
                }


                const movie =
                    e.data &&
                    e.data.movie;


                if (!movie) {
                    return;
                }


                // Удаляем старую кнопку
                $(".button--kp-reviews").remove();


                // =================================================
                // Кнопка "Рецензии"
                // =================================================

                $(".full-start-new__buttons")
                    .append(
                        `
                        <div
                            class="
                                full-start__button
                                selector
                                button--kp-reviews
                            "
                        >

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="512"
                                height="512"
                                viewBox="0 0 512 512"
                            >

                                <path
                                    fill="currentColor"
                                    d="
                                    M256 32
                                    C132.3 32 32 122.1 32 233.2
                                    c0 63.1 33.2 119.6 85.5 157.2
                                    L96 480l92.8-55.2
                                    c21.1 6.7 43.7 10.4 67.2 10.4
                                    123.7 0 224-90.1 224-201.9
                                    C480 122.1 379.7 32 256 32z

                                    M154 268
                                    c-19.9 0-36-16.1-36-36
                                    s16.1-36 36-36
                                    36 16.1 36 36
                                    -16.1 36-36 36z

                                    M256 268
                                    c-19.9 0-36-16.1-36-36
                                    s16.1-36 36-36
                                    36 16.1 36 36
                                    -16.1 36-36 36z

                                    M358 268
                                    c-19.9 0-36-16.1-36-36
                                    s16.1-36 36-36
                                    36 16.1 36 36
                                    -16.1 36-36 36z
                                    "
                                />

                            </svg>

                            <span>
                                Рецензии
                            </span>

                        </div>
                        `
                    );


                // =================================================
                // Нажатие
                // =================================================

                $(".button--kp-reviews")
                    .on(
                        "hover:enter",
                        function () {

                            openReviews(
                                movie
                            );

                        }
                    );

            }
        );
    }


    // =========================================================
    // START
    // =========================================================

    startPlugin();

})();
