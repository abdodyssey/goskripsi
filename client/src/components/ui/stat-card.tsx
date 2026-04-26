"use client";

import {
  Text,
  Group,
  Stack,
  ThemeIcon,
  rem,
  MantineColor,
  Badge,
  Paper,
} from "@mantine/core";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: MantineColor;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "indigo",
  description,
  trend,
}: StatCardProps) {
  return (
    <Paper
      radius="md"
      p="lg"
      withBorder
      className="hover:border-indigo-500/30 transition-all group hover:bg-gray-50 dark:hover:bg-dark-8"
      styles={{
        root: {
          backgroundColor:
            "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))",
        },
      }}
    >
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Text
            c="dimmed"
            fz="10px"
            tt="uppercase"
            fw={800}
            lts={1}
            className="group-hover:text-indigo-500 transition-colors"
          >
            {title}
          </Text>
          <Text fw={800} fz={24} className="tracking-tight">
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
          {trend && (
            <Group gap={4} mt={4}>
              <Text size="xs" fw={700} c={trend.isPositive ? "teal" : "red"}>
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </Text>
              <Badge
                variant="white"
                color="indigo"
                radius="sm"
                size="xs"
                px={6}
                styles={{
                  root: { border: "1px solid var(--mantine-color-indigo-1)" },
                }}
              >
                {trend.label}
              </Badge>
            </Group>
          )}
        </Stack>
        <ThemeIcon
          size={44}
          radius="md"
          variant="light"
          color={color}
          className="group-hover:scale-105 transition-transform"
        >
          <Icon size={rem(22)} stroke={1.5} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
