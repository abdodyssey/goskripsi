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
        px="md"
        py="sm"
        bg={isSelesai ? "teal.0" : isFinalized ? "blue.0" : "indigo.0"}
      >
        <Stack gap={0}>
          <Text
            fw={800}
            size="lg"
            c={isSelesai ? "teal.9" : isFinalized ? "blue.9" : "indigo.9"}
            tt="uppercase"
            lts={0.5}
          >
            {ujian.pendaftaranUjian.jenisUjian.namaJenis}
          </Text>
          {ujian.pendaftaranUjian.mahasiswa && (
            <Text size="xs" c="dimmed" fw={600}>
              {ujian.pendaftaranUjian.mahasiswa.user.nama} ({ujian.pendaftaranUjian.mahasiswa.nim})
            </Text>
          )}
        </Stack>
        <Badge
          size="sm"
          variant="filled"
          color={isSelesai ? "teal" : isFinalized ? "blue" : "indigo"}
          radius="sm"
        >
          {isSelesai ? "FINISHED" : isFinalized ? "FINALIZED" : "UPCOMING"}
        </Badge>
      </Group>

      {showResults && (
        <Paper
          p="md"
          bg={isSelesai ? "teal.0" : "blue.0"}
          mx="md"
          my="sm"
          radius="md"
          withBorder
          style={{
            borderColor: isSelesai
              ? "var(--mantine-color-teal-2)"
              : "var(--mantine-color-blue-2)",
          }}
        >
          <Grid align="center" gutter="md">
            <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
              <Text size="10px" tt="uppercase" fw={800} c="dimmed">
                Nilai Akhir
              </Text>
              <Text fw={900} fz="xl" c={isSelesai ? "teal.9" : "blue.9"}>
                {Number(ujian.nilaiAkhir)?.toFixed(2) || "-"}
              </Text>
            </Grid.Col>
            {isFinalized && (
              <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
                <Text size="10px" tt="uppercase" fw={800} c="dimmed">
                  Nilai Huruf
                </Text>
                <Text fw={900} fz="xl" c={isSelesai ? "teal.9" : "blue.9"}>
                  {ujian.nilaiHuruf || "-"}
                </Text>
              </Grid.Col>
            )}
            <Grid.Col span={{ base: 4, sm: 3 }} ta="center">
              <Text size="10px" tt="uppercase" fw={800} c="dimmed" mb={2}>
                Hasil Kelulusan
              </Text>
              {!isSelesai ? (
                <Badge size="xs" color="blue" variant="outline">
                  PENDING
                </Badge>
              ) : (
                <Badge
                  size="sm"
                  color={ujian.hasil === "lulus" ? "green" : "red"}
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
            <Text fw={800} size="xs" tt="uppercase" lts={1}>
              Informasi Penelitian
            </Text>
          </Group>
          <Paper withBorder p="sm" radius="md" bg="gray.0">
            <Text fw={600} size="sm" style={{ fontStyle: "italic" }}>
              &quot;
              {ujian.pendaftaranUjian.rancanganPenelitian.judulPenelitian}
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
                  <Text size="10px" tt="uppercase" fw={800} c="dimmed">
                    Tanggal & Hari
                  </Text>
                  <Text fw={700} size="sm">
                    {ujian.hariUjian},{" "}
                    {new Date(ujian.jadwalUjian).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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
                  <Text size="10px" tt="uppercase" fw={800} c="dimmed">
                    Waktu
                  </Text>
                  <Text fw={700} size="sm">
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
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <IconMapPin size={16} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="10px" tt="uppercase" fw={800} c="dimmed">
                    Ruangan
                  </Text>
                  <Text fw={700} size="sm">{ujian.ruangan.namaRuangan}</Text>
                </Stack>
              </Group>
            </Grid.Col>
          </Grid>
        </section>

        <Divider variant="dashed" />

        <section>
          <Group gap={6} mb={8}>
            <IconUsers size={16} color="var(--mantine-color-indigo-6)" />
            <Text fw={800} size="xs" tt="uppercase" lts={1}>
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
                        fw={800}
                        c="dimmed"
                      >
                        {PERAN_MAP[p.peran] || p.peran}
                      </Text>
                      <Text fw={700} size="xs">
                        {p.dosen?.user?.nama ||
                          p.dosen?.nama ||
                          "Sedang ditentukan"}
                      </Text>
                    </Stack>
                    {isFinalized && p.average !== null && (
                      <Stack gap={0} align="flex-end">
                        <Text fw={900} c="indigo" fz="sm">
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
          color="indigo"
          icon={<IconInfoCircle size={14} />}
          radius="md"
          py="xs"
        >
          <Text size="xs" fw={500}>
            Peserta diharuskan hadir paling lambat 1 jam sebelum jadwal ujian. Hubungi pembimbing untuk teknis lebih lanjut.
          </Text>
        </Alert>
      </Stack>
    </Paper>
  );
}
