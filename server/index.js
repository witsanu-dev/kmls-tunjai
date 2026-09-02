import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDbPool, getPool, isDbConnected } from './db.js';

// ── Uploads Directory Setup ──────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'cases');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/**
 * Save a base64 data URL to disk as a JPEG file.
 * Returns the public URL path e.g. "/uploads/cases/SK-12345/id_photo.jpg"
 * Returns null if the input is not a valid base64 data URL (already a path URL).
 */
function saveBase64ToFile(dataUrl, caseId, filename) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl; // already a URL path
  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) return null;
    const base64Data = matches[2];
    const caseDir = path.join(UPLOADS_DIR, caseId);
    fs.mkdirSync(caseDir, { recursive: true });
    const filePath = path.join(caseDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return `/uploads/cases/${caseId}/${filename}`;
  } catch (err) {
    console.error(`⚠️  Failed to save image ${filename} for case ${caseId}:`, err.message);
    return null;
  }
}

/**
 * Remove all uploaded image files for a given case.
 */
function removeCaseImages(caseId) {
  try {
    const caseDir = path.join(UPLOADS_DIR, caseId);
    if (fs.existsSync(caseDir)) {
      fs.rmSync(caseDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`⚠️  Failed to remove images for case ${caseId}:`, err.message);
  }
}

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// ── Serve uploaded images as static files ────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory fallback array in case MySQL is not running yet on the system
// In-memory fallback array in case MySQL is not running yet on the system
let memoryCases = [
  {
    id: 'SK-89A12',
    fr_name: 'สมชาย ใจดี (กู้ชีพเทศบาลกมลาไสย)',
    patient_name: 'นายสมศักดิ์ รุ่งเรือง',
    age: '64',
    sex: 'ชาย',
    id_photo_url: null,
    location: '14.9723, 102.0831 - ต.ในเมือง อ.เมือง',
    latitude: 14.9723,
    longitude: 102.0831,
    hospital_id: 1,
    hospital_name: 'โรงพยาบาลกมลาไสย',
    face: 1,
    arm: 1,
    speech: 0,
    onset_iso: new Date(Date.now() - 25 * 60000).toISOString(),
    nihss_total: 8,
    nihss_severity: 'ปานกลาง (Moderate)',
    additional_photos_json: JSON.stringify(['/sample1.jpg']),
    status: 'new',
    reported_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'SK-77B45',
    fr_name: 'วิชัย ปลอดภัย (ศูนย์กู้ชีพ อบต.)',
    patient_name: 'นางมาลี สุขสันต์',
    age: '71',
    sex: 'หญิง',
    id_photo_url: null,
    location: '14.9611, 102.0945 - บ้านโพธิ์ ต.ในเมือง',
    latitude: 14.9611,
    longitude: 102.0945,
    hospital_id: 1,
    hospital_name: 'โรงพยาบาลกมลาไสย',
    face: 1,
    arm: 1,
    speech: 1,
    onset_iso: new Date(Date.now() - 65 * 60000).toISOString(),
    nihss_total: 14,
    nihss_severity: 'ปานกลาง-รุนแรง (Moderate to Severe)',
    additional_photos_json: null,
    status: 'accepted',
    reported_at: new Date(Date.now() - 65 * 60000).toISOString(),
  },
  {
    id: 'SK-91C03',
    fr_name: 'สมเกียรติ สว่างภัย (กู้ชีพสว่างเมตตา)',
    patient_name: 'นายบุญมี มั่นคง',
    age: '58',
    sex: 'ชาย',
    id_photo_url: null,
    location: '14.9815, 102.1022 - ต.จอหอ อ.เมือง',
    latitude: 14.9815,
    longitude: 102.1022,
    hospital_id: 2,
    hospital_name: 'โรงพยาบาลมหาราช / ER Fast Track Center',
    face: 1,
    arm: 1,
    speech: 1,
    onset_iso: new Date(Date.now() - 110 * 60000).toISOString(),
    nihss_total: 18,
    nihss_severity: 'รุนแรง (Severe Stroke)',
    additional_photos_json: null,
    status: 'arrived',
    reported_at: new Date(Date.now() - 110 * 60000).toISOString(),
  },
  {
    id: 'SK-52D88',
    fr_name: 'พยาบาลสมหญิง ER (รพ.สต. หนองบัว)',
    patient_name: 'นางประนอม ศรีสุข',
    age: '68',
    sex: 'หญิง',
    id_photo_url: null,
    location: '14.9542, 102.0711 - ต.หนองบัวศาลา',
    latitude: 14.9542,
    longitude: 102.0711,
    hospital_id: 1,
    hospital_name: 'โรงพยาบาลกมลาไสย',
    face: 0,
    arm: 1,
    speech: 1,
    onset_iso: new Date(Date.now() - 15 * 60000).toISOString(),
    nihss_total: 6,
    nihss_severity: 'น้อย (Minor Stroke)',
    additional_photos_json: null,
    status: 'new',
    reported_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'SK-34E19',
    fr_name: 'ศูนย์กู้ภัยร่วมกตัญญู จุดเมือง',
    patient_name: 'นายวินัย ชัยชนะ',
    age: '62',
    sex: 'ชาย',
    id_photo_url: null,
    location: '14.9780, 102.0890 - ต.สุรนารี อ.เมือง',
    latitude: 14.9780,
    longitude: 102.0890,
    hospital_id: 3,
    hospital_name: 'โรงพยาบาลเทพรัตน์นครราชสีมา',
    face: 1,
    arm: 0,
    speech: 1,
    onset_iso: new Date(Date.now() - 140 * 60000).toISOString(),
    nihss_total: 10,
    nihss_severity: 'ปานกลาง (Moderate)',
    additional_photos_json: null,
    status: 'accepted',
    reported_at: new Date(Date.now() - 140 * 60000).toISOString(),
  },
  {
    id: 'SK-68F42',
    fr_name: 'อสม. สมศรี (หมู่ 5 กมลาไสย)',
    patient_name: 'นางทองย้อย อยู่ดี',
    age: '75',
    sex: 'หญิง',
    id_photo_url: null,
    location: '14.9650, 102.0780 - ต.โคกกรวด',
    latitude: 14.9650,
    longitude: 102.0780,
    hospital_id: 1,
    hospital_name: 'โรงพยาบาลกมลาไสย',
    face: 1,
    arm: 1,
    speech: 0,
    onset_iso: new Date(Date.now() - 180 * 60000).toISOString(),
    nihss_total: 12,
    nihss_severity: 'ปานกลาง (Moderate)',
    additional_photos_json: null,
    status: 'arrived',
    reported_at: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: 'SK-15G77',
    fr_name: 'สมชาย ใจดี (กู้ชีพเทศบาลกมลาไสย)',
    patient_name: 'นายกิตติศักดิ์ เจริญพร',
    age: '53',
    sex: 'ชาย',
    id_photo_url: null,
    location: '14.9901, 102.1105 - ต.หัวทะเล',
    latitude: 14.9901,
    longitude: 102.1105,
    hospital_id: 2,
    hospital_name: 'โรงพยาบาลมหาราช / ER Fast Track Center',
    face: 0,
    arm: 1,
    speech: 0,
    onset_iso: new Date(Date.now() - 40 * 60000).toISOString(),
    nihss_total: 4,
    nihss_severity: 'น้อย (Minor Stroke)',
    additional_photos_json: null,
    status: 'new',
    reported_at: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: 'SK-82H63',
    fr_name: 'ศูนย์รับแจ้งเหตุ 1669 นครราชสีมา',
    patient_name: 'นางสมบูรณ์ ดีเลิศ',
    age: '80',
    sex: 'หญิง',
    id_photo_url: null,
    location: '14.9600, 102.0850 - ต.ในเมือง',
    latitude: 14.9600,
    longitude: 102.0850,
    hospital_id: 1,
    hospital_name: 'โรงพยาบาลกมลาไสย',
    face: 1,
    arm: 1,
    speech: 1,
    onset_iso: new Date(Date.now() - 210 * 60000).toISOString(),
    nihss_total: 21,
    nihss_severity: 'รุนแรงมาก (Severe Stroke)',
    additional_photos_json: null,
    status: 'arrived',
    reported_at: new Date(Date.now() - 210 * 60000).toISOString(),
  },
  {
    id: 'SK-29J54',
    fr_name: 'วิชัย ปลอดภัย (ศูนย์กู้ชีพ อบต.)',
    patient_name: 'นายประเสริฐ เลิศวณิช',
    age: '66',
    sex: 'ชาย',
    id_photo_url: null,
    location: '14.9755, 102.0999 - ต.หนองจะโบสถ์',
    latitude: 14.9755,
    longitude: 102.0999,
    hospital_id: 4,
    hospital_name: 'โรงพยาบาลค่ายสุรนารี',
    face: 1,
    arm: 0,
    speech: 1,
    onset_iso: new Date(Date.now() - 85 * 60000).toISOString(),
    nihss_total: 9,
    nihss_severity: 'ปานกลาง (Moderate)',
    additional_photos_json: null,
    status: 'accepted',
    reported_at: new Date(Date.now() - 85 * 60000).toISOString(),
  },
  {
    id: 'SK-43K91',
    fr_name: 'พยาบาลวิชาชีพ จุดคัดกรอง ER',
    patient_name: 'นายถนอม จงเจริญ',
    age: '73',
    sex: 'ชาย',
    id_photo_url: null,
    location: '14.9670, 102.0810 - ต.ในเมือง',
    latitude: 14.9670,
    longitude: 102.0810,
    hospital_id: 1,
    hospital_name: 'โรงพยาบาลกมลาไสย',
    face: 1,
    arm: 1,
    speech: 1,
    onset_iso: new Date(Date.now() - 300 * 60000).toISOString(),
    nihss_total: 16,
    nihss_severity: 'ปานกลาง-รุนแรง',
    additional_photos_json: null,
    status: 'arrived',
    reported_at: new Date(Date.now() - 300 * 60000).toISOString(),
  },
  {
    id: 'SK-07L36',
    fr_name: 'กู้ภัยฮุก 31 จุดกมลาไสย',
    patient_name: 'นางพยอม เจริญลาภ',
    age: '69',
    sex: 'หญิง',
    id_photo_url: null,
    location: '14.9830, 102.1050 - ต.บ้านเกาะ',
    latitude: 14.9830,
    longitude: 102.1050,
    hospital_id: 5,
    hospital_name: 'โรงพยาบาลกรุงเทพ-ราชสีมา',
    face: 0,
    arm: 1,
    speech: 1,
    onset_iso: new Date(Date.now() - 50 * 60000).toISOString(),
    nihss_total: 7,
    nihss_severity: 'น้อย (Minor Stroke)',
    additional_photos_json: null,
    status: 'accepted',
    reported_at: new Date(Date.now() - 50 * 60000).toISOString(),
  },
  {
    id: 'SK-55M20',
    fr_name: 'สมชาย ใจดี (กู้ชีพเทศบาลกมลาไสย)',
    patient_name: 'นายชาญชัย มิ่งขวัญ',
    age: '61',
    sex: 'ชาย',
    id_photo_url: null,
    location: '14.9700, 102.0880 - ต.ในเมือง',
    latitude: 14.9700,
    longitude: 102.0880,
    hospital_id: 1,
    hospital_name: 'โรงพยาบาลกมลาไสย',
    face: 1,
    arm: 1,
    speech: 0,
    onset_iso: new Date(Date.now() - 360 * 60000).toISOString(),
    nihss_total: 11,
    nihss_severity: 'ปานกลาง (Moderate)',
    additional_photos_json: null,
    status: 'arrived',
    reported_at: new Date(Date.now() - 360 * 60000).toISOString(),
  }
];

const memoryHospitals = [
  { id: 1, code: '11078', name: 'โรงพยาบาลกมลาไสย', level: 'โรงพยาบาลชุมชน (F2)', phone: '043 899 570 ต่อ 271', phone2: '043 899 570 ต่อ 666', phone3: '091 064 6395' },
  { id: 2, code: 'HSP001', name: 'โรงพยาบาลมหาราช / ER Fast Track Center', level: 'รพ.ศูนย์ (Level 1)', phone: '044-234500', phone2: '044-234200', phone3: '1669' },
  { id: 3, code: 'HSP002', name: 'โรงพยาบาลเทพรัตน์นครราชสีมา', level: 'รพ.ทั่วไป (Level 2)', phone: '044-395000', phone2: '044-395111', phone3: '1669' },
  { id: 4, code: 'HSP003', name: 'โรงพยาบาลค่ายสุรนารี', level: 'รพ.สังกัดกระทรวงกลาโหม', phone: '044-255711', phone2: '044-255722', phone3: '1669' },
  { id: 5, code: 'HSP004', name: 'โรงพยาบาลกรุงเทพ-ราชสีมา', level: 'รพ.เอกชน', phone: '044-015999', phone2: '044-015900', phone3: '1669' },
];

// In-memory hospital records fallback
let memoryHospitalRecords = [];

const memoryPersonnel = [
  { id: 1, name: 'สมชาย ใจดี', agency: 'กู้ชีพเทศบาล', phone: '081-111-1111', role: 'FR' },
  { id: 2, name: 'วิชัย ปลอดภัย', agency: 'อสม. หมู่ 3', phone: '082-222-2222', role: 'อสม.' },
  { id: 3, name: 'พญ.สมหญิง รักษา', agency: 'โรงพยาบาลมหาราช', phone: '083-333-3333', role: 'แพทย์เวร ER' },
  { id: 4, name: 'นพ.ใจสู้ ไม่ท้อ', agency: 'โรงพยาบาลกมลาไสย', phone: '084-444-4444', role: 'แพทย์เวร ER' },
  { id: 5, name: 'พยาบาล เอื้ออาทร', agency: 'พยาบาลวิชาชีพ ER', phone: '085-555-5555', role: 'พยาบาล' },
];

// Initialize DB Connection Pool + Auto-migrate hospital_records table
initDbPool();

async function ensureHospitalRecordsTable() {
  if (!isDbConnected()) return;
  try {
    await getPool().query(`
      CREATE TABLE IF NOT EXISTS hospital_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        case_id VARCHAR(50) NOT NULL UNIQUE,
        recorded_by VARCHAR(200) DEFAULT '',
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        er_arrival_time VARCHAR(20) DEFAULT NULL,
        arrival_mode VARCHAR(20) DEFAULT NULL,
        refer_from_hospital VARCHAR(200) DEFAULT NULL,
        stroke_track VARCHAR(30) DEFAULT NULL,
        stroke_activate_time VARCHAR(20) DEFAULT NULL,
        er_weakness_side VARCHAR(50) DEFAULT NULL,
        er_communication TINYINT(1) DEFAULT 0,
        er_speech_unclear TINYINT(1) DEFAULT 0,
        er_facial_droop TINYINT(1) DEFAULT 0,
        er_unsteady_gait TINYINT(1) DEFAULT 0,
        er_visual_loss TINYINT(1) DEFAULT 0,
        er_drowsy TINYINT(1) DEFAULT 0,
        er_gcs_e VARCHAR(5) DEFAULT NULL,
        er_gcs_v VARCHAR(5) DEFAULT NULL,
        er_gcs_m VARCHAR(5) DEFAULT NULL,
        er_motor_arm_left VARCHAR(5) DEFAULT NULL,
        er_motor_arm_right VARCHAR(5) DEFAULT NULL,
        er_motor_leg_left VARCHAR(5) DEFAULT NULL,
        er_motor_leg_right VARCHAR(5) DEFAULT NULL,
        er_nihss VARCHAR(5) DEFAULT NULL,
        blood_draw_time VARCHAR(20) DEFAULT NULL,
        lab_send_time VARCHAR(20) DEFAULT NULL,
        lab_result_time VARCHAR(20) DEFAULT NULL,
        ct_order_time VARCHAR(20) DEFAULT NULL,
        ct_transfer_er_to_ct_time VARCHAR(20) DEFAULT NULL,
        ct_scan_time VARCHAR(20) DEFAULT NULL,
        ct_transfer_ct_to_er_time VARCHAR(20) DEFAULT NULL,
        ct_doctor_view_time VARCHAR(20) DEFAULT NULL,
        ct_official_result_time VARCHAR(20) DEFAULT NULL,
        ct_result_type VARCHAR(20) DEFAULT NULL,
        consult_neuro_med_time VARCHAR(20) DEFAULT NULL,
        rtpa_decision VARCHAR(10) DEFAULT NULL,
        rtpa_contraindication_reason TEXT DEFAULT NULL,
        rtpa_bw_kg VARCHAR(10) DEFAULT NULL,
        rtpa_total_dose_mg VARCHAR(10) DEFAULT NULL,
        rtpa_bolus_dose_mg VARCHAR(10) DEFAULT NULL,
        rtpa_bolus_time VARCHAR(20) DEFAULT NULL,
        rtpa_drip_dose_mg VARCHAR(10) DEFAULT NULL,
        rtpa_drip_time VARCHAR(20) DEFAULT NULL,
        rtpa_finish_time VARCHAR(20) DEFAULT NULL,
        consult_neuro_sx_time VARCHAR(20) DEFAULT NULL,
        consult_neuro_med_hemo_time VARCHAR(20) DEFAULT NULL,
        surgery_decision VARCHAR(10) DEFAULT NULL,
        surgery_time VARCHAR(20) DEFAULT NULL,
        refer_to_hospital VARCHAR(200) DEFAULT NULL,
        refer_accept_time VARCHAR(20) DEFAULT NULL,
        transfer_center_contact_time VARCHAR(20) DEFAULT NULL,
        transfer_depart_time VARCHAR(20) DEFAULT NULL,
        problems_notes TEXT DEFAULT NULL,
        INDEX idx_case_id (case_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ hospital_records table ready');

    // Seed realistic hospital records (F-PCT-001/ER) for sample cases
    const [recCount] = await getPool().query('SELECT COUNT(*) as count FROM hospital_records');
    if (recCount[0].count === 0) {
      await getPool().query(`
        INSERT INTO hospital_records (
          case_id, recorded_by, er_arrival_time, arrival_mode, stroke_track, stroke_activate_time,
          er_weakness_side, er_communication, er_speech_unclear, er_facial_droop,
          er_gcs_e, er_gcs_v, er_gcs_m, er_motor_arm_left, er_motor_arm_right, er_motor_leg_left, er_motor_leg_right, er_nihss,
          blood_draw_time, lab_send_time, lab_result_time, ct_order_time, ct_scan_time, ct_doctor_view_time, ct_result_type,
          consult_neuro_med_time, rtpa_decision, rtpa_bw_kg, rtpa_total_dose_mg, rtpa_bolus_dose_mg, rtpa_bolus_time, rtpa_drip_dose_mg, rtpa_drip_time,
          problems_notes
        ) VALUES
        (
          'SK-91C03', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลมหาราช)', '09:15', 'ems_fr', 'fast_track', '09:18',
          'right', 0, 1, 1,
          '4', '5', '6', '1', '4', '1', '4', '18',
          '09:20', '09:22', '09:45', '09:22', '09:35', '09:42', 'ischemic',
          '09:45', 'yes', '60', '54', '5.4', '09:50', '48.6', '09:52',
          'เคสเข้าเกณฑ์ Stroke Fast Track ได้รับยา rtPA ภายใน 45 นาที (Door-to-Needle 37 นาที)'
        ),
        (
          'SK-68F42', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลกมลาไสย)', '10:30', 'refer_in', 'fast_track', '10:35',
          'left', 0, 0, 1,
          '4', '5', '6', '4', '0', '4', '0', '12',
          '10:38', '10:40', '11:05', '10:42', '10:55', '11:02', 'ischemic',
          '11:05', 'yes', '55', '49.5', '4.95', '11:12', '44.55', '11:14',
          'สัญญาณชีพคงที่ ประเมิน NIHSS Score 12 คะแนน CT Scan ไม่พบภาวะเลือดออกในสมอง'
        ),
        (
          'SK-82H63', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลกมลาไสย)', '11:00', 'ems_fr', 'fast_track', '11:05',
          'both', 1, 1, 1,
          '3', '4', '5', '3', '3', '3', '3', '21',
          '11:10', '11:12', '11:35', '11:15', '11:30', '11:38', 'hemorrhagic',
          '11:40', 'no', '65', NULL, NULL, NULL, NULL, NULL,
          'CT Scan พบภาวะเลือดออกในสมอง (ICH) ปรึกษา ศัลยแพทย์ระบบประสาท (Neuro Surgery) เตรียมส่งต่อ'
        ),
        (
          'SK-43K91', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลกมลาไสย)', '08:45', 'walk_in', 'fast_track', '08:50',
          'right', 0, 1, 1,
          '4', '5', '6', '2', '4', '2', '4', '16',
          '08:52', '08:55', '09:20', '08:55', '09:10', '09:18', 'ischemic',
          '09:20', 'yes', '70', '63', '6.3', '09:28', '56.7', '09:30',
          'Door to CT 25 นาที ให้ยาละลายลิ่มเลือด rtPA สำเร็จ ไม่พบภาวะแทรกซ้อน'
        ),
        (
          'SK-55M20', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลกมลาไสย)', '07:20', 'ems_fr', 'fast_track', '07:25',
          'left', 0, 1, 0,
          '4', '5', '6', '4', '1', '4', '1', '11',
          '07:28', '07:30', '07:55', '07:32', '07:45', '07:52', 'ischemic',
          '07:55', 'yes', '58', '52.2', '5.22', '08:02', '46.98', '08:04',
          'รับผู้ป่วยเข้าห้อง Stroke Unit ติดตามสัญญาณชีพอย่างใกล้ชิด'
        )
        ON DUPLICATE KEY UPDATE recorded_by = VALUES(recorded_by);
      `);
      console.log('🌱 Seeded default hospital records (F-PCT-001/ER) into MySQL db_stalert');
    }
  } catch (e) {
    console.error('⚠️ Could not create hospital_records table:', e.message);
  }
}
// Run migration after a short delay (allow pool to connect)
setTimeout(ensureHospitalRecordsTable, 2000);

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    mysql: isDbConnected() ? 'connected' : 'memory_fallback',
    timestamp: new Date().toISOString(),
    dbConfig: {
      host: '127.0.0.1',
      port: 3306,
      database: 'db_stalert',
      user: 'root'
    }
  });
});

// ── Audit Log Helper Function ────────────────────────────────────────────────
async function writeAuditLog(req, user, action, targetResource, details) {
  const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
  const userId = user?.id || null;
  const username = user?.username || 'guest';
  const fullName = user?.full_name || 'ผู้ใช้งานภายนอก';
  const role = user?.role || 'guest';

  if (isDbConnected()) {
    try {
      await getPool().query(
        `INSERT INTO audit_logs (user_id, username, full_name, role, action, target_resource, details, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, username, fullName, role, action, targetResource, typeof details === 'object' ? JSON.stringify(details) : String(details || ''), String(ipAddress)]
      );
    } catch (e) {
      console.error('⚠️  Failed to write audit log to MySQL:', e.message);
    }
  }
}

