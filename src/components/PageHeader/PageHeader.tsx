"use client";

import {
  Breadcrumbs,
  Anchor,
  Text,
  Title,
  Stack,
  Group,
  Center,
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
      <Text key={index} size="sm" c="indigo" fw={500}>
        {item.label}
      </Text>
    );
  });

  return (
    <Stack gap="xs" mb="xl">
      <Breadcrumbs separator={<IconChevronRight size={14} stroke={1.5} />}>
        {breadcrumbItems}
      </Breadcrumbs>

      <Group gap="md" align="center">
        {Icon && (
          <Center
            w={48}
            h={48}
            bg="light-dark(indigo.1, dark.6)"
            style={{ borderRadius: 12, border: "1px solid var(--mantine-color-indigo-light-hover)" }}
          >
            <Icon size={24} c="indigo" stroke={1.5} />
          </Center>
        )}
        <Stack gap={0} style={{ flex: 1 }}>
          <Title order={2} fw={700} style={{ letterSpacing: "-0.5px" }}>
            {title}
          </Title>
          {description && (
            <Text c="dimmed" size="xs" fw={500}>
              {description}
            </Text>
          )}
        </Stack>
        {rightSection && <Group>{rightSection}</Group>}
      </Group>
    </Stack>
  );
}
