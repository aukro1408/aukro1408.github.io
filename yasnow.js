(function() {
    const pluginName = 'SnowEffect';
    
    // Настройки снега
    const snowConfig = {
        count: 50,          // количество снежинок
        minSize: 5,       // минимальный размер
        maxSize: 15,      // максимальный размер
        minSpeed: 0.5,  // минимальная скорость падения
        maxSpeed: 2.0,  // максимальная скорость падения
        wind: 0.3         // сила «ветра» (горизонтальное смещение)
    };

    let snowflakes = [];
    let container;

    // Создаём снежинку
    function createSnowflake() {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.position = 'fixed';
        flake.style.pointerEvents = 'none';
        flake.style.zIndex = '9999';
        flake.style.width = `${Math.random() * (snowConfig.maxSize - snowConfig.minSize) + snowConfig.minSize}px`;
        flake.style.height = flake.style.width;
        flake.style.background = 'white';
        flake.style.borderRadius = '50%';
        flake.style.opacity = '0.8';
        flake.style.left = `${Math.random() * window.innerWidth}px`;
        flake.style.top = '-20px';
        flake.speed = Math.random() * (snowConfig.maxSpeed - snowConfig.minSpeed) + snowConfig.minSpeed;
        flake.wind = (Math.random() - 0.5) * snowConfig.wind;

        document.body.appendChild(flake);
        return flake;
    }

    // Обновляем позицию снежинки
    function updateSnowflake(flake) {
        let top = parseInt(flake.style.top);
        let left = parseInt(flake.style.left);

        top += flake.speed;
        left += flake.wind;

        // Если снежинка ушла за нижний край — возвращаем наверх
        if (top > window.innerHeight) {
            top = -20;
            left = Math.random() * window.innerWidth;
        }

        // Если ушла за края по горизонтали — корректируем
        if (left < 0) left = 0;
        if (left > window.innerWidth) left = window.innerWidth;

        flake.style.top = `${top}px`;
        flake.style.left = `${left}px`;
    }

    // Основной цикл анимации
    function animate() {
        snowflakes.forEach(updateSnowflake);
        requestAnimationFrame(animate);
    }

    // Инициализация плагина
    function init() {
        container = document.querySelector('.content') || document.body;

        // Создаём снежинки
        for (let i = 0; i < snowConfig.count; i++) {
            snowflakes.push(createSnowflake());
        }

        // Запускаем анимацию
        animate();
    }

    // Регистрация плагина в Lampa
    window.Lampa?.Plugin?.add({
        name: pluginName,
        init: init,
        destroy: function() {
            snowflakes.forEach(flake => flake.remove());
            snowflakes = [];
        }
    });
})();
