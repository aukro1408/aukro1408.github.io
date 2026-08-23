(function () {
    'use strict';

    var ID = 'cinemax_hero_streamings_v2';
    var HERO_ROW = 'cinemax_hero_v2';
    var STREAM_ROW = 'cinemax_streamings_v2';

    function key() {
        try {
            return Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '';
        } catch (e) { return ''; }
    }

    function lang() {
        try { return Lampa.Storage.get('language', 'ru') || 'ru'; }
        catch (e) { return 'ru'; }
    }

    function tmdb(path) {
        return Lampa.TMDB.api(path + (path.indexOf('?') >= 0 ? '&' : '?') +
            'api_key=' + encodeURIComponent(key()) +
            '&language=' + encodeURIComponent(lang()));
    }

    function today() {
        var d = new Date();
        return d.getFullYear() + '-' +
            ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
            ('0' + d.getDate()).slice(-2);
    }

    function image(path, size) {
        return path ? Lampa.TMDB.image('t/p/' + (size || 'w500') + path) : '';
    }

    function service(id, title, svg, movie, tv, categories) {
        return {
            id: id,
            title: title,
            svg: svg,
            movie: movie || null,
            tv: tv || null,
            categories: categories || []
        };
    }

    function category(id, title, type, params) {
        return { id: id, title: title, type: type, params: params || {} };
    }

    /* Логотипы встроены в JS. Это только векторные wordmark-варианты,
       чтобы плагин оставался одним файлом. При необходимости их можно
       заменить на SVG из твоего исходного файла. */
    var LOGOS = {
        netflix: '<svg viewBox="0 0 256 69" xmlns="http://www.w3.org/2000/svg"><text x="128" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="900" fill="#E50914">NETFLIX</text></svg>',
        apple: '<svg viewBox="0 0 240 70" xmlns="http://www.w3.org/2000/svg"><text x="120" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#fff">Apple TV+</text></svg>',
        hbo: '<svg viewBox="0 0 180 70" xmlns="http://www.w3.org/2000/svg"><text x="90" y="49" text-anchor="middle" font-family="Arial,sans-serif" font-size="45" font-weight="900" fill="#fff">HBO</text></svg>',
        amazon: '<svg viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg"><text x="150" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-size="31" font-weight="700" fill="#00A8E1">prime video</text></svg>',
        disney: '<svg viewBox="0 0 260 70" xmlns="http://www.w3.org/2000/svg"><text x="130" y="46" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#fff">Disney+</text></svg>',
        paramount: '<svg viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg"><text x="150" y="46" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#fff">Paramount+</text></svg>',
        sky: '<svg viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg"><text x="150" y="46" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#fff">SkyShowtime</text></svg>',
        hulu: '<svg viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg"><text x="100" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="800" fill="#1CE783">Hulu</text></svg>',
        syfy: '<svg viewBox="0 0 180 70" xmlns="http://www.w3.org/2000/svg"><text x="90" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="900" fill="#fff">SYFY</text></svg>'
    };

    var STREAMINGS = [
        service('netflix','Netflix',LOGOS.netflix,{provider:'8',region:'UA'},{network:'213'},[
            category('new_movies','🎬 Новые фильмы','movie',{sort_by:'primary_release_date.desc','primary_release_date.lte':'{date}', 'vote_count.gte':'5'}),
            category('new_tv','📺 Новые сериалы','tv',{sort_by:'first_air_date.desc','first_air_date.lte':'{date}', 'vote_count.gte':'5'}),
            category('popular_movies','🔥 Популярные фильмы','movie',{sort_by:'popularity.desc'}),
            category('best_tv','⭐ Лучшие сериалы','tv',{sort_by:'vote_average.desc','vote_count.gte':'50'}),
            category('originals','🅰️ Netflix Originals','tv',{sort_by:'vote_average.desc','vote_count.gte':'500','vote_average.gte':'7.5'}),
            category('thrillers','🤯 Запутанные триллеры','movie',{with_genres:'53,9648',sort_by:'popularity.desc'}),
            category('scifi','🐉 Фантастика и фэнтези','tv',{with_genres:'10765',sort_by:'popularity.desc'}),
            category('kdrama','🇰🇷 K-Дорамы','tv',{with_original_language:'ko',sort_by:'popularity.desc'}),
            category('truecrime','🔪 True Crime','tv',{with_genres:'99',with_keywords:'9840|10714',sort_by:'popularity.desc'}),
            category('anime','🍿 Аниме','tv',{with_genres:'16',with_keywords:'210024',sort_by:'popularity.desc'})
        ]),
        service('apple','Apple TV+',LOGOS.apple,{provider:'350',region:'UA'},{network:'2552|3235'},[
            category('new_movies','🎬 Новые фильмы','movie',{sort_by:'primary_release_date.desc','primary_release_date.lte':'{date}','vote_count.gte':'2'}),
            category('new_tv','📺 Новые сериалы','tv',{sort_by:'first_air_date.desc','first_air_date.lte':'{date}','vote_count.gte':'2'}),
            category('popular_movies','🔥 Популярные фильмы','movie',{sort_by:'popularity.desc'}),
            category('best_tv','⭐ Лучшие сериалы','tv',{sort_by:'vote_average.desc','vote_count.gte':'50'}),
            category('scifi','🛸 Эпический Sci-Fi','tv',{with_genres:'10765',sort_by:'popularity.desc'}),
            category('comedy','😂 Комедии','tv',{with_genres:'35',sort_by:'popularity.desc'}),
            category('detective','🕵️ Детективы','tv',{with_genres:'9648,80',sort_by:'popularity.desc'}),
            category('originals','🎬 Apple Originals','movie',{sort_by:'vote_average.desc','vote_count.gte':'100'})
        ]),
        service('hbo','HBO / Max',LOGOS.hbo,{company:'174|49'}, {network:'49|3186'},[
            category('new_movies','🎬 Новые фильмы','movie',{sort_by:'primary_release_date.desc','primary_release_date.lte':'{date}','vote_count.gte':'10'}),
            category('new_tv','📺 Новые сериалы','tv',{sort_by:'first_air_date.desc','first_air_date.lte':'{date}','vote_count.gte':'5'}),
            category('popular_movies','🔥 Популярные фильмы','movie',{sort_by:'popularity.desc','vote_count.gte':'50'}),
            category('best_tv','⭐ Лучшие сериалы','tv',{sort_by:'vote_average.desc','vote_count.gte':'1000'}),
            category('fantasy','🐉 Эпические саги','tv',{with_genres:'10765',sort_by:'popularity.desc'}),
            category('drama','🎭 Премиальные драмы','tv',{with_genres:'18',without_genres:'10765',sort_by:'popularity.desc'}),
            category('dc','🦇 DC','movie',{with_keywords:'9715',sort_by:'revenue.desc'}),
            category('detective','🧠 Мрачные детективы','tv',{with_genres:'80,9648',sort_by:'vote_average.desc','vote_count.gte':'300'})
        ]),
        service('amazon','Prime Video',LOGOS.amazon,{provider:'119',region:'US'},{network:'1024'},[
            category('new_movies','🎬 Новые фильмы','movie',{sort_by:'primary_release_date.desc','primary_release_date.lte':'{date}','vote_count.gte':'5'}),
            category('new_tv','📺 Новые сериалы','tv',{sort_by:'first_air_date.desc','first_air_date.lte':'{date}','vote_count.gte':'5'}),
            category('popular_movies','🔥 Популярные фильмы','movie',{sort_by:'popularity.desc'}),
            category('best_tv','⭐ Лучшие сериалы','tv',{sort_by:'vote_average.desc','vote_count.gte':'300'}),
            category('action','🩸 Жёсткий экшн','tv',{with_genres:'10759,10765',sort_by:'popularity.desc'}),
            category('comedy','😂 Комедии','tv',{with_genres:'35',sort_by:'popularity.desc'}),
            category('thrillers','🕵️ Триллеры','tv',{with_genres:'9648,18',sort_by:'vote_average.desc','vote_count.gte':'300'})
        ]),
        service('disney','Disney+',LOGOS.disney,{provider:'337',region:'US'},{network:'2739'},[
            category('new_movies','🎬 Новые фильмы','movie',{sort_by:'primary_release_date.desc','primary_release_date.lte':'{date}','vote_count.gte':'5'}),
            category('new_tv','📺 Новые сериалы','tv',{sort_by:'first_air_date.desc','first_air_date.lte':'{date}','vote_count.gte':'5'}),
            category('popular_movies','🔥 Популярные фильмы','movie',{with_companies:'2',sort_by:'popularity.desc'}),
            category('best_tv','⭐ Лучшие сериалы','tv',{sort_by:'vote_average.desc','vote_count.gte':'50'}),
            category('marvel','🦸 Marvel','movie',{with_companies:'420',sort_by:'release_date.desc','vote_count.gte':'100'}),
            category('starwars','⚔️ Star Wars','tv',{with_companies:'1',with_keywords:'1930',sort_by:'popularity.desc'}),
            category('pixar','🧸 Pixar','movie',{with_companies:'3',sort_by:'popularity.desc'}),
            category('fx','🍷 FX / Star','tv',{with_networks:'88|453',sort_by:'popularity.desc'})
        ]),
        service('paramount','Paramount+',LOGOS.paramount,{company:'4'},{network:'4330'},[
            category('new_movies','🎬 Новые фильмы','movie',{sort_by:'primary_release_date.desc','primary_release_date.lte':'{date}','vote_count.gte':'10'}),
            category('new_tv','📺 Новые сериалы','tv',{sort_by:'first_air_date.desc','first_air_date.lte':'{date}','vote_count.gte':'2'}),
            category('popular_movies','🔥 Популярные фильмы','movie',{sort_by:'popularity.desc'}),
            category('best_tv','⭐ Лучшие сериалы','tv',{sort_by:'vote_average.desc','vote_count.gte':'50'}),
            category('yellowstone','🤠 Вселенная Yellowstone','tv',{with_networks:'318|4330',with_keywords:'256112',sort_by:'popularity.desc'}),
            category('startrek','🖖 Star Trek','tv',{with_networks:'4330',with_keywords:'159223',sort_by:'first_air_date.desc'}),
            category('crime','🔎 Криминал','tv',{with_networks:'16',with_genres:'80,18',sort_by:'popularity.desc'}),
            category('kids','🧸 Детский мир','tv',{with_networks:'13',sort_by:'popularity.desc'})
        ]),
        service('sky_showtime','SkyShowtime',LOGOS.sky,{company:'4|33|521'},{company:'67|115331'},[
            category('new_movies','🎬 Новые фильмы','movie',{with_companies:'4|33|521',sort_by:'primary_release_date.desc','primary_release_date.lte':'{date}','vote_count.gte':'5'}),
            category('new_tv','📺 Новые сериалы','tv',{with_companies:'67|115331',sort_by:'first_air_date.desc','first_air_date.lte':'{date}','vote_count.gte':'2'}),
            category('popular_movies','🔥 Популярные фильмы','movie',{with_companies:'4|33',sort_by:'popularity.desc'}),
            category('best_tv','⭐ Лучшие сериалы','tv',{with_companies:'67|115331',sort_by:'vote_average.desc','vote_count.gte':'50'}),
            category('paramount','💥 Paramount','movie',{with_companies:'4',sort_by:'revenue.desc'}),
            category('universal','🌎 Universal','movie',{with_companies:'33',sort_by:'popularity.desc'}),
            category('showtime','🌙 Showtime','tv',{with_companies:'67',sort_by:'popularity.desc'}),
            category('dreamworks','🐉 DreamWorks','movie',{with_companies:'521',sort_by:'popularity.desc'})
        ]),
        service('hulu','Hulu',LOGOS.hulu,{provider:'15',region:'US'},{network:'453'},[
            category('new_movies','🎬 Новые фильмы','movie',{sort_by:'primary_release_date.desc','primary_release_date.lte':'{date}','vote_count.gte':'2'}),
            category('new_tv','📺 Новые сериалы','tv',{sort_by:'first_air_date.desc','first_air_date.lte':'{date}','vote_count.gte':'2'}),
            category('popular_movies','🔥 Популярные фильмы','movie',{sort_by:'popularity.desc'}),
            category('best_tv','⭐ Лучшие сериалы','tv',{sort_by:'vote_average.desc','vote_count.gte':'50'}),
            category('truecrime','🔪 True Crime','tv',{with_genres:'18,9648',sort_by:'popularity.desc'}),
            category('comedy','😂 Комедии','tv',{with_genres:'35',sort_by:'popularity.desc'}),
            category('animation','🤬 Анимация','tv',{with_genres:'16',sort_by:'popularity.desc'})
        ]),
        service('syfy','Syfy',LOGOS.syfy,null,{network:'77'},[
            category('new_tv','📺 Новые сериалы','tv',{sort_by:'first_air_date.desc','first_air_date.lte':'{date}','vote_count.gte':'1'}),
            category('popular_tv','🔥 Популярное','tv',{sort_by:'popularity.desc'}),
            category('space','🚀 Космос','tv',{with_genres:'10765',with_keywords:'3801',sort_by:'vote_average.desc','vote_count.gte':'50'}),
            category('monsters','👽 Монстры и паранормальное','tv',{with_genres:'9648,10765',without_keywords:'3801',sort_by:'popularity.desc'})
        ])
    ];

    function request(url, ok, bad) {
        var r = new Lampa.Reguest();
        r.silent(url, ok, bad || function () {});
    }

    function paramsFor(s, type) {
        var p = {};
        var base = type === 'movie' ? s.movie : s.tv;
        if (base) {
            if (base.provider) {
                p.with_watch_providers = base.provider;
                p.watch_region = base.region || 'US';
            }
            if (base.network) p.with_networks = base.network;
            if (base.company) p.with_companies = base.company;
        }
        return p;
    }

    function query(s, c, page) {
        var p = paramsFor(s, c.type);
        Object.keys(c.params || {}).forEach(function (k) {
            p[k] = c.params[k];
        });
        p.page = page || 1;
        Object.keys(p).forEach(function (k) {
            p[k] = String(p[k]).replace('{date}', today());
        });

        var q = [];
        Object.keys(p).forEach(function (k) {
            q.push(encodeURIComponent(k) + '=' + encodeURIComponent(p[k]));
        });
        return tmdb((c.type === 'tv' ? 'discover/tv' : 'discover/movie') + '?' + q.join('&'));
    }

    function findService(id) {
        return STREAMINGS.find(function (s) { return s.id === id; });
    }

    function css() {
        if ($('#cinemax-v2-css').length) return;
        $('head').append('<style id="cinemax-v2-css">' +
            '.cinemax-hero-v2{position:relative!important;overflow:hidden!important;border-radius:1em!important;background-size:cover!important;background-position:center!important;box-shadow:0 0 20px rgba(0,0,0,.45)!important;margin-bottom:10px!important;height:22.5em!important}' +
            '.cinemax-hero-v2 .card__view,.cinemax-hero-v2 .card__title,.cinemax-hero-v2 .card__age,.cinemax-hero-v2 .card-marks,.cinemax-hero-v2 .card__icons,.cinemax-hero-v2 .card__quality{display:none!important}' +
            '.cinemax-hero-v2__overlay{position:absolute;left:0;right:0;bottom:0;padding:2em;background:linear-gradient(to top,rgba(0,0,0,.92),transparent);z-index:2}' +
            '.cinemax-hero-v2__title{font-size:2.2em;font-weight:800;color:#fff;text-shadow:2px 2px 4px #000;max-width:80%}' +
            '.cinemax-hero-v2__logo{height:4em;max-width:70%;object-fit:contain;object-position:left bottom}' +
            '.cinemax-hero-v2__meta{display:flex;gap:.7em;color:#ddd;margin:.5em 0;font-size:.9em}' +
            '.cinemax-hero-v2__desc{max-width:60%;color:#ddd;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
            '.cinemax-stream-card-v2{position:relative;overflow:hidden}' +
            '.cinemax-stream-card-v2 .card__view{display:flex!important;align-items:center!important;justify-content:center!important;background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:.8em!important}' +
            '.cinemax-stream-card-v2 svg{width:80%;height:5em}' +
            '.cinemax-stream-page-v2{padding:1.5em 2em 4em}' +
            '.cinemax-stream-page-v2__title{font-size:2em;font-weight:800;margin-bottom:1em}' +
            '.cinemax-cat-v2{margin-bottom:2em}.cinemax-cat-v2__title{font-size:1.25em;font-weight:700;margin-bottom:.6em}' +
            '.cinemax-cat-v2__list{display:flex;gap:.7em;overflow-x:auto;padding:.2em 0 .8em}' +
            '.cinemax-cat-card-v2{flex:0 0 9em;width:9em}.cinemax-cat-card-v2 img{width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:.6em}.cinemax-cat-card-v2__title{font-size:.85em;margin-top:.4em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
            '.cinemax-cat-card-v2__rating{font-size:.75em;opacity:.65;margin-top:.2em}' +
            '.cinemax-more-v2{padding:.8em 1em;border-radius:.7em;background:rgba(255,255,255,.08);align-self:center;flex:0 0 auto}' +
            '.cinemax-all-v2,.cinemax-category-item-v2{display:block;padding:1em 1.2em;margin:.5em 0;border-radius:.8em;background:rgba(255,255,255,.06)}' +
            '.cinemax-category-item-v2.focus,.cinemax-all-v2.focus,.cinemax-more-v2.focus{background:rgba(255,255,255,.16)}' +
            '.cinemax-grid-v2{display:grid;grid-template-columns:repeat(auto-fill,minmax(9em,1fr));gap:1em}.cinemax-grid-v2 .cinemax-cat-card-v2{width:auto}' +
            '</style>');
    }

    function heroCard(movie) {
        var card = Lampa.Maker.make('Card', movie, function (m) {
            return m.only('Card', 'Callback');
        });

        var el = $(card.render(true));
        el.addClass('cinemax-hero-v2');

        var type = movie.name ? 'tv' : 'movie';
        var bg = movie.backdrop_path || movie.poster_path;
        el.css('background-image', 'url("' + image(bg, 'original') + '")');

        function draw(details) {
            var logo = details && details.images && details.images.logos || [];
            var selected = logo.find(function (x) { return x.iso_639_1 === lang(); }) ||
                logo.find(function (x) { return x.iso_639_1 === 'en'; }) || logo[0];

            var title = $('<div class="cinemax-hero-v2__title"></div>').text(movie.title || movie.name || '');
            if (selected && selected.file_path) {
                title = $('<img class="cinemax-hero-v2__logo">').attr('src', image(selected.file_path, 'w500'));
            }

            var rating = details && details.vote_average || movie.vote_average;
            var date = details && (details.release_date || details.first_air_date) ||
                movie.release_date || movie.first_air_date;

            var meta = [];
            if (rating) meta.push('★ ' + Number(rating).toFixed(1));
            if (date) meta.push(String(date).slice(0, 4));
            meta.push(type === 'movie' ? 'Фильм' : 'Сериал');

            el.find('.cinemax-hero-v2__overlay').remove();
            var overlay = $('<div class="cinemax-hero-v2__overlay"></div>');
            overlay.append(title);
            overlay.append($('<div class="cinemax-hero-v2__meta"></div>').text(meta.join('  •  ')));
            overlay.append($('<div class="cinemax-hero-v2__desc"></div>').text(
                (details && details.overview) || movie.overview || ''
            ));
            el.append(overlay);
        }

        draw(null);
        request(tmdb(type + '/' + movie.id + '?append_to_response=images'), function (details) {
            draw(details);
        });

        el.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: movie.title || movie.name || '',
                component: 'full',
                card: movie
            });
        });

        return {
            title: 'Hero',
            params: {
                createInstance: function () {
                    return card;
                }
            },
            html: el[0]
        };
    }

    function addHero() {
        Lampa.ContentRows.add({
            index: 0,
            name: HERO_ROW,
            title: 'Hero',
            screen: ['main'],
            call: function () {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var url = tmdb('movie/now_playing?region=UA&page=1');

                    network.silent(url, function (json) {
                        var items = (json.results || []).filter(function (x) {
                            return x.backdrop_path;
                        }).slice(0, 10);

                        if (!items.length) {
                            network.silent(tmdb('trending/all/week?page=1'), function (fallback) {
                                items = (fallback.results || []).filter(function (x) {
                                    return x.backdrop_path;
                                }).slice(0, 10);
                                finish(items);
                            }, function () { callback({results:[]}); });
                        } else finish(items);

                        function finish(list) {
                            callback({
                                results: list.map(function (m) { return heroCard(m); }),
                                title: 'Hero',
                                params: { items: { mapping: 'line', view: 15 } }
                            });
                        }
                    }, function () { callback({results:[]}); });
                };
            }
        });
    }

    function streamingCard(s) {
        var card = Lampa.Maker.make('Card', {
            id: s.id,
            title: s.title
        }, function (m) { return m.only('Card', 'Callback'); });

        var el = $(card.render(true));
        el.addClass('cinemax-stream-card-v2');
        el.find('.card__view').html(s.svg);
        el.find('.card__title,.card__age,.card-marks,.card__icons,.card__quality').remove();

        el.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: s.title,
                component: 'cinemax_streaming_main_v2',
                service_id: s.id,
                page: 1
            });
        });

        return {
            title: s.title,
            params: {
                createInstance: function () { return card; }
            },
            html: el[0]
        };
    }

    function addStreamings() {
        Lampa.ContentRows.add({
            index: 1,
            name: STREAM_ROW,
            title: 'Стриминги',
            screen: ['main'],
            call: function () {
                return function (callback) {
                    callback({
                        results: STREAMINGS.map(streamingCard),
                        title: 'Стриминги',
                        params: { items: { mapping: 'line', view: 8 } }
                    });
                };
            }
        });
    }

    function StreamingMain(object) {
        this.object = object || {};
        this.service = findService(this.object.service_id);
        this.html = $('<div class="cinemax-stream-page-v2"></div>');

        this.render = function () {
            var self = this;
            if (!self.service) return self.html;

            self.html.append($('<div class="cinemax-stream-page-v2__title"></div>').text(self.service.title));

            self.service.categories.slice(0, 4).forEach(function (c) {
                self.addRow(c);
            });

            var all = $('<div class="selector cinemax-all-v2"></div>').text('Все категории →');
            all.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: self.service.title,
                    component: 'cinemax_categories_v2',
                    service_id: self.service.id
                });
            });
            self.html.append(all);

            return self.html;
        };

        this.addRow = function (c) {
            var self = this;
            var block = $('<div class="cinemax-cat-v2"></div>');
            block.append($('<div class="cinemax-cat-v2__title"></div>').text(c.title));
            var list = $('<div class="cinemax-cat-v2__list"></div>');
            block.append(list);
            self.html.append(block);

            request(query(self.service, c, 1), function (json) {
                (json.results || []).slice(0, 12).forEach(function (item) {
                    list.append(catalogCard(item));
                });

                if ((json.results || []).length) {
                    var more = $('<div class="selector cinemax-more-v2"></div>').text('Все →');
                    more.on('hover:enter', function () {
                        Lampa.Activity.push({
                            url: query(self.service, c, 1),
                            title: c.title,
                            component: 'cinemax_view_v2',
                            service_id: self.service.id,
                            category_id: c.id,
                            page: 1
                        });
                    });
                    list.append(more);
                }
            });
        };

        this.destroy = function () { this.html.remove(); };
    }

    function catalogCard(item) {
        var title = item.title || item.name || '';
        var el = $('<div class="selector cinemax-cat-card-v2"></div>');
        var p = item.poster_path || item.backdrop_path;
        if (p) el.append($('<img>').attr('src', image(p, 'w342')).attr('alt', title));
        el.append($('<div class="cinemax-cat-card-v2__title"></div>').text(title));
        if (item.vote_average) el.append($('<div class="cinemax-cat-card-v2__rating"></div>').text('★ ' + Number(item.vote_average).toFixed(1)));
        el.on('hover:enter', function () {
            Lampa.Activity.push({url:'',title:title,component:'full',card:item});
        });
        return el;
    }

    function Categories(object) {
        this.service = findService((object || {}).service_id);
        this.html = $('<div class="cinemax-stream-page-v2"></div>');
        this.render = function () {
            var self = this;
            if (!self.service) return self.html;
            self.html.append($('<div class="cinemax-stream-page-v2__title"></div>').text(self.service.title));
            self.service.categories.forEach(function (c) {
                var item = $('<div class="selector cinemax-category-item-v2"></div>').text(c.title);
                item.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: query(self.service, c, 1),
                        title: c.title,
                        component: 'cinemax_view_v2',
                        service_id: self.service.id,
                        category_id: c.id,
                        page: 1
                    });
                });
                self.html.append(item);
            });
            return self.html;
        };
        this.destroy = function () { this.html.remove(); };
    }

    function View(object) {
        object = object || {};
        this.service = findService(object.service_id);
        this.category = this.service && this.service.categories.find(function (c) { return c.id === object.category_id; });
        this.page = Number(object.page || 1);
        this.html = $('<div class="cinemax-stream-page-v2"></div>');
        this.grid = $('<div class="cinemax-grid-v2"></div>');

        this.render = function () {
            var self = this;
            if (!self.service || !self.category) return self.html;
            self.html.append($('<div class="cinemax-stream-page-v2__title"></div>').text(self.category.title));
            self.html.append(self.grid);
            self.load(self.page);
            return self.html;
        };

        this.load = function (page) {
            var self = this;
            request(query(self.service, self.category, page), function (json) {
                (json.results || []).forEach(function (item) {
                    self.grid.append(catalogCard(item));
                });
                if (json.total_pages && page < json.total_pages) {
                    var next = $('<div class="selector cinemax-more-v2"></div>').text('Загрузить ещё');
                    next.css({gridColumn:'1/-1', justifySelf:'center'});
                    next.on('hover:enter', function () {
                        next.remove();
                        self.load(page + 1);
                    });
                    self.grid.append(next);
                }
            });
        };

        this.destroy = function () { this.html.remove(); };
    }

    function register() {
        if (!Lampa.Component || !Lampa.Component.add) return;
        Lampa.Component.add('cinemax_streaming_main_v2', StreamingMain);
        Lampa.Component.add('cinemax_categories_v2', Categories);
        Lampa.Component.add('cinemax_view_v2', View);
    }

    function init() {
        if (!window.Lampa || !Lampa.ContentRows || !Lampa.Maker) return;
        if ($('#cinemax-v2-css').length) return;
        css();
        register();
        addHero();
        addStreamings();
    }

    if (window.appready) init();
    else if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
