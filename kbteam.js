(function () {
    'use strict';

    function KBTeam() {

        this.search = function (params, oncomplete) {

            var query = params.query || '';

            fetch('http://kb-team.club/msx/kinozal/videocdn.php?act=search&query=' + encodeURIComponent(query))
                .then(function (resp) {
                    return resp.json();
                })
                .then(function (json) {

                    var results = [];

                    if (json && json.items) {

                        json.items.forEach(function (item) {

                            results.push({
                                id: item.id || '',
                                title: item.title || item.label || 'No title',
                                original_title: item.original_title || '',
                                poster_path: item.poster || '',
                                backdrop_path: item.background || '',
                                release_date: item.year ? item.year + '-01-01' : '',
                                overview: '',
                                source: 'kbteam'
                            });

                        });

                    }

                    oncomplete({
                        results: results
                    });

                })
                .catch(function () {

                    oncomplete({
                        results: []
                    });

                });

        };

    }

    function startPlugin() {

        Lampa.Noty.show('KBTeam source enabled');

        if (!Lampa.Api.sources['kbteam']) {
            Lampa.Api.sources['kbteam'] = new KBTeam();
        }

    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();
