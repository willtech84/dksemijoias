import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Peca, TemplateMarketing, PlataformaMarketing } from '../types';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Upload, 
  Instagram, 
  Share2, 
  Tag, 
  Flame, 
  Gem, 
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Save,
  X,
  MessageCircle,
  Facebook,
  Music2,
  Heart,
  Bookmark,
  MessageSquare,
  ExternalLink,
  Phone
} from 'lucide-react';
import { DKLogo } from './DKLogo';

const PLATAFORMAS: { id: PlataformaMarketing; nome: string; icon: any; cor: string; badge: string }[] = [
  { 
    id: 'instagram', 
    nome: 'Instagram', 
    icon: Instagram, 
    cor: 'from-pink-500 via-purple-500 to-amber-500 text-white', 
    badge: 'Feed, Stories & Reels' 
  },
  { 
    id: 'facebook', 
    nome: 'Facebook', 
    icon: Facebook, 
    cor: 'bg-blue-600 text-white', 
    badge: 'Feed & Grupos' 
  },
  { 
    id: 'whatsapp', 
    nome: 'WhatsApp', 
    icon: MessageCircle, 
    cor: 'bg-emerald-600 text-white', 
    badge: 'Status & Listas VIP' 
  },
  { 
    id: 'tiktok', 
    nome: 'TikTok', 
    icon: Music2, 
    cor: 'bg-stone-900 text-cyan-400 border border-pink-500/50', 
    badge: 'Vídeos & Roteiro Viral' 
  },
];

