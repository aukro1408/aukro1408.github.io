/*
// https://ss-iptv.com/ru/operators/catchup
// niklabs.com/catchup-settings/
// http://plwxk8hl.russtv.net/iptv/00000000000000/9201/index.m3u8?utc=1666796400&lutc=1666826200
*/
;(function () {
'use strict';
var plugin = {
    component: 'max_iptv',
    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"244\" height=\"260\" viewBox=\"0 0 244 260\" fill=\"currentColor\"><g transform=\"translate(0.000000,260.000000) scale(0.100000,-0.100000)\" fill=\"currentColor\" stroke=\"none\"><path d=\"M432 2570 c-162 -17 -301 -130 -347 -281 -39 -132 -39 -942 0 -1079 21 -72 72 -146 132 -191 93 -70 150 -89 302 -98 l103 -6 -82 -100 c-93 -114 -102 -128 -94 -149 8 -21 38 -28 104 -24 l54 3 111 132 110 132 401 0 400 1 75 -87 c40 -49 94 -109 118 -135 l44 -48 66 0 c67 0 91 10 91 38 0 7 -38 62 -85 122 -47 60 -85 111 -85 114 0 3 35 6 78 6 150 0 268 45 357 134 62 62 93 124 106 208 15 104 22 668 11 846 -10 151 -13 169 -42 230 -61 131 -187 216 -346 232 -105 11 -1476 11 -1582 0z m1370 -141 c230 -12 255 -16 322 -60 62 -41 94 -91 107 -165 27 -163 19 -829 -12 -946 -15 -59 -67 -120 -130 -151 -55 -28 -61 -28 -305 -37 -574 -21 -1321 -5 -1400 29 -49 22 -111 84 -131 130 -22 51 -33 227 -33 526 0 296 12 481 35 525 24 46 100 106 157 123 105 32 970 48 1390 26z\"/><path d=\"M569 2231 l-24 -19 -3 -476 c-3 -525 -3 -519 59 -551 78 -41 1179 -42 1256 -2 66 35 63 13 63 540 l0 478 -25 24 c-23 24 -30 25 -142 25 -99 0 -123 -3 -148 -19 -16 -10 -100 -93 -185 -184 -85 -91 -166 -169 -179 -173 -22 -6 -44 13 -210 185 l-186 191 -126 0 c-110 0 -130 -3 -150 -19z m323 -308 c62 -65 153 -159 202 -210 99 -103 126 -116 180 -86 18 10 118 107 222 216 194 202 220 221 244 178 14 -27 14 -615 0 -642 -10 -18 -27 -19 -505 -19 -435 0 -495 2 -509 16 -14 13 -16 56 -16 320 0 191 4 313 10 325 23 41 54 23 172 -98z m185 -679 c12 -19 11 -24 -6 -45 -16 -21 -22 -22 -45 -11 -17 8 -26 19 -26 35 0 48 50 62 77 21z m181 14 c39 -39 -17 -100 -58 -63 -24 22 -25 33 -3 57 19 21 44 23 61 6z m200 0 c39 -39 -17 -100 -58 -63 -25 22 -26 51 -2 64 23 14 45 14 60 -1z\"/><path d=\"M198 250 l-3 -230 50 0 50 0 -2 157 c-1 87 1 152 4 145 3 -8 29 -77 58 -155 l53 -142 43 0 44 0 63 160 63 160 -6 -162 -6 -163 50 0 51 0 0 230 0 231 -67 -3 -67 -3 -34 -90 c-19 -49 -45 -120 -60 -158 -14 -37 -28 -64 -31 -61 -3 3 -31 74 -61 157 l-55 152 -67 3 -67 3 -3 -231z\"/><path d=\"M1470 440 l0 -40 80 0 81 0 -3 -190 -3 -190 48 0 47 0 0 190 0 190 75 0 75 0 0 40 0 40 -200 0 -200 0 0 -40z\"/><path d=\"M1892 468 c3 -7 40 -111 83 -231 l78 -217 57 0 57 0 43 118 c105 294 120 335 120 338 0 2 -22 4 -49 4 l-50 0 -19 -52 c-11 -29 -37 -108 -58 -175 -22 -68 -41 -123 -44 -123 -3 0 -32 79 -63 175 l-58 175 -51 0 c-36 0 -49 -4 -46 -12z\"/><path d=\"M850 344 c-32 -14 -69 -49 -70 -66 0 -4 17 -12 37 -17 30 -9 40 -8 55 6 28 25 87 22 109 -6 34 -41 26 -48 -65 -53 -92 -5 -130 -21 -147 -65 -12 -32 3 -83 32 -108 30 -28 115 -31 162 -7 29 16 37 17 37 6 0 -10 13 -14 45 -14 l45 0 0 115 c0 144 -12 178 -72 205 -51 23 -120 25 -168 4z m143 -191 c11 -19 -16 -55 -50 -69 -43 -18 -83 -6 -83 25 0 27 19 39 70 44 25 2 48 4 52 5 4 1 9 -1 11 -5z\"/><path d=\"M1156 313 c15 -21 43 -58 61 -82 l33 -44 -27 -36 c-15 -20 -42 -56 -60 -80 -18 -24 -33 -47 -33 -50 0 -3 24 -5 53 -3 50 3 55 6 82 48 17 24 33 44 36 44 3 0 20 -20 38 -44 31 -42 37 -44 87 -48 30 -1 54 -1 54 1 0 2 -24 36 -53 75 -29 39 -56 76 -60 82 -3 6 21 46 53 90 l59 79 -50 3 c-43 3 -53 0 -68 -20 -10 -13 -27 -34 -38 -47 l-20 -24 -33 47 c-33 45 -34 46 -88 46 l-54 0 28 -37z\"/></g></svg>",
    name: 'MaxTV'
};

var lists = [];
var curListId = -1;
var defaultGroup = 'Other';
var catalog = {};
var listCfg = {};
var EPG = {};
var epgInterval;
var UID = '';

var chNumber = '';
var chTimeout = null;
var stopRemoveChElement = false;
var chPanel = $((
    "<div class=\"player-info info--visible js-ch-PLUGIN\" style=\"top: 9em;right: auto;z-index: 1000;\">\n" +
    "	<div class=\"player-info__body\">\n" +
    "		<div class=\"player-info__line\">\n" +
    "			<div class=\"player-info__name\">&nbsp;</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>").replace(/PLUGIN/g, plugin.component)
).hide().fadeOut(0);
var chHelper = $((
    "<div class=\"player-info info--visible js-ch-PLUGIN\" style=\"top: 14em;right: auto;z-index: 1000;\">\n" +
    "	<div class=\"player-info__body\">\n" +
    "		<div class=\"tv-helper\"></div>\n" +
    "	</div>\n" +
    "</div>").replace(/PLUGIN/g, plugin.component)
).hide().fadeOut(0);
var epgTemplate = $(('<div id="PLUGIN_epg">\n' +
    '<h2 class="js-epgChannel"></h2>\n' +
    '<div class="PLUGIN-details__program-body js-epgNow">\n' +
    '   <div class="PLUGIN-details__program-title">Сейчас</div>\n' +
    '   <div class="PLUGIN-details__program-list">' +
    '<div class="PLUGIN-program selector">\n' +
    '   <div class="PLUGIN-program__time js-epgTime">XX:XX</div>\n' +
    '   <div class="PLUGIN-program__body">\n' +
    '	   <div class="PLUGIN-program__title js-epgTitle"> </div>\n' +
    '	   <div class="PLUGIN-program__progressbar"><div class="PLUGIN-program__progress js-epgProgress" style="width: 50%"></div></div>\n' +
    '   </div>\n' +
    '</div>' +
    '   </div>\n' +
    '   <div class="PLUGIN-program__desc js-epgDesc"></div>'+
    '</div>' +
    '<div class="PLUGIN-details__program-body js-epgAfter">\n' +
    '   <div class="PLUGIN-details__program-title">Потом</div>\n' +
    '   <div class="PLUGIN-details__program-list js-epgList">' +
    '   </div>\n' +
    '</div>' +
    '</div>').replace(/PLUGIN/g, plugin.component)
);
var epgItemTeplate = $((
    '<div class="PLUGIN-program selector">\n' +
    '   <div class="PLUGIN-program__time js-epgTime">XX:XX</div>\n' +
    '   <div class="PLUGIN-program__body">\n' +
    '	   <div class="PLUGIN-program__title js-epgTitle"> </div>\n' +
    '   </div>\n' +
    '</div>').replace(/PLUGIN/g, plugin.component)
);
var chHelpEl = chHelper.find('.tv-helper');
var chNumEl = chPanel.find('.player-info__name');
var encoder = $('<div/>');

function isPluginPlaylist(playlist) {
    return !(!playlist.length || !playlist[0].tv
	|| !playlist[0].plugin || playlist[0].plugin !== plugin.component);
}
Lampa.PlayerPlaylist.listener.follow('select', function(e) {
    if (e.item.plugin && e.item.plugin === plugin.component && Lampa.Player.runas)
	    Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
});
function channelSwitch(dig, isChNum) {
    if (!Lampa.Player.opened()) return false;
    var playlist = Lampa.PlayerPlaylist.get();
    if (!isPluginPlaylist(playlist)) return false;
    if (!$('body>.js-ch-' + plugin.component).length) $('body').append(chPanel).append(chHelper);
    var cnt = playlist.length;
    var prevChNumber = chNumber;
    chNumber += dig;
    var number = parseInt(chNumber);
    if (number && number <= cnt) {
	if (!!chTimeout) clearTimeout(chTimeout);
	stopRemoveChElement = true; // fix removing element in callback on animate.finish()
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
		Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
	    }
	    chPanel.delay(1000).fadeOut(500,function(){stopRemoveChElement || chPanel.remove()});
	    chHelper.delay(1000).fadeOut(500,function(){stopRemoveChElement || chHelper.remove()});
	    chNumber = "";
	}
	if (isChNum === true) {
	    chTimeout = setTimeout(chSwitch, 1000);
	    chNumber = "";
	} else if (parseInt(chNumber + '0') > cnt) {
	    // Ещё одна цифра невозможна - переключаем
	    chSwitch();
	} else {
	    // Ждём следующую цифру или переключаем
	    chTimeout = setTimeout(chSwitch, 3000);
	}
    } else {
	chNumber = prevChNumber;
    }
    return true;
}

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

