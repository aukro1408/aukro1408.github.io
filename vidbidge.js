(function() {
    'use strict';

    console.log('Online plugin loaded');

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
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

                var isSerial = movie.movie_type === 'serial' || movie.type === 'serial' || movie.is_serial;

                var button = $(
                    '<div class="full-start__button selector online-button">' +
                        '<span>Online</span>' +
                    '</div>'
                );

                button.on('hover:enter', function() {
                    console.log('Online button pressed');

                    var directUrl;
                    if (isSerial) {
                        directUrl = 'https://multiembed.mov/?video_id=' + tmdbId + '&tmdb=1&s=1&e=1';
                    } else {
                        directUrl = 'https://multiembed.mov/?video_id=' + tmdbId + '&tmdb=1';
                    }

                    console.log('Opening URL:', directUrl);

                    // Try Lampa internal browser
                    if (Lampa.Activity && Lampa.Activity.push) {
                        try {
                            Lampa.Activity.push({
                                url: directUrl,
                                title: isSerial ? 'Online - Season 1 Episode 1' : 'Online',
                                component: 'browser'
                            });
                            return;
                        } catch (e) {
                            console.log('Browser component failed, trying iframe...');
                        }

                        try {
                            Lampa.Activity.push({
                                component: 'iframe',
                                url: directUrl,
                                title: 'Online'
                            });
                            return;
                        } catch (e) {
                            console.log('Iframe component failed, creating webview...');
                        }
                    }

                    // Fallback: embedded iframe overlay
                    var container = activity.render();
                    var webview = $(
                        '<div class="online-webview" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:#000;">' +
                            '<div class="online-webview-header" style="padding:10px;text-align:right;">' +
                                '<div class="selector" style="display:inline-block;padding:8px 16px;background:#333;color:#fff;border-radius:4px;">Close</div>' +
                            '</div>' +
                            '<iframe src="' + directUrl + '" style="width:100%;height:calc(100% - 50px);border:none;" allowfullscreen allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>' +
                        '</div>'
                    );

                    webview.find('.selector').on('hover:enter', function() {
                        webview.remove();
                    });

                    container.append(webview);
                });

                torrentView.after(button);
                console.log('Online button added');
            } catch (err) {
                console.error('Online plugin error:', err);
            }
        }
    });

})();
