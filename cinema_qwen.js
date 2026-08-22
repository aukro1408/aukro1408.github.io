/**
CinemaX — Hero + Streamings only (minimal version)
Fixed: removed scroll-snap to fix double-press navigation issue
*/
(function(){
'use strict';
if (typeof Lampa === 'undefined') return;
if (window.CINEMAX_LOADED) return;
window.CINEMAX_LOADED = true;

var LANG = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
if (LANG === 'ua') LANG = 'uk';
if (['uk','ru','en','pl'].indexOf(LANG) === -1) LANG = 'en';

var I18N = {
    hero_row_title: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
    hero_row_title_full: { uk: ' Новинки прокату', ru: '🎬 Новинки проката', en: '🎬 New theatrical releases', pl: ' Nowości kinowe' },
    streamings_row_title: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
    streamings_row_title_full: { uk: ' Стрімінги', ru: ' Стриминги', en: '📺 Streaming', pl: '📺 Serwisy streamingowe' },
    menu_title: { uk: 'Меню', ru: 'Меню', en: 'Menu', pl: 'Menu' },
    menu_details: { uk: 'Детальніше', ru: 'Подробнее', en: 'Details', pl: 'Szczegóły' },
    menu_trailer: { uk: 'Трейлер', ru: 'Трейлер', en: 'Trailer', pl: 'Zwiastun' },
    loading_trailer: { uk: 'Завантаження трейлера...', ru: 'Загрузка трейлера...', en: 'Loading trailer...', pl: 'Ładowanie zwiastuna...' }
};

function tr(key) {
    var pack = I18N[key];
    if (!pack) return key;
    return pack[LANG] || pack.uk || pack.en || key;
}

function getTmdbKey() {
    var custom = (Lampa.Storage.get('cinemax_tmdb_apikey') || '').trim();
    return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
}

// =================================================================
// YouTube Player
// =================================================================
function playYouTubeCustom(key) {
    var overlay = $('<div class="youtube-pro-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;background:#000;"></div>');
    var playerContainer = $('<div id="yt-player-custom"></div>');
    var loader = $('<div class="yt-loader" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:1.5em;font-weight:bold;text-align:center;"><div>' + tr('loading_trailer') + '</div></div>');
    overlay.append(loader).append(playerContainer);
    $('body').append(overlay);
    
    var closePlayer = function() { 
        overlay.remove(); 
        Lampa.Controller.toggle('content'); 
    };
    
    Lampa.Controller.add('youtube_custom_controller', { 
        toggle:function(){}, up:function(){}, down:function(){}, left:function(){}, right:function(){}, 
        enter:function(){}, back:closePlayer 
    });
    Lampa.Controller.toggle('youtube_custom_controller');
    
    var initPlayer = function() {
        new YT.Player('yt-player-custom', { 
            height:'100%', width:'100%', videoId:key, 
            playerVars:{'autoplay':1,'controls':1,'showinfo':0,'rel':0,'modestbranding':1,'iv_load_policy':3,'playsinline':1,'disablekb':1,'fs':0},
            events: { 
                'onReady':function(e){ loader.remove(); e.target.playVideo(); },
                'onStateChange':function(e){ if(e.data===0) closePlayer(); },
                'onError':function(e){ Lampa.Noty.show('YouTube Error: '+e.data); closePlayer(); } 
            } 
        });
    };
    
    if (typeof YT === 'undefined') {
        var tag = document.createElement('script'); 
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = initPlayer;
    } else { 
        initPlayer(); 
    }
}

// =================================================================
// Hero Item
// =================================================================
function makeHeroResultItem(movie, heightEm) {
    heightEm = heightEm || 22.5;
    var pad = (heightEm / 35 * 2).toFixed(1);
    var titleEm = (heightEm / 35 * 2.5).toFixed(2);
    var descEm = (heightEm / 35 * 1.1).toFixed(2);
    
    var renderHeroContent = function(item, movie) {
        item.empty();
        item.append('<div class="hero-overlay" style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.9),transparent);padding:'+pad+'em;border-radius:0 0 1em 1em;">'+
            '<div class="hero-header" style="margin-bottom:0.3em;min-height:3em;display:flex;align-items:flex-end;">'+
            '<div class="hero-title" style="font-size:'+titleEm+'em;font-weight:bold;color:#fff;text-shadow:2px 2px 4px rgba(0,0,0,0.7);">'+(movie.title||movie.name)+'</div></div>'+
            '<div class="hero-meta" style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5em;font-size:0.9em;color:#ccc;margin-bottom:0.5em;"></div>'+
            '<div class="hero-desc" style="font-size:'+descEm+'em;color:#ddd;max-width:60%;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:0.6em;">'+(movie.overview||'')+'</div>'+
            '<div class="hero-trailer-btn selector" style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.2);padding:0.4em 0.8em;border-radius:0.3em;cursor:pointer;">'+
            '<svg style="width:1.2em;height:1.2em;margin-right:0.4em;" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'+
            '<span style="font-size:0.9em;font-weight:600;">'+tr('menu_trailer')+'</span></div></div>');
        
        item.find('.hero-trailer-btn').on('hover:enter click', function(e){
            e.stopPropagation();
            var network = new Lampa.Reguest();
            var type = movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language','uk');
            function search(searchLang) {
                var url = Lampa.TMDB.api(type+'/'+movie.id+'/videos?api_key='+getTmdbKey()+'&language='+searchLang);
                network.silent(url, function(json){
                    var videos = json.results||[];
                    var trailer = videos.find(function(v){return v.type==='Trailer'&&v.site==='YouTube';})||videos[0];
                    if(trailer&&trailer.key) playYouTubeCustom(trailer.key);
                    else if(searchLang!=='en-US') search('en-US');
                    else Lampa.Noty.show('Трейлер не знайдено');
                }, function(){ if(searchLang!=='en-US') search('en-US'); });
            }
            search(lang);
        });
        
        var type = movie.name ? 'tv' : 'movie';
        var lang = Lampa.Storage.get('language','uk');
        var url = Lampa.TMDB.api(type+'/'+movie.id+'?api_key='+getTmdbKey()+'&language='+lang+'&append_to_response=images,release_dates,content_ratings');
        var network = new Lampa.Reguest();
        network.silent(url, function(details) {
            var logo = null;
            if (details.images && details.images.logos && details.images.logos.length) {
                logo = details.images.logos.find(function(l) { return l.iso_639_1 === lang; }) || 
                       details.images.logos.find(function(l) { return l.iso_639_1 === 'en'; }) || 
                       details.images.logos[0];
            }
            if (logo) {
                var logoUrl = Lampa.TMDB.image('t/p/w500' + logo.file_path);
                item.find('.hero-title').html('<img src="' + logoUrl + '" style="height:4em;width:auto;max-width:80%;object-fit:contain;display:block;" />');
                item.find('.hero-header').css('min-height','auto');
            }
            var metaParts = [];
            var headMeta = '';
            var rating = details.vote_average || movie.vote_average;
            if (rating) headMeta += '<span class="card__mark card__mark--rating" style="position:static;margin:0 0.5em 0 0;padding:0.2em 0.5em;font-size:0.9em;background:rgba(255,255,255,0.2);border-radius:0.3em;">★ ' + parseFloat(rating).toFixed(1) + '</span>';
            var date = details.release_date || details.first_air_date || movie.release_date || movie.first_air_date;
            if (date) headMeta += parseInt(date);
            if (headMeta) metaParts.push(headMeta);
            var typeStr = type === 'movie' ? (lang === 'ru' ? 'Фильм' : 'Фільм') : (lang === 'ru' ? 'Сериал' : 'Серіал');
            metaParts.push(typeStr);
            var age = '';
            if (type === 'movie' && details.release_dates && details.release_dates.results) {
                var rel = details.release_dates.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                if (rel && rel.release_dates && rel.release_dates.length) age = rel.release_dates[0].certification;
            } else if (type === 'tv' && details.content_ratings && details.content_ratings.results) {
                var rat = details.content_ratings.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                if (rat) age = rat.rating;
            }
            if (age) {
                var ageColor = '#fff';
                var ageVal = parseInt(age);
                var displayAge = age;
                if (!isNaN(ageVal)) {
                    displayAge = ageVal + '+';
                    if (ageVal >= 18) ageColor = '#d32f2f';
                    else if (ageVal >= 16) ageColor = '#f57c00';
                    else if (ageVal >= 12) ageColor = '#fbc02d';
                    else ageColor = '#388e3c';
                } else {
                    if (['R','NC-17','TV-MA'].indexOf(age) !== -1) { ageColor = '#d32f2f'; displayAge = '18+'; }
                    else if (['PG-13','TV-14'].indexOf(age) !== -1) { ageColor = '#f57c00'; displayAge = '16+'; }
                    else if (['PG','TV-PG','TV-Y7'].indexOf(age) !== -1) { ageColor = '#fbc02d'; displayAge = '12+'; }
                    else { ageColor = '#388e3c'; displayAge = '0+'; }
                }
                metaParts.push('<span style="border:1px solid '+ageColor+';color:'+ageColor+';padding:0 0.3em;border-radius:0.2em;font-size:0.9em;font-weight:bold;">'+displayAge+'</span>');
            }
            if (details.production_countries && details.production_countries.length) {
                metaParts.push(details.production_countries[0].iso_3166_1);
            }
            var runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0);
            if (runtime) {
                var h = Math.floor(runtime / 60);
                var m = runtime % 60;
                var hStr = h > 0 ? h + (lang === 'ru' ? 'ч.' : 'год.') : '';
                var mStr = m > 0 ? m + (lang === 'ru' ? 'м.' : 'хв.') : '';
                if (hStr || mStr) metaParts.push((hStr + ' ' + mStr).trim());
            }
            if (metaParts.length) {
                item.find('.hero-meta').html('<span>' + metaParts.join('</span><span>') + '</span>');
            }
        });
    };
    
    return {
        title:'Hero',
        params:{
            createInstance:function(element){ return Lampa.Maker.make('Card',element,function(module){return module.only('Card','Callback');}); },
            emit:{
                onCreate:function(){
                    var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original'+movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original'+movie.poster_path) : '');
                    try{
                        var item = $(this.html);
                        item.addClass('hero-banner');
                        item.css({'background-image':'url('+img+')','width':'100%','height':heightEm+'em','background-size':'cover','background-position':'center','border-radius':'1em','position':'relative','box-shadow':'0 0 20px rgba(0,0,0,0.5)','margin-bottom':'10px'});
                        renderHeroContent(item,movie);
                        item.find('.card__view,.card__title,.card__age,.card-marks,.card__icons').remove();
                        item[0].heroMovieData = movie;
                    }catch(e){console.log('Hero onCreate error:',e);}
                },
                onVisible:function(){
                    try{
                        var item = $(this.html);
                        if(!item.hasClass('hero-banner')){
                            var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original'+movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original'+movie.poster_path) : '');
                            item.addClass('hero-banner');
                            item.css({'background-image':'url('+img+')','width':'100%','height':heightEm+'em','background-size':'cover','background-position':'center','border-radius':'1em','position':'relative','box-shadow':'0 0 20px rgba(0,0,0,0.5)','margin-bottom':'10px'});
                            renderHeroContent(item,movie);
                            item.find('.card__view,.card__title,.card__age,.card-marks,.card__icons').remove();
                            item[0].heroMovieData = movie;
                        }
                    }catch(e){console.log('Hero onVisible error:',e);}
                },
                onlyEnter:function(){
                    var playHeroTrailer = function() {
                        var network = new Lampa.Reguest();
                        var type = movie.name ? 'tv' : 'movie';
                        var lang = Lampa.Storage.get('language','uk');
                        function search(searchLang) {
                            var url = Lampa.TMDB.api(type+'/'+movie.id+'/videos?api_key='+getTmdbKey()+'&language='+searchLang);
                            network.silent(url, function(json){
                                var videos = json.results||[];
                                var trailer = videos.find(function(v){return v.type==='Trailer'&&v.site==='YouTube';})||videos[0];
                                if(trailer&&trailer.key) playYouTubeCustom(trailer.key);
                                else if(searchLang!=='en-US') search('en-US');
                                else Lampa.Noty.show('Трейлер не знайдено');
                            }, function(){ if(searchLang!=='en-US') search('en-US'); });
                        }
                        search(lang);
                    };
                    Lampa.Select.show({ 
                        title:tr('menu_title'), 
                        items:[
                            {title:tr('menu_details'),action:'open'},
                            {title:tr('menu_trailer'),action:'trailer'}
                        ], 
                        onSelect:function(a){
                            if(a.action==='trailer') playHeroTrailer();
                            else Lampa.Activity.push({url:'',component:'full',id:movie.id,method:movie.name?'tv':'movie',card:movie,source:'tmdb'});
                        }
                    });
                }
            }
        }
    };
}

