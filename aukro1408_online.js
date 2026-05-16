// ==UserScript==
// @name         Lampa aukro1408 template
// @namespace    lampa.clean.online.aukro1408
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    // Test online source template without site parsing or real video links.
    if (window.aukro1408_template_plugin) return;
    window.aukro1408_template_plugin = true;

    var SOURCE_NAME = 'aukro1408';

    function registerSource() {
        if (!window.Lampa) return;

        if (!Lampa.Component) return;

        Lampa.Component.add(SOURCE_NAME, function (object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true });
            var html = $('<div class="online-prestige"></div>');

            var empty = $(
                '<div class="online-empty">' +
                    '<div class="online-empty__title">' + SOURCE_NAME + '</div>' +
                    '<div class="online-empty__descr">Test source is connected. No real video links are included.</div>' +
                '</div>'
            );

            html.append(empty);
            scroll.append(html);

            this.create = function () {
                return scroll.render();
            };

            this.start = function () {
                Lampa.Controller.add(SOURCE_NAME, {
                    toggle: function () {
                        Lampa.Controller.collectionSet(scroll.render());
                        Lampa.Controller.collectionFocus(false, scroll.render());
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    }
                });

                Lampa.Controller.toggle(SOURCE_NAME);
            };

            this.pause = function () {};
            this.stop = function () {};
            this.destroy = function () {
                scroll.destroy();
                html.remove();
            };
        });

        console.log('Lampa aukro1408 template loaded');
    }

    function addOnlineButton() {
        if (!window.Lampa) return;

        var menu = $('.menu .menu__list').eq(0);
        if (!menu.length) return;
        if ($('.aukro1408-template').length) return;

        var item = $('<li class="menu__item selector aukro1408-template"></li>');

        item.html(
            '<div class="menu__ico">A</div>' +
            '<div class="menu__text">' + SOURCE_NAME + '</div>'
        );

        item.on('hover:enter', function () {
            Lampa.Activity.push({
                component: SOURCE_NAME,
                title: SOURCE_NAME
            });
        });

        menu.prepend(item);
    }

    function startPlugin() {
        registerSource();
        addOnlineButton();
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

    Lampa.Listener.follow('activity', function () {
        setTimeout(addOnlineButton, 500);
    });

})();
