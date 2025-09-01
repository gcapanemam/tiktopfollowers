const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurações do TikTok
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:5000/auth/tiktok/callback';

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'tiktok-integration-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'TikTok Integration API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            auth: {
                login: 'GET /auth/tiktok',
                callback: 'GET /auth/tiktok/callback',
                callbackPost: 'POST /api/auth/callback',
                refresh: 'POST /api/auth/refresh',
                status: 'GET /api/auth/status',
                logout: 'POST /api/auth/logout'
            },
            user: {
                info: 'GET /api/user/info',
                videos: 'GET /api/user/videos'
            },
            video: {
                uploadInit: 'POST /api/video/upload/init',
                publish: 'POST /api/video/publish',
                publishStatus: 'GET /api/video/publish/status/:publish_id'
            },
            health: 'GET /api/health'
        }
    });
});

// Função para gerar token CSRF
function generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Funções para PKCE (Proof Key for Code Exchange)
function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(codeVerifier) {
    return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
}

// Rota para iniciar autenticação OAuth
app.get('/auth/tiktok', (req, res) => {
    const csrfState = generateCSRFToken();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Salvar na sessão para usar posteriormente
    req.session.csrfState = csrfState;
    req.session.codeVerifier = codeVerifier;
    
    const authUrl = 'https://www.tiktok.com/v2/auth/authorize/?' + new URLSearchParams({
        client_key: CLIENT_KEY,
        scope: 'user.info.basic,video.list,video.upload',
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        state: csrfState,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });
    
    res.json({ authUrl });
});

