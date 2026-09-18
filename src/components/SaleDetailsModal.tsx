import React, { useState } from 'react';
import { Venda } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/printHelpers';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Printer, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  DollarSign, 
  Share2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface SaleDetailsModalProps {
  venda: Venda | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReceipt: (venda: Venda) => void;
}

export const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
  venda,
  isOpen,
  onClose,
  onOpenReceipt
}) => {
  const { config, marcarParcelaPaga } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !venda) return null;

  // Cálculos de pendências
  const parcelasPendentes = (venda.parcelas || []).filter(p => !p.pago);
  const hojeStr = new Date().toISOString().split('T')[0];

  // Valor pendente: soma das parcelas em aberto ou o valor total se for pendente sem parcelas
  const valorPendente = parcelasPendentes.length > 0
    ? parcelasPendentes.reduce((acc, p) => acc + p.valor, 0)
    : (venda.statusPagamento !== 'pago' ? venda.valorTotal : 0);

  // Próxima parcela a vencer ou primeira atrasada
  const proximaParcela = parcelasPendentes.length > 0 ? parcelasPendentes[0] : null;
  const dataVencimentoStr = proximaParcela ? proximaParcela.dataVencimento : venda.dataVenda;
  const dataVencimentoFormatada = formatDate(dataVencimentoStr);

  // Verifica atraso
  const isAtrasada = proximaParcela 
    ? proximaParcela.dataVencimento < hojeStr 
    : (venda.statusPagamento === 'atrasado');

  let diasAtraso = 0;
  if (isAtrasada && dataVencimentoStr) {
    const diffTime = Math.abs(new Date(hojeStr).getTime() - new Date(dataVencimentoStr).getTime());
    diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Telefone tratado para link do WhatsApp
  const telLimpo = (venda.clienteTelefone || '').replace(/\D/g, '');
  const telWhatsapp = telLimpo.startsWith('55') ? telLimpo : `55${telLimpo}`;

  // Mensagem automática de cobrança / lembrete de pagamento
  const saudacao = isAtrasada
    ? `Olá, *${venda.clienteNome}*! Tudo bem? Esperamos que esteja tudo ótimo por aí! ✨`
    : `Olá, *${venda.clienteNome}*! Tudo bem? Passando apenas para enviar o lembrete da sua compra na *${config.nomeEmpresa}*. ✨`;

  const statusTexto = isAtrasada
    ? `⚠️ *Vencida há:* ${diasAtraso} dia(s) (${dataVencimentoFormatada})`
    : `📅 *Data de Vencimento:* ${dataVencimentoFormatada}`;

  const mensagemCobranca = `${saudacao}\n\n` +
    `Consta em nosso sistema uma pendência de pagamento referente à venda *#${venda.id}*:\n\n` +
    `👤 *Cliente:* ${venda.clienteNome}\n` +
    `💰 *Valor Pendente:* ${formatCurrency(valorPendente)}\n` +
    `${statusTexto}\n` +
    (proximaParcela ? `🔢 *Parcela:* ${proximaParcela.numeroParcela} de ${proximaParcela.totalParcelas}\n` : '') +
    `\n🔑 *Chave Pix para Pagamento:* ${config.chavePix} (${config.tipoChavePix.toUpperCase()})\n` +
    `🏢 *Favorecido:* ${config.nomeEmpresa}\n\n` +
    `Assim que efetuar o pagamento, por favor envie o comprovante por aqui para darmos a baixa imediata. Agradecemos a sua preferência e confiança! 💖`;

  // URL do link automático do WhatsApp
  const linkWhatsApp = `https://wa.me/${telWhatsapp}?text=${encodeURIComponent(mensagemCobranca)}`;

  // Ações de cópia
  const handleCopiarLink = () => {
    navigator.clipboard.writeText(linkWhatsApp);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(mensagemCobranca);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleAbrirWhatsApp = () => {
    window.open(linkWhatsApp, '_blank');
  };

  const handleDarBaixaParcela = (parcelaId: string) => {
    if (confirm('Confirmar recebimento desta parcela?')) {
      marcarParcelaPaga(venda.id, parcelaId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              #{venda.id.slice(-4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-base sm:text-lg text-stone-100">
                  Detalhes da Venda #{venda.id}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  venda.statusPagamento === 'pago'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : isAtrasada
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {venda.statusPagamento === 'pago' ? 'Pago' : isAtrasada ? 'Atrasada' : 'Pendente'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Realizada em {formatDate(venda.dataVenda)} • Vendedor: {venda.vendedorNome || 'Não informado'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800">
          
          {/* Informações Básicas do Cliente e Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" /> Dados do Cliente
              </span>
              <p className="font-bold text-sm text-stone-900">{venda.clienteNome}</p>
              <p className="text-xs text-stone-600 flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" /> {venda.clienteTelefone}
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Condição de Pagamento
              </span>
              <p className="font-bold text-sm text-stone-900 capitalize">
                {venda.formaPagamento.replace('_', ' ')}
              </p>
              <p className="text-xs text-stone-600">
                Total: <strong className="text-stone-900">{formatCurrency(venda.valorTotal)}</strong>
                {venda.desconto > 0 && <span className="text-emerald-700 ml-1">(Desc: {formatCurrency(venda.desconto)})</span>}
              </p>
            </div>
          </div>

          {/* DESTAQUE: CARD DE COBRANÇA AUTOMÁTICA VIA WHATSAPP */}
          {valorPendente > 0 ? (
            <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-amber-500/5 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif-luxury font-bold text-base text-stone-900">
                      Cobrança Automática via WhatsApp
                    </h4>
                    <p className="text-xs text-stone-600">
                      Link personalizado com dados do cliente, valor pendente e data de vencimento.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Valor Pendente
                  </span>
                  <span className="font-serif-luxury font-bold text-lg text-rose-700">
                    {formatCurrency(valorPendente)}
                  </span>
                </div>
              </div>

              {/* Informações Resumidas da Pendência */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 border-y border-stone-200/80 text-xs">
                <div>
                  <span className="text-stone-500 text-[11px] block">Cliente:</span>
                  <strong className="text-stone-900 truncate block">{venda.clienteNome}</strong>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">Data de Vencimento:</span>
                  <strong className={isAtrasada ? 'text-rose-600' : 'text-stone-900'}>
                    {dataVencimentoFormatada} {isAtrasada && `(${diasAtraso}d)`}
                  </strong>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-stone-500 text-[11px] block">Chave Pix:</span>
                  <strong className="text-stone-900 font-mono text-[11px] truncate block">{config.chavePix}</strong>
                </div>
              </div>

              {/* Prévia da Mensagem */}
              <div className="bg-white rounded-xl p-3 border border-stone-200 text-xs font-mono text-stone-700 max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {mensagemCobranca}
              </div>

              {/* Ações da Cobrança */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Botão de Envio Direto para o WhatsApp */}
                <button
                  onClick={handleAbrirWhatsApp}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Abrir Cobrança no WhatsApp</span>
                </button>

                {/* Botão Copiar Link */}
                <button
                  onClick={handleCopiarLink}
                  className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition-colors"
                  title="Copiar o link do WhatsApp para a área de transferência"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link de Cobrança'}</span>
                </button>

                {/* Botão Copiar Texto da Mensagem */}
                <button
                  onClick={handleCopiarTexto}
                  className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Copiar todo o texto da mensagem"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Texto Copiado!' : 'Copiar Mensagem'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-emerald-900">Venda Totalmente Paga</p>
                  <p className="text-[11px] text-emerald-700">Não constam valores pendentes para esta venda.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const msg = `Olá, *${venda.clienteNome}*! Muito obrigado por comprar na *${config.nomeEmpresa}*! Sua compra de ${formatCurrency(venda.valorTotal)} está quitada e suas peças contam com 1 ano de garantia. Use com muito brilho! 💖`;
                  window.open(`https://wa.me/${telWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <Send className="w-3 h-3" /> Agradecer no WhatsApp
              </button>
            </div>
          )}

          {/* Lista de Itens da Venda */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-600" /> Itens Adquiridos ({venda.itens.length})
            </span>
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl overflow-hidden divide-y divide-stone-200/60">
              {venda.itens.map((item, index) => (
                <div key={index} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    {item.fotoUrl ? (
                      <img 
                        src={item.fotoUrl} 
                        alt={item.descricao} 
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-stone-400 font-bold text-xs shrink-0">
                        DK
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-stone-900">{item.descricao}</p>
                      <p className="text-[11px] text-stone-500 font-mono">
                        Cód: {item.codigo} • {item.quantidade} un × {formatCurrency(item.valorUnitario)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Parcelamento Detalhado (se houver) */}
          {venda.parcelas && venda.parcelas.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Cronograma de Parcelas
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {venda.parcelas.map((parc) => {
                  const vencida = !parc.pago && parc.dataVencimento < hojeStr;
                  return (
                    <div 
                      key={parc.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        parc.pago 
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : vencida
                          ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                          : 'bg-stone-50 border-stone-200 text-stone-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">Parcela {parc.numeroParcela}/{parc.totalParcelas}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            parc.pago ? 'bg-emerald-200 text-emerald-800' : vencida ? 'bg-rose-200 text-rose-800' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {parc.pago ? 'Paga' : vencida ? 'Vencida' : 'Aberta'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Vencimento: <strong>{formatDate(parc.dataVencimento)}</strong>
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="font-bold text-stone-900">{formatCurrency(parc.valor)}</span>
                        {!parc.pago && (
                          <button
                            onClick={() => handleDarBaixaParcela(parc.id)}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                          >
                            Dar Baixa
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer do Modal com Botões de Ação */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenReceipt(venda);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Recibo (A4 / Térmica)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
          >
            Fechar Detalhes
          </button>
        </div>

      </div>
    </div>
  );
};
