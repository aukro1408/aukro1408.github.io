/*
 * MaxTV IPTV
 */
;(function () {
'use strict';

var plugin = {
    component: 'max_iptv',
    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"244\" height=\"260\" viewBox=\"0 0 244 260\" fill=\"currentColor\"><g transform=\"translate(0.000000,260.000000) scale(0.100000,-0.100000)\" fill=\"currentColor\" stroke=\"none\"><path d=\"M432 2570 c-162 -17 -301 -130 -347 -281 -39 -132 -39 -942 0 -1079 21 -72 72 -146 132 -191 93 -70 150 -89 302 -98 l103 -6 -82 -100 c-93 -114 -102 -128 -94 -149 8 -21 38 -28 104 -24 l54 3 111 132 110 132 401 0 400 1 75 -87 c40 -49 94 -109 118 -135 l44 -48 66 0 c67 0 91 10 91 38 0 7 -38 62 -85 122 -47 60 -85 111 -85 114 0 3 35 6 78 6 150 0 268 45 357 134 62 62 93 124 106 208 15 104 22 668 11 846 -10 151 -13 169 -42 230 -61 131 -187 216 -346 232 -105 11 -1476 11 -1582 0z m1370 -141 c230 -12 255 -16 322 -60 62 -41 94 -91 107 -165 27 -163 19 -829 -12 -946 -15 -59 -67 -120 -130 -151 -55 -28 -61 -28 -305 -37 -574 -21 -1321 -5 -1400 29 -49 22 -111 84 -131 130 -22 51 -33 227 -33 526 0 296 12 481 35 525 24 46 100 106 157 123 105 32 970 48 1390 26z m-1233 -198 c-32 -14 -69 -49 -70 -66 0 -4 17 -12 37 -17 30 -9 40 -8 55 6 28 25 87 22 109 -6 34 -41 26 -48 -65 -53 -92 -5 -130 -21 -147 -65 -12 -32 3 -83 32 -108 30 -28 115 -31 162 -7 29 16 37 17 37 6 0 -10 13 -14 45 -14 l45 0 0 115 c0 144 -12 178 -72 205 -51 23 -120 25 -168 4z\"/></g></svg>",
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
    "<div class=\"player-info info--visible js-ch-PLUGIN\" style=\"top: 9em;right:auto;z-index:1000;\">" +
    "<div class=\"player-info__body\">" +
    "<div class=\"player-info__line\">" +
    "<div class=\"player-info__name\">&nbsp;</div>" +
    "</div></div></div>"
).replace(/PLUGIN/g, plugin.component)).hide().fadeOut(0);

var chHelper = $((
    "<div class=\"player-info info--visible js-ch-PLUGIN\" style=\"top:14em;right:auto;z-index:1000;\">" +
    "<div class=\"player-info__body\">" +
    "<div class=\"tv-helper\"></div>" +
    "</div></div>"
).replace(/PLUGIN/g, plugin.component)).hide().fadeOut(0);

var epgTemplate = $((
    '<div id="PLUGIN_epg">' +
    '<h2 class="js-epgChannel"></h2>' +
    '<div class="PLUGIN-details__program-body js-epgNow">' +
    '<div class="PLUGIN-details__program-title">Сейчас</div>' +
    '<div class="PLUGIN-details__program-list">' +
    '<div class="PLUGIN-program selector">' +
    '<div class="PLUGIN-program__time js-epgTime">XX:XX</div>' +
    '<div class="PLUGIN-program__body">' +
    '<div class="PLUGIN-program__title js-epgTitle"></div>' +
    '<div class="PLUGIN-program__progressbar">' +
    '<div class="PLUGIN-program__progress js-epgProgress" style="width:50%"></div>' +
    '</div></div></div></div>' +
    '<div class="PLUGIN-program__desc js-epgDesc"></div>' +
    '</div>' +
    '<div class="PLUGIN-details__program-body js-epgAfter">' +
    '<div class="PLUGIN-details__program-title">Потом</div>' +
    '<div class="PLUGIN-details__program-list js-epgList"></div>' +
    '</div></div>'
).replace(/PLUGIN/g, plugin.component));

var epgItemTeplate = $(
    '<div class="PLUGIN-program selector">' +
    '<div class="PLUGIN-program__time js-epgTime">XX:XX</div>' +
    '<div class="PLUGIN-program__body">' +
    '<div class="PLUGIN-program__title js-epgTitle"></div>' +
    '</div></div>'
.replace(/PLUGIN/g, plugin.component));

var chHelpEl = chHelper.find('.tv-helper');
var chNumEl = chPanel.find('.player-info__name');
var encoder = $('<div/>');

function isPluginPlaylist(playlist) {
    return !(
        !playlist.length ||
        !playlist[0].tv ||
        !playlist[0].plugin ||
        playlist[0].plugin !== plugin.component
    );
}

Lampa.PlayerPlaylist.listener.follow('select', function(e) {
    if (
        e.item.plugin &&
        e.item.plugin === plugin.component &&
        Lampa.Player.runas
    ) {
        Lampa.Player.runas(
            Lampa.Storage.field('player_iptv')
        );
    }
});

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

        chNumEl.text(
            playlist[number - 1].title
        );

        if (
            isChNum ||
            parseInt(chNumber + '0') > cnt
        ) {
            chHelper.finish().hide().fadeOut(0);
        } else {

            var help = [];
            var chHelpMax = 9;
            var start = parseInt(chNumber + '0');

            for (
                var i = start;
                i <= cnt &&
                i <= (start + Math.min(chHelpMax, 9));
                i++
            ) {
                help.push(
                    encoder.text(
                        playlist[i - 1].title
                    ).html()
                );
            }

            chHelpEl.html(
                help.join('<br>')
            );

            chHelper
                .finish()
                .show()
                .fadeIn(0);
        }

        if (number < 10 || isChNum) {
            chPanel
                .finish()
                .show()
                .fadeIn(0);
        }

        stopRemoveChElement = false;

        var chSwitch = function() {

            var pos = number - 1;

            if (Lampa.PlayerPlaylist.position() !== pos) {

                Lampa.PlayerPlaylist.listener.send(
                    'select',
                    {
                        playlist: playlist,
                        position: pos,
                        item: playlist[pos]
                    }
                );

                Lampa.Player.runas &&
                Lampa.Player.runas(
                    Lampa.Storage.field('player_iptv')
                );
            }

            chPanel
                .delay(1000)
                .fadeOut(
                    500,
                    function() {
                        stopRemoveChElement ||
                        chPanel.remove();
                    }
                );

            chHelper
                .delay(1000)
                .fadeOut(
                    500,
                    function() {
                        stopRemoveChElement ||
                        chHelper.remove();
                    }
                );

            chNumber = "";
        };

        if (isChNum === true) {

            chTimeout = setTimeout(
                chSwitch,
                1000
            );

            chNumber = "";

        } else if (
            parseInt(chNumber + '0') > cnt
        ) {

            chSwitch();

        } else {

            chTimeout = setTimeout(
                chSwitch,
                3000
            );
        }

    } else {
        chNumber = prevChNumber;
    }

    return true;
}

