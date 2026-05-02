// ==UserScript==
// @name         Lampa Horror Menu FIX
// @namespace    lampa.horror.fixed
// @version      3.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function createButton() {
    const menu = document.querySelector('.menu__list, .menu__scroll');
    if (!menu || !window.Lampa) return;

    // если уже есть — не дублируем
    if (document.querySelector('.hren-item')) return;

    const item = document.createElement('div');
    item.className = 'menu__item hren-item';
    item.style.cursor = 'pointer';

    item.innerHTML = `
      <div class="menu__ico">😱</div>
      <div class="menu__text">Ужасы</div>
    `;

    item.onclick = () => {
      Lampa.Activity.push({
        component: 'category_full',
        source: 'tmdb',
        title: 'Ужасы 😱',
        api: 'discover',
        params: {
          with_genres: 27,
          sort_by: 'popularity.desc',
          language: 'ru-RU'
        }
      });
    };

    menu.prepend(item);
    console.log('✔ horror menu added');
  }

  // 🔁 пытаемся вставить каждые 1.5 сек (самый стабильный способ)
  setInterval(createButton, 1500);

})();
