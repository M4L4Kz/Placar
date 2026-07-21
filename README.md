# 🕺 Breaking Battles — Gerenciamento de Torneiro

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

Um App completo para gerenciamento, controle de jurados e exibição dinâmica de chaves de batalhas de Breaking em tempo real para eventos de Hip-Hop.

---

## 📌 Sobre o Projeto

O **Breaking Battles** foi idealizado para modernizar a organização de campeonatos de Breaking, eliminando papeis e planilhas manuais. O sistema conta com uma interface no estilo *hip-hop*, trazendo uma experiência fluida para a comissão organizadora quanto para o público que acompanha o evento pelo telão.

---

## ✨ Funcionalidades Principais

* 🎙️ **Painel do M.C. / Operador / VJ:**
  * Configuração de chaves (Top 16, Top 8, Top 4).
  * Inserção e sorteio de B-Boys / B-Girls.
  * Controle de batalhas ativas.
  <img width="1366" height="768" alt="10c47e63-a913-4a62-a6d4-6fe9d1092850" src="https://github.com/user-attachments/assets/3439be2c-7ff6-4f77-a17f-ba45ffcb2853" />

* ⚖️ **Tela dos Jurados / Operador / VJ:**
  * Votação intuitiva e ágil para avaliação das entradas (*rounds*).
  * Envio de votos em tempo real.
  <img width="580" height="636" alt="bcc94a41-c9c4-4ac0-8734-28dba72c1945" src="https://github.com/user-attachments/assets/11b2b362-8d4e-42f4-8e87-27621d66b134" />

* 📺 **Telão Público:**
  * Visualização gráfica em tempo real do progresso das chaves (da esquerda para a direita).
  * Design minimalista e urbano (*street art style*).
  * Destaque automático para a batalha ativa e indicação do campeão com troféu 🏆.
  
  ->Ciclo de câmeras ativas na batalha
  ->Animação para chamada das batalhas
  
<img width="1327" height="645" alt="image" src="https://github.com/user-attachments/assets/85e172e2-ce62-4853-b50d-4369e61d9708" />

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React.js](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** CSS3 puro (Flexbox, CSS Variables, Google Fonts)
- **Gerenciamento de Estado:** React Hooks / Props

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (versão 16 ou superior)
* `npm` ou `yarn`

### Passo a Passo

--------------------------------------------------------------------
1. PRÉ-REQUISITOS
--------------------------------------------------------------------
Antes de começar, certifique-se de ter instalado em sua máquina:
 - Node.js (Versão 16 ou superior)
 - Git

--------------------------------------------------------------------
2. CLONANDO O REPOSITÓRIO
--------------------------------------------------------------------
Abra o seu terminal e execute o comando:

   git clone https://github.com/seu-usuario/breaking-battles.git
   cd breaking-battles


--------------------------------------------------------------------
3. INSTALANDO AS DEPENDÊNCIAS (npm install)
--------------------------------------------------------------------
O comando 'npm install' lê o arquivo package.json de cada pasta e 
baixa automaticamente todas as bibliotecas do projeto.

a) Instalação no Backend (Placar):
   cd Placar
   npm install

b) Instalação no Frontend (placar-front):
   cd ../placar-front
   npm install


--------------------------------------------------------------------
4. EXECUTANDO A APLICAÇÃO
--------------------------------------------------------------------
Para o sistema funcionar, é necessário rodar o Backend e o 
Frontend simultaneamente (em dois terminais diferentes).

-> TERMINAL 1 (Backend - Servidor Node.js):
   1. Abra a pasta do backend: cd Placar
   2. Inicie o servidor:       node index.js  (ou npm run dev)

-> TERMINAL 2 (Frontend - Interface React/Vite):
   1. Abra a pasta do frontend: cd placar-front
   2. Inicie a aplicação:      npm run dev


--------------------------------------------------------------------
5. ACESSANDO O SISTEMA
--------------------------------------------------------------------
Após rodar os dois comandos, abra o seu navegador no endereço fornecido 
pelo Vite (geralmente http://localhost:5173).

Você poderá navegar entre as telas através do menu superior:
 - Painel M.C.
 - Telão Público
 - Tela Jurado
====================================================================
