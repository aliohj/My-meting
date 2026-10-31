/* Home: the job drawing (scaffold up → eight EIFS layers on → scaffold down),
   the figures sentence and the recent-projects register. */

/* ---------- job drawing ---------- */
var JOB_T={ground:0,wall:250,slab:650,lifts:[900,1150,1400,1650],callout:2100,leader:2350,frame:2450,
  sub:2600,adh:2800,eps:3050,dow:3450,mesh:3750,base:4000,pri:4300,fin:4550,paint:2800,
  down:[5100,5300,5500,5700],end:6300};
var JOB_STEPS=[
  [JOB_T.lifts[0],{en:'1 / 5 · Erect the scaffold',ar:'1 / 5 · تركيب السقالة'}],
  [JOB_T.adh,{en:'2 / 5 · Fix the board',ar:'2 / 5 · تثبيت لوح العزل'}],
  [JOB_T.mesh,{en:'3 / 5 · Mesh and basecoat',ar:'3 / 5 · الشبك وطبقة الأساس'}],
  [JOB_T.pri,{en:'4 / 5 · Primer and finish',ar:'4 / 5 · التأسيس والتشطيب'}],
  [JOB_T.down[0],{en:'5 / 5 · Dismantle, top to bottom',ar:'5 / 5 · فك السقالة من الأعلى'}],
  [JOB_T.end,{en:'Inspected and handed over',ar:'فُحص وسُلِّم'}]
];

