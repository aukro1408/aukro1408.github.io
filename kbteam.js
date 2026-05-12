(function () {
    'use strict';

    function startPlugin() {

        Lampa.Noty.show('KBTeam API test');

        fetch('http://kb-team.club/msx/kinozal/videocdn.php?act=search&query=matrix')
            .then(function (resp) {
                return resp.text();
            })
            .then(function (text) {

                console.log('KBTEAM RESPONSE:', text);

                Lampa.Noty.show('KBTeam response OK');

            })
            .catch(function (err) {

                console.log(err);

                Lampa.Noty.show('KBTeam request error');

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
