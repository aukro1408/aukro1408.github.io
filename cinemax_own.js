(function () {
    'use strict';

    /**
     * CinemaX Hero + Streamings
     *
     * Основа:
     * - Lampa.ContentRows
     * - Lampa.Maker Card
     * - Lampa.Activity
     * - Lampa.TMDB
     *
     * Плагин не меняет глобальный TMDB loader Lampa.
     * Все строки добавляются только на главную.
     */

    var PLUGIN_ID = 'cinemax_hero_streamings';
    var HERO_ROW = 'cinemax_hero_row';
    var STREAMING_ROW = 'cinemax_streaming_row';

    var CONFIG = {
        hero: {
            enabled: true,
            limit: 10,
            heightEm: 25
        },

        streamings: [
            {
                id: 'netflix',
                title: 'Netflix',
                logo: 'logos/netflix.svg',
                movie: { provider: '8', region: 'UA' },
                tv: { network: '213' },
                categories: [
                    cat('new_movies', '🎬 Новые фильмы', 'movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' }),
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' }),
                    cat('popular_movies', '🔥 Популярные фильмы', 'movie', { sort_by: 'popularity.desc' }),
                    cat('best_tv', '⭐ Лучшие сериалы', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '50' }),
                    cat('originals', '🅰️ Netflix Originals', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '500', 'vote_average.gte': '7.5' }),
                    cat('thrillers', '🤯 Запутанные триллеры', 'movie', { with_genres: '53,9648', sort_by: 'popularity.desc' }),
                    cat('scifi_fantasy', '🐉 Фантастика и фэнтези', 'tv', { with_genres: '10765', sort_by: 'popularity.desc' }),
                    cat('kdrama', '🇰🇷 K-Дорамы', 'tv', { with_original_language: 'ko', sort_by: 'popularity.desc' }),
                    cat('true_crime', '🔪 True Crime', 'tv', { with_genres: '99', with_keywords: '9840|10714', sort_by: 'popularity.desc' }),
                    cat('anime', '🍿 Аниме', 'tv', { with_genres: '16', with_keywords: '210024', sort_by: 'popularity.desc' })
                ]
            },

            {
                id: 'apple',
                title: 'Apple TV+',
                logo: 'logos/apple.svg',
                movie: { provider: '350', region: 'UA' },
                tv: { network: '2552|3235' },
                categories: [
                    cat('new_movies', '🎬 Новые фильмы', 'movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '2' }),
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '2' }),
                    cat('popular_movies', '🔥 Популярные фильмы', 'movie', { sort_by: 'popularity.desc' }),
                    cat('best_tv', '⭐ Лучшие сериалы', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '50' }),
                    cat('scifi', '🛸 Эпический Sci-Fi', 'tv', { with_genres: '10765', sort_by: 'popularity.desc' }),
                    cat('comedy', '😂 Комедии', 'tv', { with_genres: '35', sort_by: 'popularity.desc' }),
                    cat('detectives', '🕵️ Детективы', 'tv', { with_genres: '9648,80', sort_by: 'popularity.desc' }),
                    cat('originals', '🎬 Apple Original Films', 'movie', { sort_by: 'vote_average.desc', 'vote_count.gte': '100' })
                ]
            },

            {
                id: 'hbo',
                title: 'HBO / Max',
                logo: 'logos/hbo.svg',
                movie: { company: '174|49' },
                tv: { network: '49|3186' },
                categories: [
                    cat('new_movies', '🎬 Новые фильмы', 'movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '10' }),
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' }),
                    cat('popular_movies', '🔥 Популярные фильмы', 'movie', { sort_by: 'popularity.desc', 'vote_count.gte': '50' }),
                    cat('best_tv', '⭐ Лучшие сериалы', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }),
                    cat('fantasy', '🐉 Эпические саги', 'tv', { with_genres: '10765', sort_by: 'popularity.desc' }),
                    cat('drama', '🎭 Премиальные драмы', 'tv', { with_genres: '18', without_genres: '10765', sort_by: 'popularity.desc' }),
                    cat('dc', '🦇 Блокбастеры DC', 'movie', { with_keywords: '9715', sort_by: 'revenue.desc' }),
                    cat('detectives', '🧠 Мрачные детективы', 'tv', { with_genres: '80,9648', sort_by: 'vote_average.desc', 'vote_count.gte': '300' }),
                    cat('classics', '👑 Классика HBO', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '1000' })
                ]
            },

            {
                id: 'amazon',
                title: 'Prime Video',
                logo: 'logos/amazon.svg',
                movie: { provider: '119', region: 'US' },
                tv: { network: '1024' },
                categories: [
                    cat('new_movies', '🎬 Новые фильмы', 'movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' }),
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' }),
                    cat('popular_movies', '🔥 Популярные фильмы', 'movie', { sort_by: 'popularity.desc' }),
                    cat('best_tv', '⭐ Лучшие сериалы', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '300' }),
                    cat('action', '🩸 Жёсткий экшн', 'tv', { with_genres: '10759,10765', sort_by: 'popularity.desc' }),
                    cat('amazon_mgm', '🎬 Amazon MGM', 'movie', { with_companies: '1024|21', sort_by: 'popularity.desc' }),
                    cat('comedy', '😂 Комедии', 'tv', { with_genres: '35', sort_by: 'popularity.desc' }),
                    cat('thrillers', '🕵️ Триллеры', 'tv', { with_genres: '9648,18', sort_by: 'vote_average.desc', 'vote_count.gte': '300' })
                ]
            },

            {
                id: 'disney',
                title: 'Disney+',
                logo: 'logos/disney.svg',
                movie: { provider: '337', region: 'US' },
                tv: { network: '2739' },
                categories: [
                    cat('new_movies', '🎬 Новые фильмы', 'movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' }),
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' }),
                    cat('popular_movies', '🔥 Популярные фильмы', 'movie', { with_companies: '2', sort_by: 'popularity.desc' }),
                    cat('best_tv', '⭐ Лучшие сериалы', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '50' }),
                    cat('marvel', '🦸 Marvel', 'movie', { with_companies: '420', sort_by: 'release_date.desc', 'vote_count.gte': '100' }),
                    cat('starwars', '⚔️ Star Wars', 'tv', { with_companies: '1', with_keywords: '1930', sort_by: 'popularity.desc' }),
                    cat('pixar', '🧸 Pixar', 'movie', { with_companies: '3', sort_by: 'popularity.desc' }),
                    cat('fx_star', '🍷 FX / Star', 'tv', { with_networks: '88|453', sort_by: 'popularity.desc' })
                ]
            },

            {
                id: 'paramount',
                title: 'Paramount+',
                logo: 'logos/paramount.svg',
                movie: { company: '4' },
                tv: { network: '4330' },
                categories: [
                    cat('new_movies', '🎬 Новые фильмы', 'movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '10' }),
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '2' }),
                    cat('popular_movies', '🔥 Популярные фильмы', 'movie', { sort_by: 'popularity.desc' }),
                    cat('best_tv', '⭐ Лучшие сериалы', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '50' }),
                    cat('sheridan', '🤠 Вселенная Yellowstone', 'tv', { with_networks: '318|4330', with_keywords: '256112', sort_by: 'popularity.desc' }),
                    cat('star_trek', '🖖 Star Trek', 'tv', { with_networks: '4330', with_keywords: '159223', sort_by: 'first_air_date.desc' }),
                    cat('crime', '🔎 Криминал', 'tv', { with_networks: '16', with_genres: '80,18', sort_by: 'popularity.desc' }),
                    cat('kids', '🧸 Детский мир', 'tv', { with_networks: '13', sort_by: 'popularity.desc' })
                ]
            },

            {
                id: 'sky_showtime',
                title: 'SkyShowtime',
                logo: 'logos/SkyShowtime.svg',
                movie: { company: '4|33|521' },
                tv: { company: '67|115331' },
                categories: [
                    cat('new_movies', '🎬 Новые фильмы', 'movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' }),
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '2' }),
                    cat('popular_movies', '🔥 Популярные фильмы', 'movie', { with_companies: '4|33', sort_by: 'popularity.desc' }),
                    cat('best_tv', '⭐ Лучшие сериалы', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '50' }),
                    cat('blockbusters', '💥 Блокбастеры Paramount', 'movie', { with_companies: '4', sort_by: 'revenue.desc' }),
                    cat('universal', '🌎 Universal', 'movie', { with_companies: '33', sort_by: 'popularity.desc' }),
                    cat('showtime', '🌙 Showtime', 'tv', { with_companies: '67', sort_by: 'popularity.desc' }),
                    cat('dreamworks', '🐉 DreamWorks', 'movie', { with_companies: '521', sort_by: 'popularity.desc' })
                ]
            },

            {
                id: 'hulu',
                title: 'Hulu',
                logo: 'logos/Hulu.svg',
                movie: { provider: '15', region: 'US' },
                tv: { network: '453' },
                categories: [
                    cat('new_movies', '🎬 Новые фильмы', 'movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '2' }),
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '2' }),
                    cat('popular_movies', '🔥 Популярные фильмы', 'movie', { sort_by: 'popularity.desc' }),
                    cat('best_tv', '⭐ Лучшие сериалы', 'tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '50' }),
                    cat('true_crime', '🔪 True Crime', 'tv', { with_genres: '18,9648', sort_by: 'popularity.desc' }),
                    cat('comedy', '😂 Комедии', 'tv', { with_genres: '35', sort_by: 'popularity.desc' }),
                    cat('adult_animation', '🤬 Анимация для взрослых', 'tv', { with_genres: '16', sort_by: 'popularity.desc' })
                ]
            },

            {
                id: 'syfy',
                title: 'Syfy',
                logo: 'logos/Syfy.svg',
                movie: null,
                tv: { network: '77' },
                categories: [
                    cat('new_tv', '📺 Новые сериалы', 'tv', { sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '1' }),
                    cat('popular_tv', '🔥 Популярное', 'tv', { sort_by: 'popularity.desc' }),
                    cat('space', '🚀 Космос и путешествия', 'tv', { with_genres: '10765', with_keywords: '3801', sort_by: 'vote_average.desc', 'vote_count.gte': '50' }),
                    cat('monsters', '👽 Монстры и паранормальное', 'tv', { with_genres: '9648,10765', without_keywords: '3801', sort_by: 'popularity.desc' })
                ]
            }
        ]
    };

    function cat(id, title, type, params) {
        return {
            id: id,
            title: title,
            type: type,
            params: params || {}
        };
    }

    function getTmdbKey() {
        try {
            return (Lampa.TMDB && Lampa.TMDB.key) ? Lampa.TMDB.key() : '';
        } catch (e) {
            return '';
        }
    }

    function getLanguage() {
        try {
            return Lampa.Storage.get('language', 'ru') || 'ru';
        } catch (e) {
            return 'ru';
        }
    }

    function today() {
        var d = new Date();
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }

    function imageUrl(path, size) {
        if (!path) return '';
        return 'https://image.tmdb.org/t/p/' + (size || 'w1280') + path;
    }

    function esc(value) {
        return $('<div>').text(value == null ? '' : value).html();
    }

    function serialize(params) {
        var result = [];

        Object.keys(params || {}).forEach(function (key) {
            if (params[key] === undefined || params[key] === null || params[key] === '') return;

            var value = String(params[key]).replace(/\{current_date\}/g, today());

            result.push(
                encodeURIComponent(key) + '=' + encodeURIComponent(value)
            );
        });

        return result.join('&');
    }

    function buildUrl(endpoint, params) {
        var base = Lampa.TMDB.api(endpoint);
        var query = serialize(params);

        return base + (base.indexOf('?') >= 0 ? '&' : '?') +
            'api_key=' + encodeURIComponent(getTmdbKey()) +
            '&language=' + encodeURIComponent(getLanguage()) +
            (query ? '&' + query : '');
    }

    function serviceParams(service, type) {
        var result = {};

        if (type === 'movie' && service.movie) {
            if (service.movie.provider) {
                result.with_watch_providers = service.movie.provider;
                result.watch_region = service.movie.region || 'UA';
            }

            if (service.movie.company) {
                result.with_companies = service.movie.company;
            }
        }

        if (type === 'tv' && service.tv) {
            if (service.tv.network) {
                result.with_networks = service.tv.network;
            }

            if (service.tv.company) {
                result.with_companies = service.tv.company;
            }
        }

        return result;
    }

    function buildCategoryUrl(service, category, page) {
        var endpoint = category.type === 'tv' ? 'discover/tv' : 'discover/movie';
        var params = serviceParams(service, category.type);

        Object.keys(category.params || {}).forEach(function (key) {
            params[key] = category.params[key];
        });

        params.page = page || 1;

        return buildUrl(endpoint, params);
    }

    function request(url, success, fail) {
        var network = new Lampa.Reguest();

        network.silent(
            url,
            function (json) {
                success(json || {});
            },
            function () {
                if (fail) fail();
            }
        );
    }

    /* =========================================================
       HERO
       ========================================================= */

    function addHeroRow() {
        if (!CONFIG.hero.enabled) return;

        Lampa.ContentRows.add({
            index: 0,
            name: HERO_ROW,
            title: '',
            screen: ['main'],
            call: function (params, screen) {
                loadHero(params, screen);
            }
        });
    }

    function loadHero(params, screen) {
        var url = buildUrl('movie/now_playing', {
            region: 'UA',
            page: 1
        });

        request(url, function (json) {
            var movies = (json.results || []).filter(function (item) {
                return item && item.backdrop_path;
            });

            if (!movies.length) {
                request(buildUrl('trending/all/week', {
                    page: 1
                }), function (fallback) {
                    renderHero(
                        (fallback.results || []).filter(function (item) {
                            return item && item.backdrop_path;
                        }).slice(0, CONFIG.hero.limit),
                        params,
                        screen
                    );
                });
                return;
            }

            renderHero(
                movies.slice(0, CONFIG.hero.limit),
                params,
                screen
            );
        });
    }

    function renderHero(items, params, screen) {
        var result = items.map(function (item) {
            return makeHeroResultItem(item, CONFIG.hero.heightEm);
        });

        if (typeof params === 'function') {
            params(result);
        }
    }

    function makeHeroResultItem(movie, heightEm) {
        var card = Lampa.Maker.make('Card', {
            card: {
                object: movie,
                method: 'cinemax_hero',
                type: movie.media_type || (movie.name ? 'tv' : 'movie')
            },
            img: true
        });

        var element = card.render(true);
        element.addClass('cinemax-hero');

        var title = movie.title || movie.name || '';
        var backdrop = imageUrl(movie.backdrop_path, 'w1280');

        element.css({
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '1em',
            backgroundImage: 'url("' + backdrop + '")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        });

        element.find('.card__view, .card__title, .card__age, .card-marks, .card__icons, .card__quality').remove();

        var overlay = $('<div class="cinemax-hero__overlay"></div>');

        var content = $('<div class="cinemax-hero__content"></div>');

        var titleEl = $('<div class="cinemax-hero__title"></div>').text(title);

        var meta = $('<div class="cinemax-hero__meta"></div>');
        if (movie.vote_average) {
            meta.append('<span>★ ' + Number(movie.vote_average).toFixed(1) + '</span>');
        }
        if (movie.release_date || movie.first_air_date) {
            meta.append('<span>' + String(movie.release_date || movie.first_air_date).slice(0, 4) + '</span>');
        }
        meta.append('<span>' + (movie.name ? 'Сериал' : 'Фильм') + '</span>');

        var desc = $('<div class="cinemax-hero__desc"></div>').text(movie.overview || '');

        var buttons = $('<div class="cinemax-hero__buttons"></div>');
        var openButton = $('<div class="selector cinemax-hero__button">Подробнее</div>');

        openButton.on('hover:enter click', function (e) {
            e.stopPropagation();
            openCard(movie);
        });

        buttons.append(openButton);

        content.append(titleEl, meta, desc, buttons);
        overlay.append(content);
        element.append(overlay);

        loadHeroDetails(element, movie);

        return element;
    }

    function loadHeroDetails(element, movie) {
        var type = movie.name ? 'tv' : 'movie';

        request(
            buildUrl(type + '/' + movie.id, {
                append_to_response: 'images,release_dat
