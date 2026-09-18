import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  AlertTriangle, 
  Clock, 
  ShoppingBag, 
  Share2, 
  Users,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Cloud
} from 'lucide-react';
import { DKLogo } from './DKLogo';
import { DriveAutoBackupModal } from './DriveAutoBackupModal';

interface HeaderProps {
  onOpenUserModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUserModal }) => {
  const { 
    currentTab, 
    setCurrentTab, 
    tabHistory,
    goBack,
    canGoBack,
    searchQuery, 
    setSearchQuery, 
    pecasParadas, 
    parcelasPendentesOuAtrasadas,
    config,
    currentUser,
    driveConectado
  } = useApp();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [driveModalOpen, setDriveModalOpen] = useState(false);

  const parcelasAtrasadas = parcelasPendentesOuAtrasadas.filter(p => p.isAtrasada);

  const getPerfilShort = (perfil: string) => {
    switch (perfil) {
      case 'admin': return 'Admin';
      case 'gerente': return 'Gerente';
      case 'vendedor': return 'Vendedora';
      case 'revendedor': return 'Revenda';
      default: return perfil;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Banner / Brand */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          <div className="flex items-center gap-2">
            {canGoBack && (
              <button
                onClick={goBack}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-stone-700 transition-colors shadow-xs"
                title="Retornar à tela anterior"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}

            {/* Logo DK Semijóias */}
            <div 
              onClick={() => setCurrentTab('dashboard')} 
              className="cursor-pointer group select-none flex-shrink-0"
              title="Ir para o Painel Geral"
            >
              <DKLogo size="font" showText={true} textColor="light" />
            </div>
          </div>

          {/* Quick Search - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar código, peça, modelo ou cliente..."
                className="w-full pl-9 pr-4 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-stone-400 hover:text-stone-200"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Alerts, User Switcher & Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Busca Mobile Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-stone-100"
              title="Pesquisar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Alerta de Peças Paradas (Oculto em mobile para evitar overflow na barra) */}
            <button
              onClick={() => setCurrentTab('estoque')}
              title={`${pecasParadas.length} peças paradas há mais de ${config.diasPecaParadaAlerta} dias`}
              className={`hidden md:flex relative px-2 py-1.5 rounded-lg items-center gap-1 text-xs font-medium transition-all ${
                pecasParadas.length > 0
                  ? 'bg-amber-950/70 border border-amber-600/40 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Paradas:</span>
              <span className="font-semibold text-amber-200">{pecasParadas.length}</span>
            </button>

            {/* Alerta de Inadimplência */}
            <button
              onClick={() => setCurrentTab('cobrancas')}
              title={`${parcelasAtrasadas.length} parcelas vencidas aguardando cobrança`}
              className={`hidden md:flex relative px-2 py-1.5 rounded-lg items-center gap-1 text-xs font-medium transition-all ${
                parcelasAtrasadas.length > 0
                  ? 'bg-rose-950/70 border border-rose-600/40 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden xl:inline">Atrasos:</span>
              <span className="font-semibold text-rose-200">{parcelasAtrasadas.length}</span>
            </button>

            {/* Vitrine Pública (Desktop) */}
            <button
              onClick={() => setCurrentTab('catalogo')}
              className="hidden md:flex px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-medium items-center gap-1.5 border border-amber-500/20 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Catálogo</span> Vitrine
            </button>

            {/* Acesso ao Drive para Backup Automático a Cada Operação */}
            <button
              onClick={() => setDriveModalOpen(true)}
              title={driveConectado ? "Google Drive Conectado: Backup automático ativo em cada operação" : "Conectar pasta do Google Drive para backup automático em cada operação"}
              className={`hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 transition-all border ${
                driveConectado
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white hover:border-amber-500/40'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${driveConectado ? 'text-emerald-400' : 'text-sky-400'}`} />
              <span className="hidden xl:inline">{driveConectado ? 'Drive Ativo' : 'Backup Drive'}</span>
            </button>

            {/* SELETOR DE USUÁRIO ATIVO (Multiusuário) */}
            <button
              onClick={onOpenUserModal}
              className="px-2 sm:px-2.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-lg text-xs flex items-center gap-2 border border-stone-700/80 transition-all hover:border-amber-500/50"
              title="Trocar usuário ou gerenciar operadores da DK Semijóias"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${currentUser.avatarCor || 'from-amber-600 to-amber-800'} text-white font-bold text-[10px] flex items-center justify-center`}>
                {currentUser.nome.charAt(0)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="font-semibold text-stone-200 block truncate max-w-[90px]">
                  {currentUser.nome.split(' ')[0]}
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium">
                  {getPerfilShort(currentUser.perfil)}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Nova Venda Rápida (Desktop) */}
            <button
              onClick={() => setCurrentTab('vendas')}
              className="hidden sm:flex px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-lg text-xs font-bold items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Nova Venda</span>
            </button>

          </div>
        </div>

        {/* Campo de busca expansível no mobile */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-3 pt-1 animate-in slide-in-from-top-2 duration-200">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar código, peça, modelo ou cliente..."
                className="w-full pl-9 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-stone-400"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-bar (Desktop / Tablet) */}
      <div className="hidden md:block bg-stone-950 border-t border-stone-800/80 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 text-xs">
          {[
            { id: 'dashboard', label: 'Painel Geral' },
            { id: 'estoque', label: 'Estoque & Compras' },
            { id: 'vendas', label: 'Vendas & PDV' },
            { id: 'consignacao', label: 'Consignação' },
            { id: 'clientes', label: 'Clientes & WhatsApp' },
            { id: 'catalogo', label: 'Catálogo Vitrine' },
            { id: 'cobrancas', label: 'Inadimplência / Cobrança' },
            { id: 'marketing', label: 'Marketing & Redes' },
            { id: 'relatorios', label: 'Relatórios' },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de Acesso ao Drive para Backup Automático a Cada Operação */}
      <DriveAutoBackupModal 
        isOpen={driveModalOpen} 
        onClose={() => setDriveModalOpen(false)} 
      />
    </header>
  );
};

