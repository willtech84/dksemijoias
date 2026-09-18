import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Package, 
  Tag, 
  Camera, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  ExternalLink,
  Zap,
  Printer,
  Barcode,
  HelpCircle,
  ShieldCheck,
  MousePointerClick
} from 'lucide-react';
import { DKLogo } from './DKLogo';

interface TourStep {
  id: number;
  tab: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  highlights: string[];
  targetButtonId?: string;
  arrowPosition?: 'top' | 'bottom' | 'center';
  instructionHint: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    tab: 'dashboard',
    badge: 'Passo 1 de 5 • Visão Geral',
    title: 'Painel Executivo & Indicadores',
    subtitle: 'Gestão Inteligente & Frente de Caixa para Semijoias',
    description: 'Acompanhe faturamento em tempo real, peças paradas no estoque, parcelas vencidas e desempenho da sua equipe em uma única tela.',
    icon: Sparkles,
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    iconColor: 'text-amber-500',
    instructionHint: 'Navegue pelos módulos usando o menu ou a barra de navegação inferior no celular.',
    highlights: [
      'Visualização rápida de faturamento e ticket médio',
      'Alertas automáticos de semijoias paradas no mostruário',
      'Controle multiusuário com permissões de vendedores e administradores'
    ]
  },
  {
    id: 2,
    tab: 'estoque',
    badge: 'Passo 2 de 5 • Gestão de Estoque',
    title: 'Cadastro de Peças & Fotos',
    subtitle: 'Botão destacado: "+ Cadastrar Nova Peça"',
    description: 'Cadastre brincos, colares, anéis e pulseiras com código único, modelo de banho (Ouro 18k, Prata 925), margem de lucro e fotos das peças ou do caderno.',
    icon: Package,
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    iconColor: 'text-amber-600',
    targetButtonId: 'btn-cadastrar-peca',
    arrowPosition: 'top',
    instructionHint: 'Clique no botão dourado "+ Cadastrar Nova Peça" para abrir o formulário com cálculo automático de margem.',
    highlights: [
      'Botão "+ Cadastrar Nova Peça" para inclusão imediata',
      'Cálculo automático de preço de venda e margem de lucro',
      'Fotos reais da peça e observações de garantia'
    ]
  },
  {
    id: 3,
    tab: 'estoque',
    badge: 'Passo 3 de 5 • Identificação & Etiquetas',
    title: 'Impressão de Tags com Barcode & QR',
    subtitle: 'Botão destacado: "Imprimir Tags / Etiquetas"',
    description: 'Gere e imprima etiquetas nos formatos Gravata (joalheria 50x10mm dobrável), Bobina Térmica (40x25mm) ou Folha A4 com código de barras Code 128 e QR Code nítidos.',
    icon: Tag,
    iconBg: 'bg-stone-900 border-stone-700',
    iconColor: 'text-amber-400',
    targetButtonId: 'btn-imprimir-tags',
    arrowPosition: 'top',
    instructionHint: 'Clique em "Imprimir Tags / Etiquetas" para escolher o formato de impressão sem fotos, contendo apenas dados e códigos.',
    highlights: [
      'Botão "Imprimir Tags / Etiquetas" no topo do Estoque e no PDV',
      'Tags tipo gravata próprias para fixar em joias com preço e banho',
      'Código de barras Code 128 e QR Code gerados instantaneamente'
    ]
  },
  {
    id: 4,
    tab: 'vendas',
    badge: 'Passo 4 de 5 • Frente de Caixa (PDV)',
    title: 'Leitor Óptico com Câmera (Barcode & QR)',
    subtitle: 'Botão destacado: "Escanear Etiqueta (Câmera)"',
    description: 'No PDV, utilize o leitor por câmera. Aponte para a tag gravata da peça: ela é identificada na hora e já entra no carrinho com validação imediata de estoque!',
    icon: Camera,
    iconBg: 'bg-amber-500 text-stone-950',
    iconColor: 'text-stone-950',
    targetButtonId: 'btn-escanear-camera',
    arrowPosition: 'top',
    instructionHint: 'Basta clicar no botão dourado "Escanear Etiqueta" para acionar a câmera do celular ou webcam.',
    highlights: [
      'Botão "Escanear Etiqueta (Câmera)" com leitura ultrarrápida',
      'Bip sonoro e feedback visual de identificação imediata',
      'Funciona na câmera traseira do celular e na webcam do computador'
    ]
  },
  {
    id: 5,
    tab: 'vendas',
    badge: 'Passo 5 de 5 • Fechamento de Venda',
    title: 'Finalização, Recibos & Envio por WhatsApp',
    subtitle: 'Botão destacado: "Finalizar Venda & Emitir Recibo"',
    description: 'Selecione a forma de pagamento (Pix, Cartão de Crédito ou Dinheiro), parcele compras, aplique descontos e envie o comprovante completo pelo WhatsApp da cliente.',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-600',
    targetButtonId: 'btn-finalizar-venda',
    arrowPosition: 'bottom',
    instructionHint: 'Adicione itens ao carrinho e clique em "Finalizar Venda" para emitir recibo e enviar mensagem no WhatsApp.',
    highlights: [
      'Geração de recibo térmico de 58mm/80mm ou folha A4 com logomarca DK',
      'Disparo direto da mensagem de recibo no WhatsApp da cliente',
      'Baixa automática do estoque e registro no extrato de vendas'
    ]
  }
];

