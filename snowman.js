// festive_snow_lampa.js
(function () {
    if (window.__lampa_festive_snow_inited) return;
    window.__lampa_festive_snow_inited = true;

    // --- Настройки ---
    var cfg = {
        density: 80,            // количество элементов (меньше, чем снежинок — иначе будет перегруз)
        minSize: 24,            // минимальная высота (px)
        maxSize: 48,            // максимальная высота
        speedFactor: 0.8,       // скорость падения
        windStrength: 0.6,      // сила ветра (горизонтальное колебание)
        accumulation: false     // накопление не реализовано для изображений (можно включить фоновый снег отдельно)
    };

    // --- Изображения (PNG с прозрачностью) ---
    var imageUrls = [
        'https://cdn-icons-png.flaticon.com/512/2539/2539356.png', // Snowman
        'https://cdn-icons-png.flaticon.com/512/2539/2539309.png', // Santa
        'https://cdn-icons-png.flaticon.com/512/3074/3074577.png', // Reindeer
        'https://cdn-icons-png.flaticon.com/512/8261/8261326.png'  // Grinch
    ];

    var images = [];
    var loadedCount = 0;

    imageUrls.forEach(function (url, i) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = img.onerror = function () {
            images[i] = img;
            loadedCount++;
        };
        img.src = url;
    });

    // --- Canvas overlay ---
    var overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999999,
        overflow: 'hidden',
        background: 'transparent'
    });
    document.documentElement.appendChild(overlay);

    var canvas = document.createElement('canvas');
    overlay.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- Генерация элементов ---
    function rand(min, max) { return Math.random() * (max - min) + min; }

    var elements = [];
    function initElements() {
        elements = [];
        for (var i = 0; i < cfg.density; i++) {
            elements.push({
                x: rand(0, canvas.width),
                y: rand(-canvas.height, 0),
                imgIndex: Math.floor(rand(0, imageUrls.length)),
                size: rand(cfg.minSize, cfg.maxSize),
                speedY: rand(0.8, 1.6) * cfg.speedFactor,
                speedX: rand(-cfg.windStrength, cfg.windStrength),
                swingPhase: rand(0, Math.PI * 2),
                rotation: rand(0, Math.PI * 2),
                rotationSpeed: rand(-0.01, 0.01)
            });
        }
    }

    initElements();

    // --- Рисуем элемент ---
    function drawElement(el, dt) {
        if (loadedCount < images.length) return;

        el.y += el.speedY * dt;
        el.x += Math.sin(performance.now() / 1000 + el.swingPhase) * 0.8 + el.speedX * dt;
        el.rotation += el.rotationSpeed * dt;

        // Оборачиваем по горизонтали
        if (el.x < -100) el.x = canvas.width + 50;
        if (el.x > canvas.width + 100) el.x = -50;

        // Сбрасываем, если ушёл вниз
        if (el.y > canvas.height + 100) {
            el.y = rand(-100, -10);
            el.x = rand(0, canvas.width);
        }

        var img = images[el.imgIndex];
        if (!img || !img.complete) return;

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);
        ctx.drawImage(img, -el.size / 2, -el.size / 2, el.size, el.size);
        ctx.restore();
    }

    // --- Анимация ---
    var last = performance.now();
    function step(now) {
        var dt = (now - last) / 16.6667;
        last = now;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < elements.length; i++) {
            drawElement(elements[i], dt);
        }

        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    console.info('Lampa Festive Snow plugin initialized. 🎅🦌⛄🧝‍♂️');
})();