function jobSVG(){
  var T=JOB_T,s='';
  function both(x,y,en,ar,cls,anchor){return '<text data-l="en" x="'+x+'" y="'+y+'"'+(cls?' class="'+cls+'"':'')+(anchor?' text-anchor="'+anchor+'"':'')+'>'+en+'</text><text data-l="ar" x="'+x+'" y="'+y+'"'+(cls?' class="'+cls+'"':'')+(anchor?' text-anchor="'+anchor+'"':'')+' style="font-family:var(--f-body);letter-spacing:0;font-size:11px">'+ar+'</text>'}
  s+='<svg class="jd" viewBox="0 24 600 496" role="img" aria-labelledby="jdT jdD">'+
     '<title id="jdT">'+AFL.t({en:'Wall section during an insulation job',ar:'مقطع جدار أثناء أعمال العزل'})+'</title>'+
     '<desc id="jdD">'+AFL.t({en:'Scaffold erected lift by lift, eight EIFS layers applied, U-value falls from 2.38 to 0.54 W/m²K, scaffold dismantled from the top.',ar:'تُركَّب السقالة طابقًا بعد طابق، وتُطبَّق طبقات العزل الثماني، فينخفض معامل الانتقال من 2.38 إلى 0.54، ثم تُفك السقالة من الأعلى.'})+'</desc>'+
     '<defs>'+
     '<pattern id="hatchP" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" style="fill:var(--bg-2)"/><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--hatch);stroke-width:1.2"/></pattern>'+
     '<pattern id="epsP" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" style="fill:#F7F9FA"/><circle cx="4" cy="4" r="1.05" style="fill:#0B1B27;opacity:.22"/></pattern>'+
     '<linearGradient id="jdHeat" x1="1" x2="0" y1="0" y2="0"><stop offset="0" style="stop-color:var(--heat);stop-opacity:.42"/><stop offset="1" style="stop-color:var(--heat);stop-opacity:0"/></linearGradient>'+
     '<clipPath id="dClip"><rect x="0" y="0" width="310" height="250" rx="4"/></clipPath>'+
     '</defs>';

  /* ground */
  s+='<path class="ln a-draw" pathLength="1" style="--t:'+T.ground+'ms" d="M14 500 H586"/>';
  var gh='';for(var x=22;x<250;x+=11)gh+='M'+x+' 500 l-9 11 ';
  s+='<path class="thin a-fade" style="--t:300ms" d="'+gh+'"/>';

  /* building: wall, slabs */
  s+='<rect class="wall lay-sub a-rise" style="--t:'+T.wall+'ms" x="62" y="76" width="36" height="424"/>';
  s+='<g class="a-fade" style="--t:'+T.slab+'ms">'+
     '<rect class="slab" x="14" y="98" width="48" height="14"/><rect class="slab" x="14" y="286" width="48" height="14"/><rect class="slab" x="14" y="488" width="48" height="12"/>'+
     both(18,470,'INT.','داخل')+'</g>';

  /* facade EIFS, painted top-down from the scaffold */
  s+='<rect class="eifs a-paint" style="--t:'+T.paint+'ms" x="98" y="76" width="8" height="424"/>';

  /* scaffold lifts: standards, transom, board, ledgers, rails, ties, bracing */
  var lifts='';
  for(var i=0;i<4;i++){
    var yb=500-i*104,yt=yb-104,top=i===3?36:yt;
    var g='<line x1="128" y1="'+yb+'" x2="128" y2="'+top+'"/><line x1="184" y1="'+yb+'" x2="184" y2="'+top+'"/>'+
      '<line x1="118" y1="'+yt+'" x2="194" y2="'+yt+'"/>'+
      '<rect class="board" x="131" y="'+(yt-7)+'" width="50" height="6" rx="1"/>'+
      '<circle class="tube" cx="128" cy="'+(yt+7)+'" r="3.4"/><circle class="tube" cx="184" cy="'+(yt+7)+'" r="3.4"/>'+
      (i>0?'<circle class="tube" cx="184" cy="'+(yb-24)+'" r="3.4"/><circle class="tube" cx="184" cy="'+(yb-46)+'" r="3.4"/>':'')+
      (i===3?'<circle class="tube" cx="184" cy="'+(yt-24)+'" r="3.4"/><circle class="tube" cx="184" cy="'+(yt-46)+'" r="3.4"/>':'')+
      '<line class="tie" x1="106" y1="'+(yt+16)+'" x2="128" y2="'+(yt+16)+'"/>'+
      (i%2===0?'<line x1="128" y1="'+(yb-4)+'" x2="184" y2="'+(yt+12)+'" style="stroke-width:2"/>':'<line x1="184" y1="'+(yb-4)+'" x2="128" y2="'+(yt+12)+'" style="stroke-width:2"/>')+
      (i===0?'<rect class="base" x="120" y="496" width="16" height="4"/><rect class="base" x="176" y="496" width="16" height="4"/>':'');
    lifts='<g class="sc" style="--t:'+T.lifts[i]+'ms;--o:'+T.down[3-i]+'ms">'+g+'</g>'+lifts;
  }
  s+=lifts;
  s+='<g class="a-fade" style="--t:'+T.lifts[0]+'ms">'+both(202,470,'EXT.','خارج')+'</g>';

  /* detail callout + leader */
  s+='<circle class="callout a-pop" style="--t:'+T.callout+'ms" cx="102" cy="330" r="22"/>';
  s+='<g class="a-fade" style="--t:'+T.callout+'ms"><circle cx="78" cy="304" r="9" style="fill:var(--sky-ink)"/><text x="78" y="307.5" text-anchor="middle" style="fill:var(--surface);font-weight:600;font-size:10px;letter-spacing:0">A</text></g>';
  s+='<path class="leader a-draw" pathLength="1" style="--t:'+T.leader+'ms" d="M123 323 L246 230 H270"/>';

  /* detail A: the eight-layer build-up */
  var d='<g transform="translate(270 150)">';
  d+='<rect class="frame a-fade" style="--t:'+T.frame+'ms" x="0" y="0" width="310" height="250" rx="4"/>';
  d+='<g clip-path="url(#dClip)">';
  d+='<rect class="heat a-fade" style="--t:'+T.frame+'ms" x="256" y="0" width="54" height="250"/>';
  [62,125,188].forEach(function(y,k){d+='<path class="a-fade" style="--t:'+(T.frame+150+k*90)+'ms;stroke:var(--heat);stroke-width:1.6;fill:none" d="M304 '+y+' q-6 -5 -12 0 t-12 0 t-12 0 M270 '+(y-5)+' l-6 5 6 5"/>'});
  d+='<rect class="lay-sub a-fade" data-id="sub" style="--t:'+T.sub+'ms" x="0" y="0" width="60" height="250"/>';
  d+='<path class="a-fade" style="--t:'+T.sub+'ms;stroke:var(--ink);stroke-width:1.2;fill:var(--surface)" d="M0 0 H12 l-5 40 9 10 -9 10 5 190 H0Z"/>';
  d+='<rect class="lay-adh a-place" style="--t:'+T.adh+'ms" x="60" y="0" width="16" height="250"/>';
  d+='<rect class="lay-eps a-place" style="--t:'+T.eps+'ms" x="76" y="0" width="150" height="250"/>';
  d+='<line class="a-place" style="--t:'+T.eps+'ms;stroke:var(--ink);stroke-width:1" x1="76" y1="0" x2="76" y2="250"/><line class="a-place" style="--t:'+T.eps+'ms;stroke:var(--ink);stroke-width:1" x1="226" y1="0" x2="226" y2="250"/>';
  [55,125,195].forEach(function(y,k){d+='<g class="lay-dow a-place" style="--t:'+(T.dow+k*90)+'ms"><line x1="30" y1="'+y+'" x2="223" y2="'+y+'"/><rect x="221" y="'+(y-8)+'" width="4.5" height="16"/></g>'});
  d+='<rect class="lay-base a-place" style="--t:'+T.base+'ms" x="226" y="0" width="16" height="250"/>';
  d+='<line class="lay-mesh a-unroll" style="--t:'+T.mesh+'ms" x1="233" y1="0" x2="233" y2="250"/>';
  d+='<rect class="lay-pri a-place" style="--t:'+T.pri+'ms" x="242" y="0" width="5" height="250"/>';
  d+='<rect class="lay-fin a-place" style="--t:'+T.fin+'ms" x="247" y="0" width="9" height="250"/>';
  d+='</g>';
  d+='<rect class="a-fade" style="--t:'+T.frame+'ms;fill:none;stroke:var(--ink);stroke-width:1.2" x="0" y="0" width="310" height="250" rx="4"/>';
  /* number badges */
  function badge(n,cx,cy,lx,ly,t){return '<g class="badge hot a-pop" style="--t:'+t+'ms">'+(lx!=null?'<line x1="'+cx+'" y1="'+(cy+(cy<0?9:-9))+'" x2="'+lx+'" y2="'+ly+'"/>':'')+'<circle cx="'+cx+'" cy="'+cy+'" r="9"/><text x="'+cx+'" y="'+(cy+3.5)+'">'+n+'</text></g>'}
  d+=badge(1,30,-20,30,0,T.sub)+badge(2,68,-20,68,0,T.adh)+badge(3,151,-20,151,0,T.eps)+badge(6,234,-20,234,0,T.base)+badge(7,266,-20,244.5,0,T.pri)+badge(8,298,-20,251.5,0,T.fin)+
     badge(4,128,272,128,195,T.dow)+badge(5,233,272,233,250,T.mesh);
  d+='<g class="a-fade" style="--t:'+T.frame+'ms">'+both(0,312,'DETAIL A · WALL BUILD-UP ≈ 67 MM','تفصيل A · طبقات الجدار ≈ 67 مم','ttl')+'</g>';
  d+='</g>';
  s+=d+'</svg>';
  return s;
}

