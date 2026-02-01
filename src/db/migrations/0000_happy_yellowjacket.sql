CREATE TABLE `commentaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`match_id` integer NOT NULL,
	`minute` integer NOT NULL,
	`sequence` integer NOT NULL,
	`period` text NOT NULL,
	`event_type` text NOT NULL,
	`actor` text,
	`team` text,
	`message` text NOT NULL,
	`metadata` text,
	`description` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sport` text NOT NULL,
	`home_team` text NOT NULL,
	`away_team` text NOT NULL,
	`status` text NOT NULL,
	`match_date` integer NOT NULL,
	`start_time` integer,
	`end_time` integer,
	`location` text NOT NULL,
	`home_score` integer DEFAULT 0 NOT NULL,
	`away_score` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
