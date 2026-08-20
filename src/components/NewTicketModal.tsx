import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Sparkles, 
  MapPin, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Hash, 
  Tag, 
  RefreshCw,
  Zap,
  CornerDownLeft
} from 'lucide-react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { Priority, TicketStatus, Ticket } from '../types';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: TicketStatus;
}

const PRIORITIES: { id: Priority; label: string; sub: string; color: string; border: string; bgActive: string }[] = [
  { 
    id: 'P1', 
    label: 'P1 - Crítica', 
    sub: 'Impacto Assistencial Direto', 
    color: 'text-red-700', 
    border: 'border-red-300', 
    bgActive: 'bg-red-50 ring-2 ring-red-500' 
  },
  { 
    id: 'P2', 
    label: 'P2 - Alta', 
    sub: 'Urgente / Sem Parada Total', 
    color: 'text-orange-700', 
    border: 'border-orange-300', 
    bgActive: 'bg-orange-50 ring-2 ring-orange-500' 
  },
  { 
    id: 'P3', 
    label: 'P3 - Média', 
    sub: 'Atendimento Padrão', 
    color: 'text-amber-700', 
    border: 'border-amber-300', 
    bgActive: 'bg-amber-50 ring-2 ring-amber-500' 
  },
  { 
    id: 'P4', 
    label: 'P4 - Baixa', 
    sub: 'Rotina / Sem Urgência', 
    color: 'text-emerald-700', 
    border: 'border-emerald-300', 
    bgActive: 'bg-emerald-50 ring-2 ring-emerald-500' 
  },
];

