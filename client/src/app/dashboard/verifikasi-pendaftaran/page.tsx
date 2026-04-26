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
  Tabs,
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
      queryClient.invalidateQueries({ queryKey: ["pendaftaran-all"] });
      queryClient.invalidateQueries({ queryKey: ["pendaftaran-ujian"] });
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

  const [activeTab, setActiveTab] = useState<string>("menunggu");

  const filteredPendaftaranList = pendaftaranList.filter((p) => {
    if (activeTab === "menunggu") return p.status === "menunggu";
    if (activeTab === "diterima") return p.status === "diterima";
    if (activeTab === "revisi") return p.status === "revisi";
    if (activeTab === "ditolak") return p.status === "ditolak";
    return true;
  });

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
      render: (row) => (
        <Text size="xs" lineClamp={2} title={row.rancanganPenelitian?.judulPenelitian || "-"}>
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
                Pengajuan
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
                  ? "ACC Kaprodi"
                  : row.status === "ditolak"
                    ? "Ditolak"
                    : row.status === "revisi"
                      ? "Minta Revisi"
                      : ""}
              </Text>
            </Box>
          )}
        </Stack>
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
        <Menu shadow="sm" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="md" size="lg">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Pendaftaran</Menu.Label>
            <Menu.Item 
              leftSection={<IconEye size={16} stroke={1.5} />} 
              onClick={() => handleViewDetail(row)}
            >
              Lihat Detail & Berkas
            </Menu.Item>

            {row.status === "menunggu" && (
              <>
                <Menu.Divider />
                <Menu.Label>Verifikasi</Menu.Label>
                <Menu.Item 
                  color="teal"
                  leftSection={<IconCheck size={16} stroke={1.5} />} 
                  onClick={() => handleApprove(row.id)}
                >
                  Setujui
                </Menu.Item>
                <Menu.Item 
                  color="orange"
                  leftSection={<IconClipboardCheck size={16} stroke={1.5} />} 
                  onClick={() => handleMintaRevisi(row.id)}
                >
                  Minta Revisi
                </Menu.Item>
                <Menu.Item 
                  color="red"
                  leftSection={<IconX size={16} stroke={1.5} />} 
                  onClick={() => handleReject(row.id)}
                >
                  Tolak
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
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

      <Tabs 
        value={activeTab} 
        onChange={(val) => setActiveTab(val || "menunggu")}
        variant="pills"
        radius="xl"
        mb="xl"
        color="indigo"
      >
        <Tabs.List>
          <Tabs.Tab 
            value="menunggu" 
            leftSection={<Badge size="xs" circle color="blue">{summary.menunggu}</Badge>}
          >
            Belum ACC
          </Tabs.Tab>
          <Tabs.Tab 
            value="diterima" 
            leftSection={<Badge size="xs" circle color="teal">{summary.diterima}</Badge>}
          >
            Diterima
          </Tabs.Tab>
          <Tabs.Tab 
            value="revisi" 
            leftSection={<Badge size="xs" circle color="orange">{summary.revisi}</Badge>}
          >
            Revisi
          </Tabs.Tab>
          <Tabs.Tab 
            value="ditolak" 
            leftSection={<Badge size="xs" circle color="red">{summary.ditolak}</Badge>}
          >
            Ditolak
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <DataTable
        title={`Pendaftaran Ujian (${activeTab === 'menunggu' ? 'Belum ACC' : activeTab.toUpperCase()})`}
        data={filteredPendaftaranList}
        columns={columns}
        loading={isLoading}
        error={isError ? "Gagal memuat data pendaftaran ujian." : undefined}
        emptyState={
          <Center py={50}>
            <Text c="dimmed">
              Tidak ada data pendaftaran untuk status ini.
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
