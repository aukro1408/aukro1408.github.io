;(function(){
  'use strict';

  const host = () => 'https://4kino.cc';
  const searchCache = {};
  const movieCache = {};

  const searchUrl = (title) => host() + '/?s=' + encodeURIComponent(title);

  // Прокси для обхода блокировок
  const proxyUrl = (url) => {
    if(window.location.protocol === 'https:'){
      return 'https://cors.fx666.workers.dev:8443/' + url;
    }
    return url;
  };

  // Парсинг страницы поиска
  const parseSearch = (html) => {
    const results = [];
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const items = doc.querySelectorAll('div.the_content a');
    items.forEach(el => {
      const href = el.getAttribute('href');
      const title = el.textContent.trim();
      if(href && title && !results.find(r => r.url === href)){
        results.push({title, url: href});
      }
    });
    return results;
  };

  // Парсинг страницы фильма
  const parseMoviePage = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const result = {title:'', links:[]};

    const titleEl = doc.querySelector('h1');
    result.title = titleEl ? titleEl.textContent.trim() : '';

    const iframeEls = doc.querySelectorAll('iframe');
    iframeEls.forEach(iframe => {
      const src = iframe.getAttribute('src');
      if(src && src.startsWith('http') && !result.links.find(l => l.url === src)){
        result.links.push({url: src, quality: 'HD', provider: '4kino'});
      }
    });

    const videoEls = doc.querySelectorAll('video source');
    videoEls.forEach(video => {
      const src = video.getAttribute('src');
      if(src && src.startsWith('http') && !result.links.find(l => l.url === src)){
        const quality = video.getAttribute('res') || 'SD';
        result.links.push({url: src, quality: quality, provider: '4kino'});
      }
    });

    return result;
  };

  // Плагин Lampa
  const plugin = {
    name: '4K ino (4kino.cc)',
    version: '1.2',

    search: function(title, callback){
      if(searchCache[title]){
        callback(searchCache[title]);
        return;
      }

      Lampa.Utils.request(searchUrl(title), (html) => {
        const items = parseSearch(html);
        searchCache[title] = items;
        callback(items);
      }, () => {
        callback([]);
      });
    },

    getMovieLinks: function(movieUrl, callback){
      if(movieCache[movieUrl]){
        callback(movieCache[movieUrl]);
        return;
      }

      Lampa.Utils.request(proxyUrl(movieUrl), (html) => {
        const info = parseMoviePage(html);
        movieCache[movieUrl] = info; // кешируем прямые ссылки
        callback(info);
      }, () => {
        callback({title:'', links:[]});
      });
    }
  };

  Lampa.Source.add(plugin);

})();
