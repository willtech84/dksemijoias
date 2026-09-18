import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Peca } from '../types';
import { playScannerBeep } from '../utils/barcodeGenerator';
import { 
  Camera, 
  X, 
  Flashlight, 
  FlipHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Barcode, 
  QrCode, 
  ShoppingBag, 
  Keyboard, 
  Upload,
  Layers
} from 'lucide-react';
import { DKLogo } from './DKLogo';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pecas: Peca[];
  onPieceScanned: (peca: Peca) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  pecas,
  onPieceScanned
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(true);

  // Status e Histórico da Leitura
  const [lastScannedPiece, setLastScannedPiece] = useState<{ peca: Peca; time: number } | null>(null);
  const [errorNotFound, setErrorNotFound] = useState<string | null>(null);
  const [scannedSessionCount, setScannedSessionCount] = useState<number>(0);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Evitar leituras duplicadas no mesmo segundo
  const lastDetectedCode = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  // Iniciar e Parar Câmera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsStartingCamera(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso à câmera não suportado neste navegador.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();

        // Verificar suporte a lanterna
        const track = stream.getVideoTracks()[0];
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }

        setIsStartingCamera(false);
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn('Erro ao acessar a câmera:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Permissão de acesso à câmera negada. Habilite a câmera nas permissões do navegador ou utilize os botões de simulação e entrada manual abaixo.'
          : 'Câmera não detectada ou em uso por outro aplicativo. Você pode utilizar a entrada de código manual ou a simulação rápida.'
      );
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn('Falha ao acionar lanterna', e);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Processamento Contínuo dos Frames da Câmera
  const startScanningLoop = () => {
    // Verificar se BarcodeDetector nativo está disponível
    const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    let detector: any = null;

    if (hasBarcodeDetector) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13', 'code_39', 'upc_a', 'upc_e']
        });
      } catch (e) {
        detector = null;
      }
    }

    const scanFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animationFrameId.current = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!canvas) {
        animationFrameId.current = requestAnimationFrame(scanFrame);
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        animationFrameId.current = requestAnimationFrame(scanFrame);
        return;
      }

      // Definir dimensões do canvas
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.drawImage(video, 0, 0, width, height);

      let rawDetected: string | null = null;

      // 1. Tentar detector nativo se disponível
      if (detector) {
        try {
          const barcodes = await detector.detect(canvas);
          if (barcodes && barcodes.length > 0) {
            rawDetected = barcodes[0].rawValue;
          }
        } catch (e) {
          // fallback para jsQR
        }
      }

      // 2. Se não detectou com BarcodeDetector, executar jsQR
      if (!rawDetected) {
        try {
          const imageData = ctx.getImageData(0, 0, width, height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });
          if (qrCode && qrCode.data) {
            rawDetected = qrCode.data;
          }
        } catch (e) {
          // frame reading error
        }
      }

      // Se encontrou algum código
      if (rawDetected) {
        handleRawCodeScanned(rawDetected);
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Tratamento e Localização da Peça
  const handleRawCodeScanned = (rawInput: string) => {
    const raw = rawInput.trim();
    if (!raw) return;

    // Debounce: ignorar se for o mesmo código nos últimos 2 segundos
    const now = Date.now();
    if (
      lastDetectedCode.current.code === raw &&
      now - lastDetectedCode.current.time < 2200
    ) {
      return;
    }

    lastDetectedCode.current = { code: raw, time: now };

    // Tentar extrair código limpo
    let targetCode = raw;

    // Se for URL (ex: https://.../?peca=SEM-101 ou /peca/SEM-101)
    if (raw.includes('http') || raw.includes('/')) {
      try {
        const url = new URL(raw, 'https://dksemijoias.local');
        const param = url.searchParams.get('codigo') || url.searchParams.get('id') || url.searchParams.get('peca');
        if (param) targetCode = param;
        else {
          const parts = url.pathname.split('/').filter(Boolean);
          if (parts.length > 0) targetCode = parts[parts.length - 1];
        }
      } catch (e) {
        // use raw
      }
    }

    // Se for JSON (ex: {"codigo":"SEM-101"})
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.codigo) targetCode = parsed.codigo;
        else if (parsed.id) targetCode = parsed.id;
      } catch (e) {
        // use raw
      }
    }

    // Buscar no estoque
    const targetClean = targetCode.toLowerCase().trim();
    const pecaEncontrada = pecas.find(p => 
      p.codigo.toLowerCase().trim() === targetClean ||
      p.referencia.toLowerCase().trim() === targetClean ||
      p.id.toLowerCase().trim() === targetClean ||
      p.codigo.toLowerCase().replace(/[^a-z0-9]/g, '') === targetClean.replace(/[^a-z0-9]/g, '')
    );

    if (pecaEncontrada) {
      // Sucesso! Tocar som de bip
      playScannerBeep();

      // Vibração no celular
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 40, 60]);
      }

      // Adicionar ao carrinho
      onPieceScanned(pecaEncontrada);
      setLastScannedPiece({ peca: pecaEncontrada, time: Date.now() });
      setScannedSessionCount(prev => prev + 1);
      setErrorNotFound(null);
    } else {
      setErrorNotFound(`Etiqueta/código lido: "${raw}". Nenhuma semijoia encontrada com este identificador.`);
      setTimeout(() => setErrorNotFound(null), 4000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleRawCodeScanned(manualCodeInput);
    setManualCodeInput('');
  };

  // Simular bip com clique direto em uma peça de exemplo
  const handleSimulateScan = (peca: Peca) => {
    handleRawCodeScanned(peca.codigo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Scanner */}
        <div className="p-4 sm:p-5 bg-stone-950 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-bold text-base sm:text-lg text-amber-200 flex items-center gap-2">
                Leitor de Etiquetas & QR Code
              </h2>
              <p className="text-xs text-stone-400">
                Aponte a câmera para a tag da peça ou código de barras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scannedSessionCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-xs font-bold animate-pulse">
                <ShoppingBag className="w-3.5 h-3.5" />
                {scannedSessionCount} no carrinho
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
              title="Fechar leitor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visor da Câmera / Área de Escaneamento */}
        <div className="relative flex-1 bg-black flex flex-col items-center justify-center overflow-hidden min-h-[300px] max-h-[420px]">
          
          {/* Tag de vídeo invisível ou renderizado */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Canvas para processamento de imagem em segundo plano */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay de Miras do Leitor e Linha Laser */}
          {!cameraError && !isStartingCamera && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              
              {/* Máscara de foco central */}
              <div className="relative w-64 sm:w-72 h-44 sm:h-48 border-2 border-amber-400/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex flex-col justify-between p-2">
                
                {/* Cantoneiras Brilhantes */}
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-3 border-l-3 border-amber-300 -mt-1 -ml-1 rounded-tl" />
                  <div className="w-4 h-4 border-t-3 border-r-3 border-amber-300 -mt-1 -mr-1 rounded-tr" />
                </div>

                {/* Linha Laser Animada */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-[bounce_2s_infinite]" />

                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-3 border-l-3 border-amber-300 -mb-1 -ml-1 rounded-bl" />
                  <div className="w-4 h-4 border-b-3 border-r-3 border-amber-300 -mb-1 -mr-1 rounded-br" />
                </div>
              </div>

              {/* Instrução Flutuante */}
              <div className="mt-4 px-4 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-700 text-stone-200 text-xs font-medium flex items-center gap-2">
                <Barcode className="w-4 h-4 text-amber-400" />
                <span>Centralize a etiqueta no retângulo</span>
              </div>
            </div>
          )}

          {/* Mensagem de Inicialização */}
          {isStartingCamera && !cameraError && (
            <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center gap-3 text-stone-300">
              <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
              <p className="text-xs font-medium">Iniciando câmera de alta precisão...</p>
            </div>
          )}

          {/* Fallback de Erro de Câmera */}
          {cameraError && (
            <div className="absolute inset-0 bg-stone-950 p-6 flex flex-col items-center justify-center text-center gap-3 text-stone-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-600/40 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-amber-200">Acesso à câmera indisponível</p>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                {cameraError}
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors mt-1"
              >
                Tentar Conectar Novamente
              </button>
            </div>
          )}

          {/* Controles da Câmera (Flutuantes na parte superior) */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${
                  torchOn ? 'bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/30' : 'bg-stone-900/80 text-stone-300 hover:text-white'
                }`}
                title={torchOn ? 'Desligar Lanterna' : 'Ligar Lanterna'}
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={toggleFacingMode}
              className="p-2.5 rounded-xl bg-stone-900/80 backdrop-blur-md text-stone-300 hover:text-white transition-all"
              title="Alternar Câmera (Traseira / Frontal)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback de Última Peça Adicionada com Sucesso */}
          {lastScannedPiece && Date.now() - lastScannedPiece.time < 3500 && (
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-emerald-950/95 border border-emerald-500 text-emerald-100 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-emerald-400/40">
                  <img
                    src={lastScannedPiece.peca.fotos[0]?.url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Adicionada ao Carrinho!
                  </span>
                  <span className="text-xs font-bold truncate block text-white font-serif-luxury">
                    [{lastScannedPiece.peca.codigo}] {lastScannedPiece.peca.descricao}
                  </span>
                  <span className="text-[11px] text-emerald-300 font-semibold">
                    R$ {lastScannedPiece.peca.precoVenda.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-1 bg-emerald-800 text-white rounded-lg text-xs font-bold shrink-0">
                +1 no PDV
              </div>
            </div>
          )}

          {/* Feedback de Código Não Encontrado */}
          {errorNotFound && (
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-rose-950/95 border border-rose-500 text-rose-100 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="flex-1">{errorNotFound}</span>
            </div>
          )}
        </div>

        {/* Rodapé: Digitação Rápida e Simulação de Demonstração */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
          
          {/* Linha de Ações Rápidas */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400 font-medium">
              Não tem a câmera agora ou quer testar instantaneamente?
            </span>
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <Keyboard className="w-3.5 h-3.5" />
              {showManualInput ? 'Ocultar teclado' : 'Digitar Código / Leitor USB'}
            </button>
          </div>

          {/* Campo de Entrada Manual */}
          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="flex gap-2 animate-in slide-in-from-top-2 duration-150">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="Ex: SEM-101, BR-001, DK-COL-003..."
                className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 uppercase font-mono"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors"
              >
                Bipar Peça
              </button>
            </form>
          )}

          {/* Peças de Demonstração para Testar com 1 Clique */}
          <div>
            <span className="text-[11px] text-stone-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Clique para simular bip de etiqueta do estoque:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pecas.slice(0, 5).map((peca) => (
                <button
                  key={peca.id}
                  onClick={() => handleSimulateScan(peca)}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 hover:border-amber-500/50 border border-stone-700 rounded-lg text-xs text-stone-200 flex items-center gap-1.5 transition-all group"
                  title={`Simular bip da peça ${peca.descricao}`}
                >
                  <Barcode className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-mono font-bold text-amber-300">{peca.codigo}</span>
                  <span className="text-stone-400 truncate max-w-[90px]">{peca.descricao}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botão Finalizar */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-800/80">
            <div className="text-xs text-stone-400">
              Total de itens bipados nesta sessão: <strong className="text-amber-300 font-bold">{scannedSessionCount}</strong>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Concluir & Ver Carrinho
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
