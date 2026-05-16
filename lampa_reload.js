// ==UserScript==
// @name         Lampa Reload Cat
// @namespace    lampa.reload.cat
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.lampa_reload_cat_plugin) return;
    window.lampa_reload_cat_plugin = true;

    var BUTTON_ID = 'reload-cat-button';
    var STYLE_ID = 'reload-cat-button-style';
    var observer = null;

    function reloadLampa() {
        window.location.reload();
    }

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
                '#' + BUTTON_ID + '{' +
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
                '#' + BUTTON_ID + '.focus,' +
                '#' + BUTTON_ID + '.selector:focus{' +
                    'background:rgba(255,255,255,0.24)!important;' +
                    'transform:scale(1.08);' +
                '}';

        document.head.appendChild(style);
    }

    function createButton() {
        addStyle();

        var button = document.createElement('div');
        button.id = BUTTON_ID;
        button.className = 'selector';
        button.title = 'Reload Lampa';
        button.textContent = '🐱';
        button.addEventListener('click', reloadLampa);
        button.addEventListener('hover:enter', reloadLampa);

        return button;
    }

    function addButton() {
        var wrap = document.querySelector('.bell__wrap');
        if (!wrap) return false;

        if (document.getElementById(BUTTON_ID)) return true;
        var button = createButton();
        var first = wrap.children[0];

        if (first) {
            first.insertAdjacentElement('afterend', button);
        } else {
            wrap.appendChild(button);
        }

        return true;
    }

    function startPlugin() {
        addButton();

        if (observer) return;

        observer = new MutationObserver(function () {
            addButton();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPlugin);
    } else {
        startPlugin();
    }

})();