function Job(root){
  var draw=root.querySelector('.job-draw'),num=root.querySelector('.u-num'),stepEl=root.querySelector('.job-step span'),
      keys=[].slice.call(root.querySelectorAll('.job-key li')),replay=root.querySelector('.job-replay'),timers=[],raf=0;
  draw.innerHTML=jobSVG();
  function setU(u){num.textContent=u.toFixed(2);root.style.setProperty('--u',Math.max(0,Math.min(2.5,u)));root.classList.toggle('pass',u<=0.57)}
  function setStep(o){stepEl.innerHTML=AFL.both(o)}
  function clear(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(raf)}
  function at(ms,f){timers.push(setTimeout(f,ms))}
  function finish(){clear();root.classList.remove('play');root.classList.add('done','ended');setU(0.54);keys.forEach(function(k){k.classList.add('on')});setStep(JOB_STEPS[JOB_STEPS.length-1][1])}
  function play(){
    clear();root.classList.remove('done','ended','pass','play');keys.forEach(function(k){k.classList.remove('on')});
    void root.offsetWidth;root.classList.add('play');setU(2.38);setStep({en:'Survey',ar:'المعاينة'});
    JOB_STEPS.forEach(function(st){at(st[0],function(){setStep(st[1])})});
    keys.forEach(function(k){var t=JOB_T[k.getAttribute('data-id')];at(t,function(){k.classList.add('on')})});
    at(JOB_T.eps,function(){var t0=null,dur=700;
      (function tick(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);setU(2.38+(0.54-2.38)*e);if(k<1)raf=requestAnimationFrame(tick)})(performance.now())});
    at(JOB_T.end,function(){root.classList.add('ended')});
  }
  replay.addEventListener('click',play);
  if(AFL.rm){finish();return}
  root.__onin=play;AFL.watch(root);
}

/* ---------- figures sentence + recent projects ---------- */
AFL_INIT=window.AFL_INIT||[];AFL_INIT.push(function(){
  var job=document.querySelector('.job');if(job)Job(job);
  var n=PROJECTS.length,ar=Math.round(totalArea(PROJECTS)/1000)*1000,mo=PROJECTS.filter(function(p){return p.s==='gov'}).length;
  var figs=document.getElementById('figs');
  if(figs){
    function c(v,cls){return '<b class="'+(cls||'')+'"><bdi dir="ltr" data-count="'+v+'">'+v.toLocaleString('en-US')+'</bdi></b>'}
    figs.innerHTML=
      '<span data-l="en">'+c(n)+' projects since 2021. More than '+c(ar,'sky')+' m² of facade insulated, '+c(mo)+' of them for the Ministry of Housing.</span>'+
      '<span data-l="ar">'+c(n)+' مشروعًا منذ 2021. أكثر من '+c(ar,'sky')+' م² من الواجهات المعزولة، منها '+c(mo)+' لوزارة الإسكان.</span>';
  }
  var heroFigs=document.querySelectorAll('[data-fig]');
  heroFigs.forEach(function(el){var k=el.getAttribute('data-fig');var v=k==='n'?n:k==='mo'?mo:ar;el.setAttribute('data-count',v);el.textContent=v.toLocaleString('en-US')});
  var feat=document.getElementById('featured');
  function render(){if(!feat)return;
    feat.innerHTML=['eshp-n','wadi','sahel','naseem3'].map(function(id){return PROJECTS.filter(function(p){return p.id===id})[0]}).map(regRow).join('');
    AFL.reveal(feat)}
  AFL.subs.push(render);render();
});
