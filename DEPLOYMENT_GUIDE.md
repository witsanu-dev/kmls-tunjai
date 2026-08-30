# 🚀 คู่มือการ Deploy และ Update ระบบทันใจ (TUNJAI Stroke Alert)

เอกสารนี้รวบรวมคำสั่ง สถาปัตยกรรมระบบ และขั้นตอนการปรับปรุงแก้ไขโปรเจกต์ **TUNJAI** ขึ้นบน **Production Server** อย่างเป็นขั้นตอนและครบถ้วนที่สุด

---

## 📌 1. ข้อมูลระบบและสถาปัตยกรรม (System Information)

- **GitHub Repository**: `https://github.com/witsanu-dev/kmls-tunjai.git`
- **Server IP**: `10.250.101.11`
- **Domain Web Access**: `http://kamalasai-hosp.moph.go.th/tunjai`
- **Server OS**: Linux (RHEL / CentOS / AlmaLinux)
- **Directory Path บน Server**: `/home/wsnapp/er-stalert`
- **Web Server Link Path**: `/var/www/html/tunjai` (Symbolic Link ไปยัง `/home/wsnapp/er-stalert/dist`)
- **Backend Node.js Service (PM2)**: Process Name `er-stalert` (Port 5000)
- **Database**: MySQL (`host: 127.0.0.1`, `user: wordpress`, `pass: @Wordpress11078`, `db: db_stalert`, `port: 3306`)

---

## 🔄 2. ขั้นตอนการ อัปเดตระบบ (Update Next Version)

เมื่อมีการแก้ไขโค้ดฝั่งเครื่อง Development (Windows) และ push ขึ้น GitHub เรียบร้อยแล้ว ให้ทำตามขั้นตอนอัปเดตบน Server ดังนี้:

### Step 1: สั่ง Push โค้ดจากเครื่องคุณ (Windows Development)
```powershell
git add .
git commit -m "feat/fix: อธิบายสิ่งที่แก้ไข"
git push origin main
```

### Step 2: สั่ง Update บน Server (ผ่าน SSH Terminal)
```bash
# 1. สลับเป็นสิทธิ์ root และเข้าไปที่โฟลเดอร์โปรเจกต์
sudo su
cd /home/wsnapp/er-stalert

# 2. ดึงโค้ดล่าสุดจาก GitHub
git pull origin main

# 3. ติดตั้ง Package ใหม่ (ถ้ามี) และทำการ Build หน้าเว็บ Frontend
npm install
npm run build

# 4. รีสตาร์ตบริการ Backend ด้วย PM2
pm2 restart er-stalert

# 5. บันทึกสถานะ PM2 (ถ้ามีการปรับเปลี่ยนสคริปต์)
pm2 save
```

---

## 🛠️ 3. คำสั่งและไฟล์ตั้งค่าที่สำคัญบน Server (Reference Configuration)

### 3.1 การส่งต่อ API ด้วย Apache `.htaccess`
ไฟล์ตำแหน่ง: `/home/wsnapp/er-stalert/dist/.htaccess`
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /tunjai/

  # 1. Proxy ying API request to Express Backend (Port 5000)
  RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]
  RewriteRule ^uploads/(.*)$ http://127.0.0.1:5000/uploads/$1 [P,L]

  # 2. Single Page Application (SPA) Fallback
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /tunjai/index.html [L]
</IfModule>
```

### 3.2 การส่งต่อ Apache Proxy Global Config
ไฟล์ตำแหน่ง: `/etc/httpd/conf.d/tunjai_proxy.conf`
```apache
<IfModule mod_proxy.c>
    ProxyPass /tunjai/api/ http://127.0.0.1:5000/api/
    ProxyPassReverse /tunjai/api/ http://127.0.0.1:5000/api/

    ProxyPass /tunjai/socket.io/ ws://127.0.0.1:5000/socket.io/
    ProxyPassReverse /tunjai/socket.io/ ws://127.0.0.1:5000/socket.io/

    ProxyPass /tunjai/uploads/ http://127.0.0.1:5000/uploads/
    ProxyPassReverse /tunjai/uploads/ http://127.0.0.1:5000/uploads/
</IfModule>
```

---

## ⚡ 4. การจัดการ PM2 Process Manager

| คำสั่ง | คำอธิบาย |
|---|---|
| `pm2 list` | ดูรายชื่อโปรเซสทั้งหมดที่กำลังรันอยู่ |
| `pm2 status er-stalert` | ดูรายละเอียดของโปรเซส er-stalert |
| `pm2 restart er-stalert` | รีสตาร์ตบริการ Backend Express |
| `pm2 logs er-stalert` | ดู Log การทำงานหรือ Error ของ Backend |
| `pm2 save` | บันทึกรายการโปรเซสไว้รันอัตโนมัติเมื่อ Reboot Server |

---

## 🏥 5. ข้อมูลผู้พัฒนา (Developer Credit)

- **ระบบ**: ทันใจ | TUNJAI (Stroke Alert FAST Track System)
- **เวอร์ชัน**: `69.8.1.31`
- **พัฒนาโดย**: นายวิษณุ ศรีโยธา (นักวิชาการคอมพิวเตอร์)
- **หน่วยงาน**: กลุ่มงานสุขภาพดิจิทัล โรงพยาบาลกมลาไสย จังหวัดกาฬสินธุ์
