/* =========================================================
   SISTEMA DE ETIQUETAS — CONDOR
   script.js
   ========================================================= */

// ---------------------------------------------------------
// CONFIGURAÇÃO — cole aqui a URL do Web App do Google Apps Script
// ---------------------------------------------------------
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxYwWj9m3zUAykhSZ7f2E8EZOI5xEymbIwc0HNGm8kNBodFAO0XWm9odc-7AI4kyA3f/exec";

// ---------------------------------------------------------
// ESTADO EM MEMÓRIA
// ---------------------------------------------------------
let bancoDeProdutos = [];   // [{ codigo, descricao }, ...] carregado uma única vez
let produtoEncontrado = null; // produto atualmente selecionado (ou null)
let bancoCarregado = false;

// ---------------------------------------------------------
// ELEMENTOS
// ---------------------------------------------------------
const el = {
  dbStatus: document.getElementById("dbStatus"),

  codigo: document.getElementById("codigo"),
  codigoFeedback: document.getElementById("codigoFeedback"),
  descricao: document.getElementById("descricao"),
  quantidade: document.getElementById("quantidade"),
  lote: document.getElementById("lote"),
  validade: document.getElementById("validade"),
  notaFiscal: document.getElementById("notaFiscal"),
  dataRecebimento: document.getElementById("dataRecebimento"),

  btnSalvar: document.getElementById("btnSalvar"),
  btnCopiar: document.getElementById("btnCopiar"),
  btnImprimir: document.getElementById("btnImprimir"),

  formMessage: document.getElementById("formMessage"),
  labelMessage: document.getElementById("labelMessage"),

  etiqueta: document.getElementById("etiqueta"),
  etqCodigo: document.getElementById("etqCodigo"),
  etqDescricao: document.getElementById("etqDescricao"),
  etqQuantidade: document.getElementById("etqQuantidade"),
  etqValidade: document.getElementById("etqValidade"),
  etqNotaFiscal: document.getElementById("etqNotaFiscal"),
  etqDataRecebimento: document.getElementById("etqDataRecebimento"),
  etqBarcodeSvg: document.getElementById("etqBarcodeSvg"),
  etqBarcodeNumero: document.getElementById("etqBarcodeNumero"),
};

// ---------------------------------------------------------
// UTILITÁRIOS
// ---------------------------------------------------------

/** Retorna a data atual do usuário formatada como DD/MM/AAAA */
function formatarDataAtual() {
  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, "0");
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const aaaa = hoje.getFullYear();
  return `${dd}/${mm}/${aaaa}`;
}

/** Converte AAAA-MM-DD (input type=date) para DD/MM/AAAA */
function formatarDataValidade(valorInputDate) {
  if (!valorInputDate) return "";
  const [aaaa, mm, dd] = valorInputDate.split("-");
  return `${dd}/${mm}/${aaaa}`;
}

function setFeedback(elemento, texto, tipo) {
  elemento.textContent = texto || "";
  elemento.classList.remove("feedback--ok", "feedback--error");
  if (tipo === "ok") elemento.classList.add("feedback--ok");
  if (tipo === "error") elemento.classList.add("feedback--error");
}

function setInputState(inputEl, valido) {
  inputEl.classList.remove("field--valid", "field--invalid");
  if (valido === true) inputEl.classList.add("field--valid");
  if (valido === false) inputEl.classList.add("field--invalid");
}

function feedbackParaCampo(nome) {
  return document.querySelector(`.feedback[data-for="${nome}"]`);
}

// ---------------------------------------------------------
// CARREGAR BANCO DE DADOS (uma única vez, mantido em memória)
// ---------------------------------------------------------
async function carregarBancoDeProdutos() {
  el.dbStatus.textContent = "Carregando banco de dados…";
  el.dbStatus.className = "db-status db-status--loading";

  try {
    const url = `${GOOGLE_APPS_SCRIPT_URL}?action=listarProdutos`;
    const resp = await fetch(url, { method: "GET" });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (!data.ok) throw new Error(data.erro || "Erro desconhecido");

    bancoDeProdutos = data.produtos || [];
    bancoCarregado = true;

    el.dbStatus.textContent = `Banco carregado (${bancoDeProdutos.length} produtos)`;
    el.dbStatus.className = "db-status db-status--ready";
  } catch (err) {
    console.error("Falha ao carregar banco de produtos:", err);
    bancoCarregado = false;
    el.dbStatus.textContent = "Falha ao carregar banco de dados";
    el.dbStatus.className = "db-status db-status--error";
  }
}

