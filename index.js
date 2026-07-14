import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { gerarChavesTorneio } from './utils/torneio.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

// Configuração do Socket.io permitindo conexões de qualquer origem (importante para a rede local)
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Estado Global do Torneio em Memória
let estadoTorneio = {
  config: {
    totalCompetidores: 0, // 8, 16 ou 32
    status: 'configuracao' // configuracao, sorteado, em_andamento, finalizado
  },
  competidores: [], // Lista de nomes inseridos pelo M.C.
  batalhas: {},     // Chaves do torneio mapeadas
  batalhaAtual: null // ID da batalha que está acontecendo agora
};

// --- ROTAS HTTP (REST API) ---

// Rota para o M.C. salvar a configuração inicial e a lista de competidores
app.post('/api/configurar', (req, res) => {
  const { totalCompetidores, competidores } = req.body;

  if (![8, 16, 32].includes(Number(totalCompetidores))) {
    return res.status(400).json({ erro: 'Tamanho de chave inválido. Escolha 8, 16 ou 32.' });
  }

  estadoTorneio.config.totalCompetidores = Number(totalCompetidores);
  estadoTorneio.competidores = competidores;
  estadoTorneio.config.status = 'configuracao';
  estadoTorneio.batalhas = {};
  estadoTorneio.batalhaAtual = null;

  // Avisa todas as telas conectadas que a configuração mudou (ex: Telão volta a mostrar a logo FBDD)
  io.emit('atualizacao_torneio', estadoTorneio);

  return res.json({ mensagem: 'Torneio configurado com sucesso!', estado: estadoTorneio });
});

// Rota para o M.C. realizar o sorteio aleatório das chaves
app.post('/api/sortear', (req, res) => {
  const { totalCompetidores, competidores } = estadoTorneio.config;
  
  if (estadoTorneio.competidores.length !== estadoTorneio.config.totalCompetidores) {
    return res.status(400).json({ 
      erro: `A quantidade de competidores inserida (${estadoTorneio.competidores.length}) não bate com o tamanho da chave selecionada (${estadoTorneio.config.totalCompetidores}).` 
    });
  }

  // Gera as chaves usando nossa utilidade matemática
  const chavesGeradas = gerarChavesTorneio(
    estadoTorneio.config.totalCompetidores, 
    estadoTorneio.competidores
  );

  estadoTorneio.batalhas = chavesGeradas;
  estadoTorneio.config.status = 'sorteado';
  
  // Define automaticamente a primeira batalha do Round 1 como a batalha inicial ativa
  estadoTorneio.batalhaAtual = 'r1_b1';

  // Dispara via WebSocket para o Telão e todas as telas atualizarem instantaneamente!
  io.emit('atualizacao_torneio', estadoTorneio);

  return res.json({ mensagem: 'Sorteio realizado com sucesso!', estado: estadoTorneio });
});

// Rota para o jurado enviar o voto (via celular na rede local)
app.post('/api/votar', (req, res) => {
  const { juradoId, voto } = req.body; // voto deve ser 'player1' ou 'player2'
  const idBatalha = estadoTorneio.batalhaAtual;

  if (estadoTorneio.config.status !== 'em_andamento' && estadoTorneio.config.status !== 'sorteado') {
    return res.status(400).json({ erro: 'O torneio não está em fase de batalhas.' });
  }

  if (!idBatalha || !estadoTorneio.batalhas[idBatalha]) {
    return res.status(400).json({ erro: 'Não há nenhuma batalha ativa no momento.' });
  }

  const batalha = estadoTorneio.batalhas[idBatalha];

  // Verifica se o voto é válido
  if (voto !== 'player1' && voto !== 'player2') {
    return res.status(400).json({ erro: 'Voto inválido. Escolha player1 ou player2.' });
  }

  // Registrar ou atualizar o voto do jurado (limite de 3 jurados)
  // Procurar se esse jurado já votou nesta batalha para atualizar, ou adicionar novo
  const votoExistenteIndex = batalha.votos.findIndex(v => v.juradoId === juradoId);

  if (votoExistenteIndex !== -1) {
    batalha.votos[votoExistenteIndex].escolha = voto;
  } else {
    if (batalha.votos.length >= 3) {
      return res.status(400).json({ erro: 'Esta batalha já atingiu o limite máximo de 3 votos.' });
    }
    batalha.votos.push({ juradoId, escolha: voto });
  }

  // Se o status do torneio ainda era 'sorteado', vira 'em_andamento' no primeiro voto
  if (estadoTorneio.config.status === 'sorteado') {
    estadoTorneio.config.status = 'em_andamento';
  }

  // Avisa em tempo real que um voto entrou (o painel do M.C. e o Telão podem mostrar estrelas/votos mudando)
  io.emit('atualizacao_torneio', estadoTorneio);

  // Se já temos os 3 votos, computamos o vencedor imediatamente
  if (batalha.votos.length === 3) {
    const contagem = batalha.votos.reduce((acc, v) => {
      acc[v.escolha] = (acc[v.escolha] || 0) + 1;
      return acc;
    }, { player1: 0, player2: 0 });

    const chaveVencedor = contagem.player1 > contagem.player2 ? 'player1' : 'player2';
    batalha.vencedor = chaveVencedor; // Salva quem ganhou ('player1' ou 'player2')

    // Avisa que a votação encerrou e o resultado está pronto
    io.emit('resultado_batalha', {
      batalhaId: idBatalha,
      vencedor: batalha[chaveVencedor],
      estado: estadoTorneio
    });
  }

  return res.json({ mensagem: 'Voto computado!', estado: estadoTorneio });
});

