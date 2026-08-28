(function () {
    'use strict';

    var PLUGIN_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.cls-left{fill:currentColor;fill-rule:evenodd;}.cls-right{fill:#a0a0a0;fill-rule:evenodd;}</style><g><polygon class="cls-right" points="16.64 15.13 17.38 13.88 20.91 13.88 22 12 19.82 8.25 16.75 8.25 15.69 6.39 14.5 6.39 14.5 5.13 16.44 5.13 17.5 7 19.09 7 16.9 3.25 12.63 3.25 12.63 8.25 14.36 8.25 15.09 9.5 12.63 9.5 12.63 12 14.89 12 15.94 10.13 18.75 10.13 19.47 11.38 16.67 11.38 15.62 13.25 12.63 13.25 12.63 17.63 16.03 17.63 15.31 18.88 12.63 18.88 12.63 20.75 16.9 20.75 20.18 15.13 18.09 15.13 17.36 16.38 14.5 16.38 14.5 15.13 16.64 15.13"/><polygon class="cls-left" points="7.36 15.13 6.62 13.88 3.09 13.88 2 12 4.18 8.25 7.25 8.25 8.31 6.39 9.5 6.39 9.5 5.13 7.56 5.13 6.5 7 4.91 7 7.1 3.25 11.38 3.25 11.38 8.25 9.64 8.25 8.91 9.5 11.38 9.5 11.38 12 9.11 12 8.06 10.13 5.25 10.13 4.53 11.38 7.33 11.38 8.38 13.25 11.38 13.25 11.38 17.63 7.97 17.63 8.69 18.88 11.38 18.88 11.38 20.75 7.1 20.75 3.82 15.13 5.91 15.13 6.64 16.38 9.5 16.38 9.5 15.13 7.36 15.13"/></g></svg>';

    var STORAGE_KEY = 'google_native_key_v1';
    window.ai_pagination = { base_prompt: '', exclude_list: [], preloaded_results: null, preloaded_raw_list: null, is_loading: false, is_preloading: false };
    window.ai_cached_results = [];
    window.ai_active_controller = null;

    if (!window.ai_push_patched) {
        var originalPush = Lampa.Activity.push;
        Lampa.Activity.push = function(obj) {
            var card = obj.card || obj.movie;
            if (card && card.is_load_more) {
                if (window.plugin_ai_assistant_instance) window.plugin_ai_assistant_instance.loadMore(Lampa.Activity.active());
                return;
            }
            originalPush.apply(Lampa.Activity, arguments);
        };
        window.ai_push_patched = true;
    }

    if (window.Lampa && Lampa.Api) {
        Lampa.Api.sources.ai_assistant_list = {
            list: function(params, oncomplite) { oncomplite({ results: window.ai_cached_results, total_pages: 1 }); }
        };
    }

    function AIAssistantPlugin() {
        var _this = this;
        var statusBox = null;

        var AI_MODELS_LIST = [
            { id: 'gemini-3.1-flash-lite-preview', name: 'gemini-3.1-flash-lite-preview' },
            { id: 'gemini-3-flash-preview', name: 'gemini-3-flash-preview' },
            { id: 'gemini-2.5-flash-lite', name: 'gemini-2.5-flash-lite' },
            { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash' },
            { id: 'gemma-4-31b-it', name: 'gemma-4-31b-it' },
            { id: 'gemma-3-27b-it', name: 'gemma-3-27b-it' },
            { id: 'gemma-3-4b-it', name: 'gemma-3-4b-it' }
        ];
        

        this.init = function () {
            this.setupSettings();
            this.injectStyles();
            this.setupGlobalSearch();
            
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'complete') {
                    _this.drawButton(e.object.activity.render(), e.data.movie);
                    _this.preloadTags(e.data.movie);
                }
            });

            Lampa.Listener.follow('card', function(e) {
                if (e.action == 'render' && e.card) {
                    if (e.card.is_load_more) {
                        e.element.attr('data-id', 'ai_load_more');
                        e.element.find('.card__title, .card__age, .item__title, .item__age, .card__vote, .card__icons').hide();
                    } else if (e.card.id) {
                        e.element.attr('data-id', e.card.id);
                    }
                }
            });
        };

        this.getTMDBDetails = function(card, callback) {
            var method = (card.name || card.original_name) ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(method + '/' + card.id + '?api_key=' + Lampa.TMDB.key() + '&language=ru-RU&append_to_response=credits');
            
            Lampa.Network.silent(url, function(res) {
                var overview = (res.overview || '').replace(/"/g, "'").replace(/\n/g, ' ');
                var leadActor = 'unknown';
                
                if (res.credits && res.credits.cast && res.credits.cast.length > 0) {
                    leadActor = res.credits.cast[0].name;
                }
                callback({ overview: overview, leadActor: leadActor });
            }, function() {
                callback({ overview: '', leadActor: 'unknown' });
            });
        };



        this.preloadTags = function(card) {
            if (card.translated_tags) return;

            var attempts = 0;
            var delays = [1000, 2000]; // 1 сек, потім ще 2 сек

            var waitAndCheck = function() {
                setTimeout(function() {
                    // Якщо інший плагін вже поклав теги в картку — ми вільні
                    if (card.translated_tags && card.translated_tags.length > 0) return;

                    attempts++;
                    if (attempts < delays.length) {
                        waitAndCheck(); // Чекаємо наступний інтервал
                    } else {
                        // Якщо за 3 секунди нічого не з'явилося — вантажимо самі
                        _this.runOwnTagTranslation(card);
                    }
                }, delays[attempts]);
            };

            waitAndCheck();
        };
        
        this.runOwnTagTranslation = function(card) {
            if (card.translated_tags) return;
            
            var method = (card.original_name || card.name) ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(method + '/' + card.id + '/keywords?api_key=' + Lampa.TMDB.key());

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (resp) {
                    var tags = resp.keywords || resp.results || [];
                    if (tags.length > 0) {
                        _this.translateTags(tags, function(translatedTags) {
                            card.translated_tags = translatedTags;
                        });
                    } else {
                        card.translated_tags = [];
                    }
                }
            });
        };

        
        this.setupGlobalSearch = function() {
            var searchSource = {
                title: 'AI Поиск',
                search: function (params, done) {
                    var q = decodeURIComponent(params.query || '').trim().toLowerCase();
                    var limit = Lampa.Storage.get('ai_result_count', '20');
                    if (!q) return done([]);
                    var filter = (q.indexOf('фільм') > -1) ? 'strictly only movies' : (q.indexOf('серіал') > -1 ? 'strictly only TV series' : 'movies and TV series');
                    var p = 'Act as a movie expert. Suggest strictly ' + limit + ' ' + filter + ' for query: "' + q + '". Respond ONLY with a valid JSON array: [{"ru":"Название","orig":"Original Title","year":Year}]. No markdown, no intro text.';
                    
                    window.ai_active_controller = Lampa.Controller.enabled().name;
                    _this.updateStatus('Поиск результатов');
                    _this.askGemini(p, function(text) {
                        var list = _this.parseJsonSafe(text);
                        if (!list) { _this.hideStatus(); return done([]); }
                        _this.processAiList(list, function(results) { _this.hideStatus(); done([{ title: 'AI: ' + q, results: results, total: results.length }]); });
                    }, function() { 
                        done([]); 
                    });
                },
                params: { save: true, lazy: true },
                onSelect: function (p, close) { close(); Lampa.Activity.push({ url: p.element.media_type+'/'+p.element.id, component: 'full', id: p.element.id, method: p.element.media_type, card: p.element, source: 'tmdb' }); }
            };
            setTimeout(function() {
                var s = Lampa.Search.sources ? Lampa.Search.sources() : [];
                if (s.length >= 2) s.splice(2, 0, searchSource); else Lampa.Search.addSource(searchSource);
            }, 1500);
        };

        this.getSafeDynamicColor = function() {
            // Отримуємо поточний колір теми Лампи
            var raw = getComputedStyle(document.documentElement).getPropertyValue('--main-color').trim();
            if (!raw) return '#ffffff'; // Якщо кольору немає взагалі
            
            var r = 0, g = 0, b = 0;
            if (raw.indexOf('#') === 0) {
                var hex = raw.slice(1);
                if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
                r = parseInt(hex.slice(0,2), 16); g = parseInt(hex.slice(2,4), 16); b = parseInt(hex.slice(4,6), 16);
            } else if (raw.indexOf('rgb') === 0) {
                var m = raw.match(/\d+/g);
                if (m) { r = parseInt(m[0]); g = parseInt(m[1]); b = parseInt(m[2]); }
            } else { return raw; } // Невідомий формат
            
            // Конвертація RGB в HSL
            r /= 255; g /= 255; b /= 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            // ОСНОВНА ЛОГІКА: Якщо яскравість менша за 35%, піднімаємо її
            if (l < 0.35) l = 0.35; 
            
            return 'hsl(' + Math.round(h * 360) + ',' + Math.round(s * 100) + '%,' + Math.round(l * 100) + '%)';
        };
        

        this.injectStyles = function() {
            if ($('#ai-assistant-styles').length) return;
            $('<style id="ai-assistant-styles">').prop('type', 'text/css').html(
                '.button--ai-assist { display: flex !important; align-items: center; justify-content: center; gap: 1px; } ' + 
                '.button--ai-assist svg { width: 1.9em !important; height: 1.9em !important; margin: 0 !important; } ' +
                '#ai-assist-status { position: fixed; bottom: 80px; left: 0; right: 0; text-align: center; z-index: 10001; pointer-events: none; display: flex; justify-content: center; }' +
                '.ai-toast { display: inline-flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 10px 24px; border-radius: 50px; color: #fff; font-size: 1.1em; position: relative; overflow: hidden; height: 44px; }' +
                '.ai-toast:after { content:""; position:absolute; top:0; left:-100%; width:30%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); animation: ai-shimmer 4s infinite; }' +
                '@keyframes ai-shimmer { to {left:150%} }' +
                '.ai-spinner { width: 22px; height: 22px; border-radius: 50%; border: 3px solid transparent; border-top-color: #fff; animation: ai-rot 0.8s linear infinite, ai-rainbow 4s linear infinite; }' +
                '@keyframes ai-rot { to { transform: rotate(360deg); } }' +
                '@keyframes ai-rainbow { 0%{border-top-color:#fff} 16.6%{border-top-color:var(--main-color, #fff)} 33.3%{border-top-color:#0cf} 50%{border-top-color:#f0f} 66.6%{border-top-color:var(--main-color, #f0f)} 83.3%{border-top-color:#8b0000} 100%{border-top-color:#fff} }' +
                '.ai-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 5001; display: flex; align-items: center; justify-content: center; }' +
                '.ai-viewer-body { width: 85%; max-width: 900px; height: 80%; background: #121212; display: flex; flex-direction: column; border-radius: 16px; border: 1px solid var(--main-color, #fff); overflow: hidden; }' +
                '.ai-header { height: 48px; padding: 0 15px; background: #1a1a1a; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.ai-title { font-size: 1.5em; font-weight: bold; }' + 
                '.ai-close-btn { width: 32px; height: 32px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-family: sans-serif; cursor: pointer; border: 2px solid transparent; line-height: 0; padding-bottom: 0px; }' +
                '.ai-close-btn.focus { background: #fff; color: #000; outline: none; }' +
                '.ai-content-scroll { flex: 1; overflow-y: auto; padding: 10px 20px 20px 20px; color: #efefef; line-height: 1.4; font-size: var(--ai-font-size, 1.25em); }' + // Динамічний розмір тексту
                '.ai-fact-title { color: var(--safe-text-color, var(--main-color, #fff)); font-weight: bold; display: block; margin-bottom: 2px; }'
            ).appendTo('head');
        };


        this.drawButton = function (render, card) {
            var container = render.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length || container.find('.button--ai-assist').length) return;
            var btn = $('<div class="full-start__button selector button--ai-assist">' + PLUGIN_ICON + '<span>AI Асистент</span></div>');
            btn.on('hover:enter click', function () { _this.openAiMenu(card, btn, render); });
            var lastBtn = container.find('.selector').last();
            if (lastBtn.length) lastBtn.after(btn); else container.append(btn);
        };

        this.restoreFocus = function(btnElement, renderContainer, controllerName) {
            if (Lampa.Activity.active() && Lampa.Activity.active().activity) {
                Lampa.Activity.active().activity.toggle();
            } else {
                Lampa.Controller.toggle(controllerName || 'full');
            }

            if (!Lampa.Platform.is('touch') && btnElement && renderContainer) {
                setTimeout(function() {
                    Lampa.Controller.collectionFocus(btnElement[0], renderContainer[0]);
                }, 10);
            }
        };

        this.openAiMenu = function(card, btnElement, renderContainer, prevCtrl) {
            var controllerName = prevCtrl || Lampa.Controller.enabled().name; 
            var items = [
                { title: 'Рекомендації', action: 'recommendations' },
                { title: 'Цікаві факти', action: 'facts' }
            ];

            if (card.translated_tags && card.translated_tags.length > 0) {
                items.splice(1, 0, { title: 'Добірки за тегами', action: 'tags' });
            }

            if ((card.number_of_seasons && card.number_of_seasons > 1) || card.belongs_to_collection) {
                items.push({ title: 'Стислий переказ', action: 'recap' });
            }

            Lampa.Select.show({
                title: 'cinemaX_ai',
                items: items,
                onSelect: function (item) {
                    setTimeout(function() {
                        if (item.action === 'facts') _this.actionFacts(card, btnElement, renderContainer, controllerName);
                        else if (item.action === 'recap') _this.actionRecapMenu(card, btnElement, renderContainer, controllerName);
                        else if (item.action === 'recommendations') _this.actionRecommendations(card, btnElement, renderContainer, controllerName);
                        else if (item.action === 'tags') _this.actionTags(card, btnElement, renderContainer, controllerName);
                    }, 50);
                },
                onBack: function () { 
                    _this.restoreFocus(btnElement, renderContainer, controllerName);
                }
            });
        };




         this.showViewer = function(title, contentHtml, btnElement, renderContainer, controllerName) {
            var safeColor = _this.getSafeDynamicColor();
            // Зчитуємо розмір шрифту з налаштувань
            var fontSize = Lampa.Storage.get('ai_font_size', '1.25em'); 
            
            // Додаємо --ai-font-size у стилі контейнера
            var viewer = $('<div class="ai-viewer-container" style="--safe-text-color: ' + safeColor + '; --ai-font-size: ' + fontSize + ';">' +
                            '<div class="ai-viewer-body">' +
                                '<div class="ai-header"><div class="ai-title">' + title + '</div><div class="ai-close-btn selector">×</div></div>' +
                                '<div class="ai-content-scroll">' + contentHtml + '</div>' +
                            '</div></div>');
            $('body').append(viewer);
            
            var close = function() { 
                viewer.remove(); 
                _this.restoreFocus(btnElement, renderContainer, controllerName);
            };

            viewer.find('.ai-close-btn').on('click hover:enter', close);
            Lampa.Controller.add('ai_viewer', {
                toggle: function() { Lampa.Controller.collectionSet(viewer); Lampa.Controller.collectionFocus(viewer.find('.ai-close-btn')[0], viewer); },
                up: function() { viewer.find('.ai-content-scroll').scrollTop(viewer.find('.ai-content-scroll').scrollTop() - 100); },
                down: function() { viewer.find('.ai-content-scroll').scrollTop(viewer.find('.ai-content-scroll').scrollTop() + 100); },
                back: close
            });
            Lampa.Controller.toggle('ai_viewer');
        };



        this.actionFacts = function(card, btn, render, ctrl) {
            if (!_this.checkApiKey(btn, render, ctrl)) return; 
            var ruT = card.title || card.name;
            var origT = card.original_title || card.original_name;
            var year = (card.release_date || card.first_air_date || '').slice(0,4);
            var type = (card.name || card.original_name) ? 'TV series' : 'movie';
            
            window.ai_active_controller = ctrl || Lampa.Controller.enabled().name;
            _this.updateStatus('Поиск фактов');
            
            _this.getTMDBDetails(card, function(tmdb) {
                var p = 'Provide 6 to 10 interesting, little-known facts about the ' + type + ' "' + ruT + '" (original title: "' + origT + '", ' + year + ') with ' + tmdb.leadActor + ' in the lead role, in Russian. CRITICAL RULE: If you lack verified facts in your internal database, you MUST use the Google Search tool to find reliable information. If even after searching you cannot find reliable facts, do not hallucinate. Return strictly: [{"title": "Інформація відсутня", "text": "На жаль, достовірних фактів про цей проєкт не знайдено."}]. Otherwise, return strictly a JSON array where each fact is a separate object: [{"title":"..","text":".."}]. No markdown, no intro text.';
                
                _this.askGemini(p, function(text) {
                    _this.hideStatus();
                    if (Lampa.Activity.active() && Lampa.Activity.active().component !== 'full') return; 
                    
                    var data = _this.parseJsonSafe(text);
                    if (!data) { 
                        Lampa.Noty.show('Ошибка обработки результата'); 
                        _this.restoreFocus(btn, render, ctrl);
                        return; 
                    }
                    
                    // ВИДАЛЯЄМО [1], [2, 5] тощо перед виводом
                    var html = (data || []).map(function(f){ 
                        var cleanText = f.text.replace(/\[\d+(?:,\s*\d+)*\]/g, '').trim();
                        return '<div style="margin-botto
