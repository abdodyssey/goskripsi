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
  color = "dark",
  description,
  trend,
}: StatCardProps) {
  return (
    <Paper
      radius="lg"
      p="xl"
      withBorder
      className="hover:border-gs-border-strong transition-all group hover:bg-gs-bg-hover"
      styles={{
        root: {
          backgroundColor: 'var(--gs-bg-raised)',
          borderColor: 'var(--gs-border)',
        },
      }}
    >
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Text
            c="dimmed"
            size="xs"
            tt="uppercase"
            fw={700}
            lts={1}
            className="group-hover:text-gs-text-primary transition-colors"
          >
            {title}
          </Text>
          <Text className="gs-stat" fw={400} size="xl" mt={4}>
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
          {trend && (
            <Group gap={4} mt={8}>
              <Text size="xs" fw={700} c={trend.isPositive ? "var(--gs-success-text)" : "var(--gs-danger-text)"}>
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </Text>
              <Badge
                variant="outline"
                color="var(--gs-border-strong)"
                radius="xs"
                size="xs"
                px={6}
                fw={600}
              >
                {trend.label}
              </Badge>
            </Group>
          )}
        </Stack>
        <ThemeIcon
          size={52}
          radius="lg"
          variant="light"
          color="var(--gs-primary)"
          className="bg-gs-bg-overlay group-hover:scale-105 transition-transform"
        >
          <Icon size={rem(26)} stroke={2} className="text-gs-primary" />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
