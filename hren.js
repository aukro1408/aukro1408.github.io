// ==UserScript==
// @name         Lampa Add "Хрень" Menu Item (Fixed for Beta)
// @namespace    lampa.hren
// @version      1.1
// @description  Добавляет пункт меню "Хрень" с иконкой сердечка (beta.lampa.mx совместимо)
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function waitForMenu() {
    const menuList = document.querySelector('.menu__list') || document.querySelector('.menu__scroll');
    if (!menuList) return setTimeout(waitForMenu, 1000);

    // Проверяем, есть ли уже элемент
    if (menuList.querySelector('.menu__item.hren-item')) return;

    // Создаём пункт меню
    const item = document.createElement('div');
    item.classList.add('menu__item', 'hren-item');
    item.style.cursor = 'pointer';
    item.innerHTML = `
      <div class="menu__ico">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.1 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                   2 5.42 4.42 3 7.5 3
                   c1.74 0 3.41 0.81 4.5 2.09
                   C13.09 3.81 14.76 3 16.5 3
                   19.58 3 22 5.42 22 8.5
                   c0 3.78-3.4 6.86-8.55 11.54L12.1 21.35z"/>
        </svg>
      </div>
      <div class="menu__text">Хрень</div>
    `;

    item.addEventListener('click', () => {
      if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Просто хрень 😎');
    });

    // Вставляем после пункта "Избранное" если он есть
    const favorite = [...menuList.querySelectorAll('.menu__item')].find(el =>
      el.textContent.trim().includes('Избранное')
    );

    if (favorite && favorite.nextSibling) {
      menuList.insertBefore(item, favorite.nextSibling);
    } else {
      menuList.appendChild(item);
    }
  }

  // ждём загрузку интерфейса
  const observer = new MutationObserver(() => {
    if (document.querySelector('.menu__list, .menu__scroll')) {
      observer.disconnect();
      waitForMenu();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