// Rota para o M.C. (ou o frontend após os 5 segundos) avançar o torneio
app.post('/api/proxima-batalha', (req, res) => {
  const idBatalhaAtual = estadoTorneio.batalhaAtual;
  
  if (!idBatalhaAtual || !estadoTorneio.batalhas[idBatalhaAtual]) {
    return res.status(400).json({ erro: 'Nenhuma batalha ativa para avançar.' });
  }

  const batalhaAtual = estadoTorneio.batalhas[idBatalhaAtual];

  if (!batalhaAtual.vencedor) {
    return res.status(400).json({ erro: 'A batalha atual ainda não possui um vencedor definido.' });
  }

  const nomeVencedor = batalhaAtual[batalhaAtual.vencedor];
  const proximaBatalhaId = batalhaAtual.proximaBatalha;

  // 1. Se existir uma próxima batalha na árvore (não é a final do torneio), joga o vencedor para lá
  if (proximaBatalhaId && estadoTorneio.batalhas[proximaBatalhaId]) {
    const proximaBatalha = estadoTorneio.batalhas[proximaBatalhaId];
    
    // Preenche a vaga disponível (player1 ou player2) na próxima fase
    if (!proximaBatalha.player1) {
      proximaBatalha.player1 = nomeVencedor;
    } else if (!proximaBatalha.player2) {
      proximaBatalha.player2 = nomeVencedor;
    }
  }

  // 2. Encontrar qual é a PRÓXIMA batalha cronológica que precisa acontecer no Round atual ou seguinte
  // Estratégia: Pegamos o número da batalha atual e tentamos ir para a próxima (ex: b1 -> b2 -> b3)
  const [roundAtual, numeroBatalhaAtual] = idBatalhaAtual.replace('r', '').split('_b').map(Number);
  
  let proximoIdBatalhaAtiva = `r${roundAtual}_b${numeroBatalhaAtual + 1}`;

  // Se não existir a próxima batalha no mesmo round, significa que o round acabou! Vamos para a b1 do próximo round
  if (!estadoTorneio.batalhas[proximoIdBatalhaAtiva]) {
    proximoIdBatalhaAtiva = `r${roundAtual + 1}_b1`;
  }

  // Se a próxima batalha calculada existir no sistema, ela vira a batalha ativa atual
  if (estadoTorneio.batalhas[proximoIdBatalhaAtiva]) {
    estadoTorneio.batalhaAtual = proximoIdBatalhaAtiva;
  } else {
    // Se não existir um próximo round/batalha, o torneio acabou! (Chegamos ao fim da grande final)
    estadoTorneio.batalhaAtual = null;
    estadoTorneio.config.status = 'finalizado';
  }

  // Dispara o novo estado atualizado com o chaveamento preenchido e a nova batalha na agulha
  io.emit('atualizacao_torneio', estadoTorneio);

  return res.json({ 
    mensagem: estadoTorneio.config.status === 'finalizado' ? 'Torneio Finalizado!' : 'Avançado para a próxima batalha.', 
    estado: estadoTorneio 
  });
});

// Rota para buscar o estado atual (útil quando uma tela atualiza o navegador)
app.get('/api/estado', (req, res) => {
  res.json(estadoTorneio);
});


// --- COMUNICAÇÃO EM TEMPO REAL (SOCKET.IO) ---
io.on('connection', (socket) => {
  console.log(`Novo dispositivo conectado: ${socket.id}`);

  // Envia o estado atual do torneio assim que um cliente se conecta
  socket.emit('atualizacao_torneio', estadoTorneio);

  socket.on('disconnect', () => {
    console.log(`Dispositivo desconectado: ${socket.id}`);
  });
});

// Inicia o servidor na porta 3000
httpServer.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`Acesse localmente em: http://localhost:${PORT}`);
  console.log(`==================================================`);
});