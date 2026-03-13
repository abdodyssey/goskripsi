"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  AppShell,
  Group,
  Text,
  Loader,
  Container,
  ActionIcon,
  Burger,
  Stack,
  Box,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { NavbarNested } from "@/components/NavbarNested/NavbarNested";
import { useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";

import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { userResponse, isLoadingProfile, isAuthenticated, isDefaultPassword } =
    useAuth();
  const isMobile = useMediaQuery("(max-width: 48em)");
  const [opened, { toggle }] = useDisclosure(isMobile ? false : true);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  if (!mounted || isLoadingProfile) {
    return (
      <Container
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader color="indigo.9" size="lg" />
      </Container>
    );
  }

  if (!isAuthenticated || !userResponse) {
    return (
      <Container
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text c="dimmed">Silakan login terlebih dahulu.</Text>
      </Container>
    );
  }

  return (
    <AppShell
      layout="alt"
      header={{ height: 64 }}
      navbar={{
        width: opened ? 300 : 80,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="0"
      transitionDuration={300}
      transitionTimingFunction="ease"
    >
      <AppShell.Header
        className="transition-all duration-300 border-b border-border"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Stack gap={0} w="100%">
          {isDefaultPassword && (
            <Box
              bg="red.7"
              py={4}
              px="xl"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <IconAlertCircle size={16} color="white" />
              <Text size="xs" fw={600} c="white">
                Anda masih menggunakan kata sandi default. Segera ganti kata
                sandi Anda demi keamanan akun.{" "}
                <Link
                  href="/dashboard/profile"
                  style={{ color: "white", textDecoration: "underline" }}
                >
                  Ganti di sini
                </Link>
              </Text>
            </Box>
          )}
          <Group h={64} px="xl" justify="space-between">
            <Group gap="lg">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                color="indigo"
              />
              <Text
                size="sm"
                fw={700}
                className="text-slate-900 dark:text-slate-100 uppercase tracking-widest"
              >
                Dashboard
              </Text>
            </Group>

            <Group gap="xs">
              <ActionIcon
                onClick={() => toggleColorScheme()}
                variant="light"
                color="indigo"
                size="lg"
                aria-label="Toggle color scheme"
                radius="md"
              >
                {colorScheme === "dark" ? (
                  <IconSun size={20} stroke={1.5} />
                ) : (
                  <IconMoon size={20} stroke={1.5} />
                )}
              </ActionIcon>
            </Group>
          </Group>
        </Stack>
      </AppShell.Header>

      <AppShell.Navbar>
        <NavbarNested opened={opened} onToggle={toggle} />
      </AppShell.Navbar>

      <AppShell.Main bg="var(--mantine-color-body)">
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
