CREATE TABLE `categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`public_id` char(26) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`parent_id` bigint unsigned,
	`image_public_id` varchar(255),
	`position` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_uq` UNIQUE(`slug`),
	CONSTRAINT `categories_public_id_uq` UNIQUE(`public_id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`variant_id` bigint unsigned,
	`asset_id` varchar(255) NOT NULL,
	`alt` varchar(200) NOT NULL,
	`width` int,
	`height` int,
	`position` smallint NOT NULL DEFAULT 0,
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`public_id` char(26) NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`sku` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`options` json,
	`price_paise` bigint unsigned,
	`stock_quantity` int NOT NULL DEFAULT 0,
	`low_stock_threshold` int NOT NULL DEFAULT 5,
	`weight_grams` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`position` smallint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`),
	CONSTRAINT `variants_sku_uq` UNIQUE(`sku`),
	CONSTRAINT `variants_public_id_uq` UNIQUE(`public_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`public_id` char(26) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`name` varchar(200) NOT NULL,
	`summary` varchar(320),
	`description` text,
	`category_id` bigint unsigned,
	`brand` varchar(80),
	`status` varchar(16) NOT NULL DEFAULT 'draft',
	`is_featured` boolean NOT NULL DEFAULT false,
	`base_price_paise` bigint unsigned NOT NULL,
	`compare_at_price_paise` bigint unsigned,
	`tax_rate_bps` int NOT NULL DEFAULT 1800,
	`rating_sum` int NOT NULL DEFAULT 0,
	`rating_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_uq` UNIQUE(`slug`),
	CONSTRAINT `products_public_id_uq` UNIQUE(`public_id`)
);
--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_categories_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_variant_id_product_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `categories_parent_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `categories_active_position_idx` ON `categories` (`is_active`,`position`);--> statement-breakpoint
CREATE INDEX `images_product_position_idx` ON `product_images` (`product_id`,`position`);--> statement-breakpoint
CREATE INDEX `images_variant_idx` ON `product_images` (`variant_id`);--> statement-breakpoint
CREATE INDEX `variants_product_idx` ON `product_variants` (`product_id`,`position`);--> statement-breakpoint
CREATE INDEX `variants_stock_idx` ON `product_variants` (`is_active`,`stock_quantity`);--> statement-breakpoint
CREATE INDEX `products_status_category_idx` ON `products` (`status`,`category_id`);--> statement-breakpoint
CREATE INDEX `products_status_featured_idx` ON `products` (`status`,`is_featured`);--> statement-breakpoint
CREATE INDEX `products_status_price_idx` ON `products` (`status`,`base_price_paise`);--> statement-breakpoint
-- Keyword search starts in MySQL rather than a dedicated search engine: the
-- catalogue is small, and a FULLTEXT index over the customer-visible text is
-- both cheaper and one fewer service to operate. Revisit if the catalogue grows
-- past what natural-language mode ranks well.
CREATE FULLTEXT INDEX `products_search_ft` ON `products` (`name`, `summary`, `description`);
