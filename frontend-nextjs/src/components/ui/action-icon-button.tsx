"use client";

import {
  ActionIcon,
  ActionIconProps,
  Tooltip,
  rem,
  MantineColor,
} from "@mantine/core";
import React from "react";

interface ActionIconButtonProps extends ActionIconProps {
  icon: React.ElementType;
  tooltip: string;
  color?: MantineColor;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  iconSize?: number;
}

export function ActionIconButton({
  icon: Icon,
  tooltip,
  color = "indigo",
  onClick,
  iconSize = 18,
  ...props
}: ActionIconButtonProps) {
  return (
    <Tooltip label={tooltip} radius="md" withArrow>
      <ActionIcon
        variant="subtle"
        color={color}
        size="lg"
        radius="md"
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `var(--mantine-color-${color}-light)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        className="transition-all active:scale-95"
        {...props}
      >
        <Icon size={rem(iconSize)} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}