// ── Authentication Endpoints ─────────────────────────────────────────────────

// POST Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณาระบุ Username และ Password' });
  }

  if (isDbConnected()) {
    try {
      const [users] = await getPool().query(
        'SELECT id, username, password_hash, full_name, role, agency_name, hospital_id, hospital_name, phone, is_active FROM users WHERE username = ?',
        [username]
      );
      if (users.length === 0) {
        return res.status(401).json({ message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
      }
      const user = users[0];
      if (!user.is_active) {
        return res.status(403).json({ message: 'บัญชีผู้ใช้งานนี้ถูกระงับการใช้งาน' });
      }

      // Verify Password (Plain or Hash match)
      if (user.password_hash !== password) {
        await writeAuditLog(req, { username }, 'LOGIN_FAILED', 'AUTH', `พยายามเข้าสู่ระบบล้มเหลว (Username: ${username})`);
        return res.status(401).json({ message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
      }

      // Generate Session Token
      const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

      await getPool().query(
        'INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
        [token, user.id, expiresAt]
      );
      await getPool().query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

      const userPayload = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        agency_name: user.agency_name,
        hospital_id: user.hospital_id,
        hospital_name: user.hospital_name,
        phone: user.phone,
        is_active: true,
      };

      await writeAuditLog(req, userPayload, 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ');

      return res.json({ token, user: userPayload });
    } catch (e) {
      console.error('Error during login:', e.message);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดของระบบ' });
    }
  }

  // Memory fallback for demo mode
  const token = `demo_token_${Date.now()}`;
  const mockUser = {
    id: 1,
    username,
    full_name: username === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่ผู้ใช้งาน',
    role: username === 'admin' ? 'admin' : username === 'er01' ? 'er_staff' : username === 'director01' ? 'director' : 'fr_dispatch',
    agency_name: 'หน่วยงานระบบการแพทย์ฉุกเฉิน',
    hospital_name: 'โรงพยาบาลกมลาไสย',
    is_active: true,
  };
  return res.json({ token, user: mockUser });
});

// POST Logout
app.post('/api/auth/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && isDbConnected()) {
    try {
      const [sessions] = await getPool().query('SELECT u.* FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?', [token]);
      if (sessions.length > 0) {
        await writeAuditLog(req, sessions[0], 'LOGOUT', 'AUTH', 'ออกจากระบบ');
      }
      await getPool().query('DELETE FROM user_sessions WHERE token = ?', [token]);
    } catch (e) {}
  }
  res.json({ success: true, message: 'ออกจากระบบเรียบร้อยแล้ว' });
});

