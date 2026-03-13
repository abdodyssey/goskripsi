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
} from "@mantine/core";
import { IconPlus, IconTrash, IconFile } from "@tabler/icons-react";
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

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "gray",
      menunggu: "blue",
      revisi: "orange",
      diterima: "green",
      ditolak: "red",
    };
    return map[status] || "gray";
  };

  const pendaftaranArray: PendaftaranUjian[] = Array.isArray(pendaftaranList)
    ? pendaftaranList
    : pendaftaranList
      ? [pendaftaranList]
      : [];

  const columns: DataTableColumn<PendaftaranUjian>[] = [
    {
      header: "Jenis Ujian",
      render: (row) => row.jenisUjian?.namaJenis || "-",
    },
    {
      header: "Judul Ranpel",
      render: (row) => row.rancanganPenelitian?.judulPenelitian || "-",
    },
    {
      header: "Tanggal Pendaftaran",
      render: (row) =>
        row.tanggalPendaftaran
          ? new Date(row.tanggalPendaftaran).toLocaleDateString("id-ID")
          : "-",
    },
    {
      header: "Status",
      render: (row) => (
        <Stack gap={4}>
          <Badge color={getStatusBadge(row.status)} variant="light">
            {row.status.replace("_", " ").toUpperCase()}
          </Badge>
          {(row.status === "ditolak" || row.status === "revisi") &&
            row.keterangan && (
              <Tooltip label={row.keterangan} multiline maw={300}>
                <Text
                  size="xs"
                  c={row.status === "revisi" ? "orange.7" : "red.6"}
                  lineClamp={2}
                  style={{ cursor: "help" }}
                >
                  {row.keterangan}
                </Text>
              </Tooltip>
            )}
        </Stack>
      ),
    },
    {
      header: "Berkas Syarat",
      render: (row) =>
        row.pemenuhanSyarats && row.pemenuhanSyarats.length > 0 ? (
          <Group gap={4}>
            <IconFile size={14} />
            <Text size="xs">{row.pemenuhanSyarats.length} file</Text>
          </Group>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        ),
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Group gap="xs" justify="flex-end">
          {row.status === "draft" && (
            <Button
              size="compact-xs"
              variant="light"
              color="blue"
              onClick={() => handleSubmit(String(row.id))}
            >
              Submit
            </Button>
          )}
          {row.status === "revisi" && (
            <Button
              size="compact-xs"
              variant="light"
              color="orange"
              onClick={() => {
                setSelectedPendaftaran(row);
                openRevisi();
              }}
            >
              Revisi
            </Button>
          )}
          <Tooltip label="Hapus Pendaftaran">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleDelete(String(row.id))}
              size="sm"
              disabled={row.status === "diterima"}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
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