/** Busca local (instantânea) no banco carregado em memória */
function buscarProdutoLocal(codigo) {
  const codigoLimpo = String(codigo).trim();
  if (!codigoLimpo) return null;
  return (
    bancoDeProdutos.find((p) => String(p.codigo).trim() === codigoLimpo) ||
    null
  );
}

// ---------------------------------------------------------
// BUSCA DE PRODUTO AO DIGITAR O CÓDIGO
// ---------------------------------------------------------
let debounceTimer = null;

el.codigo.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const valor = el.codigo.value.trim();

  if (!valor) {
    produtoEncontrado = null;
    el.descricao.value = "";
    setFeedback(el.codigoFeedback, "", null);
    setInputState(el.codigo, null);
    atualizarEtiqueta();
    return;
  }

  debounceTimer = setTimeout(() => {
    if (!bancoCarregado) {
      setFeedback(
        el.codigoFeedback,
        "Banco de dados ainda não carregado.",
        "error"
      );
      return;
    }

    const produto = buscarProdutoLocal(valor);

    if (produto) {
      produtoEncontrado = produto;
      el.descricao.value = produto.descricao;
      setFeedback(el.codigoFeedback, "Produto encontrado.", "ok");
      setInputState(el.codigo, true);
    } else {
      produtoEncontrado = null;
      el.descricao.value = "";
      setFeedback(
        el.codigoFeedback,
        "Produto não encontrado no banco de dados.",
        "error"
      );
      setInputState(el.codigo, false);
    }

    atualizarEtiqueta();
  }, 200);
});

// ---------------------------------------------------------
// ATUALIZAÇÃO DA ETIQUETA EM TEMPO REAL
// ---------------------------------------------------------
function atualizarEtiqueta() {
  const codigo = el.codigo.value.trim() || "000000";
  const descricao = el.descricao.value.trim() || "—";
  const quantidade = el.quantidade.value.trim() || "0";
  const validade = el.validade.value
    ? formatarDataValidade(el.validade.value)
    : "—";
  const notaFiscal = el.notaFiscal.value.trim() || "—";
  const dataRecebimento = el.dataRecebimento.value || "—";

  el.etqCodigo.textContent = codigo;
  el.etqDescricao.textContent = descricao;
  el.etqQuantidade.textContent = quantidade;
  el.etqValidade.textContent = validade;
  el.etqNotaFiscal.textContent = notaFiscal;
  el.etqDataRecebimento.textContent = dataRecebimento;

  const loteParaBarcode = el.lote.value.trim() || "000000";
  el.etqBarcodeNumero.textContent = loteParaBarcode;

  atualizarBarcode(loteParaBarcode);
}

function atualizarBarcode(valor) {
  try {
    if (typeof JsBarcode === "undefined") return;
    JsBarcode(el.etqBarcodeSvg, valor, {
      format: "CODE128",
      lineColor: "#0a0a0a",
      width: 2,
      height: 42,
      displayValue: false,
      margin: 0,
    });
  } catch (err) {
    // Valor inválido para geração de barras (ex: campo vazio) — ignora silenciosamente
  }
}

// Atualiza a etiqueta a cada alteração de campo
["quantidade", "lote", "validade", "notaFiscal"].forEach((nome) => {
  el[nome].addEventListener("input", atualizarEtiqueta);
});

// ---------------------------------------------------------
// VALIDAÇÃO DO FORMULÁRIO
// ---------------------------------------------------------
function validarFormulario() {
  let valido = true;

  // Código
  if (!el.codigo.value.trim() || !produtoEncontrado) {
    setFeedback(
      el.codigoFeedback,
      "Produto não encontrado no banco de dados.",
      "error"
    );
    setInputState(el.codigo, false);
    valido = false;
  }

  // Quantidade
  const qtd = Number(el.quantidade.value);
  const fbQtd = feedbackParaCampo("quantidade");
  if (!el.quantidade.value || qtd <= 0) {
    setFeedback(fbQtd, "Informe uma quantidade maior que zero.", "error");
    setInputState(el.quantidade, false);
    valido = false;
  } else {
    setFeedback(fbQtd, "", null);
    setInputState(el.quantidade, true);
  }

  // Lote
  const fbLote = feedbackParaCampo("lote");
  if (!el.lote.value.trim()) {
    setFeedback(fbLote, "Campo obrigatório.", "error");
    setInputState(el.lote, false);
    valido = false;
  } else {
    setFeedback(fbLote, "", null);
    setInputState(el.lote, true);
  }

  // Validade
  const fbValidade = feedbackParaCampo("validade");
  if (!el.validade.value) {
    setFeedback(fbValidade, "Campo obrigatório.", "error");
    setInputState(el.validade, false);
    valido = false;
  } else {
    setFeedback(fbValidade, "", null);
    setInputState(el.validade, true);
  }

  // Nota fiscal
  const fbNF = feedbackParaCampo("notaFiscal");
  if (!el.notaFiscal.value.trim()) {
    setFeedback(fbNF, "Campo obrigatório.", "error");
    setInputState(el.notaFiscal, false);
    valido = false;
  } else {
    setFeedback(fbNF, "", null);
    setInputState(el.notaFiscal, true);
  }

  return valido;
}

