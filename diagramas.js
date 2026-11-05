/* Diagramas del juego: DFD (diagrama de flujo de datos) y DFP (diagrama de flujo de procesos,
   dibujado como en Bizagi con la notación BPMN). Los dos son minijuegos para CONSTRUIR el diagrama
   del caso del Pasaporte Verde, tal como funciona hoy (AS-IS).
   Este archivo se carga ANTES del script principal: aquí solo se definen datos y funciones.
   Las funciones del juego ($, tone, addXP, burst, shuffle...) se usan cuando el jugador ya está jugando. */

const DG=(()=>{
const INK='#14231B', GRIS='#5C6B62';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ---------- texto dentro de dibujos SVG ---------- */
// Parte un texto en líneas de máximo "max" letras.
function lineas(t,max){
  const out=[];let cur='';
  String(t).split(' ').forEach(w=>{const tr=cur?cur+' '+w:w;if(tr.length>max&&cur){out.push(cur);cur=w}else cur=tr});
  if(cur)out.push(cur);return out;
}
// Texto centrado en (x,y), con varias líneas.
function texto(x,y,t,max,size,extra){
  const L=lineas(t,max),h=size*1.16,y0=y-(L.length-1)*h/2;
  return `<text text-anchor="middle" dominant-baseline="central" font-size="${size}" ${extra||''}>${L.map((l,i)=>`<tspan x="${x}" y="${y0+i*h}">${esc(l)}</tspan>`).join('')}</text>`;
}
// Texto que empieza en yTop y baja (para las etiquetas de los eventos).
function textoDebajo(x,yTop,t,max,size,extra){
  const n=lineas(t,max).length;return texto(x,yTop+n*size*1.16/2,t,max,size,extra);
}

/* ---------- símbolos pequeños (para las tarjetas y las preguntas) ---------- */
const sv=c=>`<svg viewBox="0 0 120 70" role="img" aria-hidden="true">${c}</svg>`;
const SIM={
  // DFD
  ent:sv(`<rect x="18" y="14" width="84" height="42" fill="#fff" stroke="${INK}" stroke-width="3"/>`),
  pro:sv(`<circle cx="60" cy="35" r="27" fill="#DCEBF8" stroke="${INK}" stroke-width="3"/>`),
  alm:sv(`<rect x="18" y="19" width="84" height="32" fill="#FFF1C9"/><path d="M18 19H102M18 51H102" stroke="${INK}" stroke-width="3" fill="none"/>`),
  flu:sv(`<path d="M12 35H92" stroke="${INK}" stroke-width="3.5"/><path d="M90 25L110 35L90 45Z" fill="${INK}"/>`),
  // BPMN (Bizagi)
  ini:sv(`<circle cx="60" cy="35" r="21" fill="#DDF3E5" stroke="#1E8C4E" stroke-width="3"/>`),
  tar:sv(`<rect x="16" y="14" width="88" height="42" rx="11" fill="#FCE6D3" stroke="${INK}" stroke-width="3"/><circle cx="29" cy="25" r="3" fill="${GRIS}"/><path d="M23 35q6-8 12 0z" fill="${GRIS}"/>`),
  com:sv(`<path d="M60 8L94 35L60 62L26 35Z" fill="#FBF0C8" stroke="#B88600" stroke-width="3"/><path d="M50 25L70 45M70 25L50 45" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`),
  fin:sv(`<circle cx="60" cy="35" r="20" fill="#fff" stroke="#DA3832" stroke-width="7"/>`),
  seq:sv(`<path d="M12 35H92" stroke="${INK}" stroke-width="3.5"/><path d="M90 25L110 35L90 45Z" fill="${INK}"/>`),
  car:sv(`<rect x="12" y="10" width="96" height="50" fill="#FCE6D3" stroke="${INK}" stroke-width="3"/><rect x="12" y="10" width="22" height="50" fill="#D0661C" stroke="${INK}" stroke-width="3"/><path d="M44 28H98M44 42H80" stroke="${GRIS}" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 8"/>`)
};
// Bolita que viaja por una flecha: una vez cuando se dibuja, y sin parar al terminar el diagrama.
function paquete(d,nueva,fin,k){
  if(MOV_REDUCIDO()||!(nueva||fin))return '';
  const anim=fin?`<animateMotion dur="1.8s" begin="${(k*.22).toFixed(2)}s" repeatCount="indefinite" path="${d}"/>`
    :`<animateMotion dur=".75s" fill="freeze" path="${d}"/><animate attributeName="opacity" from="1" to="0" begin=".7s" dur=".35s" fill="freeze"/>`;
  return `<circle r="6" fill="#FFC23D" stroke="${INK}" stroke-width="2" pointer-events="none">${anim}</circle>`;
}
const simCard=(t,n,d,color)=>`<div class="simcard" style="--c:${color}">${SIM[t]}<b>${n}</b><span>${d}</span></div>`;

/* ---------- "jugo": sonidos, combos y celebraciones que enganchan ----------
   Cada acierto seguido sube el tono (como una escalera musical), cada error sacude,
   y cada paso superado tiene su propia fiesta. Se usa en los diagramas y en la matriz. */
const MOV_REDUCIDO=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const JUGO={
  // Sonido de acierto: entre más largo el combo, más agudo y brillante.
  chispa(n){
    if(!S.fx)return;const a=ac();if(!a)return;
    const base=440*Math.pow(2,Math.min(n,14)/12);let t=a.currentTime;
    [1,1.26,1.5,n>=3?2:0].forEach(m=>{if(!m)return;const o=a.createOscillator(),g=a.createGain();o.type=m===2?'sine':'triangle';o.frequency.value=base*m;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(m===2?.08:.14,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.12);
      o.connect(g).connect(a.destination);o.start(t);o.stop(t+.15);t+=.055});
  },
  // Sonido de error: corto y grave, y el celular vibra.
  error(){tone('bad');try{const u=navigator.userActivation;if(navigator.vibrate&&(!u||u.hasBeenActive))navigator.vibrate(60)}catch(e){}},
  // Cartel grande en el centro: "¡Paso superado!".
  cartel(txt,sub){
    $$('.dg-cartel').forEach(x=>x.remove());
    const d=document.createElement('div');d.className='dg-cartel';d.innerHTML=`<b>${txt}</b>${sub?`<span>${sub}</span>`:''}`;
    document.body.appendChild(d);tone('lvl');burst(45);setTimeout(()=>d.remove(),1700);
  },
  // Texto que sube desde un elemento (+puntos, combo).
  flota(el,txt,color){
    if(!el)return;const r=el.getBoundingClientRect(),f=document.createElement('div');
    f.className='dg-flota';f.textContent=txt;f.style.left=(r.left+r.width/2)+'px';f.style.top=(r.top)+'px';if(color)f.style.color=color;
    document.body.appendChild(f);setTimeout(()=>f.remove(),900);
  },
  // Sacudir un elemento.
  sacude(el){if(!el)return;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}
};

/* =====================================================================
   MOTOR COMÚN: tres momentos para construir un diagrama
   1) reconocer los símbolos  2) clasificar cada pieza  3) conectar las flechas
   Cada diagrama (DFD, BPMN) entrega sus datos y cómo dibujarse.
   ===================================================================== */
function motor(host,ctx,done,cfg){
  const est={fase:1,i:0,errs:0,hechos:[],vis:new Set(cfg.visiblesInicio||[]),sel:null,ultimo:null,nuevoNodo:null,msg:null,
    quiz:shuffle(cfg.simbolos),cls:shuffle(cfg.clasifica.items),combo:0,mejor:0,pts:0,seguidos:0,pista:false,ultimoEl:null};
  const nombres=shuffle(cfg.simbolos.map(s=>s.n));
  const total=cfg.simbolos.length+cfg.clasifica.items.length+cfg.flujos.length;
  host.innerHTML=`<div class="gtitle"><span class="eyebrow" style="color:var(--gold)">${cfg.eyebrow}</span><h3>${cfg.titulo}</h3><p class="dg-pista"></p></div>
    <div class="dg-marcador"><span class="dg-pts">⭐ 0</span><span class="dg-combo"></span></div>
    <div class="dg-prog" role="progressbar" aria-label="Avance del minijuego"><i></i></div>
    <div class="dg-lienzo" hidden></div><div class="dg-panel" aria-live="polite"></div>`;
  const lienzo=$('.dg-lienzo',host),panel=$('.dg-panel',host),pista=$('.dg-pista',host);
  const pistas=['','Paso 1 de 3: aprende los símbolos. ¿Cómo se llama cada uno?','Paso 2 de 3: '+cfg.clasifica.pista,'Paso 3 de 3: toca la pieza de donde sale la flecha y luego la pieza a donde llega.',cfg.cierre.pista];
  const nombre=id=>cfg.nombre(id);

  function marcador(){
    $('.dg-pts',host).textContent='⭐ '+est.pts;
    const c=$('.dg-combo',host);c.textContent=est.combo>=2?`🔥 Combo x${est.combo}`:'';
    c.classList.toggle('caliente',est.combo>=5);
    if(est.combo>=2){c.classList.remove('late');void c.offsetWidth;c.classList.add('late')}
  }
  // Acierto: suma puntos según el combo, suena más agudo y hace saltar el número.
  const acertar=t=>{
    est.combo++;est.mejor=Math.max(est.mejor,est.combo);est.seguidos=0;est.pista=false;
    const p=10+Math.min(est.combo,10)*2;est.pts+=p;est.msg={ok:true,t};
    JUGO.chispa(est.combo);addXP(3);JUGO.flota(est.ultimoEl,'+'+p);
    if(est.combo===5||est.combo===10)toast(est.combo===10?'¡Combo x10! Eres imparable 🔥':'¡Combo x5! Vas en racha 🔥');
    marcador();
  };
  // Error: rompe el combo; con dos errores seguidos aparece una pista que brilla.
  const fallar=t=>{
    est.msg={ok:false,t};est.errs++;est.seguidos++;est.combo=0;est.pista=est.seguidos>=2;
    JUGO.error();marcador();
  };

  function pintar(){
    const hecho=est.fase===1?est.i:est.fase===2?cfg.simbolos.length+est.i:est.fase===3?cfg.simbolos.length+cfg.clasifica.items.length+est.hechos.length:total;
    $('.dg-prog i',host).style.width=(hecho/total*100)+'%';
    pista.textContent=pistas[est.fase];
    // lienzo
    if(est.fase>=2){lienzo.hidden=false;lienzo.innerHTML=(cfg.paleta||'')+cfg.svg(est)+(cfg.extra?cfg.extra(est):'')}
    $$('[data-nodo]',lienzo).forEach(g=>{g.onclick=()=>{est.ultimoEl=g;tocar(g.dataset.nodo)};g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();est.ultimoEl=g;tocar(g.dataset.nodo)}}});
    $$('[data-opc]',lienzo).forEach(z=>z.onclick=()=>{est.ultimoEl=z;responder(z.dataset.opc)});
    // pista del paso 3: brilla la pieza de donde sale una flecha que falta
    if(est.fase===3&&est.pista&&!est.sel){const f=cfg.flujos.find(x=>!est.hechos.includes(x));const g=f&&$(`[data-nodo="${f.de}"]`,lienzo);if(g)g.classList.add('pista')}
    est.nuevoNodo=null;est.ultimo=null;
    pintarPanel();
  }
  function pintarPanel(){
    const msg=`<p class="dg-msg ${est.msg?(est.msg.ok?'good':'bad'):''}">${est.msg?est.msg.t:''}</p>`;
    if(est.fase===1){
      const s=est.quiz[est.i];
      panel.innerHTML=`<div class="dg-q">${s.svg}<small>Símbolo ${est.i+1} de ${est.quiz.length}</small><b>¿Cómo se llama?</b></div>
        <div class="dg-ops">${nombres.map(n=>`<button class="opt ${est.pista&&n===s.n?'pista':''}" data-n="${esc(n)}">${n}</button>`).join('')}</div>${msg}`;
      $$('[data-n]',panel).forEach(b=>b.onclick=()=>{est.ultimoEl=b;nombrar(b.dataset.n)});
    }else if(est.fase===2){
      const it=est.cls[est.i];
      panel.innerHTML=`<div class="dg-q"><small>${cfg.clasifica.pregunta} · ${est.i+1} de ${est.cls.length}</small><b>${it.t}</b>${it.det?`<em>${it.det}</em>`:''}</div>
        <div class="dg-ops">${cfg.clasifica.opciones.map(o=>`<button class="opt ${est.pista&&o.id===it.ok?'pista':''}" data-o="${o.id}">${o.ic?o.ic+' ':''}${o.n}</button>`).join('')}</div>${msg}`;
      $$('[data-o]',panel).forEach(b=>b.onclick=()=>{est.ultimoEl=b;responder(b.dataset.o)});
    }else if(est.fase===3){
      panel.innerHTML=`<div class="dg-q"><small>${cfg.flechas} ${est.hechos.length} de ${cfg.flujos.length}</small><b>${est.sel?'Sale de «'+nombre(est.sel)+'». ¿A dónde llega?':'¿De dónde sale la siguiente flecha?'}</b>${est.pista&&!est.sel?'<em>💡 Pista: empieza por la pieza que brilla.</em>':''}</div>${msg}`;
    }else{
      panel.classList.add('fin');   // al terminar, el panel deja de flotar para ver el diagrama completo
      panel.innerHTML=`<div class="dg-resumen"><span><b>⭐ ${est.pts}</b>puntos</span><span><b>🔥 x${est.mejor}</b>mejor combo</span><span><b>${est.errs===0?'💯':est.errs}</b>${est.errs===0?'sin errores':'errores'}</span></div>
        <div class="dg-fin">${cfg.cierre.html}</div><div class="act"><button class="btn" id="dgok">¡Listo! →</button></div>`;
      $('#dgok',panel).onclick=()=>{tone('tap');ctx.errors+=Math.min(3,Math.ceil(est.errs/4));done()};
    }
    if(est.msg&&!est.msg.ok)JUGO.sacude($('.dg-q',panel));
  }
  // Momento 1
  function nombrar(n){
    const s=est.quiz[est.i];
    if(n!==s.n){fallar(`No es «${n}». ${s.pista}`);return pintarPanel()}
    acertar(`${s.n}. ${s.por}`);est.i++;
    if(est.i>=est.quiz.length){est.fase=2;est.i=0;est.msg={ok:true,t:'¡Símbolos listos! Ahora vamos a armar el diagrama del caso.'};JUGO.cartel('¡Paso 1 superado!','Ya conoces los símbolos')}
    pintar();
  }
  // Momento 2
  function responder(opc){
    if(est.fase!==2)return;
    const it=est.cls[est.i];
    if(opc!==it.ok){fallar(cfg.clasifica.mal(it,opc));return pintarPanel()}
    est.vis.add(it.id);est.nuevoNodo=it.id;acertar(cfg.clasifica.bien(it));est.i++;
    if(est.i>=est.cls.length){est.fase=3;est.i=0;est.msg={ok:true,t:cfg.clasifica.fin};JUGO.cartel('¡Paso 2 superado!','Ahora conecta las flechas')}
    pintar();
  }
  // Momento 3
  function tocar(id){
    if(est.fase!==3)return;
    if(!est.sel){est.sel=id;tone('tap');return pintar()}
    if(est.sel===id){est.sel=null;return pintar()}
    const de=est.sel,a=id;est.sel=null;
    const f=cfg.flujos.find(x=>x.de===de&&x.a===a);
    if(!f){fallar(cfg.valida(de,a));return pintar()}
    if(est.hechos.includes(f)){est.msg={ok:false,t:'Esa flecha ya está dibujada.'};return pintar()}
    est.hechos.push(f);est.ultimo=f;
    acertar(cfg.explica(f));
    if(est.hechos.length>=cfg.flujos.length){est.fase=4;JUGO.cartel('¡Diagrama completo! 🎉',est.errs===0?'¡Sin un solo error!':'Mira cómo se mueve')}
    pintar();
  }
  pintar();
}

