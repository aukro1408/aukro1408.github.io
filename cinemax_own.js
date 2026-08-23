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

    window.__CINEMAX_STUDIOS = [0];

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
        if ($('#cinemax-v3-studio-css').length) return;
        $('head').append('<style id="cinemax-v3-studio-css">' +
            '.card--studio{width:12em!important;height:6.75em!important;padding:0!important;background:#f5f7fa;border-radius:.8em;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.06);transition:transform .18s ease-out,box-shadow .18s ease-out}' +
            '.card--studio.focus{transform:scale(1.06);box-shadow:0 0 18px rgba(255,255,255,.9);z-index:10}' +
            '.card--studio .card__view{width:100%;height:100%;padding:.6em!important;box-sizing:border-box!important;background-origin:content-box;display:block;position:relative}' +
            '.studio-logo-wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center}' +
            '.studio-logo-img{max-width:70%;max-height:60%;object-fit:contain;display:block}' +
            '.studio-logo-fallback{display:block;font-weight:700;font-size:1.05em;text-align:center;color:#111}' +
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

    /* heroCard replaced by source-compatible makeHeroResultItem */
function getTmdbKey() {
        try { return (Lampa.Storage.get('flixio_tmdb_apikey') || '').trim() || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : ''); } catch (e) { return key(); }
    }

