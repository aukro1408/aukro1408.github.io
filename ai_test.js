// ==UserScript==
// @name         Lampa AI Debug
// @namespace    lampa.ai.debug
// @version      0.2
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

        const item = $(`
            <li class="menu__item selector ai-debug-btn">
                <div class="menu__ico">🧠</div>
                <div class="menu__text">AI Debug</div>
            </li>
        `);

        item.on('hover:enter', function () {

            const data = {
                activity: Lampa.Storage.get('activity'),
                history: Lampa.Storage.get('history'),
                favorite: Lampa.Storage.get('favorite'),
                continue_watch: Lampa.Storage.get('continue')
            };

            let html = `
                <div style="
                    padding:20px;
                    max-height:70vh;
                    overflow:auto;
                    font-size:14px;
                ">
            `;

            for (const key in data) {

                html += `
                    <div style="
                        margin-bottom:25px;
                        background:#1a1a1a;
                        border-radius:12px;
                        padding:15px;
                    ">

                        <h3 style="
                            margin:0 0 10px 0;
                            color:#fff;
                            font-size:18px;
                        ">
                            ${key}
                        </h3>

                        <pre style="
                            white-space:pre-wrap;
                            word-break:break-word;
                            font-size:11px;
                            line-height:1.4;
                            color:#ccc;
                            background:#111;
                            padding:10px;
                            border-radius:10px;
                            overflow:auto;
                        ">${JSON.stringify(data[key], null, 2)}</pre>

                    </div>
                `;
            }

            html += '</div>';

            Lampa.Modal.open({
                title: 'AI Debug',
                html: html,
                size: 'large'
            });

        });

        // добавляем кнопку в меню
        menu.prepend(item);

        console.log('✔ Lampa AI Debug loaded');
    }

    function init() {
        createButton();
    }

    // ожидание загрузки Lampa
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
