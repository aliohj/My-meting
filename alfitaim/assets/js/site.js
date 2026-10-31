/* Al-Fatiem Alarabi — core behaviour: language, navigation, reveals, counters,
   lightbox, copy buttons, hover previews. Page scripts register with AFL_INIT. */
(function(){
'use strict';
var LS=null;try{LS=window.localStorage}catch(e){}
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function getLang(){try{var l=LS&&LS.getItem('afl');if(l==='ar'||l==='en')return l}catch(e){}return 'en'}

var AFL=window.AFL={lang:getLang(),subs:[],rm:RM,
  t:function(o){return o==null?'':(typeof o==='string'?o:(o[AFL.lang]||o.en))},
  both:function(o){return '<span data-l="en">'+o.en+'</span><span data-l="ar">'+o.ar+'</span>'}};

var ARROW='<svg class="ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 8h12M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
AFL.arrow=ARROW;

/* ---------- language ---------- */
function applyLang(l){
  AFL.lang=l;var h=document.documentElement;h.lang=l;h.dir=l==='ar'?'rtl':'ltr';
  try{LS&&LS.setItem('afl',l)}catch(e){}
  document.querySelectorAll('option[data-en]').forEach(function(o){o.textContent=o.getAttribute('data-'+l)});
  document.querySelectorAll('[data-ph-en]').forEach(function(e){e.placeholder=e.getAttribute('data-ph-'+l)||''});
  document.querySelectorAll('[data-al-en]').forEach(function(e){e.setAttribute('aria-label',e.getAttribute('data-al-'+l))});
  var tm=document.querySelector('meta[name="title-'+l+'"]');if(tm)document.title=tm.content;
  AFL.subs.forEach(function(f){try{f()}catch(e){console.error(e)}});
}
AFL.apply=applyLang;

/* ---------- reveal on scroll ---------- */
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;var el=e.target;el.classList.add('in');io.unobserve(el);
  if(el.__onin)el.__onin();
  el.querySelectorAll&&el.querySelectorAll('[data-count]').forEach(count);
  if(el.matches('[data-count]'))count(el);
})},{threshold:.12,rootMargin:'0px 0px -6% 0px'}):null;

function splitWords(el){
  if(el.__split)return;el.__split=1;var i=0;
  (function walk(n){
    Array.prototype.slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===3){
        var parts=c.textContent.split(/(\s+)/);if(!c.textContent.trim())return;
        var f=document.createDocumentFragment();
        parts.forEach(function(p){if(!p)return;
          if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(p));return}
          var w=document.createElement('span');w.className='w';w.style.setProperty('--i',i++);
          var s=document.createElement('span');s.textContent=p;w.appendChild(s);f.appendChild(w)});
        c.parentNode.replaceChild(f,c);
      }else if(c.nodeType===1&&!c.classList.contains('w')){
        if(c.hasAttribute('data-l'))i=0;
        walk(c);
      }
    })
  })(el);
}

function reveal(root){
  root=root||document;
  root.querySelectorAll('.split').forEach(function(el){splitWords(el);watch(el)});
  root.querySelectorAll('[data-stagger]').forEach(function(p){
    var step=+p.getAttribute('data-stagger')||70,k=0;
    Array.prototype.forEach.call(p.children,function(c){if(c.hasAttribute('data-rv')){c.style.setProperty('--d',Math.min(k++,8)*step+'ms')}})});
  root.querySelectorAll('[data-rv],[data-in]').forEach(watch);
}
function watch(el){
  if(el.__w)return;el.__w=1;
  if(RM||!io){el.classList.add('in');if(el.__onin)el.__onin();el.querySelectorAll&&el.querySelectorAll('[data-count]').forEach(count);return}
  io.observe(el);
}
AFL.reveal=reveal;AFL.watch=watch;

/* ---------- counters ---------- */
function count(el){
  if(el.__c)return;el.__c=1;
  var to=parseFloat(el.getAttribute('data-count')),dec=+(el.getAttribute('data-dec')||0),pre=el.getAttribute('data-pre')||'',suf=el.getAttribute('data-suf')||'';
  function fmt(v){return pre+v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})+suf}
  if(RM){el.textContent=fmt(to);return}
  var t0=null,dur=1500;
  function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=fmt(dec?to*e:Math.round(to*e));if(k<1)requestAnimationFrame(step)}
  el.textContent=fmt(0);requestAnimationFrame(step);
}
AFL.count=count;

