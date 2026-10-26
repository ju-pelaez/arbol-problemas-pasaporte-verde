// canal.js
// Cómo viajan los mensajes entre el proyector y los celulares.
//
// Antes cada celular se conectaba directo al proyector (WebRTC). Eso falla cuando el celular está con
// datos móviles o en un wifi que aísla los aparatos, porque no se pueden "ver" entre sí.
// Ahora todos se conectan a un servidor público de mensajes (MQTT por WebSocket seguro), como un chat:
// cada uno tiene un buzón y los mensajes pasan por el servidor. Funciona en cualquier red.
//
// CanalPeer imita lo poco que usábamos de PeerJS (on, connect, reconnect, destroy y conexiones con
// send/close), así el resto del juego no cambió.

const CANAL_SERVIDOR = 'wss://broker.hivemq.com:8884/mqtt';
const CANAL_RAIZ = 'arbolvivo/v2/';
const buzon = id => CANAL_RAIZ + id + '/in';     // donde cada uno recibe sus mensajes
const vivo = id => CANAL_RAIZ + id + '/vivo';    // la sala avisa aquí que está abierta ("1") o cerrada ("")
const todos = id => CANAL_RAIZ + id + '/todos';  // mensajes de la sala para todos los celulares a la vez (el chat)

class Emisor {
  constructor() { this._ev = {}; }
  on(e, f) { (this._ev[e] = this._ev[e] || []).push(f); return this; }
  emit(e, ...a) { (this._ev[e] || []).slice().forEach(f => { try { f(...a); } catch (x) { console.error(x); } }); }
}

// Una conexión entre el proyector y un celular.
class CanalConexion extends Emisor {
  constructor(dueno, otro) { super(); this.dueno = dueno; this.peer = otro; this.open = false; this.cerrada = false; }
  send(m) { if (this.open) this.dueno._enviar(this.peer, { tipo: 'dato', m }); }
  close() { if (this.cerrada) return; this.dueno._enviar(this.peer, { tipo: 'cierra' }); this._cerrar(); }
  _cerrar() { if (this.cerrada) return; this.cerrada = true; this.open = false; this.dueno._olvidar(this); this.emit('close'); }
}

class CanalPeer extends Emisor {
  // new CanalPeer('arbolvivo-salon-ABCD')         → el proyector (la sala)
  // new CanalPeer(null, 'arbolvivo-salon-ABCD')   → un celular que va a entrar a esa sala
  constructor(id, sala) {
    super();
    this.esSala = !!id;
    this.id = id || 'cel-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    this.sala = sala || null;
    this.open = false; this.disconnected = false; this.destroyed = false;
    this.conns = new Map();
    this.revisado = !this.esSala;   // la sala revisa una vez que su código no esté ocupado
    // Si este aparato se desconecta de golpe, el servidor avisa solo (mensaje de "despedida").
    const despedida = this.esSala
      ? { topic: vivo(this.id), payload: '', retain: true, qos: 1 }
      : { topic: buzon(this.sala), payload: JSON.stringify({ de: this.id, tipo: 'cierra' }), qos: 1 };
    this.cliente = mqtt.connect(CANAL_SERVIDOR, {
      clientId: this.id + '-' + Math.random().toString(36).slice(2, 6),
      clean: true, keepalive: 15, reconnectPeriod: 2000, connectTimeout: 10000, will: despedida,
    });
    this.cliente.on('connect', () => this._conectado());
    this.cliente.on('message', (tema, datos) => this._mensaje(tema, datos));
    this.cliente.on('offline', () => this._caido());
    this.cliente.on('close', () => this._caido());
    this.cliente.on('error', () => this.emit('error', { type: 'network' }));
    // Al cerrar la página, la sala se marca cerrada y el celular se despide.
    addEventListener('pagehide', () => {
      if (this.esSala) { if (this.abierta) this.cliente.publish(vivo(this.id), '', { retain: true, qos: 1 }); }
      else this.conns.forEach(c => c.close());
    });
  }

  _conectado() {
    if (this.destroyed) return;
    this.cliente.subscribe(buzon(this.id), { qos: 1 }, () => {
      if (!this.esSala) { this.open = true; this.disconnected = false; return this.emit('open', this.id); }
      if (this.revisado) return this._abrirSala();
      // ¿Ya hay otra sala abierta con este código? (el servidor guarda el último "vivo")
      let ocupado = false;
      const mirar = (tema, datos) => { if (tema === vivo(this.id) && String(datos) === '1') ocupado = true; };
      this.cliente.on('message', mirar);
      this.cliente.subscribe(vivo(this.id), { qos: 1 }, () => setTimeout(() => {
        this.cliente.removeListener('message', mirar);
        this.cliente.unsubscribe(vivo(this.id));
        this.revisado = true;
        if (ocupado) return this.emit('error', { type: 'unavailable-id' });
        this._abrirSala();
      }, 900));
    });
  }

