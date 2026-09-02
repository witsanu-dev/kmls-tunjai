import { CaseRecord, Hospital, Personnel, NewCasePayload, CaseStatus, UserAccount, AuditLogItem } from '../types/emergency';

const API_BASE = 'api';
const LOCAL_STORAGE_KEY = 'er_stalert_cases_v2';
const LOCAL_STORAGE_AUTH_TOKEN = 'er_stalert_auth_token_v1';
const LOCAL_STORAGE_HOSPITALS = 'er_stalert_hospitals_v2';

const DEFAULT_HOSPITALS: Hospital[] = [
  { id: 1, code: 'HSP001', name: 'โรงพยาบาลมหาราช / ER Fast Track Center', level: 'รพ.ศูนย์ (Level 1)', phone: '044-234500' },
  { id: 2, code: 'HSP002', name: 'โรงพยาบาลเทพรัตน์นครราชสีมา', level: 'รพ.ทั่วไป (Level 2)', phone: '044-395000' },
  { id: 3, code: 'HSP003', name: 'โรงพยาบาลค่ายสุรนารี', level: 'รพ.สังกัดกระทรวงกลาโหม', phone: '044-255711' },
  { id: 4, code: 'HSP004', name: 'โรงพยาบาลกรุงเทพ-ราชสีมา', level: 'รพ.เอกชน', phone: '044-015999' },
];

function getLocalCases(): CaseRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: 'SK-89A12',
      fr_name: 'สมชาย ใจดี (กู้ชีพเทศบาล)',
      patient_name: 'นายสมศักดิ์ รุ่งเรือง',
      age: '64',
      sex: 'ชาย',
      id_photo_url: null,
      additional_photos: [],
      location: '14.9723, 102.0831 - ต.ในเมือง อ.เมือง',
      latitude: 14.9723,
      longitude: 102.0831,
      hospital_id: 1,
      hospital_name: 'โรงพยาบาลมหาราช / ER Fast Track Center',
      face: true,
      arm: true,
      speech: false,
      onset_iso: new Date(Date.now() - 45 * 60000).toISOString(),
      nihss_total: 8,
      nihss_severity: 'ปานกลาง',
      status: 'new',
      reported_at: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 'SK-77B45',
      fr_name: 'วิชัย ปลอดภัย (อสม. หมู่ 3)',
      patient_name: 'นางมาลี สุขสันต์',
      age: '71',
      sex: 'หญิง',
      id_photo_url: null,
      additional_photos: [],
      location: '14.9611, 102.0945 - บ้านโพธิ์ ต.ในเมือง',
      latitude: 14.9611,
      longitude: 102.0945,
      hospital_id: 1,
      hospital_name: 'โรงพยาบาลมหาราช / ER Fast Track Center',
      face: true,
      arm: true,
      speech: true,
      onset_iso: new Date(Date.now() - 90 * 60000).toISOString(),
      nihss_total: 14,
      nihss_severity: 'ปานกลาง',
      status: 'accepted',
      reported_at: new Date(Date.now() - 90 * 60000).toISOString(),
    }
  ];
}

function saveLocalCases(cases: CaseRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cases));
  } catch (e) {}
}

export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: 'offline', mysql: 'disconnected' };
}

// ── Auth Services ────────────────────────────────────────────────────────────

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN);
}

export function setStoredAuthToken(token: string | null) {
  if (token) localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN, token);
  else localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN);
}

export async function loginApi(username: string, password: string): Promise<{ token: string; user: UserAccount }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'การเข้าสู่ระบบไม่สำเร็จ');
  setStoredAuthToken(json.token);
  return json;
}

export async function logoutApi(): Promise<void> {
  const token = getStoredAuthToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {}
  }
  setStoredAuthToken(null);
}

export async function fetchCurrentAuthUser(): Promise<UserAccount | null> {
  const token = getStoredAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return null;
}

// ── User Management Services ──────────────────────────────────────────────────

export async function fetchUsersApi(): Promise<UserAccount[]> {
  const token = getStoredAuthToken();
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return [];
}

export async function registerApi(userData: Partial<UserAccount> & { password: string }): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'ไม่สามารถลงทะเบียนได้');
  return json;
}

export async function createUserApi(userData: Partial<UserAccount> & { password: string }): Promise<void> {
  const token = getStoredAuthToken();
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้');
}

