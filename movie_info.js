/* CinemaX Movie Info V3 — подробная карточка фильма/сериала
 * Полностью отдельный плагин. Логика кнопки/Modal основана на рабочем
 * Filmix Comments V11, но код не переделывает и не зависит от него.
 */
(function () {
    'use strict';

    const PLUGIN_FLAG = 'cinemax_movie_info_v3';
    const BUTTON_CLASS = 'button--cinemax-movie-info-v3';
    const STYLE_ID = 'cinemax-movie-info-v3-style';
    const LOG = '[CinemaX Movie Info V3]';

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
            /* CinemaX Movie Info V3 — visual language aligned with Interface Mod */
            .cmi2{position:relative;width:100%;box-sizing:border-box;padding:4px 14px 34px;background:transparent;color:#fff}
            .cmi2 *{box-sizing:border-box}
            .cmi2-close{position:absolute;top:4px;right:4px;z-index:50;width:2.35em;height:2.35em;border:0;border-radius:.5em;background:rgba(26,42,58,.96);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.45em;line-height:1;cursor:pointer;transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
            .cmi2-close.focus,.cmi2-close.hover{background:linear-gradient(45deg,#43cea2,#185a9d);box-shadow:0 0 .4em rgba(67,206,162,.4);transform:scale(1.03)}
            .cmi2-hero{position:relative;width:100%;height:290px;border-radius:.9em;overflow:hidden;background:rgba(26,42,58,.98);margin-bottom:18px;border:1px solid rgba(67,206,162,.08)}
            .cmi2-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center}
            .cmi2-hero-bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,20,28,.05) 18%,rgba(10,20,28,.97) 100%)}
            .cmi2-hero-content{position:absolute;left:20px;right:20px;bottom:18px;z-index:2;padding-right:3em}
            .cmi2-title{font-size:29px;font-weight:850;line-height:1.05;color:#fff;margin-bottom:4px}
            .cmi2-original{font-size:14px;color:rgba(255,255,255,.58);margin-bottom:10px}
            .cmi2-chips{display:flex;flex-wrap:wrap;gap:7px}
            .cmi2-chip{padding:7px 10px;border-radius:.5em;background:rgba(26,42,58,.82);border:1px solid rgba(67,206,162,.08);font-size:13px;font-weight:650;color:#fff}
            .cmi2-rating{color:#43cea2}
            .cmi2-section{margin-top:18px}
            .cmi2-section-title{font-size:16px;font-weight:850;text-transform:uppercase;letter-spacing:.07em;color:rgba(255,255,255,.55);margin:0 4px 9px}
            .cmi2-description{padding:14px 15px;background:rgba(26,42,58,.98);border:1px solid rgba(67,206,162,.07);border-radius:.8em;color:#ddd;font-size:15px;line-height:1.55;white-space:pre-wrap}
            .cmi2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
            .cmi2-info{padding:11px 13px;background:rgba(26,42,58,.98);border:1px solid rgba(67,206,162,.06);border-radius:.7em;min-width:0;transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
            .cmi2-label{font-size:11px;font-weight:800;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:4px}
            .cmi2-value{font-size:14px;line-height:1.35;color:#eee;word-break:break-word}
            .cmi2-people{display:flex;gap:10px;overflow-x:auto;padding:3px 2px 9px;scrollbar-width:none}
            .cmi2-people::-webkit-scrollbar{display:none}
            .cmi2-person{flex:0 0 104px;width:104px;min-height:164px;padding:0;border-radius:.7em;overflow:hidden;background:rgba(26,42,58,.98);border:1px solid rgba(67,206,162,.06);transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
            .cmi2-person img{display:block;width:100%;height:122px;object-fit:cover;background:#151a20}
            .cmi2-person-name{font-size:12px;font-weight:750;line-height:1.2;padding:7px 7px 2px;color:#fff;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
            .cmi2-person-role{font-size:10px;line-height:1.2;padding:2px 7px 8px;color:rgba(255,255,255,.48);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
            .cmi2-person.focus,.cmi2-person.hover,.cmi2-media-card.focus,.cmi2-media-card.hover,.cmi2-shot.focus,.cmi2-shot.hover{background:linear-gradient(45deg,#43cea2,#185a9d);box-shadow:0 0 .4em rgba(67,206,162,.35);transform:scale(1.03)}
            .cmi2-gallery{display:flex;gap:9px;overflow-x:auto;padding:3px 2px 10px;scrollbar-width:none}
            .cmi2-gallery::-webkit-scrollbar{display:none}
            .cmi2-shot{flex:0 0 180px;width:180px;height:105px;border-radius:.7em;overflow:hidden;background:rgba(26,42,58,.98);position:relative;transition:transform .2s ease,box-shadow .2s ease}
            .cmi2-shot img{display:block;width:100%;height:100%;object-fit:cover}
            .cmi2-shot:after{content:"⌕";position:absolute;right:7px;bottom:6px;width:25px;height:25px;border-radius:50%;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px}
            .cmi2-media{display:flex;gap:10px;overflow-x:auto;padding:3px 2px 10px;scrollbar-width:none}
            .cmi2-media::-webkit-scrollbar{display:none}
            .cmi2-media-card{flex:0 0 118px;width:118px;border-radius:.7em;overflow:hidden;background:rgba(26,42,58,.98);border:1px solid rgba(67,206,162,.06);padding-bottom:7px;transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
            .cmi2-media-card img{display:block;width:100%;height:170px;object-fit:cover;background:#151a20}
            .cmi2-media-title{font-size:12px;font-weight:750;line-height:1.2;color:#fff;padding:7px 7px 1px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
            .cmi2-media-meta{font-size:10px;color:rgba(255,255,255,.48);padding:2px 7px 0}
            .cmi2-lightbox{position:fixed;inset:0;z-index:999999;background:rgba(8,14,19,.97);display:flex;align-items:center;justify-content:center;padding:22px;outline:none}
            .cmi2-lightbox img{max-width:90vw;max-height:86vh;object-fit:contain;border-radius:.7em;box-shadow:0 0 2em rgba(0,0,0,.55)}
            .cmi2-lightbox-close,.cmi2-lightbox-nav{position:absolute;z-index:3;border:0;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(26,42,58,.86);border-radius:.5em;transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
            .cmi2-lightbox-close{right:18px;top:14px;width:2.5em;height:2.5em;font-size:28px}
            .cmi2-lightbox-nav{top:50%;transform:translateY(-50%);width:3em;height:4.2em;font-size:30px}
            .cmi2-lightbox-prev{left:16px}.cmi2-lightbox-next{right:16px}
            .cmi2-lightbox-close.focus,.cmi2-lightbox-close.hover,.cmi2-lightbox-nav.focus,.cmi2-lightbox-nav.hover{background:linear-gradient(45deg,#43cea2,#185a9d);box-shadow:0 0 .6em rgba(67,206,162,.4);transform:translateY(-50%) scale(1.04)}
            .cmi2-lightbox-close.focus,.cmi2-lightbox-close.hover{transform:scale(1.04)}
            .cmi2-lightbox-count{position:absolute;left:50%;bottom:15px;transform:translateX(-50%);color:rgba(255,255,255,.72);font-size:13px;background:rgba(26,42,58,.86);padding:.35em .75em;border-radius:.5em}
            .cmi2-empty{padding:20px;text-align:center;color:rgba(255,255,255,.55)}
            .button--cinemax-movie-info-v3 svg{width:1.35em;height:1.35em;margin-right:.35em;fill:currentColor}
            .button--cinemax-movie-info-v3{border-radius:.5em!important}
            @media(max-width:600px){
                .cmi2{padding:2px 8px 28px}
                .cmi2-hero{height:235px;border-radius:.8em}
                .cmi2-hero-content{left:14px;right:14px;bottom:14px}
                .cmi2-title{font-size:25px}
                .cmi2-grid{grid-template-columns:1fr}
                .cmi2-person{flex-basis:92px;width:92px}
                .cmi2-person img{height:110px}
                .cmi2-shot{flex-basis:170px;width:170px;height:100px}
                .cmi2-lightbox{padding:12px}
                .cmi2-lightbox img{max-width:92vw;max-height:80vh}
                .cmi2-lightbox-nav{width:2.7em;height:3.5em;font-size:25px}
                .cmi2-lightbox-prev{left:7px}.cmi2-lightbox-next{right:7px}
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
            html += '<div class="cmi2-person selector" data-person-id="' + esc(p.id || '') + '" data-person-name="' + esc(p.name || '') + '" tabindex="0">' +
                (img ? '<img loading="lazy" src="' + esc(img) + '" onerror="this.style.display=\'none\'">' : '<div style="height:122px"></div>') +
                '<div class="cmi2-person-name">' + esc(p.name || '') + '</div>' +
                '<div class="cmi2-person-role">' + esc(p.character || p.job || '') + '</div>' +
                '</div>';
        });
        return html + '</div></div>';
    }

    function gallerySection(details) {
        const shots = details && details.images && Array.isArray(details.images.backdrops) ? details.images.backdrops : [];
        if (!shots.length) return '';
        let html = '<div class="cmi2-section"><div class="cmi2-section-title">Кадры из фильма</div><div class="cmi2-gallery">';
        shots.slice(0, 30).forEach(function (shot, index) {
            if (!shot || !shot.file_path) return;
            html += '<div class="cmi2-shot selector" data-shot-index="' + index + '" data-shot-path="' + esc(shot.file_path) + '" tabindex="0">' +
                '<img loading="lazy" src="' + esc(image(shot.file_path, 'w780')) + '"></div>';
        });
        return html + '</div></div>';
    }

    function recommendationsSection(details) {
        let list = details && details.recommendations && details.recommendations.results;
        if (!Array.isArray(list) || !list.length) list = details && details.similar && details.similar.results;
        if (!Array.isArray(list) || !list.length) return '';
        list = list.filter(function (m) { return m && m.id && (m.poster_path || m.backdrop_path); }).slice(0, 20);
        if (!list.length) return '';
        let html = '<div class="cmi2-section"><div class="cmi2-section-title">Похожие фильмы и сериалы</div><div class="cmi2-media">';
        list.forEach(function (m) {
            const name = m.title || m.name || '';
            const date = m.release_date || m.first_air_date || '';
            const type = m.media_type === 'tv' || m.name ? 'Сериал' : 'Фильм';
            const poster = m.poster_path || m.backdrop_path;
            html += '<div class="cmi2-media-card selector" data-media-id="' + esc(m.id) + '" data-media-type="' + esc(m.media_type || (m.name ? 'tv' : 'movie')) + '" tabindex="0">' +
                '<img loading="lazy" src="' + esc(image(poster, 'w342')) + '" onerror="this.style.display=\'none\'">' +
                '<div class="cmi2-media-title">' + esc(name) + '</div>' +
                '<div class="cmi2-media-meta">' + (m.vote_average ? '★ ' + Number(m.vote_average).toFixed(1) + '  •  ' : '') + esc(String(date).slice(0,4)) + '  •  ' + type + '</div>' +
                '</div>';
        });
        return html + '</div></div>';
    }

    function openPerson(personId, personName) {
        if (!personId || !Lampa.Activity || !Lampa.Activity.push) return;
        try {
            Lampa.Modal.close();
            $('.modal--large').remove();
        } catch (e) {}
        try {
            Lampa.Activity.push({
                url: '',
                title: personName || 'Актёр',
                component: 'actor',
                id: personId,
                person_id: personId,
                source: 'tmdb'
            });
        } catch (e) {
            log('person navigation error', e);
            try { Lampa.Noty.show('Не удалось открыть страницу персоны'); } catch (x) {}
        }
    }

    function openMedia(id, mediaType) {
        if (!id || !Lampa.Activity || !Lampa.Activity.push) return;
        try {
            Lampa.Modal.close();
            $('.modal--large').remove();
        } catch (e) {}
        try {
            Lampa.Activity.push({
                url: '',
                title: '',
                component: 'full',
                id: id,
                method: mediaType === 'tv' ? 'tv' : 'movie',
                source: 'tmdb'
            });
        } catch (e) { log('media navigation error', e); }
    }

    function openShotGallery(paths, startIndex) {
        paths = (paths || []).filter(Boolean);
        if (!paths.length) return;

        let index = Math.max(0, Math.min(Number(startIndex) || 0, paths.length - 1));
        let closed = false;
        let touchStartX = 0;
        let touchStartY = 0;

        const root = $('<div class="cmi2-lightbox" tabindex="0" role="dialog" aria-label="Кадры из фильма">' +
            '<button type="button" class="cmi2-lightbox-close selector" aria-label="Закрыть">×</button>' +
            '<button type="button" class="cmi2-lightbox-nav cmi2-lightbox-prev selector" aria-label="Предыдущий кадр">‹</button>' +
            '<img draggable="false" alt="Кадр из фильма">' +
            '<button type="button" class="cmi2-lightbox-nav cmi2-lightbox-next selector" aria-label="Следующий кадр">›</button>' +
            '<div class="cmi2-lightbox-count"></div>' +
            '</div>');

        const img = root.find('img');
        const count = root.find('.cmi2-lightbox-count');
        const closeBtn = root.find('.cmi2-lightbox-close');
        const prevBtn = root.find('.cmi2-lightbox-prev');
        const nextBtn = root.find('.cmi2-lightbox-next');

        function draw() {
            img.attr('src', image(paths[index], 'original'));
            count.text((index + 1) + ' / ' + paths.length);
        }

        function close() {
            if (closed) return;
            closed = true;
            document.removeEventListener('keydown', keyHandler, true);
            root.off('touchstart touchend');
            root.remove();
            if (Lampa.Controller) {
                try { Lampa.Controller.toggle('content'); } catch (e) {}
            }
        }

        function next() {
            index = (index + 1) % paths.length;
            draw();
        }

        function prev() {
            index = (index - 1 + paths.length) % paths.length;
            draw();
        }

        function keyHandler(e) {
            if (closed) return;
            const key = e.key || e.code;
            if (key === 'ArrowRight' || key === 'Right') {
                e.preventDefault(); e.stopPropagation(); next(); return;
            }
            if (key === 'ArrowLeft' || key === 'Left') {
                e.preventDefault(); e.stopPropagation(); prev(); return;
            }
            if (key === 'Escape' || key === 'Esc' || key === 'Backspace') {
                e.preventDefault(); e.stopPropagation(); close();
            }
        }

        closeBtn.on('hover:enter click', function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            close();
        });
        prevBtn.on('hover:enter click', function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            prev();
        });
        nextBtn.on('hover:enter click', function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            next();
        });

        root.on('click', function (e) {
            if (e.target === root[0]) close();
        });

        root.on('touchstart', function (e) {
            const t = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0] : null;
            if (!t) return;
            touchStartX = t.clientX;
            touchStartY = t.clientY;
        });
        root.on('touchend', function (e) {
            const t = e.originalEvent && e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : null;
            if (!t) return;
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                if (dx < 0) next(); else prev();
            }
        });

        document.addEventListener('keydown', keyHandler, true);
        $('body').append(root);
        draw();
        setTimeout(function () {
            try { root[0].focus(); } catch (e) {}
        }, 0);
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
        html += '<button type="button" class="cmi2-close selector" aria-label="Закрыть">×</button>';
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

        html += gallerySection(details);
        html += recommendationsSection(details);
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

        tmdbGet(type + '/' + id + '?append_to_response=credits,external_ids,images,recommendations,similar,release_dates,content_ratings')
            .then(function (details) {
                const html = $(render(movie, details || {}));
                loading.replaceWith(html);
                html.find('.cmi2-close').on('hover:enter click', function (e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    Lampa.Modal.close();
                    $('.modal--large').remove();
                    if (Lampa.Controller) Lampa.Controller.toggle('content');
                });
                html.find('.selector').on('hover:enter', function () {
                    const el = $(this);
                    el.addClass('focus');
                    if (el.hasClass('cmi2-close')) return;
                    if (el.hasClass('cmi2-person')) {
                        openPerson(el.attr('data-person-id'), el.attr('data-person-name'));
                    } else if (el.hasClass('cmi2-media-card')) {
                        openMedia(el.attr('data-media-id'), el.attr('data-media-type'));
                    } else if (el.hasClass('cmi2-shot')) {
                        const paths = [];
                        html.find('.cmi2-shot').each(function () { paths.push($(this).attr('data-shot-path')); });
                        const idx = Number(el.attr('data-shot-index')) || 0;
                        openShotGallery(paths, idx);
                    }
                });
                html.find('.selector').on('hover:leave', function () { $(this).removeClass('focus'); });
                html.find('.selector').on('click', function (e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    const el = $(this);
                    if (el.hasClass('cmi2-close')) return;
                    if (el.hasClass('cmi2-person')) openPerson(el.attr('data-person-id'), el.attr('data-person-name'));
                    else if (el.hasClass('cmi2-media-card')) openMedia(el.attr('data-media-id'), el.attr('data-media-type'));
                    else if (el.hasClass('cmi2-shot')) {
                        const paths = [];
                        html.find('.cmi2-shot').each(function () { paths.push($(this).attr('data-shot-path')); });
                        openShotGallery(paths, Number(el.attr('data-shot-index')) || 0);
                    }
                });
            })
            .catch(function (error) {
                log('TMDB error', error);
                loading.html('<div class="cmi2-empty">Не удалось загрузить информацию<br><small>' + esc(error && error.message || '') + '</small></div>');
            });
    }

    function addButton(movie) {
        $('.' + BUTTON_CLASS + ', .button--cinemax-movie-info-v2').remove();
        const button = $(`
            <div class="full-start__button selector ${BUTTON_CLASS}">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-15Zm2.5-.5a.5.5 0 0 0-.5.5v15a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-15a.5.5 0 0 0-.5-.5h-11ZM9 7h6v2H9V7Zm0 4h6v2H9v-2Zm0 4h4v2H9v-2Z"/>
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
        $('#cinemax-movie-info-v2-style').remove();
        $('.button--cinemax-movie-info-v2').remove();
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
