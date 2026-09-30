
const PRODUCTS = [
  {
    id:"wash", name:"Toleriane Caring Wash", brand:"La Roche-Posay", role:"Limpieza suave",
    tags:["piel sensible","sin perfume","noche"],
    purpose:"Retira suciedad, sudor, restos de protector solar y productos del día sin plantear una limpieza agresiva.",
    when:"Principalmente por la noche. Por la mañana, si amaneces cómodo, puedes usar solo agua tibia.",
    amount:"1 pulsación o una pequeña cantidad",
    how:"Masajear suavemente sobre el rostro húmedo durante unos segundos, aclarar con agua tibia y secar a toques.",
    expect:"Piel limpia sin sensación marcada de tirantez. Si escuece, reseca o empeora la rojez, conviene reducir frecuencia."
  },
  {
    id:"sensitive", name:"Toleriane Sensitive Fluide", brand:"La Roche-Posay", role:"Hidratación y barrera",
    tags:["hidratación","barrera","mañana/noche"],
    purpose:"Aporta hidratación ligera y ayuda a mantener la barrera cutánea. Es tu hidratante base.",
    when:"Cada noche. También por la mañana si notas que tu piel necesita hidratación adicional.",
    amount:"1–2 pulsaciones, capa fina",
    how:"Aplicar sobre piel seca o ligeramente húmeda. No hace falta esperar un tiempo exacto antes del siguiente paso.",
    expect:"Menos tirantez y una piel más confortable. La mejora visual por hidratación puede notarse antes que cambios en rojeces."
  },
  {
    id:"rosaliac", name:"Toleriane Rosaliac AR SPF 30", brand:"La Roche-Posay", role:"Rojeces + SPF 30",
    tags:["rojeces","piel sensible","SPF 30"],
    purpose:"Hidratante diaria enfocada a piel con tendencia a rojeces y con fotoprotección SPF 30.",
    when:"Por la mañana, especialmente en días de exposición cotidiana baja o moderada.",
    amount:"Cantidad generosa y uniforme para rostro",
    how:"Aplicar como último paso si va a ser tu fotoprotector del día. Si necesitas SPF 50, usa este producto como hidratante y termina con SPF 50.",
    expect:"Más confort y aspecto más uniforme si parte de la rojez depende de irritación/sequedad. No diagnostica ni trata por sí sola una rosácea."
  },
  {
    id:"cerave", name:"Facial Moisturising Lotion AM SPF 50", brand:"CeraVe", role:"Hidratación + SPF 50",
    tags:["SPF 50","hidratación","muestra"],
    purpose:"Combina hidratación y protección solar alta en un solo paso.",
    when:"Mañana, sobre todo si vas a estar al exterior. Puede sustituir a otra hidratante diurna si te resulta suficiente.",
    amount:"Cantidad generosa para cubrir cara, orejas y cuello expuesto",
    how:"Aplicar de manera uniforme antes de salir. Reaplicar cuando la exposición sea prolongada, tras sudar, nadar o secarte.",
    expect:"Protección frente a radiación UV y apoyo preventivo frente al fotoenvejecimiento. La protección depende de aplicar cantidad suficiente y reaplicar."
  },
  {
    id:"isdin", name:"Fotoprotector Invisible Stick SPF 50", brand:"ISDIN", role:"Refuerzo y reaplicación",
    tags:["SPF 50","stick","playa"],
    purpose:"Muy útil para reforzar y reaplicar protección en zonas concretas: nariz, pómulos, orejas, contorno facial o áreas especialmente expuestas.",
    when:"Exterior, playa, deporte o reaplicaciones durante el día.",
    amount:"Varias pasadas uniformes sobre la zona",
    how:"Pasar el stick de forma generosa y homogénea. No lo usaría como único protector facial de playa si puedes usar un SPF 50 de cobertura completa.",
    expect:"Facilita la reaplicación y reduce la probabilidad de dejar sin proteger zonas de alto riesgo de quemadura."
  }
];

const defaultState = {
  settings:{morning:"08:00",night:"22:30",outside:true},
  days:{},
  beach:{},
  checkins:[],
  photos:[]
};