/* =====================================================================
   DFD · Diagrama de flujo de datos (nivel 1 del sistema de acreditación de origen)
   ===================================================================== */
const DFD={
  nodos:[
    {id:'prod',t:'Productor',tipo:'ent',x:70,y:70},
    {id:'reg',t:'Entidades de registro',det:'ICA · ANT · IGAC',tipo:'ent',x:370,y:70},
    {id:'p1',t:'Documentar el predio',tipo:'pro',x:220,y:200},
    {id:'p2',t:'Acopiar el producto',tipo:'pro',x:70,y:320},
    {id:'d1',t:'Documentos del predio',tipo:'alm',x:370,y:320},
    {id:'d2',t:'Registros de acopio',tipo:'alm',x:70,y:440},
    {id:'p3',t:'Acreditar el origen',tipo:'pro',x:220,y:440},
    {id:'p4',t:'Comercializar',tipo:'pro',x:220,y:570},
    {id:'comp',t:'Comprador',tipo:'ent',x:370,y:570}
  ],
  flujos:[
    {de:'prod',a:'p1',d:'Datos y documentos del predio',por:'El dato nace en el predio: el productor aporta lo que tiene.'},
    {de:'reg',a:'p1',d:'Registros sanitarios y de tierra',por:'El ICA, la ANT y el IGAC tienen registros del predio y su ganado.'},
    {de:'p1',a:'d1',d:'Carpeta del predio',por:'Lo que se reúne queda en carpetas y archivos dispersos.'},
    {de:'prod',a:'p2',d:'Producto cosechado',por:'El producto sale del predio hacia el acopio.'},
    {de:'p2',a:'d2',d:'Lote y volumen',por:'El acopio anota cuánto juntó, pero no de qué predio salió cada parte.'},
    {de:'d1',a:'p3',d:'Documentos del predio',por:'Para acreditar hay que ir a buscar los documentos guardados.'},
    {de:'d2',a:'p3',d:'Datos del lote',por:'Acreditar necesita saber qué lote es y cuánto trae.'},
    {de:'p3',a:'p4',d:'Evidencia de origen (incompleta)',por:'Es la salida que falla: la evidencia llega incompleta o no llega.'},
    {de:'comp',a:'p4',d:'Exigencia y pedido',por:'El comprador pide el producto y la prueba de su origen.'},
    {de:'p4',a:'comp',d:'Producto y evidencia',por:'Se entrega el producto con la evidencia que haya.'}
  ]
};
const DFD_TIPOS={ent:'una entidad externa',pro:'un proceso',alm:'un almacén de datos'};
const DFD_POR={
  ent:'Está FUERA del sistema: solo da o recibe datos.',
  pro:'Hace algo con los datos: lleva un verbo.',
  alm:'Es donde los datos quedan guardados: una carpeta, un archivo o un registro.'
};
const dfdNodo=id=>DFD.nodos.find(n=>n.id===id);
const R_PRO=48;
const dfdDentro=(n,p)=>{const dx=p.x-n.x,dy=p.y-n.y;return n.tipo==='pro'?Math.hypot(dx,dy)<=R_PRO+1:Math.abs(dx)<=59&&Math.abs(dy)<=(n.tipo==='ent'?30:25)};
// Puntos donde la flecha sale de una pieza y entra en la otra (con desvío si hay dos flechas entre las mismas piezas).
function dfdExtremos(A,B,off){
  const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||1,nx=-dy/d*off,ny=dx/d*off;
  const p0={x:A.x+nx,y:A.y+ny},p1={x:B.x+nx,y:B.y+ny};
  const pt=t=>({x:p0.x+(p1.x-p0.x)*t,y:p0.y+(p1.y-p0.y)*t});
  let t0=0,t1=1;
  for(let t=0;t<=1;t+=.004){if(!dfdDentro(A,pt(t))){t0=t;break}}
  for(let t=1;t>=0;t-=.004){if(!dfdDentro(B,pt(t))){t1=t;break}}
  return [pt(t0),pt(t1)];
}
function dfdForma(n,est){
  let f;
  if(n.tipo==='pro')f=`<circle class="marca" r="${R_PRO}" fill="#DCEBF8" stroke="${INK}" stroke-width="3"/>${texto(0,0,n.t,12,13,'font-weight="800"')}`;
  else if(n.tipo==='ent')f=`<rect class="marca" x="-58" y="-29" width="116" height="58" fill="#fff" stroke="${INK}" stroke-width="3"/>${texto(0,n.det?-7:0,n.t,15,12.5,'font-weight="800"')}${n.det?`<text y="17" text-anchor="middle" font-size="10" fill="${GRIS}">${esc(n.det)}</text>`:''}`;
  else f=`<rect x="-58" y="-24" width="116" height="48" fill="#FFF1C9"/><path class="marca" d="M-58 -24H58M-58 24H58" stroke="${INK}" stroke-width="3" fill="none"/>${texto(0,0,n.t,17,12.5,'font-weight="800"')}`;
  return `<g transform="translate(${n.x} ${n.y})"><g class="nodo ${est.sel===n.id?'seleccionado':''}" data-nodo="${n.id}" tabindex="0" role="button" aria-label="${esc(n.t)}"><g class="${est.nuevoNodo===n.id?'aparece':''}">${f}</g><rect x="-59" y="-50" width="118" height="100" fill="transparent"/></g></g>`;
}
function dfdSvg(est){
  const id='dgm'+Math.random().toString(36).slice(2,6);
  let flechas='',badges='',paquetes='';
  est.hechos.forEach((f,k)=>{
    const A=dfdNodo(f.de),B=dfdNodo(f.a),inv=DFD.flujos.some(g=>g.de===f.a&&g.a===f.de);
    const [p,q]=dfdExtremos(A,B,inv?(f.de<f.a?9:-9):0);
    const d=`M${p.x.toFixed(1)} ${p.y.toFixed(1)}L${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    flechas+=`<path d="${d}" pathLength="1" fill="none" stroke="${INK}" stroke-width="3" marker-end="url(#${id})" class="${f===est.ultimo?'nueva':''}"/>`;
    paquetes+=paquete(d,f===est.ultimo,est.fase===4,k);
    badges+=`<g transform="translate(${((p.x+q.x)/2).toFixed(1)} ${((p.y+q.y)/2).toFixed(1)})"><circle r="10.5" fill="#FFC23D" stroke="${INK}" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900">${k+1}</text></g>`;
  });
  return `<svg viewBox="0 0 440 640" fill="${INK}" role="img" aria-label="Diagrama de flujo de datos: ${est.hechos.length} flechas dibujadas de ${DFD.flujos.length}">
    <defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${INK}"/></marker></defs>
    ${flechas}${DFD.nodos.filter(n=>est.vis.has(n.id)).map(n=>dfdForma(n,est)).join('')}${badges}${paquetes}</svg>`;
}
function dfdLeyenda(est){
  if(!est.hechos.length)return '';
  return `<ol class="dg-leyenda">${est.hechos.map((f,k)=>`<li class="${f===est.ultimo?'nuevo':''}"><b>${k+1}</b><span>${dfdNodo(f.de).t} → ${dfdNodo(f.a).t}<small>Dato: <strong>${f.d}</strong></small></span></li>`).join('')}</ol>`;
}
function dfdValida(de,a){
  const A=dfdNodo(de),B=dfdNodo(a);
  if(A.tipo!=='pro'&&B.tipo!=='pro')return `«${A.t}» y «${B.t}» no se hablan directo: ${A.tipo===B.tipo?'dos '+({ent:'entidades',alm:'almacenes'}[A.tipo])+' nunca se conectan.':'una entidad nunca escribe ni lee un almacén directamente.'} Entre ellos tiene que haber un PROCESO.`;
  if(DFD.flujos.some(x=>x.de===a&&x.a===de))return 'La flecha va al revés. Piensa de dónde sale el dato y a dónde llega.';
  return `En este sistema no viaja un dato directo de «${A.t}» a «${B.t}». Piensa qué dato sale y a dónde llega.`;
}
const DFD_CFG={
  eyebrow:'Minijuego · Construye el DFD 🗺️',
  titulo:'Dibuja el flujo de datos del sistema',
  flechas:'Flechas',
  simbolos:[
    {n:'Entidad externa',svg:SIM.ent,por:'Rectángulo: quien da o recibe datos fuera del sistema.',pista:'Mira la forma: es un rectángulo cerrado.'},
    {n:'Proceso',svg:SIM.pro,por:'Círculo: transforma datos que entran en datos que salen.',pista:'Mira la forma: es un círculo.'},
    {n:'Almacén de datos',svg:SIM.alm,por:'Dos líneas paralelas: donde los datos quedan guardados.',pista:'Mira la forma: dos líneas paralelas, abierto por los lados.'},
    {n:'Flujo de datos',svg:SIM.flu,por:'Flecha: un dato en movimiento, con su nombre.',pista:'Mira la forma: es una flecha.'}
  ],
  clasifica:{
    pista:'¿qué es cada pieza del caso: entidad externa, proceso o almacén?',
    pregunta:'¿Qué pieza es?',
    items:DFD.nodos.map(n=>({id:n.id,t:n.t,det:n.det,ok:n.tipo})),
    opciones:[{id:'ent',n:'Entidad externa',ic:'⬜'},{id:'pro',n:'Proceso',ic:'⭕'},{id:'alm',n:'Almacén de datos',ic:'📂'}],
    bien:it=>`«${it.t}» es ${DFD_TIPOS[it.ok]}. ${DFD_POR[it.ok]}`,
    mal:(it,o)=>`«${it.t}» no es ${DFD_TIPOS[o]}: es ${DFD_TIPOS[it.ok]}. ${DFD_POR[it.ok]}`,
    fin:'¡Piezas listas! Ahora conecta: toca de dónde sale el dato y luego a dónde llega.'
  },
  flujos:DFD.flujos,
  visiblesInicio:[],
  nombre:id=>dfdNodo(id).t,
  valida:dfdValida,
  explica:f=>`${dfdNodo(f.de).t} → ${dfdNodo(f.a).t}: «${f.d}». ${f.por}`,
  svg:dfdSvg,
  extra:dfdLeyenda,
  paleta:`<div class="dg-paleta"><span>${SIM.ent}Entidad</span><span>${SIM.pro}Proceso</span><span>${SIM.alm}Almacén</span><span>${SIM.flu}Flujo</span></div>`,
  cierre:{
    pista:'¡Diagrama completo! Mira lo que muestra del sistema de hoy.',
    html:`<h4>🌳 Lo que cuenta tu DFD del sistema de hoy</h4><ul>
      <li>La flecha <b>8</b> lleva la <b>evidencia de origen incompleta</b>: es la salida que falla.</li>
      <li>Mira lo que <b>NO</b> hay: ninguna flecha lleva la <b>cobertura boscosa</b> ni la <b>ubicación</b> del predio hasta «Acreditar el origen». Ese dato falta donde se necesita.</li>
      <li>Los datos quedan en <b>carpetas y registros separados</b>, y el acopio no guarda de qué predio salió cada parte del lote.</li></ul>
      <p style="margin-top:6px"><small>Para que quepa en el celular juntamos Producir y Movilizar en el productor. Es un diagrama del sistema de HOY: sin base de datos ni app nuevas.</small></p>`
  }
};

