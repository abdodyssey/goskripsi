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
  Box,
  ThemeIcon,
} from "@mantine/core";
import {
  IconPlus,
  IconFileText,
  IconCheck,
  IconX,
  IconClock,
  IconExternalLink,
  IconEdit,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { usePerbaikanJudul } from "../hooks/use-perbaikan-judul";
import { PerbaikanJudulFormModal } from "./perbaikan-judul-form-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PerbaikanJudul } from "../types/perbaikan-judul.type";

export function PerbaikanJudulList({ currentTitle }: { currentTitle: string }) {
  const { myRequests, isLoadingMy } = usePerbaikanJudul();
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
      header: "Surat",
      width: "10%",
      textAlign: "right",
      render: (row) => (
        <Tooltip label="Buka Surat Perbaikan" withArrow>
          <ActionIcon
            variant="subtle"
            color="indigo"
            onClick={() => window.open(row.fileSurat, "_blank")}
            radius="md"
            size="lg"
          >
            <IconExternalLink size={20} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
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

