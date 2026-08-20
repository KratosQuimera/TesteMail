import React from 'react';
import { 
  X, 
  Clock, 
  History, 
  User, 
  ArrowRight, 
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { useSheet } from '../context/SheetContext';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useSheet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 text-white rounded-lg flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Trilha de Auditoria & Modificações em Tempo Real
              </h2>
              <p className="text-xs text-slate-500">
                Histórico cronológico de cada célula e valor alterado colaborativamente pelos plantonistas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Total de <b>{auditLogs.length}</b> ações registradas na sessão ativa</span>
            <span>Atualização automática e instantânea</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhuma alteração registrada ainda nesta sessão de plantão.
            </div>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start justify-between gap-4 text-xs hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {log.userName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{log.userName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-indigo-100">
                          {log.chamado}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium capitalize">
                          campo <strong>{log.field}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] pt-1">
                        <span className="text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 line-through">
                          {log.oldValue || '(vazio)'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {log.newValue || '(vazio)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] text-slate-400">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
