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
        color: "var(--gs-danger)",
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
      confirmProps: { color: "var(--gs-danger)" },
      onConfirm: async () => {
        try {
          await deletePengajuan(id);
          notifications.show({
            title: "Berhasil",
            message: "Pengajuan berhasil dihapus",
            color: "var(--gs-success)",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message: (error as Error).message || "Terjadi kesalahan",
            color: "var(--gs-danger)",
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
            <Text size="sm" fw={600} lineClamp={2} style={{ lineHeight: 1.4, cursor: "help" }}>
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
              <Text size="10px" fw={600} c="dimmed" tt="uppercase" lts={0.5}>Pengajuan</Text>
            </Group>
            <Text size="xs" fw={600} pl={12}>
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
                <Box w={6} h={6} style={{ borderRadius: "50%", backgroundColor: "var(--gs-success)" }} />
                <Text size="10px" fw={700} className="text-gs-success-text" tt="uppercase" lts={0.5}>Disetujui</Text>
              </Group>
              <Text size="xs" fw={700} className="text-gs-success-text" pl={12}>
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
          row.statusDosenPa === "diverifikasi" &&
          row.statusKaprodi === "menunggu"
        ) {
          status = "diverifikasi";
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
                      title: <Text fw={600}>Catatan & Tinjauan</Text>,
                      radius: "lg",
                      children: (
                        <Stack gap="md" py="md">
                          {row.catatanDosenPa && (
                            <Paper 
                              p="md" 
                              withBorder 
                              radius="md" 
                              bg="var(--gs-bg-overlay)"
                            >
                              <Group justify="space-between" mb={8}>
                                <Badge color="var(--gs-primary)" variant="outline" size="xs" radius="xs" fw={700}>PEMBIMBING</Badge>
                                <Text size="10px" fw={700} c="dimmed" tt="uppercase">DIREVIEW</Text>
                              </Group>
                              <Text size="sm" fw={600} className="italic text-gs-text-primary">"{row.catatanDosenPa}"</Text>
                            </Paper>
                          )}
                          {row.catatanKaprodi && (
                            <Paper 
                              p="md" 
                              withBorder 
                              radius="md" 
                              bg="var(--gs-bg-base)"
                            >
                              <Group justify="space-between" mb={8}>
                                <Badge color="var(--gs-success)" variant="outline" size="xs" radius="xs" fw={700}>KAPRODI</Badge>
                                <Text size="10px" fw={700} c="dimmed" tt="uppercase">DIREVIEW</Text>
                              </Group>
                              <Text size="sm" fw={600} className="italic text-gs-text-primary">"{row.catatanKaprodi}"</Text>
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
              color="var(--gs-danger)"
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
            <Button
              leftSection={<IconPlus size={18} stroke={2} />}
              onClick={handleCreateNew}
              variant="filled"
              className="bg-gs-primary hover:bg-gs-primary-hover active:scale-95 transition-all"
              radius="md"
              h={42}
              px="xl"
              fw={700}
            >
              BUAT PENGAJUAN BARU
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
                className="text-gs-primary bg-gs-bg-hover"
                leftSection={<IconPlus size={16} stroke={2} />}
                onClick={handleCreateNew}
                radius="md"
                fw={700}
              >
                MULAI AJUKAN SEKARANG
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
