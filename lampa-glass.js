(function () {
    'use strict';

    // ============================================================
    // LAMPA GLASS — светлая цветовая схема для Lampa
    // Утверждена Denis 2026-10-27. Версия 4 (colors-only).
    // Установка: Настройки → Расширения → добавить по URL.
    // Вёрстка Lampa не меняется: только цвет (светлый фон, тёмный текст,
    // оранжевый акцент, полупрозрачное стекло). Удаление плагина = откат.
    // ============================================================

    var STYLE_ID = 'lampa-glass-style';

    // CSS темы поверх app.css (style в head идёт после link app.css)
    (function injectCss() {
        var old = document.getElementById(STYLE_ID);
        if (old) old.remove();
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = "/* ============================================================\n   LAMPA GLASS v4 — ТОЛЬКО ЦВЕТОВАЯ СХЕМА (решение Denis 2026-10-27)\n   Вёрстка Lampa НЕ меняется: боковое меню, ряды, карточки, настройки —\n   всё на штатных местах и штатных размеров. Меняется только цвет:\n   светлый голубовато-серый фон, тёмный текст, оранжевый акцент,\n   полупрозрачное стекло на панелях. Никаких перестроек DOM.\n   ============================================================ */\n\n/* ---------- База ---------- */\nbody.redesign {\n    background: #c9d3e0 !important;\n    background: linear-gradient(180deg, #c9d3e0 0%, #dde4ec 45%, #eef1f5 100%) !important;\n    color: #14161a;\n}\nbody.redesign .background,\nbody.redesign .background__one,\nbody.redesign .background__two,\nbody.redesign .background__fade {\n    opacity: 0 !important;\n}\nbody.redesign .activity__body,\nbody.redesign .activity {\n    background: transparent !important;\n}\n\n/* ---------- Шапка: тёмный текст и иконки ---------- */\nbody.redesign .head__time,\nbody.redesign .head__time-now,\nbody.redesign .head__time-date,\nbody.redesign .head__time-week {\n    color: #14161a;\n}\nbody.redesign .head__action [stroke] {\n    stroke: #14161a;\n}\nbody.redesign .head__action path[fill],\nbody.redesign .head__action rect[fill],\nbody.redesign .head__action circle[fill] {\n    fill: #14161a;\n}\n\n/* ---------- Боковое меню: тёмный текст, тёмные иконки, чёрный фокус ---------- */\nbody.redesign .menu__item {\n    color: #14161a;\n}\nbody.redesign .menu__item .menu__ico [stroke] {\n    stroke: #14161a;\n}\nbody.redesign .menu__item .menu__ico path[fill],\nbody.redesign .menu__item .menu__ico rect[fill],\nbody.redesign .menu__item .menu__ico circle[fill] {\n    fill: #14161a;\n}\nbody.redesign .menu__item.focus,\nbody.redesign .menu__item.traverse,\nbody.redesign .menu__item.hover {\n    background-color: #101114;\n    color: #fff;\n}\nbody.redesign .menu__item.focus .menu__ico [stroke] {\n    stroke: #fff;\n}\nbody.redesign .menu__item.focus .menu__ico path[fill],\nbody.redesign .menu__item.focus .menu__ico rect[fill],\nbody.redesign .menu__item.focus .menu__ico circle[fill] {\n    fill: #fff;\n}\nbody.redesign .menu__split {\n    border-color: rgba(20, 22, 26, 0.12);\n}\n\n/* ---------- Нижняя панель навигации (мобильная) ---------- */\nbody.redesign .navigation-bar {\n    background: rgba(255, 255, 255, 0.7) !important;\n}\nbody.redesign .navigation-bar__label {\n    color: #14161a;\n}\nbody.redesign .navigation-bar__icon [stroke] {\n    stroke: #14161a;\n}\nbody.redesign .navigation-bar__icon path[fill],\nbody.redesign .navigation-bar__icon rect[fill],\nbody.redesign .navigation-bar__icon circle[fill] {\n    fill: #14161a;\n}\n\n/* ---------- Ряды и карточки ---------- */\nbody.redesign .items-line__title {\n    color: #14161a;\n}\nbody.redesign .items-line__more {\n    background: rgba(255, 255, 255, 0.7);\n    color: #14161a;\n}\nbody.redesign .items-line__more.focus {\n    background: #101114;\n    color: #fff;\n}\nbody.redesign .card__title {\n    color: #14161a;\n}\nbody.redesign .card__vote {\n    color: #ff6a1a;\n}\nbody.redesign .card__view {\n    -webkit-box-shadow: 0 0.4em 1.2em rgba(20, 30, 50, 0.15);\n    -moz-box-shadow: 0 0.4em 1.2em rgba(20, 30, 50, 0.15);\n    box-shadow: 0 0.4em 1.2em rgba(20, 30, 50, 0.15);\n}\nbody.redesign .card.focus .card__view {\n    -webkit-box-shadow: 0 0 0 0.2em #101114, 0 0.8em 2em rgba(20, 30, 50, 0.3);\n    -moz-box-shadow: 0 0 0 0.2em #101114, 0 0.8em 2em rgba(20, 30, 50, 0.3);\n    box-shadow: 0 0 0 0.2em #101114, 0 0.8em 2em rgba(20, 30, 50, 0.3);\n}\n\n/* ---------- Карточка фильма ---------- */\nbody.redesign .full-start-new__title {\n    color: #14161a;\n}\nbody.redesign .full-start__rate {\n    color: #ff6a1a;\n}\nbody.redesign .full-start__button.button--play {\n    background: #101114;\n    color: #fff;\n}\n\n/* ---------- Настройки: полупрозрачное стекло ---------- */\nbody.redesign .settings__content {\n    background: rgba(255, 255, 255, 0.85) !important;\n    -webkit-backdrop-filter: blur(20px);\n    backdrop-filter: blur(20px);\n}\nbody.redesign .settings__title {\n    color: #14161a;\n}\nbody.redesign .settings-folder__name,\nbody.redesign .settings-param__name {\n    color: #14161a;\n}\nbody.redesign .settings-param__value,\nbody.redesign .settings-param__descr {\n    color: #5a6472;\n}\nbody.redesign .settings-folder.focus,\nbody.redesign .settings-param.focus {\n    background-color: #101114;\n}\nbody.redesign .settings-folder.focus .settings-folder__name,\nbody.redesign .settings-param.focus .settings-param__name,\nbody.redesign .settings-param.focus .settings-param__value {\n    color: #fff;\n}\nbody.redesign .settings-folder__icon [stroke] {\n    stroke: #14161a;\n}\nbody.redesign .settings-folder__icon path[fill],\nbody.redesign .settings-folder__icon rect[fill],\nbody.redesign .settings-folder__icon circle[fill] {\n    fill: #14161a;\n}\nbody.redesign .settings-folder.focus .settings-folder__icon [stroke] {\n    stroke: #fff;\n}\nbody.redesign .settings-folder.focus .settings-folder__icon path[fill],\nbody.redesign .settings-folder.focus .settings-folder__icon rect[fill],\nbody.redesign .settings-folder.focus .settings-folder__icon circle[fill] {\n    fill: #fff;\n}\n";
        document.head.appendChild(style);
    })();

    // Логика перестройки DOM: пилюля-навигация, hero, категории
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

})();
