import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Clock, 
  Send, 
  CheckCircle, 
  Phone, 
  DollarSign, 
  Filter, 
  Search,
  Calendar,
  Sparkles,
  Printer
} from 'lucide-react';
import { ReportModal } from './ReportModal';
import { WhatsAppDebtSchedulerModal } from './WhatsAppDebtSchedulerModal';
import { formatDate } from '../utils/printHelpers';

export const OverdueDebts: React.FC = () => {
  const { 
    parcelasPendentesOuAtrasadas, 
    marcarParcelaPaga, 
    config,
    debitosProximosAoVencimento,
    agendamentosWhatsApp
  } = useApp();

  const [somenteAtrasadas, setSomenteAtrasadas] = useState(true);
  const [busca, setBusca] = useState('');
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [schedulerModalOpen, setSchedulerModalOpen] = useState(false);
  const [selectedDebtForSchedule, setSelectedDebtForSchedule] = useState<{ parcelaId?: string; vendaId?: string } | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const listaFiltrada = parcelasPendentesOuAtrasadas.filter(item => {
    const matchBusca = 
      item.venda.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      item.venda.clienteTelefone.includes(busca);

    if (somenteAtrasadas) {
      return matchBusca && item.isAtrasada;
    }
    return matchBusca;
  });

  const totalEmAtraso = parcelasPendentesOuAtrasadas
    .filter(i => i.isAtrasada)
    .reduce((acc, i) => acc + i.parcela.valor, 0);

  const totalPendenteGeral = parcelasPendentesOuAtrasadas
    .reduce((acc, i) => acc + i.parcela.valor, 0);

  const handleEnviarLembreteCobranca = (item: typeof parcelasPendentesOuAtrasadas[0]) => {
    const limpo = item.venda.clienteTelefone.replace(/\D/g, '');
    const num = limpo.startsWith('55') ? limpo : `55${limpo}`;

    const saudacao = item.isAtrasada 
      ? `Olá, *${item.venda.clienteNome}*! Tudo bem? Esperamos que esteja tudo ótimo por aí! ✨`
      : `Olá, *${item.venda.clienteNome}*! Passando apenas para lembrar com carinho da sua parcela a vencer na ${config.nomeEmpresa}. ✨`;

    const texto = `${saudacao}\n\n` +
      `Gostaríamos de lembrar sobre a parcela *${item.parcela.numeroParcela}/${item.parcela.totalParcelas}* referente à sua compra de semijoias:\n` +
      `💰 *Valor:* ${formatCurrency(item.parcela.valor)}\n` +
      `📅 *Vencimento:* ${formatDate(item.parcela.dataVencimento)} ${item.isAtrasada ? `(vencida há ${item.diasAtraso} dia(s))` : ''}\n\n` +
      `🔑 *Chave Pix para pagamento:* ${config.chavePix} (${config.tipoChavePix.toUpperCase()})\n\n` +
      `Após o pagamento, pode nos enviar o comprovante por aqui. Muito obrigado pela preferência e confiança! 💖`;

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const handleDarBaixa = (vendaId: string, parcelaId: string, clienteNome: string) => {
    if (confirm(`Confirmar recebimento do pagamento da parcela de ${clienteNome}?`)) {
      marcarParcelaPaga(vendaId, parcelaId);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
            Controle de Inadimplência
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
            Cobranças & Parcelas em Atraso
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Acompanhe carnês e vendas a prazo, envie lembretes amigáveis via WhatsApp e dê baixa nos pagamentos.
          </p>
        </div>

        {/* Totais Rápidos e Ações de Agendamento */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedDebtForSchedule(null);
              setSchedulerModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            title="Agendar mensagens no WhatsApp para clientes com débitos próximos ao vencimento"
          >
            <Calendar className="w-4 h-4 text-emerald-200" />
            <span>Agendador WhatsApp</span>
            {agendamentosWhatsApp.filter(a => a.statusEnvio === 'agendado').length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-800 text-white text-[10px] font-extrabold rounded-full">
                {agendamentosWhatsApp.filter(a => a.statusEnvio === 'agendado').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowRelatorio(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Visualizar, salvar e imprimir relatório individual de inadimplência"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            Relatório de Inadimplência
          </button>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-right">
            <span className="text-[10px] text-rose-700 font-semibold block uppercase">Total Vencido</span>
            <span className="text-lg font-bold font-serif-luxury text-rose-700">{formatCurrency(totalEmAtraso)}</span>
          </div>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-right">
            <span className="text-[10px] text-stone-500 font-semibold block uppercase">A Vencer</span>
            <span className="text-lg font-bold font-serif-luxury text-stone-800">{formatCurrency(totalPendenteGeral - totalEmAtraso)}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome do cliente ou telefone..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSomenteAtrasadas(true)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              somenteAtrasadas 
                ? 'bg-rose-600 text-white' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Apenas Vencidas ({parcelasPendentesOuAtrasadas.filter(i => i.isAtrasada).length})
          </button>
          <button
            onClick={() => setSomenteAtrasadas(false)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              !somenteAtrasadas 
                ? 'bg-stone-900 text-white' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todas as Parcelas Abertas ({parcelasPendentesOuAtrasadas.length})
          </button>
        </div>
      </div>

      {/* Lista de Cobranças */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {listaFiltrada.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">Tudo em dia!</p>
            <p className="text-xs text-stone-400 mt-1">Nenhuma parcela pendente encontrada com esses critérios.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {listaFiltrada.map((item) => (
              <div 
                key={item.parcela.id} 
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  item.isAtrasada ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    item.isAtrasada ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {item.isAtrasada ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-900">{item.venda.clienteNome}</h4>
                      {item.isAtrasada ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                          Vencida há {item.diasAtraso} dias
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                          A vencer em breve
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-500 flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {item.venda.clienteTelefone}
                      </span>
                      <span>•</span>
                      <span>Parcela: <strong>{item.parcela.numeroParcela} de {item.parcela.totalParcelas}</strong></span>
                      <span>•</span>
                      <span>Vencimento: <strong className="text-stone-800">{formatDate(item.parcela.dataVencimento)}</strong></span>
                    </div>

                    {item.venda.itens && item.venda.itens.length > 0 && (
                      <div className="text-[11px] text-stone-400 mt-1">
                        Compra: {item.venda.itens.map(i => i.descricao).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Valor & Ações de Cobrança */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Valor da Parcela:</span>
                    <span className="text-base font-bold font-serif-luxury text-stone-900">
                      {formatCurrency(item.parcela.valor)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDebtForSchedule({
                          parcelaId: item.parcela.id,
                          vendaId: item.venda.id
                        });
                        setSchedulerModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors border border-stone-200"
                      title="Agendar mensagem no WhatsApp selecionando modelo de cobrança"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Agendar</span>
                    </button>

                    <button
                      onClick={() => handleEnviarLembreteCobranca(item)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                      title="Enviar lembrete amigável via WhatsApp com chave Pix agora"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Cobrar no WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleDarBaixa(item.venda.id, item.parcela.id, item.venda.clienteNome)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Registrar recebimento da parcela"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dar Baixa</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE AGENDAMENTO DE MENSAGENS NO WHATSAPP */}
      <WhatsAppDebtSchedulerModal
        isOpen={schedulerModalOpen}
        onClose={() => {
          setSchedulerModalOpen(false);
          setSelectedDebtForSchedule(null);
        }}
        initialParcelaId={selectedDebtForSchedule?.parcelaId}
        initialVendaId={selectedDebtForSchedule?.vendaId}
      />

      {/* MODAL DE RELATÓRIO INDIVIDUAL DE INADIMPLÊNCIA */}
      {showRelatorio && (
        <ReportModal
          reportType="inadimplencia"
          onClose={() => setShowRelatorio(false)}
        />
      )}

    </div>
  );
};
