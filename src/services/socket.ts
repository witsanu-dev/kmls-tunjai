import { io, Socket } from 'socket.io-client';
import { CaseRecord, CaseStatus } from '../types/emergency';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const isSubPath = window.location.pathname.startsWith('/tunjai');
    const socketPath = isSubPath ? '/tunjai/socket.io' : '/socket.io';

    socket = io(window.location.origin, {
      path: socketPath,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function subscribeToEmergencyAlerts(
  onNewAlert: (newCase: CaseRecord) => void,
  onStatusUpdate: (data: { id: string; status: CaseStatus }) => void,
  onReset: () => void,
  onCaseDeleted?: (data: { id: string }) => void,
  onCaseUpdated?: (updatedCase: CaseRecord) => void
) {
  const s = getSocket();

  s.on('new_emergency_alert', (newCase: CaseRecord) => {
    console.log('🚨 REAL-TIME EMERGENCY ALERT RECEIVED:', newCase);
    onNewAlert(newCase);
  });

  s.on('case_status_updated', (data: { id: string; status: CaseStatus }) => {
    onStatusUpdate(data);
  });

  s.on('case_deleted', (data: { id: string }) => {
    if (onCaseDeleted) onCaseDeleted(data);
  });

  s.on('cases_reset', () => {
    onReset();
  });

  s.on('case_updated', (updatedCase: CaseRecord) => {
    if (onCaseUpdated) onCaseUpdated(updatedCase);
  });

  return () => {
    s.off('new_emergency_alert');
    s.off('case_status_updated');
    s.off('case_deleted');
    s.off('cases_reset');
    s.off('case_updated');
  };
}
