/* Diagramas del juego: diagrama de flujo clásico, DFD (flujo de datos), DFP (flujo de procesos con
   BPMN, como en Bizagi) y UML (casos de uso y clases). Todos son minijuegos para CONSTRUIR el diagrama
   del caso del Pasaporte Verde: los tres primeros como funciona hoy (AS-IS) y los de UML, lo que el
   sistema propuesto debe hacer (TO-BE).
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
  const pistas=['','Paso 1 de 3: aprende los símbolos. ¿Cómo se llama cada uno?','Paso 2 de 3: '+cfg.clasifica.pista,'Paso 3 de 3: '+(cfg.pistaConectar||'toca la pieza de donde sale la flecha y luego la pieza a donde llega.'),cfg.cierre.pista];
  // Los diagramas anchos (muchos carriles) se deslizan de lado en el celular en vez de encogerse hasta no leerse.
  if(cfg.ancho)lienzo.classList.add('ancho');
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
      panel.innerHTML=`<div class="dg-q"><small>${cfg.flechas} ${est.hechos.length} de ${cfg.flujos.length}</small><b>${est.sel?(cfg.textoSel?cfg.textoSel(nombre(est.sel)):'Sale de «'+nombre(est.sel)+'». ¿A dónde llega?'):(cfg.textoInicio||'¿De dónde sale la siguiente flecha?')}</b>${est.pista&&!est.sel?'<em>💡 Pista: empieza por la pieza que brilla.</em>':''}</div>${msg}`;
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
    // Algunas líneas no tienen dirección (asociación en UML): valen tocadas en cualquier orden.
    const f=cfg.flujos.find(x=>(x.de===de&&x.a===a)||(x.nd&&x.de===a&&x.a===de));
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
    {id:'p1',t:'Documentar el predio',tipo:'pro',num:1,x:220,y:200},
    {id:'p2',t:'Acopiar el producto',tipo:'pro',num:2,x:70,y:320},
    {id:'d1',t:'Documentos del predio',tipo:'alm',x:370,y:320},
    {id:'d2',t:'Registros de acopio',tipo:'alm',x:70,y:440},
    {id:'p3',t:'Acreditar el origen',tipo:'pro',num:3,x:220,y:440},
    {id:'p4',t:'Comercializar',tipo:'pro',num:4,x:220,y:570},
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
  if(n.tipo==='pro')f=`<circle class="marca" r="${R_PRO}" fill="#DCEBF8" stroke="${INK}" stroke-width="3"/><path d="M-34 -22H34" stroke="${INK}" stroke-width="1.5" opacity=".45"/><text y="-31" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="900">${n.num}</text>${texto(0,6,n.t,12,13,'font-weight="800"')}`;
  else if(n.tipo==='ent')f=`<rect class="marca" x="-58" y="-29" width="116" height="58" fill="#fff" stroke="${INK}" stroke-width="3"/>${texto(0,n.det?-7:0,n.t,15,12.5,'font-weight="800"')}${n.det?`<text y="17" text-anchor="middle" font-size="10" fill="${GRIS}">${esc(n.det)}</text>`:''}`;
  else f=`<rect x="-58" y="-24" width="116" height="48" fill="#FFF1C9"/><path class="marca" d="M-58 -24H58M-58 24H58" stroke="${INK}" stroke-width="3" fill="none"/>${texto(0,0,n.t,17,12.5,'font-weight="800"')}`;
  return `<g transform="translate(${n.x} ${n.y})"><g class="nodo ${est.sel===n.id?'seleccionado':''}" data-nodo="${n.id}" tabindex="0" role="button" aria-label="${esc(n.t)}"><g class="${est.nuevoNodo===n.id?'aparece':''}">${f}</g><rect x="-59" y="-50" width="118" height="100" fill="transparent"/></g></g>`;
}
function dfdSvg(est){
  const id='dgm'+Math.random().toString(36).slice(2,6);
  let flechas='',badges='',paquetes='';
  est.hechos.forEach((f,k)=>{
    const num=DFD.flujos.indexOf(f)+1;   // el número de la flecha es fijo (el del diagrama), no el orden en que el jugador la dibuja
    const A=dfdNodo(f.de),B=dfdNodo(f.a),inv=DFD.flujos.some(g=>g.de===f.a&&g.a===f.de);
    const [p,q]=dfdExtremos(A,B,inv?(f.de<f.a?9:-9):0);
    const d=`M${p.x.toFixed(1)} ${p.y.toFixed(1)}L${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    flechas+=`<path d="${d}" pathLength="1" fill="none" stroke="${INK}" stroke-width="3" marker-end="url(#${id})" class="${f===est.ultimo?'nueva':''}"/>`;
    paquetes+=paquete(d,f===est.ultimo,est.fase===4,k);
    badges+=`<g transform="translate(${((p.x+q.x)/2).toFixed(1)} ${((p.y+q.y)/2).toFixed(1)})"><circle r="10.5" fill="#FFC23D" stroke="${INK}" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900">${num}</text></g>`;
  });
  return `<svg viewBox="0 0 440 640" fill="${INK}" role="img" aria-label="Diagrama de flujo de datos: ${est.hechos.length} flechas dibujadas de ${DFD.flujos.length}">
    <defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${INK}"/></marker></defs>
    ${flechas}${DFD.nodos.filter(n=>est.vis.has(n.id)).map(n=>dfdForma(n,est)).join('')}${badges}${paquetes}</svg>`;
}
function dfdLeyenda(est){
  if(!est.hechos.length)return '';
  const orden=[...est.hechos].sort((a,b)=>DFD.flujos.indexOf(a)-DFD.flujos.indexOf(b));
  return `<ol class="dg-leyenda">${orden.map(f=>`<li class="${f===est.ultimo?'nuevo':''}"><b>${DFD.flujos.indexOf(f)+1}</b><span>${dfdNodo(f.de).t} → ${dfdNodo(f.a).t}<small>Dato: <strong>${f.d}</strong></small></span></li>`).join('')}</ol>`;
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
      <li>La flecha <b>8</b> (<b>3 Acreditar el origen → 4 Comercializar</b>) lleva la <b>evidencia de origen incompleta</b>: es la salida que falla.</li>
      <li>Mira lo que <b>NO</b> hay: ninguna flecha lleva la <b>cobertura boscosa</b> ni la <b>ubicación</b> del predio hasta «Acreditar el origen». Ese dato falta donde se necesita.</li>
      <li>Los datos quedan en <b>carpetas y registros separados</b>, y el acopio no guarda de qué predio salió cada parte del lote.</li></ul>
      <p style="margin-top:6px"><small>Es el <b>nivel 1</b>: abre el proceso 0 del diagrama de contexto en 4 procesos numerados. Producir y Movilizar se ven en el diagrama de flujo y en el DFP: aquí solo seguimos los datos. Es el sistema de HOY: sin base de datos ni app nuevas.</small></p>`
  }
};

/* =====================================================================
   DFP · Diagrama de flujo de procesos, estilo Bizagi (BPMN)
   Carriles verticales: se lee de arriba hacia abajo, y se ve bien en el celular.
   ===================================================================== */
