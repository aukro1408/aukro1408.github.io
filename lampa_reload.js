// ==UserScript==
// @name         Lampa Reload Cat
// @namespace    lampa.reload.cat
// @version      3.0
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
                    'display:flex;' +
                    'align-items:center;' +
                    'justify-content:center;' +
                    'font-size:1.25em;' +
                    'line-height:1;' +
                    'cursor:pointer;' +
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
        button.className = 'head__action selector';
        button.title = 'Reload Lampa';
        button.textContent = '🐱';
        button.addEventListener('click', reloadLampa);
        button.addEventListener('hover:enter', reloadLampa);

        return button;
    }

    function addButton() {
        var actions = document.querySelector('.head__actions');
        if (!actions) return false;

        if (document.getElementById(BUTTON_ID)) return true;
        var button = createButton();
        var search = actions.querySelector('.open--search');

        if (search) {
            search.insertAdjacentElement('afterend', button);
        } else {
            actions.insertAdjacentElement('afterbegin', button);
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
