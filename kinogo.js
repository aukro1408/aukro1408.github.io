// ==addon==
// name: KinoGo
// type: movie
// icon: https://kinogo.no/templates/kinogo/images/favicon.png
// version: 1.1
// ==/addon==

var addon = {
    title: 'KinoGo',
    type: 'movie',
    id: 'kinogo',
    api: 'https://kinogo.no',

    search: function(query, page, callback) {
        let url = this.api + '/search/?q=' + encodeURIComponent(query);

        Lampa.api(url, (html) => {
            if (!html) {
                callback([]);
                return;
            }

            let results = [];
            let matches = html.matchAll(/<div class="th-item">.*?href="([^"]+)"[^>]*>.*?<img src="([^"]+)"[^>]*>.*?<div class="th-title">([^<]+)<\/div>.*?<div class="th-year">(\d{4})<\/div>/gs);

            for (let match of matches) {
                results.push({
                    title: match[3].trim(),
                    year: parseInt(match[4]) || 0,
                    url: match[1].startsWith('http') ? match[1] : this.api + match[1],
                    img: match[2].startsWith('http') ? match[2] : this.api + match[2],
                    source: 'kinogo'
                });
            }

            callback(results);
        }, { timeout: 10 });
    },

    content: function(href, callback) {
        Lampa.api(href, (html) => {
