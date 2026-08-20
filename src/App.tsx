import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SheetProvider, useSheet } from './context/SheetContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { KanbanView } from './components/KanbanView';
import { DashboardView } from './components/DashboardView';
import { ShiftSummaryModal } from './components/ShiftSummaryModal';
import { UserManagementModal } from './components/UserManagementModal';
import { SettingsModal } from './components/SettingsModal';
import { AuditLogModal } from './components/AuditLogModal';
import { ShiftHistoryModal } from './components/ShiftHistoryModal';
import { NewTicketModal } from './components/NewTicketModal';
import { TicketStatus } from './types';
import { 
  Table as TableIcon, 
  Kanban as KanbanIcon, 
  BarChart3, 
  History, 
  Clock, 
  Settings, 
  Users,
  Layers,
  Send,
  Plus,
  Zap,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

function AppLayout() {
  const [activeView, setActiveView] = useState<'sheet' | 'kanban' | 'dashboard'>('sheet');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketInitialStatus, setNewTicketInitialStatus] = useState<TicketStatus>('Pendente');

  const { tickets, auditLogs, archivedTickets, emailSettings } = useSheet();
  const { currentUser, canSendReport, canEdit } = useAuth();

  const handleOpenNewTicket = (status: TicketStatus = 'Pendente') => {
    setNewTicketInitialStatus(status);
    setIsNewTicketOpen(true);
  };

  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'Resolvido').length;
  const pending = tickets.filter(t => t.status !== 'Resolvido').length;
  const resolutionPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsSummaryOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Top Header */}
      <Header
        onOpenSummaryModal={() => setIsSummaryOpen(true)}
        onOpenUsersModal={() => setIsUsersOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenAuditModal={() => setIsAuditOpen(true)}
        onOpenHistoryModal={() => setIsHistoryOpen(true)}
        onOpenNewTicketModal={() => handleOpenNewTicket()}
      />

      {/* Main Container with Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Dark Sidebar matching Oswaldo Cruz Deep Petrol */}
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-56'} bg-[#08202A] text-slate-300 flex flex-col shrink-0 select-none z-10 border-r border-[#0D303E] transition-all duration-200`}>
          <div className="p-3 space-y-1">
            {/* Collapse / Expand Toggle Button */}
            <div className="flex items-center justify-between pb-1">
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C8594] px-2">
                  Menu
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "Expandir Menu Lateral" : "Recolher Menu Lateral (Mais espaço na tela)"}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0E3544] transition cursor-pointer ${isSidebarCollapsed ? 'mx-auto' : 'ml-auto'}`}
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#00C8D6]" /> : <PanelLeftClose className="w-4 h-4 text-slate-400 hover:text-white" />}
              </button>
            </div>

            {canEdit && (
              <button
                onClick={() => handleOpenNewTicket()}
                title="Novo Chamado"
                className={`w-full mb-2 bg-[#00A9B5] hover:bg-[#00929D] text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition cursor-pointer active:scale-98 ${
                  isSidebarCollapsed ? 'p-2.5' : 'px-3.5 py-2.5'
                }`}
              >
                <Plus className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>+ NOVO CHAMADO</span>}
              </button>
            )}

            {!isSidebarCollapsed && (
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5C8594]">
                Visualizações
              </div>
            )}

            <button
              onClick={() => setActiveView('sheet')}
              title="Planilha em Tempo Real"
              className={`w-full rounded-lg flex items-center gap-3 text-xs font-bold transition cursor-pointer text-left ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              } ${
                activeView === 'sheet'
                  ? 'bg-[#0E3544] text-white shadow-xs border-l-3 border-[#00A9B5]'
                  : 'hover:bg-[#0E3544]/60 hover:text-white text-slate-300'
              }`}
            >
              <TableIcon className={`w-4 h-4 shrink-0 ${activeView === 'sheet' ? 'text-[#00C8D6]' : 'opacity-70'}`} />
              {!isSidebarCollapsed && <span className="truncate">Planilha em Tempo Real</span>}
            </button>

            <button
              onClick={() => setActiveView('kanban')}
              title="Quadro Kanban"
              className={`w-full rounded-lg flex items-center gap-3 text-xs font-bold transition cursor-pointer text-left ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              } ${
                activeView === 'kanban'
                  ? 'bg-[#0E3544] text-white shadow-xs border-l-3 border-[#00A9B5]'
                  : 'hover:bg-[#0E3544]/60 hover:text-white text-slate-300'
              }`}
            >
              <KanbanIcon className={`w-4 h-4 shrink-0 ${activeView === 'kanban' ? 'text-[#00C8D6]' : 'opacity-70'}`} />
              {!isSidebarCollapsed && <span className="truncate">Quadro Kanban</span>}
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              title="Métricas & Indicadores"
              className={`w-full rounded-lg flex items-center gap-3 text-xs font-bold transition cursor-pointer text-left ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              } ${
                activeView === 'dashboard'
                  ? 'bg-[#0E3544] text-white shadow-xs border-l-3 border-[#00A9B5]'
                  : 'hover:bg-[#0E3544]/60 hover:text-white text-slate-300'
              }`}
            >
              <BarChart3 className={`w-4 h-4 shrink-0 ${activeView === 'dashboard' ? 'text-[#00C8D6]' : 'opacity-70'}`} />
              {!isSidebarCollapsed && <span className="truncate">Métricas & Indicadores</span>}
            </button>

            {!isSidebarCollapsed && (
              <div className="pt-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5C8594]">
                Operação & Registros
              </div>
            )}

            <button
              onClick={() => setIsHistoryOpen(true)}
              title="Histórico & Arquivo"
              className={`w-full rounded-lg hover:bg-[#0E3544]/60 hover:text-white flex items-center gap-3 text-xs font-medium transition cursor-pointer text-left text-slate-300 ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              }`}
            >
              <History className="w-4 h-4 shrink-0 opacity-70 text-[#00A9B5]" />
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">Histórico & Arquivo</span>
                  {archivedTickets.length > 0 && (
                    <span className="bg-[#0E3544] text-[#00E5FF] text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border border-[#00A9B5]/30">
                      {archivedTickets.length}
                    </span>
                  )}
                </div>
              )}
            </button>

            <button
              onClick={() => setIsAuditOpen(true)}
              title="Trilha de Auditoria"
              className={`w-full rounded-lg hover:bg-[#0E3544]/60 hover:text-white flex items-center gap-3 text-xs font-medium transition cursor-pointer text-left text-slate-300 ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0 opacity-70 text-amber-400" />
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">Trilha de Auditoria</span>
                  {auditLogs.length > 0 && (
                    <span className="bg-[#0E3544] text-[#00C8D6] text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {auditLogs.length}
                    </span>
                  )}
                </div>
              )}
            </button>

            <button
              onClick={() => setIsUsersOpen(true)}
              title="Equipe & Permissões"
              className={`w-full rounded-lg hover:bg-[#0E3544]/60 hover:text-white flex items-center gap-3 text-xs font-medium transition cursor-pointer text-left text-slate-300 ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              }`}
            >
              <Users className="w-4 h-4 shrink-0 opacity-70 text-cyan-400" />
              {!isSidebarCollapsed && <span className="truncate">Equipe & Permissões</span>}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Configurações"
              className={`w-full rounded-lg hover:bg-[#0E3544]/60 hover:text-white flex items-center gap-3 text-xs font-medium transition cursor-pointer text-left text-slate-300 ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0 opacity-70" />
              {!isSidebarCollapsed && <span className="truncate">Configurações</span>}
            </button>
          </div>

          {/* Shift Progress Widget at Sidebar Bottom */}
          <div className="mt-auto p-3 border-t border-[#0D303E]">
            {!isSidebarCollapsed ? (
              <div className="p-3 bg-[#0E3544]/70 rounded-xl border border-[#13495C]">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-white font-bold truncate">Resolução do Turno</p>
                  <span className="text-xs font-black text-[#00C8D6]">{resolutionPercentage}%</span>
                </div>
                <div className="w-full bg-[#08202A] h-2 rounded-full overflow-hidden border border-[#13495C]">
                  <div 
                    className="bg-[#00A9B5] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${resolutionPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-300 font-semibold mt-2">
                  <span className="text-emerald-300">{resolved} resolvidos</span>
                  <span className="text-amber-300">{pending} pendentes</span>
                </div>

                {canSendReport && (
                  <button
                    onClick={() => setIsSummaryOpen(true)}
                    className="w-full mt-2.5 bg-[#00A9B5] hover:bg-[#00929D] text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Finalizar Turno</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-[#00C8D6]">{resolutionPercentage}%</span>
                {canSendReport && (
                  <button
                    onClick={() => setIsSummaryOpen(true)}
                    title="Finalizar e Enviar Turno"
                    className="p-2 bg-[#00A9B5] hover:bg-[#00929D] text-white rounded-lg transition cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content View Container with Soft Medical Ice Tint */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#F0F8FA]">
          {activeView === 'sheet' && (
            <SpreadsheetGrid 
              onOpenSummaryModal={() => setIsSummaryOpen(true)}
              onOpenNewTicketModal={() => handleOpenNewTicket()}
            />
          )}
          {activeView === 'kanban' && (
            <KanbanView 
              onOpenSummaryModal={() => setIsSummaryOpen(true)}
              onOpenNewTicketModal={(status) => handleOpenNewTicket(status)}
            />
          )}
          {activeView === 'dashboard' && (
            <DashboardView 
              onOpenSummaryModal={() => setIsSummaryOpen(true)}
              onOpenNewTicketModal={() => handleOpenNewTicket()}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        initialStatus={newTicketInitialStatus}
      />

      <ShiftSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />

      <UserManagementModal
        isOpen={isUsersOpen}
        onClose={() => setIsUsersOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AuditLogModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

      <ShiftHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SheetProvider>
        <AppLayout />
      </SheetProvider>
    </AuthProvider>
  );
}