// =================================================================
// Hero Row
// =================================================================
function addHeroRow() {
    Lampa.ContentRows.add({
        index:0, name:'cinemax_hero_row', title:tr('hero_row_title'), screen:['main'],
        call:function(params){
            return function(callback){
                var network = new Lampa.Reguest();
                var url = Lampa.TMDB.api('movie/now_playing?api_key='+getTmdbKey()+'&language='+Lampa.Storage.get('language','uk')+'&region=UA');
                network.silent(url,function(json){
                    var items = json.results||[];
                    if(!items.length){
                        url = Lampa.TMDB.api('trending/all/week?api_key='+getTmdbKey()+'&language='+Lampa.Storage.get('language','uk'));
                        network.silent(url,function(retryJson){
                            items = retryJson.results||[];
                            build(items);
                        });
                        return;
                    }
                    build(items);
                    function build(movies){
                        var moviesWithBackdrop = movies.filter(function(m){return m.backdrop_path;});
                        var results = moviesWithBackdrop.slice(0,15).map(function(movie){return makeHeroResultItem(movie,22.5);});
                        callback({results:results,title:tr('hero_row_title_full'),params:{items:{mapping:'line',view:15}}});
                    }
                },function(){ callback({results:[]}); });
            };
        }
    });
}

// =================================================================
// Studios Component
// =================================================================
var SERVICE_CONFIGS = {
    'netflix': { title:'Netflix', icon:'<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L16.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L7.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L16.5 22" stroke="#E50914" stroke-width="4"/></svg>',
        categories:[
            {"title":" Нові фільми","url":"discover/movie","params":{"with_watch_providers":"8","watch_region":"UA","sort_by":"primary_release_date.desc","primary_release_date.lte":"{current_date}","vote_count.gte":"5"}},
            {"title":" Нові серіали","url":"discover/tv","params":{"with_networks":"213","sort_by":"first_air_date.desc","first_air_date.lte":"{current_date}","vote_count.gte":"5"}},
            {"title":"🏆 Топ Серіали","url":"discover/tv","params":{"with_networks":"213","sort_by":"popularity.desc"}},
            {"title":" Топ Фільми","url":"discover/movie","params":{"with_watch_providers":"8","watch_region":"UA","sort_by":"popularity.desc"}}
        ]},
    'disney': { title:'Disney+', icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10c2.2-2.5 5-3.7 8-3.7 2.2 0 4.1.7 5.8 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M12 13v4M10 15h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
        categories:[
            {"title":"🔥 Нові серіали","url":"discover/tv","params":{"with_networks":"2739","sort_by":"first_air_date.desc","first_air_date.lte":"{current_date}","vote_count.gte":"5"}},
            {"title":"🔥 Нові фільми","url":"discover/movie","params":{"with_watch_providers":"337","watch_region":"US","sort_by":"primary_release_date.desc","primary_release_date.lte":"{current_date}","vote_count.gte":"5"}},
            {"title":"🏆 Топ Серіали","url":"discover/tv","params":{"with_networks":"2739","sort_by":"popularity.desc"}},
            {"title":"🏆 Топ Фільми","url":"discover/movie","params":{"with_companies":"2","sort_by":"popularity.desc"}}
        ]},
    'hbo': { title:'HBO / Max', icon:'<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2 .795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76z"/></svg>',
        categories:[
            {"title":"🔥 Нові серіали","url":"discover/tv","params":{"with_networks":"49|3186","sort_by":"first_air_date.desc","first_air_date.lte":"{current_date}","vote_count.gte":"5"}},
            {"title":"🔥 Нові фільми","url":"discover/movie","params":{"with_companies":"174|49","sort_by":"primary_release_date.desc","primary_release_date.lte":"{current_date}","vote_count.gte":"10"}},
            {"title":"🏆 Топ Серіали","url":"discover/tv","params":{"with_networks":"49|3186","sort_by":"popularity.desc"}},
            {"title":"🏆 Топ Фільми (WB)","url":"discover/movie","params":{"with_companies":"174","sort_by":"popularity.desc","vote_count.gte":"50"}}
        ]},
    'apple': { title:'Apple TV+', icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5 .13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
        categories:[
            {"title":" Нові серіали","url":"discover/tv","params":{"with_networks":"2552|3235","sort_by":"first_air_date.desc","first_air_date.lte":"{current_date}","vote_count.gte":"2"}},
            {"title":"🔥 Нові фільми","url":"discover/movie","params":{"with_watch_providers":"350","watch_region":"UA","sort_by":"primary_release_date.desc","primary_release_date.lte":"{current_date}","vote_count.gte":"2"}},
            {"title":"🏆 Топ Серіали","url":"discover/tv","params":{"with_networks":"2552|3235","sort_by":"popularity.desc"}},
            {"title":"🏆 Топ Фільми","url":"discover/movie","params":{"with_watch_providers":"350","watch_region":"UA","sort_by":"popularity.desc"}}
        ]},
    'amazon': { title:'Prime Video', icon:'<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 15c2.4 1.7 5.1 2.6 8 2.6 2.9 0 5.6-.9 8-2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M15.5 14.4L18 16.8 15.5 19.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        categories:[
            {"title":"🔥 Нові серіали","url":"discover/tv","params":{"with_networks":"1024","sort_by":"first_air_date.desc","first_air_date.lte":"{current_date}","vote_count.gte":"5"}},
            {"title":"🔥 Нові фільми","url":"discover/movie","params":{"with_watch_providers":"119","watch_region":"US","sort_by":"primary_release_date.desc","primary_release_date.lte":"{current_date}","vote_count.gte":"5"}},
            {"title":"🏆 Топ Серіали","url":"discover/tv","params":{"with_networks":"1024","sort_by":"popularity.desc"}},
            {"title":"🏆 Топ Фільми","url":"discover/movie","params":{"with_watch_providers":"119","watch_region":"US","sort_by":"popularity.desc"}}
        ]},
    'paramount': { title:'Paramount+', icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22H22L12 2ZM12 6.5L18.5 19.5H5.5L12 6.5Z"/></svg>',
        categories:[
            {"title":" Нові серіали","url":"discover/tv","params":{"with_networks":"4330","sort_by":"first_air_date.desc","first_air_date.lte":"{current_date}","vote_count.gte":"2"}},
            {"title":" Нові фільми","url":"discover/movie","params":{"with_companies":"4","sort_by":"primary_release_date.desc","primary_release_date.lte":"{current_date}","vote_count.gte":"10"}},
            {"title":"🏆 Топ Серіали","url":"discover/tv","params":{"with_networks":"4330","sort_by":"popularity.desc"}},
            {"title":"🏆 Топ Фільми","url":"discover/movie","params":{"with_companies":"4","sort_by":"popularity.desc"}}
        ]}
};

