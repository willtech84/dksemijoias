import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  ShoppingBag, 
  PlusCircle, 
  FileSpreadsheet, 
  Users, 
  Share2, 
  MessageSquare, 
  CheckCircle,
  ExternalLink,
  DollarSign,
  Database,
  Phone,
  ShieldCheck,
  Save,
  Edit3,
  Check,
  CloudDownload
} from 'lucide-react';
import { formatDate } from '../utils/printHelpers';
import { BackupManagerModal } from './BackupManagerModal';

export const Dashboard: React.FC = () => {
  const { 
    kpis, 
    pecasParadas, 
    parcelasPendentesOuAtrasadas, 
    vendas, 
    config, 
    updateConfig, 
    setCurrentTab 
  } = useApp();

  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [telefoneInput, setTelefoneInput] = useState(config.telefoneContato);
  const [telefoneEditando, setTelefoneEditando] = useState(false);
  const [telefoneSalvoFeedback, setTelefoneSalvoFeedback] = useState(false);

  const parcelasAtrasadas = parcelasPendentesOuAtrasadas.filter(p => p.isAtrasada);
  const ultimasVendas = vendas.slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSalvarTelefone = () => {
    updateConfig({ telefoneContato: telefoneInput.trim() });
    setTelefoneEditando(false);
    setTelefoneSalvoFeedback(true);
    setTimeout(() => setTelefoneSalvoFeedback(false), 3000);
  };

  const handleEnviarCobrancaWhatsApp = (telefone: string, clienteNome: string, valor: number, diasAtraso: number) => {
    const limpo = telefone.replace(/\D/g, '');
    const num = limpo.startsWith('55') ? limpo : `55${limpo}`;
    const msg = encodeURIComponent(
      `Olá, ${clienteNome}! Tudo bem? Passando com carinho para lembrar sobre sua parcela pendente no valor de ${formatCurrency(valor)}, vencida há ${diasAtraso} dias na ${config.nomeEmpresa}. Segue nossa chave Pix (${config.chavePix}). Qualquer dúvida estamos à disposição! ✨`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-2xl border border-stone-800 text-stone-100 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Visão Geral do Negócio
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-100 mt-1">
            Gestão de Semijoias & Resultados
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-xl">
            Acompanhe o desempenho de vendas, giro de estoque, cobranças pendentes e ações de marketing em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setCurrentTab('vendas')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Nova Venda
          </button>
          <button
            onClick={() => setCurrentTab('estoque')}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded-xl text-xs flex items-center gap-2 border border-stone-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            Cadastrar Peça
          </button>
          <button
            onClick={() => setCurrentTab('catalogo')}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded-xl text-xs flex items-center gap-2 border border-stone-700 transition-colors"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            Abrir Vitrine
          </button>
        </div>
      </div>

      {/* Barra de Contato Oficial (WhatsApp da Loja) & Atalho de Backup do Banco */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Bloco do Telefone de Contato com Salvar e Alterar */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Telefone Oficial de Contato (WhatsApp da Loja)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Exibido no Catálogo & Recibos
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Este é o número que os clientes usam para fazer pedidos no Catálogo Vitrine e receber recibos.
              </p>
            </div>
          </div>

          {telefoneSalvoFeedback && (
            <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Telefone salvo com sucesso e atualizado em todos os canais de venda!</span>
            </div>
          )}

          <div className="pt-1 flex flex-wrap items-center gap-2">
            {telefoneEditando ? (
              <div className="flex flex-wrap items-center gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={telefoneInput}
                  onChange={(e) => setTelefoneInput(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  autoFocus
                />
                <button
                  onClick={handleSalvarTelefone}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Telefone</span>
                </button>
                <button
                  onClick={() => {
                    setTelefoneInput(config.telefoneContato);
                    setTelefoneEditando(false);
                  }}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="px-3 py-1.5 bg-stone-100 rounded-xl border border-stone-200 font-bold text-stone-900 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{config.telefoneContato || 'Nenhum telefone configurado'}</span>
                </div>
                
                <button
                  onClick={() => setTelefoneEditando(true)}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Alterar</span>
                </button>

                <a
                  href={`https://wa.me/${config.telefoneContato.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-1 transition-colors"
                  title="Testar conversa no WhatsApp"
                >
                  <span>Testar WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bloco de Acesso Rápido ao Backup */}
        <div className="lg:border-l lg:border-stone-200 lg:pl-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Backup do Banco de Dados</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Último: {config.ultimoBackupEm ? formatDate(config.ultimoBackupEm.split('T')[0]) : 'Pendente'}
            </div>
          </div>

          <button
            onClick={() => setBackupModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Fazer Backup / Google Drive</span>
          </button>
        </div>

      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento Mês */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Faturamento (Mês)
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900 font-serif-luxury">
              {formatCurrency(kpis.faturamentoMesAtual)}
            </div>
            <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span>Total histórico:</span>
              <strong className="text-stone-700">{formatCurrency(kpis.faturamentoTotal)}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Estoque Total (Venda) */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Valor em Estoque (Venda)
            </span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900 font-serif-luxury">
              {formatCurrency(kpis.valorEstoqueVenda)}
            </div>
            <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span>Custo: {formatCurrency(kpis.valorEstoqueCusto)}</span>
              <span className="text-stone-300">|</span>
              <span className="text-emerald-600 font-medium">+{formatCurrency(kpis.lucroEstimado)} lucro</span>
            </div>
          </div>
        </div>

        {/* Card 3: Peças Paradas Alerta */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Peças Paradas (+{config.diasPecaParadaAlerta}d)
            </span>
            <div className={`p-2 rounded-lg ${pecasParadas.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900 font-serif-luxury flex items-center gap-2">
              <span>{pecasParadas.length} peças</span>
              {pecasParadas.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-sans font-medium">
                  Atenção
                </span>
              )}
            </div>
            <button
              onClick={() => setCurrentTab('estoque')}
              className="text-xs text-amber-700 hover:text-amber-900 font-medium mt-1 flex items-center gap-0.5"
            >
              Criar queima / promoção <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Inadimplência / Atrasos */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Cobranças Atrasadas
            </span>
            <div className={`p-2 rounded-lg ${parcelasAtrasadas.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-stone-100 text-stone-500'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 font-serif-luxury">
              {formatCurrency(kpis.totalInadimplente)}
            </div>
            <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
              <span>{parcelasAtrasadas.length} parcela(s) vencida(s)</span>
              <button
                onClick={() => setCurrentTab('cobrancas')}
                className="text-xs text-rose-700 hover:text-rose-900 font-medium flex items-center gap-0.5"
              >
                Cobrar agora <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Alerta Inteligente de Peças Paradas com Ajuste de Limite de Dias */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-stone-900">
                  Monitor de Giro de Estoque & Peças Paradas
                </h3>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-xs font-medium">
                  {pecasParadas.length} identificadas
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                Peças paradas há muito tempo imobilizam seu capital de giro. Você pode ajustar abaixo a régua de dias para o disparo automático de alerta no sistema.
              </p>
            </div>
          </div>

          {/* Configuração de Dias em tempo real */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-amber-200 text-xs">
            <span className="text-stone-700 font-medium whitespace-nowrap">
              Alerta a partir de:
            </span>
            <div className="flex items-center gap-1.5">
              <select
                value={config.diasPecaParadaAlerta}
                onChange={(e) => updateConfig({ diasPecaParadaAlerta: Number(e.target.value) })}
                className="bg-amber-50/60 border border-amber-300 font-bold text-amber-900 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                <option value={15}>15 dias</option>
                <option value={30}>30 dias (padrão)</option>
                <option value={45}>45 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
              </select>
            </div>
            <button
              onClick={() => setCurrentTab('marketing')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors ml-1"
            >
              Criar Promoção
            </button>
          </div>
        </div>

        {/* Prévia das peças paradas caso existam */}
        {pecasParadas.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pecasParadas.slice(0, 3).map(({ peca, diasParada }) => (
              <div 
                key={peca.id} 
                className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center gap-3 shadow-2xs"
              >
                <img
                  src={peca.fotos[0]?.url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80'}
                  alt={peca.descricao}
                  className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-stone-900 truncate">
                    {peca.descricao}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Cód: {peca.codigo} • {formatCurrency(peca.precoVenda)}
                  </div>
                  <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                    ⏱️ Parada há {diasParada} dias no estoque
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: 2 Colunas (Vendas Recentes & Cobranças Pendentes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna 1: Vendas Recentes */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-stone-100 rounded-lg text-stone-700">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-stone-900 font-serif-luxury">
                Últimas Vendas
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('vendas')}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
            >
              Ver todas ({vendas.length})
            </button>
          </div>

          <div className="divide-y divide-stone-100 mt-2">
            {ultimasVendas.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                Nenhuma venda registrada ainda. Clique em "Nova Venda" para começar!
              </div>
            ) : (
              ultimasVendas.map((venda) => (
                <div key={venda.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-stone-900 truncate">
                      {venda.clienteNome}
                    </div>
                    <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                      <span>{venda.itens.length} peça(s)</span>
                      <span>•</span>
                      <span className="capitalize">{venda.formaPagamento.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{formatDate(venda.dataVenda)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-stone-900 font-serif-luxury">
                      {formatCurrency(venda.valorTotal)}
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      venda.statusPagamento === 'pago'
                        ? 'bg-emerald-100 text-emerald-800'
                        : venda.statusPagamento === 'atrasado'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {venda.statusPagamento}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Alertas de Cobrança / Inadimplência */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-stone-900 font-serif-luxury">
                Cobranças & Vencimentos
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('cobrancas')}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold"
            >
              Gerenciar ({parcelasPendentesOuAtrasadas.length})
            </button>
          </div>

          <div className="divide-y divide-stone-100 mt-2">
            {parcelasPendentesOuAtrasadas.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 stroke-[1.5]" />
                <span>Excelente! Não há parcelas pendentes ou vencidas no momento.</span>
              </div>
            ) : (
              parcelasPendentesOuAtrasadas.slice(0, 5).map(({ venda, parcela, diasAtraso, isAtrasada }) => (
                <div key={parcela.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                      <span className="truncate">{venda.clienteNome}</span>
                      {isAtrasada ? (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] rounded font-semibold whitespace-nowrap">
                          {diasAtraso}d atraso
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded font-semibold whitespace-nowrap">
                          A vencer
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Parc. {parcela.numeroParcela}/{parcela.totalParcelas} • Vencimento: {formatDate(parcela.dataVencimento)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-sm font-bold text-stone-900 text-right">
                      {formatCurrency(parcela.valor)}
                    </div>
                    <button
                      onClick={() => handleEnviarCobrancaWhatsApp(venda.clienteTelefone, venda.clienteNome, parcela.valor, diasAtraso)}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                      title="Enviar lembrete amigável via WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Atalhos Operacionais */}
      <div className="bg-stone-900 text-stone-200 p-6 rounded-2xl border border-stone-800 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4">
          Acesso Rápido às Funcionalidades Principais
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Importar Excel/PDF', icon: FileSpreadsheet, tab: 'estoque' },
            { label: 'Nova Consignação', icon: Package, tab: 'consignacoes' },
            { label: 'Importar WhatsApp', icon: Users, tab: 'clientes' },
            { label: 'Catálogo Vitrine', icon: Share2, tab: 'catalogo' },
            { label: 'Criar Post Marketing', icon: MessageSquare, tab: 'marketing' },
            { label: 'Backup & Google Drive', icon: Database, action: () => setBackupModalOpen(true) },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.tab) {
                    setCurrentTab(item.tab);
                  }
                }}
                className="p-3.5 bg-stone-800 hover:bg-stone-750 border border-stone-700/60 rounded-xl text-left transition-all hover:border-amber-500/50 group cursor-pointer"
              >
                <Icon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-2" />
                <div className="text-xs font-semibold text-stone-100 leading-snug">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de Backup do Banco de Dados & Google Drive */}
      <BackupManagerModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
      />

    </div>
  );
};
