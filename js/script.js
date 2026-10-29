/* Sistemática Teranóstico — "enxergar o que se trata e tratar o que se vê" (28/10/2026).
   Cada aba responde UMA pergunta e aponta para a seguinte, de fora para dentro; a 5 volta à 0:
     0 abertura    — o átomo teranóstico: a mesma molécula leva o que vê e o que trata; a dose decai enquanto a senha
                     não chega; a reação em cadeia (R1) e a barra de controle (B1)
     1 ecossistema — quem regula, paga, fornece e trata, e o que cada um impõe ao ciclo
     2 sistema     — os sistemas que já existem, hoje coordenados de memória; e a camada de coordenação por cima
     3 serviços    — as cinco terapias: o mesmo ciclo, coordenação diferente
     4 jornadas    — os sete passos que o paciente atravessa, e quem responde por cada um (ninguém pelo todo)
     5 direção     — a decisão da Fase 3: a premissa, a arquitetura e o que construir primeiro; as oito alternativas
   Dados: js/data.js, GERADO de 08_sintese/dados/*.csv (não editar à mão). Sem nomes de pessoas, sem reais.
   Motor herdado da Sistemática do Health Data Brasil (encaixa/dimensiona, estado na URL, cartões empilhados) e da
   Sistemática da Longevidade (as seis abas 0–5, o #revela, o data-cresce, o ecossistema em duas colunas, o blueprint). */

