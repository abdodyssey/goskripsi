"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Box,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { IconSearch, IconArrowLeft, IconHome } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./not-found.module.css";

export default function NotFoundPage() {
  return (
    <Box className={classes.root}>
      <Container size="md">
        <Stack align="center" gap={40} className={classes.inner}>
          <Box className={classes.imageWrapper}>
            <div className={classes.blob}></div>
            <ThemeIcon
              size={120}
              radius={rem(40)}
              variant="light"
              color="indigo"
              className={classes.mainIcon}
            >
              <IconSearch size={60} stroke={1.5} />
            </ThemeIcon>
          </Box>

          <Stack align="center" gap="xs">
            <Text className={classes.label}>404</Text>
            <Title className={classes.title}>Halaman Tidak Ditemukan</Title>
            <Text
              c="dimmed"
              size="lg"
              ta="center"
              className={classes.description}
            >
              Sepertinya Anda tersesat di perpustakaan digital kami. Halaman
              yang Anda cari mungkin telah dipindahkan, dihapus, atau sedang
              dalam revisi skripsi.
            </Text>
          </Stack>

          <Group justify="center" gap="md" className={classes.controls}>
            <Button
              component={Link}
              href="/dashboard"
              size="md"
              variant="filled"
              color="indigo"
              leftSection={<IconHome size={18} />}
              className={classes.control}
              radius="md"
            >
              Kembali ke Dashboard
            </Button>
            <Button
              onClick={() => window.history.back()}
              size="md"
              variant="light"
              color="indigo"
              leftSection={<IconArrowLeft size={18} />}
              className={classes.control}
              radius="md"
            >
              Kembali Sebelumnya
            </Button>
          </Group>
        </Stack>
      </Container>

      {/* Decorative background elements */}
      <div className={classes.decorator1}></div>
      <div className={classes.decorator2}></div>
    </Box>
  );
}