// Callback do OAuth (GET - para redirecionamento direto do TikTok)
app.get('/auth/tiktok/callback', async (req, res) => {
    const { code, state } = req.query;
    
    // Verificar CSRF token
    if (state !== req.session.csrfState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
    }
    
    try {
        // Trocar código por access token
        const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', 
            new URLSearchParams({
                client_key: CLIENT_KEY,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code_verifier: req.session.codeVerifier
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const tokenData = tokenResponse.data;
        
        // Salvar tokens na sessão
        req.session.accessToken = tokenData.access_token;
        req.session.refreshToken = tokenData.refresh_token;
        req.session.openId = tokenData.open_id;
        req.session.expiresIn = tokenData.expires_in;
        req.session.tokenObtainedAt = Date.now();
        
        // Redirecionar para o frontend
        res.redirect('http://localhost:3000/dashboard?auth=success');
        
    } catch (error) {
        console.error('Erro ao obter access token:', error.response?.data || error.message);
        res.redirect('http://localhost:3000/dashboard?auth=error');
    }
});

// Callback do OAuth (POST - para requisições do frontend)
app.post('/api/auth/callback', async (req, res) => {
    const { code, state } = req.body;
    
    // Verificar CSRF token
    if (state !== req.session.csrfState) {
        return res.status(401).json({ error: 'Invalid CSRF state parameter' });
    }
    
    if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
    }
    
    try {
        // Trocar código por access token
        const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', 
            new URLSearchParams({
                client_key: CLIENT_KEY,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code_verifier: req.session.codeVerifier
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const tokenData = tokenResponse.data;
        
        // Salvar tokens na sessão
        req.session.accessToken = tokenData.access_token;
        req.session.refreshToken = tokenData.refresh_token;
        req.session.openId = tokenData.open_id;
        req.session.expiresIn = tokenData.expires_in;
        req.session.tokenObtainedAt = Date.now();
        
        res.json({ 
            success: true, 
            message: 'Authentication successful',
            openId: tokenData.open_id
        });
        
    } catch (error) {
        console.error('Erro ao obter access token:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to exchange code for access token',
            details: error.response?.data || error.message
        });
    }
});

// Rota para obter informações do usuário
app.get('/api/user/info', async (req, res) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const userResponse = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`
            },
            params: {
                fields: 'open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count'
            }
        });
        
        res.json(userResponse.data);
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});

// Rota para obter vídeos do usuário
app.get('/api/user/videos', async (req, res) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const videosResponse = await axios.post('https://open.tiktokapis.com/v2/video/list/', 
            {
                max_count: 20,
                cursor: 0
            },
            {
                headers: {
                    'Authorization': `Bearer ${req.session.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        res.json(videosResponse.data);
    } catch (error) {
        console.error('Erro ao obter vídeos:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Rota para inicializar upload de vídeo
app.post('/api/video/upload/init', async (req, res) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { source_info } = req.body;
    
    if (!source_info || !source_info.source || !source_info.video_size) {
        return res.status(400).json({ error: 'Missing required video information' });
    }
    
    try {
        const uploadResponse = await axios.post('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/',
            {
                source_info: source_info
            },
            {
                headers: {
                    'Authorization': `Bearer ${req.session.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        res.json(uploadResponse.data);
    } catch (error) {
        console.error('Erro ao inicializar upload:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to initialize video upload',
            details: error.response?.data || error.message
        });
    }
});

// Rota para publicar vídeo
app.post('/api/video/publish', async (req, res) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { media_id, post_info } = req.body;
    
    if (!media_id) {
        return res.status(400).json({ error: 'Media ID is required' });
    }
    
    try {
        const publishResponse = await axios.post('https://open.tiktokapis.com/v2/post/publish/video/init/',
            {
                media_id: media_id,
                post_info: post_info || {}
            },
            {
                headers: {
                    'Authorization': `Bearer ${req.session.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        res.json(publishResponse.data);
    } catch (error) {
        console.error('Erro ao publicar vídeo:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to publish video',
            details: error.response?.data || error.message
        });
    }
});

// Rota para verificar status de publicação
app.get('/api/video/publish/status/:publish_id', async (req, res) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { publish_id } = req.params;
    
    try {
        const statusResponse = await axios.post('https://open.tiktokapis.com/v2/post/publish/status/fetch/',
            {
                publish_id: publish_id
            },
            {
                headers: {
                    'Authorization': `Bearer ${req.session.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        res.json(statusResponse.data);
    } catch (error) {
        console.error('Erro ao verificar status:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to check publish status',
            details: error.response?.data || error.message
        });
    }
});

// Rota para refresh do token
app.post('/api/auth/refresh', async (req, res) => {
    if (!req.session.refreshToken) {
        return res.status(401).json({ error: 'No refresh token available' });
    }
    
    try {
        const refreshResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/',
            new URLSearchParams({
                client_key: CLIENT_KEY,
                client_secret: CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: req.session.refreshToken
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const tokenData = refreshResponse.data;
        
        // Atualizar tokens na sessão
        req.session.accessToken = tokenData.access_token;
        req.session.refreshToken = tokenData.refresh_token;
        req.session.expiresIn = tokenData.expires_in;
        req.session.tokenObtainedAt = Date.now();
        
        res.json({ success: true, message: 'Token refreshed successfully' });
        
    } catch (error) {
        console.error('Erro ao renovar token:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Rota para verificar status da autenticação
app.get('/api/auth/status', (req, res) => {
    const isAuthenticated = !!req.session.accessToken;
    const tokenExpired = req.session.tokenObtainedAt && 
        (Date.now() - req.session.tokenObtainedAt) > (req.session.expiresIn * 1000);
    
    res.json({
        isAuthenticated,
        tokenExpired,
        openId: req.session.openId || null
    });
});

// Rota para logout
app.post('/api/auth/logout', async (req, res) => {
    if (req.session.accessToken) {
        try {
            // Revogar token no TikTok
            await axios.post('https://open.tiktokapis.com/v2/oauth/revoke/',
                new URLSearchParams({
                    client_key: CLIENT_KEY,
                    client_secret: CLIENT_SECRET,
                    token: req.session.accessToken
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cache-Control': 'no-cache'
                    }
                }
            );
        } catch (error) {
            console.error('Erro ao revogar token:', error.response?.data || error.message);
        }
    }
    
    // Limpar sessão
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir sessão:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'TikTok Integration API is running' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});