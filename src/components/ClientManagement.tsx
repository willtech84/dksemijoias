import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cliente, TipoCliente, ComentarioCliente } from '../types';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Search, 
  Share2, 
  Send, 
  FileUp, 
  Phone, 
  Tag, 
  Edit3, 
  Trash2, 
  MessageCircle,
  Plus,
  CheckCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '../utils/printHelpers';

export const ClientManagement: React.FC = () => {
  const { 
    clientes, 
    addCliente, 
    updateCliente, 
    deleteCliente, 
    importarContatosWhatsApp, 
    adicionarComentarioCliente,
    config, 
    setCurrentTab 
  } = useApp();

  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'cliente' | 'revendedor'>('todos');
  const [showModalNovoCliente, setShowModalNovoCliente] = useState(false);
  const [showModalImportWhatsApp, setShowModalImportWhatsApp] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  // Form novo cliente
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [tipo, setTipo] = useState<TipoCliente>('cliente');
  const [preferencias, setPreferencias] = useState('');

  // Importação rápida de contatos do WhatsApp (vCard ou Texto)
  const [textoContatosWhatsApp, setTextoContatosWhatsApp] = useState('');
  const [previewContatos, setPreviewContatos] = useState<{ nome: string; telefone: string }[]>([]);

  // Novo comentário para cliente
  const [novoComentarioTexto, setNovoComentarioTexto] = useState('');
  const [comentarioAutor, setComentarioAutor] = useState('Atendimento');

  // Filtragem
  const clientesFiltrados = clientes.filter(c => {
    const matchBusca = 
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca) ||
      (c.preferencias && c.preferencias.toLowerCase().includes(busca.toLowerCase()));

    const matchTipo = tipoFiltro === 'todos' || c.tipo === tipoFiltro;
    return matchBusca && matchTipo;
  });

  const handleSalvarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      alert('Nome e telefone são obrigatórios!');
      return;
    }

    addCliente({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      cidade: cidade.trim(),
      tipo,
      origem: 'manual',
      preferencias: preferencias.trim()
    });

    setShowModalNovoCliente(false);
    setNome('');
    setTelefone('');
    setEmail('');
    setCidade('');
    setPreferencias('');
  };

  // Parser de texto colado do WhatsApp ou vCard
  const handleProcessarTextoWhatsApp = () => {
    if (!textoContatosWhatsApp.trim()) return;

    const linhas = textoContatosWhatsApp.split('\n');
    const extraidos: { nome: string; telefone: string }[] = [];

    linhas.forEach((linha, idx) => {
      // Procura padrões de telefone (ex: +55 11 98888-7777 ou 11988887777)
      const phoneMatch = linha.match(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4}/);
      if (phoneMatch) {
        const tel = phoneMatch[0];
        // O restante da linha costuma ser o nome
        let nomeLimpo = linha.replace(tel, '').replace(/[-–:,]/g, '').trim();
        if (!nomeLimpo) {
          nomeLimpo = `Contato WhatsApp ${idx + 1}`;
        }
        extraidos.push({
          nome: nomeLimpo,
          telefone: tel
        });
      }
    });

    setPreviewContatos(extraidos);
  };

  const handleConfirmarImportacaoWhatsApp = () => {
    if (previewContatos.length === 0) return;
    const count = importarContatosWhatsApp(previewContatos);
    alert(`${count} novo(s) contato(s) importados com sucesso!`);
    setPreviewContatos([]);
    setTextoContatosWhatsApp('');
    setShowModalImportWhatsApp(false);
  };

  // Enviar link do catálogo de semijoias via WhatsApp
  const handleEnviarCatalogoWhatsApp = (c: Cliente) => {
    const limpo = c.telefone.replace(/\D/g, '');
    const num = limpo.startsWith('55') ? limpo : `55${limpo}`;
    const texto = `Olá, *${c.nome}*! ✨\n\n` +
      `Passando para compartilhar nosso *Catálogo Interativo de Semijoias*!\n` +
      `Temos novidades em banho de Ouro 18k, Prata 925 e microzircônias com garantia.\n\n` +
      `👉 *Acesse nossa vitrine online:* ${config.linkCatalogoPublico}\n\n` +
      `Se gostar de alguma peça, é só me responder por aqui com o código ou foto que reservo para você! 💖`;

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  // Salvar comentário
  const handleAdicionarComentario = (clienteId: string) => {
    if (!novoComentarioTexto.trim()) return;
    adicionarComentarioCliente(clienteId, novoComentarioTexto.trim(), comentarioAutor);
    setNovoComentarioTexto('');
    // Atualiza cliente selecionado
    const updated = clientes.find(c => c.id === clienteId);
    if (updated) setClienteSelecionado(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Relacionamento & WhatsApp
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
            Gestão de Clientes & Revendedoras
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Envie links de catálogo, anote preferências de aros e histórico de comentários, e importe contatos do WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowModalImportWhatsApp(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            Importar do WhatsApp
          </button>

          <button
            onClick={() => setShowModalNovoCliente(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Novo Cadastro
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome, WhatsApp ou preferências..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setTipoFiltro('todos')}
            className={`px-3 py-1 rounded-md font-medium ${tipoFiltro === 'todos' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
          >
            Todos ({clientes.length})
          </button>
          <button
            onClick={() => setTipoFiltro('cliente')}
            className={`px-3 py-1 rounded-md font-medium ${tipoFiltro === 'cliente' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
          >
            Clientes Finais
          </button>
          <button
            onClick={() => setTipoFiltro('revendedor')}
            className={`px-3 py-1 rounded-md font-medium ${tipoFiltro === 'revendedor' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
          >
            Revendedoras
          </button>
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cli) => (
          <div
            key={cli.id}
            className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    cli.tipo === 'revendedor' ? 'bg-purple-100 text-purple-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {cli.tipo === 'revendedor' ? 'Revendedora' : 'Cliente VIP'}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 font-serif-luxury">
                    {cli.nome}
                  </h3>
                  <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>{cli.telefone}</span>
                    {cli.origem === 'whatsapp_import' && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">via WhatsApp</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleEnviarCatalogoWhatsApp(cli)}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors shrink-0"
                  title="Enviar link do catálogo via WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Preferências / Observações */}
              {cli.preferencias && (
                <div className="mt-3 p-2.5 bg-stone-50 rounded-xl text-xs text-stone-700 border border-stone-100">
                  <span className="font-semibold text-stone-500 text-[10px] block uppercase tracking-wider">
                    Gostos & Aros:
                  </span>
                  <span>{cli.preferencias}</span>
                </div>
              )}

              {/* Último Comentário */}
              {cli.comentarios && cli.comentarios.length > 0 && (
                <div className="mt-2.5 p-2 bg-amber-50/50 rounded-lg text-[11px] text-stone-600 border border-amber-100">
                  <span className="font-semibold text-amber-900 block text-[10px]">
                    Último feedback ({formatDate(cli.comentarios[0].data)}):
                  </span>
                  <p className="line-clamp-2 italic">"{cli.comentarios[0].texto}"</p>
                </div>
              )}
            </div>

            {/* Ações / Abrir Histórico */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-400">
                {cli.comentarios?.length || 0} anotação(ões)
              </span>

              <button
                onClick={() => setClienteSelecionado(cli)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Ver Comentários & Ficha</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL FICHA DO CLIENTE & ÁREA DE COMENTÁRIOS */}
      {clienteSelecionado && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-stone-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div>
                <h3 className="font-serif-luxury font-bold text-base text-amber-200">
                  Ficha & Comentários: {clienteSelecionado.nome}
                </h3>
                <p className="text-xs text-stone-400">
                  Histórico de atendimento, preferências de joias e feedbacks.
                </p>
              </div>
              <button onClick={() => setClienteSelecionado(null)} className="text-stone-400 hover:text-white text-xl font-bold">×</button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              
              {/* Info Rápida */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap justify-between gap-2">
                <div>
                  <span className="text-stone-400 block text-[10px]">WhatsApp:</span>
                  <span className="font-bold text-stone-900">{clienteSelecionado.telefone}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Tipo:</span>
                  <span className="font-semibold text-stone-800 capitalize">{clienteSelecionado.tipo}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Cadastrado em:</span>
                  <span className="text-stone-700">{formatDate(clienteSelecionado.dataCadastro)}</span>
                </div>
              </div>

              {/* Adicionar Novo Comentário */}
              <div className="space-y-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <label className="font-bold text-amber-950 block">Novo Comentário ou Registro de Contato</label>
                <textarea
                  rows={2}
                  value={novoComentarioTexto}
                  onChange={(e) => setNovoComentarioTexto(e.target.value)}
                  placeholder="Ex: Cliente elogiou a argola com safira e pediu para avisar quando chegar colar em ouro 18k..."
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={comentarioAutor}
                    onChange={(e) => setComentarioAutor(e.target.value)}
                    placeholder="Autor (ex: Atendimento)"
                    className="px-2 py-1 bg-white border border-amber-200 rounded text-[11px] w-36"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdicionarComentario(clienteSelecionado.id)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Salvar Comentário
                  </button>
                </div>
              </div>

              {/* Lista de Comentários Anteriores */}
              <div className="space-y-2.5">
                <div className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Comentários e Feedbacks Anteriores ({clienteSelecionado.comentarios?.length || 0})
                </div>

                {clienteSelecionado.comentarios?.length === 0 ? (
                  <div className="py-4 text-center text-stone-400">Nenhum comentário registrado ainda.</div>
                ) : (
                  clienteSelecionado.comentarios?.map(comm => (
                    <div key={comm.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                        <span className="font-semibold text-stone-800">{comm.autor}</span>
                        <span>{formatDate(comm.data)}</span>
                      </div>
                      <p className="text-stone-700">{comm.texto}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORTAR CONTATOS DO WHATSAPP */}
      {showModalImportWhatsApp && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-stone-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif-luxury font-bold text-base text-stone-100">
                  Importar Contatos do WhatsApp
                </h3>
              </div>
              <button onClick={() => setShowModalImportWhatsApp(false)} className="text-stone-400 hover:text-white text-xl font-bold">×</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-stone-600 leading-relaxed">
                Cole abaixo uma lista de nomes e telefones exportados de conversas, grupos ou agenda do WhatsApp. O sistema extrai e valida os números automaticamente!
              </p>

              <textarea
                rows={4}
                value={textoContatosWhatsApp}
                onChange={(e) => setTextoContatosWhatsApp(e.target.value)}
                placeholder="Exemplo de linhas coladas:&#10;Juliana Prado: (11) 98765-1122&#10;Patricia Castro - 11999887766&#10;+55 11 97766-5544 Amanda Silveira"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />

              <button
                type="button"
                onClick={handleProcessarTextoWhatsApp}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-semibold"
              >
                Processar e Extrair Contatos
              </button>

              {previewContatos.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-900">
                    ✓ {previewContatos.length} contato(s) válidos encontrados:
                  </div>
                  <div className="max-h-36 overflow-y-auto divide-y divide-emerald-200/60 bg-white rounded-lg p-2">
                    {previewContatos.map((c, i) => (
                      <div key={i} className="py-1 flex justify-between text-[11px]">
                        <span className="font-semibold text-stone-800">{c.nome}</span>
                        <span className="font-mono text-emerald-800">{c.telefone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  onClick={() => setShowModalImportWhatsApp(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700"
                >
                  Cancelar
                </button>
                <button
                  disabled={previewContatos.length === 0}
                  onClick={handleConfirmarImportacaoWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirmar e Cadastrar {previewContatos.length} Clientes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO CLIENTE */}
      {showModalNovoCliente && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-2xl border border-stone-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <h3 className="font-serif-luxury font-bold text-base text-amber-200">
                Cadastrar Cliente / Revendedora
              </h3>
              <button onClick={() => setShowModalNovoCliente(false)} className="text-stone-400 hover:text-white text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSalvarCliente} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Amanda Nogueira"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Perfil</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoCliente)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  >
                    <option value="cliente">Cliente Final</option>
                    <option value="revendedor">Revendedora Parceira</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Cidade / Região</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="São Paulo - SP"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Preferências de Joias (Aros, Banhos, Gostos)</label>
                <input
                  type="text"
                  value={preferencias}
                  onChange={(e) => setPreferencias(e.target.value)}
                  placeholder="Ex: Aro 16, ama ouro rosé e pérolas"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalNovoCliente(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-xs"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
