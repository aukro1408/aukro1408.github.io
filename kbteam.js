(function () {
    'use strict';

    console.log('KBTeam plugin loaded');

    if (window.Lampa) {
        Lampa.Noty.show('KBTeam OK');
    } else {
        alert('KBTeam OK');
    }

})();
