// ==addon==
// name: Kinokrad
// type: movie
// icon: https://kinokrad.my/favicon.ico
// version: 1.0
// ==/addon==

(function () {
    'use strict';

    function Component() {
        var host = 'https://kinokrad.my';

        function search(query, page, onResult) {
            var url = host + '/search/?q=' + encodeURIComponent(query);
            Lampa.api(url, function (html) {
                if (!html) return onResult([]);

                var results = [];
                // Парсим стандартный блок фильмов на Kinokrad
                var matches = html.matchAll(/<div class="th-item"[^>]*>.*?href="([^"]+)".*?<img[^>]+src="([^"]+)".*?<div class="th-title"[^>]*>([^<]+)<\/div>.*?<div class="th-year"[^>]*>(\d{4})<\/div>/gs);
                for (var match of matches) {
                    results.push({
                        title: match[3].trim(),
                        year: parseInt(match[4]) || 0,
                        url: match[1].startsWith('http') ? match[1] : host + match[1],
                        img: match[2].startsWith('http') ? match[2] : host + match[2],
                        source: 'kinokrad'
                    });
                }
                onResult(results);
            }, { timeout: 10 });
        }

        function content(href, onResult) {
            Lampa.api(href, function (html) {
                if (!html) return onResult(null);

                var title = 'Фильм';
                var titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
                if (titleMatch) title = titleMatch[1].trim();

                // Ищем iframe — основной способ показа на Kinokrad
                var iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
                if (!iframeMatch) {
                    // Альтернатива: data-player (редко, но бывает)
                    var dataPlayer = html.match(/data-player="([^"]+)"/);
                    if (dataPlayer) {
                        var playerUrl = dataPlayer[1];
                        if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
                        else if (!playerUrl.startsWith('http')) playerUrl = host + playerUrl;
                        return onResult({
                            title: title,
                            sources: [{ url: playerUrl, title: 'Плеер' }]
                        });
                    }
                    return onResult(null);
                }

                var playerUrl = iframeMatch[1];
                if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
                else if (playerUrl.startsWith('/')) playerUrl = host + playerUrl;

                onResult({
                    title: title,
                    sources: [{ url: playerUrl, title: 'Основной' }]
                });
            }, { timeout: 10 });
        }

        return {
            search: search,
            content: content
        };
    }

    if (typeof Lampa !== 'undefined' && Lampa.Manifest) {
        Lampa.Manifest.add('kinokrad', Component);
    }
})();
