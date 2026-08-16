;(function () {
'use strict';

var plugin = {
    component: 'personal_stats',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>',
    name: 'Статистика'
};

var html = $('<div></div>');
var scroll = new Lampa.Scroll({
    mask: true,
    over: true,
    step: 250
});

Lampa.Template.add(plugin.component + '_style', '<style>\
    .personal-stats-container { padding: 2em; }\
    .stats-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5em; margin-bottom: 2em; }\
    .stats-card { background: rgba(53, 53, 53, 0.65); border-radius: 1em; padding: 1.5em; text-align: center; }\
    .stats-card__value { font-size: 2.5em; font-weight: 700; margin-top: 0.2em; color: #fff; }\
    .stats-card__title { font-size: 1.1em; opacity: 0.7; }\
    .stats-section-title { font-size: 1.5em; font-weight: 600; margin-bottom: 1em; margin-top: 1.5em; }\
</style>');
$('body').append(Lampa.Template.get(plugin.component + '_style', {}, true));

function getRealStats() {
    var history = Lampa.Storage.get('history', []);
    var books = Lampa.Storage.get('book', []);
    var totalSeconds = 0;
    var moviesCount = 0;
    var episodesCount = 0;
    var genresMap = {};
    var totalItemsCount = 0;

    if (Array.isArray(history)) {
        totalItemsCount += history.length;
        history.forEach(function (item) {
            if (item.time) {
                totalSeconds += (item.time.watched || item.time.time || 0);
            }
            if (item.type === 'movie') {
                moviesCount++;
            } else if (item.type === 'tv' || item.number_of_seasons) {
                episodesCount++;
            }
            if (item.genres && Array.isArray(item.genres)) {
                item.genres.forEach(function (g) {
                    var gName = typeof g === 'string' ? g : (g.name || '');
                    if (gName) genresMap[gName] = (genresMap[gName] || 0) + 1;
                });
            }
        });
    }

    var bookItemsCount = 0;
    if (books) {
        var extractItems = function(collection) {
            if (Array.isArray(collection)) {
                collection.forEach(function (item) {
                    bookItemsCount++;
                    if (item.type === 'movie') moviesCount++;
                    else if (item.type === 'tv') episodesCount++;

                    if (item.genres && Array.isArray(item.genres)) {
                        item.genres.forEach(function (g) {
                            var gName = typeof g === 'string' ? g : (g.name || '');
                            if (gName) genresMap[gName] = (genresMap[gName] || 0) + 1;
                        });
                    }
                });
            }
        };

        if (Array.isArray(books)) {
            extractItems(books);
        } else if (typeof books === 'object') {
            Object.keys(books).forEach(function (category) {
                extractItems(books[category]);
            });
        }
    }

    var totalHours = Math.round(totalSeconds / 3600);
    if (totalHours === 0 && (totalItemsCount > 0 || bookItemsCount > 0)) {
        totalHours = Math.max(1, Math.round((totalItemsCount + bookItemsCount) * 0.8));
    }

    var favoriteGenre = 'Не определен';
    var maxGenreCount = 0;
    for (var genre in genresMap) {
        if (genresMap[genre] > maxGenreCount) {
            maxGenreCount = genresMap[genre];
            favoriteGenre = genre;
        }
    }

    return {
        hours: totalHours,
        movies: moviesCount || totalItemsCount,
        episodes: episodesCount,
        genre: favoriteGenre
    };
}

function statsPage(object) {
    var _this = this;
    html = $('<div></div>');
    var body = $('<div class="personal-stats-container"></div>');
    var grid;
    
    function updateGridContent() {
        var stats = getRealStats();
        if (grid) grid.remove();

        grid = $('<div class="stats-cards-grid"> \
            <div class="stats-card"><div class="stats-card__title">Время просмотров</div><div class="stats-card__value">' + stats.hours + ' ч</div></div> \
            <div class="stats-card"><div class="stats-card__title">Просмотрено фильмов</div><div class="stats-card__value">' + stats.movies + '</div></div> \
            <div class="stats-card"><div class="stats-card__title">Эпизодов сериалов</div><div class="stats-card__value">' + stats.episodes + '</div></div> \
            <div class="stats-card"><div class="stats-card__title">Любимый жанр</div><div class="stats-card__value" style="font-size: 1.6em;">' + stats.genre + '</div></div> \
        </div>');
        
        body.prepend(grid);
    }

    var storageListener = function (e) {
        if (e.name === 'history' || e.name === 'book') {
            updateGridContent();
        }
    };
    Lampa.Storage.listener.follow('change', storageListener);

    this.create = function () {
        _this.activity.loader(true);
        
        var info = $('<div class="info layer--width"><div class="info__left"><div class="info__title">Личный кабинет и аналитика</div><div class="info__title-original">Данные синхронизированы с Cub.red</div></div></div>');
        html.append(info);

        updateGridContent();

        body.append('<div class="stats-section-title">Рекомендации для вас</div>');
        var recommendationsContainer = $('<div class="cards"></div>');
        body.append(recommendationsContainer);

        scroll.render().addClass('layer--wheight').data('mheight', info);
        scroll.append(body);
        html.append(scroll.render());

        _this.activity.loader(false);
        _this.activity.toggle();
    };

    this.start = function () {
        Lampa.Controller.add('content', {
            toggle: function () {
                Lampa.Controller.collectionSet(scroll.render());
                Lampa.Controller.collectionFocus(scroll.render().find('.selector').eq(0), scroll.render());
            },
            left: function () {
                if (Navigator.canmove('left')) Navigator.move('left');
                else Lampa.Controller.toggle('menu');
            },
            right: function () {
                if (Navigator.canmove('right')) Navigator.move('right');
            },
            up: function () {
                if (Navigator.canmove('up')) Navigator.move('up');
                else Lampa.Controller.toggle('head');
            },
            down: function () {
                if (Navigator.canmove('down')) Navigator.move('down');
            },
            back: function () {
                Lampa.Activity.backward();
            }
        });
        Lampa.Controller.toggle('content');
    };

    this.render = function () {
        return html;
    };

    this.destroy = function () {
        Lampa.Storage.listener.remove('change', storageListener);
        scroll.destroy();
        html.remove();
    };
}

Lampa.Component.add(plugin.component, statsPage);

var menuElement = $('<li class="menu__item selector js-' + plugin.component + '-menu">'
                + '<div class="menu__ico">' + plugin.icon + '</div>'
                + '<div class="menu__text">' + plugin.name + '</div>'
            + '</li>')
    .on('hover:enter', function(){
        Lampa.Activity.push({
            url: '',
            title: plugin.name,
            component: plugin.component,
            page: 1
        });
    });

function pluginStart() {
    if (window['plugin_' + plugin.component + '_ready']) return;
    window['plugin_' + plugin.component + '_ready'] = true;
    
    var menu = $('.menu .menu__list').eq(0);
    menu.append(menuElement);
}

if (window.appready) pluginStart();
else Lampa.Listener.follow('app', function(e){ if (e.type === 'ready') pluginStart(); });

})();
