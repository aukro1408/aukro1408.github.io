(function(){
'use strict';

var STYLE_ID='lampa_trailer_autoplay_v11_style';
var current=null;
var DELAY=2000;

function style(){
 if(document.getElementById(STYLE_ID))return;
 var s=document.createElement('style');
 s.id=STYLE_ID;
 s.textContent=`
 .lta11-host{position:relative!important;overflow:hidden!important;isolation:isolate!important}
 .lta11-video{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;border:0!important;background:#000!important;opacity:0!important;z-index:5!important;pointer-events:none!important;transition:opacity .4s ease!important}
 .lta11-video.visible{opacity:1!important}
 .lta11-sound{position:absolute!important;right:12px!important;bottom:12px!important;width:46px!important;height:46px!important;min-width:46px!important;padding:0!important;margin:0!important;border:0!important;border-radius:50%!important;background:rgba(20,20,20,.84)!important;color:#fff!important;z-index:999999!important;display:flex!important;align-items:center!important;justify-content:center!important;opacity:0!important;pointer-events:none!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;box-shadow:0 2px 10px rgba(0,0,0,.35)!important}
 .lta11-sound.visible{opacity:1!important;pointer-events:auto!important}
 .lta11-sound:active{transform:scale(.92)!important}
 .lta11-sound svg{width:24px!important;height:24px!important;fill:currentColor!important;pointer-events:none!important}
 `;
 document.head.appendChild(s);
}
function muted(){return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm11 1.1v3.8c.6-.5 1-1.1 1-1.9s-.4-1.4-1-1.9zM17 7.2v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V21c3-1.1 5-3.9 5-6.8s-2-5.9-5-7z"/></svg>'}
function sound(){return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm12 3c0-1.3-.7-2.5-1.8-3.1v2.3c.5.3.8.7.8 1.2s-.3.9-.8 1.2v2.3c1.1-.6 1.8-1.8 1.8-3.1zm0-6v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V20c3-1.1 5-3.9 5-7s-2-5.9-5-7z"/></svg>'}
function videos(d){if(!d||!d.videos)return[];var a=d.videos.results||d.videos;return Array.isArray(a)?a.filter(function(v){return v&&v.key}):[]}
function trailer(d){
 var a=videos(d);if(!a.length)return null;
 var lang='ru';try{lang=String(Lampa.Storage.field('language')||'ru').toLowerCase().split('-')[0]}catch(e){}
 function t(x){return x.filter(function(v){return String(v.type||'').toLowerCase()==='trailer'})}
 var l=t(a.filter(function(v){return String(v.iso_639_1||'').toLowerCase()===lang}));if(l.length)return l[0];
 var en=t(a.filter(function(v){return String(v.iso_639_1||'').toLowerCase()==='en'}));if(en.length)return en[0];
 return t(a)[0]||a[0];
}
function url(id,mute,start){
 var origin='https://lampa.li';
 try{if(location.origin&&location.origin!=='null')origin=location.origin}catch(e){}
 return 'https://www.youtube.com/embed/'+encodeURIComponent(id)+
 '?autoplay=1&mute='+(mute?1:0)+
 '&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3'+
 '&cc_load_policy=0&disablekb=1&enablejsapi=1'+
 '&origin='+encodeURIComponent(origin)+
 '&start='+Math.max(0,Math.floor(start||0));
}
function post(frame,func,args){
 if(!frame||!frame.contentWindow)return;
 var msg=JSON.stringify({event:'command',func:func,args:args||[]});
 try{frame.contentWindow.postMessage(msg,'https://www.youtube.com')}catch(e){}
 try{frame.contentWindow.postMessage(msg,'*')}catch(e){}
}
function cleanup(){
 if(!current)return;
 if(current.timer)clearTimeout(current.timer);
 if(current.msg)window.removeEventListener('message',current.msg,true);
 if(current.frame)try{current.frame.remove()}catch(e){}
 if(current.sound)try{current.sound.remove()}catch(e){}
 if(current.host)current.host.classList.remove('lta11-host');
 current=null;
}
function makeFrame(id,mute,start){
 var f=document.createElement('iframe');
 f.className='lta11-video';
 f.setAttribute('frameborder','0');
 f.setAttribute('allowfullscreen','true');
 f.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
 f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
 f.src=url(id,mute,start);
 return f;
}
function swapAudio(on){
 if(!current||current.swapping)return;
 current.swapping=true;
 var old=current.frame;
 var pos=current.time||0;
 var f=makeFrame(current.id,!on,pos);
 f.classList.add('visible');
 current.host.insertBefore(f,old);
 current.frame=f;
 current.soundOn=on;
 current.sound.innerHTML=on?sound():muted();
 current.sound.setAttribute('aria-label',on?'Выключить звук':'Включить звук');

 var oldMsg=current.msg;
 // Only replace the iframe. Do NOT cleanup the card or button.
 setTimeout(function(){
   if(!current||current.frame!==f)return;
   try{old.remove()}catch(e){}
   current.swapping=false;
 },1200);
}
function create(body,d){
 cleanup();
 var tr=trailer(d);if(!tr)return;
 var p=body.find('.full-start-new__poster').first();if(!p.length)return;
 var host=p[0];
 var frame=makeFrame(tr.key,true,0);
 var btn=document.createElement('button');
 btn.type='button';btn.className='lta11-sound';btn.innerHTML=muted();
 btn.setAttribute('aria-label','Включить звук');
 host.classList.add('lta11-host');host.appendChild(frame);host.appendChild(btn);
 current={host:host,frame:frame,sound:btn,id:tr.key,time:0,soundOn:false,swapping:false,timer:null,msg:null};

 current.toggle=function(e){
   e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
   if(!current||current.sound!==btn)return;
   swapAudio(!current.soundOn);
 };
 btn.addEventListener('pointerdown',current.toggle,{capture:true,passive:false});
 btn.addEventListener('touchstart',current.toggle,{capture:true,passive:false});
 btn.addEventListener('click',current.toggle,true);

 current.msg=function(e){
   if(!current||e.source!==current.frame.contentWindow)return;
   var x=e.data;
   if(typeof x==='string'){try{x=JSON.parse(x)}catch(err){return}}
   if(!x)return;
   if(x.event==='infoDelivery'&&x.info&&typeof x.info.currentTime==='number'){
      current.time=x.info.currentTime;
   }
   if(x.event==='onStateChange'&&x.info===1){
      current.frame.classList.add('visible');
      current.sound.classList.add('visible');
   }
   if(x.event==='onError'){console.log('[Trailer Autoplay] YouTube error',x.info)}
 };
 window.addEventListener('message',current.msg,true);

 frame.onload=function(){
   if(!current||current.frame!==frame)return;
   current.timer=setTimeout(function(){
     if(!current||current.frame!==frame)return;
     frame.classList.add('visible');btn.classList.add('visible');post(frame,'playVideo');
   },DELAY);
 };
}
function full(e){if(e&&e.type==='complite'&&e.body&&e.data)create(e.body,e.data)}
function activity(e){if(e&&e.type==='destroy'&&e.component==='full')cleanup()}
function start(){if(!window.Lampa||!Lampa.Listener)return;style();Lampa.Listener.follow('full',full);Lampa.Listener.follow('activity',activity);console.log('[Trailer Autoplay] v11 started')}
if(window.Lampa&&Lampa.Listener)start();else setTimeout(start,1500);
})();