export const GuidedTourModal: React.FC = () => {
  const { isTourOpen, closeTour, setCurrentTab } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Quando o passo muda, mudar a aba automaticamente e rolar até o elemento
  useEffect(() => {
    if (!isTourOpen || !currentStep) return;

    setCurrentTab(currentStep.tab);

    const timer = setTimeout(() => {
      if (currentStep.targetButtonId) {
        const el = document.getElementById(currentStep.targetButtonId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-amber-400', 'ring-offset-2', 'animate-pulse');
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (currentStep?.targetButtonId) {
        const el = document.getElementById(currentStep.targetButtonId);
        if (el) {
          el.classList.remove('ring-4', 'ring-amber-400', 'ring-offset-2', 'animate-pulse');
        }
      }
    };
  }, [currentStepIndex, isTourOpen]);

  if (!isTourOpen) return null;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('dk_semijoias_tour_dismissed', 'true');
    closeTour();
  };

  const IconComponent = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end sm:justify-center items-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs">
      
      {/* Indicador de flecha apontando para o botão na tela se houver targetButtonId */}
      {currentStep.targetButtonId && (
        <div className="pointer-events-auto mb-3 flex items-center gap-2 bg-amber-500 text-stone-950 px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-bounce border-2 border-stone-950">
          <MousePointerClick className="w-4 h-4 animate-spin" />
          <span>Aponte aqui: Olhe o botão destacado com borda dourada piscando!</span>
        </div>
      )}

      {/* Caixa do Tour Guiado */}
      <div 
        className="pointer-events-auto bg-white rounded-3xl max-w-xl w-full border border-stone-300 shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <DKLogo size="sm" showText={true} textColor="light" />
            <div className="hidden sm:block h-5 w-px bg-stone-700" />
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-amber-400 uppercase tracking-wider items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Passo a Passo Interativo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-amber-400 font-mono">
                {currentStepIndex + 1} de {TOUR_STEPS.length}
              </span>
            </div>
            <button
              onClick={handleFinish}
              className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors"
              title="Fechar Tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso Superior */}
        <div className="w-full bg-stone-200 h-1.5">
          <div 
            className="bg-amber-500 h-1.5 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Conteúdo do Passo */}
        <div className="p-5 sm:p-7 space-y-5">
          
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl ${currentStep.iconBg} border flex-shrink-0`}>
              <IconComponent className={`w-7 h-7 ${currentStep.iconColor}`} />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 tracking-wide uppercase">
                {currentStep.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-serif-luxury text-stone-900 leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs font-semibold text-amber-700">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Dica de Ação Prática com Flecha */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-xs text-amber-950 font-medium">
            <span className="text-base flex-shrink-0">👉</span>
            <div>
              <span className="font-bold block text-amber-900">Como localizar na tela:</span>
              <span>{currentStep.instructionHint}</span>
            </div>
          </div>

          {/* Destaques do Passo */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 sm:p-4 space-y-2">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              Recursos disponíveis nesta tela:
            </span>
            <ul className="space-y-1.5">
              {currentStep.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Rodapé com Navegação */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={handleFinish}
            className="text-xs text-stone-500 hover:text-stone-800 font-semibold px-2 py-1"
          >
            Pular Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <span>{isLastStep ? 'Concluir Tour' : 'Próximo'}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
