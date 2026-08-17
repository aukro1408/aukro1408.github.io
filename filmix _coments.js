/* ===== Filmix Comments V11 — поиск Filmix как в online_mod.js ===== */
(function () {
    'use strict';

    const PLUGIN_FLAG = 'filmix_comments_v11';
    const BUTTON_CLASS = 'button--filmix-comments-v11';
    const STYLE_ID = 'filmix-comments-v11-style';

    // Worker тот же, который использовался в V8.
    const WORKER_URL = 'https://rezka-comments-proxy.aukro1408.workers.dev/';

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function cleanText(value) {
        return String(value == null ? '' : value)
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;|&#x27;/gi, "'")
            .replace(/&amp;/gi, '&')
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
    }

    function getMovieTitle(movie) {
        return String(
            (movie && (
                movie.title ||
                movie.name ||
                movie.original_title ||
                movie.original_name
            )) || 'Комментарии'
        ).trim();
    }

    function getMovieOriginalTitle(movie) {
        return String(
            (movie && (
                movie.original_title ||
                movie.original_name ||
                movie.nameOriginal
            )) || ''
        ).trim();
    }

    function getMovieYear(movie) {
        const date = movie && (
            movie.release_date ||
            movie.first_air_date ||
            movie.last_air_date ||
            movie.year
        );

        const match = String(date || '').match(/\b(\d{4})\b/);
        return match ? Number(match[1]) : 0;
    }

    function isSeries(movie) {
        const type = String((movie && (
            movie.type ||
            movie.media_type ||
            movie.category ||
            movie.object_type
        )) || '').toLowerCase();

        return (
            type.includes('tv') ||
            type.includes('serial') ||
            type.includes('serie') ||
            type.includes('show') ||
            type.includes('сериал') ||
            !!(movie && (
                movie.number_of_seasons ||
                movie.seasons ||
                movie.season
            ))
        );
    }

    function getMovieGenres(movie) {
        const raw = movie && (movie.genres || movie.genre);
        const result = [];

        if (Array.isArray(raw)) {
            raw.forEach(function (g) {
                const value = typeof g === 'string'
                    ? g
                    : (g && (g.name || g.title || ''));
                if (value) result.push(String(value));
            });
        } else if (raw) {
            result.push(String(raw));
        }

        return result;
    }

    function normalizeTitle(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/ё/g, 'е')
            .replace(/&amp;/g, '&')
            .replace(/[«»"'`]/g, '')
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function titleVariants(movie) {
        const values = [];

        function add(value) {
            value = String(value || '').trim();
            if (value && values.indexOf(value) === -1) values.push(value);
        }

        add(movie && movie.title);
        add(movie && movie.name);
        add(movie && movie.original_title);
        add(movie && movie.original_name);
        add(movie && movie.nameOriginal);

        const alternatives = movie &&
            movie.alternative_titles &&
            movie.alternative_titles.results;

        if (Array.isArray(alternatives)) {
            alternatives.forEach(function (item) {
                add(item && (item.title || item.name));
            });
        }

        return values;
    }

    function buildSearchQueries(movie) {
        const values = [];
        const seen = new Set();

        function add(value) {
            value = cleanText(value);
            if (!value) return;
            const key = normalizeTitle(value);
            if (!key || seen.has(key)) return;
            seen.add(key);
            values.push(value);
        }

        // Основной запрос — ровно как в Filmix online_mod:
        // object.search || object.movie.title
        add(getMovieTitle(movie));

        // Дополнительно пробуем оригинальное название.
        add(getMovieOriginalTitle(movie));

        // И альтернативные названия Lampa.
        const alternatives = movie &&
            movie.alternative_titles &&
            movie.alternative_titles.results;

        if (Array.isArray(alternatives)) {
            alternatives.forEach(function (item) {
                add(item && (item.title || item.name));
            });
        }

        return values.slice(0, 5);
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .fcv11-container {
                box-sizing:border-box;
                width:100%;
                padding:4px 12px 34px;
                background:#292929;
                border-radius:20px;
            }
            .fcv11-container *, .fcv11-container *::before, .fcv11-container *::after {
                box-sizing:border-box;
            }
            .fcv11-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                padding:8px 4px 18px;
            }
            .fcv11-header-title {
                color:#fff;
                font-size:20px;
                line-height:1.2;
                font-weight:800;
                letter-spacing:-.02em;
            }
            .fcv11-header-count {
                min-width:42px;
                padding:7px 12px;
                border-radius:999px;
                background:#4f8cff;
                color:#fff;
                text-align:center;
                font-size:12px;
                font-weight:800;
                box-shadow:0 7px 18px rgba(79,140,255,.24);
            }
            .fcv11-subtitle {
                padding:0 4px 16px;
                color:rgba(255,255,255,.48);
                font-size:12px;
            }
            .fcv11-comment {
                position:relative;
                margin:0 0 13px;
                padding:20px 18px 20px 28px;
                background:linear-gradient(165deg,#252529,#1a1a1d);
                border:1px solid rgba(255,255,255,.075);
                border-radius:18px;
                overflow:hidden;
                box-shadow:0 12px 28px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.035);
                transition:transform .16s ease,background .16s ease,border-color .16s ease,box-shadow .16s ease;
            }
            .fcv11-comment::before {
                content:"";
                position:absolute;
                left:0;
                top:0;
                bottom:0;
                width:6px;
                border-radius:0 8px 8px 0;
                background:linear-gradient(180deg,#4f8cff 0%,#7c5cff 16%,#c45cff 32%,#ff4fa3 48%,#ff6b6b 64%,#ffbd4a 80%,#45d483 92%,#4f8cff 100%);
                background-size:100% 260%;
                animation:fcv11Rainbow 3.6s ease-in-out infinite;
                box-shadow:0 0 8px rgba(79,140,255,.55),0 0 18px rgba(196,92,255,.30);
                pointer-events:none;
                z-index:2;
            }
            @keyframes fcv11Rainbow {
                0%{background-position:0 0%;filter:hue-rotate(0deg)}
                50%{background-position:0 100%;filter:hue-rotate(22deg)}
                100%{background-position:0 0%;filter:hue-rotate(0deg)}
            }
            .fcv11-comment.focus,.fcv11-comment:hover {
                transform:translateY(-2px) scale(1.003);
                background:linear-gradient(165deg,#2b2b30,#1e1e22);
                border-color:rgba(79,140,255,.25);
                box-shadow:0 18px 34px rgba(0,0,0,.44),0 0 0 1px rgba(79,140,255,.05);
            }
            .fcv11-text {
                display:block;
                margin:0!important;
                padding:0!important;
                color:#e7e7eb;
                text-align:left!important;
                font-size:16px;
                line-height:1.58;
                word-break:break-word;
                overflow-wrap:anywhere;
                white-space:pre-wrap;
            }
            .fcv11-empty,.fcv11-error {
                padding:45px 20px;
                color:rgba(255,255,255,.58);
                text-align:center;
                line-height:1.5;
            }
            .fcv11-error { color:#ff8f8f; }
            .button--filmix-comments-v11 svg {
                width:22px;height:22px;margin-right:7px;fill:currentColor;
            }
        `;
        document.head.appendChild(style);
    }

    function renderComments(title, comments) {
        let html = `
            <div class="fcv11-container">
                <div class="fcv11-header">
                    <div class="fcv11-header-title">Комментарии</div>
                    <div class="fcv11-header-count">${comments.length}</div>
                </div>
                <div class="fcv11-subtitle">${escapeHtml(title)}</div>
        `;

        if (!comments.length) {
            html += '<div class="fcv11-empty">Комментариев пока нет</div>';
        } else {
            comments.forEach(function (comment) {
                html += `
                    <div class="fcv11-comment selector" tabindex="0">
                        <div class="fcv11-text">${escapeHtml(comment)}</div>
                    </div>
                `;
            });
        }

        return html + '</div>';
    }

    function normalizeComments(data) {
        if (!data || !Array.isArray(data.items)) return [];

        const result = [];
        const seen = new Set();

        data.items.forEach(function (item) {
            let text = '';

            if (typeof item === 'string') {
                text = item;
            } else if (item && typeof item === 'object') {
                text =
                    item.text ||
                    item.comment ||
                    item.description ||
                    item.body ||
                    item.content ||
                    '';
            }

            text = cleanText(text);
            if (!text) return;

            // Убираем явный служебный мусор.
            if (/^(ответ|reply|ответить|цитата|цитировать)$/i.test(text)) return;
            if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}(?:\s+\d{1,2}:\d{2})?$/.test(text)) return;

            const key = normalizeTitle(text);
            if (!key || seen.has(key)) return;

            seen.add(key);
            result.push(text);
        });

        return result;
    }

    async function loadComments(movie) {
        const title = getMovieTitle(movie);
        const original = getMovieOriginalTitle(movie);
        const year = getMovieYear(movie);

        const params = new URLSearchParams({
            title: title,
            original: original,
            year: year ? String(year) : '',
            type: isSeries(movie) ? 'series' : 'movie',
            genres: getMovieGenres(movie).join('|')
        });

        const url = WORKER_URL + 'comments?' + params.toString();

        console.log('[Filmix Comments V11] Search:', {
            title,
            original,
            year,
            type: isSeries(movie) ? 'series' : 'movie',
            url
        });

        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store'
        });

        const data = await response.json().catch(function () {
            return null;
        });

        if (!response.ok || !data || data.success !== true) {
            throw new Error(
                data && data.message
                    ? data.message
                    : 'Worker HTTP ' + response.status
            );
        }

        const comments = normalizeComments(data);

        console.log('[Filmix Comments V11] Matched:', data.matched);
        console.log('[Filmix Comments V11] Comments:', comments.length);

        return comments;
    }

    function openComments(movie) {
        addStyles();

        const title = getMovieTitle(movie);

        const loading = $(`
            <div class="fcv11-container">
                <div class="fcv11-header">
                    <div class="fcv11-header-title">Комментарии</div>
                    <div class="fcv11-header-count">…</div>
                </div>
                <div class="fcv11-subtitle">${escapeHtml(title)}</div>
                <div class="fcv11-empty">Ищем фильм на Filmix…</div>
            </div>
        `);

        Lampa.Modal.open({
            title:'Комментарии',
            html:loading,
            size:'large',
            style:'margin-top:10px;',
            mask:true,
            onBack:function(){
                Lampa.Modal.close();
                $('.modal--large').remove();
                Lampa.Controller.toggle('content');
            }
        });

        loadComments(movie).then(function(comments){
            const modalHtml = $(renderComments(title, comments));
            loading.replaceWith(modalHtml);

            modalHtml.find('.selector').on('hover:enter',function(){
                $(this).addClass('focus');
            });

            modalHtml.find('.selector').on('hover:leave',function(){
                $(this).removeClass('focus');
            });
        }).catch(function(error){
            console.error('[Filmix Comments V11]', error);

            loading.replaceWith($(`
                <div class="fcv11-container">
                    <div class="fcv11-header">
                        <div class="fcv11-header-title">Комментарии</div>
                        <div class="fcv11-header-count">!</div>
                    </div>
                    <div class="fcv11-subtitle">${escapeHtml(title)}</div>
                    <div class="fcv11-error">
                        Не удалось загрузить комментарии
                    </div>
                </div>
            `));
        });
    }

    function addButton(movie) {
        $('.button--filmix-comments-v11').remove();

        const button = $(`
            <div class="full-start__button selector ${BUTTON_CLASS}">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4.5A2.5 2.5 0 0 0 17.5 2h-11A2.5 2.5 0 0 0 4 4.5v8A2.5 2.5 0 0 0 6.5 15H9l-3.5 4 5.5-4h6.5a2.5 2.5 0 0 0 2.5-2.5v-8z"/>
                    <circle cx="9" cy="8.5" r="1"/>
                    <circle cx="12" cy="8.5" r="1"/>
                    <circle cx="15" cy="8.5" r="1"/>
                </svg>
                <span>Комментарии</span>
            </div>
        `);

        $('.full-start-new__buttons').append(button);

        button.on('hover:enter',function(){
            openComments(movie);
        });

        button.on('click',function(){
            openComments(movie);
        });
    }

    function startPlugin() {
        if (window[PLUGIN_FLAG]) return;
        window[PLUGIN_FLAG] = true;

        addStyles();

        Lampa.Listener.follow('full',function(event){
            if (event.type !== 'complite') return;

            const movie = event.data && event.data.movie;
            if (!movie) return;

            addButton(movie);
        });
    }

    startPlugin();
})();
