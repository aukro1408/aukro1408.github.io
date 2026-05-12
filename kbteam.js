(function () {
    'use strict';

    function search(query, callback) {

        fetch('http://kb-team.club/msx/kinozal/videocdn.php?act=search&query=' + encodeURIComponent(query))
            .then(function (resp) {
                return resp.json();
            })
            .then(function (json) {

                console.log('KBTEAM SEARCH:', json);

                var results = [];

                if (json && json.items) {

                    json.items.forEach(function (item) {

                        results.push({
                            title: item.title || item.label || 'No title',
                            original_title: item.original_title || '',
                            poster: item.poster || '',
                            backdrop: item.background || '',
                            year: item.year || '',
                            id: item.id || '',
                            source: 'KBTeam'
                        });

                    });

                }

                callback(results);

            })
            .catch(function (err) {

                console.log(err);

                callback([]);

            });

    }

    function startPlugin() {

        Lampa.Noty.show('KBTeam search loaded');

        search('matrix', function (results) {

            console.log('RESULTS:', results);

            Lampa.Noty.show('Found: ' + results.length);

        });

    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();
