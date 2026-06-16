/* Lampa Plugin: Watch Online (VidBinge) */
(function () {
  'use strict';

  var pluginName = 'online';

  console.log('VidBinge plugin loaded');

  function getTmdbId(movie) {
    if (!movie) return null;
    var id = movie.tmdb_id || movie.id;
    if (movie.movie_type && movie.movie_type === 'serial') {
      return id;
    }
    if (movie.type && movie.type === 'serial') {
      return id;
    }
    return id;
  }

  function isSerial(movie) {
    if (!movie) return false;
    return (
      movie.movie_type === 'serial' ||
      movie.type === 'serial' ||
      (movie.is_serial !== undefined && movie.is_serial) ||
      (movie.universal_type && movie.universal_type === 'serial')
    );
  }

  function buildUrl(movie) {
    var tmdbId = getTmdbId(movie);
    if (!tmdbId) return null;
    if (isSerial(movie)) {
      return 'https://vidbinge.to/tv/' + tmdbId;
    }
    return 'https://vidbinge.to/movie/' + tmdbId;
  }

  function openUrl(url) {
    if (!url) return;
    if (typeof Lampa !== 'undefined' && Lampa.Activity && typeof Lampa.Activity.push === 'function') {
      Lampa.Activity.push({ url: url });
    } else if (typeof window !== 'undefined' && window.open) {
      window.open(url);
    } else if (typeof location !== 'undefined') {
      location.href = url;
    }
  }

  function getButtonContainer() {
    var selectors = [
      '.full-start__buttons',
      '.full-start__button-group',
      '.full-start__info',
      '.full-start__actions',
      '.full-start'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  function buttonExists() {
    return document.querySelector('#vidbinge-online-btn, [data-vidbinge="true"]') !== null;
  }

  function injectButton() {
    if (buttonExists()) return;

    var movie = Lampa.Movie ? Lampa.Movie.get() : null;
    if (!movie) return;

    var url = buildUrl(movie);
    if (!url) return;

    var container = getButtonContainer();
    if (!container) return;

    var btn = document.createElement('div');
    btn.className = 'full-start__button selector';
    btn.id = 'vidbinge-online-btn';
    btn.setAttribute('data-vidbinge', 'true');
    btn.setAttribute('data-tmdb', getTmdbId(movie) || '');

    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:6px;">' +
        '<path d="M8 5v14l11-7z"/>' +
      '</svg>' +
      '<span>Watch Online</span>';

    btn.addEventListener('click', function () {
      openUrl(url);
    });

    container.appendChild(btn);
    console.log('VidBinge button added');
  }

  function initPlugin() {
    if (typeof Lampa === 'undefined') {
      setTimeout(initPlugin, 500);
      return;
    }

    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite' || e.type === 'render') {
        setTimeout(injectButton, 300);
      }
    });

    if (Lampa.Controller) {
      var origTv = Lampa.Controller.toggle;
      if (origTv) {
        Lampa.Controller.toggle = function () {
          origTv.apply(Lampa.Controller, arguments);
          setTimeout(injectButton, 500);
        };
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlugin);
  } else {
    initPlugin();
  }
})();