// GET Current User Profile (by Token)
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'ไม่ได้เข้าสู่ระบบ' });

  if (isDbConnected()) {
    try {
      const [rows] = await getPool().query(
        `SELECT u.id, u.username, u.full_name, u.role, u.agency_name, u.hospital_id, u.hospital_name, u.phone, u.is_active, u.last_login_at 
         FROM user_sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.token = ? AND s.expires_at > NOW()`,
        [token]
      );
      if (rows.length > 0) {
        return res.json(rows[0]);
      }
    } catch (e) {
      console.error('Error fetching auth user:', e.message);
    }
  }
  return res.status(401).json({ message: 'Session หมดอายุหรือไม่มีในระบบ' });
});

// POST Register (Public registration, pending Admin approval)
app.post('/api/auth/register', async (req, res) => {
  const { username, password, full_name, role, agency_name, hospital_id, hospital_name, phone } = req.body;

  if (!username || !password || !full_name || !role) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
  }

  // Sanitize username
  const cleanUsername = username.trim();

  if (isDbConnected()) {
    try {
      const [existing] = await getPool().query('SELECT id FROM users WHERE username = ?', [cleanUsername]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'ชื่อผู้ใช้งาน (Username) นี้ถูกใช้งานแล้วในระบบ' });
      }

      await getPool().query(
        `INSERT INTO users (username, password_hash, full_name, role, agency_name, hospital_id, hospital_name, phone, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [cleanUsername, password, full_name.trim(), role, agency_name ? agency_name.trim() : '', hospital_id || null, hospital_name || '', phone ? phone.trim() : '']
      );

      await writeAuditLog(req, { username: cleanUsername, role }, 'REGISTER_REQUEST', `USER:${cleanUsername}`, `ลงทะเบียนผู้ใช้งานใหม่ (รออนุมัติโดย Admin): ${full_name} (${role})`);

      return res.status(201).json({
        success: true,
        message: 'ลงทะเบียนสำเร็จ! บัญชีของคุณอยู่ระหว่างรอการตรวจสอบและอนุมัติโดยผู้ดูแลระบบ (Admin)'
      });
    } catch (e) {
      console.error('Error during registration:', e.message);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองอีกครั้ง' });
    }
  }

  return res.status(201).json({
    success: true,
    message: 'ลงทะเบียนสำเร็จ! (โหมดทดลอง) บัญชีของคุณอยู่ระหว่างรอการอนุมัติโดย Admin'
  });
});

// ── User Management Endpoints (Admin Only) ───────────────────────────────────

// GET All Users
app.get('/api/users', async (req, res) => {
  if (isDbConnected()) {
    try {
      const [rows] = await getPool().query(
        'SELECT id, username, full_name, role, agency_name, hospital_id, hospital_name, phone, is_active, last_login_at, created_at FROM users ORDER BY id DESC'
      );
      return res.json(rows);
    } catch (e) {
      console.error('Error fetching users:', e.message);
    }
  }
  return res.json([]);
});

// POST Create User
app.post('/api/users', async (req, res) => {
  const { username, password, full_name, role, agency_name, hospital_id, hospital_name, phone } = req.body;
  if (!username || !password || !full_name || !role) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
  }

  if (isDbConnected()) {
    try {
      const [existing] = await getPool().query('SELECT id FROM users WHERE username = ?', [username]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'ชื่อผู้ใช้งาน (Username) นี้มีในระบบแล้ว' });
      }
      await getPool().query(
        `INSERT INTO users (username, password_hash, full_name, role, agency_name, hospital_id, hospital_name, phone) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, password, full_name, role, agency_name || '', hospital_id || null, hospital_name || '', phone || '']
      );
      await writeAuditLog(req, { username: 'admin', role: 'admin' }, 'CREATE_USER', `USER:${username}`, `สร้างผู้ใช้ใหม่: ${full_name} (${role})`);
      return res.status(201).json({ success: true, message: 'เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว' });
    } catch (e) {
      console.error('Error creating user:', e.message);
      return res.status(500).json({ message: 'ไม่สามารถสร้างผู้ใช้งานได้' });
    }
  }
  return res.status(500).json({ message: 'DB Disconnected' });
});

