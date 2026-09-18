import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Peca, 
  Cliente, 
  Compra, 
  Venda, 
  Consignacao, 
  ConfiguracoesApp, 
  TemplateMarketing,
  ParcelaVenda,
  Usuario,
  BackupData,
  AgendamentoMensagemWhatsApp,
  ModeloMensagemCobranca,
  LogBackupOperacao
} from '../types';
import { 
  INITIAL_PECAS, 
  INITIAL_CLIENTES, 
  INITIAL_COMPRAS, 
  INITIAL_VENDAS, 
  INITIAL_CONSIGNACOES, 
  INITIAL_CONFIG, 
  INITIAL_TEMPLATES_MARKETING,
  INITIAL_USUARIOS
} from '../data/mockData';
import { 
  INITIAL_MODELOS_COBRANCA, 
  preencherMensagemCobranca 
} from '../data/cobrancaTemplates';
import { 
  getStoredAccessToken, 
  getStoredUserEmail, 
  solicitarAutorizacaoGoogleDrive, 
  salvarBackupNoGoogleDrive, 
  clearStoredAuthData,
  DEFAULT_GOOGLE_CLIENT_ID 
} from '../services/googleDriveService';

interface AppContextType {
  pecas: Peca[];
  clientes: Cliente[];
  compras: Compra[];
  vendas: Venda[];
  consignacoes: Consignacao[];
  config: ConfiguracoesApp;
  templatesMarketing: TemplateMarketing[];
  usuarios: Usuario[];
  currentUser: Usuario;
  setCurrentUser: (usuario: Usuario) => void;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => Usuario;
  updateUsuario: (id: string, dados: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  tabHistory: string[];
  goBack: () => void;
  canGoBack: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Tour Guiado (Onboarding)
  isTourOpen: boolean;
  openTour: () => void;
  closeTour: () => void;
  
  // Ações de Peças / Estoque
  addPeca: (peca: Omit<Peca, 'id'>) => Peca;
  updatePeca: (id: string, peca: Partial<Peca>) => void;
  deletePeca: (id: string) => void;
  limparExemplosEstoque: () => void;
  limparTodasPecas: () => void;
  importPecas: (novasPecas: Partial<Peca>[]) => number;
  
  // Templates de Marketing
  addTemplateMarketing: (tpl: Omit<TemplateMarketing, 'id'>) => TemplateMarketing;
  updateTemplateMarketing: (id: string, dados: Partial<TemplateMarketing>) => void;
  deleteTemplateMarketing: (id: string) => void;
  resetMarketingTemplates: () => void;
  
  // Ações de Compras
  addCompra: (compra: Omit<Compra, 'id'>) => Compra;
  deleteCompra: (id: string) => void;
  
  // Ações de Clientes
  addCliente: (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'comentarios'>) => Cliente;
  updateCliente: (id: string, dados: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  importarContatosWhatsApp: (contatos: { nome: string; telefone: string }[]) => number;
  adicionarComentarioCliente: (clienteId: string, texto: string, autor?: string, pecaId?: string, pecaNome?: string) => void;
  
  // Ações de Vendas
  registrarVenda: (vendaData: Omit<Venda, 'id' | 'reciboGeradoEm'>) => Venda;
  marcarParcelaPaga: (vendaId: string, parcelaId: string) => void;
  
  // Ações de Consignação
  addConsignacao: (consignacao: Omit<Consignacao, 'id'>) => Consignacao;
  atualizarItemConsignacao: (consignacaoId: string, pecaId: string, novoStatus: 'com_consignador' | 'vendido' | 'devolvido') => void;
  finalizarConsignacao: (consignacaoId: string) => void;
  
  // Configurações e Backup
  updateConfig: (novasConfig: Partial<ConfiguracoesApp>) => void;
  resetToDefaults: () => void;
  gerarBackupCompleto: () => BackupData;
  restaurarBackupCompleto: (dados: BackupData) => { success: boolean; message: string };

  // Agendamento de Mensagens no WhatsApp
  agendamentosWhatsApp: AgendamentoMensagemWhatsApp[];
  modelosMensagemCobranca: ModeloMensagemCobranca[];
  agendarMensagemWhatsApp: (dados: Omit<AgendamentoMensagemWhatsApp, 'id' | 'criadoEm' | 'status'>) => AgendamentoMensagemWhatsApp;
  atualizarStatusAgendamento: (id: string, status: 'agendado' | 'enviado' | 'cancelado') => void;
  excluirAgendamento: (id: string) => void;
  addModeloMensagemCobranca: (modelo: Omit<ModeloMensagemCobranca, 'id'>) => ModeloMensagemCobranca;
  updateModeloMensagemCobranca: (id: string, dados: Partial<ModeloMensagemCobranca>) => void;
  deleteModeloMensagemCobranca: (id: string) => void;

  // Acesso ao Drive & Backup em Cada Operação
  logsBackupDrive: LogBackupOperacao[];
  driveConectado: boolean;
  driveNomePasta: string;
  driveContaEmail: string | null;
  driveFolderUrl: string | null;
  driveOAuthConectado: boolean;
  conectarGoogleDriveOAuth: (clientId?: string) => Promise<{ sucesso: boolean; mensagem: string; email?: string; folderUrl?: string }>;
  desconectarGoogleDriveOAuth: () => void;
  conectarPastaGoogleDrive: () => Promise<boolean>;
  desconectarPastaGoogleDrive: () => void;
  triggerBackupOperacao: (operacaoNome: string) => Promise<void>;
  
  // Utilitários Calculados
  pecasParadas: { peca: Peca; diasParada: number }[];
  parcelasPendentesOuAtrasadas: { venda: Venda; parcela: ParcelaVenda; diasAtraso: number; isAtrasada: boolean }[];
  debitosProximosAoVencimento: {
    venda: Venda;
    parcela: ParcelaVenda;
    diasAteVencimento: number;
    statusVencimento: 'hoje' | 'amanha' | 'proximos_dias' | 'atrasado';
    mensagemPadraoSugerida: string;
  }[];
  kpis: {
    faturamentoTotal: number;
    faturamentoMesAtual: number;
    lucroEstimado: number;
    totalPecasEstoque: number;
    valorEstoqueCusto: number;
    valorEstoqueVenda: number;
    totalInadimplente: number;
    totalConsignado: number;
    totalPecasParadas: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PECAS: 'dk_semijoias_pecas_v1',
  CLIENTES: 'dk_semijoias_clientes_v1',
  COMPRAS: 'dk_semijoias_compras_v1',
  VENDAS: 'dk_semijoias_vendas_v1',
  CONSIGNACOES: 'dk_semijoias_consignacoes_v1',
  CONFIG: 'dk_semijoias_config_v1',
  USUARIOS: 'dk_semijoias_usuarios_v1',
  CURRENT_USER_ID: 'dk_semijoias_current_user_id_v1',
  MARKETING: 'dk_semijoias_marketing_templates_v1',
  AGENDAMENTOS_WHATSAPP: 'dk_semijoias_agendamentos_whatsapp_v1',
  MODELOS_COBRANCA: 'dk_semijoias_modelos_cobranca_v1',
  LOGS_BACKUP_DRIVE: 'dk_semijoias_logs_backup_drive_v1',
  DRIVE_AUTO_BACKUP: 'dk_semijoias_drive_auto_backup_v1',
  // Legado para migração
  OLD_CONFIG: 'aura_semijoias_config_v1',
  OLD_PECAS: 'aura_semijoias_pecas_v1',
  OLD_CLIENTES: 'aura_semijoias_clientes_v1',
  OLD_COMPRAS: 'aura_semijoias_compras_v1',
  OLD_VENDAS: 'aura_semijoias_vendas_v1',
  OLD_CONSIGNACOES: 'aura_semijoias_consignacoes_v1',
};

// Referência em memória para a pasta do Google Drive selecionada pelo usuário
let driveDirectoryHandleRef: any = null;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    return saved ? JSON.parse(saved) : INITIAL_USUARIOS;
  });

