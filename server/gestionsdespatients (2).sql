-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 27 juin 2025 à 21:51
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestionsdespatients`
--

-- --------------------------------------------------------

--
-- Structure de la table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `medecin_id` int(11) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `dateTime` datetime DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `medecin_id`, `appointment_date`, `appointment_time`, `dateTime`, `status`, `createdAt`, `updatedAt`, `notes`) VALUES
(12, NULL, 7, '2025-06-01', '10:00:00', '2025-06-01 09:00:00', 'CONFIRMED', '2025-06-17 15:15:11', '2025-06-19 15:39:55', 'aaaaa'),
(13, NULL, 7, '2025-06-26', '03:00:00', '2025-06-26 02:00:00', 'PENDING', '2025-06-19 13:21:24', '2025-06-19 15:39:52', 'aa'),
(14, NULL, 7, '2025-06-01', '11:00:00', '2025-06-01 10:00:00', 'CONFIRMED', '2025-06-19 17:20:15', '2025-06-19 17:20:47', 'DIAGNOSTIQU'),
(15, 14, 8, '2025-06-14', '05:04:00', '2025-06-14 04:04:00', 'CONFIRMED', '2025-06-20 11:22:51', '2025-06-20 11:23:03', 'jj'),
(16, 14, 8, '2025-06-29', '00:00:00', '2025-06-29 03:03:00', 'PENDING', '2025-06-20 11:24:30', '2025-06-20 11:26:30', 'aa'),
(17, 15, 8, '2025-06-02', '10:00:00', '2025-06-02 09:00:00', 'CONFIRMED', '2025-06-20 11:29:02', '2025-06-20 11:29:29', ''),
(18, 15, 8, '2025-06-02', '11:00:00', '2025-06-02 10:00:00', 'CANCELLED', '2025-06-20 17:40:19', '2025-06-20 17:41:07', ''),
(19, 15, 8, '2025-06-16', '11:00:00', '2025-06-16 10:00:00', 'CONFIRMED', '2025-06-20 17:41:17', '2025-06-20 17:43:50', ''),
(20, 15, 8, '2025-06-09', '11:00:00', '2025-06-09 10:00:00', 'PENDING', '2025-06-20 18:06:04', '2025-06-20 18:06:04', '');

-- --------------------------------------------------------

--
-- Structure de la table `availabilities`
--

CREATE TABLE `availabilities` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `availabilities`
--

INSERT INTO `availabilities` (`id`, `doctor_id`, `day_of_week`, `start_time`, `end_time`) VALUES
(2, 7, 1, '10:00:00', '17:00:00'),
(3, 8, 2, '10:00:00', '12:28:00');

-- --------------------------------------------------------

--
-- Structure de la table `consultations`
--

CREATE TABLE `consultations` (
  `id` int(11) NOT NULL,
  `medecin_id` int(11) DEFAULT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `dateTime` datetime NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `consultations`
--

INSERT INTO `consultations` (`id`, `medecin_id`, `patient_id`, `dateTime`, `notes`) VALUES
(5, 7, NULL, '2025-06-19 13:18:00', '123'),
(6, 8, 13, '2025-06-20 11:15:00', 'eee'),
(7, 8, 14, '2025-06-20 11:23:00', 'j'),
(8, 8, 15, '2025-06-20 11:29:00', 'oko');

-- --------------------------------------------------------

--
-- Structure de la table `doctor_profiles`
--

CREATE TABLE `doctor_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `license_number` varchar(255) NOT NULL,
  `specialization` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `doctor_profiles`
--

INSERT INTO `doctor_profiles` (`id`, `user_id`, `license_number`, `specialization`, `phone`, `address`, `ville`) VALUES
(2, 7, 'T4367019FJ1', 'Cardiologie', '+21256534425', '1000 HFC+ Avenue targha , Rabat ', 'RABAT'),
(3, 8, 'NJBF58888', 'Dermatologie', '+21234567899', '345 Ain choc casablanca', 'Tanger'),
(4, 9, 'HYH3456', 'Génicologue', '+2124567889', '451 , HYQ+ Avenu chamal Tanger', 'Tanger');

-- --------------------------------------------------------

--
-- Structure de la table `ordonnances`
--

