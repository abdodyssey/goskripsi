"use client";

import { Modal, Stack, TextInput, NumberInput, PasswordInput, Button, Text, Title, Alert, Group, Divider, Box, Center, ThemeIcon, Grid } from "@mantine/core";
import { useAuth } from "../hooks/use-auth";
import { useState, useEffect } from "react";
import { IconAlertCircle, IconCheck, IconLock, IconMail, IconChartBar, IconNumber } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export function ProfileCompletionModal() {
  const { userResponse, isDefaultPassword, updateProfileAsync, changePasswordAsync, logout } = useAuth();
  const user = userResponse?.user;
  const roles = userResponse?.roles || [];
  const isMahasiswa = roles.includes("mahasiswa");

  const [opened, setOpened] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [ipk, setIpk] = useState<number | string>(0);
  const [semester, setSemester] = useState<number | string>(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isMahasiswa) {
      const isDefaultEmail = user.email?.includes("example.com") || user.email === user.username;
      const isDefaultIpk = Number(user.ipk) === 0;
      const isDefaultSemester = Number(user.semester) === 1;
      
      if (isDefaultEmail || isDefaultIpk || isDefaultSemester || isDefaultPassword) {
        setOpened(true);
        setEmail(user.email || "");
        setIpk(Number(user.ipk) || 0);
        setSemester(Number(user.semester) || 1);
      } else {
        setOpened(false);
      }
    }
  }, [user, isMahasiswa, isDefaultPassword]);

  const handleComplete = async () => {
    if (!email || !email.includes("@")) {
      notifications.show({ title: "Error", message: "Email tidak valid", color: "red" });
      return;
    }
    
    if (Number(ipk) < 0 || Number(ipk) > 4) {
      notifications.show({ title: "Error", message: "IPK harus antara 0.00 - 4.00", color: "red" });
      return;
    }

    if (Number(semester) < 1 || Number(semester) > 14) {
      notifications.show({ title: "Error", message: "Semester tidak valid", color: "red" });
      return;
    }

    if (isDefaultPassword) {
      if (!newPassword || newPassword.length < 6) {
        notifications.show({ title: "Error", message: "Kata sandi baru minimal 6 karakter", color: "red" });
        return;
      }
      if (newPassword !== confirmPassword) {
        notifications.show({ title: "Error", message: "Konfirmasi kata sandi tidak cocok", color: "red" });
        return;
      }
    }

    setIsLoading(true);
    try {
      // 1. Update Profile (Email, IPK, Semester)
      await updateProfileAsync({
        email,
        ipk: Number(ipk),
        semester: Number(semester)
      });

      // 2. Change Password if it was default
      if (isDefaultPassword) {
        await changePasswordAsync({
          current_password: user?.username || "", // Default password is usually NIM/Username
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        });
      }

      notifications.show({
        title: "Berhasil",
        message: "Profil Anda telah dilengkapi. Silakan lanjut menggunakan aplikasi.",
        color: "teal",
        icon: <IconCheck size={18} />
      });
      
      setOpened(false);
    } catch (err: any) {
      notifications.show({
        title: "Gagal",
        message: err?.response?.data?.message || "Terjadi kesalahan saat memperbarui profil",
        color: "red"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}} // Cannot close manually
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      size="lg"
      centered
      radius="lg"
      padding="xl"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="md">
        <Center>
          <ThemeIcon size={60} radius={60} color="indigo" variant="light">
            <IconAlertCircle size={32} />
          </ThemeIcon>
        </Center>
        
        <Box ta="center">
          <Title order={3}>Lengkapi Profil Anda</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Halo <b>{user?.nama}</b>, demi kelancaran administrasi skripsi, Anda wajib melengkapi data profil berikut sebelum dapat melanjutkan.
          </Text>
        </Box>

        <Divider />

        <Grid gutter="md">
          <Grid.Col span={12}>
            <TextInput
              label="Alamat Email (Gmail Aktif)"
              placeholder="nama@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              leftSection={<IconMail size={16} />}
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <NumberInput
              label="IPK Terakhir"
              placeholder="0.00"
              value={ipk}
              onChange={setIpk}
              min={0}
              max={4}
              step={0.01}
              decimalScale={2}
              required
              leftSection={<IconChartBar size={16} />}
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <NumberInput
              label="Semester"
              placeholder="1"
              value={semester}
              onChange={setSemester}
              min={1}
              max={14}
              required
              leftSection={<IconNumber size={16} />}
            />
          </Grid.Col>

          {isDefaultPassword && (
            <>
              <Grid.Col span={12}>
                <Alert color="orange" variant="light" icon={<IconLock size={16} />}>
                  <Text size="xs">
                    Anda masih menggunakan kata sandi bawaan. Silakan ganti dengan kata sandi baru yang aman.
                  </Text>
                </Alert>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <PasswordInput
                  label="Kata Sandi Baru"
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.currentTarget.value)}
                  required
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <PasswordInput
                  label="Konfirmasi Kata Sandi"
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  required
                />
              </Grid.Col>
            </>
          )}
        </Grid>

        <Group justify="space-between" mt="xl">
          <Button variant="subtle" color="gray" onClick={logout}>
            Keluar
          </Button>
          <Button 
            color="indigo" 
            size="md" 
            radius="md" 
            onClick={handleComplete}
            loading={isLoading}
            leftSection={<IconCheck size={18} />}
          >
            Simpan & Lanjutkan
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
