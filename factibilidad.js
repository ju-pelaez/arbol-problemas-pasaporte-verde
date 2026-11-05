/* Reto «Matriz factible / viable».
   La diferencia se entiende con casos opuestos: algo que SE PUEDE hacer pero NO CONVIENE,
   y algo que CONVIENE pero hoy NO SE PUEDE. El estudiante pone cada caso en uno de los 4 cuadros.
   Primero casos de la vida diaria y después el Pasaporte Verde.
   Se carga antes del script principal; usa DG.JUGO (diagramas.js) para sonidos y celebraciones. */

const MATRIZ=(()=>{
// Los 4 cuadros: f = ¿se puede hacer? (factible) · v = ¿vale la pena y se sostiene? (viable)
const CUADROS=[
  {id:'fv',f:true,v:true,t:'Factible y viable',ic:'🚀',sub:'Se puede y vale la pena',c:'#1E8C4E',bg:'#DDF3E5'},
  {id:'fn',f:true,v:false,t:'Factible, pero NO viable',ic:'🤷',sub:'Se puede, pero no conviene',c:'#B88600',bg:'#FBF0C8'},
  {id:'nv',f:false,v:true,t:'Viable, pero NO factible',ic:'🧱',sub:'Conviene, pero hoy no se puede',c:'#2B7BB9',bg:'#DCEBF8'},
  {id:'nn',f:false,v:false,t:'Ni factible ni viable',ic:'🚫',sub:'Ni se puede ni conviene',c:'#DA3832',bg:'#FBDBDA'}
];
// pf = por qué sí o no SE PUEDE · pv = por qué sí o no VALE LA PENA
const DIARIOS=[
  {ic:'☕',t:'Vender tinto a la salida de clase',d:'Tienes termo y vasos, y todos los días salen estudiantes con sueño.',ok:'fv',
   pf:'Tienes lo necesario: termo, vasos y tiempo.',pv:'Hay clientes todos los días: conviene y se sostiene.'},
  {ic:'🧥',t:'Vender abrigos de lana en Florencia',d:'Los consigues fácil y los puedes vender en la plaza.',ok:'fn',
   pf:'Sí se puede: consigues los abrigos y el puesto.',pv:'No conviene: con este calor casi nadie los compraría.'},
  {ic:'🚄',t:'Un tren rápido Florencia – Bogotá',d:'Muchísima gente lo usaría todos los días.',ok:'nv',
   pf:'Hoy no se puede: no hay vía, ni plata, ni permisos.',pv:'Sí vale la pena: hay necesidad real y mucho impacto.'},
  {ic:'🐄',t:'Una app para que las vacas pidan comida',d:'Cada vaca con un celular colgado del cuello.',ok:'nn',
   pf:'No se puede: las vacas no usan celular.',pv:'Tampoco conviene: nadie lo necesita.'}
];
const CASO=[
  {ic:'🌳',t:'El Pasaporte Verde del Predio Amazónico',d:'Los datos ya existen (IDEAM, ICA, ANT, IGAC), la ley lo pide y Europa exige la prueba desde el 30-12-2026.',ok:'fv',
   pf:'Se puede: los datos, las personas y las leyes ya están; falta integrarlos.',pv:'Vale la pena: hay necesidad real, la fecha está encima y protege al productor.'},
  {ic:'📄',t:'Un formulario de 40 hojas para el productor',d:'Se imprime y se le entrega para que lo llene solo, lleno de términos técnicos.',ok:'fn',
   pf:'Imprimirlo se puede, y es barato.',pv:'No se sostiene: el productor no lo entiende y no lo llenaría.'},
  {ic:'📡',t:'Llevar internet a todas las veredas antes de empezar',d:'Primero que llegue la señal a cada finca, y después se acredita el origen.',ok:'nv',
   pf:'No se puede desde el proyecto: la conectividad es del entorno y cuesta muchísimo.',pv:'Valdría la pena: ayudaría a todo el Caquetá.'}
];
const cuadro=id=>CUADROS.find(c=>c.id===id);
const si=b=>b?'✅':'❌';

function jugar(host,ctx,done){
  const J=DG.JUGO;
  const mazo=[...shuffle(DIARIOS),...shuffle(CASO)];
  let i=0,errs=0,combo=0,mejor=0,pts=0,seguidos=0,esperando=false;
  host.innerHTML=`<div class="gtitle"><span class="eyebrow" style="color:var(--gold)">Reto · Matriz factible / viable ⚖️</span><h3>¿Se puede? ¿Vale la pena?</h3>
     <p>Pon cada caso en su cuadro. Primero casos de la vida diaria; después, el Pasaporte Verde.</p></div>
    <div class="dg-marcador"><span class="dg-pts">⭐ 0</span><span class="dg-combo"></span></div>
    <div class="dg-prog"><i></i></div>
    <div class="mx-carta" aria-live="polite"></div>
    <div class="mx-por" aria-live="polite"></div>
    <div class="mx">
      <span class="mx-esq"></span><span class="mx-col">🌱 VIABLE<small>vale la pena</small></span><span class="mx-col no">🌱 NO viable<small>no conviene</small></span>
      <span class="mx-fila">🔧 FACTIBLE<small>se puede</small></span>${['fv','fn'].map(z).join('')}
      <span class="mx-fila no">🔧 NO factible<small>no se puede</small></span>${['nv','nn'].map(z).join('')}
    </div>`;
  function z(id){const c=cuadro(id);return `<button class="mx-cuadro" data-q="${id}" style="--c:${c.c};--bg:${c.bg}"><b>${c.ic} ${c.t}</b><small>${c.sub}</small><span class="mx-dentro"></span></button>`}
  const carta=$('.mx-carta',host),por=$('.mx-por',host);
  const marcador=()=>{$('.dg-pts',host).textContent='⭐ '+pts;const c=$('.dg-combo',host);c.textContent=combo>=2?`🔥 Combo x${combo}`:'';c.classList.toggle('caliente',combo>=4);
    if(combo>=2){c.classList.remove('late');void c.offsetWidth;c.classList.add('late')}};
  const avance=()=>{$('.dg-prog i',host).style.width=(i/mazo.length*100)+'%'};
  function mostrar(){
    avance();esperando=false;por.innerHTML='';
    $$('.mx-cuadro',host).forEach(b=>b.classList.remove('pista'));
    if(i>=mazo.length)return fin();
    const k=mazo[i];
    if(i===DIARIOS.length)J.cartel('¡Ahora tu proyecto!','Casos del Pasaporte Verde');
    carta.innerHTML=`<div class="mx-c pop"><span class="mx-ic">${k.ic}</span><div><small>${i<DIARIOS.length?'Caso de la vida diaria':'Caso del Pasaporte Verde'} · ${i+1} de ${mazo.length}</small><b>${k.t}</b><p>${k.d}</p></div></div>`;
  }
  function elegir(btn){
    if(esperando||i>=mazo.length)return;
    const k=mazo[i],q=cuadro(btn.dataset.q),ok=cuadro(k.ok);
    if(q.id!==k.ok){
      errs++;seguidos++;combo=0;J.error();marcador();J.sacude($('.mx-c',carta));J.sacude(btn);
      // Le decimos cuál de las dos preguntas se equivocó.
      const pistas=[];
      if(q.f!==ok.f)pistas.push(`<p>🔧 <b>¿Se PUEDE hacer?</b> ${k.pf}</p>`);
      if(q.v!==ok.v)pistas.push(`<p>🌱 <b>¿VALE LA PENA?</b> ${k.pv}</p>`);
      por.innerHTML=`<div class="mx-msg bad"><b>Todavía no.</b>${pistas.join('')}</div>`;
      if(seguidos>=2)$(`[data-q="${k.ok}"]`,host).classList.add('pista');
      return;
    }
    esperando=true;combo++;mejor=Math.max(mejor,combo);seguidos=0;
    const p=10+Math.min(combo,10)*3;pts+=p;J.chispa(combo);addXP(4);J.flota(btn,'+'+p);marcador();
    // La carta vuela a su cuadro y queda como ficha.
    const c=$('.mx-c',carta);
    if(c&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&c.animate){
      const a=c.getBoundingClientRect(),b=btn.getBoundingClientRect();
      c.animate([{transform:'none',opacity:1},{transform:`translate(${b.left+b.width/2-(a.left+a.width/2)}px,${b.top+b.height/2-(a.top+a.height/2)}px) scale(.2)`,opacity:.2}],{duration:420,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});
    }
    setTimeout(()=>{const f=document.createElement('span');f.className='mx-ficha';f.textContent=k.ic+' '+k.t;$('.mx-dentro',btn).appendChild(f);
      btn.classList.remove('recibe');void btn.offsetWidth;btn.classList.add('recibe')},380);
    por.innerHTML=`<div class="mx-msg good"><b>${pick(['¡Exacto!','¡Muy bien!','¡Eso es!','¡Analista!'])} ${q.ic} ${q.t}</b>
      <p>🔧 <b>¿Se puede?</b> ${si(ok.f)} ${k.pf}</p><p>🌱 <b>¿Vale la pena?</b> ${si(ok.v)} ${k.pv}</p>
      <div class="act"><button class="btn small" id="mxsig">${i+1<mazo.length?'¡Siguiente! →':'¡Ver resultado! →'}</button></div></div>`;
    setTimeout(()=>{if(i<mazo.length&&esperando)carta.innerHTML=''},420);
    $('#mxsig',por).onclick=()=>{tone('tap');i++;mostrar()};
    $('#mxsig',por).focus({preventScroll:true});
  }
  $$('.mx-cuadro',host).forEach(b=>b.onclick=()=>elegir(b));
  function fin(){
    carta.innerHTML='';J.cartel('¡Matriz completa! ⚖️',errs===0?'¡Sin un solo error!':'Ya ves la diferencia');
    por.innerHTML=`<div class="dg-resumen"><span><b>⭐ ${pts}</b>puntos</span><span><b>🔥 x${mejor}</b>mejor combo</span><span><b>${errs===0?'💯':errs}</b>${errs===0?'sin errores':'errores'}</span></div>
      <div class="dg-fin" style="margin-top:8px"><h4>⚖️ La diferencia, en una frase</h4>
      <p><b>Factible</b> = ¿se <b>PUEDE</b> hacer con los recursos, la tecnología, las personas y las leyes que hay?</p>
      <p style="margin-top:4px"><b>Viable</b> = ¿<b>VALE LA PENA</b> y se <b>SOSTIENE</b> en el tiempo?</p>
      <p style="margin-top:6px">Un proyecto necesita <b>las dos</b>. El Pasaporte Verde cae en el cuadro 🚀.</p></div>
      <div class="act" style="margin-top:10px"><button class="btn" id="mxok">¡Listo! →</button></div>`;
    $('#mxok',por).onclick=()=>{tone('tap');ctx.errors+=Math.min(3,Math.ceil(errs/3));done()};
  }
  mostrar();
}
return {jugar};
})();
