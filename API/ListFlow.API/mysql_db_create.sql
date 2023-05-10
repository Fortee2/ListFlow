CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    PRIMARY KEY (`MigrationId`)
);

START TRANSACTION;

CREATE TABLE `Inventory` (
    `Id` char(36) NOT NULL,
    `Name` longtext NOT NULL,
    `Quantity` int NOT NULL,
    `Cost` decimal(18,2) NOT NULL,
    `Weight` decimal(18,2) NOT NULL,
    PRIMARY KEY (`Id`)
);

CREATE TABLE `LoginActivity` (
    `Id` char(36) NOT NULL,
    `LastLoggedInDate` datetime(6) NOT NULL,
    `LastFailedDate` datetime(6) NOT NULL,
    `NumberOfAttempts` int NOT NULL,
    `UserId` char(36) NOT NULL,
    PRIMARY KEY (`Id`)
);

CREATE TABLE `MasterAccount` (
    `Id` char(36) NOT NULL,
    `Name` longtext NOT NULL,
    PRIMARY KEY (`Id`)
);

CREATE TABLE `SalesChannel` (
    `Id` char(36) NOT NULL,
    `Name` longtext NOT NULL,
    PRIMARY KEY (`Id`)
);

CREATE TABLE `User` (
    `Id` char(36) NOT NULL,
    `FirstName` longtext NOT NULL,
    `LastName` longtext NOT NULL,
    `Email` longtext NOT NULL,
    `HashedPassword` longtext NOT NULL,
    `MasterAccountId` char(36) NOT NULL,
    PRIMARY KEY (`Id`)
);

CREATE TABLE `Listing` (
    `Id` char(36) NOT NULL,
    `ItemNumber` longtext NOT NULL,
    `ItemTitle` longtext NOT NULL,
    `Description` longtext NOT NULL,
    `InventoryId` char(36) NOT NULL,
    `SalesChannelId` char(36) NOT NULL,
    PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Listing_Inventory_InventoryId` FOREIGN KEY (`InventoryId`) REFERENCES `Inventory` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Listing_SalesChannel_SalesChannelId` FOREIGN KEY (`SalesChannelId`) REFERENCES `SalesChannel` (`Id`) ON DELETE CASCADE
);

CREATE INDEX `IX_Listing_InventoryId` ON `Listing` (`InventoryId`);

CREATE INDEX `IX_Listing_SalesChannelId` ON `Listing` (`SalesChannelId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20230501234158_Intial_Create', '7.0.5');

COMMIT;