// PUT Update User
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, role, agency_name, hospital_id, hospital_name, phone, is_active, password } = req.body;

  if (isDbConnected()) {
    try {
      // First fetch current record to allow partial updates (e.g. toggling active status)
      const [existing] = await getPool().query('SELECT * FROM users WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
      }
      const cur = existing[0];

      const newFullName = full_name !== undefined ? full_name : cur.full_name;
      const newRole = role !== undefined ? role : cur.role;
      const newAgency = agency_name !== undefined ? agency_name : cur.agency_name;
      const newHospId = hospital_id !== undefined ? (hospital_id || null) : cur.hospital_id;
      const newHospName = hospital_name !== undefined ? hospital_name : cur.hospital_name;
      const newPhone = phone !== undefined ? phone : cur.phone;
      const newIsActive = is_active !== undefined ? (is_active ? 1 : 0) : cur.is_active;
      const newPassHash = password ? password : cur.password_hash;

      await getPool().query(
        `UPDATE users SET full_name=?, role=?, agency_name=?, hospital_id=?, hospital_name=?, phone=?, is_active=?, password_hash=? WHERE id=?`,
        [newFullName, newRole, newAgency, newHospId, newHospName, newPhone, newIsActive, newPassHash, id]
      );

      await writeAuditLog(req, { username: 'admin', role: 'admin' }, 'UPDATE_USER', `USER_ID:${id}`, `อัปเดตข้อมูลผู้ใช้ ID ${id}`);
      return res.json({ success: true, message: 'ปรับปรุงข้อมูลผู้ใช้งานเรียบร้อยแล้ว' });
    } catch (e) {
      console.error('Error updating user:', e.message);
      return res.status(500).json({ message: 'ไม่สามารถอัปเดตผู้ใช้งานได้' });
    }
  }
  return res.status(500).json({ message: 'DB Disconnected' });
});

