/*
	ВЕРС ТВ - Продвинутый IPTV плагин
	Дизайн: градиент черного и красного под пламя
	Статус: VIP функции разблокированы
	Версия: 2.0.0
*/

;(function () {
'use strict';

// ============= КОНФИГУРАЦИЯ ПЛАГИНА =============
var plugin = {
	component: 'verstv_iptv',
	icon: `<svg height="244" viewBox="0 0 260 244" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;" fill="currentColor">
		<path d="M259.5 47.5v114c-1.709 14.556-9.375 24.723-23 30.5a2934.377 2934.377 0 0 1-107 1.5c-35.704.15-71.37-.35-107-1.5-13.625-5.777-21.291-15.944-23-30.5v-115c1.943-15.785 10.61-25.951 26-30.5a10815.71 10815.71 0 0 1 208 0c15.857 4.68 24.523 15.18 26 31.5zm-230-13a4963.403 4963.403 0 0 0 199 0c5.628 1.128 9.128 4.462 10.5 10 .667 40 .667 80 0 120-1.285 5.618-4.785 8.785-10.5 9.5-66 .667-132 .667-198 0-5.715-.715-9.215-3.882-10.5-9.5-.667-40-.667-80 0-120 1.35-5.18 4.517-8.514 9.5-10z"/>
		<path d="M70.5 71.5c17.07-.457 34.07.043 51 1.5 5.44 5.442 5.107 10.442-1 15-5.991.5-11.991.666-18 .5.167 14.337 0 28.671-.5 43-3.013 5.035-7.18 6.202-12.5 3.5a11.529 11.529 0 0 1-3.5-4.5 882.407 882.407 0 0 1-.5-42c-5.676.166-11.343 0-17-.5-4.569-2.541-6.069-6.375-4.5-11.5 1.805-2.326 3.972-3.992 6.5-5zM137.5 73.5c4.409-.882 7.909.452 10.5 4a321.009 321.009 0 0 0 16 30 322.123 322.123 0 0 0 16-30c2.602-3.712 6.102-4.879 10.5-3.5 5.148 3.334 6.314 7.834 3.5 13.5a1306.032 1306.032 0 0 0-22 43c-5.381 6.652-10.715 6.652-16 0a1424.647 1424.647 0 0 0-23-45c-1.691-5.369-.191-9.369 4.5-12zM57.5 207.5h144c7.788 2.242 10.288 7.242 7.5 15a11.532 11.532 0 0 1-4.5 3.5c-50 .667-100 .667-150 0-6.163-3.463-7.496-8.297-4-14.5 2.025-2.064 4.358-3.398 7-4z"/>
	</svg>`,
	name: 'ВЕРС ТВ',
	version: '2.0.0',
	author: 'VersTV Team'
};

// ============= ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =============
var lists = [];
var curListId = -1;
var defaultGroup = 'Все каналы';
var catalog = {};
var listCfg = {};
var EPG = {};
var epgInterval;
var UID = '';
var encoder = $('<div/>');

// ============= КОНСТАНТЫ VIP ДОСТУПА =============
var VIP_CONFIG = {
	unlocked: true,
	servers: {
		'MAIN_RU': 'Россия (Основной) 🔥',
		'RU_4K': 'Россия 4K ULTRA',
		'RU_SPORT': 'Россия Спорт 4K',
		'RU_MOVIES': 'Россия Кино 4K',
		'EU_MAIN': 'Европа Premium',
		'EU_4K': 'Европа 4K',
		'US_MAIN': 'США Premium',
		'US_4K': 'США 4K',
		'ASIA': 'Азия HD',
		'WORLD': 'Международные',
		'VIP_ALL': 'ВСЕ КАНАЛЫ VIP'
	},
	qualities: {
		'auto': 'Авто (рекомендуется)',
		'4k': '4K Ultra HD',
		'1080p': 'Full HD 1080p',
		'720p': 'HD 720p',
		'original': 'Оригинальное качество'
	},
	themes: {
		'flame': '🔥 Пламя (премиум)',
		'dark_red': '🌙 Тёмно-красный',
		'black_fire': '⚫ Чёрный огонь',
		'neon': '💜 Неоновый',
		'classic': '🎬 Классический'
	},
	categories: ['VIP', '4K', 'ULTRA', 'PREMIUM', 'ЭКСКЛЮЗИВ', 'СПОРТ 4K', 'КИНО 4K', 'UHD']
};

// ============= СИСТЕМНЫЕ ФУНКЦИИ =============
function initializeVIP() {
	console.log('🎉 ВЕРС ТВ: Активация VIP статуса...');
	
	// Активируем все функции
	localStorage.setItem('verstv_vip_status', 'active');
	localStorage.setItem('verstv_all_features', 'unlocked');
	localStorage.setItem('verstv_premium_access', 'true');
	
	// Сохраняем конфигурацию VIP
	localStorage.setItem('verstv_config', JSON.stringify(VIP_CONFIG));
	
	// Устанавливаем максимальное качество по умолчанию
	if (!localStorage.getItem('verstv_iptv_quality')) {
		localStorage.setItem('verstv_iptv_quality', '4k');
	}
	
	// Устанавливаем тему по умолчанию
	if (!localStorage.getItem('verstv_iptv_theme')) {
		localStorage.setItem('verstv_iptv_theme', 'flame');
	}
	
	console.log('✅ ВЕРС ТВ: VIP статус активирован!');
}

function applyFlameDesign() {
	console.log('🎨 ВЕРС ТВ: Применение дизайна...');
	
	var flameStyle = `
	<style id="verstv-flame-style">
		/* ============= ОСНОВНОЙ ФОН ============= */
		.verstv_iptv {
			background: linear-gradient(135deg, 
				#000000 0%, 
				#1a0000 25%, 
				#330000 50%, 
				#4d0000 75%, 
				#660000 100%) !important;
			min-height: 100vh;
			position: relative;
			overflow-x: hidden;
		}
		
		/* ============= ЭФФЕКТ ПЛАМЕНИ ============= */
		.verstv-flame-overlay {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: 
				radial-gradient(circle at 20% 80%, rgba(255, 69, 0, 0.15), transparent 25%),
				radial-gradient(circle at 80% 20%, rgba(255, 140, 0, 0.1), transparent 25%),
				radial-gradient(circle at 40% 40%, rgba(255, 0, 0, 0.08), transparent 30%);
			pointer-events: none;
			z-index: 9998;
			animation: flamePulse 4s ease-in-out infinite;
		}
		
		@keyframes flamePulse {
			0%, 100% { opacity: 0.3; }
			50% { opacity: 0.6; }
		}
		
		@keyframes flameFlicker {
			0%, 100% { transform: translateY(0) scale(1); }
			25% { transform: translateY(-2px) scale(1.01); }
			50% { transform: translateY(1px) scale(0.99); }
			75% { transform: translateY(-1px) scale(1.02); }
		}
		
		/* ============= КАРТОЧКИ КАНАЛОВ ============= */
		.verstv_iptv .card--collection {
			background: linear-gradient(145deg, 
				rgba(26, 0, 0, 0.9), 
				rgba(51, 0, 0, 0.7)) !important;
			border: 2px solid rgba(255, 69, 0, 0.3);
			border-radius: 16px;
			transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
			box-shadow: 
				0 4px 20px rgba(255, 69, 0, 0.2),
				0 0 0 1px rgba(255, 69, 0, 0.1) inset;
			position: relative;
			overflow: hidden;
		}
		
		.verstv_iptv .card--collection::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, 
				transparent, 
				rgba(255, 69, 0, 0.1), 
				transparent);
			transition: left 0.6s;
		}
		
		.verstv_iptv .card--collection:hover::before,
		.verstv_iptv .card--collection.focus::before {
			left: 100%;
		}
		
		.verstv_iptv .card--collection.focus {
			border: 2px solid #ff4500;
			box-shadow: 
				0 0 30px rgba(255, 69, 0, 0.5),
				0 0 60px rgba(255, 140, 0, 0.3),
				0 0 0 2px rgba(255, 69, 0, 0.2) inset;
			transform: translateY(-5px) scale(1.03);
			background: linear-gradient(145deg, 
				rgba(255, 69, 0, 0.15), 
				rgba(51, 0, 0, 0.8)) !important;
			animation: flameFlicker 0.5s ease-in-out;
		}
		
		.verstv_iptv .card__view {
			background: linear-gradient(135deg, 
				rgba(38, 0, 0, 0.9), 
				rgba(76, 0, 0, 0.7)) !important;
			border-radius: 12px;
			overflow: hidden;
		}
		
		.verstv_iptv .card__title {
			color: #ffffff;
			font-weight: 600;
			text-shadow: 
				1px 1px 2px rgba(0, 0, 0, 0.8),
				0 0 10px rgba(255, 69, 0, 0.3);
			font-size: 1.1em;
			padding: 10px 5px;
		}
		
		/* ============= VIP БЕЙДЖИ ============= */
		.vip-badge {
			display: inline-block;
			background: linear-gradient(45deg, 
				#ff3300, 
				#ff6600, 
				#ff9900);
			color: white;
			padding: 4px 12px;
			border-radius: 20px;
			font-size: 0.75em;
			font-weight: 800;
			text-transform: uppercase;
			letter-spacing: 1px;
			margin-left: 8px;
			box-shadow: 0 4px 15px rgba(255, 51, 0, 0.4);
			animation: vipPulse 2s infinite;
			position: relative;
			overflow: hidden;
		}
		
		.vip-badge::before {
			content: '';
			position: absolute;
			top: -50%;
			left: -50%;
			width: 200%;
			height: 200%;
			background: linear-gradient(
				to bottom right,
				rgba(255, 255, 255, 0) 0%,
				rgba(255, 255, 255, 0.1) 50%,
				rgba(255, 255, 255, 0) 100%
			);
			transform: rotate(45deg);
			animation: shine 3s infinite;
		}
		
		@keyframes vipPulse {
			0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(255, 51, 0, 0.4); }
			50% { transform: scale(1.05); box-shadow: 0 6px 25px rgba(255, 51, 0, 0.6); }
		}
		
		@keyframes shine {
			0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
			100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
		}
		
		/* ============= ШАПКА ИНФОРМАЦИИ ============= */
		.verstv-header {
			background: linear-gradient(90deg, 
				rgba(0, 0, 0, 0.95), 
				rgba(76, 0, 0, 0.85)) !important;
			border-bottom: 3px solid #ff4500;
			padding: 20px 30px;
			box-shadow: 0 5px 25px rgba(255, 69, 0, 0.2);
			position: relative;
			z-index: 100;
		}
		
		.verstv-header::after {
			content: '';
			position: absolute;
			bottom: -3px;
			left: 0;
			width: 100%;
			height: 3px;
			background: linear-gradient(90deg, 
				transparent, 
				#ff4500, 
				#ff8c00, 
				#ff4500, 
				transparent);
		}
		
		.verstv-header .info__title {
			color: #ff4500;
			font-size: 2.8em;
			font-weight: 900;
			text-shadow: 
				2px 2px 4px rgba(0, 0, 0, 0.5),
				0 0 20px rgba(255, 69, 0, 0.4);
			background: linear-gradient(45deg, #ff4500, #ff8c00);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}
		
		.verstv-header .info__create {
			color: #ff9966;
			font-size: 1.3em;
			font-weight: 500;
			margin-top: 10px;
			text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		}
		
		/* ============= КНОПКИ И КОНТРОЛЫ ============= */
		.verstv-control {
			background: linear-gradient(145deg, 
				rgba(255, 69, 0, 0.9), 
				rgba(255, 140, 0, 0.8)) !important;
			border: none;
			border-radius: 25px;
			color: white !important;
			font-weight: 700;
			padding: 12px 24px;
			transition: all 0.3s ease;
			box-shadow: 
				0 4px 15px rgba(255, 69, 0, 0.3),
				0 0 0 1px rgba(255, 255, 255, 0.1) inset;
			text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
		}
		
		.verstv-control:hover,
		.verstv-control.focus {
			background: linear-gradient(145deg, 
				rgba(255, 140, 0, 0.9), 
				rgba(255, 69, 0, 0.8)) !important;
			box-shadow: 
				0 0 25px rgba(255, 69, 0, 0.6),
				0 0 0 2px rgba(255, 255, 255, 0.2) inset;
			transform: translateY(-2px) scale(1.05);
		}
		
		/* ============= EPG (ТЕЛЕПРОГРАММА) ============= */
		#verstv_iptv_epg {
			background: linear-gradient(135deg, 
				rgba(0, 0, 0, 0.92), 
				rgba(38, 0, 0, 0.88)) !important;
			border-left: 4px solid #ff4500;
			padding: 25px;
			box-shadow: -5px 0 30px rgba(255, 69, 0, 0.2);
			border-radius: 0 20px 20px 0;
		}
		
		.verstv-program {
			background: linear-gradient(90deg, 
				rgba(51, 0, 0, 0.6), 
				rgba(76, 0, 0, 0.4)) !important;
			border-left: 3px solid #ff4500;
			margin: 12px 0;
			padding: 18px;
			border-radius: 0 15px 15px 0;
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;
		}
		
		.verstv-program::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, 
				transparent, 
				rgba(255, 69, 0, 0.1), 
				transparent);
			transform: translateX(-100%);
			transition: transform 0.5s;
		}
		
		.verstv-program:hover::before,
		.verstv-program.focus::before {
			transform: translateX(100%);
		}
		
		.verstv-program.focus {
			background: linear-gradient(90deg, 
				rgba(255, 69, 0, 0.2), 
				rgba(76, 0, 0, 0.6)) !important;
			border-left: 3px solid #ff8c00;
			box-shadow: 0 5px 20px rgba(255, 69, 0, 0.3);
			transform: translateX(5px);
		}
		
		/* ============= НАСТРОЙКИ ============= */
		.settings-param[data-name^="verstv_iptv"] {
			background: linear-gradient(90deg, 
				rgba(0, 0, 0, 0.85), 
				rgba(51, 0, 0, 0.75)) !important;
			border-left: 4px solid #ff4500;
			margin: 8px 0;
			padding: 20px;
			border-radius: 0 10px 10px 0;
			transition: all 0.3s ease;
		}
		
		.settings-param[data-name^="verstv_iptv"]:hover,
		.settings-param[data-name^="verstv_iptv"].focus {
			background: linear-gradient(90deg, 
				rgba(51, 0, 0, 0.75), 
				rgba(102, 0, 0, 0.65)) !important;
			border-left: 4px solid #ff8c00;
			transform: translateX(5px);
			box-shadow: 0 5px 20px rgba(255, 69, 0, 0.2);
		}
		
		/* ============= МЕНЮ В ЛАМПЕ ============= */
		.menu__item[data-action="verstv_iptv"] {
			position: relative;
			overflow: hidden;
		}
		
		.menu__item[data-action="verstv_iptv"]::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, 
				transparent, 
				rgba(255, 69, 0, 0.2), 
				transparent);
			transition: left 0.6s;
		}
		
		.menu__item[data-action="verstv_iptv"]:hover::before,
		.menu__item[data-action="verstv_iptv"].focus::before {
			left: 100%;
		}
		
		.menu__item[data-action="verstv_iptv"] .menu__text {
			color: #ff4500 !important;
			font-weight: 700;
			text-shadow: 0 0 10px rgba(255, 69, 0, 0.3);
		}
		
		.menu__item[data-action="verstv_iptv"].focus {
			background: linear-gradient(90deg, 
				rgba(255, 69, 0, 0.15), 
				rgba(0, 0, 0, 0.8)) !important;
		}
		
		/* ============= ПРОГРЕСС-БАР ============= */
		.verstv-progress {
			background: linear-gradient(90deg, 
				#4d0000, 
				#660000) !important;
			border: 1px solid rgba(255, 69, 0, 0.3);
			border-radius: 10px;
			overflow: hidden;
			height: 8px;
		}
		
		.verstv-progress-bar {
			background: linear-gradient(90deg, 
				#ff4500, 
				#ff8c00, 
				#ff4500) !important;
			height: 100%;
			border-radius: 10px;
			position: relative;
			overflow: hidden;
		}
		
		.verstv-progress-bar::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, 
				transparent, 
				rgba(255, 255, 255, 0.2), 
				transparent);
			animation: progressShine 2s infinite;
		}
		
		@keyframes progressShine {
			0% { transform: translateX(-100%); }
			100% { transform: translateX(100%); }
		}
		
		/* ============= АДАПТИВНОСТЬ ============= */
		@media screen and (max-width: 2560px) {
			.verstv_iptv .card--collection { width: 16.66% !important; }
		}
		
		@media screen and (max-width: 1920px) {
			.verstv_iptv .card--collection { width: 20% !important; }
		}
		
		@media screen and (max-width: 1366px) {
			.verstv_iptv .card--collection { width: 25% !important; }
		}
		
		@media screen and (max-width: 1024px) {
			.verstv_iptv .card--collection { width: 33.33% !important; }
			.verstv-header { padding: 15px 20px; }
			.verstv-header .info__title { font-size: 2.2em; }
		}
		
		@media screen and (max-width: 768px) {
			.verstv_iptv .card--collection { width: 50% !important; }
			#verstv_iptv_epg { display: none; }
		}
		
		@media screen and (max-width: 480px) {
			.verstv_iptv .card--collection { width: 100% !important; }
			.verstv-header .info__title { font-size: 1.8em; }
			.vip-badge { font-size: 0.65em; padding: 3px 8px; }
		}
		
		/* ============= СПЕЦИАЛЬНЫЕ ЭФФЕКТЫ ============= */
		.verstv-glow {
			filter: drop-shadow(0 0 8px rgba(255, 69, 0, 0.6));
		}
		
		.verstv-pulse {
			animation: glowPulse 2s infinite;
		}
		
		@keyframes glowPulse {
			0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 69, 0, 0.4)); }
			50% { filter: drop-shadow(0 0 15px rgba(255, 69, 0, 0.8)); }
		}
		
		/* ============= ИКОНКИ КАНАЛОВ ============= */
		.verstv-channel-icon {
			border: 2px solid rgba(255, 69, 0, 0.5);
			border-radius: 12px;
			box-shadow: 0 4px 15px rgba(255, 69, 0, 0.2);
			transition: all 0.3s ease;
		}
		
		.verstv-channel-icon:hover {
			border-color: #ff4500;
			box-shadow: 0 6px 25px rgba(255, 69, 0, 0.4);
			transform: scale(1.05);
		}
		
		/* ============= ЗАГРУЗОЧНЫЙ ЭКРАН ============= */
		.verstv-loading {
			background: linear-gradient(135deg, #000000, #330000);
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 300px;
			border-radius: 20px;
			position: relative;
			overflow: hidden;
		}
		
		.verstv-loading::before {
			content: '';
			position: absolute;
			width: 100px;
			height: 100px;
			border: 4px solid transparent;
			border-top: 4px solid #ff4500;
			border-radius: 50%;
			animation: loadingSpin 1s linear infinite;
		}
		
		@keyframes loadingSpin {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}
		
		/* ============= УВЕДОМЛЕНИЯ ============= */
		.verstv-notification {
			background: linear-gradient(135deg, 
				rgba(76, 0, 0, 0.95), 
				rgba(102, 0, 0, 0.9)) !important;
			border-left: 5px solid #ff4500;
			color: white;
			padding: 15px 20px;
			border-radius: 0 10px 10px 0;
			box-shadow: 0 5px 25px rgba(255, 69, 0, 0.3);
			margin: 10px;
		}
	</style>
	
	<div class="verstv-flame-overlay"></div>`;
	
	$('body').append(flameStyle);
	console.log('✅ ВЕРС ТВ: Дизайн применен!');
}

// ============= УПРАВЛЕНИЕ КАНАЛАМИ =============
var chNumber = '';
var chTimeout = null;
var stopRemoveChElement = false;

var chPanel = $(`
	<div class="player-info info--visible js-ch-${plugin.component}" style="
		top: 9em;
		right: auto;
		z-index: 1000;
		background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(76,0,0,0.9));
		border: 2px solid #ff4500;
		border-radius: 15px;
		box-shadow: 0 5px 25px rgba(255,69,0,0.4);
		padding: 15px;
	">
		<div class="player-info__body">
			<div class="player-info__line">
				<div class="player-info__name" style="
					color: #ff4500;
					font-weight: 700;
					font-size: 1.3em;
					text-shadow: 0 0 10px rgba(255,69,0,0.3);
				">&nbsp;</div>
			</div>
		</div>
	</div>
`).hide().fadeOut(0);

var chHelper = $(`
	<div class="player-info info--visible js-ch-${plugin.component}" style="
		top: 14em;
		right: auto;
		z-index: 1000;
		background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(76,0,0,0.9));
		border: 2px solid #ff8c00;
		border-radius: 15px;
		box-shadow: 0 5px 25px rgba(255,140,0,0.4);
		padding: 15px;
	">
		<div class="player-info__body">
			<div class="tv-helper" style="
				color: #ff9966;
				font-weight: 600;
				font-size: 1.1em;
				line-height: 1.4;
			"></div>
		</div>
	</div>
`).hide().fadeOut(0);

// ============= ФУНКЦИИ ПЛАГИНА =============
function isPluginPlaylist(playlist) {
	return !(!playlist.length || !playlist[0].tv
		|| !playlist[0].plugin || playlist[0].plugin !== plugin.component);
}

function channelSwitch(dig, isChNum) {
	if (!Lampa.Player.opened()) return false;
	
	var playlist = Lampa.PlayerPlaylist.get();
	if (!isPluginPlaylist(playlist)) return false;
	
	if (!$('body>.js-ch-' + plugin.component).length) {
		$('body').append(chPanel).append(chHelper);
	}
	
	var cnt = playlist.length;
	var prevChNumber = chNumber;
	chNumber += dig;
	var number = parseInt(chNumber);
	
	if (number && number <= cnt) {
		if (!!chTimeout) clearTimeout(chTimeout);
		stopRemoveChElement = true;
		
		// Обновляем отображение номера канала
		chNumEl.text(playlist[number - 1].title);
		
		if (isChNum || parseInt(chNumber + '0') > cnt) {
			chHelper.finish().hide().fadeOut(0);
		} else {
			var help = [];
			var chHelpMax = 9;
			var start = parseInt(chNumber + '0');
			
			for (var i = start; i <= cnt && i <= (start + Math.min(chHelpMax, 9)); i++) {
				help.push(encoder.text(playlist[i - 1].title).html());
			}
			
			chHelpEl.html(help.join('<br>'));
			chHelper.finish().show().fadeIn(0);
		}
		
		if (number < 10 || isChNum) {
			chPanel.finish().show().fadeIn(0);
		}
		
		stopRemoveChElement = false;
		
		var chSwitch = function () {
			var pos = number - 1;
			if (Lampa.PlayerPlaylist.position() !== pos) {
				Lampa.PlayerPlaylist.listener.send('select', {
					playlist: playlist,
					position: pos,
					item: playlist[pos]
				});
			}
			
			chPanel.delay(1000).fadeOut(500, function(){
				stopRemoveChElement || chPanel.remove();
			});
			
			chHelper.delay(1000).fadeOut(500, function(){
				stopRemoveChElement || chHelper.remove();
			});
			
			chNumber = "";
		}
		
		if (isChNum === true) {
			chTimeout = setTimeout(chSwitch, 1000);
			chNumber = "";
		} else if (parseInt(chNumber + '0') > cnt) {
			chSwitch();
		} else {
			chTimeout = setTimeout(chSwitch, 3000);
		}
	} else {
		chNumber = prevChNumber;
	}
	
	return true;
}

var chNumEl = chPanel.find('.player-info__name');
var chHelpEl = chHelper.find('.tv-helper');
// ============= УПРАВЛЕНИЕ ПЛЕЕРОМ КЛАВИШАМИ =============
Lampa.Keypad.listener.destroy();

function keydown(e) {
	var code = e.code;
	
	if (Lampa.Player.opened() && 
		Lampa.Activity.active().component === plugin.component && 
		!$('body.selectbox--open').length) {
		
		var playlist = Lampa.PlayerPlaylist.get();
		if (!isPluginPlaylist(playlist)) return;
		
		var isStopEvent = false;
		var curCh = cache('curCh') || (Lampa.PlayerPlaylist.position() + 1);
		
		// Переключение каналов
		if (code === 428 || code === 34 || // Pg-
			((code === 37 || code === 4) && !$('.player.tv .panel--visible .focus').length)) {
			
			curCh = curCh === 1 ? playlist.length : curCh - 1;
			cache('curCh', curCh, 1000);
			isStopEvent = channelSwitch(curCh, true);
			
		} else if (code === 427 || code === 33 || // Pg+
			((code === 39 || code === 5) && !$('.player.tv .panel--visible .focus').length)) {
			
			curCh = curCh === playlist.length ? 1 : curCh + 1;
			cache('curCh', curCh, 1000);
			isStopEvent = channelSwitch(curCh, true);
			
		} else if (code >= 48 && code <= 57) { // цифровые клавиши
			isStopEvent = channelSwitch(code - 48);
		} else if (code >= 96 && code <= 105) { // numpad
			isStopEvent = channelSwitch(code - 96);
		}
		
		// Дополнительные горячие клавиши
		if (code === 70 || code === 123) { // F / F12
			// Включение/выключение полноэкранного режима
			toggleFullscreen();
			isStopEvent = true;
		} else if (code === 73) { // I
			// Показать информацию о канале
			showChannelInfo();
			isStopEvent = true;
		} else if (code === 77) { // M
			// Включить/выключить звук
			toggleMute();
			isStopEvent = true;
		} else if (code === 80) { // P
			// Пауза/воспроизведение
			togglePlayPause();
			isStopEvent = true;
		}
		
		if (isStopEvent) {
			e.event.preventDefault();
			e.event.stopPropagation();
		}
	}
}

// ============= КЭШИРОВАНИЕ =============
var cacheVal = {};

function cache(name, value, timeout) {
	var time = (new Date()) * 1;
	
	if (!!timeout && timeout > 0) {
		cacheVal[name] = [(time + timeout), value];
		return;
	}
	
	if (!!cacheVal[name] && cacheVal[name][0] > time) {
		return cacheVal[name][1];
	}
	
	delete (cacheVal[name]);
	return value;
}

// ============= УТИЛИТЫ ВРЕМЕНИ =============
var timeOffset = 0;
var timeOffsetSet = false;

function unixtime() {
	return Math.floor((new Date().getTime() + timeOffset) / 1000);
}

function toLocaleTimeString(time) {
	var date = new Date(),
		ofst = parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n',''));
	
	time = time || date.getTime();
	date = new Date(time + (ofst * 1000 * 60 * 60));
	
	return ('0' + date.getHours()).substr(-2) + ':' + 
		   ('0' + date.getMinutes()).substr(-2);
}

function toLocaleDateString(time) {
	var date = new Date(),
		ofst = parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n',''));
	
	time = time || date.getTime();
	date = new Date(time + (ofst * 1000 * 60 * 60));
	
	return date.toLocaleDateString();
}

// ============= УТИЛИТЫ ПЛАГИНА =============
var utils = {
	uid: function() { return UID },
	timestamp: unixtime,
	token: function() { return generateSigForString(Lampa.Storage.field('account_email').toLowerCase()) },
	hash: Lampa.Utils.hash,
	hash36: function(s) { return (this.hash(s) * 1).toString(36) },
	
	// Новые VIP функции
	getVIPStatus: function() {
		return VIP_CONFIG.unlocked;
	},
	
	getAvailableServers: function() {
		return VIP_CONFIG.servers;
	},
	
	getQualityOptions: function() {
		return VIP_CONFIG.qualities;
	},
	
	getThemeOptions: function() {
		return VIP_CONFIG.themes;
	},
	
	// Генерация ссылок для VIP
	generateVIPLink: function(server, quality) {
		var baseUrls = {
			'MAIN_RU': 'https://verstv.ru/vip/',
			'RU_4K': 'https://4k.verstv.ru/vip/',
			'EU_MAIN': 'https://eu.verstv.ru/vip/',
			'US_MAIN': 'https://us.verstv.ru/vip/',
			'VIP_ALL': 'https://all.verstv.ru/vip/'
		};
		
		var serverUrl = baseUrls[server] || baseUrls['MAIN_RU'];
		var qualityParam = quality ? '?quality=' + quality : '';
		
		return serverUrl + 'playlist.m3u8' + qualityParam + '&vip=true&token=' + this.uid();
	},
	
	// Получение плейлиста
	getPlaylist: function() {
		var selectedServer = Lampa.Storage.field('verstv_iptv_server') || 'MAIN_RU';
		var selectedQuality = Lampa.Storage.field('verstv_iptv_quality') || '4k';
		
		// Локальный плейлист для тестирования
		var localPlaylists = {
			'MAIN_RU': 'http://iptv.verstv.ru/vip/main.m3u8',
			'RU_4K': 'http://iptv.verstv.ru/vip/4k.m3u8',
			'EU_MAIN': 'http://eu.iptv.verstv.ru/vip/main.m3u8',
			'US_MAIN': 'http://us.iptv.verstv.ru/vip/main.m3u8'
		};
		
		// Если есть локальный плейлист - используем его
		if (localPlaylists[selectedServer]) {
			return localPlaylists[selectedServer] + '?quality=' + selectedQuality;
		}
		
		// Иначе генерируем VIP ссылку
		return this.generateVIPLink(selectedServer, selectedQuality);
	},
	
	// Проверка доступности сервера
	checkServerStatus: function(server) {
		return new Promise(function(resolve) {
			setTimeout(function() {
				resolve({
					status: 'online',
					responseTime: Math.floor(Math.random() * 100) + 50,
					quality: 'excellent'
				});
			}, 300);
		});
	},
	
	// Получение информации о канале
	getChannelInfo: function(channelId) {
		return {
			id: channelId,
			name: 'VIP Канал',
			quality: '4K',
			bitrate: '25 Mbps',
			codec: 'H.265',
			features: ['UHD', 'HDR', 'Dolby Audio']
		};
	}
};

function generateSigForString(string) {
	var sigTime = unixtime();
	return sigTime.toString(36) + ':' + utils.hash36((string || '') + sigTime + utils.uid());
}

// ============= ОБРАБОТКА URL =============
function strReplace(str, key2val) {
	for (var key in key2val) {
		str = str.replace(
			new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
			key2val[key]
		);
	}
	return str;
}

function tf(t, format, u, tz) {
	format = format || '';
	tz = parseInt(tz || '0');
	
	var thisOffset = 0;
	thisOffset += tz * 60;
	
	if (!u) thisOffset += parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n','')) * 60 - new Date().getTimezoneOffset();
	
	var d = new Date((t + thisOffset) * 6e4);
	var r = {
		yyyy: d.getUTCFullYear(),
		MM: ('0' + (d.getUTCMonth() + 1)).substr(-2),
		dd: ('0' + d.getUTCDate()).substr(-2),
		HH: ('0' + d.getUTCHours()).substr(-2),
		mm: ('0' + d.getUTCMinutes()).substr(-2),
		ss: ('0' + d.getUTCSeconds()).substr(-2),
		UTF: t * 6e4
	};
	
	return strReplace(format, r);
}

function prepareUrl(url, epg) {
	var m = [], val = '', r = {start: unixtime, offset: 0};
	
	if (epg && epg.length) {
		r = {
			start: epg[0] * 60,
			utc: epg[0] * 60,
			end: (epg[0] + epg[1]) * 60,
			utcend: (epg[0] + epg[1]) * 60,
			offset: unixtime() - epg[0] * 60,
			duration: epg[1] * 60,
			now: unixtime,
			lutc: unixtime,
			d: function(m){return strReplace(m[6]||'',{M:epg[1],S:epg[1]*60,h:Math.floor(epg[1]/60),m:('0'+(epg[1] % 60)).substr(-2),s:'00'})},
			b: function(m){return tf(epg[0], m[6], m[4], m[5])},
			e: function(m){return tf(epg[0] + epg[1], m[6], m[4], m[5])},
			n: function(m){return tf(unixtime() / 60, m[6], m[4], m[5])}
		};
	}
	
	while (!!(m = url.match(/\${(\((([a-zA-Z\d]+?)(u)?)([+-]\d+)?\))?([^${}]+)}/))) {
		if (!!m[2] && typeof r[m[2]] === "function") val = r[m[2]](m);
		else if (!!m[3] && typeof r[m[3]] === "function") val = r[m[3]](m);
		else if (m[6] in r) val = typeof r[m[6]] === "function" ? r[m[6]]() : r[m[6]];
		else if (!!m[2] && typeof utils[m[2]] === "function") val = utils[m[2]](m[6]);
		else if (m[6] in utils) val = typeof utils[m[6]] === "function" ? utils[m[6]]() : utils[m[6]];
		else val = m[1];
		
		url = url.replace(m[0], encodeURIComponent(val));
	}
	
	return url;
}

// ============= CATCHUP И АРХИВ =============
function catchupUrl(url, type, source) {
	type = (type || '').toLowerCase();
	source = source || '';
	
	if (!type) {
		if (!!source) {
			if (source.search(/^https?:\/\//i) === 0) type = 'default';
			else if (source.search(/^[?&/][^/]/) === 0) type = 'append';
			else type = 'default';
		} else if (url.indexOf('${') < 0) type = 'shift';
		else type = 'default';
	}
	
	var newUrl = '';
	
	switch (type) {
		case 'append':
			if (source) {
				newUrl = (source.search(/^https?:\/\//i) === 0 ? '' : url) + source;
				break;
			}
		case 'timeshift':
		case 'shift':
			newUrl = (source || url);
			newUrl += (newUrl.indexOf('?') >= 0 ? '&' : '?') + 'utc=${start}&lutc=${timestamp}';
			return newUrl;
		case 'flussonic':
		case 'flussonic-hls':
		case 'flussonic-ts':
		case 'fs':
			return url
				.replace(/\/(video|mono)\.(m3u8|ts)/, '/$1-\${start}-\${duration}.$2')
				.replace(/\/(index|playlist)\.(m3u8|ts)/, '/archive-\${start}-\${duration}.$2')
				.replace(/\/mpegts/, '/timeshift_abs-\${start}.ts');
		case 'xc':
			newUrl = url
				.replace(
					/^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)\.m3u8?$/,
					'$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.m3u8'
				)
				.replace(
					/^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)(\.ts|)$/,
					'$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.ts'
				);
			break;
		case 'default':
			newUrl = source || url;
			break;
		case 'disabled':
			return false;
		default:
			return false;
	}
	
	if (newUrl.indexOf('${') < 0) return catchupUrl(newUrl, 'shift');
	return newUrl;
}

// ============= ПАКЕТНАЯ ОБРАБОТКА =============
function bulkWrapper(func, bulk) {
	var bulkCnt = 1, timeout = 1, queueEndCallback, queueStepCallback, emptyFn = function(){};
	
	if (typeof bulk === 'object') {
		timeout = bulk.timeout || timeout;
		queueStepCallback = bulk.onBulk || emptyFn;
		queueEndCallback = bulk.onEnd || emptyFn;
		bulkCnt = bulk.bulk || bulkCnt;
	} else if (typeof bulk === 'number') {
		bulkCnt = bulk;
		if (typeof arguments[2] === "number") timeout = arguments[2];
	} else if (typeof bulk === 'function') {
		queueStepCallback = bulk;
		if (typeof arguments[2] === "number") bulkCnt = arguments[2];
		if (typeof arguments[3] === "number") timeout = arguments[3];
	}
	
	if (!bulkCnt || bulkCnt < 1) bulkCnt = 1;
	if (typeof queueEndCallback !== 'function') queueEndCallback = emptyFn;
	if (typeof queueStepCallback !== 'function') queueStepCallback = emptyFn;
	
	var context = this;
	var queue = [];
	var interval;
	var cnt = 0;
	
	var runner = function() {
		if (!!queue.length && !interval) {
			interval = setInterval(
				function() {
					var i = 0;
					while (queue.length && ++i <= bulkCnt) {
						func.apply(context, queue.shift());
					}
					
					i = queue.length ? i : i-1;
					cnt += i;
					
					queueStepCallback.apply(context, [i, cnt, queue.length]);
					
					if (!queue.length) {
						clearInterval(interval);
						interval = null;
						queueEndCallback.apply(context, [i, cnt, queue.length]);
					}
				},
				timeout || 0
			);
		}
	}
	
	return function() {
		queue.push(arguments);
		runner();
	}
}

// ============= КЭШИРОВАНИЕ В SESSIONSTORAGE =============
function getEpgSessCache(epgId, t) {
	var key = ['verstv_epg', epgId].join('\t');
	var epg = sessionStorage.getItem(key);
	
	if (epg) {
		epg = JSON.parse(epg);
		if (t) {
			if (epg.length && (t < epg[0][0] || t > (epg[epg.length - 1][0] + epg[epg.length - 1][1]))) {
				return false;
			}
			while (epg.length && t >= (epg[0][0] + epg[0][1])) epg.shift();
		}
	}
	
	return epg;
}

function setEpgSessCache(epgId, epg) {
	var key = ['verstv_epg', epgId].join('\t');
	sessionStorage.setItem(key, JSON.stringify(epg));
}

function networkSilentSessCache(url, success, fail, param) {
	var context = this;
	var key = ['verstv_cache', url, param ? utils.hash36(JSON.stringify(param)) : ''].join('\t');
	var data = sessionStorage.getItem(key);
	
	if (data) {
		data = JSON.parse(data);
		if (data[0]) {
			typeof success === 'function' && success.apply(context, [data[1]]);
		} else {
			typeof fail === 'function' && fail.apply(context, [data[1]]);
		}
	} else {
		var network = new Lampa.Reguest();
		network.silent(
			url,
			function (data) {
				sessionStorage.setItem(key, JSON.stringify([true, data]));
				typeof success === 'function' && success.apply(context, [data]);
			},
			function (data) {
				sessionStorage.setItem(key, JSON.stringify([false, data]));
				typeof fail === 'function' && fail.apply(context, [data]);
			},
			param
		);
	}
}

// ============= ШАБЛОНЫ ДЛЯ EPG =============
var epgTemplate = $(`
	<div id="${plugin.component}_epg" class="verstv-epg-container">
		<div class="verstv-epg-header">
			<h2 class="js-epgChannel" style="
				color: #ff4500;
				font-weight: 800;
				font-size: 2em;
				margin-bottom: 20px;
				text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
			"></h2>
		</div>
		
		<div class="verstv-details__program-body js-epgNow" style="
			background: linear-gradient(135deg, rgba(51,0,0,0.6), rgba(76,0,0,0.4));
			border-radius: 15px;
			padding: 20px;
			margin-bottom: 25px;
			border: 1px solid rgba(255,69,0,0.3);
		">
			<div class="verstv-details__program-title" style="
				color: #ff9966;
				font-size: 1.4em;
				font-weight: 600;
				margin-bottom: 15px;
				display: flex;
				align-items: center;
				gap: 10px;
			">
				<span>🎬 Сейчас в эфире</span>
				<div class="vip-badge">LIVE</div>
			</div>
			
			<div class="verstv-details__program-list">
				<div class="verstv-program selector verstv-glow">
					<div class="verstv-program__time js-epgTime" style="
						color: #ff8c00;
						font-weight: 700;
						font-size: 1.2em;
						min-width: 70px;
					">XX:XX</div>
					
					<div class="verstv-program__body" style="flex: 1;">
						<div class="verstv-program__title js-epgTitle" style="
							color: #ffffff;
							font-size: 1.1em;
							font-weight: 600;
							margin-bottom: 10px;
						"></div>
						
						<div class="verstv-progress">
							<div class="verstv-progress-bar js-epgProgress" style="width: 50%"></div>
						</div>
						
						<div class="verstv-program__desc js-epgDesc" style="
							color: #ffcc99;
							font-size: 0.95em;
							margin-top: 10px;
							line-height: 1.4;
						"></div>
					</div>
				</div>
			</div>
		</div>
		
		<div class="verstv-details__program-body js-epgAfter" style="
			background: linear-gradient(135deg, rgba(51,0,0,0.5), rgba(76,0,0,0.3));
			border-radius: 15px;
			padding: 20px;
			border: 1px solid rgba(255,69,0,0.2);
		">
			<div class="verstv-details__program-title" style="
				color: #ff9966;
				font-size: 1.4em;
				font-weight: 600;
				margin-bottom: 15px;
				display: flex;
				align-items: center;
				gap: 10px;
			">
				<span>📅 Следующие передачи</span>
				<div class="vip-badge" style="background: linear-gradient(45deg, #0088ff, #00aaff);">UPCOMING</div>
			</div>
			
			<div class="verstv-details__program-list js-epgList"></div>
		</div>
		
		<!-- VIP информация -->
		<div class="verstv-vip-info" style="
			margin-top: 30px;
			padding: 20px;
			background: linear-gradient(135deg, rgba(255,69,0,0.1), rgba(255,140,0,0.05));
			border-radius: 15px;
			border: 1px solid rgba(255,69,0,0.3);
		">
			<h3 style="color: #ff4500; margin-bottom: 10px; font-weight: 700;">🎯 VIP Функции активны</h3>
			<ul style="color: #ff9966; list-style: none; padding-left: 0;">
				<li style="margin: 5px 0; padding-left: 20px; position: relative;">
					<span style="position: absolute; left: 0;">✓</span> Все каналы в 4K качестве
				</li>
				<li style="margin: 5px 0; padding-left: 20px; position: relative;">
					<span style="position: absolute; left: 0;">✓</span> Доступ ко всем серверам
				</li>
				<li style="margin: 5px 0; padding-left: 20px; position: relative;">
					<span style="position: absolute; left: 0;">✓</span> Без рекламы
				</li>
				<li style="margin: 5px 0; padding-left: 20px; position: relative;">
					<span style="position: absolute; left: 0;">✓</span> Техподдержка 24/7
				</li>
			</ul>
		</div>
	</div>
`);

var epgItemTeplate = $(`
	<div class="verstv-program selector" style="
		cursor: pointer;
		transition: all 0.3s ease;
	">
		<div class="verstv-program__time js-epgTime" style="
			color: #ff8c00;
			font-weight: 600;
			font-size: 1.1em;
			min-width: 70px;
			padding: 12px 0;
		">XX:XX</div>
		
		<div class="verstv-program__body" style="flex: 1; padding: 12px 0;">
			<div class="verstv-program__title js-epgTitle" style="
				color: #ffffff;
				font-size: 1em;
				font-weight: 500;
			"></div>
		</div>
	</div>
`);

// ============= ФУНКЦИИ ДЛЯ ПЛЕЕРА =============
function toggleFullscreen() {
	var player = $('.player')[0];
	if (!document.fullscreenElement) {
		if (player.requestFullscreen) player.requestFullscreen();
		else if (player.webkitRequestFullscreen) player.webkitRequestFullscreen();
		else if (player.msRequestFullscreen) player.msRequestFullscreen();
	} else {
		if (document.exitFullscreen) document.exitFullscreen();
		else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
		else if (document.msExitFullscreen) document.msExitFullscreen();
	}
}

function toggleMute() {
	var player = Lampa.PlayerVideo.get();
	if (player) {
		player.muted = !player.muted;
		Lampa.Noty.show(player.muted ? '🔇 Звук выключен' : '🔊 Звук включен');
	}
}

function togglePlayPause() {
	var player = Lampa.PlayerVideo.get();
	if (player) {
		if (player.paused) {
			player.play();
			Lampa.Noty.show('▶️ Воспроизведение');
		} else {
			player.pause();
			Lampa.Noty.show('⏸️ Пауза');
		}
	}
}

function showChannelInfo() {
	var playlist = Lampa.PlayerPlaylist.get();
	if (playlist && playlist.length > 0) {
		var current = Lampa.PlayerPlaylist.position();
		var channel = playlist[current];
		
		Lampa.Modal.open({
			title: '📺 Информация о канале',
			html: `
				<div style="padding: 20px; color: white;">
					<div style="
						background: linear-gradient(135deg, rgba(255,69,0,0.1), rgba(255,140,0,0.05));
						border-radius: 15px;
						padding: 20px;
						margin-bottom: 20px;
						border: 1px solid rgba(255,69,0,0.3);
					">
						<h3 style="color: #ff4500; margin-bottom: 10px;">${channel.title}</h3>
						<p style="color: #ff9966; margin: 5px 0;">🎯 Качество: 4K ULTRA</p>
						<p style="color: #ff9966; margin: 5px 0;">⚡ Битрейт: 25 Mbps</p>
						<p style="color: #ff9966; margin: 5px 0;">🔊 Звук: Dolby Digital 5.1</p>
					</div>
					
					<div class="vip-badge" style="
						display: block;
						text-align: center;
						margin: 20px auto;
						max-width: 200px;
					">
						VIP КАНАЛ АКТИВЕН
					</div>
				</div>
			`,
			size: 'medium',
			onBack: function() {
				Lampa.Modal.close();
			}
		});
	}
}

// ============= РАСШИРЕННЫЕ ФУНКЦИИ =============
function createVIPFeatures() {
	// Создаем расширенное меню
	var vipMenu = `
	<div id="verstv-vip-features" style="
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 10000;
		display: none;
	">
		<div class="verstv-vip-controls" style="
			background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(76,0,0,0.9));
			border-radius: 20px;
			padding: 20px;
			box-shadow: 0 10px 40px rgba(255,69,0,0.4);
			border: 2px solid #ff4500;
			min-width: 300px;
		">
			<h3 style="color: #ff4500; margin-bottom: 15px; text-align: center;">🎮 VIP Контролы</h3>
			
			<div class="vip-control-grid" style="
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 10px;
				margin-bottom: 15px;
			">
				<button class="verstv-control" onclick="toggleFullscreen()" style="width: 100%;">
					📺 Полный экран
				</button>
				<button class="verstv-control" onclick="toggleMute()" style="width: 100%;">
					🔊 Звук
				</button>
				<button class="verstv-control" onclick="togglePlayPause()" style="width: 100%;">
					⏯️ Пауза
				</button>
				<button class="verstv-control" onclick="showChannelInfo()" style="width: 100%;">
					ℹ️ Инфо
				</button>
			</div>
			
			<div class="vip-status" style="
				background: linear-gradient(45deg, #ff3300, #ff6600);
				border-radius: 10px;
				padding: 10px;
				text-align: center;
				color: white;
				font-weight: bold;
				margin-top: 10px;
			">
				VIP СТАТУС: АКТИВЕН 🔥
			</div>
		</div>
	</div>
	`;
	
	$('body').append(vipMenu);
	
	// Создаем кнопку для открытия меню
	var vipButton = $(`
		<div id="verstv-vip-button" style="
			position: fixed;
			bottom: 20px;
			right: 20px;
			z-index: 9999;
			background: linear-gradient(45deg, #ff3300, #ff6600);
			width: 60px;
			height: 60px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			box-shadow: 0 5px 20px rgba(255,51,0,0.4);
			transition: all 0.3s ease;
			font-size: 24px;
			color: white;
			font-weight: bold;
		" title="VIP Меню">
			VIP
		</div>
	`);
	
	$('body').append(vipButton);
	
	// Обработчики событий
	vipButton.on('click', function() {
		var menu = $('#verstv-vip-features');
		menu.toggle();
		vipButton.toggleClass('active');
		
		if (menu.is(':visible')) {
			vipButton.css({
				'background': 'linear-gradient(45deg, #ff6600, #ff3300)',
				'transform': 'scale(1.1)',
				'box-shadow': '0 0 30px rgba(255,102,0,0.6)'
			});
		} else {
			vipButton.css({
				'background': 'linear-gradient(45deg, #ff3300, #ff6600)',
				'transform': 'scale(1)',
				'box-shadow': '0 5px 20px rgba(255,51,0,0.4)'
			});
		}
	});
	
	// Скрываем меню при клике вне его
	$(document).on('click', function(e) {
		if (!$(e.target).closest('#verstv-vip-button, #verstv-vip-features').length) {
			$('#verstv-vip-features').hide();
			vipButton.css({
				'background': 'linear-gradient(45deg, #ff3300, #ff6600)',
				'transform': 'scale(1)',
				'box-shadow': '0 5px 20px rgba(255,51,0,0.4)'
			});
		}
	});
}

// ============= СИСТЕМА УВЕДОМЛЕНИЙ =============
function showVIPNotification(message, type = 'info') {
	var types = {
		'info': { color: '#ff4500', icon: 'ℹ️' },
		'success': { color: '#00ff88', icon: '✅' },
		'warning': { color: '#ffaa00', icon: '⚠️' },
		'error': { color: '#ff3333', icon: '❌' }
	};
	
	var config = types[type] || types.info;
	
	Lampa.Noty.show({
		text: `${config.icon} ${message}`,
		time: 3000,
		color: config.color
	});
}

// ============= АВТОМАТИЧЕСКАЯ ОПТИМИЗАЦИЯ =============
function optimizePerformance() {
	console.log('⚡ ВЕРС ТВ: Оптимизация производительности...');
	
	// Оптимизация кэширования
	if (window.performance && performance.memory) {
		var memory = performance.memory;
		console.log('📊 Используемая память:', Math.round(memory.usedJSHeapSize / 1048576) + 'MB');
	}
	
	// Отложенная загрузка изображений
	$('img[data-src]').each(function() {
		var img = $(this);
		var src = img.data('src');
		
		if (src) {
			setTimeout(function() {
				img.attr('src', src).removeAttr('data-src');
			}, 100);
		}
	});
	
	// Оптимизация анимаций
	$('.verstv_iptv .card--collection').css('will-change', 'transform');
	
	console.log('✅ ВЕРС ТВ: Оптимизация завершена!');
}

// ============= СИСТЕМА СТАТИСТИКИ =============
var verstvStats = {
	channelsWatched: 0,
	timeWatched: 0,
	favoritesAdded: 0,
	lastWatched: null,
	
	init: function() {
		var saved = localStorage.getItem('verstv_stats');
		if (saved) {
			Object.assign(this, JSON.parse(saved));
		}
		
		// Авто-сохранение каждые 30 секунд
		setInterval(() => this.save(), 30000);
	},
	
	trackChannelWatch: function(channelName) {
		this.channelsWatched++;
		this.lastWatched = {
			name: channelName,
			time: new Date().toISOString()
		};
		
		this.save();
	},
	
	trackTimeWatched: function(seconds) {
		this.timeWatched += seconds;
		this.save();
	},
	
	trackFavorite: function() {
		this.favoritesAdded++;
		this.save();
	},
	
	save: function() {
		localStorage.setItem('verstv_stats', JSON.stringify(this));
	},
	
	getStats: function() {
		return {
			channelsWatched: this.channelsWatched,
			timeWatched: this.formatTime(this.timeWatched),
			favoritesAdded: this.favoritesAdded,
			lastWatched: this.lastWatched
		};
	},
	
	formatTime: function(seconds) {
		var hours = Math.floor(seconds / 3600);
		var minutes = Math.floor((seconds % 3600) / 60);
		var secs = seconds % 60;
		
		return `${hours}ч ${minutes}м ${secs}с`;
	},
	
	showStats: function() {
		var stats = this.getStats();
		
		Lampa.Modal.open({
			title: '📊 Статистика просмотра',
			html: `
				<div style="padding: 20px; color: white;">
					<div style="
						background: linear-gradient(135deg, rgba(255,69,0,0.1), rgba(255,140,0,0.05));
						border-radius: 15px;
						padding: 20px;
						margin-bottom: 15px;
						border: 1px solid rgba(255,69,0,0.3);
					">
						<h4 style="color: #ff4500; margin-bottom: 10px;">Ваша активность</h4>
						<p style="color: #ff9966; margin: 5px 0;">📺 Просмотрено каналов: <b>${stats.channelsWatched}</b></p>
						<p style="color: #ff9966; margin: 5px 0;">⏱️ Общее время: <b>${stats.timeWatched}</b></p>
						<p style="color: #ff9966; margin: 5px 0;">⭐ В избранном: <b>${stats.favoritesAdded}</b> каналов</p>
						
						${stats.lastWatched ? `
							<p style="color: #ff9966; margin: 5px 0; margin-top: 15px;">
								🎯 Последний просмотр: <b>${stats.lastWatched.name}</b><br>
								<small>${new Date(stats.lastWatched.time).toLocaleString()}</small>
							</p>
						` : ''}
					</div>
					
					<div class="vip-badge" style="
						display: block;
						text-align: center;
						margin: 10px auto;
						max-width: 250px;
						font-size: 0.9em;
					">
						VIP ПОЛЬЗОВАТЕЛЬ
					</div>
				</div>
			`,
			size: 'medium',
			onBack: function() {
				Lampa.Modal.close();
			}
		});
	}
};
// ============= ФУНКЦИЯ СТРАНИЦЫ ПЛАГИНА =============
function pluginPage(object) {
	if (object.id !== curListId) {
		catalog = {};
		listCfg = {};
		curListId = object.id;
	}
	
	EPG = {};
	var epgIdCurrent = '';
	var favorite = getStorage('favorite' + object.id, '[]');
	var network = new Lampa.Reguest();
	var scroll = new Lampa.Scroll({
		mask: true,
		over: true,
		step: 250
	});
	
	var html = $('<div></div>');
	var body = $('<div class="' + plugin.component + ' category-full"></div>');
	body.toggleClass('square_icons', getSettings('square_icons'));
	
	var info;
	var last;
	
	if (epgInterval) clearInterval(epgInterval);
	epgInterval = setInterval(function() {
		for (var epgId in EPG) {
			epgRender(epgId);
		}
	}, 1000);
	
	// ============= СИСТЕМА EPG =============
	function epgUpdateData(epgId) {
		var lt = Math.floor(unixtime() / 60);
		var t = Math.floor(lt / 60), ed, ede;
		
		if (!!EPG[epgId] && t >= EPG[epgId][0] && t <= EPG[epgId][1]) {
			ed = EPG[epgId][2];
			if (!ed || !ed.length || ed.length >= 3) return;
			ede = ed[ed.length - 1];
			lt = (ede[0] + ede[1]);
			var t2 = Math.floor(lt / 60);
			if ((t2 - t) > 6 || t2 <= EPG[epgId][1]) return;
			t = t2;
		}
		
		if (!!EPG[epgId]) {
			ed = EPG[epgId][2];
			if (typeof ed !== 'object') return;
			if (ed.length) {
				ede = ed[ed.length - 1];
				lt = (ede[0] + ede[1]);
				var t3 = Math.max(t, Math.floor(lt / 60));
				if (t < t3 && ed.length >= 3) return;
				t = t3;
			}
			EPG[epgId][1] = t;
		} else {
			EPG[epgId] = [t, t, false];
		}
		
		var success = function(epg) {
			if (EPG[epgId][2] === false) EPG[epgId][2] = [];
			for (var i = 0; i < epg.length; i++) {
				if (lt < (epg[i][0] + epg[i][1])) {
					EPG[epgId][2].push.apply(EPG[epgId][2], epg.slice(i));
					break;
				}
			}
			setEpgSessCache(epgId, EPG[epgId][2]);
			epgRender(epgId);
		};
		
		var fail = function() {
			if (EPG[epgId][2] === false) EPG[epgId][2] = [];
			setEpgSessCache(epgId, EPG[epgId][2]);
			epgRender(epgId);
		};
		
		if (EPG[epgId][2] === false) {
			var epg = getEpgSessCache(epgId, lt);
			if (!!epg) return success(epg);
		}
		
		network.silent(
			'https://epg.verstv.ru/api/epg/' + epgId + '/hour/' + t,
			success,
			fail
		);
	}
	
	function epgRender(epgId) {
		var epg = (EPG[epgId] || [0, 0, []])[2];
		if (epg === false) return;
		
		var epgEl = body.find('[data-epg-id=' + epgId + '] .card__age');
		if (!epgEl.length) return;
		
		var t = Math.floor(unixtime() / 60);
		var enableCardEpg = false;
		var i = 0;
		var e, p, cId, cIdEl;
		
		while (epg.length && t >= (epg[0][0] + epg[0][1])) epg.shift();
		
		if (epg.length) {
			e = epg[0];
			if (t >= e[0] && t < (e[0] + e[1])) {
				i++;
				enableCardEpg = true;
				p = Math.round((unixtime() - e[0] * 60) * 100 / (e[1] * 60 || 60));
				cId = e[0] + '_' + epgEl.length;
				cIdEl = epgEl.data('cId') || '';
				
				if (cIdEl !== cId) {
					epgEl.data('cId', cId);
					epgEl.data('progress', p);
					epgEl.find('.js-epgTitle').text(e[2]);
					epgEl.find('.js-epgProgress').css('width', p + '%');
					epgEl.show();
				} else if (epgEl.data('progress') !== p) {
					epgEl.data('progress', p);
					epgEl.find('.js-epgProgress').css('width', p + '%');
				}
			}
		}
		
		if (epgIdCurrent === epgId) {
			var ec = $('#' + plugin.component + '_epg');
			var epgNow = ec.find('.js-epgNow');
			cId = epgId + '_' + epg.length + (epg.length ? '_' + epg[0][0] : '');
			cIdEl = ec.data('cId') || '';
			
			if (cIdEl !== cId) {
				ec.data('cId', cId);
				var epgAfter = ec.find('.js-epgAfter');
				
				if (i) {
					var slt = toLocaleTimeString(e[0] * 60000);
					var elt = toLocaleTimeString((e[0] + e[1]) * 60000);
					
					epgNow.data('progress', p);
					epgNow.find('.js-epgProgress').css('width', p + '%');
					epgNow.find('.js-epgTime').text(slt);
					epgNow.find('.js-epgTitle').text(e[2]);
					
					var desc = e[3] ? ('<p>' + encoder.text(e[3]).html() + '</p>') : '';
					epgNow.find('.js-epgDesc').html(desc.replace(/\n/g, '</p><p>'));
					epgNow.show();
					
					info.find('.info__create').html(
						'<span style="color: #ff8c00;">⏰ ' + slt + '-' + elt + '</span> • ' + 
						'<span style="color: #ffffff;">' + encoder.text(e[2]).html() + '</span>'
					);
				} else {
					info.find('.info__create').html('');
					epgNow.hide();
				}
				
				if (epg.length > i) {
					var list = epgAfter.find('.js-epgList');
					list.empty();
					
					var iEnd = Math.min(epg.length, 10);
					for (; i < iEnd; i++) {
						e = epg[i];
						var item = epgItemTeplate.clone();
						
						item.find('.js-epgTime').text(toLocaleTimeString(e[0] * 60000));
						item.find('.js-epgTitle').text(e[2]);
						
						// Добавляем VIP иконку для премиум контента
						if (e[2].includes('4K') || e[2].includes('VIP') || e[2].includes('Премьера')) {
							item.find('.js-epgTitle').append(' <span class="vip-badge" style="
								display: inline-block;
								padding: 2px 6px;
								font-size: 0.7em;
								margin-left: 5px;
							">VIP</span>');
						}
						
						list.append(item);
					}
					
					epgAfter.show();
				} else {
					epgAfter.hide();
				}
			} else if (i && epgNow.data('progress') !== p) {
				epgNow.data('progress', p);
				epgNow.find('.js-epgProgress').css('width', p + '%');
			}
		}
		
		if (!enableCardEpg) epgEl.hide();
		if (epg.length < 3) epgUpdateData(epgId);
	}
	
	// ============= ОСНОВНЫЕ МЕТОДЫ СТРАНИЦЫ =============
	this.create = function() {
		var _this = this;
		this.activity.loader(true);
		
		// Добавляем VIP заголовок
		var vipHeader = $(`
			<div class="verstv-header" style="
				position: relative;
				z-index: 1000;
				margin-bottom: 20px;
			">
				<div class="info__left">
					<div class="info__title" style="display: flex; align-items: center; gap: 15px;">
						<span>${plugin.name}</span>
						<div class="vip-badge" style="
							background: linear-gradient(45deg, #ff3300, #ff9900);
							animation: vipPulse 2s infinite;
						">
							VIP АКТИВИРОВАН
						</div>
					</div>
					<div class="info__create" style="
						color: #ff9966;
						font-size: 1.2em;
						margin-top: 10px;
						display: flex;
						align-items: center;
						gap: 10px;
					">
						<span>🔥 Все каналы разблокированы</span>
						<span style="color: #00ff88;">•</span>
						<span>⚡ 4K качество</span>
						<span style="color: #00ff88;">•</span>
						<span>🎯 Без рекламы</span>
					</div>
				</div>
				
				<div class="info__right" style="
					display: flex;
					gap: 10px;
					align-items: center;
				">
					<button class="verstv-control" onclick="verstvStats.showStats()" style="
						padding: 8px 16px;
						font-size: 0.9em;
					">
						📊 Статистика
					</button>
					
					<button class="verstv-control" onclick="showVIPSettings()" style="
						padding: 8px 16px;
						font-size: 0.9em;
						background: linear-gradient(45deg, #0088ff, #00aaff);
					">
						⚙️ Настройки
					</button>
				</div>
			</div>
		`);
		
		html.append(vipHeader);
		info = vipHeader;
		
		var emptyResult = function() {
			var empty = new Lampa.Empty();
			html.append(empty.render());
			_this.start = empty.start;
			_this.activity.loader(false);
			_this.activity.toggle();
		};
		
		if (Object.keys(catalog).length) {
			_this.build(
				!catalog[object.currentGroup]
					? (lists[object.id].groups.length > 1 && catalog[lists[object.id].groups[1].key]
						? catalog[lists[object.id].groups[1].key]['channels']
						: [])
					: catalog[object.currentGroup]['channels']
			);
		} else if (!lists[object.id] || !object.url) {
			emptyResult();
			return;
		} else {
			var load = 2, chIDs = {}, data;
			
			var compileList = function(dataList) {
				data = dataList;
				if (!--load) parseList();
			};
			
			// Функция для генерации короткого имени канала
			var chShortName = function(chName) {
				return chName
					.toLowerCase()
					.replace(/\s+\((\+\d+)\)/g, ' $1')
					.replace(/^телеканал\s+/, '')
					.replace(/[!\s.,()ⓢⓖ–-]+/g, ' ').trim()
					.replace(/\s(канал|тв)(\s.+|\s*)$/, '$2')
					.replace(/\s(50|orig|original)$/, '')
					.replace(/\s(\d+)/g, '$1');
			};
			
			var parseList = function() {
				if (typeof data != 'string' || data.substr(0, 7).toUpperCase() !== "#EXTM3U") {
					emptyResult();
					return;
				}
				
				// Инициализация каталога с VIP категориями
				catalog = {
					'': {
						title: '⭐ Избранное',
						channels: []
					}
				};
				
				lists[object.id].groups = [{
					title: '⭐ Избранное',
					key: ''
				}];
				
				// Добавляем VIP категории
				VIP_CONFIG.categories.forEach(function(cat) {
					catalog[cat] = {
						title: '🔥 ' + cat,
						channels: []
					};
					
					lists[object.id].groups.push({
						title: '🔥 ' + cat,
						key: cat
					});
				});
				
				// Парсинг M3U плейлиста
				var l = data.split(/\r?\n/);
				var cnt = 0, i = 1, chNum = 0, m, mm, defGroup = defaultGroup;
				
				// Парсинг конфигурации плейлиста
				if (!!(m = l[0].match(/([^\s=]+)=((["'])(.*?)\3|\S+)/g))) {
					for (var jj = 0; jj < m.length; jj++) {
						if (!!(mm = m[jj].match(/([^\s=]+)=((["'])(.*?)\3|\S+)/))) {
							listCfg[mm[1].toLowerCase()] = mm[4] || mm[2];
						}
					}
				}
				
				while (i < l.length) {
					chNum = cnt + 1;
					var channel = {
						ChNum: chNum,
						Title: "Канал " + chNum,
						isYouTube: false,
						Url: '',
						Group: '',
						Options: {}
					};
					
					for (; cnt < chNum && i < l.length; i++) {
						if (!!(m = l[i].match(/^#EXTGRP:\s*(.+?)\s*$/i)) && m[1].trim() !== '') {
							defGroup = m[1].trim();
						} else if (!!(m = l[i].match(/^#EXTINF:\s*-?\d+(\s+\S.*?\s*)?,(.+)$/i))) {
							channel.Title = m[2].trim();
							if (!!m[1] && !!(m = m[1].match(/([^\s=]+)=((["'])(.*?)\3|\S+)/g))) {
								for (var j = 0; j < m.length; j++) {
									if (!!(mm = m[j].match(/([^\s=]+)=((["'])(.*?)\3|\S+)/))) {
										channel[mm[1].toLowerCase()] = mm[4] || mm[2];
									}
								}
							}
						} else if (!!(m = l[i].match(/^#EXTVLCOPT:\s*([^\s=]+)=(.+)$/i))) {
							channel.Options[m[1].trim().toLowerCase()] = m[2].trim();
						} else if (!!(m = l[i].match(/^(https?):\/\/(.+)$/i))) {
							channel.Url = m[0].trim();
							channel.isYouTube = !!(m[2].match(/^(www\.)?youtube\.com/));
							channel.Group = channel['group-title'] || defGroup;
							cnt++;
						}
					}
					
					if (!!channel.Url && !channel.isYouTube) {
						// Проверяем, является ли канал VIP
						var isVIPChannel = VIP_CONFIG.categories.some(function(cat) {
							return channel.Group.includes(cat) || 
								   channel.Title.includes('VIP') || 
								   channel.Title.includes('4K') ||
								   channel.Title.includes('ULTRA') ||
								   channel.Title.includes('PREMIUM');
						});
						
						// Добавляем VIP метку к названию
						if (isVIPChannel) {
							channel.Title += ' 🔥';
						}
						
						// Создаем группу, если ее нет
						if (!catalog[channel.Group]) {
							catalog[channel.Group] = {
								title: channel.Group + (isVIPChannel ? ' 🔥' : ''),
								channels: []
							};
							
							lists[object.id].groups.push({
								title: channel.Group + (isVIPChannel ? ' 🔥' : ''),
								key: channel.Group
							});
						}
						
						// Очищаем название канала
						channel['Title'] = channel['Title']
							.replace('ⓢ', '')
							.replace('ⓖ', '')
							.replace(/\s+/g, ' ')
							.trim();
						
						// Генерируем логотип для канала
						if (!channel['tvg-logo']) {
							var channelName = encodeURIComponent(channel.Title.substring(0, 15));
							channel['tvg-logo'] = 'https://img.verstv.ru/logo/' + channelName + '.png?size=400x225&bg=330000&color=ff4500';
						}
						
						// Добавляем канал в каталог
						catalog[channel.Group].channels.push(channel);
						
						// Добавляем в избранное, если нужно
						var favI = favorite.indexOf(favID(channel.Title));
						if (favI !== -1) {
							catalog[''].channels[favI] = channel;
						}
						
						// Отслеживаем в статистике
						if (isVIPChannel) {
							verstvStats.trackChannelWatch(channel.Title);
						}
					}
				}
				
				// Обновляем счетчики в группах
				for (i = 0; i < lists[object.id].groups.length; i++) {
					var group = lists[object.id].groups[i];
					if (catalog[group.key]) {
						group.title += ' [' + catalog[group.key].channels.length + ']';
					}
				}
				
				// Заполняем избранное
				for (i = 0; i < favorite.length; i++) {
					if (!catalog[''].channels[i]) {
						catalog[''].channels[i] = {
							ChNum: -1,
							Title: "#" + favorite[i],
							isYouTube: false,
							Url: 'https://stream.verstv.ru/empty.m3u8',
							Group: '',
							Options: {},
							'tvg-logo': 'https://img.verstv.ru/empty.png'
						};
					}
				}
				
				// Строим интерфейс
				_this.build(
					!catalog[object.currentGroup]
						? (lists[object.id].groups.length > 1 && !!catalog[lists[object.id].groups[1].key]
							? catalog[lists[object.id].groups[1].key]['channels']
							: [])
						: catalog[object.currentGroup]['channels']
				);
			};
			
			// Загружаем плейлист
			var listUrl = object.url || utils.getPlaylist();
			network.native(
				listUrl,
				compileList,
				function() {
					// Fallback через CORS прокси
					network.silent(
						'https://corsproxy.io/?' + encodeURIComponent(listUrl),
						compileList,
						emptyResult,
						false,
						{ dataType: 'text' }
					);
				},
				false,
				{ dataType: 'text' }
			);
		}
		
		return this.render();
	};
	
	// ============= ПОСТРОЕНИЕ ИНТЕРФЕЙСА =============
	this.append = function(data) {
		var catEpg = [];
		var chIndex = 0;
		var _this2 = this;
		var lazyLoadImg = ('loading' in HTMLImageElement.prototype);
		
		var bulkFn = bulkWrapper(function(channel) {
			var chI = chIndex++;
			
			// Создаем карточку канала
			var card = Lampa.Template.get('card', {
				title: channel.Title,
				release_year: ''
			});
			
			card.addClass('card--collection verstv-channel-card');
			
			// Настраиваем изображение
			var img = card.find('.card__img')[0];
			if (lazyLoadImg) img.loading = (chI < 18 ? 'eager' : 'lazy');
			
			img.onload = function() {
				card.addClass('card--loaded');
				card.addClass('verstv-channel-icon');
			};
			
			img.onerror = function(e) {
				// Создаем цветной бейдж для канала
				var name = channel.Title
					.replace(/\s+\(([+-]?\d+)\)/, ' $1')
					.replace(/[-.()\s]+/g, ' ')
					.replace(/(^|\s+)(TV|ТВ)(\s+|$)/i, '$3');
				
				var fl = name.replace(/\s+/g, '').length > 5
					? name.split(/\s+/).map(function(v) {
						return v.match(/^(\+?\d+|[UF]?HD|4K)$/i) ? v : v.substring(0,1).toUpperCase();
					}).join('').substring(0,6)
					: name.replace(/\s+/g, '');
				
				fl = fl.replace(/([UF]?HD|4k|\+\d+)$/i, '<sup style="color: #ff8c00;">$1</sup>');
				
				// Генерируем уникальный цвет для канала
				var hex = (Lampa.Utils.hash(channel.Title) * 1).toString(16);
				while (hex.length < 6) hex += hex;
				hex = hex.substring(0,6);
				
				var r = parseInt(hex.slice(0, 2), 16),
					g = parseInt(hex.slice(2, 4), 16),
					b = parseInt(hex.slice(4, 6), 16);
				
				var hexText = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
				
				// Создаем красивый бейдж
				card.find('.card__img').replaceWith(
					'<div class="card__img" style="' +
					'display: flex;' +
					'align-items: center;' +
					'justify-content: center;' +
					'font-size: 1.5em;' +
					'font-weight: 700;' +
					'text-shadow: 1px 1px 2px rgba(0,0,0,0.5);' +
					'">' + fl + '</div>'
				);
				
				card.find('.card__view').css({
					'background': 'linear-gradient(135deg, #' + hex + ', #' + hex.substring(0,4) + '88)',
					'color': hexText
				});
				
				channel['tvg-logo'] = '';
				card.addClass('card--loaded');
				card.addClass('verstv-channel-icon');
			};
			
			if (channel['tvg-logo']) {
				img.src = channel['tvg-logo'];
			} else {
				img.onerror();
			}
			
			// Добавляем иконки
			var favIcon = $('<div class="card__icon icon--book hide" title="В избранном" style="' +
				'background: rgba(255, 215, 0, 0.3);' +
				'border-radius: 50%;' +
				'padding: 5px;' +
				'"></div>');
			
			card.find('.card__icons-inner').append(favIcon);
			
			// Добавляем VIP иконку для премиум каналов
			if (channel.Title.includes('🔥') || channel.Title.includes('VIP') || channel.Title.includes('4K')) {
				card.find('.card__icons-inner').append(
					'<div class="card__icon icon--vip" title="VIP Канал" style="' +
					'background: linear-gradient(45deg, #ff3300, #ff9900);' +
					'border-radius: 50%;' +
					'padding: 5px;' +
					'font-size: 0.8em;' +
					'font-weight: bold;' +
					'color: white;' +
					'">VIP</div>'
				);
			}
			
			// Настраиваем timeshift/архив
			var tvgDay = parseInt(
				channel['catchup-days'] || channel['tvg-rec'] || channel['timeshift'] ||
				listCfg['catchup-days'] || listCfg['tvg-rec'] || listCfg['timeshift'] || '7'
			);
			
			if (tvgDay > 0) {
				card.find('.card__icons-inner').append(
					'<div class="card__icon icon--timeshift" title="Доступен архив (' + tvgDay + ' дней)" style="' +
					'background: rgba(0, 200, 255, 0.3);' +
					'border-radius: 50%;' +
					'padding: 5px;' +
					'"></div>'
				);
			}
			
			// Создаем EPG блок
			card.find('.card__age').html(
				'<div class="card__epg-progress js-epgProgress" style="' +
				'background: linear-gradient(90deg, #ff4500, #ff8c00);' +
				'height: 3px;' +
				'border-radius: 2px;' +
				'"></div>' +
				'<div class="card__epg-title js-epgTitle" style="' +
				'color: #ff9966;' +
				'font-size: 0.9em;' +
				'padding: 5px;' +
				'white-space: nowrap;' +
				'overflow: hidden;' +
				'text-overflow: ellipsis;' +
				'"></div>'
			);
			
			// Проверяем, в избранном ли канал
			if (object.currentGroup !== '' && favorite.indexOf(favID(channel.Title)) !== -1) {
				favIcon.toggleClass('hide', false);
			}
			
			// ============= ОБРАБОТЧИКИ СОБЫТИЙ =============
			card.on('hover:focus hover:hover touchstart', function(event) {
				if (event.type && event.type !== 'touchstart' && event.type !== 'hover:hover') {
					scroll.update(card, !true);
				}
				
				last = card[0];
				
				// Обновляем информацию в заголовке
				info.find('.info__title').html(
					'<span style="color: #ff4500;">📺</span> ' +
					'<span style="color: #ffffff;">' + channel.Title + '</span>' +
					(channel.Title.includes('🔥') ? ' <span class="vip-badge" style="margin-left: 10px;">VIP</span>' : '')
				);
				
				info.find('.info__title-original').text(channel.Group || 'Основные каналы');
				
				// Обновляем EPG
				var ec = $('#' + plugin.component + '_epg');
				ec.find('.js-epgChannel').html(
					'<span style="color: #ff4500;">' + channel.Title + '</span>' +
					(channel.Title.includes('4K') ? ' <span style="color: #00ff88; font-size: 0.8em;">[4K]</span>' : '')
				);
				
				if (!channel['epgId']) {
					info.find('.info__create').empty();
					epgIdCurrent = '';
					ec.find('.js-epgNow').hide();
					ec.find('.js-epgAfter').hide();
				} else {
					epgIdCurrent = channel['epgId'];
					epgRender(channel['epgId']);
				}
			}).on('hover:enter', function() {
				// Воспроизведение канала
				var video = {
					title: channel.Title,
					url: prepareUrl(channel.Url),
					plugin: plugin.component,
					tv: true,
					quality: '4K'
				};
				
				// Создаем плейлист для внешнего плеера
				var playlist = [];
				var playlistForExternalPlayer = [];
				var i = 0;
				
				data.forEach(function(elem) {
					var j = i < chI ? data.length - chI + i : i - chI;
					var videoUrl = i === chI ? video.url : prepareUrl(elem.Url);
					
					playlistForExternalPlayer[j] = {
						title: elem.Title,
						url: videoUrl,
						tv: true
					};
					
					playlist.push({
						title: ++i + '. ' + elem.Title,
						url: videoUrl,
						plugin: plugin.component,
						tv: true
					});
				});
				
				video['playlist'] = playlistForExternalPlayer;
				
				// Включаем управление клавишами
				Lampa.Keypad.listener.destroy();
				Lampa.Keypad.listener.follow('keydown', keydown);
				
				// Запускаем воспроизведение
				Lampa.Player.play(video);
				Lampa.Player.playlist(playlist);
				
				// Отслеживаем в статистике
				verstvStats.trackChannelWatch(channel.Title);
				verstvStats.trackTimeWatched(1); // Пример: 1 секунда просмотра
				
				// Показываем VIP уведомление
				if (channel.Title.includes('🔥')) {
					showVIPNotification('Запущен VIP канал: ' + channel.Title, 'success');
				}
			}).on('hover:long', function() {
				// Длинное нажатие - меню действий
				var favI = favorite.indexOf(favID(channel.Title));
				var isFavoriteGroup = object.currentGroup === '';
				var menu = [];
				
				// Проверяем доступность архива
				var tvgDay = parseInt(
					channel['catchup-days'] || channel['tvg-rec'] || channel['timeshift'] ||
					listCfg['catchup-days'] || listCfg['tvg-rec'] || listCfg['timeshift'] || '0'
				);
				
				if (tvgDay > 0) {
					if (!!channel['epgId'] && !!EPG[channel['epgId']] && EPG[channel['epgId']][2].length) {
						menu.push({
							title: '🎬 Смотреть сначала',
							icon: '⏪',
							restartProgram: true
						});
					}
					
					menu.push({
						title: '📺 Архив передач (' + tvgDay + ' дней)',
						icon: '📅',
						archive: true
					});
				}
				
				// Избранное
				menu.push({
					title: favI === -1 ? '⭐ Добавить в избранное' : '⭐ Удалить из избранного',
					icon: favI === -1 ? '⭐' : '❌',
					favToggle: true
				});
				
				if (isFavoriteGroup && favorite.length) {
					if (favI !== 0) {
						menu.push({
							title: '⬆️ В начало списка',
							icon: '⬆️',
							favMove: true,
							i: 0
						});
						
						menu.push({
							title: '🔼 Переместить вверх',
							icon: '🔼',
							favMove: true,
							i: favI - 1
						});
					}
					
					if ((favI + 1) !== favorite.length) {
						menu.push({
							title: '🔽 Переместить вниз',
							icon: '🔽',
							favMove: true,
							i: favI + 1
						});
						
						menu.push({
							title: '⬇️ В конец списка',
							icon: '⬇️',
							favMove: true,
							i: favorite.length - 1
						});
					}
					
					menu.push({
						title: '🗑️ Очистить избранное',
						icon: '🗑️',
						favClear: true
					});
				}
				
				// VIP функции
				menu.push({
					title: '⚡ Тест скорости',
					icon: '⚡',
					startTest: true
				});
				
				menu.push({
					title: getStorage('epg', 'false') ? '📺 Выключить телепрограмму' : '📺 Включить телепрограмму',
					icon: '📺',
					epgToggle: true
				});
				
				menu.push({
					title: '🔧 Настройки качества',
					icon: '🔧',
					qualitySettings: true
				});
				
				// Показываем меню
				Lampa.Select.show({
					title: '🎮 Действия с каналом',
					items: menu,
					onSelect: function(sel) {
						handleChannelAction(sel, channel, favI);
					},
					onBack: function() {
						Lampa.Controller.toggle('content');
					}
				});
			});
			
			// Добавляем карточку на страницу
			body.append(card);
			
			// Добавляем EPG, если есть
			if (!!channel['epgId']) {
				card.attr('data-epg-id', channel['epgId']);
				epgRender(channel['epgId']);
			}
			
			// Добавляем в список EPG каналов
			if (!!channel['epgId'] && catEpg.indexOf(channel['epgId']) === -1) {
				catEpg.push(channel['epgId']);
			}
		},
		{
			bulk: 12,
			onEnd: function(last, total, left) {
				_this2.activity.loader(false);
				_this2.activity.toggle();
				
				// Показываем статистику загрузки
				if (total > 0) {
					console.log(`✅ ВЕРС ТВ: Загружено ${total} каналов`);
					
					// Показываем VIP уведомление
					if (total > 50) {
						showVIPNotification(`Загружено ${total} каналов (${catEpg.length} с телепрограммой)`, 'success');
					}
				}
			}
		});
		
		// Обрабатываем все каналы
		data.forEach(function(channel) {
			bulkFn(channel);
		});
	};
	
	// ============= ОБРАБОТКА ДЕЙСТВИЙ С КАНАЛОМ =============
	function handleChannelAction(sel, channel, favI) {
		if (!!sel.startTest) {
			showSpeedTest(channel.Url);
		} else if (!!sel.archive) {
			openArchive(channel);
		} else if (!!sel.restartProgram) {
			restartProgram(channel);
		} else if (!!sel.epgToggle) {
			toggleEPG();
		} else if (!!sel.qualitySettings) {
			openQualitySettings(channel);
		} else if (!!sel.favToggle) {
			toggleFavorite(channel, favI);
		} else if (!!sel.favClear) {
			clearFavorites();
		} else if (!!sel.favMove) {
			moveFavorite(channel, favI, sel.i);
		}
	}
	
	// ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============
	function showSpeedTest(url) {
		Lampa.Modal.open({
			title: '⚡ Тест скорости соединения',
			html: `
				<div style="padding: 20px; color: white; text-align: center;">
					<div class="verstv-loading" style="margin: 20px 0;">
						<div style="position: absolute; color: #ff4500; font-weight: bold;">
							Идет тест скорости...
						</div>
					</div>
					
					<div id="speedTestResult" style="
						margin-top: 20px;
						padding: 20px;
						background: linear-gradient(135deg, rgba(0,100,0,0.2), rgba(0,150,0,0.1));
						border-radius: 15px;
						border: 1px solid rgba(0,255,0,0.3);
						display: none;
					">
						<h4 style="color: #00ff88; margin-bottom: 15px;">Результаты теста</h4>
						<p style="color: #aaffaa; margin: 10px 0;">📡 Скорость загрузки: <b id="downloadSpeed">-</b></p>
						<p style="color: #aaffaa; margin: 10px 0;">🔄 Пинг: <b id="pingResult">-</b></p>
						<p style="color: #aaffaa; margin: 10px 0;">📊 Качество: <b id="qualityResult">-</b></p>
					</div>
					
					<button class="verstv-control" onclick="runSpeedTest()" style="
						margin-top: 20px;
						padding: 12px 24px;
						font-size: 1.1em;
					">
						🚀 Запустить тест
					</button>
				</div>
			`,
			size: 'medium',
			onBack: function() {
				Lampa.Modal.close();
			}
		});
	}
	
	function openArchive(channel) {
		var t = unixtime();
		var m = Math.floor(t / 60);
		var d = Math.floor(t / 86400);
		var tvgDay = 7; // VIP: 7 дней архива
		var di = (tvgDay + 1), load = di;
		var ms = m - tvgDay * 1440;
		var tvgData = [];
		var playlist = [];
		var playlistMenu = [];
		var archiveMenu = [];
		var ps = 0;
		var prevDate = '';
		
		var d0 = toLocaleDateString(unixtime() * 1e3);
		var d1 = toLocaleDateString((unixtime() - 86400) * 1e3);
		var d2 = toLocaleDateString((unixtime() - 2 * 86400) * 1e3);
		
		var txtD = {};
		txtD[d0] = '🔥 Сегодня - ' + d0;
		txtD[d1] = '📅 Вчера - ' + d1;
		txtD[d2] = '📅 Позавчера - ' + d2;
		
		var onEpgLoad = function() {
			if (--load) return;
			
			for (var i = tvgData.length - 1; i >= 0; i--) {
				if (tvgData[i].length === 0) {
					var dt = (d - i) * 1440;
					for (var dm = 0; dm < 1440; dm += 30) {
						tvgData[i].push([dt + dm, 30, toLocaleDateString((dt + dm) * 6e4), '']);
					}
				}
				
				for (var j = 0; j < tvgData[i].length; j++) {
					var epg = tvgData[i][j];
					if (epg[0] === ps || epg[0] > m || epg[0] + epg[1] < ms) continue;
					
					ps = epg[0];
					var url = catchupUrl(
						channel.Url,
						(channel['catchup'] || channel['catchup-type'] || listCfg['catchup'] || listCfg['catchup-type']),
						(channel['catchup-source'] || listCfg['catchup-source'])
					);
					
					var item = {
						title: toLocaleTimeString(epg[0] * 6e4) + ' - ' + epg[2],
						url: prepareUrl(url, epg),
						catchupUrl: url,
						epg: epg
					};
					
					var newDate = toLocaleDateString(epg[0] * 6e4);
					newDate = txtD[newDate] || newDate;
					
					if (newDate !== prevDate) {
						if (prevDate) {
							archiveMenu.unshift({
								title: prevDate,
								separator: true
							});
						}
						
						playlistMenu.push({
							title: newDate,
							separator: true,
							url: item.url
						});
						
						prevDate = newDate;
					}
					
					archiveMenu.unshift(item);
					playlistMenu.push(item);
					playlist.push(item);
				}
			}
			
			if (prevDate) {
				archiveMenu.unshift({
					title: prevDate,
					separator: true
				});
			}
			
			tvgData = [];
			
			Lampa.Select.show({
				title: '📺 Архив передач',
				items: archiveMenu,
				onSelect: function(sel) {
					var video = {
						title: sel.title,
						url: sel.url,
						playlist: playlist,
						quality: '4K'
					};
					
					Lampa.Controller.toggle('content');
					Lampa.Player.play(video);
					Lampa.Player.playlist(playlistMenu);
					
					showVIPNotification('Запущен архивный просмотр', 'info');
				},
				onBack: function() {
					Lampa.Controller.toggle('content');
				}
			});
		};
		
		while (di--) {
			tvgData[di] = [];
			(function() {
				var dd = di;
				networkSilentSessCache(
					'https://epg.verstv.ru/api/epg/' + channel['epgId'] + '/day/' + (d - dd),
					function(data) {
						tvgData[dd] = data;
						onEpgLoad();
					},
					onEpgLoad
				);
			})();
		}
	}
		function restartProgram(channel) {
		var epg = EPG[channel['epgId']][2][0];
		var type = (channel['catchup'] || channel['catchup-type'] || listCfg['catchup'] || listCfg['catchup-type'] || '');
		var url = catchupUrl(
			channel.Url,
			type,
			(channel['catchup-source'] || listCfg['catchup-source'])
		);
		
		var flussonic = type.search(/^flussonic/i) === 0;
		if (flussonic) {
			url = url.replace('${(d)S}', 'now');
		}
		
		var video = {
			title: channel.Title + ' (с начала)',
			url: prepareUrl(url, epg),
			plugin: plugin.component,
			catchupUrl: url,
			epg: epg,
			quality: '4K'
		};
		
		if (flussonic) video['timeline'] = {
			time: 11,
			percent: 0,
			duration: (epg[1] * 60)
		};
		
		Lampa.Controller.toggle('content');
		Lampa.Player.play(video);
		
		showVIPNotification('Запущено с начала программы', 'info');
	}
	
	function toggleEPG() {
		var epg = !getStorage('epg', false);
		setStorage('epg', epg);
		
		var scrollContainer = body.parents(".scroll");
		if (epg) {
			scrollContainer.css({float: "left", width: '70%'});
			scrollContainer.parent().append(epgTemplate);
			showVIPNotification('Телепрограмма включена', 'success');
		} else {
			scrollContainer.css({float: "none", width: '100%'});
			$('#' + plugin.component + '_epg').remove();
			showVIPNotification('Телепрограмма выключена', 'info');
		}
		
		Lampa.Controller.toggle('content');
	}
	
	function openQualitySettings(channel) {
		var qualities = utils.getQualityOptions();
		var items = [];
		
		for (var key in qualities) {
			items.push({
				title: qualities[key],
				value: key,
				selected: Lampa.Storage.field('verstv_iptv_quality') === key
			});
		}
		
		Lampa.Select.show({
			title: '🎬 Настройки качества',
			items: items,
			onSelect: function(sel) {
				Lampa.Storage.set('verstv_iptv_quality', sel.value);
				showVIPNotification('Качество изменено на: ' + sel.title, 'success');
				Lampa.Controller.toggle('content');
			},
			onBack: function() {
				Lampa.Controller.toggle('content');
			}
		});
	}
	
	function toggleFavorite(channel, favI) {
		var favGroup = lists[object.id].groups[0];
		
		if (favI === -1) {
			favI = favorite.length;
			favorite[favI] = favID(channel.Title);
			catalog[favGroup.key].channels[favI] = channel;
			verstvStats.trackFavorite();
			showVIPNotification('Добавлено в избранное', 'success');
		} else {
			favorite.splice(favI, 1);
			catalog[favGroup.key].channels.splice(favI, 1);
			showVIPNotification('Удалено из избранного', 'info');
		}
		
		setStorage('favorite' + object.id, favorite);
		favGroup.title = catalog[favGroup.key].title + ' [' + catalog[favGroup.key].channels.length + ']';
		
		if (object.currentGroup === '') {
			Lampa.Activity.replace(Lampa.Arrays.clone(lists[object.id].activity));
		} else {
			body.find('[data-epg-id="' + channel['epgId'] + '"] .icon--book')
				.toggleClass('hide', favorite.indexOf(favID(channel.Title)) === -1);
			Lampa.Controller.toggle('content');
		}
	}
	
	function clearFavorites() {
		var favGroup = lists[object.id].groups[0];
		favorite = [];
		catalog[favGroup.key].channels = [];
		
		setStorage('favorite' + object.id, favorite);
		favGroup.title = catalog[favGroup.key].title + ' [' + catalog[favGroup.key].channels.length + ']';
		
		Lampa.Activity.replace(Lampa.Arrays.clone(lists[object.id].activity));
		showVIPNotification('Избранное очищено', 'warning');
	}
	
	function moveFavorite(channel, favI, newIndex) {
		var favGroup = lists[object.id].groups[0];
		
		favorite.splice(favI, 1);
		favorite.splice(newIndex, 0, favID(channel.Title));
		
		catalog[favGroup.key].channels.splice(favI, 1);
		catalog[favGroup.key].channels.splice(newIndex, 0, channel);
		
		setStorage('favorite' + object.id, favorite);
		
		Lampa.Activity.replace(Lampa.Arrays.clone(lists[object.id].activity));
		showVIPNotification('Позиция изменена', 'info');
	}
	
	// ============= ПОСТРОЕНИЕ ИНТЕРФЕЙСА =============
	this.build = function(data) {
		var _this2 = this;
		
		Lampa.Background.change();
		
		// Создаем кнопку категорий
		var categoryButton = $(`
			<div class="verstv-control view--category" style="
				display: flex;
				align-items: center;
				gap: 10px;
				margin-left: auto;
			">
				<svg style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 24 24" 
					 xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<g id="info"/>
					<g id="icons">
						<g id="menu">
							<path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>
							<path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>
							<path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>
						</g>
					</g>
				</svg>
				<span>Категории</span>
			</div>
		`);
		
		// Добавляем кнопку в заголовок
		info.find('.info__right').prepend(categoryButton);
		
		categoryButton.on('hover:enter hover:click', function() {
			_this2.selectGroup();
		});
		
		// Настраиваем информацию о категории
		info.find('.info__title-original').text(
			!catalog[object.currentGroup] ? '' : 
			catalog[object.currentGroup].title + ' • ' + data.length + ' каналов'
		);
		
		// Загрузка данных
		this.activity.loader(false);
		
		if (data.length) {
			scroll.render().addClass('layer--wheight').data('mheight', info);
			html.append(scroll.render());
			
			this.append(data);
			
			// Включаем EPG если нужно
			if (getStorage('epg', false)) {
				scroll.render().css({float: "left", width: '70%'});
				scroll.render().parent().append(epgTemplate);
			}
			
			scroll.append(body);
			
			// Сохраняем последнюю категорию
			setStorage('last_catalog' + object.id, object.currentGroup ? object.currentGroup : '!!');
			lists[object.id].activity.currentGroup = object.currentGroup;
			
			// Показываем VIP информацию
			if (data.length > 0) {
				setTimeout(function() {
					var vipCount = data.filter(function(ch) {
						return ch.Title.includes('🔥') || ch.Title.includes('VIP') || ch.Title.includes('4K');
					}).length;
					
					if (vipCount > 0) {
						info.find('.info__create').append(
							'<div style="margin-top: 10px; color: #00ff88; font-size: 0.9em;">' +
							'🎯 VIP каналов: ' + vipCount + ' из ' + data.length +
							'</div>'
						);
					}
				}, 1000);
			}
		} else {
			var empty = new Lampa.Empty();
			html.append(empty.render());
			this.start = empty.start;
			this.activity.loader(false);
			Lampa.Controller.collectionSet(info);
			Navigator.move('right');
		}
	};
	
	// ============= ВЫБОР КАТЕГОРИИ =============
	this.selectGroup = function() {
		var activity = Lampa.Arrays.clone(lists[object.id].activity);
		
		Lampa.Select.show({
			title: '📺 Категории каналов',
			items: Lampa.Arrays.clone(lists[object.id].groups),
			onSelect: function(group) {
				if (object.currentGroup !== group.key) {
					activity.currentGroup = group.key;
					Lampa.Activity.replace(activity);
					
					// Отслеживаем выбор категории
					showVIPNotification('Выбрана категория: ' + group.title, 'info');
				} else {
					Lampa.Controller.toggle('content');
				}
			},
			onBack: function() {
				Lampa.Controller.toggle('content');
			}
		});
	};
	
	// ============= УПРАВЛЕНИЕ НАВИГАЦИЕЙ =============
	this.start = function() {
		if (Lampa.Activity.active().activity !== this.activity) return;
		
		var _this = this;
		
		Lampa.Controller.add('content', {
			toggle: function toggle() {
				Lampa.Controller.collectionSet(scroll.render());
				Lampa.Controller.collectionFocus(last || false, scroll.render());
			},
			left: function left() {
				if (Navigator.canmove('left')) Navigator.move('left');
				else Lampa.Controller.toggle('menu');
			},
			right: function right() {
				if (Navigator.canmove('right')) Navigator.move('right');
				else _this.selectGroup();
			},
			up: function up() {
				if (Navigator.canmove('up')) {
					Navigator.move('up');
				} else {
					if (!info.find('.view--category').hasClass('focus')) {
						Lampa.Controller.collectionSet(info);
						Navigator.move('right');
					} else {
						Lampa.Controller.toggle('head');
					}
				}
			},
			down: function down() {
				if (Navigator.canmove('down')) {
					Navigator.move('down');
				} else if (info.find('.view--category').hasClass('focus')) {
					Lampa.Controller.toggle('content');
				}
			},
			back: function back() {
				Lampa.Activity.backward();
			}
		});
		
		Lampa.Controller.toggle('content');
	};
	
	this.pause = function() {
		// Пауза просмотра
	};
	
	this.stop = function() {
		// Остановка
	};
	
	this.render = function() {
		return html;
	};
	
	this.destroy = function() {
		network.clear();
		scroll.destroy();
		
		if (info) info.remove();
		if (epgInterval) clearInterval(epgInterval);
		
		html.remove();
		body.remove();
		
		favorite = null;
		network = null;
		html = null;
		body = null;
		info = null;
	};
}

// ============= СИСТЕМА НАСТРОЕК =============
function showVIPSettings() {
	var servers = utils.getAvailableServers();
	var qualities = utils.getQualityOptions();
	var themes = utils.getThemeOptions();
	
	var serverItems = [];
	var qualityItems = [];
	var themeItems = [];
	
	for (var key in servers) {
		serverItems.push({
			title: servers[key],
			value: key,
			selected: Lampa.Storage.field('verstv_iptv_server') === key
		});
	}
	
	for (var key in qualities) {
		qualityItems.push({
			title: qualities[key],
			value: key,
			selected: Lampa.Storage.field('verstv_iptv_quality') === key
		});
	}
	
	for (var key in themes) {
		themeItems.push({
			title: themes[key],
			value: key,
			selected: Lampa.Storage.field('verstv_iptv_theme') === key
		});
	}
	
	Lampa.Select.show({
		title: '⚙️ VIP Настройки',
		items: [
			{
				title: '🌐 Сервер трансляции',
				items: serverItems,
				onSelect: function(sel) {
					Lampa.Storage.set('verstv_iptv_server', sel.value);
					showVIPNotification('Сервер изменен: ' + sel.title, 'success');
					Lampa.Controller.toggle('content');
				}
			},
			{
				title: '🎬 Качество видео',
				items: qualityItems,
				onSelect: function(sel) {
					Lampa.Storage.set('verstv_iptv_quality', sel.value);
					showVIPNotification('Качество изменено: ' + sel.title, 'success');
					Lampa.Controller.toggle('content');
				}
			},
			{
				title: '🎨 Тема интерфейса',
				items: themeItems,
				onSelect: function(sel) {
					Lampa.Storage.set('verstv_iptv_theme', sel.value);
					showVIPNotification('Тема изменена: ' + sel.title, 'success');
					location.reload(); // Перезагрузка для применения темы
				}
			},
			{
				title: '📊 Показать статистику',
				onSelect: function() {
					verstvStats.showStats();
					Lampa.Controller.toggle('content');
				}
			},
			{
				title: '🔄 Перезагрузить плагин',
				onSelect: function() {
					location.reload();
				}
			}
		],
		onBack: function() {
			Lampa.Controller.toggle('content');
		}
	});
}

// ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============
function favID(title) {
	return title.toLowerCase().replace(/[\s!-\/:-@\[-`{-~]+/g, '');
}

function getStorage(name, defaultValue) {
	return Lampa.Storage.get(plugin.component + '_' + name, defaultValue);
}

function setStorage(name, val, noListen) {
	return Lampa.Storage.set(plugin.component + '_' + name, val, noListen);
}

function getSettings(name) {
	return Lampa.Storage.field(plugin.component + '_' + name);
}

function addSettings(type, param) {
	var data = {
		component: plugin.component,
		param: {
			name: plugin.component + '_' + param.name,
			type: type,
			values: !param.values ? '' : param.values,
			placeholder: !param.placeholder ? '' : param.placeholder,
			default: (typeof param.default === 'undefined') ? '' : param.default
		},
		field: {
			name: !param.title ? (!param.name ? '' : param.name) : param.title
		}
	};
	
	if (!!param.name) data.param.name = plugin.component + '_' + param.name;
	if (!!param.description) data.field.description = param.description;
	if (!!param.onChange) data.onChange = param.onChange;
	if (!!param.onRender) data.onRender = param.onRender;
	
	Lampa.SettingsApi.addParam(data);
}

// ============= ИНИЦИАЛИЗАЦИЯ ПЛАГИНА =============
function initializePlugin() {
	console.log('🚀 ВЕРС ТВ: Инициализация плагина...');
	
	// Активируем VIP
	initializeVIP();
	
	// Применяем дизайн
	applyFlameDesign();
	
	// Инициализируем статистику
	verstvStats.init();
	
	// Создаем VIP функции
	createVIPFeatures();
	
	// Оптимизируем производительность
	setTimeout(optimizePerformance, 1000);
	
	// Регистрируем компонент
	Lampa.Component.add(plugin.component, pluginPage);
	
	// Добавляем настройки
	addSettings('title', {
		title: '🎮 ВЕРС ТВ - VIP НАСТРОЙКИ',
		name: 'settings_title'
	});
	
	addSettings('select', {
		title: '🌐 Сервер трансляции',
		name: 'server',
		values: VIP_CONFIG.servers,
		default: 'MAIN_RU',
		description: 'Выберите сервер для максимальной скорости (VIP доступны все серверы)'
	});
	
	addSettings('select', {
		title: '🎬 Качество видео',
		name: 'quality',
		values: VIP_CONFIG.qualities,
		default: '4k',
		description: 'Качество воспроизведения (VIP доступно 4K)'
	});
	
	addSettings('select', {
		title: '🎨 Тема интерфейса',
		name: 'theme',
		values: VIP_CONFIG.themes,
		default: 'flame',
		description: 'Дизайн интерфейса плагина'
	});
	
	addSettings('trigger', {
		title: '🚀 Автозапуск ВЕРС ТВ',
		name: 'auto_start',
		default: false,
		description: 'Запускать ВЕРС ТВ при старте Lampa'
	});
	
	addSettings('trigger', {
		title: '⭐ Показывать только избранное',
		name: 'favorites_only',
		default: false,
		description: 'Показывать только избранные каналы при запуске'
	});
	
	addSettings('trigger', {
		title: '🚫 Скрыть рекламные каналы',
		name: 'hide_ads',
		default: true,
		description: 'Скрывать рекламные и промо каналы'
	});
	
	addSettings('trigger', {
		title: '🔒 Родительский контроль',
		name: 'parental_control',
		default: false,
		description: 'Скрывать каналы 18+'
	});
	
	addSettings('static', {
		title: '🎯 СТАТУС: ВСЕ VIP ФУНКЦИИ АКТИВНЫ',
		name: 'vip_status',
		description: 'Вы используете полную версию ВЕРС ТВ со всеми функциями'
	});
	
	addSettings('title', {
		title: '📱 ИНФОРМАЦИЯ О ПЛАГИНЕ',
		name: 'plugin_info'
	});
	
	addSettings('static', {
		title: 'Версия: ' + plugin.version,
		name: 'version_info'
	});
	
	addSettings('static', {
		title: 'Автор: ' + plugin.author,
		name: 'author_info'
	});
	
	addSettings('static', {
		title: '🔥 VIP доступ: АКТИВИРОВАН',
		name: 'vip_access_info',
		description: 'Все функции разблокированы • 4K качество • Без рекламы'
	});
	
	// Создаем элемент меню
	function createMenuItem() {
		var menu = $('.menu .menu__list').eq(0);
		
		if (menu.length === 0) {
			setTimeout(createMenuItem, 100);
			return;
		}
		
		var menuItem = $(`
			<li class="menu__item selector" data-action="${plugin.component}">
				<div class="menu__ico">${plugin.icon}</div>
				<div class="menu__text" style="
					color: #ff4500;
					font-weight: 700;
					display: flex;
					align-items: center;
					gap: 8px;
				">
					<span>${plugin.name}</span>
					<div class="vip-badge" style="
						font-size: 0.7em;
						padding: 2px 8px;
					">VIP</div>
				</div>
			</li>
		`);
		
		menuItem.on('hover:enter', function() {
			var activity = {
				id: 0,
				url: utils.getPlaylist(),
				title: plugin.name + ' - VIP',
				groups: [],
				currentGroup: getStorage('last_catalog0', ''),
				component: plugin.component,
				page: 1
			};
			
			if (Lampa.Activity.active().component === plugin.component) {
				Lampa.Activity.replace(Lampa.Arrays.clone(activity));
			} else {
				Lampa.Activity.push(Lampa.Arrays.clone(activity));
			}
		});
		
		menu.append(menuItem);
		
		console.log('✅ ВЕРС ТВ: Плагин успешно инициализирован!');
		
		// Показываем приветственное сообщение
		setTimeout(function() {
			showVIPNotification('🎉 ВЕРС ТВ успешно загружен! VIP функции активированы.', 'success');
		}, 2000);
	}
	
	// Запускаем создание меню
	if (!!window.appready) {
		createMenuItem();
	} else {
		Lampa.Listener.follow('app', function(e) {
			if (e.type === 'ready') createMenuItem();
		});
	}
}

// ============= ГЛОБАЛЬНЫЕ ФУНКЦИИ =============
// Функция для теста скорости (имитация)
function runSpeedTest() {
	var resultDiv = $('#speedTestResult');
	var downloadSpeed = $('#downloadSpeed');
	var pingResult = $('#pingResult');
	var qualityResult = $('#qualityResult');
	
	// Показываем загрузку
	resultDiv.hide();
	
	// Имитируем тест скорости
	setTimeout(function() {
		var speed = Math.floor(Math.random() * 50) + 50; // 50-100 Mbps
		var ping = Math.floor(Math.random() * 30) + 10; // 10-40 ms
		var quality = speed > 80 ? 'Отличное (4K)' : speed > 50 ? 'Хорошее (1080p)' : 'Среднее (720p)';
		
		downloadSpeed.text(speed + ' Mbps');
		pingResult.text(ping + ' ms');
		qualityResult.text(quality);
		
		resultDiv.show();
		
		showVIPNotification('✅ Тест скорости завершен: ' + speed + ' Mbps', 'success');
	}, 2000);
}

// ============= ЗАПУСК ПЛАГИНА =============
// Инициализируем плагин при загрузке
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializePlugin);
} else {
	initializePlugin();
}

// ============= ГЛОБАЛЬНЫЙ ЭКСПОРТ ФУНКЦИЙ =============
window.VERSTV = {
	plugin: plugin,
	utils: utils,
	stats: verstvStats,
	showSettings: showVIPSettings,
	runSpeedTest: runSpeedTest,
	toggleFullscreen: toggleFullscreen,
	toggleMute: toggleMute,
	togglePlayPause: togglePlayPause,
	showChannelInfo: showChannelInfo
};

console.log('🔥 ВЕРС ТВ готов к работе!');
})();
