# 🧊 Voxel Genesis AI

O **Voxel Genesis** é um editor de voxels 3D procedurais que roda diretamente no navegador. Ele combina o poder da renderização em tempo real com Inteligência Artificial para permitir a criação de geometrias complexas, texturas personalizadas e modelos 3D através de linguagem natural.

<p align="center">
  <img src="https://raw.githubusercontent.com/Jjunninho/voxel_genesis/main/imagens/imagem0.jpg" width="32%">
  <img src="https://raw.githubusercontent.com/Jjunninho/voxel_genesis/main/imagens/imagem1.jpg" width="32%">
  <img src="https://raw.githubusercontent.com/Jjunninho/voxel_genesis/main/imagens/imagem2.jpg" width="32%">
  <img src="https://raw.githubusercontent.com/Jjunninho/voxel_genesis/main/imagens/imagem3.jpg" width="32%">
  <img src="https://raw.githubusercontent.com/Jjunninho/voxel_genesis/main/imagens/imagem4.jpg" width="32%">
  <img src="https://raw.githubusercontent.com/Jjunninho/voxel_genesis/main/imagens/imagem5.jpg" width="32%">
  <img src="https://raw.githubusercontent.com/Jjunninho/voxel_genesis/main/imagens/imagem6.jpg" width="32%">
</p>

## 🚀 Funcionalidades Principais

* **Editor 3D em Tempo Real**: Manipulação completa de cena, câmeras e iluminação utilizando **Three.js**.
* **Geração por IA (BYOK)**: Integração com a API da **Groq (Llama 3)** para gerar formas e texturas a partir de prompts de texto.
* **Geometrias Avançadas**: Biblioteca integrada de formas básicas, geometria sagrada e fractais complexos (Curva do Dragão, etc.).
* **Voxelizador de OBJ**: Importe modelos `.obj` externos e transforme-os automaticamente em estruturas de voxels.
* **Sistema de Arquivos Local**: Gerencie seus projetos com um explorador de arquivos interno e exportação para formatos padrão da indústria.
* **Segurança e Privacidade**: Implementação de sistema **Bring Your Own Key (BYOK)**, onde a chave da API do usuário é salva de forma segura apenas no `localStorage` do navegador.

## 🛠️ Tecnologias Utilizadas

* **Linguagem**: JavaScript Puro (Vanilla JS).
* **Engine 3D**: Three.js.
* **IA**: Groq Cloud API (Modelos Llama 3).
* **Estilização**: CSS3 com foco em UX para editores profissionais.
* **Hospedagem**: GitHub Pages.

## 🔑 Como usar a IA

Para utilizar as funções de geração automática:
1. Obtenha uma chave de API gratuita no console da [Groq Cloud](https://console.groq.com/).
2. No menu lateral do Voxel Genesis, cole sua chave no campo **Chave API Groq**.
3. Clique em **Salvar no Navegador**.
4. Use o campo de texto para descrever o que deseja criar (ex: "uma pirâmide de pedra com rachaduras") e clique em **Gerar com IA**.

## 💻 Como Rodar o Projeto Localmente

1. Clone o repositório:
   ```bash
   git clone [https://github.com/Jjunninho/voxel_genesis.git](https://github.com/Jjunninho/voxel_genesis.git)
