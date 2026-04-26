/*
  Warnings:

  - The primary key for the `dosen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `dosen` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `dosen` table. All the data in the column will be lost.
  - You are about to drop the column `tmt_fst` on the `dosen` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `dosen` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `dosen` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `dosen` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The `status` column on the `dosen` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `prodi_id` on the `dosen` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `fakultas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `fakultas` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `fakultas` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `fakultas` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `jenis_ujian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `jenis_ujian` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `jenis_ujian` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `jenis_ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `keputusan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `keputusan` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `keputusan` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `keputusan` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `komponen_penilaian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bobot` on the `komponen_penilaian` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `komponen_penilaian` table. All the data in the column will be lost.
  - You are about to drop the column `deskripsi` on the `komponen_penilaian` table. All the data in the column will be lost.
  - You are about to drop the column `nama_komponen` on the `komponen_penilaian` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `komponen_penilaian` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `komponen_penilaian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `jenis_ujian_id` on the `komponen_penilaian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `mahasiswa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `url_bukti_lulus_metopen` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `url_ktm` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `url_sertifikat_bta` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `url_transkrip_nilai` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `mahasiswa` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `prodi_id` on the `mahasiswa` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `peminatan_id` on the `mahasiswa` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `dosen_pa` on the `mahasiswa` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `pembimbing_1` on the `mahasiswa` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `pembimbing_2` on the `mahasiswa` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The `status` column on the `mahasiswa` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `pemenuhan_syarat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to drop the column `file_size` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to drop the column `mime_type` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to drop the column `verified_at` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to drop the column `verified_by` on the `pemenuhan_syarat` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `pemenuhan_syarat` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `pendaftaran_ujian_id` on the `pemenuhan_syarat` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `syarat_id` on the `pemenuhan_syarat` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `peminatan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `peminatan` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `peminatan` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `peminatan` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `prodi_id` on the `peminatan` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `pendaftaran_ujian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `pendaftaran_ujian` table. All the data in the column will be lost.
  - You are about to drop the column `judul_snapshot` on the `pendaftaran_ujian` table. All the data in the column will be lost.
  - You are about to drop the column `perbaikan_judul_id` on the `pendaftaran_ujian` table. All the data in the column will be lost.
  - You are about to drop the column `ranpel_id` on the `pendaftaran_ujian` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal_pengajuan` on the `pendaftaran_ujian` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `pendaftaran_ujian` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `pendaftaran_ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `mahasiswa_id` on the `pendaftaran_ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `jenis_ujian_id` on the `pendaftaran_ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The `status` column on the `pendaftaran_ujian` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `penguji_ujian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `penguji_ujian` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `penguji_ujian` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `penguji_ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `ujian_id` on the `penguji_ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `dosen_id` on the `penguji_ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `penilaian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `penilaian` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `penilaian` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `penilaian` table. All the data in the column will be lost.
  - You are about to alter the column `ujian_id` on the `penilaian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `dosen_id` on the `penilaian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `komponen_penilaian_id` on the `penilaian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `prodi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `prodi` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `prodi` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `prodi` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `fakultas_id` on the `prodi` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `ruangan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `ruangan` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ruangan` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `ruangan` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `prodi_id` on the `ruangan` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `syarat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `syarat` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `syarat` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `syarat` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `syarat` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `jenis_ujian_id` on the `syarat` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `ujian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `catatan` on the `ujian` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ujian` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_ujian_id` on the `ujian` table. All the data in the column will be lost.
  - You are about to drop the column `mahasiswa_id` on the `ujian` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ujian` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `pendaftaran_ujian_id` on the `ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The `hari_ujian` column on the `ujian` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `ruangan_id` on the `ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The `hasil` column on the `ujian` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `keputusan_id` on the `ujian` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to drop the `berkas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bimbingan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cache_locks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daftar_kehadiran` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `failed_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `faqs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job_batches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `migrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `model_has_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `model_has_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `password_reset_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pejabat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pengajuan_ranpel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `perbaikan_judul` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `personal_access_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ranpel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_has_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skripsi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nama_fakultas]` on the table `fakultas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pendaftaran_ujian_id,syarat_id]` on the table `pemenuhan_syarat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ujian_id,dosen_id]` on the table `penguji_ujian` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pendaftaran_ujian_id]` on the table `ujian` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kriteria` to the `komponen_penilaian` table without a default value. This is not possible if the table is not empty.
  - Made the column `ipk` on table `mahasiswa` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `rancangan_penelitian_id` to the `pendaftaran_ujian` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `peran` on the `penguji_ujian` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StatusAkun" AS ENUM ('aktif', 'tidak_aktif');

-- CreateEnum
CREATE TYPE "StatusDosen" AS ENUM ('aktif', 'tidak_aktif');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('menunggu', 'diterima', 'ditolak');

-- CreateEnum
CREATE TYPE "StatusPendaftaran" AS ENUM ('menunggu', 'diterima', 'ditolak');

-- CreateEnum
CREATE TYPE "StatusUjian" AS ENUM ('belum_dijadwalkan', 'dijadwalkan', 'selesai');

-- CreateEnum
CREATE TYPE "HasilUjian" AS ENUM ('lulus', 'tidak_lulus');

-- CreateEnum
CREATE TYPE "PengujiPeran" AS ENUM ('ketua_penguji', 'sekretaris_penguji', 'penguji_1', 'penguji_2');

-- CreateEnum
CREATE TYPE "HariUjian" AS ENUM ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu');

-- DropForeignKey
ALTER TABLE "berkas" DROP CONSTRAINT "berkas_pendaftaran_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "bimbingan" DROP CONSTRAINT "bimbingan_dosen_id_fkey";

-- DropForeignKey
ALTER TABLE "bimbingan" DROP CONSTRAINT "bimbingan_mahasiswa_id_fkey";

-- DropForeignKey
ALTER TABLE "bimbingan" DROP CONSTRAINT "bimbingan_skripsi_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "daftar_kehadiran" DROP CONSTRAINT "daftar_kehadiran_dosen_id_fkey";

-- DropForeignKey
ALTER TABLE "daftar_kehadiran" DROP CONSTRAINT "daftar_kehadiran_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "dosen" DROP CONSTRAINT "dosen_prodi_id_fkey";

-- DropForeignKey
ALTER TABLE "dosen" DROP CONSTRAINT "dosen_user_id_fkey";

-- DropForeignKey
ALTER TABLE "komponen_penilaian" DROP CONSTRAINT "komponen_penilaian_jenis_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "mahasiswa" DROP CONSTRAINT "mahasiswa_pembimbing_1_fkey";

-- DropForeignKey
ALTER TABLE "mahasiswa" DROP CONSTRAINT "mahasiswa_pembimbing_2_fkey";

-- DropForeignKey
ALTER TABLE "mahasiswa" DROP CONSTRAINT "mahasiswa_peminatan_id_fkey";

-- DropForeignKey
ALTER TABLE "mahasiswa" DROP CONSTRAINT "mahasiswa_prodi_id_fkey";

-- DropForeignKey
ALTER TABLE "mahasiswa" DROP CONSTRAINT "mahasiswa_user_id_fkey";

-- DropForeignKey
ALTER TABLE "model_has_permissions" DROP CONSTRAINT "model_has_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "model_has_roles" DROP CONSTRAINT "model_has_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "pemenuhan_syarat" DROP CONSTRAINT "pemenuhan_syarat_pendaftaran_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "pemenuhan_syarat" DROP CONSTRAINT "pemenuhan_syarat_syarat_id_fkey";

-- DropForeignKey
ALTER TABLE "pemenuhan_syarat" DROP CONSTRAINT "pemenuhan_syarat_verified_by_fkey";

-- DropForeignKey
ALTER TABLE "peminatan" DROP CONSTRAINT "peminatan_prodi_id_fkey";

-- DropForeignKey
ALTER TABLE "pendaftaran_ujian" DROP CONSTRAINT "pendaftaran_ujian_jenis_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "pendaftaran_ujian" DROP CONSTRAINT "pendaftaran_ujian_mahasiswa_id_fkey";

-- DropForeignKey
ALTER TABLE "pendaftaran_ujian" DROP CONSTRAINT "pendaftaran_ujian_perbaikan_judul_id_fkey";

-- DropForeignKey
ALTER TABLE "pendaftaran_ujian" DROP CONSTRAINT "pendaftaran_ujian_ranpel_id_fkey";

-- DropForeignKey
ALTER TABLE "pengajuan_ranpel" DROP CONSTRAINT "pengajuan_ranpel_mahasiswa_id_fkey";

-- DropForeignKey
ALTER TABLE "pengajuan_ranpel" DROP CONSTRAINT "pengajuan_ranpel_ranpel_id_fkey";

-- DropForeignKey
ALTER TABLE "penguji_ujian" DROP CONSTRAINT "penguji_ujian_dosen_id_fkey";

-- DropForeignKey
ALTER TABLE "penguji_ujian" DROP CONSTRAINT "penguji_ujian_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "penilaian" DROP CONSTRAINT "penilaian_dosen_id_fkey";

-- DropForeignKey
ALTER TABLE "penilaian" DROP CONSTRAINT "penilaian_komponen_penilaian_id_fkey";

-- DropForeignKey
ALTER TABLE "penilaian" DROP CONSTRAINT "penilaian_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "perbaikan_judul" DROP CONSTRAINT "perbaikan_judul_mahasiswa_id_fkey";

-- DropForeignKey
ALTER TABLE "perbaikan_judul" DROP CONSTRAINT "perbaikan_judul_ranpel_id_fkey";

-- DropForeignKey
ALTER TABLE "prodi" DROP CONSTRAINT "prodi_fakultas_id_fkey";

-- DropForeignKey
ALTER TABLE "role_has_permissions" DROP CONSTRAINT "role_has_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_has_permissions" DROP CONSTRAINT "role_has_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "ruangan" DROP CONSTRAINT "ruangan_prodi_id_fkey";

-- DropForeignKey
ALTER TABLE "skripsi" DROP CONSTRAINT "skripsi_mahasiswa_id_fkey";

-- DropForeignKey
ALTER TABLE "skripsi" DROP CONSTRAINT "skripsi_pembimbing_1_fkey";

-- DropForeignKey
ALTER TABLE "skripsi" DROP CONSTRAINT "skripsi_pembimbing_2_fkey";

-- DropForeignKey
ALTER TABLE "skripsi" DROP CONSTRAINT "skripsi_ranpel_id_fkey";

-- DropForeignKey
ALTER TABLE "syarat" DROP CONSTRAINT "syarat_jenis_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "template" DROP CONSTRAINT "template_jenis_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "ujian" DROP CONSTRAINT "ujian_jenis_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "ujian" DROP CONSTRAINT "ujian_keputusan_id_fkey";

-- DropForeignKey
ALTER TABLE "ujian" DROP CONSTRAINT "ujian_mahasiswa_id_fkey";

-- DropForeignKey
ALTER TABLE "ujian" DROP CONSTRAINT "ujian_pendaftaran_ujian_id_fkey";

-- DropForeignKey
ALTER TABLE "ujian" DROP CONSTRAINT "ujian_ruangan_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_prodi_id_fkey";

-- DropIndex
DROP INDEX "dosen_prodi_id_idx";

-- DropIndex
DROP INDEX "dosen_user_id_idx";

-- DropIndex
DROP INDEX "komponen_penilaian_jenis_ujian_id_idx";

-- DropIndex
DROP INDEX "mahasiswa_pembimbing_1_idx";

-- DropIndex
DROP INDEX "mahasiswa_pembimbing_2_idx";

-- DropIndex
DROP INDEX "mahasiswa_peminatan_id_idx";

-- DropIndex
DROP INDEX "mahasiswa_prodi_id_idx";

-- DropIndex
DROP INDEX "mahasiswa_user_id_idx";

-- DropIndex
DROP INDEX "pemenuhan_syarat_pendaftaran_ujian_id_idx";

-- DropIndex
DROP INDEX "pemenuhan_syarat_syarat_id_idx";

-- DropIndex
DROP INDEX "pemenuhan_syarat_verified_by_idx";

-- DropIndex
DROP INDEX "peminatan_prodi_id_idx";

-- DropIndex
DROP INDEX "pendaftaran_ujian_jenis_ujian_id_idx";

-- DropIndex
DROP INDEX "pendaftaran_ujian_mahasiswa_id_idx";

-- DropIndex
DROP INDEX "pendaftaran_ujian_perbaikan_judul_id_idx";

-- DropIndex
DROP INDEX "pendaftaran_ujian_ranpel_id_idx";

-- DropIndex
DROP INDEX "penguji_ujian_dosen_id_idx";

-- DropIndex
DROP INDEX "penguji_ujian_ujian_id_peran_key";

-- DropIndex
DROP INDEX "penilaian_dosen_id_idx";

-- DropIndex
DROP INDEX "penilaian_komponen_penilaian_id_idx";

-- DropIndex
DROP INDEX "penilaian_ujian_id_idx";

-- DropIndex
DROP INDEX "prodi_fakultas_id_idx";

-- DropIndex
DROP INDEX "ruangan_prodi_id_idx";

-- DropIndex
DROP INDEX "syarat_jenis_ujian_id_idx";

-- DropIndex
DROP INDEX "ujian_jenis_ujian_id_idx";

-- DropIndex
DROP INDEX "ujian_keputusan_id_idx";

-- DropIndex
DROP INDEX "ujian_mahasiswa_id_idx";

-- DropIndex
DROP INDEX "ujian_pendaftaran_ujian_id_idx";

-- DropIndex
DROP INDEX "ujian_ruangan_id_idx";

-- AlterTable
ALTER TABLE "dosen" DROP CONSTRAINT "dosen_pkey",
DROP COLUMN "created_at",
DROP COLUMN "nama",
DROP COLUMN "tmt_fst",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusDosen" NOT NULL DEFAULT 'aktif',
ALTER COLUMN "prodi_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "dosen_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "dosen_id_seq";

-- AlterTable
ALTER TABLE "fakultas" DROP CONSTRAINT "fakultas_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "fakultas_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "jenis_ujian" DROP CONSTRAINT "jenis_ujian_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "jenis_ujian_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "keputusan" DROP CONSTRAINT "keputusan_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "keputusan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "komponen_penilaian" DROP CONSTRAINT "komponen_penilaian_pkey",
DROP COLUMN "bobot",
DROP COLUMN "created_at",
DROP COLUMN "deskripsi",
DROP COLUMN "nama_komponen",
DROP COLUMN "updated_at",
ADD COLUMN     "indikator_penilaian" TEXT,
ADD COLUMN     "kriteria" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "jenis_ujian_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "komponen_penilaian_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "mahasiswa" DROP CONSTRAINT "mahasiswa_pkey",
DROP COLUMN "created_at",
DROP COLUMN "nama",
DROP COLUMN "updated_at",
DROP COLUMN "url_bukti_lulus_metopen",
DROP COLUMN "url_ktm",
DROP COLUMN "url_sertifikat_bta",
DROP COLUMN "url_transkrip_nilai",
DROP COLUMN "user_id",
ADD COLUMN     "foto" TEXT,
ADD COLUMN     "url_ttd" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "prodi_id" DROP DEFAULT,
ALTER COLUMN "prodi_id" SET DATA TYPE INTEGER,
ALTER COLUMN "peminatan_id" SET DATA TYPE INTEGER,
ALTER COLUMN "ipk" SET NOT NULL,
ALTER COLUMN "dosen_pa" SET DATA TYPE INTEGER,
ALTER COLUMN "pembimbing_1" SET DATA TYPE INTEGER,
ALTER COLUMN "pembimbing_2" SET DATA TYPE INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusAkun" NOT NULL DEFAULT 'aktif',
ALTER COLUMN "angkatan" DROP NOT NULL,
ADD CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "mahasiswa_id_seq";

-- AlterTable
ALTER TABLE "pemenuhan_syarat" DROP CONSTRAINT "pemenuhan_syarat_pkey",
DROP COLUMN "created_at",
DROP COLUMN "file_name",
DROP COLUMN "file_path",
DROP COLUMN "file_size",
DROP COLUMN "mime_type",
DROP COLUMN "status",
DROP COLUMN "updated_at",
DROP COLUMN "verified_at",
DROP COLUMN "verified_by",
ADD COLUMN     "file_bukti" TEXT,
ADD COLUMN     "terpenuhi" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "pendaftaran_ujian_id" SET DATA TYPE INTEGER,
ALTER COLUMN "syarat_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "pemenuhan_syarat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "peminatan" DROP CONSTRAINT "peminatan_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "prodi_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "peminatan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "pendaftaran_ujian" DROP CONSTRAINT "pendaftaran_ujian_pkey",
DROP COLUMN "created_at",
DROP COLUMN "judul_snapshot",
DROP COLUMN "perbaikan_judul_id",
DROP COLUMN "ranpel_id",
DROP COLUMN "tanggal_pengajuan",
DROP COLUMN "updated_at",
ADD COLUMN     "rancangan_penelitian_id" INTEGER NOT NULL,
ADD COLUMN     "tanggal_pendaftaran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "mahasiswa_id" SET DATA TYPE INTEGER,
ALTER COLUMN "jenis_ujian_id" SET DATA TYPE INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusPendaftaran" NOT NULL DEFAULT 'menunggu',
ADD CONSTRAINT "pendaftaran_ujian_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "penguji_ujian" DROP CONSTRAINT "penguji_ujian_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "ujian_id" SET DATA TYPE INTEGER,
ALTER COLUMN "dosen_id" SET DATA TYPE INTEGER,
DROP COLUMN "peran",
ADD COLUMN     "peran" "PengujiPeran" NOT NULL,
ADD CONSTRAINT "penguji_ujian_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "penilaian" DROP CONSTRAINT "penilaian_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "updated_at",
ALTER COLUMN "ujian_id" SET DATA TYPE INTEGER,
ALTER COLUMN "dosen_id" SET DATA TYPE INTEGER,
ALTER COLUMN "komponen_penilaian_id" SET DATA TYPE INTEGER,
ALTER COLUMN "nilai" DROP NOT NULL,
ADD CONSTRAINT "penilaian_pkey" PRIMARY KEY ("ujian_id", "dosen_id", "komponen_penilaian_id");

-- AlterTable
ALTER TABLE "prodi" DROP CONSTRAINT "prodi_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "fakultas_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "prodi_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ruangan" DROP CONSTRAINT "ruangan_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "prodi_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "syarat" DROP CONSTRAINT "syarat_pkey",
DROP COLUMN "created_at",
DROP COLUMN "kategori",
DROP COLUMN "updated_at",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "jenis_ujian_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "syarat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ujian" DROP CONSTRAINT "ujian_pkey",
DROP COLUMN "catatan",
DROP COLUMN "created_at",
DROP COLUMN "jenis_ujian_id",
DROP COLUMN "mahasiswa_id",
DROP COLUMN "updated_at",
ADD COLUMN     "catatan_revisi" TEXT,
ADD COLUMN     "nilai_huruf" TEXT,
ADD COLUMN     "status" "StatusUjian" NOT NULL DEFAULT 'belum_dijadwalkan',
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "pendaftaran_ujian_id" SET DATA TYPE INTEGER,
DROP COLUMN "hari_ujian",
ADD COLUMN     "hari_ujian" "HariUjian",
ALTER COLUMN "ruangan_id" SET DATA TYPE INTEGER,
DROP COLUMN "hasil",
ADD COLUMN     "hasil" "HasilUjian",
ALTER COLUMN "keputusan_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "ujian_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "berkas";

-- DropTable
DROP TABLE "bimbingan";

-- DropTable
DROP TABLE "cache";

-- DropTable
DROP TABLE "cache_locks";

-- DropTable
DROP TABLE "comments";

-- DropTable
DROP TABLE "daftar_kehadiran";

-- DropTable
DROP TABLE "failed_jobs";

-- DropTable
DROP TABLE "faqs";

-- DropTable
DROP TABLE "job_batches";

-- DropTable
DROP TABLE "jobs";

-- DropTable
DROP TABLE "migrations";

-- DropTable
DROP TABLE "model_has_permissions";

-- DropTable
DROP TABLE "model_has_roles";

-- DropTable
DROP TABLE "password_reset_tokens";

-- DropTable
DROP TABLE "pejabat";

-- DropTable
DROP TABLE "pengajuan_ranpel";

-- DropTable
DROP TABLE "perbaikan_judul";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "personal_access_tokens";

-- DropTable
DROP TABLE "ranpel";

-- DropTable
DROP TABLE "role_has_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "skripsi";

-- DropTable
DROP TABLE "template";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "bimbingan_status";

-- DropEnum
DROP TYPE "daftar_kehadiran_status_kehadiran";

-- DropEnum
DROP TYPE "dosen_status";

-- DropEnum
DROP TYPE "pemenuhan_syarat_status";

-- DropEnum
DROP TYPE "pendaftaran_ujian_status";

-- DropEnum
DROP TYPE "pengajuan_ranpel_status";

-- DropEnum
DROP TYPE "penguji_ujian_peran";

-- DropEnum
DROP TYPE "perbaikan_judul_status";

-- DropEnum
DROP TYPE "skripsi_status";

-- DropEnum
DROP TYPE "syarat_kategori";

-- DropEnum
DROP TYPE "ujian_hari_ujian";

-- DropEnum
DROP TYPE "ujian_hasil";

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "status" "StatusAkun" NOT NULL DEFAULT 'aktif',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rancangan_penelitian" (
    "id" SERIAL NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "judul_penelitian" TEXT NOT NULL,
    "masalah_dan_penyebab" TEXT,
    "alternatif_solusi" TEXT,
    "metode_penelitian" TEXT,
    "hasil_yang_diharapkan" TEXT,
    "kebutuhan_data" TEXT,
    "jurnal_referensi" TEXT,

    CONSTRAINT "rancangan_penelitian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_rancangan_penelitian" (
    "id" SERIAL NOT NULL,
    "rancangan_penelitian_id" INTEGER NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "tanggal_pengajuan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_dosen_pa" "StatusPengajuan" NOT NULL DEFAULT 'menunggu',
    "catatan_dosen_pa" TEXT,
    "tanggal_review_pa" TIMESTAMP(3),
    "status_kaprodi" "StatusPengajuan" NOT NULL DEFAULT 'menunggu',
    "catatan_kaprodi" TEXT,
    "tanggal_review_kaprodi" TIMESTAMP(3),

    CONSTRAINT "pengajuan_rancangan_penelitian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bobot_komponen_peran" (
    "id" SERIAL NOT NULL,
    "komponen_penilaian_id" INTEGER NOT NULL,
    "peran" "PengujiPeran" NOT NULL,
    "bobot" INTEGER NOT NULL,

    CONSTRAINT "bobot_komponen_peran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bobot_komponen_peran_komponen_penilaian_id_peran_key" ON "bobot_komponen_peran"("komponen_penilaian_id", "peran");

-- CreateIndex
CREATE UNIQUE INDEX "fakultas_nama_fakultas_key" ON "fakultas"("nama_fakultas");

-- CreateIndex
CREATE UNIQUE INDEX "pemenuhan_syarat_pendaftaran_ujian_id_syarat_id_key" ON "pemenuhan_syarat"("pendaftaran_ujian_id", "syarat_id");

-- CreateIndex
CREATE UNIQUE INDEX "penguji_ujian_ujian_id_dosen_id_key" ON "penguji_ujian"("ujian_id", "dosen_id");

-- CreateIndex
CREATE UNIQUE INDEX "ujian_pendaftaran_ujian_id_key" ON "ujian"("pendaftaran_ujian_id");

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_fakultas_id_fkey" FOREIGN KEY ("fakultas_id") REFERENCES "fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peminatan" ADD CONSTRAINT "peminatan_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruangan" ADD CONSTRAINT "ruangan_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen" ADD CONSTRAINT "dosen_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen" ADD CONSTRAINT "dosen_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_peminatan_id_fkey" FOREIGN KEY ("peminatan_id") REFERENCES "peminatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_dosen_pa_fkey" FOREIGN KEY ("dosen_pa") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_pembimbing_1_fkey" FOREIGN KEY ("pembimbing_1") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_pembimbing_2_fkey" FOREIGN KEY ("pembimbing_2") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rancangan_penelitian" ADD CONSTRAINT "rancangan_penelitian_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_rancangan_penelitian" ADD CONSTRAINT "pengajuan_rancangan_penelitian_rancangan_penelitian_id_fkey" FOREIGN KEY ("rancangan_penelitian_id") REFERENCES "rancangan_penelitian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_rancangan_penelitian" ADD CONSTRAINT "pengajuan_rancangan_penelitian_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syarat" ADD CONSTRAINT "syarat_jenis_ujian_id_fkey" FOREIGN KEY ("jenis_ujian_id") REFERENCES "jenis_ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komponen_penilaian" ADD CONSTRAINT "komponen_penilaian_jenis_ujian_id_fkey" FOREIGN KEY ("jenis_ujian_id") REFERENCES "jenis_ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bobot_komponen_peran" ADD CONSTRAINT "bobot_komponen_peran_komponen_penilaian_id_fkey" FOREIGN KEY ("komponen_penilaian_id") REFERENCES "komponen_penilaian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_ujian" ADD CONSTRAINT "pendaftaran_ujian_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_ujian" ADD CONSTRAINT "pendaftaran_ujian_rancangan_penelitian_id_fkey" FOREIGN KEY ("rancangan_penelitian_id") REFERENCES "rancangan_penelitian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_ujian" ADD CONSTRAINT "pendaftaran_ujian_jenis_ujian_id_fkey" FOREIGN KEY ("jenis_ujian_id") REFERENCES "jenis_ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemenuhan_syarat" ADD CONSTRAINT "pemenuhan_syarat_pendaftaran_ujian_id_fkey" FOREIGN KEY ("pendaftaran_ujian_id") REFERENCES "pendaftaran_ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemenuhan_syarat" ADD CONSTRAINT "pemenuhan_syarat_syarat_id_fkey" FOREIGN KEY ("syarat_id") REFERENCES "syarat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_pendaftaran_ujian_id_fkey" FOREIGN KEY ("pendaftaran_ujian_id") REFERENCES "pendaftaran_ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_ruangan_id_fkey" FOREIGN KEY ("ruangan_id") REFERENCES "ruangan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_keputusan_id_fkey" FOREIGN KEY ("keputusan_id") REFERENCES "keputusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penguji_ujian" ADD CONSTRAINT "penguji_ujian_ujian_id_fkey" FOREIGN KEY ("ujian_id") REFERENCES "ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penguji_ujian" ADD CONSTRAINT "penguji_ujian_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_ujian_id_fkey" FOREIGN KEY ("ujian_id") REFERENCES "ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_komponen_penilaian_id_fkey" FOREIGN KEY ("komponen_penilaian_id") REFERENCES "komponen_penilaian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
