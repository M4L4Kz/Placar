import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { gerarChavesTorneio } from './utils/torneio.js';

const app = express();

// Libera CORS para requisições HTTP REST
app.use(cors());
app.use(express.json()); // Permite ler JSON no corpo da requisição (req.body)

const server = createServer(app);

// Configuração do Socket.io permitindo conexões de qualquer origem (Vercel, Local, etc)
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// O Render injeta automaticamente a variável process.env.PORT
const PORT = process.env.PORT || 3000;

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

// 1. ROTA PARA RESETAR TOTALMENTE O TORNEIO
app.post('/api/resetar', (req, res) => {
  estadoTorneio = {
    config: {
      totalCompetidores: 8,
      status: 'configuracao'
    },
    competidores: [],
    batalhas: {},
    batalhaAtual: null
  };

  io.emit('atualizacao_torneio', estadoTorneio);
  return res.json({ mensagem: 'Torneio resetado com sucesso.', estado: estadoTorneio });
});

// 2. ROTA PARA PULAR A BATALHA ATUAL (JOGA PARA O FINAL DA FILA)
app.post('/api/pular-batalha', (req, res) => {
  const idAtual = estadoTorneio.batalhaAtual;

  if (!idAtual || !estadoTorneio.batalhas[idAtual]) {
    return res.status(400).json({ erro: 'Não há batalha ativa para pular.' });
  }

  const batalhaAtual = estadoTorneio.batalhas[idAtual];
  const roundAtual = batalhaAtual.round;

  const batalhasDoRoundSemVencedor = Object.values(estadoTorneio.batalhas).filter(
    b => b.round === roundAtual && !b.vencedor
  );

  if (batalhasDoRoundSemVencedor.length <= 1) {
    return res.status(400).json({ erro: 'Não há outras batalhas pendentes neste round para trocar a ordem.' });
  }

  const proximaPendente = batalhasDoRoundSemVencedor.find(b => b.id !== idAtual);

  if (proximaPendente) {
    estadoTorneio.batalhaAtual = proximaPendente.id;
    io.emit('atualizacao_torneio', estadoTorneio);
    return res.json({ mensagem: 'Batalha enviada para o final da fila do round.', estado: estadoTorneio });
  }

  return res.status(400).json({ erro: 'Não foi possível reordenar as batalhas.' });
});

// Rota para o M.C. salvar a configuração inicial
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

  io.emit('atualizacao_torneio', estadoTorneio);
  return res.json({ mensagem: 'Torneio configurado com sucesso!', estado: estadoTorneio });
});

// Rota para o M.C. realizar o sorteio aleatório das chaves
app.post('/api/sortear', (req, res) => {
  if (estadoTorneio.competidores.length !== estadoTorneio.config.totalCompetidores) {
    return res.status(400).json({ 
      erro: `A quantidade de competidores (${estadoTorneio.competidores.length}) não bate com a chave (${estadoTorneio.config.totalCompetidores}).` 
    });
  }

  const chavesGeradas = gerarChavesTorneio(
    estadoTorneio.config.totalCompetidores, 
    estadoTorneio.competidores
  );

  estadoTorneio.batalhas = chavesGeradas;
  estadoTorneio.config.status = 'sorteado';
  estadoTorneio.batalhaAtual = 'r1_b1';

  io.emit('atualizacao_torneio', estadoTorneio);
  return res.json({ mensagem: 'Sorteio realizado com sucesso!', estado: estadoTorneio });
});

// Rota para o jurado enviar o voto
app.post('/api/votar', (req, res) => {
  const { juradoId, voto } = req.body;
  const idBatalha = estadoTorneio.batalhaAtual;

  if (estadoTorneio.config.status !== 'em_andamento') {
    return res.status(400).json({ erro: 'O torneio não está em fase de batalhas ativas.' });
  }

  if (!idBatalha || !estadoTorneio.batalhas[idBatalha]) {
    return res.status(400).json({ erro: 'Não há nenhuma batalha ativa no momento.' });
  }

  const batalha = estadoTorneio.batalhas[idBatalha];

  if (voto !== 'player1' && voto !== 'player2') {
    return res.status(400).json({ erro: 'Voto inválido.' });
  }

  if (!batalha.votos) batalha.votos = [];

  const votoExistenteIndex = batalha.votos.findIndex(v => v.juradoId === juradoId);
  if (votoExistenteIndex !== -1) {
    batalha.votos[votoExistenteIndex].escolha = voto;
  } else {
    if (batalha.votos.length >= 3) {
      return res.status(400).json({ erro: 'Esta batalha já possui 3 votos.' });
    }
    batalha.votos.push({ juradoId, escolha: voto });
  }

  if (batalha.votos.length === 3) {
    const contagem = batalha.votos.reduce((acc, v) => {
      acc[v.escolha] = (acc[v.escolha] || 0) + 1;
      return acc;
    }, { player1: 0, player2: 0 });

    batalha.vencedor = contagem.player1 > contagem.player2 ? 'player1' : 'player2';
  }

  io.emit('atualizacao_torneio', estadoTorneio);
  return res.json({ mensagem: 'Voto computado com sucesso!', estado: estadoTorneio });
});

// Rota para avançar o torneio
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

  if (proximaBatalhaId && estadoTorneio.batalhas[proximaBatalhaId]) {
    const proximaBatalha = estadoTorneio.batalhas[proximaBatalhaId];
    if (!proximaBatalha.player1) {
      proximaBatalha.player1 = nomeVencedor;
    } else if (!proximaBatalha.player2) {
      proximaBatalha.player2 = nomeVencedor;
    }
  }

  const [roundAtual, numeroBatalhaAtual] = idBatalhaAtual.replace('r', '').split('_b').map(Number);
  let proximoIdBatalhaAtiva = `r${roundAtual}_b${numeroBatalhaAtual + 1}`;

  if (!estadoTorneio.batalhas[proximoIdBatalhaAtiva]) {
    proximoIdBatalhaAtiva = `r${roundAtual + 1}_b1`;
  }

  if (estadoTorneio.batalhas[proximoIdBatalhaAtiva]) {
    estadoTorneio.batalhaAtual = proximoIdBatalhaAtiva;
  } else {
    estadoTorneio.batalhaAtual = null;
    estadoTorneio.config.status = 'finalizado';
  }

  io.emit('atualizacao_torneio', estadoTorneio);
  return res.json({ mensagem: 'Torneio avançado.', estado: estadoTorneio });
});

// Rota para dar o pontapé inicial
app.post('/api/iniciar-batalhas', (req, res) => {
  if (estadoTorneio.config.status !== 'sorteado') {
    return res.status(400).json({ erro: 'O torneio precisa estar sorteado para iniciar.' });
  }

  estadoTorneio.config.status = 'em_andamento';
  estadoTorneio.batalhaAtual = 'r1_b1';

  io.emit('atualizacao_torneio', estadoTorneio);
  return res.json({ mensagem: 'Batalhas iniciadas!', estado: estadoTorneio });
});

// Rota para buscar estado atual
app.get('/api/estado', (req, res) => {
  res.json(estadoTorneio);
});

// --- COMUNICAÇÃO WEBSOCKET ---
io.on('connection', (socket) => {
  console.log(`Dispositivo conectado: ${socket.id}`);
  socket.emit('atualizacao_torneio', estadoTorneio);

  socket.on('disconnect', () => {
    console.log(`Dispositivo desconectado: ${socket.id}`);
  });
});

// Inicia o servidor usando 'server.listen'
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`==================================================`);
});