"use client";

import { usePendaftaranUjianByMahasiswa } from "../hooks/use-pendaftaran-ujian";
import { useRanpelByMahasiswa } from "@/features/ranpel/hooks/use-ranpel";
import {
  Text,
  Badge,
  Button,
  Group,
  Center,
  Stack,
  ActionIcon,
  Tooltip,
  ThemeIcon,
  Menu,
  rem,
  Box,
} from "@mantine/core";
import { IconPlus, IconTrash, IconFile, IconClock, IconAlertCircle, IconCheck, IconX, IconDotsVertical } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { PendaftaranUjian } from "../types/pendaftaran-ujian.type";
import { PendaftaranUjianFormModal } from "./pendaftaran-ujian-form-modal";
import { PendaftaranUjianRevisiModal } from "./pendaftaran-ujian-revisi-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useState } from "react";

export function PendaftaranUjianList({ mahasiswaId }: { mahasiswaId: string }) {
  const {
    pendaftaranList,
    isLoading,
    isError,
    jenisUjianList,
    createPendaftaran,
    isCreating,
    deletePendaftaran,
    submitPendaftaran,
    uploadRevisi,
    isUploadingRevisi,
  } = usePendaftaranUjianByMahasiswa(mahasiswaId);

  const { pengajuanList } = useRanpelByMahasiswa(mahasiswaId);
  const [opened, { open, close }] = useDisclosure(false);
  const [revisiOpened, { open: openRevisi, close: closeRevisi }] =
    useDisclosure(false);
  const [selectedPendaftaran, setSelectedPendaftaran] =
    useState<PendaftaranUjian | null>(null);

  const handleSubmit = async (id: string) => {
    try {
      await submitPendaftaran(id);
      notifications.show({
        title: "Berhasil",
        message: "Pendaftaran berhasil di-submit untuk direview",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message: (error as Error).message || "Terjadi kesalahan saat submit",
        color: "red",
      });
    }
  };

  const ranpelOptions = (() => {
    if (!pengajuanList) return [];
    const list = Array.isArray(pengajuanList) ? pengajuanList : [pengajuanList];
    return list
      .filter((p) => p && p.statusKaprodi === "diterima")
      .map((p) => ({
        value: String(p.rancanganPenelitianId),
        label: p.rancanganPenelitian?.judulPenelitian || "Tanpa Judul",
      }));
  })();

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: "Hapus Pendaftaran Ujian",
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus pendaftaran ujian ini? Tindakan ini
          tidak bisa dibatalkan.
        </Text>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deletePendaftaran(id);
          notifications.show({
            title: "Berhasil",
            message: "Pendaftaran ujian berhasil dihapus",
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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string; icon: any }> = {
      menunggu: { color: "blue", label: "MENUNGGU", icon: IconClock },
      revisi: { color: "orange", label: "REVISI", icon: IconAlertCircle },
      diterima: { color: "teal", label: "DISETUJUI", icon: IconCheck },
      ditolak: { color: "red", label: "DITOLAK", icon: IconX },
    };
    return configs[status] || { color: "gray", label: status.toUpperCase(), icon: IconFile };
  };

  const pendaftaranArray: PendaftaranUjian[] = Array.isArray(pendaftaranList)
    ? pendaftaranList
    : pendaftaranList
      ? [pendaftaranList]
      : [];

  const columns: DataTableColumn<PendaftaranUjian>[] = [
    {
      header: "Jenis Ujian",
      width: "15%",
      render: (row) => (
        <Text size="sm" fw={700} c="indigo.8">
          {row.jenisUjian?.namaJenis || "-"}
        </Text>
      ),
    },
    {
      header: "Judul Rancangan Penelitian",
      width: "40%",
      render: (row) => (
        <Text size="xs" fw={500} lineClamp={2} style={{ lineHeight: 1.5 }}>
          {row.rancanganPenelitian?.judulPenelitian || "-"}
        </Text>
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
                Pendaftaran
              </Text>
            </Group>
            <Text size="xs" fw={700} pl={12}>
              {new Date(row.tanggalPendaftaran).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </Box>
          {row.status !== "menunggu" && (
            <Box>
              <Group gap={6} mb={2}>
                <Box
                  w={6}
                  h={6}
                  style={{
                    borderRadius: "50%",
                    backgroundColor:
                      row.status === "diterima"
                        ? "var(--mantine-color-teal-5)"
                        : row.status === "ditolak"
                          ? "var(--mantine-color-red-5)"
                          : row.status === "revisi"
                            ? "var(--mantine-color-orange-5)"
                            : "var(--mantine-color-blue-4)",
                  }}
                />
                <Text
                  size="10px"
                  fw={800}
                  tt="uppercase"
                  lts={0.5}
                  c={
                    row.status === "diterima"
                      ? "teal.6"
                      : row.status === "ditolak"
                        ? "red.6"
                        : row.status === "revisi"
                          ? "orange.6"
                          : "blue.6"
                  }
                >
                  {row.status === "diterima"
                    ? "Disetujui"
                    : row.status === "ditolak"
                      ? "Ditolak"
                      : row.status === "revisi"
                        ? "Revisi"
                        : "Status"}
                </Text>
              </Group>
              <Text
                size="xs"
                fw={600}
                pl={12}
                c={
                  row.status === "diterima"
                    ? "teal.8"
                    : row.status === "ditolak"
                      ? "red.8"
                      : row.status === "revisi"
                        ? "orange.8"
                        : "blue.8"
                }
              >
                {row.status === "diterima"
                  ? "Siap Ujian"
                  : row.status === "ditolak"
                    ? "Ditolak Kaprodi"
                    : row.status === "revisi"
                      ? "Perlu Revisi"
                      : ""}
              </Text>
            </Box>
          )}
        </Stack>
      ),
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Group gap={8} justify="flex-end">
          <Menu shadow="sm" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" radius="md" size="lg">
                <IconDotsVertical size={18} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Kelola Pendaftaran</Menu.Label>
              
          {(row.status === "menunggu" || row.status === "revisi") && (
            <Menu.Item
              leftSection={<IconFile size={14} />}
              onClick={() => {
                setSelectedPendaftaran(row);
                openRevisi();
              }}
            >
              {row.status === "revisi" ? "Revisi Berkas" : "Kelola Berkas"}
            </Menu.Item>
          )}

              <Menu.Divider />
              
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDelete(String(row.id))}
                disabled={row.status === "diterima"}
              >
                Hapus Pendaftaran
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Riwayat Pendaftaran Ujian"
        rightSection={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={open}
            color="indigo.8"
          >
            Daftar Ujian Baru
          </Button>
        }
        data={pendaftaranArray}
        columns={columns}
        loading={isLoading}
        error={isError ? "Gagal memuat data pendaftaran ujian." : undefined}
        emptyState={
          <Center
            py={50}
            style={{
              border: "2px dashed var(--mantine-color-default-border)",
              borderRadius: 12,
              backgroundColor: "var(--mantine-color-body)",
            }}
          >
            <Stack align="center" gap="sm">
              <Text c="dimmed" size="sm">
                Anda belum memiliki riwayat pendaftaran ujian.
              </Text>
              <Button
                variant="light"
                color="indigo"
                leftSection={<IconPlus size={16} />}
                onClick={open}
              >
                Daftar Ujian Sekarang
              </Button>
            </Stack>
          </Center>
        }
      />

      <PendaftaranUjianFormModal
        opened={opened}
        onClose={close}
        mahasiswaId={mahasiswaId}
        jenisUjianList={jenisUjianList}
        ranpelList={ranpelOptions}
        createPendaftaran={createPendaftaran}
        isCreating={isCreating}
      />
      <PendaftaranUjianRevisiModal
        key={selectedPendaftaran?.id || "revisi-modal"}
        opened={revisiOpened}
        onClose={closeRevisi}
        pendaftaran={selectedPendaftaran}
        uploadRevisi={uploadRevisi}
        isUploading={isUploadingRevisi}
      />
    </>
  );
}
