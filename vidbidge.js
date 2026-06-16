(function() {
    'use strict';

    Lampa.Listener.follow('full', function(e) {
        if (e.type !== 'complite') return;

        try {
            var activity = e.object.activity;
            if (!activity || !activity.render) return;

            var torrentView = activity.render().find('.view--torrent');
            if (!torrentView || !torrentView.length) return;

            if (torrentView.next('.online-button').length) return;

            var movie = e.data.movie;
            if (!movie) return;

            var tmdbId = movie.tmdb_id || movie.id;
            if (!tmdbId) return;

            var isSerial = !!movie.number_of_seasons;

            var button = $(
                '<div class="full-start__button selector online-button">' +
                    '<span>Online</span>' +
                '</div>'
            );

            button.on('hover:enter', function() {
                var src;

                if (isSerial) {
                    src = 'https://multiembed.mov/?video_id=' + tmdbId + '&tmdb=1&s=1&e=1';
                } else {
                    src = 'https://multiembed.mov/?video_id=' + tmdbId + '&tmdb=1';
                }

                var overlay = $(
                    '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:black;z-index:999999;">' +
                        '<iframe src="' + src + '" style="width:100%;height:100%;border:none;" allowfullscreen allow="autoplay; fullscreen; encrypted-media"></iframe>' +
                        '<div style="position:absolute;top:20px;right:20px;color:white;z-index:1000000;padding:10px 20px;background:rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;">Close</div>' +
                    '</div>'
                );

                overlay.find('div:last').on('hover:enter', function() {
                    overlay.remove();
                });

                $('body').append(overlay);
            });

            torrentView.after(button);
        } catch (err) {
            console.error('Online plugin error:', err);
        }
    });

})();