const BP={
  // Es el mismo modelo AS-IS que Juan Pablo dibujó en Bizagi (pasaporte-verde-asis.bpmn): 5 carriles y 10 tareas.
  titulo:'Acreditación de origen · Caquetá (AS-IS)',
  carriles:[
    {id:'com',n:'Comprador',d:'comercializador',c:'#2B7BB9',bg:'#DCEBF8',rows:2},
    {id:'aso',n:'Asociación',d:'intermediario',c:'#D0661C',bg:'#FCE6D3',rows:1},
    {id:'pro',n:'Productor',c:'#1E8C4E',bg:'#DDF3E5',rows:1},
    {id:'ent',n:'Entidades',d:'ICA·IDEAM·ANT',c:'#5C6B62',bg:'#ECEFED',rows:1},
    {id:'aco',n:'Acopiador',d:'cooperativa',c:'#B88600',bg:'#FBF0C8',rows:1}
  ],
  nodos:[
    {id:'ini',tipo:'ini',t:'Exigencia UE 2023/1115',l:0,s:0,r:.5},
    {id:'c1',tipo:'tar',t:'Definir el requisito de compra',l:0,s:1,r:.5,por:'El comprador define qué evidencia pide.',nota:'Requisito no estandarizado: cada comprador define el suyo.'},
    {id:'a1',tipo:'tar',t:'Trasladar la exigencia',l:1,s:2,r:0,por:'La asociación o el intermediario le pasa la exigencia al productor.',nota:'Llega en lenguaje técnico: el productor no entiende la debida diligencia.'},
    {id:'p1',tipo:'tar',t:'Producir en el predio',l:2,s:3,r:0,por:'El productor maneja el predio, cosecha o levanta el ganado.'},
    {id:'p2',tipo:'tar',t:'Registrar en papel o de memoria',l:2,s:4,r:0,por:'El productor anota lo que puede, en papel o de memoria.',nota:'El dato no nace en el predio: sin coordenadas ni superficie.'},
    {id:'a2',tipo:'tar',t:'Documentar el predio',l:1,s:5,r:0,por:'La asociación reúne tenencia, registros y certificados.',nota:'Depende de intermediarios: no es reproducible.'},
    {id:'p3',tipo:'tar',t:'Solicitar la guía de movilización',l:2,s:6,r:0,por:'Para mover el producto, el productor pide la guía.'},
    {id:'e1',tipo:'tar',t:'Expedir la guía (ICA)',l:3,s:7,r:0,por:'La entidad (ICA, SINIGAN) expide la guía de movilización.',nota:'Solo lo sanitario: no cruza con IDEAM (bosque) ni ANT-IGAC (tierra).'},
    {id:'ac',tipo:'tar',t:'Acopiar varios predios en un lote',l:4,s:8,r:0,por:'El acopiador junta el producto de muchos predios en un lote.',nota:'Une predios en un lote sin conservar el origen de cada uno.'},
    {id:'a3',tipo:'tar',t:'Acreditar el origen del lote',l:1,s:9,r:0,por:'La asociación reúne la evidencia del lote.',nota:'Salida: evidencia de origen incompleta o inexistente.'},
    {id:'g1',tipo:'com',t:'¿Evidencia completa?',l:0,s:10,r:.5},
    {id:'c2',tipo:'tar',t:'Vender en el mercado formal',l:0,s:11,r:0,por:'El comprador negocia y compra el lote.'},
    {id:'c3',tipo:'tar',t:'Castigar el precio o rechazar',l:0,s:11,r:1,por:'El comprador castiga el precio o rechaza el lote.'},
    {id:'fok',tipo:'fin',t:'Venta con precio pleno',l:0,s:12,r:0},
    {id:'fno',tipo:'fin',t:'Productor excluido',l:0,s:12,r:1,nota:'Las pérdidas no se registran: sin indicadores ni retroalimentación.'}
  ],
  flujos:[
    {de:'ini',a:'c1',por:'Todo proceso arranca en su evento de inicio: aquí, la exigencia del reglamento europeo.'},
    {de:'c1',a:'a1',por:'El requisito baja por la cadena: del comprador a la asociación.'},
    {de:'a1',a:'p1',por:'La exigencia llega al productor, que sigue produciendo como siempre.'},
    {de:'p1',a:'p2',por:'Lo que pasa en el predio se anota en papel o de memoria.'},
    {de:'p2',a:'a2',por:'Con esos apuntes, la asociación arma los documentos del predio.'},
    {de:'a2',a:'p3',por:'Con los documentos, el productor pide la guía para mover el producto.'},
    {de:'p3',a:'e1',por:'La entidad recibe la solicitud y expide la guía: la flecha cruza de carril.'},
    {de:'e1',a:'ac',por:'Con la guía, el producto llega al acopio.'},
    {de:'ac',a:'a3',por:'Con el lote armado, la asociación intenta acreditar su origen.'},
    {de:'a3',a:'g1',por:'El comprador revisa la evidencia: aquí hay que decidir.'},
    {de:'g1',a:'c2',et:'Sí',por:'Si la evidencia está completa, se vende en el mercado formal.'},
    {de:'g1',a:'c3',et:'No',por:'Si falta evidencia, se castiga el precio o se rechaza el lote.'},
    {de:'c2',a:'fok',por:'Este camino termina con precio pleno.'},
    {de:'c3',a:'fno',por:'Este camino termina con el productor excluido.'}
  ]
};
const BP_ROW=80,BP_STEP=76,BP_POOL=26,BP_LANE=46,BP_M0=BP_POOL+BP_LANE;
const BP_CS=(()=>{const a=[0];BP.carriles.forEach((c,k)=>a.push(a[k]+c.rows*BP_ROW));return a})();
const BP_W=BP_CS[BP_CS.length-1];
const BP_H=BP_M0+10+(Math.max(...BP.nodos.map(n=>n.s))+1)*BP_STEP+40;
const bpNodo=id=>BP.nodos.find(n=>n.id===id);
const bpPos=n=>({x:BP_CS[n.l]+(n.r+.5)*BP_ROW,y:BP_M0+10+n.s*BP_STEP+BP_STEP/2});
// Mitad de la altura de cada figura (la flecha sale por abajo y entra por arriba).
const bpMedia=n=>n.tipo==='tar'?27:n.tipo==='com'?26:n.tipo==='fin'?17:16;
function bpRuta(A,B){
  const a=bpPos(A),b=bpPos(B),ma=a.y+bpMedia(A),mb=b.y-bpMedia(B);
  if(Math.abs(a.x-b.x)<1)return {d:`M${a.x} ${ma}L${b.x} ${mb}`,mx:a.x,my:(ma+mb)/2};
  // De la compuerta, los caminos salen por los lados del rombo (así se ve cuál es «Sí» y cuál «No»).
  // A la compuerta se entra por el lado derecho; de ella, «Sí» sale por la izquierda y «No» por abajo.
  if(B.tipo==='com')return {d:`M${a.x} ${ma}L${a.x} ${b.y}L${b.x+26} ${b.y}`,mx:a.x,my:b.y};
  if(A.tipo==='com'){
    if(b.x<a.x)return {d:`M${a.x-26} ${a.y}L${b.x} ${a.y}L${b.x} ${mb}`,mx:b.x,my:(a.y+mb)/2};
    const m2=(a.y+26+mb)/2;return {d:`M${a.x} ${a.y+26}L${a.x} ${m2}L${b.x} ${m2}L${b.x} ${mb}`,mx:(a.x+b.x)/2,my:m2};
  }
  const mid=(ma+mb)/2;
  return {d:`M${a.x} ${ma}L${a.x} ${mid}L${b.x} ${mid}L${b.x} ${mb}`,mx:(a.x+b.x)/2,my:mid};
}
function bpForma(n,est){
  const p=bpPos(n);let f='';
  if(n.tipo==='ini')f=`<circle class="marca" r="16" fill="#DDF3E5" stroke="#1E8C4E" stroke-width="3"/>${texto(0,-30-(lineas(n.t,13).length-1)*6,n.t,13,10.5,'font-weight="800"')}`;
  else if(n.tipo==='fin')f=`<circle class="marca" r="16" fill="#fff" stroke="#DA3832" stroke-width="6"/>${textoDebajo(0,21,n.t,12,10.5,'font-weight="800"')}`;
  else if(n.tipo==='com'){
    const L=lineas(n.t,10),h=12;
    f=`<path class="marca" d="M0 -26L26 0L0 26L-26 0Z" fill="#FBF0C8" stroke="#B88600" stroke-width="3"/><path d="M-8 -8L8 8M8 -8L-8 8" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <text font-size="10.5" font-weight="800" text-anchor="middle" dominant-baseline="central">${L.map((l,i)=>`<tspan x="0" y="${-34-(L.length-1-i)*h}">${esc(l)}</tspan>`).join('')}</text>`;
  }else f=`<rect class="marca" x="-37" y="-27" width="74" height="54" rx="9" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="-30" cy="-20" r="2" fill="${GRIS}"/><path d="M-33.5 -14.5q3.5-5 7 0z" fill="${GRIS}"/>${texto(1,3,n.t,11,10.5,'font-weight="800"')}`;
  return `<g transform="translate(${p.x} ${p.y})"><g class="nodo ${est.sel===n.id?'seleccionado':''}" data-nodo="${n.id}" tabindex="0" role="button" aria-label="${esc(n.t)}"><g class="${est.nuevoNodo===n.id?'aparece':''}">${f}</g><rect x="-38" y="-30" width="76" height="60" fill="transparent"/></g></g>`;
}
function bpSvg(est){
  const id='dgb'+Math.random().toString(36).slice(2,6);
  let lanes='',zonas='',flechas='',etiquetas='',paquetes='';
  BP.carriles.forEach((c,k)=>{
    const x=BP_CS[k],w=c.rows*BP_ROW;
    lanes+=`<rect x="${x}" y="${BP_POOL}" width="${w}" height="${BP_H-BP_POOL}" fill="${c.bg}" fill-opacity=".6" stroke="${INK}" stroke-width="2"/>
      <rect x="${x}" y="${BP_POOL}" width="${w}" height="${BP_LANE}" fill="${c.c}" stroke="${INK}" stroke-width="2"/>${texto(x+w/2,BP_POOL+(c.d?15:BP_LANE/2),c.n,14,12.5,'font-weight="900" fill="#fff"')}${c.d?`<text x="${x+w/2}" y="${BP_POOL+33}" text-anchor="middle" dominant-baseline="central" font-size="9.5" font-weight="700" fill="#fff">${esc(c.d)}</text>`:''}`;
    if(est.fase===2)zonas+=`<rect class="zona" data-opc="${c.id}" x="${x}" y="${BP_M0}" width="${w}" height="${BP_H-BP_M0}"><title>Carril ${esc(c.n)}</title></rect>`;
  });
  est.hechos.forEach(f=>{
    const r=bpRuta(bpNodo(f.de),bpNodo(f.a));
    paquetes+=paquete(r.d,f===est.ultimo,est.fase===4,BP.flujos.indexOf(f));
    flechas+=`<path d="${r.d}" pathLength="1" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" marker-end="url(#${id})" class="${f===est.ultimo?'nueva':''}"/>`;
    if(f.et)etiquetas+=`<g transform="translate(${r.mx} ${r.my})"><rect x="-14" y="-9" width="28" height="18" rx="9" fill="#fff" stroke="${INK}" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900">${f.et}</text></g>`;
  });
  return `<svg viewBox="0 0 ${BP_W} ${BP_H}" fill="${INK}" role="img" aria-label="Diagrama de procesos BPMN con 5 carriles: ${est.hechos.length} flechas dibujadas de ${BP.flujos.length}">
    <defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${INK}"/></marker></defs>
    <rect x="0" y="0" width="${BP_W}" height="${BP_H}" fill="#fff" fill-opacity=".7"/>
    ${lanes}<rect x="0" y="0" width="${BP_W}" height="${BP_POOL}" fill="${INK}"/>${texto(BP_W/2,BP_POOL/2,BP.titulo,70,12,'font-weight="800" fill="#FFF7E8"')}
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
  titulo:'Dibuja el proceso AS-IS con sus 5 carriles',
  flechas:'Flechas',
  ancho:true,
  simbolos:[
    {n:'Evento de inicio',svg:SIM.ini,por:'Círculo de borde delgado: aquí empieza el proceso.',pista:'Mira el borde: el de inicio es delgado.'},
    {n:'Tarea',svg:SIM.tar,por:'Rectángulo redondeado: una actividad que alguien hace.',pista:'Mira la forma: un rectángulo con las esquinas redondeadas.'},
    {n:'Compuerta (decisión)',svg:SIM.com,por:'Rombo con X: una decisión; de ahí salen caminos como Sí y No.',pista:'Mira la forma: es un rombo.'},
    {n:'Evento de fin',svg:SIM.fin,por:'Círculo de borde grueso: aquí termina un camino.',pista:'Mira el borde: el de fin es grueso.'},
    {n:'Flujo de secuencia',svg:SIM.seq,por:'Flecha continua: el orden en que se hacen las cosas.',pista:'Mira la forma: es una flecha.'},
    {n:'Carril',svg:SIM.car,por:'Franja con el nombre del actor: las tareas que caen dentro las hace él.',pista:'Mira la forma: una franja con un nombre arriba.'}
  ],
  clasifica:{
    pista:'pon cada tarea en el carril de quien la hace (toca el carril o el botón).',
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
  explica:f=>{const B=bpNodo(f.a);return `${bpNodo(f.de).t} → ${B.t}${f.et?' ('+f.et+')':''}. ${f.por}${B.nota?' 📝 '+B.nota:''}`},
  svg:bpSvg,
  paleta:`<div class="dg-paleta"><span>${SIM.ini}Inicio</span><span>${SIM.tar}Tarea</span><span>${SIM.com}Compuerta</span><span>${SIM.fin}Fin</span><span>${SIM.seq}Flujo</span></div><p class="dg-desliza">↔ Desliza para ver los 5 carriles</p>`,
  cierre:{
    pista:'¡Diagrama completo! Mira lo que muestra del proceso de hoy.',
    html:`<h4>🌳 Lo que cuenta tu DFP del proceso de hoy</h4><ul>
      <li>La exigencia <b>baja por la cadena</b>: nace en el comprador y termina en el productor, que es quien menos herramientas tiene.</li>
      <li><b>Cuello de botella:</b> «Acreditar el origen» depende de la asociación y de papeles dispersos; ahí se acumulan esperas y nadie más puede hacerlo.</li>
      <li>El dato <b>no nace en el predio</b> («Registrar en papel o de memoria») y el acopio <b>junta predios sin conservar su origen</b>.</li>
      <li>Si la compuerta dice «No», el lote se castiga o se rechaza y el productor queda <b>excluido</b>. Esa pérdida no se registra en ningún lado.</li></ul>
      <p style="margin-top:6px"><small>Es el mismo modelo AS-IS del proyecto (Bizagi): muestra <b>dónde</b> falla el proceso; no lo arregla.</small></p>`
  }
};

/* =====================================================================
   GRAFO: dibujo común para el diagrama de flujo clásico y los diagramas UML.
   Cada pieza tiene forma (rect, elipse, rombo) y cada línea un tipo de relación,
   que decide si es continua o punteada y qué punta lleva.
   ===================================================================== */
const G_DENTRO={
  rect:(n,dx,dy)=>Math.abs(dx)<=n.w/2+1&&Math.abs(dy)<=n.h/2+1,
  elipse:(n,dx,dy)=>(dx*dx)/((n.w/2+1)**2)+(dy*dy)/((n.h/2+1)**2)<=1,
  rombo:(n,dx,dy)=>Math.abs(dx)/(n.w/2+1)+Math.abs(dy)/(n.h/2+1)<=1
};
const G_GEO={term:'elipse',act:'rect',dec:'rombo',actor:'rect',cu:'elipse',clase:'rect'};
// Cómo se ve cada relación: trazo y punta (las puntas están en gDefs).
const G_REL={
  seq:{punta:'flecha'},
  asoc:{punta:''},
  inc:{dash:'7 5',punta:'abierta',et:'«include»'},
  ext:{dash:'7 5',punta:'abierta',et:'«extend»'},
  dep:{dash:'7 5',punta:'abierta'},
  gen:{punta:'triangulo'},
  agr:{punta:'rombo'},
  comp:{punta:'romboN'}
};
const gCentro=n=>({x:n.x,y:n.y+(n.cy||0)});
// Puntos de la línea: sale del borde de una pieza, pasa por los codos (via) y llega al borde de la otra.
function gPuntos(A,B,f){
  const pts=[gCentro(A),...(f.via||[]).map(([x,y])=>({x,y})),gCentro(B)];
  const sale=(n,P,Q)=>{const c=gCentro(n),g=G_DENTRO[G_GEO[n.tipo]];
    for(let t=0;t<=1;t+=.004){const x=P.x+(Q.x-P.x)*t,y=P.y+(Q.y-P.y)*t;if(!g(n,x-c.x,y-c.y))return {x,y}}return P};
  pts[0]=sale(A,pts[0],pts[1]);
  const L=pts.length-1;pts[L]=sale(B,pts[L],pts[L-1]);
  return pts;
}
function gDefs(id){
  const m=(n,vb,rx,ry,w,h,c)=>`<marker id="${id}-${n}" viewBox="${vb}" refX="${rx}" refY="${ry}" markerWidth="${w}" markerHeight="${h}" markerUnits="userSpaceOnUse" orient="auto">${c}</marker>`;
  return `<defs>${m('flecha','0 0 10 10',9,5,11,11,`<path d="M0 0L10 5L0 10Z" fill="${INK}"/>`)}
    ${m('abierta','0 0 12 12',11,6,13,13,`<path d="M1 1L11 6L1 11" fill="none" stroke="${INK}" stroke-width="2"/>`)}
    ${m('triangulo','0 0 16 16',15,8,17,17,`<path d="M1 1L15 8L1 15Z" fill="#fff" stroke="${INK}" stroke-width="2"/>`)}
    ${m('rombo','0 0 22 12',21,6,23,13,`<path d="M1 6L11 1L21 6L11 11Z" fill="#fff" stroke="${INK}" stroke-width="2"/>`)}
    ${m('romboN','0 0 22 12',21,6,23,13,`<path d="M1 6L11 1L21 6L11 11Z" fill="${INK}" stroke="${INK}" stroke-width="2"/>`)}</defs>`;
}
// Texto con un borde blanco alrededor, para que se lea encima de las líneas.
const gEt=(x,y,t,size,extra)=>`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${size||10.5}" font-weight="800" stroke="#FFF7E8" stroke-width="4" paint-order="stroke" ${extra||''}>${esc(t)}</text>`;
function gArista(f,est,id,nodo,k){
  const A=nodo(f.de),B=nodo(f.a),R=G_REL[f.rel];
  let pts=gPuntos(A,B,f);
  const ini=pts[0],fin=pts[pts.length-1];
  if(f.todo&&f.todo===f.de)pts=[...pts].reverse();   // el rombo de la agregación y la composición va pegado al «todo»
  const d='M'+pts.map(p=>p.x.toFixed(1)+' '+p.y.toFixed(1)).join('L');
  let s=`<path d="${d}"${R.dash?'':' pathLength="1"'} fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"${R.dash?` stroke-dasharray="${R.dash}" class="punteada${f===est.ultimo?' nueva-p':''}"`:` class="${f===est.ultimo?'nueva':''}"`}${R.punta?` marker-end="url(#${id}-${R.punta})"`:''}/>`;
  let et='';
  const mid=f.etp?{x:f.etp[0],y:f.etp[1]}:(()=>{const i=Math.floor((pts.length-1)/2),P=pts[i],Q=pts[i+1];return {x:(P.x+Q.x)/2,y:(P.y+Q.y)/2}})();
  const rot=f.et||R.et;
  if(rot)et+=f.rel==='seq'
    ?`<g transform="translate(${mid.x.toFixed(1)} ${mid.y.toFixed(1)})"><rect x="-14" y="-9" width="28" height="18" rx="9" fill="#fff" stroke="${INK}" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900">${esc(rot)}</text></g>`
    :gEt(mid.x+(f.etdx||0),mid.y+(f.etdy||0),rot,10.5,R.et?'font-style="italic"':'');
  // Multiplicidades: junto a cada punta de la asociación.
  const cerca=(P,Q,t)=>({x:P.x+(Q.x-P.x)*t,y:P.y+(Q.y-P.y)*t});
  if(f.m1){const p=cerca(ini,fin,.14);et+=gEt(p.x,p.y+12,f.m1,10.5)}
  if(f.m2){const p=cerca(ini,fin,f.mt||.86);et+=gEt(p.x,p.y+12,f.m2,10.5)}
  return {linea:s,et,paq:paquete(d,f===est.ultimo,est.fase===4,k)};
}
// Formas de las piezas.
function gForma(n,est){
  let f='';const w=n.w,h=n.h;
  if(n.tipo==='term')f=`<ellipse class="marca" rx="${w/2}" ry="${h/2}" fill="#DDF3E5" stroke="#1E8C4E" stroke-width="3"/>${texto(0,0,n.t,18,13,'font-weight="900"')}`;
  else if(n.tipo==='act')f=`<rect class="marca" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" fill="#FCE6D3" stroke="${INK}" stroke-width="2.5"/>${texto(0,0,n.t,n.max||20,12.5,'font-weight="800"')}`;
  else if(n.tipo==='dec')f=`<path class="marca" d="M0 ${-h/2}L${w/2} 0L0 ${h/2}L${-w/2} 0Z" fill="#FBF0C8" stroke="#B88600" stroke-width="3"/>${texto(0,0,n.t,11,12,'font-weight="900"')}`;
  else if(n.tipo==='cu')f=`<ellipse class="marca" rx="${w/2}" ry="${h/2}" fill="#fff" stroke="${INK}" stroke-width="2.5"/>${texto(0,0,n.t,n.max||22,11.5,'font-weight="800"')}`;
  else if(n.tipo==='actor')f=`<g class="marca-actor"><circle class="marca" cy="-29" r="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="M0 -21V4M-14 -12H14M0 4L-11 21M0 4L11 21" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" fill="none"/></g>${textoDebajo(0,25,n.t,10,11,'font-weight="900"')}`;
  else if(n.tipo==='clase'){
    const a=n.attrs||[],m=n.mets||[],y0=-h/2,hA=y0+24,hM=hA+a.length*14+8;
    f=`<rect class="marca" x="${-w/2}" y="${y0}" width="${w}" height="${h}" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
      <rect x="${-w/2+1.5}" y="${y0+1.5}" width="${w-3}" height="21" fill="${n.c||'#DCEBF8'}"/>
      <text y="${y0+12}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="900">${esc(n.t)}</text>
      <path d="M${-w/2} ${hA}H${w/2}M${-w/2} ${hM}H${w/2}" stroke="${INK}" stroke-width="2"/>
      <text font-size="10.5" font-weight="700">${a.map((t,i)=>`<tspan x="${-w/2+7}" y="${hA+12+i*14}">${esc(t)}</tspan>`).join('')}${m.map((t,i)=>`<tspan x="${-w/2+7}" y="${hM+12+i*14}">${esc(t)}</tspan>`).join('')}</text>`;
  }
  const hx=n.tipo==='actor'?{x:-26,y:-40,w:52,h:84}:{x:-w/2-2,y:-h/2-2,w:w+4,h:h+4};
  return `<g transform="translate(${n.x} ${n.y})"><g class="nodo ${est.sel===n.id?'seleccionado':''}" data-nodo="${n.id}" tabindex="0" role="button" aria-label="${esc(n.t)}"><g class="${est.nuevoNodo===n.id?'aparece':''}">${f}</g><rect x="${hx.x}" y="${hx.y}" width="${hx.w}" height="${hx.h}" fill="transparent"/></g></g>`;
}
// Arma el dibujo completo de un diagrama del tipo GRAFO.
function gSvg(D,etiqueta){
  const nodo=id=>D.nodos.find(n=>n.id===id);
  return est=>{
    const id='dgg'+Math.random().toString(36).slice(2,6);
    let trazos='',ets='',paqs='';
    est.hechos.forEach(f=>{const r=gArista(f,est,id,nodo,D.flujos.indexOf(f));trazos+=r.linea;ets+=r.et;paqs+=r.paq});
    return `<svg viewBox="0 0 ${D.W} ${D.H}" fill="${INK}" role="img" aria-label="${etiqueta}: ${est.hechos.length} líneas de ${D.flujos.length}">
      ${gDefs(id)}${D.fondo||''}${trazos}${D.nodos.filter(n=>est.vis.has(n.id)).map(n=>gForma(n,est)).join('')}${ets}${paqs}</svg>`;
  };
}
// Completa cada pieza con su tamaño (las clases calculan su alto según atributos y métodos).
function gPrepara(D){
  D.nodos.forEach(n=>{
    if(n.tipo==='clase'){n.w=n.w||150;n.h=24+(n.attrs||[]).length*14+8+Math.max(1,(n.mets||[]).length)*14+4}
    if(n.tipo==='actor'){n.w=34;n.h=60;n.cy=-6}
  });
  return D;
}

/* ---------- símbolos pequeños de los diagramas nuevos ---------- */
Object.assign(SIM,{
  term:sv(`<ellipse cx="60" cy="35" rx="44" ry="20" fill="#DDF3E5" stroke="#1E8C4E" stroke-width="3"/>`),
  act:sv(`<rect x="18" y="15" width="84" height="40" fill="#FCE6D3" stroke="${INK}" stroke-width="3"/>`),
  dec:sv(`<path d="M60 8L98 35L60 62L22 35Z" fill="#FBF0C8" stroke="#B88600" stroke-width="3"/>`),
  actor:sv(`<circle cx="60" cy="16" r="8" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M60 24V46M46 32H74M60 46L48 62M60 46L72 62" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`),
  cu:sv(`<ellipse cx="60" cy="35" rx="48" ry="22" fill="#fff" stroke="${INK}" stroke-width="3"/>`),
  lim:sv(`<rect x="14" y="8" width="92" height="54" fill="#FFF7E8" stroke="${INK}" stroke-width="3"/><path d="M28 22H92" stroke="${GRIS}" stroke-width="3" stroke-linecap="round"/><ellipse cx="60" cy="43" rx="26" ry="10" fill="#fff" stroke="${INK}" stroke-width="2"/>`),
  linea:sv(`<path d="M12 35H108" stroke="${INK}" stroke-width="3.5"/>`),
  inc:sv(`<path d="M12 44H96" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/><path d="M92 36L108 44L92 52" fill="none" stroke="${INK}" stroke-width="3"/><text x="58" y="26" text-anchor="middle" font-size="15" font-style="italic" font-weight="800" fill="${INK}">«include»</text>`),
  ext:sv(`<path d="M12 44H96" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/><path d="M92 36L108 44L92 52" fill="none" stroke="${INK}" stroke-width="3"/><text x="58" y="26" text-anchor="middle" font-size="15" font-style="italic" font-weight="800" fill="${INK}">«extend»</text>`),
  clase:sv(`<rect x="26" y="6" width="68" height="58" fill="#fff" stroke="${INK}" stroke-width="3"/><rect x="27.5" y="7.5" width="65" height="14" fill="#DCEBF8"/><path d="M26 22H94M26 44H94" stroke="${INK}" stroke-width="2.5"/><path d="M33 30H70M33 37H62M33 53H66" stroke="${GRIS}" stroke-width="2.5" stroke-linecap="round"/>`),
  agr:sv(`<path d="M12 35H82" stroke="${INK}" stroke-width="3.5"/><path d="M82 35L95 27L108 35L95 43Z" fill="#fff" stroke="${INK}" stroke-width="3"/>`),
  comp:sv(`<path d="M12 35H82" stroke="${INK}" stroke-width="3.5"/><path d="M82 35L95 27L108 35L95 43Z" fill="${INK}" stroke="${INK}" stroke-width="3"/>`),
  gen:sv(`<path d="M12 35H88" stroke="${INK}" stroke-width="3.5"/><path d="M88 24L108 35L88 46Z" fill="#fff" stroke="${INK}" stroke-width="3"/>`),
  dep:sv(`<path d="M12 35H100" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/><path d="M92 27L108 35L92 43" fill="none" stroke="${INK}" stroke-width="3"/>`)
});

/* =====================================================================
   DIAGRAMA DE FLUJO clásico (como en la clase: Inicio/Fin, Actividad, Decisión, Flujo)
   Es el mismo proceso de hoy (AS-IS) de la propuesta, de arriba hacia abajo.
   ===================================================================== */
const FLUJO=gPrepara({W:360,H:624,
  nodos:[
    {id:'ini',tipo:'term',t:'Inicio',x:180,y:28,w:120,h:40},
    {id:'pr',tipo:'act',t:'Producir en el predio',x:180,y:92,w:190,h:42},
    {id:'doc',tipo:'act',t:'Documentar el predio',x:180,y:154,w:190,h:42},
    {id:'mov',tipo:'act',t:'Movilizar el producto con su guía',x:180,y:216,w:190,h:42},
    {id:'aco',tipo:'act',t:'Acopiar varios predios en un lote',x:180,y:278,w:190,h:42},
    {id:'acr',tipo:'act',t:'Acreditar el origen del lote',x:180,y:340,w:190,h:42},
    {id:'dec',tipo:'dec',t:'¿Evidencia completa?',x:180,y:420,w:150,h:70},
    {id:'ven',tipo:'act',t:'Vender a precio pleno',x:88,y:508,w:156,h:44,max:14},
    {id:'cas',tipo:'act',t:'Castigar el precio o rechazar el lote',x:272,y:508,w:156,h:44,max:16},
    {id:'fin',tipo:'term',t:'Fin',x:180,y:594,w:120,h:40}
  ],
  flujos:[
    {de:'ini',a:'pr',rel:'seq',por:'Todo diagrama de flujo empieza en Inicio.'},
    {de:'pr',a:'doc',rel:'seq',por:'Primero se produce; después se reúnen los documentos del predio.'},
    {de:'doc',a:'mov',rel:'seq',por:'Con los documentos se tramita la guía para mover el producto.'},
    {de:'mov',a:'aco',rel:'seq',por:'El producto llega al acopio.'},
    {de:'aco',a:'acr',rel:'seq',por:'Con el lote armado se intenta acreditar su origen.'},
    {de:'acr',a:'dec',rel:'seq',por:'El comprador revisa la evidencia: aquí hay una decisión.'},
    {de:'dec',a:'ven',rel:'seq',et:'Sí',via:[[88,420]],etp:[88,458],por:'De la decisión salen dos caminos. Si la evidencia está completa, se vende a precio pleno.'},
    {de:'dec',a:'cas',rel:'seq',et:'No',via:[[272,420]],etp:[272,458],por:'Si falta evidencia, se castiga el precio o se rechaza el lote.'},
    {de:'ven',a:'fin',rel:'seq',via:[[88,594]],por:'Este camino termina.'},
    {de:'cas',a:'fin',rel:'seq',via:[[272,594]],por:'Este camino también termina: los dos caminos llegan al mismo Fin.'}
  ]});
const flNodo=id=>FLUJO.nodos.find(n=>n.id===id);
const FL_TIPOS={term:'un símbolo de Inicio o Fin',act:'una actividad',dec:'una decisión'};
const FL_POR={term:'Óvalo: marca dónde empieza o dónde termina el proceso.',act:'Rectángulo: algo que se hace; empieza con un verbo.',dec:'Rombo: una pregunta con dos salidas, Sí y No.'};
const FLUJO_CFG={
  eyebrow:'Minijuego · Diagrama de flujo 🧭',
  titulo:'Dibuja el diagrama de flujo del proceso de hoy',
  flechas:'Flechas',
  simbolos:[
    {n:'Inicio / Fin',svg:SIM.term,por:'Óvalo: dónde empieza y dónde termina el proceso.',pista:'Mira la forma: es un óvalo, redondo por los lados.'},
    {n:'Actividad',svg:SIM.act,por:'Rectángulo: una tarea que alguien hace.',pista:'Mira la forma: un rectángulo de esquinas rectas.'},
    {n:'Decisión',svg:SIM.dec,por:'Rombo: una pregunta; salen dos caminos, Sí y No.',pista:'Mira la forma: es un rombo.'},
    {n:'Flujo',svg:SIM.flu,por:'Flecha: el orden en que pasan las cosas.',pista:'Mira la forma: es una flecha.'}
  ],
  clasifica:{
    pista:'¿qué símbolo lleva cada paso: Inicio/Fin, actividad o decisión?',
    pregunta:'¿Qué símbolo lleva?',
    items:FLUJO.nodos.map(n=>({id:n.id,t:n.t,ok:n.tipo})),
    opciones:[{id:'term',n:'Inicio / Fin',ic:'⬭'},{id:'act',n:'Actividad',ic:'▭'},{id:'dec',n:'Decisión',ic:'◇'}],
    bien:it=>`«${it.t}» es ${FL_TIPOS[it.ok]}. ${FL_POR[it.ok]}`,
    mal:(it,o)=>`«${it.t}» no es ${FL_TIPOS[o]}: es ${FL_TIPOS[it.ok]}. ${FL_POR[it.ok]}`,
    fin:'¡Símbolos puestos! Ahora une los pasos en orden: toca un paso y luego el que sigue.'
  },
  flujos:FLUJO.flujos,
  visiblesInicio:[],
  nombre:id=>flNodo(id).t,
  valida:(de,a)=>{
    if(FLUJO.flujos.some(x=>x.de===a&&x.a===de))return 'La flecha va al revés: el flujo baja en el orden en que pasan las cosas.';
    if(de==='fin')return 'Fin es el último símbolo: de ahí no sale ninguna flecha.';
    if(de==='dec')return 'De la decisión salen dos caminos: «Sí» y «No». ¿A dónde lleva cada respuesta?';
    return `Después de «${flNodo(de).t}» no sigue «${flNodo(a).t}». ¿Qué pasa justo después?`;
  },
  explica:f=>`${flNodo(f.de).t} → ${flNodo(f.a).t}${f.et?' ('+f.et+')':''}. ${f.por}`,
  svg:gSvg(FLUJO,'Diagrama de flujo'),
  paleta:`<div class="dg-paleta"><span>${SIM.term}Inicio/Fin</span><span>${SIM.act}Actividad</span><span>${SIM.dec}Decisión</span><span>${SIM.flu}Flujo</span></div>`,
  cierre:{
    pista:'¡Diagrama completo! Mira lo que muestra.',
    html:`<h4>🌳 Lo que cuenta tu diagrama de flujo</h4><ul>
      <li>Los <b>6 procesos</b> van en orden, de arriba hacia abajo, y hay <b>una sola decisión</b>: ¿la evidencia está completa?</li>
      <li>El camino «No» termina en precio castigado o lote rechazado: el <b>efecto</b> de tu árbol.</li>
      <li>El diagrama de flujo dice <b>qué pasa y en qué orden</b>, pero no <b>quién</b> lo hace. Eso lo agrega el DFP con sus carriles (BPMN).</li></ul>`
  }
};

/* =====================================================================
   UML · DIAGRAMA DE CASOS DE USO del Pasaporte Verde (lo que el sistema propuesto debe hacer)
   Sale del carril «Pasaporte Verde (sistema)» del BPMN TO-BE y de los requisitos RI-01 a RI-10.
   ===================================================================== */
const CU=gPrepara({W:380,H:640,
  fondo:`<rect x="62" y="12" width="256" height="618" rx="6" fill="#fff" fill-opacity=".55" stroke="${INK}" stroke-width="3"/><text x="190" y="30" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="900">Pasaporte Verde (sistema)</text>`,
  nodos:[
    {id:'prod',tipo:'actor',t:'Productor',x:30,y:258},
    {id:'aso',tipo:'actor',t:'Asociación',x:350,y:440},
    {id:'acop',tipo:'actor',t:'Acopiador',x:30,y:568},
    {id:'comp',tipo:'actor',t:'Comprador',x:350,y:112},
    {id:'ent',tipo:'actor',t:'Entidades públicas',x:30,y:468},
    {id:'u2',tipo:'cu',t:'Registrar el requisito de compra',x:190,y:70,w:220,h:46,req:'RI-05'},
    {id:'u9',tipo:'cu',t:'Consultar el expediente del lote',x:190,y:134,w:220,h:46,req:'RI-08 · L-05'},
    {id:'u1',tipo:'cu',t:'Consultar el requisito en su lenguaje',x:190,y:200,w:220,h:46,req:'RI-07 · L-03'},
    {id:'u3',tipo:'cu',t:'Registrar el predio y su producción',x:190,y:268,w:220,h:46,req:'RI-01 · RI-06 · L-01'},
    {id:'u4',tipo:'cu',t:'Autorizar el uso de sus datos',x:232,y:336,w:164,h:46,max:18,req:'RI-09'},
    {id:'u5',tipo:'cu',t:'Evaluar el predio frente a la línea base',x:190,y:414,w:220,h:46,req:'RI-02 · R-01'},
    {id:'u7',tipo:'cu',t:'Orientar la subsanación',x:254,y:494,w:118,h:56,max:12,req:'L-01'},
    {id:'u6',tipo:'cu',t:'Consultar fuentes públicas',x:126,y:494,w:118,h:56,max:12,req:'L-02 · RI-03'},
    {id:'u8',tipo:'cu',t:'Consolidar el lote con su origen',x:190,y:572,w:220,h:46,req:'RI-04 · R-04 · L-06'}
  ],
  flujos:[
    {de:'prod',a:'u1',rel:'asoc',nd:1,por:'El productor recibe la exigencia en su lenguaje (L-03).'},
    {de:'comp',a:'u2',rel:'asoc',nd:1,por:'El comprador deja escrito qué evidencia exige y en qué formato (RI-05).'},
    {de:'prod',a:'u3',rel:'asoc',nd:1,por:'El dato nace en el predio: lo registra el productor, aun sin señal (L-01, RI-06).'},
    {de:'aso',a:'u3',rel:'asoc',nd:1,via:[[332,300]],por:'La asociación acompaña el registro de muchos predios.'},
    {de:'u3',a:'u4',rel:'inc',por:'Registrar SIEMPRE incluye autorizar el uso de los datos: la información es del productor (RI-09). La flecha va del caso base al incluido.'},
    {de:'prod',a:'u5',rel:'asoc',nd:1,por:'Al productor le sirve saber si su predio cumple (R-01).'},
    {de:'u5',a:'u6',rel:'inc',etdx:-40,etdy:4,por:'Evaluar siempre incluye consultar el IDEAM, el ICA y la ANT-IGAC (L-02).'},
    {de:'ent',a:'u6',rel:'asoc',nd:1,por:'Las entidades entregan sus datos: es un actor secundario.'},
    {de:'u7',a:'u5',rel:'ext',etdx:30,etdy:4,por:'Solo si el predio NO cumple se orienta la subsanación: es opcional, por eso es «extend». La flecha va de la extensión al caso base.'},
    {de:'aso',a:'u7',rel:'asoc',nd:1,por:'La asociación orienta al productor (por ejemplo, formalizar la tenencia con la ANT).'},
    {de:'acop',a:'u8',rel:'asoc',nd:1,por:'El acopiador junta los predios sin perder el origen de cada uno (RI-04, L-06).'},
    {de:'comp',a:'u9',rel:'asoc',nd:1,por:'El comprador consulta el expediente reconstruible del lote (RI-08).'}
  ]});
const cuNodo=id=>CU.nodos.find(n=>n.id===id);
const CU_CFG={
  eyebrow:'Minijuego · UML: casos de uso 🎭',
  titulo:'Dibuja lo que hará el Pasaporte Verde',
  flechas:'Líneas',
  pistaConectar:'une cada actor con sus casos de uso, y los casos que se incluyen o se extienden.',
  textoInicio:'Toca un actor o un caso de uso para empezar la línea.',
  textoSel:n=>`Elegiste «${n}». ¿Con qué se une?`,
  simbolos:[
    {n:'Actor',svg:SIM.actor,por:'Monigote: alguien de afuera que usa el sistema para lograr una meta.',pista:'Mira la forma: es un muñequito.'},
    {n:'Caso de uso',svg:SIM.cu,por:'Óvalo con un verbo: algo que el sistema hace y le da un resultado de valor al actor.',pista:'Mira la forma: un óvalo con texto.'},
    {n:'Límite del sistema',svg:SIM.lim,por:'Rectángulo grande: adentro van los casos de uso; afuera, los actores.',pista:'Mira la forma: un cuadro grande con el nombre del sistema.'},
    {n:'Asociación',svg:SIM.linea,por:'Línea continua: el actor y el caso de uso se comunican.',pista:'Mira: es una línea sin punta.'},
    {n:'«include»',svg:SIM.inc,por:'Flecha punteada: un caso SIEMPRE usa a otro.',pista:'Mira la palabra encima de la flecha punteada.'},
    {n:'«extend»',svg:SIM.ext,por:'Flecha punteada: un caso agrega algo opcional a otro, solo a veces.',pista:'Mira la palabra encima de la flecha punteada.'}
  ],
  clasifica:{
    pista:'¿qué actor usa cada caso de uso?',
    pregunta:'¿Qué actor lo usa?',
    items:[['u1','prod'],['u2','comp'],['u3','prod'],['u5','prod'],['u6','ent'],['u7','aso'],['u8','acop'],['u9','comp']].map(([id,ok])=>({id,ok,t:cuNodo(id).t,det:cuNodo(id).req})),
    opciones:['prod','aso','acop','comp','ent'].map(id=>({id,n:cuNodo(id).t})),
    bien:it=>`«${it.t}» lo usa ${cuNodo(it.ok).t}. Viene de ${it.det}.`,
    mal:(it,o)=>`No es ${cuNodo(o).t}. Piensa quién obtiene el resultado de «${it.t}» (${it.det}).`,
    fin:'¡Casos de uso listos! Ahora une cada actor con sus casos de uso.'
  },
  flujos:CU.flujos,
  visiblesInicio:['prod','aso','acop','comp','ent','u4'],
  nombre:id=>cuNodo(id).t,
  valida:(de,a)=>{
    const A=cuNodo(de),B=cuNodo(a);
    if(A.tipo==='actor'&&B.tipo==='actor')return 'Dos actores no se unen con una línea: cada actor se une a los casos de uso que usa.';
    const inv=CU.flujos.find(x=>x.de===a&&x.a===de&&!x.nd);
    if(inv)return inv.rel==='inc'?'Va al revés: en «include» la flecha sale del caso base y apunta al que se incluye.':'Va al revés: en «extend» la flecha sale de la extensión y apunta al caso base.';
    if(A.tipo==='cu'&&B.tipo==='cu')return `Entre «${A.t}» y «${B.t}» no hay «include» ni «extend» en este sistema.`;
    const act=A.tipo==='actor'?A:B,cu=A.tipo==='actor'?B:A;
    return `${act.t} no usa «${cu.t}». ¿Quién obtiene ese resultado?`;
  },
  explica:f=>`${cuNodo(f.de).t} — ${cuNodo(f.a).t}${f.rel==='inc'?' «include»':f.rel==='ext'?' «extend»':''}. ${f.por}`,
  svg:gSvg(CU,'Diagrama de casos de uso'),
  paleta:`<div class="dg-paleta"><span>${SIM.actor}Actor</span><span>${SIM.cu}Caso de uso</span><span>${SIM.linea}Asociación</span><span>${SIM.inc}Include</span><span>${SIM.ext}Extend</span></div>`,
  cierre:{
    pista:'¡Diagrama completo! Mira lo que muestra.',
    html:`<h4>🌳 Lo que cuenta tu diagrama de casos de uso</h4><ul>
      <li>Ahora sí estamos en el <b>mundo de la solución</b> (TO-BE): cada óvalo sale de un requisito (RI) o un lineamiento (L) de la propuesta.</li>
      <li>El <b>productor</b> es el actor con más casos: el dato nace en su predio y la información es suya.</li>
      <li><b>«include»</b> es obligatorio (registrar siempre pide autorización); <b>«extend»</b> es opcional (subsanar, solo si el predio no cumple).</li>
      <li>La certificación formal <b>no</b> está adentro: la da la autoridad competente (R-03). El sistema informa y documenta.</li></ul>`
  }
};

/* =====================================================================
   UML · DIAGRAMA DE CLASES: el modelo conceptual de la propuesta (§8.4: predio, productor, lote, evidencia)
   Los atributos son las variables del sistema (§5.5) y los métodos, las acciones de los lineamientos.
   ===================================================================== */
const CL=gPrepara({W:380,H:628,
  nodos:[
    {id:'prod',tipo:'clase',t:'Productor',x:72,y:84,w:140,attrs:['nombre: texto','vereda: texto'],mets:['autorizarDatos()'],c:'#DDF3E5'},
    {id:'pred',tipo:'clase',t:'Predio',x:294,y:84,w:168,attrs:['ubicación: coordenadas','superficie: ha','coberturaBoscosa: ha','tenencia: documento'],mets:['evaluarCobertura()'],c:'#DDF3E5'},
    {id:'evi',tipo:'clase',t:'Evidencia',x:80,y:282,w:150,attrs:['fecha: fecha','responsable: texto'],mets:['reconstruir()'],c:'#FCE6D3'},
    {id:'lote',tipo:'clase',t:'Lote',x:290,y:282,w:170,attrs:['producto: texto','volumen: kg'],mets:['consolidar()'],c:'#FCE6D3'},
    {id:'req',tipo:'clase',t:'Requisito',x:80,y:448,w:150,attrs:['tipoEvidencia: texto','formato: texto'],mets:[],c:'#FBF0C8'},
    {id:'fue',tipo:'clase',t:'FuenteDeDatos',x:290,y:448,w:170,attrs:['entidad: texto','fecha: fecha'],mets:['consultar()'],c:'#DCEBF8'},
    {id:'san',tipo:'clase',t:'RegistroSanitario',x:64,y:590,w:120,attrs:['idAnimal: código'],mets:[],c:'#DCEBF8'},
    {id:'mon',tipo:'clase',t:'MonitoreoForestal',x:190,y:590,w:120,attrs:['alertas: lista'],mets:[],c:'#DCEBF8'},
    {id:'cat',tipo:'clase',t:'RegistroPredial',x:316,y:590,w:120,attrs:['matrícula: texto'],mets:[],c:'#DCEBF8'}
  ],
  flujos:[
    {de:'prod',a:'pred',rel:'asoc',nd:1,et:'posee',etdy:-12,m1:'1',m2:'1..*',por:'Asociación: un productor posee uno o varios predios. Las dos clases colaboran, pero ninguna es parte de la otra.'},
    {de:'pred',a:'lote',rel:'agr',nd:1,todo:'lote',por:'Agregación (◇ en el todo): el lote agrupa el producto de varios predios, pero cada predio sigue existiendo sin el lote.'},
    {de:'evi',a:'lote',rel:'comp',nd:1,todo:'lote',por:'Composición (◆ en el todo): la evidencia es parte del expediente del lote; sin el lote, no existe.'},
    {de:'evi',a:'req',rel:'dep',por:'Dependencia (flecha punteada): la evidencia se arma según el requisito del comprador; si el requisito cambia, la evidencia cambia.'},
    {de:'evi',a:'fue',rel:'asoc',nd:1,et:'se apoya en',etdy:-10,m2:'1..*',mt:.7,por:'Asociación: toda evidencia se apoya en fuentes identificables y fechadas (R-02).'},
    {de:'san',a:'fue',rel:'gen',por:'Generalización (△ en el padre): el registro sanitario ES UNA fuente de datos. El hijo apunta al padre.'},
    {de:'mon',a:'fue',rel:'gen',por:'Generalización: el monitoreo forestal (IDEAM) también ES UNA fuente de datos.'},
    {de:'cat',a:'fue',rel:'gen',por:'Generalización: el registro predial (ANT-IGAC) también ES UNA fuente de datos.'}
  ]});
const clNodo=id=>CL.nodos.find(n=>n.id===id);
const CL_REL={asoc:'Asociación',agr:'Agregación',comp:'Composición',gen:'Generalización',dep:'Dependencia'};
const CL_CFG={
  eyebrow:'Minijuego · UML: diagrama de clases 🧩',
  titulo:'Relaciona las clases del Pasaporte Verde',
  flechas:'Relaciones',
  pistaConectar:'toca las dos clases de cada relación. En la herencia toca primero el hijo; en la dependencia, la clase que depende.',
  textoInicio:'Toca la primera clase de una relación.',
  textoSel:n=>`Elegiste «${n}». ¿Con qué clase se relaciona?`,
  simbolos:[
    {n:'Clase',svg:SIM.clase,por:'Caja de tres partes: nombre, atributos (datos) y métodos (acciones).',pista:'Mira la forma: una caja dividida en tres.'},
    {n:'Asociación',svg:SIM.linea,por:'Línea continua: dos clases colaboran entre sí.',pista:'Mira: una línea sin punta.'},
    {n:'Agregación',svg:SIM.agr,por:'Rombo vacío en el todo: «tiene», pero la parte vive sola.',pista:'Mira el rombo: está vacío.'},
    {n:'Composición',svg:SIM.comp,por:'Rombo lleno en el todo: la parte no existe sin el todo.',pista:'Mira el rombo: está relleno.'},
    {n:'Generalización',svg:SIM.gen,por:'Triángulo vacío en el padre: herencia, «es un».',pista:'Mira la punta: es un triángulo vacío.'},
    {n:'Dependencia',svg:SIM.dep,por:'Flecha punteada: una clase usa a otra y cambia si la otra cambia.',pista:'Mira el trazo: es punteado y con punta abierta.'}
  ],
  clasifica:{
    pista:'lee cada frase del caso y di qué relación es.',
    pregunta:'¿Qué relación es?',
    items:[
      {id:'q1',t:'Un productor posee uno o varios predios.',ok:'asoc',por:'Las dos clases colaboran, pero ninguna es parte de la otra.'},
      {id:'q2',t:'Un lote agrupa el producto de varios predios; cada predio sigue existiendo aunque el lote se venda.',ok:'agr',por:'«Tiene», pero la parte vive sola: rombo vacío en el lote.'},
      {id:'q3',t:'La evidencia es parte del expediente del lote: sin el lote, esa evidencia no existe.',ok:'comp',por:'La parte muere con el todo: rombo lleno en el lote.'},
      {id:'q4',t:'El registro sanitario, el monitoreo forestal y el registro predial son tipos de fuente de datos.',ok:'gen',por:'Es herencia: cada uno «es una» fuente de datos.'},
      {id:'q5',t:'La evidencia se arma según lo que pide el requisito del comprador.',ok:'dep',por:'La evidencia usa el requisito: si el requisito cambia, la evidencia cambia.'},
      {id:'q6',t:'Toda evidencia se apoya en fuentes identificables y fechadas (R-02).',ok:'asoc',por:'Evidencia y fuente colaboran: una evidencia se apoya en una o varias fuentes.'}
    ],
    opciones:[{id:'asoc',n:'Asociación',ic:'—'},{id:'agr',n:'Agregación',ic:'◇'},{id:'comp',n:'Composición',ic:'◆'},{id:'gen',n:'Generalización',ic:'△'},{id:'dep',n:'Dependencia',ic:'⇢'}],
    bien:it=>`Es ${CL_REL[it.ok]}. ${it.por}`,
    mal:(it,o)=>`No es ${CL_REL[o]}. Pregúntate: ¿colaboran, «tiene», «es parte de», «es un» o «usa»?`,
    fin:'¡Relaciones reconocidas! Ahora dibújalas: toca las dos clases de cada una.'
  },
  flujos:CL.flujos,
  visiblesInicio:CL.nodos.map(n=>n.id),
  nombre:id=>clNodo(id).t,
  valida:(de,a)=>{
    const inv=CL.flujos.find(x=>x.de===a&&x.a===de&&!x.nd);
    if(inv)return inv.rel==='gen'?'Va al revés: en la herencia el hijo apunta al padre. Toca primero el tipo de fuente.':'Va al revés: la flecha sale de la clase que depende (Evidencia) y llega a la que usa.';
    return `«${clNodo(de).t}» y «${clNodo(a).t}» no tienen una relación directa en este modelo.`;
  },
  explica:f=>`${clNodo(f.de).t} — ${clNodo(f.a).t}. ${f.por}`,
  svg:gSvg(CL,'Diagrama de clases'),
  paleta:`<div class="dg-paleta"><span>${SIM.linea}Asociación</span><span>${SIM.agr}Agregación</span><span>${SIM.comp}Composición</span><span>${SIM.gen}Generalización</span><span>${SIM.dep}Dependencia</span></div>`,
  cierre:{
    pista:'¡Diagrama completo! Mira lo que muestra.',
    html:`<h4>🌳 Lo que cuenta tu diagrama de clases</h4><ul>
      <li>Las clases son los <b>sustantivos</b> del análisis: predio, productor, lote, evidencia (modelo conceptual de la propuesta).</li>
      <li>Los <b>atributos</b> son las variables del sistema: ubicación, superficie, cobertura boscosa, tenencia, volumen.</li>
      <li>El lote <b>agrega</b> predios y se <b>compone</b> de su evidencia; la evidencia <b>depende</b> del requisito y se <b>apoya</b> en fuentes; las fuentes se <b>heredan</b> en sanitaria, forestal y predial.</li></ul>
      <p style="margin-top:6px"><small>Es un modelo conceptual (análisis), no el diseño de una base de datos.</small></p>`
  }
};

/* ---------- diagrama de contexto (nivel 0 del DFD), para la explicación ---------- */
function contextoDfd(){
  const id='dgc'+Math.random().toString(36).slice(2,6);
  const ent=(x,y,t)=>`<rect x="${x-56}" y="${y-22}" width="112" height="44" fill="#fff" stroke="${INK}" stroke-width="2.5"/>${texto(x,y,t,14,12,'font-weight="800"')}`;
  const fl=(d,tx,ty,t)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="2.4" marker-end="url(#${id})"/>${gEt(tx,ty,t,10.5)}`;
  return `<div class="dg-contexto"><svg viewBox="0 0 360 276" fill="${INK}" role="img" aria-label="Diagrama de contexto: el sistema como un solo proceso 0 rodeado de tres entidades externas">
    <defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${INK}"/></marker></defs>
    ${fl('M70 62L136 104',66,98,'Datos del predio')}
    ${fl('M290 62L224 104',294,98,'Registros oficiales')}
    ${fl('M206 230L206 177',285,206,'Exigencia y pedido')}
    ${fl('M154 177L154 230',76,206,'Producto y evidencia')}
    ${ent(70,40,'Productor')}${ent(290,40,'Entidades de registro')}${ent(180,252,'Comprador')}
    <circle cx="180" cy="128" r="52" fill="#DCEBF8" stroke="${INK}" stroke-width="3"/><text x="180" y="94" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="900">0</text>${texto(180,134,'Sistema de acreditación de origen',13,11.5,'font-weight="800"')}
  </svg></div>`;
}

/* ---------- explicaciones de Ceibita (tarjetas) ---------- */
const tarjetaDfd=()=>`<div class="simgrid">${simCard('ent','Entidad externa','Quien da o recibe datos pero está fuera del sistema.','#7C8A82')}${simCard('pro','Proceso','Transforma los datos que entran en datos que salen.','#2B7BB9')}${simCard('alm','Almacén de datos','Donde los datos quedan guardados.','#B88600')}${simCard('flu','Flujo de datos','Flecha con el nombre del dato que viaja.','#1E8C4E')}</div>`;
const tarjetaBpmn=()=>`<div class="simgrid g3">${simCard('ini','Evento de inicio','Aquí empieza.','#1E8C4E')}${simCard('tar','Tarea','Una actividad que alguien hace.','#D0661C')}${simCard('com','Compuerta','Una decisión: Sí o No.','#B88600')}${simCard('fin','Evento de fin','Aquí termina un camino.','#DA3832')}${simCard('seq','Flujo de secuencia','El orden de las cosas.','#14231B')}${simCard('car','Carril','El actor que hace sus tareas.','#D0661C')}</div>`;

const tarjetaFlujo=()=>`<div class="simgrid">${simCard('term','Inicio / Fin','Óvalo: dónde empieza y dónde termina.','#1E8C4E')}${simCard('act','Actividad','Rectángulo: algo que se hace.','#D0661C')}${simCard('dec','Decisión','Rombo: una pregunta con Sí y No.','#B88600')}${simCard('flu','Flujo','Flecha: el orden de los pasos.','#14231B')}</div>`;
const tarjetaCU=()=>`<div class="simgrid g3">${simCard('actor','Actor','Alguien de afuera que usa el sistema.','#1E8C4E')}${simCard('cu','Caso de uso','Algo que el sistema hace para el actor.','#2B7BB9')}${simCard('lim','Límite del sistema','Adentro, los casos; afuera, los actores.','#14231B')}${simCard('linea','Asociación','El actor usa ese caso.','#5C6B62')}${simCard('inc','«include»','Siempre lo usa.','#D0661C')}${simCard('ext','«extend»','A veces lo agrega.','#B88600')}</div>`;
const tarjetaClases=()=>`<div class="simgrid g3">${simCard('clase','Clase','Nombre, atributos y métodos.','#2B7BB9')}${simCard('linea','Asociación','Colaboran.','#5C6B62')}${simCard('agr','Agregación','«Tiene»; la parte vive sola.','#1E8C4E')}${simCard('comp','Composición','«Es parte de»; muere con el todo.','#14231B')}${simCard('gen','Generalización','«Es un»: herencia.','#D0661C')}${simCard('dep','Dependencia','«Usa»: cambia si el otro cambia.','#B88600')}</div>`;

return {motor,tarjetaDfd,tarjetaBpmn,tarjetaFlujo,tarjetaCU,tarjetaClases,contextoDfd,DFD_CFG,BP_CFG,FLUJO_CFG,CU_CFG,CL_CFG,JUGO};
})();