var cacheVal = {};

function cache(name, value, timeout) {

    var time = new Date() * 1;

    if (!!timeout && timeout > 0) {
        cacheVal[name] = [
            time + timeout,
            value
        ];
        return;
    }

    if (
        !!cacheVal[name] &&
        cacheVal[name][0] > time
    ) {
        return cacheVal[name][1];
    }

    delete cacheVal[name];

    return value;
}

var timeOffset = 0;
var timeOffsetSet = false;

function unixtime() {
    return Math.floor(
        (
            new Date().getTime() +
            timeOffset
        ) / 1000
    );
}

function toLocaleTimeString(time) {

    var date = new Date();

    var ofst = parseInt(
        Lampa.Storage
            .get('time_offset', 'n0')
            .replace('n','')
    );

    time = time || date.getTime();

    date = new Date(
        time +
        (ofst * 1000 * 60 * 60)
    );

    return (
        '0' + date.getHours()
    ).substr(-2) + ':' + (
        '0' + date.getMinutes()
    ).substr(-2);
}

function toLocaleDateString(time) {

    var date = new Date();

    var ofst = parseInt(
        Lampa.Storage
            .get('time_offset', 'n0')
            .replace('n','')
    );

    time = time || date.getTime();

    date = new Date(
        time +
        (ofst * 1000 * 60 * 60)
    );

    return date.toLocaleDateString();
}

var utils = {
    uid: function() {
        return UID;
    },

    timestamp: unixtime,

    token: function() {
        return generateSigForString(
            Lampa.Storage
                .field('account_email')
                .toLowerCase()
        );
    },

    hash: Lampa.Utils.hash,

    hash36: function(s) {
        return (
            this.hash(s) * 1
        ).toString(36);
    }
};

function generateSigForString(string) {

    var sigTime = unixtime();

    return (
        sigTime.toString(36) +
        ':' +
        utils.hash36(
            (string || '') +
            sigTime +
            utils.uid()
        )
    );
}

function strReplace(str, key2val) {

    for (var key in key2val) {

        str = str.replace(
            new RegExp(
                key.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                ),
                'g'
            ),
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

    if (!u) {
        thisOffset +=
            parseInt(
                Lampa.Storage
                    .get('time_offset', 'n0')
                    .replace('n','')
            ) * 60 -
            new Date().getTimezoneOffset();
    }

    var d = new Date(
        (t + thisOffset) * 6e4
    );

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

    var m = [];
    var val = '';

    var r = {
        start: unixtime,
        offset: 0
    };

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

            d: function(m) {
                return strReplace(
                    m[6] || '',
                    {
                        M: epg[1],
                        S: epg[1] * 60,
                        h: Math.floor(epg[1] / 60),
                        m: ('0' + (
                            epg[1] % 60
                        )).substr(-2),
                        s: '00'
                    }
                );
            },

            b: function(m) {
                return tf(
                    epg[0],
                    m[6],
                    m[4],
                    m[5]
                );
            },

            e: function(m) {
                return tf(
                    epg[0] + epg[1],
                    m[6],
                    m[4],
                    m[5]
                );
            },

            n: function(m) {
                return tf(
                    unixtime() / 60,
                    m[6],
                    m[4],
                    m[5]
                );
            }
        };
    }

    while (
        !!(
            m = url.match(
                /\${(\((([a-zA-Z\d]+?)(u)?)([+-]\d+)?\))?([^${}]+)}/
            )
        )
    ) {

        if (
            !!m[2] &&
            typeof r[m[2]] === 'function'
        ) {
            val = r[m[2]](m);

        } else if (
            !!m[3] &&
            typeof r[m[3]] === 'function'
        ) {
            val = r[m[3]](m);

        } else if (m[6] in r) {

            val =
                typeof r[m[6]] === 'function'
                    ? r[m[6]]()
                    : r[m[6]];

        } else if (
            !!m[2] &&
            typeof utils[m[2]] === 'function'
        ) {
            val = utils[m[2]](m[6]);

        } else if (
            m[6] in utils
        ) {
            val =
                typeof utils[m[6]] === 'function'
                    ? utils[m[6]]()
                    : utils[m[6]];

        } else {
            val = m[1];
        }

        url = url.replace(
            m[0],
            encodeURIComponent(val)
        );
    }

    return url;
}

function catchupUrl(url, type, source) {

    type = (type || '').toLowerCase();
    source = source || '';

    if (!type) {

        if (!!source) {

            if (
                source.search(/^https?:\/\//i) === 0
            ) {
                type = 'default';

            } else if (
                source.search(/^[?&/][^/]/) === 0
            ) {
                type = 'append';

            } else {
                type = 'default';
            }

        } else if (
            url.indexOf('${') < 0
        ) {
            type = 'shift';

        } else {
            type = 'default';
        }

        console.log(
            plugin.name,
            'Autodetect catchup-type "' +
            type +
            '"'
        );
    }

    var newUrl = '';

    switch (type) {

        case 'append':

            if (source) {
                newUrl =
                    (
                        source.search(/^https?:\/\//i) === 0
                            ? ''
                            : url
                    ) + source;

                break;
            }

        case 'timeshift':
        case 'shift':

            newUrl = source || url;

            newUrl +=
                (newUrl.indexOf('?') >= 0 ? '&' : '?') +
                'utc=${start}&lutc=${timestamp}';

            return newUrl;

        case 'flussonic':
        case 'flussonic-hls':
        case 'flussonic-ts':
        case 'fs':

            return url
                .replace(
                    /\/(video|mono)\.(m3u8|ts)/,
                    '/$1-${start}-${duration}.$2'
                )
                .replace(
                    /\/(index|playlist)\.(m3u8|ts)/,
                    '/archive-${start}-${duration}.$2'
                )
                .replace(
                    /\/mpegts/,
                    '/timeshift_abs-${start}.ts'
                );

        case 'xc':

            newUrl = url
                .replace(
                    /^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)\.m3u8?$/,
                    '$1/timeshift$3${(d)M}/${(b)yyyy-MM-dd:HH-mm}/$4.m3u8'
                )
                .replace(
                    /^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)(\.ts|)$/,
                    '$1/timeshift$3${(d)M}/${(b)yyyy-MM-dd:HH-mm}/$4.ts'
                );

            break;

        case 'default':
            newUrl = source || url;
            break;

        case 'disabled':
            return false;

        default:

            console.log(
                plugin.name,
                'Err: no support catchup-type="' +
                type +
                '"'
            );

            return false;
    }

    if (newUrl.indexOf('${') < 0) {
        return catchupUrl(
            newUrl,
            'shift'
        );
    }

    return newUrl;
}function epgUpdateData(epgId) {

    var lt = Math.floor(unixtime() / 60);
    var t = Math.floor(lt / 60);
    var ed, ede;

    if (
        !!EPG[epgId] &&
        t >= EPG[epgId][0] &&
        t <= EPG[epgId][1]
    ) {

        ed = EPG[epgId][2];

        if (
            !ed ||
            !ed.length ||
            ed.length >= 3
        ) {
            return;
        }

        ede = ed[ed.length - 1];

        if (
            ede[0] +
            ede[1] <
            lt
        ) {
            delete EPG[epgId];

            epgUpdateData(epgId);
        }
    }
}