var timeOffset = 0;
var timeOffsetSet = false;

function unixtime() {
    return Math.floor((new Date().getTime() + timeOffset)/1000);
}

function toLocaleTimeString(time) {
    var date = new Date(),
	ofst = parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n',''));
    time = time || date.getTime();

    date = new Date(time + (ofst * 1000 * 60 * 60));
    return ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2);
}

function toLocaleDateString(time) {
    var date = new Date(),
	ofst = parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n',''));
    time = time || date.getTime();

    date = new Date(time + (ofst * 1000 * 60 * 60));
    return date.toLocaleDateString();
}

var utils = {
    uid: function() {return UID},
    timestamp: unixtime,
    token: function() {return generateSigForString(Lampa.Storage.field('account_email').toLowerCase())},
    hash: Lampa.Utils.hash,
    hash36: function(s) {return (this.hash(s) * 1).toString(36)}
};

function generateSigForString(string) {
    var sigTime = unixtime();
    return sigTime.toString(36) + ':' + utils.hash36((string || '') + sigTime + utils.uid());
}

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
    var r = {yyyy:d.getUTCFullYear(),MM:('0'+(d.getUTCMonth()+1)).substr(-2),dd:('0'+d.getUTCDate()).substr(-2),HH:('0'+d.getUTCHours()).substr(-2),mm:('0'+d.getUTCMinutes()).substr(-2),ss:('0'+d.getUTCSeconds()).substr(-2),UTF:t*6e4};
    return strReplace(format, r);
}

