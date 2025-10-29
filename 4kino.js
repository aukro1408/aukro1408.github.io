(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var baseurl = 'https://4kino.cc';

    function parseMoviePage(html) {
        var data = {};

        try {
            data.title = html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1]?.trim();
            data.poster = html.match(/<img[^>]+src="([^"]+)"[^>]+class="[^"]*poster[^"]*"/)?.[1];
            data.description = html.match(/<div[^>]+class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1]?.replace(/<[^>]+>/g, '').trim();
            data.iframe = html.match(/<iframe[^>]+src="([^"]+)"[^>]*>/)?.[1];
        } catch (e) {
            console.error('Ошибка парсинга:', e);
        }

        return data;
    }

    function showMovie(item) {
        network.silent(baseurl + item.url, (html) => {
            var movie = parseMoviePage(html);

            Lampa.Player.play({
                title: movie.title || item.title,
                url: movie.iframe,
                poster: movie.poster,
                subtitles: []
            });
        }, () => {
            Lampa.Noty.show('Ошибка загрузки страницы фильма');
        });
    }

    function start() {
        Lampa.Source.add('4kino', {
            title: '4Kino',
            search: function (query, call) {
                var url = baseurl + '/index.php?do=search&subaction=search&story=' + encodeURIComponent(query);

                network.silent(url, (html) => {
                    var results = [];
                    var regex = /<a href="(\/\d+[^"]+)"[^>]*>(?:\s*<img[^>]+src="([^"]+)"[^>]*>).*?<div[^>]+class="name"[^>]*>(.*?)<\/div>/g;
                    var match;

                    while ((match = regex.exec(html))) {
                        results.push({
                            title: match[3],
                            url: match[1],
                            poster: match[2],
                            info: '',
                            quality: '',
                            year: '',
                            callback: showMovie
                        });
                    }

                    call(results);
                }, () => {
                    Lampa.Noty.show('Ошибка поиска на 4kino.cc');
                });
            }
        });
    }

    Lampa.Plugin.create({
        title: '4Kino.cc',
        author: 'Денис',
        version: '1.0.0',
        description: 'Источник фильмов и сериалов с 4kino.cc',
        onStart: start
    });
})();
