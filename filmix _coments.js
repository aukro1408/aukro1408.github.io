/* ===== Filmix Comments V8 — реальные комментарии ===== */
(function () {
    'use strict';

    const PLUGIN_FLAG = 'filmix_comments_v8';
    const BUTTON_CLASS = 'button--filmix-comments-v8';
    const STYLE_ID = 'filmix-comments-v8-style';

    // Текущий рабочий Worker. Слэш в конце оставляем намеренно.
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
            (movie && (movie.title || movie.name || movie.original_title || movie.original_name)) ||
            'Комментарии'
        ).trim();
    }

    // Filmix в Lampa не всегда передаёт готовый URL источника.
    // Поэтому V8 умеет строить путь напрямую из ID фильма/сериала.
    function getMovieId(movie) {
        const values = [
            movie && movie.id,
            movie && movie.tmdb_id,
            movie && movie.tmdbId,
            movie && movie.kinopoisk_id,
            movie && movie.kinopoiskId
        ];

        for (const value of values) {
            if (value !== undefined && value !== null && /^\d+$/.test(String(value).trim())) {
                return String(value).trim();
            }
        }

        return '';
    }

    function findFilmixPath(movie) {
        const visited = new Set();
        const candidates = [];

        function walk(value, depth) {
            if (value == null || depth > 5) return;

            if (typeof value === 'string') {
                const s = value.trim();
                if (/filmix\./i.test(s) || /\/(?:seria|serial|film|movie|show)\//i.test(s)) {
                    candidates.push(s);
                }
                return;
            }

            if (typeof value !== 'object' || visited.has(value)) return;
            visited.add(value);

            Object.keys(value).forEach(function(key) {
                const item = value[key];
                if (/url|href|link|path|source|iframe/i.test(key) || depth < 2) {
                    walk(item, depth + 1);
                }
            });
        }

        walk(movie, 0);

        for (const candidate of candidates) {
            try {
                if (/^https?:\/\//i.test(candidate)) {
                    const url = new URL(candidate);
                    if (/filmix\./i.test(url.hostname)) return url.pathname.replace(/\/$/, '');
                } else if (candidate.startsWith('/')) {
                    const path = candidate.split('?')[0].replace(/\/$/, '');
                    if (/\/(?:seria|serial|film|movie|show)\//i.test(path)) return path;
                }
            } catch (e) {}
        }

        return '';
    }

    // Строим возможные Filmix URL по ID.
    // Для сериалов Filmix использует /seria/<жанр>/<id>/commentary.
    function buildFilmixPaths(movie) {
        const paths = [];
        const seen = new Set();
        const direct = findFilmixPath(movie);
        const id = getMovieId(movie);

        function add(path) {
            if (!path) return;
            path = path.replace(/\/$/, '');
            if (!seen.has(path)) {
                seen.add(path);
                paths.push(path);
            }
        }

        if (direct) add(direct);
        if (!id) return paths;

        const type = String((movie && (movie.type || movie.media_type || movie.category)) || '').toLowerCase();
        const title = getMovieTitle(movie).toLowerCase();
        const isSeries = type.includes('tv') || type.includes('serial') || type.includes('serie') ||
            type.includes('show') || type.includes('сериал') ||
            !!(movie && (movie.number_of_seasons || movie.seasons || movie.season));

        const genres = [];
        const rawGenres = movie && (movie.genres || movie.genre);
        if (Array.isArray(rawGenres)) {
            rawGenres.forEach(function(g) {
                const name = typeof g === 'string' ? g : (g && (g.name || g.title || ''));
                if (name) genres.push(String(name).toLowerCase());
            });
        } else if (typeof rawGenres === 'string') {
            genres.push(rawGenres.toLowerCase());
        }

        const genreMap = {
            'драма':'drama', 'drama':'drama',
            'детектив':'detective', 'детективы':'detective', 'detective':'detective',
            'триллер':'thriller', 'thriller':'thriller',
            'ужасы':'horror', 'ужас':'horror', 'horror':'horror',
            'фантастика':'fantastika', 'fantasy':'fantasy', 'фэнтези':'fantasy',
            'боевик':'boevik', 'action':'boevik',
            'комедия':'comedy', 'comedy':'comedy',
            'мелодрама':'melodrama', 'романтика':'melodrama',
            'криминал':'crime', 'crime':'crime',
            'приключения':'adventure', 'adventure':'adventure',
            'семейный':'family', 'семейное':'family', 'family':'family',
            'мультфильм':'multfilm', 'мультфильмы':'multfilm', 'animation':'multfilm',
            'военный':'voenniy', 'военное':'voenniy',
            'история':'history', 'исторический':'history',
            'музыка':'music', 'music':'music',
            'спорт':'sport', 'sport':'sport'
        };

        const mapped = [];
        genres.forEach(function(g) {
            if (genreMap[g] && mapped.indexOf(genreMap[g]) < 0) mapped.push(genreMap[g]);
        });

        // Для сериалов сначала пробуем жанры из карточки, затем самые частые.
        // Для неизвестного типа также проверяем оба варианта Filmix.
        const seriesGenres = mapped.concat(['drama','detective','thriller','horror','fantastika','comedy','crime','melodrama']);
        const filmGenres = mapped.concat(['drama','thriller','comedy','boevik','fantastika','horror','crime']);
        const list = isSeries ? seriesGenres : filmGenres;

        list.forEach(function(genre) {
            add('/seria/' + genre + '/' + id + '/commentary');
        });

        // Filmix иногда использует /film/ вместо /seria/.
        filmGenres.slice(0, 5).forEach(function(genre) {
            add('/film/' + genre + '/' + id + '/commentary');
        });

        // Последняя попытка: ID без жанра — полезно для нестандартных страниц.
        add('/seria/' + id + '/commentary');
        add('/film/' + id + '/commentary');

        return paths;
    }

    // У Worker уже приходят реальные items, но его универсальный HTML-парсер
    // иногда принимает служебные элементы Filmix за текст комментария.
    function isNoiseComment(text, item) {
        const value = cleanText(text);
        if (!value) return true;

        const author = cleanText(item && (item.author || item.username || item.user));
        if (author && value === author) return true;

        // Дата.
        if (/^\d{1,2}\s+(?:янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)\s+\d{4}(?:\s+\d{1,2}:\d{2})?$/i.test(value)) return true;
        if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}(?:\s+\d{1,2}:\d{2})?$/.test(value)) return true;

        // Голоса / рейтинг.
        if (/^(?:\+?\d+\s*\n?\s*[-−]\s*\d+|\+\d+\s*-\d+|\d+\s*\/\s*\d+)$/i.test(value)) return true;

        // Служебная надпись ответа.
        if (/^(?:ответ|reply|в ответ|ответить|цитата|цитировать)$/i.test(value)) return true;

        return false;
    }

    function normalizeComments(data) {
        if (!data || !Array.isArray(data.items)) return [];

        const result = [];
        const seen = new Set();

        data.items.forEach(function (item) {
            let text = '';

            if (typeof item === 'string') {
                text = item;
                item = {};
            } else if (item && typeof item === 'object') {
                text = item.text || item.comment || item.description || item.body || item.content || '';
            }

            text = cleanText(text);
            if (isNoiseComment(text, item)) return;

            const key = text.toLowerCase().replace(/\s+/g, ' ');
            if (!key || seen.has(key)) return;

            seen.add(key);
            result.push(text);
        });

        return result;
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .fcv8-container {
                box-sizing:border-box;
                width:100%;
                padding:4px 12px 34px;
                background:#292929;
                border-radius:20px;
            }
            .fcv8-container *, .fcv8-container *::before, .fcv8-container *::after {
                box-sizing:border-box;
            }
            .fcv8-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                padding:8px 4px 18px;
            }
            .fcv8-header-title {
                color:#fff;
                font-size:20px;
                line-height:1.2;
                font-weight:800;
                letter-spacing:-.02em;
            }
            .fcv8-header-count {
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
            .fcv8-subtitle {
                padding:0 4px 16px;
                color:rgba(255,255,255,.48);
                font-size:12px;
            }
            .fcv8-comment {
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
            .fcv8-comment::before {
                content:"";
                position:absolute;
                left:0;
                top:0;
                bottom:0;
                width:6px;
                border-radius:0 8px 8px 0;
                background:linear-gradient(180deg,#4f8cff 0%,#7c5cff 16%,#c45cff 32%,#ff4fa3 48%,#ff6b6b 64%,#ffbd4a 80%,#45d483 92%,#4f8cff 100%);
                background-size:100% 260%;
                animation:fcv8Rainbow 3.6s ease-in-out infinite;
                box-shadow:0 0 8px rgba(79,140,255,.55),0 0 18px rgba(196,92,255,.30);
                pointer-events:none;
                z-index:2;
            }
            @keyframes fcv8Rainbow {
                0%{background-position:0 0%;filter:hue-rotate(0deg)}
                50%{background-position:0 100%;filter:hue-rotate(22deg)}
                100%{background-position:0 0%;filter:hue-rotate(0deg)}
            }
            .fcv8-comment.focus,.fcv8-comment:hover {
                transform:translateY(-2px) scale(1.003);
                background:linear-gradient(165deg,#2b2b30,#1e1e22);
                border-color:rgba(79,140,255,.25);
                box-shadow:0 18px 34px rgba(0,0,0,.44),0 0 0 1px rgba(79,140,255,.05);
            }
            .fcv8-text {
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
            .fcv8-empty,.fcv8-error {
                padding:45px 20px;
                color:rgba(255,255,255,.58);
                text-align:center;
                line-height:1.5;
            }
            .fcv8-error { color:#ff8f8f; }
            .button--filmix-comments-v8 svg {
                width:22px;height:22px;margin-right:7px;fill:currentColor;
            }
        `;
        document.head.appendChild(style);
    }

    function renderComments(title, comments) {
        let html = `
            <div class="fcv8-container">
                <div class="fcv8-header">
                    <div class="fcv8-header-title">Комментарии</div>
                    <div class="fcv8-header-count">${comments.length}</div>
                </div>
                <div class="fcv8-subtitle">${escapeHtml(title)}</div>
        `;

        if (!comments.length) {
            html += '<div class="fcv8-empty">Комментариев пока нет</div>';
        } else {
            comments.forEach(function (comment) {
                html += `<div class="fcv8-comment selector" tabindex="0"><div class="fcv8-text">${escapeHtml(comment)}</div></div>`;
            });
        }

        return html + '</div>';
    }

    async function loadComments(movie) {
        const paths = buildFilmixPaths(movie);
        if (!paths.length) throw new Error('Не найден ID текущего фильма');

        let lastError = null;

        for (const path of paths) {
            try {
                const url = WORKER_URL + 'comments?path=' + encodeURIComponent(path);
                const response = await fetch(url, { method:'GET', cache:'no-store' });
                if (!response.ok) {
                    lastError = new Error('Worker HTTP ' + response.status);
                    continue;
                }

                const data = await response.json();
                if (!data || data.success !== true) {
                    lastError = new Error(data && data.message ? data.message : 'Worker вернул ошибку');
                    continue;
                }

                const comments = normalizeComments(data);
                if (comments.length) return comments;

                lastError = new Error('Комментарии не найдены по пути ' + path);
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Комментарии не найдены');
    }

    function openComments(movie) {
        addStyles();
        const title = getMovieTitle(movie);

        const loading = $(`
            <div class="fcv8-container">
                <div class="fcv8-header">
                    <div class="fcv8-header-title">Комментарии</div>
                    <div class="fcv8-header-count">…</div>
                </div>
                <div class="fcv8-subtitle">${escapeHtml(title)}</div>
                <div class="fcv8-empty">Загружаем комментарии…</div>
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
            modalHtml.find('.selector').on('hover:enter',function(){ $(this).addClass('focus'); });
            modalHtml.find('.selector').on('hover:leave',function(){ $(this).removeClass('focus'); });
        }).catch(function(error){
            console.error('[Filmix Comments V8]', error);
            loading.replaceWith($(`
                <div class="fcv8-container">
                    <div class="fcv8-header">
                        <div class="fcv8-header-title">Комментарии</div>
                        <div class="fcv8-header-count">!</div>
                    </div>
                    <div class="fcv8-subtitle">${escapeHtml(title)}</div>
                    <div class="fcv8-error">Не удалось загрузить комментарии</div>
                </div>
            `));
        });
    }

    function addButton(movie) {
        $('.button--filmix-comments-v8').remove();

        const button = $(`
            <div class="full-start__button selector ${BUTTON_CLASS}">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4.5A2.5 2.5 0 0 0 17.5 2h-11A2.5 2.5 0 0 0 4 4.5v8A2.5 2.5 0 0 0 6.5 15H9l-3.5 4 5.5-4h6.5a2.5 2.5 0 0 0 2.5-2.5v-8z"/>
                    <circle cx="9" cy="8.5" r="1"/><circle cx="12" cy="8.5" r="1"/><circle cx="15" cy="8.5" r="1"/>
                </svg>
                <span>Комментарии</span>
            </div>
        `);

        $('.full-start-new__buttons').append(button);
        button.on('hover:enter',function(){ openComments(movie); });
        button.on('click',function(){ openComments(movie); });
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