// DELETE User
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  if (isDbConnected()) {
    try {
      await getPool().query('DELETE FROM users WHERE id = ?', [id]);
      await writeAuditLog(req, { username: 'admin', role: 'admin' }, 'DELETE_USER', `USER_ID:${id}`, `ลบผู้ใช้งาน ID ${id}`);
      return res.json({ success: true, message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
    } catch (e) {
      console.error('Error deleting user:', e.message);
    }
  }
  return res.status(500).json({ message: 'DB Disconnected' });
});

// ── Audit Logs Endpoint ──────────────────────────────────────────────────────
app.get('/api/audit-logs', async (req, res) => {
  if (isDbConnected()) {
    try {
      const [rows] = await getPool().query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200');
      return res.json(rows);
    } catch (e) {
      console.error('Error fetching audit logs:', e.message);
    }
  }
  return res.json([]);
});

// GET Hospitals
app.get('/api/hospitals', async (req, res) => {
  if (isDbConnected()) {
    try {
      const [rows] = await getPool().query('SELECT * FROM hospitals WHERE is_active = 1 ORDER BY id ASC');
      return res.json(rows);
    } catch (e) {
      console.error('Error fetching hospitals from MySQL:', e.message);
    }
  }
  res.json(memoryHospitals);
});



// GET Cases List — parse additional_photos_json to array
app.get('/api/cases', async (req, res) => {
  if (isDbConnected()) {
    try {
      const [rows] = await getPool().query('SELECT * FROM cases ORDER BY reported_at DESC');
      const parsed = rows.map(r => ({
        ...r,
        additional_photos: (() => { try { return JSON.parse(r.additional_photos_json || '[]'); } catch { return []; } })()
      }));
      return res.json(parsed);
    } catch (e) {
      console.error('Error fetching cases from DB:', e.message);
    }
  }
  res.json(memoryCases);
});

