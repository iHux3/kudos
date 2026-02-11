CREATE TABLE `kudos` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`message` text NOT NULL,
	`category` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "kudos_category_check" CHECK("kudos"."category" in ('Great Job', 'Thank You', 'Teamwork'))
);
