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
  const [isEditing, setIsEditing] = useState(false);
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
      setIsEditing(true);
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
      setIsEditing(false);
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

      <Stack gap="lg">
        <Paper withBorder p="xl" radius="md">
          <Group justify="space-between" align="center">
            <Group>
              <Avatar size={100} radius={100} color="indigo" variant="light">
                <IconUser size={50} />
              </Avatar>
              <Stack gap={2}>
                {isEditing ? (
                  <TextInput
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    size="lg"
                    fw={700}
                    style={{ width: 300 }}
                  />
                ) : (
                  <Title order={2}>{user?.nama}</Title>
                )}
                <Text c="dimmed" size="sm">
                  {user?.email}
                </Text>
                <Group gap="xs" mt="xs">
                  {roles.map((role: string) => (
                    <Badge key={role} variant="filled" color="indigo">
                      {role.toUpperCase()}
                    </Badge>
                  ))}
                  <Badge
                    variant="dot"
                    color={displayStatus === "aktif" ? "green" : "gray"}
                  >
                    {displayStatus}
                  </Badge>
                </Group>
              </Stack>
            </Group>

            <Group>
              {isEditing ? (
                <>
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => setIsEditing(false)}
                    leftSection={<IconX size={16} />}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="filled"
                    color="indigo"
                    onClick={handleUpdateProfile}
                    loading={isUpdatingProfile}
                    leftSection={<IconCheck size={16} />}
                  >
                    Simpan
                  </Button>
                </>
              ) : (
                <Button
                  variant="light"
                  color="indigo"
                  onClick={handleStartEditing}
                  leftSection={<IconEdit size={16} />}
                >
                  Edit Profil
                </Button>
              )}
            </Group>
          </Group>
        </Paper>

        <Paper withBorder p="xl" radius="md">
          <Title order={3} mb="md">
            Informasi Personal
          </Title>
          <Divider mb="xl" />

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text fw={700} size="sm" c="dimmed">
                  NIM / NIP
                </Text>
                <Text>{nimNip}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text fw={700} size="sm" c="dimmed">
                  Program Studi
                </Text>
                <Text>{displayProdi}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text fw={700} size="sm" c="dimmed">
                  Email
                </Text>
                {isEditing ? (
                  <TextInput
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                ) : (
                  <Text>{user?.email || "-"}</Text>
                )}
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text fw={700} size="sm" c="dimmed">
                  Nomor HP
                </Text>
                {isEditing ? (
                  <TextInput
                    value={formData.no_hp}
                    onChange={(e) =>
                      setFormData({ ...formData, no_hp: e.target.value })
                    }
                  />
                ) : (
                  <Text>{user?.no_hp || "-"}</Text>
                )}
              </Stack>
            </Grid.Col>

            <Grid.Col span={12}>
              <Stack gap="xs">
                <Text fw={700} size="sm" c="dimmed">
                  Alamat
                </Text>
                {isEditing ? (
                  <Textarea
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    autosize
                    minRows={2}
                  />
                ) : (
                  <Text>{user?.alamat || "-"}</Text>
                )}
              </Stack>
            </Grid.Col>

            {/* Academic Specific Fields */}
            {roles.includes("mahasiswa") && (
              <>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      Angkatan
                    </Text>
                    <Text>{user?.angkatan || "-"}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      Semester
                    </Text>
                    {isEditing ? (
                      <TextInput
                        type="number"
                        value={formData.semester}
                        onChange={(e) =>
                          setFormData({ ...formData, semester: e.target.value })
                        }
                      />
                    ) : (
                      <Text>{user?.semester || "-"}</Text>
                    )}
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      IPK
                    </Text>
                    {isEditing ? (
                      <TextInput
                        type="number"
                        step="0.01"
                        min={0}
                        max={4}
                        value={formData.ipk}
                        onChange={(e) =>
                          setFormData({ ...formData, ipk: e.target.value })
                        }
                      />
                    ) : (
                      <Text>{user?.ipk || "-"}</Text>
                    )}
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      Peminatan
                    </Text>
                    <Text>{user?.peminatan?.nama_peminatan || "-"}</Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      Dosen Pembimbing Akademik
                    </Text>
                    <Text>{user?.dosen_pa?.nama || "-"}</Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      Pembimbing 1
                    </Text>
                    <Text>{user?.pembimbing_1?.nama || "-"}</Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      Pembimbing 2
                    </Text>
                    <Text>{user?.pembimbing_2?.nama || "-"}</Text>
                  </Stack>
                </Grid.Col>
              </>
            )}

            {isDosenOrKaprodi && (
              <>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      NIDN
                    </Text>
                    <Text>{user?.nidn || "-"}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="dimmed">
                      Jabatan
                    </Text>
                    <Text>{user?.jabatan || "-"}</Text>
                  </Stack>
                </Grid.Col>
              </>
            )}
          </Grid>
        </Paper>

        <Paper withBorder p="xl" radius="md">
          <Title order={3} mb="md">
            Keamanan Akun
          </Title>
          <Divider mb="xl" />

          <Stack gap="md" maw={500}>
            <PasswordInput
              label="Kata Sandi Saat Ini"
              placeholder="Masukkan kata sandi lama Anda"
              value={passwordData.current_password}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  current_password: e.target.value,
                })
              }
              leftSection={<IconLock size={16} />}
            />

            <PasswordInput
              label="Kata Sandi Baru"
              placeholder="Minimal 8 karakter"
              value={passwordData.new_password}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  new_password: e.target.value,
                })
              }
              leftSection={<IconLock size={16} />}
            />

            <PasswordInput
              label="Konfirmasi Kata Sandi Baru"
              placeholder="Ulangi kata sandi baru"
              value={passwordData.new_password_confirmation}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  new_password_confirmation: e.target.value,
                })
              }
              leftSection={<IconLock size={16} />}
            />

            <Button
              variant="filled"
              color="indigo"
              onClick={handleUpdatePassword}
              loading={isChangingPassword}
              mt="md"
              leftSection={<IconCheck size={16} />}
            >
              Ganti Kata Sandi
            </Button>
          </Stack>
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
