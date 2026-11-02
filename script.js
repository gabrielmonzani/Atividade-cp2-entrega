// Variáveis de Estado do Jogo
let todasAsPerguntas = [];
let perguntasSelecionadas = [];
let indicePerguntaAtual = 0;
let pontuacao = 0;
let nomeJogador = "";

// Elementos do DOM
const telaInicio = document.getElementById("tela-inicio");
const telaQuiz = document.getElementById("tela-quiz");
const telaFim = document.getElementById("tela-fim");

const formInicio = document.getElementById("form-inicio");
const inputNome = document.getElementById("nome-jogador");

const contadorPerguntasEl = document.getElementById("contador-perguntas");
const pontosAtuaisEl = document.getElementById("pontos-atuais");
const enunciadoEl = document.getElementById("enunciado-pergunta");
const alternativasGrupo = document.getElementById("alternativas-grupo");

const containerFeedback = document.getElementById("container-feedback");
const textoFeedback = document.getElementById("texto-feedback");
const linkFonte = document.getElementById("link-fonte");
const btnProxima = document.getElementById("btn-proxima");

const pontuacaoFinalEl = document.getElementById("pontuacao-final");
const listaRankingEl = document.getElementById("lista-ranking");
const btnReiniciar = document.getElementById("btn-reiniciar");

// 1. Carregar perguntas do JSON via Fetch
async function carregarPerguntas() {
    try {
        const resposta = await fetch("perguntas.json");
        if (!resposta.ok) throw new Error("Erro ao carregar o arquivo JSON.");
        todasAsPerguntas = await resposta.json();
    } catch (erro) {
        console.error("Erro:", erro);
        enunciadoEl.textContent = "Erro ao carregar as perguntas. Verifique se está rodando via Servidor Local (Live Server).";
    }
}

carregarPerguntas();

// Função auxiliar para embaralhar e selecionar 10 perguntas aleatórias
function sortearPerguntas() {
    // Clona e embaralha o array completo usando o algoritmo Fisher-Yates / sort aleatório
    const embaralhadas = [...todasAsPerguntas].sort(() => Math.random() - 0.5);
    // Pega exatamente 10 perguntas (ou menos se o JSON tiver menos de 10)
    perguntasSelecionadas = embaralhadas.slice(0, 10);
}

// 2. Iniciar o Jogo
formInicio.addEventListener("submit", (e) => {
    e.preventDefault();
    nomeJogador = inputNome.value.trim();
    if (!nomeJogador) return;

    if (todasAsPerguntas.length === 0) {
        alert("As perguntas ainda estão carregando ou houve um erro.");
        return;
    }

    // Sorteia 10 perguntas aleatórias para esta partida
    sortearPerguntas();

    // Resetar estados
    indicePerguntaAtual = 0;
    pontuacao = 0;

    // Trocar de tela
    telaInicio.classList.remove("ativa");
    telaQuiz.classList.add("ativa");

    carregarPergunta();
});

// 3. Exibir Pergunta Atual
function carregarPergunta() {
    containerFeedback.classList.add("escondido");
    alternativasGrupo.innerHTML = "";

    const perguntaAtual = perguntasSelecionadas[indicePerguntaAtual];
    contadorPerguntasEl.textContent = `Pergunta ${indicePerguntaAtual + 1} de ${perguntasSelecionadas.length}`;
    pontosAtuaisEl.textContent = `Pontos: ${pontuacao}`;
    enunciadoEl.textContent = perguntaAtual.pergunta;

    // Criar botões para cada alternativa
    perguntaAtual.alternativas.forEach((alternativa, index) => {
        const botao = document.createElement("button");
        botao.classList.add("alt-btn");
        botao.textContent = alternativa;
        botao.setAttribute("type", "button");
        
        botao.addEventListener("click", () => selecionarResposta(index, botao));
        alternativasGrupo.appendChild(botao);
    });
}

// 4. Verificar Resposta Selecionada
function selecionarResposta(indiceEscolhido, botaoEscolhido) {
    const botoes = alternativasGrupo.querySelectorAll("button");
    botoes.forEach(b => b.disabled = true);

    const perguntaAtual = perguntasSelecionadas[indicePerguntaAtual];
    const acertou = indiceEscolhido === perguntaAtual.correta;

    if (acertou) {
        pontuacao++;
        pontosAtuaisEl.textContent = `Pontos: ${pontuacao}`;
        botaoEscolhido.classList.add("correta");
        textoFeedback.innerHTML = `<strong>Resposta correta ✓</strong> - ${perguntaAtual.explicacao}`;
    } else {
        botaoEscolhido.classList.add("incorreta");
        botoes[perguntaAtual.correta].classList.add("correta");
        const letraCorreta = ["A", "B", "C", "D"][perguntaAtual.correta];
        textoFeedback.innerHTML = `<strong>Incorreta ✗</strong> - A alternativa certa era a [${letraCorreta}]. ${perguntaAtual.explicacao}`;
    }

    linkFonte.textContent = perguntaAtual.fonteNome;
    linkFonte.href = perguntaAtual.fonteUrl;

    containerFeedback.classList.remove("escondido");
    btnProxima.focus();
}

// 5. Avançar Pergunta ou Finalizar
btnProxima.addEventListener("click", () => {
    indicePerguntaAtual++;
    if (indicePerguntaAtual < perguntasSelecionadas.length) {
        carregarPergunta();
    } else {
        finalizarJogo();
    }
});

// 6. Finalizar Jogo e Salvar no SessionStorage
function finalizarJogo() {
    telaQuiz.classList.remove("ativa");
    telaFim.classList.add("ativa");

    pontuacaoFinalEl.textContent = `Pontuação de ${nomeJogador}: ${pontuacao}/${perguntasSelecionadas.length}`;

    let ranking = JSON.parse(sessionStorage.getItem("ranking")) || [];
    ranking.push({ nome: nomeJogador, pontos: pontuacao, total: perguntasSelecionadas.length });
    
    ranking.sort((a, b) => b.pontos - a.pontos);
    sessionStorage.setItem("ranking", JSON.stringify(ranking));

    listaRankingEl.innerHTML = "";
    ranking.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${index + 1}º — ${item.nome}</span> <span>${item.pontos}/${item.total}</span>`;
        listaRankingEl.appendChild(li);
    });
}

// 7. Jogar Novamente (Sem recarregar a página)
btnReiniciar.addEventListener("click", () => {
    telaFim.classList.remove("ativa");
    telaInicio.classList.add("ativa");
    inputNome.value = "";
    inputNome.focus();
});