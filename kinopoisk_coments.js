(function () {
    "use strict";

    // =========================================================
    // НАСТРОЙКИ
    // =========================================================

    const API_BASE = "https://kinopoiskapiunofficial.tech";

    // Твой API-ключ
    const API_KEY = "f38bbe41-5146-49e0-b828-d3a9afc76344";

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
                        "X-API-KEY": API_KEY,
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
                        <span>
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
        // Разрешаем только базовые безопасные теги

        let value =
            String(text)
                .replace(
                    /<script[\s\S]*?<\/script>/gi,
                    ""
                )
                .replace(
                    /<iframe[\s\S]*?<\/iframe>/gi,
                    ""
                );


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
                padding: 0 10px 30px;
            }

            .kp-reviews-toolbar {
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }

            .kp-review-filter {
                background: #252525;
                color: #ddd;
                border: 1px solid #3a3a3a;
                border-radius: 8px;
                padding: 8px 10px;
                font-size: 13px;
                outline: none;
            }

            .kp-reviews-count {
                margin-left: auto;
                opacity: .65;
                font-size: 12px;
            }

            .kp-review {
                background: #1b1b1b;
                border: 1px solid #2c2c2c;
                border-radius: 10px;
                padding: 13px;
                margin-bottom: 10px;
            }

            .kp-review.kp-positive {
                border-left: 3px solid #4caf50;
            }

            .kp-review.kp-negative {
                border-left: 3px solid #f44336;
            }

            .kp-review.kp-neutral {
                border-left: 3px solid #999;
            }

            .kp-review-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 10px;
            }

            .kp-review-user {
                display: flex;
                align-items: center;
                min-width: 0;
            }

            .kp-review-avatar-wrap {
                width: 42px;
                height: 42px;
                flex-shrink: 0;
                margin-right: 10px;
            }

            .kp-review-avatar,
            .kp-review-avatar-placeholder {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                object-fit: cover;
                background: #303030;
            }

            .kp-review-avatar-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 19px;
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
            }

            .kp-review-date {
                color: #888;
                font-size: 11px;
                margin-top: 2px;
            }

            .kp-review-type {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 11px;
                opacity: .8;
                white-space: nowrap;
            }

            .kp-review-title {
                color: #fff;
                font-weight: 600;
                font-size: 16px;
                line-height: 1.3;
                margin-bottom: 8px;
            }

            .kp-review-text {
                color: #d2d2d2;
                font-size: 14px;
                line-height: 1.55;
                word-break: break-word;
            }

            .kp-review-text a {
                color: #8bbcff;
            }

            .kp-review-pagination {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                margin-top: 18px;
                padding-bottom: 10px;
            }

            .kp-review-page-button {
                background: #292929;
                border: 1px solid #3d3d3d;
                color: #fff;
                border-radius: 8px;
                min-width: 42px;
                height: 38px;
                cursor: pointer;
                font-size: 16px;
            }

            .kp-review-page-button:disabled {
                opacity: .3;
                cursor: default;
            }

            .kp-review-page-number {
                color: #ddd;
                font-size: 13px;
            }

            .kp-review-loading {
                text-align: center;
                padding: 45px 20px;
                color: #aaa;
            }

            .kp-review-error {
                text-align: center;
                padding: 35px 20px;
                color: #ddd;
                line-height: 1.5;
            }

            .kp-review-error-icon {
                font-size: 34px;
                margin-bottom: 12px;
            }

            .kp-review-empty {
                text-align: center;
                padding: 45px 20px;
                color: #999;
            }

            .kp-reviews-footer {
                text-align: center;
                opacity: .45;
                font-size: 10px;
                padding: 10px 0 20px;
            }

        `;


        document.head.appendChild(
            style
        );
    }


    // =========================================================
    // СОЗДАНИЕ MODAL
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


        if (
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

            </div>
        `);
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
                $(".button--kp-reviews")
                    .remove();


                // =================================================
                // Добавляем кнопку
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
