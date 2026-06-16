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

                var button = $(
                    '<div class="full-start__button selector vidbinge-button">' +
                        '<span>VidBinge</span>' +
                    '</div>'
                );

                button.on('hover:enter', function() {
                    console.log('VidBinge button pressed');

                    var url = isSerial
                        ? 'https://vidbinge.to/tv/' + tmdbId
                        : 'https://vidbinge.to/movie/' + tmdbId;

                    // Show loading indicator
                    var container = activity.render();
                    var loading = $(
                        '<div class="vidbinge-loading" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;">' +
                            'Loading...' +
                        '</div>'
                    );
                    container.append(loading);

                    // Fetch vidbinge page to extract vidora iframe URL
                    fetch(url)
                        .then(function(response) {
                            if (!response.ok) throw new Error('HTTP ' + response.status);
                            return response.text();
                        })
                        .then(function(html) {
                            loading.remove();

                            // Extract vidora iframe URL using regex
                            var match = html.match(/<iframe[^>]*src="(https?:\/\/vidora\.stream\/embed\/[^"]+)"/i);
                            if (match && match[1]) {
                                var vidoraUrl = match[1];
                                console.log('Found vidora URL:', vidoraUrl);

                                // Open vidora URL in Lampa internal browser
                                if (Lampa.Activity && Lampa.Activity.push) {
                                    try {
                                        Lampa.Activity.push({
                                            url: vidoraUrl,
                                            title: 'VidBinge',
                                            component: 'browser'
                                        });
                                        return;
                                    } catch (e) {
                                        console.log('Browser component failed, trying iframe...');
                                    }

                                    try {
                                        Lampa.Activity.push({
                                            component: 'iframe',
                                            url: vidoraUrl,
                                            title: 'VidBinge'
                                        });
                                        return;
                                    } catch (e) {
                                        console.log('Iframe component failed, creating webview...');
                                    }
                                }

                                // Fallback: create an embedded iframe
                                var webview = $(
                                    '<div class="vidbinge-webview" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:#000;">' +
                                        '<div class="vidbinge-webview-header" style="padding:10px;text-align:right;">' +
                                            '<div class="selector" style="display:inline-block;padding:8px 16px;background:#333;color:#fff;border-radius:4px;">Close</div>' +
                                        '</div>' +
                                        '<iframe src="' + vidoraUrl + '" style="width:100%;height:calc(100% - 50px);border:none;" allowfullscreen allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>' +
                                    '</div>'
                                );

                                webview.find('.selector').on('hover:enter', function() {
                                    webview.remove();
                                });

                                activity.render().append(webview);
                            } else {
                                console.error('Could not find vidora iframe URL in response');
                                loading.text('Error: Could not find video source');
                                setTimeout(function() { loading.remove(); }, 3000);
                            }
                        })
                        .catch(function(err) {
                            console.error('Fetch error:', err);
                            loading.text('Error: ' + err.message);
                            setTimeout(function() { loading.remove(); }, 3000);
                        });
                });

                torrentView.after(button);
                console.log('VidBinge button added');
            } catch (err) {
                console.error('VidBinge plugin error:', err);
            }
        }
    });

})();
