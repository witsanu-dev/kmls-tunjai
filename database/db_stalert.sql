/*
 Navicat Premium Data Transfer

 Source Server         : MySQL Appserv - 127.0.0.1 3306
 Source Server Type    : MySQL
 Source Server Version : 80017 (8.0.17)
 Source Host           : localhost:3306
 Source Schema         : db_stalert

 Target Server Type    : MySQL
 Target Server Version : 80017 (8.0.17)
 File Encoding         : 65001

 Date: 31/08/2026 02:10:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NULL DEFAULT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'system',
  `full_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_resource` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_action`(`user_id` ASC, `action` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 56 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------
INSERT INTO `audit_logs` VALUES (1, 2, 'fr01', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:02:50');
INSERT INTO `audit_logs` VALUES (2, 2, 'fr01', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:03:01');
INSERT INTO `audit_logs` VALUES (3, 3, 'er01', 'พยาบาลวิชาชีพ ประจำ ER', 'er_staff', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:03:03');
INSERT INTO `audit_logs` VALUES (4, 3, 'er01', 'พยาบาลวิชาชีพ ประจำ ER', 'er_staff', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:03:15');
INSERT INTO `audit_logs` VALUES (5, 1, 'admin', 'ผู้ดูแลระบบสูงสุด (System Admin)', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:03:19');
INSERT INTO `audit_logs` VALUES (6, 1, 'admin', 'ผู้ดูแลระบบสูงสุด (System Admin)', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:04:38');
INSERT INTO `audit_logs` VALUES (7, 2, 'fr01', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:04:45');
INSERT INTO `audit_logs` VALUES (8, 2, 'fr01', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:05:04');
INSERT INTO `audit_logs` VALUES (9, 2, 'fr01', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:11:27');
INSERT INTO `audit_logs` VALUES (10, 2, 'fr01', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:12:04');
INSERT INTO `audit_logs` VALUES (11, 1, 'admin', 'ผู้ดูแลระบบสูงสุด (System Admin)', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:12:08');
INSERT INTO `audit_logs` VALUES (12, 1, 'admin', 'ผู้ดูแลระบบสูงสุด (System Admin)', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:13:35');
INSERT INTO `audit_logs` VALUES (13, 1, 'admin', 'ผู้ดูแลระบบสูงสุด (System Admin)', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:14:09');
INSERT INTO `audit_logs` VALUES (14, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:1', 'อัปเดตข้อมูลผู้ใช้ ID 1', '::1', '2026-08-22 18:18:27');
INSERT INTO `audit_logs` VALUES (15, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:18:34');
INSERT INTO `audit_logs` VALUES (16, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:18:40');
INSERT INTO `audit_logs` VALUES (17, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:22:01');
INSERT INTO `audit_logs` VALUES (18, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:24:34');
INSERT INTO `audit_logs` VALUES (19, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:24:37');
INSERT INTO `audit_logs` VALUES (20, 2, 'fr01', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:24:44');
INSERT INTO `audit_logs` VALUES (21, 2, 'fr01', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-22 18:55:30');
INSERT INTO `audit_logs` VALUES (22, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-22 18:55:35');
INSERT INTO `audit_logs` VALUES (23, NULL, 'guest', 'ผู้ใช้งานภายนอก', 'guest', 'UPDATE_CASE_STATUS', 'CASE:SK-34E19', 'ปรับเปลี่ยนสถานะเคสเป็น: arrived', '::1', '2026-08-22 19:10:11');
INSERT INTO `audit_logs` VALUES (24, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-30 23:27:23');
INSERT INTO `audit_logs` VALUES (25, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-30 23:31:22');
INSERT INTO `audit_logs` VALUES (26, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-30 23:33:35');
INSERT INTO `audit_logs` VALUES (27, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-30 23:36:01');
INSERT INTO `audit_logs` VALUES (28, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-30 23:41:07');
INSERT INTO `audit_logs` VALUES (29, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-30 23:41:46');
INSERT INTO `audit_logs` VALUES (30, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-30 23:43:01');
INSERT INTO `audit_logs` VALUES (31, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-30 23:46:40');
INSERT INTO `audit_logs` VALUES (32, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-30 23:51:32');
INSERT INTO `audit_logs` VALUES (33, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-30 23:54:21');
INSERT INTO `audit_logs` VALUES (34, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-30 23:56:53');
INSERT INTO `audit_logs` VALUES (35, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:26:19');
INSERT INTO `audit_logs` VALUES (36, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:27:54');
INSERT INTO `audit_logs` VALUES (37, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::1', '2026-08-31 00:30:45');
INSERT INTO `audit_logs` VALUES (38, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::1', '2026-08-31 00:30:50');
INSERT INTO `audit_logs` VALUES (39, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:33:06');
INSERT INTO `audit_logs` VALUES (40, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:33:23');
INSERT INTO `audit_logs` VALUES (41, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:35:34');
INSERT INTO `audit_logs` VALUES (42, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:39:18');
INSERT INTO `audit_logs` VALUES (43, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:45:51');
INSERT INTO `audit_logs` VALUES (44, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:46:06');
INSERT INTO `audit_logs` VALUES (45, NULL, 'วิษณุ ศรีโยธา (กลุ่มงานสุขภาพดิจิทัล)', 'ผู้ใช้งานภายนอก', 'fr_dispatch', 'CREATE_CASE', 'CASE:SK-3Q1S222', 'แจ้งเหตุผู้ป่วย FAST Track: ไม่ทราบชื่อ (นำส่ง: โรงพยาบาลกมลาไสย)', '::1', '2026-08-31 00:46:50');
INSERT INTO `audit_logs` VALUES (46, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:58:14');
INSERT INTO `audit_logs` VALUES (47, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:58:48');
INSERT INTO `audit_logs` VALUES (48, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:59:13');
INSERT INTO `audit_logs` VALUES (49, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 00:59:56');
INSERT INTO `audit_logs` VALUES (50, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 01:01:00');
INSERT INTO `audit_logs` VALUES (51, NULL, 'วิษณุ ศรีโยธา (กลุ่มงานสุขภาพดิจิทัล)', 'ผู้ใช้งานภายนอก', 'fr_dispatch', 'CREATE_CASE', 'CASE:SK-4I0QP64', 'แจ้งเหตุผู้ป่วย FAST Track: ไม่ทราบชื่อ (นำส่ง: โรงพยาบาลกมลาไสย)', '::1', '2026-08-31 01:08:35');
INSERT INTO `audit_logs` VALUES (52, NULL, 'วิษณุ ศรีโยธา (กลุ่มงานสุขภาพดิจิทัล)', 'ผู้ใช้งานภายนอก', 'fr_dispatch', 'CREATE_CASE', 'CASE:SK-4UAA141', 'แจ้งเหตุผู้ป่วย FAST Track: ทดสอบ ระบบ (นำส่ง: โรงพยาบาลกมลาไสย)', '::1', '2026-08-31 01:18:08');
INSERT INTO `audit_logs` VALUES (53, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_MOPH_NOTIFY_CONFIG', 'SYSTEM_SETTINGS', 'ปรับปรุงการตั้งค่า MOPH Notify API', '::1', '2026-08-31 01:21:32');
INSERT INTO `audit_logs` VALUES (54, NULL, 'วิษณุ ศรีโยธา (กลุ่มงานสุขภาพดิจิทัล)', 'ผู้ใช้งานภายนอก', 'fr_dispatch', 'CREATE_CASE', 'CASE:SK-57GWS19', 'แจ้งเหตุผู้ป่วย FAST Track: นายทดสอบ ระบบ2 (นำส่ง: โรงพยาบาลกมลาไสย)', '::1', '2026-08-31 01:28:23');
INSERT INTO `audit_logs` VALUES (55, NULL, 'guest', 'ผู้ใช้งานภายนอก', 'guest', 'UPDATE_CASE_STATUS', 'CASE:SK-57GWS19', 'ปรับเปลี่ยนสถานะเคสเป็น: accepted', '::1', '2026-08-31 01:30:02');

-- ----------------------------
-- Table structure for cases
-- ----------------------------
DROP TABLE IF EXISTS `cases`;
CREATE TABLE `cases`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fr_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ไม่ทราบชื่อ',
  `age` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `sex` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ไม่ระบุ',
  `id_photo_url` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10, 8) NULL DEFAULT NULL,
  `longitude` decimal(11, 8) NULL DEFAULT NULL,
  `hospital_id` int(11) NULL DEFAULT 1,
  `hospital_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'โรงพยาบาลมหาราช',
  `face` tinyint(1) NULL DEFAULT 0,
  `arm` tinyint(1) NULL DEFAULT 0,
  `speech` tinyint(1) NULL DEFAULT 0,
  `onset_iso` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `nihss_total` int(11) NULL DEFAULT NULL,
  `nihss_severity` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('new','accepted','arrived','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'new',
  `reported_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `additional_photos_json` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cases
-- ----------------------------
INSERT INTO `cases` VALUES ('SK-07L36', 'กู้ภัยฮุก 31 จุดกมลาไสย', 'นางพยอม เจริญลาภ', '69', 'หญิง', NULL, '14.9830, 102.1050 - ต.บ้านเกาะ', 14.98300000, 102.10500000, 5, 'โรงพยาบาลกรุงเทพ-ราชสีมา', 0, 1, 1, '2026-08-22 18:19:53', 7, 'น้อย (Minor Stroke)', 'accepted', '2026-08-22 18:19:53', '2026-08-22 19:09:53', NULL);
INSERT INTO `cases` VALUES ('SK-15G77', 'สมชาย ใจดี (กู้ชีพเทศบาลกมลาไสย)', 'นายกิตติศักดิ์ เจริญพร', '53', 'ชาย', NULL, '14.9901, 102.1105 - ต.หัวทะเล', 14.99010000, 102.11050000, 2, 'โรงพยาบาลมหาราช / ER Fast Track Center', 0, 1, 0, '2026-08-22 18:29:53', 4, 'น้อย (Minor Stroke)', 'new', '2026-08-22 18:29:53', '2026-08-22 19:09:53', NULL);
INSERT INTO `cases` VALUES ('SK-29J54', 'วิชัย ปลอดภัย (ศูนย์กู้ชีพ อบต.)', 'นายประเสริฐ เลิศวณิช', '66', 'ชาย', NULL, '14.9755, 102.0999 - ต.หนองจะโบสถ์', 14.97550000, 102.09990000, 4, 'โรงพยาบาลค่ายสุรนารี', 1, 0, 1, '2026-08-22 17:44:53', 9, 'ปานกลาง (Moderate)', 'accepted', '2026-08-22 17:44:53', '2026-08-22 19:09:53', NULL);
INSERT INTO `cases` VALUES ('SK-34E19', 'ศูนย์กู้ภัยร่วมกตัญญู จุดเมือง', 'นายวินัย ชัยชนะ', '62', 'ชาย', NULL, '14.9780, 102.0890 - ต.สุรนารี อ.เมือง', 14.97800000, 102.08900000, 3, 'โรงพยาบาลเทพรัตน์นครราชสีมา', 1, 0, 1, '2026-08-22 16:49:53', 10, 'ปานกลาง (Moderate)', 'arrived', '2026-08-22 16:49:53', '2026-08-22 19:10:11', NULL);
INSERT INTO `cases` VALUES ('SK-52D88', 'พยาบาลสมหญิง ER (รพ.สต. หนองบัว)', 'นางประนอม ศรีสุข', '68', 'หญิง', NULL, '14.9542, 102.0711 - ต.หนองบัวศาลา', 14.95420000, 102.07110000, 1, 'โรงพยาบาลกมลาไสย', 0, 1, 1, '2026-08-22 18:54:53', 6, 'น้อย (Minor Stroke)', 'new', '2026-08-22 18:54:53', '2026-08-22 19:09:53', NULL);
INSERT INTO `cases` VALUES ('SK-68F42', 'อสม. สมศรี (หมู่ 5 กมลาไสย)', 'นางทองย้อย อยู่ดี', '75', 'หญิง', NULL, '14.9650, 102.0780 - ต.โคกกรวด', 14.96500000, 102.07800000, 1, 'โรงพยาบาลกมลาไสย', 1, 1, 0, '2026-08-22 16:09:53', 12, 'ปานกลาง (Moderate)', 'arrived', '2026-08-22 16:09:53', '2026-08-22 19:09:53', NULL);
INSERT INTO `cases` VALUES ('SK-77B45', 'วิชัย ปลอดภัย (ศูนย์กู้ชีพ อบต.)', 'นางมาลี สุขสันต์', '71', 'หญิง', NULL, '14.9611, 102.0945 - บ้านโพธิ์ ต.ในเมือง', 14.96110000, 102.09450000, 1, 'โรงพยาบาลกมลาไสย', 1, 1, 1, '2026-08-22 18:04:53', 14, 'ปานกลาง-รุนแรง (Moderate to Severe)', 'accepted', '2026-08-22 18:04:53', '2026-08-22 19:09:53', NULL);
INSERT INTO `cases` VALUES ('SK-82H63', 'ศูนย์รับแจ้งเหตุ 1669 นครราชสีมา', 'นางสมบูรณ์ ดีเลิศ', '80', 'หญิง', NULL, '14.9600, 102.0850 - ต.ในเมือง', 14.96000000, 102.08500000, 1, 'โรงพยาบาลกมลาไสย', 1, 1, 1, '2026-08-22 15:39:53', 21, 'รุนแรงมาก (Severe Stroke)', 'arrived', '2026-08-22 15:39:53', '2026-08-22 19:09:53', NULL);
INSERT INTO `cases` VALUES ('SK-89A12', 'สมชาย ใจดี (กู้ชีพเทศบาลกมลาไสย)', 'นายสมศักดิ์ รุ่งเรือง', '64', 'ชาย', NULL, '14.9723, 102.0831 - ต.ในเมือง อ.เมือง', 14.97230000, 102.08310000, 1, 'โรงพยาบาลกมลาไสย', 1, 1, 0, '2026-08-22 18:44:53', 8, 'ปานกลาง (Moderate)', 'new', '2026-08-22 18:44:53', '2026-08-22 19:09:53', NULL);
INSERT INTO `cases` VALUES ('SK-91C03', 'สมเกียรติ สว่างภัย (กู้ชีพสว่างเมตตา)', 'นายบุญมี มั่นคง', '58', 'ชาย', NULL, '14.9815, 102.1022 - ต.จอหอ อ.เมือง', 14.98150000, 102.10220000, 2, 'โรงพยาบาลมหาราช / ER Fast Track Center', 1, 1, 1, '2026-08-22 17:19:53', 18, 'รุนแรง (Severe Stroke)', 'arrived', '2026-08-22 17:19:53', '2026-08-22 19:09:53', NULL);

-- ----------------------------
-- Table structure for hospital_records
-- ----------------------------
DROP TABLE IF EXISTS `hospital_records`;
CREATE TABLE `hospital_records`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `case_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `recorded_by` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '',
  `recorded_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `er_arrival_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `arrival_mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `refer_from_hospital` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `stroke_track` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `stroke_activate_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_weakness_side` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_communication` tinyint(1) NULL DEFAULT 0,
  `er_speech_unclear` tinyint(1) NULL DEFAULT 0,
  `er_facial_droop` tinyint(1) NULL DEFAULT 0,
  `er_unsteady_gait` tinyint(1) NULL DEFAULT 0,
  `er_visual_loss` tinyint(1) NULL DEFAULT 0,
  `er_drowsy` tinyint(1) NULL DEFAULT 0,
  `er_gcs_e` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_gcs_v` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_gcs_m` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_motor_arm_left` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_motor_arm_right` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_motor_leg_left` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_motor_leg_right` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `er_nihss` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `blood_draw_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `lab_send_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `lab_result_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ct_order_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ct_transfer_er_to_ct_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ct_scan_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ct_transfer_ct_to_er_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ct_doctor_view_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ct_official_result_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ct_result_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `consult_neuro_med_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rtpa_decision` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rtpa_contraindication_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `rtpa_bw_kg` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rtpa_total_dose_mg` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rtpa_bolus_dose_mg` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rtpa_bolus_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rtpa_drip_dose_mg` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rtpa_drip_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `rtpa_finish_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `consult_neuro_sx_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `consult_neuro_med_hemo_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `surgery_decision` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `surgery_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `refer_to_hospital` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `refer_accept_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `transfer_center_contact_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `transfer_depart_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `problems_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `case_id`(`case_id` ASC) USING BTREE,
  INDEX `idx_case_id`(`case_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hospital_records
-- ----------------------------
INSERT INTO `hospital_records` VALUES (4, 'SK-82H63', 'วิษณุ ศรีโยธา (กลุ่มงานสุขภาพดิจิทัล)', '2026-08-22 19:34:15', '19:33', 'ems', NULL, 'fast_tract', '19:33', 'both', 1, 1, 1, 1, 1, 1, '4', '1', '3', '1', '3', '2', '2', '2', '19:33', '19:33', '19:33', '19:33', '19:33', '19:33', '19:33', '19:33', '19:33', 'hemorrhagic', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '19:33', '19:33', 'yes', '19:34', 'โรงพยาบาลกาฬสินธุ์', '19:34', '19:34', '19:34', 'N/A');

-- ----------------------------
-- Table structure for hospitals
-- ----------------------------
DROP TABLE IF EXISTS `hospitals`;
CREATE TABLE `hospitals`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'โรงพยาบาลศูนย์ / รพศ.',
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hospitals
-- ----------------------------
INSERT INTO `hospitals` VALUES (1, '11078', 'โรงพยาบาลกมลาไสย', 'โรงพยาบาลชุมชน (รพช.) ขนาด M2 จำนวน 120 เตียง', '043 899 570 ต่อ 191', 'อำเภอกมลาไสย จังหวัดกาฬสินธุ์', 1, '2026-08-16 18:43:58');
INSERT INTO `hospitals` VALUES (5, '10709', 'โรงพยาบาลกาฬสินธุ์', 'โรงพยาบาลทั่วไป (รพท.)', '', 'อำเภอเมืองกาฬสินธุ์ จังหวัดกาฬสินธุ์', 1, '2026-08-17 23:41:13');

-- ----------------------------
-- Table structure for personnel
-- ----------------------------
DROP TABLE IF EXISTS `personnel`;
CREATE TABLE `personnel`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `agency` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of personnel
-- ----------------------------
INSERT INTO `personnel` VALUES (1, 'สมชาย ใจดี', 'กู้ชีพเทศบาล', '081-111-1111', 'FR', 1, '2026-08-17 23:57:16');
INSERT INTO `personnel` VALUES (2, 'วิชัย ปลอดภัย', 'อสม. หมู่ 3', '082-222-2222', 'อสม.', 1, '2026-08-17 23:57:16');
INSERT INTO `personnel` VALUES (3, 'พญ.สมหญิง รักษา', 'โรงพยาบาลมหาราช', '083-333-3333', 'แพทย์เวร ER', 1, '2026-08-17 23:57:16');
INSERT INTO `personnel` VALUES (4, 'นพ.ใจสู้ ไม่ท้อ', 'โรงพยาบาลกมลาไสย', '084-444-4444', 'แพทย์เวร ER', 1, '2026-08-17 23:57:16');
INSERT INTO `personnel` VALUES (5, 'พยาบาล เอื้ออาทร', 'พยาบาลวิชาชีพ ER', '085-555-5555', 'พยาบาล', 1, '2026-08-17 23:57:16');

-- ----------------------------
-- Table structure for system_settings
-- ----------------------------
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings`  (
  `key_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `updated_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'system',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_settings
-- ----------------------------
INSERT INTO `system_settings` VALUES ('moph_notify_client_key', 'd6078e5cf778468032ea725035b0181e2bfbf9ae', 'admin', '2026-08-31 00:26:19');
INSERT INTO `system_settings` VALUES ('moph_notify_enabled', 'true', 'admin', '2026-08-31 00:26:19');
INSERT INTO `system_settings` VALUES ('moph_notify_endpoint', 'https://morpromt2f.moph.go.th/api/notify/send', 'admin', '2026-08-31 00:26:19');
INSERT INTO `system_settings` VALUES ('moph_notify_env', 'PROD', 'admin', '2026-08-31 00:26:19');
INSERT INTO `system_settings` VALUES ('moph_notify_header_image', 'https://i.postimg.cc/DzGCqgv9/flexheader-dh.png', 'admin', '2026-08-31 00:58:48');
INSERT INTO `system_settings` VALUES ('moph_notify_hospital_line1', 'โรงพยาบาลกมลาไสย', 'admin', '2026-08-31 00:26:19');
INSERT INTO `system_settings` VALUES ('moph_notify_hospital_line2', 'Stroke Alert FAST Track', 'admin', '2026-08-31 00:26:19');
INSERT INTO `system_settings` VALUES ('moph_notify_hospital_logo', 'https://morpromt2c.moph.go.th/image/image_4e63fff7-7d7d-4465-8419-c8c2daf97584.png', 'admin', '2026-08-31 00:58:14');
INSERT INTO `system_settings` VALUES ('moph_notify_secret_key', '3O3N65YXG7U3WQRO4GBAQV3EC3SY', 'admin', '2026-08-31 00:26:19');

-- ----------------------------
-- Table structure for user_sessions
-- ----------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions`  (
  `token` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_sessions
-- ----------------------------
INSERT INTO `user_sessions` VALUES ('token_1787399735417_19giy6nn', 1, '2026-08-23 18:55:35', '2026-08-22 18:55:35');
INSERT INTO `user_sessions` VALUES ('token_1788111050293_adagn4va', 1, '2026-09-01 00:30:50', '2026-08-31 00:30:50');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','fr_dispatch','er_staff','director') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fr_dispatch',
  `agency_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `hospital_id` int(11) NULL DEFAULT NULL,
  `hospital_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `last_login_at` datetime NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'admin123', 'วิษณุ ศรีโยธา', 'admin', 'กลุ่มงานสุขภาพดิจิทัล', 1, 'โรงพยาบาลกมลาไสย', '043899570 ต่อ 292', 1, '2026-08-31 00:30:50', '2026-08-22 18:02:45');
INSERT INTO `users` VALUES (2, 'fr01', 'fr123', 'สมชาย ใจดี (กู้ชีพเทศบาล)', 'fr_dispatch', 'ศูนย์กู้ชีพเทศบาลตำบลกมลาไสย', 1, 'โรงพยาบาลกมลาไสย', '081-111-1111', 1, '2026-08-22 18:24:44', '2026-08-22 18:02:45');
INSERT INTO `users` VALUES (3, 'er01', 'er123', 'พยาบาลวิชาชีพ ประจำ ER', 'er_staff', 'ห้องฉุกเฉิน (ER)', 1, 'โรงพยาบาลกมลาไสย', '043-891008', 1, '2026-08-22 18:03:03', '2026-08-22 18:02:45');
INSERT INTO `users` VALUES (4, 'director01', 'dir123', 'นพ.ผู้อำนวยการ รพ.', 'director', 'ผู้บริหารทางการแพทย์', 1, 'โรงพยาบาลกมลาไสย', '043-891000', 1, NULL, '2026-08-22 18:02:45');

SET FOREIGN_KEY_CHECKS = 1;