function prepareUrl(url, epg) {
    var m = [], val = '', r = {start:unixtime,offset:0};
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

function catchupUrl(url, type, source) {
    type = (type || '').toLowerCase();
    source = source || '';
    if (!type) {
	if (!!source) {
	    if (source.search(/^https?:\/\//i) === 0) type = 'default';
	    else if (source.search(/^[?&/][^/]/) === 0) type = 'append';
	    else type = 'default';
	}
	else if (url.indexOf('${') < 0) type = 'shift';
	else type = 'default';
	console.log(plugin.name, 'Autodetect catchup-type "' + type + '"');
    }
    var newUrl = '';
    switch (type) {
	case 'append':
	    if (source) {
		newUrl = (source.search(/^https?:\/\//i) === 0 ? '' : url) + source;
		break; // так и задумано
	    }
	case 'timeshift': // @deprecated
	case 'shift': // + append
	    newUrl = (source || url);
	    newUrl += (newUrl.indexOf('?') >= 0 ? '&' : '?') + 'utc=${start}&lutc=${timestamp}';
	    return newUrl;
	case 'flussonic':
	case 'flussonic-hls':
	case 'flussonic-ts':
	case 'fs':
	    // Example stream and catchup URLs
	    // stream:  http://ch01.spr24.net/151/mpegts?token=my_token
	    // catchup: http://ch01.spr24.net/151/timeshift_abs-{utc}.ts?token=my_token
	    // stream:  http://list.tv:8888/325/index.m3u8?token=secret
	    // catchup: http://list.tv:8888/325/timeshift_rel-{offset:1}.m3u8?token=secret
	    // stream:  http://list.tv:8888/325/mono.m3u8?token=secret
	    // catchup: http://list.tv:8888/325/mono-timeshift_rel-{offset:1}.m3u8?token=secret
	    // stream:  http://list.tv:8888/325/live?token=my_token
	    // catchup: http://list.tv:8888/325/{utc}.ts?token=my_token
	    return url
		.replace(/\/(video|mono)\.(m3u8|ts)/, '/$1-\${start}-\${duration}.$2')
		.replace(/\/(index|playlist)\.(m3u8|ts)/, '/archive-\${start}-\${duration}.$2')
		.replace(/\/mpegts/, '/timeshift_abs-\${start}.ts')
	    ;
	case 'xc':
	    // Example stream and catchup URLs
	    // stream:  http://list.tv:8080/my@account.xc/my_password/1477
	    // catchup: http://list.tv:8080/timeshift/my@account.xc/my_password/{duration}/{Y}-{m}-{d}:{H}-{M}/1477.ts
	    // stream:  http://list.tv:8080/live/my@account.xc/my_password/1477.m3u8
	    // catchup: http://list.tv:8080/timeshift/my@account.xc/my_password/{duration}/{Y}-{m}-{d}:{H}-{M}/1477.m3u8
	    newUrl = url
		.replace(
		    /^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)\.m3u8?$/,
		    '$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.m3u8'
		)
		.replace(
		    /^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)(\.ts|)$/,
		    '$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.ts'
		)
	    ;
	    break;
	case 'default':
	    newUrl = source || url;
	    break;
	case 'disabled':
	    return false;
	default:
	    console.log(plugin.name, 'Err: no support catchup-type="' + type + '"');
	    return false;
    }
    if (newUrl.indexOf('${') < 0) return catchupUrl(newUrl,'shift');
    return newUrl;
}

/* ***********************************
 * Управление плеером клавишами пульта
 * ***********************************
 * Поддержка переключения каналов (возможно не все устройства):
 * - цифровыми клавишами (по номеру канала)
 * - клавишами влево-вправо
 * - клавиши Pg+ и Pg-
 */
function keydown(e) {
    var code = e.code;
    if (Lampa.Player.opened() && !$('body.selectbox--open').length) {
	var playlist = Lampa.PlayerPlaylist.get();
	if (!isPluginPlaylist(playlist)) return;
	var isStopEvent = false;
	var curCh = cache('curCh') || (Lampa.PlayerPlaylist.position() + 1);
	if (code === 428 || code === 34 // Pg-
	    //4 - Samsung orsay
	    || ((code === 37 || code === 4) && !$('.player.tv .panel--visible .focus').length) // left
	) {
	    curCh = curCh === 1 ? playlist.length : curCh - 1; // зацикливаем
	    cache('curCh', curCh, 1000);
	    isStopEvent = channelSwitch(curCh, true);
	} else if (code === 427 || code === 33 // Pg+
	    // 5 - Samsung orsay right
	    || ((code === 39 || code === 5) && !$('.player.tv .panel--visible .focus').length) // right
	) {
	    curCh = curCh === playlist.length ? 1 : curCh + 1; // зацикливаем
	    cache('curCh', curCh, 1000);
	    isStopEvent = channelSwitch(curCh, true);
	} else if (code >= 48 && code <= 57) { // numpad
	    isStopEvent = channelSwitch(code - 48);
	} else if (code >= 96 && code <= 105) { // numpad
	    isStopEvent = channelSwitch(code - 96);
	}
	if (isStopEvent) {
	    e.event.preventDefault();
	    e.event.stopPropagation();
	}
    }
}

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
		    while (queue.length && ++i <= bulkCnt) func.apply(context, queue.shift());
		    i = queue.length ? i : i-1;
		    cnt += i;
		    queueStepCallback.apply(context, [i, cnt, queue.length])
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

function getEpgSessCache(epgId, t) {
    var key = ['epg', epgId].join('\t');
    var epg = sessionStorage.getItem(key);
    if (epg) {
	epg = JSON.parse(epg);
	if (t) {
	    if (epg.length
		&& (
		    t < epg[0][0]
		    || t > (epg[epg.length - 1][0] + epg[epg.length - 1][1])
		)
	    ) return false;
	    while (epg.length && t >= (epg[0][0] + epg[0][1])) epg.shift();
	}
    }
    return epg;
}
function setEpgSessCache(epgId, epg) {
    var key = ['epg', epgId].join('\t');
    sessionStorage.setItem(key, JSON.stringify(epg));
}
function networkSilentSessCache(url, success, fail, param) {
    var context = this;
    var key = ['cache', url, param ? utils.hash36(JSON.stringify(param)) : ''].join('\t');
    var data = sessionStorage.getItem(key);
    if (data) {
	data = JSON.parse(data);
	if (data[0]) typeof success === 'function' && success.apply(context, [data[1]]);
	else typeof fail === 'function' && fail.apply(context, [data[1]]);
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

//Стиль
Lampa.Template.add(plugin.component + '_style', '<style>#PLUGIN_epg{margin-right:1em}.PLUGIN-program__desc{font-size:0.9em;margin:0.5em;text-align:justify;max-height:15em;overflow:hidden;}.PLUGIN.category-full{padding-bottom:10em}.PLUGIN div.card__view{position:relative;background-color:#353535;background-color:#353535a6;border-radius:1em;cursor:pointer;padding-bottom:60%}.PLUGIN.square_icons div.card__view{padding-bottom:100%}.PLUGIN img.card__img,.PLUGIN div.card__img{background-color:unset;border-radius:unset;max-height:100%;max-width:100%;height:auto;width:auto;position:absolute;top:50%;left:50%;-moz-transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);font-size:2em}.PLUGIN.contain_icons img.card__img{height:95%;width:95%;object-fit:contain}.PLUGIN .card__title{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.PLUGIN .card__age{padding:0;border:1px #3e3e3e solid;margin-top:0.3em;border-radius:0.3em;position:relative;display: none}.PLUGIN .card__age .card__epg-progress{position:absolute;background-color:#3a3a3a;top:0;left:0;width:0%;max-width:100%;height:100%}.PLUGIN .card__age .card__epg-title{position:relative;padding:0.4em 0.2em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;}.PLUGIN.category-full .card__icons {top:0.3em;right:0.3em;justify-content:right;}#PLUGIN{float:right;padding: 1.2em 0;width: 30%;}.PLUGIN-details__group{font-size:1.3em;margin-bottom:.9em;opacity:.5}.PLUGIN-details__title{font-size:4em;font-weight:700}.PLUGIN-details__program{padding-top:4em}.PLUGIN-details__program-title{font-size:1.2em;padding-left:4.9em;margin-top:1em;margin-bottom:1em;opacity:.5}.PLUGIN-details__program-list>div+div{margin-top:1em}.PLUGIN-details__program>div+div{margin-top:2em}.PLUGIN-program{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;font-size:1.2em;font-weight:300}.PLUGIN-program__time{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;width:5em;position:relative}.PLUGIN-program.focus .PLUGIN-program__time::after{content:\'\';position:absolute;top:.5em;right:.9em;width:.4em;background-color:#fff;height:.4em;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;margin-top:-0.1em;font-size:1.2em}.PLUGIN-program__progressbar{width:10em;height:0.3em;border:0.05em solid #fff;border-radius:0.05em;margin:0.5em 0.5em 0 0}.PLUGIN-program__progress{height:0.25em;border:0.05em solid #fff;background-color:#fff;max-width: 100%}.PLUGIN .card__icon.icon--timeshift{background-image:url(https://epg.rootu.top/img/icon/timeshift.svg);}.PLUGIN.list_view.category-full{display:block!important;padding-bottom:2em}.PLUGIN.list_view .card--collection{display:block!important;position:relative!important;float:none!important;width:100%!important;height:5.8em!important;margin:0 0 .55em 0!important;padding:.6em 1.1em!important;border:0!important;border-radius:1em!important;background:#303133!important;overflow:hidden;box-sizing:border-box}.PLUGIN.list_view .card__view{float:left;width:4.6em;height:4.6em;padding-bottom:0!important;margin-right:1.2em;border-radius:.6em}.PLUGIN.list_view .card__img{font-size:1.3em}.PLUGIN.list_view .card__title{display:block;width:47%;padding-top:.45em;font-size:1.18em;font-weight:600;white-space:nowrap;overflow:hidden;text
