/* Services: layer explorer (wall section) and the indicative U-value check. */
function explorerSVG(){
  var X=10,ids={},s='',t=0;
  s+='<svg viewBox="0 0 400 252" role="img" aria-label="'+AFL.t({en:'EIFS wall section',ar:'مقطع جدار بنظام العزل الخارجي'})+'"><defs>'+
     '<pattern id="hatchP" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" style="fill:var(--bg-2)"/><line x1="0" y1="0" x2="0" y2="8" style="stroke:var(--hatch);stroke-width:1.2"/></pattern>'+
     '<pattern id="epsP" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" style="fill:#F7F9FA"/><circle cx="4.5" cy="4.5" r="1.1" style="fill:#0B1B27;opacity:.24"/></pattern></defs><g id="bands">';
  LAYERS.forEach(function(L){if(!L.w)return;
    s+='<rect class="band-r grow lay-'+L.id+'" data-id="'+L.id+'" x="'+X+'" y="30" width="'+L.w+'" height="180" style="--t:'+t+'ms"/>';
    ids[L.id]=X;X+=L.w;t+=110});
  var bx=ids.base+5;
  s+='<line class="band-r lay-mesh" data-id="mesh" x1="'+bx+'" x2="'+bx+'" y1="30" y2="210"/>';
  [60,120,180].forEach(function(y){s+='<g class="band-r lay-dow" data-id="dow"><line x1="'+(ids.sub+55)+'" x2="'+(ids.eps+196)+'" y1="'+y+'" y2="'+y+'"/><rect x="'+(ids.eps+196)+'" y="'+(y-6)+'" width="5" height="12"/></g>'});
  s+='</g>';
  s+='<path d="M10 30 l5 7 -5 7 5 7 -5 7" class="dim"/>';
  s+='<text x="12" y="228">'+AFL.t({en:'INT.',ar:'داخل'})+'</text><text x="'+(X-26)+'" y="228">'+AFL.t({en:'EXT.',ar:'خارج'})+'</text>';
  s+='<path class="dim" d="M'+ids.adh+' 240 H'+X+' M'+ids.adh+' 235 v10 M'+X+' 235 v10"/><text x="'+(ids.adh+((X-ids.adh)/2)-26)+'" y="251">≈ 67 mm</text>';
  return s+'</svg>';
}

AFL_INIT=window.AFL_INIT||[];AFL_INIT.push(function(){
  var host=document.getElementById('ex-svg');if(!host)return;
  var list=document.getElementById('layer-list'),det=document.getElementById('layer-detail'),cur='eps';
  function fillOf(L){return {sub:'repeating-linear-gradient(45deg,var(--bg-2) 0 3px,var(--hatch) 3px 4px)',adh:'var(--l-adh)',eps:'#F7F9FA',dow:'var(--ink)',mesh:'var(--sky-ink)',base:'var(--l-base)',pri:'var(--l-pri)',fin:'var(--sky)'}[L.id]}
  function highlight(){var g=host.querySelector('#bands');if(!g)return;g.classList.add('dim-on');
    host.querySelectorAll('.band-r').forEach(function(e){e.classList.toggle('on',e.getAttribute('data-id')===cur)})}
  function paintDetail(anim){
    var L=LAYERS.filter(function(x){return x.id===cur})[0];
    det.innerHTML='<p class="label sky">'+AFL.t({en:'Layer',ar:'الطبقة'})+' '+L.n+' / 8</p><h3 class="h3" style="margin-top:8px">'+AFL.t({en:L.en,ar:L.ar})+'</h3><p>'+AFL.t({en:L.de,ar:L.da})+'</p>'+
      (L.mat?'<p class="mat">'+L.mat+'</p>':'<p class="note" style="margin-top:12px">'+AFL.t({en:'Supplier not named on the EWA material list.',ar:'المورّد غير مذكور في قائمة مواد الهيئة.'})+'</p>');
    if(anim){det.classList.remove('swap');void det.offsetWidth;det.classList.add('swap')}
  }
  function paint(){
    var wasIn=host.parentNode.classList.contains('in');
    host.innerHTML=explorerSVG();
    document.getElementById('ex-legend').innerHTML=LAYERS.filter(function(L){return L.w}).map(function(L){return '<span><i style="background:'+fillOf(L)+'"></i>'+AFL.t({en:L.en,ar:L.ar})+'</span>'}).join('');
    document.getElementById('ex-note').textContent=AFL.t({en:'Thin layers drawn at 4 px per mm. The 200 mm wall is cut short. Build-up on the wall is about 67 mm.',ar:'الطبقات الرقيقة مرسومة بمقياس 4 بكسل لكل مم، والجدار 200 مم مقطوع للاختصار. سماكة التركيب على الجدار نحو 67 مم.'});
    list.innerHTML=LAYERS.map(function(L){
      return '<li><button type="button" data-id="'+L.id+'" aria-pressed="'+(L.id===cur)+'"><b>'+L.n+'</b><i style="background:'+fillOf(L)+'"></i><span>'+AFL.t({en:L.en,ar:L.ar})+'</span><em><bdi dir="ltr">'+(L.mm?L.mm+' mm':'')+'</bdi></em></button></li>'}).join('');
    paintDetail(false);highlight();
    if(wasIn)host.parentNode.classList.add('in');
  }
  list.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cur=b.getAttribute('data-id');
    list.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});paintDetail(true);highlight()});
  AFL.subs.push(paint);paint();

  /* U-value check */
  var wall=document.getElementById('wall'),thk=document.getElementById('thk');
  function calc(){
    var t=+thk.value,rw=+wall.value,base=0.13+0.04+rw+0.03,ru=base+(t/1000)/0.0382,u0=1/base,u1=1/ru,ok=u1<=0.57;
    document.getElementById('thkv').textContent=t+' mm';
    thk.style.setProperty('--p',((t-thk.min)/(thk.max-thk.min)*100)+'%');
    var max=Math.max(u0,1);
    function bar(label,u,cls){return '<div class="bar"><span>'+label+'</span><div class="track"><div class="fill '+(cls||'')+'" style="width:'+Math.min(100,u/max*100)+'%"></div><div class="limit" style="inset-inline-start:'+(0.57/max*100)+'%"></div></div><b>'+u.toFixed(2)+'</b></div>'}
    document.getElementById('bars').innerHTML=bar(AFL.t({en:'Bare wall',ar:'الجدار بدون عزل'}),u0)+bar(AFL.t({en:'With EIFS',ar:'مع نظام العزل'}),u1,ok?'ok':'bad')+
      '<p class="note">'+AFL.t({en:'U-value in W/m²K. The dark marker is the 0.57 limit.',ar:'معامل الانتقال بوحدة واط/م²·كلفن. العلامة الداكنة هي الحد 0.57.'})+'</p>';
    var msg=ok?{en:'Within the 0.57 limit',ar:'ضمن حد 0.57'}:{en:'Above the limit. Use a thicker board.',ar:'أعلى من الحد. استخدم لوحًا أسمك.'};
    var low=t<55?'<p class="note" style="margin-top:10px">'+AFL.t({en:'The registered systems start at 55 mm.',ar:'الأنظمة المسجّلة تبدأ من 55 مم.'})+'</p>':'';
    document.getElementById('verdict').innerHTML='<span class="pill '+(ok?'ok':'bad')+'">'+AFL.t(msg)+'</span>'+low}
  wall.addEventListener('change',calc);thk.addEventListener('input',calc);AFL.subs.push(calc);calc();
});