function epgRender(epgId) {

    var epgEl = $('#' + plugin.component + '_epg');

    if (!epgEl.length) {
        return;
    }

    var epgNow = epgEl.find('.js-epgNow');
    var epgAfter = epgEl.find('.js-epgAfter');

    var epg = [];

    if (
        !!EPG[epgId] &&
        !!EPG[epgId][2]
    ) {
        epg = EPG[epgId][2];
    }

    var lt = Math.floor(
        unixtime() / 60
    );

    var i = 0;

    while (
        i < epg.length &&
        epg[i][0] +
        epg[i][1] <= lt
    ) {
        i++;
    }

    var e = epg[i];

    if (e) {

        var p =
            Math.max(
                0,
                Math.min(
                    100,
                    (
                        (
                            lt - e[0]
                        ) /
                        e[1]
                    ) * 100
                )
            );

        var slt =
            toLocaleTimeString(
                e[0] * 60000
            );

        var elt =
            toLocaleTimeString(
                (
                    e[0] +
                    e[1]
                ) * 60000
            );

        epgNow
            .data('progress', p);

        epgNow
            .find('.js-epgProgress')
            .css(
                'width',
                p + '%'
            );

        epgNow
            .find('.js-epgTime')
            .text(
                slt
            );

        epgNow
            .find('.js-epgTitle')
            .text(
                e[2]
            );

        var desc =
            e[3]
                ? '<p>' +
                    encoder
                        .text(e[3])
                        .html() +
                    '</p>'
                : '';

        epgNow
            .find('.js-epgDesc')
            .html(
                desc.replace(
                    /\n/g,
                    '</p><p>'
                )
            );

        epgNow.show();

        if (
            epg.length >
            i + 1
        ) {

            var list =
                epgAfter
                    .find('.js-epgList');

            list.empty();

            var iEnd =
                Math.min(
                    epg.length,
                    i + 8
                );

            for (
                var j = i + 1;
                j < iEnd;
                j++
            ) {

                var item =
                    epgItemTeplate
                        .clone();

                item
                    .find('.js-epgTime')
                    .text(
                        toLocaleTimeString(
                            epg[j][0] *
                            60000
                        )
                    );

                item
                    .find('.js-epgTitle')
                    .text(
                        epg[j][2]
                    );

                list.append(
                    item
                );
            }

            epgAfter.show();

        } else {

            epgAfter.hide();
        }

    } else {

        epgNow
            .find('.js-epgProgress')
            .css(
                'width',
                '0%'
            );

        epgNow
            .find('.js-epgTitle')
            .text(
                'Программа отсутствует'
            );

        epgNow
            .find('.js-epgTime')
            .text(
                '--:--'
            );

        epgNow.show();
        epgAfter.hide();
    }

    if (
        epg.length < 3
    ) {
        epgUpdateData(
            epgId
        );
    }
}

Lampa.Template.add(
    plugin.component + '_info_radio',
    '<div class="info layer--width">' +
    '<div class="info__left">' +
    '<div class="info__title"></div>' +
    '<div class="info__title-original"></div>' +
    '<div class="info__create"></div>' +
    '</div>' +
    '<div class="info__right" ' +
    'style="display:flex!important;">' +
    '<div id="stantion_filtr"></div>' +
    '</div></div>'
);

function langAdd(
    name,
    values
) {
    var data = {};

    data[name] = values;

    Lampa.Lang.add(
        data
    );
}

function langGet(
    name
) {
    return Lampa.Lang.translate(
        name
    );
}

langAdd(
    'favorites',
    {
        ru: 'Избранное',
        uk: 'Обране',
        be: 'Абранае',
        en: 'Favorites',
        zh: '收藏'
    }
);

langAdd(
    'categories',
    {
        ru: 'Категории',
        uk: 'Категорії',
        be: 'Катэгорыі',
        en: 'Categories',
        zh: '分類'
    }
);

langAdd(
    'default_playlist_cat',
    {
        ru: 'Все',
        uk: 'Усі',
        be: 'Усе',
        en: 'All',
        zh: '全部'
    }
);

langAdd(
    'settings_playlist_num_group',
    {
        ru: 'Плейлист ',
        uk: 'Плейлист ',
        be: 'Плэйліст ',
        en: 'Playlist ',
        zh: '播放列表 '
    }
);

langAdd(
    'settings_list_name',
    {
        ru: 'Название плейлиста',
        uk: 'Назва плейлиста',
        be: 'Назва плэйліста',
        en: 'Playlist name',
        zh: '播放列表名称'
    }
);

langAdd(
    'settings_list_url',
    {
        ru: 'URL плейлиста',
        uk: 'URL плейлиста',
        be: 'URL плэйліста',
        en: 'Playlist URL',
        zh: '播放列表 URL'
    }
);

langAdd(
    'settings_list_name_desc',
    {
        ru: 'Название отображаемое в меню',
        uk: 'Назва, що відображається в меню',
        be: 'Назва, якая адлюстроўваецца ў меню',
        en: 'Name displayed in menu',
        zh: '菜单中显示的名称'
    }
);

langAdd(
    'settings_list_url_desc0',
    {
        ru: 'Ссылка на M3U/M3U8 плейлист',
        uk: 'Посилання на M3U/M3U8 плейлист',
        be: 'Спасылка на M3U/M3U8 плэйліст',
        en: 'M3U/M3U8 playlist URL',
        zh: 'M3U/M3U8 播放列表 URL'
    }
);

langAdd(
    'epg_on',
    {
        ru: 'Включить телепрограмму',
        uk: 'Увімкнути телепрограму',
        be: 'Уключыць тэлепраграму',
        en: 'TV Guide: On',
        zh: '電視指南：開'
    }
);

langAdd(
    'epg_off',
    {
        ru: 'Отключить телепрограмму',
        uk: 'Вимкнути телепрограму',
        be: 'Адключыць тэлепраграму',
        en: 'TV Guide: Off',
        zh: '電視指南：關閉'
    }
);

