"use client";

import {
  Text,
  Badge,
  Button,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
  Paper,
  Box,
  Textarea,
  Modal,
  ThemeIcon,
  Divider,
  Menu,
  rem,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconClock,
  IconExternalLink,
  IconUser,
  IconFileText,
  IconArrowRight,
  IconMessageDots,
  IconDotsVertical,
  IconGavel,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { usePerbaikanJudul } from "../hooks/use-perbaikan-judul";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PerbaikanJudul } from "../types/perbaikan-judul.type";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export function ManajemenPerbaikanJudulList() {
  const { allRequests, isLoadingAll, reviewRequest, isReviewing } = usePerbaikanJudul();
  const [reviewOpened, { open: openReview, close: closeReview }] = useDisclosure(false);
  const [selectedRequest, setSelectedRequest] = useState<PerbaikanJudul | null>(null);
  const [catatan, setCatatan] = useState("");

  const handleReview = async (status: "diterima" | "ditolak") => {
    if (!selectedRequest) return;

    try {
      await reviewRequest({
        id: selectedRequest.id,
        data: {
          status,
          catatanSekprodi: catatan,
        },
      });

      notifications.show({
        title: "Berhasil",
        message: `Pengajuan perbaikan judul telah ${status === "diterima" ? "disetujui" : "ditolak"}`,
        color: status === "diterima" ? "teal" : "red",
      });

      closeReview();
      setCatatan("");
      setSelectedRequest(null);
    } catch (error: any) {
      notifications.show({
        title: "Gagal",
        message: error.response?.data?.message || "Terjadi kesalahan",
        color: "red",
      });
    }
  };

  const columns: DataTableColumn<PerbaikanJudul>[] = [
    {
      header: "Mahasiswa",
      width: "25%",
      render: (row) => (
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="light" color="indigo" radius="md" size="lg">
            <IconUser size={18} stroke={1.5} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" fw={700} className="dark:text-white">
              {row.mahasiswa?.user?.nama || "Unknown"}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              NIM: {row.mahasiswa?.nim}
            </Text>
          </Stack>
        </Group>
      ),
    },
    {
      header: "Judul Baru",
      width: "45%",
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
            <Text size="sm" fw={600} className="text-indigo-9 dark:text-indigo-2" lineClamp={2}>
              {row.judulBaru}
            </Text>
          </Paper>
          <Group gap={4} wrap="nowrap">
            <Text size="10px" fw={700} c="dimmed" tt="uppercase">Asal:</Text>
            <Text size="10px" c="dimmed" lineClamp={1}>{row.judulLama}</Text>
          </Group>
        </Stack>
      ),
    },
    {
      header: "Status",
      width: "160px",
      render: (row) => {
        const configs: Record<string, { color: string; icon: any; label: string }> = {
          menunggu: { color: "blue", icon: IconClock, label: "MENUNGGU" },
          diterima: { color: "teal", icon: IconCheck, label: "DISETUJUI" },
          ditolak: { color: "red", icon: IconX, label: "DITOLAK" },
        };
        const config = configs[row.status] || { color: "gray", icon: IconFileText, label: row.status.toUpperCase() };
        
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
      },
    },
    {
      header: "Aksi",
      width: "80px",
      textAlign: "right",
      render: (row) => (
        <Group gap={8} justify="flex-end">
          <Menu shadow="md" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" radius="md" size="lg">
                <IconDotsVertical size={20} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Kelola Pengajuan</Menu.Label>
              <Menu.Item 
                leftSection={<IconExternalLink style={{ width: rem(14), height: rem(14) }} />}
                onClick={() => window.open(row.fileSurat, "_blank")}
              >
                Lihat Surat Perbaikan
              </Menu.Item>
              
              {row.status === "menunggu" && (
                <Menu.Item 
                  color="indigo"
                  leftSection={<IconGavel style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => {
                    setSelectedRequest(row);
                    openReview();
                  }}
                >
                  Review Pengajuan
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Manajemen Perbaikan Judul"
        description="Kelola usulan perubahan judul penelitian yang diajukan oleh Mahasiswa"
        data={Array.isArray(allRequests) ? allRequests : []}
        columns={columns}
        loading={isLoadingAll}
      />

      <Modal
        opened={reviewOpened}
        onClose={closeReview}
        title={
          <Stack gap={0}>
            <Text fw={800} fz="lg" className="dark:text-white">Review Perbaikan Judul</Text>
            <Text size="xs" c="dimmed">Berikan keputusan untuk usulan judul baru mahasiswa</Text>
          </Stack>
        }
        radius="lg"
        size="lg"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        {selectedRequest && (
          <Stack gap="xl" pt="md">
            <Paper withBorder p="md" radius="md" bg="slate.0" className="dark:bg-dark-6">
              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon variant="light" color="indigo" radius="md">
                    <IconUser size={18} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="sm" fw={700}>{selectedRequest.mahasiswa?.user?.nama}</Text>
                    <Text size="xs" c="dimmed">NIM: {selectedRequest.mahasiswa?.nim}</Text>
                  </Stack>
                </Group>
                <Button 
                  variant="subtle" 
                  size="xs" 
                  leftSection={<IconExternalLink size={14} />}
                  onClick={() => window.open(selectedRequest.fileSurat, "_blank")}
                >
                  Lihat Surat
                </Button>
              </Group>
            </Paper>

            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon size="xs" variant="transparent" color="dimmed"><IconFileText size={14} /></ThemeIcon>
                <Text size="xs" fw={800} c="dimmed" tt="uppercase" lts={1}>Perbandingan Judul</Text>
              </Group>
              
              <Paper p="md" radius="md" withBorder>
                <Stack gap="md">
                  <Box>
                    <Text size="xs" fw={700} c="dimmed" mb={4}>JUDUL LAMA</Text>
                    <Text size="sm" fw={500} c="gray.6" style={{ fontStyle: "italic" }}>
                      {selectedRequest.judulLama}
                    </Text>
                  </Box>
                  
                  <Divider label={<IconArrowRight size={14} />} labelPosition="center" />
                  
                  <Box>
                    <Text size="xs" fw={700} c="indigo" mb={4}>JUDUL BARU (USULAN)</Text>
                    <Text size="md" fw={700} className="text-indigo-9 dark:text-indigo-3">
                      {selectedRequest.judulBaru}
                    </Text>
                  </Box>
                </Stack>
              </Paper>
            </Stack>

            <Textarea
              label={
                <Group gap={6} mb={4}>
                  <IconMessageDots size={14} />
                  <Text size="xs" fw={700}>CATATAN REVIEW</Text>
                </Group>
              }
              placeholder="Berikan alasan jika ditolak, atau catatan tambahan jika disetujui..."
              value={catatan}
              onChange={(e) => setCatatan(e.currentTarget.value)}
              minRows={3}
              radius="md"
            />

            <Group justify="flex-end" mt="md" gap="md">
              <Button 
                variant="light" 
                color="red" 
                onClick={() => handleReview("ditolak")} 
                loading={isReviewing}
                radius="md"
                px="xl"
              >
                Tolak Pengajuan
              </Button>
              <Button 
                color="indigo.9" 
                onClick={() => handleReview("diterima")} 
                loading={isReviewing}
                radius="md"
                px="xl"
                leftSection={<IconCheck size={18} />}
              >
                Setujui & Update Judul
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
