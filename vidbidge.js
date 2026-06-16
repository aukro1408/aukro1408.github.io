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
                    console.log('Trying internal browser...');
                    if (Lampa.Activity && Lampa.Activity.push) {
                        try {
                            Lampa.Activity.push({
                                url: url,
                                title: 'VidBinge',
                                component: 'browser'
                            });
                            console.log('VidBinge opened internally');
                            return;
                        } catch (e) {
                            console.log('Browser component failed, trying iframe...');
                        }

                        try {
                            Lampa.Activity.push({
                                component: 'iframe',
                                url: url,
                                title: 'VidBinge'
                            });
                            console.log('VidBinge opened internally');
                            return;
                        } catch (e) {
                            console.log('Iframe component failed, creating webview...');
                        }
                    }

                    console.log('Trying iframe...');
                    var container = activity.render();
                    if (container && container.length) {
                        var webview = $(
                            '<div class="vidbinge-webview" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:#000;">' +
                                '<div class="vidbinge-webview-header" style="padding:10px;text-align:right;">' +
                                    '<div class="selector" style="display:inline-block;padding:8px 16px;background:#333;color:#fff;border-radius:4px;">Close</div>' +
                                '</div>' +
                                '<iframe src="' + url + '" style="width:100%;height:calc(100% - 50px);border:none;"></iframe>' +
                            '</div>'
                        );

                        webview.find('.selector').on('hover:enter', function() {
                            webview.remove();
                        });

                        container.append(webview);
                        console.log('VidBinge opened internally');
                    }
                });

                torrentView.after(button);

                console.log('VidBinge button added');
            } catch (err) {
                console.error('VidBinge plugin error:', err);
            }
        }
    });

})();
