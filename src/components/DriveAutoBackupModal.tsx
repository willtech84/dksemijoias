import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cloud, 
  CheckCircle2, 
  FolderCheck, 
  ExternalLink, 
  Download, 
  Upload, 
  RefreshCw, 
  X, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Key,
  Copy,
  Check,
  Sparkles,
  Info,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BackupData } from '../types';
import { DEFAULT_GOOGLE_CLIENT_ID } from '../services/googleDriveService';

interface DriveAutoBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveAutoBackupModal: React.FC<DriveAutoBackupModalProps> = ({ isOpen, onClose }) => {
  const { 
    config, 
    updateConfig, 
    gerarBackupCompleto,
    restaurarBackupCompleto,
    logsBackupDrive,
    driveConectado,
    driveNomePasta,
    driveContaEmail,
    driveFolderUrl,
    driveOAuthConectado,
    conectarGoogleDriveOAuth,
    desconectarGoogleDriveOAuth,
    conectarPastaGoogleDrive,
    desconectarPastaGoogleDrive,
    triggerBackupOperacao
  } = useApp();

  const [salvandoManual, setSalvandoManual] = useState(false);
  const [conectandoOAuth, setConectandoOAuth] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);
  
  // Customização do Client ID
  const [clientIdInput, setClientIdInput] = useState(config.googleClientId || DEFAULT_GOOGLE_CLIENT_ID);
  const [mostrarConfigAvancada, setMostrarConfigAvancada] = useState(false);
  const [copiouOrigem, setCopiouOrigem] = useState(false);

  // Estados para restauração
  const [arquivoRestaurar, setArquivoRestaurar] = useState<BackupData | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [restaurando, setRestaurando] = useState(false);

  if (!isOpen) return null;

  const autoBackupAtivo = config.backupAutomaticoEmOperacoes !== false;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://dksemijoias.ai.studio';

  const handleToggleAutoBackup = () => {
    updateConfig({
      backupAutomaticoEmOperacoes: !autoBackupAtivo
    });
  };

  const handleSalvarClientId = () => {
    const trimmed = clientIdInput.trim();
    updateConfig({
      googleClientId: trimmed || DEFAULT_GOOGLE_CLIENT_ID
    });
    setFeedbackMsg({
      tipo: 'sucesso',
      texto: 'Client ID do Google Drive atualizado com sucesso!'
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleCopiarOrigem = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiouOrigem(true);
      setTimeout(() => setCopiouOrigem(false), 2000);
    }
  };

  const handleConectarOAuthGoogleDrive = async () => {
    setConectandoOAuth(true);
    setFeedbackMsg(null);
    try {
      const activeClientId = clientIdInput.trim() || config.googleClientId || DEFAULT_GOOGLE_CLIENT_ID;
      const res = await conectarGoogleDriveOAuth(activeClientId);
      if (res.sucesso) {
        setFeedbackMsg({
          tipo: 'sucesso',
          texto: res.mensagem
        });
      } else {
        setFeedbackMsg({
          tipo: 'erro',
          texto: res.mensagem
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: err?.message || 'Falha ao autenticar com o Google Drive.'
      });
    } finally {
      setConectandoOAuth(false);
    }
  };

  const handleConectarPastaLocal = async () => {
    try {
      const ok = await conectarPastaGoogleDrive();
      if (ok) {
        setFeedbackMsg({
          tipo: 'sucesso',
          texto: 'Pasta física do Google Drive vinculada no computador com sucesso!'
        });
      }
    } catch (e: any) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: e?.message || 'Não foi possível vincular a pasta física.'
      });
    }
  };

  const handleForcarBackupAgora = async () => {
    setSalvandoManual(true);
    await triggerBackupOperacao('Backup instantâneo forçado pelo usuário');
    setSalvandoManual(false);
    setFeedbackMsg({
      tipo: 'sucesso',
      texto: 'Backup forçado realizado e sincronizado com sucesso!'
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDownloadArquivoJson = () => {
    const backup = gerarBackupCompleto();
    const dataHora = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const nome = `backup-dk-semijoias-${dataHora}.json`;
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setFeedbackMsg({
      tipo: 'sucesso',
      texto: `Arquivo ${nome} baixado com sucesso no seu computador!`
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSelecionarArquivoRestaurar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomeArquivo(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.dados && parsed.dados.pecas) {
          setArquivoRestaurar(parsed);
          setFeedbackMsg(null);
        } else {
          setFeedbackMsg({ tipo: 'erro', texto: 'Arquivo não possui formato de backup válido da DK Semijoias.' });
        }
      } catch {
        setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao ler arquivo JSON. Verifique se o arquivo está corrompido.' });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmarRestauracao = () => {
    if (!arquivoRestaurar) return;
    setRestaurando(true);
    const resultado = restaurarBackupCompleto(arquivoRestaurar);
    setRestaurando(false);
    if (resultado.success) {
      setFeedbackMsg({ tipo: 'sucesso', texto: resultado.message });
      setArquivoRestaurar(null);
      setNomeArquivo('');
    } else {
      setFeedbackMsg({ tipo: 'erro', texto: resultado.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white max-w-4xl w-full rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                  Integração Google Drive
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Automático em Cada Operação
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-serif-luxury text-stone-100">
                Cliente Google Drive & Sincronização Automática
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`px-5 py-2.5 text-xs font-medium flex items-center gap-2 border-b ${
            feedbackMsg.tipo === 'sucesso' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : feedbackMsg.tipo === 'info'
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {feedbackMsg.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedbackMsg.tipo === 'info' ? (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.texto}</span>
          </div>
        )}

        {/* Conteúdo com Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* PAINEL PRINCIPAL: CONEXÃO COM CLIENTE GOOGLE DRIVE */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-stone-100 p-5 rounded-2xl border border-stone-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800/80">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${driveOAuthConectado ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-200 block">
                    {driveOAuthConectado ? 'Google Drive Nuvem: Conectado & Ativo' : 'Google Drive: Pronto para Conectar'}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Cliente ID configurado: <code className="text-amber-300 font-mono text-[10px]">465412689718-kp2jhvdtt81r1h8a8aracpqf4tvo1kaf...</code>
                  </span>
                </div>
              </div>

              {/* Toggle de Auto Backup */}
              <button
                onClick={handleToggleAutoBackup}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 transition-colors text-stone-200 shrink-0 self-start sm:self-auto"
              >
                {autoBackupAtivo ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Backup em Cada Ação: <strong>LIGADO</strong></span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-stone-400" />
                    <span>Backup em Cada Ação: <strong>PAUSADO</strong></span>
                  </>
                )}
              </button>
            </div>

            {/* SE CONECTADO COM GOOGLE OAUTH */}
            {driveOAuthConectado ? (
              <div className="bg-stone-800/80 rounded-xl p-4 border border-emerald-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Conta Google Conectada: {driveContaEmail || 'Autorizada com Sucesso'}</span>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      Pasta de destino no Drive: <strong>DK Semijóias - Backups Automáticos</strong> (arquivo <code>backup-dk-automatico.json</code> sincronizado em cada clique).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={driveFolderUrl || 'https://drive.google.com/drive/my-drive'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-[11px] shadow-xs"
                    >
                      <span>Abrir no Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={desconectarGoogleDriveOAuth}
                      className="px-3 py-1.5 bg-stone-700 hover:bg-rose-900/60 hover:text-rose-300 text-stone-300 font-medium rounded-lg transition-colors text-[11px]"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* SE NÃO CONECTADO: BOTÃO DE 1 CLIQUE */
              <div className="bg-stone-800/80 rounded-xl p-4 border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>Conectar com sua Conta Google com 1 Clique</span>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      Autorize a sincronização direta com o seu Google Drive através do Client ID configurado. O sistema criará a pasta exclusiva <strong>"DK Semijóias - Backups Automáticos"</strong> e atualizará automaticamente seu estoque, vendas e clientes a cada ação.
                    </p>
                  </div>

                  <button
                    onClick={handleConectarOAuthGoogleDrive}
                    disabled={conectandoOAuth}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {conectandoOAuth ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" />
                        <span>Conectar Google Drive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Estatísticas Rápidas do Backup */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/60">
                <span className="text-[10px] text-stone-400 block">Backups Realizados Hoje:</span>
                <span className="text-xl font-bold font-serif-luxury text-amber-400">
                  {config.totalBackupsRealizadosHoje || 0}
                </span>
              </div>

              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/60">
                <span className="text-[10px] text-stone-400 block">Última Operação Salva:</span>
                <span className="text-xs font-bold text-stone-200 block truncate" title={config.ultimoBackupOperacaoNome}>
                  {config.ultimoBackupOperacaoNome || 'Inicialização do Sistema'}
                </span>
              </div>

              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/60 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-stone-400 block">Horário da Última Cópia:</span>
                <span className="text-xs font-bold text-stone-200 block">
                  {config.ultimoBackupOperacaoData || 'Agora mesmo'}
                </span>
              </div>
            </div>

            {/* Detalhe Explicativo */}
            <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-950/40 p-3 rounded-lg border border-stone-800/60">
              ✨ <strong>Backup contínuo a prova de falhas:</strong> A cada peça cadastrada, venda finalizada, baixa de parcela, cliente adicionado ou consignação movimentada, um snapshot completo do seu banco de dados é gerado em milissegundos e enviado ao Google Drive, garantindo proteção total e restauração instantânea a qualquer momento.
            </p>
          </div>

          {/* CONFIGURAÇÃO AVANÇADA DO CLIENT ID & ORIGEM (ACCORDION) */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
            <button
              onClick={() => setMostrarConfigAvancada(!mostrarConfigAvancada)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-100 transition-colors"
            >
              <div className="flex items-center gap-2 text-stone-800 font-bold">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Credenciais do Cliente OAuth 2.0 (Google Cloud Console)</span>
              </div>
              <div className="flex items-center gap-2 text-stone-500 text-[11px]">
                <span>{mostrarConfigAvancada ? 'Ocultar detalhes' : 'Ver / Editar Client ID'}</span>
                {mostrarConfigAvancada ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {mostrarConfigAvancada && (
              <div className="p-4 border-t border-stone-200 space-y-4 bg-white">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Google Client ID (Web Application):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      placeholder="seu-client-id.apps.googleusercontent.com"
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono text-stone-900 font-semibold bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={handleSalvarClientId}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
                    >
                      Salvar ID
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Configurado para o projeto <strong>dksemijoias</strong>.
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2 text-[11px] text-amber-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    <span>Origem JavaScript Autorizada no Google Cloud Console:</span>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    No painel do Google Cloud (APIs e Serviços → Credenciais → Seu Cliente OAuth), certifique-se de que a origem abaixo está em <em>"Origens JavaScript autorizadas"</em>:
                  </p>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-amber-300 font-mono text-[10px]">
                    <span>{currentOrigin}</span>
                    <button
                      onClick={handleCopiarOrigem}
                      className="flex items-center gap-1 text-amber-800 hover:text-amber-950 font-sans font-semibold text-[10px] ml-2"
                    >
                      {copiouOrigem ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiouOrigem ? 'Copiado!' : 'Copiar URL'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-700">
                    Origens configuradas no seu arquivo de credenciais: <code>https://dksemijoias.ai.studio</code>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* HISTÓRICO EM TEMPO REAL: ÚLTIMAS OPERAÇÕES SALVAS */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-bold uppercase tracking-wider text-stone-800">
                  Log de Operações Recentes Sincronizadas
                </span>
              </div>

              <button
                onClick={handleForcarBackupAgora}
                disabled={salvandoManual}
                className="px-3 py-1.5 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors text-[11px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${salvandoManual ? 'animate-spin' : ''}`} />
                <span>{salvandoManual ? 'Enviando...' : 'Forçar Backup Agora'}</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-stone-100 border border-stone-100 rounded-xl">
              {logsBackupDrive && logsBackupDrive.length > 0 ? (
                logsBackupDrive.map((log) => (
                  <div key={log.id} className="p-2.5 flex items-center justify-between text-[11px] hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <strong className="text-stone-800 block">{log.operacao}</strong>
                        <span className="text-stone-500 text-[10px]">{log.detalhes}</span>
                      </div>
                    </div>
                    <span className="text-stone-400 text-[10px] font-mono shrink-0 ml-2">
                      {log.dataHora}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-stone-400 text-xs">
                  Nenhum registro de backup recente ainda.
                </div>
              )}
            </div>
          </div>

          {/* FERRAMENTAS ADICIONAIS: PASTA LOCAL E DOWNLOAD MANUAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Opção de Pasta Local no Computador */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <FolderCheck className="w-4 h-4 text-blue-600" />
                <span>Vincular Pasta Local no Computador</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Se você utiliza o aplicativo <em>Google Drive para Desktop</em> no seu computador, pode selecionar a pasta local para gravação redundante de arquivo físico.
              </p>
              {driveNomePasta ? (
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold text-[11px]">
                  <span>Pasta: {driveNomePasta}</span>
                  <button
                    onClick={desconectarPastaGoogleDrive}
                    className="text-rose-600 hover:underline text-[10px]"
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConectarPastaLocal}
                  className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-300 font-semibold rounded-lg text-stone-700 flex items-center justify-center gap-2 w-full transition-colors text-[11px]"
                >
                  <FolderCheck className="w-3.5 h-3.5" />
                  <span>Escolher Pasta Local do Drive</span>
                </button>
              )}
            </div>

            {/* Download Manual e Restauração */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Download Manual do Backup (JSON)</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Baixe um arquivo cópia instantâneo com todos os dados (estoque, clientes, vendas, parcelas) para guardar em pendrive ou outro local seguro.
              </p>
              <button
                onClick={handleDownloadArquivoJson}
                className="px-3 py-2 bg-stone-900 hover:bg-stone-800 font-bold rounded-lg text-white flex items-center justify-center gap-2 w-full transition-colors text-[11px] shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Arquivo de Backup Completo</span>
              </button>
            </div>

          </div>

          {/* RESTAURAÇÃO DE BACKUP */}
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <Upload className="w-4 h-4 text-rose-600" />
              <span>Restaurar Backup do Sistema</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Caso precise restaurar seus dados de uma cópia anterior gerada pelo Google Drive ou baixada manualmente, selecione o arquivo JSON correspondente.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="flex-1 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-700 font-semibold cursor-pointer hover:bg-stone-50 transition-colors text-center text-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{nomeArquivo || 'Selecionar Arquivo de Backup (JSON)'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleSelecionarArquivoRestaurar}
                  className="hidden"
                />
              </label>

              {arquivoRestaurar && (
                <button
                  onClick={handleConfirmarRestauracao}
                  disabled={restaurando}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors shadow-xs shrink-0 text-xs disabled:opacity-50"
                >
                  {restaurando ? 'Restaurando...' : 'Confirmar Restauração'}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${driveOAuthConectado ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>
              DK Semijoias • Google Drive OAuth 2.0 ({driveOAuthConectado ? 'Sincronização Ativa' : 'Pronto para Conectar'})
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
