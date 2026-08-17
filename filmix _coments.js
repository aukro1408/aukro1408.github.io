(function () {
    "use strict";

    /*
     * ============================================================
     * LAMPA — COMMENTS UI V8
     * ------------------------------------------------------------
     * Реальные комментарии Filmix через наш Cloudflare Worker.
     * ============================================================
     */

    const PLUGIN_FLAG = "filmix_comments_ui_v8";
    const BUTTON_CLASS = "button--filmix-comments-v8";
    const STYLE_ID = "filmix-comments-ui-v8-style";
    const PROXY_URL = "https://rezka-comments-proxy.aukro1408.workers.dev";

    // ------------------------------------------------------------
    // Тестовые комментарии.
    // В дальнейшем этот массив можно будет заменить реальными
    // данными Filmix, не меняя сам интерфейс.
    // ------------------------------------------------------------

    const COMMENTS = [];

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getMovieTitle(movie) {
        if (!movie) return "Комментарии";

        return (
            movie.title ||
            movie.name ||
            movie.original_title ||
            movie.original_name ||
            "Комментарии"
        ).trim();
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            .fcv7-container {
                --fcv7-accent: #4f8cff;
                --fcv7-accent-soft: rgba(79, 140, 255, .14);
                --fcv7-bg: #131316;
                --fcv7-card: linear-gradient(165deg, #252529, #1a1a1d);
                --fcv7-card-hover: linear-gradient(165deg, #2b2b30, #1e1e22);
                --fcv7-border: rgba(255,255,255,.075);
                --fcv7-text: #f2f2f4;
                --fcv7-muted: rgba(255,255,255,.48);

                box-sizing: border-box;
                width: 100%;
                padding: 4px 12px 34px;
                background: var(--fcv7-bg);
                border-radius: 20px;
            }

            .fcv7-container *,
            .fcv7-container *::before,
            .fcv7-container *::after {
                box-sizing: border-box;
            }

            .fcv7-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 8px 4px 18px;
            }

            .fcv7-header-title {
                color: #fff;
                font-size: 20px;
                line-height: 1.2;
                font-weight: 800;
                letter-spacing: -.02em;
            }

            .fcv7-header-count {
                flex: 0 0 auto;
                padding: 7px 12px;
                border-radius: 999px;
                background: var(--fcv7-accent);
                color: #19120a;
                font-size: 12px;
                font-weight: 800;
                box-shadow: 0 7px 18px rgba(255,152,0,.25);
            }

            .fcv7-subtitle {
                padding: 0 4px 16px;
                color: var(--fcv7-muted);
                font-size: 12px;
            }

            .fcv7-comment {
                position: relative;
                margin: 0 0 13px;
                padding: 22px 20px 22px 24px;
                background: var(--fcv7-card);
                border: 1px solid var(--fcv7-border);
                border-radius: 18px;
                overflow: hidden;
                box-shadow:
                    0 12px 28px rgba(0,0,0,.34),
                    inset 0 1px 0 rgba(255,255,255,.035);
                transition:
                    transform .16s ease,
                    background .16s ease,
                    border-color .16s ease,
                    box-shadow .16s ease;
            }

            /* Полоска начинается строго от верхнего края карточки. */
            .fcv7-comment::before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 5px;
                border-radius: 0 5px 5px 0;
                background: linear-gradient(180deg,
                    #5b8cff 0%,
                    #8b5cf6 18%,
                    #ec4899 36%,
                    #ff4d6d 52%,
                    #ffb020 68%,
                    #35d07f 84%,
                    #5b8cff 100%);
                background-size: 100% 280%;
                animation: fcv7RainbowFlow 4.5s linear infinite;
                box-shadow:
                    0 0 10px rgba(91,140,255,.5),
                    0 0 20px rgba(236,72,153,.24);
                pointer-events: none;
                z-index: 2;
            }

            @keyframes fcv7RainbowFlow {
                0% { background-position: 0 0%; }
                50% { background-position: 0 100%; }
                100% { background-position: 0 0%; }
            }

            .fcv7-comment.focus,
            .fcv7-comment:hover {
                transform: translateY(-2px) scale(1.003);
                background: var(--fcv7-card-hover);
                border-color: rgba(255,152,0,.3);
                box-shadow:
                    0 18px 34px rgba(0,0,0,.44),
                    0 0 0 1px rgba(255,152,0,.05);
            }

            .fcv7-text {
                color: #dedee2;
                text-align: left !important;
                font-size: 15px;
                line-height: 1.58;
                word-break: break-word;
                white-space: pre-wrap;
            }

            .fcv7-footer {
                padding: 10px 4px 0;
                color: rgba(255,255,255,.26);
                text-align: left;
                font-size: 10px;
            }

            .fcv7-empty {
                padding: 45px 20px;
                color: #aaa;
                text-align: left;
            }

            .button--filmix-comments-v8 svg {
                width: 22px;
                height: 22px;
                margin-right: 7px;
                fill: currentColor;
            }
        `;

        document.head.appendChild(style);
    }

    function renderComments(movie, comments) {
        const title = getMovieTitle(movie);
        const list = Array.isArray(comments) ? comments : [];

        let html = `
            <div class="fcv7-container">
                <div class="fcv7-header">
                    <div class="fcv7-header-title">Комментарии</div>
                    <div class="fcv7-header-count">${list.length}</div>
                </div>

                <div class="fcv7-subtitle">
                    ${escapeHtml(title)}
                </div>
        `;

        if (!list.length) {
            html += `
                <div class="fcv7-empty">
                    Комментариев пока нет
                </div>
            `;
        } else {
            list.forEach(function (item) {
                const text = typeof item === 'string' ? item : (item && item.text) || '';
                if (!text.trim()) return;

                html += `
                    <div class="fcv7-comment selector" tabindex="0">
                        <div class="fcv7-text">${escapeHtml(text)}</div>
                    </div>
                `;
            });
        }

        html += `
                <div class="fcv7-footer"></div>
            </div>
        `;

        return html;
    }

    function getMovieYear(movie) {
        if (!movie) return '';
        const value = movie.release_date || movie.first_air_date || movie.year || '';
        const match = String(value).match(/\d{4}/);
        return match ? match[0] : '';
    }

    function isSerial(movie) {
        return !!(movie && (
            movie.name ||
            movie.first_air_date ||
            movie.number_of_seasons ||
            movie.number_of_episodes
        ));
    }

    async function loadComments(movie, done, fail) {
        const title = getMovieTitle(movie);
        const originalTitle = movie && (movie.original_title || movie.original_name) || '';
        const year = getMovieYear(movie);
        const serial = isSerial(movie) ? '1' : '0';

        const params = new URLSearchParams();
        if (title) params.set('title', title);
        if (originalTitle) params.set('original_title', originalTitle);
        if (year) params.set('year', year);
        params.set('serial', serial);

        const url = PROXY_URL + '/comments?' + params.toString();
        const controller = typeof AbortController !== 'undefined'
            ? new AbortController()
            : null;
        const timer = setTimeout(function () {
            if (controller) controller.abort();
        }, 20000);

        try {
            // Используем обычный fetch вместо Lampa.Reguest.
            // Worker уже отдаёт CORS-заголовки, поэтому это надёжнее
            // для Android/WebView и не зависит от внутреннего парсера Lampa.
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-store',
                signal: controller ? controller.signal : undefined
            });

            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }

            const data = await response.json();

            if (!data || !data.success) {
                throw new Error(
                    data && (data.message || data.error)
                        ? (data.message || data.error)
                        : 'Не удалось получить комментарии'
                );
            }

            const items = Array.isArray(data.items) ? data.items : [];

            // Worker уже отдаёт чистые тексты. На всякий случай
            // отбрасываем пустые элементы прямо на стороне плагина.
            const comments = items
                .map(function (item) {
                    return typeof item === 'string'
                        ? { text: item }
                        : item;
                })
                .filter(function (item) {
                    return item && String(item.text || '').trim();
                });

            done(comments);
        } catch (error) {
            const message = error && error.name === 'AbortError'
                ? 'Таймаут подключения к серверу комментариев'
                : (error && error.message) || 'Не удалось подключиться к серверу комментариев';

            fail(message);
        } finally {
            clearTimeout(timer);
        }
    }

    function openComments(movie) {
        addStyles();

        Lampa.Loading.start();

        loadComments(movie, function (comments) {
            Lampa.Loading.stop();

            const modalHtml = $(renderComments(movie, comments));

            Lampa.Modal.open({
                title: "Комментарии",
                html: modalHtml,
                size: "large",
                style: "margin-top:10px;",
                mask: true,

                onBack: function () {
                    Lampa.Modal.close();
                    $(".modal--large").remove();
                    Lampa.Controller.toggle("content");
                }
            });

            modalHtml.find(".selector").on("hover:enter", function () {
                $(this).addClass("focus");
            });

            modalHtml.find(".selector").on("hover:leave", function () {
                $(this).removeClass("focus");
            });
        }, function (message) {
            Lampa.Loading.stop();
            Lampa.Noty.show(message);
        });
    }

    function addButton(movie) {
        $(".button--filmix-comments-v8").remove();

        const button = $(`
            <div class="
                full-start__button
                selector
                ${BUTTON_CLASS}
            ">
                <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="
                        M20 4.5A2.5 2.5 0 0 0 17.5 2h-11
                        A2.5 2.5 0 0 0 4 4.5v8A2.5 2.5 0 0 0 6.5 15H9l-3.5 4
                        5.5-4h6.5a2.5 2.5 0 0 0 2.5-2.5v-8z
                    "/>
                    <circle cx="9" cy="8.5" r="1"/>
                    <circle cx="12" cy="8.5" r="1"/>
                    <circle cx="15" cy="8.5" r="1"/>
                </svg>
                <span>Комментарии</span>
            </div>
        `);

        $(".full-start-new__buttons").append(button);

        button.on("hover:enter", function () {
            openComments(movie);
        });

        // Для некоторых версий Lampa обычный click тоже полезен.
        button.on("click", function () {
            openComments(movie);
        });
    }

    function startPlugin() {
        if (window[PLUGIN_FLAG]) return;
        window[PLUGIN_FLAG] = true;

        addStyles();

        Lampa.Listener.follow("full", function (event) {
            if (event.type !== "complite") return;

            const movie = event.data && event.data.movie;
            if (!movie) return;

            addButton(movie);
        });
    }

    startPlugin();

})();
