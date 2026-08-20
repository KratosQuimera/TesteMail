export type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export type TicketStatus = 
  | 'Pendente' 
  | 'Em Atendimento' 
  | 'Aguardando Desenvolvimento' 
  | 'Resolvido' 
  | 'Impedimento';

export type UserRole = 'admin' | 'tecnico' | 'visualizador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  initials: string;
  password?: string;
}

export interface Ticket {
  id: string;
  chamado: string;          // Ex: T504757, R119018
  prioridade: Priority;     // P1, P2, P3, P4, P5
  area: string;             // Centro Cirúrgico, Ouvidoria, etc.
  problema: string;         // Zebra Pulseira, Trocar conector, etc.
  status: TicketStatus;     // Pendente, Em Atendimento, etc.
  proximaAcao: string;      // Posicionar sensor e calibrar, etc.
  responsavel: string;      // Wagner Marcelino, Elias de Morais, etc.
  observacoes: string;      // Notas adicionais
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  isNewInShift?: boolean;
}

export interface ArchivedTicket extends Ticket {
  archivedAt: string;       // ISO timestamp when it was cleared/archived
  archivedDate: string;     // YYYY-MM-DD format for date queries
  archivedBy: string;       // Technician/user who cleared the ticket
  archiveReason?: string;   // Ex: 'Resolvido no Plantão', 'Limpeza de rotina'
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  ticketId: string;
  chamado: string;
  field: string;
  oldValue: string;
  newValue: string;
  userName: string;
  userRole: string;
}

export interface ActiveUserPresence {
  userId: string;
  userName: string;
  avatarColor: string;
  initials: string;
  activeCell?: {
    ticketId: string;
    field: keyof Ticket;
  };
  lastSeen: number;
}

export interface ShiftRecord {
  id: string;
  shiftName: string;
  date: string;
  startedAt: string;
  endedAt: string;
  closedBy: string;
  ticketsSnapshot: Ticket[];
  totalTickets: number;
  resolvedCount: number;
  pendingCount: number;
  criticalPendingCount: number;
  summaryNotes: string;
  sentToEmails: string[];
}

export interface EmailSettings {
  defaultRecipients: string[];
  ccRecipients: string[];
  senderName: string;
  hospitalUnit: string;
  emailSubjectTemplate: string;
  autoIncludeWhatsAppFormat: boolean;
}
