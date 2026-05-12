(function () {
    'use strict';

    function createButton(movie) {

        var button = $('<div class="simple-button selector kbteam-button">KBTeam</div>');

        button.on('hover:enter', function () {

            Lampa.Noty.show('KBTeam loading...');

            fetch(
                'http://kb-team.club/msx/kinozal/videocdn.php?act=watch&vid='
                + movie.kinopoisk_id
            )
            .then(function (r) {
                return r.json();
            })
            .then(function (json) {

                console.log('KBTEAM WATCH:', json);

                if (!json || !json.items || !json.items.length) {
                    Lampa.Noty.show('No stream found');
                    return;
                }

                var item = null;

                json.items.forEach(function (x) {

                    if (
                        !item &&
                        x.action &&
                        typeof x.action === 'string' &&
                        x.action.indexOf('video:') === 0
                    ) {
                        item = x;
                    }

                });

                if (!item) {
                    Lampa.Noty.show('No playable video');
                    return;
                }

                var url = item.action.replace('video:', '');

                console.log('PLAY URL:', url);

                Lampa.Player.play({
                    title: movie.title || movie.name || 'KBTeam',
                    url: url
                });

            })
            .catch(function (err) {

                console.log(err);

                Lampa.Noty.show('KBTeam error');

            });

        });

        return button;
    }

    function injectButton(movie) {

        setTimeout(function () {

            var panel = $(
                '.full-start-new__buttons, ' +
                '.full-start__buttons, ' +
                '.full-buttons, ' +
                '.buttons'
            );

            console.log('KBTEAM PANEL:', panel);

            if (!panel.length) {
                console.log('KBTEAM: buttons panel not found');
                return;
            }

            if (panel.find('.kbteam-button').length) return;

            panel.append(createButton(movie));

            console.log('KBTEAM: button added');

        }, 1500);

    }

    function startPlugin() {

        console.log('KBTeam plugin started');

        Lampa.Noty.show('KBTeam online ready');

        Lampa.Listener.follow('full', function (e) {

            try {

                if (!e || !e.data || !e.data.movie) return;

                var movie = e.data.movie;

                console.log('KBTEAM MOVIE:', movie);

                if (!movie.kinopoisk_id) {
                    console.log('KBTEAM: no kinopoisk_id');
                    return;
                }

                injectButton(movie);

            }
            catch (err) {

                console.log('KBTEAM FULL ERROR:', err);

            }

        });

    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();
