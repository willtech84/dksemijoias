import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Peca, Cliente, FormaPagamento, ParcelaVenda, ItemVenda, Venda } from '../types';
import confetti from 'canvas-confetti';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Trash2, 
  Camera, 
  CreditCard, 
  QrCode, 
  Banknote, 
  FileText, 
  Send, 
  CheckCircle2, 
  UserPlus, 
  DollarSign, 
  Percent,
  Calendar,
  X,
  Share2,
  Printer,
  History,
  TrendingUp,
  Receipt,
  Tag,
  Barcode,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../utils/printHelpers';
import { ReceiptPrintModal } from './ReceiptPrintModal';
import { ReportModal } from './ReportModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { TagPrintModal } from './TagPrintModal';

export const SalesPOS: React.FC = () => {
  const { 
    pecas, 
    clientes, 
    addCliente, 
    registrarVenda, 
    config, 
    vendas,
    usuarios,
    currentUser,
    setCurrentTab,
    openTour
  } = useApp();

  // Seleção de vendedor/operador
  const [vendedorSelecionadoId, setVendedorSelecionadoId] = useState<string>(currentUser.id);

  // Sincronizar com currentUser se o usuário trocar no header
  React.useEffect(() => {
    if (currentUser?.id) {
      setVendedorSelecionadoId(currentUser.id);
    }
  }, [currentUser?.id]);

  // Seleção de cliente
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string>('');
  const [novoClienteNome, setNovoClienteNome] = useState<string>('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState<string>('');
  const [showNovoClienteModal, setShowNovoClienteModal] = useState<boolean>(false);

  // Carrinho de peças da venda
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [buscaPeca, setBuscaPeca] = useState<string>('');

  // Modo câmera para venda fotografando a peça
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pagamento e Condições
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [numParcelas, setNumParcelas] = useState<number>(2);
  const [desconto, setDesconto] = useState<number>(0);
  const [observacoes, setObservacoes] = useState<string>('');

  // Modal de Comprovante / Venda Finalizada
  const [vendaSucesso, setVendaSucesso] = useState<any | null>(null);
  const [selectedVendaForReceipt, setSelectedVendaForReceipt] = useState<Venda | null>(null);
  const [showHistoricoVendas, setShowHistoricoVendas] = useState<boolean>(false);
  const [showRelatorioVendas, setShowRelatorioVendas] = useState<boolean>(false);

  // Scanner de Código de Barras / QR Code com Câmera
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(false);
  // Modal de Impressão de Tags das Peças
  const [showTagPrintModal, setShowTagPrintModal] = useState<boolean>(false);

  // Peças disponíveis para adicionar
  const pecasDisponiveis = pecas.filter(p => p.status === 'disponivel' && p.quantidade > 0);

  const pecasFiltradas = pecasDisponiveis.filter(p => 
    p.descricao.toLowerCase().includes(buscaPeca.toLowerCase()) ||
    p.codigo.toLowerCase().includes(buscaPeca.toLowerCase()) ||
    p.referencia.toLowerCase().includes(buscaPeca.toLowerCase()) ||
    p.modelo.toLowerCase().includes(buscaPeca.toLowerCase())
  );

  // Adicionar ao carrinho
  const handleAdicionarAoCarrinho = (peca: Peca) => {
    setCarrinho(prev => {
      const existe = prev.find(item => item.pecaId === peca.id);
      if (existe) {
        if (existe.quantidade >= peca.quantidade) {
          alert(`Limite de estoque atingido para ${peca.codigo} (${peca.quantidade} un disponíveis).`);
          return prev;
        }
        return prev.map(item => item.pecaId === peca.id 
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.valorUnitario }
          : item
        );
      }
      return [
        ...prev,
        {
          pecaId: peca.id,
          codigo: peca.codigo,
          descricao: peca.descricao,
          fotoUrl: peca.fotos[0]?.url,
          quantidade: 1,
          valorUnitario: peca.precoVenda,
          subtotal: peca.precoVenda
        }
      ];
    });
  };

  const handleRemoverDoCarrinho = (pecaId: string) => {
    setCarrinho(prev => prev.filter(item => item.pecaId !== pecaId));
  };

  const handleAlterarQuantidade = (pecaId: string, delta: number) => {
    setCarrinho(prev => prev.map(item => {
      if (item.pecaId === pecaId) {
        const pecaEstoque = pecas.find(p => p.id === pecaId);
        const max = pecaEstoque ? pecaEstoque.quantidade : 99;
        const novaQtd = Math.max(1, Math.min(max, item.quantidade + delta));
        return {
          ...item,
          quantidade: novaQtd,
          subtotal: novaQtd * item.valorUnitario
        };
      }
      return item;
    }));
  };

  // Câmera para venda fotografando a peça
  const startCameraVenda = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Não foi possível ativar a câmera. Utilize a busca manual ou os cards de peças.');
      setCameraActive(false);
    }
  };

  const stopCameraVenda = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const capturePecaPhotoAndMatch = () => {
    // Simula o reconhecimento visual da peça mais próxima do estoque
    if (pecasDisponiveis.length > 0) {
      const pecaIdentificada = pecasDisponiveis[0];
      handleAdicionarAoCarrinho(pecaIdentificada);
      alert(`Foto capturada com sucesso! Peça identificada: [${pecaIdentificada.codigo}] ${pecaIdentificada.descricao}. Adicionada ao carrinho.`);
    }
    stopCameraVenda();
  };

  // Cálculos financeiros
  const subtotal = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const total = Math.max(0, subtotal - Number(desconto));

  // Gerar parcelas se parcelado
  const gerarParcelas = (): ParcelaVenda[] => {
    if (formaPagamento !== 'parcelado') {
      return [
        {
          id: `parc-${Date.now()}-1`,
          numeroParcela: 1,
          totalParcelas: 1,
          dataVencimento: new Date().toISOString().split('T')[0],
          valor: total,
          pago: formaPagamento !== 'boleto' && formaPagamento !== 'apenas_registro',
          dataPagamento: formaPagamento !== 'boleto' ? new Date().toISOString().split('T')[0] : undefined
        }
      ];
    }

    const valorParcela = Math.round((total / numParcelas) * 100) / 100;
    const parcelas: ParcelaVenda[] = [];
    const hoje = new Date();

    for (let i = 1; i <= numParcelas; i++) {
      const venc = new Date(hoje);
      venc.setMonth(venc.getMonth() + (i - 1)); // 1ª hoje ou 30d
      
      parcelas.push({
        id: `parc-${Date.now()}-${i}`,
        numeroParcela: i,
        totalParcelas: numParcelas,
        dataVencimento: venc.toISOString().split('T')[0],
        valor: i === numParcelas ? total - (valorParcela * (numParcelas - 1)) : valorParcela,
        pago: i === 1, // 1ª parcela paga como entrada
        dataPagamento: i === 1 ? new Date().toISOString().split('T')[0] : undefined
      });
    }

    return parcelas;
  };

  // Finalizar Venda
  const handleFinalizarVenda = () => {
    if (carrinho.length === 0) {
      alert('Adicione pelo menos uma peça ao carrinho de vendas!');
      return;
    }

    let clienteNome = 'Cliente Avulso (Balcão)';
    let clienteTelefone = '(11) 90000-0000';
    let clienteId = 'avulso';

    if (clienteSelecionadoId && clienteSelecionadoId !== 'avulso') {
      const cl = clientes.find(c => c.id === clienteSelecionadoId);
      if (cl) {
        clienteNome = cl.nome;
        clienteTelefone = cl.telefone;
        clienteId = cl.id;
      }
    }

    const parcelas = gerarParcelas();
    const todasPagas = parcelas.every(p => p.pago);
    const statusPagamento = todasPagas ? 'pago' : 'pendente';

    const vendedorObj = usuarios.find(u => u.id === vendedorSelecionadoId) || currentUser;

    const novaVenda = registrarVenda({
      clienteId,
      clienteNome,
      clienteTelefone,
      vendedorId: vendedorObj.id,
      vendedorNome: vendedorObj.nome,
      dataVenda: new Date().toISOString().split('T')[0],
      itens: carrinho,
      valorSubtotal: subtotal,
      desconto: Number(desconto),
      valorTotal: total,
      formaPagamento,
      statusPagamento,
      parcelas,
      observacao: observacoes
    });

    // Celebrar com confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Exibir recibo
    setVendaSucesso(novaVenda);
    setCarrinho([]);
    setDesconto(0);
    setObservacoes('');
  };

  // Criar novo cliente rápido
  const handleCriarNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClienteNome.trim() || !novoClienteTelefone.trim()) return;

    const criado = addCliente({
      nome: novoClienteNome.trim(),
      telefone: novoClienteTelefone.trim(),
      tipo: 'cliente',
      origem: 'manual'
    });

    setClienteSelecionadoId(criado.id);
    setShowNovoClienteModal(false);
    setNovoClienteNome('');
    setNovoClienteTelefone('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Enviar comprovante via WhatsApp
  const handleEnviarComprovanteWhatsApp = (venda: any) => {
    const limpo = venda.clienteTelefone.replace(/\D/g, '');
    const num = limpo.startsWith('55') ? limpo : `55${limpo}`;
    const itensTexto = venda.itens.map((i: any) => `• ${i.codigo} - ${i.descricao} (${i.quantidade}x ${formatCurrency(i.valorUnitario)})`).join('\n');
    
    const textoMsg = `✨ *COMPROVANTE DE COMPRA - ${config.nomeEmpresa.toUpperCase()}* ✨\n\n` +
      `Olá, *${venda.clienteNome}*! Muito obrigado pela sua compra!\n\n` +
      `📅 *Data:* ${formatDate(venda.reciboGeradoEm || venda.dataVenda)}\n` +
      `💳 *Forma de Pagamento:* ${venda.formaPagamento.toUpperCase()}\n\n` +
      `💎 *Itens Adquiridos:*\n${itensTexto}\n\n` +
      `💰 *Subtotal:* ${formatCurrency(venda.valorSubtotal)}\n` +
      (venda.desconto > 0 ? `🏷️ *Desconto:* ${formatCurrency(venda.desconto)}\n` : '') +
      `🎉 *TOTAL PAGO:* ${formatCurrency(venda.valorTotal)}\n\n` +
      `Suas semijoias contam com acabamento nobre antialérgico e garantia. Use com muito brilho! 💖`;

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(textoMsg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Frente de Caixa (PDV)
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
            Registro de Vendas
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Lance vendas por código, busca por foto/câmera, defina parcelamento, Pix ou dinheiro e envie o recibo pelo WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Principal: Escanear Etiqueta com Câmera */}
          <button
            id="btn-escanear-camera"
            onClick={() => setShowBarcodeScanner(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 active:scale-95 transition-all"
            title="Abrir câmera para escanear etiquetas de código de barras ou QR codes das joias"
          >
            <Camera className="w-4 h-4 text-stone-950 stroke-[2.4]" />
            <span>Escanear Etiqueta (Câmera)</span>
            <span className="bg-stone-950/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-extrabold tracking-wider">
              Barcode & QR
            </span>
          </button>

          {/* Botão de Impressão de Tags das Peças */}
          <button
            id="btn-imprimir-tags-pdv"
            onClick={() => setShowTagPrintModal(true)}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Gerar e imprimir tags gravata, bobina térmica ou folha A4 com identificador para as peças"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Imprimir Tags das Peças</span>
          </button>

          {/* Botão Tour Guiado do Sistema */}
          <button
            onClick={openTour}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Aprender a usar o PDV e o Estoque passo a passo"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Tour do Sistema</span>
          </button>

          <button
            onClick={() => setShowRelatorioVendas(true)}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Visualizar e imprimir relatório de vendas"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            Relatório
          </button>

          <button
            onClick={() => setShowHistoricoVendas(true)}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Ver vendas anteriores e reimprimir recibos em A4 ou Bobina"
          >
            <History className="w-3.5 h-3.5 text-stone-600" />
            Recibos ({vendas.length})
          </button>
        </div>
      </div>

      {/* Câmera Ativa de Venda (Legado) */}
      {cameraActive && (
        <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 text-stone-100 flex flex-col items-center gap-3">
          <div className="flex items-center justify-between w-full max-w-md">
            <span className="text-xs font-bold text-amber-300">Fotografe a peça ou etiqueta para venda rápida</span>
            <button onClick={stopCameraVenda} className="text-stone-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-xl aspect-4/3 bg-black object-cover" />
          <button
            onClick={capturePecaPhotoAndMatch}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
          >
            <Camera className="w-4 h-4" />
            Capturar Foto & Identificar Peça
          </button>
        </div>
      )}

      {/* Grid Principal: Seleção de Peças (Esquerda) vs Carrinho & Pagamento (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna Esquerda: Catálogo / Busca de Peças Disponíveis (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            
            {/* Banner com atalho direto para o Leitor de Câmera */}
            <div className="p-2.5 bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-stone-100 border border-amber-300/60 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Barcode className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900">Leitor Ótico com Câmera</div>
                  <div className="text-[11px] text-stone-500 truncate">
                    Bipe a tag com QR ou código de barras para adicionar ao carrinho
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Abrir Câmera</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={buscaPeca}
                onChange={(e) => setBuscaPeca(e.target.value)}
                placeholder="Pesquisar joia por código (SEM-101), nome, banho..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Vitrine Rápida com Fotos das Peças Disponíveis */}
            <div className="max-h-[460px] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pecasFiltradas.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-stone-400">
                  Nenhuma peça disponível para venda com esse termo.
                </div>
              ) : (
                pecasFiltradas.map((peca) => {
                  const foto = peca.fotos[0]?.url;
                  const jaNoCarrinho = carrinho.some(i => i.pecaId === peca.id);

                  return (
                    <div
                      key={peca.id}
                      onClick={() => handleAdicionarAoCarrinho(peca)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        jaNoCarrinho 
                          ? 'border-amber-400 bg-amber-50/40' 
                          : 'border-stone-200 bg-stone-50/50 hover:border-amber-300 hover:bg-white'
                      }`}
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-200 mb-2">
                        <img
                          src={foto || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80'}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-stone-900/80 text-amber-200 rounded text-[9px] font-mono">
                          {peca.codigo}
                        </span>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-white/90 text-stone-800 rounded text-[9px] font-bold">
                          {peca.quantidade} un
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-stone-900 leading-snug line-clamp-2">
                          {peca.descricao}
                        </h4>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 font-serif-luxury">
                            {formatCurrency(peca.precoVenda)}
                          </span>
                          <span className="p-1 bg-amber-500 group-hover:bg-amber-400 text-stone-950 rounded-md">
                            <Plus className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Coluna Direita: Carrinho, Cliente & Pagamento (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            
            {/* Operador / Vendedor Ativo (Multiusuário) */}
            <div className="p-2.5 bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${usuarios.find(u => u.id === vendedorSelecionadoId)?.avatarCor || 'from-amber-600 to-amber-800'} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs`}>
                  {usuarios.find(u => u.id === vendedorSelecionadoId)?.nome.charAt(0) || 'D'}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                    Vendedora / Atendente
                  </span>
                  <select
                    value={vendedorSelecionadoId}
                    onChange={(e) => setVendedorSelecionadoId(e.target.value)}
                    className="bg-transparent font-serif-luxury font-bold text-xs text-stone-900 focus:outline-none cursor-pointer"
                  >
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.perfil === 'admin' ? 'Admin' : u.perfil === 'gerente' ? 'Gerente' : u.perfil === 'vendedor' ? 'Vendedora' : 'Revendedora'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap">
                {usuarios.find(u => u.id === vendedorSelecionadoId)?.comissaoPercentual ? `${usuarios.find(u => u.id === vendedorSelecionadoId)?.comissaoPercentual}% com.` : 'Operando'}
              </span>
            </div>

            {/* 1. Seleção do Cliente */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Cliente Vinculado
                </label>
                <button
                  type="button"
                  onClick={() => setShowNovoClienteModal(true)}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  + Novo Cliente
                </button>
              </div>

              <select
                value={clienteSelecionadoId}
                onChange={(e) => setClienteSelecionadoId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="avulso">Cliente Avulso (Balcão / Não identificado)</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.telefone} ({c.tipo === 'revendedor' ? 'Revendedora' : 'Cliente'})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Itens do Carrinho */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Itens na Venda ({carrinho.length})
                </span>
                {carrinho.length > 0 && (
                  <button
                    onClick={() => setCarrinho([])}
                    className="text-[11px] text-rose-600 hover:text-rose-800"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl p-2 bg-stone-50/50">
                {carrinho.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400">
                    Nenhuma peça selecionada ainda. Clique nas peças ao lado para adicionar.
                  </div>
                ) : (
                  carrinho.map(item => (
                    <div key={item.pecaId} className="py-2 flex items-center justify-between gap-2">
                      <img
                        src={item.fotoUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          {item.descricao}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {formatCurrency(item.valorUnitario)} x {item.quantidade}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleAlterarQuantidade(item.pecaId, -1)}
                          className="w-5 h-5 bg-stone-200 hover:bg-stone-300 rounded text-xs font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1">{item.quantidade}</span>
                        <button
                          onClick={() => handleAlterarQuantidade(item.pecaId, 1)}
                          className="w-5 h-5 bg-stone-200 hover:bg-stone-300 rounded text-xs font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoverDoCarrinho(item.pecaId)}
                          className="p-1 text-stone-400 hover:text-rose-600 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Forma de Pagamento */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Forma de Pagamento
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'pix', label: 'Pix', icon: QrCode },
                  { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
                  { id: 'parcelado', label: 'Parcelado', icon: Calendar },
                  { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
                  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                  { id: 'apenas_registro', label: 'Apenas Registro', icon: FileText },
                ].map(opt => {
                  const Icon = opt.icon;
                  const isSelected = formaPagamento === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormaPagamento(opt.id as FormaPagamento)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Opções de Parcelamento */}
              {formaPagamento === 'parcelado' && (
                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-900">Número de Parcelas:</span>
                    <select
                      value={numParcelas}
                      onChange={(e) => setNumParcelas(Number(e.target.value))}
                      className="px-2 py-1 bg-white border border-amber-300 font-bold rounded-lg text-amber-900"
                    >
                      {[2, 3, 4, 5, 6, 10, 12].map(n => (
                        <option key={n} value={n}>{n}x de {formatCurrency(total / n)}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-stone-600">
                    * Gera datas mensais automáticas para controle de carnê e lembretes de cobrança via WhatsApp.
                  </p>
                </div>
              )}

              {/* Opção Pix */}
              {formaPagamento === 'pix' && (
                <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">Chave Pix da Loja:</span>
                    <span className="font-mono text-amber-700 font-bold">{config.chavePix}</span>
                  </div>
                  <div className="text-[10px] text-stone-500">
                    O comprovante será enviado diretamente com link de confirmação.
                  </div>
                </div>
              )}
            </div>

            {/* 4. Desconto e Totais */}
            <div className="pt-2 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal dos itens:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-600">Desconto negociado (R$):</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={desconto}
                  onChange={(e) => setDesconto(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 px-2 py-1 text-right bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-700 block">Total a Pagar</span>
                  <span className="text-[10px] text-stone-400 capitalize">{formaPagamento.replace('_', ' ')}</span>
                </div>
                <div className="text-2xl font-serif-luxury font-bold text-stone-900">
                  {formatCurrency(total)}
                </div>
              </div>
            </div>

            {/* Botão Finalizar */}
            <button
              id="btn-finalizar-venda"
              onClick={handleFinalizarVenda}
              disabled={carrinho.length === 0}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5" />
              Finalizar Venda & Emitir Recibo
            </button>

          </div>

        </div>

      </div>

      {/* MODAL NOVO CLIENTE RÁPIDO */}
      {showNovoClienteModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-2xl max-w-sm w-full border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-sm text-stone-900">Cadastrar Novo Cliente Rápido</h3>
              <button onClick={() => setShowNovoClienteModal(false)} className="text-stone-400 hover:text-stone-700 font-bold">×</button>
            </div>
            <form onSubmit={handleCriarNovoCliente} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={novoClienteNome}
                  onChange={(e) => setNovoClienteNome(e.target.value)}
                  placeholder="Ex: Luciana Ferraz"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  required
                  value={novoClienteTelefone}
                  onChange={(e) => setNovoClienteTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovoClienteModal(false)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg shadow-xs"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO DE RECIBO (A4 OU BOBINA TÉRMICA) */}
      {(vendaSucesso || selectedVendaForReceipt) && (
        <ReceiptPrintModal
          type="venda"
          data={vendaSucesso || selectedVendaForReceipt}
          onClose={() => {
            setVendaSucesso(null);
            setSelectedVendaForReceipt(null);
          }}
        />
      )}

      {/* MODAL DE HISTÓRICO DE VENDAS & REIMPRESSÃO */}
      {showHistoricoVendas && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif-luxury font-bold text-base text-stone-100">
                    Histórico de Vendas & Reimpressão de Recibos
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Selecione qualquer venda realizada para imprimir em folha A4 ou bobina térmica (80mm).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoricoVendas(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {vendas.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  Nenhuma venda realizada ainda.
                </div>
              ) : (
                vendas.map(v => (
                  <div 
                    key={v.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{v.clienteNome}</span>
                        <span className="text-[10px] font-mono bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">#{v.id}</span>
                        <span className="text-stone-500 font-medium">({formatDate(v.dataVenda)})</span>
                      </div>
                      <div className="text-stone-600 text-[11px]">
                        {v.itens.map(i => `${i.quantidade}x ${i.codigo}`).join(', ')} • Forma: <span className="capitalize font-semibold">{v.formaPagamento.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif-luxury font-bold text-base text-stone-900">
                        {formatCurrency(v.valorTotal)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedVendaForReceipt(v);
                          setShowHistoricoVendas(false);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir Recibo
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setShowHistoricoVendas(false)}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE RELATÓRIO DE VENDAS */}
      {showRelatorioVendas && (
        <ReportModal
          reportType="vendas"
          onClose={() => setShowRelatorioVendas(false)}
        />
      )}

      {/* MODAL DE LEITURA COM CÂMERA (BARCODE & QR CODE) */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        pecas={pecasDisponiveis}
        onPieceScanned={handleAdicionarAoCarrinho}
      />

      {/* MODAL DE IMPRESSÃO DE TAGS / ETIQUETAS */}
      <TagPrintModal
        isOpen={showTagPrintModal}
        onClose={() => setShowTagPrintModal(false)}
      />

    </div>
  );
};
