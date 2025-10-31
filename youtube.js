// ==UserScript==
// @name         Lampa YouTube Test Button
// @namespace    lampa.youtube.test
// @version      1.0
// @description  Проверка появления кнопки YouTube в меню Lampa
// ==/UserScript==

(function () {
  'use strict';

  const ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>';

  function waitForLampa() {
    if (typeof window.Lampa === 'undefined' || !Lampa.Plugin) {
      return setTimeout(waitForLampa, 1000);
    }

    console.log('✅ Lampa доступна, создаю кнопку YouTube');

    Lampa.Plugin.create('youtube_test', {
      title: 'YouTube',
      icon: ICON,
      onSelect: function () {
        Lampa.Noty.show('YouTube кнопка работает ✅');
      }
    });
  }

  waitForLampa();
})();