export const MarketingPromos: React.FC = () => {
  const { 
    pecas, 
    templatesMarketing, 
    addTemplateMarketing,
    updateTemplateMarketing,
    deleteTemplateMarketing,
    resetMarketingTemplates,
    config, 
    pecasParadas 
  } = useApp();

  const [plataformaAtiva, setPlataformaAtiva] = useState<PlataformaMarketing>('whatsapp');
  const [templateSelecionado, setTemplateSelecionado] = useState<TemplateMarketing>(
    templatesMarketing[0] || {
      id: 'default',
      titulo: 'Promoção Geral',
      objetivo: 'queima_estoque',
      canal: 'whatsapp',
      textoPadrao: 'Novidades em semijoias finas com acabamento impecável!',
      hashtags: '#dksemijoias #semijoias'
    }
  );
  const [pecaDestaqueId, setPecaDestaqueId] = useState<string>(pecas[0]?.id || '');
  const [imagemCustom, setImagemCustom] = useState<string>('');
  const [textoPersonalizado, setTextoPersonalizado] = useState<string>(templateSelecionado.textoPadrao);
  const [precoPromocional, setPrecoPromocional] = useState<number>(0);
  const [copiado, setCopiado] = useState(false);
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Modal para criar/editar template
  const [showModalTemplate, setShowModalTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [formTitulo, setFormTitulo] = useState('');
  const [formObjetivo, setFormObjetivo] = useState<TemplateMarketing['objetivo']>('queima_estoque');
  const [formCanal, setFormCanal] = useState<PlataformaMarketing>('whatsapp');
  const [formTextoPadrao, setFormTextoPadrao] = useState('');
  const [formHashtags, setFormHashtags] = useState('');

  // Modal para confirmação de exclusão
  const [templateParaExcluir, setTemplateParaExcluir] = useState<TemplateMarketing | null>(null);

  const pecaSelecionada = pecas.find(p => p.id === pecaDestaqueId);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSelectTemplate = (tpl: TemplateMarketing) => {
    setTemplateSelecionado(tpl);
    setTextoPersonalizado(tpl.textoPadrao);
    if (tpl.canal === 'instagram_stories' || tpl.canal === 'instagram') {
      setPlataformaAtiva('instagram');
    } else if (tpl.canal === 'facebook') {
      setPlataformaAtiva('facebook');
    } else if (tpl.canal === 'tiktok') {
      setPlataformaAtiva('tiktok');
    } else {
      setPlataformaAtiva('whatsapp');
    }
  };

  const handleOpenCriarTemplate = () => {
    setIsEditingTemplate(false);
    setFormTitulo('');
    setFormObjetivo('queima_estoque');
    setFormCanal(plataformaAtiva);
    setFormTextoPadrao('');
    setFormHashtags('#dksemijoias #semijoiasdeluxo #acessoriosfemininos');
    setShowModalTemplate(true);
  };

  const handleOpenEditarTemplate = (tpl: TemplateMarketing, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTemplate(true);
    setFormTitulo(tpl.titulo);
    setFormObjetivo(tpl.objetivo);
    const canalNorm: PlataformaMarketing = 
      tpl.canal === 'instagram_stories' ? 'instagram' :
      (tpl.canal as PlataformaMarketing) || 'whatsapp';
    setFormCanal(canalNorm);
    setFormTextoPadrao(tpl.textoPadrao);
    setFormHashtags(tpl.hashtags);
    setShowModalTemplate(true);
  };

  const handleSalvarTemplateModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formTextoPadrao.trim()) return;

    if (isEditingTemplate) {
      updateTemplateMarketing(templateSelecionado.id, {
        titulo: formTitulo.trim(),
        objetivo: formObjetivo,
        canal: formCanal,
        textoPadrao: formTextoPadrao.trim(),
        hashtags: formHashtags.trim()
      });
      setTemplateSelecionado(prev => ({
        ...prev,
        titulo: formTitulo.trim(),
        objetivo: formObjetivo,
        canal: formCanal,
        textoPadrao: formTextoPadrao.trim(),
        hashtags: formHashtags.trim()
      }));
      setTextoPersonalizado(formTextoPadrao.trim());
      setPlataformaAtiva(formCanal);
    } else {
      const novo = addTemplateMarketing({
        titulo: formTitulo.trim(),
        objetivo: formObjetivo,
        canal: formCanal,
        textoPadrao: formTextoPadrao.trim(),
        hashtags: formHashtags.trim()
      });
      setTemplateSelecionado(novo);
      setTextoPersonalizado(novo.textoPadrao);
      setPlataformaAtiva(formCanal);
    }

    setShowModalTemplate(false);
  };

  const handleSalvarAlteracoesAtuais = () => {
    updateTemplateMarketing(templateSelecionado.id, {
      textoPadrao: textoPersonalizado
    });
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2500);
  };

  const handleConfirmarExclusaoTemplate = () => {
    if (!templateParaExcluir) return;
    deleteTemplateMarketing(templateParaExcluir.id);
    
    const restantes = templatesMarketing.filter(t => t.id !== templateParaExcluir.id);
    if (restantes.length > 0) {
      setTemplateSelecionado(restantes[0]);
      setTextoPersonalizado(restantes[0].textoPadrao);
    }
    setTemplateParaExcluir(null);
  };

  const handleUploadImagemPost = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImagemCustom(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Montar texto ajustado conforme o padrão de cada plataforma solicitada
  const getTextoCompleto = () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}?modo=catalogo#catalogo-publico`;
    const telLimpo = config.telefoneContato.replace(/\D/g, '');
    const waLink = `https://wa.me/${telLimpo.startsWith('55') ? telLimpo : `55${telLimpo}`}`;

    // 1. INSTAGRAM (Estilo legenda rica com quebras, CTA de Direct/Comentário e hashtags)
    if (plataformaAtiva === 'instagram') {
      let msg = `${textoPersonalizado}\n\n`;
      if (pecaSelecionada) {
        msg += `✨ Detalhes da Peça:\n`;
        msg += `💎 ${pecaSelecionada.descricao}\n`;
        if (pecaSelecionada.modelo && pecaSelecionada.modelo !== 'Nenhum') {
          msg += `⚜️ Acabamento: ${pecaSelecionada.modelo}\n`;
        }
        msg += `🏷️ Ref: ${pecaSelecionada.codigo}\n`;
        if (precoPromocional > 0) {
          msg += `🔥 De R$ ${pecaSelecionada.precoVenda.toFixed(2).replace('.', ',')} por apenas R$ ${precoPromocional.toFixed(2).replace('.', ',')}!\n\n`;
        } else {
          msg += `💰 Valor: R$ ${pecaSelecionada.precoVenda.toFixed(2).replace('.', ',')}\n\n`;
        }
      }
      msg += `🛍️ Como garantir a sua?\n`;
      msg += `👉 Comente "EU QUERO" ou envie uma mensagem no Direct para reservar!\n`;
      msg += `📲 Ou acesse o link oficial na nossa bio.\n\n`;
      msg += `•\n•\n•\n`;
      msg += templateSelecionado.hashtags || '#dksemijoias #semijoiasdeluxo #lookdodia #acessoriosfemininos #ouro18k #moda';
      return msg;
    }

    // 2. FACEBOOK (Estilo feed social, link clicável no post e convite para marcar amigas)
    if (plataformaAtiva === 'facebook') {
      let msg = `${textoPersonalizado}\n\n`;
      if (pecaSelecionada) {
        msg += `💎 Destaque do Dia: ${pecaSelecionada.descricao}\n`;
        if (pecaSelecionada.modelo && pecaSelecionada.modelo !== 'Nenhum') {
          msg += `✨ Banho & Acabamento: ${pecaSelecionada.modelo}\n`;
        }
        msg += `🏷️ Código: ${pecaSelecionada.codigo}\n`;
        if (precoPromocional > 0) {
          msg += `🔥 Preço Especial: De ${formatCurrency(pecaSelecionada.precoVenda)} por apenas ${formatCurrency(precoPromocional)}!\n\n`;
        } else {
          msg += `💰 Preço: ${formatCurrency(pecaSelecionada.precoVenda)}\n\n`;
        }
      }
      msg += `🛒 Confira nosso catálogo vitrine completo e faça seu pedido online:\n${publicUrl}\n\n`;
      msg += `💬 Prefere atendimento imediato? Fale conosco no WhatsApp:\n${waLink}\n\n`;
      msg += `Marque aqui embaixo quem merece ganhar essa peça linda! 👇✨`;
      return msg;
    }

    // 3. TIKTOK (Roteiro em vídeo com gancho curto, legenda rápida e tags virais)
    if (plataformaAtiva === 'tiktok') {
      let msg = `🎬 [ROTEIRO & GANCHO DO VÍDEO]:\n`;
      msg += `"Olha a perfeição do acabamento dessa peça da DK Semijoias... O brilho que faltava para o seu look!"\n\n`;
      msg += `📝 [LEGENDA PARA O TIKTOK]:\n`;
      msg += `${textoPersonalizado}\n\n`;
      if (pecaSelecionada) {
        msg += `Ref: ${pecaSelecionada.codigo} • ${pecaSelecionada.descricao} ✨\n`;
        if (precoPromocional > 0) {
          msg += `Promoção limitada: ${formatCurrency(precoPromocional)} 🔥\n`;
        }
      }
      msg += `\nQual nota você dá para essa peça de 0 a 10? Deixe nos comentários! 👇\n`;
      msg += `🔗 Garanta a sua no link do nosso perfil!\n\n`;
      msg += `#semijoias #tiktokfashion #lookdodia #acessorios #trend #viral #fyp #dksemijoias #joiasfinas`;
      return msg;
    }

    // 4. WHATSAPP (Negritos nativos *texto*, tachado ~de~, bullet points e link direto)
    let msg = `${textoPersonalizado}\n\n`;
    if (pecaSelecionada) {
      msg += `💎 *Peça em Destaque:* ${pecaSelecionada.descricao}`;
      if (pecaSelecionada.modelo && pecaSelecionada.modelo !== 'Nenhum') {
        msg += ` (${pecaSelecionada.modelo})`;
      }
      msg += `\n🏷️ Código: *${pecaSelecionada.codigo}*`;
      if (precoPromocional > 0) {
        msg += `\n🔥 De: ~${formatCurrency(pecaSelecionada.precoVenda)}~ por *Apenas ${formatCurrency(precoPromocional)}*!`;
      } else {
        msg += `\n💰 Valor: *${formatCurrency(pecaSelecionada.precoVenda)}*`;
      }
    }
    msg += `\n\n🛍️ *Veja o catálogo completo da ${config.nomeEmpresa}:*\n${publicUrl}`;
    msg += `\n\n📲 *Dúvidas ou Pedidos no WhatsApp:* ${config.telefoneContato}`;
    if (templateSelecionado.hashtags) {
      msg += `\n\n${templateSelecionado.hashtags}`;
    }
    return msg;
  };

  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(getTextoCompleto());
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleCompartilharWhatsApp = () => {
    const msg = encodeURIComponent(getTextoCompleto());
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleAbrirRedeSocial = () => {
    if (plataformaAtiva === 'instagram') {
      window.open('https://instagram.com', '_blank');
    } else if (plataformaAtiva === 'facebook') {
      window.open('https://facebook.com', '_blank');
    } else if (plataformaAtiva === 'tiktok') {
      window.open('https://tiktok.com', '_blank');
    } else {
      handleCompartilharWhatsApp();
    }
  };

  const imagemExibicao = imagemCustom || pecaSelecionada?.fotos[0]?.url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Divulgação & Redes Sociais
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
            Marketing & Campanhas Promocionais
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Campanhas calibradas para o padrão de cada plataforma: Instagram, Facebook, WhatsApp e TikTok.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCriarTemplate}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Modelo</span>
          </button>

          <button
            onClick={resetMarketingTemplates}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Restaurar campanhas de exemplo padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
        </div>
      </div>

      {/* SELETOR DE PLATAFORMA (Instagram, Facebook, WhatsApp, TikTok) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Escolha a Plataforma da Campanha
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            Ajusta automaticamente texto, hashtags, chamada para ação e layout
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PLATAFORMAS.map(plat => {
            const Icon = plat.icon;
            const isSelected = plataformaAtiva === plat.id;
            return (
              <button
                key={plat.id}
                onClick={() => setPlataformaAtiva(plat.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-2 ring-amber-500/40'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  plat.id === 'instagram' ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white' :
                  plat.id === 'facebook' ? 'bg-blue-600 text-white' :
                  plat.id === 'whatsapp' ? 'bg-emerald-600 text-white' :
                  'bg-stone-950 text-cyan-400 border border-pink-500/50'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className={`block font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                    {plat.nome}
                  </span>
                  <span className={`text-[10px] block truncate ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {plat.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Editor (Esquerda) vs Prévia Visual da Plataforma (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna do Editor (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Escolha do Template */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                1. Selecione o Tema da Campanha
              </label>
              <span className="text-[11px] text-stone-400">
                {templatesMarketing.length} modelos disponíveis
              </span>
            </div>

            {templatesMarketing.length === 0 ? (
              <div className="p-4 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center">
                <p className="text-xs text-stone-500">Nenhum modelo cadastrado.</p>
                <button
                  onClick={resetMarketingTemplates}
                  className="mt-2 text-xs text-amber-700 font-bold hover:underline"
                >
                  Restaurar campanhas padrão
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {templatesMarketing.map(tpl => {
                  const isSelected = templateSelecionado?.id === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between cursor-pointer group ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 font-semibold text-amber-950 shadow-2xs'
                          : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0 pr-1">
                        <Sparkles className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                        <div className="truncate">
                          <span className="block truncate font-bold">{tpl.titulo}</span>
                          <span className="text-[10px] text-stone-400 capitalize block">Origem: {tpl.canal}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => handleOpenEditarTemplate(tpl, e)}
                          className="p-1 text-stone-400 hover:text-amber-700 hover:bg-amber-100/60 rounded"
                          title="Editar título e texto padrão"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateParaExcluir(tpl);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-100/60 rounded"
                          title="Excluir este modelo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seleção da Peça ou Imagem Custom */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3 text-xs">
            <label className="font-bold uppercase tracking-wider text-stone-700 block">
              2. Escolher Semijoia ou Foto
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-stone-600 block mb-1">Selecionar do Estoque:</span>
                <select
                  value={pecaDestaqueId}
                  onChange={(e) => {
                    setPecaDestaqueId(e.target.value);
                    setImagemCustom('');
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  {pecas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.descricao} ({formatCurrency(p.precoVenda)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-stone-600 block mb-1">Ou carregar foto própria:</span>
                <label className="w-full px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-medium flex items-center justify-center gap-1.5 cursor-pointer border border-stone-300 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>Subir Foto Personalizada</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImagemPost}
                  />
                </label>
              </div>
            </div>

            {/* Preço promocional opcional */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-stone-700 font-semibold">Preço Promocional (Opcional R$):</span>
              <input
                type="number"
                step="0.5"
                placeholder="Ex: 79.90"
                value={precoPromocional || ''}
                onChange={(e) => setPrecoPromocional(parseFloat(e.target.value) || 0)}
                className="w-32 px-2.5 py-1 bg-stone-50 border border-stone-300 rounded-lg font-bold text-amber-900"
              />
            </div>
          </div>

          {/* Editor de Texto & Gatilhos */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="font-bold uppercase tracking-wider text-stone-700">
                  3. Mensagem da Campanha ({PLATAFORMAS.find(p => p.id === plataformaAtiva)?.nome})
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold uppercase">
                  {plataformaAtiva}
                </span>
              </div>

              <button
                onClick={handleSalvarAlteracoesAtuais}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Salvar este texto como padrão deste modelo"
              >
                {salvoFeedback ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
                <span>{salvoFeedback ? 'Salvo no Modelo!' : 'Salvar no Modelo'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={textoPersonalizado}
              onChange={(e) => setTextoPersonalizado(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl font-sans text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
            />

            {/* Ações de Compartilhamento adaptadas à plataforma */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={handleCopiarTexto}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiado ? 'Texto Copiado!' : `Copiar Legenda p/ ${PLATAFORMAS.find(p => p.id === plataformaAtiva)?.nome}`}</span>
              </button>

              {plataformaAtiva === 'whatsapp' ? (
                <button
                  onClick={handleCompartilharWhatsApp}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Disparar no WhatsApp</span>
                </button>
              ) : (
                <button
                  onClick={handleAbrirRedeSocial}
                  className={`px-4 py-2.5 font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all ${
                    plataformaAtiva === 'instagram' ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white' :
                    plataformaAtiva === 'facebook' ? 'bg-blue-600 hover:bg-blue-500 text-white' :
                    'bg-stone-950 text-cyan-400 border border-pink-500 hover:bg-stone-900'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir {PLATAFORMAS.find(p => p.id === plataformaAtiva)?.nome}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Coluna da Prévia Visual adaptada ao padrão de cada plataforma (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Pré-visualização • {PLATAFORMAS.find(p => p.id === plataformaAtiva)?.nome}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                plataformaAtiva === 'instagram' ? 'bg-pink-100 text-pink-800' :
                plataformaAtiva === 'facebook' ? 'bg-blue-100 text-blue-800' :
                plataformaAtiva === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' :
                'bg-stone-900 text-cyan-400 border border-pink-500/40'
              }`}>
                Padrão da Plataforma
              </span>
            </div>

            {/* MOCKUP 1: INSTAGRAM */}
            {plataformaAtiva === 'instagram' && (
              <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-white text-stone-900 text-xs">
                {/* Header do Perfil Instagram */}
                <div className="p-3 flex items-center justify-between border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-[10px] font-serif-luxury text-amber-300 font-bold">
                        DK
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-900 block leading-tight">dksemijoias</span>
                      <span className="text-[9px] text-stone-400 block leading-tight">Original • Coleção Luxo</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">•••</span>
                </div>

                {/* Foto */}
                <div className="relative aspect-square bg-stone-900 overflow-hidden">
                  <img src={imagemExibicao} alt="Instagram Post" className="w-full h-full object-cover" />
                  {precoPromocional > 0 && (
                    <div className="absolute top-3 right-3 bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md">
                      Oferta: {formatCurrency(precoPromocional)}
                    </div>
                  )}
                </div>

                {/* Ações do Instagram */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-stone-800">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <MessageSquare className="w-4 h-4" />
                      <Share2 className="w-4 h-4" />
                    </div>
                    <Bookmark className="w-4 h-4" />
                  </div>

                  <div className="text-[11px] font-bold text-stone-900">
                    342 curtidas
                  </div>

                  <div className="text-[11px] text-stone-700 leading-snug space-y-1">
                    <p>
                      <span className="font-bold text-stone-900 mr-1.5">dksemijoias</span>
                      {textoPersonalizado}
                    </p>
                    {pecaSelecionada && (
                      <p className="text-[10px] text-stone-600">
                        💎 {pecaSelecionada.descricao} • Ref: {pecaSelecionada.codigo} •{' '}
                        {precoPromocional > 0 ? (
                          <strong className="text-rose-700">Apenas {formatCurrency(precoPromocional)}</strong>
                        ) : (
                          <strong>{formatCurrency(pecaSelecionada.precoVenda)}</strong>
                        )}
                      </p>
                    )}
                    <p className="text-[10px] text-stone-500 pt-1">
                      👉 Envie mensagem no Direct para reservar a sua!
                    </p>
                    <p className="text-[9px] text-blue-800 font-medium truncate pt-1">
                      {templateSelecionado.hashtags || '#dksemijoias #semijoiasdeluxo #lookdodia'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MOCKUP 2: FACEBOOK */}
            {plataformaAtiva === 'facebook' && (
              <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-white text-stone-900 text-xs">
                {/* Header Facebook */}
                <div className="p-3.5 flex items-center justify-between border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-serif-luxury font-bold text-xs shadow-2xs">
                      DK
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-900">DK Semijoias</span>
                        <span className="text-[9px] text-blue-600 font-semibold">✓</span>
                      </div>
                      <span className="text-[9px] text-stone-400 block">Publicado agora • 🌐</span>
                    </div>
                  </div>
                </div>

                {/* Texto do Post */}
                <div className="px-3.5 py-2.5 text-xs text-stone-800 leading-relaxed">
                  <p>{textoPersonalizado}</p>
                  {pecaSelecionada && (
                    <div className="mt-2 p-2 bg-stone-50 rounded-lg border border-stone-200 text-[11px]">
                      💎 <strong>{pecaSelecionada.descricao}</strong> {pecaSelecionada.modelo !== 'Nenhum' ? `(${pecaSelecionada.modelo})` : ''}
                      <br />
                      🏷️ Código: {pecaSelecionada.codigo} | 💰 {precoPromocional > 0 ? `Por apenas ${formatCurrency(precoPromocional)}` : formatCurrency(pecaSelecionada.precoVenda)}
                    </div>
                  )}
                </div>

                {/* Imagem */}
                <div className="relative aspect-video bg-stone-900 overflow-hidden">
                  <img src={imagemExibicao} alt="Facebook Post" className="w-full h-full object-cover" />
                </div>

                {/* Link Preview Card */}
                <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-stone-400 block uppercase">CATÁLOGO VITRINE OFICIAL</span>
                    <strong className="text-xs text-stone-900 block truncate">{config.nomeEmpresa} - Faça seu Pedido</strong>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg shrink-0">
                    Comprar
                  </span>
                </div>
              </div>
            )}

            {/* MOCKUP 3: WHATSAPP */}
            {plataformaAtiva === 'whatsapp' && (
              <div className="rounded-2xl overflow-hidden border border-emerald-200 shadow-md bg-stone-100 text-stone-900 text-xs p-3 space-y-2">
                <div className="text-center">
                  <span className="text-[10px] px-2 py-0.5 bg-stone-200 text-stone-600 rounded-md">Hoje</span>
                </div>

                {/* Balão do WhatsApp */}
                <div className="bg-[#d9fdd3] p-3 rounded-2xl rounded-tr-xs shadow-xs max-w-sm ml-auto space-y-2 text-stone-900 border border-emerald-200/50">
                  {/* Foto dentro do balão */}
                  <div className="rounded-xl overflow-hidden aspect-video bg-stone-800">
                    <img src={imagemExibicao} alt="WhatsApp Media" className="w-full h-full object-cover" />
                  </div>

                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-stone-900">{textoPersonalizado}</p>
                    {pecaSelecionada && (
                      <div className="mt-1.5 pt-1.5 border-t border-emerald-300/60 text-[11px]">
                        <div>💎 <strong>{pecaSelecionada.descricao}</strong></div>
                        <div>🏷️ Código: <strong>{pecaSelecionada.codigo}</strong></div>
                        <div>
                          💰 Valor:{' '}
                          {precoPromocional > 0 ? (
                            <strong className="text-rose-700">De ~{formatCurrency(pecaSelecionada.precoVenda)}~ por Apenas {formatCurrency(precoPromocional)}</strong>
                          ) : (
                            <strong>{formatCurrency(pecaSelecionada.precoVenda)}</strong>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-[10px] text-emerald-950 font-medium">
                      🛍️ Catálogo da {config.nomeEmpresa}
                      <br />
                      📲 WhatsApp: {config.telefoneContato}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 text-[9px] text-stone-500 pt-0.5">
                    <span>10:45</span>
                    <span className="text-emerald-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            )}

            {/* MOCKUP 4: TIKTOK */}
            {plataformaAtiva === 'tiktok' && (
              <div className="rounded-2xl overflow-hidden border border-stone-800 shadow-xl bg-stone-950 text-white text-xs relative aspect-[9/14] flex flex-col justify-between p-3.5">
                {/* Imagem de Fundo Estilo Vídeo */}
                <img 
                  src={imagemExibicao} 
                  alt="TikTok Video" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950/90" />

                {/* Topo TikTok */}
                <div className="relative z-10 flex items-center justify-between text-stone-300 text-[11px] font-semibold">
                  <span>Seguindo</span>
                  <span className="text-white font-bold border-b-2 border-white pb-0.5">Para Você</span>
                  <Share2 className="w-4 h-4" />
                </div>

                {/* Lateral Direita (Interações) */}
                <div className="relative z-10 self-end flex flex-col items-center gap-3 text-[10px] text-stone-200">
                  <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-stone-900 flex items-center justify-center font-bold text-amber-400 font-serif-luxury">
                    DK
                  </div>
                  <div className="flex flex-col items-center">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                    <span className="font-bold">2.4k</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-bold">148</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <span className="font-bold">512</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center animate-spin">
                    <Music2 className="w-3 h-3 text-cyan-400" />
                  </div>
                </div>

                {/* Rodapé TikTok (Nome, Legenda, Áudio) */}
                <div className="relative z-10 space-y-1.5 pr-10">
                  <div className="font-bold text-xs text-white">@dksemijoias</div>
                  <p className="text-[11px] text-stone-200 line-clamp-2 leading-tight">
                    {textoPersonalizado} {pecaSelecionada ? `✨ Ref: ${pecaSelecionada.codigo}` : ''}
                  </p>
                  <div className="text-[9px] text-cyan-300 font-semibold truncate flex items-center gap-1">
                    <Music2 className="w-3 h-3 shrink-0" />
                    <span>Som original • DK Semijoias Trends</span>
                  </div>
                </div>
              </div>
            )}

            {/* Informações da Plataforma Selecionada */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Formatação Inteligente:</strong> Ao alternar entre Instagram, Facebook, WhatsApp e TikTok, o texto e a chamada para ação são automaticamente otimizados para o comportamento de compra de cada canal.
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL: CRIAR OU EDITAR TEMPLATE */}
      {showModalTemplate && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif-luxury font-bold text-lg text-stone-900">
                {isEditingTemplate ? 'Editar Modelo de Campanha' : 'Novo Modelo de Campanha'}
              </h3>
              <button
                onClick={() => setShowModalTemplate(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarTemplateModal} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Título do Modelo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bazar de Semijoias ou Promoção Relâmpago"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Plataforma Principal:</label>
                  <select
                    value={formCanal}
                    onChange={(e) => setFormCanal(e.target.value as PlataformaMarketing)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  >
                    <option value="whatsapp">WhatsApp (Status & Listas)</option>
                    <option value="instagram">Instagram (Feed & Reels)</option>
                    <option value="facebook">Facebook (Feed & Grupos)</option>
                    <option value="tiktok">TikTok (Vídeos Curtos)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Objetivo:</label>
                  <select
                    value={formObjetivo}
                    onChange={(e) => setFormObjetivo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="queima_estoque">Queima de Estoque</option>
                    <option value="novidade">Novidades / Coleção</option>
                    <option value="data_comemorativa">Data Comemorativa</option>
                    <option value="stories_interativo">Engajamento / Enquete</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Texto Base da Campanha:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Digite a mensagem promocional com emojis e gatilhos de venda..."
                  value={formTextoPadrao}
                  onChange={(e) => setFormTextoPadrao(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Hashtags Recomendadas:</label>
                <input
                  type="text"
                  placeholder="#dksemijoias #ouro18k #semijoias"
                  value={formHashtags}
                  onChange={(e) => setFormHashtags(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalTemplate(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-xs transition-colors"
                >
                  {isEditingTemplate ? 'Salvar Modelo' : 'Cadastrar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE TEMPLATE */}
      {templateParaExcluir && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-stone-200 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-stone-900">
                Excluir Modelo de Campanha?
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Deseja remover permanentemente o modelo <strong>"{templateParaExcluir.titulo}"</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setTemplateParaExcluir(null)}
                className="flex-1 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusaoTemplate}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
