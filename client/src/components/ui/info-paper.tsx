"use client";

import {
  Paper,
  PaperProps,
  Text,
  Stack,
  Box,
  rem,
  MantineColor,
  Group,
  ThemeIcon,
} from "@mantine/core";
import React, { ReactNode } from "react";

interface InfoPaperProps extends PaperProps {
  title?: string;
  icon?: React.ElementType;
  iconColor?: MantineColor;
  children: ReactNode;
  rightSection?: ReactNode;
}

export function InfoPaper({
  title,
  icon: Icon,
  iconColor = "indigo",
  children,
  rightSection,
  ...props
}: InfoPaperProps) {
  return (
    <Paper
      p="xl"
      radius="lg"
      withBorder
      className="transition-all hover:shadow-xs"
      bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
      {...props}
    >
      <Stack gap="lg">
        {(title || Icon || rightSection) && (
          <Group justify="space-between" align="center">
            <Group gap="xs">
              {Icon && (
                <ThemeIcon
                  variant="light"
                  color={iconColor}
                  size="md"
                  radius="md"
                  className="shadow-sm"
                >
                  <Icon size={rem(18)} stroke={1.5} />
                </ThemeIcon>
              )}
              {title && (
                <Text fw={700} fz="sm" tt="uppercase" lts={1} c="slate.4">
                  {title}
                </Text>
              )}
            </Group>
            {rightSection}
          </Group>
        )}
        <Box>{children}</Box>
      </Stack>
    </Paper>
  );
}
