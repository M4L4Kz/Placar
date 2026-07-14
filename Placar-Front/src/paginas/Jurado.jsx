import React, { useState } from 'react';

function Jurado({ estado }) {
  const [juradoId, setJuradoId] = useState(''); // Armazena a escolha do slot de jurado
  const [votoEnviado, setVotoEnviado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const idBatalhaAtiva = estado.batalhaAtual;
  const batalhaAtiva = idBatalhaAtiva ? estado.batalhas[idBatalhaAtiva] : null;

  // Função para disparar o voto para o backend
  const enviarVoto = async (escolha) => {
    if (!juradoId) {
      setMensagem('❌ Selecione qual jurado você é antes de votar!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juradoId: juradoId,
          voto: escolha // 'player1' ou 'player2'
        })
      });

      if (response.ok) {
        setVotoEnviado(true);
        setMensagem('📋 Voto computado com sucesso!');
        
        // Limpa a mensagem de sucesso após 2 segundos
        setTimeout(() => setVotoEnviado(false), 2000);
      } else {
        const dadosErro = await response.json();
        setMensagem(`❌ ${dadosErro.erro || 'Falha ao votar.'}`);
      }
    } catch (err) {
      setMensagem('❌ Erro de conexão com o servidor.');
    }
  };

  // Se o jurado ainda não escolheu quem ele é na banca
  if (!juradoId) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center', background: '#1f1f1f', borderRadius: '8px' }}>
        <h2 className="titulo-street" style={{ fontSize: '1.8rem' }}>Banca de Juízes</h2>
        <p style={{ color: '#888' }}>Selecione o seu slot de julgamento para esta noite:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <button onClick={() => setJuradoId('Jurado_1')} style={btnJuriStyle}>⚖️ JURADO 1</button>
          <button onClick={() => setJuradoId('Jurado_2')} style={btnJuriStyle}>⚖️ JURADO 2</button>
          <button onClick={() => setJuradoId('Jurado_3')} style={btnJuriStyle}>⚖️ JURADO 3</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '15px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', background: '#111', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px' }}>
        <span style={{ color: '#00adb5', fontWeight: 'bold' }}>👤 {juradoId.toUpperCase().replace('_', ' ')}</span>
        <button onClick={() => { setJuradoId(''); setMensagem(''); }} style={{ background: 'none', border: 'none', color: '#ff2e63', cursor: 'pointer', fontSize: '12px' }}>🔄 Trocar Cadeira</button>
      </div>

      {/* Se não houver batalhas ativas no momento */}
      {(!batalhaAtiva || estado.config.status === 'finalizado') ? (
        <div style={{ padding: '40px 20px', background: '#1f1f1f', borderRadius: '8px' }}>
          <h3 style={{ color: '#888' }}>⏳ AGUARDANDO PRÓXIMA BATALHA...</h3>
          <p style={{ fontSize: '14px', color: '#555' }}>O M.C. está organizando o round no palco.</p>
        </div>
      ) : (
        <div>
          <h3 className="titulo-street" style={{ fontSize: '1.5rem', marginBottom: '5px' }}>VOTAÇÃO ATIVA</h3>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '0' }}>Toque no vencedor do round:</p>

          {/* Botões Gigantes para Toque no Celular */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            
            {/* Competidor 1 (Lado Vermelho/Esquerdo) */}
            <button 
              onClick={() => enviarVoto('player1')}
              disabled={votoEnviado}
              style={btnVotoStyle('#ff2e63')}
            >
              <span style={{ fontSize: '12px', opacity: 0.7, display: 'block' }}>REPRESENTANDO</span>
              <strong style={{ fontSize: '20px' }}>{batalhaAtiva.player1}</strong>
            </button>

            <div style={{ fontFamily: 'Permanent Marker', color: '#333', fontSize: '24px', margin: '5px 0' }}>X</div>

            {/* Competidor 2 (Lado Azul/Direito) */}
            <button 
              onClick={() => enviarVoto('player2')}
              disabled={votoEnviado}
              style={btnVotoStyle('#00adb5')}
            >
              <span style={{ fontSize: '12px', opacity: 0.7, display: 'block' }}>REPRESENTANDO</span>
              <strong style={{ fontSize: '20px' }}>{batalhaAtiva.player2}</strong>
            </button>

          </div>
        </div>
      )}

      {mensagem && (
        <p style={{ marginTop: '25px', padding: '10px', background: '#1f1f1f', borderRadius: '4px', color: mensagem.includes('❌') ? '#ff6b6b' : '#00adb5', fontWeight: 'bold', fontSize: '14px' }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}

// Estilos rápidos e responsivos
const btnJuriStyle = {
  padding: '15px',
  background: '#2d2d2d',
  color: '#fff',
  border: '2px solid #444',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '16px',
  textTransform: 'uppercase',
  transition: 'border-color 0.2s'
};

const btnVotoStyle = (cor) => ({
  padding: '30px 20px',
  backgroundColor: '#111',
  color: '#fff',
  border: `4px solid ${cor}`,
  borderRadius: '8px',
  cursor: 'pointer',
  boxShadow: '0 6px 15px rgba(0,0,0,0.4)',
  transition: 'transform 0.1s, opacity 0.2s',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '5px'
});

export default Jurado;