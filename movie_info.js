/* CinemaX Movie Info V2 — подробная карточка фильма/сериала
 * Полностью отдельный плагин. Логика кнопки/Modal основана на рабочем
 * Filmix Comments V11, но код не переделывает и не зависит от него.
 */
(function () {
    'use strict';

    const PLUGIN_FLAG = 'cinemax_movie_info_v2';
    const BUTTON_CLASS = 'button--cinemax-movie-info-v2';
    const STYLE_ID = 'cinemax-movie-info-v2-style';
    const LOG = '[CinemaX Movie Info V2]';

    if (window[PLUGIN_FLAG]) return;
    window[PLUGIN_FLAG] = true;

    function log() {
        try { console.log.apply(console, [LOG].concat([].slice.call(arguments))); } catch (e) {}
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function title(movie) {
        return String((movie && (movie.title || movie.name || movie.original_title || movie.original_name)) || 'Фильм');
    }

    function originalTitle(movie) {
        return String((movie && (movie.original_title || movie.original_name)) || '');
    }

    function year(movie) {
        const d = movie && (movie.release_date || movie.first_air_date || movie.year || '');
        const m = String(d).match(/\b(\d{4})\b/);
        return m ? m[1] : '';
    }

    function isTV(movie) {
        const t = String((movie && (movie.media_type || movie.type || movie.object_type || ''))).toLowerCase();
        return t === 'tv' || t.indexOf('serial') >= 0 || t.indexOf('series') >= 0 || t.indexOf('сериал') >= 0 || !!(movie && (movie.number_of_seasons || movie.first_air_date));
    }

    function image(path, size) {
        if (!path) return '';
        try {
            return Lampa.TMDB.image('t/p/' + (size || 'w500') + path);
        } catch (e) {
            return 'https://image.tmdb.org/t/p/' + (size || 'w500') + path;
        }
    }

    function tmdbGet(path) {
        return new Promise(function (resolve, reject) {
            if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && typeof Lampa.Api.sources.tmdb.get === 'function') {
                Lampa.Api.sources.tmdb.get(path, {}, resolve, reject);
                return;
            }
            reject(new Error('TMDB API Lampa недоступен'));
        });
    }

    function formatMoney(value) {
        const n = Number(value || 0);
        if (!n) return '—';
        try { return '$' + n.toLocaleString('en-US'); } catch (e) { return '$' + n; }
    }

    function formatRuntime(minutes) {
        const n = Number(minutes || 0);
        if (!n) return '—';
        const h = Math.floor(n / 60), m = n % 60;
        return h ? h + ' ч ' + (m ? m + ' мин' : '') : m + ' мин';
    }

    function names(list) {
        if (!Array.isArray(list)) return '—';
        const a = list.map(function (x) { return typeof x === 'string' ? x : (x && (x.name || x.title)); }).filter(Boolean);
        return a.length ? a.join(' • ') : '—';
    }

    function firstCrew(crew, jobs) {
        if (!Array.isArray(crew)) return [];
        return crew.filter(function (p) { return p && jobs.indexOf(p.job) >= 0; });
    }

    function uniquePeople(list) {
        const seen = {};
        return (list || []).filter(function (p) {
            if (!p || !p.id || seen[p.id]) return false;
            seen[p.id] = true; return true;
        });
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .cmi2{width:100%;box-sizing:border-box;padding:4px 14px 34px;background:#292929;border-radius:20px;color:#eee}
            .cmi2 *{box-sizing:border-box}
            .cmi2-hero{position:relative;width:100%;height:290px;border-radius:18px;overflow:hidden;background:#151515;margin-bottom:18px}
            .cmi2-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center}
            .cmi2-hero-bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 20%,rgba(10,10,12,.96) 100%)}
            .cmi2-hero-content{position:absolute;left:20px;right:20px;bottom:18px;z-index:2}
            .cmi2-title{font-size:29px;font-weight:850;line-height:1.05;color:#fff;margin-bottom:4px}
            .cmi2-original{font-size:14px;color:rgba(255,255,255,.58);margin-bottom:10px}
            .cmi2-chips{display:flex;flex-wrap:wrap;gap:7px}
            .cmi2-chip{padding:7px 10px;border-radius:9px;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.08);font-size:13px;font-weight:650}
            .cmi2-rating{color:#7ff0c0}
            .cmi2-section{margin-top:18px}
            .cmi2-section-title{font-size:16px;font-weight:850;text-transform:uppercase;letter-spacing:.07em;color:rgba(255,255,255,.48);margin:0 4px 9px}
            .cmi2-description{padding:14px 15px;background:#17181b;border-radius:15px;color:#ddd;font-size:15px;line-height:1.55;white-space:pre-wrap}
            .cmi2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
            .cmi2-info{padding:11px 13px;background:#202124;border-radius:13px;min-width:0}
            .cmi2-label{font-size:11px;font-weight:800;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:4px}
            .cmi2-value{font-size:14px;line-height:1.35;color:#eee;word-break:break-word}
            .cmi2-people{display:flex;gap:10px;overflow-x:auto;padding:3px 2px 9px;scrollbar-width:none}
            .cmi2-people::-webkit-scrollbar{display:none}
            .cmi2-person{flex:0 0 104px;width:104px;min-height:164px;padding:0;border-radius:13px;overflow:hidden;background:#202124}
            .cmi2-person img{display:block;width:100%;height:122px;object-fit:cover;background:#151515}
            .cmi2-person-name{font-size:12px;font-weight:750;line-height:1.2;padding:7px 7px 2px;color:#fff;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
            .cmi2-person-role{font-size:10px;line-height:1.2;padding:2px 7px 8px;color:rgba(255,255,255,.48);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
            .cmi2-empty{padding:20px;text-align:center;color:rgba(255,255,255,.45)}
            .button--cinemax-movie-info-v2 svg{width:22px;height:22px;margin-right:7px;fill:currentColor}
            @media(max-width:600px){
                .cmi2{padding:2px 8px 28px;border-radius:18px}
                .cmi2-hero{height:235px;border-radius:15px}
                .cmi2-hero-content{left:14px;right:14px;bottom:14px}
                .cmi2-title{font-size:25px}
                .cmi2-grid{grid-template-columns:1fr}
                .cmi2-person{flex-basis:92px;width:92px}
                .cmi2-person img{height:110px}
            }
        `;
        document.head.appendChild(style);
    }

    function info(label, value) {
        if (value === undefined || value === null || value === '' || value === '—') return '';
        return '<div class="cmi2-info"><div class="cmi2-label">' + esc(label) + '</div><div class="cmi2-value">' + esc(value) + '</div></div>';
    }

    function peopleSection(titleText, people) {
        people = uniquePeople(people).slice(0, 30);
        if (!people.length) return '';
        let html = '<div class="cmi2-section"><div class="cmi2-section-title">' + esc(titleText) + '</div><div class="cmi2-people">';
        people.forEach(function (p) {
            const img = image(p.profile_path, 'w185');
            html += '<div class="cmi2-person selector" tabindex="0">' +
                (img ? '<img loading="lazy" src="' + esc(img) + '" onerror="this.style.display=\'none\'">' : '<div style="height:122px"></div>') +
                '<div class="cmi2-person-name">' + esc(p.name || '') + '</div>' +
                '<div class="cmi2-person-role">' + esc(p.character || p.job || '') + '</div>' +
                '</div>';
        });
        return html + '</div></div>';
    }

    function render(movie, details) {
        const tv = isTV(movie) || !!details.number_of_seasons;
        const backdrop = details.backdrop_path || movie.backdrop_path || details.poster_path || movie.poster_path;
        const poster = details.poster_path || movie.poster_path;
        const rating = Number(details.vote_average || movie.vote_average || 0);
        const voteCount = Number(details.vote_count || movie.vote_count || 0);
        const genres = names(details.genres);
        const countries = names((details.production_countries || []).map(function (x) { return x.name; }));
        const studios = names((details.production_companies || []).map(function (x) { return x.name; }));
        const languages = names((details.spoken_languages || []).map(function (x) { return x.english_name || x.name; }));
        const cast = details.credits && details.credits.cast || [];
        const crew = details.credits && details.credits.crew || [];
        const directors = firstCrew(crew, ['Director', 'Series Director']);
        const writers = firstCrew(crew, ['Writer', 'Screenplay', 'Story', 'Teleplay', 'Creator']);
        const cinematography = firstCrew(crew, ['Director of Photography', 'Cinematography']);
        const editing = firstCrew(crew, ['Editor', 'Supervising Editor']);
        const music = firstCrew(crew, ['Original Music Composer', 'Music', 'Music Supervisor']);
        const producers = firstCrew(crew, ['Producer', 'Executive Producer', 'Co-Producer']);

        let html = '<div class="cmi2">';
        html += '<div class="cmi2-hero">';
        if (backdrop) html += '<div class="cmi2-hero-bg" style="background-image:url(\'' + esc(image(backdrop, 'w1280')) + '\')"></div>';
        html += '<div class="cmi2-hero-content">';
        html += '<div class="cmi2-title">' + esc(details.title || details.name || title(movie)) + '</div>';
        if (originalTitle(details) && originalTitle(details) !== (details.title || details.name)) html += '<div class="cmi2-original">' + esc(originalTitle(details)) + '</div>';
        html += '<div class="cmi2-chips">';
        if (rating) html += '<div class="cmi2-chip cmi2-rating">★ ' + rating.toFixed(1) + '</div>';
        if (voteCount) html += '<div class="cmi2-chip">' + esc(voteCount.toLocaleString('ru-RU')) + ' оценок</div>';
        if (year(details) || year(movie)) html += '<div class="cmi2-chip">' + esc(year(details) || year(movie)) + '</div>';
        if (tv && details.number_of_seasons) html += '<div class="cmi2-chip">' + details.number_of_seasons + ' сез.</div>';
        if (!tv && details.runtime) html += '<div class="cmi2-chip">' + esc(formatRuntime(details.runtime)) + '</div>';
        html += '</div></div></div>';

        if (details.tagline) html += '<div class="cmi2-description" style="font-style:italic;color:rgba(255,255,255,.62);margin-bottom:10px">«' + esc(details.tagline) + '»</div>';
        if (details.overview) html += '<div class="cmi2-section"><div class="cmi2-section-title">Описание</div><div class="cmi2-description">' + esc(details.overview) + '</div></div>';

        html += '<div class="cmi2-section"><div class="cmi2-section-title">Информация</div><div class="cmi2-grid">';
        html += info('Жанры', genres);
        html += info('Страны', countries);
        html += info('Дата выхода', details.release_date || details.first_air_date || '—');
        html += info('Статус', details.status || '—');
        if (!tv) {
            html += info('Бюджет', formatMoney(details.budget));
            html += info('Сборы', formatMoney(details.revenue));
            html += info('Длительность', formatRuntime(details.runtime));
        } else {
            html += info('Сезонов', details.number_of_seasons || '—');
            html += info('Эпизодов', details.number_of_episodes || '—');
            html += info('Длительность серии', Array.isArray(details.episode_run_time) && details.episode_run_time.length ? formatRuntime(details.episode_run_time[0]) : '—');
            html += info('Последний эфир', details.last_air_date || '—');
        }
        html += info('Языки', languages);
        html += info('Студии', studios);
        html += info('TMDB ID', details.id || movie.id || '—');
        html += info('IMDb ID', details.external_ids && details.external_ids.imdb_id || '—');
        html += '</div></div>';

        html += peopleSection('Актёры', cast);
        html += peopleSection('Режиссёры', directors);
        html += peopleSection('Сценаристы', writers);
        html += peopleSection('Операторская работа', cinematography);
        html += peopleSection('Монтаж', editing);
        html += peopleSection('Музыка', music);
        html += peopleSection('Продюсеры', producers);

        html += '</div>';
        return html;
    }

    function openInfo(movie) {
        addStyles();
        movie = movie || {};
        const loading = $('<div class="cmi2"><div class="cmi2-empty">Загружаем информацию о фильме…</div></div>');
        Lampa.Modal.open({
            title: 'Подробнее',
            html: loading,
            size: 'large',
            style: 'margin-top:10px;',
            mask: true,
            onBack: function () {
                Lampa.Modal.close();
                $('.modal--large').remove();
                if (Lampa.Controller) Lampa.Controller.toggle('content');
            }
        });

        const type = isTV(movie) ? 'tv' : 'movie';
        const id = movie.id;
        if (!id) {
            loading.html('<div class="cmi2-empty">Не найден TMDB ID фильма</div>');
            return;
        }

        tmdbGet(type + '/' + id + '?append_to_response=credits,external_ids,images,release_dates,content_ratings')
            .then(function (details) {
                const html = $(render(movie, details || {}));
                loading.replaceWith(html);
                html.find('.selector').on('hover:enter', function () { $(this).addClass('focus'); });
                html.find('.selector').on('hover:leave', function () { $(this).removeClass('focus'); });
            })
            .catch(function (error) {
                log('TMDB error', error);
                loading.html('<div class="cmi2-empty">Не удалось загрузить информацию<br><small>' + esc(error && error.message || '') + '</small></div>');
            });
    }

    function addButton(movie) {
        $('.' + BUTTON_CLASS).remove();
        const button = $(`
            <div class="full-start__button selector ${BUTTON_CLASS}">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5a2 2 0 0 0-2 2v14l4-3h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-1 9H6v-2h12v2Zm0-4H6V6h12v2Z"/>
                </svg>
                <span>Подробнее</span>
            </div>
        `);
        const target = $('.full-start-new__buttons');
        if (!target.length) return;
        target.append(button);
        button.on('hover:enter', function () { openInfo(movie); });
        button.on('click', function () { openInfo(movie); });
    }

    function start() {
        addStyles();
        Lampa.Listener.follow('full', function (event) {
            if (event.type !== 'complite') return;
            const movie = event.data && event.data.movie;
            if (!movie) return;
            addButton(movie);
        });
    }

    start();
})();