/* ---------- lightbox ---------- */
function lightbox(){
  var lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
  lb.innerHTML='<div class="lb-top"><span class="lb-n mono"></span><button type="button" class="lb-x">'+AFL.both({en:'Close',ar:'إغلاق'})+' <span aria-hidden="true">✕</span></button></div>'+
    '<div class="lb-stage"><button type="button" class="lb-nav lb-pv" data-al-en="Previous image" data-al-ar="الصورة السابقة" aria-label="Previous image"><svg viewBox="0 0 20 20"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button><img alt=""><button type="button" class="lb-nav lb-nx" data-al-en="Next image" data-al-ar="الصورة التالية" aria-label="Next image"><svg viewBox="0 0 20 20"><path d="m7.5 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button></div>'+
    '<div class="lb-cap"></div>';
  document.body.appendChild(lb);
  var img=lb.querySelector('img'),cap=lb.querySelector('.lb-cap'),n=lb.querySelector('.lb-n'),pv=lb.querySelector('.lb-pv'),nx=lb.querySelector('.lb-nx'),xb=lb.querySelector('.lb-x');
  var gal=[],gi=0,label='',last=null;
  function show(){img.classList.remove('ld');var src=gal[gi];var pre=new Image();pre.onload=pre.onerror=function(){img.src=src;img.alt=label;requestAnimationFrame(function(){img.classList.add('ld')})};pre.src=src;
    pv.hidden=nx.hidden=gal.length<2;n.textContent=gal.length>1?(gi+1)+' / '+gal.length:'';cap.textContent=label}
  function open(list,l,start){gal=list;gi=start||0;label=l||'';last=document.activeElement;show();lb.classList.add('open');document.body.style.overflow='hidden';setTimeout(function(){xb.focus()},50)}
  function close(){lb.classList.remove('open');document.body.style.overflow='';if(last&&last.focus)last.focus()}
  function go(d){gi=(gi+d+gal.length)%gal.length;show()}
  document.addEventListener('click',function(e){
    var g=e.target.closest('[data-gal]');
    if(g){e.preventDefault();open(g.getAttribute('data-gal').split(',').map(phPathLocal),g.getAttribute('data-cap')||g.getAttribute('aria-label')||'');return}
    var z=e.target.closest('[data-zoom]');
    if(z){e.preventDefault();var grp=z.getAttribute('data-group');
      if(grp){var all=[].slice.call(document.querySelectorAll('[data-zoom][data-group="'+grp+'"]'));open(all.map(function(a){return a.getAttribute('data-zoom')}),z.getAttribute('data-cap')||'',all.indexOf(z))}
      else open([z.getAttribute('data-zoom')],z.getAttribute('data-cap')||(z.querySelector('img')||z).getAttribute('alt')||'');return}
    if(!lb.classList.contains('open'))return;
    if(e.target.closest('.lb-pv')){go(-1);return}
    if(e.target.closest('.lb-nx')){go(1);return}
    if(e.target.closest('.lb-x')||e.target===lb||e.target.classList.contains('lb-stage'))close();
  });
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    var rtl=document.documentElement.dir==='rtl';
    if(e.key==='ArrowRight')go(rtl?-1:1);if(e.key==='ArrowLeft')go(rtl?1:-1);
    if(e.key==='Tab'){var f=[].slice.call(lb.querySelectorAll('button:not([hidden])'));var i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}});
  var sx=null;lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){if(sx==null||gal.length<2)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50){var rtl=document.documentElement.dir==='rtl';go((dx<0)!==rtl?1:-1)}sx=null});
}
function phPathLocal(k){k=k.trim();return k.indexOf('/')>-1?k:'img/'+k+'.webp'}

/* ---------- hover preview for register rows ---------- */
function peek(){
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  var pk=document.createElement('div');pk.className='peek';pk.innerHTML='<img alt="">';document.body.appendChild(pk);
  var im=pk.querySelector('img'),cur=null,x=0,y=0,tx=0,ty=0,raf=0;
  function loop(){x+=(tx-x)*.18;y+=(ty-y)*.18;pk.style.setProperty('--x',x+'px');pk.style.setProperty('--y',y+'px');if(Math.abs(tx-x)>.5||Math.abs(ty-y)>.5)raf=requestAnimationFrame(loop);else raf=0}
  document.addEventListener('mousemove',function(e){
    var r=e.target.closest&&e.target.closest('[data-peek]');
    if(r!==cur){cur=r;if(r){im.src=r.getAttribute('data-peek');pk.classList.add('on')}else pk.classList.remove('on')}
    if(!r)return;
    var w=300,h=225,rtl=document.documentElement.dir==='rtl';
    tx=rtl?e.clientX-w-28:e.clientX+28;ty=e.clientY-h/2;
    if(tx+w>innerWidth-12)tx=e.clientX-w-28;if(tx<12)tx=e.clientX+28;
    ty=Math.max(12,Math.min(innerHeight-h-12,ty));
    if(!pk.__init){x=tx;y=ty;pk.__init=1}
    if(!raf)raf=requestAnimationFrame(loop);
  },{passive:true});
  window.addEventListener('scroll',function(){if(cur){cur=null;pk.classList.remove('on')}},{passive:true});
}

