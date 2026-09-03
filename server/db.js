import mysql from 'mysql2/promise';

// Database config parameters matching requirement:
// host: 127.0.0.1, user: root, pass: password, db: db_stalert, port: 3306
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'wordpress',
  password: process.env.DB_PASSWORD || '@Wordpress11078',
  database: process.env.DB_NAME || 'db_stalert',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let isConnected = false;

export async function initDbPool() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database db_stalert successfully (127.0.0.1:3306)');

    // Auto Create Tables in db_stalert if they don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hospitals\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`name\` VARCHAR(255) NOT NULL,
        \`level\` VARCHAR(50) DEFAULT 'โรงพยาบาลศูนย์ / รพศ.',
        \`phone\` VARCHAR(50) DEFAULT '',
        \`phone2\` VARCHAR(50) DEFAULT '',
        \`phone3\` VARCHAR(50) DEFAULT '',
        \`address\` VARCHAR(255) DEFAULT '',
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure phone2 and phone3 columns exist in hospitals table
    try {
      await connection.query(`ALTER TABLE \`hospitals\` ADD COLUMN \`phone2\` VARCHAR(50) DEFAULT '';`);
    } catch (e) { }
    try {
      await connection.query(`ALTER TABLE \`hospitals\` ADD COLUMN \`phone3\` VARCHAR(50) DEFAULT '';`);
    } catch (e) { }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cases\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`fr_name\` VARCHAR(150) NOT NULL,
        \`patient_name\` VARCHAR(150) DEFAULT 'ไม่ทราบชื่อ',
        \`age\` VARCHAR(20) DEFAULT '',
        \`sex\` VARCHAR(20) DEFAULT 'ไม่ระบุ',
        \`id_photo_url\` LONGTEXT DEFAULT NULL,
        \`location\` VARCHAR(255) NOT NULL,
        \`latitude\` DECIMAL(10, 8) DEFAULT NULL,
        \`longitude\` DECIMAL(11, 8) DEFAULT NULL,
        \`hospital_id\` INT DEFAULT 1,
        \`hospital_name\` VARCHAR(255) DEFAULT 'โรงพยาบาลมหาราช',
        \`face\` TINYINT(1) DEFAULT 0,
        \`arm\` TINYINT(1) DEFAULT 0,
        \`speech\` TINYINT(1) DEFAULT 0,
        \`onset_iso\` VARCHAR(100) DEFAULT NULL,
        \`nihss_total\` INT DEFAULT NULL,
        \`nihss_severity\` VARCHAR(100) DEFAULT NULL,
        \`additional_photos_json\` MEDIUMTEXT DEFAULT NULL,
        \`status\` ENUM('new', 'accepted', 'arrived', 'cancelled') DEFAULT 'new',
        \`reported_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure additional_photos_json column exists in cases table
    try {
      await connection.query(`
        ALTER TABLE \`cases\` ADD COLUMN \`additional_photos_json\` MEDIUMTEXT DEFAULT NULL;
      `);
    } catch (e) {
      // Ignore if column already exists
    }

    // Production mode: Ensure cases table exists (no dummy sample cases auto-inserted)

    // Update Kamalasai Hospital phone numbers to exact requested values
    await connection.query(`
      UPDATE \`hospitals\`
      SET \`phone\` = '043 899 570 ต่อ 271',
          \`phone2\` = '043 899 570 ต่อ 666',
          \`phone3\` = '091 064 6395'
      WHERE \`code\` = '11078' OR \`name\` LIKE '%กมลาไสย%';
    `);

    // Insert initial hospitals if table is empty
    const [hospRows] = await connection.query('SELECT COUNT(*) as count FROM hospitals');
    if (hospRows[0].count === 0) {
      await connection.query(`
        INSERT INTO \`hospitals\` (\`code\`, \`name\`, \`level\`, \`phone\`, \`phone2\`, \`phone3\`, \`address\`) VALUES
        ('11078', 'โรงพยาบาลกมลาไสย', 'โรงพยาบาลชุมชน (F2)', '043 899 570 ต่อ 271', '043 899 570 ต่อ 666', '091 064 6395', 'อ.กมลาไสย จ.กาฬสินธุ์'),
        ('HSP001', 'โรงพยาบาลมหาราช / ER Fast Track Center', 'รพ.ศูนย์ (Level 1)', '044-234500', '044-234200', '1669', 'อ.เมือง จ.นครราชสีมา'),
        ('HSP002', 'โรงพยาบาลเทพรัตน์นครราชสีมา', 'รพ.ทั่วไป (Level 2)', '044-395000', '044-395111', '1669', 'อ.เมือง จ.นครราชสีมา'),
        ('HSP003', 'โรงพยาบาลค่ายสุรนารี', 'รพ.สังกัดกระทรวงกลาโหม', '044-255711', '044-255722', '1669', 'อ.เมือง จ.นครราชสีมา'),
        ('HSP004', 'โรงพยาบาลกรุงเทพ-ราชสีมา', 'รพ.เอกชน', '044-015999', '044-015900', '1669', 'อ.เมือง จ.นครราชสีมา');
      `);
      console.log('🌱 Seeded default hospitals into MySQL db_stalert');
    }



    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(150) NOT NULL,
        \`role\` ENUM('admin', 'fr_dispatch', 'er_staff', 'director') NOT NULL DEFAULT 'fr_dispatch',
        \`agency_name\` VARCHAR(200) DEFAULT '',
        \`hospital_id\` INT DEFAULT NULL,
        \`hospital_name\` VARCHAR(255) DEFAULT '',
        \`phone\` VARCHAR(50) DEFAULT '',
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`last_login_at\` DATETIME DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create User Sessions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`user_sessions\` (
        \`token\` VARCHAR(128) PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`expires_at\` DATETIME NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Audit Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT DEFAULT NULL,
        \`username\` VARCHAR(50) DEFAULT 'system',
        \`full_name\` VARCHAR(150) DEFAULT '',
        \`role\` VARCHAR(50) DEFAULT '',
        \`action\` VARCHAR(100) NOT NULL,
        \`target_resource\` VARCHAR(100) DEFAULT '',
        \`details\` TEXT DEFAULT NULL,
        \`ip_address\` VARCHAR(50) DEFAULT '',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_user_action\` (\`user_id\`, \`action\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create System Settings table for MOPH Notify & Integration Configs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`system_settings\` (
        \`key_name\` VARCHAR(100) PRIMARY KEY,
        \`value_text\` TEXT DEFAULT NULL,
        \`updated_by\` VARCHAR(150) DEFAULT 'system',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default MOPH Notify settings if missing
    await connection.query(`
      INSERT INTO \`system_settings\` (\`key_name\`, \`value_text\`, \`updated_by\`) VALUES
      ('moph_notify_enabled', 'true', 'system'),
      ('moph_notify_env', 'PROD', 'system'),
      ('moph_notify_endpoint', 'https://morpromt2f.moph.go.th/api/notify/send', 'system'),
      ('moph_notify_client_key', 'd6078e5cf778468032ea725035b0181e2bfbf9ae', 'system'),
      ('moph_notify_secret_key', '3O3N65YXG7U3WQRO4GBAQV3EC3SY', 'system'),
      ('moph_notify_hospital_line1', 'โรงพยาบาล', 'system'),
      ('moph_notify_hospital_line2', 'กมลาไสย (Stroke Fast Track)', 'system'),
      ('moph_notify_hospital_logo', 'https://morpromt2c.moph.go.th/image/image_3771a3e8-57d0-4fe0-b0f8-3c97427eb201.png', 'system'),
      ('moph_notify_header_image', 'https://cdns.yellow-idea.com/moph/20250602/moph-flex-header-1.png', 'system')
      ON DUPLICATE KEY UPDATE \`key_name\` = VALUES(\`key_name\`);
    `);

    // Seed default users for standard production roles
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      await connection.query(`
        INSERT INTO \`users\` (\`username\`, \`password_hash\`, \`full_name\`, \`role\`, \`agency_name\`, \`hospital_id\`, \`hospital_name\`, \`phone\`) VALUES
        ('admin', 'admin123', 'ผู้ดูแลระบบสูงสุด (System Admin)', 'admin', 'ศูนย์อำนวยการระบบการแพทย์ฉุกเฉิน', NULL, 'ศูนย์อำนวยการกลาง', '043-000000'),
        ('fr01', 'fr123', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'ศูนย์กู้ชีพเทศบาลตำบลกมลาไสย', 1, 'โรงพยาบาลกมลาไสย', '081-111-1111'),
        ('er01', 'er123', 'พยาบาลวิชาชีพ ประจำ ER', 'er_staff', 'ห้องฉุกเฉิน (ER)', 1, 'โรงพยาบาลกมลาไสย', '043-891008'),
        ('director01', 'dir123', 'นพ.ผู้อำนวยการ รพ.', 'director', 'ผู้บริหารทางการแพทย์', 1, 'โรงพยาบาลกมลาไสย', '043-891000');
      `);
      console.log('🌱 Seeded default production users into MySQL db_stalert');
    }

    connection.release();
    isConnected = true;
    return true;
  } catch (err) {
    console.warn('⚠️ MySQL Connection / Initialization Failed:', err.message);
    console.warn('⚠️ Server will operate with fallback memory state until MySQL tables are created.');
    isConnected = false;
    return false;
  }
}

export function getPool() {
  return pool;
}

export function isDbConnected() {
  return isConnected;
}
