// ==UserScript==
// @name         Lampa AI Debug
// @namespace    lampa.ai.debug
// @version      0.3
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.lampa_ai_debug) return;
    window.lampa_ai_debug = true;

    function createButton() {

        const menu = $('.menu .menu__list').eq(0);

        if (!menu.length) return;
        if ($('.ai-debug-btn').length) return;

        const item = $(`
            <li class="menu__item selector ai-debug-btn">
                <div class="menu__ico">🧠</div>
                <div class="menu__text">AI Debug</div>
            </li>
        `);

        item.on('hover:enter', function () {

            try {

                const activity = Lampa.Storage.get('activity') || [];
                const history = Lampa.Storage.get('history') || [];
                const favorite = Lampa.Storage.get('favorite') || [];
                const cont = Lampa.Storage.get('continue') || [];

                let msg = '';

                msg += 'activity: ' + activity.length + '\n';
                msg += 'history: ' + history.length + '\n';
                msg += 'favorite: ' + favorite.length + '\n';
                msg += 'continue: ' + cont.length + '\n\n';

                // пробуем показать первый элемент activity
                if (activity.length > 0) {
                    msg += 'FIRST ACTIVITY:\n';
                    msg += JSON.stringify(activity[0], null, 2);
                }

                alert(msg);

            } catch (e) {

                alert('ERROR:\n' + e.message);

            }

        });

        menu.prepend(item);

        console.log('✔ AI Debug loaded');
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
