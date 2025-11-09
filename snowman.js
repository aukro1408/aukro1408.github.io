// ==addon==
// name: Праздничный Снег
// type: ui
// version: 1.0
// ==/addon==

(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Listener) return;

    var container = null;
    var active = false;
    var flakes = [];
    var images = [
        'https://cdn-icons-png.flaticon.com/512/2539/2539356.png', // Snowman
        'https://cdn-icons-png.flaticon.com/512/2539/2539309.png', // Santa
        'https://cdn-icons-png.flaticon.com/512/3074/3074577.png', // Reindeer
        'https://cdn-icons-png.flaticon.com/512/8261/8261326.png'  // Grinch
    ];

    function createFlake() {
        if (!active) return;

        var img = document.createElement('img');
        img.src = images[Math.floor(Math.random() * images.length)];
        img.style.position = 'fixed';
        img.style.pointerEvents = 'none';
        img.style.zIndex = '999999';
        img.style.width = (20 + Math.random() * 30) + 'px';
        img.style.opacity = '0.85';
        img.style.top = '-50px';
        img.style.left = Math.random() * window.innerWidth + 'px';

        document.body.appendChild(img);

        var speed = 2 + Math.random() * 3;
        var drift = (Math.random() - 0.5) * 2;
        var startX = parseFloat(img.style.left);

        flakes.push({
            el: img,
            speed: speed,
            drift: drift,
            x: startX,
            y: -50
        });
    }

    function animate() {
        if (!active) return;

        for (var i = flakes.length - 1; i >= 0; i--) {
            var flake = flakes[i];
            flake.y += flake.speed;
            flake.x += flake.drift;

            flake.el.style.top = flake.y + 'px';
            flake.el.style.left = flake.x + 'px';

            if (flake.y > window.innerHeight || flake.x < -100 || flake.x > window.innerWidth + 100) {
                flake.el.remove();
                flakes.splice(i, 1);
            }
        }

        if (Math.random() < 0.3 && flakes.length < 30) {
            createFlake();
        }

        requestAnimationFrame(animate);
    }

    function start() {
        if (active) return;
        active = true;
        container = document.createElement('div');
        container.id = 'festive-snow-overlay';
        document.body.appendChild(container);
        animate();
    }

    function stop() {
        active = false;
        if (container) {
            container.remove();
            container = null;
        }
        flakes.forEach(f => f.el.remove());
        flakes = [];
    }

    // Запуск при загрузке главного экрана
    Lampa.Listener.follow('main', start);
    Lampa.Listener.follow('destroy', stop);

    // Дополнительно: можно добавить в меню
    Lampa.Listener.follow('toggle', function (name) {
        if (name === 'festive_snow_toggle') {
            if (active) {
                stop();
            } else {
                start();
            }
        }
    });

    // Регистрация (необязательно для UI-аддонов, но для порядка)
    if (Lampa.Manifest) {
        Lampa.Manifest.add('festive_snow', function() { return {}; });
    }
})();