langAdd(
    'epg_title',
    {
        ru: 'Телепрограмма',
        uk: 'Телепрограма',
        be: 'Тэлепраграма',
        en: 'TV Guide',
        zh: '電視指南'
    }
);

langAdd(
    'square_icons',
    {
        ru: 'Квадратные лого каналов',
        uk: 'Квадратні лого каналів',
        be: 'Квадратныя лога каналаў',
        en: 'Square channel logos',
        zh: '方形通道標誌'
    }
);

langAdd(
    'contain_icons',
    {
        ru: 'Коррекция размера логотипа телеканала',
        uk: 'Виправлення розміру логотипу телеканалу',
        be: 'Карэкцыя памеру лагатыпа тэлеканала',
        en: 'TV channel logo size correction',
        zh: '電視頻道標誌尺寸校正'
    }
);

langAdd(
    'contain_icons_desc',
    {
        ru: 'Может некорректно работать на старых устройствах',
        uk: 'Може некоректно працювати на старих пристроях',
        be: 'Можа некарэктна працаваць на старых прыладах',
        en: 'May not work correctly on older devices.',
        zh: '可能无法在较旧的设备上正常工作。'
    }
);

Lampa.Lang.add(
    {
        ru: {
            archive: 'Архив',
            watch_first: 'Смотреть сначала'
        }
    }
);

