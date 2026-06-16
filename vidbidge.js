(function() {
    'use strict';

    console.log('VidBinge plugin loaded');

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            try {
                var activity = e.object.activity;
                if (!activity || !activity.render) return;

                var torrentView = activity.render().find('.view--torrent');
                if (!torrentView || !torrentView.length) return;

                if (torrentView.next('.vidbinge-button').length) return;

                var movie = e.data.movie;
                if (!movie) return;

                var tmdbId = movie.tmdb_id || movie.id;
                if (!tmdbId) return;

                var isSerial = movie.movie_type === 'serial' || movie.type === 'serial' || movie.is_serial;
                var url;

                if (isSerial) {
                    url = 'https://vidbinge.to/tv/' + tmdbId;
                } else {
                    url = 'https://vidbinge.to/movie/' + tmdbId;
                }

                var button = $(
                    '<div class="full-start__button selector vidbinge-button">' +
                        '<span>Watch Online</span>' +
                    '</div>'
                );

                button.on('hover:enter', function() {
                    window.open(url, '_blank');
                });

                torrentView.after(button);

                console.log('VidBinge button added');
            } catch (err) {
                console.error('VidBinge plugin error:', err);
            }
        }
    });

})();