/* =====================================================================
   DFP · Diagrama de flujo de procesos, estilo Bizagi (BPMN)
   Carriles verticales: se lee de arriba hacia abajo, y se ve bien en el celular.
   ===================================================================== */
const BP={
  titulo:'Acreditar el origen del lote · AS-IS',
  carriles:[
    {id:'pro',n:'Productor',c:'#1E8C4E',bg:'#DDF3E5',rows:1},
    {id:'aco',n:'Acopiador / asociación',c:'#D0661C',bg:'#FCE6D3',rows:1},
    {id:'com',n:'Comprador',c:'#2B7BB9',bg:'#DCEBF8',rows:2}
  ],
  nodos:[
    {id:'ini',tipo:'ini',t:'Cosecha lista',l:0,s:0,r:0},
    {id:'doc',tipo:'tar',t:'Documentar el predio',l:0,s:1,r:0,por:'El productor reúne los documentos y registros de su predio.'},
    {id:'mov',tipo:'tar',t:'Movilizar el cacao',l:0,s:2,r:0,por:'El productor saca el cacao del predio con sus guías de traslado.'},
    {id:'aco',tipo:'tar',t:'Acopiar en un lote',l:1,s:3,r:0,por:'El acopiador junta el producto de muchos predios en un lote.'},
    {id:'acr',tipo:'tar',t:'Acreditar el origen del lote',l:1,s:4,r:0,por:'La asociación o el comercializador reúne la evidencia del lote.'},
    {id:'ent',tipo:'tar',t:'Entregar la evidencia al comprador',l:1,s:5,r:0,por:'Quien armó la evidencia es quien la entrega.'},
    {id:'rev',tipo:'com',t:'¿Evidencia completa?',l:2,s:6,r:.5},
    {id:'pag',tipo:'tar',t:'Pagar el precio completo',l:2,s:7,r:0,por:'El comprador es quien paga el lote.'},
    {id:'cas',tipo:'tar',t:'Castigar el precio o rechazar',l:2,s:7,r:1,por:'El comprador es quien castiga el precio o rechaza el lote.'},
    {id:'fi1',tipo:'fin',t:'Lote vendido con acceso al mercado',l:2,s:8,r:0},
    {id:'fi2',tipo:'fin',t:'Lote castigado o rechazado',l:2,s:8,r:1}
  ],
  flujos:[
    {de:'ini',a:'doc',por:'Todo proceso arranca en su evento de inicio.'},
    {de:'doc',a:'mov',por:'Primero se documenta el predio y después se mueve el producto.'},
    {de:'mov',a:'aco',por:'Cuando el cacao se mueve, el acopiador lo recibe: la flecha cruza de carril.'},
    {de:'aco',a:'acr',por:'Con el lote armado se intenta acreditar su origen.'},
    {de:'acr',a:'ent',por:'La evidencia que se logró reunir se entrega al comprador.'},
    {de:'ent',a:'rev',por:'El comprador revisa la evidencia: aquí hay que decidir.'},
    {de:'rev',a:'pag',et:'Sí',por:'Si la evidencia está completa, se paga el precio completo.'},
    {de:'rev',a:'cas',et:'No',por:'Si falta evidencia, se castiga el precio o se rechaza el lote.'},
    {de:'pag',a:'fi1',por:'Con el pago, este camino termina bien.'},
    {de:'cas',a:'fi2',por:'Este camino termina en pérdida para el productor.'}
  ]
};
const BP_ROW=104,BP_STEP=92,BP_POOL=26,BP_LANE=44,BP_M0=BP_POOL+BP_LANE;
const BP_CS=(()=>{const a=[0];BP.carriles.forEach((c,k)=>a.push(a[k]+c.rows*BP_ROW));return a})();
const BP_W=BP_CS[BP_CS.length-1];
const BP_H=BP_M0+10+(Math.max(...BP.nodos.map(n=>n.s))+1)*BP_STEP+44;
const bpNodo=id=>BP.nodos.find(n=>n.id===id);
const bpPos=n=>({x:BP_CS[n.l]+(n.r+.5)*BP_ROW,y:BP_M0+10+n.s*BP_STEP+BP_STEP/2});
// Mitad de la altura de cada figura (la flecha sale por abajo y entra por arriba).
const bpMedia=n=>n.tipo==='tar'?25:n.tipo==='com'?32:n.tipo==='fin'?21:18;
function bpRuta(A,B){
  const a=bpPos(A),b=bpPos(B),ma=a.y+bpMedia(A),mb=b.y-bpMedia(B);
  if(Math.abs(a.x-b.x)<1)return {d:`M${a.x} ${ma}L${b.x} ${mb}`,mx:a.x,my:(ma+mb)/2};
  const mid=(ma+mb)/2;
  return {d:`M${a.x} ${ma}L${a.x} ${mid}L${b.x} ${mid}L${b.x} ${mb}`,mx:(a.x+b.x)/2,my:mid};
}
function bpForma(n,est){
  const p=bpPos(n);let f='';
  if(n.tipo==='ini')f=`<circle class="marca" r="18" fill="#DDF3E5" stroke="#1E8C4E" stroke-width="3"/>${texto(0,-34-(lineas(n.t,15).length-1)*6,n.t,15,10.5,'font-weight="700"')}`;
  else if(n.tipo==='fin')f=`<circle class="marca" r="18" fill="#fff" stroke="#DA3832" stroke-width="6"/>${textoDebajo(0,27,n.t,15,10.5,'font-weight="700"')}`;
  else if(n.tipo==='com'){
    const L=lineas(n.t,10),h=12.5;
    f=`<path class="marca" d="M0 -32L32 0L0 32L-32 0Z" fill="#FBF0C8" stroke="#B88600" stroke-width="3"/><path d="M-10 -10L10 10M10 -10L-10 10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <text font-size="11" font-weight="800" dominant-baseline="central">${L.map((l,i)=>`<tspan x="38" y="${(i-(L.length-1)/2)*h}">${esc(l)}</tspan>`).join('')}</text>`;
  }else f=`<rect class="marca" x="-48" y="-25" width="96" height="50" rx="10" fill="#FCE6D3" stroke="${INK}" stroke-width="2.5"/><circle cx="-41" cy="-18" r="2.2" fill="${GRIS}"/><path d="M-45 -12q4-6 8 0z" fill="${GRIS}"/>${texto(0,4,n.t,15,11.5,'font-weight="700"')}`;
  return `<g transform="translate(${p.x} ${p.y})"><g class="nodo ${est.sel===n.id?'seleccionado':''}" data-nodo="${n.id}" tabindex="0" role="button" aria-label="${esc(n.t)}"><g class="${est.nuevoNodo===n.id?'aparece':''}">${f}</g><rect x="-48" y="-32" width="96" height="64" fill="transparent"/></g></g>`;
}
function bpSvg(est){
  const id='dgb'+Math.random().toString(36).slice(2,6);
  let lanes='',zonas='',flechas='',etiquetas='',paquetes='';
  BP.carriles.forEach((c,k)=>{
    const x=BP_CS[k],w=c.rows*BP_ROW;
    lanes+=`<rect x="${x}" y="${BP_POOL}" width="${w}" height="${BP_H-BP_POOL}" fill="${c.bg}" fill-opacity=".55" stroke="${INK}" stroke-width="2"/>
      <rect x="${x}" y="${BP_POOL}" width="${w}" height="${BP_LANE}" fill="${c.c}" stroke="${INK}" stroke-width="2"/>${texto(x+w/2,BP_POOL+BP_LANE/2,c.n,14,12,'font-weight="800" fill="#fff"')}`;
    if(est.fase===2)zonas+=`<rect class="zona" data-opc="${c.id}" x="${x}" y="${BP_M0}" width="${w}" height="${BP_H-BP_M0}"><title>Carril ${esc(c.n)}</title></rect>`;
  });
  est.hechos.forEach((f,k)=>{
    const r=bpRuta(bpNodo(f.de),bpNodo(f.a));
    paquetes+=paquete(r.d,f===est.ultimo,est.fase===4,BP.flujos.indexOf(f));
    flechas+=`<path d="${r.d}" pathLength="1" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" marker-end="url(#${id})" class="${f===est.ultimo?'nueva':''}"/>`;
    if(f.et)etiquetas+=`<g transform="translate(${r.mx} ${r.my})"><rect x="-14" y="-9" width="28" height="18" rx="9" fill="#fff" stroke="${INK}" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900">${f.et}</text></g>`;
  });
  return `<svg viewBox="0 0 ${BP_W} ${BP_H}" fill="${INK}" role="img" aria-label="Diagrama de flujo de procesos con carriles: ${est.hechos.length} flechas dibujadas de ${BP.flujos.length}">
    <defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${INK}"/></marker></defs>
    <rect x="0" y="0" width="${BP_W}" height="${BP_H}" fill="#fff" fill-opacity=".7"/>
    ${lanes}<rect x="0" y="0" width="${BP_W}" height="${BP_POOL}" fill="${INK}"/>${texto(BP_W/2,BP_POOL/2,BP.titulo,60,12,'font-weight="800" fill="#FFF7E8"')}
    <rect x="0" y="0" width="${BP_W}" height="${BP_H}" fill="none" stroke="${INK}" stroke-width="4"/>
    ${flechas}${BP.nodos.filter(n=>est.vis.has(n.id)).map(n=>bpForma(n,est)).join('')}${etiquetas}${paquetes}${zonas}</svg>`;
}
const bpCarril=id=>BP.carriles.find(c=>c.id===id);
function bpValida(de,a){
  if(BP.flujos.some(x=>x.de===a&&x.a===de))return 'La flecha va al revés. El flujo sigue el orden del proceso, de arriba hacia abajo.';
  const A=bpNodo(de);
  if(A.tipo==='com')return 'De la compuerta salen DOS caminos: uno para «Sí» y otro para «No». Piensa a dónde va cada uno.';
  if(A.tipo==='fin')return 'Un evento de fin no tiene flecha de salida: ahí termina el camino.';
  return `De «${A.t}» no se pasa a «${bpNodo(a).t}». Piensa qué tiene que pasar justo después.`;
}
const BP_CFG={
  eyebrow:'Minijuego · Modela tu proceso como en Bizagi 🔷',
  titulo:'Dibuja el flujo del proceso con carriles',
  flechas:'Flechas',
  simbolos:[
    {n:'Evento de inicio',svg:SIM.ini,por:'Círculo de borde delgado: aquí empieza el proceso.',pista:'Mira el borde: el de inicio es delgado.'},
    {n:'Tarea',svg:SIM.tar,por:'Rectángulo redondeado: una actividad que alguien hace.',pista:'Mira la forma: un rectángulo con las esquinas redondeadas.'},
    {n:'Compuerta (decisión)',svg:SIM.com,por:'Rombo con X: una decisión; de ahí salen caminos como Sí y No.',pista:'Mira la forma: es un rombo.'},
    {n:'Evento de fin',svg:SIM.fin,por:'Círculo de borde grueso: aquí termina un camino.',pista:'Mira el borde: el de fin es grueso.'},
    {n:'Flujo de secuencia',svg:SIM.seq,por:'Flecha continua: el orden en que se hacen las cosas.',pista:'Mira la forma: es una flecha.'},
    {n:'Carril',svg:SIM.car,por:'Franja con el nombre del actor: las tareas que caen dentro las hace él.',pista:'Mira la forma: una franja con un nombre al lado.'}
  ],
  clasifica:{
    pista:'pon cada tarea en el carril de quien la hace.',
    pregunta:'¿En qué carril va?',
    items:BP.nodos.filter(n=>n.tipo==='tar').map(n=>({id:n.id,t:n.t,ok:BP.carriles[n.l].id,por:n.por})),
    opciones:BP.carriles.map(c=>({id:c.id,n:c.n})),
    bien:it=>`«${it.t}» va en el carril ${bpCarril(it.ok).n}. ${it.por}`,
    mal:(it,o)=>`«${it.t}» no va en el carril ${bpCarril(o).n}. La tarea va en el carril de quien la hace: ${it.por}`,
    fin:'¡Carriles listos! Ahora conecta el flujo: toca un elemento y luego el que sigue.'
  },
  flujos:BP.flujos,
  visiblesInicio:BP.nodos.filter(n=>n.tipo!=='tar').map(n=>n.id),
  nombre:id=>bpNodo(id).t,
  valida:bpValida,
  explica:f=>`${bpNodo(f.de).t} → ${bpNodo(f.a).t}${f.et?' ('+f.et+')':''}. ${f.por}`,
  svg:bpSvg,
  paleta:`<div class="dg-paleta"><span>${SIM.ini}Inicio</span><span>${SIM.tar}Tarea</span><span>${SIM.com}Compuerta</span><span>${SIM.fin}Fin</span><span>${SIM.seq}Flujo</span></div>`,
  cierre:{
    pista:'¡Diagrama completo! Mira lo que muestra del proceso de hoy.',
    html:`<h4>🌳 Lo que cuenta tu DFP del proceso de hoy</h4><ul>
      <li>La <b>compuerta</b> decide con una sola pregunta: ¿la evidencia está completa? Si la respuesta es «No», el lote se <b>castiga en precio o se rechaza</b>: son los efectos indirectos de tu árbol.</li>
      <li>Mira los <b>carriles</b>: la evidencia se arma en el carril del acopiador, lejos del productor, que es donde nace el dato.</li>
      <li>El camino «No» termina en pérdida para el productor. El diagrama muestra <b>dónde</b> falla el proceso; no lo arregla (eso es AS-IS).</li></ul>`
  }
};

/* ---------- explicaciones de Ceibita (tarjetas) ---------- */
const tarjetaDfd=()=>`<div class="simgrid">${simCard('ent','Entidad externa','Quien da o recibe datos pero está fuera del sistema.','#7C8A82')}${simCard('pro','Proceso','Transforma los datos que entran en datos que salen.','#2B7BB9')}${simCard('alm','Almacén de datos','Donde los datos quedan guardados.','#B88600')}${simCard('flu','Flujo de datos','Flecha con el nombre del dato que viaja.','#1E8C4E')}</div>`;
const tarjetaBpmn=()=>`<div class="simgrid g3">${simCard('ini','Evento de inicio','Aquí empieza.','#1E8C4E')}${simCard('tar','Tarea','Una actividad que alguien hace.','#D0661C')}${simCard('com','Compuerta','Una decisión: Sí o No.','#B88600')}${simCard('fin','Evento de fin','Aquí termina un camino.','#DA3832')}${simCard('seq','Flujo de secuencia','El orden de las cosas.','#14231B')}${simCard('car','Carril','El actor que hace sus tareas.','#D0661C')}</div>`;

return {motor,tarjetaDfd,tarjetaBpmn,DFD_CFG,BP_CFG,JUGO};
})();