export async function updateUserApi(id: number, userData: Partial<UserAccount> & { password?: string }): Promise<void> {
  const token = getStoredAuthToken();
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'ไม่สามารถอัปเดตผู้ใช้งานได้');
}

export async function deleteUserApi(id: number): Promise<void> {
  const token = getStoredAuthToken();
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('ไม่สามารถลบผู้ใช้งานได้');
}

// ── Audit Log Services ────────────────────────────────────────────────────────

export async function fetchAuditLogsApi(): Promise<AuditLogItem[]> {
  const token = getStoredAuthToken();
  try {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return [];
}



export async function fetchHospitals(): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API_BASE}/hospitals`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  return DEFAULT_HOSPITALS;
}

export async function fetchCases(): Promise<CaseRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/cases`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveLocalCases(data);
        return data;
      }
    }
  } catch (e) {}
  return getLocalCases();
}

export async function createCase(payload: NewCasePayload): Promise<CaseRecord> {
  const newId = `SK-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`;
  const record: CaseRecord = {
    ...payload,
    additional_photos: payload.additional_photos ?? [],
    id: newId,
    status: 'new',
    reported_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.case) return json.case;
    }
  } catch (e) {}

  // Fallback local save
  const cases = getLocalCases();
  cases.unshift(record);
  saveLocalCases(cases);
  return record;
}

export async function updateCaseStatus(id: string, status: CaseStatus): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cases/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return true;
  } catch (e) {}

  // Local fallback
  const cases = getLocalCases();
  const idx = cases.findIndex(c => c.id === id);
  if (idx !== -1) {
    cases[idx].status = status;
    saveLocalCases(cases);
  }
  return true;
}

export async function deleteSingleCase(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cases/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const cases = getLocalCases().filter(c => c.id !== id);
      saveLocalCases(cases);
      return true;
    }
  } catch (e) {}

  const cases = getLocalCases().filter(c => c.id !== id);
  saveLocalCases(cases);
  return true;
}

export async function resetAllCases(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cases`, { method: 'DELETE' });
    if (res.ok) {
      saveLocalCases([]);
      return true;
    }
  } catch (e) {}

  saveLocalCases([]);
  return true;
}

// --- Hospital Record API (F-PCT-001/ER) ---
import type { HospitalRecord } from '../types/emergency';

export async function fetchHospitalRecord(caseId: string): Promise<HospitalRecord | null> {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/hospital-record`);
    if (res.ok) return await res.json() as HospitalRecord;
  } catch (e) {}
  return null;
}

export async function saveHospitalRecord(
  caseId: string,
  data: Omit<HospitalRecord, 'id' | 'case_id' | 'recorded_at'>
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/hospital-record`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {}
  return false;
}

export async function deleteHospitalRecord(caseId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/hospital-record`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {}
  return false;
}

// ── MOPH Notify Settings API ──────────────────────────────────────────────────
import type { MophNotifyConfig } from '../types/emergency';

export async function fetchMophNotifyConfig(): Promise<MophNotifyConfig> {
  try {
    const res = await fetch(`${API_BASE}/settings/moph-notify`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    moph_notify_enabled: 'true',
    moph_notify_env: 'PROD',
    moph_notify_endpoint: 'https://morpromt2f.moph.go.th/api/notify/send',
    moph_notify_client_key: 'd6078e5cf778468032ea725035b0181e2bfbf9ae',
    moph_notify_secret_key: '3O3N65YXG7U3WQRO4GBAQV3EC3SY',
    moph_notify_hospital_line1: 'โรงพยาบาล',
    moph_notify_hospital_line2: 'กมลาไสย (Stroke Fast Track)',
    moph_notify_hospital_logo: 'https://morpromt2c.moph.go.th/image/image_3771a3e8-57d0-4fe0-b0f8-3c97427eb201.png',
    moph_notify_header_image: 'https://cdns.yellow-idea.com/moph/20250602/moph-flex-header-1.png',
  };
}

export async function saveMophNotifyConfig(data: MophNotifyConfig): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/settings/moph-notify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {}
  return false;
}

export async function testSendMophNotify(hospitalName: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/settings/moph-notify/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moph_notify_hospital_line2: hospitalName }),
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: false };
}