/* ---------- header: hide on scroll down, show on scroll up ---------- */
function header(){
  var h=document.querySelector('.hdr');if(!h)return;var last=scrollY,tick=false;
  window.addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){
    var y=scrollY;if(!document.body.classList.contains('menu-open')){if(y>last+6&&y>160)h.classList.add('hide');else if(y<last-6||y<160)h.classList.remove('hide')}
    last=y;tick=false})},{passive:true});
  h.addEventListener('focusin',function(){h.classList.remove('hide')});
}

/* ---------- mobile menu ---------- */
function menu(){
  var mb=document.querySelector('.menu-btn'),nv=document.querySelector('.nav');if(!mb||!nv)return;
  nv.querySelectorAll(':scope > a').forEach(function(a,i){a.style.setProperty('--i',i)});
  function set(o){nv.classList.toggle('open',o);mb.setAttribute('aria-expanded',o);document.body.classList.toggle('menu-open',o)}
  mb.addEventListener('click',function(){set(!nv.classList.contains('open'))});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nv.classList.contains('open')){set(false);mb.focus()}});
  nv.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});
  window.addEventListener('resize',function(){if(innerWidth>960&&nv.classList.contains('open'))set(false)});
}

/* ---------- copy buttons ---------- */
function copyBtns(){
  document.addEventListener('click',function(e){var b=e.target.closest('[data-copy]');if(!b)return;
    var v=b.getAttribute('data-copy');
    function done(){var o=b.innerHTML;b.classList.add('done');b.innerHTML=AFL.both({en:'Copied',ar:'تم النسخ'});setTimeout(function(){b.classList.remove('done');b.innerHTML=o},1500)}
    function sel(){var s=b.parentNode.querySelector('.sel');if(s){var r=document.createRange();r.selectNodeContents(s);var g=getSelection();g.removeAllRanges();g.addRange(r)}}
    try{navigator.clipboard.writeText(v).then(done,sel)}catch(x){sel()}});
}

/* ---------- tabs indicator (sliding pill) ---------- */
AFL.tabInd=function(wrap){
  if(!wrap)return;var ind=wrap.querySelector('.ind');if(!ind){ind=document.createElement('span');ind.className='ind';ind.setAttribute('aria-hidden','true');wrap.insertBefore(ind,wrap.firstChild)}
  var a=wrap.querySelector('[aria-selected=true]');if(!a)return;
  ind.style.left=a.offsetLeft+'px';ind.style.width=a.offsetWidth+'px';
};

/* ---------- certificate validity bars ---------- */
function validity(){
  document.querySelectorAll('.valid[data-from]').forEach(function(v){
    var a=new Date(v.getAttribute('data-from')+'T00:00:00'),b=new Date(v.getAttribute('data-to')+'T23:59:59'),now=new Date();
    var k=Math.max(0,Math.min(1,(now-a)/(b-a)));v.style.setProperty('--v',(k*100).toFixed(1)+'%');
    var months=Math.max(0,Math.round((b-now)/(30.44*864e5))),left=v.querySelector('.valid-left');
    function paint(){if(!left)return;left.innerHTML=now>b?AFL.both({en:'Expired',ar:'منتهية'}):AFL.both({en:months+' months left',ar:'متبقٍ '+months+' شهرًا'})}
    paint();
  });
}

/* view transition helper for in-page content swaps */
AFL.swap=function(fn){if(!RM&&document.startViewTransition){document.startViewTransition(fn)}else fn()};

document.addEventListener('DOMContentLoaded',function(){
  applyLang(AFL.lang);
  document.querySelectorAll('.lang').forEach(function(b){b.addEventListener('click',function(){
    var next=AFL.lang==='ar'?'en':'ar';
    if(!RM&&document.startViewTransition)document.startViewTransition(function(){applyLang(next)});else applyLang(next)})});
  menu();header();copyBtns();lightbox();peek();validity();
  (window.AFL_INIT||[]).forEach(function(f){try{f()}catch(e){console.error(e)}});
  applyLang(AFL.lang);
  reveal(document);
  /* safety net: anything already on screen after load gets shown */
  setTimeout(function(){document.querySelectorAll('[data-rv]:not(.in),.split:not(.in)').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.classList.add('in')})},2600);
});
window.addEventListener('pageshow',function(e){if(e.persisted){var n=document.querySelector('.nav');if(n)n.classList.remove('open');document.body.classList.remove('menu-open')}});
})();
