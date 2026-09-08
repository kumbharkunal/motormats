CREATE TABLE `addresses` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`public_id` char(26) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`type` varchar(16) NOT NULL DEFAULT 'shipping',
	`full_name` varchar(120) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`line1` varchar(200) NOT NULL,
	`line2` varchar(200),
	`city` varchar(80) NOT NULL,
	`state` varchar(80) NOT NULL,
	`postal_code` varchar(12) NOT NULL,
	`country_code` char(2) NOT NULL DEFAULT 'IN',
	`is_default` boolean NOT NULL DEFAULT false,
	`archived_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`),
	CONSTRAINT `addresses_public_id_uq` UNIQUE(`public_id`)
);
--> statement-breakpoint
CREATE TABLE `coupon_redemptions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`coupon_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`discount_paise` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupon_redemptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `redemption_coupon_order_uq` UNIQUE(`coupon_id`,`order_id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`public_id` char(26) NOT NULL,
	`code` varchar(32) NOT NULL,
	`description` varchar(200),
	`kind` varchar(16) NOT NULL,
	`value` int NOT NULL,
	`max_discount_paise` bigint unsigned,
	`min_order_paise` bigint unsigned NOT NULL DEFAULT 0,
	`starts_at` datetime,
	`ends_at` datetime,
	`usage_limit` int,
	`usage_count` int NOT NULL DEFAULT 0,
	`per_user_limit` int NOT NULL DEFAULT 1,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_uq` UNIQUE(`code`),
	CONSTRAINT `coupons_public_id_uq` UNIQUE(`public_id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`variant_id` bigint unsigned,
	`product_name` varchar(200) NOT NULL,
	`variant_name` varchar(160) NOT NULL,
	`sku` varchar(64) NOT NULL,
	`product_slug` varchar(160) NOT NULL,
	`image_asset_id` varchar(255),
	`unit_price_paise` bigint unsigned NOT NULL,
	`quantity` int NOT NULL,
	`tax_rate_bps` int NOT NULL,
	`line_total_paise` bigint unsigned NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`public_id` char(26) NOT NULL,
	`order_number` varchar(24) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`status` varchar(24) NOT NULL DEFAULT 'pending_payment',
	`shipping_address` json NOT NULL,
	`billing_address` json,
	`subtotal_paise` bigint unsigned NOT NULL,
	`discount_paise` bigint unsigned NOT NULL DEFAULT 0,
	`shipping_paise` bigint unsigned NOT NULL DEFAULT 0,
	`tax_paise` bigint unsigned NOT NULL DEFAULT 0,
	`grand_total_paise` bigint unsigned NOT NULL,
	`coupon_code` varchar(32),
	`customer_note` varchar(500),
	`placed_at` datetime,
	`cancelled_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_public_id_uq` UNIQUE(`public_id`),
	CONSTRAINT `orders_order_number_uq` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`public_id` char(26) NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`provider` varchar(24) NOT NULL DEFAULT 'razorpay',
	`provider_order_id` varchar(64) NOT NULL,
	`provider_payment_id` varchar(64),
	`status` varchar(16) NOT NULL DEFAULT 'created',
	`amount_paise` bigint unsigned NOT NULL,
	`currency` char(3) NOT NULL DEFAULT 'INR',
	`signature_verified` boolean NOT NULL DEFAULT false,
	`failure_reason` varchar(200),
	`captured_at` datetime,
	`refunded_at` datetime,
	`refunded_amount_paise` bigint unsigned NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_public_id_uq` UNIQUE(`public_id`),
	CONSTRAINT `payments_provider_order_uq` UNIQUE(`provider`,`provider_order_id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`provider` varchar(24) NOT NULL,
	`event_id` varchar(128) NOT NULL,
	`event_type` varchar(64) NOT NULL,
	`payload_hash` char(64) NOT NULL,
	`processed_at` datetime,
	`attempts` smallint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhook_provider_event_uq` UNIQUE(`provider`,`event_id`)
);
--> statement-breakpoint
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coupon_redemptions` ADD CONSTRAINT `coupon_redemptions_coupon_id_coupons_id_fk` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coupon_redemptions` ADD CONSTRAINT `coupon_redemptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coupon_redemptions` ADD CONSTRAINT `coupon_redemptions_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variant_id_product_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `addresses_user_idx` ON `addresses` (`user_id`,`archived_at`);--> statement-breakpoint
CREATE INDEX `redemption_coupon_user_idx` ON `coupon_redemptions` (`coupon_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `coupons_active_window_idx` ON `coupons` (`is_active`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `orders_user_created_idx` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_status_created_idx` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `webhook_processed_idx` ON `webhook_events` (`processed_at`);