(function () {
    'use strict';
    if (window.lampaAIPlugin) return;
    window.lampaAIPlugin = true;

    var cfg = Lampa.Storage.get('lampa_ai_settings', { api: 'openai', key: '', model: 'gpt-4o' });

    function getAPIKey() { return String(cfg.key || '').trim(); }

    function requestAI(prompt) {
        var key = getAPIKey();
        if (!key && !confirm('Введи OpenAI/Yandex ключ в настройках плагина!')) return Promise.reject('Нет ключа');

        return fetch('https://api.openai.com/v1/chat/completions', {  // замени на Yandex/Grok если нужно
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: cfg.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        }).then(r => r.json()).then(data => data.choices[0].message.content);
    }

    function renderRecommendations(recs) {
        var html = '<div class="ai-recs-panel">' + recs.map(r => `
            <div class="ai-rec-card" style="background:url(${r.poster}) center/cover">
                <div class="ai-rec-title">${r.title}</div>
                <div>${r.year} • ${r.genres}</div>
                <button class="ai-watch-btn" data-tmdb="${r.tmdbId}">Смотреть в Lampa</button>
            </div>
        `).join('') + '</div>';

        var render = Lampa.Activity.active().activity.render();
        $(render).find('.footer__menu').prepend(html); // или в верхнее меню

        // клик на кнопку — открывает в Lampa (уже работает через Lampa.Activity.open)
        $('.ai-watch-btn').on('click', function() {
            var tmdb = $(this).data('tmdb');
            Lampa.Activity.open({ name: 'Movie', movie: { tmdb_id: tmdb } });
        });
    }

    // Главный хук — добавляем кнопку в любое видео
    Lampa.Action.add('ai-consult', 'AI Консультант', function() {
        var text = prompt('Что посмотреть?');
        if (!text) return;

        requestAI(text).then(res => {
            var recs = JSON.parse(res); // твой AI возвращает массив объектов
            renderRecommendations(recs);
        });
    });

    // Добавляем кнопку в нижнее меню
    $(document).on('activity.render', function(e, activity) {
        if (activity && activity.activity && activity.activity.name) {
            var footer = $(activity.activity.render()).find('.footer__menu');
            if (!footer.find('.ai-btn').length) {
                footer.prepend('<div class="menu__item ai-btn"><div class="menu__icon"><span class="icon-mic"></span></div><span>AI</span></div>');
                footer.find('.ai-btn').on('click', Lampa.Action.get('ai-consult'));
            }
        }
    });

    // Настройки (в меню плагинов)
    var settingsPage = Lampa.Activity.create('ai-settings', 'Настройки AI', `
        <div class="menu">
            <div class="menu__item"><input type="text" id="apiKey" placeholder="OpenAI ключ" value="${cfg.key}"></div>
            <div class="menu__item"><input type="text" id="model" placeholder="gpt-4o / gpt-4o-mini" value="${cfg.model}"></div>
            <div class="menu__item"><button onclick="saveAI()">Сохранить</button></div>
        </div>
    `);
    function saveAI() {
        cfg.key = $('#apiKey').val();
        cfg.model = $('#model').val();
        Lampa.Storage.set('lampa_ai_settings', cfg);
    }
})();
