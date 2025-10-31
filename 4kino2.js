async playMovie(card) {
    try {
        const title = card.title || card.name || 'Неизвестно';
        console.log('[4Kino] Запрос фильма:', title);
        Lampa.Noty.show(`Поиск: ${title}`);

        Lampa.Loading.start(() => {
            Lampa.Loading.stop();
            Lampa.Controller.toggle('content');
        });

        // Парсим главную — это всё, что есть
        const html = await new Promise((resolve, reject) => {
            this.network.silent(API_URL, resolve, reject);
        });

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const query = title.toLowerCase();
        let found = false;

        const images = doc.querySelectorAll('img[src*="/uploads/"]');
        for (const img of images) {
            const alt = (img.alt || img.title || '').toLowerCase();
            if (alt.includes(query)) {
                found = true;
                Lampa.Noty.show(`Найдено: ${alt}`);
                console.log('[4Kino] Совпадение:', alt);
                // Открываем сайт, потому что видео нет
                setTimeout(() => {
                    Lampa.Utils.open(API_URL);
                    Lampa.Loading.stop();
                }, 1500);
                return;
            }
        }

        if (!found) {
            Lampa.Noty.show('Не найдено на 4Kino');
            console.log('[4Kino] Не найдено');
        }
        Lampa.Loading.stop();

    } catch (error) {
        console.error('[4Kino] Ошибка:', error);
        Lampa.Noty.show('Ошибка: ' + (error.message || 'сеть'));
        Lampa.Loading.stop();
    }
}