const STATUS_OPTIONS: { id: TicketStatus; label: string; badgeColor: string }[] = [
  { id: 'Pendente', label: 'Pendente', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'Em Atendimento', label: 'Em Atendimento', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'Aguardando Desenvolvimento', label: 'Aguardando Desenv.', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'Resolvido', label: 'Resolvido', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'Impedimento', label: 'Impedimento', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
];

const QUICK_PROBLEMS = [
  'Zebra / Impressora não imprime pulseira',
  'Substituição de mouse / teclado danificado',
  'Lentidão no Prontuário Eletrônico / Sistema',
  'Ponto de rede sem conexão / Cabo desconectado',
  'Configuração de leitor de código de barras',
  'Troca de toner / abastecimento de papel'
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ 
  isOpen, 
  onClose,
  initialStatus = 'Pendente'
}) => {
  const { areas, responsibles, addTicket, addArea, addResponsible } = useSheet();
  const { currentUser } = useAuth();

  const generateTicketNumber = () => {
    const prefix = Math.random() > 0.35 ? 'T' : 'R';
    const num = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${num}`;
  };

  const [chamado, setChamado] = useState(generateTicketNumber());
  const [prioridade, setPrioridade] = useState<Priority>('P3');
  const [area, setArea] = useState(areas[0] || 'Pronto Atendimento');
  const [customArea, setCustomArea] = useState('');
  const [problema, setProblema] = useState('');
  const [status, setStatus] = useState<TicketStatus>(initialStatus);
  const [responsavel, setResponsavel] = useState(currentUser?.name || responsibles[0] || 'Wagner Marcelino');
  const [customResponsavel, setCustomResponsavel] = useState('');
  const [proximaAcao, setProximaAcao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Reset values on open
  useEffect(() => {
    if (isOpen) {
      setChamado(generateTicketNumber());
      setPrioridade('P3');
      setArea(areas[0] || 'Pronto Atendimento');
      setCustomArea('');
      setProblema('');
      setStatus(initialStatus);
      setResponsavel(currentUser?.name || responsibles[0] || 'Wagner Marcelino');
      setCustomResponsavel('');
      setProximaAcao('');
      setObservacoes('');
      setShowSuccessToast(false);
    }
  }, [isOpen, initialStatus, currentUser, areas, responsibles]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRegenerateCode = () => {
    setChamado(generateTicketNumber());
  };

  const handleSubmit = (e?: React.FormEvent, keepOpen = false) => {
    if (e) e.preventDefault();

    if (!problema.trim()) {
      alert('Por favor, descreva o problema ou incidente do chamado.');
      return;
    }

    const finalArea = area === '__custom__' && customArea.trim() 
      ? customArea.trim() 
      : area;

    const finalResponsavel = responsavel === '__custom__' && customResponsavel.trim()
      ? customResponsavel.trim()
      : responsavel;

    // Save custom area/responsible if needed
    if (area === '__custom__' && customArea.trim()) {
      addArea(customArea.trim());
    }
    if (responsavel === '__custom__' && customResponsavel.trim()) {
      addResponsible(customResponsavel.trim());
    }

    // Insert ticket into context
    addTicket({
      chamado: chamado.trim().toUpperCase() || generateTicketNumber(),
      prioridade,
      area: finalArea,
      problema: problema.trim(),
      status,
      responsavel: finalResponsavel,
      proximaAcao: proximaAcao.trim(),
      observacoes: observacoes.trim()
    });

    if (keepOpen) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2000);
      // Reset for next
      setChamado(generateTicketNumber());
      setProblema('');
      setProximaAcao('');
      setObservacoes('');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#D0E2E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00A9B5] text-white rounded-xl flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Inserir Novo Chamado de Plantão</span>
                {showSuccessToast && (
                  <span className="text-xs bg-[#E6F8FA] text-[#007D87] font-bold px-2 py-0.5 rounded-full border border-[#B2EBF2] animate-bounce">
                    ✓ Inserido com sucesso!
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Preencha os dados do chamado para sincronização imediata na planilha colaborativa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form 
          id="new-ticket-form" 
          onSubmit={(e) => handleSubmit(e, false)}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Row 1: Número do Chamado & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#00A9B5]" />
                  <span>Código / Nº do Chamado</span>
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="text-[11px] text-[#00828A] hover:text-[#005B61] font-bold flex items-center gap-1 cursor-pointer"
                  title="Gerar código aleatório"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Gerar novo</span>
                </button>
              </label>
              <input
                type="text"
                value={chamado}
                onChange={(e) => setChamado(e.target.value.toUpperCase())}
                placeholder="Ex: T504789, R119020..."
                required
                className="w-full bg-[#F4F9FA] border border-[#D0E2E6] rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A9B5]/20 focus:border-[#00A9B5] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00A9B5]" />
                <span>Status Inicial</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full bg-white border border-[#D0E2E6] rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A9B5]/20 focus:border-[#00A9B5] transition"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Prioridade (Cards) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Nível de Prioridade (SLA)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRIORITIES.map((p) => {
                const isSelected = prioridade === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPrioridade(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected 
                        ? `${p.bgActive} ${p.border}` 
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-xs font-bold ${p.color}`}>
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      {p.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Área / Setor & Técnico Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Área / Setor Hospitalar</span>
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition mb-2"
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
                <option value="__custom__">+ Outro setor (digitar novo)...</option>
              </select>

              {area === '__custom__' && (
                <input
                  type="text"
                  placeholder="Nome do novo setor..."
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Técnico Responsável</span>
              </label>
              <select
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition mb-2"
              >
                {responsibles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="__custom__">+ Outro plantonista (digitar)...</option>
              </select>

              {responsavel === '__custom__' && (
                <input
                  type="text"
                  placeholder="Nome do novo responsável..."
                  value={customResponsavel}
                  onChange={(e) => setCustomResponsavel(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-indigo-50/50 border border-indigo-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Row 4: Descrição do Problema */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span>Descrição do Incidente / Problema</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              placeholder="Ex: Zebra Pulseiras - Impressora offline travando fila no Pronto Atendimento..."
              required
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
            />

            {/* Quick incident templates */}
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Sugestões rápidas:
              </span>
              {QUICK_PROBLEMS.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProblema(item)}
                  className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Próxima Ação & Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Próxima Ação / Resolução Prevista
              </label>
              <input
                type="text"
                value={proximaAcao}
                onChange={(e) => setProximaAcao(e.target.value)}
                placeholder="Ex: Posicionar sensor, reiniciar spooler..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Observações Adicionais / Ramal / Solicitante
              </label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Ramal 2301, falar com Enfª Simone"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 bg-[#F4F9FA] border-t border-[#D0E2E6] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Pressione <b>Enter</b> para salvar ou <b>Esc</b> para fechar</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(undefined, true)}
              className="px-3.5 py-2 text-xs font-bold text-[#00828A] bg-[#E6F8FA] hover:bg-[#D4F3F7] border border-[#B2EBF2] rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Salvar e Adicionar Outro</span>
            </button>

            <button
              type="submit"
              form="new-ticket-form"
              className="px-4 py-2 text-xs font-bold text-white bg-[#00A9B5] hover:bg-[#00929D] border border-[#00929D] rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-98 uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Inserir Chamado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
