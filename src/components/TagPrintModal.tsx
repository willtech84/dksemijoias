import React, { useState, useEffect } from 'react';
import { Peca } from '../types';
import { useApp } from '../context/AppContext';
import { generateBarcode128Svg, generateQrCodeDataUrl } from '../utils/barcodeGenerator';
import { DKLogo } from './DKLogo';
import { 
  Printer, 
  X, 
  Tag, 
  SlidersHorizontal, 
  CheckSquare, 
  Square, 
  Grid, 
  Maximize2, 
  Copy, 
  Check, 
  Sparkles,
  QrCode,
  Barcode,
  Layers
} from 'lucide-react';

interface TagPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedPecas?: Peca[];
}

export type TagStyleType = 'joalheria_20x10' | 'gravata' | 'bobina_termica' | 'grade_a4';

export const TagPrintModal: React.FC<TagPrintModalProps> = ({
  isOpen,
  onClose,
  initialSelectedPecas
}) => {
  const { pecas, config } = useApp();

  // Peças selecionadas para impressão
  const [selectedPecaIds, setSelectedPecaIds] = useState<string[]>([]);
  
  // Opções de Formato e Exibição - Padrão 2cm x 1cm (conforme print)
  const [tagStyle, setTagStyle] = useState<TagStyleType>('joalheria_20x10');
  const [previewScale, setPreviewScale] = useState<'2.5x' | '1x'>('2.5x');
  const [showPreco, setShowPreco] = useState<boolean>(true);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showBarcode128, setShowBarcode128] = useState<boolean>(true);
  const [showBanho, setShowBanho] = useState<boolean>(true);
  const [qtdPorPeca, setQtdPorPeca] = useState<'estoque' | 'uma' | 'custom'>('uma');
  const [customQtd, setCustomQtd] = useState<number>(2);

  // Cache de QR Codes gerados (base64)
  const [qrCodeUrls, setQrCodeUrls] = useState<{ [codigo: string]: string }>({});

  // Inicializar seleção quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedPecas && initialSelectedPecas.length > 0) {
        setSelectedPecaIds(initialSelectedPecas.map(p => p.id));
      } else {
        // Selecionar peças com status disponível por padrão
        const disponiveis = pecas.filter(p => p.status === 'disponivel');
        setSelectedPecaIds(disponiveis.map(p => p.id));
      }
    }
  }, [isOpen, initialSelectedPecas, pecas]);

  // Gerar QR Codes para as peças selecionadas
  useEffect(() => {
    if (!isOpen) return;

    const pecasParaGerar = pecas.filter(p => selectedPecaIds.includes(p.id));
    let mounted = true;

    async function loadQrCodes() {
      const novosUrls: { [codigo: string]: string } = {};
      for (const p of pecasParaGerar) {
        if (!qrCodeUrls[p.codigo]) {
          // Conteúdo do QR Code: formato direto com o código da peça legível pelo scanner
          const url = await generateQrCodeDataUrl(p.codigo, 120);
          novosUrls[p.codigo] = url;
        }
      }
      if (mounted && Object.keys(novosUrls).length > 0) {
        setQrCodeUrls(prev => ({ ...prev, ...novosUrls }));
      }
    }

    loadQrCodes();

    return () => {
      mounted = false;
    };
  }, [isOpen, selectedPecaIds, pecas]);

  const toggleSelectAll = () => {
    if (selectedPecaIds.length === pecas.length) {
      setSelectedPecaIds([]);
    } else {
      setSelectedPecaIds(pecas.map(p => p.id));
    }
  };

  const togglePeca = (id: string) => {
    setSelectedPecaIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    document.body.classList.add('printing-tags');
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-tags');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-tags');
      }, 1500);
    }, 150);
  };

  if (!isOpen) return null;

  // Filtrar lista de peças a serem impressas com as repetições solicitadas
  const pecasSelecionadas = pecas.filter(p => selectedPecaIds.includes(p.id));

  // Multiplicar pelas quantidades desejadas
  const listaEtiquetas: { peca: Peca; indexItem: number }[] = [];
  pecasSelecionadas.forEach(peca => {
    let count = 1;
    if (qtdPorPeca === 'estoque') count = Math.max(1, peca.quantidade);
    else if (qtdPorPeca === 'custom') count = Math.max(1, customQtd);

    for (let i = 0; i < count; i++) {
      listaEtiquetas.push({ peca, indexItem: i });
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Container Principal do Modal */}
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header do Modal (no-print) */}
        <div className="no-print p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center shadow-md">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-bold text-base sm:text-lg text-amber-200 flex items-center gap-2">
                Impressão de Etiquetas & Tags para Semijoias
              </h2>
              <p className="text-xs text-stone-400">
                Gere tags personalizadas com código único, QR Code e código de barras para as peças
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={listaEtiquetas.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir {listaEtiquetas.length} Etiquetas</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo: Painel de Controles à Esquerda + Visualização Real das Tags à Direita (no-print) */}
        <div className="no-print flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Coluna Esquerda: Configurações & Seleção de Peças (4 colunas) */}
          <div className="lg:col-span-4 p-4 border-r border-stone-200 bg-stone-50/70 overflow-y-auto space-y-5">
            
            {/* 1. Escolha do Modelo da Etiqueta */}
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                1. Formato da Tag
              </label>
              <div className="grid grid-cols-1 gap-2">
                
                {/* Estilo Padrão do Print: Mini Joalheria 2cm x 1cm (20x10mm) */}
                <button
                  type="button"
                  onClick={() => setTagStyle('joalheria_20x10')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    tagStyle === 'joalheria_20x10'
                      ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                    💎
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900">Tag Joalheria Padrão (2cm × 1cm)</span>
                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-full">
                        OFICIAL
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 leading-tight mt-0.5">
                      Medida exata de 20mm × 10mm com QR Code, Título, Banho, Preço em destaque e Código de Barras inferior.
                    </div>
                  </div>
                </button>

                {/* Estilo Gravata para Semijoias */}
                <button
                  type="button"
                  onClick={() => setTagStyle('gravata')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    tagStyle === 'gravata'
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    🎀
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">Tag Gravata / Borboleta</div>
                    <div className="text-[11px] text-stone-500 leading-tight mt-0.5">
                      Especial para brincos, anéis e correntes. Dobra no meio com haste central para fixação.
                    </div>
                  </div>
                </button>

                {/* Estilo Bobina Térmica 30x15mm */}
                <button
                  type="button"
                  onClick={() => setTagStyle('bobina_termica')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    tagStyle === 'bobina_termica'
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    🏷️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">Bobina / Adesivo Térmico (35x18mm)</div>
                    <div className="text-[11px] text-stone-500 leading-tight mt-0.5">
                      Ideal para impressoras térmicas Argox, Zebra, Brother e rolos de mini etiquetas.
                    </div>
                  </div>
                </button>

                {/* Estilo Folha A4 Completa */}
                <button
                  type="button"
                  onClick={() => setTagStyle('grade_a4')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    tagStyle === 'grade_a4'
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    📄
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">Grade Folha A4 (Pimaco / Convencional)</div>
                    <div className="text-[11px] text-stone-500 leading-tight mt-0.5">
                      Gera 24 a 30 etiquetas por folha A4 com linhas guias pontilhadas para corte.
                    </div>
                  </div>
                </button>

              </div>
            </div>

            {/* 2. Conteúdo da Etiqueta */}
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                2. Informações na Tag
              </label>
              <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPreco}
                    onChange={(e) => setShowPreco(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Exibir Preço de Venda (R$)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showQrCode}
                    onChange={(e) => setShowQrCode(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Exibir QR Code para Câmera PDV</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showBarcode128}
                    onChange={(e) => setShowBarcode128(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Exibir Código de Barras (Code 128)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showBanho}
                    onChange={(e) => setShowBanho(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Exibir Tipo de Banho (Ouro 18k / Prata)</span>
                </label>
              </div>
            </div>

            {/* 3. Quantidade de Etiquetas */}
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                3. Quantidade por Peça
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setQtdPorPeca('uma')}
                  className={`py-2 px-1 rounded-lg border text-center font-medium transition-all ${
                    qtdPorPeca === 'uma' ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold' : 'bg-white border-stone-200'
                  }`}
                >
                  1 por Peça
                </button>
                <button
                  type="button"
                  onClick={() => setQtdPorPeca('estoque')}
                  className={`py-2 px-1 rounded-lg border text-center font-medium transition-all ${
                    qtdPorPeca === 'estoque' ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold' : 'bg-white border-stone-200'
                  }`}
                >
                  Qtd Estoque
                </button>
                <button
                  type="button"
                  onClick={() => setQtdPorPeca('custom')}
                  className={`py-2 px-1 rounded-lg border text-center font-medium transition-all ${
                    qtdPorPeca === 'custom' ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold' : 'bg-white border-stone-200'
                  }`}
                >
                  Personalizado
                </button>
              </div>

              {qtdPorPeca === 'custom' && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-stone-500">Etiquetas por peça:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customQtd}
                    onChange={(e) => setCustomQtd(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-lg text-center font-bold"
                  />
                </div>
              )}
            </div>

            {/* 4. Seleção Individual de Peças */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  4. Peças Selecionadas ({selectedPecaIds.length}/{pecas.length})
                </label>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
                >
                  {selectedPecaIds.length === pecas.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto bg-white border border-stone-200 rounded-xl p-2 space-y-1">
                {pecas.map(peca => {
                  const isSelected = selectedPecaIds.includes(peca.id);
                  return (
                    <div
                      key={peca.id}
                      onClick={() => togglePeca(peca.id)}
                      className={`p-1.5 rounded-lg flex items-center justify-between gap-2 text-xs cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50/80 text-stone-900' : 'hover:bg-stone-50 text-stone-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                        <span className="font-mono font-bold text-stone-800 shrink-0">{peca.codigo}</span>
                        <span className="truncate">{peca.descricao}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium shrink-0">
                        R$ {peca.precoVenda.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Coluna Direita: Pré-Visualização Interativa das Etiquetas (8 colunas) */}
          <div className="lg:col-span-8 p-6 bg-stone-200/60 overflow-y-auto flex flex-col items-center">
            
            <div className="w-full max-w-2xl mb-3 flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Prévia da Impressão ({listaEtiquetas.length} etiquetas geradas)
                </span>
                {tagStyle === 'joalheria_20x10' && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-bold text-[10px]">
                    2,0 cm × 1,0 cm (Padrão Oficial)
                  </span>
                )}
              </div>
              {tagStyle === 'joalheria_20x10' ? (
                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-300 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPreviewScale('2.5x')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${previewScale === '2.5x' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    Ampliada (2.5x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewScale('1x')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${previewScale === '1x' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    Tamanho Real (1:1)
                  </button>
                </div>
              ) : (
                <span className="text-stone-500">
                  Padrão alta resolução para corte e dobra
                </span>
              )}
            </div>

            {/* Folha de Preview em Tela (Simula Folha de Impressão) */}
            <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg border border-stone-300">
              {listaEtiquetas.length === 0 ? (
                <div className="py-16 text-center text-stone-400 text-xs">
                  Nenhuma peça selecionada para gerar etiquetas.
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 justify-start">
                  {listaEtiquetas.slice(0, 18).map((item, idx) => (
                    <div key={`${item.peca.id}-${item.indexItem}-${idx}`}>
                      {renderTag(
                        item.peca, 
                        tagStyle, 
                        showPreco, 
                        showQrCode, 
                        showBarcode128, 
                        showBanho, 
                        qrCodeUrls[item.peca.codigo], 
                        config.nomeEmpresa,
                        true,
                        previewScale
                      )}
                    </div>
                  ))}
                  {listaEtiquetas.length > 18 && (
                    <div className="w-full py-4 text-center text-xs text-stone-400 border-t border-dashed border-stone-200 mt-2">
                      + {listaEtiquetas.length - 18} etiquetas adicionais serão geradas na folha de impressão completa.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dica Informativa */}
            <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-stone-700 text-xs max-w-2xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Pronto para Vender:</strong> Ao apontar a câmera do celular no PDV para qualquer uma destas etiquetas, o sistema identificará o código imediatamente e adicionará a peça ao carrinho.
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ÁREA EXCLUSIVA DE IMPRESSÃO (Renderizada apenas quando `window.print()` for disparado) */}
      <div id="print-tags-container" className="hidden">
        <div className="tag-print-sheet">
          {listaEtiquetas.map((item, idx) => (
            <div key={`print-${item.peca.id}-${item.indexItem}-${idx}`} className="tag-print-item">
              {renderTag(item.peca, tagStyle, showPreco, showQrCode, showBarcode128, showBanho, qrCodeUrls[item.peca.codigo], config.nomeEmpresa)}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

/**
 * Função de Renderização dos Modelos de Tags
 */
function renderTag(
  peca: Peca,
  style: TagStyleType,
  showPreco: boolean,
  showQrCode: boolean,
  showBarcode: boolean,
  showBanho: boolean,
  qrCodeUrl?: string,
  nomeEmpresa = 'DK',
  isScreenPreview = false,
  previewScale: '2.5x' | '1x' = '2.5x'
) {
  const barcodeSvg = generateBarcode128Svg(peca.codigo, 24);

  // 1. Tag Padrão Joalheria 2cm x 1cm (20mm x 10mm) - Exatamente conforme print enviado
  if (style === 'joalheria_20x10') {
    const isEnlarged = isScreenPreview && previewScale === '2.5x';

    return (
      <div 
        className={`jewelry-tag-20x10 bg-white border border-stone-300 rounded-[1px] flex flex-col justify-between overflow-hidden select-none ${
          isEnlarged 
            ? 'w-[50mm] h-[25mm] p-[1.5mm] shadow-sm' 
            : 'w-[20mm] h-[10mm] p-[0.6mm]'
        }`}
        style={!isEnlarged ? {
          width: '20mm',
          height: '10mm',
          boxSizing: 'border-box'
        } : undefined}
      >
        {/* Linha Superior: QR Code à esquerda + Detalhes da Peça à direita */}
        <div className="flex items-start gap-1 flex-1 min-h-0 overflow-hidden">
          {/* QR Code */}
          {showQrCode && qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="QR" 
              className={`${isEnlarged ? 'w-[14mm] h-[14mm]' : 'w-[5.8mm] h-[5.8mm]'} shrink-0 object-contain`} 
            />
          ) : (
            <div className={`${isEnlarged ? 'w-[14mm] h-[14mm] text-[8px]' : 'w-[5.8mm] h-[5.8mm] text-[4px]'} bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 text-stone-400 font-mono`}>
              QR
            </div>
          )}

          {/* Textos à Direita */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full leading-none overflow-hidden pl-0.5">
            {/* Descrição truncada */}
            <div className={`${isEnlarged ? 'text-[11px]' : 'text-[5.5px]'} font-medium text-stone-900 truncate leading-tight tracking-tight`}>
              {peca.descricao}
            </div>

            {/* Banho (como no print: Ouro 18k em tom marrom/âmbar) */}
            {showBanho && peca.modelo && peca.modelo !== 'Nenhum' && (
              <div className={`${isEnlarged ? 'text-[9.5px]' : 'text-[4.8px]'} font-bold text-amber-900 uppercase tracking-tight leading-tight`}>
                {peca.modelo}
              </div>
            )}

            {/* Preço de Venda em Destaque */}
            {showPreco && (
              <div className={`font-serif-luxury font-black ${isEnlarged ? 'text-[14px]' : 'text-[7.5px]'} text-stone-950 leading-tight`}>
                R$ {peca.precoVenda.toFixed(2).replace('.', ',')}
              </div>
            )}
          </div>
        </div>

        {/* Linha Inferior: Código de Barras Code 128 */}
        {showBarcode && (
          <div className={`w-full ${isEnlarged ? 'h-[7mm] mt-1' : 'h-[3.2mm] mt-0.5'} overflow-hidden flex items-center justify-center`}>
            <div 
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block" 
              dangerouslySetInnerHTML={{ __html: barcodeSvg }} 
            />
          </div>
        )}
      </div>
    );
  }

  // 2. Tag Gravata para Semijoias (Dobra no meio, com haste central)
  if (style === 'gravata') {
    return (
      <div className="jewelry-tag-gravata flex items-center border border-dashed border-stone-400 bg-white p-1 rounded-sm shadow-xs select-none">
        
        {/* Lado Esquerdo (Frente da Etiqueta) */}
        <div className="w-28 p-1.5 flex flex-col justify-between items-center text-center border-r border-stone-200 min-h-[85px]">
          <div className="flex items-center gap-1">
            <DKLogo size="xs" />
            <span className="font-serif-luxury font-bold text-[9px] text-stone-900 tracking-tight">
              DK
            </span>
          </div>

          <div className="my-1">
            <div className="font-mono font-extrabold text-[12px] text-stone-950 tracking-wider">
              {peca.codigo}
            </div>
            {showBanho && peca.modelo && peca.modelo !== 'Nenhum' && (
              <div className="text-[8px] font-semibold text-amber-900 uppercase">
                {peca.modelo}
              </div>
            )}
            <div className="text-[8px] text-stone-600 truncate max-w-[100px]">
              {peca.descricao}
            </div>
          </div>

          <div className="text-[7px] text-stone-400">1 ANO GARANTIA</div>
        </div>

        {/* Haste Central (Passa pelo anel ou brinco - dobrável) */}
        <div className="w-7 h-3 bg-stone-100 border-t border-b border-stone-300 flex items-center justify-center">
          <span className="text-[6px] text-stone-400 font-bold uppercase tracking-widest -rotate-90">
            DOBRA
          </span>
        </div>

        {/* Lado Direito (Verso da Etiqueta com QR Code / Barcode e Preço) */}
        <div className="w-28 p-1.5 flex flex-col justify-between items-center text-center border-l border-stone-200 min-h-[85px]">
          
          <div className="flex items-center justify-center gap-1">
            {showQrCode && qrCodeUrl && (
              <img src={qrCodeUrl} alt="" className="w-7 h-7 object-contain" />
            )}
            {showBarcode && (
              <div 
                className="w-16 h-5 overflow-hidden" 
                dangerouslySetInnerHTML={{ __html: barcodeSvg }} 
              />
            )}
          </div>

          <div className="my-1">
            {showPreco ? (
              <div>
                <span className="text-[7px] text-stone-500 uppercase font-bold block">À VISTA / PIX</span>
                <span className="font-serif-luxury font-black text-[13px] text-stone-950">
                  R$ {peca.precoVenda.toFixed(2).replace('.', ',')}
                </span>
              </div>
            ) : (
              <div className="text-[9px] font-semibold text-stone-600">
                Consignação DK
              </div>
            )}
          </div>

          <div className="text-[8px] font-mono text-stone-500">
            Ref: {peca.referencia || peca.codigo}
          </div>
        </div>

      </div>
    );
  }

  // 3. Tag Bobina Térmica / Adesivo (35x18mm)
  if (style === 'bobina_termica') {
    return (
      <div className="jewelry-tag-bobina w-40 p-1.5 border border-dashed border-stone-400 bg-white rounded flex flex-col justify-between min-h-[90px] text-stone-900">
        <div className="flex items-center justify-between border-b border-stone-200 pb-0.5">
          <div className="flex items-center gap-1">
            <DKLogo size="xs" />
            <span className="font-serif-luxury font-bold text-[8px] tracking-tight">DK</span>
          </div>
          <span className="font-mono font-bold text-[10px]">{peca.codigo}</span>
        </div>

        <div className="flex items-center gap-2 my-1">
          {showQrCode && qrCodeUrl && (
            <img src={qrCodeUrl} alt="" className="w-8 h-8 object-contain shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[8px] font-semibold truncate">{peca.descricao}</div>
            {showBanho && <div className="text-[7px] text-amber-900 font-bold">{peca.modelo}</div>}
            {showPreco && (
              <div className="font-serif-luxury font-black text-[12px] text-stone-950 leading-none mt-0.5">
                R$ {peca.precoVenda.toFixed(2).replace('.', ',')}
              </div>
            )}
          </div>
        </div>

        {showBarcode && (
          <div 
            className="w-full h-4 overflow-hidden" 
            dangerouslySetInnerHTML={{ __html: barcodeSvg }} 
          />
        )}
      </div>
    );
  }

  // 4. Grade Folha A4
  return (
    <div className="jewelry-tag-a4 w-44 p-2 border border-dashed border-stone-300 bg-white rounded-lg flex flex-col justify-between min-h-[100px] text-stone-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <DKLogo size="xs" />
          <span className="font-serif-luxury font-bold text-[9px]">DK</span>
        </div>
        <span className="font-mono font-extrabold text-[11px] text-amber-900">{peca.codigo}</span>
      </div>

      <div className="text-[9px] font-medium text-stone-700 truncate mt-1">
        {peca.descricao}
      </div>

      <div className="flex items-center justify-between gap-2 my-1">
        {showQrCode && qrCodeUrl && (
          <img src={qrCodeUrl} alt="" className="w-8 h-8 object-contain shrink-0" />
        )}
        <div className="text-right">
          {showBanho && <div className="text-[7px] font-bold text-stone-500 uppercase">{peca.modelo}</div>}
          {showPreco && (
            <div className="font-serif-luxury font-black text-[13px] text-stone-950">
              R$ {peca.precoVenda.toFixed(2).replace('.', ',')}
            </div>
          )}
        </div>
      </div>

      {showBarcode && (
        <div 
          className="w-full h-4 overflow-hidden" 
          dangerouslySetInnerHTML={{ __html: barcodeSvg }} 
        />
      )}
    </div>
  );
}
