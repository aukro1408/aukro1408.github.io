(function() {
    'use strict';

    var API_URL = 'https://4kino.cc';
    
    // Функция для создания HTTP запроса
    function httpGet(url, callback, error_callback) {
        var network = new Lampa.Reguest();
        network.native(url, function(data) {
            callback(data);
        }, function(err) {
            if (error_callback) error_callback(err);
        }, false, {
            dataType: 'text'
        });
    }
    
    // Поиск фильма
    function searchMovie(title, callback) {
        console.log('4Kino: Searching for:', title);
        
        var searchUrl = API_URL + '/index.php?do=search&subaction=search&story=' + encodeURIComponent(title);
        
        httpGet(searchUrl, function(html) {
            console.log('4Kino: Search completed');
            
            // Ищем ссылку на фильм
            var match = html.match(/href="(https?:\/\/4kino\.cc\/[0-9]+-[^"]+\.html)"/);
            if (!match) {
                match = html.match(/href="(\/[0-9]+-[^"]+\.html)"/);
                if (match) {
                    match[1] = API_URL + match[1];
                }
            }
            
            if (match) {
                console.log('4Kino: Found movie URL:', match[1]);
                callback(match[1]);
            } else {
                console.log('4Kino: Movie not found');
                callback(null);
            }
        }, function() {
            console.log('4Kino: Search failed');
            callback(null);
        });
    }
    
    // Получение плеера
    function getPlayer(movieUrl, callback) {
        console.log('4Kino: Getting player from:', movieUrl);
        
        httpGet(movieUrl, function(html) {
            console.log('4Kino: Page loaded');
            
            // Ищем iframe
            var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            
            if (iframeMatch) {
                console.log('4Kino: Found iframe:', iframeMatch[1]);
                callback(iframeMatch[1]);
            } else {
                console.log('4Kino: Player not found');
                callback(null);
            }
        }, function() {
            console.log('4Kino: Failed to load page');
            callback(null);
        });
    }
    
    // Воспроизведение
    function play(card) {
        console.log('4Kino: Play called for card:', card);
        
        Lampa.Loading.start(function() {
            Lampa.Loading.stop();
            Lampa.Controller.toggle('content');
        });
        
        var title = card.title || card.name || card.original_title || card.original_name;
        console.log('4Kino: Title:', title);
        
        Lampa.Noty.show('Ищем на 4Kino...');
        
        searchMovie(title, function(movieUrl) {
            if (!movieUrl) {
                Lampa.Noty.show('Фильм не найден на 4Kino');
                Lampa.Loading.stop();
                return;
            }
            
            Lampa.Noty.show('Загружаем плеер...');
            
            getPlayer(movieUrl, function(playerUrl) {
                Lampa.Loading.stop();
                
                if (!playerUrl) {
                    Lampa.Noty.show('Плеер не найден');
                    return;
                }
                
                console.log('4Kino: Opening player:', playerUrl);
                
                Lampa.Player.play({
                    url: playerUrl,
                    title: title
                });
                
                Lampa.Player.playlist([{
                    url: playerUrl,
                    title: title
                }]);
            });
        });
    }
    
    // Инициализация
    function init() {
        console.log('4Kino: Initializing plugin...');
        
        // Подписываемся на событие открытия карточки
        Lampa.Listener.follow('full', function(e) {
            console.log('4Kino: Full event:', e.type);
            
            if (e.type == 'complite') {
                console.log('4Kino: Card loaded, adding button');
                
                var card = e.data.movie;
                
                // Создаем кнопку
                var button = $('<div class="full-start__button selector view--torrent" data-source="4kino">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>' +
                    '<path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>' +
                    '</svg>' +
                    '<span>4Kino</span>' +
                    '</div>');
                
                // Обработчик клика
                button.on('hover:enter', function() {
                    console.log('4Kino: Button clicked');
                    play(card);
                });
                
                // Добавляем кнопку
                try {
                    var container = e.object.activity.render().find('.full-start__buttons');
                    
                    if (container.length > 0) {
                        container.append(button);
                        console.log('4Kino: Button added successfully');
                    } else {
                        console.log('4Kino: Container not found, trying alternative');
                        
                        // Альтернативный способ
                        $('.full-start__buttons').append(button);
                    }
                } catch(err) {
                    console.error('4Kino: Error adding button:', err);
                }
            }
        });
        
        console.log('4Kino: Plugin initialized');
    }
    
    // Запуск
    if (window.appready) {
        console.log('4Kino: App already ready, starting now');
        init();
    } else {
        console.log('4Kino: Waiting for app ready');
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                console.log('4Kino: App ready, starting plugin');
                init();
            }
        });
    }
    
    console.log('4Kino: Script loaded');

})();
