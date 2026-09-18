import { Peca, Compra, Cliente, Venda, Consignacao, ConfiguracoesApp, TemplateMarketing, Usuario } from '../types';

export const INITIAL_CONFIG: ConfiguracoesApp = {
  diasPecaParadaAlerta: 30,
  nomeEmpresa: 'DK Semijóias',
  telefoneContato: '(11) 98765-4321',
  chavePix: 'pix@dksemijoias.com.br',
  tipoChavePix: 'email',
  mensagemPadraoWhatsApp: 'Olá! Dê uma olhada em nossas peças exclusivas banhadas a ouro 18k e prata 925 no catálogo digital da DK Semijóias:',
  linkCatalogoPublico: 'https://dksemijoias.vitrine.com.br/colecao-ouro',
  backupAutomaticoEmOperacoes: true,
  googleClientId: '465412689718-kp2jhvdtt81r1h8a8aracpqf4tvo1kaf.apps.googleusercontent.com',
  totalBackupsRealizadosHoje: 3,
  ultimoBackupOperacaoNome: 'Inicialização do Sistema',
  ultimoBackupOperacaoData: '2026-09-17 10:25'
};

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'user-1',
    nome: 'Danielle K.',
    email: 'danielle@dksemijoias.com.br',
    telefone: '(11) 98765-4321',
    perfil: 'admin',
    avatarCor: 'from-amber-500 to-amber-700',
    ativo: true,
    comissaoPercentual: 0,
    dataCriacao: '2026-01-10'
  },
  {
    id: 'user-2',
    nome: 'Karla Santos',
    email: 'karla.gerencia@dksemijoias.com.br',
    telefone: '(11) 99888-1122',
    perfil: 'gerente',
    avatarCor: 'from-stone-700 to-stone-950',
    ativo: true,
    comissaoPercentual: 5,
    dataCriacao: '2026-02-15'
  },
  {
    id: 'user-3',
    nome: 'Juliana Ribeiro',
    email: 'juliana.vendas@dksemijoias.com.br',
    telefone: '(11) 97777-3344',
    perfil: 'vendedor',
    avatarCor: 'from-amber-700 to-amber-900',
    ativo: true,
    comissaoPercentual: 10,
    dataCriacao: '2026-03-01'
  },
  {
    id: 'user-4',
    nome: 'Beatriz Lima',
    email: 'beatriz.revenda@gmail.com',
    telefone: '(11) 98333-4455',
    perfil: 'revendedor',
    avatarCor: 'from-emerald-600 to-emerald-800',
    ativo: true,
    comissaoPercentual: 20,
    dataCriacao: '2026-04-12'
  }
];

