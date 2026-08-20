import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Ticket, 
  ArchivedTicket,
  AuditEntry, 
  ShiftRecord, 
  EmailSettings, 
  ActiveUserPresence, 
  Priority, 
  TicketStatus 
} from '../types';
import { 
  INITIAL_TICKETS, 
  INITIAL_ARCHIVED_TICKETS,
  DEFAULT_AREAS, 
  DEFAULT_RESPONSIBLES, 
  DEFAULT_EMAIL_SETTINGS, 
  loadStorage, 
  saveStorage, 
  realtime 
} from '../services/storage';
import { useAuth } from './AuthContext';

interface SheetContextType {
  tickets: Ticket[];
  archivedTickets: ArchivedTicket[];
  areas: string[];
  responsibles: string[];
  emailSettings: EmailSettings;
  auditLogs: AuditEntry[];
  shiftHistory: ShiftRecord[];
  activePresences: ActiveUserPresence[];
  onlineUsersCount: number;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  responsibleFilter: string;
  setResponsibleFilter: (r: string) => void;
  areaFilter: string;
  setAreaFilter: (a: string) => void;

  // Actions
  updateCell: (ticketId: string, field: keyof Ticket, value: any) => void;
  addTicket: (customValues?: Partial<Ticket>) => Ticket;
  deleteTicket: (ticketId: string) => void;
  bulkDelete: (ticketIds: string[]) => void;
  
  // Archiving actions (Cleaning resolved/individual tickets with date persistence)
  archiveTicket: (ticketId: string, reason?: string) => ArchivedTicket | null;
  archiveResolvedTickets: () => ArchivedTicket[];
  restoreArchivedTicket: (archivedTicketId: string) => Ticket | null;
  deleteArchivedTicketPermanently: (archivedTicketId: string) => void;
  clearAllArchivedTickets: () => void;

