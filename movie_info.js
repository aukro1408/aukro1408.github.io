(function () {
    'use strict';

    /*
     * CinemaX Movie Info
     * Standalone plugin.
     *
     * This plugin is intentionally independent from the comments plugin.
     * It only borrows the same Lampa "full" event -> movie object -> modal logic.
     */

    var PLUGIN_ID = 'cinemax_movie_info';
    var STYLE_ID = 'cinemax_movie_info_style';

    function getMovieImage(path, size) {
        try {
            if (!path || !Lampa.TMDB || !Lampa.TMDB.image) return '';
            return Lampa.TMDB.image('t/p/' + (size || 'w780') + path);
        } catch (e) {
            return '';
        }
    }

    function esc(value) {
        value = value === null || value === undefined ? '' : String(value);
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
            '.cmi-modal{position:relative;color:#fff;background:#101314;border-radius:14px;overflow:hidden;}' +
            '.cmi-hero{position:relative;width:100%;height:260px;background:#171a1b center/cover no-repeat;overflow:hidden;}' +
            '.cmi-hero:after{content:"";position:absolute;left:0;right:0;bottom:0;height:75%;background:linear-gradient(to top,#101314,rgba(16,19,20,0));}' +
            '.cmi-body{position:relative;padding:0 24px 28px;margin-top:-55px;z-index:2;}' +
            '.cmi-main{display:flex;align-items:flex-end;gap:20px;}' +
            '.cmi-poster{width:145px;min-width:145px;height:218px;border-radius:11px;object-fit:cover;background:#202223;box-shadow:0 8px 24px rgba(0,0,0,.45);}' +
            '.cmi-info{min-width:0;padding-bottom:5px;}' +
            '.cmi-title{font-size:30px;line-height:1.12;font-weight:800;margin:0 0 6px;color:#fff;}' +
            '.cmi-original{font-size:14px;color:rgba(255,255,255,.55);margin-bottom:12px;}' +
            '.cmi-meta{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px;}' +
            '.cmi-chip{display:inline-flex;align-items:center;min-height:31px;padding:0 10px;border-radius:9px;background:rgba(255,255,255,.09);color:rgba(255,255,255,.9);font-size:13px;white-space:nowrap;}' +
            '.cmi-rating{font-weight:800;color:#43cea2;}' +
            '.cmi-section{margin-top:24px;}' +
            '.cmi-label{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.42);margin-bottom:8px;font-weight:700;}' +
            '.cmi-overview{font-size:15px;line-height:1.55;color:rgba(255,255,255,.86);}' +
            '.cmi-tagline{font-size:15px;line-height:1.45;color:rgba(255,255,255,.58);font-style:italic;margin-bottom:12px;}' +
            '.cmi-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;}' +
            '.cmi-cell{padding:11px 13px;border-radius:10px;background:rgba(255,255,255,.055);min-width:0;}' +
            '.cmi-cell b{display:block;font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:4px;}' +
            '.cmi-cell span{display:block;font-size:14px;color:rgba(255,255,255,.88);word-break:break-word;}' +
            '.cmi-empty{color:rgba(255,255,255,.4);}' +
            '.cmi-close{position:absolute;top:9px;right:9px;z-index:20;width:38px;height:38px;border:1px solid rgba(255,255,255,.2);border-radius:50%;background:rgba(12,14,15,.72);color:#fff;display:flex;align-items:center;justify-content:center;font-size:25px;line-height:1;}' +
            '.cmi-close.focus{background:rgba(255,255,255,.16);}' +
            '@media(max-width:600px){' +
            '.cmi-hero{height:205px;}' +
            '.cmi-body{padding:0 12px 20px;margin-top:-35px;}' +
            '.cmi-main{gap:12px;align-items:flex-end;}' +
            '.cmi-poster{width:92px;min-width:92px;height:138px;border-radius:9px;}' +
            '.cmi-title{font-size:21px;}' +
            '.cmi-original{font-size:11px;margin-bottom:7px;}' +
            '.cmi-meta{gap:5px;margin-bottom:5px;}' +
            '.cmi-chip{font-size:10px;min-height:25px;padding:0 7px;border-radius:7px;}' +
            '.cmi-section{margin-top:18px;}' +
            '.cmi-overview{font-size:13px;line-height:1.5;}' +
            '.cmi-grid{grid-template-columns:1fr;gap:6px;}' +
            '.cmi-cell{padding:9px 10px;}' +
            '}';

        document.head.appendChild(style);
    }

    function valueOrDash(value) {
        return value ? esc(value) : '<span class="cmi-empty">—</span>';
    }

    function formatMoney(value) {
        if (!value) return '';
        var n = Number(value);
        if (!isFinite(n) || n <= 0) return '';
        try {
            return new Intl.NumberFormat('ru-RU').format(n) + ' $';
        } catch (e) {
            return String(n) + ' $';
        }
    }

    function formatRuntime(minutes) {
        if (!minutes) return '';
        var m = Number(minutes);
        if (!isFinite(m) || m <= 0) return '';
        var h = Math.floor(m / 60);
        var min = m % 60;
        return h ? (h + ' ч' + (min ? ' ' + min + ' мин' : '')) : (min + ' мин');
    }

    function genres(movie) {
        if (!movie || !movie.genres) return '';
        if (Array.isArray(movie.genres)) {
            return movie.genres.map(function (g) {
                return typeof g === 'string' ? g : (g && g.name ? g.name : '');
            }).filter(Boolean).join(' • ');
        }
        return String(movie.genres);
    }

    function countries(movie) {
        if (!movie) return '';
        var list = movie.production_countries || movie.origin_country || [];
        if (!Array.isArray(list)) return '';
        return list.map(function (c) {
            if (typeof c === 'string') return c;
            return c.name || c.iso_3166_1 || '';
        }).filter(Boolean).join(', ');
    }

    function openInfo(movie) {
        movie = movie || {};
        addStyles();

        var title = movie.title || movie.name || 'Фильм';
        var original = movie.original_title || movie.original_name || '';
        var date = movie.release_date || movie.first_air_date || '';
        var year = date ? String(date).slice(0, 4) : '';
        var poster = getMovieImage(movie.poster_path, 'w500');
        var backdrop = getMovieImage(movie.backdrop_path, 'w1280') || poster;
        var rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '';
        var votes = movie.vote_count ? String(movie.vote_count) : '';
        var runtime = formatRuntime(movie.runtime || (movie.episode_run_time && movie.episode_run_time[0]));
        var genreText = genres(movie);
        var countryText = countries(movie);
        var budget = formatMoney(movie.budget);
        var revenue = formatMoney(movie.revenue);

        var html =
            '<div class="cmi-modal">' +
                '<div class="cmi-hero" style="background-image:url(\'' + String(backdrop || '').replace(/'/g, '%27') + '\')"></div>' +
                '<div class="cmi-body">' +
                    '<div class="cmi-main">' +
                        (poster ? '<img class="cmi-poster" src="' + esc(poster) + '" alt="">' : '') +
                        '<div class="cmi-info">' +
                            '<div class="cmi-title">' + esc(title) + '</div>' +
                            (original && original !== title ? '<div class="cmi-original">' + esc(original) + '</div>' : '') +
                            '<div class="cmi-meta">' +
                                (rating ? '<span class="cmi-chip cmi-rating">★ ' + esc(rating) + '</span>' : '') +
                                (votes ? '<span class="cmi-chip">' + esc(votes) + ' оценок</span>' : '') +
                                (year ? '<span class="cmi-chip">' + esc(year) + '</span>' : '') +
                                (runtime ? '<span class="cmi-chip">' + esc(runtime) + '</span>' : '') +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    (movie.tagline ? '<div class="cmi-section"><div class="cmi-tagline">' + esc(movie.tagline) + '</div></div>' : '') +

                    '<div class="cmi-section">' +
                        '<div class="cmi-label">Описание</div>' +
                        '<div class="cmi-overview">' + (movie.overview ? esc(movie.overview) : '<span class="cmi-empty">Описание отсутствует</span>') + '</div>' +
                    '</div>' +

                    '<div class="cmi-section">' +
                        '<div class="cmi-label">Информация</div>' +
                        '<div class="cmi-grid">' +
                            '<div class="cmi-cell"><b>Жанры</b><span>' + valueOrDash(genreText) + '</span></div>' +
                            '<div class="cmi-cell"><b>Страны</b><span>' + valueOrDash(countryText) + '</span></div>' +
                            '<div class="cmi-cell"><b>Дата выхода</b><span>' + valueOrDash(date) + '</span></div>' +
                            '<div class="cmi-cell"><b>Статус</b><span>' + valueOrDash(movie.status) + '</span></div>' +
                            '<div class="cmi-cell"><b>Бюджет</b><span>' + valueOrDash(budget) + '</span></div>' +
                            '<div class="cmi-cell"><b>Сборы</b><span>' + valueOrDash(revenue) + '</span></div>' +
                            '<div class="cmi-cell"><b>TMDB ID</b><span>' + valueOrDash(movie.id) + '</span></div>' +
                            '<div class="cmi-cell"><b>Тип</b><span>' + valueOrDash(movie.name ? 'Сериал' : 'Фильм') + '</span></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        Lampa.Modal.open({
            title: '',
            html: html,
            size: 'large',
            style: 'margin-top:10px;',
            mask: true,
            onBack: function () {
                Lampa.Modal.close();
                try {
                    $('.modal--large').remove();
                    Lampa.Controller.toggle('content');
                } catch (e) {}
            }
        });

        setTimeout(function () {
            var head = document.querySelector('.modal__head');
            if (head) {
                head.style.position = 'relative';
                head.style.minHeight = '48px';
                head.innerHTML =
                    '<div style="position:absolute;left:18px;right:58px;top:50%;transform:translateY(-50%);font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff;">' +
                    esc(title) +
                    '</div>' +
                    '<div class="cmi-close selector" aria-label="Закрыть">×</div>';

                $('.cmi-close').on('hover:enter click', function () {
                    Lampa.Modal.close();
                    try {
                        $('.modal--large').remove();
                        Lampa.Controller.toggle('content');
                    } catch (e) {}
                });
            }
        }, 20);
    }

    function addButton(event) {
        if (!event || !event.data || !event.data.movie) return;

        var movie = event.data.movie;
        var $buttons = $('.full-start-new__buttons');
        if (!$buttons.length) return;

        $('.cinemax-movie-info-button').remove();

        var icon =
            '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
            '<path d="M12 10.5V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<circle cx="12" cy="7.5" r="1.1" fill="currentColor"/>' +
            '</svg>';

        var $button = $(
            '<div class="full-start__button selector cinemax-movie-info-button">' +
            icon +
            '<span>Подробнее</span>' +
            '</div>'
        );

        $buttons.append($button);

        $button.on('hover:enter', function () {
            openInfo(movie);
        });
    }

    function start() {
        if (window.cinemax_movie_info_plugin) return;
        window.cinemax_movie_info_plugin = true;

        addStyles();

        Lampa.Listener.follow('full', function (event) {
            if (event && event.type === 'complite') {
                setTimeout(function () {
                    addButton(event);
                }, 30);
            }
        });
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event && event.type === 'ready') start();
        });
    }
})();
