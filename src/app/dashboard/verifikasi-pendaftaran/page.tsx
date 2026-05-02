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
import { useState, useMemo } from "react";
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
  const isSuperUser = roles.includes("superadmin") || roles.includes("admin");
  const userProdiId = userResponse?.user?.prodi_id;

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
        <Text className="text-gs-danger" fw={700}>
          Hanya Sekretaris Prodi yang memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  const pendaftaranList = useMemo(() => {
    const list = data?.data || [];
    if (isSuperUser || !userProdiId) return list;
    return list.filter(p => {
      const mhsProdi = p.mahasiswa as any;
      const id = mhsProdi?.prodi_id || mhsProdi?.prodiId;
      return Number(id) === Number(userProdiId);
    });
  }, [data?.data, isSuperUser, userProdiId]);

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
      confirmProps: { color: "var(--gs-success)" },
      onConfirm: async () => {
        try {
          await reviewMutation.mutateAsync({
            id,
            status: "diterima",
          });
          notifications.show({
            title: "Berhasil",
            message: "Pendaftaran berhasil disetuju",
            color: "var(--gs-success)",
          });
          closeDetail();
        } catch {
          notifications.show({
            title: "Gagal",
            message: "Terjadi kesalahan saat menyetujui",
            color: "var(--gs-danger)",
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
      confirmProps: { color: "var(--gs-warning)" },
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
            color: "var(--gs-warning)",
          });
          closeDetail();
        } catch {
          notifications.show({
            title: "Gagal",
            message: "Terjadi kesalahan saat mengirim revisi",
            color: "var(--gs-danger)",
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
      confirmProps: { color: "var(--gs-danger)" },
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
            color: "var(--gs-danger)",
          });
          closeDetail();
        } catch {
          notifications.show({
            title: "Gagal",
            message: "Terjadi kesalahan saat menolak",
            color: "var(--gs-danger)",
          });
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "var(--gs-text-muted)",
      menunggu: "var(--gs-primary)",
      revisi: "var(--gs-warning)",
      diterima: "var(--gs-success)",
      ditolak: "var(--gs-danger)",
    };
    return map[status] || "var(--gs-text-muted)";
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
                  backgroundColor: "var(--gs-bg-subtle)",
                }}
              />
              <Text size="10px" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
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
                        ? "var(--gs-success)"
                        : row.status === "ditolak"
                          ? "var(--gs-danger)"
                          : row.status === "revisi"
                            ? "var(--gs-warning)"
                            : "var(--gs-primary)",
                  }}
                />
                <Text
                  size="10px"
                  fw={700}
                  tt="uppercase"
                  lts={0.5}
                  className={
                    row.status === "diterima"
                      ? "text-gs-success-text"
                      : row.status === "ditolak"
                        ? "text-gs-danger-text"
                        : row.status === "revisi"
                          ? "text-gs-warning-text"
                          : "text-gs-primary-text"
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
                fw={700}
                pl={12}
                className={
                  row.status === "diterima"
                    ? "text-gs-success-text"
                    : row.status === "ditolak"
                      ? "text-gs-danger-text"
                      : row.status === "revisi"
                        ? "text-gs-warning-text"
                        : "text-gs-primary-text"
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
      render: (row) => {
        const count = row.berkas?.length || 0;
        return (
          <Badge
            variant="light"
            color={count > 0 ? "var(--gs-primary)" : "var(--gs-danger)"}
            size="xs"
            fw={700}
          >
            {count} File
          </Badge>
        );
      },
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
                  color="var(--gs-success)"
                  leftSection={<IconCheck size={16} stroke={2} />} 
                  onClick={() => handleApprove(row.id)}
                >
                  Setujui
                </Menu.Item>
                <Menu.Item 
                  color="var(--gs-warning)"
                  leftSection={<IconClipboardCheck size={16} stroke={2} />} 
                  onClick={() => handleMintaRevisi(row.id)}
                >
                  Minta Revisi
                </Menu.Item>
                <Menu.Item 
                  color="var(--gs-danger)"
                  leftSection={<IconX size={16} stroke={2} />} 
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
        color="var(--gs-primary)"
        styles={{
          tab: {
            border: '1px solid var(--gs-border)',
            fontWeight: 700,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab 
            value="menunggu" 
            leftSection={<Badge size="xs" circle color="var(--gs-primary)">{summary.menunggu}</Badge>}
          >
            Belum ACC
          </Tabs.Tab>
          <Tabs.Tab 
            value="diterima" 
            leftSection={<Badge size="xs" circle color="var(--gs-success)">{summary.diterima}</Badge>}
          >
            Diterima
          </Tabs.Tab>
          <Tabs.Tab 
            value="revisi" 
            leftSection={<Badge size="xs" circle color="var(--gs-warning)">{summary.revisi}</Badge>}
          >
            Revisi
          </Tabs.Tab>
          <Tabs.Tab 
            value="ditolak" 
            leftSection={<Badge size="xs" circle color="var(--gs-danger)">{summary.ditolak}</Badge>}
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
          <Text fw={800} size="lg" className="text-gs-text-primary tracking-tight">
            DETAIL PENDAFTARAN UJIAN
          </Text>
        }
        size="lg"
        centered
        radius="lg"
        styles={{
          header: {
            borderBottom: "1px solid var(--gs-border)",
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
              bg="var(--gs-bg-overlay)"
              className="border-gs-border"
            >
              <Grid gutter="lg">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      fw={700}
                      lts={0.5}
                    >
                      Mahasiswa
                    </Text>
                    <Text size="sm" fw={700} className="text-gs-text-primary">
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
                      fw={700}
                      lts={0.5}
                    >
                      Status Verifikasi
                    </Text>
                    <Badge
                      color={getStatusBadge(selectedItem.status)}
                      variant="filled"
                      size="md"
                      radius="sm"
                      fw={700}
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
                      fw={700}
                      lts={0.5}
                    >
                      Jenis Ujian
                    </Text>
                    <Text size="sm" fw={700} className="text-gs-text-primary">
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
                      fw={700}
                      lts={0.5}
                    >
                      Keterangan (Catatan)
                    </Text>
                    <Text
                      size="sm"
                      fw={700}
                      className={selectedItem.keterangan ? "text-gs-text-primary" : "text-gs-text-muted"}
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
                      fw={700}
                      lts={0.5}
                    >
                      Judul Rancangan Penelitian
                    </Text>
                    <Text size="sm" fw={700} className="text-gs-text-primary" style={{ fontStyle: "italic" }}>
                      &quot;
                      {selectedItem.rancanganPenelitian?.judulPenelitian || "-"}
                      &quot;
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            <Box mb="xl">
              <Text size="sm" fw={800} mb="sm" className="text-gs-primary" tt="uppercase" lts={1}>
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
                      className="hover:bg-gs-bg-hover transition-colors border-gs-border"
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
                            className="bg-gs-bg-overlay text-gs-primary border border-gs-border"
                            style={{
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
                          variant="subtle"
                          size="xs"
                          color="var(--gs-primary)"
                          leftSection={<IconEye size={14} stroke={2} />}
                          radius="md"
                          fw={700}
                        >
                          LIHAT
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
                  bg="var(--gs-bg-overlay)"
                  className="border-gs-border"
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
                  borderTop: "1px solid var(--gs-border)",
                }}
              >
                <Group justify="flex-end" gap="sm">
                  <Button
                    color="var(--gs-warning)"
                    variant="outline"
                    radius="md"
                    fw={700}
                    onClick={() => handleMintaRevisi(selectedItem.id)}
                    leftSection={
                      <IconClipboardCheck style={{ width: 16, height: 16 }} stroke={2} />
                    }
                  >
                    MINTA REVISI
                  </Button>
                  <Button
                    color="var(--gs-danger)"
                    variant="outline"
                    radius="md"
                    fw={700}
                    onClick={() => handleReject(selectedItem.id)}
                    leftSection={<IconX size={16} stroke={2} />}
                  >
                    TOLAK
                  </Button>
                  <Button
                    className="bg-gs-primary hover:bg-gs-primary-hover"
                    radius="md"
                    fw={700}
                    onClick={() => handleApprove(selectedItem.id)}
                    leftSection={<IconCheck size={16} stroke={2} />}
                  >
                    SETUJUI PENDAFTARAN
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
