-- ===================================================
-- Database: db_stalert (ER-STAlert Emergency System)
-- Host: 127.0.0.1:3306
-- User: root / Pass: password
-- ===================================================

CREATE DATABASE IF NOT EXISTS `db_stalert` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_stalert`;

-- Table 1: Hospitals (โรงพยาบาลปลายทาง)
CREATE TABLE IF NOT EXISTS `hospitals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `level` VARCHAR(50) DEFAULT 'โรงพยาบาลศูนย์ / รพศ.',
  `phone` VARCHAR(50) DEFAULT '',
  `address` VARCHAR(255) DEFAULT '',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample hospitals
INSERT INTO `hospitals` (`code`, `name`, `level`, `phone`, `address`) VALUES
('HSP001', 'โรงพยาบาลมหาราช / ER Fast Track Center', 'รพ.ศูนย์ (Level 1)', '044-234500', 'อ.เมือง จ.นครราชสีมา'),
('HSP002', 'โรงพยาบาลเทพรัตน์นครราชสีมา', 'รพ.ทั่วไป (Level 2)', '044-395000', 'อ.เมือง จ.นครราชสีมา'),
('HSP003', 'โรงพยาบาลค่ายสุรนารี', 'รพ.สังกัดกระทรวงกลาโหม', '044-255711', 'อ.เมือง จ.นครราชสีมา'),
('HSP004', 'โรงพยาบาลกรุงเทพ-ราชสีมา', 'รพ.เอกชน', '044-015999', 'อ.เมือง จ.นครราชสีมา')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Table 2: Emergency Cases (รายการแจ้งเหตุ emergency / stroke alert)
CREATE TABLE IF NOT EXISTS `cases` (
  `id` VARCHAR(50) PRIMARY KEY,
  `fr_name` VARCHAR(150) NOT NULL,
  `patient_name` VARCHAR(150) DEFAULT 'ไม่ทราบชื่อ',
  `age` VARCHAR(20) DEFAULT '',
  `sex` VARCHAR(20) DEFAULT 'ไม่ระบุ',
  `id_photo_url` LONGTEXT DEFAULT NULL,
  `location` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `hospital_id` INT DEFAULT 1,
  `hospital_name` VARCHAR(255) DEFAULT 'โรงพยาบาลมหาราช',
  `face` TINYINT(1) DEFAULT 0,
  `arm` TINYINT(1) DEFAULT 0,
  `speech` TINYINT(1) DEFAULT 0,
  `onset_iso` VARCHAR(100) DEFAULT NULL,
  `nihss_total` INT DEFAULT NULL,
  `nihss_severity` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('new', 'accepted', 'arrived', 'cancelled') DEFAULT 'new',
  `reported_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample test cases for demonstration
INSERT INTO `cases` 
(`id`, `fr_name`, `patient_name`, `age`, `sex`, `location`, `latitude`, `longitude`, `hospital_id`, `hospital_name`, `face`, `arm`, `speech`, `onset_iso`, `nihss_total`, `nihss_severity`, `status`) 
VALUES
('SK-89A12', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'นายสมศักดิ์ รุ่งเรือง', '64', 'ชาย', '14.9723, 102.0831 - ต.ในเมือง อ.เมือง', 14.97230000, 102.08310000, 1, 'โรงพยาบาลมหาราช', 1, 1, 0, DATE_SUB(NOW(), INTERVAL 45 MINUTE), 8, 'ปานกลาง', 'new'),
('SK-77B45', 'วิชัย ปลอดภัย (อสม. หมู่ 3)', 'นางมาลี สุขสันต์', '71', 'หญิง', '14.9611, 102.0945 - บ้านโพธิ์ ต.ในเมือง', 14.96110000, 102.09450000, 1, 'โรงพยาบาลมหาราช', 1, 1, 1, DATE_SUB(NOW(), INTERVAL 90 MINUTE), 14, 'ปานกลาง', 'accepted')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);
