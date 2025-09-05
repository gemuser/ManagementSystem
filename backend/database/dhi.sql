CREATE DATABASE  IF NOT EXISTS `inventory_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inventory_system`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: inventory_system
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dishhome`
--

DROP TABLE IF EXISTS `dishhome`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dishhome` (
  `customerId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `package` varchar(200) NOT NULL,
  `address` varchar(200) NOT NULL,
  `price` int NOT NULL,
  `month` varchar(10) NOT NULL,
  `casId` varchar(45) NOT NULL,
  PRIMARY KEY (`customerId`)
) ENGINE=InnoDB AUTO_INCREMENT=1223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dishhome`
--

LOCK TABLES `dishhome` WRITE;
/*!40000 ALTER TABLE `dishhome` DISABLE KEYS */;
INSERT INTO `dishhome` VALUES (12,'testt','9833333333',1,'HD Premium','testinggg',1800,'4','CAS-05555');
/*!40000 ALTER TABLE `dishhome` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dishhome_fibernet_combo`
--

DROP TABLE IF EXISTS `dishhome_fibernet_combo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dishhome_fibernet_combo` (
  `comboId` int NOT NULL AUTO_INCREMENT,
  `dishhomeId` int DEFAULT NULL,
  `fibernetId` int DEFAULT NULL,
  `customerName` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `casId` varchar(50) DEFAULT NULL,
  `totalPrice` int NOT NULL,
  `status` tinyint(1) NOT NULL,
  `category` varchar(45) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sourceService` varchar(50) DEFAULT NULL,
  `upgradeType` varchar(50) DEFAULT NULL,
  `month` varchar(7) DEFAULT NULL,
  `fibernetPackage` varchar(100) DEFAULT NULL,
  `customerAddress` text,
  `dishhomePackage` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`comboId`),
  KEY `dishhomeId` (`dishhomeId`),
  KEY `fibernetId` (`fibernetId`),
  CONSTRAINT `fk_combo_dishhome` FOREIGN KEY (`dishhomeId`) REFERENCES `dishhome` (`customerId`) ON DELETE CASCADE,
  CONSTRAINT `fk_combo_fibernet` FOREIGN KEY (`fibernetId`) REFERENCES `fibernet` (`customerId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dishhome_fibernet_combo`
--

LOCK TABLES `dishhome_fibernet_combo` WRITE;
/*!40000 ALTER TABLE `dishhome_fibernet_combo` DISABLE KEYS */;
INSERT INTO `dishhome_fibernet_combo` VALUES (17,NULL,1,'Ashish Updated','9800000001','cas-444',12000,1,'combo','2025-09-05 06:55:52',NULL,NULL,'4','Platinum Plan','Kathmandu',NULL),(18,12,NULL,'testt','9833333333','CAS-05555',1200,1,'combo','2025-09-05 07:07:48',NULL,NULL,'12',NULL,'testinggg','HD Premium'),(21,NULL,NULL,'Ashish Pokhrel','9817373803','CAS-423',12000,1,'combo','2025-09-05 07:38:17',NULL,'ITV','24',NULL,'biratnagar',NULL);
/*!40000 ALTER TABLE `dishhome_fibernet_combo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fibernet`
--

DROP TABLE IF EXISTS `fibernet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fibernet` (
  `customerId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `package` varchar(200) NOT NULL,
  `address` varchar(200) NOT NULL,
  `price` int NOT NULL,
  `month` int NOT NULL,
  PRIMARY KEY (`customerId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fibernet`
--

LOCK TABLES `fibernet` WRITE;
/*!40000 ALTER TABLE `fibernet` DISABLE KEYS */;
INSERT INTO `fibernet` VALUES (1,'Ashish Updated','9800000001',1,'Platinum Plan','Kathmandu',2000,2);
/*!40000 ALTER TABLE `fibernet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `modelNo` varchar(100) DEFAULT NULL,
  `hsCode` varchar(100) DEFAULT NULL,
  `total_stock` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Nivea Face Cream','Skincare',350.00,'NVC123','3304.99',60),(2,'Dove Shampoo 200ml','Haircare',450.00,'DOV200','3305.10',130),(3,'Colgate Toothpaste 100g','Oralcare',120.00,'COL100','3306.20',80),(4,'Himalaya Face Wash','Skincare',300.00,'HIMFW1','3304.99',60),(6,'Mobile','General',200000.00,'N/A','N/A',10),(7,'laptop','General',500000.00,'N/A','N/A',10);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity_purchased` int NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `purchase_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `notes` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (1,'PUR-001','HEllo','Ashish',122,122.00,14884.00,'2025-09-05 08:37:50','2025-09-05 08:37:50',''),(2,'PUR-002','Test','laptop',10,500000.00,5000000.00,'2025-09-05 08:44:13','2025-09-05 08:44:13',''),(3,'PUR-002','Test','Mobile',10,200000.00,2000000.00,'2025-09-05 08:44:13','2025-09-05 08:44:13','');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `product_id` int NOT NULL,
  `quantity_sold` int NOT NULL,
  `price_each` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `sale_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (11,'12',1,10,370.00,3700.00,'2025-09-05 07:59:28'),(12,'12',2,1,450.00,450.00,'2025-09-05 07:59:28');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-05 21:17:01