export const INITIAL_PECAS: Peca[] = [
  {
    id: 'peca-1',
    codigo: 'SEM-101',
    referencia: 'COL-OU-01',
    descricao: 'Colar Choker Fita Malha Banhado a Ouro 18k 40cm',
    tipo: 'Colar',
    modelo: 'Ouro 18k',
    notaFiscal: 'NF-8921',
    valorCompra: 42.00,
    margemTipo: 'percentual',
    margemValor: 150, // 150% de margem
    precoVenda: 105.00,
    quantidade: 4,
    dataEntrada: '2026-07-15', // mais de 30 dias -> Alerta de parada!
    status: 'disponivel',
    fornecedor: 'Joias & Cia Bragança',
    observacoes: 'Excelente acabamento em verniz antialérgico italiano.',
    fotos: [
      {
        id: 'f1',
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto',
        legenda: 'Foto oficial do produto'
      },
      {
        id: 'f2',
        url: 'https://images.unsplash.com/photo-1611591475816-c322b7a3a6df?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto',
        legenda: 'Detalhe do acabamento e fecho da corrente'
      }
    ]
  },
  {
    id: 'peca-2',
    codigo: 'SEM-102',
    referencia: 'BRI-GOTA-09',
    descricao: 'Brinco Argola Fecho Italiano com Zircônia Gota Safira',
    tipo: 'Brinco',
    modelo: 'Ródio Branco',
    notaFiscal: 'NF-8921',
    valorCompra: 35.00,
    margemTipo: 'fixo',
    margemValor: 60.00,
    precoVenda: 95.00,
    quantidade: 2,
    dataEntrada: '2026-09-02',
    status: 'disponivel',
    fornecedor: 'Joias & Cia Bragança',
    fotos: [
      {
        id: 'f3',
        url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto',
        legenda: 'Argola Gota em Ródio Branco'
      }
    ]
  },
  {
    id: 'peca-3',
    codigo: 'SEM-103',
    referencia: 'ANE-SOL-16',
    descricao: 'Anel Solitário Cravejado Micro Zircônias Banho Ouro 18k Tam 16',
    tipo: 'Anel',
    modelo: 'Ouro 18k',
    notaFiscal: 'NF-9014',
    valorCompra: 28.00,
    margemTipo: 'percentual',
    margemValor: 180,
    precoVenda: 78.40,
    quantidade: 3,
    dataEntrada: '2026-08-25',
    status: 'disponivel',
    fornecedor: 'Golden Line Limeira',
    fotos: [
      {
        id: 'f4',
        url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto',
        legenda: 'Anel Solitário aro 16'
      },
      {
        id: 'f5',
        url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto',
        legenda: 'Detalhe do solitário e cravação'
      }
    ]
  },
  {
    id: 'peca-4',
    codigo: 'SEM-104',
    referencia: 'PUL-RIV-04',
    descricao: 'Pulseira Riviera Flexível Zircônia Cristal 18cm Ouro 18k',
    tipo: 'Pulseira',
    modelo: 'Ouro 18k',
    notaFiscal: 'NF-7840',
    valorCompra: 65.00,
    margemTipo: 'percentual',
    margemValor: 130,
    precoVenda: 149.50,
    quantidade: 1,
    dataEntrada: '2026-06-10', // Mais de 90 dias -> Peça parada urgente!
    status: 'disponivel',
    fornecedor: 'Ateliê Ouro Nobre',
    fotos: [
      {
        id: 'f6',
        url: 'https://images.unsplash.com/photo-1611591475847-19ad0d52b904?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto',
        legenda: 'Riviera em Ouro 18k'
      }
    ]
  },
  {
    id: 'peca-5',
    codigo: 'SEM-105',
    referencia: 'CONJ-PER-02',
    descricao: 'Conjunto Pérola Barroca Natural Colar e Brinco Prata 925',
    tipo: 'Conjunto',
    modelo: 'Prata 925',
    notaFiscal: 'NF-9200',
    valorCompra: 85.00,
    margemTipo: 'percentual',
    margemValor: 120,
    precoVenda: 187.00,
    quantidade: 2,
    dataEntrada: '2026-09-08',
    status: 'disponivel',
    fornecedor: 'Pratas do Sul Import',
    fotos: [
      {
        id: 'f7',
        url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto',
        legenda: 'Conjunto Pérola'
      }
    ]
  },
  {
    id: 'peca-6',
    codigo: 'SEM-106',
    referencia: 'TOR-COR-01',
    descricao: 'Tornozeleira Elo Português com Pingentes de Coração Ouro 18k',
    tipo: 'Tornozeleira',
    modelo: 'Ouro 18k',
    notaFiscal: 'NF-9200',
    valorCompra: 22.00,
    margemTipo: 'fixo',
    margemValor: 45.00,
    precoVenda: 67.00,
    quantidade: 1,
    dataEntrada: '2026-07-20', // Parada
    status: 'consignada',
    fornecedor: 'Golden Line Limeira',
    fotos: [
      {
        id: 'f8',
        url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
        tipo: 'produto'
      }
    ]
  }
];

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    nome: 'Mariana Silveira',
    telefone: '(11) 99876-5432',
    email: 'mariana.silveira@email.com',
    cidade: 'São Paulo - SP',
    tipo: 'cliente',
    origem: 'whatsapp_import',
    dataCadastro: '2026-05-12',
    preferencias: 'Aro 17, ama brincos discretos e peças em ródio branco.',
    comentarios: [
      {
        id: 'c1',
        data: '2026-08-10',
        autor: 'Atendimento',
        texto: 'Comprou conjunto de pérolas para aniversário de casamento. Super satisfeita!'
      }
    ]
  },
  {
    id: 'cli-2',
    nome: 'Beatriz Vasconcelos',
    telefone: '(11) 98111-2233',
    email: 'bia.vasconcelos@email.com',
    cidade: 'Campinas - SP',
    tipo: 'revendedor',
    origem: 'indicacao',
    dataCadastro: '2026-06-20',
    limiteCredito: 2500,
    preferencias: 'Revendedora pontual na região de Cambuí. Pede 20% comissão.',
    comentarios: [
      {
        id: 'c2',
        data: '2026-08-28',
        autor: 'Gestão',
        texto: 'Excelente volume de venda de brincos em banho de ouro 18k.'
      }
    ]
  },
  {
    id: 'cli-3',
    nome: 'Camila Albuquerque',
    telefone: '(11) 97222-3344',
    email: 'camila.alb@email.com',
    cidade: 'São Caetano do Sul - SP',
    tipo: 'cliente',
    origem: 'redes_sociais',
    dataCadastro: '2026-07-02',
    preferencias: 'Adora chokers e correntaria grossa ouro 18k.',
    comentarios: [
      {
        id: 'c3',
        data: '2026-08-15',
        autor: 'Atendimento',
        texto: 'Tem uma parcela vencida referente a compra parcelada de agosto.'
      }
    ]
  },
  {
    id: 'cli-4',
    nome: 'Fernanda Rocha',
    telefone: '(11) 96333-8899',
    cidade: 'Jundiaí - SP',
    tipo: 'cliente',
    origem: 'whatsapp_import',
    dataCadastro: '2026-08-19',
    preferencias: 'Prefere pagar via Pix com desconto à vista.',
    comentarios: []
  }
];

