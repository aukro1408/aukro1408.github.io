/* jshint esversion: 6 */
/* TMDB_MOD Extended By DrXAOS - 30+ Sources with Russian and International Cinemas */

(function () {
    'use strict';

    if (window.plugin_tmdb_mod_ready) return;
    window.plugin_tmdb_mod_ready = true;

    var extend = function (target, source) {
        if (Lampa.Arrays && Lampa.Arrays.extend) {
            return Lampa.Arrays.extend(target, source);
        }
        return Object.assign(target, source);
    };

    var Episode = function (data) {
        var card = data.card || data;
        var episode = data.next_episode_to_air || data.episode || {};

        if (!card.source) card.source = 'tmdb';

        extend(card, {
            title: card.name,
            original_title: card.original_name,
            release_date: card.first_air_date
        });

        card.release_year = ((card.release_date || '0000') + '').slice(0, 4);

        var html, imgPoster, imgEpisode;
        var loaded = false;

        this.build = function () {
            if (!Lampa.Template || typeof Lampa.Template.js !== 'function') {
                return this.createFallback();
            }

            html = Lampa.Template.js('card_episode');
            if (!html) return this.createFallback();

            this.setupElements();
            this.attachEvents();
            return html;
        };

        this.createFallback = function () {
            html = document.createElement('div');
            html.className = 'card card__episode';
            html.innerHTML = '<div class="card__title"></div><div class="card__img"><img src="./img/img_broken.svg"></div>';
            this.setupElements();
            return html;
        };

        this.setupElements = function () {
            if (!html) return;
            imgPoster = html.querySelector('.card__img img') || html.querySelector('.card__img');
            imgEpisode = html.querySelector('.full-episode__img img');

            var titleElem = html.querySelector('.card__title');
            var numElem = html.querySelector('.full-episode__num');
            var nameElem = html.querySelector('.full-episode__name');
            var dateElem = html.querySelector('.full-episode__date');
            var ageElem = html.querySelector('.card__age');

            if (titleElem) titleElem.textContent = card.title || card.name || '';
            if (numElem) numElem.textContent = card.unwatched || '';

            if (episode && episode.air_date) {
                if (nameElem) {
                    nameElem.textContent = 's' + (episode.season_number || '?') + 'e' + (episode.episode_number || '?') + '. ' + (episode.name || Lampa.Lang.translate('noname'));
                }
                if (dateElem && Lampa.Utils && Lampa.Utils.parseTime) {
                    var parsed = Lampa.Utils.parseTime(episode.air_date);
                    dateElem.textContent = parsed && parsed.full ? parsed.full : episode.air_date;
                }
            }

            if (card.release_year === '0000' || !card.release_year) {
                if (ageElem) ageElem.remove();
            } else {
                if (ageElem) ageElem.textContent = card.release_year;
            }
        };

        this.attachEvents = function () {
            if (!html) return;
            html.addEventListener('mouseenter', this.onFocus.bind(this));
            html.addEventListener('mouseleave', this.onHover.bind(this));
            html.addEventListener('click', this.onEnter.bind(this));
        };

        this.load = function () {
            if (loaded || !html) return;
            loaded = true;

            if (imgPoster) {
                var src = '';
                if (card.poster_path && Lampa.Api && Lampa.Api.img) src = Lampa.Api.img(card.poster_path);
                else if (card.profile_path && Lampa.Api && Lampa.Api.img) src = Lampa.Api.img(card.profile_path);
                else if (card.poster) src = card.poster;
                else if (card.img) src = card.img;
                else src = './img/img_broken.svg';

                if (imgPoster.tagName === 'IMG') {
                    imgPoster.src = src;
                    imgPoster.onerror = function () { imgPoster.src = './img/img_broken.svg'; };
                } else {
                    imgPoster.style.backgroundImage = 'url(' + src + ')';
                }
            }

            if (imgEpisode) {
                var episodeSrc = '';
                if (episode.still_path && Lampa.Api && Lampa.Api.img) episodeSrc = Lampa.Api.img(episode.still_path, 'w300');
                else if (card.backdrop_path && Lampa.Api && Lampa.Api.img) episodeSrc = Lampa.Api.img(card.backdrop_path, 'w300');
                else if (episode.img) episodeSrc = episode.img;
                else if (card.img) episodeSrc = card.img;
                else episodeSrc = './img/img_broken.svg';

                imgEpisode.src = episodeSrc;
                imgEpisode.onerror = function () { imgEpisode.src = './img/img_broken.svg'; };
            }
        };

        this.onFocus = function () { this.load(); };
        this.onHover = function () {};
        this.onEnter = function () { if (this.onSelect) this.onSelect(card); };
        this.render = function () { return html; };
        this.destroy = function () {
            if (html) {
                html.removeEventListener('mouseenter', this.onFocus);
                html.removeEventListener('mouseleave', this.onHover);
                html.removeEventListener('click', this.onEnter);
                html.remove();
            }
            html = null;
            imgPoster = null;
            imgEpisode = null;
            loaded = false;
        };
    };

    var SourceTMDB = function (parent) {
        this.network = new Lampa.Reguest();
        this.discovery = false;

        this.main = function () {
            var owner = this;
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var oncomplete = arguments.length > 1 ? arguments[1] : undefined;
            var onerror = arguments.length > 2 ? arguments[2] : undefined;

            var hasSequentials = Lampa.Api && Lampa.Api.sequentials && typeof Lampa.Api.sequentials === 'function';
            var hasPartNext = Lampa.Api && Lampa.Api.partNext && typeof Lampa.Api.partNext === 'function';

            if (!hasSequentials && !hasPartNext) {
                if (onerror) onerror();
                return;
            }

            var today = new Date().toISOString().substr(0, 10);

            var parts_data = [
                function (call) {
                    owner.get('discover/movie?sort_by=primary_release_date.desc&with_release_type=4|5|6&primary_release_date.lte=' + today + '&vote_count.gte=100&vote_average.gte=6&with_runtime.gte=40&without_genres=99&region=RU', params, function (json) {
                        json.title = 'Горячие новинки';
                        call(json);
                    }, call);
                },
                function (call) {
                    var upcoming = [];
                    if (Lampa.TimeTable && typeof Lampa.TimeTable.lately === 'function') {
                        try { upcoming = Lampa.TimeTable.lately().slice(0, 20); } catch (e) {}
                    }
                    call({
                        source: 'tmdb',
                        results: upcoming,
                        title: 'Предстоящие эпизоды',
                        nomore: true,
                        cardClass: Episode
                    });
                },
                function (call) {
                    owner.get('trending/movie/week', params, function (json) {
                        json.title = 'Фильмы в тренде за неделю';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('trending/tv/week', params, function (json) {
                        json.title = 'Сериалы в тренде за неделю';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/movie?sort_by=popularity.desc&with_release_type=4|5|6&primary_release_date.lte=' + today + '&vote_count.gte=100&vote_average.gte=6&with_runtime.gte=40&without_genres=99&region=RU', params, function (json) {
                        json.title = 'Хиты и обсуждаемые тренды';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/movie?with_original_language=ru&sort_by=primary_release_date.desc&with_release_type=4|5|6&primary_release_date.lte=' + today + '&vote_count.gte=5&with_runtime.gte=40&without_genres=99&region=RU', params, function (json) {
                        json.title = 'Русские фильмы';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?with_networks=3827|2493|3871|5806|4085&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'Топ сериалы платформ';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=3871&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'ОККО';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=2859&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'Premier';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=2493&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'START';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=5806&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'WINK';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=4085&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'KION';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=3827&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'Кинопоиск';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=806&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'СТС';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=1191&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'ТНТ';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=3923&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'ИВИ';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=1024&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'Первый канал';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=1025&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'Россия-1';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?language=ru&with_networks=1026&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'ВГТРК';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?with_networks=49&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'HBO';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?with_networks=1399&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'Netflix';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?with_networks=2552&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'Apple TV';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?with_networks=1024|1025|1026&sort_by=first_air_date.desc&language=ru', params, function (json) {
                        json.title = 'Популярные ТВ (РФ)';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?with_networks=49|1399|2552&sort_by=first_air_date.desc', params, function (json) {
                        json.title = 'Популярные сервисы';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/movie?sort_by=revenue.desc&vote_count.gte=100&primary_release_year=2024&region=RU', params, function (json) {
                        json.title = 'Кассовые хиты 2024';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/movie?sort_by=revenue.desc&vote_count.gte=100&with_original_language=en', params, function (json) {
                        json.title = 'Hollywood Blockbusters';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/movie?sort_by=rating.desc&with_original_language=ko|ja', params, function (json) {
                        json.title = 'Азиатское кино';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/movie?sort_by=popularity.desc&with_original_language=de|fr&vote_count.gte=50', params, function (json) {
                        json.title = 'Европейское кино';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/movie?sort_by=revenue.desc&vote_count.gte=1000&with_genres=28', params, function (json) {
                        json.title = 'Боевики';
                        call(json);
                    }, call);
                },
                function (call) {
                    owner.get('discover/tv?sort_by=popularity.desc&with_genres=18|10765&vote_count.gte=100', params, function (json) {
                        json.title = 'Популярные сериалы';
                        call(json);
                    }, call);
                }
            ];

            var methodToUse = hasSequentials ? Lampa.Api.sequentials : Lampa.Api.partNext;
            methodToUse(parts_data, 30, oncomplete, onerror);

            return function () {};
        };

        this.get = function (path, params, callback, error) {
            if (parent && parent.get && typeof parent.get === 'function') {
                return parent.get(path, params, callback, error);
            }
            if (error) error();
        };
    };

    function registerPlugin() {
        try {
            if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
                return false;
            }

            var tmdb_mod = Object.assign({}, Lampa.Api.sources.tmdb, new SourceTMDB(Lampa.Api.sources.tmdb));
            Lampa.Api.sources.tmdb_mod = tmdb_mod;

            Object.defineProperty(Lampa.Api.sources, 'tmdb_mod', {
                get: function () { return tmdb_mod; },
                enumerable: true,
                configurable: true
            });

            if (Lampa.Manifest && Lampa.Manifest.catalog) {
                if (typeof Lampa.Manifest.catalog === 'object') {
                    Lampa.Manifest.catalog.tmdb_mod = {
                        name: 'TMDB_MOD',
                        title: 'TMDB MOD (30+ sources)',
                        icon: 'tmdb',
                        order: 1,
                        source: 'tmdb_mod'
                    };
                }
            }

            if (Lampa.Params && Lampa.Params.select && typeof Lampa.Params.select === 'function') {
                try {
                    var current_source = (Lampa.Params.values && Lampa.Params.values['source']) || {};
                    current_source['tmdb_mod'] = 'TMDB_MOD';
                    Lampa.Params.select('source', current_source, 'tmdb_mod');
                } catch (e) {}
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    function waitForApp() {
        if (window.appready) {
            registerPlugin();
        } else if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    registerPlugin();
                }
            });
        } else {
            setTimeout(registerPlugin, 1000);
        }
    }

    waitForApp();

})();
