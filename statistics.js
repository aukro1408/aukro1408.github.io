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

// Стили интерфейса личного кабинета
Lampa.Template.add(plugin.component + '_style', '<style>\
    .personal-stats-container { padding: 2em; }\
    .stats-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5em; margin-bottom: 2em; }\
    .stats-card { background: rgba(53, 53, 53, 0.65); border-radius: 1em; padding: 1.5em; text-align: center; }\
    .stats-card__value { font-size: 2.5em; font-weight: 700; margin-top: 0.2em; color: #fff; }\
    .stats-card__title { font-size: 1.1em; opacity: 0.7; }\
    .stats-section-title { font-size: 1.5em; font-weight: 600; margin-bottom: 1em; margin-top: 1.5em; }\
</style>');
$('body').append(Lampa.Template.get(plugin.component + '_style', {}, true));

function statsPage(object) {
    var _this = this;
    html = $('<div></div>');
    var body = $('<div class="personal-stats-container"></div>');
    
    this.create = function () {
        _this.activity.loader(true);
        
        // Заголовок раздела
        var info = $('<div class="info layer--width"><div class="info__left"><div class="info__title">Личный кабинет и аналитика</div><div class="info__title-original">Ваши просмотры, статистика и рекомендации</div></div></div>');
        html.append(info);

        // Блок с общей статистикой (заглушки/примеры данных, которые позже можно привязать к localStorage истории Lampa)
        var grid = $('<div class="stats-cards-grid"> \
            <div class="stats-card"><div class="stats-card__title">Время просмотров</div><div class="stats-card__value">142 часа</div></div> \
            <div class="stats-card"><div class="stats-card__title">Просмотрено фильмов</div><div class="stats-card__value">48</div></div> \
            <div class="stats-card"><div class="stats-card__title">Эпизодов сериалов</div><div class="stats-card__value">215</div></div> \
            <div class="stats-card"><div class="stats-card__title">Любимый жанр</div><div class="stats-card__value">Фантастика</div></div> \
        </div>');
        body.append(grid);

        // Блок рекомендаций
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
        scroll.destroy();
        html.remove();
    };
}

Lampa.Component.add(plugin.component, statsPage);

// Создание элемента в левом боковом меню (аналогично IPTV плагину)[span_1](start_span)[span_1](end_span)
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
    
    // Внедряем в первый список левого меню[span_2](start_span)[span_2](end_span)
    var menu = $('.menu .menu__list').eq(0);
    menu.append(menuElement);
}

if (window.appready) pluginStart();
else Lampa.Listener.follow('app', function(e){ if (e.type === 'ready') pluginStart(); });

})();