export const INITIAL_COMPRAS: Compra[] = [
  {
    id: 'comp-1',
    dataCompra: '2026-08-20',
    fornecedor: 'Golden Line Limeira',
    notaFiscal: 'NF-9014',
    valorTotal: 1250.00,
    despesas: [
      { id: 'd1', tipo: 'combustivel', descricao: 'Viagem polo de Limeira SP', valor: 95.00 },
      { id: 'd2', tipo: 'cartao', descricao: 'Taxa maquininha parcelado compra', valor: 37.50 },
      { id: 'd3', tipo: 'frete', descricao: 'Seguro de transporte Sedex 10', valor: 45.00 }
    ],
    pecasCadastradasIds: ['peca-3', 'peca-6'],
    observacoes: 'Lote de anéis com excelente acabamento e garantia de 1 ano no banho.'
  },
  {
    id: 'comp-2',
    dataCompra: '2026-09-01',
    fornecedor: 'Joias & Cia Bragança',
    notaFiscal: 'NF-8921',
    valorTotal: 840.00,
    despesas: [
      { id: 'd4', tipo: 'comissao', descricao: 'Comissão de representação', valor: 50.00 }
    ],
    pecasCadastradasIds: ['peca-1', 'peca-2'],
    observacoes: 'Coleção Primavera Ouro 18k.'
  }
];

