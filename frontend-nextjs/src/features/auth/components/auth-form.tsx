"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../schemas/auth.schema";
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
import { IconUser, IconLock, IconShieldCheck } from "@tabler/icons-react";

export function AuthForm() {
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <Paper
      radius="24px"
      p={40}
      withBorder
      className="w-full max-w-[440px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl"
    >
      <Box ta="center" mb={35}>
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-2xl border border-border scale-110 bg-primary-light">
            <IconShieldCheck
              size={38}
              className="text-indigo-900 dark:text-indigo-400"
              stroke={1.5}
            />
          </div>
        </div>

        <Text
          size="sm"
          fw={800}
          tt="uppercase"
          lts={2}
          mb={8}
          className="tracking-[0.2em]"
          c="var(--mantine-primary-color-filled)"
        >
          GoSkripsi
        </Text>
        <Title order={2} fw={700} fz={28}>
          Silakan masuk
        </Title>
        <Text c="dimmed" size="sm" mt={8}>
          Masukkan kredensial Anda untuk melanjutkan
        </Text>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="xl">
          <TextInput
            label="Username (NIP / NIM)"
            placeholder="23051450225"
            size="md"
            radius="md"
            leftSection={<IconUser size={18} stroke={1.5} />}
            styles={{
              label: {
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
              },
            }}
            error={errors.username?.message}
            {...register("username")}
          />

          <PasswordInput
            label="Kata Sandi"
            placeholder="••••••••"
            size="md"
            radius="md"
            leftSection={<IconLock size={18} stroke={1.5} />}
            styles={{
              label: {
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
              },
            }}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            radius="md"
            h={52}
            loading={isLoggingIn}
            className="shadow-lg shadow-indigo-900/20 dark:shadow-indigo-400/10 active:scale-[0.98] transition-all duration-200"
            styles={{
              label: { fontSize: 16, fontWeight: 600 },
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
