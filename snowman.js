// festive_snow_fixed.js
(function () {
    if (window.__lampa_festive_snow_inited) return;
    window.__lampa_festive_snow_inited = true;

    var cfg = {
        density: 60,
        minSize: 32,
        maxSize: 56,
        speedFactor: 0.75,
        windStrength: 0.5,
        accumulation: false
    };

    // 🔗 Надёжные PNG с прозрачным фоном (размещены на GitHub)
    var imageUrls = [
        'https://raw.githubusercontent.com/aukro1408/lampa-festive-snow/main/snowman.png',     // Снеговик
        'https://raw.githubusercontent.com/aukro1408/lampa-festive-snow/main/santa.png',       // Санта
        'https://raw.githubusercontent.com/aukro1408/lampa-festive-snow/main/reindeer.png',    // Олень
        'https://raw.githubusercontent.com/aukro1408/lampa-festive-snow/main/grinch.png'       // Гринч
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
                speedY: rand(0.8, 1.5) * cfg.speedFactor,
                speedX: rand(-cfg.windStrength, cfg.windStrength),
                swingPhase: rand(0, Math.PI * 2),
                rotation: 0,
                rotationSpeed: rand(-0.005, 0.005)
            });
        }
    }
    initElements();

    function drawElement(el, dt) {
        if (loadedCount < images.length) return;

        el.y += el.speedY * dt;
        el.x += Math.sin(performance.now() / 1000 + el.swingPhase) * 0.7 + el.speedX * dt;
        el.rotation += el.rotationSpeed * dt;

        if (el.x < -100) el.x = canvas.width + 50;
        if (el.x > canvas.width + 100) el.x = -50;
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

    console.info('Lampa Festive Snow FIXED: Santa, Snowman, Reindeer, Grinch ✅');
})();
