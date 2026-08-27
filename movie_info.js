/*
 * CinemaX Movie Info — SIMPLE
 * Только: кнопка -> окно с базовой информацией о фильме/сериале.
 * Без SettingsApi, без Fanart.tv, без внешнего fetch.
 * Данные берутся из уже подключенного в Lampa TMDB source.
 */
(function () {
    'use strict';

    var FLAG = '__cinemax_movie_info_simple_loaded';
    if (window[FLAG]) return;
    window[FLAG] = true;

    var STYLE_ID = 'cinemax-movie-info-simple-style';

    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function image(path, size) {
        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        return 'https://image.tmdb.org/t/p/' + (size || 'w780') + path;
    }

    function isTV(movie) {
        return !!(movie && (
            movie.first_air_date ||
            movie.number_of_seasons ||
            movie.name
        ));
    }

    function year(movie) {
        var date = movie && (movie.release_date || movie.first_air_date);
        return date ? String(date).slice(0, 4) : '';
    }

    function runtime(movie) {
        var minutes = Number(movie && movie.runtime || 0);

        if (!minutes && movie && Array.isArray(movie.episode_run_time)) {
            minutes = Number(movie.episode_run_time[0] || 0);
        }

        if (!minutes) return '';

        var h = Math.floor(minutes / 60);
        var m = minutes % 60;

        if (h && m) return h + ' ч ' + m + ' мин';
        if (h) return h + ' ч';
        return m + ' мин';
    }

    function tmdbGet(path, ok, fail) {
        try {
            if (!Lampa.Api ||
                !Lampa.Api.sources ||
                !Lampa.Api.sources.tmdb ||
                typeof Lampa.Api.sources.tmdb.get !== 'function') {
                fail(new Error('TMDB source недоступен'));
                return;
            }

            Lampa.Api.sources.tmdb.get(path, {}, ok, fail);
        } catch (e) {
            fail(e);
        }
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
            '.cmi-page{position:relative;box-sizing:border-box;width:100%;min-height:100%;' +
            'background:#101112;color:#fff;overflow:hidden;font-family:inherit}' +

            '.cmi-page:before{content:"";position:absolute;inset:0;z-index:0;' +
            'background:var(--cmi-bg) center top/cover no-repeat;filter:blur(28px);' +
            'transform:scale(1.08);opacity:.30}' +

            '.cmi-page:after{content:"";position:absolute;inset:0;z-index:0;' +
            'background:linear-gradient(to bottom,rgba(10,12,13,.12),#101112 48%,#101112 100%)}' +

            '.cmi-page>*{position:relative;z-index:1}' +

            '.cmi-top{height:58px;display:flex;align-items:center;padding:0 16px;box-sizing:border-box}' +
            '.cmi-title{font-size:18px;font-weight:700;opacity:.9}' +

            '.cmi-close{position:absolute;right:14px;top:9px;z-index:20;' +
            'width:42px;height:42px;padding:0;border-radius:50%;' +
            'border:1px solid rgba(255,255,255,.18);' +
            'background:rgba(15,17,18,.75);color:#fff;font-size:30px;' +
            'line-height:38px;text-align:center;cursor:pointer}' +

            '.cmi-hero{position:relative;margin:0 16px;height:320px;border-radius:18px;' +
            'overflow:hidden;background:#202223}' +

            '.cmi-hero img{width:100%;height:100%;object-fit:cover;display:block}' +

            '.cmi-gradient{position:absolute;inset:0;' +
            'background:linear-gradient(to top,rgba(5,7,8,.98),rgba(5,7,8,.48) 48%,rgba(5,7,8,.02) 100%)}' +

            '.cmi-info{position:absolute;left:22px;right:22px;bottom:20px}' +
            '.cmi-info h1{margin:0;font-size:32px;line-height:1.08;font-weight:800}' +
            '.cmi-original{margin-top:6px;font-size:16px;color:rgba(255,255,255,.65)}' +

            '.cmi-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}' +
            '.cmi-chip{padding:9px 12px;border-radius:12px;' +
            'background:rgba(10,12,13,.64);border:1px solid rgba(255,255,255,.13);' +
            'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-size:15px}' +

            '.cmi-body{padding:0 16px 30px}' +
            '.cmi-section{margin-top:22px}' +
            '.cmi-heading{margin:0 0 10px 4px;font-size:16px;letter-spacing:1.1px;color:rgba(255,255,255,.55)}' +

            '.cmi-description{padding:17px;border-radius:16px;background:#1b1e20;' +
            'font-size:16px;line-height:1.6;color:rgba(255,255,255,.9)}' +

            '.cmi-row{padding:13px 15px;margin-bottom:7px;border-radius:14px;background:#1b1e20}' +
            '.cmi-row b{display:block;margin-bottom:4px;font-size:11px;letter-spacing:.7px;color:rgba(255,255,255,.42)}' +
            '.cmi-row span{font-size:15px;color:rgba(255,255,255,.9)}' +

            '.button--cinemax-movie-info svg{width:20px;height:20px;margin-right:7px}' +

            '@media(max-width:600px){' +
            '.cmi-top{height:52px}.cmi-hero{height:285px;margin:0 10px;border-radius:16px}' +
            '.cmi-info{left:17px;right:17px;bottom:16px}.cmi-info h1{font-size:27px}' +
            '.cmi-body{padding-left:10px;padding-right:10px}.cmi-chip{font-size:13px;padding:8px 10px}' +
            '}';

        document.head.appendChild(style);
    }

    function close() {
        try {
            Lampa.Modal.close();
        } catch (e) {}

        $('.cmi-page').remove();

        try {
            Lampa.Controller.toggle('content');
        } catch (e2) {}
    }

    function render(movie) {
        movie = movie || {};

        var type = isTV(movie) ? 'tv' : 'movie';
        var title = movie.title || movie.name || 'Подробнее';
        var original = movie.original_title || movie.original_name || '';
        var backdrop = image(movie.backdrop_path, 'w1280');
        var poster = image(movie.poster_path, 'w780');
        var hero = backdrop || poster;

        var genres = '';
        if (Array.isArray(movie.genres)) {
            genres = movie.genres.map(function (g) {
                return g && g.name ? g.name : '';
            }).filter(Boolean).join(' • ');
        }

        var chips = '';

        if (movie.vote_average) {
            chips += '<span class="cmi-chip">★ ' +
                esc(Number(movie.vote_average).toFixed(1)) + '</span>';
        }

        if (movie.vote_count) {
            chips += '<span class="cmi-chip">' +
                esc(Number(movie.vote_count).toLocaleString('ru-RU')) +
                ' оценок</span>';
        }

        if (year(movie)) {
            chips += '<span class="cmi-chip">' + esc(year(movie)) + '</span>';
        }

        var rt = runtime(movie);
        if (rt) {
            chips += '<span class="cmi-chip">' + esc(rt) + '</span>';
        }

        if (type === 'tv' && movie.number_of_seasons) {
            chips += '<span class="cmi-chip">' +
                esc(movie.number_of_seasons) + ' сез.</span>';
        }

        var rows = '';

        if (genres) {
            rows += '<div class="cmi-row"><b>ЖАНРЫ</b><span>' +
                esc(genres) + '</span></div>';
        }

        if (movie.overview) {
            // Description is rendered separately.
        }

        if (movie.release_date || movie.first_air_date) {
            rows += '<div class="cmi-row"><b>ДАТА ВЫХОДА</b><span>' +
                esc(movie.release_date || movie.first_air_date) + '</span></div>';
        }

        if (movie.status) {
            rows += '<div class="cmi-row"><b>СТАТУС</b><span>' +
                esc(movie.status) + '</span></div>';
        }

        var html =
            '<div class="cmi-page" style="--cmi-bg:url(\'' + esc(hero) + '\')">' +

                '<div class="cmi-top">' +
                    '<div class="cmi-title">Подробнее</div>' +
                    '<button class="cmi-close selector" type="button">×</button>' +
                '</div>' +

                '<div class="cmi-hero">' +
                    (hero ? '<img src="' + esc(hero) + '" alt="">' : '') +
                    '<div class="cmi-gradient"></div>' +
                    '<div class="cmi-info">' +
                        '<h1>' + esc(title) + '</h1>' +
                        (original && original !== title ?
                            '<div class="cmi-original">' + esc(original) + '</div>' : '') +
                        '<div class="cmi-chips">' + chips + '</div>' +
                    '</div>' +
                '</div>' +

                '<div class="cmi-body">' +

                    (movie.tagline ?
                        '<div class="cmi-section">' +
                            '<div class="cmi-description"><i>«' +
                            esc(movie.tagline) + '»</i></div>' +
                        '</div>' : '') +

                    (movie.overview ?
                        '<div class="cmi-section">' +
                            '<div class="cmi-heading">ОПИСАНИЕ</div>' +
                            '<div class="cmi-description">' +
                            esc(movie.overview) +
                            '</div>' +
                        '</div>' : '') +

                    (rows ?
                        '<div class="cmi-section">' +
                            '<div class="cmi-heading">ИНФОРМАЦИЯ</div>' +
                            rows +
                        '</div>' : '') +

                '</div>' +
            '</div>';

        var modal = $(html);

        modal.on('click', '.cmi-close', function (e) {
            e.preventDefault();
            e.stopPropagation();
            close();
        });

        Lampa.Modal.open({
            title: '',
            html: modal,
            size: 'large',
            style: 'margin-top:10px;',
            mask: true,
            onBack: function () {
                close();
            }
        });
    }

    function openInfo(movie) {
        if (!movie) return;

        addStyles();

        Lampa.Loading.start();

        var type = isTV(movie) ? 'tv' : 'movie';
        var id = movie.id;

        if (!id) {
            Lampa.Loading.stop();
            render(movie);
            return;
        }

        tmdbGet(
            type + '/' + encodeURIComponent(String(id)) +
            '?append_to_response=images',
            function (details) {
                Lampa.Loading.stop();
                render(details || movie);
            },
            function (error) {
                console.error('[CinemaX Movie Info]', error);
                Lampa.Loading.stop();
                render(movie);
            }
        );
    }

    function addButton(event) {
        if (!event || !event.data || !event.data.movie) return;

        var buttons = $('.full-start-new__buttons');

        if (!buttons.length) {
            buttons = $('.full-start__buttons');
        }

        if (!buttons.length) return;

        $('.button--cinemax-movie-info').remove();

        var button = $(
            '<div class="full-start__button selector button--cinemax-movie-info">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="9"></circle>' +
                '<path d="M12 10v6"></path>' +
                '<circle cx="12" cy="7" r=".8" fill="currentColor"></circle>' +
                '</svg>' +
                '<span>Подробнее</span>' +
            '</div>'
        );

        buttons.append(button);

        button.on('hover:enter', function () {
            openInfo(event.data.movie);
        });

        button.on('click', function () {
            openInfo(event.data.movie);
        });
    }

    try {
        addStyles();

        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite') {
                addButton(event);
            }
        });
    } catch (e) {
        console.error('[CinemaX Movie Info] init error:', e);
    }

})();
