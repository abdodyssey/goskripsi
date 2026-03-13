"use client";

import { Container, Loader, Text, Stack } from "@mantine/core";

export default function AuthLoading() {
  return (
    <Container
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack align="center" gap="sm">
        <Loader color="indigo.9" size="lg" />
        <Text c="dimmed">Memuat Formulir...</Text>
      </Stack>
    </Container>
  );
}
