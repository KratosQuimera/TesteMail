import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Mail, 
  Plus, 
  Trash2, 
  Building2, 
  Check, 
  Users2, 
  MapPin,
  Download,
  FolderArchive,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { EmailSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    emailSettings, 
    updateEmailSettings, 
    areas, 
    addArea, 
    removeArea, 
    responsibles, 
    addResponsible, 
    removeResponsible 
  } = useSheet();
  const { canConfigure } = useAuth();

  const [activeTab, setActiveTab] = useState<'emails' | 'lists' | 'general'>('emails');
  const [localSettings, setLocalSettings] = useState<EmailSettings>({ ...emailSettings });
  
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [newCcInput, setNewCcInput] = useState('');
  const [newAreaInput, setNewAreaInput] = useState('');
  const [newRespInput, setNewRespInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddDefaultRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecipientInput.trim() && !localSettings.defaultRecipients.includes(newRecipientInput.trim())) {
      setLocalSettings({
        ...localSettings,
        defaultRecipients: [...localSettings.defaultRecipients, newRecipientInput.trim()]
      });
      setNewRecipientInput('');
    }
  };

  const handleRemoveDefaultRecipient = (email: string) => {
    setLocalSettings({
      ...localSettings,
      defaultRecipients: localSettings.defaultRecipients.filter(e => e !== email)
    });
  };

  const handleAddCc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCcInput.trim() && !localSettings.ccRecipients.includes(newCcInput.trim())) {
      setLocalSettings({
        ...localSettings,
        ccRecipients: [...localSettings.ccRecipients, newCcInput.trim()]
      });
      setNewCcInput('');
    }
  };

  const handleRemoveCc = (email: string) => {
    setLocalSettings({
      ...localSettings,
      ccRecipients: localSettings.ccRecipients.filter(e => e !== email)
    });
  };

  const handleSaveSettings = () => {
    updateEmailSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Configurações da Planilha & Automação de E-mails
              </h2>
              <p className="text-xs text-slate-500">
                Gerencie os destinatários automáticos, listas de setores e dados da unidade
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('emails')}
            className={`pb-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'emails'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Destinatários de E-mail</span>
          </button>

          <button
            onClick={() => setActiveTab('lists')}
            className={`pb-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'lists'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Listas (Técnicos & Áreas)</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Identificação da Unidade</span>
          </button>

          <button
            onClick={() => setActiveTab('download' as any)}
            className={`pb-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition ${
              (activeTab as string) === 'download'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-[#00828A] font-bold hover:text-[#005B61]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Projeto (.ZIP)</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: EMAILS */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              {/* Default Recipients */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Destinatários Principais (Para:)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Estes e-mails virão marcados por padrão quando qualquer técnico clicar em &quot;Finalizar &amp; Enviar Resumo&quot;
                  </p>
                </div>

                <div className="space-y-2">
                  {localSettings.defaultRecipients.map(email => (
                    <div key={email} className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs">
                      <span className="font-mono font-medium text-slate-800">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDefaultRecipient(email)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddDefaultRecipient} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Adicionar e-mail (ex: lideranca@hospitalti.com)"
                    value={newRecipientInput}
                    onChange={(e) => setNewRecipientInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    + Adicionar
                  </button>
                </form>
              </div>

              {/* CC Recipients */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Cópia Oculta / Cópia (CC:)
                </h4>
                <div className="space-y-2">
                  {localSettings.ccRecipients.map(email => (
                    <div key={email} className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs">
                      <span className="font-mono font-medium text-slate-800">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCc(email)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddCc} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Adicionar e-mail em cópia (ex: gerencia@hospitalti.com)"
                    value={newCcInput}
                    onChange={(e) => setNewCcInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    + Adicionar
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: LISTS */}
          {activeTab === 'lists' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Responsibles List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Opções de Responsáveis ({responsibles.length})</span>
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {responsibles.map(r => (
                    <div key={r} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                      <span className="font-medium text-slate-800">{r}</span>
                      {responsibles.length > 1 && (
                        <button
                          onClick={() => removeResponsible(r)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (newRespInput.trim()) {
                    addResponsible(newRespInput.trim());
                    setNewRespInput('');
                  }
                }} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Novo responsável..."
                    value={newRespInput}
                    onChange={(e) => setNewRespInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-xs">
                    +
                  </button>
                </form>
              </div>

              {/* Areas List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Opções de Áreas / Setores ({areas.length})</span>
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {areas.map(a => (
                    <div key={a} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                      <span className="font-medium text-slate-800">{a}</span>
                      {areas.length > 1 && (
                        <button
                          onClick={() => removeArea(a)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (newAreaInput.trim()) {
                    addArea(newAreaInput.trim());
                    setNewAreaInput('');
                  }
                }} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova área / setor..."
                    value={newAreaInput}
                    onChange={(e) => setNewAreaInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs">
                    +
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Unidade / Empresa / Hospital
                </label>
                <input
                  type="text"
                  value={localSettings.hospitalUnit}
                  onChange={(e) => setLocalSettings({ ...localSettings, hospitalUnit: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assunto Padrão do E-mail de Plantão
                </label>
                <input
                  type="text"
                  value={localSettings.emailSubjectTemplate}
                  onChange={(e) => setLocalSettings({ ...localSettings, emailSubjectTemplate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: DOWNLOAD PROJECT (.ZIP) */}
          {(activeTab as string) === 'download' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-5 bg-gradient-to-br from-[#E6F8FA] to-white border border-[#B2EBF2] rounded-xl flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-[#00A9B5] text-white rounded-xl shadow-xs">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Pacote Completo do Código Fonte (.ZIP)
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Faça o download do arquivo compactado pronto com todos os componentes React, TypeScript, Tailwind CSS, configurações de build (Vite) e ícones para você hospedar no seu servidor ou testar localmente.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="/plantao-ti-oswaldo-cruz.zip"
                      download="plantao-ti-oswaldo-cruz.zip"
                      className="bg-[#00A9B5] hover:bg-[#00929D] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar plantao-ti-oswaldo-cruz.zip</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Deployment Instructions */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-[#00A9B5]" />
                  <span>Como Rodar ou Hospedar após descompactar</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">1. Teste Local (Node.js):</p>
                    <div className="font-mono bg-slate-900 text-slate-200 p-2 rounded text-[11px] space-y-1">
                      <div>npm install</div>
                      <div className="text-emerald-400">npm run dev</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">2. Hospedagem (Vercel / Netlify):</p>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      <li>Envie para um repositório GitHub</li>
                      <li>Importe na <b>Vercel</b> ou <b>Netlify</b></li>
                      <li>Build command: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">npm run build</code></li>
                      <li>Output directory: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">dist</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-emerald-600 font-medium">
            {savedSuccess ? '✓ Configurações salvas com sucesso!' : ''}
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
