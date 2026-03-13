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
            bg="var(--mantine-color-indigo-light)"
            style={{ borderRadius: "var(--mantine-radius-md)" }}
          >
            <Icon size={28} c="indigo" stroke={1.5} />
          </Center>
        )}
        <Stack gap={0} style={{ flex: 1 }}>
          <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
            {title}
          </Title>
          {description && (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          )}
        </Stack>
        {rightSection && <Group>{rightSection}</Group>}
      </Group>
    </Stack>
  );
}
