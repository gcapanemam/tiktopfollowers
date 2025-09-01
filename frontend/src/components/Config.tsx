import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Config.css';

interface ConfigData {
  hasClientKey: boolean;
  hasClientSecret: boolean;
  redirectUri: string;
  configured: boolean;
}

interface ConfigFormData {
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
}

const Config: React.FC = () => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [formData, setFormData] = useState<ConfigFormData>({
    clientKey: '',
    clientSecret: '',
    redirectUri: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/config`);
      setConfig(response.data);
      setFormData(prev => ({
        ...prev,
        redirectUri: response.data.redirectUri || ''
      }));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_URL}/api/config`, formData);
      setMessage({ type: 'success', text: response.data.message });
      await fetchConfig(); // Recarregar configurações
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao salvar configurações';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="config-container">
        <div className="loading">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="config-container">
      <div className="config-header">
        <h1>Configurações do TikTok</h1>
        <p>Configure suas credenciais da API do TikTok para usar a aplicação.</p>
      </div>

      <div className="config-status">
        <h3>Status da Configuração</h3>
        <div className={`status-item ${config?.hasClientKey ? 'configured' : 'missing'}`}>
          <span className="status-icon">{config?.hasClientKey ? '✅' : '❌'}</span>
          <span>Client Key: {config?.hasClientKey ? 'Configurado' : 'Não configurado'}</span>
        </div>
        <div className={`status-item ${config?.hasClientSecret ? 'configured' : 'missing'}`}>
          <span className="status-icon">{config?.hasClientSecret ? '✅' : '❌'}</span>
          <span>Client Secret: {config?.hasClientSecret ? 'Configurado' : 'Não configurado'}</span>
        </div>
        <div className={`status-item ${config?.configured ? 'configured' : 'missing'}`}>
          <span className="status-icon">{config?.configured ? '✅' : '❌'}</span>
          <span>Status Geral: {config?.configured ? 'Configurado' : 'Configuração incompleta'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="config-form">
        <h3>Configurar Credenciais</h3>
        
        <div className="form-group">
          <label htmlFor="clientKey">Client Key *</label>
          <input
            type="text"
            id="clientKey"
            name="clientKey"
            value={formData.clientKey}
            onChange={handleInputChange}
            placeholder="Insira seu TikTok Client Key"
            required
          />
          <small>Obtido no TikTok for Developers</small>
        </div>

        <div className="form-group">
          <label htmlFor="clientSecret">Client Secret *</label>
          <input
            type="password"
            id="clientSecret"
            name="clientSecret"
            value={formData.clientSecret}
            onChange={handleInputChange}
            placeholder="Insira seu TikTok Client Secret"
            required
          />
          <small>Mantenha este valor seguro e privado</small>
        </div>

        <div className="form-group">
          <label htmlFor="redirectUri">Redirect URI</label>
          <input
            type="url"
            id="redirectUri"
            name="redirectUri"
            value={formData.redirectUri}
            onChange={handleInputChange}
            placeholder="http://localhost:5000/auth/tiktok/callback"
          />
          <small>URL de callback para autenticação OAuth</small>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={saving} className="submit-button">
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>

      <div className="config-help">
        <h3>Como obter as credenciais?</h3>
        <ol>
          <li>Acesse <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer">TikTok for Developers</a></li>
          <li>Faça login com sua conta TikTok</li>
          <li>Crie uma nova aplicação ou acesse uma existente</li>
          <li>Copie o Client Key e Client Secret</li>
          <li>Configure a Redirect URI no painel do TikTok</li>
        </ol>
      </div>
    </div>
  );
};

export default Config;