# 🚀 Deploy da Aplicação TikTok Integration

Este guia explica como fazer o deploy da aplicação na internet usando o Vercel.

## 📋 Pré-requisitos

1. Conta no [GitHub](https://github.com)
2. Conta no [Vercel](https://vercel.com)
3. Conta no [TikTok Developer Portal](https://developers.tiktok.com)

## 🔧 Preparação

### 1. Configurar Git e GitHub

```bash
# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit - TikTok Integration App"

# Adicionar repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/seu-usuario/tiktok-integration.git

# Enviar para GitHub
git push -u origin main
```

### 2. Deploy no Vercel

1. **Acesse [vercel.com](https://vercel.com)**
2. **Faça login com GitHub**
3. **Clique em "New Project"**
4. **Selecione seu repositório**
5. **Configure as variáveis de ambiente:**

#### Variáveis de Ambiente Necessárias:

```env
# TikTok API Credentials
TIKTOK_CLIENT_KEY=seu_client_key_aqui
TIKTOK_CLIENT_SECRET=seu_client_secret_aqui
TIKTOK_REDIRECT_URI=https://seu-app.vercel.app/auth/tiktok/callback

# Server Configuration
PORT=5000
SESSION_SECRET=seu-session-secret-seguro
NODE_ENV=production

# Frontend API URL
REACT_APP_API_URL=https://seu-app.vercel.app
```

6. **Clique em "Deploy"**

## 🔑 Configuração do TikTok Developer Portal

### 1. Atualizar Redirect URI

1. Acesse [developers.tiktok.com](https://developers.tiktok.com)
2. Vá para sua aplicação
3. Atualize o **Redirect URI** para:
   ```
   https://seu-app.vercel.app/auth/tiktok/callback
   ```

### 2. Verificação de Domínio

1. No TikTok Developer Portal, vá para "Domain Verification"
2. Selecione "Signature File" method
3. Copie o código de verificação fornecido
4. Edite o arquivo `frontend/public/tiktok-developers-site-verification.txt`
5. Substitua `YOUR_VERIFICATION_CODE_HERE` pelo código real
6. Commit e push as mudanças:
   ```bash
   git add .
   git commit -m "Add TikTok domain verification"
   git push
   ```
7. Aguarde o redeploy automático do Vercel
8. Complete a verificação usando:
   ```
   https://seu-app.vercel.app/tiktok-developers-site-verification.txt
   ```

## 🧪 Teste da Aplicação

1. **Acesse sua aplicação**: `https://seu-app.vercel.app`
2. **Teste o login do TikTok**
3. **Verifique se os dados são carregados corretamente**
4. **Teste o upload de vídeos (se aplicável)**

## 🔧 Comandos Úteis

### Deploy Manual (se necessário)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod
```

### Logs de Produção
```bash
# Ver logs em tempo real
vercel logs seu-app.vercel.app
```

## 🐛 Troubleshooting

### Erro de CORS
Se houver erros de CORS, verifique se:
1. As URLs estão corretas no frontend
2. O backend está configurado para aceitar o domínio do Vercel

### Erro de Autenticação
Se o login do TikTok não funcionar:
1. Verifique se o Redirect URI está correto
2. Confirme se as credenciais estão configuradas corretamente
3. Verifique se a verificação de domínio foi concluída

### Erro de Variáveis de Ambiente
Se houver erros relacionados a configurações:
1. Verifique se todas as variáveis estão definidas no Vercel
2. Confirme se os nomes das variáveis estão corretos
3. Redeploy após alterar variáveis de ambiente

## 📚 Recursos Adicionais

- [Documentação do Vercel](https://vercel.com/docs)
- [TikTok Developer Documentation](https://developers.tiktok.com/doc/)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

## 🎉 Sucesso!

Sua aplicação TikTok Integration agora está rodando na internet! 🚀