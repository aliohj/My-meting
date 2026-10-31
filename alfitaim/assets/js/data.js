/* Al-Fatiem Alarabi — shared data (projects register and the EIFS build-up).
   Figures come from the company's records and EWA certificates. */
var LAYERS=[
 {id:'sub',n:1,mm:'200',w:70,c:'--l-sub',en:'Substrate (wall)',ar:'الجدار (الركيزة)',
  de:'The existing concrete or block wall. We inspect it and clean it before any material goes on.',da:'الجدار القائم من الخرسانة أو البلوك. نفحصه وننظّفه قبل تركيب أي مادة.',mat:''},
 {id:'adh',n:2,mm:'5',w:20,c:'--l-adh',en:'Adhesive',ar:'مادة اللصق',
  de:'Bonds the insulation board to the wall.',da:'تثبّت لوح العزل على الجدار.',mat:'Plafixx 910 Adhesive & Base Coat (Plafixx Dry Mix Company W.L.L.)'},
 {id:'eps',n:3,mm:'55+',w:220,c:'--l-eps',en:'Insulation board (EPS)',ar:'لوح العزل (بوليسترين)',
  de:'Expanded polystyrene. The registered system is 55 mm minimum, with a thermal conductivity of 0.0382 W/m·K.',da:'بوليسترين ممدّد. النظام المسجّل بسماكة 55 مم كحد أدنى وموصلية حرارية 0.0382 واط/م·كلفن.',mat:'Bahrain Polystyrene Factory W.L.L. · 18.75 kg/m³'},
 {id:'dow',n:4,mm:'',w:0,c:'--l-line',en:'Mechanical fixing (dowels)',ar:'التثبيت الميكانيكي (مسامير التثبيت)',
  de:'Dowels pass through the board into the wall as a second fixing on top of the adhesive.',da:'مسامير تخترق اللوح إلى الجدار كتثبيت إضافي فوق مادة اللصق.',mat:'Tecfi S.p.A – Klimas sp. z o.o.'},
 {id:'mesh',n:5,mm:'',w:0,c:'--l-fin',en:'Glass-fibre mesh',ar:'شبك الألياف الزجاجية',
  de:'Reinforcing mesh set into the basecoat. It spreads stress and limits cracking.',da:'شبك تسليح يُدفن في طبقة الأساس. يوزّع الإجهاد ويحدّ من التشقق.',mat:'AL FATIEM EIFS PRO: Dakota Group S.a.S · AL FATIEM EIFS: Dr. Gunther Kast GmbH & Co / Valmiera Glass Group'},
 {id:'base',n:6,mm:'4',w:16,c:'--l-base',en:'Basecoat',ar:'طبقة الأساس',
  de:'The reinforced render layer that protects the board and takes the finish.',da:'طبقة اللياسة المسلّحة التي تحمي اللوح وتستقبل التشطيب.',mat:'Plafixx 910 Adhesive & Base Coat (Plafixx Dry Mix Company W.L.L.)'},
 {id:'pri',n:7,mm:'1',w:6,c:'--l-prim',en:'Primer',ar:'طبقة التأسيس',
  de:'Prepares the basecoat so the finish bonds evenly.',da:'تهيّئ طبقة الأساس ليلتصق التشطيب بشكل متجانس.',mat:''},
 {id:'fin',n:8,mm:'2',w:8,c:'--l-fin',en:'Decorative finish',ar:'التشطيب الزخرفي',
  de:'The colour and texture you see. It also weatherproofs the wall.',da:'اللون والملمس الظاهران. كما يحمي الجدار من العوامل الجوية.',mat:''}
];