  setMyActiveCell: (ticketId?: string, field?: keyof Ticket) => void;
  addArea: (areaName: string) => void;
  removeArea: (areaName: string) => void;
  addResponsible: (name: string) => void;
  removeResponsible: (name: string) => void;
  updateEmailSettings: (settings: EmailSettings) => void;
  closeShiftAndArchive: (
    shiftName: string, 
    notes: string, 
    sentRecipients: string[], 
    carryOverPending: boolean
  ) => ShiftRecord;
  revertToSnapshot: (tickets: Ticket[]) => void;
  lastSyncTime: Date;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export const SheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    return loadStorage<Ticket[]>('plantao_tickets_v1', INITIAL_TICKETS);
  });

  const [archivedTickets, setArchivedTickets] = useState<ArchivedTicket[]>(() => {
    return loadStorage<ArchivedTicket[]>('plantao_archived_tickets_v1', INITIAL_ARCHIVED_TICKETS);
  });

  const [areas, setAreas] = useState<string[]>(() => {
    return loadStorage<string[]>('plantao_areas_v1', DEFAULT_AREAS);
  });

  const [responsibles, setResponsibles] = useState<string[]>(() => {
    return loadStorage<string[]>('plantao_responsibles_v1', DEFAULT_RESPONSIBLES);
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => {
    return loadStorage<EmailSettings>('plantao_email_settings_v1', DEFAULT_EMAIL_SETTINGS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => {
    return loadStorage<AuditEntry[]>('plantao_audit_v1', []);
  });

  const [shiftHistory, setShiftHistory] = useState<ShiftRecord[]>(() => {
    return loadStorage<ShiftRecord[]>('plantao_shift_history_v1', []);
  });

  const [activePresences, setActivePresences] = useState<ActiveUserPresence[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [responsibleFilter, setResponsibleFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');

  // References for avoiding stale closures
  const ticketsRef = useRef(tickets);
  ticketsRef.current = tickets;
  const archivedTicketsRef = useRef(archivedTickets);
  archivedTicketsRef.current = archivedTickets;
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // Persist tickets
  useEffect(() => {
    saveStorage('plantao_tickets_v1', tickets);
  }, [tickets]);

  // Persist archived tickets
  useEffect(() => {
    saveStorage('plantao_archived_tickets_v1', archivedTickets);
  }, [archivedTickets]);

  // Persist areas
  useEffect(() => {
    saveStorage('plantao_areas_v1', areas);
  }, [areas]);

  // Persist responsibles
  useEffect(() => {
    saveStorage('plantao_responsibles_v1', responsibles);
  }, [responsibles]);

  // Persist email settings
  useEffect(() => {
    saveStorage('plantao_email_settings_v1', emailSettings);
  }, [emailSettings]);

  // Persist audit logs
  useEffect(() => {
    saveStorage('plantao_audit_v1', auditLogs);
  }, [auditLogs]);

  // Persist shift history
  useEffect(() => {
    saveStorage('plantao_shift_history_v1', shiftHistory);
  }, [shiftHistory]);

  // Real-time synchronization subscription
  useEffect(() => {
    const unsubscribe = realtime.subscribe((event) => {
      if (!event || !event.type) return;

      if (event.type === 'CELL_UPDATED') {
        const { ticketId, field, value, updatedAt, updatedBy, audit } = event.payload;
        setTickets(prev => prev.map(t => {
          if (t.id === ticketId) {
            return {
              ...t,
              [field]: value,
              updatedAt: updatedAt || new Date().toISOString(),
              updatedBy: updatedBy || t.updatedBy
            };
          }
          return t;
        }));
        if (audit) {
          setAuditLogs(prev => [audit, ...prev].slice(0, 200));
        }
        setLastSyncTime(new Date());
      } else if (event.type === 'TICKET_ADDED') {
        const { ticket, audit } = event.payload;
        setTickets(prev => [ticket, ...prev.filter(t => t.id !== ticket.id)]);
        if (audit) {
          setAuditLogs(prev => [audit, ...prev].slice(0, 200));
        }
        setLastSyncTime(new Date());
      } else if (event.type === 'TICKET_DELETED') {
        const { ticketId, audit } = event.payload;
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        if (audit) {
          setAuditLogs(prev => [audit, ...prev].slice(0, 200));
        }
        setLastSyncTime(new Date());
      } else if (event.type === 'TICKET_ARCHIVED') {
        const { archivedTicket, audit } = event.payload;
        setTickets(prev => prev.filter(t => t.id !== archivedTicket.id));
        setArchivedTickets(prev => [archivedTicket, ...prev.filter(a => a.id !== archivedTicket.id)]);
        if (audit) {
          setAuditLogs(prev => [audit, ...prev].slice(0, 200));
        }
        setLastSyncTime(new Date());
      } else if (event.type === 'BULK_ARCHIVED') {
        const { archivedList, audit } = event.payload;
        const archivedIds = archivedList.map((a: ArchivedTicket) => a.id);
        setTickets(prev => prev.filter(t => !archivedIds.includes(t.id)));
        setArchivedTickets(prev => [...archivedList, ...prev.filter(a => !archivedIds.includes(a.id))]);
        if (audit) {
          setAuditLogs(prev => [audit, ...prev].slice(0, 200));
        }
        setLastSyncTime(new Date());
      } else if (event.type === 'TICKET_RESTORED') {
        const { restoredTicket, audit } = event.payload;
        setArchivedTickets(prev => prev.filter(a => a.id !== restoredTicket.id));
        setTickets(prev => [restoredTicket, ...prev.filter(t => t.id !== restoredTicket.id)]);
        if (audit) {
          setAuditLogs(prev => [audit, ...prev].slice(0, 200));
        }
        setLastSyncTime(new Date());
      } else if (event.type === 'ARCHIVED_PERMANENTLY_DELETED') {
        const { archivedTicketId } = event.payload;
        setArchivedTickets(prev => prev.filter(a => a.id !== archivedTicketId));
        setLastSyncTime(new Date());
      } else if (event.type === 'BULK_DELETED') {
        const { ticketIds } = event.payload;
        setTickets(prev => prev.filter(t => !ticketIds.includes(t.id)));
        setLastSyncTime(new Date());
      } else if (event.type === 'USER_PRESENCE') {
        const presence: ActiveUserPresence = event.payload;
        setActivePresences(prev => {
          const now = Date.now();
          const clean = prev.filter(p => p.userId !== presence.userId && (now - p.lastSeen < 12000));
          return [...clean, presence];
        });
      } else if (event.type === 'SHIFT_CLOSED') {
        const { newTickets, shiftRecord } = event.payload;
        setTickets(newTickets);
        setShiftHistory(prev => [shiftRecord, ...prev]);
        setLastSyncTime(new Date());
      } else if (event.type === 'AREAS_UPDATED') {
        setAreas(event.payload);
      } else if (event.type === 'RESPONSIBLES_UPDATED') {
        setResponsibles(event.payload);
      }
    });

    return () => unsubscribe();
  }, []);

  // Heartbeat presence announcement every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        realtime.broadcast('USER_PRESENCE', {
          userId: currentUser.id,
          userName: currentUser.name,
          avatarColor: currentUser.avatarColor,
          initials: currentUser.initials,
          lastSeen: Date.now()
        });
      }

      // Cleanup stale presences older than 10 seconds
      setActivePresences(prev => {
        const now = Date.now();
        return prev.filter(p => now - p.lastSeen < 10000);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const setMyActiveCell = useCallback((ticketId?: string, field?: keyof Ticket) => {
    if (!currentUser) return;
    realtime.broadcast('USER_PRESENCE', {
      userId: currentUser.id,
      userName: currentUser.name,
      avatarColor: currentUser.avatarColor,
      initials: currentUser.initials,
      activeCell: ticketId && field ? { ticketId, field } : undefined,
      lastSeen: Date.now()
    });
  }, [currentUser]);

  const updateCell = useCallback((ticketId: string, field: keyof Ticket, value: any) => {
    const existing = ticketsRef.current.find(t => t.id === ticketId);
    if (!existing) return;
    const oldValue = String(existing[field] || '');
    const newValueStr = String(value || '');

    if (oldValue === newValueStr) return; // No change

    const now = new Date().toISOString();
    const updatedTicket: Ticket = {
      ...existing,
      [field]: value,
      updatedAt: now,
      updatedBy: currentUserRef.current?.name || 'Técnico'
    };

    const auditEntry: AuditEntry = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: now,
      ticketId,
      chamado: existing.chamado,
      field: String(field),
      oldValue,
      newValue: newValueStr,
      userName: currentUserRef.current?.name || 'Usuário',
      userRole: currentUserRef.current?.role || 'tecnico'
    };

    // Update locally
    setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
    setAuditLogs(prev => [auditEntry, ...prev].slice(0, 200));
    setLastSyncTime(new Date());

    // Broadcast in real-time to other users/tabs
    realtime.broadcast('CELL_UPDATED', {
      ticketId,
      field,
      value,
      updatedAt: now,
      updatedBy: currentUserRef.current?.name || 'Técnico',
      audit: auditEntry
    });
  }, []);

  const addTicket = useCallback((customValues?: Partial<Ticket>): Ticket => {
    const now = new Date().toISOString();
    const generatedNumber = Math.floor(100000 + Math.random() * 900000);
    const prefix = Math.random() > 0.3 ? 'T' : 'R';
    
    const newTicket: Ticket = {
      id: 't-' + Math.random().toString(36).substring(2, 9),
      chamado: customValues?.chamado || `${prefix}${generatedNumber}`,
      prioridade: (customValues?.prioridade as Priority) || 'P4',
      area: customValues?.area || areas[0] || 'Pronto Atendimento',
      problema: customValues?.problema || '',
      status: (customValues?.status as TicketStatus) || 'Pendente',
      proximaAcao: customValues?.proximaAcao || '',
      responsavel: customValues?.responsavel || responsibles[0] || currentUserRef.current?.name || 'Wagner Marcelino',
      observacoes: customValues?.observacoes || '',
      createdAt: now,
      updatedAt: now,
      updatedBy: currentUserRef.current?.name || 'Técnico',
      isNewInShift: true
    };

    const auditEntry: AuditEntry = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: now,
      ticketId: newTicket.id,
      chamado: newTicket.chamado,
      field: 'CRIADO',
      oldValue: '',
      newValue: `Novo chamado ${newTicket.chamado} criado`,
      userName: currentUserRef.current?.name || 'Usuário',
      userRole: currentUserRef.current?.role || 'tecnico'
    };

    setTickets(prev => [newTicket, ...prev]);
    setAuditLogs(prev => [auditEntry, ...prev].slice(0, 200));
    setLastSyncTime(new Date());

    realtime.broadcast('TICKET_ADDED', {
      ticket: newTicket,
      audit: auditEntry
    });

    return newTicket;
  }, [areas, responsibles]);

  // Archive a single ticket (cleans from active list, saves with exact date & time)
  const archiveTicket = useCallback((ticketId: string, reason = 'Limpeza / Chamado Arquivado'): ArchivedTicket | null => {
    const target = ticketsRef.current.find(t => t.id === ticketId);
    if (!target) return null;

    const now = new Date();
    const nowISO = now.toISOString();
    const todayDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const technicianName = currentUserRef.current?.name || 'Técnico';

    const archivedItem: ArchivedTicket = {
      ...target,
      archivedAt: nowISO,
      archivedDate: todayDate,
      archivedBy: technicianName,
      archiveReason: reason
    };

    const auditEntry: AuditEntry = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowISO,
      ticketId: target.id,
      chamado: target.chamado,
      field: 'ARQUIVADO',
      oldValue: `Status: ${target.status} (${target.area})`,
      newValue: `Arquivado em ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} por ${technicianName}`,
      userName: technicianName,
      userRole: currentUserRef.current?.role || 'tecnico'
    };

    // Remove from active tickets, add to archivedTickets
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    setArchivedTickets(prev => [archivedItem, ...prev.filter(a => a.id !== ticketId)]);
    setAuditLogs(prev => [auditEntry, ...prev].slice(0, 200));
    setLastSyncTime(new Date());

    realtime.broadcast('TICKET_ARCHIVED', {
      archivedTicket: archivedItem,
      audit: auditEntry
    });

    return archivedItem;
  }, []);

  // Bulk Archive all resolved tickets
  const archiveResolvedTickets = useCallback((): ArchivedTicket[] => {
    const resolvedList = ticketsRef.current.filter(t => t.status === 'Resolvido');
    if (resolvedList.length === 0) return [];

    const now = new Date();
    const nowISO = now.toISOString();
    const todayDate = now.toISOString().slice(0, 10);
    const technicianName = currentUserRef.current?.name || 'Técnico';

    const newArchivedList: ArchivedTicket[] = resolvedList.map(t => ({
      ...t,
      archivedAt: nowISO,
      archivedDate: todayDate,
      archivedBy: technicianName,
      archiveReason: 'Limpeza de Resolvidos no Plantão'
    }));

    const resolvedIds = resolvedList.map(t => t.id);

    const auditEntry: AuditEntry = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowISO,
      ticketId: 'bulk-archive',
      chamado: `${resolvedList.length} Chamados`,
      field: 'LIMPEZA_RESOLVIDOS',
      oldValue: `${resolvedList.length} chamados resolvidos`,
      newValue: `Arquivados no histórico de ${todayDate} por ${technicianName}`,
      userName: technicianName,
      userRole: currentUserRef.current?.role || 'tecnico'
    };

    setTickets(prev => prev.filter(t => !resolvedIds.includes(t.id)));
    setArchivedTickets(prev => [...newArchivedList, ...prev.filter(a => !resolvedIds.includes(a.id))]);
    setAuditLogs(prev => [auditEntry, ...prev].slice(0, 200));
    setLastSyncTime(new Date());

    realtime.broadcast('BULK_ARCHIVED', {
      archivedList: newArchivedList,
      audit: auditEntry
    });

    return newArchivedList;
  }, []);

  // Restore an archived ticket back to the active list
  const restoreArchivedTicket = useCallback((archivedTicketId: string): Ticket | null => {
    const target = archivedTicketsRef.current.find(a => a.id === archivedTicketId);
    if (!target) return null;

    const now = new Date();
    const nowISO = now.toISOString();
    const technicianName = currentUserRef.current?.name || 'Técnico';

    // Remove archive metadata to get standard Ticket
    const { archivedAt, archivedDate, archivedBy, archiveReason, ...rest } = target;
    const restoredTicket: Ticket = {
      ...rest,
      updatedAt: nowISO,
      updatedBy: technicianName
    };

    const auditEntry: AuditEntry = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowISO,
      ticketId: target.id,
      chamado: target.chamado,
      field: 'RESTAURADO',
      oldValue: `Arquivado em ${archivedDate}`,
      newValue: `Restaurado para a planilha ativa por ${technicianName}`,
      userName: technicianName,
      userRole: currentUserRef.current?.role || 'tecnico'
    };

    setArchivedTickets(prev => prev.filter(a => a.id !== archivedTicketId));
    setTickets(prev => [restoredTicket, ...prev.filter(t => t.id !== archivedTicketId)]);
    setAuditLogs(prev => [auditEntry, ...prev].slice(0, 200));
    setLastSyncTime(new Date());

    realtime.broadcast('TICKET_RESTORED', {
      restoredTicket,
      audit: auditEntry
    });

    return restoredTicket;
  }, []);

  // Delete an archived ticket permanently
  const deleteArchivedTicketPermanently = useCallback((archivedTicketId: string) => {
    setArchivedTickets(prev => prev.filter(a => a.id !== archivedTicketId));
    setLastSyncTime(new Date());
    realtime.broadcast('ARCHIVED_PERMANENTLY_DELETED', { archivedTicketId });
  }, []);

  const clearAllArchivedTickets = useCallback(() => {
    setArchivedTickets([]);
    setLastSyncTime(new Date());
  }, []);

  const deleteTicket = useCallback((ticketId: string) => {
    const target = ticketsRef.current.find(t => t.id === ticketId);
    if (!target) return;

    const now = new Date().toISOString();
    const auditEntry: AuditEntry = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: now,
      ticketId,
      chamado: target.chamado,
      field: 'EXCLUÍDO',
      oldValue: `${target.chamado} (${target.problema})`,
      newValue: 'Removido da planilha',
      userName: currentUserRef.current?.name || 'Usuário',
      userRole: currentUserRef.current?.role || 'admin'
    };

    setTickets(prev => prev.filter(t => t.id !== ticketId));
    setAuditLogs(prev => [auditEntry, ...prev].slice(0, 200));
    setLastSyncTime(new Date());

    realtime.broadcast('TICKET_DELETED', {
      ticketId,
      audit: auditEntry
    });
  }, []);

  const bulkDelete = useCallback((ticketIds: string[]) => {
    setTickets(prev => prev.filter(t => !ticketIds.includes(t.id)));
    setLastSyncTime(new Date());
    realtime.broadcast('BULK_DELETED', { ticketIds });
  }, []);

  const addArea = useCallback((areaName: string) => {
    if (!areaName.trim() || areas.includes(areaName.trim())) return;
    const updated = [...areas, areaName.trim()];
    setAreas(updated);
    realtime.broadcast('AREAS_UPDATED', updated);
  }, [areas]);

  const removeArea = useCallback((areaName: string) => {
    const updated = areas.filter(a => a !== areaName);
    setAreas(updated);
    realtime.broadcast('AREAS_UPDATED', updated);
  }, [areas]);

  const addResponsible = useCallback((name: string) => {
    if (!name.trim() || responsibles.includes(name.trim())) return;
    const updated = [...responsibles, name.trim()];
    setResponsibles(updated);
    realtime.broadcast('RESPONSIBLES_UPDATED', updated);
  }, [responsibles]);

  const removeResponsible = useCallback((name: string) => {
    const updated = responsibles.filter(r => r !== name);
    setResponsibles(updated);
    realtime.broadcast('RESPONSIBLES_UPDATED', updated);
  }, [responsibles]);

  const updateEmailSettings = useCallback((newSettings: EmailSettings) => {
    setEmailSettings(newSettings);
  }, []);

  const closeShiftAndArchive = useCallback((
    shiftName: string, 
    notes: string, 
    sentRecipients: string[], 
    carryOverPending: boolean
  ): ShiftRecord => {
    const currentTickets = ticketsRef.current;
    const resolved = currentTickets.filter(t => t.status === 'Resolvido');
    const pending = currentTickets.filter(t => t.status !== 'Resolvido');
    const criticalPending = currentTickets.filter(
      t => (t.prioridade === 'P1' || t.prioridade === 'P2') && t.status !== 'Resolvido'
    );

    const shiftRecord: ShiftRecord = {
      id: 'shift-' + Date.now(),
      shiftName: shiftName || `Plantão ${new Date().toLocaleDateString('pt-BR')}`,
      date: new Date().toISOString(),
      startedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      endedAt: new Date().toISOString(),
      closedBy: currentUserRef.current?.name || 'Administrador',
      ticketsSnapshot: [...currentTickets],
      totalTickets: currentTickets.length,
      resolvedCount: resolved.length,
      pendingCount: pending.length,
      criticalPendingCount: criticalPending.length,
      summaryNotes: notes,
      sentToEmails: sentRecipients
    };

    // Prepare next shift's tickets: carry over pending items or empty
    const nextTickets: Ticket[] = carryOverPending
      ? pending.map(t => ({ ...t, isNewInShift: false }))
      : [];

    setShiftHistory(prev => [shiftRecord, ...prev]);
    setTickets(nextTickets);
    setLastSyncTime(new Date());

    realtime.broadcast('SHIFT_CLOSED', {
      newTickets: nextTickets,
      shiftRecord
    });

    return shiftRecord;
  }, []);

  const revertToSnapshot = useCallback((snapshotTickets: Ticket[]) => {
    setTickets(snapshotTickets);
    setLastSyncTime(new Date());
  }, []);

  // Compute unique online users
  const uniqueOnline = [
    ...(currentUser ? [{
      userId: currentUser.id,
      userName: currentUser.name,
      avatarColor: currentUser.avatarColor,
      initials: currentUser.initials,
      lastSeen: Date.now()
    }] : []),
    ...activePresences.filter(p => p.userId !== currentUser?.id)
  ];

  return (
    <SheetContext.Provider
      value={{
        tickets,
        archivedTickets,
        areas,
        responsibles,
        emailSettings,
        auditLogs,
        shiftHistory,
        activePresences,
        onlineUsersCount: uniqueOnline.length,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        responsibleFilter,
        setResponsibleFilter,
        areaFilter,
        setAreaFilter,
        updateCell,
        addTicket,
        deleteTicket,
        bulkDelete,
        archiveTicket,
        archiveResolvedTickets,
        restoreArchivedTicket,
        deleteArchivedTicketPermanently,
        clearAllArchivedTickets,
        setMyActiveCell,
        addArea,
        removeArea,
        addResponsible,
        removeResponsible,
        updateEmailSettings,
        closeShiftAndArchive,
        revertToSnapshot,
        lastSyncTime
      }}
    >
      {children}
    </SheetContext.Provider>
  );
};

export const useSheet = () => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('useSheet must be used within a SheetProvider');
  }
  return context;
};

