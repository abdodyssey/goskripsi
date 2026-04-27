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
import { useState } from "react";
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
        color: "red",
      });
    } finally {
      setPrinting(false);
    }
  };

  const roles = userResponse?.user?.roles || userResponse?.roles || [];
  const isAdminProdi = roles.includes("admin_prodi");
  const isKaprodi = roles.includes("kaprodi");
  const isSekprodi = roles.includes("sekprodi");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-ujian-finalized"],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: UjianItem[];
        success: boolean;
      }>("/ujian");
      return res.data;
    },
    enabled: isAuthenticated && (isAdminProdi || isKaprodi || isSekprodi),
  });

  if (isLoadingProfile || !isAuthenticated) return null;

  if (!isAdminProdi && !isKaprodi && !isSekprodi) {
    return (
      <Container size="xl" pt="md">
        <Text c="red">Anda tidak memiliki akses ke halaman ini.</Text>
      </Container>
    );
  }

  const ujianList = (data?.data || []).filter((u) => u.nilaiDifinalisasi);

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
          <Text fw={700}>{Number(row.nilaiAkhir || 0).toFixed(2)}</Text>
          <Badge color="indigo" variant="filled" size="sm">
            {row.nilaiHuruf}
          </Badge>
        </Group>
      ),
    },
    {
      header: "Hasil",
      render: (row) => (
        <Badge color={row.hasil === "lulus" ? "teal" : "red"} variant="light">
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
            variant="light"
            color="indigo"
            onClick={() => {
              setSelectedItem(row);
              openDetail();
            }}
          >
            <IconEye size={16} />
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
          <Text fw={700} size="lg">
            Detail Informasi Nilai
          </Text>
        }
        size="xl"
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
          <Stack gap="md">
            <Paper p="md" withBorder radius="md" bg="gray.0">
              <Stack gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Mahasiswa
                </Text>
                <Text fw={600}>
                  {selectedItem.pendaftaranUjian.mahasiswa.user.nama}
                </Text>
                <Text size="xs">
                  {selectedItem.pendaftaranUjian.mahasiswa.nim}
                </Text>
              </Stack>
            </Paper>

            <Paper p="md" withBorder radius="md">
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Jenis Ujian
                  </Text>
                  <Text size="sm">
                    {selectedItem.pendaftaranUjian.jenisUjian.namaJenis}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Tanggal Finalisasi
                  </Text>
                  <Text size="sm">
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
                </Grid.Col>
              </Grid>
            </Paper>

            <Paper p="md" withBorder radius="md">
              <Stack gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Detail Penilaian Per Komponen
                </Text>
                
                <Box style={{ overflowX: 'auto' }}>
                  <Table variant="unstyled" verticalSpacing="xs" withTableBorder withColumnBorders>
                    <Table.Thead bg="gray.0">
                      <Table.Tr>
                        <Table.Th style={{ fontSize: '10px' }}>KOMPONEN</Table.Th>
                        {/* Identify all examiners who gave scores */}
                        {Array.from(new Set(selectedItem.penilaians.map(p => p.dosenId))).map((dId, i) => {
                          const pScore = selectedItem.penilaians.find(s => s.dosenId === dId);
                          return (
                            <Table.Th key={i} ta="center" style={{ fontSize: '10px' }}>
                              {pScore?.dosen.user.nama.split(' ')[0]}
                            </Table.Th>
                          );
                        })}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {/* Group by kriteria */}
                      {Array.from(new Set(selectedItem.penilaians.map(p => p.komponenPenilaian.kriteria))).map((kriteria, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td style={{ fontSize: '11px', fontWeight: 600 }}>{kriteria}</Table.Td>
                          {Array.from(new Set(selectedItem.penilaians.map(p => p.dosenId))).map((dId, pIdx) => {
                            const score = selectedItem.penilaians.find(s => s.komponenPenilaian.kriteria === kriteria && s.dosenId === dId);
                            const isBimbingan = kriteria === "Bimbingan";
                            
                            // Check if this examiner has a non-zero weight for this component
                            // (If weight is 0 or missing, it's likely P1/P2 for Bimbingan)
                            const weightData = score?.komponenPenilaian.bobotKomponenPerans.find(b => b.bobot > 0);
                            const isP1orP2 = score?.komponenPenilaian.bobotKomponenPerans.some(b => 
                              (b.peran === "penguji_1" || b.peran === "penguji_2") && b.bobot === 0
                            );
                            
                            // Simpler check: if it's Bimbingan, only show if weight > 0 for that role
                            // But we don't have the peran directly here easily.
                            // However, we know that in the seed, only Ketua and Sekretaris have weight for Bimbingan.
                            
                            return (
                              <Table.Td key={pIdx} ta="center" style={{ fontSize: '11px' }}>
                                {score && !(isBimbingan && !score.komponenPenilaian.bobotKomponenPerans.some(b => b.bobot > 0 && (b.peran === "ketua_penguji" || b.peran === "sekretaris_penguji")) ) 
                                  ? score.nilai : '-'}
                              </Table.Td>
                            );
                          })}
                        </Table.Tr>
                      ))}
                      {/* Subtotal row */}
                      <Table.Tr bg="blue.0">
                        <Table.Td style={{ fontSize: '11px', fontWeight: 800 }}>RATA-RATA</Table.Td>
                        {Array.from(new Set(selectedItem.penilaians.map(p => p.dosenId))).map((dId, pIdx) => {
                          const examinerScores = selectedItem.penilaians.filter(s => s.dosenId === dId);
                          const avg = examinerScores.reduce((acc, curr) => acc + Number(curr.nilai || 0), 0) / (examinerScores.length || 1);
                          return (
                            <Table.Td key={pIdx} ta="center" style={{ fontSize: '11px', fontWeight: 800 }}>
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

            <Paper
              p="xl"
              withBorder
              radius="lg"
              style={{ textAlign: "center" }}
            >
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">
                Nilai Akhir
              </Text>
              <Title order={1} c="indigo" fz={48}>
                {Number(selectedItem.nilaiAkhir || 0).toFixed(2)}
              </Title>
              <Badge size="xl" variant="filled" color="indigo" mt="sm">
                {selectedItem.nilaiHuruf}
              </Badge>
              <Text
                fw={700}
                c={selectedItem.hasil === "lulus" ? "teal" : "red"}
                mt="md"
                fz="lg"
              >
                {selectedItem.hasil === "lulus" ? "LULUS" : "TIDAK LULUS"}
              </Text>
              <Button
                variant="light"
                color="indigo"
                fullWidth
                leftSection={<IconPrinter size={18} />}
                mt="lg"
                loading={printing}
                onClick={() => handlePrint(selectedItem.id)}
              >
                Cetak Berita Acara
              </Button>
            </Paper>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