function favID(
    title
) {
    return title
        .toLowerCase()
        .replace(
            /[\s!-\/:-@\[-`{-~]+/g,
            ''
        );
}

function getStorage(
    name,
    defaultValue
) {
    return Lampa.Storage.get(
        plugin.component +
        '_' +
        name,
        defaultValue
    );
}

function setStorage(
    name,
    val,
    noListen
) {
    return Lampa.Storage.set(
        plugin.component +
        '_' +
        name,
        val,
        noListen
    );
}

function getSettings(
    name
) {
    return Lampa.Storage.field(
        plugin.component +
        '_' +
        name
    );
}

function addSettings(
    type,
    param
) {

    var data = {
        component: plugin.component,

        param: {
            name:
                plugin.component +
                '_' +
                param.name,

            type: type,

            values:
                !param.values
                    ? ''
                    : param.values,

            placeholder:
                !param.placeholder
                    ? ''
                    : param.placeholder,

            default:
                typeof param.default ===
                'undefined'
                    ? ''
                    : param.default
        },

        field: {
            name:
                !param.title
                    ? (
                        !param.name
                            ? ''
                            : param.name
                    )
                    : param.title
        }
    };

    if (!!param.name) {

        data.param.name =
            plugin.component +
            '_' +
            param.name;
    }

    if (!!param.description) {

        data.field.description =
            param.description;
    }

    if (!!param.onChange) {

        data.onChange =
            param.onChange;
    }

    if (!!param.onRender) {

        data.onRender =
            param.onRender;
    }

    Lampa.SettingsApi.addParam(
        data
    );
 }
 // ============================================================
// СТИЛЬ СПИСКА КАНАЛОВ
// ============================================================

Lampa.Template.add(
    plugin.component + '_style',
    '<style>' +

    // Общий контейнер
    '#' + plugin.component + '_epg{' +
        'margin-right:1em;' +
    '}' +

    '.' + plugin.component + '.category-full{' +
        'padding-bottom:10em;' +
    '}' +

    // ОТКЛЮЧАЕМ СТАНДАРТНУЮ КАРТОЧКУ-СЕТКУ
    '.' + plugin.component + '.category-full .card--collection{' +
        'width:100%!important;' +
        'display:block!important;' +
        'margin:0!important;' +
        'padding:0!important;' +
    '}' +

    // Строка канала
    '.' + plugin.component + '.category-full .maxiptv-channel{' +
        'position:relative;' +
        'display:flex;' +
        'align-items:center;' +
        'width:100%;' +
        'min-height:82px;' +
        'padding:7px 14px 7px 10px;' +
        'box-sizing:border-box;' +
        'background:#303136;' +
        'border-bottom:1px solid rgba(255,255,255,.06);' +
        'overflow:hidden;' +
    '}' +

    // Оранжевый уголок справа
    '.' + plugin.component + '.category-full .maxiptv-channel:after{' +
        'content:"";' +
        'position:absolute;' +
        'right:0;' +
        'top:0;' +
        'width:0;' +
        'height:0;' +
        'border-top:13px solid #f0a000;' +
        'border-left:13px solid transparent;' +
    '}' +

    // Выбранный канал
    '.' + plugin.component + '.category-full .maxiptv-channel.focus{' +
        'background:#3a3b40;' +
        'box-shadow:inset 3px 0 0 #ffe600;' +
    '}' +

    // Блок логотипа
    '.' + plugin.component + '.category-full .maxiptv-logo{' +
        'position:relative;' +
        'flex:0 0 68px;' +
        'width:68px;' +
        'height:68px;' +
        'margin-right:14px;' +
        'border-radius:7px;' +
        'background:#fff;' +
        'overflow:hidden;' +
        'box-sizing:border-box;' +
    '}' +

    // Логотип
    '.' + plugin.component + '.category-full .maxiptv-logo img{' +
        'position:absolute!important;' +
        'left:50%!important;' +
        'top:50%!important;' +
        'width:100%!important;' +
        'height:100%!important;' +
        'max-width:100%!important;' +
        'max-height:100%!important;' +
        'object-fit:contain!important;' +
        'transform:translate(-50%,-50%)!important;' +
        'margin:0!important;' +
    '}' +

    // Текстовый блок
    '.' + plugin.component + '.category-full .maxiptv-info{' +
        'flex:1 1 auto;' +
        'min-width:0;' +
        'height:68px;' +
        'display:flex;' +
        'flex-direction:column;' +
        'justify-content:center;' +
        'position:relative;' +
    '}' +

    // Название канала
    '.' + plugin.component + '.category-full .maxiptv-title{' +
        'font-size:1.15em;' +
        'line-height:1.2;' +
        'font-weight:500;' +
        'color:#f2f2f2;' +
        'white-space:nowrap;' +
        'overflow:hidden;' +
        'text-overflow:ellipsis;' +
        'margin-bottom:5px;' +
        'padding-right:15px;' +
    '}' +

    // Текущая программа
    '.' + plugin.component + '.category-full .maxiptv-program{' +
        'position:relative;' +
        'height:23px;' +
        'line-height:20px;' +
        'font-size:.9em;' +
        'font-weight:400;' +
        'color:#cfcfcf;' +
        'white-space:nowrap;' +
        'overflow:hidden;' +
        'text-overflow:ellipsis;' +
        'padding-bottom:3px;' +
        'box-sizing:border-box;' +
    '}' +

    // Полоса прогресса
    '.' + plugin.component + '.category-full .maxiptv-progress-bg{' +
        'position:absolute;' +
        'left:0;' +
        'right:0;' +
        'bottom:0;' +
        'height:3px;' +
        'background:rgba(255,255,255,.12);' +
        'border-radius:3px;' +
        'overflow:hidden;' +
    '}' +

    '.' + plugin.component + '.category-full .maxiptv-progress{' +
        'position:absolute;' +
        'left:0;' +
        'top:0;' +
        'height:100%;' +
        'width:0%;' +
        'background:#ffe600;' +
        'border-radius:3px;' +
        'transition:width:.5s linear;' +
    '}' +

    // Время передачи
    '.' + plugin.component + '.category-full .maxiptv-time{' +
        'display:inline-block;' +
        'margin-right:7px;' +
        'color:#aaa;' +
        'font-size:.9em;' +
    '}' +

    // Иконки
    '.' + plugin.component + '.category-full .card__icons{' +
        'position:absolute!important;' +
        'right:4px!important;' +
        'top:4px!important;' +
        'z-index:5;' +
    '}' +

    // Прячем стандартные элементы карточки,
    // которые больше не нужны в горизонтальном режиме
    '.' + plugin.component + '.category-full .card__title,' +
    '.' + plugin.component + '.category-full .card__view,' +
    '.' + plugin.component + '.category-full .card__age{' +
        'display:none!important;' +
    '}' +

    // EPG справа
    '#' + plugin.component + '_epg{' +
        'float:right;' +
        'width:30%;' +
        'padding:1.2em 0;' +
    '}' +

    '.' + plugin.component + '-details__group{' +
        'font-size:1.3em;' +
        'margin-bottom:.9em;' +
        'opacity:.5;' +
    '}' +

    '.' + plugin.component + '-details__title{' +
        'font-size:4em;' +
        'font-weight:700;' +
    '}' +

    '.' + plugin.component + '-details__program{' +
        'padding-top:4em;' +
    '}' +

    '.' + plugin.component + '-details__program-title{' +
        'font-size:1.2em;' +
        'padding-left:4.9em;' +
        'margin-top:1em;' +
        'margin-bottom:1em;' +
        'opacity:.5;' +
    '}' +

    '.' + plugin.component + '-details__program-list>div+div{' +
        'margin-top:1em;' +
    '}' +

    '.' + plugin.component + '-program{' +
        'display:flex;' +
        'font-size:1.2em;' +
        'font-weight:300;' +
    '}' +

    '.' + plugin.component + '-program__time{' +
        'flex-shrink:0;' +
        'width:5em;' +
        'position:relative;' +
    '}' +

    '.' + plugin.component + '-program__body{' +
        'min-width:0;' +
    '}' +

    '.' + plugin.component + '-program__title{' +
        'white-space:nowrap;' +
        'overflow:hidden;' +
        'text-overflow:ellipsis;' +
    '}' +

    '.' + plugin.component + '-program__progressbar{' +
        'width:10em;' +
        'height:.3em;' +
        'border:.05em solid #fff;' +
        'border-radius:.05em;' +
        'margin:.5em .5em 0 0;' +
    '}' +

    '.' + plugin.component + '-program__progress{' +
        'height:.25em;' +
        'background:#fff;' +
        'max-width:100%;' +
    '}' +

    '.' + plugin.component + '-program__desc{' +
        'font-size:.9em;' +
        'margin:.5em;' +
        'text-align:justify;' +
        'max-height:15em;' +
        'overflow:hidden;' +
    '}' +

    '.' + plugin.component + '.category-full .card__icon.icon--timeshift{' +
        'background-image:url(https://epg.rootu.top/img/icon/timeshift.svg);' +
    '}' +

    // Мобильный экран
    '@media screen and (max-width:500px){' +

        '.' + plugin.component + '.category-full .maxiptv-channel{' +
            'min-height:78px;' +
            'padding:7px 10px;' +
        '}' +

        '.' + plugin.component + '.category-full .maxiptv-logo{' +
            'flex-basis:62px;' +
            'width:62px;' +
            'height:62px;' +
            'margin-right:12px;' +
        '}' +

        '.' + plugin.component + '.category-full .maxiptv-info{' +
            'height:62px;' +
        '}' +

        '.' + plugin.component + '.category-full .maxiptv-title{' +
            'font-size:1.05em;' +
        '}' +

        '.' + plugin.component + '.category-full .maxiptv-program{' +
            'font-size:.85em;' +
        '}' +

    '}' +

    '</style>'
);

$('body').append(
    Lampa.Template.get(
        plugin.component + '_style',
        {},
        true
    )
);


// ============================================================
// СТРАНИЦА IPTV
// ============================================================

function pluginPage(object) {

    if (object.id !== curListId) {

        catalog = {};
        listCfg = {};
        curListId = object.id;
    }

    EPG = {};

    var epgIdCurrent = '';

    var favorite =
        getStorage(
            'favorite' + object.id,
            '[]'
        );

    var network =
        new Lampa.Reguest();

    var scroll =
        new Lampa.Scroll({
            mask:true,
            over:true,
            step:250
        });

    var html =
        $('<div></div>');

    var body =
        $('<div class="' +
            plugin.component +
            ' category-full"></div>');

    body.toggleClass(
        'square_icons',
        getSettings('square_icons')
    );

    body.toggleClass(
        'contain_icons',
        getSettings('contain_icons')
    );

    var info;
    var last;

    if (epgInterval) {
        clearInterval(
            epgInterval
        );
    }

    epgInterval =
        setInterval(
            function() {

                for (
                    var epgId in EPG
                ) {

                    epgRender(
                        epgId
                    );
                }

                // Обновляем программу
                // непосредственно в строках каналов
                $('.' +
                    plugin.component +
                    ' .maxiptv-channel'
                ).each(
                    function() {

                        var row =
                            $(this);

                        var id =
                            row.attr(
                                'data-epg-id'
                            );

                        if (
                            !id ||
                            !EPG[id] ||
                            !EPG[id][2]
                        ) {
                            return;
                        }

                        var programs =
                            EPG[id][2];

                        var now =
                            Math.floor(
                                unixtime() / 60
                            );

                        var current =
                            null;

                        for (
                            var p = 0;
                            p < programs.length;
                            p++
                        ) {

                            var program =
                                programs[p];

                            if (
                                now >= program[0] &&
                                now <
                                program[0] +
                                program[1]
                            ) {

                                current =
                                    program;

                                break;
                            }
                        }

                        if (!current) {
                            return;
                        }

                        var percent =
                            (
                                (
                                    now -
                                    current[0]
                                ) /
                                current[1]
                            ) * 100;

                        percent =
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    percent
                                )
                            );

                        row.find(
                            '.maxiptv-program-title'
                        ).text(
                            current[2]
                        );

                        row.find(
                            '.maxiptv-progress'
                        ).css(
                            'width',
                            percent + '%'
                        );

                        row.find(
                            '.maxiptv-time'
                        ).text(
                            toLocaleTimeString(
                                current[0] *
                                60000
                            )
                        );
                    }
                );
            },
            1000
        );

    this.create = function() {

        var _this = this;

        this.activity.loader(
            true
        );

        var emptyResult =
            function() {

                var empty =
                    new Lampa.Empty();

                html.append(
                    empty.render()
                );

                _this.start =
                    empty.start;

                _this.activity.loader(
                    false
                );

                _this.activity.toggle();
            };

        if (
            Object.keys(catalog).length
        ) {

            _this.build(

                !catalog[
                    object.currentGroup
                ]

                    ? (
                        lists[object.id]
                            .groups.length > 1 &&
                        catalog[
                            lists[object.id]
                                .groups[1]
                                .key
                        ]

                            ? catalog[
                                lists[object.id]
                                    .groups[1]
                                    .key
                            ].channels

                            : []
                    )

                    : catalog[
                        object.currentGroup
                    ].channels
            );

        } else if (
            !lists[object.id] ||
            !object.url
        ) {

            emptyResult();

            return;

        } else {

            var load = 2;
            var chIDs = {};
            var data;

            var compileList =
                function(dataList) {

                    data = dataList;

                    if (!--load) {
                        parseList();
                    }
                };

            if (!timeOffsetSet) {

                load++;

                (function() {

                    var ts =
                        new Date().getTime();

                    network.silent(
                        Lampa.Utils.protocol() +
                        'epg.rootu.top/api/time',

                        function(serverTime) {

                            var te =
                                new Date().getTime();

                            timeOffset =
                                (
                                    serverTime < ts ||
                                    serverTime > te
                                )
                                    ? serverTime - te
                                    : 0;

                            timeOffsetSet =
                                true;

                            compileList(
                                data
                            );
                        },

                        function() {

                            timeOffsetSet =
                                true;

                            compileList(
                                data
                            );
                        }
                    );

                })();
            }

            network.silent(
                Lampa.Utils.protocol() +
                'epg.rootu.top/api/channels',

                function(d) {

                    chIDs = d;

                    compileList(
                        data
                    );
                },

                function() {

                    compileList(
                        data
                    );
                }
            );

            var parseList =
                function() {

                    if (
                        typeof data != 'string' ||
                        data.substr(
                            0,
                            7
                        ).toUpperCase() !==
                        '#EXTM3U'
                    ) {

                        emptyResult();

                        return;
                    }

                    catalog = {
                        '': {
                            title:
                                langGet(
                                    'favorites'
                                ),
                            channels:[]
                        }
                    };

                    lists[object.id]
                        .groups = [
                            {
                                title:
                                    langGet(
                                        'favorites'
                                    ),
                                key:''
                            }
                        ];

                    var l =
                        data.split(
                            /\r?\n/
                        );

                    var cnt = 0;
                    var i = 1;
                    var chNum = 0;
                    var m;
                    var mm;
                    var defGroup =
                        defaultGroup;

                    if (
                        !!(
                            m =
                            l[0].match(
                                /([^\s=]+)=((["'])(.*?)\3|\S+)/g
                            )
                        )
                    ) {

                        for (
                            var jj = 0;
                            jj < m.length;
                            jj++
                        ) {

                            if (
                                !!(
                                    mm =
                                    m[jj].match(
                                        /([^\s=]+)=((["'])(.*?)\3|\S+)/
                                    )
                                )
                            ) {

                                listCfg[
                                    mm[1].toLowerCase()
                                ] =
                                    mm[4] ||
                                    mm[2];
                            }
                        }
                    }

                    while (
                        i < l.length
                    ) {

                        chNum =
                            cnt + 1;

                        var channel = {
                            ChNum:chNum,
                            Title:
                                'Ch ' +
                                chNum,
                            isYouTube:false,
                            Url:'',
                            Group:'',
                            Options:{}
                        };

                        for (
                            ;
                            cnt < chNum &&
                            i < l.length;
                            i++
                        ) {

                            if (
                                !!(
                                    m =
                                    l[i].match(
                                        /^#EXTGRP:\s*(.+?)\s*$/i
                                    )
                                ) &&
                                m[1].trim() !== ''
                            ) {

                                defGroup =
                                    m[1].trim();

                            } else if (
                                !!(
                                    m =
                                    l[i].match
                                     this.render = function () {
	return html;
    };

    this.destroy = function () {
	Lampa.Player.runas && Lampa.Player.runas('');
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

if (!Lampa.Lang) {
    var lang_data = {};
    Lampa.Lang = {
	add: function add(data) {
	    lang_data = data;
	},
	translate: function translate(key) {
	    return lang_data[key] ? lang_data[key].ru : key;
	}
    };
}

var langData = {};

function langAdd(name, values) {
    langData[plugin.component + '_' + name] = values;
}

function langGet(name) {
    return Lampa.Lang.translate(
	plugin.component + '_' + name
    );
}

langAdd('default_playlist',
    {
        ru: 'https://gitlab.com/iptv135435/iptvshared/raw/main/IPTV_SHARED.m3u',
        uk: 'https://gitlab.com/iptv135435/iptvshared/raw/main/IPTV_SHARED.m3u',
        be: 'https://gitlab.com/iptv135435/iptvshared/raw/main/IPTV_SHARED.m3u',
        en: 'https://gitlab.com/iptv135435/iptvshared/raw/main/IPTV_SHARED.m3u',
        zh: 'https://gitlab.com/iptv135435/iptvshared/raw/main/IPTV_SHARED.m3u'
    }
);

langAdd('default_playlist_cat',
    {
        ru: 'Эфирные',
        uk: 'Эфирные',
        be: 'Эфирные',
        en: 'Эфирные',
        zh: 'Эфирные'
    }
);

langAdd('settings_playlist_num_group',
    {
	ru: 'Плейлист ',
	uk: 'Плейлист ',
	be: 'Плэйліст ',
	en: 'Playlist ',
	zh: '播放列表 '
    }
);

langAdd('settings_list_name',
    {
	ru: 'Название',
	uk: 'Назва',
	be: 'Назва',
	en: 'Name',
	zh: '名称'
    }
);

langAdd('settings_list_name_desc',
    {
	ru: 'Название плейлиста в левом меню',
	uk: 'Назва плейлиста у лівому меню',
	be: 'Назва плэйліста ў левым меню',
	en: 'Playlist name in the left menu',
	zh: '左侧菜单中的播放列表名称'
    }
);

langAdd('settings_list_url',
    {
	ru: 'URL-адрес',
	uk: 'URL-адреса',
	be: 'URL-адрас',
	en: 'URL',
	zh: '网址'
    }
);

langAdd('settings_list_url_desc0',
    {
	ru: 'По умолчанию используется плейлист из проекта. Вы можете заменить его на свой.',
	uk: 'За замовчуванням використовується плейлист із проекту <i>https://github.com/Free-TV/IPTV</i><br>Ви можете замінити його на свій.',
	be: 'Па змаўчанні выкарыстоўваецца плэйліст з праекта <i>https://github.com/Free-TV/IPTV</i><br> Вы можаце замяніць яго на свой.',
	en: 'The default playlist is from the project <i>https://github.com/Free-TV/IPTV</i><br>You can replace it with your own.',
	zh: '默认播放列表来自项目 <i>https://github.com/Free-TV/IPTV</i><br>您可以将其替换为您自己的。'
    }
);

langAdd('settings_list_url_desc1',
    {
	ru: 'Вы можете добавить еще один плейлист здесь. Ссылки на плейлисты обычно заканчиваются на <i>.m3u</i> или <i>.m3u8</i>',
	uk: 'Ви можете додати ще один плейлист суду. Посилання на плейлисти зазвичай закінчуються на <i>.m3u</i> або <i>.m3u8</i>',
	be: 'Вы можаце дадаць яшчэ адзін плэйліст суда. Спасылкі на плэйлісты звычайна заканчваюцца на <i>.m3u</i> або <i>.m3u8</i>',
	en: 'You can add another trial playlist. Playlist links usually end with <i>.m3u</i> or <i>.m3u8</i>',
	zh: '您可以添加另一个播放列表。 播放列表链接通常以 <i>.m3u</i> 或 <i>.m3u8</i> 结尾'
    }
);

langAdd('categories',
    {
	ru: 'Категории',
	uk: 'Категорія',
	be: 'Катэгорыя',
	en: 'Categories',
	zh: '分类'
    }
);

langAdd('uid',
    {
	ru: 'UID',
	uk: 'UID',
	be: 'UID',
	en: 'UID',
	zh: 'UID'
    }
);

langAdd('unique_id',
    {
	ru: 'Уникальный идентификатор (нужен для некоторых ссылок на плейлисты)',
	uk: 'унікальний ідэнтыфікатар (неабходны для некаторых спасылак на спіс прайгравання)',
	be: 'унікальны ідэнтыфікатар (неабходны для некаторых спасылак на спіс прайгравання)',
	en: 'unique identifier (needed for some playlist links)',
	zh: '唯一 ID（某些播放列表链接需要）'
    }
);

langAdd('favorites',
    {
	ru: 'Избранное',
	uk: 'Вибране',
	be: 'Выбранае',
	en: 'Favorites',
	zh: '收藏夹'
    }
);

langAdd('favorites_add',
    {
	ru: 'Добавить в избранное',
	uk: 'Додати в обране',
	be: 'Дадаць у абранае',
	en: 'Add to favorites',
	zh: '添加到收藏夹'
    }
);

langAdd('favorites_del',
    {
	ru: 'Удалить из избранного',
	uk: 'Видалити з вибраного',
	be: 'Выдаліць з абранага',
	en: 'Remove from favorites',
	zh: '从收藏夹中删除'
    }
);

langAdd('favorites_clear',
    {
	ru: 'Очистить избранное',
	uk: 'Очистити вибране',
	be: 'Ачысціць выбранае',
	en: 'Clear favorites',
	zh: '清除收藏夹'
    }
);

langAdd('favorites_move_top',
    {
	ru: 'В начало списка',
	uk: 'На початок списку',
	be: 'Да пачатку спісу',
	en: 'To the top of the list',
	zh: '到列表顶部'
    }
);

langAdd('favorites_move_up',
    {
	ru: 'Сдвинуть вверх',
	uk: 'Зрушити вгору',
	be: 'Ссунуць уверх',
	en: 'Move up',
	zh: '上移'
    }
);

langAdd('favorites_move_down',
    {
	ru: 'Сдвинуть вниз',
	uk: 'Зрушити вниз',
	be: 'Ссунуць уніз',
	en: 'Move down',
	zh: '下移'
    }
);

langAdd('favorites_move_end',
    {
	ru: 'В конец списка',
	uk: 'У кінець списку',
	be: 'У канец спісу',
	en: 'To the end of the list',
	zh: '到列表末尾'
    }
);

langAdd('epg_on',
    {
	ru: 'Включить телепрограмму',
	uk: 'Увімкнути телепрограму',
	be: 'Уключыць тэлепраграму',
	en: 'TV Guide: On',
	zh: '電視指南：開'
    }
);

langAdd('epg_off',
    {
	ru: 'Отключить телепрограмму',
	uk: 'Вимкнути телепрограму',
	be: 'Адключыць тэлепраграму',
	en: 'TV Guide: Off',
	zh: '電視指南：關閉'
    }
);

langAdd('epg_title',
    {
	ru: 'Телепрограмма',
	uk: 'Телепрограма',
	be: 'Тэлепраграма',
	en: 'TV Guide',
	zh: '電視指南'
    }
);

langAdd('square_icons', {
    ru: 'Квадратные лого каналов',
    uk: 'Квадратні лого каналів',
    be: 'Квадратныя лога каналаў',
    en: 'Square channel logos',
    zh: '方形通道標誌'
});

langAdd('contain_icons', {
    ru: 'Коррекция размера логотипа телеканала',
    uk: 'Виправлення розміру логотипу телеканалу',
    be: 'Карэкцыя памеру лагатыпа тэлеканала',
    en: 'TV channel logo size correction',
    zh: '電視頻道標誌尺寸校正'
});

langAdd('contain_icons_desc', {
    ru: 'Может некорректно работать на старых устройствах',
    uk: 'Може некоректно працювати на старих пристроях',
    be: 'Можа некарэктна працаваць на старых прыладах',
    en: 'May not work correctly on older devices.',
    zh: '可能无法在较旧的设备上正常工作。'
});

Lampa.Lang.add(langData);

function favID(title) {
    return title.toLowerCase().replace(
	/[\s!-\/:-@\[-`{-~]+/g,
	''
    );
}

function getStorage(name, defaultValue) {
    return Lampa.Storage.get(
	plugin.component + '_' + name,
	defaultValue
    );
}

function setStorage(name, val, noListen) {
    return Lampa.Storage.set(
	plugin.component + '_' + name,
	val,
	noListen
    );
}

function getSettings(name) {
    return Lampa.Storage.field(
	plugin.component + '_' + name
    );
}

function addSettings(type, param) {

    var data = {
	component: plugin.component,

	param: {
	    name:
		plugin.component +
		'_' +
		param.name,

	    type: type,

	    values:
		!param.values
		    ? ''
		    : param.values,

	    placeholder:
		!param.placeholder
		    ? ''
		    : param.placeholder,

	    default:
		(typeof param.default === 'undefined')
		    ? ''
		    : param.default
	},

	field: {
	    name:
		!param.title
		    ? (!param.name ? '' : param.name)
		    : param.title
	}
    };

    if (!!param.name) {
	data.param.name =
	    plugin.component +
	    '_' +
	    param.name;
    }

    if (!!param.description) {
	data.field.description =
	    param.description;
    }

    if (!!param.onChange) {
	data.onChange =
	    param.onChange;
    }

    if (!!param.onRender) {
	data.onRender =
	    param.onRender;
    }

    Lampa.SettingsApi.addParam(data);
}

function configurePlaylist(i) {

    if (i > 0) return i + 1;

    addSettings(
	'title',
	{
	    title:
		langGet(
		    'settings_playlist_num_group'
		) +
		(i + 1)
	}
    );

    var defName = 'MaxTV';

    var activity = {
	id: i,
	url: '',
	title: 'MaxTV',
	groups: [],

	currentGroup:
	    getStorage(
		'last_catalog' + i,
		langGet(
		    'default_playlist_cat'
		)
	    ),

	component:
	    plugin.component,

	page: 1
    };

    if (
	activity.currentGroup === '!!'
    ) {
	activity.currentGroup = '';
    }

    addSettings(
	'input',
	{
	    title:
		langGet(
		    'settings_list_name'
		),

	    name:
		'list_name_' + i,

	    default:
		'MaxTV',

	    placeholder:
		'MaxTV',

	    description:
		langGet(
		    'settings_list_name_desc'
		),

	    onChange:
		function(newVal) {

		    var title =
			!newVal
			    ? defName
			    : newVal;

		    $(
			'.js-' +
			plugin.component +
			'-menu' +
			i +
			'-title'
		    ).text(title);

		    activity.title =
			title;
		}
	}
    );

    addSettings(
	'input',
	{
	    title:
		langGet(
		    'settings_list_url'
		),

	    name:
		'list_url_' + i,

	    default:
		langGet(
		    'default_playlist'
		),

	    placeholder:
		'https://gitlab.com/iptv135435/iptvshared/raw/main/IPTV_SHARED.m3u',

	    description:
		langGet(
		    'settings_list_url_desc0'
		),

	    onChange:
		function(url) {

		    if (
			url ===
			activity.url
		    ) {
			return;
		    }

		    if (
			activity.id ===
			curListId
		    ) {
			catalog = {};
			curListId = -1;
		    }

		    if (
			/^https?:\/\/./i.test(url)
		    ) {

			activity.url =
			    url;

			$(
			    '.js-' +
			    plugin.component +
			    '-menu' +
			    i
			).show();

		    } else {

			activity.url =
			    '';

			$(
			    '.js-' +
			    plugin.component +
			    '-menu' +
			    i
			).hide();
		    }
		}
	}
    );

    var name =
	getSettings(
	    'list_name_' + i
	);

    var url =
	getSettings(
	    'list_url_' + i
	);

    var title =
	name ||
	defName;

    activity.title =
	title;

    var menuEl =
	$(
	    '<li class="menu__item selector js-' +
	    plugin.component +
	    '-menu' +
	    i +
	    '">' +

	    '<div class="menu__ico">' +
	    plugin.icon +
	    '</div>' +

	    '<div class="menu__text js-' +
	    plugin.component +
	    '-menu' +
	    i +
	    '-title">' +

	    encoder.text(title).html() +

	    '</div>' +

	    '</li>'
	)
	.hide()
	.on(
	    'hover:enter',
	    function() {

		if (
		    Lampa.Activity.active()
			.component ===
		    plugin.component
		) {

		    Lampa.Activity.replace(
			Lampa.Arrays.clone(
			    activity
			)
		    );

		} else {

		    Lampa.Activity.push(
			Lampa.Arrays.clone(
			    activity
			)
		    );
		}
	    }
	);

    if (
	/^https?:\/\/./i.test(url)
    ) {

	activity.url =
	    url;

	menuEl.show();
    }

    lists.push(
	{
	    activity:
		activity,

	    menuEl:
		menuEl,

	    groups: []
	}
    );

    return !activity.url
	? i + 1
	: i;
}

Lampa.Component.add(
    plugin.component,
    pluginPage
);

// Готовим настройки
Lampa.SettingsApi.addComponent(
    plugin
);

addSettings(
    'trigger',
    {
	title:
	    langGet(
		'square_icons'
	    ),

	name:
	    'square_icons',

	default:
	    false,

	onChange:
	    function(v) {

		$(
		    '.my_iptv2.category-full'
		).toggleClass(
		    'square_icons',
		    v === 'true'
		);
	    }
    }
);

addSettings(
    'trigger',
    {
	title:
	    langGet(
		'contain_icons'
	    ),

	description:
	    langGet(
		'contain_icons_desc'
	    ),

	name:
	    'contain_icons',

	default:
	    true,

	onChange:
	    function(v) {

		$(
		    '.my_iptv2.category-full'
		).toggleClass(
		    'contain_icons',
		    v === 'true'
		);
	    }
    }
);

for (
    var i = 0;
    i <= lists.length;
    i++
) {
    i = configurePlaylist(i);
}

UID =
    getStorage(
	'uid',
	''
    );

if (!UID) {

    UID =
	Lampa.Utils
	    .uid(10)
	    .toUpperCase()
	    .replace(
		/(.{4})/g,
		'$1-'
	    );

    setStorage(
	'uid',
	UID
    );

} else if (
    UID.length > 12
) {

    UID =
	UID.substring(
	    0,
	    12
	);

    setStorage(
	'uid',
	UID
    );
}

addSettings(
    'title',
    {
	title:
	    langGet('uid')
    }
);

addSettings(
    'static',
    {
	title:
	    UID,

	description:
	    langGet('unique_id')
    }
);

// ~~~ Готовим настройки

Lampa.Settings.listener.follow(
    'open',
    function(e) {

	if (e.name == 'main') {

	    setTimeout(
		function() {

		    $(
			'div[data-component="my_iptv2"]'
		    ).remove();

		},
		0
	    );
	}
    }
);

function pluginStart() {

    if (
	window[
	    'plugin_' +
	    plugin.component +
	    '_ready'
	]
    ) {
	return;
    }

    window[
	'plugin_' +
	plugin.component +
	'_ready'
    ] = true;

    var menu =
	$('.menu .menu__list')
	    .eq(0);

    for (
	var i = 0;
	i < lists.length;
	i++
    ) {

	menu.append(
	    lists[i].menuEl
	);
    }
}

if (!!window.appready) {

    pluginStart();

} else {

    Lampa.Listener.follow(
	'app',
	function(e) {

	    if (
		e.type === 'ready'
	    ) {
		pluginStart();
	    }

	}
    );
}

})();
