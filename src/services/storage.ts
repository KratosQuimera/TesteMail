import { Ticket, ArchivedTicket, User, AuditEntry, ShiftRecord, EmailSettings, ActiveUserPresence } from '../types';

export const DEFAULT_USERS: User[] = [
  {
    id: 'u-wagner',
    name: 'Wagner Marcelino',
    email: 'wagner.marcelino@hospitalti.com',
    role: 'admin',
    avatarColor: '#3b82f6', // blue
    initials: 'WM',
    password: '123'
  },
  {
    id: 'u-elias',
    name: 'Elias de Morais',
    email: 'elias.morais@hospitalti.com',
    role: 'tecnico',
    avatarColor: '#10b981', // emerald
    initials: 'EM',
    password: '123'
  },
  {
    id: 'u-fatima',
    name: 'Fátima Araújo',
    email: 'fatima.araujo@hospitalti.com',
    role: 'admin',
    avatarColor: '#8b5cf6', // purple
    initials: 'FA',
    password: '123'
  },
  {
    id: 'u-pedro',
    name: 'Pedro Augusto',
    email: 'pedro.augusto@hospitalti.com',
    role: 'tecnico',
    avatarColor: '#f59e0b', // amber
    initials: 'PA',
    password: '123'
  },
  {
    id: 'u-gestor',
    name: 'Coordenação de TI (Gestor)',
    email: 'coordenacao.ti@hospitalti.com',
    role: 'visualizador',
    avatarColor: '#ec4899', // pink
    initials: 'CT',
    password: '123'
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 't-1',
    chamado: 'T504757',
    prioridade: 'P2',
    area: 'Centro Cirúrgico',
    problema: 'Zebra Pulseira',
    status: 'Resolvido',
    proximaAcao: 'Posicionar sensor e calibrar',
    responsavel: 'Wagner Marcelino',
    observacoes: 'Sensor calibrado, impressão de pulseiras normalizada na sala 03.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedBy: 'Wagner Marcelino'
  },
  {
    id: 't-2',
    chamado: 'T504673',
    prioridade: 'P4',
    area: 'Centro Cirúrgico',
    problema: 'Trocar conector',
    status: 'Pendente',
    proximaAcao: 'Trocar conector keystone',
    responsavel: 'Wagner/Elias',
    observacoes: 'Aguardando liberação de sala sem procedimento cirúrgico.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedBy: 'Wagner/Elias'
  },
  {
    id: 't-3',
    chamado: 'R119018',
    prioridade: 'P4',
    area: 'Ouvidoria',
    problema: 'Remanejamento',
    status: 'Pendente',
    proximaAcao: 'Remanejamento ponto de rede',
    responsavel: 'Wagner/Elias',
    observacoes: 'Agendado para o início do próximo turno.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedBy: 'Wagner/Elias'
  },
  {
    id: 't-4',
    chamado: 'T504443',
    prioridade: 'P4',
    area: 'Ortopedia',
    problema: 'Organização',
    status: 'Pendente',
    proximaAcao: 'Organizar os cabos',
    responsavel: 'Wagner/Elias',
    observacoes: 'Rack secundário com patch cords soltos.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedBy: 'Wagner/Elias'
  },
  {
    id: 't-5',
    chamado: 'R117620',
    prioridade: 'P4',
    area: 'Pronto Atendimento',
    problema: 'Configurar Painel',
    status: 'Aguardando Desenvolvimento',
    proximaAcao: 'Configurar painel',
    responsavel: 'Elias de Morais',
    observacoes: 'Aguardando liberação de porta de comunicação pelo time de software.',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedBy: 'Elias de Morais'
  },
  {
    id: 't-6',
    chamado: 'T505102',
    prioridade: 'P1',
    area: 'UTI Geral',
    problema: 'Monitor de Triagem sem rede',
    status: 'Resolvido',
    proximaAcao: 'Substituição de switch de borda',
    responsavel: 'Wagner Marcelino',
    observacoes: 'Switch reiniciado e porta 12 remapeada. Comunicação restabelecida.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    updatedBy: 'Wagner Marcelino'
  },
  {
    id: 't-7',
    chamado: 'T505300',
    prioridade: 'P2',
    area: 'Farmácia Central',
    problema: 'Leitor Código de Barras',
    status: 'Em Atendimento',
    proximaAcao: 'Trocar leitor Honeywell',
    responsavel: 'Pedro Augusto',
    observacoes: 'Em teste no balcão 2.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Pedro Augusto'
  }
];

