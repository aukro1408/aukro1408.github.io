(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // НАСТРОЙКИ
  // ─────────────────────────────────────────────────────────────

  var TMDB_KEY  = '58e6fb66b91aa8f0e1f2b8cf3bb1342e'; // Вставь свой TMDB API KEY
  var TMDB_LANG = 'ru-RU';
  var IMG_BASE  = 'https://image.tmdb.org/t/p/w300';
  var PLUGIN_ID = 'similar_movies';

  function getKey() {
    if (TMDB_KEY) return TMDB_KEY;

    return Lampa.Storage.get('tmdb_api_key')
      || Lampa.Storage.get('tmdb_key')
      || '';
  }

  // ─────────────────────────────────────────────────────────────
  // СТИЛИ
  // ─────────────────────────────────────────────────────────────

  function injectStyles() {

    if ($('#' + PLUGIN_ID + '_styles').length) return;

    $('<style id="' + PLUGIN_ID + '_styles">').text([

      '.similar-plugin {',
      '  padding:2em;',
      '}',

      '.similar-plugin__head {',
      '  display:flex;',
      '  align-items:baseline;',
      '  gap:1em;',
      '  margin-bottom:1.4em;',
      '  border-bottom:1px solid rgba(255,255,255,0.08);',
      '  padding-bottom:0.8em;',
      '}',

      '.similar-plugin__title {',
      '  font-size:1.4em;',
      '  font-weight:500;',
      '  color:#fff;',
      '}',

      '.similar-plugin__count {',
      '  font-size:0.85em;',
      '  color:rgba(255,255,255,0.4);',
      '}',

      // 3 карточки в ряд
      '.similar-plugin__grid {',
      '  display:grid;',
      '  grid-template-columns:repeat(3,1fr);',
      '  gap:1.2em;',
      '}',

      '.similar-plugin__card {',
      '  cursor:pointer;',
      '  outline:none;',
      '  transition:transform 0.15s;',
      '}',

      '.similar-plugin__card:hover,',
      '.similar-plugin__card:focus,',
      '.similar-plugin__card.focus {',
      '  transform:scale(1.04);',
      '}',

      '.similar-plugin__card .card__view {',
      '  position:relative;',
      '  border-radius:10px;',
      '  overflow:hidden;',
      '  aspect-ratio:2/3;',
      '  background:rgba(255,255,255,0.05);',
      '}',

      '.similar-plugin__card .card__img {',
      '  width:100%;',
      '  height:100%;',
      '  object-fit:cover;',
      '  display:block;',
      '}',

      '.card__img--empty {',
      '  display:flex !important;',
      '  align-items:center;',
      '  justify-content:center;',
      '  font-size:2.5em;',
      '}',

      '.similar-plugin__badge {',
      '  position:absolute;',
      '  top:6px;',
      '  right:6px;',
      '  background:rgba(0,0,0,0.72);',
      '  color:#e8b84b;',
      '  font-size:0.75em;',
      '  font-weight:600;',
      '  padding:2px 7px;',
      '  border-radius:4px;',
      '}',

      '.similar-plugin__card .card__title {',
      '  margin-top:0.5em;',
      '  font-size:0.85em;',
      '  white-space:nowrap;',
      '  overflow:hidden;',
      '  text-overflow:ellipsis;',
      '  color:#ddd;',
      '}',

      '.similar-plugin__year {',
      '  font-size:0.75em;',
      '  color:rgba(255,255,255,0.35);',
      '  margin-top:0.2em;',
      '}',

      '.similar-plugin__loader {',
      '  display:flex;',
      '  justify-content:center;',
      '  padding:2em 0;',
      '}',

      '.similar-plugin__spinner {',
      '  width:32px;',
      '  height:32px;',
      '  border:3px solid rgba(255,255,255,0.1);',
      '  border-top-color:#e8b84b;',
      '  border-radius:50%;',
      '  animation:similar_spin 0.7s linear infinite;',
      '}',

      '@keyframes similar_spin {',
      '  to { transform:rotate(360deg); }',
      '}',

      '.similar-plugin__empty {',
      '  text-align:center;',
      '  padding:3em;',
      '  color:rgba(255,255,255,0.3);',
      '  font-size:0.9em;',
      '}',

      '.similar-plugin__more {',
      '  display:flex;',
      '  justify-content:center;',
      '  padding:2em 0 1em;',
      '}',

      '.similar-plugin__more-btn {',
      '  padding:0.6em 2em;',
      '  background:transparent;',
      '  border:1px solid rgba(255,255,255,0.2);',
      '  color:#ddd;',
      '  border-radius:4px;',
      '  font-size:0.9em;',
      '  cursor:pointer;',
      '}',

      '.similar-plugin__more-btn:hover,',
      '.similar-plugin__more-btn:focus {',
      '  border-color:#e8b84b;',
      '  color:#e8b84b;',
      '}'

    ].join('\n')).appendTo('head');
  }

  // ─────────────────────────────────────────────────────────────
  // КОМПОНЕНТ
  // ─────────────────────────────────────────────────────────────

  function SimilarComponent(object) {

    var network = new Lampa.Reguest();

    var scroll = new Lampa.Scroll({
      mask: true,
      over: true
    });

    var page    = 1;
    var total   = 1;
    var loading = false;
    var last    = false;

    var card    = object.card || {};
    var type    = object.movie_type || 'movie';
    var tmdb_id = card.id;

    var $head  = $('<div class="similar-plugin__head"></div>');
    var $title = $('<div class="similar-plugin__title"></div>');
    var $count = $('<div class="similar-plugin__count"></div>');

    var $grid = $('<div class="similar-plugin__grid"></div>');

    var $more = $(
      '<div class="similar-plugin__more">' +
      '<button class="similar-plugin__more-btn focus--mouse">' +
      'Загрузить ещё' +
      '</button>' +
      '</div>'
    );

    var $loader = $(
      '<div class="similar-plugin__loader">' +
      '<div class="similar-plugin__spinner"></div>' +
      '</div>'
    );

    var $empty = $(
      '<div class="similar-plugin__empty">' +
      'Похожие фильмы не найдены' +
      '</div>'
    );

    $title.text(
      'Похожее на «' +
      (card.title || card.name || '') +
      '»'
    );

    $head.append($title).append($count);

    scroll.body().addClass('similar-plugin');

    scroll.body().append($head);
    scroll.body().append($grid);

    // ───────────────────────────────────────────────────────────
    // СКРОЛЛ К ФОКУСУ
    // ───────────────────────────────────────────────────────────

    function updateScroll() {

      setTimeout(function () {

        var active = $('.focus');

        if (active.length) {
          scroll.update(active, false);
        }

      }, 10);
    }

    // ───────────────────────────────────────────────────────────
    // КАРТОЧКИ
    // ───────────────────────────────────────────────────────────

    function renderCards(results) {

      results.forEach(function (movie) {

        var poster = movie.poster_path
          ? IMG_BASE + movie.poster_path
          : '';

        var title = movie.title || movie.name || '';

        var rating = movie.vote_average
          ? parseFloat(movie.vote_average).toFixed(1)
          : '—';

        var year = (
          movie.release_date
          || movie.first_air_date
          || ''
        ).slice(0, 4);

        var $card = $([
          '<div class="card focus--mouse similar-plugin__card">',
          '  <div class="card__view">',
          poster
            ? '<img class="card__img" src="' + poster + '" loading="lazy">'
            : '<div class="card__img card__img--empty">🎬</div>',
          '    <div class="similar-plugin__badge">' + rating + '</div>',
          '  </div>',
          '  <div class="card__title">' + title + '</div>',
          '  <div class="similar-plugin__year">' + year + '</div>',
          '</div>'
        ].join(''));

        function open() {

          Lampa.Activity.push({
            url: '',
            component: 'full',
            id: movie.id,
            method: type === 'tv' ? 'tv' : 'movie',
            card: movie
          });
        }

        $card.on('hover:enter', open);

        $card.on('hover:focus', function () {

          last = $card;

          updateScroll();
        });

        $grid.append($card);
      });

      Lampa.Controller.collectionSet(
        scroll.render()
      );
    }

    // ───────────────────────────────────────────────────────────
    // ЗАГРУЗКА
    // ───────────────────────────────────────────────────────────

    function loadPage() {

      if (loading || page > total) return;

      loading = true;

      $grid.append($loader);

      var endpoint = type === 'tv'
        ? 'tv'
        : 'movie';

      var url =
        'https://api.themoviedb.org/3/' +
        endpoint +
        '/' +
        tmdb_id +
        '/recommendations?api_key=' +
        getKey() +
        '&language=' +
        TMDB_LANG +
        '&page=' +
        page;

      network.timeout(10000);

      network.silent(url, function (data) {

        $loader.detach();

        loading = false;

        if (!data || !data.results) {

          if (page === 1) {
            $grid.append($empty);
          }

          return;
        }

        total = data.total_pages || 1;

        $count.text(
          'Найдено: ' +
          (data.total_results || 0)
        );

        if (!data.results.length && page === 1) {

          $grid.append($empty);

          return;
        }

        renderCards(data.results);

        page++;

        $more.detach();

        if (page <= total) {

          scroll.body().append($more);

          $more.find('button')
            .off('click')
            .on('click', loadPage);
        }

        Lampa.Controller.enable('content');

      }, function () {

        $loader.detach();

        loading = false;

        if (page === 1) {
          $grid.append($empty);
        }
      });
    }

    // ───────────────────────────────────────────────────────────
    // МЕТОДЫ
    // ───────────────────────────────────────────────────────────

    this.create = function () {

      loadPage();

      return scroll.render();
    };

    this.render = function () {
      return scroll.render();
    };

    this.update  = function () {};
    this.pause   = function () {};
    this.resume  = function () {};

    this.destroy = function () {

      network.clear();

      scroll.destroy();
    };

    this.back = function () {

      Lampa.Activity.backward();
    };

    this.start = function () {

      Lampa.Background.immediately(
        Lampa.Utils.cardImgBackgroundBlur(card)
      );

      Lampa.Controller.add('content', {

        toggle: function () {

          Lampa.Controller.collectionSet(
            scroll.render()
          );

          Lampa.Controller.collectionFocus(
            last || false,
            scroll.render()
          );
        },

        up: function () {

          if (Navigator.canmove('up')) {

            Navigator.move('up');

            updateScroll();

          } else {

            Lampa.Controller.toggle('head');
          }
        },

        down: function () {

          Navigator.move('down');

          updateScroll();
        },

        right: function () {

          if (Navigator.canmove('right')) {

            Navigator.move('right');

            updateScroll();
          }
        },

        left: function () {

          if (Navigator.canmove('left')) {

            Navigator.move('left');

            updateScroll();

          } else {

            Lampa.Controller.toggle('menu');
          }
        },

        back: this.back.bind(this)
      });

      Lampa.Controller.toggle('content');
    };
  }

  // ─────────────────────────────────────────────────────────────
  // КНОПКА
  // ─────────────────────────────────────────────────────────────

  function addButton(e) {

    if (!e || !e.render || !e.render.length) return;

    if (e.render.next('.similar--button').length) return;

    var movie = e.movie || {};

    var type = (
      movie.number_of_seasons
      || movie.name
    ) ? 'tv' : 'movie';

    var $btn = $([
      '<div class="full-start__button selector similar--button">',
      '  <svg xmlns="http://www.w3.org/2000/svg"',
      '       viewBox="0 0 24 24"',
      '       fill="none"',
      '       stroke="currentColor"',
      '       stroke-width="1.5"',
      '       width="24"',
      '       height="24">',
      '    <circle cx="11" cy="11" r="7"/>',
      '    <line x1="16.5" y1="16.5" x2="22" y2="22"/>',
      '    <line x1="11" y1="7" x2="11" y2="15"/>',
      '    <line x1="7" y1="11" x2="15" y2="11"/>',
      '  </svg>',
      '  <span>Похожее</span>',
      '</div>'
    ].join(''));

    $btn.on('hover:enter', function () {

      Lampa.Activity.push({
        url: '',
        title: 'Похожее кино',
        component: PLUGIN_ID,
        card: movie,
        movie_type: type
      });
    });

    e.render.after($btn);
  }

  // ─────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────

  function init() {

    injectStyles();

    Lampa.Component.add(
      PLUGIN_ID,
      SimilarComponent
    );

    Lampa.Listener.follow('full', function (e) {

      if (e.type === 'complite') {

        addButton({
          render: e.object.activity
            .render()
            .find('.view--torrent'),

          movie: e.data.movie
        });
      }
    });

    try {

      if (
        Lampa.Activity.active().component === 'full'
      ) {

        addButton({
          render: Lampa.Activity.active()
            .activity
            .render()
            .find('.view--torrent'),

          movie: Lampa.Activity.active().card
        });
      }

    } catch (e) {}

    console.log('[SimilarMovies] plugin loaded');
  }

  if (window.Lampa) init();
  else document.addEventListener('lampa:ready', init);

})();
