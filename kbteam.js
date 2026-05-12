(function () {
    'use strict';

    function startPlugin() {

        console.log('KBTeam plugin started');

        Lampa.Noty.show('KBTeam started');

        if (!Lampa.Params.values['kbteam_source']) {
            Lampa.Params.select('kbteam_source', {
                name: 'KBTeam source',
                values: {
                    'true': 'Enabled',
                    'false': 'Disabled'
                },
                default: 'true'
            });
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
