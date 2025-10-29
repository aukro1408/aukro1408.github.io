(function () {
    'use strict';

    const baseurl = 'https://4kino.cc';

    function request(url, onSuccess, onError) {
        fetch(url, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml'
            }
        })
        .then(r => r.text())
        .then(onSuccess)
        .catch(onError);
    }

    function parseMoviePage(html) {
        let title = (html.match(/<h1[^>]*>(.*?)<\/h1>/) || [])[1];
        let poster = (html.match(/<img[^>]+src="([^"]+)"[^>]*class="[^"]*poster[^"]*"/) || [])[1];
        let iframe = (html.match(/<iframe[^>]+src="([^"]+)"/) || [])[1];
        return { title, poster, iframe };
    }

    function showMovie(item) {
        Lampa.Loading.start();

        request(baseurl + item.url, (html) => {
            let movie = parseMoviePage(html);
            Lampa.Loading.stop();

            if (movie.iframe) {
                Lampa.Player.play({
                    title: movie.title || item.title,
                    url: movie.iframe,
                    poster: movie.poster
                });
            } else {
                Lampa.Noty.show('Не найден iframe');
            }
        }, () => {
            Lampa.Loading.stop();
            Lampa.Noty.show('Ошибка загрузки страницы фильма');
        });
    }

    function start() {
        Lampa.Noty.show('Плагин 4Kino загружен ✅');

        Lampa.Source.add('4kino', {
            title: '4Kino.cc',
            search: function (query, call, fail) {
                const url = `${baseurl}/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`;

                request(url, (html) => {
                    const regex = /<a href="(\/\d+[^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<div[^>]+class="name"[^>]*>(.*?)<\/div>/g;
                    let results = [];
                    let match;

                    while ((match = regex.exec(html))) {
                        results.push({
                            title: match[3],
                            url: match[1],
                            poster: match[2],
                            callback: showMovie
                        });
                    }

                    if (results.length) call(results);
                    else fail('Ничего не найдено');
                }, () => fail('Ошибка сети'));
            }
        });
    }

    if (window.Lampa && Lampa.Source) {
        Lampa.Plugin.create({
            title: '4Kino.cc',
            author: 'Денис',
            version: '1.2.0',
            description: 'Источник фильмов и сериалов с сайта 4kino.cc',
            onStart: start,
            onStop: function () {
                Lampa.Source.remove('4kino');
            }
        });
    } else {
        console.error('Lampa API не найден — попробуй перезапустить приложение');
    }
})();
