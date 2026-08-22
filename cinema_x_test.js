/**
 * aukro1408 — Hero Новинки проката
 * Автор: aukro1408
 * Версия: 1.0.0
 *
 * Чистый standalone-плагин для Lampa.
 * Не зависит от Flixio и не заменяет основной TMDB API.
 */
(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;
    if (window.AUKRO1408_HERO_LOADED) return;
    window.AUKRO1408_HERO_LOADED = true;

    var LANG = (Lampa.Storage && Lampa.Storage.get('language', 'ru') || 'ru').toLowerCase();
    if (LANG === 'ua') LANG = 'uk';
    if (['ru', 'uk', 'en', 'pl'].indexOf(LANG) === -1) LANG = 'en';

    var TITLE = {
        ru: 'Новинки проката',
        uk: 'Новинки прокату',
        en: 'New theatrical releases',
        pl: 'Nowości kinowe'
    };

    var API_KEY = null;

    function getTmdbKey() {
        try {
            if (Lampa.TMDB && Lampa.TMDB.key) return Lampa.TMDB.key;
            if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && Lampa.Api.sources.tmdb.key) {
                return Lampa.Api.sources.tmdb.key;
            }
            if (Lampa.Storage) {
                return Lampa.Storage.get('tmdb_key', '');
            }
        } catch (e) {}
        return '';
    }

    function tmdbUrl(path, params) {
        var query = [];
        params = params || {};

        API_KEY = getTmdbKey();
        if (API_KEY) query.push('api_key=' + encodeURIComponent(API_KEY));

        query.push('language=' + encodeURIComponent(LANG === 'uk' ? 'uk-UA' : LANG === 'ru' ? 'ru-RU' : LANG === 'pl' ? 'pl-PL' : 'en-US'));

        Object.keys(params).forEach(function (key) {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        });

        if (Lampa.TMDB && typeof Lampa.TMDB.api === 'function') {
            return Lampa.TMDB.api(path + '?' + query.join('&'));
        }

        return 'https://api.themoviedb.org/3/' + path + '?' + query.join('&');
    }

    function poster(path) {
        if (!path) return '';
        if (typeof Lampa.TMDB !== 'undefined' && typeof Lampa.TMDB.image === 'function') {
            return Lampa.TMDB.image(path, 'w780');
        }
        return 'https://image.tmdb.org/t/p/w780' + path;
    }

    function backdrop(path) {
        if (!path) return '';
        if (typeof Lampa.TMDB !== 'undefined' && typeof Lampa.TMDB.image === 'function') {
            return Lampa.TMDB.image(path, 'w1280');
        }
        return 'https://image.tmdb.org/t/p/w1280' + path;
    }

    function esc(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getYear(movie) {
        var date = movie.release_date || '';
        return date ? date.slice(0, 4) : '';
    }

    function getMovieTitle(movie) {
        return movie.title || movie.original_title || '';
    }

    function makeHero(movie) {
        var title = getMovieTitle(movie);
        var year = getYear(movie);
        var rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '';
        var bg = backdrop(movie.backdrop_path || movie.poster_path);
        var posterUrl = poster(movie.poster_path);

        var genres = '';
        if (movie.genre_ids && movie.genre_ids.length) {
            genres = movie.genre_ids.slice(0, 3).map(function (id) {
                var map = {
                    28: 'Экшен',
                    12: 'Приключения',
                    16: 'Анимация',
                    35: 'Комедия',
                    80: 'Криминал',
                    99: 'Документальный',
                    18: 'Драма',
                    10751: 'Семейный',
                    14: 'Фэнтези',
                    27: 'Ужасы',
                    9648: 'Детектив',
                    10749: 'Мелодрама',
                    878: 'Фантастика',
                    53: 'Триллер',
                    10752: 'Военный',
                    37: 'Вестерн'
                };
                return map[id] || '';
            }).filter(Boolean).join(' • ');
        }

        var root = $('<div class="aukro1408-hero"></div>');

        root.css({
            position: 'relative',
            width: '100%',
            height: '31em',
            overflow: 'hidden',
            'border-radius': '1.1em',
            'background-color': '#111',
            'background-image': 'linear-gradient(90deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.72) 34%, rgba(0,0,0,.28) 72%, rgba(0,0,0,.15) 100%), linear-gradient(0deg, rgba(0,0,0,.8), transparent 45%), url("' + bg + '")',
            'background-size': 'cover',
            'background-position': 'center'
        });

        var content = $('<div class="aukro1408-hero__content"></div>').css({
            position: 'absolute',
            left: '2.4em',
            bottom: '2.2em',
            width: '52%',
            'z-index': 3
        });

        if (posterUrl) {
            var posterEl = $('<img class="aukro1408-hero__poster">').attr('src', posterUrl).css({
                position: 'absolute',
                right: '8%',
                top: '10%',
                height: '80%',
                width: 'auto',
                'max-width': '32%',
                'object-fit': 'cover',
                'border-radius': '.8em',
                'box-shadow': '0 1.2em 3em rgba(0,0,0,.55)',
                'z-index': 2
            });
            root.append(posterEl);
        }

        var titleEl = $('<div class="aukro1408-hero__title"></div>').html(esc(title)).css({
            color: '#fff',
            'font-size': '2.5em',
            'font-weight': '700',
            'line-height': '1.05',
            'margin-bottom': '.35em'
        });

        var meta = $('<div class="aukro1408-hero__meta"></div>').css({
            display: 'flex',
            'align-items': 'center',
            gap: '.65em',
            color: 'rgba(255,255,255,.9)',
            'font-size': '1em',
            'margin-bottom': '.7em'
        });

        if (year) meta.append($('<span>').text(year));
        if (genres) meta.append($('<span>').text(genres));
        if (rating) meta.append($('<span>').text('★ ' + rating));

        var overview = $('<div class="aukro1408-hero__overview"></div>').text(movie.overview || '').css({
            color: 'rgba(255,255,255,.78)',
            'font-size': '.95em',
            'line-height': '1.45',
            display: '-webkit-box',
            '-webkit-line-clamp': '3',
            '-webkit-box-orient': 'vertical',
            overflow: 'hidden',
            'max-width': '95%'
        });

        content.append(titleEl).append(meta).append(overview);
        root.append(content);

        root.on('hover:enter', function () {
            if (Lampa.Activity && Lampa.Activity.push) {
                Lampa.Activity.push({
                    url: '',
                    component: 'full',
                    card: movie
                });
            }
        });

        return root;
    }

    function loadMovies(callback) {
        var url = tmdbUrl('movie/now_playing', {
            page: 1,
            region: LANG === 'ru' ? 'RU' : LANG === 'uk' ? 'UA' : LANG === 'pl' ? 'PL' : 'US'
        });

        if (!Lampa.Reguest) {
            callback([]);
            return;
        }

        var network = new Lampa.Reguest();

        network.silent(url, function (json) {
            var results = json && Array.isArray(json.results) ? json.results : [];
            callback(results.filter(function (item) {
                return item && (item.backdrop_path || item.poster_path);
            }).slice(0, 10));
        }, function () {
            callback([]);
        });
    }

    function addHeroRow() {
        if (!Lampa.ContentRows || typeof Lampa.ContentRows.add !== 'function') return;

        Lampa.ContentRows.add({
            index: 0,
            name: 'aukro1408_hero',
            title: TITLE[LANG] || TITLE.en,
            screen: ['main'],
            call: function () {
                return function (callback) {
                    loadMovies(function (movies) {
                        var items = [];

                        movies.forEach(function (movie) {
                            items.push({
                                title: getMovieTitle(movie),
                                img: poster(movie.poster_path),
                                backdrop: backdrop(movie.backdrop_path),
                                movie: movie,
                                component: 'aukro1408_hero_item'
                            });
                        });

                        callback({
                            results: items,
                            title: TITLE[LANG] || TITLE.en,
                            params: {
                                items: {
                                    view: 5,
                                    mapping: 'line'
                                }
                            }
                        });
                    });
                };
            }
        });
    }

    function init() {
        try {
            addHeroRow();
        } catch (e) {
            console.warn('[aukro1408] init error:', e);
        }
    }

    init();

})();
