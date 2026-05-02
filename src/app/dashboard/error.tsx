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
        <ThemeIcon color="var(--gs-danger)" size="xl" radius="xl" variant="light" className="bg-gs-danger-bg">
          <IconAlertCircle size={32} className="text-gs-danger-text" />
        </ThemeIcon>
        <Title order={2} fw={600}>
          Gagal Memuat Dashboard
        </Title>
        <Text c="dimmed">
          Pastikan koneksi internet stabil dan server sedang berjalan.
        </Text>
        <Button 
          onClick={() => reset()} 
          mt="md" 
          className="bg-gs-primary hover:bg-gs-primary-hover"
          radius="md"
          fw={700}
        >
          COBA LAGI
        </Button>
      </Stack>
    </Container>
  );
}
