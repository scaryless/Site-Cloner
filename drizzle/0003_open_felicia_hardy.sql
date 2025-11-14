CREATE TABLE `cookieProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`siteName` varchar(255),
	`cookies` text NOT NULL,
	`favicon` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cookieProfiles_id` PRIMARY KEY(`id`)
);