let state = loadState();
let activeView = "hoy";
let photoDataPending = null;

function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem("skinCare01State"));
    return mergeDeep(structuredClone(defaultState), s || {});
  }catch(e){ return structuredClone(defaultState); }
}
function mergeDeep(target, src){
  for(const k in src){
    if(src[k] && typeof src[k] === "object" && !Array.isArray(src[k])){
      target[k] = mergeDeep(target[k] || {}, src[k]);
    }else target[k] = src[k];
  }
  return target;
}
function saveState(){ localStorage.setItem("skinCare01State",JSON.stringify(state)); renderAll(); }
function dateKey(d=new Date()){ return d.toISOString().slice(0,10); }
function fmtDate(d=new Date()){ return new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"}).format(d); }
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function getDay(key=dateKey()){
  if(!state.days[key]) state.days[key]={am:{wash:false,rosaliac:false,spf:false},pm:{wash:false,sensitive:false}};
  return state.days[key];
}
function todayCompletion(){
  const d=getDay(), vals=[d.am.wash,d.am.rosaliac,d.am.spf,d.pm.wash,d.pm.sensitive];
  return Math.round(vals.filter(Boolean).length/vals.length*100);
}
function streak(){
  let count=0, best=0, cur=0;
  const keys=Object.keys(state.days).sort();
  keys.forEach(k=>{
    const d=state.days[k], vals=[d.am?.wash,d.am?.rosaliac,d.am?.spf,d.pm?.wash,d.pm?.sensitive];
    const ok=vals.filter(Boolean).length>=4;
    if(ok){cur++;best=Math.max(best,cur)} else cur=0;
  });
  let dt=new Date();
  while(true){
    const k=dateKey(dt), d=state.days[k];
    if(!d) break;
    const vals=[d.am?.wash,d.am?.rosaliac,d.am?.spf,d.pm?.wash,d.pm?.sensitive];
    if(vals.filter(Boolean).length>=4){count++;dt.setDate(dt.getDate()-1)} else break;
  }
  return {current:count,best};
}
function setView(view){
  activeView=view;
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+view).classList.add("active");
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const titles={hoy:"Tu rutina de hoy",rutina:"Rutinas paso a paso",productos:"Tus productos",objetivo:"Objetivo de Skin Care 01",progreso:"Progreso y constancia",playa:"Modo sol y playa"};
  document.getElementById("viewTitle").textContent=titles[view];
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderToday(){
  const d=getDay(), pct=todayCompletion(), s=streak();
  const amDone=[d.am.wash,d.am.rosaliac,d.am.spf].filter(Boolean).length;
  const pmDone=[d.pm.wash,d.pm.sensitive].filter(Boolean).length;
  document.getElementById("view-hoy").innerHTML=`
    <div class="card hero">
      <div>
        <div class="eyebrow">Skin Care 01 · fase base</div>
        <h3>Menos rojez. Más hidratación. Mejor protección.</h3>
        <p>La meta de esta primera fase es hacer tu piel más estable y confortable y reducir el daño solar acumulativo. Lo que más importa ahora no es añadir productos: es cumplir la rutina.</p>
        <div class="metric-row">
          <div class="metric"><div class="num">${pct}%</div><div class="label">completado hoy</div></div>
          <div class="metric"><div class="num">${s.current}</div><div class="label">racha actual</div></div>
          <div class="metric"><div class="num">${s.best}</div><div class="label">mejor racha</div></div>
          <div class="metric"><div class="num">${state.photos.length}</div><div class="label">fotos progreso</div></div>
        </div>
      </div>
      <div class="hero-visual"><div class="skin-orb"></div></div>
    </div>

    <div class="section-title"><div><h3>Hoy</h3><p>${cap(fmtDate())}</p></div><button class="secondary-btn" onclick="document.getElementById('whatNowBtn').click()">¿Qué me toca ahora?</button></div>

    <div class="grid two">
      ${routineBlock("am","☀️ Mañana",state.settings.morning,[
        ["wash","Aclarar / limpieza suave","Agua tibia; limpiador solo si lo necesitas","opcional"],
        ["rosaliac","Toleriane Rosaliac AR SPF 30","Hidratación + foco en rojeces","base"],
        ["spf","SPF 50 si vas al exterior","CeraVe SPF 50 u otro protector de cobertura completa","protección"]
      ],amDone,3)}
      ${routineBlock("pm","🌙 Noche",state.settings.night,[
        ["wash","Toleriane Caring Wash","Retira protector, sudor y suciedad","limpieza"],
        ["sensitive","Toleriane Sensitive Fluide","1–2 pulsaciones, capa fina","hidratación"]
      ],pmDone,2)}
    </div>

    <div class="section-title"><div><h3>Regla de hoy</h3><p>Hazlo fácil para poder repetirlo.</p></div></div>
    <div class="grid three">
      <div class="card"><h3>💧 Hidrata</h3><p>Buscamos menos tirantez y una barrera más estable. No necesitas que la piel quede “empapada”.</p></div>
      <div class="card"><h3>🛡️ Protege</h3><p>La fotoprotección diaria es tu principal herramienta preventiva frente a fotoenvejecimiento.</p></div>
      <div class="card"><h3>🧪 No sobrecargues</h3><p>Durante esta fase no añadimos retinoides, exfoliantes o varios sérums a la vez. Primero, tolerancia y constancia.</p></div>
    </div>
    <p class="footer-note">Esta app organiza tu rutina y seguimiento; no sustituye una valoración dermatológica. Si aparece ardor persistente, empeora claramente la rojez, hay lesiones nuevas o síntomas oculares, conviene valoración profesional.</p>
  `;
  bindRoutineChecks();
}
function routineBlock(period,title,time,steps,done,total){
  const pct=Math.round(done/total*100);
  return `<div class="card routine-card">
    <div class="routine-head"><div><h3>${title}</h3><p class="small muted">${done}/${total} pasos completados</p><div class="progress-bar"><i style="width:${pct}%"></i></div></div><div class="time">≈ ${time}</div></div>
    <div class="steps">${steps.map(([id,t,desc,tag])=>`
      <label class="step">
        <input class="check routine-check" type="checkbox" data-period="${period}" data-step="${id}" ${getDay()[period][id]?"checked":""}>
        <div><div class="step-title">${t}</div><div class="step-desc">${desc}</div></div>
        <span class="step-tag">${tag}</span>
      </label>`).join("")}</div></div>`;
}
function bindRoutineChecks(){
  document.querySelectorAll(".routine-check").forEach(el=>el.addEventListener("change",e=>{
    const d=getDay(); d[e.target.dataset.period][e.target.dataset.step]=e.target.checked; saveState();
  }));
}

function renderRoutine(){
  document.getElementById("view-rutina").innerHTML=`
    <div class="grid two">
      <div class="card">
        <div class="product-kicker">Rutina AM · ≈ ${state.settings.morning}</div>
        <h3>☀️ Mañana</h3>
        <div class="timeline">
          <div class="phase"><strong>1 · Limpiar</strong><p>Agua tibia o Toleriane Caring Wash si lo necesitas. Nada de frotar.</p></div>
          <div class="phase"><strong>2 · Hidratar</strong><p>Rosaliac AR SPF 30 si quieres centrar el día en rojeces; Sensitive Fluide si prefieres hidratación simple.</p></div>
          <div class="phase"><strong>3 · Proteger</strong><p>SPF 50 cuando vayas a estar al exterior. La cantidad y reaplicación importan.</p></div>
        </div>
        <div class="info">No necesitas usar Rosaliac + Sensitive Fluide + CeraVe a la vez. Mantén el menor número de capas que deje tu piel cómoda.</div>
      </div>
      <div class="card">
        <div class="product-kicker">Rutina PM · ≈ ${state.settings.night}</div>
        <h3>🌙 Noche</h3>
        <div class="timeline" style="grid-template-columns:1fr 1fr">
          <div class="phase"><strong>1 · Limpieza</strong><p>Toleriane Caring Wash. Masaje corto, agua tibia y secado a toques.</p></div>
          <div class="phase"><strong>2 · Hidratación</strong><p>Toleriane Sensitive Fluide, 1–2 pulsaciones. No necesitas un tiempo de espera exacto.</p></div>
        </div>
        <div class="info">Si una noche notas la piel especialmente sensible, prioriza suavidad: limpieza breve + hidratante y nada más.</div>
      </div>
    </div>
    <div class="section-title"><div><h3>Qué espero conseguir</h3><p>Expectativas realistas por fases.</p></div></div>
    <div class="timeline">
      <div class="phase"><strong>Primeros días</strong><p>Más confort e hidratación. La piel puede verse algo menos apagada simplemente por estar mejor hidratada.</p></div>
      <div class="phase"><strong>4–6 semanas</strong><p>Si la rutina te sienta bien: barrera más estable, menos tirantez y posiblemente menos rojez reactiva.</p></div>
      <div class="phase"><strong>2–3 meses</strong><p>Más uniformidad y constancia en el aspecto general. El beneficio antiedad principal de esta fase es preventivo gracias al SPF.</p></div>
    </div>
    <div class="alert" style="margin-top:16px"><b>No prometemos “rejuvenecer” la cara.</b> La hidratación puede suavizar visualmente líneas finas por sequedad, mientras que la fotoprotección reduce daño UV futuro. Cambios estructurales importantes requieren otras estrategias.</div>
  `;
}
function renderProducts(){
  document.getElementById("view-productos").innerHTML=`
    <div class="card">
      <div class="gallery">
        <img src="assets/productos-principales.jpeg" alt="Productos principales de Skin Care 01">
        <img src="assets/muestras-y-stick.jpeg" alt="Muestras y stick solar">
      </div>
      <p class="small muted">Tu kit actual. Las muestras de CeraVe pueden agotarse pronto; la estructura de la rutina seguirá funcionando aunque cambies el fotoprotector.</p>
    </div>
    <div class="section-title"><div><h3>Fichas de producto</h3><p>Qué hace cada uno y cómo encaja en la rutina.</p></div></div>
    <div class="product-grid">
      ${PRODUCTS.map(p=>`
        <article class="card product-card">
          <div class="product-kicker">${p.brand}</div>
          <h3>${p.name}</h3>
          <p><strong>${p.role}</strong></p>
          <div class="pills">${p.tags.map(t=>`<span class="pill">${t}</span>`).join("")}</div>
          <p>${p.purpose}</p>
          <div class="product-details">
            <div class="mini"><b>CUÁNDO</b><span>${p.when}</span></div>
            <div class="mini"><b>CANTIDAD</b><span>${p.amount}</span></div>
          </div>
          <details style="margin-top:14px"><summary>Cómo usarlo</summary><p class="small">${p.how}</p></details>
          <details><summary>Qué puedo esperar</summary><p class="small">${p.expect}</p></details>
        </article>`).join("")}
    </div>
  `;
}
function renderObjective(){
  document.getElementById("view-objetivo").innerHTML=`
    <div class="card">
      <div class="eyebrow">Objetivo principal</div>
      <h3 style="font-size:clamp(28px,4vw,44px);letter-spacing:-.04em">Una piel más calmada, hidratada, uniforme y protegida.</h3>
      <p>Reducir rojez reactiva y aspecto de cansancio, mejorar hidratación y barrera cutánea, y disminuir el daño solar acumulativo que contribuye al envejecimiento visible.</p>
      <img class="objective-image" src="assets/objetivo-evolucion.png" alt="Representación visual orientativa de evolución posible">
      <div class="alert" style="margin-top:14px">La imagen es una <b>simulación visual orientativa</b>, no una predicción. La evolución real depende de tu piel, exposición solar, constancia, sueño, irritantes y otros factores.</div>
    </div>

    <div class="section-title"><div><h3>Mis 5 objetivos</h3><p>Lo que sí quiero mejorar.</p></div></div>
    <div class="goal-list">
      <div class="goal-item">🔴<b>Menos rojez</b><span>Menos episodios de piel reactiva y un tono visualmente más uniforme.</span></div>
      <div class="goal-item">💧<b>Más hidratación</b><span>Menos tirantez, textura más flexible y mejor aspecto superficial.</span></div>
      <div class="goal-item">✨<b>Menos aspecto cansado</b><span>Mejorar la apariencia apagada cuando depende de sequedad y falta de confort.</span></div>
      <div class="goal-item">🛡️<b>Prevención UV</b><span>Reducir exposición solar acumulada, una de las principales causas externas de fotoenvejecimiento.</span></div>
      <div class="goal-item">🧬<b>Envejecer mejor</b><span>Crear una base estable antes de valorar una fase 2 con activos antiedad.</span></div>
    </div>

    <div class="section-title"><div><h3>Punto de partida</h3><p>Tu fotografía base para comparar con el tiempo.</p></div></div>
    <div class="grid two">
      <div class="card"><img class="objective-image" src="assets/punto-de-partida.jpeg" alt="Punto de partida"></div>
      <div class="card">
        <h3>Cómo comparar bien</h3>
        <p>Haz nuevas fotos cada 7 días aproximadamente, con la misma iluminación, distancia y cámara, sin filtro y antes de aplicar productos. Eso hace que la comparación tenga mucho más valor que una selfie diaria.</p>
        <div class="info">No hace falta buscar cambios semana a semana. Lo importante es detectar tendencias a 4–6 y 8–12 semanas.</div>
      </div>
    </div>
  `;
}
function last7(){
  const arr=[];
  const today=new Date();
  for(let i=6;i>=0;i--){ const d=new Date(today); d.setDate(today.getDate()-i); arr.push(d); }
  return arr;
}
function dayDone(k,period){
  const d=state.days[k]; if(!d) return false;
  const vals=period==="am"?[d.am?.wash,d.am?.rosaliac,d.am?.spf]:[d.pm?.wash,d.pm?.sensitive];
  return vals.filter(Boolean).length >= (period==="am"?2:2);
}
function renderProgress(){
  const week=last7(), s=streak();
  const check=state.checkins[state.checkins.length-1] || {redness:3,hydration:3,fatigue:3,irritation:2};
  document.getElementById("view-progreso").innerHTML=`
    <div class="grid two">
      <div class="card">
        <h3>Constancia semanal</h3>
        <p>Cuenta como rutina AM válida si completas al menos 2 pasos; PM, los 2 pasos.</p>
        <div class="week">
          <div></div>${week.map(d=>`<div class="day">${["D","L","M","X","J","V","S"][d.getDay()]}</div>`).join("")}
          <div class="label">Mañana</div>${week.map(d=>`<div class="dot-check ${dayDone(dateKey(d),"am")?"done":""}">${dayDone(dateKey(d),"am")?"✓":"·"}</div>`).join("")}
          <div class="label">Noche</div>${week.map(d=>`<div class="dot-check ${dayDone(dateKey(d),"pm")?"done":""}">${dayDone(dateKey(d),"pm")?"✓":"·"}</div>`).join("")}
        </div>
      </div>
      <div class="card">
        <h3>Rachas</h3>
        <div class="streak-box"><div class="streak-emoji">🔥</div><div><div class="streak-num">${s.current}</div><div class="small muted">días de racha actual</div></div></div>
        <p>Mejor racha registrada: <b>${s.best} días</b>. El objetivo no es perfección; es que fallar un día no se convierta en abandonar una semana.</p>
      </div>
    </div>

    <div class="section-title"><div><h3>Check-in de piel</h3><p>1 = poco / 5 = mucho. En hidratación, 5 = muy hidratada.</p></div><button class="secondary-btn" id="saveCheckinBtn">Guardar check-in de hoy</button></div>
    <div class="card">
      <div class="slider-grid">
        ${slider("redness","Rojeces",check.redness)}
        ${slider("hydration","Hidratación",check.hydration)}
        ${slider("fatigue","Aspecto cansado",check.fatigue)}
        ${slider("irritation","Irritación",check.irritation)}
      </div>
    </div>

    <div class="section-title"><div><h3>Fotos de progreso</h3><p>Una vez por semana es suficiente.</p></div><button class="primary-btn" id="addPhotoBtn">+ Añadir foto</button></div>
    <div class="photo-strip">
      ${state.photos.length?state.photos.slice().reverse().map((p,i)=>`
        <div class="photo-card">
          <img src="${p.data}" alt="Foto de progreso">
          <div class="meta"><b>${p.date}</b><p>${escapeHtml(p.note||"Sin nota")}</p><button class="delete-photo" data-photo-id="${p.id}">Eliminar</button></div>
        </div>`).join(""):`<div class="card"><p>Aún no has añadido fotos. Usa una foto semanal con condiciones parecidas.</p></div>`}
    </div>
  `;
  document.getElementById("saveCheckinBtn").onclick=()=>{
    const obj={date:dateKey(),redness:+document.getElementById("s-redness").value,hydration:+document.getElementById("s-hydration").value,fatigue:+document.getElementById("s-fatigue").value,irritation:+document.getElementById("s-irritation").value};
    const idx=state.checkins.findIndex(x=>x.date===obj.date); if(idx>=0) state.checkins[idx]=obj; else state.checkins.push(obj); saveState();
  };
  document.getElementById("addPhotoBtn").onclick=()=>document.getElementById("photoDialog").showModal();
  document.querySelectorAll(".skin-slider").forEach(s=>s.oninput=()=>document.querySelector(`[data-value="${s.id}"]`).textContent=s.value);
  document.querySelectorAll(".delete-photo").forEach(b=>b.onclick=()=>{state.photos=state.photos.filter(p=>p.id!==b.dataset.photoId); saveState();});
}
function slider(id,label,val){
  return `<div class="slider-card"><label for="s-${id}">${label}</label><input class="skin-slider" id="s-${id}" type="range" min="1" max="5" value="${val}"><div class="slider-value" data-value="s-${id}">${val}</div></div>`
}
function renderBeach(){
  const k=dateKey(); if(!state.beach[k]) state.beach[k]={before:false,spf:false,stick:false,reapply:false,afterwash:false,afterhydrate:false};
  const b=state.beach[k];
  const item=(id,t,d)=>`<label class="step"><input class="check beach-check" type="checkbox" data-step="${id}" ${b[id]?"checked":""}><div><div class="step-title">${t}</div><div class="step-desc">${d}</div></div></label>`;
  document.getElementById("view-playa").innerHTML=`
    <div class="card beach-banner">
      <div><div class="eyebrow">Modo especial</div><h3 style="font-size:36px">🏖️ Día de playa / sol intenso</h3><p>El stick de ISDIN es perfecto para refuerzos y reaplicaciones, pero para una jornada de playa conviene empezar con un SPF 50 de cobertura completa en cara, orejas y cuello.</p></div>
      <div class="beach-icon">☀️</div>
    </div>

    <div class="grid three" style="margin-top:18px">
      <div class="card routine-card"><div class="routine-head"><div><h3>Antes de salir</h3><p class="small muted">Preparación</p></div></div><div class="steps">
        ${item("before","Hidratación si la necesitas","No añadas capas solo por añadirlas.")}
        ${item("spf","SPF 50 de cobertura completa","Cantidad generosa y uniforme.")}
        ${item("stick","ISDIN stick en zonas expuestas","Nariz, pómulos, orejas y puntos que quieras reforzar.")}
      </div></div>
      <div class="card routine-card"><div class="routine-head"><div><h3>Durante</h3><p class="small muted">Reaplicación</p></div></div><div class="steps">
        ${item("reapply","Reaplicar protección","Especialmente tras bañarte, sudar mucho o secarte con toalla.")}
      </div></div>
      <div class="card routine-card"><div class="routine-head"><div><h3>Al volver</h3><p class="small muted">Recuperación</p></div></div><div class="steps">
        ${item("afterwash","Limpieza suave","Retira protector, sal, sudor y suciedad.")}
        ${item("afterhydrate","Sensitive Fluide","Hidratación simple. Nada de exfoliar por sistema.")}
      </div></div>
    </div>
    <div class="alert" style="margin-top:16px"><b>En la playa:</b> además del protector, sombra, gorra/sombrero y evitar las horas de radiación más intensa reducen exposición acumulada. Ningún protector convierte el sol prolongado en exposición sin riesgo.</div>
  `;
  document.querySelectorAll(".beach-check").forEach(c=>c.onchange=e=>{state.beach[k][e.target.dataset.step]=e.target.checked;saveState();});
}
function renderAll(){
  document.getElementById("todayLabel").textContent=cap(fmtDate());
  renderToday(); renderRoutine(); renderProducts(); renderObjective(); renderProgress(); renderBeach(); setView(activeView);
}
function escapeHtml(str){return String(str).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}

document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.getElementById("settingsBtn").onclick=()=>{
  document.getElementById("morningTime").value=state.settings.morning;
  document.getElementById("nightTime").value=state.settings.night;
  document.getElementById("outsideDaily").checked=state.settings.outside;
  document.getElementById("settingsDialog").showModal();
};
document.getElementById("saveSettings").onclick=()=>{
  state.settings.morning=document.getElementById("morningTime").value||"08:00";
  state.settings.night=document.getElementById("nightTime").value||"22:30";
  state.settings.outside=document.getElementById("outsideDaily").checked;
  document.getElementById("settingsDialog").close(); saveState();
};
document.getElementById("whatNowBtn").onclick=()=>{
  const h=new Date().getHours(), d=getDay();
  let html=`<div class="eyebrow">Ahora mismo</div><h3>¿Qué me toca?</h3>`;
  if(h<12){
    const todo=[];
    if(!d.am.wash) todo.push(["1","Aclarar / limpieza suave","No frotes."]);
    if(!d.am.rosaliac) todo.push(["2","Rosaliac AR SPF 30","Capa uniforme."]);
    if(!d.am.spf && state.settings.outside) todo.push(["3","SPF 50","Especialmente si vas a salir."]);
    html += todo.length?todo.map(x=>`<div class="what-card"><b>${x[0]} · ${x[1]}</b><span class="small muted">${x[2]}</span></div>`).join(""):`<div class="info">Tu rutina de mañana ya está marcada como hecha.</div>`;
  }else if(h<19){
    html += `<div class="what-card"><b>☀️ Revisa tu exposición</b><span class="small muted">Si vas a estar al sol, valora reaplicar SPF 50. Si has sudado, nadado o te has secado, la reaplicación cobra todavía más importancia.</span></div>`;
  }else{
    const todo=[];
    if(!d.pm.wash) todo.push(["1","Toleriane Caring Wash","Limpieza breve y suave."]);
    if(!d.pm.sensitive) todo.push(["2","Toleriane Sensitive Fluide","1–2 pulsaciones."]);
    html += todo.length?todo.map(x=>`<div class="what-card"><b>${x[0]} · ${x[1]}</b><span class="small muted">${x[2]}</span></div>`).join(""):`<div class="info">Tu rutina de noche ya está marcada como hecha.</div>`;
  }
  document.getElementById("whatNowContent").innerHTML=html;
  document.getElementById("whatNowDialog").showModal();
};

document.getElementById("progressPhotoInput").addEventListener("change",e=>{
  const file=e.target.files?.[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const img=new Image();
    img.onload=()=>{
      const max=800, scale=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement("canvas"); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      photoDataPending=c.toDataURL("image/jpeg",.72);
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
});
document.getElementById("savePhotoBtn").onclick=()=>{
  if(!photoDataPending){alert("Selecciona una foto.");return;}
  state.photos.push({id:String(Date.now()),date:dateKey(),note:document.getElementById("progressPhotoNote").value.trim(),data:photoDataPending});
  if(state.photos.length>20) state.photos=state.photos.slice(-20);
  photoDataPending=null;document.getElementById("progressPhotoInput").value="";document.getElementById("progressPhotoNote").value="";
  document.getElementById("photoDialog").close(); saveState(); setView("progreso");
};

if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
renderAll();
