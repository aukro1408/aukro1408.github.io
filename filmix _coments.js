/* ===== Filmix Comments V10 — реальные комментарии ===== */
(function () {
    'use strict';

    const PLUGIN_FLAG = 'filmix_comments_v10';
    const BUTTON_CLASS = 'button--filmix-comments-v10';
    const STYLE_ID = 'filmix-comments-v10-style';
    const WORKER_URL = 'https://rezka-comments-proxy.aukro1408.workers.dev/';

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    function cleanText(value) {
        return String(value == null ? '' : value)
            .replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ').replace(/&quot;/gi, '"')
            .replace(/&#39;|&#x27;/gi, "'").replace(/&amp;/gi, '&')
            .replace(/\r/g, '').replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();
    }
    function getMovieTitle(movie) {
        return String((movie && (movie.title || movie.name || movie.original_title || movie.original_name)) || 'Комментарии').trim();
    }
    function getMovieYear(movie) {
        return String((movie && (movie.release_date || movie.first_air_date || movie.year || movie.release_year)) || '').slice(0,4);
    }
    function getMovieType(movie) {
        return String((movie && (movie.type || movie.media_type || movie.category || movie.source_type)) || '');
    }

    // Берём только настоящий URL Filmix из объекта Lampa.
    // Числовой movie.id НЕ используем: это часто TMDB/КП ID, а не Filmix ID.
    function findFilmixPath(movie) {
        const seen = new Set();
        const candidates = [];
        function walk(value, depth, keyName) {
            if (value == null || depth > 7) return;
            if (typeof value === 'string') {
                const s = value.trim();
                if (/filmix\./i.test(s) || /\/(?:seria|film)\//i.test(s)) candidates.push(s);
                return;
            }
            if (typeof value !== 'object' || seen.has(value)) return;
            seen.add(value);
            Object.keys(value).forEach(function (key) {
                const v = value[key];
                if (/url|href|link|path|source|iframe|movie|data|item|card/i.test(key) || depth < 3) {
                    walk(v, depth + 1, key);
                }
            });
        }
        walk(movie, 0, 'movie');
        for (const candidate of candidates) {
            try {
                if (/^https?:\/\//i.test(candidate)) {
                    const u = new URL(candidate);
                    if (!/filmix\./i.test(u.hostname)) continue;
                    if (/\/(?:seria|film)\//i.test(u.pathname)) return u.pathname;
                } else if (/^\/(?:seria|film)\//i.test(candidate)) {
                    return candidate.split('?')[0].split('#')[0];
                }
            } catch (_) {}
        }
        return '';
    }

    function normalizeComments(data) {
        if (!data || !Array.isArray(data.items)) return [];
        const result = [];
        const seen = new Set();
        data.items.forEach(function (item) {
            const text = cleanText(item && typeof item === 'object'
                ? (item.text || item.comment || item.body || item.content || '')
                : item);
            if (!text || text.length < 1 || text.length > 15000) return;
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
            .fcv10-container{box-sizing:border-box;width:100%;padding:4px 12px 34px;background:#292929;border-radius:20px}
            .fcv10-container *,.fcv10-container *::before,.fcv10-container *::after{box-sizing:border-box}
            .fcv10-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 4px 18px}
            .fcv10-header-title{color:#fff;font-size:20px;line-height:1.2;font-weight:800;letter-spacing:-.02em}
            .fcv10-header-count{min-width:42px;padding:7px 12px;border-radius:999px;background:#4f8cff;color:#fff;text-align:center;font-size:12px;font-weight:800;box-shadow:0 7px 18px rgba(79,140,255,.24)}
            .fcv10-subtitle{padding:0 4px 16px;color:rgba(255,255,255,.48);font-size:12px}
            .fcv10-comment{position:relative;margin:0 0 13px;padding:20px 18px 20px 28px;background:linear-gradient(165deg,#252529,#1a1a1d);border:1px solid rgba(255,255,255,.075);border-radius:18px;overflow:hidden;box-shadow:0 12px 28px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.035);transition:transform .16s ease,background .16s ease,border-color .16s ease,box-shadow .16s ease}
            .fcv10-comment::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;border-radius:0 8px 8px 0;background:linear-gradient(180deg,#4f8cff 0%,#7c5cff 16%,#c45cff 32%,#ff4fa3 48%,#ff6b6b 64%,#ffbd4a 80%,#45d483 92%,#4f8cff 100%);background-size:100% 260%;animation:fcv10Rainbow 3.6s ease-in-out infinite;box-shadow:0 0 8px rgba(79,140,255,.55),0 0 18px rgba(196,92,255,.30);pointer-events:none;z-index:2}
            @keyframes fcv10Rainbow{0%{background-position:0 0%;filter:hue-rotate(0deg)}50%{background-position:0 100%;filter:hue-rotate(22deg)}100%{background-position:0 0%;filter:hue-rotate(0deg)}}
            .fcv10-comment.focus,.fcv10-comment:hover{transform:translateY(-2px) scale(1.003);background:linear-gradient(165deg,#2b2b30,#1e1e22);border-color:rgba(79,140,255,.25);box-shadow:0 18px 34px rgba(0,0,0,.44),0 0 0 1px rgba(79,140,255,.05)}
            .fcv10-text{display:block;margin:0!important;padding:0!important;color:#e7e7eb;text-align:left!important;font-size:16px;line-height:1.58;word-break:break-word;overflow-wrap:anywhere;white-space:pre-wrap}
            .fcv10-empty,.fcv10-error{padding:45px 20px;color:rgba(255,255,255,.58);text-align:center;line-height:1.5}.fcv10-error{color:#ff8f8f}
            .fcv10-more{margin:6px 0 16px;padding:14px 18px;border-radius:14px;background:rgba(79,140,255,.12);border:1px solid rgba(79,140,255,.25);color:#8fb2ff;text-align:center;font-size:14px;font-weight:700}
            .fcv10-more.focus,.fcv10-more:hover{background:rgba(79,140,255,.2)}
            .fcv10-loading-more{padding:16px;text-align:center;color:rgba(255,255,255,.5);font-size:13px}
            .button--filmix-comments-v10 svg{width:22px;height:22px;margin-right:7px;fill:currentColor}
        `;
        document.head.appendChild(style);
    }

    function renderComments(title, comments, total, hasNext) {
        let html = `<div class="fcv10-container"><div class="fcv10-header"><div class="fcv10-header-title">Комментарии</div><div class="fcv10-header-count">${Number(total)||comments.length}</div></div><div class="fcv10-subtitle">${escapeHtml(title)}</div><div class="fcv10-list">`;
        if (!comments.length) html += '<div class="fcv10-empty">Комментариев пока нет</div>';
        comments.forEach(function(comment){ html += `<div class="fcv10-comment selector" tabindex="0"><div class="fcv10-text">${escapeHtml(comment)}</div></div>`; });
        if (hasNext) html += '<div class="fcv10-more selector" tabindex="0">Показать ещё</div>';
        html += '</div></div>';
        return html;
    }

    function bindSelectors(container) {
        container.find('.selector').on('hover:enter',function(){ $(this).addClass('focus'); });
        container.find('.selector').on('hover:leave',function(){ $(this).removeClass('focus'); });
    }

    async function requestPage(movie, page) {
        const title = getMovieTitle(movie);
        const params = new URLSearchParams();
        const direct = findFilmixPath(movie);
        if (direct) params.set('path', direct);
        params.set('title', title);
        const original = movie && (movie.original_title || movie.original_name);
        if (original) params.set('original_title', String(original));
        const year = getMovieYear(movie);
        if (year) params.set('year', year);
        const type = getMovieType(movie);
        if (type) params.set('type', type);
        params.set('page', String(page));
        const response = await fetch(WORKER_URL + 'comments?' + params.toString(), {method:'GET',cache:'no-store'});
        let data = null;
        try { data = await response.json(); } catch (_) {}
        if (!response.ok || !data || data.success !== true) {
            throw new Error((data && data.message) || ('Worker HTTP ' + response.status));
        }
        return {items:normalizeComments(data),total:Number(data.total)||0,hasNext:!!data.hasNext,resolved:data.resolved||null};
    }

    async function openComments(movie) {
        addStyles();
        const title = getMovieTitle(movie);
        const loading = $(`<div class="fcv10-container"><div class="fcv10-header"><div class="fcv10-header-title">Комментарии</div><div class="fcv10-header-count">…</div></div><div class="fcv10-subtitle">${escapeHtml(title)}</div><div class="fcv10-empty">Загружаем комментарии…</div></div>`);
        Lampa.Modal.open({title:'Комментарии',html:loading,size:'large',style:'margin-top:10px;',mask:true,onBack:function(){Lampa.Modal.close();$('.modal--large').remove();Lampa.Controller.toggle('content');}});
        try {
            const first = await requestPage(movie,1);
            const modalHtml = $(renderComments(title, first.items, first.total, first.hasNext));
            loading.replaceWith(modalHtml);
            bindSelectors(modalHtml);
            let page = 1;
            let all = first.items.slice();
            modalHtml.find('.fcv10-more').on('click hover:enter', async function(){
                const button = $(this);
                if (button.data('loading')) return;
                button.data('loading',true).text('Загружаем…');
                try {
                    const next = await requestPage(movie, page + 1);
                    page += 1;
                    all = all.concat(next.items);
                    const list = modalHtml.find('.fcv10-list');
                    const newHtml = next.items.map(function(c){return `<div class="fcv10-comment selector" tabindex="0"><div class="fcv10-text">${escapeHtml(c)}</div></div>`;}).join('');
                    button.before(newHtml);
                    bindSelectors(modalHtml);
                    if (next.hasNext && next.items.length) button.data('loading',false).text('Показать ещё');
                    else button.remove();
                } catch (e) {
                    console.error('[Filmix Comments V10]',e);
                    button.data('loading',false).text('Ошибка. Повторить');
                }
            });
        } catch (error) {
            console.error('[Filmix Comments V10]', error);
            loading.replaceWith($(`<div class="fcv10-container"><div class="fcv10-header"><div class="fcv10-header-title">Комментарии</div><div class="fcv10-header-count">!</div></div><div class="fcv10-subtitle">${escapeHtml(title)}</div><div class="fcv10-error">Не удалось загрузить комментарии<br><small>${escapeHtml(error && error.message || 'Ошибка')}</small></div></div>`));
        }
    }

    function addButton(movie) {
        $('.button--filmix-comments-v10').remove();
        const button = $(`<div class="full-start__button selector ${BUTTON_CLASS}"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4.5A2.5 2.5 0 0 0 17.5 2h-11A2.5 2.5 0 0 0 4 4.5v8A2.5 2.5 0 0 0 6.5 15H9l-3.5 4 5.5-4h6.5a2.5 2.5 0 0 0 2.5-2.5v-8z"/><circle cx="9" cy="8.5" r="1"/><circle cx="12" cy="8.5" r="1"/><circle cx="15" cy="8.5" r="1"/></svg><span>Комментарии</span></div>`);
        $('.full-start-new__buttons').append(button);
        button.on('hover:enter',function(){openComments(movie);});
        button.on('click',function(){openComments(movie);});
    }
    function startPlugin(){
        if(window[PLUGIN_FLAG]) return;
        window[PLUGIN_FLAG]=true;
        addStyles();
        Lampa.Listener.follow('full',function(event){
            if(event.type!=='complite') return;
            const movie=event.data&&event.data.movie;
            if(!movie) return;
            addButton(movie);
        });
    }
    startPlugin();
})();