// ---------------------------------------------------------
// SALVAR ETIQUETA
// ---------------------------------------------------------
el.btnSalvar.addEventListener("click", async () => {
  setFeedback(el.formMessage, "", null);

  if (!validarFormulario()) {
    setFeedback(
      el.formMessage,
      "Corrija os campos indicados antes de salvar.",
      "error"
    );
    return;
  }

  const payload = {
    action: "salvarEtiqueta",
    codigo: el.codigo.value.trim(),
    descricao: el.descricao.value.trim(),
    quantidade: el.quantidade.value.trim(),
    lote: el.lote.value.trim(),
    validade: formatarDataValidade(el.validade.value),
    notaFiscal: el.notaFiscal.value.trim(),
    dataRecebimento: el.dataRecebimento.value,
  };

  el.btnSalvar.disabled = true;
  el.btnSalvar.textContent = "SALVANDO…";

  try {
    const resp = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (!data.ok) throw new Error(data.erro || "Erro ao salvar.");

    setFeedback(el.formMessage, "Etiqueta salva com sucesso!", "ok");
    el.formMessage.classList.add("form-message--ok");
  } catch (err) {
    console.error("Erro ao salvar etiqueta:", err);
    setFeedback(
      el.formMessage,
      "Não foi possível salvar. Verifique a conexão e a URL do Apps Script.",
      "error"
    );
    el.formMessage.classList.add("form-message--error");
  } finally {
    el.btnSalvar.disabled = false;
    el.btnSalvar.textContent = "SALVAR ETIQUETA";
  }
});

// ---------------------------------------------------------
// COPIAR ETIQUETA COMO IMAGEM (PNG) PARA A ÁREA DE TRANSFERÊNCIA
// ---------------------------------------------------------
el.btnCopiar.addEventListener("click", async () => {
  setFeedback(el.labelMessage, "Gerando imagem…", null);

  try {
    const canvas = await html2canvas(el.etiqueta, {
      backgroundColor: "#ffffff",
      scale: 3,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setFeedback(el.labelMessage, "Falha ao gerar a imagem.", "error");
        return;
      }

      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setFeedback(
            el.labelMessage,
            "Etiqueta copiada! Use Ctrl+V para colar.",
            "ok"
          );
        } else {
          // Navegador sem suporte à Clipboard API de imagens: baixa o arquivo
          baixarImagem(blob);
          setFeedback(
            el.labelMessage,
            "Seu navegador não suporta copiar imagens. A etiqueta foi baixada.",
            "ok"
          );
        }
      } catch (clipErr) {
        console.error("Falha ao copiar para a área de transferência:", clipErr);
        baixarImagem(blob);
        setFeedback(
          el.labelMessage,
          "Não foi possível copiar automaticamente. A etiqueta foi baixada.",
          "error"
        );
      }
    }, "image/png");
  } catch (err) {
    console.error("Erro ao gerar imagem da etiqueta:", err);
    setFeedback(el.labelMessage, "Erro ao gerar a imagem da etiqueta.", "error");
  }
});

function baixarImagem(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `etiqueta-${el.codigo.value.trim() || "produto"}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------
// IMPRIMIR SOMENTE A ETIQUETA
// ---------------------------------------------------------
el.btnImprimir.addEventListener("click", () => {
  window.print();
});

// ---------------------------------------------------------
// INICIALIZAÇÃO
// ---------------------------------------------------------
function inicializar() {
  el.dataRecebimento.value = formatarDataAtual();
  atualizarEtiqueta();
  carregarBancoDeProdutos();
}

inicializar();
