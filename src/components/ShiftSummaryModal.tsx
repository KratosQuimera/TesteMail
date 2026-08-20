import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Copy, 
  Check, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle2, 
  Share2, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { formatShiftReport, buildMailtoUrl, sendEmailDirectly } from '../services/emailService';

interface ShiftSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({ isOpen, onClose }) => {
  const { tickets, emailSettings, closeShiftAndArchive, auditLogs } = useSheet();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'send' | 'preview' | 'whatsapp'>('send');
  const [recipients, setRecipients] = useState<string[]>(emailSettings.defaultRecipients);
  const [newRecipient, setNewRecipient] = useState('');
  const [shiftTitle, setShiftTitle] = useState(`Plantão TI - ${new Date().toLocaleDateString('pt-BR')}`);
  const [customNotes, setCustomNotes] = useState('');
  const [carryOverPending, setCarryOverPending] = useState(true);

  // Status of actions
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const report = formatShiftReport(
    tickets,
    emailSettings,
    currentUser.name,
    shiftTitle,
    customNotes
  );

  const handleToggleRecipient = (email: string) => {
    if (recipients.includes(email)) {
      setRecipients(recipients.filter(e => e !== email));
    } else {
      setRecipients([...recipients, email]);
    }
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient('');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(report.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(report.html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleOpenMailClient = () => {
    const mailto = buildMailtoUrl(recipients, emailSettings.ccRecipients, report.subject, report.text);
    window.location.href = mailto;
  };

  const handleSendConsolidatedEmail = async () => {
    if (recipients.length === 0) {
      alert('Por favor, selecione pelo menos um destinatário de e-mail.');
      return;
    }

    setIsSending(true);
    setSendSuccess(null);

    try {
      await sendEmailDirectly({
        to: recipients,
        cc: emailSettings.ccRecipients,
        subject: report.subject,
        html: report.html,
        text: report.text,
        senderName: currentUser.name
      });

      setIsSending(false);
      setSendSuccess(`E-mail consolidado enviado com sucesso para ${recipients.length} destinatários!`);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err) {
      setIsSending(false);
      alert('Ocorreu um erro ao enviar o e-mail. Você pode copiar o relatório ou abrir no seu cliente padrão.');
    }
  };

  const handleFinishAndArchive = () => {
    if (confirm('Deseja fechar o turno atual e salvar no histórico? Chamados pendentes serão transferidos para o próximo plantão.')) {
      closeShiftAndArchive(shiftTitle, customNotes, recipients, carryOverPending);
      
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch (e) {}

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Resumo Consolidado de Plantão & Envio de E-mail
              </h2>
              <p className="text-xs text-slate-500">
                Gere e dispare o relatório de fechamento de turno para a equipe e liderança
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

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('send')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'send'
                ? 'border-[#00A9B5] text-[#00828A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Disparo & Destinatários</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'preview'
                ? 'border-[#00A9B5] text-[#00828A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pré-visualização do E-mail (HTML)</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-[#00A9B5] text-[#00828A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Texto Rápido / WhatsApp</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-500">Total do Turno</span>
              <p className="text-2xl font-black text-slate-900">{report.stats.total}</p>
            </div>
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
              <span className="text-[11px] uppercase font-bold text-emerald-700">Resolvidos</span>
              <p className="text-2xl font-black text-emerald-700">{report.stats.resolved}</p>
            </div>
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
              <span className="text-[11px] uppercase font-bold text-blue-700">Em Atendimento</span>
              <p className="text-2xl font-black text-blue-700">{report.stats.inProgress}</p>
            </div>
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
              <span className="text-[11px] uppercase font-bold text-amber-700">Pendências</span>
              <p className="text-2xl font-black text-amber-700">{report.stats.pending + report.stats.waiting}</p>
            </div>
          </div>

          {/* High priority pending alert */}
          {report.stats.criticalPending > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900 text-sm">
                  Atenção: Há {report.stats.criticalPending} chamado(s) de alta prioridade (P1/P2) pendente(s)
                </p>
                <p className="text-xs text-red-700">
                  Estes itens estão destacados no topo do relatório para a equipe entrante.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: SEND & RECIPIENTS */}
          {activeTab === 'send' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Título / Identificação do Plantão
                  </label>
                  <input
                    type="text"
                    value={shiftTitle}
                    onChange={(e) => setShiftTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plantonista Responsável pelo Fechamento
                  </label>
                  <input
                    type="text"
                    value={currentUser.name}
                    disabled
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600"
                  />
                </div>
              </div>

              {/* Handover Observations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Gerais da Passagem de Turno (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Ex: Plantão calmo. Sensor da sala 3 calibrado. Switch da UTI reiniciado com sucesso."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Recipients Config */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Destinatários Pré-definidos ({recipients.length} selecionados)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    CC: {emailSettings.ccRecipients.join(', ') || 'Nenhum'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {emailSettings.defaultRecipients.map((email) => {
                    const isSelected = recipients.includes(email);
                    return (
                      <button
                        key={email}
                        type="button"
                        onClick={() => handleToggleRecipient(email)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-indigo-600 text-white font-bold' : 'border border-slate-400'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                        <span>{email}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleAddRecipient} className="flex gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="email"
                    placeholder="Adicionar outro e-mail para este envio..."
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    + Adicionar
                  </button>
                </form>
              </div>

              {/* Carry over toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={carryOverPending}
                  onChange={(e) => setCarryOverPending(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900">
                    Transferir automaticamente chamados pendentes para a planilha do próximo plantão
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Os chamados resolvidos serão arquivados no histórico e os pendentes permanecerão ativos para a próxima equipe.
                  </p>
                </div>
              </label>

              {/* Success Notification Alert */}
              {sendSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-emerald-950">Disparo Concluído!</p>
                      <p className="text-xs text-emerald-700">{sendSuccess}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSendSuccess(null)}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HTML PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Esta é a visualização exata que os destinatários receberão na caixa de entrada:</span>
                <button
                  onClick={handleCopyHtml}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 shadow-xs transition"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtml ? 'HTML Copiado!' : 'Copiar Código HTML'}</span>
                </button>
              </div>

              <div className="bg-white rounded-xl overflow-hidden shadow-inner border border-slate-300 max-h-[420px] overflow-y-auto">
                <iframe
                  title="Email Preview"
                  srcDoc={report.html}
                  className="w-full h-[400px] border-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP / TEXT FORMAT */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Formato otimizado com emojis para envio rápido no WhatsApp ou Telegram da equipe:</span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed">
                {report.text}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenMailClient}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 shadow-xs transition"
            >
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Abrir no E-mail Padrão</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 shadow-xs transition"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>{copiedText ? 'Copiado!' : 'Copiar Resumo'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Fechar
            </button>

            <button
              onClick={handleSendConsolidatedEmail}
              disabled={isSending || recipients.length === 0}
              className="flex items-center gap-2 bg-[#00A9B5] hover:bg-[#00929D] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Enviando E-mail...' : 'Disparar E-mail Consolidado'}</span>
            </button>

            <button
              onClick={handleFinishAndArchive}
              className="flex items-center gap-2 bg-[#08202A] hover:bg-[#0E3544] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <span>Encerrar & Salvar Plantão</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
