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

export default function PenilaianUjianPage() {
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
                    backgroundColor: "var(--mantine-color-gray-4)",
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
                <Text size="10px" fw={700} className="text-gs-primary" tt="uppercase" lts={0.5}>
                  Hari & Jam
                </Text>
              </Group>
              <Text size="xs" fw={800} className="text-gs-text-primary" pl={12}>
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
          variant="filled" 
          className="bg-gs-primary"
          size="sm" 
          radius="sm"
          fw={700}
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
            <ActionIcon variant="subtle" color="gray" radius="md" size="lg">
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

            {row.pengujiUjians?.some((p) => String(p.dosenId) === String(userId)) && (
              <>
                <Menu.Divider />
                <Menu.Item 
                  className="text-gs-primary"
                  leftSection={<IconPlayerPlay size={16} stroke={1.5} className="text-gs-primary" />} 
                  component={Link}
                  href={`/dashboard/penilaian-ujian/ujian/${row.id}`}
                >
                  Eksekusi Ujian
                </Menu.Item>
              </>
            )}
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
            <ActionIcon variant="subtle" color="gray" radius="md" size="lg">
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

            {row.pengujiUjians?.some((p) => String(p.dosenId) === String(userId)) && (
              <>
                <Menu.Divider />
                <Menu.Item 
                  className="text-gs-primary"
                  leftSection={<IconPlayerPlay size={16} stroke={1.5} className="text-gs-primary" />} 
                  component={Link}
                  href={`/dashboard/penilaian-ujian/ujian/${row.id}`}
                >
                  Eksekusi Ujian
                </Menu.Item>
              </>
            )}
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
        title="Penilaian Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penilaian Ujian" },
        ]}
        description="Lakukan eksekusi penilaian untuk ujian yang telah dijadwalkan kepada Anda"
        icon={IconPlayerPlay}
      />

      <Paper withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
        <DataTable<UjianItem>
          data={myUjian}
          columns={myColumns}
          loading={isLoading}
          error={error ? "Gagal memuat data ujian" : null}
          noCard
        />
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
              radius="md"
              p="md"
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
                  <Badge className="bg-gs-primary" variant="filled" size="md" radius="sm" fw={700}>
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
                      <Badge variant="outline" color="var(--gs-primary)" size="sm" radius="sm" fw={700}>
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
                    size="xs"
                    fw={800}
                    className="text-gs-primary"
                    lts={1}
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
                  size="xs"
                  fw={800}
                  className="text-gs-success-text"
                  lts={1}
                  tt="uppercase"
                >
                  HASIL PENILAIAN AKHIR
                </Text>
                
                <Paper withBorder radius="lg" p="xl" bg="var(--gs-success-bg)" style={{ borderColor: 'var(--gs-success-border)' }}>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="10px" c="dimmed" tt="uppercase" fw={700} lts={0.5}>Status Kelulusan</Text>
                      <Badge size="lg" variant="filled" className={selectedUjian.hasil === 'lulus' ? 'bg-gs-success' : 'bg-gs-danger'} radius="sm" fw={800}>
                        {(selectedUjian.hasil || 'TIDAK LULUS').toUpperCase()}
                      </Badge>
                    </Stack>
                    <Group gap="xl">
                      <Stack gap={0} align="flex-end">
                        <Text size="10px" c="dimmed" tt="uppercase" fw={700} lts={0.5}>Nilai Akhir</Text>
                        <Text fw={800} size="xl" className="text-gs-success-text">{Number(selectedUjian.nilaiAkhir || 0).toFixed(2)}</Text>
                      </Stack>
                      <Stack gap={0} align="flex-end">
                        <Text size="10px" c="dimmed" tt="uppercase" fw={700} lts={0.5}>Indeks</Text>
                        <Text fw={800} size="xl" className="text-gs-success-text">{selectedUjian.nilaiHuruf || 'E'}</Text>
                      </Stack>
                    </Group>
                  </Group>
                </Paper>

                <Box mt="xs">
                  <Table variant="unstyled" verticalSpacing="xs" withTableBorder withColumnBorders style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <Table.Thead bg="gray.1">
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
                    <Text size="xs" c="dimmed" fw={600}>CATATAN PENJADWALAN:</Text>
                    <Text size="sm" lh={1.4}>{selectedUjian.catatan}</Text>
                  </Box>
                )}
                {selectedUjian.catatanRevisi && (
                  <Box>
                    <Text size="xs" c="dimmed" fw={600}>CATATAN REVISI PENGUJI:</Text>
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
