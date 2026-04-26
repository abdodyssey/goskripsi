"use client";

import { useRanpelByMahasiswa } from "../hooks/use-ranpel";
import {
  Text,
  Badge,
  Button,
  Group,
  Center,
  Stack,
  ActionIcon,
  Tooltip,
  Box,
  Menu,
  rem,
  Paper,
} from "@mantine/core";
import {
  IconPlus,
  IconEye,
  IconTrash,
  IconBooks,
  IconDotsVertical,
  IconEdit,
  IconMessage2,
  IconDownload,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { RanpelFormModal } from "./ranpel-form-modal";
import { RanpelPreviewModal } from "./ranpel-preview-modal";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";

import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export function PengajuanRanpelList({
  mahasiswaId,
  studentName,
  studentNim,
}: {
  mahasiswaId: string;
  studentName?: string;
  studentNim?: string;
}) {
  const { pengajuanList, isLoading, isError, deletePengajuan } =
    useRanpelByMahasiswa(mahasiswaId);
  const [opened, { open, close }] = useDisclosure(false);
  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);
  const [selectedPengajuan, setSelectedPengajuan] =
    useState<PengajuanRancanganPenelitian | null>(null);

  const handlePreview = (item: PengajuanRancanganPenelitian) => {
    setSelectedPengajuan(item);
    openPreview();
  };

  const handleDownloadSuratJudul = async (item: PengajuanRancanganPenelitian) => {
    try {
      const response = await apiClient.get(
        `/ranpel/export-surat-judul/${item.id}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `SURAT_PENGAJUAN_JUDUL_${studentNim || "DOCUMENT"}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Export Error:", error);
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat mengunduh file",
        color: "red",
      });
    }
  };

  const [editData, setEditData] = useState<PengajuanRancanganPenelitian | null>(
    null,
  );
  const handleEdit = (item: PengajuanRancanganPenelitian) => {
    setEditData(item);
    open();
  };

  const handleCreateNew = () => {
    setEditData(null);
    open();
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: "Hapus Pengajuan",
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak
          bisa dibatalkan.
        </Text>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deletePengajuan(id);
          notifications.show({
            title: "Berhasil",
            message: "Pengajuan berhasil dihapus",
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

  const pengajuanArray: PengajuanRancanganPenelitian[] = Array.isArray(
    pengajuanList,
  )
    ? (pengajuanList as PengajuanRancanganPenelitian[])
    : pengajuanList
      ? [pengajuanList as PengajuanRancanganPenelitian]
      : [];

  const columns: DataTableColumn<PengajuanRancanganPenelitian>[] = [
    {
      header: "Judul Penelitian",
      render: (row) => (
        <Stack gap={4} py={4}>
          <Tooltip 
            label={row.rancanganPenelitian?.judulPenelitian || "Tidak Ada Judul"} 
            multiline 
            w={300} 
            withArrow 
            radius="md"
          >
            <Text size="sm" fw={700} lineClamp={2} style={{ lineHeight: 1.4, cursor: "help" }}>
              {row.rancanganPenelitian?.judulPenelitian || "Tidak Ada Judul"}
            </Text>
          </Tooltip>
        </Stack>
      ),
    },
    {
      header: "Timeline",
      width: "180px",
      render: (row) => (
        <Stack gap={8}>
          <Box>
            <Group gap={6} mb={2}>
              <Box w={6} h={6} style={{ borderRadius: "50%", backgroundColor: "var(--mantine-color-gray-4)" }} />
              <Text size="10px" fw={800} c="dimmed" tt="uppercase" lts={0.5}>Pengajuan</Text>
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
          {row.statusKaprodi === "diterima" && row.tanggalReviewKaprodi && (
            <Box>
              <Group gap={6} mb={2}>
                <Box w={6} h={6} style={{ borderRadius: "50%", backgroundColor: "var(--mantine-color-teal-5)" }} />
                <Text size="10px" fw={800} c="teal.7" tt="uppercase" lts={0.5}>Disetujui</Text>
              </Group>
              <Text size="xs" fw={800} c="teal.9" pl={12}>
                {new Date(row.tanggalReviewKaprodi).toLocaleDateString("id-ID", {
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
      header: "Status",
      width: "150px",
      render: (row) => {
        let status = row.statusKaprodi;
        if (row.statusKaprodi === "ditolak" || row.statusDosenPa === "ditolak") {
          status = "ditolak";
        } else if (
          row.statusDosenPa === "diterima" &&
          row.statusKaprodi === "menunggu"
        ) {
          status = "proses";
        } else if (row.statusDosenPa === "menunggu") {
          status = "menunggu";
        }

        return (
          <Group gap={8} wrap="nowrap" style={{ width: "max-content" }}>
            <StatusBadge status={status} size="md" style={{ flexShrink: 0 }} />
            {(row.catatanDosenPa || row.catatanKaprodi) && (
              <Tooltip label="Lihat Catatan/Revisi">
                <ActionIcon 
                  variant="light" 
                  color="orange" 
                  radius="xl" 
                  size="sm"
                  onClick={() => {
                    modals.open({
                      title: <Text fw={800}>Catatan & Tinjauan</Text>,
                      radius: "lg",
                      children: (
                        <Stack gap="md" py="md">
                          {row.catatanDosenPa && (
                            <Paper 
                              p="md" 
                              withBorder 
                              radius="md" 
                              bg="light-dark(indigo.0, dark.8)"
                            >
                              <Group justify="space-between" mb={8}>
                                <Badge color="indigo" size="xs">PEMBIMBING</Badge>
                                <Text size="10px" fw={800} c="dimmed">DIREVIEW</Text>
                              </Group>
                              <Text size="sm" fw={500} className="italic text-gray-700">"{row.catatanDosenPa}"</Text>
                            </Paper>
                          )}
                          {row.catatanKaprodi && (
                            <Paper 
                              p="md" 
                              withBorder 
                              radius="md" 
                              bg="light-dark(teal.0, dark.8)"
                            >
                              <Group justify="space-between" mb={8}>
                                <Badge color="teal" size="xs">KAPRODI</Badge>
                                <Text size="10px" fw={800} c="dimmed">DIREVIEW</Text>
                              </Group>
                              <Text size="sm" fw={500} className="italic text-gray-700">"{row.catatanKaprodi}"</Text>
                            </Paper>
                          )}
                        </Stack>
                      )
                    });
                  }}
                >
                  <IconMessage2 size={14} stroke={2} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        );
      },
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Menu
          shadow="sm"
          width={160}
          position="bottom-end"
          transitionProps={{ transition: "pop-top-right" }}
          withinPortal
        >
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="md">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Opsi Pengajuan</Menu.Label>
            <Menu.Item
              onClick={() => handlePreview(row)}
              leftSection={
                <IconEye
                  style={{ width: rem(14), height: rem(14) }}
                  stroke={1.5}
                />
              }
            >
              Lihat Detail
            </Menu.Item>
            <Menu.Item
              onClick={() => handleEdit(row)}
              leftSection={
                <IconEdit
                  style={{ width: rem(14), height: rem(14) }}
                  stroke={1.5}
                />
              }
            >
              Edit Ranpel
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              onClick={() => handleDelete(row.id.toString())}
              leftSection={
                <IconTrash
                  style={{ width: rem(14), height: rem(14) }}
                  stroke={1.5}
                />
              }
            >
              Hapus
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  const acceptedPengajuan = pengajuanArray.find(
    (p) => p.statusKaprodi === "diterima",
  );

  return (
    <>
      <DataTable
        data={pengajuanArray}
        columns={columns}
        loading={isLoading}
        error={
          isError ? "Gagal memuat data pengajuan rancanganPenelitian." : null
        }
        title="Riwayat Pengajuan"
        description="Daftar pengajuan rancangan penelitian Mahasiswa"
        rightSection={
          <Group gap="sm">
            {acceptedPengajuan && (
              <Button
                variant="outline"
                color="teal"
                leftSection={<IconDownload size={18} />}
                onClick={() => handleDownloadSuratJudul(acceptedPengajuan)}
                radius="md"
                h={42}
                px="lg"
                className="active:scale-95 transition-all"
              >
                Download Surat Pengajuan Judul
              </Button>
            )}
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleCreateNew}
              variant="filled"
              color="indigo"
              radius="md"
              h={42}
              px="lg"
              className="active:scale-95 transition-all"
            >
              Buat Pengajuan Baru
            </Button>
          </Group>
        }
        emptyState={
          <Center
            py={60}
            style={{
              border: "2px dashed var(--color-border)",
              borderRadius: 16,
              width: "100%",
            }}
          >
            <Stack align="center" gap="md">
              <Box c="var(--mantine-primary-color-light-color)">
                <IconBooks size={48} stroke={1.5} />
              </Box>
              <Text c="dimmed" size="sm" fw={500}>
                Anda belum memiliki riwayat pengajuan rancangan penelitian.
              </Text>
              <Button
                variant="light"
                color="indigo"
                leftSection={<IconPlus size={16} />}
                onClick={handleCreateNew}
                radius="md"
              >
                Mulai Ajukan Sekarang
              </Button>
            </Stack>
          </Center>
        }
      />

      <RanpelFormModal
        opened={opened}
        onClose={close}
        mahasiswaId={mahasiswaId}
        editData={editData}
      />

      <RanpelPreviewModal
        opened={previewOpened}
        onClose={closePreview}
        pengajuan={selectedPengajuan}
        studentName={studentName}
        studentNim={studentNim}
      />
    </>
  );
}
