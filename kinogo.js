// ==addon==
// name: KinoGo
// type: movie
// icon: https://kinogo.no/templates/kinogo/images/favicon.png
// version: 1.0
// ==/addon==

var addon = {
    title: 'KinoGo',
    type: 'movie',
    id: 'kinogo',
    host: 'https://kinogo.no',

    search: function(query, page, callback) {
        var url = this.host + '/search/?q=' + encodeURIComponent(query);
        Lampa.api(url, function(html) {
            if (!html) return callback([]);

            var results = [];
            var matches = html.matchAll(/<div class="th-item">.*?href="([^"]+)".*?<img src="([^"]+)".*?<div class="th-title">([^<]+)<\/div>.*?<div class="th-year">(\d{4})<\/div>/gs);
            for (var match of matches) {
                results.push({
                    title: match[3].trim(),
                    year: parseInt(match[4]) || 0,
                    url: match[1].startsWith('http') ? match[1] : addon.host + match[1],
                    img: match[2].startsWith('http') ? match[2] : addon.host + match[2],
                    source: 'kinogo'
                });
            }
            callback(results);
        }, { timeout: 10 });
    },

    content: function(href, callback) {
        Lampa.api(href, function(html) {
            if (!html) return callback(null);

            var titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
            var title = titleMatch ? titleMatch[1].trim() : 'Фильм';

            var iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
            if (!iframeMatch) return callback(null);

            var playerUrl = iframeMatch[1];
            if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
            else if (playerUrl.startsWith('/')) playerUrl = addon.host + playerUrl;

            callback({
                title: title,
                sources: [{ url: playerUrl, title: 'Основной плеер' }]
            });
        }, { timeout: 10 });
    }
};
