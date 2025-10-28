// === Плагин "Британский котик v2" для Lampa ===
(function(){
    const PLUGIN_ID = 'lampa-british-cat-v2';
    if(window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    // ✅ Надёжные изображения (загружаются напрямую)
    const catImgUrl = 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/64/cat.png';
    const houseImgUrl = 'https://raw.githubusercontent.com/iconic/open-iconic/master/png/home-8x.png';

    const container = document.createElement('div');
    Object.assign(container.style,{
        position:'fixed',
        left:'0', top:'0',
        width:'100%', height:'100%',
        pointerEvents:'none',
        zIndex:'99999',
    });
    document.body.appendChild(container);

    const cat = document.createElement('img');
    cat.src = catImgUrl;
    Object.assign(cat.style,{
        position:'absolute',
        width:'80px',
        transition:'all 0.25s linear',
        filter:'drop-shadow(0 0 4px rgba(0,0,0,0.4))'
    });
    container.appendChild(cat);

    const house = document.createElement('img');
    house.src = houseImgUrl;
    Object.assign(house.style,{
        position:'absolute',
        bottom:'10px',
        right:'10px',
        width:'90px',
        opacity:'0.9'
    });
    container.appendChild(house);

    let catShown = false;
    const runTime = 10000; // кот бегает 10 секунд

    function getRandomPosition(){
        const x = Math.random() * (window.innerWidth - 100);
        const y = 50 + Math.random() * (window.innerHeight - 150);
        return {x,y};
    }

    function moveCat(){
        const pos = getRandomPosition();
        cat.style.left = pos.x + 'px';
        cat.style.top = pos.y + 'px';
        cat.style.transform = pos.x > parseFloat(cat.style.left || 0) ? 'scaleX(1)' : 'scaleX(-1)';
    }

    function goToHouse(){
        const rect = house.getBoundingClientRect();
        cat.style.left = rect.left + 'px';
        cat.style.top = rect.top + 'px';
        setTimeout(()=>{
            cat.style.opacity = '0';
            setTimeout(()=>container.remove(), 2000);
        }, 2000);
    }

    function startCat(){
        if(catShown) return;
        catShown = true;

        const startPos = getRandomPosition();
        cat.style.left = startPos.x + 'px';
        cat.style.top = startPos.y + 'px';
        cat.style.opacity = '1';

        let interval = setInterval(moveCat, 900);
        setTimeout(()=>{
            clearInterval(interval);
            goToHouse();
        }, runTime);
    }

    // Запуск котика после загрузки Lampa
    window.addEventListener('load', startCat);
})();
