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
        <Title order={2} className="text-gs-danger">
          Terjadi Kesalahan
        </Title>
        <Text c="dimmed">Gagal memuat halaman otentikasi.</Text>
        <Button 
          onClick={() => reset()} 
          variant="outline" 
          className="text-gs-primary border-gs-border hover:bg-gs-bg-hover"
          radius="md"
          fw={700}
        >
          COBA LAGI
        </Button>
      </Stack>
    </Container>
  );
}
