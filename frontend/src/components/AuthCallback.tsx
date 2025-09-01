import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './AuthCallback.css';

const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processando autenticação...');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Verificar se houve erro na autorização
        if (error) {
          let errorMessage = 'Erro na autorização do TikTok';
          
          switch (error) {
            case 'access_denied':
              errorMessage = 'Acesso negado pelo usuário';
              break;
            case 'invalid_request':
              errorMessage = 'Requisição inválida';
              break;
            case 'unauthorized_client':
              errorMessage = 'Cliente não autorizado';
              break;
            case 'unsupported_response_type':
              errorMessage = 'Tipo de resposta não suportado';
              break;
            case 'invalid_scope':
              errorMessage = 'Escopo inválido';
              break;
            case 'server_error':
              errorMessage = 'Erro interno do servidor TikTok';
              break;
            case 'temporarily_unavailable':
              errorMessage = 'Serviço temporariamente indisponível';
              break;
            default:
              if (errorDescription) {
                errorMessage = errorDescription;
              }
          }
          
          setError(errorMessage);
          setLoading(false);
          return;
        }

        // Verificar se temos o código de autorização
        if (!code) {
          setError('Código de autorização não encontrado');
          setLoading(false);
          return;
        }

        setStatus('Trocando código por token de acesso...');

        // Enviar código para o backend para trocar por access token
        const response = await axios.post(
          'http://localhost:5000/api/auth/callback',
          {
            code,
            state
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setStatus('Autenticação bem-sucedida! Redirecionando...');
          
          // Aguardar um pouco antes de redirecionar para mostrar a mensagem
          setTimeout(() => {
            navigate('/dashboard?auth=success');
          }, 1500);
        } else {
          setError(response.data.error || 'Erro desconhecido na autenticação');
          setLoading(false);
        }

      } catch (err: any) {
        console.error('Erro no callback de autenticação:', err);
        
        let errorMessage = 'Erro ao processar autenticação';
        
        if (err.response) {
          // Erro de resposta do servidor
          if (err.response.status === 400) {
            errorMessage = err.response.data?.error || 'Dados de autenticação inválidos';
          } else if (err.response.status === 401) {
            errorMessage = 'Token CSRF inválido ou expirado';
          } else if (err.response.status === 500) {
            errorMessage = 'Erro interno do servidor';
          } else {
            errorMessage = `Erro do servidor: ${err.response.status}`;
          }
        } else if (err.request) {
          // Erro de rede
          errorMessage = 'Erro de conexão com o servidor';
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-content">
          <div className="loading-animation">
            <div className="spinner"></div>
            <div className="tiktok-logo">🎵</div>
          </div>
          <h2>Conectando com TikTok</h2>
          <p className="status-message">{status}</p>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-content error-content">
          <div className="error-icon">❌</div>
          <h2>Erro na Autenticação</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="btn-retry">
              Tentar Novamente
            </button>
            <button onClick={handleGoHome} className="btn-home">
              Voltar ao Início
            </button>
          </div>
          <div className="error-help">
            <h4>Possíveis soluções:</h4>
            <ul>
              <li>Verifique se as credenciais do TikTok estão configuradas corretamente</li>
              <li>Certifique-se de que o servidor backend está rodando</li>
              <li>Tente limpar os cookies do navegador</li>
              <li>Verifique sua conexão com a internet</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Este estado não deveria ser alcançado, mas incluímos por segurança
  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        <h2>Processando...</h2>
        <p>Aguarde enquanto processamos sua autenticação.</p>
      </div>
    </div>
  );
};

export default AuthCallback;