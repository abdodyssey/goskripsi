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
} from "@mantine/core";
import {
  IconPlus,
  IconEye,
  IconTrash,
  IconBooks,
  IconDotsVertical,
  IconEdit,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { RanpelFormModal } from "./ranpel-form-modal";
import { RanpelPreviewModal } from "./ranpel-preview-modal";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";
import { useState } from "react";

import { DataTable, DataTableColumn } from "@/components/ui/data-table";

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
      width: "300px",
      render: (row) => (
        <Tooltip
          label={row.rancanganPenelitian?.judulPenelitian}
          multiline
          w={300}
          withArrow
          position="top-start"
        >
          <Text size="sm" fw={600} lineClamp={2}>
            {row.rancanganPenelitian?.judulPenelitian || "Tidak Ada Judul"}
          </Text>
        </Tooltip>
      ),
    },
    {
      header: "Tanggal Diajukan",
      render: (row) => (
        <Text size="sm" c="dimmed" fw={500}>
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
      header: "Tanggal Diterima",
      render: (row) => (
        <Text
          size="sm"
          c={row.tanggalReviewKaprodi ? "indigo.7" : "dimmed"}
          fw={700}
        >
          {row.statusKaprodi === "diterima" && row.tanggalReviewKaprodi
            ? new Date(row.tanggalReviewKaprodi).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </Text>
      ),
    },
    {
      header: "Catatan / Alasan",
      render: (row) => {
        return (
          <Stack gap={4}>
            {row.catatanDosenPa && (
              <Group gap={6} align="flex-start" wrap="nowrap">
                <Text
                  fz={9}
                  fw={800}
                  c={row.statusDosenPa === "ditolak" ? "red.7" : "indigo"}
                  tt="uppercase"
                  mt={2}
                >
                  {row.statusDosenPa === "ditolak" ? "Ditolak PA" : "PA"}
                </Text>
                <Text
                  size="xs"
                  c={row.statusDosenPa === "ditolak" ? "red" : "dimmed"}
                  fw={row.statusDosenPa === "ditolak" ? 600 : 400}
                  lineClamp={2}
                >
                  {row.catatanDosenPa}
                </Text>
              </Group>
            )}
            {row.catatanKaprodi && (
              <Group gap={6} align="flex-start" wrap="nowrap">
                <Text
                  fz={9}
                  fw={800}
                  c={row.statusKaprodi === "ditolak" ? "red.7" : "teal.7"}
                  tt="uppercase"
                  mt={2}
                >
                  {row.statusKaprodi === "ditolak" ? "Ditolak KPR" : "KPR"}
                </Text>
                <Text
                  size="xs"
                  c={row.statusKaprodi === "ditolak" ? "red" : "dimmed"}
                  fw={row.statusKaprodi === "ditolak" ? 600 : 400}
                  lineClamp={2}
                >
                  {row.catatanKaprodi}
                </Text>
              </Group>
            )}
            {!row.catatanDosenPa && !row.catatanKaprodi && (
              <Text c="dimmed" size="xs" fs="italic">
                Belum ada catatan.
              </Text>
            )}
          </Stack>
        );
      },
    },
    {
      header: "Status",
      render: (row) => {
        let badgeColor = "gray";
        let statusLabel = row.statusKaprodi;

        if (row.statusKaprodi === "diterima") badgeColor = "teal";
        else if (
          row.statusKaprodi === "ditolak" ||
          row.statusDosenPa === "ditolak"
        ) {
          badgeColor = "red";
          statusLabel = "ditolak";
        } else if (
          row.statusDosenPa === "diterima" &&
          row.statusKaprodi === "menunggu"
        ) {
          badgeColor = "indigo";
          statusLabel = "menunggu"; // Use "menunggu" to match StatusPengajuan or handle specifically
        } else if (row.statusDosenPa === "menunggu") badgeColor = "blue";

        return (
          <Badge
            color={badgeColor}
            variant="filled"
            radius="md"
            tt="uppercase"
            fz={10}
            fw={800}
            px={10}
            h={22}
          >
            {statusLabel}
          </Badge>
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
              disabled={
                row.statusKaprodi === "diterima" ||
                (row.statusDosenPa === "diterima" &&
                  row.statusKaprodi === "menunggu")
              }
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
              disabled={row.statusKaprodi === "diterima"}
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
