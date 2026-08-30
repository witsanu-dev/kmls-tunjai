# 🧠 ทันใจ | TUNJAI — STROKE ALERT & FAST Track Emergency System

ระบบแจ้งเหตุวิกฤตผู้ป่วยโรคหลอดเลือดสมอง (Stroke Alert & FAST Track) สำหรับห้องฉุกเฉิน (ER) และหน่วยกู้ชีพ (FR Dispatch) เชื่อมต่อระบบแจ้งเตือน LINE OA หมอพร้อม (MOPH Notify API) แบบ Real-time

---

## 🚀 คุณสมบัติระบบ (Features)

- 🚨 **Real-Time Stroke Alert Dispatch**: แจ้งเหตุผู้ป่วย Stroke FAST Track พร้อมระบุพิกัด ละติจูด/ลองจิจูด และภาพถ่าย
- 🗺️ **Google Maps Navigation Integration**: ปุ่มนำทางแผนที่กู้ชีพและทีมแพทย์ไปยังจุดเกิดเหตุได้ทันที
- 📲 **MOPH Notify (LINE OA หมอพร้อม Integration)**:
  - ส่งการ์ดแจ้งเตือน Flex Message เข้ากลุ่ม LINE อัตโนมัติเมื่อมีเคสใหม่
  - ปรับแต่ง **Header Banner Image** และ **โลโก้โรงพยาบาล** ได้ผ่านระบบ Admin Settings
  - แสดงผล **วัน-เดือน-ปี (พ.ศ.)** และเวลาอย่างมีมาตรฐาน
  - ประเมินคะแนน **NIHSS Score** และคำนวณ **Onset Golden Hour (4.5 ชั่วโมง)**
- 🏥 **ER & Fast Track Management**: หน้าจอติดตามเคสผู้ป่วยสำหรับพยาบาลประจำห้องฉุกเฉิน (ER Staff) และผู้บริหาร (Director)
- 🗄️ **MySQL Auto-Migration & Dynamic Settings**: รองรับฐานข้อมูล MySQL `db_stalert` พร้อมระบบ fallback ในหน่วยความจำ

---

## 🛠️ การติดตั้งและการใช้งาน (Getting Started)

### 1. Requirements
- **Node.js**: v18.0.0 ขึ้นไป
- **MySQL Database**: `db_stalert` (Default: `127.0.0.1:3306`, user: `root`, pass: `password`)

### 2. Clone Repository
```bash
git clone https://github.com/witsanu-dev/kmls-tunjai.git
cd kmls-tunjai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development (Full-Stack Single Command)
รันทั้ง **Express Backend (Port 5000)** และ **Vite Frontend (Port 5173)** พร้อมกันด้วยคำสั่งเดียว:
```bash
npm start
```
หรือ
```bash
npm run dev:all
```

---

## 🌐 Endpoints & Ports

- **Frontend Application**: `http://localhost:5173`
- **Express Backend API**: `http://localhost:5000`
- **MOPH Notify Settings**: `http://localhost:5173/#/admin/moph-notify`

---

## 📝 License
พัฒนาเพื่อใช้ในระบบการแพทย์ฉุกเฉินและการส่งต่อผู้ป่วยโรคหลอดเลือดสมองวิกฤต
