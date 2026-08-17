/* ===== Filmix Comments V14 — Android Lampa resolver + comments-only Worker =====
   Поиск фильма выполняется ЛОКАЛЬНО на устройстве обычным fetch()
   (как в rezkacomment.js): только GET /search/?do=search&subaction=search&q=...
   Без search.php, без Cloudflare-прокси, без Origin/Referer/User-Agent/Cookie,
   без Lampa.Reguest().native().
   Cloudflare Worker получает ТОЛЬКО числовой news_id и отдаёт комментарии. */
(function () {
    'use strict';

    const PLUGIN_FLAG = 'filmix_comments_v14';
    const BUTTON_CLASS = 'button--filmix-comments-v14';
    const STYLE_ID = 'filmix-comments-v14-style';

    // Комментарии отдаёт наш Worker (у него есть CORS), поиск — только с устройства.
    const WORKER_URL = 'https://rezka-comments-proxy.aukro1408.workers.dev/';
    const SEARCH_HOST = 'https://hdrezka.ag';

    /* ============================================================
       UI (без изменений по сравнению с v12)
       ============================================================ */

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

    function addStyles() {
        if (typeof document === 'undefined' || !document.head) return;
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .fcv14-container {
                box-sizing:border-box;
                width:100%;
                padding:4px 12px 34px;
                background:#292929;
                border-radius:20px;
            }
            .fcv14-container *, .fcv14-container *::before, .fcv14-container *::after {
                box-sizing:border-box;
            }
            .fcv14-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                padding:8px 4px 18px;
            }
            .fcv14-header-title {
                color:#fff;
                font-size:20px;
                line-height:1.2;
                font-weight:800;
                letter-spacing:-.02em;
            }
            .fcv14-header-count {
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
            .fcv14-subtitle {
                padding:0 4px 16px;
                color:rgba(255,255,255,.48);
                font-size:12px;
            }
            .fcv14-comment {
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
            .fcv14-comment::before {
                content:"";
                position:absolute;
                left:0;
                top:0;
                bottom:0;
                width:6px;
                border-radius:0 8px 8px 0;
                background:linear-gradient(180deg,#4f8cff 0%,#7c5cff 16%,#c45cff 32%,#ff4fa3 48%,#ff6b6b 64%,#ffbd4a 80%,#45d483 92%,#4f8cff 100%);
                background-size:100% 260%;
                animation:fcv14Rainbow 3.6s ease-in-out infinite;
                box-shadow:0 0 8px rgba(79,140,255,.55),0 0 18px rgba(196,92,255,.30);
                pointer-events:none;
                z-index:2;
            }
            @keyframes fcv14Rainbow {
                0%{background-position:0 0%;filter:hue-rotate(0deg)}
                50%{background-position:0 100%;filter:hue-rotate(22deg)}
                100%{background-position:0 0%;filter:hue-rotate(0deg)}
            }
            .fcv14-comment.focus,.fcv14-comment:hover {
                transform:translateY(-2px) scale(1.003);
                background:linear-gradient(165deg,#2b2b30,#1e1e22);
                border-color:rgba(79,140,255,.25);
                box-shadow:0 18px 34px rgba(0,0,0,.44),0 0 0 1px rgba(79,140,255,.05);
            }
            .fcv14-text {
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
            .fcv14-empty,.fcv14-error {
                padding:45px 20px;
                color:rgba(255,255,255,.58);
                text-align:center;
                line-height:1.5;
            }
            .fcv14-error { color:#ff8f8f; }
            .button--filmix-comments-v14 svg {
                width:22px;height:22px;margin-right:7px;fill:currentColor;
            }
        `;
        document.head.appendChild(style);
    }

    function renderComments(title, comments, totalCount) {
        let html = `
            <div class="fcv14-container">
                <div class="fcv14-header">
                    <div class="fcv14-header-title">Комментарии</div>
                    <div class="fcv14-header-count">${Number(totalCount || comments.length)}</div>
                </div>
                <div class="fcv14-subtitle">${escapeHtml(title)}</div>
        `;

        if (!comments.length) {
            html += '<div class="fcv14-empty">Комментариев пока нет</div>';
        } else {
            comments.forEach(function (comment) {
                html += `
                    <div class="fcv14-comment selector" tabindex="0">
                        <div class="fcv14-text">${escapeHtml(comment)}</div>
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

    function openComments(fullData) {
        addStyles();

        const movie = (fullData && fullData.movie) || {};
        const title = getMovieTitle(movie);

        const loading = $(`
            <div class="fcv14-container">
                <div class="fcv14-header">
                    <div class="fcv14-header-title">Комментарии</div>
                    <div class="fcv14-header-count">…</div>
                </div>
                <div class="fcv14-subtitle">${escapeHtml(title)}</div>
                <div class="fcv14-empty">Ищем фильм на HDRezka…</div>
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

        loadComments(fullData).then(function(comments){
            const modalHtml = $(renderComments(title, comments, comments._filmixTotal));
            loading.replaceWith(modalHtml);

            modalHtml.find('.selector').on('hover:enter',function(){
                $(this).addClass('focus');
            });

            modalHtml.find('.selector').on('hover:leave',function(){
                $(this).removeClass('focus');
            });
        }).catch(function(error){
            console.error('[Filmix Comments V14]', error);

            const msg = (error && error.message)
                ? String(error.message)
                : 'Не удалось загрузить комментарии';

            loading.replaceWith($(`
                <div class="fcv14-container">
                    <div class="fcv14-header">
                        <div class="fcv14-header-title">Комментарии</div>
                        <div class="fcv14-header-count">!</div>
                    </div>
                    <div class="fcv14-subtitle">${escapeHtml(title)}</div>
                    <div class="fcv14-error">${escapeHtml(msg)}</div>
                </div>
            `));
        });
    }

    function addButton(fullData) {
        $('.button--filmix-comments-v14').remove();

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
            openComments(fullData);
        });

        button.on('click',function(){
            openComments(fullData);
        });
    }

    /* ============================================================
       RESOLVER — поиск на HDRezka напрямую с устройства.
       ТОЛЬКО GET /search/?do=search&subaction=search&q=...
       Запрещено: search.php, Cloudflare-прокси, Origin, Referer,
       User-Agent, Cookie, Lampa.Reguest().native().
       ============================================================ */

    function cleanTitle(str) {
        return (str + '').replace(/[\s.,:;’'`!?]+/g, ' ').trim();
    }

    function normalizeTitle(str) {
        return cleanTitle(
            String(str).toLowerCase()
                .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-')
                .replace(/ё/g, 'е')
        );
    }

    function equalTitle(t1, t2) {
        return typeof t1 === 'string' && typeof t2 === 'string' &&
            normalizeTitle(t1) === normalizeTitle(t2);
    }

    function containsTitle(str, title) {
        return typeof str === 'string' && typeof title === 'string' &&
            normalizeTitle(str).indexOf(normalizeTitle(title)) !== -1;
    }

    function equalAnyTitle(strings, titles) {
        return titles.some(function (title) {
            return title && strings.some(function (str) {
                return str && equalTitle(str, title);
            });
        });
    }

    function containsAnyTitle(strings, titles) {
        return titles.some(function (title) {
            return title && strings.some(function (str) {
                return str && containsTitle(str, title);
            });
        });
    }

    function decodeEntities(str) {
        return (str || '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#0*39;/g, "'")
            .replace(/&nbsp;/g, ' ');
    }

    function stripTags(str) {
        return (str || '').replace(/<[^>]*>/g, '');
    }

    function filmIdFromUrl(link) {
        const path = (link || '').replace(/^[^:]+:\/\/[^/]+/, '').split('?')[0];
        const seg = path.substring(path.lastIndexOf('/') + 1);
        const idPart = seg.split('-')[0];
        if (!/^\d+$/.test(idPart)) return null;
        return idPart;
    }

    function isSeriesFromUrl(link) {
        return /\/series\//.test(link || '');
    }

    function parseInlineLinkBlock(block) {
        const a = block.match(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/);
        const d = block.match(/<div>([^<]*)<\/div>/);
        const info = d ? decodeEntities(d[1]).trim() : '';
        let year;
        const ym = info.match(/^(\d{4})\b/);
        if (ym) year = parseInt(ym[1], 10);
        return {
            year: year,
            title: a ? decodeEntities(a[2]).trim() : '',
            orig_title: '',
            link: a ? a[1] : ''
        };
    }

    function evaluateCards(cards, select_title, search_year, orig_titles, preferredOrigTitle) {
        cards = cards.filter(function (c) { return c && c.link; });
        let is_sure = false;
        let filtered = cards.slice();

        if (filtered.length) {
            if (orig_titles.length) {
                const tmp = filtered.filter(function (c) {
                    return containsAnyTitle([c.orig_title, c.title], orig_titles);
                });
                if (tmp.length) {
                    filtered = tmp;
                    is_sure = true;
                }
            }
            if (select_title) {
                const tmp = filtered.filter(function (c) {
                    return containsAnyTitle([c.title, c.orig_title], [select_title]);
                });
                if (tmp.length) {
                    filtered = tmp;
                    is_sure = true;
                }
            }
            if (filtered.length > 1 && search_year) {
                let tmp = filtered.filter(function (c) { return c.year == search_year; });
                if (!tmp.length) tmp = filtered.filter(function (c) {
                    return c.year && c.year > search_year - 2 && c.year < search_year + 2;
                });
                if (tmp.length) filtered = tmp;
            }
            if (filtered.length > 1 && preferredOrigTitle) {
                const exact = filtered.filter(function (c) {
                    return c.orig_title && equalTitle(c.orig_title, preferredOrigTitle);
                });
                if (exact.length === 1) filtered = exact;
            }
        }

        if (filtered.length === 1 && is_sure) {
            if (search_year && filtered[0].year) {
                is_sure = filtered[0].year > search_year - 2 && filtered[0].year < search_year + 2;
            }
            if (is_sure) {
                is_sure = false;
                if (orig_titles.length) is_sure = is_sure || equalAnyTitle([filtered[0].orig_title, filtered[0].title], orig_titles);
                if (select_title) is_sure = is_sure || equalAnyTitle([filtered[0].title, filtered[0].orig_title], [select_title]);
            }
        }

        if (filtered.length === 1 && is_sure) {
            const c = filtered[0];
            return {
                filmId: filmIdFromUrl(c.link),
                isSeries: isSeriesFromUrl(c.link),
                url: c.link,
                title: c.title,
                origTitle: c.orig_title,
                year: c.year,
                matchedBy: 'sure'
            };
        }
        return null;
    }

    function checkSearchError(str) {
        if (!str) throw new Error('пустой ответ HDRezka');
        if (str.indexOf('anubis') !== -1 || str.indexOf('<div>105</div>') !== -1) {
            throw new Error('антибот-защита (Anubis) на HDRezka');
        }
        if (str.match(/<form id="check-form" class="check-form" method="post" action="\/ajax\/login\/">/)) {
            throw new Error('HDRezka требует авторизацию');
        }
        if (str.indexOf('Fatal error:') === 0) throw new Error('HDRezka: ' + str);
    }

    // Один GET на страницу результатов поиска. Без каких-либо заголовков.
    function searchPage(query, page) {
        const url =
            SEARCH_HOST +
            '/search/?do=search&subaction=search&q=' +
            encodeURIComponent(query) +
            '&page=' +
            encodeURIComponent(page);

        console.log('[Filmix Comments V14] SEARCH URL: ' + url);

        return fetch(url, {
            method: 'GET',
            cache: 'no-store'
        }).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        }).then(function (str) {
            str = (str || '').replace(/\n/g, '');
            checkSearchError(str);
            const blocks = str.match(
                /<div class="b-content__inline_item-link">\s*<a [^>]*>[^<]*<\/a>\s*<div>[^<]*<\/div>\s*<\/div>/g
            ) || [];
            console.log('[Filmix Comments V14] SEARCH blocks: ' + blocks.length);
            return blocks.map(parseInlineLinkBlock).filter(Boolean);
        });
    }

    // Полный объект события Lampa (event.data), не только movie.
    function resolveRezka(fullData) {
        console.log('[Filmix Comments V14] TRACE 3 resolveRezka');
        const movie = (fullData && fullData.movie) || {};
        const select_title = ((fullData.search || movie.title || '') + '').trim();
        const search_date =
            fullData.search_date ||
            (!fullData.clarification &&
                (movie.release_date || movie.first_air_date || movie.last_air_date)) ||
            '0000';
        const search_year = parseInt(String(search_date).slice(0, 4), 10) || 0;

        const orig_titles = [];
        if (movie.alternative_titles && movie.alternative_titles.results) {
            movie.alternative_titles.results.forEach(function (t) {
                if (t && t.title) orig_titles.push(t.title);
            });
        }
        if (movie.original_title) orig_titles.push(movie.original_title);
        if (movie.original_name) orig_titles.push(movie.original_name);
        const preferredOrigTitle = movie.original_title || movie.original_name || '';

        if (!select_title) return Promise.resolve(null);

        const query = cleanTitle(select_title);

        let page = 0;
        const step = function () {
            if (page >= 3) return null;
            page += 1;
            return searchPage(query, page).then(function (cards) {
                if (!cards.length) return null;
                const result = evaluateCards(cards, select_title, search_year, orig_titles, preferredOrigTitle);
                if (result) return result;
                return step();
            });
        };
        return step();
    }

    /* ============================================================
       PIPELINE: локальный resolve -> Worker с news_id
       ============================================================ */

    async function loadComments(fullData) {
        console.log('[Filmix Comments V14] TRACE 1 loadComments');
        const movie = (fullData && fullData.movie) || {};
        const title = getMovieTitle(movie);

        console.log('[Filmix Comments V14] On-device resolve:', title);

        let resolved = null;
        try {
            console.log('[Filmix Comments V14] TRACE 2 before resolveRezka');
            resolved = await resolveRezka(fullData);
        } catch (error) {
            throw new Error(
                'HDRezka: ' + (error && error.message ? error.message : String(error))
            );
        }

        if (!resolved || !resolved.filmId) {
            throw new Error('HDRezka фильм не найден');
        }

        const url = WORKER_URL + 'comments?news_id=' + encodeURIComponent(resolved.filmId);

        console.log('[Filmix Comments V14] Resolved:', resolved);
        console.log('[Filmix Comments V14] Worker URL:', url);

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
        comments._filmixTotal = Number(data.total || comments.length);

        console.log('[Filmix Comments V14] Comments:', comments.length, 'total:', comments._filmixTotal);

        return comments;
    }

    /* ============================================================
       START
       ============================================================ */

    function startPlugin() {
        if (window[PLUGIN_FLAG]) return;
        window[PLUGIN_FLAG] = true;

        addStyles();

        Lampa.Listener.follow('full', function (event) {
            if (event.type !== 'complite') return;

            const fullData = event.data;
            if (!fullData || !fullData.movie) return;

            addButton(fullData);
        });
    }

    startPlugin();

    // Хук для локального тестирования resolver-логики.
    if (typeof window !== 'undefined') {
        window['fcv14'] = {
            resolveRezka: resolveRezka,
            SEARCH_HOST: SEARCH_HOST,
            WORKER_URL: WORKER_URL,
            cleanTitle: cleanTitle,
            evaluateCards: evaluateCards
        };
    }
})();
