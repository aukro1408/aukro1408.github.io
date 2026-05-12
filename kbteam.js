(function () {
    'use strict';

    function startPlugin() {

        Lampa.Noty.show('KBTeam online ready');

        Lampa.Listener.follow('full', function (e) {

            if (!e || !e.data || !e.data.movie) return;

            var movie = e.data.movie;

            if (!movie.kinopoisk_id) return;

            console.log('KBTEAM MOVIE:', movie);

            var button = $('<div class="simple-button selector">KBTeam</div>');

            button.on('hover:enter', function () {

                Lampa.Noty.show('Loading stream...');

                fetch(
                    'http://kb-team.club/msx/kinozal/videocdn.php?act=watch&vid='
                    + movie.kinopoisk_id
                )
                .then(function (r) {
                    return r.json();
                })
                .then(function (json) {

                    console.log(json);

                    if (!json || !json.items || !json.items.length) {
                        Lampa.Noty.show('No stream found');
                        return;
                    }

                    var item = json.items.find(function (x) {
                        return x.action && x.action.indexOf('video:') === 0;
                    });

                    if (!item) {
                        Lampa.Noty.show('No playable video');
                        return;
                    }

                    var url = item.action.replace('video:', '');

                    Lampa.Player.play({
                        title: movie.title,
                        url: url
                    });

                })
                .catch(function (err) {

                    console.log(err);

                    Lampa.Noty.show('KBTeam error');

                });

            });

            setTimeout(function () {

                var panel = $('.full-start-new__buttons');

                if (panel.find('.kbteam-button').length === 0) {

                    button.addClass('kbteam-button');

                    panel.append(button);

                }

            }, 1000);

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