// POST Create New Case (FR Alert Trigger)
app.post('/api/cases', async (req, res) => {
  const caseData = {
    id: req.body.id || `SK-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`,
    fr_name: req.body.fr_name || 'ไม่ระบุ',
    patient_name: req.body.patient_name || 'ไม่ทราบชื่อ',
    age: req.body.age || '',
    sex: req.body.sex || 'ไม่ระบุ',
    id_photo_url: req.body.id_photo_url || null,
    location: req.body.location || 'ไม่ระบุพิกัด',
    latitude: req.body.latitude || null,
    longitude: req.body.longitude || null,
    hospital_id: req.body.hospital_id || 1,
    hospital_name: req.body.hospital_name || 'โรงพยาบาลมหาราช',
    face: req.body.face ? 1 : 0,
    arm: req.body.arm ? 1 : 0,
    speech: req.body.speech ? 1 : 0,
    onset_iso: req.body.onset_iso || new Date().toISOString(),
    nihss_total: req.body.nihss_total ?? null,
    nihss_severity: req.body.nihss_severity || null,
    status: 'new',
    reported_at: new Date().toISOString(),
  };

  // ── Convert base64 images → disk files ──────────────────────────────────
  const rawIdPhoto = req.body.id_photo_url || null;
  const rawExtraPhotos = req.body.additional_photos || [];

  // Save ID card / face photo
  const savedIdPhotoUrl = rawIdPhoto ? saveBase64ToFile(rawIdPhoto, caseData.id, 'id_photo.jpg') : null;
  caseData.id_photo_url = savedIdPhotoUrl;

  // Save additional photos
  const savedExtraUrls = rawExtraPhotos.map((b64, idx) =>
    saveBase64ToFile(b64, caseData.id, `extra_${String(idx).padStart(2, '0')}.jpg`)
  ).filter(Boolean);
  const additional_photos_json = JSON.stringify(savedExtraUrls);

  // Parsed version for memory + socket broadcast
  const caseDataWithPhotos = {
    ...caseData,
    additional_photos: savedExtraUrls,
  };

  if (isDbConnected()) {
    try {
      await getPool().query(
        `INSERT INTO cases 
        (id, fr_name, patient_name, age, sex, id_photo_url, location, latitude, longitude, hospital_id, hospital_name, face, arm, speech, onset_iso, nihss_total, nihss_severity, additional_photos_json, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseData.id, caseData.fr_name, caseData.patient_name, caseData.age, caseData.sex,
          savedIdPhotoUrl, caseData.location, caseData.latitude, caseData.longitude,
          caseData.hospital_id, caseData.hospital_name, caseData.face, caseData.arm, caseData.speech,
          caseData.onset_iso, caseData.nihss_total, caseData.nihss_severity, additional_photos_json, caseData.status
        ]
      );
    } catch (e) {
      console.error('Error inserting case into MySQL:', e.message);
    }
  }

  // Update memory state (store URL path form)
  memoryCases.unshift(caseDataWithPhotos);

  // Write Audit Log
  await writeAuditLog(req, { username: caseData.fr_name, role: 'fr_dispatch' }, 'CREATE_CASE', `CASE:${caseData.id}`, `แจ้งเหตุผู้ป่วย FAST Track: ${caseData.patient_name} (นำส่ง: ${caseData.hospital_name})`);

  // Broadcast Real-time Emergency Alert to all connected hospital screens via Socket.io
  io.emit('new_emergency_alert', caseDataWithPhotos);

  // Send MOPH Notify LINE Group Notification asynchronously
  sendMophNotifyAlert(caseDataWithPhotos).catch((err) => {
    console.error('⚠️ MOPH Notify Background Error:', err.message);
  });

  res.status(201).json({ success: true, case: caseDataWithPhotos });
  console.log(`📸 Case ${caseData.id} saved & notification queued`);
});

// ── MOPH Notify Helper Function ──────────────────────────────────────────────
async function sendMophNotifyAlert(caseItem) {
  let settingsMap = {
    moph_notify_enabled: 'true',
    moph_notify_endpoint: 'https://morpromt2f.moph.go.th/api/notify/send',
    moph_notify_client_key: 'd6078e5cf778468032ea725035b0181e2bfbf9ae',
    moph_notify_secret_key: '3O3N65YXG7U3WQRO4GBAQV3EC3SY',
    moph_notify_hospital_line1: 'โรงพยาบาล',
    moph_notify_hospital_line2: caseItem.hospital_name || 'กมลาไสย (Stroke Fast Track)',
    moph_notify_hospital_logo: 'https://morpromt2c.moph.go.th/image/image_3771a3e8-57d0-4fe0-b0f8-3c97427eb201.png',
    moph_notify_header_image: 'https://cdns.yellow-idea.com/moph/20250602/moph-flex-header-1.png',
  };

  if (isDbConnected()) {
    try {
      const [rows] = await getPool().query('SELECT * FROM system_settings WHERE key_name LIKE "moph_notify_%"');
      rows.forEach((r) => {
        settingsMap[r.key_name] = r.value_text;
      });
    } catch (e) {
      console.warn('⚠️ Could not load MOPH Notify settings from DB:', e.message);
    }
  }

  if (settingsMap.moph_notify_enabled === 'false') {
    console.log('ℹ️ MOPH Notify is currently disabled in settings.');
    return { success: false, reason: 'Disabled' };
  }

  const endpoint = settingsMap.moph_notify_endpoint || 'https://morpromt2f.moph.go.th/api/notify/send';
  const clientKey = settingsMap.moph_notify_client_key || 'd6078e5cf778468032ea725035b0181e2bfbf9ae';
  const secretKey = settingsMap.moph_notify_secret_key || '3O3N65YXG7U3WQRO4GBAQV3EC3SY';

  // Format date & time — Thai Buddhist Era (พ.ศ.)
  const now = new Date();
  const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const buddhistYear = now.getFullYear() + 543;
  const dateStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${buddhistYear}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

  const fastList = [];
  if (caseItem.face) fastList.push('• F (Face) : ปากตก / หน้าเบี้ยว');
  if (caseItem.arm) fastList.push('• A (Arm) : แขนขาอ่อนแรง');
  if (caseItem.speech) fastList.push('• S (Speech) : พูดไม่ชัด / พูดลำบาก');

  const fastSummaryText = fastList.length > 0 ? fastList.join('\n') : '• พบอาการเสี่ยง Stroke';
  const fastShortText = fastList.length > 0 ? fastList.map(item => item.replace('• ', '')).join(', ') : 'พบอาการเสี่ยง Stroke';

  // Parse arrivalType and tambon from embedded location string
  // Format: "<location text> (ต.TAMBON อ.AMPHOE) [WALK IN/EMS]"
  let parsedArrivalType = '-';
  let parsedTambon = '-';
  if (caseItem.location) {
    const arrivalMatch = caseItem.location.match(/\[(WALK IN|EMS)\]/);
    if (arrivalMatch) parsedArrivalType = arrivalMatch[1];
    const tambonMatch = caseItem.location.match(/\(ต\.([^\s]+)\s+อ\.([^\)]+)\)/);
    if (tambonMatch) parsedTambon = `ต.${tambonMatch[1]} อ.${tambonMatch[2]}`;
  }
  
  // Line 1 & Line 2 strictly respect System Settings configured by Admin
  const hospitalLine1 = settingsMap.moph_notify_hospital_line1 || 'โรงพยาบาล';
  const hospitalLine2 = settingsMap.moph_notify_hospital_line2 || 'Stroke Alert FAST Track';
  const hospitalLogo = settingsMap.moph_notify_hospital_logo || 'https://morpromt2c.moph.go.th/image/image_3771a3e8-57d0-4fe0-b0f8-3c97427eb201.png';
  const headerImage = settingsMap.moph_notify_header_image || 'https://cdns.yellow-idea.com/moph/20250602/moph-flex-header-1.png';

  // Build Google Maps Link from lat/lng or location string
  let googleMapUrl = 'https://www.google.com/maps';
  if (caseItem.latitude && caseItem.longitude) {
    googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${caseItem.latitude},${caseItem.longitude}`;
  } else if (caseItem.location) {
    const coordsMatch = caseItem.location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (coordsMatch) {
      googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${coordsMatch[1]},${coordsMatch[2]}`;
    } else {
      googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(caseItem.location)}`;
    }
  }

  // Format NIHSS severity string cleanly without duplicate parentheses
  let nihssDisplay = null;
  let triageAdvice = 'เตรียมห้องฉุกเฉินและซักประวัติเพิ่ม';
  if (caseItem.nihss_total !== undefined && caseItem.nihss_total !== null) {
    const total = Number(caseItem.nihss_total);
    let severityClean = caseItem.nihss_severity || '';
    // Clean outer parentheses if present in database string
    severityClean = severityClean.replace(/^\((.*)\)$/, '$1');

    nihssDisplay = `${total} คะแนน ${severityClean ? `• ${severityClean}` : ''}`;

    if (total >= 15) {
      triageAdvice = '🚨 เสี่ยงสูง: แจ้งแพทย์เฉพาะทาง / เตรียม CT Brain & Stroke Unit ด่วน';
    } else if (total >= 5) {
      triageAdvice = '⚠️ ปานกลาง: เตรียมพยาบาล FAST Track & จองคิว CT Scan ด่วน';
    } else {
      triageAdvice = 'ℹ️ เสี่ยงต่ำ: ประเมินอาการซ้ำทางกายภาพและติดตาม Vital Signs';
    }
  }

  // Calculate Onset Golden Hour Status
  let onsetDisplay = 'ไม่ระบุ';
  let goldenHourTag = '⚡ stroke fast track';
  if (caseItem.onset_iso) {
    try {
      const onsetTime = new Date(caseItem.onset_iso);
      const diffMinutes = Math.floor((now.getTime() - onsetTime.getTime()) / (1000 * 60));
      if (diffMinutes >= 0) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        const timeAgo = hours > 0 ? `${hours} ชม. ${mins} นาที` : `${mins} นาที`;
        
        if (diffMinutes <= 270) { // 4.5 hours = 270 mins (Golden Hour for iv rTPA)
          goldenHourTag = '⏱️ อยู่ใน Golden Hour (iv rTPA Candidate)';
          onsetDisplay = `${timeAgo} ที่แล้ว (${goldenHourTag})`;
        } else {
          goldenHourTag = '⚠️ เกิน 4.5 ชม. (ประเมิน Thrombectomy Candidate)';
          onsetDisplay = `${timeAgo} ที่แล้ว (${goldenHourTag})`;
        }
      }
    } catch (e) {
      onsetDisplay = caseItem.onset_iso;
    }
  }

  const bodyData = {
    messages: [
      {
        type: 'text',
        text: `🚨 แจ้งเหตุผู้ป่วย Stroke FAST Track! [${caseItem.id}]\nผู้ป่วย: ${caseItem.patient_name} (${caseItem.age || '-'} ปี, ${caseItem.sex})\nอาการ FAST:\n${fastSummaryText}\nนำส่ง: ${caseItem.hospital_name || hospitalLine1}\nพิกัด Google Maps: ${googleMapUrl}`,
      },
      {
        type: 'flex',
        altText: `🚨 แจ้งเหตุ Stroke Fast Track: ${caseItem.patient_name} [${caseItem.id}]`,
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '0px',
            contents: [
              {
                type: 'image',
                url: headerImage,
                size: 'full',
                aspectMode: 'cover',
                aspectRatio: '3120:885',
              },
            ],
          },
          body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '16px',
            spacing: 'md',
            contents: [
              // Header Badge & Case ID (rounded-md style)
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FEF2F2',
                borderWidth: '1px',
                borderColor: '#FCA5A5',
                cornerRadius: '8px',
                paddingAll: '10px',
                contents: [
                  {
                    type: 'text',
                    text: `🚨 แจ้งเหตุวิกฤต [${caseItem.id}]`,
                    weight: 'bold',
                    color: '#DC2626',
                    size: 'md',
                    align: 'center',
                    adjustMode: 'shrink-to-fit',
                  },
                ],
              },

              // Patient & Clinical Data Section (Strict Column Grid Alignment)
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#F8FAFC',
                cornerRadius: '8px',
                paddingAll: '12px',
                spacing: 'sm',
                contents: [
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      { type: 'text', text: '👤 ผู้ป่วย:', color: '#64748B', size: 'xs', flex: 4, weight: 'bold', adjustMode: 'shrink-to-fit' },
                      { type: 'text', text: `${caseItem.patient_name} (${caseItem.age || '-'} ปี, ${caseItem.sex})`, color: '#0F172A', size: 'xs', flex: 7, weight: 'bold', wrap: true },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      { type: 'text', text: '⚡ อาการ FAST:', color: '#64748B', size: 'xs', flex: 4, weight: 'bold', adjustMode: 'shrink-to-fit' },
                      { type: 'text', text: fastSummaryText, color: '#D97706', size: 'xs', flex: 7, weight: 'bold', wrap: true },
                    ],
                  },
                  ...(nihssDisplay ? [{
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      { type: 'text', text: '🧠 NIHSS Score:', color: '#64748B', size: 'xs', flex: 4, weight: 'bold', adjustMode: 'shrink-to-fit' },
                      { type: 'text', text: nihssDisplay, color: '#6D28D9', size: 'xs', flex: 7, weight: 'bold', wrap: true },
                    ],
                  }] : []),
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      { type: 'text', text: '⏱️ ระยะเวลาเกิด:', color: '#64748B', size: 'xs', flex: 4, weight: 'bold', adjustMode: 'shrink-to-fit' },
                      { type: 'text', text: onsetDisplay, color: '#0284C7', size: 'xs', flex: 7, weight: 'bold', wrap: true },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      { type: 'text', text: '🚑 หน่วยส่งต่อ:', color: '#64748B', size: 'xs', flex: 4, weight: 'bold', adjustMode: 'shrink-to-fit' },
                      { type: 'text', text: caseItem.fr_name || '-', color: '#0F172A', size: 'xs', flex: 7, wrap: true },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      { type: 'text', text: '📍 พิกัดรับเหตุ:', color: '#64748B', size: 'xs', flex: 4, weight: 'bold', adjustMode: 'shrink-to-fit' },
                      { type: 'text', text: caseItem.location || '-', color: '#0F172A', size: 'xs', flex: 7, wrap: true },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      { type: 'text', text: 'ประเภทการมา:', color: '#64748B', size: 'xs', flex: 4, weight: 'bold', adjustMode: 'shrink-to-fit' },
                      { type: 'text', text: parsedArrivalType, color: parsedArrivalType === 'EMS' ? '#D97706' : '#0F172A', size: 'xs', weight: 'bold', flex: 7, wrap: true },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      { type: 'text', text: 'ตำบล:', color: '#64748B', size: 'xs', flex: 4, weight: 'bold', adjustMode: 'shrink-to-fit' },
                      { type: 'text', text: parsedTambon, color: '#0F172A', size: 'xs', flex: 7, wrap: true },
                    ],
                  },
                ],
              },

              // Clinical Triage / Medical Recommendation Box (rounded-md style)
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#EFF6FF',
                borderWidth: '1px',
                borderColor: '#BFDBFE',
                cornerRadius: '8px',
                paddingAll: '10px',
                contents: [
                  {
                    type: 'text',
                    text: '💡 ข้อแนะนำการเตรียมทีม ER / Triage:',
                    size: 'xs',
                    weight: 'bold',
                    color: '#1D4ED8',
                  },
                  {
                    type: 'text',
                    text: triageAdvice,
                    size: 'xs',
                    color: '#1E40AF',
                    wrap: true,
                    margin: 'xs',
                  },
                ],
              },

              // Hospital Destination Branding Box (Line 1 BLACK, Line 2 SMALL RED, rounded-md)
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'md',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderWidth: '1px',
                borderColor: '#E2E8F0',
                cornerRadius: '8px',
                paddingAll: '10px',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    maxWidth: '44px',
                    maxHeight: '44px',
                    cornerRadius: '100px',
                    contents: [
                      {
                        type: 'image',
                        url: hospitalLogo,
                        size: 'full',
                        aspectMode: 'cover',
                      },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    contents: [
                      {
                        type: 'text',
                        text: hospitalLine1,
                        weight: 'bold',
                        size: 'sm',
                        color: '#0F172A',
                        wrap: true,
                      },
                      {
                        type: 'text',
                        text: hospitalLine2,
                        weight: 'bold',
                        size: 'xs',
                        color: '#DC2626',
                        wrap: true,
                        margin: 'xs',
                      },
                    ],
                  },
                ],
              },

              // Action Button 1: Google Maps Navigation
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '🗺️ เปิดแผนที่นำทาง Google Maps',
                  uri: googleMapUrl,
                },
                style: 'primary',
                color: '#0284C7',
                height: 'sm',
              },

              // Action Button 2: Open System
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: 'เข้าสู่ระบบ TUNJAI',
                  uri: 'https://kamalasai-hosp.moph.go.th/tunjai/',
                },
                style: 'primary',
                color: '#0d9488',
                height: 'sm',
                margin: 'sm',
              },

              {
                type: 'separator',
                margin: 'xs',
              },

              // Date & Time Row (Strict Thai BE Format)
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    flex: 3,
                    contents: [
                      {
                        type: 'text',
                        text: 'วันที่',
                        size: 'xs',
                        color: '#64748B',
                        align: 'start',
                        gravity: 'center',
                        flex: 0,
                      },
                      {
                        type: 'text',
                        text: dateStr,
                        size: 'xs',
                        weight: 'bold',
                        color: '#334155',
                        align: 'start',
                        gravity: 'center',
                        margin: 'sm',
                        wrap: true,
                        adjustMode: 'shrink-to-fit',
                      },
                    ],
                  },
                  {
                    type: 'separator',
                    margin: 'sm',
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    flex: 2,
                    contents: [
                      {
                        type: 'text',
                        text: 'เวลา',
                        size: 'xs',
                        color: '#64748B',
                        align: 'start',
                        gravity: 'center',
                        flex: 0,
                        margin: 'md',
                      },
                      {
                        type: 'text',
                        text: timeStr,
                        size: 'xs',
                        weight: 'bold',
                        color: '#334155',
                        align: 'start',
                        gravity: 'center',
                        margin: 'sm',
                        wrap: true,
                        adjustMode: 'shrink-to-fit',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    ],
  };

  try {
    const fetchRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-key': clientKey,
        'secret-key': secretKey,
      },
      body: JSON.stringify(bodyData),
    });

    const resJson = await fetchRes.json().catch(() => ({ message: 'Invalid JSON response' }));
    console.log(`📲 MOPH Notify API Sent Response [${fetchRes.status}]:`, resJson);
    return { status: fetchRes.status, data: resJson };
  } catch (err) {
    console.error('❌ MOPH Notify Network Exception:', err.message);
    return { status: 500, error: err.message };
  }
}

