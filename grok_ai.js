(function () {
    'use strict';
    if (window.lampaAIPlugin) return;
    window.lampaAIPlugin = true;

    var cfg = Lampa.Storage.get('lampa_ai_settings', {
        api: 'openai',
        key: '',
        model: 'gpt-4o'
    });

    function getAPIKey() {
        return String(cfg.key || '').trim();
    }

    function requestAI(prompt) {
        var key = getAPIKey();
        if (!key) {
            alert('❌ Введи API-ключ в настройках плагина!');
            return Promise.reject('NO_KEY');
        }

        return fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: cfg.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        }).then(r => r.json()).then(data => {
            if (!data.choices || !data.choices[0]) throw new Error('Нет ответа от AI');
            return data.choices[0].message.content;
        });
    }

    // Кнопка в нижнем меню (добавляется только если плагин активен)
    function addAIButton(render) {
        var footer = $(render).find('.footer__menu');
        if (footer.find('.ai-btn').length) return;

        footer.prepend(
            '<div class="menu__item ai-btn">' +
                '<div class="menu__icon"><span class="icon-mic"></span></div>' +
                '<span>AI</span>' +
            '</div>'
        );

        footer.find('.ai-btn').on('click', function() {
            var text = prompt('Что посмотреть? Например: "Рекомендуй как «Криминальное чтиво» но с юмором"');
            if (!text) return;

            requestAI(text).then(res => {
                try {
                    var recs = JSON.parse(res);
                    renderRecommendations(recs);
                } catch(e) {
                    alert('Ошибка AI: ' + res);
                }
            });
        });
    }

    function renderRecommendations(recs) {
        var html = recs.map(r => `
            <div class="ai-rec-card" style="background:url(${r.poster || ''}) center/cover">
                <div class="ai-rec-title">${r.title || ''}</div>
                <div>${r.year || ''} • ${r.genres || ''}</div>
                <button class="ai-watch-btn" data-tmdb="${r.tmdbId || ''}">Смотреть в Lampa</button>
            </div>
        `).join('');

        var render = Lampa.Activity.active().activity.render();
        if (!render) return;
        $(render).find('.footer__menu').prepend('<div class="ai-recs-panel">' + html + '</div>');

        $('.ai-watch-btn').on('click', function() {
            var tmdb = $(this).data('tmdb');
            if (tmdb) Lampa.Activity.open({ name: 'Movie', movie: { tmdb_id: tmdb } });
        });
    }

    // Добавляем кнопку в любое видео
    $(document).on('activity.render', function(e, activity) {
        if (activity && activity.activity) {
            var render = activity.activity.render();
            if (render) addAIButton(render);
        }
    });

    // Настройки (открывается из меню плагинов)
    var settings = Lampa.Activity.create('ai-settings', 'Настройки AI', `
        <div class="menu">
            <div class="menu__item">
                <input type="text" id="apiKey" placeholder="OpenAI / Yandex / Grok ключ" value="${cfg.key}">
            </div>
            <div class="menu__item">
                <input type="text" id="model" placeholder="gpt-4o или gpt-4o-mini" value="${cfg.model}">
            </div>
            <div class="menu__item">
                <button onclick="saveAISettings()">Сохранить</button>
            </div>
        </div>
    `);

    window.saveAISettings = function() {
        cfg.key = $('#apiKey').val();
        cfg.model = $('#model').val();
        Lampa.Storage.set('lampa_ai_settings', cfg);
        alert('✅ Настройки сохранены!');
    };
})();
