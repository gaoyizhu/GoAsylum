CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(100) NOT NULL,
	`contact` varchar(320),
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
