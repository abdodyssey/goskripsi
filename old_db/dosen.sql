-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 01, 2026 at 11:28 AM
-- Server version: 10.11.10-MariaDB-log
-- PHP Version: 8.3.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `skripsi`
--

-- --------------------------------------------------------

--
-- Table structure for table `dosen`
--

CREATE TABLE `dosen` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nidn` varchar(255) DEFAULT NULL,
  `nip` varchar(255) DEFAULT NULL,
  `nama` varchar(191) NOT NULL,
  `no_hp` varchar(30) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `tempat_tanggal_lahir` varchar(255) DEFAULT NULL,
  `pangkat` varchar(255) DEFAULT NULL,
  `golongan` varchar(255) DEFAULT NULL,
  `tmt_fst` datetime DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `status` enum('aktif','tidak aktif') NOT NULL DEFAULT 'aktif',
  `prodi_id` bigint(20) UNSIGNED NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dosen`
--

INSERT INTO `dosen` (`id`, `nidn`, `nip`, `nama`, `no_hp`, `alamat`, `tempat_tanggal_lahir`, `pangkat`, `golongan`, `tmt_fst`, `jabatan`, `status`, `prodi_id`, `foto`, `user_id`, `created_at`, `updated_at`, `email`) VALUES
(1, '2001087503', '19750801 200912 2 001', 'Gusmelia Testiana, M.Kom.', '98483284728', 'Palembang', 'Maninjau, 01-08-1975', 'Penata Tk.1', 'III.d', '2016-06-09 22:50:41', 'Ka Prodi/Dosen/Lektor', 'aktif', 1, NULL, 14, '2026-02-05 05:50:41', '2026-02-06 14:02:46', 'kaprodi@radenfatah.ac.id'),
(2, '2022117502', '19751122 200604 1 003', 'Ruliansyah, S.T., M.Kom.', NULL, 'Palembang', 'Palembang, 22-11-1975', 'Penata Tk.1', 'III.d', '2017-01-02 05:50:41', 'Dosen / Lektor', 'aktif', 1, NULL, 15, '2026-02-05 05:50:41', '2026-02-05 05:50:41', NULL),
(3, '2007116701', '19671107 199803 2 001', 'Dr. Fenny Purwani, M.Kom.', NULL, 'Palembang', 'Yogyakarta, 07-11-1967', 'Penata Tk.1', 'III.d', '2017-01-02 05:50:41', 'Dosen / Lektor', 'aktif', 1, NULL, 16, '2026-02-05 05:50:42', '2026-02-05 05:50:42', NULL),
(4, '2025117901', '19791125 201403 2 002', 'RUSMALA SANTI, M.Kom.', NULL, 'Palembang', 'Muba, 25-11-1979', 'Penata Muda Tk.1', 'III.b', '2017-01-02 05:50:41', 'Dosen / Lektor', 'aktif', 1, NULL, 17, '2026-02-05 05:50:42', '2026-02-05 05:50:42', NULL),
(5, '2003058601', '19860503 201903 1 009', 'Catur Eri Gunawan, S.T., M.Cs.', '08364723232', 'Palembang', 'Palembang, 03-05-1986', 'Penata Muda Tk.1', 'III.d', '2019-01-02 01:50:41', 'Dosen / Lektor', 'aktif', 1, NULL, 18, '2026-02-05 05:50:42', '2026-02-06 02:14:23', 'catur19860503@radenfatah.ac.id'),
(6, '0208018701', '19870108 202012 1 009', 'Irfan Dwi Jaya, M.Kom.', NULL, 'Palembang', 'Palembang, 08-01-1987', 'Penata Muda Tk.1', 'III.b', '2020-01-12 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 19, '2026-02-05 05:50:42', '2026-02-05 05:50:42', NULL),
(7, '0214118701', '19871114 202321 1 026', 'Fenando, M.Kom.', '085367894141', 'Jl. Musi Raya Utara No 538 Sako palembang', 'Palembang, 14-11-1987', 'Lektor', 'III.d', '2017-01-02 05:50:41', 'Dosen / Lektor', 'aktif', 1, NULL, 20, '2026-02-05 05:50:43', '2026-02-18 17:59:56', 'fenando_uin@radenfatah.ac.id'),
(8, '0203118601', '203118601', 'Freddy Kurnia Wijaya, S.Kom., M.Eng.', '085268500109', 'Demang Lebar Daun, Palembang', NULL, 'Dosen', '3b', NULL, 'Asisten Ahli', 'aktif', 1, NULL, 21, '2026-02-05 05:50:43', '2026-03-13 21:10:00', 'freddykurniawijaya_uin@radenfatah.ac.id'),
(9, '0215108502', '19851015 202521 2 005', 'Evi Fadilah, M.Kom.', NULL, 'Palembang', 'Palembang, 15-10-1985', 'PPPK', 'III.c', '2017-01-02 05:50:41', 'Dosen / Lektor', 'aktif', 1, NULL, 22, '2026-02-05 05:50:43', '2026-02-05 05:50:43', NULL),
(10, '0223108404', '19841023 202321 1 016', 'Muhamad Kadafi, M.Kom.', NULL, 'Palembang', 'Palembang, 23-10-1984', 'PPPK', 'III.c', '2017-01-02 05:50:41', 'Dosen / Lektor', 'aktif', 1, NULL, 23, '2026-02-05 05:50:43', '2026-02-05 05:50:43', NULL),
(11, '2029128503', '19851229 202321 1 020', 'Muhamad Son Muarie, M.Kom.', NULL, 'Palembang', 'Lumpatan, 29-12-1985', 'PPPK', 'III.b', '2018-01-01 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 24, '2026-02-05 05:50:44', '2026-02-05 05:50:44', NULL),
(12, '2017118205', '19821117 202321 2 021', 'Fathiyah Nopriani, S.T., M.Kom.', NULL, 'Palembang', 'Palembang, 17-11-1982', 'PPPK', 'III.c', '2018-01-01 05:50:41', 'Sekprodi/Dosen/Lektor', 'aktif', 1, NULL, 25, '2026-02-05 05:50:44', '2026-02-05 05:50:44', NULL),
(13, '2021128901', '19891221 202321 1 018', 'Imamulhakim Syahid Putra, M.Kom.', NULL, 'Palembang', 'Jaksel, 21-12-1989', 'PPPK', 'III.b', '2018-01-01 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 26, '2026-02-05 05:50:44', '2026-02-05 05:50:44', NULL),
(14, '2010098902', '19890910 202321 1 028', 'Aminullah Imal Alfresi, S.T., M.Kom.', NULL, 'Palembang', 'Belitang, 10-09-1989', 'PPPK', 'III.b', '2018-01-01 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 27, '2026-02-05 05:50:44', '2026-02-05 05:50:44', NULL),
(15, '2004049101', '19910104 202321 2 041', 'Sri Rahayu, M.Kom.', NULL, 'Palembang', 'Palembang, 04-01-1991', 'PPPK', 'III.b', '2018-01-01 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 28, '2026-02-05 05:50:45', '2026-02-05 05:50:45', NULL),
(16, '2030129301', '19931230 202321 1 017', 'Muhammad Leandry Dalafranka, M.Kom.', NULL, 'Palembang', NULL, NULL, NULL, NULL, NULL, 'aktif', 1, NULL, 29, '2026-02-05 05:50:45', '2026-04-22 22:30:50', NULL),
(17, '2023058902', '198905232025212020', 'Indah Hidayanti, S.T., M.Kom.', NULL, 'Palembang', 'Palembang, 23-05-1989', 'PPPK', 'III.b', '2021-11-22 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 30, '2026-02-05 05:50:45', '2026-02-05 05:50:45', NULL),
(18, '2009048801', '19880904 202521 2 002', 'Reni Septiyanti, S.SI., M.Kom.', NULL, 'Palembang', 'Plaju, 04-09-1988', 'PPPK', 'III.b', '2021-11-22 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 31, '2026-02-05 05:50:45', '2026-02-05 05:50:45', NULL),
(19, '2030069402', '19940630 202521 2 009', 'Gina Agiyani, M.Kom.', NULL, 'Palembang', 'Tanjung Batu, 30-06-1994', 'PPPK', 'III.b', '2021-11-22 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 32, '2026-02-05 05:50:46', '2026-02-05 05:50:46', NULL),
(20, '2013047902', '19790403 202321 1 007', 'M. Syendi Apriko, M.Kom.', NULL, 'Palembang', 'Palembang, 13-04-1979', 'PPPK', 'III.b', '2018-01-01 05:50:41', 'Dosen / Asisten Ahli', 'aktif', 1, NULL, 33, '2026-02-05 05:50:46', '2026-02-05 05:50:46', NULL),
(21, '0221039001', '199003212024031001', 'Deni Fikari, S.Kom., M.Kom.', NULL, 'Palembang', 'Kab. Musi Banyuasin, 21 Maret 1990', 'CPNS', 'III.b', '2024-01-03 05:50:41', 'Cados', 'aktif', 1, NULL, 34, '2026-02-05 05:50:46', '2026-02-05 05:50:46', NULL),
(22, '2001027202', '197202012000031004', 'Dr. Muhammad Isnaini, M.Pd', NULL, 'Palembang', NULL, 'CPNS', 'III.b', '2020-01-03 05:50:41', 'Dekan', 'aktif', 1, NULL, 35, '2026-02-05 05:50:46', '2026-02-05 05:50:46', NULL),
(23, '0002018705', '198701022018011001', 'REZA ADE PUTRA, S.Pd, M.Cs', NULL, 'Palembang', NULL, 'CPNS', 'III.b', '2024-01-03 05:50:41', 'Cados', 'tidak aktif', 1, NULL, 36, '2026-02-05 05:50:47', '2026-02-05 05:50:47', NULL),
(25, '12345678', NULL, 'tester', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aktif', 1, NULL, 1669, NULL, NULL, NULL),
(30, '0000000002', '198801012015011002', 'John Smith, M.Cs.', NULL, NULL, NULL, NULL, NULL, NULL, 'Sekprodi', 'aktif', 1, NULL, 1677, '2026-04-17 02:01:11', '2026-04-17 02:01:11', NULL),
(31, '0000000003', '198901012015011003', 'Alice Johnson, M.Pd.', NULL, NULL, NULL, NULL, NULL, NULL, 'Dosen', 'aktif', 1, NULL, 1678, '2026-04-17 02:01:11', '2026-04-17 02:01:11', NULL),
(35, '0000000001', '198701012015011001', 'Dr. Jane Doe, M.T.', NULL, NULL, NULL, NULL, NULL, NULL, 'Ka Prodi', 'aktif', 1, NULL, 1685, '2026-04-29 09:31:38', '2026-04-29 09:31:38', NULL),
(39, '0000000004', '199001012015011004', 'Dr. Robert Fox, M.Kom.', NULL, NULL, NULL, NULL, NULL, NULL, 'Ka Prodi', 'aktif', 1, NULL, 1690, '2026-04-30 00:16:43', '2026-04-30 00:16:43', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dosen_nidn_unique` (`nidn`),
  ADD UNIQUE KEY `dosen_nip_unique` (`nip`),
  ADD UNIQUE KEY `dosen_email_unique` (`email`),
  ADD KEY `dosen_prodi_id_foreign` (`prodi_id`),
  ADD KEY `dosen_user_id_foreign` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dosen`
--
ALTER TABLE `dosen`
  ADD CONSTRAINT `dosen_prodi_id_foreign` FOREIGN KEY (`prodi_id`) REFERENCES `prodi` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `dosen_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
