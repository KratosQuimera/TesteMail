import React from 'react';
import { useSheet } from '../context/SheetContext';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Activity, 
  Layers, 
  TrendingUp,
  Send,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onOpenSummaryModal?: () => void;
  onOpenNewTicketModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onOpenSummaryModal,
  onOpenNewTicketModal
}) => {
  const { tickets, responsibles, areas, addTicket } = useSheet();
  const { canEdit, canSendReport } = useAuth();

  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'Resolvido');
  const inProgress = tickets.filter(t => t.status === 'Em Atendimento');
  const pending = tickets.filter(t => t.status === 'Pendente');
  const waiting = tickets.filter(t => t.status === 'Aguardando Desenvolvimento');
  const critical = tickets.filter(t => (t.prioridade === 'P1' || t.prioridade === 'P2') && t.status !== 'Resolvido');

  const resolutionRate = total > 0 ? Math.round((resolved.length / total) * 100) : 0;

  // Breakdown by priority
  const p1 = tickets.filter(t => t.prioridade === 'P1').length;
  const p2 = tickets.filter(t => t.prioridade === 'P2').length;
  const p3 = tickets.filter(t => t.prioridade === 'P3').length;
  const p4 = tickets.filter(t => t.prioridade === 'P4').length;

  // Breakdown by technician
  const techStats = responsibles.map(resp => {
    const userTickets = tickets.filter(t => t.responsavel === resp);
    const userResolved = userTickets.filter(t => t.status === 'Resolvido').length;
    return {
      name: resp,
      total: userTickets.length,
      resolved: userResolved,
      pending: userTickets.length - userResolved
    };
  }).filter(t => t.total > 0).sort((a, b) => b.total - a.total);

  // Breakdown by area
  const areaStats = areas.map(area => {
    const areaTickets = tickets.filter(t => t.area === area);
    return {
      name: area,
      total: areaTickets.length,
      resolved: areaTickets.filter(t => t.status === 'Resolvido').length
    };
  }).filter(a => a.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F8FA]">
      {/* Top Banner */}
      <div className="px-6 pt-5 pb-4 flex flex-wrap justify-between items-end shrink-0 gap-4">
        <div>
          <nav className="text-xs text-[#00828A] font-bold mb-1 uppercase tracking-wider">
            DASHBOARD / MÉTRICAS OPERACIONAIS
          </nav>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Painel Executivo & Indicadores do Turno
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

      <div className="px-6 pb-6 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Chamados</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{total}</h3>
              <p className="text-xs text-slate-400 mt-1">Registrados neste plantão</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Taxa de Resolução</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{resolutionRate}%</h3>
              <p className="text-xs text-slate-400 mt-1">{resolved.length} chamados finalizados</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Em Atendimento</p>
              <h3 className="text-3xl font-black text-blue-600 mt-1">{inProgress.length}</h3>
              <p className="text-xs text-slate-400 mt-1">Sendo trabalhados agora</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Críticos Pendentes</p>
              <h3 className="text-3xl font-black text-red-600 mt-1">{critical.length}</h3>
              <p className="text-xs text-red-500 font-semibold mt-1">P1 e P2 não resolvidos</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Distribuição por Status</span>
            </h4>

            <div className="space-y-3.5 pt-1">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Resolvido</span>
                  <span>{resolved.length} ({total > 0 ? Math.round((resolved.length/total)*100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (resolved.length/total)*100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Em Atendimento</span>
                  <span>{inProgress.length} ({total > 0 ? Math.round((inProgress.length/total)*100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (inProgress.length/total)*100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Pendente</span>
                  <span>{pending.length} ({total > 0 ? Math.round((pending.length/total)*100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (pending.length/total)*100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Aguardando Desenvolvimento</span>
                  <span>{waiting.length} ({total > 0 ? Math.round((waiting.length/total)*100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (waiting.length/total)*100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Priority Matrix */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Volume por Prioridade</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-red-50/70 p-3.5 rounded-lg border border-red-200">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">P1 - Crítica</span>
                <p className="text-2xl font-black text-red-700 mt-2">{p1}</p>
                <p className="text-[11px] text-red-600">Parada total / Bloqueio</p>
              </div>

              <div className="bg-orange-50/70 p-3.5 rounded-lg border border-orange-200">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">P2 - Alta</span>
                <p className="text-2xl font-black text-orange-700 mt-2">{p2}</p>
                <p className="text-[11px] text-orange-600">Setor crítico parcial</p>
              </div>

              <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-200">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300">P3 - Média</span>
                <p className="text-2xl font-black text-amber-700 mt-2">{p3}</p>
                <p className="text-[11px] text-amber-600">Incidentes pontuais</p>
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">P4 - Baixa</span>
                <p className="text-2xl font-black text-emerald-700 mt-2">{p4}</p>
                <p className="text-[11px] text-emerald-600">Melhorias / Ajustes</p>
              </div>
            </div>
          </div>

          {/* Breakdown by Technician */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Chamados por Responsável Técnico</span>
            </h4>

            <div className="space-y-2.5">
              {techStats.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum chamado atribuído</p>
              ) : (
                techStats.map(t => (
                  <div key={t.name} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[9px] flex items-center justify-center font-bold">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-600 font-bold">{t.resolved} resolvidos</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-600 font-bold">{t.pending} pendentes</span>
                      <span className="text-slate-300">•</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{t.total} total</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Incident Areas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Áreas com Mais Chamados no Turno</span>
            </h4>

            <div className="space-y-2.5">
              {areaStats.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma área registrada</p>
              ) : (
                areaStats.slice(0, 6).map(a => (
                  <div key={a.name} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-medium text-slate-800 truncate">{a.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                        {a.total} chamado(s)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
