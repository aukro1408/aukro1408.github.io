/* Lampa.plugin standalone marker for CUB validation */
(function () {
  'use strict';

  var PLUGIN_NS = '__legal_ru_online_plugin_v2';
  if (window[PLUGIN_NS]) return;
  window[PLUGIN_NS] = true;

  var debounceTimer = 0;
  var observerStarted = false;
  var pluginBooted = false;
  var lastMainTriggerAt = 0;

  var BLOCKS = [
    {
      title: 'Русские фильмы',
      query: 'discover/movie?sort_by=primary_release_date.desc&watch_region=RU&with_watch_monetization_types=flatrate|free&with_origin_country=RU&with_original_language=ru&without_genres=16&primary_release_date.lte=',
      source: 'tmdb'
    },
    {
      title: 'Русские сериалы',
      query: 'discover/tv?sort_by=first_air_date.desc&watch_region=RU&with_watch_monetization_types=flatrate|free&with_origin_country=RU&with_original_language=ru&without_genres=16&first_air_date.lte=',
      source: 'tmdb'
    }
  ];

  function getLampa() {
    return window.Lampa || null;
  }

  function getDate() {
    var d = new Date();
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  }

  function resolveUrl(q) {
    return q.endsWith('=') ? q + getDate() : q;
  }

  function normalize(data) {
    if (!data || !Array.isArray(data.results)) return { results: [] };

    data.results = data.results
      .filter(x => x.poster_path)
      .filter((v, i, a) =>
        a.findIndex(t =>
          (t.title || t.name) === (v.title || v.name)
        ) === i
      )
      .sort((a, b) =>
        (b.release_date || b.first_air_date || '')
          .localeCompare(a.release_date || a.first_air_date || '')
      );

    data.results.forEach(x => {
      x.promo = x.overview;
      x.promo_title = x.title || x.name;
    });

    return data;
  }

  function inject(api) {
    if (!api || !api.sources || !api.sources.tmdb) return;

    var tmdb = api.sources.tmdb;
    var originalGet = tmdb.get;

    if (tmdb.__patched) return;
    tmdb.__patched = true;

    tmdb.get = function (url, params, cb, err) {
      var wrapped = cb;

      try {
        wrapped = function (data) {
          cb(normalize(data));
        };
      } catch (e) {}

      return originalGet.call(this, url, params, wrapped, err);
    };

    var originalPartNext = api.partNext;

    api.partNext = function (reqs, count, ok, err) {
      try {
        if (Date.now() - lastMainTriggerAt < 1000) {
          var extra = BLOCKS.map(b => cb => {
            tmdb.get(resolveUrl(b.query), {}, d => {
              d.title = b.title;
              cb(d);
            });
          });
          reqs = extra.concat(reqs || []);
        }
      } catch (e) {}

      return originalPartNext.call(this, reqs, count, ok, err);
    };

    Object.keys(api.sources).forEach(name => {
      var s = api.sources[name];
      if (!s.main || s.__patchedMain) return;

      var orig = s.main;
      s.main = function () {
        lastMainTriggerAt = Date.now();
        return orig.apply(this, arguments);
      };
      s.__patchedMain = true;
    });
  }

  function promote() {
    try {
      var lampa = getLampa();
      if (!lampa) return;

      var act = lampa.Activity.active();
      if (!act || act.component !== 'main') return;

      var comp = act.activity.component;
      var host = comp.html[0];

      var lines = host.querySelectorAll('.items-line');

      var film, series;

      lines.forEach(l => {
        var t = l.querySelector('.items-line__title')?.innerText;
        if (t === 'Русские фильмы') film = l;
        if (t === 'Русские сериалы') series = l;
      });

      var body = host.querySelector('.scroll__body') || host;

      if (film) body.prepend(film);
      if (series && film) film.after(series);

    } catch (e) {}
  }

  function enhance() {
    try {
      var lampa = getLampa();
      if (!lampa || !lampa.Api) return;

      inject(lampa.Api);
      promote();

    } catch (e) {}
  }

  function observe() {
    if (observerStarted) return;
    observerStarted = true;

    new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(enhance, 100);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    if (pluginBooted) return;
    pluginBooted = true;

    enhance();
    observe();
  }

  init();
})();
