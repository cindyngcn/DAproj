CREATE DATABASE 'test'

USE `test`;

CREATE TABLE `user` (
    `username` VARCHAR(50) NOT NULL, 
    `password` VARCHAR(255) NOT NULL, 
    `email` VARCHAR(100), 
    `enabled` BOOLEAN DEFAULT TRUE NOT NULL,
    PRIMARY KEY (`username`)
) 

INSERT INTO `user` (`username`, `password`, `email`, `enabled`) 
VALUES ('test', 'test', 'test@test.com', TRUE);

CREATE TABLE `user_group` (
    `user_group_username` VARCHAR(50) NOT NULL,
    `user_group_groupName` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`user_group_username`, `user_group_groupName`)
) 

INSERT INTO `user_group` (`user_group_username`, `user_group_groupName`) 
VALUES ('test', 'admin');

CREATE TABLE 'application' (
    'app_acronym' VARCHAR(20),
    'app_description' VARCHAR(100),
    'app_rNumber' INT(4),
    'app_startDate' DATE,
    'app_endDate' DATE,
    'App_permit_Create' VARCHAR(50),
    'App_permit_Open' VARCHAR(50),
    'App_permit_toDoList' VARCHAR(50),
    'App_permit_Doing' VARCHAR(50),
    'App_permit_Done' VARCHAR(50),
    PRIMARY KEY (`app_acronym`)
) 

INSERT INTO `application` 
(`app_acronym`, `app_description`, `app_rNumber`, `app_startDate`, `app_endDate`, `App_permit_Create`, `App_permit_Open`, `App_permit_toDoList`, `App_permit_Doing`, `App_permit_Done`)
VALUES 
('APP001', 'Sample application for testing', 1234, '2025-01-01', '2025-12-31', 'Admin', 'Manager', 'User', 'Manager', 'User');

CREATE TABLE `plan` (
    `Plan_MVP_name` VARCHAR(50) NOT NULL,
    `Plan_startDate` DATE,
    `Plan_endDate` DATE,
    `Plan_app_Acronym` VARCHAR(20) NOT NULL,
    `Plan_color` VARCHAR(7),
    PRIMARY KEY ('Plan_MVP_name', `Plan_app_Acronym`),
    FOREIGN KEY (`Plan_app_Acronym`) REFERENCES `application` (`app_acronym`)
) 

INSERT INTO `plan` (`Plan_MVP_name`, `Plan_startDate`, `Plan_endDate`, `Plan_app_Acronym`, `Plan_color`)
VALUES ('MVP 1', '2025-01-01', '2025-06-30', 'APP001', '#FF5733');

CREATE TABLE `task` (
    `Task_id` VARCHAR(25) NOT NULL,
    `Task_name` VARCHAR(50) NOT NULL,
    `Task_description` TEXT NOT NULL,
    `Task_notes` LONGTEXT NOT NULL,
    `Task_plan` VARCHAR(50),
    `Task_app_Acronym` VARCHAR(20) NOT NULL,
    `Task_state` ENUM("OPEN", "TODO", "DOING", "DONE", "CLOSED"),
    `Task_creator` VARCHAR(50) NOT NULL,
    `Task_owner` VARCHAR(50),
    `Task_createDate` DATETIME NOT NULL,
    PRIMARY KEY (`Task_id`),
    FOREIGN KEY (`Task_plan`) REFERENCES `plan` (`Plan_MVP_Name`) 
    FOREIGN KEY (`Task_app_Acronym`) REFERENCES `application` (`app_acronym`)
) 

INSERT INTO `task` (`Task_id`, `Task_name`, `Task_description`, `Task_notes`, `Task_plan`, `Task_app_Acronym`, `Task_state`, `Task_creator`, `Task_owner`, `Task_createDate`) 
VALUES ('T001', 'Task Example', 'This is a test task', '', 'MVP 1', 'APP001', 'OPEN', 'test', 'manager', NOW());