function StudiosMain(object) {
    var comp = new Lampa.InteractionMain(object);
    var config = SERVICE_CONFIGS[object.service_id];
    if (!config) { comp.empty && comp.empty(); return comp; }
    comp.create = function() {
        var _this = this;
        this.activity.loader(true);
        var categories = config.categories;
        var network = new Lampa.Reguest();
        var status = new Lampa.Status(categories.length);
        status.onComplite = function() {
            var fulldata = [];
            if (status.data) {
                Object.keys(status.data).sort(function(a,b){return parseInt(a,10)-parseInt(b,10);}).forEach(function(key) {
                    var num = parseInt(key,10);
                    var data = status.data[key];
                    var cat = categories[num];
                    if (cat && data && data.results && data.results.length) {
                        Lampa.Utils.extendItemsParams(data.results, {style:{name:'wide'}});
                        fulldata.push({title:cat.title, results:data.results, url:cat.url, params:cat.params, service_id:object.service_id});
                    }
                });
            }
            if (fulldata.length) { _this.build(fulldata); _this.activity.loader(false); }
            else { _this.empty(); }
        };
        categories.forEach(function(cat, index) {
            var params = ['api_key='+getTmdbKey(), 'language='+Lampa.Storage.get('language','uk')];
            if (cat.params) {
                for (var key in cat.params) {
                    var val = cat.params[key];
                    if (val === '{current_date}') {
                        var d = new Date();
                        val = [d.getFullYear(),('0'+(d.getMonth()+1)).slice(-2),('0'+d.getDate()).slice(-2)].join('-');
                    }
                    params.push(key+'='+val);
                }
            }
            var url = Lampa.TMDB.api(cat.url+'?'+params.join('&'));
            network.silent(url, function(json) {
                if (json && json.results && Array.isArray(json.results)) {
                    json.results.forEach(function(item) {
                        if (!item.poster_path && item.backdrop_path) item.poster_path = item.backdrop_path;
                    });
                }
                status.append(index.toString(), json);
            }, function(){ status.error(); });
        });
        return this.render();
    };
    comp.onMore = function(data) {
        Lampa.Activity.push({url:data.url, params:data.params, title:data.title, component:'cinemax_studios_view', page:1});
    };
    return comp;
}

