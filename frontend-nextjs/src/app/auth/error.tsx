"use client";

import { useEffect } from "react";
import { Container, Title, Text, Button, Stack } from "@mantine/core";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth routing error:", error);
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
        <Title order={2} c="red.7">
          Terjadi Kesalahan
        </Title>
        <Text c="dimmed">Gagal memuat halaman otentikasi.</Text>
        <Button onClick={() => reset()} variant="outline" color="indigo.9">
          Coba Lagi
        </Button>
      </Stack>
    </Container>
  );
}
