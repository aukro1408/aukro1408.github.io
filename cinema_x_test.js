/**
 * Flixio Lite
 * Только: «Новинки проката» и карточки стримингов.
 * Русская, польская и украинская ленты намеренно не включены.
 */
(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    var LANGUAGE = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
    var TEXT = {
        releases: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        streaming: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        new_movies: { uk: 'Нові фільми', ru: 'Новые фильмы', en: 'New movies', pl: 'Nowe filmy' },
        new_series: { uk: 'Нові серіали', ru: 'Новые сериалы', en: 'New series', pl: 'Nowe seriale' }
    };

    function tr(key) {
        var pack = TEXT[key];
        return pack && (pack[LANGUAGE] || pack.uk || pack.en) || key;
    }

    function tmdbKey() {
        return (Lampa.Storage.get('flixio_tmdb_apikey') || '').trim() ||
            (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    function today() {
        var d = new Date();
        return [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
    }

    // ID провайдера TMDB и ID сети TMDB сохранены из Flixio.
    // Карточек украинской, польской и русской лент здесь нет.
    var SERVICES = [
        { id: 'netflix', title: 'Netflix', provider: '8', network: '213' },
        { id: 'disney', title: 'Disney+', provider: '337', network: '2739' },
        { id: 'hbo', title: 'HBO / Max', provider: '384', network: '49|3186' },
        { id: 'apple', title: 'Apple TV+', provider: '350', network: '2552|3235' },
        { id: 'amazon', title: 'Prime Video', provider: '119', network: '1024' },
        { id: 'hulu', title: 'Hulu', provider: '15', network: '453' },
        { id: 'paramount', title: 'Paramount+', provider: '531', network: '4330' },
        { id: 'sky_showtime', title: 'SkyShowtime', company: '4|33|521' },
        { id: 'syfy', title: 'Syfy', network: '77' },
        { id: 'educational', title: 'Discovery / Nat Geo', network: '64|91|43|2696|4|65' }
    ];

    function requestUrl(kind, filter, page) {
        var params = [
            'api_key=' + encodeURIComponent(tmdbKey()),
            'language=' + encodeURIComponent(Lampa.Storage.get('language', 'uk')),
            'page=' + (page || 1),
            'sort_by=' + (kind === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc'),
            (kind === 'movie' ? 'primary_release_date.lte=' : 'first_air_date.lte=') + today(),
            'vote_count.gte=1'
        ];
        if (filter.provider) params.push('with_watch_providers=' + filter.provider, 'watch_region=UA');
        if (filter.network) params.push('with_networks=' + filter.network);
        if (filter.company) params.push('with_companies=' + filter.company);
        return Lampa.TMDB.api('discover/' + kind + '?' + params.join('&'));
    }

    function StreamingView(object) {
        var comp = new Lampa.InteractionMain(object);
        var service = SERVICES.filter(function (item) { return item.id === object.service_id; })[0];
        if (!service) return comp;

        comp.create = function () {
            var self = this;
            var network = new Lampa.Reguest();
            var pending = 2;
            var rows = [];

            function done(title, json) {
                var results = json && json.results || [];
                if (results.length) rows.push({ title: title, results: results, url: '', params: {} });
                pending -= 1;
                if (!pending) {
                    if (rows.length) self.build(rows);
                    else self.empty();
                }
            }

            network.silent(requestUrl('movie', service), function (json) { done(tr('new_movies'), json); }, function () { done(tr('new_movies')); });
            network.silent(requestUrl('tv', service), function (json) { done(tr('new_series'), json); }, function () { done(tr('new_series')); });
            return this.render();
        };
        return comp;
    }

    function addReleaseRow() {
        Lampa.ContentRows.add({
            index: 0,
            name: 'flixio_lite_releases',
            title: tr('releases'),
            screen: ['main'],
            call: function () {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var url = Lampa.TMDB.api('movie/now_playing?api_key=' + encodeURIComponent(tmdbKey()) +
                        '&language=' + encodeURIComponent(Lampa.Storage.get('language', 'uk')) + '&region=UA');
                    network.silent(url, function (json) {
                        callback({ results: json.results || [], title: tr('releases'), params: { items: { view: 15, mapping: 'line' } } });
                    }, function () { callback({ results: [] }); });
                };
            }
        });
    }

    function addStreamingRow() {
        Lampa.ContentRows.add({
            index: 1,
            name: 'flixio_lite_streaming',
            title: tr('streaming'),
            screen: ['main'],
            call: function () {
                return function (callback) {
                    callback({
                        results: SERVICES.map(function (service) {
                            return {
                                id: service.id,
                                title: service.title,
                                params: {
                                    createInstance: function () {
                                        return Lampa.Maker.make('Card', this, function (module) { return module.only('Card', 'Callback'); });
                                    },
                                    emit: {
                                        onCreate: function () {
                                            var card = $(this.html);
                                            card.addClass('card--studio flixio-lite-service');
                                            card.find('.card__view').empty().append($('<div class="flixio-lite-logo"></div>').text(service.title));
                                            card.find('.card__age, .card__year, .card__type, .card__textbox, .card__title').remove();
                                        },
                                        onlyEnter: function () {
                                            Lampa.Activity.push({ url: '', title: service.title, component: 'flixio_lite_streaming_view', service_id: service.id, page: 1 });
                                        }
                                    }
                                }
                            };
                        }),
                        title: tr('streaming'),
                        params: { items: { view: 15, mapping: 'line' } }
                    });
                };
            }
        });
    }

    function addStyles() {
        if ($('#flixio-lite-css').length) return;
        $('body').append('<style id="flixio-lite-css">.flixio-lite-service .card__view{background:linear-gradient(135deg,#121212,#313131);display:flex;align-items:center;justify-content:center}.flixio-lite-logo{padding:.65em;text-align:center;font-size:1.15em;font-weight:700;line-height:1.2;color:#fff}</style>');
    }

    Lampa.Component.add('flixio_lite_streaming_view', StreamingView);
    addStyles();
    addReleaseRow();
    addStreamingRow();
}());
