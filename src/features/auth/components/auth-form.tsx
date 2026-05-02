"use client";

import { useForm } from "@mantine/form";
import { LoginInput } from "../schemas/auth.schema";
import { useAuth } from "../hooks/use-auth";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Box,
  ThemeIcon,
} from "@mantine/core";
import { IconUser, IconLock, IconInfoCircle } from "@tabler/icons-react";

export function AuthForm() {
  const { login, isLoggingIn } = useAuth();

  const form = useForm<LoginInput>({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) => (value.length < 1 ? "Username harus diisi" : null),
      password: (value) => (value.length < 1 ? "Kata sandi harus diisi" : null),
    },
  });

  const onSubmit = (values: LoginInput) => {
    login(values);
  };

  return (
    <Paper
      radius="28px"
      p={40}
      className="w-full bg-white border border-gs-border shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)]"
    >
      <Box mb={40}>
        <Title
          order={1}
          className="text-3xl text-gs-text-primary mb-3"
          fw={400}
        >
          Selamat Datang
        </Title>
        <Text size="sm" className="text-gs-text-secondary font-medium leading-relaxed max-w-[320px]">
          Silakan masuk dengan akun sistem informasi akademik Anda untuk melanjutkan.
        </Text>
      </Box>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="xl">
          <TextInput
            label="Username / NIM"
            placeholder="Masukkan nomor induk"
            size="md"
            radius="lg"
            leftSection={
              <IconUser size={18} stroke={2} className="text-gs-text-muted" />
            }
            styles={{
              input: {
                backgroundColor: "var(--gs-bg-overlay)",
                border: "1.5px solid transparent",
                height: "54px",
                transition: "all 0.2s ease",
              },
              label: {
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--gs-text-primary)",
              },
            }}
            className="focus-within:scale-[1.01] transition-transform duration-200"
            {...form.getInputProps("username")}
          />

          <PasswordInput
            label="Kata Sandi"
            placeholder="Masukkan kata sandi"
            size="md"
            radius="lg"
            leftSection={
              <IconLock size={18} stroke={2} className="text-gs-text-muted" />
            }
            styles={{
              input: {
                backgroundColor: "var(--gs-bg-overlay)",
                border: "1.5px solid transparent",
                height: "54px",
                transition: "all 0.2s ease",
              },
              innerInput: {
                height: "50px",
              },
              label: {
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--gs-text-primary)",
              },
            }}
            className="focus-within:scale-[1.01] transition-transform duration-200"
            {...form.getInputProps("password")}
          />

          <Box mt="md">
            <Button
              type="submit"
              fullWidth
              size="md"
              radius="lg"
              h={56}
              loading={isLoggingIn}
              className="bg-gs-primary hover:bg-gs-primary-hover transition-all duration-300 shadow-xl shadow-gs-primary/10 active:scale-[0.98]"
              styles={{
                label: { fontSize: 16, fontWeight: 500 },
              }}
            >
              Autentikasi Sekarang
            </Button>
          </Box>

          <div className="flex gap-4 p-4 rounded-2xl bg-gs-bg-overlay border border-gs-border">
            <ThemeIcon color="dark" variant="light" size="lg" radius="md" className="bg-gs-primary/5">
              <IconInfoCircle size={20} className="text-gs-text-primary" />
            </ThemeIcon>
            <div className="flex flex-col">
              <Text size="xs" fw={600} className="text-gs-text-primary mb-0.5">Petunjuk Akses</Text>
              <Text size="xs" className="text-gs-text-secondary" fw={500} style={{ lineHeight: 1.4 }}>
                Mahasiswa baru dapat menggunakan <b>NIM</b> sebagai username dan password awal.
              </Text>
            </div>
          </div>
        </Stack>
      </form>
    </Paper>
  );
}
