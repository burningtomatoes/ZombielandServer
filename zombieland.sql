/*
Navicat MySQL Data Transfer

Source Server         : burningtomato.com
Source Server Version : 50541
Source Host           : localhost:3306
Source Database       : zombieland

Target Server Type    : MYSQL
Target Server Version : 50541
File Encoding         : 65001

Date: 2015-02-26 00:20:08
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for maps
-- ----------------------------
DROP TABLE IF EXISTS `maps`;
CREATE TABLE `maps` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name_internal` varchar(32) NOT NULL,
  `name_display` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of maps
-- ----------------------------
INSERT INTO `maps` VALUES ('1', 'streets_1', 'North West Docks');

-- ----------------------------
-- Table structure for players
-- ----------------------------
DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL,
  `password` char(40) NOT NULL,
  `date_created` datetime NOT NULL,
  `date_last_login` datetime NOT NULL,
  `banned` tinyint(1) NOT NULL DEFAULT '0',
  `pos_map_id` int(11) unsigned DEFAULT NULL,
  `pos_x` int(11) DEFAULT NULL,
  `pos_y` int(11) DEFAULT NULL,
  `outfit` varchar(64) DEFAULT NULL,
  `head` varchar(64) DEFAULT NULL,
  `weapon` varchar(32) DEFAULT NULL,
  `health_now` int(11) DEFAULT NULL,
  `health_max` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `players_pos_map_id` (`pos_map_id`) USING BTREE,
  CONSTRAINT `players_ibfk_1` FOREIGN KEY (`pos_map_id`) REFERENCES `maps` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;