import React, { useState } from 'react';
import { Venda, Consignacao, ConfiguracoesApp } from '../types';
import { formatCurrency, formatDate, triggerPrintDocument, saveStandaloneHtmlDocument } from '../utils/printHelpers';
import { 
  Printer, 
  Download, 
  Send, 
  Copy, 
  X, 
  Check, 
  FileText, 
  Receipt, 
  ShieldCheck, 
  Sparkles,
  QrCode
} from 'lucide-react';

interface ReceiptPrintModalProps {
  venda?: Venda | null;
  consignacao?: Consignacao | null;
  config: ConfiguracoesApp;
  onClose: () => void;
  defaultFormat?: 'a4' | 'thermal';
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  venda,
  consignacao,
  config,
  onClose,
  defaultFormat = 'a4'
}) => {
  const [format, setFormat] = useState<'a4' | 'thermal'>(defaultFormat);
  const [copied, setCopied] = useState(false);

  if (!venda && !consignacao) return null;

  const isVenda = !!venda;
  const docTitle = isVenda 
    ? `Recibo de Venda - ${venda?.clienteNome || 'Cliente'} - ${venda?.id}` 
    : `Termo de Consignação - ${consignacao?.consignadorNome || 'Revendedora'} - ${consignacao?.id}`;

  // Executar Impressão
  const handlePrint = () => {
    triggerPrintDocument(format);
  };

  // Salvar Arquivo HTML standalone
  const handleSaveFile = () => {
    const printElement = document.getElementById('printable-receipt-content');
    if (!printElement) return;

    saveStandaloneHtmlDocument(
      `${isVenda ? 'recibo_venda' : 'termo_consignacao'}_${isVenda ? venda?.id : consignacao?.id}_${format}`,
      docTitle,
      printElement.innerHTML,
      format
    );
  };

  // Enviar WhatsApp
  const handleWhatsApp = () => {
    if (isVenda && venda) {
      const limpo = venda.clienteTelefone.replace(/\D/g, '');
      const num = limpo.startsWith('55') ? limpo : `55${limpo}`;
      const itensStr = venda.itens.map(i => `• ${i.codigo} - ${i.descricao} (${i.quantidade}x ${formatCurrency(i.valorUnitario)})`).join('\n');
      
      const msg = `✨ *COMPROVANTE DE VENDA - ${config.nomeEmpresa.toUpperCase()}* ✨\n\n` +
        `Olá, *${venda.clienteNome}*! Segue seu recibo oficial e garantia:\n\n` +
        `🧾 *Recibo:* #${venda.id}\n` +
        `📅 *Data:* ${formatDate(venda.reciboGeradoEm || venda.dataVenda)}\n` +
        `💳 *Forma de Pagamento:* ${venda.formaPagamento.toUpperCase()}\n\n` +
        `💎 *Peças Adquiridas:*\n${itensStr}\n\n` +
        `💰 *Subtotal:* ${formatCurrency(venda.valorSubtotal)}\n` +
        (venda.desconto > 0 ? `🏷️ *Desconto:* ${formatCurrency(venda.desconto)}\n` : '') +
        `🎉 *TOTAL PAGO:* ${formatCurrency(venda.valorTotal)}\n\n` +
        `🛡️ *Garantia:* 1 ano no banho contra defeitos de fabricação.\n` +
        `Obrigado pela preferência e confiança! 💖`;
      
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (consignacao) {
      const limpo = consignacao.contato.replace(/\D/g, '');
      const num = limpo.startsWith('55') ? limpo : `55${limpo}`;
      const totalGeral = consignacao.itens.reduce((acc, i) => acc + i.valorUnitario, 0);
      const comissao = totalGeral * (consignacao.comissaoPercentual / 100);
      const itensStr = consignacao.itens.map(i => `• ${i.codigo} - ${i.descricao}: ${formatCurrency(i.valorUnitario)}`).join('\n');

      const msg = `✨ *TERMO DE CONIGNAÇÃO - ${config.nomeEmpresa.toUpperCase()}* ✨\n\n` +
        `Olá, *${consignacao.consignadorNome}*! Segue o termo do seu mostruário:\n\n` +
        `📅 *Data Entrega:* ${formatDate(consignacao.dataEntrega)}\n` +
        `⏳ *Previsão de Acerto:* ${formatDate(consignacao.dataPrevisaoAcerto)}\n` +
        `💎 *Comissão da Revendedora:* ${consignacao.comissaoPercentual}%\n\n` +
        `📋 *Peças Entregues:*\n${itensStr}\n\n` +
        `💰 *Valor Total:* ${formatCurrency(totalGeral)}\n` +
        `💵 *Sua comissão prevista:* ${formatCurrency(comissao)}\n\n` +
        `Boas vendas! 💖`;

      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  // Copiar Texto
  const handleCopy = () => {
    const textToCopy = isVenda && venda
      ? `RECIBO #${venda.id} - ${config.nomeEmpresa}\nCliente: ${venda.clienteNome}\nTotal: ${formatCurrency(venda.valorTotal)}\nData: ${formatDate(venda.reciboGeradoEm || venda.dataVenda)}`
      : `TERMO CONSIGNAÇÃO #${consignacao?.id} - ${config.nomeEmpresa}\nRevendedora: ${consignacao?.consignadorNome}\nTotal: ${formatCurrency(consignacao?.itens.reduce((a, b) => a + b.valorUnitario, 0) || 0)}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 print-active-modal">
      
      {/* Top Floating Action Bar (Hidden on Print) */}
      <div className="no-print w-full max-w-4xl bg-stone-900 text-stone-100 rounded-2xl p-3 sm:p-4 shadow-2xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-2 z-50 my-2">
        
        {/* Format Selector */}
        <div className="flex items-center gap-1.5 bg-stone-950/90 p-1.5 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setFormat('a4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              format === 'a4'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Padrão A4 (Formal / Completo)
          </button>
          <button
            type="button"
            onClick={() => setFormat('thermal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              format === 'thermal'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Bobina Térmica (80mm / Cupom)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir Agora
          </button>

          <button
            type="button"
            onClick={handleSaveFile}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Salvar arquivo autônomo offline em HTML/PDF"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Salvar Arquivo
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs"
            title="Copiar texto resumido"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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

      {/* Main Printable Document Mount Area */}
      <div 
        id="printable-receipt-content"
        className={`w-full flex justify-center py-4 ${format === 'thermal' ? 'print-thermal-roll' : 'print-a4-sheet'}`}
      >
        
        {/* =========================================================================
            FORMATO 1: PADRÃO A4 (DOCUMENTO FORMAL DE ALTA JOALHERIA)
            ========================================================================= */}
        {format === 'a4' && (
          <div className="screen-a4-preview p-8 sm:p-10 rounded-2xl text-stone-900 font-sans relative border border-stone-200/90 print:p-0 print:border-none print:shadow-none">
            
            {/* Header Timbrado */}
            <div className="flex justify-between items-start border-b-2 border-stone-800 pb-5 mb-6">
              <div>
                <span className="text-[10px] tracking-widest text-amber-700 uppercase font-bold">
                  Semijoias Finas & Design
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 tracking-wide mt-0.5">
                  {config.nomeEmpresa.toUpperCase()}
                </h1>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Acabamento italiano hipoalergênico, banho ouro 18k, prata 925 e zircônias premium.
                </p>
                <div className="text-[11px] text-stone-600 mt-2 space-y-0.5">
                  <p><strong>Contato / WhatsApp:</strong> {config.telefoneContato}</p>
                  <p><strong>Chave Pix:</strong> {config.chavePix} ({config.tipoChavePix.toUpperCase()})</p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 font-serif-luxury text-xs font-bold rounded-md uppercase tracking-wider mb-2">
                  {isVenda ? 'Comprovante de Venda & Garantia' : 'Termo de Responsabilidade & Consignação'}
                </div>
                <div className="text-sm font-mono font-bold text-stone-900">
                  Nº {isVenda ? venda?.id : consignacao?.id}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  <strong>Emissão:</strong> {isVenda ? (venda?.reciboGeradoEm || formatDate(venda?.dataVenda)) : formatDate(consignacao?.dataEntrega)}
                </div>
                {isVenda && venda?.vendedorNome && (
                  <div className="text-xs text-amber-900 font-semibold mt-0.5">
                    <strong>Atendente:</strong> {venda.vendedorNome}
                  </div>
                )}
              </div>
            </div>

            {/* Dados do Cliente ou Consignadora */}
            <div className="bg-stone-50/80 rounded-xl p-4 border border-stone-200 mb-6 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  {isVenda ? 'Dados do(a) Cliente' : 'Dados da Revendedora Consignatária'}
                </span>
                <p className="text-sm font-bold text-stone-900">
                  {isVenda ? venda?.clienteNome : consignacao?.consignadorNome}
                </p>
                <p className="text-stone-600 mt-0.5">
                  <strong>Telefone:</strong> {isVenda ? venda?.clienteTelefone : consignacao?.contato}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  {isVenda ? 'Condição de Pagamento' : 'Prazos & Comissionamento'}
                </span>
                {isVenda && venda ? (
                  <div className="space-y-0.5 text-stone-700">
                    <p><strong>Forma:</strong> <span className="capitalize">{venda.formaPagamento.replace('_', ' ')}</span></p>
                    <p><strong>Status:</strong> <span className="font-bold text-emerald-700 uppercase">{venda.statusPagamento}</span></p>
                  </div>
                ) : consignacao ? (
                  <div className="space-y-0.5 text-stone-700">
                    <p><strong>Previsão de Devolução/Acerto:</strong> <span className="font-bold text-stone-900">{formatDate(consignacao.dataPrevisaoAcerto)}</span></p>
                    <p><strong>Comissão da Revendedora:</strong> <span className="font-bold text-amber-700">{consignacao.comissaoPercentual}%</span></p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Tabela de Itens */}
            <div className="mb-6">
              <div className="text-xs font-bold font-serif-luxury text-stone-800 uppercase tracking-wider mb-2">
                {isVenda ? 'Discriminação dos Produtos Adquiridos' : 'Itens Entregues no Mostruário Consignado'}
              </div>

              <table className="w-full text-left text-xs border border-stone-200">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Cód.</th>
                    <th className="py-2.5 px-3">Descrição da Peça</th>
                    <th className="py-2.5 px-3 text-center">Qtd</th>
                    <th className="py-2.5 px-3 text-right">Valor Unit.</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {isVenda && venda?.itens.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-amber-800">{item.codigo}</td>
                      <td className="py-2 px-3 font-medium text-stone-800">{item.descricao}</td>
                      <td className="py-2 px-3 text-center">{item.quantidade}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(item.valorUnitario)}</td>
                      <td className="py-2 px-3 text-right font-bold text-stone-900">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}

                  {!isVenda && consignacao?.itens.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-amber-800">{item.codigo}</td>
                      <td className="py-2 px-3 font-medium text-stone-800">{item.descricao}</td>
                      <td className="py-2 px-3 text-center">1</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(item.valorUnitario)}</td>
                      <td className="py-2 px-3 text-right font-bold text-stone-900">{formatCurrency(item.valorUnitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totais & Resumo Financeiro */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 print-avoid-break">
              
              {/* Parcelamento se houver */}
              {isVenda && venda && venda.parcelas && venda.parcelas.length > 1 ? (
                <div className="flex-1 bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs">
                  <span className="font-bold text-amber-950 uppercase text-[10px] tracking-wider block mb-1">
                    Cronograma de Parcelamento
                  </span>
                  <div className="space-y-1">
                    {venda.parcelas.map(p => (
                      <div key={p.id} className="flex justify-between text-stone-700 text-[11px]">
                        <span>Parcela {p.numeroParcela} de {p.totalParcelas} (Venc: {formatDate(p.dataVencimento)})</span>
                        <span className="font-bold">{formatCurrency(p.valor)} {p.pago ? '✓ (Paga)' : '⏳ (A vencer)'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isVenda && consignacao ? (
                <div className="flex-1 bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs">
                  <span className="font-bold text-amber-950 uppercase text-[10px] tracking-wider block mb-1">
                    Estimativa de Ganhos da Revendedora
                  </span>
                  {(() => {
                    const totalGeral = consignacao.itens.reduce((acc, i) => acc + i.valorUnitario, 0);
                    const comissaoRevendedora = totalGeral * (consignacao.comissaoPercentual / 100);
                    const repasseLoja = totalGeral - comissaoRevendedora;
                    return (
                      <div className="space-y-1 text-stone-700 text-[11px]">
                        <div className="flex justify-between">
                          <span>Total das Peças no Mostruário:</span>
                          <span className="font-semibold">{formatCurrency(totalGeral)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-800 font-bold">
                          <span>Comissão a Receber ({consignacao.comissaoPercentual}%):</span>
                          <span>{formatCurrency(comissaoRevendedora)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Valor Líquido do Repasse à Loja:</span>
                          <span>{formatCurrency(repasseLoja)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex-1" />
              )}

              {/* Quadro de Totais */}
              <div className="w-full sm:w-64 bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1.5">
                {isVenda && venda ? (
                  <>
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(venda.valorSubtotal)}</span>
                    </div>
                    {venda.desconto > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Desconto:</span>
                        <span>- {formatCurrency(venda.desconto)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline font-bold text-sm">
                      <span className="text-stone-900">Total Pago:</span>
                      <span className="text-xl font-serif-luxury text-stone-900">{formatCurrency(venda.valorTotal)}</span>
                    </div>
                  </>
                ) : consignacao ? (
                  <>
                    <div className="flex justify-between text-stone-600">
                      <span>Total de Peças:</span>
                      <span className="font-bold">{consignacao.itens.length} un</span>
                    </div>
                    <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline font-bold text-sm">
                      <span className="text-stone-900">Valor Mostruário:</span>
                      <span className="text-xl font-serif-luxury text-stone-900">
                        {formatCurrency(consignacao.itens.reduce((acc, i) => acc + i.valorUnitario, 0))}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Termos de Garantia / Cláusulas Legais */}
            <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/50 mb-8 text-[11px] text-stone-600 space-y-1.5 print-avoid-break">
              <div className="flex items-center gap-1.5 font-bold text-stone-800 uppercase text-[10px] tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                {isVenda ? 'Termo de Garantia Oficial & Cuidados com a Semijoia' : 'Cláusulas e Condições de Consignação'}
              </div>

              {isVenda ? (
                <p className="leading-relaxed">
                  As peças {config.nomeEmpresa} possuem <strong>garantia de 1 (um) ano</strong> no banho nobre (Ouro 18k / Prata 925 / Ródio Branco) contra defeitos de fabricação. 
                  Para preservação do brilho, evite contato com produtos químicos, perfumes, cosméticos e água salgada/clorada. A garantia não cobre quebra decorrente de impacto ou mau uso.
                </p>
              ) : (
                <p className="leading-relaxed">
                  As peças entregues permanecem sob propriedade exclusiva da contratante até a prestação de contas definitiva. A consignatária se compromete a zelar pela integridade das joias e a efetuar o acerto financeiro e devolução física das peças não comercializadas até a data estipulada de <strong>{formatDate(consignacao?.dataPrevisaoAcerto)}</strong>.
                </p>
              )}
            </div>

            {/* Bloco de Assinaturas */}
            <div className="pt-6 border-t border-stone-200 grid grid-cols-2 gap-8 text-center text-xs print-avoid-break">
              <div>
                <div className="border-b border-stone-400 w-4/5 mx-auto mb-1.5 h-8" />
                <p className="font-bold text-stone-900">
                  {isVenda ? venda?.clienteNome : consignacao?.consignadorNome}
                </p>
                <p className="text-[10px] text-stone-500">
                  {isVenda ? 'Assinatura do(a) Cliente' : 'Assinatura da Revendedora'}
                </p>
              </div>

              <div>
                <div className="border-b border-stone-400 w-4/5 mx-auto mb-1.5 h-8" />
                <p className="font-bold text-stone-900">{config.nomeEmpresa}</p>
                <p className="text-[10px] text-stone-500">Vendas & Gestão de Semijoias</p>
              </div>
            </div>

            {/* Rodapé institucional */}
            <div className="mt-8 text-center text-[10px] text-stone-400 border-t border-stone-100 pt-3">
              Documento gerado eletronicamente em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} • {config.nomeEmpresa}
            </div>

          </div>
        )}

        {/* =========================================================================
            FORMATO 2: BOBINA TÉRMICA (80MM CUPOM NÃO FISCAL PARA MINI IMPRESSORAS)
            ========================================================================= */}
        {format === 'thermal' && (
          <div className="screen-thermal-preview p-4 rounded-md text-stone-900 font-mono text-[11px] leading-tight print:p-0 print:border-none print:shadow-none print:w-[76mm]">
            
            {/* Cabeçalho Térmico */}
            <div className="text-center space-y-1 mb-2">
              <div className="font-bold text-xs uppercase tracking-wider">
                {config.nomeEmpresa.toUpperCase()}
              </div>
              <div className="text-[10px]">SEMIJOIAS DE ALTO PADRAO</div>
              <div className="text-[10px]">TEL: {config.telefoneContato}</div>
              <div className="text-[10px]">PIX: {config.chavePix}</div>
              
              <div className="border-t border-dashed border-stone-900 my-2" />
              
              <div className="font-bold text-xs">
                {isVenda ? 'CUPOM DE VENDA E GARANTIA' : 'TERMO DE CONSIGNACAO'}
              </div>
              <div className="text-[10px]">
                Nº: {isVenda ? venda?.id : consignacao?.id}
              </div>
              <div className="text-[10px]">
                DATA: {isVenda ? (venda?.reciboGeradoEm || formatDate(venda?.dataVenda)) : formatDate(consignacao?.dataEntrega)}
              </div>
              {isVenda && venda?.vendedorNome && (
                <div className="text-[10px]">
                  ATENDENTE: {venda.vendedorNome}
                </div>
              )}

              <div className="border-t border-dashed border-stone-900 my-2" />
            </div>

            {/* Dados Cliente / Revendedora */}
            <div className="mb-2 text-[10px] space-y-0.5">
              <div><strong>{isVenda ? 'CLIENTE:' : 'REVENDEDORA:'}</strong> {isVenda ? venda?.clienteNome : consignacao?.consignadorNome}</div>
              <div><strong>CONTATO:</strong> {isVenda ? venda?.clienteTelefone : consignacao?.contato}</div>
              {!isVenda && consignacao && (
                <div><strong>PREV. ACERTO:</strong> {formatDate(consignacao.dataPrevisaoAcerto)}</div>
              )}
              <div className="border-t border-dashed border-stone-900 my-2" />
            </div>

            {/* Itens */}
            <div className="mb-2">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-stone-300">
                <span>QTD ITEM</span>
                <span>VALOR (R$)</span>
              </div>

              <div className="space-y-1.5 pt-1.5">
                {isVenda && venda?.itens.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-semibold text-stone-950">
                      {item.codigo} - {item.descricao}
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-700 pl-2">
                      <span>{item.quantidade} x {formatCurrency(item.valorUnitario)}</span>
                      <span className="font-bold text-stone-900">{formatCurrency(item.subtotal)}</span>
                    </div>
                  </div>
                ))}

                {!isVenda && consignacao?.itens.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-semibold text-stone-950">
                      {item.codigo} - {item.descricao}
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-700 pl-2">
                      <span>1 un</span>
                      <span className="font-bold text-stone-900">{formatCurrency(item.valorUnitario)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-stone-900 my-2" />
            </div>

            {/* Resumo Financeiro Térmico */}
            <div className="space-y-1 text-[11px] mb-3">
              {isVenda && venda ? (
                <>
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>{formatCurrency(venda.valorSubtotal)}</span>
                  </div>
                  {venda.desconto > 0 && (
                    <div className="flex justify-between text-emerald-800">
                      <span>DESCONTO:</span>
                      <span>- {formatCurrency(venda.desconto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-stone-400">
                    <span>TOTAL PAGO:</span>
                    <span>{formatCurrency(venda.valorTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase">
                    <span>FORMA PGTO:</span>
                    <span>{venda.formaPagamento.replace('_', ' ')}</span>
                  </div>

                  {venda.parcelas && venda.parcelas.length > 1 && (
                    <div className="mt-2 pt-1 border-t border-dotted border-stone-400 text-[9px] space-y-0.5">
                      <div className="font-bold">PARCELAMENTO:</div>
                      {venda.parcelas.map(p => (
                        <div key={p.id} className="flex justify-between">
                          <span>{p.numeroParcela}/{p.totalParcelas} ({formatDate(p.dataVencimento)})</span>
                          <span>{formatCurrency(p.valor)} {p.pago ? '(PAGA)' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : consignacao ? (
                <>
                  <div className="flex justify-between">
                    <span>QTD ITENS:</span>
                    <span>{consignacao.itens.length} un</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-stone-400">
                    <span>VALOR MOSTRUARIO:</span>
                    <span>{formatCurrency(consignacao.itens.reduce((acc, i) => acc + i.valorUnitario, 0))}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-amber-900 font-bold">
                    <span>COMISSAO ({consignacao.comissaoPercentual}%):</span>
                    <span>{formatCurrency(consignacao.itens.reduce((acc, i) => acc + i.valorUnitario, 0) * (consignacao.comissaoPercentual / 100))}</span>
                  </div>
                </>
              ) : null}

              <div className="border-t border-dashed border-stone-900 my-2" />
            </div>

            {/* Garantia Resumida */}
            <div className="text-[9px] text-center space-y-1 mb-4">
              <div className="font-bold uppercase">
                {isVenda ? '*** GARANTIA DE 1 ANO ***' : '*** TERMO DE RESPONSABILIDADE ***'}
              </div>
              <p>
                {isVenda 
                  ? 'Garantia de 1 ano no banho contra defeitos de fabricacao. Guarde este cupom para eventual suporte ou troca.'
                  : 'A consignataria declara que recebeu as pecas descritas em perfeito estado e compromete-se com o acerto na data combinada.'
                }
              </p>
            </div>

            {/* Linha de Assinatura Térmica */}
            <div className="text-center pt-2 mb-2">
              <div className="border-t border-stone-800 w-3/4 mx-auto mb-1" />
              <div className="text-[9px] font-bold">
                {isVenda ? venda?.clienteNome : consignacao?.consignadorNome}
              </div>
            </div>

            {/* Linha de Corte */}
            <div className="text-center text-[8px] text-stone-500 pt-2 border-t border-dashed border-stone-400">
              - - - - - - - CORTE AQUI - - - - - - -
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
