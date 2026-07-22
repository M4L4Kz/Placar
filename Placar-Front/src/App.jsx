import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ControleMC from './paginas/ControleMC';
import Telao from './paginas/Telao';
import Jurado from './paginas/Jurado';

// Conecta ao backend Node.js na porta 3000
const socket = io('http://localhost:3000');

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
    return <div style={{ padding: '20px', textAlign: 'center' }}>Conectando ao servidor local...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
      {/* Menu Superior Temporário para Navegarmos entre as Telas no desenvolvimento */}
      <nav style={{ background: '#1f1f1f', padding: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => setTelaAtiva('mc')} style={btnNavStyle(telaAtiva === 'mc')}>🎤  M.C.</button>
        <button onClick={() => setTelaAtiva('telao')} style={btnNavStyle(telaAtiva === 'telao')}>📺 </button>
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