import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Consignacao, ItemConsignacao, Peca } from '../types';
import { 
  Package, 
  Plus, 
  User, 
  Calendar, 
  Phone, 
  CheckCircle, 
  RotateCcw, 
  Clock, 
  FileText,
  DollarSign,
  AlertCircle,
  Share2,
  Trash2,
  Printer
} from 'lucide-react';
import { ReceiptPrintModal } from './ReceiptPrintModal';
import { formatDate } from '../utils/printHelpers';

export const ConsignmentView: React.FC = () => {
  const { 
    consignacoes, 
    pecas, 
    addConsignacao, 
    atualizarItemConsignacao, 
    finalizarConsignacao,
    config 
  } = useApp();

  const [showModalNova, setShowModalNova] = useState<boolean>(false);
  const [consignacaoSelecionada, setConsignacaoSelecionada] = useState<Consignacao | null>(null);
  const [printConsignacaoTarget, setPrintConsignacaoTarget] = useState<Consignacao | null>(null);

  // Form de nova consignação
  const [nomeConsignador, setNomeConsignador] = useState('');
  const [contato, setContato] = useState('');
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [dataPrevisaoAcerto, setDataPrevisaoAcerto] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [comissaoPercentual, setComissaoPercentual] = useState(25);
  const [pecasSelecionadasIds, setPecasSelecionadasIds] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState('');

  const pecasDisponiveis = pecas.filter(p => p.status === 'disponivel' && p.quantidade > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleTogglePeca = (id: string) => {
    setPecasSelecionadasIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSalvarConsignacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeConsignador.trim() || pecasSelecionadasIds.length === 0) {
      alert('Informe o nome da consignadora/revendedora e selecione pelo menos 1 peça!');
      return;
    }

    const itens: ItemConsignacao[] = pecasSelecionadasIds.map(id => {
      const p = pecas.find(peca => peca.id === id)!;
      return {
        pecaId: p.id,
        codigo: p.codigo,
        descricao: p.descricao,
        fotoUrl: p.fotos[0]?.url,
        valorUnitario: p.precoVenda,
        status: 'com_consignador'
      };
    });

    addConsignacao({
      consignadorNome: nomeConsignador.trim(),
      contato: contato.trim(),
      dataEntrega,
      dataPrevisaoAcerto,
      comissaoPercentual,
      status: 'em_aberto',
      itens,
      observacoes
    });

    setShowModalNova(false);
    setNomeConsignador('');
    setContato('');
    setPecasSelecionadasIds([]);
    setObservacoes('');
  };

  // Enviar lista consignada para WhatsApp
  const handleEnviarWhatsAppConsignacao = (cons: Consignacao) => {
    const limpo = cons.contato.replace(/\D/g, '');
    const num = limpo.startsWith('55') ? limpo : `55${limpo}`;
    const totalGeral = cons.itens.reduce((acc, i) => acc + i.valorUnitario, 0);
    const comissaoRevendedora = totalGeral * (cons.comissaoPercentual / 100);

    const itensStr = cons.itens.map(i => `• ${i.codigo} - ${i.descricao}: ${formatCurrency(i.valorUnitario)}`).join('\n');

    const msg = `✨ *TERMO DE CONIGNAÇÃO - ${config.nomeEmpresa.toUpperCase()}* ✨\n\n` +
      `Olá, *${cons.consignadorNome}*! Segue o espelho do mostruário consignado sob sua responsabilidade:\n\n` +
      `📅 *Data de Entrega:* ${formatDate(cons.dataEntrega)}\n` +
      `⏳ *Data Prevista para Acerto:* ${formatDate(cons.dataPrevisaoAcerto)}\n` +
      `💎 *Comissão da Revendedora:* ${cons.comissaoPercentual}%\n\n` +
      `📋 *Peças Entregues:*\n${itensStr}\n\n` +
      `💰 *Valor Total do Mostruário:* ${formatCurrency(totalGeral)}\n` +
      `💵 *Sua comissão potencial:* ${formatCurrency(comissaoRevendedora)}\n\n` +
      `Boas vendas! Estamos torcendo pelo seu sucesso! 💖`;

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Revendedoras & Mostruários
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
            Controle de Consignação
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gerencie mostruários entregues a parceiras, controle peças vendidas, devoluções e comissões.
          </p>
        </div>

        <button
          onClick={() => setShowModalNova(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova Consignação
        </button>
      </div>

      {/* Lista de Consignações Ativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {consignacoes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
            <Package className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-stone-700">Nenhuma consignação registrada ainda.</p>
            <p className="text-xs text-stone-400 mt-1">Clique no botão acima para registrar a entrega de um mostruário.</p>
          </div>
        ) : (
          consignacoes.map(cons => {
            const valorTotal = cons.itens.reduce((acc, i) => acc + i.valorUnitario, 0);
            const vendidos = cons.itens.filter(i => i.status === 'vendido');
            const devolvidos = cons.itens.filter(i => i.status === 'devolvido');
            const pendentes = cons.itens.filter(i => i.status === 'com_consignador');
            const valorVendido = vendidos.reduce((acc, i) => acc + i.valorUnitario, 0);
            const comissao = valorVendido * (cons.comissaoPercentual / 100);
            const valorLiquidoReceber = valorVendido - comissao;

            return (
              <div 
                key={cons.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        cons.status === 'finalizada' 
                          ? 'bg-stone-100 text-stone-600' 
                          : cons.status === 'parcialmente_acertada'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {cons.status.replace('_', ' ')}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 font-serif-luxury">
                        {cons.consignadorNome}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{cons.contato || 'Sem contato'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPrintConsignacaoTarget(cons)}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                        title="Imprimir termo de consignação (A4 ou Bobina 80mm)"
                      >
                        <Printer className="w-4 h-4 text-amber-700" />
                      </button>
                      <button
                        onClick={() => handleEnviarWhatsAppConsignacao(cons)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                        title="Enviar termo de mostruário no WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes de Datas & Prazos */}
                  <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Data Entrega:</span>
                      <span className="font-semibold text-stone-800">{formatDate(cons.dataEntrega)}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Previsão de Acerto:</span>
                      <span className="font-semibold text-amber-900">{formatDate(cons.dataPrevisaoAcerto)}</span>
                    </div>
                  </div>

                  {/* Resumo de Peças */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Total de peças entregues:</span>
                      <span className="font-bold text-stone-900">{cons.itens.length} un ({formatCurrency(valorTotal)})</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Comissão da Revendedora:</span>
                      <span className="font-bold text-amber-700">{cons.comissaoPercentual}%</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Status do Mostruário:</span>
                      <span className="font-semibold text-stone-800">
                        {vendidos.length} vendida(s) • {devolvidos.length} devolvida(s) • {pendentes.length} em aberto
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações / Acerto de Contas */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block">A receber (após comissão):</span>
                    <span className="text-sm font-bold text-emerald-700 font-serif-luxury">
                      {formatCurrency(valorLiquidoReceber)}
                    </span>
                  </div>

                  <button
                    onClick={() => setConsignacaoSelecionada(cons)}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Fazer Acerto de Contas</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* MODAL FAZER ACERTO DE CONTAS DA CONSIGNAÇÃO */}
      {consignacaoSelecionada && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-stone-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div>
                <h3 className="font-serif-luxury font-bold text-base text-amber-200">
                  Acerto de Mostruário: {consignacaoSelecionada.consignadorNome}
                </h3>
                <p className="text-xs text-stone-400">
                  Marque as peças que a revendedora vendeu e as que retornaram para o estoque.
                </p>
              </div>
              <button onClick={() => setConsignacaoSelecionada(null)} className="text-stone-400 hover:text-white text-xl font-bold">×</button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              
              <div className="space-y-3 divide-y divide-stone-100">
                {consignacaoSelecionada.itens.map(item => (
                  <div key={item.pecaId} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <img
                      src={item.fotoUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-stone-900 truncate">{item.descricao}</div>
                      <div className="text-[11px] text-stone-500">
                        {item.codigo} • Valor Venda: <strong className="text-stone-800">{formatCurrency(item.valorUnitario)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => atualizarItemConsignacao(consignacaoSelecionada.id, item.pecaId, 'vendido')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors ${
                          item.status === 'vendido' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Vendeu
                      </button>

                      <button
                        onClick={() => atualizarItemConsignacao(consignacaoSelecionada.id, item.pecaId, 'devolvido')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors ${
                          item.status === 'devolvido' 
                            ? 'bg-stone-700 text-white shadow-xs' 
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Devolver Estoque
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão Finalizar Acerto */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPrintConsignacaoTarget(consignacaoSelecionada)}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-amber-700" />
                  <span>Imprimir Termo (A4 / Bobina)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsignacaoSelecionada(null)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium"
                >
                  Concluir Acerto
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA CONSIGNAÇÃO */}
      {showModalNova && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl border border-stone-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <h3 className="font-serif-luxury font-bold text-base text-amber-200">
                Nova Entrega de Mostruário / Consignação
              </h3>
              <button onClick={() => setShowModalNova(false)} className="text-stone-400 hover:text-white text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSalvarConsignacao} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nome da Revendedora / Consignadora *</label>
                  <input
                    type="text"
                    required
                    value={nomeConsignador}
                    onChange={(e) => setNomeConsignador(e.target.value)}
                    placeholder="Ex: Beatriz Vasconcelos"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">WhatsApp / Contato *</label>
                  <input
                    type="text"
                    required
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                    placeholder="(11) 98111-2233"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Data de Entrega</label>
                  <input
                    type="date"
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Data Limite de Acerto</label>
                  <input
                    type="date"
                    value={dataPrevisaoAcerto}
                    onChange={(e) => setDataPrevisaoAcerto(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Comissão da Revendedora (%)</label>
                  <input
                    type="number"
                    value={comissaoPercentual}
                    onChange={(e) => setComissaoPercentual(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* Selecionar Peças */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Selecione as Peças que irão no Mostruário ({pecasSelecionadasIds.length} selecionadas):
                </label>
                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl p-2 bg-stone-50 divide-y divide-stone-100">
                  {pecasDisponiveis.length === 0 ? (
                    <div className="py-4 text-center text-stone-400">Nenhuma peça disponível no estoque.</div>
                  ) : (
                    pecasDisponiveis.map(p => (
                      <label key={p.id} className="py-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-amber-50/50 px-2 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={pecasSelecionadasIds.includes(p.id)}
                            onChange={() => handleTogglePeca(p.id)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="font-semibold text-stone-900 truncate">{p.descricao}</span>
                          <span className="text-[10px] text-stone-400 font-mono">({p.codigo})</span>
                        </div>
                        <span className="font-bold text-stone-800">{formatCurrency(p.precoVenda)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalNova(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-sm"
                >
                  Confirmar e Gerar Consignação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO DE TERMO DE CONSIGNAÇÃO */}
      {printConsignacaoTarget && (
        <ReceiptPrintModal
          type="consignacao"
          data={printConsignacaoTarget}
          onClose={() => setPrintConsignacaoTarget(null)}
        />
      )}

    </div>
  );
};
