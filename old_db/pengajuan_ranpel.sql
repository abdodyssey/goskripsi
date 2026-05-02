@-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 01, 2026 at 12:26 AM
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
-- Table structure for table `pengajuan_ranpel`
--

CREATE TABLE `pengajuan_ranpel` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ranpel_id` bigint(20) UNSIGNED NOT NULL,
  `mahasiswa_id` bigint(20) UNSIGNED NOT NULL,
  `tanggal_pengajuan` datetime DEFAULT NULL,
  `tanggal_diverifikasi` datetime DEFAULT NULL,
  `tanggal_diterima` datetime DEFAULT NULL,
  `status` enum('menunggu','diverifikasi','diterima','ditolak') NOT NULL DEFAULT 'menunggu',
  `keterangan` varchar(255) DEFAULT NULL,
  `catatan_kaprodi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `tanggal_ditolak` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pengajuan_ranpel`
--

INSERT INTO `pengajuan_ranpel` (`id`, `ranpel_id`, `mahasiswa_id`, `tanggal_pengajuan`, `tanggal_diverifikasi`, `tanggal_diterima`, `status`, `keterangan`, `catatan_kaprodi`, `created_at`, `updated_at`, `tanggal_ditolak`) VALUES
(11, 11, 620, '2026-02-03 12:43:47', NULL, NULL, 'ditolak', '', 'Silakan ke dosen PA terlebih dahulu.', '2026-02-02 22:43:47', '2026-02-23 23:50:38', '2026-02-24 06:50:38'),
(12, 12, 515, '2026-02-05 04:57:56', '2026-02-11 06:44:23', '2026-02-18 03:50:06', 'diterima', '', 'Lanjutkan ke pembimbing.', '2026-02-04 14:57:56', '2026-02-17 20:50:06', NULL),
(13, 13, 635, '2026-02-05 09:39:39', '2026-02-23 02:28:56', NULL, 'ditolak', '', 'Dengan kasus yang sama sudah ada diteliti sebelumnya https://www.researchgate.net/publication/367572761_Analisis_Kepuasan_Pengguna_Terhadap_Sistem_E-Raport_Menggunakan_Metode_EUCS_dan_Model_Delone_and_McLean', '2026-02-04 19:39:39', '2026-02-23 23:47:00', '2026-02-24 06:47:00'),
(14, 14, 792, '2026-02-07 01:52:47', '2026-02-07 01:56:32', '2026-02-19 00:56:10', 'diterima', 'Lanjut', 'Lanjut ke pembimbing', '2026-02-06 18:52:47', '2026-02-18 17:56:10', NULL),
(15, 15, 525, '2026-02-09 10:01:25', '2026-02-11 06:53:06', '2026-02-19 01:07:40', 'diterima', '', 'Fitur SIAK nya lebih dari dapotdik sekolah dan web profile smn 3 Sekayu yang sudah dibuat oleh mhs teknokrat.', '2026-02-09 03:01:25', '2026-02-18 18:07:40', NULL),
(16, 16, 620, '2026-02-10 04:22:45', '2026-02-18 06:18:40', '2026-02-19 01:11:53', 'diterima', 'ok', 'Dipastikan data tunggakan didapatkan. Lanjutkan ke pembimbing.', '2026-02-09 21:22:45', '2026-02-18 18:11:53', NULL),
(17, 17, 601, '2026-02-11 12:18:56', '2026-02-13 15:40:42', '2026-02-19 01:14:11', 'diterima', '', 'Lanjut ke Pembimbing', '2026-02-11 05:18:56', '2026-02-18 18:14:11', NULL),
(18, 18, 761, '2026-02-14 10:17:30', NULL, NULL, 'ditolak', 'Topik udh pernah diambil sm kk tingkat. \nMetode Pieces kurang pas digunakna utk.', NULL, '2026-02-14 03:17:30', '2026-02-17 18:47:08', '2026-02-18 01:47:08'),
(19, 19, 761, '2026-02-18 07:12:22', NULL, NULL, 'ditolak', 'test', NULL, '2026-02-18 00:12:22', '2026-02-22 20:12:15', '2026-02-23 03:12:15'),
(20, 20, 711, '2026-02-18 10:44:32', '2026-02-18 11:42:33', '2026-02-19 01:48:12', 'diterima', '', 'Judul skripsinya lbih ke pengolahan citra di ranahnya mhs Teknik Informatika. Jika bisa memahami computer vision, pengolahan citra, machine learning (tapi ke image bukan ke data mining) untuk dilanjutkan diskusi dengan ibu ya.', '2026-02-18 03:44:32', '2026-02-18 18:48:12', NULL),
(21, 21, 761, '2026-02-19 07:48:27', '2026-02-23 03:13:11', NULL, 'ditolak', 'Bahas offline bae ke pak', NULL, '2026-02-19 00:48:27', '2026-02-22 20:13:20', '2026-02-23 03:13:20'),
(22, 22, 801, '2026-02-20 03:11:54', '2026-02-21 08:20:57', '2026-02-24 06:44:13', 'diterima', '', 'Lanjutkan ke Pembimbing', '2026-02-19 20:11:54', '2026-02-23 23:44:13', NULL),
(24, 24, 925, '2026-02-25 10:32:47', '2026-02-27 07:58:35', '2026-03-01 14:53:17', 'diterima', 'Sudah 3x melakukan bimbingan RanPel', NULL, '2026-02-25 03:32:47', '2026-03-01 07:53:17', NULL),
(25, 25, 795, '2026-02-26 13:21:14', '2026-03-02 08:45:22', '2026-03-05 05:08:34', 'diterima', '', 'Pastikan data yang diambil dapat dan sesuai dengan tujuan penelitian', '2026-02-26 06:21:14', '2026-03-04 22:08:34', NULL),
(26, 26, 783, '2026-02-27 08:49:41', '2026-03-01 04:39:09', '2026-03-01 14:54:21', 'diterima', 'Dapat dilanjutkan', NULL, '2026-02-27 01:49:41', '2026-03-01 07:54:21', NULL),
(27, 27, 694, '2026-02-28 14:25:41', '2026-03-02 03:40:39', '2026-03-05 05:11:47', 'diterima', '', NULL, '2026-02-28 07:25:41', '2026-03-04 22:11:47', NULL),
(28, 28, 701, '2026-03-02 16:17:48', '2026-03-11 07:11:41', '2026-04-01 14:30:30', 'diterima', '', 'Lanjutkan bimbingan ke pembimbing 1 dan 2', '2026-03-02 09:17:48', '2026-04-01 07:30:30', NULL),
(29, 29, 676, '2026-03-03 04:28:16', '2026-03-04 07:26:51', '2026-03-05 05:15:28', 'diterima', 'Oke', 'Judulnya di ganti dengan Magang Berdampak. MBKM nya diganti dengan Berdampak.', '2026-03-02 21:28:16', '2026-03-04 22:15:28', NULL),
(31, 31, 919, '2026-03-04 05:26:43', '2026-03-04 05:33:54', NULL, 'ditolak', 'Oke diteruskan', 'Silakan dicari judul atau kasus lain, karena sudah ada yang meneiti sebeum nya malah lebih komplek Sumatera Selatan.\nhttps://ejournal.uigm.ac.id/index.php/JSECI/article/download/4945/2403/15248', '2026-03-03 22:26:43', '2026-03-04 22:18:02', '2026-03-05 05:18:02'),
(35, 35, 761, '2026-03-07 01:21:31', '2026-03-30 06:43:07', '2026-03-31 01:39:18', 'diterima', '', 'Lanjutkan ke Dosen Pembimbing yang ditunjuk.', '2026-03-06 18:21:31', '2026-03-30 18:39:18', NULL),
(38, 38, 956, '2026-03-11 04:21:38', '2026-03-12 08:12:52', '2026-03-31 01:40:39', 'diterima', 'Lanjutkan', 'Silakan konsultasikan dengan pembimbing yang sudah ditunjuk', '2026-03-10 21:21:38', '2026-03-30 18:40:39', NULL),
(39, 39, 888, '2026-03-11 12:59:50', '2026-03-12 02:19:43', '2026-03-31 01:41:30', 'diterima', 'Lanjutkan', 'Lanjutkan ke pembimbing yang telah ditunjuk', '2026-03-11 05:59:50', '2026-03-30 18:41:30', NULL),
(40, 40, 919, '2026-03-12 02:54:25', '2026-03-12 14:25:56', '2026-04-01 05:38:27', 'diterima', 'ok setuju', 'Untuk berdasarkan indikator sosial ekonominya dihapus saja dijudul.', '2026-03-11 19:54:25', '2026-03-31 22:38:27', NULL),
(41, 41, 635, '2026-03-12 05:02:44', '2026-04-01 06:07:58', '2026-04-01 14:22:12', 'diterima', '', 'Lanjutkan bimbingan dengan pembimbing 1 dan 2', '2026-03-11 22:02:44', '2026-04-01 07:22:12', NULL),
(42, 42, 821, '2026-03-13 04:09:46', '2026-03-31 01:34:25', '2026-04-01 14:26:00', 'diterima', '', 'Lanjutkan ke pembimbing 1 dan 2', '2026-03-12 21:09:46', '2026-04-01 07:26:00', NULL),
(43, 43, 862, '2026-03-16 04:07:23', '2026-03-30 06:42:27', '2026-04-01 14:28:13', 'diterima', 'Oke', 'Lanjutkan ke Pembimbing 1 dan 2', '2026-03-15 21:07:23', '2026-04-01 07:28:13', NULL),
(44, 44, 578, '2026-03-16 09:54:14', '2026-03-31 01:03:15', '2026-04-01 14:19:45', 'diterima', 'Tambahkan referensi dari aplikasi tabungan emas nya pegadaian.', 'Lanjutkan bimbingan', '2026-03-16 02:54:14', '2026-04-01 07:19:45', NULL),
(45, 45, 631, '2026-03-17 06:29:26', '2026-03-31 01:35:36', '2026-04-01 14:18:18', 'diterima', '', 'Lanjut bimbingan dengan pembimbing 1 dan 2', '2026-03-16 23:29:26', '2026-04-01 07:18:18', NULL),
(47, 47, 957, '2026-03-31 05:40:32', '2026-04-08 11:04:43', '2026-04-09 01:45:06', 'diterima', '', 'Tambahkan atribut yang sesuai, karena dengan prestasi dan kehadiran tanpa menggunakan clustering dapat dikelompokan dengan  mudah.', '2026-03-30 22:40:32', '2026-04-08 18:45:06', NULL),
(48, 48, 558, '2026-04-01 16:37:28', '2026-04-15 04:02:35', '2026-04-23 04:26:11', 'diterima', '', 'Lanjutkan ke pembimbing 1 dan 2', '2026-04-01 09:37:28', '2026-04-22 21:26:11', NULL),
(49, 49, 886, '2026-04-01 19:24:39', '2026-04-08 03:10:03', '2026-04-09 01:45:53', 'diterima', 'ACC', 'Lanjut ke pembimbing', '2026-04-01 12:24:39', '2026-04-08 18:45:53', '2026-04-07 08:11:00'),
(50, 50, 916, '2026-04-05 13:24:38', NULL, NULL, 'ditolak', 'latar belakang belum kuat untuk di jadikan penelitian', NULL, '2026-04-05 06:24:38', '2026-04-05 22:34:30', '2026-04-06 05:34:30'),
(51, 51, 916, '2026-04-05 13:30:11', '2026-04-06 04:48:04', '2026-04-09 01:47:53', 'diterima', 'Acc Judul', 'Lanjut ke pembimbing', '2026-04-05 06:30:11', '2026-04-08 18:47:53', NULL),
(52, 52, 767, '2026-04-06 03:44:30', '2026-04-07 22:15:14', '2026-04-09 01:48:41', 'diterima', 'Lanjutkan', 'Lanjut ke pembimbing', '2026-04-05 20:44:30', '2026-04-08 18:48:41', NULL),
(53, 53, 754, '2026-04-07 05:33:40', '2026-04-09 04:50:03', '2026-04-13 01:50:07', 'diterima', '', 'Lanjutkan ke dosen pembimbing', '2026-04-06 22:33:40', '2026-04-12 18:50:07', NULL),
(54, 54, 711, '2026-04-09 01:33:26', '2026-04-09 01:43:21', '2026-04-09 01:50:13', 'diterima', '', 'Lanjut ke pembimbing', '2026-04-08 18:33:26', '2026-04-08 18:50:13', NULL),
(55, 55, 965, '2026-04-09 03:21:54', '2026-04-09 03:42:28', '2026-04-13 01:52:00', 'diterima', 'acc proposal', 'Lanjutkan ke pembimbing', '2026-04-08 20:21:54', '2026-04-12 18:52:00', NULL),
(57, 57, 793, '2026-04-09 08:33:54', '2026-04-13 07:07:08', '2026-04-23 04:31:38', 'diterima', 'acc', 'Lanjut ke pembimbing 1 dan 2', '2026-04-09 01:33:54', '2026-04-22 21:31:38', NULL),
(58, 58, 752, '2026-04-09 09:04:09', '2026-04-12 01:44:26', '2026-04-13 01:52:51', 'diterima', '', 'Lanjutkan ke pembimbing', '2026-04-09 02:04:09', '2026-04-12 18:52:51', NULL),
(59, 59, 535, '2026-04-09 13:59:11', '2026-04-13 01:55:30', '2026-04-13 01:58:56', 'diterima', 'Kalimat Judul ini telah dikonsultasikan ...dihilangkan saja.', NULL, '2026-04-09 06:59:11', '2026-04-12 18:58:56', NULL),
(65, 65, 887, '2026-04-13 16:55:13', '2026-04-23 05:29:24', '2026-04-28 03:42:33', 'diterima', 'untuk judul buat 3 paragraf ya, kemudian jika mmg dibutuhkan hal-hal yang lain, silahkan masukkan di batasan masalah', 'Lanjutkan ke pembimbing', '2026-04-13 09:55:13', '2026-04-27 20:42:33', NULL),
(66, 66, 750, '2026-04-14 04:21:28', '2026-04-16 04:35:19', '2026-04-23 04:24:15', 'diterima', '', 'Lanjut ke pembimbing 1 dan 2', '2026-04-13 21:21:28', '2026-04-22 21:24:15', NULL),
(71, 71, 937, '2026-04-15 05:21:56', '2026-04-23 05:32:50', '2026-04-28 03:39:14', 'diterima', '', 'Lanjutkan ke pembimbing', '2026-04-14 22:21:56', '2026-04-27 20:39:14', NULL),
(72, 72, 781, '2026-04-15 09:44:36', '2026-04-23 04:13:09', '2026-04-23 04:27:05', 'diterima', 'Lakukan pengecekan ulang untuk analisis yang sama di website yang sama. Jika sudah ada ganti kasusnya.', 'Lanjut ke pembimbing 1 dan 2', '2026-04-15 02:44:36', '2026-04-22 21:27:05', NULL),
(73, 73, 859, '2026-04-16 08:30:32', '2026-04-27 03:09:49', '2026-04-28 03:40:26', 'diterima', 'ok', 'Lanjutkan ke pembimbing', '2026-04-16 01:30:32', '2026-04-27 20:40:26', NULL),
(75, 75, 777, '2026-04-16 15:29:11', '2026-04-20 00:38:56', '2026-04-23 04:30:37', 'diterima', 'Acc Ranpel', 'Lanjutkan ke pembimbing 1 dan 2', '2026-04-16 08:29:11', '2026-04-22 21:30:37', NULL),
(76, 76, 547, '2026-04-17 08:20:13', '2026-04-20 04:44:07', '2026-04-23 04:14:52', 'diterima', '', 'Lanjut ke pembimbing 1 dan 2', '2026-04-17 01:20:13', '2026-04-22 21:14:52', NULL),
(79, 79, 860, '2026-04-19 13:22:52', '2026-04-22 01:35:03', '2026-04-23 04:16:56', 'diterima', '', 'Lanjut ke pembimbing 1 dan 2', '2026-04-19 06:22:52', '2026-04-22 21:16:56', NULL),
(80, 80, 882, '2026-04-21 01:14:42', '2026-04-21 02:28:53', '2026-04-23 04:18:37', 'diterima', 'Acc Ranpel', 'Lanjut ke pembimbing 1 dan 2', '2026-04-20 18:14:42', '2026-04-22 21:18:37', NULL),
(81, 81, 882, '2026-04-21 01:18:09', NULL, NULL, 'ditolak', '.', 'Silakan dibatalkan', '2026-04-20 18:18:09', '2026-04-22 21:57:10', '2026-04-23 04:57:10'),
(82, 82, 882, '2026-04-22 02:36:40', NULL, NULL, 'ditolak', '.', 'silakan dibatalkan', '2026-04-21 19:36:40', '2026-04-22 21:57:42', '2026-04-23 04:57:42'),
(84, 84, 826, '2026-04-22 10:32:17', '2026-04-23 07:20:24', '2026-04-28 03:41:24', 'diterima', '', 'Lanjutkan ke pembimbing', '2026-04-22 03:32:17', '2026-04-27 20:41:24', NULL),
(85, 85, 877, '2026-04-22 13:03:21', '2026-04-23 05:36:37', '2026-04-28 03:30:47', 'diterima', 'Lanjutkan', 'Silakan lanjutkan ke pembimbing.', '2026-04-22 06:03:21', '2026-04-27 20:30:47', NULL),
(86, 86, 782, '2026-04-23 04:58:14', '2026-04-27 04:35:20', '2026-04-28 03:31:53', 'ditolak', '', 'pengajuan yang ini saya tolak karena ada perubahan judul', '2026-04-22 21:58:14', '2026-04-28 18:03:55', '2026-04-29 01:03:55'),
(87, 87, 856, '2026-04-23 07:25:05', '2026-04-23 07:38:31', '2026-04-28 03:33:50', 'diterima', '', 'Lanjutkan ke pembimbing', '2026-04-23 00:25:05', '2026-04-27 20:33:50', NULL),
(88, 88, 715, '2026-04-23 08:07:47', '2026-04-23 09:23:28', '2026-04-28 03:35:50', 'diterima', 'Lanjutkan pengajuan judul skripsi', 'Lanjutkan ke pembimbing', '2026-04-23 01:07:47', '2026-04-27 20:35:50', NULL),
(89, 89, 715, '2026-04-23 08:10:09', '2026-04-23 09:23:40', NULL, 'ditolak', 'Lanjutkan pengajuan judul skripsi', 'Sudah ada pengajuan yang di acc', '2026-04-23 01:10:09', '2026-04-27 20:37:15', '2026-04-28 03:37:15'),
(90, 90, 715, '2026-04-23 08:12:24', '2026-04-23 09:23:50', NULL, 'ditolak', 'Lanjutkan pengajuan judul skripsi', 'Sudah ada pengajuan yg diacc', '2026-04-23 01:12:24', '2026-04-27 20:36:51', '2026-04-28 03:36:51'),
(91, 91, 640, '2026-04-26 16:28:43', NULL, NULL, 'menunggu', '', NULL, '2026-04-26 09:28:43', '2026-04-26 09:28:43', NULL),
(92, 92, 825, '2026-04-27 04:14:36', NULL, NULL, 'menunggu', '', NULL, '2026-04-26 21:14:36', '2026-04-26 21:14:36', NULL),
(93, 93, 947, '2026-04-27 04:36:04', NULL, NULL, 'menunggu', '', NULL, '2026-04-26 21:36:04', '2026-04-26 21:36:04', NULL),
(94, 94, 928, '2026-04-27 05:36:38', '2026-04-27 05:54:31', '2026-04-28 03:38:32', 'diterima', '', 'Lanjutkan ke pembimbing', '2026-04-26 22:36:38', '2026-04-27 20:38:32', NULL),
(95, 95, 806, '2026-04-28 04:19:11', NULL, NULL, 'menunggu', '', NULL, '2026-04-27 21:19:11', '2026-04-27 21:19:11', NULL),
(96, 96, 815, '2026-04-28 05:28:00', NULL, NULL, 'menunggu', '', NULL, '2026-04-27 22:28:00', '2026-04-27 22:28:00', NULL),
(98, 98, 782, '2026-04-28 05:51:06', '2026-04-28 06:53:33', '2026-04-30 01:32:49', 'diterima', '', 'Pengajuan awal dibatalkan, Lanjutkan kepembimbing yang ditunjuk.', '2026-04-27 22:51:06', '2026-04-29 18:32:49', NULL),
(99, 99, 729, '2026-04-28 10:35:41', NULL, NULL, 'menunggu', '', NULL, '2026-04-28 03:35:41', '2026-04-28 03:35:41', NULL),
(100, 100, 941, '2026-04-29 10:20:24', NULL, NULL, 'menunggu', '', NULL, '2026-04-29 03:20:24', '2026-04-29 03:20:24', NULL),
(101, 101, 909, '2026-04-30 03:01:20', '2026-04-30 03:30:20', NULL, 'diverifikasi', '', NULL, '2026-04-29 20:01:20', '2026-04-29 20:30:20', NULL),
(102, 102, 714, '2026-04-30 08:08:32', NULL, NULL, 'menunggu', '', NULL, '2026-04-30 01:08:32', '2026-04-30 01:08:32', NULL),
(103, 103, 901, '2026-04-30 10:59:21', NULL, NULL, 'menunggu', '', NULL, '2026-04-30 03:59:21', '2026-04-30 03:59:21', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pengajuan_ranpel`
--
ALTER TABLE `pengajuan_ranpel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pengajuan_ranpel_ranpel_id_foreign` (`ranpel_id`),
  ADD KEY `pengajuan_ranpel_mahasiswa_id_foreign` (`mahasiswa_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pengajuan_ranpel`
--
ALTER TABLE `pengajuan_ranpel`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pengajuan_ranpel`
--
ALTER TABLE `pengajuan_ranpel`
  ADD CONSTRAINT `pengajuan_ranpel_mahasiswa_id_foreign` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengajuan_ranpel_ranpel_id_foreign` FOREIGN KEY (`ranpel_id`) REFERENCES `ranpel` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