// ── Admin System Settings (MOPH Notify Config) Endpoints ────────────────────
app.get('/api/settings/moph-notify', async (req, res) => {
  let settingsMap = {
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

  if (isDbConnected()) {
    try {
      const [rows] = await getPool().query('SELECT * FROM system_settings WHERE key_name LIKE "moph_notify_%"');
      rows.forEach((r) => {
        settingsMap[r.key_name] = r.value_text;
      });
    } catch (e) {
      console.error('Error reading MOPH Notify settings:', e.message);
    }
  }

  res.json(settingsMap);
});

app.put('/api/settings/moph-notify', async (req, res) => {
  const {
    moph_notify_enabled,
    moph_notify_env,
    moph_notify_endpoint,
    moph_notify_client_key,
    moph_notify_secret_key,
    moph_notify_hospital_line1,
    moph_notify_hospital_line2,
    moph_notify_hospital_logo,
    moph_notify_header_image,
  } = req.body;

  const entries = [
    ['moph_notify_enabled', String(moph_notify_enabled)],
    ['moph_notify_env', moph_notify_env || 'PROD'],
    ['moph_notify_endpoint', moph_notify_endpoint || 'https://morpromt2f.moph.go.th/api/notify/send'],
    ['moph_notify_client_key', moph_notify_client_key || ''],
    ['moph_notify_secret_key', moph_notify_secret_key || ''],
    ['moph_notify_hospital_line1', moph_notify_hospital_line1 || 'โรงพยาบาล'],
    ['moph_notify_hospital_line2', moph_notify_hospital_line2 || ''],
    ['moph_notify_hospital_logo', moph_notify_hospital_logo || ''],
    ['moph_notify_header_image', moph_notify_header_image || ''],
  ];

  if (isDbConnected()) {
    try {
      for (const [k, v] of entries) {
        await getPool().query(
          `INSERT INTO system_settings (key_name, value_text, updated_by) VALUES (?, ?, 'admin')
           ON DUPLICATE KEY UPDATE value_text = VALUES(value_text), updated_by = 'admin'`,
          [k, v]
        );
      }
    } catch (e) {
      console.error('Error saving MOPH Notify settings to DB:', e.message);
    }
  }

  await writeAuditLog(req, { username: 'admin', role: 'admin' }, 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API');
  res.json({ success: true, message: 'บันทึกการตั้งค่า MOPH Notify เรียบร้อยแล้ว' });
});

// POST Manual Test Send MOPH Notify
app.post('/api/settings/moph-notify/test', async (req, res) => {
  const testCase = {
    id: `TEST-${Math.floor(Math.random() * 9000 + 1000)}`,
    fr_name: 'เจ้าหน้าที่ทดสอบระบบ (Admin)',
    patient_name: 'นายทดสอบ ระบบหมอพร้อม',
    age: '65',
    sex: 'ชาย',
    location: 'ต.ในเมือง อ.เมือง จ.นครราชสีมา',
    hospital_name: req.body.moph_notify_hospital_line2 || 'โรงพยาบาลกมลาไสย',
    face: 1,
    arm: 1,
    speech: 1,
  };

  const result = await sendMophNotifyAlert(testCase);
  res.json({ success: true, result });
});

// PUT Update Case Status (e.g., accepted, arrived)
app.put('/api/cases/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (isDbConnected()) {
    try {
      await getPool().query('UPDATE cases SET status = ? WHERE id = ?', [status, id]);
    } catch (e) {
      console.error('Error updating case status in MySQL:', e.message);
    }
  }

  const idx = memoryCases.findIndex(c => c.id === id);
  if (idx !== -1) {
    memoryCases[idx].status = status;
  }

  // Write Audit Log
  await writeAuditLog(req, null, 'UPDATE_CASE_STATUS', `CASE:${id}`, `ปรับเปลี่ยนสถานะเคสเป็น: ${status}`);

  // Broadcast status update real-time
  io.emit('case_status_updated', { id, status });

  res.json({ success: true, id, status });
});

