"use client";

import { useAllPengajuan } from "../hooks/use-ranpel";
import {
  Text,
  Badge,
  Group,
  Center,
  Stack,
  ActionIcon,
  Tooltip,
  Textarea,
} from "@mantine/core";
import { IconEye, IconCheck, IconX, IconRotate2 } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { RanpelPreviewModal } from "./ranpel-preview-modal";
import { StudentProfileModal } from "@/features/mahasiswa/components/student-profile-modal";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";
import { Mahasiswa } from "@/types/user.type";
import { useState, useMemo } from "react";

import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function VerifikasiRanpelList() {
  const { pengajuanList, isLoading, isError, updatePengajuan } =
    useAllPengajuan();
  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);
  const [selectedPengajuan, setSelectedPengajuan] =
    useState<PengajuanRancanganPenelitian | null>(null);
  const [profileOpened, { open: openProfile, close: closeProfile }] =
    useDisclosure(false);
  const [selectedStudent, setSelectedStudent] = useState<Mahasiswa | null>(
    null,
  );

  const handlePreview = (item: PengajuanRancanganPenelitian) => {
    setSelectedPengajuan(item);
    openPreview();
  };

  const handleShowStudentProfile = (student: Mahasiswa) => {
    setSelectedStudent(student);
    openProfile();
  };

  const handleVerify = (id: string) => {
    let note = "";
    modals.openConfirmModal({
      title: "Verifikasi Pengajuan",
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Apakah Anda yakin ingin memverifikasi pengajuan ini? Status akan
            berubah menjadi TERVERIFIKASI dan diteruskan ke Kaprodi.
          </Text>
          <Textarea
            label="Catatan Dosen PA"
            placeholder="Tambahkan catatan verifikasi..."
            onChange={(e) => (note = e.target.value)}
          />
        </Stack>
      ),
      labels: { confirm: "Verifikasi", cancel: "Batal" },
      confirmProps: { color: "indigo" },
      onConfirm: async () => {
        try {
          await updatePengajuan({
            id,
            data: { status_dosen_pa: "diterima", catatan_dosen_pa: note },
          });
          notifications.show({
            title: "Berhasil",
            message: "Pengajuan berhasil diverifikasi",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message: (error as Error).message || "Terjadi kesalahan",
            color: "red",
          });
        }
      },
    });
  };

  const handleReject = (id: string) => {
    let reason = "";
    modals.openConfirmModal({
      title: "Tolak Pengajuan",
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Apakah Anda yakin ingin menolak pengajuan ini? Mahasiswa akan
            melihat alasan penolakan ini untuk melakukan perbaikan.
          </Text>
          <Textarea
            label="Alasan Penolakan (Dosen PA)"
            placeholder="Berikan alasan mengapa pengajuan ini ditolak/perlu diperbaiki..."
            onChange={(e) => (reason = e.target.value)}
            required
            minRows={3}
          />
        </Stack>
      ),
      labels: { confirm: "Tolak Pengajuan", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        if (!reason.trim()) {
          notifications.show({
            title: "Peringatan",
            message: "Harap berikan alasan penolakan.",
            color: "orange",
          });
          return;
        }

        try {
          await updatePengajuan({
            id,
            data: { status_dosen_pa: "ditolak", catatan_dosen_pa: reason },
          });
          notifications.show({
            title: "Berhasil",
            message: "Pengajuan telah ditolak",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message: (error as Error).message || "Terjadi kesalahan",
            color: "red",
          });
        }
      },
    });
  };

  const handleUndo = (id: string) => {
    modals.openConfirmModal({
      title: "Undo Verifikasi",
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin membatalkan verifikasi ini? Status akan
          kembali menjadi MENUNGGU.
        </Text>
      ),
      labels: { confirm: "Undo Verifikasi", cancel: "Batal" },
      confirmProps: { color: "orange" },
      onConfirm: async () => {
        try {
          await updatePengajuan({ id, data: { status_dosen_pa: "menunggu" } });
          notifications.show({
            title: "Berhasil",
            message: "Verifikasi berhasil dibatalkan",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message: (error as Error).message || "Terjadi kesalahan",
            color: "red",
          });
        }
      },
    });
  };

  const pengajuanArray: PengajuanRancanganPenelitian[] = useMemo(() => {
    return Array.isArray(pengajuanList)
      ? (pengajuanList as PengajuanRancanganPenelitian[])
      : [];
  }, [pengajuanList]);

  const columns: DataTableColumn<PengajuanRancanganPenelitian>[] = [
    {
      header: "Mahasiswa",
      render: (row) => (
        <Stack
          gap={0}
          style={{ cursor: "pointer" }}
          onClick={() =>
            row.mahasiswa && handleShowStudentProfile(row.mahasiswa)
          }
        >
          <Tooltip label="Klik untuk lihat profil">
            <Text size="sm" fw={700} c="indigo.7">
              {row.mahasiswa?.user?.nama}
            </Text>
          </Tooltip>
          <Text size="xs" c="dimmed">
            {row.mahasiswa?.nim}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Judul Penelitian",
      width: "250px",
      render: (row) => (
        <Tooltip
          label={row.rancanganPenelitian?.judulPenelitian}
          multiline
          w={300}
          withArrow
          position="top-start"
        >
          <Text size="sm" fw={500} lineClamp={2}>
            {row.rancanganPenelitian?.judulPenelitian || "Tidak Ada Judul"}
          </Text>
        </Tooltip>
      ),
    },
    {
      header: "Tgl Pengajuan",
      render: (row) => (
        <Text size="xs" fw={500} c="dimmed">
          {row.tanggalPengajuan
            ? new Date(row.tanggalPengajuan).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </Text>
      ),
    },
    {
      header: "Tgl Diterima",
      render: (row) => (
        <Text size="xs" fw={500} c={row.tanggalReviewPa ? "teal.6" : "slate.3"}>
          {row.tanggalReviewPa
            ? new Date(row.tanggalReviewPa).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </Text>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        let badgeColor = "gray";
        if (row.statusDosenPa === "diterima") badgeColor = "teal";
        if (row.statusDosenPa === "ditolak") badgeColor = "red";
        if (row.statusDosenPa === "diverifikasi") badgeColor = "indigo";
        if (row.statusDosenPa === "menunggu") badgeColor = "blue";
        return (
          <Badge
            color={badgeColor}
            variant="light"
            radius="xl"
            tt="uppercase"
            fz={10}
            fw={800}
            px={10}
            h={22}
          >
            {row.statusDosenPa}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Tooltip label="Lihat Detail">
            <ActionIcon
              variant="subtle"
              color="indigo"
              onClick={() => handlePreview(row)}
              size="lg"
              radius="md"
            >
              <IconEye size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Setujui (Verifikasi)">
            <ActionIcon
              variant="subtle"
              color="teal"
              size="lg"
              radius="md"
              onClick={() => handleVerify(row.id.toString())}
              disabled={row.statusDosenPa !== "menunggu"}
            >
              <IconCheck size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Tolak Pengajuan">
            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              radius="md"
              onClick={() => handleReject(row.id.toString())}
              disabled={row.statusDosenPa !== "menunggu"}
            >
              <IconX size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>

          {(row.statusDosenPa === "diterima" ||
            row.statusDosenPa === "ditolak") &&
            row.statusKaprodi === "menunggu" && (
              <Tooltip label="Undo Keputusan">
                <ActionIcon
                  variant="subtle"
                  color="orange"
                  size="lg"
                  radius="md"
                  onClick={() => handleUndo(row.id.toString())}
                >
                  <IconRotate2 size={18} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            )}
        </Group>
      ),
    },
  ];

  return (
    <Stack gap="md">
      <DataTable
        data={pengajuanArray}
        columns={columns}
        loading={isLoading}
        error={
          isError ? "Gagal memuat data pengajuan rancanganPenelitian." : null
        }
        title="Daftar Pengajuan Ranpel"
        description="Verifikasi rancangan penelitian Mahasiswa Bimbingan Anda"
        emptyState={
          <Center py={60}>
            <Text c="dimmed" size="sm" fw={500}>
              Tidak ada pengajuan rancanganPenelitian yang perlu diverifikasi.
            </Text>
          </Center>
        }
      />

      <RanpelPreviewModal
        opened={previewOpened}
        onClose={closePreview}
        pengajuan={selectedPengajuan}
        studentName={selectedPengajuan?.mahasiswa?.user?.nama as string}
        studentNim={selectedPengajuan?.mahasiswa?.nim as string}
      />

      <StudentProfileModal
        opened={profileOpened}
        onClose={closeProfile}
        student={selectedStudent}
      />
    </Stack>
  );
}
