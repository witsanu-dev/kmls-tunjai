export type CaseStatus = 'new' | 'accepted' | 'arrived' | 'cancelled';
export type UrgencyLevel = 'green' | 'amber' | 'red' | 'expired';

export type UserRole = 'admin' | 'fr_dispatch' | 'er_staff' | 'director';

export interface UserAccount {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  agency_name: string;
  hospital_id?: number | null;
  hospital_name?: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
}

export interface AuditLogItem {
  id: number;
  user_id: number | null;
  username: string;
  full_name: string;
  role: string;
  action: string;
  target_resource: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface Hospital {
  id: number;
  code: string;
  name: string;
  level: string;
  phone: string;
  phone2?: string;
  phone3?: string;
  address?: string;
}

export interface Personnel {
  id: number;
  name: string;
  agency: string;
  phone?: string;
  role?: string;
}

export interface CaseRecord {
  id: string;
  fr_name: string;
  patient_name: string;
  age: string;
  sex: string;
  id_photo_url: string | null;
  additional_photos: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  hospital_id: number;
  hospital_name: string;
  face: boolean;
  arm: boolean;
  speech: boolean;
  onset_iso: string;
  nihss_total: number | null;
  nihss_severity: string | null;
  status: CaseStatus;
  reported_at: string;
}

export interface UrgencyInfo {
  remainingMin: number | null;
  pct: number;
  level: UrgencyLevel;
}

export interface NewCasePayload {
  fr_name: string;
  patient_name: string;
  age: string;
  sex: string;
  id_photo_url: string | null;
  additional_photos?: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  hospital_id: number;
  hospital_name: string;
  face: boolean;
  arm: boolean;
  speech: boolean;
  onset_iso: string;
  nihss_total: number | null;
  nihss_severity: string | null;
}

// --- Hospital Stroke Record (F-PCT-001/ER) ---

export type StrokeTrack = 'fast_tract' | 'non_fast_tract' | 'no_stroke' | '';
export type StrokeCTResult = 'ischemic' | 'hemorrhagic' | 'normal' | 'other' | '';
export type ArrivalMode = 'self' | 'ems' | 'refer' | '';
export type RtPADecision = 'yes' | 'no' | '';
export type SurgeryDecision = 'yes' | 'no' | '';

export interface HospitalRecord {
  id?: number;
  case_id: string;
  recorded_by: string;
  recorded_at?: string;

  // Section 1: ER Arrival
  er_arrival_time: string;
  arrival_mode: ArrivalMode;
  refer_from_hospital: string;
  stroke_track: StrokeTrack;
  stroke_activate_time: string;

  // Section 2: Clinical Assessment at ER
  er_weakness_side: string;
  er_communication: boolean;
  er_speech_unclear: boolean;
  er_facial_droop: boolean;
  er_unsteady_gait: boolean;
  er_visual_loss: boolean;
  er_drowsy: boolean;
  er_gcs_e: string;
  er_gcs_v: string;
  er_gcs_m: string;
  er_motor_arm_left: string;
  er_motor_arm_right: string;
  er_motor_leg_left: string;
  er_motor_leg_right: string;
  er_nihss: string;

  // Section 3: Investigation Timeline
  blood_draw_time: string;
  lab_send_time: string;
  lab_result_time: string;
  ct_order_time: string;
  ct_transfer_er_to_ct_time: string;
  ct_scan_time: string;
  ct_transfer_ct_to_er_time: string;
  ct_doctor_view_time: string;
  ct_official_result_time: string;
  ct_result_type: StrokeCTResult;

  // Section 4: Ischemic Stroke Management
  consult_neuro_med_time: string;
  rtpa_decision: RtPADecision;
  rtpa_contraindication_reason: string;
  rtpa_bw_kg: string;
  rtpa_total_dose_mg: string;
  rtpa_bolus_dose_mg: string;
  rtpa_bolus_time: string;
  rtpa_drip_dose_mg: string;
  rtpa_drip_time: string;
  rtpa_finish_time: string;

  // Section 5: Hemorrhagic Stroke Management
  consult_neuro_sx_time: string;
  consult_neuro_med_hemo_time: string;
  surgery_decision: SurgeryDecision;
  surgery_time: string;

  // Section 6: Transfer
  refer_to_hospital: string;
  refer_accept_time: string;
  transfer_center_contact_time: string;
  transfer_depart_time: string;

  // Section 7: Notes
  problems_notes: string;
}

export interface MophNotifyConfig {
  moph_notify_enabled: string;
  moph_notify_env: string;
  moph_notify_endpoint: string;
  moph_notify_client_key: string;
  moph_notify_secret_key: string;
  moph_notify_hospital_line1: string;
  moph_notify_hospital_line2: string;
  moph_notify_hospital_logo: string;
  moph_notify_header_image: string;
}
