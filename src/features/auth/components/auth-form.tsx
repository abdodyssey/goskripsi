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
      p={40}
      className="w-full bg-white dark:bg-slate-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]"
    >
      <Box mb={32}>
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">G</div>
          <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">GoSkripsi</span>
        </div>

        <Title order={1} fw={800} fz={28} className="tracking-tight text-slate-900 dark:text-white mb-2">
          Selamat Datang
        </Title>
        <Text c="dimmed" size="sm" className="leading-relaxed">
          Gunakan NIM dan kata sandi Anda untuk mengakses portal manajemen skripsi.
        </Text>
      </Box>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="xl">
          <TextInput
            label="NIM / Username"
            placeholder="Contoh: 23051450225"
            size="md"
            radius="lg"
            leftSection={<IconUser size={18} stroke={1.5} className="text-indigo-500" />}
            styles={{
              input: { backgroundColor: 'var(--mantine-color-gray-0)', border: 'none' },
              label: { marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--mantine-color-slate-7)' },
            }}
            {...form.getInputProps("username")}
          />

          <PasswordInput
            label="Kata Sandi"
            placeholder="Masukkan kata sandi"
            size="md"
            radius="lg"
            leftSection={<IconLock size={18} stroke={1.5} className="text-indigo-500" />}
            styles={{
              input: { backgroundColor: 'var(--mantine-color-gray-0)', border: 'none' },
              label: { marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--mantine-color-slate-7)' },
            }}
            {...form.getInputProps("password")}
          />

          <Box>
            <Button
              type="submit"
              fullWidth
              size="md"
              radius="lg"
              h={54}
              loading={isLoggingIn}
              className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200 dark:shadow-none"
              styles={{
                label: { fontSize: 16, fontWeight: 700 },
              }}
            >
              Masuk ke Dashboard
            </Button>
          </Box>

          <Alert color="blue" radius="lg" variant="light" p="md">
            <Text size="xs" c="blue.9" style={{ lineHeight: 1.6 }}>
              <b>Informasi Login Mahasiswa:</b><br/>
              Gunakan <b>NIM</b> sebagai Username. Jika ini adalah pertama kalinya Anda login, gunakan <b>NIM</b> Anda juga sebagai kata sandi default.
            </Text>
          </Alert>

          <Text ta="center" size="xs" c="dimmed">
            &copy; {new Date().getFullYear()} Fakultas Sains dan Teknologi <br/>
            UIN Raden Fatah Palembang
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
