import React, { useState, useMemo } from 'react';
import { 
  X, 
  History, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Mail, 
  User,
  Download,
  Archive,
  Search,
  RotateCcw,
  Trash2,
  Filter,
  CheckCircle,
  Tag
} from 'lucide-react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { ShiftRecord, ArchivedTicket } from '../types';

interface ShiftHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'archived' | 'shifts';
}

export const ShiftHistoryModal: React.FC<ShiftHistoryModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = 'archived'
}) => {
  const { 
    shiftHistory, 
    archivedTickets, 
    restoreArchivedTicket, 
    deleteArchivedTicketPermanently 
  } = useSheet();
  const { canEdit } = useAuth();

  const [activeTab, setActiveTab] = useState<'archived' | 'shifts'>(defaultTab);

  // Shifts state
  const [selectedShift, setSelectedShift] = useState<ShiftRecord | null>(
    shiftHistory.length > 0 ? shiftHistory[0] : null
  );

  // Archived tickets filter state
  const [archivedSearch, setArchivedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'CUSTOM'
  const [customDate, setCustomDate] = useState('');
  const [selectedArchivedTicket, setSelectedArchivedTicket] = useState<ArchivedTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // List of unique dates in archived tickets
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    archivedTickets.forEach(t => {
      if (t.archivedDate) dates.add(t.archivedDate);
    });
    return Array.from(dates).sort().reverse();
  }, [archivedTickets]);

  // Today & Yesterday ISO strings
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Filtered archived tickets
  const filteredArchived = useMemo(() => {
    return archivedTickets.filter(t => {
      // Date filter
      if (dateFilter === 'TODAY' && t.archivedDate !== todayStr) return false;
      if (dateFilter === 'YESTERDAY' && t.archivedDate !== yesterdayStr) return false;
      if (dateFilter === 'CUSTOM' && customDate && t.archivedDate !== customDate) return false;
      if (dateFilter !== 'ALL' && dateFilter !== 'TODAY' && dateFilter !== 'YESTERDAY' && dateFilter !== 'CUSTOM') {
        if (t.archivedDate !== dateFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

      // Text search
      if (archivedSearch.trim()) {
        const q = archivedSearch.toLowerCase();
        const match =
          t.chamado.toLowerCase().includes(q) ||
          t.problema.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          t.responsavel.toLowerCase().includes(q) ||
          t.archivedBy.toLowerCase().includes(q) ||
          (t.archiveReason && t.archiveReason.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [archivedTickets, dateFilter, customDate, statusFilter, archivedSearch, todayStr, yesterdayStr]);

  // Export archived to CSV
  const handleExportCSV = () => {
    if (filteredArchived.length === 0) return;

    const headers = [
      'Chamado',
      'Prioridade',
      'Setor',
      'Problema',
      'Status',
      'Próxima Ação',
      'Responsável',
      'Data de Criação',
      'Data de Arquivamento',
      'Arquivado Por',
      'Motivo'
    ];

    const rows = filteredArchived.map(t => [
      t.chamado,
      t.prioridade,
      `"${(t.area || '').replace(/"/g, '""')}"`,
      `"${(t.problema || '').replace(/"/g, '""')}"`,
      t.status,
      `"${(t.proximaAcao || '').replace(/"/g, '""')}"`,
      `"${(t.responsavel || '').replace(/"/g, '""')}"`,
      new Date(t.createdAt).toLocaleString('pt-BR'),
      new Date(t.archivedAt).toLocaleString('pt-BR'),
      `"${(t.archivedBy || '').replace(/"/g, '""')}"`,
      `"${(t.archiveReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `chamados_arquivados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#D0E2E6] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header with Oswaldo Cruz Palette */}
        <div className="px-6 py-4 bg-linear-to-r from-[#08202A] to-[#0E3544] text-white flex items-center justify-between border-b-3 border-[#00A9B5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00A9B5] text-white rounded-xl flex items-center justify-center shadow-xs">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E5FF] bg-[#00A9B5]/20 px-2 py-0.5 rounded">
                  Repositório & Auditoria
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Histórico & Chamados Arquivados por Data
              </h2>
              <p className="text-xs text-[#94B8C2]">
                Consulte chamados limpos da planilha e fechamentos de plantão arquivados sem perda de dados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#D0E2E6] bg-[#F4F9FA] px-6 pt-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`pb-3 px-5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'archived'
                ? 'border-[#00A9B5] text-[#00828A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Chamados Arquivados por Data ({archivedTickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            className={`pb-3 px-5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'shifts'
                ? 'border-[#00A9B5] text-[#00828A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Plantões Encerrados & Relatórios ({shiftHistory.length})</span>
          </button>
        </div>

        {/* TAB 1: INDIVIDUAL ARCHIVED TICKETS BY DATE */}
        {activeTab === 'archived' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Filters Bar */}
            <div className="p-4 bg-[#F8FAFC] border-b border-[#D0E2E6] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={archivedSearch}
                    onChange={(e) => setArchivedSearch(e.target.value)}
                    placeholder="Buscar por código (T504...), setor, problema ou técnico..."
                    className="w-full bg-white border border-[#D0E2E6] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A9B5]/30 focus:border-[#00A9B5]"
                  />
                  {archivedSearch && (
                    <button
                      onClick={() => setArchivedSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Date Quick Filter */}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#00A9B5]" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-white border border-[#D0E2E6] text-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00A9B5]/30"
                  >
                    <option value="ALL">Todas as Datas ({archivedTickets.length})</option>
                    <option value="TODAY">Arquivados Hoje</option>
                    <option value="YESTERDAY">Arquivados Ontem</option>
                    {uniqueDates.map(d => (
                      <option key={d} value={d}>
                        Data: {new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-[#D0E2E6] text-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00A9B5]/30"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="Resolvido">Resolvidos</option>
                  <option value="Pendente">Pendentes</option>
                  <option value="Em Atendimento">Em Atendimento</option>
                  <option value="Aguardando Desenvolvimento">Aguardando Desenv.</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={filteredArchived.length === 0}
                  className="px-3 py-1.5 bg-white border border-[#D0E2E6] hover:bg-[#EBF6F7] text-[#00828A] rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#00A9B5]" />
                  <span>Exportar CSV ({filteredArchived.length})</span>
                </button>
              </div>
            </div>

            {/* Table of Archived Tickets */}
            <div className="flex-1 overflow-auto p-4">
              {filteredArchived.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#E6F8FA] text-[#00A9B5] flex items-center justify-center mx-auto">
                    <Archive className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">Nenhum chamado encontrado no arquivo</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Quando você limpa um chamado na planilha ativa através do botão <b>Arquivar</b>, ele fica armazenado permanentemente aqui com sua data e horário para consulta posterior.
                  </p>
                </div>
              ) : (
                <div className="border border-[#D0E2E6] rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#0E3544] text-white uppercase text-[11px] font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Chamado</th>
                        <th className="p-3">Prioridade</th>
                        <th className="p-3">Data Arquivado</th>
                        <th className="p-3">Setor / Local</th>
                        <th className="p-3">Problema Identificado</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Responsável</th>
                        <th className="p-3">Arquivado Por</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8F1F3]">
                      {filteredArchived.map((ticket) => {
                        const archDateFormatted = ticket.archivedAt 
                          ? new Date(ticket.archivedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                          : ticket.archivedDate;

                        return (
                          <tr 
                            key={ticket.id}
                            className="hover:bg-[#F4F9FA] transition"
                          >
                            <td className="p-3 font-mono font-bold text-[#08202A]">
                              {ticket.chamado}
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ticket.prioridade === 'P1'
                                  ? 'bg-rose-100 text-rose-800'
                                  : ticket.prioridade === 'P2'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-[#E6F8FA] text-[#007D87]'
                              }`}>
                                {ticket.prioridade}
                              </span>
                            </td>

                            <td className="p-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                              {archDateFormatted}
                            </td>

                            <td className="p-3 text-slate-800 font-medium">
                              {ticket.area}
                            </td>

                            <td className="p-3 text-slate-700 max-w-xs">
                              <p className="font-semibold text-slate-900">{ticket.problema}</p>
                              {ticket.proximaAcao && (
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  <span className="font-bold text-[#00828A]">Ação:</span> {ticket.proximaAcao}
                                </p>
                              )}
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ticket.status === 'Resolvido'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>

                            <td className="p-3 text-slate-700 whitespace-nowrap">
                              {ticket.responsavel}
                            </td>

                            <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                              <span className="font-medium text-slate-700">{ticket.archivedBy || 'Técnico'}</span>
                              {ticket.archiveReason && (
                                <span className="block text-[10px] text-slate-400">{ticket.archiveReason}</span>
                              )}
                            </td>

                            <td className="p-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Restaurar chamado ${ticket.chamado} de volta para a planilha ativa?`)) {
                                        restoreArchivedTicket(ticket.id);
                                      }
                                    }}
                                    title="Restaurar chamado para a planilha ativa"
                                    className="p-1.5 text-[#00828A] bg-[#E6F8FA] hover:bg-[#D4F3F7] rounded border border-[#B2EBF2] transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                  >
                                    <RotateCcw className="w-3 h-3 text-[#00A9B5]" />
                                    <span>Restaurar</span>
                                  </button>
                                )}

                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Excluir permanentemente o registro arquivado de ${ticket.chamado}?`)) {
                                        deleteArchivedTicketPermanently(ticket.id);
                                      }
                                    }}
                                    title="Excluir permanentemente do arquivo histórico"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SHIFT RECORDS / RELATÓRIOS ENVIADOS */}
        {activeTab === 'shifts' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Shift List */}
            <div className="w-80 border-r border-[#D0E2E6] overflow-y-auto p-4 space-y-2 bg-[#F8FAFC]">
              <p className="text-[10px] uppercase font-bold text-[#587982] px-2 mb-2 tracking-wider">
                Plantões Fechados ({shiftHistory.length})
              </p>

              {shiftHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Nenhum plantão encerrado no histórico ainda.
                </div>
              ) : (
                shiftHistory.map((shift) => {
                  const isSelected = selectedShift?.id === shift.id;
                  const formattedDate = new Date(shift.date).toLocaleDateString('pt-BR');

                  return (
                    <div
                      key={shift.id}
                      onClick={() => setSelectedShift(shift)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#E6F8FA] border-[#00A9B5] shadow-xs'
                          : 'bg-white border-[#D0E2E6] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#08202A] truncate">
                          {shift.shiftName}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00A9B5]' : 'text-slate-400'}`} />
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-700 font-bold">{shift.resolvedCount} resolvidos</span>
                        <span className="text-amber-700 font-bold">{shift.pendingCount} pendências</span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">{shift.totalTickets} total</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Shift Details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
              {selectedShift ? (
                <>
                  <div className="bg-[#F4F9FA] p-4 rounded-xl border border-[#D0E2E6] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#08202A]">{selectedShift.shiftName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Encerrado por <b>{selectedShift.closedBy}</b></span>
                          <span>•</span>
                          <span>{new Date(selectedShift.endedAt).toLocaleString('pt-BR')}</span>
                        </p>
                      </div>

                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                        Arquivado & Enviado
                      </span>
                    </div>

                    {selectedShift.summaryNotes && (
                      <div className="bg-white p-3 rounded-lg border border-[#D0E2E6] text-xs text-slate-700">
                        <p className="font-bold text-[#08202A] mb-1">Observações da Passagem de Turno:</p>
                        <p>{selectedShift.summaryNotes}</p>
                      </div>
                    )}

                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-800">E-mails notificados: </span>
                      <span>{selectedShift.sentToEmails.join(', ') || 'Nenhum'}</span>
                    </div>
                  </div>

                  {/* Tickets Snapshot */}
                  <div>
                    <h4 className="text-xs font-bold text-[#08202A] uppercase tracking-wider mb-2.5">
                      Snapshot dos Chamados do Turno ({selectedShift.ticketsSnapshot.length})
                    </h4>

                    <div className="border border-[#D0E2E6] rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#0E3544] text-white border-b border-[#D0E2E6] text-[11px] font-bold uppercase">
                          <tr>
                            <th className="p-2.5">Chamado</th>
                            <th className="p-2.5">Prioridade</th>
                            <th className="p-2.5">Área</th>
                            <th className="p-2.5">Problema</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Responsável</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8F1F3]">
                          {selectedShift.ticketsSnapshot.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/60">
                              <td className="p-2.5 font-mono font-bold text-[#08202A]">{t.chamado}</td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {t.prioridade}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-700">{t.area}</td>
                              <td className="p-2.5 text-slate-800 font-medium">{t.problema}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.status === 'Resolvido'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {t.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-700">{t.responsavel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Selecione um plantão ao lado para visualizar os detalhes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F4F9FA] border-t border-[#D0E2E6] flex items-center justify-between text-xs text-[#587982]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00A9B5]"></span>
            <span>Repositório de dados com salvamento automático e replicação em tempo real</span>
          </div>

          <button
            onClick={onClose}
            className="bg-[#08202A] hover:bg-[#0E3544] text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow-xs uppercase tracking-wider"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

