/**
 * Serviço de Integração Direta com a API do Google Drive v3 e Google Identity Services (GIS)
 * Cliente configurado: 465412689718-kp2jhvdtt81r1h8a8aracpqf4tvo1kaf.apps.googleusercontent.com
 * Escopo: https://www.googleapis.com/auth/drive.file
 */

import { BackupData } from '../types';

export const DEFAULT_GOOGLE_CLIENT_ID = 
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || 
  '465412689718-kp2jhvdtt81r1h8a8aracpqf4tvo1kaf.apps.googleusercontent.com';

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const STORAGE_TOKEN_KEY = 'dk_gdrive_access_token';
const STORAGE_EXPIRY_KEY = 'dk_gdrive_token_expires_at';
const STORAGE_USER_KEY = 'dk_gdrive_user_email';
const STORAGE_FOLDER_ID_KEY = 'dk_gdrive_folder_id';
const STORAGE_FOLDER_URL_KEY = 'dk_gdrive_folder_url';

export interface DriveAuthResult {
  accessToken: string;
  expiresIn: number;
  userEmail?: string;
}

export interface DriveFolderInfo {
  id: string;
  name: string;
  url: string;
}

export interface DriveUploadResult {
  sucesso: boolean;
  fileId?: string;
  fileName?: string;
  link?: string;
  folderUrl?: string;
  timestamp: string;
  mensagem: string;
}

/**
 * Obtém o token de acesso armazenado em cache se ainda for válido.
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  const expiresAt = localStorage.getItem(STORAGE_EXPIRY_KEY);

  if (!token || !expiresAt) return null;

  const expTime = parseInt(expiresAt, 10);
  // Se faltam menos de 60 segundos para expirar, considera inválido
  if (Date.now() >= expTime - 60000) {
    clearStoredAuthData();
    return null;
  }

  return token;
}

/**
 * Retorna o email da conta Google conectada atualmente (se houver)
 */
export function getStoredUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_USER_KEY);
}

/**
 * Retorna a URL da pasta de backup no Google Drive (se já criada/salva)
 */
export function getStoredFolderUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_FOLDER_URL_KEY);
}

/**
 * Salva as credenciais obtidas no localStorage
 */
export function storeAuthData(token: string, expiresInSeconds: number, email?: string) {
  if (typeof window === 'undefined') return;
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_EXPIRY_KEY, expiresAt.toString());
  if (email) {
    localStorage.setItem(STORAGE_USER_KEY, email);
  }
}

/**
 * Limpa as credenciais salvas do Google Drive
 */
export function clearStoredAuthData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_EXPIRY_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem(STORAGE_FOLDER_ID_KEY);
  localStorage.removeItem(STORAGE_FOLDER_URL_KEY);
}

/**
 * Espera o script do Google Identity Services (GSI) carregar na página ou o injeta dinamicamente.
 */
async function ensureGsiLoaded(maxWaitMs = 6000): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if ((window as any).google?.accounts?.oauth2) return true;

  // Se o script não estiver no head, adiciona dinamicamente
  if (typeof document !== 'undefined' && !document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      return true;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return typeof window !== 'undefined' && !!(window as any).google?.accounts?.oauth2;
}

/**
 * Solicita token de autorização ao usuário usando o Google Identity Services popup
 */
export async function solicitarAutorizacaoGoogleDrive(
  clientId?: string
): Promise<DriveAuthResult> {
  const activeClientId = (clientId && clientId.trim()) ? clientId.trim() : DEFAULT_GOOGLE_CLIENT_ID;

  const loaded = await ensureGsiLoaded();
  if (!loaded) {
    throw new Error('Script do Google Identity Services não carregou. Verifique sua conexão com a internet ou desbloqueadores de scripts.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: DRIVE_SCOPE,
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('Erro retornado pelo Google OAuth:', tokenResponse);
            let msg = tokenResponse.error_description || tokenResponse.error;
            if (tokenResponse.error === 'popup_closed_by_user') {
              msg = 'A janela de autorização do Google foi fechada antes da conclusão do login.';
            } else if (tokenResponse.error === 'access_denied') {
              msg = 'Acesso ao Google Drive não autorizado pelo usuário.';
            } else if (tokenResponse.error === 'idpiframe_initialization_failed' || String(msg).includes('origin')) {
              msg = 'Origem JavaScript não autorizada no Google Cloud Console. Verifique se o endereço da aplicação está nas origens autorizadas do Client ID.';
            }
            reject(new Error(msg));
            return;
          }

          const accessToken = tokenResponse.access_token;
          const expiresIn = parseInt(tokenResponse.expires_in || '3600', 10);

          // Tenta obter o usuário da conta via endpoint About da Drive API
          let userEmail = '';
          try {
            const aboutRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (aboutRes.ok) {
              const aboutData = await aboutRes.json();
              userEmail = aboutData?.user?.emailAddress || '';
            }
          } catch (err) {
            console.warn('Não foi possível obter email do usuário do Drive:', err);
          }

          storeAuthData(accessToken, expiresIn, userEmail);

          resolve({
            accessToken,
            expiresIn,
            userEmail
          });
        }
      });

      // Abre a janela de consentimento do Google
      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(new Error(err?.message || 'Falha ao iniciar cliente Google OAuth'));
    }
  });
}

/**
 * Busca ou cria a pasta "DK Semijóias - Backups Automáticos" no Google Drive
 */
