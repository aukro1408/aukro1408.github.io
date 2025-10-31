// ==UserScript==
// @name         Lampa YouTube Plugin (с API)
// @namespace    lampa.youtube
// @version      1.1
// @description  Кнопка YouTube в меню Lampa с использованием YouTube Data API
// @author       You
// @match        *://*/lampa/*
// @grant        GM_xmlhttpRequest
// @connect      www.googleapis.com
// ==/UserScript==

(function () {
  'use strict';

  const API_KEY = 'AIzaSyBbZ_BNLNdgC9dylYEQdIAPkXc6g3VlLMw'; // ← твой API ключ YouTube
  const pluginName = 'youtube';
  const pluginTitle = 'YouTube';

  const icon = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>';

  function fetchPopularVideos() {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=US&maxResults=20&key=${API_KEY}`;

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: (res) => {
          try {
            const data = JSON.parse(res.responseText);
            resolve(data.items || []);
          } catch (e) {
            reject(e);
          }
        },
        onerror: reject
      });
    });
  }

  function showYouTubeList() {
    const items = [{ title: 'Загрузка...', loader: true }];

    Lampa.Activity.push({
      component: 'youtube_list',
      title: 'Популярное на YouTube',
      items: items,
      onOpen: async () => {
        try {
          const videos = await fetchPopularVideos();
          const list = videos.map(video => ({
            title: video.snippet.title,
            subtitle: video.snippet.channelTitle,
            image: video.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            source: 'youtube'
          }));

          // Обновляем список
          Lampa.Listener.send('activity', {
            type: 'update',
            object: {
              items: list
            }
          });
        } catch (err) {
          console.error('Ошибка загрузки YouTube:', err);
          Lampa.Noty.show('Не удалось загрузить видео');
        }
      }
    });
  }

  function initPlugin() {
    if (!window.Lampa || !window.Lampa.listener) {
      setTimeout(initPlugin, 1000);
      return;
    }

    console.log('✅ Плагин YouTube загружен');

    Lampa.Listener.send('menu', {
      type: 'add',
      object: {
        name: pluginName,
        title: pluginTitle,
        icon: icon,
        onAction: showYouTubeList
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlugin);
  } else {
    initPlugin();
  }
})();