(function () {
  "use strict";
  var D = window.TERA || {};
  var NS = "http://www.w3.org/2000/svg";
  var REL = D.relatorio || {}, CAM = D.camadas || {}, ENQ = D.enquadramentos || {};
  function rel(k) { var s = REL[k]; return s ? s.texto : ""; }
  function relConf(k) { var s = REL[k]; return s ? s.confianca : ""; }
  function cam(id, k) { return (CAM[id] && CAM[id][k]) || ""; }
  function indexa(lista, chave) { var m = {}; (lista || []).forEach(function (x) { m[x[chave]] = x; }); return m; }
  var ATOR = indexa(D.atores, "id"), SIS = indexa(D.sistemas, "id"), SERV = indexa(D.servicos, "id"), ETAPA = indexa(D.etapas, "id");
  var ISO = indexa(D.isotopos, "id"), PASSO = indexa(D.passos, "sigla"), ALT = indexa(D.alternativas, "id"), GRUPO = indexa(D.grupos, "id");
  var LOOP = indexa(D.loops, "id"), CONT = indexa(D.contagens, "id");
  var ETAPAS = D.etapas || [], PASSOS = D.passos || [], ACH = D.achados || [], PAD = D.padroes || [];
  var SUP = { V: "V", T: "T", R: "↻" };

  /* ---------- utilidades ---------- */
  function el(tag, attrs, pai) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (pai) pai.appendChild(e); return e; }
  function texto(pai, x, y, s, cls, ancora) { var t = el("text", { x: x, y: y, "class": cls || "", "text-anchor": ancora || "start" }, pai); t.textContent = s; return t; }
  function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function maiuscula(s) { s = s || ""; return s.charAt(0).toUpperCase() + s.slice(1); }
  function ponto(s) { s = String(s || "").trim(); return !s || /[.!?»"]$/.test(s) ? s : s + "."; }
  var CONF_TXT = { confirmado: "confirmado", provavel: "provável", aberto: "em aberto" };
  function conf(c) { return c && CONF_TXT[c] ? "<span class='conf conf-" + c + "'>" + CONF_TXT[c] + "</span>" : ""; }
  var ST_TXT = { aberta: "aberta", parcial: "parcial", existe: "existe", nao_existe: "não existe" };
  function st(s) { return s ? "<span class='st st-" + s + "'>" + (ST_TXT[s] || s) + "</span>" : ""; }
  function tagEnq(k, curto) { var e = ENQ[k]; if (!e) return ""; return "<span class='tag enq enq-" + k + "'>" + esc(curto ? e.curto : e.rotulo) + "</span>"; }
  function clicavel(g, fn) { g.addEventListener("click", fn); g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(); } }); }
  function num(x) { var n = parseFloat(x); return isNaN(n) ? 0 : n; }
  function pt(n, casas) { return n.toFixed(casas === undefined ? 1 : casas).replace(".", ","); }
  function cont(id) { return CONT[id] ? CONT[id].valor : null; }
  function passoCor(s) { return (PASSO[s] && PASSO[s].cor) || "#0C3A6F"; }
  function passoNome(s) { return PASSO[s] ? PASSO[s].nome : s; }
  function rotuloVista(id) { var v = VISTAS.filter(function (x) { return x.id === id; })[0]; return v ? v.rot : id; }
  function quebra(s, max) { /* quebra um texto em linhas de até `max` caracteres, por palavra */
    var out = [], linha = "";
    String(s || "").split(/\s+/).forEach(function (w) { if ((linha + " " + w).trim().length > max && linha) { out.push(linha); linha = w; } else linha = (linha + " " + w).trim(); });
    if (linha) out.push(linha);
    return out;
  }
  function corta(s, n) { s = String(s || ""); if (s.length <= n) return s; var c = s.slice(0, n); c = c.slice(0, Math.max(c.lastIndexOf(" "), n - 14)); return c.replace(/[,;:·\s]+$/, "") + "…"; }
  function textoLinhas(pai, x, y, s, cls, ancora, max, alt) { quebra(s, max).forEach(function (l, i) { texto(pai, x, y + i * (alt || 11), l, cls, ancora); }); }
  function achadosDe(camada) { return ACH.filter(function (a) { return a.camada === camada; }).sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); }); }
  function padroesDe(camada) { /* um padrão mora na camada dos seus achados (a primeira) */
    return PAD.filter(function (p) { return (p.achados || []).some(function (s) { var a = ACH.filter(function (x) { return x.slug === s; })[0]; return a && a.camada === camada; }); });
  }
  function achadoHtml(a, cls, semCitacao) {
    return "<div class='achado " + (cls || "mini") + "'" + (semCitacao && a.citacao ? " title='" + esc(a.citacao) + "'" : "") + "><b>" + esc(a.curto) + "</b>" + (a.citacao && !semCitacao ? "<span>«" + esc(a.citacao) + "»</span>" : "") +
      (a.papel ? "<span class='papel'>" + esc(a.papel) + "</span>" : "") + "</div>";
  }
  function padraoHtml(p) {
    return "<div class='achado mini padrao'><b>" + esc(p.titulo) + "</b><span>" + esc(maiuscula(p.lead)) + "</span><span class='papel'>" + p.n_fontes + " fontes · " + esc((p.fontes_papeis || []).join(" · ")) + "</span></div>";
  }
  function achadosHtml(camada, tese, max) {
    var lista = achadosDe(camada), pads = padroesDe(camada), html = "";
    if (max) lista = lista.slice(0, max);
    lista.forEach(function (a, i) { html += achadoHtml(a, tese && i === 0 ? "tese" : "mini"); });
    pads.forEach(function (p) { html += padraoHtml(p); });
    return html || "<p class='dica'>nada registrado ainda nesta camada</p>";
  }

  /* ---------- as cores vêm do dado: os passos e os enquadramentos viram CSS ---------- */
  (function () {
    var regras = [":root{" + PASSOS.map(function (p) { return "--" + ({ V: "ver", T: "tratar", R: "ciclo" }[p.sigla] || p.sigla) + ":" + p.cor; }).join(";") + "}"];
    Object.keys(ENQ).forEach(function (k) {
      var e = ENQ[k];
      regras.push(".enq-" + k + "{background:" + e.fundo + ";color:" + e.cor + ";border-color:" + e.cor + "55}",
        ".f-enq-" + k + "{stroke:" + e.cor + "}", ".rf-enq-" + k + "{fill:" + e.cor + "}");
    });
    var s = document.createElement("style"); s.textContent = regras.join("\n"); document.head.appendChild(s);
  })();

  /* ---------- encaixe: cada painel cabe na altura da tela (desktop) ----------
     Encolhe em passos de 3% até caber (piso em data-piso, nunca abaixo de 0,5); um painel com data-cresce amplia até o
     teto quando sobra altura. Abaixo de 1020px a peça empilha e rola: o zoom sai de cena. */
  var EMPILHA = 1020, ajustaveis = [];
  function encaixa(cont) {
    var w = cont && cont.firstElementChild;
    if (!w) return;
    if (window.innerWidth <= EMPILHA) { w.style.zoom = "1"; return; }
    if (!cont.clientHeight) return;
    w.style.zoom = "1";
    var cs = getComputedStyle(cont), pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    var alvo = cont.clientHeight - pad - 6;
    var teto = parseFloat(cont.getAttribute("data-cresce")) || 1;
    if (teto > 1 && w.getBoundingClientRect().height <= alvo) {
      var bom = 1;
      for (var g = 1.04; g <= teto + 1e-9; g += 0.04) { w.style.zoom = String(g); if (w.getBoundingClientRect().height > alvo) break; bom = g; }
      w.style.zoom = String(bom);
      cont.classList.remove("rola");
      return;
    }
    var piso = Math.max(parseFloat(cont.getAttribute("data-piso")) || 0.62, 0.5);
    for (var z = 1; z > piso && w.getBoundingClientRect().height > alvo;) { z -= 0.03; w.style.zoom = String(z); }
    cont.classList.toggle("rola", w.getBoundingClientRect().height > alvo + 2);
  }
  function escreve(cont, html) {
    cont.innerHTML = "<div class='ajusta'>" + html + "</div>";
    if (ajustaveis.indexOf(cont) < 0) ajustaveis.push(cont);
    encaixa(cont);
    ligaElos(cont);
  }
  function dimensiona() {
    var palco = document.querySelector(".palco");
    if (window.innerWidth <= EMPILHA) { palco.style.height = ""; return; }
    var topo = document.querySelector("nav.barra").offsetHeight;
    palco.style.height = Math.max(420, document.documentElement.clientHeight - topo) + "px";
  }
  function reencaixa() { dimensiona(); ajustaveis.forEach(encaixa); }
  var espera;
  window.addEventListener("resize", function () { clearTimeout(espera); espera = setTimeout(reencaixa, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reencaixa);
  window.addEventListener("load", reencaixa);

  /* ---------- as seis abas ---------- */
  var VISTAS = [
    { id: "abertura", n: 0, rot: "ABERTURA", livro: true, perg: rel("pergunta_abertura") || "o que é este projeto, e como ler este relatório?" },
    { id: "ecossistema", n: 1, rot: "ECOSSISTEMA", perg: cam("ecossistema", "pergunta") || "quem regula, paga e fornece, e o que cada um impõe?" },
    { id: "sistema", n: 2, rot: "SISTEMA", perg: cam("sistema", "pergunta") || "o que já existe, e o que coordena por cima?" },
    { id: "servicos", n: 3, rot: "SERVIÇOS", perg: cam("servicos", "pergunta") || "o que muda de uma terapia para outra?" },
    { id: "jornadas", n: 4, rot: "JORNADAS", perg: cam("jornadas", "pergunta") || "o que o paciente atravessa, e quem responde por cada passo?" },
    { id: "direcao", n: 5, rot: "DIREÇÃO", livro: true, perg: rel("pergunta_direcao") || "o que a Fase 3 precisa decidir?" }
  ];
  var PROXIMA = {
    abertura: ["ecossistema", "quem regula, paga e fornece?"],
    ecossistema: ["sistema", "e por dentro, que sistemas já executam o trabalho?"],
    sistema: ["servicos", "o que muda de uma terapia para outra?"],
    servicos: ["jornadas", "o que o paciente atravessa, passo a passo?"],
    jornadas: ["direcao", "o que a Fase 3 precisa decidir?"],
    direcao: ["abertura", "de volta ao começo: o átomo teranóstico"]
  };
  var botoes = {}, vistaAtual = null;
  var nav = document.getElementById("camadas");
  VISTAS.forEach(function (v) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "f-camada" + (v.livro ? " f-livro" : ""); b.setAttribute("role", "tab");
    b.innerHTML = "<small>" + v.n + "</small>" + esc(v.rot);
    b.addEventListener("click", function () { abre(v.id); });
    nav.appendChild(b); botoes[v.id] = b;
  });
  function abre(id, item) {
    var v = VISTAS.filter(function (x) { return x.id === id; })[0] || VISTAS[0];
    vistaAtual = v.id;
    VISTAS.forEach(function (x) {
      document.getElementById("v-" + x.id).classList.toggle("on", x.id === v.id);
      botoes[x.id].classList.toggle("on", x.id === v.id);
      botoes[x.id].setAttribute("aria-selected", x.id === v.id ? "true" : "false");
    });
    var nv = cam(v.id, "nivel"), pp = cam(v.id, "pergunta_pessoa");
    document.getElementById("pergunta").innerHTML = "<b>" + v.n + " · " + esc(v.rot) + "</b>" + (nv ? "<span class='nivel nv-" + nv + "'>" + nv + "</span>" : "") +
      " · " + esc(v.perg) + (pp ? " <span class='perg-pessoa'>— para o paciente: «" + esc(pp) + "»</span>" : "");
    var m = cam(v.id, "manchete");
    document.getElementById("manchete").textContent = (v.id !== "abertura" && v.id !== "direcao" && m) ? ponto(m) : "";
    revelaCamada(v);
    if (v.id === "jornadas") montaJornada(jornadaAtual);
    if (item !== undefined && item !== null) seleciona(v.id, item);
    estadoNaUrl();
    reencaixa();
  }
  function revelaCamada(v) {
    var r = document.getElementById("revela"), rot, txt;
    if (v.id === "abertura") { rot = "COMO LER"; txt = rel("como_ler"); }
    else if (v.id === "direcao") { rot = "LEGENDA"; txt = rel("legenda_fontes"); }
    else { rot = "O QUE ISSO REVELA"; txt = cam(v.id, "revela"); }
    if (!txt) { r.innerHTML = ""; return; }
    r.innerHTML = "<b class='rv-rot'>" + rot + "</b><span class='rv-txt'></span>";
    var s = r.querySelector(".rv-txt"); s.textContent = txt; s.title = txt;
  }
  var selecao = { abertura: null, ecossistema: null, sistema: null, servicos: null, jornadas: null, direcao: null };
  function seleciona(vista, item) {
    if (vista === "ecossistema") selecionaEco(item);
    else if (vista === "sistema") selecionaSis(item);
    else if (vista === "servicos") selecionaServico(item);
    else if (vista === "jornadas") { selecao.jornadas = item; montaJornada(jornadaAtual); }
    else if (vista === "direcao") mostraAlt(item);
    else if (vista === "abertura") acendeParte(item);
  }
  var passoAtual = null, servicoAtual = null;
  function estadoNaUrl() {
    var q = "?vista=" + vistaAtual;
    if (vistaAtual === "jornadas" && jornadaAtual && jornadaAtual !== "mae") q += "&servico=" + encodeURIComponent(jornadaAtual);
    if (selecao[vistaAtual]) q += "&item=" + encodeURIComponent(selecao[vistaAtual]);
    if (vistaAtual === "ecossistema" && etapaEco) q += "&etapa=" + etapaEco;
    if (vistaAtual === "sistema" && !comparativo) q += "&tempo=" + tempoAtual;
    if (vistaAtual === "jornadas" && passoAtual) q += "&passo=" + passoAtual;
    try { history.replaceState(null, "", q); } catch (e) { /* file:// em alguns navegadores */ }
  }
  function elo(vista) { var p = PROXIMA[vista]; return "<button type='button' class='l-elo' data-vista='" + p[0] + "'>" + (vista === "direcao" ? "↻ " : "→ ") + esc(p[1]) + "</button>"; }
  function eloPara(vista, item, rot, cls) { return "<button type='button' class='" + (cls || "l-elo inline") + "' data-vista='" + vista + "'" + (item ? " data-item='" + esc(item) + "'" : "") + ">" + rot + "</button>"; }
  function ligaElos(raiz) {
    Array.prototype.forEach.call(raiz.querySelectorAll("button.l-elo"), function (b) {
      if (b.dataset.ligado) return;
      b.dataset.ligado = "1";
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (b.dataset.servico) jornadaAtual = b.dataset.servico;
        if (b.dataset.passo) passoAtual = b.dataset.passo;
        abre(b.dataset.vista, b.dataset.item || undefined);
      });
    });
  }

  /* ================= o relógio de decaimento (abertura e jornadas) =================
     A(t) = 2^(−t/T½), de 0 a `dias`. As faixas vêm de contagens.csv (senha_min, senha_max, previsao_industria,
     entrega_dose); a perda por dia é derivada da meia-vida, nunca digitada. */
  function meiaVidaDias(iso) { return iso ? iso.meia_vida_h / 24 : 0; }
  function perdaPorDia(iso) { var t = meiaVidaDias(iso); return t > 0 ? 1 - Math.pow(2, -1 / t) : 0; }
  function meiaVidaTxt(iso) {
    if (!iso) return "";
    var v = num(iso.meia_vida_valor), u = iso.meia_vida_unidade;
    return pt(v, v % 1 ? 1 : 0) + " " + (u === "d" ? (v === 1 ? "dia" : "dias") : u === "h" ? "h" : "min");
  }
  function simbolo(iso) { /* "Lu-177" → ¹⁷⁷Lu em HTML; no SVG fica "Lu-177" */
    if (!iso) return "";
    var m = String(iso.simbolo || "").match(/^([A-Za-z]+)-?(\d+)(m?)$/);
    return m ? "<sup>" + m[2] + m[3] + "</sup>" + m[1] : esc(iso.simbolo);
  }
  var EMISSAO_TXT = { gama: "γ", beta_mais: "β⁺ → γ", beta_menos: "β⁻", alfa: "α", beta_menos_gama: "β⁻ + γ", alfa_filhas: "α (e filhas)" };
  function relogioSvg(iso, opts) {
    opts = opts || {};
    var completo = !!opts.completo, W = opts.w || 440, H = opts.h || 86, x0 = completo ? 48 : 34, x1 = W - 10, y0 = completo ? 22 : 12;
    var y1 = H - (completo ? 46 : (opts.semFrase ? 14 : 32)), dias = opts.dias || 30;
    var T = meiaVidaDias(iso); if (!T) return "";
    function X(d) { return x0 + (x1 - x0) * d / dias; }
    function Y(a) { return y1 - (y1 - y0) * a; }
    var pts = [], i;
    for (i = 0; i <= 80; i++) { var d = dias * i / 80; pts.push(X(d).toFixed(1) + "," + Y(Math.pow(2, -d / T)).toFixed(1)); }
    var h = "<svg class='relogio-svg' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='" + esc("a atividade da dose cai pela metade a cada " + meiaVidaTxt(iso) + "; a senha chega entre " + cont("senha_min") + " e " + cont("senha_max") + " dias") + "'>";
    h += "<defs><pattern id='rl-hachura' width='6' height='6' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><line x1='0' y1='0' x2='0' y2='6' stroke='#B3261E' stroke-width='1' opacity='.35'/></pattern></defs>";
    var smin = cont("senha_min"), smax = cont("senha_max"), prev = cont("previsao_industria"), ent = cont("entrega_dose"), c0 = cont("ciclo_intervalo_min"), c1 = cont("ciclo_intervalo_max");
    var topo = y0 + 9;
    if (completo && c0 !== null && c1 !== null && c0 <= dias) {
      h += "<rect class='rl-ciclo' x='" + X(c0) + "' y='" + y0 + "' width='" + (X(Math.min(c1, dias)) - X(c0)) + "' height='" + (y1 - y0) + "'/>";
      h += "<text class='rl-meia-rot' x='" + (X(c0) + 3) + "' y='" + topo + "'>↻ próximo ciclo · " + c0 + " a " + c1 + " dias</text>";
      topo += 10;
    }
    if (smin !== null && smax !== null) {
      h += "<rect class='rl-senha' x='" + X(smin) + "' y='" + y0 + "' width='" + (X(Math.min(smax, dias)) - X(smin)) + "' height='" + (y1 - y0) + "'/>";
      h += "<text class='rl-senha-rot' x='" + (X(smin) + 3) + "' y='" + topo + "'>a senha chega entre " + smin + " e " + smax + " dias</text>";
    }
    h += "<path class='rl-area' d='M" + X(0) + "," + y1 + " L" + pts.join(" L") + " L" + X(dias) + "," + y1 + " Z'/>";
    h += "<polyline class='rl-curva' points='" + pts.join(" ") + "'/>";
    h += "<line class='rl-eixo' x1='" + x0 + "' y1='" + y1 + "' x2='" + x1 + "' y2='" + y1 + "'/>";
    for (var t = 0; t <= dias; t += 7) h += "<text class='rl-tick' x='" + X(t) + "' y='" + (y1 + 10) + "' text-anchor='middle'>" + t + (t ? "" : " dias") + "</text>";
    h += "<text class='rl-tick' x='" + (x0 - 4) + "' y='" + (y0 + 4) + "' text-anchor='end'>100%</text><text class='rl-tick' x='" + (x0 - 4) + "' y='" + (Y(0.5) + 3) + "' text-anchor='end'>50%</text>";
    if (T <= dias) {
      h += "<line class='rl-meia' x1='" + x0 + "' y1='" + Y(0.5) + "' x2='" + X(T) + "' y2='" + Y(0.5) + "'/><line class='rl-meia' x1='" + X(T) + "' y1='" + Y(0.5) + "' x2='" + X(T) + "' y2='" + y1 + "'/>";
      h += "<text class='rl-meia-rot' x='" + (X(T) + 3) + "' y='" + (Y(0.5) - 3) + "'>meia-vida · " + meiaVidaTxt(iso) + "</text>";
    }
    if (prev !== null && prev <= dias) { h += "<line class='rl-marca' x1='" + X(prev) + "' y1='" + y0 + "' x2='" + X(prev) + "' y2='" + y1 + "'/><text class='rl-marca-rot' x='" + (X(prev) + 4) + "' y='" + (y1 - 4) + "'>pedido à indústria · " + prev + " d antes</text>"; }
    if (ent !== null && ent <= dias && ent !== prev) {
      var ye = Y(Math.pow(2, -ent / T));
      h += "<circle cx='" + X(ent) + "' cy='" + ye + "' r='3' fill='#0C3A6F'/><text class='rl-marca-rot' x='" + (X(ent) - 6) + "' y='" + (ye + 3) + "' text-anchor='end'>dose chega · " + ent + " d</text>";
      if (completo) { /* o paciente recebe no dia da dose */
        h += "<circle class='rl-pessoa' cx='" + X(ent) + "' cy='" + (ye - 24) + "' r='4.5'/><path class='rl-pessoa' d='M" + (X(ent) - 7) + "," + (ye - 5) + " a7,7 0 0 1 14,0 z'/>";
        h += "<text class='rl-sub' x='" + X(ent) + "' y='" + (ye - 33) + "' text-anchor='middle'>o paciente recebe</text>";
      }
    }
    if (completo) { /* a molécula no dia 0: o núcleo de ver e o de tratar */
      var iv = opts.isoVer, cx0 = X(0) + 10, cy0 = Y(1) - 2;
      h += "<circle cx='" + (cx0 + 6) + "' cy='" + cy0 + "' r='9' class='at-nuc' fill='" + passoCor("V") + "'/><text class='at-nuc-rot' x='" + (cx0 + 6) + "' y='" + (cy0 + 2.6) + "' text-anchor='middle'>" + esc(iv ? iv.simbolo.replace(/-.*/, "") : "V") + "</text>";
      h += "<circle cx='" + (cx0 + 20) + "' cy='" + (cy0 + 2) + "' r='10.5' class='at-nuc' fill='" + passoCor("T") + "'/><text class='at-nuc-rot' x='" + (cx0 + 20) + "' y='" + (cy0 + 4.8) + "' text-anchor='middle'>" + esc(iso.simbolo.replace(/-.*/, "")) + "</text>";
      /* V · T · R no eixo do tempo */
      [["V", 0, "start"], ["T", ent !== null ? ent : 21, "middle"], ["R", c0 !== null ? c0 : 28, "middle"]].forEach(function (m) {
        if (m[1] > dias) return;
        var p = PASSO[m[0]];
        h += "<line x1='" + X(m[1]) + "' y1='" + y1 + "' x2='" + X(m[1]) + "' y2='" + (y1 + 16) + "' stroke='" + passoCor(m[0]) + "' stroke-width='2'/>";
        h += "<text class='rl-passo' x='" + X(m[1]) + "' y='" + (y1 + 27) + "' text-anchor='" + m[2] + "' fill='" + passoCor(m[0]) + "'>" + (m[0] === "R" ? "↻ " : m[0] + " ") + esc(p ? p.nome : m[0]) + "</text>";
      });
    }
    if (!opts.semFrase) {
      var frase = (rel("relogio_frase") || "cada dia de atraso leva {perda} da atividade de {isotopo}").replace("{perda}", pt(perdaPorDia(iso) * 100, 1) + "%").replace("{isotopo}", iso.simbolo);
      if (completo) h += "<text class='rl-frase' x='" + x0 + "' y='" + (H - 4) + "'>" + esc(quebra(frase, Math.round(W / 5.2))[0]) + "</text>";
      else quebra(frase, Math.round(W / 5.4)).slice(0, 2).forEach(function (l, i) { h += "<text class='rl-frase' x='" + x0 + "' y='" + (H - 12 + i * 10) + "'>" + esc(l) + "</text>"; });
    }
    return h + "</svg>";
  }

  /* ================= 0 · ABERTURA: a molécula, peça por peça (29/10/2026) =================
     À esquerda (svg#atomo, 480 × 440): a anatomia do radiofármaco, de cima para baixo — o radionuclídeo (o par: o
     núcleo de ver e o de tratar), o quelante que o segura, o vetor que acha o alvo e o alvo na célula. À direita,
     quatro caixas numeradas (anatomia.csv): a física da parte, o seu análogo no projeto e a aba que abre. O usuário
     escolheu este esqueleto entre quatro (opcoes_abertura.html) porque é uma coisa só para quem bate o olho; o relógio
     da dose foi para as Jornadas e a reação em cadeia para a Direção. */
  var atomo = document.getElementById("atomo"), leituraAbre = document.getElementById("leitura-abre");
  var partesEl = {}, caixasEl = {};
  function isoTerapeuticos() { return (D.isotopos || []).filter(function (i) { return (i.uso || []).indexOf("tratar") >= 0 && (i.terapias || []).length; }); }
  function isoDeVer() { return (D.isotopos || []).filter(function (i) { return i.emissao === "beta_mais"; })[0] || (D.isotopos || []).filter(function (i) { return (i.uso || []).indexOf("ver") >= 0; })[0]; }
  function interpola(txt, isoV, isoT) {
    var alc = isoT && isoT.alcance_mm ? pt(num(isoT.alcance_mm), num(isoT.alcance_mm) % 1 ? 1 : 0) + " mm" : "";
    return String(txt || "").replace(/\{ver\}/g, isoV ? isoV.simbolo : "").replace(/\{tratar\}/g, isoT ? isoT.simbolo : "").replace(/\{alcance\}/g, alc);
  }
  function montaAtomo() {
    if (!atomo || atomo.firstChild) return;
    var ANA = (D.anatomia || []).slice(), isoT = isoTerapeuticos()[0], isoV = isoDeVer();
    var defs = el("defs", {}, atomo), grad = el("radialGradient", { id: "at-brilho" }, defs);
    el("stop", { offset: "0", "stop-color": "#f5d98a", "stop-opacity": .8 }, grad);
    el("stop", { offset: "1", "stop-color": "#f5d98a", "stop-opacity": 0 }, grad);
    /* quatro objetos, um por parte, como na imagem de referência: a esfera, a corrente, o plugue, o receptor.
       A cena é larga (560 × 440) para ocupar a coluna inteira; os objetos crescem e as caixas ganham duas metades. */
    var x = 82, ancora = {};
    function parte(id, fn) {
      var a = ANA.filter(function (r) { return r.id === id; })[0];
      var g = el("g", { "class": "at-parte", "data-parte": id, role: "button", tabindex: 0, "aria-label": a ? a.parte + ": " + a.analogo : id }, atomo);
      fn(g);
      partesEl[id] = g;
      if (a) clicavel(g, function () { acendeParte(id); abre(a.vista, a.item || undefined); });
      return g;
    }
    /* 1 · o radionuclídeo: uma esfera só, meia de ver e meia de tratar, com o brilho da emissão */
    parte("radionuclideo", function (g) {
      el("circle", { cx: x, cy: 62, r: 62, fill: "url(#at-brilho)" }, g);
      el("path", { d: "M" + x + ",30 a32,32 0 0 0 0,64 z", "class": "at-obj at-esfera", fill: passoCor("V") }, g);
      el("path", { d: "M" + x + ",30 a32,32 0 0 1 0,64 z", "class": "at-obj at-esfera", fill: passoCor("T") }, g);
      texto(g, x - 15, 66, isoV ? isoV.simbolo.replace(/-.*/, "") : "V", "at-nuc-rot at-nuc-rot-g", "middle");
      texto(g, x + 15, 66, isoT ? isoT.simbolo.replace(/-.*/, "") : "T", "at-nuc-rot at-nuc-rot-g", "middle");
    });
    ancora.radionuclideo = [x + 34, 62];
    /* 2 · o quelante: a corrente que segura a esfera */
    parte("quelante", function (g) {
      [100, 126, 152, 178].forEach(function (y, i) { el("rect", { x: x - (i % 2 ? 7 : 11), y: y, width: i % 2 ? 14 : 22, height: 28, rx: 8, "class": "at-obj at-elo" }, g); });
    });
    ancora.quelante = [x + 12, 150];
    /* 3 · o vetor: o plugue que encaixa no receptor */
    parte("vetor", function (g) {
      el("path", { d: "M" + (x - 8) + ",212 h16 v28 h12 v14 h-10 v16 h-20 v-16 h-10 v-14 h12 z", "class": "at-obj at-plugue" }, g);
      if (rel("atomo_ligante")) el("title", {}, g).textContent = rel("atomo_ligante");
    });
    ancora.vetor = [x + 20, 246];
    /* 4 · o alvo: o receptor na superfície da célula */
    parte("alvo", function (g) {
      el("path", { d: "M" + (x - 28) + ",292 h56 v36 a7,7 0 0 1 -7,7 h-42 a7,7 0 0 1 -7,-7 z M" + (x - 12) + ",292 v14 h24 v-14 z", "class": "at-obj at-receptor", "fill-rule": "evenodd" }, g);
    });
    ancora.alvo = [x + 28, 314];
    /* as quatro caixas, cada uma em duas metades do mesmo peso: NA MOLÉCULA (a ciência) = NO PROJETO (a analogia) */
    var bx = 160, bw = 470, bh = 82, meio = bx + 244;
    ANA.forEach(function (a, i) {
      var y = 12 + i * 90, anc = ancora[a.id] || [x, y + 24];
      var v = VISTAS.filter(function (z) { return z.id === a.vista; })[0];
      el("line", { x1: anc[0], y1: anc[1], x2: bx, y2: y + 26, "class": "at-lider" }, atomo);
      var g = el("g", { "class": "at-caixa cam-" + a.vista, "data-parte": a.id, role: "button", tabindex: 0, "aria-label": a.parte + ": " + a.analogo }, atomo);
      el("rect", { x: bx, y: y, width: bw, height: bh, rx: 8, "class": "at-caixa-fundo" }, g);
      el("rect", { x: bx + 1, y: y + 8, width: 4, height: bh - 16, rx: 2, "class": "at-caixa-borda" }, g);
      texto(g, bx + 14, y + 31, String(i + 1), "at-caixa-n");
      /* a metade da ciência */
      texto(g, bx + 30, y + 15, "NA MOLÉCULA · " + a.parte.toUpperCase(), "at-caixa-e");
      quebra(interpola(a.fisica, isoV, isoT), 34).slice(0, 3).forEach(function (l, k) { texto(g, bx + 30, y + 30 + k * 13.5, l, "at-caixa-c"); });
      /* o sinal de igual: a correlação */
      el("line", { x1: meio, y1: y + 10, x2: meio, y2: y + bh - 10, "class": "at-caixa-div" }, g);
      el("rect", { x: meio - 9, y: y + bh / 2 - 9, width: 18, height: 18, rx: 9, "class": "at-igual-fundo" }, g);
      texto(g, meio, y + bh / 2 + 4.5, "=", "at-igual", "middle");
      /* a metade do projeto */
      texto(g, meio + 16, y + 15, "NO PROJETO" + (v ? " → " + v.n + " " + v.rot : ""), "at-caixa-e at-caixa-e-aba");
      quebra(a.analogo, 34).slice(0, 3).forEach(function (l, k) { texto(g, meio + 16, y + 30 + k * 13.5, l, "at-caixa-v"); });
      caixasEl[a.id] = g;
      clicavel(g, function () { acendeParte(a.id); abre(a.vista, a.item || undefined); });
    });
    textoLinhas(atomo, 320, 392, rel("atomo_molecula") || "A mesma molécula leva o olho e o remédio. A mesma jornada precisa de um dono.", "at-mol-rot serif", "middle", 84, 14);
    texto(atomo, 320, 428, "na molécula, à esquerda; no projeto, à direita · clique numa parte ou numa caixa para abrir a aba", "at-sub", "middle");
  }
  function acendeParte(id) {
    selecao.abertura = id || null;
    Object.keys(caixasEl).forEach(function (k) { caixasEl[k].classList.toggle("on", k === id); });
    Object.keys(partesEl).forEach(function (k) { partesEl[k].classList.toggle("on", k === id); });
    if (vistaAtual === "abertura") estadoNaUrl();
  }
  /* a capa: sete perguntas (5W2H) para quem chega sem contexto; "para quem" mostra os oito grupos com a cobertura
     (quem não ouvimos já aparece na capa); "como" são os três passos; "quanto" é a régua do ciclo hoje × a meta */
  function regua() {
    var hoje = CONT.ciclo_hoje_dias, meta = CONT.ciclo_meta_dias;
    if (!hoje || !meta) return "";
    var W = 600, x0 = 20, x1 = W - 20, y = 50, max = Math.max(hoje.valor, meta.valor) * 1.08;
    function X(n) { return +(x0 + (x1 - x0) * n / max).toFixed(1); }
    var h = "<svg class='regua-svg' viewBox='0 0 " + W + " 100' role='img' aria-label='" + esc(hoje.valor + " " + hoje.unidade + " hoje, " + meta.valor + " " + meta.unidade + " de meta") + "'>";
    h += "<line class='rg-base' x1='" + x0 + "' y1='" + y + "' x2='" + x1 + "' y2='" + y + "'/>";
    h += "<line class='rg-hoje' x1='" + x0 + "' y1='" + y + "' x2='" + X(hoje.valor) + "' y2='" + y + "'/>";
    h += "<line class='rg-meta' x1='" + x0 + "' y1='" + (y + 14) + "' x2='" + X(meta.valor) + "' y2='" + (y + 14) + "'/>";
    h += "<text class='rg-num rg-risco' x='" + X(hoje.valor) + "' y='" + (y - 12) + "' text-anchor='end'>" + hoje.valor + "</text><text class='rg-rot' x='" + x0 + "' y='" + (y - 14) + "'>" + esc(hoje.rotulo.toLowerCase()) + " · " + esc(hoje.unidade) + "</text>";
    h += "<text class='rg-num rg-ok' x='" + (X(meta.valor) + 8) + "' y='" + (y + 22) + "'>" + meta.valor + "</text><text class='rg-rot' x='" + (X(meta.valor) + 40) + "' y='" + (y + 22) + "'>" + esc(meta.rotulo.toLowerCase()) + " · " + esc(meta.unidade) + "</text>";
    return h + "</svg>";
  }
  function leituraAbertura() {
    if (!leituraAbre) return;
    function linha(rot, corpo, cls) { return "<div class='w5" + (cls ? " " + cls : "") + "'><dt>" + rot + "</dt><dd>" + corpo + "</dd></div>"; }
    var grupos = (D.grupos || []).map(function (g) {
      return "<i class='cob-" + g.cobertura + (g.foco === "sim" ? " foco" : "") + "' title='" + esc(g.por_que) + "'>" + esc(g.curto || g.nome) + "</i>";
    }).join("");
    var passos = PASSOS.map(function (p, i) {
      return "<button type='button' class='w5-passo' data-passo='" + p.sigla + "' style='--cor:" + p.cor + "'><b>" + SUP[p.sigla] + " " + esc(p.nome) + "</b>" + esc(rel("w_como_" + (i + 1)) || p.verbo) + "</button>";
    }).join("");
    var voz = rel("voz");
    var html = "<dl class='w5h'>" +
      linha("O quê", esc(ponto(rel("w_oque")))) +
      linha("Por quê", esc(ponto(rel("w_porque"))) + (voz ? "<q class='w5-voz' title='" + esc(rel("voz_fonte")) + "'>" + esc(voz.split(/\.\s+/).filter(Boolean).pop()) + "</q>" : "")) +
      linha("Para quem", esc(ponto(rel("w_quem"))) + (grupos ? "<span class='w5-pes'>" + grupos + "</span>" : ""), "w5-quem") +
      linha("Onde", esc(ponto(rel("w_onde")))) +
      linha("Quando", esc(ponto(rel("w_quando")))) +
      linha("Como", esc(ponto(rel("w_como"))) + "<span class='w5-passos'>" + passos + "</span>", "w5-como") +
      linha("Quanto", esc(ponto(rel("w_quanto"))) + regua(), "w5-quanto") +
      "</dl>" + elo("abertura");
    escreve(leituraAbre, html);
    Array.prototype.forEach.call(leituraAbre.querySelectorAll(".w5-passo"), function (b) {
      b.addEventListener("click", function () { passoAtual = b.getAttribute("data-passo"); abre("jornadas"); });
    });
  }

  /* ================= 1 · ECOSSISTEMA: quem regula, paga, fornece e trata =================
     Duas colunas (molde: a Longevidade): dentro do Einstein à esquerda, fora à direita. As setas (fluxos.csv) ficam
     ocultas até a seleção: clicar num ator mostra tudo o que chega e sai dele, numerado; a leitura lista as relações. */
  var eco = document.getElementById("eco"), leituraEco = document.getElementById("leitura-eco");
  var caixasEco = {}, setasEco = [];
  (function montaEco() {
    if (!eco || !(D.atores || []).length) return;
    var defs = el("defs", {}, eco);
    Object.keys(ENQ).forEach(function (k) {
      var mk = el("marker", { id: "m-enq-" + k, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, defs);
      el("path", { d: "M0,0 L10,5 L0,10 z", fill: ENQ[k].cor }, mk);
    });
    /* quatro colunas (colunas_ecossistema.csv): quem chega · Einstein clínico · Einstein de apoio · fora do Einstein.
       Um ator com `contem` (o Centro de Teranóstico) é o hub da sua coluna: fica no alto, em destaque, com uma chave
       até as suas equipes; selecioná-lo mostra tudo o que chega e sai delas. */
    var COLS = (D.colunas_ecossistema || []).slice(), n = COLS.length || 1, cw = 945 / n, BW = Math.min(262, cw - 40), BH = 42;
    var pos = {};
    COLS.forEach(function (c, ci) {
      var cx = cw * ci + cw / 2, lista = D.atores.filter(function (a) { return a.coluna === c.id; });
      el("rect", { x: cw * ci + 5, y: 16, width: cw - 10, height: 526, rx: 14, "class": "eco-coluna col-" + c.id }, eco);
      texto(eco, cx, 34, c.rotulo, "grupo-rotulo", "middle");
      texto(eco, cx, 48, c.sub, "grupo-sub", "middle");
      var y0 = 84, y1 = 516, passo = lista.length > 1 ? Math.min(66, (y1 - y0) / (lista.length - 1)) : 0;
      lista.forEach(function (a, i) {
        var y = y0 + i * passo, hub = (a.contem || []).length > 0;
        pos[a.id] = { x: cx, y: y, col: ci };
        var g = el("g", { "class": "estacao e-" + a.lado + " c-" + a.confianca + (hub ? " e-centro" : ""), transform: "translate(" + cx + "," + y + ")", role: "button", tabindex: 0, "aria-label": a.nome }, eco);
        el("rect", { x: -BW / 2, y: -BH / 2, width: BW, height: BH, rx: 9 }, g);
        texto(g, 0, -3, a.curto, "nome", "middle");
        texto(g, 0, 12, quebra(a.papel, 50)[0] + (quebra(a.papel, 50).length > 1 ? "…" : ""), "papel", "middle");
        caixasEco[a.id] = g;
        clicavel(g, function () { selecionaEco(selecao.ecossistema === "a:" + a.id ? null : "a:" + a.id); estadoNaUrl(); });
      });
      /* a chave do hub até as equipes que ele contém */
      lista.forEach(function (a) {
        if (!(a.contem || []).length) return;
        var ys = a.contem.map(function (id) { return pos[id] ? pos[id].y : null; }).filter(function (y) { return y !== null; });
        if (!ys.length) return;
        var xk = cx - BW / 2 - 7, ya = Math.min.apply(null, ys) - BH / 2, yb = Math.max.apply(null, ys) + BH / 2;
        el("path", { d: "M" + (xk + 5) + "," + (pos[a.id].y + BH / 2) + " L" + xk + "," + (pos[a.id].y + BH / 2) + " L" + xk + "," + yb, "class": "eco-chave" }, eco);
        ys.forEach(function (y) { el("line", { x1: xk, y1: y, x2: xk + 5, y2: y, "class": "eco-chave" }, eco); });
      });
    });
    var gS = el("g", {}, eco), usados = {};
    (D.fluxos || []).forEach(function (f) {
      var a = pos[f.de], b = pos[f.para];
      if (!a || !b) return;
      var par = [f.de, f.para].sort().join("|"), nth = (usados[par] = (usados[par] || 0) + 1) - 1, desvio = nth * 10 * (f.de < f.para ? 1 : -1), d, lx, ly;
      if (a.col === b.col) { /* na mesma coluna: um arco pela calha à direita da coluna */
        var borda = a.x + BW / 2, cx2 = borda + 14 + nth * 6, my = (a.y + b.y) / 2;
        d = "M" + borda + "," + a.y + " Q" + cx2 + "," + my + " " + borda + "," + b.y; lx = (borda + cx2) / 2 + 4; ly = my;
      } else {
        var dir = a.col < b.col ? 1 : -1;
        var x1 = a.x + dir * BW / 2, y1 = a.y + desvio, x2 = b.x - dir * BW / 2, y2 = b.y + desvio;
        var c1 = x1 + dir * 60, c2 = x2 - dir * 60;
        d = "M" + x1 + "," + y1 + " C" + c1 + "," + y1 + " " + c2 + "," + y2 + " " + x2 + "," + y2; lx = (x1 + 3 * c1 + 3 * c2 + x2) / 8; ly = (y1 + y2) / 2;
      }
      var p = el("path", { d: d, "class": "fluxo t-" + f.tipo + " f-enq-" + f.enquadramento, "marker-end": "url(#m-enq-" + f.enquadramento + ")" }, gS);
      var r = el("g", { "class": "rot-fluxo" }, eco);
      el("circle", { cx: lx, cy: ly, r: 9, fill: ENQ[f.enquadramento] ? ENQ[f.enquadramento].cor : "#0C3A6F" }, r);
      var t = texto(r, lx, ly + 3.5, "", "", "middle");
      [p, r].forEach(function (x) {
        x.addEventListener("mouseenter", function () { realcaFluxo(f.id, true); });
        x.addEventListener("mouseleave", function () { realcaFluxo(f.id, false); });
        x.addEventListener("click", function (ev) { ev.stopPropagation(); selecionaEco("f:" + f.id); estadoNaUrl(); });
      });
      setasEco.push({ f: f, p: p, r: r, t: t });
    });
    texto(eco, 940, 542, "setas: cor = quem paga ou autoriza · cheia = acontece · tracejada = a confirmar · pontilhada = regra", "nota-svg", "end");
  })();
  /* ---- seguir o ciclo: as relações de cada passo acendem uma a uma (fluxos.etapas) ----
     Um passo mostra só as relações daquele momento, numeradas na ordem da jornada; um ator mostra as suas, com a
     direção explícita (sai · chega); o hub (o Centro) mostra só o que atravessa a sua fronteira. A lista e as setas
     se respondem: o mouse numa linha destaca a seta e apaga as outras. (O usuário, 29/10: "ao clicar me sinto perdido".) */
  var numFluxo = {}, etapaEco = null, visiveisEco = [], ecoPassos = null;
  (function montaPassosEco() {
    var cena = eco && eco.parentNode; if (!cena || !ETAPAS.length) return;
    ecoPassos = document.createElement("div"); ecoPassos.className = "eco-passos"; ecoPassos.setAttribute("role", "tablist"); ecoPassos.setAttribute("aria-label", "seguir o ciclo, passo a passo");
    ecoPassos.innerHTML = "<span class='ep-rot'>SEGUIR O CICLO</span>" + ETAPAS.map(function (e, i) {
      var qt = (D.fluxos || []).filter(function (f) { return (f.etapas || []).indexOf(e.id) >= 0; }).length;
      return "<button type='button' class='ep' role='tab' data-etapa='" + e.id + "' style='--cor:" + passoCor(e.passo) + "' title='" + esc(e.nome) + " · " + qt + " relações'><i>" + (i + 1) + "</i>" + esc(e.curto) + "<small>" + qt + "</small></button>";
    }).join("") + "<button type='button' class='ep ep-todos' role='tab' data-etapa='' title='todas as relações do ator escolhido'>tudo</button>";
    cena.insertBefore(ecoPassos, eco);
    Array.prototype.forEach.call(ecoPassos.querySelectorAll(".ep"), function (b) {
      b.addEventListener("click", function () { selecionaEco(selecao.ecossistema, b.dataset.etapa || null); estadoNaUrl(); });
    });
  })();
  function ordemEtapa(f) { var m = 99; (f.etapas || []).forEach(function (e) { var i = ETAPAS.map(function (x) { return x.id; }).indexOf(e); if (i >= 0 && i < m) m = i; }); return m; }
  function selecionaEco(item, etapa) {
    if (etapa !== undefined) etapaEco = etapa || null;
    selecao.ecossistema = item || null;
    var ator = item && item.indexOf("a:") === 0 ? item.slice(2) : (item && ATOR[item] ? item : null);
    var fluxo = item && item.indexOf("f:") === 0 ? item.slice(2) : null;
    var hub = ator && ATOR[ator] && (ATOR[ator].contem || []).length ? ATOR[ator] : null;
    var grupoAtor = {}; if (ator) { grupoAtor[ator] = true; (hub ? hub.contem : []).forEach(function (id) { grupoAtor[id] = true; }); }
    visiveisEco = setasEco.filter(function (s) {
      var f = s.f;
      if (fluxo) return f.id === fluxo;
      if (!ator && !etapaEco) return false;
      if (ator && !(grupoAtor[f.de] || grupoAtor[f.para])) return false;
      if (hub && grupoAtor[f.de] && grupoAtor[f.para]) return false; /* dentro do Centro: não é o que chega nem o que sai */
      if (etapaEco && (f.etapas || []).indexOf(etapaEco) < 0) return false;
      return true;
    }).sort(function (x, y) { return ordemEtapa(x.f) - ordemEtapa(y.f); });
    numFluxo = {};
    var tocados = {};
    setasEco.forEach(function (s) { s.p.classList.remove("vis", "realce", "dim", "fundo"); s.r.classList.remove("vis", "dim"); });
    visiveisEco.forEach(function (s, i) { numFluxo[s.f.id] = i + 1; s.t.textContent = String(i + 1); s.p.classList.add("vis"); s.r.classList.add("vis"); tocados[s.f.de] = tocados[s.f.para] = true; });
    setasEco.forEach(function (s) { if (!s.p.classList.contains("vis")) s.p.classList.add("fundo"); });
    if (ator) tocados[ator] = true;
    var algo = !!(ator || etapaEco || fluxo);
    Object.keys(caixasEco).forEach(function (id) {
      caixasEco[id].classList.toggle("foco", !!tocados[id] && (!ator || id === ator || !!grupoAtor[id]));
      caixasEco[id].classList.toggle("apagada", algo && !tocados[id]);
    });
    if (ecoPassos) Array.prototype.forEach.call(ecoPassos.querySelectorAll(".ep"), function (b) { b.classList.toggle("on", (b.dataset.etapa || null) === etapaEco); });
    leituraEcossistema(ator, fluxo, grupoAtor, hub);
  }
  function realcaFluxo(id, on) {
    visiveisEco.forEach(function (s) { s.p.classList.toggle("realce", on && s.f.id === id); s.p.classList.toggle("dim", on && s.f.id !== id); s.r.classList.toggle("dim", on && s.f.id !== id); });
    if (leituraEco) Array.prototype.forEach.call(leituraEco.querySelectorAll("[data-fluxo]"), function (li) { li.classList.toggle("realce", on && li.dataset.fluxo === id); });
  }
  function itemFluxo(f, ativo, grupoAtor) {
    var nn = numFluxo[f.id], e = ENQ[f.enquadramento] || {}, dir = grupoAtor && Object.keys(grupoAtor).length ? (grupoAtor[f.de] ? "sai" : "chega") : "";
    var et = ETAPA[(f.etapas || [])[0]];
    return "<li class='clicavel t-" + f.tipo + (ativo ? " on" : "") + "' tabindex='0' data-fluxo='" + f.id + "' style='border-left-color:" + (e.cor || "#ccc") + "' title='" + esc((f.etapas || []).map(function (s) { return ETAPA[s] ? ETAPA[s].nome : s; }).join(" · ")) + "'>" +
      (nn ? "<span class='n' style='background:" + e.cor + "'>" + nn + "</span>" : "") +
      (dir ? "<span class='dir " + dir + "'>" + dir + "</span>" : "") +
      "<b>" + esc(ATOR[f.de] ? ATOR[f.de].curto : f.de) + " → " + esc(ATOR[f.para] ? ATOR[f.para].curto : f.para) + "</b>: " + esc(f.oque) +
      (et ? " <span class='et' style='color:" + passoCor(et.passo) + "'>" + esc(et.curto) + "</span>" : "") + "</li>";
  }
  function navEtapas() {
    var i = ETAPAS.map(function (e) { return e.id; }).indexOf(etapaEco), h = "<p class='ep-nav'>";
    if (i > 0) h += "<button type='button' class='ep-ir' data-etapa='" + ETAPAS[i - 1].id + "'>← " + esc(ETAPAS[i - 1].curto) + "</button>";
    if (i >= 0 && i < ETAPAS.length - 1) h += "<button type='button' class='ep-ir' data-etapa='" + ETAPAS[i + 1].id + "'>passo seguinte: " + esc(ETAPAS[i + 1].curto) + " →</button>";
    if (i === ETAPAS.length - 1) h += "<button type='button' class='ep-ir' data-etapa='" + ETAPAS[0].id + "'>↻ o ciclo recomeça: " + esc(ETAPAS[0].curto) + "</button>";
    return h + "</p>";
  }
  function leituraEcossistema(ator, fluxo, grupoAtor, hub) {
    var html = "", lista = visiveisEco.map(function (s) { return s.f; }), et = etapaEco && ETAPA[etapaEco];
    if (ator && ATOR[ator]) {
      var a = ATOR[ator], col = (D.colunas_ecossistema || []).filter(function (c) { return c.id === a.coluna; })[0];
      var internas = hub ? (D.fluxos || []).filter(function (f) { return grupoAtor[f.de] && grupoAtor[f.para]; }).length : 0;
      html += "<div class='bloco ficha'><div class='rotulo'>" + esc(col ? col.rotulo : "") + (a.grupo && GRUPO[a.grupo] ? " · " + esc(GRUPO[a.grupo].nome) : "") + " " + conf(a.confianca) + "</div><h3>" + esc(a.nome) + "</h3><p>" + esc(ponto(maiuscula(a.papel))) + "</p>" +
        (hub ? "<p class='dica'>Contém: " + hub.contem.map(function (id) { return ATOR[id] ? ATOR[id].curto : id; }).join(" · ") + ". Aqui, só o que atravessa a fronteira do Centro" + (internas ? "; entre as equipes há mais " + internas + " relações, visíveis ao clicar numa equipe" : "") + ".</p>" : "") + "</div>";
      var MAXREL = 8, mostra = lista.slice(0, MAXREL);
      html += "<div class='bloco'><div class='rotulo'>" + (et ? "No passo " + (ETAPAS.indexOf(et) + 1) + " · " + esc(et.nome) : "O que chega e sai") + " <span class='conf'>" + lista.length + "</span>" + (et ? " <button type='button' class='ep-ir ep-limpa' data-etapa=''>ver todos os passos</button>" : "") + "</div><ul class='lista'>" +
        (lista.length ? mostra.map(function (f) { return itemFluxo(f, false, grupoAtor); }).join("") : "<li>nenhuma relação " + (et ? "neste passo" : "registrada ainda") + "</li>") +
        (lista.length > MAXREL ? "<li class='dica'>e mais " + (lista.length - MAXREL) + ": siga o ciclo na faixa acima para ver passo a passo</li>" : "") + "</ul></div>";
    } else if (fluxo) {
      var fl = (D.fluxos || []).filter(function (f) { return f.id === fluxo; })[0];
      if (fl) html += "<div class='bloco'><div class='rotulo'>Uma relação " + tagEnq(fl.enquadramento, true) + " " + conf(fl.confianca) + "</div><ul class='lista'>" + itemFluxo(fl, true) + "</ul>" +
        "<p class='dica'>Passo: " + (fl.etapas || []).map(function (s) { return ETAPA[s] ? ETAPA[s].nome : s; }).join(" · ") + ". Clique numa caixa para ver tudo o que chega e sai dela.</p></div>";
    } else if (et) {
      var i = ETAPAS.indexOf(et), p = PASSO[et.passo];
      html += "<div class='bloco ficha'><div class='rotulo'><span class='passo-chip p-" + et.passo + "'>" + SUP[et.passo] + " " + esc(p ? p.nome : et.passo) + "</span>passo " + (i + 1) + " de " + ETAPAS.length + " " + conf(et.confianca) + "</div><h3>" + esc(et.nome) + "</h3>" +
        "<p>" + esc(ponto(maiuscula(et.curto))) + (et.dono_hoje === "ninguem" ? " <span class='c-aberto'>Ninguém responde por este passo.</span>" : (ATOR[et.dono_hoje] ? " Responde: " + esc(ATOR[et.dono_hoje].curto) + "." : "")) + "</p>" +
        (et.gate ? "<p class='risco'>O que falta aqui: " + esc(et.gate) + "</p>" : "") + "</div>";
      html += "<div class='bloco'><div class='rotulo'>Quem se relaciona neste passo <span class='conf'>" + lista.length + "</span></div><ul class='lista'>" +
        (lista.length ? lista.map(function (f) { return itemFluxo(f, false); }).join("") : "<li>nenhuma relação registrada neste passo</li>") + "</ul>" + navEtapas() + "</div>";
      var tese = achadosDe("ecossistema")[0];
      if (tese && lista.length <= 6) html += "<div class='bloco'>" + achadoHtml(tese, "tese", true) + "</div>";
    } else {
      html += "<div class='bloco'>" + achadosHtml("ecossistema", true, 4) + "</div>";
    }
    html += elo("ecossistema");
    escreve(leituraEco, html);
    Array.prototype.forEach.call(leituraEco.querySelectorAll("[data-fluxo]"), function (li) {
      clicavel(li, function () { var alvo = "f:" + li.dataset.fluxo; selecionaEco(selecao.ecossistema === alvo ? null : alvo); estadoNaUrl(); });
      li.addEventListener("mouseenter", function () { realcaFluxo(li.dataset.fluxo, true); });
      li.addEventListener("mouseleave", function () { realcaFluxo(li.dataset.fluxo, false); });
    });
    Array.prototype.forEach.call(leituraEco.querySelectorAll(".ep-ir"), function (b) {
      b.addEventListener("click", function () { selecionaEco(b.classList.contains("ep-limpa") ? selecao.ecossistema : null, b.dataset.etapa || null); estadoNaUrl(); });
    });
  }

  /* ================= 2 · SISTEMA: hoje, de memória · com a camada de coordenação =================
     Os mesmos sistemas nos dois olhares. No 1, a planilha e o e-mail no centro, ligados a tudo por traço vermelho
     (as passagens manuais de integracoes.csv). No 2, a camada de coordenação por cima, com os três passos como bandas,
     ligada ao que já existe por traço verde tracejado (o que ainda não existe). Abre lado a lado; o clique foca. */
  var sisFoco = document.getElementById("sis"), sis = sisFoco, leituraSis = document.getElementById("leitura-sis");
  var DUO = { 1: document.getElementById("sis1"), 2: document.getElementById("sis2") };
  var tempoAtual = 2, comparativo = true, caixasSis = {};
  var TEMPOS = [[1, rel("tempo1_titulo") || "Hoje, de memória", rel("tempo1_sub") || "cada sistema faz a sua parte; a coordenação mora na planilha, no e-mail e na cabeça de quem lembra"],
    [2, rel("tempo2_titulo") || "Com a camada de coordenação", rel("tempo2_sub") || "a mesma gente e os mesmos sistemas, com um dono por passo, prazos e histórico por cima"]];
  var temposEl = document.getElementById("tempos"), vSistema = document.getElementById("v-sistema");
  if (temposEl) {
    temposEl.innerHTML = TEMPOS.map(function (t) { return "<button type='button' data-tempo='" + t[0] + "' role='tab'><b>" + t[0] + "</b><span class='tp-t'>" + esc(t[1]) + "</span><small>" + esc(t[2]) + "</small></button>"; }).join("");
    Array.prototype.forEach.call(temposEl.querySelectorAll("button"), function (b) { b.addEventListener("click", function () { escolheTempo(+b.dataset.tempo); }); });
  }
  function tempo(n) {
    tempoAtual = n;
    Array.prototype.forEach.call(temposEl.querySelectorAll("button"), function (b) { b.classList.toggle("on", !comparativo && +b.dataset.tempo === n); });
    caixasSis = {};
    desenhaSis(sisFoco, n, true);
  }
  function desenhaSis(svg, n, foco) { sis = svg; while (sis.firstChild) sis.removeChild(sis.firstChild); montaSistema(n, foco); sis = sisFoco; }
  function escolheTempo(n, id) { comparativo = false; if (vSistema) vSistema.classList.remove("cheia"); tempo(n); selecionaSis(id || null); estadoNaUrl(); }
  function comparar() {
    comparativo = true; selecao.sistema = null;
    if (vSistema) vSistema.classList.add("cheia");
    Array.prototype.forEach.call(temposEl.querySelectorAll("button"), function (b) { b.classList.remove("on"); });
    leituraSis.innerHTML = ""; estadoNaUrl(); reencaixa();
  }
  var GRUPOS_SIS = [["faturamento", "FATURAMENTO"], ["navegacao", "NAVEGAÇÃO E SENHAS"], ["clinico", "CLÍNICOS"], ["externo", "FORA DO EINSTEIN"]];
  [1, 2].forEach(function (n) {
    if (!DUO[n]) return;
    desenhaSis(DUO[n], n, false);
    DUO[n].addEventListener("click", function (ev) { if (!(ev.target.closest && ev.target.closest(".clicavel,.sis-no,.sis-banda"))) escolheTempo(n); });
  });
  function montaSistema(n, foco) {
    if (!(D.sistemas || []).length) return;
    var aoClicar = foco ? function (id) { selecionaSis(selecao.sistema === id ? null : id); estadoNaUrl(); } : function (id) { escolheTempo(n, id); };
    var pos = {}, BW = 150, BH = 40;
    function caixa(s, x, y, w, h) {
      var g = el("g", { "class": "sis-no g-" + s.grupo + " est-" + s.estado + " clicavel", tabindex: 0, role: "button", "aria-label": s.nome }, sis);
      el("rect", { x: x, y: y, width: w, height: h, rx: 6 }, g);
      texto(g, x + w / 2, y + 17, s.nome, "t", "middle");
      texto(g, x + w / 2, y + 31, quebra(s.faz, 30)[0] + (quebra(s.faz, 30).length > 1 ? "…" : ""), "s", "middle");
      pos[s.id] = { x: x, y: y, w: w, h: h, g: g };
      clicavel(g, function () { aoClicar(s.id); });
      if (foco) caixasSis[s.id] = g;
      return g;
    }
    /* as ilhas: quatro grupos em colunas, na faixa de baixo; a coordenação (hoje ou proposta) por cima */
    var cols = GRUPOS_SIS.length, cw = 880 / cols, yBase = n === 1 ? 250 : 236;
    GRUPOS_SIS.forEach(function (gr, i) {
      var lista = D.sistemas.filter(function (s) { return s.grupo === gr[0]; }), x0 = 10 + i * cw;
      texto(sis, x0 + cw / 2, yBase - 8, gr[1], "sis-grupo-rot", "middle");
      lista.forEach(function (s, j) { caixa(s, x0 + (cw - BW) / 2, yBase + j * (BH + 6), BW, BH); });
    });
    var ids = D.sistemas.filter(function (s) { return GRUPOS_SIS.some(function (g) { return g[0] === s.grupo; }); }).map(function (s) { return s.id; });
    function centro(id) { var p = pos[id]; return p ? [p.x + p.w / 2, p.y] : null; }
    if (n === 1) {
      texto(sis, 880, 24, TEMPOS[0][1], "tempo-rot risco", "end");
      var hoje = D.sistemas.filter(function (s) { return s.grupo === "coordenacao_hoje"; });
      hoje.forEach(function (s, j) { caixa(s, 300 + j * 170, 60, 150, 44); });
      /* a planilha e o e-mail falam com tudo: o traço vermelho de quem digita de novo */
      (D.integracoes || []).forEach(function it(i) {
        var a = pos[i.de], b = pos[i.para];
        if (!a || !b || i.tipo === "proposta") return;
        var p1, p2, d;
        if (Math.abs(a.y - b.y) < 12) { /* na mesma linha: uma reta de lado a lado, o rótulo em cima, curto */
          var esq = a.x < b.x ? a : b, dir = a.x < b.x ? b : a;
          p1 = [esq.x + esq.w, esq.y + esq.h / 2]; p2 = [dir.x, dir.y + dir.h / 2];
          d = "M" + p1[0] + "," + p1[1] + " L" + p2[0] + "," + p2[1];
        } else {
          p1 = [a.x + a.w / 2, a.y + a.h]; p2 = centro(i.para);
          if (a.y > b.y) { p1 = [a.x + a.w / 2, a.y]; p2 = [b.x + b.w / 2, b.y + b.h]; }
          var my = (p1[1] + p2[1]) / 2;
          d = "M" + p1[0] + "," + p1[1] + " C" + p1[0] + "," + my + " " + p2[0] + "," + my + " " + p2[0] + "," + p2[1];
        }
        el("path", { d: d, "class": "sis-fio i-" + i.tipo }, sis);
        var mx = (p1[0] + p2[0]) / 2;
        if (i.rotulo && i.tipo === "manual" && Math.abs(a.y - b.y) < 12) quebra(i.rotulo, 16).slice(0, 2).forEach(function (l, k) { texto(sis, mx, p1[1] - 14 + k * 10, l, "sis-fio-rot", "middle"); });
      });
      hoje.forEach(function (s) {
        var a = pos[s.id];
        ids.forEach(function (id) {
          if ((D.integracoes || []).some(function (i) { return (i.de === s.id && i.para === id) || (i.para === s.id && i.de === id); })) return;
          var b = pos[id], p1 = [a.x + a.w / 2, a.y + a.h], p2 = [b.x + b.w / 2, b.y], my = (p1[1] + p2[1]) / 2;
          el("path", { d: "M" + p1[0] + "," + p1[1] + " C" + p1[0] + "," + my + " " + p2[0] + "," + my + " " + p2[0] + "," + p2[1], "class": "sis-fio i-manual", opacity: .35 }, sis);
        });
      });
      var c4 = CONT.sistemas_fragmentados, c15 = CONT.min_por_senha, c6 = CONT.telas_por_senha;
      texto(sis, 10, 24, (c4 ? "pelo menos " + c4.valor + " sistemas e uma planilha" : "sistemas em separado"), "tempo-rot");
      if (c15 && c6) texto(sis, 10, 54, "até " + c15.valor + " min por senha, em " + c6.valor + " telas", "nota-svg");
      texto(sis, 10, 40, "ninguém vê o ciclo inteiro: a coordenação é de memória, por mensagem, sem histórico", "nota-svg");
    } else {
      texto(sis, 880, 24, TEMPOS[1][1], "tempo-rot ok", "end");
      var coord = D.sistemas.filter(function (s) { return s.grupo === "proposta"; })[0];
      if (coord) {
        var g = el("g", { "class": "sis-no g-proposta est-" + coord.estado + " clicavel", tabindex: 0, role: "button", "aria-label": coord.nome }, sis);
        el("rect", { x: 20, y: 44, width: 860, height: 136, rx: 10 }, g);
        texto(g, 36, 64, coord.nome.toUpperCase(), "t");
        texto(g, 36, 79, coord.faz, "s");
        pos[coord.id] = { x: 20, y: 44, w: 860, h: 136, g: g };
        clicavel(g, function () { aoClicar(coord.id); });
        if (foco) caixasSis[coord.id] = g;
        /* as três bandas: ver · tratar · reavaliar, com as etapas de cada uma */
        PASSOS.forEach(function (p, i) {
          var bx = 36 + i * 282, bw = 266;
          var b = el("g", { "class": "sis-banda clicavel banda-" + p.sigla, tabindex: 0, role: "button", "aria-label": SUP[p.sigla] + " " + p.nome }, sis);
          el("rect", { x: bx, y: 90, width: bw, height: 82, rx: 8, stroke: p.cor }, b);
          texto(b, bx + 12, 108, SUP[p.sigla] + " · " + p.nome.toUpperCase(), "sis-banda-rot").setAttribute("fill", p.cor);
          texto(b, bx + 12, 121, p.verbo, "sis-banda-verbo");
          (p.etapas || []).forEach(function (e, k) { var et = ETAPA[e]; if (et) texto(b, bx + 12, 140 + k * 11, et.id + " · " + et.curto, "sis-banda-etapa"); });
          clicavel(b, function () { aoClicar(p.sigla); });
          if (foco) caixasSis[p.sigla] = b;
        });
      }
      /* a planilha e o e-mail não aparecem aqui: a camada os substitui (é o que a integração coord→mail diz) */
      var substitui = (D.integracoes || []).filter(function (i) { return i.tipo === "proposta" && pos[i.de] && !pos[i.para] && SIS[i.para]; });
      (D.integracoes || []).forEach(function (i) {
        if (i.tipo !== "proposta") return;
        var a = pos[i.de], b = pos[i.para];
        if (!a || !b) return;
        var gx = b.x - 9, ym = b.y + b.h / 2;
        el("polyline", { points: gx + "," + (a.y + a.h) + " " + gx + "," + ym + " " + b.x + "," + ym, "class": "sis-fio i-proposta", fill: "none" }, sis);
        el("circle", { cx: b.x, cy: ym, r: 2.6, fill: "#0f7a64" }, sis);
        if (i.rotulo) texto(sis, b.x < 100 ? gx + 4 : gx - 3, 208, corta(i.rotulo, 30), "sis-fio-rot i-proposta", b.x < 100 ? "start" : "end");
      });
      if (substitui.length) texto(sis, 880, 196, "saem de cena: " + substitui.map(function (i) { return SIS[i.para].nome.toLowerCase(); }).join(" · "), "nota-svg", "end");
      texto(sis, 10, 24, "coordena, não substitui", "tempo-rot");
      texto(sis, 10, 38, "um dono por passo, prazos e histórico por cima do que já existe", "nota-svg");
    }
    texto(sis, 10, 432, foco ? "clique num sistema ou numa banda para ler · \"lado a lado\" volta ao comparativo" : "clique neste olhar para abri-lo ao lado, com a leitura", "nota-svg");
  }
  function selecionaSis(id) {
    if (id && comparativo) { escolheTempo(tempoAtual, id); return; }
    selecao.sistema = id || null;
    Object.keys(caixasSis).forEach(function (k) { caixasSis[k].classList.toggle("on", k === id); });
    leituraSistema(id);
    reencaixa();
  }
  var EST_SIS = { existe: "existe", implantacao: "em implantação", trial: "só em pesquisa", proposto: "proposto" };
  function leituraSistema(id) {
    var html = "<button type='button' class='volta-duo'>← os dois olhares, lado a lado</button>", s = id && SIS[id], p = id && PASSO[id];
    if (s || p) html = "<button type='button' class='fecha-leitura' aria-label='fechar a ficha'>×</button>" + html;
    if (p) {
      html += "<div class='bloco ficha'><div class='rotulo'><span class='passo-chip p-" + p.sigla + "'>" + SUP[p.sigla] + "</span>" + esc(p.nome) + " · " + esc(p.verbo) + "</div><h3>" + esc(ponto(maiuscula(p.fisica))) + "</h3>" +
        "<dl><dt>Etapas</dt><dd>" + (p.etapas || []).map(function (e) { return ETAPA[e] ? ETAPA[e].nome : e; }).join(" → ") + "</dd>" +
        "<dt>Emissões</dt><dd>" + (p.emissoes || []).map(function (e) { return EMISSAO_TXT[e] || e; }).join(" · ") + "</dd></dl></div>";
      var dec0 = (D.decisao || []).filter(function (d) { return d.nivel === 0; })[0];
      if (dec0) html += "<div class='bloco'><div class='rotulo'>A premissa " + st(dec0.estado) + "</div><p>" + esc(ponto(dec0.pergunta)) + "</p></div>";
    } else if (s) {
      html += "<div class='bloco ficha'><div class='rotulo'>Sistema · " + esc(EST_SIS[s.estado] || s.estado) + " " + conf(s.confianca) + "</div><h3>" + esc(s.nome) + "</h3><p>" + esc(ponto(maiuscula(s.faz))) + "</p>" +
        "<dl><dt>Hoje</dt><dd>" + (D.integracoes || []).filter(function (i) { return (i.de === s.id || i.para === s.id) && i.tipo !== "proposta"; }).map(function (i) { return esc((SIS[i.de] || {}).nome || i.de) + " → " + esc((SIS[i.para] || {}).nome || i.para) + (i.rotulo ? ": " + esc(i.rotulo) : "") + (i.tipo === "manual" ? " <i class='c-aberto'>(à mão)</i>" : ""); }).join("<br>") + "</dd>" +
        "<dt>Com a camada</dt><dd>" + ((D.integracoes || []).filter(function (i) { return (i.de === s.id || i.para === s.id) && i.tipo === "proposta"; }).map(function (i) { return esc(i.rotulo); }).join(" · ") || "—") + "</dd>" +
        "<dt>Nas jornadas</dt><dd>" + ((D.jornada || []).filter(function (j) { return (j.sistema || []).indexOf(s.id) >= 0; }).map(function (j) { return ETAPA[j.etapa] ? ETAPA[j.etapa].curto : j.etapa; }).join(" · ") || "—") + "</dd></dl></div>";
      var achs = achadosDe("sistema").slice(0, 3);
      if (achs.length) html += "<div class='bloco'><div class='rotulo'>O que já sabemos</div>" + achs.map(function (x) { return achadoHtml(x, "mini"); }).join("") + "</div>";
    } else if (tempoAtual === 1) {
      html += "<div class='bloco ficha'><div class='rotulo'>" + esc(TEMPOS[0][1]) + "</div><h3>" + esc(ponto(TEMPOS[0][2])) + "</h3></div><div class='bloco'>" + achadosHtml("sistema", true, 3) + "</div>";
    } else {
      html += "<div class='bloco ficha'><div class='rotulo'>" + esc(TEMPOS[1][1]) + "</div><h3>" + esc(ponto(TEMPOS[1][2])) + "</h3></div><div class='bloco'>" + achadosHtml("sistema", true, 3) + "</div>";
    }
    html += elo("sistema");
    escreve(leituraSis, html);
    var fx = leituraSis.querySelector(".fecha-leitura"), vd = leituraSis.querySelector(".volta-duo");
    if (fx) fx.addEventListener("click", function () { selecionaSis(null); estadoNaUrl(); });
    if (vd) vd.addEventListener("click", comparar);
  }

  /* ================= 3 · SERVIÇOS: as cinco terapias =================
     Um cartão por terapia (servicos.csv): o selo do isótopo que trata (símbolo, emissão, meia-vida, alcance) e o que vê,
     a indicação, o de-para em cinco linhas (a fronteira, a maturidade, o prazo, o valor da dose, a equipe), a
     coordenação que basta ou precisa ser sistematizada, e as alternativas da Direção que tocam a terapia. */
  var portfolio = document.getElementById("portfolio");
  var DEPARA = [
    ["fronteira", "Quem indica", { interna: ["dentro da medicina nuclear", "ok"], cruza_oncologia: ["a oncologia externa entra", "risco"] }],
    ["maturidade", "Maturidade", { decadas: ["décadas de rotina", "ok"], recente: ["recente", "risco"] }],
    ["prazo_vs_bio", "Prazo da senha × da dose", { folga: ["com folga", "ok"], compete: ["competem", "risco"] }],
    ["valor_dose", "Valor da dose", { baixo: ["baixo", "ok"], alto: ["alto", "risco"] }],
    ["equipe", "Equipe", { estavel: ["estável", "ok"], rotativa: ["rotativa", "risco"] }]
  ];
  var REGIME_TXT = { ambulatorial: "ambulatorial", internacao: "internação" };
  function selecionaServico(id) {
    selecao.servicos = id || null;
    if (!portfolio) return;
    Array.prototype.forEach.call(portfolio.querySelectorAll(".cartao"), function (c) { c.classList.toggle("on", !!id && c.getAttribute("data-serv") === id); });
  }
  (function montaServicos() {
    if (!portfolio || !(D.servicos || []).length) return;
    var cartoes = D.servicos.map(function (s) {
      var it = ISO[s.isotopo_tratar], iv = ISO[s.isotopo_ver];
      var selo = it ? "<div class='iso" + (it.confianca === "aberto" ? " c-aberto" : "") + "'><span class='iso-sim'>" + simbolo(it) + "</span><span class='iso-em'>" + esc(EMISSAO_TXT[it.emissao] || it.emissao) + " · " + esc(passoNome("T")) + "</span>" +
        "<span class='iso-dados'>meia-vida " + meiaVidaTxt(it) + (it.alcance_mm ? " · alcance " + pt(num(it.alcance_mm), num(it.alcance_mm) % 1 ? 1 : 0) + " mm" : "") + (it.energia_curta ? " · " + esc(it.energia_curta) : "") + "</span>" +
        (iv ? "<span class='iso-ver'><b>" + esc(passoNome("V")) + "</b> · " + simbolo(iv) + " · " + esc(EMISSAO_TXT[iv.emissao] || iv.emissao) + " · meia-vida " + meiaVidaTxt(iv) + "</span>" : "") + "</div>" : "";
      var depara = "<div class='depara'>" + DEPARA.map(function (d) {
        var v = d[2][s[d[0]]];
        return "<div><span>" + d[1] + "</span><span class='dp-v dp-" + (v ? v[1] : "neutro") + "'>" + esc(v ? v[0] : (s[d[0]] || "—")) + "</span></div>";
      }).join("") + "</div>";
      var alts = (D.alternativas || []).filter(function (a) { return (a.terapias || []).indexOf(s.id) >= 0; });
      var achs = ACH.filter(function (a) { return (a.terapias || []).indexOf(s.id) >= 0; }).slice(0, 2);
      return "<article class='cartao c-" + s.confianca + "' data-serv='" + s.id + "'>" +
        "<span class='pf-regime'>" + esc(REGIME_TXT[s.regime] || s.regime) + " · " + tagEnq(s.enquadramento, true) + " " + conf(s.confianca) + "</span>" +
        "<h3>" + esc(s.nome) + "</h3>" + selo +
        "<p class='pf-ind'>" + esc(ponto(maiuscula(s.indicacao))) + "</p>" + depara +
        (achs.length ? "<p class='pf-achados'>" + achs.map(function (a) { return "<span class='pf-ach'><b>" + esc(a.curto) + "</b></span>"; }).join("") + "</p>" : "") +
        "<div class='pf-coord " + s.coordenacao + "'><b>" + (s.coordenacao === "informal_basta" ? "a coordenação informal basta" : "precisa sistematizar a coordenação") + "</b>" +
        (alts.length ? "<span class='pf-alts'>" + alts.map(function (a) { return "<button type='button' class='pf-alt l-elo' data-vista='direcao' data-item='" + a.id + "' title='" + esc(a.oque) + "'>" + esc(a.curto) + "</button>"; }).join("") + "</span>" : "") + "</div>" +
        "</article>";
    }).join("");
    var legenda = Object.keys(ENQ).map(function (k) { return "<span class='tag enq enq-" + k + "'>" + esc(ENQ[k].curto) + "</span>"; }).join("");
    escreve(portfolio, "<div class='pf-grade'>" + cartoes + "</div>" +
      "<div class='pf-rodape'><p class='pf-leg'>" + legenda + "<span class='dica'>verde = a regra de hoje dá conta · vermelho = onde a coordenação informal quebra · tracejado = a confirmar</span></p>" + elo("servicos") + "</div>");
    Array.prototype.forEach.call(portfolio.querySelectorAll(".cartao"), function (c) {
      c.addEventListener("click", function (ev) { if (ev.target.closest && ev.target.closest("button")) return; var id = c.getAttribute("data-serv"); selecionaServico(selecao.servicos === id ? null : id); estadoNaUrl(); });
    });
  })();

  /* ================= 4 · JORNADAS: os sete passos =================
     A mãe (jornada.csv): o blueprint dos sete passos com a faixa dos passos V T R, as esperas, o que o paciente vive
     (inferência, em itálico: ninguém ouviu paciente ainda), quem atua, a linha de visibilidade, o bastidor, os
     sistemas, quem decide, quem paga, o dono (vermelho onde é ninguém) e o que falta; embaixo, o relógio da dose.
     As filhas (jornada_servico.csv): a mesma gramática por terapia, com o isótopo da terapia no relógio. */
  var jornadaAtual = "mae", jorPalco = document.getElementById("jor-palco");
  var jorLista = document.getElementById("lista-jor");
  function servicosComJornada() { return (D.servicos || []).filter(function (s) { return (D.jornada_servico || []).some(function (j) { return j.servico === s.id; }); }); }
  (function montaListaJornadas() {
    if (!jorLista) return;
    var html = "<p class='l-coluna'>ESCOLHA UMA JORNADA</p><button type='button' class='j-opt j-destaque' data-id='mae'>" + esc(rel("jor_mae") || "O ciclo inteiro") + "<small>mãe</small></button>" +
      "<p class='l-legenda j-nota'>" + esc(rel("jor_mae_sub") || "a regra, igual para toda terapia") + "</p><p class='l-sub'>POR TERAPIA</p>" +
      servicosComJornada().map(function (s) { return "<button type='button' class='j-opt' data-id='" + s.id + "'>" + esc(s.curto || s.nome) + "<small>" + (D.jornada_servico || []).filter(function (j) { return j.servico === s.id; }).length + "</small></button>"; }).join("");
    escreve(jorLista, html);
    Array.prototype.forEach.call(jorLista.querySelectorAll(".j-opt"), function (b) { b.addEventListener("click", function () { selecao.jornadas = null; montaJornada(b.dataset.id); estadoNaUrl(); }); });
  })();
  function faixaPassos(cls) {
    var html = "", i = 0;
    PASSOS.forEach(function (p) {
      var n = ETAPAS.filter(function (e) { return e.passo === p.sigla; }).length;
      if (!n) return;
      html += "<div class='" + cls + "' style='grid-column:span " + n + ";--cor:" + p.cor + "'>" + SUP[p.sigla] + " " + esc(p.nome.toUpperCase()) + "</div>";
      i += n;
    });
    return html;
  }
  function desenhaBlueprint(linhas, raias, iso, isoVer) {
    var n = linhas.length;
    function celula(txt, e, cls) { return "<div class='bpp-cel" + (e.fonte === "inferencia" ? " bpp-infere" : "") + (txt ? "" : " bpp-vazia") + (cls ? " " + cls : "") + "'>" + (txt || "") + "</div>"; }
    var html = "<div class='bpp' style='--bpp-n:" + n + ";grid-template-columns:120px repeat(" + n + ", minmax(0,1fr))'>" +
      "<div class='bpp-eixo'>OS PASSOS</div>" + faixaPassos("bpp-zona") +
      "<div class='bpp-eixo'>A LINHA DO TEMPO</div>" +
      linhas.map(function (j, i) {
        var et = ETAPA[j.etapa] || { nome: j.etapa };
        return "<div class='bpp-marco" + (passoAtual && et.passo === passoAtual ? " on" : "") + "'>" + (j.espera ? "<span class='bpp-espera'>" + esc(j.espera) + "</span>" : "") + "<b>" + (i + 1) + " · " + esc(et.nome) + "</b><small>" + esc(j.quando || "—") + "</small></div>";
      }).join("");
    raias.forEach(function (r) {
      if (r === "vis") { html += "<div class='bpp-vis'><span>linha de visibilidade</span></div>"; return; }
      html += "<div class='bpp-rot'><b>" + r[0] + "</b><small>" + r[1] + "</small></div>" + linhas.map(r[2]).join("");
    });
    if (iso) html += "<div class='bpp-rot'><b>OS DOIS RELÓGIOS</b><small>o da física é fixo: " + esc(iso.simbolo) + ", meia-vida " + meiaVidaTxt(iso) + " · o da senha varia</small></div><div class='bpp-relogio'>" + relogioSvg(iso, { w: 900, h: 118, dias: 45, completo: true, isoVer: isoVer }) + "</div>";
    return html + "</div>";
  }
  function montaJornada(id) {
    if (!jorPalco) return;
    id = id || "mae"; jornadaAtual = id;
    Array.prototype.forEach.call(document.querySelectorAll("#lista-jor .j-opt"), function (b) { b.classList.toggle("on", b.dataset.id === id); });
    var html, rodape = "<p class='bp-pe'><span>em itálico, o que ainda é leitura nossa: ninguém ouviu paciente nem oncologista ainda — o resto vem das entrevistas</span>" + elo("jornadas") + "</p>";
    var isoMae = isoTerapeuticos()[0];
    if (id === "mae") {
      var linhas = (D.jornada || []).slice();
      html = "<div class='j-topo'><h2 class='serif'>" + esc(rel("jor_mae") || "O ciclo inteiro") + "</h2><p class='l-entrega'>" + esc(rel("jor_mae_sub") || "") + "</p></div>" +
        desenhaBlueprint(linhas, [
          ["O PACIENTE VIVE", "sempre inferência", function (j) { return "<div class='bpp-cel bpp-infere" + (j.vive ? "" : " bpp-vazia") + "' title='" + esc(j.vive) + "'>" + esc(corta(j.vive, 72)) + "</div>"; }],
          ["QUEM ATUA", "e quem decide", function (j) { return "<div class='bpp-cel" + (j.fonte === "inferencia" ? " bpp-infere" : "") + "' title='" + esc(j.atua) + "'>" + esc(corta(j.atua, 70)) + (j.decide ? "<small>decide: " + esc(corta(j.decide, 40)) + "</small>" : "") + "</div>"; }],
          "vis",
          ["BASTIDOR", "e onde fica o registro", function (j) { return "<div class='bpp-cel" + (j.fonte === "inferencia" ? " bpp-infere" : "") + (j.bastidor ? "" : " bpp-vazia") + "' title='" + esc(j.bastidor) + "'>" + esc(corta(j.bastidor, 72)) + ((j.sistema || []).length ? "<span class='chips'>" + (j.sistema || []).map(function (s) { return "<span class='chip-sis'>" + esc(SIS[s] ? SIS[s].nome : s) + "</span>"; }).join("") + "</span>" : "") + "</div>"; }],
          ["DONO", "e quem paga ou autoriza", function (j) { return (j.dono === "ninguem" ? "<div class='bpp-cel bpp-risco'>ninguém" : "<div class='bpp-cel bpp-dono" + (j.dono ? "" : " bpp-vazia") + "'>" + esc(ATOR[j.dono] ? ATOR[j.dono].curto : j.dono)) + ((j.paga || []).length ? "<span class='chips'>" + (j.paga || []).map(function (k) { return tagEnq(k, true); }).join("") + "</span>" : "") + "</div>"; }],
          ["O QUE FALTA", "nesta etapa", function (j) { var et = ETAPA[j.etapa]; return "<div class='bpp-cel" + (et && et.gate ? " bpp-risco" : " bpp-vazia") + "'>" + esc(et && et.gate ? et.gate : "") + "</div>"; }]
        ], isoMae, isoDeVer()) + rodape;
    } else {
      var s = SERV[id], etapas = (D.jornada_servico || []).filter(function (j) { return j.servico === id; });
      if (!s) { montaJornada("mae"); return; }
      html = "<p class='jm-trilha'><button type='button' class='jm-mae'>" + esc(rel("jor_mae") || "O ciclo inteiro") + "</button> › <b>" + esc(s.nome) + "</b></p>" +
        "<div class='j-topo'><h2 class='serif'>" + esc(s.nome) + "</h2><p class='l-entrega'>" + esc(ponto(maiuscula(s.indicacao))) + " " + (s.coordenacao === "informal_basta" ? "A coordenação informal dá conta." : "A coordenação precisa ser sistematizada.") + "</p></div>" +
        desenhaBlueprint(etapas, [
          ["O PACIENTE VIVE", "sempre inferência", function (j) { return "<div class='bpp-cel bpp-infere" + (j.vive ? "" : " bpp-vazia") + "' title='" + esc(j.vive) + "'>" + esc(corta(j.vive, 90)) + "</div>"; }],
          ["QUEM ATUA", "a cada contato", function (j) { return "<div class='bpp-cel" + (j.fonte === "inferencia" ? " bpp-infere" : "") + "' title='" + esc(j.atua) + "'>" + esc(corta(j.atua, 80)) + "</div>"; }],
          "vis",
          ["BASTIDOR", "o que ele não vê", function (j) { return "<div class='bpp-cel" + (j.fonte === "inferencia" ? " bpp-infere" : "") + (j.bastidor ? "" : " bpp-vazia") + "' title='" + esc(j.bastidor) + "'>" + esc(corta(j.bastidor, 90)) + "</div>"; }],
          ["DONO", "quem responde", function (j) { var m = (D.jornada || []).filter(function (x) { return x.etapa === j.etapa; })[0]; return !m ? "<div class='bpp-cel bpp-vazia'></div>" : m.dono === "ninguem" ? "<div class='bpp-cel bpp-risco'>ninguém</div>" : "<div class='bpp-cel bpp-dono'>" + esc(ATOR[m.dono] ? ATOR[m.dono].curto : m.dono) + "</div>"; }]
        ], ISO[s.isotopo_tratar] || isoMae, ISO[s.isotopo_ver] || isoDeVer()) +
        "<p class='bpp-dinheiro'><span class='l-sub' style='margin:0'>Quem paga esta linha</span>" + tagEnq(s.enquadramento) + "</p>" + rodape;
    }
    escreve(jorPalco, html);
    Array.prototype.forEach.call(jorPalco.querySelectorAll(".jm-mae"), function (b) { b.addEventListener("click", function () { montaJornada("mae"); estadoNaUrl(); }); });
    if (selecao.jornadas) Array.prototype.forEach.call(jorPalco.querySelectorAll(".bpp-marco"), function (m, i) { var j = (id === "mae" ? D.jornada : (D.jornada_servico || []).filter(function (x) { return x.servico === id; }))[i]; m.classList.toggle("on", !!j && j.etapa === selecao.jornadas); });
  }

  /* ================= 5 · DIREÇÃO: a decisão da Fase 3 =================
     À esquerda, pouco e grande: a conclusão em serifa, a espinha dos três níveis da decisão (decisao.csv) e a grade
     das oito alternativas (alternativas.csv). À direita, um cartão por alternativa, empilhados na mesma célula:
     quem pede (criterios.csv × grupos.csv, com a cobertura), o que já sabemos (achados e padrões que a sustentam),
     o que falta definir (pendencias.csv) e quem não ouvimos. Mais um cartão para a arquitetura (o nível 1). */
  var direcao = document.getElementById("direcao");
  var COR_EST = { existe: "#0f7a64", parcial: "#c9842e", nao_existe: "#B3261E" };
  (function montaDirecao() {
    if (!direcao || !(D.alternativas || []).length) return;
    var CRIT = D.criterios || [], PEN = D.pendencias || [], DEC = (D.decisao || []).slice().sort(function (a, b) { return a.nivel - b.nivel; });
    function rot(t, qt) { return "<p class='pc-rot'>" + t + (qt !== undefined ? "<span>" + qt + "</span>" : "") + "</p>"; }
    var vazio = "<li class='pc-vazio'>nada registrado ainda</li>";
    function liAchado(a) { return "<li title='" + esc(a.citacao || "") + "'><b>" + esc(a.curto) + (a.camada && CAM[a.camada] ? " " + eloPara(a.camada, null, rotuloVista(a.camada).toLowerCase() + " →", "l-elo inline pc-ver") : "") + "</b></li>"; }
    function liPadrao(p) { return "<li class='pc-padrao' title='" + esc(p.lead) + "'><b>" + esc(p.titulo) + "</b><small>" + p.n_fontes + " fontes · " + esc((p.fontes_papeis || []).join(" · ")) + "</small></li>"; }
    function sabemosDe(id) {
      var slugs = {};
      ACH.forEach(function (a) { if ((a.alternativas || []).indexOf(id) >= 0) slugs[a.slug] = true; });
      CRIT.forEach(function (c) { if ((c.alternativas || []).indexOf(id) >= 0) (c.achados || []).forEach(function (s) { slugs[s] = true; }); });
      var achs = ACH.filter(function (a) { return slugs[a.slug]; }), pads = PAD.filter(function (p) { return slugs[p.slug]; });
      return pads.map(liPadrao).concat(achs.map(liAchado));
    }
    function card(a) {
      var crits = CRIT.filter(function (c) { return (c.alternativas || []).indexOf(a.id) >= 0; }), porGrupo = {}, ordemG = [];
      crits.forEach(function (c) { if (!porGrupo[c.grupo]) { porGrupo[c.grupo] = []; ordemG.push(c.grupo); } porGrupo[c.grupo].push(c.criterio); });
      var pede = ordemG.map(function (g) {
        var gr = GRUPO[g] || { nome: g, cobertura: "coberto" }, lista = porGrupo[g];
        return "<div class='pc-grupo cob-" + gr.cobertura + "' title='" + esc(lista.join(" · ")) + "'><b>" + esc(gr.curto || gr.nome) + "</b><span>" + esc(corta(lista[0], 64)) + (lista.length > 1 ? " <i>+" + (lista.length - 1) + "</i>" : "") + "</span></div>";
      }).join("");
      var sabe = sabemosDe(a.id), MAX = 5, resto = sabe.length - MAX;
      var falta = PEN.filter(function (p) { return (p.alternativas || []).indexOf(a.id) >= 0; }).map(function (p) { return "<li title='" + esc(p.decisao) + "'><b>" + esc(p.curto) + "</b><small>" + st(p.status) + " " + esc(p.dono) + " · " + esc(p.prazo) + "</small></li>"; });
      var naoOuvidos = ordemG.map(function (g) { return GRUPO[g]; }).filter(function (g) { return g && g.cobertura !== "coberto"; });
      return "<header class='pc-cab'><p class='pc-eyebrow'>alternativa " + a.ordem_n + " · nível " + a.nivel + " " + st(a.estado) + " " + conf(a.confianca) + (a.camada && CAM[a.camada] ? " · age em " + esc(rotuloVista(a.camada).toLowerCase()) : "") + "</p>" +
        "<h3 class='pc-tit'>" + esc(a.nome) + "</h3></header>" +
        "<p class='pc-oque'>" + esc(ponto(maiuscula(a.oque))) + ((a.terapias || []).length ? " <span class='dica'>Pesa mais em: " + a.terapias.map(function (t) { return SERV[t] ? SERV[t].curto || SERV[t].nome : t; }).join(", ") + ".</span>" : "") + "</p>" +
        "<div class='pc-pede'>" + rot("Quem pede, e por quê", crits.length) + (pede ? "<div class='pc-grupos'>" + pede + "</div>" : "<p class='dica'>nenhum critério ligado ainda</p>") + "</div>" +
        "<div class='pc-listas'>" +
        "<section>" + rot("O que já sabemos", sabe.length) + "<ul class='pc-ul'>" + (sabe.slice(0, MAX).join("") || vazio) + (resto > 0 ? "<li class='pc-vazio'>e mais " + resto + " nas camadas</li>" : "") + "</ul></section>" +
        "<section>" + rot("O que falta definir", falta.length) + "<ul class='pc-ul'>" + (falta.join("") || vazio) + "</ul>" +
        (naoOuvidos.length ? rot("Quem não ouvimos") + "<ul class='pc-ul'>" + naoOuvidos.map(function (g) { return "<li class='pc-ouvir' title='" + esc(g.por_que + " — como ouvir: " + g.como_ouvir) + "'><b>" + esc(g.nome) + " · " + g.cobertura + "</b></li>"; }).join("") + "</ul>" : "") +
        "</section></div>";
    }
    function cardLoops() {
      var R1 = (D.loops || []).filter(function (l) { return l.loop === "R1"; }), B1 = (D.loops || []).filter(function (l) { return l.loop === "B1"; }), ARE = D.loop_arestas || [];
      if (!R1.length) return "";
      var rx = 300, ry = 165, rr = 96, pos = {}, h = "", reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      R1.forEach(function (n, i) { var a = -Math.PI / 2 + 2 * Math.PI * i / R1.length; pos[n.id] = [rx + rr * Math.cos(a), ry + rr * Math.sin(a), a]; });
      h += "<svg class='loops-svg' viewBox='0 0 480 330' role='img' aria-label='" + esc(rel("r1_titulo")) + "'><defs><marker id='lp-seta' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto'><path d='M0,0 L10,5 L0,10 z' fill='#B3261E'/></marker></defs>";
      ARE.forEach(function (ar, i) {
        var a = pos[ar.de], b = pos[ar.para]; if (!a || !b) return;
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, k = 0.3, cx = mx + (rx - mx) * k, cy = my + (ry - my) * k;
        var d = "M" + a[0].toFixed(1) + "," + a[1].toFixed(1) + " Q" + cx.toFixed(1) + "," + cy.toFixed(1) + " " + b[0].toFixed(1) + "," + b[1].toFixed(1);
        h += "<path class='r1-aresta" + (ar.freia === "sim" ? " freavel" : "") + "' d='" + d + "' marker-end='url(#lp-seta)'/>";
        h += "<text class='r1-sinal' x='" + ((a[0] + 2 * cx + b[0]) / 4 + 5).toFixed(1) + "' y='" + ((a[1] + 2 * cy + b[1]) / 4).toFixed(1) + "'>" + esc(ar.sinal) + "</text>";
        if (!reduz) h += "<circle class='r1-neutron" + (ar.freia === "sim" ? " freavel" : "") + "' r='2.4'><animateMotion dur='" + (3 + (i % 5) * 0.4).toFixed(1) + "s' repeatCount='indefinite' path='" + d + "'/></circle>";
      });
      R1.forEach(function (n, i) {
        var p = pos[n.id], lx = rx + (rr + 24) * Math.cos(p[2]), ly = ry + (rr + 24) * Math.sin(p[2]), anc = Math.cos(p[2]) > 0.3 ? "start" : Math.cos(p[2]) < -0.3 ? "end" : "middle";
        h += "<g class='r1-no tipo-" + n.tipo + "' data-loop='" + n.id + "' role='button' tabindex='0' aria-label='" + esc(n.rotulo) + "'><circle cx='" + p[0].toFixed(1) + "' cy='" + p[1].toFixed(1) + "' r='14'/><text x='" + p[0].toFixed(1) + "' y='" + (p[1] + 3.2).toFixed(1) + "' text-anchor='middle'>" + (i + 1) + "</text></g>";
        var ls = quebra(n.curto, 22);
        ls.forEach(function (l, k) { h += "<text class='r1-rot' x='" + lx.toFixed(1) + "' y='" + (ly + 3 - (ls.length - 1) * 5 + k * 10).toFixed(1) + "' text-anchor='" + anc + "'>" + esc(l) + "</text>"; });
      });
      var bx = 56;
      h += "<text class='at-titulo' x='" + bx + "' y='52' text-anchor='middle'>B1</text><rect class='b1-barra' data-loop='" + (B1[0] ? B1[0].id : "") + "' x='" + (bx - 6) + "' y='60' width='12' height='210' rx='3' role='button' tabindex='0' aria-label='" + esc(rel("b1_titulo")) + "'/>";
      B1.forEach(function (n, i) {
        var y = 110 + i * 100;
        h += "<g class='b1-no' data-loop='" + n.id + "' role='button' tabindex='0' aria-label='" + esc(n.rotulo) + "'><rect x='" + (bx - 11) + "' y='" + (y - 11) + "' width='22' height='22' rx='4'/><text x='" + bx + "' y='" + (y + 3) + "' text-anchor='middle'>B" + (i + 1) + "</text></g>";
        quebra(n.curto, 16).forEach(function (l, k) { h += "<text class='b1-rot' x='" + (bx + 18) + "' y='" + (y - 2 + k * 10) + "'>" + esc(l) + "</text>"; });
      });
      h += "<text class='at-titulo' x='" + bx + "' y='296'>" + esc(rel("b1_titulo")) + "</text><text class='at-sub' x='" + bx + "' y='310'>passe o mouse na barra: as arestas que ela freia apagam</text></svg>";
      return "<header class='pc-cab'><p class='pc-eyebrow'>o sistêmico · R1 reforço · B1 equilíbrio</p><h3 class='pc-tit'>" + esc(rel("r1_titulo") || "Por que o problema se sustenta sozinho") + "</h3></header>" + h +
        (rel("loops_nota") ? "<p class='pc-oque'>" + esc(rel("loops_nota")) + "</p>" : "");
    }
    function cardArquitetura() {
      var d1 = DEC.filter(function (d) { return d.nivel === 1; })[0];
      if (!d1) return "";
      var achs = achadosDe("sistema").slice(0, 5), bloqueios = PEN.filter(function (p) { return !(p.alternativas || []).length && p.tipo === "bloqueio"; });
      return "<header class='pc-cab'><p class='pc-eyebrow'>nível 1 " + st(d1.estado) + "</p><h3 class='pc-tit'>" + esc(d1.titulo) + "</h3></header>" +
        "<p class='pc-oque'>" + esc(ponto(d1.pergunta)) + "</p>" +
        "<div class='pc-opcoes'>" + (d1.opcoes || []).map(function (o, i) { return "<div class='pc-opcao'><b>" + (i + 1) + " · " + esc(o) + "</b></div>"; }).join("") + "</div>" +
        "<div class='pc-listas'><section>" + rot("O que já sabemos", achs.length) + "<ul class='pc-ul'>" + (achs.map(liAchado).join("") || vazio) + "</ul></section>" +
        "<section>" + rot("O que bloqueia a decisão", bloqueios.length) + "<ul class='pc-ul'>" + (bloqueios.map(function (p) { return "<li title='" + esc(p.decisao) + "'><b>" + esc(p.curto) + "</b><small>" + st(p.status) + " " + esc(p.dono) + " · " + esc(p.prazo) + "</small></li>"; }).join("") || vazio) + "</ul></section></div>";
    }
    var alts = D.alternativas.slice().sort(function (a, b) { return (a.ordem_n || 0) - (b.ordem_n || 0); });
    alts.forEach(function (a, i) { a.ordem_n = i + 1; });
    var espinha = DEC.map(function (d) {
      return "<li class='est-" + d.estado + "' title='" + esc(d.pergunta) + "'><i>" + d.nivel + "</i><div><b>" + esc(d.titulo) + st(d.estado) + "</b><p>" + esc(corta(ponto(d.pergunta), 120)) + "</p>" +
        (d.nivel === 1 && (d.opcoes || []).length ? "<span class='op'>" + d.opcoes.map(function (o) { return "<button type='button' class='alt-op' data-alt='arquitetura' title='" + esc(o) + "'>" + esc(corta(o, 28)) + "</button>"; }).join("") + "</span>" : "") +
        (d.nivel === 2 ? "<span class='op'>" + alts.map(function (a) { return "<button type='button' class='alt-op' data-alt='" + a.id + "' title='" + esc(a.nome) + "'>" + a.ordem_n + "</button>"; }).join("") + "</span>" : "") + "</div></li>";
    }).join("");
    var grade = alts.map(function (a) {
      return "<button type='button' class='alt-b est-" + a.estado + "' data-alt='" + a.id + "' style='--cor:" + (COR_EST[a.estado] || "#0C3A6F") + "'><small><i>" + a.ordem_n + "</i>nível " + a.nivel + " · " + esc(ST_TXT[a.estado] || a.estado) + "</small><b>" + esc(a.curto) + "</b></button>";
    }).join("");
    escreve(direcao,
      "<div class='dir-grade'><div class='dir-col'>" +
      "<div><p class='l-coluna'>O QUE O RELATÓRIO CONCLUI</p><p class='dc-frase'>" + esc(rel("conclusao_curta") || rel("conclusao")) + "</p></div>" +
      "<p class='l-coluna' style='margin:0'>" + esc(rel("premissa_titulo") || "A DECISÃO, EM TRÊS NÍVEIS") + "</p><ol class='espinha'>" + espinha + "</ol>" +
      "<button type='button' class='alt-op dir-loops' data-alt='loops'>↻ " + esc(rel("r1_titulo") || "por que o problema se sustenta sozinho") + "</button>" +
      "<p class='l-coluna' style='margin:4px 0 0'>AS OITO ALTERNATIVAS</p><div class='alt-grade'>" + grade + "</div>" +

      "</div>" +
      "<div class='alt-cards'>" + alts.map(function (a) { return "<div class='alt-card' data-alt='" + a.id + "' style='--cor:" + (COR_EST[a.estado] || "#0C3A6F") + "'>" + card(a) + "</div>"; }).join("") +
      "<div class='alt-card' data-alt='arquitetura' style='--cor:#0C3A6F'>" + cardArquitetura() + "</div>" +
      "<div class='alt-card alt-loops' data-alt='loops' style='--cor:#B3261E'>" + cardLoops() + "</div>" +
      "</div></div>");
    Array.prototype.forEach.call(direcao.querySelectorAll(".alt-b,.alt-op"), function (b) { b.addEventListener("click", function () { mostraAlt(b.dataset.alt); estadoNaUrl(); }); });
    /* o cartão dos loops: cada nó abre a aba onde o problema mora; a barra, inserida, apaga o que freia */
    var lsvg = direcao.querySelector(".loops-svg");
    if (lsvg) {
      function freia(on) { Array.prototype.forEach.call(lsvg.querySelectorAll(".freavel"), function (x) { x.classList.toggle(x.tagName === "circle" ? "freado" : "freada", on); }); var b = lsvg.querySelector(".b1-barra"); if (b) b.classList.toggle("on", on); }
      Array.prototype.forEach.call(lsvg.querySelectorAll(".b1-barra,.b1-no"), function (x) {
        x.addEventListener("mouseenter", function () { freia(true); }); x.addEventListener("mouseleave", function () { freia(false); });
        x.addEventListener("focus", function () { freia(true); }); x.addEventListener("blur", function () { freia(false); });
      });
      Array.prototype.forEach.call(lsvg.querySelectorAll("[data-loop]"), function (x) {
        var n = LOOP[x.getAttribute("data-loop")];
        if (n) clicavel(x, function () { abre(n.vista, n.item); });
      });
    }
    mostraAlt(alts[0].id);
  })();
  function mostraAlt(id) {
    if (!direcao) return;
    if (!id || !(ALT[id] || id === "arquitetura" || id === "loops")) id = (D.alternativas || [])[0] ? D.alternativas[0].id : null;
    selecao.direcao = id;
    Array.prototype.forEach.call(direcao.querySelectorAll(".alt-b,.alt-card,.alt-op"), function (x) { x.classList.toggle("on", x.dataset.alt === id); });
  }

  /* ================= o carimbo, o estado inicial e os deep links =================
     Um estado da peça é uma query: ?vista= · &item= · &servico= · &tempo= · &passo=. */
  (function carimbo() {
    var c = document.getElementById("carimbo"), v = D.versao;
    if (c && v) { var d = String(v.data).split("-"); c.textContent = "Estado em " + (d.length === 3 ? d[2] + "/" + d[1] + "/" + d[0] : v.data) + " · publicação " + v.numero + " · " + v.titulo + ". Base: vault do projeto. Sem nomes de pessoas nem valores em reais nesta peça."; }
  })();
  function aplicaEstado(q) {
    var p = new URLSearchParams(q || ""), vista = (p.get("vista") || "abertura").toLowerCase(), item = p.get("item");
    if (!VISTAS.some(function (v) { return v.id === vista; })) vista = "abertura";
    passoAtual = p.get("passo") || null;
    var serv = p.get("servico"); if (serv && SERV[serv]) jornadaAtual = serv;
    var t = +p.get("tempo"); if (t === 1 || t === 2) { comparativo = false; if (vSistema) vSistema.classList.remove("cheia"); tempo(t); }
    montaAtomo(); leituraAbertura();
    var et = p.get("etapa"), et0 = ETAPAS[0] ? ETAPAS[0].id : null;
    if (vista === "ecossistema") selecionaEco(item || null, (et && ETAPA[et]) ? et : (item ? null : et0));
    else selecionaEco(null, et0);
    if (vista === "sistema" && item) selecionaSis(item);
    if (vista === "servicos" && item) selecionaServico(item);
    abre(vista, (vista === "direcao" || vista === "abertura" || vista === "jornadas") ? (item || undefined) : undefined);
  }
  aplicaEstado(location.search);
})();