var PROJECTS=[
 {id:'hunainiya',en:'Houses at Hunainiya',ar:'منازل الحنينية',y:2021,a:12210.09,s:'gov',loc:{en:'Hunainiya',ar:'الحنينية'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',chain:{en:'Main contractor: Al-Shaheen Construction EST · Sub-contractor: Saleh Abdulla Kameshki & Son B.S.C (C)',ar:'المقاول الرئيسي: الشاهين للإنشاءات · المقاول من الباطن: صالح عبدالله كميشكي وأولاده'},sv:['eifs'],ph:['hunainiya']},
 {id:'salman',en:'Salman City, Budaiya',ar:'مدينة سلمان، البديع',y:2022,a:15413.14,s:'gov',loc:{en:'Budaiya',ar:'البديع'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',chain:{en:'Main contractor: M.A.Y Al Mezeal Const. & Services · Sub-contractor: Aman Insulations And Chemicals',ar:'المقاول الرئيسي: م.أ.ي المزيل للإنشاءات والخدمات · المقاول من الباطن: أمان للعزل والكيماويات'},sv:['eifs'],ph:['salman']},
 {id:'naseemshow22',en:'Al-Naseem Show Villa',ar:'فيلا النسيم النموذجية',y:2022,a:2969,s:'gov',loc:{en:'Diyar Al Muharraq',ar:'ديار المحرق'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',sv:['eifs'],ph:[]},
 {id:'galali22',en:'Galali Housing Project',ar:'مشروع قلالي الإسكاني',y:2022,a:15082.9,s:'gov',loc:{en:'Galali',ar:'قلالي'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',sv:['eifs'],ph:[]},
 {id:'sitra',en:'East Sitra Housing Project',ar:'مشروع إسكان شرق سترة',y:2023,a:69725.68,s:'gov',loc:{en:'East Sitra',ar:'شرق سترة'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',chain:{en:'Main contractor: Aradous Contracting and Maintenance Co. W.L.L.',ar:'المقاول الرئيسي: أرادوس للمقاولات والصيانة'},sv:['eifs'],ph:['sitra-1','sitra-2','sitra-3']},
 {id:'wadi',en:'Wadi Al Sail, Hamad Town',ar:'وادي السيل، مدينة حمد',y:2023,a:66555.96,s:'gov',loc:{en:'Hamad Town',ar:'مدينة حمد'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',chain:{en:'Main contractor: Modern Insulation Technology Co. (MITCO)',ar:'المقاول الرئيسي: الشركة الحديثة لتقنية العزل (ميتكو)'},sv:['eifs'],ph:['wadi-1','wadi-2','wadi-3']},
 {id:'galali24',en:'Galali Housing Project, phase 2',ar:'مشروع قلالي الإسكاني، المرحلة 2',y:2024,a:6155.5,s:'gov',loc:{en:'Galali',ar:'قلالي'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',sv:['eifs'],ph:[]},
 {id:'eshp-n',en:'ESHP Phase 3, East Sitra',ar:'إسكان شرق سترة، المرحلة 3',y:2025,a:87338.13,s:'gov',loc:{en:'East Sitra',ar:'شرق سترة'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',chain:{en:'Main contractor: Al-Nasir Contracting W.L.L.',ar:'المقاول الرئيسي: الناصر للمقاولات'},sv:['eifs','scaf'],ph:['eshp-1','s-eshp']},
 {id:'eshp-a',en:'ESHP Phase 3, East Sitra (second package)',ar:'إسكان شرق سترة، المرحلة 3 (الحزمة الثانية)',y:2025,a:7559.7,s:'gov',loc:{en:'East Sitra',ar:'شرق سترة'},cl:{en:'Ministry of Housing',ar:'وزارة الإسكان'},cons:'MOH',chain:{en:'Main contractor: Aradous Contracting and Maintenance Co. W.L.L.',ar:'المقاول الرئيسي: أرادوس للمقاولات والصيانة'},sv:['eifs'],ph:['eshp-2','eshp-3']},

 {id:'kaanoo',en:'Kaanoo Villas, Janabiya',ar:'فلل كانو، الجنبية',y:2021,a:8572.82,s:'res',loc:{en:'Janabiya',ar:'الجنبية'},sv:['eifs'],ph:['kaanoo']},
 {id:'gas',en:'Bahrain Gas Villa, Hamala',ar:'فيلا بحرين للغاز، الحمّالة',y:2021,a:1501.42,s:'res',loc:{en:'Hamala',ar:'الحمّالة'},sv:['eifs'],ph:['gas-villa']},
 {id:'ali',en:'Ali Villa Project, Tubli',ar:'مشروع فيلا علي، توبلي',y:2022,a:667,s:'res',loc:{en:'Tubli',ar:'توبلي'},sv:['eifs'],ph:[]},
 {id:'naseemshow23',en:'Al-Naseem Show Villa, Diyar Al Muharraq',ar:'فيلا النسيم النموذجية، ديار المحرق',y:2023,a:14269,s:'res',loc:{en:'Diyar Al Muharraq',ar:'ديار المحرق'},cl:{en:'Diyar Al Muharraq',ar:'ديار المحرق'},sv:['eifs'],ph:['naseem-villa']},
 {id:'naseem3',en:'Al Naseem Project Phase 3',ar:'مشروع النسيم، المرحلة 3',y:2025,a:22811.17,s:'res',loc:{en:'Diyar Al Muharraq',ar:'ديار المحرق'},chain:{en:'Main contractor: Ahmed Omer Trading & Contracting Est. W.L.L.',ar:'المقاول الرئيسي: أحمد عمر للتجارة والمقاولات'},sv:['eifs','scaf'],ph:['naseem-1','naseem-2','s-naseem']},
 {id:'karzakkan',en:'Karzakkan Villa',ar:'فيلا كرزكان',y:2024,a:null,s:'res',loc:{en:'Karzakkan',ar:'كرزكان'},chain:{en:'Main contractor: Modern Insulation Technology Co. (MITCO)',ar:'المقاول الرئيسي: الشركة الحديثة لتقنية العزل (ميتكو)'},sv:['scaf'],ph:['s-karz']},

 {id:'sahel',en:'Al Sahel Hotel and Resort, Zallaq',ar:'فندق ومنتجع الساحل، الزلاق',y:2021,a:14893.34,s:'com',loc:{en:'Zallaq',ar:'الزلاق'},cl:{en:'Bahrain Mumtalakat and Sama Dubai',ar:'ممتلكات البحرين وسما دبي'},cons:'MSCEB',sv:['eifs'],ph:['sahel','sahel-model']},
 {id:'shops',en:'Shops and Offices, Diyar Al Muharraq',ar:'محلات ومكاتب، ديار المحرق',y:2021,a:609,s:'com',loc:{en:'Diyar Al Muharraq',ar:'ديار المحرق'},cl:{en:'Diyar Al Muharraq',ar:'ديار المحرق'},sv:['eifs'],ph:[]},
 {id:'mister',en:'Mister Machine office building',ar:'مبنى مكاتب ميستر ماشين',y:2023,a:521.97,s:'com',loc:{en:'Bahrain',ar:'البحرين'},cl:{en:'Mister Machine',ar:'ميستر ماشين'},sv:['eifs'],ph:[]},
 {id:'gufool',en:'Building renovation, Gufool',ar:'تجديد مبنى، القفول',y:2024,a:1650,s:'com',loc:{en:'Gufool, Manama',ar:'القفول، المنامة'},cl:{en:'Ali Reza & Sons W.L.L.',ar:'علي رضا وأولاده'},sv:['eifs','scaf'],ph:['s-gufool','s-gufool2']},
 {id:'hidd',en:'East Hidd buildings',ar:'مباني شرق الحد',y:2025,a:2652.29,s:'com',loc:{en:'East Hidd',ar:'شرق الحد'},cl:{en:'Modern Insulation Technology Co. (MITCO)',ar:'الشركة الحديثة لتقنية العزل (ميتكو)'},sv:['eifs','scaf'],ph:['s-hidd2','s-hidd']}
];


function fmtA(a){return a==null?'—':Math.round(a).toLocaleString('en-US')+(AFL.lang==='ar'?' م²':' m²')}
function totalArea(list){return list.reduce(function(s,p){return s+(p.a||0)},0)}
function layerFill(L){return L.id==='sub'?'url(#hatchP)':(L.id==='eps'?'url(#epsP)':'var('+({adh:'--l-adh',base:'--l-base',pri:'--l-pri',fin:'--sky'}[L.id]||'--ink')+')')}
function phPath(k){return k.indexOf('/')>-1?k:'img/'+k+'.webp'}

/* one row of the projects register */
function regRow(p){
  var tx=AFL.t(p),ph=p.ph||[],T=AFL.t;
  var th=ph.length
    ?'<button type="button" class="th" data-gal="'+ph.join(',')+'" data-cap="'+tx.replace(/"/g,'&quot;')+'" aria-label="'+T({en:'Photos: ',ar:'صور: '})+tx.replace(/"/g,'')+'"><img src="'+phPath(ph[0])+'" alt="" loading="lazy" decoding="async">'+(ph.length>1?'<span class="cnt">1/'+ph.length+'</span>':'')+'</button>'
    :'<span class="th none" aria-hidden="true">AF</span>';
  var svc=p.sv.map(function(s){return '<span class="tag '+s+'">'+(s==='eifs'?T({en:'Insulation',ar:'عزل'}):T({en:'Scaffolding',ar:'سقالات'}))+'</span>'}).join('');
  var cl=[];if(p.cl)cl.push(T(p.cl));if(p.cons)cl.push('<span>'+T({en:'Consultant',ar:'الاستشاري'})+': '+p.cons+'</span>');
  var chain=p.chain?'<p class="chain">'+T(p.chain)+'</p>':'';
  return '<article class="reg-row" data-rv'+(ph.length?' data-peek="'+phPath(ph[0])+'"':'')+'>'+th+
    '<div><h3>'+tx+'</h3><p class="sub">'+T(p.loc)+' · <bdi>'+p.y+'</bdi></p><div class="svc">'+svc+'</div>'+chain+'</div>'+
    '<div class="area">'+(p.a?'<bdi dir="ltr">'+fmtA(p.a)+'</bdi><small>'+T({en:'insulated area',ar:'المساحة المعزولة'})+'</small>':'<span class="muted">—</span>')+'</div>'+
    '<div class="cl">'+(cl.join('')||'<span>—</span>')+'</div></article>'}
