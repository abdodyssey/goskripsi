"use client";

import Image from "next/image";
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
  Alert,
} from "@mantine/core";
import { IconUser, IconLock } from "@tabler/icons-react";

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
      radius="24px"
      p={32}
      className="w-full bg-white dark:bg-slate-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]"
    >
      <Box mb={24}>
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <Image src="/uin-logo.png" alt="UIN Logo" width={32} height={32} className="object-contain" />
          <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">
            GoSkripsi
          </span>
        </div>

        <Title
          order={1}
          fw={700}
          fz={24}
          className="tracking-tight text-slate-900 dark:text-white mb-1"
        >
          Selamat Datang
        </Title>
        <Text c="dimmed" size="sm" className="leading-relaxed">
          Gunakan NIM dan kata sandi Anda untuk mengakses portal manajemen
          skripsi.
        </Text>
      </Box>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Username"
            placeholder="Contoh: 23051450225"
            size="sm"
            radius="md"
            leftSection={
              <IconUser size={16} stroke={1.5} className="text-indigo-500" />
            }
            styles={{
              input: {
                backgroundColor: "var(--mantine-color-gray-0)",
                border: "none",
              },
              label: {
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--mantine-color-slate-7)",
              },
            }}
            {...form.getInputProps("username")}
          />

          <PasswordInput
            label="Kata Sandi"
            placeholder="Masukkan kata sandi"
            size="sm"
            radius="md"
            leftSection={
              <IconLock size={16} stroke={1.5} className="text-indigo-500" />
            }
            styles={{
              input: {
                backgroundColor: "var(--mantine-color-gray-0)",
                border: "none",
              },
              label: {
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--mantine-color-slate-7)",
              },
            }}
            {...form.getInputProps("password")}
          />

          <Box mt="xs">
            <Button
              type="submit"
              fullWidth
              size="sm"
              radius="md"
              h={48}
              loading={isLoggingIn}
              className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200 dark:shadow-none"
              styles={{
                label: { fontSize: 14, fontWeight: 600 },
              }}
            >
              Masuk 
            </Button>
          </Box>

          <Alert color="blue" radius="md" variant="light" p="xs">
            <Text size="xs" c="blue.9" style={{ lineHeight: 1.5 }}>
              <b>Informasi Login Mahasiswa:</b>
              <br />
              Gunakan <b>NIM</b> sebagai Username & Password awal.
            </Text>
          </Alert>

          <Text ta="center" size="xs" c="dimmed">
            &copy; {new Date().getFullYear()} FST UIN Raden Fatah
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
