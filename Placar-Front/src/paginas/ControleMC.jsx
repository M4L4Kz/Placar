import React, { useState } from 'react';
import { BACKEND_URL } from '../App'; // Importa a URL dinâmica do backend

function ControleMC({ estado }) {
  const [total, setTotal] = useState(8);
  const [nomesInput, setNomesInput] = useState('');
  const [erro, setErro] = useState('');

  const handleConfigurar = async () => {
    setErro('');
    const listaNomes = nomesInput
      .split('\n')
      .map(n => n.trim())
      .filter(n => n !== '');

    if (listaNomes.length !== Number(total)) {
      setErro(`Erro: Insira exatamente ${total} competidores. Digitados: ${listaNomes.length}`);
      return;
    }

    try {
      await fetch(`${BACKEND_URL}/api/configurar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalCompetidores: total, competidores: listaNomes })
      });
    } catch (err) {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  const handleSortear = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/sortear`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarTorneio = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/iniciar-batalhas`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleProximaBatalha = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/proxima-batalha`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  // Pula a batalha ativa colocando-a no fim da fila
  const handlePularBatalha = async () => {
    if (window.confirm('Deseja pular esta batalha e enviá-la para o final da fila do round?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/pular-batalha`, { method: 'POST' });
        if (!response.ok) {
          const dados = await response.json();
          alert(dados.erro || 'Não foi possível pular a batalha.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Reseta completamente o torneio
  const handleResetarTorneio = async () => {
    if (window.confirm('⚠️ ATENÇÃO: Tem certeza que deseja RESETAR todo o torneio? Todos os dados e chaves atuais serão apagados!')) {
      try {
        await fetch(`${BACKEND_URL}/api/resetar`, { method: 'POST' });
        setNomesInput('');
        setErro('');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#1f1f1f', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontFamily: 'Oswald, sans-serif' }}>🎤 PAINEL DO M.C.</h2>
        {estado.config.status !== 'configuracao' && (
          <button onClick={handleResetarTorneio} style={btnResetStyle}>
            🔄 NOVO TORNEIO
          </button>
        )}
      </div>

      <p style={{ marginTop: 0, color: '#888' }}>Status Atual: <strong style={{ color: 'var(--bcone-yellow, #fdd835)' }}>{estado.config.status.toUpperCase()}</strong></p>
      
      <hr style={{ borderColor: '#333', margin: '15px 0' }} />

      {/* 1. SELEÇÃO DE MODELO E NOMES */}
      {estado.config.status === 'configuracao' && estado.competidores.length === 0 && (
        <div>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>1. Selecione o Modelo de Chaves:</strong>
            <select value={total} onChange={(e) => setTotal(Number(e.target.value))} style={inputStyle}>
              <option value={8}>8 Competidores (3 Rodadas)</option>
              <option value={16}>16 Competidores (4 Rodadas)</option>
              <option value={32}>32 Competidores (5 Rodadas)</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>2. Cole a Lista de Participantes (Um por linha):</strong>
            <textarea
              rows={10}
              placeholder="Digite um nome por linha..."
              value={nomesInput}
              onChange={(e) => setNomesInput(e.target.value)}
              style={inputStyle}
            />
          </label>

          {erro && <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{erro}</p>}
          <button onClick={handleConfigurar} style={btnStyle('#00adb5')}>Salvar e Preparar Torneio</button>
        </div>
      )}

      {/* 2. REALIZAR SORTEIO */}
      {estado.config.status === 'configuracao' && estado.competidores.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <h3>📋 Competidores Salvos</h3>
          <p>Temos {estado.competidores.length} dançarinos salvos para a chave de {estado.config.totalCompetidores}.</p>
          <button onClick={handleSortear} style={btnStyle('#ff2e63')}>🎲 Realizar Sorteio Aleatório</button>
        </div>
      )}

      {/* 3. INICIAR BATALHAS */}
      {estado.config.status === 'sorteado' && (
        <div style={{ textAlign: 'center' }}>
          <h3>🎲 Chaves Geradas no Telão!</h3>
          <p>Tudo pronto para o show começar.</p>
          <button onClick={handleIniciarTorneio} style={btnStyle('#00adb5')}>🚀 Chamar Primeira Batalha</button>
        </div>
      )}

      {/* 4. BATALHA EM ANDAMENTO E BOTÃO PULAR */}
      {estado.config.status === 'em_andamento' && (
        <div>
          <div style={{ background: '#111', padding: '15px', borderRadius: '6px', border: '1px solid #333', textAlign: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Batalha Ativa no Palco</span>
            <h3 style={{ margin: '5px 0 15px 0', fontSize: '22px', color: '#fff' }}>
              {estado.batalhas[estado.batalhaAtual]?.player1 || '—'} 
              <span style={{ color: '#ff2e63' }}> VS </span> 
              {estado.batalhas[estado.batalhaAtual]?.player2 || '—'}
            </h3>

            <p style={{ fontWeight: 'bold', color: '#aaa', margin: '5px 0' }}>
              Votos Recebidos: <span style={{ color: '#00adb5' }}>{estado.batalhas[estado.batalhaAtual]?.votos?.length || 0} / 3</span>
            </p>
            
            {estado.batalhas[estado.batalhaAtual]?.vencedor && (
              <p style={{ color: '#fdd835', fontSize: '18px', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                👑 Vencedor: {estado.batalhas[estado.batalhaAtual][estado.batalhas[estado.batalhaAtual].vencedor]}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={handleProximaBatalha} 
              disabled={!estado.batalhas[estado.batalhaAtual]?.vencedor}
              style={btnStyle(estado.batalhas[estado.batalhaAtual]?.vencedor ? '#00adb5' : '#333')}
            >
              ⏭️ Chamar Próxima Batalha
            </button>

            <button 
              onClick={handlePularBatalha} 
              style={{ ...btnStyle('#d97706'), background: '#27272a', border: '1px solid #d97706', color: '#f59e0b' }}
            >
              ⏳ Pular Batalha (Mover p/ Fim da Fila)
            </button>
          </div>
        </div>
      )}

      {/* 5. CAMPANHA FINALIZADA */}
      {estado.config.status === 'finalizado' && (
        <div style={{ textAlign: 'center' }}>
          <h2>🏆 Campeonato Concluído!</h2>
          <button onClick={handleResetarTorneio} style={btnStyle('#fdd835')}>
            🔄 Iniciar Novo Campeonato
          </button>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: 'block', width: '100%', padding: '10px', marginTop: '5px', marginBottom: '15px',
  background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px', boxSizing: 'border-box'
};

const btnStyle = (cor) => ({
  width: '100%', padding: '12px', backgroundColor: cor, color: '#fff', border: 'none',
  borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', textTransform: 'uppercase'
});

const btnResetStyle = {
  padding: '6px 12px', backgroundColor: '#dc2626', color: '#fff', border: 'none',
  borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
};

export default ControleMC;