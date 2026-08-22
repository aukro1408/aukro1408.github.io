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

    function makeHeroResultItem(movie, heightEm) {
        heightEm = heightEm || 22.5;

        var item = {
            title: getMovieTitle(movie),
            img: poster(movie.poster_path),
            params: {
                createInstance: function (element) {
                    return Lampa.Maker.make('Card', element, function (module) {
                        return module.only('Card', 'Callback');
                    });
                },
                emit: {
                    onCreate: function () {
                        try {
                            var card = $(this.html);
                            var bg = backdrop(movie.backdrop_path || movie.poster_path);

                            card.addClass('aukro1408-hero');
                            card.css({
                                'background-image': 'linear-gradient(90deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.70) 35%, rgba(0,0,0,.18) 75%, rgba(0,0,0,.08) 100%), linear-gradient(0deg, rgba(0,0,0,.78), transparent 55%), url("' + bg + '")',
                                'width': '100%',
                                'height': heightEm + 'em',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'border-radius': '1em',
                                'position': 'relative',
                                'overflow': 'hidden',
                                'box-shadow': '0 0 20px rgba(0,0,0,.45)',
                                'margin-bottom': '.6em'
                            });

                            card.find('.card__view, .card__title, .card__age, .card-marks, .card__icons, .card__quality').remove();

                            var title = esc(getMovieTitle(movie));
                            var year = esc(getYear(movie));
                            var rating = movie.vote_average ? '★ ' + Number(movie.vote_average).toFixed(1) : '';

                            var meta = [];
                            if (year) meta.push(year);
                            if (rating) meta.push(rating);

                            var posterUrl = poster(movie.poster_path);
                            var posterHtml = posterUrl
                                ? '<img src="' + posterUrl + '" style="position:absolute;right:7%;top:8%;height:84%;width:auto;max-width:30%;object-fit:cover;border-radius:.7em;box-shadow:0 1em 2.5em rgba(0,0,0,.55);z-index:2;">'
                                : '';

                            var html =
                                posterHtml +
                                '<div style="position:absolute;left:2.2em;right:34%;bottom:1.8em;z-index:3;">' +
                                    '<div style="font-size:2.35em;line-height:1.05;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.8);margin-bottom:.35em;">' + title + '</div>' +
                                    '<div style="display:flex;gap:.65em;align-items:center;color:rgba(255,255,255,.9);font-size:1em;margin-bottom:.55em;">' +
                                        meta.map(function (m) { return '<span>' + m + '</span>'; }).join('') +
                                    '</div>' +
                                    '<div style="font-size:.92em;line-height:1.4;color:rgba(255,255,255,.78);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">' +
                                        esc(movie.overview || '') +
                                    '</div>' +
                                '</div>';

                            card.append(html);
                            card[0].heroMovieData = movie;
                            card.addClass('hero-banner');
                        } catch (e) {
                            console.warn('[aukro1408] hero render:', e);
                        }
                    }
                }
            }
        };

        return item;
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
                            items.push(makeHeroResultItem(movie, 22.5));
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
