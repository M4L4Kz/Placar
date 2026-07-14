/**
 * Algoritmo de Fisher-Yates para embaralhar um array de forma justa e aleatória.
 */
function embaralhar(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Gera a estrutura de chaves vazia baseada no número total de competidores (8, 16 ou 32).
 * Mapeia para qual próxima batalha o vencedor de cada chave deve ir.
 */
export function gerarChavesTorneio(totalCompetidores, listaCompetidores) {
  const competidoresSorteados = embaralhar(listaCompetidores);
  const batalhas = {};

  // Determinar quantas rodadas o torneio terá
  // 8 participantes = 3 rodadas (Quartas, Semifinal, Final)
  // 16 participantes = 4 rodadas (Oitavas, Quartas, Semifinal, Final)
  // 32 participantes = 5 rodadas (Dezesseis-avos, Oitavas, Quartas, Semifinal, Final)
  const totalRodadas = Math.log2(totalCompetidores);

  // 1. Criar todas as batalhas vazias para todas as rodadas
  // Isso ajuda o frontend a desenhar o diagrama completo na tela desde o início
  let batalhasPorRodada = totalCompetidores / 2;

  for (let round = 1; round <= totalRodadas; round++) {
    for (let b = 1; b <= batalhasPorRodada; b++) {
      const idBatalha = `r${round}_b${b}`;
      
      // Calcular qual será a próxima batalha que o vencedor desta irá disputar
      // Ex: O vencedor da r1_b1 e r1_b2 vão se enfrentar na r2_b1
      const proximoB = Math.ceil(b / 2);
      const proximaBatalhaId = round < totalRodadas ? `r${round + 1}_b${proximoB}` : null;

      batalhas[idBatalha] = {
        id: idBatalha,
        round: round,
        numero: b,
        player1: null,
        player2: null,
        votos: [], // Vai guardar os votos dos jurados (ex: ['A', 'A', 'B'])
        vencedor: null, // Guardará o nome do vencedor ou 'player1' / 'player2'
        proximaBatalha: proximaBatalhaId
      };
    }
    batalhasPorRodada = batalhasPorRodada / 2;
  }

  // 2. Preencher a PRIMEIRA rodada (Round 1) com os competidores sorteados
  for (let i = 0; i < totalCompetidores; i += 2) {
    const numeroBatalha = (i / 2) + 1;
    const idBatalhaRound1 = `r1_b${numeroBatalha}`;

    if (batalhas[idBatalhaRound1]) {
      batalhas[idBatalhaRound1].player1 = competidoresSorteados[i] || 'Bye'; // 'Bye' caso falte alguém
      batalhas[idBatalhaRound1].player2 = competidoresSorteados[i + 1] || 'Bye';
    }
  }

  return batalhas;
}