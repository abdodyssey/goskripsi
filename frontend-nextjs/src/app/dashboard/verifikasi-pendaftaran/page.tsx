"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Container,
  Text,
  Badge,
  Group,
  Button,
  Center,
  Stack,
  Modal,
  ActionIcon,
  Tooltip,
  Menu,
  rem,
  Grid,
  Paper,
  Box,
  Textarea,
} from "@mantine/core";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  IconClipboardCheck,
  IconEye,
  IconCheck,
  IconX,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

interface PendaftaranUjianItem {
  id: string;
  mahasiswaId: string;
  rancanganPenelitianId: string;
  jenisUjianId: string;
  tanggalPendaftaran: string;
  tanggalDisetujui: string | null;
  status: string;
  keterangan: string | null;
  mahasiswa?: { nama?: string; nim?: string };
  rancanganPenelitian?: { judulPenelitian?: string };
  jenisUjian?: { id: string; namaJenis: string; deskripsi: string | null };
  berkas?: { id: string; namaBerkas: string; filePath: string }[];
}

const formatNamaBerkas = (name: string) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("file proposal")) return "File skripsi";
  if (lowerName.includes("formulir pengajuan judul"))
    return "Formulir pengajuan judul dan pembimbing skripsi";
  if (lowerName.includes("halaman pengesahan")) return "Halaman pengesahan";

  // Remove .pdf extension for cleaner look
  return name.replace(/\.pdf$/i, "");
};

export default function VerifikasiPendaftaranPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<PendaftaranUjianItem | null>(
    null,
  );

  const roles = userResponse?.user?.roles || userResponse?.roles || [];
  const isSekprodi = roles.includes("sekprodi");

  // Fetch all pendaftaran ujian
  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-pendaftaran-ujian"],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: PendaftaranUjianItem[];
        success: boolean;
      }>("/pendaftaran-ujian");
      return res.data;
    },
    enabled: isAuthenticated && isSekprodi,
  });

  // Mutation to update status (Review)
  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      keterangan,
    }: {
      id: string;
      status: string;
      keterangan?: string;
    }) => {
      const res = await apiClient.post(`/pendaftaran-ujian/${id}/review`, {
        status,
        keterangan,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pendaftaran-ujian"] });
    },
  });

  if (isLoadingProfile || !isAuthenticated) return null;

  if (!isSekprodi) {
    return (
      <Container size="xl" pt="md">
        <Text c="red">
          Hanya Sekretaris Prodi yang memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  const pendaftaranList = data?.data || [];

  const summary = {
    menunggu: pendaftaranList.filter((p) => p.status === "menunggu").length,
    revisi: pendaftaranList.filter((p) => p.status === "revisi").length,
    diterima: pendaftaranList.filter((p) => p.status === "diterima").length,
    ditolak: pendaftaranList.filter((p) => p.status === "ditolak").length,
  };

  const filteredPendaftaranList = pendaftaranList.filter(
    (p) => p.status === "menunggu",
  );

  const handleViewDetail = (item: PendaftaranUjianItem) => {
    setSelectedItem(item);
    openDetail();
  };

  const handleApprove = (id: string) => {
    modals.openConfirmModal({
      title: "Setujui Pendaftaran",
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menyetujui pendaftaran ujian ini? Status akan
          berubah menjadi DITERIMA.
        </Text>
      ),
      labels: { confirm: "Setujui", cancel: "Batal" },
      confirmProps: { color: "teal" },
      onConfirm: async () => {
        try {
          await reviewMutation.mutateAsync({
            id,
            status: "diterima",
          });
          notifications.show({
            title: "Berhasil",
            message: "Pendaftaran berhasil disetuju",
            color: "green",
          });
          closeDetail();
        } catch {
          notifications.show({
            title: "Gagal",
            message: "Terjadi kesalahan saat menyetujui",
            color: "red",
          });
        }
      },
    });
  };

  const handleMintaRevisi = (id: string) => {
    let catatan = "";
    modals.openConfirmModal({
      title: "Minta Revisi Pendaftaran",
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Tuliskan catatan revisi untuk mahasiswa. Status akan berubah menjadi
            REVISI.
          </Text>
          <Textarea
            label="Catatan Revisi"
            placeholder="Contoh: Berkas KRS belum diupload..."
            autosize
            minRows={3}
            required
            onChange={(e) => {
              catatan = e.currentTarget.value;
            }}
          />
        </Stack>
      ),
      labels: { confirm: "Kirim Revisi", cancel: "Batal" },
      confirmProps: { color: "orange" },
      onConfirm: async () => {
        try {
          await reviewMutation.mutateAsync({
            id,
            status: "revisi",
            keterangan: catatan,
          });
          notifications.show({
            title: "Berhasil",
            message: "Permintaan revisi berhasil dikirim",
            color: "orange",
          });
          closeDetail();
        } catch {
          notifications.show({
            title: "Gagal",
            message: "Terjadi kesalahan saat mengirim revisi",
            color: "red",
          });
        }
      },
    });
  };

  const handleReject = (id: string) => {
    let reason = "";
    modals.openConfirmModal({
      title: "Tolak Pendaftaran",
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Apakah Anda yakin ingin menolak pendaftaran ujian ini? Status akan
            berubah menjadi DITOLAK.
          </Text>
          <Textarea
            label="Alasan Penolakan"
            placeholder="Tuliskan alasan penolakan..."
            autosize
            minRows={3}
            required
            onChange={(e) => {
              reason = e.currentTarget.value;
            }}
          />
        </Stack>
      ),
      labels: { confirm: "Tolak", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await reviewMutation.mutateAsync({
            id,
            status: "ditolak",
            keterangan: reason,
          });
          notifications.show({
            title: "Berhasil",
            message: "Pendaftaran berhasil ditolak",
            color: "red",
          });
          closeDetail();
        } catch {
          notifications.show({
            title: "Gagal",
            message: "Terjadi kesalahan saat menolak",
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

  const columns: DataTableColumn<PendaftaranUjianItem>[] = [
    {
      header: "Mahasiswa",
      render: (row) => row.mahasiswa?.nama || "-",
    },
    {
      header: "Jenis Ujian",
      render: (row) => row.jenisUjian?.namaJenis || "-",
    },
    {
      header: "Judul Skripsi",
      render: (row) => row.rancanganPenelitian?.judulPenelitian || "-",
    },
    {
      header: "Tanggal",
      render: (row) =>
        row.tanggalPendaftaran
          ? new Date(row.tanggalPendaftaran).toLocaleDateString("id-ID")
          : "-",
    },
    {
      header: "Status",
      render: (row) => (
        <Badge color={getStatusBadge(row.status)} variant="light">
          {row.status.replace("_", " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Berkas",
      render: (row) => <Text size="xs">{row.berkas?.length || 0} file</Text>,
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Tooltip label="Lihat Detail & Berkas">
            <ActionIcon
              variant="subtle"
              color="indigo"
              onClick={() => handleViewDetail(row)}
              size="sm"
            >
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>

          {row.status === "menunggu" && (
            <Menu
              shadow="xs"
              width={160}
              position="bottom-end"
              withArrow
              withinPortal
            >
              <Menu.Target>
                <Tooltip label="Aksi Lainnya">
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconDotsVertical size={14} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Verifikasi</Menu.Label>
                <Menu.Item
                  color="teal"
                  leftSection={
                    <IconCheck style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => handleApprove(row.id)}
                >
                  Setujui
                </Menu.Item>
                <Menu.Item
                  color="orange"
                  leftSection={
                    <IconClipboardCheck
                      style={{ width: rem(14), height: rem(14) }}
                    />
                  }
                  onClick={() => handleMintaRevisi(row.id)}
                >
                  Minta Revisi
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={
                    <IconX style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => handleReject(row.id)}
                >
                  Tolak
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      ),
    },
  ];

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Verifikasi Berkas Pendaftaran Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Verifikasi Pendaftaran Ujian" },
        ]}
        description="Lakukan validasi berkas persyaratan yang telah diunggah oleh mahasiswa"
        icon={IconClipboardCheck}
      />

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder radius="md">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Menunggu
            </Text>
            <Text size="xl" fw={700} c="blue">
              {summary.menunggu}
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder radius="md">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Revisi
            </Text>
            <Text size="xl" fw={700} c="orange">
              {summary.revisi}
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder radius="md">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Diterima
            </Text>
            <Text size="xl" fw={700} c="teal">
              {summary.diterima}
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder radius="md">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Ditolak
            </Text>
            <Text size="xl" fw={700} c="red">
              {summary.ditolak}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      <DataTable
        title="Daftar Pendaftaran Ujian Mahasiswa"
        data={filteredPendaftaranList}
        columns={columns}
        loading={isLoading}
        error={isError ? "Gagal memuat data pendaftaran ujian." : undefined}
        emptyState={
          <Center py={50}>
            <Text c="dimmed">
              Belum ada pendaftaran ujian yang perlu diverifikasi.
            </Text>
          </Center>
        }
      />

      {/* Detail Modal */}
      <Modal
        opened={detailOpened}
        onClose={closeDetail}
        title={
          <Text fw={700} size="lg">
            Detail Pendaftaran Ujian
          </Text>
        }
        size="lg"
        centered
        radius="lg"
        styles={{
          header: {
            borderBottom: "1px solid var(--mantine-color-default-border)",
            paddingBottom: "var(--mantine-spacing-md)",
            marginBottom: "var(--mantine-spacing-md)",
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        {selectedItem && (
          <Box>
            <Paper
              withBorder
              radius="md"
              p="md"
              mb="lg"
              bg="gray.0"
              className="dark:bg-slate-900/40"
            >
              <Grid gutter="lg">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      fw={800}
                      lts={0.5}
                    >
                      Mahasiswa
                    </Text>
                    <Text size="sm" fw={700}>
                      {(selectedItem.mahasiswa?.nama as string) || "-"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      NIM: {(selectedItem.mahasiswa?.nim as string) || "-"}
                    </Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      fw={800}
                      lts={0.5}
                    >
                      Status Verifikasi
                    </Text>
                    <Badge
                      color={getStatusBadge(selectedItem.status)}
                      variant="light"
                      size="md"
                    >
                      {selectedItem.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      fw={800}
                      lts={0.5}
                    >
                      Jenis Ujian
                    </Text>
                    <Text size="sm" fw={600}>
                      {selectedItem.jenisUjian?.namaJenis || "-"}
                    </Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      fw={800}
                      lts={0.5}
                    >
                      Keterangan (Catatan)
                    </Text>
                    <Text
                      size="sm"
                      fw={500}
                      c={selectedItem.keterangan ? "inherit" : "dimmed"}
                    >
                      {selectedItem.keterangan || "-"}
                    </Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      fw={800}
                      lts={0.5}
                    >
                      Judul Rancangan Penelitian
                    </Text>
                    <Text size="sm" fw={600} style={{ fontStyle: "italic" }}>
                      &quot;
                      {selectedItem.rancanganPenelitian?.judulPenelitian || "-"}
                      &quot;
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            <Box mb="xl">
              <Text size="sm" fw={700} mb="sm" c="indigo.7">
                Berkas yang Diunggah
              </Text>
              {selectedItem.berkas && selectedItem.berkas.length > 0 ? (
                <Stack gap="sm">
                  {selectedItem.berkas.map((b) => (
                    <Paper
                      key={b.id}
                      withBorder
                      p="sm"
                      radius="md"
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group
                          gap="sm"
                          wrap="nowrap"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <Center
                            w={32}
                            h={32}
                            style={{
                              backgroundColor:
                                "var(--mantine-color-indigo-light)",
                              color: "var(--mantine-color-indigo-filled)",
                              borderRadius: "8px",
                            }}
                          >
                            <Text size="xs" fw={800}>
                              PDF
                            </Text>
                          </Center>
                          <Text
                            size="sm"
                            fw={500}
                            truncate="end"
                            title={b.namaBerkas}
                            style={{ flex: 1, minWidth: 0 }}
                          >
                            {formatNamaBerkas(b.namaBerkas)}
                          </Text>
                        </Group>
                        <Button
                          component="a"
                          href={b.filePath}
                          target="_blank"
                          variant="light"
                          size="xs"
                          color="indigo"
                          leftSection={<IconEye size={14} />}
                        >
                          Lihat
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Paper
                  withBorder
                  p="xl"
                  radius="md"
                  bg="gray.0"
                  className="dark:bg-gray-900/40"
                >
                  <Center>
                    <Text size="sm" c="dimmed">
                      Tidak ada berkas yang dilampirkan.
                    </Text>
                  </Center>
                </Paper>
              )}
            </Box>

            {selectedItem.status === "menunggu" && (
              <Box
                mt="xl"
                pt="md"
                style={{
                  borderTop: "1px solid var(--mantine-color-default-border)",
                }}
              >
                <Group justify="flex-end" gap="sm">
                  <Button
                    color="orange"
                    variant="outline"
                    radius="md"
                    onClick={() => handleMintaRevisi(selectedItem.id)}
                    leftSection={
                      <IconClipboardCheck style={{ width: 16, height: 16 }} />
                    }
                  >
                    Minta Revisi
                  </Button>
                  <Button
                    color="red"
                    variant="outline"
                    radius="md"
                    onClick={() => handleReject(selectedItem.id)}
                    leftSection={<IconX size={16} />}
                  >
                    Tolak
                  </Button>
                  <Button
                    color="teal"
                    radius="md"
                    onClick={() => handleApprove(selectedItem.id)}
                    leftSection={<IconCheck size={16} />}
                  >
                    Setujui Pendaftaran
                  </Button>
                </Group>
              </Box>
            )}
          </Box>
        )}
      </Modal>
    </Container>
  );
}
