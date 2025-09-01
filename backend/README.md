# Backend - Integração TikTok API

Servidor Node.js com Express para integração completa com a API do TikTok, incluindo autenticação OAuth 2.0, gerenciamento de tokens e funcionalidades de upload de vídeos.

## 🚀 Funcionalidades

- **Autenticação OAuth 2.0** com TikTok Login Kit
- **Gerenciamento de Sessões** com express-session
- **Renovação Automática de Tokens** (refresh token)
- **API de Usuário** (perfil, estatísticas, vídeos)
- **Upload de Vídeos** com Content Posting API
- **Health Check** e monitoramento
- **Proteção CSRF** e segurança

## 📦 Dependências

```json
{
  "express": "^4.18.2",
  "axios": "^1.6.0",
  "express-session": "^1.17.3",
  "cookie-parser": "^1.4.6",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "nodemon": "^3.0.1"
}
```

## ⚙️ Configuração

### 1. Instalação

```bash
npm install
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# TikTok API Credentials
TIKTOK_CLIENT_KEY=seu_client_key_aqui
TIKTOK_CLIENT_SECRET=seu_client_secret_aqui
TIKTOK_REDIRECT_URI=http://localhost:5000/auth/tiktok/callback

# Server Configuration
PORT=5000
SESSION_SECRET=seu_session_secret_muito_seguro_aqui
NODE_ENV=development
```

### 3. Configuração no TikTok for Developers

1. Acesse [TikTok for Developers](https://developers.tiktok.com/)
2. Crie uma nova aplicação
3. Configure as URLs de redirecionamento:
   - `http://localhost:5000/auth/tiktok/callback`
4. Solicite as seguintes permissões (scopes):
   - `user.info.basic` - Informações básicas do usuário
   - `video.list` - Listar vídeos do usuário
   - `video.upload` - Upload de vídeos

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```
Servidor rodará em: http://localhost:5000 com hot reload

### Produção
```bash
npm start
```

## 📚 Endpoints da API

### Autenticação

#### `GET /auth/tiktok`
Iniciar processo de autenticação OAuth 2.0
- **Resposta**: Redirecionamento para TikTok
- **Query Params**: Nenhum

#### `GET /auth/tiktok/callback`
Callback do OAuth (redirecionamento direto)
- **Query Params**: `code`, `state`, `error`
- **Resposta**: Redirecionamento para frontend

#### `POST /api/auth/callback`
Callback do OAuth (API endpoint)
- **Body**: `{ "code": "auth_code", "state": "csrf_token" }`
- **Resposta**: `{ "success": true, "message": "Authenticated successfully" }`

#### `POST /api/auth/refresh`
Renovar access token usando refresh token
- **Autenticação**: Sessão ativa
- **Resposta**: `{ "success": true, "message": "Token refreshed" }`

#### `GET /api/auth/status`
Verificar status de autenticação
- **Resposta**: 
```json
{
  "authenticated": true,
  "tokenExpired": false,
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

#### `POST /api/auth/logout`
Fazer logout e revogar tokens
- **Autenticação**: Sessão ativa
- **Resposta**: `{ "success": true, "message": "Logged out successfully" }`

### Usuário

#### `GET /api/user/info`
Obter informações do usuário autenticado
- **Autenticação**: Access token válido
- **Resposta**:
```json
{
  "data": {
    "open_id": "user_open_id",
    "union_id": "user_union_id",
    "avatar_url": "https://...",
    "avatar_url_100": "https://...",
    "avatar_large_url": "https://...",
    "display_name": "Nome do Usuário",
    "bio_description": "Biografia do usuário",
    "profile_deep_link": "https://tiktok.com/@username",
    "is_verified": false,
    "follower_count": 1000,
    "following_count": 500,
    "likes_count": 5000,
    "video_count": 50
  }
}
```

#### `GET /api/user/videos`
Listar vídeos do usuário
- **Autenticação**: Access token válido
- **Query Params**: `cursor` (opcional), `max_count` (opcional, padrão: 20)
- **Resposta**:
```json
{
  "data": {
    "videos": [
      {
        "id": "video_id",
        "title": "Título do vídeo",
        "video_description": "Descrição",
        "duration": 30,
        "cover_image_url": "https://...",
        "embed_html": "<iframe...",
        "embed_link": "https://...",
        "like_count": 100,
        "comment_count": 20,
        "share_count": 10,
        "view_count": 1000
      }
    ],
    "cursor": "next_cursor",
    "has_more": true
  }
}
```

### Vídeos

#### `POST /api/video/upload/init`
Inicializar upload de vídeo
- **Autenticação**: Access token válido
- **Body**:
```json
{
  "source_info": {
    "source": "FILE_UPLOAD",
    "video_size": 1024000,
    "chunk_size": 10240000,
    "total_chunk_count": 1
  }
}
```
- **Resposta**:
```json
{
  "data": {
    "publish_id": "publish_id_123",
    "upload_url": "https://upload.tiktokapis.com/..."
  }
}
```

#### `POST /api/video/publish`
Publicar vídeo após upload
- **Autenticação**: Access token válido
- **Body**:
```json
{
  "publish_id": "publish_id_123",
  "post_info": {
    "title": "Título do vídeo",
    "description": "Descrição do vídeo",
    "privacy_level": "SELF_ONLY",
    "disable_duet": false,
    "disable_comment": false,
    "disable_stitch": false,
    "video_cover_timestamp_ms": 1000
  }
}
```
- **Resposta**:
```json
{
  "data": {
    "publish_id": "publish_id_123"
  }
}
```

#### `GET /api/video/publish/status/:publish_id`
Verificar status de publicação
- **Autenticação**: Access token válido
- **Params**: `publish_id`
- **Resposta**:
```json
{
  "data": {
    "status": "PROCESSING_UPLOAD",
    "fail_reason": null
  }
}
```

### Utilitários

#### `GET /api/health`
Health check da API
- **Resposta**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## 🔒 Segurança

### CSRF Protection
- Tokens CSRF gerados para cada sessão
- Validação obrigatória em callbacks OAuth

### Session Management
- Sessões seguras com cookies httpOnly
- Expiração automática de sessões
- Limpeza de dados sensíveis

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://seu-dominio.com' 
    : 'http://localhost:3000',
  credentials: true
}));
```

### Token Management
- Access tokens armazenados apenas na sessão
- Refresh automático antes da expiração
- Revogação segura no logout

## 🛠️ Estrutura do Código

```
backend/
├── index.js              # Servidor principal
├── package.json          # Dependências e scripts
├── .env.example         # Exemplo de variáveis de ambiente
├── .env                 # Variáveis de ambiente (não versionado)
└── README.md            # Esta documentação
```

### Principais Seções do index.js

1. **Configuração do Servidor**
   - Express setup
   - Middleware configuration
   - CORS e session setup

2. **Rotas de Autenticação**
   - OAuth flow
   - Token management
   - Session handling

3. **Rotas da API**
   - User endpoints
   - Video endpoints
   - Utility endpoints

4. **Middleware de Autenticação**
   - Token validation
   - Session verification
   - Error handling

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro 401 - Unauthorized**
   - Verifique se o access token está válido
   - Tente renovar o token com `/api/auth/refresh`
   - Verifique as credenciais no .env

2. **Erro de CORS**
   - Confirme a configuração de origem no CORS
   - Verifique se credentials: true está configurado

3. **Erro de Sessão**
   - Verifique se SESSION_SECRET está definido
   - Confirme se os cookies estão sendo enviados

4. **Erro de Upload**
   - Verifique o tamanho do arquivo
   - Confirme as permissões da aplicação
   - Verifique a URL de upload retornada

### Logs e Debug

```javascript
// Habilitar logs detalhados
process.env.DEBUG = 'express:*';

