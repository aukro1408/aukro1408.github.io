// ==UserScript==
// @name         Lampa Horror Menu FINAL (URL)
// @namespace    lampa.horror.final.url
// @version      5.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function createButton() {
    const menu = document.querySelector('.menu__list, .menu__scroll');
    if (!menu || !window.Lampa) return;

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
          url: 'discover/movie?with_genres=27&sort_by=popularity.desc',
          page: Math.floor(Math.random() * 5) + 1 // 🔥 чтобы не залипало на 1 странице
        });
      } catch (e) {
        console.error(e);
        Lampa.Noty.show('Ошибка 😢');
      }
    };

    menu.prepend(item);
  }

  setInterval(createButton, 1500);

})();
