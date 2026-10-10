-- BeliLokal / UMKM Nusantara — schema MySQL (PDO, tanpa framework)
CREATE DATABASE IF NOT EXISTS `belilokal` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `belilokal`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
  `phone` VARCHAR(30) NULL,
  `avatar` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `user_tokens` (
  `token` VARCHAR(128) PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `shops` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `address` TEXT NULL,
  `city_id` VARCHAR(20) NOT NULL DEFAULT '',
  `city_name` VARCHAR(255) NOT NULL DEFAULT '',
  `province` VARCHAR(255) NOT NULL DEFAULT '',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_shops_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `shop_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `price` BIGINT NOT NULL DEFAULT 0,
  `stock` INT NOT NULL DEFAULT 0,
  `weight_gram` INT NOT NULL DEFAULT 500,
  `image_url` VARCHAR(1000) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_cat` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_products_slug` (`slug`),
  INDEX `idx_products_shop` (`shop_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_cart` (`user_id`,`product_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(40) NOT NULL UNIQUE,
  `buyer_id` BIGINT UNSIGNED NOT NULL,
  `shop_id` BIGINT UNSIGNED NOT NULL,
  `total_amount` BIGINT NOT NULL DEFAULT 0,
  `shipping_cost` BIGINT NOT NULL DEFAULT 0,
  `grand_total` BIGINT NOT NULL DEFAULT 0,
  `status` ENUM('pending_payment','paid','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending_payment',
  `courier` VARCHAR(30) NULL,
  `courier_service` VARCHAR(60) NULL,
  `courier_etd` VARCHAR(30) NULL,
  `tracking_number` VARCHAR(60) NULL,
  `total_weight_gram` INT NOT NULL DEFAULT 0,
  `payment_method` VARCHAR(60) NULL DEFAULT 'midtrans',
  `payment_status` ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  `snap_token` VARCHAR(255) NULL,
  `paid_at` DATETIME NULL,
  `recipient_name` VARCHAR(255) NULL,
  `recipient_phone` VARCHAR(30) NULL,
  `address` TEXT NULL,
  `destination_city_id` VARCHAR(20) NULL,
  `destination_city_name` VARCHAR(255) NULL,
  `destination_province` VARCHAR(255) NULL,
  `notes` VARCHAR(500) NULL,
  `shipping_address` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `price` BIGINT NOT NULL DEFAULT 0,
  `quantity` INT NOT NULL DEFAULT 1,
  `weight_gram` INT NOT NULL DEFAULT 0,
  `subtotal` BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===== SEED =====
INSERT INTO `categories` (`name`,`slug`) VALUES
('Makanan & Minuman','makanan-minuman'),
('Kerajinan Tangan','kerajinan-tangan'),
('Fashion','fashion'),
('Pertanian','pertanian'),
('Elektronik','elektronik')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- password semua: "password"
INSERT INTO `users` (`id`,`name`,`email`,`password`,`role`,`phone`) VALUES
(1,'Admin BeliLokal','admin@belilokal.id','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin','081210001001'),
(2,'Sari Batik','seller@belilokal.id','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','seller','081210001002'),
(3,'Budi Pembeli','buyer@belilokal.id','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','buyer','081210001003')
ON DUPLICATE KEY UPDATE `password`=VALUES(`password`), `role`=VALUES(`role`);

INSERT INTO `shops` (`id`,`user_id`,`name`,`slug`,`address`,`city_id`,`city_name`,`province`,`is_verified`) VALUES
(1,2,'Batik Bu Sari','batik-bu-sari','Jl. Malioboro No. 45, Yogyakarta','398','Kota Yogyakarta','DI Yogyakarta',1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `is_verified`=1;

INSERT INTO `products` (`id`,`shop_id`,`category_id`,`name`,`slug`,`description`,`price`,`stock`,`weight_gram`,`image_url`,`is_active`) VALUES
(1,1,1,'Kopi Robusta Temanggung 250gr','kopi-robusta-temanggung-250gr','Kopi robusta single origin Temanggung, sangrai medium, aroma cokelat dan rempah.','68000',40,300,'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',1),
(2,1,1,'Gula Aren Asli Kulon Progo 500gr','gula-aren-kulon-progo-500gr','Gula aren cetak asli dari nira aren Kulon Progo, manis legit untuk kopi dan kue.','35000',60,550,'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=800&q=80',1),
(3,1,2,'Batik Tulis Motif Parang 2m','batik-tulis-parang-2m','Kain batik tulis motif parang klasik, pewarna alam, karya pengrajin Bantul.','450000',8,400,'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80',1),
(4,1,3,'Tas Anyaman Pandan Lombok','tas-anyaman-pandan-lombok','Tas anyaman pandan handmade dengan inner kain batik, cocok untuk harian.','185000',15,600,'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',1),
(5,1,4,'Madu Hutan Sumbawa 500ml','madu-hutan-sumbawa-500ml','Madu hutan murni dari Sumbawa, dipanen lestari, kental dan kaya enzim.','120000',25,650,'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',1),
(6,1,2,'Keramik Gerabah Kasongan Set isi 4','keramik-gerabah-kasongan-4','Set cangkir + teko gerabah Kasongan, glasir aman pangan, motif etnik.','240000',12,1800,'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',1)
ON DUPLICATE KEY UPDATE `price`=VALUES(`price`), `stock`=VALUES(`stock`);

-- 1 order paid + resi (buyer 3, shop 1)
INSERT INTO `orders` (`order_number`,`buyer_id`,`shop_id`,`total_amount`,`shipping_cost`,`grand_total`,`status`,`courier`,`courier_service`,`tracking_number`,`total_weight_gram`,`payment_method`,`payment_status`,`snap_token`,`paid_at`,`recipient_name`,`recipient_phone`,`address`,`destination_city_id`,`destination_city_name`,`destination_province`)
VALUES ('BL-20250101-ABC123',3,1,103000,15000,118000,'paid','jne','REG','JNE-20250101-X7K2Q9',850,'midtrans','paid','SNAP-DEMO-ABC123',NOW(),'Budi Pembeli','081210001003','Jl. Sudirman No. 10, Bandung','399','Kota Bandung','Jawa Barat')
ON DUPLICATE KEY UPDATE `status`='paid', `payment_status`='paid';

SET @oid = (SELECT `id` FROM `orders` WHERE `order_number`='BL-20250101-ABC123' LIMIT 1);
DELETE FROM `order_items` WHERE `order_id`=@oid;
INSERT INTO `order_items` (`order_id`,`product_id`,`product_name`,`price`,`quantity`,`weight_gram`,`subtotal`) VALUES
(@oid,1,'Kopi Robusta Temanggung 250gr',68000,1,300,68000),
(@oid,2,'Gula Aren Asli Kulon Progo 500gr',35000,1,550,35000);
