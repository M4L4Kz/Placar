import React from 'react';
import logoImg from '../assets/logo-fbdd.png'; // <-- Puxa a sua logo na pasta assets

function Telao({ estado }) {
  const { status, totalCompetidores } = estado.config;

  // Se o torneio ainda está em configuração, exibe a logo em destaque com estilo
  if (status === 'configuracao') {
    return (
      <div className="telao-container">
        <h1 className="titulo-street" style={{ fontSize: '3rem', marginBottom: '10px' }}>FBDD BREAKING</h1>
        <p style={{ color: '#888', letterSpacing: '4px' }}>AGUARDANDO SORTEIO DAS CHAVES</p>
        <img src={logoImg} alt="Logo FBDD" className="logo-intro" />
      </div>
    );
  }

  // Descobre dinamicamente quantas rodadas existem (log2 de 8 = 3, 16 = 4, 32 = 5)
  const totalRodadas = Math.log2(totalCompetidores);

  // Retorna o nome amigável da fase com base na rodada e total de competidores
  const getNomeRodada = (round) => {
    const restante = totalCompetidores / Math.pow(2, round - 1);
    if (restante === 2) return "🏆 GRANDE FINAL";
    if (restante === 4) return "🔥 SEMIFINAL";
    if (restante === 8) return "⚡ QUARTAS DE FINAL";
    if (restante === 16) return "🚀 OITAVAS DE FINAL";
    return `FASE DE ${restante}`;
  };

  // Renderiza as colunas do diagrama
  const renderizarChaves = () => {
    const colunas = [];

    for (let round = 1; round <= totalRodadas; round++) {
      const batalhasDoRound = Object.values(estado.batalhas).filter(b => b.round === round);

      colunas.push(
        <div key={round} className="bracket-round">
          <div className="round-title">{getNomeRodada(round)}</div>
          
          {batalhasDoRound.map(batalha => {
            const isAtiva = estado.batalhaAtual ===  batalha.id;
            
            return (
              <div key={batalha.id} className={`match-card ${isAtiva ? 'ativa' : ''}`}>
                <div className={`match-player ${batalha.vencedor === 'player1' ? 'vencedor' : ''}`}>
                  <span>{batalha.player1 || '—'}</span>
                </div>
                <div className={`match-player ${batalha.vencedor === 'player2' ? 'vencedor' : ''}`}>
                  <span>{batalha.player2 || '—'}</span>
                </div>
                {!batalha.vencedor && <span className="vs-divider">VS</span>}
              </div>
            );
          })}
        </div>
      );
    }

    return colunas;
  };

  return (
    <div className="telao-container" style={{ maxWidth: '100%' }}>
      <h2 style={{ marginBottom: '5px', fontSize: '24px' }}>CHAVEAMENTO DO CAMPEONATO</h2>
      <div className="bracket-wrapper">
        {renderizarChaves()}
      </div>
    </div>
  );
}

export default Telao;