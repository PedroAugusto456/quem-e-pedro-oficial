import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração que você copiou
const firebaseConfig = {
  apiKey: "AIzaSyDUFKpdr4TAl1xDCVOy8ER1eOGiwfRv4tU",
  authDomain: "quem-e-pedro.firebaseapp.com",
  projectId: "quem-e-pedro",
  storageBucket: "quem-e-pedro.firebasestorage.app",
  messagingSenderId: "397290645692",
  appId: "1:397290645692:web:df41f725e7dafae8b448b9",
  measurementId: "G-TFQTXZZG01"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para calcular e salvar
window.calcularResultado = async function() {
    const respostas = document.querySelectorAll('input[type="radio"]:checked');
    const nomeUsuario = document.getElementById('nome_usuario').value;

    if (nomeUsuario.trim() === "" || respostas.length < 16) {
        alert("Por favor, preencha seu nome e responda todas as perguntas!");
        return;
    }

    let pontuacaoTotal = 0;
    respostas.forEach(res => pontuacaoTotal += parseInt(res.value));
    const resultadoFinal = Math.round((pontuacaoTotal / 16) * 100);

    const divResultado = document.getElementById('resultado');
    divResultado.innerHTML = `<h3>Você é ${resultadoFinal}% Pedro!</h3>`;

    try {
        // Salva no banco "ranking"
        await addDoc(collection(db, "ranking"), {
            nome: nomeUsuario,
            porcentagem: resultadoFinal,
            data: new Date()
        });
        alert("Resultado salvo no ranking!");
        carregarRanking(); // Atualiza a lista automaticamente
    } catch (e) {
        console.error("Erro ao salvar: ", e);
    }
}

// Função para buscar os Top 5 do ranking
async function carregarRanking() {
    const q = query(collection(db, "ranking"), orderBy("porcentagem", "desc"), limit(5));
    const snapshot = await getDocs(q);
    const listaDiv = document.getElementById('lista-ranking');
    
    if (listaDiv) {
        listaDiv.innerHTML = "";
        snapshot.forEach(doc => {
            const item = doc.data();
            listaDiv.innerHTML += `<p><strong>${item.nome}</strong>: ${item.porcentagem}% Pedro</p>`;
        });
    }
}

// Carregar o ranking assim que abrir o site
carregarRanking();