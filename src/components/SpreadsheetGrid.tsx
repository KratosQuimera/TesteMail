import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Trash2, 
  CheckCircle, 
  Plus, 
  Edit3, 
  Send,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Archive,
  RotateCcw,
  Sparkles,
  History,
  Check
} from 'lucide-react';
import { Ticket, Priority, TicketStatus } from '../types';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';

interface SpreadsheetGridProps {
  onOpenSummaryModal?: () => void;
  onOpenNewTicketModal?: () => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({ 
  onOpenSummaryModal,
  onOpenNewTicketModal
}) => {
  const { 
    tickets, 
    archivedTickets,
    updateCell, 
    addTicket, 
    deleteTicket, 
    archiveTicket,
    archiveResolvedTickets,
    restoreArchivedTicket,
    areas, 
    responsibles, 
    addArea, 
    addResponsible, 
    activePresences, 
    setMyActiveCell,
    searchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    auditLogs
  } = useSheet();

  const { canEdit, canSendReport, currentUser } = useAuth();

  // Notification for archiving / undo
  const [archiveNotification, setArchiveNotification] = useState<{
    message: string;
    archivedId?: string;
  } | null>(null);

  // Active open dropdown state
  const [activeDropdown, setActiveDropdown] = useState<{
    ticketId: string;
    field: 'prioridade' | 'status' | 'responsavel' | 'area';
  } | null>(null);

  // New option inline creator
  const [newOptionValue, setNewOptionValue] = useState('');
  const [showNewOptionInput, setShowNewOptionInput] = useState(false);

  // Selected row
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Filter panel visibility and local filters
  const [showFilters, setShowFilters] = useState(false);
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [responsibleFilter, setResponsibleFilter] = useState('ALL');

  const resolvedTicketsCount = tickets.filter(t => t.status === 'Resolvido').length;

  const hasActiveFilters = statusFilter !== 'ALL' || priorityFilter !== 'ALL' || areaFilter !== 'ALL' || responsibleFilter !== 'ALL';

  const clearAllFilters = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setAreaFilter('ALL');
    setResponsibleFilter('ALL');
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        t.chamado.toLowerCase().includes(q) ||
        t.problema.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        t.responsavel.toLowerCase().includes(q) ||
        (t.proximaAcao && t.proximaAcao.toLowerCase().includes(q)) ||
        (t.observacoes && t.observacoes.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.prioridade !== priorityFilter) return false;
    if (areaFilter !== 'ALL' && t.area !== areaFilter) return false;
    if (responsibleFilter !== 'ALL' && t.responsavel !== responsibleFilter) return false;
    return true;
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.custom-dropdown-container')) {
        setActiveDropdown(null);
        setShowNewOptionInput(false);
        setNewOptionValue('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCellFocus = (ticketId: string, field: keyof Ticket) => {
    setMyActiveCell(ticketId, field);
  };

  const handleCellBlur = () => {
    setMyActiveCell(undefined, undefined);
  };

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'P1':
        return 'bg-red-100 text-red-700 border border-red-300 font-bold';
      case 'P2':
        return 'bg-orange-100 text-orange-700 border border-orange-300 font-bold';
      case 'P3':
        return 'bg-amber-100 text-amber-700 border border-amber-300 font-bold';
      case 'P4':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-300';
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Resolvido':
        return (
          <div className="flex items-center gap-1.5 truncate">
            <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] font-medium text-emerald-800 truncate">Concluído</span>
          </div>
        );
      case 'Em Atendimento':
        return (
          <div className="flex items-center gap-1.5 truncate">
            <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-blue-500"></div>
            <span className="text-[11px] font-medium text-blue-800 truncate">Em Atendimento</span>
          </div>
        );
      case 'Aguardando Desenvolvimento':
        return (
          <div className="flex items-center gap-1.5 truncate">
            <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-purple-500"></div>
            <span className="text-[11px] font-medium text-purple-800 truncate">Aguardando Desenv.</span>
          </div>
        );
      case 'Impedimento':
        return (
          <div className="flex items-center gap-1.5 truncate">
            <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-rose-500"></div>
            <span className="text-[11px] font-medium text-rose-800 truncate">Impedimento</span>
          </div>
        );
      case 'Pendente':
      default:
        return (
          <div className="flex items-center gap-1.5 truncate">
            <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-amber-500"></div>
            <span className="text-[11px] font-medium text-amber-800 truncate">Pendente</span>
          </div>
        );
    }
  };

  // Find if another user is editing this specific cell
  const getCellCollaborator = (ticketId: string, field: keyof Ticket) => {
    return activePresences.find(
      p => p.userId !== currentUser.id && p.activeCell?.ticketId === ticketId && p.activeCell?.field === field
    );
  };

  const lastLog = auditLogs.length > 0 ? auditLogs[0] : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
      {/* Top Banner with Action Buttons */}
      <div className="px-4 pt-3.5 pb-2.5 flex flex-wrap justify-between items-end shrink-0 gap-3">
        <div>
          <nav className="text-[10px] text-indigo-600 font-bold mb-0.5 uppercase tracking-wider">
            DASHBOARD / PLANTÃO TI
          </nav>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Controle Operacional & Passagem de Turno</span>
          </h2>
        </div>

        {/* Action Buttons & Filter Toggle matching Oswaldo Cruz style */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Clear / Archive Resolved Tickets Button */}
          {canEdit && (
            <button
              type="button"
              disabled={resolvedTicketsCount === 0}
              onClick={() => {
                const count = resolvedTicketsCount;
                if (count === 0) return;
                const archived = archiveResolvedTickets();
                if (archived.length > 0) {
                  setArchiveNotification({
                    message: `${count} chamado(s) resolvido(s) limpo(s) e arquivado(s) com sucesso na data de hoje.`
                  });
                  setTimeout(() => setArchiveNotification(null), 6000);
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs ${
                resolvedTicketsCount > 0
                  ? 'bg-[#E6F8FA] hover:bg-[#D4F3F7] text-[#007D87] border border-[#B2EBF2] active:scale-98 cursor-pointer ring-1 ring-[#00A9B5]/20'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
              title="Limpar todos os chamados com status Resolvido da planilha ativa e salvá-los no histórico permanente de hoje"
            >
              <Archive className="w-3.5 h-3.5 text-[#00A9B5]" />
              <span>Limpar Resolvidos ({resolvedTicketsCount})</span>
            </button>
          )}

          {/* Main "FILTROS" Button styled exactly from reference image */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-[#00A9B5] text-white ring-2 ring-[#00A9B5]/40 shadow-md'
                : 'bg-[#00A9B5] hover:bg-[#00929D] text-white'
            }`}
          >
            {/* Custom 3-bar horizontal filter icon like in reference */}
            <div className="flex flex-col items-center justify-center gap-[2.5px] w-3.5">
              <span className="w-3 h-[2px] bg-white rounded-full"></span>
              <span className="w-2 h-[2px] bg-white rounded-full"></span>
              <span className="w-1 h-[2px] bg-white rounded-full"></span>
            </div>
            <span>FILTROS</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            )}
          </button>

          {/* Quick Clear if filters active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-[#00828A] hover:text-[#005B61] underline font-semibold cursor-pointer px-1"
            >
              Limpar Filtros
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onOpenNewTicketModal ? onOpenNewTicketModal() : addTicket()}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#00A9B5] hover:bg-[#00929D] border border-[#00929D] rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>+ Novo Chamado</span>
            </button>
          )}

          {canSendReport && onOpenSummaryModal && (
            <button
              onClick={onOpenSummaryModal}
              className="px-3.5 py-1.5 text-xs font-bold text-[#0A4252] bg-white border border-[#C6DFE4] hover:bg-[#EBF6F7] rounded-lg shadow-xs flex items-center gap-1.5 transition active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <Send className="w-3.5 h-3.5 text-[#00A9B5]" />
              <span>Finalizar e Enviar Resumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Archive Notification Toast Banner */}
      {archiveNotification && (
        <div className="mx-4 mb-2.5 px-3.5 py-2 bg-[#E6F8FA] border border-[#00A9B5]/40 rounded-lg shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-1 text-xs text-[#08202A]">
          <div className="flex items-center gap-2 font-medium">
            <Archive className="w-3.5 h-3.5 text-[#00A9B5] shrink-0" />
            <span>{archiveNotification.message}</span>
            <span className="text-[10px] text-[#587982] ml-1">(Consulte em <b>Histórico & Arquivo</b>)</span>
          </div>

          <div className="flex items-center gap-2">
            {archiveNotification.archivedId && (
              <button
                type="button"
                onClick={() => {
                  if (archiveNotification.archivedId) {
                    restoreArchivedTicket(archiveNotification.archivedId);
                    setArchiveNotification(null);
                  }
                }}
                className="text-[11px] font-bold text-[#00828A] hover:text-[#005B61] flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#B2EBF2] shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Desfazer</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setArchiveNotification(null)}
              className="text-slate-400 hover:text-slate-700 text-xs px-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="mx-4 mb-3 p-3 bg-white border border-[#D0E2E6] rounded-xl shadow-xs flex flex-wrap items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00828A] uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-[#00A9B5]" />
            <span>Filtros Ativos:</span>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F4F9FA] border border-[#D0E2E6] text-slate-800 px-2 py-1 rounded-md text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[#00A9B5]"
            >
              <option value="ALL">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Atendimento">Em Atendimento</option>
              <option value="Aguardando Desenvolvimento">Aguardando Desenv.</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Impedimento">Impedimento</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-semibold">Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#F4F9FA] border border-[#D0E2E6] text-slate-800 px-2 py-1 rounded-md text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[#00A9B5]"
            >
              <option value="ALL">Todas as Prioridades</option>
              <option value="P1">P1 (Crítica)</option>
              <option value="P2">P2 (Alta)</option>
              <option value="P3">P3 (Média)</option>
              <option value="P4">P4 (Baixa)</option>
            </select>
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-semibold">Setor:</span>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="bg-[#F4F9FA] border border-[#D0E2E6] text-slate-800 px-2 py-1 rounded-md text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[#00A9B5]"
            >
              <option value="ALL">Todos os Setores</option>
              {areas.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Responsible Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-semibold">Responsável:</span>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="bg-[#F4F9FA] border border-[#D0E2E6] text-slate-800 px-2 py-1 rounded-md text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[#00A9B5]"
            >
              <option value="ALL">Todos os Responsáveis</option>
              {responsibles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-md transition cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {/* Main Table Card (Oswaldo Cruz Medical Polish Style) */}
      <div className="mx-4 mb-4 bg-white border border-[#D0E2E6] rounded-xl flex flex-col grow shadow-sm overflow-hidden">
        <div className="overflow-x-auto flex-1 flex flex-col custom-scrollbar">
          <table className="w-full border-collapse text-left table-fixed">
            {/* Column Width Definitions */}
            <colgroup>
              <col className="w-[34px]" />
              <col className="w-[88px]" />
              <col className="w-[66px]" />
              <col className="w-[14%]" />
              <col className="w-[23%]" />
              <col className="w-[130px]" />
              <col className="w-[15%]" />
              <col className="w-[19%]" />
              <col className="w-[92px]" />
            </colgroup>

            {/* Table Header */}
            <thead>
              <tr className="bg-[#F0F7F9] border-b border-[#D0E2E6]">
                <th className="py-2.5 px-1.5 text-center text-[10px] font-bold text-[#0A4252] uppercase tracking-wider border-r border-[#E2EEF0]">
                  #
                </th>
                <th className="py-2.5 px-2 text-[10px] font-bold text-[#0A4252] uppercase tracking-wider border-r border-[#E2EEF0]">
                  Chamado
                </th>
                <th className="py-2.5 px-1.5 text-center text-[10px] font-bold text-[#0A4252] uppercase tracking-wider border-r border-[#E2EEF0]">
                  Prioridade
                </th>
                <th className="py-2.5 px-2 text-[10px] font-bold text-[#0A4252] uppercase tracking-wider border-r border-[#E2EEF0]">
                  Área / Setor
                </th>
                <th className="py-2.5 px-2.5 text-[10px] font-bold text-[#0A4252] uppercase tracking-wider border-r border-[#E2EEF0]">
                  Problema
                </th>
                <th className="py-2.5 px-2 text-[10px] font-bold text-[#0A4252] uppercase tracking-wider border-r border-[#E2EEF0]">
                  Status
                </th>
                <th className="py-2.5 px-2 text-[10px] font-bold text-[#0A4252] uppercase tracking-wider border-r border-[#E2EEF0]">
                  Responsável
                </th>
                <th className="py-2.5 px-2 text-[10px] font-bold text-[#0A4252] uppercase tracking-wider border-r border-[#E2EEF0]">
                  Próxima Ação & Obs
                </th>
                <th className="py-2.5 px-1.5 text-center text-[10px] font-bold text-[#0A4252] uppercase tracking-wider">
                  Ações / Limpeza
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 bg-slate-50/50">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-semibold text-slate-700">Nenhum chamado encontrado</p>
                      <p className="text-xs text-slate-400">Clique no botão abaixo para cadastrar um novo incidente no plantão</p>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onOpenNewTicketModal ? onOpenNewTicketModal() : addTicket()}
                          className="mt-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Inserir Novo Chamado</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => {
                const isSelected = selectedRowId === ticket.id;
                const chamadoCollab = getCellCollaborator(ticket.id, 'chamado');
                const prioridadeCollab = getCellCollaborator(ticket.id, 'prioridade');
                const areaCollab = getCellCollaborator(ticket.id, 'area');
                const problemaCollab = getCellCollaborator(ticket.id, 'problema');
                const statusCollab = getCellCollaborator(ticket.id, 'status');
                const respCollab = getCellCollaborator(ticket.id, 'responsavel');
                const proximaCollab = getCellCollaborator(ticket.id, 'proximaAcao');
                const hasCollabInRow = chamadoCollab || prioridadeCollab || areaCollab || problemaCollab || statusCollab || respCollab || proximaCollab;

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedRowId(ticket.id)}
                    className={`transition-colors group ${
                      hasCollabInRow 
                        ? 'bg-amber-50/40' 
                        : ticket.status === 'Resolvido'
                        ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                        : isSelected
                        ? 'bg-indigo-50/40'
                        : index % 2 === 1 
                        ? 'bg-slate-50/50 hover:bg-slate-100/60' 
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Index / Line number */}
                    <td className="py-1.5 px-1 text-center font-mono text-[10px] text-slate-400 border-r border-[#E8F1F3] bg-[#F7FBFC]">
                      {index + 1}
                    </td>

                    {/* CHAMADO */}
                    <td className={`py-1.5 px-1.5 border-r border-[#E8F1F3] font-mono font-bold text-slate-900 relative ${
                      chamadoCollab ? 'border-2 border-amber-400 bg-amber-50 rounded-sm' : ''
                    }`}>
                      {chamadoCollab && (
                        <div className="absolute -top-2.5 right-0.5 flex items-center gap-1 bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shadow-xs">
                          <span>{chamadoCollab.userName}</span>
                        </div>
                      )}
                      <input
                        type="text"
                        value={ticket.chamado}
                        title={ticket.chamado || 'Número do chamado'}
                        disabled={!canEdit}
                        onFocus={() => handleCellFocus(ticket.id, 'chamado')}
                        onBlur={handleCellBlur}
                        onChange={(e) => updateCell(ticket.id, 'chamado', e.target.value)}
                        className="w-full bg-transparent font-bold text-[11px] text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00A9B5] rounded px-1 py-0.5"
                      />
                    </td>

                    {/* PRIORIDADE */}
                    <td className={`py-1.5 px-1 text-center border-r border-[#E8F1F3] relative custom-dropdown-container ${
                      prioridadeCollab ? 'border-2 border-amber-400 bg-amber-50 rounded-sm' : ''
                    }`}>
                      {prioridadeCollab && (
                        <div className="absolute -top-2.5 right-0.5 bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shadow-xs">
                          {prioridadeCollab.userName}
                        </div>
                      )}
                      <div className="relative flex justify-center">
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => {
                            if (!canEdit) return;
                            setActiveDropdown(
                              activeDropdown?.ticketId === ticket.id && activeDropdown?.field === 'prioridade'
                                ? null
                                : { ticketId: ticket.id, field: 'prioridade' }
                            );
                          }}
                          className={`flex items-center justify-between gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition w-14 shadow-2xs ${getPriorityBadgeClass(ticket.prioridade)}`}
                        >
                          <span>{ticket.prioridade}</span>
                          <ChevronDown className="w-2.5 h-2.5 opacity-60 shrink-0" />
                        </button>

                        {/* Priority Dropdown */}
                        {activeDropdown?.ticketId === ticket.id && activeDropdown?.field === 'prioridade' && (
                          <div className="absolute left-0 top-full mt-1 w-28 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in">
                            {(['P1', 'P2', 'P3', 'P4'] as Priority[]).map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  updateCell(ticket.id, 'prioridade', p);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-2.5 py-1 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50"
                              >
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${getPriorityBadgeClass(p)}`}>
                                  {p}
                                </span>
                                {ticket.prioridade === p && <CheckCircle className="w-3 h-3 text-[#00A9B5]" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ÁREA */}
                    <td className={`py-1.5 px-1.5 border-r border-[#E8F1F3] relative custom-dropdown-container ${
                      areaCollab ? 'border-2 border-amber-400 bg-amber-50 rounded-sm' : ''
                    }`}>
                      {areaCollab && (
                        <div className="absolute -top-2.5 right-0.5 bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shadow-xs">
                          {areaCollab.userName}
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="text"
                          value={ticket.area}
                          title={ticket.area || 'Setor ou Área'}
                          disabled={!canEdit}
                          onFocus={() => {
                            handleCellFocus(ticket.id, 'area');
                            setActiveDropdown({ ticketId: ticket.id, field: 'area' });
                          }}
                          onBlur={handleCellBlur}
                          onChange={(e) => updateCell(ticket.id, 'area', e.target.value)}
                          className="w-full bg-transparent text-[11px] text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00A9B5] rounded px-1 py-0.5 font-medium truncate"
                        />

                        {/* Area Autocomplete */}
                        {activeDropdown?.ticketId === ticket.id && activeDropdown?.field === 'area' && (
                          <div className="absolute left-0 top-full mt-1 w-52 max-h-48 overflow-y-auto bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in">
                            <div className="px-2 py-1 text-[9px] uppercase font-bold text-slate-400 border-b border-slate-100">
                              Selecionar Setor
                            </div>
                            {areas.map((a) => (
                              <button
                                key={a}
                                type="button"
                                onClick={() => {
                                  updateCell(ticket.id, 'area', a);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full px-2 py-1 text-left text-xs hover:bg-slate-50 truncate flex items-center justify-between ${
                                  ticket.area === a ? 'font-bold text-[#00828A] bg-[#E6F8FA]' : 'text-slate-700'
                                }`}
                              >
                                <span className="truncate">{a}</span>
                                {ticket.area === a && <CheckCircle className="w-3 h-3 text-[#00A9B5] shrink-0" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* PROBLEMA */}
                    <td className={`py-1.5 px-2 border-r border-[#E8F1F3] relative ${
                      problemaCollab ? 'border-2 border-amber-400 bg-amber-50 rounded-sm' : ''
                    }`}>
                      {problemaCollab && (
                        <div className="absolute -top-2.5 right-0.5 bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shadow-xs">
                          {problemaCollab.userName}
                        </div>
                      )}
                      <input
                        type="text"
                        value={ticket.problema}
                        title={ticket.problema || 'Descrição do problema'}
                        placeholder="Descrição..."
                        disabled={!canEdit}
                        onFocus={() => handleCellFocus(ticket.id, 'problema')}
                        onBlur={handleCellBlur}
                        onChange={(e) => updateCell(ticket.id, 'problema', e.target.value)}
                        className="w-full bg-transparent font-medium text-[11px] text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00A9B5] rounded px-1 py-0.5 truncate"
                      />
                    </td>

                    {/* STATUS */}
                    <td className={`py-1.5 px-1.5 border-r border-[#E8F1F3] relative custom-dropdown-container ${
                      statusCollab ? 'border-2 border-amber-400 bg-amber-50 rounded-sm' : ''
                    }`}>
                      {statusCollab && (
                        <div className="absolute -top-2.5 right-0.5 bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shadow-xs">
                          {statusCollab.userName}
                        </div>
                      )}
                      <div className="relative">
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => {
                            if (!canEdit) return;
                            setActiveDropdown(
                              activeDropdown?.ticketId === ticket.id && activeDropdown?.field === 'status'
                                ? null
                                : { ticketId: ticket.id, field: 'status' }
                            );
                          }}
                          className="w-full flex items-center justify-between gap-1 px-1.5 py-0.5 rounded-md hover:bg-slate-100/70 border border-transparent hover:border-slate-200 transition text-left"
                        >
                          <div className="truncate">{getStatusBadge(ticket.status)}</div>
                          <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        </button>

                        {/* Status Dropdown */}
                        {activeDropdown?.ticketId === ticket.id && activeDropdown?.field === 'status' && (
                          <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95">
                            <div className="p-1 space-y-0.5">
                              {(['Pendente', 'Em Atendimento', 'Aguardando Desenvolvimento', 'Resolvido', 'Impedimento'] as TicketStatus[]).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    updateCell(ticket.id, 'status', st);
                                    setActiveDropdown(null);
                                  }}
                                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition flex items-center justify-between ${
                                    ticket.status === st
                                      ? 'bg-slate-100 text-slate-900 font-semibold'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  {getStatusBadge(st)}
                                  {ticket.status === st && <CheckCircle className="w-3 h-3 text-[#00A9B5]" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* RESPONSÁVEL */}
                    <td className={`py-1.5 px-1.5 border-r border-[#E8F1F3] relative custom-dropdown-container ${
                      respCollab ? 'border-2 border-amber-400 bg-amber-50 rounded-sm' : ''
                    }`}>
                      {respCollab && (
                        <div className="absolute -top-2.5 right-0.5 bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shadow-xs">
                          {respCollab.userName}
                        </div>
                      )}
                      <div className="relative">
                        <div
                          title={ticket.responsavel}
                          onClick={() => {
                            if (!canEdit) return;
                            setActiveDropdown(
                              activeDropdown?.ticketId === ticket.id && activeDropdown?.field === 'responsavel'
                                ? null
                                : { ticketId: ticket.id, field: 'responsavel' }
                            );
                          }}
                          className="cursor-pointer flex items-center justify-between gap-1 px-1 py-0.5 rounded hover:bg-slate-100/80 transition"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <div className="w-4 h-4 rounded-full bg-[#E6F8FA] text-[#00828A] text-[8px] flex items-center justify-center font-bold border border-[#B2EBF2] shrink-0">
                              {ticket.responsavel.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate text-[11px] text-slate-800 font-medium">{ticket.responsavel}</span>
                          </div>
                          <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        </div>

                        {/* Responsibles Dropdown */}
                        {activeDropdown?.ticketId === ticket.id && activeDropdown?.field === 'responsavel' && (
                          <div className="absolute left-0 top-full mt-1 w-52 max-h-60 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 p-1 z-50 animate-in fade-in zoom-in-95">
                            <div className="space-y-0.5">
                              {responsibles.map((resp) => (
                                <button
                                  key={resp}
                                  type="button"
                                  onClick={() => {
                                    updateCell(ticket.id, 'responsavel', resp);
                                    setActiveDropdown(null);
                                  }}
                                  className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium transition text-left flex items-center justify-between ${
                                    ticket.responsavel === resp
                                      ? 'bg-[#E6F8FA] text-[#00828A] font-bold'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{resp}</span>
                                  {ticket.responsavel === resp && <CheckCircle className="w-3 h-3 text-[#00A9B5] shrink-0" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* PRÓXIMA AÇÃO / OBS */}
                    <td className={`py-1.5 px-1.5 border-r border-[#E8F1F3] relative ${
                      proximaCollab ? 'border-2 border-amber-400 bg-amber-50 rounded-sm' : ''
                    }`}>
                      {proximaCollab && (
                        <div className="absolute -top-2.5 right-0.5 bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shadow-xs">
                          {proximaCollab.userName}
                        </div>
                      )}
                      <input
                        type="text"
                        value={ticket.proximaAcao || ''}
                        title={ticket.proximaAcao || 'Próxima ação ou observação...'}
                        placeholder="Ação..."
                        disabled={!canEdit}
                        onFocus={() => handleCellFocus(ticket.id, 'proximaAcao')}
                        onBlur={handleCellBlur}
                        onChange={(e) => updateCell(ticket.id, 'proximaAcao', e.target.value)}
                        className="w-full bg-transparent text-[11px] text-slate-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00A9B5] rounded px-1 py-0.5 truncate"
                      />
                    </td>

                    {/* ACTIONS */}
                    <td className="py-1.5 px-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Clear & Archive Individual Button */}
                        {canEdit && (
                          <button
                            type="button"
                            title={
                              ticket.status === 'Resolvido'
                                ? `Limpar chamado resolvido ${ticket.chamado} da planilha ativa (salvo no arquivo de hoje)`
                                : `Limpar e arquivar chamado ${ticket.chamado}`
                            }
                            onClick={() => {
                              const arch = archiveTicket(
                                ticket.id, 
                                ticket.status === 'Resolvido' ? 'Resolvido no Plantão' : 'Limpeza Individual de Chamado'
                              );
                              if (arch) {
                                setArchiveNotification({
                                  message: `Chamado ${ticket.chamado} limpo da planilha ativa e arquivado na data de hoje.`,
                                  archivedId: arch.id
                                });
                                setTimeout(() => setArchiveNotification(null), 6000);
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-0.5 shadow-2xs ${
                              ticket.status === 'Resolvido'
                                ? 'bg-[#E6F8FA] hover:bg-[#D4F3F7] text-[#007D87] border border-[#B2EBF2]'
                                : 'bg-slate-100 hover:bg-[#E6F8FA] text-slate-600 hover:text-[#00828A] border border-slate-200 hover:border-[#B2EBF2]'
                            }`}
                          >
                            <Archive className="w-3 h-3 text-[#00A9B5]" />
                            <span>{ticket.status === 'Resolvido' ? 'Limpar' : 'Arq'}</span>
                          </button>
                        )}

                        {ticket.status !== 'Resolvido' && (
                          <button
                            type="button"
                            title="Marcar como Resolvido"
                            onClick={() => updateCell(ticket.id, 'status', 'Resolvido')}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canEdit && (
                          <button
                            type="button"
                            title="Excluir permanentemente"
                            onClick={() => {
                              if (confirm(`Remover definitivamente chamado ${ticket.chamado}?`)) {
                                deleteTicket(ticket.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Table Footer matching Design HTML */}
        <div className="mt-auto border-t border-slate-200 py-2.5 px-4 bg-slate-50 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>
            {lastLog ? (
              <>Última alteração por <b>{lastLog.userName}</b> ({lastLog.chamado} • {lastLog.field})</>
            ) : (
              <>Pronto para edição colaborativa</>
            )}
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {filteredTickets.length} chamados listados
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {auditLogs.length} células editadas
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              {activePresences.length + 1} pessoas online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
