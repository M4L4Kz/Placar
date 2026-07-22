import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ControleMC from './paginas/ControleMC';
import Telao from './paginas/Telao';
import Jurado from './paginas/Jurado';

// 1. Tenta ler a variável da Vercel. Se não encontrar, usa direto o servidor do Render!
export const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://breaking-battles-api.onrender.com';

// 2. Conexão com o Socket.io forçando WebSocket e Polling para garantir compatibilidade em nuvem
export const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling']
});

function App() {
  const [telaAtiva, setTelaAtiva] = useState('mc'); // mc, telao, jurado
  const [estadoTorneio, setEstadoTorneio] = useState(null);

  useEffect(() => {
    // Escuta as atualizações em tempo real enviadas pelo backend
    socket.on('atualizacao_torneio', (novoEstado) => {
      setEstadoTorneio(novoEstado);
    });

    return () => {
      socket.off('atualizacao_torneio');
    };
  }, []);

  if (!estadoTorneio) {
    return (
      <div style={{ 
        padding: '50px', 
        textAlign: 'center', 
        fontFamily: 'sans-serif', 
        backgroundColor: '#121212', 
        color: '#fff', 
        minHeight: '100vh' 
      }}>
        <h2>Conectando ao servidor de batalhas... ⚡</h2>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>Aguarde um momento enquanto estabelecemos a conexão.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
      {/* Menu Superior Temporário para Navegarmos entre as Telas */}
      <nav style={{ background: '#1f1f1f', padding: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => setTelaAtiva('mc')} style={btnNavStyle(telaAtiva === 'mc')}>🎤 M.C.</button>
        <button onClick={() => setTelaAtiva('telao')} style={btnNavStyle(telaAtiva === 'telao')}>📺 Telão</button>
        <button onClick={() => setTelaAtiva('jurado')} style={btnNavStyle(telaAtiva === 'jurado')}>⚖️ Judges</button>
      </nav>

      {/* Renderização Condicional da Tela Selecionada */}
      <main style={{ padding: '20px' }}>
        {telaAtiva === 'mc' && <ControleMC estado={estadoTorneio} />}
        {telaAtiva === 'telao' && <Telao estado={estadoTorneio} />}
        {telaAtiva === 'jurado' && <Jurado estado={estadoTorneio} />}
      </main>
    </div>
  );
}

const btnNavStyle = (ativo) => ({
  padding: '10px 15px',
  backgroundColor: ativo ? '#00adb5' : '#393e46',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
});

export default App;