function makeHeroResultItem(movie, heightEm) {
        if (!$('#studios5-hero-css').length) {
            $('body').append('<style id="studios5-hero-css">.hero-banner .card-marks, .hero-banner .card__icons, .hero-banner .card__quality { display: none !important; }</style>');
        }
        if (!$('#studios5-show-more-css').length) {
            $('body').append('<style id="studios5-show-more-css">' +
                '.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.card.show-more-button:focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button:hover { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
            '</style>');
        }
        heightEm = heightEm || 22.5;
        var pad = (heightEm / 35 * 2).toFixed(1);
        var titleEm = (heightEm / 35 * 2.5).toFixed(2);
        var descEm = (heightEm / 35 * 1.1).toFixed(2);

        var renderHeroContent = function(item, movie) {
            item.empty(); // Clear existing content
            item.append('<div class="hero-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: ' + pad + 'em; border-radius: 0 0 1em 1em;">' +
                '<div class="hero-header" style="margin-bottom: 0.3em; min-height: 3em; display: flex; align-items: flex-end;">' +
                    '<div class="hero-title" style="font-size: ' + titleEm + 'em; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">' + (movie.title || movie.name) + '</div>' +
                '</div>' +
                '<div class="hero-meta" style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5em; font-size: 0.9em; color: #ccc; margin-bottom: 0.5em;"></div>' +
                '<div class="hero-desc" style="font-size: ' + descEm + 'em; color: #ddd; max-width: 60%; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.6em;">' + (movie.overview || '') + '</div>' +
                '<div class="hero-trailer-btn selector" style="display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.2); padding: 0.4em 0.8em; border-radius: 0.3em; cursor: pointer; transition: background 0.2s;">' +
                '<svg style="width: 1.2em; height: 1.2em; margin-right: 0.4em;" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                '<span style="font-size: 0.9em; font-weight: 600;">Трейлер</span>' +
                '</div>' +
                '</div>');
            
            // Trailer Click
            item.find('.hero-trailer-btn').on('hover:enter click', function (e) {
                e.stopPropagation();
                var network = new Lampa.Reguest();
                var type = movie.name ? 'tv' : 'movie';
                var lang = Lampa.Storage.get('language', 'uk');
                function search(searchLang) {
                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                    network.silent(url, function (json) {
                        var videos = json.results || [];
                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                        if (trailer && trailer.key) {
                            Lampa.Activity.push({url:'',component:'full',id:movie.id,method:movie.name?'tv':'movie',card:movie,source:'tmdb'});
                        } else if (searchLang !== 'en-US') {
                            search('en-US');
                        } else {
                            Lampa.Noty.show('Трейлер не знайдено');
                        }
                    }, function() {
                            if (searchLang !== 'en-US') search('en-US');
                            else Lampa.Noty.show('Помилка пошуку трейлера');
                    });
                }
                search(lang);
            });

            // Fetch Details
            var type = movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language', 'uk');
            var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + getTmdbKey() + '&language=' + lang + '&append_to_response=images,release_dates,content_ratings');
            
            var network = new Lampa.Reguest();
            network.silent(url, function(details) {
                // Logo
                var logo = null;
                if (details.images && details.images.logos && details.images.logos.length) {
                    logo = details.images.logos.find(function(l) { return l.iso_639_1 === lang; }) || 
                           details.images.logos.find(function(l) { return l.iso_639_1 === 'en'; }) || 
                           details.images.logos[0];
                }
                if (logo) {
                    var logoUrl = Lampa.TMDB.image('t/p/w500' + logo.file_path);
                    item.find('.hero-title').html('<img src="' + logoUrl + '" style="height: 4em; width: auto; max-width: 80%; object-fit: contain; display: block;" />');
                    item.find('.hero-header').css('min-height', 'auto');
                }

                // Metadata
                var metaParts = [];
                
                // Rating & Year
                var headMeta = '';
                var rating = details.vote_average || movie.vote_average;
                if (rating) headMeta += '<span class="card__mark card__mark--rating" style="position: static; margin: 0 0.5em 0 0; padding: 0.2em 0.5em; font-size: 0.9em; background: rgba(255,255,255,0.2); border-radius: 0.3em;">★ ' + parseFloat(rating).toFixed(1) + '</span>';
                
                var date = details.release_date || details.first_air_date || movie.release_date || movie.first_air_date;
                if (date) headMeta += parseInt(date);
                
                if (headMeta) metaParts.push(headMeta);
                
                // Type
                var typeStr = type === 'movie' ? Lampa.Lang.translate('movie') : Lampa.Lang.translate('tv');
                if (!typeStr || typeStr === 'movie' || typeStr === 'tv') {
                    typeStr = type === 'movie' ? (lang === 'ru' ? 'Фильм' : 'Фільм') : (lang === 'ru' ? 'Сериал' : 'Серіал');
                }
                metaParts.push(typeStr);
                
                // Age Rating
                var age = '';
                if (type === 'movie' && details.release_dates && details.release_dates.results) {
                    var rel = details.release_dates.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                    if (rel && rel.release_dates && rel.release_dates.length) age = rel.release_dates[0].certification;
                } else if (type === 'tv' && details.content_ratings && details.content_ratings.results) {
                    var rat = details.content_ratings.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                    if (rat) age = rat.rating;
                }
                if (age) {
                    var ageColor = '#fff';
                    var ageVal = parseInt(age);
                    var displayAge = age;

                    if (!isNaN(ageVal)) {
                        displayAge = ageVal + '+';
                        if (ageVal >= 18) ageColor = '#d32f2f'; // Red
                        else if (ageVal >= 16) ageColor = '#f57c00'; // Orange
                        else if (ageVal >= 12) ageColor = '#fbc02d'; // Yellow
                        else ageColor = '#388e3c'; // Green
                    } else {
                        // US Ratings Mapping
                        if (['R', 'NC-17', 'TV-MA'].indexOf(age) !== -1) {
                            ageColor = '#d32f2f';
                            displayAge = '18+';
                        } else if (['PG-13', 'TV-14'].indexOf(age) !== -1) {
                            ageColor = '#f57c00';
                            displayAge = '16+';
                        } else if (['PG', 'TV-PG', 'TV-Y7'].indexOf(age) !== -1) {
                            ageColor = '#fbc02d';
                            displayAge = '12+';
                        } else {
                            ageColor = '#388e3c';
                            displayAge = '0+';
                        }
                    }
                    metaParts.push('<span style="border: 1px solid ' + ageColor + '; color: ' + ageColor + '; padding: 0 0.3em; border-radius: 0.2em; font-size: 0.9em; font-weight: bold;">' + displayAge + '</span>');
                }

                // Country
                if (details.production_countries && details.production_countries.length) {
                    metaParts.push(details.production_countries[0].iso_3166_1);
                }
                
                // Duration
                var runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0);
                if (runtime) {
                    var h = Math.floor(runtime / 60);
                    var m = runtime % 60;
                    var hStr = h > 0 ? h + (lang === 'ru' ? 'ч.' : 'год.') : '';
                    var mStr = m > 0 ? m + (lang === 'ru' ? 'м.' : 'хв.') : '';
                    if (hStr || mStr) metaParts.push((hStr + ' ' + mStr).trim());
                }

                if (metaParts.length) {
                    item.find('.hero-meta').html('<span>' + metaParts.join('</span><span>') + '</span>');
                }
            });
        };

        return {
            title: 'Hero',
            params: {
                createInstance: function (element) {
                    var card = Lampa.Maker.make('Card', element, function (module) { return module.only('Card', 'Callback'); });
                    return card;
                },
                emit: {
                    onCreate: function () {
                        var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                        try {
                            var item = $(this.html);
                            item.addClass('hero-banner');
                            item.css({
                                'background-image': 'url(' + img + ')',
                                'width': '100%',
                                'height': heightEm + 'em',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'border-radius': '1em',
                                'position': 'relative',
                                'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                'margin-bottom': '10px'
                            });
                            
                            renderHeroContent(item, movie);

                            item.find('.card__view').remove();
                            item.find('.card__title').remove();
                            item.find('.card__age').remove();
                            item.find('.card-marks').remove();
                            item.find('.card__icons').remove();
                            item[0].heroMovieData = movie;
                        } catch (e) { console.log('Hero onCreate error:', e); }
                    },
                    onVisible: function () {
                        try {
                            var item = $(this.html);
                            if (!item.hasClass('hero-banner')) {
                                var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                                item.addClass('hero-banner');
                                item.css({
                                    'background-image': 'url(' + img + ')',
                                    'width': '100%',
                                    'height': heightEm + 'em',
                                    'background-size': 'cover',
                                    'background-position': 'center',
                                    'border-radius': '1em',
                                    'position': 'relative',
                                    'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                    'margin-bottom': '10px'
                                });
                                
                                renderHeroContent(item, movie);

                                item.find('.card__view').remove();
                                item.find('.card__title').remove();
                                item.find('.card__age').remove();
                                item.find('.card-marks').remove();
                                item.find('.card__icons').remove();
                                item[0].heroMovieData = movie;
                            }
                            // Stop default image loading
                            if (this.img) this.img.onerror = function () { };
                            if (this.img) this.img.onload = function () { };
                        } catch (e) { console.log('Hero onVisible error:', e); }
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({
                            url: '',
                            component: 'full',
                            id: movie.id,
                            method: movie.name ? 'tv' : 'movie',
                            card: movie,
                            source: 'tmdb'
                        });
                    },
                    onKey: function(key) {}
                }
            }
        };
    }

    function addHeroRow() {
        Lampa.ContentRows.add({
            index: 0,
            name: 'cinemax_hero_v2',
            title: 'Hero',
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    // Fetch Now Playing movies (Fresh releases)
                    var url = Lampa.TMDB.api('movie/now_playing?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk') + '&region=UA');

                    network.silent(url, function (json) {
                        var items = json.results || [];
                        if (!items.length) {
                            // Fallback if no fresh movies
                            url = Lampa.TMDB.api('trending/all/week?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk'));
                            network.silent(url, function (retryJson) {
                                items = retryJson.results || [];
                                build(items);
                            });
                            return;
                        }
                        build(items);

                        function build(movies) {
                            var moviesWithBackdrop = movies.filter(function (m) { return m.backdrop_path; });
                            var results = moviesWithBackdrop.slice(0, 15).map(function (movie) { return makeHeroResultItem(movie, 22.5); });

                            callback({
                                results: results,
                                title: 'Hero',
                                params: {
                                    items: {
                                        mapping: 'line',
                                        view: 15
                                    }
                                }
                            });
                        }

                    }, function () {
                        callback({ results: [] });
                    });
                };
            }
        });
    }

    function streamingCard(s) {
        return {
            title: s.name || s.title,
            params: {
                createInstance: function () {
                    var card = Lampa.Maker.make('Card', this, function (module) {
                        return module.only('Card', 'Callback');
                    });
                    return card;
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--studio');
                        var view = item.find('.card__view');
                        view.empty();

                        var wrapper = $('<div class="studio-logo-wrap"></div>');
                        if (s.svg) {
                            var svgEl = $(s.svg);
                            svgEl.addClass('studio-logo-img');
                            svgEl.css({
                                'max-width': '70%',
                                'max-height': '60%',
                                'display': 'block'
                            });
                            wrapper.append(svgEl);
                        } else {
                            wrapper.append($('<div class="studio-logo-fallback"></div>').text(s.name || s.title));
                        }
                        view.append(wrapper);
                        item.find('.card__age, .card__year, .card__type, .card__textbox, .card__title').remove();
                        item.attr('data-click-processed', '1');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({
                            url: '',
                            title: s.name || s.title,
                            component: 'cinemax_streaming_main_v2',
                            service_id: s.id,
                            page: 1
                        });
                    }
                }
            }
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
                    var items = STREAMINGS.map(function (cfg) {
                        var s = (window.__CINEMAX_STUDIOS || []).find(function (x) { return x.id === cfg.id; });
                        return s || { id: cfg.id, name: cfg.title, title: cfg.title, svg: '' };
                    });
                    callback({
                        results: items.map(streamingCard),
                        title: 'Стриминги',
                        params: { items: { view: 15, mapping: 'line' } }
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
        if ($('#cinemax-v3-studio-css').length) return;
        css();
        register();
        addHeroRow();
        addStreamings();

        // Match the proven Flixio layout: wide hero cards + correct initial focus.
        setTimeout(function () {
            var heroCards = document.querySelectorAll('.hero-banner');
            for (var i = 0; i < heroCards.length; i++) {
                heroCards[i].style.width = '85vw';
                heroCards[i].style.marginRight = '1.5em';
            }

            var studioCard = $('.card--studio').first();
            if (studioCard.length && Lampa.Controller && Lampa.Controller.enabled) {
                try {
                    if (Lampa.Controller.enabled().name === 'main' && Lampa.Controller.collectionFocus) {
                        Lampa.Controller.collectionFocus(studioCard[0], $('.scroll__content').eq(1)[0]);
                    }
                } catch (e) {}
            }
        }, 1000);
    }

    if (window.appready) init();
    else if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
