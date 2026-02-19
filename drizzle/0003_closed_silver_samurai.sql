CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(100) NOT NULL,
	`rank` varchar(50),
	`content` text NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
