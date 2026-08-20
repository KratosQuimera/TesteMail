import React, { useState } from 'react';
import { 
  Users, 
  Send, 
  Plus, 
  History, 
  Settings, 
  Clock, 
  Search,
  Download,
  ShieldCheck,
  ChevronDown,
  Layers,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSheet } from '../context/SheetContext';
import { OswaldoCruzLogo } from './OswaldoCruzLogo';

interface HeaderProps {
  onOpenSummaryModal: () => void;
  onOpenUsersModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAuditModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenNewTicketModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSummaryModal,
  onOpenUsersModal,
  onOpenSettingsModal,
  onOpenAuditModal,
  onOpenHistoryModal,
  onOpenNewTicketModal
}) => {
  const { currentUser, users, canEdit } = useAuth();
  const { 
    tickets, 
    activePresences, 
    onlineUsersCount,
    emailSettings,
    searchQuery,
    setSearchQuery
  } = useSheet();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleExportCSV = () => {
    const headers = ['CHAMADO', 'PRIORIDADE', 'ÁREA', 'PROBLEMA', 'STATUS', 'PRÓXIMA AÇÃO', 'RESPONSÁVEL', 'OBSERVAÇÕES', 'ATUALIZADO_EM'];
    const rows = tickets.map(t => [
      `"${t.chamado}"`,
      `"${t.prioridade}"`,
      `"${t.area}"`,
      `"${t.problema.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${(t.proximaAcao || '').replace(/"/g, '""')}"`,
      `"${t.responsavel}"`,
      `"${(t.observacoes || '').replace(/"/g, '""')}"`,
      `"${t.updatedAt}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `plantao_oswaldo_cruz_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col select-none z-30 shrink-0">
      {/* Top Accent Strip (matching dark charcoal bar from brand identity) */}
      <div className="h-2 bg-[#263238] w-full"></div>

      {/* Main Header Bar */}
      <header className="h-16 bg-white border-b border-[#D8E6EA] px-6 flex items-center justify-between shadow-xs">
        {/* Oswaldo Cruz Brand Logo */}
        <div className="flex items-center gap-4">
          <OswaldoCruzLogo size="md" />
          
          <div className="hidden xl:flex items-center pl-3 border-l border-slate-200">
            <span className="bg-[#E6F8FA] text-[#00828A] text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-[#B2EBF2] tracking-wide">
              PLANTÃO TI
            </span>
          </div>
        </div>

        {/* Center Search Bar & Quick Add */}
        <div className="hidden md:flex items-center max-w-md lg:max-w-lg w-full mx-6 gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por chamado, problema, responsável, setor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F4F9FA] hover:bg-[#EBF6F7] focus:bg-white border border-[#D0E2E6] text-slate-800 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00A9B5]/20 focus:border-[#00A9B5] transition shadow-2xs"
            />
          </div>

          {canEdit && onOpenNewTicketModal && (
            <button
              type="button"
              onClick={onOpenNewTicketModal}
              className="shrink-0 bg-[#00A9B5] hover:bg-[#00929D] text-white border border-[#00929D] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Novo</span>
            </button>
          )}
        </div>

        {/* Right Side: Collaborators Stack & User Profile */}
        <div className="flex items-center gap-5">
          {/* Collaborators Stack */}
          <div 
            onClick={onOpenUsersModal}
            className="flex items-center gap-2 cursor-pointer group p-1 rounded-lg hover:bg-slate-50 transition"
            title="Colaboradores conectados ao vivo"
          >
            <div className="flex -space-x-2">
              <div 
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-[#00A9B5]/30 shadow-xs"
                style={{ backgroundColor: currentUser.avatarColor }}
                title={`${currentUser.name} (Você)`}
              >
                {currentUser.initials}
              </div>

              {activePresences.slice(0, 3).map((p, idx) => {
                const ringColors = ['ring-cyan-200', 'ring-emerald-200', 'ring-teal-200'];
                return (
                  <div
                    key={p.userId}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold ring-2 ${ringColors[idx % ringColors.length]} shadow-xs`}
                    style={{ backgroundColor: p.avatarColor }}
                    title={`${p.userName} (Online agora)`}
                  >
                    {p.initials}
                  </div>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 font-medium pl-1">
              <span className="w-2 h-2 rounded-full bg-[#00A9B5]"></span>
              <span>{onlineUsersCount} online</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-slate-200"></div>

          {/* User Profile Block */}
          <div className="relative">
            <div 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-[#00828A] uppercase tracking-wider font-bold">
                  {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'tecnico' ? 'Plantonista' : 'Visualizador'}
                </p>
              </div>
              
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs border-2 border-white shadow-xs"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.initials}
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* User Popover Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-[#F4F9FA]/60">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-[#E6F8FA] text-[#007D87] font-bold uppercase border border-[#B2EBF2]">
                    Perfil: {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={() => { setShowUserDropdown(false); onOpenUsersModal(); }}
                  className="w-full px-4 py-2 text-left hover:bg-[#F0F8FA] flex items-center gap-2.5 transition text-slate-700 hover:text-[#00828A]"
                >
                  <Users className="w-4 h-4 text-[#00A9B5]" />
                  <span>Trocar Usuário / Permissões</span>
                </button>

                <button
                  onClick={() => { setShowUserDropdown(false); onOpenHistoryModal(); }}
                  className="w-full px-4 py-2 text-left hover:bg-[#F0F8FA] flex items-center gap-2.5 transition text-slate-700 hover:text-[#00828A]"
                >
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Histórico de Plantões</span>
                </button>

                <button
                  onClick={() => { setShowUserDropdown(false); onOpenAuditModal(); }}
                  className="w-full px-4 py-2 text-left hover:bg-[#F0F8FA] flex items-center gap-2.5 transition text-slate-700 hover:text-[#00828A]"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Auditoria em Tempo Real</span>
                </button>

                <button
                  onClick={() => { setShowUserDropdown(false); onOpenSettingsModal(); }}
                  className="w-full px-4 py-2 text-left hover:bg-[#F0F8FA] flex items-center gap-2.5 transition text-slate-700 hover:text-[#00828A]"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Configurar E-mails & Unidade</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => { setShowUserDropdown(false); handleExportCSV(); }}
                  className="w-full px-4 py-2 text-left hover:bg-[#F0F8FA] flex items-center gap-2.5 text-[#00828A] font-bold transition"
                >
                  <Download className="w-4 h-4 text-[#00A9B5]" />
                  <span>Exportar Planilha (CSV)</span>
                </button>

                <a
                  href="/plantao-ti-oswaldo-cruz.zip"
                  download="plantao-ti-oswaldo-cruz.zip"
                  onClick={() => setShowUserDropdown(false)}
                  className="w-full px-4 py-2 text-left hover:bg-[#E6F8FA] flex items-center gap-2.5 text-indigo-700 font-bold transition rounded-b-xl"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Baixar Código Fonte (.ZIP)</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
