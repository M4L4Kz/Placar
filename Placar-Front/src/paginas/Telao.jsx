import React from 'react';
import logoImg from '../assets/AirChairlogo.png';

function Telao({ estado }) {
  const { status, totalCompetidores } = estado.config;

  if (status === 'configuracao') {
    return (
      <div className="telao-jerio" style={{ paddingTop: '50px' }}>
        <img src={logoImg} alt="Logo FBDD" className="jerio-logo-center" style={{ maxWidth: '280px', maxHeight: '280px' }} />
        <h1 className="jerio-round-title" style={{ marginTop: '20px', fontSize: '2.5rem' }}>BREAKING BATTLES</h1>
        <p style={{ fontFamily: 'Permanent Marker', color: '#888', fontSize: '1.2rem', marginTop: '10px' }}>
          AGUARDANDO SORTEIO DAS CHAVES
        </p>
      </div>
    );
  }

  const totalRodadas = Math.log2(totalCompetidores);

  const getNomeFase = (round) => {
    const restante = totalCompetidores / Math.pow(2, round - 1);
    if (restante === 2) return "FINAL";
    if (restante === 4) return "SEMI FINAL";
    if (restante === 8) return "TOP 8";
    if (restante === 16) return "TOP 16";
    return `TOP ${restante}`;
  };

  const renderizarChavesAlinhadas = () => {
    const colunas = [];

    for (let round = 1; round <= totalRodadas; round++) {
      const batalhasDoRound = Object.values(estado.batalhas).filter(b => b.round === round);
      const isSemiFinal = getNomeFase(round) === "SEMI FINAL";

      colunas.push(
        <div key={round} className="jerio-column">
          <div className="jerio-round-title">{getNomeFase(round)}</div>

          <div className="jerio-battles-container">
            {batalhasDoRound.map((batalha, index) => {
              const isAtiva = estado.batalhaAtual === batalha.id;

              return (
                <React.Fragment key={batalha.id}>
                  <div className={`jerio-match-box ${isAtiva ? 'ativa' : ''}`}>
                    <div className={`jerio-player-slot ${batalha.vencedor === 'player1' ? 'vencedor' : ''}`}>
                      {batalha.player1 || '—'}
                    </div>
                    <div className={`jerio-player-slot ${batalha.vencedor === 'player2' ? 'vencedor' : ''}`}>
                      {batalha.player2 || '—'}
                    </div>
                  </div>

                  {/* Se for a Semi Final e estiver no primeiro card, renderiza a logo exatamente no meio */}
                  {isSemiFinal && index === 0 && (
                    <div className="jerio-logo-wrapper">
                      <img src={logoImg} alt="Logo FBDD" className="jerio-logo-center" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      );
    }

    // Coluna do Campeão + Troféu
    const batalhaFinal = Object.values(estado.batalhas).find(b => b.round === totalRodadas);
    const campeao = batalhaFinal && batalhaFinal.vencedor ? batalhaFinal[batalhaFinal.vencedor] : null;

    colunas.push(
      <div key="campeao" className="jerio-column jerio-champion-column">
        <div className="trophy-icon">🏆</div>
        <div className={`jerio-player-slot ${campeao ? 'vencedor' : ''}`} style={{ minWidth: '160px', padding: '15px' }}>
          {campeao || '—'}
        </div>
      </div>
    );

    return colunas;
  };

  return (
    <div className="telao-jerio">
      <div className="jerio-bracket-wrapper">
        {renderizarChavesAlinhadas()}
      </div>
    </div>
  );
}

export default Telao;