function StudiosView(object) {
    var comp = new Lampa.InteractionCategory(object);
    var network = new Lampa.Reguest();
    function buildUrl(page) {
        var params = ['api_key='+getTmdbKey(), 'language='+Lampa.Storage.get('language','uk'), 'page='+page];
        if (object.params) {
            for (var key in object.params) {
                var val = object.params[key];
                if (val === '{current_date}') {
                    var d = new Date();
                    val = [d.getFullYear(),('0'+(d.getMonth()+1)).slice(-2),('0'+d.getDate()).slice(-2)].join('-');
                }
                params.push(key+'='+val);
            }
        }
        return Lampa.TMDB.api(object.url+'?'+params.join('&'));
    }
    comp.create = function() {
        var _this = this;
        network.silent(buildUrl(1), function(json) {
            if (json && json.results && Array.isArray(json.results)) {
                json.results.forEach(function(item) {
                    if (!item.poster_path && item.backdrop_path) item.poster_path = item.backdrop_path;
                });
            }
            _this.build(json);
        }, this.empty.bind(this));
    };
    comp.nextPageReuest = function(object, resolve, reject) {
        network.silent(buildUrl(object.page), resolve, reject);
    };
    return comp;
}

// =================================================================
// Studio Row
// =================================================================
var STUDIOS = [
    {id:'netflix', name:'Netflix', svg:'<svg viewBox="0 0 256 69" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35.2 64.726c-3.85.676-7.77.88-11.823 1.42L11.013 29.93V67.7c-3.85.405-7.364.946-11.013 1.486V0h10.27l14.053 39.255V0H35.2v64.726z" fill="#E50914"/></svg>', providerId:'8'},
    {id:'disney', name:'Disney+', svg:'<svg viewBox="0 0 1041 565" xmlns="http://www.w3.org/2000/svg"><path fill="#113CCF" fill-rule="evenodd" d="M735.8 365.7C721.4 369 683.5 370.9 683.5 370.9L678.7 385.9c0 0 18.9-1.6 32.7-.2"/></svg>', providerId:'337'},
    {id:'hbo', name:'HBO', svg:'<svg viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628z"/></svg>', providerId:'384'},
    {id:'apple', name:'Apple TV+', svg:'<svg viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg"><path d="M20.57 17.735h-1.815l-3.34-9.203h1.633l2.02 5.987c.075.231.273.9.586 2.012"/></svg>', providerId:'350'},
    {id:'amazon', name:'Prime Video', svg:'<svg viewBox="0 -.1 800.3 246.4" xmlns="http://www.w3.org/2000/svg"><path d="m396.5 246.3v-.4c.4-.5 1.1-.8 1.7-.7 2.9-.1 5.7-.1 8.6 0" fill="#00a8e1"/></svg>', providerId:'119'},
    {id:'paramount', name:'Paramount+', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22H22L12 2Z"/></svg>', providerId:'531'}
];

function addStudioRow() {
    Lampa.ContentRows.add({
        index:1, name:'cinemax_studio_row', title:tr('streamings_row_title'), screen:['main'],
        call:function(params){
            return function(callback){
                var items = STUDIOS.map(function(s){
                    return {
                        title:s.name,
                        params:{
                            createInstance:function(){ return Lampa.Maker.make('Card',this,function(module){return module.only('Card','Callback');}); },
                            emit:{
                                onFocus:function() {
                                    var serviceBGs = {
                                        'netflix':'linear-gradient(135deg,#000000,#4c0000)',
                                        'disney':'linear-gradient(135deg,#050f2c,#1a2f63)',
                                        'hbo':'linear-gradient(135deg,#0f0c29,#302b63)',
                                        'apple':'linear-gradient(135deg,#000000,#333333)',
                                        'amazon':'linear-gradient(135deg,#0f1c29,#004d40)',
                                        'paramount':'linear-gradient(135deg,#003366,#0066cc)'
                                    };
                                    if (Lampa.Background && Lampa.Background.change) {
                                        if (serviceBGs[s.id]) {
                                            $('.background').css('background', serviceBGs[s.id]);
                                            $('.background__img').css('opacity', 0);
                                        } else {
                                            $('.background').css('background', '');
                                            $('.background__img').css('opacity', 1);
                                        }
                                    }
                                },
                                onCreate:function(){
                                    var item = $(this.html);
                                    item.addClass('card--studio');
                                    var view = item.find('.card__view');
                                    view.empty();
                                    var wrapper = $('<div class="studio-logo-wrap"></div>');
                                    if (s.svg) {
                                        var svgEl = $(s.svg);
                                        svgEl.addClass('studio-logo-img').css({'max-width':'70%','max-height':'60%','display':'block'});
                                        wrapper.append(svgEl);
                                    } else {
                                        wrapper.append($('<div class="studio-logo-fallback" style="display:block;font-weight:700;text-align:center;">').text(s.name));
                                    }
                                    view.append(wrapper);
                                    item.find('.card__age,.card__year,.card__type,.card__textbox,.card__title').remove();
                                },
                                onlyEnter:function(){
                                    Lampa.Activity.push({url:'',title:s.name,component:'cinemax_studios_main',service_id:s.id,page:1});
                                }
                            }
                        }
                    };
                });
                callback({results:items,title:tr('streamings_row_title_full'),params:{items:{view:15,mapping:'line'}}});
            };
        }
    });
}

// =================================================================
// CSS Styles — FIXED: removed scroll-snap to fix navigation
// =================================================================
function addStyles(){
    if ($('#cinemax-css').length) return;
    $('body').append('<style id="cinemax-css">' +
        '.card.hero-banner{width:52vw!important;height:25em!important;margin:0 1.5em 0.3em 0!important;display:inline-block;}' +
        '.scroll__content:has(.hero-banner){padding-left:1.5em!important;}' +
        '.scroll--mask .scroll__content{padding:1.2em 1em 1em}' +
        '.row--card{margin-bottom:-1.2em!important}' +
        '.items-line{padding-bottom:2em!important}' +
        '.card--studio{width:12em!important;height:6.75em!important;padding:0!important;background:#f5f7fa;border-radius:0.8em;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.06);transition:transform 0.18s ease-out,box-shadow 0.18s ease-out}' +
        '.card--studio.focus{transform:scale(1.06);box-shadow:0 0 18px rgba(255,255,255,0.9);z-index:10}' +
        '.card--studio .card__view{width:100%;height:100%;padding:0.6em!important;box-sizing:border-box!important;background-origin:content-box;display:block;position:relative}' +
        '.studio-logo-wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center}' +
        '.studio-logo-img{max-width:70%;max-height:60%;object-fit:contain;display:block}' +
        '.hero-banner .card-marks,.hero-banner .card__icons,.hero-banner .card__quality{display:none!important}' +
        '.show-more-button.focus,.card.show-more-button:focus,.kino-card.show-more-button:hover,.kino-card.show-more-button.focus{transform:scale(1.05)!important;box-shadow:0 0 0 3px #fff!important;z-index:10!important}' +
    '</style>');
}

// =================================================================
// Init
// =================================================================
function init(){
    try {
        addStyles();
        Lampa.Component.add('cinemax_studios_main', StudiosMain);
        Lampa.Component.add('cinemax_studios_view', StudiosView);
        addHeroRow();
        addStudioRow();
        setTimeout(function(){
            var heroCard = document.querySelector('.hero-banner');
            if (heroCard) { 
                heroCard.style.width = '85vw'; 
                heroCard.style.marginRight = '1.5em'; 
            }
            var studioCard = $('.card--studio');
            if (studioCard.length && Lampa.Controller && Lampa.Controller.enabled && Lampa.Controller.enabled().name === 'main') {
                var content = $('.scroll__content').eq(1)[0];
                if (content) Lampa.Controller.collectionFocus(studioCard[0], content);
            }
        }, 1000);
    } catch(e) {
        console.error('[CinemaX] init error', e);
    }
}

function boot(){
    if (window.appready) init();
    else if (Lampa.Listener && Lampa.Listener.follow) Lampa.Listener.follow('app', function(e){ if(e.type==='ready') init(); });
}

boot();
})();