CREATE TABLE `ordonnances` (
  `id` int(11) NOT NULL,
  `consultation_id` int(11) DEFAULT NULL,
  `prescription` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ordonnances`
--

INSERT INTO `ordonnances` (`id`, `consultation_id`, `prescription`, `createdAt`, `updatedAt`) VALUES
(7, 5, '1235', '2025-06-19 13:18:53', '2025-06-19 13:26:25'),
(8, 6, 'jj', '2025-06-20 11:22:30', '2025-06-20 11:22:30'),
(9, 7, 'j', '2025-06-20 11:23:29', '2025-06-20 11:23:29'),
(10, 8, 'oko', '2025-06-20 11:29:52', '2025-06-20 11:29:52');

-- --------------------------------------------------------

--
-- Structure de la table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `dateOfBirth` date NOT NULL,
  `dossierNumber` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `emergencyContact` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `patients`
--

INSERT INTO `patients` (`id`, `firstName`, `lastName`, `dateOfBirth`, `dossierNumber`, `phone`, `address`, `emergencyContact`, `user_id`) VALUES
(13, 'Magnitude', 'Project', '2025-06-12', 'PAT13', '+212708768070', 'Ifiag arkx talent morocco', '+212689752785', 8),
(14, 'PET', 'VET', '2025-06-06', 'PAT14', '0987654321', 'W4Q3+8RX, Temara, Morocco', '+212689752785', 8),
(15, 'Salim', 'Afleo', '2025-06-01', 'PAT10', '+2124567890', '5678 HAYG+ JAHH Casablance', '+2145678900', 10);

-- --------------------------------------------------------

--
-- Structure de la table `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Déchargement des données de la table `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20250612123748-add-not-to-appointments.js'),
('20250612142300-add-timestamps-to-appointments.js'),
('20250614-remove-userid-fk-and-index.js'),
('20250615_add_timestamps_to_ordonnances.js');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','MEDECIN','PATIENT') NOT NULL DEFAULT 'PATIENT'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`) VALUES
(6, 'Ilias Radouche', 'iliasradouche@gmail.com', '$2b$10$N9bpYk2V0fPbyvIb5bqriO0cjAcsH0HI7rRkUC4YEw9bq1wAKOptS', 'PATIENT'),
(7, 'Jamal Idrissi', 'magnitud.finals@outlook.fr', '$2b$10$kOochbNy0XNb/qVscVANjuh.chKcpl0xHTGGQorjU0cs2gubcPlBq', 'MEDECIN'),
(8, 'Amine Alami', 'doctor@outlook.fr', '$2b$10$rDLqC9WxlW6NGAP93Pxiwu1SmUdELIWs11Uzat571fsTMz3c7Sxde', 'MEDECIN'),
(9, 'Imane Ameur', 'doctor2@outlook.fr', '$2b$10$Z/fw3aynK3rYamdcXOFQL.twbHUyG5pRHYr9lcVhf32mz7Ui3c0IK', 'MEDECIN'),
(10, 'Salim Afleo', 'patient@outlook.fr', '$2b$10$mBH3.t9BC2Qu.8R2NjffKuZZPSstInax4.dZylFkoNJ.tpIHn/jCO', 'PATIENT');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `medecin_id` (`medecin_id`);

--
-- Index pour la table `availabilities`
--
ALTER TABLE `availabilities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Index pour la table `consultations`
--
ALTER TABLE `consultations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medecin_id` (`medecin_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Index pour la table `doctor_profiles`
--
ALTER TABLE `doctor_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `ordonnances`
--
ALTER TABLE `ordonnances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultation_id` (`consultation_id`);

--
-- Index pour la table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dossierNumber` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_2` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_3` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_4` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_5` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_6` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_7` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_8` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_9` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_10` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_11` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_12` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_13` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_14` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_15` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_16` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_17` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_18` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_19` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_20` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_21` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_22` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_23` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_24` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_25` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_26` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_27` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_28` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_29` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_30` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_31` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_32` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_33` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_34` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_35` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_36` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_37` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_38` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_39` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_40` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_41` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_42` (`dossierNumber`),
  ADD UNIQUE KEY `dossierNumber_43` (`dossierNumber`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `availabilities`
--
ALTER TABLE `availabilities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `consultations`
--
ALTER TABLE `consultations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `doctor_profiles`
--
ALTER TABLE `doctor_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `ordonnances`
--
ALTER TABLE `ordonnances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_193` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_194` FOREIGN KEY (`medecin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `availabilities`
--
ALTER TABLE `availabilities`
  ADD CONSTRAINT `availabilities_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `consultations`
--
ALTER TABLE `consultations`
  ADD CONSTRAINT `consultations_ibfk_191` FOREIGN KEY (`medecin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `consultations_ibfk_192` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `doctor_profiles`
--
ALTER TABLE `doctor_profiles`
  ADD CONSTRAINT `doctor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `ordonnances`
--
ALTER TABLE `ordonnances`
  ADD CONSTRAINT `ordonnances_ibfk_1` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
