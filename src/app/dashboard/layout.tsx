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
  Affix,
  Paper,
  ThemeIcon,
  Button,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { NavbarNested } from "@/components/NavbarNested/NavbarNested";
import { useMantineColorScheme } from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconAlertCircle,
  IconMinus,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProfileCompletionModal } from "@/features/auth/components/ProfileCompletionModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isAlertMinimized, setIsAlertMinimized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { userResponse, isLoadingProfile, isAuthenticated, isDefaultPassword } =
    useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isLoadingProfile && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [mounted, isLoadingProfile, isAuthenticated, router]);

  const isMobile = useMediaQuery("(max-width: 48em)");
  const [opened, { toggle, open, close }] = useDisclosure(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  // Handle initial state and responsiveness
  useEffect(() => {
    if (isMobile) {
      close();
    } else {
      open();
    }
  }, [isMobile]);

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
        <Loader color="var(--gs-primary)" size="lg" />
      </Container>
    );
  }

  if (!isAuthenticated || !userResponse) {
    return null;
  }

  return (
    <AppShell
      layout="alt"
      header={{ height: 64 }}
      navbar={{
        width: { base: 280, sm: opened ? 260 : 80 },
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
          borderBottom: "1px solid var(--gs-border)",
        }}
      >
        <Stack gap={0} w="100%">
          <Group h={64} px="xl" justify="space-between">
            <Group gap="lg">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                color="var(--gs-primary)"
              />
              <Text
                size="sm"
                fw={800}
                className="text-gs-text-primary uppercase tracking-widest"
              >
                DASHBOARD
              </Text>
            </Group>
          </Group>
        </Stack>
      </AppShell.Header>

      <AppShell.Navbar
        style={{
          borderRight: "1px solid var(--gs-border)",
          boxShadow: isMobile && opened ? "var(--mantine-shadow-xl)" : "none",
          maxWidth: isMobile ? 280 : undefined,
        }}
      >
        <NavbarNested opened={opened} onToggle={toggle} />
      </AppShell.Navbar>

      <AppShell.Main bg="var(--mantine-color-body)">
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)]">
          {children}
        </div>
        <ProfileCompletionModal />
      </AppShell.Main>

      {isDefaultPassword && (
        <Affix position={{ bottom: 24, right: 24 }} zIndex={1000}>
          {isAlertMinimized ? (
            <Tooltip
              label="Peringatan Keamanan"
              position="left"
              withArrow
              radius="md"
            >
              <ActionIcon
                onClick={() => setIsAlertMinimized(false)}
                variant="filled"
                size={54}
                radius="xl"
                className="bg-gs-danger shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:scale-110 transition-transform duration-300 animate-in zoom-in-50"
              >
                <IconAlertCircle size={28} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Paper
                withBorder
                p="md"
                radius="xl"
                className="w-full max-w-[320px] bg-white border-gs-danger-border shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              >
                <Group
                  justify="space-between"
                  align="flex-start"
                  mb="xs"
                  wrap="nowrap"
                >
                  <Group gap="md" wrap="nowrap" align="center">
                    <ThemeIcon
                      color="var(--gs-danger)"
                      variant="light"
                      size="lg"
                      radius="lg"
                      className="bg-gs-danger-bg"
                    >
                      <IconAlertCircle
                        size={20}
                        className="text-gs-danger-text"
                      />
                    </ThemeIcon>
                    <Text fw={800} size="sm" className="text-gs-text-primary">
                      KEAMANAN AKUN
                    </Text>
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="var(--gs-text-muted)"
                    size="sm"
                    radius="md"
                    onClick={() => setIsAlertMinimized(true)}
                    className="hover:bg-gs-bg-hover"
                  >
                    <IconMinus size={16} />
                  </ActionIcon>
                </Group>

                <Stack gap={10} mt="xs">
                  <Text size="xs" c="dimmed" fw={500} lh={1.5}>
                    Anda masih menggunakan kata sandi default. Segera perbarui
                    kata sandi Anda.
                  </Text>
                  <Link
                    href="/dashboard/profile#keamanan"
                    className="no-underline"
                  >
                    <Button
                      variant="filled"
                      className="bg-gs-danger hover:bg-gs-danger-hover font-bold tracking-tight transition-all"
                      size="xs"
                      fullWidth
                      radius="md"
                    >
                      GANTI PASSWORD
                    </Button>
                  </Link>
                </Stack>
              </Paper>
            </div>
          )}
        </Affix>
      )}
    </AppShell>
  );
}
