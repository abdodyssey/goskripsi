import { useState } from "react";
import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  Text,
  UnstyledButton,
  rem,
  Tooltip,
  Stack,
} from "@mantine/core";
import { IconChevronRight, IconProps } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classes from "./NavbarLinksGroup.module.css";

interface LinksGroupProps {
  icon: React.FC<IconProps>;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string;
  active?: boolean;
  mini?: boolean;
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
  link,
  active,
  mini,
}: LinksGroupProps) {
  const pathname = usePathname();
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const items = (hasLinks ? links : [])
    .filter((item) => item && item.label)
    .map((item) => (
      <Text
        component={Link}
        className={classes.link}
        href={item.link}
        key={item.label}
        data-active={pathname === item.link || undefined}
      >
        {item.label}
      </Text>
    ));

  const isParentActive =
    active || (hasLinks && links.some((l) => l && pathname === l.link));

  const isActive =
    (!hasLinks && pathname === link) || (hasLinks && isParentActive && !opened);

  const content = (
    <UnstyledButton
      onClick={() => hasLinks && !mini && setOpened((o) => !o)}
      className={classes.control}
      data-active={isActive || undefined}
      data-mini={mini || undefined}
    >
      <Group justify={mini ? "center" : "space-between"} gap={0} w="100%">
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: mini ? "center" : "flex-start",
            width: mini ? "44px" : "auto",
            height: mini ? "44px" : "auto",
            borderRadius: mini ? "var(--mantine-radius-md)" : "0",
            backgroundColor:
              mini && isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
          }}
        >
          <ThemeIcon
            variant={
              (!hasLinks && pathname === link) || isParentActive
                ? "light"
                : "transparent"
            }
            color={
              (!hasLinks && pathname === link) || isParentActive
                ? "indigo"
                : "gray"
            }
            size={mini ? 24 : 30}
          >
            <Icon style={{ width: rem(18), height: rem(18) }} />
          </ThemeIcon>
          {!mini && <Box ml="md">{label}</Box>}
        </Box>
        {hasLinks && !mini && (
          <IconChevronRight
            className={classes.chevron}
            stroke={1.5}
            style={{
              width: rem(16),
              height: rem(16),
              transform: opened ? "rotate(-90deg)" : "none",
            }}
          />
        )}
      </Group>
    </UnstyledButton>
  );

  const buttonWithTooltip = mini ? (
    <Tooltip label={label} position="right" withArrow withinPortal>
      {content}
    </Tooltip>
  ) : (
    content
  );

  if (!hasLinks && link) {
    return (
      <Link href={link} style={{ textDecoration: "none" }}>
        {buttonWithTooltip}
      </Link>
    );
  }

  return (
    <>
      {buttonWithTooltip}
      {hasLinks && !mini ? (
        <Collapse in={opened}>
          <Stack gap={4} mt={4}>
            {items}
          </Stack>
        </Collapse>
      ) : null}
    </>
  );
}
