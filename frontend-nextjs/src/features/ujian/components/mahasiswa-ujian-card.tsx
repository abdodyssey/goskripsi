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

interface Ujian {
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

export function MahasiswaUjianCard({ ujian }: { ujian: Ujian | null }) {
  if (!ujian) {
    return (
      <Paper withBorder radius="md" p="xl" bg="gray.0">
        <Stack align="center" gap="xs">
          <ThemeIcon size={50} radius="xl" color="gray" variant="light">
            <IconCalendar size={30} />
          </ThemeIcon>
          <Text fw={700} size="lg">
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
  const showResults = isFinalized || !!ujian.nilaiAkhir;

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
        p="md"
        bg={isSelesai ? "teal.0" : isFinalized ? "blue.0" : "indigo.0"}
      >
        <Stack gap={0}>
          <Text
            fw={700}
            size="xl"
            c={isSelesai ? "teal.9" : isFinalized ? "blue.9" : "indigo.9"}
          >
            {ujian.pendaftaranUjian.jenisUjian.namaJenis}
          </Text>
          {ujian.pendaftaranUjian.mahasiswa && (
            <Text size="sm" c="dimmed" fw={500}>
              {ujian.pendaftaranUjian.mahasiswa.user.nama} (
              {ujian.pendaftaranUjian.mahasiswa.nim})
            </Text>
          )}
          <Text
            size="xs"
            c={isSelesai ? "teal.7" : isFinalized ? "blue.7" : "indigo.7"}
            fw={500}
            mt={4}
          >
            Status:{" "}
            {isSelesai
              ? "Selesai"
              : isFinalized
                ? "Nilai Difinalisasi"
                : "Dijadwalkan"}
          </Text>
        </Stack>
        <Badge
          size="lg"
          variant="filled"
          color={isSelesai ? "teal" : isFinalized ? "blue" : "indigo"}
        >
          {isSelesai ? "FINISHED" : isFinalized ? "FINALIZED" : "UPCOMING"}
        </Badge>
      </Group>

      {showResults && (
        <Paper
          p="xl"
          bg={isSelesai ? "teal.0" : "blue.0"}
          m="md"
          radius="md"
          withBorder
          style={{
            borderColor: isSelesai
              ? "var(--mantine-color-teal-2)"
              : "var(--mantine-color-blue-2)",
          }}
        >
          <Grid align="center" gutter="xl">
            <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
              <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                Nilai Akhir
              </Text>
              <Title order={2} c={isSelesai ? "teal.9" : "blue.9"}>
                {Number(ujian.nilaiAkhir)?.toFixed(2) || "-"}
              </Title>
            </Grid.Col>
            {isFinalized && (
              <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
                <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                  Nilai Huruf
                </Text>
                <Title order={2} c={isSelesai ? "teal.9" : "blue.9"}>
                  {ujian.nilaiHuruf || "-"}
                </Title>
              </Grid.Col>
            )}
            <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
              <Text size="xs" tt="uppercase" fw={800} c="dimmed" mb={4}>
                Hasil Kelulusan
              </Text>
              {!isSelesai ? (
                <Badge size="xl" color="blue" variant="outline">
                  MENUNGGU KEPUTUSAN
                </Badge>
              ) : (
                <Badge
                  size="xl"
                  color={ujian.hasil === "lulus" ? "green" : "red"}
                >
                  {(ujian.hasil || "TIDAK LULUS").toUpperCase()}
                </Badge>
              )}
            </Grid.Col>
          </Grid>

          {ujian.catatanRevisi && (
            <Stack mt="xl">
              <Divider label="Catatan Revisi" labelPosition="center" />
              <Box bg="white" p="md" style={{ borderRadius: "8px" }}>
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {ujian.catatanRevisi}
                </Text>
              </Box>
            </Stack>
          )}
        </Paper>
      )}

      <Stack p="xl" gap="xl">
        <section>
          <Group gap="xs" mb="md">
            <IconInfoCircle size={20} color="var(--mantine-color-indigo-6)" />
            <Text fw={700} size="lg">
              Informasi Penelitian
            </Text>
          </Group>
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="xs" tt="uppercase" fw={800} c="dimmed" lts={1}>
              Judul Penelitian
            </Text>
            <Text fw={600} size="md" mt={4} style={{ fontStyle: "italic" }}>
              &quot;
              {ujian.pendaftaranUjian.rancanganPenelitian.judulPenelitian}
              &quot;
            </Text>
          </Paper>
        </section>

        <Divider />

        <section>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Group gap="sm">
                <ThemeIcon size="lg" radius="md" color="teal" variant="light">
                  <IconCalendar size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                    Tanggal & Hari
                  </Text>
                  <Text fw={700}>
                    {ujian.hariUjian},{" "}
                    {new Date(ujian.jadwalUjian).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Group gap="sm">
                <ThemeIcon size="lg" radius="md" color="orange" variant="light">
                  <IconClock size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                    Waktu
                  </Text>
                  <Text fw={700}>
                    {new Date(ujian.waktuMulai).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(ujian.waktuSelesai).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Group gap="sm">
                <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                  <IconMapPin size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                    Ruangan
                  </Text>
                  <Text fw={700}>{ujian.ruangan.namaRuangan}</Text>
                </Stack>
              </Group>
            </Grid.Col>
          </Grid>
        </section>

        <Divider />

        <section>
          <Group gap="xs" mb="md">
            <IconUsers size={20} color="var(--mantine-color-indigo-6)" />
            <Text fw={700} size="lg">
              Dewan Penguji
            </Text>
          </Group>
          <Grid gutter="md">
            {scoresPerExaminer.map((p, idx) => (
              <Grid.Col span={{ base: 12, sm: 6 }} key={idx}>
                <Paper p="sm" withBorder radius="md">
                  <Group
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <Stack gap={2}>
                      <Text
                        size="xs"
                        tt="uppercase"
                        fw={800}
                        c="dimmed"
                        lts={0.5}
                      >
                        {PERAN_MAP[p.peran] || p.peran}
                      </Text>
                      <Text fw={600}>
                        {p.dosen?.user?.nama ||
                          p.dosen?.nama ||
                          "Sedang ditentukan"}
                      </Text>
                    </Stack>
                    {isFinalized && p.average !== null && (
                      <Stack gap={0} align="flex-end">
                        <Text size="xs" c="dimmed" fw={700}>
                          SKOR
                        </Text>
                        <Text fw={800} c="indigo" fz="lg">
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
          color="blue"
          title="Instruksi Teknis"
          icon={<IconInfoCircle size={16} />}
          radius="md"
        >
          <Text size="sm">
            Untuk teknis ujian silahkan hubungi pembimbing masing-masing.
            Peserta diharuskan hadir paling lambat 1 jam sebelum jadwal ujian.
          </Text>
        </Alert>
      </Stack>
    </Paper>
  );
}