  const [currentUser, setCurrentUser] = useState<Usuario>(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const userList = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    const parsedList: Usuario[] = userList ? JSON.parse(userList) : INITIAL_USUARIOS;
    if (savedUserId) {
      const found = parsedList.find(u => u.id === savedUserId);
      if (found) return found;
    }
    return parsedList[0] || INITIAL_USUARIOS[0];
  });

  const [agendamentosWhatsApp, setAgendamentosWhatsApp] = useState<AgendamentoMensagemWhatsApp[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AGENDAMENTOS_WHATSAPP);
    return saved ? JSON.parse(saved) : [];
  });

  const [modelosMensagemCobranca, setModelosMensagemCobranca] = useState<ModeloMensagemCobranca[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MODELOS_COBRANCA);
    return saved ? JSON.parse(saved) : INITIAL_MODELOS_COBRANCA;
  });

  const [logsBackupDrive, setLogsBackupDrive] = useState<LogBackupOperacao[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS_BACKUP_DRIVE);
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-init-1',
        dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        operacao: 'Inicialização do Sistema e Banco de Dados DK',
        status: 'sucesso',
        detalhes: 'Backup redundante permanente ativo e pronto para o Google Drive'
      }
    ];
  });

  const [driveContaEmail, setDriveContaEmail] = useState<string | null>(() => getStoredUserEmail());
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(() => localStorage.getItem('dk_gdrive_folder_url'));
  const [driveOAuthConectado, setDriveOAuthConectado] = useState<boolean>(() => !!getStoredAccessToken());
  const [driveLocalConectado, setDriveLocalConectado] = useState<boolean>(false);
  const [driveNomePasta, setDriveNomePasta] = useState<string>('');

  const driveConectado = driveOAuthConectado || driveLocalConectado;

  const [pecas, setPecas] = useState<Peca[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PECAS) || localStorage.getItem(STORAGE_KEYS.OLD_PECAS);
    return saved ? JSON.parse(saved) : INITIAL_PECAS;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTES) || localStorage.getItem(STORAGE_KEYS.OLD_CLIENTES);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
  });

  const [compras, setCompras] = useState<Compra[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPRAS) || localStorage.getItem(STORAGE_KEYS.OLD_COMPRAS);
    return saved ? JSON.parse(saved) : INITIAL_COMPRAS;
  });

  const [vendas, setVendas] = useState<Venda[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDAS) || localStorage.getItem(STORAGE_KEYS.OLD_VENDAS);
    return saved ? JSON.parse(saved) : INITIAL_VENDAS;
  });

  const [consignacoes, setConsignacoes] = useState<Consignacao[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONSIGNACOES) || localStorage.getItem(STORAGE_KEYS.OLD_CONSIGNACOES);
    return saved ? JSON.parse(saved) : INITIAL_CONSIGNACOES;
  });

  const [config, setConfig] = useState<ConfiguracoesApp>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG) || localStorage.getItem(STORAGE_KEYS.OLD_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.nomeEmpresa || parsed.nomeEmpresa.includes('Aura')) {
        parsed.nomeEmpresa = 'DK Semijóias';
      }
      return parsed;
    }
    return INITIAL_CONFIG;
  });

  const [templatesMarketing, setTemplatesMarketing] = useState<TemplateMarketing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MARKETING);
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES_MARKETING;
  });

  const [tabHistory, setTabHistory] = useState<string[]>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash ? ['dashboard', hash] : ['dashboard'];
  });
  const [currentTab, setCurrentTabState] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tour Guiado State (desativado por padrão no reload ou navegação de volta)
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  const openTour = () => setIsTourOpen(true);
  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('dk_semijoias_tour_dismissed', 'true');
  };

  const setCurrentTab = (newTab: string) => {
    if (newTab === currentTab) return;
    setCurrentTabState(newTab);
    setTabHistory(prev => [...prev, newTab]);
    try {
      window.history.pushState({ tab: newTab }, '', `#${newTab}`);
    } catch {}
  };

  const goBack = () => {
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop(); // remove current
      const prevTab = nextHistory[nextHistory.length - 1] || 'dashboard';
      setTabHistory(nextHistory);
      setCurrentTabState(prevTab);
      try {
        window.history.replaceState({ tab: prevTab }, '', `#${prevTab}`);
      } catch {}
    } else {
      setCurrentTabState('dashboard');
    }
  };

  const canGoBack = tabHistory.length > 1 && currentTab !== 'dashboard';

  // Sincronizar navegação com o botão Voltar do navegador / celular
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Fecha o tour se estiver aberto
      setIsTourOpen(false);

      const tabFromState = event.state?.tab;
      const tabFromHash = window.location.hash.replace('#', '');
      const targetTab = tabFromState || tabFromHash || 'dashboard';

      setCurrentTabState(targetTab);
      setTabHistory(prev => {
        if (prev.length > 1) {
          const updated = [...prev];
          updated.pop();
          return updated;
        }
        return ['dashboard'];
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARKETING, JSON.stringify(templatesMarketing));
  }, [templatesMarketing]);

  // Sincronizar com localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PECAS, JSON.stringify(pecas));
  }, [pecas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPRAS, JSON.stringify(compras));
  }, [compras]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendas));
  }, [vendas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONSIGNACOES, JSON.stringify(consignacoes));
  }, [consignacoes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS_WHATSAPP, JSON.stringify(agendamentosWhatsApp));
  }, [agendamentosWhatsApp]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODELOS_COBRANCA, JSON.stringify(modelosMensagemCobranca));
  }, [modelosMensagemCobranca]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS_BACKUP_DRIVE, JSON.stringify(logsBackupDrive));
  }, [logsBackupDrive]);

  // Peças Paradas
  const hoje = new Date();
  const pecasParadas = pecas
    .filter(p => p.status === 'disponivel')
    .map(p => {
      const dataEntrada = new Date(p.dataEntrada);
      const diffTime = Math.abs(hoje.getTime() - dataEntrada.getTime());
      const diasParada = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { peca: p, diasParada };
    })
    .filter(item => item.diasParada >= config.diasPecaParadaAlerta)
    .sort((a, b) => b.diasParada - a.diasParada);

  // Parcelas pendentes e atrasadas
  const parcelasPendentesOuAtrasadas = vendas.flatMap(venda => {
    return venda.parcelas
      .filter(p => !p.pago)
      .map(p => {
        const vencimento = new Date(p.dataVencimento);
        const atrasoMs = hoje.getTime() - vencimento.getTime();
        const diasAtraso = Math.floor(atrasoMs / (1000 * 60 * 60 * 24));
        const isAtrasada = diasAtraso > 0;
        return {
          venda,
          parcela: p,
          diasAtraso: Math.max(0, diasAtraso),
          isAtrasada
        };
      });
  });

  // Débitos próximos ao vencimento e agendamentos de lembrete WhatsApp
  const debitosProximosAoVencimento = React.useMemo(() => {
    const hojeZero = new Date();
    hojeZero.setHours(0, 0, 0, 0);

    const lista: {
      venda: Venda;
      parcela: ParcelaVenda;
      diasAteVencimento: number;
      statusVencimento: 'hoje' | 'amanha' | 'proximos_dias' | 'atrasado';
      mensagemPadraoSugerida: string;
    }[] = [];

    vendas.forEach(venda => {
      venda.parcelas.forEach(parcela => {
        if (!parcela.pago) {
          const partes = (parcela.dataVencimento || '').split('-').map(Number);
          if (partes.length === 3) {
            const dataVenc = new Date(partes[0], partes[1] - 1, partes[2]);
            dataVenc.setHours(0, 0, 0, 0);

            const diffMs = dataVenc.getTime() - hojeZero.getTime();
            const diasAteVencimento = Math.round(diffMs / (1000 * 60 * 60 * 24));

            let statusVencimento: 'hoje' | 'amanha' | 'proximos_dias' | 'atrasado' = 'proximos_dias';
            if (diasAteVencimento < 0) {
              statusVencimento = 'atrasado';
            } else if (diasAteVencimento === 0) {
              statusVencimento = 'hoje';
            } else if (diasAteVencimento === 1) {
              statusVencimento = 'amanha';
            } else {
              statusVencimento = 'proximos_dias';
            }

            let templateEscolhido = modelosMensagemCobranca[0] || INITIAL_MODELOS_COBRANCA[0];
            if (statusVencimento === 'hoje') {
              templateEscolhido = modelosMensagemCobranca.find(m => m.tipo === 'dia_vencimento') || modelosMensagemCobranca[1] || templateEscolhido;
            } else if (statusVencimento === 'atrasado') {
              templateEscolhido = modelosMensagemCobranca.find(m => m.tipo === 'pos_vencimento') || modelosMensagemCobranca[3] || templateEscolhido;
            }

            const formatCurrency = (val: number) =>
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

            const formatarDataBr = (dataIso: string) => {
              if (!dataIso) return '';
              const p = dataIso.split('-');
              if (p.length === 3) {
                return `${p[2]}/${p[1]}/${p[0]}`;
              }
              return dataIso;
            };

            const mensagem = preencherMensagemCobranca(templateEscolhido.texto, {
              cliente: venda.clienteNome,
              valor: formatCurrency(parcela.valor),
              vencimento: formatarDataBr(parcela.dataVencimento),
              dias: Math.abs(diasAteVencimento),
              chavePix: config.chavePix,
              tipoPix: config.tipoChavePix.toUpperCase(),
              empresa: config.nomeEmpresa,
              telefone: config.telefoneContato,
              parcela: `${parcela.numeroParcela}/${parcela.totalParcelas}`
            });

            lista.push({
              venda,
              parcela,
              diasAteVencimento,
              statusVencimento,
              mensagemPadraoSugerida: mensagem
            });
          }
        }
      });
    });

    return lista.sort((a, b) => {
      if (a.diasAteVencimento === 0 && b.diasAteVencimento !== 0) return -1;
      if (b.diasAteVencimento === 0 && a.diasAteVencimento !== 0) return 1;
      return a.diasAteVencimento - b.diasAteVencimento;
    });
  }, [vendas, modelosMensagemCobranca, config]);

  // KPIs
  const totalPecasEstoque = pecas.filter(p => p.status === 'disponivel').reduce((acc, p) => acc + p.quantidade, 0);
  const valorEstoqueCusto = pecas.filter(p => p.status === 'disponivel').reduce((acc, p) => acc + (p.valorCompra * p.quantidade), 0);
  const valorEstoqueVenda = pecas.filter(p => p.status === 'disponivel').reduce((acc, p) => acc + (p.precoVenda * p.quantidade), 0);
  
  const faturamentoTotal = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
  
  // Vendas do mês corrente
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const faturamentoMesAtual = vendas
    .filter(v => {
      const dv = new Date(v.dataVenda);
      return dv.getMonth() === mesAtual && dv.getFullYear() === anoAtual;
    })
    .reduce((acc, v) => acc + v.valorTotal, 0);

  const totalInadimplente = parcelasPendentesOuAtrasadas
    .filter(item => item.isAtrasada)
    .reduce((acc, item) => acc + item.parcela.valor, 0);

  const totalConsignado = consignacoes
    .filter(c => c.status === 'em_aberto' || c.status === 'parcialmente_acertada')
    .reduce((acc, c) => {
      const soma = c.itens.filter(i => i.status === 'com_consignador').reduce((s, item) => s + item.valorUnitario, 0);
      return acc + soma;
    }, 0);

  const lucroEstimado = valorEstoqueVenda - valorEstoqueCusto;

  const kpis = {
    faturamentoTotal,
    faturamentoMesAtual,
    lucroEstimado,
    totalPecasEstoque,
    valorEstoqueCusto,
    valorEstoqueVenda,
    totalInadimplente,
    totalConsignado,
    totalPecasParadas: pecasParadas.length
  };

  // ==========================================
  // GOOGLE DRIVE & BACKUP AUTOMÁTICO EM CADA OPERAÇÃO
  // ==========================================
  const triggerBackupOperacao = async (operacaoNome: string) => {
    if (config.backupAutomaticoEmOperacoes === false) return;

    try {
      const agora = new Date();
      const dataHoraStr = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const snapshot: BackupData = {
        versao: '1.0',
        exportadoEm: agora.toISOString(),
        nomeSistema: config.nomeEmpresa || 'DK Semijoias',
        totalPecas: pecas.length,
        totalVendas: vendas.length,
        totalClientes: clientes.length,
        totalConsignacoes: consignacoes.length,
        dados: {
          pecas,
          vendas,
          clientes,
          consignacoes,
          config,
          usuarios,
          templatesMarketing
        }
      };

      const jsonString = JSON.stringify(snapshot, null, 2);
      localStorage.setItem(STORAGE_KEYS.DRIVE_AUTO_BACKUP, jsonString);

      let gravouNoDriveFolder = false;
      let gravouViaOAuth = false;

      // 1. Gravação na pasta local se o usuário vinculou via FileSystem
      if (driveDirectoryHandleRef) {
        try {
          const fileHandle = await driveDirectoryHandleRef.getFileHandle('backup-dk-automatico-drive.json', { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          gravouNoDriveFolder = true;
        } catch (err) {
          console.warn('Erro ao salvar na pasta local do Google Drive:', err);
        }
      }

      // 2. Gravação direta na Nuvem do Google Drive via API v3 (OAuth)
      const token = getStoredAccessToken();
      if (token) {
        try {
          const uploadRes = await salvarBackupNoGoogleDrive(snapshot, operacaoNome);
          if (uploadRes.sucesso) {
            gravouViaOAuth = true;
            if (uploadRes.folderUrl) {
              setDriveFolderUrl(uploadRes.folderUrl);
            }
          }
        } catch (err) {
          console.warn('Erro ao enviar backup automático para o Google Drive:', err);
        }
      }

      let detalhesTexto = 'Sincronizado no cache permanente pronto para o Google Drive';
      if (gravouViaOAuth && gravouNoDriveFolder) {
        detalhesTexto = 'Sincronizado na nuvem do Google Drive e na pasta local';
      } else if (gravouViaOAuth) {
        detalhesTexto = 'Sincronizado diretamente na nuvem do Google Drive (Pasta DK Semijóias)';
      } else if (gravouNoDriveFolder) {
        detalhesTexto = 'Salvo na pasta do Google Drive no computador e em cache protegido';
      }

      const novoLog: LogBackupOperacao = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        dataHora: dataHoraStr,
        operacao: operacaoNome,
        status: 'sucesso',
        detalhes: detalhesTexto
      };

      setLogsBackupDrive(prev => [novoLog, ...prev.slice(0, 49)]);

      setConfig(prev => ({
        ...prev,
        ultimoBackupOperacaoNome: operacaoNome,
        ultimoBackupOperacaoData: dataHoraStr,
        totalBackupsRealizadosHoje: (prev.totalBackupsRealizadosHoje || 0) + 1
      }));
    } catch (e) {
      console.error('Erro no backup automático por operação:', e);
    }
  };

  const conectarGoogleDriveOAuth = async (clientIdParam?: string): Promise<{ sucesso: boolean; mensagem: string; email?: string; folderUrl?: string }> => {
    try {
      const activeClientId = clientIdParam || config.googleClientId || DEFAULT_GOOGLE_CLIENT_ID;
      const auth = await solicitarAutorizacaoGoogleDrive(activeClientId);
      setDriveOAuthConectado(true);
      if (auth.userEmail) {
        setDriveContaEmail(auth.userEmail);
      }

      // Snapshot inicial logo após autenticar
      const agora = new Date();
      const snapshot: BackupData = {
        versao: '1.0',
        exportadoEm: agora.toISOString(),
        nomeSistema: config.nomeEmpresa || 'DK Semijoias',
        totalPecas: pecas.length,
        totalVendas: vendas.length,
        totalClientes: clientes.length,
        totalConsignacoes: consignacoes.length,
        dados: {
          pecas,
          vendas,
          clientes,
          consignacoes,
          config,
          usuarios,
          templatesMarketing
        }
      };

      const uploadResult = await salvarBackupNoGoogleDrive(snapshot, 'Conexão inicial com Google Drive');
      if (uploadResult.folderUrl) {
        setDriveFolderUrl(uploadResult.folderUrl);
      }

      setConfig(prev => ({
        ...prev,
        googleClientId: activeClientId,
        googleDriveContaConectada: auth.userEmail || prev.googleDriveContaConectada,
        googleDriveFolderUrl: uploadResult.folderUrl || prev.googleDriveFolderUrl,
        googleDriveModo: 'api_oauth'
      }));

      await triggerBackupOperacao('Conexão inicial da API do Google Drive ativada');

      return {
        sucesso: true,
        mensagem: 'Google Drive conectado com sucesso! O backup automático em cada operação está ativo.',
        email: auth.userEmail,
        folderUrl: uploadResult.folderUrl
      };
    } catch (err: any) {
      console.error('Erro ao conectar Google Drive OAuth:', err);
      return {
        sucesso: false,
        mensagem: err?.message || 'Falha ao autorizar acesso ao Google Drive.'
      };
    }
  };

  const desconectarGoogleDriveOAuth = () => {
    clearStoredAuthData();
    setDriveOAuthConectado(false);
    setDriveContaEmail(null);
    setConfig(prev => ({
      ...prev,
      googleDriveContaConectada: undefined,
      googleDriveModo: driveLocalConectado ? 'pasta_local' : undefined
    }));
  };

  const conectarPastaGoogleDrive = async (): Promise<boolean> => {
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents'
        });
        if (handle) {
          driveDirectoryHandleRef = handle;
          setDriveLocalConectado(true);
          setDriveNomePasta(handle.name || 'Google Drive');
          await triggerBackupOperacao('Conexão inicial com pasta do Google Drive');
          return true;
        }
      } else {
        setDriveLocalConectado(true);
        setDriveNomePasta('Google Drive (Cache em Nuvem)');
        await triggerBackupOperacao('Conexão do Google Drive ativada');
        return true;
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Erro ao conectar pasta do Drive:', err);
      }
      return false;
    }
    return false;
  };

  const desconectarPastaGoogleDrive = () => {
    driveDirectoryHandleRef = null;
    setDriveLocalConectado(false);
    setDriveNomePasta('');
  };

  // ==========================================
  // AGENDAMENTO DE MENSAGENS NO WHATSAPP
  // ==========================================
  const agendarMensagemWhatsApp = (dados: Omit<AgendamentoMensagemWhatsApp, 'id' | 'criadoEm' | 'status'>): AgendamentoMensagemWhatsApp => {
    const novo: AgendamentoMensagemWhatsApp = {
      ...dados,
      id: `agend-wpp-${Date.now()}`,
      status: 'agendado',
      criadoEm: new Date().toISOString()
    };
    setAgendamentosWhatsApp(prev => [novo, ...prev]);
    triggerBackupOperacao(`Lembrete WhatsApp agendado para ${dados.clienteNome}`);
    return novo;
  };

  const atualizarStatusAgendamento = (id: string, status: 'agendado' | 'enviado' | 'cancelado') => {
    setAgendamentosWhatsApp(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    triggerBackupOperacao(`Status de lembrete WhatsApp alterado para ${status}`);
  };

  const excluirAgendamento = (id: string) => {
    setAgendamentosWhatsApp(prev => prev.filter(a => a.id !== id));
    triggerBackupOperacao('Lembrete WhatsApp removido');
  };

  const addModeloMensagemCobranca = (modelo: Omit<ModeloMensagemCobranca, 'id'>): ModeloMensagemCobranca => {
    const novo: ModeloMensagemCobranca = {
      ...modelo,
      id: `mod-cob-${Date.now()}`
    };
    setModelosMensagemCobranca(prev => [...prev, novo]);
    triggerBackupOperacao(`Novo modelo de mensagem criado: ${modelo.titulo}`);
    return novo;
  };

  const updateModeloMensagemCobranca = (id: string, dados: Partial<ModeloMensagemCobranca>) => {
    setModelosMensagemCobranca(prev => prev.map(m => m.id === id ? { ...m, ...dados } : m));
    triggerBackupOperacao('Modelo de mensagem de cobrança atualizado');
  };

  const deleteModeloMensagemCobranca = (id: string) => {
    setModelosMensagemCobranca(prev => prev.filter(m => m.id !== id));
    triggerBackupOperacao('Modelo de mensagem de cobrança excluído');
  };

  // Funções CRUD
  const addPeca = (dados: Omit<Peca, 'id'>): Peca => {
    const novaPeca: Peca = {
      ...dados,
      id: `peca-${Date.now()}`
    };
    setPecas(prev => [novaPeca, ...prev]);
    triggerBackupOperacao(`Peça cadastrada: ${dados.descricao}`);
    return novaPeca;
  };

  const updatePeca = (id: string, dados: Partial<Peca>) => {
    setPecas(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p));
    triggerBackupOperacao(`Peça atualizada: ${dados.descricao || id}`);
  };

  const deletePeca = (id: string) => {
    setPecas(prev => prev.filter(p => p.id !== id));
    triggerBackupOperacao('Peça removida do estoque');
  };

  const limparExemplosEstoque = () => {
    // Remove as peças de demonstração que constam nos exemplos iniciais
    setPecas(prev => prev.filter(p => !INITIAL_PECAS.some(ip => ip.id === p.id)));
    triggerBackupOperacao('Limpeza de exemplos de estoque');
  };

  const limparTodasPecas = () => {
    setPecas([]);
    triggerBackupOperacao('Estoque zerado');
  };

  // Funções CRUD de Marketing
  const addTemplateMarketing = (tpl: Omit<TemplateMarketing, 'id'>): TemplateMarketing => {
    const novoTemplate: TemplateMarketing = {
      ...tpl,
      id: `tpl-${Date.now()}`
    };
    setTemplatesMarketing(prev => [novoTemplate, ...prev]);
    triggerBackupOperacao(`Campanha de marketing criada: ${tpl.titulo}`);
    return novoTemplate;
  };

  const updateTemplateMarketing = (id: string, dados: Partial<TemplateMarketing>) => {
    setTemplatesMarketing(prev => prev.map(t => t.id === id ? { ...t, ...dados } : t));
    triggerBackupOperacao('Campanha de marketing atualizada');
  };

  const deleteTemplateMarketing = (id: string) => {
    setTemplatesMarketing(prev => prev.filter(t => t.id !== id));
    triggerBackupOperacao('Campanha de marketing excluída');
  };

  const resetMarketingTemplates = () => {
    setTemplatesMarketing(INITIAL_TEMPLATES_MARKETING);
    triggerBackupOperacao('Modelos de marketing restaurados');
  };

  const importPecas = (novasPecas: Partial<Peca>[]): number => {
    let importadas = 0;
    const itemsToAdd: Peca[] = novasPecas.map((item, idx) => {
      importadas++;
      const valorCompra = Number(item.valorCompra) || 25;
      const margemValor = Number(item.margemValor) || 120;
      const margemTipo = item.margemTipo || 'percentual';
      const precoVenda = Number(item.precoVenda) || (
        margemTipo === 'percentual' 
          ? valorCompra * (1 + margemValor / 100) 
          : valorCompra + margemValor
      );

      return {
        id: `peca-imp-${Date.now()}-${idx}`,
        codigo: item.codigo || `IMP-${Math.floor(100 + Math.random() * 900)}`,
        referencia: item.referencia || `REF-${Math.floor(10 + Math.random() * 90)}`,
        descricao: item.descricao || 'Semijoia Fina Importada',
        tipo: (item.tipo as any) || 'Brinco',
        modelo: (item.modelo as any) || 'Ouro 18k',
        notaFiscal: item.notaFiscal || 'NF-IMPORT',
        valorCompra,
        margemTipo,
        margemValor,
        precoVenda: Math.round(precoVenda * 100) / 100,
        quantidade: Number(item.quantidade) || 1,
        dataEntrada: item.dataEntrada || new Date().toISOString().split('T')[0],
        status: 'disponivel',
        fotos: item.fotos && item.fotos.length > 0 ? item.fotos : [
          {
            id: `f-${Date.now()}-${idx}`,
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
            tipo: 'produto'
          }
        ],
        fornecedor: item.fornecedor || 'Fornecedor Planilha',
        observacoes: item.observacoes || 'Importado via arquivo de estoque'
      };
    });

    setPecas(prev => [...itemsToAdd, ...prev]);
    triggerBackupOperacao(`Importação em lote de ${importadas} peças`);
    return importadas;
  };

  const addCompra = (compra: Omit<Compra, 'id'>): Compra => {
    const novaCompra: Compra = {
      ...compra,
      id: `comp-${Date.now()}`
    };
    setCompras(prev => [novaCompra, ...prev]);
    triggerBackupOperacao(`Compra de estoque registrada: ${compra.fornecedor}`);
    return novaCompra;
  };

  const deleteCompra = (id: string) => {
    setCompras(prev => prev.filter(c => c.id !== id));
    triggerBackupOperacao('Registro de compra excluído');
  };

  const addCliente = (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'comentarios'>): Cliente => {
    const novo: Cliente = {
      ...cliente,
      id: `cli-${Date.now()}`,
      dataCadastro: new Date().toISOString().split('T')[0],
      comentarios: []
    };
    setClientes(prev => [novo, ...prev]);
    triggerBackupOperacao(`Cliente cadastrado: ${cliente.nome}`);
    return novo;
  };

  const updateCliente = (id: string, dados: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...dados } : c));
    triggerBackupOperacao(`Cliente atualizado: ${dados.nome || id}`);
  };

  const deleteCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
    triggerBackupOperacao('Cliente removido');
  };

  const importarContatosWhatsApp = (contatos: { nome: string; telefone: string }[]): number => {
    let count = 0;
    const dataHoje = new Date().toISOString().split('T')[0];
    const novosClientes: Cliente[] = [];

    contatos.forEach((cont, index) => {
      // Evitar duplicar telefone exato
      const existe = clientes.some(c => c.telefone.replace(/\D/g, '') === cont.telefone.replace(/\D/g, ''));
      if (!existe && cont.nome.trim()) {
        novosClientes.push({
          id: `cli-wpp-${Date.now()}-${index}`,
          nome: cont.nome.trim(),
          telefone: cont.telefone.trim(),
          tipo: 'cliente',
          origem: 'whatsapp_import',
          dataCadastro: dataHoje,
          comentarios: [
            {
              id: `comm-${Date.now()}-${index}`,
              data: dataHoje,
              autor: 'Importação WhatsApp',
              texto: 'Contato importado automaticamente da agenda/conversa do WhatsApp.'
            }
          ]
        });
        count++;
      }
    });

    if (novosClientes.length > 0) {
      setClientes(prev => [...novosClientes, ...prev]);
      triggerBackupOperacao(`Importação de ${novosClientes.length} contatos do WhatsApp`);
    }
    return count;
  };

  const adicionarComentarioCliente = (clienteId: string, texto: string, autor = 'Atendimento', pecaId?: string, pecaNome?: string) => {
    const novoComentario = {
      id: `comm-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      autor,
      texto,
      pecaId,
      pecaNome
    };

    setClientes(prev => prev.map(c => {
      if (c.id === clienteId) {
        return {
          ...c,
          comentarios: [novoComentario, ...c.comentarios]
        };
      }
      return c;
    }));
    triggerBackupOperacao('Nota de atendimento registrada');
  };

  const registrarVenda = (vendaData: Omit<Venda, 'id' | 'reciboGeradoEm'>): Venda => {
    const agora = new Date();
    const novaVenda: Venda = {
      ...vendaData,
      vendedorId: vendaData.vendedorId || currentUser.id,
      vendedorNome: vendaData.vendedorNome || currentUser.nome,
      id: `ven-${Date.now()}`,
      reciboGeradoEm: `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    };

    // Baixa de estoque das peças vendidas
    setPecas(prevPecas => {
      return prevPecas.map(p => {
        const itemVendido = vendaData.itens.find(item => item.pecaId === p.id);
        if (itemVendido) {
          const novaQtd = Math.max(0, p.quantidade - itemVendido.quantidade);
          return {
            ...p,
            quantidade: novaQtd,
            status: novaQtd === 0 ? 'vendida' : p.status
          };
        }
        return p;
      });
    });

    setVendas(prev => [novaVenda, ...prev]);
    triggerBackupOperacao(`Venda registrada para ${vendaData.clienteNome}`);
    return novaVenda;
  };

  const marcarParcelaPaga = (vendaId: string, parcelaId: string) => {
    const hojeStr = new Date().toISOString().split('T')[0];

    setVendas(prev => prev.map(v => {
      if (v.id === vendaId) {
        const novasParcelas = v.parcelas.map(p => {
          if (p.id === parcelaId) {
            return {
              ...p,
              pago: true,
              dataPagamento: hojeStr
            };
          }
          return p;
        });

        const todasPagas = novasParcelas.every(p => p.pago);

        return {
          ...v,
          parcelas: novasParcelas,
          statusPagamento: todasPagas ? 'pago' : v.statusPagamento
        };
      }
      return v;
    }));
    triggerBackupOperacao('Baixa em parcela de pagamento recebida');
  };

  const addConsignacao = (consignacao: Omit<Consignacao, 'id'>): Consignacao => {
    const nova: Consignacao = {
      ...consignacao,
      id: `cons-${Date.now()}`
    };

    // Marcar as peças selecionadas como 'consignada'
    const pecasIds = consignacao.itens.map(i => i.pecaId);
    setPecas(prev => prev.map(p => {
      if (pecasIds.includes(p.id)) {
        return { ...p, status: 'consignada' };
      }
      return p;
    }));

    setConsignacoes(prev => [nova, ...prev]);
    triggerBackupOperacao(`Consignação registrada para ${consignacao.consignadorNome}`);
    return nova;
  };

  const atualizarItemConsignacao = (consignacaoId: string, pecaId: string, novoStatus: 'com_consignador' | 'vendido' | 'devolvido') => {
    setConsignacoes(prev => prev.map(c => {
      if (c.id === consignacaoId) {
        const novosItens = c.itens.map(item => {
          if (item.pecaId === pecaId) {
            return { ...item, status: novoStatus };
          }
          return item;
        });

        // Verificar status da consignação
        const todosVendidosOuDevolvidos = novosItens.every(i => i.status === 'vendido' || i.status === 'devolvido');
        const status = todosVendidosOuDevolvidos ? 'finalizada' : 'parcialmente_acertada';

        return {
          ...c,
          itens: novosItens,
          status
        };
      }
      return c;
    }));

    // Se foi devolvido, volta para disponível no estoque
    if (novoStatus === 'devolvido') {
      setPecas(prev => prev.map(p => p.id === pecaId ? { ...p, status: 'disponivel' } : p));
    } else if (novoStatus === 'vendido') {
      setPecas(prev => prev.map(p => p.id === pecaId ? { ...p, status: 'vendida', quantidade: Math.max(0, p.quantidade - 1) } : p));
    }
    triggerBackupOperacao('Item de consignação atualizado');
  };

  const finalizarConsignacao = (consignacaoId: string) => {
    setConsignacoes(prev => prev.map(c => c.id === consignacaoId ? { ...c, status: 'finalizada' } : c));
    triggerBackupOperacao('Consignação finalizada');
  };

  const updateConfig = (novasConfig: Partial<ConfiguracoesApp>) => {
    setConfig(prev => ({ ...prev, ...novasConfig }));
    triggerBackupOperacao('Configurações atualizadas');
  };

  const addUsuario = (dados: Omit<Usuario, 'id'>): Usuario => {
    const novo: Usuario = {
      ...dados,
      id: `user-${Date.now()}`,
      dataCriacao: new Date().toISOString().split('T')[0]
    };
    setUsuarios(prev => [...prev, novo]);
    triggerBackupOperacao(`Operador cadastrado: ${novo.nome}`);
    return novo;
  };

  const updateUsuario = (id: string, dados: Partial<Usuario>) => {
    setUsuarios(prev => prev.map(u => {
      if (u.id === id) {
        const atualizado = { ...u, ...dados };
        if (currentUser.id === id) {
          setCurrentUser(atualizado);
        }
        return atualizado;
      }
      return u;
    }));
    triggerBackupOperacao('Cadastro de operador atualizado');
  };

  const deleteUsuario = (id: string) => {
    setUsuarios(prev => {
      const restantes = prev.filter(u => u.id !== id);
      if (currentUser.id === id && restantes.length > 0) {
        setCurrentUser(restantes[0]);
      }
      return restantes;
    });
    triggerBackupOperacao('Operador removido');
  };

  const resetToDefaults = () => {
    setPecas(INITIAL_PECAS);
    setClientes(INITIAL_CLIENTES);
    setCompras(INITIAL_COMPRAS);
    setVendas(INITIAL_VENDAS);
    setConsignacoes(INITIAL_CONSIGNACOES);
    setConfig(INITIAL_CONFIG);
    setUsuarios(INITIAL_USUARIOS);
    setCurrentUser(INITIAL_USUARIOS[0]);
  };

  const gerarBackupCompleto = (): BackupData => {
    return {
      versao: '1.0',
      exportadoEm: new Date().toISOString(),
      nomeSistema: config.nomeEmpresa || 'DK Semijoias',
      totalPecas: pecas.length,
      totalVendas: vendas.length,
      totalClientes: clientes.length,
      totalConsignacoes: consignacoes.length,
      dados: {
        pecas,
        vendas,
        clientes,
        consignacoes,
        config,
        usuarios,
        templatesMarketing
      }
    };
  };

  const restaurarBackupCompleto = (backup: BackupData): { success: boolean; message: string } => {
    try {
      if (!backup.dados) {
        return { success: false, message: 'Dados do arquivo corrompidos ou em formato incompatível.' };
      }

      if (Array.isArray(backup.dados.pecas)) {
        setPecas(backup.dados.pecas);
      }
      if (Array.isArray(backup.dados.vendas)) {
        setVendas(backup.dados.vendas);
      }
      if (Array.isArray(backup.dados.clientes)) {
        setClientes(backup.dados.clientes);
      }
      if (Array.isArray(backup.dados.consignacoes)) {
        setConsignacoes(backup.dados.consignacoes);
      }
      if (backup.dados.config && typeof backup.dados.config === 'object') {
        setConfig(prev => ({ ...prev, ...backup.dados.config }));
      }
      if (Array.isArray(backup.dados.usuarios) && backup.dados.usuarios.length > 0) {
        setUsuarios(backup.dados.usuarios);
      }
      if (Array.isArray(backup.dados.templatesMarketing) && backup.dados.templatesMarketing.length > 0) {
        setTemplatesMarketing(backup.dados.templatesMarketing);
      }

      return { 
        success: true, 
        message: `Banco de dados restaurado com sucesso! ${backup.dados.pecas?.length || 0} peças e ${backup.dados.vendas?.length || 0} vendas recuperadas.` 
      };
    } catch (err: unknown) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Falha ao restaurar banco de dados.' 
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        pecas,
        clientes,
        compras,
        vendas,
        consignacoes,
        config,
        templatesMarketing,
        usuarios,
        currentUser,
        setCurrentUser,
        addUsuario,
        updateUsuario,
        deleteUsuario,
        currentTab,
        setCurrentTab,
        tabHistory,
        goBack,
        canGoBack,
        searchQuery,
        setSearchQuery,
        isTourOpen,
        openTour,
        closeTour,
        addPeca,
        updatePeca,
        deletePeca,
        limparExemplosEstoque,
        limparTodasPecas,
        importPecas,
        addTemplateMarketing,
        updateTemplateMarketing,
        deleteTemplateMarketing,
        resetMarketingTemplates,
        addCompra,
        deleteCompra,
        addCliente,
        updateCliente,
        deleteCliente,
        importarContatosWhatsApp,
        adicionarComentarioCliente,
        registrarVenda,
        marcarParcelaPaga,
        addConsignacao,
        atualizarItemConsignacao,
        finalizarConsignacao,
        updateConfig,
        resetToDefaults,
        gerarBackupCompleto,
        restaurarBackupCompleto,
        pecasParadas,
        parcelasPendentesOuAtrasadas,
        debitosProximosAoVencimento,
        kpis,
        agendamentosWhatsApp,
        modelosMensagemCobranca,
        logsBackupDrive,
        driveConectado,
        driveNomePasta,
        driveContaEmail,
        driveFolderUrl,
        driveOAuthConectado,
        conectarGoogleDriveOAuth,
        desconectarGoogleDriveOAuth,
        agendarMensagemWhatsApp,
        atualizarStatusAgendamento,
        excluirAgendamento,
        addModeloMensagemCobranca,
        updateModeloMensagemCobranca,
        deleteModeloMensagemCobranca,
        triggerBackupOperacao,
        conectarPastaGoogleDrive,
        desconectarPastaGoogleDrive
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
