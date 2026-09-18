import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Peca, Venda, ParcelaVenda, TipoPeca, ModeloBanho, FormaPagamento } from '../types';
import * as XLSX from 'xlsx';
import { 
  formatCurrency, 
  formatDate, 
  triggerPrintDocument, 
  saveStandaloneHtmlDocument 
} from '../utils/printHelpers';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  X, 
  Filter, 
  Search, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Layers,
  FileText
} from 'lucide-react';

export type ReportType = 'estoque' | 'vendas' | 'inadimplencia' | 'consolidado';

interface ReportModalProps {
  reportType: ReportType;
  onClose: () => void;
  initialPeriod?: 'todos' | 'hoje' | '7dias' | 'mes' | 'ano';
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reportType: initialReportType,
  onClose,
  initialPeriod = 'todos'
}) => {
  const { 
    pecas, 
    vendas, 
    parcelasPendentesOuAtrasadas, 
    config, 
    pecasParadas, 
    kpis 
  } = useApp();

  const [activeTab, setActiveTab] = useState<ReportType>(initialReportType);

  // Filtros de Estoque
  const [estoqueTipoFiltro, setEstoqueTipoFiltro] = useState<string>('todos');
  const [estoqueStatusFiltro, setEstoqueStatusFiltro] = useState<string>('todos');
  const [estoqueBusca, setEstoqueBusca] = useState<string>('');

  // Filtros de Vendas
  const [vendasPeriodo, setVendasPeriodo] = useState<'todos' | 'hoje' | '7dias' | 'mes' | 'ano'>(initialPeriod);
  const [vendasFormaPgto, setVendasFormaPgto] = useState<string>('todos');
  const [vendasBusca, setVendasBusca] = useState<string>('');

  // Filtros de Inadimplência
  const [inadimplenciaStatus, setInadimplenciaStatus] = useState<'somente_atrasadas' | 'todas'>('somente_atrasadas');
  const [inadimplenciaBusca, setInadimplenciaBusca] = useState<string>('');

  // ==========================================
  // DADOS FILTRADOS: ESTOQUE
  // ==========================================
  const estoqueFiltrado = useMemo(() => {
    return pecas.filter(p => {
      const matchBusca = 
        p.codigo.toLowerCase().includes(estoqueBusca.toLowerCase()) ||
        p.descricao.toLowerCase().includes(estoqueBusca.toLowerCase()) ||
        p.modelo.toLowerCase().includes(estoqueBusca.toLowerCase());

      const matchTipo = estoqueTipoFiltro === 'todos' || p.tipo === estoqueTipoFiltro;
      
      let matchStatus = true;
      if (estoqueStatusFiltro === 'disponivel') matchStatus = p.status === 'disponivel';
      else if (estoqueStatusFiltro === 'consignada') matchStatus = p.status === 'consignada';
      else if (estoqueStatusFiltro === 'parada') {
        matchStatus = pecasParadas.some(item => item.peca.id === p.id);
      }

      return matchBusca && matchTipo && matchStatus;
    });
  }, [pecas, estoqueBusca, estoqueTipoFiltro, estoqueStatusFiltro, pecasParadas]);

  const estoqueMetricas = useMemo(() => {
    const totalItens = estoqueFiltrado.reduce((acc, p) => acc + p.quantidade, 0);
    const custoTotal = estoqueFiltrado.reduce((acc, p) => acc + (p.valorCompra * p.quantidade), 0);
    const vendaTotal = estoqueFiltrado.reduce((acc, p) => acc + (p.precoVenda * p.quantidade), 0);
    const lucroBruto = vendaTotal - custoTotal;
    const margemMedia = custoTotal > 0 ? (lucroBruto / custoTotal) * 100 : 0;
    return { totalItens, custoTotal, vendaTotal, lucroBruto, margemMedia };
  }, [estoqueFiltrado]);

  // ==========================================
  // DADOS FILTRADOS: VENDAS
  // ==========================================
  const vendasFiltradas = useMemo(() => {
    const hojeStr = new Date().toISOString().split('T')[0];
    const dataHoje = new Date();

    return vendas.filter(v => {
      const matchBusca = 
        v.clienteNome.toLowerCase().includes(vendasBusca.toLowerCase()) ||
        v.clienteTelefone.includes(vendasBusca) ||
        v.id.toLowerCase().includes(vendasBusca.toLowerCase()) ||
        v.itens.some(i => i.descricao.toLowerCase().includes(vendasBusca.toLowerCase()) || i.codigo.toLowerCase().includes(vendasBusca.toLowerCase()));

      const matchPgto = vendasFormaPgto === 'todos' || v.formaPagamento === vendasFormaPgto;

      let matchPeriodo = true;
      if (vendasPeriodo === 'hoje') {
        matchPeriodo = v.dataVenda === hojeStr;
      } else if (vendasPeriodo === '7dias') {
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
        matchPeriodo = new Date(v.dataVenda) >= seteDiasAtras;
      } else if (vendasPeriodo === 'mes') {
        const mesAtual = dataHoje.getMonth();
        const anoAtual = dataHoje.getFullYear();
        const dVenda = new Date(v.dataVenda);
        matchPeriodo = dVenda.getMonth() === mesAtual && dVenda.getFullYear() === anoAtual;
      } else if (vendasPeriodo === 'ano') {
        const anoAtual = dataHoje.getFullYear();
        matchPeriodo = new Date(v.dataVenda).getFullYear() === anoAtual;
      }

      return matchBusca && matchPgto && matchPeriodo;
    });
  }, [vendas, vendasBusca, vendasFormaPgto, vendasPeriodo]);

  const vendasMetricas = useMemo(() => {
    const faturamento = vendasFiltradas.reduce((acc, v) => acc + v.valorTotal, 0);
    const subtotal = vendasFiltradas.reduce((acc, v) => acc + v.valorSubtotal, 0);
    const descontos = vendasFiltradas.reduce((acc, v) => acc + v.desconto, 0);
    const totalPecas = vendasFiltradas.reduce((acc, v) => acc + v.itens.reduce((iAcc, i) => iAcc + i.quantidade, 0), 0);
    const ticketMedio = vendasFiltradas.length > 0 ? faturamento / vendasFiltradas.length : 0;
    return { faturamento, subtotal, descontos, totalPecas, ticketMedio };
  }, [vendasFiltradas]);

  // ==========================================
  // DADOS FILTRADOS: INADIMPLÊNCIA
  // ==========================================
  const inadimplenciaFiltrada = useMemo(() => {
    return parcelasPendentesOuAtrasadas.filter(item => {
      const matchBusca = 
        item.venda.clienteNome.toLowerCase().includes(inadimplenciaBusca.toLowerCase()) ||
        item.venda.clienteTelefone.includes(inadimplenciaBusca);

      if (inadimplenciaStatus === 'somente_atrasadas') {
        return matchBusca && item.isAtrasada;
      }
      return matchBusca;
    });
  }, [parcelasPendentesOuAtrasadas, inadimplenciaBusca, inadimplenciaStatus]);

  const inadimplenciaMetricas = useMemo(() => {
    const totalVencido = inadimplenciaFiltrada
      .filter(i => i.isAtrasada)
      .reduce((acc, i) => acc + i.parcela.valor, 0);
    const totalGeral = inadimplenciaFiltrada.reduce((acc, i) => acc + i.parcela.valor, 0);
    const totalCobancas = inadimplenciaFiltrada.length;
    const mediaDiasAtraso = inadimplenciaFiltrada.filter(i => i.isAtrasada).length > 0
      ? Math.round(inadimplenciaFiltrada.filter(i => i.isAtrasada).reduce((acc, i) => acc + i.diasAtraso, 0) / inadimplenciaFiltrada.filter(i => i.isAtrasada).length)
      : 0;
    return { totalVencido, totalGeral, totalCobancas, mediaDiasAtraso };
  }, [inadimplenciaFiltrada]);

  // ==========================================
  // AÇÕES: IMPRIMIR A4
  // ==========================================
  const handlePrint = () => {
    triggerPrintDocument('a4');
  };

  // ==========================================
  // AÇÕES: SALVAR ARQUIVO HTML STANDALONE
  // ==========================================
  const handleSaveHtml = () => {
    const elem = document.getElementById('printable-report-body');
    if (!elem) return;

    const titles: Record<ReportType, string> = {
      estoque: 'Relatório Individual de Estoque e Margens',
      vendas: 'Relatório Individual de Vendas e Faturamento',
      inadimplencia: 'Relatório Individual de Inadimplência e Cobranças',
      consolidado: 'Relatório Consolidado Executivo'
    };

    saveStandaloneHtmlDocument(
      `relatorio_${activeTab}_${new Date().toISOString().split('T')[0]}`,
      `${titles[activeTab]} - ${config.nomeEmpresa}`,
      elem.innerHTML,
      'a4'
    );
  };

  // ==========================================
  // AÇÕES: EXPORTAR EXCEL (.XLSX)
  // ==========================================
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const dataHoje = new Date().toISOString().split('T')[0];

    if (activeTab === 'estoque' || activeTab === 'consolidado') {
      const rows = estoqueFiltrado.map(p => ({
        'Código': p.codigo,
        'Referência': p.referencia,
        'Descrição': p.descricao,
        'Categoria': p.tipo,
        'Banho/Modelo': p.modelo,
        'Fornecedor': p.fornecedor || 'N/A',
        'Qtd em Estoque': p.quantidade,
        'Custo Unitário (R$)': p.valorCompra,
        'Preço Venda (R$)': p.precoVenda,
        'Margem Estimada (R$)': p.precoVenda - p.valorCompra,
        'Subtotal Venda (R$)': p.precoVenda * p.quantidade,
        'Subtotal Custo (R$)': p.valorCompra * p.quantidade,
        'Status': p.status,
        'Data Entrada': p.dataEntrada
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
    }

    if (activeTab === 'vendas' || activeTab === 'consolidado') {
      const rows = vendasFiltradas.map(v => ({
        'ID Venda': v.id,
        'Data': v.dataVenda,
        'Cliente': v.clienteNome,
        'Telefone': v.clienteTelefone,
        'Forma Pagamento': v.formaPagamento.toUpperCase(),
        'Qtd Itens': v.itens.reduce((acc, i) => acc + i.quantidade, 0),
        'Itens': v.itens.map(i => `${i.quantidade}x ${i.codigo} (${i.descricao})`).join('; '),
        'Subtotal (R$)': v.valorSubtotal,
        'Desconto (R$)': v.desconto,
        'Total Pago (R$)': v.valorTotal,
        'Status Pagamento': v.statusPagamento.toUpperCase()
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    }

    if (activeTab === 'inadimplencia' || activeTab === 'consolidado') {
      const rows = inadimplenciaFiltrada.map(i => ({
        'Cliente': i.venda.clienteNome,
        'Telefone': i.venda.clienteTelefone,
        'Parcela': `${i.parcela.numeroParcela}/${i.parcela.totalParcelas}`,
        'Data Vencimento': i.parcela.dataVencimento,
        'Valor da Parcela (R$)': i.parcela.valor,
        'Status': i.isAtrasada ? `Atrasada (${i.diasAtraso} dias)` : 'A Vencer',
        'Dias de Atraso': i.diasAtraso,
        'Chave Pix': config.chavePix
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Inadimplencia');
    }

    XLSX.writeFile(wb, `relatorio_${activeTab}_semijoias_${dataHoje}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 print-active-modal">
      
      {/* Top Floating Bar (Hidden on Print) */}
      <div className="no-print w-full max-w-5xl bg-stone-900 text-stone-100 rounded-2xl p-3 sm:p-4 shadow-2xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-2 z-50 my-2">
        
        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-950/90 p-1.5 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab('estoque')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'estoque'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Relatório de Estoque
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('vendas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'vendas'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Relatório de Vendas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inadimplencia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'inadimplencia'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Relatório de Inadimplência
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consolidado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'consolidado'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Consolidado Geral
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório (A4)
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Exportar dados para planilha Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Salvar Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={handleSaveHtml}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Salvar arquivo autônomo offline em HTML/PDF"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Salvar Arquivo
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-stone-800 hover:bg-rose-900/60 text-stone-400 hover:text-rose-200 rounded-xl text-xs ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtros Interativos (Ocultos na impressão) */}
      <div className="no-print w-full max-w-5xl bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-3">
        {activeTab === 'estoque' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={estoqueBusca}
                onChange={(e) => setEstoqueBusca(e.target.value)}
                placeholder="Buscar código, peça ou banho..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <select
                value={estoqueTipoFiltro}
                onChange={(e) => setEstoqueTipoFiltro(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="todos">Todas as Categorias</option>
                {['Brinco', 'Colar', 'Pulseira', 'Anel', 'Tornozeleira', 'Conjunto', 'Pingente', 'Gargantilha'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={estoqueStatusFiltro}
                onChange={(e) => setEstoqueStatusFiltro(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="todos">Todos os Status</option>
                <option value="disponivel">Apenas Disponíveis em Estoque</option>
                <option value="parada">Peças Paradas (+30 dias)</option>
                <option value="consignada">Peças Consignadas com Revendedoras</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'vendas' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={vendasBusca}
                onChange={(e) => setVendasBusca(e.target.value)}
                placeholder="Buscar cliente, telefone ou item..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <select
                value={vendasPeriodo}
                onChange={(e) => setVendasPeriodo(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="todos">Período: Todo o Histórico</option>
                <option value="hoje">Período: Vendas de Hoje</option>
                <option value="7dias">Período: Últimos 7 Dias</option>
                <option value="mes">Período: Este Mês</option>
                <option value="ano">Período: Este Ano</option>
              </select>
            </div>

            <div>
              <select
                value={vendasFormaPgto}
                onChange={(e) => setVendasFormaPgto(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="todos">Todas as Formas de Pagamento</option>
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="parcelado">Parcelado / Carnê</option>
                <option value="cartao_debito">Débito</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'inadimplencia' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={inadimplenciaBusca}
                onChange={(e) => setInadimplenciaBusca(e.target.value)}
                placeholder="Buscar devedor por nome ou WhatsApp..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <select
                value={inadimplenciaStatus}
                onChange={(e) => setInadimplenciaStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="somente_atrasadas">Somente Parcelas Vencidas (Em Atraso)</option>
                <option value="todas">Todas as Parcelas Pendentes (A Vencer + Atrasadas)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'consolidado' && (
          <div className="text-xs text-stone-600 flex items-center justify-between">
            <span>Visão Integrada Executiva: Faturamento consolidado, giro do estoque físico e carteira de cobranças.</span>
            <span className="font-bold text-amber-700">Atualizado em tempo real</span>
          </div>
        )}
      </div>

      {/* Main Printable Report Mount (Padrão A4 Retrato) */}
      <div 
        id="printable-report-body"
        className="w-full flex justify-center py-2 print-a4-sheet"
      >
        <div className="screen-a4-preview p-8 sm:p-10 rounded-2xl text-stone-900 font-sans relative border border-stone-200/90 print:p-0 print:border-none print:shadow-none">
          
          {/* Header Institucional do Relatório */}
          <div className="flex justify-between items-start border-b-2 border-stone-800 pb-5 mb-6">
            <div>
              <span className="text-[10px] tracking-widest text-amber-700 uppercase font-bold">
                Gestão & Inteligência • Semijoias Finas
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 tracking-wide mt-0.5">
                {config.nomeEmpresa.toUpperCase()}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Relatório analítico gerencial para controle de estoque, vendas e fluxo de cobranças.
              </p>
              <div className="text-[11px] text-stone-600 mt-1">
                <strong>Telefone:</strong> {config.telefoneContato} • <strong>Chave Pix:</strong> {config.chavePix}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-stone-900 text-amber-200 font-serif-luxury text-xs font-bold rounded-md uppercase tracking-wider mb-1.5">
                {activeTab === 'estoque' && 'Relatório Individual de Estoque'}
                {activeTab === 'vendas' && 'Relatório Individual de Vendas'}
                {activeTab === 'inadimplencia' && 'Relatório de Inadimplência'}
                {activeTab === 'consolidado' && 'Relatório Executivo Consolidado'}
              </div>
              <div className="text-xs text-stone-500">
                <strong>Gerado em:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Emissão Oficial para Fechamento
              </div>
            </div>
          </div>

          {/* =========================================================================
              CONTEÚDO 1: RELATÓRIO DE ESTOQUE
              ========================================================================= */}
          {(activeTab === 'estoque' || activeTab === 'consolidado') && (
            <div className="space-y-4 mb-8">
              
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h2 className="text-sm font-bold font-serif-luxury uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  Posição do Estoque & Margem Potencial
                </h2>
                <span className="text-xs text-stone-500">{estoqueFiltrado.length} modelos cadastrados</span>
              </div>

              {/* Cards de Métricas do Estoque */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Total de Peças</span>
                  <span className="text-lg font-serif-luxury font-bold text-stone-900 mt-0.5 block">
                    {estoqueMetricas.totalItens} un
                  </span>
                  <span className="text-[10px] text-stone-400">Em saldo físico</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Custo Investido</span>
                  <span className="text-lg font-serif-luxury font-bold text-stone-800 mt-0.5 block">
                    {formatCurrency(estoqueMetricas.custoTotal)}
                  </span>
                  <span className="text-[10px] text-stone-400">Preço de compra</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Valor de Venda</span>
                  <span className="text-lg font-serif-luxury font-bold text-amber-700 mt-0.5 block">
                    {formatCurrency(estoqueMetricas.vendaTotal)}
                  </span>
                  <span className="text-[10px] text-stone-400">Faturamento projetado</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Lucro Bruto Projetado</span>
                  <span className="text-lg font-serif-luxury font-bold text-emerald-700 mt-0.5 block">
                    +{formatCurrency(estoqueMetricas.lucroBruto)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{estoqueMetricas.margemMedia.toFixed(0)}% margem média</span>
                </div>
              </div>

              {/* Tabela do Estoque */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2.5">Código</th>
                      <th className="py-2 px-2.5">Descrição da Joia</th>
                      <th className="py-2 px-2.5">Tipo / Banho</th>
                      <th className="py-2 px-2.5 text-center">Qtd</th>
                      <th className="py-2 px-2.5 text-right">Custo</th>
                      <th className="py-2 px-2.5 text-right">Venda</th>
                      <th className="py-2 px-2.5 text-right">Total Venda</th>
                      <th className="py-2 px-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-[11px]">
                    {estoqueFiltrado.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-stone-400">Nenhuma peça encontrada com os filtros selecionados.</td>
                      </tr>
                    ) : (
                      estoqueFiltrado.map(p => (
                        <tr key={p.id} className="hover:bg-stone-50/60 print-avoid-break">
                          <td className="py-1.5 px-2.5 font-mono font-bold text-amber-900">{p.codigo}</td>
                          <td className="py-1.5 px-2.5 font-medium text-stone-800">{p.descricao}</td>
                          <td className="py-1.5 px-2.5 text-stone-600">{p.tipo} • {p.modelo}</td>
                          <td className="py-1.5 px-2.5 text-center font-bold">{p.quantidade}</td>
                          <td className="py-1.5 px-2.5 text-right text-stone-500">{formatCurrency(p.valorCompra)}</td>
                          <td className="py-1.5 px-2.5 text-right font-medium text-stone-800">{formatCurrency(p.precoVenda)}</td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-stone-900">{formatCurrency(p.precoVenda * p.quantidade)}</td>
                          <td className="py-1.5 px-2.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              p.status === 'disponivel' ? 'bg-emerald-100 text-emerald-800' :
                              p.status === 'consignada' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                            }`}>
                              {p.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-stone-100/80 font-bold border-t border-stone-300 text-xs">
                      <td colSpan={3} className="py-2 px-2.5 text-stone-900">TOTAIS DO ESTOQUE:</td>
                      <td className="py-2 px-2.5 text-center text-stone-900">{estoqueMetricas.totalItens} un</td>
                      <td className="py-2 px-2.5 text-right text-stone-700">{formatCurrency(estoqueMetricas.custoTotal)}</td>
                      <td className="py-2 px-2.5 text-right text-stone-700">-</td>
                      <td className="py-2 px-2.5 text-right text-stone-900 font-serif-luxury text-sm">{formatCurrency(estoqueMetricas.vendaTotal)}</td>
                      <td className="py-2 px-2.5 text-center text-emerald-800">+{formatCurrency(estoqueMetricas.lucroBruto)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          )}

          {/* =========================================================================
              CONTEÚDO 2: RELATÓRIO DE VENDAS
              ========================================================================= */}
          {(activeTab === 'vendas' || activeTab === 'consolidado') && (
            <div className="space-y-4 mb-8">
              
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h2 className="text-sm font-bold font-serif-luxury uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Extrato de Vendas & Movimentação Financeira
                </h2>
                <span className="text-xs text-stone-500">{vendasFiltradas.length} pedidos realizados</span>
              </div>

              {/* Cards de Métricas de Vendas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Faturamento Bruto</span>
                  <span className="text-lg font-serif-luxury font-bold text-stone-900 mt-0.5 block">
                    {formatCurrency(vendasMetricas.faturamento)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{vendasFiltradas.length} vendas no período</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Ticket Médio</span>
                  <span className="text-lg font-serif-luxury font-bold text-amber-800 mt-0.5 block">
                    {formatCurrency(vendasMetricas.ticketMedio)}
                  </span>
                  <span className="text-[10px] text-stone-400">Por atendimento</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Peças Comercializadas</span>
                  <span className="text-lg font-serif-luxury font-bold text-stone-800 mt-0.5 block">
                    {vendasMetricas.totalPecas} un
                  </span>
                  <span className="text-[10px] text-stone-400">Total de semijoias saídas</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Descontos Aplicados</span>
                  <span className="text-lg font-serif-luxury font-bold text-stone-600 mt-0.5 block">
                    {formatCurrency(vendasMetricas.descontos)}
                  </span>
                  <span className="text-[10px] text-stone-400">Negociação com clientes</span>
                </div>
              </div>

              {/* Tabela de Vendas */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2.5">Data / ID</th>
                      <th className="py-2 px-2.5">Cliente</th>
                      <th className="py-2 px-2.5">Peças Compradas</th>
                      <th className="py-2 px-2.5 text-center">Forma Pgto</th>
                      <th className="py-2 px-2.5 text-right">Subtotal</th>
                      <th className="py-2 px-2.5 text-right">Desc.</th>
                      <th className="py-2 px-2.5 text-right">Total Pago</th>
                      <th className="py-2 px-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-[11px]">
                    {vendasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-stone-400">Nenhuma venda no período ou filtros selecionados.</td>
                      </tr>
                    ) : (
                      vendasFiltradas.map(v => (
                        <tr key={v.id} className="hover:bg-stone-50/60 print-avoid-break">
                          <td className="py-1.5 px-2.5">
                            <div className="font-bold text-stone-900">{formatDate(v.dataVenda)}</div>
                            <div className="text-[9px] font-mono text-stone-400">#{v.id}</div>
                          </td>
                          <td className="py-1.5 px-2.5">
                            <div className="font-medium text-stone-900">{v.clienteNome}</div>
                            <div className="text-[9px] text-stone-500">{v.clienteTelefone}</div>
                          </td>
                          <td className="py-1.5 px-2.5">
                            <div className="text-stone-700 line-clamp-2">
                              {v.itens.map(i => `${i.quantidade}x ${i.codigo} - ${i.descricao}`).join(', ')}
                            </div>
                          </td>
                          <td className="py-1.5 px-2.5 text-center capitalize text-stone-700">
                            {v.formaPagamento.replace('_', ' ')}
                            {v.parcelas.length > 1 && ` (${v.parcelas.length}x)`}
                          </td>
                          <td className="py-1.5 px-2.5 text-right text-stone-500">{formatCurrency(v.valorSubtotal)}</td>
                          <td className="py-1.5 px-2.5 text-right text-stone-500">
                            {v.desconto > 0 ? `-${formatCurrency(v.desconto)}` : '-'}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-stone-900">
                            {formatCurrency(v.valorTotal)}
                          </td>
                          <td className="py-1.5 px-2.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              v.statusPagamento === 'pago' ? 'bg-emerald-100 text-emerald-800' :
                              v.statusPagamento === 'atrasado' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {v.statusPagamento}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-stone-100/80 font-bold border-t border-stone-300 text-xs">
                      <td colSpan={4} className="py-2 px-2.5 text-stone-900">TOTAL FATURAMENTO VENDAS:</td>
                      <td className="py-2 px-2.5 text-right text-stone-600">{formatCurrency(vendasMetricas.subtotal)}</td>
                      <td className="py-2 px-2.5 text-right text-stone-600">-{formatCurrency(vendasMetricas.descontos)}</td>
                      <td className="py-2 px-2.5 text-right text-stone-900 font-serif-luxury text-sm">{formatCurrency(vendasMetricas.faturamento)}</td>
                      <td className="py-2 px-2.5 text-center text-stone-600">{vendasFiltradas.length} vendas</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          )}

          {/* =========================================================================
              CONTEÚDO 3: RELATÓRIO DE INADIMPLÊNCIA & COBRANÇAS
              ========================================================================= */}
          {(activeTab === 'inadimplencia' || activeTab === 'consolidado') && (
            <div className="space-y-4 mb-8">
              
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h2 className="text-sm font-bold font-serif-luxury uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Carteira de Cobrança & Inadimplência
                </h2>
                <span className="text-xs text-rose-700 font-bold">{inadimplenciaFiltrada.length} cobranças listadas</span>
              </div>

              {/* Cards de Métricas da Inadimplência */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3">
                  <span className="text-rose-700 text-[10px] uppercase font-bold block">Total em Atraso (Vencido)</span>
                  <span className="text-lg font-serif-luxury font-bold text-rose-700 mt-0.5 block">
                    {formatCurrency(inadimplenciaMetricas.totalVencido)}
                  </span>
                  <span className="text-[10px] text-rose-600 font-medium">Requer lembrete WhatsApp</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Total a Vencer Futuro</span>
                  <span className="text-lg font-serif-luxury font-bold text-stone-800 mt-0.5 block">
                    {formatCurrency(inadimplenciaMetricas.totalGeral - inadimplenciaMetricas.totalVencido)}
                  </span>
                  <span className="text-[10px] text-stone-400">Parcelas dentro do prazo</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Cobranças Pendentes</span>
                  <span className="text-lg font-serif-luxury font-bold text-stone-900 mt-0.5 block">
                    {inadimplenciaMetricas.totalCobancas} parcelas
                  </span>
                  <span className="text-[10px] text-stone-400">Contratos a prazo</span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Média de Atraso</span>
                  <span className="text-lg font-serif-luxury font-bold text-amber-800 mt-0.5 block">
                    {inadimplenciaMetricas.mediaDiasAtraso} dias
                  </span>
                  <span className="text-[10px] text-stone-400">Tempo de pendência</span>
                </div>
              </div>

              {/* Tabela de Inadimplência */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2.5">Cliente Devedor(a)</th>
                      <th className="py-2 px-2.5">WhatsApp / Contato</th>
                      <th className="py-2 px-2.5 text-center">Parcela</th>
                      <th className="py-2 px-2.5 text-center">Vencimento</th>
                      <th className="py-2 px-2.5 text-center">Dias de Atraso</th>
                      <th className="py-2 px-2.5 text-right">Valor da Parcela</th>
                      <th className="py-2 px-2.5 text-center">Status / Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-[11px]">
                    {inadimplenciaFiltrada.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-stone-400">
                          Nenhuma pendência ou atraso registrado. Parabéns! A inadimplência está zerada.
                        </td>
                      </tr>
                    ) : (
                      inadimplenciaFiltrada.map((item, idx) => (
                        <tr key={idx} className={`hover:bg-stone-50/60 print-avoid-break ${item.isAtrasada ? 'bg-rose-50/30' : ''}`}>
                          <td className="py-2 px-2.5 font-bold text-stone-900">
                            {item.venda.clienteNome}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-stone-700">
                            {item.venda.clienteTelefone}
                          </td>
                          <td className="py-2 px-2.5 text-center font-medium">
                            {item.parcela.numeroParcela} / {item.parcela.totalParcelas}
                          </td>
                          <td className="py-2 px-2.5 text-center font-mono">
                            {formatDate(item.parcela.dataVencimento)}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            {item.isAtrasada ? (
                              <span className="font-bold text-rose-700">+{item.diasAtraso} dias</span>
                            ) : (
                              <span className="text-stone-400">Em dia</span>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-right font-bold text-stone-900">
                            {formatCurrency(item.parcela.valor)}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.isAtrasada 
                                ? 'bg-rose-100 text-rose-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.isAtrasada ? 'Vencida' : 'A Vencer'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-stone-100/80 font-bold border-t border-stone-300 text-xs">
                      <td colSpan={5} className="py-2 px-2.5 text-stone-900">TOTAL DE RECEBÍVEIS EM ABERTO:</td>
                      <td className="py-2 px-2.5 text-right text-rose-700 font-serif-luxury text-sm">
                        {formatCurrency(inadimplenciaMetricas.totalGeral)}
                      </td>
                      <td className="py-2 px-2.5 text-center text-xs text-rose-700">
                        {inadimplenciaMetricas.totalCobancas} parcelas
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          )}

          <div className="mt-8 text-center text-[10px] text-stone-400 border-t border-stone-100 pt-3">
            Página emitida a partir do Sistema de Gestão {config.nomeEmpresa} • Relatório Oficial Confidencial
          </div>

        </div>
      </div>

    </div>
  );
};
