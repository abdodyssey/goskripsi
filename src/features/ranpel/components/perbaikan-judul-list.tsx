"use client";

import {
  Text,
  Badge,
  Button,
  Group,
  Center,
  Stack,
  ActionIcon,
  Tooltip,
  Paper,
  ThemeIcon,
  Menu,
  rem,
} from "@mantine/core";
import {
  IconPlus,
  IconFileText,
  IconCheck,
  IconX,
  IconClock,
  IconExternalLink,
  IconEdit,
  IconDotsVertical,
  IconTrash,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { usePerbaikanJudul } from "../hooks/use-perbaikan-judul";
import { PerbaikanJudulFormModal } from "./perbaikan-judul-form-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PerbaikanJudul } from "../types/perbaikan-judul.type";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

export function PerbaikanJudulList({ currentTitle }: { currentTitle: string }) {
  const { myRequests, isLoadingMy, cancelRequest } = usePerbaikanJudul();
  const [opened, { open, close }] = useDisclosure(false);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> = {
      menunggu: { color: "blue", icon: IconClock, label: "MENUNGGU" },
      diterima: { color: "teal", icon: IconCheck, label: "DISETUJUI" },
      ditolak: { color: "red", icon: IconX, label: "DITOLAK" },
    };
    const config = configs[status] || { color: "gray", icon: IconFileText, label: status.toUpperCase() };

    return (
      <Badge 
        color={config.color} 
        variant="light" 
        leftSection={<config.icon size={12} />}
        radius="sm"
        px="xs"
      >
        {config.label}
      </Badge>
    );
  };

  const handleCancel = (id: number) => {
    modals.openConfirmModal({
      title: "Batalkan Pengajuan",
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin membatalkan pengajuan perbaikan judul ini? Tindakan ini tidak dapat dibatalkan.
        </Text>
      ),
      labels: { confirm: "Ya, Batalkan", cancel: "Tutup" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await cancelRequest(id);
          notifications.show({
            title: "Berhasil",
            message: "Pengajuan berhasil dibatalkan",
            color: "teal",
          });
        } catch (error: any) {
          notifications.show({
            title: "Gagal",
            message: error.response?.data?.message || "Terjadi kesalahan saat membatalkan pengajuan",
            color: "red",
          });
        }
      },
    });
  };

  const columns: DataTableColumn<PerbaikanJudul>[] = [
    {
      header: "Usulan Judul Baru",
      width: "55%",
      render: (row) => (
        <Stack gap={6}>
          <Paper 
            p="xs" 
            radius="md" 
            bg="indigo.0" 
            className="dark:bg-indigo-9/20"
            withBorder
            style={{ borderColor: "var(--mantine-color-indigo-2)" }}
          >
            <Text size="sm" fw={700} className="text-indigo-9 dark:text-indigo-2" lineClamp={2}>
              {row.judulBaru}
            </Text>
          </Paper>
          <Group gap={4} wrap="nowrap">
            <Text size="10px" fw={800} c="dimmed" tt="uppercase">Judul Lama:</Text>
            <Text size="10px" c="dimmed" lineClamp={1}>{row.judulLama}</Text>
          </Group>
        </Stack>
      ),
    },
    {
      header: "Waktu Pengajuan",
      width: "20%",
      render: (row) => (
        <Text size="sm" fw={500}>
          {new Date(row.tanggalPengajuan).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      ),
    },
    {
      header: "Status",
      width: "160px",
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: "Aksi",
      width: "80px",
      textAlign: "right",
      render: (row) => (
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDotsVertical size={20} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Dokumen</Menu.Label>
            <Menu.Item
              leftSection={<IconExternalLink style={{ width: rem(14), height: rem(14) }} />}
              onClick={() => window.open(row.fileSurat, "_blank")}
            >
              Lihat Surat
            </Menu.Item>
            
            {row.status === "menunggu" && (
              <>
                <Menu.Divider />
                <Menu.Label color="red">Bahaya</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => handleCancel(row.id)}
                >
                  Batalkan Pengajuan
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Riwayat Perbaikan Judul"
        description="Pantau status pengajuan perubahan judul penelitian Anda secara real-time"
        data={Array.isArray(myRequests) ? myRequests : []}
        columns={columns}
        loading={isLoadingMy}
        rightSection={
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={open}
            color="indigo.9"
            radius="md"
            px="xl"
          >
            Ajukan Perbaikan
          </Button>
        }
        emptyState={
          <Center py={60}>
            <Stack align="center" gap="md">
              <ThemeIcon size={64} radius="xl" variant="light" color="slate">
                <IconEdit size={32} stroke={1.5} />
              </ThemeIcon>
              <Stack gap={4} align="center">
                <Text fw={700} size="lg">Belum ada riwayat</Text>
                <Text c="dimmed" size="sm" ta="center" maw={300}>
                  Anda belum pernah mengajukan perbaikan judul penelitian.
                </Text>
              </Stack>
              <Button variant="light" color="indigo" onClick={open} radius="md" mt="sm">
                Mulai Pengajuan Sekarang
              </Button>
            </Stack>
          </Center>
        }
      />

      <PerbaikanJudulFormModal
        opened={opened}
        onClose={close}
        currentTitle={currentTitle}
      />
    </>
  );
}
