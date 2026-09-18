import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BackupData } from '../types';
import { formatDate } from '../utils/printHelpers';
import { 
  Database, 
  Download, 
  Upload, 
  Cloud, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  FileJson, 
  FileSpreadsheet, 
  Clock, 
  RefreshCw, 
  X, 
  ExternalLink, 
  Save, 
  Phone,
  HardDrive,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DKLogo } from './DKLogo';

interface BackupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupManagerModal: React.FC<BackupManagerModalProps> = ({ isOpen, onClose }) => {
  const { 
    pecas, 
    vendas, 
    clientes, 
    consignacoes, 
    config, 
    updateConfig, 
    gerarBackupCompleto, 
    restaurarBackupCompleto 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'backup' | 'restaurar' | 'configuracoes'>('backup');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<BackupData | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  // Telefone de contato
  const [telefoneInput, setTelefoneInput] = useState(config.telefoneContato);
  const [telefoneEditando, setTelefoneEditando] = useState(false);
  const [telefoneSalvoMsg, setTelefoneSalvoMsg] = useState(false);

  // Frequência de backup
  const [frequencia, setFrequencia] = useState<'diario' | 'semanal' | 'desativado'>(
    config.frequenciaBackupAuto || 'diario'
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Gerar nome amigável com data e hora: backup-dk-semijoias-2026-09-17_10-30.json
  const getBackupFilename = (ext: string = 'json') => {
    const now = new Date();
    const dataStr = now.toISOString().split('T')[0];
    const horaStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    return `backup-dk-semijoias-${dataStr}_${horaStr}.${ext}`;
  };

  // 1. Download Local do Backup Completo JSON
  const handleDownloadBackup = () => {
    try {
      const backupObj = gerarBackupCompleto();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupObj, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', getBackupFilename('json'));
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      // Atualizar data do último backup
      const agoraStr = new Date().toISOString();
      updateConfig({ ultimoBackupEm: agoraStr });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao gerar backup:', err);
    }
  };

  // 2. Salvar no Google Drive
  const handleSaveToGoogleDrive = async () => {
    const backupObj = gerarBackupCompleto();
    const jsonBlob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const filename = getBackupFilename('json');

    // Tentar File System Access API se suportado para salvar direto na pasta do Google Drive
    if ('showSaveFilePicker' in window) {
      try {
        // @ts-expect-error - File System Access API experimental
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Backup do Banco de Dados DK Semijoias (JSON)',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonBlob);
        await writable.close();

        const agoraStr = new Date().toISOString();
        updateConfig({ ultimoBackupEm: agoraStr });
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
        return;
      } catch (err: unknown) {
        // Se usuário cancelou o seletor, não fazer nada
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    // Fallback padrão: Baixa o arquivo e abre o Google Drive para o lojista enviar
    handleDownloadBackup();
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  };

  // 3. Exportar Planilha CSV para conferência
  const handleExportCSV = () => {
    let csv = 'Tipo;Codigo;Descricao;Modelo/Banho;Preco Custo;Preco Venda;Qtd;Status\n';
    pecas.forEach(p => {
      csv += `PECA;${p.codigo};"${p.descricao}";${p.modelo};${p.valorCompra};${p.precoVenda};${p.quantidade};${p.status}\n`;
    });
    vendas.forEach(v => {
      csv += `VENDA;${v.id};"Venda para ${v.clienteNome}";${v.formaPagamento};-;${v.valorTotal};1;${v.statusPagamento}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getBackupFilename('csv'));
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 4. Manipular Upload do Arquivo de Restauração
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    setRestoreSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed: BackupData = JSON.parse(content);

        // Validar integridade básica do backup
        if (!parsed.dados || !Array.isArray(parsed.dados.pecas) || !Array.isArray(parsed.dados.vendas)) {
          throw new Error('Arquivo de backup inválido ou corrompido.');
        }

        setRestoreFile(parsed);
      } catch (err: unknown) {
        setRestoreError(err instanceof Error ? err.message : 'Falha ao processar o arquivo JSON.');
        setRestoreFile(null);
      }
    };
    reader.readAsText(file);
  };

  // 5. Executar Restauração
  const handleConfirmRestore = () => {
    if (!restoreFile) return;

    setRestoring(true);
    setTimeout(() => {
      const result = restaurarBackupCompleto(restoreFile);
      setRestoring(false);
      if (result.success) {
        setRestoreSuccess(result.message);
        setRestoreFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setRestoreError(result.message);
      }
    }, 400);
  };

  // Salvar Telefone de Contato
  const handleSalvarTelefone = () => {
    updateConfig({ telefoneContato: telefoneInput.trim() });
    setTelefoneEditando(false);
    setTelefoneSalvoMsg(true);
    setTimeout(() => setTelefoneSalvoMsg(false), 3000);
  };

  // Salvar Frequência
  const handleSalvarFrequencia = (novaFreq: 'diario' | 'semanal' | 'desativado') => {
    setFrequencia(novaFreq);
    updateConfig({ frequenciaBackupAuto: novaFreq });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-stone-100 p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-lg sm:text-xl text-stone-100">
                  Backup do Banco de Dados & Segurança
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Protegido
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Garante que o lojista nunca perca seus dados de vendas, estoque, clientes e consignações.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'backup'
                ? 'border-amber-600 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Fazer Backup (Google Drive & Local)</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurar')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'restaurar'
                ? 'border-amber-600 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar Banco</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'configuracoes'
                ? 'border-amber-600 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Telefone & Automação</span>
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* TAB 1: FAZER BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              
              {/* Card de Status do Banco de Dados */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Status do Banco de Dados da DK</span>
                  </div>
                  <div className="mt-1 text-xs text-stone-600">
                    Último backup realizado:{' '}
                    <span className="font-semibold text-stone-900">
                      {config.ultimoBackupEm ? formatDate(config.ultimoBackupEm.split('T')[0]) : 'Ainda não exportado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-stone-700 font-medium">
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">
                    💎 <strong>{pecas.length}</strong> peças
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">
                    🧾 <strong>{vendas.length}</strong> vendas
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">
                    👥 <strong>{clientes.length}</strong> clientes
                  </span>
                </div>
              </div>

              {/* Mensagem de Sucesso */}
              {downloadSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Arquivo de backup gerado e data de segurança atualizada com sucesso!</span>
                </div>
              )}

              {/* Opções de Backup: Google Drive vs Local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Opção 1: Google Drive */}
                <div className="p-5 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all group">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-900">
                      Salvar no Google Drive
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Exporta o banco e permite salvar na sua pasta sincronizada do Google Drive ou na nuvem para acesso de qualquer dispositivo.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveToGoogleDrive}
                    className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>Salvar no Google Drive</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
                </div>

                {/* Opção 2: Download Local Imediato (.JSON) */}
                <div className="p-5 bg-gradient-to-br from-stone-50 via-white to-amber-50/30 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all group">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-900">
                      Download Local Completo (.JSON)
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Gera um arquivo de segurança no seu computador ou celular contendo todas as peças, valores, clientes e histórico de parcelas.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadBackup}
                    className="mt-4 w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Arquivo de Backup</span>
                  </button>
                </div>

              </div>

              {/* Exportação Secundária para Excel / CSV */}
              <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-stone-500">
                  Precisa analisar os dados em planilhas?
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Exportar Planilha Excel/CSV (Estoque e Vendas)</span>
                </button>
              </div>

              {/* Dica de Segurança */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex items-start gap-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Recomendação de Segurança:</strong> Recomendamos fazer o download ou sincronização para o Google Drive ao final de cada dia de vendas para garantir total proteção contra formatações de aparelho ou limpeza de cache.
                </span>
              </div>

            </div>
          )}

          {/* TAB 2: RESTAURAR BANCO DE DADOS */}
          {activeTab === 'restaurar' && (
            <div className="space-y-5">
              
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Atenção antes de restaurar</span>
                </div>
                <p className="text-rose-800 leading-relaxed">
                  A restauração substituirá os registros atuais pelo conteúdo do arquivo de backup selecionado. Tenha certeza de escolher o arquivo correto.
                </p>
              </div>

              {/* Área de Seleção do Arquivo */}
              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-amber-500 hover:bg-amber-50/30 transition-all">
                <input
                  type="file"
                  accept=".json,application/json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="backup-file-upload"
                />
                <label htmlFor="backup-file-upload" className="cursor-pointer block space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-800 block">
                      Clique para selecionar o arquivo de backup (.JSON)
                    </span>
                    <span className="text-xs text-stone-400 block mt-0.5">
                      Arquivos no formato backup-dk-semijoias-*.json
                    </span>
                  </div>
                </label>
              </div>

              {/* Erro ao carregar arquivo */}
              {restoreError && (
                <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {/* Sucesso na restauração */}
              {restoreSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{restoreSuccess}</span>
                </div>
              )}

              {/* Prévia do que será restaurado */}
              {restoreFile && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
                  <div className="font-bold text-stone-900 flex items-center justify-between">
                    <span>Prévia dos Dados do Backup:</span>
                    <span className="text-[10px] text-stone-500">
                      Exportado em: {formatDate(restoreFile.exportadoEm?.split('T')[0] || '')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-400 block">Peças</span>
                      <strong className="text-stone-900 text-sm">{restoreFile.dados?.pecas?.length || 0}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-400 block">Vendas</span>
                      <strong className="text-stone-900 text-sm">{restoreFile.dados?.vendas?.length || 0}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-400 block">Clientes</span>
                      <strong className="text-stone-900 text-sm">{restoreFile.dados?.clientes?.length || 0}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-400 block">Consignações</span>
                      <strong className="text-stone-900 text-sm">{restoreFile.dados?.consignacoes?.length || 0}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setRestoreFile(null)}
                      className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmRestore}
                      disabled={restoring}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      {restoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Confirmar e Restaurar Banco</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: CONFIGURAÇÕES, TELEFONE & AUTOMAÇÃO */}
          {activeTab === 'configuracoes' && (
            <div className="space-y-6">
              
              {/* CAMPO DE TELEFONE DE CONTATO DA LOJA (COM SALVAR E ALTERAR) */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-sm text-stone-900">
                      Telefone Oficial de Contato (WhatsApp da Loja)
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
                    Visível ao Cliente
                  </span>
                </div>

                <p className="text-xs text-stone-500">
                  Este número de telefone/WhatsApp aparece automaticamente no Catálogo Vitrine, nos Recibos de Venda, nas Mensagens de Cobrança e nas Campanhas Promocionais.
                </p>

                {telefoneSalvoMsg && (
                  <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Telefone salvo e atualizado com sucesso em todo o sistema!</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  {telefoneEditando ? (
                    <>
                      <input
                        type="text"
                        value={telefoneInput}
                        onChange={(e) => setTelefoneInput(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-500"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSalvarTelefone}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Salvar Telefone</span>
                        </button>
                        <button
                          onClick={() => {
                            setTelefoneInput(config.telefoneContato);
                            setTelefoneEditando(false);
                          }}
                          className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between w-full p-3 bg-white rounded-xl border border-stone-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          WA
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-sm block">
                            {config.telefoneContato || 'Nenhum telefone configurado'}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Número ativo para atendimento e pedidos
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${config.telefoneContato.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                        >
                          Testar Link
                        </a>
                        <button
                          onClick={() => setTelefoneEditando(true)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Frequência de Backup Automático */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm text-stone-900">
                    Lembrete de Backup Automático
                  </h4>
                </div>
                <p className="text-xs text-stone-500">
                  O sistema alertará quando for o momento de baixar ou sincronizar uma nova cópia de segurança.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  {[
                    { id: 'diario', label: 'Diário (Recomendado)', desc: 'Ao final do dia' },
                    { id: 'semanal', label: 'Semanal', desc: 'A cada 7 dias' },
                    { id: 'desativado', label: 'Desativado', desc: 'Apenas manual' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSalvarFrequencia(opt.id as 'diario' | 'semanal' | 'desativado')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        frequencia === opt.id
                          ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-2xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-500">
            <DKLogo size="sm" showText={false} />
            <span>DK Semijoias • Gestão Segura de Dados</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
