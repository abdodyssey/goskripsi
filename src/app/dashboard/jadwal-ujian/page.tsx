"use client";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Container,
  Text,
  Badge,
  Group,
  Stack,
  Modal,
  ActionIcon,
  Grid,
  Tabs,
  Box,
  Menu,
  Paper,
  Button,
  Table,
} from "@mantine/core";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo } from "react";
import {
  IconEye,
  IconCalendarEvent,
  IconPlayerPlay,
  IconPrinter,
  IconDotsVertical,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ujianService } from "@/features/ujian/api/ujian.service";

// ---- Types ----
interface PengujiItem {
  dosenId: string;
  peran: string;
  dosen?: {
    id: string;
    nama: string;
    nidn?: string;
    user?: { nama: string };
  };
}

interface UjianItem {
  id: string;
  pendaftaranUjianId: string;
  hariUjian: string | null;
  jadwalUjian: string | null;
  waktuMulai: string | null;
  waktuSelesai: string | null;
  ruanganId: string | null;
  catatan: string | null;
  catatanRevisi?: string | null;
  ruangan?: { namaRuangan: string } | null;
  pengujiUjians?: PengujiItem[];
  pendaftaranUjian?: {
    mahasiswa?: { user?: { nama: string }; nim: string };
    jenisUjian?: { namaJenis: string };
    rancanganPenelitian?: { judulPenelitian: string };
  };
  keputusan?: { namaKeputusan: string } | null;
  nilaiAkhir?: number;
  nilaiHuruf?: string;
  hasil?: string;
  nilaiDifinalisasi?: boolean;
  penilaians?: {
    dosenId: number;
    komponenPenilaianId: number;
    nilai: number;
    komentar?: string;
    sudahSubmit: boolean;
    dosen: { user: { nama: string } };
    komponenPenilaian: {
      kriteria: string;
      bobotKomponenPerans: { peran: string; bobot: number }[];
    };
  }[];
}

const PERAN_LABELS: Record<string, string> = {
  ketua_penguji: "Ketua Penguji",
  sekretaris_penguji: "Sekretaris",
  penguji_1: "Penguji 1",
  penguji_2: "Penguji 2",
};

