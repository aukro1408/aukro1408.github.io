/**
 * CinemaX — Новинки проката + Стриминги
 * Автор: aukro1408
 * Standalone plugin for Lampa.
 */
(function () {
    'use strict';

    window.CINEMAX_STUDIOS_VER = '4.0';
    window.CINEMAX_STUDIOS_LOADED = false;
    window.CINEMAX_STUDIOS_ERROR = null;

    if (typeof Lampa === 'undefined') {
        window.CINEMAX_STUDIOS_ERROR = 'Lampa not found (script loaded before app?)';
        return;
    }


    // =================================================================
    // CONFIGURATION & CONSTANTS
    // =================================================================

    var currentScript = document.currentScript || [].slice.call(document.getElementsByTagName('script')).filter(function (s) {
        return (s.src || '').indexOf('studios') !== -1 || (s.src || '').indexOf('fix.js') !== -1 || (s.src || '').indexOf('cinemax') !== -1;
    })[0];

    // Force CDN usage to ensure logos load correctly regardless of installation method
    var CINEMAX_BASE_URL = 'https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/';
    var CINEMAX_LOGO_FALLBACK_CDN = 'https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/';
/*
    var CINEMAX_BASE_URL = (currentScript && currentScript.src) ? currentScript.src.replace(/[#?].*$/, '').replace(/[^/]+$/, '') : 'http://127.0.0.1:3000/';
    
    if (CINEMAX_BASE_URL.indexOf('raw.githubusercontent.com') !== -1) {
        CINEMAX_BASE_URL = CINEMAX_BASE_URL
            .replace('raw.githubusercontent.com', 'cdn.jsdelivr.net/gh')
            .replace(/\/([^@/]+\/[^@/]+)\/main\//, '/$1@main/')
            .replace(/\/([^@/]+\/[^@/]+)\/master\//, '/$1@master/');
    } else if (CINEMAX_BASE_URL.indexOf('.github.io') !== -1) {
        // e.g. https://syvyj.github.io/studio_2/ → https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/
        var gitioMatch = CINEMAX_BASE_URL.match(/https?:\/\/([^.]+)\.github\.io\/([^/]+)\//i);
        if (gitioMatch) {
            CINEMAX_BASE_URL = 'https://cdn.jsdelivr.net/gh/' + gitioMatch[1] + '/' + gitioMatch[2] + '@main/';
        }
    }
*/
    var CINEMAX_LANG = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
    if (CINEMAX_LANG === 'ua') CINEMAX_LANG = 'uk';
    if (['uk', 'ru', 'en', 'pl'].indexOf(CINEMAX_LANG) === -1) CINEMAX_LANG = 'en';

    var CINEMAX_I18N = {
        hero_row_title: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        hero_row_title_full: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        streamings_row_title: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        streamings_row_title_full: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        settings_tab_title: { uk: 'CinemaX', ru: 'CinemaX', en: 'CinemaX', pl: 'CinemaX' },
        settings_header_info: {
            uk: 'CinemaX — кастомна головна сторінка зі стрімінгами та новинками прокату. Автор: aukro1408',
            ru: 'CinemaX — кастомная главная страница со стримингами и новинками проката. Автор: aukro1408',
            en: 'CinemaX — custom home screen with streaming services and theatrical releases. Author: aukro1408',
            pl: 'CinemaX — niestandardowa strona główna ze streamingami i nowościami kinowymi. Autor: aukro1408'
        },
        settings_sections_title: { uk: 'Секції головної сторінки', ru: 'Секции главной страницы', en: 'Main screen sections', pl: 'Sekcje ekranu głównego' },
        settings_streamings_name: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        settings_streamings_desc: { uk: 'Секція з логотипами стрімінгових сервісів', ru: 'Секция с логотипами стриминговых сервисов', en: 'Row with streaming service logos', pl: 'Sekcja z logo serwisów streamingowych' },
        settings_hero_name: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        settings_hero_desc: { uk: 'Ряд з новинками прокату на початку головної', ru: 'Ряд с новинками проката в начале главной', en: 'Row with theatrical new releases at the top', pl: 'Rząd z nowościami kinowymi na początku ekranu' }
    };

    function tr(key) {
        var pack = CINEMAX_I18N[key];
        if (!pack) return key;
        return pack[CINEMAX_LANG] || pack.uk || pack.en || key;
    }

    var SERVICE_CONFIGS = {
        'netflix': {
            title: 'Netflix',
            logo: 'logos/netflix.svg',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L16.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L7.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L16.5 22" stroke="#E50914" stroke-width="4"/></svg>',
            categories: [
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": tr('cat_only_netflix'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "vote_average.desc", "vote_count.gte": "500", "vote_average.gte": "7.5" } },
                { "title": tr('cat_twisted_thrillers'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "with_genres": "53,9648", "sort_by": "popularity.desc" } },
                { "title": tr('cat_fantasy_sci'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_kdrama'), "url": "discover/tv", "params": { "with_networks": "213", "with_original_language": "ko", "sort_by": "popularity.desc" } },
                { "title": tr('cat_truecrime_doc'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "99", "with_keywords": "9840|10714", "sort_by": "popularity.desc" } },
                { "title": tr('cat_anime'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "16", "with_keywords": "210024", "sort_by": "popularity.desc" } }
            ]
        },
        'apple': {
            title: 'Apple TV+',
            logo: 'logos/apple.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": tr('cat_apple_epic_sci'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedy_feelgood'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_quality_detectives'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "9648,80", "sort_by": "popularity.desc" } },
                { "title": tr('cat_apple_original'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "vote_average.desc", "vote_count.gte": "100" } }
            ]
        },
        'hbo': {
            title: 'HBO / Max',
            logo: 'logos/hbo.svg',
            icon: '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77 2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006 1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462 2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0 0 3.872z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "174|49", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies_wb'), "url": "discover/movie", "params": { "with_companies": "174", "sort_by": "popularity.desc", "vote_count.gte": "50" } },
                { "title": tr('cat_epic_sagas'), "url": "discover/tv", "params": { "with_networks": "49|3186", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_premium_dramas'), "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "18", "without_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_dc_blockbusters'), "url": "discover/movie", "params": { "with_companies": "174", "with_keywords": "9715", "sort_by": "revenue.desc" } },
                { "title": tr('cat_dark_detectives'), "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "80,9648", "sort_by": "vote_average.desc", "vote_count.gte": "300" } },
                { "title": tr('cat_hbo_classics'), "url": "discover/tv", "params": { "with_networks": "49", "sort_by": "vote_average.desc", "vote_count.gte": "1000" } }
            ]
        },
        'amazon': {
            title: 'Prime Video',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 15c2.4 1.7 5.1 2.6 8 2.6 2.9 0 5.6-.9 8-2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M15.5 14.4L18 16.8 15.5 19.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "US", "sort_by": "popularity.desc" } },
                { "title": tr('cat_hard_action'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "10759,10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_amazon_mgm'), "url": "discover/movie", "params": { "with_companies": "1024|21", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedies'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_thrillers'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "9648,18", "sort_by": "vote_average.desc", "vote_count.gte": "300" } }
            ]
        },
        'disney': {
            title: 'Disney+',
            logo: 'logos/disney.svg',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10c2.2-2.5 5-3.7 8-3.7 2.2 0 4.1.7 5.8 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M12 13v4M10 15h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "2739", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "337", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "2739", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "2", "sort_by": "popularity.desc" } },
                { "title": tr('cat_marvel_universe'), "url": "discover/movie", "params": { "with_companies": "420", "sort_by": "release_date.desc", "vote_count.gte": "100" } },
                { "title": tr('cat_starwars'), "url": "discover/tv", "params": { "with_companies": "1", "with_keywords": "1930", "sort_by": "popularity.desc" } },
                { "title": tr('cat_pixar'), "url": "discover/movie", "params": { "with_companies": "3", "sort_by": "popularity.desc" } },
                { "title": tr('cat_fx_star'), "url": "discover/tv", "params": { "with_networks": "88|453", "sort_by": "popularity.desc" } }
            ]
        },
        'paramount': {
            title: 'Paramount+',
            logo: 'logos/paramount.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22H22L12 2ZM12 6.5L18.5 19.5H5.5L12 6.5Z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "popularity.desc" } },
                { "title": tr('cat_sheridan_universe'), "url": "discover/tv", "params": { "with_networks": "318|4330", "with_keywords": "256112", "sort_by": "popularity.desc" } },
                { "title": tr('cat_startrek_collection'), "url": "discover/tv", "params": { "with_networks": "4330", "with_keywords": "159223", "sort_by": "first_air_date.desc" } },
                { "title": tr('cat_crime_investigation'), "url": "discover/tv", "params": { "with_networks": "16", "with_genres": "80,18", "sort_by": "popularity.desc" } },
                { "title": tr('cat_kids_world'), "url": "discover/tv", "params": { "with_networks": "13", "sort_by": "popularity.desc" } }
            ]
        },
        'sky_showtime': {
            title: 'Sky Showtime',
            logo: 'logos/SkyShowtime.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 9.5c1-.8 2.2-1.2 3.5-1.2 2 0 3.7 1 4.7 2.6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_companies": "67|115331", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "4|33|521", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_companies": "67|115331", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "4|33", "sort_by": "popularity.desc" } },
                { "title": tr('cat_paramount_blockbusters'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "revenue.desc" } },
                { "title": tr('cat_universal_world'), "url": "discover/movie", "params": { "with_companies": "33", "sort_by": "popularity.desc" } },
                { "title": tr('cat_showtime_adult'), "url": "discover/tv", "params": { "with_companies": "67", "sort_by": "popularity.desc" } },
                { "title": tr('cat_dreamworks_worlds'), "url": "discover/movie", "params": { "with_companies": "521", "sort_by": "popularity.desc" } }
            ]
        },
        'hulu': {
            title: 'Hulu',
            logo: 'logos/Hulu.svg',
            icon: '<svg viewBox="0 0 24 24" fill="#3DBB3D"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "15", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "15", "watch_region": "US", "sort_by": "popularity.desc" } },
                { "title": tr('cat_truecrime_doc'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "18,9648", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedy_feelgood'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_adult_animation'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "16", "sort_by": "popularity.desc" } }
            ]
        },
        'syfy': {
            title: 'Syfy',
            logo: 'logos/Syfy.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>',
            categories: [
                { "title": tr('cat_new_releases_syfy'), "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "1" } },
                { "title": tr('cat_top_syfy'), "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "popularity.desc" } },
                { "title": tr('cat_space_travel'), "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "10765", "with_keywords": "3801", "sort_by": "vote_average.desc", "vote_count.gte": "50" } },
                { "title": tr('cat_monsters_paranormal'), "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "9648,10765", "without_keywords": "3801", "sort_by": "popularity.desc" } }
            ]
        },
        'educational_and_reality': {
            title: tr('educational_title'),
            logo: 'logos/Discovery.svg',
            icon: '<svg viewBox="0 0 24 24" fill="#FF9800"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
            categories: [
                { "title": tr('cat_new_episodes'), "url": "discover/tv", "params": { "with_networks": "64|91|43|2696|4|65", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": "🌍 Discovery Channel", "url": "discover/tv", "params": { "with_networks": "64", "sort_by": "popularity.desc" } },
                { "title": "🦁 National Geographic", "url": "discover/tv", "params": { "with_networks": "43", "sort_by": "popularity.desc" } },
                { "title": "🐾 Animal Planet", "url": "discover/tv", "params": { "with_networks": "91", "sort_by": "popularity.desc" } },
                { "title": "🌿 BBC Earth", "url": "discover/tv", "params": { "with_networks": "4", "with_genres": "99", "sort_by": "vote_average.desc", "vote_count.gte": "20" } },
                { "title": tr('cat_cooking_battles'), "url": "discover/tv", "params": { "with_genres": "10764", "with_keywords": "222083", "sort_by": "popularity.desc" } },
                { "title": tr('cat_survival'), "url": "discover/tv", "params": { "with_genres": "10764", "with_keywords": "5481|10348", "sort_by": "popularity.desc" } }
            ]
        }
    };


    function getTmdbKey() {
        var custom = (Lampa.Storage.get('cinemax_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    /** Для рядка на головній: HBO/Prime/Paramount через watch_providers (TMDB), щоб отримувати і фільми, і серіали з актуальним контентом. */
    var SERVICE_WATCH_PROVIDERS_FOR_ROW = { hbo: '384', amazon: '119', paramount: '531' };

    // =================================================================
    // GLOBAL PLAYER HELPER
    // =================================================================
    function playYouTubeCustom(key) {
        var overlay = $('<div class="youtube-pro-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; background: #000;"></div>');
        var playerContainer = $('<div id="yt-player-custom"></div>');
        var loader = $('<div class="yt-loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #fff; font-size: 1.5em; font-weight: bold; text-align: center;"><div class="broadcast__scan"></div><div>' + tr('loading_trailer') + '</div></div>');
        
        overlay.append(loader);
        overlay.append(playerContainer);
        $('body').append(overlay);
        
        var closePlayer = function() {
            overlay.remove();
            Lampa.Controller.toggle('content'); 
        };
        
        Lampa.Controller.add('youtube_custom_controller', {
            toggle: function() {}, up: function() {}, down: function() {}, left: function() {}, right: function() {},
            enter: function() {}, back: closePlayer
        });
        Lampa.Controller.toggle('youtube_custom_controller');
        
        var initPlayer = function() {
            new YT.Player('yt-player-custom', {
                height: '100%',
                width: '100%',
                videoId: key,
                playerVars: { 'autoplay': 1, 'controls': 1, 'showinfo': 0, 'rel': 0, 'modestbranding': 1, 'iv_load_policy': 3, 'playsinline': 1, 'disablekb': 1, 'fs': 0 },
                events: {
                    'onReady': function(event) { 
                        loader.remove(); // Hide loader
                        event.target.playVideo(); 
                    },
                    'onStateChange': function(event) {
                        if (event.data === 0) { // 0 = ended
                            closePlayer();
                        }
                    },
                    'onError': function(e) { 
                        if (e.data == 150 || e.data == 153) Lampa.Noty.show('Відео обмежено власником (Error ' + e.data + ')');
                        else Lampa.Noty.show('Помилка YouTube: ' + e.data);
                        closePlayer();
                    }
                }
            });
        };
        
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            var oldReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function() { if(oldReady) oldReady(); initPlayer(); };
        } else {
            initPlayer();
        }
    }

    // =================================================================
    // UTILS & COMPONENTS
    // =================================================================

    // Один елемент геро-рядка (backdrop + overlay). heightEm — висота банеру (напр. 28).
    function makeHeroResultItem(movie, heightEm) {
        if (!$('#studios5-hero-css').length) {
            $('body').append('<style id="studios5-hero-css">.hero-banner .card-marks, .hero-banner .card__icons, .hero-banner .card__quality { display: none !important; }</style>');
        }
        if (!$('#studios5-show-more-css').length) {
            $('body').append('<style id="studios5-show-more-css">' +
                '.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.card.show-more-button:focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button:hover { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
            '</style>');
        }
        heightEm = heightEm || 22.5;
        var pad = (heightEm / 35 * 2).toFixed(1);
        var titleEm = (heightEm / 35 * 2.5).toFixed(2);
        var descEm = (heightEm / 35 * 1.1).toFixed(2);

        var renderHeroContent = function(item, movie) {
            item.empty(); // Clear existing content
            item.append('<div class="hero-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: ' + pad + 'em; border-radius: 0 0 1em 1em;">' +
                '<div class="hero-header" style="margin-bottom: 0.3em; min-height: 3em; display: flex; align-items: flex-end;">' +
                    '<div class="hero-title" style="font-size: ' + titleEm + 'em; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">' + (movie.title || movie.name) + '</div>' +
                '</div>' +
                '<div class="hero-meta" style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5em; font-size: 0.9em; color: #ccc; margin-bottom: 0.5em;"></div>' +
                '<div class="hero-desc" style="font-size: ' + descEm + 'em; color: #ddd; max-width: 60%; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.6em;">' + (movie.overview || '') + '</div>' +
                '<div class="hero-trailer-btn selector" style="display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.2); padding: 0.4em 0.8em; border-radius: 0.3em; cursor: pointer; transition: background 0.2s;">' +
                '<svg style="width: 1.2em; height: 1.2em; margin-right: 0.4em;" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                '<span style="font-size: 0.9em; font-weight: 600;">Трейлер</span>' +
                '</div>' +
                '</div>');
            
            // Trailer Click
            item.find('.hero-trailer-btn').on('hover:enter click', function (e) {
                e.stopPropagation();
                var network = new Lampa.Reguest();
                var type = movie.name ? 'tv' : 'movie';
                var lang = Lampa.Storage.get('language', 'uk');
                function search(searchLang) {
                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                    network.silent(url, function (json) {
                        var videos = json.results || [];
                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                        if (trailer && trailer.key) {
                            playYouTubeCustom(trailer.key);
                        } else if (searchLang !== 'en-US') {
                            search('en-US');
                        } else {
                            Lampa.Noty.show('Трейлер не знайдено');
                        }
                    }, function() {
                            if (searchLang !== 'en-US') search('en-US');
                            else Lampa.Noty.show('Помилка пошуку трейлера');
                    });
                }
                search(lang);
            });

            // Fetch Details
            var type = movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language', 'uk');
            var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + getTmdbKey() + '&language=' + lang + '&append_to_response=images,release_dates,content_ratings');
            
            var network = new Lampa.Reguest();
            network.silent(url, function(details) {
                // Logo
                var logo = null;
                if (details.images && details.images.logos && details.images.logos.length) {
                    logo = details.images.logos.find(function(l) { return l.iso_639_1 === lang; }) || 
                           details.images.logos.find(function(l) { return l.iso_639_1 === 'en'; }) || 
                           details.images.logos[0];
                }
                if (logo) {
                    var logoUrl = Lampa.TMDB.image('t/p/w500' + logo.file_path);
                    item.find('.hero-title').html('<img src="' + logoUrl + '" style="height: 4em; width: auto; max-width: 80%; object-fit: contain; display: block;" />');
                    item.find('.hero-header').css('min-height', 'auto');
                }

                // Metadata
                var metaParts = [];
                
                // Rating & Year
                var headMeta = '';
                var rating = details.vote_average || movie.vote_average;
                if (rating) headMeta += '<span class="card__mark card__mark--rating" style="position: static; margin: 0 0.5em 0 0; padding: 0.2em 0.5em; font-size: 0.9em; background: rgba(255,255,255,0.2); border-radius: 0.3em;">★ ' + parseFloat(rating).toFixed(1) + '</span>';
                
                var date = details.release_date || details.first_air_date || movie.release_date || movie.first_air_date;
                if (date) headMeta += parseInt(date);
                
                if (headMeta) metaParts.push(headMeta);
                
                // Type
                var typeStr = type === 'movie' ? Lampa.Lang.translate('movie') : Lampa.Lang.translate('tv');
                if (!typeStr || typeStr === 'movie' || typeStr === 'tv') {
                    typeStr = type === 'movie' ? (lang === 'ru' ? 'Фильм' : 'Фільм') : (lang === 'ru' ? 'Сериал' : 'Серіал');
                }
                metaParts.push(typeStr);
                
                // Age Rating
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
                        if (ageVal >= 18) ageColor = '#d32f2f'; // Red
                        else if (ageVal >= 16) ageColor = '#f57c00'; // Orange
                        else if (ageVal >= 12) ageColor = '#fbc02d'; // Yellow
                        else ageColor = '#388e3c'; // Green
                    } else {
                        // US Ratings Mapping
                        if (['R', 'NC-17', 'TV-MA'].indexOf(age) !== -1) {
                            ageColor = '#d32f2f';
                            displayAge = '18+';
                        } else if (['PG-13', 'TV-14'].indexOf(age) !== -1) {
                            ageColor = '#f57c00';
                            displayAge = '16+';
                        } else if (['PG', 'TV-PG', 'TV-Y7'].indexOf(age) !== -1) {
                            ageColor = '#fbc02d';
                            displayAge = '12+';
                        } else {
                            ageColor = '#388e3c';
                            displayAge = '0+';
                        }
                    }
                    metaParts.push('<span style="border: 1px solid ' + ageColor + '; color: ' + ageColor + '; padding: 0 0.3em; border-radius: 0.2em; font-size: 0.9em; font-weight: bold;">' + displayAge + '</span>');
                }

                // Country
                if (details.production_countries && details.production_countries.length) {
                    metaParts.push(details.production_countries[0].iso_3166_1);
                }
                
                // Duration
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
            title: 'Hero',
            params: {
                createInstance: function (element) {
                    var card = Lampa.Maker.make('Card', element, function (module) { return module.only('Card', 'Callback'); });
                    return card;
                },
                emit: {
                    onCreate: function () {
                        var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                        try {
                            var item = $(this.html);
                            item.addClass('hero-banner');
                            item.css({
                                'background-image': 'url(' + img + ')',
                                'width': '100%',
                                'height': heightEm + 'em',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'border-radius': '1em',
                                'position': 'relative',
                                'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                'margin-bottom': '10px'
                            });
                            
                            renderHeroContent(item, movie);

                            item.find('.card__view').remove();
                            item.find('.card__title').remove();
                            item.find('.card__age').remove();
                            item.find('.card-marks').remove();
                            item.find('.card__icons').remove();
                            item[0].heroMovieData = movie;
                        } catch (e) { console.log('Hero onCreate error:', e); }
                    },
                    onVisible: function () {
                        try {
                            var item = $(this.html);
                            if (!item.hasClass('hero-banner')) {
                                var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                                item.addClass('hero-banner');
                                item.css({
                                    'background-image': 'url(' + img + ')',
                                    'width': '100%',
                                    'height': heightEm + 'em',
                                    'background-size': 'cover',
                                    'background-position': 'center',
                                    'border-radius': '1em',
                                    'position': 'relative',
                                    'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                    'margin-bottom': '10px'
                                });
                                
                                renderHeroContent(item, movie);

                                item.find('.card__view').remove();
                                item.find('.card__title').remove();
                                item.find('.card__age').remove();
                                item.find('.card-marks').remove();
                                item.find('.card__icons').remove();
                                item[0].heroMovieData = movie;
                            }
                            // Stop default image loading
                            if (this.img) this.img.onerror = function () { };
                            if (this.img) this.img.onload = function () { };
                        } catch (e) { console.log('Hero onVisible error:', e); }
                    },
                    onlyEnter: function () {
                        // Функция запуска трейлера (копируем логику из кнопки)
                        var playHeroTrailer = function() {
                             var network = new Lampa.Reguest();
                             var type = movie.name ? 'tv' : 'movie';
                             var lang = Lampa.Storage.get('language', 'uk');
                            
                            function search(searchLang) {
                                var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                                network.silent(url, function (json) {
                                    var videos = json.results || [];
                                    var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                                    if (trailer && trailer.key) {
                                        playYouTubeCustom(trailer.key);
                                    } else if (searchLang !== 'en-US') {
                                        search('en-US');
                                    } else {
                                        Lampa.Noty.show('Трейлер не знайдено');
                                    }
                                }, function() {
                                     if (searchLang !== 'en-US') search('en-US');
                                     else Lampa.Noty.show('Помилка пошуку трейлера');
                                });
                            }
                            search(lang);
                        };

                        // Меню выбора действия
                        Lampa.Select.show({
                            title: tr('menu_title'),
                            items: [
                                { title: tr('menu_details'), action: 'open' },
                                { title: tr('menu_trailer'), action: 'trailer' }
                            ],
                            onSelect: function(a) {
                                if(a.action === 'trailer') {
                                    playHeroTrailer();
                                } else {
                                    Lampa.Activity.push({
                                        url: '',
                                        component: 'full',
                                        id: movie.id,
                                        method: movie.name ? 'tv' : 'movie',
                                        card: movie,
                                        source: 'tmdb'
                                    });
                                }
                            }
                        });
                    },
                    onKey: function(key) {
                        if (key === 'play') {
                           // Копия логики запуска трейлера (можно вынести в отдельную функцию выше, но здесь дублируем для надежности области видимости)
                           var playHeroTrailerKey = function() {
                                  var network = new Lampa.Reguest();
                                  var type = movie.name ? 'tv' : 'movie';
                                  var lang = Lampa.Storage.get('language', 'uk');
                                  
                                function search(searchLang) {
                                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                                    network.silent(url, function (json) {
                                        var videos = json.results || [];
                                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                                        if (trailer && trailer.key) { playYouTubeCustom(trailer.key); } 
                                        else if (searchLang !== 'en-US') { search('en-US'); } 
                                        else { Lampa.Noty.show('Трейлер не знайдено'); }
                                    });
                                }
                                search(lang);
                           };
                           playHeroTrailerKey();
                        }
                    }
                }
            }
        };
    }

    function StudiosMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = SERVICE_CONFIGS[object.service_id];
        if (!config) { comp.empty && comp.empty(); return comp; }

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var categories = config.categories;
            var network = new Lampa.Reguest();
            var total = categories.length; // No hero section
            var status = new Lampa.Status(total);

            status.onComplite = function () {
                var fulldata = [];
                // Hero section removed - only show categories
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var num = parseInt(key, 10);
                        var data = status.data[key];
                        var cat = categories[num];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params,
                                service_id: object.service_id
                            });
                        }
                    });
                }

                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            var refCat = categories.find(function (c) { return c.params && (c.params.with_watch_providers || c.params.with_networks || c.params.with_companies); });
            var filterSuffix = '';
            if (refCat && refCat.params) {
                if (refCat.params.with_watch_providers) {
                    filterSuffix = '&with_watch_providers=' + refCat.params.with_watch_providers + '&watch_region=' + (refCat.params.watch_region || 'UA');
                } else if (refCat.params.with_networks) {
                    filterSuffix = '&with_networks=' + refCat.params.with_networks;
                } else if (refCat.params.with_companies) {
                    filterSuffix = '&with_companies=' + refCat.params.with_companies;
                }
            }

            // Hero section removed - just load categories
            categories.forEach(function (cat, index) {
                var params = [];
                params.push('api_key=' + getTmdbKey());
                params.push('language=' + Lampa.Storage.get('language', 'uk'));
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));

                console.log('[StudiosMain] Category', index + 1, ':', cat.title, 'URL:', url);

                network.silent(url, function (json) {
                    console.log('[StudiosMain] Category', index + 1, 'data received:', json);
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(index.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Українська стрічка» — фільми/серіали/шоу українського виробництва (TMDB)
    // Жанри TV: Reality 10764, Talk 10767
    var UKRAINIAN_FEED_CATEGORIES = [
        { title: tr('ua_new_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ua_new_tv'), url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ua_shows'), url: 'discover/tv', params: { with_origin_country: 'UA', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('ua_trending_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: tr('ua_trending_series'), url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: tr('ua_best_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'CINEMAX_UA_MOVIES', title: tr('ua_all_movies') },
        { type: 'from_global', globalKey: 'CINEMAX_UA_SERIES', title: tr('ua_all_series') }
    ];

    function UkrainianFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = UKRAINIAN_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_origin_country: 'UA' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths for all items
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Польська стрічка» — фільми/серіали/шоу польського виробництва (TMDB)
    var POLISH_FEED_CATEGORIES = [
        { title: tr('pl_new_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('pl_new_tv'), url: 'discover/tv', params: { with_origin_country: 'PL', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('pl_shows'), url: 'discover/tv', params: { with_origin_country: 'PL', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('pl_trending_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'popularity.desc' } },
        { title: tr('pl_trending_series'), url: 'discover/tv', params: { with_origin_country: 'PL', sort_by: 'popularity.desc' } },
        { title: tr('pl_best_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'CINEMAX_PL_MOVIES', title: tr('pl_all_movies') },
        { type: 'from_global', globalKey: 'CINEMAX_PL_SERIES', title: tr('pl_all_series') },
        { type: 'from_global', globalKey: 'CINEMAX_PL_SHOWS', title: tr('pl_all_shows') }
    ];

    function PolishFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = POLISH_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_origin_country: 'PL' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Російська стрічка» — фільми/серіали/шоу російською мовою (TMDB)
    var RUSSIAN_FEED_CATEGORIES = [
        { title: tr('ru_new_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ru_new_tv'), url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ru_shows'), url: 'discover/tv', params: { with_original_language: 'ru', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('ru_trending_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'popularity.desc' } },
        { title: tr('ru_trending_series'), url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'popularity.desc' } },
        { title: tr('ru_best_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'CINEMAX_RU_MOVIES', title: tr('ru_all_movies') },
        { type: 'from_global', globalKey: 'CINEMAX_RU_SERIES', title: tr('ru_all_series') },
        { type: 'from_global', globalKey: 'CINEMAX_RU_SHOWS', title: tr('ru_all_shows') }
    ];

    function RussianFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = RUSSIAN_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_original_language: 'ru' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    function StudiosView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        function buildUrl(page) {
            var params = [];
            params.push('api_key=' + getTmdbKey());
            params.push('language=' + Lampa.Storage.get('language', 'uk'));
            params.push('page=' + page);

            if (object.params) {
                for (var key in object.params) {
                    var val = object.params[key];
                    if (val === '{current_date}') {
                        var d = new Date();
                        val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    }
                    params.push(key + '=' + val);
                }
            }
            return Lampa.TMDB.api(object.url + '?' + params.join('&'));
        }

        comp.create = function () {
            var _this = this;
            network.silent(buildUrl(1), function (json) {
                // FIX: Ensure all items have poster_path for display
                // If backdrop_path exists but poster_path doesn't, use backdrop_path
                if (json && json.results && Array.isArray(json.results)) {
                    json.results.forEach(function (item) {
                        if (!item.poster_path && item.backdrop_path) {
                            item.poster_path = item.backdrop_path;
                        }
                    });
                }
                _this.build(json);
            }, this.empty.bind(this));
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            network.silent(buildUrl(object.page), resolve, reject);
        };

        return comp;
    }

    // =================================================================
    // ПІДПИСКИ НА СТУДІЇ (Ліхтар — інтегровано з studio_subscription)
    // =================================================================
    var CinemaXStudioSubscription = (function () {
        var storageKey = 'cinemax_subscription_studios';

        function getParams() {
            var raw = Lampa.Storage.get(storageKey, '[]');
            return typeof raw === 'string' ? (function () { try { return JSON.parse(raw); } catch (e) { return []; } })() : (Array.isArray(raw) ? raw : []);
        }

        function setParams(params) {
            Lampa.Storage.set(storageKey, params);
        }

        function add(company) {
            var c = { id: company.id, name: company.name || '', logo_path: company.logo_path || '' };
            var studios = getParams();
            if (!studios.find(function (s) { return String(s.id) === String(c.id); })) {
                studios.push(c);
                setParams(studios);
                Lampa.Noty.show(Lampa.Lang.translate('title_bookmarked') || 'Додано в підписки');
            }
        }

        function remove(company) {
            var studios = getParams();
            var idx = studios.findIndex(function (c) { return c.id === company.id; });
            if (idx !== -1) {
                studios.splice(idx, 1);
                setParams(studios);
                Lampa.Noty.show(Lampa.Lang.translate('title_unbookmarked'));
            }
        }

        function isSubscribed(company) {
            return !!getParams().find(function (c) { return c.id === company.id; });
        }

        function injectButton(object) {
            var attempts = 0;
            var interval = setInterval(function () {
                var nameEl = $('.company-start__name');
                var company = object.company;
                if (!nameEl.length || !company || !company.id) {
                    attempts++;
                    if (attempts > 25) clearInterval(interval);
                    return;
                }
                clearInterval(interval);
                if (nameEl.find('.studio-subscription-btn').length) return;

                var btn = $('<div class="studio-subscription-btn selector"></div>');

                function updateState() {
                    var sub = isSubscribed(company);
                    btn.text(sub ? 'Відписатися' : 'Підписатися');
                    btn.removeClass('studio-subscription-btn--sub studio-subscription-btn--unsub').addClass(sub ? 'studio-subscription-btn--unsub' : 'studio-subscription-btn--sub');
                }

                function doToggle() {
                    if (isSubscribed(company)) remove(company);
                    else add({ id: company.id, name: company.name || '', logo_path: company.logo_path || '' });
                    updateState();
                }

                btn.on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    doToggle();
                });
                btn.on('hover:enter', doToggle);

                updateState();
                nameEl.append(btn);

                // Auto-focus the subscription button so it's visible immediately
                setTimeout(function () {
                    try {
                        if (Lampa.Controller && Lampa.Controller.collectionFocus) {
                            Lampa.Controller.collectionFocus(btn[0]);
                        }
                    } catch (e) { }
                }, 300);
            }, 200);
        }

        function registerComponent() {
            // Удален компонент "Мои подписки"
        }

        return {
            init: function () {
                var existing = Lampa.Storage.get(storageKey, '[]');
                var fromOld = Lampa.Storage.get('subscription_studios', '[]');
                if ((!existing || existing === '[]' || (Array.isArray(existing) && !existing.length)) && fromOld && fromOld !== '[]') {
                    try {
                        var arr = typeof fromOld === 'string' ? JSON.parse(fromOld) : fromOld;
                        if (Array.isArray(arr) && arr.length) setParams(arr);
                    } catch (e) { }
                }
                registerComponent();
            }
        };
    })();

    // =================================================================
    // MAIN PAGE ROWS
    // =================================================================

    // ========== Прибираємо секцію Shots ==========
    function removeShotsSection() {
        function doRemove() {
            $('.items-line').each(function () {
                var title = $(this).find('.items-line__title').text().trim();
                if (title === 'Shots' || title === 'shots') {
                    $(this).remove();
                }
            });
        }
        // Виконуємо із затримкою, бо Shots може підвантажитись пізніше
        setTimeout(doRemove, 1000);
        setTimeout(doRemove, 3000);
        setTimeout(doRemove, 6000);
    }

    // ========== ROW 1: HERO SLIDER (New Releases) ==========
    function addHeroRow() {
        Lampa.ContentRows.add({
            index: 0,
            name: 'custom_hero_row',
            title: tr('hero_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    // Fetch Now Playing movies (Fresh releases)
                    var url = Lampa.TMDB.api('movie/now_playing?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk') + '&region=UA');

                    network.silent(url, function (json) {
                        var items = json.results || [];
                        if (!items.length) {
                            // Fallback if no fresh movies
                            url = Lampa.TMDB.api('trending/all/week?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk'));
                            network.silent(url, function (retryJson) {
                                items = retryJson.results || [];
                                build(items);
                            });
                            return;
                        }
                        build(items);

                        function build(movies) {
                            var moviesWithBackdrop = movies.filter(function (m) { return m.backdrop_path; });
                            var results = moviesWithBackdrop.slice(0, 15).map(function (movie) { return makeHeroResultItem(movie, 22.5); });

                            callback({
                                results: results,
                                title: tr('hero_row_title_full'),
                                params: {
                                    items: {
                                        mapping: 'line',
                                        view: 15
                                    }
                                }
                            });
                        }

                    }, function () {
                        callback({ results: [] });
                    });
                };
            }
        });
    }

    // ========== ROW 2: STUDIOS (Moved Up) ==========
    function addStudioRow() {
    var studios = [
        { 
            id: 'netflix', 
            name: 'Netflix', 
            svg: '<svg viewBox="0 0 256 69" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35.2 64.726c-3.85.676-7.77.88-11.823 1.42L11.013 29.93V67.7c-3.85.405-7.364.946-11.013 1.486V0h10.27l14.053 39.255V0H35.2v64.726zm21.283-39.39l14.46-.203v10.8l-14.46.203v16.08l19.12-1.15v10.404l-29.93 2.365V0h29.93v10.8h-19.12v14.526zm59.32-14.526H104.59v49.727l-10.8.135V10.81H82.564V0h33.24v10.81zm17.567 13.783h14.797v10.8H133.37V59.93h-10.608V0h30.202v10.8H133.37v13.783zm37.16 25.877c6.15.135 12.364.608 18.377.946V62.09l-29.187-1.42V0h10.8v50.47zm27.5 12.364c3.446.203 7.094.406 10.607.81V0H198.03v62.835zM256 0l-13.716 32.904L256 69.186c-4.054-.54-8.108-1.284-12.162-1.96l-7.77-19.998-7.904 18.378c-3.92-.676-7.703-.88-11.62-1.42l13.918-31.688L217.894 0h11.62l7.094 18.175L244.176 0H256z" fill="#E50914"/></svg>', 
            providerId: '8' 
        },
        { 
            id: 'disney', 
            name: 'Disney+', 
            svg: '<svg viewBox="0 0 1041 565" xmlns="http://www.w3.org/2000/svg"><path fill="#113CCF" fill-rule="evenodd" d="M735.8 365.7 C721.4 369 683.5 370.9 683.5 370.9 L678.7 385.9 C678.7 385.9 697.6 384.3 711.4 385.7 711.4 385.7 715.9 385.2 716.4 390.8 716.6 396 716 401.6 716 401.6 716 401.6 715.7 405 710.9 405.8 705.7 406.7 670.1 408 670.1 408 L664.3 427.5 C664.3 427.5 662.2 432 667 430.7 671.5 429.5 708.8 422.5 713.7 423.5 718.9 424.8 724.7 431.7 723 438.1 721 445.9 683.8 469.7 661.1 468 661.1 468 649.2 468.8 639.1 452.7 629.7 437.4 642.7 408.3 642.7 408.3 642.7 408.3 636.8 394.7 641.1 390.2 641.1 390.2 643.7 387.9 651.1 387.3 L660.2 368.4 C660.2 368.4 649.8 369.1 643.6 361.5 637.8 354.2 637.4 350.9 641.8 348.9 646.5 346.6 689.8 338.7 719.6 339.7 719.6 339.7 730 338.7 738.9 356.7 738.8 356.7 743.2 364 735.8 365.7 Z M623.7 438.3 C619.9 447.3 609.8 456.9 597.3 450.9 584.9 444.9 565.2 404.6 565.2 404.6 565.2 404.6 557.7 389.6 556.3 389.9 556.3 389.9 554.7 387 553.7 403.4 552.7 419.8 553.9 451.7 547.4 456.7 541.2 461.7 533.7 459.7 529.8 453.8 526.3 448 524.8 434.2 526.7 410 529 385.8 534.6 360 541.8 351.9 549 343.9 554.8 349.7 557 351.8 557 351.8 566.6 360.5 582.5 386.1 L585.3 390.8 C585.3 390.8 599.7 415 601.2 414.9 601.2 414.9 602.4 416 603.4 415.2 604.9 414.8 604.3 407 604.3 407 604.3 407 601.3 380.7 588.2 336.1 588.2 336.1 586.2 330.5 587.6 325.3 588.9 320 594.2 322.5 594.2 322.5 594.2 322.5 614.6 332.7 624.4 365.9 634.1 399.4 627.5 429.3 623.7 438.3 Z M523.5 353 C521.8 356.4 520.8 361.3 512.2 362.6 512.2 362.6 429.9 368.2 426 374 426 374 423.1 377.4 427.6 378.4 432.1 379.3 450.7 381.8 459.7 382.3 469.3 382.4 501.7 382.7 513.3 397.2 513.3 397.2 520.2 404.1 519.9 419.7 519.6 435.7 516.8 441.3 510.6 447.1 504.1 452.5 448.3 477.5 412.3 439.1 412.3 439.1 395.7 420.6 418 406.6 418 406.6 434.1 396.9 475 408.3 475 408.3 487.4 412.8 486.8 417.3 486.1 422.1 476.6 427.2 462.8 426.9 449.4 426.5 439.6 420.1 441.5 421.1 443.3 421.8 427.1 413.3 422.1 419.1 417.1 424.4 418.3 427.7 423.2 431 435.7 438.1 484 435.6 498.4 419.6 498.4 419.6 504.1 413.1 495.4 407.8 486.7 402.8 461.8 399.8 452.1 399.3 442.8 398.8 408.2 399.4 403.2 390.2 403.2 390.2 398.2 384 403.7 366.4 409.5 348 449.8 340.9 467.2 339.3 467.2 339.3 515.1 337.6 523.9 347.4 523.8 347.4 525 349.7 523.5 353 Z M387.5 460.9 C381.7 465.2 369.4 463.3 365.9 458.5 362.4 454.2 361.2 437.1 361.9 410.3 362.6 383.2 363.2 349.6 369 344.3 375.2 338.9 379 343.6 381.4 347.3 384 350.9 387.1 354.9 387.8 363.4 388.4 371.9 390.4 416.5 390.4 416.5 390.4 416.5 393 456.7 387.5 460.9 Z M400 317.1 C383.1 322.7 371.5 320.8 361.7 316.6 357.4 324.1 354.9 326.4 351.6 326.9 346.8 327.4 342.5 319.7 341.7 317.2 340.9 315.3 338.6 312.1 341.4 304.5 331.8 295.9 331.1 284.3 332.7 276.5 335.1 267.5 351.3 233.3 400.6 229.3 400.6 229.3 424.7 227.5 428.8 240.4 L429.5 240.4 C429.5 240.4 452.9 240.5 452.4 261.3 452.1 282.2 426.4 308.2 400 317.1 Z M354 270.8 C349 278.8 348.8 283.6 351.1 286.9 356.8 278.2 367.2 264.5 382.5 254.1 370.7 255.1 360.8 260.2 354 270.8 Z M422.1 257.4 C406.6 259.7 382.6 280.5 371.2 297.5 388.7 300.7 419.6 299.5 433.3 271.6 433.2 271.6 439.8 254.3 422.1 257.4 Z M842.9 418.5 C833.6 434.7 807.5 468.5 772.7 460.6 761.2 488.5 751.6 516.6 746.1 558.8 746.1 558.8 744.9 567 738.1 564.1 731.4 561.7 720.2 550.5 718 535 715.6 514.6 724.7 480.1 743.2 440.6 737.8 431.8 734.1 419.2 737.3 401.3 737.3 401.3 742 368.1 775.3 338.1 775.3 338.1 779.3 334.6 781.6 335.7 784.2 336.8 783 347.6 780.9 352.8 778.8 358 763.9 383.8 763.9 383.8 763.9 383.8 754.6 401.2 757.2 414.9 774.7 388 814.5 333.7 839.2 350.8 847.5 356.7 851.3 369.6 851.3 383.5 851.2 395.8 848.3 408.8 842.9 418.5 Z M835.7 375.9 C835.7 375.9 834.3 365.2 823.9 377 814.9 386.9 798.7 405.6 785.6 430.9 799.3 429.4 812.5 421.9 816.5 418.1 823 412.3 838.1 396.7 835.7 375.9 Z M350.2 389.5 C348.3 413.7 339 454.4 273.1 474.5 229.6 487.6 188.5 481.3 166.1 475.6 165.6 484.5 164.6 488.3 163.2 489.8 161.3 491.7 147.1 499.9 139.3 488.3 135.8 482.8 134 472.8 133 463.9 82.6 440.7 59.4 407.3 58.5 405.8 57.4 404.7 45.9 392.7 57.4 378 68.2 364.7 103.5 351.4 135.3 346 136.4 318.8 139.6 298.3 143.4 288.9 148 278 153.8 287.8 158.8 295.2 163 300.7 165.5 324.4 165.7 343.3 186.5 342.3 198.8 343.8 222 348 252.2 353.5 272.4 368.9 270.6 386.4 269.3 403.6 253.5 410.7 247.5 411.2 241.2 411.7 231.4 407.2 231.4 407.2 224.7 404 230.9 401.2 239 397.7 247.8 393.4 245.8 389 245.8 389 242.5 379.4 203.3 372.7 164.3 372.7 164.1 394.2 165.2 429.9 165.7 450.7 193 455.9 213.4 454.9 213.4 454.9 213.4 454.9 313 452.1 316 388.5 319.1 324.8 216.7 263.7 141 244.3 65.4 224.5 22.6 238.3 18.9 240.2 14.9 242.2 18.6 242.8 18.6 242.8 18.6 242.8 22.7 243.4 29.8 245.8 37.3 248.2 31.5 252.1 31.5 252.1 18.6 256.2 4.1 253.6 1.3 247.7 -1.5 241.8 3.2 236.5 8.6 228.9 14 220.9 19.9 221.2 19.9 221.2 113.4 188.8 227.3 247.4 227.3 247.4 334 301.5 352.2 364.9 350.2 389.5 Z M68 386.2 C57.4 391.4 64.7 398.9 64.7 398.9 84.6 420.3 109.1 433.7 132.4 442 135.1 405.1 134.7 392.1 135 373.5 98.6 376 77.6 381.8 68 386.2 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M1040.9 378.6 L1040.9 391.8 C1040.9 394.7 1038.6 397 1035.7 397 L972.8 397 C972.8 400.3 972.9 403.2 972.9 405.9 972.9 425.4 972.1 441.3 970.2 459.2 969.9 461.9 967.7 463.9 965.1 463.9 L951.5 463.9 C950.1 463.9 948.8 463.3 947.9 462.3 947 461.3 946.5 459.9 946.7 458.5 948.6 440.7 949.5 425 949.5 405.9 949.5 403.1 949.5 400.2 949.4 397 L887.2 397 C884.3 397 882 394.7 882 391.8 L882 378.6 C882 375.7 884.3 373.4 887.2 373.4 L948.5 373.4 C947.2 351.9 944.6 331.2 940.4 310.2 940.2 308.9 940.5 307.6 941.3 306.6 942.1 305.6 943.3 305 944.6 305 L959.3 305 C961.6 305 963.5 306.6 964 308.9 968.1 330.6 970.7 351.7 972 373.4 L1035.7 373.4 C1038.5 373.4 1040.9 375.8 1040.9 378.6 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M200.2 204.3 L200.1 204.3 M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.3 198.8 204.4 199.1 204.4 199.4 204.4 L199.7 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.3 198.8 204.4 199.1 204.4 199.4 204.4 L199.7 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M955.3 273.9 C922.8 194 867.9 125.9 796.5 76.9 723.4 26.8 637.7 0.3 548.7 0.3 401.5 0.3 264.9 73.4 183.4 195.9 182.5 197.2 182.3 198.9 182.8 200.4 183.3 202 184.5 203.1 186 203.6 L197.4 207.5 C198.1 207.7 198.8 207.8 199.4 207.8 201.5 207.8 203.5 206.7 204.7 205 242.1 150 292.7 104.3 351.1 72.7 411.4 40.1 479.7 22.8 548.6 22.8 631.9 22.8 712.2 47.4 781 93.8 848.1 139.1 900.2 202.4 931.7 276.7 932.6 278.9 934.8 280.4 937.2 280.4 L950.8 280.4 C952.4 280.4 953.9 279.6 954.7 278.3 955.7 277 955.9 275.4 955.3 273.9 Z M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.2 198.8 204.3 199.1 204.4 199.4 204.4 L199.6 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z M934.4 278.6 C934.7 278.8 935 279 935.3 279.1 935 278.9 934.7 278.8 934.4 278.6 Z" /></svg>', 
            providerId: '337' 
        },
        { 
            id: 'hbo', 
            name: 'HBO', 
            svg: '<svg viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77 2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006 1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462 2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0 0 3.872Z"/></svg>', 
            providerId: '384' 
        },
        { 
            id: 'apple', 
            name: 'Apple TV+', 
            svg: '<svg viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M20.57 17.735h-1.815l-3.34-9.203h1.633l2.02 5.987c.075.231.273.9.586 2.012l.297-.997.33-1.006 2.094-6.004H24zm-5.344-.066a5.76 5.76 0 0 1-1.55.207c-1.23 0-1.84-.693-1.84-2.087V9.646h-1.063V8.532h1.121V7.081l1.476-.602v2.062h1.707v1.113H13.38v5.805c0 .446.074.75.214.932.14.182.396.264.75.264.207 0 .495-.041.883-.115zm-7.29-5.343c.017 1.764 1.55 2.358 1.567 2.366-.017.042-.248.842-.808 1.658-.487.71-.99 1.418-1.79 1.435-.783.016-1.03-.462-1.93-.462-.89 0-1.17.445-1.913.478-.758.025-1.344-.775-1.838-1.484-.998-1.451-1.765-4.098-.734-5.88.51-.89 1.426-1.451 2.416-1.46.75-.016 1.468.512 1.93.512.461 0 1.327-.627 2.234-.536.38.016 1.452.157 2.136 1.154-.058.033-1.278.743-1.27 2.219M6.468 7.988c.404-.495.685-1.18.61-1.864-.585.025-1.294.388-1.723.883-.38.437-.71 1.138-.619 1.806.652.05 1.328-.338 1.732-.825Z"/></svg>', 
            providerId: '350' 
        },
        { 
            id: 'amazon', 
            name: 'Prime Video', 
            svg: '<svg viewBox="0 -.1 800.3 246.4" xmlns="http://www.w3.org/2000/svg"><path d="m396.5 246.3v-.4c.4-.5 1.1-.8 1.7-.7 2.9-.1 5.7-.1 8.6 0 .6 0 1.3.2 1.7.7v.4z" fill="#00a8e1"/><path d="m408.5 245.9c-4-.1-8-.1-12 0-5.5-.3-11-.5-16.5-.9-14.6-1.1-29.1-3.3-43.3-6.6-49.1-11.4-92.2-34.3-129.8-67.6-3.5-3.1-6.8-6.3-10.2-9.5-.8-.7-1.5-1.7-1.9-2.7-.6-1.4-.3-2.9.7-4s2.6-1.5 4-.9c.9.4 1.8.8 2.6 1.3 35.9 22.2 75.1 38.4 116.2 48 13.8 3.2 27.7 5.7 41.7 7.5 20.1 2.5 40.4 3.4 60.6 2.7 10.9-.3 21.7-1.3 32.5-2.7 25.2-3.2 50.1-8.9 74.2-16.9 12.7-4.2 25.1-9 37.2-14.6 1.8-1 4-1.3 6-.8 3.3.8 5.3 4.2 4.5 7.5-.1.4-.3.9-.5 1.3-.8 1.5-1.9 2.8-3.3 3.8-11.5 9-23.9 16.9-37 23.5-24.7 12.5-51.1 21.4-78.3 26.5-15.7 2.8-31.5 4.5-47.4 5.1zm-148.1-202.7c2.5-1.5 5.1-3.1 7.8-4.5 7-3.6 14.8-5.4 22.7-5 5.7.3 10.9 1.9 14.9 6.1 3.8 3.9 5.2 8.7 5.6 13.9.1 1.1.1 2.2.1 3.4v51.8c0 4.5-.6 5.1-5.1 5.1h-12.2c-.8 0-1.6 0-2.4-.1-1.2-.1-2.2-1.1-2.4-2.3-.2-1.1-.2-2.2-.2-3.3v-46.3c.1-1.9-.1-3.7-.6-5.5-.8-3.1-3.6-5.3-6.8-5.5-5.9-.4-11.8.8-17.2 3.3-.8.2-1.3 1-1.2 1.8v52.6c0 1 0 1.9-.2 2.9 0 1.4-1.1 2.4-2.5 2.4-1.5.1-3 .1-4.6.1h-10.6c-3.7 0-4.5-.9-4.5-4.6v-47.3c0-1.7-.1-3.5-.5-5.2-.7-3.4-3.6-5.8-7-6-6-.4-12.1.8-17.5 3.4-.8.2-1.3 1.1-1.1 1.9v53.3c0 3.7-.8 4.5-4.5 4.5h-13.4c-3.5 0-4.4-1-4.4-4.4v-69.4c0-.8.1-1.6.3-2.4.4-1.2 1.6-1.9 2.8-1.9h12.5c1.8 0 2.9 1.1 3.5 2.8.5 1.4.8 2.7 1.3 4.2 1 0 1.6-.7 2.3-1.1 5.5-3.4 11.3-6.3 17.8-7.5 5-1 10-1 15 0 4.7 1 8.9 3.8 11.6 7.8.2.3.4.5.6.7-.1.1 0 .1.1.3z" fill="#00a8e1"/><path d="m467.7 93c.6-2 1.2-3.9 1.8-5.9 4.6-15.5 9.2-30.9 13.8-46.4l.6-1.8c.5-1.8 2.2-2.9 4-2.9h15.2c3.8 0 4.6 1.1 3.3 4.7l-6 15.9c-6.7 17.4-13.4 34.9-20.1 52.3-.2.6-.5 1.2-.7 1.8-.7 2.1-2.8 3.5-5 3.3-4.4-.1-8.8-.1-13.2 0-3.1.1-4.9-1.3-6-4.1-2.5-6.6-5.1-13.3-7.6-19.9-6-15.7-12.1-31.4-18.1-47.2-.6-1.2-1-2.6-1.3-3.9-.3-2 .4-3 2.4-3 5.7-.1 11.4 0 17 0 2.4 0 3.5 1.6 4.1 3.7 1.1 3.8 2.2 7.7 3.4 11.5 4.1 13.9 8.1 27.9 12.2 41.8-.1.1 0 .1.2.1z" fill="#000000"/><path d="m112.6 47c.7-.2 1.3-.6 1.7-1.2 1.8-1.8 3.7-3.5 5.7-5.1 5.2-4 11.7-6 18.2-5.5 2.6.1 3.5.9 3.7 3.4.2 3.4.1 6.9.1 10.3.1 1.4 0 2.7-.2 4.1-.4 1.8-1.1 2.5-2.9 2.7-1.4.1-2.7 0-4.1-.1-6.7-.6-13.2.7-19.5 2.8-1.4.5-1.4 1.5-1.4 2.6v48c0 .9 0 1.7-.1 2.6-.1 1.3-1.1 2.3-2.4 2.3-.7.1-1.5.1-2.2.1h-13c-.7 0-1.5 0-2.2-.1-1.3-.1-2.3-1.2-2.4-2.5-.1-.8-.1-1.6-.1-2.4v-68c0-4.6.5-5.1 5.1-5.1h9.6c2.6 0 3.8.9 4.5 3.4s1.3 5 1.9 7.7zm467.8 101.4c6.6.2 13.1.6 19.5 2.3 1.8.5 3.5 1.1 5.2 1.9 2.3.9 3.8 3.1 4.1 5.5.4 2.8.5 5.7.3 8.6-1.3 17.1-6.6 33.6-15.4 48.3-3.2 5.3-7.1 10.1-11.6 14.3-.9.9-2 1.6-3.2 2-1.9.5-3.1-.5-3.2-2.4.1-1 .3-2 .7-3 3.5-9.4 6.9-18.7 9.6-28.4 1.6-5.3 2.7-10.7 3.4-16.2.2-2 .3-4 .1-6-.1-3.4-2.3-6.3-5.6-7.3-3.1-1-6.3-1.6-9.6-1.8-9.2-.4-18.4 0-27.5 1.2l-12.1 1.5c-1.3.1-2.5 0-3.2-1.2s-.4-2.4.3-3.6c.8-1.1 1.8-2.1 3-2.8 7.4-5.3 15.7-8.5 24.5-10.6 6.8-1.4 13.7-2.1 20.7-2.3z" fill="#00a8e1"/><path d="m538.5 75v36c-.2 2-1.1 2.9-3.1 3-5.4.1-10.7.1-16.1 0-2 0-2.9-1-3.1-2.9-.1-.6-.1-1.3-.1-1.9v-69.2c.1-3.1.9-4 4-4h14.4c3.1 0 4 .9 4 4z" fill="#000000"/><path d="m151.6 74.8v-35.5c.1-2.4 1-3.3 3.4-3.4 5.2-.1 10.4-.1 15.6 0 2.3 0 3 .7 3.2 3 .1.9.1 1.7.1 2.6v66.6c0 1.1-.1 2.2-.2 3.3-.1 1.3-1.1 2.2-2.4 2.3-.6.1-1.1.1-1.7.1h-13.9c-.5 0-.9 0-1.4-.1-1.4-.1-2.6-1.2-2.7-2.6-.1-.8-.1-1.6-.1-2.4.1-11.1.1-22.5.1-33.9zm11.6-74.7c1.6-.1 3.2.2 4.7.7 5.4 1.8 8.2 6.5 7.7 12.6-.4 5.2-4.3 9.4-9.5 10.2-2.2.4-4.5.4-6.7 0-5.7-1.1-9.9-5.3-9.5-12.5.6-7.1 5.3-11 13.3-11z" fill="#00a8e1"/><path d="m527.4.1c2-.2 4 .2 5.9 1 3.9 1.5 6.6 5.1 6.8 9.3.8 9.1-5.3 13.7-13.4 13.5-1.1 0-2.2-.2-3.3-.4-6.2-1.5-9.4-6.3-8.8-13.2.5-5.5 4.8-9.6 10.7-10.1.7-.1 1.4-.2 2.1-.1z" fill="#000000"/><path d="m76.7 66.6c-.4-5.2-1.8-10.3-3.9-15-4.1-8.6-10.4-14.9-20-17.1-11-2.4-20.9 0-29.9 6.7-.6.6-1.3 1.1-2.1 1.5-.2-.1-.4-.2-.4-.3-.3-1-.5-2-.8-3-.8-2.5-1.8-3.4-4.5-3.4-3 0-6.1.1-9.1 0-2.3-.1-4.4.2-6 2 0 35 0 70.1.1 105 1.3 2.1 3.3 2.5 5.6 2.4 3.6-.1 7.2 0 10.8 0 6.3 0 6.3 0 6.3-6.2v-28.5c0-.7-.3-1.5.4-2.1 5 3.9 11.1 6.3 17.4 6.9 8.8.9 16.8-1.3 23.5-7.3 4.9-4.5 8.5-10.3 10.4-16.7 2.7-8.2 2.9-16.5 2.2-24.9zm-23.9 20.7c-.7 3.1-2.3 5.9-4.6 8-2.6 2.2-5.8 3.5-9.2 3.5-5.1.3-10.1-.8-14.6-3.2-1.1-.5-1.8-1.6-1.7-2.8v-18.1c0-6 .1-12 0-18-.1-1.4.7-2.6 2-3.1 5.5-2.6 11.2-3.8 17.2-2.6 4.2.6 7.8 3.3 9.5 7.2 1.5 3.2 2.4 6.7 2.6 10.2.6 6.4.6 12.8-1.2 18.9z" fill="#00a8e1"/><path d="m800.1 82.2c0-.1 0-.1 0 0zm.1-13.4v.4c-.4-.4-.6-1-.4-1.5v-.8s0-.1.1-.1h-.1v-1h.2c0-.1-.1-.1-.1-.2-.2-1.9-.6-3.8-1.1-5.6-3.7-13.2-12-21.9-25.5-25.3-6.3-1.5-12.7-1.7-19.1-.7-13.5 2-23.2 9.2-27.9 22-4.6 12.2-4.5 25.6.1 37.8 4 11.1 12 18.1 23.5 21 6.1 1.5 12.5 1.9 18.8 1 21-2.5 29.7-18.4 31.1-32.2h-.1v-1.4c-.1-.6-.2-1.1.4-1.5v.2c0-.1.1-.3.2-.4v-11.5c0-.1-.1-.1-.1-.2zm-24 19c-.6 2.1-1.5 4-2.8 5.8-2.2 3.1-5.7 5.1-9.5 5.4-1.9.2-3.8.2-5.7-.2-4.2-.8-7.7-3.6-9.4-7.5-1.5-3.1-2.4-6.5-2.7-9.9-.5-5.9-.6-11.8.8-17.6.5-2.3 1.5-4.6 2.7-6.6 2.2-3.6 6-5.9 10.2-6.2 1.9-.2 3.8-.2 5.7.2 4 .8 7.3 3.4 9.1 7.1 1.7 3.5 2.7 7.4 2.9 11.3.1 1.8.2 3.6.1 5.4.3 4.4-.2 8.7-1.4 12.8zm-151.3-87h-13.9c-3.8 0-4.5.7-4.5 4.5v32.4c0 .7.3 1.4-.2 2.1-.9-.1-1.4-.7-2.1-1.1-10.4-6.1-21.3-7.2-32.3-2.1-7.7 3.6-12.5 10.1-15.6 17.8-3 7.4-3.7 15.2-3.5 23.1 0 7.4 1.7 14.7 5 21.3 3.8 7.3 9.3 12.9 17.3 15.3 10.9 3.4 21.1 1.7 30.4-5.2.7-.4 1.1-1.1 2-1.3.5 1.1.9 2.3 1.1 3.5.4 1.6 1.8 2.7 3.5 2.7h2.4c3.6 0 7.1.1 10.6 0 2.8 0 3.6-.9 3.7-3.8v-105.4c-.1-3.1-.9-3.8-3.9-3.8zm-18.3 73.6v18.2c.2 1.2-.5 2.3-1.6 2.8-4.8 2.7-10.3 3.8-15.7 3-4.6-.5-8.6-3.3-10.7-7.4-1.6-3.2-2.5-6.6-2.8-10.1-.8-6.3-.3-12.7 1.2-18.8.5-1.7 1.1-3.3 2-4.9 2.1-3.9 6.1-6.4 10.5-6.7 5.3-.5 10.6.5 15.4 2.7 1.2.4 1.9 1.6 1.8 2.9-.2 6.2-.1 12.2-.1 18.3z" fill="#000000"/><path d="m348 81.3c7.5 1.4 15.2 1.5 22.7.3 4.4-.6 8.6-1.9 12.5-4 4.5-2.6 7.8-6.2 9.2-11.2 3.5-12.6-1.9-25.3-15-30-6.4-2.1-13.2-2.8-19.9-1.9-15.8 1.8-26.1 10.5-30.8 25.6-3.3 10.3-2.9 20.8-.2 31.2 3.5 13.3 12.3 21.2 25.6 24 7.6 1.7 15.3 1.4 22.9.2 4-.7 8-1.7 11.8-3.2 2.3-.9 3.5-2.3 3.4-4.9-.1-2.4 0-4.9 0-7.4 0-3-1.2-3.9-4.1-3.2s-5.7 1.3-8.6 1.9c-6.2 1.3-12.6 1.3-18.8.2-8.5-1.7-14-9-13.5-18 .9.1 1.9.2 2.8.4zm-2.5-15.3c.3-2.4 1-4.7 1.9-6.9 3-7.3 9.3-9.8 15.7-9.4 1.8.1 3.6.5 5.3 1.2 2.6 1.1 4.3 3.5 4.6 6.3.3 1.7.2 3.5-.3 5.2-1.2 3.6-4.1 5.1-7.6 5.8-2.1.5-4.3.7-6.5.5-3.9 0-7.9-.3-11.8-.9-1.5-.2-1.5-.2-1.3-1.8z" fill="#00a8e1"/><path d="m685.3 82.3c5.8-.4 11.6-1.5 16.8-4.3 5.3-2.6 9-7.5 10.1-13.3.7-3.6.7-7.4-.1-11-2.1-9-7.8-14.6-16.4-17.5-4.8-1.5-9.9-2.1-14.9-1.9-16.8.4-29.6 8.9-34.8 25.7-3.5 11.1-3 22.4.4 33.5 3.5 11.4 11.5 18.3 22.9 21.4 4.9 1.2 10 1.7 15 1.5 7.3-.1 14.6-1.5 21.5-4.1 2.9-1.1 3.6-2.1 3.6-5.2v-7.2c-.1-2.9-1.3-3.9-4.2-3.2-2.2.6-4.3 1.1-6.5 1.6-6.7 1.6-13.7 1.9-20.5.7-6.8-1.3-11.4-5.2-13.2-12-.5-2-.9-4-1.1-6.1.5 0 1 0 1.4.2 6.6 1.2 13.3 1.7 20 1.2zm-20.9-16c.7-3.9 1.6-7.7 4-10.9 3.7-4.9 8.8-6.3 14.6-5.7.5 0 .9.2 1.4.2 7 1.1 8.7 6.7 7.4 12.1-1 4-4.3 5.5-8 6.2-2 .4-4.1.6-6.2.5-4.1-.1-8.1-.4-12.1-1-.9-.1-1.3-.5-1.1-1.4z" fill="#000000"/></svg>', 
            providerId: '119' 
        },
        { 
            id: 'hulu', 
            name: 'Hulu', 
            svg: '<svg viewBox="0 0 1000 329" xmlns="http://www.w3.org/2000/svg"> <defs id="defs6"> <linearGradient id="linearGradient3067" y2="21.07" x2="0.98000002" y1="20.07" x1="-0.02" gradientUnits="userSpaceOnUse"> <stop id="stop3069" stop-opacity="1" stop-color="#2dbd9d" offset="0.44710872" /> <stop id="stop3071" stop-opacity="1" stop-color="#72de93" offset="1" /> </linearGradient> <linearGradient gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="0.98000002" y2="21.07" id="gradient1"> <stop offset="1e-07" stop-color="#2dbd9d" stop-opacity="1" id="stop9" /> <stop offset="1" stop-color="#72de93" stop-opacity="1" id="stop11" /> </linearGradient> <linearGradient xlink:href="#linearGradient3067" id="linearGradient3050" gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="8.437705" y2="-0.82375771" /> <linearGradient xlink:href="#gradient1" id="linearGradient3052" gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="0.98000002" y2="21.07" /> </defs> <g transform="matrix(16.423058,0,0,16.423058,-331,-413.40146) translate(20.15459,25.172015)" > <path fill="#1ce783" d="m 9.57,6.24 -3.1,0 C 5.9118,6.21334 5.35475,6.31245 4.84,6.53 L 4.84,0 0,0 l 0,20 4.83,0 0,-8.07 C 4.82999,11.5861 4.96727,11.2565 5.21136,11.0143 5.45545,10.7721 5.78614,10.6373 6.13,10.64 l 2.81,0 C 9.28386,10.6373 9.61455,10.7721 9.85864,11.0143 10.1027,11.2565 10.24,11.5861 10.24,11.93 l 0,8.07 4.84,0 0,-8.7 c 0,-3.66 -2.44,-5.06 -5.5,-5.06 l -0.01,0 m 46.48,0 0,8.07 c 0,0.7124 -0.5776,1.29 -1.29,1.29 l -2.82,0 C 51.5961,15.6027 51.2654,15.4679 51.0214,15.2257 50.7773,14.9835 50.64,14.6539 50.64,14.31 l 0,-8.07 -4.83,0 0,8.47 c 0,3.47 2.19,5.29 5.51,5.29 l 4.73,0 c 3,0 4.84,-2.15 4.84,-5.26 l 0,-8.5 -4.84,0 m -27.28,8.07 c 0,0.3439 -0.1373,0.6735 -0.3814,0.9157 -0.244,0.2422 -0.5747,0.377 -0.9186,0.3743 l -2.81,0 C 24.3161,15.6027 23.9854,15.4679 23.7414,15.2257 23.4973,14.9835 23.36,14.6539 23.36,14.31 l 0,-8.07 -4.83,0 0,8.47 c 0,3.47 2.22,5.29 5.47,5.29 l 4.73,0 c 3,0 4.84,-2.15 4.84,-5.26 l 0,-8.5 -4.8,0 0,8.07 m 8.52,5.69 4.84,0 0,-20 -4.84,0 0,20" /> </g></svg>', 
            providerId: '15' 
        },
        { 
            id: 'paramount', 
            name: 'Paramount+', 
            svg: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-161.599 -100.544 1000 622.214"> <path fill="#0064FF" d="M283.887,219.392c-2.459-1.02-6.49-5.543,0.216-18.138l15.578-32.558c0.473-0.984-0.664-2.216-1.374-1.38 l-13.621,13.695c-6.445,6.727-17.378,25.635-19.495,29.134L248.643,237.5c1.229-0.039,2.258,0.927,2.297,2.156 c0.012,0.405-0.085,0.805-0.283,1.159l-15.125,25.404c-3.693,6.3,2.942,10.704,3.841,9.254c23.773-38.291,37.6-35.234,37.6-35.234 l7.936-18.377c0.418-0.921,0.01-2.006-0.911-2.424C283.964,219.421,283.926,219.407,283.887,219.392z M337.935-100.544 c-135.92,0-246.104,110.13-246.104,245.983c-0.072,52.591,16.8,103.807,48.115,146.058c10.324-4.456,16.061-11.117,20.159-16.218 l45.823-58.576c0.965-1.235,2.225-2.206,3.665-2.825l6.898-2.967l75.345-95.524l10.925-8.549l22.45-31.233 c0.58-0.808,1.287-1.519,2.094-2.104l9.795-7.117c2.42-1.758,5.688-1.786,8.136-0.068l11.886,8.339 c6.306,4.423,11.417,10.338,14.88,17.217l47.61,83.586c0.777,1.595,2.098,2.86,3.724,3.568c9.337,4.646,15.041,5.467,27.261,18.735 c5.702,6.186,30.688,34.117,65.705,77.526c5.089,6.964,11.902,12.484,19.769,16.02c31.22-42.219,48.034-93.359,47.96-145.868 C584.031,9.585,473.852-100.544,337.935-100.544z M158.201,158.997l-15.957-5.18l-9.857,13.56v-16.758l-15.958-5.181l15.958-5.181 v-16.763l9.857,13.563l15.957-5.18l-9.859,13.562L158.201,158.997z M154.418,213.846l-5.183,15.943l-5.183-15.943h-16.771 l13.567-9.854l-5.182-15.942l13.568,9.854l13.569-9.854l-5.183,15.942l13.569,9.854H154.418z M157.621,86.876l5.183,15.942 l-13.569-9.854l-13.568,9.854l5.182-15.942l-13.567-9.854h16.771l5.183-15.942l5.184,15.942h16.771L157.621,86.876z M184.552,50.813 l-9.852-13.563l-15.957,5.18l9.858-13.561l-9.858-13.562l15.957,5.18l9.858-13.562v16.764l15.957,5.171l-15.957,5.182v16.763 L184.552,50.813z M226.495-7.873L221.312,8.07l-5.183-15.942h-16.772l13.569-9.854l-5.182-15.943l13.568,9.852l13.567-9.854 l-5.182,15.956l13.569,9.854h-16.772V-7.873z M279.348-34.791l-9.858,13.563v-16.759l-15.958-5.18l15.958-5.182v-16.763 l9.858,13.563l15.95-5.18l-9.858,13.562l9.859,13.561L279.348-34.791z M346.321-50.157l5.183,15.942l-13.569-9.854l-13.569,9.854 l5.177-15.935l-13.567-9.854h16.771l5.185-15.942l5.183,15.942h16.771L346.321-50.157z M406.374-37.987v16.763l-9.854-13.563 l-15.956,5.181l9.858-13.561l-9.857-13.562l15.957,5.18l9.854-13.563v16.763l15.957,5.182L406.374-37.987z M517.662,131.877 l15.956,5.18l9.855-13.563v16.763l15.958,5.181l-15.958,5.181v16.762l-9.855-13.561l-15.956,5.18l9.869-13.562L517.662,131.877z M454.556,8.074l-5.186-15.943H432.6l13.564-9.854l-5.171-15.944l13.563,9.854l13.563-9.852l-5.172,15.942l13.565,9.854h-16.771 L454.556,8.074z M491.317,50.817V34.055l-15.957-5.182l15.957-5.171V6.931l9.854,13.562l15.957-5.18l-9.854,13.562l9.854,13.561 l-15.957-5.18L491.317,50.817z M521.443,77.027l5.188-15.942l5.186,15.942h16.77l-13.563,9.854l5.186,15.942l-13.577-9.854 l-13.564,9.854l5.186-15.942l-13.578-9.854H521.443z M531.816,213.846l-5.186,15.943l-5.188-15.943h-16.77l13.578-9.854 l-5.186-15.942l13.564,9.854l13.577-9.854l-5.186,15.942l13.563,9.854H531.816z M427.075,287.598 c1.182-1.718,3.103-6.43-0.503-15.162l-10.89-29.273c-1.478-3.737,1.759-6.004,3.931-3.547c0,0,20.582,23.722,25.901,33.627 l10.15,16.843c8.732,0.564,32.83,1.221,56.027,1.221c-2.336-2.319-4.493-4.811-6.457-7.454 c-39.583-49.053-64.687-76.34-64.938-76.61c-8.022-8.717-11.73-10.392-17.849-13.178c-0.886-0.402-1.847-0.836-2.836-1.307v7.447 c0.061,0.503-0.299,0.96-0.803,1.02c-0.407,0.048-0.798-0.18-0.955-0.559L359.658,98.482l-0.162-0.323 c-2.427-4.813-6.004-8.953-10.414-12.052l-5.677-3.989l-27.763,64.021c3.317-0.001,6.008,2.687,6.01,6.004 c0.001,0.821-0.167,1.634-0.494,2.388l-25.651,59.312h23.546c9.1,0,18.114,1.771,26.536,5.22l6.206,2.543 c0,0-18.725,38.509-18.725,58.786c0.027,3.688,0.542,7.355,1.529,10.908h43.163l-1.999-12.155 c16.932,3.78,34.062,6.604,51.311,8.459V287.598z M94.026,349.996c0-39.614-42.017-58.689-91.935-58.689 c-53.398,0-102.392,23.657-120.375,60.339c-4.963,9.773-7.542,20.584-7.528,31.546c-0.227,9.479,2.396,18.807,7.528,26.778 c7.705,11.377,21.466,18.528,41.652,18.528c24.776,0,44.411-13.576,44.411-37.234c0,0,0.364-6.598-7.341-6.598 c-6.239,0-7.893,4.399-7.708,6.598c0.922,18.525-10.092,33.383-29.728,33.383c-22.014,0-31.197-18.708-31.197-38.698 c0-40.902,30.829-68.05,62.942-79.786c15.007-5.667,30.944-8.47,46.985-8.259c36.333,0,66.061,13.942,66.061,51.361 c0,31.175-26.24,57.771-57.623,60.157l1.284-4.217c6.425-22.929,14.315-48.054,27.157-66.58c0.739-1.107,2.02-2.936,3.489-4.768 l-1.833-2.203c-2.746,1.666-5.383,3.503-7.897,5.501c-60.183,46.956-62.011,179.011-142.209,179.011 c-2.762,0-5.519-0.185-8.256-0.551c-16.696-2.75-25.51-13.941-25.51-29.524c0-3.118,1.103-7.339,1.103-9.72 c0.127-4.43-3.361-8.123-7.791-8.252c-0.035-0.001-0.068-0.001-0.101-0.001h-0.915c-7.155,0-10.092,5.678-10.276,13.754 c-0.548,23.294,16.696,36.862,43.309,39.434c2.933,0.182,5.87,0.364,8.99,0.364c62.571,0,100.923-47.32,117.257-104.729 c8.273-0.97,16.441-2.687,24.403-5.131C61.3
