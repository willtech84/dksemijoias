import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Sparkles, 
  Menu, 
  X, 
  Users, 
  Share2, 
  AlertTriangle, 
  BarChart3, 
  Share, 
  UserCheck, 
  ChevronRight,
  ShieldCheck,
  Printer,
  Camera,
  Tag,
  HelpCircle
} from 'lucide-react';
import { DKLogo } from './DKLogo';

interface BottomNavProps {
  onOpenUserModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenUserModal }) => {
  const { 
    currentTab, 
    setCurrentTab, 
    pecasParadas, 
    parcelasPendentesOuAtrasadas,
    currentUser,
    openTour 
  } = useApp();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const parcelasAtrasadas = parcelasPendentesOuAtrasadas.filter(p => p.isAtrasada);

  const handleNavClick = (tabId: string) => {
    if (tabId === 'tour') {
      openTour();
      setDrawerOpen(false);
      return;
    }
    setCurrentTab(tabId);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Painel',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: Package,
      badge: pecasParadas.length > 0 ? pecasParadas.length : null,
      badgeColor: 'bg-amber-500 text-stone-950'
    },
    {
      id: 'vendas',
      label: 'Vender',
      icon: ShoppingBag,
      isCenter: true
    },
    {
      id: 'consignacao',
      label: 'Consignar',
      icon: Sparkles,
      badge: null
    },
    {
      id: 'menu',
      label: 'Mais',
      icon: Menu,
      isMenu: true,
      badge: parcelasAtrasadas.length > 0 ? parcelasAtrasadas.length : null,
      badgeColor: 'bg-rose-500 text-white'
    }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral & Métricas', icon: LayoutDashboard, desc: 'Visão executiva do faturamento e indicadores' },
    { id: 'vendas', label: '📷 Escanear Tags & PDV', icon: Camera, desc: 'Leitor óptico de câmera para código de barras e QR' },
    { id: 'estoque', label: '🏷️ Estoque & Imprimir Tags', icon: Tag, desc: 'Etiquetas gravata, bobina térmica e folha A4' },
    { id: 'consignacao', label: 'Consignação & Mostruários', icon: Sparkles, desc: 'Controle de peças com revendedoras e prazos' },
    { id: 'clientes', label: 'Clientes & WhatsApp', icon: Users, desc: 'Histórico de compras e importação de contatos' },
    { id: 'catalogo', label: 'Catálogo Vitrine Digital', icon: Share2, desc: 'Link para clientes pedirem sem preço de custo' },
    { id: 'cobrancas', label: 'Inadimplência / Carnês', icon: AlertTriangle, desc: `${parcelasAtrasadas.length} parcelas vencidas aguardando cobrança` },
    { id: 'marketing', label: 'Marketing & Redes Sociais', icon: Share, desc: 'Gerador de posts e legendas prontas' },
    { id: 'relatorios', label: 'Central de Relatórios', icon: BarChart3, desc: 'Extrato de estoque, vendas e inadimplência' },
    { id: 'tour', label: '🎯 Tour Guiado do Usuário', icon: HelpCircle, desc: 'Aprenda os botões de Estoque e PDV passo a passo' }
  ];

  return (
    <>
      {/* Barra de Navegação Inferior Móvel (Apenas em telas mobile/tablet < md) */}
      <nav className="md:hidden no-print fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 shadow-2xl px-2 py-1.5 flex items-center justify-around select-none">
        {navItems.map((item) => {
          if (item.isCenter) {
            const isActive = currentTab === 'vendas';
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick('vendas')}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-13 h-13 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-lg active:scale-95 transition-transform flex items-center justify-center ${
                  isActive ? 'ring-4 ring-amber-400/40' : ''
                }`}>
                  <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-amber-300 stroke-[2.2]" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-300 mt-0.5 tracking-tight">
                  Vender
                </span>
              </button>
            );
          }

          if (item.isMenu) {
            return (
              <button
                key={item.id}
                onClick={() => setDrawerOpen(true)}
                className="flex flex-col items-center justify-center w-14 py-1 rounded-xl text-stone-400 hover:text-amber-200 active:scale-95 transition-all relative focus:outline-none min-h-[44px]"
              >
                <div className="relative">
                  <Menu className="w-5 h-5 text-stone-300" />
                  {item.badge && (
                    <span className={`absolute -top-1 -right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-stone-300 mt-1">
                  {item.label}
                </span>
              </button>
            );
          }

          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl active:scale-95 transition-all relative focus:outline-none min-h-[44px] ${
                isActive ? 'text-amber-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 stroke-[2.4]' : 'text-stone-400'}`} />
                {item.badge && (
                  <span className={`absolute -top-1 -right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'text-amber-300 font-bold' : 'text-stone-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Drawer / Menu Completo Mobile */}
      {drawerOpen && (
        <div className="md:hidden no-print fixed inset-0 z-50 flex flex-col justify-end bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-stone-900 border-t border-stone-800 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center gap-3">
                <DKLogo size="sm" showText={true} />
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Usuário Ativo & Botão de Troca Rápida */}
            <div className="p-3 bg-stone-800/60 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${currentUser.avatarCor || 'from-amber-600 to-amber-800'} text-white font-serif-luxury font-bold text-sm flex items-center justify-center`}>
                  {currentUser.nome.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                    Operador Conectado
                  </span>
                  <span className="text-xs font-bold text-stone-100 block">
                    {currentUser.nome}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenUserModal();
                }}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Trocar Usuário
              </button>
            </div>

            {/* Lista de Todas as Telas e Ações */}
            <div className="p-3 overflow-y-auto space-y-1 divide-y divide-stone-800/40 flex-1">
              {menuItems.map((menu) => {
                const isActive = currentTab === menu.id;
                const Icon = menu.icon;

                return (
                  <button
                    key={menu.id}
                    onClick={() => handleNavClick(menu.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors min-h-[50px] ${
                      isActive 
                        ? 'bg-amber-500/15 text-amber-200 font-semibold' 
                        : 'text-stone-300 hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm ${isActive ? 'text-amber-200 font-bold' : 'text-stone-200 font-medium'}`}>
                          {menu.label}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">
                          {menu.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer com botão fechar */}
            <div className="p-3 bg-stone-950 border-t border-stone-800 text-center space-y-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold"
              >
                Fechar Menu
              </button>
              <p className="text-[11px] text-stone-500 font-medium">
                Elaborado por Willtech84 soluções digitais.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
