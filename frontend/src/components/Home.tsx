import React, { useState } from 'react';
import axios from 'axios';
import './Home.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleTikTokLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/auth/tiktok`, {
        withCredentials: true
      });
      
      // Redirecionar para a URL de autenticação do TikTok
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Erro ao iniciar autenticação:', err);
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Integração TikTok</h1>
        <p>Conecte sua conta do TikTok para gerenciar seus vídeos e dados.</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          className="tiktok-login-btn"
          onClick={handleTikTokLogin}
          disabled={loading}
        >
          {loading ? 'Conectando...' : 'Conectar com TikTok'}
        </button>
        
        <div className="features">
          <h3>Funcionalidades disponíveis:</h3>
          <ul>
            <li>✅ Autenticação OAuth 2.0 segura</li>
            <li>✅ Visualizar informações do perfil</li>
            <li>✅ Listar seus vídeos</li>
            <li>✅ Gerenciar tokens de acesso</li>
            <li>🔄 Upload de novos vídeos (em desenvolvimento)</li>
          </ul>
        </div>
        
        <div className="info-section">
          <h3>Como funciona:</h3>
          <ol>
            <li>Clique em "Conectar com TikTok"</li>
            <li>Faça login na sua conta TikTok</li>
            <li>Autorize o acesso às suas informações</li>
            <li>Seja redirecionado para o dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;