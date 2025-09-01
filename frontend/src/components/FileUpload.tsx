import React, { useState, useRef } from 'react';
import './FileUpload.css';

interface UploadedFile {
    name: string;
    size: number;
    uploadDate: string;
}

const FileUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Carregar lista de arquivos ao montar o componente
    React.useEffect(() => {
        fetchUploadedFiles();
    }, []);

    const fetchUploadedFiles = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/verification-files', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setUploadedFiles(data.files || []);
            } else {
                console.error('Erro ao carregar arquivos');
            }
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Verificar se é um arquivo .txt
            if (!file.name.toLowerCase().endsWith('.txt')) {
                setUploadStatus('Erro: Apenas arquivos .txt são permitidos!');
                setSelectedFile(null);
                return;
            }
            
            // Verificar tamanho do arquivo (máximo 1MB)
            if (file.size > 1024 * 1024) {
                setUploadStatus('Erro: O arquivo deve ter no máximo 1MB!');
                setSelectedFile(null);
                return;
            }
            
            setSelectedFile(file);
            setUploadStatus('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus('Erro: Selecione um arquivo primeiro!');
            return;
        }

        setUploading(true);
        setUploadStatus('');

        try {
            const formData = new FormData();
            formData.append('verificationFile', selectedFile);

            const response = await fetch('http://localhost:5000/api/upload-verification', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus(`Sucesso: ${data.message}`);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // Recarregar lista de arquivos
                await fetchUploadedFiles();
            } else {
                setUploadStatus(`Erro: ${data.error || 'Falha no upload'}`);
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            setUploadStatus('Erro: Falha na comunicação com o servidor');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    return (
        <div className="file-upload-container">
            <div className="file-upload-header">
                <h2>Upload de Arquivo de Verificação</h2>
                <p>Envie o arquivo .txt gerado pelo TikTok Developer Portal para verificação do domínio.</p>
            </div>

            <div className="upload-section">
                <div className="file-input-section">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt"
                        onChange={handleFileSelect}
                        className="file-input"
                        id="verification-file"
                    />
                    <label htmlFor="verification-file" className="file-input-label">
                        {selectedFile ? selectedFile.name : 'Escolher arquivo .txt'}
                    </label>
                </div>

                {selectedFile && (
                    <div className="file-info">
                        <p><strong>Arquivo selecionado:</strong> {selectedFile.name}</p>
                        <p><strong>Tamanho:</strong> {formatFileSize(selectedFile.size)}</p>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className={`upload-button ${!selectedFile || uploading ? 'disabled' : ''}`}
                >
                    {uploading ? 'Enviando...' : 'Enviar Arquivo'}
                </button>

                {uploadStatus && (
                    <div className={`upload-status ${uploadStatus.startsWith('Sucesso') ? 'success' : 'error'}`}>
                        {uploadStatus}
                    </div>
                )}
            </div>

            <div className="uploaded-files-section">
                <h3>Arquivos Enviados</h3>
                {loading ? (
                    <p>Carregando arquivos...</p>
                ) : uploadedFiles.length > 0 ? (
                    <div className="files-list">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                <div className="file-details">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                    <span className="file-date">{formatDate(file.uploadDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-files">Nenhum arquivo de verificação enviado ainda.</p>
                )}
            </div>

            <div className="instructions">
                <h4>Instruções:</h4>
                <ol>
                    <li>Acesse o <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer">TikTok Developer Portal</a></li>
                    <li>Vá para as configurações da sua aplicação</li>
                    <li>Baixe o arquivo de verificação de domínio (.txt)</li>
                    <li>Faça o upload do arquivo aqui</li>
                    <li>O arquivo será salvo no servidor para verificação do domínio</li>
                </ol>
            </div>
        </div>
    );
};

export default FileUpload;