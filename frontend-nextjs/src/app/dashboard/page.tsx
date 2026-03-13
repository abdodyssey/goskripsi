"use client";

import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useMahasiswa,
  useDosens,
} from "@/features/mahasiswa/hooks/use-mahasiswa";
import {
  useAllPengajuan,
  useRanpelByMahasiswa,
} from "@/features/ranpel/hooks/use-ranpel";
import { useAllPendaftaranUjian } from "@/features/pendaftaran-ujian/hooks/use-pendaftaran-ujian";
import { useUjian } from "@/features/ujian/hooks/use-ujian";
import { BarChart } from "@mantine/charts";
import { Mahasiswa } from "@/types/user.type";
import {
  Container,
  Title,
  Stack,
  Divider,
  Group,
  Text,
  Box,
  SimpleGrid,
  ThemeIcon,
  Badge,
  Button,
  Paper,
  Avatar,
  Grid,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconUsers,
  IconUserCheck,
  IconClipboardCheck,
  IconCheck,
  IconFileText,
  IconEdit,
  IconTrendingUp,
  IconArrowRight,
  IconLayoutDashboard,
  IconCalendar,
  IconBooks,
} from "@tabler/icons-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";

interface RanpelSubmission {
  id: string | number;
  status: string;
  tanggalPengajuan?: string;
  createdAt?: string;
  statusKaprodi?: string;
  mahasiswa?: {
    nama?: string;
    nim?: string;
  };
  rancanganPenelitian?: {
    judulPenelitian?: string;
  };
  ranpel?: {
    judul_penelitian: string;
  };
}

interface PendaftaranUjian {
  id: string | number;
  status: string;
  mahasiswa?: {
    nama: string;
    nim: string;
  };
  jenisUjian?: {
    namaJenis: string;
  };
}

interface Ujian {
  id: string | number;
  tanggalUjian: string;
  jamMulai: string;
  pendaftaranUjian: PendaftaranUjian;
  nilaiDifinalisasi?: boolean;
}

// --- Sub-components for better organization ---

function HeroSection({ name, roles }: { name: string; roles: string[] }) {
  const primaryRole = (roles[roles.length - 1] || "User").toUpperCase();

  return (
    <Paper
      radius="lg"
      p={{ base: "xl", sm: "xl" }}
      mb="xl"
      bg="indigo.9"
      c="white"
      shadow="none"
      style={{
        backgroundImage:
          "linear-gradient(135deg, var(--mantine-color-indigo-9) 0%, var(--mantine-color-indigo-7) 100%)",
      }}
    >
      <Stack gap={4}>
        <Badge variant="white" color="indigo" radius="md" size="xs" px={8}>
          {primaryRole} DASHBOARD
        </Badge>
        <Title order={1} fw={900} fz={{ base: 22, sm: 28 }}>
          Selamat datang, {name}.
        </Title>
        <Text size="sm" style={{ opacity: 0.8, maxWidth: 500 }}>
          Kelola rancangan penelitian, bimbingan, dan administrasi skripsi Anda
          hari ini.
        </Text>
      </Stack>
    </Paper>
  );
}

function SectionTitle({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ElementType;
}) {
  return (
    <Group gap="xs" mb="md">
      <ThemeIcon variant="transparent" color="indigo" size="xs">
        <Icon size={16} />
      </ThemeIcon>
      <Text size="xs" fw={800} tt="uppercase" lts={1} c="slate.4">
        {title}
      </Text>
    </Group>
  );
}

