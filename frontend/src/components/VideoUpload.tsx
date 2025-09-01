import React, { useState } from 'react';
import axios from 'axios';
import './VideoUpload.css';

interface VideoUploadProps {
  onUploadComplete?: (result: any) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(true);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo de vídeo
      if (!file.type.startsWith('video/')) {
        setError('Por favor, selecione um arquivo de vídeo válido.');
        return;
      }
      
      // Verificar tamanho do arquivo (máximo 4GB)
      const maxSize = 4 * 1024 * 1024 * 1024; // 4GB em bytes
      if (file.size > maxSize) {
        setError('O arquivo é muito grande. O tamanho máximo é 4GB.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo de vídeo.');
      return;
    }

    if (!videoTitle.trim()) {
      setError('Por favor, adicione um título para o vídeo.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Etapa 1: Inicializar upload
      setUploadProgress(10);
      const initResponse = await axios.post(
        `${API_URL}/api/video/upload/init`,
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: selectedFile.size,
            chunk_size: 10485760, // 10MB chunks
            total_chunk_count: Math.ceil(selectedFile.size / 10485760)
          }
        },
        { withCredentials: true }
      );

      if (!initResponse.data.data) {
        throw new Error('Falha ao inicializar upload');
      }

      const { upload_url, upload_id } = initResponse.data.data;
      setUploadProgress(20);

      // Etapa 2: Upload do arquivo
      const formData = new FormData();
      formData.append('video', selectedFile);

      await axios.put(upload_url, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              20 + (progressEvent.loaded / progressEvent.total) * 60
            );
            setUploadProgress(progress);
          }
        },
      });

      setUploadProgress(85);

      // Etapa 3: Publicar vídeo
      const publishResponse = await axios.post(
        `${API_URL}/api/video/publish`,
        {
          media_id: upload_id,
          post_info: {
            title: videoTitle,
            description: videoDescription,
            privacy_level: isPrivate ? 'PRIVATE_ACCOUNT' : 'PUBLIC_TO_EVERYONE',
            disable_duet: !allowDuet,
            disable_comment: !allowComments,
            disable_stitch: !allowStitch,
            video_cover_timestamp_ms: 1000
          }
        },
        { withCredentials: true }
      );

      setUploadProgress(100);
      setSuccess('Vídeo enviado com sucesso! Pode levar alguns minutos para aparecer no seu perfil.');
      
      // Reset form
      setSelectedFile(null);
      setVideoTitle('');
      setVideoDescription('');
      setUploadProgress(0);
      
      if (onUploadComplete) {
        onUploadComplete(publishResponse.data);
      }

    } catch (err: any) {
      console.error('Erro no upload:', err);
      
      let errorMessage = 'Erro ao fazer upload do vídeo';
      
      if (err.response?.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setVideoTitle('');
    setVideoDescription('');
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
    setIsPrivate(false);
    setAllowComments(true);
    setAllowDuet(true);
    setAllowStitch(true);
  };

  return (
    <div className="video-upload-container">
      <h3>Upload de Vídeo</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      <div className="upload-form">
        <div className="file-input-section">
          <label htmlFor="video-file" className="file-input-label">
            {selectedFile ? (
              <div className="file-selected">
                <span className="file-icon">🎬</span>
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="file-placeholder">
                <span className="upload-icon">📁</span>
                <p>Clique para selecionar um vídeo</p>
                <p className="file-hint">Formatos suportados: MP4, MOV, AVI (máx. 4GB)</p>
              </div>
            )}
          </label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
          />
        </div>
        
        {selectedFile && (
          <>
            <div className="form-group">
              <label htmlFor="video-title">Título do Vídeo *</label>
              <input
                id="video-title"
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Digite o título do seu vídeo"
                maxLength={150}
                disabled={uploading}
                className="form-input"
              />
              <span className="char-count">{videoTitle.length}/150</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="video-description">Descrição</label>
              <textarea
                id="video-description"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Descreva seu vídeo (opcional)"
                maxLength={2200}
                disabled={uploading}
                className="form-textarea"
                rows={4}
              />
              <span className="char-count">{videoDescription.length}/2200</span>
            </div>
            
            <div className="form-group">
              <h4>Configurações de Privacidade</h4>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  disabled={uploading}
                />
                <span>Vídeo privado</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  disabled={uploading}
                />
                <span>Permitir comentários</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowDuet}
                  onChange={(e) => setAllowDuet(e.target.checked)}
                  disabled={uploading}
                />
                <span>Permitir duetos</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowStitch}
                  onChange={(e) => setAllowStitch(e.target.checked)}
                  disabled={uploading}
                />
                <span>Permitir stitch</span>
              </label>
            </div>
            
            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  Enviando... {uploadProgress}%
                </p>
              </div>
            )}
            
            <div className="form-actions">
              <button
                onClick={resetForm}
                disabled={uploading}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !videoTitle.trim()}
                className="btn-primary"
              >
                {uploading ? 'Enviando...' : 'Publicar Vídeo'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;