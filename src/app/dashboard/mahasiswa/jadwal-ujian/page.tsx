"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Container,
  Stack,
  Skeleton,
  Alert,
  Tabs,
  Paper,
  Text,
  ActionIcon,
  Tooltip,
  Modal,
} from "@mantine/core";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import {
  IconCalendarEvent,
  IconAlertCircle,
  IconEye,
  IconInfoCircle,
} from "@tabler/icons-react";
import { MahasiswaUjianCard, type Ujian } from "@/features/ujian/components/mahasiswa-ujian-card";
import { useUjian } from "@/features/ujian/hooks/use-ujian";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";


export default function MahasiswaJadwalUjianPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();
  const user = userResponse?.user;
  const mahasiswaId = String(user?.id || "");

  const { useUjianByMahasiswa, useAllUjian } = useUjian();

  // My own exam
  const {
    data: ujianResponse,
    isLoading: isMyUjianLoading,
    error: myUjianError,
  } = useUjianByMahasiswa(mahasiswaId);

  // All exams
  const { data: allUjianResponse, isLoading: isAllUjianLoading } =
    useAllUjian();

  // Detail modal
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null);

  const myUjian =
    (Array.isArray(ujianResponse?.data)
      ? (ujianResponse.data[0] as Ujian)
      : (ujianResponse?.data as Ujian)) || null;

  const allUjians = (allUjianResponse?.data || []) as Ujian[];

  if (isLoadingProfile || !isAuthenticated) return null;

  const handleViewDetail = (ujian: Ujian) => {
    setSelectedUjian(ujian);
    openDetail();
  };

  const columns: DataTableColumn<Ujian>[] = [
    {
      header: "Mahasiswa",
      render: (row) => (
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {row.pendaftaranUjian?.mahasiswa?.user?.nama || "-"}
          </Text>
          <Text size="xs" c="dimmed">
            {row.pendaftaranUjian?.mahasiswa?.nim || ""}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Jenis Ujian",
      render: (row) => (
        <Text size="sm">
          {row.pendaftaranUjian?.jenisUjian?.namaJenis || "-"}
        </Text>
      ),
    },
    {
      header: "Jadwal",
      render: (row) => (
        <Stack gap={2}>
          <Text size="sm">
            {row.jadwalUjian
              ? new Date(row.jadwalUjian).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </Text>
          <Text size="xs" c="dimmed">
            {row.hariUjian || ""}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Ruangan",
      render: (row) => <Text size="sm">{row.ruangan?.namaRuangan || "-"}</Text>,
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Tooltip label="Detail">
          <ActionIcon
            variant="subtle"
            color="indigo"
            onClick={() => handleViewDetail(row)}
          >
            <IconEye size={18} />
          </ActionIcon>
        </Tooltip>
      ),
    },
  ];

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Jadwal Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Jadwal Ujian" },
        ]}
        description="Lihat jadwal ujian skripsi dan seminar hasil di lingkungan Program Studi"
        icon={IconCalendarEvent}
      />

      <Paper
        withBorder
        radius="lg"
        p={0}
        mt="xl"
        style={{ overflow: "hidden" }}
      >
        <Tabs defaultValue="saya">
          <Tabs.List px="md" pt="xs">
            <Tabs.Tab value="saya">Jadwal Saya</Tabs.Tab>
            <Tabs.Tab value="semua">Semua Jadwal</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="saya" p="md">
            {isMyUjianLoading ? (
              <Stack>
                <Skeleton height={300} radius="lg" />
              </Stack>
            ) : myUjianError ? (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Kesalahan"
                color="red"
              >
                {(myUjianError as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message || "Gagal memuat jadwal Anda"}
              </Alert>
            ) : myUjian ? (
              <MahasiswaUjianCard ujian={myUjian} hideResults />
            ) : (
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Informasi"
                color="blue"
                variant="light"
              >
                Jadwal ujian Anda belum tersedia. Silakan cek kembali setelah
                pendaftaran Anda disetujui.
              </Alert>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="semua" p={0}>
            <DataTable<Ujian>
              data={allUjians}
              columns={columns}
              loading={isAllUjianLoading}
              noCard
            />
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Detail Modal */}
      <Modal
        opened={detailOpened}
        onClose={closeDetail}
        title={<Text fw={700}>Detail Jadwal Ujian</Text>}
        size="lg"
        radius="lg"
      >
        {selectedUjian && <MahasiswaUjianCard ujian={selectedUjian} hideResults />}
      </Modal>
    </Container>
  );
}
