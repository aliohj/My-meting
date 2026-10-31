/* Projects: sector tabs, service filter, register and the "also completed" table. */
AFL_INIT=window.AFL_INIT||[];AFL_INIT.push(function(){
  var TABS=[['government','gov',{en:'Government',ar:'حكومي'}],['residential','res',{en:'Residential',ar:'سكني'}],['commercial','com',{en:'Commercial and hospitality',ar:'تجاري وضيافة'}]];
  var C=[['all',{en:'All',ar:'الكل'}],['eifs',{en:'Insulation (EIFS)',ar:'العزل (EIFS)'}],['scaf',{en:'Scaffolding',ar:'السقالات'}]];
  var cur='government',svf='all',T=AFL.t;
  function fromHash(){var h=(location.hash||'').slice(1);TABS.forEach(function(t){if(t[0]===h)cur=h})}
  fromHash();
  var tabs=document.getElementById('ptabs'),chips=document.getElementById('pchips');

  function controls(){
    tabs.innerHTML='<span class="ind" aria-hidden="true"></span>'+TABS.map(function(t){return '<button class="tab" role="tab" type="button" data-t="'+t[0]+'" aria-selected="'+(t[0]===cur)+'">'+T(t[2])+'<span class="c">'+PROJECTS.filter(function(p){return p.s===t[1]}).length+'</span></button>'}).join('');
    document.getElementById('svlabel').textContent=T({en:'Service',ar:'الخدمة'});
    chips.innerHTML=C.map(function(c){return '<button class="chip" type="button" data-s="'+c[0]+'" aria-pressed="'+(c[0]===svf)+'">'+T(c[1])+'</button>'}).join('');
    requestAnimationFrame(function(){AFL.tabInd(tabs)});
  }
  function list(instant){
    var sec=TABS.filter(function(t){return t[0]===cur})[0][1];
    var L=PROJECTS.filter(function(p){return p.s===sec&&(svf==='all'||p.sv.indexOf(svf)>-1)}).sort(function(a,b){return b.y-a.y||(b.a||0)-(a.a||0)});
    var yrs=L.map(function(p){return p.y});
    document.getElementById('psum').innerHTML=
      '<div><b data-count="'+L.length+'">'+L.length+'</b><span>'+T({en:'projects',ar:'مشروعًا'})+'</span></div>'+
      '<div><b><bdi dir="ltr" data-count="'+Math.round(totalArea(L))+'">'+Math.round(totalArea(L)).toLocaleString('en-US')+'</bdi></b><span>'+T({en:'m² insulated',ar:'م² معزولة'})+'</span></div>'+
      '<div><b><bdi dir="ltr">'+(yrs.length?Math.min.apply(0,yrs)+'–'+Math.max.apply(0,yrs):'—')+'</bdi></b><span>'+T({en:'years',ar:'السنوات'})+'</span></div>';
    var withP=L.filter(function(p){return p.ph&&p.ph.length}),noP=L.filter(function(p){return !(p.ph&&p.ph.length)});
    document.getElementById('pgrid').innerHTML=withP.length?withP.map(regRow).join(''):'<p class="note" style="padding:24px 0">'+T({en:'No projects with photos match this filter. Choose All to see every project in this sector.',ar:'لا توجد مشاريع بصور تطابق هذا الاختيار. اختر «الكل» لعرض كل مشاريع هذا القطاع.'})+'</p>';
    var more=document.getElementById('pmore');
    if(noP.length){var H={p:T({en:'Project',ar:'المشروع'}),l:T({en:'Location',ar:'الموقع'}),y:T({en:'Year',ar:'السنة'}),a:T({en:'Area',ar:'المساحة'}),c:T({en:'Client',ar:'العميل'})};
      more.innerHTML='<h3 class="h3 more-h">'+T({en:'Also completed',ar:'مشاريع منجزة أخرى'})+'</h3><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>'+H.p+'</th><th>'+H.l+'</th><th>'+H.y+'</th><th>'+H.a+'</th><th>'+H.c+'</th></tr></thead><tbody>'+
        noP.map(function(p){return '<tr><td data-label="'+H.p+'"><b>'+T(p)+'</b></td><td data-label="'+H.l+'">'+T(p.loc)+'</td><td data-label="'+H.y+'" class="mono">'+p.y+'</td><td data-label="'+H.a+'" class="mono"><bdi dir="ltr">'+fmtA(p.a)+'</bdi></td><td data-label="'+H.c+'">'+(p.cl?T(p.cl):'—')+'</td></tr>'}).join('')+'</tbody></table></div>';
    }else more.innerHTML='';
    var grid=document.getElementById('pgrid');grid.setAttribute('data-stagger','60');
    if(instant===true)document.querySelectorAll('.reg-wrap [data-rv]').forEach(function(el){el.__w=1;el.classList.add('in')});
    AFL.reveal(document.querySelector('.reg-wrap'));
    document.querySelectorAll('#psum [data-count]').forEach(function(el){el.__c=0;AFL.count(el)});
  }
  function paint(){controls();list()}
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-t]'),s=e.target.closest('[data-s]');
    if(t){cur=t.getAttribute('data-t');try{history.replaceState(null,'','#'+cur)}catch(x){}
      tabs.querySelectorAll('.tab').forEach(function(b){b.setAttribute('aria-selected',b===t)});AFL.tabInd(tabs);AFL.swap(function(){list(true)})}
    if(s){svf=s.getAttribute('data-s');chips.querySelectorAll('.chip').forEach(function(b){b.setAttribute('aria-pressed',b===s)});AFL.swap(function(){list(true)})}
  });
  window.addEventListener('hashchange',function(){fromHash();paint()});
  window.addEventListener('resize',function(){AFL.tabInd(tabs)});
  AFL.subs.push(paint);paint();
});
