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
  Box,
  Menu,
} from "@mantine/core";
import { IconEye, IconCheck, IconX, IconRotate2, IconDotsVertical } from "@tabler/icons-react";
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

  const handleComment = async (field: string, value: string) => {
    if (!selectedPengajuan) return;
    try {
      await updatePengajuan({
        id: selectedPengajuan.id.toString(),
        data: { [field]: value },
      });

      // Map snake_case to camelCase for local state update to trigger UI refresh
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      
      setSelectedPengajuan({ ...selectedPengajuan, [camelField]: value } as PengajuanRancanganPenelitian);
      
      notifications.show({
        title: "Tersimpan",
        message: "Komentar berhasil diperbarui",
        color: "teal",
        autoClose: 2000,
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message: (error as Error).message || "Gagal menyimpan komentar",
        color: "red",
      });
    }
  };

  const handleVerify = (item: PengajuanRancanganPenelitian) => {
    const id = item.id.toString();
    
    const comments = {
      note: "",
      masalah: "",
      solusi: "",
      hasil: "",
      data: "",
      metode: ""
    };

    modals.openConfirmModal({
      title: "Review & Verifikasi Pengajuan",
      size: "md",
      children: (
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menyetujui dan memverifikasi rancangan penelitian ini?
          </Text>

          <Textarea
            label="Catatan (Opsional)"
            placeholder="Tambahkan pesan"
            onChange={(e) => (comments.note = e.target.value)}
            minRows={4}
          />
        </Stack>
      ),
      labels: { confirm: "Verifikasi & Kirim", cancel: "Batal" },
      confirmProps: { color: "indigo" },
      onConfirm: async () => {
        try {
          await updatePengajuan({
            id,
            data: {
              status_dosen_pa: "diterima",
              catatan_dosen_pa: comments.note,
            },
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
            Apakah Anda yakin ingin menolak pengajuan ini? 
          </Text>
          <Textarea
            label="Alasan Penolakan (Dosen PA)"
            placeholder="Berikan alasan"
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
      header: "MAHASISWA",
      width: "220px",
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
      header: "TIMELINE",
      width: "180px",
      render: (row) => (
        <Stack gap={8}>
          <Box>
            <Group gap={6} mb={2}>
              <Box
                w={6}
                h={6}
                style={{
                  borderRadius: "50%",
                  backgroundColor: "var(--mantine-color-gray-4)",
                }}
              />
              <Text size="10px" fw={800} c="dimmed" tt="uppercase" lts={0.5}>
                Pengajuan
              </Text>
            </Group>
            <Text size="xs" fw={700} pl={12}>
              {row.tanggalPengajuan
                ? new Date(row.tanggalPengajuan).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </Text>
          </Box>
          {row.tanggalReviewPa && (
            <Box>
              <Group gap={6} mb={2}>
                <Box
                  w={6}
                  h={6}
                  style={{
                    borderRadius: "50%",
                    backgroundColor: "var(--mantine-color-teal-5)",
                  }}
                />
                <Text size="10px" fw={800} c="teal.7" tt="uppercase" lts={0.5}>
                  Disetujui
                </Text>
              </Group>
              <Text size="xs" fw={800} c="teal.9" pl={12}>
                {new Date(row.tanggalReviewPa).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </Box>
          )}
        </Stack>
      ),
    },
    {
      header: "STATUS",
      width: "150px",
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
            size="md"
            radius="sm"
            fw={700}
            style={{ minWidth: "110px" }}
          >
            {row.statusDosenPa.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Menu shadow="sm" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="md" size="lg">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Tindakan</Menu.Label>
            <Menu.Item 
              leftSection={<IconEye size={16} stroke={1.5} />} 
              onClick={() => handlePreview(row)}
            >
              Lihat Detail
            </Menu.Item>

            {row.statusDosenPa === "menunggu" && (
              <>
                <Menu.Divider />
                <Menu.Item 
                  color="teal"
                  leftSection={<IconCheck size={16} stroke={1.5} />} 
                  onClick={() => handleVerify(row)}
                >
                  Setujui Verifikasi
                </Menu.Item>
                <Menu.Item 
                  color="red"
                  leftSection={<IconX size={16} stroke={1.5} />} 
                  onClick={() => handleReject(row.id.toString())}
                >
                  Tolak / Revisi
                </Menu.Item>
              </>
            )}

            {(row.statusDosenPa === "diterima" || row.statusDosenPa === "ditolak") && row.statusKaprodi === "menunggu" && (
              <>
                <Menu.Divider />
                <Menu.Item 
                  color="orange"
                  leftSection={<IconRotate2 size={16} stroke={1.5} />} 
                  onClick={() => handleUndo(row.id.toString())}
                >
                  Undo Verifikasi
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
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
        isDosenPa={true}
        onComment={handleComment}
      />

      <StudentProfileModal
        opened={profileOpened}
        onClose={closeProfile}
        student={selectedStudent}
      />
    </Stack>
  );
}