export const INITIAL_VENDAS: Venda[] = [
  {
    id: 'ven-1',
    clienteId: 'cli-1',
    clienteNome: 'Mariana Silveira',
    clienteTelefone: '(11) 99876-5432',
    dataVenda: '2026-09-05',
    itens: [
      {
        pecaId: 'peca-2',
        codigo: 'SEM-102',
        descricao: 'Brinco Argola Fecho Italiano com Zircônia Gota Safira',
        fotoUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
        quantidade: 1,
        valorUnitario: 95.00,
        subtotal: 95.00
      }
    ],
    valorSubtotal: 95.00,
    desconto: 5.00,
    valorTotal: 90.00,
    formaPagamento: 'pix',
    statusPagamento: 'pago',
    parcelas: [
      {
        id: 'parc-1',
        numeroParcela: 1,
        totalParcelas: 1,
        dataVencimento: '2026-09-05',
        valor: 90.00,
        pago: true,
        dataPagamento: '2026-09-05'
      }
    ],
    observacao: 'Cliente adorou o brilho e comprou para presentear a mãe.',
    reciboGeradoEm: '2026-09-05 14:32'
  },
  {
    id: 'ven-2',
    clienteId: 'cli-3',
    clienteNome: 'Camila Albuquerque',
    clienteTelefone: '(11) 97222-3344',
    dataVenda: '2026-08-10',
    itens: [
      {
        pecaId: 'peca-1',
        codigo: 'SEM-101',
        descricao: 'Colar Choker Fita Malha Banhado a Ouro 18k 40cm',
        fotoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        quantidade: 1,
        valorUnitario: 105.00,
        subtotal: 105.00
      },
      {
        pecaId: 'peca-3',
        codigo: 'SEM-103',
        descricao: 'Anel Solitário Cravejado Micro Zircônias Banho Ouro 18k Tam 16',
        fotoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
        quantidade: 1,
        valorUnitario: 78.40,
        subtotal: 78.40
      }
    ],
    valorSubtotal: 183.40,
    desconto: 3.40,
    valorTotal: 180.00,
    formaPagamento: 'parcelado',
    statusPagamento: 'atrasado',
    parcelas: [
      {
        id: 'parc-2a',
        numeroParcela: 1,
        totalParcelas: 2,
        dataVencimento: '2026-08-10',
        valor: 90.00,
        pago: true,
        dataPagamento: '2026-08-10'
      },
      {
        id: 'parc-2b',
        numeroParcela: 2,
        totalParcelas: 2,
        dataVencimento: '2026-09-10', // Vencida
        valor: 90.00,
        pago: false,
        observacao: 'Segunda parcela com atraso para cobrança WhatsApp'
      }
    ],
    observacao: 'Venda parcelada em 2x sem juros.'
  },
  {
    id: 'ven-3',
    clienteId: 'cli-1',
    clienteNome: 'Mariana Silveira',
    clienteTelefone: '(11) 99876-5432',
    dataVenda: '2026-08-17',
    itens: [
      {
        pecaId: 'peca-4',
        codigo: 'SEM-104',
        descricao: 'Pulseira Riviera Flexível Zircônia Cristal 18cm Ouro 18k',
        fotoUrl: 'https://images.unsplash.com/photo-1611591475847-19ad0d52b904?auto=format&fit=crop&w=600&q=80',
        quantidade: 1,
        valorUnitario: 149.50,
        subtotal: 149.50
      }
    ],
    valorSubtotal: 149.50,
    desconto: 9.50,
    valorTotal: 140.00,
    formaPagamento: 'parcelado',
    statusPagamento: 'pendente',
    parcelas: [
      {
        id: 'parc-3a',
        numeroParcela: 1,
        totalParcelas: 2,
        dataVencimento: '2026-08-17',
        valor: 70.00,
        pago: true,
        dataPagamento: '2026-08-17'
      },
      {
        id: 'parc-3b',
        numeroParcela: 2,
        totalParcelas: 2,
        dataVencimento: '2026-09-17', // Vence HOJE!
        valor: 70.00,
        pago: false,
        observacao: 'Parcela com vencimento no dia de hoje'
      }
    ],
    observacao: 'Venda parcelada em 2x.'
  },
  {
    id: 'ven-4',
    clienteId: 'cli-4',
    clienteNome: 'Fernanda Meireles',
    clienteTelefone: '(11) 98444-5566',
    dataVenda: '2026-08-19',
    itens: [
      {
        pecaId: 'peca-5',
        codigo: 'SEM-105',
        descricao: 'Brinco Ear Cuff Franja Zircônias Banho Ródio Branco',
        fotoUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
        quantidade: 1,
        valorUnitario: 120.00,
        subtotal: 120.00
      }
    ],
    valorSubtotal: 120.00,
    desconto: 0,
    valorTotal: 120.00,
    formaPagamento: 'parcelado',
    statusPagamento: 'pendente',
    parcelas: [
      {
        id: 'parc-4a',
        numeroParcela: 1,
        totalParcelas: 2,
        dataVencimento: '2026-08-19',
        valor: 60.00,
        pago: true,
        dataPagamento: '2026-08-19'
      },
      {
        id: 'parc-4b',
        numeroParcela: 2,
        totalParcelas: 2,
        dataVencimento: '2026-09-19', // Vence em 2 dias!
        valor: 60.00,
        pago: false,
        observacao: 'Vence em 2 dias - ideal para lembrete preventivo'
      }
    ],
    observacao: 'Compra a prazo com 2ª parcela a vencer.'
  }
];

