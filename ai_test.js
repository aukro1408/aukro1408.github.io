// ==UserScript==
// @name         Lampa AI Debug
// @namespace    lampa.ai.debug
// @version      0.4
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    // защита от повторного запуска
    if (window.lampa_ai_debug) return;
    window.lampa_ai_debug = true;

    function createButton() {

        const menu = $('.menu .menu__list').eq(0);

        if (!menu.length) return;
        if ($('.ai-debug-btn').length) return;

        // кнопка меню
        const item = $(`
            <li class="menu__item selector ai-debug-btn">
                <div class="menu__ico">🧠</div>
                <div class="menu__text">AI Debug</div>
            </li>
        `);

        // нажатие
        item.on('hover:enter', function () {

            try {

                const activity = Lampa.Storage.get('activity');
                const history = Lampa.Storage.get('history');
                const favorite = Lampa.Storage.get('favorite');
                const cont = Lampa.Storage.get('continue');

                let text = '';

                text += 'activity: ';
                text += activity
                    ? JSON.stringify(activity).length
                    : 0;

                text += ' | history: ';
                text += history
                    ? JSON.stringify(history).length
                    : 0;

                text += ' | favorite: ';
                text += favorite
                    ? JSON.stringify(favorite).length
                    : 0;

                text += ' | continue: ';
                text += cont
                    ? JSON.stringify(cont).length
                    : 0;

                // уведомление в Lampa
                Lampa.Noty.show(text);

                // лог в консоль
                console.log('=== AI DEBUG ===');
                console.log('activity:', activity);
                console.log('history:', history);
                console.log('favorite:', favorite);
                console.log('continue:', cont);

            } catch (e) {

                Lampa.Noty.show('ERROR: ' + e.message);

                console.log(e);

            }

        });

        // добавляем кнопку
        menu.prepend(item);

        console.log('✔ Lampa AI Debug loaded');
    }

    function init() {
        createButton();
    }

    // ожидание загрузки
    if (window.appready) {

        init();

    } else {

        Lampa.Listener.follow('app', function (e) {

            if (e.type === 'ready') {
                init();
            }

        });

    }

    // если меню перерисуется
    Lampa.Listener.follow('activity', function () {
        setTimeout(createButton, 500);
    });

})();
