-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 05, 2026 at 10:41 AM
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
-- Table structure for table `syarat`
--

CREATE TABLE `syarat` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `jenis_ujian_id` bigint(20) UNSIGNED NOT NULL,
  `nama_syarat` varchar(255) NOT NULL,
  `kategori` enum('akademik','administratif','bimbingan') NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `wajib` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `syarat`
--

INSERT INTO `syarat` (`id`, `jenis_ujian_id`, `nama_syarat`, `kategori`, `deskripsi`, `wajib`, `created_at`, `updated_at`) VALUES
(1, 1, 'Lulus mata kuliah Metodologi Penelitian (minimal C)', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(2, 1, 'SKS yang telah ditempuh minimal >= 100 sks', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(3, 1, 'IPK >= 2.00', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(4, 1, 'Transkrip nilai sementara yang dilegalisir', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(5, 1, 'Formulir pengajuan judul dan pembimbing skripsi yang telah ditanda tangani Koordinator Skripsi dan Ketua Program Studi', 'bimbingan', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(6, 1, 'Halaman pengesahan proposal skripsi yang di tanda tangani Pembimbing dan Ketua Program Studi', 'bimbingan', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(7, 1, 'Formulir Mengikuti Ujian Seminar Proposal', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(8, 1, 'Surat Keterangan Lulus Cek Plagiat', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(9, 1, 'File Proposal Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Proposal', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(10, 1, 'Form Perbaikan Proposal untuk ujian ke-2, 3 dst.', 'administratif', NULL, 0, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(11, 2, 'Bukti pembayaran SPP semester berjalan', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(12, 2, 'KST yang tercantum Skripsi', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(13, 2, 'Transkrip nilai sementara yang dilegalisir', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(14, 2, 'Surat Keterangan Lulus Ujian Seminar Proposal', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(15, 2, 'Bukti lulus ujian BTA (sertifikat BTA)', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(16, 2, 'Bukti lulus TOEFL >= 400', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(17, 2, 'Bukti hafalan 10 surat Juz \'Amma', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(18, 2, 'Ijazah SMA/MA', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(19, 2, 'Sertifikat KKN', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(20, 2, 'Bukti hadir dalam seminar proposal', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(21, 2, 'Halaman Pengesahan Skripsi untuk ujian hasil yang ditanda tangani Pembimbing dan Ketua Program Studi', 'bimbingan', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(22, 2, 'Formulir Mengikuti Ujian Hasil', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(23, 2, 'Surat Keterangan Lulus Cek Plagiat', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(24, 2, 'File Hasil Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Hasil', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(25, 2, 'Formulir Perbaikan Proposal Skripsi', 'administratif', NULL, 0, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(26, 2, 'Form Perbaikan Hasil untuk ujian ke-2, 3 dst.', 'administratif', NULL, 0, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(27, 3, 'Skripsi yang di ACC Pembimbing I dan II', 'bimbingan', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(28, 3, 'Surat Kelengkapan Berkas Yang Telah Ditanda tangani oleh Ka. Prodi / Sek. Prodi', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(29, 3, 'Surat Rekapitulasi Nilai Ujian Komprehensif', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(30, 3, 'Surat Ket. Perubahan Judul (Jika Berubah)', 'administratif', NULL, 0, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(31, 3, 'Surat Izin Penelitian', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(32, 3, 'KTM', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(33, 3, 'Bukti pembayaran SPP semester berjalan', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(34, 3, 'Transkrip nilai sementara yang dilegalisir', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(35, 3, 'Surat Keterangan Lulus Ujian Seminar Proposal', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(36, 3, 'Bukti lulus ujian BTA (sertifikat BTA)', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(37, 3, 'Ijazah SMA/MA', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(38, 3, 'Sertifikat KKN', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(39, 3, 'Formulir Mengikuti Ujian Skripsi', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(40, 3, 'Surat Keterangan Lulus Ujian Hasil', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(41, 3, 'Surat Keterangan Lulus Cek Plagiat', 'akademik', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(42, 3, 'Bukti mengirim (Submit) jurnal ilmiah', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(43, 3, 'Sertifikat OSPEK', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(44, 3, 'Halaman Pengesahan Skripsi yang ditanda tangani oleh Pembimbing dan ketua Program Studi', 'bimbingan', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(45, 3, 'File Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Skripsi', 'administratif', NULL, 1, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(46, 3, 'Formulir Perbaikan Hasil Skripsi', 'administratif', NULL, 0, '2026-02-05 05:57:38', '2026-02-05 05:57:38'),
(47, 3, 'Form Perbaikan Skripsi untuk ujian ke-2, 3 dst.', 'administratif', NULL, 0, '2026-02-05 05:57:38', '2026-02-05 05:57:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `syarat`
--
ALTER TABLE `syarat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `syarat_jenis_ujian_id_foreign` (`jenis_ujian_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `syarat`
--
ALTER TABLE `syarat`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `syarat`
--
ALTER TABLE `syarat`
  ADD CONSTRAINT `syarat_jenis_ujian_id_foreign` FOREIGN KEY (`jenis_ujian_id`) REFERENCES `jenis_ujian` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
