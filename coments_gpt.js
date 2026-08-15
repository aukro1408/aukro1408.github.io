(function () {
    "use strict";

    // =========================================================
    // НАСТРОЙКИ
    // =========================================================

    const API_BASE = "https://kinopoiskapiunofficial.tech";

    const API_KEY_STORAGE = "kp_reviews_api_key";

    const SPOILER_SETTING = "kp_reviews_hide_spoilers";

    const CACHE_KEY = "lampa_kinopoisk_review_ids";

    const REVIEWS_PER_PAGE = 20;

    const COLLAPSE_THRESHOLD = 420;

    // =========================================================
    // ТВОЙ API-КЛЮЧ
    // =========================================================
    //
    // Используется только если ключ не сохранён в настройках.
    // Для локального использования оставляем его здесь.
    //
    const DEFAULT_API_KEY =
        "f38bbe41-5146-49e0-b828-d3a9afc76344";


    // =========================================================
    // СОРТИРОВКА
    // =========================================================

    const ORDER_OPTIONS = [
        {
            value: "DATE_DESC",
            label: "Новые"
        },

        {
            value: "DATE_ASC",
            label: "Старые"
        },

        {
            value: "USER_POSITIVE_RATING_DESC",
            label: "Больше положительных"
        },

        {
            value: "USER_NEGATIVE_RATING_DESC",
            label: "Больше отрицательных"
        }
    ];


    // =========================================================
    // КОМПОНЕНТ НАСТРОЕК
    // =========================================================

    const SETTINGS_COMPONENT =
        "kp_reviews_settings";


    // =========================================================
    // СОСТОЯНИЕ
    // =========================================================

    let currentMovie = null;

    let currentKinopoiskId = null;

    let currentPage = 1;

    let currentOrder =
        "DATE_DESC";

    let totalPages = 1;

    let reviewsModal = null;


    // =========================================================
    // ОБЩИЕ ФУНКЦИИ
    // =========================================================

    function escapeHtml(value) {
        return String(
            value == null
                ? ""
                : value
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    function getStorage(
        key,
        fallback
    ) {
        try {
            const value =
                Lampa.Storage.get(
                    key,
                    fallback
                );

            return value == null
                ? fallback
                : value;

        } catch (e) {
            return fallback;
        }
    }


    function setStorage(
        key,
        value
    ) {
        try {
            Lampa.Storage.set(
                key,
                value
            );

        } catch (e) {
            console.error(
                "[KP Reviews] Storage error:",
                e
            );
        }
    }


    // =========================================================
    // API KEY
    // =========================================================

    function getApiKey() {

        const stored =
            String(
                getStorage(
                    API_KEY_STORAGE,
                    ""
                ) || ""
            ).trim();


        if (stored) {
            return stored;
        }


        return DEFAULT_API_KEY;
    }


    function hasApiKey() {
        return !!getApiKey();
    }


    // =========================================================
    // НАСТРОЙКА СПОЙЛЕРОВ
    // =========================================================

    function getHideSpoilers() {

        const value =
            getStorage(
                SPOILER_SETTING,
                true
            );


        if (
            value === false ||
            value === 0 ||
            value === "false" ||
            value === "0"
        ) {
            return false;
        }


        return true;
    }


    // =========================================================
    // ИНФОРМАЦИЯ О ФИЛЬМЕ
    // =========================================================

    function getMovieTitle(
        movie
    ) {
        if (!movie) {
            return "";
        }


        return (
            movie.title ||
            movie.name ||
            movie.original_title ||
            movie.original_name ||
            ""
        ).trim();
    }


    function getMovieYear(
        movie
    ) {
        if (!movie) {
            return "";
        }


        const date =
            movie.release_date ||
            movie.first_air_date ||
            "";


        if (date) {
            return String(
                date
            ).slice(0, 4);
        }


        if (movie.year) {
            return String(
                movie.year
            ).slice(0, 4);
        }


        return "";
    }


    function getMovieAlternativeTitle(
        movie
    ) {
        if (!movie) {
            return "";
        }


        return (
            movie.original_title ||
            movie.original_name ||
            movie.title ||
            movie.name ||
            ""
        ).trim();
    }


    // =========================================================
    // НОРМАЛИЗАЦИЯ НАЗВАНИЯ
    // =========================================================

    function normalizeString(
        value
    ) {
        return String(
            value || ""
        )
            .toLowerCase()
            .replace(
                /ё/g,
                "е"
            )
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
    // КЭШ TMDB -> KINOPOISK
    // =========================================================

    function loadCache() {

        try {

            const raw =
                localStorage.getItem(
                    CACHE_KEY
                );


            return raw
                ? JSON.parse(raw)
                : {};

        } catch (e) {

            return {};
        }
    }


    function saveCache(
        cache
    ) {

        try {

            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify(
                    cache
                )
            );

        } catch (e) {

            console.error(
                "[KP Reviews] Cache save error:",
                e
            );
        }
    }


    function getCachedKinopoiskId(
        movie
    ) {

        if (
            !movie ||
            !movie.id
        ) {
            return null;
        }


        const cache =
            loadCache();


        return (
            cache[
                String(
                    movie.id
                )
            ] || null
        );
    }


    function saveKinopoiskId(
        movie,
        id
    ) {

        if (
            !movie ||
            !movie.id ||
            !id
        ) {
            return;
        }


        const cache =
            loadCache();


        cache[
            String(
                movie.id
            )
        ] =
            Number(id);


        saveCache(
            cache
        );
    }


    // =========================================================
    // API ЗАПРОС
    // =========================================================

    async function kpFetch(
        path
    ) {

        const apiKey =
            getApiKey();


        if (!apiKey) {
            throw new Error(
                "NO_API_KEY"
            );
        }


        let response;


        try {

            response =
                await fetch(
                    API_BASE + path,
                    {
                        method: "GET",

                        headers: {
                            "X-API-KEY":
                                apiKey,

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        }
                    }
                );

        } catch (e) {

            console.error(
                "[KP Reviews] Fetch error:",
                e
            );

            throw new Error(
                "CORS_ERROR"
            );
        }


        if (
            response.status ===
            401
        ) {
            throw new Error(
                "INVALID_KEY"
            );
        }


        if (
            response.status ===
            402
        ) {
            throw new Error(
                "LIMIT_EXCEEDED"
            );
        }


        if (
            response.status ===
            429
        ) {
            throw new Error(
                "TOO_MANY_REQUESTS"
            );
        }


        if (
            !response.ok
        ) {
            throw new Error(
                "HTTP_" +
                response.status
            );
        }


        return await response.json();
    }


    // =========================================================
    // ПОИСК ФИЛЬМА В KINOPOISK
    // =========================================================

    async function searchKinopoisk(
        keyword,
        year
    ) {

        if (!keyword) {
            return null;
        }


        const url =
            "/api/v2.1/films/search-by-keyword" +
            "?keyword=" +
            encodeURIComponent(
                keyword
            ) +
            "&page=1";


        const data =
            await kpFetch(
                url
            );


        const films =
            data.films ||
            data.items ||
            data.results ||
            [];


        if (
            !films.length
        ) {
            return null;
        }


        const normalizedKeyword =
            normalizeString(
                keyword
            );


        // =====================================================
        // ТОЧНОЕ НАЗВАНИЕ + ГОД
        // =====================================================

        let candidates =
            films.filter(
                function (
                    film
                ) {

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
                            function (
                                name
                            ) {
                                return (
                                    name ===
                                    normalizedKeyword
                                );
                            }
                        );


                    if (
                        !titleMatches
                    ) {
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
                        String(
                            year
                        )
                    );
                }
            );


        // =====================================================
        // ТОЛЬКО ТОЧНОЕ НАЗВАНИЕ
        // =====================================================

        if (
            !candidates.length
        ) {

            candidates =
                films.filter(
                    function (
                        film
                    ) {

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
                            function (
                                name
                            ) {
                                return (
                                    name ===
                                    normalizedKeyword
                                );
                            }
                        );
                    }
                );
        }


        // =====================================================
        // ЕСЛИ НИЧЕГО НЕ НАШЛИ — ПЕРВЫЙ РЕЗУЛЬТАТ
        // =====================================================

        if (
            !candidates.length
        ) {
            candidates =
                films;
        }


        const film =
            candidates[0];


        if (!film) {
            return null;
        }


        const id =
            film.kinopoiskId ||
            film.filmId ||
            film.kinopoisk_id ||
            film.id;


        return id
            ? Number(id)
            : null;
    }


    // =========================================================
    // ПОЛУЧЕНИЕ KINOPOISK ID
    // =========================================================

    async function findKinopoiskId(
        movie
    ) {

        // -----------------------------------------------------
        // Сначала проверяем кэш
        // -----------------------------------------------------

        const cached =
            getCachedKinopoiskId(
                movie
            );


        if (cached) {
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


        // -----------------------------------------------------
        // Поиск по названию
        // -----------------------------------------------------

        let id =
            await searchKinopoisk(
                title,
                year
            );


        // -----------------------------------------------------
        // Если не нашли — оригинальное название
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
    // ПОЛУЧЕНИЕ РЕЦЕНЗИЙ
    // =========================================================

    async function getReviews(
        kinopoiskId,
        page,
        order
    ) {

        const url =
            "/api/v2.2/films/" +
            encodeURIComponent(
                kinopoiskId
            ) +
            "/reviews" +
            "?page=" +
            page +
            "&order=" +
            encodeURIComponent(
                order
            );


        return await kpFetch(
            url
        );
    }


    // =========================================================
    // ТИП РЕЦЕНЗИИ
    // =========================================================

    function getReviewType(
        type
    ) {

        const value =
            String(
                type || ""
            ).toUpperCase();


        if (
            value ===
            "POSITIVE"
        ) {

            return {
                icon: "👍",
                text:
                    "Положительная",
                className:
                    "kp-positive"
            };
        }


        if (
            value ===
            "NEGATIVE"
        ) {

            return {
                icon: "👎",
                text:
                    "Отрицательная",
                className:
                    "kp-negative"
            };
        }


        return {
            icon: "😐",
            text:
                "Нейтральная",
            className:
                "kp-neutral"
        };
    }


    // =========================================================
    // АВАТАР
    // =========================================================

    function getAvatar(
        review
    ) {

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
    // ДАТА
    // =========================================================

    function formatDate(
        date
    ) {

        if (!date) {
            return "";
        }


        try {

            const d =
                new Date(
                    date
                );


            if (
                Number.isNaN(
                    d.getTime()
                )
            ) {
                return String(
                    date
                );
            }


            return d.toLocaleDateString(
                "ru-RU",
                {
                    day:
                        "2-digit",

                    month:
                        "long",

                    year:
                        "numeric"
                }
            );

        } catch (e) {

            return String(
                date
            );
        }
    }


    // =========================================================
    // ПРОВЕРКА СПОЙЛЕРА
    // =========================================================
    //
    // ВАЖНО:
    //
    // Никакого анализа текста.
    //
    // Мы проверяем только явные поля,
    // которые пришли от API.
    //
    // Если API не прислал флаг —
    // рецензия НЕ считается спойлером.
    //
    // =========================================================

    function apiSaysSpoiler(
        review
    ) {

        if (
            !review ||
            typeof review !==
                "object"
        ) {
            return false;
        }


        const fields = [

            review.spoiler,

            review.isSpoiler,

            review.hasSpoiler,

            review.containsSpoiler

        ];


        return fields.some(
            function (
                value
            ) {

                return (
                    value === true ||
                    value === 1 ||
                    value === "true" ||
                    value === "TRUE"
                );
            }
        );
    }


    // =========================================================
    // ФОРМАТИРОВАНИЕ ТЕКСТА
    // =========================================================

    function formatReviewText(
        text
    ) {

        if (!text) {
            return (
                "Текст рецензии отсутствует."
            );
        }


        const raw =
            String(
                text
            );


        const allowed = [
            "b",
            "i",
            "em",
            "strong",
            "br"
        ];


        let value =
            escapeHtml(
                raw
            );


        allowed.forEach(
            function (
                tag
            ) {

                const openRe =
                    new RegExp(
                        "&lt;" +
                        tag +
                        "&gt;",
                        "gi"
                    );


                const closeRe =
                    new RegExp(
                        "&lt;\\/" +
                        tag +
                        "&gt;",
                        "gi"
                    );


                value =
                    value
                        .replace(
                            openRe,
                            "<" +
                            tag +
                            ">"
                        )
                        .replace(
                            closeRe,
                            "</" +
                            tag +
                            ">"
                        );
            }
        );


        return value.replace(
            /\r?\n/g,
            "<br>"
        );
    }


    // =========================================================
    // РЕНДЕР ОДНОЙ РЕЦЕНЗИИ
    // =========================================================

    function renderReview(
        review,
        index
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


        // =====================================================
        // СПОЙЛЕР
        // =====================================================

        const isSpoiler =
            apiSaysSpoiler(
                review
            );


        const hideSpoiler =
            getHideSpoilers();


        const spoilerHidden =
            isSpoiler &&
            hideSpoiler;


        // =====================================================
        // АВАТАР
        // =====================================================

        let avatarHtml;


        if (avatar) {

            let avatarUrl =
                avatar;


            if (
                avatar.startsWith(
                    "/"
                )
            ) {

                avatarUrl =
                    API_BASE +
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
                <div
                    class="kp-review-avatar-placeholder"
                >
                    👤
                </div>
            `;
        }


        // =====================================================
        // ДЛИННАЯ РЕЦЕНЗИЯ
        // =====================================================

        const longText =
            description.length >
            COLLAPSE_THRESHOLD;


        const textId =
            "kp-review-text-" +
            index;


        const toggleId =
            "kp-review-toggle-" +
            index;


        // =====================================================
        // ТЕКСТ / СПОЙЛЕР
        // =====================================================

        let bodyHtml;


        if (
            spoilerHidden
        ) {

            bodyHtml = `

                <div
                    class="kp-spoiler-wrap"
                    id="kp-spoiler-${index}"
                >

                    <div
                        class="kp-spoiler-cover"
                    >

                        <div
                            class="kp-spoiler-icon"
                        >
                            ⚠
                        </div>


                        <div
                            class="kp-spoiler-title"
                        >
                            Спойлер
                        </div>


                        <div
                            class="kp-spoiler-subtitle"
                        >
                            В рецензии есть спойлеры
                        </div>


                        <div
                            class="kp-spoiler-button selector"
                            data-spoiler-target="${index}"
                        >
                            Показать спойлер
                        </div>

                    </div>


                    <div
                        class="kp-spoiler-content"
                    >
                        ${formatReviewText(
                            description
                        )}
                    </div>

                </div>
            `;

        } else {

            bodyHtml = `

                <div
                    class="kp-review-text-wrap"
                >

                    <div
                        class="
                            kp-review-text
                            ${
                                longText
                                    ? "is-collapsed"
                                    : ""
                            }
                        "
                        id="${textId}"
                    >
                        ${formatReviewText(
                            description
                        )}
                    </div>


                    ${
                        longText
                            ? `
                                <div
                                    class="
                                        kp-review-toggle
                                        selector
                                    "
                                    id="${toggleId}"
                                    data-target="${textId}"
                                >
                                    Читать полностью
                                </div>
                            `
                            : ""
                    }

                </div>
            `;
        }


        // =====================================================
        // КАРТОЧКА
        // =====================================================

        return `

            <article
                class="
                    kp-review
                    ${type.className}
                    ${
                        spoilerHidden
                            ? "has-spoiler"
                            : ""
                    }
                "
            >

                <div
                    class="kp-review-top"
                >

                    <div
                        class="kp-review-user"
                    >

                        <div
                            class="kp-review-avatar-wrap"
                        >
                            ${avatarHtml}
                        </div>


                        <div
                            class="kp-review-user-info"
                        >

                            <div
                                class="kp-review-author"
                            >
                                ${escapeHtml(
                                    author
                                )}
                            </div>


                            <div
                                class="kp-review-date"
                            >
                                ${escapeHtml(
                                    date
                                )}
                            </div>

                        </div>

                    </div>


                    <div
                        class="kp-review-type"
                    >

                        <span
                            class="kp-review-type-icon"
                        >
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
                            <div
                                class="kp-review-title"
                            >
                                ${escapeHtml(
                                    title
                                )}
                            </div>
                        `
                        : ""
                }


                ${bodyHtml}

            </article>
        `;
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

                --kp-accent:
                    #ff9800;

                --kp-accent-2:
                    #ffb74d;

                --kp-page-bg:
                    #131316;

                --kp-card-bg:
                    linear-gradient(
                        165deg,
                        #232327,
                        #1a1a1d
                    );

                --kp-border:
                    rgba(
                        255,
                        255,
                        255,
                        .07
                    );

                padding:
                    6px 12px 34px;

                background:
                    var(
                        --kp-page-bg
                    );

                border-radius:
                    20px;
            }


            /* =================================================
               TOOLBAR
               ================================================= */

            .kp-reviews-toolbar {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    12px;

                margin-bottom:
                    20px;

                padding:
                    12px 14px;

                flex-wrap:
                    wrap;

                background:
                    linear-gradient(
                        165deg,
                        #232327,
                        #1c1c20
                    );

                border:
                    1px solid
                    var(--kp-border);

                border-radius:
                    16px;

                box-shadow:
                    0 10px 26px
                    rgba(
                        0,
                        0,
                        0,
                        .35
                    );
            }


            /* =================================================
               SORT
               ================================================= */

            .kp-review-sort {
                position:
                    relative;
            }


            .kp-review-sort-trigger {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    8px;

                padding:
                    10px 14px;

                border-radius:
                    12px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .05
                    );

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        .1
                    );

                color:
                    #eee;

                font-size:
                    13px;

                font-weight:
                    600;

                cursor:
                    pointer;

                transition:
                    .15s ease;
            }


            .kp-review-sort-trigger.focus,
            .kp-review-sort-trigger:hover {

                border-color:
                    var(--kp-accent);

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .08
                    );

                transform:
                    translateY(
                        -1px
                    );
            }


            .kp-review-sort-arrow {

                color:
                    var(--kp-accent);

                transition:
                    transform
                    .18s ease;
            }


            .kp-review-sort.is-open
            .kp-review-sort-arrow {

                transform:
                    rotate(
                        180deg
                    );
            }


            .kp-review-sort-list {

                display:
                    none;

                position:
                    absolute;

                top:
                    calc(
                        100% + 8px
                    );

                left:
                    0;

                min-width:
                    240px;

                z-index:
                    50;

                padding:
                    6px;

                background:
                    linear-gradient(
                        165deg,
                        #29292e,
                        #1c1c20
                    );

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        .1
                    );

                border-radius:
                    16px;

                box-shadow:
                    0 20px 40px
                    rgba(
                        0,
                        0,
                        0,
                        .55
                    );
            }


            .kp-review-sort.is-open
            .kp-review-sort-list {

                display:
                    block;

                animation:
                    kp-menu-in
                    .18s ease
                    both;
            }


            .kp-review-sort-item {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                padding:
                    11px 12px;

                border-radius:
                    10px;

                color:
                    #ddd;

                font-size:
                    13px;

                cursor:
                    pointer;

                transition:
                    .12s ease;
            }


            .kp-review-sort-item.focus,
            .kp-review-sort-item:hover {

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .08
                    );

                color:
                    #fff;
            }


            .kp-review-sort-item.is-active {

                color:
                    var(--kp-accent-2);

                font-weight:
                    700;
            }


            .kp-review-sort-item.is-active::after {

                content:
                    "";

                width:
                    8px;

                height:
                    8px;

                border-radius:
                    50%;

                background:
                    var(--kp-accent);

                box-shadow:
                    0 0 8px
                    var(--kp-accent);
            }


            .kp-reviews-count {

                margin-left:
                    auto;

                padding:
                    8px 15px;

                border-radius:
                    999px;

                background:
                    linear-gradient(
                        135deg,
                        var(--kp-accent),
                        #e65100
                    );

                color:
                    #fff;

                font-size:
                    12px;

                font-weight:
                    700;

                box-shadow:
                    0 6px 14px
                    rgba(
                        255,
                        152,
                        0,
                        .28
                    );
            }


            /* =================================================
               REVIEW CARD
               ================================================= */

            .kp-review {

                position:
                    relative;

                margin-bottom:
                    16px;

                padding:
                    18px
                    18px
                    17px
                    21px;

                background:
                    var(
                        --kp-card-bg
                    );

                border:
                    1px solid
                    var(--kp-border);

                border-radius:
                    20px;

                box-shadow:
                    0 14px 30px
                    rgba(
                        0,
                        0,
                        0,
                        .4
                    );

                overflow:
                    hidden;

                animation:
                    kp-review-in
                    .3s ease
                    both;
            }


            .kp-review::before {

                content:
                    "";

                position:
                    absolute;

                left:
                    0;

                top:
                    16px;

                bottom:
                    16px;

                width:
                    3px;

                border-radius:
                    0 4px
                    4px 0;
            }


            .kp-review.kp-positive::before {
                background:
                    #4caf50;
            }


            .kp-review.kp-negative::before {
                background:
                    #f44336;
            }


            .kp-review.kp-neutral::before {
                background:
                    #8c8c8c;
            }


            .kp-review-top {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                gap:
                    12px;

                margin-bottom:
                    12px;
            }


            .kp-review-user {

                display:
                    flex;

                align-items:
                    center;

                min-width:
                    0;
            }


            .kp-review-avatar-wrap {

                width:
                    46px;

                height:
                    46px;

                margin-right:
                    13px;

                flex-shrink:
                    0;
            }


            .kp-review-avatar,
            .kp-review-avatar-placeholder {

                width:
                    46px;

                height:
                    46px;

                border-radius:
                    50%;

                object-fit:
                    cover;

                background:
                    #303034;
            }


            .kp-review-avatar-placeholder {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                font-size:
                    20px;
            }


            .kp-review-user-info {
                min-width:
                    0;
            }


            .kp-review-author {

                color:
                    #fff;

                font-weight:
                    700;

                font-size:
                    14px;

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;
            }


            .kp-review-date {

                margin-top:
                    3px;

                color:
                    rgba(
                        255,
                        255,
                        255,
                        .45
                    );

                font-size:
                    11px;
            }


            .kp-review-type {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    7px;

                padding:
                    7px 12px
                    7px 8px;

                border-radius:
                    999px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .06
                    );

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        .1
                    );

                color:
                    #fff;

                font-size:
                    11px;

                font-weight:
                    700;

                white-space:
                    nowrap;
            }


            .kp-review-type-icon {

                width:
                    20px;

                height:
                    20px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    50%;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .08
                    );
            }


            .kp-review-title {

                margin-bottom:
                    10px;

                color:
                    #fff;

                font-size:
                    16px;

                line-height:
                    1.35;

                font-weight:
                    800;
            }


            /* =================================================
               REVIEW TEXT
               ================================================= */

            .kp-review-text-wrap {
                position:
                    relative;
            }


            .kp-review-text {

                color:
                    #cfcfd2;

                font-size:
                    14px;

                line-height:
                    1.65;

                word-break:
                    break-word;

                transition:
                    max-height
                    .42s
                    cubic-bezier(
                        .2,
                        .7,
                        .2,
                        1
                    );
            }


            .kp-review-text a {

                color:
                    var(
                        --kp-accent-2
                    );
            }


            .kp-review-text.is-collapsed {

                max-height:
                    7.6em;

                overflow:
                    hidden;

                -webkit-mask-image:
                    linear-gradient(
                        180deg,
                        #000 60%,
                        transparent 100%
                    );

                mask-image:
                    linear-gradient(
                        180deg,
                        #000 60%,
                        transparent 100%
                    );
            }


            .kp-review-toggle {

                display:
                    inline-flex;

                align-items:
                    center;

                gap:
                    5px;

                margin-top:
                    12px;

                padding:
                    8px 15px;

                border-radius:
                    999px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .06
                    );

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        .1
                    );

                color:
                    var(
                        --kp-accent-2
                    );

                font-size:
                    12px;

                font-weight:
                    700;

                cursor:
                    pointer;

                transition:
                    .18s ease;
            }


            .kp-review-toggle::after {

                content:
                    "⌄";

                font-size:
                    12px;
            }


            .kp-review-toggle.focus,
            .kp-review-toggle:hover {

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .1
                    );

                border-color:
                    var(
                        --kp-accent
                    );

                transform:
                    translateY(
                        -1px
                    );
            }


            /* =================================================
               SPOILER
               ================================================= */

            .kp-spoiler-wrap {

                position:
                    relative;

                min-height:
                    150px;

                border-radius:
                    15px;

                overflow:
                    hidden;

                background:
                    #171719;

                border:
                    1px solid
                    rgba(
                        255,
                        152,
                        0,
                        .14
                    );
            }


            .kp-spoiler-cover {

                position:
                    relative;

                z-index:
                    2;

                min-height:
                    150px;

                display:
                    flex;

                flex-direction:
                    column;

                align-items:
                    center;

                justify-content:
                    center;

                padding:
                    24px;

                text-align:
                    center;

                background:
                    radial-gradient(
                        circle at 50% 0%,
                        rgba(
                            255,
                            152,
                            0,
                            .16
                        ),
                        transparent 55%
                    ),
                    linear-gradient(
                        165deg,
                        #242426,
                        #151517
                    );

                transition:
                    opacity
                    .3s ease,

                    transform
                    .42s
                    cubic-bezier(
                        .2,
                        .8,
                        .2,
                        1
                    );
            }


            .kp-spoiler-icon {

                width:
                    44px;

                height:
                    44px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                margin-bottom:
                    8px;

                border-radius:
                    50%;

                background:
                    rgba(
                        255,
                        152,
                        0,
                        .12
                    );

                color:
                    #ffb74d;

                font-size:
                    22px;

                animation:
                    kp-spoiler-pulse
                    2s
                    ease-in-out
                    infinite;
            }


            .kp-spoiler-title {

                color:
                    #fff;

                font-size:
                    15px;

                font-weight:
                    800;
            }


            .kp-spoiler-subtitle {

                margin-top:
                    4px;

                color:
                    rgba(
                        255,
                        255,
                        255,
                        .48
                    );

                font-size:
                    11px;
            }


            .kp-spoiler-button {

                margin-top:
                    13px;

                padding:
                    9px 17px;

                border-radius:
                    999px;

                background:
                    linear-gradient(
                        135deg,
                        #ff9800,
                        #e65100
                    );

                color:
                    #fff;

                font-size:
                    12px;

                font-weight:
                    800;

                cursor:
                    pointer;

                box-shadow:
                    0 7px 18px
                    rgba(
                        255,
                        152,
                        0,
                        .25
                    );

                transition:
                    .18s ease;
            }


            .kp-spoiler-button.focus,
            .kp-spoiler-button:hover {

                transform:
                    translateY(
                        -2px
                    )
                    scale(
                        1.02
                    );

                box-shadow:
                    0 11px 24px
                    rgba(
                        255,
                        152,
                        0,
                        .38
                    );
            }


            .kp-spoiler-content {

                position:
                    absolute;

                inset:
                    0;

                z-index:
                    1;

                padding:
                    18px;

                overflow:
                    hidden;

                color:
                    #cfcfd2;

                font-size:
                    14px;

                line-height:
                    1.65;

                filter:
                    blur(
                        14px
                    );

                opacity:
                    .18;

                transform:
                    scale(
                        1.025
                    );

                transition:
                    filter
                    .5s ease,

                    opacity
                    .45s ease,

                    transform
                    .55s ease;
            }


            .kp-spoiler-wrap.is-revealed
            .kp-spoiler-cover {

                opacity:
                    0;

                transform:
                    translateY(
                        -20px
                    )
                    scale(
                        .98
                    );

                pointer-events:
                    none;
            }


            .kp-spoiler-wrap.is-revealed
            .kp-spoiler-content {

                position:
                    relative;

                inset:
                    auto;

                min-height:
                    150px;

                filter:
                    none;

                opacity:
                    1;

                transform:
                    none;
            }


            .kp-spoiler-wrap.is-revealed {

                animation:
                    kp-spoiler-reveal
                    .5s ease
                    both;
            }


            /* =================================================
               PAGINATION
               ================================================= */

            .kp-review-pagination {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                gap:
                    16px;

                margin-top:
                    26px;

                padding:
                    14px;

                background:
                    linear-gradient(
                        165deg,
                        #232327,
                        #1c1c20
                    );

                border:
                    1px solid
                    var(--kp-border);

                border-radius:
                    16px;
            }


            .kp-review-page-button {

                min-width:
                    46px;

                height:
                    42px;

                border-radius:
                    999px;

                background:
                    linear-gradient(
                        165deg,
                        #2c2c31,
                        #202024
                    );

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        .1
                    );

                color:
                    #fff;

                font-size:
                    17px;

                cursor:
                    pointer;

                transition:
                    .18s ease;
            }


            .kp-review-page-button.focus,
            .kp-review-page-button:hover {

                border-color:
                    var(
                        --kp-accent
                    );

                background:
                    linear-gradient(
                        165deg,
                        var(
                            --kp-accent
                        ),
                        #e65100
                    );

                transform:
                    translateY(
                        -2px
                    );
            }


            .kp-review-page-button:disabled {

                opacity:
                    .3;

                transform:
                    none;
            }


            .kp-review-page-number {

                min-width:
                    56px;

                text-align:
                    center;

                color:
                    #fff;

                font-size:
                    13px;

                font-weight:
                    700;
            }


            /* =================================================
               SKELETON
               ================================================= */

            .kp-skeleton-card {

                padding:
                    18px
                    18px
                    17px
                    21px;

                margin-bottom:
                    16px;

                border-radius:
                    20px;

                background:
                    var(
                        --kp-card-bg
                    );

                border:
                    1px solid
                    var(--kp-border);

                box-shadow:
                    0 14px 30px
                    rgba(
                        0,
                        0,
                        0,
                        .4
                    );
            }


            .kp-skeleton-top {

                display:
                    flex;

                gap:
                    13px;

                margin-bottom:
                    16px;
            }


            .kp-skeleton-avatar {

                width:
                    46px;

                height:
                    46px;

                flex-shrink:
                    0;

                border-radius:
                    50%;
            }


            .kp-skeleton-lines {

                flex:
                    1;

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    8px;

                padding-top:
                    5px;
            }


            .kp-skeleton-line,
            .kp-skeleton-avatar {

                background:
                    linear-gradient(
                        100deg,
                        rgba(
                            255,
                            255,
                            255,
                            .06
                        )
                        30%,

                        rgba(
                            255,
                            255,
                            255,
                            .14
                        )
                        50%,

                        rgba(
                            255,
                            255,
                            255,
                            .06
                        )
                        70%
                    );

                background-size:
                    400%
                    100%;

                animation:
                    kp-shimmer
                    1.5s
                    ease
                    infinite;
            }


            .kp-skeleton-line {

                height:
                    10px;

                border-radius:
                    8px;
            }


            .kp-skeleton-line.w-35 {
                width:
                    35%;
            }


            .kp-skeleton-line.w-20 {

                width:
                    20%;

                height:
                    8px;
            }


            .kp-skeleton-body
            .kp-skeleton-line {

                margin-bottom:
                    10px;

                height:
                    11px;
            }


            .kp-skeleton-body
            .kp-skeleton-line:last-child {

                width:
                    65%;
            }


            /* =================================================
               ERROR / EMPTY
               ================================================= */

            .kp-review-loading,
            .kp-review-empty {

                padding:
                    50px 20px;

                text-align:
                    center;

                color:
                    #999;
            }


            .kp-review-error {

                max-width:
                    440px;

                margin:
                    0 auto;

                padding:
                    36px 26px;

                text-align:
                    center;

                color:
                    #ddd;

                line-height:
                    1.55;

                background:
                    linear-gradient(
                        165deg,
                        #232327,
                        #1c1c20
                    );

                border:
                    1px solid
                    var(--kp-border);

                border-radius:
                    20px;

                box-shadow:
                    0 14px 30px
                    rgba(
                        0,
                        0,
                        0,
                        .4
                    );
            }


            .kp-review-error-icon {

                font-size:
                    38px;

                margin-bottom:
                    14px;
            }


            .kp-reviews-footer {

                padding:
                    14px
                    0
                    20px;

                text-align:
                    center;

                color:
                    rgba(
                        255,
                        255,
                        255,
                        .3
                    );

                font-size:
                    10px;

                letter-spacing:
                    .03em;
            }


            /* =================================================
               АНИМАЦИИ
               ================================================= */

            @keyframes kp-review-in {

                from {
                    opacity:
                        0;

                    transform:
                        translateY(
                            10px
                        );
                }

                to {
                    opacity:
                        1;

                    transform:
                        translateY(
                            0
                        );
                }
            }


            @keyframes kp-menu-in {

                from {
                    opacity:
                        0;

                    transform:
                        translateY(
                            -6px
                        )
                        scale(
                            .98
                        );
                }

                to {
                    opacity:
                        1;

                    transform:
                        translateY(
                            0
                        )
                        scale(
                            1
                        );
                }
            }


            @keyframes kp-shimmer {

                0% {
                    background-position:
                        200% 0;
                }

                100% {
                    background-position:
                        -200% 0;
                }
            }


            @keyframes kp-spoiler-pulse {

                0%,
                100% {

                    transform:
                        scale(
                            1
                        );

                    box-shadow:
                        0 0 0 0
                        rgba(
                            255,
                            152,
                            0,
                            0
                        );
                }

                50% {

                    transform:
                        scale(
                            1.06
                        );

                    box-shadow:
                        0 0 0 8px
                        rgba(
                            255,
                            152,
                            0,
                            .06
                        );
                }
            }


            @keyframes kp-spoiler-reveal {

                from {
                    transform:
                        translateY(
                            5px
                        );
                }

                to {
                    transform:
                        translateY(
                            0
                        );
                }
            }


            /* =================================================
               АНИМИРОВАННАЯ ИКОНКА РЕЦЕНЗИЙ
               ================================================= */

            .kp-comment-icon {

                overflow:
                    visible;
            }


            .kp-comment-icon-bubble {

                transform-origin:
                    center;

                animation:
                    kp-icon-breathe
                    2.8s
                    ease-in-out
                    infinite;
            }


            .kp-comment-icon-dot {

                transform-box:
                    fill-box;

                transform-origin:
                    center;
            }


            .kp-comment-icon-dot.dot-1 {

                animation:
                    kp-icon-dot
                    1.35s
                    ease-in-out
                    infinite;
            }


            .kp-comment-icon-dot.dot-2 {

                animation:
                    kp-icon-dot
                    1.35s
                    .18s
                    ease-in-out
                    infinite;
            }


            .kp-comment-icon-dot.dot-3 {

                animation:
                    kp-icon-dot
                    1.35s
                    .36s
                    ease-in-out
                    infinite;
            }


            .button--kp-reviews.focus
            .kp-comment-icon-bubble,
            .button--kp-reviews:hover
            .kp-comment-icon-bubble {

                animation:
                    kp-icon-focus
                    .8s
                    ease-in-out
                    infinite
                    alternate;
            }


            @keyframes kp-icon-breathe {

                0%,
                100% {

                    transform:
                        scale(
                            1
                        );
                }

                50% {

                    transform:
                        scale(
                            1.035
                        );
                }
            }


            @keyframes kp-icon-focus {

                from {

                    transform:
                        scale(
                            1
                        );
                }

                to {

                    transform:
                        scale(
                            1.08
                        );
                }
            }


            @keyframes kp-icon-dot {

                0%,
                100% {

                    transform:
                        translateY(
                            0
                        );

                    opacity:
                        .7;
                }

                35% {

                    transform:
                        translateY(
                            -3px
                        );

                    opacity:
                        1;
                }

                60% {

                    transform:
                        translateY(
                            0
                        );

                    opacity:
                        .8;
                }
            }

        `;


        document.head.appendChild(
            style
        );
    }


    // =========================================================
    // НАСТРОЙКИ LAMPA
    // =========================================================

    function setupSettings() {

        if (
            !Lampa.SettingsApi ||
            !Lampa.SettingsApi.addComponent
        ) {
            return;
        }


        if (
            window.kp_reviews_settings_registered
        ) {
            return;
        }


        window.kp_reviews_settings_registered =
            true;


        // =====================================================
        // КОМПОНЕНТ
        // =====================================================

        Lampa.SettingsApi.addComponent({

            component:
                SETTINGS_COMPONENT,

            name:
                "Рецензии Кинопоиска",

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
                            L3 21
                            l1.9-5.7
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


        // =====================================================
        // ОПИСАНИЕ
        // =====================================================

        Lampa.SettingsApi.addParam({

            component:
                SETTINGS_COMPONENT,

            param: {
                type:
                    "title"
            },

            field: {

                name:
                    "Рецензии зрителей Кинопоиска. API-ключ хранится локально на устройстве."
            }
        });


        // =====================================================
        // API KEY
        // =====================================================

        Lampa.SettingsApi.addParam({

            component:
                SETTINGS_COMPONENT,

            param: {

                name:
                    API_KEY_STORAGE,

                type:
                    "input",

                values:
                    "",

                default:
                    ""
            },

            field: {

                name:
                    "API-ключ Kinopoisk",

                description:
                    "Можно оставить пустым — тогда используется локальный ключ из плагина."
            }
        });


        // =====================================================
        // ТУМБЛЕР СПОЙЛЕРОВ
        // =====================================================

        Lampa.SettingsApi.addParam({

            component:
                SETTINGS_COMPONENT,

            param: {

                name:
                    SPOILER_SETTING,

                type:
                    "toggle",

                default:
                    true
            },

            field: {

                name:
                    "Скрывать спойлеры",

                description:
                    "Скрывать рецензии только если API явно сообщает о наличии спойлера."
            },

            onChange:
                function (
                    value
                ) {

                    const enabled =
                        value === true ||
                        value === 1 ||
                        value === "true" ||
                        value === "1";


                    setStorage(
                        SPOILER_SETTING,
                        enabled
                    );
                }
        });


        // =====================================================
        // ОЧИСТКА КЭША
        // =====================================================

        Lampa.SettingsApi.addParam({

            component:
                SETTINGS_COMPONENT,

            param: {

                name:
                    "kp_reviews_clear_cache",

                type:
                    "button"
            },

            field: {

                name:
                    "Очистить кэш соответствий",

                description:
                    "Используйте, если для фильма подтянулись не те рецензии."
            },

            onChange:
                function () {

                    saveCache(
                        {}
                    );


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


    // =========================================================
    // MODAL
    // =========================================================

    function createModal() {

        addStyles();


        const modal =
            $(`
                <div
                    class="kp-reviews-container"
                >

                    <div
                        id="kp-reviews-content"
                    ></div>


                    <div
                        class="kp-reviews-footer"
                    >
                        Рецензии предоставлены Kinopoisk API
                    </div>

                </div>
            `);


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

                    $(
                        ".modal--large"
                    ).remove();

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
    // ОШИБКИ
    // =========================================================

    function renderError(
        error
    ) {

        let icon =
            "⚠️";


        let text =
            "Не удалось загрузить рецензии.";


        if (
            error.message ===
            "NO_API_KEY"
        ) {

            icon =
                "🔑";

            text =
                "Ключ Kinopoisk API не задан. Откройте Настройки Lampa → «Рецензии Кинопоиска».";
        }


        else if (
            error.message ===
            "CORS_ERROR"
        ) {

            icon =
                "🌐";

            text =
                "Lampa не смогла напрямую обратиться к API Кинопоиска. Это ограничение браузера CORS.";
        }


        else if (
            error.message ===
            "INVALID_KEY"
        ) {

            icon =
                "🔑";

            text =
                "API-ключ Кинопоиска недействителен или отключён.";
        }


        else if (
            error.message ===
            "LIMIT_EXCEEDED"
        ) {

            icon =
                "⏳";

            text =
                "Достигнут дневной лимит запросов Kinopoisk API.";
        }


        else if (
            error.message ===
            "TOO_MANY_REQUESTS"
        ) {

            icon =
                "🐌";

            text =
                "Слишком много запросов. Попробуйте ещё раз через несколько секунд.";
        }


        else if (
            error.message ===
            "FILM_NOT_FOUND"
        ) {

            icon =
                "🔎";

            text =
                "Не удалось найти этот фильм или сериал в Кинопоиске.";
        }


        else if (
            error.message ===
            "TITLE_NOT_FOUND"
        ) {

            icon =
                "🎬";

            text =
                "Не удалось получить название фильма из Lampa.";
        }


        if (!reviewsModal) {
            return;
        }


        const container =
            reviewsModal.find(
                "#kp-reviews-content"
            );


        container.html(`

            <div
                class="kp-review-error"
            >

                <div
                    class="kp-review-error-icon"
                >
                    ${icon}
                </div>


                <div>
                    ${text}
                </div>

            </div>

        `);
    }


    // =========================================================
    // SKELETON
    // =========================================================

    function renderSkeletonCards(
        count
    ) {

        let html =
            "";


        for (
            let i = 0;
            i < count;
            i++
        ) {

            html += `

                <div
                    class="kp-skeleton-card"
                >

                    <div
                        class="kp-skeleton-top"
                    >

                        <div
                            class="kp-skeleton-avatar"
                        ></div>


                        <div
                            class="kp-skeleton-lines"
                        >

                            <div
                                class="
                                    kp-skeleton-line
                                    w-35
                                "
                            ></div>


                            <div
                                class="
                                    kp-skeleton-line
                                    w-20
                                "
                            ></div>

                        </div>

                    </div>


                    <div
                        class="kp-skeleton-body"
                    >

                        <div
                            class="kp-skeleton-line"
                        ></div>

                        <div
                            class="kp-skeleton-line"
                        ></div>

                        <div
                            class="kp-skeleton-line"
                        ></div>

                    </div>

                </div>
            `;
        }


        return html;
    }


    // =========================================================
    // LABEL СОРТИРОВКИ
    // =========================================================

    function getOrderLabel(
        value
    ) {

        const found =
            ORDER_OPTIONS.find(
                function (
                    item
                ) {
                    return (
                        item.value ===
                        value
                    );
                }
            );


        return found
            ? found.label
            : "Новые";
    }


    // =========================================================
    // ЗАГРУЗКА СТРАНИЦЫ
    // =========================================================

    async function loadReviewPage(
        page
    ) {

        if (
            !reviewsModal ||
            !currentKinopoiskId
        ) {
            return;
        }


        const container =
            reviewsModal.find(
                "#kp-reviews-content"
            );


        container.html(
            renderSkeletonCards(
                4
            )
        );


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


            if (
                !items.length
            ) {

                container.html(`

                    <div
                        class="kp-review-empty"
                    >
                        Рецензий на этой странице нет.
                    </div>

                `);

                return;
            }


            // =================================================
            // TOOLBAR
            // =================================================

            let html = `

                <div
                    class="kp-reviews-toolbar"
                >

                    <div
                        class="kp-review-sort"
                        id="kp-review-sort"
                    >

                        <div
                            class="
                                kp-review-sort-trigger
                                selector
                            "
                            id="kp-review-sort-trigger"
                        >

                            <span>
                                ${escapeHtml(
                                    getOrderLabel(
                                        currentOrder
                                    )
                                )}
                            </span>


                            <span
                                class="kp-review-sort-arrow"
                            >
                                ▾
                            </span>

                        </div>


                        <div
                            class="kp-review-sort-list"
                            id="kp-review-sort-list"
                        >

                            ${ORDER_OPTIONS
                                .map(
                                    function (
                                        item
                                    ) {

                                        return `

                                            <div
                                                class="
                                                    kp-review-sort-item
                                                    selector
                                                    ${
                                                        item.value ===
                                                        currentOrder
                                                            ? "is-active"
                                                            : ""
                                                    }
                                                "
                                                data-value="${item.value}"
                                            >

                                                ${escapeHtml(
                                                    item.label
                                                )}

                                            </div>
                                        `;
                                    }
                                )
                                .join("")}

                        </div>

                    </div>


                    <div
                        class="kp-reviews-count"
                    >
                        Всего: ${total}
                    </div>

                </div>

            `;


            // =================================================
            // РЕЦЕНЗИИ
            // =================================================

            html +=
                items
                    .map(
                        renderReview
                    )
                    .join("");


            // =================================================
            // ПАГИНАЦИЯ
            // =================================================

            html += `

                <div
                    class="kp-review-pagination"
                >

                    <button
                        class="
                            kp-review-page-button
                            selector
                        "
                        id="kp-review-prev"

                        ${
                            currentPage <=
                            1
                                ? "disabled"
                                : ""
                        }
                    >
                        ←
                    </button>


                    <div
                        class="kp-review-page-number"
                    >
                        ${currentPage}
                        /
                        ${totalPages}
                    </div>


                    <button
                        class="
                            kp-review-page-button
                            selector
                        "
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
            // ДЛИННЫЕ РЕЦЕНЗИИ
            // =================================================

            container
                .find(
                    ".kp-review-toggle"
                )
                .on(
                    "hover:enter click",
                    function () {

                        const button =
                            $(this);


                        const targetId =
                            button.data(
                                "target"
                            );


                        const textBlock =
                            container.find(
                                "#" +
                                targetId
                            );


                        const collapsed =
                            textBlock.hasClass(
                                "is-collapsed"
                            );


                        textBlock.toggleClass(
                            "is-collapsed"
                        );


                        button.text(
                            collapsed
                                ? "Свернуть"
                                : "Читать полностью"
                        );
                    }
                );


            // =================================================
            // СПОЙЛЕР
            // =================================================

            container
                .find(
                    ".kp-spoiler-button"
                )
                .on(
                    "hover:enter click",
                    function () {

                        const button =
                            $(this);


                        const target =
                            button.data(
                                "spoiler-target"
                            );


                        const wrap =
                            container.find(
                                "#kp-spoiler-" +
                                target
                            );


                        if (
                            !wrap.length
                        ) {
                            return;
                        }


                        wrap.addClass(
                            "is-revealed"
                        );


                        setTimeout(
                            function () {

                                const content =
                                    wrap.find(
                                        ".kp-spoiler-content"
                                    );


                                if (
                                    content.length
                                ) {

                                    content.attr(
                                        "tabindex",
                                        "0"
                                    );
                                }

                            },
                            450
                        );
                    }
                );


            // =================================================
            // СОРТИРОВКА
            // =================================================

            const sortWrap =
                container.find(
                    "#kp-review-sort"
                );


            const sortTrigger =
                container.find(
                    "#kp-review-sort-trigger"
                );


            sortTrigger.on(
                "hover:enter click",
                function () {

                    sortWrap.toggleClass(
                        "is-open"
                    );
                }
            );


            container
                .find(
                    "#kp-review-sort-list .kp-review-sort-item"
                )
                .on(
                    "hover:enter click",
                    function () {

                        const value =
                            $(this).data(
                                "value"
                            );


                        sortWrap.removeClass(
                            "is-open"
                        );


                        if (
                            value ===
                            currentOrder
                        ) {
                            return;
                        }


                        currentOrder =
                            value;


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
                            currentPage >
                            1
                        ) {

                            loadReviewPage(
                                currentPage -
                                1
                            );
                        }
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
                            currentPage <
                            totalPages
                        ) {

                            loadReviewPage(
                                currentPage +
                                1
                            );
                        }
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
    // ОТКРЫТЬ РЕЦЕНЗИИ
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


        totalPages =
            1;


        createModal();


        try {

            Lampa.Loading.start();


            currentKinopoiskId =
                await findKinopoiskId(
                    movie
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
    // АНИМИРОВАННАЯ ИКОНКА
    // =========================================================

    function getCommentIcon() {

        return `

            <svg
                class="kp-comment-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="512"
                height="512"
                viewBox="0 0 512 512"
            >

                <g
                    class="kp-comment-icon-bubble"
                >

                    <path
                        fill="currentColor"
                        d="
                            M256 32
                            C132.3 32 32 122.1
                            32 233.2

                            c0 63.1
                            33.2 119.6
                            85.5 157.2

                            L96 480

                            l92.8-55.2

                            c21.1 6.7
                            43.7 10.4
                            67.2 10.4

                            c123.7 0
                            224-90.1
                            224-201.9

                            C480 122.1
                            379.7 32
                            256 32z
                        "
                    />


                    <circle
                        class="
                            kp-comment-icon-dot
                            dot-1
                        "
                        cx="166"
                        cy="235"
                        r="20"
                        fill="#131316"
                    />


                    <circle
                        class="
                            kp-comment-icon-dot
                            dot-2
                        "
                        cx="256"
                        cy="235"
                        r="20"
                        fill="#131316"
                    />


                    <circle
                        class="
                            kp-comment-icon-dot
                            dot-3
                        "
                        cx="346"
                        cy="235"
                        r="20"
                        fill="#131316"
                    />

                </g>

            </svg>
        `;
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


        // =====================================================
        // НАСТРОЙКИ
        // =====================================================

        if (
            window.appready
        ) {

            setupSettings();

        } else {

            Lampa.Listener.follow(
                "app",
                function (
                    e
                ) {

                    if (
                        e.type ===
                        "ready"
                    ) {

                        setupSettings();
                    }
                }
            );
        }


        // =====================================================
        // СТРАНИЦА ФИЛЬМА
        // =====================================================

        Lampa.Listener.follow(
            "full",
            function (
                e
            ) {

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


                // Удаляем старую кнопку,
                // если Lampa повторно открыла карточку.

                $(
                    ".button--kp-reviews"
                ).remove();


                // =================================================
                // КНОПКА
                // =================================================

                $(
                    ".full-start-new__buttons"
                ).append(`

                    <div
                        class="
                            full-start__button
                            selector
                            button--kp-reviews
                        "
                    >

                        ${getCommentIcon()}


                        <span>
                            Рецензии
                        </span>

                    </div>

                `);


                // =================================================
                // ОТКРЫТИЕ
                // =================================================

                $(
                    ".button--kp-reviews"
                ).on(
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

    addStyles();

    startPlugin();

})();
