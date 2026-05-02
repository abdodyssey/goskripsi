"use client";

import {
  Breadcrumbs,
  Anchor,
  Text,
  Title,
  Stack,
  Group,
  Center,
  Box,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  items: BreadcrumbItem[];
  description?: string;
  icon?: React.ElementType;
  rightSection?: React.ReactNode;
}

export function PageHeader({
  title,
  items,
  description,
  icon: Icon,
  rightSection,
}: PageHeaderProps) {
  const breadcrumbItems = items.map((item, index) => {
    if (item.href) {
      return (
        <Anchor
          component={Link}
          href={item.href}
          key={index}
          size="sm"
          c="dimmed"
        >
          {item.label}
        </Anchor>
      );
    }
    return (
      <Text key={index} size="sm" className="text-gs-text-primary" fw={700}>
        {item.label}
      </Text>
    );
  });

  return (
    <Stack gap="xs" mb="xl">
      <Breadcrumbs separator={<IconChevronRight size={14} stroke={1.5} className="text-gs-text-muted" />}>
        {breadcrumbItems}
      </Breadcrumbs>

      <Group gap="xl" align="flex-end" justify="space-between" wrap="nowrap">
        <Group gap="md" align="center" style={{ flex: 1 }}>
          {Icon && (
            <Center
              w={48}
              h={48}
              bg="var(--gs-bg-overlay)"
              style={{ borderRadius: 12, border: "1px solid var(--gs-border)" }}
            >
              <Icon size={24} className="text-gs-primary" stroke={2} />
            </Center>
          )}
          <Stack gap={2}>
            <Title order={1} className="gs-page-title">
              {title}
            </Title>
            {description && (
              <Text c="dimmed" size="sm" fw={400} lh={1.2}>
                {description}
              </Text>
            )}
          </Stack>
        </Group>
        {rightSection && <Box>{rightSection}</Box>}
      </Group>
    </Stack>
  );
}
