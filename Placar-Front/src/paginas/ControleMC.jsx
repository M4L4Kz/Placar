import React, { useState } from 'react';

function ControleMC({ estado }) {
  const [total, setTotal] = useState(8);
  const [nomesInput, setNomesInput] = useState('');
  const [erro, setErro] = useState('');

  // Envia a configuração inicial do campeonato para o backend
  const handleConfigurar = async () => {
    setErro('');
    // Converte a string de nomes separada por quebras de linha em um Array limpo
    const listaNomes = nomesInput
      .split('\n')
      .map(n => n.trim())
      .filter(n => n !== '');

    if (listaNomes.length !== Number(total)) {
      setErro(`Erro: Você precisa inserir exatamente ${total} competidores. Atualmente inseridos: ${listaNomes.length}`);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/configurar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalCompetidores: total, competidores: listaNomes })
      });
      if (!response.ok) throw new Error('Falha ao salvar configuração');
    } catch (err) {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  // Dispara o sorteio aleatório das chaves
  const handleSortear = async () => {
    try {
      await fetch('http://localhost:3000/api/sortear', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  // Comando para o M.C. ou o Timer avançar para o próximo embate
  const handleProximaBatalha = async () => {
    try {
      await fetch('http://localhost:3000/api/proxima-batalha', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#1f1f1f', borderRadius: '8px' }}>
      <h2>🎤 Painel de Controle do M.C.</h2>
      <p>Status Atual: <strong style={{ color: '#00adb5' }}>{estado.config.status.toUpperCase()}</strong></p>
      
      <hr style={{ borderColor: '#333', margin: '20px 0' }} />

      {/* Fase 1: Configuração Inicial */}
      {estado.config.status === 'configuracao' && (
        <div>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Tamanho das Chaves:</strong>
            <select 
              value={total} 
              onChange={(e) => setTotal(Number(e.target.value))}
              style={inputStyle}
            >
              <option value={8}>8 Competidores (Quartas)</option>
              <option value={16}>16 Competidores (Oitavas)</option>
              <option value={32}>32 Competidores (Dezesseis-avos)</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Lista de Participantes (Um por linha):</strong>
            <textarea
              rows={10}
              placeholder={`Digite um nome por linha. Ex:\nB-Boy Kiko\nB-Girl Natasha`}
              value={nomesInput}
              onChange={(e) => setNomesInput(e.target.value)}
              style={{ ...inputStyle, fontFamily: 'monospace', resize: 'vertical' }}
            />
          </label>

          {erro && <p style={{ color: '#ff6b6b', fontSize: '14px' }}>{erro}</p>}

          <button onClick={handleConfigurar} style={btnStyle('#00adb5')}>
            Salvar e Preparar Torneio
          </button>
        </div>
      )}

      {/* Fase 2: Sorteio Pronto */}
{(estado.config.status === 'configuracao' && estado.competidores.length > 0) && (
  <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: '#2d2d2d', borderRadius: '6px' }}>
    <h3>📋 Competidores Salvos!</h3>
    <p>Todos os {estado.competidores.length} nomes foram recebidos.</p>
    <button onClick={handleSortear} style={btnStyle('#ff2e63')}>
      🎲 Realizar Sorteio Aleatório
    </button>
  </div>
)}
      {/* Fase 3: Campeonato em Andamento */}
      {estado.config.status === 'em_andamento' && (
        <div style={{ textAlign: 'center' }}>
          <h3>🔥 O Torneio Começou!</h3>
          <p>Batalha Atual Rodando no Sistema: <strong style={{ color: '#00adb5' }}>{estado.batalhaAtual}</strong></p>
          
          <div style={{ background: '#2d2d2d', padding: '15px', borderRadius: '6px', margin: '20px 0' }}>
            <h4>
              {estado.batalhas[estado.batalhaAtual]?.player1 || '???'} 
              <span style={{ color: '#ff2e63' }}> VS </span> 
              {estado.batalhas[estado.batalhaAtual]?.player2 || '???'}
            </h4>
            <p>Votos Computados: {estado.batalhas[estado.batalhaAtual]?.votos.length} / 3</p>
          </div>

          <button 
            onClick={handleProximaBatalha} 
            disabled={!estado.batalhas[estado.batalhaAtual]?.vencedor}
            style={btnStyle(estado.batalhas[estado.batalhaAtual]?.vencedor ? '#00adb5' : '#444')}
          >
            ⏭️ Chamar Próxima Batalha
          </button>
          {!estado.batalhas[estado.batalhaAtual]?.vencedor && (
            <p style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>Aguardando os 3 votos dos jurados...</p>
          )}
        </div>
      )}

      {/* Fase 4: Finalizado */}
      {estado.config.status === 'finalizado' && (
        <div style={{ textAlign: 'center' }}>
          <h2>🏆 Torneio Finalizado!</h2>
          <p>Temos um grande campeão no telão.</p>
          <button onClick={() => window.location.reload()} style={btnStyle('#393e46')}>
            Reiniciar Novo Evento
          </button>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginTop: '5px',
  marginBottom: '15px',
  background: '#2d2d2d',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '4px',
  boxSizing: 'border-box'
};

const btnStyle = (cor) => ({
  width: '100%',
  padding: '12px',
  backgroundColor: cor,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '16px'
});

export default ControleMC;