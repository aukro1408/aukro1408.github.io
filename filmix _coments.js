/* ===== Filmix Comments V9 — реальные комментарии ===== */
(function () {
    'use strict';

    const PLUGIN_FLAG = 'filmix_comments_v9';
    const BUTTON_CLASS = 'button--filmix-comments-v9';
    const STYLE_ID = 'filmix-comments-v9-style';

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

    // Если Lampa уже передала URL Filmix — используем его.
    // Если URL нет, Worker сам найдёт Filmix по названию/году/типу.
    function buildFilmixPaths(movie) {
        const direct = findFilmixPath(movie);
        return direct ? [direct] : [];
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
            if (typeof item === 'string') text = item;
            else if (item && typeof item === 'object') {
                text = item.text || item.comment || item.description || item.body || item.content || '';
            }

            text = cleanText(text);
            if (!text) return;

            const key = text.toLowerCase().replace(/\s+/g, ' ');
            if (seen.has(key)) return;
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
            .fcv9-container {
                box-sizing:border-box;
                width:100%;
                padding:4px 12px 34px;
                background:#292929;
                border-radius:20px;
            }
            .fcv9-container *, .fcv9-container *::before, .fcv9-container *::after {
                box-sizing:border-box;
            }
            .fcv9-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                padding:8px 4px 18px;
            }
            .fcv9-header-title {
                color:#fff;
                font-size:20px;
                line-height:1.2;
                font-weight:800;
                letter-spacing:-.02em;
            }
            .fcv9-header-count {
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
            .fcv9-subtitle {
                padding:0 4px 16px;
                color:rgba(255,255,255,.48);
                font-size:12px;
            }
            .fcv9-comment {
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
            .fcv9-comment::before {
                content:"";
                position:absolute;
                left:0;
                top:0;
                bottom:0;
                width:6px;
                border-radius:0 8px 8px 0;
                background:linear-gradient(180deg,#4f8cff 0%,#7c5cff 16%,#c45cff 32%,#ff4fa3 48%,#ff6b6b 64%,#ffbd4a 80%,#45d483 92%,#4f8cff 100%);
                background-size:100% 260%;
                animation:fcv9Rainbow 3.6s ease-in-out infinite;
                box-shadow:0 0 8px rgba(79,140,255,.55),0 0 18px rgba(196,92,255,.30);
                pointer-events:none;
                z-index:2;
            }
            @keyframes fcv9Rainbow {
                0%{background-position:0 0%;filter:hue-rotate(0deg)}
                50%{background-position:0 100%;filter:hue-rotate(22deg)}
                100%{background-position:0 0%;filter:hue-rotate(0deg)}
            }
            .fcv9-comment.focus,.fcv9-comment:hover {
                transform:translateY(-2px) scale(1.003);
                background:linear-gradient(165deg,#2b2b30,#1e1e22);
                border-color:rgba(79,140,255,.25);
                box-shadow:0 18px 34px rgba(0,0,0,.44),0 0 0 1px rgba(79,140,255,.05);
            }
            .fcv9-text {
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
            .fcv9-empty,.fcv9-error {
                padding:45px 20px;
                color:rgba(255,255,255,.58);
                text-align:center;
                line-height:1.5;
            }
            .fcv9-error { color:#ff8f8f; }
            .button--filmix-comments-v9 svg {
                width:22px;height:22px;margin-right:7px;fill:currentColor;
            }

            .fcv9-more {
                margin:6px 0 16px;
                padding:14px 18px;
                border-radius:14px;
                background:rgba(79,140,255,.12);
                border:1px solid rgba(79,140,255,.25);
                color:#8fb2ff;
                text-align:center;
                font-size:14px;
                font-weight:700;
                cursor:pointer;
            }
            .fcv9-more.focus,.fcv9-more:hover {
                background:rgba(79,140,255,.2);
            }
        `;
        document.head.appendChild(style);
    }

    function renderComments(title, comments, total) {
        const initial = Math.min(30, comments.length);
        let html = `
            <div class="fcv9-container" data-total="${Number(total) || comments.length}">
                <div class="fcv9-header">
                    <div class="fcv9-header-title">Комментарии</div>
                    <div class="fcv9-header-count">${Number(total) || comments.length}</div>
                </div>
                <div class="fcv9-subtitle">${escapeHtml(title)}</div>
                <div class="fcv9-list">
        `;

        if (!comments.length) {
            html += '<div class="fcv9-empty">Комментариев пока нет</div>';
        } else {
            comments.slice(0, initial).forEach(function(comment) {
                html += `<div class="fcv9-comment selector" tabindex="0"><div class="fcv9-text">${escapeHtml(comment)}</div></div>`;
            });
            if (comments.length > initial) {
                html += `<div class="fcv9-more selector" tabindex="0">Показать ещё</div>`;
            }
        }

        html += '</div></div>';
        return html;
    }

    function bindCommentControls(container, comments) {
        container.find('.selector').on('hover:enter', function(){ $(this).addClass('focus'); });
        container.find('.selector').on('hover:leave', function(){ $(this).removeClass('focus'); });

        container.find('.fcv9-more').on('click hover:enter', function(){
            const list = container.find('.fcv9-list');
            const current = list.find('.fcv9-comment').length;
            const next = Math.min(current + 30, comments.length);
            const html = comments.slice(current, next).map(function(comment){
                return `<div class="fcv9-comment selector" tabindex="0"><div class="fcv9-text">${escapeHtml(comment)}</div></div>`;
            }).join('');
            $(this).before(html);
            if (next >= comments.length) $(this).remove();
            bindCommentControls(container, comments);
        });
    }

    async function loadComments(movie) {
        const title = getMovieTitle(movie);
        const directPaths = buildFilmixPaths(movie);
        const candidates = directPaths.length ? directPaths : [''];

        let lastError = null;

        for (const path of candidates) {
            try {
                const params = new URLSearchParams();
                if (path) params.set('path', path);
                params.set('title', title);

                const original = movie && (movie.original_title || movie.original_name);
                if (original) params.set('original_title', String(original));

                const year = movie && (movie.year || movie.release_date || movie.first_air_date);
                if (year) params.set('year', String(year).slice(0, 4));

                const type = movie && (movie.type || movie.media_type || movie.category || '');
                if (type) params.set('type', String(type));

                const url = WORKER_URL + 'comments?' + params.toString();
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
                return {
                    items: comments,
                    total: Number(data.total) || comments.length,
                    resolved: data.resolved || null
                };
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
            <div class="fcv9-container">
                <div class="fcv9-header">
                    <div class="fcv9-header-title">Комментарии</div>
                    <div class="fcv9-header-count">…</div>
                </div>
                <div class="fcv9-subtitle">${escapeHtml(title)}</div>
                <div class="fcv9-empty">Загружаем комментарии…</div>
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

        loadComments(movie).then(function(result){
            const modalHtml = $(renderComments(title, result.items, result.total));
            loading.replaceWith(modalHtml);
            bindCommentControls(modalHtml, result.items);
        }).catch(function(error){
            console.error('[Filmix Comments V9]', error);
            loading.replaceWith($(`
                <div class="fcv9-container">
                    <div class="fcv9-header">
                        <div class="fcv9-header-title">Комментарии</div>
                        <div class="fcv9-header-count">!</div>
                    </div>
                    <div class="fcv9-subtitle">${escapeHtml(title)}</div>
                    <div class="fcv9-error">Не удалось загрузить комментарии</div>
                </div>
            `));
        });
    }

    function addButton(movie) {
        $('.button--filmix-comments-v9').remove();

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
