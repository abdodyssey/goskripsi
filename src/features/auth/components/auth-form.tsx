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
      p={32}
      withBorder
      className="w-full max-w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl"
    >
      <Box ta="center" mb={28}>
        <div className="flex justify-center mb-5">
          <Image
            src="/uin-logo.png"
            alt="UIN Logo"
            width={85}
            height={85}
            className="object-contain"
          />
        </div>

        <Text
          size="xs"
          fw={700}
          tt="uppercase"
          lts={3}
          mb={4}
          className="tracking-[0.3em]"
          c="dimmed"
        >
          GoSkripsi
        </Text>
        <Title order={2} fw={800} fz={22} className="tracking-tight text-slate-900 dark:text-white">
          Silakan masuk
        </Title>
        <Text c="dimmed" size="xs" mt={4} className="max-w-[260px] mx-auto leading-relaxed">
          Masukkan kredensial Anda untuk mengakses sistem informasi skripsi
        </Text>
      </Box>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="lg">
          <TextInput
            label="Username"
            placeholder="23051450225"
            size="sm"
            radius="md"
            leftSection={<IconUser size={16} stroke={1.5} />}
            styles={{
              label: {
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 600,
              },
            }}
            {...form.getInputProps("username")}
          />

          <PasswordInput
            label="Kata Sandi"
            placeholder="••••••••"
            size="sm"
            radius="md"
            leftSection={<IconLock size={16} stroke={1.5} />}
            styles={{
              label: {
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 600,
              },
            }}
            {...form.getInputProps("password")}
          />

          <Button
            type="submit"
            fullWidth
            size="sm"
            radius="md"
            h={46}
            loading={isLoggingIn}
            className="shadow-md shadow-indigo-900/10 dark:shadow-indigo-400/5 active:scale-[0.98] transition-all duration-200"
            styles={{
              label: { fontSize: 14, fontWeight: 600 },
            }}
          >
            Masuk
          </Button>

          <Text ta="center" size="xs" c="dimmed" mt="xs">
            &copy; {new Date().getFullYear()} Fakultas Sains dan Teknologi.
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
