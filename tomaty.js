(function () {
    'use strict';

    if (window.kp_ratings_plugin_v115) return;
    window.kp_ratings_plugin_v115 = true;

    var NAME = 'KP Ratings';
    var SETTINGS = 'kp_ratings_settings_v115';

    var cfg = Object.assign({
        enabled: true,
        cache_days: 7,
        api: 'https://kinopoiskapiunofficial.tech/'
    }, Object.assign({},
        Lampa.Storage.get('kp_ratings_settings_v100', {}) || {},
        Lampa.Storage.get('kp_ratings_settings_v101', {}) || {},
        Lampa.Storage.get('kp_ratings_settings_v102', {}) || {},
        Lampa.Storage.get('kp_ratings_settings_v103', {}) || {},
        Lampa.Storage.get('kp_ratings_settings_v104', {}) || {},
        Lampa.Storage.get(SETTINGS, {}) || {}
    ));

    var cache = Lampa.Storage.cache('kp_rating_v115', 500, {});

    try {
        var oldCache100 = Lampa.Storage.cache('kp_rating_v100', 500, {});
        var oldCache101 = Lampa.Storage.cache('kp_rating_v101', 500, {});
        var oldCache102 = Lampa.Storage.cache('kp_rating_v102', 500, {});
        var oldCache103 = Lampa.Storage.cache('kp_rating_v103', 500, {});
        var oldCache104 = Lampa.Storage.cache('kp_rating_v104', 500, {});
        [oldCache100, oldCache101, oldCache102, oldCache103, oldCache104].forEach(function (oldCache) {
            Object.keys(oldCache || {}).forEach(function (key) {
                if (!cache[key] && oldCache[key]) cache[key] = oldCache[key];
            });
        });
    } catch (e) {}
    var inFlight = {};

    function saveCfg() {
        Lampa.Storage.set(SETTINGS, cfg);
    }

    function cleanTitle(str) {
        return String(str || '')
            .replace(/[\s.,:;’'`!?]+/g, ' ')
            .trim();
    }

    function kpCleanTitle(str) {
        return cleanTitle(str)
            .replace(/^[ \/\\]+/, '')
            .replace(/[ \/\\]+$/, '')
            .replace(/\+( *[+\/\\])+/g, '+')
            .replace(/([+\/\\] *)+\+/g, '+')
            .replace(/( *[\/\\]+ *)+/g, '+');
    }

    function normalizeTitle(str) {
        return cleanTitle(String(str || '').toLowerCase()
            .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-')
            .replace(/ё/g, 'е'));
    }

    function equalTitle(a, b) {
        return typeof a === 'string' &&
            typeof b === 'string' &&
            normalizeTitle(a) === normalizeTitle(b);
    }

    function containsTitle(a, b) {
        return typeof a === 'string' &&
            typeof b === 'string' &&
            normalizeTitle(a).indexOf(normalizeTitle(b)) !== -1;
    }

    function getYear(card) {
        var date = card.release_date ||
            card.first_air_date ||
            card.last_air_date ||
            card.year || '0000';

        var m = String(date).match(/\b(19|20)\d{2}\b/);
        return m ? parseInt(m[0], 10) : 0;
    }

    function getImdb(card) {
        var id = card && (
            card.imdb_id ||
            card.imdb ||
            card.imdbId ||
            card.imdbID
        );

        return /^tt\d+$/i.test(String(id || '').trim()) ?
            String(id).trim() : '';
    }

    function getTitle(card) {
        return kpCleanTitle(
            card.original_title ||
            card.original_name ||
            card.title ||
            card.name ||
            ''
        );
    }

    function apiBase() {
        var base = String(cfg.api || '').trim();
        if (base.charAt(base.length - 1) !== '/') base += '/';
        return base;
    }

    function headers() {
        return {
            'X-API-KEY': String(cfg.apikey || '').trim()
        };
    }

    function request(url, success, error, timeout) {
        var net = new Lampa.Reguest();
        net.clear();
        net.timeout(timeout || 15000);

        console.log('[KP Ratings] REQUEST:', url);

        net.silent(url, function (data) {
            console.log('[KP Ratings] RESPONSE:', data);
            success(data);
        }, function (a, c) {
            var err = net.errorDecode(a, c);
            console.warn('[KP Ratings] ERROR:', err);
            if (error) error(err);
        }, false, {
            headers: headers()
        });

        return net;
    }

    function saveRating(key, kp) {
        var item = {
            kp: kp === null || kp === undefined ? 0 : Number(kp),
            votes: arguments.length > 2 && arguments[2] !== null && arguments[2] !== undefined ?
                Number(arguments[2]) : 0,
            timestamp: Date.now()
        };

        cache[key] = item;
        Lampa.Storage.set('kp_rating_v115', cache);

        return item;
    }

    function getCache(key) {
        var item = cache[key];
        if (!item) return null;

        var ttl = Number(cfg.cache_days || 7) * 86400000;

        if (Date.now() - Number(item.timestamp || 0) > ttl) {
            delete cache[key];
            Lampa.Storage.set('kp_rating_v115', cache);
            return null;
        }

        return item;
    }

    function formatVotes(votes) {
        votes = Number(votes || 0);
        if (!isFinite(votes) || votes <= 0) return '';
        if (votes >= 1000000) return (votes / 1000000).toFixed(votes >= 10000000 ? 0 : 1).replace('.0','') + 'M';
        if (votes >= 1000) return (votes / 1000).toFixed(votes >= 100000 ? 0 : 1).replace('.0','') + 'K';
        return String(Math.round(votes)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    function qualityText(rating) {
        return rating >= 8 ? 'Отлично' :
            rating >= 7 ? 'Хорошо' :
            rating >= 6 ? 'Неплохо' :
            rating >= 5 ? 'Средне' : 'Низкая оценка';
    }

    function showRatings(kpData, movie) {
        if (!kpData || kpData.kp === null || kpData.kp === undefined) return;

        var kp = Number(kpData.kp);
        if (!isFinite(kp) || kp <= 0) return;

        var tmdb = Number(movie && (
            movie.vote_average !== undefined ? movie.vote_average :
            movie.rating_tmdb !== undefined ? movie.rating_tmdb :
            movie.ratingTmdb
        ));
        var tmdbVotes = Number(movie && (
            movie.vote_count !== undefined ? movie.vote_count :
            movie.voteCount !== undefined ? movie.voteCount : 0
        ));

        if (!isFinite(tmdb)) tmdb = 0;
        if (!isFinite(tmdbVotes)) tmdbVotes = 0;

        var active = Lampa.Activity.active();
        var render = active && active.activity && active.activity.render();
        if (!render) return;

        $('.kp-tmdb-ratings-v115', render).remove();

        var kpValue = kp.toFixed(1);
        var kpVotes = formatVotes(kpData.votes);
        var kpPercent = Math.max(0, Math.min(100, kp * 10));
        var kpQuality = qualityText(kp);

        var tmdbBlock = '';
        if (tmdb > 0) {
            var tmdbValue = tmdb.toFixed(1);
            var tmdbPercent = Math.max(0, Math.min(100, tmdb * 10));
            var tmdbVotesText = formatVotes(tmdbVotes);
            tmdbBlock =
                '<div class="tmdb-rating-v115 selector">' +
                    '<div class="tmdb-rating-v115__top">' +
                        '<div class="tmdb-rating-v115__brand">' +
                            '<img class="tmdb-rating-v115__logo" src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/tmdb.svg" alt="TMDB">' +
                        '</div>' +
                        '<span class="tmdb-rating-v115__quality">' + qualityText(tmdb) + '</span>' +
                    '</div>' +
                    '<div class="tmdb-rating-v115__main">' +
                        '<div class="tmdb-rating-v115__score"><span>' + tmdbValue + '</span><small>/10</small></div>' +
                        '<div class="tmdb-rating-v115__votes">' +
                            (tmdbVotesText ? '<strong>' + tmdbVotesText + '</strong><span>голосов</span>' : '<span>рейтинг пользователей</span>') +
                        '</div>' +
                    '</div>' +
                    '<div class="tmdb-rating-v115__bar"><i data-width="' + tmdbPercent + '" style="width:0%"></i></div>' +
                '</div>';
        }

        var kpBlock =
            '<div class="kp-rating-v115 selector">' +
                '<div class="kp-rating-v115__top">' +
                    '<div class="kp-rating-v115__brand">' +
                        '<img class="kp-rating-v115__logo" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMzkwIDk2MCAxODAiPjxwYXRoIGZpbGw9IiNmNTAiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTM0NS44Niw0ODAuMDRjMC0zNC4xMywxNy4xMi02MS40NCw0OC02MS40NHM0OCwyNy4zMSw0OCw2MS40NC0xNy4xMiw2MS40NC00Ny45OSw2MS40NC00OC0yNy4zLTQ4LTYxLjQ0Wk0zOTMuODYsNTI0LjQ0YzEyLjAxLDAsMTcuMTItMjAuNDgsMTcuMTItNDQuMzVzLTUuMTUtNDQuMzUtMTcuMTItNDQuMzUtMTcuMTIsMjAuNDgtMTcuMTIsNDQuMzVjLS4wNCwyMy44Nyw1LjExLDQ0LjM1LDE3LjEyLDQ0LjM1Wk0yNi45OSw0MjAuMzR2MzIuNDNoMS43bDIyLjI3LTMyLjQzaDMwLjgzbC00MS4xNCwzNy41MiwxLjcsMS43LDc1LjQzLTM5LjI2djI3LjMxbC02Ni44NywyMy44N3YxLjY5bDY2Ljg3LTUuOTZ2MjUuNjFsLTY2Ljg3LTUuOTZ2MS43bDY2Ljg3LDIzLjg3djI3LjMxbC03NS40My0zOS4yNy0xLjcsMS43LDQxLjE0LDM3LjUyaC0zMC44M2wtMjIuMjctMzIuNDNoLTEuN3YzMi40M0g0Ljcxdi0xMTkuNDRoMjIuMjd2LjA4Wk0xMzguNDUsNDIwLjM0aDI5LjE0bC0xLjcsNzEuNjZoMS43bDM0LjI4LTcxLjY2aDI1LjcydjExOS40NGgtMjkuMTNsMS43LTcxLjY2aC0xLjdsLTM0LjMsNzEuNjdoLTI1Ljcydi0xMTkuNDVoMFpNMjc3LjI5LDQyMC4zNGgtMjkuMTN2MTE5LjQ0aDI5LjEzdi01Mi45MmgyMy45OHY1Mi45MmgyOS4xM3YtMTE5LjQ0aC0yOS4xM3Y0Ni4wOWgtMjMuOTh2LTQ2LjA5Wk01MzkuNTYsNDIwLjM0aC04Mi4yNXYxMTkuNDRoMjkuMTR2LTk4Ljk3aDIzLjk4djk4Ljk3aDI5LjEzdi0xMTkuNDRaTTU1NC45OCw0ODAuMDRjMC0zNC4xMywxNy4xMi02MS40NCw0OC02MS40NHM0OCwyNy4zMSw0OCw2MS40NC0xNy4xMiw2MS40NC00OCw2MS40NC00OC0yNy4zLTQ4LTYxLjQ0Wk02MDIuOTgsNTI0LjQ0YzEyLjAxLDAsMTcuMTItMjAuNDgsMTcuMTItNDQuMzVzLTUuMTUtNDQuMzUtMTcuMTItNDQuMzUtMTcuMTIsMjAuNDgtMTcuMTIsNDQuMzUsNS4xMSw0NC4zNSwxNy4xMiw0NC4zNVpNNjk1LjUzLDQyMC4zNGgtMjkuMTN2MTE5LjQ0aDI1LjcybDM0LjI5LTcxLjY2aDEuN2wtMS43LDcxLjY2aDI5LjEzdi0xMTkuNDRoLTI1LjcybC0zNC4yOSw3MS42NmgtMS43bDEuNy03MS42NlpNODMyLjcxLDQ5OC44M2wyNy40MywzLjM5Yy01LjE1LDIzLjg4LTE3LjEyLDM5LjI2LTQyLjY4LDM5LjI2LTMwLjgzLDAtNDYuNDYtMjcuMy00Ni40Ni02MS40NHMxNS41OS02MS40NCw0Ni40Ni02MS40NGMyNS4wMiwwLDM3LjUzLDE1LjM1LDQyLjY4LDM3LjUzbC0yNy40Myw2LjgyYy0xLjctMTEuOTYtNi42OS0yNy4zLTE1LjI2LTI3LjMtMTAuMjYsMC0xNS41OSwyMC40OC0xNS41OSw0NC4zNXM1LjMyLDQ0LjM1LDE1LjU5LDQ0LjM1YzguNC4wOSwxMy41LTEzLjU3LDE1LjI2LTI1LjUzWk05MDEuMjgsNDIwLjM1aC0yNy40M3YxMTkuNDRoMjcuNDN2LTUyLjkyaDEuN2wyMC41Nyw1Mi45MmgzMS43MWwtMzAuMDEtNjEuNDQsMjkuMTMtNTguMDFoLTI5LjEzbC0yMi4yNyw1Mi45MmgtMS43di01Mi45MmgwWiIvPjwvc3ZnPg==" alt="КиноПоиск">' +
                    '</div>' +
                    '<span class="kp-rating-v115__quality">' + kpQuality + '</span>' +
                '</div>' +
                '<div class="kp-rating-v115__main">' +
                    '<div class="kp-rating-v115__score"><span>' + kpValue + '</span><small>/10</small></div>' +
                    '<div class="kp-rating-v115__votes">' +
                        (kpVotes ? '<strong>' + kpVotes + '</strong><span>голосов</span>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="kp-rating-v115__bar"><i data-width="' + kpPercent + '" style="width:0%"></i></div>' +
            '</div>';

        var block = '<div class="kp-tmdb-ratings-v115">' + kpBlock + tmdbBlock + '</div>';
        function animateBars112(root) {var bars = $('.kp-rating-v115__bar i,.tmdb-rating-v115__bar i', root);if (!bars.length) return;requestAnimationFrame(function () {requestAnimationFrame(function () {bars.each(function () {var width = $(this).attr('data-width') || '0';$(this).css({width: width + '%', transition: 'width .8s cubic-bezier(.22,.61,.36,1)'});});});});}var info = $('.info__rate', render);
        if (info.length) { info.after(block); animateBars112(render); bindRatingModal112(render, movie, kpData); return; }
        var rates = $('.full-start-new__rates', render);
        if (!rates.length) rates = $('.full-start__rates', render);
        if (rates.length) { rates.after(block); animateBars112(render); bindRatingModal112(render, movie, kpData); return; }
        var details = $('.full-start-new__details', render);
        if (!details.length) details = $('.full-start__details', render);
        if (details.length) { details.prepend(block); animateBars112(render); bindRatingModal112(render, movie, kpData); return; }
        $(render).append(block); animateBars112(render); bindRatingModal112(render, movie, kpData);
    }

    function escapeHtml112(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    // =========================================================
    // РЕЦЕНЗИИ КИНОПОИСКА В ЭТОМ ЖЕ MODAL
    // =========================================================

    var KP_REVIEWS_API_113 = 'https://kinopoiskapiunofficial.tech';
    var KP_REVIEWS_KEY_113 = 'kp_reviews_api_key';

    function kpReviewKey113() {
        try {
            var key = String(Lampa.Storage.get(KP_REVIEWS_KEY_113, '') || '').trim();
            if (!key) key = String(cfg.apikey || '').trim();
            return key;
        } catch (e) {
            return String(cfg.apikey || '').trim();
        }
    }

    function kpReviewEscape113(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function kpReviewNormalize113(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/ё/g, 'е')
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function kpReviewTitle113(movie) {
        return String(movie && (
            movie.title || movie.name ||
            movie.original_title || movie.original_name || ''
        )).trim();
    }

    function kpReviewYear113(movie) {
        var date = movie && (movie.release_date || movie.first_air_date || movie.year || '');
        var m = String(date).match(/\b(19|20)\d{2}\b/);
        return m ? m[0] : '';
    }

    function kpReviewFetch113(path) {
        var key = kpReviewKey113();
        if (!key) return Promise.reject(new Error('NO_API_KEY'));

        return fetch(KP_REVIEWS_API_113 + path, {
            method: 'GET',
            headers: {
                'X-API-KEY': key,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(function (response) {
            if (response.status === 401) throw new Error('INVALID_KEY');
            if (response.status === 402) throw new Error('LIMIT_EXCEEDED');
            if (response.status === 429) throw new Error('TOO_MANY_REQUESTS');
            if (!response.ok) throw new Error('HTTP_' + response.status);
            return response.json();
        }).catch(function (error) {
            if (error && error.name === 'TypeError') throw new Error('CORS_ERROR');
            throw error;
        });
    }

    function kpReviewFindId113(movie) {
        var direct = movie && (
            movie.kinopoiskId || movie.kinopoisk_id ||
            movie.kp_id || movie.kinopoiskId
        );
        if (direct) return Promise.resolve(Number(direct));

        try {
            var stored = Lampa.Storage.get('lampa_kinopoisk_review_ids', {}) || {};
            if (movie && movie.id && stored[String(movie.id)]) {
                return Promise.resolve(Number(stored[String(movie.id)]));
            }
        } catch (e) {}

        var title = kpReviewTitle113(movie);
        var year = kpReviewYear113(movie);
        if (!title) return Promise.reject(new Error('TITLE_NOT_FOUND'));

        return kpReviewFetch113(
            '/api/v2.1/films/search-by-keyword?keyword=' +
            encodeURIComponent(title) + '&page=1'
        ).then(function (data) {
            var films = data && (data.films || data.items || data.results || []);
            if (!films.length) throw new Error('FILM_NOT_FOUND');

            var wanted = kpReviewNormalize113(title);
            var exact = films.filter(function (film) {
                return [
                    film.nameRu, film.nameEn, film.nameOriginal,
                    film.name, film.title
                ].filter(Boolean).some(function (name) {
                    return kpReviewNormalize113(name) === wanted;
                });
            });

            if (year) {
                var exactYear = exact.filter(function (film) {
                    return String(film.year || film.yearFrom || '').slice(0, 4) === String(year);
                });
                if (exactYear.length) exact = exactYear;
            }

            var film = (exact.length ? exact : films)[0];
            var id = film && Number(
                film.kinopoiskId || film.filmId ||
                film.kinopoisk_id || film.id
            );

            if (!id) throw new Error('FILM_NOT_FOUND');

            try {
                if (movie && movie.id) {
                    var cache = Lampa.Storage.get('lampa_kinopoisk_review_ids', {}) || {};
                    cache[String(movie.id)] = id;
                    Lampa.Storage.set('lampa_kinopoisk_review_ids', cache);
                }
            } catch (e) {}

            return id;
        });
    }

    function kpReviewType113(type) {
        type = String(type || '').toUpperCase();
        if (type === 'POSITIVE') return { icon: '👍', text: 'Положительная', cls: 'positive' };
        if (type === 'NEGATIVE') return { icon: '👎', text: 'Отрицательная', cls: 'negative' };
        return { icon: '😐', text: 'Нейтральная', cls: 'neutral' };
    }

    function kpReviewFormatDate113(value) {
        if (!value) return '';
        var d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    function kpReviewRender113(review, index) {
        var type = kpReviewType113(review && review.type);
        var author = review && (review.author || 'Пользователь');
        var date = kpReviewFormatDate113(review && (review.date || review.createdAt));
        var title = review && (review.title || '');
        var text = String(review && (review.description || review.text || '') || '');
        var avatar = review && review.author_details &&
            (review.author_details.avatar_path || review.author_details.avatarPath);

        if (!avatar && review) avatar = review.avatar || '';
        if (avatar && String(avatar).indexOf('/') === 0) {
            avatar = KP_REVIEWS_API_113 + avatar;
        }

        var avatarHtml = avatar
            ? '<img class="kp-modal-review-avatar" src="' + kpReviewEscape113(avatar) +
              '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
              '<div class="kp-modal-review-avatar-placeholder" style="display:none">👤</div>'
            : '<div class="kp-modal-review-avatar-placeholder">👤</div>';

        var collapsed = text.length > 420;
        var textId = 'kp-modal-review-text-115-' + index;

        return (
            '<div class="kp-modal-review kp-modal-review--' + type.cls + '">' +
                '<div class="kp-modal-review-top">' +
                    '<div class="kp-modal-review-user">' +
                        '<div class="kp-modal-review-avatar-wrap">' + avatarHtml + '</div>' +
                        '<div class="kp-modal-review-user-info">' +
                            '<div class="kp-modal-review-author">' + kpReviewEscape113(author) + '</div>' +
                            '<div class="kp-modal-review-date">' + kpReviewEscape113(date) + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="kp-modal-review-type">' + type.icon + ' ' + type.text + '</div>' +
                '</div>' +
                (title ? '<div class="kp-modal-review-title">' + kpReviewEscape113(title) + '</div>' : '') +
                '<div class="kp-modal-review-text' + (collapsed ? ' is-collapsed' : '') + '" id="' + textId + '">' +
                    kpReviewEscape113(text).replace(/\n/g, '<br>') +
                '</div>' +
                (collapsed ? '<div class="kp-modal-review-more selector" data-target="' + textId + '">Читать полностью</div>' : '') +
            '</div>'
        );
    }

    function kpReviewRenderSection113(modal, data, requestedPage) {
        var root = modal.find('.kp-modal-reviews-115');
        if (!root.length) return;

        var items = data && (data.items || data.reviews || []) || [];
        var total = Number(data && data.total || items.length || 0);
        var pages = Number(data && (data.totalPages || data.pages || 1)) || 1;
        var page = Number(requestedPage || data && data.page || 1) || 1;

        if (!items.length) {
            root.html(
                '<div class="kp-modal-reviews-head-115">' +
                    '<div><b>Рецензии КиноПоиска</b><small>Рецензий пока нет</small></div>' +
                '</div>'
            );
            return;
        }

        var html =
            '<div class="kp-modal-reviews-head-115">' +
                '<div><b>Рецензии КиноПоиска</b><small>Новые</small></div>' +
                '<span class="kp-modal-reviews-count-115">' + total + '</span>' +
            '</div>' +
            '<div class="kp-modal-review-list-115">' +
                items.slice(0, 5).map(kpReviewRender113).join('') +
            '</div>';

        if (pages > 1) {
            var maxButtons = Math.min(pages, 50);
            html += '<div class="kp-modal-review-pages-115">';
            for (var p = 1; p <= maxButtons; p++) {
                html += '<div class="kp-modal-review-page-115 selector' +
                    (p === page ? ' is-active' : '') +
                    '" data-page="' + p + '">' + p + '</div>';
            }
            html += '</div>';
        }

        root.html(html);

        root.find('.kp-modal-review-more').on('hover:enter click', function () {
            var target = root.find('#' + $(this).data('target'));
            var collapsed = target.hasClass('is-collapsed');
            target.toggleClass('is-collapsed');
            $(this).text(collapsed ? 'Свернуть' : 'Читать полностью');
        });

        root.find('.kp-modal-review-page-115').on('hover:enter click', function () {
            var pageNo = Number($(this).data('page'));
            if (!pageNo || pageNo === page) return;
            kpReviewLoad113(modal, pageNo);
        });
    }

    function kpReviewScrollTop114(modal) {
        try {
            var root = modal && modal.find('.kp-modal-reviews-115')[0];
            var node = root;
            var guard = 0;

            // Сбрасываем реальные scroll-контейнеры Lampa, а не только сам блок.
            while (node && guard++ < 14) {
                if (node.scrollHeight > node.clientHeight + 4) {
                    node.scrollTop = 0;
                    if (typeof node.scrollTo === 'function') {
                        try { node.scrollTo(0, 0); } catch (e) {}
                    }
                }
                node = node.parentElement;
            }

            if (root && root.scrollIntoView) {
                root.scrollIntoView({
                    block: 'start',
                    inline: 'nearest',
                    behavior: 'auto'
                });
            }

            setTimeout(function () {
                try {
                    var again = root;
                    var n = 0;
                    while (again && n++ < 14) {
                        if (again.scrollHeight > again.clientHeight + 4) {
                            again.scrollTop = 0;
                        }
                        again = again.parentElement;
                    }
                } catch (e) {}
            }, 80);
        } catch (e) {}
    }

    function kpReviewLoad113(modal, page) {
        if (!modal || !modal.length || !kpReviewId113) return;

        kpReviewScrollTop114(modal);
        var root = modal.find('.kp-modal-reviews-115');
        root.html(
            '<div class="kp-modal-reviews-head-115"><div><b>Рецензии КиноПоиска</b><small>Загрузка…</small></div></div>' +
            '<div class="kp-modal-reviews-loading-115">Загружаем рецензии…</div>'
        );

        kpReviewFetch113(
            '/api/v2.2/films/' + encodeURIComponent(kpReviewId113) +
            '/reviews?page=' + page + '&order=DATE_DESC'
        ).then(function (data) {
            kpReviewRenderSection113(modal, data, page);
            setTimeout(function () { kpReviewScrollTop114(modal); }, 50);
        }).catch(function (error) {
            var message = 'Не удалось загрузить рецензии.';
            if (error.message === 'NO_API_KEY') message = 'Для рецензий нужен API-ключ КиноПоиска.';
            else if (error.message === 'INVALID_KEY') message = 'API-ключ КиноПоиска недействителен.';
            else if (error.message === 'LIMIT_EXCEEDED') message = 'Достигнут дневной лимит Kinopoisk API.';
            else if (error.message === 'CORS_ERROR') message = 'Lampa не смогла обратиться к API КиноПоиска.';
            root.html(
                '<div class="kp-modal-reviews-head-115"><div><b>Рецензии КиноПоиска</b></div></div>' +
                '<div class="kp-modal-reviews-error-115">' + kpReviewEscape113(message) + '</div>'
            );
        });
    }

    var kpReviewId113 = null;

    function openRatingModal112(kind, movie, kpData) {
        if (!movie || !Lampa.Modal || !Lampa.Modal.open) return;

        kpReviewId113 = null;

        var isKP = kind === 'kp';
        var rating = isKP ? Number(kpData && kpData.kp) : Number(
            movie.vote_average !== undefined ? movie.vote_average :
            movie.rating_tmdb !== undefined ? movie.rating_tmdb :
            movie.ratingTmdb
        );

        if (!isFinite(rating) || rating <= 0) return;

        var votes = isKP
            ? formatVotes(kpData && kpData.votes)
            : formatVotes(movie.vote_count !== undefined ? movie.vote_count : movie.voteCount);

        var title = movie.title || movie.name || '';
        var original = movie.original_title || movie.original_name || '';
        var year = getYear(movie);

        var genres = Array.isArray(movie.genres)
            ? movie.genres.map(function (g) { return g && g.name; }).filter(Boolean).slice(0, 4)
            : [];

        var meta = [year || '', genres.join(' • ')].filter(Boolean).join('  •  ');

        var percent = Math.max(0, Math.min(100, rating * 10));
        var quality = qualityText(rating);

        // Дополнительные данные TMDB. Актёров и создателей намеренно не выводим:
        // они уже есть в штатной карточке Lampa.
        var overview = String(movie.overview || movie.description || '').trim();

        var countries = [];
        if (Array.isArray(movie.production_countries)) {
            countries = movie.production_countries.map(function (c) {
                return c && (c.name || c.iso_3166_1);
            }).filter(Boolean);
        }
        if (!countries.length && Array.isArray(movie.origin_country)) {
            countries = movie.origin_country.filter(Boolean);
        }
        if (!countries.length && Array.isArray(movie.production_companies)) {
            countries = movie.production_companies.map(function (c) {
                return c && c.name;
            }).filter(Boolean).slice(0, 3);
        }

        var releaseDate = movie.release_date || movie.first_air_date || '';
        var releaseDateText = '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(releaseDate))) {
            var parts = String(releaseDate).split('-');
            releaseDateText = parts[2] + '.' + parts[1] + '.' + parts[0];
        } else if (releaseDate) {
            releaseDateText = String(releaseDate);
        }

        var runtime = Number(movie.runtime || 0);
        if (!runtime && Array.isArray(movie.episode_run_time) && movie.episode_run_time[0]) {
            runtime = Number(movie.episode_run_time[0]);
        }

        function formatRuntime112(minutes) {
            minutes = Math.round(Number(minutes || 0));
            if (!minutes) return '';
            var h = Math.floor(minutes / 60);
            var m = minutes % 60;
            if (h && m) return h + ' ч ' + m + ' мин';
            if (h) return h + ' ч';
            return m + ' мин';
        }

        function formatMoney112(value) {
            value = Number(value || 0);
            if (!isFinite(value) || value <= 0) return '';
            if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace('.0', '') + ' млрд $';
            if (value >= 1000000) return Math.round(value / 1000000) + ' млн $';
            if (value >= 1000) return Math.round(value / 1000) + ' тыс. $';
            return value.toLocaleString('ru-RU') + ' $';
        }

        var isSeries = !!(
            movie.first_air_date ||
            movie.number_of_seasons ||
            movie.number_of_episodes ||
            movie.seasons
        );

        var extraItems = [];

        if (countries.length) {
            extraItems.push(
                '<div class="kp-rating-modal-info-item">' +
                    '<span>Страна</span><b>' + escapeHtml112(countries.join(', ')) + '</b>' +
                '</div>'
            );
        }

        if (releaseDateText) {
            extraItems.push(
                '<div class="kp-rating-modal-info-item">' +
                    '<span>Премьера</span><b>' + escapeHtml112(releaseDateText) + '</b>' +
                '</div>'
            );
        }

        if (isSeries) {
            var seasons = Number(movie.number_of_seasons || 0);
            var episodes = Number(movie.number_of_episodes || 0);
            var seriesMeta = [];
            if (seasons) seriesMeta.push(seasons + ' ' + (seasons === 1 ? 'сезон' : seasons < 5 ? 'сезона' : 'сезонов'));
            if (episodes) seriesMeta.push(episodes + ' ' + (episodes === 1 ? 'серия' : episodes < 5 ? 'серии' : 'серий'));

            if (seriesMeta.length) {
                extraItems.push(
                    '<div class="kp-rating-modal-info-item">' +
                        '<span>Формат</span><b>' + escapeHtml112(seriesMeta.join(' • ')) + '</b>' +
                    '</div>'
                );
            }

            if (movie.status) {
                extraItems.push(
                    '<div class="kp-rating-modal-info-item">' +
                        '<span>Статус</span><b>' + escapeHtml112(String(movie.status)) + '</b>' +
                    '</div>'
                );
            }

            if (runtime) {
                extraItems.push(
                    '<div class="kp-rating-modal-info-item">' +
                        '<span>Серия</span><b>' + escapeHtml112(formatRuntime112(runtime)) + '</b>' +
                    '</div>'
                );
            }
        } else {
            if (runtime) {
                extraItems.push(
                    '<div class="kp-rating-modal-info-item">' +
                        '<span>Длительность</span><b>' + escapeHtml112(formatRuntime112(runtime)) + '</b>' +
                    '</div>'
                );
            }

            var budgetText = formatMoney112(movie.budget);
            var revenueText = formatMoney112(movie.revenue);

            if (budgetText) {
                extraItems.push(
                    '<div class="kp-rating-modal-info-item">' +
                        '<span>Бюджет</span><b>' + escapeHtml112(budgetText) + '</b>' +
                    '</div>'
                );
            }

            if (revenueText) {
                extraItems.push(
                    '<div class="kp-rating-modal-info-item">' +
                        '<span>Сборы</span><b>' + escapeHtml112(revenueText) + '</b>' +
                    '</div>'
                );
            }
        }

        var logo = isKP
            ? 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMzkwIDk2MCAxODAiPjxwYXRoIGZpbGw9IiNmNTAiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTM0NS44Niw0ODAuMDRjMC0zNC4xMywxNy4xMi02MS40NCw0OC02MS40NHM0OCwyNy4zMSw0OCw2MS40NC0xNy4xMiw2MS40NC00Ny45OSw2MS40NC00OC0yNy4zLTQ4LTYxLjQ0Wk0zOTMuODYsNTI0LjQ0YzEyLjAxLDAsMTcuMTItMjAuNDgsMTcuMTItNDQuMzVzLTUuMTUtNDQuMzUtMTcuMTItNDQuMzUtMTcuMTIsMjAuNDgtMTcuMTIsNDQuMzVjLS4wNCwyMy44Nyw1LjExLDQ0LjM1LDE3LjEyLDQ0LjM1Wk0yNi45OSw0MjAuMzR2MzIuNDNoMS43bDIyLjI3LTMyLjQzaDMwLjgzbC00MS4xNCwzNy41MiwxLjcsMS43LDc1LjQzLTM5LjI2djI3LjMxbC02Ni44NywyMy44N3YxLjY5bDY2Ljg3LTUuOTZ2MjUuNjFsLTY2Ljg3LTUuOTZ2MS43bDY2Ljg3LDIzLjg3djI3LjMxbC03NS40My0zOS4yNy0xLjcsMS43LDQxLjE0LDM3LjUyaC0zMC44M2wtMjIuMjctMzIuNDNoLTEuN3YzMi40M0g0Ljcxdi0xMTkuNDRoMjIuMjd2LjA4Wk0xMzguNDUsNDIwLjM0aDI5LjE0bC0xLjcsNzEuNjZoMS43bDM0LjI4LTcxLjY2aDI1LjcydjExOS40NGgtMjkuMTNsMS43LTcxLjY2aC0xLjdsLTM0LjMsNzEuNjdoLTI1Ljcydi0xMTkuNDVoMFpNMjc3LjI5LDQyMC4zNGgtMjkuMTN2MTE5LjQ0aDI5LjEzdi01Mi45MmgyMy45OHY1Mi45MmgyOS4xM3YtMTE5LjQ0aC0yOS4xM3Y0Ni4wOWgtMjMuOTh2LTQ2LjA5Wk01MzkuNTYsNDIwLjM0aC04Mi4yNXYxMTkuNDRoMjkuMTR2LTk4Ljk3aDIzLjk4djk4Ljk3aDI5LjEzdi0xMTkuNDRaTTU1NC45OCw0ODAuMDRjMC0zNC4xMywxNy4xMi02MS40NCw0OC02MS40NHM0OCwyNy4zMSw0OCw2MS40NC0xNy4xMiw2MS40NC00OCw2MS40NC00OC0yNy4zLTQ4LTYxLjQ0Wk02MDIuOTgsNTI0LjQ0YzEyLjAxLDAsMTcuMTItMjAuNDgsMTcuMTItNDQuMzVzLTUuMTUtNDQuMzUtMTcuMTItNDQuMzUtMTcuMTIsMjAuNDgtMTcuMTIsNDQuMzUsNS4xMSw0NC4zNSwxNy4xMiw0NC4zNVpNNjk1LjUzLDQyMC4zNGgtMjkuMTN2MTE5LjQ0aDI1LjcybDM0LjI5LTcxLjY2aDEuN2wtMS43LDcxLjY2aDI5LjEzdi0xMTkuNDRoLTI1LjcybC0zNC4yOSw3MS42NmgtMS43bDEuNy03MS42NlpNODMyLjcxLDQ5OC44M2wyNy40MywzLjM5Yy01LjE1LDIzLjg4LTE3LjEyLDM5LjI2LTQyLjY4LDM5LjI2LTMwLjgzLDAtNDYuNDYtMjcuMy00Ni40Ni02MS40NHMxNS41OS02MS40NCw0Ni40Ni02MS40NGMyNS4wMiwwLDM3LjUzLDE1LjM1LDQyLjY4LDM3LjUzbC0yNy40Myw2LjgyYy0xLjctMTEuOTYtNi42OS0yNy4zLTE1LjI2LTI3LjMtMTAuMjYsMC0xNS41OSwyMC40OC0xNS41OSw0NC4zNXM1LjMyLDQ0LjM1LDE1LjU5LDQ0LjM1YzguNC4wOSwxMy41LTEzLjU3LDE1LjI2LTI1LjUzWk05MDEuMjgsNDIwLjM1aC0yNy40M3YxMTkuNDRoMjcuNDN2LTUyLjkyaDEuN2wyMC41Nyw1Mi45MmgzMS43MWwtMzAuMDEtNjEuNDQsMjkuMTMtNTguMDFoLTI5LjEzbC0yMi4yNyw1Mi45MmgtMS43di01Mi45MmgwWiIvPjwvc3ZnPg=='
            : 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/tmdb.svg';

        var votesHtml = votes
            ? '<strong>' + escapeHtml112(votes) + '</strong><span>голосов</span>'
            : '';

        var cardHtml =
            '<div class="kp-rating-modal-card kp-rating-modal-card--' + (isKP ? 'kp' : 'tmdb') + '">' +
                '<div class="kp-rating-modal-top">' +
                    '<div class="kp-rating-modal-brand"><img src="' + logo + '" alt="' + (isKP ? 'КиноПоиск' : 'TMDB') + '"></div>' +
                    '<span class="kp-rating-modal-quality">' + escapeHtml112(quality) + '</span>' +
                '</div>' +
                '<div class="kp-rating-modal-main">' +
                    '<div class="kp-rating-modal-score"><span>' + rating.toFixed(1) + '</span><small>/10</small></div>' +
                    '<div class="kp-rating-modal-votes">' + votesHtml + '</div>' +
                '</div>' +
                '<div class="kp-rating-modal-bar"><i style="width:' + percent + '%"></i></div>' +
            '</div>';

        var html =
            '<div class="kp-rating-modal-page">' +
                '<div class="kp-rating-modal-hero">' +
                    cardHtml +
                    '<div class="kp-rating-modal-title">' + escapeHtml112(title) + '</div>' +
                    (original && original !== title ? '<div class="kp-rating-modal-original">' + escapeHtml112(original) + '</div>' : '') +
                    (meta ? '<div class="kp-rating-modal-meta">' + escapeHtml112(meta) + '</div>' : '') +
                '</div>' +
                '<div class="kp-rating-modal-body">' +
                    (overview
                        ? '<section class="kp-rating-modal-section"><div class="kp-rating-modal-section-title">О фильме</div><div class="kp-rating-modal-overview">' + escapeHtml112(overview) + '</div></section>'
                        : '') +
                    (extraItems.length
                        ? '<section class="kp-rating-modal-section"><div class="kp-rating-modal-section-title">Дополнительно</div><div class="kp-rating-modal-info-grid">' + extraItems.join('') + '</div></section>'
                        : '') +
                    '<section class="kp-rating-modal-section kp-rating-modal-summary">' +
                        '<div class="kp-rating-modal-section-title">' + (isKP ? 'Рейтинг КиноПоиска' : 'Рейтинг TMDB') + '</div>' +
                        '<div class="kp-rating-modal-text">Оценка <b>' + rating.toFixed(1) + '</b> из 10' +
                        (votes ? ' • ' + escapeHtml112(votes) + ' голосов' : '') +
                        '</div>' +
                    '</section>' +
                '</div>' +
                (isKP ? (
                    '<section class="kp-modal-reviews-115">' +
                        '<div class="kp-modal-reviews-head-115"><div><b>Рецензии КиноПоиска</b><small>Загрузка…</small></div></div>' +
                        '<div class="kp-modal-reviews-loading-115">Подготавливаем рецензии…</div>' +
                    '</section>'
                ) : '') +
            '</div>';

        var controllerName = '';
        try {
            controllerName = Lampa.Controller.enabled().name;
        } catch (e) {}

        Lampa.Modal.open({
            title: title || (isKP ? 'КиноПоиск' : 'TMDB'),
            html: $(html),
            size: 'large',
            onBack: function () {
                Lampa.Modal.close();
                if (controllerName) {
                    try { Lampa.Controller.toggle(controllerName); } catch (e) {}
                }
            }
        });

        setTimeout(function () {
            var modal = $('.kp-rating-modal-page').last();
            if (isKP && movie) {
                kpReviewFindId113(movie).then(function (id) {
                    if (!id) throw new Error('FILM_NOT_FOUND');
                    kpReviewId113 = id;
                    var reviewModal = $('.kp-rating-modal-page').last();
                    if (reviewModal.length) kpReviewLoad113(reviewModal, 1);
                }).catch(function (error) {
                    var reviewRoot = $('.kp-rating-modal-page').last().find('.kp-modal-reviews-115');
                    if (!reviewRoot.length) return;
                    var msg = 'Не удалось определить фильм в КиноПоиске.';
                    if (error.message === 'NO_API_KEY') msg = 'Для рецензий нужен API-ключ КиноПоиска.';
                    else if (error.message === 'INVALID_KEY') msg = 'API-ключ КиноПоиска недействителен.';
                    else if (error.message === 'CORS_ERROR') msg = 'Lampa не смогла обратиться к API КиноПоиска.';
                    reviewRoot.html(
                        '<div class="kp-modal-reviews-head-115"><div><b>Рецензии КиноПоиска</b></div></div>' +
                        '<div class="kp-modal-reviews-error-115">' + kpReviewEscape113(msg) + '</div>'
                    );
                });
            }


            if (!modal.length) return;
            modal.find('.kp-rating-modal-bar i').css({
                width: percent + '%',
                transition: 'width .75s cubic-bezier(.22,.61,.36,1)'
            });
        }, 30);
    }

    function bindRatingModal112(render, movie, kpData) {
        var root = $('.kp-tmdb-ratings-v115', render);
        if (!root.length) return;

        root.find('.kp-rating-v115').off('hover:enter.kpRatings').on('hover:enter.kpRatings', function () {
            openRatingModal112('kp', movie, kpData);
        });

        root.find('.tmdb-rating-v115').off('hover:enter.kpRatings').on('hover:enter.kpRatings', function () {
            openRatingModal112('tmdb', movie, kpData);
        });
    }

    function findFilm(card, items) {
        if (!items || !items.length) return null;

        var imdb = getImdb(card);
        var year = getYear(card);
        var original = card.original_title || card.original_name || '';
        var title = card.title || card.name || '';

        if (imdb) {
            var byImdb = items.filter(function (item) {
                return String(
                    item.imdb_id ||
                    item.imdbId ||
                    item.imdb ||
                    ''
                ).toLowerCase() === imdb.toLowerCase();
            });

            if (byImdb.length) return byImdb[0];
        }

        var exact = items.filter(function (item) {
            return equalTitle(
                item.orig_title || item.nameOriginal ||
                item.en_title || item.nameEn ||
                item.title || item.ru_title || item.nameRu,
                original || title
            );
        });

        if (exact.length) {
            if (year) {
                var exactYear = exact.filter(function (item) {
                    var y = parseInt(String(
                        item.start_date || item.year || '0000'
                    ).slice(0, 4), 10);

                    return y === year;
                });

                if (exactYear.length) return exactYear[0];
            }

            return exact[0];
        }

        var contains = items.filter(function (item) {
            var names = [
                item.orig_title,
                item.nameOriginal,
                item.en_title,
                item.nameEn,
                item.title,
                item.ru_title,
                item.nameRu
            ];

            return names.some(function (name) {
                return containsTitle(name, original || title) ||
                    containsTitle(name, title);
            });
        });

        if (contains.length) {
            if (year) {
                var nearYear = contains.filter(function (item) {
                    var y = parseInt(String(
                        item.start_date || item.year || '0000'
                    ).slice(0, 4), 10);

                    return y && Math.abs(y - year) <= 1;
                });

                if (nearYear.length) return nearYear[0];
            }

            return contains[0];
        }

        return null;
    }

    function getRating(card, callback) {
        if (!cfg.enabled) return callback(null);

        if (!cfg.apikey) {
            console.warn('[KP Ratings] API KEY IS EMPTY');
            return callback(null);
        }

        var imdb = getImdb(card);
        var title = getTitle(card);
        var year = getYear(card);

        if (!title && !imdb) return callback(null);

        var key = String(
            imdb || card.id || title + '|' + year
        ).toLowerCase();

        var old = getCache(key);

        if (old) {
            console.log('[KP Ratings] CACHE:', key, old);
            return callback(old);
        }

        if (inFlight[key]) {
            inFlight[key].push(callback);
            return;
        }

        inFlight[key] = [callback];

        var base = apiBase();
        var titleUrl = Lampa.Utils.addUrlComponent(
            base + 'api/v2.1/films/search-by-keyword',
            'keyword=' + encodeURIComponent(title)
        );

        function finish(data) {
            var list = inFlight[key] || [];
            delete inFlight[key];

            list.forEach(function (cb) {
                try { cb(data); } catch (e) {}
            });
        }

        function loadDetails(film) {
            var id = film && (
                film.kp_id ||
                film.kinopoisk_id ||
                film.kinopoiskId ||
                film.filmId
            );

            if (!id) {
                finish(null);
                return;
            }

            request(
                base + 'api/v2.2/films/' + encodeURIComponent(id),
                function (data) {
                    var kp = data && data.ratingKinopoisk;
                    var ratingObject = data && data.ratingKinopoisk;
                    var votes = data && (
                        data.ratingKinopoiskVoteCount ||
                        data.ratingKinopoiskVotes ||
                        data.ratingKinopoiskVoteCountTotal ||
                        data.ratingKinopoiskVotesCount ||
                        data.voteCount ||
                        0
                    );

                    if (!votes && film) {
                        votes = film.ratingKinopoiskVoteCount ||
                            film.ratingKinopoiskVotes ||
                            film.ratingKinopoiskVoteCountTotal ||
                            film.ratingKinopoiskVotesCount ||
                            film.voteCount ||
                            0;
                    }

                    if (ratingObject && typeof ratingObject === 'object') {
                        kp = ratingObject.value || ratingObject.rating || ratingObject.rate;
                        votes = votes || ratingObject.voteCount || ratingObject.votes || 0;
                    }

                    if (kp === undefined || kp === null) {
                        finish(saveRating(key, 0, 0));
                        return;
                    }

                    finish(saveRating(key, kp, votes));
                },
                function () {
                    finish(null);
                }
            );
        }

        function searchByTitle() {
            request(
                titleUrl,
                function (json) {
                    var items = json && (
                        json.items || json.films || []
                    );

                    var film = findFilm(card, items);

                    if (film) {
                        loadDetails(film);
                    } else {
                        finish(saveRating(key, 0, 0));
                    }
                },
                function () {
                    finish(null);
                }
            );
        }

        if (imdb) {
            var imdbUrl = Lampa.Utils.addUrlComponent(
                base + 'api/v2.2/films',
                'imdbId=' + encodeURIComponent(imdb)
            );

            request(
                imdbUrl,
                function (json) {
                    var items = json && (
                        json.items || json.films || []
                    );

                    var film = findFilm(card, items);

                    if (film) {
                        loadDetails(film);
                    } else {
                        searchByTitle();
                    }
                },
                function () {
                    searchByTitle();
                }
            );
        } else {
            searchByTitle();
        }
    }

    function inject(card) {
        getRating(card, function (data) {
            if (data && Number(data.kp) > 0) {
                showRatings(data, card);
            }
        });
    }

    function settings() {
        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'kp_ratings_v109',
            name: NAME,
            icon:
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
                'viewBox="0 0 24 24" fill="none">' +
                '<path d="M12 3.5l2.65 5.37 5.92.86-4.28 4.17 1.01 5.9L12 17.02l-5.3 2.78 1.01-5.9L3.43 9.73l5.92-.86L12 3.5z" ' +
                'stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
                '</svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'kp_ratings_v109',
            param: {
                name: 'kp_apikey',
                type: 'trigger'
            },
            field: {
                name: 'API-ключ КиноПоиска',
                description: cfg.apikey ?
                    'Ключ сохранён — нажмите для изменения' :
                    'Ключ не задан'
            },
            onChange: function () {
                if (!Lampa.Input || !Lampa.Input.edit) {
                    Lampa.Noty.show('Ввод текста недоступен');
                    return;
                }

                Lampa.Input.edit({
                    title: 'API-ключ КиноПоиска',
                    value: cfg.apikey || '',
                    free: true
                }, function (value) {
                    cfg.apikey = String(value || '').trim();
                    saveCfg();

                    Lampa.Noty.show(
                        cfg.apikey ?
                        'API-ключ КиноПоиска сохранён' :
                        'API-ключ очищен'
                    );

                    if (Lampa.Settings && Lampa.Settings.update) {
                        Lampa.Settings.update();
                    }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'kp_ratings_v109',
            param: {
                name: 'kp_enabled',
                type: 'select',
                values: {
                    1: 'Включено',
                    0: 'Выключено'
                },
                default: cfg.enabled ? 1 : 0
            },
            field: {
                name: 'Показывать рейтинг КП'
            },
            onChange: function (v) {
                cfg.enabled = Number(v) === 1;
                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'kp_ratings_v109',
            param: {
                name: 'kp_clear',
                type: 'trigger'
            },
            field: {
                name: 'Очистить кэш',
                description: 'Удалить сохранённые рейтинги'
            },
            onChange: function () {
                cache = {};
                Lampa.Storage.set('kp_rating_v115', cache);
                Lampa.Noty.show('Кэш КП очищен');
            }
        });
    }

    function start() {

        if (!document.getElementById('kp-ratings-v115-style')) {
            var style = document.createElement('style');
            style.id = 'kp-ratings-v115-style';
            style.textContent =
                '@keyframes kpRatingsAppear110{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);}}@keyframes kpRatingsScore110{from{opacity:0;transform:translateY(5px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}.kp-tmdb-ratings-v115{' +
                    'display:flex!important;' +
                    'align-items:stretch!important;' +
                    'gap:1.1em!important;' +
                    'width:100%!important;' +
                    'margin:.75em 0 .7em!important;' +
                    'box-sizing:border-box!important;' +
                '}' +
                '.kp-rating-v115,.tmdb-rating-v115{animation-delay:.08s!important;' +
                    'display:block!important;' +
                    'flex:1 1 0!important;' +
                    'min-width:0!important;' +
                    'box-sizing:border-box!important;' +
                    'padding:.75em .9em .72em!important;' +
                    'border-radius:.85em!important;' +
                    'color:#fff!important;' +
                    'font-size:1em!important;' +
                    'vertical-align:top!important;' +
                    'overflow:hidden!important;animation:kpRatingsAppear110 .42s cubic-bezier(.22,.61,.36,1) both!important;' +
                '}' +
                '.kp-rating-v115{' +
                    'background:linear-gradient(135deg,rgba(38,32,18,.82),rgba(20,20,20,.96))!important;' +
                    'border:1px solid rgba(245,180,45,.34)!important;' +
                    'box-shadow:0 5px 18px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.05)!important;' +
                '}' +
                '.tmdb-rating-v115{' +
                    'background:linear-gradient(135deg,rgba(7,37,55,.96),rgba(8,20,30,.98))!important;' +
                    'border:1px solid rgba(1,180,228,.42)!important;' +
                    'box-shadow:0 5px 18px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.05)!important;' +
                '}' +
                '.kp-rating-v115__top,.tmdb-rating-v115__top{' +
                    'display:flex!important;' +
                    'align-items:center!important;' +
                    'justify-content:space-between!important;' +
                    'gap:.5em!important;' +
                    'height:1.25em!important;' +
                    'margin-bottom:.25em!important;' +
                '}' +
                '.kp-rating-v115__brand,.tmdb-rating-v115__brand{' +
                    'display:flex!important;' +
                    'align-items:center!important;' +
                    'height:1.15em!important;' +
                    'min-width:0!important;' +
                '}' +
                '.kp-rating-v115__logo{' +
                    'display:block!important;' +
                    'width:9.2em!important;' +
                    'height:1.05em!important;' +
                    'object-fit:contain!important;' +
                    'object-position:left center!important;' +
                    'filter:drop-shadow(0 0 5px rgba(255,85,0,.16))!important;' +
                '}' +
                '.tmdb-rating-v115__logo{' +
                    'display:block!important;' +
                    'width:5.8em!important;' +
                    'height:1.35em!important;' +
                    'object-fit:contain!important;' +
                    'object-position:left center!important;' +
                '}' +
                '.kp-rating-v115__quality,.tmdb-rating-v115__quality{' +
                    'font-size:.68em!important;' +
                    'font-weight:600!important;' +
                    'color:rgba(255,255,255,.58)!important;' +
                    'white-space:nowrap!important;' +
                '}' +
                '.tmdb-rating-v115__quality{' +
                    'color:rgba(1,180,228,.88)!important;' +
                '}' +
                '.kp-rating-v115__main,.tmdb-rating-v115__main{' +
                    'display:flex!important;' +
                    'align-items:center!important;' +
                    'justify-content:flex-start!important;' +
                    'gap:1.05em!important;' +
                '}' +
                '.kp-rating-v115__score,.tmdb-rating-v115__score{' +
                    'display:flex!important;' +
                    'align-items:baseline!important;' +
                    'white-space:nowrap!important;' +
                '}' +
                '.kp-rating-v115__score span,.tmdb-rating-v115__score span{' +
                    'animation:kpRatingsScore110 .48s .10s both!important;' +
                    'font-size:2em!important;' +
                    'font-weight:800!important;' +
                    'letter-spacing:-.035em!important;' +
                    'line-height:1!important;' +
                '}' +
                '.kp-rating-v115__score small,.tmdb-rating-v115__score small{' +
                    'margin-left:.18em!important;' +
                    'font-size:.62em!important;' +
                    'font-weight:500!important;' +
                    'color:rgba(255,255,255,.44)!important;' +
                '}' +
                '.kp-rating-v115__votes,.tmdb-rating-v115__votes{' +
                    'display:flex!important;' +
                    'flex-direction:column!important;' +
                    'line-height:1.15!important;' +
                    'min-width:0!important;' +
                '}' +
                '.kp-rating-v115__votes strong,.tmdb-rating-v115__votes strong{' +
                    'font-size:.9em!important;' +
                    'font-weight:700!important;' +
                    'color:#fff!important;' +
                '}' +
                '.kp-rating-v115__votes span,.tmdb-rating-v115__votes span{' +
                    'margin-top:.16em!important;' +
                    'font-size:.62em!important;' +
                    'color:rgba(255,255,255,.52)!important;' +
                    'white-space:nowrap!important;' +
                '}' +
                '.kp-rating-v115__bar,.tmdb-rating-v115__bar{' +
                    'height:3px!important;' +
                    'margin-top:.65em!important;' +
                    'overflow:hidden!important;' +
                    'border-radius:99px!important;transition:width .8s cubic-bezier(.22,.61,.36,1)!important;' +
                    'background:rgba(255,255,255,.10)!important;' +
                '}' +
                '.kp-rating-v115__bar i,.tmdb-rating-v115__bar i{' +
                    'display:block!important;' +
                    'height:100%!important;' +
                    'border-radius:99px!important;' +
                '}' +
                '.kp-rating-v115__bar i{' +
                    'background:linear-gradient(90deg,#d99419,#ffd35a)!important;' +
                    'box-shadow:0 0 8px rgba(245,184,46,.38)!important;' +
                '}' +
                '.tmdb-rating-v115__bar i{' +
                    'background:linear-gradient(90deg,#01b4e4,#90e7f8)!important;' +
                    'box-shadow:0 0 8px rgba(1,180,228,.38)!important;' +
                '}' +

                '.kp-rating-modal-page{background:#151718;color:#fff;min-height:100%;overflow:hidden;box-sizing:border-box;}' +
                '.kp-rating-modal-hero{position:relative;min-height:250px;padding:22px 22px 24px;display:flex;flex-direction:column;justify-content:flex-end;box-sizing:border-box;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.07),transparent 60%),linear-gradient(to bottom,#202426 0%,#151718 100%);}' +
                '.kp-rating-modal-card{width:100%;box-sizing:border-box;border-radius:1em;padding:1.05em 1.15em 1em;color:#fff;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.06);animation:kpRatingsScore110 .4s cubic-bezier(.22,.61,.36,1) both;}' +
                '.kp-rating-modal-card--kp{background:linear-gradient(135deg,rgba(38,32,18,.96),rgba(20,20,20,.98));border:1px solid rgba(245,180,45,.42);}' +
                '.kp-rating-modal-card--tmdb{background:linear-gradient(135deg,rgba(7,37,55,.98),rgba(8,20,30,1));border:1px solid rgba(1,180,228,.5);}' +
                '.kp-rating-modal-top{display:flex;align-items:center;justify-content:space-between;gap:.7em;}' +
                '.kp-rating-modal-brand{display:flex;align-items:center;height:2em;min-width:0;}' +
                '.kp-rating-modal-brand img{display:block;max-width:14em;width:auto;height:1.7em;object-fit:contain;object-position:left center;}' +
                '.kp-rating-modal-card--tmdb .kp-rating-modal-brand img{width:7.5em;height:2em;}' +
                '.kp-rating-modal-quality{font-size:.82em;font-weight:650;color:rgba(255,255,255,.66);white-space:nowrap;}' +
                '.kp-rating-modal-card--tmdb .kp-rating-modal-quality{color:rgba(1,180,228,.9);}' +
                '.kp-rating-modal-main{display:flex;align-items:center;gap:1.5em;margin-top:.35em;}' +
                '.kp-rating-modal-score{display:flex;align-items:baseline;white-space:nowrap;}' +
                '.kp-rating-modal-score span{font-size:3.25em;font-weight:850;line-height:1;letter-spacing:-.045em;}' +
                '.kp-rating-modal-score small{margin-left:.2em;font-size:.78em;color:rgba(255,255,255,.45);}' +
                '.kp-rating-modal-votes{display:flex;flex-direction:column;line-height:1.15;}' +
                '.kp-rating-modal-votes strong{font-size:1.05em;font-weight:750;}' +
                '.kp-rating-modal-votes span{margin-top:.18em;font-size:.72em;color:rgba(255,255,255,.52);}' +
                '.kp-rating-modal-bar{height:4px;margin-top:.85em;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.11);}' +
                '.kp-rating-modal-bar i{display:block;height:100%;border-radius:99px;}' +
                '.kp-rating-modal-card--kp .kp-rating-modal-bar i{background:linear-gradient(90deg,#d99419,#ffd35a);box-shadow:0 0 10px rgba(245,184,46,.42);}' +
                '.kp-rating-modal-card--tmdb .kp-rating-modal-bar i{background:linear-gradient(90deg,#01b4e4,#90e7f8);box-shadow:0 0 10px rgba(1,180,228,.42);}' +
                '.kp-rating-modal-title{margin-top:18px;font-size:28px;line-height:1.12;font-weight:800;letter-spacing:-.02em;text-shadow:0 2px 10px rgba(0,0,0,.6);}' +
                '.kp-rating-modal-original{margin-top:5px;font-size:15px;color:rgba(255,255,255,.55);}' +
                '.kp-rating-modal-meta{margin-top:9px;font-size:15px;color:rgba(255,255,255,.78);}' +
                '.kp-rating-modal-body{padding:22px;color:rgba(255,255,255,.82);}' +
                '.kp-rating-modal-caption{font-size:18px;font-weight:750;margin-bottom:8px;}' +
                '.kp-rating-modal-text{font-size:15px;color:rgba(255,255,255,.56);}' +
                '.kp-rating-modal-section{margin-bottom:24px;}' +
                '.kp-rating-modal-section:last-child{margin-bottom:0;}' +
                '.kp-rating-modal-section-title{font-size:19px;font-weight:800;line-height:1.2;margin-bottom:9px;color:rgba(255,255,255,.94);}' +
                '.kp-rating-modal-overview{font-size:16px;line-height:1.55;color:rgba(255,255,255,.72);}' +
                '.kp-rating-modal-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.08);border-radius:.75em;overflow:hidden;}' +
                '.kp-rating-modal-info-item{display:flex;flex-direction:column;gap:5px;padding:12px 14px;background:rgba(255,255,255,.035);min-width:0;}' +
                '.kp-rating-modal-info-item span{font-size:12px;color:rgba(255,255,255,.43);}' +
                '.kp-rating-modal-info-item b{font-size:15px;font-weight:650;color:rgba(255,255,255,.88);word-break:break-word;}' +
                '.kp-rating-modal-summary{padding-top:4px;}' +

                '.kp-modal-reviews-115{margin:0 22px 30px;padding:0 0 4px;}' +
                '.kp-modal-reviews-head-115{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 0 12px;border-top:1px solid rgba(255,255,255,.08);}' +
                '.kp-modal-reviews-head-115 b{display:block;font-size:19px;color:#fff;}' +
                '.kp-modal-reviews-head-115 small{display:block;margin-top:4px;font-size:12px;color:rgba(255,255,255,.42);}' +
                '.kp-modal-reviews-count-115{min-width:32px;height:32px;padding:0 10px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,152,0,.14);border:1px solid rgba(255,152,0,.3);color:#ffb74d;font-size:12px;font-weight:800;box-sizing:border-box;}' +
                '.kp-modal-review-list-115{display:flex;flex-direction:column;gap:12px;}' +
                '.kp-modal-review{position:relative;padding:15px 16px 15px 17px;border-radius:16px;background:linear-gradient(165deg,rgba(35,35,39,.95),rgba(25,25,28,.98));border:1px solid rgba(255,255,255,.07);box-shadow:0 8px 20px rgba(0,0,0,.26);overflow:hidden;}' +
                '.kp-modal-review::before{content:"";position:absolute;left:0;top:9px;bottom:9px;width:3px;border-radius:3px;}' +
                '.kp-modal-review--positive::before{background:#4caf50;box-shadow:0 0 8px rgba(76,175,80,.4);}' +
                '.kp-modal-review--negative::before{background:#f44336;box-shadow:0 0 8px rgba(244,67,54,.35);}' +
                '.kp-modal-review--neutral::before{background:#9e9e9e;}' +
                '.kp-modal-review-top{display:flex;align-items:center;justify-content:space-between;gap:10px;}' +
                '.kp-modal-review-user{display:flex;align-items:center;min-width:0;}' +
                '.kp-modal-review-avatar-wrap{width:38px;height:38px;flex:0 0 38px;margin-right:10px;padding:2px;border-radius:50%;background:linear-gradient(135deg,#ff9800,rgba(255,255,255,.12));box-sizing:border-box;}' +
                '.kp-modal-review-avatar,.kp-modal-review-avatar-placeholder{width:34px;height:34px;border-radius:50%;object-fit:cover;background:#252529;display:block;}' +
                '.kp-modal-review-avatar-placeholder{display:flex;align-items:center;justify-content:center;font-size:15px;}' +
                '.kp-modal-review-user-info{min-width:0;}' +
                '.kp-modal-review-author{font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
                '.kp-modal-review-date{margin-top:2px;font-size:10px;color:rgba(255,255,255,.4);}' +
                '.kp-modal-review-type{flex-shrink:0;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);font-size:10px;font-weight:700;color:rgba(255,255,255,.72);white-space:nowrap;}' +
                '.kp-modal-review-title{margin-top:11px;font-size:14px;line-height:1.35;font-weight:800;color:#fff;}' +
                '.kp-modal-review-text{margin-top:8px;font-size:13px;line-height:1.55;color:rgba(255,255,255,.7);word-break:break-word;}' +
                '.kp-modal-review-text.is-collapsed{max-height:6.8em;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,#000 60%,transparent 100%);mask-image:linear-gradient(180deg,#000 60%,transparent 100%);}' +
                '.kp-modal-review-more{display:inline-flex;margin-top:9px;padding:6px 11px;border-radius:999px;background:rgba(255,152,0,.08);border:1px solid rgba(255,152,0,.2);color:#ffb74d;font-size:10px;font-weight:700;}' +
                '.kp-modal-review-pages-115{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:15px;padding:10px 0;flex-wrap:wrap;color:rgba(255,255,255,.5);font-size:12px;}' +
                '.kp-modal-review-page-115{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);color:#fff;font-size:12px;font-weight:700;box-sizing:border-box;cursor:pointer;}' +
                '.kp-modal-review-page-115.focus,.kp-modal-review-page-115.is-active{border-color:#ff9800;background:linear-gradient(135deg,#ff9800,#e65100);color:#1b1205;box-shadow:0 5px 12px rgba(255,152,0,.25);transform:translateY(-1px);}' +
                '.kp-modal-review-page-115.is-disabled{opacity:.25;}' +
                '.kp-modal-reviews-loading-115,.kp-modal-reviews-error-115{padding:18px 0 24px;color:rgba(255,255,255,.45);font-size:13px;line-height:1.5;}' +
                '.kp-modal-reviews-error-115{color:rgba(255,255,255,.5);}' +
                '@media (max-width:520px){' +
                '.kp-rating-modal-info-grid{grid-template-columns:1fr!important;}' +
                    '.kp-tmdb-ratings-v115{gap:.65em!important;}' +
                    '.kp-rating-v115,.tmdb-rating-v115{padding:.68em .65em .65em!important;}' +
                    '.kp-rating-v115__logo{width:7.2em!important;}' +
                    '.tmdb-rating-v115__logo{width:5em!important;}' +
                    '.kp-rating-v115__score span,.tmdb-rating-v115__score span{font-size:1.7em!important;}' +
                    '.kp-rating-v115__main,.tmdb-rating-v115__main{gap:.55em!important;}' +
                '}';
            document.head.appendChild(style);
        }
        settings();

        Lampa.Listener.follow('full', function (e) {
            if (!e || e.type !== 'complite') return;
            if (!cfg.enabled) return;

            var render = e.object.activity.render();

            if ($('.kp-rating-v115', render).length) return;

            var movie = e.data && e.data.movie;

            if (!movie) return;

            inject(movie);
        });

        console.log('[KP Ratings] v1.1.3 started');
    }

    function boot() {
        if (typeof Lampa === 'undefined') {
            setTimeout(boot, 200);
            return;
        }

        if (window.appready) {
            start();
        } else if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') start();
            });
        } else {
            start();
        }
    }

    boot();
})();
