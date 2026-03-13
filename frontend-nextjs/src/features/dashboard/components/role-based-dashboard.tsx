"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  AppShell,
  Burger,
  Group,
  UnstyledButton,
  Text,
  Divider,
  Button,
  Loader,
  Container,
  Stack,
  Title,
  ThemeIcon,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome,
  IconBooks,
  IconBriefcase,
  IconUsers,
  IconSettings,
  IconFileText,
  IconEdit,
  IconClipboardCheck,
} from "@tabler/icons-react";

export function RoleBasedDashboard() {
  const { userResponse, isLoadingProfile, isAuthenticated, logout } = useAuth();
  const [opened, { toggle }] = useDisclosure();

  if (isLoadingProfile) {
    return (
      <Container
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader color="indigo.9" size="lg" />
      </Container>
    );
  }

  if (!isAuthenticated || !userResponse) {
    return (
      <Container
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text c="dimmed">Silakan login terlebih dahulu.</Text>
      </Container>
    );
  }

  const user = userResponse?.user;
  if (!user) return null;

  const roles = user.roles || userResponse?.roles || [];

  // Barker Identity Subtyping logic - flattened user structure
  const isMahasiswa = roles.includes("mahasiswa");
  const isDosen =
    roles.includes("dosen") ||
    roles.includes("kaprodi") ||
    roles.includes("sekprodi");
  const isKaprodi = roles.includes("kaprodi");

  // Type-safe property access for flattened user
  const mahasiswaData = isMahasiswa ? user : null;
  const dosenData = isDosen ? user : null;

  // Dynamic Navigation depending on Subtype Identity
  const mainLinks = [
    {
      icon: <IconHome size={20} />,
      color: "indigo",
      label: "Dashboard Beranda",
      href: "/dashboard",
    },
    ...(isMahasiswa
      ? [
          {
            icon: <IconFileText size={20} />,
            color: "pink",
            label: "Pengajuan Ranpel",
            href: "/dashboard/pengajuan-ranpel",
          },
          {
            icon: <IconBooks size={20} />,
            color: "teal",
            label: "Pendaftaran Skripsi",
            href: "/dashboard/pendaftaran-skripsi",
          },
          {
            icon: <IconSettings size={20} />,
            color: "violet",
            label: "Progress Bimbingan",
            href: "/dashboard/progress-bimbingan",
          },
          {
            icon: <IconClipboardCheck size={20} />,
            color: "blue",
            label: "Pendaftaran Ujian",
            href: "/dashboard/pendaftaran-ujian",
          },
          {
            icon: <IconEdit size={20} />,
            color: "orange",
            label: "Perbaikan Judul",
            href: "/dashboard/perbaikan-judul",
          },
        ]
      : []),
    ...(isDosen
      ? [
          {
            icon: <IconBriefcase size={20} />,
            color: "orange",
            label: "Mahasiswa Bimbingan",
            href: "/dashboard/mahasiswa-bimbingan",
          },
          {
            icon: <IconSettings size={20} />,
            color: "grape",
            label: "Jadwal Sidang",
            href: "/dashboard/jadwal-sidang",
          },
        ]
      : []),
    ...(isKaprodi
      ? [
          {
            icon: <IconUsers size={20} />,
            color: "red",
            label: "Manajemen Ranpel",
            href: "/dashboard/manajemen-ranpel",
          },
          {
            icon: <IconBooks size={20} />,
            color: "pink",
            label: "Pengajuan Ranpel",
            href: "/dashboard/pengajuan-ranpel",
          },
        ]
      : []),
  ];

  const links = mainLinks.map((link) => (
    <UnstyledButton
      component={Link}
      href={link.href}
      key={link.label}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
      }}
      className="hover:bg-surface-hover transition-colors"
    >
      <Group>
        <ThemeIcon color={link.color} variant="light">
          {link.icon}
        </ThemeIcon>
        <Text size="sm" fw={500}>
          {link.label}
        </Text>
      </Group>
    </UnstyledButton>
  ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text fw={700} c="var(--mantine-primary-color-filled)" size="lg">
              GoSkripsi
            </Text>
          </Group>
          <Button variant="outline" color="red" onClick={logout} size="sm">
            Keluar
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="sm">{links}</Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <Title order={2} mb="xl">
            Selamat datang, {user.nama}!
          </Title>

          <Paper radius="xl" p="xl" withBorder>
            <Stack gap="md">
              <div>
                <Text size="lg" fw={600}>
                  Profil{" "}
                  {isMahasiswa ? "Mahasiswa" : isDosen ? "Dosen" : "Pengguna"}
                </Text>
                <Text size="sm" c="dimmed">
                  Informasi identitas Anda berdasarkan sistem Subtyping Barker
                </Text>
              </div>

              <Divider />

              <Group grow align="flex-start">
                <Stack gap="xs">
                  <Text size="sm">
                    <strong>Nama:</strong> {user.nama}
                  </Text>
                  <Text size="sm">
                    <strong>NIP/NIM:</strong>{" "}
                    {user.username || user.nim || user.nip}
                  </Text>
                  <Text size="sm">
                    <strong>Akses:</strong>{" "}
                    <span className="uppercase font-medium text-primary-light-color">
                      {roles.join(", ")}
                    </span>
                  </Text>
                </Stack>

                {isMahasiswa && mahasiswaData && (
                  <Stack gap="xs">
                    <Text fw={600} c="var(--mantine-primary-color-filled)">
                      Detail Akademik (Subtype: Mahasiswa)
                    </Text>
                    <Text size="sm">
                      <strong>Angkatan:</strong> {mahasiswaData.angkatan}
                    </Text>
                    <Text size="sm">
                      <strong>Semester:</strong> {mahasiswaData.semester}
                    </Text>
                    <Text size="sm">
                      <strong>IPK:</strong> {mahasiswaData.ipk}
                    </Text>
                    <Text size="sm">
                      <strong>Status:</strong> {mahasiswaData.status}
                    </Text>
                  </Stack>
                )}

                {isDosen && dosenData && (
                  <Stack gap="xs">
                    <Text fw={600} c="var(--mantine-primary-color-filled)">
                      Detail Kepegawaian (Subtype: Dosen)
                    </Text>
                    <Text size="sm">
                      <strong>NIDN:</strong> {dosenData.nidn}
                    </Text>
                    <Text size="sm">
                      <strong>NIP:</strong> {dosenData.nip}
                    </Text>
                    <Text size="sm">
                      <strong>Status:</strong> {dosenData.status}
                    </Text>
                    {isKaprodi && (
                      <Text
                        size="sm"
                        fw={600}
                        c="var(--mantine-primary-color-filled)"
                      >
                        Akses Kepala Program Studi Aktif
                      </Text>
                    )}
                  </Stack>
                )}
              </Group>
            </Stack>
          </Paper>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
