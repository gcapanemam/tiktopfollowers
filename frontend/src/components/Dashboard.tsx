import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VideoUpload from './VideoUpload';
import './Dashboard.css';

interface UserInfo {
  data: {
    user: {
      open_id: string;
      union_id: string;
      avatar_url: string;
      display_name: string;
      bio_description: string;
      profile_deep_link: string;
      is_verified: boolean;
      follower_count: number;
      following_count: number;
      likes_count: number;
      video_count: number;
    };
  };
}

interface VideoData {
  data: {
    videos: Array<{
      id: string;
      title: string;
      video_description: string;
      duration: number;
      cover_image_url: string;
      share_url: string;
      embed_html: string;
      embed_link: string;
      like_count: number;
      comment_count: number;
      share_count: number;
      view_count: number;
    }>;
    cursor: number;
    has_more: boolean;
  };
}

const Dashboard: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [videos, setVideos] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    checkAuthStatus();
    
    // Verificar se veio de uma autenticação bem-sucedida
    const authResult = searchParams.get('auth');
    if (authResult === 'success') {
      // Aguardar um pouco para garantir que a sessão foi criada
      setTimeout(() => {
        fetchUserData();
      }, 1000);
    } else if (authResult === 'error') {
      setError('Erro na autenticação com TikTok');
      setLoading(false);
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/status`, {
        withCredentials: true
      });
      setAuthStatus(response.data);
      
      if (response.data.isAuthenticated && !response.data.tokenExpired) {
        fetchUserData();
      } else {
        setLoading(false);
        if (!searchParams.get('auth')) {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status de autenticação:', err);
      setError('Erro ao verificar autenticação');
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Buscar informações do usuário
      const userResponse = await axios.get(`${API_URL}/api/user/info`, {
        withCredentials: true
      });
      setUserInfo(userResponse.data);
      
      // Buscar vídeos do usuário
      const videosResponse = await axios.get(`${API_URL}/api/user/videos`, {
        withCredentials: true
      });
      setVideos(videosResponse.data);
      
    } catch (err: any) {
      console.error('Erro ao buscar dados do usuário:', err);
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError('Erro ao carregar dados do usuário');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
      navigate('/');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      // Mesmo com erro, redirecionar para home
      navigate('/');
    }
  };

  const refreshToken = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/refresh`, {}, {
        withCredentials: true
      });
      fetchUserData();
    } catch (err) {
      console.error('Erro ao renovar token:', err);
      setError('Erro ao renovar token. Faça login novamente.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando dados do TikTok...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">
          <h2>Erro</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard TikTok</h1>
        <div className="header-actions">
          {authStatus?.tokenExpired && (
            <button onClick={refreshToken} className="btn-secondary">
              Renovar Token
            </button>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      {userInfo && (
        <div className="user-profile">
          <div className="profile-header">
            <img 
              src={userInfo.data.user.avatar_url} 
              alt="Avatar" 
              className="avatar"
            />
            <div className="profile-info">
              <h2>
                {userInfo.data.user.display_name}
                {userInfo.data.user.is_verified && (
                  <span className="verified-badge">✓</span>
                )}
              </h2>
              <p className="bio">{userInfo.data.user.bio_description}</p>
              <a 
                href={userInfo.data.user.profile_deep_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="profile-link"
              >
                Ver Perfil no TikTok
              </a>
            </div>
          </div>
          
          <div className="stats">
            <div className="stat">
              <span className="stat-number">{userInfo.data.user.follower_count.toLocaleString()}</span>
              <span className="stat-label">Seguidores</span>
            </div>
            <div className="stat">
              <span className="stat-number">{userInfo.data.user.following_count.toLocaleString()}</span>
              <span className="stat-label">Seguindo</span>
            </div>
            <div className="stat">
              <span className="stat-number">{userInfo.data.user.likes_count.toLocaleString()}</span>
              <span className="stat-label">Curtidas</span>
            </div>
            <div className="stat">
              <span className="stat-number">{userInfo.data.user.video_count.toLocaleString()}</span>
              <span className="stat-label">Vídeos</span>
            </div>
          </div>
        </div>
      )}

      <VideoUpload onUploadComplete={() => fetchUserData()} />

      {videos && (
        <div className="videos-section">
          <h3>Seus Vídeos</h3>
          {videos.data.videos.length > 0 ? (
            <div className="videos-grid">
              {videos.data.videos.map((video) => (
                <div key={video.id} className="video-card">
                  <img 
                    src={video.cover_image_url} 
                    alt={video.title}
                    className="video-thumbnail"
                  />
                  <div className="video-info">
                    <h4>{video.title || 'Sem título'}</h4>
                    <p className="video-description">
                      {video.video_description || 'Sem descrição'}
                    </p>
                    <div className="video-stats">
                      <span>👁️ {video.view_count.toLocaleString()}</span>
                      <span>❤️ {video.like_count.toLocaleString()}</span>
                      <span>💬 {video.comment_count.toLocaleString()}</span>
                      <span>🔄 {video.share_count.toLocaleString()}</span>
                    </div>
                    <a 
                      href={video.share_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="video-link"
                    >
                      Ver no TikTok
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-videos">Nenhum vídeo encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;