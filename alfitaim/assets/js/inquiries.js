/* Inquiries: request type tabs, scaffold quantity estimator, WhatsApp message builder. */
AFL_INIT=window.AFL_INIT||[];AFL_INIT.push(function(){
  var TY=[['insulation',{en:'Insulation quote',ar:'عرض سعر عزل'},'Insulation quote'],['scaffolding',{en:'Scaffolding',ar:'سقالات'},'Scaffolding'],['documents',{en:'Tender documents',ar:'مستندات المناقصات'},'Tender or prequalification documents']];
  var PH={insulation:{en:'Building type, wall area in m², location, drawings available',ar:'نوع المبنى ومساحة الجدران بالمتر المربع والموقع والمخططات المتوفرة'},scaffolding:{en:'Quantities or wall size, duration, delivery location',ar:'الكميات أو أبعاد الجدار والمدة وموقع التسليم'},documents:{en:'Tender name, which documents you need and the deadline',ar:'اسم المناقصة والمستندات المطلوبة والموعد النهائي'}};
  var cur='insulation',estText='',tabs=document.getElementById('itabs');
  function fromHash(){var h=(location.hash||'').slice(1);TY.forEach(function(t){if(t[0]===h)cur=h})}
  fromHash();window.addEventListener('hashchange',function(){fromHash();paint()});
  function paint(){
    tabs.innerHTML='<span class="ind" aria-hidden="true"></span>'+TY.map(function(t){return '<button class="tab" role="tab" type="button" data-i="'+t[0]+'" aria-selected="'+(t[0]===cur)+'">'+AFL.t(t[1])+'</button>'}).join('');
    requestAnimationFrame(function(){AFL.tabInd(tabs)});
    document.getElementById('subwrap').hidden=cur!=='scaffolding';document.getElementById('estp').hidden=cur!=='scaffolding';
    var dt=document.getElementById('dt');dt.setAttribute('data-ph-en',PH[cur].en);dt.setAttribute('data-ph-ar',PH[cur].ar);dt.placeholder=PH[cur][AFL.lang];
    est();
  }
  function est(){
    var L=+document.getElementById('el').value||20,H=+document.getElementById('eh').value||9,W=+document.getElementById('ew').value||1.2;
    var bl=Math.ceil(L/2.5),bw=Math.max(1,Math.ceil(W/1.2)),lf=Math.ceil(H/2.0);
    var st=(bl+1)*(bw+1)*lf,lg=bl*(lf+1)*(bw+1)*2,bd=bl*Math.ceil(W/0.3),jk=(bl+1)*(bw+1);
    estText='Estimate for '+L+' m x '+H+' m x '+W+' m: standards '+st+', ledgers '+lg+', boards '+bd+', base jacks '+jk;
    var u=AFL.lang==='ar'?'قطعة':'pcs';
    document.getElementById('est').innerHTML=[[st,{en:'Standards',ar:'أعمدة'}],[lg,{en:'Ledgers',ar:'عوارض أفقية'}],[bd,{en:'Boards',ar:'ألواح'}],[jk,{en:'Base jacks',ar:'قواعد'}]].map(function(x){return '<div><b>'+x[0]+'</b><span>'+AFL.t(x[1])+' ('+u+')</span></div>'}).join('');
  }
  ['el','eh','ew'].forEach(function(i){document.getElementById(i).addEventListener('input',est)});
  document.getElementById('addest').addEventListener('click',function(){var d=document.getElementById('dt');d.value=(d.value?d.value+'\n':'')+estText;d.focus()});
  document.addEventListener('click',function(e){var t=e.target.closest('[data-i]');if(!t)return;cur=t.getAttribute('data-i');
    try{history.replaceState(null,'','#'+cur)}catch(x){}document.getElementById('res').classList.remove('show');paint()});
  window.addEventListener('resize',function(){AFL.tabInd(tabs)});
  document.getElementById('iform').addEventListener('submit',function(e){e.preventDefault();
    var ty=TY.filter(function(t){return t[0]===cur})[0][2],sub='';
    if(cur==='scaffolding'){var s=document.getElementById('sub');sub=' - '+s.options[s.selectedIndex].getAttribute('data-en')}
    var v=function(i){return document.getElementById(i).value.trim()};
    var nm=document.getElementById('nm'),ph=document.getElementById('ph'),err=document.getElementById('ferr');
    if(!v('nm')||!v('ph')){err.hidden=false;(v('nm')?ph:nm).focus();return}
    err.hidden=true;
    var m='AL-FATIEM ALARABI WEBSITE INQUIRY\nType: '+ty+sub+'\nName: '+v('nm')+'\nCompany: '+v('co')+'\nPhone: '+v('ph')+'\nLocation: '+v('loc')+'\nDetails: '+v('dt');
    document.getElementById('msg').textContent=m;document.getElementById('wa').href='https://wa.me/97333599360?text='+encodeURIComponent(m);
    document.getElementById('cpy').setAttribute('data-copy',m);
    var r=document.getElementById('res');r.classList.remove('show');void r.offsetWidth;r.classList.add('show');
    r.scrollIntoView({behavior:AFL.rm?'auto':'smooth',block:'nearest'});
  });
  AFL.subs.push(paint);paint();
});
