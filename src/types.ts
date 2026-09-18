export type TipoPeca = 
  | 'Brinco' 
  | 'Colar' 
  | 'Pulseira' 
  | 'Anel' 
  | 'Tornozeleira' 
  | 'Conjunto' 
  | 'Pingente' 
  | 'Gargantilha';

export type ModeloBanho = 
  | 'Nenhum'
  | 'Ouro 18k' 
  | 'Prata 925' 
  | 'Ródio Branco' 
  | 'Ródio Negro' 
  | 'Ouro Rosé' 
  | 'Zircônia Cristal' 
  | 'Pérola Natural' 
  | 'Cravação Pavê';

export type StatusPeca = 'disponivel' | 'vendida' | 'consignada' | 'reservada';

export interface FotoPeca {
  id: string;
  url: string;
  tipo: 'produto' | 'anotacao_caderno';
  legenda?: string;
}

export interface Peca {
  id: string;
  codigo: string;
  referencia: string;
  descricao: string;
  tipo: TipoPeca;
  modelo: ModeloBanho;
  notaFiscal: string;
  valorCompra: number;
  margemTipo: 'percentual' | 'fixo';
  margemValor: number;
  precoVenda: number;
  quantidade: number;
  dataEntrada: string; // YYYY-MM-DD
  status: StatusPeca;
  fotos: FotoPeca[];
  fornecedor?: string;
  observacoes?: string;
}

export interface DespesaCompra {
  id: string;
  tipo: 'cartao' | 'combustivel' | 'comissao' | 'frete' | 'outros';
  descricao: string;
  valor: number;
}

export interface Compra {
  id: string;
  dataCompra: string;
  fornecedor: string;
  notaFiscal: string;
  valorTotal: number;
  despesas: DespesaCompra[];
  pecasCadastradasIds: string[];
  observacoes?: string;
}

export type TipoCliente = 'cliente' | 'revendedor';

export interface ComentarioCliente {
  id: string;
  data: string;
  autor: string;
  texto: string;
  pecaId?: string;
  pecaNome?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string; // Ex: (11) 98765-4321
  email?: string;
  cidade?: string;
  tipo: TipoCliente;
  origem: 'whatsapp_import' | 'manual' | 'indicacao' | 'redes_sociais';
  dataCadastro: string;
  limiteCredito?: number;
  preferencias?: string; // ex: Tamanho anel 16, prefere banho ouro
  comentarios: ComentarioCliente[];
}

export type FormaPagamento = 
  | 'pix' 
  | 'cartao_credito' 
  | 'cartao_debito' 
  | 'parcelado' 
  | 'boleto' 
  | 'dinheiro' 
  | 'apenas_registro';

export interface ParcelaVenda {
  id: string;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: string;
  valor: number;
  pago: boolean;
  dataPagamento?: string;
  observacao?: string;
}

export interface ItemVenda {
  pecaId: string;
  codigo: string;
  descricao: string;
  fotoUrl?: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  dataVenda: string;
  itens: ItemVenda[];
  valorSubtotal: number;
  desconto: number;
  valorTotal: number;
  formaPagamento: FormaPagamento;
  statusPagamento: 'pago' | 'pendente' | 'atrasado';
  parcelas: ParcelaVenda[];
  taxaCartaoPercentual?: number;
  observacao?: string;
  reciboGeradoEm?: string;
  vendedorId?: string;
  vendedorNome?: string;
}

export type PerfilUsuario = 'admin' | 'gerente' | 'vendedor' | 'revendedor';

export interface Usuario {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  perfil: PerfilUsuario;
  avatarCor?: string;
  ativo: boolean;
  comissaoPercentual?: number;
  dataCriacao?: string;
}

export type StatusConsignacao = 'em_aberto' | 'parcialmente_acertada' | 'finalizada';

export interface ItemConsignacao {
  pecaId: string;
  codigo: string;
  descricao: string;
  fotoUrl?: string;
  valorUnitario: number;
  status: 'com_consignador' | 'vendido' | 'devolvido';
}

export interface Consignacao {
  id: string;
  consignadorNome: string;
  contato: string;
  dataEntrega: string;
  dataPrevisaoAcerto: string;
  comissaoPercentual: number; // ex: 20%
  status: StatusConsignacao;
  itens: ItemConsignacao[];
  observacoes?: string;
}

export interface ConfiguracoesApp {
  diasPecaParadaAlerta: number; // default 30
  nomeEmpresa: string;
  telefoneContato: string;
  chavePix: string;
  tipoChavePix: 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria';
  mensagemPadraoWhatsApp: string;
  linkCatalogoPublico: string;
  ultimoBackupEm?: string;
  frequenciaBackupAuto?: 'diario' | 'semanal' | 'desativado';
  backupAutomaticoEmOperacoes?: boolean; // default true
  googleDrivePastaConectada?: boolean;
  googleDriveNomePasta?: string;
  googleClientId?: string;
  googleDriveFolderId?: string;
  googleDriveFolderUrl?: string;
  googleDriveContaConectada?: string;
  googleDriveTokenExpiraEm?: number;
  googleDriveModo?: 'api_oauth' | 'pasta_local';
  ultimoBackupOperacaoNome?: string;
  ultimoBackupOperacaoData?: string;
  totalBackupsRealizadosHoje?: number;
}

export interface LogBackupOperacao {
  id: string;
  dataHora: string;
  operacao: string;
  status: 'sucesso' | 'pendente' | 'erro';
  detalhes?: string;
}

export interface ModeloMensagemCobranca {
  id: string;
  titulo: string;
  tipo: 'preventivo' | 'dia_vencimento' | 'pix_rapido' | 'pos_vencimento' | 'personalizado';
  texto: string;
}

export interface AgendamentoMensagemWhatsApp {
  id: string;
  vendaId: string;
  parcelaId: string;
  clienteId?: string;
  clienteNome: string;
  clienteTelefone: string;
  valorParcela: number;
  dataVencimento: string;
  diasAteVencimento: number; // negativo se vencida, 0 se vence hoje, positivo se vence em X dias
  modeloMensagemId: string;
  mensagemFinal: string;
  dataAgendamento: string; // YYYY-MM-DD
  horarioAgendamento: string; // HH:mm
  status: 'agendado' | 'enviado' | 'cancelado';
  criadoEm: string;
  enviadoEm?: string;
}

export type PlataformaMarketing = 'instagram' | 'facebook' | 'whatsapp' | 'tiktok';

export interface BackupData {
  versao: string;
  exportadoEm: string;
  nomeSistema: string;
  totalPecas: number;
  totalVendas: number;
  totalClientes: number;
  totalConsignacoes: number;
  dados: {
    pecas: Peca[];
    vendas: Venda[];
    clientes: Cliente[];
    consignacoes: Consignacao[];
    config: ConfiguracoesApp;
    usuarios: Usuario[];
    templatesMarketing: TemplateMarketing[];
  };
}

export interface TemplateMarketing {
  id: string;
  titulo: string;
  categoria: 'promocao' | 'lancamento' | 'pecas_paradas' | 'data_comemorativa' | 'revendedora';
  textoPadrao: string;
  hashtags: string;
  corFundo: string;
  corTexto: string;
  objetivo?: string;
  canal?: string;
}
