/* ============================================================
   LAMPA GLASS v4 — только цветовая схема, без перестроек DOM.
   Этот скрипт лишь включает классы темы на body; вся работа —
   в redesign.css (или во встроенном CSS плагина).
   ============================================================ */
(function () {
    'use strict';

    function apply() {
        document.body.classList.add('redesign');
        document.body.classList.add('light--version');
        document.body.style.background = '';
    }

    apply();

    try {
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') apply();
            });
        }
    } catch (e) {}
})();
