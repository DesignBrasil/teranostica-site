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
  function achadoHtml(a, cls) {
    return "<div class='achado " + (cls || "mini") + "'><b>" + esc(a.curto) + "</b>" + (a.citacao ? "<span>«" + esc(a.citacao) + "»</span>" : "") +
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
    else if (vista === "abertura") acendeLoop(item);
  }
  var passoAtual = null, servicoAtual = null;
  function estadoNaUrl() {
    var q = "?vista=" + vistaAtual;
    if (vistaAtual === "jornadas" && jornadaAtual && jornadaAtual !== "mae") q += "&servico=" + encodeURIComponent(jornadaAtual);
    if (selecao[vistaAtual]) q += "&item=" + encodeURIComponent(selecao[vistaAtual]);
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
    var W = opts.w || 440, H = opts.h || 86, x0 = 34, x1 = W - 10, y0 = 12, y1 = H - (opts.semFrase ? 14 : 32), dias = opts.dias || 30;
    var T = meiaVidaDias(iso); if (!T) return "";
    function X(d) { return x0 + (x1 - x0) * d / dias; }
    function Y(a) { return y1 - (y1 - y0) * a; }
    var pts = [], i;
    for (i = 0; i <= 60; i++) { var d = dias * i / 60; pts.push(X(d).toFixed(1) + "," + Y(Math.pow(2, -d / T)).toFixed(1)); }
    var h = "<svg class='relogio-svg' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='" + esc("a atividade da dose cai pela metade a cada " + meiaVidaTxt(iso)) + "'>";
    h += "<defs><pattern id='rl-hachura' width='6' height='6' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><line x1='0' y1='0' x2='0' y2='6' stroke='#B3261E' stroke-width='1' opacity='.35'/></pattern></defs>";
    var smin = cont("senha_min"), smax = cont("senha_max"), prev = cont("previsao_industria"), ent = cont("entrega_dose");
    if (smin !== null && smax !== null) {
      h += "<rect class='rl-senha' x='" + X(smin) + "' y='" + y0 + "' width='" + (X(Math.min(smax, dias)) - X(smin)) + "' height='" + (y1 - y0) + "'/>";
      h += "<text class='rl-senha-rot' x='" + (X(smin) + 3) + "' y='" + (y0 + 9) + "'>a senha chega entre " + smin + " e " + smax + " dias</text>";
    }
    h += "<path class='rl-area' d='M" + X(0) + "," + y1 + " L" + pts.join(" L") + " L" + X(dias) + "," + y1 + " Z'/>";
    h += "<polyline class='rl-curva' points='" + pts.join(" ") + "'/>";
    h += "<line class='rl-eixo' x1='" + x0 + "' y1='" + y1 + "' x2='" + x1 + "' y2='" + y1 + "'/>";
    [0, 7, 14, 21, 28].forEach(function (d) { if (d <= dias) h += "<text class='rl-tick' x='" + X(d) + "' y='" + (y1 + 10) + "' text-anchor='middle'>" + d + (d ? "" : " dias") + "</text>"; });
    h += "<text class='rl-tick' x='" + (x0 - 4) + "' y='" + (y0 + 4) + "' text-anchor='end'>100%</text><text class='rl-tick' x='" + (x0 - 4) + "' y='" + (Y(0.5) + 3) + "' text-anchor='end'>50%</text>";
    if (T <= dias) {
      h += "<line class='rl-meia' x1='" + x0 + "' y1='" + Y(0.5) + "' x2='" + X(T) + "' y2='" + Y(0.5) + "'/><line class='rl-meia' x1='" + X(T) + "' y1='" + Y(0.5) + "' x2='" + X(T) + "' y2='" + y1 + "'/>";
      h += "<text class='rl-meia-rot' x='" + (X(T) + 3) + "' y='" + (Y(0.5) - 3) + "'>meia-vida · " + meiaVidaTxt(iso) + "</text>";
    }
    if (prev !== null && prev <= dias) { h += "<line class='rl-marca' x1='" + X(prev) + "' y1='" + y0 + "' x2='" + X(prev) + "' y2='" + y1 + "'/><text class='rl-marca-rot' x='" + (X(prev) + 4) + "' y='" + (y1 - 4) + "'>pedido à indústria · " + prev + " d antes</text>"; }
    if (ent !== null && ent <= dias && ent !== prev) { var ye = Y(Math.pow(2, -ent / T)); h += "<circle cx='" + X(ent) + "' cy='" + ye + "' r='3' fill='#0C3A6F'/><text class='rl-marca-rot' x='" + (X(ent) - 6) + "' y='" + (ye + 3) + "' text-anchor='end'>dose chega · " + ent + " d</text>"; }
    if (!opts.semFrase) {
      var frase = (rel("relogio_frase") || "cada dia de atraso leva {perda} da atividade de {isotopo}").replace("{perda}", pt(perdaPorDia(iso) * 100, 1) + "%").replace("{isotopo}", iso.simbolo);
      quebra(frase, Math.round(W / 5.4)).slice(0, 2).forEach(function (l, i) { h += "<text class='rl-frase' x='" + x0 + "' y='" + (H - 12 + i * 10) + "'>" + esc(l) + "</text>"; });
    }
    return h + "</svg>";
  }

  /* ================= 0 · ABERTURA: o átomo teranóstico =================
     À esquerda (svg#atomo, 480 × 440): o corpo (o tecido) com a molécula no centro — o ligante, o quelante e os dois
     núcleos, o de ver (azul) e o de tratar (verde). Do núcleo de ver saem dois fótons opostos que atravessam o corpo (é
     o que se vê); do de tratar, a partícula β⁻ que para a 2 mm (é o que trata) e o dial da meia-vida (é o que faz o
     ciclo voltar). Embaixo, o relógio de decaimento contra a janela da senha. À direita, a reação em cadeia (R1) e a
     barra de controle (B1). Tudo lido de passos · isotopos · loops · loop_arestas · contagens · relatorio. */
  var atomo = document.getElementById("atomo"), leituraAbre = document.getElementById("leitura-abre");
  var isoRelogio = null, loopNos = {}, arestasR1 = [], neutrons = [];
  function isoTerapeuticos() { return (D.isotopos || []).filter(function (i) { return (i.uso || []).indexOf("tratar") >= 0 && (i.terapias || []).length; }); }
  function montaAtomo() {
    if (!atomo || atomo.firstChild) return;
    var CX = 150, CY = 160, R = 112;
    var defs = el("defs", {}, atomo);
    var pat = el("pattern", { id: "rl-hachura", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "#B3261E", "stroke-width": 1, opacity: .35 }, pat);
    ["ver", "tratar", "risco"].forEach(function (k) {
      var mk = el("marker", { id: "at-seta-" + k, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, defs);
      el("path", { d: "M0,0 L10,5 L0,10 z", fill: k === "risco" ? "#B3261E" : k === "ver" ? passoCor("V") : passoCor("T") }, mk);
    });
    var isoVer = (D.isotopos || []).filter(function (i) { return i.emissao === "beta_mais"; })[0] || (D.isotopos || []).filter(function (i) { return (i.uso || []).indexOf("ver") >= 0; })[0];
    var isoTrat = isoTerapeuticos()[0];
    isoRelogio = isoTrat;

    /* o corpo: o tecido */
    el("circle", { cx: CX, cy: CY, r: R, "class": "at-corpo" }, atomo);
    texto(atomo, CX - R + 6, CY + R - 6, "o corpo", "at-corpo-rot");

    /* a molécula: o ligante (três anéis), o quelante e os dois núcleos — clicável, abre os serviços */
    var mol = el("g", { "class": "at-mol", role: "button", tabindex: 0, "aria-label": rel("atomo_molecula") }, atomo);
    var lig = [[112, 186], [92, 203], [72, 220]];
    lig.forEach(function (p, i) {
      var pts = [];
      for (var k = 0; k < 6; k++) { var a = Math.PI / 3 * k + Math.PI / 6; pts.push((p[0] + 8 * Math.cos(a)).toFixed(1) + "," + (p[1] + 8 * Math.sin(a)).toFixed(1)); }
      if (i > 0) el("line", { x1: lig[i - 1][0], y1: lig[i - 1][1], x2: p[0], y2: p[1], "class": "at-braco" }, mol);
      el("polygon", { points: pts.join(" "), "class": "at-lig" }, mol);
    });
    el("line", { x1: 112, y1: 186, x2: 133, y2: 177, "class": "at-braco" }, mol);
    textoLinhas(mol, 30, 244, (rel("atomo_ligante") || "O ligante acha o alvo.").split(/\.\s/)[0].replace(/\.$/, ""), "at-lig-rot", "start", 26, 10);
    el("circle", { cx: CX, cy: CY, r: 24, "class": "at-quelante" }, mol);
    [45, 135, 225, 315].forEach(function (a) { var r = Math.PI * a / 180; el("line", { x1: CX + 24 * Math.cos(r), y1: CY + 24 * Math.sin(r), x2: CX + 31 * Math.cos(r), y2: CY + 31 * Math.sin(r), "class": "at-braco" }, mol); });
    var nV = el("g", {}, mol), nT = el("g", {}, mol);
    el("circle", { cx: CX - 9, cy: CY, r: 9.5, "class": "at-nuc", fill: passoCor("V") }, nV);
    texto(nV, CX - 9, CY + 2.6, isoVer ? isoVer.simbolo.replace(/-.*/, "") : "V", "at-nuc-rot", "middle");
    el("circle", { cx: CX + 10, cy: CY, r: 11, "class": "at-nuc", fill: passoCor("T") }, nT);
    texto(nT, CX + 10, CY + 2.8, isoTrat ? isoTrat.simbolo.replace(/-.*/, "") : "T", "at-nuc-rot", "middle");
    clicavel(mol, function () { abre("servicos"); });

    /* V · ver: do núcleo de ver, dois fótons opostos atravessam o corpo e saem (PET: o par de 511 keV; SPECT: o γ) */
    var gV = el("g", { "class": "at-emis", "data-passo": "V", role: "button", tabindex: 0, "aria-label": "V ver: o fóton sai do corpo e é visto" }, atomo);
    function onda(x1, y1, x2, y2) {
      var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L, ny = dx / L, n = Math.round(L / 6), d = "M" + x1 + "," + y1;
      for (var i = 1; i <= n; i++) { var t = i / n, s = (i % 2 ? 3 : -3); d += " Q" + (x1 + dx * (t - 0.5 / n) + nx * s) + "," + (y1 + dy * (t - 0.5 / n) + ny * s) + " " + (x1 + dx * t) + "," + (y1 + dy * t); }
      return d;
    }
    el("path", { d: onda(CX - 9, CY - 10, CX - 9, 30), "class": "at-gama at-gama-anim", "marker-end": "url(#at-seta-ver)" }, gV);
    el("path", { d: onda(CX - 9, CY + 10, CX - 9, CY + R + 18), "class": "at-gama at-gama-anim", "marker-end": "url(#at-seta-ver)" }, gV);
    texto(gV, CX - 9, 12, "V · " + (PASSO.V ? PASSO.V.nome : "ver"), "", "middle").setAttribute("fill", passoCor("V"));
    texto(gV, CX - 9, 22, (isoVer ? EMISSAO_TXT[isoVer.emissao] + " · " : "") + "sai do corpo: é visto", "at-sub", "middle");
    if (isoVer) gV.setAttribute("aria-label", "V ver: " + isoVer.simbolo + ", " + isoVer.energia_curta + ", sai do corpo e é visto");
    quebra((PASSO.V && PASSO.V.fisica) || "o fóton atravessa o corpo e é visto de fora", 44).slice(0, 2).forEach(function (l, i) { texto(gV, CX - 9, CY + R + 30 + i * 10, l, "at-sub", "middle"); });
    clicavel(gV, function () { passoAtual = "V"; abre("jornadas"); });

    /* T · tratar: do núcleo de tratar, a partícula β⁻ anda `alcance_mm × 28` e para dentro do corpo; a α, 0,1 mm */
    var gT = el("g", { "class": "at-emis", "data-passo": "T", role: "button", tabindex: 0, "aria-label": "T tratar: a partícula fica no tecido" }, atomo);
    var alc = isoTrat && isoTrat.alcance_mm ? num(isoTrat.alcance_mm) : 2, L = Math.max(14, alc * 28);
    el("line", { x1: CX + 21, y1: CY, x2: CX + 21 + L, y2: CY, "class": "at-beta", "marker-end": "url(#at-seta-tratar)" }, gT);
    texto(gT, CX + 26 + L, CY - 4, "T · " + (PASSO.T ? PASSO.T.nome : "tratar"), "").setAttribute("fill", passoCor("T"));
    texto(gT, CX + 26 + L, CY + 7, (isoTrat ? EMISSAO_TXT[isoTrat.emissao] + " · " + pt(alc, alc % 1 ? 1 : 0) + " mm" : "β⁻ · 2 mm") + " · fica no tecido", "at-sub");
    var isoAlfa = (D.isotopos || []).filter(function (i) { return i.emissao === "alfa" || i.emissao === "alfa_filhas"; })[0];
    if (isoAlfa) {
      el("line", { x1: CX + 21, y1: CY + 12, x2: CX + 21 + Math.max(4, num(isoAlfa.alcance_mm) * 28), y2: CY + 12, "class": "at-alfa" }, gT);
      texto(gT, CX + 30, CY + 24, "α · " + pt(num(isoAlfa.alcance_mm), 1) + " mm · " + isoAlfa.simbolo, "at-sub");
    }
    clicavel(gT, function () { passoAtual = "T"; abre("jornadas"); });

    /* R · reavaliar: o dial da meia-vida em volta do núcleo de tratar (metade da atividade) */
    var gR = el("g", { "class": "at-emis", "data-passo": "R", role: "button", tabindex: 0, "aria-label": "R reavaliar: a meia-vida" }, atomo);
    var rd = 36, circ = 2 * Math.PI * rd;
    el("circle", { cx: CX, cy: CY, r: rd, "class": "at-dial-fundo" }, gR);
    el("circle", { cx: CX, cy: CY, r: rd, "class": "at-dial", "stroke-dasharray": (circ / 2).toFixed(1) + " " + circ.toFixed(1), transform: "rotate(-90 " + CX + " " + CY + ")" }, gR);
    texto(gR, CX + 30, CY - 34, "↻ " + (PASSO.R ? PASSO.R.nome : "reavaliar"), "").setAttribute("fill", passoCor("R"));
    texto(gR, CX + 30, CY - 24, "meia-vida " + (isoTrat ? meiaVidaTxt(isoTrat) : "") + " · o ciclo volta", "at-sub");
    clicavel(gR, function () { passoAtual = "R"; abre("jornadas"); });

    /* a legenda da molécula */
    textoLinhas(atomo, CX, 326, rel("atomo_molecula") || "A mesma molécula leva o olho e o remédio. A mesma jornada precisa de um dono.", "at-mol-rot serif", "middle", 52, 11);

    /* R1 como reação em cadeia: os núcleos em anel, os nêutrons voando de um ao seguinte */
    var R1 = (D.loops || []).filter(function (l) { return l.loop === "R1"; }), B1 = (D.loops || []).filter(function (l) { return l.loop === "B1"; });
    var ARE = D.loop_arestas || [];
    var rx = 392, ry = 100, rr = 56, pos = {};
    textoLinhas(atomo, 296, 9, rel("r1_titulo") || "R1 · a reação em cadeia: por que o problema se sustenta sozinho", "at-titulo", "start", 34, 9);
    R1.forEach(function (n, i) { var a = -Math.PI / 2 + 2 * Math.PI * i / R1.length; pos[n.id] = [rx + rr * Math.cos(a), ry + rr * Math.sin(a)]; });
    var gA = el("g", {}, atomo);
    ARE.forEach(function (ar) {
      var a = pos[ar.de], b = pos[ar.para];
      if (!a || !b) return;
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, k = 0.35, cx = mx + (rx - mx) * k, cy = my + (ry - my) * k;
      var d = "M" + a[0] + "," + a[1] + " Q" + cx + "," + cy + " " + b[0] + "," + b[1];
      var p = el("path", { d: d, "class": "r1-aresta" + (ar.freia === "sim" ? " freavel" : ""), "marker-end": "url(#at-seta-risco)" }, gA);
      texto(gA, (a[0] + 2 * cx + b[0]) / 4 + 4, (a[1] + 2 * cy + b[1]) / 4, ar.sinal, "r1-sinal");
      arestasR1.push({ p: p, ar: ar });
      if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
        var c = el("circle", { r: 2.2, "class": "r1-neutron" + (ar.freia === "sim" ? " freavel" : "") }, gA);
        var am = el("animateMotion", { dur: (3 + Math.random() * 2).toFixed(1) + "s", repeatCount: "indefinite", path: d }, c);
        neutrons.push({ c: c, ar: ar });
      }
    });
    R1.forEach(function (n, i) {
      var p = pos[n.id];
      var g = el("g", { "class": "r1-no tipo-" + n.tipo + " r1-pulsa", "data-loop": n.id, role: "button", tabindex: 0, "aria-label": n.rotulo, style: "animation-delay:" + (i * 0.34).toFixed(2) + "s" }, atomo);
      el("circle", { cx: p[0], cy: p[1], r: 10 }, g);
      texto(g, p[0], p[1] + 3, String(i + 1), "", "middle");
      loopNos[n.id] = g;
      clicavel(g, function () { acendeLoop(n.id); abre(n.vista, n.item); });
    });
    /* B1 como barra de controle: entra no anel pela esquerda; enquanto inserida, as arestas que ela freia apagam */
    var bx = 304, by0 = 38, by1 = 162;
    var barra = el("rect", { x: bx - 5, y: by0, width: 10, height: by1 - by0, rx: 3, "class": "b1-barra", role: "button", tabindex: 0, "aria-label": rel("b1_titulo") }, atomo);
    texto(atomo, bx, by0 - 8, "B1", "at-titulo", "middle");
    function freia(on) {
      arestasR1.forEach(function (x) { if (x.ar.freia === "sim") x.p.classList.toggle("freada", on); });
      neutrons.forEach(function (x) { if (x.ar.freia === "sim") x.c.classList.toggle("freado", on); });
      barra.classList.toggle("on", on);
    }
    barra.addEventListener("mouseenter", function () { freia(true); }); barra.addEventListener("mouseleave", function () { freia(false); });
    barra.addEventListener("focus", function () { freia(true); }); barra.addEventListener("blur", function () { freia(false); });
    clicavel(barra, function () { if (B1[0]) abre(B1[0].vista, B1[0].item); });
    B1.forEach(function (n, i) {
      var y = by0 + 30 + i * 52;
      var g = el("g", { "class": "b1-no", "data-loop": n.id, role: "button", tabindex: 0, "aria-label": n.rotulo }, atomo);
      el("rect", { x: bx - 9, y: y - 9, width: 18, height: 18, rx: 3 }, g);
      texto(g, bx, y + 3, "B" + (i + 1), "", "middle");
      loopNos[n.id] = g;
      g.addEventListener("mouseenter", function () { freia(true); }); g.addEventListener("mouseleave", function () { freia(false); });
      clicavel(g, function () { acendeLoop(n.id); abre(n.vista, n.item); });
    });
    /* a legenda dos nós: a reação, nó a nó; a barra, absorvedor a absorvedor (clicável, como os nós) */
    var ly = 194;
    R1.concat(B1).forEach(function (n, i) {
      var idx = i < R1.length ? String(i + 1) : "B" + (i - R1.length + 1);
      var g = el("g", { "class": "lg-linha lg-" + n.loop, "data-loop": n.id, role: "button", tabindex: 0 }, atomo);
      var t = texto(g, 296, ly, "", "", "start");
      var tn = el("tspan", { "class": "lg-n" }, t); tn.textContent = idx + " ";
      var tt = el("tspan", {}, t); tt.textContent = n.curto;
      if (i === R1.length - 1) { ly += 6; texto(atomo, 296, ly + 3, rel("b1_titulo") || "B1 · a barra de controle: o que freia o ciclo", "at-titulo"); ly += 5; }
      ly += 12;
      loopNos["lg-" + n.id] = g;
      clicavel(g, function () { acendeLoop(n.id); abre(n.vista, n.item); });
    });

    /* o relógio de decaimento, com os isótopos terapêuticos como botões */
    var rl = el("g", { "class": "rl-clique", transform: "translate(0,352)", role: "button", tabindex: 0, "aria-label": "o relógio de decaimento: a dose decai enquanto a senha não chega" }, atomo);
    var fo = el("foreignObject", { x: 16, y: 0, width: 448, height: 88 }, rl);
    var div = document.createElementNS("http://www.w3.org/1999/xhtml", "div"); div.setAttribute("style", "width:448px;height:88px"); fo.appendChild(div);
    function pintaRelogio() { div.innerHTML = relogioSvg(isoRelogio, { w: 448, h: 88 }); }
    pintaRelogio();
    clicavel(rl, function () { abre("jornadas", "s3"); });
    var bx2 = 308;
    isoTerapeuticos().forEach(function (iso) {
      var g = el("g", { "class": "rl-iso" + (iso === isoRelogio ? " on" : "") + (iso.confianca === "aberto" ? " rl-aberto" : ""), "data-iso": iso.id, role: "button", tabindex: 0, "aria-label": iso.nome + ", meia-vida " + meiaVidaTxt(iso) }, atomo);
      el("rect", { x: bx2, y: 338, width: 46, height: 13, rx: 6.5 }, g);
      texto(g, bx2 + 23, 347.5, iso.simbolo, "", "middle");
      clicavel(g, function () {
        isoRelogio = iso; pintaRelogio();
        Array.prototype.forEach.call(atomo.querySelectorAll(".rl-iso"), function (x) { x.classList.toggle("on", x.getAttribute("data-iso") === iso.id); });
      });
      bx2 += 52;
    });
    texto(atomo, 16, 348, "o relógio da dose", "at-titulo");
  }
  function acendeLoop(id) {
    selecao.abertura = id || null;
    Object.keys(loopNos).forEach(function (k) { loopNos[k].classList.toggle("on", !!id && (k === id || k === "lg-" + id)); });
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
    var dentro = D.atores.filter(function (a) { return a.lado === "dentro"; }), fora = D.atores.filter(function (a) { return a.lado === "fora"; });
    var pos = {}, BW = 262, BH = 40;
    texto(eco, 250, 40, "DENTRO DO EINSTEIN", "grupo-rotulo", "middle");
    texto(eco, 690, 40, "FORA DO EINSTEIN", "grupo-rotulo", "middle");
    [[dentro, 250, "e"], [fora, 690, "d"]].forEach(function (col) {
      var n = col[0].length, y0 = 76, y1 = 520, passo = n > 1 ? (y1 - y0) / (n - 1) : 0;
      col[0].forEach(function (a, i) {
        var y = y0 + i * passo;
        pos[a.id] = { x: col[1], y: y, col: col[2] };
        var g = el("g", { "class": "estacao e-" + a.lado + " c-" + a.confianca, transform: "translate(" + col[1] + "," + y + ")", role: "button", tabindex: 0, "aria-label": a.nome }, eco);
        el("rect", { x: -BW / 2, y: -BH / 2, width: BW, height: BH, rx: 9 }, g);
        texto(g, 0, -3, a.curto, "nome", "middle");
        texto(g, 0, 11, quebra(a.papel, 48)[0] + (quebra(a.papel, 48).length > 1 ? "…" : ""), "papel", "middle");
        caixasEco[a.id] = g;
        clicavel(g, function () { selecionaEco(selecao.ecossistema === "a:" + a.id ? null : "a:" + a.id); estadoNaUrl(); });
      });
    });
    var gS = el("g", {}, eco), usados = {};
    (D.fluxos || []).forEach(function (f) {
      var a = pos[f.de], b = pos[f.para];
      if (!a || !b) return;
      var par = [f.de, f.para].sort().join("|"), nth = (usados[par] = (usados[par] || 0) + 1) - 1, desvio = nth * 12 * (f.de < f.para ? 1 : -1), d, lx, ly;
      if (a.col === b.col) {
        var lado = a.col === "e" ? -1 : 1, borda = a.x + lado * BW / 2, prof = 50 + Math.abs(b.y - a.y) * 0.14 + nth * 18, cx = borda + lado * prof, my = (a.y + b.y) / 2;
        d = "M" + borda + "," + a.y + " Q" + cx + "," + my + " " + borda + "," + b.y; lx = (borda + cx) / 2; ly = my;
      } else {
        var x1 = a.x + (a.col === "e" ? BW / 2 : -BW / 2), y1 = a.y + desvio, x2 = b.x + (b.col === "e" ? BW / 2 : -BW / 2), y2 = b.y + desvio;
        var c1 = x1 + (a.col === "e" ? 100 : -100), c2 = x2 + (b.col === "e" ? 100 : -100);
        d = "M" + x1 + "," + y1 + " C" + c1 + "," + y1 + " " + c2 + "," + y2 + " " + x2 + "," + y2; lx = (x1 + 3 * c1 + 3 * c2 + x2) / 8; ly = (y1 + y2) / 2;
      }
      var p = el("path", { d: d, "class": "fluxo t-" + f.tipo + " f-enq-" + f.enquadramento, "marker-end": "url(#m-enq-" + f.enquadramento + ")" }, gS);
      var r = el("g", { "class": "rot-fluxo" }, eco);
      el("circle", { cx: lx, cy: ly, r: 9, fill: ENQ[f.enquadramento] ? ENQ[f.enquadramento].cor : "#0C3A6F" }, r);
      var t = texto(r, lx, ly + 3.5, "", "", "middle");
      setasEco.push({ f: f, p: p, r: r, t: t });
    });
    texto(eco, 925, 540, "setas: cor = quem paga ou autoriza · cheia = acontece · tracejada = a confirmar · pontilhada = regra", "nota-svg", "end");
  })();
  var numFluxo = {};
  function selecionaEco(item) {
    selecao.ecossistema = item || null;
    var ator = item && item.indexOf("a:") === 0 ? item.slice(2) : (item && ATOR[item] ? item : null);
    var fluxo = item && item.indexOf("f:") === 0 ? item.slice(2) : null;
    var tocados = {};
    numFluxo = {};
    var n = 0;
    setasEco.forEach(function (s) {
      var on = (ator && (s.f.de === ator || s.f.para === ator)) || (fluxo && s.f.id === fluxo);
      if (on) { n += 1; numFluxo[s.f.id] = n; s.t.textContent = String(n); tocados[s.f.de] = tocados[s.f.para] = true; }
      s.p.classList.toggle("vis", !!on); s.r.classList.toggle("vis", !!on);
    });
    if (ator) tocados[ator] = true;
    Object.keys(caixasEco).forEach(function (id) {
      caixasEco[id].classList.toggle("foco", !!tocados[id] && (id === ator || !!fluxo));
      caixasEco[id].classList.toggle("apagada", !!(ator || fluxo) && !tocados[id]);
    });
    leituraEcossistema(ator, fluxo);
  }
  function itemFluxo(f, ativo) {
    var nn = numFluxo[f.id], e = ENQ[f.enquadramento] || {};
    return "<li class='clicavel t-" + f.tipo + (ativo ? " on" : "") + "' tabindex='0' data-fluxo='" + f.id + "' style='border-left-color:" + (e.cor || "#ccc") + "'>" +
      (nn ? "<span class='n' style='background:" + e.cor + "'>" + nn + "</span>" : "") +
      "<b>" + esc(ATOR[f.de] ? ATOR[f.de].curto : f.de) + " → " + esc(ATOR[f.para] ? ATOR[f.para].curto : f.para) + "</b>: " + esc(f.oque) +
      (f.etapas && f.etapas.length ? "<span class='et'>" + f.etapas.map(function (s) { return ETAPA[s] ? ETAPA[s].curto : s; }).join(" · ") + "</span>" : "") + "</li>";
  }
  function leituraEcossistema(ator, fluxo) {
    var html = "";
    if (ator && ATOR[ator]) {
      var a = ATOR[ator], seus = (D.fluxos || []).filter(function (f) { return f.de === ator || f.para === ator; });
      html += "<div class='bloco ficha'><div class='rotulo'>" + (a.lado === "dentro" ? "Dentro do Einstein" : "Fora do Einstein") + (a.grupo && GRUPO[a.grupo] ? " · " + esc(GRUPO[a.grupo].nome) : "") + " " + conf(a.confianca) + "</div><h3>" + esc(a.nome) + "</h3><p>" + esc(ponto(maiuscula(a.papel))) + "</p></div>";
      html += "<div class='bloco'><div class='rotulo'>O que chega e sai</div><ul class='lista'>" + (seus.length ? seus.map(function (f) { return itemFluxo(f, false); }).join("") : "<li>nenhuma relação registrada ainda</li>") + "</ul></div>";
      var achs = achadosDe("ecossistema").slice(0, 2);
      if (achs.length) html += "<div class='bloco'><div class='rotulo'>O que já sabemos nesta camada</div>" + achs.map(function (x) { return achadoHtml(x, "mini"); }).join("") + "</div>";
    } else if (fluxo) {
      var fl = (D.fluxos || []).filter(function (f) { return f.id === fluxo; })[0];
      if (fl) html += "<div class='bloco'><div class='rotulo'>Uma relação " + tagEnq(fl.enquadramento, true) + " " + conf(fl.confianca) + "</div><ul class='lista'>" + itemFluxo(fl, true) + "</ul></div>";
    } else {
      html += "<div class='bloco'>" + achadosHtml("ecossistema", true, 4) + "</div>";
    }
    html += elo("ecossistema");
    escreve(leituraEco, html);
    Array.prototype.forEach.call(leituraEco.querySelectorAll("[data-fluxo]"), function (li) {
      clicavel(li, function () { var alvo = "f:" + li.dataset.fluxo; selecionaEco(selecao.ecossistema === alvo ? null : alvo); estadoNaUrl(); });
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
  function desenhaBlueprint(linhas, raias, iso) {
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
    if (iso) html += "<div class='bpp-rot'><b>O RELÓGIO DA DOSE</b><small>" + esc(iso.simbolo) + " · meia-vida " + meiaVidaTxt(iso) + "</small></div><div class='bpp-relogio'>" + relogioSvg(iso, { w: 900, h: 64, dias: 30, semFrase: true }) + "</div>";
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
          ["O PACIENTE VIVE", "sempre inferência", function (j) { return "<div class='bpp-cel bpp-infere" + (j.vive ? "" : " bpp-vazia") + "' title='" + esc(j.vive) + "'>" + esc(corta(j.vive, 90)) + "</div>"; }],
          ["QUEM ATUA", "e quem decide", function (j) { return "<div class='bpp-cel" + (j.fonte === "inferencia" ? " bpp-infere" : "") + "' title='" + esc(j.atua) + "'>" + esc(corta(j.atua, 70)) + (j.decide ? "<small>decide: " + esc(corta(j.decide, 40)) + "</small>" : "") + "</div>"; }],
          "vis",
          ["BASTIDOR", "e onde fica o registro", function (j) { return "<div class='bpp-cel" + (j.fonte === "inferencia" ? " bpp-infere" : "") + (j.bastidor ? "" : " bpp-vazia") + "' title='" + esc(j.bastidor) + "'>" + esc(corta(j.bastidor, 90)) + ((j.sistema || []).length ? "<span class='chips'>" + (j.sistema || []).map(function (s) { return "<span class='chip-sis'>" + esc(SIS[s] ? SIS[s].nome : s) + "</span>"; }).join("") + "</span>" : "") + "</div>"; }],
          ["DONO", "e quem paga ou autoriza", function (j) { return (j.dono === "ninguem" ? "<div class='bpp-cel bpp-risco'>ninguém" : "<div class='bpp-cel bpp-dono" + (j.dono ? "" : " bpp-vazia") + "'>" + esc(ATOR[j.dono] ? ATOR[j.dono].curto : j.dono)) + ((j.paga || []).length ? "<span class='chips'>" + (j.paga || []).map(function (k) { return tagEnq(k, true); }).join("") + "</span>" : "") + "</div>"; }],
          ["O QUE FALTA", "nesta etapa", function (j) { var et = ETAPA[j.etapa]; return "<div class='bpp-cel" + (et && et.gate ? " bpp-risco" : " bpp-vazia") + "'>" + esc(et && et.gate ? et.gate : "") + "</div>"; }]
        ], isoMae) + rodape;
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
        ], ISO[s.isotopo_tratar] || isoMae) +
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
      "<p class='l-coluna' style='margin:4px 0 0'>AS OITO ALTERNATIVAS</p><div class='alt-grade'>" + grade + "</div>" +

      "</div>" +
      "<div class='alt-cards'>" + alts.map(function (a) { return "<div class='alt-card' data-alt='" + a.id + "' style='--cor:" + (COR_EST[a.estado] || "#0C3A6F") + "'>" + card(a) + "</div>"; }).join("") +
      "<div class='alt-card' data-alt='arquitetura' style='--cor:#0C3A6F'>" + cardArquitetura() + "</div>" +
      "</div></div>");
    Array.prototype.forEach.call(direcao.querySelectorAll(".alt-b,.alt-op"), function (b) { b.addEventListener("click", function () { mostraAlt(b.dataset.alt); estadoNaUrl(); }); });
    mostraAlt(alts[0].id);
  })();
  function mostraAlt(id) {
    if (!direcao) return;
    if (!id || !(ALT[id] || id === "arquitetura")) id = (D.alternativas || [])[0] ? D.alternativas[0].id : null;
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
    if (vista === "ecossistema") selecionaEco(item || "a:conv");
    else selecionaEco("a:conv");
    if (vista === "sistema" && item) selecionaSis(item);
    if (vista === "servicos" && item) selecionaServico(item);
    abre(vista, (vista === "direcao" || vista === "abertura" || vista === "jornadas") ? (item || undefined) : undefined);
  }
  aplicaEstado(location.search);
})();
