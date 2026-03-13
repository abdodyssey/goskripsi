"use client";

import { useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard routing error:", error);
  }, [error]);

  return (
    <Container
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack align="center" gap="md">
        <ThemeIcon color="red" size="xl" radius="xl" variant="light">
          <IconAlertCircle size={32} />
        </ThemeIcon>
        <Title order={2} fw={800}>
          Gagal Memuat Dashboard
        </Title>
        <Text c="dimmed">
          Pastikan koneksi internet stabil dan server sedang berjalan.
        </Text>
        <Button onClick={() => reset()} mt="md" color="indigo">
          Coba Lagi
        </Button>
      </Stack>
    </Container>
  );
}
