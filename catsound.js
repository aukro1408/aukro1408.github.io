// === Плагин "Кот приветствует" для Lampa ===
(function(){
    const PLUGIN_ID = 'lampa-cat-welcome';
    if(window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    // 🐱 Звуки (используются свободные mp3 с jsDelivr)
    const meowSound = new Audio('https://cdn.jsdelivr.net/gh/naptha/tinyfiles@master/cat-meow.mp3');
    const purrSound = new Audio('https://cdn.jsdelivr.net/gh/naptha/tinyfiles@master/cat-purr.mp3');

    // Настройки громкости и поведения
    meowSound.volume = 0.6;
    purrSound.volume = 0.4;
    purrSound.loop = true;

    // ⏳ Функция запуска звуков
    function startCatSound(){
        try {
            meowSound.play().then(()=>{
                setTimeout(()=>{
                    purrSound.play();
                    setTimeout(()=>{
                        purrSound.pause();
                        purrSound.currentTime = 0;
                    }, 5000); // мурлычет 5 секунд
                }, 1000); // через секунду после "мяу"
            });
        } catch(e) {
            console.log('Cat sound error:', e);
        }
    }

    // 🔊 Запуск один раз при старте Lampa
    window.addEventListener('load', ()=>{
        if(!localStorage.getItem('cat_welcome_played')){
            startCatSound();
            localStorage.setItem('cat_welcome_played','1');
        }
    });
})();