export async function buscarOuCriarPastaDK(accessToken: string): Promise<DriveFolderInfo> {
  const cachedFolderId = localStorage.getItem(STORAGE_FOLDER_ID_KEY);
  const cachedFolderUrl = localStorage.getItem(STORAGE_FOLDER_URL_KEY);

  // Se já temos a pasta em cache, checa se ainda é válida
  if (cachedFolderId && cachedFolderUrl) {
    try {
      const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files/${cachedFolderId}?fields=id,name,trashed,webViewLink`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (checkRes.ok) {
        const fileData = await checkRes.json();
        if (!fileData.trashed) {
          return {
            id: cachedFolderId,
            name: fileData.name || 'DK Semijóias - Backups Automáticos',
            url: fileData.webViewLink || cachedFolderUrl
          };
        }
      }
    } catch {
      // Ignora erro e continua para re-buscar
    }
  }

  const folderName = 'DK Semijóias - Backups Automáticos';
  const query = encodeURIComponent(`mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`);
  
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (searchRes.status === 401) {
    clearStoredAuthData();
    throw new Error('Sessão do Google Drive expirada. Por favor, conecte novamente.');
  }

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      const folder = data.files[0];
      const info: DriveFolderInfo = {
        id: folder.id,
        name: folder.name,
        url: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`
      };
      localStorage.setItem(STORAGE_FOLDER_ID_KEY, info.id);
      localStorage.setItem(STORAGE_FOLDER_URL_KEY, info.url);
      return info;
    }
  }

  // Se não encontrou, cria a pasta na raiz do Drive
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Pasta de sincronização automática e backups em tempo real do sistema DK Semijóias'
    })
  });

  if (createRes.status === 401) {
    clearStoredAuthData();
    throw new Error('Sessão expirada ao criar pasta. Reconecte o Google Drive.');
  }

  if (!createRes.ok) {
    throw new Error(`Falha ao criar pasta de backups no Google Drive (HTTP ${createRes.status})`);
  }

  const newFolder = await createRes.json();
  const info: DriveFolderInfo = {
    id: newFolder.id,
    name: newFolder.name,
    url: newFolder.webViewLink || `https://drive.google.com/drive/folders/${newFolder.id}`
  };

  localStorage.setItem(STORAGE_FOLDER_ID_KEY, info.id);
  localStorage.setItem(STORAGE_FOLDER_URL_KEY, info.url);
  return info;
}

/**
 * Salva ou atualiza o arquivo de backup no Google Drive
 */
export async function salvarBackupNoGoogleDrive(
  backupData: BackupData,
  operacaoNome: string
): Promise<DriveUploadResult> {
  const token = getStoredAccessToken();
  const timestamp = new Date().toISOString();

  if (!token) {
    return {
      sucesso: false,
      timestamp,
      mensagem: 'Sessão do Google Drive expirada ou não conectada. Conecte sua conta do Google Drive para backup automático.'
    };
  }

  try {
    // 1. Garante a pasta no Drive
    const pasta = await buscarOuCriarPastaDK(token);

    // 2. Busca se o arquivo principal "backup-dk-automatico.json" já existe na pasta
    const fileName = 'backup-dk-automatico.json';
    const query = encodeURIComponent(`name = '${fileName}' and '${pasta.id}' in parents and trashed = false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (searchRes.status === 401) {
      clearStoredAuthData();
      throw new Error('Sessão expirada no Google Drive. Conecte novamente sua conta.');
    }

    let targetFileId: string | null = null;
    let fileLink = '';

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        targetFileId = searchData.files[0].id;
        fileLink = searchData.files[0].webViewLink || '';
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2);

    if (targetFileId) {
      // 3. Atualiza o arquivo existente com o novo snapshot
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${targetFileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: jsonString
      });

      if (uploadRes.status === 401) {
        clearStoredAuthData();
        throw new Error('Sessão expirada durante upload. Conecte novamente sua conta Google.');
      }

      if (!uploadRes.ok) {
        throw new Error(`Falha ao atualizar arquivo no Drive (HTTP ${uploadRes.status})`);
      }

      return {
        sucesso: true,
        fileId: targetFileId,
        fileName,
        link: fileLink || pasta.url,
        folderUrl: pasta.url,
        timestamp,
        mensagem: `Sincronizado com sucesso no Google Drive (${operacaoNome})`
      };
    } else {
      // 4. Cria o arquivo na pasta
      const metaRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fileName,
          parents: [pasta.id],
          mimeType: 'application/json',
          description: 'Backup automático atualizado a cada operação da DK Semijóias'
        })
      });

      if (metaRes.status === 401) {
        clearStoredAuthData();
        throw new Error('Sessão expirada ao criar arquivo. Conecte novamente sua conta Google.');
      }

      if (!metaRes.ok) {
        throw new Error(`Falha ao criar metadados do arquivo no Drive (HTTP ${metaRes.status})`);
      }

      const fileMeta = await metaRes.json();
      targetFileId = fileMeta.id;
      fileLink = fileMeta.webViewLink || '';

      // Upload do conteúdo
      const contentRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${targetFileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: jsonString
      });

      if (contentRes.status === 401) {
        clearStoredAuthData();
        throw new Error('Sessão expirada ao gravar dados. Conecte novamente sua conta Google.');
      }

      if (!contentRes.ok) {
        throw new Error(`Falha ao enviar dados do arquivo para o Drive (HTTP ${contentRes.status})`);
      }

      return {
        sucesso: true,
        fileId: targetFileId,
        fileName,
        link: fileLink || pasta.url,
        folderUrl: pasta.url,
        timestamp,
        mensagem: `Novo arquivo de backup criado e sincronizado no Google Drive na pasta "${pasta.name}"`
      };
    }
  } catch (err: any) {
    console.error('Erro na sincronização com Google Drive:', err);
    return {
      sucesso: false,
      timestamp,
      mensagem: `Erro no Google Drive: ${err?.message || 'Falha de conexão'}`
    };
  }
}