// Logs personalizados no código
console.log('Token info:', {
  hasToken: !!req.session.accessToken,
  expiresAt: req.session.tokenExpiresAt
});
```

## 📊 Monitoramento

### Health Check
Use o endpoint `/api/health` para monitorar o status do servidor:

```bash
curl http://localhost:5000/api/health
```

### Logs de Acesso
Todos os requests são logados automaticamente pelo Express.

### Métricas Importantes
- Taxa de sucesso de autenticação
- Tempo de resposta dos endpoints
- Erros de token expirado
- Falhas de upload

## 🔄 Fluxo de Dados

1. **Autenticação**:
   ```
   Frontend → /auth/tiktok → TikTok → /auth/tiktok/callback → Frontend
   ```

2. **API Calls**:
   ```
   Frontend → Backend → TikTok API → Backend → Frontend
   ```

3. **Upload de Vídeo**:
   ```
   Frontend → /api/video/upload/init → TikTok → Upload URL
   Frontend → Upload URL → TikTok
   Frontend → /api/video/publish → TikTok
   ```

## 📝 Notas de Desenvolvimento

- Use `npm run dev` para desenvolvimento com hot reload
- Mantenha as credenciais seguras no arquivo .env
- Teste todos os endpoints com Postman ou similar
- Monitore os logs para identificar problemas
- Implemente rate limiting para produção

---

**Backend desenvolvido para integração robusta com TikTok API** 🚀