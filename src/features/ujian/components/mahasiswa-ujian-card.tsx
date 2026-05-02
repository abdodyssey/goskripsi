"use client";

import {
  Text,
  Group,
  Stack,
  Badge,
  Divider,
  Grid,
  ThemeIcon,
  Paper,
  Title,
  Box,
  Alert,
} from "@mantine/core";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconInfoCircle,
} from "@tabler/icons-react";

interface Penguji {
  dosenId?: number;
  dosen: { id?: number; user: { nama: string }; nama?: string };
  peran: string;
}

interface Penilaian {
  dosenId: number;
  nilai: number;
  komponenPenilaian: {
    bobotKomponenPerans: { peran: string; bobot: number }[];
  };
}

export interface Ujian {
  id: number;
  jadwalUjian: string;
  waktuMulai: string;
  waktuSelesai: string;
  hariUjian: string;
  status: string;
  nilaiDifinalisasi?: boolean;
  hasil?: string | null;
  nilaiAkhir?: number | null;
  nilaiHuruf?: string | null;
  catatanRevisi?: string | null;
  ruangan: { namaRuangan: string };
  pengujiUjians: Penguji[];
  penilaians?: Penilaian[];
  pendaftaranUjian: {
    jenisUjian: { namaJenis: string };
    rancanganPenelitian: { judulPenelitian: string };
    mahasiswa?: {
      nim: string;
      user: { nama: string };
    };
  };
}

const PERAN_MAP: Record<string, string> = {
  ketua_penguji: "Ketua Penguji",
  sekretaris_penguji: "Sekretaris Penguji",
  penguji_1: "Penguji 1",
  penguji_2: "Penguji 2",
};

