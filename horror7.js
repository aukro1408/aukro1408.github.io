// ==UserScript==
// @name         Lampa Horror Menu FINAL
// @namespace    lampa.horror.final
// @version      4.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function createButton() {
    const menu = document.querySelector('.menu__list, .menu__scroll');
    if (!menu || !window.Lampa) return;

    // если уже есть — не создаём повторно
    if (document.querySelector('.hren-item')) return;

    const item = document.createElement('div');
    item.className = 'menu__item hren-item';
    item.style.cursor = 'pointer';

    item.innerHTML = `
      <div class="menu__ico">😱</div>
      <div class="menu__text">Ужасы</div>
    `;

    item.onclick = () => {
      try {
        Lampa.Activity.push({
          component: 'category_full',
          source: 'tmdb',
          title: 'Ужасы 😱',
          api: 'discover',
          params: {
            with_genres: '27',
            sort_by: 'popularity.desc',
            language: 'ru-RU',
            include_adult: false,
            page: 1
          },
          pagination: true
        });
      } catch (e) {
        console.error(e);
        Lampa.Noty.show('Ошибка загрузки 😢');
      }
    };

    menu.prepend(item);
    console.log('✔ Ужасы добавлены');
  }

  // стабильно работает даже при перерисовке интерфейса
  setInterval(createButton, 1500);

})();
