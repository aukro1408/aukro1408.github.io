// === Плагин "Британский котик" для Lampa ===
(function(){
    const PLUGIN_ID = 'lampa-british-cat';
    if(window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    const catImgUrl = 'https://i.ibb.co/0FJ7kRt/british-cat.png'; // пример изображения кота
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
    cat.style.position = 'absolute';
    cat.style.width = '80px';
    cat.style.transition = 'all 0.1s linear';
    container.appendChild(cat);

    const house = document.createElement('div');
    Object.assign(house.style,{
        position:'absolute',
        bottom:'10px',
        right:'10px',
        width:'100px',
        height:'80px',
        background:'url(https://i.ibb.co/7tLJ3P0/cat-house.png) no-repeat center/contain'
    });
    container.appendChild(house);

    let catShown = false;
    const runTime = 10000; // 10 секунд бегает

    function getRandomPosition(){
        const x = Math.random() * (window.innerWidth - 80);
        const y = 50 + Math.random() * (window.innerHeight - 150);
        return {x,y};
    }

    function moveCat(){
        const pos = getRandomPosition();
        cat.style.left = pos.x + 'px';
        cat.style.top = pos.y + 'px';
    }

    function goToHouse(){
        const rect = house.getBoundingClientRect();
        cat.style.left = rect.left + 'px';
        cat.style.top = rect.top + 'px';
        setTimeout(()=>{
            cat.style.display = 'none';
        }, 2000); // кот спит 2 секунды перед исчезновением
    }

    function startCat(){
        if(catShown) return;
        catShown = true;

        // кот появляется
        const startPos = getRandomPosition();
        cat.style.left = startPos.x + 'px';
        cat.style.top = startPos.y + 'px';

        // бегает 10 секунд
        let interval = setInterval(moveCat, 800);
        setTimeout(()=>{
            clearInterval(interval);
            goToHouse();
        }, runTime);
    }

    // стартуем после полной загрузки Lampa
    window.addEventListener('load', startCat);
})();
