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

 Date: 02/09/2026 15:38:53
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
) ENGINE = InnoDB AUTO_INCREMENT = 113 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
INSERT INTO `audit_logs` VALUES (56, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-08-31 03:40:12');
INSERT INTO `audit_logs` VALUES (57, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-01 09:27:18');
INSERT INTO `audit_logs` VALUES (58, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 09:27:40');
INSERT INTO `audit_logs` VALUES (59, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 11:16:12');
INSERT INTO `audit_logs` VALUES (60, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 13:51:43');
INSERT INTO `audit_logs` VALUES (61, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 13:53:56');
INSERT INTO `audit_logs` VALUES (62, NULL, 'witsanu', 'ผู้ใช้งานภายนอก', 'fr_dispatch', 'REGISTER_REQUEST', 'USER:witsanu', 'ลงทะเบียนผู้ใช้งานใหม่ (รออนุมัติโดย Admin): วิษณุ ศรีโยธา (fr_dispatch)', '::ffff:127.0.0.1', '2026-09-02 14:03:06');
INSERT INTO `audit_logs` VALUES (63, 1, 'admin', 'วิษณุ ศรีโยธา', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:04:23');
INSERT INTO `audit_logs` VALUES (64, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:06:20');
INSERT INTO `audit_logs` VALUES (65, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:2', 'อัปเดตข้อมูลผู้ใช้ ID 2', '::ffff:127.0.0.1', '2026-09-02 14:10:52');
INSERT INTO `audit_logs` VALUES (66, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:2', 'อัปเดตข้อมูลผู้ใช้ ID 2', '::ffff:127.0.0.1', '2026-09-02 14:10:53');
INSERT INTO `audit_logs` VALUES (67, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:11:12');
INSERT INTO `audit_logs` VALUES (68, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:11:13');
INSERT INTO `audit_logs` VALUES (69, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:11:14');
INSERT INTO `audit_logs` VALUES (70, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:11:22');
INSERT INTO `audit_logs` VALUES (71, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:11:23');
INSERT INTO `audit_logs` VALUES (72, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:11:25');
INSERT INTO `audit_logs` VALUES (73, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:1', 'อัปเดตข้อมูลผู้ใช้ ID 1', '::ffff:127.0.0.1', '2026-09-02 14:11:59');
INSERT INTO `audit_logs` VALUES (74, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:2', 'อัปเดตข้อมูลผู้ใช้ ID 2', '::ffff:127.0.0.1', '2026-09-02 14:12:04');
INSERT INTO `audit_logs` VALUES (75, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:2', 'อัปเดตข้อมูลผู้ใช้ ID 2', '::ffff:127.0.0.1', '2026-09-02 14:12:05');
INSERT INTO `audit_logs` VALUES (76, 1, 'admin', 'ผู้ดูแลระบบ', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:16:29');
INSERT INTO `audit_logs` VALUES (77, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:17:39');
INSERT INTO `audit_logs` VALUES (78, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:17:40');
INSERT INTO `audit_logs` VALUES (79, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:4', 'อัปเดตข้อมูลผู้ใช้ ID 4', '::ffff:127.0.0.1', '2026-09-02 14:17:41');
INSERT INTO `audit_logs` VALUES (80, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:4', 'อัปเดตข้อมูลผู้ใช้ ID 4', '::ffff:127.0.0.1', '2026-09-02 14:17:41');
INSERT INTO `audit_logs` VALUES (81, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:18:04');
INSERT INTO `audit_logs` VALUES (82, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:18:16');
INSERT INTO `audit_logs` VALUES (83, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:4', 'อัปเดตข้อมูลผู้ใช้ ID 4', '::ffff:127.0.0.1', '2026-09-02 14:20:33');
INSERT INTO `audit_logs` VALUES (84, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:3', 'อัปเดตข้อมูลผู้ใช้ ID 3', '::ffff:127.0.0.1', '2026-09-02 14:21:02');
INSERT INTO `audit_logs` VALUES (85, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:4', 'อัปเดตข้อมูลผู้ใช้ ID 4', '::ffff:127.0.0.1', '2026-09-02 14:21:12');
INSERT INTO `audit_logs` VALUES (86, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:2', 'อัปเดตข้อมูลผู้ใช้ ID 2', '::ffff:127.0.0.1', '2026-09-02 14:21:59');
INSERT INTO `audit_logs` VALUES (87, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:22:07');
INSERT INTO `audit_logs` VALUES (88, 1, 'admin', 'ผู้ดูแลระบบ', 'admin', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 14:22:11');
INSERT INTO `audit_logs` VALUES (89, 2, 'fr', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:22:32');
INSERT INTO `audit_logs` VALUES (90, 2, 'fr', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 14:24:18');
INSERT INTO `audit_logs` VALUES (91, 4, 'director', 'ผู้บริหาร', 'director', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:24:26');
INSERT INTO `audit_logs` VALUES (92, 4, 'director', 'ผู้บริหาร', 'director', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 14:24:34');
INSERT INTO `audit_logs` VALUES (93, 2, 'fr', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:24:38');
INSERT INTO `audit_logs` VALUES (94, 2, 'fr', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 14:24:42');
INSERT INTO `audit_logs` VALUES (95, 2, 'fr', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:24:47');
INSERT INTO `audit_logs` VALUES (96, 2, 'fr', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 14:26:37');
INSERT INTO `audit_logs` VALUES (97, NULL, 'er', 'ผู้ใช้งานภายนอก', 'guest', 'LOGIN_FAILED', 'AUTH', 'พยายามเข้าสู่ระบบล้มเหลว (Username: er)', '::ffff:127.0.0.1', '2026-09-02 14:26:41');
INSERT INTO `audit_logs` VALUES (98, 3, 'er', 'เจ้าหน้าที่ห้องฉุกเฉิน', 'er_staff', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:26:44');
INSERT INTO `audit_logs` VALUES (99, 3, 'er', 'เจ้าหน้าที่ห้องฉุกเฉิน', 'er_staff', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 14:26:55');
INSERT INTO `audit_logs` VALUES (100, 2, 'fr', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:29:39');
INSERT INTO `audit_logs` VALUES (101, 2, 'fr', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'LOGOUT', 'AUTH', 'ออกจากระบบ', '::ffff:127.0.0.1', '2026-09-02 14:35:21');
INSERT INTO `audit_logs` VALUES (102, 1, 'admin', 'ผู้ดูแลระบบ', 'admin', 'LOGIN_SUCCESS', 'AUTH', 'เข้าสู่ระบบสำเร็จ', '::ffff:127.0.0.1', '2026-09-02 14:35:30');
INSERT INTO `audit_logs` VALUES (103, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:39:28');
INSERT INTO `audit_logs` VALUES (104, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:39:29');
INSERT INTO `audit_logs` VALUES (105, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:39:30');
INSERT INTO `audit_logs` VALUES (106, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:39:32');
INSERT INTO `audit_logs` VALUES (107, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:39:57');
INSERT INTO `audit_logs` VALUES (108, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:39:58');
INSERT INTO `audit_logs` VALUES (109, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:49:45');
INSERT INTO `audit_logs` VALUES (110, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:49:47');
INSERT INTO `audit_logs` VALUES (111, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:49:48');
INSERT INTO `audit_logs` VALUES (112, NULL, 'admin', 'ผู้ใช้งานภายนอก', 'admin', 'UPDATE_USER', 'USER_ID:5', 'อัปเดตข้อมูลผู้ใช้ ID 5', '::ffff:127.0.0.1', '2026-09-02 14:50:09');

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
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hospital_records
-- ----------------------------
INSERT INTO `hospital_records` VALUES (10, 'SK-91C03', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลมหาราช)', '2026-09-02 14:48:47', '09:15', 'ems_fr', NULL, 'fast_track', '09:18', 'right', 0, 1, 1, 0, 0, 0, '4', '5', '6', '1', '4', '1', '4', '18', '09:20', '09:22', '09:45', '09:22', NULL, '09:35', NULL, '09:42', NULL, 'ischemic', '09:45', 'yes', NULL, '60', '54', '5.4', '09:50', '48.6', '09:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'เคสเข้าเกณฑ์ Stroke Fast Track ได้รับยา rtPA ภายใน 45 นาที (Door-to-Needle 37 นาที)');
INSERT INTO `hospital_records` VALUES (11, 'SK-68F42', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลกมลาไสย)', '2026-09-02 14:48:47', '10:30', 'refer_in', NULL, 'fast_track', '10:35', 'left', 0, 0, 1, 0, 0, 0, '4', '5', '6', '4', '0', '4', '0', '12', '10:38', '10:40', '11:05', '10:42', NULL, '10:55', NULL, '11:02', NULL, 'ischemic', '11:05', 'yes', NULL, '55', '49.5', '4.95', '11:12', '44.55', '11:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'สัญญาณชีพคงที่ ประเมิน NIHSS Score 12 คะแนน CT Scan ไม่พบภาวะเลือดออกในสมอง');
INSERT INTO `hospital_records` VALUES (12, 'SK-82H63', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลกมลาไสย)', '2026-09-02 14:48:47', '11:00', 'ems_fr', NULL, 'fast_track', '11:05', 'both', 1, 1, 1, 0, 0, 0, '3', '4', '5', '3', '3', '3', '3', '21', '11:10', '11:12', '11:35', '11:15', NULL, '11:30', NULL, '11:38', NULL, 'hemorrhagic', '11:40', 'no', NULL, '65', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CT Scan พบภาวะเลือดออกในสมอง (ICH) ปรึกษา ศัลยแพทย์ระบบประสาท (Neuro Surgery) เตรียมส่งต่อ');
INSERT INTO `hospital_records` VALUES (13, 'SK-43K91', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลกมลาไสย)', '2026-09-02 14:48:47', '08:45', 'walk_in', NULL, 'fast_track', '08:50', 'right', 0, 1, 1, 0, 0, 0, '4', '5', '6', '2', '4', '2', '4', '16', '08:52', '08:55', '09:20', '08:55', NULL, '09:10', NULL, '09:18', NULL, 'ischemic', '09:20', 'yes', NULL, '70', '63', '6.3', '09:28', '56.7', '09:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Door to CT 25 นาที ให้ยาละลายลิ่มเลือด rtPA สำเร็จ ไม่พบภาวะแทรกซ้อน');
INSERT INTO `hospital_records` VALUES (14, 'SK-55M20', 'พยาบาลวิชาชีพ ประจำ ER (โรงพยาบาลกมลาไสย)', '2026-09-02 14:48:47', '07:20', 'ems_fr', NULL, 'fast_track', '07:25', 'left', 0, 1, 0, 0, 0, 0, '4', '5', '6', '4', '1', '4', '1', '11', '07:28', '07:30', '07:55', '07:32', NULL, '07:45', NULL, '07:52', NULL, 'ischemic', '07:55', 'yes', NULL, '58', '52.2', '5.22', '08:02', '46.98', '08:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'รับผู้ป่วยเข้าห้อง Stroke Unit ติดตามสัญญาณชีพอย่างใกล้ชิด');

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
  `phone2` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `phone3` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hospitals
-- ----------------------------
INSERT INTO `hospitals` VALUES (1, '11078', 'โรงพยาบาลกมลาไสย', 'โรงพยาบาลชุมชน (รพช.) ขนาด M2 จำนวน 120 เตียง', '043 899 570 ต่อ 271', 'อำเภอกมลาไสย จังหวัดกาฬสินธุ์', 1, '2026-08-16 18:43:58', '043 899 570 ต่อ 666', '091 064 6395');
INSERT INTO `hospitals` VALUES (5, '10709', 'โรงพยาบาลกาฬสินธุ์', 'โรงพยาบาลทั่วไป (รพท.)', NULL, 'อำเภอเมืองกาฬสินธุ์ จังหวัดกาฬสินธุ์', 1, '2026-08-17 23:41:13', '', '');

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
INSERT INTO `user_sessions` VALUES ('token_1788229638265_1pm6i8pf', 1, '2026-09-02 09:27:18', '2026-09-01 09:27:18');
INSERT INTO `user_sessions` VALUES ('token_1788332663051_c4v692kq', 1, '2026-09-03 14:04:23', '2026-09-02 14:04:23');
INSERT INTO `user_sessions` VALUES ('token_1788334530050_w787d5j6', 1, '2026-09-03 14:35:30', '2026-09-02 14:35:30');

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'admin123', 'ผู้ดูแลระบบ', 'admin', 'กลุ่มงานสุขภาพดิจิทัล', 1, 'โรงพยาบาลกมลาไสย', '043899570', 1, '2026-09-02 14:35:30', '2026-08-22 18:02:45');
INSERT INTO `users` VALUES (2, 'fr', 'fr123', 'เจ้าหน้าที่แจ้งเหตุ', 'fr_dispatch', 'ตำบลกมลาไสย', 1, 'โรงพยาบาลกมลาไสย', '043899570', 1, '2026-09-02 14:29:39', '2026-08-22 18:02:45');
INSERT INTO `users` VALUES (3, 'er', 'er123', 'เจ้าหน้าที่ห้องฉุกเฉิน', 'er_staff', 'ห้องฉุกเฉิน (ER)', 1, 'โรงพยาบาลกมลาไสย', '043899570 ต่อ 666', 1, '2026-09-02 14:26:44', '2026-08-22 18:02:45');
INSERT INTO `users` VALUES (4, 'director', 'director123', 'ผู้บริหาร', 'director', 'ผู้อำนวยการโรงพยาบาล', 1, 'โรงพยาบาลกมลาไสย', '043899570', 1, '2026-09-02 14:24:26', '2026-08-22 18:02:45');
INSERT INTO `users` VALUES (5, 'witsanu', 'P@ssword11078', 'วิษณุ ศรีโยธา', 'admin', 'กลุ่มงานสุขภาพดิจิทัล', 1, 'โรงพยาบาลกมลาไสย', '0621392596', 1, NULL, '2026-09-02 14:03:06');

SET FOREIGN_KEY_CHECKS = 1;
