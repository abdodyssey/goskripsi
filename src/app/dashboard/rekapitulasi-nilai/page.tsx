"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Container,
  Text,
  Badge,
  Group,
  Center,
  Stack,
  Modal,
  ActionIcon,
  Tooltip,
  Paper,
  Grid,
  Title,
  Table,
  Button,
  Box,
} from "@mantine/core";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { IconEye, IconFileText, IconPrinter } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";

interface PenilaianEntry {
  dosenId: number;
  nilai: string | number;
  sudahSubmit: boolean;
  dosen: { id: number; user: { nama: string } };
  komponenPenilaian: {
    id: number;
    kriteria: string;
    bobotKomponenPerans: { peran: string; bobot: number }[];
  };
}

interface UjianItem {
  id: number;
  nilaiAkhir: number;
  nilaiHuruf: string;
  hasil: string;
  nilaiDifinalisasi: boolean;
  tanggalFinalisasi: string;
  pendaftaranUjian: {
    mahasiswa: {
      nim: string;
      user: { nama: string };
    };
    jenisUjian: {
      namaJenis: string;
    };
    rancanganPenelitian: {
      judulPenelitian: string;
    };
  };
  penilaians: PenilaianEntry[];
  catatan?: string;
  catatanRevisi?: string;
}

export default function RekapitulasiNilaiPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<UjianItem | null>(null);
  const [printing, setPrinting] = useState(false);

  const handlePrint = async (id: number) => {
    try {
      setPrinting(true);
      const response = await apiClient.get(`/ujian/${id}/print`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Berita_Acara_Ujian_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message: "Gagal mendownload PDF Berita Acara",
        color: "var(--gs-danger)",
      });
    } finally {
      setPrinting(false);
    }
  };

  const roles = userResponse?.user?.roles || userResponse?.roles || [];
  const isAdminProdi = roles.includes("admin_prodi");
  const isKaprodi = roles.includes("kaprodi");
  const isSekprodi = roles.includes("sekprodi");
  const isAdmin = roles.includes("admin");
  const isSuperUser = roles.includes("superadmin") || roles.includes("admin");
  const userProdiId = userResponse?.user?.prodi_id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-ujian-finalized"],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: UjianItem[];
        success: boolean;
      }>("/ujian");
      return res.data;
    },
    enabled:
      isAuthenticated && (isAdminProdi || isKaprodi || isSekprodi || isAdmin),
  });

  if (isLoadingProfile || !isAuthenticated) return null;

  if (!isAdminProdi && !isKaprodi && !isSekprodi && !isAdmin) {
    return (
      <Container size="xl" pt="md">
        <Text className="text-gs-danger" fw={700}>
          Anda tidak memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  const ujianList = useMemo(() => {
    const list = (data?.data || []).filter((u) => u.nilaiDifinalisasi);
    if (isSuperUser || !userProdiId) return list;
    return list.filter(u => {
      const mhsProdi = u.pendaftaranUjian?.mahasiswa as any;
      const id = mhsProdi?.prodi_id || mhsProdi?.prodiId;
      return Number(id) === Number(userProdiId);
    });
  }, [data?.data, isSuperUser, userProdiId]);

  const columns: DataTableColumn<UjianItem>[] = [
    {
      header: "Mahasiswa",
      render: (row) => (
        <Stack gap={0}>
          <Text size="sm" fw={500}>
            {row.pendaftaranUjian?.mahasiswa?.user?.nama || "-"}
          </Text>
          <Text size="xs" c="dimmed">
            {row.pendaftaranUjian?.mahasiswa?.nim || "-"}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Jenis Ujian",
      render: (row) => row.pendaftaranUjian?.jenisUjian?.namaJenis || "-",
    },
    {
      header: "Judul Skripsi",
      render: (row) => (
        <Text size="sm" lineClamp={2} maw={300}>
          {row.pendaftaranUjian?.rancanganPenelitian?.judulPenelitian || "-"}
        </Text>
      ),
    },
    {
      header: "Nilai Akhir",
      render: (row) => (
        <Group gap="xs">
          <Text fw={700} className="text-gs-text-primary">
            {Number(row.nilaiAkhir || 0).toFixed(2)}
          </Text>
          <Badge
            variant="filled"
            className="bg-gs-primary"
            size="sm"
            radius="sm"
            fw={700}
          >
            {row.nilaiHuruf}
          </Badge>
        </Group>
      ),
    },
    {
      header: "Hasil",
      render: (row) => (
        <Badge
          variant="outline"
          color={
            row.hasil === "lulus" ? "var(--gs-success)" : "var(--gs-danger)"
          }
          fw={700}
        >
          {row.hasil?.toUpperCase() || "TIDAK LULUS"}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Tooltip label="Lihat Detail">
          <ActionIcon
            variant="subtle"
            color="var(--gs-primary)"
            onClick={() => {
              setSelectedItem(row);
              openDetail();
            }}
            radius="md"
          >
            <IconEye size={18} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      ),
    },
  ];

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Rekapitulasi Nilai Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Rekapitulasi Nilai" },
        ]}
        description="Daftar nilai ujian mahasiswa yang sudah difinalisasi oleh Ketua Penguji"
        icon={IconFileText}
      />

      <DataTable
        title="Daftar Nilai Final"
        data={ujianList}
        columns={columns}
        loading={isLoading}
        error={isError ? "Gagal memuat rekapitulasi nilai." : undefined}
        emptyState={
          <Center py={50}>
            <Text c="dimmed">Belum ada nilai ujian yang difinalisasi.</Text>
          </Center>
        }
      />

      <Modal
        opened={detailOpened}
        onClose={closeDetail}
        title={
          <Text
            fw={800}
            size="lg"
            className="text-gs-text-primary tracking-tight"
          >
            DETAIL INFORMASI NILAI
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
        {selectedItem && (
          <Stack gap="md">
            <Paper
              p="xl"
              withBorder
              radius="lg"
              bg={
                selectedItem.hasil === "lulus"
                  ? "var(--gs-success-bg)"
                  : "var(--gs-danger-bg)"
              }
              style={{
                borderColor:
                  selectedItem.hasil === "lulus"
                    ? "var(--gs-success-border)"
                    : "var(--gs-danger-border)",
              }}
            >
              <Group justify="space-between" align="center">
                <Group gap="lg">
                  <Box
                    ta="center"
                    px="md"
                    style={{ borderRight: "2px solid var(--gs-border)" }}
                  >
                    <Text
                      size="10px"
                      fw={700}
                      tt="uppercase"
                      className={
                        selectedItem.hasil === "lulus"
                          ? "text-gs-success-text"
                          : "text-gs-danger-text"
                      }
                    >
                      Nilai Akhir
                    </Text>
                    <Group
                      gap="xs"
                      align="baseline"
                      justify="center"
                      wrap="nowrap"
                    >
                      <Title
                        order={2}
                        className={
                          selectedItem.hasil === "lulus"
                            ? "text-gs-success-text"
                            : "text-gs-danger-text"
                        }
                        fw={800}
                      >
                        {Number(selectedItem.nilaiAkhir || 0).toFixed(2)}
                      </Title>
                      <Badge
                        size="lg"
                        variant="filled"
                        className={
                          selectedItem.hasil === "lulus"
                            ? "bg-gs-success"
                            : "bg-gs-danger"
                        }
                        radius="sm"
                        fw={700}
                      >
                        {selectedItem.nilaiHuruf}
                      </Badge>
                    </Group>
                  </Box>
                  <Stack gap={0}>
                    <Text
                      fw={800}
                      size="xl"
                      className={
                        selectedItem.hasil === "lulus"
                          ? "text-gs-success-text"
                          : "text-gs-danger-text"
                      }
                    >
                      {selectedItem.hasil === "lulus" ? "LULUS" : "TIDAK LULUS"}
                    </Text>
                    <Text size="xs" className="text-gs-text-secondary" fw={600}>
                      Difinalisasi pada:{" "}
                      {selectedItem.tanggalFinalisasi
                        ? new Date(
                            selectedItem.tanggalFinalisasi,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Text>
                  </Stack>
                </Group>
                <Button
                  variant="filled"
                  className={
                    selectedItem.hasil === "lulus"
                      ? "bg-gs-success hover:bg-gs-success-hover"
                      : "bg-gs-danger hover:bg-gs-danger-hover"
                  }
                  leftSection={<IconPrinter size={18} stroke={2} />}
                  loading={printing}
                  onClick={() => handlePrint(selectedItem.id)}
                  radius="md"
                  fw={700}
                >
                  CETAK BERITA ACARA
                </Button>
              </Group>
            </Paper>

            <Paper
              p="md"
              withBorder
              radius="lg"
              bg="var(--gs-bg-overlay)"
              className="border-gs-border"
            >
              <Grid align="center">
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <Stack gap={0}>
                    <Text size="10px" fw={600} c="dimmed" tt="uppercase" mb={4}>
                      Mahasiswa
                    </Text>
                    <Text fw={700} size="lg" className="text-gs-text-primary">
                      {selectedItem.pendaftaranUjian.mahasiswa.user.nama}
                    </Text>
                    <Text size="sm" c="dimmed" fw={500}>
                      {selectedItem.pendaftaranUjian.mahasiswa.nim}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col
                  span={{ base: 12, sm: 4 }}
                  style={{ textAlign: "right" }}
                >
                  <Stack gap={4} align="flex-end">
                    <Text
                      size="10px"
                      fw={700}
                      c="dimmed"
                      tt="uppercase"
                      lts={0.5}
                    >
                      Jenis Ujian
                    </Text>
                    <Badge
                      variant="outline"
                      color="var(--gs-primary)"
                      size="lg"
                      radius="sm"
                      fw={700}
                    >
                      {selectedItem.pendaftaranUjian.jenisUjian.namaJenis}
                    </Badge>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            <Paper p="md" withBorder radius="md">
              <Stack gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  DETAIL PENILAIAN PER KOMPONEN
                </Text>

                <Box style={{ overflowX: "auto" }}>
                  <Table
                    variant="unstyled"
                    verticalSpacing="xs"
                    withTableBorder
                    withColumnBorders
                    style={{ borderRadius: "8px", overflow: "hidden" }}
                  >
                    <Table.Thead bg="var(--gs-bg-overlay)">
                      <Table.Tr>
                        <Table.Th style={{ fontSize: "10px" }}>
                          KOMPONEN
                        </Table.Th>
                        {/* Identify all examiners who gave scores */}
                        {Array.from(
                          new Set(
                            selectedItem.penilaians.map((p) => p.dosenId),
                          ),
                        ).map((dId, i) => {
                          const pScore = selectedItem.penilaians.find(
                            (s) => s.dosenId === dId,
                          );
                          return (
                            <Table.Th
                              key={i}
                              ta="center"
                              style={{ fontSize: "10px" }}
                            >
                              {pScore?.dosen.user.nama}
                            </Table.Th>
                          );
                        })}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {/* Group by kriteria */}
                      {Array.from(
                        new Set(
                          selectedItem.penilaians.map(
                            (p) => p.komponenPenilaian.kriteria,
                          ),
                        ),
                      ).map((kriteria, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td
                            style={{ fontSize: "11px", fontWeight: 600 }}
                          >
                            {kriteria}
                          </Table.Td>
                          {Array.from(
                            new Set(
                              selectedItem.penilaians.map((p) => p.dosenId),
                            ),
                          ).map((dId, pIdx) => {
                            const score = selectedItem.penilaians.find(
                              (s) =>
                                s.komponenPenilaian.kriteria === kriteria &&
                                s.dosenId === dId,
                            );
                            const isBimbingan = kriteria === "Bimbingan";

                            return (
                              <Table.Td
                                key={pIdx}
                                ta="center"
                                style={{ fontSize: "11px" }}
                              >
                                {score &&
                                !(
                                  isBimbingan &&
                                  !score.komponenPenilaian.bobotKomponenPerans.some(
                                    (b) =>
                                      b.bobot > 0 &&
                                      (b.peran === "ketua_penguji" ||
                                        b.peran === "sekretaris_penguji"),
                                  )
                                )
                                  ? score.nilai
                                  : "-"}
                              </Table.Td>
                            );
                          })}
                        </Table.Tr>
                      ))}
                      {/* Subtotal row */}
                      <Table.Tr bg="var(--gs-bg-overlay)">
                        <Table.Td style={{ fontSize: "11px", fontWeight: 800 }}>
                          RATA-RATA
                        </Table.Td>
                        {Array.from(
                          new Set(
                            selectedItem.penilaians.map((p) => p.dosenId),
                          ),
                        ).map((dId, pIdx) => {
                          const examinerScores = selectedItem.penilaians.filter(
                            (s) => s.dosenId === dId,
                          );
                          const avg =
                            examinerScores.reduce(
                              (acc, curr) => acc + Number(curr.nilai || 0),
                              0,
                            ) / (examinerScores.length || 1);
                          return (
                            <Table.Td
                              key={pIdx}
                              ta="center"
                              style={{ fontSize: "11px", fontWeight: 800 }}
                            >
                              {avg.toFixed(2)}
                            </Table.Td>
                          );
                        })}
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Box>
              </Stack>
            </Paper>

            {/* Catatan */}
            {(selectedItem.catatan || selectedItem.catatanRevisi) && (
              <Paper withBorder radius="md" p="md" mt="md">
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
                {selectedItem.catatan && (
                  <Box mb="xs">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      Catatan Penjadwalan:
                    </Text>
                    <Text size="sm" lh={1.4}>
                      {selectedItem.catatan}
                    </Text>
                  </Box>
                )}
                {selectedItem.catatanRevisi && (
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      Catatan Revisi Penguji:
                    </Text>
                    <Text size="sm" lh={1.4}>
                      {selectedItem.catatanRevisi}
                    </Text>
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
