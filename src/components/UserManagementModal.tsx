import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Shield, 
  Check, 
  Trash2, 
  UserCheck, 
  Key, 
  Mail, 
  Info 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_DESCRIPTIONS: Record<UserRole, { label: string; desc: string; badgeColor: string }> = {
  admin: {
    label: 'Administrador / Coordenador',
    desc: 'Acesso total: edita chamados, gerencia usuários, configura e-mails pré-definidos e encerra plantões.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  tecnico: {
    label: 'Técnico / Plantonista',
    desc: 'Edição em tempo real: cria chamados, altera status e prioridades, adiciona observações e envia relatórios.',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  visualizador: {
    label: 'Visualizador / Gestão Geral',
    desc: 'Somente leitura: visualiza chamados em tempo real, acompanha indicadores e exporta dados.',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

const AVATAR_COLORS = [
  '#4f46e5', // indigo
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // purple
  '#db2777', // pink
  '#0891b2', // cyan
  '#dc2626'  // red
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, loginAs, addUser, deleteUser, canManageUsers } = useAuth();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('tecnico');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);

  if (!isOpen) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const initials = newName
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');

    addUser({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      avatarColor: newColor,
      initials: initials || 'TI'
    });

    setNewName('');
    setNewEmail('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Perfis de Acesso & Troca de Usuário
              </h2>
              <p className="text-xs text-slate-500">
                Alterne seu usuário conectado ou gerencie a equipe de plantonistas
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* User Switching Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Alternar Usuário Conectado
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {users.map(u => {
                const isSelected = currentUser.id === u.id;
                const roleInfo = ROLE_DESCRIPTIONS[u.role];

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-300 shadow-xs ring-1 ring-indigo-400/40'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-xs"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{u.name}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{u.email}</p>
                        <div className="mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${roleInfo.badgeColor}`}>
                            {roleInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSelected && (
                        <button
                          onClick={() => loginAs(u)}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Entrar como</span>
                        </button>
                      )}

                      {canManageUsers && users.length > 1 && !isSelected && (
                        <button
                          onClick={() => {
                            if (confirm(`Remover usuário ${u.name}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New User Section */}
          {canManageUsers && (
            <div className="pt-2 border-t border-slate-200">
              {!isAddingNew ? (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-slate-600 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Novo Usuário / Plantonista</span>
                </button>
              ) : (
                <form onSubmit={handleCreateUser} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    <span>Novo Perfil de Usuário</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-700 font-semibold mb-1">Nome Completo</label>
                      <input
                        type="text"
                        placeholder="Ex: Josué Oliveira"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-700 font-semibold mb-1">E-mail</label>
                      <input
                        type="email"
                        placeholder="Ex: josue.oliveira@hospitalti.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-700 font-semibold mb-1">Nível de Permissão (Role)</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="tecnico">Técnico / Plantonista</option>
                        <option value="admin">Administrador / Coordenador</option>
                        <option value="visualizador">Visualizador (Somente Leitura)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-700 font-semibold mb-1">Cor do Avatar</label>
                      <div className="flex items-center gap-2 pt-1">
                        {AVATAR_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewColor(c)}
                            className={`w-6 h-6 rounded-full transition ${newColor === c ? 'ring-2 ring-indigo-600 scale-110' : 'opacity-70 hover:opacity-100'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition"
                    >
                      Salvar Usuário
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Role Permissions Reference Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Matriz de Permissões:</span>
            </p>
            <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
              <li><strong>Administrador:</strong> Edição irrestrita, cadastro de usuários, exclusão de linhas, setup de e-mails.</li>
              <li><strong>Técnico / Plantonista:</strong> Edição de chamados em tempo real, adição de novos itens, finalização e envio de relatório.</li>
              <li><strong>Visualizador:</strong> Monitoramento e busca sem risco de alteração acidental dos dados do plantão.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
