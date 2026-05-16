// ==UserScript==
// @name         Lampa Activity Debug
// @namespace    lampa.activity.debug
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.activity_debug_plugin) return;
    window.activity_debug_plugin = true;

    function createButton() {

        const menu = $('.menu .menu__list').eq(0);

        if (!menu.length) return;
        if ($('.activity-debug-btn').length) return;

        const item = $(`
            <li class="menu__item selector activity-debug-btn">
                <div class="menu__ico">🐞</div>
                <div class="menu__text">Activity Debug</div>
            </li>
        `);

        item.on('hover:enter', function () {

            try {

                const activity =
                    Lampa.Storage.get('activity') || [];

                if (!activity.length) {

                    Lampa.Noty.show(
                        'Activity пустой'
                    );

                    return;
                }

                const first = activity[0];

                console.log(first);

                let keys =
                    Object.keys(first).join(', ');

                Lampa.Noty.show(
                    'FIELDS: ' + keys
                );

            } catch (e) {

                console.log(e);

                Lampa.Noty.show(
                    'ERROR: ' + e.message
                );

            }

        });

        menu.prepend(item);
    }

    function init() {
        createButton();
    }

    if (window.appready) {

        init();

    } else {

        Lampa.Listener.follow('app', function (e) {

            if (e.type === 'ready') {
                init();
            }

        });

    }

    Lampa.Listener.follow('activity', function () {
        setTimeout(createButton, 500);
    });

})();
