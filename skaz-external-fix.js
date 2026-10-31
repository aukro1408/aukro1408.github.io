// skaz-external-fix v1 — прокладка для плагина skaz.tv/amedia/a.js.
//
// Проблема: amedia при запуске жёстко ставит inner: true и player_external: false,
// поэтому Лампа играет его только встроенным плеером, игнорируя настройку «Тип плеера».
// Этот плагин перехватывает Lampa.Player.play и только для таких объектов
// (inner + player_external: false) снимает запрет и явно указывает внешний плеер
// (launch_player: 'android') — тот самый механизм, которым Лампа запускает внешний
// плеер на Android. Остальные источники не трогаются.
// Код самого amedia не копируется и не меняется — правится только объект запуска на лету.
// Удаление этого плагина возвращает поведение как было.
(function () {
    'use strict';
    if (window.__skaz_external_fix) return;
    window.__skaz_external_fix = true;

    function patch() {
        try {
            if (!window.Lampa || !Lampa.Player || typeof Lampa.Player.play !== 'function') {
                setTimeout(patch, 500);
                return;
            }
            var originalPlay = Lampa.Player.play;
            Lampa.Player.play = function (data) {
                try {
                    if (data && data.player_external === false && data.inner === true) {
                        var fixed = {};
                        for (var key in data) {
                            if (Object.prototype.hasOwnProperty.call(data, key)) fixed[key] = data[key];
                        }
                        delete fixed.inner;
                        delete fixed.player_external;
                        fixed.launch_player = 'android';
                        data = fixed;
                    }
                } catch (e) {}
                return originalPlay.call(this, data);
            };
        } catch (e) {}
    }

    patch();
})();
