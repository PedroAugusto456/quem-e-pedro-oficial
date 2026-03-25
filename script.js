import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUFKpdr4TAl1xDCVOy8ER1eOGiwfRv4tU",
  authDomain: "quem-e-pedro.firebaseapp.com",
  projectId: "quem-e-pedro",
  storageBucket: "quem-e-pedro.firebasestorage.app",
  messagingSenderId: "397290645692",
  appId: "1:397290645692:web:df41f725e7dafae8b448b9",
  measurementId: "G-TFQTXZZG01"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================
// CALCULAR RESULTADO
// ==========================
window.calcularResultado = async function () {
    const nomeUsuario = document.getElementById('nome_usuario').value.trim();
    const perguntas = document.querySelectorAll('p');
    const respostas = document.querySelectorAll('input[type="radio"]:checked');

    perguntas.forEach(p => p.style.color = "black");

    if (nomeUsuario === "") {
        alert("Digite seu nome!");
        return;
    }

    if (respostas.length < 16) {
        alert("Responda todas as perguntas!");

        for (let i = 1; i <= 16; i++) {
            const marcada = document.querySelector(`input[name="resposta_${i}"]:checked`);
            if (!marcada) {
                perguntas[i - 1].style.color = "red";
            }
        }
        return;
    }

    let pontuacaoTotal = 0;
    respostas.forEach(res => pontuacaoTotal += parseInt(res.value));

    const resultadoFinal = Math.round((pontuacaoTotal / 16) * 100);

    document.getElementById('resultado').innerHTML =
        `<h3>Você é ${resultadoFinal}% Pedro!</h3>`;

    try {
        // remove nome repetido
        const qBusca = query(collection(db, "ranking"), where("nome", "==", nomeUsuario));
        const snapshotBusca = await getDocs(qBusca);

        snapshotBusca.forEach(async (docItem) => {
            await deleteDoc(doc(db, "ranking", docItem.id));
        });

        // salva novo
        await addDoc(collection(db, "ranking"), {
            nome: nomeUsuario,
            porcentagem: resultadoFinal,
            data: new Date()
        });

        // descobre posição
        const q = query(collection(db, "ranking"), orderBy("porcentagem", "desc"));
        const snapshot = await getDocs(q);

        let posicao = 1;
        let minhaPosicao = 0;

        snapshot.forEach(doc => {
            const item = doc.data();
            if (item.nome === nomeUsuario && minhaPosicao === 0) {
                minhaPosicao = posicao;
            }
            posicao++;
        });

        document.getElementById('resultado').innerHTML +=
            `<p>Você ficou em #${minhaPosicao}</p>`;

        carregarRanking();

    } catch (e) {
        console.error("Erro:", e);
    }
};

// ==========================
// TOP 5
// ==========================
async function carregarRanking() {
    const q = query(collection(db, "ranking"), orderBy("porcentagem", "desc"), limit(5));
    const snapshot = await getDocs(q);

    const listaDiv = document.getElementById('lista-ranking');
    listaDiv.innerHTML = "";

    let posicao = 1;

    snapshot.forEach(doc => {
        const item = doc.data();

        let medalha = "";
        if (posicao === 1) medalha = "🥇";
        else if (posicao === 2) medalha = "🥈";
        else if (posicao === 3) medalha = "🥉";

        listaDiv.innerHTML += `
            <p>${medalha} #${posicao} - <strong>${item.nome}</strong>: ${item.porcentagem}%</p>
        `;

        posicao++;
    });

    atualizarTextoBotoes(false);
}

// ==========================
// TOGGLE + SCROLL
// ==========================
window.toggleRanking = async function () {
    const listaDiv = document.getElementById('lista-ranking');
    const rankingContainer = document.getElementById('ranking-container');

    // scroll suave
    rankingContainer.scrollIntoView({ behavior: "smooth" });

    // recolher
    if (listaDiv.dataset.expandido === "true") {
        carregarRanking();
        listaDiv.dataset.expandido = "false";
        atualizarTextoBotoes(false);
        return;
    }

    // expandir
    const q = query(collection(db, "ranking"), orderBy("porcentagem", "desc"));
    const snapshot = await getDocs(q);

    listaDiv.innerHTML = "";

    let posicao = 1;

    snapshot.forEach(doc => {
        const item = doc.data();

        listaDiv.innerHTML += `
            <p>#${posicao} - <strong>${item.nome}</strong>: ${item.porcentagem}%</p>
        `;

        posicao++;
    });

    listaDiv.dataset.expandido = "true";
    atualizarTextoBotoes(true);
};

// ==========================
// ATUALIZA TEXTO DOS BOTÕES
// ==========================
function atualizarTextoBotoes(expandido) {
    const botoes = document.querySelectorAll('button');

    botoes.forEach(btn => {
        if (btn.innerText.includes("Ranking")) {
            btn.innerText = expandido
                ? "Ver Top 5"
                : "Ver Ranking Completo";
        }
    });
}

// ==========================
// INICIAR
// ==========================
carregarRanking();