// ==UserScript==
// @name         Lampa AI Test
// @namespace    lampa.ai.test
// @version      0.1
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.ai_test_plugin) return;
    window.ai_test_plugin = true;

    function createButton() {

        const menu = $('.menu .menu__list').eq(0);

        if (!menu.length) return;
        if ($('.ai-test').length) return;

        const item = $(`
            <li class="menu__item selector ai-test">
                <div class="menu__ico">🧠</div>
                <div class="menu__text">AI Test</div>
            </li>
        `);

        item.on('hover:enter', function () {

            console.log('=== STORAGE TEST ===');

            console.log('activity:',
                Lampa.Storage.get('activity'));

            console.log('mine_reactions:',
                Lampa.Storage.get('mine_reactions'));

            console.log('favorite:',
                Lampa.Storage.get('favorite'));

            console.log('history:',
                Lampa.Storage.get('history'));

            console.log('continue:',
                Lampa.Storage.get('continue'));

            Lampa.Noty.show('Смотри консоль');

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
            if (e.type === 'ready') init();
        });
    }

})();