export const DEFAULT_AREAS = [
  'Centro Cirúrgico',
  'Ouvidoria',
  'Ortopedia',
  'Pronto Atendimento',
  'UTI Geral',
  'UTI Neonatal',
  'Farmácia Central',
  'Laboratório',
  'Recepção Principal',
  'Internação 3º Andar',
  'Faturamento',
  'SADT / Imagem',
  'Ambulatório'
];

export const DEFAULT_RESPONSIBLES = [
  'Wagner Marcelino',
  'Elias de Morais',
  'Wagner/Elias',
  'Edilson Aparecido',
  'Cai Cesar',
  'Pedro Augusto',
  'Hugo Alves',
  'Fátima Araújo',
  'Josué Oliveira'
];

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  defaultRecipients: [
    'gestao.plantao@hospitalalemao.org.br',
    'coordenacao.suporte@hospitalalemao.org.br',
    'proximo.plantao@hospitalalemao.org.br'
  ],
  ccRecipients: [
    'gerencia.ti@hospitalalemao.org.br'
  ],
  senderName: 'Plantão TI - Hospital Alemão Oswaldo Cruz',
  hospitalUnit: 'Hospital Alemão Oswaldo Cruz',
  emailSubjectTemplate: '[PLANTÃO TI] Passagem de Turno - Suporte & Infraestrutura',
  autoIncludeWhatsAppFormat: true
};

export const INITIAL_ARCHIVED_TICKETS: ArchivedTicket[] = [
  {
    id: 'arch-1',
    chamado: 'T504710',
    prioridade: 'P3',
    area: 'Faturamento',
    problema: 'Impressora Laser sem toner',
    status: 'Resolvido',
    proximaAcao: 'Substituição do cartucho realizada e teste OK',
    responsavel: 'Wagner Marcelino',
    observacoes: 'Toner sobressalente retirado do estoque central',
    createdAt: '2026-08-18T10:15:00.000Z',
    updatedAt: '2026-08-18T11:20:00.000Z',
    archivedAt: '2026-08-18T11:25:00.000Z',
    archivedDate: '2026-08-18',
    archivedBy: 'Wagner Marcelino',
    archiveReason: 'Resolvido no Plantão'
  },
  {
    id: 'arch-2',
    chamado: 'R118990',
    prioridade: 'P2',
    area: 'UTI Adulto',
    problema: 'Monitor multiparâmetro sem rede',
    status: 'Resolvido',
    proximaAcao: 'Reconectado cabo de rede e verificado switch',
    responsavel: 'Elias de Morais',
    observacoes: 'Porta 12 do switch do 3º andar estava desativada',
    createdAt: '2026-08-17T14:30:00.000Z',
    updatedAt: '2026-08-17T15:10:00.000Z',
    archivedAt: '2026-08-17T15:15:00.000Z',
    archivedDate: '2026-08-17',
    archivedBy: 'Elias de Morais',
    archiveReason: 'Resolvido no Plantão'
  }
];

const STORAGE_KEYS = {
  TICKETS: 'plantao_tickets_v1',
  ARCHIVED_TICKETS: 'plantao_archived_tickets_v1',
  USERS: 'plantao_users_v1',
  CURRENT_USER: 'plantao_current_user_v1',
  AUDIT: 'plantao_audit_v1',
  SHIFTS: 'plantao_shift_history_v1',
  EMAIL_SETTINGS: 'plantao_email_settings_v1',
  AREAS: 'plantao_areas_v1',
  RESPONSIBLES: 'plantao_responsibles_v1',
  CURRENT_SHIFT_INFO: 'plantao_current_shift_info_v1'
};

// Storage helper functions
export const loadStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key ${key}`, err);
    return fallback;
  }
};

export const saveStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}`, err);
  }
};

// Cross-tab / Multi-user realtime broadcast channel
export class RealtimeChannel {
  private channel: BroadcastChannel | null = null;
  private channelName = 'plantao_realtime_collaboration_v1';
  private listeners: ((event: { type: string; payload: any }) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted, fallback to storage listener', e);
      }
    }

    // Secondary listener for window storage event (works across browser tabs)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'plantao_sync_signal' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyListeners(data);
          } catch {}
        }
      });
    }
  }

  public broadcast(type: string, payload: any) {
    const message = { type, payload, senderId: Math.random().toString(36).substring(7), timestamp: Date.now() };
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {}
    }
    try {
      localStorage.setItem('plantao_sync_signal', JSON.stringify(message));
    } catch {}
  }

  public subscribe(callback: (event: { type: string; payload: any; senderId?: string }) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(fn => {
      try {
        fn(data);
      } catch (e) {
        console.error('Error in listener callback', e);
      }
    });
  }
}

export const realtime = new RealtimeChannel();
