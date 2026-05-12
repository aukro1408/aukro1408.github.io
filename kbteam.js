(function () {
    'use strict';

    function startPlugin() {
        console.log('KBTeam plugin started');

        if (!window.Lampa) {
            console.log('Lampa not found');
            return;
        }

        Lampa.Noty.show('KBTeam plugin loaded');

        var source = {
            title: 'KBTeam',
            search: function (params, oncomplite) {
                console.log('KBTeam search:', params);

                oncomplite({
                    results: []
                });
            }
        };

        Lampa.Api.sources.tmdb = source;
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
