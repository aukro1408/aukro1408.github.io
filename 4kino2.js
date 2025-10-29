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
        Lampa.Loading.start();

        network.silent(baseurl + item.url, (html) => {
            var movie = parseMoviePage(html);
            Lampa.Loading.stop();

            if (movie.iframe) {
                Lampa.Player.play({
                    title: movie.title || item.title,
                    url: movie.iframe,
                    poster: movie.poster,
                    subtitles: []
                });
            } else {
                Lampa.Noty.show('Не удалось найти плеер');
            }
        }, () => {
            Lampa.Loading.stop();
            Lampa.Noty.show('Ошибка загрузки фильма');
        });
    }

    function start() {
        Lampa.Source.add('4kino', {
            title: '4Kino.cc',
            search: function (query, call, fail) {
                var url = baseurl + '/index.php?do=search&subaction=search&story=' + encodeURIComponent(query);

                network.silent(url, (html) => {
                    var results = [];
                    var regex = /<a href="(\/\d+[^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<div[^>]+class="name"[^>]*>(.*?)<\/div>/g;
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

                    if (results.length) call(results);
                    else fail('Ничего не найдено на 4kino.cc');
                }, () => {
                    fail('Ошибка сети при поиске');
                });
            }
        });

        Lampa.Noty.show('Источник 4Kino.cc подключен ✅');
    }

    Lampa.Plugin.create({
        title: '4Kino.cc',
        author: 'Денис',
        version: '1.1.0',
        description: 'Источник фильмов и сериалов с 4kino.cc',
        onStart: start,
        onStop: function () {
            Lampa.Source.remove('4kino');
        }
    });
})();
