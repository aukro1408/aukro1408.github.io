// === Плагин "Кот приветствует v2" ===
(function(){
    const PLUGIN_ID = 'lampa-cat-welcome-v2';
    if(window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    // 🐱 Звуки кота
    const meowSound = new Audio('https://cdn.jsdelivr.net/gh/naptha/tinyfiles@master/cat-meow.mp3');
    const purrSound = new Audio('https://cdn.jsdelivr.net/gh/naptha/tinyfiles@master/cat-purr.mp3');
    meowSound.volume = 0.6;
    purrSound.volume = 0.4;
    purrSound.loop = true;

    let played = false;

    function playCatSounds(){
        if(played) return;
        played = true;

        // "Мяу"
        meowSound.play().then(()=>{
            // Через секунду — "мур"
            setTimeout(()=>{
                purrSound.play();
                setTimeout(()=>{
                    purrSound.pause();
                    purrSound.currentTime = 0;
                }, 5000);
            }, 1000);
        }).catch(err=>{
            console.log('Котик не смог мяукнуть:', err);
        });
    }

    // 🔊 Звук активируется при первом взаимодействии
    function attachListeners(){
        ['click','keydown','mousemove','touchstart'].forEach(evt=>{
            document.addEventListener(evt, playCatSounds, { once: true });
        });
    }

    window.addEventListener('load', attachListeners);
})();
