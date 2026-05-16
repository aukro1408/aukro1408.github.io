// ==UserScript==
// @name         Lampa Reload Cat
// @namespace    lampa.reload.cat
// @version      1.3
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.lampa_reload_cat_plugin) return;
    window.lampa_reload_cat_plugin = true;

    var BUTTON_CLASS = 'reload-cat-button';
    var BUTTON_STYLE_ID = 'reload-cat-button-style';
    var timer = null;

    function reloadLampa() {
        window.location.reload();
    }

    function createButton() {
        if (!$('#' + BUTTON_STYLE_ID).length) {
            $('head').append(
            '<style id="' + BUTTON_STYLE_ID + '">' +
                '.reload-cat-button{' +
                    'width:2.6em;' +
                    'height:2.6em;' +
                    'display:flex;' +
                    'align-items:center;' +
                    'justify-content:center;' +
                    'font-size:1.25em;' +
                    'line-height:1;' +
                    'border-radius:50%;' +
                    'background:rgba(0,0,0,0.22);' +
                    'cursor:pointer;' +
                    'margin-left:0.5em;' +
                    'flex-shrink:0;' +
                '}' +
                '.reload-cat-button.focus,' +
                '.reload-cat-button.selector:focus{' +
                    'background:rgba(255,255,255,0.24)!important;' +
                    'transform:scale(1.08);' +
                '}' +
                '</style>'
            );
        }

        var button = $('<div class="selector ' + BUTTON_CLASS + '" title="Reload Lampa">🐱</div>');

        button.on('hover:enter click', reloadLampa);

        return button;
    }

    function addButton() {
        if (!window.$) return;
        if ($('.' + BUTTON_CLASS).length) return;

        var wrap = $('.bell__wrap').eq(0);
        if (!wrap.length) return;

        var button = createButton();
        var search = wrap.find('.open--search, .search, [class*="search"]').eq(0);

        if (search.length) {
            search.after(button);
        } else {
            wrap.prepend(button);
        }
    }

    function startPlugin() {
        addButton();

        if (window.Lampa && Lampa.Listener && !window.lampa_reload_cat_listener) {
            window.lampa_reload_cat_listener = true;

            Lampa.Listener.follow('activity', function () {
                setTimeout(addButton, 500);
            });
        }
    }

    timer = setInterval(function () {
        startPlugin();

        if ($('.' + BUTTON_CLASS).length) {
            clearInterval(timer);
        }
    }, 500);

    setTimeout(function () {
        if (timer) clearInterval(timer);
    }, 30000);

})();
