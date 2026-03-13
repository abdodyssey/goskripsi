"use client";

import { Container, Loader, Text, Stack } from "@mantine/core";

export default function DashboardLoading() {
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
        <Loader color="indigo.9" type="bars" size="xl" />
        <Text c="dimmed">Menyiapkan Dashboard Beranda...</Text>
      </Stack>
    </Container>
  );
}
