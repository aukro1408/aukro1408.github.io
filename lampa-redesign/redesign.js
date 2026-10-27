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

    /* ---------- Пилюля-навигация: ПЕРЕМЕЩАЕМ пункты меню (не клонируем),
       чтобы сохранились классы .selector, data-action и обработчики ---------- */
    function buildPillNav() {
        if ($('#rd-pillnav')) return;
        var list = $('.menu__list');
        if (!list) return;
        var items = $$('.menu__item', list);
        if (!items.length) return;

        var nav = document.createElement('div');
        nav.id = 'rd-pillnav';
        var ul = document.createElement('ul');
        ul.className = 'menu__list';
        items.forEach(function (li) { ul.appendChild(li); });
        nav.appendChild(ul);
        document.body.appendChild(nav);
    }

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
        buildPillNav();
        buildHero();
        buildCats();
    }

    /* Пересборка при перерисовках Lampa (возвраты, смена активности) */
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
            if (!$('#rd-pillnav')) buildPillNav();
        }, 300);
    }

    function start() {
        buildAll();
        var app = $('#app');
        if (app && window.MutationObserver) {
            new MutationObserver(scheduleRebuild).observe(app, { childList: true, subtree: true });
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
