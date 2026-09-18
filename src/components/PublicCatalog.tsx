import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Peca, TipoPeca, ModeloBanho } from '../types';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Share2, 
  Send, 
  Check, 
  Eye, 
  Gem, 
  ShieldCheck, 
  Truck, 
  Award,
  ExternalLink,
  Copy
} from 'lucide-react';

interface PublicCatalogProps {
  isCustomerOnly?: boolean;
  onAdminReturn?: () => void;
}

export const PublicCatalog: React.FC<PublicCatalogProps> = ({ 
  isCustomerOnly = false,
  onAdminReturn 
}) => {
  const { pecas, config } = useApp();

  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [banhoFiltro, setBanhoFiltro] = useState<string>('todos');
  const [modoRevendedora, setModoRevendedora] = useState<boolean>(false);
  const [pecaDetalhe, setPecaDetalhe] = useState<Peca | null>(null);
  const [copiadoLink, setCopiadoLink] = useState(false);

  // Peças disponíveis para vitrine
  const pecasVitrine = pecas.filter(p => p.status === 'disponivel' && p.quantidade > 0);

  const pecasFiltradas = pecasVitrine.filter(p => {
    const matchBusca = 
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      p.modelo.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = tipoFiltro === 'todos' || p.tipo === tipoFiltro;
    const matchBanho = banhoFiltro === 'todos' || p.modelo === banhoFiltro;

    return matchBusca && matchTipo && matchBanho;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getPublicCatalogUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('modo', 'catalogo');
    url.hash = 'catalogo-publico';
    return url.toString();
  };

  const handlePedirWhatsApp = (peca: Peca) => {
    const limpo = config.telefoneContato.replace(/\D/g, '');
    const num = limpo.startsWith('55') ? limpo : `55${limpo}`;
    const texto = `Olá! Amei essa semijoia no catálogo da *${config.nomeEmpresa}*:\n\n` +
      `💎 *${peca.descricao}*\n` +
      `🏷️ Código: *${peca.codigo}* | Banho: ${peca.modelo}\n` +
      `💰 Valor: ${formatCurrency(peca.precoVenda)}\n\n` +
      `Ainda está disponível? Como posso fazer para encomendar? ✨`;

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(getPublicCatalogUrl());
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2500);
  };

  const handleCompartilharWhatsApp = () => {
    const msg = `✨ Olá! Acesse nosso Catálogo Exclusivo de Semijoias da *${config.nomeEmpresa}* e confira nossas peças com banho em ouro 18k e prata 925:\n\n${getPublicCatalogUrl()}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Se estiver no modo de gestão administrativa, exibir aviso e ferramentas de compartilhamento */}
      {!isCustomerOnly && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
              🔒 Link Seguro de Compartilhamento para Clientes
            </span>
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              Catálogo Limpo para Clientes (Sem Faturamento ou Estoque)
            </h3>
            <p className="text-xs text-stone-600 max-w-2xl">
              Ao enviar o link abaixo para seus clientes ou no WhatsApp, eles visualizam <strong>apenas as fotos, descrições e valores das semijoias disponíveis</strong>. Eles não têm acesso ao painel executivo, custos de compra ou relatórios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopiarLink}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              {copiadoLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiadoLink ? 'Link do Cliente Copiado!' : 'Copiar Link da Vitrine'}</span>
            </button>

            <button
              onClick={handleCompartilharWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar no WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Vitrine Digital Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-stone-100 p-5 sm:p-10 border border-stone-800 shadow-lg">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-[11px] font-bold tracking-widest text-amber-300 uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Catálogo Vitrine Digital
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-stone-100 tracking-wide leading-tight">
            Coleções Exclusivas & Semijoias Nobres
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Banho em Ouro 18k e Prata 925 com tripla camada de verniz hipoalergênico e cravação manual de zircônias.
          </p>

          {/* Botões de Ação na Vitrine */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopiarLink}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              {copiadoLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiadoLink ? 'Link Copiado!' : 'Copiar Link do Catálogo'}</span>
            </button>

            {/* Alternador de Modo Revendedora (Apenas se NÃO for cliente puro) */}
            {!isCustomerOnly && (
              <button
                onClick={() => setModoRevendedora(!modoRevendedora)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                  modoRevendedora
                    ? 'bg-purple-900/80 border-purple-500 text-purple-200'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <Award className="w-4 h-4 text-purple-400" />
                <span>{modoRevendedora ? 'Modo Revendedora Ativo (Custo/Margem)' : 'Ativar Visão Revendedora'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Selos de Garantia */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 grid grid-cols-3 gap-3 text-[11px] text-stone-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>1 Ano de Garantia no Banho</span>
          </div>
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Zircônias Qualidade 5A</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Envio Imediato ou Retirada</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros do Catálogo */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="O que você está procurando hoje? (ex: colar fita, brinco gota...)"
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Categoria */}
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 cursor-pointer"
          >
            <option value="todos">Todas as Peças</option>
            <option value="Colar">Colares & Chokers</option>
            <option value="Brinco">Brincos & Argolas</option>
            <option value="Pulseira">Pulseiras & Rivieras</option>
            <option value="Anel">Anéis & Solitários</option>
            <option value="Conjunto">Conjuntos Finos</option>
          </select>

          {/* Banho */}
          <select
            value={banhoFiltro}
            onChange={(e) => setBanhoFiltro(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 cursor-pointer"
          >
            <option value="todos">Todos os Banhos</option>
            <option value="Ouro 18k">Ouro 18k</option>
            <option value="Prata 925">Prata 925</option>
            <option value="Ródio Branco">Ródio Branco</option>
            <option value="Zircônia Cristal">Zircônias</option>
          </select>
        </div>

      </div>

      {/* Grid de Semijoias da Vitrine */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {pecasFiltradas.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
            <Gem className="w-10 h-10 text-amber-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">Nenhuma semijoia encontrada com esses filtros.</p>
            <p className="text-xs text-stone-400 mt-1">Limpe os filtros para visualizar todas as novidades.</p>
          </div>
        ) : (
          pecasFiltradas.map((peca) => {
            const foto = peca.fotos[0]?.url;

            return (
              <div
                key={peca.id}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-300 transition-all flex flex-col justify-between group"
              >
                {/* Imagem com Hover Zoom */}
                <div 
                  onClick={() => setPecaDetalhe(peca)}
                  className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer"
                >
                  <img
                    src={foto || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80'}
                    alt={peca.descricao}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  
                  {/* Badge de Banho */}
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-stone-950/75 backdrop-blur-xs text-amber-200 rounded-full text-[10px] font-semibold tracking-wide">
                    {peca.modelo}
                  </span>

                  {/* Tag Cód */}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-white/90 text-stone-800 rounded-md text-[10px] font-mono font-bold shadow-xs">
                    {peca.codigo}
                  </span>
                </div>

                {/* Info da Peça */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">
                      {peca.tipo}
                    </span>
                    <h3 
                      onClick={() => setPecaDetalhe(peca)}
                      className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2 mt-0.5 cursor-pointer hover:text-amber-800"
                    >
                      {peca.descricao}
                    </h3>
                  </div>

                  {/* Informações de Preço */}
                  <div className="pt-2 border-t border-stone-100">
                    {modoRevendedora && (
                      <div className="mb-1 text-[11px] text-purple-800 bg-purple-50 p-1.5 rounded-lg">
                        <div>Custo da peça: <strong>{formatCurrency(peca.valorCompra)}</strong></div>
                        <div>Comissão sugerida: <strong>{formatCurrency(peca.precoVenda - peca.valorCompra)}</strong></div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Preço à vista / parcelado:</span>
                        <span className="text-lg font-bold text-stone-950 font-serif-luxury">
                          {formatCurrency(peca.precoVenda)}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePedirWhatsApp(peca)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        title="Pedir no WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Pedir</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* MODAL DETALHE DA PEÇA NA VITRINE */}
      {pecaDetalhe && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
              <img
                src={pecaDetalhe.fotos[0]?.url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPecaDetalhe(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center font-bold text-sm transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between text-stone-500 text-[11px] mb-1">
                  <span>Código: <strong className="font-mono text-stone-800">{pecaDetalhe.codigo}</strong></span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold">{pecaDetalhe.modelo}</span>
                </div>
                <h2 className="text-base font-bold text-stone-900 font-serif-luxury leading-snug">
                  {pecaDetalhe.descricao}
                </h2>
                {pecaDetalhe.observacoes && (
                  <p className="text-stone-600 mt-2 leading-relaxed">{pecaDetalhe.observacoes}</p>
                )}
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-stone-500 block text-[10px]">Valor da Semijoia:</span>
                  <span className="text-2xl font-bold font-serif-luxury text-stone-900">
                    {formatCurrency(pecaDetalhe.precoVenda)}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Até 3x sem juros ou Pix com desconto
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handlePedirWhatsApp(pecaDetalhe);
                    setPecaDetalhe(null);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Comprar / Encomendar via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
