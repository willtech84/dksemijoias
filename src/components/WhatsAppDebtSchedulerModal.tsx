import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AgendamentoMensagemWhatsApp, 
  ModeloMensagemCobranca 
} from '../types';
import { 
  Calendar, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Plus, 
  MessageSquare, 
  X, 
  Copy, 
  Check, 
  Sparkles,
  Phone,
  User,
  DollarSign,
  Filter,
  ArrowRight,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { formatDate } from '../utils/printHelpers';

interface WhatsAppDebtSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParcelaId?: string;
  initialVendaId?: string;
}

export const WhatsAppDebtSchedulerModal: React.FC<WhatsAppDebtSchedulerModalProps> = ({
  isOpen,
  onClose,
  initialParcelaId,
  initialVendaId
}) => {
  const { 
    debitosProximosAoVencimento, 
    modelosMensagemCobranca,
    agendamentosWhatsApp,
    agendarMensagemWhatsApp,
    atualizarStatusAgendamento,
    excluirAgendamento,
    addModeloMensagemCobranca,
    updateModeloMensagemCobranca,
    deleteModeloMensagemCobranca,
    config
  } = useApp();

  const [abaAtiva, setAbaAtiva] = useState<'proximos' | 'agendados' | 'modelos'>('proximos');
  const [filtroVencimento, setFiltroVencimento] = useState<'todos' | 'hoje' | 'amanha' | '3dias' | 'atrasados'>('todos');
  
  // Item em edição de agendamento
  const [itemSelecionado, setItemSelecionado] = useState<typeof debitosProximosAoVencimento[0] | null>(() => {
    if (initialParcelaId && initialVendaId) {
      return debitosProximosAoVencimento.find(
        d => d.parcela.id === initialParcelaId && d.venda.id === initialVendaId
      ) || debitosProximosAoVencimento[0] || null;
    }
    return debitosProximosAoVencimento[0] || null;
  });

  const [modeloIdSelecionado, setModeloIdSelecionado] = useState<string>(
    modelosMensagemCobranca[0]?.id || ''
  );
  
  // Data e hora do agendamento
  const hojeStr = new Date().toISOString().split('T')[0];
  const [dataAgendamento, setDataAgendamento] = useState<string>(hojeStr);
  const [horaAgendamento, setHoraAgendamento] = useState<string>('09:30');
  const [textoPersonalizado, setTextoPersonalizado] = useState<string>('');
  const [copiado, setCopiado] = useState(false);
  const [sucessoFeedback, setSucessoFeedback] = useState<string | null>(null);

  // Modal para criar/editar modelo de mensagem
  const [modalModeloAberto, setModalModeloAberto] = useState(false);
  const [modeloEmEdicao, setModeloEmEdicao] = useState<ModeloMensagemCobranca | null>(null);
  const [formTituloModelo, setFormTituloModelo] = useState('');
  const [formTipoModelo, setFormTipoModelo] = useState<ModeloMensagemCobranca['tipo']>('preventivo');
  const [formTextoModelo, setFormTextoModelo] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Atualizar texto quando muda o item selecionado ou o modelo
  React.useEffect(() => {
    if (!itemSelecionado) return;
    const modelo = modelosMensagemCobranca.find(m => m.id === modeloIdSelecionado) || modelosMensagemCobranca[0];
    if (!modelo) return;

    const dataVencFormatada = formatDate(itemSelecionado.parcela.dataVencimento);
    const dias = Math.abs(itemSelecionado.diasAteVencimento);

    const txt = modelo.texto
      .replace(/{cliente}/g, itemSelecionado.venda.clienteNome)
      .replace(/{valor}/g, formatCurrency(itemSelecionado.parcela.valor))
      .replace(/{vencimento}/g, dataVencFormatada)
      .replace(/{dias}/g, String(dias))
      .replace(/{chavePix}/g, config.chavePix)
      .replace(/{tipoPix}/g, config.tipoChavePix.toUpperCase())
      .replace(/{empresa}/g, config.nomeEmpresa)
      .replace(/{telefone}/g, config.telefoneContato)
      .replace(/{parcela}/g, `${itemSelecionado.parcela.numeroParcela}/${itemSelecionado.parcela.totalParcelas}`);

    setTextoPersonalizado(txt);
  }, [itemSelecionado, modeloIdSelecionado, modelosMensagemCobranca, config]);

  if (!isOpen) return null;

  // Filtragem dos débitos
  const debitosFiltrados = debitosProximosAoVencimento.filter(item => {
    if (filtroVencimento === 'hoje') return item.diasAteVencimento === 0;
    if (filtroVencimento === 'amanha') return item.diasAteVencimento === 1;
    if (filtroVencimento === '3dias') return item.diasAteVencimento >= 0 && item.diasAteVencimento <= 3;
    if (filtroVencimento === 'atrasados') return item.diasAteVencimento < 0;
    return true;
  });

  const handleSalvarAgendamento = () => {
    if (!itemSelecionado) return;

    agendarMensagemWhatsApp({
      vendaId: itemSelecionado.venda.id,
      parcelaId: itemSelecionado.parcela.id,
      clienteId: itemSelecionado.venda.clienteId,
      clienteNome: itemSelecionado.venda.clienteNome,
      clienteTelefone: itemSelecionado.venda.clienteTelefone,
      valorParcela: itemSelecionado.parcela.valor,
      dataVencimento: itemSelecionado.parcela.dataVencimento,
      diasAteVencimento: itemSelecionado.diasAteVencimento,
      modeloMensagemId: modeloIdSelecionado,
      mensagemFinal: textoPersonalizado,
      dataAgendamento,
      horarioAgendamento: horaAgendamento
    });

    setSucessoFeedback('Mensagem agendada com sucesso!');
    setTimeout(() => setSucessoFeedback(null), 3000);
    setAbaAtiva('agendados');
  };

  const handleDispararWhatsAppAgora = (telefone: string, texto: string, agendamentoId?: string) => {
    const limpo = telefone.replace(/\D/g, '');
    const tel = limpo.startsWith('55') ? limpo : `55${limpo}`;
    const url = `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');

    if (agendamentoId) {
      atualizarStatusAgendamento(agendamentoId, 'enviado');
    }
  };

  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(textoPersonalizado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Gerenciamento de modelos
  const handleOpenCriarModelo = () => {
    setModeloEmEdicao(null);
    setFormTituloModelo('');
    setFormTipoModelo('preventivo');
    setFormTextoModelo(
      'Olá, {cliente}! Passando com carinho para lembrar que sua parcela de {valor} vence em {vencimento}. Chave Pix: {chavePix} ({tipoPix}). Gratidão!'
    );
    setModalModeloAberto(true);
  };

  const handleOpenEditarModelo = (mod: ModeloMensagemCobranca) => {
    setModeloEmEdicao(mod);
    setFormTituloModelo(mod.titulo);
    setFormTipoModelo(mod.tipo);
    setFormTextoModelo(mod.texto);
    setModalModeloAberto(true);
  };

  const handleSalvarModeloModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTituloModelo.trim() || !formTextoModelo.trim()) return;

    if (modeloEmEdicao) {
      updateModeloMensagemCobranca(modeloEmEdicao.id, {
        titulo: formTituloModelo.trim(),
        tipo: formTipoModelo,
        texto: formTextoModelo.trim()
      });
    } else {
      addModeloMensagemCobranca({
        titulo: formTituloModelo.trim(),
        tipo: formTipoModelo,
        texto: formTextoModelo.trim()
      });
    }
    setModalModeloAberto(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white max-w-5xl w-full rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Comunicação & Cobrança Preventiva
              </span>
              <h2 className="text-base sm:text-lg font-bold font-serif-luxury text-stone-100">
                Agendador de Mensagens no WhatsApp
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

        {/* Abas de Navegação */}
        <div className="px-5 pt-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setAbaAtiva('proximos')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'proximos'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Débitos Próximos ao Vencimento</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px]">
              {debitosProximosAoVencimento.length}
            </span>
          </button>

          <button
            onClick={() => setAbaAtiva('agendados')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'agendados'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Mensagens Agendadas</span>
            <span className="px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px]">
              {agendamentosWhatsApp.filter(a => a.status === 'agendado').length}
            </span>
          </button>

          <button
            onClick={() => setAbaAtiva('modelos')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'modelos'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modelos de Mensagem</span>
            <span className="px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px]">
              {modelosMensagemCobranca.length}
            </span>
          </button>
        </div>

        {/* Feedback de sucesso */}
        {sucessoFeedback && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs text-emerald-900 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sucessoFeedback}</span>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* ABA 1: DÉBITOS PRÓXIMOS AO VENCIMENTO & AGENDADOR */}
          {abaAtiva === 'proximos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Coluna 1: Lista de Débitos (5 colunas) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Selecione o Cliente / Parcela
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {debitosFiltrados.length} encontrados
                  </span>
                </div>

                {/* Filtros rápidos de dias */}
                <div className="flex flex-wrap gap-1 text-[11px]">
                  <button
                    onClick={() => setFiltroVencimento('todos')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      filtroVencimento === 'todos' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroVencimento('hoje')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      filtroVencimento === 'hoje' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    Vence Hoje
                  </button>
                  <button
                    onClick={() => setFiltroVencimento('amanha')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      filtroVencimento === 'amanha' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                    }`}
                  >
                    Vence Amanhã
                  </button>
                  <button
                    onClick={() => setFiltroVencimento('3dias')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      filtroVencimento === '3dias' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    Até 3 Dias
                  </button>
                  <button
                    onClick={() => setFiltroVencimento('atrasados')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      filtroVencimento === 'atrasados' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                    }`}
                  >
                    Já Vencidas
                  </button>
                </div>

                {/* Lista de cards */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {debitosFiltrados.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500">
                      Nenhum débito pendente para este filtro.
                    </div>
                  ) : (
                    debitosFiltrados.map((item) => {
                      const isSelected = 
                        itemSelecionado?.parcela.id === item.parcela.id &&
                        itemSelecionado?.venda.id === item.venda.id;

                      const dias = item.diasAteVencimento;

                      return (
                        <div
                          key={`${item.venda.id}-${item.parcela.id}`}
                          onClick={() => setItemSelecionado(item)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-500'
                              : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-stone-500" />
                                <span>{item.venda.clienteNome}</span>
                              </div>
                              <span className="text-[11px] text-stone-500 block">
                                {item.venda.clienteTelefone}
                              </span>
                            </div>

                            {/* Badge de vencimento */}
                            {dias === 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] animate-pulse">
                                Vence Hoje
                              </span>
                            ) : dias === 1 ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[10px]">
                                Vence Amanhã
                              </span>
                            ) : dias > 1 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold text-[10px]">
                                Em {dias} dias
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                                Vencida há {Math.abs(dias)}d
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100">
                            <span className="text-stone-600">
                              Parcela {item.parcela.numeroParcela}/{item.parcela.totalParcelas} • Venc: {formatDate(item.parcela.dataVencimento)}
                            </span>
                            <strong className="text-emerald-800 font-bold">
                              {formatCurrency(item.parcela.valor)}
                            </strong>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Coluna 2: Configurador de Envio & Modelo (7 colunas) */}
              <div className="lg:col-span-7 space-y-4">
                {itemSelecionado ? (
                  <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-4 text-xs">
                    
                    {/* Topo do Card Selecionado */}
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                          Configurando Lembrete Para:
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-1.5">
                          {itemSelecionado.venda.clienteNome}
                          <span className="text-xs font-normal text-stone-500">({itemSelecionado.venda.clienteTelefone})</span>
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block">Valor da Parcela:</span>
                        <span className="text-sm font-bold text-emerald-700">
                          {formatCurrency(itemSelecionado.parcela.valor)}
                        </span>
                      </div>
                    </div>

                    {/* SELEÇÃO DO MODELO DE MENSAGEM */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-stone-800 block">
                          Selecione o Modelo de Mensagem:
                        </label>
                        <button
                          type="button"
                          onClick={() => setAbaAtiva('modelos')}
                          className="text-[11px] text-emerald-700 hover:underline font-semibold"
                        >
                          Gerenciar Modelos
                        </button>
                      </div>

                      <select
                        value={modeloIdSelecionado}
                        onChange={(e) => setModeloIdSelecionado(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-stone-800"
                      >
                        {modelosMensagemCobranca.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.titulo} ({m.tipo})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DATA E HORA DE AGENDAMENTO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">
                          Data do Agendamento:
                        </label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                          <input
                            type="date"
                            value={dataAgendamento}
                            onChange={(e) => setDataAgendamento(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-stone-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 block mb-1">
                          Horário Programado:
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                          <input
                            type="time"
                            value={horaAgendamento}
                            onChange={(e) => setHoraAgendamento(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-stone-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PRÉVIA DA MENSAGEM / TEXTO EDITÁVEL */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-stone-700 block">
                          Mensagem Personalizada do WhatsApp:
                        </label>
                        <button
                          onClick={handleCopiarTexto}
                          className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1"
                        >
                          {copiado ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
                        </button>
                      </div>

                      <textarea
                        rows={6}
                        value={textoPersonalizado}
                        onChange={(e) => setTextoPersonalizado(e.target.value)}
                        className="w-full p-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 font-sans text-xs leading-relaxed"
                      />
                    </div>

                    {/* AÇÕES: AGENDAR OU DISPARAR AGORA */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        onClick={handleSalvarAgendamento}
                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span>Salvar Agendamento</span>
                      </button>

                      <button
                        onClick={() => handleDispararWhatsAppAgora(
                          itemSelecionado.venda.clienteTelefone,
                          textoPersonalizado
                        )}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Disparar Agora no WhatsApp</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
                    Selecione um débito na coluna ao lado para configurar o lembrete.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ABA 2: MENSAGENS AGENDADAS (FILA) */}
          {abaAtiva === 'agendados' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Fila de Lembretes Agendados
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    Acompanhe as mensagens programadas e dispare no momento desejado com 1 clique.
                  </p>
                </div>

                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-semibold">
                  {agendamentosWhatsApp.length} cadastrados
                </span>
              </div>

              {agendamentosWhatsApp.length === 0 ? (
                <div className="p-10 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500">
                  <Calendar className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="font-semibold">Nenhuma mensagem agendada no momento.</p>
                  <button
                    onClick={() => setAbaAtiva('proximos')}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500"
                  >
                    Agendar Primeiro Lembrete
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {agendamentosWhatsApp.map(ag => {
                    const isEnviado = ag.status === 'enviado';
                    const isCancelado = ag.status === 'cancelado';

                    return (
                      <div
                        key={ag.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isEnviado
                            ? 'bg-emerald-50/50 border-emerald-200 text-stone-700'
                            : isCancelado
                            ? 'bg-stone-100 border-stone-200 text-stone-400'
                            : 'bg-white border-stone-200 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs">
                              {ag.clienteNome}
                            </span>
                            <span className="text-stone-500 text-[11px]">
                              {ag.clienteTelefone}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isEnviado ? 'bg-emerald-100 text-emerald-800' :
                              isCancelado ? 'bg-stone-200 text-stone-600' :
                              'bg-amber-100 text-amber-900'
                            }`}>
                              {ag.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-600 flex items-center gap-3">
                            <span>📅 Programado: <strong>{formatDate(ag.dataAgendamento)} às {ag.horarioAgendamento}</strong></span>
                            <span>💰 Parcela: <strong>{formatCurrency(ag.valorParcela)}</strong></span>
                            <span>Venc: {formatDate(ag.dataVencimento)}</span>
                          </div>

                          <p className="text-[11px] text-stone-500 line-clamp-1 italic bg-stone-50 p-1.5 rounded-lg border border-stone-100">
                            "{ag.mensagemFinal}"
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isEnviado && (
                            <button
                              onClick={() => handleDispararWhatsAppAgora(ag.clienteTelefone, ag.mensagemFinal, ag.id)}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Enviar no WhatsApp</span>
                            </button>
                          )}

                          {isEnviado && (
                            <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Disparado</span>
                            </span>
                          )}

                          <button
                            onClick={() => excluirAgendamento(ag.id)}
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remover agendamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: MODELOS DE MENSAGEM */}
          {abaAtiva === 'modelos' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Modelos de Lembretes & Cobrança
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    Personalize os modelos de mensagem com variáveis automáticas: {'{cliente}'}, {'{valor}'}, {'{vencimento}'}, {'{chavePix}'}.
                  </p>
                </div>

                <button
                  onClick={handleOpenCriarModelo}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Novo Modelo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {modelosMensagemCobranca.map(mod => (
                  <div
                    key={mod.id}
                    className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-stone-900 block">{mod.titulo}</span>
                          <span className="text-[10px] text-emerald-700 uppercase font-semibold">
                            Tipo: {mod.tipo}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditarModelo(mod)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded"
                            title="Editar Modelo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteModeloMensagemCobranca(mod.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded"
                            title="Excluir Modelo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 p-2.5 bg-white rounded-lg border border-stone-200 text-stone-700 whitespace-pre-line text-[11px] leading-relaxed max-h-36 overflow-y-auto">
                        {mod.texto}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setModeloIdSelecionado(mod.id);
                        setAbaAtiva('proximos');
                      }}
                      className="mt-2 w-full py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold rounded-lg text-center transition-colors text-[11px]"
                    >
                      Usar este modelo agora
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL CRIAÇÃO/EDIÇÃO DE MODELO */}
      {modalModeloAberto && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-stone-200 shadow-2xl p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="font-bold text-stone-900 text-sm">
                {modeloEmEdicao ? 'Editar Modelo de Mensagem' : 'Novo Modelo de Mensagem'}
              </h3>
              <button
                onClick={() => setModalModeloAberto(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarModeloModal} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Título do Modelo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lembrete Delicado 2 Dias Antes"
                  value={formTituloModelo}
                  onChange={(e) => setFormTituloModelo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Objetivo / Tipo:</label>
                <select
                  value={formTipoModelo}
                  onChange={(e) => setFormTipoModelo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                >
                  <option value="preventivo">Preventivo (Antes do Vencimento)</option>
                  <option value="dia_vencimento">Dia do Vencimento (Hoje)</option>
                  <option value="pix_rapido">Pix Rápido & Chave Direta</option>
                  <option value="pos_vencimento">Pós-Vencimento (Atraso Recente)</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Texto do WhatsApp (use variáveis {'{cliente}'}, {'{valor}'}, {'{vencimento}'}, {'{chavePix}'}):
                </label>
                <textarea
                  rows={5}
                  required
                  value={formTextoModelo}
                  onChange={(e) => setFormTextoModelo(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 leading-relaxed font-sans"
                />
              </div>

              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 leading-tight">
                💡 <strong>Variáveis suportadas:</strong> {'{cliente}'}, {'{valor}'}, {'{vencimento}'}, {'{dias}'}, {'{chavePix}'}, {'{tipoPix}'}, {'{empresa}'}, {'{telefone}'}.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalModeloAberto(false)}
                  className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Salvar Modelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
