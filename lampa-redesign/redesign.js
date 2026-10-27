/* Lampa light theme bootstrap.
 * This script only applies theme classes to the existing body element.
 * It does not create, move, or remove DOM nodes.
 */
(function () {
    'use strict';

    function applyTheme() {
        if (!document.body) return;

        document.body.classList.add('redesign', 'light--version');
        document.body.style.background = '';
    }

    applyTheme();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTheme, { once: true });
    }

    try {
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (event) {
                if (event && event.type === 'ready') applyTheme();
            });
        }
    } catch (error) {
        /* Theme CSS remains safe if an older Lampa build has no Listener API. */
    }
})();
