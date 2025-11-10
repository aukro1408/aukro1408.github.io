// ==UserScript==
// @name         Lampa "Хрень" — Rainbow Heart + Filter Submenu
// @namespace    lampa.hren.submenu
// @version      3.1
// @description  Пункт меню "Хрень" с радужным сердцем и подменю фильтров ужасов
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  // ✨ Радужное сердце
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rainbowFill {
      0%{fill:red;}
      16%{fill:orange;}
      32%{fill:yellow;}
      48%{fill:green;}
      64%{fill:blue;}
      80%{fill:indigo;}
      100%{fill:violet;}
    }
    .hren-item svg{
      animation: rainbowFill 4s infinite linear;
      transition: transform .2s;
    }
    .hren-item:hover svg{
      transform: scale(1.3);
    }
    .hren-submenu {
      padding-left: 20px;
      display: none;
      flex-direction: column;
    }
    .hren-submenu .menu__item {
      font-size: 0.9em;
    }
  `;
  document.head.appendChild(style);

  const horrorFilters = [
    { name: 'Слэшеры', genre: 28 },
    { name: 'Сверхъестественные', genre: 27 },
    { name: 'Зомби', genre: 10752 },
    { name: 'Вампиры', genre: 14 }
  ];

  function addHrenItem() {
    const menuList = document.querySelector('.menu__list,.menu__scroll');
    if (!menuList || !window.Lampa) return;

    let item = document.querySelector('.hren-item');

    if (!item) {
      item = document.createElement('div');
      item.classList.add('menu__item', 'hren-item');
      item.style.cursor = 'pointer';
      item.innerHTML = `
        <div class="menu__ico">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
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

      // 🔹 Создаём подменю с фильтрами
      const subMenu = document.createElement('div');
      subMenu.classList.add('hren-submenu');
      horrorFilters.forEach(f => {
        const filterItem = document.createElement('div');
        filterItem.classList.add('menu__item');
        filterItem.textContent = f.name;
        filterItem.style.cursor = 'pointer';
        filterItem.addEventListener('click', (e) => {
          e.stopPropagation(); // предотвращаем закрытие подменю
          try {
            Lampa.Noty.show(`Открываем: ${f.name}`);
            Lampa.Activity.push({
              component: 'category_full',
              source: 'tmdb',
              title: `Хрень: ${f.name}`,
              url: `discover/movie?with_genres=${f.genre}&sort_by=popularity.desc`,
              page: Math.floor(Math.random() * 10) + 1
            });
          } catch(e) {
            console.error(e);
            Lampa.Noty.show('Ошибка при открытии фильтра 💩');
          }
        });
        subMenu.appendChild(filterItem);
      });

      item.appendChild(subMenu);

      // Показываем/скрываем подменю при клике на основной пункт
      item.addEventListener('click', () => {
        subMenu.style.display = subMenu.style.display === 'none' ? 'flex' : 'none';
      });

      menuList.insertBefore(item, menuList.firstChild);
    } else {
      if (menuList.firstChild !== item) {
        menuList.insertBefore(item, menuList.firstChild);
      }
    }
  }

  // 🔍 MutationObserver для динамического меню
  const observer = new MutationObserver(addHrenItem);
  observer.observe(document.body, { childList: true, subtree: true });

  // 🟢 Lampa.Listener для стабильного закрепления пункта
  if (window.Lampa && Lampa.Listener) {
    Lampa.Listener.follow('menuLoaded', addHrenItem);
    Lampa.Listener.follow('menuUpdate', addHrenItem);
  }
})();
