"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Avatar,
  Stack,
  Divider,
  Grid,
  Badge,
  Loader,
  Button,
  TextInput,
  Textarea,
  PasswordInput,
  Modal,
  SimpleGrid,
} from "@mantine/core";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconUser,
  IconLock,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { SignatureUpload } from "@/components/SignatureUpload";
import { MyDocuments } from "@/components/MyDocuments";
import { notifications } from "@mantine/notifications";
import axios from "axios";

export default function ProfilePage() {
  const {
    userResponse,
    isLoadingProfile,
    updateProfileAsync,
    isUpdatingProfile,
    changePasswordAsync,
    isChangingPassword,
  } = useAuth();
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    no_hp: "",
    alamat: "",
    ipk: "",
    semester: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];
  const isDosenOrKaprodi = roles.includes("dosen") || roles.includes("kaprodi");

  const handleStartEditing = () => {
    if (user) {
      setFormData({
        nama: user.nama || "",
        email: user.email || "",
        no_hp: user.no_hp || "",
        alamat: user.alamat || "",
        ipk: user.ipk?.toString() || "",
        semester: user.semester?.toString() || "",
      });
      open();
    }
  };

  if (isLoadingProfile) {
    return (
      <Container
        size="md"
        pt="xl"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Loader size="xl" />
      </Container>
    );
  }

  const handleUpdateProfile = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...formData };
      if (roles.includes("mahasiswa")) {
        payload.ipk = payload.ipk ? parseFloat(payload.ipk) : undefined;
        payload.semester = payload.semester
          ? parseInt(payload.semester, 10)
          : undefined;
      } else {
        delete payload.ipk;
        delete payload.semester;
      }
      await updateProfileAsync(payload);
      notifications.show({
        title: "Berhasil",
        message: "Profil berhasil diperbarui",
        color: "green",
      });
      close();
    } catch (error: unknown) {
      let message = "Terjadi kesalahan saat memperbarui profil";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      }
      notifications.show({
        title: "Gagal",
        message: message,
        color: "red",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      notifications.show({
        title: "Gagal",
        message: "Konfirmasi kata sandi tidak cocok",
        color: "red",
      });
      return;
    }

    try {
      await changePasswordAsync({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      });
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch {
      // Error handled by useAuth hook notification
    }
  };

  const mahasiswa = user; // In flattened AuthResponse, user object contains student fields
  const dosenProfile = user; // Same for dosen

  const nimNip =
    user?.nim ||
    user?.nip ||
    user?.username ||
    mahasiswa?.nim ||
    dosenProfile?.nip ||
    "-";
  const displayStatus =
    user?.status || mahasiswa?.status || dosenProfile?.status || "-";
  const displayProdi =
    user?.prodi?.nama_prodi ||
    (typeof user?.prodi === "string" ? user?.prodi : "-");

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Profil Pengguna"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profil Pengguna" },
        ]}
        description="Kelola informasi personal, akun, dan pengaturan profil Anda"
        icon={IconUser}
      />

      <Stack gap="md">
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <Group align="center" gap="lg">
              <Avatar size={80} radius="xl" color="indigo" variant="light">
                <IconUser size={40} />
              </Avatar>
              <Stack gap={0}>
                <Title order={3}>{user?.nama}</Title>
                <Text c="dimmed" size="xs">
                  {user?.email}
                </Text>
                <Group gap={6} mt={8}>
                  {roles.map((role: string) => (
                    <Badge key={role} variant="filled" color="indigo" size="xs" radius="sm">
                      {role.toUpperCase()}
                    </Badge>
                  ))}
                  <Badge
                    variant="dot"
                    color={displayStatus === "aktif" ? "green" : "gray"}
                    size="xs"
                  >
                    {displayStatus}
                  </Badge>
                </Group>
              </Stack>
            </Group>

            <Button
              variant="light"
              color="indigo"
              size="xs"
              onClick={handleStartEditing}
              leftSection={<IconEdit size={14} />}
            >
              Edit Profil
            </Button>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text fw={800} size="sm" mb="md" tt="uppercase" lts={1} c="indigo">
            Informasi Personal
          </Text>
          
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} verticalSpacing="md" spacing="xl">
            <Stack gap={2}>
              <Text fw={700} size="xs" c="dimmed" tt="uppercase">NIM / NIP</Text>
              <Text size="sm" fw={600}>{nimNip}</Text>
            </Stack>

            <Stack gap={2}>
              <Text fw={700} size="xs" c="dimmed" tt="uppercase">Program Studi</Text>
              <Text size="sm" fw={600}>{displayProdi}</Text>
            </Stack>

            <Stack gap={2}>
              <Text fw={700} size="xs" c="dimmed" tt="uppercase">Email</Text>
              <Text size="sm" fw={600}>{user?.email || "-"}</Text>
            </Stack>

            <Stack gap={2}>
              <Text fw={700} size="xs" c="dimmed" tt="uppercase">Nomor HP</Text>
              <Text size="sm" fw={600}>{user?.no_hp || "-"}</Text>
            </Stack>

            <Stack gap={12} style={{ gridColumn: "span 2" }}>
              <Stack gap={2}>
                <Text fw={700} size="xs" c="dimmed" tt="uppercase">Alamat</Text>
                <Text size="sm" fw={600}>{user?.alamat || "-"}</Text>
              </Stack>
            </Stack>
          </SimpleGrid>

          {roles.includes("mahasiswa") && (
            <>
              <Divider my="md" variant="dashed" />
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
                <Stack gap={2}>
                  <Text fw={700} size="xs" c="dimmed" tt="uppercase">Angkatan</Text>
                  <Text size="sm" fw={600}>{user?.angkatan || "-"}</Text>
                </Stack>
                <Stack gap={2}>
                  <Text fw={700} size="xs" c="dimmed" tt="uppercase">Semester</Text>
                  <Text size="sm" fw={600}>{user?.semester || "-"}</Text>
                </Stack>
                <Stack gap={2}>
                  <Text fw={700} size="xs" c="dimmed" tt="uppercase">IPK</Text>
                  <Text size="sm" fw={600}>{user?.ipk || "-"}</Text>
                </Stack>
                <Stack gap={2}>
                  <Text fw={700} size="xs" c="dimmed" tt="uppercase">Peminatan</Text>
                  <Text size="sm" fw={600}>{user?.peminatan?.nama_peminatan || "-"}</Text>
                </Stack>
              </SimpleGrid>
              
              <SimpleGrid cols={{ base: 1, md: 2 }} mt="md" spacing="lg">
                <Stack gap={2}>
                  <Text fw={700} size="xs" c="dimmed" tt="uppercase">Pembimbing Akademik</Text>
                  <Text size="sm" fw={600}>{user?.dosen_pa?.nama || "-"}</Text>
                </Stack>
                <Stack gap={2}>
                  <Text fw={700} size="xs" c="dimmed" tt="uppercase">Pembimbing Skripsi</Text>
                  <Text size="sm" fw={600}>
                    {user?.pembimbing_1?.nama || "-"} / {user?.pembimbing_2?.nama || "-"}
                  </Text>
                </Stack>
              </SimpleGrid>
            </>
          )}

          {isDosenOrKaprodi && (
            <>
              <Divider my="md" variant="dashed" />
              <SimpleGrid cols={{ base: 2, md: 3 }} spacing="lg">
                <Stack gap={2}>
                  <Text fw={700} size="xs" c="dimmed" tt="uppercase">NIDN</Text>
                  <Text size="sm" fw={600}>{user?.nidn || "-"}</Text>
                </Stack>
                <Stack gap={2}>
                  <Text fw={700} size="xs" c="dimmed" tt="uppercase">Jabatan</Text>
                  <Text size="sm" fw={600}>{user?.jabatan || "-"}</Text>
                </Stack>
              </SimpleGrid>
            </>
          )}
        </Paper>

        <Modal
          opened={opened}
          onClose={close}
          title="Edit Profil"
          size="lg"
          radius="md"
        >
          <Stack gap="md">
            <TextInput
              label="Nama Lengkap"
              placeholder="Nama Anda"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
            <SimpleGrid cols={2}>
              <TextInput
                label="Email"
                placeholder="email@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextInput
                label="Nomor HP"
                placeholder="0812..."
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
              />
            </SimpleGrid>
            <Textarea
              label="Alamat"
              placeholder="Alamat lengkap"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              minRows={2}
            />

            {roles.includes("mahasiswa") && (
              <SimpleGrid cols={2}>
                <TextInput
                  type="number"
                  label="Semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                />
                <TextInput
                  type="number"
                  step="0.01"
                  label="IPK"
                  value={formData.ipk}
                  onChange={(e) => setFormData({ ...formData, ipk: e.target.value })}
                />
              </SimpleGrid>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="light" color="gray" onClick={close}>
                Batal
              </Button>
              <Button
                color="indigo"
                onClick={handleUpdateProfile}
                loading={isUpdatingProfile}
                leftSection={<IconCheck size={16} />}
              >
                Simpan Perubahan
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Paper withBorder p="md" radius="md">
          <Text fw={800} size="sm" mb="md" tt="uppercase" lts={1} c="indigo">
            Keamanan Akun
          </Text>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PasswordInput
                size="xs"
                label="Kata Sandi Saat Ini"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                leftSection={<IconLock size={14} />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PasswordInput
                size="xs"
                label="Kata Sandi Baru"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                leftSection={<IconLock size={14} />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PasswordInput
                size="xs"
                label="Konfirmasi Kata Sandi Baru"
                value={passwordData.new_password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                leftSection={<IconLock size={14} />}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Button
                variant="filled"
                color="indigo"
                size="xs"
                onClick={handleUpdatePassword}
                loading={isChangingPassword}
                leftSection={<IconCheck size={14} />}
              >
                Ganti Kata Sandi
              </Button>
            </Grid.Col>
          </Grid>
        </Paper>

        {roles.includes("mahasiswa") && <MyDocuments />}

        {(isDosenOrKaprodi || roles.includes("mahasiswa")) && (
          <SignatureUpload
            currentUrl={user?.url_ttd}
            nip={nimNip}
            onUploadSuccess={(url: string) => {
              // Automatically sync the new URL to profile
              updateProfileAsync({ url_ttd: url });
            }}
          />
        )}
      </Stack>
    </Container>
  );
}
