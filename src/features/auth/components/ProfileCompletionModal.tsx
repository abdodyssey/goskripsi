"use client";

import { Modal, Stack, TextInput, NumberInput, PasswordInput, Button, Text, Title, Alert, Group, Divider, Box, Center, ThemeIcon, Grid } from "@mantine/core";
import { useAuth } from "../hooks/use-auth";
import { useState, useEffect } from "react";
import { IconAlertCircle, IconCheck, IconLock, IconMail, IconChartBar, IconNumber } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export function ProfileCompletionModal() {
  const { userResponse, isDefaultPassword, updateProfileAsync, changePasswordAsync, logout } = useAuth();
  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];
  const isMahasiswa = (Array.isArray(roles) ? roles.includes("mahasiswa") : false);
  const isStaffOrLecturer = Array.isArray(roles) && (roles.includes("dosen") || roles.includes("kaprodi") || roles.includes("sekprodi") || roles.includes("admin_prodi") || roles.includes("superadmin"));
  const shouldShowAkademik = isMahasiswa && !isStaffOrLecturer;


  const [opened, setOpened] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [ipk, setIpk] = useState<number | string>(0);
  const [semester, setSemester] = useState<number | string>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const isDefaultEmail = user.email?.includes("example.com") || user.email === user.username;
      let shouldOpen = false;

      if (shouldShowAkademik) {
        const isDefaultIpk = Number(user.ipk) === 0;
        const isDefaultSemester = Number(user.semester) === 1;
        if (isDefaultEmail || isDefaultIpk || isDefaultSemester || isDefaultPassword) {
          shouldOpen = true;
        }

      } else {
        if (isDefaultEmail || isDefaultPassword) {
          shouldOpen = true;
        }
      }
      
      if (shouldOpen) {
        setOpened(true);
        setEmail(user.email || "");
        if (shouldShowAkademik) {
          setIpk(Number(user.ipk) || 0);
          setSemester(Number(user.semester) || 1);
        }

      } else {
        setOpened(false);
      }
    }
  }, [user, isMahasiswa, isDefaultPassword]);

  const handleComplete = async () => {
    if (!email || !email.includes("@")) {
      notifications.show({ title: "Error", message: "Email tidak valid", color: "var(--gs-danger)" });
      return;
    }
    
    if (shouldShowAkademik) {
        if (Number(ipk) < 0 || Number(ipk) > 4) {

        notifications.show({ title: "Error", message: "IPK harus antara 0.00 - 4.00", color: "var(--gs-danger)" });
        return;
      }

      if (Number(semester) < 1 || Number(semester) > 14) {
        notifications.show({ title: "Error", message: "Semester tidak valid", color: "var(--gs-danger)" });
        return;
      }
    }

    if (isDefaultPassword) {
      if (!currentPassword) {
        notifications.show({ title: "Error", message: "Kata sandi saat ini wajib diisi", color: "var(--gs-danger)" });
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        notifications.show({ title: "Error", message: "Kata sandi baru minimal 6 karakter", color: "var(--gs-danger)" });
        return;
      }
      if (newPassword !== confirmPassword) {
        notifications.show({ title: "Error", message: "Konfirmasi kata sandi tidak cocok", color: "var(--gs-danger)" });
        return;
      }
    }

    setIsLoading(true);
    try {
      // 1. Update Profile
      const updateData: any = { email };
      if (shouldShowAkademik) {
        updateData.ipk = Number(ipk);
        updateData.semester = Number(semester);
      }
      await updateProfileAsync(updateData);

      // 2. Change Password if it was default
      if (isDefaultPassword) {
        await changePasswordAsync({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        });
      }

      notifications.show({
        title: "Berhasil",
        message: "Profil Anda telah dilengkapi. Silakan lanjut menggunakan aplikasi.",
        color: "var(--gs-success)",
        icon: <IconCheck size={18} />
      });
      
      setOpened(false);
    } catch (err: any) {
      notifications.show({
        title: "Gagal",
        message: err?.response?.data?.message || "Terjadi kesalahan saat memperbarui profil",
        color: "var(--gs-danger)"
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
      radius="xl"
      padding={40}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 8,
      }}
      styles={{
        content: { backgroundColor: 'var(--gs-bg-raised)' }
      }}
    >
      <Stack gap="xl">
        <Center>
          <ThemeIcon size={80} radius={80} color="var(--gs-primary)" variant="light" className="bg-gs-primary/5">
            <IconAlertCircle size={40} stroke={1.5} className="text-gs-primary" />
          </ThemeIcon>
        </Center>
        
        <Box ta="center">
          <Title order={3} className="text-gs-text-primary">Lengkapi Profil Anda</Title>
          <Text size="sm" className="text-gs-text-secondary" mt={8}>
            Halo <b>{user?.nama}</b>, demi kelancaran administrasi skripsi, Anda wajib melengkapi data profil berikut sebelum dapat melanjutkan.
          </Text>
        </Box>

        <Divider className="border-gs-border" />

        <Grid gutter="xl">
          <Grid.Col span={12}>
            <TextInput
              label="Alamat Email (Gmail Aktif)"
              placeholder="nama@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              leftSection={<IconMail size={18} stroke={1.5} className="text-gs-text-muted" />}
            />
          </Grid.Col>
          
          {shouldShowAkademik && (
            <>
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
                  leftSection={<IconChartBar size={18} stroke={1.5} className="text-gs-text-muted" />}
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
                  leftSection={<IconNumber size={18} stroke={1.5} className="text-gs-text-muted" />}
                />
              </Grid.Col>
            </>
          )}

          {isDefaultPassword && (
            <>
              <Grid.Col span={12}>
                <Alert color="var(--gs-warning)" variant="light" icon={<IconLock size={18} stroke={1.5} />} radius="lg">
                  <Text size="xs" className="text-gs-warning-text">
                    Anda masih menggunakan kata sandi bawaan. Silakan ganti dengan kata sandi baru yang aman.
                  </Text>
                </Alert>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <PasswordInput
                  label="Kata Sandi Saat Ini"
                  placeholder="Masukkan kata sandi saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.currentTarget.value)}
                  required
                />
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

        {shouldShowAkademik && (
          <Box p="md" className="bg-gs-bg-overlay border border-gs-border" style={{ borderRadius: 12 }}>
            <Text size="xs" className="text-gs-text-secondary" style={{ lineHeight: 1.6 }}>
              <b>Catatan:</b> Karena keterbatasan sinkronisasi data pusat, saat ini Anda diminta untuk menginput IPK dan Semester secara mandiri. Mohon pastikan data yang diisi <b>valid dan tidak dibuat-buat</b> demi kelancaran proses skripsi.
            </Text>
          </Box>
        )}

        <Group justify="space-between" mt="md">
          <Button variant="subtle" color="var(--gs-text-secondary)" onClick={logout}>
            Keluar
          </Button>
          <Button 
            className="bg-gs-primary hover:bg-gs-primary-hover"
            size="md" 
            radius="md" 
            h={48}
            onClick={handleComplete}
            loading={isLoading}
            leftSection={<IconCheck size={20} stroke={1.5} />}
            px="xl"
          >
            Simpan & Lanjutkan
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
