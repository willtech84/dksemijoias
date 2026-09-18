import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Peca, TipoPeca, ModeloBanho, FotoPeca } from '../types';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  FileSpreadsheet, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle, 
  ArrowDownToLine, 
  Sparkles, 
  BookOpen, 
  FileText,
  DollarSign,
  Layers,
  LayoutGrid,
  List,
  Printer,
  Tag,
  Barcode,
  X,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { ReportModal } from './ReportModal';
import { TagPrintModal } from './TagPrintModal';
import { formatDate } from '../utils/printHelpers';

const TIPOS_PECA: TipoPeca[] = [
  'Brinco', 
  'Colar', 
  'Pulseira', 
  'Anel', 
  'Tornozeleira', 
  'Conjunto', 
  'Pingente', 
  'Gargantilha'
];

const MODELOS_BANHO: ModeloBanho[] = [
  'Nenhum',
  'Ouro 18k', 
  'Prata 925', 
  'Ródio Branco', 
  'Ródio Negro', 
  'Ouro Rosé', 
  'Zircônia Cristal', 
  'Pérola Natural', 
  'Cravação Pavê'
];

export const StockManagement: React.FC = () => {
  const { 
    pecas, 
    addPeca, 
    updatePeca, 
    deletePeca, 
    limparExemplosEstoque,
    limparTodasPecas,
    importPecas, 
    config, 
    updateConfig, 
    searchQuery, 
    setSearchQuery 
  } = useApp();

  const [showModalLimparExemplos, setShowModalLimparExemplos] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterModelo, setFilterModelo] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'disponiveis' | 'zerados'>('todos');
  const [filterParadasOnly, setFilterParadasOnly] = useState<boolean>(false);
  const [pecaParaExcluir, setPecaParaExcluir] = useState<Peca | null>(null);
  const [showModalCadastro, setShowModalCadastro] = useState<boolean>(false);
  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  const [editingPecaId, setEditingPecaId] = useState<string | null>(null);
  const [showRelatorioEstoque, setShowRelatorioEstoque] = useState<boolean>(false);
  const [showTagPrintModal, setShowTagPrintModal] = useState<boolean>(false);
  const [selectedPecaForTag, setSelectedPecaForTag] = useState<Peca | null>(null);
  
  // Imagem em visualização ampliada
  const [modalFotoZoom, setModalFotoZoom] = useState<FotoPeca | null>(null);

  // Form State
  const [codigo, setCodigo] = useState('');
  const [referencia, setReferencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoPeca>('Brinco');
  const [modelo, setModelo] = useState<ModeloBanho>('Ouro 18k');
  const [notaFiscal, setNotaFiscal] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().split('T')[0]);
  const [fornecedor, setFornecedor] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Finanças da Peça / Compra
  const [valorCompra, setValorCompra] = useState<number>(30.00);
  const [margemTipo, setMargemTipo] = useState<'percentual' | 'fixo'>('percentual');
  const [margemValor, setMargemValor] = useState<number>(150); // 150%
  const [despesaCartaoPercent, setDespesaCartaoPercent] = useState<number>(4); // 4% taxa
  const [despesaFreteOuCombustivel, setDespesaFreteOuCombustivel] = useState<number>(0);
  const [comissaoPercent, setComissaoPercent] = useState<number>(0);

  // Fotos da Peça (incluindo anotação de caderno)
  const [fotosList, setFotosList] = useState<FotoPeca[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Estado da importação Excel / PDF
  const [importText, setImportText] = useState('');
  const [previewImport, setPreviewImport] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cálculo automático do Preço de Venda
  const calcularPrecoVenda = () => {
    let base = Number(valorCompra) || 0;
    // Adicionar despesas fixas rateadas
    base += Number(despesaFreteOuCombustivel) || 0;

    let venda = 0;
    if (margemTipo === 'percentual') {
      venda = base * (1 + (Number(margemValor) || 0) / 100);
    } else {
      venda = base + (Number(margemValor) || 0);
    }

    // Embutir comissao e taxa cartao se aplicavel
    const taxaDeducoes = ((Number(despesaCartaoPercent) || 0) + (Number(comissaoPercent) || 0)) / 100;
    if (taxaDeducoes > 0 && taxaDeducoes < 0.5) {
      venda = venda / (1 - taxaDeducoes);
    }

    return Math.round(venda * 100) / 100;
  };

  const precoVendaCalculado = calcularPrecoVenda();

  // Reset form
  const resetForm = () => {
    setCodigo(`SEM-${Math.floor(100 + Math.random() * 900)}`);
    setReferencia(`REF-${Math.floor(10 + Math.random() * 90)}`);
    setDescricao('');
    setTipo('Brinco');
    setModelo('Ouro 18k');
    setNotaFiscal('NF-' + Math.floor(1000 + Math.random() * 9000));
    setQuantidade(1);
    setDataEntrada(new Date().toISOString().split('T')[0]);
    setFornecedor('Fornecedor de Joias');
    setObservacoes('');
    setValorCompra(35.00);
    setMargemTipo('percentual');
    setMargemValor(150);
    setDespesaCartaoPercent(4);
    setDespesaFreteOuCombustivel(0);
    setComissaoPercent(0);
    setFotosList([
      {
        id: `f-${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto',
        legenda: 'Foto do Produto'
      }
    ]);
    setEditingPecaId(null);
  };

  const handleOpenCadastrar = () => {
    resetForm();
    setShowModalCadastro(true);
  };

  const handleEditPeca = (p: Peca) => {
    setEditingPecaId(p.id);
    setCodigo(p.codigo);
    setReferencia(p.referencia);
    setDescricao(p.descricao);
    setTipo(p.tipo);
    setModelo(p.modelo);
    setNotaFiscal(p.notaFiscal);
    setQuantidade(p.quantidade);
    setDataEntrada(p.dataEntrada);
    setFornecedor(p.fornecedor || '');
    setObservacoes(p.observacoes || '');
    setValorCompra(p.valorCompra);
    setMargemTipo(p.margemTipo);
    setMargemValor(p.margemValor);
    setFotosList(p.fotos || []);
    setShowModalCadastro(true);
  };

  const handleSalvarPeca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !codigo.trim()) {
      alert('Preencha ao menos o Código e a Descrição da peça!');
      return;
    }

    const payload = {
      codigo: codigo.trim().toUpperCase(),
      referencia: referencia.trim().toUpperCase(),
      descricao: descricao.trim(),
      tipo,
      modelo,
      notaFiscal: notaFiscal.trim(),
      valorCompra: Number(valorCompra),
      margemTipo,
      margemValor: Number(margemValor),
      precoVenda: precoVendaCalculado,
      quantidade: Number(quantidade),
      dataEntrada,
      status: 'disponivel' as const,
      fotos: fotosList.length > 0 ? fotosList : [
        {
          id: `f-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
          tipo: 'produto' as const
        }
      ],
      fornecedor,
      observacoes
    };

    if (editingPecaId) {
      updatePeca(editingPecaId, payload);
    } else {
      addPeca(payload);
    }

    setShowModalCadastro(false);
  };

  // Manipulação de fotos (upload local em base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, tipoFoto: 'produto' | 'anotacao_caderno') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFotosList(prev => [
          ...prev,
          {
            id: `f-${Date.now()}`,
            url: reader.result as string,
            tipo: tipoFoto,
            legenda: tipoFoto === 'anotacao_caderno' ? 'Foto de anotação de caderno' : 'Foto da semijoia'
          }
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Câmera ao vivo para fotografar peça ou anotação
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Não foi possível acessar a câmera no momento. Você pode fazer upload de uma foto do dispositivo.');
      setCameraActive(false);
    }
  };

  const capturePhoto = (tipoFoto: 'produto' | 'anotacao_caderno') => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFotosList(prev => [
        ...prev,
        {
          id: `f-${Date.now()}`,
          url: dataUrl,
          tipo: tipoFoto,
          legenda: tipoFoto === 'anotacao_caderno' ? 'Foto capturada do caderno' : 'Foto capturada pela câmera'
        }
      ]);
    }
    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // Adicionar foto rápida de caderno / nota de amostra
  const handleAdicionarAnotacaoCadernoExemplo = () => {
    setFotosList(prev => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80',
        tipo: 'anotacao_caderno',
        legenda: 'Anotação de caderno - Lote, Peso e Custo Fornecedor'
      }
    ]);
  };

  // Manipulador de Importação de Arquivo Excel (.xlsx, .xls, .csv)
  const handleImportExcelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        // Mapear campos flexíveis
        const mapped = data.map((row, idx) => ({
          codigo: row.Codigo || row.codigo || row.COD || `IMP-${idx + 100}`,
          referencia: row.Referencia || row.referencia || row.REF || `REF-${idx + 1}`,
          descricao: row.Descricao || row.descricao || row.Nome || row.Produto || 'Semijoia Importada',
          tipo: row.Tipo || row.tipo || 'Brinco',
          modelo: row.Modelo || row.modelo || row.Banho || 'Ouro 18k',
          notaFiscal: row.NotaFiscal || row.NF || row['Nota Fiscal'] || 'NF-IMP',
          valorCompra: Number(row.ValorCompra || row['Valor Compra'] || row.Custo || 30),
          margemValor: Number(row.Margem || row['Margem %'] || 150),
          margemTipo: 'percentual',
          precoVenda: Number(row.PrecoVenda || row['Preco Venda'] || row.Venda || 0),
          quantidade: Number(row.Quantidade || row.Qtd || 1),
          fornecedor: row.Fornecedor || 'Fornecedor Planilha'
        }));

        setPreviewImport(mapped);
      } catch (err) {
        alert('Erro ao processar o arquivo Excel. Verifique se o formato está correto.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Parser de texto colado de PDF ou Tabela
  const handleParseTextTabela = () => {
    if (!importText.trim()) return;

    // Linhas separadas por quebra de linha
    const lines = importText.trim().split('\n');
    const parsed: any[] = [];

    lines.forEach((line, idx) => {
      // Separadores comuns: tab, vírgula, ponto e vírgula ou barra vertical
      const cols = line.split(/[\t;,|]/).map(c => c.trim()).filter(Boolean);
      if (cols.length >= 2) {
        // Formato esperado flexível: Codigo | Descricao | Custo | Venda | Qtd
        const cod = cols[0] || `IMP-${idx + 200}`;
        const desc = cols[1] || 'Semijoia Importada';
        const custo = parseFloat(cols[2]?.replace('R$', '').replace('.', '').replace(',', '.') || '35') || 35;
        const venda = parseFloat(cols[3]?.replace('R$', '').replace('.', '').replace(',', '.') || '90') || (custo * 2.5);
        const qtd = parseInt(cols[4] || '1', 10) || 1;

        parsed.push({
          codigo: cod,
          referencia: `REF-${idx + 1}`,
          descricao: desc,
          tipo: 'Brinco',
          modelo: 'Ouro 18k',
          notaFiscal: 'NF-PDF',
          valorCompra: custo,
          margemValor: 150,
          margemTipo: 'percentual',
          precoVenda: venda,
          quantidade: qtd,
          fornecedor: 'Importação PDF/Texto'
        });
      }
    });

    setPreviewImport(parsed);
  };

  // Baixar modelo de planilha
  const handleDownloadTemplateExcel = () => {
    const templateData = [
      {
        Codigo: 'SEM-201',
        Referencia: 'COL-COR-01',
        Descricao: 'Colar Choker Corações Vazados 45cm',
        Tipo: 'Colar',
        Modelo: 'Ouro 18k',
        NotaFiscal: 'NF-1020',
        ValorCompra: 45.00,
        Margem: 150,
        Quantidade: 3,
        Fornecedor: 'Limeira Joias'
      },
      {
        Codigo: 'SEM-202',
        Referencia: 'BRI-PER-05',
        Descricao: 'Brinco Pérola Shell Pendente',
        Tipo: 'Brinco',
        Modelo: 'Prata 925',
        NotaFiscal: 'NF-1020',
        ValorCompra: 30.00,
        Margem: 180,
        Quantidade: 5,
        Fornecedor: 'Limeira Joias'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo_Estoque_Aura');
    XLSX.writeFile(wb, 'modelo_estoque_semijoias.xlsx');
  };

  const handleConfirmarImportacao = () => {
    if (previewImport.length === 0) return;
    const count = importPecas(previewImport);
    alert(`${count} peças importadas para o estoque com sucesso!`);
    setPreviewImport([]);
    setImportText('');
    setShowModalImport(false);
  };

  // Contagem dinâmica por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: pecas.length };
    TIPOS_PECA.forEach(t => {
      counts[t] = pecas.filter(p => p.tipo.toLowerCase() === t.toLowerCase()).length;
    });
    return counts;
  }, [pecas]);

  // Filtragem e busca aprimorada
  const hoje = new Date();
  const pecasFiltradas = pecas.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      p.descricao.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      p.referencia.toLowerCase().includes(q) ||
      p.notaFiscal.toLowerCase().includes(q) ||
      p.modelo.toLowerCase().includes(q) ||
      p.tipo.toLowerCase().includes(q) ||
      (p.fornecedor && p.fornecedor.toLowerCase().includes(q));

    const matchesTipo = filterTipo === 'todos' || p.tipo.toLowerCase() === filterTipo.toLowerCase();
    const matchesModelo = filterModelo === 'todos' || p.modelo === filterModelo;
    
    const matchesStatus = 
      filterStatus === 'todos' ? true :
      filterStatus === 'disponiveis' ? p.quantidade > 0 :
      p.quantidade <= 0;

    if (filterParadasOnly) {
      const dataEntrada = new Date(p.dataEntrada);
      const diffTime = Math.abs(hoje.getTime() - dataEntrada.getTime());
      const diasParada = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return matchesSearch && matchesTipo && matchesModelo && matchesStatus && diasParada >= config.diasPecaParadaAlerta;
    }

    return matchesSearch && matchesTipo && matchesModelo && matchesStatus;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || filterTipo !== 'todos' || filterModelo !== 'todos' || filterStatus !== 'todos' || filterParadasOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterTipo('todos');
    setFilterModelo('todos');
    setFilterStatus('todos');
    setFilterParadasOnly(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header da Seção com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Controle de Joias & Compras
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
            Gestão de Estoque
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Cadastre peças com notas fiscais, fotos e controle de giro de estoque.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-imprimir-tags"
            onClick={() => {
              setSelectedPecaForTag(null);
              setShowTagPrintModal(true);
            }}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Gerar e imprimir tags gravata, bobinas térmicas ou folhas A4 para as peças"
          >
            <Tag className="w-4 h-4 text-amber-400" />
            <span>Imprimir Tags / Etiquetas</span>
          </button>

          <button
            onClick={() => setShowRelatorioEstoque(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Visualizar, salvar e imprimir relatório individual de estoque"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            Relatório de Estoque
          </button>
          <button
            onClick={() => setShowModalImport(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Importar Excel / PDF
          </button>
          <button
            onClick={() => setShowModalLimparExemplos(true)}
            className="px-3 py-2 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Excluir exemplos de teste ou zerar todo o estoque"
          >
            <Trash2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Limpar Exemplos</span>
          </button>
          <button
            id="btn-cadastrar-peca"
            onClick={handleOpenCadastrar}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Nova Peça
          </button>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros por Categoria */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3.5">
        
        {/* Linha 1: Barra de Pesquisa Principal + Contagem de Peças + Toggle de Visualização */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Campo de Pesquisa em Destaque */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por código (ex: BR-101), descrição, banho, fornecedor ou referência..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Contagem e Alternador Grade/Tabela */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap">
              Exibindo <strong className="text-stone-800">{pecasFiltradas.length}</strong> de {pecas.length} peças
            </span>

            {/* Toggle Grade / Tabela */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-700'}`}
                title="Visualização em Grade com Fotos"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-700'}`}
                title="Visualização em Tabela Detalhada"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Linha 2: Chips de Categorias (ex: anéis, colares, brincos) */}
        <div className="pt-1">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Filtrar por Categoria:
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            {/* Botão Todos */}
            <button
              onClick={() => setFilterTipo('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTipo === 'todos'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <span>✨ Todas as Peças</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterTipo === 'todos' ? 'bg-amber-600/30 text-stone-950' : 'bg-stone-200 text-stone-600'
              }`}>
                {categoryCounts.todos}
              </span>
            </button>

            {/* Categorias Principais (Brinco, Colar, Anel, Pulseira, Conjunto, Tornozeleira, Pingente, Gargantilha) */}
            {TIPOS_PECA.map(cat => {
              const count = categoryCounts[cat] || 0;
              const isSelected = filterTipo.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setFilterTipo(isSelected ? 'todos' : cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  <span>
                    {cat === 'Brinco' ? '💎 Brincos' :
                     cat === 'Colar' ? '✨ Colares' :
                     cat === 'Anel' ? '💍 Anéis' :
                     cat === 'Pulseira' ? '📿 Pulseiras' :
                     cat === 'Conjunto' ? '👑 Conjuntos' :
                     cat === 'Tornozeleira' ? '✨ Tornozeleiras' :
                     cat === 'Pingente' ? '✨ Pingentes' :
                     cat === 'Gargantilha' ? '✨ Chokers' : cat}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-amber-600/30 text-stone-950' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Linha 3: Sub-filtros (Banhos, Status do Estoque e Peças Paradas) */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Banho */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-500 font-medium">Banho:</span>
              <select
                value={filterModelo}
                onChange={(e) => setFilterModelo(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="todos">Todos os Banhos</option>
                {MODELOS_BANHO.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Filtro Status de Quantidade */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-500 font-medium">Disponibilidade:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="todos">Todos os Status</option>
                <option value="disponiveis">Em Estoque ({'>'} 0)</option>
                <option value="zerados">Esgotados (0)</option>
              </select>
            </div>
          </div>

          {/* Botão Peças Paradas (+30d) */}
          <button
            onClick={() => setFilterParadasOnly(!filterParadasOnly)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
              filterParadasOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
            title="Filtrar peças sem giro há mais de 30 dias"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Peças Paradas (+{config.diasPecaParadaAlerta}d)</span>
          </button>

        </div>

      </div>

      {/* Lista de Peças: MODO GRADE */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pecasFiltradas.length === 0 ? (
            <div className="col-span-full py-16 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Nenhuma peça encontrada com os filtros selecionados.</p>
              <p className="text-xs text-stone-400 mt-1">Tente ajustar a busca ou cadastrar uma nova peça.</p>
            </div>
          ) : (
            pecasFiltradas.map((peca) => {
              const dataEntrada = new Date(peca.dataEntrada);
              const diasNoEstoque = Math.ceil(Math.abs(hoje.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
              const isParada = diasNoEstoque >= config.diasPecaParadaAlerta && peca.status === 'disponivel';
              const fotoPrincipal = peca.fotos.find(f => f.tipo === 'produto') || peca.fotos[0];
              const fotoAnotacao = peca.fotos.find(f => f.tipo === 'anotacao_caderno');

              return (
                <div 
                  key={peca.id} 
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
                >
                  {/* Foto e Badges */}
                  <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                    <img
                      src={fotoPrincipal?.url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'}
                      alt={peca.descricao}
                      onClick={() => fotoPrincipal && setModalFotoZoom(fotoPrincipal)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    />

                    {/* Badge Parada */}
                    {isParada && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-600/95 text-white rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
                        <Clock className="w-3 h-3" />
                        {diasNoEstoque}d parada
                      </span>
                    )}

                    {/* Badge Banho / Modelo */}
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-stone-900/80 backdrop-blur-xs text-amber-200 rounded-md text-[10px] font-medium tracking-wide">
                      {peca.modelo}
                    </span>

                    {/* Quantidade em estoque */}
                    <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      peca.quantidade > 0 ? 'bg-white/90 text-stone-900 shadow-2xs' : 'bg-rose-600 text-white'
                    }`}>
                      {peca.quantidade > 0 ? `${peca.quantidade} em estoque` : 'Esgotada'}
                    </span>
                  </div>

                  {/* Informações da Peça */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mb-1">
                        <span>{peca.codigo}</span>
                        <span>{peca.referencia}</span>
                      </div>

                      <h3 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2">
                        {peca.descricao}
                      </h3>

                      <div className="mt-2 text-[11px] text-stone-500 space-y-0.5">
                        <div>NF: <strong className="text-stone-700">{peca.notaFiscal || 'S/N'}</strong></div>
                        <div>Entrada: <strong className="text-stone-700">{formatDate(peca.dataEntrada)}</strong></div>
                      </div>
                    </div>

                    {/* Preços e Ações */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-stone-400">
                          Custo: {formatCurrency(peca.valorCompra)} ({peca.margemTipo === 'percentual' ? `+${peca.margemValor}%` : `+${formatCurrency(peca.margemValor)}`})
                        </div>
                        <div className="text-base font-bold text-stone-900 font-serif-luxury">
                          {formatCurrency(peca.precoVenda)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedPecaForTag(peca);
                            setShowTagPrintModal(true);
                          }}
                          className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Imprimir tag / etiqueta desta semijoia"
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPeca(peca)}
                          className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar peça"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPecaParaExcluir(peca)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir peça do estoque"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Lista de Peças: MODO TABELA */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Peça</th>
                  <th className="px-3 py-3">Código / Ref</th>
                  <th className="px-3 py-3">Tipo & Banho</th>
                  <th className="px-3 py-3">Nota Fiscal</th>
                  <th className="px-3 py-3">Custo Compra</th>
                  <th className="px-3 py-3">Margem / Venda</th>
                  <th className="px-3 py-3">Qtd</th>
                  <th className="px-3 py-3">Status / Giro</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {pecasFiltradas.map((peca) => {
                  const dataEntrada = new Date(peca.dataEntrada);
                  const diasNoEstoque = Math.ceil(Math.abs(hoje.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
                  const isParada = diasNoEstoque >= config.diasPecaParadaAlerta && peca.status === 'disponivel';
                  const foto = peca.fotos[0]?.url;

                  return (
                    <tr key={peca.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={foto || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-stone-900">{peca.descricao}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono">
                        <div>{peca.codigo}</div>
                        <div className="text-stone-400 text-[10px]">{peca.referencia}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div>{peca.tipo}</div>
                        <div className="text-stone-500 text-[10px]">{peca.modelo}</div>
                      </td>
                      <td className="px-3 py-3 text-stone-600">{peca.notaFiscal || '-'}</td>
                      <td className="px-3 py-3 text-stone-600">{formatCurrency(peca.valorCompra)}</td>
                      <td className="px-3 py-3">
                        <div className="font-bold text-stone-900">{formatCurrency(peca.precoVenda)}</div>
                        <div className="text-emerald-700 text-[10px]">
                          {peca.margemTipo === 'percentual' ? `+${peca.margemValor}%` : `+${formatCurrency(peca.margemValor)}`}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold">{peca.quantidade}</td>
                      <td className="px-3 py-3">
                        {isParada ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold text-[10px]">
                            <Clock className="w-3 h-3" /> {diasNoEstoque}d parada
                          </span>
                        ) : (
                          <span className="text-stone-500 text-[11px]">{diasNoEstoque}d no estoque</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedPecaForTag(peca);
                              setShowTagPrintModal(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                            title="Imprimir tag desta peça"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditPeca(peca)}
                            className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                            title="Editar peça"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPecaParaExcluir(peca)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Excluir peça do estoque"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO DETALHADO DE PEÇA */}
      {showModalCadastro && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8">
            
            {/* Top Modal Header */}
            <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-stone-950 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-base text-amber-100">
                    {editingPecaId ? 'Editar Semijoia' : 'Cadastrar Nova Peça no Estoque'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Preencha os dados da joia, fotos, custos e margem de lucro.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModalCadastro(false)}
                className="text-stone-400 hover:text-stone-100 text-xl font-bold leading-none p-1"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSalvarPeca} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Seção 1: Identificação da Peça */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  1. Identificação & Nota Fiscal
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Código da Peça *</label>
                    <input
                      type="text"
                      required
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      placeholder="Ex: SEM-105"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Referência / Lote</label>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Ex: BRI-OU-18"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Nota Fiscal (NF) *</label>
                    <input
                      type="text"
                      value={notaFiscal}
                      onChange={(e) => setNotaFiscal(e.target.value)}
                      placeholder="Ex: NF-9420"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-stone-700 font-semibold mb-1">Descrição Detalhada *</label>
                    <input
                      type="text"
                      required
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Ex: Colar Choker Elos Portugueses Banhado a Ouro 18k 45cm"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Tipo da Peça</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoPeca)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      {TIPOS_PECA.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Modelo / Banho</label>
                    <select
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value as ModeloBanho)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      {MODELOS_BANHO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Quantidade em Estoque</label>
                    <input
                      type="number"
                      min={1}
                      value={quantidade}
                      onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Fotos da Semijoia */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    2. Fotos do Produto
                  </h4>
                </div>

                <p className="text-[11px] text-stone-500 mb-3">
                  Anexe fotos nítidas da semijoia para o catálogo vitrine, controle de estoque e vendas no PDV.
                </p>

                {/* Upload Buttons */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>Upload Foto Produto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'produto')}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fotografar com Câmera</span>
                  </button>
                </div>

                {/* Camera View se ativa */}
                {cameraActive && (
                  <div className="p-3 bg-stone-900 rounded-xl mb-3 flex flex-col items-center gap-3">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm rounded-lg aspect-4/3 bg-black object-cover" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => capturePhoto('produto')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-xs"
                      >
                        Capturar Foto da Semijoia
                      </button>
                    </div>
                  </div>
                )}

                {/* Miniaturas das fotos cadastradas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {fotosList.map((foto, idx) => (
                    <div key={foto.id || idx} className="relative group border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                      <img
                        src={foto.url}
                        alt="Miniatura"
                        className="w-full h-24 object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-900/80 text-white">
                        Produto
                      </span>
                      <button
                        type="button"
                        onClick={() => setFotosList(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção 3: Registro de Compra, Margem de Lucro e Despesas */}
              <div className="pt-3 border-t border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  3. Registro de Compra, Margem & Despesas Rateadas
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Valor de Compra (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={valorCompra}
                      onChange={(e) => setValorCompra(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Tipo de Margem de Lucro</label>
                    <select
                      value={margemTipo}
                      onChange={(e) => setMargemTipo(e.target.value as 'percentual' | 'fixo')}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="percentual">Porcentagem (%)</option>
                      <option value="fixo">Valor Fixo (R$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      {margemTipo === 'percentual' ? 'Margem de Lucro (%)' : 'Margem de Lucro Fixa (R$)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={margemValor}
                      onChange={(e) => setMargemValor(parseFloat(e.target.value) || 0)}
                      placeholder={margemTipo === 'percentual' ? 'Ex: 150' : 'Ex: 50'}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Taxa Cartão / Maquininha (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={despesaCartaoPercent}
                      onChange={(e) => setDespesaCartaoPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Frete / Combustível Rateado (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={despesaFreteOuCombustivel}
                      onChange={(e) => setDespesaFreteOuCombustivel(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Comissão Vendedora (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={comissaoPercent}
                      onChange={(e) => setComissaoPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Box de Preço de Venda Calculado */}
                <div className="mt-4 p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-900 block">
                      Preço de Venda Sugerido (com margem e despesas calculadas)
                    </span>
                    <span className="text-[11px] text-stone-600">
                      Custo total R$ {(valorCompra + despesaFreteOuCombustivel).toFixed(2)} → Lucro líquido estimado: R$ {(precoVendaCalculado - valorCompra - despesaFreteOuCombustivel).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-2xl font-serif-luxury font-bold text-amber-900">
                    {formatCurrency(precoVendaCalculado)}
                  </div>
                </div>
              </div>

              {/* Botões Finais */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-2">
                {editingPecaId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const pAtual = pecas.find(p => p.id === editingPecaId);
                      if (pAtual) setPecaParaExcluir(pAtual);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Peça</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModalCadastro(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    {editingPecaId ? 'Salvar Alterações' : 'Salvar Peça no Estoque'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTAÇÃO EXCEL / PDF */}
      {showModalImport && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif-luxury font-bold text-base text-stone-100">
                  Importar Estoque de Excel ou PDF
                </h3>
              </div>
              <button
                onClick={() => setShowModalImport(false)}
                className="text-stone-400 hover:text-stone-100 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <span className="font-semibold text-stone-900 block">Opção 1: Arquivo Excel (.xlsx / .csv)</span>
                  <span className="text-[11px] text-stone-500">Selecione uma planilha do seu computador</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTemplateExcel}
                    className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-stone-500" />
                    Baixar Modelo
                  </button>
                  <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    Escolher Planilha
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={handleImportExcelFile}
                    />
                  </label>
                </div>
              </div>

              {/* Opção 2: Colar do PDF */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div>
                  <span className="font-semibold text-stone-900 block">Opção 2: Copiar e Colar dados de PDF / Tabela</span>
                  <span className="text-[11px] text-stone-500">Cole linhas tabuladas (Código | Descrição | Custo | Venda | Qtd)</span>
                </div>
                <textarea
                  rows={3}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="SEM-301	Gargantilha Ponto de Luz	38.00	95.00	2&#10;SEM-302	Brinco Ear Cuff Zircônia	25.00	69.00	4"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono text-[11px] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleParseTextTabela}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium"
                >
                  Processar Linhas de Texto
                </button>
              </div>

              {/* Prévia da Importação */}
              {previewImport.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">
                      ✓ {previewImport.length} peça(s) detectada(s) prontas para cadastro:
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewImport([])}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-emerald-200/60 bg-white rounded-lg p-2 border border-emerald-100">
                    {previewImport.map((item, idx) => (
                      <div key={idx} className="py-1 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-stone-600">{item.codigo}</span>
                        <span className="font-medium text-stone-900 truncate mx-2 flex-1">{item.descricao}</span>
                        <span className="text-emerald-700 font-bold">{formatCurrency(item.precoVenda || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões do Modal Importação */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalImport(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={previewImport.length === 0}
                  onClick={handleConfirmarImportacao}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Confirmar Importação de {previewImport.length} Peças
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ZOOM DE FOTO / ANOTAÇÃO CADERNO */}
      {modalFotoZoom && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 p-4 rounded-2xl max-w-lg w-full border border-stone-800 text-stone-100">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs font-semibold text-amber-300">
                {modalFotoZoom.tipo === 'anotacao_caderno' ? '📖 Anotação de Caderno da Peça' : '💎 Foto Oficial da Semijoia'}
              </span>
              <button onClick={() => setModalFotoZoom(null)} className="text-stone-400 hover:text-white font-bold">×</button>
            </div>
            <div className="my-3 aspect-4/3 overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img src={modalFotoZoom.url} alt="" className="w-full h-full object-contain" />
            </div>
            {modalFotoZoom.legenda && (
              <p className="text-xs text-stone-400 italic text-center">"{modalFotoZoom.legenda}"</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE RELATÓRIO INDIVIDUAL DE ESTOQUE */}
      {showRelatorioEstoque && (
        <ReportModal
          reportType="estoque"
          onClose={() => setShowRelatorioEstoque(false)}
        />
      )}

      {/* MODAL DE IMPRESSÃO DE TAGS / ETIQUETAS */}
      <TagPrintModal
        isOpen={showTagPrintModal}
        onClose={() => {
          setShowTagPrintModal(false);
          setSelectedPecaForTag(null);
        }}
        initialSelectedPecas={selectedPecaForTag ? [selectedPecaForTag] : undefined}
      />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE PEÇA */}
      {pecaParaExcluir && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif-luxury">
                  Excluir Peça do Estoque?
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Esta ação não pode ser desfeita. A peça será removida permanentemente do estoque e da vitrine.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs bg-stone-50/50">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Código:</span>
                  <span className="font-bold text-stone-900">{pecaParaExcluir.codigo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Descrição:</span>
                  <span className="font-medium text-stone-900 text-right max-w-[200px] truncate">{pecaParaExcluir.descricao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Categoria / Banho:</span>
                  <span className="text-stone-700">{pecaParaExcluir.tipo} • {pecaParaExcluir.modelo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Preço de Venda:</span>
                  <span className="font-bold text-amber-900">{formatCurrency(pecaParaExcluir.precoVenda)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Quantidade:</span>
                  <span className="font-semibold text-stone-800">{pecaParaExcluir.quantidade} un.</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPecaParaExcluir(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePeca(pecaParaExcluir.id);
                  if (editingPecaId === pecaParaExcluir.id) {
                    setShowModalCadastro(false);
                  }
                  setPecaParaExcluir(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Peça</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE GERENCIAMENTO / LIMPEZA DE EXEMPLOS */}
      {showModalLimparExemplos && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h3 className="font-serif-luxury font-bold text-base text-stone-100">
                  Gerenciar Exemplos do Estoque
                </h3>
              </div>
              <button
                onClick={() => setShowModalLimparExemplos(false)}
                className="text-stone-400 hover:text-stone-100 text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-stone-600 leading-relaxed">
                Você pode remover as peças de exemplo pré-cadastradas no sistema ou zerar completamente o catálogo para começar o seu controle do zero:
              </p>

              {/* Opção 1: Limpar apenas demonstrações */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Opção 1: Remover Peças de Exemplo
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Exclui somente os exemplos originais de demonstração do sistema (códigos BR-101, AN-301, CL-201, etc.), mantendo peças que você já cadastrou.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      limparExemplosEstoque();
                      setShowModalLimparExemplos(false);
                    }}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Excluir Apenas Peças de Demonstração</span>
                  </button>
                </div>
              </div>

              {/* Opção 2: Zerar todo o estoque */}
              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Opção 2: Zerar Todo o Catálogo (Começar do Zero)
                  </span>
                </div>
                <p className="text-[11px] text-rose-800/80">
                  Apaga todas as peças cadastradas atualmente, deixando seu estoque 100% limpo para cadastrar suas próprias joias do zero.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      limparTodasPecas();
                      setShowModalLimparExemplos(false);
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Zerar Todas as Peças do Estoque</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModalLimparExemplos(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
