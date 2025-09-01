# Frontend - Integração TikTok

Aplicação React com TypeScript para interface de usuário da integração com TikTok, incluindo autenticação OAuth, dashboard de usuário e upload de vídeos.

## 🚀 Funcionalidades

- **Interface Moderna** com design responsivo
- **Autenticação OAuth 2.0** com TikTok
- **Dashboard Completo** com dados do usuário
- **Upload de Vídeos** com drag-and-drop
- **Gerenciamento de Tokens** automático
- **Roteamento SPA** com React Router
- **TypeScript** para tipagem estática

## 📦 Dependências

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "@types/react-router-dom": "^5.3.3",
  "axios": "^1.6.0",
  "typescript": "^4.9.5",
  "@types/react": "^18.0.27",
  "@types/react-dom": "^18.0.10"
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
# Backend API Configuration
REACT_APP_API_URL=http://localhost:5000

# TikTok Configuration
REACT_APP_TIKTOK_REDIRECT_URI=http://localhost:3000/auth/callback

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false
```

## 🚀 Execução

### Desenvolvimento
```bash
npm start
```
Aplicação rodará em: http://localhost:3000

### Build para Produção
```bash
npm run build
```

### Servir Build de Produção
```bash
npm install -g serve
serve -s build
```

## 🏗️ Estrutura do Projeto

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Home.tsx              # Página inicial
│   │   ├── Home.css              # Estilos da página inicial
│   │   ├── Dashboard.tsx         # Dashboard principal
│   │   ├── Dashboard.css         # Estilos do dashboard
│   │   ├── VideoUpload.tsx       # Componente de upload
│   │   ├── VideoUpload.css       # Estilos do upload
│   │   ├── AuthCallback.tsx      # Callback de autenticação
│   │   └── AuthCallback.css      # Estilos do callback
│   ├── App.tsx                   # Componente principal
│   ├── App.css                   # Estilos globais
│   ├── index.tsx                 # Ponto de entrada
│   └── index.css                 # Estilos base
├── package.json
├── .env.example
├── .env
└── README.md
```

## 🎨 Componentes

### Home (`/`)
Página inicial com apresentação e botão de login.

**Funcionalidades:**
- Apresentação da aplicação
- Botão "Entrar com TikTok"
- Informações sobre funcionalidades
- Design responsivo

### Dashboard (`/dashboard`)
Painel principal após autenticação.

**Funcionalidades:**
- Exibição de dados do usuário
- Listagem de vídeos
- Upload de novos vídeos
- Renovação de token
- Logout

### VideoUpload
Componente para upload de vídeos integrado ao Dashboard.

**Funcionalidades:**
- Seleção de arquivo (drag-and-drop)
- Validação de arquivo
- Configuração de título e descrição
- Opções de privacidade
- Barra de progresso
- Feedback de status

### AuthCallback (`/auth/callback`)
Processamento do callback de autenticação OAuth.

**Funcionalidades:**
- Extração de parâmetros da URL
- Envio do código para o backend
- Tratamento de erros
- Redirecionamento automático
- Feedback visual

## 🎯 Fluxos de Usuário

### 1. Autenticação
```
Home → Clique "Entrar com TikTok" → TikTok OAuth → AuthCallback → Dashboard
```

### 2. Visualização de Dados
```
Dashboard → Carregamento automático → Exibição de perfil e vídeos
```

### 3. Upload de Vídeo
```
Dashboard → VideoUpload → Seleção → Configuração → Upload → Publicação → Atualização
```

### 4. Renovação de Token
```
Dashboard → Token expirado → Botão "Renovar" → Atualização automática
```

## 🔧 Configuração de API

### Cliente Axios
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## 🎨 Estilos e Design

### Paleta de Cores
```css
:root {
  --primary-color: #ff0050;        /* TikTok Pink */
  --secondary-color: #25f4ee;      /* TikTok Cyan */
  --background-color: #000000;     /* Black */
  --surface-color: #161823;        /* Dark Gray */
  --text-primary: #ffffff;         /* White */
  --text-secondary: #a8a8a8;       /* Light Gray */
  --success-color: #00d4aa;        /* Green */
  --error-color: #ff4757;          /* Red */
  --warning-color: #ffa502;        /* Orange */
}
```

## 🔒 Segurança

### Validação de Entrada
- Validação de tamanho de arquivo (máx. 4GB)
- Tipos de arquivo permitidos (MP4, MOV, AVI)
- Sanitização de entrada de texto
- Limitação de caracteres

### Proteção CSRF
- Cookies httpOnly do backend
- Validação de origem
- Tokens de sessão seguros

## 🐛 Tratamento de Erros

### Tipos de Erro
- **Erro de Rede**: Problemas de conexão
- **Erro de Servidor**: Respostas 4xx/5xx
- **Erro de Validação**: Dados inválidos
- **Erro de Autenticação**: Token expirado

### Feedback Visual
- Mensagens de erro claras
- Estados de carregamento
- Animações de sucesso
- Opções de retry

## 📱 Responsividade

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Componentes Responsivos
- Grid flexível para vídeos
- Menu adaptável
- Formulários otimizados para mobile
- Imagens responsivas

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Variáveis de Ambiente para Produção
```env
REACT_APP_API_URL=https://api.seudominio.com
REACT_APP_ENV=production
REACT_APP_ENABLE_DEBUG=false
```

### Hospedagem
- **Netlify**: Deploy automático do build
- **Vercel**: Integração com Git
- **AWS S3**: Hospedagem estática
- **GitHub Pages**: Deploy gratuito

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verifique se o backend está rodando
   - Confirme a URL da API no .env

2. **Erro de Roteamento**
   - Verifique se todas as rotas estão definidas
   - Confirme o BrowserRouter no App.tsx

3. **Erro de Upload**
   - Verifique o tamanho do arquivo
   - Confirme o tipo de arquivo
   - Verifique a conexão com a internet

4. **Erro de Autenticação**
   - Limpe o cache do navegador
   - Verifique se os cookies estão habilitados
   - Tente fazer logout e login novamente

## 📊 Performance

### Otimizações Implementadas
- **Code Splitting**: Carregamento sob demanda
- **Lazy Loading**: Componentes carregados quando necessário
- **Memoização**: React.memo para componentes
- **Debounce**: Para inputs de busca

### Bundle Analysis
```bash
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

---

**Frontend desenvolvido com React e TypeScript para uma experiência moderna** ⚛️