export default function JadwalUjianDosenPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();

  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];
  const rolesLower = roles.map((r) => r.toLowerCase());
  const isDosen = rolesLower.includes("dosen");
  const isSekprodi = rolesLower.includes("sekprodi");
  const isKaprodi = rolesLower.includes("kaprodi");
  const isAdmin =
    rolesLower.includes("admin") || rolesLower.includes("superadmin");
  const isAdminProdi = rolesLower.includes("admin_prodi");
  const canViewAll = isSekprodi || isKaprodi || isAdmin || isAdminProdi;

  const userId = user?.id;

  // Default tab logic: Administrative roles default to "Semua Ujian"
  const defaultTab = canViewAll ? "semua" : "saya";

  // Detail modal
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [selectedUjian, setSelectedUjian] = useState<UjianItem | null>(null);

  // ---- Fetch all ujian ----
  const {
    data: allUjian,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-ujian-dosen"],
    queryFn: async () => {
      const res = await apiClient.get("/ujian");
      return (res.data?.data || []) as UjianItem[];
    },
    enabled: isAuthenticated && (isDosen || canViewAll),
  });

  // ---- Derived data ----
  const myUjian = useMemo(() => {
    if (!allUjian || !userId) return [];
    return allUjian.filter((u) =>
      u.pengujiUjians?.some((p) => String(p.dosenId) === String(userId)),
    );
  }, [allUjian, userId]);

  // Find my role in a given ujian
  const getMyRole = (ujian: UjianItem): string => {
    if (!userId) return "-";
    const penguji = ujian.pengujiUjians?.find(
      (p) => String(p.dosenId) === String(userId),
    );
    return penguji ? PERAN_LABELS[penguji.peran] || penguji.peran : "-";
  };

  // ---- Filtered All Ujian (by Prodi) ----
  const filteredAllUjian = useMemo(() => {
    if (!allUjian) return [];
    // Superadmin and Global Admin see everything
    if (isAdmin) return allUjian;
    if (!user?.prodi_id) return allUjian;

    return allUjian.filter((u) => {
      const mhsProdi = u.pendaftaranUjian?.mahasiswa as any;
      const id = mhsProdi?.prodi_id || mhsProdi?.prodiId;
      return Number(id) === Number(user.prodi_id);
    });
  }, [allUjian, user?.prodi_id, isAdmin]);

  const handleViewDetail = (ujian: UjianItem) => {
    setSelectedUjian(ujian);
    openDetail();
  };

  // ---- Common columns ----
  const baseColumns: DataTableColumn<UjianItem>[] = [
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
      header: "Judul Skripsi",
      render: (row) => (
        <Text
          size="xs"
          title={row.pendaftaranUjian?.rancanganPenelitian?.judulPenelitian || "-"}
        >
          {row.pendaftaranUjian?.rancanganPenelitian?.judulPenelitian || "-"}
        </Text>
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
      header: "Waktu",
      width: "200px",
      render: (row) => {
        const mulai = row.waktuMulai
          ? new Date(row.waktuMulai).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        const selesai = row.waktuSelesai
          ? new Date(row.waktuSelesai).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "?";
        const jam = mulai ? `${mulai} - ${selesai}` : "-";

        return (
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
                <Text size="10px" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                  Jadwal Ujian
                </Text>
              </Group>
              <Text size="xs" fw={600} pl={12}>
                {row.jadwalUjian
                  ? new Date(row.jadwalUjian).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </Text>
            </Box>
            <Box>
              <Group gap={6} mb={2}>
                <Box
                  w={6}
                  h={6}
                  style={{
                    borderRadius: "50%",
                    backgroundColor: "var(--gs-primary)",
                  }}
                />
                <Text size="10px" fw={700} className="text-gs-text-primary" tt="uppercase" lts={0.5}>
                  Hari & Jam
                </Text>
              </Group>
              <Text size="xs" fw={700} className="text-gs-text-primary" pl={12}>
                {row.hariUjian || "-"}, {jam}
              </Text>
            </Box>
          </Stack>
        );
      },
    },
    {
      header: "Ruangan",
      render: (row) => <Text size="sm">{row.ruangan?.namaRuangan || "-"}</Text>,
    },
  ];

  // ---- My ujian columns (with my role) ----
  const myColumns: DataTableColumn<UjianItem>[] = [
    ...baseColumns,
    {
      header: "Peran Saya",
      render: (row) => (
        <Badge 
          variant="outline" 
          color="var(--gs-border-strong)" 
          size="sm" 
          fw={700}
          className="text-gs-text-primary"
          style={{ whiteSpace: "normal", height: "auto", padding: "4px 8px", textAlign: "center" }}
        >
          {getMyRole(row)}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      textAlign: "right",
      width: 140,
      render: (row) => (
        <Menu shadow="sm" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="var(--gs-text-muted)" radius="md" size="lg">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Opsi Ujian</Menu.Label>
            <Menu.Item 
              leftSection={<IconEye size={16} stroke={1.5} />} 
              onClick={() => handleViewDetail(row)}
            >
              Lihat Detail
            </Menu.Item>

          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  // ---- All ujian columns ----
  const allColumns: DataTableColumn<UjianItem>[] = [
    ...baseColumns,
    {
      header: "Aksi",
      textAlign: "right",
      width: 140,
      render: (row) => (
        <Menu shadow="sm" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="var(--gs-text-muted)" radius="md" size="lg">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Opsi Ujian</Menu.Label>
            <Menu.Item 
              leftSection={<IconEye size={16} stroke={1.5} />} 
              onClick={() => handleViewDetail(row)}
            >
              Lihat Detail
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconPrinter size={16} stroke={1.5} />} 
              onClick={() => handleDownloadUndangan(row.pendaftaranUjianId, row.pendaftaranUjian?.mahasiswa?.nim || "MHS")}
            >
              Cetak Undangan
            </Menu.Item>

          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await apiClient.get("/ujian/pdf/jadwal", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Jadwal_Ujian.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      notifications.show({
        title: "Gagal",
        message: "Gagal mendownload PDF jadwal",
        color: "var(--gs-danger)",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadUndangan = async (pendaftaranId: string, nim: string) => {
    try {
      const blob = await ujianService.downloadUndanganPdf(pendaftaranId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Undangan_Ujian_${nim}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat mendownload Undangan",
        color: "var(--gs-danger)",
      });
    }
  };

  if (isLoadingProfile || !isAuthenticated) return null;
  if (!isDosen && !canViewAll) {
    return (
      <Container size="xl" pt="md">
        <Text className="text-gs-danger" fw={700}>
          Hanya Dosen atau Staf Administrasi yang memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Jadwal Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Jadwal Ujian" },
        ]}
        description="Lihat dan pantau jadwal ujian skripsi yang telah ditetapkan"
        icon={IconCalendarEvent}
        rightSection={
          canViewAll && (
            <Group>
              <Button
                variant="filled"
                className="bg-gs-primary hover:bg-gs-primary-hover"
                leftSection={<IconPrinter size={16} stroke={1.5} />}
                onClick={handleDownloadPdf}
                loading={downloading}
                radius="md"
              >
                Cetak Jadwal (PDF)
              </Button>
            </Group>
          )
        }
      />

      <Paper withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
        <Tabs defaultValue={defaultTab}>
          <Tabs.List px="md" pt="md">
            {/* Tampil untuk semua Dosen */}
            {isDosen && (
              <Tabs.Tab
                value="saya"
                rightSection={
                  myUjian.length ? (
                    <Badge
                      size="sm"
                      variant="filled"
                      className="bg-gs-primary"
                      radius="xl"
                      px={8}
                    >
                      {myUjian.length}
                    </Badge>
                  ) : null
                }
              >
                Ujian Saya
              </Tabs.Tab>
            )}

            {/* Tampil untuk peran administratif ATAU Dosen yang ingin melihat keseluruhan */}
            {(canViewAll || isDosen) && (
              <Tabs.Tab
                value="semua"
                rightSection={
                  filteredAllUjian?.length ? (
                    <Badge
                      size="sm"
                      className="bg-gs-bg-overlay text-gs-text-primary"
                      variant="outline"
                      radius="xl"
                      px={8}
                      fw={700}
                    >
                      {filteredAllUjian.length}
                    </Badge>
                  ) : null
                }
              >
                Semua Ujian
              </Tabs.Tab>
            )}
          </Tabs.List>

          {isDosen && (
            <Tabs.Panel value="saya" p={0}>
              <DataTable<UjianItem>
                data={myUjian}
                columns={myColumns}
                loading={isLoading}
                error={error ? "Gagal memuat data ujian" : null}
                noCard
              />
            </Tabs.Panel>
          )}

          {(canViewAll || isDosen) && (
            <Tabs.Panel value="semua" p={0}>
              <DataTable<UjianItem>
                data={filteredAllUjian || []}
                columns={allColumns}
                loading={isLoading}
                error={error ? "Gagal memuat data ujian" : null}
                noCard
              />
            </Tabs.Panel>
          )}
        </Tabs>
      </Paper>

      {/* ---- Detail Modal ---- */}
      <Modal
        opened={detailOpened}
        onClose={() => {
          closeDetail();
          setSelectedUjian(null);
        }}
        title={
          <Text fw={800} size="lg" className="text-gs-text-primary tracking-tight">
            DETAIL INFORMASI UJIAN
          </Text>
        }
        size="70rem"
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
        {selectedUjian && (
          <Stack gap="lg">
            <Paper
              withBorder
              radius="lg"
              p="xl"
              mb="lg"
              bg="var(--gs-bg-overlay)"
              className="border-gs-border"
            >
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start">
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
                      {selectedUjian.pendaftaranUjian?.mahasiswa?.user?.nama ||
                        "-"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      NIM:{" "}
                      {selectedUjian.pendaftaranUjian?.mahasiswa?.nim || "-"}
                    </Text>
                  </Stack>
                  <Badge variant="filled" className="bg-gs-primary" size="md" radius="sm" fw={700}>
                    {selectedUjian.pendaftaranUjian?.jenisUjian?.namaJenis ||
                      "-"}
                  </Badge>
                </Group>

                <Stack gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.5}>
                    Judul Penelitian
                  </Text>
                  <Text size="sm" fw={700} className="text-gs-text-primary" style={{ fontStyle: "italic" }}>
                    &quot;
                    {selectedUjian.pendaftaranUjian?.rancanganPenelitian
                      ?.judulPenelitian || "-"}
                    &quot;
                  </Text>
                </Stack>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md" mb="lg">
              <Text
                size="xs"
                fw={800}
                mb="md"
                className="text-gs-text-primary"
                lts={1}
                tt="uppercase"
              >
                JADWAL & LOKASI
              </Text>
              <Grid gutter="md">
                <Grid.Col span={4}>
                  <Stack gap={2}>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Hari
                    </Text>
                    <Text size="sm" fw={600}>
                      {selectedUjian.hariUjian || "-"}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack gap={2}>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      Tanggal
                    </Text>
                    <Text size="sm" fw={700} className="text-gs-text-primary">
                      {selectedUjian.jadwalUjian
                        ? new Date(
                            selectedUjian.jadwalUjian,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack gap={2}>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      Waktu
                    </Text>
                    <Text size="sm" fw={700} className="text-gs-text-primary">
                      {selectedUjian.waktuMulai
                        ? `${new Date(selectedUjian.waktuMulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${selectedUjian.waktuSelesai ? new Date(selectedUjian.waktuSelesai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "?"}`
                        : "-"}
                    </Text>
                  </Stack>
                </Grid.Col>
                {selectedUjian.ruangan && (
                  <Grid.Col span={12}>
                    <Group gap="xs">
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                        Ruangan:
                      </Text>
                      <Badge variant="dot" color="var(--gs-primary)" size="sm" fw={700}>
                        {selectedUjian.ruangan.namaRuangan}
                      </Badge>
                    </Group>
                  </Grid.Col>
                )}
              </Grid>
            </Paper>

            {/* Dewan Penguji */}
            {selectedUjian.pengujiUjians &&
              selectedUjian.pengujiUjians.length > 0 && (
                <Stack gap="xs">
                  <Text
                    size="sm"
                    fw={800}
                    className="text-gs-primary"
                    lts={0.5}
                    tt="uppercase"
                  >
                    DEWAN PENGUJI
                  </Text>
                  <Grid gutter="sm">
                    {selectedUjian.pengujiUjians.map((p, i) => (
                      <Grid.Col span={6} key={i}>
                        <Paper
                          p="sm"
                          radius="md"
                          withBorder
                          className=""
                        >
                          <Text
                            size="xs"
                            c="dimmed"
                            tt="uppercase"
                            fw={700}
                            lts={0.5}
                          >
                            {PERAN_LABELS[p.peran] || p.peran}
                          </Text>
                          <Text size="sm" fw={700} className="text-gs-text-primary">
                            {p.dosen?.user?.nama || p.dosen?.nama || "-"}
                          </Text>
                        </Paper>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              )}

            {/* Rekap Nilai Section */}
            {selectedUjian.nilaiDifinalisasi && selectedUjian.penilaians && (
              <Stack gap="xs">
                <Text
                  size="sm"
                  fw={800}
                  className="text-gs-success-text"
                  lts={0.5}
                  tt="uppercase"
                >
                  HASIL PENILAIAN AKHIR
                </Text>
                
                <Paper withBorder radius="lg" p="xl" bg="var(--gs-success-bg)" className="border-gs-success-border">
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" className="text-gs-success-text" tt="uppercase" fw={700} lts={1}>Status Kelulusan</Text>
                      <Badge size="lg" variant="filled" className={selectedUjian.hasil === 'lulus' ? 'bg-gs-success' : 'bg-gs-danger'} radius="sm" fw={700}>
                        {(selectedUjian.hasil || 'TIDAK LULUS').toUpperCase()}
                      </Badge>
                    </Stack>
                    <Group gap="xl">
                      <Stack gap={0} align="flex-end">
                        <Text size="xs" className="text-gs-success-text" tt="uppercase" fw={700} lts={1}>Nilai Akhir</Text>
                        <Text fw={700} size="xl" className="text-gs-success-text">{Number(selectedUjian.nilaiAkhir || 0).toFixed(2)}</Text>
                      </Stack>
                      <Stack gap={0} align="flex-end">
                        <Text size="xs" className="text-gs-success-text" tt="uppercase" fw={700} lts={1}>Indeks</Text>
                        <Text fw={700} size="xl" className="text-gs-success-text">{selectedUjian.nilaiHuruf || 'E'}</Text>
                      </Stack>
                    </Group>
                  </Group>
                </Paper>

                <Box mt="xs">
                  <Table variant="unstyled" verticalSpacing="xs" withTableBorder withColumnBorders style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <Table.Thead bg="var(--gs-bg-overlay)">
                      <Table.Tr>
                        <Table.Th style={{ fontSize: '11px' }}>Komponen</Table.Th>
                        {selectedUjian.pengujiUjians?.map((p, i) => (
                          <Table.Th key={i} ta="center" style={{ fontSize: '11px' }}>
                            {p.dosen?.user?.nama || p.dosen?.nama || `P${i+1}`}
                            <Text size="10px" c="dimmed" fw={500}>({PERAN_LABELS[p.peran]})</Text>
                          </Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {/* We need to group penilaians by component */}
                      {Array.from(new Set(selectedUjian.penilaians.map(p => p.komponenPenilaian.kriteria))).map((kriteria, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td style={{ fontSize: '12px', fontWeight: 600 }}>{kriteria}</Table.Td>
                          {selectedUjian.pengujiUjians?.map((penguji, pIdx) => {
                            const isBimbingan = kriteria === "Bimbingan";
                            const isP1orP2 = penguji.peran === "penguji_1" || penguji.peran === "penguji_2";
                            
                            const score = selectedUjian.penilaians?.find(
                              s => s.komponenPenilaian.kriteria === kriteria && Number(s.dosenId) === Number(penguji.dosenId)
                            );
                            const bobot = score?.komponenPenilaian.bobotKomponenPerans.find(b => b.peran === penguji.peran)?.bobot || 0;
                            
                            return (
                              <Table.Td key={pIdx} ta="center" style={{ fontSize: '12px' }}>
                                {(score && !(isBimbingan && isP1orP2)) ? (
                                  <Stack gap={0}>
                                    <Text size="xs" fw={600}>{score.nilai}</Text>
                                    <Text size="10px" c="dimmed">{bobot}%</Text>
                                  </Stack>
                                ) : (
                                  <Text size="xs" c="dimmed">-</Text>
                                )}
                              </Table.Td>
                            );
                          })}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              </Stack>
            )}

            {/* Catatan */}
            {(selectedUjian.catatan || selectedUjian.catatanRevisi) && (
              <Paper withBorder radius="md" p="md">
                <Text
                  size="sm"
                  fw={800}
                  mb="xs"
                  className="text-gs-warning-text"
                  lts={0.5}
                  tt="uppercase"
                >
                  CATATAN & REVISI
                </Text>
                {selectedUjian.catatan && (
                  <Box mb="xs">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Catatan Penjadwalan:</Text>
                    <Text size="sm" lh={1.4}>{selectedUjian.catatan}</Text>
                  </Box>
                )}
                {selectedUjian.catatanRevisi && (
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Catatan Revisi Penguji:</Text>
                    <Text size="sm" lh={1.4}>{selectedUjian.catatanRevisi}</Text>
                  </Box>
                )}
              </Paper>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
