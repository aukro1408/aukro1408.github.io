(function () {
  'use strict';

  // ─── НАСТРОЙКИ ────────────────────────────────────────────────
  var PLUGIN_NAME = 'similar_movies';
  var TMDB_KEY    = ''; // Вставь свой API-ключ TMDB сюда
  var TMDB_LANG   = 'ru-RU';
  var IMG_BASE    = 'https://image.tmdb.org/t/p/w300';
  // ──────────────────────────────────────────────────────────────

  // Получить ключ TMDB: либо свой, либо из настроек Lampa
  function getKey() {
    if (TMDB_KEY) return TMDB_KEY;
    var s = Lampa.Storage.get('tmdb_api_key') || Lampa.Storage.get('58e6fb66b91aa8f0e1f2b8cf3bb1342e') || '';
    return s;
  }

  // ─── ЗАПРОС К TMDB ────────────────────────────────────────────
  function fetchSimilar(type, id, page, callback) {
    var key      = getKey();
    var endpoint = type === 'tv' ? 'tv' : 'movie';
    var url      = 'https://api.themoviedb.org/3/' + endpoint + '/' + id +
                   '/recommendations?api_key=' + key +
                   '&language=' + TMDB_LANG + '&page=' + (page || 1);

    Lampa.Utils.ajax({
      url: url,
      dataType: 'json',
      success: function (data) { callback(null, data); },
      error:   function (err)  { callback(err, null);  }
    });
  }

  // ─── КОМПОНЕНТ: СТРАНИЦА ПОХОЖЕГО КИНО ───────────────────────
  function SimilarComponent(object) {
    var self      = this;
    var card      = object.card;       // карточка текущего фильма/сериала
    var type      = object.type || 'movie';
    var tmdb_id   = card.id;
    var page      = 1;
    var total     = 1;
    var loading   = false;
    var items     = [];

    var $body     = $('<div class="similar-plugin"></div>');
    var $head     = $('<div class="similar-plugin__head"></div>');
    var $title    = $('<div class="similar-plugin__title"></div>');
    var $count    = $('<div class="similar-plugin__count"></div>');
    var $scroll   = $('<div class="similar-plugin__scroll"></div>');
    var $grid     = $('<div class="similar-plugin__grid"></div>');
    var $more     = $('<div class="similar-plugin__more"><button class="similar-plugin__more-btn focus--mouse">Загрузить ещё</button></div>');
    var $empty    = $('<div class="similar-plugin__empty">Похожих фильмов не найдено</div>');
    var $loader   = $('<div class="similar-plugin__loader"><div class="similar-plugin__spinner"></div></div>');

    // ── Заголовок ──
    $title.text('Похожее на «' + (card.title || card.name || '') + '»');
    $head.append($title).append($count);
    $body.append($head);
    $body.append($scroll.append($grid));

    // ── Отрисовать карточки ──
    function renderCards(results) {
      results.forEach(function (movie) {
        var poster = movie.poster_path
          ? IMG_BASE + movie.poster_path
          : '';
        var rating = movie.vote_average
          ? parseFloat(movie.vote_average).toFixed(1)
          : '—';
        var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
        var title = movie.title || movie.name || '';

        var $card = $([
          '<div class="card focus--mouse similar-plugin__card" tabindex="0">',
          '  <div class="card__view">',
          poster
            ? '<img class="card__img" src="' + poster + '" loading="lazy" />'
            : '<div class="card__img card__img--empty"><span>🎬</span></div>',
          '    <div class="similar-plugin__badge">' + rating + '</div>',
          '  </div>',
          '  <div class="card__title">' + title + '</div>',
          '  <div class="similar-plugin__year">' + year + '</div>',
          '</div>'
        ].join(''));

        // Клик — открыть карточку через Lampa
        $card.on('click', function () {
          Lampa.Activity.push({
            url: '',
            component: 'full',
            id: movie.id,
            method: type === 'tv' ? 'tv' : 'movie',
            card: movie
          });
        });

        // Пульт — Enter
        $card.on('keydown', function (e) {
          if (e.keyCode === 13) $card.trigger('click');
        });

        $grid.append($card);
        items.push($card);
      });
    }

    // ── Загрузить страницу ──
    function load() {
      if (loading || page > total) return;
      loading = true;
      $grid.append($loader);

      fetchSimilar(type, tmdb_id, page, function (err, data) {
        $loader.detach();
        loading = false;

        if (err || !data || !data.results) {
          if (page === 1) $grid.append($empty);
          return;
        }

        total = data.total_pages || 1;
        $count.text('Найдено: ' + (data.total_results || 0));

        if (data.results.length === 0 && page === 1) {
          $grid.append($empty);
          return;
        }

        renderCards(data.results);
        page++;

        // Кнопка "ещё"
        $more.detach();
        if (page <= total) {
          $scroll.append($more);
          $more.find('button').off('click').on('click', load);
        }
      });
    }

    // ── Публичный интерфейс Lampa Activity ──
    this.create = function () {
      load();
      return $body;
    };

    this.render = function () {
      return $body;
    };

    this.update = function () {};

    this.pause  = function () {};
    this.resume = function () {};

    this.destroy = function () {
      $body.remove();
      items = [];
    };

    this.back = function () {
      Lampa.Activity.backward();
    };
  }

  // ─── СТИЛИ ────────────────────────────────────────────────────
  function injectStyles() {
    var css = [
      '.similar-plugin { padding: 2em; }',

      '.similar-plugin__head {',
      '  display: flex;',
      '  align-items: baseline;',
      '  gap: 1em;',
      '  margin-bottom: 1.4em;',
      '  border-bottom: 1px solid rgba(255,255,255,0.08);',
      '  padding-bottom: 0.8em;',
      '}',

      '.similar-plugin__title {',
      '  font-size: 1.4em;',
      '  font-weight: 500;',
      '  color: #fff;',
      '}',

      '.similar-plugin__count {',
      '  font-size: 0.85em;',
      '  color: rgba(255,255,255,0.4);',
      '}',

      '.similar-plugin__grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));',
      '  gap: 1.2em;',
      '}',

      '.similar-plugin__card {',
      '  cursor: pointer;',
      '  outline: none;',
      '  transition: transform 0.15s;',
      '}',

      '.similar-plugin__card:hover,',
      '.similar-plugin__card:focus {',
      '  transform: scale(1.04);',
      '}',

      '.similar-plugin__card .card__view {',
      '  position: relative;',
      '  border-radius: 6px;',
      '  overflow: hidden;',
      '  aspect-ratio: 2/3;',
      '  background: rgba(255,255,255,0.05);',
      '}',

      '.similar-plugin__card .card__img {',
      '  width: 100%;',
      '  height: 100%;',
      '  object-fit: cover;',
      '  display: block;',
      '}',

      '.card__img--empty {',
      '  display: flex !important;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 2.5em;',
      '}',

      '.similar-plugin__badge {',
      '  position: absolute;',
      '  top: 6px; right: 6px;',
      '  background: rgba(0,0,0,0.72);',
      '  color: #e8b84b;',
      '  font-size: 0.75em;',
      '  font-weight: 600;',
      '  padding: 2px 7px;',
      '  border-radius: 4px;',
      '  backdrop-filter: blur(4px);',
      '}',

      '.similar-plugin__card .card__title {',
      '  margin-top: 0.5em;',
      '  font-size: 0.85em;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '  color: #ddd;',
      '}',

      '.similar-plugin__year {',
      '  font-size: 0.75em;',
      '  color: rgba(255,255,255,0.35);',
      '  margin-top: 0.2em;',
      '}',

      '.similar-plugin__loader {',
      '  grid-column: 1 / -1;',
      '  display: flex;',
      '  justify-content: center;',
      '  padding: 2em 0;',
      '}',

      '.similar-plugin__spinner {',
      '  width: 32px; height: 32px;',
      '  border: 3px solid rgba(255,255,255,0.1);',
      '  border-top-color: #e8b84b;',
      '  border-radius: 50%;',
      '  animation: spin 0.7s linear infinite;',
      '}',

      '@keyframes spin { to { transform: rotate(360deg); } }',

      '.similar-plugin__empty {',
      '  grid-column: 1 / -1;',
      '  text-align: center;',
      '  padding: 3em;',
      '  color: rgba(255,255,255,0.3);',
      '  font-size: 0.9em;',
      '}',

      '.similar-plugin__more {',
      '  display: flex;',
      '  justify-content: center;',
      '  padding: 2em 0 1em;',
      '}',

      '.similar-plugin__more-btn {',
      '  padding: 0.6em 2em;',
      '  background: transparent;',
      '  border: 1px solid rgba(255,255,255,0.2);',
      '  color: #ddd;',
      '  border-radius: 4px;',
      '  font-size: 0.9em;',
      '  cursor: pointer;',
      '  transition: all 0.2s;',
      '}',

      '.similar-plugin__more-btn:hover,',
      '.similar-plugin__more-btn:focus {',
      '  border-color: #e8b84b;',
      '  color: #e8b84b;',
      '  outline: none;',
      '}',

      // Кнопка в карточке фильма
      '.similar-plugin__open-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 0.4em;',
      '  cursor: pointer;',
      '}',
    ].join('\n');

    $('<style id="similar-plugin-styles">').text(css).appendTo('head');
  }

  // ─── КНОПКА В КАРТОЧКЕ ФИЛЬМА ─────────────────────────────────
  function addButton(component, object) {
    // Ждём пока Lampa отрисует кнопки действий
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      // Ищем контейнер с кнопками (full-view)
      var $actions = component.render
        ? component.render().find('.full-start__buttons, .full__buttons, .info__buttons')
        : $();

      if (!$actions.length) $actions = $('.full-start__buttons, .full__buttons, .info__buttons').first();

      if ($actions.length || attempts > 20) {
        clearInterval(interval);
        if (!$actions.length) return;

        // Не добавлять дважды
        if ($actions.find('.similar-plugin__open-btn').length) return;

        var type    = object.method || object.type || 'movie';
        var card    = object.card   || object;

        var $btn = $([
          '<div class="btn-small focus--mouse similar-plugin__open-btn" tabindex="0">',
          '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
          '    <circle cx="12" cy="12" r="3"/>',
          '    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke-dasharray="3 3"/>',
          '  </svg>',
          '  Похожее',
          '</div>'
        ].join(''));

        var open = function () {
          Lampa.Activity.push({
            url:       '',
            title:     'Похожее кино',
            component: PLUGIN_NAME,
            card:      card,
            type:      type
          });
        };

        $btn.on('click', open);
        $btn.on('keydown', function (e) { if (e.keyCode === 13) open(); });

        $actions.append($btn);
      }
    }, 150);
  }

  // ─── РЕГИСТРАЦИЯ ПЛАГИНА ──────────────────────────────────────
  function init() {
    // 1. Стили
    if (!$('#similar-plugin-styles').length) injectStyles();

    // 2. Регистрация компонента (страница с похожим)
    Lampa.Component.add(PLUGIN_NAME, SimilarComponent);

    // 3. Слушаем открытие полной карточки фильма
    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite' || e.type === 'complete') {
        addButton(e.component || {}, e.object || {});
      }
    });

    console.log('[SimilarMovies] плагин загружен');
  }

  // ─── ТОЧКА ВХОДА ─────────────────────────────────────────────
  if (window.Lampa) {
    init();
  } else {
    document.addEventListener('lampa:ready', init);
  }

})();
