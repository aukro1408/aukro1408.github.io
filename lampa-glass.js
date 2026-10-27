(function () {
    'use strict';

    // ============================================================
    // LAMPA GLASS — светлая frosted-glass тема для Lampa
    // Утверждена Denis 2026-10-27. Версия 2.
    // Установка: Настройки → Расширения → добавить по URL.
    // Оригинальные файлы Lampa не меняются: тема — отдельный слой
    // (CSS поверх app.css + перестройка DOM). Удаление плагина = откат.
    // ============================================================

    var STYLE_ID = 'lampa-glass-style';

    // Шрифт Onest (как в утверждённом макете)
    (function injectFont() {
        if (document.querySelector('link[data-lampa-glass-font]')) return;
        var link = document.createElement('link');
        link.setAttribute('data-lampa-glass-font', '1');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Onest:wght@400;600;700;800&display=swap';
        document.head.appendChild(link);
    })();

    // CSS темы поверх app.css (style в head идёт после link app.css)
    (function injectCss() {
        var old = document.getElementById(STYLE_ID);
        if (old) old.remove();
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = "/* ============================================================\n   LAMPA REDESIGN — светлая frosted-glass тема (утверждена 2026-10-27)\n   Подключается ПОСЛЕ css/app.css. Оригинальные app.min.js и app.css\n   не меняются: весь редизайн — этот файл + redesign.js.\n   Откат: убрать две строки из index.html.\n   Единицы — em (Lampa масштабирует шрифт под высоту экрана ТВ).\n   ============================================================ */\n\n/* ---------- База ---------- */\nbody.redesign {\n    background: #c9d3e0 !important;\n    background: linear-gradient(180deg, #c9d3e0 0%, #dde4ec 45%, #eef1f5 100%) !important;\n    color: #14161a;\n    font-family: 'Onest', 'Inter', system-ui, sans-serif;\n}\nbody.redesign .background,\nbody.redesign .background__one,\nbody.redesign .background__two,\nbody.redesign .background__fade {\n    opacity: 0 !important;\n}\nbody.redesign .activity__body,\nbody.redesign .activity {\n    background: transparent !important;\n}\n\n/* ---------- Контент на всю ширину (колонка меню уезжает в пилюлю сверху) ---------- */\nbody.redesign .wrap__content {\n    padding-top: 0 !important;\n    width: 100% !important;\n    -webkit-transform: none !important;\n    -moz-transform: none !important;\n    transform: none !important;\n}\nbody.redesign.menu--open .wrap__content,\nbody.redesign.menu--always .wrap__content,\nbody.redesign.menu--always.menu--open .wrap__content {\n    -webkit-transform: none !important;\n    -moz-transform: none !important;\n    transform: none !important;\n}\n\n/* ---------- Пилюля-навигация сверху (v2: чистый CSS, без переезда DOM) ----------\n   Родная колонка меню .wrap__left становится фиксированной чёрной пилюлей\n   по центру сверху. Пункты остаются в своём контейнере — клики и фокус\n   Lampa продолжают работать. Слева остаётся логотип/часы из .head,\n   справа — кнопки действий: как в референсе Flix.id. */\nbody.redesign .wrap__left {\n    display: block !important;\n    visibility: visible !important;\n    position: fixed !important;\n    top: 0.7em !important;\n    left: 50% !important;\n    width: auto !important;\n    max-width: 92vw !important;\n    margin-left: 0 !important;\n    padding-top: 0 !important;\n    -webkit-transform: translateX(-50%) !important;\n    -moz-transform: translateX(-50%) !important;\n    transform: translateX(-50%) !important;\n    z-index: 100 !important;\n    background: #101114 !important;\n    -webkit-border-radius: 999px !important;\n    -moz-border-radius: 999px !important;\n    border-radius: 999px !important;\n    -webkit-box-shadow: 0 0.6em 1.8em rgba(16, 17, 20, 0.35) !important;\n    -moz-box-shadow: 0 0.6em 1.8em rgba(16, 17, 20, 0.35) !important;\n    box-shadow: 0 0.6em 1.8em rgba(16, 17, 20, 0.35) !important;\n    overflow-x: auto !important;\n    scrollbar-width: none !important;\n    -webkit-flex-shrink: 0 !important;\n    -ms-flex-negative: 0 !important;\n    flex-shrink: 0 !important;\n}\nbody.redesign .wrap__left::-webkit-scrollbar {\n    display: none !important;\n}\nbody.redesign .wrap__left .scroll,\nbody.redesign .wrap__left .scroll__content {\n    overflow: visible !important;\n    height: auto !important;\n    padding: 0 !important;\n}\nbody.redesign .wrap__left .scroll--mask {\n    -webkit-mask-image: none !important;\n    mask-image: none !important;\n}\nbody.redesign .wrap__left .menu {\n    width: auto !important;\n}\nbody.redesign .wrap__left .menu__list {\n    display: -webkit-box !important;\n    display: -webkit-flex !important;\n    display: -moz-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n    margin: 0 !important;\n    padding: 0.35em 0.5em !important;\n    -webkit-flex-wrap: nowrap !important;\n    -ms-flex-wrap: nowrap !important;\n    flex-wrap: nowrap !important;\n}\nbody.redesign .wrap__left .menu__item {\n    color: rgba(255, 255, 255, 0.75) !important;\n    padding: 0.55em 1.1em !important;\n    -webkit-border-radius: 999px !important;\n    -moz-border-radius: 999px !important;\n    border-radius: 999px !important;\n    margin: 0 !important;\n    -webkit-flex-shrink: 0 !important;\n    -ms-flex-negative: 0 !important;\n    flex-shrink: 0 !important;\n}\nbody.redesign .wrap__left .menu__item .menu__ico {\n    display: none !important;\n}\nbody.redesign .wrap__left .menu__item .menu__text {\n    font-size: 0.95em !important;\n    font-weight: 600 !important;\n    white-space: nowrap !important;\n}\nbody.redesign .wrap__left .menu__item.focus,\nbody.redesign .wrap__left .menu__item.traverse,\nbody.redesign .wrap__left .menu__item.hover {\n    background: #fff !important;\n    color: #101114 !important;\n}\nbody.redesign .wrap__left .menu__item.focus .menu__text {\n    color: #101114 !important;\n}\nbody.redesign .wrap__left .menu__split {\n    display: none !important;\n}\n\n/* Отступ контента под фиксированную пилюлю */\nbody.redesign .activity__body {\n    padding-top: 5.2em !important;\n}\n\n/* ---------- Hero-баннеры ---------- */\n#rd-hero {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: flex;\n    gap: 1.2em;\n    padding: 0 1.5em 1.6em;\n}\n.rd-hero-card {\n    position: relative;\n    -webkit-box-flex: 1;\n    -webkit-flex: 1;\n    -moz-box-flex: 1;\n    -ms-flex: 1;\n    flex: 1;\n    height: 11em;\n    -webkit-border-radius: 1.4em;\n    -moz-border-radius: 1.4em;\n    border-radius: 1.4em;\n    overflow: hidden;\n    cursor: pointer;\n    -webkit-box-shadow: 0 0.8em 2em rgba(20, 30, 50, 0.25);\n    -moz-box-shadow: 0 0.8em 2em rgba(20, 30, 50, 0.25);\n    box-shadow: 0 0.8em 2em rgba(20, 30, 50, 0.25);\n}\n.rd-hero-card img {\n    width: 100%;\n    height: 100%;\n    object-fit: cover;\n    object-position: center 20%;\n    display: block;\n}\n.rd-hero-card::after {\n    content: '';\n    position: absolute;\n    left: 0; right: 0; bottom: 0;\n    height: 70%;\n    background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%);\n    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%);\n}\n.rd-hero-card__info {\n    position: absolute;\n    left: 1.4em;\n    right: 1.4em;\n    bottom: 1.2em;\n    z-index: 2;\n    color: #fff;\n}\n.rd-hero-card__title {\n    font-size: 1.5em;\n    font-weight: 800;\n    line-height: 1.15;\n    margin-bottom: 0.25em;\n}\n.rd-hero-card__meta {\n    font-size: 0.95em;\n    color: rgba(255, 255, 255, 0.85);\n}\n.rd-hero-card__meta b {\n    color: #ff8a3c;\n}\n.rd-hero-card__play {\n    display: inline-block;\n    margin-top: 0.7em;\n    background: #fff;\n    color: #101114;\n    font-weight: 700;\n    font-size: 0.9em;\n    padding: 0.45em 1.2em;\n    -webkit-border-radius: 999px;\n    -moz-border-radius: 999px;\n    border-radius: 999px;\n}\n\n/* ---------- Пилюли-категории (быстрый переход к рядам) ---------- */\n#rd-cats {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: flex;\n    gap: 0.6em;\n    padding: 0 1.5em 1.4em;\n    -webkit-flex-wrap: wrap;\n    -ms-flex-wrap: wrap;\n    flex-wrap: wrap;\n}\n.rd-cat {\n    background: rgba(255, 255, 255, 0.65);\n    border: 1px solid rgba(255, 255, 255, 0.8);\n    color: #14161a;\n    font-weight: 600;\n    font-size: 0.95em;\n    padding: 0.55em 1.2em;\n    -webkit-border-radius: 999px;\n    -moz-border-radius: 999px;\n    border-radius: 999px;\n    cursor: pointer;\n    -webkit-box-shadow: 0 0.3em 0.9em rgba(20, 30, 50, 0.08);\n    -moz-box-shadow: 0 0.3em 0.9em rgba(20, 30, 50, 0.08);\n    box-shadow: 0 0.3em 0.9em rgba(20, 30, 50, 0.08);\n}\n.rd-cat.focus, .rd-cat:hover {\n    background: #101114;\n    color: #fff;\n}\n\n/* ---------- Ряды и карточки ---------- */\nbody.redesign .items-line {\n    padding-bottom: 2.2em;\n}\nbody.redesign .items-line__head {\n    padding: 0 1.5em;\n    margin-bottom: 1em;\n}\nbody.redesign .items-line__title {\n    color: #14161a;\n    font-weight: 700;\n}\nbody.redesign .items-line__more {\n    background: rgba(255, 255, 255, 0.7);\n    color: #14161a;\n}\nbody.redesign .items-line__more.focus {\n    background: #101114;\n    color: #fff;\n}\nbody.redesign .card__view {\n    -webkit-border-radius: 1em;\n    -moz-border-radius: 1em;\n    border-radius: 1em;\n    overflow: hidden;\n    -webkit-box-shadow: 0 0.4em 1.2em rgba(20, 30, 50, 0.15);\n    -moz-box-shadow: 0 0.4em 1.2em rgba(20, 30, 50, 0.15);\n    box-shadow: 0 0.4em 1.2em rgba(20, 30, 50, 0.15);\n}\nbody.redesign .card__title {\n    color: #14161a;\n}\nbody.redesign .card__vote {\n    color: #ff6a1a;\n}\nbody.redesign .card.focus .card__view,\nbody.redesign .card.focus {\n    -webkit-box-shadow: 0 0 0 0.2em #101114, 0 0.8em 2em rgba(20, 30, 50, 0.3);\n    -moz-box-shadow: 0 0 0 0.2em #101114, 0 0.8em 2em rgba(20, 30, 50, 0.3);\n    box-shadow: 0 0 0 0.2em #101114, 0 0.8em 2em rgba(20, 30, 50, 0.3);\n}\n\n/* ---------- Карточка фильма (экран full) ---------- */\nbody.redesign .full-start-new {\n    color: #14161a;\n}\nbody.redesign .full-start-new__title {\n    color: #14161a;\n}\nbody.redesign .full-start__button {\n    -webkit-border-radius: 999px;\n    -moz-border-radius: 999px;\n    border-radius: 999px;\n}\nbody.redesign .full-start__button.button--play {\n    background: #101114;\n    color: #fff;\n}\nbody.redesign .full-start__rate {\n    color: #ff6a1a;\n}\n\n/* ---------- Настройки: светлая шторка, белые карточки ---------- */\nbody.redesign .settings__content {\n    background: rgba(255, 255, 255, 0.88) !important;\n    -webkit-backdrop-filter: blur(20px);\n    backdrop-filter: blur(20px);\n    -webkit-border-radius: 1em;\n    -moz-border-radius: 1em;\n    border-radius: 1em;\n}\nbody.redesign .settings__head {\n    color: #14161a;\n}\nbody.redesign .settings__title {\n    color: #14161a !important;\n}\nbody.redesign .settings-folder {\n    background: rgba(255, 255, 255, 0.65);\n    border: 1px solid rgba(255, 255, 255, 0.8);\n    -webkit-border-radius: 1em;\n    -moz-border-radius: 1em;\n    border-radius: 1em;\n    margin: 0 1em 0.5em;\n}\nbody.redesign .settings-folder__name {\n    color: #14161a !important;\n}\n/* Иконки папок — в тёмном кружке, чтобы светлые и цветные значки читались */\nbody.redesign .settings-folder__icon {\n    background: #101114;\n    -webkit-border-radius: 100%;\n    -moz-border-radius: 100%;\n    border-radius: 100%;\n    width: 2.8em !important;\n    height: 2.8em !important;\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n    -moz-box-align: center;\n    -ms-flex-align: center;\n    align-items: center;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n    -moz-box-pack: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n}\nbody.redesign .settings-folder__icon > * {\n    width: 1.6em !important;\n    height: 1.6em !important;\n}\nbody.redesign .settings-folder.focus {\n    background: #101114 !important;\n}\nbody.redesign .settings-folder.focus .settings-folder__name {\n    color: #fff !important;\n}\nbody.redesign .settings-param__value,\nbody.redesign .settings-param__descr {\n    color: #5a6472 !important;\n}\nbody.redesign .settings-param {\n    background: rgba(255, 255, 255, 0.65);\n    border: 1px solid rgba(255, 255, 255, 0.8);\n    margin-bottom: 0.5em;\n}\nbody.redesign .settings-param__name {\n    color: #14161a;\n}\nbody.redesign .settings-param.focus {\n    background: #101114;\n}\nbody.redesign .settings-param.focus .settings-param__name,\nbody.redesign .settings-param.focus .settings-param__value {\n    color: #fff;\n}\n";
        document.head.appendChild(style);
    })();

    // Логика перестройки DOM: пилюля-навигация, hero, категории
    /* ============================================================
   LAMPA REDESIGN — перестройка DOM (утверждена 2026-10-27)
   Логику Lampa НЕ трогает: только перемещает существующие узлы
   и строит витрину (пилюля-навигация, hero, категории) из DOM рядов.
   Оригинальные app.min.js и app.css не меняются.
   ============================================================ */
(function () {
    'use strict';

    var REBUILT = false;
    var rebuildTimer = null;

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function applyClasses() {
        document.body.classList.add('redesign');
        document.body.classList.add('light--version');
        document.body.style.background = '';
    }

    /* ---------- Пилюля-навигация: v2 — НЕ трогаем DOM меню вообще.
       Пункты остаются в своём контейнере (иначе Lampa теряет клики),
       а в пилюлю сверху колонка превращается чистым CSS (см. redesign.css).
       Здесь только классы на body. ---------- */

    /* ---------- Hero: первые 2 карточки первого ряда ---------- */
    function buildHero() {
        if ($('#rd-hero')) return;
        var lines = $$('.items-line');
        if (!lines.length) return;
        var cards = $$('.card', lines[0]);
        if (cards.length < 2) return;

        var hero = document.createElement('div');
        hero.id = 'rd-hero';

        cards.slice(0, 2).forEach(function (card) {
            var img = $('.card__img', card);
            var title = $('.card__title', card);
            var vote = $('.card__vote', card);
            var src = img ? (img.getAttribute('src') || img.dataset.src || '') : '';
            if (!src) return;

            var b = document.createElement('div');
            b.className = 'rd-hero-card selector';
            b.innerHTML =
                '<img src="' + src + '" alt="">' +
                '<div class="rd-hero-card__info">' +
                    '<div class="rd-hero-card__title">' + (title ? title.textContent : '') + '</div>' +
                    '<div class="rd-hero-card__meta">' + (vote ? '<b>★ ' + vote.textContent.trim() + '</b>' : '') + '</div>' +
                    '<span class="rd-hero-card__play">▶ Смотреть</span>' +
                '</div>';
            b.addEventListener('click', function () { card.click(); });
            hero.appendChild(b);
        });

        if (!hero.children.length) return;
        lines[0].parentNode.insertBefore(hero, lines[0]);
    }

    /* ---------- Пилюли-категории: быстрый переход к рядам ---------- */
    function buildCats() {
        if ($('#rd-cats')) return;
        var lines = $$('.items-line');
        if (!lines.length) return;

        var cats = document.createElement('div');
        cats.id = 'rd-cats';
        lines.forEach(function (line) {
            var t = $('.items-line__title', line);
            var name = t ? t.textContent.trim() : '';
            if (!name) return;
            var p = document.createElement('div');
            p.className = 'rd-cat';
            p.textContent = name;
            p.addEventListener('click', function () {
                line.scrollIntoView({ block: 'start', behavior: 'smooth' });
            });
            cats.appendChild(p);
        });

        if (!cats.children.length) return;
        var hero = $('#rd-hero');
        if (hero && hero.parentNode) hero.parentNode.insertBefore(cats, hero.nextSibling);
        else lines[0].parentNode.insertBefore(cats, lines[0]);
    }

    function buildAll() {
        applyClasses();
        buildHero();
        buildCats();
    }

    /* Пересборка при перерисовках Lampa (возвраты, смена активности,
       догрузка постеров — поэтому следим и за атрибутами img[src]) */
    function scheduleRebuild() {
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(function () {
            var hero = $('#rd-hero');
            var cats = $('#rd-cats');
            /* hero и категории живут внутри активности: если активности
               больше нет на экране — убираем, при возврате пересоберём */
            var onMain = !!$('.items-line') && !$('.full-start-new');
            if (!onMain) {
                if (hero) hero.remove();
                if (cats) cats.remove();
                return;
            }
            if (!hero) buildHero();
            if (!cats) buildCats();
        }, 300);
    }

    function start() {
        buildAll();
        var app = $('#app');
        if (app && window.MutationObserver) {
            new MutationObserver(scheduleRebuild).observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
        }
    }

    /* Старт по готовности Lampa (штатный механизм плагинов) + фолбэки */
    var started = false;
    function tryStart() {
        if (started) return;
        if ($('.menu__list') || $('.items-line')) {
            started = true;
            start();
        }
    }

    try {
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') tryStart();
            });
        }
    } catch (e) {}

    var tries = 0;
    var poll = setInterval(function () {
        tryStart();
        if (started || ++tries > 40) clearInterval(poll);
    }, 300);
})();

})();
