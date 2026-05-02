"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(isBetween);
dayjs.extend(relativeTime);
import {
  useMahasiswa,
  useDosens,
} from "@/features/mahasiswa/hooks/use-mahasiswa";
import {
  useAllPengajuan,
  useRanpelByMahasiswa,
} from "@/features/ranpel/hooks/use-ranpel";
import { 
  useAllPendaftaranUjian, 
  usePendaftaranUjianByMahasiswa 
} from "@/features/pendaftaran-ujian/hooks/use-pendaftaran-ujian";
import { useUjian } from "@/features/ujian/hooks/use-ujian";
import { BarChart, AreaChart, DonutChart } from "@mantine/charts";
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
  Stepper,
  Tooltip,
  SegmentedControl,
  Center,
  Tabs,
  Alert,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconUsers,
  IconUserCheck,
  IconClipboardCheck,
  IconCheck,
  IconFileText,
  IconTrendingUp,
  IconArrowRight,
  IconLayoutDashboard,
  IconCalendar,
  IconBooks,
  IconMail,
  IconAdjustments,
  IconTarget,
  IconCertificate,
  IconClipboardList,
} from "@tabler/icons-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface RanpelSubmission {
  id: string | number;
  status: string;
  tanggalPengajuan?: string;
  createdAt?: string;
  statusKaprodi?: string;
  statusDosenPa?: string;
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
  ujian?: {
    hasil?: string;
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



function SectionTitle({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ElementType;
}) {
  return (
    <Group gap="xs" mb="lg">
      <ThemeIcon variant="light" color="dark" size="md" radius="md" className="bg-gs-primary/5">
        <Icon size={18} className="text-gs-primary" />
      </ThemeIcon>
      <Text size="xs" fw={700} tt="uppercase" lts={1.5} className="text-gs-text-primary">
        {title}
      </Text>
      <Box style={{ flex: 1, height: 1, backgroundColor: "var(--gs-border)", opacity: 0.5 }} />
    </Group>
  );
}

export default function DashboardPage() {
  const { userResponse, isAuthenticated } = useAuth();

  const user = userResponse?.user;
  const roles = useMemo(() => user?.roles || userResponse?.roles || [], [user?.roles, userResponse?.roles]);

  
  // Fetch data
  const { mahasiswaList } = useMahasiswa();
  const { data: dosensData } = useDosens();
  const { pengajuanList, isLoading: isLoadingRanpel } = useAllPengajuan();
  const { pendaftaranList, isLoading: isLoadingUjian } =
    useAllPendaftaranUjian();
  const { useAllUjian } = useUjian();
  const { data: allUjianData, isLoading: isLoadingAllUjian } = useAllUjian();
  const { pengajuanList: studentPengajuan } = useRanpelByMahasiswa(
    (user as { id?: string })?.id || "",
  );
  const { pendaftaranList: studentPendaftaranList } = usePendaftaranUjianByMahasiswa(
    (user as { id?: string })?.id || "",
  );

  const isAdmin = roles.includes("admin");
  const isSuperAdmin = roles.includes("superadmin");

  // Fetch Users for Admin Stats
  const { data: usersResponse } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const res = await apiClient.get("/users?limit=5000");
      return res.data;
    },
    enabled: isAuthenticated && (isAdmin || isSuperAdmin),
  });

  useMantineColorScheme();
  const isMobile = useMediaQuery("(max-width: 48em)");

  const userProdiId = user?.prodi_id;
  const isSuperUser = roles.includes("superadmin") || roles.includes("admin");

  // Filtered Datasets
  const filteredMahasiswa = useMemo(() => {
    const list = (mahasiswaList as Mahasiswa[]) || [];
    if (isSuperUser || !userProdiId) return list;
    return list.filter(m => Number(m.prodi_id || m.prodiId) === Number(userProdiId));
  }, [mahasiswaList, userProdiId, isSuperUser]);

  const filteredDosens = useMemo(() => {
    const list = (dosensData as any[]) || [];
    if (isSuperUser || !userProdiId) return list;
    return list.filter(d => Number(d.prodi_id || d.prodiId) === Number(userProdiId));
  }, [dosensData, userProdiId, isSuperUser]);

  const filteredPengajuan = useMemo(() => {
    const list = (pengajuanList as unknown as RanpelSubmission[]) || [];
    if (isSuperUser || !userProdiId) return list;
    return list.filter(p => {
      const mhsProdi = p.mahasiswa as any;
      const id = mhsProdi?.prodi_id || mhsProdi?.prodiId;
      return Number(id) === Number(userProdiId);
    });
  }, [pengajuanList, userProdiId, isSuperUser]);

  const filteredPendaftaran = useMemo(() => {
    const baseList = (roles.includes("mahasiswa") ? studentPendaftaranList : pendaftaranList) as unknown as PendaftaranUjian[];
    const list = baseList || [];
    if (isSuperUser || !userProdiId || roles.includes("mahasiswa")) return list;
    return list.filter(p => {
      const mhsProdi = p.mahasiswa as any;
      const id = mhsProdi?.prodi_id || mhsProdi?.prodiId;
      return Number(id) === Number(userProdiId);
    });
  }, [pendaftaranList, studentPendaftaranList, roles, userProdiId, isSuperUser]);

  const filteredAllUjian = useMemo(() => {
    const list = (allUjianData?.data as Ujian[]) || [];
    if (isSuperUser || !userProdiId) return list;
    return list.filter(u => {
      const mhsProdi = u.pendaftaranUjian?.mahasiswa as any;
      const id = mhsProdi?.prodi_id || mhsProdi?.prodiId;
      return Number(id) === Number(userProdiId);
    });
  }, [allUjianData, userProdiId, isSuperUser]);

  // Groups students by batch and their progress
  const progressData = useMemo(() => {
    const data: Record<
      string,
      { total: number; proposal: number; hasil: number; skripsi: number }
    > = {};
    const nimToAngkatan: Record<string, string> = {};

    if (Array.isArray(filteredMahasiswa)) {
      filteredMahasiswa.forEach((m) => {
        const batch = m.angkatan || "Lainnya";
        if (m.nim) nimToAngkatan[m.nim] = batch;

        if (!data[batch]) {
          data[batch] = { total: 0, proposal: 0, hasil: 0, skripsi: 0 };
        }
        data[batch].total++;
      });
    }

    if (Array.isArray(filteredPendaftaran)) {
      filteredPendaftaran.forEach((p) => {
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

  const [dosenChartRange, setDosenChartRange] = useState("30d");
  const [selectedExam, setSelectedExam] = useState<string>("all");

  const pengajuanArray = filteredPengajuan;
  const pendaftaranArray = filteredPendaftaran;

  // Lecturer (Dosen PA) Specific Stats
  const dosenSubmissionsTrend = useMemo(() => {
    const isDosen = roles.includes("dosen");
    if (!isDosen || !isAuthenticated) return [];
    
    const filtered = pengajuanArray;
    const data = [];
    const now = dayjs();

    if (dosenChartRange === "7d") {
      for (let i = 6; i >= 0; i--) {
        const date = now.subtract(i, 'day');
        const dateStr = date.format('DD MMM');
        const count = filtered.filter(p => 
          dayjs(p.tanggalPengajuan || p.createdAt).isSame(date, 'day')
        ).length;
        data.push({ date: dateStr, total: count });
      }
    } else if (dosenChartRange === "30d") {
      for (let i = 29; i >= 0; i--) {
        const date = now.subtract(i, 'day');
        const dateStr = date.format('DD MMM');
        const count = filtered.filter(p => 
          dayjs(p.tanggalPengajuan || p.createdAt).isSame(date, 'day')
        ).length;
        data.push({ date: dateStr, total: count });
      }
    } else if (dosenChartRange === "1y") {
      for (let i = 11; i >= 0; i--) {
        const date = now.subtract(i, 'month');
        const dateStr = date.format('MMM YYYY');
        const count = filtered.filter(p => 
          dayjs(p.tanggalPengajuan || p.createdAt).isSame(date, 'month')
        ).length;
        data.push({ date: dateStr, total: count });
      }
    }
    return data;
  }, [roles, isAuthenticated, pengajuanArray, dosenChartRange]);

  const dosenSubmissionsSummary = useMemo(() => {
    const isDosen = roles.includes("dosen");
    const lecturerId = user?.id ? Number(user.id) : null;
    if (!isDosen || !user?.id) return { today: 0, week: 0, month: 0, total: 0, sempro: 0, hasil: 0, skripsi: 0, passedCount: 0, processingCount: 0 };
    
    const filteredPengajuan = pengajuanArray;
    
    // Filter students assigned to this lecturer
    const myStudents = filteredMahasiswa.filter(m => {
      const getDosenId = (d: unknown) => (typeof d === "object" && d !== null ? (d as {id: number}).id : d as number);
      const paId = getDosenId(m?.dosen_pa) || m?.dosenPa?.id;
      const p1Id = getDosenId(m?.pembimbing_1) || m?.pembimbing1?.id;
      const p2Id = getDosenId(m?.pembimbing_2) || m?.pembimbing2?.id;
      return [paId, p1Id, p2Id].some(id => id && Number(id) === lecturerId);
    });

    const myStudentNims = new Set(myStudents.map(m => m.nim));

    // Count exams for these specific students
    const myExams = pendaftaranArray.filter(p => p.mahasiswa?.nim && myStudentNims.has(p.mahasiswa.nim));

    const countPassed = (name: string) => {
      return myExams.filter(p => 
        p.jenisUjian?.namaJenis?.toLowerCase().includes(name) && 
        (p.ujian?.hasil || "").toLowerCase() === "lulus"
      ).length;
    };

    const countStatus = (examName: string, status: string) => {
      return myExams.filter(p => 
        p.jenisUjian?.namaJenis?.toLowerCase().includes(examName) && 
        (p.ujian?.hasil || "").toLowerCase() === status
      ).length;
    };

    const countProcessing = (examName: string) => {
      return myExams.filter(p => 
        p.jenisUjian?.namaJenis?.toLowerCase().includes(examName) && 
        (p.ujian?.hasil || "").toLowerCase() !== "lulus"
      ).length;
    };

    const now = dayjs();
    return {
      today: filteredPengajuan.filter(p => dayjs(p.tanggalPengajuan || p.createdAt).isSame(now, 'day')).length,
      week: filteredPengajuan.filter(p => dayjs(p.tanggalPengajuan || p.createdAt).isAfter(now.subtract(7, 'day'))).length,
      month: filteredPengajuan.filter(p => dayjs(p.tanggalPengajuan || p.createdAt).isAfter(now.subtract(30, 'day'))).length,
      total: filteredPengajuan.length,
      sempro: countPassed("proposal"),
      hasil: countPassed("hasil"),
      skripsi: countPassed("skripsi") || countPassed("sidang") || countPassed("munaqasyah"),
      // Specific status counts for filtered view
      passedCount: selectedExam === "all" ? 0 : countStatus(selectedExam === "skripsi" ? "skripsi" : selectedExam, "lulus"),
      processingCount: selectedExam === "all" ? 0 : countProcessing(selectedExam === "skripsi" ? "skripsi" : selectedExam),
    };
  }, [roles, user?.id, pengajuanArray, mahasiswaList, pendaftaranArray, selectedExam]);

  // Admin User Stats
  const userStats = useMemo(() => {
    const users = (usersResponse?.data || []) as any[];
    return {
      total: users.length,
      mahasiswa: users.filter(u => String(u.role).toLowerCase() === "mahasiswa").length,
      dosen: users.filter(u => String(u.role).toLowerCase() === "dosen").length,
      admin: users.filter(u => ["admin", "superadmin", "admin_prodi"].includes(String(u.role).toLowerCase())).length,
      others: users.filter(u => ["kaprodi", "sekprodi"].includes(String(u.role).toLowerCase())).length,
    };
  }, [usersResponse]);

  const examResultStats = useMemo(() => {
    const exams = filteredAllUjian;
    const lulus = exams.filter(u => u.nilaiDifinalisasi && (u.pendaftaranUjian?.ujian?.hasil || "").toLowerCase() === "lulus").length;
    const tidakLulus = exams.filter(u => u.nilaiDifinalisasi && (u.pendaftaranUjian?.ujian?.hasil || "").toLowerCase() === "tidak lulus").length;
    return { lulus, tidakLulus };
  }, [filteredAllUjian]);

  if (!isAuthenticated || !userResponse || !user) return null;

  const isMahasiswa = roles.includes("mahasiswa");
  const isDosen = roles.includes("dosen");
  const isKaprodi = roles.includes("kaprodi");
  const isSekprodi = roles.includes("sekprodi");
  const isAdminProdi = roles.includes("admin_prodi");



  // Calculate Kaprodi Stats
  const totalMahasiswa = filteredMahasiswa.length;
  const totalDosen = filteredDosens.length;

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

  const upcomingUjians = filteredAllUjian
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

  const finalizedUjianCount = filteredAllUjian?.filter(
    (u) => u.nilaiDifinalisasi,
  ).length;

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Dashboard Overview"
        items={[{ label: "Dashboard" }]}
        description="Pantau ringkasan aktivitas dan status akademik Anda di sini."
        icon={IconLayoutDashboard}
        rightSection={
          <Group gap="xs" wrap="nowrap">
            <Stack gap={0} align="flex-end" visibleFrom="sm">
              <Text size="xs" fw={500} className="text-gs-text-secondary">Selamat Datang,</Text>
              <Text size="sm" fw={700} truncate maw={150} className="text-gs-text-primary">{user.nama}</Text>
            </Stack>
            <Badge 
              variant="outline" 
              color="var(--gs-border-strong)" 
              radius="sm" 
              size="lg"
              tt="uppercase"
              fw={700}
              className="text-gs-text-primary"
            >
              {(roles[roles.length - 1] || "User")}
            </Badge>
          </Group>
        }
      />

      <Stack gap="xl">
        {/* Kaprodi Section */}
        {isKaprodi && (
          <Box>
            {/* Overview Section */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
              <StatCard
                title="Total Mahasiswa"
                value={totalMahasiswa}
                icon={IconUsers}
                color="dark"
              />
              <StatCard
                title="Total Dosen"
                value={totalDosen}
                icon={IconUserCheck}
                color="dark"
              />
              <StatCard
                title="Total Ranpel"
                value={pengajuanArray.length}
                icon={IconFileText}
                color="dark"
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
                        color: "gray.7",
                      },
                      {
                        name: "hasil",
                        label: "Lulus Hasil",
                        color: "gray.9",
                      },
                      {
                        name: "skripsi",
                        label: "Lulus Skripsi",
                        color: "dark.9",
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
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Paper p="md" withBorder radius="md">
                      <Group justify="space-between">
                        <Stack gap={2}>
                          <Text size="xs" fw={600} c="dimmed">
                            MENUNGGU VERIFIKASI
                          </Text>
                          <Text className="gs-stat">
                            {ranpelDiverifikasiCount}
                          </Text>
                        </Stack>
                        <ThemeIcon color="dark" variant="light" size="xl">
                          <IconClipboardCheck size={24} />
                        </ThemeIcon>
                      </Group>
                    </Paper>
                    <Paper p="md" withBorder radius="md">
                      <Group justify="space-between">
                        <Stack gap={2}>
                          <Text size="xs" fw={600} c="dimmed">
                            TELAH DISETUJUI
                          </Text>
                          <Text className="gs-stat">
                            {ranpelDiterimaCount}
                          </Text>
                        </Stack>
                        <ThemeIcon color="dark" variant="light" size="xl">
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
                      <Text size="xs" fw={600} tt="uppercase" opacity={0.6}>
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
                              <Avatar size="sm" radius="xl" color="dark">
                                {row.mahasiswa?.nama?.charAt(0)}
                              </Avatar>
                              <Stack gap={0}>
                                <Text size="xs" fw={600} truncate>
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
                            color: "dark",
                          },
                          {
                            label: "UJIAN HASIL",
                            value: statsUjian.ujianHasil,
                            color: "dark",
                          },
                          {
                            label: "UJIAN SKRIPSI",
                            value: statsUjian.ujianSkripsi,
                            color: "dark",
                          },
                        ].map((stat) => (
                          <Group key={stat.label} justify="space-between">
                            <Text size="xs" fw={600} c="dimmed">
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
                                  <Text size="xs" fw={600} lineClamp={1}>
                                    {u.pendaftaranUjian?.mahasiswa?.nama}
                                  </Text>
                                  <Text size="10px" c="dimmed">
                                    {u.pendaftaranUjian?.jenisUjian?.namaJenis}
                                  </Text>
                                </Stack>
                                <Stack gap={0} align="end">
                                  <Text size="10px" fw={600}>
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
                        color="dark"
                        radius="md"
                        size="sm"
                        justify="space-between"
                        rightSection={<IconArrowRight size={16} />}
                      >
                        Kelola Ranpel
                      </Button>
                      <Button
                        component={Link}
                        href="/dashboard/master-data/syarat"
                        variant="light"
                        color="dark"
                        radius="md"
                        size="sm"
                        justify="space-between"
                        rightSection={<IconArrowRight size={16} />}
                      >
                        Kelola Syarat
                      </Button>
                      <Button
                        component={Link}
                        href="/dashboard/rekap-bimbingan"
                        variant="light"
                        color="dark"
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

        {/* Sekprodi Section */}
        {isSekprodi && (
          <Box>
            <Grid gutter="xl">
              {/* Group 1: Administrasi Ujian & Jadwal */}
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Box>
                  <SectionTitle title="Administrasi Ujian" icon={IconBooks} />
                  <Paper p="md" withBorder radius="lg" mt="xs">
                    <Stack gap="sm">
                      {[
                        {
                          label: "SEMINAR PROPOSAL",
                          value: statsUjian.proposal,
                          color: "dark",
                        },
                        {
                          label: "UJIAN HASIL",
                          value: statsUjian.ujianHasil,
                          color: "dark",
                        },
                        {
                          label: "UJIAN SKRIPSI",
                          value: statsUjian.ujianSkripsi,
                          color: "dark",
                        },
                      ].map((stat) => (
                        <Group key={stat.label} justify="space-between">
                          <Text size="sm" fw={600} c="dimmed">
                            {stat.label}
                          </Text>
                          <Badge color={stat.color} variant="light" size="lg">
                            {isLoadingUjian ? "..." : stat.value} Mahasiswa
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </Paper>
                </Box>

                <Box mt="xl">
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
                                <Text size="sm" fw={600} lineClamp={1}>
                                  {u.pendaftaranUjian?.mahasiswa?.nama}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {u.pendaftaranUjian?.jenisUjian?.namaJenis}
                                </Text>
                              </Stack>
                              <Stack gap={0} align="end">
                                <Text size="xs" fw={600}>
                                  {new Date(
                                    u.tanggalUjian,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </Text>
                                <Text size="xs" c="dimmed">
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
              </Grid.Col>

              {/* Group 2: Quick Actions */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <SectionTitle title="Akses Cepat" icon={IconTrendingUp} />
                <Stack gap="xs" mt="xs">
                  <Button
                    component={Link}
                    href="/dashboard/verifikasi-pendaftaran"
                    variant="light"
                    color="dark"
                    radius="md"
                    size="md"
                    justify="space-between"
                    rightSection={<IconArrowRight size={16} />}
                  >
                    Verifikasi Pendaftaran
                  </Button>
                  <Button
                    component={Link}
                    href="/dashboard/penjadwalan-ujian"
                    variant="light"
                    color="dark"
                    radius="md"
                    size="md"
                    justify="space-between"
                    rightSection={<IconArrowRight size={16} />}
                  >
                    Penjadwalan Ujian
                  </Button>
                  <Button
                    component={Link}
                    href="/dashboard/manajemen-perbaikan-judul"
                    variant="light"
                    color="dark"
                    radius="md"
                    size="md"
                    justify="space-between"
                    rightSection={<IconArrowRight size={16} />}
                  >
                    Perbaikan Judul
                  </Button>
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
                color="dark"
              />
              <StatCard
                title="Ujian Terjadwal"
                value={
                  pendaftaranArray.filter((p) => p.status === "diterima").length
                }
                icon={IconCalendar}
                color="dark"
              />
              <StatCard
                title="Nilai Final"
                value={finalizedUjianCount}
                icon={IconFileText}
                color="dark"
              />
            </SimpleGrid>

            <Paper p="xl" radius="md" withBorder>
              <Stack gap="md" align="center" ta="center">
                <ThemeIcon size={60} radius="md" color="dark" variant="light">
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
                  color="dark"
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
            <Paper radius="xl" p="xl" withBorder shadow="sm">
              <Stack gap="xl">
                <Stepper 
                  active={
                    !latestRanpel ? 0 : 
                    latestRanpel.statusKaprodi !== "diterima" ? 0 :
                    pendaftaranArray.some(p => (p.ujian?.hasil || "").toLowerCase() === "lulus" && (p.jenisUjian?.namaJenis?.toLowerCase().includes("skripsi") || p.jenisUjian?.namaJenis?.toLowerCase().includes("sidang"))) ? 4 :
                    pendaftaranArray.some(p => (p.ujian?.hasil || "").toLowerCase() === "lulus" && p.jenisUjian?.namaJenis?.toLowerCase().includes("hasil")) ? 3 :
                    pendaftaranArray.some(p => (p.ujian?.hasil || "").toLowerCase() === "lulus" && p.jenisUjian?.namaJenis?.toLowerCase().includes("proposal")) ? 2 : 1
                  } 
                  allowNextStepsSelect={false}
                >
                  <Stepper.Step
                    label="Ranpel"
                    description={
                      !latestRanpel ? "Belum Mengajukan" : 
                      latestRanpel.statusKaprodi === "diterima" ? "DISETUJUI" :
                      latestRanpel.statusKaprodi === "ditolak" || latestRanpel.statusDosenPa === "ditolak" ? "DITOLAK" :
                      latestRanpel.statusDosenPa === "diterima" ? "PROSES KAPRODI" : "PROSES PEMBIMBING"
                    }
                    icon={<IconFileText size={18} />}
                  />
                  <Stepper.Step
                    label="Proposal"
                    description="Seminar Proposal"
                    icon={<IconBooks size={18} />}
                  />
                  <Stepper.Step
                    label="Hasil"
                    description="Ujian Hasil"
                    icon={<IconClipboardCheck size={18} />}
                  />
                  <Stepper.Step
                    label="Skripsi"
                    description="Sidang Munaqasyah"
                    icon={<IconCheck size={18} />}
                  />
                  <Stepper.Completed>
                    <Stack align="center" gap="xs" py="xl">
                      <ThemeIcon size={60} radius="xl" color="dark" variant="light">
                        <IconCheck size={32} />
                      </ThemeIcon>
                      <Text fw={600} size="lg">Selamat! Anda Telah Menyelesaikan Skripsi</Text>
                      <Text c="dimmed" size="sm">Silahkan urus administrasi kelulusan Anda di Bagian Akademik.</Text>
                    </Stack>
                  </Stepper.Completed>
                </Stepper>

                <Divider variant="dashed" />

                <Group justify="space-between" align="center" wrap="wrap" gap="xl">
                  <Box style={{ flex: 1, minWidth: 280 }}>
                    {latestRanpel ? (
                      <Group gap="xl" wrap="nowrap">
                        <Stack gap={4}>
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase">Judul Saat Ini</Text>
                          <Tooltip 
                            label={latestRanpel.ranpel?.judul_penelitian || latestRanpel.rancanganPenelitian?.judulPenelitian} 
                            multiline 
                            w={300} 
                            withArrow 
                            radius="md"
                          >
                            <Text fw={600} size="sm" lineClamp={1} maw={{ base: "100%", sm: 500 }} style={{ cursor: "help" }}>
                              {latestRanpel.ranpel?.judul_penelitian || latestRanpel.rancanganPenelitian?.judulPenelitian}
                            </Text>
                          </Tooltip>
                        </Stack>
                        <Divider orientation="vertical" h={40} visibleFrom="sm" />
                        <Stack gap={4}>
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase">Status Terakhir</Text>
                          <StatusBadge 
                            status={
                              latestRanpel.statusKaprodi === "diterima" ? "diterima" :
                              latestRanpel.statusKaprodi === "ditolak" || latestRanpel.statusDosenPa === "ditolak" ? "ditolak" :
                              latestRanpel.statusDosenPa === "diterima" ? "proses" : "menunggu"
                            } 
                            size="sm" 
                          />
                        </Stack>
                      </Group>
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic">Anda belum memulai pengajuan rancangan penelitian.</Text>
                    )}
                  </Box>
                  
                  <Button
                    component={Link}
                    href="/dashboard/pengajuan-ranpel"
                    variant="light"
                    color="dark"
                    radius="md"
                    fullWidth={isMobile}
                    rightSection={<IconArrowRight size={18} />}
                  >
                    {latestRanpel ? "Lihat Detail Progres" : "Mulai Pengajuan"}
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Dosen Section */}
        {isDosen && (
          <Box>
            <SectionTitle title="STATISTIK & PROGRES" icon={IconTrendingUp} />
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper radius="xl" p="xl" withBorder shadow="sm">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Stack gap={0}>
                      <Text fw={600} fz="lg">
                        Tren Pengajuan
                      </Text>
                      <Text size="xs" c="dimmed">30 Hari Terakhir</Text>
                    </Stack>
                    <SegmentedControl
                      size="xs"
                      value={dosenChartRange}
                      onChange={setDosenChartRange}
                      data={[
                        { label: '7 Hari', value: '7d' },
                        { label: '30 Hari', value: '30d' },
                        { label: '1 Tahun', value: '1y' },
                      ]}
                      radius="md"
                    />
                  </Group>
                  
                  <Box h={250} mt="md">
                    <AreaChart
                      h={250}
                      data={dosenSubmissionsTrend}
                      dataKey="date"
                      series={[{ name: "total", color: "dark.9" }]}
                      curveType="monotone"
                      tickLine="xy"
                      gridAxis="xy"
                      withDots={true}
                      dotProps={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    />
                  </Box>
                </Stack>
              </Paper>

              <Paper radius="xl" p="xl" withBorder shadow="sm">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Stack gap={0}>
                      <Text fw={600} fz="lg">
                        Progres Mahasiswa
                      </Text>
                      <Text size="xs" c="dimmed">Status kelulusan tiap tahap ujian</Text>
                    </Stack>
                  </Group>

                  <Tabs 
                    variant="pills" 
                    radius="md" 
                    value={selectedExam} 
                    onChange={(val) => setSelectedExam(val || "all")}
                  >
                    <Tabs.List grow>
                      <Tabs.Tab value="all" fz={10} fw={600}>SEMUA</Tabs.Tab>
                      <Tabs.Tab value="proposal" fz={10} fw={600}>SEMPRO</Tabs.Tab>
                      <Tabs.Tab value="hasil" fz={10} fw={600}>HASIL</Tabs.Tab>
                      <Tabs.Tab value="skripsi" fz={10} fw={600}>SKRIPSI</Tabs.Tab>
                    </Tabs.List>
                  </Tabs>
                  
                  <Center h={250}>
                    <DonutChart
                      h={250}
                      data={selectedExam === "all" ? [
                        { name: "Sempro", value: dosenSubmissionsSummary.sempro || 0, color: "gray.6" },
                        { name: "Ujian Hasil", value: dosenSubmissionsSummary.hasil || 0, color: "gray.8" },
                        { name: "Ujian Skripsi", value: dosenSubmissionsSummary.skripsi || 0, color: "dark.9" },
                      ] : [
                        { name: "Lulus", value: dosenSubmissionsSummary.passedCount || 0, color: "dark.9" },
                        { name: "Dalam Proses", value: dosenSubmissionsSummary.processingCount || 0, color: "gray.5" },
                      ]}
                      withLabelsLine
                      withLabels
                      chartLabel={selectedExam === "all" ? "Total Lulus" : "Status"}
                    />
                  </Center>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Box>
        )}
        {/* Admin & Superadmin Section */}
        {(isAdmin || isSuperAdmin) && (
          <Box>
            <SectionTitle title="Statistik & Monitoring Sistem" icon={IconAdjustments} />
            
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
              <StatCard
                title="Total Akun Pengguna"
                value={userStats.total}
                icon={IconUsers}
                color="dark"
              />
              <StatCard
                title="Ujian Terjadwal"
                value={pendaftaranArray.filter(p => p.status === "diterima").length}
                icon={IconCalendar}
                color="dark"
              />
              <StatCard
                title="Nilai Final"
                value={finalizedUjianCount}
                icon={IconFileText}
                color="dark"
              />
              <StatCard
                title="Total Judul Skripsi"
                value={pengajuanArray.filter(p => p.status === "diterima").length}
                icon={IconBooks}
                color="dark"
              />
            </SimpleGrid>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper radius="xl" p="xl" withBorder shadow="sm">
                  <Stack gap="md">
                    <Text fw={700} size="lg">Komposisi Pengguna</Text>
                    <Center h={200}>
                      <DonutChart
                        h={200}
                        data={[
                          { name: "Mahasiswa", value: userStats.mahasiswa, color: "gray.5" },
                          { name: "Dosen", value: userStats.dosen, color: "gray.7" },
                          { name: "Admin", value: userStats.admin, color: "gray.9" },
                          { name: "Lainnya", value: userStats.others, color: "dark.9" },
                        ]}
                        withLabels
                        withLabelsLine
                        chartLabel="User Role"
                      />
                    </Center>
                    <Divider variant="dashed" />
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="xs" fw={600} c="dimmed">MAHASISWA</Text>
                        <Badge variant="light" color="gray" size="xs">{userStats.mahasiswa}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" fw={600} c="dimmed">DOSEN</Text>
                        <Badge variant="light" color="gray" size="xs">{userStats.dosen}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" fw={600} c="dimmed">ADMIN/STAF</Text>
                        <Badge variant="light" color="gray" size="xs">{userStats.admin}</Badge>
                      </Group>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper radius="xl" p="xl" withBorder shadow="sm">
                  <Stack gap="md">
                    <Text fw={700} size="lg">Statistik Kelulusan</Text>
                    <Center h={200}>
                      <DonutChart
                        h={200}
                        data={[
                          { name: "Lulus", value: examResultStats.lulus, color: "dark.9" },
                          { name: "Tidak Lulus", value: examResultStats.tidakLulus, color: "gray.4" },
                        ]}
                        withLabels
                        withLabelsLine
                        chartLabel="Ujian Final"
                      />
                    </Center>
                    <Divider variant="dashed" />
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="xs" fw={600} c="dimmed">LULUS</Text>
                        <Badge variant="filled" color="dark" size="xs">{examResultStats.lulus}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" fw={600} c="dimmed">TIDAK LULUS</Text>
                        <Badge variant="light" color="gray" size="xs">{examResultStats.tidakLulus}</Badge>
                      </Group>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper radius="xl" p="xl" withBorder shadow="sm" h="100%">
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text fw={700} size="lg">Pengguna Terbaru</Text>
                      <Button component={Link} href="/dashboard/users" variant="subtle" size="xs">
                        Semua
                      </Button>
                    </Group>
                    <Stack gap="xs">
                      {(usersResponse?.data || []).slice(0, 5).map((u: any, i: number) => (
                        <Group key={i} gap="sm" wrap="nowrap">
                          <Avatar radius="xl" size="sm" color="dark">
                            {u.nama?.charAt(0)}
                          </Avatar>
                          <Stack gap={0} style={{ flex: 1 }}>
                            <Text size="xs" fw={700} truncate>{u.nama}</Text>
                            <Text size="10px" c="dimmed">{u.role?.toUpperCase()}</Text>
                          </Stack>
                          <Badge size="xs" variant="outline" color="gray">
                            {dayjs(u.createdAt).fromNow(true)}
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>

            <Box mt="xl">
              <SectionTitle title="Manajemen Data Master" icon={IconUsers} />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="xs">
                <Paper
                  p="lg"
                  radius="lg"
                  withBorder
                  className="hover:border-gs-primary transition-all duration-300 group cursor-pointer"
                  component={Link}
                  href="/dashboard/master-data/mahasiswa"
                  bg="var(--gs-bg-overlay)"
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <ThemeIcon size={48} radius="md" variant="light" color="dark">
                        <IconUsers size={24} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700}>Data Mahasiswa</Text>
                        <Text size="xs" c="dimmed">Kelola biodata, NIM, dan status akademik</Text>
                      </div>
                    </Group>
                    <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Group>
                </Paper>

                <Paper
                  p="lg"
                  radius="lg"
                  withBorder
                  className="hover:border-gs-primary transition-all duration-300 group cursor-pointer"
                  component={Link}
                  href="/dashboard/master-data/dosen"
                  bg="var(--gs-bg-overlay)"
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <ThemeIcon size={48} radius="md" variant="light" color="dark">
                        <IconUserCheck size={24} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700}>Data Dosen</Text>
                        <Text size="xs" c="dimmed">Kelola NIDN, NIP, dan beban bimbingan</Text>
                      </div>
                    </Group>
                    <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Group>
                </Paper>
                <Paper
                  p="lg"
                  radius="lg"
                  withBorder
                  className="hover:border-gs-primary transition-all duration-300 group cursor-pointer"
                  component={Link}
                  href="/dashboard/master-data/peminatan"
                  bg="var(--gs-bg-overlay)"
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <ThemeIcon size={48} radius="md" variant="light" color="dark">
                        <IconTarget size={24} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700}>Data Peminatan</Text>
                        <Text size="xs" c="dimmed">Kelola bidang konsentrasi program studi</Text>
                      </div>
                    </Group>
                    <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Group>
                </Paper>

                <Paper
                  p="lg"
                  radius="lg"
                  withBorder
                  className="hover:border-gs-primary transition-all duration-300 group cursor-pointer"
                  component={Link}
                  href="/dashboard/master-data/jenis-ujian"
                  bg="var(--gs-bg-overlay)"
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <ThemeIcon size={48} radius="md" variant="light" color="dark">
                        <IconCertificate size={24} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700}>Jenis Ujian</Text>
                        <Text size="xs" c="dimmed">Kelola jenis-jenis ujian skripsi</Text>
                      </div>
                    </Group>
                    <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Group>
                </Paper>

                <Paper
                  p="lg"
                  radius="lg"
                  withBorder
                  className="hover:border-gs-primary transition-all duration-300 group cursor-pointer"
                  component={Link}
                  href="/dashboard/master-data/syarat"
                  bg="var(--gs-bg-overlay)"
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <ThemeIcon size={48} radius="md" variant="light" color="dark">
                        <IconClipboardList size={24} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700}>Syarat Ujian</Text>
                        <Text size="xs" c="dimmed">Kelola dokumen syarat ujian</Text>
                      </div>
                    </Group>
                    <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Group>
                </Paper>

                <Paper
                  p="lg"
                  radius="lg"
                  withBorder
                  className="hover:border-gs-primary transition-all duration-300 group cursor-pointer"
                  component={Link}
                  href="/dashboard/master-data/komponen-penilaian"
                  bg="var(--gs-bg-overlay)"
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <ThemeIcon size={48} radius="md" variant="light" color="dark">
                        <IconClipboardCheck size={24} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700}>Komponen Penilaian</Text>
                        <Text size="xs" c="dimmed">Kelola kriteria dan indikator skor ujian</Text>
                      </div>
                    </Group>
                    <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Group>
                </Paper>
              </SimpleGrid>
            </Box>

            <Box mt="xl">
              <SectionTitle title="Jadwal Ujian Akan Datang" icon={IconCalendar} />
              <Paper withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
                <DataTable
                  data={upcomingUjians}
                  loading={isLoadingAllUjian}
                  columns={[
                    {
                      header: "Mahasiswa",
                      render: (row) => (
                        <Group gap="xs">
                          <Avatar size="sm" radius="xl" color="dark">{row.pendaftaranUjian?.mahasiswa?.nama?.charAt(0)}</Avatar>
                          <Stack gap={0}>
                            <Text size="xs" fw={600}>{row.pendaftaranUjian?.mahasiswa?.nama}</Text>
                            <Text size="10px" c="dimmed">{row.pendaftaranUjian?.mahasiswa?.nim}</Text>
                          </Stack>
                        </Group>
                      )
                    },
                    {
                      header: "Jenis Ujian",
                      render: (row) => <Badge variant="light" color="dark" size="xs">{row.pendaftaranUjian?.jenisUjian?.namaJenis}</Badge>
                    },
                    {
                      header: "Waktu & Ruangan",
                      render: (row) => (
                        <Stack gap={0}>
                          <Text size="xs" fw={600}>{dayjs(row.tanggalUjian).format('DD MMM YYYY')}</Text>
                          <Text size="10px" c="dimmed">{row.jamMulai} WITA</Text>
                        </Stack>
                      )
                    },
                    {
                      header: "Status",
                      render: (row) => (
                        <StatusBadge status={row.nilaiDifinalisasi ? "selesai" : "terjadwal"} size="xs" />
                      )
                    }
                  ]}
                />
              </Paper>
            </Box>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
