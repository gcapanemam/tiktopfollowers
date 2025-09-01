# Integração TikTok - Plataforma Completa

Uma aplicação completa para integração com a API do TikTok, permitindo autenticação OAuth 2.0, visualização de dados do usuário, listagem de vídeos e upload de conteúdo.

## 🚀 Funcionalidades

- ✅ **Autenticação OAuth 2.0** com TikTok Login Kit
- ✅ **Gerenciamento de Tokens** (access token e refresh token)
- ✅ **Dados do Usuário** (perfil, estatísticas, informações)
- ✅ **Listagem de Vídeos** do usuário autenticado
- ✅ **Upload de Vídeos** com configurações de privacidade
- ✅ **Interface Web Moderna** e responsiva
- ✅ **Dashboard Completo** para gerenciar a integração

## 🏗️ Arquitetura

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Autenticação**: OAuth 2.0 com TikTok
- **Sessões**: express-session com cookies
- **CORS**: Configurado para frontend React
- **APIs**: Integração completa com TikTok APIs

### Frontend (React + TypeScript)
- **Framework**: React 18 com TypeScript
- **Roteamento**: React Router DOM
- **Estilização**: CSS modular personalizado
- **HTTP Client**: Axios
- **Interface**: Design moderno e responsivo

## 📋 Pré-requisitos

- Node.js 16+ e npm
- Conta de desenvolvedor no TikTok
- Aplicação registrada no TikTok for Developers

## ⚙️ Configuração

### 1. Configuração do Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```env
TIKTOK_CLIENT_KEY=seu_client_key_aqui
TIKTOK_CLIENT_SECRET=seu_client_secret_aqui
TIKTOK_REDIRECT_URI=http://localhost:5000/auth/tiktok/callback
PORT=5000
SESSION_SECRET=seu_session_secret_aqui
NODE_ENV=development
```

### 2. Configuração do Frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
REACT_APP_ENABLE_DEBUG=true
```

### 3. Configuração no TikTok for Developers

1. Acesse [TikTok for Developers](https://developers.tiktok.com/)
2. Crie uma nova aplicação
3. Configure as seguintes URLs de redirecionamento:
   - `http://localhost:5000/auth/tiktok/callback`
   - `http://localhost:3000/auth/callback`
4. Solicite as seguintes permissões:
   - `user.info.basic`
   - `video.list`
   - `video.upload`

## 🚀 Execução

### Desenvolvimento

1. **Iniciar o Backend**:
```bash
cd backend
npm run dev
```
Servidor rodará em: http://localhost:5000

2. **Iniciar o Frontend**:
```bash
cd frontend
npm start
```
Aplicação rodará em: http://localhost:3000

### Produção

1. **Backend**:
```bash
cd backend
npm start
```

2. **Frontend**:
```bash
cd frontend
npm run build
npm install -g serve
serve -s build
```

## 📚 Endpoints da API

### Autenticação
- `GET /auth/tiktok` - Iniciar autenticação OAuth
- `GET /auth/tiktok/callback` - Callback do OAuth (redirecionamento)
- `POST /api/auth/callback` - Callback do OAuth (API)
- `POST /api/auth/refresh` - Renovar access token
- `GET /api/auth/status` - Verificar status de autenticação
- `POST /api/auth/logout` - Fazer logout

### Usuário
- `GET /api/user/info` - Obter informações do usuário
- `GET /api/user/videos` - Listar vídeos do usuário

### Vídeos
- `POST /api/video/upload/init` - Inicializar upload de vídeo
- `POST /api/video/publish` - Publicar vídeo
- `GET /api/video/publish/status/:publish_id` - Verificar status de publicação

### Utilitários
- `GET /api/health` - Health check da API

## 🎨 Componentes Frontend

### Páginas
- **Home** (`/`) - Página inicial com botão de login
- **Dashboard** (`/dashboard`) - Painel principal após autenticação
- **AuthCallback** (`/auth/callback`) - Processamento do callback OAuth

### Componentes
- **Home** - Página de boas-vindas e login
- **Dashboard** - Painel com informações do usuário e vídeos
- **VideoUpload** - Interface para upload de vídeos
- **AuthCallback** - Processamento de autenticação

## 🔒 Segurança

- **CSRF Protection**: Tokens CSRF para prevenir ataques
- **Session Management**: Sessões seguras com cookies httpOnly
- **CORS**: Configurado adequadamente para o frontend
- **Token Refresh**: Renovação automática de tokens expirados
- **Input Validation**: Validação de dados de entrada

## 🎯 Fluxo de Autenticação

1. Usuário clica em "Entrar com TikTok" na página inicial
2. Sistema gera token CSRF e redireciona para TikTok
3. Usuário autoriza a aplicação no TikTok
4. TikTok redireciona para callback com código de autorização
5. Backend troca código por access token e refresh token
6. Tokens são salvos na sessão do usuário
7. Usuário é redirecionado para o dashboard
8. Dashboard carrega dados do usuário e vídeos

## 📱 Funcionalidades do Dashboard

### Perfil do Usuário
- Avatar e nome de exibição
- Biografia e link do perfil
- Badge de verificação (se aplicável)
- Estatísticas (seguidores, seguindo, curtidas, vídeos)

### Gerenciamento de Vídeos
- Listagem de vídeos existentes
- Estatísticas de cada vídeo (visualizações, curtidas, comentários, compartilhamentos)
- Links para visualizar no TikTok

### Upload de Vídeos
- Interface drag-and-drop para seleção de arquivos
- Configurações de título e descrição
- Opções de privacidade (público/privado)
- Configurações de interação (comentários, duetos, stitch)
- Barra de progresso durante upload
- Feedback de sucesso/erro

## 🛠️ Tecnologias Utilizadas

### Backend
- **Express.js** - Framework web
- **Axios** - Cliente HTTP
- **express-session** - Gerenciamento de sessões
- **cookie-parser** - Parser de cookies
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Variáveis de ambiente

### Frontend
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **CSS Modules** - Estilização modular

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verifique se o backend está rodando na porta 5000
   - Confirme a configuração de CORS no backend

2. **Token Expirado**
   - Use o botão "Renovar Token" no dashboard
   - Ou faça logout e login novamente

3. **Erro de Upload**
   - Verifique o tamanho do arquivo (máx. 4GB)
   - Confirme o formato do vídeo (MP4, MOV, AVI)
   - Verifique as permissões da aplicação no TikTok

4. **Erro de Autenticação**
   - Verifique as credenciais no arquivo .env
   - Confirme as URLs de redirecionamento no TikTok
   - Verifique se as permissões estão corretas

## 📄 Licença

Este projeto é para fins educacionais e de demonstração. Consulte os termos de uso da API do TikTok para uso em produção.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação oficial do TikTok
2. Consulte os logs do console para erros
3. Verifique as configurações de ambiente
4. Teste os endpoints da API individualmente

---

**Desenvolvido com ❤️ para integração com TikTok**