  _abrirSala() {
    this.cliente.publish(vivo(this.id), '1', { retain: true, qos: 1 });
    this.abierta = true; this.open = true; this.disconnected = false;
    this.emit('open', this.id);
  }

  _caido() {
    if (this.destroyed || this.disconnected) return;
    this.disconnected = true;
    // El celular pierde sus conexiones (el juego lo reconecta solo); la sala conserva a sus jugadores.
    if (!this.esSala) this.conns.forEach(c => c._cerrar());
    this.emit('disconnected');
  }

  _enviar(otro, datos) {
    if (!this.cliente.connected) return;
    this.cliente.publish(buzon(otro), JSON.stringify({ de: this.id, ...datos }), { qos: 1 });
  }
  _olvidar(c) { if (this.conns.get(c.peer) === c) this.conns.delete(c.peer); }

  // La sala manda un mensaje a todos los celulares con una sola publicación (no uno por uno).
  difundir(m) {
    if (this.esSala && this.cliente.connected) this.cliente.publish(todos(this.id), JSON.stringify({ m }), { qos: 1 });
  }

  _mensaje(tema, datos) {
    const texto = String(datos);
    // Un celular recibe lo que la sala manda a todos.
    if (!this.esSala && this.sala && tema === todos(this.sala)) {
      const c = this.conns.get(this.sala);
      let d; try { d = JSON.parse(texto); } catch (e) { return; }
      if (c && c.open && d) c.emit('data', d.m);
      return;
    }
    // Un celular vigila si su sala sigue abierta.
    if (!this.esSala && this.sala && tema === vivo(this.sala)) {
      const c = this.conns.get(this.sala);
      if (texto === '1') { if (c && !c.open && !c.pedida) { c.pedida = true; this._enviar(this.sala, { tipo: 'abre' }); } }
      else if (c && c.open) c._cerrar();
      else if (c) { this._olvidar(c); this.emit('error', { type: 'peer-unavailable' }); }
      return;
    }
    if (tema !== buzon(this.id)) return;
    let d; try { d = JSON.parse(texto); } catch (e) { return; }
    if (!d || typeof d.de !== 'string') return;
    const de = d.de.slice(0, 60);
    if (d.tipo === 'abre' && this.esSala) {
      // Un celular pide entrar: se crea su conexión y se le confirma.
      const vieja = this.conns.get(de); if (vieja) vieja._cerrar();
      const c = new CanalConexion(this, de); c.open = true; this.conns.set(de, c);
      this._enviar(de, { tipo: 'abierta' });
      this.emit('connection', c);
      return;
    }
    const c = this.conns.get(de);
    if (!c) return;
    if (d.tipo === 'abierta' && !c.open) { c.open = true; clearTimeout(c.espera); c.emit('open'); }
    else if (d.tipo === 'dato' && c.open) c.emit('data', d.m);
    else if (d.tipo === 'cierra') c._cerrar();
  }

  // El celular abre una conexión con la sala.
  connect(otro) {
    const vieja = this.conns.get(otro); if (vieja) vieja._cerrar();
    const c = new CanalConexion(this, otro);
    this.conns.set(otro, c);
    // Primero se mira si la sala existe (su "vivo"). Si en 5 s no aparece, no hay sala con ese código.
    this.cliente.subscribe(todos(otro), { qos: 1 });
    this.cliente.subscribe(vivo(otro), { qos: 1 }, () => {
      c.espera = setTimeout(() => { if (!c.open && !c.cerrada && !c.pedida) { this._olvidar(c); this.emit('error', { type: 'peer-unavailable' }); } }, 5000);
    });
    return c;
  }

  reconnect() { if (!this.destroyed && !this.cliente.connected) this.cliente.reconnect(); }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    // Solo borra el "vivo" si esta sala llegó a abrirse (si el código estaba ocupado, no toca la otra sala).
    if (this.esSala && this.abierta && this.cliente.connected) this.cliente.publish(vivo(this.id), '', { retain: true, qos: 1 });
    this.conns.forEach(c => c.close());
    this.cliente.end(false);
  }
}
