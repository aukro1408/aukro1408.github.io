(function () {
    "use strict";

    /*
     * LAMPA — FILMIX COMMENTS V9
     * Реальные комментарии через существующий Worker.
     */

    const PLUGIN_FLAG = "filmix_comments_real_v9";
    const BUTTON_CLASS = "button--filmix-comments-v9";
    const STYLE_ID = "filmix-comments-real-v9-style";
    const WORKER = "https://rezka-comments-proxy.aukro1408.workers.dev";

    let pathCache = {};

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getMovieTitle(movie) {
        return String(
            movie && (
                movie.title ||
                movie.name ||
                movie.original_title ||
                movie.original_name
            ) || "Комментарии"
        ).trim();
    }

    function getMovieYear(movie) {
        if (!movie) return "";
        return String(
            movie.release_date ||
            movie.first_air_date ||
            movie.year ||
            movie.release_year ||
            ""
        ).slice(0, 4);
    }

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/ё/g, "е")
            .replace(/[^\\p{L}\\p{N}]+/gu, " ")
            .replace(/\\s+/g, " ")
            .trim();
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            .fcv9-container {
                --fcv9-accent: #4f8cff;
                --fcv9-bg: #131316;
                --fcv9-card: linear-gradient(165deg,#252529,#1a1a1d);
                --fcv9-card-hover: linear-gradient(165deg,#2b2b30,#1e1e22);
                --fcv9-border: rgba(255,255,255,.075);
                box-sizing:border-box;
                width:100%;
                padding:4px 12px 34px;
                background:var(--fcv9-bg);
                border-radius:20px;
            }
            .fcv9-container *,.fcv9-container *::before,.fcv9-container *::after{box-sizing:border-box}
            .fcv9-header{
                display:flex;align-items:center;justify-content:space-between;
                gap:12px;padding:8px 4px 18px;
            }
            .fcv9-header-title{color:#fff;font-size:20px;line-height:1.2;font-weight:800;letter-spacing:-.02em}
            .fcv9-header-count{
                flex:0 0 auto;padding:7px 12px;border-radius:999px;
                background:var(--fcv9-accent);color:#fff;font-size:12px;font-weight:800;
                box-shadow:0 7px 18px rgba(79,140,255,.25);
            }
            .fcv9-subtitle{padding:0 4px 16px;color:rgba(255,255,255,.48);font-size:12px}
            .fcv9-list{width:100%}
            .fcv9-comment{
                position:relative;width:100%;margin:0 0 13px;
                padding:18px 18px 20px 18px;
                background:var(--fcv9-card);border:1px solid var(--fcv9-border);
                border-radius:18px;overflow:hidden;text-align:left !important;
                box-shadow:0 12px 28px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.035);
                transition:transform .16s ease,background .16s ease,border-color .16s ease,box-shadow .16s ease;
            }
            .fcv9-comment::before{
                content:"";position:absolute;left:0;top:0;bottom:0;width:5px;
                border-radius:0 8px 8px 0;
                background:linear-gradient(180deg,#4f8cff 0%,#7c5cff 18%,#c45cff 34%,#ff4fa3 50%,#ff6b6b 64%,#ffbd4a 78%,#45d483 90%,#4f8cff 100%);
                background-size:100% 260%;
                animation:filmixCommentsRainbowV9 4s ease-in-out infinite;
                box-shadow:0 0 8px rgba(79,140,255,.55),0 0 18px rgba(196,92,255,.28);
                pointer-events:none;z-index:2;
            }
            @keyframes filmixCommentsRainbowV9{
                0%{background-position:0 0%;filter:hue-rotate(0deg)}
                50%{background-position:0 100%;filter:hue-rotate(20deg)}
                100%{background-position:0 0%;filter:hue-rotate(0deg)}
            }
            .fcv9-comment.focus,.fcv9-comment:hover{
                transform:translateY(-2px) scale(1.003);
                background:var(--fcv9-card-hover);border-color:rgba(79,140,255,.3);
                box-shadow:0 18px 34px rgba(0,0,0,.44),0 0 0 1px rgba(79,140,255,.05);
            }
            .fcv9-text{
                display:block;width:100%;margin:0;padding:0 !important;
                color:#dedee2;font-size:15px;line-height:1.58;
                word-break:break-word;white-space:pre-wrap;text-align:left !important;
            }
            .fcv9-state{padding:36px 18px;color:#aaa;text-align:center;font-size:14px;line-height:1.5}
            .fcv9-error{color:#ff8c9a}
            .fcv9-footer{padding:10px 4px 0;color:rgba(255,255,255,.20);text-align:left;font-size:10px}
            .button--filmix-comments-v9 svg{width:22px;height:22px;margin-right:7px;fill:currentColor}
        `;
        document.head.appendChild(style);
    }

    function cleanPath(value) {
        if (!value) return null;
        try {
            const u = new URL(value, "https://filmix.gg");
            const p = u.pathname;
            const m = p.match(/^\/(seria|film|multfilm|multserial|anime)\/([^/]+)\/(\d+)(?:-[^/]+)?(?:\.html)?$/i);
            if (!m) return null;
            return `/${m[1]}/${m[2]}/${m[3]}/commentary`;
        } catch (e) {
            return null;
        }
    }

    function findPathInObject(movie) {
        const keys = [
            "filmix_path","filmixPath","filmix_url","filmixUrl","filmix_link","filmixLink",
            "url","link","href","source_url","sourceUrl","watch_url","watchUrl"
        ];
        for (const key of keys) {
            const value = movie && movie[key];
            const path = cleanPath(value);
            if (path) return path;
        }
        return null;
    }

    function pickSearchResult(html, title, year) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const wanted = normalize(title);
        const anchors = Array.from(doc.querySelectorAll("a[href]"));
        const candidates = [];

        for (const a of anchors) {
            const href = a.getAttribute("href") || "";
            const path = cleanPath(href);
            if (!path) continue;

            const text = normalize(a.textContent || "");
            const attrs = normalize(
                (a.getAttribute("title") || "") + " " +
                (a.getAttribute("data-title") || "") + " " + href
            );

            let score = 0;
            if (text === wanted) score += 100;
            if (attrs.includes(wanted)) score += 40;
            if (wanted && text.includes(wanted)) score += 20;
            if (year && (text.includes(year) || attrs.includes(year))) score += 5;

            if (score > 0) candidates.push({ path, score });
        }

        candidates.sort((a,b) => b.score - a.score);
        return candidates.length ? candidates[0].path : null;
    }

    async function resolveFilmixPath(movie) {
        const direct = findPathInObject(movie);
        if (direct) return direct;

        const title = getMovieTitle(movie);
        const year = getMovieYear(movie);
        const cacheKey = normalize(title) + "|" + year;
        if (pathCache[cacheKey]) return pathCache[cacheKey];

        /* Известный тестовый фильм, для которого мы уже проверили Worker. */
        if (normalize(title) === normalize("Извне") && year === "2022") {
            const known = "/seria/drama/157434/commentary";
            pathCache[cacheKey] = known;
            return known;
        }

        const searchPath = "/search/?story=" + encodeURIComponent(title);
        const testUrl = WORKER + "/filmix-test?path=" + encodeURIComponent(searchPath);
        const response = await fetch(testUrl, { method:"GET", cache:"no-store" });
        if (!response.ok) throw new Error("Поиск Filmix: HTTP " + response.status);

        const html = await response.text();
        const path = pickSearchResult(html, title, year);
        if (!path) throw new Error("Фильм не найден на Filmix: " + title);

        pathCache[cacheKey] = path;
        return path;
    }

    async function fetchComments(movie) {
        const path = await resolveFilmixPath(movie);
        const url = WORKER + "/comments?path=" + encodeURIComponent(path);
        const response = await fetch(url, { method:"GET", cache:"no-store" });

        let data = null;
        try { data = await response.json(); } catch (e) {}

        if (!response.ok || !data || data.success !== true) {
            const message = data && data.message ? data.message : ("HTTP " + response.status);
            throw new Error(message);
        }

        const items = Array.isArray(data.items) ? data.items : [];
        return { items, path };
    }

    function renderLoading(movie) {
        const title = getMovieTitle(movie);
        return `
            <div class="fcv9-container">
                <div class="fcv9-header">
                    <div class="fcv9-header-title">Комментарии</div>
                </div>
                <div class="fcv9-subtitle">${escapeHtml(title)}</div>
                <div class="fcv9-state">Загрузка комментариев…</div>
            </div>
        `;
    }

    function renderError(movie, error) {
        const title = getMovieTitle(movie);
        return `
            <div class="fcv9-container">
                <div class="fcv9-header">
                    <div class="fcv9-header-title">Комментарии</div>
                </div>
                <div class="fcv9-subtitle">${escapeHtml(title)}</div>
                <div class="fcv9-state fcv9-error">Не удалось загрузить комментарии.<br>${escapeHtml(error && error.message || "Ошибка")}</div>
            </div>
        `;
    }

    function renderComments(movie, items) {
        const title = getMovieTitle(movie);
        let html = `
            <div class="fcv9-container">
                <div class="fcv9-header">
                    <div class="fcv9-header-title">Комментарии</div>
                    <div class="fcv9-header-count">${items.length}</div>
                </div>
                <div class="fcv9-subtitle">${escapeHtml(title)}</div>
                <div class="fcv9-list">
        `;

        if (!items.length) {
            html += `<div class="fcv9-state">Комментариев пока нет</div>`;
        } else {
            items.forEach(function(item) {
                const text = typeof item === "string" ? item : (item && item.text) || "";
                if (!text.trim()) return;
                html += `
                    <div class="fcv9-comment selector" tabindex="0">
                        <div class="fcv9-text">${escapeHtml(text)}</div>
                    </div>
                `;
            });
        }

        html += `</div><div class="fcv9-footer">Filmix</div></div>`;
        return html;
    }

    function openComments(movie) {
        addStyles();

        const modalHtml = $(renderLoading(movie));
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

        fetchComments(movie)
            .then(function(result) {
                const html = $(renderComments(movie, result.items));
                modalHtml.replaceWith(html);
                bindSelectors(html);
            })
            .catch(function(error) {
                console.error("[Filmix Comments V9]", error);
                const html = $(renderError(movie, error));
                modalHtml.replaceWith(html);
                bindSelectors(html);
            });
    }

    function bindSelectors(root) {
        root.find(".selector").on("hover:enter", function() { $(this).addClass("focus"); });
        root.find(".selector").on("hover:leave", function() { $(this).removeClass("focus"); });
    }

    function addButton(movie) {
        $("." + BUTTON_CLASS).remove();

        const button = $(`
            <div class="full-start__button selector ${BUTTON_CLASS}">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4.5A2.5 2.5 0 0 0 17.5 2h-11A2.5 2.5 0 0 0 4 4.5v8A2.5 2.5 0 0 0 6.5 15H9l-3.5 4 5.5-4h6.5a2.5 2.5 0 0 0 2.5-2.5v-8z"/>
                    <circle cx="9" cy="8.5" r="1"/><circle cx="12" cy="8.5" r="1"/><circle cx="15" cy="8.5" r="1"/>
                </svg>
                <span>Комментарии</span>
            </div>
        `);

        $(".full-start-new__buttons").append(button);
        button.on("hover:enter", function() { openComments(movie); });
        button.on("click", function() { openComments(movie); });
    }

    function startPlugin() {
        if (window[PLUGIN_FLAG]) return;
        window[PLUGIN_FLAG] = true;

        addStyles();

        Lampa.Listener.follow("full", function(event) {
            if (event.type !== "complite") return;
            const movie = event.data && event.data.movie;
            if (!movie) return;
            addButton(movie);
        });
    }

    startPlugin();
})();
