import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StockManagement } from './components/StockManagement';
import { SalesPOS } from './components/SalesPOS';
import { ConsignmentView } from './components/ConsignmentView';
import { ClientManagement } from './components/ClientManagement';
import { PublicCatalog } from './components/PublicCatalog';
import { OverdueDebts } from './components/OverdueDebts';
import { MarketingPromos } from './components/MarketingPromos';
import { ReportsView } from './components/ReportsView';
import { UserManagementModal } from './components/UserManagementModal';
import { BottomNav } from './components/BottomNav';
import { GuidedTourModal } from './components/GuidedTourModal';
import { DKLogo } from './components/DKLogo';
import { Send, ShieldCheck, Gem } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
      {currentTab === 'dashboard' && <Dashboard />}
      {currentTab === 'estoque' && <StockManagement />}
      {currentTab === 'vendas' && <SalesPOS />}
      {currentTab === 'consignacao' && <ConsignmentView />}
      {currentTab === 'clientes' && <ClientManagement />}
      {currentTab === 'catalogo' && <PublicCatalog />}
      {currentTab === 'cobrancas' && <OverdueDebts />}
      {currentTab === 'marketing' && <MarketingPromos />}
      {currentTab === 'relatorios' && <ReportsView />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { config } = useApp();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isCustomerMode, setIsCustomerMode] = useState(false);

  useEffect(() => {
    const checkCustomerMode = () => {
      const isPublic = 
        window.location.search.includes('modo=catalogo') || 
        window.location.search.includes('catalogo') || 
        window.location.hash === '#catalogo-publico';
      setIsCustomerMode(isPublic);
    };

    checkCustomerMode();
    window.addEventListener('popstate', checkCustomerMode);
    window.addEventListener('hashchange', checkCustomerMode);
    return () => {
      window.removeEventListener('popstate', checkCustomerMode);
      window.removeEventListener('hashchange', checkCustomerMode);
    };
  }, []);

  // Se o cliente abriu o link compartilhado do catálogo, renderizar APENAS a vitrine
  if (isCustomerMode) {
    const limpo = config.telefoneContato.replace(/\D/g, '');
    const num = limpo.startsWith('55') ? limpo : `55${limpo}`;

    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-stone-50/70 font-sans text-stone-800 flex flex-col">
        {/* Cabeçalho limpo exclusivo para clientes */}
        <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 text-stone-100 py-3 px-4 sm:px-6 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DKLogo size="font" className="h-5 sm:h-5.5" />
              <div>
                <span className="font-serif-luxury font-bold text-base sm:text-lg text-stone-100 tracking-wider block leading-tight">
                  {config.nomeEmpresa}
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-400 font-medium tracking-widest uppercase block">
                  Catálogo & Vitrine Oficial
                </span>
              </div>
            </div>

            <a
              href={`https://wa.me/${num}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Pedir no WhatsApp</span>
            </a>
          </div>
        </header>

        {/* Conteúdo Exclusivo da Vitrine */}
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 flex-1 w-full">
          <PublicCatalog 
            isCustomerOnly={true} 
            onAdminReturn={() => {
              window.history.replaceState(null, '', window.location.pathname);
              setIsCustomerMode(false);
            }} 
          />
        </main>

        {/* Rodapé institucional para o cliente */}
        <footer className="border-t border-stone-200/80 bg-white py-8 text-center text-xs text-stone-500">
          <div className="max-w-6xl mx-auto px-4 space-y-3">
            <div className="text-stone-800 font-serif-luxury font-bold text-sm">
              <span>{config.nomeEmpresa}</span>
            </div>
            <p className="text-stone-600 text-xs max-w-md mx-auto">
              Semijoias finas banhadas a Ouro 18k e Prata 925 com camada hipoalergênica. Qualidade garantida e atendimento personalizado.
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-2">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Garantia de 1 Ano</span>
              <span className="flex items-center gap-1"><Gem className="w-3.5 h-3.5 text-amber-600" /> Zircônias Cravejadas</span>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  window.history.replaceState(null, '', window.location.pathname);
                  setIsCustomerMode(false);
                }}
                className="text-[11px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
              >
                Acesso do Lojista / Painel Administrativo
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-stone-100/60 font-sans text-stone-800 selection:bg-amber-500/30 selection:text-amber-950 flex flex-col">
      <Header onOpenUserModal={() => setUserModalOpen(true)} />
      
      <div className="flex-1 w-full max-w-full">
        <MainContent />
      </div>

      {/* Bottom Navigation for Mobile Devices */}
      <BottomNav onOpenUserModal={() => setUserModalOpen(true)} />

      {/* Modal de Gestão e Troca de Usuários */}
      <UserManagementModal 
        isOpen={userModalOpen} 
        onClose={() => setUserModalOpen(false)} 
      />

      {/* Tour Guiado do Usuário (Onboarding) */}
      <GuidedTourModal />

      <footer className="mt-auto border-t border-stone-200/80 bg-white/70 py-4 text-center text-xs text-stone-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-serif-luxury font-bold text-stone-800">
            {config.nomeEmpresa} • Gestão & Vendas de Semijoias
          </span>
          <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Elaborado por Willtech84 soluções digitais.
          </span>
          <span className="text-[11px] text-stone-400">
            Estoque com Fotos, Tags para Joias, PDV, Consignação, Multiusuário & WhatsApp
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