// GET Hospital Record for a case
app.get('/api/cases/:id/hospital-record', async (req, res) => {
  const { id } = req.params;
  if (isDbConnected()) {
    try {
      const [rows] = await getPool().query('SELECT * FROM hospital_records WHERE case_id = ?', [id]);
      if (rows.length > 0) return res.json(rows[0]);
    } catch (e) {
      console.error('Error fetching hospital_record:', e.message);
    }
  }
  const rec = memoryHospitalRecords.find(r => r.case_id === id);
  if (rec) return res.json(rec);
  res.status(404).json({ message: 'No hospital record found' });
});

// PUT Save / Update Hospital Record for a case
app.put('/api/cases/:id/hospital-record', async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const record = {
    case_id: id,
    recorded_by: body.recorded_by || '',
    er_arrival_time: body.er_arrival_time || null,
    arrival_mode: body.arrival_mode || null,
    refer_from_hospital: body.refer_from_hospital || null,
    stroke_track: body.stroke_track || null,
    stroke_activate_time: body.stroke_activate_time || null,
    er_weakness_side: body.er_weakness_side || null,
    er_communication: body.er_communication ? 1 : 0,
    er_speech_unclear: body.er_speech_unclear ? 1 : 0,
    er_facial_droop: body.er_facial_droop ? 1 : 0,
    er_unsteady_gait: body.er_unsteady_gait ? 1 : 0,
    er_visual_loss: body.er_visual_loss ? 1 : 0,
    er_drowsy: body.er_drowsy ? 1 : 0,
    er_gcs_e: body.er_gcs_e || null,
    er_gcs_v: body.er_gcs_v || null,
    er_gcs_m: body.er_gcs_m || null,
    er_motor_arm_left: body.er_motor_arm_left || null,
    er_motor_arm_right: body.er_motor_arm_right || null,
    er_motor_leg_left: body.er_motor_leg_left || null,
    er_motor_leg_right: body.er_motor_leg_right || null,
    er_nihss: body.er_nihss || null,
    blood_draw_time: body.blood_draw_time || null,
    lab_send_time: body.lab_send_time || null,
    lab_result_time: body.lab_result_time || null,
    ct_order_time: body.ct_order_time || null,
    ct_transfer_er_to_ct_time: body.ct_transfer_er_to_ct_time || null,
    ct_scan_time: body.ct_scan_time || null,
    ct_transfer_ct_to_er_time: body.ct_transfer_ct_to_er_time || null,
    ct_doctor_view_time: body.ct_doctor_view_time || null,
    ct_official_result_time: body.ct_official_result_time || null,
    ct_result_type: body.ct_result_type || null,
    consult_neuro_med_time: body.consult_neuro_med_time || null,
    rtpa_decision: body.rtpa_decision || null,
    rtpa_contraindication_reason: body.rtpa_contraindication_reason || null,
    rtpa_bw_kg: body.rtpa_bw_kg || null,
    rtpa_total_dose_mg: body.rtpa_total_dose_mg || null,
    rtpa_bolus_dose_mg: body.rtpa_bolus_dose_mg || null,
    rtpa_bolus_time: body.rtpa_bolus_time || null,
    rtpa_drip_dose_mg: body.rtpa_drip_dose_mg || null,
    rtpa_drip_time: body.rtpa_drip_time || null,
    rtpa_finish_time: body.rtpa_finish_time || null,
    consult_neuro_sx_time: body.consult_neuro_sx_time || null,
    consult_neuro_med_hemo_time: body.consult_neuro_med_hemo_time || null,
    surgery_decision: body.surgery_decision || null,
    surgery_time: body.surgery_time || null,
    refer_to_hospital: body.refer_to_hospital || null,
    refer_accept_time: body.refer_accept_time || null,
    transfer_center_contact_time: body.transfer_center_contact_time || null,
    transfer_depart_time: body.transfer_depart_time || null,
    problems_notes: body.problems_notes || null,
  };

  if (isDbConnected()) {
    try {
      const cols = Object.keys(record);
      const vals = Object.values(record);
      const placeholders = cols.map(() => '?').join(', ');
      const updates = cols.map(c => `${c} = VALUES(${c})`).join(', ');
      await getPool().query(
        `INSERT INTO hospital_records (${cols.join(', ')}) VALUES (${placeholders})
         ON DUPLICATE KEY UPDATE ${updates}`,
        vals
      );
    } catch (e) {
      console.error('Error saving hospital_record to MySQL:', e.message);
    }
  }

  // Memory fallback upsert
  const idx = memoryHospitalRecords.findIndex(r => r.case_id === id);
  if (idx !== -1) memoryHospitalRecords[idx] = { ...record, recorded_at: new Date().toISOString() };
  else memoryHospitalRecords.push({ ...record, recorded_at: new Date().toISOString() });

  io.emit('hospital_record_updated', { case_id: id });
  res.json({ success: true, case_id: id });
});

// DELETE Clear Hospital Record for a case
app.delete('/api/cases/:id/hospital-record', async (req, res) => {
  const { id } = req.params;
  if (isDbConnected()) {
    try {
      await getPool().query('DELETE FROM hospital_records WHERE case_id = ?', [id]);
    } catch (e) {
      console.error('Error deleting hospital_record from MySQL:', e.message);
    }
  }
  memoryHospitalRecords = memoryHospitalRecords.filter(r => r.case_id !== id);
  res.json({ success: true, message: 'Hospital record cleared successfully' });
});

// DELETE Single Case — also removes uploaded image files
app.delete('/api/cases/:id', async (req, res) => {
  const { id } = req.params;

  if (isDbConnected()) {
    try {
      await getPool().query('DELETE FROM cases WHERE id = ?', [id]);
    } catch (e) {
      console.error('Error deleting single case in MySQL:', e.message);
    }
  }

  memoryCases = memoryCases.filter(c => c.id !== id);

  // Remove image files from disk
  removeCaseImages(id);

  io.emit('case_deleted', { id });
  res.json({ success: true, id });
});

// DELETE Clear/Reset All Cases — also removes all uploaded image files
app.delete('/api/cases', async (req, res) => {
  if (isDbConnected()) {
    try {
      await getPool().query('DELETE FROM hospital_records');
      await getPool().query('DELETE FROM cases');
    } catch (e) {
      console.error('Error deleting cases in MySQL:', e.message);
    }
  }
  memoryCases = [];

  // Remove all case image directories
  try {
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
      fs.mkdirSync(UPLOADS_DIR, { recursive: true }); // re-create empty dir
    }
  } catch (err) {
    console.error('⚠️  Failed to clear uploads directory:', err.message);
  }

  io.emit('cases_reset');
  res.json({ success: true, message: 'All cases reset successfully' });
});

// Socket.io Real-Time Connection Setup
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Real-Time Alert Engine: ${socket.id}`);
  socket.emit('connection_status', { connected: true, mysql: isDbConnected() });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 ER-STAlert Express Backend running on http://localhost:${PORT}`);
});
