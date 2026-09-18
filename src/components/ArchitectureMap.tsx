import React from 'react';
import { 
  Network, 
  Database, 
  Layers, 
  Workflow, 
  Download, 
  CheckCircle2, 
  FileText,
  ShieldCheck,
  Table,
  ArrowRight
} from 'lucide-react';

export const ArchitectureMap: React.FC = () => {

  const handleDownloadDoc = () => {
    const docText = `# ARQUITETURA DE SISTEMA & BANCO DE DADOS - AURA SEMIJOIAS

## 1. ESQUEMA DO BANCO DE DADOS (MODELAGEM DE DADOS)

### Tabela: Pecas (Estoque de Semijoias)
- id (UUID / String - Primary Key)
- codigo (String - Ex: SEM-101, único)
- referencia (String - Código da fábrica/fornecedor)
- descricao (String - Ex: Colar Fita Banhado a Ouro 18k)
- tipo (Enum: Colar, Brinco, Pulseira, Anel, Conjunto, Tornozeleira, Pingente)
- modelo (Enum: Ouro 18k, Prata 925, Ródio Branco, Ródio Negro, Zircônia Cristal)
- notaFiscal (String - Número da NF de entrada)
- valorCompra (Float - Custo unitário de compra)
- margemLucro (Float - Margem aplicada)
- tipoMargem (Enum: porcentagem | valor_fixo)
- precoVenda (Float - Preço final de venda ao consumidor)
- despesasRateadas (Float - Taxas cartão, frete, embalagem)
- quantidade (Int - Saldo em estoque)
- dataEntrada (Date - Data de aquisição para cálculo de obsolescência)
- status (Enum: disponivel | vendido | consignado | reservado)
- fotos (Array<{ id, url, tipo: 'produto' | 'anotacao_caderno' }>)
- observacoes (Text - Medidas, aros, espessura, banho de milésimos)

### Tabela: ComprasEstoque (Entrada de Mercadoria)
- id (UUID - Primary Key)
- dataCompra (Date)
- fornecedor (String)
- numeroNotaFiscal (String)
- valorTotalCompra (Float)
- despesasFrete (Float)
- despesasTaxasCartao (Float)
- despesasComissoes (Float)
- pecasIds (Array<String>)
- fotoNotaFiscal (String / URL)

### Tabela: Vendas (Frente de Caixa / PDV)
- id (UUID - Primary Key)
- dataVenda (Date)
- clienteId (UUID / String - Foreign Key)
- clienteNome (String)
- clienteTelefone (String)
- valorSubtotal (Float)
- desconto (Float)
- valorTotal (Float)
- formaPagamento (Enum: pix, cartao_credito, cartao_debito, boleto, dinheiro, parcelado, apenas_registro)
- statusPagamento (Enum: pago, pendente, parcial, cancelado)
- itens (Array<{ pecaId, codigo, descricao, quantidade, valorUnitario, subtotal }>)
- parcelas (Array<{ id, numero, dataVencimento, valor, pago, dataPagamento }>)
- reciboGeradoEm (Timestamp)
- observacao (Text)

### Tabela: Consignacoes (Mostruários e Revendedoras)
- id (UUID - Primary Key)
- consignadorNome (String)
- contato (String)
- dataEntrega (Date)
- dataPrevisaoAcerto (Date)
- comissaoPercentual (Float - Ex: 25% ou 30%)
- status (Enum: em_aberto, parcialmente_acertada, finalizada)
- itens (Array<{ pecaId, codigo, descricao, valorUnitario, status: 'com_consignador' | 'vendido' | 'devolvido' }>)

### Tabela: Clientes (Contatos & Histórico)
- id (UUID - Primary Key)
- nome (String)
- telefone (String)
- email (String)
- cidade (String)
- tipo (Enum: cliente | revendedor)
- origem (Enum: manual | whatsapp_import | consignacao)
- preferencias (Text - Aro de anel, banhos preferidos, estilo)
- comentarios (Array<{ id, data, autor, texto }>)

---

## 2. MAPEAMENTO DE TELAS E COMPONENTES

1. Dashboard (Visão Executiva)
   - KPIs: Faturamento, Lucro Líquido, Estoque Ativo, Alerta de Peças Paradas (+60 dias).
   - Ações rápidas de venda, importação e cadastro.

2. Gestão de Estoque & Compras
   - Cadastro detalhado com foto da peça e foto de anotações em caderno.
   - Rateio de despesas (cartão, frete, comissões).
   - Importador em massa: Excel (.xlsx, .csv) e extrator inteligente de texto (PDF e tabelas).

3. Vendas & PDV (Frente de Caixa)
   - Seleção visual de peças com busca rápida e modo câmera/fotografia.
   - Múltiplas formas de pagamento (Pix, Crédito, Parcelado em Carnê, Boleto, Dinheiro).
   - Emissão de Recibo Digital com envio em 1 clique para o WhatsApp do cliente.

4. Controle de Consignação
   - Gestão de mostruários entregues a revendedoras com cálculo de comissão.
   - Acerto de contas: marcação de peças vendidas e retorno ao estoque das peças devolvidas.

5. Gestão de Clientes & WhatsApp
   - Ficha do cliente com aros, gostos e histórico de feedbacks.
   - Importador rápido de contatos do WhatsApp.
   - Disparo do link da vitrine online.

6. Vitrine Pública (Catálogo)
   - Catálogo online com fotos em alta definição e filtros por banho e categoria.
   - Alternador para Visão da Revendedora (margens e comissões sugeridas).
   - Botão direto de pedido via WhatsApp com mensagem formatada.

7. Cobranças & Inadimplência
   - Acompanhamento de carnês e parcelas vencidas.
   - Disparo de cobrança amigável via WhatsApp com chave Pix.

8. Marketing & Redes Sociais
   - Criação de posts e stories para Queima de Estoque, Lançamento e Peça do Dia.
   - Moldura de luxo pronta e exportação com hashtags.

9. Relatórios Financeiros
   - Faturamento por meio de pagamento, margens e giro de estoque.
   - Exportação completa em Excel (.xlsx).
`;

    const blob = new Blob([docText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'arquitetura_documentacao_semijoias.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Documentação Técnica & Negócio
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
            Arquitetura de Telas & Banco de Dados
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Mapeamento dos fluxos do negócio de semijoias, relacionamentos entre entidades e especificações do sistema.
          </p>
        </div>

        <button
          onClick={handleDownloadDoc}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          Baixar Documentação Completa (.MD)
        </button>
      </div>

      {/* Fluxo Operacional do Negócio */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Workflow className="w-5 h-5 text-amber-600" />
          <h3 className="font-serif-luxury font-bold text-base text-stone-900">
            Fluxo Operacional Integrado de Semijoias
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">1</span>
            <h4 className="font-bold text-stone-900">Entrada & Precificação</h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Compra com NF, anotação manual ou fotos de cadernos. Aplicação de margem (% ou fixo) + despesas (taxas, frete).
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">2</span>
            <h4 className="font-bold text-stone-900">Catálogo & Vitrine</h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Fotos dos produtos com zoom, filtros de banho e categorias. Link compartilhável e visão especial para revendedoras.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">3</span>
            <h4 className="font-bold text-stone-900">Venda Direta ou Consignação</h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Venda balcão no PDV (por foto ou código) OU entrega de mostruário consignado com cálculo de comissão da parceira.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">4</span>
            <h4 className="font-bold text-stone-900">Pagamento & Recibo</h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Pix, Cartão, Boleto ou Parcelado em carnê. Emissão imediata de comprovante de compra formatado para WhatsApp.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">5</span>
            <h4 className="font-bold text-stone-900">Cobrança & Marketing</h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Cobrança em 1 clique de parcelas vencidas e campanhas automáticas de Queima de Peças Paradas (+60 dias).
            </p>
          </div>

        </div>
      </div>

      {/* Mapeamento de Tabelas / Estrutura do Banco de Dados */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Database className="w-5 h-5 text-amber-600" />
          <h3 className="font-serif-luxury font-bold text-base text-stone-900">
            Estrutura de Tabelas & Relacionamentos
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="font-mono text-amber-800">Tabela: Pecas</span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 rounded">Entidade Central</span>
            </div>
            <p className="text-stone-500 text-[11px]">Controla cada item individualmente ou em lote com fotos e custos.</p>
            <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4">
              <li><strong>codigo:</strong> Código único de etiqueta (ex: SEM-101)</li>
              <li><strong>notaFiscal:</strong> Número da NF de entrada</li>
              <li><strong>fotos:</strong> Fotos da joia e fotos de cadernos de anotações</li>
              <li><strong>tipo & modelo:</strong> Colar/Brinco e Ouro 18k/Prata</li>
              <li><strong>valorCompra, margem, precoVenda</strong></li>
              <li><strong>dataEntrada:</strong> Base do alerta de peças paradas</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="font-mono text-emerald-800">Tabela: Vendas</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded">Faturamento</span>
            </div>
            <p className="text-stone-500 text-[11px]">Registros de saída com vínculo a clientes e parcelamento.</p>
            <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4">
              <li><strong>clienteId:</strong> Vínculo com cliente cadastrado</li>
              <li><strong>itens:</strong> Array de itens vendidos com fotos e valores</li>
              <li><strong>formaPagamento:</strong> Pix, Cartão, Boleto, Parcelado</li>
              <li><strong>parcelas:</strong> Cronograma de vencimentos e baixa</li>
              <li><strong>reciboGeradoEm:</strong> Data/hora do comprovante</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="font-mono text-purple-800">Tabela: Consignacoes</span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-900 rounded">Parcerias</span>
            </div>
            <p className="text-stone-500 text-[11px]">Rastreia peças entregues em mostruários para revendedoras.</p>
            <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4">
              <li><strong>consignadorNome & contato:</strong> Dados da revendedora</li>
              <li><strong>comissaoPercentual:</strong> Percentual de comissão</li>
              <li><strong>itens:</strong> Status por peça (com ela, vendida, devolvida)</li>
              <li><strong>dataPrevisaoAcerto:</strong> Limite para prestação de contas</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="font-mono text-blue-800">Tabela: Clientes</span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-900 rounded">CRM</span>
            </div>
            <p className="text-stone-500 text-[11px]">Contatos, preferências de aros e importação de WhatsApp.</p>
            <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4">
              <li><strong>nome & telefone:</strong> Contato WhatsApp prioritário</li>
              <li><strong>tipo:</strong> Cliente final ou revendedora parceira</li>
              <li><strong>preferencias:</strong> Aro de anel, banhos e gostos</li>
              <li><strong>comentarios:</strong> Histórico de feedbacks e notas</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="font-mono text-amber-800">Tabela: Compras</span>
              <span className="text-[10px] px-2 py-0.5 bg-stone-200 text-stone-800 rounded">Custos</span>
            </div>
            <p className="text-stone-500 text-[11px]">Lotes de aquisição com rateio de despesas operacionais.</p>
            <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4">
              <li><strong>fornecedor & data:</strong> Origem do atacado</li>
              <li><strong>despesasFrete & taxas:</strong> Custos adicionais de compra</li>
              <li><strong>despesasComissoes:</strong> Taxas agregadas</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="font-mono text-rose-800">Tabela: Configuracoes</span>
              <span className="text-[10px] px-2 py-0.5 bg-stone-200 text-stone-800 rounded">Geral</span>
            </div>
            <p className="text-stone-500 text-[11px]">Regras de negócio ajustáveis pelo gestor.</p>
            <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4">
              <li><strong>diasPecaParadaAlerta:</strong> Padrão 60 dias (ajustável)</li>
              <li><strong>margemPadrao:</strong> Margem padrão em compras novas</li>
              <li><strong>chavePix:</strong> Chave da loja para recebimentos</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
