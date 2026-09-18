import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Usuario, PerfilUsuario } from '../types';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  Plus, 
  Check, 
  X, 
  Phone, 
  Mail, 
  Percent, 
  Trash2,
  Lock
} from 'lucide-react';
import { DKLogo } from './DKLogo';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    usuarios, 
    currentUser, 
    setCurrentUser, 
    addUsuario, 
    updateUsuario, 
    deleteUsuario 
  } = useApp();

  const [modoCadastro, setModoCadastro] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<PerfilUsuario>('vendedor');
  const [novaComissao, setNovaComissao] = useState<number>(10);
  const [sucessoMsg, setSucessoMsg] = useState('');

  if (!isOpen) return null;

  const getPerfilLabel = (perfil: PerfilUsuario) => {
    switch (perfil) {
      case 'admin': return 'Administradora / Proprietária';
      case 'gerente': return 'Gerente de Loja & Estoque';
      case 'vendedor': return 'Consultora de Vendas (PDV)';
      case 'revendedor': return 'Revendedora / Consignatária';
      default: return perfil;
    }
  };

  const getPerfilBadge = (perfil: PerfilUsuario) => {
    switch (perfil) {
      case 'admin':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: ShieldCheck,
          text: 'Admin'
        };
      case 'gerente':
        return {
          bg: 'bg-stone-200 text-stone-800 border-stone-300',
          icon: Briefcase,
          text: 'Gerente'
        };
      case 'vendedor':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: Sparkles,
          text: 'Vendedora'
        };
      case 'revendedor':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: UserCheck,
          text: 'Revendedora'
        };
    }
  };

  const handleSalvarNovo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const cores = [
      'from-amber-600 to-amber-800',
      'from-stone-700 to-stone-900',
      'from-rose-600 to-rose-800',
      'from-emerald-600 to-emerald-800',
      'from-indigo-600 to-indigo-800',
      'from-purple-600 to-purple-800'
    ];
    const avatarCor = cores[Math.floor(Math.random() * cores.length)];

    const novo = addUsuario({
      nome: novoNome.trim(),
      email: novoEmail.trim() || undefined,
      telefone: novoTelefone.trim() || undefined,
      perfil: novoPerfil,
      avatarCor,
      ativo: true,
      comissaoPercentual: novoPerfil === 'vendedor' || novoPerfil === 'revendedor' ? Number(novaComissao) || 0 : 0
    });

    setNovoNome('');
    setNovoEmail('');
    setNovoTelefone('');
    setModoCadastro(false);
    setSucessoMsg(`Usuário(a) "${novo.nome}" cadastrado(a) com sucesso!`);
    setTimeout(() => setSucessoMsg(''), 3500);
  };

  const handleSelecionarUsuario = (usuario: Usuario) => {
    setCurrentUser(usuario);
    setSucessoMsg(`Operando agora como: ${usuario.nome} (${getPerfilLabel(usuario.perfil)})`);
    setTimeout(() => {
      setSucessoMsg('');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <DKLogo size="sm" showText={false} />
            <div>
              <h2 className="font-serif-luxury font-bold text-lg text-amber-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Múltiplos Usuários & Operadores
              </h2>
              <p className="text-xs text-stone-400">
                Alterne quem está atendendo ou cadastre novos operadores na DK Semijóias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {sucessoMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sucessoMsg}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Usuário Atual Ativo */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 text-white font-serif-luxury font-bold text-lg flex items-center justify-center shadow-sm">
                {currentUser.nome.charAt(0)}
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold block">
                  Usuário Ativo no Sistema
                </span>
                <span className="text-base font-bold text-stone-900 font-serif-luxury block">
                  {currentUser.nome}
                </span>
                <span className="text-xs text-amber-900 font-medium">
                  {getPerfilLabel(currentUser.perfil)}
                  {currentUser.comissaoPercentual ? ` • Comissão ${currentUser.comissaoPercentual}%` : ''}
                </span>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-amber-200/80 text-amber-900 rounded-full text-xs font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Ativo
            </div>
          </div>

          {/* Alternância de Usuário ou Cadastro */}
          {!modoCadastro ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500">
                  Trocar de Operador / Vendedora
                </h3>
                <button
                  onClick={() => setModoCadastro(true)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Usuário
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {usuarios.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const badge = getPerfilBadge(user.perfil);
                  const Icon = badge.icon;

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelecionarUsuario(user)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                          : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${user.avatarCor || 'from-stone-700 to-stone-900'} text-white font-serif-luxury font-bold text-sm flex items-center justify-center shrink-0`}>
                          {user.nome.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 text-sm truncate font-serif-luxury">
                            {user.nome}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.bg}`}>
                              <Icon className="w-2.5 h-2.5" />
                              {badge.text}
                            </span>
                            {user.comissaoPercentual ? (
                              <span className="text-[10px] text-stone-500">
                                {user.comissaoPercentual}% com.
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Trocar →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Formulário de Novo Usuário */
            <form onSubmit={handleSalvarNovo} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 className="text-sm font-bold text-stone-800 font-serif-luxury flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  Cadastrar Novo Usuário / Operador
                </h3>
                <button
                  type="button"
                  onClick={() => setModoCadastro(false)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Voltar à lista
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Amanda Nogueira"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Perfil / Função no Sistema
                  </label>
                  <select
                    value={novoPerfil}
                    onChange={(e) => setNovoPerfil(e.target.value as PerfilUsuario)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="admin">Administradora (Acesso Total)</option>
                    <option value="gerente">Gerente (Estoque & Vendas)</option>
                    <option value="vendedor">Consultora / Vendedora (PDV)</option>
                    <option value="revendedor">Revendedora (Consignação)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Comissão sobre Vendas (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={novaComissao}
                      onChange={(e) => setNovaComissao(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-500 pr-8"
                    />
                    <Percent className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={novoTelefone}
                      onChange={(e) => setNovoTelefone(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-500 pl-8"
                    />
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={novoEmail}
                      onChange={(e) => setNovoEmail(e.target.value)}
                      placeholder="amanda@dksemijoias.com.br"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-500 pl-8"
                    />
                    <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModoCadastro(false)}
                  className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  Cadastrar Operador
                </button>
              </div>
            </form>
          )}

          {/* Dica de Rastreabilidade Multiusuário */}
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <span className="font-bold text-stone-800 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Rastreabilidade & Transparência:
            </span>
            <p>
              O nome do operador ativo atual (<strong className="text-stone-900">{currentUser.nome}</strong>) é gravado automaticamente nas vendas emitidas no PDV e impresso no rodapé de recibos e termos de consignação para prestação de contas.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>{usuarios.length} usuários cadastrados na DK Semijóias</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
