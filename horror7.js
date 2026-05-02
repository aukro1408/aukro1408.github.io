// ==UserScript==
// @name         Lampa Horror + Thriller Menu
// @namespace    lampa.simple.genres
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function addButtons() {
    const menu = document.querySelector('.menu__list, .menu__scroll');
    if (!menu || !window.Lampa) return;

    // защита от дублей
    if (document.querySelector('.genre-horror')) return;

    function createItem(text, className, url, icon) {
      const item = document.createElement('div');
      item.className = 'menu__item ' + className;
      item.style.cursor = 'pointer';

      item.innerHTML = `
        <div class="menu__ico">${icon}</div>
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

    // 🎯 жанры
    const horror = createItem(
      'Ужасы 😱',
      'genre-horror',
      'discover/movie?with_genres=27&sort_by=popularity.desc',
      '😱'
    );

    const thriller = createItem(
      'Триллеры 🔪',
      'genre-thriller',
      'discover/movie?with_genres=53&sort_by=popularity.desc',
      '🔪'
    );

    // вставка
    menu.prepend(thriller);
    menu.prepend(horror);

    console.log('✔ Жанры добавлены');
  }

  setInterval(addButtons, 1500);

})();
