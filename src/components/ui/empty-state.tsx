"use client";

import {
  Stack,
  Text,
  ThemeIcon,
  rem,
  MantineColor,
  Center,
  Button,
} from "@mantine/core";
import { IconDatabaseOff } from "@tabler/icons-react";
import React, { ReactNode } from "react";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  color?: MantineColor;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = IconDatabaseOff,
  title,
  description,
  color = "indigo",
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <Center py={80}>
      <Stack align="center" gap="lg" className="max-w-[400px] text-center">
        <ThemeIcon
          size={84}
          radius="100%"
          variant="light"
          color={color}
          className="shadow-sm"
        >
          <Icon size={rem(42)} stroke={1.5} />
        </ThemeIcon>

        <Stack gap={4}>
          <Text fw={900} fz="xl" className="tracking-tight">
            {title}
          </Text>
          {description && (
            <Text size="sm" c="dimmed" lh={1.6}>
              {description}
            </Text>
          )}
        </Stack>

        {children}

        {actionLabel && (
          <Button
            variant="filled"
            color={color}
            onClick={onAction}
            radius="md"
            size="md"
            className="shadow-md transition-all active:scale-95 px-8"
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Center>
  );
}