export const INITIAL_CONSIGNACOES: Consignacao[] = [
  {
    id: 'cons-1',
    consignadorNome: 'Beatriz Vasconcelos',
    contato: '(11) 98111-2233',
    dataEntrega: '2026-08-28',
    dataPrevisaoAcerto: '2026-09-28',
    comissaoPercentual: 25,
    status: 'em_aberto',
    itens: [
      {
        pecaId: 'peca-6',
        codigo: 'SEM-106',
        descricao: 'Tornozeleira Elo Português com Pingentes de Coração Ouro 18k',
        fotoUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
        valorUnitario: 67.00,
        status: 'com_consignador'
      },
      {
        pecaId: 'peca-4',
        codigo: 'SEM-104',
        descricao: 'Pulseira Riviera Flexível Zircônia Cristal 18cm Ouro 18k',
        fotoUrl: 'https://images.unsplash.com/photo-1611591475847-19ad0d52b904?auto=format&fit=crop&w=600&q=80',
        valorUnitario: 149.50,
        status: 'com_consignador'
      }
    ],
    observacoes: 'Mostruário preto luxo entregue em mãos com 2 peças selecionadas.'
  }
];

export const INITIAL_TEMPLATES_MARKETING: TemplateMarketing[] = [
  {
    id: 'tpl-1',
    titulo: 'Promoção Relâmpago Ouro 18k',
    categoria: 'promocao',
    textoPadrao: '✨ OPORTUNIDADE EXCLUSIVA! ✨\nPeças selecionadas banhadas a Ouro 18k com acabamento em verniz antialérgico e garantia!\n\n🏷️ Aproveite condições especiais com pagamento via Pix ou até 3x sem juros no cartão!\n\n📲 Peça a sua antes que esgote:',
    hashtags: '#semijoias #ouro18k #semijoiasdeluxo #acessoriosfemininos #brilho',
    corFundo: '#fbf7ee',
    corTexto: '#78350f'
  },
  {
    id: 'tpl-2',
    titulo: 'Lançamento Coleção Brilho Eterno',
    categoria: 'lancamento',
    textoPadrao: '💎 NOVIDADE CHEGANDO NA DK SEMIJÓIAS! 💎\nUma curadoria impecável de colares, argolas e anéis solitários cravejados com microzircônias de brilho idêntico ao diamante.\n\nConfira os modelos no catálogo interativo:',
    hashtags: '#lancamento #dksemijoias #semijoiasfinas #colares #brincos #zirconias',
    corFundo: '#fafaf9',
    corTexto: '#1c1917'
  },
  {
    id: 'tpl-3',
    titulo: 'Bazar / Queima de Peças Selecionadas',
    categoria: 'pecas_paradas',
    textoPadrao: '🔥 BAZAR DE SEMIJOIAS COM ATÉ 30% OFF! 🔥\nÚltimas unidades em estoque pronta entrega da DK Semijóias. Peças com qualidade impecável e preços imperdíveis para renovar seu porta-joias!\n\nVeja as peças disponíveis:',
    hashtags: '#bazar #queimadeestoque #promocao #dksemijoias #tendencia',
    corFundo: '#fff1f2',
    corTexto: '#9f1239'
  },
  {
    id: 'tpl-4',
    titulo: 'Convite para Revendedoras',
    categoria: 'revendedora',
    textoPadrao: '💼 SEJA UMA REVENDEDORA DK SEMIJÓIAS! 💼\nTrabalhe com peças de altíssima saída, margem de lucro atrativa de até 100%, suporte de catálogo digital e mostruário consignado.\n\nEntre em contato conosco e comece a lucrar hoje mesmo!',
    hashtags: '#rendaextra #revendasemijoias #dksemijoias #consignado #empreendedorismofeminino',
    corFundo: '#ecfdf5',
    corTexto: '#065f46'
  }
];
