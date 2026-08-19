// ==UserScript==
// @name         Lampa Подборки
// @namespace    lampa.thematic.collections
// @version      0.4
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';
    if (window.lampa_thematic_collections) return;
    window.lampa_thematic_collections = true;

    var COMPONENT = 'thematic_collections';
    var IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';
    var HERO_BASE = 'https://image.tmdb.org/t/p/w1280';

    var COLLECTIONS = [
        {
            id: 'zombie', title: 'Зомби', icon: '🧟',
            description: 'Зомби, эпидемии и выживание',
            url: 'discover/movie?with_genres=27&with_keywords=12377&sort_by=popularity.desc&vote_average.gte=6.0&vote_count.gte=100&include_adult=false&language=ru-RU'
        },
        {
            id: 'space', title: 'Космос', icon: '🚀',
            description: 'Космос, другие планеты и экспедиции',
            url: 'discover/movie?with_genres=878&with_keywords=9882&sort_by=popularity.desc&vote_average.gte=6.0&vote_count.gte=100&include_adult=false&language=ru-RU'
        }
    ];

    var loaded = {};

    function esc(v) {
        return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }

    function imageUrl(size, path) {
        if (!path) return '';

        try {
            if (Lampa.TMDB && typeof Lampa.TMDB.image === 'function') {
                return Lampa.TMDB.image('t/p/' + size + path);
            }
        } catch(e) {}

        try {
            return Lampa.Utils.protocol() +
                'image.tmdb.org/t/p/' + size + path;
        } catch(e) {}

        return 'https://image.tmdb.org/t/p/' + size + path;
    }

    function addStyles() {
        if (document.getElementById(COMPONENT + '_style')) return;
        var s = document.createElement('style');
        s.id = COMPONENT + '_style';
        s.textContent = `
            .tc-page{width:100%;min-height:100%;box-sizing:border-box;padding:3em 4em 4em;color:#fff}
            .tc-title{font-size:3em;font-weight:700;line-height:1.05;margin-bottom:.25em}
            .tc-subtitle{font-size:1.1em;opacity:.5;margin-bottom:2em}
            .tc-section{margin-bottom:2.4em}
            .tc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.8em}
            .tc-section-title{font-size:1.45em;font-weight:600}
            .tc-desc{font-size:.85em;opacity:.42;margin-left:.7em}
            .tc-all{padding:.5em .85em;border-radius:.7em;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);opacity:.8}
            .tc-all.focus{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.3);opacity:1}
            .tc-row{display:flex;gap:.75em;overflow-x:auto;overflow-y:hidden;padding:.25em .2em .8em;scrollbar-width:none}
            .tc-row::-webkit-scrollbar{display:none}
            .tc-card{flex:0 0 9.2em;width:9.2em;min-width:9.2em;position:relative;border-radius:.65em;overflow:hidden;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.055);transform:scale(1);transition:transform .18s ease,border-color .18s ease}
            .tc-card.focus{transform:scale(1.05);border-color:rgba(255,255,255,.65);z-index:3}
            .tc-poster{width:100%;aspect-ratio:2/3;display:block;object-fit:cover;background:#151515}
            .tc-info{padding:.55em .6em .65em}
            .tc-name{font-size:.82em;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .tc-meta{display:flex;gap:.35em;margin-top:.35em;font-size:.68em;opacity:.52}
            .tc-rating{opacity:.9}
            .tc-loading,.tc-empty{padding:3em 1em;opacity:.35}
            @media(max-width:900px){.tc-page{padding:2em 1.4em 3em}.tc-title{font-size:2.1em}.tc-card{flex-basis:8em;width:8em;min-width:8em}}
        
            /* Category hero image: loaded from TMDB backdrop_path. */
            .tc-hero {
                position: relative;
                height: 14em;
                margin-bottom: 1em;
                border-radius: 1.1em;
                overflow: hidden;
                background: #111;
                box-shadow: 0 .5em 1.6em rgba(0,0,0,.28);
            }

            .tc-hero-img {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transform: scale(1.02);
                transition: opacity .6s ease, transform 1s ease;
            }

            .tc-hero-img.loaded {
                opacity: 1;
                transform: scale(1);
            }

            .tc-hero:after {
                content: '';
                position: absolute;
                inset: 0;
                background:
                    linear-gradient(90deg, rgba(0,0,0,.78) 0%,
                    rgba(0,0,0,.32) 55%, rgba(0,0,0,.05) 100%),
                    linear-gradient(0deg, rgba(0,0,0,.72) 0%,
                    transparent 58%);
                pointer-events: none;
            }

            .tc-hero-content {
                position: absolute;
                left: 1.3em;
                right: 1.3em;
                bottom: 1.1em;
                z-index: 2;
            }

            .tc-hero-title {
                font-size: 2em;
                line-height: 1.05;
                font-weight: 700;
                text-shadow: 0 .15em .5em rgba(0,0,0,.65);
            }

            .tc-hero-desc {
                margin-top: .35em;
                max-width: 32em;
                font-size: .95em;
                opacity: .84;
                text-shadow: 0 .1em .35em rgba(0,0,0,.8);
            }

            .tc-hero-icon {
                margin-bottom: .25em;
                font-size: 1.65em;
                filter: drop-shadow(0 .15em .3em rgba(0,0,0,.55));
            }

            @media (max-width: 700px) {
                .tc-hero {
                    height: 11.5em;
                }
                .tc-hero-title {
                    font-size: 1.55em;
                }
            }
`;
        document.head.appendChild(s);
    }

    function openCategory(c){
        Lampa.Activity.push({component:'category_full',source:'tmdb',title:c.title,url:c.url,page:1});
    }

    function openMovie(movie){
        if (!movie || !movie.id) return;
        Lampa.Activity.push({component:'full',source:'tmdb',id:movie.id,movie:movie,title:movie.title || movie.original_title || ''});
    }

    function renderMovies(section,movies){
        var row=section.find('.tc-row');
        row.empty();

        // Use the first TMDB result's backdrop as the category hero image.
        var firstBackdrop = movies.find(function(movie){
            return movie && movie.backdrop_path;
        }) || movies.find(function(movie){
            return movie && movie.poster_path;
        });

        var hero = section.find('.tc-hero-img');
        if (hero.length && firstBackdrop) {
            var heroPath = firstBackdrop.backdrop_path || firstBackdrop.poster_path;
            var heroSize = firstBackdrop.backdrop_path ? 'w1280' : 'w780';

            hero.attr('src', imageUrl(heroSize, heroPath));
            hero.on('load', function(){ $(this).addClass('loaded'); });
            hero.on('error', function(){
                $(this).removeClass('loaded');
            });
            if (hero[0].complete) hero.addClass('loaded');
        }

        if(!movies.length){
            row.html('<div class="tc-empty">В этой подборке ничего не найдено</div>');
            return;
        }

        movies.slice(0,10).forEach(function(movie){
            if(!movie || !movie.poster_path) return;
            var title=movie.title || movie.original_title || 'Без названия';
            var year=String(movie.release_date || '').slice(0,4);
            var card=$('<div class="tc-card selector" tabindex="0">' +
                '<img class="tc-poster" src="' + esc(imageUrl('w342', movie.poster_path)) + '" loading="lazy">' +
                '<div class="tc-info"><div class="tc-name">' + esc(title) + '</div>' +
                '<div class="tc-meta"><span>' + esc(year) + '</span><span class="tc-rating">★ ' + Number(movie.vote_average||0).toFixed(1) + '</span></div></div></div>');
            card.on('hover:enter',function(){openMovie(movie)});
            card.on('click',function(){openMovie(movie)});
            card.on('hover:focus',function(){$(this).addClass('focus')});
            card.on('hover:leave',function(){$(this).removeClass('focus')});
            row.append(card);
        });
    }

    function load(c,section){
        if(loaded[c.id]){
            renderMovies(section,loaded[c.id]);
            return;
        }

        var done = false;

        function success(data){
            if(done) return;
            done = true;

            var results = data && Array.isArray(data.results) ? data.results : [];

            loaded[c.id] = results;
            renderMovies(section, results);
        }

        function fail(){
            if(done) return;
            done = true;

            section.find('.tc-row').html(
                '<div class="tc-empty">Не удалось загрузить подборку</div>'
            );
        }

        /*
         * Используем ТОТ ЖЕ путь, что и твой рабочий top_kino.js:
         *
         * Lampa.Activity -> category_full -> source tmdb -> Api.list()
         *
         * Мы не строим собственный TMDB-запрос и не обращаемся напрямую
         * к image.tmdb.org. Lampa сама добавляет ключ, язык, прокси,
         * source и обработку ответа.
         */
        try {
            if (Lampa.Api && typeof Lampa.Api.list === 'function') {
                Lampa.Api.list({
                    url: c.url,
                    source: 'tmdb',
                    page: 1
                }, function(data){
                    success(data);
                }, function(){
                    fail();
                });

                return;
            }
        } catch(e) {
            console.log('[Подборки] Lampa.Api.list error', e);
        }

        /*
         * Запасной вариант только для старых сборок Lampa.
         */
        try {
            if (Lampa.Api &&
                Lampa.Api.sources &&
                Lampa.Api.sources.tmdb &&
                typeof Lampa.Api.sources.tmdb.list === 'function') {

                Lampa.Api.sources.tmdb.list({
                    url: c.url,
                    source: 'tmdb',
                    page: 1
                }, function(data){
                    success(data);
                }, function(){
                    fail();
                });

                return;
            }
        } catch(e) {
            console.log('[Подборки] legacy TMDB list error', e);
        }

        fail();
    }

    function build(){
        addStyles();

        var page=$('<div class="tc-page">' +
            '<div class="tc-title">Подборки</div>' +
            '<div class="tc-subtitle">Тематические фильмы на основе TMDB</div>' +
            '</div>');

        COLLECTIONS.forEach(function(c){
            var section=$(
                '<section class="tc-section">' +
                    '<div class="tc-hero">' +
                        '<img class="tc-hero-img" loading="lazy">' +
                        '<div class="tc-hero-content">' +
                            '<div class="tc-hero-icon">' + esc(c.icon) + '</div>' +
                            '<div class="tc-hero-title">' + esc(c.title) + '</div>' +
                            '<div class="tc-hero-desc">' + esc(c.description) + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="tc-head">' +
                        '<div><span class="tc-section-title">' + esc(c.icon) + ' ' + esc(c.title) + '</span></div>' +
                        '<div class="tc-all selector" tabindex="0">Все →</div>' +
                    '</div>' +
                    '<div class="tc-row"><div class="tc-loading">Загрузка...</div></div>' +
                '</section>'
            );

            section.find('.tc-all').on('hover:enter',function(){openCategory(c)});
            section.find('.tc-all').on('click',function(){openCategory(c)});
            section.find('.tc-all').on('hover:focus',function(){$(this).addClass('focus')});
            section.find('.tc-all').on('hover:leave',function(){$(this).removeClass('focus')});

            page.append(section);
            load(c,section);
        });

        return page;
    }

    function Component(object){
        var html=null,dead=false;
        this.create=function(){
            html=build();
            setTimeout(function(){if(dead||!html)return;try{Lampa.Controller.collectionSet(html);Lampa.Controller.toggle('content')}catch(e){}},100);
            return html;
        };
        this.start=function(){
            if(Lampa.Activity.active && Lampa.Activity.active().activity!==this.activity)return;
            Lampa.Controller.add('content',{
                toggle:function(){if(html)Lampa.Controller.collectionSet(html)},
                left:function(){if(typeof Navigator!=='undefined'&&Navigator.canmove('left'))Navigator.move('left');else Lampa.Controller.toggle('menu')},
                right:function(){if(typeof Navigator!=='undefined'&&Navigator.canmove('right'))Navigator.move('right')},
                up:function(){if(typeof Navigator!=='undefined'&&Navigator.canmove('up'))Navigator.move('up')},
                down:function(){if(typeof Navigator!=='undefined'&&Navigator.canmove('down'))Navigator.move('down')},
                back:function(){Lampa.Activity.backward()}
            });
            Lampa.Controller.toggle('content');
        };
        this.pause=function(){};
        this.stop=function(){};
        this.destroy=function(){dead=true;if(html)html.remove();html=null;};
        this.render=function(){return $('<div></div>').append(this.create())};
    }

    function addMenu(){
        var menu=$('.menu .menu__list').eq(0);
        if(!menu.length){setTimeout(addMenu,500);return;}
        if($('.thematic-collections-menu').length)return;
        var item=$('<li class="menu__item selector thematic-collections-menu"><div class="menu__ico">★</div><div class="menu__text">Подборки</div></li>');
        function open(e){if(e)e.stopPropagation();var a={id:COMPONENT,component:COMPONENT,title:'Подборки'};try{if(Lampa.Activity.active().component===COMPONENT)Lampa.Activity.replace(a);else Lampa.Activity.push(a)}catch(err){console.error('[Подборки] open',err)}}
        item.on('hover:enter',open);item.on('click',open);menu.prepend(item);
    }

    function start(){
        if(!window.Lampa){setTimeout(start,1000);return;}
        if(!Lampa.Component || typeof Lampa.Component.add!=='function'){console.error('[Подборки] Component API недоступен');return;}
        Lampa.Component.add(COMPONENT,Component);
        addStyles();addMenu();
        Lampa.Listener.follow('activity',function(){setTimeout(addMenu,500)});
        console.log('✔ Lampa Подборки 0.4 loaded — native TMDB Api.list');
    }
    start();
})();
9
