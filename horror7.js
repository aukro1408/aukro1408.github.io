// ==UserScript==
// @name         Lampa Horror Menu PRO (3 кнопки)
// @namespace    lampa.horror.pro
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function addButtons() {
    const menu = document.querySelector('.menu__list, .menu__scroll');
    if (!menu || !window.Lampa) return;

    // чтобы не дублировались
    if (document.querySelector('.hren-popular')) return;

    function createItem(text, className, url) {
      const item = document.createElement('div');
      item.className = 'menu__item ' + className;
      item.style.cursor = 'pointer';

      item.innerHTML = `
        <div class="menu__ico">🎬</div>
        <div class="menu__text">${text}</div>
      `;

      item.onclick = () => {
        Lampa.Activity.push({
          component: 'category_full',
          source: 'tmdb',
          title: text,
          url: url,
          page: Math.floor(Math.random() * 5) + 1
        });
      };

      return item;
    }

    // 🔥 создаём кнопки
    const popular = createItem(
      'Ужасы 😱',
      'hren-popular',
      'discover/movie?with_genres=27&sort_by=popularity.desc'
    );

    const top = createItem(
      'ТОП ужасы ⭐',
      'hren-top',
      'discover/movie?with_genres=27&vote_average.gte=7&sort_by=vote_average.desc'
    );

    const neww = createItem(
      'Новые ужасы 🆕',
      'hren-new',
      'discover/movie?with_genres=27&primary_release_date.gte=2023-01-01&sort_by=primary_release_date.desc'
    );

    // вставляем в начало
    menu.prepend(neww);
    menu.prepend(top);
    menu.prepend(popular);

    console.log('✔ Horror PRO меню добавлено');
  }

  // стабильно при перерисовке UI
  setInterval(addButtons, 1500);

})();
