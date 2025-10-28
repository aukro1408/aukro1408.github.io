// === Плагин "Избранные актёры" для Lampa ===
// Автор: ChatGPT / GPT-5
(function(){
    const ID = 'favorite-actors-plugin';
    if (window[ID]) return;
    window[ID] = true;

    const STORAGE_KEY = 'lampa_favorite_actors_v1';
    let favorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    function saveFavorites() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }

    function isFavorite(id) {
        return favorites.some(a => a.id === id);
    }

    function addFavorite(actor) {
        if (!isFavorite(actor.id)) {
            favorites.push(actor);
            saveFavorites();
            Lampa.Noty.show('Добавлено в избранные актёры');
        }
    }

    function removeFavorite(id) {
        favorites = favorites.filter(a => a.id !== id);
        saveFavorites();
    }

    // --- Добавляем кнопку "В избранные" в карточку актёра ---
    function extendActorCard() {
        const orig = Lampa.Activity.prototype.start;
        Lampa.Activity.prototype.start = function(){
            orig.call(this);
            if (this.activity && this.activity.component === 'actor') {
                const actor = this.activity.data;
                setTimeout(() => {
                    const container = document.querySelector('.actor__buttons') || document.querySelector('.full-start__buttons');
                    if (container && !container.querySelector('.fav-actor-btn')) {
                        const btn = document.createElement('div');
                        btn.className = 'simple-button selector fav-actor-btn';
                        btn.textContent = isFavorite(actor.id) ? '⭐ Удалить из избранных' : '⭐ В избранные';
                        btn.addEventListener('click', () => {
                            if (isFavorite(actor.id)) {
                                removeFavorite(actor.id);
                                btn.textContent = '⭐ В избранные';
                                Lampa.Noty.show('Удалено из избранных актёров');
                            } else {
                                addFavorite({ id: actor.id, name: actor.name, image: actor.image });
                                btn.textContent = '⭐ Удалить из избранных';
                            }
                        });
                        container.appendChild(btn);
                    }
                }, 800);
            }
        };
    }

    // --- Создаём раздел "Избранные актёры" в меню ---
    function createMenuItem() {
        const menu = Lampa.Menu;
        const icon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.73L5.82 21z"/></svg>';
        menu.add({
            id: ID,
            title: '⭐ Избранные актёры',
            icon,
            action: openFavoriteActors
        });
    }

    // --- Открываем экран со списком актёров ---
    function openFavoriteActors() {
        const list = new Lampa.Activity({
            title: '⭐ Избранные актёры',
            component: ID,
            background: true
        });

        list.create = function() {
            this.activity.loader(true);
            const html = Lampa.Template.get('list_empty', {});
            const scroll = new Lampa.Scroll(html);
            this.render().appendChild(scroll.render(true));
            const body = scroll.body();

            function renderList() {
                body.innerHTML = '';
                if (favorites.length === 0) {
                    body.insertAdjacentHTML('beforeend', '<div class="empty">Нет избранных актёров</div>');
                    return;
                }
                favorites.forEach(actor => {
                    const item = document.createElement('div');
                    item.className = 'selector item--actor';
                    item.innerHTML = `
                        <div class="item__image" style="background-image:url('${actor.image || ''}')"></div>
                        <div class="item__title">${actor.name}</div>
                        <div class="item__icons">
                            <div class="item__icon remove" title="Удалить">✖</div>
                        </div>
                    `;
                    item.querySelector('.remove').addEventListener('click', (e)=>{
                        e.stopPropagation();
                        removeFavorite(actor.id);
                        renderList();
                    });
                    item.addEventListener('click', ()=>{
                        openActorContent(actor);
                    });
                    body.appendChild(item);
                });
                scroll.reset();
            }

            renderList();
            this.activity.loader(false);
        };

        Lampa.Activity.push(list);
    }

    // --- Открыть фильмы и сериалы актёра ---
    function openActorContent(actor) {
        const search = new Lampa.Activity({
            title: `🎬 ${actor.name}`,
            component: 'actor_search',
            background: true
        });

        search.create = function() {
            this.activity.loader(true);
            Lampa.Api.search({ query: actor.name }, (result)=>{
                this.activity.loader(false);
                const scroll = new Lampa.Scroll(Lampa.Template.get('items_line', {}));
                this.render().appendChild(scroll.render(true));
                const body = scroll.body();

                if (!result || !result.results || !result.results.length) {
                    body.insertAdjacentHTML('beforeend', '<div class="empty">Ничего не найдено</div>');
                    return;
                }

                result.results.forEach(movie=>{
                    const item = Lampa.Template.get('card', movie);
                    body.appendChild(item);
                    Lampa.Card.render(item, movie);
                });
                scroll.reset();
            }, ()=>{
                this.activity.loader(false);
                this.render().insertAdjacentHTML('beforeend', '<div class="empty">Ошибка поиска</div>');
            });
        };

        Lampa.Activity.push(search);
    }

    // --- Инициализация ---
    Lampa.Plugin.create(ID, {
        title: '⭐ Избранные актёры',
        version: '1.0',
        description: 'Добавляет избранных актёров и поиск их фильмов в каталоге Lampa',
        author: 'ChatGPT',
        onStart() {
            extendActorCard();
            createMenuItem();
            console.log('Плагин "Избранные актёры" запущен');
        },
    });
})();
