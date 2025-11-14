CREATE TABLE `clonedResources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`resourceType` enum('css','js','image','font','other') NOT NULL,
	`originalUrl` text NOT NULL,
	`localPath` text,
	`s3Url` text,
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clonedResources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clonedSites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalUrl` text NOT NULL,
	`title` text,
	`htmlContent` text,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`zipFileUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clonedSites_id` PRIMARY KEY(`id`)
);
