import React from 'react';
import { Ticket, TicketStatus, Priority } from '../types';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User as UserIcon, 
  MapPin, 
  ArrowRight,
  Send,
  Plus,
  Archive
} from 'lucide-react';

interface KanbanViewProps {
  onOpenSummaryModal?: () => void;
  onOpenNewTicketModal?: (status?: TicketStatus) => void;
}

const COLUMNS: { status: TicketStatus; label: string; headerColor: string; countBadge: string }[] = [
  { status: 'Pendente', label: 'Pendente', headerColor: 'text-amber-700 bg-amber-50 border-amber-200', countBadge: 'bg-amber-200 text-amber-800' },
  { status: 'Em Atendimento', label: 'Em Atendimento', headerColor: 'text-blue-700 bg-blue-50 border-blue-200', countBadge: 'bg-blue-200 text-blue-800' },
  { status: 'Aguardando Desenvolvimento', label: 'Aguardando Desenv.', headerColor: 'text-purple-700 bg-purple-50 border-purple-200', countBadge: 'bg-purple-200 text-purple-800' },
  { status: 'Resolvido', label: 'Concluído / Resolvido', headerColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', countBadge: 'bg-emerald-200 text-emerald-800' }
];

export const KanbanView: React.FC<KanbanViewProps> = ({ 
  onOpenSummaryModal,
  onOpenNewTicketModal 
}) => {
  const { 
    tickets, 
    updateCell, 
    addTicket, 
    archiveTicket,
    archiveResolvedTickets,
    searchQuery, 
    priorityFilter 
  } = useSheet();
  const { canEdit, canSendReport } = useAuth();

  const filteredTickets = tickets.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        t.chamado.toLowerCase().includes(q) ||
        t.problema.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        t.responsavel.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (priorityFilter !== 'ALL' && t.prioridade !== priorityFilter) return false;
    return true;
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'P1': return 'bg-red-100 text-red-700 border border-red-200';
      case 'P2': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'P3': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'P4': return 'bg-[#E6F8FA] text-[#007D87] border border-[#B2EBF2]';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F0F8FA]">
      {/* Top Banner */}
      <div className="px-6 pt-5 pb-4 flex flex-wrap justify-between items-end shrink-0 gap-4">
        <div>
          <nav className="text-xs text-[#00828A] font-bold mb-1 uppercase tracking-wider">
            DASHBOARD / QUADRO KANBAN
          </nav>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Fluxo Visual de Chamados do Turno
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <button
              onClick={() => onOpenNewTicketModal ? onOpenNewTicketModal() : addTicket()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#00A9B5] hover:bg-[#00929D] border border-[#00929D] rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Novo Chamado</span>
            </button>
          )}

          {canSendReport && onOpenSummaryModal && (
            <button
              onClick={onOpenSummaryModal}
              className="px-4 py-2 text-xs font-bold text-[#0A4252] bg-white border border-[#C6DFE4] hover:bg-[#EBF6F7] rounded-lg shadow-xs flex items-center gap-2 transition active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <Send className="w-3.5 h-3.5 text-[#00A9B5]" />
              <span>Finalizar e Enviar Resumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <div className="flex gap-5 min-w-[1000px] h-full items-start">
          {COLUMNS.map(col => {
            const colTickets = filteredTickets.filter(t => t.status === col.status);

            return (
              <div 
                key={col.status} 
                className="flex-1 bg-slate-100/90 rounded-xl border border-slate-200 flex flex-col max-h-[calc(100vh-175px)] shadow-xs overflow-hidden"
              >
                {/* Column Header */}
                <div className={`px-4 py-3 border-b flex items-center justify-between font-bold text-xs ${col.headerColor}`}>
                  <span className="uppercase tracking-wider">{col.label}</span>
                  <div className="flex items-center gap-1.5">
                    {/* Quick Archive resolved column */}
                    {canEdit && col.status === 'Resolvido' && colTickets.length > 0 && (
                      <button
                        type="button"
                        onClick={() => archiveResolvedTickets()}
                        title="Limpar e arquivar todos os chamados concluídos desta coluna (armazenados por data)"
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <Archive className="w-2.5 h-2.5" />
                        <span>Arquivar ({colTickets.length})</span>
                      </button>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenNewTicketModal ? onOpenNewTicketModal(col.status) : addTicket({ status: col.status })}
                        title={`Adicionar chamado com status ${col.label}`}
                        className="p-1 hover:bg-black/10 rounded transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${col.countBadge}`}>
                      {colTickets.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1">
                  {colTickets.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400 font-medium">
                      Nenhum chamado nesta coluna
                    </div>
                  ) : (
                    colTickets.map(ticket => (
                      <div 
                        key={ticket.id}
                        className="bg-white p-3.5 rounded-lg shadow-xs border border-slate-200 hover:shadow-md transition text-xs space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm font-mono tracking-tight">
                            {ticket.chamado}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityBadge(ticket.prioridade)}`}>
                            {ticket.prioridade}
                          </span>
                        </div>

                        <p className="font-semibold text-slate-800 text-xs line-clamp-2">
                          {ticket.problema || 'Sem descrição do problema'}
                        </p>

                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{ticket.area}</span>
                        </div>

                        {ticket.proximaAcao && (
                          <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100 text-[11px] text-slate-700">
                            <span className="font-semibold text-indigo-700">Ação: </span>
                            {ticket.proximaAcao}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[9px] flex items-center justify-center font-bold">
                              {ticket.responsavel.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate">{ticket.responsavel}</span>
                          </div>

                          {canEdit && (
                            <div className="flex items-center gap-1.5">
                              {/* Individual archive button */}
                              <button
                                type="button"
                                onClick={() => archiveTicket(ticket.id, ticket.status === 'Resolvido' ? 'Resolvido no Plantão' : 'Limpeza Individual')}
                                title="Limpar este chamado da tela e arquivá-lo no histórico desta data"
                                className="text-slate-500 hover:text-[#00828A] bg-slate-50 hover:bg-[#E6F8FA] border border-slate-200 hover:border-[#B2EBF2] px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                              >
                                <Archive className="w-3 h-3 text-[#00A9B5]" />
                                <span>{ticket.status === 'Resolvido' ? 'Limpar' : 'Arquivar'}</span>
                              </button>

                              {col.status !== 'Resolvido' && (
                                <button
                                  onClick={() => updateCell(ticket.id, 'status', 'Resolvido')}
                                  title="Resolver chamado"
                                  className="text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-1 rounded transition cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                </button>
                              )}
                              {col.status === 'Pendente' && (
                                <button
                                  onClick={() => updateCell(ticket.id, 'status', 'Em Atendimento')}
                                  title="Iniciar atendimento"
                                  className="text-slate-500 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 p-1 rounded transition cursor-pointer"
                                >
                                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