export default function DashboardPage() {
  const { userResponse, isAuthenticated } = useAuth();

  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];

  const mahasiswaData = user; // FlattenedUser contains profile data
  const dosenDataResult = user;

  // Fetch data
  const { mahasiswaList } = useMahasiswa();
  const { data: dosensData } = useDosens();
  const { pengajuanList, isLoading: isLoadingRanpel } = useAllPengajuan();
  const { pendaftaranList, isLoading: isLoadingUjian } =
    useAllPendaftaranUjian();
  const { useAllUjian } = useUjian();
  const { data: allUjianData, isLoading: isLoadingAllUjian } = useAllUjian();
  const { pengajuanList: studentPengajuan } = useRanpelByMahasiswa(
    (mahasiswaData as { id?: string })?.id || "",
  );

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  // Groups students by batch and their progress
  const progressData = useMemo(() => {
    const data: Record<
      string,
      { total: number; proposal: number; hasil: number; skripsi: number }
    > = {};
    const nimToAngkatan: Record<string, string> = {};

    if (Array.isArray(mahasiswaList)) {
      (mahasiswaList as Mahasiswa[]).forEach((m) => {
        const batch = m.angkatan || "Lainnya";
        if (m.nim) nimToAngkatan[m.nim] = batch;

        if (!data[batch]) {
          data[batch] = { total: 0, proposal: 0, hasil: 0, skripsi: 0 };
        }
        data[batch].total++;
      });
    }

    if (Array.isArray(pendaftaranList)) {
      (pendaftaranList as unknown as PendaftaranUjian[]).forEach((p) => {
        const nim = p.mahasiswa?.nim;
        const batch = nim ? nimToAngkatan[nim] : null;

        if (batch && data[batch] && p.status === "diterima") {
          const jenis = (p.jenisUjian?.namaJenis || "").toLowerCase();
          if (jenis.includes("proposal")) {
            data[batch].proposal++;
          } else if (jenis.includes("ujian hasil") || jenis.includes("hasil")) {
            data[batch].hasil++;
          } else if (
            jenis.includes("ujian skripsi") ||
            jenis.includes("sidang") ||
            jenis.includes("munaqasyah")
          ) {
            data[batch].skripsi++;
          }
        }
      });
    }

    return Object.entries(data)
      .map(([angkatan, counts]) => ({
        angkatan: `Angkatan ${angkatan}`,
        ...counts,
      }))
      .sort((a, b) => a.angkatan.localeCompare(b.angkatan));
  }, [mahasiswaList, pendaftaranList]);

  if (!isAuthenticated || !userResponse || !user) return null;

  const isMahasiswa = roles.includes("mahasiswa");
  const isDosen = roles.includes("dosen");
  const isKaprodi = roles.includes("kaprodi");
  const isSekprodi = roles.includes("sekprodi");
  const isAdminProdi = roles.includes("admin_prodi");

  // Calculate Kaprodi Stats
  const totalMahasiswa = Array.isArray(mahasiswaList)
    ? mahasiswaList.length
    : 0;
  const totalDosen = (dosensData?.data as unknown[])?.length || 0;

  const pengajuanArray = (pengajuanList as unknown as RanpelSubmission[]) || [];
  const ranpelDiterimaCount = pengajuanArray.filter(
    (p) => p.status === "diterima",
  ).length;
  const ranpelDiverifikasiCount = pengajuanArray.filter(
    (p) => p.status === "diverifikasi" || p.status === "menunggu",
  ).length;

  const latestRanpels = [...pengajuanArray]
    .sort(
      (a, b) =>
        new Date(b.tanggalPengajuan || b.createdAt || 0).getTime() -
        new Date(a.tanggalPengajuan || a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  const pendaftaranArray =
    (pendaftaranList as unknown as PendaftaranUjian[]) || [];

  const countByJenis = (name: string) => {
    return pendaftaranArray.filter(
      (p) =>
        p.jenisUjian?.namaJenis?.toLowerCase().includes(name.toLowerCase()) &&
        (p.status === "menunggu" ||
          p.status === "diterima" ||
          p.status === "revisi"),
    ).length;
  };

  const statsUjian = {
    proposal: countByJenis("proposal"),
    ujianHasil: countByJenis("ujian hasil") || countByJenis("hasil"),
    ujianSkripsi:
      countByJenis("ujian skripsi") ||
      countByJenis("sidang") ||
      countByJenis("munaqasyah"),
  };

  const upcomingUjians = (allUjianData?.data as Ujian[])
    ?.filter((u) => new Date(u.tanggalUjian) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.tanggalUjian).getTime() - new Date(b.tanggalUjian).getTime(),
    )
    .slice(0, 5);

  const latestRanpel =
    studentPengajuan &&
    Array.isArray(studentPengajuan) &&
    studentPengajuan.length > 0
      ? (studentPengajuan[0] as unknown as RanpelSubmission)
      : null;

  const finalizedUjianCount = (allUjianData?.data as Ujian[])?.filter(
    (u) => u.nilaiDifinalisasi,
  ).length;

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Dashboard Overview"
        items={[{ label: "Dashboard" }]}
        description="Pantau ringkasan aktivitas dan status akademik Anda di sini."
        icon={IconLayoutDashboard}
      />
      <HeroSection name={user.nama} roles={roles} />

      <Stack gap="xl">
        {/* Kaprodi Section */}
        {isKaprodi && (
          <Box>
            {/* Overview Section */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
              <StatCard
                title="Total Mahasiswa"
                value={totalMahasiswa}
                icon={IconUsers}
                color="indigo"
              />
              <StatCard
                title="Total Dosen"
                value={totalDosen}
                icon={IconUserCheck}
                color="blue"
              />
            </SimpleGrid>

            {progressData.length > 0 && (
              <Paper withBorder radius="lg" p="xl" mb="xl">
                <SectionTitle
                  title="Sebaran Progres Mahasiswa per Angkatan"
                  icon={IconUsers}
                />
                <Box h={400} mt="lg">
                  <BarChart
                    h={400}
                    data={progressData}
                    dataKey="angkatan"
                    series={[
                      {
                        name: "total",
                        label: "Total Mahasiswa",
                        color: "gray.5",
                      },
                      {
                        name: "proposal",
                        label: "Lulus Proposal",
                        color: "blue.5",
                      },
                      {
                        name: "hasil",
                        label: "Lulus Hasil",
                        color: "teal.5",
                      },
                      {
                        name: "skripsi",
                        label: "Lulus Skripsi",
                        color: "indigo.6",
                      },
                    ]}
                    tickLine="y"
                    gridAxis="xy"
                    withTooltip
                    valueFormatter={(value) => `${value} Mahasiswa`}
                    legendProps={{ verticalAlign: "bottom", height: 50 }}
                  />
                </Box>
              </Paper>
            )}

            <Grid gutter="xl">
              {/* Group 1: Rancangan Penelitian */}
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <SectionTitle
                  title="Rancangan Penelitian"
                  icon={IconClipboardCheck}
                />
                <Stack gap="md" mt="xs">
                  <SimpleGrid cols={2} spacing="md">
                    <Paper p="md" withBorder radius="md">
                      <Group justify="space-between">
                        <Stack gap={2}>
                          <Text size="xs" fw={700} c="dimmed">
                            MENUNGGU VERIFIKASI
                          </Text>
                          <Text fw={900} fz="xl">
                            {ranpelDiverifikasiCount}
                          </Text>
                        </Stack>
                        <ThemeIcon color="orange" variant="light" size="xl">
                          <IconClipboardCheck size={24} />
                        </ThemeIcon>
                      </Group>
                    </Paper>
                    <Paper p="md" withBorder radius="md">
                      <Group justify="space-between">
                        <Stack gap={2}>
                          <Text size="xs" fw={700} c="dimmed">
                            TELAH DISETUJUI
                          </Text>
                          <Text fw={900} fz="xl">
                            {ranpelDiterimaCount}
                          </Text>
                        </Stack>
                        <ThemeIcon color="teal" variant="light" size="xl">
                          <IconCheck size={24} />
                        </ThemeIcon>
                      </Group>
                    </Paper>
                  </SimpleGrid>

                  <Paper
                    withBorder
                    radius="lg"
                    p={0}
                    style={{ overflow: "hidden" }}
                  >
                    <Group
                      justify="space-between"
                      px="md"
                      py="xs"
                      bg="light-dark(gray.0, dark.7)"
                    >
                      <Text size="xs" fw={800} tt="uppercase" opacity={0.6}>
                        Pengajuan Terbaru
                      </Text>
                      <Button
                        component={Link}
                        href="/dashboard/manajemen-ranpel"
                        variant="subtle"
                        size="compact-xs"
                        rightSection={<IconArrowRight size={12} />}
                      >
                        Lihat Semua
                      </Button>
                    </Group>
                    <DataTable
                      data={latestRanpels}
                      loading={isLoadingRanpel}
                      columns={[
                        {
                          header: "Mahasiswa",
                          render: (row: RanpelSubmission) => (
                            <Group gap="xs" wrap="nowrap">
                              <Avatar size="sm" radius="xl" color="indigo">
                                {row.mahasiswa?.nama?.charAt(0)}
                              </Avatar>
                              <Stack gap={0}>
                                <Text size="xs" fw={700} truncate>
                                  {row.mahasiswa?.nama || "-"}
                                </Text>
                                <Text size="10px" c="dimmed">
                                  {row.mahasiswa?.nim || "-"}
                                </Text>
                              </Stack>
                            </Group>
                          ),
                        },
                        {
                          header: "Judul",
                          render: (row: RanpelSubmission) => (
                            <Text size="xs" fw={500} lineClamp={1}>
                              {row.rancanganPenelitian?.judulPenelitian || "-"}
                            </Text>
                          ),
                        },
                        {
                          header: "Status",
                          render: (row: RanpelSubmission) => (
                            <StatusBadge
                              status={row.statusKaprodi || row.status}
                              size="xs"
                            />
                          ),
                        },
                      ]}
                    />
                  </Paper>
                </Stack>
              </Grid.Col>

              {/* Group 2: Administrasi Ujian & Quick Actions */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Stack gap="lg">
                  <Box>
                    <SectionTitle title="Administrasi Ujian" icon={IconBooks} />
                    <Paper p="md" withBorder radius="lg" mt="xs">
                      <Stack gap="sm">
                        {[
                          {
                            label: "SEMINAR PROPOSAL",
                            value: statsUjian.proposal,
                            color: "blue",
                          },
                          {
                            label: "UJIAN HASIL",
                            value: statsUjian.ujianHasil,
                            color: "teal",
                          },
                          {
                            label: "UJIAN SKRIPSI",
                            value: statsUjian.ujianSkripsi,
                            color: "indigo",
                          },
                        ].map((stat) => (
                          <Group key={stat.label} justify="space-between">
                            <Text size="xs" fw={800} c="dimmed">
                              {stat.label}
                            </Text>
                            <Badge color={stat.color} variant="light" size="sm">
                              {isLoadingUjian ? "..." : stat.value} Mahasiswa
                            </Badge>
                          </Group>
                        ))}
                      </Stack>
                    </Paper>
                  </Box>

                  <Box>
                    <SectionTitle
                      title="Jadwal Ujian Terdekat"
                      icon={IconCalendar}
                    />
                    <Paper p="md" withBorder radius="lg" mt="xs">
                      {isLoadingAllUjian ? (
                        <Text size="xs" c="dimmed">
                          Memuat jadwal...
                        </Text>
                      ) : upcomingUjians?.length > 0 ? (
                        <Stack gap="xs">
                          {upcomingUjians.map((u) => (
                            <Box
                              key={u.id}
                              style={{
                                borderBottom:
                                  "1px solid var(--mantine-color-default-border)",
                                paddingBottom: 8,
                              }}
                            >
                              <Group justify="space-between" wrap="nowrap">
                                <Stack gap={0} style={{ flex: 1 }}>
                                  <Text size="xs" fw={700} lineClamp={1}>
                                    {u.pendaftaranUjian?.mahasiswa?.nama}
                                  </Text>
                                  <Text size="10px" c="dimmed">
                                    {u.pendaftaranUjian?.jenisUjian?.namaJenis}
                                  </Text>
                                </Stack>
                                <Stack gap={0} align="end">
                                  <Text size="10px" fw={700}>
                                    {new Date(
                                      u.tanggalUjian,
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </Text>
                                  <Text size="10px" c="dimmed">
                                    {u.jamMulai} WITA
                                  </Text>
                                </Stack>
                              </Group>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="xs" c="dimmed">
                          Tidak ada jadwal ujian terdekat.
                        </Text>
                      )}
                    </Paper>
                  </Box>

                  <Box>
                    <SectionTitle title="Akses Cepat" icon={IconTrendingUp} />
                    <Stack gap="xs" mt="xs">
                      <Button
                        component={Link}
                        href="/dashboard/manajemen-ranpel"
                        variant="light"
                        color="indigo"
                        radius="md"
                        size="sm"
                        justify="space-between"
                        rightSection={<IconArrowRight size={16} />}
                      >
                        Kelola Ranpel
                      </Button>
                      <Button
                        component={Link}
                        href="/dashboard/rekap-bimbingan"
                        variant="light"
                        color="blue"
                        radius="md"
                        size="sm"
                        justify="space-between"
                        rightSection={<IconArrowRight size={16} />}
                      >
                        Rekap Bimbingan
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Grid.Col>
            </Grid>
          </Box>
        )}

        {/* Admin Prodi Section */}
        {isAdminProdi && (
          <Box>
            <SectionTitle title="Administrasi Program Studi" icon={IconBooks} />
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
              <StatCard
                title="Total Mahasiswa"
                value={totalMahasiswa}
                icon={IconUsers}
                color="indigo"
              />
              <StatCard
                title="Ujian Terjadwal"
                value={
                  pendaftaranArray.filter((p) => p.status === "diterima").length
                }
                icon={IconCalendar}
                color="blue"
              />
              <StatCard
                title="Nilai Final"
                value={finalizedUjianCount}
                icon={IconFileText}
                color="teal"
              />
            </SimpleGrid>

            <Paper p="xl" radius="lg" withBorder>
              <Stack gap="md" align="center" ta="center">
                <ThemeIcon size={60} radius="xl" color="indigo" variant="light">
                  <IconFileText size={32} />
                </ThemeIcon>
                <div>
                  <Title order={3}>Rekapitulasi Nilai</Title>
                  <Text c="dimmed" size="sm" maw={500}>
                    Akses rekapitulasi nilai mahasiswa yang telah difinalisasi
                    untuk keperluan administrasi program studi.
                  </Text>
                </div>
                <Button
                  component={Link}
                  href="/dashboard/rekapitulasi-nilai"
                  variant="filled"
                  color="indigo"
                  size="md"
                  radius="md"
                  rightSection={<IconArrowRight size={18} />}
                >
                  Buka Rekapitulasi Nilai
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Student Section */}
        {isMahasiswa && (
          <Box>
            <SectionTitle title="Progres Skripsi Anda" icon={IconTrendingUp} />
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Paper
                radius="xl"
                p="xl"
                withBorder
                className="hover:bg-gray-50 dark:hover:bg-dark-8 transition-all border-l-4 border-l-indigo-500"
              >
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="md">
                      <ThemeIcon
                        size={52}
                        radius="lg"
                        color="indigo"
                        variant="light"
                      >
                        <IconFileText size={28} />
                      </ThemeIcon>
                      <div>
                        <Text fw={800} fz="xl">
                          Status Ranpel
                        </Text>
                        <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                          Rancangan Penelitian
                        </Text>
                      </div>
                    </Group>
                    {latestRanpel ? (
                      <StatusBadge status={latestRanpel.status} size="lg" />
                    ) : (
                      <Badge variant="dot" color="gray" size="lg">
                        BELUM DIAJUKAN
                      </Badge>
                    )}
                  </Group>

                  <Paper
                    p="lg"
                    radius="lg"
                    bg={
                      isDark
                        ? "var(--mantine-color-slate-9)"
                        : "var(--mantine-color-slate-0)"
                    }
                    style={{
                      border: "1px dashed var(--mantine-color-slate-2)",
                    }}
                    className="min-h-[100px] flex flex-col justify-center"
                  >
                    {latestRanpel?.ranpel?.judul_penelitian ? (
                      <Stack gap={4}>
                        <Text fz={10} fw={800} c="slate.4" tt="uppercase">
                          Judul Terakhir
                        </Text>
                        <Text
                          size="sm"
                          fw={700}
                          lineClamp={2}
                          className="italic"
                          c={isDark ? "white" : "indigo"}
                        >
                          &quot;{latestRanpel.ranpel.judul_penelitian}&quot;
                        </Text>
                      </Stack>
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic" ta="center">
                        Segera ajukan rancangan penelitian Anda untuk memulai
                        proses skripsi.
                      </Text>
                    )}
                  </Paper>

                  <Button
                    component={Link}
                    href="/dashboard/pengajuan-ranpel"
                    variant="light"
                    color="indigo"
                    fullWidth
                    size="md"
                    radius="md"
                    rightSection={<IconArrowRight size={18} />}
                  >
                    {latestRanpel
                      ? "Lihat Detail Pengajuan"
                      : "Buat Pengajuan Baru"}
                  </Button>
                </Stack>
              </Paper>

              {/* Next Phase Placeholder */}
              <Paper
                radius="xl"
                p="xl"
                withBorder
                bg="light-dark(var(--mantine-color-slate-0), rgba(15, 23, 42, 0.2))"
                style={{ opacity: 0.8 }}
              >
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon
                      size={52}
                      radius="lg"
                      color="slate"
                      variant="light"
                    >
                      <IconClipboardCheck size={28} />
                    </ThemeIcon>
                    <div>
                      <Text fw={800} fz="xl" c="dimmed">
                        Pendaftaran Ujian
                      </Text>
                      <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                        Tahap Selanjutnya
                      </Text>
                    </div>
                  </Group>
                  <Paper
                    p="lg"
                    radius="lg"
                    bg={
                      isDark
                        ? "var(--mantine-color-slate-9)"
                        : "var(--mantine-color-slate-0)"
                    }
                    style={{
                      border: "1px dashed var(--mantine-color-slate-2)",
                    }}
                    className="min-h-[100px] flex flex-col justify-center"
                  >
                    <Text size="sm" c="dimmed" fs="italic" ta="center">
                      Tahap ini akan terbuka setelah Ranpel Anda disetujui.
                    </Text>
                  </Paper>
                  <Button
                    disabled
                    variant="subtle"
                    color="gray"
                    fullWidth
                    size="md"
                    radius="md"
                  >
                    Belum Tersedia
                  </Button>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Box>
        )}

        {/* Dosen Section */}
        {(isDosen || isKaprodi || isSekprodi) && (
          <Box>
            <SectionTitle title="Dashboard Dosen" icon={IconUserCheck} />
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              <Paper
                withBorder
                radius="xl"
                p="xl"
                className="border-l-4 border-l-teal-500"
              >
                <Stack gap="lg" align="center" ta="center">
                  <Avatar
                    size={100}
                    radius="xl"
                    color="indigo"
                    variant="filled"
                  >
                    {user.nama.charAt(0)}
                  </Avatar>
                  <div>
                    <Text fw={900} fz="xl">
                      {user.nama}
                    </Text>
                    <Text size="sm" c="dimmed" fw={500}>
                      NIDN:{" "}
                      {(dosenDataResult as { nidn?: string })?.nidn || "-"}
                    </Text>
                    <Badge variant="light" color="teal" size="sm" mt="xs">
                      DOSEN AKTIF
                    </Badge>
                  </div>
                  <Divider w="100%" />
                  <Button
                    component={Link}
                    href="/dashboard/profile"
                    variant="subtle"
                    color="indigo"
                    size="xs"
                    leftSection={<IconEdit size={14} />}
                  >
                    Edit Profil & Tanda Tangan
                  </Button>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius="xl"
                p="xl"
                className="col-span-1 md:col-span-2"
              >
                <Stack gap="md">
                  <Text fw={800} fz="lg">
                    Menu Utama Pembimbing
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Button
                      component={Link}
                      href="/dashboard/verifikasi-ranpel"
                      variant="light"
                      color="indigo"
                      h={120}
                      radius="lg"
                    >
                      <Stack gap={4} align="center">
                        <ThemeIcon
                          size={34}
                          radius="md"
                          variant="filled"
                          color="indigo"
                        >
                          <IconClipboardCheck size={20} />
                        </ThemeIcon>
                        <Text fw={700}>Verifikasi Ranpel</Text>
                        <Text size="xs" fw={400} c="dimmed">
                          Tinjau rancangan mahasiswa
                        </Text>
                      </Stack>
                    </Button>
                    <Button
                      component={Link}
                      href="/dashboard/mahasiswa-bimbingan"
                      variant="light"
                      color="blue"
                      h={120}
                      radius="lg"
                    >
                      <Stack gap={4} align="center">
                        <ThemeIcon
                          size={34}
                          radius="md"
                          variant="filled"
                          color="blue"
                        >
                          <IconUsers size={20} />
                        </ThemeIcon>
                        <Text fw={700}>Bimbingan Saya</Text>
                        <Text size="xs" fw={400} c="dimmed">
                          Daftar mahasiswa bimbingan
                        </Text>
                      </Stack>
                    </Button>
                  </SimpleGrid>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
