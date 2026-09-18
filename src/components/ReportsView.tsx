import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Clock, 
  AlertCircle, 
  ArrowDownToLine, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  PieChart, 
  Users,
  ShieldAlert,
  Printer,
  FileSpreadsheet,
  Layers,
  Eye,
  FileText
} from 'lucide-react';
import { ReportModal, ReportType } from './ReportModal';
import { formatCurrency, triggerPrintDocument, saveStandaloneHtmlDocument } from '../utils/printHelpers';

export const ReportsView: React.FC = () => {
  const { 
    vendas, 
    pecas, 
    compras, 
    pecasParadas, 
    parcelasPendentesOuAtrasadas, 
    kpis, 
    config 
  } = useApp();

  const [modalReportType, setModalReportType] = useState<ReportType | null>(null);

  // Vendas por forma de pagamento
  const vendasPorPagamento: Record<string, { total: number; qtd: number }> = {};
  vendas.forEach(v => {
    const key = v.formaPagamento;
    if (!vendasPorPagamento[key]) {
      vendasPorPagamento[key] = { total: 0, qtd: 0 };
    }
    vendasPorPagamento[key].total += v.valorTotal;
    vendasPorPagamento[key].qtd += 1;
  });

  // Distribuição por Tipo de Peça no estoque
  const estoquePorTipo: Record<string, { qtd: number; valorVenda: number; valorCusto: number }> = {};
  pecas.filter(p => p.status === 'disponivel').forEach(p => {
    if (!estoquePorTipo[p.tipo]) {
      estoquePorTipo[p.tipo] = { qtd: 0, valorVenda: 0, valorCusto: 0 };
    }
    estoquePorTipo[p.tipo].qtd += p.quantidade;
    estoquePorTipo[p.tipo].valorVenda += p.precoVenda * p.quantidade;
    estoquePorTipo[p.tipo].valorCusto += p.valorCompra * p.quantidade;
  });

  // Exportar Relatório Geral Consolidado para Excel
  const handleExportarExcelRelatorio = () => {
    const wb = XLSX.utils.book_new();

    // Aba Vendas
    const vendasData = vendas.map(v => ({
      ID: v.id,
      Data: v.dataVenda,
      Cliente: v.clienteNome,
      Telefone: v.clienteTelefone,
      FormaPagamento: v.formaPagamento,
      Status: v.statusPagamento,
      Subtotal: v.valorSubtotal,
      Desconto: v.desconto,
      ValorTotal: v.valorTotal,
      QtdItens: v.itens.length
    }));
    const wsVendas = XLSX.utils.json_to_sheet(vendasData);
    XLSX.utils.book_append_sheet(wb, wsVendas, 'Vendas');

    // Aba Estoque
    const estoqueData = pecas.map(p => ({
      Codigo: p.codigo,
      Referencia: p.referencia,
      Descricao: p.descricao,
      Tipo: p.tipo,
      Modelo: p.modelo,
      NotaFiscal: p.notaFiscal,
      CustoCompra: p.valorCompra,
      PrecoVenda: p.precoVenda,
      Quantidade: p.quantidade,
      Status: p.status,
      DataEntrada: p.dataEntrada
    }));
    const wsEstoque = XLSX.utils.json_to_sheet(estoqueData);
    XLSX.utils.book_append_sheet(wb, wsEstoque, 'Estoque');

    // Aba Inadimplência
    const inadimplenciaData = parcelasPendentesOuAtrasadas.map(i => ({
      Cliente: i.venda.clienteNome,
      Telefone: i.venda.clienteTelefone,
      Parcela: `${i.parcela.numeroParcela}/${i.parcela.totalParcelas}`,
      Vencimento: i.parcela.dataVencimento,
      Valor: i.parcela.valor,
      Status: i.isAtrasada ? `Atrasada (${i.diasAtraso} dias)` : 'Pendente em dia'
    }));
    const wsInadimplencia = XLSX.utils.json_to_sheet(inadimplenciaData);
    XLSX.utils.book_append_sheet(wb, wsInadimplencia, 'Inadimplencia');

    // Salvar
    XLSX.writeFile(wb, `relatorio_geral_semijoias_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const ticketMedio = vendas.length > 0 ? kpis.faturamentoTotal / vendas.length : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Inteligência, Impressão & Exportação
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
            Central de Relatórios & Fechamentos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gere relatórios individuais para visualização imediata, impressão em padrão A4 e download em arquivo (Excel/HTML).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalReportType('consolidado')}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Visualizar & Imprimir Consolidado
          </button>

          <button
            onClick={handleExportarExcelRelatorio}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Salvar Todos no Excel
          </button>
        </div>
      </div>

      {/* PAINEL DE RELATÓRIOS INDIVIDUAIS (VISUALIZAÇÃO IMEDIATA, SALVAR & IMPRIMIR) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Relatório de Estoque */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-stone-900">
                Relatório de Estoque
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Posição física de peças, custos de compra, preço de venda, margens potenciais e alerta de peças paradas.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-between text-xs text-stone-600">
              <span>Peças cadastradas:</span>
              <span className="font-bold text-stone-900">{kpis.totalPecasEstoque} un</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Valor em venda:</span>
              <span className="font-bold text-amber-700">{formatCurrency(kpis.valorEstoqueVenda)}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setModalReportType('estoque')}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Visualizar & Imprimir
            </button>
          </div>
        </div>

        {/* Card 2: Relatório de Vendas */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-stone-900">
                Relatório de Vendas
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Extrato cronológico de faturamento por período, ticket médio, meios de pagamento e saída de semijoias.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-between text-xs text-stone-600">
              <span>Total finalizado:</span>
              <span className="font-bold text-stone-900">{vendas.length} pedidos</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Faturamento total:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(kpis.faturamentoTotal)}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setModalReportType('vendas')}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Visualizar & Imprimir
            </button>
          </div>
        </div>

        {/* Card 3: Relatório de Inadimplência */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-stone-900">
                Relatório de Inadimplência
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Carteira de cobrança, clientes com parcelas vencidas, dias de atraso e lista de contatos para acerto.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-between text-xs text-stone-600">
              <span>Parcelas vencidas:</span>
              <span className="font-bold text-rose-700">{parcelasPendentesOuAtrasadas.filter(p => p.isAtrasada).length} pendências</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Total vencido em aberto:</span>
              <span className="font-bold text-rose-700">{formatCurrency(kpis.totalInadimplente)}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setModalReportType('inadimplencia')}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Visualizar & Imprimir
            </button>
          </div>
        </div>

      </div>

      {/* Cards de Resumo Executivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-stone-500 font-semibold block uppercase">Total Vendas Histórico</span>
          <div className="text-2xl font-bold text-stone-900 font-serif-luxury mt-1">
            {formatCurrency(kpis.faturamentoTotal)}
          </div>
          <span className="text-stone-400 mt-1 block">{vendas.length} pedidos finalizados</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-stone-500 font-semibold block uppercase">Ticket Médio por Venda</span>
          <div className="text-2xl font-bold text-stone-900 font-serif-luxury mt-1">
            {formatCurrency(ticketMedio)}
          </div>
          <span className="text-emerald-700 font-medium mt-1 block">Média por cliente atendido</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-stone-500 font-semibold block uppercase">Capital Parado no Estoque</span>
          <div className="text-2xl font-bold text-amber-700 font-serif-luxury mt-1">
            {pecasParadas.length} peças
          </div>
          <span className="text-stone-400 mt-1 block">+{config.diasPecaParadaAlerta} dias sem girar</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-stone-500 font-semibold block uppercase">Inadimplência em Aberto</span>
          <div className="text-2xl font-bold text-rose-600 font-serif-luxury mt-1">
            {formatCurrency(kpis.totalInadimplente)}
          </div>
          <span className="text-stone-400 mt-1 block">{parcelasPendentesOuAtrasadas.filter(p => p.isAtrasada).length} cobranças pendentes</span>
        </div>
      </div>

      {/* Grid: 2 Colunas com Análises Estruturadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vendas por Meio de Pagamento */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-stone-900 font-serif-luxury text-sm">
                Faturamento por Forma de Pagamento
              </h3>
            </div>
            <span className="text-xs text-stone-500">{vendas.length} transações</span>
          </div>

          <div className="space-y-3 text-xs">
            {Object.keys(vendasPorPagamento).length === 0 ? (
              <div className="py-6 text-center text-stone-400">Nenhuma venda registrada ainda.</div>
            ) : (
              Object.entries(vendasPorPagamento).map(([forma, dados]) => {
                const percentual = kpis.faturamentoTotal > 0 ? (dados.total / kpis.faturamentoTotal) * 100 : 0;
                return (
                  <div key={forma} className="space-y-1">
                    <div className="flex justify-between font-semibold text-stone-800">
                      <span className="capitalize">{forma.replace('_', ' ')} ({dados.qtd}x)</span>
                      <span>{formatCurrency(dados.total)} ({percentual.toFixed(1)}%)</span>
                    </div>
                    {/* Barra de Progresso */}
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribuição do Estoque por Categoria */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-stone-900 font-serif-luxury text-sm">
                Estoque & Margem Potencial por Categoria
              </h3>
            </div>
            <span className="text-xs text-stone-500">{kpis.totalPecasEstoque} unidades</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(estoquePorTipo).map(([tipo, dados]) => (
              <div key={tipo} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 block">{tipo}</span>
                  <span className="text-stone-500 text-[11px]">{dados.qtd} un em estoque</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 block">{formatCurrency(dados.valorVenda)}</span>
                  <span className="text-emerald-700 text-[10px] font-semibold">
                    +{formatCurrency(dados.valorVenda - dados.valorCusto)} lucro
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL DE RELATÓRIO INDIVIDUAL OU CONSOLIDADO (IMPRESSÃO A4 & DOWNLOAD) */}
      {modalReportType && (
        <ReportModal
          reportType={modalReportType}
          onClose={() => setModalReportType(null)}
        />
      )}

    </div>
  );
};