export function MahasiswaUjianCard({ ujian, hideResults }: { ujian: Ujian | null, hideResults?: boolean }) {
  if (!ujian) {
    return (
      <Paper withBorder radius="md" p="xl" bg="gray.0">
        <Stack align="center" gap="xs">
          <ThemeIcon size={50} radius="xl" color="gray" variant="light">
            <IconCalendar size={30} />
          </ThemeIcon>
          <Text fw={600} size="lg">
            Jadwal Ujian Belum Ditentukan
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            Jadwal ujian Anda akan muncul di sini setelah diproses oleh
            Sekretaris Prodi. Pastikan pendaftaran ujian Anda sudah disetujui.
          </Text>
        </Stack>
      </Paper>
    );
  }

  const isSelesai = ujian.status === "selesai";
  const isFinalized = ujian.nilaiDifinalisasi || isSelesai;
  const showResults = !hideResults && (isFinalized || !!ujian.nilaiAkhir);

  // Calculate scores per examiner
  const scoresPerExaminer = (ujian.pengujiUjians || []).map((p) => {
    const dId = p.dosenId || p.dosen?.id;
    const examinerPenilaians = (ujian.penilaians || []).filter(
      (pn) => pn.dosenId === dId,
    );

    let sumNilaiBobot = 0;
    let sumBobot = 0;

    examinerPenilaians.forEach((pn) => {
      const bobot =
        pn.komponenPenilaian?.bobotKomponenPerans?.find(
          (b) => b.peran === p.peran,
        )?.bobot || 0;
      sumNilaiBobot += Number(pn.nilai) * bobot;
      sumBobot += bobot;
    });

    const average = sumBobot > 0 ? sumNilaiBobot / sumBobot : null;
    return { ...p, average };
  });

  return (
    <Paper withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
      <Group
        justify="space-between"
        px="md"
        py="sm"
        bg="var(--gs-bg-overlay)"
        style={{ borderBottom: "1px solid var(--gs-border)" }}
      >
        <Stack gap={0}>
          <Text
            fw={800}
            size="lg"
            className="text-gs-text-primary"
            tt="uppercase"
            lts={1}
          >
            {ujian.pendaftaranUjian?.jenisUjian?.namaJenis || "UJIAN"}
          </Text>
          {ujian.pendaftaranUjian?.mahasiswa && (
            <Text size="xs" className="text-gs-text-secondary" fw={600}>
              {ujian.pendaftaranUjian.mahasiswa.user?.nama} ({ujian.pendaftaranUjian.mahasiswa.nim})
            </Text>
          )}
        </Stack>
        <Badge
          size="sm"
          variant="filled"
          className={isSelesai ? "bg-gs-success" : isFinalized ? "bg-gs-primary" : "bg-gs-warning"}
          radius="sm"
          fw={700}
        >
          {isSelesai ? "FINISHED" : isFinalized ? "FINALIZED" : "UPCOMING"}
        </Badge>
      </Group>

      {showResults && (
        <Paper
          p="xl"
          bg={isSelesai ? "var(--gs-success-bg)" : "var(--gs-bg-overlay)"}
          mx="md"
          my="sm"
          radius="lg"
          withBorder
          style={{
            borderColor: isSelesai
              ? "var(--gs-success-border)"
              : "var(--gs-border)",
          }}
        >
          <Grid align="center" gutter="md">
            <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
              <Text size="10px" tt="uppercase" fw={600} c="dimmed">
                Nilai Akhir
              </Text>
              <Text className="gs-stat-number">
                {Number(ujian.nilaiAkhir)?.toFixed(2) || "-"}
              </Text>
            </Grid.Col>
            {isFinalized && (
              <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
                <Text size="10px" tt="uppercase" fw={600} c="dimmed">
                  Nilai Huruf
                </Text>
                <Text className="gs-stat-number">
                  {ujian.nilaiHuruf || "-"}
                </Text>
              </Grid.Col>
            )}
            <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
              <Text size="10px" tt="uppercase" fw={600} c="dimmed" mb={2}>
                Hasil Kelulusan
              </Text>
              {!isSelesai ? (
                <Badge size="xs" variant="outline" color="var(--gs-text-muted)" fw={700}>
                  PENDING
                </Badge>
              ) : (
                <Badge
                  size="sm"
                  variant="filled"
                  className={ujian.hasil === "lulus" ? "bg-gs-success" : "bg-gs-danger"}
                  fw={700}
                  radius="sm"
                >
                  {(ujian.hasil || "TIDAK LULUS").toUpperCase()}
                </Badge>
              )}
            </Grid.Col>
          </Grid>

          {ujian.catatanRevisi && (
            <Stack mt="md" gap="xs">
              <Divider label="Catatan Revisi" labelPosition="center" />
              <Box bg="white" p="sm" style={{ borderRadius: "8px" }}>
                <Text size="xs" style={{ whiteSpace: "pre-wrap" }} fw={500}>
                  {ujian.catatanRevisi}
                </Text>
              </Box>
            </Stack>
          )}
        </Paper>
      )}

      <Stack p="md" gap="md">
        <section>
          <Group gap={6} mb={8}>
            <IconInfoCircle size={16} color="var(--mantine-color-indigo-6)" />
            <Text fw={600} size="xs" tt="uppercase" lts={1}>
              Informasi Penelitian
            </Text>
          </Group>
          <Paper withBorder p="md" radius="lg" bg="var(--gs-bg-overlay)" className="border-gs-border">
            <Text fw={700} size="sm" className="text-gs-text-primary" style={{ fontStyle: "italic" }}>
              &quot;
              {ujian.pendaftaranUjian?.rancanganPenelitian?.judulPenelitian || "Judul tidak tersedia"}
              &quot;
            </Text>
          </Paper>
        </section>

        <Divider variant="dashed" />

        <section>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size="md" radius="md" color="teal" variant="light">
                  <IconCalendar size={16} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="10px" tt="uppercase" fw={600} c="dimmed">
                    Tanggal & Hari
                  </Text>
                  <Text fw={600} size="sm">
                    {ujian.hariUjian},{" "}
                    {ujian.jadwalUjian ? new Date(ujian.jadwalUjian).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }) : "-"}
                  </Text>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size="md" radius="md" color="orange" variant="light">
                  <IconClock size={16} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="10px" tt="uppercase" fw={600} c="dimmed">
                    Waktu
                  </Text>
                  <Text fw={600} size="sm">
                    {ujian.waktuMulai ? new Date(ujian.waktuMulai).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "-"}{" "}
                    -{" "}
                    {ujian.waktuSelesai ? new Date(ujian.waktuSelesai).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "-"}
                  </Text>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <IconMapPin size={16} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="10px" tt="uppercase" fw={600} c="dimmed">
                    Ruangan
                  </Text>
                  <Text fw={600} size="sm">{ujian.ruangan?.namaRuangan || "-"}</Text>
                </Stack>
              </Group>
            </Grid.Col>
          </Grid>
        </section>

        <Divider variant="dashed" />

        <section>
          <Group gap={6} mb={8}>
            <IconUsers size={16} color="var(--mantine-color-indigo-6)" />
            <Text fw={600} size="xs" tt="uppercase" lts={1}>
              Dewan Penguji
            </Text>
          </Group>
          <Grid gutter="xs">
            {scoresPerExaminer.map((p, idx) => (
              <Grid.Col span={{ base: 12, sm: 6 }} key={idx}>
                <Paper p="xs" withBorder radius="md">
                  <Group
                    justify="space-between"
                    align="center"
                    wrap="nowrap"
                  >
                    <Stack gap={0}>
                      <Text
                        size="10px"
                        tt="uppercase"
                        fw={600}
                        c="dimmed"
                      >
                        {PERAN_MAP[p.peran] || p.peran}
                      </Text>
                      <Text fw={600} size="xs">
                        {p.dosen?.user?.nama ||
                          p.dosen?.nama ||
                          "Sedang ditentukan"}
                      </Text>
                    </Stack>
                    {!hideResults && isFinalized && p.average !== null && (
                      <Stack gap={0} align="flex-end">
                        <Text fw={600} c="indigo" fz="sm">
                          {p.average.toFixed(2)}
                        </Text>
                      </Stack>
                    )}
                  </Group>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </section>

        <Alert
          variant="light"
          radius="lg"
          icon={<IconInfoCircle size={14} stroke={2} />}
          py="xs"
          styles={{
            root: { backgroundColor: 'var(--gs-bg-overlay)', border: '1px solid var(--gs-border)' },
            icon: { color: 'var(--gs-primary)' },
            message: { color: 'var(--gs-text-secondary)' }
          }}
        >
          <Text size="xs" fw={700}>
            Peserta diharuskan hadir paling lambat 1 jam sebelum jadwal ujian. Hubungi pembimbing untuk teknis lebih lanjut.
          </Text>
        </Alert>
      </Stack>
    </Paper>
  );
}
