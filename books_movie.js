(function () {
    'use strict';

    function BookBridge() {
        let network = new Lampa.Reguest();

        this.init = function () {
            Lampa.Listener.follow('full', (e) => {
                if (e.type === 'complite' || e.type === 'render') {
                    let card = e.data.movie;
                    let title = card.title || card.original_title;

                    if (!title) return;

                    // Заранее ищем книгу в фоновом режиме для этой карточки
                    this.searchBook(title, (book) => {
                        let $render = e.object.activity.render();
                        this.addButton($render, book, title);
                    });
                }
            });
        };

        this.searchBook = function (title, callback) {
            let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=3`;
            
            network.silent(url, (data) => {
                if (data && data.items && data.items.length > 0) {
                    let found = data.items.find(item => item.volumeInfo && item.volumeInfo.authors) || data.items[0];
                    callback(found.volumeInfo);
                } else {
                    callback(null);
                }
            }, () => {
                callback(null);
            });
        };

        this.addButton = function ($render, book, title) {
            // Защита от дублирования кнопки
            if ($render.find('.book-bridge-btn').length > 0) return;

            // Создаем кнопку в стиле иконок действий Lampa
            let btn = $(`
                <div class="full-start__button selector book-bridge-btn" style="display: inline-flex; align-items: center; justify-content: center; min-width: 50px; height: 50px; background: rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; padding: 0 12px; gap: 8px; margin-left: 10px;">
                    <span style="font-size: 22px;">📖</span>
                </div>
            `);

            // При нажатии (или клике с пульта) открываем модальное окно
            btn.on('hover:enter', () => {
                if (book) {
                    this.showModal(book);
                } else {
                    Lampa.Noty.show('Книга-первоисточник не найдена');
                }
            });

            // Вставляем кнопку в панель действий карточки
            let actionsContainer = $render.find('.full-start__actions');
            if (actionsContainer.length) {
                actionsContainer.append(btn);
            }
        };

        this.showModal = function (book) {
            let html = $(`
                <div class="book-bridge-modal" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px; color: #fff;">
                    ${book.imageLinks && book.imageLinks.thumbnail ? `<img src="${book.imageLinks.thumbnail}" style="width: 130px; border-radius: 6px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">` : ''}
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                        <div style="font-size: 1.3em; font-weight: bold; color: #f39c12;">${book.title} ${book.publishedDate ? '(' + book.publishedDate.substring(0, 4) + ')' : ''}</div>
                        <div style="font-size: 1.05em; opacity: 0.9;"><b>Автор:</b> ${book.authors ? book.authors.join(', ') : 'Не указан'}</div>
                        <div style="font-size: 0.95em; opacity: 0.7; max-height: 250px; overflow-y: auto; line-height: 1.4;">
                            ${book.description || 'Описание отсутствует.'}
                        </div>
                        <div style="margin-top: 10px;">
                            <div class="button selector book-bridge-read-modal" style="display: inline-block; padding: 10px 20px; background: #27ae60; color: #fff; border-radius: 6px; cursor: pointer; text-align: center; font-weight: bold;">
                                Найти и читать в сети
                            </div>
                        </div>
                    </div>
                </div>
            `);

            // Кнопка поиска книги в интернете
            html.find('.book-bridge-read-modal').on('hover:enter', () => {
                let searchQuery = encodeURIComponent(book.title + ' ' + (book.authors ? book.authors[0] : '') + ' читать онлайн');
                let searchUrl = `https://www.google.com/search?q=${searchQuery}`;
                
                if (window.shell && window.shell.openExternal) {
                    window.shell.openExternal(searchUrl);
                } else {
                    window.open(searchUrl, '_blank');
                }
            });

            // Открываем через стандартный менеджер модальных окон Lampa
            Lampa.Modal.open({
                title: '📖 Литературный первоисточник',
                html: html,
                size: 'large',
                onBack: () => {
                    Lampa.Modal.close();
                }
            });
        };
    }

    if (!window.plugin_book_bridge_ready) {
        window.plugin_book_bridge_ready = true;
        let plugin = new BookBridge();
        plugin.init();
    }
})();
